/**
 * ============================================================================
 * ZEON SYSTEMS - MERCHANT SETTINGS & PRODUCT HUB (V3.0 FULL MULTI-STORE CRUD)
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
  Plus,
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

const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank Nigeria", code: "023" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank (FCMB)", code: "214" },
  { name: "Globus Bank", code: "001" },
  { name: "Guaranty Trust Bank (GTBank)", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Keystone Bank", code: "082" },
  { name: "Optimus Bank", code: "107" },
  { name: "Parallex Bank", code: "104" },
  { name: "PremiumTrust Bank", code: "105" },
  { name: "Providus Bank", code: "101" },
  { name: "Signature Bank", code: "106" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "SunTrust Bank", code: "100" },
  { name: "Titan Trust Bank", code: "102" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "United Bank for Africa (UBA)", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>("profile");
  const [isSaved, setIsSaved] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { getToken, signOut } = useAuth();

  // --------------------------------------------------------------------------
  // MULTI-STORE ROUTING & STATE ENGINE
  // --------------------------------------------------------------------------
  const [myStores, setMyStores] = useState<any[]>([]);
  const [selectedStoreIndex, setSelectedStoreIndex] = useState<number>(0);
  const [isCreatingNewStore, setIsCreatingNewStore] = useState<boolean>(false);

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
    logoUrl: ""
  });

  const [bankAccountData, setBankAccountData] = useState({
    id: "",
    accountNumber: "",
    accountName: "",
    accountType: "CURRENT",
    holderType: "BUSINESS",
    bankName: "",
    bankCode: ""
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

  // Sync state parameters cleanly when active store focus shifts
  useEffect(() => {
    if (myStores.length > 0 && !isCreatingNewStore) {
      const activeStore = myStores[selectedStoreIndex];
      if (activeStore) {
        setStoreData({
          id: activeStore.id || "",
          name: activeStore.name || "",
          slug: activeStore.slug || "",
          category: activeStore.category || "ELECTRONICS",
          countryCode: activeStore.countryCode || "NG",
          city: activeStore.city || "Lagos",
          minimumOrderAmountMinor: String(activeStore.minimumOrderAmountMinor || "0"),
          currencyCode: activeStore.currencyCode || "NGN",
          logoUrl: activeStore.logoUrl || ""
        });
        setProductData(prev => ({ ...prev, currencyCode: activeStore.currencyCode || "NGN" }));
        
        fetchActiveStoreBank(activeStore.id);
        fetchActiveStoreProducts(activeStore.id);
      }
    }
  }, [selectedStoreIndex, myStores, isCreatingNewStore]);

  const fetchActiveStoreBank = async (storeId: string) => {
    try {
      const api = await createApiClient(getToken);
      const bankPayload = await api<ApiResponseEnvelope<any>>(`api/marketplace/stores/${storeId}/bank-accounts`);
      if (bankPayload?.status && bankPayload.data?.length > 0) {
        const primaryAcct = bankPayload.data[0];
        setBankAccountData({
          id: primaryAcct.id,
          accountNumber: primaryAcct.accountNumber || "",
          accountName: primaryAcct.accountName || "",
          accountType: primaryAcct.accountType || "CURRENT",
          holderType: primaryAcct.holderType || "BUSINESS",
          bankName: primaryAcct.bankName || "",
          bankCode: primaryAcct.bankCode || ""
        });
      } else {
        resetBankForm();
      }
    } catch (err) {
      resetBankForm();
    }
  };

  const fetchActiveStoreProducts = async (storeId: string) => {
    try {
      const api = await createApiClient(getToken);
      const productsPayload = await api<ApiResponseEnvelope<any>>(`api/marketplace/stores/${storeId}/products`);
      if (productsPayload?.status && productsPayload.data?.products) {
        setMyProducts(Array.isArray(productsPayload.data.products) ? productsPayload.data.products : []);
      }
    } catch (err) {
      setMyProducts([]);
    }
  };

  const resetBankForm = () => {
    setBankAccountData({ id: "", accountNumber: "", accountName: "", accountType: "CURRENT", holderType: "BUSINESS", bankName: "", bankCode: "" });
  };

  const loadSettingsData = async (forceSelectStoreId?: string) => {
    try {
      setPageLoading(true);
      setErrorMessage(null);
      const api = await createApiClient(getToken);

      // Load Profile
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
      } catch (err) { console.warn("Could not load user profile."); }

      // Fetch Stores Matrix
      try {
        const storePayload = await api<ApiResponseEnvelope<any>>("api/marketplace/stores?mine=true");
        if (storePayload?.status && storePayload.data?.stores) {
          const storesList = storePayload.data.stores;
          setMyStores(storesList);
          
          if (storesList.length === 0) {
            triggerNewStoreMode();
          } else if (forceSelectStoreId) {
            const foundIdx = storesList.findIndex((s: any) => s.id === forceSelectStoreId);
            setSelectedStoreIndex(foundIdx !== -1 ? foundIdx : 0);
            setIsCreatingNewStore(false);
          } else if (selectedStoreIndex >= storesList.length) {
            setSelectedStoreIndex(0);
          }
        }
      } catch (storeErr) {
        triggerNewStoreMode();
      }

      // Load Analytics
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
      } catch (analyticsErr) { setCargoHistory([]); }

    } catch (err: any) {
      setErrorMessage("Failed to refresh ledger environment states.");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, [getToken]);

  const handleBankSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const match = NIGERIAN_BANKS.find(b => b.code === code);
    if (match) {
      setBankAccountData(prev => ({ ...prev, bankCode: match.code, bankName: match.name }));
    }
  };

  const triggerNewStoreMode = () => {
    setIsCreatingNewStore(true);
    setStoreData({
      id: "",
      name: "",
      slug: "",
      category: "ELECTRONICS",
      countryCode: "NG",
      city: "Lagos",
      minimumOrderAmountMinor: "5000000",
      currencyCode: "NGN",
      logoUrl: ""
    });
    resetBankForm();
  };

  // --------------------------------------------------------------------------
  // STORE DELETION SUB-PIPELINE (SOFT DELETE DISPATCH)
  // --------------------------------------------------------------------------
  const handleDeleteStore = async () => {
    if (!storeData.id) return;
    const confirmation = window.confirm(`CRITICAL ACTION: Are you sure you want to deactivate and remove store channel "${storeData.name}"?`);
    if (!confirmation) return;

    try {
      setActionLoading(true);
      setErrorMessage(null);
      const api = await createApiClient(getToken);

      // Hit accurate DELETE route for active handle target
      await api(`api/marketplace/stores/${storeData.id}`, { method: "DELETE" });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      
      // Flash structural focus array backwards
      setSelectedStoreIndex(0);
      loadSettingsData();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to successfully terminate the targeted store channel context.");
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // CENTRALIZED SUBMISSION PROCESSING GRID
  // --------------------------------------------------------------------------
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
        // Correct pipeline URLs mapped cleanly for dynamic creation or modification routing contexts
        const endpoint = !isCreatingNewStore ? `api/marketplace/stores/${storeData.id}` : "api/marketplace/stores";
        const method = !isCreatingNewStore ? "PATCH" : "POST";
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
            currencyCode: storeData.currencyCode
          })
        });

        let systemTargetStoreId = storeData.id;
        if (isCreatingNewStore && storeResponse?.status && storeResponse.data?.id) {
          systemTargetStoreId = storeResponse.data.id;
        }

        // Sub-Pipeline: Evaluate escrow bank routing parameters
        if (systemTargetStoreId && bankAccountData.accountNumber) {
          const bankEndpoint = !bankAccountData.id 
            ? `api/marketplace/stores/${systemTargetStoreId}/bank-accounts` 
            : `api/marketplace/stores/${systemTargetStoreId}/bank-accounts/${bankAccountData.id}`;
          const bankMethod = !bankAccountData.id ? "POST" : "PATCH";

          await api(bankEndpoint, {
            method: bankMethod,
            body: JSON.stringify({
              accountNumber: bankAccountData.accountNumber,
              accountName: bankAccountData.accountName,
              accountType: bankAccountData.accountType,
              holderType: bankAccountData.holderType,
              bankName: bankAccountData.bankName,
              bankCode: bankAccountData.bankCode,
              countryCode: storeData.countryCode,
              currencyCode: storeData.currencyCode,
              routingMetadata: { bank_code: bankAccountData.bankCode }
            })
          });
        }

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
        loadSettingsData(systemTargetStoreId);
      }
      else if (activeTab === "products") {
        if (!storeData.id) throw new Error("Please select or create an active Business Profile first.");
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
        
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
        fetchActiveStoreProducts(storeData.id);
      }

    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong while processing records.");
    } finally {
      setActionLoading(false);
    }
  };

  const startEditingProduct = (targetProduct: any) => {
    setIsEditingProduct(true);
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
      fetchActiveStoreProducts(storeData.id);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete product.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col md:flex-row font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2 bg-white/80 rounded-xl backdrop-blur-md border border-slate-200/80 p-2 shadow-sm md:top-5 md:left-6">
        <div className="relative h-8 w-8 rounded-lg overflow-hidden">
          <Image src="/zeon-logo.webp" alt="Zeon Systems" fill priority className="object-contain" />
        </div>
        <span className="text-xs font-mono font-black tracking-wider text-slate-900">ZEON<span className="text-indigo-600">.SYS</span></span>
      </div>

      <Sidebar />

      <main className="flex-1 w-full p-4 pt-20 md:p-8 md:pl-28 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          
          <div className="p-6 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Account Settings 
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">V3.0</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">Manage multiple marketplace storefronts, real-time escrow accounts, and catalog products.</p>
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
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900 backdrop-blur-md">
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
              <span className="text-xs font-bold font-mono tracking-wider">CHANGES PROPAGATED SUCCESSFULLY.</span>
            </div>
          )}

          {pageLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="p-3 bg-white rounded-full border border-slate-200 animate-spin">
                <RefreshCw className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Syncing ledger contexts...</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-start">
              
              <nav className="w-full md:w-60 shrink-0 flex flex-row md:flex-col bg-white border border-slate-200 rounded-2xl p-2 gap-1 overflow-x-auto md:overflow-x-visible shadow-sm">
                <button type="button" onClick={() => setActiveTab("profile")} className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === "profile" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}><User className="h-4 w-4" /><span>My Profile</span></button>
                <button type="button" onClick={() => setActiveTab("business")} className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === "business" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}><Building2 className="h-4 w-4" /><span>Store Channels</span></button>
                <button type="button" disabled={!storeData.id} onClick={() => { setActiveTab("products"); setIsEditingProduct(false); }} className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${!storeData.id ? "opacity-25 cursor-not-allowed" : ""} ${activeTab === "products" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}><PackagePlus className="h-4 w-4" /><span>Product Manager</span></button>
                <button type="button" onClick={() => setActiveTab("analytics")} className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === "analytics" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}><BarChart3 className="h-4 w-4" /><span>Shipping Analytics</span></button>
                <button type="button" onClick={() => setActiveTab("notifications")} className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === "notifications" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}><Bell className="h-4 w-4" /><span>Notifications</span></button>
                <button type="button" onClick={() => setActiveTab("security")} className={`w-full flex items-center gap-2.5 px-3.5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${activeTab === "security" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}><ShieldCheck className="h-4 w-4" /><span>Security</span></button>
              </nav>

              <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm overflow-hidden">
                
                {/* 1. MY PROFILE WORKSPACE */}
                {activeTab === "profile" && (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900 tracking-wide">Personal Information</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Update your contact credentials.</p>
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
                    </div>
                    <div className="pt-3 flex justify-end">
                      <button type="submit" disabled={actionLoading} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md"><Save className="h-3.5 w-3.5" /><span>Save Profile</span></button>
                    </div>
                  </form>
                )}

                {/* 2. BUSINESS PROFILE (FULL CRUD STORES HANDLING) */}
                {activeTab === "business" && (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Active Storefront Channels</label>
                      <div className="flex flex-wrap items-center gap-2">
                        {myStores.map((store, index) => (
                          <button
                            key={store.id}
                            type="button"
                            onClick={() => {
                              setIsCreatingNewStore(false);
                              setSelectedStoreIndex(index);
                            }}
                            className={`px-4 py-2.5 rounded-xl border font-bold text-xs transition-all ${
                              !isCreatingNewStore && selectedStoreIndex === index 
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {store.name}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={triggerNewStoreMode}
                          className={`px-3 py-2.5 rounded-xl border border-dashed font-bold text-xs flex items-center gap-1.5 transition-all ${
                            isCreatingNewStore 
                              ? "bg-amber-50 border-amber-400 text-amber-700" 
                              : "border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                          }`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add New Store</span>
                        </button>
                      </div>
                    </div>

                    <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                          {isCreatingNewStore ? "Register New Channel" : "Store Configuration Handle"}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Configure localized parameters and logistics channels.</p>
                      </div>

                      {/* DELETION CONTROLLER HANDLE */}
                      {!isCreatingNewStore && storeData.id && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={handleDeleteStore}
                          className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono font-bold tracking-wider text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-xl transition-all uppercase"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete Current Store</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Registered Store Name</label>
                        <input type="text" required placeholder="Lagos Component Depots" value={storeData.name} onChange={(e) => setStoreData(prev => ({ ...prev, name: e.target.value }))} className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-slate-900" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Store Slug Link</label>
                        <input type="text" placeholder="lagos-components" value={storeData.slug} onChange={(e) => setStoreData(prev => ({ ...prev, slug: e.target.value }))} className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none text-slate-900" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Business Category</label>
                        <select value={storeData.category} onChange={(e) => setStoreData(prev => ({ ...prev, category: e.target.value }))} className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none">
                          <option value="ELECTRONICS">ELECTRONICS</option>
                          <option value="APPAREL">APPAREL</option>
                          <option value="MACHINERY">MACHINERY</option>
                          <option value="FOOD_AND_AG">FOOD_AND_AG</option>
                          <option value="LOGISTICS">LOGISTICS</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Country Code</label>
                        <input type="text" required maxLength={2} placeholder="NG" value={storeData.countryCode} onChange={(e) => setStoreData(prev => ({ ...prev, countryCode: e.target.value.toUpperCase() }))} className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none text-slate-900" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Operating City</label>
                        <input type="text" required placeholder="Lagos" value={storeData.city} onChange={(e) => setStoreData(prev => ({ ...prev, city: e.target.value }))} className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none text-slate-900" />
                      </div>
                    </div>

                    {/* SETTLEMENT ENGINE SUB-FORM */}
                    <div className="border-t border-slate-100 pt-5 space-y-4">
                      <div className="flex items-center gap-2 text-indigo-600">
                        <DollarSign className="h-4 w-4" />
                        <h4 className="text-xs font-black uppercase tracking-wider font-mono">Escrow Settlement Routing Account</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Select Bank</label>
                          <select
                            value={bankAccountData.bankCode}
                            onChange={handleBankSelectChange}
                            className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none"
                          >
                            <option value="">-- Choose Bank --</option>
                            {NIGERIAN_BANKS.map((b) => (
                              <option key={b.code} value={b.code}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Account Number</label>
                          <input 
                            type="text" 
                            maxLength={10}
                            placeholder="10 Digits" 
                            value={bankAccountData.accountNumber} 
                            onChange={(e) => setBankAccountData(prev => ({ ...prev, accountNumber: e.target.value.replace(/[^0-9]/g, "") }))} 
                            className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none text-slate-900" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Account Name</label>
                          <input 
                            type="text" 
                            placeholder="Verified Holder Name" 
                            value={bankAccountData.accountName} 
                            onChange={(e) => setBankAccountData(prev => ({ ...prev, accountName: e.target.value }))} 
                            className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none text-slate-900" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 flex justify-end">
                      <button type="submit" disabled={actionLoading} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md">
                        <Save className="h-3.5 w-3.5" />
                        <span>{isCreatingNewStore ? "Provision Store Channel" : "Save Store Context"}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* 3. PRODUCT MANAGER */}
                {activeTab === "products" && (
                  <div className="space-y-8">
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 font-medium">
                      Managing products for channel: <strong className="font-black">{storeData.name}</strong>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Product Title</label>
                          <input type="text" required placeholder="Wireless Telemetry Node Array" value={productData.name} onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))} className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">SKU Code</label>
                          <input type="text" placeholder="WTN-001" value={productData.sku} onChange={(e) => setProductData(prev => ({ ...prev, sku: e.target.value }))} className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Price (Minor Unit)</label>
                          <input type="text" required value={productData.priceAmountMinor} onChange={(e) => setProductData(prev => ({ ...prev, priceAmountMinor: e.target.value }))} className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none" />
                        </div>
                      </div>
                      <div className="pt-3 flex justify-end">
                        <button type="submit" disabled={actionLoading} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm"><Save className="h-3.5 w-3.5" /><span>{isEditingProduct ? "Update Item" : "Publish Product"}</span></button>
                      </div>
                    </form>

                    <div className="space-y-3">
                      <h4 className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">Active Inventory Line ({myProducts.length})</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {myProducts.map((p) => (
                          <div key={p.id} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between gap-4">
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{p.name}</p>
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">SKU: {p.sku || "N/A"} • {p.priceAmountMinor} {p.currencyCode}</p>
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl text-center"><p className="text-lg font-black text-slate-900">{analyticsSummary.totalShipmentsCount}</p><p className="text-[9px] font-mono tracking-wider uppercase text-slate-400 mt-0.5">Total Shipments</p></div>
                      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl text-center"><p className="text-lg font-black text-indigo-600">{analyticsSummary.activeTransitCount}</p><p className="text-[9px] font-mono tracking-wider uppercase text-indigo-400 mt-0.5">In Transit</p></div>
                      <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center"><p className="text-lg font-black text-emerald-600">{analyticsSummary.deliveredCount}</p><p className="text-[9px] font-mono tracking-wider uppercase text-emerald-400 mt-0.5">Delivered</p></div>
                      <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-center"><p className="text-lg font-black text-amber-600">{analyticsSummary.customsHoldCount}</p><p className="text-[9px] font-mono tracking-wider uppercase text-amber-400 mt-0.5">Customs Hold</p></div>
                    </div>
                  </div>
                )}

                {/* 5. NOTIFICATIONS */}
                {activeTab === "notifications" && (
                  <div className="p-4 bg-slate-50 border rounded-xl text-xs text-slate-500 font-mono">
                    Notification settings pipeline optimized.
                  </div>
                )}

                {/* 6. ACCOUNT SECURITY */}
                {activeTab === "security" && (
                  <div className="p-4 bg-slate-50 border rounded-xl flex items-start gap-3">
                    <Lock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900 text-xs">Clerk Managed Sessions</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">Authentication credentials, security tokens, and passwords are fully isolated under sovereign Clerk encryption boundaries.</p>
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