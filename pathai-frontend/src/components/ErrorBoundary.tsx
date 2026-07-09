"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Bir sonraki render'da fallback arayüzünü göstermek için state'i güncelliyoruz
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Burada hatayı backend loglama servislerine (örn: Sentry) gönderebilirsin
    console.error("🚨 PathAI Frontend Hatası Yakalandı:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50/50 border border-red-100 rounded-[24px] text-center space-y-3 max-w-xl mx-auto my-4 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-lg">
            ⚠️
          </div>
          <h2 className="text-sm font-black text-red-950">
            {this.props.fallbackTitle || "Bileşen Yüklenirken Bir Hata Oluştu"}
          </h2>
          <p className="text-slate-500 text-[11px] leading-relaxed max-w-sm mx-auto">
            Yyapay zeka ajanları veya küresel veri hatları şu an yoğun olabilir. Sayfayı yenilemeyi veya daha sonra tekrar denemeyi deneyebilirsiniz.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-1.5 bg-red-600 text-white font-bold text-[10px] rounded-lg shadow hover:bg-red-700 transition-all"
          >
            🔄 Yeniden Dene
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}