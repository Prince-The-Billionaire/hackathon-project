"use client";

import React, { useState } from "react";
import { ArrowDownLeft, ArrowRight, Trash2, Edit3, Loader2 } from "lucide-react";
import { createApiClient } from "../utils/api";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";

interface CargoMiniCardProps {
  cargo: {
    id: string;
    direction: "Import" | "Export";
    itemName: string;
    origin: string;
    destination: string;
    status: string;
    eta: string;
    quantity: number;
  };
  allocationIds: string[];
  isSelected: boolean;
  onClick: () => void;
  onRefreshNeeded: () => void;
}

export default function CargoMiniCard({ cargo, allocationIds, isSelected, onClick, onRefreshNeeded }: CargoMiniCardProps) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const normalizedStatus = (cargo.status || "").toUpperCase().replace(/ /g, "_");
  const isEditable = normalizedStatus === "DRAFT";

  const getStatusStyles = (statusStr: string) => {
    switch (statusStr) {
      case "AWAITING_PAYMENT":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "DRAFT":
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  // Iterates and cancels all combined shipment allocations belonging to this store group
  const handleBatchPurgeSequence = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Remove this complete consolidated store cargo bundle from active pipelines?")) return;

    try {
      setLoading(true);
      const api = await createApiClient(getToken);
      toast.loading("Purging transaction indexes...", { id: "purge-seq" });

      // Execute sequential promise calls matching allocation references
      await Promise.all(
        allocationIds.map(id => 
          api(`api/cargo/allocation/${id}/cancel`, { method: "POST" })
        )
      );

      toast.success("Consolidated storefront allocation entries cleared.", { id: "purge-seq" });
      onRefreshNeeded();
    } catch (err: any) {
      toast.error(err.message || "Removal loop operation hit structural faults.", { id: "purge-seq" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 cursor-pointer transition-all duration-200 text-xs rounded-2xl flex items-center justify-between gap-4 border ${
        isSelected 
          ? "bg-white border-slate-900 shadow-md scale-[1.005]" 
          : "bg-white border-slate-200 hover:border-slate-300 shadow-2xs"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-emerald-50/50 text-emerald-600 border-emerald-100">
          <ArrowDownLeft className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-bold text-slate-400 tracking-tight">{cargo.id}</span>
            <span className="px-1.5 py-0.5 text-[8px] font-black uppercase rounded border tracking-wider bg-slate-100 text-slate-700 border-slate-200">
              {cargo.direction}
            </span>
          </div>
          <h4 className="font-bold text-slate-900 tracking-tight text-sm truncate">{cargo.itemName}</h4>
          
          <div className="flex items-center gap-1 text-slate-500 font-medium truncate text-[11px]">
            <span className="truncate max-w-[130px] inline-block font-semibold text-slate-700">{cargo.origin}</span>
            <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />
            <span className="truncate text-slate-500">{cargo.destination}</span>
            <span className="ml-1 text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">
              Items: {cargo.quantity}
            </span>
          </div>
        </div>
      </div>

      <div className="text-right shrink-0 flex flex-col items-end gap-3 select-none">
        <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg tracking-wide border uppercase ${getStatusStyles(normalizedStatus)}`}>
          {cargo.status.replace(/_/g, " ")}
        </span>

        <div className="flex items-center gap-1">
          {isEditable ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); toast.success("Modify components via financial ledger configuration."); }}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleBatchPurgeSequence}
                disabled={loading}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-all"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            </>
          ) : (
            <button
              onClick={handleBatchPurgeSequence}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
              title="Cancel allocation group"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}