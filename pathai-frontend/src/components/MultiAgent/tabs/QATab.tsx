import React from "react";

interface TestCaseResult {
  endpoint: string;
  status: string;
  response_time_ms: number;
  validation_notes: string;
}

interface QATabProps {
  report: {
    test_suite_title: string;
    overall_health_score: number;
    test_cases: TestCaseResult[];
    critical_vulnerabilities: string[];
  };
}

export default function QATab({ report }: QATabProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-teal-100 animate-fade-in">
      <h3 className="font-black text-teal-950 text-sm border-l-4 border-teal-500 pl-2">
        🧪 Test Otomasyonu & QA Sistem Kalite Raporu
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-100 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[9px] font-extrabold uppercase text-teal-700 tracking-wider">
                Aktif Test Süiti
              </span>
              <h4 className="text-sm font-black text-teal-950 mt-0.5">
                {report.test_suite_title}
              </h4>
            </div>
          </div>
          <div className="md:col-span-4 bg-teal-950 text-white p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-md">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-teal-300">
              Genel Sağlık Skoru
            </span>
            <span className="text-4xl font-black text-emerald-400 mt-1">
              {report.overall_health_score}%
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-xs">🚀 Koşturulan Entegrasyon Test Senaryoları</h4>
          <div className="grid grid-cols-1 gap-3">
            {report.test_cases.map((tc, i) => (
              <div key={i} className="bg-white border border-slate-100 p-4 rounded-xl space-y-2 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    {tc.endpoint}
                  </h5>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[8px] font-extrabold rounded-full">
                      {tc.status}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-[8px] font-bold rounded-full">
                      {tc.response_time_ms}ms
                    </span>
                  </div>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed text-xs">
                  {tc.validation_notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}