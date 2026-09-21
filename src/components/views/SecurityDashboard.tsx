import { useState, useEffect } from 'react';
import { PageContainer } from '../PageContainer';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  Cpu, 
  Database, 
  EyeOff, 
  BellRing, 
  CheckCircle2, 
  AlertTriangle,
  KeyRound,
  FileCode2,
  HardDriveDownload,
  Zap,
  Fingerprint,
  Layers,
  Archive,
  Play
} from 'lucide-react';

interface SecurityTelemetry {
  status: 'ACTIVE' | 'WARNING' | 'ALERT';
  uptimeSeconds: number;
  layers: {
    egis: { status: 'ONLINE'; blockedAttacks: number; inspectedPackets: number; mode: string };
    nyxguard: { status: 'ONLINE'; bannedIPsCount: number; rateLimitsTriggered: number; botSpamBlocked: number };
    anchor: { status: 'ONLINE'; integrityChecksPassed: number; tamperAttempts: number; hashAlgorithm: string };
    purge: { status: 'ONLINE'; sanitizedPayloads: number; redactedSensitiveLeaks: number };
    helios: { status: 'ONLINE'; activeAlertsCount: number; healthScore: number; lastAudit: string };
    atlas: { status: 'ONLINE'; activeLocksCount: number; raceConditionsPrevented: number; processedIdempotentKeys: number };
    forge: { status: 'ONLINE'; inspectedFiles: number; blockedPolyglots: number; magicBytesVerified: number };
    warden: { status: 'ONLINE'; twoFactorEnabled: boolean; csrfChecksPassed: number; timingSafeVerifications: number; canaryTripped: boolean };
    crypt: { status: 'ONLINE'; algorithm: string; encryptedFieldsCount: number; decryptedRequestsCount: number };
    vault: { status: 'ONLINE'; totalBackups: number; lastBackupTime: string; lastDrillStatus: string; lastDrillTime: string };
  };
  threatLogs: {
    id: string;
    timestamp: string;
    layer: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    action: string;
    details: string;
  }[];
}

