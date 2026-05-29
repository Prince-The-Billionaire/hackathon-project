'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Ship, Plane, ArrowRight, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    primaryTradelane: 'export', // 'export' | 'import' | 'both'
  });

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-blue-50">
        <Loader2 className="animate-spin text-blue-600 size-10" />
      </div>
    );
  }

  // If onboarding was completed in a past session, bounce them out to dashboard root
  if (user?.publicMetadata?.onboardingComplete) {
    router.push('/');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectTradelane = (type: 'export' | 'import' | 'both') => {
    setFormData({ ...formData, primaryTradelane: type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await user?.reload();
        router.push('/dashboard'); // Dashboard Root
      } else {
        console.error('Failed to update onboarding data');
      }
    } catch (error) {
      console.error('Onboarding submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative bright/light gradient rings to tie into landing page styles */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/40 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-200/50 rounded-full filter blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-4xl font-black italic tracking-tight text-slate-900 uppercase">
          Welcome, {user?.firstName || 'Partner'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Let's configure your global logistics workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-200 sm:rounded-2xl sm:px-10">
          
          {/* Progress Tracker Bar */}
          <div className="mb-8 flex justify-between items-center text-xs text-slate-400 font-semibold tracking-wide uppercase">
            <span className={`pb-1 border-b-2 ${step >= 1 ? 'border-blue-600 text-slate-800 font-bold' : 'border-transparent'}`}>1. Corporate Profile</span>
            <span className={`pb-1 border-b-2 ${step === 2 ? 'border-blue-600 text-slate-800 font-bold' : 'border-transparent'}`}>2. Logistics Focus</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-semibold text-slate-700">
                    Company Legal Name
                  </label>
                  <input
                    required
                    type="text"
                    name="companyName"
                    id="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition shadow-sm"
                    placeholder="Global Trade Inc."
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-semibold text-slate-700">
                    Your Role / Job Title
                  </label>
                  <input
                    required
                    type="text"
                    name="role"
                    id="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition shadow-sm"
                    placeholder="Logistics Manager"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => formData.companyName && formData.role && setStep(2)}
                  disabled={!formData.companyName || !formData.role}
                  className="w-full flex justify-center items-center gap-2 rounded-xl py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Continue <ArrowRight className="size-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <label className="block text-sm font-semibold text-slate-700">
                  Primary Tradelane Focus
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['export', 'import', 'both'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSelectTradelane(type)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 capitalize font-bold transition ${
                        formData.primaryTradelane === type
                          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {type === 'export' && <Plane className="size-5 mb-2 text-blue-600" />}
                      {type === 'import' && <Ship className="size-5 mb-2 text-blue-600" />}
                      {type === 'both' && (
                        <div className="flex gap-1 mb-2 text-blue-600">
                          <Plane className="size-4" />
                          <Ship className="size-4" />
                        </div>
                      )}
                      <span className="text-xs">{type}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-xl py-3 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition active:scale-98"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex justify-center items-center gap-2 rounded-xl py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md active:scale-98 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin size-5" />
                    ) : (
                      'Complete Setup'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
}