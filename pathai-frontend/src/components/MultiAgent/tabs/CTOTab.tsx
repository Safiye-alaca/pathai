import React from "react";

interface CTOTabProps {
  report: {
    software_architecture: string;
    database_design: string;
    security_infrastructure: string;
  };
}

export default function CTOTab({ report }: CTOTabProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="font-black text-purple-950 text-sm border-l-4 border-purple-600 pl-2">
        💻 CTO Teknik Analiz Raporu
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="font-bold text-purple-900 mb-1">🏗️ Yazılım Mimarisi</h4>
          <p className="text-slate-600 font-medium">{report.software_architecture}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="font-bold text-purple-900 mb-1">🗄️ Veri Tabanı Tasarımı</h4>
          <p className="text-slate-600 font-medium">{report.database_design}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h4 className="font-bold text-purple-900 mb-1">🛡️ Güvenlik Altyapısı</h4>
          <p className="text-slate-600 font-medium">{report.security_infrastructure}</p>
        </div>
      </div>
    </div>
  );
}