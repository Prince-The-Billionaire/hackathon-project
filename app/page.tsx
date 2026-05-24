"use client";

import React, { useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import WorldLogisticsMap from "@/components/WorldLogisticsMap";
import VesselDetailsModal from "@/components/VesselDetailsModal";
import { Vessel } from "@/types/types";

const MOCK_VESSELS: Vessel[] = [
  {
    id: "VSL-001",
    name: "Evergreen Horizon",
    carrier: "COSCO Shipping Lines",
    eta: "May 28, 2026 (In 6 Days)",
    load: "14,200 TEU (92% Capacity)",
    speed: "19.5 Knots",
    weather: "Clear Sea / Light Swell (1.2m)",
    purchasePosition: "Bay 04, Row 02, Tier 82 (Lower Hold)",
    routePath: "M 780 220 Q 620 420 460 310",
    startCoords: { x: 780, y: 220 },
    endCoords: { x: 460, y: 310 }
  },
  {
    id: "VSL-002",
    name: "Maersk Voyager",
    carrier: "Maersk A/S",
    eta: "June 03, 2026 (In 12 Days)",
    load: "18,500 TEU (78% Capacity)",
    speed: "21.2 Knots",
    weather: "Moderate Trade Winds",
    purchasePosition: "Bay 12, Row 04, Tier 03 (Main Deck)",
    routePath: "M 475 120 Q 420 220 460 310",
    startCoords: { x: 475, y: 120 },
    endCoords: { x: 460, y: 310 }
  }
];

export default function MainDashboardPage() {
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

      {/* 2. DYNAMIC CONTENT VIEWPORT (MAIN PAGE = WORLD MAP VIEW) */}
      <main className="w-full h-full relative z-10 flex-1">
        {/* Padding offset helper: md:pl-24 leaves room so the left desktop sidebar doesn't overlap the map */}
        <div className="w-full h-full pt-16 pb-24 px-2 md:pl-24 md:pt-5 md:pb-3 md:pr-3">
          <WorldLogisticsMap vessels={MOCK_VESSELS} onVesselClick={setSelectedVessel} />
        </div>
      </main>

      {/* 3. CONTEXTUAL OVERLAY MODALS */}
      {selectedVessel && (
        <VesselDetailsModal vessel={selectedVessel} onClose={() => setSelectedVessel(null)} />
      )}
    </div>
  );
}