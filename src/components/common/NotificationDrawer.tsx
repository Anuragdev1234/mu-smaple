import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  X,
  MessageSquare,
  CreditCard,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Trash2,
  Volume2,
  Sparkles,
  Send
} from 'lucide-react';
import { playGateChime, playSuccessTone } from '../../utils/audio';

export const NotificationDrawer: React.FC = () => {
  const {
    showNotificationDrawer,
    setShowNotificationDrawer,
    notifications,
    markNotificationRead,
    addNotification,
    currentRole
  } = useApp();

  if (!showNotificationDrawer) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'sms':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'call':
        return <Radio className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    }
  };

  // Demo Trigger helpers for video recording
  const handleTriggerGateCallSms = () => {
    playGateChime();
    addNotification({
      title: 'Token #108 Called at Gate 2',
      message: 'Farmer Ramesh Patel: Your tractor UP 32 EA 9821 is called to Gate 2 Weighbridge. Please proceed immediately.',
      type: 'call',
      roleTarget: 'all'
    });
  };

  const handleTriggerDbtCreditSms = () => {
    playSuccessTone();
    addNotification({
      title: 'PFMS DBT Payment Credited ₹1,48,800',
      message: 'Direct Benefit Transfer for 64.13 Quintals produce successfully credited to your Bank of Baroda A/c ••5598 via Aadhaar Payment Bridge.',
      type: 'payment',
      roleTarget: 'farmer'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setShowNotificationDrawer(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-brand-dark text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm">Real-Time SMS & Alerts Hub</h3>
                <p className="text-[11px] text-emerald-300">Live DoCA Automated Dispatcher</p>
              </div>
            </div>

            <button
              onClick={() => setShowNotificationDrawer(false)}
              className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-banner: SMS simulation explanation */}
          <div className="p-3 bg-emerald-50 border-b border-emerald-100 text-xs text-emerald-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>📱</span>
              <span>Dispatched to farmer's phone via CDAC/NIC gateway.</span>
            </span>
          </div>

          {/* Quick Demo Simulator Buttons (Part 20) */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Test Triggers for Video Demo
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleTriggerGateCallSms}
                className="flex-1 py-1.5 px-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-[11px] font-bold text-slate-800 flex items-center justify-center gap-1 active:scale-95 shadow-2xs"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulate Gate 2 Call</span>
              </button>
              <button
                onClick={handleTriggerDbtCreditSms}
                className="flex-1 py-1.5 px-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-[11px] font-bold text-slate-800 flex items-center justify-center gap-1 active:scale-95 shadow-2xs"
              >
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>Simulate DBT Credit</span>
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No notifications right now.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markNotificationRead(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    item.read
                      ? 'bg-white border-slate-200'
                      : 'bg-emerald-50/50 border-emerald-300/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white border border-slate-100 shadow-xs shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-mono text-[11px] bg-white/70 p-2.5 rounded-lg border border-slate-100">
                        {item.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-700 font-semibold uppercase tracking-wider">
                          Target: {item.roleTarget}
                        </span>
                        {!item.read && (
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
