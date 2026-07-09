"use client";

import { useState, useEffect, useRef } from "react";

interface RadarItem {
  source: "github" | "huggingface" | "techcrunch" | "hackernews";
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
  radarData: RadarResponse | null; // Geriye dönük uyumluluk için duruyor
  radarLoading: boolean;
  fetchRadar: () => void;
}

export default function RadarPanel({}: RadarPanelProps) {
  // 4 Farklı kanal için ayrı veri depoları
  const [githubItems, setGithubItems] = useState<RadarItem[]>([]);
  const [huggingfaceItems, setHuggingfaceItems] = useState<RadarItem[]>([]);
  const [techcrunchItems, setTechcrunchItems] = useState<RadarItem[]>([]);
  const [hackernewsItems, setHackernewsItems] = useState<RadarItem[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"tech" | "news">("tech");
  const [statusText, setStatusText] = useState("Küresel açık kaynak dünyasında bugün ivmelenen kütüphaneleri ve modelleri anlık yakalayın.");
  const wsRef = useRef<WebSocket | null>(null);

  // 10. Gün: Özetleme State'leri
  const [isScanCompleted, setIsScanCompleted] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Bileşenden çıkıldığında açık kalan bağlantıları güvenle temizliyoruz
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const startWebSocketScan = () => {
    // Bütün listeleri sıfırla ve yükleniyor moduna geç
    setGithubItems([]);
    setHuggingfaceItems([]);
    setTechcrunchItems([]);
    setHackernewsItems([]);
    setIsScanCompleted(false); 
    setSummaryData(null);      
    setIsLoading(true);
    setStatusText("📡 Canlı WebSocket tüneli açılıyor...");

    const ws = new WebSocket("ws://127.0.0.1:8000/ws/radar");
    wsRef.current = ws;

    ws.onopen = () => {
      setStatusText("🔍 Bağlantı kuruldu. 4 farklı küresel kanal canlı taranıyor...");
      ws.send("START_SCAN");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.status === "COMPLETED") {
        setStatusText("✅ Tüm küresel yapay zeka kanallarının taraması başarıyla tamamlandı.");
        setIsLoading(false);
        setIsScanCompleted(true); 
        ws.close();
      } else if (data.status === "ERROR") {
        setStatusText(`❌ Tarama hatası: ${data.message}`);
        setIsLoading(false);
        ws.close();
      } else {
        const item = data as RadarItem;
        // Gelen verinin kaynağına göre ilgili listeye ekliyoruz
        if (item.source === "github") {
          setGithubItems((prev) => [...prev, item]);
        } else if (item.source === "huggingface") {
          setHuggingfaceItems((prev) => [...prev, item]);
        } else if (item.source === "techcrunch") {
          setTechcrunchItems((prev) => [...prev, item]);
        } else if (item.source === "hackernews") {
          setHackernewsItems((prev) => [...prev, item]);
        }
      }
    };

    ws.onclose = () => {
      setIsLoading(false);
    };

    ws.onerror = (err) => {
      console.error("Radar WS Hatası:", err);
      setStatusText("❌ Sunucu ile canlı bağlantı kurulamadı.");
      setIsLoading(false);
    };
  };

  // 10. Gün: Tüm ham verileri toplayıp arka plandaki Gemini RAG katmanına gönderen fonksiyon
  const generateAIReport = async () => {
    setSummaryLoading(true);
    
    const allCollectedData = [
      ...githubItems,
      ...huggingfaceItems,
      ...techcrunchItems,
      ...hackernewsItems,
    ];

    try {
      const res = await fetch("http://127.0.0.1:8000/api/radar-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_data: allCollectedData }),
      });

      if (!res.ok) throw new Error("Yapay zeka rapor motoru şu an yanıt vermiyor.");
      const data = await res.json();
      setSummaryData(data);
    } catch (err: any) {
      console.error(err);
      setStatusText(`❌ Özetleme Hatası: ${err.message}`);
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Üst Arama/Kart Alanı */}
      <div className="bg-white border border-purple-100 rounded-[32px] p-6 flex flex-col md:flex-row items-center gap-6 shadow-xl max-w-3xl mx-auto">
        <div className="w-24 h-24 rounded-2xl bg-purple-50 overflow-hidden shrink-0 border border-purple-100 flex items-center justify-center">
          <img 
            src="/images/binoculars-radar.png" 
            alt="Dürbünle Tarayan Radar"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><text y='20' font-size='20'>🔭</text></svg>"; }}
          />
        </div>
        <div className="text-center md:text-left space-y-2 flex-1">
          <h1 className="text-2xl font-black text-purple-950">Canlı Yapay Zeka Geliştirici Radarı</h1>
          <p className="text-slate-500 text-xs leading-relaxed">{statusText}</p>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1 justify-center md:justify-start">
            <button 
              onClick={startWebSocketScan} 
              disabled={isLoading}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 ${
                isLoading ? "bg-purple-300 cursor-not-allowed" : "bg-purple-600 hover:opacity-90 hover:scale-[1.01]"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                  Ağlar Taranıyor...
                </>
              ) : (
                "🔍 Ağları Canlı Tara"
              )}
            </button>

            {/* Yeni Sekme (Tab) Değiştirici Alanı */}
            <div className="inline-flex bg-slate-100 p-1 rounded-full border border-slate-200/60 self-center">
              <button
                onClick={() => setActiveTab("tech")}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                  activeTab === "tech" ? "bg-white text-purple-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                🛠️ Kod & Model
              </button>
              <button
                onClick={() => setActiveTab("news")}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                  activeTab === "news" ? "bg-white text-purple-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                📰 Girişimler & Haberler
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 10. Gün: Tarama Bittiyse veya Veri Varsa Ortaya Çıkan Sihirli Akıllı Özet Butonu */}
      {isScanCompleted && (
        <div className="text-center bg-gradient-to-r from-purple-900 to-indigo-950 p-6 rounded-3xl shadow-xl text-white space-y-3 animate-slide-up">
          <div className="text-xs text-purple-200 font-bold">🧠 Küresel AI verileri başarıyla hafızaya alındı!</div>
          <p className="text-[11px] opacity-80 max-w-md mx-auto">Akan tüm repoları, finansman haberlerini ve teknik tartışmaları tek tıkla analiz edip günün pazar raporunu çıkartın.</p>
          <button
            onClick={generateAIReport}
            disabled={summaryLoading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 font-black text-xs text-white shadow-md hover:opacity-90 transition-all transform hover:scale-[1.01]"
          >
            {summaryLoading ? "Gemini Verileri Yorumluyor..." : "✨ Ajan Özetini ve Pazar Analizini Al"}
          </button>
        </div>
      )}

      {/* 10. Gün: Akıllı Özet Sonuç Raporu Ekranı */}
      {summaryData && (
        <div className="bg-white border-2 border-amber-200/60 rounded-[32px] p-6 shadow-xl space-y-6 animate-slide-up">
          <div className="border-b pb-3 border-amber-100 flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <h3 className="font-black text-purple-950 text-base">Gemini Yapay Zeka Strateji Raporu (TL;DR)</h3>
              <p className="text-slate-400 text-[10px]">Canlı taranan verilerden çıkarılan anlık küresel özet.</p>
            </div>
          </div>

          <p className="text-slate-700 text-xs leading-relaxed bg-amber-50/30 p-4 rounded-2xl border border-amber-100/40">
            {summaryData.tldr_summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-50/40 border border-purple-100 p-4 rounded-2xl space-y-2">
              <h4 className="font-bold text-purple-950 text-xs flex items-center gap-1">🎯 Yakalanan Pazar Fırsatları</h4>
              <ul className="space-y-1.5 pl-1">
                {summaryData.market_opportunities?.map((o: string, i: number) => (
                  <li key={i} className="text-slate-600 text-[11px] leading-relaxed">• {o}</li>
                ))}
              </ul>
            </div>

            <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-2xl space-y-2">
              <h4 className="font-bold text-indigo-950 text-xs flex items-center gap-1">🚀 Yükselen Mimari Trendler</h4>
              <ul className="space-y-1.5 pl-1">
                {summaryData.architectural_trends?.map((t: string, i: number) => (
                  <li key={i} className="text-slate-600 text-[11px] leading-relaxed">• {t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Yükleniyor Göstergesi */}
      {isLoading && githubItems.length === 0 && techcrunchItems.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-slate-500 text-xs font-semibold">Küresel API hatları üzerinden veri akışı başlatılıyor...</p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SEKME 1: KOD VE MODEL SEKMESİ */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "tech" && (githubItems.length > 0 || huggingfaceItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GitHub Canlı Listesi */}
          <div className="bg-white border border-purple-100 rounded-[28px] p-6 shadow-xl space-y-4">
            <h2 className="text-base font-black text-purple-950 flex items-center gap-2 border-b pb-2 border-purple-50">
              🐙 Trend Repolar (GitHub)
            </h2>
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {githubItems.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-50 flex flex-col gap-1 transition-all duration-300 transform translate-y-0 scale-100">
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

          {/* Hugging Face Canlı Listesi */}
          <div className="bg-white border border-purple-100 rounded-[28px] p-6 shadow-xl space-y-4">
            <h2 className="text-base font-black text-purple-950 flex items-center gap-2 border-b pb-2 border-purple-50">
              🤗 En Popüler Modeller (Hugging Face)
            </h2>
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {huggingfaceItems.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-50 flex flex-col gap-1 transition-all duration-300 transform translate-y-0 scale-100">
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

      {/* ------------------------------------------------------------- */}
      {/* SEKME 2: GİRİŞİMLER VE HABERLER SEKMESİ */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "news" && (techcrunchItems.length > 0 || hackernewsItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TechCrunch Haber Listesi */}
          <div className="bg-white border border-purple-100 rounded-[28px] p-6 shadow-xl space-y-4">
            <h2 className="text-base font-black text-purple-950 flex items-center gap-2 border-b pb-2 border-purple-50">
              🚀 Lansman & Yatırımlar (TechCrunch)
            </h2>
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {techcrunchItems.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-100/50 flex flex-col gap-1 transition-all duration-300 transform translate-y-0 scale-100">
                  <div className="flex justify-between items-start gap-2">
                    <a href={item.url} target="_blank" rel="noreferrer" className="font-bold text-amber-800 hover:underline text-xs leading-snug">
                      {item.name}
                    </a>
                    <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                      {item.metric}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hacker News Makale Listesi */}
          <div className="bg-white border border-purple-100 rounded-[28px] p-6 shadow-xl space-y-4">
            <h2 className="text-base font-black text-purple-950 flex items-center gap-2 border-b pb-2 border-purple-50">
              🔥 Derin Teknik Tartışmalar (Hacker News)
            </h2>
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {hackernewsItems.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-orange-50/40 border border-orange-100/50 flex flex-col gap-1 transition-all duration-300 transform translate-y-0 scale-100">
                  <div className="flex justify-between items-center gap-2">
                    <a href={item.url} target="_blank" rel="noreferrer" className="font-bold text-orange-700 hover:underline text-xs leading-snug">
                      {item.name}
                    </a>
                    <span className="text-[9px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                      {item.metric}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}