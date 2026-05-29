"use client";

import React from "react";
import * as Flags from "country-flag-icons/react/3x2";

export default function StoreFlagIcon({ countryCode }: { countryCode: string }) {
  const cleanCode = countryCode?.replace(/[^a-zA-Z]/g, "").trim().toUpperCase();
  const FlagComponent = Flags[cleanCode as keyof typeof Flags];
  
  if (!FlagComponent) {
    return <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1 rounded">{cleanCode || "???"}</span>;
  }
  
  return <FlagComponent className="w-5 h-3.5 object-cover rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.1)] inline-block flex-shrink-0" />;
}