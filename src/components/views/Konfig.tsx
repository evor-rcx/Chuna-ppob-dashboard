import { useState, useEffect } from 'react';
import { PageContainer } from '../PageContainer';

export function Konfig({ onBack }: { onBack: () => void }) {
  const [username, setUsername] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('Checking...');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [bgType, setBgType] = useState(localStorage.getItem('chuna_bg_type') || '');
  const [bgUrl, setBgUrl] = useState(localStorage.getItem('chuna_bg_url') || '');

  useEffect(() => {
    fetch('/api/digiflazz/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data.status);
        setBalance(data.balance || 0);
        if (data.username) setUsername(data.username);
        if (data.apiKey) setApiKey(data.apiKey);
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
          <div className={`text-sm font-medium ${status?.includes('Connected') ? 'text-green-400' : 'text-amber-400'}`}>
            {status}
          </div>
          {status?.includes('Connected') && (
            <div className="text-xl font-bold text-white mt-2">
              Saldo: Rp {(Number(balance) || 0).toLocaleString('id-ID')}
            </div>
          )}
        </div>

        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">🎨</div>
            <div className="text-[10px] uppercase text-slate-500 font-bold">Tema Tampilan & Latar Belakang</div>
          </div>
          
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-xs text-slate-400">Mode Tema</label>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  localStorage.setItem('chuna_theme', 'dark');
                  document.documentElement.classList.remove('theme-light');
                }}
                className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                🌙 Mode Gelap
              </button>
              <button 
                onClick={() => {
                  localStorage.setItem('chuna_theme', 'light');
                  document.documentElement.classList.add('theme-light');
                }}
                className="flex-1 bg-slate-200 border border-slate-300 text-slate-800 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors"
                data-no-invert
              >
                ☀️ Mode Terang
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2 border-t border-slate-700/50 pt-3">
            <label className="text-xs text-slate-400">Tipe Latar Belakang</label>
            <select
              value={bgType}
              onChange={async (e) => {
                setBgType(e.target.value);
                localStorage.setItem('chuna_bg_type', e.target.value);
                await clearBgFile();
                setBgUrl('');
                window.dispatchEvent(new Event('chuna_bg_update'));
              }}
              className="w-full bg-slate-800/50 border border-slate-700/50 p-2 rounded-lg text-white text-sm outline-none"
            >
              <option value="">Tidak ada (Warna solid)</option>
              <option value="image">Gambar (Image)</option>
              <option value="video">Video</option>
            </select>
          </div>

          {bgType && (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400">Pilih File {bgType === 'image' ? 'Gambar' : 'Video'} dari Perangkat</label>
              <input
                type="file"
                accept={bgType === 'image' ? 'image/*' : 'video/*'}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      await saveBgFile(file);
                      setBgUrl('file_loaded'); // trigger UI update
                      window.dispatchEvent(new Event('chuna_bg_update'));
                    } catch(err) {
                      alert("Gagal menyimpan file: " + (err instanceof Error ? err.message : String(err)) + "\n\nJika file video terlalu besar, cobalah kompres ukurannya.");
                    }
                  } else {
                    await clearBgFile();
                    setBgUrl('');
                    window.dispatchEvent(new Event('chuna_bg_update'));
                  }
                }}
                className="w-full bg-slate-800/50 border border-slate-700/50 p-2 rounded-lg text-white text-sm outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-500/20 file:text-sky-400 hover:file:bg-sky-500/30"
              />
              <span className="text-[10px] text-slate-500">File akan disimpan di penyimpanan browser (tidak diupload ke server).</span>
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
