"use client";

import React, { useRef, useEffect, useState } from "react";
import { Send, MailCheck, Sparkles, Clock3, X, FileText, Landmark, ShieldCheck, ArrowRight, Layers } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

interface NegotiationChatModalProps {
  merchant: {
    name: string;
    targetImports: string[];
  };
  messageText: string;
  onMessageTextChange: (val: string) => void;
  onSendMessage: (customText?: string) => void;
  onTriggerEmailRequest: () => void;
  onTriggerAutomation: (type: "followUp" | "quoteRequest") => void;
  onClose: () => void;
}

export default function NegotiationChatModal({
  merchant,
  messageText,
  onMessageTextChange,
  onSendMessage,
  onTriggerEmailRequest,
  onTriggerAutomation,
  onClose
}: NegotiationChatModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Connect directly to state mechanisms
  const { chatMessages, contractStatus, generateExportDoc, confirmEscrowPayment } = useCartStore();

  // Side interface display controls
  const [showExportForm, setShowExportForm] = useState(false);
  const [goodsName, setGoodsName] = useState(merchant.targetImports[0] || "");
  const [goodsQty, setGoodsQty] = useState(100);
  const [goodsPrice, setGoodsPrice] = useState(5000);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleCreateManifest = (e: React.FormEvent) => {
    e.preventDefault();
    generateExportDoc(goodsName, goodsQty, goodsPrice);
    setShowExportForm(false);
  };

  // Find document value inside chat log if generated
  const activeDoc = chatMessages.find(m => m.isDocument)?.documentData;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 transition-all duration-300">
      {/* Container widened slightly to fit split layout smoothly when workflow triggers */}
      <div className="bg-white rounded-3xl w-full max-w-[95vw] sm:max-w-4xl h-[calc(100vh-2rem)] sm:h-[700px] max-h-[92vh] flex flex-col lg:flex-row shadow-[0_24px_70px_-10px_rgba(15,23,42,0.15)] overflow-hidden border border-slate-100/80">
        
        {/* LEFT PANEL: Primary chat system feed */}
        <div className="flex-1 flex flex-col min-w-0 lg:border-r border-slate-100/60 bg-slate-50/30">
          
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/10 shrink-0">
                {merchant.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 text-sm sm:text-base truncate">{merchant.name}</div>
                <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-medium mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Live Hub • Instant Cargo Desk
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="lg:hidden p-2 rounded-xl border border-slate-100 text-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Macros Action Ribbon Bar */}
          <div className="px-4 sm:px-5 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-r border-slate-100 pr-3 shrink-0">
              <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
              <span>Macros</span>
            </div>

            {/* Open Export Activation trigger */}
            <button
              onClick={() => setShowExportForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/15 text-amber-800 text-xs font-semibold rounded-lg transition-all whitespace-nowrap"
            >
              <FileText className="h-3.5 w-3.5 text-amber-600" />
              Open Export Form
            </button>

            <button
              onClick={onTriggerEmailRequest}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100/50 hover:bg-indigo-100/80 text-indigo-700 text-xs font-semibold rounded-lg transition-all whitespace-nowrap"
            >
              <MailCheck className="h-3.5 w-3.5" />
              Request Email Account
            </button>

            <button
              onClick={() => onTriggerAutomation("followUp")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium rounded-lg transition-all whitespace-nowrap"
            >
              <Clock3 className="h-3.5 w-3.5 text-slate-500" />
              Send Follow-up
            </button>
          </div>

          {/* Messages Feed Log */}
          <div ref={scrollContainerRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
            {chatMessages.map((msg) => {
              if (msg.type === "system") {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-800 px-3 py-1 rounded-full tracking-wide">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              // Custom inline Waybill PDF preview layout cards
              if (msg.isDocument && msg.documentData) {
                return (
                  <div key={msg.id} className="bg-white rounded-2xl p-4 max-w-xs mr-auto shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-[11px] uppercase tracking-wider pb-2 border-b border-slate-50">
                      <div className="p-1 bg-amber-500/10 rounded-md">
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      Waybill Manifest Generated
                    </div>
                    <div className="space-y-1.5 text-[11px] text-slate-600 font-mono bg-slate-50 p-2.5 rounded-xl">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Item:</span> 
                        <span className="text-slate-800 font-medium truncate max-w-[140px]">{msg.documentData.itemName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Qty:</span> 
                        <span className="text-slate-800 font-medium">{msg.documentData.quantity} units</span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-200/60 mt-1 flex justify-between items-center text-xs font-bold text-slate-900">
                        <span>Total Value:</span>
                        <span className="text-indigo-600">₦{msg.documentData.totalValue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-amber-700 bg-amber-500/5 py-1.5 rounded-lg text-center font-medium">
                      Sent to importer digital registry
                    </div>
                  </div>
                );
              }

              const isSent = msg.type === "sent";
              return (
                <div key={msg.id} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
                  {!isSent && (
                    <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center font-bold text-[11px] text-indigo-700 mr-2 mt-0.5 shadow-sm uppercase shrink-0">
                      {merchant.name?.charAt(0)}
                    </div>
                  )}
                  <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs
                    ${isSent 
                      ? "bg-slate-900 text-white rounded-tr-none font-medium" 
                      : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <div className={`text-[9px] text-right mt-1 font-medium ${isSent ? "text-slate-400" : "text-slate-400"}`}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Text input controller row */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => onMessageTextChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && messageText.trim() && onSendMessage()}
                placeholder={`Propose routing deal for ${merchant.targetImports[0] || "cargo"}...`}
                className="flex-1 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl px-4 py-3 text-xs focus:outline-none placeholder-slate-400 bg-slate-50/50 transition-all"
              />
              <button
                onClick={() => onSendMessage()}
                disabled={!messageText.trim()}
                className="bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-400 w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all shadow-sm shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL SIDEBAR: Side form layout workflow engine */}
        <div className="w-full lg:w-80 bg-white p-5 hidden lg:flex flex-col justify-between border-l border-slate-100/80">
          <div className="space-y-5">
            <div className="flex justify-between items-center gap-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                Workflow Engine
              </h4>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Condition 1: Exporter Input View Form */}
            {showExportForm ? (
              <form onSubmit={handleCreateManifest} className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
                  Generate & Send Manifest
                  <ArrowRight className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 text-xs text-slate-600 space-y-3">
                <p className="font-normal leading-relaxed text-slate-500">Align on deal details inside the chat feed first, then spin up the waybill pipeline tools.</p>
                {contractStatus === "negotiating" && (
                  <button onClick={() => setShowExportForm(true)} className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-xs">
                    Initialize Export Form
                  </button>
                )}
              </div>
            )}

            {/* Condition 2: Importer Escrow Confirmation Security Gateway Box */}
            <div className={`p-4 rounded-2xl border transition-all duration-300 space-y-3 ${
              contractStatus === "negotiating" 
                ? "opacity-40 bg-slate-50/30 border-slate-100" 
                : "bg-gradient-to-b from-indigo-50/40 to-indigo-50/10 border-indigo-100/60 shadow-[0_12px_30px_-10px_rgba(79,70,229,0.08)]"
            }`}>
              <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <div className={`p-1 rounded-md ${contractStatus === "negotiating" ? "bg-slate-200 text-slate-500" : "bg-indigo-500/10 text-indigo-600"}`}>
                  <Landmark className="w-3.5 h-3.5" />
                </div> 
                Escrow Gateway
              </h5>

              {contractStatus === "manifest_sent" && activeDoc && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                    Manifest received from partner merchant. Verify routing parameters below to release escrow allocation.
                  </p>
                  <div className="p-3 bg-white rounded-xl text-xs font-mono font-bold text-slate-800 flex justify-between items-center ring-1 ring-indigo-100/50 shadow-2xs">
                    <span className="text-slate-400 text-[10px] font-sans font-medium uppercase tracking-wider">Required Vault Deposit:</span>
                    <span className="text-indigo-600 text-sm">₦{activeDoc.totalValue.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => confirmEscrowPayment(activeDoc.totalValue)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10 uppercase tracking-wide"
                  >
                    Approve Manifest & Pay to Escrow
                  </button>
                </div>
              )}

              {contractStatus === "escrow_locked" && (
                <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-emerald-800 space-y-1.5 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure Vault Hold Active
                  </div>
                  <p className="text-[11px] font-normal leading-normal text-emerald-600/90">
                    Funds verified and successfully held by clearing node contracts. Shipments unlocked.
                  </p>
                </div>
              )}

              {contractStatus === "negotiating" && (
                <p className="text-[11px] text-slate-400 italic font-normal pl-7">Awaiting outbound manifest routine...</p>
              )}
            </div>

          </div>

          <p className="text-[9px] text-center text-slate-400/80 font-medium tracking-widest uppercase">
            Zeon Logistics Protocol • Secured
          </p>
        </div>

      </div>
    </div>
  );
}