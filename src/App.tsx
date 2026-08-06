import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CropPlanning from './components/CropPlanning';
import Diagnostics from './components/Diagnostics';
import MarketPulse from './components/MarketPulse';
import About from './components/About';
import { Toaster } from 'sonner';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { cn } from './lib/utils';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const { t } = useLanguage();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} selectedState={selectedState} />;
      case 'planning':
        return <CropPlanning selectedState={selectedState} />;
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
      />
      
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + selectedState}
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
