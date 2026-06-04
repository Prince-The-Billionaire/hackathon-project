"use client";

import React, { useState, useMemo } from "react";
import { X, MapPin, Info, DollarSign, Minus, Plus, ShoppingCart, Award, Search, Building2, Layers, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import FactoryCard from "@/components/FactoryCard";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/utils/api"; // Ensure this matches your pathing structure

interface MarketplaceHubProps {
  stores: any[];
}

const CATEGORY_MAP: Record<string, string> = {
  "All": "All",
  "Electronics": "ELECTRONICS",
  "Apparel": "APPAREL",
  "Machinery": "MACHINERY",
  "Eco Goods": "ECO_GOODS",
  "Food & Ag": "FOOD_AND_AG",
  "Automotive": "AUTOMOTIVE",
  "Decor": "DECOR",
  "Cosmetics": "COSMETICS",
  "Logistics": "LOGISTICS"
};

export default function MarketplaceHub({ stores }: MarketplaceHubProps) {
  const { getToken } = useAuth();
  const syncAddToCargoLocal = useCartStore((state) => state.syncAddToCargo);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const categories = ["All", "Electronics", "Apparel", "Machinery", "Eco Goods", "Food & Ag", "Automotive", "Decor", "Cosmetics"];

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch = 
        store.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        store.city?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const targetEnum = CATEGORY_MAP[selectedCategory];
      const matchesCategory = targetEnum === "All" || store.category === targetEnum;
      
      return matchesSearch && matchesCategory;
    });
  }, [stores, searchQuery, selectedCategory]);

  const handleOpenShop = (store: any, incomingProducts: any[]) => {
    setSelectedStore(store);
    setProducts(incomingProducts);
    
    const moqSeeds: Record<string, number> = {};
    incomingProducts.forEach((prod: any) => {
      moqSeeds[prod.id] = Number(prod.moqValue) || 1;
    });
    setQuantities(moqSeeds);
  };

  const handleQuantityChange = (itemId: string, delta: number, minMoq: number) => {
    const currentQty = quantities[itemId] ?? minMoq;
    const nextQty = currentQty + delta;
    if (nextQty >= minMoq) setQuantities(prev => ({ ...prev, [itemId]: nextQty }));
  };

  const handleManualInputChange = (itemId: string, val: string) => {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      setQuantities(prev => ({ ...prev, [itemId]: parsed }));
    } else if (val === "") {
      setQuantities(prev => ({ ...prev, [itemId]: 0 }));
    }
  };

  const handleInputBlur = (itemId: string, minMoq: number) => {
    if ((quantities[itemId] ?? 0) < minMoq) {
      setQuantities(prev => ({ ...prev, [itemId]: minMoq }));
    }
  };

  const formatMinorValue = (minorAmt: any, currency = "₦") => {
    const value = parseFloat(minorAmt) || 0;
    return `${currency}${value.toLocaleString()}`;
  };

  // NEW: Directly handle the backend API integration for creating Draft Cargo Allocations
  const handleAddCargoSubmit = async (item: any) => {
    if (addingProductId) return;
    
    const currentMoq = Number(item.moqValue) || 1;
    const itemQuantity = quantities[item.id] ?? currentMoq;

    try {
      setAddingProductId(item.id);
      
      // Initialize authenticated Express API Client instance
      const api = await createApiClient(getToken);
      
      // Match backend payload specification: POST /api/cargo/allocation
      const payload = {
        storeId: selectedStore.id,
        items: [
          {
            productId: item.id,
            quantity: itemQuantity,
            quantityUnit: item.pricingUnit || "UNIT"
          }
        ]
      };

      await api("api/cargo/allocation", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Synchronize frontend layout fallback state manager
      if (typeof syncAddToCargoLocal === "function") {
        try {
          await syncAddToCargoLocal({
            id: item.id,
            name: item.name,
            bulkPrice: String(item.priceAmountMinor),
            image: item.imageUrl || ""
          }, itemQuantity, selectedStore.name, getToken);
        } catch (storeErr) {
          console.warn("Zustand client local store synchronizer bypassed:", storeErr);
        }
      }

      toast.success(
        <div className="flex flex-col gap-0.5 text-left">
          <p className="text-xs font-bold text-slate-900">Cargo Staged on Dashboard</p>
          <p className="text-[10px] text-slate-400 font-medium max-w-[200px] truncate">
            {itemQuantity}x {item.name} indexed as DRAFT pipeline allocation.
          </p>
        </div>,
        {
          duration: 3000,
          style: {
            border: "1px solid #e2e8f0",
            padding: "10px 14px",
            borderRadius: "14px",
            background: "#ffffff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }
        }
      );

    } catch (err: any) {
      console.error("Backend Cargo Draft synchronization failed:", err);
      toast.error(err.message || "Failed to commit allocation matrix to logistics stream.");
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <div className="w-full space-y-6 px-4 md:px-6 max-w-7xl mx-auto py-4">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 lg:flex-row lg:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search manufacturers and direct factories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl text-sm focus:outline-none focus:border-slate-900 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none max-w-full">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)} 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <h1 className="font-bold text-lg text-slate-900">Import from Factories</h1>

      {filteredStores.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-2xl text-slate-400 text-sm">No factories match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredStores.map((store) => (
            <FactoryCard 
              key={store.id} 
              store={store} 
              onOpenShop={(selectedStoreData, selectedStoreProducts) => handleOpenShop(selectedStoreData, selectedStoreProducts)} 
            />
          ))}
        </div>
      )}

      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-md transition-opacity duration-200" onClick={() => setSelectedStore(null)}>
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            
            <div className="p-5 border-b bg-gradient-to-b from-slate-50 to-white flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                {selectedStore.logoUrl ? (
                  <div className="h-14 w-14 rounded-xl overflow-hidden border border-slate-200 shadow-xs shrink-0 bg-white p-0.5">
                    <img src={selectedStore.logoUrl} alt="" className="h-full w-full object-cover rounded-lg" />
                  </div>
                ) : (
                  <div className="h-14 w-14 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                    <Building2 className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight truncate">{selectedStore.name}</h3>
                    <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border uppercase">
                      {selectedStore.category || "Factory"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-slate-400" /> {selectedStore.city}, {selectedStore.countryCode || "NG"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStore(null)} 
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-slate-50/40">
              <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3.5 flex items-start gap-3 text-emerald-950">
                <Info className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-emerald-900">Delivered Duty Paid (DDP) Freight Framework</p>
                  <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                    Cargo line requires a threshold minimum value of <span className="font-bold text-emerald-950">{formatMinorValue(selectedStore.minimumOrderAmountMinor)}</span> to authorize global container shipping logistics.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <Layers className="h-3 w-3" />
                  <span>Available Inventory Records ({products.length})</span>
                </div>
                
                {products.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-dashed rounded-xl text-slate-400 text-xs italic">
                    No factory floor lines are open for import orders at this position.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {products.map((item) => {
                      const currentMoq = Number(item.moqValue) || 1;
                      const itemQuantity = quantities[item.id] ?? currentMoq;
                      const isItemAdding = addingProductId === item.id;

                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs">
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            <div className="h-14 w-14 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                              <img src={item.imageUrl || "/fallback-product.png"} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <h6 className="font-bold text-slate-900 text-sm truncate">{item.name}</h6>
                              <div className="flex items-center gap-2.5 flex-wrap text-[11px]">
                                <div className="flex items-center font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                                  <DollarSign className="h-3 w-3 -mr-0.5 shrink-0" />
                                  <span>{formatMinorValue(item.priceAmountMinor, "")}</span>
                                </div>
                                <span className="text-slate-400 font-medium">
                                  MOQ Requirement: <span className="text-slate-700 font-semibold">{currentMoq} {item.moqUnit || "UNIT"}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-3 sm:pt-0 border-t sm:border-none border-slate-100 shrink-0">
                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                              <button 
                                onClick={() => handleQuantityChange(item.id, -1, currentMoq)} 
                                disabled={itemQuantity <= currentMoq || isItemAdding} 
                                className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-25 transition-colors"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              
                              <input 
                                type="text" 
                                inputMode="numeric"
                                pattern="[0-9]*"
                                disabled={isItemAdding}
                                value={itemQuantity === 0 ? "" : itemQuantity}
                                onChange={(e) => handleManualInputChange(item.id, e.target.value)}
                                onBlur={() => handleInputBlur(item.id, currentMoq)}
                                className="w-12 text-center text-xs font-bold text-slate-800 bg-transparent focus:outline-none rounded disabled:opacity-50"
                              />

                              <button 
                                onClick={() => handleQuantityChange(item.id, 1, currentMoq)} 
                                disabled={isItemAdding}
                                className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <button 
                              onClick={() => handleAddCargoSubmit(item)}
                              disabled={isItemAdding}
                              className="h-9 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:bg-slate-800 text-white flex items-center gap-1.5 font-bold text-xs shadow-xs transition-colors min-w-[125px] justify-center"
                            >
                              {isItemAdding ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-300" />
                                  <span>Syncing...</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="h-3.5 w-3.5 text-slate-300" />
                                  <span>Add to Cargo</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-500 shrink-0" /> 
                <span className="font-medium text-slate-500">Compliance Protection Framework Matrix Assured</span>
              </div>
              <button 
                onClick={() => setSelectedStore(null)} 
                className="w-full sm:w-auto px-4 py-2 font-bold bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors text-center"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}