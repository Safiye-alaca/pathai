"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import MentorPanel from "../components/MentorPanel";
import RadarPanel from "../components/RadarPanel";
import EvaluatePanel from "../components/EvaluatePanel";
import MediumPanel from "../components/MediumPanel";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"projects" | "radar" | "evaluate" | "medium">("projects");

  // Proje Mentorü State'leri
  const [sector, setSector] = useState("");
  const [sectorData, setSectorData] = useState(null);
  const [sectorLoading, setSectorLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  // Canlı Radar State'leri
  const [radarData, setRadarData] = useState(null);
  const [radarLoading, setRadarLoading] = useState(false);

  // Fikir Eleştirmeni State'leri
  const [idea, setIdea] = useState("");
  const [evaluationData, setEvaluationData] = useState(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);

  // Medium Asistanı State'leri
  const [mediumTopic, setMediumTopic] = useState("");
  const [mediumData, setMediumData] = useState(null);
  const [mediumLoading, setMediumLoading] = useState(false);

  // API Fonksiyonları
  const fetchProjects = async () => {
    if (!sector) return;
    setSectorLoading(true);
    setSectorData(null);
    setSelectedProject(null);
    setRoadmapData(null);
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${sector}`);
      setSectorData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setSectorLoading(false);
    }
  };

  const fetchRoadmap = async (title: string) => {
    setSelectedProject(title);
    setRoadmapLoading(true);
    setRoadmapData(null);
    try {
      const res = await fetch(`${API_BASE_URL}/roadmap/${encodeURIComponent(title)}`);
      setRoadmapData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setRoadmapLoading(false);
    }
  };

  const fetchRadar = async () => {
    setRadarLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/radar`);
      setRadarData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setRadarLoading(false);
    }
  };

  const fetchEvaluation = async () => {
    if (!idea) return;
    setEvaluationLoading(true);
    setEvaluationData(null);
    try {
      const res = await fetch(`${API_BASE_URL}/evaluate?idea=${encodeURIComponent(idea)}`);
      setEvaluationData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluationLoading(false);
    }
  };

  const fetchMediumStrategy = async () => {
    if (!mediumTopic) return;
    setMediumLoading(true);
    setMediumData(null);
    try {
      const res = await fetch(`${API_BASE_URL}/content-assistant?topic=${encodeURIComponent(mediumTopic)}`);
      setMediumData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setMediumLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-100/40 text-slate-800 font-sans relative overflow-x-hidden">
      
      {/* Arka Plan Küre Efektleri */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-purple-300 rounded-full blur-2xl opacity-40 animate-pulse pointer-events-none" />
      <div className="absolute top-40 right-[-50px] w-40 h-40 bg-indigo-300 rounded-full blur-3xl opacity-30 pointer-events-none" />

      {/* Üst Menü */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Sabit Karşılama Alanı (Hero Section) */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 animate-pulse">
            ✨ Akıllı AI Ajanları Aktif Hale Getirildi
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-purple-950 leading-tight">
            Geleceğin Yeteneklerini <br />
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Yeni ve Benzersiz Bir Yolla</span> Geliştir!
          </h1>
          <p className="text-slate-500 text-base max-w-xl leading-relaxed">
            PathAI platformu ile yapay zeka projelerini tasarla, yazılım mimarını çıkar ve öğrenme rotanı adım adım eğlenceli 3D mentorluk dünyasıyla yönet.
          </p>
        </div>

        <div className="lg:col-span-5 flex justify-center relative">
          <div className="w-64 h-64 md:w-72 md:h-72 rounded-[40px] bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-2xl shadow-purple-300 relative flex items-center justify-center border-4 border-white transform hover:rotate-2 transition-transform overflow-hidden">
            <img 
              src="/images/hero-avatar.png" 
              alt="AI Meditasyon Mentörü"
              className="w-full h-full object-cover scale-110"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const backup = document.getElementById("hero-backup");
                if (backup) backup.style.display = "block";
              }}
            />
            <div id="hero-backup" style={{ display: "none" }} className="text-center space-y-2">
              <div className="text-8xl drop-shadow-2xl select-none animate-pulse">💡</div>
            </div>
          </div>
        </div>
      </section>

      {/* Dinamik Sekme İçerikleri */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "projects" && (
          <MentorPanel
            sector={sector}
            setSector={setSector}
            sectorData={sectorData}
            sectorLoading={sectorLoading}
            selectedProject={selectedProject}
            roadmapData={roadmapData}
            roadmapLoading={roadmapLoading}
            fetchProjects={fetchProjects}
            fetchRoadmap={fetchRoadmap}
          />
        )}

        {activeTab === "radar" && (
          <RadarPanel
            radarData={radarData}
            radarLoading={radarLoading}
            fetchRadar={fetchRadar}
          />
        )}

        {activeTab === "evaluate" && (
          <EvaluatePanel
            idea={idea}
            setIdea={setIdea}
            evaluationData={evaluationData}
            evaluationLoading={evaluationLoading}
            fetchEvaluation={fetchEvaluation}
          />
        )}

        {activeTab === "medium" && (
          <MediumPanel
            mediumTopic={mediumTopic}
            setMediumTopic={setMediumTopic}
            mediumData={mediumData}
            mediumLoading={mediumLoading}
            fetchMediumStrategy={fetchMediumStrategy}
          />
        )}
      </main>
    </div>
  );
}