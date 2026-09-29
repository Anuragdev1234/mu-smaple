import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  UserProfile,
  SlotBooking,
  SlotStatus,
  ProcurementRecord,
  TransitTrip,
  LocalMarketLot,
  AppNotification
} from '../types';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  isLoggedIn: boolean;
  login: (role: UserRole, customUser?: Partial<UserProfile>) => void;
  logout: () => void;
  slots: SlotBooking[];
  addSlot: (bookingData: Partial<SlotBooking>) => SlotBooking;
  updateSlotStatus: (slotId: string, status: SlotStatus) => void;
  checkInByToken: (codeOrToken: string) => { success: boolean; message: string; slot?: SlotBooking };
  procurements: ProcurementRecord[];
  addProcurement: (record: Omit<ProcurementRecord, 'id' | 'grnNumber' | 'date'>) => ProcurementRecord;
  transitTrips: TransitTrip[];
  updateTripStatus: (tripId: string, status: TransitTrip['status']) => void;
  marketLots: LocalMarketLot[];
  placeBid: (lotId: string, bidAmount: number) => boolean;
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  showNotificationDrawer: boolean;
  setShowNotificationDrawer: (v: boolean) => void;
  showLoginModal: boolean;
  setShowLoginModal: (v: boolean) => void;
  activeCenterName: string;
  setActiveCenterName: (name: string) => void;
}

const defaultProfiles: Record<UserRole, UserProfile> = {
  farmer: {
    id: 'FARMER-8842',
    name: 'Ramesh Patel',
    phone: '+91 98765 43210',
    role: 'farmer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    organization: 'Kisan Agro Producer Org (FPO)',
    location: 'Bakshi Ka Talab, Lucknow, UP',
    landArea: '8.5 Acres'
  },
  buyer: {
    id: 'DOCA-OFFICER-102',
    name: 'Sanjeev Verma',
    phone: '+91 94150 11223',
    email: 'sanjeev.verma@doca.gov.in',
    role: 'buyer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    organization: 'Dept of Consumer Affairs (DoCA)',
    location: 'Central Mandi Complex #4, Lucknow',
    licenseOrId: 'DOCA-CENTRE-INCHARGE-LKO'
  },
  transporter: {
    id: 'TRANSIT-5501',
    name: 'Suresh Kumar Maurya',
    phone: '+91 91234 56789',
    role: 'transporter',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    organization: 'Kisan Rath Freight Fleet Ltd.',
    location: 'Kanpur-Agra Corridor, UP',
    licenseOrId: 'UP 32 BN 4410 (Tata 407)'
  },
  local_buyer: {
    id: 'BUYER-7719',
    name: 'Arjun Sharma',
    phone: '+91 98111 87654',
    email: 'arjun.sharma@agrotrade.in',
    role: 'local_buyer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    organization: 'Avadh Agro Mills & Private Mandi',
    location: 'Gomti Nagar, Lucknow, UP',
    licenseOrId: 'GSTIN: 09AABCA1234F1Z8'
  },
  kiosk: {
    id: 'KIOSK-LKO-09',
    name: 'Priyanka Devi (CSC VLE)',
    phone: '+91 99887 76655',
    role: 'kiosk',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    organization: 'Gram Panchayat Common Service Centre',
    location: 'Malihabad Panchayat, Lucknow, UP',
    licenseOrId: 'CSC-ID-883921'
  }
};

