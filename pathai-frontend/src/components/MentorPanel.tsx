"use client";

import React from "react";
import { useLanguage } from "../context/LanguageContext"; // Kesin çalışan relative yol

interface Project {
  title: string;
  description: string;
  difficulty: string;
  why_this: string;
}

interface SectorResponse {
  sector: string;
  projects: Project[];
}

interface ArchitectureComponent {
  layer: string;
  technology: string;
  reason: string;
}

interface RoadmapDay {
  day_number: number;
  topic: string;
  tasks: string[];
}

interface RoadmapResponse {
  project_title: string;
  architecture_stack: ArchitectureComponent[];
  learning_roadmap: RoadmapDay[];
}

interface MentorPanelProps {
  sector: string;
  setSector: (val: string) => void;
  sectorData: SectorResponse | null;
  sectorLoading: boolean;
  selectedProject: string | null;
  roadmapData: RoadmapResponse | null;
  roadmapLoading: boolean;
  fetchProjects: () => void;
  fetchRoadmap: (title: string) => void;
}

export default function MentorPanel({
  sector,
  setSector,
  sectorData,
  sectorLoading,
  selectedProject,
  roadmapData,
  roadmapLoading,
  fetchProjects,
  fetchRoadmap
}: MentorPanelProps) {

  // 13. Gün: Dil sözlüğünü ve aktif dil bilgisini çekiyoruz
  const { t, language } = useLanguage();

  return (
    <div className="space-y-12">
      {/* Sektörel Analiz Giriş Alanı */}
      <div className="bg-purple-900 text-white rounded-[32px] p-8 shadow-2xl shadow-purple-900/10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-4 text-center md:text-left space-y-2">
          <h2 className="text-2xl font-black">{t.mentorPanel.title}</h2>
          <p className="text-purple-200 text-xs leading-relaxed">{t.mentorPanel.desc}</p>
        </div>
        <div className="md:col-span-8 flex gap-3 bg-white/10 p-2.5 rounded-2xl border border-white/10">
          <input
            type="text"
            placeholder={t.mentorPanel.placeholder}
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-white text-slate-800 focus:outline-none font-bold text-sm"
          />
          <button
            onClick={fetchProjects} // Tetiklendiğinde backend dili algılayacak
            disabled={sectorLoading}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-md transition-all shrink-0"
          >
            {sectorLoading ? t.mentorPanel.loading : t.mentorPanel.buttonSearch}
          </button>
        </div>
      </div>

      {/* Proje Fikirleri Sonuç Listesi */}
      {sectorData && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-2 border-purple-100">
            <h2 className="text-xl font-black text-purple-950 flex items-center gap-2">
              <span>🎓</span> {language === "tr" ? `Seçilen Alan: ${sectorData.sector.toUpperCase()}` : `Selected Sector: ${sectorData.sector.toUpperCase()}`}
            </h2>
            <div className="w-12 h-12 rounded-full border border-purple-200 bg-white overflow-hidden shadow-inner hidden sm:block">
              <img 
                src="/images/laptop-mentor.png" 
                alt="Laptop Mentor" 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><text y='20' font-size='20'>👨‍💻</text></svg>"; }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sectorData.projects.map((project, idx) => (
              <div 
                key={idx}
                className={`p-6 rounded-[28px] bg-white border transition-all flex flex-col justify-between shadow-xl ${
                  selectedProject === project.title ? "border-purple-500 ring-4 ring-purple-100" : "border-purple-100 hover:border-purple-300"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-bold text-purple-950 leading-tight">{project.title}</h3>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-extrabold tracking-wide uppercase shrink-0">
                      {project.difficulty === "ORTA" && language === "en" ? "MEDIUM" : project.difficulty === "ZOR" && language === "en" ? "HARD" : project.difficulty}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{project.description}</p>
                  <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-100/50">
                    <p className="text-purple-950 text-[11px] font-bold flex items-center gap-1">
                      <span>💡</span> {language === "tr" ? "Neden Bu Proje?" : "Why This Project?"}
                    </p>
                    <p className="text-purple-800 text-[11px] mt-0.5 leading-normal">{project.why_this}</p>
                  </div>
                </div>
                <button
                  onClick={() => fetchRoadmap(project.title)}
                  className="mt-5 w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-extrabold text-xs transition-all border border-purple-200/40"
                >
                  {t.mentorPanel.buttonRoadmap} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yükleniyor Göstergesi */}
      {roadmapLoading && (
        <div className="text-center py-12 bg-white rounded-3xl border border-purple-100 shadow-md">
          <div className="text-4xl animate-bounce">🤖</div>
          <p className="text-purple-950 font-black text-sm mt-2">
            {language === "tr" ? "Mimar Ajan şemaları ve eğitim rotasını çiziyor..." : "Architect Agent is drawing schemas and learning route..."}
          </p>
        </div>
      )}

      {/* Mimari Stack ve Geliştirme Haritası Detay Alanı */}
      {roadmapData && !roadmapLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
          {/* Sol Kolon: Yapısal Mimari Katmanları */}
          <div className="bg-gradient-to-b from-purple-950 to-indigo-950 text-white p-6 rounded-[32px] space-y-6 shadow-xl">
            <h3 className="text-lg font-black tracking-tight border-b border-white/10 pb-2 flex items-center gap-2">
              <span>⚙️</span> {language === "tr" ? "Yapısal Mimari Katmanları" : "Structural Architecture Layers"}
            </h3>
            <div className="space-y-4">
              {roadmapData.architecture_stack.map((arch, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">{arch.layer}</span>
                  <h4 className="text-sm font-bold text-white">{arch.technology}</h4>
                  <p className="text-purple-200/70 text-[11px] leading-relaxed pt-0.5">{arch.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ Kolon: Geliştirme Planı */}
          <div className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-purple-100 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-purple-950 border-b border-purple-100 pb-2 flex items-center gap-2">
              <span>📅</span> {t.mentorPanel.roadmapTitle}
            </h3>
            <div className="space-y-6 relative border-l-2 border-purple-100 pl-4 ml-2">
              {roadmapData.learning_roadmap.map((day, i) => (
                <div key={i} className="relative space-y-1">
                  <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                  <h4 className="font-bold text-purple-950 text-sm">
                    {language === "tr" ? `${day.day_number}. Gün:` : `Day ${day.day_number}:`} <span className="text-purple-700">{day.topic}</span>
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {day.tasks.map((task, k) => (
                      <li key={k} className="text-[11px] bg-purple-50/50 p-2 rounded-lg text-slate-600 border border-purple-50 flex items-center gap-1.5">
                        <span className="text-purple-600 font-bold">✓</span> {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}