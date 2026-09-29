import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Sprout,
  Smartphone,
  Shield,
  Truck,
  ShoppingBag,
  Building2,
  KeyRound,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  X
} from 'lucide-react';

export const UnifiedLoginModal: React.FC = () => {
  const { showLoginModal, setShowLoginModal, login, currentRole } = useApp();

  const [activeTab, setActiveTab] = useState<UserRole>(currentRole || 'farmer');
  
  // Farmer State
  const [farmerPhone, setFarmerPhone] = useState('9876543210');
  const [farmerOtp, setFarmerOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Officer & Transporter State
  const [officialId, setOfficialId] = useState('DOCA-OFFICER-102');
  const [password, setPassword] = useState('mandi@2026');

  // Local Buyer State
  const [buyerPhone, setBuyerPhone] = useState('9811187654');
  const [gstinOrLicense, setGstinOrLicense] = useState('09AABCA1234F1Z8');
  const [buyerOtp, setBuyerOtp] = useState('');
  const [buyerOtpSent, setBuyerOtpSent] = useState(false);

  if (!showLoginModal) return null;

  const handleFarmerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      setOtpSent(true);
      return;
    }
    // Authenticate and auto-route
    login('farmer', {
      phone: `+91 ${farmerPhone}`,
      name: 'Ramesh Patel'
    });
  };

  const handleOfficialLogin = (e: React.FormEvent, role: 'buyer' | 'transporter') => {
    e.preventDefault();
    login(role, {
      licenseOrId: officialId
    });
  };

  const handleLocalBuyerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerOtpSent) {
      setBuyerOtpSent(true);
      return;
    }
    login('local_buyer', {
      phone: `+91 ${buyerPhone}`,
      licenseOrId: `GSTIN: ${gstinOrLicense}`
    });
  };

  const handleKioskLogin = () => {
    login('kiosk');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface-card rounded-2xl shadow-2xl border border-surface-border overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-brand-dark px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">DoCA Smart Mandi Portal</h3>
              <p className="text-xs text-emerald-300">Unified Government & Farmer Authentication</p>
            </div>
          </div>
          <button
            onClick={() => setShowLoginModal(false)}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-4 bg-slate-100 p-1.5 border-b border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('farmer')}
            className={`py-2 px-1 text-center rounded-lg transition-all flex flex-col items-center gap-1 ${
              activeTab === 'farmer'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🧑🌾</span>
            <span className="truncate">Farmer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('buyer')}
            className={`py-2 px-1 text-center rounded-lg transition-all flex flex-col items-center gap-1 ${
              activeTab === 'buyer'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🏢</span>
            <span className="truncate">Officer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transporter')}
            className={`py-2 px-1 text-center rounded-lg transition-all flex flex-col items-center gap-1 ${
              activeTab === 'transporter'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🚛</span>
            <span className="truncate">Transporter</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('local_buyer')}
            className={`py-2 px-1 text-center rounded-lg transition-all flex flex-col items-center gap-1 ${
              activeTab === 'local_buyer'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🏪</span>
            <span className="truncate">Local Buyer</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* 1. Farmer Phone + OTP (Passwordless) */}
          {activeTab === 'farmer' && (
            <form onSubmit={handleFarmerLogin} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Fast Passwordless Access:</span> Farmers log in with their registered mobile number. A 6-digit OTP ensures secure access.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Number (registered with Kisan Credit / Aadhaar)
                </label>
                <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary">
                  <span className="bg-slate-100 text-slate-600 px-3 py-2 text-sm font-medium border-r border-slate-300">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="flex-1 px-3 py-2 text-sm text-slate-900 outline-none"
                  />
                </div>
              </div>

              {otpSent && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Enter 6-Digit OTP sent via SMS</span>
                    <span className="text-emerald-600 font-normal">Use demo: 123456</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={farmerOtp}
                    onChange={(e) => setFarmerOtp(e.target.value)}
                    placeholder="1 2 3 4 5 6"
                    className="w-full tracking-widest text-center text-lg font-bold px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                {!otpSent ? 'Send One-Time Password (OTP)' : 'Verify OTP & Enter Farmer Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>No smartphone?</span>
                <button
                  type="button"
                  onClick={handleKioskLogin}
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  Enter CSC / Panchayat Kiosk Mode ➔
                </button>
              </div>
            </form>
          )}

          {/* 2. Procurement Officer Login */}
          {activeTab === 'buyer' && (
            <form onSubmit={(e) => handleOfficialLogin(e, 'buyer')} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">DoCA Official Access:</span> Authorized Mandi in-charge, weighbridge operators, and quality inspectors.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Government Employee ID / Center Code
                </label>
                <input
                  type="text"
                  required
                  value={officialId}
                  onChange={(e) => setOfficialId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password / Passcode
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                Sign In to Officer Command Center
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 3. Transporter Login */}
          {activeTab === 'transporter' && (
            <form onSubmit={(e) => handleOfficialLogin(e, 'transporter')} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Fleet & Driver Login:</span> For authorized freight contractors and truck drivers transporting buffer stocks.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Vehicle Registration / Contractor License
                </label>
                <input
                  type="text"
                  required
                  value="UP 32 BN 4410 (Suresh Maurya)"
                  readOnly
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Driver PIN / OTP
                </label>
                <input
                  type="password"
                  defaultValue="4410"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none font-mono tracking-widest"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                Enter Transporter Cockpit
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 4. Local Buyer Login (Marketplace) */}
          {activeTab === 'local_buyer' && (
            <form onSubmit={handleLocalBuyerLogin} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
                <FileCheck2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Licensed Merchant Verification:</span> To keep the marketplace fraud-free, enter your verified Trade License or GSTIN.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Trade License / GSTIN
                </label>
                <input
                  type="text"
                  required
                  value={gstinOrLicense}
                  onChange={(e) => setGstinOrLicense(e.target.value)}
                  placeholder="09AABCA1234F1Z8"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>

              {buyerOtpSent && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Enter OTP</span>
                    <span className="text-emerald-600 font-normal">Use demo: 123456</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerOtp}
                    onChange={(e) => setBuyerOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full tracking-widest text-center text-lg font-bold px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                {!buyerOtpSent ? 'Verify GSTIN & Send OTP' : 'Enter Open Market Board'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
