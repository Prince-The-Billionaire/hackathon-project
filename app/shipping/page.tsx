/**
 * ============================================================================
 * MAIN NEGOTIATIONS AND LOGISTICS HUB FRONTEND ASSEMBLY (CONNECTED BACKEND)
 * ============================================================================
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Sidebar from "../../components/Sidebar";
import { Search, AlertCircle, RefreshCw } from "lucide-react";
import MerchantCard from "../../components/MerchantCard";
import NegotiationChatModal from "../../components/NegotiateChatModal";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/utils/api";

type IndustryFilter = "All" | "ELECTRONICS" | "MACHINERY" | "FOOD_AND_AG" | "LOGISTICS" | "APPAREL";

// Structured to match the Common Response Shape in API_REFERENCE (2).md
interface ApiResponseEnvelope<T> {
  message: string;
  status: boolean;
  data: T;
}

export default function ShippingLogisticsPage() {
  const [merchantQuery, setMerchantQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryFilter>("All");
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  // Data State Arrays
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [negotiateLoading, setNegotiateLoading] = useState<string | null>(null);

  const { getToken } = useAuth();

  const industryTabs: { label: string; value: IndustryFilter }[] = [
    { label: "All", value: "All" },
    { label: "Electronics", value: "ELECTRONICS" },
    { label: "Machinery", value: "MACHINERY" },
    { label: "Food & Ag", value: "FOOD_AND_AG" },
    { label: "Logistics", value: "LOGISTICS" },
    { label: "Apparel", value: "APPAREL" }
  ];

  // Core retrieval function utilizing your custom global API utility client instance
  const fetchMerchants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Instantiates the authenticated baseline fetch client
      const api = await createApiClient(getToken);
      
      // Hits /api/marketplace/stores cleanly using relative paths
      const payload = await api<ApiResponseEnvelope<{ stores: any[] }>>("api/marketplace/stores");

      // Validates response matches backend schema payload structure
      if (payload && payload.status && Array.isArray(payload.data?.stores)) {
        setMerchants(payload.data.stores);
      } else {
        throw new Error("Invalid schema payload shape from marketplace repository.");
      }
    } catch (err: any) {
      console.error("Merchant pull error:", err);
      setError(err.message || "Failed to resolve production global merchant catalog.");
    } finally {
      setLoading(false);
    }
  };

  // Mount effects hook
  useEffect(() => {
    fetchMerchants();
  }, [getToken]);

  // Client-side search layout filtration engine mapping
  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      const matchText = `${m.name} ${m.description || ""} ${m.category || ""}`.toLowerCase();
      const matchesSearch = matchText.includes(merchantQuery.toLowerCase());
      const matchesIndustry = selectedIndustry === "All" || m.category === selectedIndustry;
      return matchesSearch && matchesIndustry;
    });
  }, [merchants, merchantQuery, selectedIndustry]);

  // Securely logs into or triggers dynamic messaging system tunnels 
  const handleOpenNegotiation = async (merchant: any) => {
    try {
      setNegotiateLoading(merchant.id);
      
      const api = await createApiClient(getToken);

      // Step 1: Query database to check if thread has been established previously[cite: 2]
      const payload = await api<ApiResponseEnvelope<{ conversations: any[] }>>("api/messaging/conversations", {
        method: "GET"
      });

      let targetConversationId: string | null = null;

      if (payload.status && Array.isArray(payload.data?.conversations)) {
        const existing = payload.data.conversations.find(
          (c: any) => c.storeId === merchant.id && c.status === "OPEN"
        );
        if (existing) targetConversationId = existing.id;
      }

      // Step 2: Initialize a brand new negotiation channel if none exists[cite: 2]
      if (!targetConversationId) {
        const initPayload = await api<ApiResponseEnvelope<any>>("api/messaging/conversations", {
          method: "POST",
          body: JSON.stringify({
            storeId: merchant.id,
            subject: `Trade Negotiation: ${merchant.name}`,
            body: `Greetings from our procurement desk. We would like to initiate trade talks regarding your available listings.`
          })
        });

        // Backend returns either direct id or wrapped conversationId[cite: 2]
        targetConversationId = initPayload.data?.id || initPayload.data?.conversationId || null;
      }

      if (!targetConversationId) throw new Error("Failed to resolve dynamic workspace session hash.");

      setActiveConversationId(targetConversationId);
      setSelectedMerchant(merchant);

    } catch (err: any) {
      console.error("Negotiation channel registration failed:", err);
      alert(`Negotiation Routing Interrupted: ${err.message || "Unknown gateway operational exception."}`);
    } finally {
      setNegotiateLoading(null);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col md:flex-row">
      {/* Brand Header Float Elements */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-white/80 rounded-xl backdrop-blur-md border border-slate-200/60 p-1.5 shadow-sm md:top-5 md:left-6">
        <div className="relative h-10 w-10">
          <Image src="/zeon-logo.webp" alt="Zeon Systems Logo" fill priority className="object-contain rounded-lg" />
        </div>
      </div>

      <Sidebar />

      <main className="flex-1 w-full p-4 pt-20 md:p-8 md:pl-28 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Negotiate deals with various merchants worldwide
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Connect directly with verified production stores, lock clearing tariffs, and pass documents securely down live escrow validation chains.
              </p>
            </div>
            
            {/* Quick manual reload fallback control button */}
            <button 
              onClick={fetchMerchants} 
              disabled={loading}
              className="self-start sm:self-center flex items-center gap-2 px-3 py-2 text-xs font-semibold font-mono text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              RELOAD DATA
            </button>
          </div>

          {/* Filtration Controller Ribbon */}
          <div className="flex flex-col gap-4 bg-slate-100 p-4 rounded-2xl border border-slate-200/80 lg:flex-row lg:items-center justify-between shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search active manufacturing merchants by corporate profile indices..."
                value={merchantQuery}
                onChange={(e) => setMerchantQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none max-w-full">
              {industryTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedIndustry(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    selectedIndustry === tab.value
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary View Logic */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
              <p className="text-xs font-mono tracking-wider text-slate-400">PULLING ENTERPRISE TELEMETRY...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 bg-white border rounded-2xl border-red-100 max-w-md mx-auto text-center space-y-3 shadow-sm">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <p className="text-xs font-semibold text-red-600 font-mono">{error}</p>
              <button 
                onClick={fetchMerchants}
                className="px-4 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-all"
              >
                Retry Request
              </button>
            </div>
          ) : filteredMerchants.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 bg-white rounded-2xl text-slate-400 font-medium text-xs sm:text-sm shadow-sm">
              No global merchant channels active under this filter category index.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredMerchants.map((merchant) => (
                <MerchantCard
                  key={merchant.id}
                  merchant={{
                    id: merchant.id,
                    name: merchant.name,
                    contactPerson: merchant.contactEmail || "Trade Representative Desk",
                    // Map to 2-letter country code matching backend models
                    flagCode: merchant.countryCode || "HQ", 
                    country: merchant.country || merchant.city || "Global",
                    // Use custom fallback if tags don't exist yet
                    targetImports: merchant.tags || [merchant.category || "General Cargo"], 
                    industry: merchant.category
                  }}
                  isInitializing={negotiateLoading === merchant.id}
                  onNegotiate={() => handleOpenNegotiation(merchant)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Production Live Web Message Canvas Overlay */}
      {selectedMerchant && activeConversationId && (
        <NegotiationChatModal
          conversationId={activeConversationId}
          merchant={selectedMerchant}
          onClose={() => {
            setSelectedMerchant(null);
            setActiveConversationId(null);
          }}
        />
      )}
    </div>
  );
}