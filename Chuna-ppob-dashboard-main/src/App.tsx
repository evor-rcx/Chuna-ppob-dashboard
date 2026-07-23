/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Menu } from './components/views/Menu';
import { Ringkasan } from './components/views/Ringkasan';
import { Produk } from './components/views/Produk';
import { Transaksi } from './components/views/Transaksi';
import { Konfig } from './components/views/Konfig';
import { Bot } from './components/views/Bot';
import { Saldo } from './components/views/Saldo';
import { MemberOffline } from './components/views/MemberOffline';
import { Page } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('menu');

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
      default: return <Menu onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 font-sans flex justify-center">
      <div className="w-full max-w-[1200px] flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 flex flex-col p-6 md:p-8 gap-8 overflow-hidden">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