const initialSlots: SlotBooking[] = [
  {
    id: 'SLOT-001',
    tokenNumber: 'TK-108',
    farmerId: 'FARMER-8842',
    farmerName: 'Ramesh Patel',
    farmerPhone: '+91 98765 43210',
    cropType: 'Paddy (Basmati 1509)',
    estimatedWeightKg: 4500,
    vehicleType: 'Tractor Trolley',
    vehicleNumber: 'UP 32 EA 9821',
    centerId: 'CTR-LKO-04',
    centerName: 'DoCA Central Mandi, Lucknow',
    slotDate: 'Today, 28 Sep 2026',
    slotTime: '10:00 AM - 11:30 AM',
    gateNumber: 'Gate 2 (Heavy Trolley)',
    queuePosition: 3,
    estimatedWaitMinutes: 25,
    status: 'in_queue',
    createdAt: '2026-09-28 08:30',
    qrPayload: 'DOCA-SLOT-001-TK108-FARMER8842'
  },
  {
    id: 'SLOT-002',
    tokenNumber: 'TK-109',
    farmerId: 'FARMER-9912',
    farmerName: 'Gurpreet Singh',
    farmerPhone: '+91 98234 11223',
    cropType: 'Wheat (Sharbati A-One)',
    estimatedWeightKg: 3200,
    vehicleType: 'Pickup Truck / Tata Ace',
    vehicleNumber: 'UP 32 FT 4401',
    centerId: 'CTR-LKO-04',
    centerName: 'DoCA Central Mandi, Lucknow',
    slotDate: 'Today, 28 Sep 2026',
    slotTime: '11:30 AM - 01:00 PM',
    gateNumber: 'Gate 1 (Small Vehicles)',
    queuePosition: 4,
    estimatedWaitMinutes: 50,
    status: 'expected',
    createdAt: '2026-09-28 09:00',
    qrPayload: 'DOCA-SLOT-002-TK109-FARMER9912'
  },
  {
    id: 'SLOT-003',
    tokenNumber: 'TK-107',
    farmerId: 'FARMER-4421',
    farmerName: 'Baldev Yadav',
    farmerPhone: '+91 97654 33211',
    cropType: 'Mustard (Sarson)',
    estimatedWeightKg: 1800,
    vehicleType: 'Tractor Trolley',
    vehicleNumber: 'UP 32 BB 3110',
    centerId: 'CTR-LKO-04',
    centerName: 'DoCA Central Mandi, Lucknow',
    slotDate: 'Today, 28 Sep 2026',
    slotTime: '09:00 AM - 10:30 AM',
    gateNumber: 'Gate 2 (Heavy Trolley)',
    queuePosition: 1,
    estimatedWaitMinutes: 5,
    status: 'at_weighbridge',
    createdAt: '2026-09-28 08:00',
    qrPayload: 'DOCA-SLOT-003-TK107-FARMER4421'
  },
  {
    id: 'SLOT-004',
    tokenNumber: 'TK-105',
    farmerId: 'FARMER-1102',
    farmerName: 'Santosh Maurya',
    farmerPhone: '+91 96541 22998',
    cropType: 'Arhar / Tur Dal',
    estimatedWeightKg: 2200,
    vehicleType: 'Pickup Truck / Tata Ace',
    vehicleNumber: 'UP 32 CP 7780',
    centerId: 'CTR-LKO-04',
    centerName: 'DoCA Central Mandi, Lucknow',
    slotDate: 'Today, 28 Sep 2026',
    slotTime: '08:00 AM - 09:30 AM',
    gateNumber: 'Gate 1',
    queuePosition: 0,
    estimatedWaitMinutes: 0,
    status: 'completed',
    createdAt: '2026-09-28 07:30',
    qrPayload: 'DOCA-SLOT-004-TK105-FARMER1102'
  }
];

const initialProcurements: ProcurementRecord[] = [
  {
    id: 'PR-2026-091',
    slotId: 'SLOT-004',
    tokenNumber: 'TK-105',
    farmerName: 'Santosh Maurya',
    farmerPhone: '+91 96541 22998',
    cropType: 'Arhar / Tur Dal',
    grossWeightKg: 4200,
    tareWeightKg: 2000,
    netWeightKg: 2200,
    moisturePercent: 11.8,
    qualityGrade: 'FAQ Grade A',
    mspRatePerQuintal: 7550,
    totalPaiAmount: 166100,
    paymentStatus: 'settled',
    utrOrReference: 'PFMS20260928994102',
    grnNumber: 'GRN-LKO-2026-8819',
    date: '28 Sep 2026',
    centerName: 'DoCA Central Mandi, Lucknow',
    bankDetails: {
      accountNumber: '•••• •••• •••• 4412',
      bankName: 'State Bank of India',
      ifsc: 'SBIN0001248'
    }
  },
  {
    id: 'PR-2026-088',
    slotId: 'SLOT-PREV-1',
    tokenNumber: 'TK-092',
    farmerName: 'Ramesh Patel',
    farmerPhone: '+91 98765 43210',
    cropType: 'Paddy (Common Grade)',
    grossWeightKg: 5800,
    tareWeightKg: 2100,
    netWeightKg: 3700,
    moisturePercent: 13.2,
    qualityGrade: 'FAQ Grade A',
    mspRatePerQuintal: 2300,
    totalPaiAmount: 85100,
    paymentStatus: 'settled',
    utrOrReference: 'PFMS20260921443190',
    grnNumber: 'GRN-LKO-2026-8742',
    date: '21 Sep 2026',
    centerName: 'DoCA Central Mandi, Lucknow',
    bankDetails: {
      accountNumber: '•••• •••• •••• 5598',
      bankName: 'Bank of Baroda',
      ifsc: 'BARB0LUCKNO'
    }
  },
  {
    id: 'PR-2026-085',
    slotId: 'SLOT-PREV-2',
    tokenNumber: 'TK-077',
    farmerName: 'Ramesh Patel',
    farmerPhone: '+91 98765 43210',
    cropType: 'Wheat (Grade A)',
    grossWeightKg: 4900,
    tareWeightKg: 2100,
    netWeightKg: 2800,
    moisturePercent: 12.0,
    qualityGrade: 'FAQ Grade A',
    mspRatePerQuintal: 2275,
    totalPaiAmount: 63700,
    paymentStatus: 'settled',
    utrOrReference: 'PFMS20260814881290',
    grnNumber: 'GRN-LKO-2026-8511',
    date: '14 Aug 2026',
    centerName: 'DoCA Central Mandi, Lucknow',
    bankDetails: {
      accountNumber: '•••• •••• •••• 5598',
      bankName: 'Bank of Baroda',
      ifsc: 'BARB0LUCKNO'
    }
  }
];

