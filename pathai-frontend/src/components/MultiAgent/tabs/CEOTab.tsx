import React from "react";

interface CEOTabProps {
  report: {
    target_audience: string;
    revenue_models: string[];
    go_to_market_strategy: string;
  };
}

export default function CEOTab({ report }: CEOTabProps) {
  return (
    <div className="space-y-4 pt-4 animate-fade-in">
      <h3 className="font-black text-purple-950 text-sm border-l-4 border-purple-600 pl-2">
        💼 CEO Stratejik İş Geliştirme Raporu
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="font-bold text-purple-900 mb-1">👥 Hedef Kitle & Persona</h4>
          <p className="text-slate-600 font-medium">{report.target_audience}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="font-bold text-purple-900 mb-1">🚀 Pazara Giriş Stratejisi</h4>
          <p className="text-slate-600 font-medium">{report.go_to_market_strategy}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="font-bold text-purple-900 mb-1">💰 Gelir Modelleri</h4>
          <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-600">
            {report.revenue_models.map((model, i) => (
              <li key={i} className="font-medium text-slate-600">
                {model}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}