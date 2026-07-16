import React from "react";

interface LegalRequirement {
  title: string;
  description: string;
  risk_level: string;
}

interface TechnicalRisk {
  risk_name: string;
  mitigation_plan: string;
}

interface LegalTabProps {
  report: {
    legal_strategy_title: string;
    legal_requirements: LegalRequirement[];
    technical_risks: TechnicalRisk[];
  };
  getRiskBadgeColor: (level: string) => string;
}

export default function LegalTab({ report, getRiskBadgeColor }: LegalTabProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-rose-100 animate-fade-in">
      <h3 className="font-black text-rose-950 text-sm border-l-4 border-rose-500 pl-2">
        ⚖️ Hukuki Uyumluluk & Teknik Risk Analizi
      </h3>
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-rose-500/10 to-red-500/10 border border-rose-100 p-4 rounded-2xl shadow-sm">
          <span className="text-[9px] font-extrabold uppercase text-rose-700 tracking-wider">
            Yasal Koruma Kalkanı Stratejisi
          </span>
          <h4 className="text-md font-black text-rose-950 mt-0.5">
            {report.legal_strategy_title}
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-bold text-slate-950 text-xs flex items-center gap-1">
              📜 KVKK / GDPR ve Sözleşme Zorunlulukları
            </h4>
            {report.legal_requirements.map((req, i) => (
              <div key={i} className="bg-white border border-slate-100 p-4 rounded-xl space-y-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-slate-900 text-xs">{req.title}</h5>
                  <span
                    className={`px-2 py-0.5 text-[8px] border font-extrabold rounded-full uppercase ${getRiskBadgeColor(
                      req.risk_level
                    )}`}
                  >
                    Ceza Riski: {req.risk_level}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium text-xs">
                  {req.description}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-slate-950 text-xs flex items-center gap-1">
              🛡️ Kritik Teknik Risk Azaltma (Mitigation)
            </h4>
            {report.technical_risks.map((risk, i) => (
              <div key={i} className="bg-white border border-slate-100 p-4 rounded-xl space-y-2 shadow-sm">
                <h5 className="font-bold text-rose-950 text-xs flex items-center gap-1">
                  ⚠️ {risk.risk_name}
                </h5>
                <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/50 space-y-0.5">
                  <span className="text-[9px] text-emerald-800 font-bold block">💡 Çözüm Planı:</span>
                  <p className="text-emerald-950 font-medium leading-relaxed text-xs">
                    {risk.mitigation_plan}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}