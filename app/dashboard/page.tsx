/**
 * ============================================================================
 * ZEON SYSTEMS - WORLDWIDE CARRIER LOGISTICS CONTROL HUB
 * ============================================================================
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
import WorldLogisticsMap from "@/components/WorldLogisticsMap";
import VesselDetailsModal from "@/components/VesselDetailsModal";
import { createApiClient } from "@/utils/api";
import { VesselUI, PortUI, CarrierMapPayload } from "@/types/types";
import { RefreshCw, Radio, Layers, Activity } from "lucide-react";

export default function MainDashboardPage() {
  const { getToken, isLoaded } = useAuth();
  // Use a relaxed type here to satisfy downstream components expecting extended vessel fields
  const [vessels, setVessels] = useState<any[]>([]);
  const [ports, setPorts] = useState<PortUI[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<VesselUI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Consolidated manual pull pipeline trigger
  const streamCarrierMapMetrics = useCallback(async (isManualTrigger = false) => {
    if (!isLoaded) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const client = await createApiClient(getToken);
      const response = await client("api/carrier/map");
      
      if (response && response.status) {
        const trackingData = response.data as CarrierMapPayload;
        
        // Clean up the telemetry objects and assign readable references instead of raw tracking IDs
        const normalizedVessels = (trackingData.vessels || []).map((vsl, idx) => {
          // carrierName may not exist on BackendVessel; use alternate fields or safe default
          const rawName = (vsl as any).carrierName ?? (vsl as any).name ?? (vsl as any).carrier ?? "ZSM";
          const prefix = String(rawName).substring(0, 3).toUpperCase();
          const mockIndex = 700 + (idx * 13);
          return {
            ...vsl,
            // Use clean semantic identifier tag for display layout instead of long UUID string
            readableCallSign: `${prefix}-${mockIndex}`,
            // Standard fallback safeguards for structural types mapping layers
            type: vsl.type || "SHIP"
            ,
            // Provide explicit current latitude/longitude fields expected by the map component
            currentLat: (vsl as any).currentLat ?? (vsl as any).latitude ?? (vsl as any).lat ?? 0,
            currentLng: (vsl as any).currentLng ?? (vsl as any).longitude ?? (vsl as any).lng ?? 0
          };
        });

        setVessels(normalizedVessels);
        if (trackingData.ports) {
          // Normalize backend port objects to the PortUI shape expected by the UI
          const normalizedPorts: PortUI[] = (trackingData.ports || []).map((p: any) => ({
            ...p,
            // provide explicit x/y coordinates fallbacks
            x: p.x ?? p.longitude ?? p.lng ?? p.lat ?? 0,
            y: p.y ?? p.latitude ?? p.lat ?? p.lng ?? 0,
            // ensure analytics fields exist with safe defaults
            distToLagos: p.distToLagos ?? 0,
            etaLagos: p.etaLagos ?? 0
          }));

          setPorts(normalizedPorts);
        }
      } else {
        throw new Error(response?.message || "Failed to unpack active tracking payload telemetry.");
      }
    } catch (err: any) {
      console.error("Dashboard Engine Exception:", err);
      setError(err.message || "Ensure your local environment configuration variables contain the proper base URL context.");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, getToken]);

  // Initial trigger fetch lock on component loading sequence
  useEffect(() => {
    streamCarrierMapMetrics(false);
  }, [streamCarrierMapMetrics]);

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 font-sans antialiased flex flex-col md:flex-row overflow-hidden select-none">
      
      {/* Top Banner Branding Branding Node */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl backdrop-blur-md shadow-2xl md:top-5 md:left-6">
        <div className="relative h-7 w-7 rounded-lg overflow-hidden border border-slate-700">
          <Image src="/zeon-logo.webp" alt="Zeon Logo" fill priority className="object-contain scale-110" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-mono font-black tracking-wider text-white">ZEON<span className="text-blue-500">.SYS</span></span>
          <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase -mt-0.5">Tactical Terminal</span>
        </div>
      </div>

      <Sidebar />

      {/* Main Structural Visual Grid Layout Wrapper */}
      <div className="w-full h-screen relative flex flex-col flex-1">
        <div className="w-full h-full pt-16 pb-24 px-2 md:pl-24 md:pt-5 md:pb-3 md:pr-3 relative flex flex-col">
          
          {/* Header Dashboard Metrics Strip Bar Layout */}
          <div className="w-full bg-slate-950/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl relative z-30">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">Global Supply Chain Matrix</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Real-time intermodal logistics tracking node network layout.</p>
              </div>
            </div>

            {/* Controlled Manual Refresh Interface Trigger Handle */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {loading && (
                <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mr-2 animate-pulse flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-blue-400 animate-bounce" /> Syncing Telemetry Matrix...
                </span>
              )}
              <button
                type="button"
                disabled={loading}
                onClick={() => streamCarrierMapMetrics(true)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-black/40"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-blue-400 ${loading ? "animate-spin" : ""}`} />
                <span>Update Metrics</span>
              </button>
            </div>
          </div>

          {/* Full-bleed Map View Container Frame viewport workspace */}
          <div className="flex-1 w-full bg-slate-950/40 rounded-2xl border border-slate-800/80 relative overflow-hidden shadow-2xl flex">
            
            {error && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md border border-red-900/50 rounded-2xl p-6 text-center">
                <p className="text-sm font-semibold text-red-400 font-mono tracking-wide">CRITICAL TELEMETRY FAULT</p>
                <p className="text-xs text-slate-400 mt-2 font-sans max-w-md mx-auto leading-relaxed">{error}</p>
              </div>
            )}

            <WorldLogisticsMap 
              vessels={vessels} 
              ports={ports}
              onVesselClick={(vsl) => setSelectedVessel(vsl)} 
            />
          </div>

        </div>
      </div>

      {/* Trigger Modal Interface Panel Details Handle */}
      {selectedVessel && (
        <VesselDetailsModal 
          vessel={selectedVessel} 
          onClose={() => setSelectedVessel(null)} 
        />
      )}
    </div>
  );
}