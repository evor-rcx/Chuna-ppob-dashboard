import { BarChart3, ShoppingCart, FileText, Settings, Bot, Wallet, Users, Store, Lock, ShieldAlert } from 'lucide-react';
import { Page } from '../../types';
import { ReactNode, useState } from 'react';

interface MenuProps {
  onNavigate: (page: Page) => void;
}

export function Menu({ onNavigate }: MenuProps) {
  const [showPasswordModal, setShowPasswordModal] = useState<Page | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  
  const [show2FAField, setShow2FAField] = useState(false);
  const [totpInput, setTotpInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleItemClick = (id: Page) => {
    if (id === 'produk' || id === 'konfig' || id === 'saldo' || id === 'bot' || id === 'security') {
      setShowPasswordModal(id);
      setPasswordInput('');
      setTotpInput('');
      setShow2FAField(false);
      setPasswordError(false);
      setErrorMessage('');
    } else {
      onNavigate(id);
    }
  };

  const verifyPassword = async () => {
    try {
      const res = await fetch('/api/security/warden/auth-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput, totpCode: totpInput })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        if (showPasswordModal) {
          onNavigate(showPasswordModal);
        }
        setShowPasswordModal(null);
      } else if (data.requires2FA) {
        setShow2FAField(true);
        setPasswordError(true);
        setErrorMessage('2FA Aktif: Masukkan 6-digit kode Authenticator / Backup Code');
      } else {
        setPasswordError(true);
        setErrorMessage(data.error || 'Kata sandi salah!');
      }
    } catch (e) {
      // Fallback
      if (passwordInput === 'Eko190497#') {
        if (showPasswordModal) {
          onNavigate(showPasswordModal);
        }
        setShowPasswordModal(null);
      } else {
        setPasswordError(true);
        setErrorMessage('Kata sandi salah!');
      }
    }
  };

  const menuItems: { id: Page; icon: ReactNode; label: string }[] = [
    { id: 'ringkasan', icon: <BarChart3 size={32} />, label: 'Ringkasan' },
    { id: 'produk', icon: <ShoppingCart size={32} />, label: 'Kelola Produk' },
    { id: 'transaksi', icon: <FileText size={32} />, label: 'Transaksi' },
    { id: 'konfig', icon: <Settings size={32} />, label: 'Konfig API' },
    { id: 'bot', icon: <Bot size={32} />, label: 'Bot WA/Tele' },
    { id: 'saldo', icon: <Wallet size={32} />, label: 'Customer Telegram' },
    { id: 'member-offline', icon: <Users size={32} />, label: 'Member Offline' },
    { id: 'kasir-fisik', icon: <Store size={32} />, label: 'Kasir Jualan Fisik' },
    { id: 'security', icon: <ShieldAlert size={32} className="text-indigo-400" />, label: 'Keamanan Super' },
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
              placeholder="Kata Sandi Admin"
              autoFocus
            />

            {show2FAField && (
              <div className="mt-2 mb-2 animate-fadeIn">
                <label className="text-xs text-indigo-300 font-semibold block mb-1">
                  🔑 2FA Authenticator Code (6-digit)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={totpInput}
                  onChange={e => { setTotpInput(e.target.value); setPasswordError(false); }}
                  onKeyDown={e => { if (e.key === 'Enter') verifyPassword(); }}
                  className="w-full bg-slate-950 border border-indigo-500/50 rounded-lg p-3 text-white tracking-widest text-center font-mono font-bold focus:border-indigo-400 outline-none"
                  placeholder="000000"
                  autoFocus
                />
              </div>
            )}

            {passwordError && <p className="text-red-400 text-xs mb-4">{errorMessage || 'Kata sandi salah!'}</p>}
            
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
