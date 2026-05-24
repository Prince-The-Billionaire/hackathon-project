"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import { useCartStore } from "@/store/useCartStore"; // Update path to store file location
import { 
  Package, 
  Clock, 
  Anchor, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  AlertCircle,
  CreditCard,
  Layers
} from "lucide-react";

export default function CargoTrackingPage() {
  // Read state reactively from global store
  const cargoOrders = useCartStore((state) => state.cargoOrders);
  
  // Local active index tracker state
  const [selectedCargo, setSelectedCargo] = useState(cargoOrders[0]);

  // Keep active item safely bound to current updates if a new item replaces the top spot
  useEffect(() => {
    if (cargoOrders.length > 0 && (!selectedCargo || !cargoOrders.some(c => c.id === selectedCargo.id))) {
      setSelectedCargo(cargoOrders[0]);
    }
  }, [cargoOrders, selectedCargo]);

  // Landed cost calculus engine structured with strict defensive optional chaining
  const costBreakdown = React.useMemo(() => {
    const unitCost = selectedCargo?.materials?.unitCost ?? 0;
    const quantity = selectedCargo?.materials?.quantity ?? 0;
    const itemCost = unitCost * quantity;

    const tariffRate = selectedCargo?.financials?.tariffRate ?? 0;
    const customsFees = selectedCargo?.financials?.customsFees ?? 0;
    const vatRate = selectedCargo?.financials?.vatRate ?? 0;
    
    const tariffAmount = itemCost * tariffRate;
    const vatAmount = (itemCost + tariffAmount + customsFees) * vatRate;
    const totalLandedCost = itemCost + tariffAmount + customsFees + vatAmount;

    return {
      itemCost,
      tariffAmount,
      vatAmount,
      totalLandedCost
    };
  }, [selectedCargo]);

  // Currency Formatter Helper for Nigerian Naira
  const formatNaira = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 antialiased flex flex-col md:flex-row">
      
      {/* BRANDING TOP LEFT CONTAINER */}
      <div className="absolute top-4 left-4 z-30 flex flex-col items-center gap-2 bg-white/75 rounded-full backdrop-blur-md border border-slate-200/50 p-1 shadow-sm md:top-5 md:left-6">
        <div className="relative h-16 w-16 rounded-full object-contain">
          <Image 
            src="/zeon-logo.jpg" 
            alt="Zeon Systems Logo" 
            fill
            sizes="36px"
            priority
            className="object-contain rounded-full"
          />
        </div>
      </div>

      <Sidebar />

      {/* LAYOUT-ALIGNED SCROLLABLE WORKSPACE CONTAINER */}
      <main className="w-full h-full pt-20 pb-24 px-4 md:pl-28 md:pt-6 md:pb-6 md:pr-6 relative z-10 flex-1 overflow-y-auto scrollbar-thin">
        <div className="w-full h-auto space-y-6">
          
          {/* Page Heading */}
          <div className="border-b border-slate-200 pb-5">
            <div className="flex items-center gap-2.5 text-blue-600 font-bold tracking-wider uppercase text-xs">
              <Package className="h-3.5 w-3.5" />
              <span>SME Consolidated Logistics</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
              Shared Cargo Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              Track pooling slots, view fractionally distributed port clearances, and verify secure Korapay milestone holding pools.
            </p>
          </div>

          {/* Core Master-Detail Twin Division */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Shared Cargo Cards */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Anchor className="h-3.5 w-3.5 text-blue-500" />
                Your Pooled Consignments
              </h3>

              <div className="space-y-3">
                {cargoOrders.map((cargo) => {
                  const isSelected = selectedCargo?.id === cargo.id;
                  return (
                    <div
                      key={cargo.id}
                      onClick={() => setSelectedCargo(cargo)}
                      className={`cursor-pointer transition-all duration-200 flex flex-col md:flex-row items-stretch bg-white border shadow-sm group ${
                        isSelected 
                          ? "border-blue-500 ring-1 ring-blue-500/10 bg-slate-50/50" 
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      style={{
                        borderTopLeftRadius: "0.75rem",
                        borderBottomLeftRadius: "0.75rem",
                        borderTopRightRadius: "0px",
                        borderBottomRightRadius: "0px"
                      }}
                    >
                      {/* Left status color strip */}
                      <div className={`w-1.5 shrink-0 ${
                        cargo.status === "Customs Hold" ? "bg-amber-500" : "bg-blue-500"
                      }`} 
                      style={{ borderTopLeftRadius: "0.75rem", borderBottomLeftRadius: "0.75rem" }}
                      />

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400 block">
                              Consolidation Link Ref: {cargo.id}
                            </span>
                            <h4 className="text-sm font-bold text-slate-800 mt-0.5 group-hover:text-blue-600 transition-colors">
                              {cargo.itemName}
                            </h4>
                            {cargo.materials && (
                              <div className="text-xs text-slate-500 mt-1 italic">
                                Batch Allocation: {cargo.materials.name} (x{cargo.materials.quantity})
                              </div>
                            )}
                          </div>

                          {/* Status Pill */}
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1 shrink-0 ${
                            cargo.status === "Customs Hold" 
                              ? "bg-amber-50 text-amber-700 border border-amber-200" 
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cargo.status === "Customs Hold" ? "bg-amber-500 animate-pulse" : "bg-blue-500"}`} />
                            {cargo.status}
                          </span>
                        </div>

                        {/* Route Nodes */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 pt-1">
                          <span className="font-medium text-slate-700">{cargo.origin}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-700">{cargo.destination}</span>
                        </div>

                        {/* Progress Bar & Sub-metrics */}
                        <div className="pt-2 flex items-center justify-between gap-6 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>Arrival Window: <strong className="text-slate-700">{cargo.eta}</strong></span>
                          </div>
                          <div className="w-1/3 flex items-center gap-2">
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                                style={{ width: `${cargo.progressPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-400">{cargo.progressPercent}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Sticky Landed Fiscal Ledger */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5 lg:sticky lg:top-6">
              <div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <h3 className="font-bold text-xs tracking-widest text-slate-400 uppercase">Itemized Landed Cost (NGN)</h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Transparent breakdown showing exactly what your business pays.
                </p>
              </div>

              {/* Selected Target Descriptor Block */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Shared Pool Details</span>
                <span className="text-xs font-bold text-slate-800 line-clamp-1 mt-0.5">{selectedCargo?.itemName ?? "No Cargo Selected"}</span>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                  <span>Freight System: <strong>{selectedCargo?.carrier ?? "N/A"}</strong></span>
                  <span>•</span>
                  <span>Batch Unit: <strong>{selectedCargo?.id ?? "N/A"}</strong></span>
                </div>
              </div>

              {/* Explicit Material Unit Breakdown Panel */}
              {selectedCargo?.materials && (
                <div className="bg-blue-50/40 border border-blue-100/70 rounded-lg p-3.5 space-y-2">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide flex items-center gap-1">
                    <Layers className="h-3 w-3" /> SME Unit Economics
                  </span>
                  <div className="text-xs font-medium text-slate-800 border-b border-blue-100/50 pb-1.5">
                    {selectedCargo.materials.name}
                  </div>
                  <div className="flex justify-between text-xs pt-0.5">
                    <span className="text-slate-500">Ex-Factory Cost / Unit:</span>
                    <span className="font-mono text-slate-700">{formatNaira(selectedCargo.materials.unitCost)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Your Allocated Quantity:</span>
                    <span className="font-bold text-slate-700">{selectedCargo.materials.quantity} units</span>
                  </div>
                </div>
              )}

              {/* Financial Ledger Breakdown */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    Total Raw Base Cost
                  </span>
                  <span className="font-bold text-slate-800">{formatNaira(costBreakdown.itemCost)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    Customs Duty / Tariff <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded font-mono">{((selectedCargo?.financials?.tariffRate ?? 0) * 100).toFixed(1)}%</span>
                  </span>
                  <span className="font-semibold text-slate-800">{formatNaira(costBreakdown.tariffAmount)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Pooled Logistics & Local Handling
                  </span>
                  <span className="font-semibold text-slate-800">{formatNaira(selectedCargo?.financials?.customsFees ?? 0)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    Port Authority VAT <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded font-mono">{((selectedCargo?.financials?.vatRate ?? 0) * 100).toFixed(1)}%</span>
                  </span>
                  <span className="font-semibold text-slate-800">{formatNaira(costBreakdown.vatAmount)}</span>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Final Landed Cost</span>
                  <span className="text-base font-black text-blue-600">{formatNaira(costBreakdown.totalLandedCost)}</span>
                </div>
              </div>

              {/* Secure Escrow Guard Notification Note */}
              {selectedCargo?.status === "Customs Hold" ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-[11px] text-amber-800 leading-relaxed">
                    <strong className="font-bold">Customs Verification Delay:</strong> Your settlement remains securely locked in the Korapay escrow pool. Funds are protected until customs release verification completes.
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="text-[11px] text-emerald-800 leading-relaxed">
                    <strong className="font-bold">Korapay Escrow Protection:</strong> Local capital secure. Funds disburse down the clearing and logistics network strictly upon validation.
                  </div>
                </div>
              )}

              {/* Action Trigger */}
              <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm mt-2">
                <FileText className="h-3.5 w-3.5" />
                <span>Download Shared Manifest Receipt</span>
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}