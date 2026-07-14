"use client";

import React, { useState, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

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

interface UserPersonaAnalysis {
  persona_name: string;
  demographics: string;
  pain_points: string[];
  brutal_feedback: string;
  adoption_score: number;
}

// [21. GÜN]: Yeni Ajan Tartışması Şeması
interface AgentDebateAnalysis {
  cto_criticism: string;
  ceo_criticism: string;
  mvp_consensus: string;
}

interface MultiAgentData {
  project_title: string;
  cto_report: CTOAnalysis;
  ceo_report: CEOAnalysis;
  synergy_summary: string;
  user_test: UserPersonaAnalysis;
  debate_report: AgentDebateAnalysis; // [21. GÜN]
}

interface MultiAgentPanelProps {
  projectTitle: string;
  sector: string;
}

export default function MultiAgentPanel({ projectTitle, sector }: MultiAgentPanelProps) {
  const { language } = useLanguage();
  const [data, setData] = useState<MultiAgentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"cto" | "ceo" | "debate" | "user" | "synergy" | "full">("cto");
  
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

  return (
    <div className="bg-white border border-purple-100 rounded-[32px] p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-purple-50 pb-4">
        <div>
          <h3 className="text-lg font-black text-purple-950 flex items-center gap-2">
            <span>🤝</span> Multi-Agent Sinerji Simülasyonu
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            CTO, CEO, Sanal Müşteri ve tartışma orkestrasyonu projenizi analiz eder.
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
          <div className="flex bg-purple-50 p-1 rounded-xl gap-1 overflow-x-auto">
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

          {/* Rapor İçeriği */}
          <div 
            ref={reportRef} 
            className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed space-y-6"
          >
            {/* Üst Bilgi */}
            <div className="border-b-2 border-purple-600 pb-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-purple-600">PathAI Stratejik Girişim Raporu</span>
                <h2 className="text-lg font-black text-purple-950 mt-1">{data.project_title}</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Sektör: {sector}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">PathAI</span>
              </div>
            </div>

            {/* CTO */}
            {(activeTab === "cto" || activeTab === "full") && (
              <div className="space-y-4">
                <h3 className="font-black text-purple-950 text-sm border-l-4 border-purple-600 pl-2">💻 CTO Teknik Analiz Raporu</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-purple-900 mb-1">🏗️ Yazılım Mimarisi</h4>
                    <p className="text-slate-600">{data.cto_report.software_architecture}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-purple-900 mb-1">🗄️ Veri Tabanı Tasarımı</h4>
                    <p className="text-slate-600">{data.cto_report.database_design}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-purple-900 mb-1">🛡️ Güvenlik Altyapısı</h4>
                    <p className="text-slate-600">{data.cto_report.security_infrastructure}</p>
                  </div>
                </div>
              </div>
            )}

            {/* CEO */}
            {(activeTab === "ceo" || activeTab === "full") && (
              <div className="space-y-4 pt-4">
                <h3 className="font-black text-purple-950 text-sm border-l-4 border-purple-600 pl-2">💼 CEO Stratejik İş Geliştirme Raporu</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-purple-900 mb-1">👥 Hedef Kitle & Persona</h4>
                    <p className="text-slate-600">{data.ceo_report.target_audience}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-purple-900 mb-1">🚀 Pazara Giriş Stratejisi</h4>
                    <p className="text-slate-600">{data.ceo_report.go_to_market_strategy}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-purple-900 mb-1">💰 Gelir Modelleri</h4>
                    <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-600">
                      {data.ceo_report.revenue_models.map((model, i) => (
                        <li key={i} className="font-medium">{model}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* [21. GÜN]: Ajanlar Arası Çatışma ve Tartışma Paneli */}
            {(activeTab === "debate" || activeTab === "full") && data.debate_report && (
              <div className="space-y-4 pt-4 border-t border-amber-100">
                <h3 className="font-black text-amber-950 text-sm border-l-4 border-amber-500 pl-2">⚔️ Ajanlar Arası Çatışma ve MVP Uzlaşısı</h3>
                <div className="space-y-4">
                  {/* Karşılıklı Atışma Kartları */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CTO'nun CEO'ya eleştirisi */}
                    <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl relative">
                      <span className="absolute -top-2 left-4 px-2 py-0.5 bg-indigo-600 text-white font-extrabold text-[9px] rounded-full uppercase">CTO'nun Eleştirisi</span>
                      <p className="text-indigo-950 font-medium italic pt-1">
                        "{data.debate_report.cto_criticism}"
                      </p>
                    </div>

                    {/* CEO'nun CTO'ya eleştirisi */}
                    <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl relative">
                      <span className="absolute -top-2 left-4 px-2 py-0.5 bg-purple-600 text-white font-extrabold text-[9px] rounded-full uppercase">CEO'nun Eleştirisi</span>
                      <p className="text-purple-950 font-medium italic pt-1">
                        "{data.debate_report.ceo_criticism}"
                      </p>
                    </div>
                  </div>

                  {/* Konsensüs Ortak MVP Kararı */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-2xl">
                    <h4 className="font-black text-amber-950 text-xs mb-2 flex items-center gap-1.5">
                      <span>🤝</span> Ortak Yönetim Kurulu Kararı: Nihai MVP Yol Haritası
                    </h4>
                    <p className="text-amber-900 font-semibold leading-relaxed">
                      {data.debate_report.mvp_consensus}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sanal Kullanıcı Testi */}
            {(activeTab === "user" || activeTab === "full") && data.user_test && (
              <div className="space-y-4 pt-4 border-t border-pink-100">
                <h3 className="font-black text-pink-950 text-sm border-l-4 border-pink-500 pl-2">👤 Sanal Müşteri & Kullanıcı Uyumluluk Testi</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4 bg-white p-4 rounded-xl border border-pink-100 space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-pink-900 text-sm">{data.user_test.persona_name}</h4>
                      <p className="text-slate-500 text-[10px] mt-1">{data.user_test.demographics}</p>
                    </div>
                    <div className={`p-3 rounded-lg border text-center ${getScoreColor(data.user_test.adoption_score)}`}>
                      <span className="text-[10px] font-extrabold uppercase tracking-wide block">Benimseme Puanı</span>
                      <span className="text-3xl font-black">{data.user_test.adoption_score}%</span>
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-1">🚨 Kullanıcı Acı Noktaları</h4>
                      <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-600">
                        {data.user_test.pain_points.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100/50">
                      <h4 className="font-black text-rose-950 mb-1">💬 Acımasız Geri Bildirim (Brutal Feedback)</h4>
                      <p className="text-rose-900 italic font-medium">"{data.user_test.brutal_feedback}"</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sinerji */}
            {(activeTab === "synergy" || activeTab === "full") && (
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <h3 className="font-black text-indigo-950 text-sm border-l-4 border-indigo-600 pl-2">✨ Ortak Sinerji & Mentor Tavsiyesi</h3>
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