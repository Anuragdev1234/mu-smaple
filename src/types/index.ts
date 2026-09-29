export type UserRole = 'farmer' | 'buyer' | 'transporter' | 'local_buyer' | 'kiosk';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar: string;
  organization?: string;
  location: string;
  licenseOrId?: string;
  landArea?: string;
}

export type SlotStatus = 'expected' | 'in_queue' | 'at_weighbridge' | 'inspection' | 'completed' | 'cancelled';

export interface SlotBooking {
  id: string;
  tokenNumber: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  cropType: string;
  estimatedWeightKg: number;
  vehicleType: 'Tractor Trolley' | 'Pickup Truck / Tata Ace' | 'Bullock Cart / Mini Tempo';
  vehicleNumber: string;
  centerId: string;
  centerName: string;
  slotDate: string;
  slotTime: string;
  gateNumber: string;
  queuePosition: number;
  estimatedWaitMinutes: number;
  status: SlotStatus;
  createdAt: string;
  qrPayload: string;
}

export type PaymentStatus = 'settled' | 'processing' | 'pending';

export interface ProcurementRecord {
  id: string;
  slotId: string;
  tokenNumber: string;
  farmerName: string;
  farmerPhone: string;
  cropType: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  moisturePercent: number;
  qualityGrade: 'FAQ Grade A' | 'FAQ Grade B' | 'Sub-standard / Rejected';
  mspRatePerQuintal: number;
  totalPaiAmount: number;
  paymentStatus: PaymentStatus;
  utrOrReference?: string;
  grnNumber: string; // Goods Receipt Note
  date: string;
  centerName: string;
  bankDetails: {
    accountNumber: string;
    bankName: string;
    ifsc: string;
  };
}

export interface TransitTrip {
  id: string;
  lotId: string;
  cropType: string;
  weightKg: number;
  bagsCount: number;
  originCenter: string;
  destinationWarehouse: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  vehicleCapacityKg: number;
  currentPayloadKg: number;
  status: 'assigned' | 'loading' | 'in_transit' | 'delivered';
  currentSpeedKmH: number;
  temperatureC?: number;
  gpsActive: boolean;
  eta: string;
  challanNumber: string;
}

export interface LocalMarketLot {
  id: string;
  cropType: string;
  variety: string;
  weightKg: number;
  moisturePercent: number;
  grade: string;
  farmerName: string;
  farmerLocation: string;
  basePricePerQuintal: number;
  currentHighestBidPerQuintal: number;
  bidCount: number;
  centerLocation: string;
  imageUrl: string;
  status: 'open_for_bidding' | 'bid_placed' | 'bid_accepted' | 'sold';
  rejectionReason?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'sms' | 'system' | 'call' | 'payment';
  timestamp: string;
  read: boolean;
  roleTarget: UserRole | 'all';
}
