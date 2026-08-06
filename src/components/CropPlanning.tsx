import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sprout, 
  Droplets, 
  FlaskConical, 
  Calendar, 
  Coins, 
  Loader2,
  CheckCircle2,
  Info,
  Sun,
  Thermometer,
  ShieldAlert,
  TrendingUp,
  Activity
} from "lucide-react";
import { getCropRecommendation } from "@/src/services/geminiService";
import { cn, formatCurrency } from "@/src/lib/utils";
import { toast } from "sonner";

import { useLanguage } from '../contexts/LanguageContext';

export default function CropPlanning({ selectedState }: { selectedState: string }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [formData, setFormData] = useState({
    n: 40,
    p: 35,
    k: 30,
    ph: 6.5,
    season: "Winter",
    region: selectedState,
    acres: 1
  });

  // Keep form data region in sync with global selection
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, region: selectedState }));
  }, [selectedState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await getCropRecommendation(formData);
      setRecommendations(result);
      setSelectedIndex(0);
      toast.success("AI Recommendations Generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate recommendations. The AI service may be temporarily down.");
    } finally {
      setLoading(false);
    }
  };

  const currentRec = recommendations[selectedIndex];

  return (
    <div className="space-y-8 pb-20">
      <div>
        <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-1">{t.planning.planningTool}</p>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t.planning.title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-8">
          <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-8">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900">{t.dashboard.soilHealth}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <NutrientInput 
                label={t.planning.soilN} 
                value={formData.n} 
                onChange={(val) => setFormData({...formData, n: val})}
                color="emerald"
                max={140}
              />
              <NutrientInput 
                label={t.planning.soilP} 
                value={formData.p} 
                onChange={(val) => setFormData({...formData, p: val})}
                color="blue"
                max={140}
              />
              <NutrientInput 
                label={t.planning.soilK} 
                value={formData.k} 
                onChange={(val) => setFormData({...formData, k: val})}
                color="amber"
                max={140}
              />
              <NutrientInput 
                label={t.planning.soilPh} 
                value={formData.ph} 
                onChange={(val) => setFormData({...formData, ph: val})}
                color="purple"
                max={14}
                step={0.1}
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.common.season}</label>
              <select 
                value={formData.season}
                onChange={(e) => setFormData({...formData, season: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="Spring">{t.planning.seasons.spring}</option>
                <option value="Summer">{t.planning.seasons.summer}</option>
                <option value="Autumn">{t.planning.seasons.autumn}</option>
                <option value="Winter">{t.planning.seasons.winter}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.common.acres}</label>
              <input 
                type="number" 
                value={formData.acres}
                onChange={(e) => setFormData({...formData, acres: Number(e.target.value)})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white rounded-2xl py-4 font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> {t.common.loading}
                </>
              ) : (
                t.planning.optimizeBtn
              )}
            </button>
          </form>
        </div>

        {/* Results / Recommendation Area */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {recommendations.length === 0 && !loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="empty"
                className="h-full min-h-[500px] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <Sprout className="w-10 h-10 text-emerald-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t.planning.awaitingInput}</h3>
                <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                  {t.planning.awaitingInputDesc}
                </p>
              </motion.div>
            ) : loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="loading"
                className="h-full min-h-[500px] bg-white rounded-3xl border border-gray-200 p-12 flex flex-col items-center justify-center space-y-8"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border-4 border-emerald-100 rounded-full"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border-t-4 border-emerald-500 border-r-4 border-r-transparent rounded-full absolute top-0"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sprout className="w-10 h-10 text-emerald-500 animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 text-lg">{t.planning.aiProcessing}</h3>
                  <p className="text-gray-400 text-sm font-medium">{t.planning.aiProcessingDesc}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key="result"
                className="space-y-6"
              >
                {/* Crop Selector Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {recommendations.map((rec: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={cn(
                        "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                        selectedIndex === idx 
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20" 
                          : "bg-white text-gray-500 border-gray-200 hover:border-emerald-200"
                      )}
                    >
                      {rec.cropName}
                    </button>
                  ))}
                </div>

                {/* Result Hero */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-emerald-600 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-2">{t.planning.recommendation}</p>
                        <h3 className="text-5xl font-black tracking-tight">{currentRec.cropName}</h3>
                      </div>
                      <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center min-w-[120px]">
                        <p className="text-[10px] font-bold uppercase mb-1">{t.common.confidence}</p>
                        <div className="text-3xl font-black">{currentRec.confidence.toFixed(3)}%</div>
                      </div>
                    </div>
                    {/* Decorative pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                  </div>

                  <div className="p-8 grid grid-cols-3 gap-6 border-b border-gray-100">
                    <ResultStat 
                      label={t.planning.expectedYield} 
                      value={`${currentRec.expectedYield * formData.acres} kg`} 
                      icon={Droplets}
                      unit={t.planning.totalYield}
                    />
                    <ResultStat 
                      label={t.planning.estDuration} 
                      value={`${currentRec.estimatedDuration} Months`} 
                      icon={Calendar}
                      unit={t.planning.cropCycle}
                    />
                    <ResultStat 
                      label={t.planning.marketValue} 
                      value={currentRec.marketPotential || "High"}
                      icon={TrendingUp}
                      unit={t.planning.marketTrend}
                    />
                  </div>

                  <div className="p-8 space-y-8">
                    <div>
                      <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {t.planning.rationale}
                      </h4>
                      <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                        <p className="text-emerald-900 text-sm leading-relaxed font-medium">
                          {currentRec.rationale}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="flex items-center gap-2 font-black text-gray-900 mb-4 text-sm uppercase tracking-widest">
                        <Coins className="w-5 h-5 text-amber-500" /> {t.market.insights}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                          <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1">{t.common.investment}</p>
                          <div className="text-2xl font-black text-amber-950">
                            {formatCurrency(currentRec.estimatedInvestment * formData.acres)}
                          </div>
                          <p className="text-[10px] text-amber-700/60 font-medium italic mt-1">For {formData.acres} {t.common.acres}{formData.acres > 1 ? 's' : ''}</p>
                        </div>
                        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
                          <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1">{t.common.revenue}</p>
                          <div className="text-2xl font-black text-emerald-950">
                            {formatCurrency(currentRec.expectedRevenue * formData.acres)}
                          </div>
                          <p className="text-[10px] text-emerald-700/60 font-medium italic mt-1">{t.planning.grossRevenue}</p>
                        </div>
                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                          <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1">{t.common.profit}</p>
                          <div className="text-2xl font-black text-blue-950">
                            +{currentRec.profitPercentage}%
                          </div>
                          <p className="text-[10px] text-blue-700/60 font-medium italic mt-1">{t.planning.roiEstimate}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <RequirementCard 
                        icon={Droplets} 
                        label={t.planning.water} 
                        value={currentRec.requirements?.water} 
                        color="blue"
                      />
                      <RequirementCard 
                        icon={Sun} 
                        label={t.planning.sunlight} 
                        value={currentRec.requirements?.sunlight} 
                        color="amber"
                      />
                      <RequirementCard 
                        icon={Thermometer} 
                        label={t.planning.temp} 
                        value={currentRec.requirements?.temperature} 
                        color="orange"
                      />
                      <RequirementCard 
                        icon={FlaskConical} 
                        label={t.planning.fertilizer} 
                        value={currentRec.requirements?.fertilizer} 
                        color="emerald"
                      />
                    </div>

                    <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
                      <h4 className="flex items-center gap-2 font-bold text-rose-900 mb-2 text-sm uppercase tracking-wider">
                        <ShieldAlert className="w-4 h-4" /> {t.planning.pestRisks}
                      </h4>
                      <p className="text-rose-800 text-sm leading-relaxed font-medium">
                        {currentRec.pestRisk || "Low risk if standard protocols followed."}
                      </p>
                    </div>

                    {/* Growth Timeline */}
                    <div className="pt-4">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{t.planning.cultivationTimeline}</h4>
                      <div className="relative h-20 bg-gray-50 rounded-2xl border border-gray-100 p-4 overflow-hidden">
                        <div className="flex justify-between relative z-10">
                          <TimelineStep label={t.planning.sowing} icon={Sprout} active />
                          <TimelineStep label={t.planning.growth} icon={Activity} active />
                          <TimelineStep label={t.planning.maturity} icon={Sun} active />
                          <TimelineStep label={t.planning.harvest} icon={CheckCircle2} />
                        </div>
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 mx-12">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "75%" }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Regional Knowledge Base */}
      <div className="pt-12 border-t border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{t.planning.knowledgeBase}</h3>
            <p className="text-sm text-gray-500 font-medium">{t.planning.knowledgeBaseDesc} {selectedState}.</p>
          </div>
          <div className="p-3 bg-emerald-950 text-emerald-400 rounded-2xl shadow-xl">
            <Sprout className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KnowledgeCard 
            title={t.planning.stapleCrops} 
            crops={["Paddy", "Wheat", "Maize"]} 
            desc="Primary nutritional crops with high food security value and established procurement channels."
          />
          <KnowledgeCard 
            title={t.planning.cashCrops} 
            crops={["Sugarcane", "Cotton", "Tobacco"]} 
            desc="High commercial focus crops requiring specialized input management and industrial linkage."
          />
          <KnowledgeCard 
            title={t.planning.horticulture} 
            crops={["Mango", "Banana", "Citrus"]} 
            desc="Perennial investment crops with potential for high export value and processing opportunities."
          />
          <KnowledgeCard 
            title={t.planning.soilBoosters} 
            crops={["Moong", "Urad", "Mustard"]} 
            desc="Short-duration crops that naturally replenish soil nitrogen and require minimal irrigation."
          />
        </div>
      </div>
    </div>
  );
}

