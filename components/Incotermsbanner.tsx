"use client";

import React from "react";
import { Scale } from "lucide-react";

export default function IncotermsBanner() {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 md:p-6 shadow-md border border-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">Contractual Agreements &amp; Legal Frameworks</h2>
            <p className="text-xs text-indigo-200/70 mt-0.5">Who ultimately covers the tariff within the supply chain is locked using shipping contracts (Incoterms).</p>
          </div>
        </div>
        <div className="text-left md:text-right shrink-0">
          <span className="text-[11px] font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 uppercase">
            Legal Advisor Approved
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Sheppard, Mullin, Richter &amp; Hampton LLP +2</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/30 p-3.5 rounded-xl transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
              DDP
            </span>
            <h4 className="text-xs font-semibold text-slate-200">Delivered Duty Paid</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The <strong className="text-slate-200 font-medium">foreign exporter</strong> agrees to pay all duties, clearances, and structural transit costs. Highly preferred for predictable landing expenses.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 p-3.5 rounded-xl transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
              EXW
            </span>
            <h4 className="text-xs font-semibold text-slate-200">Ex Works</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The <strong className="text-slate-200 font-medium">buyer</strong> takes full responsibility from the factory dock. Exporter only prepares goods; you control shipping routes and navigate cross-border clearings yourself.
          </p>
        </div>
      </div>
    </div>
  );
}