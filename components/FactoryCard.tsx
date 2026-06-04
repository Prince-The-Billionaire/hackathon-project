"use client";

import React, { useState } from "react";
import { ArrowRight, Package, TrendingUp, Shield, ChevronDown, ChevronUp, Layers, Loader2 } from "lucide-react";
import StoreFlagIcon from "@/components/StoreFlagIcon";

interface FactoryCardProps {
  store: any;
  onOpenShop: (store: any, products: any[]) => void;
}

export default function FactoryCard({ store, onOpenShop }: FactoryCardProps) {
  const [showInventory, setShowInventory] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [localProducts, setLocalProducts] = useState<any[]>(store.products || []);

  // Removed division by 100 - rendering raw value directly
  const displayMinCargo = store.minimumOrderAmountMinor
    ? `₦${parseFloat(store.minimumOrderAmountMinor).toLocaleString()}`
    : "Negotiable";

  // Unified fetcher mapping the exact product endpoint array
  const fetchStoreInventory = async () => {
    if (localProducts.length > 0) return localProducts;
    
    setLoadingInventory(true);
    try {
      const response = await fetch(`/api/marketplace/stores/${store.id}/products`);
      const payload = await response.json();
      
      if (payload?.status && payload?.data?.products) {
        setLocalProducts(payload.data.products);
        return payload.data.products;
      } else if (payload?.products) {
        setLocalProducts(payload.products);
        return payload.products;
      }
      return [];
    } catch (err) {
      console.error("Failed fetching inventory line via sub-route:", err);
      return [];
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleToggleInventory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !showInventory;
    setShowInventory(nextState);
    if (nextState) {
      await fetchStoreInventory();
    }
  };

  const handleImportLineAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Grabs products using the exact route before passing up to parent view
    const targetProducts = await fetchStoreInventory();
    
    // Bubble the exact data context up to your cargo staging window
    onOpenShop(store, targetProducts || []);
  };

  return (
    <div 
      onClick={handleImportLineAction}
      className="p-4 md:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
    >
      <div>
        <div className="flex items-start justify-between mb-3.5 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 relative shrink-0">
              <img src={store.logoUrl || "/fallback-logo.png"} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                {store.category?.replace("_", " ")}
              </span>
              <h4 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {store.name}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border rounded-full px-2.5 py-1 text-xs text-slate-600 shrink-0">
            <StoreFlagIcon countryCode={store.countryCode || "NG"} />
            <span className="text-[10px] font-semibold text-slate-700">{store.city}</span>
          </div>
        </div>

        <div className="mb-4 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-medium">
            <Shield className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Tariffs &amp; Customs Cleared</span>
          </div>
          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-600 text-white uppercase tracking-wider shadow-sm">
            DDP Verified
          </span>
        </div>

        <div className="flex justify-between items-center pl-1 text-xs text-slate-500">
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <Package className="h-3.5 w-3.5 text-slate-400" />
              <span>Active Factory Line</span>
            </div>
            {store.reliabilityScore && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span>{parseFloat(store.reliabilityScore).toFixed(0)}% Rate</span>
              </div>
            )}
          </div>

          <button
            onClick={handleToggleInventory}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-600 transition-colors py-0.5 px-2 bg-slate-100 rounded-md"
          >
            {loadingInventory ? (
              <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
            ) : (
              <Layers className="h-3 w-3" />
            )}
            <span>Inventory Line</span>
            {showInventory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Your working local catalog block */}
        {showInventory && (
          <div className="mt-3 pt-3 border-t border-dashed border-slate-100 max-h-40 overflow-y-auto space-y-2">
            {loadingInventory ? (
              <div className="flex items-center justify-center py-4 gap-2 text-xs text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Syncing catalog metrics...</span>
              </div>
            ) : localProducts.length === 0 ? (
              <p className="text-[11px] text-slate-400 py-2 pl-1">No items mapped to this line segment.</p>
            ) : (
              localProducts.map((product: any) => (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-700 line-clamp-1">{product.name}</p>
                    <p className="text-[9px] text-slate-400 font-mono uppercase">{product.pricingUnit || "UNIT"}</p>
                  </div>
                  <p className="font-bold text-slate-900 shrink-0 ml-2">
                    ₦{(parseFloat(product.priceAmountMinor)).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[9px] text-slate-400 font-semibold uppercase block tracking-wider">Min Cargo MOQ</span>
          <p className="text-xs font-bold text-slate-700">{displayMinCargo}</p>
        </div>
        <button 
          onClick={handleImportLineAction}
          disabled={loadingInventory}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 group-hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <span>Import Line</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}