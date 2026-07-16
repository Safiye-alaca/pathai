import React from "react";

interface GrowthTactics {
  acquisition_channel: string;
  activation_tactic: string;
  viral_loop: string;
}

interface GrowthTabProps {
  report: {
    growth_strategy_title: string;
    funnel_tactics: GrowthTactics;
    recommended_tools: string[];
  };
}

export default function GrowthTab({ report }: GrowthTabProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-orange-100 animate-fade-in">
      <h3 className="font-black text-orange-950 text-sm border-l-4 border-orange-500 pl-2">
        📈 Growth Hacking & Organik Büyüme Stratejisi
      </h3>
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-100 p-4 rounded-2xl shadow-sm">
          <span className="text-[9px] font-extrabold uppercase text-orange-700 tracking-wider">
            Tavsiye Edilen Büyüme Stratejisi
          </span>
          <h4 className="text-md font-black text-orange-950 mt-0.5">
            {report.growth_strategy_title}
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1 shadow-sm">
            <span className="text-[10px] text-orange-700 font-extrabold uppercase block">
              📣 1. Kullanıcı Edinme (Acquisition)
            </span>
            <p className="text-slate-600 font-medium leading-relaxed">
              {report.funnel_tactics.acquisition_channel}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1 shadow-sm">
            <span className="text-[10px] text-orange-700 font-extrabold uppercase block">
              ⚡ 2. Aktivasyon (Aha Moment)
            </span>
            <p className="text-slate-600 font-medium leading-relaxed">
              {report.funnel_tactics.activation_tactic}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1 shadow-sm">
            <span className="text-[10px] text-orange-700 font-extrabold uppercase block">
              🔄 3. Viral Çark (Referral Loop)
            </span>
            <p className="text-slate-600 font-medium leading-relaxed">
              {report.funnel_tactics.viral_loop}
            </p>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl text-slate-100 space-y-3 shadow-md">
          <h4 className="font-extrabold text-[10px] text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
            <span>🛠️</span> Pazarlama Otomasyonu & Analitik Stack Önerisi
          </h4>
          <div className="flex flex-wrap gap-2">
            {report.recommended_tools.map((tool, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl font-bold text-xs text-orange-300"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}