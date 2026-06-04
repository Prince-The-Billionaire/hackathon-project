"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "../../components/Sidebar";
import MarketplaceHub from "../../components/MarketplaceHub";
import VesselDetailsModal from "../../components/VesselDetailsModal";
import { Plus, Store, RefreshCw } from "lucide-react";
// IMPORT CLERK AUTH HOOK FOR THE SECURE ROUTES
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function MarketplacePage() {
  const [selectedVessel, setSelectedVessel] = useState<any | null>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { getToken } = useAuth();

  useEffect(() => {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    async function fetchBackendStoresWithRetry(retriesRemaining = 3, delayMs = 2000) {
      try {
        setLoading(true);
        const token = await getToken();
        
        // 1. Get base URL and sanitize trailing slashes safely
        let baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://zeon-backend.onrender.com";
        if (baseUrl.endsWith("/")) {
          baseUrl = baseUrl.slice(0, -1);
        }

        // 2. Build the explicit clean path endpoint
        const targetUrl = `${baseUrl}/api/marketplace/stores`;
        
        const response = await fetch(targetUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // If the server explicitly throws a 404, retrying won't help—it's a path mismatch.
          if (response.status === 404) {
            throw new Error(`Route Not Found (404). Verify that your backend explicitly hosts the path "/api/marketplace/stores".`);
          }
          throw new Error(`Server responded with status ${response.status}`);
        }
        
        const payload = await response.json();
        
        if (payload && payload.status && payload.data && Array.isArray(payload.data.stores)) {
          setStores(payload.data.stores);
          setError(null);
          setRetryCount(0);
        } else {
          throw new Error("Invalid payload data shape received from API node.");
        }
      } catch (err: any) {
        console.warn(`Fetch attempt failed. Error:`, err.message);

        // Only retry transient server errors (like cold starts/502/504), skip 404 route errors
        if (retriesRemaining > 0 && !err.message.includes("404")) {
          setRetryCount((prev) => prev + 1);
          await delay(delayMs);
          return fetchBackendStoresWithRetry(retriesRemaining - 1, delayMs * 1.5);
        }

        console.error("All backend fetch extraction attempts exhausted:", err);
        setError(err.message || "Failed to synchronize data routes with the server matrix.");
      } finally {
        setLoading(false);
      }
    }

    fetchBackendStoresWithRetry();
  }, [getToken]);

  
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 antialiased flex flex-col md:flex-row">
      {/* BRANDING TOP LEFT CONTAINER */}
      <div className="absolute top-4 left-4 z-30 flex flex-col items-center gap-2 bg-white/75 rounded-full backdrop-blur-md border border-slate-200/50 p-1 shadow-sm md:top-5 md:left-6">
        <div className="relative h-16 w-16 rounded-full object-contain">
          <Image 
            src="/zeon-logo.webp" 
            alt="Zeon Systems Logo" 
            fill
            sizes="64px"
            priority
            className="object-contain rounded-full"
          />
        </div>
      </div>

      {/* 1. SIDEBAR NAVIGATION COMPONENT */}
      <Sidebar />

      {/* 2. LAYOUT-ALIGNED SCROLLABLE WORKSPACE CONTAINER */}
      <main className="w-full h-full pt-20 pb-24 px-4 md:pl-28 md:pt-6 md:pb-6 md:pr-6 relative z-10 flex-1 overflow-y-auto scrollbar-thin flex flex-col">
        <div className="w-full h-full flex-1 flex flex-col justify-center items-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
              <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                {retryCount > 0 
                  ? `Re-establishing link (Attempt ${retryCount}/3)...` 
                  : "Syncing global factory indexes..."
                }
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md px-6">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                <RefreshCw className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-red-600 leading-relaxed font-mono">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="h-9 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                <span>Force System Refresh</span>
              </button>
            </div>
          ) : stores.length === 0 ? (
            /* CLEAN SIMPLIFIED COMPACT EMPTY STATE */
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xs text-center flex flex-col items-center justify-center">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 mb-4">
                <Store className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                No stores added yet
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[240px]">
                There are currently no active merchant factories registered on the engine.
              </p>
              <div className="mt-5 flex items-center justify-center gap-2 w-full">
                <Link
                  href="/settings"
                  className="h-9 px-4 bg-slate-950 text-white hover:bg-indigo-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Factory Store</span>
                </Link>
              </div>
            </div>
          ) : (
            <MarketplaceHub stores={stores} />
          )}
        </div>
      </main>

      {/* 3. CONTEXTUAL OVERLAY MODALS */}
      {selectedVessel && (
        <VesselDetailsModal vessel={selectedVessel} onClose={() => setSelectedVessel(null)} />
      )}
    </div>
  );
}