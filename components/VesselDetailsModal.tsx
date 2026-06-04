"use client";

import React, { useEffect, useState } from "react";
import { X, Anchor, Package, Gauge, Compass, HelpCircle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/utils/api";
import { VesselUI } from "../types/types";

interface ModalProps {
  vessel: VesselUI;
  onClose: () => void;
}

// Interface capturing the structure returned by GET /api/carrier/vessels/:id
interface DetailedVesselTelemetry {
  id: string;
  name: string;
  type: "SHIP" | "PLANE" | "TRUCK" | "TRAIN";
  imoNumber?: string;
  avgSpeedKnots?: number | string;
  capacityTeu?: number | string;
  utilizationPercent?: number | string;
  currentLat?: number | string;
  currentLng?: number | string;
  currentHeadingDegrees?: number | string;
}

export default function VesselDetailsModal({ vessel, onClose }: ModalProps) {
  const { getToken } = useAuth();
  const [extendedData, setExtendedData] = useState<DetailedVesselTelemetry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVesselDeepTelemetry() {
      try {
        setLoading(true);
        const client = await createApiClient(getToken);
        const response = await client(`/api/carrier/vessels/${vessel.id}`);

        if (response && response.status) {
          setExtendedData(response.data);
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

  // Read backend specific keys (avgSpeedKnots) or fallback cleanly
  const speed = extendedData?.avgSpeedKnots ?? "19.5";
  const capacity = extendedData?.capacityTeu ?? "15000";
  const utilization = extendedData?.utilizationPercent ?? "85";
  const imoNumber = extendedData?.imoNumber ?? "IMO-Unavailable";

  // Formatter for safety against string or raw number types
  const formatTeu = (val: string | number) => {
    const parsed = parseInt(val.toString().replace(/,/g, ""), 10);
    return isNaN(parsed) ? val : parsed.toLocaleString();
  };

  const formatPercent = (val: string | number) => {
    const parsed = parseFloat(val.toString());
    return isNaN(parsed) ? val : `${parsed.toFixed(1)}%`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
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
              <span>Fleet Carrier: <strong className="text-slate-700 font-semibold">{vessel.carrierName}</strong></span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors" aria-label="Close modal">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
            <Gauge className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Telemetry Speed</span>
              <p className="text-xs font-bold text-slate-800">{speed} Knots</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
            <Compass className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Vessel Model Type</span>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono">
                {extendedData?.type || "SHIP"}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
            <Package className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Max Allocation Volume</span>
              <p className="text-xs font-bold text-slate-800">
                {formatTeu(capacity)} TEU
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
            <HelpCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Utilization Factor</span>
              <p className="text-xs font-bold text-slate-800">
                {formatPercent(utilization)} Capacity
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            <Compass className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            <span>International Registry Tracking Index</span>
          </div>
          <p className="text-xs text-slate-600 font-medium font-mono pt-1 leading-normal flex justify-between items-center">
            <span>{imoNumber} — Active Live Broadcast</span>
            <span className="text-[10px] font-sans font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
              HDG: {vessel.heading}°
            </span>
          </p>
        </div>

        {loading && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 animate-pulse rounded-b-2xl" />
        )}
      </div>
    </div>
  );
}