"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
import WorldLogisticsMap from "@/components/WorldLogisticsMap";
import VesselDetailsModal from "@/components/VesselDetailsModal";
import { createApiClient } from "@/utils/api";
import { VesselUI, PortUI, CarrierMapPayload } from "@/types/types";

export default function MainDashboardPage() {
  const { getToken, isLoaded } = useAuth();
  const [vessels, setVessels] = useState<VesselUI[]>([]);
  const [ports, setPorts] = useState<PortUI[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<VesselUI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function streamCarrierMapMetrics() {
      if (!isLoaded) return;
      
      try {
        setLoading(true);
        
        // 1. Initialize our unified secure client passing Clerk's token manager
        const client = await createApiClient(getToken);
        
        // 2. Query the map endpoint
        const response = await client("api/carrier/map");
        
        if (response && response.status) {
          const trackingData = response.data as CarrierMapPayload;

          // 3. Map raw backend coordinate types to canvas UI vectors
          const mappedVessels: VesselUI[] = (trackingData.vessels || []).map((v) => {
            const lat = parseFloat(v.currentLat as string) || 0;
            const lng = parseFloat(v.currentLng as string) || 0;
            
            // Map geographical coordinates onto a balanced pixel distribution layout
            const x = (lng + 180) * (1000 / 360);
            const y = (90 - lat) * (500 / 180);

            const matchingShipment = trackingData.shipments?.find(
              (s) => s.vessel?.name === v.name || s.vessel?.id === v.id
            );

            return {
              id: v.id,
              name: v.name,
              carrierName: v.carrier?.name || "Independent Carrier",
              heading: parseFloat(v.currentHeadingDegrees as string) || 0,
              eta: matchingShipment ? "In Transit (Active Channel)" : "Anchored / Free Track",
              startCoords: { x: x - 35, y: y + 15 }, 
              endCoords: { x: 495, y: 310 } // Center Destination Vector: Lagos Apapa Port
            };
          });

          const mappedPorts: PortUI[] = (trackingData.ports || []).map((p, idx) => {
            const lat = parseFloat(p.lat as string) || 0;
            const lng = parseFloat(p.lng as string) || 0;
            const computedCode = p.code === "NGLOS" ? "LOS" : p.code;
            
            return {
              // FIX: Append the index or a unique database ID row field to guarantee uniqueness across loops
              id: p.id ? `${computedCode}-${p.id}` : `${computedCode}-${idx}`,
              name: p.name,
              x: (lng + 180) * (1000 / 360),
              y: (90 - lat) * (500 / 180),
              distToLagos: p.code === "NGLOS" ? "0 NM" : "Calculated at Sea",
              etaLagos: p.code === "NGLOS" ? "Local Hub" : "Processing"
            };
          });

          setVessels(mappedVessels);
          setPorts(mappedPorts.length > 0 ? mappedPorts : []);
          setError(null);
        } else {
          setError(response.message || "Failed to process synchronized carrier tracking telemetry.");
        }
      } catch (err: any) {
        console.error("Critical tracking stream synchronization failure:", err);
        setError(err.message || "Network connection timeout syncing tracking matrix routes.");
      } finally {
        setLoading(false);
      }
    }

    streamCarrierMapMetrics();
    
    // Polling interval cycle (45 seconds) to ensure coordinates stay active
    const poolTimer = setInterval(streamCarrierMapMetrics, 45000);
    return () => clearInterval(poolTimer);
  }, [getToken, isLoaded]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 antialiased flex flex-col md:flex-row">
      
      {/* BRANDING TOP LEFT LOGO CONTAINER */}
      <div className="absolute top-4 left-4 z-30 flex flex-col items-center gap-2 bg-white/75 rounded-full backdrop-blur-md border border-slate-200/50 p-1 shadow-sm md:top-5 md:left-6">
        <div className="relative h-16 w-16 rounded-full object-contain">
          <Image 
            src="/zeon-logo.webp" 
            alt="Zeon Systems Logo" 
            fill
            sizes="64px"
            priority
            className="object-contain rounded-full"
          />
        </div>
      </div>

      <Sidebar />

      <main className="w-full h-full relative z-10 flex-1">
        <div className="w-full h-full pt-16 pb-24 px-2 md:pl-24 md:pt-5 md:pb-3 md:pr-3 relative">
          
          {loading && vessels.length === 0 ? (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl m-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-blue-600 border-slate-200 mb-2" />
              <p className="text-xs text-slate-500 font-mono tracking-wide">Syncing satellite telemetry arrays...</p>
            </div>
          ) : error ? (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl border border-red-100 m-4 p-6 text-center">
              <p className="text-sm font-semibold text-red-600">{error}</p>
              <p className="text-xs text-slate-400 mt-2 font-mono max-w-md mx-auto">
                Ensure your local environment configuration variables contain the proper base URL context.
              </p>
            </div>
          ) : null}

          <WorldLogisticsMap 
            vessels={vessels} 
            ports={ports}
            onVesselClick={setSelectedVessel} 
          />
        </div>
      </main>

      {selectedVessel && (
        <VesselDetailsModal 
          vessel={selectedVessel} 
          onClose={() => setSelectedVessel(null)} 
        />
      )}
    </div>
  );
}