"use client";

import React from "react";
import { ArrowRight, Package, TrendingUp, Shield } from "lucide-react";
import { ExtendedStore } from "../data/marketplaceData";
import StoreFlagIcon from "@/components/StoreFlagIcon";

interface FactoryCardProps {
  store: ExtendedStore;
  onOpenShop: () => void;
}

export default function FactoryCard({ store, onOpenShop }: FactoryCardProps) {
  return (
    <div 
      onClick={onOpenShop}
      className="p-4 md:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
    >
      <div>
        <div className="flex items-start justify-between mb-3.5 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative shrink-0">
              <img src={store.logoUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">{store.category}</span>
              <h4 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">{store.name}</h4>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border rounded-full px-2.5 py-1 text-xs text-slate-600 shrink-0">
            <StoreFlagIcon countryCode={store.flag} />
            <span className="text-[10px] font-semibold text-slate-700">{store.location.split(",")[0]}</span>
          </div>
        </div>

        <div className="mb-4 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-medium">
            <Shield className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Tariffs &amp; Customs Cleared</span>
          </div>
          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-600 text-white uppercase tracking-wider shadow-sm">
            DDP Verified
          </span>
        </div>

        <div className="flex gap-4 text-xs text-slate-500 pl-1">
          <div className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5 text-slate-400" />
            <span>{store.items} Lines</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span>{store.reliability} Fill</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[9px] text-slate-400 font-semibold uppercase block tracking-wider">Min Cargo</span>
          <p className="text-xs font-bold text-slate-700">{store.minOrder}</p>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 group-hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition-colors">
          <span>Import from Factory</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}