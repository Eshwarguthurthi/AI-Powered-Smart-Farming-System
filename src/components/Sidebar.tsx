import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Sprout, 
  Stethoscope, 
  BarChart3, 
  Tractor,
  MapPin,
  Info,
  ChevronDown,
  Languages
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useState } from "react";

import { useLanguage } from "../contexts/LanguageContext";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
}

const indianStates = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
].sort();

export default function Sidebar({ activeTab, setActiveTab, selectedState, setSelectedState }: SidebarProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const languages = [
    { id: 'en', name: 'English' },
    { id: 'hi', name: 'हिंदी' },
    { id: 'te', name: 'తెలుగు' },
  ];

  const navItems = [
    { id: "dashboard", label: t.common.dashboard, icon: LayoutDashboard },
    { id: "planning", label: t.common.planning, icon: Sprout },
    { id: "diagnostics", label: t.common.diagnostics, icon: Stethoscope },
    { id: "market", label: t.common.market, icon: BarChart3 },
    { id: "about", label: t.common.about, icon: Info },
  ];

  return (
    <div className="w-64 h-screen bg-emerald-950 text-emerald-50 flex flex-col fixed left-0 top-0 border-r border-emerald-800/50 transition-all z-50 overflow-hidden">
      <div className="p-5 flex items-center gap-3 border-b border-emerald-800/30">
        <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
          <Tractor className="w-5 h-5 text-emerald-950" />
        </div>
        <div>
          <h1 className="font-black text-[9px] tracking-[0.2em] leading-none text-emerald-400 uppercase">{t.common.aiPowered}</h1>
          <p className="text-xs text-white mt-1 uppercase tracking-tighter font-black font-mono">{t.common.precisionAgri}</p>
        </div>
      </div>

      <div className="px-6 py-3.5 border-b border-emerald-800/20 bg-emerald-900/10">
        <label className="text-[8px] font-black text-emerald-500/40 uppercase tracking-[0.2em] block mb-2 font-mono">{t.common.regionalContext}</label>
        <div className="relative group/select">
          <select 
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-emerald-900/40 border border-emerald-700/50 text-emerald-50 text-[11px] font-black px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer hover:bg-emerald-800/40 transition-all shadow-inner uppercase tracking-wider"
          >
            {indianStates.map(state => (
              <option key={state} value={state} className="bg-emerald-950">{state}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500/50">
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 px-1">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-emerald-400/70 uppercase tracking-widest">{t.common.localized}</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group text-[10px] font-black uppercase tracking-widest",
              activeTab === item.id 
                ? "bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/20 translate-x-1" 
                : "text-emerald-400/60 hover:bg-emerald-900/40 hover:text-emerald-100"
            )}
          >
            <item.icon className={cn(
              "w-4 h-4",
              activeTab === item.id ? "text-emerald-950" : "text-emerald-500/50 group-hover:text-emerald-400"
            )} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-4 pb-4">
        {/* Language Selector */}
        <div className="relative mb-2">
          <button 
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-900/30 border border-emerald-800/50 hover:border-emerald-500/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Languages className="w-4 h-4 text-emerald-500/50 group-hover:text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">
                {languages.find(l => l.id === language)?.name}
              </span>
            </div>
            <ChevronDown className={cn("w-3 h-3 text-emerald-500/50 transition-transform", isLangMenuOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {isLangMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full left-0 w-full mb-2 bg-emerald-900 border border-emerald-800 rounded-2xl shadow-2xl overflow-hidden z-20"
              >
                <div className="px-4 py-2 border-b border-emerald-800/50">
                  <p className="text-[8px] font-black text-emerald-500/40 uppercase tracking-[0.2em]">{t.common.selectLanguage}</p>
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setLanguage(lang.id as any);
                      setIsLangMenuOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between",
                      language === lang.id 
                        ? "text-emerald-950 bg-emerald-500" 
                        : "text-emerald-400 hover:bg-emerald-800/60 hover:text-emerald-100"
                    )}
                  >
                    {lang.name}
                    {language === lang.id && <div className="w-1 h-1 rounded-full bg-emerald-950" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
