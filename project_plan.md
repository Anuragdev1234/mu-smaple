# DoCA Smart Farmer Procurement & Congestion Management Platform
## Master 20-Part Implementation Breakdown

This 20-part modular plan covers every requirement of the Department of Consumer Affairs (DoCA) smart procurement system, styled directly after the reference video UI (forest-green sidebar, card-based surfaces, real-time tracking timeline, and seamless demo role switcher).

---

### Part 1: Project Architecture & Design System Setup
- Initialize project with React / Next.js, TypeScript, and Tailwind CSS.
- Configure color tokens directly from video:
  - Sidebar Green: `#064E3B` / `#0A4226`
  - Active Menu Accent: `#10B981` / Sage green
  - Canvas Background: `#F8FAFC`
  - Surface Cards: Pure white with subtle elevated borders
  - Badges: Emerald (Active/Completed), Amber (In Queue/Pending), Rose (Cancelled/At Risk).

### Part 2: Global Header & Demo Role Switcher
- Persistent top navigation bar matching the video.
- Quick **Demo Role Switcher Toggle** (Farmer 🧑🌾 ↔ Procurement Officer 🏢 ↔ Transporter 🚛 ↔ Local Buyer 🏪 ↔ CSC Kiosk 🏛️).
- Location indicator ("Lucknow Centre / Krishi Mandi"), Notification Bell with unread badges, and user profile avatar.

### Part 3: Role-Aware Collapsible Sidebar
- Dynamic left navigation reflecting the active persona:
  - **Farmer**: Dashboard, Book Slot, My QR Pass, Queue Status, History & Payments, Support.
  - **Procurement Officer**: Overview, Check-in / Scanner, Daily Roster, Inspection & Grading, Capacity & Logistics.
  - **Transporter**: Active Loads, Live Trip Tracker, E-Challans, Vehicle Telemetry.
  - **Local Buyer**: Open Market Board, Quality Reports, Bidding Desk, Invoices.
- Active pill state, tooltips, and bottom user card with logout button (identical to video).

### Part 4: Unified Multi-Role Authentication & Auto-Routing
- Single entry login page with role tabs:
  - **Farmer**: Phone number + 6-digit OTP (passwordless).
  - **Procurement Officer & Transporter**: Official DoCA/Agency ID + Password.
  - **Local Buyer**: Phone + OTP + Trade License / GSTIN validation.
- Auto-routing engine redirecting authenticated sessions to their designated dashboards.

### Part 5: Farmer Dashboard Overview & KPI Metrics
- Top banner: "Welcome back, Ramesh Patel! 👋" + quick "+ Book New Slot" CTA.
- 4 KPI cards matching video:
  - `Upcoming Booked Slot` (Date & Mandi)
  - `Active Token & Queue Position`
  - `Total Produce Sold` (Quintals)
  - `Total MSP Payouts Credited` (₹)