function TimelineStep({ label, icon: Icon, active }: any) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn(
        "p-2 rounded-xl border relative z-20 transition-all",
        active ? "bg-emerald-500 text-white border-emerald-400 shadow-md" : "bg-white text-gray-300 border-gray-100"
      )}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className={cn(
        "text-[10px] font-black uppercase tracking-widest",
        active ? "text-emerald-600" : "text-gray-300"
      )}>{label}</span>
    </div>
  );
}

function KnowledgeCard({ title, crops, desc }: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-md transition-all">
      <h4 className="font-bold text-gray-900 mb-2 flex items-center justify-between">
        {title}
        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">State Specific</span>
      </h4>
      <div className="flex flex-wrap gap-2 mb-4">
        {crops.map((crop: string) => (
          <span key={crop} className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
            {crop}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

function ResultStat({ label, value, icon: Icon, unit }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-center gap-2">
        <div className="p-1 bg-gray-50 rounded-lg">
          <Icon className="w-3 h-3 text-emerald-500" />
        </div>
        <span className="text-lg font-bold text-gray-900 truncate">{value}</span>
      </div>
      <p className="text-[10px] text-gray-400 font-medium italic">{unit}</p>
    </div>
  );
}

function NutrientInput({ label, value, onChange, color, max, step = 1 }: any) {
  const colorMap: any = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    purple: "bg-purple-500"
  };

  const percentage = (value / max) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
        <span className="text-xs font-bold text-gray-900">{value}</span>
      </div>
      <div className="relative group">
        <input 
          type="number" 
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-xl overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            className={cn("h-full transition-all", colorMap[color])}
          />
        </div>
      </div>
    </div>
  );
}

function RequirementCard({ icon: Icon, label, value, color }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100"
  };

  return (
    <div className={cn("p-4 rounded-2xl border flex gap-3 items-center", colorMap[color])}>
      <div className="p-2 bg-white rounded-xl shadow-sm">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
        <p className="text-xs font-bold truncate">{value || "Moderate"}</p>
      </div>
    </div>
  );
}
