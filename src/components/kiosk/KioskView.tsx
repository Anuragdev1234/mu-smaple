import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Printer,
  PhoneCall,
  CalendarPlus,
  CheckCircle2,
  Users,
  Building,
  QrCode,
  FileText,
  Volume2,
  Globe,
  Download,
  Share2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { playKeypadTone, playSuccessTone, playGateChime } from '../../utils/audio';

export const KioskView: React.FC = () => {
  const {
    user,
    slots,
    addSlot,
    activeTab,
    setActiveTab,
    activeCenterName,
    addNotification
  } = useApp();

  // Part 19: Assisted Booking Form State
  const [farmerAadhaar, setFarmerAadhaar] = useState('8921-4402-9912');
  const [farmerName, setFarmerName] = useState('Ram Prasad Yadav');
  const [farmerPhone, setFarmerPhone] = useState('9812345678');
  const [cropType, setCropType] = useState('Paddy (Basmati 1509)');
  const [weightKg, setWeightKg] = useState('2800');
  const [vehicleNumber, setVehicleNumber] = useState('UP 32 BK 7721');
  const [kioskSuccess, setKioskSuccess] = useState(false);
  const [lastBookedToken, setLastBookedToken] = useState('TK-115');

  // Part 19: IVR Voice Call Simulator State
  const [ivrStep, setIvrStep] = useState<number>(1);
  const [callActive, setCallActive] = useState<boolean>(true);
  const [ivrLanguage, setIvrLanguage] = useState<'hi' | 'en'>('hi');
  const [selectedIvrCrop, setSelectedIvrCrop] = useState('');

  const handleAssistedBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot = addSlot({
      farmerName,
      farmerPhone: `+91 ${farmerPhone}`,
      cropType,
      estimatedWeightKg: Number(weightKg),
      vehicleNumber,
      slotDate: 'Tomorrow, 29 Sep 2026',
      slotTime: '08:30 AM - 10:00 AM'
    });

    playSuccessTone();
    setLastBookedToken(newSlot.tokenNumber);
    setKioskSuccess(true);
    setTimeout(() => {
      setKioskSuccess(false);
      setActiveTab('print-pass');
    }, 1500);
  };

  const handleKeypadPress = (key: string | number) => {
    playKeypadTone(key);

    if (key === 1 && ivrStep === 1) {
      setSelectedIvrCrop(ivrLanguage === 'hi' ? 'धान (Paddy Basmati)' : 'Paddy (Basmati)');
      setIvrStep(2);
    } else if (key === 2 && ivrStep === 1) {
      setSelectedIvrCrop(ivrLanguage === 'hi' ? 'गेहूं (Wheat Sharbati)' : 'Wheat (Sharbati)');
      setIvrStep(2);
    } else if ((key === 1 || key === 2) && ivrStep === 2) {
      setIvrStep(3);
      playSuccessTone();
      addNotification({
        title: 'IVR Voice Slot Confirmed',
        message: `Farmer 9812345678 booked slot via Toll-Free IVR. Token TK-118 generated and sent via SMS.`,
        type: 'sms',
        roleTarget: 'all'
      });
    }
  };

  // =========================================================================
  // Kiosk Desk Overview (Dashboard)
  // =========================================================================
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>CSC & Gram Panchayat Kisan Sahayata Kiosk</span>
              <span className="text-xl">🏛️</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Assisted Mode Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operator: {user.name} • VLE Center: {user.organization} • {user.location}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('book-slot')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book for Walk-in Farmer</span>
          </button>
          <button
            onClick={() => setActiveTab('ivr-simulator')}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>IVR Feature-Phone Simulator</span>
          </button>
        </div>
      </div>

      {/* Feature Explainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            🎫
          </div>
          <h3 className="text-sm font-bold text-slate-900">Physical QR Paper Slips</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            For farmers without smartphones: Operators print an A4 or thermal receipt containing an encrypted QR code. Farmers carry this paper ticket directly to Mandi Gate 2 for zero-delay optical check-in.
          </p>
          <button
            onClick={() => setActiveTab('print-pass')}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>Open Thermal Slip Generator</span> ➔
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            📞
          </div>
          <h3 className="text-sm font-bold text-slate-900">Toll-Free IVR Voice Booking</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            For farmers using basic keypad feature phones (Nokia/JioBharat): A toll-free automated IVR number allows farmers to press keypad keys (e.g. 1 for Wheat, 2 for Paddy) to receive automated slot SMS.
          </p>
          <button
            onClick={() => setActiveTab('ivr-simulator')}
            className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
          >
            <span>Launch Keypad Simulator</span> ➔
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            🛡️
          </div>
          <h3 className="text-sm font-bold text-slate-900">Aadhaar & Land Records Link</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Panchayat operators verify land records (Khasra/Khatauni) on state portals before booking slots to eliminate fake middlemen and preserve MSP benefits for genuine cultivators.
          </p>
          <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full inline-block">
            Anti-Middlemen Verification
          </span>
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // PART 19: Assisted Slot Booking Form for CSC VLE Operators
  // =========================================================================
  const renderAssistedBooking = () => (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            ✍️
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Panchayat Assisted Slot Booking Interface
            </h2>
            <p className="text-xs text-slate-500">
              Fill details on behalf of farmer without a smartphone and print their physical QR pass.
            </p>
          </div>
        </div>

        {kioskSuccess && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold">
              Slot Booked! Token {lastBookedToken} generated. Redirecting to print paper slip...
            </span>
          </div>
        )}

        <form onSubmit={handleAssistedBooking} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Farmer Full Name
              </label>
              <input
                type="text"
                required
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number (for SMS)
              </label>
              <input
                type="tel"
                required
                value={farmerPhone}
                onChange={(e) => setFarmerPhone(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Farmer Aadhaar / Kisan ID
            </label>
            <input
              type="text"
              required
              value={farmerAadhaar}
              onChange={(e) => setFarmerAadhaar(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 font-mono outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Crop Commodity
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Paddy (Basmati 1509)">Paddy (Basmati 1509)</option>
                <option value="Wheat (Sharbati A-One)">Wheat (Sharbati)</option>
                <option value="Mustard (Sarson Grade A)">Mustard (Sarson)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated Weight (kg)
              </label>
              <input
                type="number"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Trolley / Vehicle Plate Number
            </label>
            <input
              type="text"
              required
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-300 uppercase font-mono outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
          >
            Confirm Reservation & Open Printable Ticket
          </button>
        </form>
      </div>
    </div>
  );

  // =========================================================================
  // PART 19: Printable Paper Slip Generator with Large-Font QR Code
  // =========================================================================
  const renderPrintSlip = () => (
    <div className="max-w-md mx-auto space-y-4">
      {/* Thermal Print Slip Mockup Container */}
      <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-400 shadow-xl text-slate-900 font-mono text-xs">
        <div className="text-center pb-3 border-b-2 border-slate-900 space-y-1">
          <p className="font-black text-sm uppercase">MINISTRY OF CONSUMER AFFAIRS</p>
          <p className="text-[10px] text-slate-600">DoCA Smart Mandi Procurement System</p>
          <p className="text-[11px] font-bold mt-1 bg-slate-900 text-white py-0.5 rounded">
            GATE ENTRY APPOINTMENT SLIP
          </p>
        </div>

        <div className="py-4 text-center">
          <p className="text-3xl font-black tracking-widest text-slate-900">{lastBookedToken}</p>
          <p className="text-[10px] text-slate-500 mt-1">Scheduled: Tomorrow, 29 Sep 2026 (08:30 AM)</p>

          {/* Large-Font High-Contrast Optical QR Code */}
          <div className="my-3 inline-block p-3 bg-slate-100 rounded-xl border border-slate-300">
            <svg className="w-36 h-36 mx-auto" viewBox="0 0 100 100" fill="currentColor">
              <rect x="0" y="0" width="30" height="30" fill="#000" />
              <rect x="5" y="5" width="20" height="20" fill="#fff" />
              <rect x="10" y="10" width="10" height="10" fill="#000" />

              <rect x="70" y="0" width="30" height="30" fill="#000" />
              <rect x="75" y="5" width="20" height="20" fill="#fff" />
              <rect x="80" y="10" width="10" height="10" fill="#000" />

              <rect x="0" y="70" width="30" height="30" fill="#000" />
              <rect x="5" y="75" width="20" height="20" fill="#fff" />
              <rect x="10" y="80" width="10" height="10" fill="#000" />

              <rect x="40" y="10" width="10" height="20" fill="#000" />
              <rect x="40" y="40" width="20" height="20" fill="#000" />
              <rect x="10" y="40" width="15" height="15" fill="#000" />
              <rect x="70" y="40" width="20" height="10" fill="#000" />
              <rect x="70" y="60" width="10" height="30" fill="#000" />
              <rect x="40" y="70" width="20" height="20" fill="#000" />
            </svg>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Optical Mandi Gate Check-in QR
          </p>
        </div>

        <div className="space-y-1.5 py-2 border-t border-b border-slate-200 text-[11px]">
          <div className="flex justify-between">
            <span>Farmer Name:</span>
            <span className="font-bold">{farmerName}</span>
          </div>
          <div className="flex justify-between">
            <span>Crop Variety:</span>
            <span className="font-bold">{cropType}</span>
          </div>
          <div className="flex justify-between">
            <span>Declared Weight:</span>
            <span className="font-bold">{weightKg} kg</span>
          </div>
          <div className="flex justify-between">
            <span>Vehicle Plate:</span>
            <span className="font-bold">{vehicleNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Allotted Gate:</span>
            <span className="font-bold">Gate 2 (Heavy Trolley Lane)</span>
          </div>
        </div>

        <p className="text-[10px] text-center text-slate-500 mt-3">
          Please carry this printed paper slip to Mandi Gate 2 during your time slot.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => window.print()}
          className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Print Physical Paper Slip (Thermal / A4)</span>
        </button>
      </div>
    </div>
  );

  // =========================================================================
  // PART 19: Interactive Toll-Free IVR Phone Simulator with Keypad DTMF Audio
  // =========================================================================
  const renderIvrSimulator = () => (
    <div className="max-w-md mx-auto space-y-4">
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl border-4 border-slate-800 text-center">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono">TOLL-FREE IVR DESK</span>
          <button
            onClick={() => setIvrLanguage(ivrLanguage === 'hi' ? 'en' : 'hi')}
            className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-emerald-400 font-bold"
          >
            <Globe className="w-3 h-3" />
            <span>{ivrLanguage === 'hi' ? 'हिंदी (Hindi)' : 'English'}</span>
          </button>
        </div>

        <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto mb-3 font-bold shadow-lg">
          <PhoneCall className="w-6 h-6" />
        </div>

        <h3 className="font-bold text-sm">Toll-Free IVR Service (1800-180-1551)</h3>
        <p className="text-[11px] text-slate-400 mb-4">
          Automated voice response for farmers with basic keypad feature phones.
        </p>

        {/* Simulated Phone Screen */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-5 text-left space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              CALL IN PROGRESS • 01:22
            </span>
            <span className="text-slate-500 font-sans">DTMF Audio Enabled</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl text-slate-200 text-[11px] leading-relaxed border border-slate-800 min-h-[70px] flex items-center">
            {ivrStep === 1 && (
              <p>
                {ivrLanguage === 'hi'
                  ? '"नमस्कार! उपभोक्ता मामले विभाग स्मार्ट मंडी में आपका स्वागत है। धान के लिए 1 दबाएं। गेहूं के लिए 2 दबाएं।"'
                  : '"Welcome to Department of Consumer Affairs Smart Mandi. For Paddy press 1. For Wheat press 2."'}
              </p>
            )}
            {ivrStep === 2 && (
              <p>
                {ivrLanguage === 'hi'
                  ? `"आपने चुना है: ${selectedIvrCrop}। कल सुबह 09:00 बजे के स्लॉट के लिए 1 दबाएं। दोपहर 01:00 बजे के लिए 2 दबाएं।"`
                  : `"You selected: ${selectedIvrCrop}. For Tomorrow 09:00 AM press 1. For 01:00 PM press 2."`}
              </p>
            )}
            {ivrStep === 3 && (
              <p className="text-emerald-400 font-bold">
                {ivrLanguage === 'hi'
                  ? '"धन्यवाद! आपका स्लॉट कन्फर्म हो गया है। टोकन नंबर TK-118 आपके फोन पर SMS द्वारा भेज दिया गया है।"'
                  : '"Thank you! Your slot is confirmed. Token TK-118 has been dispatched to your mobile via SMS."'}
              </p>
            )}
          </div>
        </div>

        {/* Feature Phone Keypad Buttons with Real DTMF Tones */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto text-sm font-bold">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((key) => (
            <button
              key={key}
              onClick={() => handleKeypadPress(key)}
              className="p-3.5 bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 rounded-xl text-white transition-colors active:scale-95 shadow-sm font-mono text-base"
            >
              {key}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setIvrStep(1);
            setSelectedIvrCrop('');
          }}
          className="mt-4 text-xs text-slate-400 hover:text-white underline"
        >
          Reset IVR Call
        </button>
      </div>
    </div>
  );

  switch (activeTab) {
    case 'book-slot':
      return renderAssistedBooking();
    case 'print-pass':
      return renderPrintSlip();
    case 'ivr-simulator':
      return renderIvrSimulator();
    default:
      return renderDashboard();
  }
};
