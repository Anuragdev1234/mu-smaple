import React from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { UnifiedLoginModal } from './components/auth/UnifiedLoginModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';

// We will import full-fledged dashboard components as we progress
import { FarmerView } from './components/farmer/FarmerView';
import { BuyerView } from './components/buyer/BuyerView';
import { TransporterView } from './components/transporter/TransporterView';
import { LocalBuyerView } from './components/localBuyer/LocalBuyerView';
import { KioskView } from './components/kiosk/KioskView';

export const App: React.FC = () => {
  const { currentRole, isSidebarCollapsed } = useApp();

  const renderActiveDashboard = () => {
    switch (currentRole) {
      case 'farmer':
        return <FarmerView />;
      case 'buyer':
        return <BuyerView />;
      case 'transporter':
        return <TransporterView />;
      case 'local_buyer':
        return <LocalBuyerView />;
      case 'kiosk':
        return <KioskView />;
      default:
        return <FarmerView />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col font-sans">
      {/* Sidebar (Fixed left, responsive) */}
      <Sidebar />

      {/* Main Container offset by sidebar width */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Top Header with Quick Demo Switcher & Notifications */}
        <Header />

        {/* Dynamic Role Dashboard Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveDashboard()}
        </main>
      </div>

      {/* Global Overlays */}
      <UnifiedLoginModal />
      <NotificationDrawer />
    </div>
  );
};

export default App;
