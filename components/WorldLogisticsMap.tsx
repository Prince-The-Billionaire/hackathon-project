/**
 * ============================================================================
 * ZEON SYSTEMS - INTERMODAL MERCATOR GEOGRAPHIC MAP PROJECTOR (V2.2 - SCHEMAS SYNC)
 * ============================================================================
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { VesselUI, PortUI } from "../types/types";
import { 
  Ship, 
  Plane, 
  Truck, 
  Train, 
  Anchor, 
  Compass, 
  Info,
  MapPin
} from "lucide-react";

// Explicitly define the interface properties to mirror the backend API reference precisely
interface ExtendedVesselUI extends Omit<VesselUI, 'currentLat' | 'currentLng'> {
  readableCallSign?: string;
  type?: string;
  currentLat: string | number;
  currentLng: string | number;
  currentHeadingDegrees?: string | number;
  heading: number;
  carrier?: {
    id: string;
    name: string;
  };
}

interface MapProps {
  vessels: ExtendedVesselUI[];
  ports?: PortUI[];
  onVesselClick: (vsl: ExtendedVesselUI) => void;
}

const DEFAULT_PORTS: PortUI[] = [
  { id: "LOS", name: "Lagos Apapa Port", x: 501, y: 282, distToLagos: "0 NM", etaLagos: "Local Hub" },
  { id: "NGSEM", name: "Seme Border Checkpoint", x: 494, y: 282, distToLagos: "45 NM", etaLagos: "3 Hours" },
  { id: "RTM", name: "Port of Rotterdam", x: 502, y: 136, distToLagos: "4,200 NM", etaLagos: "12 Days" },
  { id: "DEHAM", name: "Port of Hamburg", x: 519, y: 133, distToLagos: "4,400 NM", etaLagos: "13 Days" },
  { id: "IST", name: "Port of Istanbul", x: 544, y: 169, distToLagos: "4,600 NM", etaLagos: "14 Days" },
  { id: "CNSHA", name: "Port of Shanghai", x: 792, y: 236, distToLagos: "8,100 NM", etaLagos: "24 Days" },
  { id: "USNYC", name: "Port of New York", x: 265, y: 172, distToLagos: "4,950 NM", etaLagos: "16 Days" },
  { id: "BRSSZ", name: "Port of Santos", x: 338, y: 349, distToLagos: "4,100 NM", etaLagos: "13 Days" }
];

export default function WorldLogisticsMap({ vessels, ports = [], onVesselClick }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredVessel, setHoveredVessel] = useState<ExtendedVesselUI | null>(null);
  const [hoveredPort, setHoveredPort] = useState<(PortUI & { xPos: number; yPos: number }) | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1012, height: 569 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: width || 1012, height: height || 569 });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const activePorts = ports.length > 0 ? ports : DEFAULT_PORTS;

  const getCoordinatesFromGps = (latVal: string | number, lngVal: string | number) => {
    const lat = typeof latVal === "string" ? parseFloat(latVal) : latVal;
    const lng = typeof lngVal === "string" ? parseFloat(lngVal) : lngVal;

    if (isNaN(lat) || isNaN(lng)) {
      return { xPercent: 50, yPercent: 50 };
    }

    const mapWidthBase = 1012;
    const x = ((lng + 180) * (mapWidthBase / 360));

    const mapHeightBase = 569;
    const latRad = (lat * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    
    const maxMerc = Math.log(Math.tan(Math.PI / 4 + (85 * Math.PI) / 360));
    const y = (mapHeightBase / 2) - (mapHeightBase * mercN) / (2 * maxMerc) + 40; 

    return {
      xPercent: (x / mapWidthBase) * 100,
      yPercent: (y / mapHeightBase) * 100
    };
  };

  const renderVesselIcon = (type?: string) => {
    const assetClass = "h-4 w-4 tracking-normal stroke-[2.5]";
    switch (type?.toUpperCase()) {
      case "PLANE":
      case "AIRCRAFT":
        return <Plane className={`${assetClass} text-sky-400 -rotate-45`} />;
      case "TRUCK":
      case "VEHICLE":
        return <Truck className={`${assetClass} text-amber-400`} />;
      case "TRAIN":
      case "RAILWAY":
        return <Train className={`${assetClass} text-emerald-400`} />;
      case "SHIP":
      case "VESSEL":
      default:
        return <Ship className={`${assetClass} text-blue-400`} />;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-[#0b1329] select-none rounded-2xl flex"
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] z-10" />

      {/* SVG Projection Wireframe Texture */}
      <div className="absolute inset-0 w-full h-full opacity-45 select-none pointer-events-none mix-blend-screen z-0">
        <svg className="w-full h-full stroke-slate-800 fill-slate-950/80 stroke-[0.5]" viewBox="0 0 1012 569">
          <rect width="1012" height="569" fill="#080e1e" stroke="none" />
          <path d="M150,150 Q300,100 450,200 T800,150 T950,300" fill="none" className="stroke-slate-900/60 stroke-[1] stroke-dashed" />
          <path d="M100,400 Q400,350 600,450 T900,400" fill="none" className="stroke-slate-900/60 stroke-[1] stroke-dashed" />
        </svg>
      </div>

      {/* Ports Layer Anchor Points */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {activePorts.map((port) => {
          const xPos = (port.x / 1012) * 100;
          const yPos = (port.y / 569) * 100;

          return (
            <button
              key={port.id}
              type="button"
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
              style={{ left: `${xPos}%`, top: `${yPos}%` }}
              onMouseEnter={() => setHoveredPort({ ...port, xPos: (port.x / 1012) * dimensions.width, yPos: (port.y / 569) * dimensions.height })}
              onMouseLeave={() => setHoveredPort(null)}
            >
              <div className="relative flex items-center justify-center">
                <Anchor className="h-3 w-3 text-slate-400 group-hover:text-blue-400 group-hover:scale-125 transition-all drop-shadow-[0_0_4px_rgba(59,130,246,0.4)]" />
                <span className="absolute top-4 text-[8px] font-mono font-bold text-slate-500 tracking-wider uppercase opacity-0 group-hover:opacity-100 bg-slate-950/90 px-1 rounded border border-slate-800 transition-opacity whitespace-nowrap">
                  {port.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Vessels Telemetry Layer */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {vessels.map((vsl) => {
          const { xPercent, yPercent } = getCoordinatesFromGps(vsl.currentLat, vsl.currentLng);

          return (
            <div
              key={vsl.id}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
            >
              <button
                type="button"
                onClick={() => onVesselClick(vsl)}
                onMouseEnter={() => setHoveredVessel(vsl)}
                onMouseLeave={() => setHoveredVessel(null)}
                className="relative p-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/80 shadow-2xl transition-all hover:scale-110 flex items-center justify-center cursor-pointer focus:outline-none"
              >
                {renderVesselIcon(vsl.type)}

                <span className="absolute -inset-0.5 rounded-xl bg-blue-500/10 animate-ping opacity-70 pointer-events-none" />
                
                <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-[8px] font-mono font-black tracking-wider text-slate-400 group-hover:text-white bg-slate-950/80 border border-slate-800 px-1 py-0.5 rounded whitespace-nowrap opacity-60 group-hover:opacity-100 transition-all shadow-md">
                  {vsl.readableCallSign || vsl.name?.substring(0, 5).toUpperCase() || "NODE"}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Hover Tooltip Overlay */}
      {hoveredVessel && (
        <div className="absolute bottom-4 left-4 z-50 rounded-xl border border-slate-800 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-md w-60 pointer-events-none">
          <div className="flex items-center justify-between gap-2">
            <h5 className="text-[11px] font-mono font-black text-white tracking-wider flex items-center gap-1.5 uppercase">
              {renderVesselIcon(hoveredVessel.type)}
              <span>{hoveredVessel.readableCallSign || hoveredVessel.name}</span>
            </h5>
            <span className="text-[8px] font-mono bg-blue-950 text-blue-400 border border-blue-900/50 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
              {hoveredVessel.type || "SHIP"}
            </span>
          </div>

          <div className="h-[1px] w-full bg-slate-800 my-2" />

          <div className="space-y-1.5 text-[10px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Operator Hub:</span>
              <span className="font-bold text-slate-200">{hoveredVessel.carrierName || hoveredVessel.carrier?.name || "Zeon Logistics"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ETA Target:</span>
              <span className="font-semibold text-blue-400 font-mono uppercase">{hoveredVessel.eta || "In Transit"}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 px-1.5 py-1 rounded border border-slate-800/40 font-mono text-[9px] mt-1 text-slate-400">
              <Compass className="h-2.5 w-2.5 text-slate-500 shrink-0" />
              <span>LAT: {parseFloat(String(hoveredVessel.currentLat)).toFixed(4)}</span>
              <span>•</span>
              <span>LNG: {parseFloat(String(hoveredVessel.currentLng)).toFixed(4)}</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[8px] font-mono text-slate-500 uppercase tracking-widest pt-0.5">
            <Info className="h-2.5 w-2.5 text-blue-500" />
            <span>Click matrix item to view logs</span>
          </div>
        </div>
      )}

      {/* Hover Port Tooltip */}
      {hoveredPort && (
        <div 
          className="absolute z-50 pointer-events-none rounded-xl border border-slate-800 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md text-xs"
          style={{
            left: `${Math.min(hoveredPort.xPos + 15, dimensions.width - 170)}px`,
            top: `${Math.min(hoveredPort.yPos - 40, dimensions.height - 110)}px`,
          }}
        >
          <div className="space-y-1 w-36">
            <div className="flex items-center gap-1 text-slate-200 font-bold text-[10px] uppercase tracking-wide">
              <MapPin className="h-3 w-3 text-red-400 shrink-0" />
              <span className="truncate">{hoveredPort.name}</span>
            </div>
            <div className="h-[1px] w-full bg-slate-800 my-1" />
            <div className="flex justify-between items-center text-[9px] font-mono">
              <span className="text-slate-400">To Lagos:</span>
              <span className="text-blue-400 font-bold">{hoveredPort.distToLagos}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono">
              <span className="text-slate-400">Transit:</span>
              <span className="text-slate-300 font-medium">{hoveredPort.etaLagos}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}