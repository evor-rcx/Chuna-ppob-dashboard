const fs = require('fs');
let code = fs.readFileSync('src/components/views/Menu.tsx', 'utf8');

// 1. imports
code = code.replace(
  "import { BarChart3, ShoppingCart, FileText, Settings, Bot, Wallet, Users, Store, Lock } from 'lucide-react';",
  "import { BarChart3, ShoppingCart, FileText, Settings, Bot, Wallet, Users, Store, Lock, Activity, Clock, CheckCircle2, XCircle } from 'lucide-react';"
);

code = code.replace(
  "import { ReactNode, useState } from 'react';",
  "import { ReactNode, useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';"
);

// 2. state & effect
const stateTarget = `  const [showPasswordModal, setShowPasswordModal] = useState<Page | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);`;

const stateReplacement = `  const [showPasswordModal, setShowPasswordModal] = useState<Page | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  
  useEffect(() => {
    fetch("/api/transactions")
      .then(res => res.json())
      .then(data => {
        const txs = data.transactions || [];
        setRecentTransactions(txs.slice(0, 5));
        setLoadingTransactions(false);
      })
      .catch(() => {
        setLoadingTransactions(false);
      });
  }, []);`;

code = code.replace(stateTarget, stateReplacement);

// 3. layout classes
code = code.replace(
  `<div className="animate-in fade-in slide-in-from-bottom-2 duration-300">`,
  `<div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col h-full">`
);

code = code.replace(
  `<header className="flex justify-between items-center mb-8">`,
  `<header className="flex justify-between items-center mb-8 shrink-0">`
);

code = code.replace(
  `<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">`,
  `<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 shrink-0">`
);

code = code.replace(
  `className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-2xl flex flex-col items-center gap-3 hover:bg-slate-800/50 transition-all cursor-pointer group relative"`,
  `className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl flex flex-col items-center gap-3 hover:bg-slate-800/60 transition-all cursor-pointer group relative"`
);

// 4. insert widget
const widgetCode = `
      <div className="mt-8 flex-1 flex flex-col min-h-[300px]">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-amber-400" size={20} />
          <h3 className="text-lg font-medium text-white">Aktivitas Transaksi Terkini</h3>
        </div>
        
        <div className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 sm:p-6 flex-1 overflow-hidden relative">
           {loadingTransactions ? (
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-8 h-8 border-4 border-slate-700 border-t-amber-400 rounded-full animate-spin"></div>
             </div>
           ) : recentTransactions.length === 0 ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
               <FileText size={48} className="mb-3 opacity-50" />
               <p>Belum ada transaksi</p>
             </div>
           ) : (
             <div className="flex flex-col gap-3 max-h-full overflow-y-auto pr-2 custom-scrollbar">
               <AnimatePresence>
                 {recentTransactions.map((tx: any, index: number) => (
                   <motion.div
                     key={tx.id || index}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: index * 0.1 }}
                     className="bg-slate-900/40 border border-slate-700/30 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/60 transition-colors"
                   >
                     <div className="flex items-center gap-4">
                       <div className={\`w-10 h-10 rounded-full flex items-center justify-center shrink-0 \${
                          tx.status?.toLowerCase() === 'sukses' ? 'bg-emerald-500/20 text-emerald-400' :
                          tx.status?.toLowerCase() === 'gagal' ? 'bg-rose-500/20 text-rose-400' :
                          'bg-amber-500/20 text-amber-400'
                       }\`}>
                         {tx.status?.toLowerCase() === 'sukses' ? <CheckCircle2 size={20} /> :
                          tx.status?.toLowerCase() === 'gagal' ? <XCircle size={20} /> :
                          <Clock size={20} />}
                       </div>
                       <div>
                         <h4 className="font-medium text-slate-200 text-sm">
                           {typeof tx.product === 'object' ? tx.product?.product_name : (tx.product || 'Produk')}
                         </h4>
                         <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                           <span className="font-mono bg-slate-950 px-1.5 rounded">{tx.target}</span>
                           <span>•</span>
                           <span>{tx.date ? new Date(tx.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                         </div>
                       </div>
                     </div>
                     <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                       <span className="font-semibold text-white text-sm">
                         Rp {(tx.price || 0).toLocaleString('id-ID')}
                       </span>
                       <span className={\`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 \${
                         tx.status?.toLowerCase() === 'sukses' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                         tx.status?.toLowerCase() === 'gagal' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                         'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                       }\`}>
                         {tx.status || 'Pending'}
                       </span>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
           )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: \`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(51, 65, 85, 0.8);
        }
      \`}} />
`;

code = code.replace(
  `      {showPasswordModal && (`,
  widgetCode + `\n      {showPasswordModal && (`
);

fs.writeFileSync('src/components/views/Menu.tsx', code);
console.log("Patched Menu.tsx");
