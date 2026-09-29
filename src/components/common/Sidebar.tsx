import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CalendarPlus,
  QrCode,
  Clock,
  Receipt,
  HelpCircle,
  ScanLine,
  Users,
  Scale,
  Warehouse,
  Truck,
  MapPin,
  FileCheck,
  TrendingUp,
  FileText,
  ShoppingBag,
  Printer,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sprout,
  ShieldAlert
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentRole,
    activeTab,
    setActiveTab,
    user,
    logout,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    slots,
    marketLots,
    transitTrips
  } = useApp();

  const activeQueueCount = slots.filter(s => s.status === 'in_queue' || s.status === 'at_weighbridge').length;
  const availableLotsCount = marketLots.filter(l => l.status === 'open_for_bidding').length;
  const activeTripsCount = transitTrips.filter(t => t.status === 'in_transit').length;

  const navConfigs: Record<string, Array<{ id: string; label: string; icon: React.ReactNode; badge?: string | number }>> = {
    farmer: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { id: 'book-slot', label: 'Book Slot', icon: <CalendarPlus className="w-5 h-5" /> },
      { id: 'qr-pass', label: 'My QR Pass', icon: <QrCode className="w-5 h-5" /> },
      { id: 'queue', label: 'Live Queue Status', icon: <Clock className="w-5 h-5" />, badge: 'Live' },
      { id: 'orders', label: 'Procurement & DBT', icon: <Receipt className="w-5 h-5" /> },
      { id: 'support', label: 'Kisan Sahayata', icon: <HelpCircle className="w-5 h-5" /> },
    ],
    buyer: [
      { id: 'dashboard', label: 'Center Command', icon: <LayoutDashboard className="w-5 h-5" /> },
      { id: 'checkin', label: 'QR Check-in Desk', icon: <ScanLine className="w-5 h-5" /> },
      { id: 'roster', label: 'Daily Roster', icon: <Users className="w-5 h-5" />, badge: activeQueueCount },
      { id: 'grading', label: 'Quality & Weighing', icon: <Scale className="w-5 h-5" /> },
      { id: 'capacity', label: 'Center Capacity', icon: <Warehouse className="w-5 h-5" /> },
      { id: 'support', label: 'Helpdesk & Support', icon: <HelpCircle className="w-5 h-5" /> },
    ],
    transporter: [
      { id: 'dashboard', label: 'Driver Cockpit', icon: <LayoutDashboard className="w-5 h-5" /> },
      { id: 'loads', label: 'Active Dispatches', icon: <Truck className="w-5 h-5" />, badge: transitTrips.length },
      { id: 'trips', label: 'Trip Tracker & Route', icon: <MapPin className="w-5 h-5" />, badge: activeTripsCount > 0 ? 'Active' : undefined },
      { id: 'challans', label: 'Digital Challans', icon: <FileCheck className="w-5 h-5" /> },
      { id: 'support', label: 'Support & Helpline', icon: <HelpCircle className="w-5 h-5" /> },
    ],
    local_buyer: [
      { id: 'dashboard', label: 'Open Market Board', icon: <TrendingUp className="w-5 h-5" />, badge: availableLotsCount },
      { id: 'reports', label: 'Quality Reports', icon: <FileText className="w-5 h-5" /> },
      { id: 'bids', label: 'Bids & Offers', icon: <ShoppingBag className="w-5 h-5" /> },
      { id: 'invoices', label: 'Purchase Invoices', icon: <Receipt className="w-5 h-5" /> },
      { id: 'support', label: 'Buyer Support', icon: <HelpCircle className="w-5 h-5" /> },
    ],
    kiosk: [
      { id: 'dashboard', label: 'CSC Kiosk Desk', icon: <LayoutDashboard className="w-5 h-5" /> },
      { id: 'book-slot', label: 'Assisted Slot Booking', icon: <CalendarPlus className="w-5 h-5" /> },
      { id: 'print-pass', label: 'Print Paper QR Slip', icon: <Printer className="w-5 h-5" /> },
      { id: 'ivr-simulator', label: 'IVR Voice Simulator', icon: <PhoneCall className="w-5 h-5" />, badge: 'Audio' },
      { id: 'support', label: 'Panchayat Support', icon: <HelpCircle className="w-5 h-5" /> },
    ]
  };

  const navItems = navConfigs[currentRole] || navConfigs.farmer;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-brand-dark text-white flex flex-col justify-between z-40 transition-all duration-300 shadow-xl ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Branding Section */}
      <div>
        <div className="flex items-center justify-between px-4 py-5 border-b border-emerald-900/60 bg-brand-darker">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <Sprout className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                  DoCA Mandi
                </h1>
                <p className="text-[10px] text-emerald-300/80 font-medium tracking-wider uppercase">
                  Govt. of India
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
          )}

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-emerald-200/70 hover:text-white hover:bg-emerald-800/40 transition-colors"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items (Exact reference video styling: rounded items with emerald highlight) */}
        <nav className="p-3 space-y-1.5 mt-2 custom-scrollbar overflow-y-auto max-h-[calc(100vh-230px)]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/40'
                    : 'text-emerald-100/80 hover:bg-emerald-800/40 hover:text-white'
                }`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                {/* Active Indicator Bar on left when collapsed */}
                {isActive && (
                  <span className="absolute left-1 top-2.5 bottom-2.5 w-1 bg-white rounded-full"></span>
                )}

                <span className={`shrink-0 transition-transform ${isActive ? 'text-white scale-105' : 'text-emerald-300 group-hover:text-white'}`}>
                  {item.icon}
                </span>

                {!isSidebarCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-left">
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white text-emerald-800'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Card & Role Info (Exact video styling at 00:09 & 00:27) */}
      <div className="p-3 border-t border-emerald-900/60 bg-brand-darker">
        {!isSidebarCollapsed ? (
          <div className="bg-emerald-950/50 border border-emerald-800/40 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-emerald-400/40 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-emerald-300/80 truncate">
                  {user.organization || user.location}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-emerald-400/80 hover:text-red-400 hover:bg-emerald-900/50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-emerald-400/40"
            />
            <button
              onClick={logout}
              className="p-1.5 text-emerald-400/80 hover:text-red-400 rounded-lg"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
