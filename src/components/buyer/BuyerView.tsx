import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ScanLine,
  Users,
  Scale,
  Warehouse,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  ChevronRight,
  Volume2,
  MessageSquare,
  ArrowUpDown,
  Download,
  Check,
  X,
  Camera,
  Activity
} from 'lucide-react';
import { playGateChime, playSuccessTone } from '../../utils/audio';

export const BuyerView: React.FC = () => {
  const {
    user,
    slots,
    activeTab,
    setActiveTab,
    checkInByToken,
    updateSlotStatus,
    addProcurement,
    activeCenterName,
    addNotification
  } = useApp();

  // Part 11: QR / Token Scanner State
  const [scanInput, setScanInput] = useState('TK-109');
  const [cameraActive, setCameraActive] = useState(true);
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Part 12: Daily Roster Management State
  const [rosterTab, setRosterTab] = useState<'expected' | 'in_queue' | 'completed'>('in_queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Part 13: Grading & Weighing Form State
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    slots.find(s => s.status === 'in_queue' || s.status === 'at_weighbridge')?.id || slots[0]?.id || ''
  );
  const [grossWeight, setGrossWeight] = useState('5400');
  const [tareWeight, setTareWeight] = useState('1900');
  const [moisture, setMoisture] = useState('12.5');
  const [qualityGrade, setQualityGrade] = useState<'FAQ Grade A' | 'FAQ Grade B' | 'Sub-standard / Rejected'>('FAQ Grade A');
  const [weighSuccess, setWeighSuccess] = useState(false);
  const [lastGeneratedGrn, setLastGeneratedGrn] = useState<string>('');

  const activeSlotForGrading = slots.find(s => s.id === selectedSlotId);
  const netWeightCalculated = Math.max(0, Number(grossWeight) - Number(tareWeight));
  const mspRate = 2320; // Paddy Basmati rate per quintal
  const totalAmountCalculated = Math.round((netWeightCalculated / 100) * mspRate);

  // Part 11: Handle QR Scan & Manual Verification
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput) return;
    const result = checkInByToken(scanInput);
    if (result.success) {
      playSuccessTone();
      setScanMessage({ type: 'success', text: result.message });
      setScanInput('');
    } else {
      setScanMessage({ type: 'error', text: result.message });
    }
  };

  // Part 12: Actions on Roster Row
  const handleCallNextToken = (slot: typeof slots[0]) => {
    updateSlotStatus(slot.id, 'at_weighbridge');
    playGateChime();

    addNotification({
      title: `Loudspeaker Gate Chime: ${slot.tokenNumber}`,
      message: `Token ${slot.tokenNumber} (${slot.farmerName}, Vehicle ${slot.vehicleNumber}) please report to Weighbridge Bay 2 immediately.`,
      type: 'call',
      roleTarget: 'all'
    });

    setActionNotice(`Chime sounded! Token ${slot.tokenNumber} (${slot.farmerName}) called to Weighbridge 2.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleSendSmsAlert = (slot: typeof slots[0]) => {
    addNotification({
      title: `Direct SMS Dispatched: ${slot.farmerPhone}`,
      message: `Dear ${slot.farmerName}, your Token ${slot.tokenNumber} is next in line at Gate 2. Please start your tractor engine.`,
      type: 'sms',
      roleTarget: 'farmer'
    });

    playSuccessTone();
    setActionNotice(`SMS alert dispatched to ${slot.farmerName} (${slot.farmerPhone}).`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handlePrioritizeToken = (slot: typeof slots[0]) => {
    updateSlotStatus(slot.id, 'in_queue');
    playSuccessTone();
    setActionNotice(`Priority granted to Token ${slot.tokenNumber} (${slot.farmerName}). Moved ahead in yard.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Part 13: Complete Weighing & Issue GRN
  const handleCompleteWeighing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlotForGrading) return;

    const record = addProcurement({
      slotId: activeSlotForGrading.id,
      tokenNumber: activeSlotForGrading.tokenNumber,
      farmerName: activeSlotForGrading.farmerName,
      farmerPhone: activeSlotForGrading.farmerPhone,
      cropType: activeSlotForGrading.cropType,
      grossWeightKg: Number(grossWeight),
      tareWeightKg: Number(tareWeight),
      netWeightKg: netWeightCalculated,
      moisturePercent: Number(moisture),
      qualityGrade,
      mspRatePerQuintal: mspRate,
      totalPaiAmount: totalAmountCalculated,
      paymentStatus: 'settled',
      centerName: activeCenterName,
      bankDetails: {
        accountNumber: '•••• •••• •••• 4412',
        bankName: 'State Bank of India',
        ifsc: 'SBIN0001248'
      }
    });

    playSuccessTone();
    setLastGeneratedGrn(record.grnNumber);
    setWeighSuccess(true);
    setTimeout(() => {
      setWeighSuccess(false);
      setActiveTab('roster');
    }, 1800);
  };

  // =========================================================================
  // PART 10: Procurement Officer Command Center & Capacity Metrics
  // =========================================================================
  const renderCommandCenter = () => {
    const totalExpected = slots.filter(s => s.status === 'expected').length;
    const inQueue = slots.filter(s => s.status === 'in_queue' || s.status === 'at_weighbridge').length;
    const completedToday = slots.filter(s => s.status === 'completed').length;

    return (
      <div className="space-y-6">
        {/* Operations Overview Banner */}
        <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Procurement Officer Command Center</span>
              <span className="text-xl">🏢</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Centre Operations Hub: {activeCenterName} • Officer In-Charge: {user.name} ({user.licenseOrId})
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('checkin')}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <ScanLine className="w-4 h-4" />
              <span>Gate QR Scanner</span>
            </button>
            <button
              onClick={() => setActiveTab('grading')}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <Scale className="w-4 h-4" />
              <span>Weigh & Grade</span>
            </button>
          </div>
        </div>

        {/* Action notification banner if any */}
        {actionNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Exactly Requested Part 10 Metrics:
            1. Storage silo remaining capacity gauge
            2. Daily intake vs target (MT)
            3. Active yard vehicles
            4. Transporter truck dispatch requirement alerts
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Storage Silo Remaining Capacity Gauge */}
          <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs hover:shadow-card transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Silo Storage Remaining</span>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                🏬
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">240 MT</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                76% Full
              </span>
            </div>
            {/* Visual Gauge Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full" style={{ width: '76%' }}></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              760 MT stored / 1,000 MT max silo limit
            </p>
          </div>

          {/* Metric 2: Daily Intake vs Target (MT) */}
          <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs hover:shadow-card transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Daily Intake vs Target</span>
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                🎯
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">420 MT</span>
              <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                70% Quota
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '70%' }}></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Target: 600 MT today • 180 MT remaining
            </p>
          </div>

          {/* Metric 3: Active Yard Vehicles */}
          <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs hover:shadow-card transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Active Yard Vehicles</span>
              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                🚜
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{inQueue} Trucks</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                In Queue
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">
              Gate 1 & Gate 2 • Avg. turnaround: 28 mins
            </p>
          </div>

          {/* Metric 4: Transporter Truck Dispatch Requirement Alert */}
          <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs hover:shadow-card transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>Dispatches Required</span>
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                🚛
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-700">3 Trailers</span>
              <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                Urgent
              </span>
            </div>
            <p className="text-[11px] text-purple-700 font-semibold mt-3 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              Silo transfer needed to avoid yard choke
            </p>
          </div>
        </div>

        {/* Live Yard Activity Feed & Operational Capacity Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Yard Roster Quick View */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-surface-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Yard Queue (Real-Time Control)</h3>
                <p className="text-xs text-slate-500">Farmers currently staged inside Mandi waiting for inspection & scale.</p>
              </div>
              <button
                onClick={() => setActiveTab('roster')}
                className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <span>Full Daily Roster</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {slots.filter(s => s.status === 'in_queue' || s.status === 'at_weighbridge').map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-900 font-black text-sm flex items-center justify-center shrink-0">
                      {slot.tokenNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{slot.farmerName}</span>
                        <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {slot.vehicleNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {slot.cropType} • Est. {slot.estimatedWeightKg} kg • {slot.gateNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCallNextToken(slot)}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 active:scale-95"
                      title="Chime speaker announcement"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call Next</span>
                    </button>
                    <button
                      onClick={() => handleSendSmsAlert(slot)}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 active:scale-95"
                      title="Send SMS alert"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>SMS</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSlotId(slot.id);
                        setActiveTab('grading');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs active:scale-95"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Grade & Weigh</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mandi Capacity & Dispatch Widget */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-surface-border shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Yard Storage & Evacuation Status
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Paddy Storage Bay 2</span>
                    <span className="font-bold text-slate-900">82%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Wheat Silo Bay A</span>
                    <span className="font-bold text-slate-900">65%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Yard Vehicle Parking Bay</span>
                    <span className="font-bold text-slate-900">45%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-5 p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
                <p className="font-bold flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-purple-600 shrink-0" />
                  Transporter Truck Dispatch Triggered
                </p>
                <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">
                  3 commercial transit trailers have been summoned to evacuate 350 MT of procured paddy to the FCI Sitapur Silo to prevent yard choke.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // PART 11: Officer QR Scanner & Digital Gate Check-in Desk
  // =========================================================================
  const renderCheckInDesk = () => (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              📸
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Gate QR Scanner & Digital Check-in Desk
              </h2>
              <p className="text-xs text-slate-500">
                Scan farmer's QR pass or enter Token Number manually to validate and admit them.
              </p>
            </div>
          </div>

          <button
            onClick={() => setCameraActive(!cameraActive)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
            title="Toggle Camera Viewfinder"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder Simulator with Viewfinder Graphics */}
        {cameraActive && (
          <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-video flex flex-col items-center justify-center text-white mb-6 border-2 border-emerald-500/50 shadow-inner">
            <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative flex items-center justify-center">
              {/* Viewfinder crosshairs */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400"></div>
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400"></div>
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400"></div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400"></div>
              
              {/* Laser scanning beam */}
              <div className="w-full h-0.5 bg-emerald-400 shadow-md shadow-emerald-400 animate-bounce"></div>
            </div>
            <span className="text-[11px] text-emerald-300 font-mono mt-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Optical Scanner Active • Align Pass QR Inside Frame
            </span>
          </div>
        )}

        {/* Scan Result Feedback Alert */}
        {scanMessage && (
          <div
            className={`p-4 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2.5 ${
              scanMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                : 'bg-red-50 text-red-900 border border-red-300'
            }`}
          >
            {scanMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{scanMessage.text}</span>
          </div>
        )}

        {/* Manual ID / Barcode Entry Form */}
        <form onSubmit={handleScanSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Manual Token / Phone / QR Code Input
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="e.g. TK-109 or 9823411223"
                className="flex-1 px-3.5 py-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
              >
                Validate & Admit
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-[10px] text-slate-400 font-medium">Quick test demo passes:</span>
              <button
                type="button"
                onClick={() => setScanInput('TK-109')}
                className="text-[10px] text-emerald-700 font-bold underline hover:text-emerald-900"
              >
                TK-109 (Gurpreet Singh)
              </button>
              <button
                type="button"
                onClick={() => setScanInput('TK-108')}
                className="text-[10px] text-emerald-700 font-bold underline hover:text-emerald-900"
              >
                TK-108 (Ramesh Patel)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  // =========================================================================
  // PART 12: Officer Daily Roster Management Station
  // =========================================================================
  const renderDailyRoster = () => {
    // Filter by the exactly requested tabs: Expected Today | Waiting in Yard | Completed
    const filteredSlots = slots.filter((slot) => {
      if (rosterTab === 'expected') return slot.status === 'expected';
      if (rosterTab === 'in_queue') return slot.status === 'in_queue' || slot.status === 'at_weighbridge';
      if (rosterTab === 'completed') return slot.status === 'completed';
      return true;
    }).filter(s =>
      s.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daily Procurement Roster</h2>
              <p className="text-xs text-slate-500">Live roster of all farmers scheduled, waiting, and completed today.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search token, name, vehicle..."
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Action notification banner if any */}
          {actionNotice && (
            <div className="p-3 mb-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionNotice}</span>
            </div>
          )}

          {/* Exactly 3 Tabs: Expected Today | Waiting in Yard | Completed */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4 text-xs font-semibold">
            <button
              onClick={() => setRosterTab('in_queue')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                rosterTab === 'in_queue'
                  ? 'bg-amber-100 text-amber-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Waiting in Yard / In Queue</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                {slots.filter(s => s.status === 'in_queue' || s.status === 'at_weighbridge').length}
              </span>
            </button>

            <button
              onClick={() => setRosterTab('expected')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                rosterTab === 'expected'
                  ? 'bg-blue-100 text-blue-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Expected Today</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-200 text-blue-900 text-[10px] font-bold">
                {slots.filter(s => s.status === 'expected').length}
              </span>
            </button>

            <button
              onClick={() => setRosterTab('completed')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                rosterTab === 'completed'
                  ? 'bg-emerald-100 text-emerald-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Completed</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
                {slots.filter(s => s.status === 'completed').length}
              </span>
            </button>
          </div>

          {/* Roster Table with Actions to Call Next Token, Send SMS Alerts, or Re-order Priority */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Token</th>
                  <th className="pb-3">Farmer Details</th>
                  <th className="pb-3">Crop Variety</th>
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Slot Time</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions (Call / SMS / Priority)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSlots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900">
                      {slot.tokenNumber}
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-slate-900">{slot.farmerName}</p>
                      <p className="text-[10px] text-slate-400">{slot.farmerPhone}</p>
                    </td>
                    <td className="py-3 text-slate-700">
                      {slot.cropType} ({slot.estimatedWeightKg} kg)
                    </td>
                    <td className="py-3 font-mono text-slate-600">
                      {slot.vehicleNumber}
                    </td>
                    <td className="py-3 text-slate-500">
                      {slot.slotTime}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          slot.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : slot.status === 'in_queue'
                            ? 'bg-amber-100 text-amber-800'
                            : slot.status === 'at_weighbridge'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {slot.status === 'in_queue' ? 'In Yard' : slot.status === 'at_weighbridge' ? 'At Scale' : slot.status}
                      </span>
                    </td>

                    {/* Actions: Call Next Token, Send SMS Alert, Re-order Priority */}
                    <td className="py-3 text-right">
                      {slot.status === 'expected' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handlePrioritizeToken(slot)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 active:scale-95"
                            title="Move from Expected to In Queue"
                          >
                            <ScanLine className="w-3 h-3" />
                            <span>Admit</span>
                          </button>
                          <button
                            onClick={() => handleSendSmsAlert(slot)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Send SMS Reminder"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : slot.status !== 'completed' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCallNextToken(slot)}
                            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1 active:scale-95"
                            title="Chime speaker announcement"
                          >
                            <Volume2 className="w-3 h-3 text-emerald-600" />
                            <span>Call</span>
                          </button>
                          <button
                            onClick={() => handleSendSmsAlert(slot)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Send SMS"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handlePrioritizeToken(slot)}
                            className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                            title="Re-order Priority to Front"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSlotId(slot.id);
                              setActiveTab('grading');
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold"
                          >
                            Grade & Weigh
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-semibold">Cleared & Issued GRN</span>
                      )}
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

  // =========================================================================
  // PART 13: Digital Quality Grading & Weighbridge Inspection Form
  // =========================================================================
  const renderGradingForm = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            ⚖️
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Digital Quality Inspection & Weighbridge Station
            </h2>
            <p className="text-xs text-slate-500">
              Fast entry for moisture %, FAQ grading, gross/tare weights, auto-computed MSP payout, and instant GRN.
            </p>
          </div>
        </div>

        {weighSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 animate-in fade-in duration-300">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Goods Receipt Note (GRN) Successfully Sealed!</p>
              <p className="text-xs text-emerald-700">
                Issued GRN: <strong>{lastGeneratedGrn}</strong>. Total ₹{totalAmountCalculated.toLocaleString('en-IN')} approved for Direct Benefit Transfer.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleCompleteWeighing} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Waiting Token from Yard
            </label>
            <select
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              className="w-full text-xs font-medium py-2.5 px-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {slots.filter(s => s.status !== 'completed').map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.tokenNumber} - {slot.farmerName} ({slot.cropType}, {slot.vehicleNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Gross Weight & Tare Weight calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Gross Weight (Loaded Trolley, kg)
              </label>
              <input
                type="number"
                required
                value={grossWeight}
                onChange={(e) => setGrossWeight(e.target.value)}
                className="w-full text-xs font-mono font-bold py-2.5 px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tare Weight (Empty Vehicle, kg)
              </label>
              <input
                type="number"
                required
                value={tareWeight}
                onChange={(e) => setTareWeight(e.target.value)}
                className="w-full text-xs font-mono font-bold py-2.5 px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Computed Net Weight Banner */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Computed Net Weight:</span>
            <span className="text-sm font-black text-slate-900 font-mono">
              {netWeightCalculated} kg ({(netWeightCalculated / 100).toFixed(2)} Quintals)
            </span>
          </div>

          {/* Moisture Percentage (%) and FAQ Grade (Grade A / Grade B / Rejection) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Moisture Percentage (%)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={moisture}
                onChange={(e) => setMoisture(e.target.value)}
                className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <span className={`text-[10px] mt-1 block font-semibold ${
                Number(moisture) <= 14.0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {Number(moisture) <= 14.0 ? '✓ Standard Compliant (Max 14.0%)' : '⚠️ Exceeds 14.0% limit (Price deduction applies)'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Fair Average Quality (FAQ) Grade
              </label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value as any)}
                className="w-full text-xs font-medium py-2.5 px-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="FAQ Grade A">FAQ Grade A (100% Full MSP Rate)</option>
                <option value="FAQ Grade B">FAQ Grade B (Standard Buffer Stock)</option>
                <option value="Sub-standard / Rejected">Sub-standard / Rejected (Route to Local Market)</option>
              </select>
            </div>
          </div>

          {/* Auto-computed MSP Payout Summary */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Applicable MSP Rate:</span>
              <span className="font-bold text-slate-900">₹{mspRate} / Quintal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Net Quantity:</span>
              <span className="font-bold text-slate-900">{(netWeightCalculated / 100).toFixed(2)} Quintals</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-emerald-200 text-sm font-extrabold text-emerald-950">
              <span>Auto-Computed MSP Payout:</span>
              <span className="text-emerald-700">₹{totalAmountCalculated.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Submit Action: Generates instant Goods Receipt Note (GRN / E-Pauti) */}
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Seal Weighing & Generate E-Pauti (GRN)</span>
            <FileCheck className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );

  switch (activeTab) {
    case 'checkin':
      return renderCheckInDesk();
    case 'roster':
      return renderDailyRoster();
    case 'grading':
      return renderGradingForm();
    default:
      return renderCommandCenter();
  }
};
