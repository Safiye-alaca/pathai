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

interface AgentDebateAnalysis {
  cto_criticism: string;
  ceo_criticism: string;
  mvp_consensus: string;
}

interface CompetitorInfo {
  name: string;
  weakness: string;
  our_advantage: string;
}

interface CompetitorAnalysis {
  competitors: CompetitorInfo[];
  positioning_strategy: string;
}

interface CostItem {
  name: string;
  amount: number;
  is_recurring: boolean;
}

interface FinancialAnalysis {
  initial_mvp_cost: number;
  monthly_burn_rate: number;
  break_even_months: number;
  costs_breakdown: CostItem[];
}

interface GrowthTactics {
  acquisition_channel: string;
  activation_tactic: string;
  viral_loop: string;
}

interface GrowthAnalysis {
  growth_strategy_title: string;
  funnel_tactics: GrowthTactics;
  recommended_tools: string[];
}

interface LegalRequirement {
  title: string;
  description: string;
  risk_level: string;
}

interface TechnicalRisk {
  risk_name: string;
  mitigation_plan: string;
}

interface LegalAndRiskAnalysis {
  legal_strategy_title: string;
  legal_requirements: LegalRequirement[];
  technical_risks: TechnicalRisk[];
}

// [26. GÜN]: Test Otomasyonu ve QA Şemaları
interface TestCaseResult {
  endpoint: string;
  status: string;
  response_time_ms: number;
  validation_notes: string;
}

interface QAAnalysis {
  test_suite_title: string;
  overall_health_score: number;
  test_cases: TestCaseResult[];
  critical_vulnerabilities: string[];
}

interface MultiAgentData {
  project_title: string;
  cto_report: CTOAnalysis;
  ceo_report: CEOAnalysis;
  synergy_summary: string;
  user_test: UserPersonaAnalysis;
  debate_report: AgentDebateAnalysis;
  competitor_report: CompetitorAnalysis;
  financial_report: FinancialAnalysis;
  growth_report: GrowthAnalysis;
  legal_report: LegalAndRiskAnalysis;
  qa_report: QAAnalysis; // [26. GÜN]
}

interface MultiAgentPanelProps {
  projectTitle: string;
  sector: string;
}