const initialTrips: TransitTrip[] = [
  {
    id: 'TRIP-101',
    lotId: 'LOT-PADDY-892',
    cropType: 'Paddy (Common FAQ)',
    weightKg: 8500,
    bagsCount: 170,
    originCenter: 'DoCA Central Mandi, Lucknow',
    destinationWarehouse: 'Central Warehousing Corp (CWC), Sitapur Silo',
    driverName: 'Suresh Kumar Maurya',
    driverPhone: '+91 91234 56789',
    vehicleNumber: 'UP 32 BN 4410',
    vehicleCapacityKg: 10000,
    currentPayloadKg: 8500,
    status: 'in_transit',
    currentSpeedKmH: 48,
    temperatureC: 24,
    gpsActive: true,
    eta: 'Today by 04:30 PM (32 km away)',
    challanNumber: 'ECH-DOCA-2026-9042'
  },
  {
    id: 'TRIP-102',
    lotId: 'LOT-WHEAT-412',
    cropType: 'Wheat (Sharbati)',
    weightKg: 6200,
    bagsCount: 124,
    originCenter: 'Bakshi Ka Talab Mandi Hub',
    destinationWarehouse: 'FCI Central Grain Silo, Lucknow Ring Road',
    driverName: 'Suresh Kumar Maurya',
    driverPhone: '+91 91234 56789',
    vehicleNumber: 'UP 32 BN 4410',
    vehicleCapacityKg: 10000,
    currentPayloadKg: 0,
    status: 'assigned',
    currentSpeedKmH: 0,
    gpsActive: true,
    eta: 'Scheduled Pickup 05:45 PM',
    challanNumber: 'ECH-DOCA-2026-9043'
  }
];

const initialMarketLots: LocalMarketLot[] = [
  {
    id: 'MKT-LOT-01',
    cropType: 'Fresh Tomatoes (Hybrid)',
    variety: 'Desi Red Grade',
    weightKg: 1200,
    moisturePercent: 14.5,
    grade: 'Commercial Standard (Non-Buffer)',
    farmerName: 'Manoj Kumar',
    farmerLocation: 'Village Mal, Malihabad, Lucknow',
    basePricePerQuintal: 2800,
    currentHighestBidPerQuintal: 3100,
    bidCount: 5,
    centerLocation: 'DoCA Mandi Yard Bay 4',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
    status: 'open_for_bidding',
    rejectionReason: 'Exceeded daily DoCA government procurement quota'
  },
  {
    id: 'MKT-LOT-02',
    cropType: 'Red Onions (Nashik Quality)',
    variety: 'Medium Red',
    weightKg: 3500,
    moisturePercent: 13.0,
    grade: 'Direct Farm Grade A',
    farmerName: 'Ram Sevak',
    farmerLocation: 'Mohanlalganj, Lucknow',
    basePricePerQuintal: 2400,
    currentHighestBidPerQuintal: 2650,
    bidCount: 8,
    centerLocation: 'DoCA Mandi Yard Bay 6',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80',
    status: 'open_for_bidding'
  },
  {
    id: 'MKT-LOT-03',
    cropType: 'Pahadi & Desi Potatoes',
    variety: 'Chipsona High Starch',
    weightKg: 4200,
    moisturePercent: 12.8,
    grade: 'Industrial Grade B',
    farmerName: 'Vipin Tiwari',
    farmerLocation: 'Chinhat Cluster, Lucknow',
    basePricePerQuintal: 1800,
    currentHighestBidPerQuintal: 1920,
    bidCount: 3,
    centerLocation: 'DoCA Mandi Yard Bay 2',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80',
    status: 'open_for_bidding'
  }
];

