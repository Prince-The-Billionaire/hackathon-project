"use client";

import React, { useRef, useEffect, useState } from "react";
import { Send, X, RefreshCw, MessageSquare } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";

interface NegotiationChatModalProps {
  conversationId: string;
  merchant: {
    id: string; // The storeId passed from the item card
    name: string;
    category?: string;
  };
  productId?: string; 
  onClose: () => void;
  onConversationCreated?: (newId: string) => void; 
}

export default function NegotiationChatModal({ 
  conversationId: initialConversationId, 
  merchant, 
  productId,
  onClose,
  onConversationCreated 
}: NegotiationChatModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();
  const { user } = useUser();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://zeon-backend.onrender.com";

  const [activeConversationId, setActiveConversationId] = useState<string>(initialConversationId);
  const [messages, setMessages] = useState<any[]>([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [pollingActive] = useState(true);

  const isNewThread = !activeConversationId || activeConversationId === "" || activeConversationId === "new";

  // Sync / Fetch Conversation Log From Backend
  const fetchChannelMessages = React.useCallback(async (targetId?: string) => {
    const idToFetch = targetId || activeConversationId;
    if (!idToFetch || idToFetch === "" || idToFetch === "new") return; 

    try {
      const token = await getToken();
      const cleanUrl = backendUrl.endsWith("/") ? backendUrl : `${backendUrl}/`;
      const res = await fetch(`${cleanUrl}api/messaging/conversations/${idToFetch}/messages`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload.status && payload.data && Array.isArray(payload.data.messages)) {
          const sorted = payload.data.messages.sort(
            (a: any, b: any) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
          );
          setMessages(sorted);
        }
      }
    } catch (err) {
      console.warn("Failed syncing thread data stream nodes:", err);
    }
  }, [activeConversationId, backendUrl, getToken]);

  // Handle Polling Intervals
  useEffect(() => {
    if (!isNewThread) {
      fetchChannelMessages();
    }
    
    const intervalNode = setInterval(() => {
      if (pollingActive && !isNewThread) {
        fetchChannelMessages();
      }
    }, 3000);

    return () => clearInterval(intervalNode);
  }, [fetchChannelMessages, pollingActive, isNewThread]);

  // Auto Scroll Feed
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Unified Outbound Data Routing Controller
  const handleSendMessage = async (textToSend?: string) => {
    const rawBody = textToSend || typedMessage;
    if (!rawBody.trim()) return;

    try {
      const token = await getToken();
      const cleanUrl = backendUrl.endsWith("/") ? backendUrl : `${backendUrl}/`;
      let targetUrl = "";
      let payloadBody: Record<string, any> = {};

      if (isNewThread) {
        targetUrl = `${cleanUrl}api/messaging/conversations`;
        payloadBody = {
          storeId: merchant.id, 
          subject: String(`Trade Terms Discussion: ${merchant.name || "Store"}`),
          body: String(rawBody)
        };
        if (productId) {
          payloadBody.productId = productId;
        }
      } else {
        targetUrl = `${cleanUrl}api/messaging/conversations/${activeConversationId}/messages`;
        payloadBody = {
          body: String(rawBody)
        };
      }

      const res = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payloadBody)
      });

      if (res.ok) {
        const payload = await res.json();
        if (!textToSend) setTypedMessage("");

        if (isNewThread && payload.data?.id) {
          const allocatedId = payload.data.id;
          
          setActiveConversationId(allocatedId);
          if (onConversationCreated) onConversationCreated(allocatedId);
          
          await fetchChannelMessages(allocatedId);
        } else {
          await fetchChannelMessages();
        }
      } else {
        const errorContent = await res.json().catch(() => null);
        const serverErrorMessage = errorContent 
          ? `Server Response: ${JSON.stringify(errorContent)}` 
          : `HTTP Error Status: ${res.status}`;
        
        throw new Error(serverErrorMessage);
      }
    } catch (err: any) {
      console.error("Error sending message:", err);
      alert(`Message could not be delivered.\n\n${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 transition-all duration-300">
      <div className="bg-white rounded-3xl w-full max-w-2xl h-[calc(100vh-2rem)] sm:h-[650px] max-h-[92vh] flex flex-col shadow-[0_24px_70px_-10px_rgba(15,23,42,0.15)] overflow-hidden border border-slate-100/80">
        
        {/* Header Block */}
        <div className="px-6 py-4 border-b border-slate-100 bg-white backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
              {merchant.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 text-sm sm:text-base truncate">{merchant.name}</div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-medium mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {isNewThread ? "New conversation line" : "Connected"}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isNewThread && (
              <button 
                onClick={() => fetchChannelMessages()}
                className="p-2 rounded-xl border border-slate-100 text-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors"
                title="Refresh messages"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-xl border border-slate-100 text-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages Feed View */}
        <div ref={scrollContainerRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/60">
          {isNewThread ? (
            <div className="flex flex-col items-center justify-center text-center h-full max-w-sm mx-auto space-y-3">
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800">Start a Conversation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Send your first message to open a chat channel with <strong>{merchant.name}</strong>. This conversation will be stored on your tracking dashboard.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-xs text-center text-slate-400 italic mt-8">Loading history logs...</p>
          ) : (
            messages.map((msg) => {
              const isSystemMessage = msg.body?.startsWith("[SYSTEM");
              if (isSystemMessage) {
                return (
                  <div key={msg.id} className="flex justify-center my-2 max-w-full">
                    <span className="text-[11px] text-center font-mono bg-slate-200/50 border border-slate-200/40 text-slate-600 px-3 py-1 rounded-lg max-w-xs sm:max-w-md block">
                      {msg.body}
                    </span>
                  </div>
                );
              }

              const isMe = msg.senderType === "USER";
              const displayTime = msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
              
              const merchantImageUrl = msg.senderUser?.profileImageUrl;
              const userImageUrl = user?.imageUrl;

              return (
                <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}>
                  
                  {/* Merchant Avatar (Left Side Only) */}
                  {!isMe && (
                    <div className="w-8 h-8 bg-indigo-100 rounded-full overflow-hidden flex items-center justify-center font-semibold text-xs text-indigo-700 shadow-xs uppercase shrink-0">
                      {merchantImageUrl ? (
                        <img src={merchantImageUrl} alt={merchant.name} className="w-full h-full object-cover" />
                      ) : (
                        merchant.name?.charAt(0)
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs break-words
                    ${isMe 
                      ? "bg-slate-900 text-white rounded-tr-none font-medium" 
                      : "bg-white border border-slate-200/60 text-slate-800 rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.body}</p>
                    <div className={`text-[9px] mt-1 font-medium text-right ${isMe ? "text-slate-300" : "text-slate-400"}`}>
                      {displayTime}
                    </div>
                  </div>

                  {/* User Avatar (Right Side Only) */}
                  {isMe && (
                    <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden flex items-center justify-center font-semibold text-xs text-slate-700 shadow-xs uppercase shrink-0">
                      {userImageUrl ? (
                        <img src={userImageUrl} alt="My Profile" className="w-full h-full object-cover" />
                      ) : (
                        user?.firstName?.charAt(0) || "U"
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Input Footer Controls */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && typedMessage.trim() && handleSendMessage()}
              placeholder={isNewThread ? "Type your initial terms here..." : `Message ${merchant.name}...`}
              className="flex-1 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900 rounded-xl px-4 py-3 text-xs focus:outline-none placeholder-slate-400 bg-slate-50/50 transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!typedMessage.trim()}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all shadow-sm shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}