"use client";

import React, { useState, useEffect } from "react";
import { VesselUI, PortUI } from "../types/types";

interface MapProps {
  vessels: VesselUI[];
  ports?: PortUI[];
  onVesselClick: (vsl: VesselUI) => void;
}

// Fixed: Grounded with real lat/lng coordinates to pin them perfectly to the map projection textures
const DEFAULT_PORTS: PortUI[] = [
  { id: "LOS", name: "Lagos Apapa Port", x: 501, y: 282, distToLagos: "0 NM", etaLagos: "Local Hub" },
  { id: "NGSEM", name: "Seme Border Checkpoint", x: 494, y: 282, distToLagos: "45 NM", etaLagos: "3 Hours" },
  { id: "RTM", name: "Port of Rotterdam", x: 502, y: 136, distToLagos: "4,200 NM", etaLagos: "12 Days" },
  { id: "DEHAM", name: "Port of Hamburg", x: 519, y: 133, distToLagos: "4,400 NM", etaLagos: "13 Days" },
  { id: "IST", name: "Port of Istanbul", x: 544, y: 169, distToLagos: "4,600 NM", etaLagos: "14 Days" },
  { id: "DXB", name: "Dubai Airport Hub", x: 645, y: 211, distToLagos: "6,400 NM", etaLagos: "20 Days" },
  { id: "AEDXB", name: "Jebel Ali Port", x: 645, y: 219, distToLagos: "6,500 NM", etaLagos: "21 Days" },
  { id: "MBA", name: "Mombasa Port", x: 546, y: 293, distToLagos: "4,800 NM", etaLagos: "15 Days" },
  { id: "ZABED", name: "Port of Durban", x: 535, y: 383, distToLagos: "3,200 NM", etaLagos: "10 Days" },
  { id: "INWAG", name: "Wagah Border", x: 728, y: 191, distToLagos: "7,800 NM", etaLagos: "24 Days" },
  { id: "SGP", name: "Port of Singapore", x: 780, y: 310, distToLagos: "9,800 NM", etaLagos: "28 Days" },
  { id: "HKHKG", name: "Hong Kong Port", x: 825, y: 226, distToLagos: "11,100 NM", etaLagos: "31 Days" },
  { id: "SZN", name: "Port of Shenzhen", x: 825, y: 218, distToLagos: "11,500 NM", etaLagos: "32 Days" },
  { id: "CNSHA", name: "Port of Shanghai", x: 843, y: 210, distToLagos: "11,800 NM", etaLagos: "34 Days" },
  { id: "NRT", name: "Narita Tokyo Port", x: 881, y: 201, distToLagos: "12,400 NM", etaLagos: "36 Days" },
  { id: "SYD", name: "Port of Sydney", x: 898, y: 416, distToLagos: "14,200 NM", etaLagos: "42 Days" },
  { id: "BRSSZ", name: "Port of Santos", x: 341, y: 344, distToLagos: "3,800 NM", etaLagos: "11 Days" },
  { id: "USMEX", name: "Veracruz Terminal", x: 233, y: 225, distToLagos: "5,800 NM", etaLagos: "18 Days" },
  { id: "USLAX", name: "Port of Los Angeles", x: 180, y: 196, distToLagos: "9,000 NM", etaLagos: "26 Days" },
  { id: "NYC", name: "Port of New York", x: 286, y: 165, distToLagos: "5,000 NM", etaLagos: "16 Days" },
  { id: "JFK", name: "JFK Airport Cargo", x: 297, y: 165, distToLagos: "5,010 NM", etaLagos: "16 Days" }
];

