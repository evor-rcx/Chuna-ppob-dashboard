import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
}

export function PageContainer({ title, onBack, children }: PageContainerProps) {
  return (
    <div className="flex-1 bg-white border border-slate-200/80 rounded-[32px] overflow-hidden flex flex-col shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 text-slate-800 min-h-[80vh] stb-accelerated-scroll">
      <div className="px-6 py-4 border-b border-slate-200/70 flex items-center justify-between bg-gradient-to-r from-sky-50/80 via-white to-indigo-50/50">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 -ml-1 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer border border-slate-200/60 shadow-2xs active:scale-95 flex items-center gap-1.5 text-xs font-bold"
            title="Kembali ke Dashboard Utama"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Kembali</span>
          </button>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">{title}</h3>
        </div>
        <div className="text-xs font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono">
          E4 STORE
        </div>
      </div>
      <div className="p-4 sm:p-6 flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
