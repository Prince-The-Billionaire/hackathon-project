"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import { 
  Ship, 
  Search, 
  MessageSquare, 
  Anchor, 
  ShieldCheck, 
  ShieldAlert, 
  Gauge, 
  Hourglass, 
  HelpCircle, 
  CheckCircle2, 
  ExternalLink,
  Send
} from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";
import { SEVEN_CARGO_VESSELS, MOCK_GLOBAL_MERCHANTS } from "@/data/shippingData";

function MerchantFlag({ countryCode }: { countryCode: string }) {
  const FlagComponent = Flags[countryCode.toUpperCase() as keyof typeof Flags];
  if (!FlagComponent) return <span className="text-xs">{countryCode}</span>;
  return <FlagComponent className="w-4 h-3 object-cover rounded-[1px] shadow-sm inline-block" />;
}

export default function ShippingLogisticsPage() {
  const [merchantQuery, setMerchantQuery] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const filteredMerchants = useMemo(() => {
    return MOCK_GLOBAL_MERCHANTS.filter((merchant) => {
      const matchText = merchant.name.toLowerCase() + merchant.targetImports.join(" ").toLowerCase() + merchant.country.toLowerCase();
      return matchText.includes(merchantQuery.toLowerCase());
    });
  }, [merchantQuery]);

  const openNegotiateModal = (merchant: any) => {
    setSelectedMerchant(merchant);
    setMessage("");
    setChatMessages([
      {
        id: 1,
        type: "received",
        text: `Hello! We're interested in your shipping services for ${merchant.targetImports[0] || 'goods'}.`,
        time: "10:32"
      },
      {
        id: 2,
        type: "sent",
        text: "Hi, happy to help! What volume and route are you looking at?",
        time: "10:34"
      }
    ]);
  };

  const closeModal = () => {
    setSelectedMerchant(null);
    setMessage("");
    setChatMessages([]);
  };

  const handleSend = () => {
    if (!message.trim()) return;

    const newMsg = {
      id: Date.now(),
      type: "sent",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setMessage("");

    // Simulate reply after 1 second
    setTimeout(() => {
      const replies = [
        "Thanks for your message. I'll check our current rates and get back to you shortly.",
        "Perfect. We can offer competitive rates for that route.",
        "Noted. Our team will prepare a detailed quote for you."
      ];
      
      const replyMsg = {
        id: Date.now() + 1,
        type: "received",
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, replyMsg]);
    }, 1200);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 antialiased flex flex-col md:flex-row">
      
      {/* BRANDING */}
      <div className="absolute top-4 left-4 z-30 flex flex-col items-center gap-2 bg-white/75 rounded-full backdrop-blur-md border border-slate-200/50 p-1 shadow-sm md:top-5 md:left-6">
        <div className="relative h-16 w-16 rounded-full object-contain">
          <Image src="/zeon-logo.jpg" alt="Zeon Systems Logo" fill sizes="36px" priority className="object-contain rounded-full" />
        </div>
      </div>

      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="w-full h-full pt-20 pb-24 px-4 md:pl-28 md:pt-6 md:pb-6 md:pr-6 relative z-10 flex-1 overflow-y-auto scrollbar-thin">
        <div className="w-full h-auto space-y-6">
          
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              Cruisers We Work With
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              Reliable freight partners with verified capacity and active routes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN - Compact Cruisers */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Ship className="h-3.5 w-3.5 text-blue-500" />
                  Active Cruisers ({SEVEN_CARGO_VESSELS.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SEVEN_CARGO_VESSELS.map((vessel) => (
                  <div
                    key={vessel.id}
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-40 flex-shrink-0 rounded-2xl overflow-hidden border border-slate-100">
                        <img
                          src={vessel.imageUrl}
                          alt={vessel.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-lg tracking-tight text-slate-900">{vessel.company}</span>
                            <p className="text-slate-600 text-sm mt-0.5">{vessel.name}</p>
                          </div>

                          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-2xl text-xs font-semibold">
                            <span className={`h-2.5 w-2.5 rounded-full ${vessel.isActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                            {vessel.isActive ? "ACTIVE" : "DRY DOCK"}
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Ship className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <span className="text-xs text-slate-400 block">Capacity</span>
                              <span className="font-semibold text-slate-700">{vessel.capacityTEU.toLocaleString()} TEU</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Gauge className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <span className="text-xs text-slate-400 block">Speed</span>
                              <span className="font-semibold text-slate-700">{vessel.avgSpeedKnots} knots</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                              <Hourglass className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                              <span className="text-xs text-slate-400 block">Age</span>
                              <span className="font-semibold text-slate-700">{vessel.ageYears} years</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                              {vessel.hasInsurance ? (
                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <ShieldAlert className="h-4 w-4 text-amber-600" />
                              )}
                            </div>
                            <div>
                              <span className="text-xs text-slate-400 block">Insurance</span>
                              <span className={`font-semibold ${vessel.hasInsurance ? "text-emerald-600" : "text-amber-600"}`}>
                                {vessel.hasInsurance ? "Covered" : "Pending"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN - Export Desk */}
            <div className="lg:col-span-4 lg:sticky lg:top-6 self-start">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-bold text-sm tracking-wider uppercase text-slate-500">Export Desk</h3>
                </div>
                <p className="text-sm text-slate-600">Communicate directly with verified merchants</p>

                <div className="relative mt-5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search merchants..."
                    value={merchantQuery}
                    onChange={(e) => setMerchantQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="mt-5 space-y-3 max-h-[520px] overflow-y-auto pr-2 scrollbar-thin">
                  {filteredMerchants.map((merchant) => (
                    <div
                      key={merchant.id}
                      className="border border-slate-100 hover:border-slate-300 rounded-xl p-4 transition-all bg-slate-50/70"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800">{merchant.name}</h4>
                          <p className="text-xs text-slate-500">Rep: {merchant.contactPerson}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <MerchantFlag countryCode={merchant.flagCode} />
                          <span className="text-xs font-medium text-slate-500">{merchant.flagCode}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400">Wants to import:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {merchant.targetImports.map((item, i) => (
                            <span key={i} className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200">{item}</span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => openNegotiateModal(merchant)}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:brightness-105 transition"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Negotiate Deal
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODERN CHAT MODAL */}
      {selectedMerchant && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-[440px] h-[640px] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Chat Header */}
            <div className="px-5 py-4 border-b bg-slate-50 flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-inner">
                {selectedMerchant.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-lg leading-tight">{selectedMerchant.name}</div>
                <div className="flex items-center gap-1.5 text-emerald-600 text-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Online • Export Manager
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                ✕
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#f8fafc]">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                  {msg.type === 'received' && (
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0 mr-2 mt-1" />
                  )}
                  <div className={`max-w-[78%] px-4 py-3 rounded-3xl text-[15px] leading-relaxed
                    ${msg.type === 'sent' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 rounded-tl-none'
                    }`}>
                    {msg.text}
                    <div className={`text-[10px] mt-1.5 ${msg.type === 'sent' ? 'text-blue-200' : 'text-slate-400'}`}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 border border-slate-200 focus:border-blue-500 rounded-2xl px-5 py-3.5 text-sm focus:outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 w-12 h-12 rounded-2xl flex items-center justify-center text-white transition"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-2">Messages are end-to-end encrypted</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}