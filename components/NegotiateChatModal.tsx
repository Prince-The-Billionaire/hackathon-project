"use client";

import React, { useRef, useEffect, useState } from "react";
import { Send, Sparkles, X, FileText, Landmark, ShieldCheck, ArrowRight, Layers, RefreshCw } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface NegotiationChatModalProps {
  conversationId: string;
  merchant: {
    id: string;
    name: string;
    category?: string;
  };
  onClose: () => void;
}

export default function NegotiationChatModal({ conversationId, merchant, onClose }: NegotiationChatModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { getToken } = useAuth();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://zeon-backend.onrender.com";

  // Messages States
  const [messages, setMessages] = useState<any[]>([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [pollingActive, setPollingActive] = useState(true);

  // Manifest Document Generation Layout State Primitives
  const [showExportForm, setShowExportForm] = useState(false);
  const [manifestData, setManifestData] = useState<any | null>(null);
  const [escrowStatus, setEscrowStatus] = useState<"NONE" | "PENDING" | "LOCKED">("NONE");

  const [goodsName, setGoodsName] = useState("Industrial Component Line");
  const [goodsQty, setGoodsQty] = useState(500);
  const [goodsPrice, setGoodsPrice] = useState(12500);

  // Sync / Fetch Conversation Log From Backend
  const fetchChannelMessages = React.useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${backendUrl}/api/messaging/conversations/${conversationId}/messages`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload.status && payload.data && Array.isArray(payload.data.messages)) {
          // Sort messages ascending by time
          const sorted = payload.data.messages.sort(
            (a: any, b: any) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
          );
          setMessages(sorted);
        }
      }
    } catch (err) {
      console.warn("Failed syncing thread data stream nodes:", err);
    }
  }, [conversationId, backendUrl, getToken]);

  // Setup dynamic polling loop interval tracking parameters
  useEffect(() => {
    fetchChannelMessages();

    const intervalNode = setInterval(() => {
      if (pollingActive) fetchChannelMessages();
    }, 3000);

    return () => clearInterval(intervalNode);
  }, [fetchChannelMessages, pollingActive]);

  // Auto-scroll anchor container shifts
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // POST outbound data chunk
  const handleSendMessage = async (textToSend?: string) => {
    const rawBody = textToSend || typedMessage;
    if (!rawBody.trim()) return;

    try {
      const token = await getToken();
      const res = await fetch(`${backendUrl}/api/messaging/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ body: rawBody })
      });

      if (res.ok) {
        if (!textToSend) setTypedMessage("");
        fetchChannelMessages(); // Instantly update lookups on successful dispatch
      } else {
        throw new Error("Target cluster rejected payload transmission bundle.");
      }
    } catch (err: any) {
      alert(`Message Dropped: ${err.message}`);
    }
  };

  // Local document construction simulation block
  const handleLocalCreateManifest = (e: React.FormEvent) => {
    e.preventDefault();
    const computedTotal = goodsQty * goodsPrice;
    
    const constructedManifest = {
      itemName: goodsName,
      quantity: goodsQty,
      totalValue: computedTotal
    };

    setManifestData(constructedManifest);
    setEscrowStatus("PENDING");
    setShowExportForm(false);

    // Broadcast manifest dispatch notice into standard communication line records
    handleSendMessage(`[SYSTEM MANIFEST OUTBOUND] Item: ${goodsName} | Quantity: ${goodsQty} | Proposed Total Value: ₦${computedTotal.toLocaleString()}`);
  };

  const handleConfirmMockEscrow = () => {
    setEscrowStatus("LOCKED");
    handleSendMessage(`[SYSTEM NOTICE - ESCROW GATEWAY SECURED] Client allocation confirmed. Clearing node holds authorized capital. Production channels unlocked.`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 transition-all duration-300">
      <div className="bg-white rounded-3xl w-full max-w-[95vw] sm:max-w-4xl h-[calc(100vh-2rem)] sm:h-[700px] max-h-[92vh] flex flex-col lg:flex-row shadow-[0_24px_70px_-10px_rgba(15,23,42,0.15)] overflow-hidden border border-slate-100/80">
        
        {/* LEFT PANEL: Chat Window Workspace */}
        <div className="flex-1 flex flex-col min-w-0 lg:border-r border-slate-100/60 bg-slate-50/30">
          
          {/* Header UI Layout Block */}
          <div className="px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                {merchant.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 text-sm sm:text-base truncate">{merchant.name}</div>
                <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-medium mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Connected Node • Channel ID: {conversationId.slice(-6)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchChannelMessages}
                className="p-2 rounded-xl border border-slate-100 text-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors"
                title="Refresh logs manually"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={onClose} 
                className="p-2 rounded-xl border border-slate-100 text-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action Ribbon Panel Layout */}
          <div className="px-4 sm:px-5 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-100 pr-3 shrink-0">
              <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
              <span>LOGISTICS MOTOR</span>
            </div>

            <button
              onClick={() => setShowExportForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/15 text-amber-800 text-xs font-semibold rounded-lg transition-all whitespace-nowrap"
            >
              <FileText className="h-3.5 w-3.5 text-amber-600" />
              <span>Open Export Document Tool</span>
            </button>

            <button
              onClick={() => handleSendMessage("Please provide itemized custom clearance DDP tracking options for this sector route.")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100/50 hover:bg-indigo-100/80 text-indigo-700 text-xs font-semibold rounded-lg transition-all whitespace-nowrap"
            >
              Request Tariff Clearances
            </button>
          </div>

          {/* Messages Feed View Container */}
          <div ref={scrollContainerRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
            {messages.length === 0 ? (
              <p className="text-[11px] text-center text-slate-400 italic mt-8">Establishing sync lines... State logs are currently clear.</p>
            ) : (
              messages.map((msg) => {
                const isSystemMessage = msg.body.startsWith("[SYSTEM");
                if (isSystemMessage) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2 max-w-full">
                      <span className="text-[10px] text-center font-mono bg-slate-900/5 border border-slate-200/40 text-slate-600 px-3 py-1.5 rounded-xl tracking-normal max-w-xs sm:max-w-md block whitespace-normal break-words">
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
                    <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs break-words whitespace-normal
                      ${isMe 
                        ? "bg-slate-900 text-white rounded-tr-none font-medium" 
                        : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.body}</p>
                      <div className="text-[9px] text-right mt-1 font-medium text-slate-400">
                        {displayTime}
                      </div>
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
                placeholder={`Type message to ${merchant.name}...`}
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

        {/* RIGHT PANEL: Side Form Manifest Configuration Layer */}
        <div className="w-full lg:w-80 bg-white p-5 hidden lg:flex flex-col justify-between border-l border-slate-100/80">
          <div className="space-y-5">
            <div className="flex justify-between items-center gap-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                Workflow Engine
              </h4>
            </div>

            {/* Condition 1: Configuration Form View */}
            {showExportForm ? (
              <form onSubmit={handleLocalCreateManifest} className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100/50 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-800">Export Parameters</h5>
                  <button type="button" onClick={() => setShowExportForm(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="space-y-3 text-[11px] font-medium text-slate-700">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Commodity Title</label>
                    <input type="text" className="w-full bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none p-2.5 rounded-xl text-xs transition-all" value={goodsName} onChange={e => setGoodsName(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Quantity</label>
                      <input type="number" className="w-full bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none p-2.5 rounded-xl text-xs transition-all" value={goodsQty} onChange={e => setGoodsQty(parseInt(e.target.value) || 0)} required />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Unit Price (₦)</label>
                      <input type="number" className="w-full bg-white ring-1 ring-slate-200/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none p-2.5 rounded-xl text-xs transition-all" value={goodsPrice} onChange={e => setGoodsPrice(parseInt(e.target.value) || 0)} required />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-1">
                  Transmit Local Manifest
                  <ArrowRight className="w-3 h-3" />
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

            {/* Condition 2: Escrow Manifest Holds */}
            {escrowStatus !== "NONE" && manifestData && (
              <div className="p-4 rounded-2xl border bg-gradient-to-b from-indigo-50/40 to-indigo-50/10 border-indigo-100/60 shadow-xs space-y-3 animate-in fade-in duration-300">
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <div className="p-1 bg-indigo-500/10 text-indigo-600 rounded-md">
                    <Landmark className="w-3.5 h-3.5" />
                  </div> 
                  Escrow Vault Handler
                </h5>

                {escrowStatus === "PENDING" ? (
                  <>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Manifest initialized for <strong>{manifestData.itemName}</strong>. Release secure clearing funds hold.
                    </p>
                    <div className="p-2.5 bg-white rounded-xl text-xs font-mono font-bold text-slate-800 flex justify-between items-center ring-1 ring-indigo-100/50">
                      <span className="text-slate-400 font-sans text-[10px]">Value:</span>
                      <span className="text-indigo-600">₦{manifestData.totalValue.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={handleConfirmMockEscrow}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all uppercase"
                    >
                      Lock Capital to Escrow Node
                    </button>
                  </>
                ) : (
                  <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-emerald-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure Vault Hold Locked
                    </div>
                    <p className="text-[10px] font-normal leading-normal text-emerald-600/90">
                      ₦{manifestData.totalValue.toLocaleString()} held inside secure smart clearing structures. Shipments unlocked.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-[9px] text-center text-slate-400/80 font-medium tracking-widest uppercase">
            Zeon Logistics Protocol • Secured
          </p>
        </div>
      </div>
    </div>
  );
}