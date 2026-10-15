import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CropPlanning from './components/CropPlanning';
import Diagnostics from './components/Diagnostics';
import MarketPulse from './components/MarketPulse';
import About from './components/About';
import { Toaster } from 'sonner';
import { Menu, Tractor } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { cn } from './lib/utils';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} selectedState={selectedState} />;
      case 'planning':
        return <CropPlanning selectedState={selectedState} setSelectedState={setSelectedState} />;
      case 'diagnostics':
        return <Diagnostics />;
      case 'market':
        return <MarketPulse selectedState={selectedState} setSelectedState={setSelectedState} />;
      case 'about':
        return <About />;
      default:
        return <Dashboard setActiveTab={setActiveTab} selectedState={selectedState} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <main className="lg:ml-64 flex-1 flex flex-col min-h-screen min-w-0">
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-emerald-950 text-white">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-emerald-900"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Tractor className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-black uppercase tracking-widest">{t.common.precisionAgri}</span>
          <span className="ml-auto text-[10px] font-bold text-emerald-300 truncate">{selectedState}</span>
        </div>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto" data-page-container>
            <AnimatePresence mode="wait">
              <motion.div
                // Pages refetch on state change themselves; keying on the state too would remount
                // Crop Planning and wipe the farmer's location and soil inputs.
                key={activeTab}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Toaster richColors position="top-right" closeButton />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
