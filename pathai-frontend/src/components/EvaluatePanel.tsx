"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

interface EvaluationResponse {
  user_idea: string;
  market_score: number;
  technical_score: number;
  strengths: string[];
  weaknesses: string[];
  competitors_advice: string;
  final_verdict: string;
}

interface ProjectSuggestion {
  title: string;
  short_desc: string;
  difficulty: string;
}

interface HistoryItem {
  id: number;
  mode: "startup" | "dev";
  user_input: string;
  ai_response: any;
  created_at: string;
}

interface EvaluatePanelProps {
  idea: string;
  setIdea: (val: string) => void;
  evaluationData: EvaluationResponse | null;
  evaluationLoading: boolean;
  fetchEvaluation: () => void;
}

export default function EvaluatePanel({ idea, setIdea }: EvaluatePanelProps) {
  const { t, language } = useLanguage();

  const [mode, setMode] = useState<"startup" | "dev">("startup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 11. Gün: Geçmiş Takip State'leri
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Modlara özel dinamik sonuç state'leri
  const [startupData, setStartupData] = useState<any>(null);
  const [devData, setDevData] = useState<any>(null);

  // Proje Öneri Mekanizması State'leri
  const [showSuggester, setShowSuggester] = useState(false);
  const [selectedArea, setSelectedArea] = useState("E-Ticaret");
  const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  // Bileşen yüklendiğinde geçmiş verileri veri tabanından çekelim
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/evaluation-history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Geçmiş yüklenirken hata:", err);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setMode(item.mode);
    setIdea(item.user_input);
    if (item.mode === "startup") {
      setStartupData(item.ai_response);
      setDevData(null);
    } else {
      setDevData(item.ai_response);
      setStartupData(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAction = async () => {
    if (!idea.trim()) return;

    setLoading(true);
    setError(null);
    setStartupData(null);
    setDevData(null);

    const endpoint = mode === "startup"
      ? `http://127.0.0.1:8000/api/evaluate?idea=${encodeURIComponent(idea)}&lang=${language}`
      : `http://127.0.0.1:8000/api/evaluate-dev?project=${encodeURIComponent(idea)}&lang=${language}`;
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(language === "tr" ? "Ajanlar analiz yaparken bir hata oluşturdu." : "An error occurred while agents were analyzing.");
      const data = await res.json();

      if (mode === "startup") {
        setStartupData(data);
      } else {
        setDevData(data);
      }

      fetchHistory();
    } catch (err: any) {
      setError(err.message || "Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectSuggestions = async () => {
    setSuggestionLoading(true);
    setError(null);
    try {
      // url sonuna &lang=${language} parametresi eklendi
      const res = await fetch(`http://127.0.0.1:8000/api/suggest-projects?area=${encodeURIComponent(selectedArea)}&lang=${language}`);
      if (!res.ok) throw new Error(language === "tr" ? "Öneri ajanı şu an yanıt vermiyor." : "Suggestion agent is not responding right now.");
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSuggestionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Üst Başlık ve Mod Seçimi */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 overflow-hidden flex items-center justify-center shrink-0">
            <img 
              src="/images/evaluator-team.png" 
              alt="Değerlendirme Takımı" 
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><text y='20' font-size='20'>👥</text></svg>"; }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-purple-950">{t.evaluatePanel.title}</h1>
            <p className="text-slate-500 text-xs">{t.evaluatePanel.desc}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          {mode === "dev" && (
            <button
              onClick={() => {
                setShowSuggester(!showSuggester);
                if (!showSuggester && suggestions.length === 0) fetchProjectSuggestions();
              }}
              className="text-[11px] bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-full font-bold hover:bg-purple-100 transition-all"
            >
              {showSuggester ? t.evaluatePanel.buttonCloseSuggestions : t.evaluatePanel.buttonNoIdea}
            </button>
          )}

          {/* İki Farklı Mod Seçim Butonu */}
          <div className="inline-flex bg-slate-100 p-1 rounded-full border border-slate-200/60">
            <button
              onClick={() => { setMode("startup"); setStartupData(null); setDevData(null); setError(null); setShowSuggester(false); }}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                mode === "startup" ? "bg-purple-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.evaluatePanel.buttonStartupMode}
            </button>
            <button
              onClick={() => { setMode("dev"); setStartupData(null); setDevData(null); setError(null); }}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                mode === "dev" ? "bg-purple-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.evaluatePanel.buttonDevMode}
            </button>
          </div>
        </div>
      </div>

      {/* Akıllı Proje Fikir Kuluçka Modülü */}
      {mode === "dev" && showSuggester && (
        <div className="bg-purple-50/50 border border-purple-100 rounded-3xl p-5 space-y-4 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-purple-950">{t.evaluatePanel.focusArea}</span>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="rounded-xl border border-purple-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="E-Ticaret">{language === "tr" ? "🛒 E-Ticaret" : "🛒 E-Commerce"}</option>
                <option value="Finans (FinTech)">{language === "tr" ? "💳 FinTech / Finans" : "💳 FinTech / Finance"}</option>
                <option value="Yapay Zeka Uygulamaları">{language === "tr" ? "🤖 Yapay Zeka & LLM" : "🤖 AI & LLM Apps"}</option>
                <option value="Siber Güvenlik">{language === "tr" ? "🛡️ Siber Güvenlik" : "🛡️ Cyber Security"}</option>
                <option value="Çevre ve Sosyal Etki">{language === "tr" ? "🌍 Çevre & Sosyal Sorumluluk" : "🌍 Environment & Social Impact"}</option>
              </select>
            </div>
            <button
              onClick={fetchProjectSuggestions}
              disabled={suggestionLoading}
              className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow hover:bg-purple-700 transition-all shrink-0"
            >
              {suggestionLoading ? t.evaluatePanel.loadingSuggestions : t.evaluatePanel.buttonMoreIdeas}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestions.length === 0 && !suggestionLoading ? (
              <p className="text-xs text-slate-400 text-center col-span-2 py-4">{t.evaluatePanel.noSuggestions}</p>
            ) : (
              suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setIdea(`${item.title}: ${item.short_desc}`);
                    setShowSuggester(false);
                  }}
                  className="bg-white border border-purple-100 p-4 rounded-2xl shadow-sm hover:border-purple-400 cursor-pointer transition-all hover:scale-[1.01] group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center gap-2 mb-1.5">
                      <h4 className="font-black text-purple-950 text-xs group-hover:text-purple-600 transition-all">{item.title}</h4>
                      <span className="text-[9px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-black shrink-0">{item.difficulty}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{item.short_desc}</p>
                  </div>
                  <div className="text-[10px] text-purple-600 font-bold text-right pt-2 opacity-0 group-hover:opacity-100 transition-all">
                    {t.evaluatePanel.selectAndAnalyze}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* GEÇMİŞİ AÇMA ŞERİDİ */}
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200/60 p-3 rounded-2xl text-left">
        <span className="text-xs text-slate-500 font-medium">{t.evaluatePanel.historyBanner}</span>
        <button
          onClick={() => {
            setShowHistory(!showHistory);
            if (!showHistory) fetchHistory();
          }}
          className="text-[11px] bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-xl font-black shadow-sm transition-all whitespace-nowrap"
        >
          {showHistory ? t.evaluatePanel.buttonHideHistory : t.evaluatePanel.buttonShowHistory}
        </button>
      </div>

      {/* GEÇMİŞ PANELİ ARAYÜZÜ */}
      {showHistory && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-lg space-y-3 animate-slide-up text-left">
          <h3 className="text-xs font-black text-slate-800">{t.evaluatePanel.historyTitle}</h3>
          {history.length === 0 ? (
            <p className="text-[11px] text-slate-400">{t.evaluatePanel.noHistory}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectHistoryItem(item)}
                  className="p-3 border border-slate-100 hover:border-purple-300 bg-slate-50/50 rounded-xl cursor-pointer transition-all flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        item.mode === "startup" ? "bg-purple-100 text-purple-700" : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {item.mode === "startup" ? "Startup" : "Dev"}
                      </span>
                      <span className="text-[9px] text-slate-400">{item.created_at}</span>
                    </div>
                    <p className="text-slate-700 font-bold text-xs truncate">{item.user_input}</p>
                  </div>
                  <span className="text-[10px] text-purple-600 font-bold mt-2 text-right block hover:underline">{t.evaluatePanel.loadResults}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input Form Alanı */}
      <div className="bg-white border border-purple-100 rounded-3xl p-4 shadow-xl flex gap-3">
        <input
          type="text"
          placeholder={mode === "startup" ? t.evaluatePanel.placeholderStartup : t.evaluatePanel.placeholderDev}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-purple-50/30 border border-purple-100 focus:outline-none focus:border-purple-500 font-bold text-xs"
        />
        <button
          onClick={handleAction}
          disabled={loading || !idea.trim()}
          className={`px-5 py-2.5 rounded-xl text-white font-black text-xs shadow-md shrink-0 transition-all ${
            loading || !idea.trim() ? "bg-purple-300 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {loading ? t.evaluatePanel.loadingSubmit : t.evaluatePanel.buttonSubmit}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-xs font-semibold text-center animate-fade-in">
          {error}
        </div>
      )}

      {/* STARTUP MODU ÇIKTILARI */}
      {startupData && mode === "startup" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-slide-up">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white p-6 rounded-2xl text-center shadow-md">
              <span className="text-[10px] uppercase text-purple-200 font-bold">{t.evaluatePanel.marketScore}</span>
              <div className="text-3xl font-black mt-1">{startupData.market_score} / 10</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white p-6 rounded-2xl text-center shadow-md">
              <span className="text-[10px] uppercase text-indigo-200 font-bold">{t.evaluatePanel.techFeasibility}</span>
              <div className="text-3xl font-black mt-1">{startupData.technical_score} / 10</div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white border border-purple-100 rounded-3xl p-6 shadow-md space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl">
                <h4 className="font-bold text-emerald-900 text-xs">{t.evaluatePanel.strengths}</h4>
                <ul className="list-disc pl-4 text-[11px] text-emerald-800 space-y-1 mt-1.5">
                  {startupData.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div className="bg-rose-50/60 border border-rose-100 p-4 rounded-xl">
                <h4 className="font-bold text-rose-900 text-xs">{t.evaluatePanel.weaknesses}</h4>
                <ul className="list-disc pl-4 text-[11px] text-rose-800 space-y-1 mt-1.5">
                  {startupData.weaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>
            <div className="border-t border-purple-50 pt-2 text-xs">
              <h4 className="font-bold text-purple-950">{t.evaluatePanel.strategyTitle}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">{startupData.competitors_advice}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <h4 className="font-bold text-purple-900 text-xs">{t.evaluatePanel.finalVerdict}</h4>
              <p className="text-[11px] text-purple-800 leading-relaxed mt-0.5 font-bold">{startupData.final_verdict}</p>
            </div>
          </div>
        </div>
      )}

      {/* GELİŞTİRİCİ (DEV) MODU ÇIKTILARI */}
      {devData && mode === "dev" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-slide-up">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white p-6 rounded-2xl text-center shadow-md">
              <span className="text-[10px] uppercase text-purple-200 font-bold">{t.evaluatePanel.techComplexity}</span>
              <div className="text-3xl font-black mt-1">{devData.technical_complexity_score} / 10</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white p-6 rounded-2xl text-center shadow-md">
              <span className="text-[10px] uppercase text-indigo-200 font-bold">{t.evaluatePanel.cvImpact}</span>
              <div className="text-3xl font-black mt-1">{devData.cv_impact_score} / 10</div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white border border-purple-100 rounded-3xl p-6 shadow-md space-y-4">
            <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl">
              <h4 className="font-bold text-purple-950 text-xs mb-2">{t.evaluatePanel.techStack}</h4>
              <div className="flex flex-wrap gap-1.5">
                {devData.recommended_stack?.map((tech: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-white text-purple-700 font-bold rounded border border-purple-100 text-[10px]">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-orange-50/60 border border-orange-100 p-4 rounded-xl">
                <h4 className="font-bold text-orange-900 text-xs">{t.evaluatePanel.challenges}</h4>
                <ul className="list-disc pl-4 text-[11px] text-orange-800 space-y-1 mt-1.5">
                  {devData.engineering_challenges?.map((c: string, i: number) => <li key={i}>{c}</li>)}
                </ul>
              </div>
              <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl">
                <h4 className="font-bold text-indigo-900 text-xs">{t.evaluatePanel.outcomes}</h4>
                <ul className="list-disc pl-4 text-[11px] text-indigo-800 space-y-1 mt-1.5">
                  {devData.learning_outcomes?.map((o: string, i: number) => <li key={i}>{o}</li>)}
                </ul>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl text-slate-50">
              <h4 className="font-bold text-indigo-400 text-xs">{t.evaluatePanel.leadAdvice}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">{devData.final_mentor_verdict}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}