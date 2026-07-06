"use client";

import { useState, useEffect } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api";

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

interface EvaluationResponse {
  user_idea: string;
  market_score: number;
  technical_score: number;
  strengths: string[];
  weaknesses: string[];
  competitors_advice: string;
  final_verdict: string;
}

interface MediumResponse {
  target_topic: string;
  suggested_titles: string[];
  article_outline: string;
  tags: string[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"projects" | "radar" | "evaluate" | "medium">("projects");

  // State Yönetimleri
  const [sector, setSector] = useState("");
  const [sectorData, setSectorData] = useState<SectorResponse | null>(null);
  const [sectorLoading, setSectorLoading] = useState(false);

  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [roadmapData, setRoadmapData] = useState<RoadmapResponse | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  const [radarData, setRadarData] = useState<RadarResponse | null>(null);
  const [radarLoading, setRadarLoading] = useState(false);

  const [idea, setIdea] = useState("");
  const [evaluationData, setEvaluationData] = useState<EvaluationResponse | null>(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);

  const [mediumTopic, setMediumTopic] = useState("");
  const [mediumData, setMediumData] = useState<MediumResponse | null>(null);
  const [mediumLoading, setMediumLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "radar" && !radarData) {
      fetchRadar();
    }
  }, [activeTab]);

  // API Bağlantıları
  const fetchProjects = async () => {
    if (!sector) return;
    setSectorLoading(true);
    setSectorData(null);
    setSelectedProject(null);
    setRoadmapData(null);
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${sector}`);
      const result = await res.json();
      setSectorData(result);
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
      const result = await res.json();
      setRoadmapData(result);
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
      const result = await res.json();
      setRadarData(result);
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
      const result = await res.json();
      setEvaluationData(result);
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
      const result = await res.json();
      setMediumData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setMediumLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-100/40 text-slate-800 font-sans relative overflow-x-hidden">
      
      {/* ÜST ARKA PLAN SÜS HAVUZLARI */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-purple-300 rounded-full blur-2xl opacity-40 animate-pulse pointer-events-none" />
      <div className="absolute top-40 right-[-50px] w-40 h-40 bg-indigo-300 rounded-full blur-3xl opacity-30 pointer-events-none" />

      {/* --- HEADER --- */}
      <header className="border-b border-purple-100/80 bg-white/75 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-200">
              P
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              PathAI
            </span>
          </div>

          {/* Menü Sekme Butonları */}
          <nav className="flex items-center gap-1 bg-purple-100/60 p-1.5 rounded-2xl border border-purple-100">
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "projects" ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "text-purple-700 hover:bg-purple-100"
              }`}
            >
              💼 Proje Mentorü
            </button>
            <button
              onClick={() => setActiveTab("radar")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "radar" ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "text-purple-700 hover:bg-purple-100"
              }`}
            >
              📡 Canlı Radar
            </button>
            <button
              onClick={() => setActiveTab("evaluate")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "evaluate" ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "text-purple-700 hover:bg-purple-100"
              }`}
            >
              ⚖️ Fikir Eleştirmeni
            </button>
            <button
              onClick={() => setActiveTab("medium")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "medium" ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "text-purple-700 hover:bg-purple-100"
              }`}
            >
              ✍️ Medium Asistanı
            </button>
          </nav>

          <div className="flex gap-3">
            <button className="px-5 py-2 rounded-xl text-sm font-bold text-purple-700 hover:bg-purple-50 transition-colors">
              Giriş Yap
            </button>
            <button className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white transition-all shadow-md shadow-purple-200">
              Kayıt Ol
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO / HOŞ GELDİN ALANI (Görsel 1 Temsili Kahraman Bölümü) --- */}
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

        {/* SAĞ TARAF: BİRİNCİ MASKOT ALANI (image_ee6d83.png esintili meditasyon karakteri alanı) */}
        <div className="lg:col-span-5 flex justify-center relative">
          <div className="w-64 h-64 md:w-72 md:h-72 rounded-[40px] bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-2xl shadow-purple-300 relative flex items-center justify-center border-4 border-white transform hover:rotate-2 transition-transform overflow-hidden">
            
            {/* Arka plandaki kırpılmış karakteri yerel dosyadan çağıran etiket */}
            {/* NOT: public/images/hero-avatar.png yoluna image_ee6d83.png görselini koyabilirsin */}
            <img 
              src="/images/hero-avatar.png" 
              alt="AI Meditasyon Mentörü"
              className="w-full h-full object-cover scale-110"
              onError={(e) => {
                // Eğer resim henüz yerel klasörde yoksa emoji maskot yedek olarak gösterilsin
                e.currentTarget.style.display = "none";
                const backup = document.getElementById("hero-backup");
                if (backup) backup.style.display = "block";
              }}
            />
            
            <div id="hero-backup" style={{ display: "none" }} className="text-center space-y-2">
              <div className="text-8xl drop-shadow-2xl select-none animate-pulse">💡</div>
              <div className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-purple-950 text-xs font-black rounded-full shadow-md">
                PathAI Baş Danışmanı
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- ANA PANELDEN BARKOD / İÇERİK BÖLÜMÜ --- */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* PANEL 1: PROJE MENTÖRÜ & YOL HARİTASI */}
        {activeTab === "projects" && (
          <div className="space-y-12">
            <div className="bg-purple-900 text-white rounded-[32px] p-8 shadow-2xl shadow-purple-900/10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 text-center md:text-left space-y-2">
                <h2 className="text-2xl font-black">🔍 Sektörel Analiz</h2>
                <p className="text-purple-200 text-xs leading-relaxed">Çalışmak istediğin alanı gir, yapay zeka ajanları pazar fikirlerini anında derlesin.</p>
              </div>
              <div className="md:col-span-8 flex gap-3 bg-white/10 p-2.5 rounded-2xl border border-white/10">
                <input
                  type="text"
                  placeholder="e-commerce, finance, logistics, health..."
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white text-slate-800 focus:outline-none font-bold text-sm"
                />
                <button
                  onClick={fetchProjects}
                  disabled={sectorLoading}
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-md transition-all shrink-0"
                >
                  {sectorLoading ? "Düşünülüyor..." : "Fikirleri Ara"}
                </button>
              </div>
            </div>

            {/* Proje Kartları (Arama sonuçlarında image_ee6da3.png laptoplu karakter alanı) */}
            {sectorData && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-2 border-purple-100">
                  <h2 className="text-xl font-black text-purple-950 flex items-center gap-2">
                    <span>🎓</span> Seçilen Alan: {sectorData.sector.toUpperCase()}
                  </h2>
                  
                  {/* Küçük Laptoplu Karakter Rozeti (image_ee6da3.png esintisi) */}
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
                            {project.difficulty}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">{project.description}</p>
                        <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-100/50">
                          <p className="text-purple-950 text-[11px] font-bold flex items-center gap-1"><span>💡</span> Neden Bu Proje?</p>
                          <p className="text-purple-800 text-[11px] mt-0.5 leading-normal">{project.why_this}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => fetchRoadmap(project.title)}
                        className="mt-5 w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-extrabold text-xs transition-all border border-purple-200/40"
                      >
                        Mühendislik Haritasını İncele →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Yol Haritası Gösterimi */}
            {roadmapData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
                <div className="bg-gradient-to-b from-purple-950 to-indigo-950 text-white p-6 rounded-[32px] space-y-6 shadow-xl">
                  <h3 className="text-lg font-black tracking-tight border-b border-white/10 pb-2 flex items-center gap-2">
                    <span>⚙️</span> Yapısal Mimari Katmanları
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

                <div className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-purple-100 shadow-xl space-y-6">
                  <h3 className="text-lg font-black text-purple-950 border-b border-purple-100 pb-2 flex items-center gap-2">
                    <span>📅</span> 5 Günlük Geliştirme Rotası
                  </h3>
                  <div className="space-y-6 relative border-l-2 border-purple-100 pl-4 ml-2">
                    {roadmapData.learning_roadmap.map((day, i) => (
                      <div key={i} className="relative space-y-1">
                        <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-purple-600 ring-4 ring-purple-100" />
                        <h4 className="text-sm font-bold text-purple-950">
                          {day.day_number}. Gün: <span className="text-purple-700">{day.topic}</span>
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
        )}

        {/* PANEL 2: CANLI TREND RADARI (Dürbünlü Kitap Kulesi image_ee7167.png esintisi) */}
        {activeTab === "radar" && (
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

            {radarData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GitHub Kutusu */}
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

                {/* Hugging Face Kutusu */}
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
        )}

        {/* PANEL 3: FİKİR ELEŞTİRMENİ (Fikir tartışan ikili grup image_ee6e5d.png esintisi) */}
        {activeTab === "evaluate" && (
          <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 overflow-hidden flex items-center justify-center shrink-0">
                <img 
                  src="/images/evaluator-team.png" 
                  alt="Değerlendirme Takımı" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><text y='20' font-size='20'>👥</text></svg>"; }}
                />
              </div>
              <div>
                <h1 className="text-2xl font-black text-purple-950">Girişim ve Fikir Oylama Simülasyonu</h1>
                <p className="text-slate-500 text-xs">Aklındaki ham fikri ekibe sun, pazar ve kod uygulanabilirlik katsayılarını rasyonelce ölçsünler.</p>
              </div>
            </div>

            <div className="bg-white border border-purple-100 rounded-3xl p-4 shadow-xl flex gap-3">
              <input
                type="text"
                placeholder="Örn: Akıllı kameralarla lojistik depolarında paket hasar tespiti yapan yapay zeka..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-50/30 border border-purple-100 focus:outline-none focus:border-purple-500 font-bold text-xs"
              />
              <button
                onClick={fetchEvaluation}
                disabled={evaluationLoading}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shrink-0"
              >
                {evaluationLoading ? "Hesaplanıyor..." : "Fikri Gönder"}
              </button>
            </div>

            {evaluationData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white p-6 rounded-2xl text-center shadow-md">
                    <span className="text-[10px] uppercase text-purple-200 font-bold">Pazar Skoru</span>
                    <div className="text-3xl font-black mt-1">{evaluationData.market_score} / 10</div>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white p-6 rounded-2xl text-center shadow-md">
                    <span className="text-[10px] uppercase text-indigo-200 font-bold">Teknik Fizibilite</span>
                    <div className="text-3xl font-black mt-1">{evaluationData.technical_score} / 10</div>
                  </div>
                </div>

                <div className="md:col-span-2 bg-white border border-purple-100 rounded-3xl p-6 shadow-md space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl">
                      <h4 className="font-bold text-emerald-900 text-xs">🟢 Güçlü Yönler</h4>
                      <ul className="list-disc pl-4 text-[11px] text-emerald-800 space-y-1 mt-1.5">
                        {evaluationData.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="bg-rose-50/60 border border-rose-100 p-4 rounded-xl">
                      <h4 className="font-bold text-rose-900 text-xs">🔴 Teknik Zayıflıklar</h4>
                      <ul className="list-disc pl-4 text-[11px] text-rose-800 space-y-1 mt-1.5">
                        {evaluationData.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div className="border-t border-purple-50 pt-2 text-xs">
                    <h4 className="font-bold text-purple-950">🏁 Rekabet Stratejisi:</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">{evaluationData.competitors_advice}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <h4 className="font-bold text-purple-900 text-xs">📢 Nihai Değerlendirme:</h4>
                    <p className="text-[11px] text-purple-800 leading-relaxed mt-0.5 font-bold">{evaluationData.final_verdict}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANEL 4: MEDIUM İÇERİK ASİSTANI (Kitap basamaklı merdiven illüstrasyonu image_ee7187.png esintisi) */}
        {activeTab === "medium" && (
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
                <h1 className="text-2xl font-black text-purple-950">Medium Topluluk Editör Ajanı</h1>
                <p className="text-slate-500 text-xs">Yazı konunu belirle; bilgi basamaklarını tırmandıracak kancalı başlıklar ve zengin Markdown şablonları üretilsin.</p>
              </div>
            </div>

            <div className="bg-white border border-purple-100 rounded-3xl p-4 shadow-xl flex gap-3">
              <input
                type="text"
                placeholder="Örn: FastAPI mimarisinde Pydantic v2 validasyon kural yönetimi..."
                value={mediumTopic}
                onChange={(e) => setMediumTopic(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-50/30 border border-purple-100 focus:outline-none focus:border-purple-500 font-bold text-xs"
              />
              <button
                onClick={fetchMediumStrategy}
                disabled={mediumLoading}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md shrink-0"
              >
                {mediumLoading ? "Derleniyor..." : "Yazıyı Planla"}
              </button>
            </div>

            {mediumData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="space-y-4">
                  <div className="bg-white border border-purple-100 p-4 rounded-2xl shadow-sm space-y-2">
                    <h4 className="font-bold text-purple-950 text-xs border-b pb-1">🪝 Önerilen Başlık Taslakları</h4>
                    <div className="space-y-1.5">
                      {mediumData.suggested_titles.map((title, i) => (
                        <div key={i} className="text-[11px] p-2 rounded-lg bg-purple-50 text-purple-950 font-bold leading-normal">
                          📌 {title}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-purple-100 p-4 rounded-2xl shadow-sm space-y-1.5">
                    <h4 className="font-bold text-purple-950 text-xs border-b pb-1">🏷️ Sosyal Medya Etiketleri</h4>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {mediumData.tags.map((tag, i) => (
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
        )}
      </main>
    </div>
  );
}