import React from "react";

interface CompetitorInfo {
  name: string;
  weakness: string;
  our_advantage: string;
}

interface CompetitorTabProps {
  report: {
    competitors: CompetitorInfo[];
    positioning_strategy: string;
  };
}

export default function CompetitorTab({ report }: CompetitorTabProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-cyan-100 animate-fade-in">
      <h3 className="font-black text-cyan-950 text-sm border-l-4 border-cyan-500 pl-2">
        📊 Sektörel Rekabet Analizi & Konumlandırma
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.competitors.map((comp, i) => (
            <div key={i} className="bg-white border border-cyan-50 p-4 rounded-2xl space-y-2.5 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                <h4 className="font-black text-cyan-900 text-xs">🚀 Rakip: {comp.name}</h4>
                <span className="text-[10px] bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-bold">
                  Alternatif
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">⚠️ En Zayıf Noktası:</span>
                <p className="text-slate-600 italic font-medium">"{comp.weakness}"</p>
              </div>
              <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50 space-y-1">
                <span className="text-[10px] text-emerald-800 font-bold block">
                  🛡️ Bizim Haksız Avantajımız (Moat):
                </span>
                <p className="text-emerald-950 font-medium">{comp.our_advantage}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-200 p-5 rounded-2xl shadow-sm">
          <h4 className="font-black text-cyan-950 text-xs mb-2 flex items-center gap-1.5">
            <span>🎯</span> Mavi Okyanus Konumlandırma Stratejimiz
          </h4>
          <p className="text-cyan-900 font-semibold leading-relaxed">{report.positioning_strategy}</p>
        </div>
      </div>
    </div>
  );
}