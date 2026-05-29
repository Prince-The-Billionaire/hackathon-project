/**
 * ============================================================================
 * ELEVATED MINIMALISTIC CARGO ROW MODULE
 * * Variables/States/Functions:
 * - isImport: Boolean flag toggled via cargo.direction text matching
 * ============================================================================
 */

"use client";

import React from "react";
import { ArrowUpRight, ArrowDownLeft, ArrowRight } from "lucide-react";

interface CargoProps {
  id: string;
  direction: "Import" | "Export";
  itemName: string;
  origin: string;
  destination: string;
  status: string;
  eta: string;
}

interface CargoMiniCardProps {
  cargo: CargoProps;
  isSelected: boolean;
  onClick: () => void;
}

export default function CargoMiniCard({ cargo, isSelected, onClick }: CargoMiniCardProps) {
  const isImport = cargo.direction === "Import";

  return (
    <div
      onClick={onClick}
      className={`p-6 cursor-pointer transition-all duration-200 text-xs rounded-2xl flex items-center justify-between gap-4 border
        ${isSelected 
          ? "bg-white border-slate-900/10 shadow-lg shadow-slate-200/60 scale-[1.01]" 
          : "bg-white border-slate-100 shadow-sm shadow-slate-100/40 hover:shadow-md hover:border-slate-200/60"
        }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Soft, colorful ambient backing for icons */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner
          ${isImport ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}
        >
          {isImport ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-slate-400">{cargo.id}</span>
            <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded tracking-wider
              ${isImport ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}
            >
              {cargo.direction}
            </span>
          </div>
          <h4 className="font-bold text-slate-800 tracking-tight text-sm truncate">
            {cargo.itemName}
          </h4>
          <div className="flex items-center gap-1 text-slate-500 font-medium truncate">
            <span>{cargo.origin}</span>
            <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />
            <span>{cargo.destination}</span>
          </div>
        </div>
      </div>

      {/* Clean Status Badges */}
      <div className="text-right shrink-0 space-y-2">
        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg tracking-wide shadow-xs ${
          cargo.status === "Customs Cleared" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
        }`}>
          {cargo.status}
        </span>
        <p className="text-[10px] text-slate-400 font-medium">ETA: <span className="text-slate-600 font-bold">{cargo.eta}</span></p>
      </div>
    </div>
  );
}