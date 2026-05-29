/**
 * ============================================================================
 * CLEAN FRAMELESS LOGISTICS PROCESS NOTIFICATION DRAWER
 * * Variables/States/Functions:
 * - isOpen / onClose: Component structural rendering controllers
 * ============================================================================
 */

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
    <div className="fixed inset-0 z-50 text-xs">
      {/* Blurred Backdrop Minimal overlay */}
      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col transition-all duration-300">
          
          {/* Header without a rigid solid dividing border */}
          <div className="p-6 pb-4 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Bell className="h-4 w-4 text-slate-800" />
              <span className="text-sm font-black tracking-tight">Order Process Logs</span>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Simple Alert Cards without heavy bounding frames */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
            {notifications.map((alert) => (
              <div key={alert.id} className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-xl space-y-2 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-slate-800 text-[11px] tracking-tight">{alert.title}</span>
                  <span className="text-[9px] text-slate-400 font-medium shrink-0">{alert.timestamp}</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                  <span className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                  <span>Status: <strong className="text-slate-800 font-bold">{alert.statusText}</strong></span>
                </div>
                
                <p className="text-[9px] font-mono text-slate-400 font-bold">Waybill Ref: #{alert.cargoId}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}