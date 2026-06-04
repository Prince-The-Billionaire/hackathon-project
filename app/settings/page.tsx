/**
 * ============================================================================
 * ZEON SYSTEMS - MERCHANT SETTINGS & PRODUCT HUB
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import { 
  User, 
  Building2, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  Save, 
  CheckCircle2,
  Lock,
  AlertCircle,
  RefreshCw,
  PackagePlus,
  Trash2,
  Edit3,
  BarChart3,
  MessageSquare,
  Truck,
  Layers,
  DollarSign
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/utils/api";

type ActiveTabType = "profile" | "business" | "products" | "analytics" | "notifications" | "security";

interface ApiResponseEnvelope<T> {
  message: string;
  status: boolean;
  data: T;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>("profile");
  const [isSaved, setIsSaved] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { getToken, signOut } = useAuth();

  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImageUrl: ""
  });

  const [storeData, setStoreData] = useState({
    id: "",
    name: "",
    slug: "",
    category: "ELECTRONICS",
    countryCode: "NG",
    city: "Lagos",
    minimumOrderAmountMinor: "5000000",
    currencyCode: "NGN",
    logoUrl: "",
    // New Settlement/Escrow Parameters
    bankName: "",
    accountNumber: "",
    accountName: ""
  });

  const [productData, setProductData] = useState({
    id: "", 
    name: "",
    description: "",
    sku: "",
    priceAmountMinor: "18500000",
    currencyCode: "NGN",
    pricingUnit: "UNIT",
    moqValue: "10",
    moqUnit: "UNIT",
    imageUrl: ""
  });

  const [notificationData, setNotificationData] = useState({
    notifyEmail: true,
    notifySms: false,
    notifyCustomsHold: true,
    notifyManifestReady: true
  });

  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [cargoHistory, setCargoHistory] = useState<any[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState({
    totalShipmentsCount: 0,
    activeTransitCount: 0,
    deliveredCount: 0,
    customsHoldCount: 0
  });
  
  const [isEditingProduct, setIsEditingProduct] = useState(false);

  // --------------------------------------------------------------------------
  // FETCH DATA FROM BACKEND
  // --------------------------------------------------------------------------
  const loadSettingsData = async () => {
    try {
      setPageLoading(true);
      setErrorMessage(null);
      const api = await createApiClient(getToken);

      // 1. Get Profile Data
      try {
        const userPayload = await api<ApiResponseEnvelope<any>>("api/user");
        if (userPayload?.status && userPayload.data) {
          setProfileData({
            firstName: userPayload.data.firstName || "",
            lastName: userPayload.data.lastName || "",
            email: userPayload.data.email || "",
            phone: userPayload.data.phone || "",
            profileImageUrl: userPayload.data.profileImageUrl || ""
          });
        }
      } catch (err) {
        console.warn("Could not load user profile.");
      }

      // 2. Get Business Store Data & Escrow parameters
      let storeId = "";
      try {
        const storePayload = await api<ApiResponseEnvelope<any>>("api/marketplace/stores?mine=true");
        if (storePayload?.status && storePayload.data?.stores?.length > 0) {
          const matchedStore = storePayload.data.stores[0];
          storeId = matchedStore.id;
          setStoreData({
            id: matchedStore.id || "",
            name: matchedStore.name || "",
            slug: matchedStore.slug || "",
            category: matchedStore.category || "ELECTRONICS",
            countryCode: matchedStore.countryCode || "NG",
            city: matchedStore.city || "Lagos",
            minimumOrderAmountMinor: String(matchedStore.minimumOrderAmountMinor || "0"),
            currencyCode: matchedStore.currencyCode || "NGN",
            logoUrl: matchedStore.logoUrl || "" ,
            bankName: matchedStore.bankName || "",
            accountNumber: matchedStore.accountNumber || "",
            accountName: matchedStore.accountName || ""
          });
          setProductData(prev => ({ ...prev, currencyCode: matchedStore.currencyCode || "NGN" }));
        }
      } catch (storeErr) {
        console.log("No store created for this account yet.");
      }

      // 3. Get Store Products
      if (storeId) {
        try {
          const productsPayload = await api<ApiResponseEnvelope<any>>(`api/marketplace/stores/${storeId}/products`);
          if (productsPayload?.status && productsPayload.data?.products) {
            setMyProducts(Array.isArray(productsPayload.data.products) ? productsPayload.data.products : []);
          }
        } catch (prodErr) {
          console.warn("Could not load store products.");
        }
      }

      // 4. Get Shipments & Analytics
      try {
        const shipmentPayload = await api<ApiResponseEnvelope<any>>("api/shipment?limit=100");
        if (shipmentPayload?.status && shipmentPayload.data?.shipments) {
          const list = shipmentPayload.data.shipments || [];
          setCargoHistory(list);
          
          setAnalyticsSummary({
            totalShipmentsCount: list.length,
            activeTransitCount: list.filter((s: any) => s.status === "IN_TRANSIT").length,
            deliveredCount: list.filter((s: any) => s.status === "DELIVERED").length,
            customsHoldCount: list.filter((s: any) => s.status === "CUSTOMS_HOLD").length
          });
        }
      } catch (analyticsErr) {
        setCargoHistory([]);
      }

      // 5. Get Notification Settings
      try {
        const notificationsPayload = await api<ApiResponseEnvelope<any>>("api/user/settings/notifications");
        if (notificationsPayload?.status && notificationsPayload.data) {
          const pref = notificationsPayload.data;
          setNotificationData({
            notifyEmail: pref.notifyEmail ?? true,
            notifySms: pref.notifySms ?? false,
            notifyCustomsHold: pref.notifyCustomsHold ?? true,
            notifyManifestReady: pref.notifyManifestReady ?? true
          });
        }
      } catch (notifErr) {
        console.log("Could not load custom notification rules, using system defaults.");
      }

    } catch (err: any) {
      console.error("Error syncing dashboard data:", err);
      setErrorMessage("Failed to load your account settings. Please refresh the page.");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, [getToken]);

  // --------------------------------------------------------------------------
  // ACTIONS & SUBMISSIONS
  // --------------------------------------------------------------------------
  const startEditingProduct = (targetProduct: any) => {
    setIsEditingProduct(true);
    setActiveTab("products");
    setProductData({
      id: targetProduct.id,
      name: targetProduct.name,
      description: targetProduct.description || "",
      sku: targetProduct.sku || "",
      priceAmountMinor: String(targetProduct.priceAmountMinor),
      currencyCode: targetProduct.currencyCode || storeData.currencyCode || "NGN",
      pricingUnit: targetProduct.pricingUnit || "UNIT",
      moqValue: String(targetProduct.moqValue || "1"),
      moqUnit: targetProduct.moqUnit || "UNIT",
      imageUrl: targetProduct.imageUrl || ""
    });
  };

  const deleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      setActionLoading(true);
      const api = await createApiClient(getToken);
      await api(`api/marketplace/stores/${storeData.id}/products/${productId}`, { method: "DELETE" });
      loadSettingsData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete product.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setErrorMessage(null);
      const api = await createApiClient(getToken);

      if (activeTab === "profile") {
        await api("api/user", {
          method: "PATCH",
          body: JSON.stringify({
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            phone: profileData.phone,
            profileImageUrl: profileData.profileImageUrl || undefined
          })
        });
      } 
      else if (activeTab === "business") {
        const hasStore = !!storeData.id;
        const endpoint = hasStore ? `api/marketplace/stores/${storeData.id}` : "api/marketplace/stores";
        const method = hasStore ? "PATCH" : "POST";
        const autoSlug = storeData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

        const storeResponse = await api<ApiResponseEnvelope<any>>(endpoint, {
          method,
          body: JSON.stringify({
            name: storeData.name,
            slug: storeData.slug || autoSlug,
            countryCode: storeData.countryCode,
            city: storeData.city,
            category: storeData.category,
            logoUrl: storeData.logoUrl || undefined,
            minimumOrderAmountMinor: parseInt(storeData.minimumOrderAmountMinor, 10) || 0,
            currencyCode: storeData.currencyCode,
            // Appending payout ledger objects for the express schema payload
            bankName: storeData.bankName,
            accountNumber: storeData.accountNumber,
            accountName: storeData.accountName
          })
        });

        if (storeResponse?.status && storeResponse.data?.id) {
          setStoreData(prev => ({ ...prev, id: storeResponse.data.id }));
        }
      }
      else if (activeTab === "products") {
        if (!storeData.id) throw new Error("Please create a Business Profile first before adding products.");
        const endpoint = isEditingProduct 
          ? `api/marketplace/stores/${storeData.id}/products/${productData.id}`
          : `api/marketplace/stores/${storeData.id}/products`;
        const method = isEditingProduct ? "PATCH" : "POST";

        await api(endpoint, {
          method,
          body: JSON.stringify({
            name: productData.name,
            description: productData.description || undefined,
            sku: productData.sku || undefined,
            priceAmountMinor: parseInt(productData.priceAmountMinor, 10) || 0,
            currencyCode: productData.currencyCode,
            pricingUnit: productData.pricingUnit,
            moqValue: parseInt(productData.moqValue, 10) || 1,
            moqUnit: productData.moqUnit,
            imageUrl: productData.imageUrl || undefined
          })
        });

        setIsEditingProduct(false);
        setProductData({
          id: "", name: "", description: "", sku: "", priceAmountMinor: "18500000",
          currencyCode: storeData.currencyCode || "NGN", pricingUnit: "UNIT", moqValue: "10", moqUnit: "UNIT", imageUrl: ""
        });
      }
      else if (activeTab === "notifications") {
        await api("api/user/settings/notifications", {
          method: "PATCH",
          body: JSON.stringify({
            notifyEmail: notificationData.notifyEmail,
            notifySms: notificationData.notifySms,
            notifyCustomsHold: notificationData.notifyCustomsHold,
            notifyManifestReady: notificationData.notifyManifestReady
          })
        });
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      loadSettingsData();
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong while saving settings.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col md:flex-row font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* APP LOGO SECTION */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2 bg-white/80 rounded-xl backdrop-blur-md border border-slate-200/80 p-2 shadow-sm md:top-5 md:left-6">
        <div className="relative h-8 w-8 rounded-lg overflow-hidden">
          <Image src="/zeon-logo.jpg" alt="Zeon Systems" fill priority className="object-contain" />
        </div>
        <span className="text-xs font-mono font-black tracking-wider text-slate-900">ZEON<span className="text-indigo-600">.SYS</span></span>
      </div>

      <Sidebar />

      <main className="flex-1 w-full p-4 pt-20 md:p-8 md:pl-28 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* TOP APP BAR */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Account Settings 
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">V2.4</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">Manage your merchant profile, catalog inventory, and shipping updates.</p>
            </div>
            <button 
              onClick={() => { if(window.confirm("Are you sure you want to log out?")) signOut?.(); }}
              className="flex items-center gap-2 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all active:scale-95 shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900 backdrop-blur-md animate-shake">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
              <div className="text-xs font-mono">
                <span className="font-black text-rose-700 block tracking-widest">ERROR:</span>
                <p className="mt-0.5 text-rose-800 font-sans">{errorMessage}</p>
              </div>
            </div>
          )}

          {isSaved && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 animate-fadeIn">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span className="text-xs font-bold font-mono tracking-wider">CHANGES SAVED SUCCESSFULLY.</span>
            </div>
          )}

          {pageLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="p-3 bg-white rounded-full border border-slate-200 animate-spin">
                <RefreshCw className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Loading your preferences...</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-start">
              
              {/* SIDE NAVIGATION TABS */}
              <nav className="w-full md:w-60 shrink-0 flex flex-row md:flex-col bg-white border border-slate-200 rounded-2xl p-2 gap-1 overflow-x-auto md:overflow-x-visible shadow-sm">
                <button type="button" onClick={() => setActiveTab("profile")} className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === "profile" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}><User className="h-4 w-4" /><span>My Profile</span></button>
                <button type="button" onClick={() => setActiveTab("business")} className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === "business" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}><Building2 className="h-4 w-4" /><span>Business Profile</span></button>
                <button type="button" disabled={!storeData.id} onClick={() => { setActiveTab("products"); setIsEditingProduct(false); }} className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${!storeData.id ? "opacity-25 cursor-not-allowed" : ""} ${activeTab === "products" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}><PackagePlus className="h-4 w-4" /><span>Product Manager</span></button>
                <button type="button" onClick={() => setActiveTab("analytics")} className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === "analytics" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}><BarChart3 className="h-4 w-4" /><span>Shipping Analytics</span></button>
                <button type="button" onClick={() => setActiveTab("notifications")} className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === "notifications" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}><Bell className="h-4 w-4" /><span>Notifications</span></button>
                <button type="button" onClick={() => setActiveTab("security")} className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === "security" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}><ShieldCheck className="h-4 w-4" /><span>Security</span></button>
              </nav>

              {/* MAIN CONTENT WORKSPACE */}
              <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm overflow-hidden">
                
                {/* 1. MY PROFILE WORKSPACE */}
                {activeTab === "profile" && (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900 tracking-wide">Personal Information</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Update your own name and contact credentials.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">First Name</label>
                        <input type="text" value={profileData.firstName} onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))} className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-slate-900" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
                        <input type="text" value={profileData.lastName} onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))} className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-slate-900" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                        <input type="text" placeholder="+2348012345678" value={profileData.phone} onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))} className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-slate-900" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Profile Image URL</label>
                        <input type="text" placeholder="https://example.com/avatar.png" value={profileData.profileImageUrl} onChange={(e) => setProfileData(prev => ({ ...prev, profileImageUrl: e.target.value }))} className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-slate-900" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Email Address (Read-Only)</label>
                        <input type="email" disabled value={profileData.email} className="w-full text-xs font-mono font-bold bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-400 cursor-not-allowed" />
                      </div>
                    </div>
                    <div className="pt-3 flex justify-end">
                      <button type="submit" disabled={actionLoading} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md"><Save className="h-3.5 w-3.5" /><span>Save Profile</span></button>
                    </div>
                  </form>
                )}

                {/* 2. BUSINESS PROFILE & ESCROW SETTLEMENT PARAMETERS */}
                {activeTab === "business" && (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 tracking-wide">Business Information</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Setup and manage your company store profile on the marketplace.</p>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-md border ${storeData.id ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                        {storeData.id ? "ACTIVE STORE" : "NOT CREATED YET"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Registered Store Name</label>
                        <input type="text" required placeholder="Lagos Component Depots" value={storeData.name} onChange={(e) => setStoreData(prev => ({ ...prev, name: e.target.value }))} className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-slate-900" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Store Slug Link (URL handle)</label>
                        <input type="text" placeholder="lagos-components" value={storeData.slug} onChange={(e) => setStoreData(prev => ({ ...prev, slug: e.target.value }))} className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-slate-900" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Business Category</label>
                        <select value={storeData.category} onChange={(e) => setStoreData(prev => ({ ...prev, category: e.target.value }))} className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500">
                          <option value="ELECTRONICS">ELECTRONICS</option>
                          <option value="APPAREL">APPAREL</option>
                          <option value="MACHINERY">MACHINERY</option>
                          <option value="ECO_GOODS">ECO_GOODS</option>
                          <option value="FOOD_AND_AG">FOOD_AND_AG</option>
                          <option value="AUTOMOTIVE">AUTOMOTIVE</option>
                          <option value="DECOR">DECOR</option>
                          <option value="COSMETICS">COSMETICS</option>
                          <option value="LOGISTICS">LOGISTICS</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Country Code (2-Letters)</label>
                        <input type="text" required maxLength={2} placeholder="NG" value={storeData.countryCode} onChange={(e) => setStoreData(prev => ({ ...prev, countryCode: e.target.value.toUpperCase() }))} className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none text-slate-900" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Operating City</label>
                        <input type="text" required placeholder="Lagos" value={storeData.city} onChange={(e) => setStoreData(prev => ({ ...prev, city: e.target.value }))} className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none text-slate-900" />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Store Logo Image URL</label>
                        <input type="text" placeholder="https://example.com/logo.png" value={storeData.logoUrl} onChange={(e) => setStoreData(prev => ({ ...prev, logoUrl: e.target.value }))} className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none text-slate-900" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Payout Currency Code</label>
                        <input type="text" required placeholder="NGN" value={storeData.currencyCode} onChange={(e) => setStoreData(prev => ({ ...prev, currencyCode: e.target.value.toUpperCase() }))} className="w-full text-xs font-mono font-black bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none text-slate-900" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Minimum Order Amount (In lowest Unit, e.g. Kobo)</label>
                        <input type="text" required placeholder="5000000" value={storeData.minimumOrderAmountMinor} onChange={(e) => setStoreData(prev => ({ ...prev, minimumOrderAmountMinor: e.target.value }))} className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none text-slate-900" />
                      </div>
                    </div>

                    {/* NEW SECTION: CLEARANCE PAYOUT & ESCROW BANK DETAILED LEDGER */}
                    <div className="border-t border-slate-100 pt-5 space-y-4">
                      <div className="flex items-center gap-2 text-indigo-600">
                        <DollarSign className="h-4 w-4" />
                        <h4 className="text-xs font-black uppercase tracking-wider font-mono">Escrow Settlement Routing Account</h4>
                      </div>
                      <p className="text-[11px] text-slate-500">Provide bank destination properties to automate freight escrow settlements after terminal sign-offs.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Settlement Bank Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g., Zenith Bank, GTBank" 
                            value={storeData.bankName} 
                            onChange={(e) => setStoreData(prev => ({ ...prev, bankName: e.target.value }))} 
                            className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-slate-900" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">NUBAN Account Number</label>
                          <input 
                            type="text" 
                            maxLength={10}
                            placeholder="10-Digit Account Number" 
                            value={storeData.accountNumber} 
                            onChange={(e) => setStoreData(prev => ({ ...prev, accountNumber: e.target.value.replace(/[^0-9]/g, "") }))} 
                            className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-slate-900" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Account Name (Verified Holder)</label>
                          <input 
                            type="text" 
                            placeholder="e.g., Logistics Ltd" 
                            value={storeData.accountName} 
                            onChange={(e) => setStoreData(prev => ({ ...prev, accountName: e.target.value }))} 
                            className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-slate-900" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 flex justify-end">
                      <button type="submit" disabled={actionLoading} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md">
                        <Save className="h-3.5 w-3.5" />
                        <span>Save Store Profile</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* 3. PRODUCT MANAGER */}
                {activeTab === "products" && (
                  <div className="space-y-8">
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 tracking-wide">{isEditingProduct ? "Edit Product Details" : "Add New Product to Catalog"}</h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">Publish or adjust your listed item details for buyers.</p>
                        </div>
                        {isEditingProduct && (
                          <button type="button" onClick={() => {
                            setIsEditingProduct(false);
                            setProductData({ id: "", name: "", description: "", sku: "", priceAmountMinor: "18500000", currencyCode: storeData.currencyCode, pricingUnit: "UNIT", moqValue: "10", moqUnit: "UNIT", imageUrl: "" });
                          }} className="text-[10px] font-mono font-bold text-rose-600 hover:text-rose-700">Cancel Edit</button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Product Title</label>
                          <input type="text" required placeholder="Wireless Telemetry Node Array" value={productData.name} onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))} className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">SKU Code (Inventory ID)</label>
                          <input type="text" placeholder="WTN-001" value={productData.sku} onChange={(e) => setProductData(prev => ({ ...prev, sku: e.target.value }))} className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Price (In Lowest Unit, e.g. Kobo)</label>
                          <input type="text" required value={productData.priceAmountMinor} onChange={(e) => setProductData(prev => ({ ...prev, priceAmountMinor: e.target.value }))} className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none" />
                        </div>
                      </div>
                      <div className="pt-3 flex justify-end">
                        <button type="submit" disabled={actionLoading} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm"><Save className="h-3.5 w-3.5" /><span>{isEditingProduct ? "Update Item" : "Publish Product"}</span></button>
                      </div>
                    </form>

                    {/* PRODUCT LIST MATRIX */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">Active Catalog Inventory ({myProducts.length})</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {myProducts.map((p) => (
                          <div key={p.id} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-all">
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{p.name}</p>
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">SKU: {p.sku || "N/A"} • Price Units: {p.priceAmountMinor} {p.currencyCode}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => startEditingProduct(p)} className="p-2 text-slate-500 hover:text-indigo-600 bg-slate-50 border rounded-lg"><Edit3 className="h-3.5 w-3.5" /></button>
                              <button onClick={() => deleteProduct(p.id)} className="p-2 text-slate-500 hover:text-rose-600 bg-slate-50 border rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. SHIPPING ANALYTICS */}
                {activeTab === "analytics" && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900 tracking-wide">Freight Tracking Analytics</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Overview metrics derived from global allocation lines.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl text-center"><p className="text-lg font-black text-slate-900">{analyticsSummary.totalShipmentsCount}</p><p className="text-[9px] font-mono tracking-wider uppercase text-slate-400 mt-0.5">Total Shipments</p></div>
                      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-center"><p className="text-lg font-black text-indigo-600">{analyticsSummary.activeTransitCount}</p><p className="text-[9px] font-mono tracking-wider uppercase text-indigo-400 mt-0.5">In Transit</p></div>
                      <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center"><p className="text-lg font-black text-emerald-600">{analyticsSummary.deliveredCount}</p><p className="text-[9px] font-mono tracking-wider uppercase text-emerald-400 mt-0.5">Delivered</p></div>
                      <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-center"><p className="text-lg font-black text-amber-600">{analyticsSummary.customsHoldCount}</p><p className="text-[9px] font-mono tracking-wider uppercase text-amber-400 mt-0.5">Customs Hold</p></div>
                    </div>
                  </div>
                )}

                {/* 5. NOTIFICATIONS PREFERENCES */}
                {activeTab === "notifications" && (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900 tracking-wide">Notification Settings</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Control pipeline system update messaging triggers.</p>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl cursor-pointer"><input type="checkbox" checked={notificationData.notifyEmail} onChange={(e) => setNotificationData(prev => ({ ...prev, notifyEmail: e.target.checked }))} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4" /><div><p className="font-bold text-slate-900 text-xs">Email Alerts</p><p className="text-[10px] text-slate-400">Receive full transaction matrices via primary email profiles.</p></div></label>
                      <label className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl cursor-pointer"><input type="checkbox" checked={notificationData.notifyCustomsHold} onChange={(e) => setNotificationData(prev => ({ ...prev, notifyCustomsHold: e.target.checked }))} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4" /><div><p className="font-bold text-slate-900 text-xs">Customs Hold Updates</p><p className="text-[10px] text-slate-400">Immediate priority triggers when customs hold statuses fire.</p></div></label>
                    </div>
                    <div className="pt-3 flex justify-end">
                      <button type="submit" disabled={actionLoading} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md"><Save className="h-3.5 w-3.5" /><span>Save Rules</span></button>
                    </div>
                  </form>
                )}

                {/* 6. ACCOUNT SECURITY */}
                {activeTab === "security" && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900 tracking-wide">Security Gateways</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Account tokens and cryptography context layers.</p>
                    </div>
                    <div className="p-4 bg-slate-50 border rounded-xl flex items-start gap-3">
                      <Lock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 text-xs">Clerk Managed Sessions</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Authentication credentials, security tokens, and passwords are fully isolated under sovereign Clerk encryption boundaries.</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}