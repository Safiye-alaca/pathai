"use client";

import React from "react";
import { useLanguage } from "../context/LanguageContext";

interface MediumResponse {
  target_topic: string;
  suggested_titles: string[];
  article_outline: string;
  tags: string[];
}

interface MediumPanelProps {
  mediumTopic: string;
  setMediumTopic: (val: string) => void;
  mediumData: MediumResponse | null;
  mediumLoading: boolean;
  fetchMediumStrategy: () => void;
}

export default function MediumPanel({
  mediumTopic,
  setMediumTopic,
  mediumData,
  mediumLoading,
  fetchMediumStrategy
}: MediumPanelProps) {
  
  // 13. Gün: Dil sözlüğünü aktif ediyoruz
  const { t } = useLanguage();

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
          <img 
            src="/images/book-climb.png" 
            alt="Kitap Tırmanış Asistanı" 
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><text y='20' font-size='20'>📚</text></svg>"; }}
          />
        </div>
        <div>
          <h1 className="text-2xl font-black text-purple-950">{t.mediumPanel.title}</h1>
          <p className="text-slate-500 text-xs">{t.mediumPanel.desc}</p>
        </div>
      </div>

      <div className="bg-white border border-purple-100 rounded-3xl p-4 shadow-xl flex gap-3">
        <input
          type="text"
          placeholder={t.mediumPanel.placeholder}
          value={mediumTopic}
          onChange={(e) => setMediumTopic(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-purple-50/30 border border-purple-100 focus:outline-none focus:border-purple-500 font-bold text-xs"
        />
        <button
          onClick={fetchMediumStrategy}
          disabled={mediumLoading}
          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shrink-0"
        >
          {mediumLoading ? t.mediumPanel.loading : t.mediumPanel.buttonPlan}
        </button>
      </div>

      {mediumData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="space-y-4">
            <div className="bg-white border border-purple-100 p-4 rounded-2xl shadow-sm space-y-2">
              <h4 className="font-bold text-purple-950 text-xs border-b pb-1">{t.mediumPanel.titles}</h4>
              <div className="space-y-1.5">
                {mediumData?.suggested_titles?.map((title, i) => (
                  <div key={i} className="text-[11px] p-2 rounded-lg bg-purple-50 text-purple-950 font-bold leading-normal">
                    📌 {title}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-purple-100 p-4 rounded-2xl shadow-sm space-y-1.5">
              <h4 className="font-bold text-purple-950 text-xs border-b pb-1">{t.mediumPanel.tags}</h4>
              <div className="flex flex-wrap gap-1 pt-1">
                {mediumData?.tags?.map((tag, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-900 text-slate-100 p-5 rounded-[24px] shadow-xl font-mono text-[11px] space-y-2 border border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 text-slate-400">
              <span>📄 ARTICLE_OUTLINE.md</span>
              <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-purple-400 font-bold">MARKDOWN</span>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
              {mediumData.article_outline}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}