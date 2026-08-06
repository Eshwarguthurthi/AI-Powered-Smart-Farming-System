import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  Upload, 
  Stethoscope, 
  Search,
  Loader2,
  XCircle,
  Activity,
  ShieldAlert,
  FlaskConical,
  Sprout,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { analyzePlantDisease } from "@/src/services/geminiService";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";

import { useLanguage } from '../contexts/LanguageContext';

export default function Diagnostics() {
  const { t } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const diagnosis = await analyzePlantDisease(image);
      setResult(diagnosis);
      toast.success("Disease Analysis Complete");
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed. The AI service may be temporarily down or the image is unclear.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-1">{t.diagnostics.subtitle}</p>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t.diagnostics.title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Image Input Area */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 pb-6 border-b border-gray-100 mb-8">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900">{t.diagnostics.uploadTitle}</h3>
            </div>

            <div 
              className={cn(
                "relative group overflow-hidden rounded-2xl border-2 border-dashed transition-all cursor-pointer aspect-square flex items-center justify-center",
                image ? "border-emerald-500" : "border-gray-200 hover:border-emerald-400"
              )}
              onClick={() => !image && fileInputRef.current?.click()}
            >
              {image ? (
                <>
                  <img src={image} alt="Upload" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="p-3 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setImage(null); setResult(null); }}
                      className="p-3 bg-white rounded-full text-rose-600 hover:scale-110 transition-transform"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300 group-hover:text-emerald-400 transition-colors">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{t.diagnostics.uploadTitle}</p>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">{t.diagnostics.uploadDesc}</p>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            <button 
              disabled={!image || loading}
              onClick={handleAnalyze}
              className="w-full mt-6 bg-emerald-900 text-white rounded-2xl py-4 font-bold text-sm hover:bg-emerald-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> {t.common.loading}
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" /> {t.diagnostics.analyzeBtn}
                </>
              )}
            </button>
          </div>
          
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex gap-4 items-start">
            <Activity className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-emerald-900 text-sm mb-1">{t.diagnostics.proTip}</h4>
              <p className="text-emerald-700 text-xs leading-relaxed">
                {t.diagnostics.proTipDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Diagnostics Results area */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!result && !loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="empty"
                className="h-full min-h-[500px] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <Stethoscope className="w-10 h-10 text-emerald-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t.diagnostics.noDiagnosis}</h3>
                <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                  {t.diagnostics.noDiagnosisDesc}
                </p>
              </motion.div>
            ) : loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="loading"
                className="h-full min-h-[500px] bg-white rounded-3xl border border-gray-200 p-12 flex flex-col items-center justify-center space-y-12"
              >
                <div className="w-full max-w-md space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{t.diagnostics.scanning}</span>
                    <span className="text-xs font-mono text-gray-400">BATCH ID: 593-AI</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      key="progress"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-gray-50 rounded-lg animate-pulse" />
                    <div className="h-10 bg-gray-50 rounded-lg animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 text-lg">{t.diagnostics.neuralAnalysis}</h3>
                  <p className="text-gray-400 text-sm">{t.common.loading}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key="result"
                className="space-y-6"
              >
                {/* Result Header */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-8">
                  <div className="flex flex-col gap-12 mb-8">
                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
                            result.isPlantLeaf === false ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          )}>
                            {result.isPlantLeaf === false ? t.diagnostics.invalidSample : t.diagnostics.pathogenAnalysis}
                          </div>
                          {result.isPlantLeaf !== false && (
                            <div className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
                              result.confidence > 70 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                              {result.confidence.toFixed(3)}% {t.common.confidence}
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                          {result.isPlantLeaf === false ? t.diagnostics.invalidSample : result.disease}
                        </h3>
                        
                        {result.plantSpecies && result.isPlantLeaf !== false && (
                          <div className="flex items-center gap-2 mt-3 text-emerald-700 font-bold text-sm bg-emerald-50 w-fit px-3 py-1 rounded-lg border border-emerald-100">
                            <Sprout className="w-4 h-4" />
                            SPECIES: {result.plantSpecies.toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2 font-black text-gray-400 text-[10px] uppercase tracking-[0.2em]">
                            <Activity className="w-4 h-4" /> {t.diagnostics.symptoms}
                          </h4>
                          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-3">
                            {result.symptoms?.map((s: string, i: number) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-1.5" />
                                <p className="text-sm text-gray-700 font-medium leading-relaxed">{s}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2 font-black text-gray-400 text-[10px] uppercase tracking-[0.2em]">
                            <FlaskConical className="w-4 h-4" /> {t.diagnostics.treatment}
                          </h4>
                          <div className="bg-emerald-900 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden group">
                            <p className="text-sm font-medium leading-relaxed relative z-10 opacity-90 italic">
                              "{result.treatment}"
                            </p>
                            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                          </div>
                        </div>
                      </div>

                      {/* New Prevention & Recovery Sections */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2 font-black text-gray-400 text-[10px] uppercase tracking-[0.2em]">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" /> {t.diagnostics.prevention}
                          </h4>
                          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
                            <p className="text-sm text-emerald-900 font-medium leading-relaxed">
                              {result.prevention}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2 font-black text-gray-400 text-[10px] uppercase tracking-[0.2em]">
                            <RefreshCw className="w-4 h-4 text-blue-500" /> {t.diagnostics.recovery}
                          </h4>
                          <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 space-y-3">
                            {result.recoverySteps?.map((step: string, i: number) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-[10px] font-black text-blue-600">{i + 1}</span>
                                </div>
                                <p className="text-sm text-blue-900 font-medium">{step}</p>
                              </div>
                            ))}
                          </div>
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
    </div>
  );
}
