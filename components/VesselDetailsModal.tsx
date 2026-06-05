/**
 * ============================================================================
 * ZEON SYSTEMS - INTERMODAL TELEMETRY DRILLDOWN PANEL
 * ============================================================================
 */

"use client";

import React, { useEffect, useState } from "react";
import { X, Anchor, Package, Gauge, Compass, Radio, Activity, Box } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/utils/api";
import { VesselUI } from "../types/types";

// Explicitly extending the baseline UI definition to account for our clean callsigns
interface ExtendedVesselUI extends VesselUI {
  readableCallSign?: string;
  type?: "SHIP" | "PLANE" | "TRUCK" | "TRAIN";
}

interface ModalProps {
  vessel: ExtendedVesselUI;
  onClose: () => void;
}

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

  // Read backend specific keys or fallback cleanly
  const assetType = extendedData?.type || vessel.type || "SHIP";
  const speed = extendedData?.avgSpeedKnots ?? "19.5";
  const capacity = extendedData?.capacityTeu ?? "15,000";
  const utilization = extendedData?.utilizationPercent ?? "85";
  const registryNumber = extendedData?.imoNumber ?? `ZSM-${vessel.id.substring(0, 8).toUpperCase()}`;

  // Speed metric suffix helper based on asset class type
  const getSpeedUnit = (type: string) => {
    switch (type) {
      case "PLANE": return "Knots (TAS)";
      case "TRUCK":
      case "TRAIN": return "KM/H";
      default: return "Knots";
    }
  };

  // Capacity metric context helper based on asset class type
  const getCapacityUnit = (type: string) => {
    switch (type) {
      case "PLANE": return "KG Cargo Vol";
      case "TRUCK": return "Tons Loading";
      case "TRAIN": return "TEU / Freight";
      default: return "TEU Max Cap";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-100">
        
        {/* Header Layout */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            {/* Clean callsign label instead of the long raw string id */}
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/50 font-mono font-bold tracking-wider uppercase">
              {vessel.readableCallSign || "ACTIVE-NODE"}
            </span>
            <h3 className="text-base md:text-lg font-bold text-white mt-2 tracking-tight uppercase font-mono">
              {vessel.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Anchor className="h-3.5 w-3.5 text-slate-500 shrink-0" /> 
              <span>Operator Fleet: <strong className="text-slate-200 font-semibold">{vessel.carrierName}</strong></span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all active:scale-95" 
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dynamic Telemetry Matrix Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Speed Indicator */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex gap-3 items-start shadow-inner">
            <Gauge className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500 block mb-0.5">Velocity Rate</span>
              <p className="text-xs font-bold text-slate-200 font-mono">{speed} {getSpeedUnit(assetType)}</p>
            </div>
          </div>

          {/* Asset Classification Type */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex gap-3 items-start shadow-inner">
            <Compass className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500 block mb-0.5">Transit Classification</span>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wide font-mono">
                {assetType}
              </p>
            </div>
          </div>

          {/* Allocation Volume Capacity */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex gap-3 items-start shadow-inner">
            <Package className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500 block mb-0.5">{getCapacityUnit(assetType)}</span>
              <p className="text-xs font-bold text-slate-200 font-mono">
                {capacity.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Utilization Factor */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex gap-3 items-start shadow-inner">
            <Box className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500 block mb-0.5">Payload Load Factor</span>
              <p className="text-xs font-bold text-emerald-400 font-mono">
                {utilization}% Capacity
              </p>
            </div>
          </div>
        </div>

        {/* Global Registry Index Identification Banner */}
        <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col gap-1 relative overflow-hidden shadow-inner">
          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-wider font-mono">
            <Radio className="h-3.5 w-3.5 shrink-0 text-blue-400 animate-pulse" />
            <span>International System Broadcast Router</span>
          </div>
          <div className="text-xs text-slate-300 font-medium font-mono pt-1 leading-normal flex justify-between items-center">
            <span>{registryNumber} — Live Sync</span>
            <span className="text-[10px] font-sans font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded shadow-sm">
              HDG: {vessel.heading || extendedData?.currentHeadingDegrees || "0"}°
            </span>
          </div>
        </div>

        {/* Sync loading linear loader track indicator line bar */}
        {loading && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600 animate-pulse rounded-b-2xl" />
        )}
      </div>
    </div>
  );
}