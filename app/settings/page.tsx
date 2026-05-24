"use client";

import React, { useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import { 
  User, 
  Building2, 
  Bell, 
  ShieldCheck, 
  CreditCard, 
  LogOut, 
  Save, 
  CheckCircle2,
  Lock,
  Globe
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaved, setIsSaved] = useState(false);

  // Form State Mock
  const [profileData, setProfileData] = useState({
    businessName: "Zexon Light Logistics Ltd",
    contactName: "Tunde Balogun",
    email: "tunde@zexonlight.com",
    phone: "+234 812 345 6789",
    rcNumber: "RC-1794021", // Essential for Nigerian medium scale business authentication
    currency: "NGN (₦)",
    notifyEmail: true,
    notifySMS: false,
    notifyCustomsHold: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogout = () => {
    // Simple verification dialog before clearing session pathing
    const confirmLogout = window.confirm("Are you sure you want to log out of White Zexon Corp?");
    if (confirmLogout) {
      console.log("Clearing authenticated token credentials...");
      window.location.href = "/login";
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 antialiased flex flex-col md:flex-row">
      
      {/* BRANDING TOP LEFT CONTAINER */}
      <div className="absolute top-4 left-4 z-30 flex flex-col items-center gap-2 bg-white/75 rounded-full backdrop-blur-md border border-slate-200/50 p-1 shadow-sm md:top-5 md:left-6">
        <div className="relative h-16 w-16 rounded-full object-contain">
          <Image 
            src="/zeon-logo.jpg" 
            alt="Zeon Systems Logo" 
            fill
            sizes="36px"
            priority
            className="object-contain rounded-full"
          />
        </div>
      </div>

      <Sidebar />

      {/* MAIN WORKSPACE WRAPPER */}
      <main className="w-full h-full pt-20 pb-24 px-4 md:pl-28 md:pt-6 md:pb-6 md:pr-6 relative z-10 flex-1 overflow-y-auto scrollbar-thin">
        <div className="w-full max-w-5xl mx-auto space-y-6">
          
          {/* Page Heading */}
          <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
                System Configurations
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your enterprise identity profile, settlement ledger targets, and operational cargo trigger thresholds.
              </p>
            </div>

            {/* Logout Trigger (Header Placement for explicit accessibility) */}
            <button 
              onClick={handleLogout}
              className="self-start md:self-center flex items-center gap-2 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-lg transition-colors shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Settings Core Partition Split */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* LEFT TIER: Navigation Navigation Tabs */}
            <nav className="w-full md:w-64 shrink-0 flex flex-row md:flex-col bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm overflow-x-auto md:overflow-x-visible gap-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all text-left whitespace-nowrap ${
                  activeTab === "profile" 
                    ? "bg-slate-950 text-white shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Business Identity</span>
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all text-left whitespace-nowrap ${
                  activeTab === "security" 
                    ? "bg-slate-950 text-white shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Security & API</span>
              </button>

              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all text-left whitespace-nowrap ${
                  activeTab === "notifications" 
                    ? "bg-slate-950 text-white shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Bell className="h-3.5 w-3.5" />
                <span>Alert Rules</span>
              </button>
            </nav>

            {/* RIGHT TIER: Dynamic Panel Body Workspace */}
            <div className="flex-1 w-full bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* PANEL A: BUSINESS PROFILE TAB */}
                {activeTab === "profile" && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900">SME Corporate Data</h3>
                      <p className="text-[11px] text-slate-500">Ensure verification matrices exactly align with your CAC legal entity papers.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Business Name</label>
                        <input 
                          type="text" 
                          name="businessName"
                          value={profileData.businessName} 
                          onChange={handleInputChange}
                          className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CAC Registration Number (RC / BN)</label>
                        <input 
                          type="text" 
                          name="rcNumber"
                          value={profileData.rcNumber} 
                          onChange={handleInputChange}
                          className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Operations Officer</label>
                        <input 
                          type="text" 
                          name="contactName"
                          value={profileData.contactName} 
                          onChange={handleInputChange}
                          className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Currency Core</label>
                        <input 
                          type="text" 
                          name="currency"
                          disabled
                          value={profileData.currency} 
                          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-400 cursor-not-allowed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Corporate Email Address</label>
                        <input 
                          type="email" 
                          name="email"
                          value={profileData.email} 
                          onChange={handleInputChange}
                          className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Communication Line</label>
                        <input 
                          type="text" 
                          name="phone"
                          value={profileData.phone} 
                          onChange={handleInputChange}
                          className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PANEL B: SECURITY & API ENDPOINTS */}
                {activeTab === "security" && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900">Credential Architecture</h3>
                      <p className="text-[11px] text-slate-500">Protect system integrations linking your wallet calculations to public clearing models.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                        <Lock className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-slate-700 block">Password Key Matrix</span>
                          <span className="text-[11px] text-slate-500">Change regular credentials updating dashboard authentication loops.</span>
                          <button type="button" className="mt-2 text-[10px] font-bold text-blue-600 hover:underline tracking-wide uppercase block">
                            Initiate Reset Pipeline
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-lg flex items-start gap-3">
                        <Globe className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-blue-700 block">Automated Clearer Webhooks</span>
                          <span className="text-[11px] text-slate-500">Configure public payloads to hit external ERP modules when container statuses flip.</span>
                          <input 
                            type="text" 
                            readOnly
                            value="https://api.whitezexon.com/v1/webhooks/clearing-hook-active"
                            className="mt-2 w-full font-mono text-[10px] p-2 bg-white border border-blue-100 rounded text-slate-600 select-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PANEL C: ALERTS & NOTIFICATIONS RULES */}
                {activeTab === "notifications" && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900">Real-Time Routing Infrastructure</h3>
                      <p className="text-[11px] text-slate-500">Dictate how dispatch matrices alert your supply managers during transport friction events.</p>
                    </div>

                    <div className="space-y-3.5 pt-1">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          name="notifyEmail"
                          checked={profileData.notifyEmail}
                          onChange={handleInputChange}
                          className="mt-1 h-3.5 w-3.5 accent-blue-600 rounded"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">Email Global Manifest Reports</span>
                          <span className="text-[11px] text-slate-500 block">Receive complete landed accounting breakdowns directly in your inbox upon offload validation.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          name="notifyCustomsHold"
                          checked={profileData.notifyCustomsHold}
                          onChange={handleInputChange}
                          className="mt-1 h-3.5 w-3.5 accent-blue-600 rounded"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">Instant Customs Hold Escalation</span>
                          <span className="text-[11px] text-amber-700 block">Flag urgent delays instantly if any terminal officer freezes pool slots at Tin Can or Apapa.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          name="notifySMS"
                          checked={profileData.notifySMS}
                          onChange={handleInputChange}
                          className="mt-1 h-3.5 w-3.5 accent-blue-600 rounded"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors block">Direct Mobile SMS Flash</span>
                          <span className="text-[11px] text-slate-500 block">Push updates to regional managers when vessels breach territorial dock borders. (Standard regional carrier rates apply).</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* BOTTOM COMPOSITE PERSISTENCE STRIP */}
                <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    {isSaved && (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs animate-fade-in">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>System states updated successfully.</span>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit"
                    className="w-full sm:w-auto bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Commit Settings</span>
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}