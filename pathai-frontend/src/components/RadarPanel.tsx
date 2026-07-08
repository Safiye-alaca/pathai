"use client";

interface RadarItem {
  name: string;
  url: string;
  description: string;
  metric: string;
}

interface RadarResponse {
  github_trending: RadarItem[];
  huggingface_trending: RadarItem[];
}

interface RadarPanelProps {
  radarData: RadarResponse | null;
  radarLoading: boolean;
  fetchRadar: () => void;
}

export default function RadarPanel({ radarData, radarLoading, fetchRadar }: RadarPanelProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white border border-purple-100 rounded-[32px] p-6 flex flex-col md:flex-row items-center gap-6 shadow-xl max-w-3xl mx-auto">
        <div className="w-24 h-24 rounded-2xl bg-purple-50 overflow-hidden shrink-0 border border-purple-100 flex items-center justify-center">
          <img 
            src="/images/binoculars-radar.png" 
            alt="Dürbünle Tarayan Radar"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><text y='20' font-size='20'>🔭</text></svg>"; }}
          />
        </div>
        <div className="text-center md:text-left space-y-1 flex-1">
          <h1 className="text-2xl font-black text-purple-950">Canlı Yapay Zeka Geliştirici Radarı</h1>
          <p className="text-slate-500 text-xs">Küresel açık kaynak dünyasında bugün ivmelenen kütüphaneleri ve modelleri anlık yakalayın.</p>
          <button onClick={fetchRadar} className="mt-2 px-4 py-1.5 rounded-full text-[11px] font-bold bg-purple-600 text-white shadow-sm hover:opacity-90 transition-all">
            🔍 Ağları Canlı Tara
          </button>
        </div>
      </div>

      {radarLoading && (
        <div className="text-center py-12">
          <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-slate-500 text-xs font-semibold">Küresel API ağları analiz ediliyor...</p>
        </div>
      )}

      {radarData && !radarLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-purple-100 rounded-[28px] p-6 shadow-xl space-y-4">
            <h2 className="text-base font-black text-purple-950 flex items-center gap-2 border-b pb-2 border-purple-50">
              🐙 Trend Repolar (GitHub)
            </h2>
            <div className="space-y-3">
              {radarData.github_trending.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-50 flex flex-col gap-1">
                  <div className="flex justify-between items-center gap-2">
                    <a href={item.url} target="_blank" rel="noreferrer" className="font-bold text-purple-700 hover:underline text-xs break-all">
                      {item.name}
                    </a>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded shrink-0">
                      {item.metric}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-purple-100 rounded-[28px] p-6 shadow-xl space-y-4">
            <h2 className="text-base font-black text-purple-950 flex items-center gap-2 border-b pb-2 border-purple-50">
              🤗 En Popüler Modeller (Hugging Face)
            </h2>
            <div className="space-y-3">
              {radarData.huggingface_trending.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-50 flex flex-col gap-1">
                  <div className="flex justify-between items-center gap-2">
                    <a href={item.url} target="_blank" rel="noreferrer" className="font-bold text-indigo-700 hover:underline text-xs break-all">
                      {item.name}
                    </a>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded shrink-0">
                      {item.metric}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}