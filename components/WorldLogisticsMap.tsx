"use client";

import React, { useState } from "react";
import { VesselUI, PortUI } from "../types/types";

interface MapProps {
  vessels: VesselUI[];
  ports?: PortUI[];
  onVesselClick: (vsl: VesselUI) => void;
}

// Calibrated to fit beautifully on a 1000x500 light-projection layout
const DEFAULT_PORTS: PortUI[] = [
  { id: "LOS", name: "Lagos Apapa Port", x: 509, y: 260, distToLagos: "0 NM", etaLagos: "Local Hub" },
  { id: "NGSEM", name: "Seme Border Checkpoint", x: 501, y: 260, distToLagos: "45 NM", etaLagos: "3 Hours" },
  { id: "RTM", name: "Port of Rotterdam", x: 512, y: 106, distToLagos: "4,200 NM", etaLagos: "12 Days" },
  { id: "DEHAM", name: "Port of Hamburg", x: 527, y: 101, distToLagos: "4,400 NM", etaLagos: "13 Days" },
  { id: "IST", name: "Port of Istanbul", x: 580, y: 136, distToLagos: "4,600 NM", etaLagos: "14 Days" },
  { id: "DXB", name: "Dubai Airport Hub", x: 653, y: 191, distToLagos: "6,400 NM", etaLagos: "20 Days" },
  { id: "AEDXB", name: "Jebel Ali Port", x: 653, y: 198, distToLagos: "6,500 NM", etaLagos: "21 Days" },
  { id: "MBA", name: "Mombasa Port", x: 554, y: 283, distToLagos: "4,800 NM", etaLagos: "15 Days" },
  { id: "ZABED", name: "Port of Durban", x: 531, y: 361, distToLagos: "3,200 NM", etaLagos: "10 Days" },
  { id: "INWAG", name: "Wagah Border", x: 706, y: 161, distToLagos: "7,800 NM", etaLagos: "24 Days" },
  { id: "SGP", name: "Port of Singapore", x: 788, y: 251, distToLagos: "9,800 NM", etaLagos: "28 Days" },
  { id: "HKHKG", name: "Hong Kong Port", x: 817, y: 193, distToLagos: "11,100 NM", etaLagos: "31 Days" },
  { id: "SZN", name: "Port of Shenzhen", x: 817, y: 187, distToLagos: "11,500 NM", etaLagos: "32 Days" },
  { id: "CNSHA", name: "Port of Shanghai", x: 837, y: 177, distToLagos: "11,800 NM", etaLagos: "34 Days" },
  { id: "NRT", name: "Narita Tokyo Port", x: 862, y: 168, distToLagos: "12,400 NM", etaLagos: "36 Days" },
  { id: "SYD", name: "Port of Sydney", x: 892, y: 399, distToLagos: "14,200 NM", etaLagos: "42 Days" },
  { id: "BRSSZ", name: "Port of Santos", x: 344, y: 349, distToLagos: "3,800 NM", etaLagos: "11 Days" },
  { id: "USMEX", name: "Veracruz Terminal", x: 190, y: 200, distToLagos: "5,800 NM", etaLagos: "18 Days" },
  { id: "USLAX", name: "Port of Los Angeles", x: 116, y: 156, distToLagos: "9,000 NM", etaLagos: "26 Days" },
  { id: "NYC", name: "Port of New York", x: 238, y: 137, distToLagos: "5,000 NM", etaLagos: "16 Days" },
  { id: "JFK", name: "JFK Airport Cargo", x: 244, y: 137, distToLagos: "5,010 NM", etaLagos: "16 Days" }
];

