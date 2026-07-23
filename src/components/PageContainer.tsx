import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
}

export function PageContainer({ title, onBack, children }: PageContainerProps) {
  return (
    <div className="flex-1 bg-slate-800/20 border border-slate-700/50 rounded-3xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-4 bg-slate-800/40">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="p-6 flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
