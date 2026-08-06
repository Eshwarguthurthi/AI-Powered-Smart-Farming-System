import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  GraduationCap, 
  Award, 
  FileText
} from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';

export default function About() {
  const { t } = useLanguage();
  return (
    <div className="space-y-8 pb-20">
      <div>
        <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-1">{t.about.academicContext}</p>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t.about.title}</h2>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Project Team */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900">{t.about.teamTitle}</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold text-gray-900">K. Sonali Phani Sai</p>
                <p className="text-xs text-gray-500 font-mono">28 / 23B91A1275</p>
              </div>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold text-gray-900">K. Satya Sai Naga V D L Sujitha</p>
                <p className="text-xs text-gray-500 font-mono">28 / 23B91A1274</p>
              </div>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold text-gray-900">K. Tejaswini</p>
                <p className="text-xs text-gray-500 font-mono">28 /23B91A1284</p>
              </div>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold text-gray-900">P. Jasmitha</p>
                <p className="text-xs text-gray-500 font-mono">28 / 23B91A12C7</p>
              </div>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold text-gray-900">P. Sreehitha</p>
                <p className="text-xs text-gray-500 font-mono">28 / 23B91A12D6</p>
              </div>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          <div className="pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.about.supervisedBy}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Smt.V.R.B.Rohini</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithms Summary */}
      <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" /> {t.about.techArch}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TechItem 
            title={t.common.planning} 
            tech="Random Forest / SVM" 
            desc={t.about.cropDesc}
          />
          <TechItem 
            title={t.about.incomePred} 
            tech="Linear Regression" 
            desc={t.about.incomeDesc}
          />
          <TechItem 
            title={t.diagnostics.title} 
            tech="CNN (ResNet-50)" 
            desc={t.about.diseaseDesc}
          />
        </div>
      </div>
    </div>
  );
}

function TechItem({ title, tech, desc }: any) {
  return (
    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors">
      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">{tech}</p>
      <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-xs text-gray-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
