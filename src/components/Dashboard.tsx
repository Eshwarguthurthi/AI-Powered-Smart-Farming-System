import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  Droplets, 
  AlertCircle, 
  MapPin, 
  CloudSun,
  Sprout,
  Loader2,
  Wind,
  Thermometer,
  CloudRain,
  Sun
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { formatCurrency, cn } from "@/src/lib/utils";
import { getDashboardStats } from "@/src/services/geminiService";
import { toast } from "sonner";

import { useLanguage } from '../contexts/LanguageContext';

export default function Dashboard({ setActiveTab, selectedState }: { setActiveTab: (tab: string) => void, selectedState: string }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setStats(null);
      try {
        const result = await getDashboardStats(selectedState);
        setStats(result);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load regional intelligence.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedState]);

  const yieldData = stats?.yieldProjections || [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 600 },
    { name: 'Thu', value: 800 },
    { name: 'Fri', value: 500 },
    { name: 'Sat', value: 900 },
    { name: 'Sun', value: 700 },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t.dashboard.welcome}</h2>
          <p className="text-gray-500 font-medium mt-1">{t.dashboard.subtitle} {selectedState}.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            {t.dashboard.liveUpdate}
          </div>
          <div className="h-6 w-px bg-gray-100 mx-1" />
          <p className="text-xs font-bold text-gray-400 px-2 uppercase tracking-tighter">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short' })}
          </p>
        </div>
      </div>

      {/* Weather & Core Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Weather Intelligence Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-all cursor-pointer">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.dashboard.weatherTitle}</p>
              <h4 className="text-xl font-bold text-gray-900">
                {loading ? "..." : (stats?.weatherCondition || "Partly Cloudy")}
              </h4>
            </div>
            <div className={cn(
              "p-3 rounded-2xl group-hover:rotate-12 transition-transform",
              stats?.weatherCondition?.toLowerCase().includes('rain') ? "bg-blue-50 text-blue-500" : "bg-amber-50 text-amber-500"
            )}>
              {stats?.weatherCondition?.toLowerCase().includes('rain') ? <CloudRain className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-gray-400">
                <AlertCircle className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">{t.dashboard.temp}</span>
              </div>
              <p className="text-lg font-black text-gray-900">
                {loading ? "--" : (stats?.temperature || "32")}°C
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Wind className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{t.dashboard.windSpeed}</span>
              </div>
              <p className="text-lg font-black text-gray-900">
                {loading ? "--" : (stats?.windSpeed || "12")}km/h
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-gray-500">
                {loading ? "..." : (stats?.rainChance || "15")}% {t.dashboard.rainChance}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Stats */}
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-white rounded-3xl border border-gray-100 animate-pulse" />
          ))
        ) : stats ? (
          <>
            <StatCard 
              label={t.dashboard.soilHealth} 
              value={stats.soilHealthStatus} 
              percentage={stats.soilHealthPercentage} 
              icon={Sprout} 
              color="emerald"
            />
            <StatCard 
              label={t.dashboard.moisture} 
              value={stats.moistureLevel} 
              percentage={stats.moisturePercentage} 
              icon={Droplets} 
              color="blue"
            />
            <StatCard 
              label={t.common.market} 
              value={stats.seasonalTrend} 
              percentage={stats.marketMomentumPercentage} 
              icon={TrendingUp} 
              color="amber"
              isTrend
            />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">{t.dashboard.yieldProjections}</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{t.dashboard.yieldDesc}</p>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-100 uppercase tracking-widest">
              {t.dashboard.confidenceIndex}: 92%
            </div>
          </div>
          <div className="h-[320px] w-full relative z-10">
            <ResponsiveContainer key={selectedState} width="100%" height="100%">
              <AreaChart data={yieldData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area type="monotone" dataKey="value" stroke="#059669" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-50" />
        </div>

        {/* Quick Actions & Threat Level */}
        <div className="space-y-6">
          <div className="bg-emerald-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                <Sprout className="w-6 h-6 text-emerald-950" />
              </div>
              <h3 className="text-2xl font-black mb-3 leading-tight tracking-tight">{t.dashboard.optimizationTitle}</h3>
              <p className="text-emerald-300/80 text-sm mb-8 leading-relaxed font-medium">
                {t.dashboard.optimizationDesc}
              </p>
              <button 
                onClick={() => setActiveTab('planning')}
                className="w-full py-4 bg-white text-emerald-950 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all active:scale-95"
              >
                {t.dashboard.launchOptimizer}
              </button>
            </div>
            {/* Background Decoration */}
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700" />
          </div>

          <div className={cn(
            "rounded-[2.5rem] p-6 border flex flex-col justify-between h-[180px]",
            stats?.pathogenThreat === 'High' ? "bg-rose-50 border-rose-100" : "bg-blue-50 border-blue-100"
          )}>
            <div>
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.dashboard.activeAlerts}</p>
                <div className={cn(
                  "p-2 rounded-xl",
                  stats?.pathogenThreat === 'High' ? "bg-rose-200 text-rose-600" : "bg-blue-200 text-blue-600"
                )}>
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-lg font-black text-gray-900 mt-2">
                {stats?.pathogenThreat === 'High' ? t.diagnostics.title : t.dashboard.stableConditions}
              </h4>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {stats?.pathogenThreat === 'High' ? t.dashboard.pathogenDetected : t.dashboard.noThreats}
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('diagnostics')}
              className="text-xs font-black text-emerald-600 flex items-center gap-1 transition-all"
            >
              {t.dashboard.runDiagnostic}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  percentage, 
  icon: Icon, 
  color, 
  isTrend
}: { 
  label: string; 
  value: string; 
  percentage: number; 
  icon: any; 
  color: 'emerald' | 'blue' | 'amber' | 'rose';
  isTrend?: boolean;
}) {
  const { t } = useLanguage();
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  const progressColors = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm group hover:border-emerald-200 transition-all cursor-pointer relative overflow-hidden h-48 flex flex-col justify-between">
      <div className="flex justify-between items-start relative z-10">
        <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300 border", colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">{t.dashboard.realtime}</span>
        </div>
      </div>
      
      <div className="relative z-10 mt-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <h4 className={cn("text-2xl font-black tracking-tighter text-gray-900 truncate", isTrend && "text-amber-600")}>
          {value}
        </h4>
      </div>

      <div className="mt-4 relative z-10">
        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 mb-2">
          <span className="uppercase tracking-widest">{t.common.confidence}</span>
          <span>{percentage.toFixed(3)}%</span>
        </div>
        <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className={cn("h-full rounded-full", progressColors[color])} 
          />
        </div>
      </div>

      {/* Subtle Background Accent */}
      <div className={cn("absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700", progressColors[color])} />
    </div>
  );
}
