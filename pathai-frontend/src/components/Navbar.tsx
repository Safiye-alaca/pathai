"use client";

import React from "react";
import { useLanguage } from "../context/LanguageContext"; // Kesin çalışan göreli import yolu

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: "projects" | "radar" | "evaluate" | "medium") => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  // 12. Gün: Dil sözlüğünü ve durumunu context'ten çekiyoruz
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="border-b border-purple-100/80 bg-white/75 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo / Marka */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-200">
            P
          </div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
            PathAI
          </span>
        </div>

        {/* Çoklu Dile Duyarlı Menü Sekmeleri */}
        <nav className="flex items-center gap-1 bg-purple-100/60 p-1.5 rounded-2xl border border-purple-100">
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "projects" ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "text-purple-700 hover:bg-purple-100"
            }`}
          >
            {t.navbar.projects}
          </button>
          <button
            onClick={() => setActiveTab("radar")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "radar" ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "text-purple-700 hover:bg-purple-100"
            }`}
          >
            {t.navbar.radar}
          </button>
          <button
            onClick={() => setActiveTab("evaluate")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "evaluate" ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "text-purple-700 hover:bg-purple-100"
            }`}
          >
            {t.navbar.evaluate}
          </button>
          <button
            onClick={() => setActiveTab("medium")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "medium" ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "text-purple-700 hover:bg-purple-100"
            }`}
          >
            {t.navbar.medium}
          </button>
        </nav>

        {/* Sağ Alan: Üyelik Butonları ve Dil Seçici Bir Arada */}
        <div className="flex items-center gap-4">
          
          {/* 🌐 12. Gün: Şık TR/EN Dil Seçim Buton Grubu */}
          <div className="flex items-center gap-1 bg-purple-100/50 p-1 rounded-xl border border-purple-200/40">
            <button
              onClick={() => setLanguage("tr")}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all ${
                language === "tr"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-purple-700/70 hover:bg-purple-100"
              }`}
            >
              TR
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all ${
                language === "en"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-purple-700/70 hover:bg-purple-100"
              }`}
            >
              EN
            </button>
          </div>

          {/* Giriş Yap / Kayıt Ol Butonları */}
          <div className="flex gap-3">
            <button className="px-5 py-2 rounded-xl text-sm font-bold text-purple-700 hover:bg-purple-50 transition-colors">
              Giriş Yap
            </button>
            <button className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white transition-all shadow-md shadow-purple-200">
              Kayıt Ol
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}