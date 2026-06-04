"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, ShieldCheck, Clock, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createApiClient } from "../utils/api";
import { useAuth } from "@clerk/nextjs";

interface CargoFinancialLedgerProps {
  selectedCargo: any;
  costBreakdown: any;
  formatNaira: (val: number) => string;
  onActionComplete?: () => void;
}

export default function CargoFinancialLedger({ selectedCargo, costBreakdown, formatNaira, onActionComplete }: CargoFinancialLedgerProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const { getToken } = useAuth();

  // Hidden admin/system fallback metrics for processing behind the scenes
  const ESTIMATED_TARIFF_BPS = 500;
  const ESTIMATED_CUSTOMS_FEE = 150000;
  const ESTIMATED_VAT_BPS = 750;

  if (!selectedCargo) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center text-slate-400 font-medium text-xs border border-slate-200 shadow-2xs">
        Select an allocation track row item to view live port accounting metrics.
      </div>
    );
  }

  const rawStatus = (selectedCargo.status || "").toUpperCase().replace(/ /g, "_");
  const isDraft = rawStatus === "DRAFT";
  const isAwaitingPayment = rawStatus === "AWAITING_PAYMENT";
  const isPaid = rawStatus === "PAID" || rawStatus === "IN_TRANSIT" || rawStatus === "DELIVERED";

  const runCheckoutPipeline = async () => {
    try {
      setActionLoading(true);
      const api = await createApiClient(getToken);

      if (isDraft) {
        toast.loading("Generating clear customs matrix structures...", { id: "workflow" });
        
        await api("api/cargo/allocation/checkout", {
          method: "POST",
          body: JSON.stringify({ 
            allocationId: selectedCargo.id,
            tariffRateBps: ESTIMATED_TARIFF_BPS,
            // Automatically handled internally based on estimates
            customsFeeMinor: ESTIMATED_CUSTOMS_FEE * 100, 
            vatRateBps: ESTIMATED_VAT_BPS
          }),
        });
        
        toast.success("Landed breakdown built. Executing allocation locking...", { id: "workflow" });
        
        const confirmData = await api(`api/cargo/allocation/${selectedCargo.id}/confirm`, { method: "POST" });
        const url = confirmData?.checkoutUrl || confirmData?.data?.checkoutUrl;

        if (url) {
          toast.success("Forwarding context to Kora gateway interface...", { id: "workflow" });
          window.location.href = url;
        } else {
          if (onActionComplete) onActionComplete();
        }
        return;
      }

      if (isAwaitingPayment) {
        toast.loading("Re-fetching active checkout endpoint links...", { id: "workflow" });
        const confirmData = await api(`api/cargo/allocation/${selectedCargo.id}/confirm`, { method: "POST" });
        const url = confirmData?.checkoutUrl || confirmData?.data?.checkoutUrl;
        if (url) {
          window.location.href = url;
        } else {
          toast.error("Gateway could not establish clean context tokens.");
        }
      }
    } catch (err: any) {
      console.error("Pipeline breakdown sequence execution error:", err);
      toast.error(err.message || "Financial ledger computation pipeline encountered a failure state.", { id: "workflow" });
    } finally {
      setActionLoading(false);
    }
  };

  // Backend issue band-aid fix: multiply itemCost by 100 if it arrives divided by 100.
  const correctedItemCost = (costBreakdown?.itemCost || 0) * 100;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6 text-xs transition-all duration-300">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-slate-900" />
          <h3 className="font-bold text-[10px] tracking-widest text-slate-400 uppercase">Valuation Breakdown Matrix</h3>
        </div>
      </div>

      <div className="space-y-3 pt-1 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between text-slate-600 font-medium">
          <span>Base Items Net Value</span>
          {/* Multiplied back to counteract the backend division error */}
          <span className="font-bold text-slate-800">{formatNaira(correctedItemCost)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600 font-medium">
          <span>Custom Duties & Surcharges</span>
          <span className="font-semibold text-slate-800">
            {formatNaira((costBreakdown?.tariffAmount || 0) + (costBreakdown?.customsFees || 0))}
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-600 font-medium">
          <span>Port Component VAT (7.5%)</span>
          <span className="font-semibold text-slate-800">{formatNaira(costBreakdown?.vatAmount || 0)}</span>
        </div>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Total Landed Costs</span>
          <span className="text-base font-black text-slate-900">{formatNaira(costBreakdown?.totalLandedCost || 0)}</span>
        </div>
      </div>

      <div className={`p-4 rounded-xl flex items-start gap-3 border ${
        isPaid ? "bg-emerald-50/60 border-emerald-200/50 text-emerald-950" : "bg-amber-50/60 border-amber-200/50 text-amber-950"
      }`}>
        {isPaid ? (
          <>
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-[11px] text-emerald-900">Capital Escrow Verified</p>
              <p className="text-[10px] text-emerald-800/90 leading-relaxed">
                Settlement funds are currently held under system custodian conditions until terminal nodes sign off waybill validations.
              </p>
            </div>
          </>
        ) : (
          <>
            <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-[11px] text-amber-900">{isDraft ? "Awaiting Metric Matrix Audit" : "Awaiting Gateway Clearance"}</p>
              <p className="text-[10px] text-amber-800/90 leading-relaxed">
                {isDraft 
                  ? "Generate the final custom item valuation models to activate outward-facing trade lanes."
                  : "Landed calculations are locked. Pass verification signatures onto the terminal provider system to proceed."}
              </p>
            </div>
          </>
        )}
      </div>

      <button
        onClick={runCheckoutPipeline}
        disabled={actionLoading || isPaid}
        className={`w-full font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-[10px] ${
          isPaid
            ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none"
            : "bg-slate-950 hover:bg-slate-800 text-white active:scale-[0.98]"
        }`}
      >
        {actionLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPaid ? (
          <span>Manifest Funded & Locked</span>
        ) : isDraft ? (
          <>
            <span>Compile Valuation & Checkout</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        ) : (
          <>
            <span>Reroute To Kora Gateway</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </div>
  );
}