export default function MultiAgentPanel({ projectTitle, sector }: MultiAgentPanelProps) {
  const { language } = useLanguage();
  const [data, setData] = useState<MultiAgentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"cto" | "ceo" | "debate" | "competitor" | "financial" | "growth" | "legal" | "qa" | "user" | "synergy" | "full">("cto");
  
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-purple-50 pb-4">
        <div>
          <h3 className="text-lg font-black text-purple-950 flex items-center gap-2">
            <span>🤝</span> Multi-Agent Sinerji Simülasyonu
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Girişiminiz için CTO, CEO, Pazar, Finans, Growth, Hukuk ve QA/Test otomasyon ajanları ortak çalışır.
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

            {/* Ajan Tartışması */}
            {(activeTab === "debate" || activeTab === "full") && data.debate_report && (
              <div className="space-y-4 pt-4 border-t border-amber-100">
                <h3 className="font-black text-amber-950 text-sm border-l-4 border-amber-500 pl-2">⚔️ Ajanlar Arası Çatışma ve MVP Uzlaşısı</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl relative">
                      <span className="absolute -top-2 left-4 px-2 py-0.5 bg-indigo-600 text-white font-extrabold text-[9px] rounded-full uppercase">CTO'nun Eleştirisi</span>
                      <p className="text-indigo-950 font-medium italic pt-1">"{data.debate_report.cto_criticism}"</p>
                    </div>
                    <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl relative">
                      <span className="absolute -top-2 left-4 px-2 py-0.5 bg-purple-600 text-white font-extrabold text-[9px] rounded-full uppercase">CEO'nun Eleştirisi</span>
                      <p className="text-purple-950 font-medium italic pt-1">"{data.debate_report.ceo_criticism}"</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-2xl">
                    <h4 className="font-black text-amber-950 text-xs mb-2 flex items-center gap-1.5">
                      <span>🤝</span> Ortak Yönetim Kurulu Kararı: Nihai MVP Yol Haritası
                    </h4>
                    <p className="text-amber-900 font-semibold leading-relaxed">{data.debate_report.mvp_consensus}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rekabet Analizi */}
            {(activeTab === "competitor" || activeTab === "full") && data.competitor_report && (
              <div className="space-y-4 pt-4 border-t border-cyan-100">
                <h3 className="font-black text-cyan-950 text-sm border-l-4 border-cyan-500 pl-2">📊 Sektörel Rekabet Analizi & Konumlandırma</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.competitor_report.competitors.map((comp, i) => (
                      <div key={i} className="bg-white border border-cyan-50 p-4 rounded-2xl space-y-2.5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <h4 className="font-black text-cyan-900 text-xs">🚀 Rakip: {comp.name}</h4>
                          <span className="text-[10px] bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-bold">Alternatif</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">⚠️ En Zayıf Noktası:</span>
                          <p className="text-slate-600 italic">"{comp.weakness}"</p>
                        </div>
                        <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50 space-y-1">
                          <span className="text-[10px] text-emerald-800 font-bold block">🛡️ Bizim Haksız Avantajımız (Moat):</span>
                          <p className="text-emerald-950 font-medium">{comp.our_advantage}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-200 p-5 rounded-2xl">
                    <h4 className="font-black text-cyan-950 text-xs mb-2 flex items-center gap-1.5">
                      <span>🎯</span> Mavi Okyanus Konumlandırma Stratejimiz
                    </h4>
                    <p className="text-cyan-900 font-semibold leading-relaxed">{data.competitor_report.positioning_strategy}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Finansal Analiz */}
            {(activeTab === "financial" || activeTab === "full") && data.financial_report && (
              <div className="space-y-4 pt-4 border-t border-emerald-100">
                <h3 className="font-black text-emerald-950 text-sm border-l-4 border-emerald-500 pl-2">💰 Finansal Öngörü ve Bütçeleme Raporu</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-2xl text-center">
                      <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Tahmini MVP Kurulum Maliyeti</span>
                      <span className="text-2xl font-black text-emerald-950 block mt-1">${data.financial_report.initial_mvp_cost}</span>
                    </div>
                    <div className="bg-rose-50/40 border border-rose-100 p-4 rounded-2xl text-center">
                      <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">Aylık Operasyon Gideri (Burn Rate)</span>
                      <span className="text-2xl font-black text-rose-950 block mt-1">${data.financial_report.monthly_burn_rate}/ay</span>
                    </div>
                    <div className="bg-blue-50/40 border border-blue-100 p-4 rounded-2xl text-center">
                      <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider block">Başa Baş Noktası (Break-Even)</span>
                      <span className="text-2xl font-black text-blue-950 block mt-1">{data.financial_report.break_even_months} Ay</span>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-100/50 border-b border-slate-100 flex justify-between items-center">
                      <h4 className="font-bold text-slate-900 text-xs">📋 Detaylı Gider Kalemleri Dağılımı</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-extrabold">
                            <th className="p-3 pl-4">Gider Açıklaması</th>
                            <th className="p-3 text-center">Tür</th>
                            <th className="p-3 text-right pr-4">Tahmini Tutar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-medium">
                          {data.financial_report.costs_breakdown.map((cost, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="p-3 pl-4 text-slate-900 font-bold">{cost.name}</td>
                              <td className="p-3 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                                  cost.is_recurring ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                                }`}>
                                  {cost.is_recurring ? "Her Ay Düzenli" : "Tek Seferlik"}
                                </span>
                              </td>
                              <td className="p-3 text-right pr-4 text-slate-950 font-black">${cost.amount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Büyüme Planı */}
            {(activeTab === "growth" || activeTab === "full") && data.growth_report && (
              <div className="space-y-4 pt-4 border-t border-orange-100">
                <h3 className="font-black text-orange-950 text-sm border-l-4 border-orange-500 pl-2">📈 Growth Hacking & Organik Büyüme Stratejisi</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-100 p-4 rounded-2xl">
                    <span className="text-[9px] font-extrabold uppercase text-orange-700 tracking-wider">Tavsiye Edilen Büyüme Stratejisi</span>
                    <h4 className="text-md font-black text-orange-950 mt-0.5">{data.growth_report.growth_strategy_title}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[10px] text-orange-700 font-extrabold uppercase block">📣 1. Kullanıcı Edinme (Acquisition)</span>
                      <p className="text-slate-600 font-medium leading-relaxed">{data.growth_report.funnel_tactics.acquisition_channel}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[10px] text-orange-700 font-extrabold uppercase block">⚡ 2. Aktivasyon (Aha Moment)</span>
                      <p className="text-slate-600 font-medium leading-relaxed">{data.growth_report.funnel_tactics.activation_tactic}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[10px] text-orange-700 font-extrabold uppercase block">🔄 3. Viral Çark (Referral Loop)</span>
                      <p className="text-slate-600 font-medium leading-relaxed">{data.growth_report.funnel_tactics.viral_loop}</p>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-2xl text-slate-100 space-y-3">
                    <h4 className="font-extrabold text-[10px] text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span>🛠️</span> Pazarlama Otomasyonu & Analitik Stack Önerisi
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.growth_report.recommended_tools.map((tool, i) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl font-bold text-xs text-orange-300">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hukuki Uyumluluk */}
            {(activeTab === "legal" || activeTab === "full") && data.legal_report && (
              <div className="space-y-4 pt-4 border-t border-rose-100">
                <h3 className="font-black text-rose-950 text-sm border-l-4 border-rose-500 pl-2">⚖️ Hukuki Uyumluluk & Teknik Risk Analizi</h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-rose-500/10 to-red-500/10 border border-rose-100 p-4 rounded-2xl">
                    <span className="text-[9px] font-extrabold uppercase text-rose-700 tracking-wider">Yasal Koruma Kalkanı Stratejisi</span>
                    <h4 className="text-md font-black text-rose-950 mt-0.5">{data.legal_report.legal_strategy_title}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-950 text-xs flex items-center gap-1">📜 KVKK / GDPR ve Sözleşme Zorunlulukları</h4>
                      {data.legal_report.legal_requirements.map((req, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-4 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <h5 className="font-bold text-slate-900 text-xs">{req.title}</h5>
                            <span className={`px-2 py-0.5 text-[8px] border font-extrabold rounded-full uppercase ${getRiskBadgeColor(req.risk_level)}`}>
                              Ceza Riski: {req.risk_level}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed font-medium">{req.description}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-950 text-xs flex items-center gap-1">🛡️ Kritik Teknik Risk Azaltma (Mitigation)</h4>
                      {data.legal_report.technical_risks.map((risk, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-4 rounded-xl space-y-2">
                          <h5 className="font-bold text-rose-950 text-xs flex items-center gap-1">⚠️ {risk.risk_name}</h5>
                          <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/50 space-y-0.5">
                            <span className="text-[9px] text-emerald-800 font-bold block">💡 Çözüm Planı:</span>
                            <p className="text-emerald-950 font-medium leading-relaxed">{risk.mitigation_plan}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* [26. GÜN]: Test Otomasyonu ve QA Paneli */}
            {(activeTab === "qa" || activeTab === "full") && data.qa_report && (
              <div className="space-y-4 pt-4 border-t border-teal-100">
                <h3 className="font-black text-teal-950 text-sm border-l-4 border-teal-500 pl-2">🧪 Test Otomasyonu & QA Sistem Kalite Raporu</h3>
                <div className="space-y-4">
                  {/* Başlık ve Skor Kartı */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-100 p-4 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase text-teal-700 tracking-wider">Aktif Test Süiti</span>
                        <h4 className="text-sm font-black text-teal-950 mt-0.5">{data.qa_report.test_suite_title}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">
                        API şemaları, SQLite entegrasyonu ve cooldown zamanlayıcıları her simülasyon öncesinde otomatik olarak denetlenir.
                      </p>
                    </div>

                    <div className="md:col-span-4 bg-teal-950 text-white p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-teal-300">Genel Sağlık Skoru</span>
                      <span className="text-4xl font-black text-emerald-400 mt-1">{data.qa_report.overall_health_score}%</span>
                      <span className="text-[8px] text-teal-200/70 mt-1 font-semibold">Sistem Kararlılığı: Yüksek</span>
                    </div>
                  </div>

                  {/* Koşturulan Test Senaryoları */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs">🚀 Koşturulan Entegrasyon Test Senaryoları</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {data.qa_report.test_cases.map((tc, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-4 rounded-xl space-y-2">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> {tc.endpoint}
                            </h5>
                            <div className="flex gap-2 shrink-0">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[8px] font-extrabold rounded-full">
                                {tc.status}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-[8px] font-bold rounded-full">
                                {tc.response_time_ms}ms
                              </span>
                            </div>
                          </div>
                          <p className="text-slate-600 font-medium leading-relaxed">{tc.validation_notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kritik Açıklar / İyileştirmeler */}
                  <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                    <h4 className="font-black text-rose-950 text-xs mb-2 flex items-center gap-1.5">
                      <span>⚠️</span> Önerilen Kritik İyileştirmeler & QA Geri Bildirimi
                    </h4>
                    <ul className="list-disc pl-4 space-y-1.5 text-rose-900 font-medium">
                      {data.qa_report.critical_vulnerabilities.map((vuln, i) => (
                        <li key={i}>{vuln}</li>
                      ))}
                    </ul>
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