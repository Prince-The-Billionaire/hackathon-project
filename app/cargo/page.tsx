/**
 * ============================================================================
 * MAIN ZEON LOGISTICS SYSTEM ROUTER
 * * Variables/States/Functions:
 * - selectedCargo: Currently selected shipping node target object row instance
 * - directionFilter: State controlling filtering list arrays ("All" | "Import" | "Export")
 * - isAlertsOpen: Overlay toggle handling status log sheet presentation renders
 * ============================================================================
 */

"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Sidebar from "../../components/Sidebar"; // Relative Route Framework Fix
import { Package, Bell } from "lucide-react";
import CargoMiniCard from "../../components/CargoMiniCard";
import CargoFinancialLedger from "../../components/CargoFinancialLedger";
import CargoAlertsDrawer from "../../components/CargoAlertsDrawer";
import { useCartStore } from "@/store/useCartStore";

export default function CargoTrackingPage() {
  // Connect cleanly to our live marketplace store state
  const { cargoOrders } = useCartStore();

  // Parse global store values into local component parameters safely
  const transformedOrders = useMemo(() => {
    return cargoOrders.map((order) => ({
      id: order.id,
      direction: "Import" as const, // Marketplace allocations default to high-priority incoming imports
      itemName: order.itemName,
      origin: order.origin,
      destination: order.destination,
      status: order.status,
      carrier: order.carrier,
      eta: order.eta,
      materials: {
        name: order.materials.name,
        quantity: order.materials.quantity,
        unitCost: order.materials.unitCost,
      },
      financials: {
        tariffRate: order.financials.tariffRate,
        customsFees: order.financials.customsFees,
        vatRate: order.financials.vatRate,
      },
    }));
  }, [cargoOrders]);

  // Combine with an optional hardcoded export row example for validation testing layout coverage
  const allShipments = useMemo(() => {
    return [
      ...transformedOrders,
      {
        id: "CRG-44A",
        direction: "Export" as const,
        itemName: "Premium Cocoa Beans",
        origin: "Ondo Hub (NG)",
        destination: "Rotterdam (NL)",
        status: "Customs Cleared",
        carrier: "CMA CGM Group",
        eta: "May 29, 2026",
        materials: { name: "Cocoa Bundles", quantity: 200, unitCost: 8000 },
        financials: { tariffRate: 0.02, customsFees: 30000, vatRate: 0.05 },
      },
    ];
  }, [transformedOrders]);

  const [selectedCargo, setSelectedCargo] = useState<any>(null);
  const [directionFilter, setDirectionFilter] = useState<"All" | "Import" | "Export">("All");
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Set the first item as default selection once data updates
  useEffect(() => {
    if (allShipments.length > 0 && !selectedCargo) {
      setSelectedCargo(allShipments[0]);
    }
  }, [allShipments, selectedCargo]);

  const simpleAlerts = useMemo(() => {
    return [
      {
        id: "nt-1",
        cargoId: selectedCargo?.id || "GEN-ID",
        title: "New Incoming Import Request",
        statusText: "Order Approved & Paid",
        timestamp: "10 mins ago",
      },
      {
        id: "nt-2",
        cargoId: selectedCargo?.id || "GEN-ID",
        title: "Escrow Holding Balance Locked",
        statusText: "Transferred to Escrow",
        timestamp: "1 hour ago",
      },
      {
        id: "nt-3",
        cargoId: "CRG-44A",
        title: "Outbound Freight Cleared Port",
        statusText: "Customs Cleared",
        timestamp: "Yesterday",
      },
    ];
  }, [selectedCargo]);

  const filteredCargo = useMemo(() => {
    return allShipments.filter((c) => directionFilter === "All" || c.direction === directionFilter);
  }, [allShipments, directionFilter]);

  const costBreakdown = useMemo(() => {
    const unitCost = selectedCargo?.materials?.unitCost ?? 0;
    const quantity = selectedCargo?.materials?.quantity ?? 0;
    const itemCost = unitCost * quantity;
    const tariffRate = selectedCargo?.financials?.tariffRate ?? 0;
    const customsFees = selectedCargo?.financials?.customsFees ?? 0;
    const vatRate = selectedCargo?.financials?.vatRate ?? 0;

    const tariffAmount = itemCost * tariffRate;
    const vatAmount = (itemCost + tariffAmount + customsFees) * vatRate;
    return {
      itemCost,
      tariffAmount,
      vatAmount,
      totalLandedCost: itemCost + tariffAmount + customsFees + vatAmount,
    };
  }, [selectedCargo]);

  const formatNaira = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
      <div className="absolute top-6 left-6 z-30 p-1 md:top-8 md:left-8">
        <div className="relative h-9 w-9">
          <Image src="/zeon-logo.jpg" alt="Logo" fill className="object-contain rounded-xl" />
        </div>
      </div>

      <Sidebar />

      <main className="flex-1 p-6 pt-24 md:p-10 md:pl-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
            <div>
              <span className="text-slate-400 font-bold tracking-wider text-[10px] uppercase flex items-center gap-1">
                <Package className="h-3 w-3" /> Logistics Terminal
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">Cargo Dashboard</h1>
            </div>

            <button
              onClick={() => setIsAlertsOpen(true)}
              className="relative flex items-center gap-2 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold border border-slate-100 shadow-sm shadow-slate-100/60 transition-all self-start sm:self-center"
            >
              <Bell className="h-3.5 w-3.5 text-slate-800" />
              <span>Process Alerts</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 absolute top-2 right-2.5 animate-pulse" />
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-white rounded-xl w-fit border border-slate-100 shadow-sm shadow-slate-100/40">
            {(["All", "Import", "Export"] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setDirectionFilter(dir)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  directionFilter === dir ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {dir === "All" ? "All Shipments" : dir + "s"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-3">
              {filteredCargo.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-2xl text-slate-400 text-xs bg-white">
                  No tracking records found for this shipment partition.
                </div>
              ) : (
                filteredCargo.map((cargo) => (
                  <CargoMiniCard
                    key={cargo.id}
                    cargo={cargo}
                    isSelected={selectedCargo?.id === cargo.id}
                    onClick={() => setSelectedCargo(cargo)}
                  />
                ))
              )}
            </div>

            <div className="lg:col-span-5">
              <CargoFinancialLedger
                selectedCargo={selectedCargo}
                costBreakdown={costBreakdown}
                formatNaira={formatNaira}
              />
            </div>
          </div>
        </div>
      </main>

      <CargoAlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        notifications={simpleAlerts}
      />
    </div>
  );
}