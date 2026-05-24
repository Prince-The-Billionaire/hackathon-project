"use client";

import React, { useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import MarketplaceHub from "@/components/MarketplaceHub";
import VesselDetailsModal from "@/components/VesselDetailsModal";
import { THIRTY_MOCK_STORES } from "@/data/marketplaceData";
import { Vessel } from "@/types/types";

export default function MarketplacePage() {
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);

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
      {/* Added overflow-y-auto so your marketplace handles long grids perfectly while keeping identical spatial padding */}
      <main className="w-full h-full pt-20 pb-24 px-4 md:pl-28 md:pt-6 md:pb-6 md:pr-6 relative z-10 flex-1 overflow-y-auto scrollbar-thin">
        <div className="w-full h-auto">
          <MarketplaceHub stores={THIRTY_MOCK_STORES} />
        </div>
      </main>

      {/* 3. CONTEXTUAL OVERLAY MODALS */}
      {selectedVessel && (
        <VesselDetailsModal vessel={selectedVessel} onClose={() => setSelectedVessel(null)} />
      )}
    </div>
  );
}