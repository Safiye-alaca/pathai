"use client";

interface EvaluationResponse {
  user_idea: string;
  market_score: number;
  technical_score: number;
  strengths: string[];
  weaknesses: string[];
  competitors_advice: string;
  final_verdict: string;
}

interface EvaluatePanelProps {
  idea: string;
  setIdea: (val: string) => void;
  evaluationData: EvaluationResponse | null;
  evaluationLoading: boolean;
  fetchEvaluation: () => void;
}

export default function EvaluatePanel({
  idea,
  setIdea,
  evaluationData,
  evaluationLoading,
  fetchEvaluation
}: EvaluatePanelProps) {
  return (
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
          <p className="text-slate-500 text-xs">Proje fikrini yaz, pazar ve kod uygulanabilirlik katsayılarını rasyonelce ölçsünler.</p>
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
  );
}