- AI Congestion & Harvest Arrival forecast card (matching video's AI Demand card).

### Part 6: Smart Slot Booking Engine
- Step-by-step slot reservation wizard:
  - Step 1: Crop selection (Wheat, Paddy, Mustard, Pulses) with standard MSP pricing display.
  - Step 2: Estimated quantity (Quintals) & vehicle type (Tractor trolley, pickup, tempo).
  - Step 3: Nearest procurement centre selection with live capacity badges (Green = Fast, Yellow = Moderate, Red = Heavy Wait).
  - Step 4: Date & hourly time slot selection with instant quota reservation.

### Part 7: Farmer Scannable QR Code Pass
- Dedicated digital pass screen for the booked appointment.
- High-contrast scannable QR Code containing encrypted slot ID, farmer Aadhaar hash, crop, and allotted window.
- Key pass metadata: Token Number, Centre Gate Number, Entry Window (e.g., 09:30 AM - 10:30 AM).
- One-click actions: "Save to Phone", "Print PDF Pass", and "Share via WhatsApp / SMS".

### Part 8: Real-Time Queue & Waiting Time Tracker
- Modeled directly on the video's live delivery tracking timeline.
- Dynamic visual progress steps:
  1. `Slot Confirmed` (Scheduled)
  2. `Gate Check-in` (Arrived at Mandi)
  3. `Moisture & Quality Inspection`
  4. `Weighbridge Gross & Tare Weighing`
  5. `E-Pauti / Goods Receipt Generated`
  6. `Payment Direct Transfer Initiated`
- Live stats: Current Token Serving, Estimated Wait Time countdown, and Active Gate assignment.

### Part 9: Procurement & Direct Benefit Transfer (DBT) History
- Table layout matching the video's *Orders* and *Earnings* screens.
- Search, filter by crop type or date range, and pagination.
- Columns: Transaction ID, Date, Centre Name, Accepted Weight, Quality Grade, Total MSP Value, Payment Status badge (*Settled via PFMS*, *Processing*, *Under Verification*).
- Action to download digital E-Pauti (Government Procurement Receipt).

### Part 10: Procurement Officer Command Center & Capacity Metrics
- Mandi in-charge overview screen:
  - Metric cards: Today's Total Target (MT), Handled Today, Vehicles in Yard, Storage Remaining (%).
  - Storage space gauge / circular capacity indicator.
  - Logistics dispatch requirement alert: "3 Transporter Trucks needed for Silo transfer".
  - Live Mandi Congestion Level meter.

### Part 11: Officer QR Scanner & Digital Gate Check-in Desk
- Check-in interface for gate security and intake officers:
  - Device camera QR code scanner component with visual viewfinder.
  - Manual Token / Phone / Booking ID entry fallback.
  - Instant validation: Confirms slot validity, prevents duplicate entries or out-of-turn vehicles.
  - "Approve Gate Entry" action moves farmer from `Expected` to `In Queue` and dispatches automated entry SMS.

### Part 12: Officer Daily Roster Management Station
- Multi-tab live queue table:
  - `Expected Today` (Upcoming arrivals)
  - `Waiting in Yard / In Queue` (Checked-in, waiting for weighbridge/inspection)
  - `Completed` (Processed and cleared)
- Actions for officer: Call Next Token (triggers gate PA announcement & SMS alert), Mark No-Show, or Re-order Priority.

### Part 13: Digital Quality Grading & Weighbridge Inspection Form
- Fast data entry form for quality inspectors and weighbridge staff:
  - Moisture percentage analyzer input (e.g., 12.4% vs Max 14%).
  - Foreign matter / Fair Average Quality (FAQ) grade selector (Grade A, Grade B, Rejection).
  - Gross Weight and Tare Weight inputs (Net Weight calculated automatically).
  - Automated MSP Payout calculation with government grade deduction/bonus algorithms.
  - Generates official DoCA Goods Receipt Note (GRN / E-Pauti).

### Part 14: Transporter Dashboard & Active Dispatches
- Driver/Contractor cockpit styled directly on the video's *Transit Partner* view:
  - Driver profile banner (e.g., *Suresh Kumar Maurya - TRANSIT PARTNER*), On-Duty/Off-Duty toggle, vehicle registration (e.g., *UP 32 BN 4410*), payload capacity bar (`750 kg / 1500 kg`), and GPS telemetry status.
  - `Active Dispatches` feed: List of ready loads at procurement centres awaiting warehouse haulage.

### Part 15: Transporter Live Trip Tracker & Warehouse Dispatch
- Interactive route tracking screen between Mandi procurement centre and State Warehouse / FCI Silo.
- Route status milestones: `Dispatched from Mandi` ➔ `In Transit on Highway` ➔ `Arrived at Warehouse Gate` ➔ `Unloading & Verified`.
- Live ETA, distance remaining, driver call/contact button.

### Part 16: Transporter Digital E-Challans & Sign-Off
- Paperless transit documentation:
  - Digital cargo manifest with crop type, batch lot number, and sealed bag count.
  - Digital Sign-off & OTP handover verification between mandi officer, driver, and warehouse manager.
  - Proof of delivery archive with timestamped tamper-proof logging.

### Part 17: Local Buyer Marketplace Feed & Open Market Board
- Secondary marketplace for lots not acquired under official buffer stock (quota full or non-FAQ grade):
  - Feed of available produce lots currently staged at nearby centres.
  - Crop cards with photo, location, lot quantity, farmer asking price, and inspector verification stamp.
  - Filters for commodity type, distance radius, and quality grade.

### Part 18: Local Buyer Quality Reports & Bidding Desk
- Transparent quality inspection details view:
  - Displays official moisture content, grain purity percentage, and inspector notes.
- Instant Bidding & Direct Purchase module:
  - Submit direct price per quintal offer or accept farmer's instant price.
  - Escrow / Direct payment initiation with digital invoice generation.

### Part 19: CSC / Panchayat Kiosk Mode & Feature-Phone Inclusivity
- Dedicated **Assisted Kiosk Interface** for Common Service Centres and Gram Panchayats:
  - Lightweight booking flow for farmers without smartphones.
  - **Printable Thermal / A4 Paper Slip Generator** with large-font QR code and gate schedule.
  - Interactive **IVR (Interactive Voice Response) Phone Simulator** demonstrating keypad slot confirmation (Press 1 for Paddy, Press 2 for Wheat).

### Part 20: Notification Engine, Audio Announcements & Demo Polish
- Live interactive notification drawer simulating SMS alerts to farmer phones ("Your Token #18 is called at Gate 2").
- Text-to-speech token announcement chime for mandi gate loud-speakers.
- End-to-end integration and polished walkthrough ensuring 100% fidelity to the reference video UI.
