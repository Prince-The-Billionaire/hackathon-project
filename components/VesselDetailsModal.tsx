"use client";

import React from "react";
import { X, Anchor, Package, Gauge, Wind, Compass, HelpCircle } from "lucide-react";
import { Vessel } from "../types/types";

interface ModalProps {
  vessel: Vessel;
  onClose: () => void;
}

export default function VesselDetailsModal({ vessel, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#071131] p-6 shadow-2xl relative">
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold">{vessel.id}</span>
            <h3 className="text-lg font-bold text-white mt-1.5">{vessel.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Anchor className="h-3 w-3" /> Carrier Fleet: {vessel.carrier}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Estimated Arrival</span>
            <p className="text-xs font-semibold text-white">{vessel.eta}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Gross Container Load</span>
            <p className="text-xs font-semibold text-white">{vessel.load}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Telemetry Speed</span>
            <p className="text-xs font-semibold text-white">{vessel.speed}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Local Marine Weather</span>
            <p className="text-xs font-semibold text-white">{vessel.weather}</p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl border border-blue-500/20 bg-blue-950/20">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wide mb-1">
            <Compass className="h-3.5 w-3.5" />
            <span>Your Internal Freight Position Block</span>
          </div>
          <p className="text-xs text-slate-200 font-medium font-mono">{vessel.purchasePosition}</p>
        </div>
      </div>
    </div>
  );
}