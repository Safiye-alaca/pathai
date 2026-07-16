import React from "react";

interface UserPersonaTabProps {
  report: {
    persona_name: string;
    demographics: string;
    pain_points: string[];
    brutal_feedback: string;
    adoption_score: number;
  };
  getScoreColor: (score: number) => string;
}

export default function UserPersonaTab({ report, getScoreColor }: UserPersonaTabProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-pink-100 animate-fade-in">
      <h3 className="font-black text-pink-950 text-sm border-l-4 border-pink-500 pl-2">
        👤 Sanal Müşteri & Kullanıcı Uyumluluk Testi
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4 bg-white p-4 rounded-xl border border-pink-100 space-y-3 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="font-bold text-pink-900 text-sm">{report.persona_name}</h4>
            <p className="text-slate-500 text-[10px] mt-1">{report.demographics}</p>
          </div>
          <div className={`p-3 rounded-lg border text-center ${getScoreColor(report.adoption_score)}`}>
            <span className="text-[10px] font-extrabold uppercase tracking-wide block">
              Benimseme Puanı
            </span>
            <span className="text-3xl font-black">{report.adoption_score}%</span>
          </div>
        </div>
        <div className="md:col-span-8 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-1">🚨 Kullanıcı Acı Noktaları</h4>
            <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-600 font-medium">
              {report.pain_points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
          <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100/50 shadow-sm">
            <h4 className="font-black text-rose-950 mb-1">💬 Acımasız Geri Bildirim (Brutal Feedback)</h4>
            <p className="text-rose-900 italic font-medium">"{report.brutal_feedback}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}