import React from "react";

interface PerformanceMetrics {
  total_tokens_saved: number;
  cost_saved_usd: number;
  api_latency_reduction_percent: number;
  cache_status: string;
}

interface PerformanceTabProps {
  report: {
    monitor_title: string;
    metrics: PerformanceMetrics;
    bottlenecks: string[];
  };
}

export default function PerformanceTab({ report }: PerformanceTabProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-blue-100 animate-fade-in">
      <h3 className="font-black text-blue-950 text-sm border-l-4 border-blue-500 pl-2">
        ⚡ Sistem Performansı & Önbellek İzleme
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-100 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[9px] font-extrabold uppercase text-blue-700 tracking-wider">
                İzleme Kokpiti
              </span>
              <h4 className="text-sm font-black text-blue-950 mt-0.5">
                {report.monitor_title}
              </h4>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Önbellek Durumu:</span>
                <span
                  className={`px-2 py-0.5 text-[9px] font-black rounded-full ${
                    report.metrics.cache_status === "HIT"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {report.metrics.cache_status}
                </span>
              </div>
            </div>
          </div>
          <div className="md:col-span-4 bg-blue-950 text-white p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-md">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-300">
              Gecikme Azalması (Latency)
            </span>
            <span className="text-4xl font-black text-cyan-400 mt-1">
              {report.metrics.api_latency_reduction_percent}%
            </span>
            <span className="text-[8px] text-blue-200/70 mt-1 font-semibold">
              SQLite Önbellek Hızı: ~15ms
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-blue-50 p-4 rounded-2xl space-y-1 text-center shadow-sm">
            <span className="text-[10px] text-blue-700 font-extrabold uppercase block">
              💸 Finansal Tasarruf (USD)
            </span>
            <span className="text-2xl font-black text-blue-950 block mt-1">
              ${report.metrics.cost_saved_usd}
            </span>
            <span className="text-[9px] text-slate-400 mt-0.5 block">
              Önbellek sayesinde cebimizde kalan API bütçesi
            </span>
          </div>
          <div className="bg-white border border-blue-50 p-4 rounded-2xl space-y-1 text-center shadow-sm">
            <span className="text-[10px] text-indigo-700 font-extrabold uppercase block">
              🔮 Kurtarılan Toplam Token
            </span>
            <span className="text-2xl font-black text-indigo-950 block mt-1">
              {report.metrics.total_tokens_saved.toLocaleString()}
            </span>
            <span className="text-[9px] text-slate-400 mt-0.5 block">
              Google AI sunucularına gönderilmeyen veri boyutu
            </span>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl text-slate-100 space-y-3 shadow-md">
          <h4 className="font-extrabold text-[10px] text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <span>⚙️</span> Tespit Edilen Sistem Darboğazları (SRE Logları)
          </h4>
          <ul className="list-disc pl-4 space-y-1.5 text-slate-300 font-semibold text-[11px] leading-relaxed">
            {report.bottlenecks.map((btn, i) => (
              <li key={i}>{btn}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}