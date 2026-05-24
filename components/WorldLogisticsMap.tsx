"use client";

import React, { useState, useEffect } from "react";
import { Vessel } from "../types/types";

interface MapProps {
  vessels: Vessel[];
  onVesselClick: (vsl: Vessel) => void;
}

// Expanded Global Port Network with Logistics Data to Nigeria (Lagos)
const PORTS = [
  { id: "LOS", name: "Lagos Apapa Port", x: 495, y: 310, distToLagos: "0 NM", etaLagos: "Local Hub" },
  { id: "SZN", name: "Port of Shenzhen", x: 835, y: 220, distToLagos: "11,500 NM", etaLagos: "32 Days" },
  { id: "SHA", name: "Port of Shanghai", x: 855, y: 205, distToLagos: "11,800 NM", etaLagos: "34 Days" },
  { id: "SGP", name: "Port of Singapore", x: 785, y: 295, distToLagos: "9,800 NM", etaLagos: "28 Days" },
  { id: "JEA", name: "Jebel Ali Port", x: 640, y: 220, distToLagos: "6,500 NM", etaLagos: "21 Days" },
  { id: "MBA", name: "Mombasa Port", x: 565, y: 325, distToLagos: "4,800 NM", etaLagos: "15 Days" },
  { id: "DUR", name: "Port of Durban", x: 550, y: 420, distToLagos: "3,200 NM", etaLagos: "10 Days" },
  { id: "IST", name: "Port of Istanbul", x: 535, y: 165, distToLagos: "4,600 NM", etaLagos: "14 Days" },
  { id: "RTM", name: "Port of Rotterdam", x: 490, y: 130, distToLagos: "4,200 NM", etaLagos: "12 Days" },
  { id: "SSZ", name: "Port of Santos", x: 340, y: 370, distToLagos: "3,800 NM", etaLagos: "11 Days" },
  { id: "NYC", name: "Port of New York", x: 280, y: 165, distToLagos: "5,000 NM", etaLagos: "16 Days" },
  { id: "LAX", name: "Port of Los Angeles", x: 160, y: 185, distToLagos: "9,000 NM", etaLagos: "26 Days" },
];

export default function WorldLogisticsMap({ vessels, onVesselClick }: MapProps) {
  const [hoveredVessel, setHoveredVessel] = useState<Vessel | null>(null);
  const [hoveredPort, setHoveredPort] = useState<typeof PORTS[0] | null>(null);
  const [animationTick, setAnimationTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationTick((prev) => (prev >= 100 ? 0 : prev + 0.08));
    }, 30);
    return () => clearInterval(timer);
  }, []);

  /**
   * Generates a safe Cubic Bézier curve bypassing all landmasses
   */
  const getCurvedTelemetry = (vsl: Vessel) => {
    const t = (animationTick * 0.4 + 20) / 100; // Progression bounds (0 to 1)

    const p0 = vsl.startCoords;
    const p3 = vsl.endCoords; // End destination

    // P1 and P2 act as gravitational pull points to bend the line around continents
    let p1 = { x: p0.x, y: p0.y };
    let p2 = { x: p3.x, y: p3.y };

    if (vsl.id === "VSL-001") {
      // Shenzhen to Lagos: Deep dive into the Indian Ocean, sweeping under South Africa
      p1 = { x: 740, y: 460 };
      p2 = { x: 490, y: 480 };
    } else if (vsl.id === "VSL-002") {
      // Rotterdam to Lagos: Pushed west into the Atlantic to avoid the European/African coastal bulge
      p1 = { x: 380, y: 180 };
      p2 = { x: 380, y: 300 };
    } else {
      // Default fallback cubic offset
      p1 = { x: p0.x + (p3.x - p0.x) / 3, y: p0.y + (p3.y - p0.y) / 3 + 50 };
      p2 = { x: p0.x + 2 * (p3.x - p0.x) / 3, y: p0.y + 2 * (p3.y - p0.y) / 3 + 50 };
    }

    // Cubic Bézier Matrix: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
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

    // Cubic Tangent Calculus for Angle: B'(t) = 3(1-t)²(P1 - P0) + 6(1-t)t(P2 - P1) + 3t²(P3 - P2)
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

  return (
    <div className="w-full h-full p-4">
      {/* Changed fixed height to h-full to make the map occupy the bottom fully */}
      <div className="relative w-full h-full rounded-2xl  bg-[#f8fafc] ">
        
        {/* Soft background ocean tracking grid */}
        <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <svg className="absolute inset-0 w-full h-full select-none" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="blue-continent-filter">
              <feColorMatrix 
                type="matrix" 
                values="0.25  0     0     0   0.15 
                        0     0.45  0     0   0.30 
                        0     0     0.75  0   0.55 
                        -1    -1    -1    1   1" 
              />
            </filter>
          </defs>

          <image 
            href="/map.jpg" 
            x="0" 
            y="0" 
            width="1000" 
            height="500" 
            preserveAspectRatio="xMidYMid slice"
            filter="url(#blue-continent-filter)"
            className="opacity-95"
          />

          {/* Shipping lanes routes paths */}
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

          {/* Active Global Logistics Sea Hub Terminals */}
          {PORTS.map((port) => (
            <g 
              key={port.id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPort(port)}
              onMouseLeave={() => setHoveredPort(null)}
            >
              {/* Invisible larger hover pad for easier interaction */}
              <circle cx={port.x} cy={port.y} r="14" fill="transparent" />
              
              {/* Ping animation - specific to Lagos Hub to emphasize it */}
              {port.id === "LOS" && (
                <circle cx={port.x} cy={port.y} r="8" fill="#16a34a" className="opacity-30 animate-ping" />
              )}
              
              <circle 
                cx={port.x} 
                cy={port.y} 
                r={port.id === "LOS" ? "5" : "3.5"} 
                fill={port.id === "LOS" ? "#16a34a" : "#2563eb"} 
                stroke="#ffffff" 
                strokeWidth="1.5" 
              />
              <text 
                x={port.x + 8} 
                y={port.y + 3} 
                fill={port.id === "LOS" ? "#14532d" : "#1e3a8a"} 
                fontSize={port.id === "LOS" ? "11" : "9"} 
                className="font-sans font-bold tracking-tight drop-shadow-sm"
              >
                {port.id}
              </text>
            </g>
          ))}

          {/* Dynamic Interactive Shipping Craft Carriers */}
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
                  transform={`translate(${telemetry.x}, ${telemetry.y}) rotate(${telemetry.angle}) scale(${isHovered ? 1.35 : 1.1})`} 
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

        {/* Float tooltip for Hovered Ship */}
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
                {hoveredVessel.id}
              </span>
              <h5 className="text-xs font-bold text-slate-900 pt-1">{hoveredVessel.name}</h5>
              <div className="h-[1px] w-full bg-slate-100 my-1" />
              <p className="text-[11px] text-slate-600 leading-tight">
                <span className="text-slate-400 font-medium">ETA Target:</span> <br />
                <span className="font-semibold text-slate-800">{hoveredVessel.eta}</span>
              </p>
            </div>
          </div>
        )}

        {/* Float tooltip for Hovered Port */}
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