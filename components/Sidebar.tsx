"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, ShoppingBag, Ship, Package, Info, Settings } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  // Root-level file system paths matching your direct app directory structure
  const navItems = [
    { href: "/", label: "Global Map", icon: Globe },
    { href: "/marketplace", label: "Market Place", icon: ShoppingBag }, // Assuming home is your main marketplace hub
    { href: "/shipping", label: "Shipping", icon: Ship },
    { href: "/cargo", label: "Your Cargo", icon: Package },
    { href: "/about", label: "About", icon: Info },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="
      /* Layout Defaults: Original White Glassmorphism and Z-Index */
      fixed z-40 border border-white/40 bg-white/60 shadow-xl backdrop-blur-xl flex justify-between items-center transition-all duration-300
      
      /* Mobile Layout: Fixed Bottom Bar */
      bottom-4 left-4 right-4 h-16 rounded-xl px-2 flex-row
      
      /* Desktop Layout: Vertically Centered Left Sidebar */
      md:bottom-auto md:left-5 md:right-auto md:top-1/2 md:-translate-y-1/2 md:w-16 md:min-h-[480px] md:max-h-[85vh] md:rounded-2xl md:p-2 md:flex-col
    ">
      
      {/* Navigation Menu Items Stack */}
      <nav className="flex flex-row justify-between w-full items-center md:flex-col md:gap-2.5 md:my-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          
          // Checks active status accurately for both the home domain root and sub-segments
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                /* Layout base */
                flex flex-col items-center justify-center rounded-lg transition-all duration-200 group flex-1 md:w-full
                /* Adaptive padding adjustments based on bar sizing footprint */
                py-1 md:py-2
                ${isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                  : "text-slate-500 hover:bg-slate-900/5 hover:text-slate-800"
                }
              `}
            >
              <IconComponent className={`h-4 w-4 md:h-[18px] md:w-[18px] transition-colors duration-200 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-800"}`} />
              <span className="text-[8px] md:text-[9px] font-medium mt-1 text-center tracking-wide block w-full px-0.5 seamless-truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Wallet Node Country Indicator */}
      <div className="hidden md:flex flex-col items-center pb-1 mt-2">
        <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] text-slate-600 font-bold shadow-sm">
          NG
        </div>
      </div>
    </aside>
  );
}