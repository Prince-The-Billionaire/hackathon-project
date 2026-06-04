"use client";

import React from "react";
import { X, Bell } from "lucide-react";

interface NotificationItem {
  id: string;
  cargoId: string;
  title: string;
  statusText: string;
  timestamp: string;
}

interface CargoAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

export default function CargoAlertsDrawer({ isOpen, onClose, notifications }: CargoAlertsDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 text-xs flex justify-end animate-in fade-in duration-200 font-sans">
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-200">
        <div>
          <div className="p-5 flex items-center justify-between bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Bell className="h-4 w-4 text-slate-900 animate-swing" />
              <span className="text-sm font-black tracking-tight">Terminal Event Streaming Feed</span>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-y-auto p-5 space-y-3 max-h-[82vh] scrollbar-none">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-400 italic font-medium">
                No telemetry transaction logs registered for this scope session.
              </div>
            ) : (
              notifications.map((alert) => (
                <div key={alert.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5 hover:border-slate-300 transition-colors shadow-2xs">
                  <div className="flex justify-between items-start gap-3">
                    <span className="font-bold text-slate-900 text-[11px] tracking-tight leading-snug">{alert.title}</span>
                    <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap bg-white border px-1.5 py-0.5 rounded-md shadow-2xs">{alert.timestamp}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                    <span className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
                    <span>State Descriptor: <strong className="text-slate-800 font-bold uppercase text-[9px]">{alert.statusText.replace(/_/g, " ")}</strong></span>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[9px] font-mono text-slate-400 font-bold">
                    <span>ALLOCATION REFERENCE ID:</span>
                    <span className="text-slate-700 font-bold">#{alert.cargoId}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose} 
            className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold transition-colors text-center shadow-2xs text-[10px] uppercase tracking-wider"
          >
            Collapse Stream View
          </button>
        </div>
      </div>
    </div>
  );
}