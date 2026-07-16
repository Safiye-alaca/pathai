"use client";

import React, { useState, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

// Modüler olarak ayırdığımız sekmeleri import ediyoruz
import CTOTab from "./tabs/CTOTab";
import CEOTab from "./tabs/CEOTab";
import DebateTab from "./tabs/DebateTab";
import CompetitorTab from "./tabs/CompetitorTab";
import FinancialTab from "./tabs/FinancialTab";
import GrowthTab from "./tabs/GrowthTab";
import LegalTab from "./tabs/LegalTab";
import QATab from "./tabs/QATab";
import PerformanceTab from "./tabs/PerformanceTab";
import UserPersonaTab from "./tabs/UserPersonaTab";

interface MultiAgentData {
  project_title: string;
  cto_report: any;
  ceo_report: any;
  synergy_summary: string;
  user_test: any;
  debate_report: any;
  competitor_report: any;
  financial_report: any;
  growth_report: any;
  legal_report: any;
  qa_report: any;
  performance_report: any;
}

interface MultiAgentPanelProps {
  projectTitle: string;
  sector: string;
}

export default function MultiAgentPanel({ projectTitle, sector }: MultiAgentPanelProps) {
  const { language } = useLanguage();
  const [data, setData] = useState<MultiAgentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "cto" | "ceo" | "debate" | "competitor" | "financial" | "growth" | "legal" | "qa" | "performance" | "user" | "synergy" | "full"
  >("cto");
  
  const reportRef = useRef<HTMLDivElement>(null);

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
        setActiveTab("full");
      }
    } catch (err) {
      console.error("Multi-Agent Simulation Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!reportRef.current || !data) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const cleanTitle = data.project_title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      pdf.save(`pathai_multi_agent_${cleanTitle}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const getRiskBadgeColor = (level: string) => {
    const l = level.toLowerCase();
    if (l === "kritik") return "bg-rose-100 text-rose-800 border-rose-200";
    if (l === "yüksek") return "bg-orange-100 text-orange-800 border-orange-200";
    if (l === "orta") return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  return (
    <div className="bg-white border border-purple-100 rounded-[32px] p-6 shadow-xl space-y-6">
      {/* Header Bölümü */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-purple-50 pb-4">
        <div>
          <h3 className="text-lg font-black text-purple-950 flex items-center gap-2">
            <span>🤝</span> Multi-Agent Sinerji Simülasyonu
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Girişiminiz için CTO, CEO, Pazar, Finans, Growth, Hukuk, QA ve Performans izleme ajanları ortak çalışır.
          </p>
        </div>
        <div className="flex gap-2">
          {data && (
            <button
              onClick={exportToPDF}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              📥 Raporu PDF İndir
            </button>
          )}
          <button
            onClick={runSimulation}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-black text-xs shadow-md transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? "Ajanlar Tartışıyor..." : "🤖 Çoklu Ajan Simülasyonunu Başlat"}
          </button>
        </div>
      </div>

      {data && (
        <div className="space-y-6">
          {/* Sekme Menüsü */}
          <div className="flex bg-purple-50 p-1 rounded-xl gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("cto")}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                activeTab === "cto" ? "bg-purple-600 text-white shadow-sm" : "text-purple-950 hover:bg-purple-100/50"
              }`}
            >
              💻 CTO Raporu
            </button>
            <button
              onClick={() => setActiveTab("ceo")}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                activeTab === "ceo" ? "bg-purple-600 text-white shadow-sm" : "text-purple-950 hover:bg-purple-100/50"
              }`}
            >
              💼 CEO Raporu
            </button>
            <button
              onClick={() => setActiveTab("debate")}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                activeTab === "debate" ? "bg-amber-600 text-white shadow-sm" : "text-amber-950 hover:bg-amber-100/50"
              }`}
            >
              ⚔️ Ajan Tartışması
            </button>
            <button
              onClick={() => setActiveTab("competitor")}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                activeTab === "competitor" ? "bg-cyan-600 text-white shadow-sm" : "text-cyan-950 hover:bg-cyan-100/50"
              }`}
            >
              📊 Rakip Analizi
            </button>
            <button
              onClick={() => setActiveTab("financial")}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                activeTab === "financial" ? "bg-emerald-600 text-white shadow-sm" : "text-emerald-950 hover:bg-emerald-100/50"
              }`}
            >
              💰 Finansal Analiz
            </button>
            <button
              onClick={() => setActiveTab("growth")}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                activeTab === "growth" ? "bg-orange-600 text-white shadow-sm" : "text-orange-950 hover:bg-orange-100/50"
              }`}
            >
              📈 Büyüme Planı
            </button>
            <button
              onClick={() => setActiveTab("legal")}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                activeTab === "legal" ? "bg-rose-600 text-white shadow-sm" : "text-rose-950 hover:bg-rose-100/50"
              }`}
            >
              ⚖️ Hukuk & Risk
            </button>
            <button
              onClick={() => setActiveTab("qa")}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                activeTab === "qa" ? "bg-teal-600 text-white shadow-sm" : "text-teal-950 hover:bg-teal-100/50"
              }`}
            >
              🧪 Test & QA
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                activeTab === "performance" ? "bg-blue-600 text-white shadow-sm" : "text-blue-950 hover:bg-blue-100/50"
              }`}
            >
              ⚡ Performans
            </button>
            <button
              onClick={() => setActiveTab("user")}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                activeTab === "user" ? "bg-pink-600 text-white shadow-sm" : "text-pink-950 hover:bg-pink-100/50"
              }`}
            >
              👤 Kullanıcı Testi
            </button>
            <button
              onClick={() => setActiveTab("synergy")}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                activeTab === "synergy" ? "bg-indigo-600 text-white shadow-sm" : "text-indigo-950 hover:bg-indigo-100/50"
              }`}
            >
              ✨ Sinerji Özeti
            </button>
            <button
              onClick={() => setActiveTab("full")}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${
                activeTab === "full" ? "bg-slate-700 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              📋 Tam Rapor
            </button>
          </div>

          {/* Rapor İçerik Paneli */}
          <div 
            ref={reportRef} 
            className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed space-y-6"
          >
            {/* Üst Bilgi Başlığı (PDF için her durumda gösterilir) */}
            <div className="border-b-2 border-purple-600 pb-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-purple-600">
                  PathAI Stratejik Girişim Raporu
                </span>
                <h2 className="text-lg font-black text-purple-950 mt-1">{data.project_title}</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Sektör: {sector}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  PathAI
                </span>
              </div>
            </div>

            {/* Dinamik Sekme Gösterimleri */}
            {(activeTab === "cto" || activeTab === "full") && (
              <CTOTab report={data.cto_report} />
            )}

            {(activeTab === "ceo" || activeTab === "full") && (
              <CEOTab report={data.ceo_report} />
            )}

            {(activeTab === "debate" || activeTab === "full") && data.debate_report && (
              <DebateTab report={data.debate_report} />
            )}

            {(activeTab === "competitor" || activeTab === "full") && data.competitor_report && (
              <CompetitorTab report={data.competitor_report} />
            )}

            {(activeTab === "financial" || activeTab === "full") && data.financial_report && (
              <FinancialTab report={data.financial_report} />
            )}

            {(activeTab === "growth" || activeTab === "full") && data.growth_report && (
              <GrowthTab report={data.growth_report} />
            )}

            {(activeTab === "legal" || activeTab === "full") && data.legal_report && (
              <LegalTab report={data.legal_report} getRiskBadgeColor={getRiskBadgeColor} />
            )}

            {(activeTab === "qa" || activeTab === "full") && data.qa_report && (
              <QATab report={data.qa_report} />
            )}

            {(activeTab === "performance" || activeTab === "full") && data.performance_report && (
              <PerformanceTab report={data.performance_report} />
            )}

            {(activeTab === "user" || activeTab === "full") && data.user_test && (
              <UserPersonaTab report={data.user_test} getScoreColor={getScoreColor} />
            )}

            {(activeTab === "synergy" || activeTab === "full") && (
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h3 className="font-black text-indigo-950 text-sm border-l-4 border-indigo-600 pl-2">
                  ✨ Ortak Sinerji & Mentor Tavsiyesi
                </h3>
                <p className="italic bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 text-indigo-950 font-medium">
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