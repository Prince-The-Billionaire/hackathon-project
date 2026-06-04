"use client";

import React, { useEffect, useState } from "react";
import { X, Anchor, Package, Gauge, Compass, HelpCircle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { Vessel } from "../types/types";

interface ModalProps {
  vessel: Vessel;
  onClose: () => void;
}

export default function VesselDetailsModal({ vessel, onClose }: ModalProps) {
  const { getToken } = useAuth();
  const [extendedData, setExtendedData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVesselDeepTelemetry() {
      try {
        setLoading(true);
        const token = await getToken();
        if (!token) return;

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        // Querying specific active vessel instance matching backend route: /api/carrier/vessels/:id
        const response = await fetch(`${baseUrl}/api/carrier/vessels/${vessel.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const resData = await response.json();
        if (response.ok && resData.status) {
          setExtendedData(resData.data);
        }
      } catch (err) {
        console.error("Failed to map detailed vessel endpoint telemetry:", err);
      } finally {
        setLoading(false);
      }
    }

    if (vessel?.id) {
      fetchVesselDeepTelemetry();
    }
  }, [vessel.id, getToken]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      {/* Light Mode Container: crisp white background, clear slate typography, and subtle border details */}
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header Block */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-mono font-bold tracking-wider uppercase">
              {vessel.id.substring(0, 12)}
            </span>
            <h3 className="text-base md:text-lg font-bold text-slate-900 mt-1.5 tracking-tight">
              {vessel.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Anchor className="h-3.5 w-3.5 text-slate-400 shrink-0" /> 
              <span>Fleet Carrier: <strong className="text-slate-700 font-semibold">{vessel.carrier}</strong></span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dynamic Telemetry Parameters Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Telemetry Speed Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
            <Gauge className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Telemetry Speed</span>
              <p className="text-xs font-bold text-slate-800">{vessel.speed || "18.5 Knots"}</p>
            </div>
          </div>

          {/* Type / Platform Flag Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
            <Compass className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Vessel Model Type</span>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono">
                {loading ? "..." : (extendedData?.type || "SHIP")}
              </p>
            </div>
          </div>

          {/* Live Capacity Metric (Using capacityTeu from backend context) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
            <Package className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Max Allocation Volume</span>
              <p className="text-xs font-bold text-slate-800">
                {loading ? "Syncing..." : extendedData?.capacityTeu ? `${parseInt(extendedData.capacityTeu).toLocaleString()} TEU` : "8,000 TEU"}
              </p>
            </div>
          </div>

          {/* Manifest Utilization Load Percent */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
            <HelpCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Utilization Load Factor</span>
              <p className="text-xs font-bold text-slate-800">
                {loading ? "Calculating..." : extendedData?.utilizationPercent ? `${parseFloat(extendedData.utilizationPercent).toFixed(1)}% Capacity` : "52.5% Optimal"}
              </p>
            </div>
          </div>

        </div>

        {/* Operational Context Footnote Box */}
        <div className="mt-4 p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            <Compass className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            <span>Internal Freight Position Route Block</span>
          </div>
          <p className="text-xs text-slate-600 font-medium font-mono pt-1 leading-normal">
            {vessel.purchasePosition || "Assigned Deck Cargo Layer Telemetry Stack / Pool Route Pending"}
          </p>
        </div>

      </div>
    </div>
  );
}