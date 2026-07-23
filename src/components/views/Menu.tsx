import { BarChart3, ShoppingCart, FileText, Settings, Bot, Wallet, Users, Store, Lock } from 'lucide-react';
import { Page } from '../../types';
import { ReactNode, useState } from 'react';

interface MenuProps {
  onNavigate: (page: Page) => void;
}

export function Menu({ onNavigate }: MenuProps) {
  const [showPasswordModal, setShowPasswordModal] = useState<Page | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  
  const handleItemClick = (id: Page) => {
    if (id === 'produk' || id === 'konfig' || id === 'saldo' || id === 'bot') {
      setShowPasswordModal(id);
      setPasswordInput('');
      setPasswordError(false);
    } else {
      onNavigate(id);
    }
  };

  const verifyPassword = () => {
    if (passwordInput === 'Eko190497#') {
      if (showPasswordModal) {
        onNavigate(showPasswordModal);
      }
      setShowPasswordModal(null);
    } else {
      setPasswordError(true);
    }
  };

  const menuItems: { id: Page; icon: ReactNode; label: string }[] = [
    { id: 'ringkasan', icon: <BarChart3 size={32} />, label: 'Ringkasan' },
    { id: 'produk', icon: <ShoppingCart size={32} />, label: 'Kelola Produk' },
    { id: 'transaksi', icon: <FileText size={32} />, label: 'Transaksi' },
    { id: 'konfig', icon: <Settings size={32} />, label: 'Konfig API' },
    { id: 'bot', icon: <Bot size={32} />, label: 'Bot WA/Tele' },
    { id: 'saldo', icon: <Wallet size={32} />, label: 'Saldo Member' },
    { id: 'member-offline', icon: <Users size={32} />, label: 'Member Offline' },
    { id: 'kasir-fisik', icon: <Store size={32} />, label: 'Kasir Jualan Fisik' },
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
            onClick={() => handleItemClick(item.id)}
            className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-2xl flex flex-col items-center gap-3 hover:bg-slate-800/50 transition-all cursor-pointer group relative"
          >
            {(item.id === 'produk' || item.id === 'konfig' || item.id === 'saldo' || item.id === 'bot') && (
               <div className="absolute top-3 right-3 text-slate-500 group-hover:text-amber-400 transition-colors">
                  <Lock size={14} />
               </div>
            )}
            <div className="text-slate-300 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
          </button>
        ))}
      </div>
      
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock size={20} className="text-amber-400" /> Keamanan Tambahan
              </h3>
              <button onClick={() => setShowPasswordModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <p className="text-slate-400 text-sm mb-4">Masukkan kata sandi untuk mengakses menu ini.</p>
            
            <input 
              type="password" 
              value={passwordInput}
              onChange={e => { setPasswordInput(e.target.value); setPasswordError(false); }}
              onKeyDown={e => { if (e.key === 'Enter') verifyPassword(); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none mb-2"
              placeholder="Kata Sandi"
              autoFocus
            />
            {passwordError && <p className="text-red-400 text-xs mb-4">Kata sandi salah!</p>}
            
            <div className="flex gap-3 mt-6">
               <button 
                 onClick={() => setShowPasswordModal(null)}
                 className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
               >
                 Batal
               </button>
               <button 
                 onClick={verifyPassword}
                 className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
               >
                 Buka Akses
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
