"use client";

import React, { useState } from "react";
import { CreditCard, MapPin, ArrowRight, Loader2, FileCheck, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { createApiClient } from "../utils/api";
import { useAuth } from "@clerk/nextjs";
import { CargoGroup } from "@/app/cargo/page";

interface CargoFinancialLedgerProps {
  selectedCargo: CargoGroup | null;
  costBreakdown: any;
  formatNaira: (val: number) => string;
  onActionComplete?: () => void;
  onOpenNegotiation: (conversationId: string, merchant: { id: string; name: string }) => void;
}

export default function CargoFinancialLedger({ 
  selectedCargo, 
  costBreakdown, 
  formatNaira, 
  onActionComplete,
  onOpenNegotiation
}: CargoFinancialLedgerProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const { getToken } = useAuth();

  // Pure data tracking state block reflecting exact payload schemas
  const [address, setAddress] = useState({
    country: "Nigeria",
    city: "",
    street: "",
    postalCode: "",
  });

  const ESTIMATED_TARIFF_BPS = 500;
  const ESTIMATED_CUSTOMS_FEE = 150000;
  const ESTIMATED_VAT_BPS = 750;

  if (!selectedCargo) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center text-slate-400 font-medium text-xs border border-slate-200 shadow-2xs">
        Select a store cargo cluster row item to view live port billing matrices.
      </div>
    );
  }

  const rawStatus = (selectedCargo.status || "").toUpperCase().replace(/ /g, "_");
  const isDraft = rawStatus === "DRAFT";
  const isAwaitingPayment = rawStatus === "AWAITING_PAYMENT";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const validateDeliveryCoordinates = () => {
    if (!address.country.trim() || !address.city.trim() || !address.street.trim() || !address.postalCode.trim()) {
      toast.error("Please supply complete delivery address details before building parameters.");
      return false;
    }
    return true;
  };

  // Compile calculations on the cluster while holding for explicit confirmation
  const runCheckoutPipeline = async () => {
    if (!validateDeliveryCoordinates()) return;

    try {
      setActionLoading(true);
      const api = await createApiClient(getToken);
      
      let targetAllocationIds = selectedCargo.allocationIds;
      let targetAllocationId = selectedCargo.allocationIds[0];

      // Step 1: Handle Local Draft Commit
      if (selectedCargo.isLocalDraft && selectedCargo.localItems) {
        toast.loading("Committing local matrix to logistics stream...", { id: "workflow" });
        
        const createPayload = {
          storeId: selectedCargo.storeId,
          currencyCode: selectedCargo.currencyCode,
          items: selectedCargo.localItems.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
            quantityUnit: i.quantityUnit
          }))
        };

        const createdData: any = await api("api/cargo/allocation", {
          method: "POST",
          body: JSON.stringify(createPayload)
        });

        const newAllocId = createdData?.id || createdData?.data?.id;
        if (!newAllocId) throw new Error("Backend failed to return an allocation index.");

        targetAllocationIds = [newAllocId];
        targetAllocationId = newAllocId;

        // Clear local storage for this particular store block
        const localDataStr = localStorage.getItem('zeon_local_cargo');
        if (localDataStr) {
          const localData = JSON.parse(localDataStr);
          delete localData[selectedCargo.storeId];
          localStorage.setItem('zeon_local_cargo', JSON.stringify(localData));
        }
      }

      // Step 2: Proceed with Checkout Compilation
      toast.loading("Compiling consolidated custom landed cost parameters...", { id: "workflow" });
      
      await api("api/cargo/allocation/checkout", {
        method: "POST",
        body: JSON.stringify({ 
          allocationId: targetAllocationId,
          // Included for backwards compatibility support
          tariffRateBps: ESTIMATED_TARIFF_BPS,
          customsFeeMinor: ESTIMATED_CUSTOMS_FEE * 100, 
          vatRateBps: ESTIMATED_VAT_BPS,
          deliveryAddress: {
            country: address.country,
            city: address.city,
            street: address.street,
            postalCode: address.postalCode,
            fullAddress: `${address.street}, ${address.city}, ${address.country}, ${address.postalCode}`.trim()
          },
        }),
      });
      
      toast.success("Consolidated fees built successfully. Manifest updated to Awaiting Payment status.", { id: "workflow" });
      if (onActionComplete) onActionComplete();
    } catch (err: any) {
      console.error("Pipeline failure:", err);
      toast.error(err.message || "Failed processing item parameters data blocks.", { id: "workflow" });
    } finally {
      setActionLoading(false);
    }
  };

  // Only triggers verification context loops once user manually accepts cost totals
  const runConfirmPipeline = async () => {
    try {
      setActionLoading(true);
      const api = await createApiClient(getToken);
      toast.loading("Acquiring secure gateway access tokens...", { id: "workflow" });

      const rootId = selectedCargo.allocationIds[0];
      const confirmData = await api(`api/cargo/allocation/${rootId}/confirm`, { method: "POST" });
      const url = confirmData?.checkoutUrl || confirmData?.data?.checkoutUrl;

      if (url) {
        toast.success("Rerouting frame to secure transaction vault gateway...", { id: "workflow" });
        window.location.href = url;
      } else {
        toast.error("Endpoint transaction keys failed serialization criteria checks.");
      }
    } catch (err: any) {
      toast.error("Critical core error processing confirmation pipelines.");
    } finally {
      setActionLoading(false);
    }
  };

  // Dynamic initialization for active communication nodes linking to parent storefront profiles
  const triggerStoreNegotiationChannel = async () => {
    try {
      setActionLoading(true);
      const api = await createApiClient(getToken);
      toast.loading("Synchronizing communication node hooks...", { id: "chat-seq" });

      const payload = await api("api/messaging/conversations", {
        method: "POST",
        body: JSON.stringify({ participantId: selectedCargo.storeId })
      });

      const conversationId = payload?.id || payload?.data?.id;
      if (!conversationId) throw new Error("Could not construct or fetch dialog link mapping.");

      await api(`api/messaging/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ 
          body: `[SYSTEM FREIGHT NEGOTIATION INTENT] Regarding consolidated cargo block entry cluster tracking under reference Store IDs. Requesting manual re-audit on total calculated Landed Fees (${formatNaira(costBreakdown?.totalLandedCost || 0)}).` 
        })
      });

      toast.success("Secure chat workspace linked.", { id: "chat-seq" });
      onOpenNegotiation(conversationId, { id: selectedCargo.storeId, name: selectedCargo.storeName });
    } catch (err: any) {
      toast.error(err.message || "Failed tracking store data stream nodes.", { id: "chat-seq" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6 text-xs transition-all duration-300">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-slate-900" />
            <h3 className="font-bold text-[10px] tracking-widest text-slate-400 uppercase">Financial Audit Ledger</h3>
          </div>
        </div>

        <div className="space-y-3 font-medium">
          <div className="flex items-center justify-between text-slate-600">
            <span>Aggregated Base Goods Net Value</span>
            <span className="font-bold text-slate-800">{formatNaira(costBreakdown?.itemCost || 0)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Custom Duties & Port Clearances</span>
            <span className="font-semibold text-slate-800">
              {formatNaira((costBreakdown?.tariffAmount || 0) + (costBreakdown?.customsFees || 0))}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Consolidated VAT Component (7.5%)</span>
            <span className="font-semibold text-slate-800">{formatNaira(costBreakdown?.vatAmount || 0)}</span>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Total Landed Costs</span>
            <span className="text-base font-black text-slate-900">{formatNaira(costBreakdown?.totalLandedCost || 0)}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Destination Parameter Mapping Section */}
      {isDraft && (
        <div className="pt-2 border-t border-slate-100/80 space-y-3">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
            <MapPin className="h-3.5 w-3.5 text-slate-900" />
            <span>Outward Waybill Handover Address</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Logistics Country</label>
              <input 
                type="text" name="country" value={address.country} onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-900 font-medium text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">State / City Node</label>
              <input 
                type="text" name="city" placeholder="e.g. Lagos" value={address.city} onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-900 font-medium text-slate-800"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Street Layout Coordinates</label>
              <input 
                type="text" name="street" placeholder="Avenue details" value={address.street} onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-900 font-medium text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Postal Index</label>
              <input 
                type="text" name="postalCode" placeholder="100001" value={address.postalCode} onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-900 font-medium text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Information Warning Notice Grid */}
      <div className={`p-4 rounded-xl flex items-start gap-3 border ${
        isAwaitingPayment ? "bg-amber-50/70 border-amber-200 text-amber-950" : "bg-slate-50 border-slate-200"
      }`}>
        <FileCheck className={`h-4 w-4 shrink-0 mt-0.5 ${isAwaitingPayment ? 'text-amber-600' : 'text-slate-400'}`} />
        <div className="space-y-0.5">
          <p className="font-bold text-[11px] text-slate-900">{isAwaitingPayment ? "Consolidated Costs Locked For Review" : "Invoicing Parameters Clean"}</p>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            {isAwaitingPayment 
              ? "Review your metrics. Click Accept to redirect context to the portal gateway, or open terms negotiation blocks below."
              : "Generate calculations layout parameters to freeze base allocations and secure final customs paths."}
          </p>
        </div>
      </div>

      {/* Multi-Stage Action Execution Modules */}
      <div className="space-y-2">
        {isDraft && (
          <button
            onClick={runCheckoutPipeline}
            disabled={actionLoading}
            className="w-full font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all bg-slate-950 hover:bg-slate-800 text-white flex items-center justify-center gap-2 shadow-sm text-[10px]"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                <span>Calculate & Compile Landed Matrix</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        )}

        {isAwaitingPayment && (
          <div className="flex flex-col gap-2">
            <button
              onClick={runConfirmPipeline}
              disabled={actionLoading}
              className="w-full font-bold uppercase tracking-wider py-3.5 rounded-xl transition-all bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-sm text-[10px]"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <span>Accept Fees & Redirect to Checkout</span>
              )}
            </button>
            
            <button
              onClick={triggerStoreNegotiationChannel}
              disabled={actionLoading}
              className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold uppercase tracking-wider text-[9px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
              <span>Negotiate Freight Terms</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}