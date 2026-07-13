"use client";

import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

interface CTOAnalysis {
  software_architecture: string;
  database_design: string;
  security_infrastructure: string;
}

interface CEOAnalysis {
  target_audience: string;
  revenue_models: string[];
  go_to_market_strategy: string;
}

interface MultiAgentData {
  project_title: string;
  cto_report: CTOAnalysis;
  ceo_report: CEOAnalysis;
  synergy_summary: string;
}

interface MultiAgentPanelProps {
  projectTitle: string;
  sector: string;
}

export default function MultiAgentPanel({ projectTitle, sector }: MultiAgentPanelProps) {
  const { t, language } = useLanguage();
  const [data, setData] = useState<MultiAgentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"cto" | "ceo" | "synergy">("cto");

  const runSimulation = async () => {
    if (!projectTitle || !sector) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/multi-agent/simulate?project_title=${encodeURIComponent(
          projectTitle
        )}&sector=${encodeURIComponent(sector)}&lang=${language}`
      );
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error("Multi-Agent Simulation Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-purple-100 rounded-[32px] p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-purple-50 pb-4">
        <div>
          <h3 className="text-lg font-black text-purple-950 flex items-center gap-2">
            <span>🤝</span> Multi-Agent Sinerji Simülasyonu
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            CTO ve CEO ajanları projenizi eş zamanlı analiz eder.
          </p>
        </div>
        <button
          onClick={runSimulation}
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-black text-xs shadow-md transition-all disabled:opacity-50 shrink-0"
        >
          {loading ? "Ajanlar Tartışıyor..." : "🤖 Çoklu Ajan Simülasyonunu Başlat"}
        </button>
      </div>

      {data && (
        <div className="space-y-6">
          {/* Ajan Sekme Menüsü */}
          <div className="flex bg-purple-50 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab("cto")}
              className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                activeTab === "cto" ? "bg-purple-600 text-white shadow-sm" : "text-purple-950 hover:bg-purple-100/50"
              }`}
            >
              💻 CTO Teknik Raporu
            </button>
            <button
              onClick={() => setActiveTab("ceo")}
              className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                activeTab === "ceo" ? "bg-purple-600 text-white shadow-sm" : "text-purple-950 hover:bg-purple-100/50"
              }`}
            >
              💼 CEO İş Stratejisi
            </button>
            <button
              onClick={() => setActiveTab("synergy")}
              className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                activeTab === "synergy" ? "bg-indigo-600 text-white shadow-sm" : "text-indigo-950 hover:bg-indigo-100/50"
              }`}
            >
              ✨ Ortak Sinerji Özeti
            </button>
          </div>

          {/* Dinamik İçerik Alanı */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
            {activeTab === "cto" && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-black text-purple-950 text-sm mb-1">🏗️ Yazılım Mimarisi</h4>
                  <p>{data.cto_report.software_architecture}</p>
                </div>
                <div>
                  <h4 className="font-black text-purple-950 text-sm mb-1">🗄️ Veri Tabanı Tasarımı</h4>
                  <p>{data.cto_report.database_design}</p>
                </div>
                <div>
                  <h4 className="font-black text-purple-950 text-sm mb-1">🛡️ Güvenlik Altyapısı</h4>
                  <p>{data.cto_report.security_infrastructure}</p>
                </div>
              </div>
            )}

            {activeTab === "ceo" && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-black text-purple-950 text-sm mb-1">👥 Hedef Kitle & Persona</h4>
                  <p>{data.ceo_report.target_audience}</p>
                </div>
                <div>
                  <h4 className="font-black text-purple-950 text-sm mb-1">💰 Gelir Modelleri</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {data.ceo_report.revenue_models.map((model, i) => (
                      <li key={i} className="font-bold text-purple-950">{model}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-black text-purple-950 text-sm mb-1">🚀 Pazara Giriş Stratejisi</h4>
                  <p>{data.ceo_report.go_to_market_strategy}</p>
                </div>
              </div>
            )}

            {activeTab === "synergy" && (
              <div className="space-y-2">
                <h4 className="font-black text-indigo-950 text-sm mb-1">🎓 Başarı İçin Mentor Tavsiyesi</h4>
                <p className="italic bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 text-indigo-950 font-medium">
                  {data.synergy_summary}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}