const initialNotifications: AppNotification[] = [
  {
    id: 'NOTIF-001',
    title: 'Token #108 In Queue',
    message: 'Farmer Ramesh Patel: Your tractor UP 32 EA 9821 is now Position #3 at Gate 2. Est. wait time: 25 mins.',
    type: 'sms',
    timestamp: '10 mins ago',
    read: false,
    roleTarget: 'farmer'
  },
  {
    id: 'NOTIF-002',
    title: 'Yard Capacity Warning (78%)',
    message: 'Central Mandi Complex #4: 42 vehicles currently staged. Dispatch 2 transit trailers to FCI silo to prevent bottleneck.',
    type: 'system',
    timestamp: '25 mins ago',
    read: false,
    roleTarget: 'buyer'
  },
  {
    id: 'NOTIF-003',
    title: 'PFMS DBT Payment Credited ₹85,100',
    message: 'Direct benefit transfer for 37.00 Qtl Paddy successfully credited to Bank of Baroda A/c ••5598.',
    type: 'payment',
    timestamp: 'Yesterday',
    read: true,
    roleTarget: 'farmer'
  },
  {
    id: 'NOTIF-004',
    title: 'Freight Pickup Assigned',
    message: 'Truck UP 32 BN 4410: Collect 124 bags Wheat (6,200 kg) from Bakshi Ka Talab at 05:45 PM.',
    type: 'call',
    timestamp: '1 hour ago',
    read: false,
    roleTarget: 'transporter'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRoleState] = useState<UserRole>('farmer');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [user, setUser] = useState<UserProfile>(defaultProfiles.farmer);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [slots, setSlots] = useState<SlotBooking[]>(initialSlots);
  const [procurements, setProcurements] = useState<ProcurementRecord[]>(initialProcurements);
  const [transitTrips, setTransitTrips] = useState<TransitTrip[]>(initialTrips);
  const [marketLots, setMarketLots] = useState<LocalMarketLot[]>(initialMarketLots);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [activeCenterName, setActiveCenterName] = useState<string>('DoCA Central Mandi, Lucknow');

  // Change user profile when currentRole changes
  const setCurrentRole = (newRole: UserRole) => {
    setCurrentRoleState(newRole);
    setUser(defaultProfiles[newRole]);
    setActiveTab('dashboard'); // reset to default dashboard tab
  };

  const login = (role: UserRole, customUser?: Partial<UserProfile>) => {
    setCurrentRoleState(role);
    setUser({ ...defaultProfiles[role], ...customUser });
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setActiveTab('dashboard');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setShowLoginModal(true);
  };

  const addSlot = (bookingData: Partial<SlotBooking>): SlotBooking => {
    const nextTokenNum = `TK-${Math.floor(110 + Math.random() * 50)}`;
    const newSlot: SlotBooking = {
      id: `SLOT-${Date.now().toString().slice(-4)}`,
      tokenNumber: nextTokenNum,
      farmerId: user.id,
      farmerName: user.name,
      farmerPhone: user.phone,
      cropType: bookingData.cropType || 'Paddy (Common)',
      estimatedWeightKg: bookingData.estimatedWeightKg || 2500,
      vehicleType: bookingData.vehicleType || 'Tractor Trolley',
      vehicleNumber: bookingData.vehicleNumber || 'UP 32 XY 1024',
      centerId: bookingData.centerId || 'CTR-LKO-04',
      centerName: bookingData.centerName || activeCenterName,
      slotDate: bookingData.slotDate || 'Today, 28 Sep 2026',
      slotTime: bookingData.slotTime || '02:00 PM - 03:30 PM',
      gateNumber: bookingData.gateNumber || 'Gate 2',
      queuePosition: slots.filter(s => s.status === 'in_queue' || s.status === 'expected').length + 1,
      estimatedWaitMinutes: 35,
      status: 'expected',
      createdAt: new Date().toISOString(),
      qrPayload: `DOCA-${nextTokenNum}-${user.id}-${Date.now()}`
    };

    setSlots(prev => [newSlot, ...prev]);

    // Generate SMS notification
    addNotification({
      title: `Slot Booked: ${nextTokenNum}`,
      message: `Your booking for ${newSlot.cropType} (${newSlot.estimatedWeightKg} kg) is confirmed for ${newSlot.slotTime} at ${newSlot.centerName}. QR Pass generated.`,
      type: 'sms',
      roleTarget: 'farmer'
    });

    return newSlot;
  };

  const updateSlotStatus = (slotId: string, status: SlotStatus) => {
    setSlots(prev => prev.map(s => {
      if (s.id === slotId) {
        return { ...s, status };
      }
      return s;
    }));
  };

  const checkInByToken = (codeOrToken: string): { success: boolean; message: string; slot?: SlotBooking } => {
    const cleanQuery = codeOrToken.trim().toUpperCase();
    const matchedSlot = slots.find(s => 
      s.tokenNumber.toUpperCase() === cleanQuery || 
      s.id.toUpperCase() === cleanQuery || 
      s.qrPayload.toUpperCase().includes(cleanQuery) ||
      s.farmerPhone.includes(cleanQuery)
    );

    if (!matchedSlot) {
      return { success: false, message: `No active appointment found for token/code "${codeOrToken}".` };
    }

    if (matchedSlot.status === 'completed') {
      return { success: false, message: `Token ${matchedSlot.tokenNumber} has already been completed today.` };
    }

    // Move to in_queue
    updateSlotStatus(matchedSlot.id, 'in_queue');

    addNotification({
      title: `Gate Check-in Confirmed: ${matchedSlot.tokenNumber}`,
      message: `Farmer ${matchedSlot.farmerName} entered ${matchedSlot.gateNumber}. Position updated in live queue.`,
      type: 'sms',
      roleTarget: 'all'
    });

    return {
      success: true,
      message: `Token ${matchedSlot.tokenNumber} verified! Farmer ${matchedSlot.farmerName} admitted to queue.`,
      slot: { ...matchedSlot, status: 'in_queue' }
    };
  };

  const addProcurement = (recordData: Omit<ProcurementRecord, 'id' | 'grnNumber' | 'date'>): ProcurementRecord => {
    const grn = `GRN-LKO-2026-${Math.floor(8900 + Math.random() * 900)}`;
    const newRecord: ProcurementRecord = {
      ...recordData,
      id: `PR-${Date.now().toString().slice(-4)}`,
      grnNumber: grn,
      date: '28 Sep 2026'
    };

    setProcurements(prev => [newRecord, ...prev]);

    // If slot exists, mark completed
    if (recordData.slotId) {
      updateSlotStatus(recordData.slotId, 'completed');
    }

    // Automated notification
    addNotification({
      title: `E-Pauti (GRN) Issued: ${grn}`,
      message: `Procurement of ${newRecord.netWeightKg} kg ${newRecord.cropType} finalized. Total ₹${newRecord.totalPaiAmount.toLocaleString('en-IN')} approved for DBT transfer.`,
      type: 'payment',
      roleTarget: 'farmer'
    });

    return newRecord;
  };

  const updateTripStatus = (tripId: string, status: TransitTrip['status']) => {
    setTransitTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return { ...t, status };
      }
      return t;
    }));
  };

  const placeBid = (lotId: string, bidAmount: number): boolean => {
    let success = false;
    setMarketLots(prev => prev.map(lot => {
      if (lot.id === lotId && bidAmount > lot.currentHighestBidPerQuintal) {
        success = true;
        return {
          ...lot,
          currentHighestBidPerQuintal: bidAmount,
          bidCount: lot.bidCount + 1,
          status: 'bid_placed'
        };
      }
      return lot;
    }));

    if (success) {
      addNotification({
        title: 'New Highest Bid Received',
        message: `Arjun Sharma placed ₹${bidAmount}/Qtl on Lot ${lotId}.`,
        type: 'system',
        roleTarget: 'local_buyer'
      });
    }

    return success;
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newItem: AppNotification = {
      ...notif,
      id: `NOTIF-${Date.now()}`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newItem, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        user,
        isLoggedIn,
        login,
        logout,
        slots,
        addSlot,
        updateSlotStatus,
        checkInByToken,
        procurements,
        addProcurement,
        transitTrips,
        updateTripStatus,
        marketLots,
        placeBid,
        notifications,
        addNotification,
        markNotificationRead,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        showNotificationDrawer,
        setShowNotificationDrawer,
        showLoginModal,
        setShowLoginModal,
        activeCenterName,
        setActiveCenterName
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
