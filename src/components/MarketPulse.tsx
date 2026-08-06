import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Search,
  MapPin,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import { getMarketPulse } from "@/src/services/geminiService";
import { cn, formatCurrency } from "@/src/lib/utils";
import { toast } from "sonner";

import { useLanguage } from '../contexts/LanguageContext';

export default function MarketPulse({ selectedState, setSelectedState }: { selectedState: string, setSelectedState: (s: string) => void }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState<any>(null);

  const fetchPulse = async () => {
    setLoading(true);
    try {
      const data = await getMarketPulse(selectedState);
      setPulse(data);
    } catch (error) {
      console.error(error);
      toast.error(t.market.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPulse();
  }, [selectedState]);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-1">{t.market.intelligence}</p>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t.market.title}</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-1.5">
            <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
            {t.market.lastUpdated}: {new Date().toLocaleDateString('en-IN')}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-gray-700">{selectedState} {t.market.intelActive}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market Insights Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">{t.market.report}</h3>
              </div>
              {pulse && (
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  pulse.marketSentiment === 'Bullish' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>
                  {t.market.sentiment}: {pulse.marketSentiment}
                </div>
              )}
            </div>

            {loading ? (
              <div className="space-y-6 py-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center animate-pulse">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl" />
                      <div className="space-y-2">
                        <div className="w-24 h-4 bg-gray-50 rounded shadow-inner" />
                        <div className="w-16 h-3 bg-gray-50 rounded" />
                      </div>
                    </div>
                    <div className="w-20 h-8 bg-gray-50 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-4">
                  {pulse?.topChangingCrops?.map((crop: any, i: number) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-emerald-200 transition-all hover:bg-white hover:shadow-md cursor-default"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg",
                          crop.trend === 'up' ? "bg-emerald-100 text-emerald-600" : crop.trend === 'down' ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-600"
                        )}>
                          {crop.crop[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{crop.crop}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t.market.ratePerQuintal}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-black text-gray-900 tracking-tight">
                            {formatCurrency(2400 + (crop.change * 10))}
                          </p>
                          <div className={cn(
                            "flex items-center gap-1 text-[10px] font-bold",
                            crop.trend === 'up' ? "text-emerald-500" : crop.trend === 'down' ? "text-rose-500" : "text-gray-400"
                          )}>
                            {crop.trend === 'up' ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : crop.trend === 'down' ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : (
                              <Minus className="w-3 h-3" />
                            )}
                            {Math.abs(crop.change)}%
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              onClick={fetchPulse}
              className="w-full mt-8 py-3 border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} /> {t.market.updateFeed}
            </button>
          </div>
        </div>

        {/* Advisor Column */}
        <div className="space-y-6">
          <div className="bg-emerald-950 rounded-3xl p-8 text-white h-full relative overflow-hidden group">
            <div className="relative z-10 space-y-8">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-emerald-950" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-4">{t.market.advisorPulse}</h3>
                <p className="text-emerald-300 text-sm leading-relaxed italic font-serif opacity-90">
                  {loading ? t.market.distilling : pulse?.advisorTip || t.market.distilling}
                </p>
              </div>

              <div className="pt-8 grid grid-cols-2 gap-4">
                <div className="bg-emerald-900/50 p-4 rounded-2xl border border-emerald-800/50">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">{t.market.volatility}</p>
                  <p className="text-lg font-bold">Low</p>
                </div>
                <div className="bg-emerald-900/50 p-4 rounded-2xl border border-emerald-800/50">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">{t.market.stability}</p>
                  <p className="text-lg font-bold">92%</p>
                </div>
              </div>
            </div>

            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-1000" />
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-emerald-300/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
