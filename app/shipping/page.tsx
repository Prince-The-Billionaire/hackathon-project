/**
 * ============================================================================
 * MAIN NEGOTIATIONS AND LOGISTICS HUB FRONTEND ASSEMBLY
 * * Features:
 * - Fluid UI grid layout with support for responsive breakdown elements
 * - Completely decouples active cruiser datasets to match refined system scopes
 * - Live state engine handling complex instant response text workflows
 * ============================================================================
 */

"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Sidebar from "../../components/Sidebar";
import { Search, ShieldCheck, Globe, Building2, Briefcase } from "lucide-react";
import { MOCK_GLOBAL_MERCHANTS } from "../../data/shippingData";
import MerchantCard from "../../components/MerchantCard";
import NegotiationChatModal from "../../components/NegotiateChatModal";

type IndustryFilter = "All" | "Electronics" | "Textiles" | "Heavy Machinery" | "Consumer Goods" | "Food Logistics";

interface ChatMessage {
  id: string | number;
  type: "sent" | "received" | "system";
  text: string;
  time: string;
}

export default function ShippingLogisticsPage() {
  const [merchantQuery, setMerchantQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryFilter>("All");
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const industryTabs: IndustryFilter[] = ["All", "Electronics", "Textiles", "Heavy Machinery", "Consumer Goods", "Food Logistics"];

  const processedMerchants = useMemo(() => {
    return MOCK_GLOBAL_MERCHANTS.map((m, idx) => {
      const assignedIndustries: IndustryFilter[] = ["Electronics", "Textiles", "Heavy Machinery", "Consumer Goods", "Food Logistics"];
      return {
        ...m,
        industry: assignedIndustries[idx % assignedIndustries.length]
      } as typeof m & { industry: IndustryFilter };
    });
  }, []);

  const filteredMerchants = useMemo(() => {
    return processedMerchants.filter((merchant) => {
      const matchText = `${merchant.name} ${merchant.targetImports.join(" ")} ${merchant.country}`.toLowerCase();
      const matchesSearch = matchText.includes(merchantQuery.toLowerCase());
      const matchesIndustry = selectedIndustry === "All" || merchant.industry === selectedIndustry;
      return matchesSearch && matchesIndustry;
    });
  }, [processedMerchants, merchantQuery, selectedIndustry]);

  const openNegotiateModal = (merchant: any) => {
    setSelectedMerchant(merchant);
    setMessage("");
    setChatMessages([
      {
        id: 1,
        type: "received",
        text: `Greetings from the trade desk at ${merchant.name}. `,
        time: "10:32 AM"
      }
    ]);
  };

  const handleSend = (customText?: string) => {
    const activeText = customText || message;
    if (!activeText.trim()) return;

    const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: Date.now(),
      type: "sent",
      text: activeText,
      time: timeString
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customText) setMessage("");

    setTimeout(() => {
      const answers = [
        "That aligns perfectly with our standard handling procedures. Let us execute a formal digital DDP manifest review via our local export desk agents.",
        "Understood. Our supply chain units require roughly 15 minutes to aggregate custom freight variables across that industrial lane.",
        "We can lock those specific freight terms. Let us transmit the full breakdown to your corporate logistics point-of-contact."
      ];

      const systemReply: ChatMessage = {
        id: Date.now() + 1,
        type: "received",
        text: answers[Math.floor(Math.random() * answers.length)],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setChatMessages((prev) => [...prev, systemReply]);
    }, 1100);
  };

  const handleRequestEmail = () => {
    const systemNotification: ChatMessage = {
      id: "sys-" + Date.now(),
      type: "system",
      text: "🔒 Systematic Link Requested: Transmitting secure enterprise profile forms...",
      time: ""
    };
    setChatMessages((prev) => [...prev, systemNotification]);

    setTimeout(() => {
      const formalEmailRequest: ChatMessage = {
        id: Date.now() + 2,
        type: "received",
        text: `To complete our off-platform enterprise validation, please forward your standard delivery documentation directly to trade-desk@${selectedMerchant?.name.toLowerCase().replace(/[^a-z]/g, "") || "merchant"}.com.\n\nOur trade desk specialists will verify and respond with signed digital clearances.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages((prev) => [...prev, formalEmailRequest]);
    }, 900);
  };

  const handleTriggerAutomation = (type: "followUp" | "quoteRequest") => {
    if (type === "followUp") {
      handleSend("Hi there, just wanted to follow up on our discussion regarding cargo capacity and required customs clearance protocols. Looking forward to your updates.");
    } else if (type === "quoteRequest") {
      handleSend(`We are interested in formalizing pricing structures. Please furnish an itemized DDP commercial quote representing our requested lines: ${selectedMerchant?.targetImports.join(", ")}.`);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col md:flex-row">
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-white/80 rounded-xl backdrop-blur-md border border-slate-200/60 p-1.5 shadow-sm md:top-5 md:left-6">
        <div className="relative h-10 w-10">
          <Image src="/zeon-logo.jpg" alt="Zeon Systems Logo" fill priority className="object-contain rounded-lg" />
        </div>
      </div>

      <Sidebar />

      <main className="flex-1 w-full p-4 pt-20 md:p-8 md:pl-28 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Main Title Banner Section */}
          <div className=" pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Negotiate deals with various merchants worldwide
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Connect directly with commercial corporate buyers, negotiate global supply lines, and manage end-to-end freight distributions.
              </p>
            </div>
            
          </div>

          {/* Interactive Filtering Navigation Bar Component Layout */}
          <div className="flex flex-col gap-4 bg-slate-100 p-4 rounded-2xl border border-slate-200/80 lg:flex-row lg:items-center justify-between shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search global merchants by name, country, or cargo keywords..."
                value={merchantQuery}
                onChange={(e) => setMerchantQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none max-w-full">
              {industryTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedIndustry(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    selectedIndustry === tab
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          

          {/* Dynamic Merchant Catalog System Matrix Display */}
          {filteredMerchants.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 bg-white rounded-2xl text-slate-400 font-medium text-xs sm:text-sm shadow-sm">
              No merchants found matching the current filtration parameters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredMerchants.map((merchant) => (
                <MerchantCard
                  key={merchant.id}
                  merchant={merchant}
                  onNegotiate={() => openNegotiateModal(merchant)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Global Context-Aware Chat Interface Drawer Overlay Canvas Component */}
      {selectedMerchant && (
        <NegotiationChatModal
          merchant={selectedMerchant}
          // chatMessages={chatMessages}
          messageText={message}
          onMessageTextChange={setMessage}
          onSendMessage={handleSend}
          onTriggerEmailRequest={handleRequestEmail}
          onTriggerAutomation={handleTriggerAutomation}
          onClose={() => setSelectedMerchant(null)}
        />
      )}
    </div>
  );
}