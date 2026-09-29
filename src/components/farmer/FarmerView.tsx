import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  TrendingUp,
  Receipt,
  Plus,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Download,
  Share2,
  Printer,
  HelpCircle,
  Search,
  Filter,
  RefreshCw,
  Truck,
  MapPin,
  Check,
  AlertTriangle,
  ArrowRight,
  Building2,
  Phone
} from 'lucide-react';
import { playGateChime, playSuccessTone } from '../../utils/audio';

interface MandiCenterOption {
  id: string;
  name: string;
  distanceKm: number;
  capacityStatus: 'green' | 'yellow' | 'red';
  capacityText: string;
  waitEstimateMins: number;
}

const nearbyCenters: MandiCenterOption[] = [
  {
    id: 'CTR-LKO-04',
    name: 'DoCA Central Mandi, Lucknow (Hub 4)',
    distanceKm: 4.2,
    capacityStatus: 'green',
    capacityText: 'Fast Track (42% Capacity)',
    waitEstimateMins: 15
  },
  {
    id: 'CTR-MAL-02',
    name: 'Malihabad Sub-Mandi & Mango Hub',
    distanceKm: 12.8,
    capacityStatus: 'yellow',
    capacityText: 'Moderate Congestion (68% Capacity)',
    waitEstimateMins: 40
  },
  {
    id: 'CTR-STP-01',
    name: 'Sitapur Grain Silo Complex',
    distanceKm: 28.5,
    capacityStatus: 'red',
    capacityText: 'High Congestion (92% Capacity - Delays)',
    waitEstimateMins: 85
  }
];

