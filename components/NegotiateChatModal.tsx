"use client";

import React, { useRef, useEffect, useState } from "react";
import { Send, Sparkles, X, FileText, Landmark, ShieldCheck, ArrowRight, Layers, RefreshCw } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface NegotiationChatModalProps {
  conversationId: string; // Pass "new" or a blank string if starting a chat from scratch
  merchant: {
    id: string; // The storeId or merchant identifier
    name: string;
    category?: string;
  };
  productId?: string; // Optional context identifier passed from the listing page
  onClose: () => void;
  onConversationCreated?: (newId: string) => void; // Optional callback to lift state up
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
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://zeon-backend.onrender.com";

  // Active Context Tracker Tracking Parameters
  const [activeConversationId, setActiveConversationId] = useState<string>(initialConversationId);
  const [messages, setMessages] = useState<any[]>([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [pollingActive, setPollingActive] = useState(true);

  // Form State Layouts
  const [showExportForm, setShowExportForm] = useState(false);
  const [manifestData, setManifestData] = useState<any | null>(null);
  const [escrowStatus, setEscrowStatus] = useState<"NONE" | "PENDING" | "LOCKED">("NONE");

  const [goodsName, setGoodsName] = useState("Industrial Component Line");
  const [goodsQty, setGoodsQty] = useState(500);
  const [goodsPrice, setGoodsPrice] = useState(12500);

  const isNewThread = !activeConversationId || activeConversationId === "new";

  // Sync / Fetch Conversation Log From Backend
  const fetchChannelMessages = React.useCallback(async () => {
    if (isNewThread) return; // Do not poll if conversation node is not instantiated yet

    try {
      const token = await getToken();
      const res = await fetch(`${backendUrl}/api/messaging/conversations/${activeConversationId}/messages`, {
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
  }, [activeConversationId, isNewThread, backendUrl, getToken]);

  // Setup polling loops
  useEffect(() => {
    fetchChannelMessages();

    const intervalNode = setInterval(() => {
      if (pollingActive && !isNewThread) fetchChannelMessages();
    }, 3000);

    return () => clearInterval(intervalNode);
  }, [fetchChannelMessages, pollingActive, isNewThread]);

  // Auto-scroll handler
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
      let res;

      if (isNewThread) {
        // CASE A: Initializing a brand new store communication channel layout
        res = await fetch(`${backendUrl}/api/messaging/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            storeId: merchant.id, // Maps to required merchant payload property
            productId: productId || null, 
            subject: `Trade Terms Discussion: ${merchant.name}`,
            body: rawBody // Initial message body
          })
        });
      } else {
        // CASE B: Appending data frame packet chunk to an established ongoing thread
        res = await fetch(`${backendUrl}/api/messaging/conversations/${activeConversationId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            body: rawBody 
          })
        });
      }

      if (res.ok) {
        const payload = await res.json();
        if (!textToSend) setTypedMessage("");

        if (isNewThread && payload.data?.id) {
          // Captures newly created thread transaction context ID dynamically
          const allocatedId = payload.data.id;
          setActiveConversationId(allocatedId);
          if (onConversationCreated) onConversationCreated(allocatedId);
        } else {
          fetchChannelMessages();
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Target cluster rejected payload transmission bundle.");
      }
    } catch (err: any) {
      console.error("Message submission pipeline fault:", err);
      alert(`Message Dropped: ${err.message}`);
    }
  };

  const handleLocalCreateManifest = (e: React.FormEvent) => {
    e.preventDefault();
    const computedTotal = goodsQty * goodsPrice;
    
    setManifestData({
      itemName: goodsName,
      quantity: goodsQty,
      totalValue: computedTotal
    });
    setEscrowStatus("PENDING");
    setShowExportForm(false);

    handleSendMessage(`[SYSTEM MANIFEST OUTBOUND] Item: ${goodsName} | Quantity: ${goodsQty} | Proposed Total Value: ₦${computedTotal.toLocaleString()}`);
  };

  const handleConfirmMockEscrow = () => {
    setEscrowStatus("LOCKED");
    handleSendMessage(`[SYSTEM NOTICE - ESCROW GATEWAY SECURED] Client allocation confirmed. Clearing node holds authorized capital.`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 transition-all duration-300">
      <div className="bg-white rounded-3xl w-full max-w-[95vw] sm:max-w-4xl h-[calc(100vh-2rem)] sm:h-[700px] max-h-[92vh] flex flex-col lg:flex-row shadow-[0_24px_70px_-10px_rgba(15,23,42,0.15)] overflow-hidden border border-slate-100/80">
        
        {/* LEFT PANEL: Chat Feed Workspace */}
        <div className="flex-1 flex flex-col min-w-0 lg:border-r border-slate-100/60 bg-slate-50/30">
          
          <div className="px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                {merchant.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 text-sm sm:text-base truncate">{merchant.name}</div>
                <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-medium mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  {isNewThread ? "New Trade Line Initialization" : `Connected Node • Channel ID: ${activeConversationId.slice(-6)}`}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isNewThread && (
                <button 
                  onClick={fetchChannelMessages}
                  className="p-2 rounded-xl border border-slate-100 text-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors"
                  title="Refresh logs manually"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={onClose} className="p-2 rounded-xl border border-slate-100 text-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-5 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-100 pr-3 shrink-0">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              <span>LOGISTICS MOTOR</span>
            </div>
            <button
              onClick={() => setShowExportForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/15 text-amber-800 text-xs font-semibold rounded-lg transition-all whitespace-nowrap"
            >
              <FileText className="h-3.5 w-3.5 text-amber-600" />
              <span>Open Export Document Tool</span>
            </button>
          </div>

          {/* Messages Feed Container */}
          <div ref={scrollContainerRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
            {isNewThread ? (
              <div className="flex flex-col items-center justify-center text-center h-full max-w-sm mx-auto space-y-2">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100/40">
                  <Send className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Cold Connection Line</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  You are opening a negotiation channel with <strong>{merchant.name}</strong>. Sending your first message below registers the conversation on the tracking dashboard.
                </p>
              </div>
            ) : messages.length === 0 ? (
              <p className="text-[11px] text-center text-slate-400 italic mt-8">Establishing sync lines... State logs are currently clear.</p>
            ) : (
              messages.map((msg) => {
                const isSystemMessage = msg.body?.startsWith("[SYSTEM");
                if (isSystemMessage) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2 max-w-full">
                      <span className="text-[10px] text-center font-mono bg-slate-900/5 border border-slate-200/40 text-slate-600 px-3 py-1.5 rounded-xl max-w-xs sm:max-w-md block">
                        {msg.body}
                      </span>
                    </div>
                  );
                }

                const isMe = msg.senderType === "USER";
                const displayTime = msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && (
                      <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center font-bold text-[11px] text-indigo-700 mr-2 mt-0.5 shadow-sm uppercase shrink-0">
                        {merchant.name?.charAt(0)}
                      </div>
                    )}
                    <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs break-words
                      ${isMe ? "bg-slate-900 text-white rounded-tr-none font-medium" : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"}`}
                    >
                      <p className="whitespace-pre-wrap">{msg.body}</p>
                      <div className="text-[9px] text-right mt-1 font-medium text-slate-400">{displayTime}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Submissions Execution Controls Footer */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && typedMessage.trim() && handleSendMessage()}
                placeholder={isNewThread ? `Type initial terms to open channel...` : `Type message to ${merchant.name}...`}
                className="flex-1 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3 text-xs focus:outline-none placeholder-slate-400 bg-slate-50/50 transition-all"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!typedMessage.trim()}
                className="bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-400 w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all shadow-sm shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Side Workflow Workspace */}
        <div className="w-full lg:w-80 bg-white p-5 hidden lg:flex flex-col justify-between border-l border-slate-100/80">
          <div className="space-y-5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              Workflow Engine
            </h4>

            {showExportForm ? (
              <form onSubmit={handleLocalCreateManifest} className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-800">Export Parameters</h5>
                  <button type="button" onClick={() => setShowExportForm(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-3 text-[11px] font-medium text-slate-700">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Commodity Title</label>
                    <input type="text" className="w-full bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none p-2.5 rounded-xl text-xs" value={goodsName} onChange={e => setGoodsName(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Quantity</label>
                      <input type="number" className="w-full bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none p-2.5 rounded-xl text-xs" value={goodsQty} onChange={e => setGoodsQty(parseInt(e.target.value) || 0)} required />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Unit Price (₦)</label>
                      <input type="number" className="w-full bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none p-2.5 rounded-xl text-xs" value={goodsPrice} onChange={e => setGoodsPrice(parseInt(e.target.value) || 0)} required />
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1">
                  Transmit Local Manifest <ArrowRight className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 text-xs text-slate-600 space-y-3">
                <p className="font-normal leading-relaxed text-slate-500">Align on deal pricing details inside the chat feed framework first, then capture parameters using the waybill pipeline tools.</p>
                <button onClick={() => setShowExportForm(true)} className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-xs">
                  Configure Outbound Manifest
                </button>
              </div>
            )}

            {escrowStatus !== "NONE" && manifestData && (
              <div className="p-4 rounded-2xl border bg-gradient-to-b from-indigo-50/40 to-indigo-50/10 border-indigo-100/60 shadow-xs space-y-3">
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-indigo-600" /> Escrow Vault Handler
                </h5>
                {escrowStatus === "PENDING" ? (
                  <>
                    <div className="p-2.5 bg-white rounded-xl text-xs font-mono font-bold text-slate-800 flex justify-between items-center ring-1 ring-indigo-100/50">
                      <span className="text-slate-400 font-sans text-[10px]">Value:</span>
                      <span className="text-indigo-600">₦{manifestData.totalValue.toLocaleString()}</span>
                    </div>
                    <button onClick={handleConfirmMockEscrow} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl uppercase">
                      Lock Capital to Escrow Node
                    </button>
                  </>
                ) : (
                  <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-emerald-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure Vault Hold Locked
                    </div>
                    <p className="text-[10px] text-emerald-600/90">₦{manifestData.totalValue.toLocaleString()} held safely inside secure structures.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-[9px] text-center text-slate-400/80 font-medium tracking-widest uppercase">Zeon Logistics Protocol • Secured</p>
        </div>

      </div>
    </div>
  );
}