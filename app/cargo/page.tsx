"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Sidebar  from "../../components/Sidebar";
import { Package, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import CargoMiniCard from "../../components/CargoMiniCard";
import CargoFinancialLedger from "../../components/CargoFinancialLedger";
import NegotiationChatModal from "../../components/NegotiateChatModal";
import { Toaster } from "react-hot-toast";
import { createApiClient } from "../../utils/api"; 
import { useAuth } from "@clerk/nextjs";

export interface CargoGroup {
  id: string; // Aggregated Identifier mapped to store.id
  storeId: string;
  storeName: string;
  direction: "Import" | "Export";
  itemName: string;
  origin: string;
  destination: string;
  status: string;
  eta: string;
  currencyCode: string;
  quantity: number;
  allocationIds: string[];
  hasFinancials: boolean;
  financials: {
    itemCost: number;
    tariffAmount: number;
    customsFees: number;
    vatAmount: number;
    totalLandedCost: number;
  };
}

export default function CargoTrackingPage() {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [directionFilter, setDirectionFilter] = useState<"All" | "Import" | "Export">("All");

  // Chat Modal UI States
  const [activeChat, setActiveChat] = useState<{ conversationId: string; merchant: { id: string; name: string } } | null>(null);

  const { getToken } = useAuth();

  const fetchAllocations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      
      const api = await createApiClient(getToken);
      const resData = await api("api/cargo/allocation", { method: "GET" });
      
      const fetchedData = Array.isArray(resData) 
        ? resData 
        : (Array.isArray(resData.cargoAllocations) ? resData.cargoAllocations : (resData.data?.cargoAllocations || []));
      
      // Filter for actionable states matching criteria: DRAFT & AWAITING_PAYMENT
      const filteredActionable = fetchedData.filter((alloc: any) => {
        const status = (alloc.status || "").toUpperCase();
        return status === "DRAFT" || status === "AWAITING_PAYMENT";
      });

      setAllocations(filteredActionable);
    } catch (err: any) {
      console.error("Cargo tracking synchronizer failure:", err);
      setError(err.message || "Failed to index active cargo allocations from the cluster database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  // Structural dynamic matching of allocations sharing corresponding store keys
  const groupedCargoPool = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    
    allocations.forEach((alloc) => {
      const storeId = alloc.store?.id || "unknown-store";
      if (!groups[storeId]) groups[storeId] = [];
      groups[storeId].push(alloc);
    });

    return Object.keys(groups).map((storeId) => {
      const storeItems = groups[storeId];
      const primaryAlloc = storeItems[0];
      const storeName = primaryAlloc.store?.name || "Marketplace Source Store";
      const allocationIds = storeItems.map(a => a.id);

      let totalItemCount = 0;
      let draftBaseCost = 0;
      let aggregatedTariff = 0;
      let aggregatedCustoms = 0;
      let aggregatedVat = 0;
      let aggregatedTotalLanded = 0;
      let compoundStatus = "DRAFT";

      // Elevate parent status to payment processing flags if any subnode requests it
      if (storeItems.some(a => (a.status || "").toUpperCase() === "AWAITING_PAYMENT")) {
        compoundStatus = "AWAITING_PAYMENT";
      }

      storeItems.forEach((alloc) => {
        const items = alloc.items || [];
        totalItemCount += items.length;

        items.forEach((item: any) => {
          const price = Number(item.product?.priceAmountMinor || 0) / 100;
          const qty = Number(item.quantity || 0);
          draftBaseCost += (price * qty);
        });

        if (alloc.landedCostBreakdown) {
          aggregatedTariff += Number(alloc.landedCostBreakdown.tariffAmountMinor) / 100;
          aggregatedCustoms += Number(alloc.landedCostBreakdown.customsFeeMinor) / 100;
          aggregatedVat += Number(alloc.landedCostBreakdown.vatAmountMinor) / 100;
          aggregatedTotalLanded += Number(alloc.landedCostBreakdown.totalAmountMinor) / 100;
        }
      });

      const hasFinancials = storeItems.some(a => !!a.landedCostBreakdown);
      const primaryProduct = primaryAlloc.items?.[0]?.product?.name || "Marketplace Cargo Pool";
      const itemDisplayName = totalItemCount > 1 ? `${primaryProduct} (+${totalItemCount - 1} entries)` : primaryProduct;

      return {
        id: storeId,
        storeId,
        storeName,
        direction: "Import" as const,
        itemName: itemDisplayName,
        origin: storeName,
        destination: "Lagos Hub Node (NG)",
        status: compoundStatus,
        carrier: "Pending Port Assignment",
        eta: hasFinancials ? "Calculated" : "Awaiting Audit",
        currencyCode: primaryAlloc.currencyCode || "NGN",
        quantity: totalItemCount,
        allocationIds,
        hasFinancials,
        financials: {
          itemCost: draftBaseCost,
          tariffAmount: aggregatedTariff,
          customsFees: aggregatedCustoms,
          vatAmount: aggregatedVat,
          totalLandedCost: hasFinancials ? aggregatedTotalLanded : draftBaseCost
        }
      };
    });
  }, [allocations]);

  // Handle setting active choices cleanly across array mutations
  const selectedCargo = useMemo(() => {
    return groupedCargoPool.find((g) => g.id === selectedGroupId) || groupedCargoPool[0] || null;
  }, [groupedCargoPool, selectedGroupId]);

  const filteredCargo = useMemo(() => {
    return groupedCargoPool.filter((c) => directionFilter === "All" || c.direction === directionFilter);
  }, [groupedCargoPool, directionFilter]);

  const formatCurrency = (value: number, code: string = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">
      <Toaster position="top-right" />
      <div className="absolute top-6 left-6 z-30 p-1 md:top-8 md:left-8">
        <div className="relative h-9 w-9">
          <Image src="/zeon-logo.webp" alt="Logo" fill className="object-contain rounded-xl" />
        </div>
      </div>
      <Sidebar />
      <main className="flex-1 p-6 pt-24 md:p-10 md:pl-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60">
            <div>
              <span className="text-slate-400 font-bold tracking-wider text-[10px] uppercase flex items-center gap-1">
                <Package className="h-3 w-3" /> Consolidator Routing Hub
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">Cargo Consolidation</h1>
            </div>
            <button
              onClick={() => fetchAllocations(false)}
              disabled={loading}
              className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Pools</span>
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-white rounded-xl w-fit border border-slate-200 shadow-2xs">
            {(["All", "Import", "Export"] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setDirectionFilter(dir)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  directionFilter === dir ? "bg-slate-900 text-white shadow-2xs" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {dir === "All" ? "All Pools" : `${dir}s`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-2xs">
              <Loader2 className="h-6 w-6 animate-spin text-slate-900" />
              <p className="text-xs text-slate-400 font-medium tracking-wide">Grouping terminal manifests by store identifier indices...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 border border-red-200 rounded-2xl space-y-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="text-xs font-bold text-red-900">Sync Failure</h3>
              <p className="text-xs text-red-600/90 max-w-md">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-3">
                {filteredCargo.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs bg-white font-medium">
                    No active cargo batches found matching DRAFT or AWAITING_PAYMENT criteria.
                  </div>
                ) : (
                  filteredCargo.map((group) => (
                    <CargoMiniCard
                      key={group.id}
                      cargo={{
                        id: `STORE-POOL-${group.storeId.slice(0, 6).toUpperCase()}`,
                        direction: group.direction,
                        itemName: group.itemName,
                        origin: group.storeName,
                        destination: group.destination,
                        status: group.status,
                        eta: group.eta,
                        quantity: group.quantity
                      }}
                      allocationIds={group.allocationIds}
                      isSelected={selectedCargo?.id === group.id}
                      onClick={() => setSelectedGroupId(group.id)}
                      onRefreshNeeded={() => fetchAllocations(true)}
                    />
                  ))
                )}
              </div>
              
              <div className="lg:col-span-5">
                {selectedCargo && (
                  <CargoFinancialLedger
                    selectedCargo={selectedCargo}
                    costBreakdown={selectedCargo.financials}
                    formatNaira={(val) => formatCurrency(val, selectedCargo.currencyCode)}
                    onActionComplete={() => fetchAllocations(true)}
                    onOpenNegotiation={(convId, merchantMeta) => setActiveChat({ conversationId: convId, merchant: merchantMeta })}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {activeChat && (
        <NegotiationChatModal
          conversationId={activeChat.conversationId}
          merchant={activeChat.merchant}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}