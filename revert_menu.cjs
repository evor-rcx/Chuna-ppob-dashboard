const fs = require('fs');
let code = fs.readFileSync('src/components/views/Menu.tsx', 'utf8');

const widgetStart = '      <div className="mt-8 flex-1 flex flex-col min-h-[300px]">';
const widgetEnd = '      `}} />\n';

if (code.includes(widgetStart) && code.includes(widgetEnd)) {
    const startIndex = code.indexOf(widgetStart);
    const endIndex = code.indexOf(widgetEnd) + widgetEnd.length;
    
    code = code.substring(0, startIndex) + code.substring(endIndex);
    
    // Also remove the states and useEffect
    const stateToRemove = `  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
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
    
    code = code.replace(stateToRemove, "");
    
    // Also revert classes
    code = code.replace(
      `<div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col h-full">`,
      `<div className="animate-in fade-in slide-in-from-bottom-2 duration-300">`
    );
    
    code = code.replace(
      `<header className="flex justify-between items-center mb-8 shrink-0">`,
      `<header className="flex justify-between items-center mb-8">`
    );
    
    code = code.replace(
      `<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 shrink-0">`,
      `<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">`
    );
    
    code = code.replace(
      `className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl flex flex-col items-center gap-3 hover:bg-slate-800/60 transition-all cursor-pointer group relative"`,
      `className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-2xl flex flex-col items-center gap-3 hover:bg-slate-800/50 transition-all cursor-pointer group relative"`
    );
    
    // And revert imports
    code = code.replace(
      "import { BarChart3, ShoppingCart, FileText, Settings, Bot, Wallet, Users, Store, Lock, Activity, Clock, CheckCircle2, XCircle } from 'lucide-react';",
      "import { BarChart3, ShoppingCart, FileText, Settings, Bot, Wallet, Users, Store, Lock } from 'lucide-react';"
    );
    
    code = code.replace(
      "import { ReactNode, useState, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';",
      "import { ReactNode, useState } from 'react';"
    );

    fs.writeFileSync('src/components/views/Menu.tsx', code);
    console.log("Reverted Menu.tsx");
} else {
    console.log("Widget code not found");
}
