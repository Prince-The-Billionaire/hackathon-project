/**
 * ============================================================================
 * MERCHANT DIRECTORY ITEM CARD
 * * Features:
 * - Industrial segmentation layout showcasing core target imports
 * - Fluid layout configurations built cleanly using tailored Tailwind utility grids
 * - Dedicated call-to-action button to spin up automated custom trade workspaces
 * ============================================================================
 * @param merchant - Explicit layout data structure object maps
 * @param onNegotiate - Execution trigger to initialize modal chat portals
 */

"use client";

import React from "react";
import { MessageSquare, Layers } from "lucide-react";
import StoreFlagIcon from "./StoreFlagIcon";

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
  onNegotiate: () => void;
}

export default function MerchantCard({ merchant, onNegotiate }: MerchantCardProps) {
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
            <p className="text-xs text-slate-500 mt-0.5">Contact: {merchant.contactPerson}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border rounded-full px-2.5 py-1 text-xs text-slate-600 shrink-0">
            <StoreFlagIcon countryCode={merchant.flagCode} />
            <span className="text-[10px] font-bold text-slate-700 tracking-wider uppercase">
              {merchant.flagCode}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1.5">
            Target Import Lines:
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
        className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all tracking-wide"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Negotiate Deal
      </button>
    </div>
  );
}