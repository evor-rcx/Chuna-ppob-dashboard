import { useState, useEffect } from 'react';
import { PageContainer } from '../PageContainer';
import { Sparkles, Key, ExternalLink, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react';

export function GeminiConfig({ onBack }: { onBack: () => void }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [statusText, setStatusText] = useState('Memeriksa status koneksi...');
  const [loading, setLoading] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');

  const checkStatus = async () => {
    setStatus('checking');
    setStatusText('Memeriksa status koneksi ke Google AI Studio...');
    try {
      const res = await fetch('/api/config/gemini');
      const data = await res.json();
      if (data.connected) {
        setStatus('connected');
        setStatusText('Terhubung ✅ (1.500 Kuota Gratis/Hari)');
        if (data.maskedKey) setMaskedKey(data.maskedKey);
      } else {
        setStatus('disconnected');
        setStatusText(data.message || 'Belum Terhubung / API Key Belum Disetel');
      }
    } catch {
      setStatus('disconnected');
      setStatusText('Belum Terhubung');
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      alert('Silakan masukkan API Key Gemini terlebih dahulu!');
      return;
    }

    setLoading(true);
    setStatus('checking');
    setStatusText('Menguji koneksi ke Google Gemini AI...');

    try {
      const res = await fetch('/api/config/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setStatus('connected');
        setStatusText('Terhubung ✅ (1.500 Kuota Gratis/Hari)');
        if (data.maskedKey) setMaskedKey(data.maskedKey);
        setApiKey('');
        alert('🎉 Berhasil! API Key Gemini tersimpan & langsung terhubung aktif ke Bot WhatsApp.');
      } else {
        setStatus('error');
        setStatusText('Gagal: ' + (data.error || 'Kunci tidak valid'));
        alert('❌ Gagal menghubungkan: ' + (data.error || 'Periksa kembali API Key Anda'));
      }
    } catch {
      setStatus('error');
      setStatusText('Terjadi kesalahan jaringan/sistem');
      alert('❌ Terjadi kesalahan saat menghubungi server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="🔑 Konfigurasi AI Gemini" onBack={onBack}>
      <div className="space-y-6 max-w-2xl">
        {/* Status Card */}
        <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60 shadow-lg flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg shadow-inner">
                <Sparkles size={22} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Status AI Vision Scanner</div>
                <div className="text-sm font-semibold text-white">Google Gemini 3.8 Flash Vision</div>
              </div>
            </div>
            <button
              onClick={checkStatus}
              title="Perbarui Status"
              className="p-2 rounded-lg bg-slate-700/40 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw size={16} className={status === 'checking' ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-700/50 flex items-center gap-2">
            {status === 'connected' ? (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            ) : status === 'checking' ? (
              <RefreshCw size={18} className="text-cyan-400 animate-spin shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-amber-400 shrink-0" />
            )}
            <span className={`text-sm font-medium ${status === 'connected' ? 'text-emerald-300' : status === 'checking' ? 'text-cyan-300' : 'text-amber-300'}`}>
              {statusText}
            </span>
          </div>

          {maskedKey && status === 'connected' && (
            <div className="text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/40 font-mono flex items-center justify-between">
              <span>Kunci Aktif: {maskedKey}</span>
              <span className="text-emerald-400 font-sans text-[11px] font-semibold flex items-center gap-1">
                <ShieldCheck size={14} /> Aktif di STB
              </span>
            </div>
          )}
        </div>

        {/* Input Form Card */}
        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/60 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Key size={18} className="text-amber-400" />
                Masukkan Gemini API Key
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Kunci ini digunakan bot untuk memindai foto meteran PLN & struk pembayaran otomatis.
              </p>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <span>🔑 Dapatkan API Key Gratis</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">API Key Gemini (Awalan AIza...)</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={maskedKey ? 'Tempel API Key baru jika ingin mengganti...' : 'Tempel API Key Gemini Anda di sini...'}
                className="w-full bg-slate-900/70 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 pr-12 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              💡 API Key disimpan permanen di database server dan langsung aktif seketika tanpa perlu restart.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Menghubungkan ke Google...</span>
              </>
            ) : (
              <>
                <Zap size={16} />
                <span>Simpan & Hubungkan</span>
              </>
            )}
          </button>
        </div>

        {/* Petunjuk Pengambilan API Key */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2.5">
          <div className="font-bold text-white text-sm flex items-center gap-2">
            <span>📋 Cara Mendapatkan API Key Gratis dalam 1 Menit:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1 leading-relaxed">
            <li>Klik tombol <strong className="text-amber-300">"🔑 Dapatkan API Key Gratis"</strong> di atas (atau buka <span className="font-mono text-cyan-300">aistudio.google.com/app/apikey</span>).</li>
            <li>Login menggunakan akun Google / Gmail biasa Anda (tanpa perlu kartu kredit).</li>
            <li>Klik tombol biru <strong className="text-white">"Create API key"</strong>.</li>
            <li>Salin <strong className="text-amber-300">(Copy)</strong> kode API Key yang muncul (biasanya berawalan <code className="text-cyan-300 font-mono">AIzaSy...</code>).</li>
            <li>Kembali ke halaman ini, tempel di kotak input, lalu klik <strong className="text-white">"Simpan & Hubungkan"</strong>. Selesai! 🎉</li>
          </ol>
        </div>
      </div>
    </PageContainer>
  );
}
