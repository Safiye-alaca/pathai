"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { tr } from "../dictionaries/tr"; // Kesin çalışan göreli import yolu
import { en } from "../dictionaries/en"; // Kesin çalışan göreli import yolu

type Language = "tr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof tr;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("tr");

  // Seçili dile göre doğru sözlüğü bileşenlere paslıyoruz
  const t = language === "tr" ? tr : en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage bir LanguageProvider içinde kullanılmalıdır.");
  }
  return context;
}