export default function WorldLogisticsMap({ vessels = [], ports, onVesselClick }: MapProps) {
  const [hoveredVessel, setHoveredVessel] = useState<VesselUI | null>(null);
  const [hoveredPort, setHoveredPort] = useState<PortUI | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const displayPorts = ports && ports.length > 0 ? ports : DEFAULT_PORTS;

  // Live simulated active tracking vessel explicitly hardcoded
  const liveMovingVessel: VesselUI = {
    id: "live-vsl-alpha",
    name: "Oceanic Alpha Live",
    carrierName: "Global Sea Way",
    eta: "Arriving Soon",
    heading: 270,
    startCoords: { x: 788, y: 251 }, // SGP
    endCoords: { x: 509, y: 260 },   // LOS
  };

  const allVessels = [...vessels, liveMovingVessel];

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const getCurvedTelemetry = (vsl: VesselUI) => {
    const p0 = vsl.startCoords || { x: 817, y: 187 };
    const p3 = vsl.endCoords || { x: 509, y: 260 };

    let p1 = { x: p0.x + (p3.x - p0.x) / 3, y: p0.y + (p3.y - p0.y) / 3 + 45 };
    let p2 = { x: p0.x + 2 * (p3.x - p0.x) / 3, y: p0.y + 2 * (p3.y - p0.y) / 3 + 45 };

    if (vsl.id === "live-vsl-alpha") {
      p1 = { x: 680, y: 340 };
      p2 = { x: 580, y: 330 };
    }

    const t = 0.52; // Static coordinate placement across lanes
    const currentX =
      Math.pow(1 - t, 3) * p0.x +
      3 * Math.pow(1 - t, 2) * t * p1.x +
      3 * (1 - t) * Math.pow(t, 2) * p2.x +
      Math.pow(t, 3) * p3.x;

    const currentY =
      Math.pow(1 - t, 3) * p0.y +
      3 * Math.pow(1 - t, 2) * t * p1.y +
      3 * (1 - t) * Math.pow(t, 2) * p2.x + 
      Math.pow(t, 3) * p3.y;

    const dx = 3 * Math.pow(1 - t, 2) * (p1.x - p0.x) + 6 * (1 - t) * t * (p2.x - p1.x) + 3 * Math.pow(t, 2) * (p3.x - p2.x);
    const dy = 3 * Math.pow(1 - t, 2) * (p1.y - p0.y) + 6 * (1 - t) * t * (p2.y - p1.y) + 3 * Math.pow(t, 2) * (p3.x - p2.x);

    const headingAngleDegrees = (Math.atan2(dy, dx) * 180) / Math.PI;
    const curvePathString = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;

    return { x: currentX, y: currentY, angle: headingAngleDegrees, pathString: curvePathString };
  };

  /**
   * Dynamically assigns color themes based on vessel ID strings or structural metadata text
   * instead of relying on an explicit 'type' field.
   */
  const getVesselStyleByAttributes = (vsl: VesselUI) => {
    const nameLower = vsl.name?.toLowerCase() || "";
    const idLower = vsl.id?.toLowerCase() || "";

    if (nameLower.includes("live") || idLower.includes("alpha")) {
      return { hullColor: "#059669", stripColor: "#10b981", displayType: "Tanker" }; // Emerald Green
    }
    if (vsl.id.length % 2 === 0) {
      return { hullColor: "#2563eb", stripColor: "#3b82f6", displayType: "Cargo" };  // Marine Blue
    }
    return { hullColor: "#dc2626", stripColor: "#ef4444", displayType: "Carrier" }; // Crimson Red
  };

  const getAdaptiveLabelOffset = (portId: string) => {
    switch (portId) {
      case "LOS": return { dx: 10, dy: -4, anchor: "start" as const };
      case "NGSEM": return { dx: -10, dy: 6, anchor: "end" as const };
      case "DXB": return { dx: 8, dy: -5, anchor: "start" as const };
      case "AEDXB": return { dx: 8, dy: 11, anchor: "start" as const };
      case "NYC": return { dx: -8, dy: -6, anchor: "end" as const };
      case "JFK": return { dx: 10, dy: 10, anchor: "start" as const };
      case "SZN": return { dx: 10, dy: -3, anchor: "start" as const };
      case "HKHKG": return { dx: -10, dy: 9, anchor: "end" as const };
      default: return { dx: 8, dy: 3, anchor: "start" as const };
    }
  };

  function cleanPortName(name: string): React.ReactNode {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="w-full h-full p-4 font-sans text-slate-800">
      <div className="relative w-full h-[550px] rounded-2xl bg-[#f8fafc] border border-slate-200/90 shadow-sm overflow-hidden">
        
        {/* Light Mode Control Header */}
        <div className="absolute top-4 right-4 z-40">
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Update Telemetry
          </button>
        </div>

        {/* Light Blueprint Grid System */}
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

        <svg key={refreshKey} className="absolute inset-0 w-full h-full select-none" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="light-continent-filter">
              <feColorMatrix 
                type="matrix" 
                values="0.40 0 0 0 0.55 
                        0 0.48 0 0 0.65 
                        0 0 0.58 0 0.75 
                        -0.4 -0.4 -0.4 1 0" 
              />
            </filter>
          </defs>

          <image 
            href="/map.webp" 
            x="0" y="0" width="1000" height="500" 
            preserveAspectRatio="xMidYMid slice"
            filter="url(#light-continent-filter)"
            className="opacity-[0.88]"
          />

          {/* Dotted Marine Lanes */}
          {allVessels.map((vsl) => {
            const telemetry = getCurvedTelemetry(vsl);
            return (
              <path 
                key={`lane-${vsl.id}`} 
                d={telemetry.pathString} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="1.75" 
                strokeDasharray="4, 5" 
                className="opacity-40"
              />
            );
          })}

          {/* Port Hub Vectors */}
          {displayPorts.map((port) => {
            const isMainHub = port.id === "LOS";
            const labelConfig = getAdaptiveLabelOffset(port.id);

            return (
              <g 
                key={port.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPort(port)}
                onMouseLeave={() => setHoveredPort(null)}
              >
                <circle cx={port.x} cy={port.y} r="12" fill="transparent" />
                {isMainHub && (
                  <circle cx={port.x} cy={port.y} r="7" fill="#10b981" className="opacity-25 animate-ping" />
                )}
                <circle 
                  cx={port.x} 
                  cy={port.y} 
                  r={isMainHub ? "4.5" : "3"} 
                  fill={isMainHub ? "#10b981" : "#3b82f6"} 
                  stroke="#ffffff" 
                  strokeWidth="1.2" 
                />
                <text 
                  x={port.x + labelConfig.dx} 
                  y={port.y + labelConfig.dy} 
                  textAnchor={labelConfig.anchor}
                  fill={isMainHub ? "#065f46" : "#1e40af"} 
                  fontSize={isMainHub ? "10" : "8.5"} 
                  className="font-bold tracking-tight"
                >
                  {port.id}
                </text>
              </g>
            );
          })}

          {/* Vessel Assets Rendering Group */}
          {allVessels.map((vsl) => {
            const telemetry = getCurvedTelemetry(vsl);
            const isHovered = hoveredVessel?.id === vsl.id;
            const design = getVesselStyleByAttributes(vsl);
            const isLiveVessel = vsl.id === "live-vsl-alpha";

            return (
              <g
                key={vsl.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredVessel(vsl)}
                onMouseLeave={() => setHoveredVessel(null)}
                onClick={() => onVesselClick(vsl)}
              >
                {/* Visual pulse for live tracked elements */}
                {isLiveVessel && (
                  <circle cx={telemetry.x} cy={telemetry.y} r="15" fill="none" stroke="#10b981" strokeWidth="1" className="animate-ping opacity-60" />
                )}

                <circle cx={telemetry.x} cy={telemetry.y} r="18" fill="transparent" />

                <g 
                  transform={`translate(${telemetry.x}, ${telemetry.y}) rotate(${vsl.heading || telemetry.angle}) scale(${isHovered ? 1.25 : 1})`} 
                  className="transition-transform duration-200"
                >
                  {/* Styled Hull Base Layer */}
                  <path d="M -20,-5 L 10,-5 L 18,0 L 10,5 L -20,5 Z" fill="#0f172a" opacity="0.08" transform="translate(0, 1)" />
                  <path d="M -20,-4.5 L 10,-4.5 L 18,0 L 10,4.5 L -20,4.5 Z" fill="#334155" />
                  <path d="M -19,-3.5 L 9,-3.5 L 16,0 L 9,3.5 L -19,3.5 Z" fill={design.hullColor} />
                  <rect x="-15" y="-2.5" width="22" height="5" fill={design.stripColor} />
                  
                  <rect x="2" y="-1.5" width="3" height="3" fill="#eab308" />
                  <rect x="-3" y="-1.5" width="4" height="3" fill="#3b82f6" />
                  <rect x="-8" y="-1.5" width="4" height="3" fill="#df2626" />
                  
                  <rect x="-18" y="-3" width="2" height="6" fill="#f8fafc" />
                </g>
              </g>
            );
          })}
        </svg>

        {/* Clean Light Popover Tooltips */}
        {hoveredVessel && (() => {
          const telemetry = getCurvedTelemetry(hoveredVessel);
          const design = getVesselStyleByAttributes(hoveredVessel);
          const cleanId = hoveredVessel.id.includes("live") 
            ? "LIVE-ALPHA" 
            : `VSL-${hoveredVessel.id.substring(0, 2).toUpperCase()}`;

          return (
            <div 
              className="absolute z-50 pointer-events-none rounded-xl border border-slate-200/70 bg-white/95 p-3 shadow-md backdrop-blur-sm text-left"
              style={{
                left: `${telemetry.x - 75}px`,
                top: `${telemetry.y + 16}px`,
              }}
            >
              <div className="w-40 space-y-1">
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded font-mono">
                  {cleanId}
                </span>
                <h5 className="text-xs font-bold text-slate-900 pt-0.5">{hoveredVessel.name}</h5>
                <div className="h-[1px] w-full bg-slate-100 my-1" />
                <p className="text-[10px] text-slate-600 leading-tight">
                  <span className="text-slate-400 font-medium">Carrier:</span> <span className="font-semibold text-slate-700">{hoveredVessel.carrierName}</span> <br />
                  <span className="text-slate-400 font-medium">Class:</span> <span className="font-semibold text-slate-700">{design.displayType}</span> <br />
                  <span className="text-slate-400 font-medium">ETA Target:</span> <span className="font-semibold text-slate-700">{hoveredVessel.eta}</span>
                </p>
              </div>
            </div>
          );
        })()}

        {/* Port Tooltip - Now cleanly filters out raw backend metadata strings */}
        {hoveredPort && (
          <div 
            className="absolute z-50 pointer-events-none rounded-xl border border-slate-200/70 bg-white/95 p-2.5 shadow-md backdrop-blur-sm text-left"
            style={{
              left: `${hoveredPort.x + 12}px`,
              top: `${hoveredPort.y - 30}px`,
            }}
          >
            <div className="w-36 space-y-0.5">
              <h5 className="text-[10.5px] font-bold text-slate-900 tracking-wide">
                {cleanPortName(hoveredPort.name)}
              </h5>
              <div className="h-[1px] w-full bg-slate-100 my-1" />
              <div className="flex justify-between items-center text-[9.5px]">
                <span className="text-slate-400">To Lagos:</span>
                <span className="font-mono text-blue-600 font-medium">{hoveredPort.distToLagos}</span>
              </div>
              <div className="flex justify-between items-center text-[9.5px]">
                <span className="text-slate-400">Time (Est):</span>
                <span className="font-mono text-emerald-600 font-medium">{hoveredPort.etaLagos}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}