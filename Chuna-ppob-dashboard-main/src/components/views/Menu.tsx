import { BarChart3, ShoppingCart, FileText, Settings, Bot, Wallet, Users } from 'lucide-react';
import { Page } from '../../types';
import { ReactNode } from 'react';

interface MenuProps {
  onNavigate: (page: Page) => void;
}

export function Menu({ onNavigate }: MenuProps) {
  const menuItems: { id: Page; icon: ReactNode; label: string }[] = [
    { id: 'ringkasan', icon: <BarChart3 size={32} />, label: 'Ringkasan' },
    { id: 'produk', icon: <ShoppingCart size={32} />, label: 'Kelola Produk' },
    { id: 'transaksi', icon: <FileText size={32} />, label: 'Transaksi' },
    { id: 'konfig', icon: <Settings size={32} />, label: 'Konfig API' },
    { id: 'bot', icon: <Bot size={32} />, label: 'Bot WA/Tele' },
    { id: 'saldo', icon: <Wallet size={32} />, label: 'Saldo Member' },
    { id: 'member-offline', icon: <Users size={32} />, label: 'Member Offline' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white">Menu Utama</h2>
          <p className="text-slate-400 text-sm">Selamat datang kembali, Admin.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700"></div>
        </div>
      </header>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-2xl flex flex-col items-center gap-3 hover:bg-slate-800/50 transition-all cursor-pointer group"
          >
            <div className="text-slate-300 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
