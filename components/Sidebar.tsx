"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useGeo } from "@/context/GeoContext";
import { Globe, ShoppingBag, Ship, Package, Settings } from "lucide-react";
// Import your custom flag component here. Adjust the path to match your project layout!
import StoreFlagIcon from "@/components/StoreFlagIcon"; 

export default function Sidebar() {
  const pathname = usePathname();
  const { countryCode } = useGeo();

  const navItems = [
    { href: "/dashboard", label: "Global Map", icon: Globe },
    { href: "/marketplace", label: "Market Place", icon: ShoppingBag },
    { href: "/shipping", label: "Shipping", icon: Ship },
    { href: "/cargo", label: "Your Cargo", icon: Package },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="
      /* Layout Defaults: Clean Glassmorphism Layer */
      fixed z-40 border border-white/40 bg-white/60 shadow-xl backdrop-blur-xl flex justify-between items-center transition-all duration-300
      
      /* Mobile Layout: Snap to base view */
      bottom-4 left-4 right-4 h-16 rounded-xl px-4 flex-row
      
      /* Desktop Layout: Optimized wrapping height */
      md:bottom-auto md:left-5 md:right-auto md:top-[20%] md:w-16 md:h-auto md:max-h-[80vh] md:rounded-2xl md:p-3 md:flex-col md:gap-6
    ">
      
      {/* Navigation Menu Items Stack */}
      <nav className="flex flex-row justify-between w-full items-center md:flex-col md:gap-3 flex-1 md:flex-none">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center rounded-xl transition-all duration-200 group flex-1 md:w-full md:aspect-square
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

      {/* Profile & Node Group Settings Section */}
      <div className="flex flex-row items-center gap-3 pl-3 border-l border-slate-200/60 md:border-l-0 md:pl-0 md:pt-3 md:border-t md:border-slate-200/60 md:w-full md:flex-col md:gap-4">
        
        {/* Dynamic Country Node Flag Component */}
        <div 
          title={`Node Active Location: ${countryCode}`}
          className="flex flex-col items-center justify-center transition-transform hover:scale-105"
        >
          {/* We pass the dynamic 2-letter code lowercase/uppercase depending on what your component prefers */}
          <StoreFlagIcon countryCode={countryCode.toLowerCase()} />
          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter mt-1 select-none">
            {countryCode}
          </span>
        </div>

        {/* Clerk User Action Hub */}
        <div className="flex items-center justify-center transition-transform hover:scale-105 duration-200">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-7 w-7 md:h-8 md:w-8 border border-slate-200 shadow-sm"
              }
            }}
          />
        </div>
      </div>
    </aside>
  );
}