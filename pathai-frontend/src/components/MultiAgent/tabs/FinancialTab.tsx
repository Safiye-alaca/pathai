import React from "react";

interface CostItem {
  name: string;
  amount: number;
  is_recurring: boolean;
}

interface FinancialTabProps {
  report: {
    initial_mvp_cost: number;
    monthly_burn_rate: number;
    break_even_months: number;
    costs_breakdown: CostItem[];
  };
}

export default function FinancialTab({ report }: FinancialTabProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-emerald-100 animate-fade-in">
      <h3 className="font-black text-emerald-950 text-sm border-l-4 border-emerald-500 pl-2">
        💰 Finansal Öngörü ve Bütçeleme Raporu
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-2xl text-center shadow-sm">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
              Tahmini MVP Kurulum Maliyeti
            </span>
            <span className="text-2xl font-black text-emerald-950 block mt-1">
              ${report.initial_mvp_cost}
            </span>
          </div>
          <div className="bg-rose-50/40 border border-rose-100 p-4 rounded-2xl text-center shadow-sm">
            <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">
              Aylık Operasyon Gideri (Burn Rate)
            </span>
            <span className="text-2xl font-black text-rose-950 block mt-1">
              ${report.monthly_burn_rate}/ay
            </span>
          </div>
          <div className="bg-blue-50/40 border border-blue-100 p-4 rounded-2xl text-center shadow-sm">
            <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider block">
              Başa Baş Noktası (Break-Even)
            </span>
            <span className="text-2xl font-black text-blue-950 block mt-1">
              {report.break_even_months} Ay
            </span>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
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
                {report.costs_breakdown.map((cost, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 text-xs">
                    <td className="p-3 pl-4 text-slate-900 font-bold">{cost.name}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                          cost.is_recurring
                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
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
  );
}