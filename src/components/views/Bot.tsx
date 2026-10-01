import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { PageContainer } from '../PageContainer';
import { WhatsAppProfileBadge } from '../WhatsAppProfileBadge';
import { MessageCircle, ShieldCheck, Crown, Edit3, RefreshCw, Upload, X, Check, ZoomIn, Phone } from 'lucide-react';

export interface OwnerWaProfile {
  phone: string;
  cleanPhone: string;
  username: string;
  photoUrl: string;
  isPrimary: boolean;
  role: string;
  status: string;
}

export function Bot({ onBack }: { onBack: () => void }) {
  const [token, setToken] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerWa, setOwnerWa] = useState('');
  const [ownerWaLoading, setOwnerWaLoading] = useState(false);
  const [ownerWaList, setOwnerWaList] = useState<string[]>([]);
  const [ownerProfiles, setOwnerProfiles] = useState<OwnerWaProfile[]>([]);
  const [waProfile, setWaProfile] = useState<{ username: string; photoUrl: string; phoneNumber: string } | null>(null);
  
  // Modal & Edit State for Registered WA Profiles
  const [editingOwner, setEditingOwner] = useState<OwnerWaProfile | null>(null);
  const [editOwnerUsername, setEditOwnerUsername] = useState('');
  const [editOwnerPhotoUrl, setEditOwnerPhotoUrl] = useState('');
  const [savingOwnerProfile, setSavingOwnerProfile] = useState(false);
  const [syncingPhone, setSyncingPhone] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState('Checking...');
  const [waStatus, setWaStatus] = useState('Checking...');
  const [pairingCode, setPairingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [waLoading, setWaLoading] = useState(false);
  const [gmailEmail, setGmailEmail] = useState('');
  const [gmailPassword, setGmailPassword] = useState('');
  const [gmailStatus, setGmailStatus] = useState('Checking...');
  const [gmailLoading, setGmailLoading] = useState(false);
  

  const fetchOwnerWaData = () => {
    fetch('/api/bot/owner-wa')
      .then(res => res.json())
      .then(data => {
        if (data.ownerWhatsapps) {
          setOwnerWaList(data.ownerWhatsapps);
          setOwnerWa(prev => prev === '' ? data.ownerWhatsapps.join(', ') : prev);
        }
        if (data.profiles) {
          setOwnerProfiles(data.profiles);
        }
      })
      .catch(console.error);
  };

  const handleSyncOwnerPhoto = async (phone: string) => {
    try {
      setSyncingPhone(phone);
      const res = await fetch('/api/bot/owner-wa/sync-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || "Foto profil berhasil disinkronkan langsung dari WhatsApp!");
        fetchOwnerWaData();
      } else {
        alert(data.error || "Gagal menyinkronkan foto profil WhatsApp.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSyncingPhone(null);
    }
  };

  const handleOpenEditOwner = (prof: OwnerWaProfile) => {
    setEditingOwner(prof);
    setEditOwnerUsername(prof.username);
    setEditOwnerPhotoUrl(prof.photoUrl);
  };

  const handleSaveOwnerProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingOwner) return;
    try {
      setSavingOwnerProfile(true);
      const res = await fetch('/api/bot/owner-wa/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: editingOwner.phone,
          username: editOwnerUsername,
          photoUrl: editOwnerPhotoUrl
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Profil WhatsApp berhasil diperbarui!");
        setEditingOwner(null);
        fetchOwnerWaData();
      } else {
        alert(data.error || "Gagal memperbarui profil.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSavingOwnerProfile(false);
    }
  };

  const handleUploadOwnerPhotoFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditOwnerPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    let botInterval: NodeJS.Timeout;
    
    const checkStatus = () => {
      fetch('/api/bot/status')
        .then(res => res.json())
        .then(data => {
          setStatus(data.status);
          if (data.token) {
            setToken(prev => prev === '' ? data.token : prev);
          }
        })
        .catch(() => setStatus('Disconnected'));
        
      fetch('/api/bot/owner')
        .then(res => res.json())
        .then(data => {
          if (data.owners && data.owners.length > 0) {
            setOwnerId(data.owners.join(', '));
          }
        })
        .catch(console.error);

      fetchOwnerWaData();
        
      
      fetch('/api/gmail/status')
        .then(res => res.json())
        .then(data => {
          setGmailStatus(data.status);
          if (data.email) {
            setGmailEmail(prev => prev === '' ? data.email : prev);
          }
        })
        .catch(() => setGmailStatus('Disconnected'));
      fetch('/api/wa/status')
        .then(res => res.json())
        .then(data => {
          setWaStatus(data.status);
          if (data.pairingCode) setPairingCode(data.pairingCode);
          else setPairingCode('');
          if (data.profile) {
            setWaProfile(data.profile);
          }
        })
        .catch(() => setWaStatus('Disconnected'));

      fetch('/api/wa/profile')
        .then(res => res.json())
        .then(data => {
          if (data.profile) {
            setWaProfile(data.profile);
          }
        })
        .catch(() => {});
        
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
        alert("ID Owner Telegram berhasil disimpan!");
      } else {
        alert("Gagal: " + data.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan ID Owner.");
    } finally {
      setOwnerLoading(false);
    }
  };

  const handleUpdateOwnerWa = async () => {
    if (!ownerWa) {
      alert("Masukkan minimal satu nomor WhatsApp Owner!");
      return;
    }
    setOwnerWaLoading(true);
    try {
      const numbers = ownerWa.split(',').map(n => n.trim()).filter(Boolean);
      const response = await fetch('/api/bot/owner-wa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerWhatsapps: numbers })
      });
      const data = await response.json();
      if (data.success) {
        setOwnerWaList(data.ownerWhatsapps || numbers);
        alert("Nomor WhatsApp Owner berhasil disimpan dan aktif di bot!");
      } else {
        alert("Gagal: " + data.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan nomor WA Owner.");
    } finally {
      setOwnerWaLoading(false);
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

  
  const handleUpdateGmail = async () => {
    if (!gmailEmail || !gmailPassword) {
      alert("Masukkan Email dan App Password Gmail terlebih dahulu!");
      return;
    }
    setGmailLoading(true);
    setGmailStatus('Connecting...');
    try {
      const response = await fetch('/api/gmail/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: gmailEmail, password: gmailPassword })
      });
      const data = await response.json();
      if (data.success) {
        setGmailStatus('Configured');
        alert("Gmail berhasil dihubungkan!");
      } else {
        setGmailStatus('Error');
        alert("Gagal: " + data.error);
      }
    } catch (err) {
      setGmailStatus('Error');
      alert("Terjadi kesalahan saat menghubungkan Gmail.");
    } finally {
      setGmailLoading(false);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">✉️</div>
              <div className="text-[10px] uppercase text-slate-500 font-bold">Status Gmail</div>
            </div>
            <div className={`text-sm font-medium break-words ${gmailStatus?.includes('Configured') ? 'text-green-400' : 'text-amber-400'}`}>
              {gmailStatus}
            </div>
          </div>
          <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">✈️</div>
              <div className="text-[10px] uppercase text-slate-500 font-bold">Status Telegram</div>
            </div>
            <div className={`text-sm font-medium break-words ${status?.includes('Connected') ? 'text-green-400' : 'text-amber-400'}`}>
              {status}
            </div>
          </div>
          <div className="bg-slate-800/30 p-4 rounded-xl border border-emerald-500/30 flex flex-col gap-2 relative overflow-hidden">
            <div className="flex items-center gap-3">
              {waProfile?.photoUrl ? (
                <div 
                  onClick={() => setPreviewPhoto(waProfile.photoUrl)}
                  className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-400 bg-slate-900 flex-shrink-0 cursor-pointer shadow-md"
                  title="Klik untuk melihat foto profil WhatsApp"
                >
                  <img 
                    src={waProfile.photoUrl} 
                    alt="WhatsApp Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default_wa_photo.png';
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-900 animate-pulse"></span>
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">💬</div>
              )}
              <div className="min-w-0">
                <div className="text-[10px] uppercase text-slate-500 font-bold flex items-center gap-1">
                  Status WhatsApp
                  {waStatus?.includes('Connected') && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping"></span>}
                </div>
                {waProfile?.username && (
                  <div className="text-xs font-bold text-white truncate max-w-[120px]">
                    {waProfile.username}
                  </div>
                )}
              </div>
            </div>
            <div className={`text-xs font-medium break-words ${waStatus?.includes('Connected') ? 'text-green-400' : 'text-amber-400'}`}>
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
          <h3 className="text-sm font-medium text-white mb-4">Pengaturan Gmail Bot</h3>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Alamat Email Gmail</label>
            <input 
              type="email" 
              placeholder="contoh@gmail.com" 
              value={gmailEmail}
              onChange={(e) => setGmailEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-white font-mono text-sm outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">App Password Gmail (16 Karakter)</label>
            <input 
              type="password" 
              placeholder="xxxx xxxx xxxx xxxx" 
              value={gmailPassword}
              onChange={(e) => setGmailPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-white font-mono text-sm outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">
              Gunakan Sandi Aplikasi (App Password) dari pengaturan keamanan akun Google Anda.
            </p>
          </div>
          <button 
            onClick={handleUpdateGmail}
            disabled={gmailLoading}
            className="w-full bg-slate-800 border border-slate-700 text-white font-medium py-3 px-4 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors mt-4 disabled:opacity-50"
          >
            {gmailLoading ? 'Menghubungkan...' : 'Update Konfigurasi Gmail'}
          </button>
        </div>
        <div className="pt-4 border-t border-slate-800/50">
          <h3 className="text-sm font-medium text-white mb-4">Pengaturan WhatsApp (Baileys)</h3>
          <WhatsAppProfileBadge variant="card" className="mb-4" />
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

        <div className="pt-4 border-t border-slate-800/50 bg-slate-900/40 p-4 rounded-2xl border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">👑</span>
            <h3 className="text-sm font-semibold text-amber-300">Hak Akses & Pengenalan Nomor WhatsApp Owner</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Nomor WhatsApp yang didaftarkan di sini akan <strong className="text-amber-200">dikenali otomatis</strong> sebagai Owner oleh sistem bot:
            <br />
            • <span className="text-emerald-400">Bebas dari pesan autoreply pelanggan</span> &amp; penolakan panggilan umum.
            <br />
            • Akses penuh ke perintah kendali via chat WhatsApp (<code className="text-sky-300">!menu</code>, <code className="text-sky-300">!status</code>, <code className="text-sky-300">!bersihkan</code>, <code className="text-sky-300">!saldo</code>, <code className="text-sky-300">!tx</code>).
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Nomor WhatsApp Owner (Pisahkan koma jika lebih dari satu)
            </label>
            <input 
              type="text" 
              placeholder="Contoh: 6285169949218, 08123456789" 
              value={ownerWa}
              onChange={(e) => setOwnerWa(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-white font-mono text-sm outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
            />
          </div>

          <button 
            onClick={handleUpdateOwnerWa}
            disabled={ownerWaLoading}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium py-3 px-4 rounded-xl cursor-pointer transition-colors mt-4 disabled:opacity-50 shadow-lg shadow-amber-900/20"
          >
            {ownerWaLoading ? 'Menyimpan...' : 'Simpan Nomor WhatsApp Owner'}
          </button>

          {/* Profil WhatsApp yang Terdaftar di Sini */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-amber-500/20 text-amber-400 rounded-lg">
                  <Crown size={15} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Profil WhatsApp yang Terdaftar di Sini ({ownerProfiles.length || ownerWaList.length})
                </span>
              </div>
              <button
                type="button"
                onClick={fetchOwnerWaData}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
                title="Perbarui data profil WhatsApp"
              >
                <RefreshCw size={12} /> Segarkan
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-3">
              Daftar akun WhatsApp Owner yang aktif terdaftar pada bot: dilengkapi foto profil dan username resmi.
            </p>

            <div className="space-y-3">
              {(ownerProfiles.length > 0 ? ownerProfiles : ownerWaList.map(num => ({
                phone: num,
                cleanPhone: num.replace(/\D/g, ''),
                username: num === '6285169949218' ? 'Owner E4 Store (Eko)' : `Owner (${num.slice(-4)})`,
                photoUrl: '/default_wa_photo.png',
                isPrimary: num === '6285169949218',
                role: num === '6285169949218' ? 'Owner Utama' : 'Co-Owner Terdaftar',
                status: 'Aktif & Terdaftar'
              }))).map((prof, i) => (
                <div 
                  key={prof.phone || i}
                  className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* WhatsApp Avatar Profile Picture */}
                    <div 
                      onClick={() => setPreviewPhoto(prof.photoUrl || '/default_wa_photo.png')}
                      className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-400/90 bg-slate-900 flex-shrink-0 cursor-pointer group shadow-md"
                      title="Klik untuk melihat foto profil WhatsApp ukuran penuh"
                    >
                      <img 
                        src={prof.photoUrl || '/default_wa_photo.png'} 
                        alt={prof.username}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default_wa_photo.png';
                        }}
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse"></span>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <ZoomIn size={14} />
                      </div>
                    </div>

                    {/* WhatsApp Username & Phone */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white text-sm tracking-wide truncate max-w-[180px] sm:max-w-[240px]">
                          {prof.username}
                        </span>
                        <ShieldCheck size={14} className="text-emerald-400 fill-emerald-500/20 flex-shrink-0" />
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex-shrink-0 ${
                          prof.isPrimary
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {prof.isPrimary ? '👑 Owner Utama' : 'Co-Owner'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                          <MessageCircle size={11} className="text-emerald-400 fill-emerald-500/30" />
                          +{prof.cleanPhone || prof.phone}
                        </span>
                        <span className="text-[10px] text-slate-400">• Bebas Autoreply</span>
                        <span className="text-[10px] text-slate-400">• Kontrol Chat Aktif</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this specific registered profile */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSyncOwnerPhoto(prof.phone)}
                      disabled={syncingPhone === prof.phone}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Ambil foto profil live langsung dari WhatsApp"
                    >
                      <RefreshCw size={12} className={syncingPhone === prof.phone ? "animate-spin" : ""} />
                      <span className="hidden sm:inline">Sinkron Foto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditOwner(prof)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Ubah nama profil WhatsApp atau foto profil"
                    >
                      <Edit3 size={12} />
                      <span>Edit Profil</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Edit Profil WhatsApp Khusus Nomor Terdaftar */}
      {editingOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/40 w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <MessageCircle size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-white text-base">Edit Profil WhatsApp Terdaftar</h3>
                  <p className="text-xs text-slate-400">Nomor: +{editingOwner.cleanPhone || editingOwner.phone}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingOwner(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveOwnerProfile} className="mt-5 space-y-4">
              {/* Avatar Preview & Upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-400 bg-slate-800 shadow-xl group">
                  <img 
                    src={editOwnerPhotoUrl || '/default_wa_photo.png'} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default_wa_photo.png';
                    }}
                  />
                  <label 
                    htmlFor="owner-wa-photo-upload" 
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                  >
                    <Upload size={18} className="mb-1" />
                    Ganti Foto
                  </label>
                </div>
                <input 
                  id="owner-wa-photo-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleUploadOwnerPhotoFile} 
                  className="hidden" 
                />
                <span className="text-[11px] text-slate-400">
                  Klik foto di atas untuk unggah foto profil dari galeri / file Anda
                </span>
              </div>

              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Nama Profil WhatsApp (Username)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Samsul Sifa (Owner)"
                  value={editOwnerUsername}
                  onChange={(e) => setEditOwnerUsername(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 p-3 rounded-xl text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>

              {/* URL Photo Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  URL Foto Profil (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="https://... atau biarkan hasil upload"
                  value={editOwnerPhotoUrl}
                  onChange={(e) => setEditOwnerPhotoUrl(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 p-3 rounded-xl text-white text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingOwner(null)}
                  className="flex-1 py-3 px-4 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingOwnerProfile}
                  className="flex-1 py-3 px-4 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-sm font-semibold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingOwnerProfile ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    'Simpan Profil'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Zoom Foto Profil */}
      {previewPhoto && (
        <div 
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
        >
          <div className="relative max-w-sm w-full bg-slate-900 border border-emerald-500/40 p-4 rounded-3xl shadow-2xl flex flex-col items-center">
            <button 
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
            <div className="w-56 h-56 rounded-full overflow-hidden border-4 border-emerald-400 shadow-2xl my-4">
              <img 
                src={previewPhoto} 
                alt="Foto Profil WhatsApp" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default_wa_photo.png';
                }}
              />
            </div>
            <p className="text-sm font-bold text-white mb-1">Foto Profil WhatsApp Terdaftar</p>
            <p className="text-xs text-slate-400">Klik di mana saja untuk menutup</p>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
