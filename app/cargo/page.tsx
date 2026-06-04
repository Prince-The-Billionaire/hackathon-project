"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Sidebar from "../../components/Sidebar";
import { Package, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import CargoMiniCard from "../../components/CargoMiniCard";
import CargoFinancialLedger from "../../components/CargoFinancialLedger";
import CargoAlertsDrawer from "../../components/CargoAlertsDrawer";
import { Toaster } from "react-hot-toast";
import { createApiClient } from "../../utils/api"; 
import { useAuth } from "@clerk/nextjs";

export default function CargoTrackingPage() {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCargoId, setSelectedCargoId] = useState<string | null>(null);
  const [directionFilter, setDirectionFilter] = useState<"All" | "Import" | "Export">("All");

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
        
      setAllocations(fetchedData);
      
      if (fetchedData.length > 0 && !selectedCargoId) {
        setSelectedCargoId(fetchedData[0].id);
      }
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

  const transformedOrders = useMemo(() => {
    return allocations.map((alloc) => {
      const primaryItem = alloc.items?.[0];
      const itemsCount = alloc.items?.length || 0;
      
      const computedItemName = primaryItem?.product?.name || "Marketplace Cargo Pool";
      const displayName = itemsCount > 1 ? `${computedItemName} (+${itemsCount - 1} entries)` : computedItemName;

      const hasFinancials = !!alloc.landedCostBreakdown;
      
      // Calculate a client-side fallback price if the landed cost matrix hasn't run yet
      const draftBaseCost = (alloc.items || []).reduce((acc: number, item: any) => {
        const itemPrice = Number(item.product?.priceAmountMinor || 0) / 100;
        const itemQty = Number(item.quantity || 0);
        return acc + (itemPrice * itemQty);
      }, 0);

      return {
        id: alloc.id,
        direction: "Import" as const,
        itemName: displayName,
        origin: alloc.store?.name || "Marketplace Source Store",
        destination: "Lagos Hub Node (NG)",
        status: alloc.status || "DRAFT",
        carrier: "Pending Port Assignment",
        eta: hasFinancials ? "Calculated" : "Awaiting Audit",
        currencyCode: alloc.currencyCode || "NGN",
        quantity: itemsCount,
        hasFinancials,
        financials: {
          itemCost: alloc.landedCostBreakdown ? Number(alloc.landedCostBreakdown.baseCostMinor) / 100 : draftBaseCost,
          tariffAmount: alloc.landedCostBreakdown ? Number(alloc.landedCostBreakdown.tariffAmountMinor) / 100 : 0,
          customsFees: alloc.landedCostBreakdown ? Number(alloc.landedCostBreakdown.customsFeeMinor) / 100 : 0,
          vatAmount: alloc.landedCostBreakdown ? Number(alloc.landedCostBreakdown.vatAmountMinor) / 100 : 0,
          totalLandedCost: alloc.landedCostBreakdown ? Number(alloc.landedCostBreakdown.totalAmountMinor) / 100 : draftBaseCost
        }
      };
    });
  }, [allocations]);

  const allShipments = useMemo(() => {
    return [...transformedOrders];
  }, [transformedOrders]);

  const selectedCargo = useMemo(() => {
    return allShipments.find((ship) => ship.id === selectedCargoId) || allShipments[0] || null;
  }, [allShipments, selectedCargoId]);

  const filteredCargo = useMemo(() => {
    return allShipments.filter((c) => directionFilter === "All" || c.direction === directionFilter);
  }, [allShipments, directionFilter]);

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
          <Image src="/zeon-logo.jpg" alt="Logo" fill className="object-contain rounded-xl" />
        </div>
      </div>
      <Sidebar />
      <main className="flex-1 p-6 pt-24 md:p-10 md:pl-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60">
            <div>
              <span className="text-slate-400 font-bold tracking-wider text-[10px] uppercase flex items-center gap-1">
                <Package className="h-3 w-3" /> System Tracking Core
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">Cargo Dashboard</h1>
            </div>
            <button
              onClick={() => fetchAllocations(false)}
              disabled={loading}
              className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Matrix</span>
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
              <p className="text-xs text-slate-400 font-medium tracking-wide">Syncing terminal state streams...</p>
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
                    No active item allocations found inside this scope.
                  </div>
                ) : (
                  filteredCargo.map((cargo) => (
                    <CargoMiniCard
                      key={cargo.id}
                      cargo={cargo}
                      isSelected={selectedCargo?.id === cargo.id}
                      onClick={() => setSelectedCargoId(cargo.id)}
                      onRefreshNeeded={() => fetchAllocations(true)}
                    />
                  ))
                )}
              </div>
              
              <div className="lg:col-span-5">
                <CargoFinancialLedger
                  selectedCargo={selectedCargo}
                  costBreakdown={selectedCargo?.financials}
                  formatNaira={(val) => formatCurrency(val, selectedCargo?.currencyCode)}
                  onActionComplete={() => fetchAllocations(true)}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}