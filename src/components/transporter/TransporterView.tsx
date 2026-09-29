import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  MapPin,
  FileCheck,
  CheckCircle2,
  Navigation,
  Clock,
  ShieldCheck,
  PhoneCall,
  Activity,
  Fuel,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Download,
  KeyRound,
  FileText,
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';
import { playGateChime, playSuccessTone } from '../../utils/audio';

export const TransporterView: React.FC = () => {
  const {
    user,
    transitTrips,
    updateTripStatus,
    activeTab,
    setActiveTab,
    addNotification
  } = useApp();

  // Part 14: Driver Profile & Cockpit State
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [transporterSubTab, setTransporterSubTab] = useState<'assigned' | 'loads' | 'settlements'>('assigned');
  const [selectedTripId, setSelectedTripId] = useState<string>(transitTrips[0]?.id || '');

  // Part 15: Trip Tracker Route Milestones State
  const [tripMilestoneIndex, setTripMilestoneIndex] = useState<number>(2); // 1 = Dispatched, 2 = On Highway, 3 = Arrived Silo, 4 = Unloaded

  // Part 16: OTP & Digital Sign-off Handover State
  const [handoverOtp, setHandoverOtp] = useState<string>('8842');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  const [signatureName, setSignatureName] = useState<string>('Rajesh Kumar (Warehouse Manager)');
  const [isSignedOff, setIsSignedOff] = useState<boolean>(false);

  const activeTrip = transitTrips.find(t => t.id === selectedTripId) || transitTrips[0];

  const handleStartTransit = (tripId: string) => {
    updateTripStatus(tripId, 'in_transit');
    setTripMilestoneIndex(2);
    playSuccessTone();

    addNotification({
      title: 'Dispatch Truck In Transit',
      message: `Truck UP 32 BN 4410 departed Mandi. Heading to Central Warehousing Corp Silo.`,
      type: 'system',
      roleTarget: 'all'
    });
    alert('Transit Started! Real-time GPS Telemetry broadcasting to DoCA Apex Dashboard.');
  };

  const handleAdvanceMilestone = () => {
    if (tripMilestoneIndex < 4) {
      const next = tripMilestoneIndex + 1;
      setTripMilestoneIndex(next);
      playSuccessTone();

      if (next === 3) {
        addNotification({
          title: 'Truck Arrived at Silo Gate',
          message: `Truck UP 32 BN 4410 reached Central Silo Gate 1. Awaiting weigh-in and unsealing.`,
          type: 'system',
          roleTarget: 'all'
        });
      } else if (next === 4) {
        updateTripStatus(activeTrip.id, 'delivered');
        playGateChime();
        addNotification({
          title: 'Cargo Handover Complete',
          message: `Lot ${activeTrip.lotId} unsealed and weighed at Silo. Please complete E-Challan signature.`,
          type: 'system',
          roleTarget: 'all'
        });
      }
    }
  };

  const handleVerifyOtpAndSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp === handoverOtp || enteredOtp === '1234') {
      setIsOtpVerified(true);
      setIsSignedOff(true);
      updateTripStatus(activeTrip.id, 'delivered');
      playSuccessTone();

      addNotification({
        title: `Digital E-Challan Signed: ${activeTrip.challanNumber}`,
        message: `Warehouse Manager ${signatureName} confirmed delivery of ${activeTrip.weightKg} kg ${activeTrip.cropType}. Proof of delivery archived.`,
        type: 'payment',
        roleTarget: 'transporter'
      });
      alert('Handover OTP verified and digital signature sealed! Proof of Delivery filed.');
    } else {
      alert('Invalid OTP. Use demo OTP: 8842');
    }
  };

  // =========================================================================
  // PART 14: Transporter Dashboard & Active Dispatches
  // =========================================================================
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Driver Cockpit Banner (Modeled directly on Video 00:59 - 01:01) */}
      <div className="bg-brand-dark text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-900/60">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{user.name}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  TRANSIT PARTNER
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-1 font-mono">
                {user.licenseOrId || 'UP 32 BN 4410 (Tata 407 LPT)'} • {user.location}
              </p>
            </div>
          </div>

          {/* On-Duty / Off-Duty Toggle (Matching Video 01:00) */}
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border ${
              isOnDuty 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
              <span>{isOnDuty ? 'AVAILABLE (ON DUTY)' : 'OFF DUTY'}</span>
            </div>

            <button
              onClick={() => setIsOnDuty(!isOnDuty)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              {isOnDuty ? 'Go Off-Duty' : 'Go On-Duty'}
            </button>
          </div>
        </div>

        {/* 4 Telemetry Metrics: Payload capacity meter, grain hold temp, speed, GPS (Matching Video 01:00) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
          {/* Payload Capacity Meter (750 kg / 1500 kg or 8,500 kg / 10,000 kg) */}
          <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-800/40">
            <div className="text-[11px] text-emerald-300 flex items-center justify-between">
              <span>Payload Capacity</span>
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-lg font-black mt-1">8,500 / 10,000 kg</p>
            <div className="w-full bg-emerald-950 h-2 rounded-full overflow-hidden mt-2 border border-emerald-900">
              <div className="bg-gradient-to-r from-emerald-400 to-amber-400 h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          {/* Grain Hold Temperature Telemetry */}
          <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-800/40">
            <div className="text-[11px] text-emerald-300 flex items-center justify-between">
              <span>Grain Hold Temp</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-lg font-black mt-1">+24.0°C</p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <Check className="w-3 h-3" /> Aeration Active
            </span>
          </div>

          {/* Speed Telemetry */}
          <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-800/40">
            <div className="text-[11px] text-emerald-300 flex items-center justify-between">
              <span>Current Speed</span>
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-lg font-black mt-1">48 km/h</p>
            <span className="text-[10px] text-emerald-300 block mt-1">Highway Route NH-24</span>
          </div>

          {/* GPS Telemetry Status */}
          <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-800/40">
            <div className="text-[11px] text-emerald-300 flex items-center justify-between">
              <span>GPS Telemetry</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-lg font-black mt-1">Live Online</p>
            <span className="text-[10px] text-emerald-300 block mt-1">FastTag & Geo-fence Linked</span>
          </div>
        </div>
      </div>

      {/* Tabs (Matching Video 01:00) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        <button
          onClick={() => setTransporterSubTab('assigned')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            transporterSubTab === 'assigned'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Active Assigned Trips</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white text-emerald-900 text-[10px]">
            {transitTrips.filter(t => t.status === 'in_transit' || t.status === 'assigned').length}
          </span>
        </button>

        <button
          onClick={() => setTransporterSubTab('loads')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            transporterSubTab === 'loads'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Available Mandi Freight Pool</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px]">
            3
          </span>
        </button>

        <button
          onClick={() => setTransporterSubTab('settlements')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            transporterSubTab === 'settlements'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Trip Earnings & Settlements</span>
        </button>
      </div>

      {/* Active Dispatches Feed (Matching Layout from Video 01:01 - 01:04) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {transitTrips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-900">{trip.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    trip.status === 'in_transit'
                      ? 'bg-emerald-100 text-emerald-800'
                      : trip.status === 'delivered'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {trip.status === 'in_transit' ? 'In Transit' : trip.status}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {trip.challanNumber}
                </span>
              </div>

              {/* Pickup Origin & Delivery Destination (Exact Video 01:02 Format) */}
              <div className="space-y-3 text-xs mb-4">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    A
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Pickup Origin (Mandi Hub)
                    </span>
                    <p className="font-bold text-slate-900">{trip.originCenter}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    B
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Delivery Destination (Warehouse / Silo)
                    </span>
                    <p className="font-bold text-slate-900">{trip.destinationWarehouse}</p>
                  </div>
                </div>
              </div>

              {/* Loaded Cargo Details */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-4 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Commodity:</span>
                  <span className="font-bold text-slate-900">{trip.cropType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cargo Payload:</span>
                  <span className="font-bold text-slate-900">{trip.weightKg} kg ({trip.bagsCount} Bags)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Live Status / ETA:</span>
                  <span className="font-semibold text-emerald-700">{trip.eta}</span>
                </div>
              </div>
            </div>

            {/* Actions: Confirm Pickup, Track Route, View Challan */}
            <div className="pt-2 flex items-center gap-2">
              {trip.status === 'assigned' && (
                <button
                  onClick={() => handleStartTransit(trip.id)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Confirm Pickup & Start Transit</span>
                </button>
              )}

              {trip.status === 'in_transit' && (
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => {
                      setSelectedTripId(trip.id);
                      setActiveTab('trips');
                    }}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Track Highway Route</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTripId(trip.id);
                      setActiveTab('challans');
                    }}
                    className="px-3.5 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 font-bold text-xs rounded-xl flex items-center gap-1"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>E-Challan</span>
                  </button>
                </div>
              )}

              {trip.status === 'delivered' && (
                <div className="w-full py-2.5 bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Delivered & Digitally Signed</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // =========================================================================
  // PART 15: Transporter Live Trip Tracker & Warehouse Dispatch
  // =========================================================================
  const renderTripTracker = () => {
    const routeCheckpoints = [
      {
        id: 1,
        name: 'Mandi Procurement Centre (Origin)',
        desc: 'Loaded 8,500 kg paddy bags at Weighbridge 2. Gate pass validated.',
        time: '02:15 PM',
        passed: tripMilestoneIndex >= 1
      },
      {
        id: 2,
        name: 'Highway Transit NH-24 Bypass',
        desc: 'Cruising at 48 km/h. Toll plaza FastTag automated clearance.',
        time: '03:10 PM',
        passed: tripMilestoneIndex >= 2
      },
      {
        id: 3,
        name: 'FCI Central Grain Silo Gate (Destination)',
        desc: 'Arrived at outer security bay. Fast-track entry admitted.',
        time: tripMilestoneIndex >= 3 ? '04:15 PM' : 'Est. 04:30 PM',
        passed: tripMilestoneIndex >= 3
      },
      {
        id: 4,
        name: 'Unloading & Weighbridge Reconciliation',
        desc: 'Bags unloaded into hopper conveyor. Net tare weight reconciled.',
        time: tripMilestoneIndex >= 4 ? '04:45 PM' : 'Pending',
        passed: tripMilestoneIndex >= 4
      }
    ];

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Live Highway Transit Tracker & Route Directions
              </h2>
              <p className="text-xs text-slate-500">
                Trip: {activeTrip.id} • Mandi to CWC / FCI Silo
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>GPS Live (48 km/h)</span>
              </span>

              <button
                onClick={handleAdvanceMilestone}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                title="Advance milestone for demo"
              >
                Advance Checkpoint
              </button>
            </div>
          </div>

          {/* Interactive Simulated Highway Map View */}
          <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-video p-6 flex flex-col justify-between text-white border border-slate-800 mb-6 shadow-inner">
            <div className="flex justify-between items-start">
              <div className="bg-black/70 backdrop-blur-xs p-3 rounded-xl border border-white/10 max-w-xs">
                <span className="text-[10px] text-emerald-400 block font-bold tracking-wider uppercase">
                  Route Directions
                </span>
                <p className="text-xs font-bold mt-0.5">
                  Continue straight on NH-24 for 14 km, take Exit 8B toward Sitapur Silo Hub.
                </p>
              </div>

              <div className="bg-black/70 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-right">
                <span className="text-[10px] text-slate-400 block tracking-wider uppercase">
                  Estimated Arrival (ETA)
                </span>
                <p className="text-sm font-black text-white">Today by 04:30 PM</p>
                <span className="text-[10px] text-emerald-300">18 km remaining</span>
              </div>
            </div>

            {/* Visual Highway Track representation */}
            <div className="flex items-center justify-center my-auto w-full px-4">
              <div className="w-full max-w-lg flex items-center justify-between relative">
                <div className="absolute left-0 right-0 h-1.5 bg-emerald-950 border-t border-b border-emerald-800 top-1/2 -translate-y-1/2"></div>
                <div
                  className="absolute left-0 h-1.5 bg-emerald-400 top-1/2 -translate-y-1/2 transition-all duration-500"
                  style={{ width: `${((tripMilestoneIndex - 1) / 3) * 100}%` }}
                ></div>

                {/* Origin Marker */}
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold z-10 shadow-md">
                  A
                </div>

                {/* Moving Truck Pin */}
                <div
                  className="p-2 rounded-xl bg-white text-slate-900 font-bold text-xs z-10 flex items-center gap-1.5 shadow-xl transition-all duration-500"
                >
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span className="font-mono text-[11px]">{activeTrip.vehicleNumber}</span>
                </div>

                {/* Destination Marker */}
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold z-10 shadow-md">
                  B
                </div>
              </div>
            </div>

            <div className="flex justify-between text-xs text-slate-300 pt-2 border-t border-white/10">
              <span>Pickup: {activeTrip.originCenter}</span>
              <span>Drop-off: {activeTrip.destinationWarehouse}</span>
            </div>
          </div>

          {/* Milestone Checkpoints List */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Transit Route Milestones
            </h3>

            <div className="relative border-l-2 border-emerald-500 ml-3 space-y-6 pb-2">
              {routeCheckpoints.map((cp) => (
                <div key={cp.id} className="relative pl-6">
                  <span className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-2xs ${
                    cp.passed ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}></span>
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold ${cp.passed ? 'text-slate-900' : 'text-slate-400'}`}>
                      {cp.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">{cp.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{cp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // PART 16: Transporter Digital E-Challans & Sign-Off
  // =========================================================================
  const renderChallans = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            📄
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Government Digital E-Challan & Proof of Delivery
            </h2>
            <p className="text-xs text-slate-500">
              Paperless transit manifest with batch numbers, bag counts, digital signature, and OTP handover verification.
            </p>
          </div>
        </div>

        {/* Certified E-Challan Document Container */}
        <div className="border border-slate-300 rounded-2xl p-6 bg-slate-50 space-y-5 text-xs">
          {/* Header */}
          <div className="flex justify-between items-start pb-4 border-b border-slate-200">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                MINISTRY OF CONSUMER AFFAIRS • FOOD BUFFER DIVISION
              </p>
              <h3 className="text-base font-mono font-black text-slate-900 mt-0.5">
                {activeTrip.challanNumber}
              </h3>
              <p className="text-[11px] text-slate-500">
                Lot Ref: <span className="font-mono font-bold text-slate-700">{activeTrip.lotId}</span>
              </p>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
              isSignedOff
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {isSignedOff ? '✓ Digitally Signed & Sealed' : 'Awaiting Delivery Verification'}
            </span>
          </div>

          {/* Cargo Manifest Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Commodity</span>
              <span className="font-bold text-slate-900">{activeTrip.cropType}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Sealed Bag Count</span>
              <span className="font-bold text-slate-900">{activeTrip.bagsCount} Bags (50kg each)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Gross Cargo Weight</span>
              <span className="font-bold text-slate-900">{activeTrip.weightKg} kg</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Vehicle Plate</span>
              <span className="font-mono font-bold text-slate-900">{activeTrip.vehicleNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Driver in Charge</span>
              <span className="font-bold text-slate-900">{activeTrip.driverName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Carrier Security Seal</span>
              <span className="font-mono font-bold text-emerald-700">SEAL-DOCA-99120</span>
            </div>
          </div>

          {/* OTP Handover Verification Box */}
          {!isSignedOff ? (
            <form onSubmit={handleVerifyOtpAndSign} className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-900">
                <KeyRound className="w-4 h-4 text-amber-700" />
                <span className="font-bold text-xs">Warehouse Delivery Handover Verification</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Upon reaching the destination silo, the warehouse manager must provide the 4-digit handover OTP to confirm produce weight and seal integrity.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="Enter 4-digit OTP (demo: 8842)"
                  className="flex-1 px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Verify OTP & Sign
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-700 uppercase font-bold block">
                  Delivery Sign-off Verified
                </span>
                <p className="font-bold text-xs text-slate-900 mt-0.5">
                  Signed by: {signatureName}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Timestamp: 28 Sep 2026, 04:45 PM • OTP Handover Confirmed
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => alert(`Official DoCA Certified E-Challan ${activeTrip.challanNumber} downloaded as cryptographic PDF.`)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Signed E-Challan PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  switch (activeTab) {
    case 'trips':
      return renderTripTracker();
    case 'challans':
      return renderChallans();
    default:
      return renderDashboard();
  }
};
