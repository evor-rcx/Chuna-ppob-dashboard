import { useState, useEffect } from 'react';
import { PageContainer } from '../PageContainer';

export function Konfig({ onBack }: { onBack: () => void }) {
  const [username, setUsername] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('Checking...');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/digiflazz/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data.status);
        setBalance(data.balance || 0);
        if (data.username) setUsername(data.username);
      })
      .catch(() => setStatus('Disconnected'));
  }, []);

  const handleSave = async () => {
    if (!username || !apiKey) {
      alert("Masukkan Username dan API Key Digiflazz");
      return;
    }
    
    setLoading(true);
    setStatus('Connecting...');
    try {
      const res = await fetch('/api/digiflazz/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, apiKey })
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Connected');
        setBalance(data.balance);
        alert(data.message);
      } else {
        setStatus('Error');
        alert("Gagal: " + data.error);
      }
    } catch (err) {
      setStatus('Error');
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Konfigurasi API Digiflazz" onBack={onBack}>
      <div className="space-y-6 max-w-xl">
        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">🔌</div>
            <div className="text-[10px] uppercase text-slate-500 font-bold">Status Koneksi</div>
          </div>
          <div className={`text-sm font-medium ${status.includes('Connected') ? 'text-green-400' : 'text-amber-400'}`}>
            {status}
          </div>
          {status.includes('Connected') && (
            <div className="text-xl font-bold text-white mt-2">
              Saldo: Rp {(Number(balance) || 0).toLocaleString('id-ID')}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Username Digiflazz</label>
          <input 
            type="text" 
            placeholder="Masukkan Username..." 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">API Key (Production)</label>
          <input 
            type="password" 
            placeholder="Masukkan API Key..." 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
          />
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-medium py-3 px-4 rounded-xl cursor-pointer hover:from-sky-400 hover:to-indigo-500 transition-colors shadow-lg shadow-sky-900/20 mt-2 disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
        </button>
      </div>
    </PageContainer>
  );
}
