/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Menu } from './components/views/Menu';
import { Ringkasan } from './components/views/Ringkasan';
import { Produk } from './components/views/Produk';
import { Transaksi } from './components/views/Transaksi';
import { Konfig } from './components/views/Konfig';
import { Bot } from './components/views/Bot';
import { Saldo } from './components/views/Saldo';
import { MemberOffline } from './components/views/MemberOffline';
import { KasirFisik } from './components/views/KasirFisik';
import { Login } from './components/views/Login';
import { Page } from './types';
import { getBgFile } from './lib/bgStore';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('menu');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bgType, setBgType] = useState(localStorage.getItem('chuna_bg_type') || '');
  const [bgUrl, setBgUrl] = useState('');

  useEffect(() => {
    let currentObjectUrl = '';
    const loadBg = async () => {
      const type = localStorage.getItem('chuna_bg_type') || '';
      setBgType(type);
      if (type) {
        try {
          const file = await getBgFile();
          if (file) {
            if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
            currentObjectUrl = URL.createObjectURL(file);
            setBgUrl(currentObjectUrl);
          } else {
            setBgUrl('');
          }
        } catch(e) {
          console.error("Failed to load bg file", e);
          setBgUrl('');
        }
      } else {
        setBgUrl('');
      }
    };
    loadBg();

    const handleBgChange = () => {
      loadBg();
    };
    window.addEventListener('chuna_bg_update', handleBgChange);
    return () => {
       window.removeEventListener('chuna_bg_update', handleBgChange);
       if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('chuna_theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, []);

  useEffect(() => {
    const handleLogout = () => setIsAuthenticated(false);
    window.addEventListener('logout', handleLogout as EventListener);
    return () => window.removeEventListener('logout', handleLogout as EventListener);
  }, []);

  useEffect(() => {
    const auth = sessionStorage.getItem('chuna_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem('chuna_auth', 'true');
    setIsAuthenticated(true);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'menu': return <Menu onNavigate={setCurrentPage} />;
      case 'ringkasan': return <Ringkasan onBack={() => setCurrentPage('menu')} />;
      case 'produk': return <Produk onBack={() => setCurrentPage('menu')} />;
      case 'transaksi': return <Transaksi onBack={() => setCurrentPage('menu')} />;
      case 'konfig': return <Konfig onBack={() => setCurrentPage('menu')} />;
      case 'bot': return <Bot onBack={() => setCurrentPage('menu')} />;
      case 'saldo': return <Saldo onBack={() => setCurrentPage('menu')} />;
      case 'member-offline': return <MemberOffline onBack={() => setCurrentPage('menu')} />;
      case 'kasir-fisik': return <KasirFisik onBack={() => setCurrentPage('menu')} />;
      default: return <Menu onNavigate={setCurrentPage} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 font-sans flex justify-center relative">
      {bgType === 'image' && bgUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img src={bgUrl} className="w-full h-full object-cover opacity-20" alt="bg" data-no-invert />
        </div>
      )}
      {bgType === 'video' && bgUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video src={bgUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20" data-no-invert />
        </div>
      )}
      <div className="w-full max-w-[1200px] flex flex-col md:flex-row relative z-10">
        <Sidebar />
        <main className="flex-1 flex flex-col p-6 md:p-8 gap-8 overflow-hidden">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
