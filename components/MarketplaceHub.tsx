"use client";

import React, { useState, useMemo } from "react";
import { ArrowRight, MapPin, X, Package, ShoppingCart, Info, TrendingUp, DollarSign, Award, Star, Search, Filter, Plus, Minus } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";
import { THIRTY_MOCK_STORES, ExtendedStore } from "../data/marketplaceData"; 
import { useCartStore } from "@/store/useCartStore"; 

interface MarketplaceHubProps {
  stores?: ExtendedStore[];
}

type CategoryFilter = "All" | ExtendedStore["category"];

function StoreFlagIcon({ countryCode }: { countryCode: string }) {
  const cleanCode = countryCode?.replace(/[^a-zA-Z]/g, "").trim().toUpperCase();
  const FlagComponent = Flags[cleanCode as keyof typeof Flags];
  if (!FlagComponent) return <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1 rounded">{cleanCode || "???"}</span>;
  return <FlagComponent className="w-5 h-3.5 object-cover rounded-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.1)] inline-block flex-shrink-0" />;
}

export default function MarketplaceHub({ stores }: MarketplaceHubProps) {
  const sourceStores = stores || THIRTY_MOCK_STORES;
  const addToCargo = useCartStore((state) => state.addToCargo);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [selectedStore, setSelectedStore] = useState<ExtendedStore | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const categories: CategoryFilter[] = ["All", "Electronics", "Apparel", "Machinery", "Eco Goods", "Food & Ag", "Automotive", "Decor", "Cosmetics"];

  const filteredStores = useMemo(() => {
    return sourceStores.filter((store) => {
      const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) || store.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch && (selectedCategory === "All" || store.category === selectedCategory);
    });
  }, [sourceStores, searchQuery, selectedCategory]);

  const handleQuantityChange = (itemId: string, delta: number, minMoq: number) => {
    const currentQty = quantities[itemId] ?? minMoq;
    const nextQty = currentQty + delta;
    if (nextQty >= minMoq) setQuantities(prev => ({ ...prev, [itemId]: nextQty }));
  };

  const handleManualInputChange = (itemId: string, val: string, minMoq: number) => {
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      setQuantities(prev => ({ ...prev, [itemId]: parsed }));
    } else if (val === "") {
      setQuantities(prev => ({ ...prev, [itemId]: 0 })); // allow clearing temporarily while typing
    }
  };

  const handleInputBlur = (itemId: string, minMoq: number) => {
    if ((quantities[itemId] ?? 0) < minMoq) {
      setQuantities(prev => ({ ...prev, [itemId]: minMoq }));
    }
  };

  return (
    <div className="w-full space-y-6 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Filters */}
      <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 lg:flex-row lg:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search factories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl text-sm focus:outline-none focus:border-sky-500 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-thin">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${selectedCategory === cat ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Main Grid Grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {filteredStores.map((store) => (
          <div key={store.id} className="p-4 md:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between group cursor-pointer" onClick={() => setSelectedStore(store)}>
            <div>
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl overflow-hidden border bg-slate-50 relative shrink-0"><img src={store.logoUrl} alt="" className="h-full w-full object-cover" /></div>
                  <div>
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">{store.category}</span>
                    <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{store.name}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border rounded-full px-2 py-0.5 text-xs text-slate-600"><StoreFlagIcon countryCode={store.flag} /><span className="text-[10px] font-semibold">{store.location.split(",")[0]}</span></div>
              </div>
              <div className="flex gap-4 text-xs text-slate-500 pl-1">
                <div className="flex items-center gap-1"><Package className="h-3.5 w-3.5 text-slate-400" /><span>{store.items} Lines</span></div>
                <div className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-emerald-500" /><span>{store.reliability} Fill</span></div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t flex items-center justify-between">
              <div><span className="text-[9px] text-slate-400 font-semibold uppercase block">Min Cargo</span><p className="text-xs font-bold text-slate-700">{store.minOrder}</p></div>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"><span>Open Mini Shop</span><ArrowRight className="h-3 w-3" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Mini-Shop Container */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelectedStore(null)}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-5 border-b bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-xl overflow-hidden border shrink-0"><img src={selectedStore.logoUrl} alt="" className="h-full w-full object-cover" /></div>
                <div><h3 className="font-bold text-slate-900 text-sm sm:text-base">{selectedStore.name}</h3><p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {selectedStore.location}</p></div>
              </div>
              <button onClick={() => setSelectedStore(null)} className="p-1.5 rounded-lg border text-slate-400 hover:text-slate-600 bg-white"><X className="h-4 w-4" /></button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex items-start gap-3 text-sky-800"><Info className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" /><p className="text-xs font-medium">Cargo requirements apply. Minimal threshold is <strong>{selectedStore.minOrder}</strong>.</p></div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Lines</h5>
              
              <div className="space-y-3">
                {selectedStore.featuredItems.map((item) => {
                  const currentMoq = parseInt(item.moq.replace(/[^0-9]/g, "")) || 1;
                  const itemQuantity = quantities[item.id] ?? currentMoq;

                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border bg-white shadow-sm">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 border shrink-0"><img src={item.image} alt="" className="h-full w-full object-cover" /></div>
                        <div className="flex-1 min-w-0">
                          <h6 className="font-semibold text-slate-800 text-sm truncate">{item.name}</h6>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <div className="flex items-center gap-0.5 bg-slate-50 border px-2 py-0.5 rounded-md"><DollarSign className="h-3 w-3 text-emerald-600" /><span className="font-bold text-slate-700">{item.bulkPrice}</span></div>
                            <span className="text-slate-400">Min: {item.moq}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-none border-slate-100">
                        <div className="flex items-center bg-slate-50 border rounded-lg p-0.5">
                          <button onClick={() => handleQuantityChange(item.id, -1, currentMoq)} disabled={itemQuantity <= currentMoq} className="p-1 text-slate-500 disabled:opacity-30"><Minus className="h-3.5 w-3.5" /></button>
                          
                          {/* Interactive Numeric Input Field */}
                          <input 
                            type="text" 
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={itemQuantity === 0 ? "" : itemQuantity}
                            onChange={(e) => handleManualInputChange(item.id, e.target.value, currentMoq)}
                            onBlur={() => handleInputBlur(item.id, currentMoq)}
                            className="w-12 text-center text-xs font-bold text-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-sky-500 rounded"
                          />

                          <button onClick={() => handleQuantityChange(item.id, 1, currentMoq)} className="p-1 text-slate-500"><Plus className="h-3.5 w-3.5" /></button>
                        </div>

                        {/* Phrased with Add to Cargo layout rules */}
                        <button 
                          onClick={() => {
                            addToCargo(item, itemQuantity, selectedStore.name);
                            alert(`Allocated ${itemQuantity} items to your Consolidated Shared Cargo space!`);
                          }}
                          className="h-9 px-4 rounded-xl bg-slate-900 text-white flex items-center gap-1.5 font-semibold text-xs transition-all hover:bg-sky-600"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          <span>Add to Cargo</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t bg-slate-50/80 flex items-center justify-between text-xs text-slate-400"><div className="flex items-center gap-1"><Award className="h-3.5 w-3.5 text-amber-500" /> Compliance: {selectedStore.reliability}</div><button onClick={() => setSelectedStore(null)} className="px-4 py-2 font-semibold bg-white border rounded-lg text-slate-600">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}