import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Bell,
  MapPin,
  ChevronDown,
  Layers,
  ArrowRightLeft,
  ShieldCheck,
  User,
  LogOut,
  Smartphone
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    user,
    notifications,
    setShowNotificationDrawer,
    setShowLoginModal,
    activeCenterName,
    isLoggedIn,
    logout
  } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabels: Record<UserRole, { label: string; icon: string; switchNextText: string; nextRole: UserRole }> = {
    farmer: {
      label: 'Farmer Portal',
      icon: '🧑🌾',
      switchNextText: 'Switch to Buyer View',
      nextRole: 'buyer'
    },
    buyer: {
      label: 'Procurement Officer',
      icon: '🏢',
      switchNextText: 'Switch to Transit Driver View',
      nextRole: 'transporter'
    },
    transporter: {
      label: 'Transit Partner',
      icon: '🚛',
      switchNextText: 'Switch to Local Buyer View',
      nextRole: 'local_buyer'
    },
    local_buyer: {
      label: 'Local Market Buyer',
      icon: '🏪',
      switchNextText: 'Switch to Assisted Kiosk View',
      nextRole: 'kiosk'
    },
    kiosk: {
      label: 'CSC / Panchayat Kiosk',
      icon: '🏛️',
      switchNextText: 'Switch to Farmer View',
      nextRole: 'farmer'
    }
  };

  const handleQuickCycleRole = () => {
    const next = roleLabels[currentRole].nextRole;
    setCurrentRole(next);
  };

  return (
    <header className="sticky top-0 z-30 bg-surface-card border-b border-surface-border px-4 lg:px-8 py-3 transition-all duration-200 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Location & Active Procurement Hub */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-full text-xs font-medium shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold tracking-tight">{activeCenterName}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium">DoCA Smart Mandi Live</span>
          </div>
        </div>

        {/* Right: Actions, Demo Switcher, Notifications, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* VIDEO STYLE: Quick "Switch View" Pill Button */}
          <button
            onClick={handleQuickCycleRole}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-full transition-all shadow-sm active:scale-95 group"
            title="Instantly toggle role view for presentation video"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-180 transition-transform duration-300" />
            <span className="hidden sm:inline">{roleLabels[currentRole].switchNextText}</span>
            <span className="sm:hidden">Switch Role</span>
          </button>

          {/* Role Dropdown Selector for direct switching */}
          <div className="relative group">
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="appearance-none bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-700 text-xs font-medium py-1.5 pl-2.5 pr-7 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="farmer">🧑🌾 Farmer View</option>
              <option value="buyer">🏢 Procurement Officer (Buyer)</option>
              <option value="transporter">🚛 Transporter (Driver)</option>
              <option value="local_buyer">🏪 Local Buyer (Market)</option>
              <option value="kiosk">🏛️ CSC Kiosk (Assisted)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => setShowNotificationDrawer(true)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="View SMS & System Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Pill & Login State */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-emerald-600 shadow-xs"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                  <span>{user.name}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal">
                    {roleLabels[currentRole].label}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                  {user.phone || user.email}
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout / Open Login Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-xs font-semibold bg-brand-primary hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