export default function WorldLogisticsMap({ vessels = [], ports, onVesselClick }: MapProps) {
  const [hoveredVessel, setHoveredVessel] = useState<VesselUI | null>(null);
  const [hoveredPort, setHoveredPort] = useState<PortUI | null>(null);
  const [animationTick, setAnimationTick] = useState(0);

  const displayPorts = ports && ports.length > 0 ? ports : DEFAULT_PORTS;

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationTick((prev) => (prev >= 100 ? 0 : prev + 0.08));
    }, 30);
    return () => clearInterval(timer);
  }, []);

  const getCurvedTelemetry = (vsl: VesselUI) => {
    const t = (animationTick * 0.4 + 20) / 100;
    const p0 = vsl.startCoords || { x: 825, y: 218 };
    const p3 = vsl.endCoords || { x: 501, y: 282 };

    let p1 = { x: p0.x, y: p0.y };
    let p2 = { x: p3.x, y: p3.y };

    if (vsl.name?.toLowerCase().includes("shenzhen") || vsl.id === "vessel_123") {
      p1 = { x: 740, y: 410 };
      p2 = { x: 490, y: 430 };
    } else if (vsl.name?.toLowerCase().includes("rotterdam")) {
      p1 = { x: 380, y: 180 };
      p2 = { x: 380, y: 300 };
    } else {
      p1 = { x: p0.x + (p3.x - p0.x) / 3, y: p0.y + (p3.y - p0.y) / 3 + 40 };
      p2 = { x: p0.x + 2 * (p3.x - p0.x) / 3, y: p0.y + 2 * (p3.y - p0.y) / 3 + 40 };
    }

    const currentX =
      Math.pow(1 - t, 3) * p0.x +
      3 * Math.pow(1 - t, 2) * t * p1.x +
      3 * (1 - t) * Math.pow(t, 2) * p2.x +
      Math.pow(t, 3) * p3.x;

    const currentY =
      Math.pow(1 - t, 3) * p0.y +
      3 * Math.pow(1 - t, 2) * t * p1.y +
      3 * (1 - t) * Math.pow(t, 2) * p2.y +
      Math.pow(t, 3) * p3.y;

    const dx =
      3 * Math.pow(1 - t, 2) * (p1.x - p0.x) +
      6 * (1 - t) * t * (p2.x - p1.x) +
      3 * Math.pow(t, 2) * (p3.x - p2.x);
      
    const dy =
      3 * Math.pow(1 - t, 2) * (p1.y - p0.y) +
      6 * (1 - t) * t * (p2.y - p1.y) +
      3 * Math.pow(t, 2) * (p3.y - p2.y);

    const headingAngleDegrees = (Math.atan2(dy, dx) * 180) / Math.PI;
    const curvePathString = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;

    return { x: currentX, y: currentY, angle: headingAngleDegrees, pathString: curvePathString };
  };

  /**
   * Adaptive calculation rule to dynamically shift text tags when nodes are close.
   * This handles localized clusters cleanly (e.g. West African cross-border corridors, Dubai Airport/Seaport).
   */
  const getAdaptiveLabelOffset = (portId: string) => {
    switch (portId) {
      case "LOS":
        return { dx: 10, dy: -4, anchor: "start" as const };
      case "NGSEM":
        return { dx: -10, dy: 4, anchor: "end" as const };
      case "DXB":
        return { dx: 8, dy: -5, anchor: "start" as const };
      case "AEDXB":
        return { dx: 8, dy: 11, anchor: "start" as const };
      case "NYC":
        return { dx: -8, dy: -6, anchor: "end" as const };
      case "JFK":
        return { dx: 10, dy: 10, anchor: "start" as const };
      case "SZN":
        return { dx: 10, dy: -3, anchor: "start" as const };
      case "HKHKG":
        return { dx: -10, dy: 9, anchor: "end" as const };
      default:
        return { dx: 8, dy: 3, anchor: "start" as const };
    }
  };

  return (
    <div className="w-full h-full p-4">
      <div className="relative w-full h-full rounded-2xl bg-[#f8fafc]">
        <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <svg className="absolute inset-0 w-full h-full select-none" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="blue-continent-filter">
              <feColorMatrix 
                type="matrix" 
                values="0.25 0 0 0 0.15 
                        0 0.45 0 0 0.30 
                        0 0 0.75 0 0.55 
                        -1 -1 -1 1 1" 
              />
            </filter>
          </defs>

          <image 
            href="/map.webp" 
            x="0" y="0" width="1000" height="500" 
            preserveAspectRatio="xMidYMid slice"
            filter="url(#blue-continent-filter)"
            className="opacity-95"
          />

          {/* Shipping Lane Paths */}
          {vessels.map((vsl) => {
            const telemetry = getCurvedTelemetry(vsl);
            return (
              <path 
                key={`lane-${vsl.id}`} 
                d={telemetry.pathString} 
                fill="none" 
                stroke="#2563eb" 
                strokeWidth="2.5" 
                strokeDasharray="6, 5" 
                className="opacity-35"
              />
            );
          })}

          {/* Logistics Terminals */}
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
                <circle cx={port.x} cy={port.y} r="14" fill="transparent" />
                {isMainHub && (
                  <circle cx={port.x} cy={port.y} r="8" fill="#16a34a" className="opacity-30 animate-ping" />
                )}
                <circle 
                  cx={port.x} cy={port.y} 
                  r={isMainHub ? "5" : "3.5"} 
                  fill={isMainHub ? "#16a34a" : "#2563eb"} 
                  stroke="#ffffff" 
                  strokeWidth="1.5" 
                />
                <text 
                  x={port.x + labelConfig.dx} 
                  y={port.y + labelConfig.dy} 
                  textAnchor={labelConfig.anchor}
                  fill={isMainHub ? "#14532d" : "#1e3a8a"} 
                  fontSize={isMainHub ? "11" : "9"} 
                  className="font-sans font-bold tracking-tight drop-shadow-sm"
                >
                  {port.id}
                </text>
              </g>
            );
          })}

          {/* Tracking Carrier Vessel Graphics */}
          {vessels.map((vsl) => {
            const telemetry = getCurvedTelemetry(vsl);
            const isHovered = hoveredVessel?.id === vsl.id;

            return (
              <g
                key={vsl.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredVessel(vsl)}
                onMouseLeave={() => setHoveredVessel(null)}
                onClick={() => onVesselClick(vsl)}
              >
                <circle cx={telemetry.x} cy={telemetry.y} r="22" fill="#2563eb" className="opacity-0 hover:opacity-5 transition-opacity" />

                <g 
                  transform={`translate(${telemetry.x}, ${telemetry.y}) rotate(${vsl.heading || telemetry.angle}) scale(${isHovered ? 1.35 : 1.1})`} 
                  className="transition-transform duration-200"
                >
                  <path d="M -26,-6 L 14,-6 L 24,0 L 14,6 L -26,6 Z" fill="#0f172a" opacity="0.12" transform="translate(0, 1.5)" />
                  <path d="M -26,-5.5 L 14,-5.5 L 24,0 L 14,5.5 L -26,5.5 Z" fill="#1e293b" />
                  <path d="M -25,-4.5 L 13,-4.5 L 21,0 L 13,4.5 L -25,4.5 Z" fill="#dc2626" />
                  <rect x="-21" y="-3.5" width="29" height="7" fill="#475569" />

                  <rect x="3" y="-2.5" width="4" height="2" fill="#eab308" />
                  <rect x="3" y="0.5" width="4" height="2" fill="#2563eb" />
                  <rect x="-4" y="-2.5" width="6" height="2" fill="#2563eb" />
                  <rect x="-4" y="0.5" width="6" height="2" fill="#dc2626" />
                  <rect x="-11" y="-2.5" width="6" height="2" fill="#16a34a" />
                  <rect x="-11" y="0.5" width="6" height="2" fill="#eab308" />
                  <rect x="-18" y="-2.5" width="6" height="2" fill="#ea580c" />
                  <rect x="-18" y="0.5" width="6" height="2" fill="#1e3a8a" />

                  <rect x="-24" y="-4" width="3" height="8" fill="#f8fafc" />
                  <rect x="-23" y="-2" width="1" height="4" fill="#020617" />
                  <line x1="-22" y1="-5.5" x2="-22" y2="5.5" stroke="#f8fafc" strokeWidth="0.75" />
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltips */}
        {hoveredVessel && (
          <div 
            className="absolute z-50 pointer-events-none rounded-xl border border-slate-100 bg-white/95 p-3.5 shadow-xl backdrop-blur-md transition-all"
            style={{
              left: `${getCurvedTelemetry(hoveredVessel).x - 90}px`,
              top: `${getCurvedTelemetry(hoveredVessel).y + 24}px`,
            }}
          >
            <div className="space-y-1 w-44">
              <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded font-mono">
                {hoveredVessel.id.substring(0, 8)}
              </span>
              <h5 className="text-xs font-bold text-slate-900 pt-1">{hoveredVessel.name}</h5>
              <div className="h-[1px] w-full bg-slate-100 my-1" />
              <p className="text-[11px] text-slate-600 leading-tight">
                <span className="text-slate-400 font-medium">Carrier:</span> <span className="font-semibold text-slate-700">{hoveredVessel.carrierName}</span> <br />
                <span className="text-slate-400 font-medium">ETA Target:</span> <br />
                <span className="font-semibold text-slate-800">{hoveredVessel.eta}</span>
              </p>
            </div>
          </div>
        )}

        {hoveredPort && (
          <div 
            className="absolute z-50 pointer-events-none rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md"
            style={{
              left: `${hoveredPort.x + 15}px`,
              top: `${hoveredPort.y - 40}px`,
            }}
          >
            <div className="space-y-1 w-36">
              <h5 className="text-[11px] font-bold text-slate-900 tracking-wide">{hoveredPort.name}</h5>
              <div className="h-[1px] w-full bg-slate-100 my-1" />
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">To Lagos:</span>
                <span className="font-mono text-blue-600 font-semibold">{hoveredPort.distToLagos}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Time (Est):</span>
                <span className="font-mono text-green-600 font-semibold">{hoveredPort.etaLagos}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}