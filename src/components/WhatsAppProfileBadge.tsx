import React, { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Check, Edit3, MessageCircle, RefreshCw, Upload, User, X, ShieldCheck } from 'lucide-react';

export interface WaProfileData {
  username: string;
  name: string;
  phoneNumber: string;
  photoUrl: string;
  status: string;
  isConnected: boolean;
}

interface WhatsAppProfileBadgeProps {
  variant?: 'compact' | 'header' | 'menu-header' | 'card';
  className?: string;
}

export function WhatsAppProfileBadge({ variant = 'compact', className = '' }: WhatsAppProfileBadgeProps) {
  const [profile, setProfile] = useState<WaProfileData>({
    username: 'E4 STORE Official',
    name: 'E4 STORE Official',
    phoneNumber: '6285169949218',
    photoUrl: '/default_wa_photo.png',
    status: 'Ready',
    isConnected: true
  });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit modal state
  const [editUsername, setEditUsername] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/wa/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        }
      }
    } catch (e) {
      console.error('Failed to fetch WhatsApp profile', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const interval = setInterval(fetchProfile, 30000);
    return () => clearInterval(interval);
  }, []);

  const openEditModal = () => {
    setEditUsername(profile.username);
    setEditPhotoUrl(profile.photoUrl);
    setSavedSuccess(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/wa/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editUsername,
          photoUrl: editPhotoUrl,
          phoneNumber: profile.phoneNumber
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        }
        setSavedSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setSavedSuccess(false);
        }, 1200);
      }
    } catch (e) {
      console.error('Failed to save profile', e);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const formatPhone = (num: string) => {
    if (!num) return '';
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('62')) {
      return `+62 ${clean.slice(2, 5)}-${clean.slice(5, 9)}-${clean.slice(9)}`;
    }
    return `+${clean}`;
  };

  // Render Compact Variant (placed directly inside or next to h3 header)
  if (variant === 'compact') {
    return (
      <>
        <div 
          onClick={openEditModal}
          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer group shadow-sm text-xs font-normal ${className}`}
          title="Klik untuk ubah foto profil dan nama WhatsApp"
        >
          {/* Avatar with WhatsApp Ring */}
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-emerald-400/80 bg-slate-800 flex-shrink-0">
            {profile.photoUrl ? (
              <img 
                src={profile.photoUrl} 
                alt="WhatsApp Profile" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default_wa_photo.png';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-emerald-400 bg-emerald-950/50">
                <User size={12} />
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-slate-900"></span>
          </div>

          {/* Profile Name & WhatsApp Icon */}
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 flex items-center">
              <MessageCircle size={12} className="fill-emerald-500/20" />
            </span>
            <span className="text-emerald-200 font-medium tracking-wide truncate max-w-[140px] sm:max-w-[200px]">
              {profile.username}
            </span>
            <ShieldCheck size={12} className="text-emerald-400 fill-emerald-500/30" />
          </div>

          <Edit3 size={11} className="text-emerald-400/60 group-hover:text-emerald-300 ml-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
        </div>

        {renderModal()}
      </>
    );
  }

  // Render Header Variant (detailed widget in PageContainer header)
  if (variant === 'header') {
    return (
      <>
        <div 
          onClick={openEditModal}
          className={`flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-emerald-500/30 hover:border-emerald-400/60 transition-all cursor-pointer group shadow-md ${className}`}
          title="Klik untuk ubah foto & nama profil WhatsApp"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-400 bg-slate-800 flex-shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <img 
              src={profile.photoUrl || '/default_wa_photo.png'} 
              alt="WhatsApp Profile" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default_wa_photo.png';
              }}
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                {profile.username}
              </span>
              <span className="text-[10px] px-1 py-0.2 bg-emerald-500/20 text-emerald-400 rounded font-medium border border-emerald-500/30">
                WA
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {formatPhone(profile.phoneNumber)}
            </span>
          </div>
        </div>

        {renderModal()}
      </>
    );
  }

  // Render Menu Header Variant (top-right of Main Dashboard)
  if (variant === 'menu-header') {
    return (
      <>
        <div 
          onClick={openEditModal}
          className={`flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 transition-all cursor-pointer group ${className}`}
          title="Pengaturan Profil WhatsApp"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500/80 bg-slate-800 flex-shrink-0 shadow-md">
            <img 
              src={profile.photoUrl || '/default_wa_photo.png'} 
              alt="WhatsApp Profile" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default_wa_photo.png';
              }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse"></span>
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <MessageCircle size={13} className="text-emerald-400 fill-emerald-500/30" />
              <span className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                {profile.username}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {formatPhone(profile.phoneNumber)}
            </span>
          </div>
        </div>

        {renderModal()}
      </>
    );
  }

  // Render Full Card Variant (e.g. inside Bot / Settings)
  return (
    <>
      <div className={`p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl ${className}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-400 bg-slate-800 flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <img 
                src={profile.photoUrl || '/default_wa_photo.png'} 
                alt="WhatsApp Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default_wa_photo.png';
                }}
              />
              <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                  <MessageCircle size={16} className="text-emerald-400 fill-emerald-500/20" />
                  {profile.username}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Resmi
                </span>
              </div>
              <p className="text-xs text-emerald-400/80 font-mono mt-0.5">
                {formatPhone(profile.phoneNumber)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Foto &amp; Nama profil WhatsApp aktif untuk bot dan nota transaksi.
              </p>
            </div>
          </div>

          <button
            onClick={openEditModal}
            className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl text-xs font-medium transition-colors border border-emerald-500/40 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Edit3 size={14} /> Ubah Profil
          </button>
        </div>
      </div>

      {renderModal()}
    </>
  );

  function renderModal() {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-emerald-500/40 w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <MessageCircle size={20} />
              </span>
              <div>
                <h3 className="font-bold text-white text-base">Profil WhatsApp</h3>
                <p className="text-xs text-slate-400">Atur Foto &amp; Nama Profil WhatsApp Anda</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-5 space-y-4">
            {/* Avatar Preview & Upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-400 bg-slate-800 shadow-xl group">
                <img 
                  src={editPhotoUrl || '/default_wa_photo.png'} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default_wa_photo.png';
                  }}
                />
                <label 
                  htmlFor="wa-photo-upload" 
                  className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                >
                  <Upload size={18} className="mb-1" />
                  Ganti Foto
                </label>
              </div>
              <input 
                id="wa-photo-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <span className="text-[11px] text-slate-400">
                Klik foto di atas untuk unggah gambar baru dari perangkat Anda
              </span>
            </div>

            {/* Input Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Nama Profil WhatsApp (Username)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Contoh: E4 STORE Official"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 p-3 rounded-xl text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Input URL Foto */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                URL Foto Profil (Opsional jika pakai tautan)
              </label>
              <input
                type="text"
                placeholder="https://... atau biarkan hasil upload"
                value={editPhotoUrl}
                onChange={(e) => setEditPhotoUrl(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 p-3 rounded-xl text-white text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
              />
            </div>

            {/* Nomor WhatsApp Tag */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Nomor WhatsApp Terhubung:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {formatPhone(profile.phoneNumber)}
              </span>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <Check size={16} /> Profil WhatsApp berhasil disimpan!
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 px-4 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-sm font-semibold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