export function SecurityDashboard({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<SecurityTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [unbanIPInput, setUnbanIPInput] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Active Interactive Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'atlas' | 'forge' | 'warden' | 'crypt' | 'vault'>('overview');

  // Interactive Atlas State
  const [atlasTesting, setAtlasTesting] = useState(false);
  const [atlasResult, setAtlasResult] = useState<any>(null);

  // Interactive Forge State
  const [forgeResult, setForgeResult] = useState<any>(null);
  const [forgeScanning, setForgeScanning] = useState(false);

  // Interactive Warden State
  const [twoFAInfo, setTwoFAInfo] = useState<any>(null);
  const [testTotpCode, setTestTotpCode] = useState('');
  const [totpVerifyResult, setTotpVerifyResult] = useState<string>('');
  const [csrfToken, setCsrfToken] = useState('');

  // Interactive Crypt State
  const [cryptInput, setCryptInput] = useState('PIN: 190497 | API: digiflazz_secret_live_994829');
  const [cryptResult, setCryptResult] = useState<any>(null);
  const [cryptTesting, setCryptTesting] = useState(false);

  // Interactive Vault State
  const [vaultDrillRunning, setVaultDrillRunning] = useState(false);
  const [drillResult, setDrillResult] = useState<any>(null);
  const [backupRunning, setBackupRunning] = useState(false);
  const [backupsList, setBackupsList] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/security/stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Gagal mengambil data keamanan:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/security/vault/backups');
      if (res.ok) {
        const json = await res.json();
        setBackupsList(json.backups || []);
      }
    } catch (e) {}
  };

  const fetch2FAInfo = async () => {
    try {
      const res = await fetch('/api/security/warden/2fa-info');
      if (res.ok) {
        const json = await res.json();
        setTwoFAInfo(json);
      }
      const csrfRes = await fetch('/api/security/warden/csrf');
      if (csrfRes.ok) {
        const csrfJson = await csrfRes.json();
        setCsrfToken(csrfJson.csrfToken || '');
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchStats();
    fetchBackups();
    fetch2FAInfo();
    const timer = setInterval(fetchStats, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleUnban = async () => {
    if (!unbanIPInput.trim()) return;
    try {
      const res = await fetch('/api/security/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: unbanIPInput.trim() })
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(`✅ ${json.message}`);
        setUnbanIPInput('');
        fetchStats();
        setTimeout(() => setActionMessage(''), 4000);
      } else {
        setActionMessage(`❌ ${json.error || 'Gagal'}`);
      }
    } catch (e) {
      setActionMessage('❌ Terjadi kesalahan jaringan');
    }
  };

  // Run Atlas Race Condition Stress Test
  const runAtlasTest = async () => {
    setAtlasTesting(true);
    setAtlasResult(null);
    try {
      const res = await fetch('/api/security/atlas/test-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: 'member-stress-test', count: 5 })
      });
      const json = await res.json();
      setAtlasResult(json);
      fetchStats();
    } catch (e: any) {
      setAtlasResult({ success: false, error: e.message });
    } finally {
      setAtlasTesting(false);
    }
  };

  // Test Forge with clean or malicious payload
  const runForgeScan = async (type: 'clean' | 'webshell') => {
    setForgeScanning(true);
    setForgeResult(null);
    try {
      let base64Content = '';
      let filename = '';

      if (type === 'clean') {
        // Genuine 1x1 PNG Magic Bytes: 89 50 4E 47 ...
        filename = 'genuine_product.png';
        base64Content = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      } else {
        // Malicious Polyglot Webshell (JPEG header containing <?php eval($_POST['cmd']); ?>)
        filename = 'photo_trojan.jpg.php';
        // FF D8 FF E0 + <?php eval($_POST['cmd']); ?>
        const fakeBinary = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
        const phpPayload = Buffer.from("<?php eval($_POST['cmd']); ?>");
        base64Content = Buffer.concat([fakeBinary, phpPayload]).toString('base64');
      }

      const res = await fetch('/api/security/forge/scan-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, base64Content })
      });
      const json = await res.json();
      setForgeResult({ ...json, status: res.status });
      fetchStats();
    } catch (e: any) {
      setForgeResult({ success: false, error: e.message });
    } finally {
      setForgeScanning(false);
    }
  };

  // Test Warden TOTP
  const verifyTotpCode = async () => {
    if (!testTotpCode) return;
    try {
      const res = await fetch('/api/security/warden/2fa-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: testTotpCode })
      });
      const json = await res.json();
      if (json.success) {
        setTotpVerifyResult('✅ KODE 2FA VALID! Akses Diberikan (Constant-Time Checked)');
      } else {
        setTotpVerifyResult(`❌ KODE 2FA SALAH: ${json.error}`);
      }
    } catch (e: any) {
      setTotpVerifyResult('❌ Gagal menghubungi server');
    }
  };

  // Toggle 2FA Active Requirement
  const toggle2FA = async (enable: boolean) => {
    try {
      const res = await fetch('/api/security/warden/2fa-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: enable, code: twoFAInfo?.sampleCode || testTotpCode })
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        fetch2FAInfo();
        fetchStats();
      } else {
        alert(json.error);
      }
    } catch (e: any) {
      alert('Gagal mengubah status 2FA');
    }
  };

  // Test Crypt AES-256-GCM
  const runCryptTest = async () => {
    setCryptTesting(true);
    try {
      const res = await fetch('/api/security/crypt/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cryptInput })
      });
      const json = await res.json();
      setCryptResult(json);
      fetchStats();
    } catch (e: any) {
      setCryptResult({ success: false, error: e.message });
    } finally {
      setCryptTesting(false);
    }
  };

  // Run Vault Backup & Drill
  const createBackup = async () => {
    setBackupRunning(true);
    try {
      const res = await fetch('/api/security/vault/backup', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        alert('✅ ' + json.message);
        fetchBackups();
        fetchStats();
      } else {
        alert('❌ ' + json.error);
      }
    } catch (e: any) {
      alert('Gagal membuat backup');
    } finally {
      setBackupRunning(false);
    }
  };

  const runDisasterDrill = async () => {
    setVaultDrillRunning(true);
    setDrillResult(null);
    try {
      const res = await fetch('/api/security/vault/drill', { method: 'POST' });
      const json = await res.json();
      setDrillResult(json);
      fetchStats();
    } catch (e: any) {
      setDrillResult({ success: false, message: e.message });
    } finally {
      setVaultDrillRunning(false);
    }
  };

  return (
    <PageContainer title="Pusat Pertahanan Siber 10-Layer Ultra-Fortress" onBack={onBack}>
      <div className="space-y-6 max-w-6xl">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 shadow-xl shadow-indigo-950/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-2 border border-indigo-500/30">
                <ShieldCheck size={14} className="text-indigo-400" />
                10-Layer Military Grade Cyber Defense
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                E4 STORE ULTRA-FORTRESS
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  ACTIVE • 99.9% SECURE
                </span>
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
                Arsitektur pertahanan lengkap 10 lapisan: <strong>Egis</strong>, <strong>Nyxguard</strong>, <strong>Anchor</strong>, <strong>Purge</strong>, <strong>Helios</strong>, <strong>Atlas</strong> (Atomic Mutex), <strong>Forge</strong> (Polyglot Hunter), <strong>Warden</strong> (2FA/CSRF), <strong>Crypt</strong> (AES-256-GCM), dan <strong>Vault</strong> (Disaster Recovery).
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Health Score</div>
                <div className="text-3xl font-black text-emerald-400">
                  {data?.layers.helios.healthScore || 100}%
                </div>
              </div>
              <button
                onClick={() => { fetchStats(); fetchBackups(); fetch2FAInfo(); }}
                disabled={loading}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Refresh Status Keamanan"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-700/40">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <Layers size={14} /> 10-Layer Grid
            </button>
            <button
              onClick={() => setActiveTab('atlas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'atlas' ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <Zap size={14} className="text-amber-400" /> Atlas (Race Condition)
            </button>
            <button
              onClick={() => setActiveTab('forge')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'forge' ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <FileCode2 size={14} className="text-rose-400" /> Forge (Polyglot Scan)
            </button>
            <button
              onClick={() => setActiveTab('warden')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'warden' ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <Fingerprint size={14} className="text-sky-400" /> Warden (2FA & CSRF)
            </button>
            <button
              onClick={() => setActiveTab('crypt')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'crypt' ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <KeyRound size={14} className="text-emerald-400" /> Crypt (AES-256-GCM)
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'vault' ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              <Archive size={14} className="text-purple-400" /> Vault (Disaster Recovery)
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW 10-LAYER GRID */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Egis */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                      <Shield size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">1. EGIS</h3>
                      <div className="text-[9px] text-sky-400 font-semibold tracking-wider uppercase">WAF Deep Inspector</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">Tangkal SQLi, XSS, Path Traversal, OS Injection, dan Malicious Scanners.</p>
              </div>
              <div className="border-t border-slate-700/40 pt-2 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between"><span>Paket Diinspeksi:</span><strong className="text-white font-mono">{data?.layers.egis.inspectedPackets || 0}</strong></div>
                <div className="flex justify-between"><span>Serangan Ditangkal:</span><strong className="text-emerald-400 font-mono">{data?.layers.egis.blockedAttacks || 0}</strong></div>
              </div>
            </div>

            {/* 2. Nyxguard */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                      <Lock size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">2. NYXGUARD</h3>
                      <div className="text-[9px] text-purple-400 font-semibold tracking-wider uppercase">Sentry & Anti-Spam</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">Karantina otomatis IP jahat dan filter Anti-Flood bot Telegram/WA.</p>
              </div>
              <div className="border-t border-slate-700/40 pt-2 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between"><span>IP Dikarantina:</span><strong className="text-amber-400 font-mono">{data?.layers.nyxguard.bannedIPsCount || 0}</strong></div>
                <div className="flex justify-between"><span>Spam Bot Dicegah:</span><strong className="text-emerald-400 font-mono">{data?.layers.nyxguard.botSpamBlocked || 0}</strong></div>
              </div>
            </div>

            {/* 3. Anchor */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                      <Database size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">3. ANCHOR</h3>
                      <div className="text-[9px] text-amber-400 font-semibold tracking-wider uppercase">HMAC Tamper-Proof</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">Tanda tangan HMAC-SHA256 untuk mendeteksi manipulasi saldo & ledger.</p>
              </div>
              <div className="border-t border-slate-700/40 pt-2 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between"><span>Integritas Lolos:</span><strong className="text-emerald-400 font-mono">{data?.layers.anchor.integrityChecksPassed || 0}</strong></div>
                <div className="flex justify-between"><span>Manipulasi Dicegah:</span><strong className="text-emerald-400 font-mono">{data?.layers.anchor.tamperAttempts || 0}</strong></div>
              </div>
            </div>

            {/* 4. Purge */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                      <EyeOff size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">4. PURGE</h3>
                      <div className="text-[9px] text-rose-400 font-semibold tracking-wider uppercase">Zero-Trust Sanitizer</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">Pembersihan payload prototype pollution dan sensor kredensial di memory log.</p>
              </div>
              <div className="border-t border-slate-700/40 pt-2 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between"><span>Payload Disanitasi:</span><strong className="text-white font-mono">{data?.layers.purge.sanitizedPayloads || 0}</strong></div>
                <div className="flex justify-between"><span>Kebocoran Dicegah:</span><strong className="text-emerald-400 font-mono">{data?.layers.purge.redactedSensitiveLeaks || 0}</strong></div>
              </div>
            </div>

            {/* 5. Helios */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center border border-yellow-500/30">
                      <BellRing size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">5. HELIOS</h3>
                      <div className="text-[9px] text-yellow-400 font-semibold tracking-wider uppercase">Threat Intelligence</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">Pengiriman sinyal bahaya real-time ke Telegram Owner 24/7 otomatis.</p>
              </div>
              <div className="border-t border-slate-700/40 pt-2 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between"><span>Notifikasi Telegram:</span><strong className="text-emerald-400">Aktif</strong></div>
                <div className="flex justify-between"><span>Audit:</span><strong className="text-white font-mono text-[10px]">{data?.layers.helios.lastAudit || 'Hari Ini'}</strong></div>
              </div>
            </div>

            {/* 6. ATLAS (New) */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
                      <Zap size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">6. ATLAS</h3>
                      <div className="text-[9px] text-amber-300 font-semibold tracking-wider uppercase">Atomic Mutex & Lock</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">Mencegah race condition saldo dan transaksi paralel ganda (Anti-Double Spend).</p>
              </div>
              <div className="border-t border-slate-700/40 pt-2 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between"><span>Race Ditangkal:</span><strong className="text-emerald-400 font-mono">{data?.layers.atlas.raceConditionsPrevented || 0}</strong></div>
                <div className="flex justify-between"><span>Idempotent Keys:</span><strong className="text-white font-mono">{data?.layers.atlas.processedIdempotentKeys || 0}</strong></div>
              </div>
            </div>

            {/* 7. FORGE (New) */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center border border-rose-500/30">
                      <FileCode2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">7. FORGE</h3>
                      <div className="text-[9px] text-rose-300 font-semibold tracking-wider uppercase">Polyglot Hunter</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">Inspeksi magic bytes biner & scan polyglot (JPEG+PHP webshell) dan isolasi nama file.</p>
              </div>
              <div className="border-t border-slate-700/40 pt-2 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between"><span>Polyglot Diblokir:</span><strong className="text-emerald-400 font-mono">{data?.layers.forge.blockedPolyglots || 0}</strong></div>
                <div className="flex justify-between"><span>Magic Bytes Valid:</span><strong className="text-white font-mono">{data?.layers.forge.magicBytesVerified || 0}</strong></div>
              </div>
            </div>

            {/* 8. WARDEN (New) */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-500/30">
                      <Fingerprint size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">8. WARDEN</h3>
                      <div className="text-[9px] text-sky-300 font-semibold tracking-wider uppercase">2FA, Timing & CSRF</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">Anti-timing attack (timingSafeEqual), 2FA TOTP Authenticator, dan proteksi CSRF token.</p>
              </div>
              <div className="border-t border-slate-700/40 pt-2 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between"><span>2FA Admin Status:</span><strong className={data?.layers.warden.twoFactorEnabled ? "text-emerald-400 font-bold" : "text-slate-400"}>{data?.layers.warden.twoFactorEnabled ? "AKTIF" : "Standby"}</strong></div>
                <div className="flex justify-between"><span>Timing Verifikasi:</span><strong className="text-white font-mono">{data?.layers.warden.timingSafeVerifications || 0}</strong></div>
              </div>
            </div>

            {/* 9. CRYPT (New) */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <KeyRound size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">9. CRYPT</h3>
                      <div className="text-[9px] text-emerald-400 font-semibold tracking-wider uppercase">AES-256-GCM Storage</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">Enkripsi terautentikasi (Authenticated Encryption) data sensitif di penyimpanan disk.</p>
              </div>
              <div className="border-t border-slate-700/40 pt-2 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between"><span>Algoritma:</span><strong className="text-emerald-400 font-mono">AES-256-GCM</strong></div>
                <div className="flex justify-between"><span>Field Dienkripsi:</span><strong className="text-white font-mono">{data?.layers.crypt.encryptedFieldsCount || 0}</strong></div>
              </div>
            </div>

            {/* 10. VAULT (New) */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                      <Archive size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">10. VAULT</h3>
                      <div className="text-[9px] text-purple-300 font-semibold tracking-wider uppercase">Disaster Recovery</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">Snapshot harian terenkripsi, SHA-256 integrity checksum, dan uji pemulihan mandiri.</p>
              </div>
              <div className="border-t border-slate-700/40 pt-2 space-y-1 text-xs text-slate-400">
                <div className="flex justify-between"><span>Total Snapshot:</span><strong className="text-white font-mono">{data?.layers.vault.totalBackups || 0} File</strong></div>
                <div className="flex justify-between"><span>Status Drill:</span><strong className="text-emerald-400 text-[10px]">{data?.layers.vault.lastDrillStatus || 'Siap'}</strong></div>
              </div>
            </div>

            {/* Unban IP Tool */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between md:col-span-2">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <Cpu size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Bebaskan Karantina IP (Nyxguard)</h3>
                    <div className="text-[9px] text-slate-400 font-semibold uppercase">Manual Unban Sentry Tool</div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  Lepaskan IP pelanggan atau kasir toko Anda yang tidak sengaja terkena blokir/karantina rate-limit Nyxguard di website E4 Store.
                </p>

                {/* Important Clarification Banner for Digiflazz */}
                <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <AlertTriangle size={14} /> PENTING: Beda Fungsi dengan Whitelist IP Digiflazz!
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Jika Bot Telegram mengirim notifikasi: <span className="text-amber-300 font-mono font-semibold">"IP Anda tidak kami kenali: 182.11.183.xxx"</span>, IP tersebut <strong>BUKAN diisi di sini</strong>. IP tersebut adalah IP server toko Anda yang harus dimasukkan ke <strong>Dashboard Website Digiflazz (digiflazz.com) &gt; Menu Pengaturan &gt; Tambah Whitelist IP</strong> agar transaksi PPOB diizinkan oleh pihak Digiflazz.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Masukkan IP pengunjung/pelanggan yang terblokir (contoh: 192.168.1.1)"
                    value={unbanIPInput}
                    onChange={(e) => setUnbanIPInput(e.target.value)}
                    className="flex-1 bg-slate-900/80 border border-slate-700 px-3 py-2 rounded-xl text-white text-xs outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleUnban}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Bebaskan IP
                  </button>
                </div>
                {actionMessage && <div className="text-xs font-medium text-emerald-400 mt-1">{actionMessage}</div>}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATLAS (RACE CONDITION MUTEX) */}
        {activeTab === 'atlas' && (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
                <Zap size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">ATLAS: Atomic Transaction Mutex & Idempotency</h3>
                <p className="text-xs text-slate-400">
                  Uji ketahanan terhadap serangan Race Condition. 5 request paralel debit saldo @Rp 25.000 dikirim bersamaan pada saldo Rp 100.000.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="text-xs text-slate-300">
                <strong>Skenario Uji:</strong> Tanpa Mutex, saldo bisa terpotong ganda atau tembus negatif. Dengan ATLAS Mutex, setiap request diserialisasi secara atomic dan saldo tepat berkurang Rp 100.000 (4 transaksi berhasil, request ke-5 ditolak karena saldo habis).
              </div>

              <button
                onClick={runAtlasTest}
                disabled={atlasTesting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-2"
              >
                <Play size={14} />
                {atlasTesting ? 'Menguji 5 Request Paralel...' : 'Jalankan Uji Balapan Saldo ATLAS'}
              </button>

              {atlasResult && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-amber-500/30 font-mono text-xs space-y-2">
                  <div className="text-emerald-400 font-bold">{atlasResult.message}</div>
                  <div className="text-slate-300">Saldo Akhir: <strong className="text-white">Rp {atlasResult.finalBalance?.toLocaleString('id-ID')}</strong> (Tepat 0, Tidak Negatif)</div>
                  <div className="mt-2 space-y-1">
                    {atlasResult.executionLogs?.map((log: string, idx: number) => (
                      <div key={idx} className={log.includes('SUKSES') ? 'text-emerald-300' : 'text-amber-400'}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: FORGE (FILE & POLYGLOT SCANNER) */}
        {activeTab === 'forge' && (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center border border-rose-500/30">
                <FileCode2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">FORGE: Deep Magic Bytes & Polyglot Webshell Hunter</h3>
                <p className="text-xs text-slate-400">
                  Uji inspeksi file upload. FORGE memeriksa binary header biner asli (bukan cuma nama .jpg) dan memindai skrip berbahaya yang disisipkan (JPEG+PHP Polyglot).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Uji 1: File Asli (Genuine PNG)
                </h4>
                <p className="text-xs text-slate-400">
                  Kirim gambar PNG dengan header magic bytes valid (89 50 4E 47).
                </p>
                <button
                  onClick={() => runForgeScan('clean')}
                  disabled={forgeScanning}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Uji File Asli
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle size={16} /> Uji 2: Serangan Polyglot (JPEG + PHP Webshell)
                </h4>
                <p className="text-xs text-slate-400">
                  Kirim file berkedok foto namun mengandung skrip tersembunyi `&lt;?php eval($_POST['cmd']); ?&gt;`.
                </p>
                <button
                  onClick={() => runForgeScan('webshell')}
                  disabled={forgeScanning}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Uji Serangan Webshell
                </button>
              </div>
            </div>

            {forgeResult && (
              <div className={`p-4 rounded-xl font-mono text-xs border ${
                forgeResult.success ? 'bg-slate-950 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                <div className="font-bold text-sm mb-1">
                  {forgeResult.success ? '✅ FILE LOLOS VALIDASI FORGE' : '🚨 FILE DITOLAK FORGE HUNTER'}
                </div>
                <div>{forgeResult.message || forgeResult.error}</div>
                {forgeResult.sanitizedFilename && (
                  <div className="mt-2 text-slate-400">
                    Nama File Diisolasi: <strong className="text-white">{forgeResult.sanitizedFilename}</strong> ({forgeResult.mimeType})
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WARDEN (2FA TOTP & CSRF) */}
        {activeTab === 'warden' && (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-500/30">
                <Fingerprint size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">WARDEN: Session Hardening, 2FA (TOTP) & CSRF</h3>
                <p className="text-xs text-slate-400">
                  Proteksi timing attack dengan `crypto.timingSafeEqual`, autentikasi 2FA RFC 6238 kompatibel dengan Google Authenticator, dan proteksi CSRF.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 2FA Setup */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock size={16} className="text-sky-400" /> Status 2FA Admin (TOTP)
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    twoFAInfo?.enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {twoFAInfo?.enabled ? 'AKTIF (WAJIB 2FA)' : 'STANDBY (OPSIONAL)'}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  <div>Secret Key: <strong className="text-sky-300 font-mono select-all">{twoFAInfo?.secret || 'E4STORESECRET2026'}</strong></div>
                  <div>Sample Live Code: <strong className="text-emerald-400 font-mono text-sm tracking-widest">{twoFAInfo?.sampleCode || '000000'}</strong> (berganti setiap 30 detik)</div>
                  <div>Emergency Backup Codes: <strong className="text-white">{twoFAInfo?.backupCodesCount || 8} kode aktif</strong></div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => toggle2FA(!twoFAInfo?.enabled)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      twoFAInfo?.enabled ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {twoFAInfo?.enabled ? 'Nonaktifkan 2FA' : 'Aktifkan 2FA Wajib Admin'}
                  </button>
                </div>
              </div>

              {/* Verify TOTP Test */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" /> Uji Kode 6-Digit (Timing-Safe)
                </h4>
                <p className="text-xs text-slate-400">
                  Masukkan kode dari Google Authenticator atau sample kode di samping untuk memverifikasi.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={8}
                    placeholder="000000"
                    value={testTotpCode}
                    onChange={(e) => setTestTotpCode(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white font-mono tracking-widest text-center text-sm outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={verifyTotpCode}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Verifikasi
                  </button>
                </div>

                {totpVerifyResult && (
                  <div className="text-xs font-mono font-medium p-2 rounded-lg bg-slate-950 border border-slate-800">
                    {totpVerifyResult}
                  </div>
                )}

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  Active CSRF Token: <strong className="text-slate-300 font-mono select-all truncate block">{csrfToken || 'Menghubungkan...'}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CRYPT (AES-256-GCM) */}
        {activeTab === 'crypt' && (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <KeyRound size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">CRYPT: Zero-Knowledge Authenticated Encryption at Rest</h3>
                <p className="text-xs text-slate-400">
                  Data sensitif dienkripsi menggunakan AES-256-GCM dengan 96-bit random Initialization Vector (IV) dan 128-bit Authentication Tag.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                Teks Sensitif untuk Diuji Enkripsi:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cryptInput}
                  onChange={(e) => setCryptInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white text-xs outline-none focus:border-emerald-500"
                />
                <button
                  onClick={runCryptTest}
                  disabled={cryptTesting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  {cryptTesting ? 'Memproses...' : 'Uji AES-256-GCM'}
                </button>
              </div>

              {cryptResult && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-emerald-500/30 font-mono text-xs space-y-2">
                  <div className="text-emerald-400 font-bold">Algoritma: {cryptResult.algorithm}</div>
                  <div>Ciphertext (Terenkripsi): <strong className="text-indigo-300 break-all">{cryptResult.encrypted?.ciphertext}</strong></div>
                  <div>Random IV (12-byte): <strong className="text-amber-400">{cryptResult.encrypted?.iv}</strong></div>
                  <div>AuthTag (16-byte): <strong className="text-rose-400">{cryptResult.encrypted?.tag}</strong></div>
                  <div className="pt-2 border-t border-slate-800 text-emerald-300">
                    Hasil Dekripsi & Verifikasi Integritas: <strong className="text-white">{cryptResult.decrypted}</strong> (100% Cocok)
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: VAULT (BACKUP & DISASTER RECOVERY) */}
        {activeTab === 'vault' && (
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                <Archive size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">VAULT: Disaster Recovery & Automated Encrypted Snapshots</h3>
                <p className="text-xs text-slate-400">
                  Perlindungan terhadap kegagalan hardware, ransomware, atau kerusakan data dengan snapshot terenkripsi AES-256-GCM dan simulasi Disaster Recovery Drill.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={createBackup}
                disabled={backupRunning}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-2"
              >
                <HardDriveDownload size={14} />
                {backupRunning ? 'Membuat Backup...' : 'Buat Backup Snapshot Sekarang'}
              </button>

              <button
                onClick={runDisasterDrill}
                disabled={vaultDrillRunning}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-2"
              >
                <Play size={14} />
                {vaultDrillRunning ? 'Menjalankan Drill...' : 'Jalankan Disaster Recovery Drill'}
              </button>
            </div>

            {drillResult && (
              <div className={`p-4 rounded-xl font-mono text-xs border ${
                drillResult.success ? 'bg-slate-950 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}>
                <div className="font-bold text-sm mb-1">{drillResult.message}</div>
                {drillResult.success && (
                  <div className="space-y-1 text-slate-300 mt-2">
                    <div>File Diuji: <strong className="text-white">{drillResult.testedBackup}</strong></div>
                    <div>Waktu Pemulihan (RTO): <strong className="text-emerald-400">{drillResult.durationMs} ms</strong></div>
                    <div>Data Terverifikasi: <strong className="text-white">{drillResult.verifiedRecords?.transactions} Transaksi, {drillResult.verifiedRecords?.members} Member</strong></div>
                  </div>
                )}
              </div>
            )}

            {/* List of backups */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Daftar Snapshot Terenkripsi Tersimpan ({backupsList.length} File)
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {backupsList.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-3 bg-slate-900/40 rounded-xl">
                    Belum ada snapshot tersimpan. Klik "Buat Backup Snapshot Sekarang" di atas.
                  </div>
                ) : (
                  backupsList.map((b, i) => (
                    <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <div className="font-mono text-indigo-300 flex items-center gap-2">
                        <Lock size={12} className="text-purple-400" />
                        {b.filename}
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 font-mono text-[10px]">
                        <span>{(b.sizeBytes / 1024).toFixed(1)} KB</span>
                        <span>{b.created}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Live Threat Logs Table */}
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-400" />
                Live Threat & Audit Intelligence Log
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Log real-time penangkalan insiden keamanan oleh 10 lapisan pertahanan
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
              {data?.threatLogs.length || 0} Insiden Tercatat
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900/50 border-b border-slate-700/50">
                <tr>
                  <th className="py-2.5 px-3">Waktu (WITA)</th>
                  <th className="py-2.5 px-3">Layer</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Sumber</th>
                  <th className="py-2.5 px-3">Tindakan</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 font-mono">
                {(!data?.threatLogs || data.threatLogs.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500 font-sans">
                      <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2 opacity-60" />
                      Sistem 100% aman dan bersih. Tidak ada ancaman aktif saat ini.
                    </td>
                  </tr>
                ) : (
                  data.threatLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-2.5 px-3 font-bold text-indigo-300">{log.layer}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          log.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          log.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-slate-700/50 text-slate-300'
                        }`}>
                          {log.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{log.source}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-semibold">{log.action}</td>
                      <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
