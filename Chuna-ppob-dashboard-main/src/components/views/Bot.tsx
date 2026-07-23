import { useState, useEffect } from 'react';
import { PageContainer } from '../PageContainer';

export function Bot({ onBack }: { onBack: () => void }) {
  const [token, setToken] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState('Checking...');
  const [waStatus, setWaStatus] = useState('Checking...');
  const [pairingCode, setPairingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [waLoading, setWaLoading] = useState(false);
  

  useEffect(() => {
    let botInterval: NodeJS.Timeout;
    
    const checkStatus = () => {
      fetch('/api/bot/status')
        .then(res => res.json())
        .then(data => setStatus(data.status))
        .catch(() => setStatus('Disconnected'));
        
      fetch('/api/bot/owner')
        .then(res => res.json())
        .then(data => {
          if (data.owners && data.owners.length > 0) {
            setOwnerId(data.owners.join(', '));
          }
        })
        .catch(console.error);
        
      fetch('/api/wa/status')
        .then(res => res.json())
        .then(data => {
          setWaStatus(data.status);
          if (data.pairingCode) setPairingCode(data.pairingCode);
          else setPairingCode('');
        })
        .catch(() => setWaStatus('Disconnected'));
        
    };

    checkStatus();
    botInterval = setInterval(checkStatus, 3000);
    return () => clearInterval(botInterval);
  }, []);
  
  
  const handleUpdateOwner = async () => {
    if (!ownerId) {
      alert("Masukkan ID Owner!");
      return;
    }
    setOwnerLoading(true);
    try {
      const ids = ownerId.split(',').map(id => id.trim()).filter(id => id);
      const response = await fetch('/api/bot/owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owners: ids })
      });
      const data = await response.json();
      if (data.success) {
        alert("ID Owner berhasil disimpan!");
      } else {
        alert("Gagal: " + data.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan ID Owner.");
    } finally {
      setOwnerLoading(false);
    }
  };

  const handleUpdateToken = async () => {
    if (!token) {
      alert("Masukkan token bot terlebih dahulu!");
      return;
    }

    setLoading(true);
    setStatus('Connecting...');

    try {
      const response = await fetch('/api/bot/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus('Connected & Running');
        alert("Bot berhasil dihubungkan!");
      } else {
        setStatus('Error');
        alert("Gagal: " + data.error);
      }
    } catch (err) {
      setStatus('Error');
      alert("Terjadi kesalahan saat menghubungkan bot.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetWA = async () => {
    if (!confirm("Yakin ingin mereset koneksi WhatsApp? Semua data sesi (pairing) akan dihapus.")) return;
    setWaLoading(true);
    try {
      const response = await fetch('/api/wa/reset', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setWaStatus('Disconnected');
        setPairingCode('');
        alert(data.message);
      } else {
        alert("Gagal mereset: " + data.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan saat mereset WhatsApp.");
    } finally {
      setWaLoading(false);
    }
  };


  const handleStartWA = async () => {
    if (!phoneNumber) {
      alert("Masukkan nomor WhatsApp terlebih dahulu!");
      return;
    }

    setWaLoading(true);
    setWaStatus('Requesting Pairing Code...');

    try {
      const response = await fetch('/api/wa/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.pairingCode) {
          setPairingCode(data.pairingCode);
          setWaStatus('Waiting for Pairing');
        } else if (data.status === 'Connecting...') {
          setWaStatus('Connecting...');
        } else {
          setWaStatus(data.status || 'Connected');
          alert(data.message || "Bot berhasil dihubungkan!");
        }
      } else {
        setWaStatus('Error');
        alert("Gagal: " + data.error);
      }
    } catch (err) {
      setWaStatus('Error');
      alert("Terjadi kesalahan saat menghubungkan WhatsApp. Pastikan format nomor benar (awalan 62).");
    } finally {
      setWaLoading(false);
    }
  };

  return (
    <PageContainer title="Konfigurasi Integrasi Sistem" onBack={onBack}>
      <div className="space-y-6 max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">✈️</div>
              <div className="text-[10px] uppercase text-slate-500 font-bold">Status Telegram</div>
            </div>
            <div className={`text-sm font-medium break-words ${status.includes('Connected') ? 'text-green-400' : 'text-amber-400'}`}>
              {status}
            </div>
          </div>
          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">💬</div>
              <div className="text-[10px] uppercase text-slate-500 font-bold">Status WhatsApp</div>
            </div>
            <div className={`text-sm font-medium break-words ${waStatus.includes('Connected') ? 'text-green-400' : 'text-amber-400'}`}>
              {waStatus}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/50">
          <h3 className="text-sm font-medium text-white mb-4">Pengaturan Telegram</h3>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Token Bot Telegram (BotFather)</label>
            <input 
              type="text" 
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" 
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-white font-mono text-sm outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
            />
          </div>
          <button 
            onClick={handleUpdateToken}
            disabled={loading}
            className="w-full bg-slate-800 border border-slate-700 text-white font-medium py-3 px-4 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors mt-3 disabled:opacity-50"
          >
            {loading ? 'Menghubungkan...' : 'Update Token Telegram'}
          </button>

          <div className="flex flex-col gap-2 mt-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Telegram Owner ID (Pisahkan dengan koma jika lebih dari satu)</label>
            <input 
              type="text" 
              placeholder="Contoh: 123456789" 
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-white font-mono text-sm outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
            />
          </div>
          <button 
            onClick={handleUpdateOwner}
            disabled={ownerLoading}
            className="w-full bg-slate-800 border border-slate-700 text-white font-medium py-3 px-4 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors mt-3 disabled:opacity-50"
          >
            {ownerLoading ? 'Menyimpan...' : 'Update ID Owner'}
          </button>
        </div>
        <div className="pt-4 border-t border-slate-800/50">
          <h3 className="text-sm font-medium text-white mb-4">Pengaturan WhatsApp (Baileys)</h3>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nomor WhatsApp (Contoh: 6281234567890)</label>
            <input 
              type="text" 
              placeholder="628..." 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-white text-sm outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button 
              onClick={handleStartWA}
              disabled={waLoading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium py-3 px-4 rounded-xl cursor-pointer hover:from-emerald-400 hover:to-teal-500 transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50"
            >
              {waLoading ? 'Memproses...' : 'Dapatkan Kode Pairing'}
            </button>
            <button 
              onClick={handleResetWA}
              disabled={waLoading}
              className="px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl font-medium hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
              title="Reset Sesi WA"
            >
              Reset
            </button>
          </div>

          {pairingCode && (
            <div className="mt-6 bg-slate-800/80 border border-emerald-500/30 p-5 rounded-xl text-center">
              <p className="text-xs text-slate-400 mb-2">Kode Pairing Anda</p>
              <div className="text-3xl font-mono font-bold tracking-widest text-emerald-400">
                {pairingCode}
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Buka WhatsApp di HP Anda &gt; Perangkat Taut &gt; Tautkan Perangkat &gt; Tautkan dengan nomor telepon saja. Masukkan kode di atas.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
