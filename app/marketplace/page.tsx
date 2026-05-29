"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "../../components/Sidebar";
import MarketplaceHub from "../../components/MarketplaceHub";
import VesselDetailsModal from "../../components/VesselDetailsModal";
import { THIRTY_MOCK_STORES } from "../../data/marketplaceData";
import { Vessel } from "../../types/types";

export default function MarketplacePage() {
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBackendStores() {
      try {
        const response = await fetch("/api/stores");
        if (!response.ok) throw new Error("Network response was not stable");
        
        const data = await response.json();
        // If the backend returns valid data, update our view state
        if (data && data.length > 0) {
          setStores(data);
        } else {
          setStores(THIRTY_MOCK_STORES); // Fallback if database collection is empty
        }
      } catch (error) {
        console.error("Backend fetch failed, pulling local system mock metrics:", error);
        setStores(THIRTY_MOCK_STORES); // Graceful recovery
      } finally {
        setLoading(false);
      }
    }

    fetchBackendStores();
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 antialiased flex flex-col md:flex-row">
      
      {/* BRANDING TOP LEFT CONTAINER */}
      <div className="absolute top-4 left-4 z-30 flex flex-col items-center gap-2 bg-white/75 rounded-full backdrop-blur-md border border-slate-200/50 p-1 shadow-sm md:top-5 md:left-6">
        <div className="relative h-16 w-16 rounded-full object-contain">
          <Image 
            src="/zeon-logo.jpg" 
            alt="Zeon Systems Logo" 
            fill
            sizes="36px"
            priority
            className="object-contain rounded-full"
          />
        </div>
      </div>

      {/* 1. SIDEBAR NAVIGATION COMPONENT */}
      <Sidebar />

      {/* 2. LAYOUT-ALIGNED SCROLLABLE WORKSPACE CONTAINER */}
      <main className="w-full h-full pt-20 pb-24 px-4 md:pl-28 md:pt-6 md:pb-6 md:pr-6 relative z-10 flex-1 overflow-y-auto scrollbar-thin">
        <div className="w-full h-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
              <p className="text-xs font-medium text-slate-400 tracking-wide">Syncing factory indexes...</p>
            </div>
          ) : (
            <MarketplaceHub stores={stores} />
          )}
        </div>
      </main>

      {/* 3. CONTEXTUAL OVERLAY MODALS */}
      {selectedVessel && (
        <VesselDetailsModal vessel={selectedVessel} onClose={() => setSelectedVessel(null)} />
      )}
    </div>
  );
}