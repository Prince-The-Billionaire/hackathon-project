"use client";

import React from "react";
import { MessageSquare, Layers, Loader2 } from "lucide-react";

interface MerchantCardProps {
  merchant: {
    id: string | number;
    name: string;
    contactPerson: string;
    flagCode: string;
    country: string;
    targetImports: string[];
    industry?: string;
  };
  isInitializing?: boolean;
  onNegotiate: () => void;
}

export default function MerchantCard({ merchant, isInitializing = false, onNegotiate }: MerchantCardProps) {
  const merchantIndustry = merchant.industry || "General Trade";

  return (
    <div className="border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-5 transition-all bg-white shadow-sm hover:shadow-md flex flex-col justify-between group">
      <div>
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-1">
              <Layers className="h-3 w-3" />
              <span>{merchantIndustry}</span>
            </div>
            <h4 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors truncate">
              {merchant.name}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 max-w-full truncate">Contact: {merchant.contactPerson}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border rounded-full px-2.5 py-1 text-xs text-slate-600 shrink-0">
            <span className="text-[10px] font-bold text-slate-700 tracking-wider uppercase">
              {merchant.flagCode}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1.5">
            Operational Lines / Tags:
          </span>
          <div className="flex flex-wrap gap-1">
            {merchant.targetImports.map((item, i) => (
              <span
                key={i}
                className="text-[10px] bg-slate-50 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200/60"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onNegotiate}
        disabled={isInitializing}
        className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all tracking-wide disabled:opacity-50"
      >
        {isInitializing ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Establishing Channel...</span>
          </>
        ) : (
          <>
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Negotiate Deal</span>
          </>
        )}
      </button>
    </div>
  );
}