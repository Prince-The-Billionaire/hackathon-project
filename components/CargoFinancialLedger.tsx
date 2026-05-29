/**
 * ============================================================================
 * FISCAL LEDGER WITH HIGH-CONTRAST ACTION INTERFACES
 * * Variables/States/Functions:
 * - isImport: Controls action button state (Pay Now vs Track Payouts)
 * - isCleared: Toggles color theme layout and milestone context copies
 * ============================================================================
 */

"use client";

import React from "react";
import { CreditCard, ShieldCheck, Clock, ArrowRight, ArrowUpRight } from "lucide-react";

interface CargoFinancialLedgerProps {
  selectedCargo: any;
  costBreakdown: {
    itemCost: number;
    tariffAmount: number;
    vatAmount: number;
    totalLandedCost: number;
  };
  formatNaira: (val: number) => string;
}

export default function CargoFinancialLedger({ selectedCargo, costBreakdown, formatNaira }: CargoFinancialLedgerProps) {
  if (!selectedCargo) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center text-slate-400 font-medium text-xs border border-slate-100 shadow-sm shadow-slate-100/40">
        Select a shipment entry to view financial info.
      </div>
    );
  }

  const isImport = selectedCargo.direction === "Import";
  const isCleared = selectedCargo.status === "Customs Cleared";

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md shadow-slate-100/60 space-y-6 lg:sticky lg:top-6 text-xs">
      <div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-slate-700" />
          <h3 className="font-bold text-[11px] tracking-widest text-slate-400 uppercase">
            {isImport ? "Landed Cost (You Pay)" : "Export Valuation (You Receive)"}
          </h3>
        </div>
      </div>

      {/* Item Rows */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-slate-600 font-medium">
          <span>Base Item Value</span>
          <span className="font-bold text-slate-800">{formatNaira(costBreakdown.itemCost)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600 font-medium">
          <span>Duties & Handling Logistics</span>
          <span className="font-semibold text-slate-800">{formatNaira(costBreakdown.tariffAmount + (selectedCargo.financials?.customsFees ?? 0))}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600 font-medium">
          <span>Port VAT</span>
          <span className="font-semibold text-slate-800">{formatNaira(costBreakdown.vatAmount)}</span>
        </div>
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
          <span className="font-bold text-slate-900 uppercase tracking-wider">Total Balance</span>
          <span className="text-base font-black text-slate-900">{formatNaira(costBreakdown.totalLandedCost)}</span>
        </div>
      </div>

      {/* Notification Banner */}
      <div className={`p-4 rounded-xl flex items-start gap-3 shadow-xs ${isCleared ? "bg-emerald-50/50" : "bg-amber-50/50"}`}>
        {isCleared ? (
          <>
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-800 leading-normal">
              <strong className="font-bold">Customs Cleared:</strong> Payment released from escrow to the carrier network.
            </p>
          </>
        ) : (
          <>
            <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-normal">
              <strong className="font-bold">Escrow Holding Pool:</strong> Funds are locked safely. Money transfers to the vendor only when custom logs pass.
            </p>
          </>
        )}
      </div>

      {/* Buttons: High contrast, prominent, and distinct */}
      {isImport ? (
        <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-slate-900/20 hover:scale-[1.01] active:scale-[0.99]">
          <span>Pay Landed Balance Now</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.99]">
          <span>Track Escrow Incoming Payouts</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}