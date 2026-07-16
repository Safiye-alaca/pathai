import React from "react";

interface DebateTabProps {
  report: {
    cto_criticism: string;
    ceo_criticism: string;
    mvp_consensus: string;
  };
}

export default function DebateTab({ report }: DebateTabProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-amber-100 animate-fade-in">
      <h3 className="font-black text-amber-950 text-sm border-l-4 border-amber-500 pl-2">
        ⚔️ Ajanlar Arası Çatışma ve MVP Uzlaşısı
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl relative shadow-sm">
            <span className="absolute -top-2 left-4 px-2 py-0.5 bg-indigo-600 text-white font-extrabold text-[9px] rounded-full uppercase">
              CTO'nun Eleştirisi
            </span>
            <p className="text-indigo-950 font-medium italic pt-1">"{report.cto_criticism}"</p>
          </div>
          <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl relative shadow-sm">
            <span className="absolute -top-2 left-4 px-2 py-0.5 bg-purple-600 text-white font-extrabold text-[9px] rounded-full uppercase">
              CEO'nun Eleştirisi
            </span>
            <p className="text-purple-950 font-medium italic pt-1">"{report.ceo_criticism}"</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-2xl shadow-sm">
          <h4 className="font-black text-amber-950 text-xs mb-2 flex items-center gap-1.5">
            <span>🤝</span> Ortak Yönetim Kurulu Kararı: Nihai MVP Yol Haritası
          </h4>
          <p className="text-amber-900 font-semibold leading-relaxed">{report.mvp_consensus}</p>
        </div>
      </div>
    </div>
  );
}