export const FarmerView: React.FC = () => {
  const {
    user,
    slots,
    activeTab,
    setActiveTab,
    procurements,
    addSlot,
    updateSlotStatus,
    activeCenterName,
    addNotification
  } = useApp();

  // Multi-step Wizard State for Part 6 (Step 1 -> Step 2 -> Step 3)
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [selectedCrop, setSelectedCrop] = useState('Paddy (Basmati 1509)');
  const [mspRate, setMspRate] = useState<number>(2320);
  const [weightKg, setWeightKg] = useState('3500');
  const [selectedCenter, setSelectedCenter] = useState<MandiCenterOption>(nearbyCenters[0]);
  const [vehicleType, setVehicleType] = useState<'Tractor Trolley' | 'Pickup Truck / Tata Ace' | 'Bullock Cart / Mini Tempo'>('Tractor Trolley');
  const [vehicleNumber, setVehicleNumber] = useState('UP 32 EA 9821');
  const [slotDate, setSlotDate] = useState('Tomorrow, 29 Sep 2026');
  const [slotTime, setSlotTime] = useState('08:00 AM - 09:30 AM (Fast Track)');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Active slot for QR Pass & Queue
  const activeSlot = slots.find(s => s.status !== 'completed' && s.status !== 'cancelled') || slots[0];

  // Part 8 Interactive Queue Progress Simulation state
  const [simulatedPosition, setSimulatedPosition] = useState<number>(activeSlot?.queuePosition || 3);
  const [simulatedWait, setSimulatedWait] = useState<number>(activeSlot?.estimatedWaitMinutes || 25);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(2); // Default at Gate Checked-in

  // Part 9 Table Filter State
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'settled' | 'processing' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle MSP updates when crop changes
  const handleCropChange = (crop: string) => {
    setSelectedCrop(crop);
    switch (crop) {
      case 'Paddy (Basmati 1509)':
        setMspRate(2320);
        break;
      case 'Wheat (Sharbati A-One)':
        setMspRate(2275);
        break;
      case 'Mustard (Sarson Grade A)':
        setMspRate(5650);
        break;
      case 'Arhar / Tur Dal':
        setMspRate(7550);
        break;
      case 'Maize / Corn (Hybrid)':
        setMspRate(2090);
        break;
      default:
        setMspRate(2300);
    }
  };

  const handleSimulateAdvanceQueue = () => {
    if (simulatedPosition > 1) {
      const nextPos = simulatedPosition - 1;
      const nextWait = Math.max(5, simulatedWait - 10);
      setSimulatedPosition(nextPos);
      setSimulatedWait(nextWait);
      setActiveStepIndex(3); // Quality Inspection
      playSuccessTone();

      addNotification({
        title: `Queue Update: Token ${activeSlot?.tokenNumber}`,
        message: `Queue advanced! You are now Position #${nextPos} in Yard. Est. wait: ${nextWait} mins.`,
        type: 'sms',
        roleTarget: 'farmer'
      });
    } else if (simulatedPosition === 1) {
      setSimulatedPosition(0);
      setSimulatedWait(0);
      setActiveStepIndex(4); // Weighbridge
      updateSlotStatus(activeSlot.id, 'at_weighbridge');
      playGateChime();

      addNotification({
        title: `🚨 GATE CALL: Token ${activeSlot?.tokenNumber}`,
        message: `Please proceed to Weighbridge Bay 2 immediately for digital gross tare weighing.`,
        type: 'call',
        roleTarget: 'farmer'
      });
      alert(`🔔 LOUDSPEAKER CALL: Token ${activeSlot?.tokenNumber} reported to Weighbridge Bay 2!`);
    } else {
      setActiveStepIndex(5); // E-Pauti Issued
      setTimeout(() => setActiveStepIndex(6), 2000); // DBT Initiated
      playSuccessTone();
    }
  };

  const handleBookSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot = addSlot({
      cropType: selectedCrop,
      estimatedWeightKg: Number(weightKg),
      vehicleType,
      vehicleNumber,
      centerId: selectedCenter.id,
      centerName: selectedCenter.name,
      slotDate,
      slotTime
    });

    playSuccessTone();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingStep(1);
      setActiveTab('qr-pass');
    }, 1200);
  };

  // Metrics Calculations
  const totalSlotsCount = slots.length;
  const totalEarnings = procurements.reduce((sum, p) => sum + p.totalPaiAmount, 0);
  const totalWeightQuintals = (procurements.reduce((sum, p) => sum + p.netWeightKg, 0) / 100).toFixed(1);

  // =========================================================================
  // PART 5: Farmer Dashboard Overview & KPI Metrics
  // =========================================================================
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* 1. Personalized Welcome Banner & Quick Action (Matching Video 00:01) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-surface-border shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome back, {user.name}!</span>
            <span className="text-xl">🌾</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {user.organization || 'Kisan Agro Producer Org'} • Land: {user.landArea || '8.5 Acres'} • Bakshi Ka Talab Hub
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-600 font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>28 Sep 2026</span>
          </div>

          <button
            onClick={() => setActiveTab('book-slot')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Book Procurement Slot</span>
          </button>
        </div>
      </div>

      {/* 2. Exactly the 4 Requested Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Token */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>Active Token</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              🎟️
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {activeSlot ? activeSlot.tokenNumber : 'None'}
            </span>
            {activeSlot && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {activeSlot.status === 'in_queue' ? 'In Yard' : activeSlot.status === 'at_weighbridge' ? 'At Scale' : 'Confirmed'}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {activeSlot ? `${activeSlot.slotTime}` : 'No slots reserved'}
          </p>
        </div>

        {/* KPI 2: Slots Booked */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>Slots Booked</span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              📅
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {totalSlotsCount} Slots
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Total
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Next: {activeSlot?.slotDate || 'Today'}
          </p>
        </div>

        {/* KPI 3: Quintals Procured */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>Quintals Procured</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              ⚖️
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {totalWeightQuintals} Qtl
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Accepted
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Across {procurements.length} procurement batches
          </p>
        </div>

        {/* KPI 4: ₹ Total Earnings */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs hover:shadow-card transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>₹ Total Earnings</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ₹
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            100% Direct DBT Bank Credit
          </p>
        </div>
      </div>

      {/* Main Grid: Overview Chart + AI Demand/Congestion Forecast (Exact Video 00:00) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sales / Procurement Graph & Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sales & Procurement Overview</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-slate-900">
                    ₹{totalEarnings.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +18.6% vs last month
                  </span>
                </div>
              </div>

              <select className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-3 rounded-lg outline-none">
                <option>This Season (Kharif 2026)</option>
                <option>Previous Season (Rabi 2026)</option>
              </select>
            </div>

            {/* Simulated Sleek SVG Area Chart (Video Visual Style 00:00) */}
            <div className="h-44 w-full pt-4">
              <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeDasharray="3 3" />
                <path
                  d="M0,130 Q80,110 140,80 T260,65 T380,95 T500,30 L500,150 L0,150 Z"
                  fill="url(#greenGradient)"
                />
                <path
                  d="M0,130 Q80,110 140,80 T260,65 T380,95 T500,30"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="140" cy="80" r="4" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                <circle cx="260" cy="65" r="4" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                <circle cx="500" cy="30" r="5" fill="#059669" stroke="#ffffff" strokeWidth="2" />
              </svg>
              <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-medium">
                <span>01 Sep</span>
                <span>08 Sep</span>
                <span>15 Sep</span>
                <span>22 Sep</span>
                <span>Today (28 Sep)</span>
              </div>
            </div>
          </div>

          {/* Recent Procurements Table Card */}
          <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Recent Mandi Procurements</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>View Full DBT History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Crop / Batch</th>
                    <th className="pb-3">Weight (Qtl)</th>
                    <th className="pb-3">Quality</th>
                    <th className="pb-3">MSP Amount</th>
                    <th className="pb-3 text-right">DBT Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {procurements.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            🌾
                          </span>
                          <div>
                            <p className="font-semibold">{item.cropType}</p>
                            <p className="text-[10px] text-slate-400">{item.date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600">
                        {(item.netWeightKg / 100).toFixed(1)} Qtl ({item.netWeightKg} kg)
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.qualityGrade}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-slate-900">
                        ₹{item.totalPaiAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Settled via PFMS
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: AI Demand / Congestion Forecast Widget (Video Style 00:00 & 00:22) */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                AI Demand & Congestion Forecast
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                High Demand
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden mb-3.5 aspect-video border border-slate-100 shadow-inner">
              <img
                src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"
                alt="Produce Demand"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white">
                  Tomato & Paddy Demand surging by +24% next week!
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Mandi arrival traffic is projected to peak next Tuesday. Book morning fast-track slots (08:00 AM - 10:30 AM) to experience zero gate queue delay.
            </p>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mb-4 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Recommended Window:</span>
              <span className="font-bold text-emerald-700">Tomorrow 09:00 AM</span>
            </div>

            <button
              onClick={() => setActiveTab('book-slot')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
            >
              Book Recommended Slot ➔
            </button>
          </div>

          {/* Quick QR Pass Preview Widget */}
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-5 rounded-2xl shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Next Appointment Pass
              </span>
              <QrCode className="w-5 h-5 text-emerald-400" />
            </div>

            {activeSlot ? (
              <div className="bg-white p-3.5 rounded-xl text-slate-900 text-center mb-3">
                <div className="inline-block p-2 bg-slate-50 rounded-lg border border-slate-200 mb-2">
                  <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="0" y="0" width="30" height="30" fill="#064E3B" />
                    <rect x="5" y="5" width="20" height="20" fill="#fff" />
                    <rect x="10" y="10" width="10" height="10" fill="#064E3B" />
                    <rect x="70" y="0" width="30" height="30" fill="#064E3B" />
                    <rect x="75" y="5" width="20" height="20" fill="#fff" />
                    <rect x="80" y="10" width="10" height="10" fill="#064E3B" />
                    <rect x="0" y="70" width="30" height="30" fill="#064E3B" />
                    <rect x="5" y="75" width="20" height="20" fill="#fff" />
                    <rect x="10" y="80" width="10" height="10" fill="#064E3B" />
                    <rect x="40" y="10" width="10" height="20" fill="#064E3B" />
                    <rect x="40" y="40" width="20" height="20" fill="#064E3B" />
                    <rect x="10" y="40" width="15" height="15" fill="#064E3B" />
                    <rect x="70" y="40" width="20" height="10" fill="#064E3B" />
                    <rect x="70" y="60" width="10" height="30" fill="#064E3B" />
                    <rect x="40" y="70" width="20" height="20" fill="#064E3B" />
                  </svg>
                </div>
                <div className="font-mono font-black text-sm text-slate-900 tracking-wider">
                  {activeSlot.tokenNumber}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {activeSlot.cropType} • {activeSlot.estimatedWeightKg} kg
                </div>
              </div>
            ) : (
              <p className="text-xs text-emerald-200 py-6 text-center">
                No active slot reserved. Click book slot below.
              </p>
            )}

            <button
              onClick={() => setActiveTab('qr-pass')}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              Open Full QR Pass & Download Slip ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // PART 6: Smart Slot Booking Engine (Step-by-Step Reservation Wizard)
  // =========================================================================
  const renderBookSlot = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs">
        {/* Wizard Progress Stepper */}
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              bookingStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              1
            </span>
            <span className={bookingStep === 1 ? 'font-bold text-slate-900' : 'text-slate-500'}>
              Crop & Weight
            </span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300" />

          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              bookingStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              2
            </span>
            <span className={bookingStep === 2 ? 'font-bold text-slate-900' : 'text-slate-500'}>
              Nearest Centre
            </span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300" />

          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              bookingStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              3
            </span>
            <span className={bookingStep === 3 ? 'font-bold text-slate-900' : 'text-slate-500'}>
              Slot & Vehicle
            </span>
          </div>
        </div>

        {bookingSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 animate-in fade-in duration-300">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Slot Successfully Booked!</p>
              <p className="text-xs text-emerald-700">
                Generating your digital QR entry pass and sending SMS confirmation...
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleBookSlot} className="space-y-5">
          {/* STEP 1: Crop Selection with MSP Rates & Estimated Weight */}
          {bookingStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Crop Commodity & Live MSP Rate
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => handleCropChange(e.target.value)}
                  className="w-full text-xs font-medium py-3 px-3.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Paddy (Basmati 1509)">Paddy (Basmati 1509) - Govt MSP ₹2,320 / Qtl</option>
                  <option value="Wheat (Sharbati A-One)">Wheat (Sharbati A-One) - Govt MSP ₹2,275 / Qtl</option>
                  <option value="Mustard (Sarson Grade A)">Mustard (Sarson Grade A) - Govt MSP ₹5,650 / Qtl</option>
                  <option value="Arhar / Tur Dal">Arhar / Tur Dal - Govt MSP ₹7,550 / Qtl</option>
                  <option value="Maize / Corn (Hybrid)">Maize / Corn (Hybrid) - Govt MSP ₹2,090 / Qtl</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Estimated Produce Weight (kg)
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  max={25000}
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full text-xs font-medium py-3 px-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. 3500 kg"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>≈ {(Number(weightKg) / 100 || 0).toFixed(1)} Quintals</span>
                  <span className="font-bold text-emerald-700">
                    Est. MSP Value: ₹{Math.round(((Number(weightKg) || 0) / 100) * mspRate).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBookingStep(2)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to Nearest Centre Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Nearest Centre Selection with Real-Time Capacity Indicators (Green/Yellow/Red) */}
          {bookingStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Nearest Centre with Live Capacity Heat Indicator
                </label>

                <div className="space-y-3">
                  {nearbyCenters.map((ctr) => (
                    <div
                      key={ctr.id}
                      onClick={() => setSelectedCenter(ctr)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        selectedCenter.id === ctr.id
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                          ctr.capacityStatus === 'green'
                            ? 'bg-emerald-500 shadow-sm shadow-emerald-500'
                            : ctr.capacityStatus === 'yellow'
                            ? 'bg-amber-500 shadow-sm shadow-amber-500'
                            : 'bg-red-500 shadow-sm shadow-red-500'
                        }`} />
                        <div>
                          <p className="font-bold text-xs text-slate-900">{ctr.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{ctr.distanceKm} km away from your village</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ctr.capacityStatus === 'green'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ctr.capacityStatus === 'yellow'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {ctr.capacityText}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Est. wait: {ctr.waitEstimateMins} mins
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {selectedCenter.id === ctr.id && (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingStep(1)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setBookingStep(3)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <span>Select Slot Time</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Vehicle Type & Time Slot Selection */}
          {bookingStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Vehicle Transport Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as any)}
                    className="w-full text-xs font-medium py-2.5 px-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Tractor Trolley">Tractor Trolley (Heavy)</option>
                    <option value="Pickup Truck / Tata Ace">Pickup Truck / Tata Ace</option>
                    <option value="Bullock Cart / Mini Tempo">Mini Tempo / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Vehicle Plate Number
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full text-xs font-medium py-2.5 px-3 rounded-xl border border-slate-300 uppercase font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="UP 32 EA 9821"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Appointment Date
                  </label>
                  <select
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    className="w-full text-xs font-medium py-2.5 px-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Today, 28 Sep 2026">Today, 28 Sep 2026</option>
                    <option value="Tomorrow, 29 Sep 2026">Tomorrow, 29 Sep 2026 (Recommended)</option>
                    <option value="Wed, 30 Sep 2026">Wed, 30 Sep 2026</option>
                    <option value="Thu, 01 Oct 2026">Thu, 01 Oct 2026</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Time Slot Selection
                  </label>
                  <select
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="w-full text-xs font-medium py-2.5 px-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="08:00 AM - 09:30 AM (Fast Track)">08:00 AM - 09:30 AM (Fast Track 🟢)</option>
                    <option value="10:00 AM - 11:30 AM (Moderate)">10:00 AM - 11:30 AM (Moderate 🟡)</option>
                    <option value="01:00 PM - 02:30 PM (Fast Track)">01:00 PM - 02:30 PM (Fast Track 🟢)</option>
                    <option value="03:00 PM - 04:30 PM (Moderate)">03:00 PM - 04:30 PM (Moderate 🟡)</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">Direct Benefit Transfer (DBT) Protection:</span> Produce weighing and moisture grading will be digitally sealed. 100% of MSP payment credited directly to your Aadhaar-linked bank account within 48 hours.
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingStep(2)}
                  className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Confirm Booking & Issue QR Pass</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );

  // =========================================================================
  // PART 7: Farmer Scannable Digital QR Code Pass
  // =========================================================================
  const renderQrPass = () => (
    <div className="max-w-md mx-auto space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Pass Header */}
        <div className="bg-brand-dark p-6 text-white text-center relative">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-500/30 inline-block mb-2">
            Official DoCA Gate Entry Pass
          </span>
          <h2 className="text-xl font-black">{activeSlot?.tokenNumber || 'TK-108'}</h2>
          <p className="text-xs text-emerald-200 mt-1">{activeCenterName}</p>
        </div>

        {/* High-Contrast Scannable QR Code */}
        <div className="p-8 text-center bg-slate-50 border-b border-dashed border-slate-200">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 inline-block mb-3">
            <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100" fill="currentColor">
              <rect x="0" y="0" width="30" height="30" fill="#064E3B" />
              <rect x="5" y="5" width="20" height="20" fill="#fff" />
              <rect x="10" y="10" width="10" height="10" fill="#064E3B" />

              <rect x="70" y="0" width="30" height="30" fill="#064E3B" />
              <rect x="75" y="5" width="20" height="20" fill="#fff" />
              <rect x="80" y="10" width="10" height="10" fill="#064E3B" />

              <rect x="0" y="70" width="30" height="30" fill="#064E3B" />
              <rect x="5" y="75" width="20" height="20" fill="#fff" />
              <rect x="10" y="80" width="10" height="10" fill="#064E3B" />

              <rect x="40" y="10" width="10" height="20" fill="#064E3B" />
              <rect x="40" y="40" width="20" height="20" fill="#064E3B" />
              <rect x="10" y="40" width="15" height="15" fill="#064E3B" />
              <rect x="70" y="40" width="20" height="10" fill="#064E3B" />
              <rect x="70" y="60" width="10" height="30" fill="#064E3B" />
              <rect x="40" y="70" width="20" height="20" fill="#064E3B" />
            </svg>
          </div>
          <p className="text-xs font-mono font-bold text-slate-700 tracking-wider">
            {activeSlot?.qrPayload || 'DOCA-TK108-SLOT-001'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Show this QR code at Mandi Gate Scanner for optical entry
          </p>
        </div>

        {/* Pass Details Displaying Token Number, Allotted Gate, Date/Time window */}
        <div className="p-6 space-y-3 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Token Number:</span>
            <span className="font-mono font-black text-slate-900">{activeSlot?.tokenNumber}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Allotted Gate:</span>
            <span className="font-bold text-emerald-700">{activeSlot?.gateNumber}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Date & Time Window:</span>
            <span className="font-bold text-slate-900">{activeSlot?.slotDate} • {activeSlot?.slotTime}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Commodity & Weight:</span>
            <span className="font-bold text-slate-900">{activeSlot?.cropType} ({activeSlot?.estimatedWeightKg} kg)</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-500">Vehicle / Plate:</span>
            <span className="font-mono font-bold text-slate-900">{activeSlot?.vehicleNumber}</span>
          </div>
        </div>

        {/* Exactly Requested One-Click Actions: Save to Phone, Print PDF, Share via WhatsApp/SMS */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => alert('Saving digital QR Pass to phone gallery...')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Save to Phone</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print PDF</span>
          </button>
          <button
            onClick={() => alert(`QR Pass link shared via WhatsApp & SMS to ${user.phone}!`)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp / SMS</span>
          </button>
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // PART 8: Real-Time Queue & Waiting Time Tracker
  // =========================================================================
  const renderQueueTracker = () => {
    // Exact requested steps:
    // Slot Confirmed ➔ Gate Check-in ➔ Quality Inspection ➔ Weighbridge ➔ E-Pauti (GRN) ➔ DBT Initiated
    const timelineSteps = [
      {
        id: 1,
        title: 'Slot Confirmed',
        desc: 'Appointment reserved and encrypted QR Pass issued.',
        time: '08:30 AM',
        status: 'completed'
      },
      {
        id: 2,
        title: 'Gate Check-in',
        desc: 'Scanned at Mandi Gate 2 entrance. Vehicle admitted to queue.',
        time: '09:55 AM',
        status: activeStepIndex >= 2 ? 'completed' : 'pending'
      },
      {
        id: 3,
        title: 'Quality Inspection',
        desc: 'Moisture content and FAQ purity test in progress.',
        time: activeStepIndex >= 3 ? '10:15 AM' : 'Pending',
        status: activeStepIndex >= 3 ? 'completed' : 'pending'
      },
      {
        id: 4,
        title: 'Weighbridge',
        desc: 'Digital gross and tare vehicle weighing.',
        time: activeStepIndex >= 4 ? '10:25 AM' : 'Pending',
        status: activeStepIndex >= 4 ? 'completed' : 'pending'
      },
      {
        id: 5,
        title: 'E-Pauti (GRN)',
        desc: 'Official Goods Receipt Note digitally sealed by Mandi Officer.',
        time: activeStepIndex >= 5 ? '10:35 AM' : 'Pending',
        status: activeStepIndex >= 5 ? 'completed' : 'pending'
      },
      {
        id: 6,
        title: 'DBT Initiated',
        desc: 'Direct Benefit Transfer dispatched to Aadhaar-linked bank account.',
        time: activeStepIndex >= 6 ? '10:40 AM' : 'Pending',
        status: activeStepIndex >= 6 ? 'completed' : 'pending'
      }
    ];

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Real-time Header Card (Modeled on Video Delivery Tracking 00:52) */}
        <div className="bg-brand-dark text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-2 self-start">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live GPS & Yard Queue Active
            </span>

            <div className="flex items-center gap-3">
              <span className="text-xs text-emerald-200 font-mono">
                Token: <strong className="text-white text-sm">{activeSlot?.tokenNumber || 'TK-108'}</strong>
              </span>
              <button
                onClick={handleSimulateAdvanceQueue}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
                title="Click to advance through live milestones"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Simulate Queue Move</span>
              </button>
            </div>
          </div>

          {/* Real-time Wait Countdown & Gate Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <p className="text-[11px] text-emerald-200">Current Position in Line</p>
              <p className="text-2xl font-black mt-1">
                {simulatedPosition === 0 ? 'At Weighbridge' : `# ${simulatedPosition}`}
              </p>
              <p className="text-[10px] text-emerald-300 mt-1">
                {simulatedPosition > 0 ? `${simulatedPosition - 1} vehicles ahead` : 'Gate call in progress'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <p className="text-[11px] text-emerald-200">Live Estimated Wait Time</p>
              <p className="text-2xl font-black mt-1">
                {simulatedPosition === 0 ? '0 mins' : `${simulatedWait} mins`}
              </p>
              <p className="text-[10px] text-emerald-300 mt-1">Countdown updating in real-time</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <p className="text-[11px] text-emerald-200">Assigned Mandi Gate</p>
              <p className="text-2xl font-black mt-1">{activeSlot?.gateNumber.split(' ')[0] || 'Gate 2'}</p>
              <p className="text-[10px] text-emerald-300 mt-1">Tractor Trolley Fast Lane</p>
            </div>
          </div>

          {/* Progress Bar (Video 00:52 Style) */}
          <div className="relative pt-2">
            <div className="overflow-hidden h-2.5 mb-2 text-xs flex rounded-full bg-emerald-950/70 border border-emerald-800">
              <div
                style={{ width: `${Math.round((activeStepIndex / 6) * 100)}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-400 to-emerald-200 transition-all duration-500"
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-emerald-300 font-medium">
              <span>Slot Booked</span>
              <span>Gate Entry</span>
              <span>Inspection</span>
              <span>Weighbridge</span>
              <span>E-Pauti</span>
              <span className="text-white font-bold">DBT Transfer</span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Milestones List */}
        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-6">
            Procurement Cycle Milestones
          </h3>

          <div className="relative border-l-2 border-emerald-500 ml-4 space-y-7 pb-2">
            {timelineSteps.map((step) => {
              const isPast = activeStepIndex > step.id;
              const isCurrent = activeStepIndex === step.id;

              return (
                <div key={step.id} className="relative pl-6">
                  <span className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-xs ${
                    isPast || isCurrent
                      ? 'bg-emerald-500'
                      : 'bg-slate-300'
                  } ${isCurrent ? 'ring-4 ring-emerald-200 animate-pulse' : ''}`}></span>

                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold ${isCurrent ? 'text-emerald-800 font-extrabold text-sm' : 'text-slate-900'}`}>
                      {step.id}. {step.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">{step.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // PART 9: Procurement & Direct Benefit Transfer (DBT) History
  // =========================================================================
  const renderOrdersAndPayments = () => {
    const filteredRecords = procurements.filter(record => {
      if (paymentFilter !== 'all' && record.paymentStatus !== paymentFilter) return false;
      if (searchQuery && !record.cropType.toLowerCase().includes(searchQuery.toLowerCase()) && !record.grnNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    return (
      <div className="space-y-6">
        {/* Earnings Summary Banner (Video 00:19 Style) */}
        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Procurement & DBT Payment History</h2>
              <p className="text-xs text-slate-500">Government Direct Benefit Transfers (DBT) to registered bank account.</p>
            </div>
            <button
              onClick={() => alert('Downloading official tax & procurement statement PDF...')}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Statement</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Total Settlement Value</span>
              <p className="text-2xl font-black text-slate-900 mt-1">₹{totalEarnings.toLocaleString('en-IN')}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">100% via DBT</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-xs text-slate-500 font-medium">Available for Instant Payout</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">₹0.00</p>
              <span className="text-[10px] text-slate-400">All cleared to bank</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-medium">In Transit / Processing</span>
              <p className="text-2xl font-black text-amber-600 mt-1">₹0.00</p>
              <span className="text-[10px] text-slate-400">PFMS Batch Cleared</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Total Produce Sold</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalWeightQuintals} Qtl</p>
              <span className="text-[10px] text-slate-500">Across {procurements.length} Procurements</span>
            </div>
          </div>

          {/* Linked Bank Card (Matching Video 00:19) */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-emerald-300 flex items-center justify-center text-emerald-700 font-black text-sm shadow-xs">
                SBI
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">State Bank of India (Primary Settlement Account)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">
                    Verified by Mandi
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Account: •••••••• 4412 • IFSC: SBIN0001248 • Beneficiary: {user.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => alert('Account verified via PFMS Aadhaar Payment Bridge.')}
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              Manage Accounts ➔
            </button>
          </div>
        </div>

        {/* Filterable Table Matching Video Orders & Earnings Page */}
        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-sm font-bold text-slate-900">Official Government Procurement Receipts (E-Pauti)</h3>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search crop or GRN..."
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Status Filter Tabs (Settled via PFMS, Processing, Under Verification) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setPaymentFilter('all')}
                  className={`px-2.5 py-1 rounded-lg ${paymentFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setPaymentFilter('settled')}
                  className={`px-2.5 py-1 rounded-lg ${paymentFilter === 'settled' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'}`}
                >
                  Settled
                </button>
                <button
                  onClick={() => setPaymentFilter('processing')}
                  className={`px-2.5 py-1 rounded-lg ${paymentFilter === 'processing' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-500'}`}
                >
                  Processing
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Receipt / GRN</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Crop Name</th>
                  <th className="pb-3">Accepted Weight</th>
                  <th className="pb-3">Quality Grade</th>
                  <th className="pb-3">MSP Amount</th>
                  <th className="pb-3">Payment Status</th>
                  <th className="pb-3 text-right">Download Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-slate-900">
                      {record.grnNumber}
                    </td>
                    <td className="py-3.5 text-slate-500">{record.date}</td>
                    <td className="py-3.5 font-semibold text-slate-900">{record.cropType}</td>
                    <td className="py-3.5 text-slate-700">
                      {(record.netWeightKg / 100).toFixed(1)} Qtl ({record.netWeightKg} kg)
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {record.qualityGrade}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-slate-900">
                      ₹{record.totalPaiAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        record.paymentStatus === 'settled'
                          ? 'bg-emerald-100 text-emerald-800'
                          : record.paymentStatus === 'processing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {record.paymentStatus === 'settled'
                          ? 'Settled via PFMS'
                          : record.paymentStatus === 'processing'
                          ? 'Processing'
                          : 'Under Verification'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => alert(`Downloading official Goods Receipt Note (GRN) PDF: ${record.grnNumber}`)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:underline flex items-center justify-end gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 6. Support Tab (Matching Video 00:30 Kisan Sahayata)
  const renderSupport = () => (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-surface-border shadow-xs text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">DoCA Kisan Sahayata Desk</h2>
        <p className="text-xs text-slate-500 mb-6">
          For questions regarding minimum support price (MSP), slot bookings, weighing arbitration, or instant settlements, contact our 24/7 farmer desk.
        </p>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 text-sm font-bold flex items-center justify-center gap-2 mb-6">
          <span>📞 Kisan Helpline:</span>
          <span className="text-emerald-700 text-base">1800-180-1551 (Toll-Free)</span>
        </div>

        <div className="text-left space-y-3 text-xs border-t border-slate-100 pt-5">
          <h4 className="font-bold text-slate-800">Frequently Asked Questions:</h4>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="font-semibold text-slate-900">What if my tractor trolley arrives 30 mins late?</p>
            <p className="text-slate-500 mt-1">The system allows a 45-minute grace period. Your token will simply be placed in the next active queue slot.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="font-semibold text-slate-900">How long does DBT bank transfer take?</p>
            <p className="text-slate-500 mt-1">Under DoCA guidelines, 100% of MSP payment is disbursed via PFMS within 24 to 48 hours of GRN generation.</p>
          </div>
        </div>
      </div>
    </div>
  );

  switch (activeTab) {
    case 'book-slot':
      return renderBookSlot();
    case 'qr-pass':
      return renderQrPass();
    case 'queue':
      return renderQueueTracker();
    case 'orders':
      return renderOrdersAndPayments();
    case 'support':
      return renderSupport();
    default:
      return renderDashboard();
  }
};
