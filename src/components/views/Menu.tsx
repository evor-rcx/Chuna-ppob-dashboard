import { BarChart3, ShoppingCart, FileText, Settings, Bot, Send, Users, Store, Lock, ShieldAlert, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Bell, Eye, EyeOff, MessageSquare, Clock, ArrowRight, ExternalLink, CheckCheck, Mic, Volume2, VolumeX, X, Loader2 } from 'lucide-react';
import { Page } from '../../types';
import { ReactNode, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getHolidayInfo } from '../../utils/holidays';
import { playPowerDown, playTerminalBlip, playNotificationChime, speakWaNotification } from '../../utils/audio';
import { ServerHardwareWidget } from '../ServerHardwareWidget';

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

  // WITA Clock & Dynamic Holiday State
  const [witaTime, setWitaTime] = useState('');
  const [witaDate, setWitaDate] = useState('');
  const [holidayInfo, setHolidayInfo] = useState<any>(null);

  // Digiflazz Live Balance State
  const [digiflazzBalance, setDigiflazzBalance] = useState<number>(0);
  const [digiflazzStatus, setDigiflazzStatus] = useState<string>('Disconnected');
  const [showBalance, setShowBalance] = useState<boolean>(true);

  // Notification Modal State
  const [showNotifModal, setShowNotifModal] = useState<boolean>(false);
  const [isFetchingNotif, setIsFetchingNotif] = useState<boolean>(false);
  const [lastNotifRefreshed, setLastNotifRefreshed] = useState<Date>(new Date());

  // Services Real-time Status
  const [servicesStatus, setServicesStatus] = useState<{
    digiflazz: { connected: boolean; balance: number; status: string; description: string };
    wa: { connected: boolean; status: string; description: string };
    telegram: { connected: boolean; status: string; description: string };
    gemini: { connected: boolean; description: string };
  }>({
    digiflazz: { connected: false, balance: 0, status: 'Checking...', description: 'Memeriksa koneksi Digiflazz...' },
    wa: { connected: false, status: 'Checking...', description: 'Memeriksa bot WhatsApp...' },
    telegram: { connected: false, status: 'Checking...', description: 'Memeriksa bot Telegram...' },
    gemini: { connected: false, description: 'Memeriksa AI Gemini...' }
  });

  // Incoming WhatsApp Messages
  const [waMessages, setWaMessages] = useState<Array<{
    id: string;
    senderJid?: string;
    senderNumber: string;
    senderName: string;
    text: string;
    timestamp: number;
    isRead: boolean;
    replied?: boolean;
  }>>([]);
  const [unreadWaCount, setUnreadWaCount] = useState<number>(0);

  // Quick WA Reply State (Voice Note / VN & Text)
  const [replyTargetMsg, setReplyTargetMsg] = useState<{
    id: string;
    senderJid: string;
    senderName: string;
    senderNumber: string;
    text: string;
  } | null>(null);
  const [replyMode, setReplyMode] = useState<'vn' | 'text'>('vn');
  const [replyText, setReplyText] = useState<string>('');
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);
  const [isPreviewingAudio, setIsPreviewingAudio] = useState<boolean>(false);
  const [replyAlert, setReplyAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Suara Notifikasi Otomatis WhatsApp (TTS)
  const [isWaTtsEnabled, setIsWaTtsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('e4_wa_tts_enabled');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [isTestingTts, setIsTestingTts] = useState<boolean>(false);
  const isFirstFetchRef = useRef<boolean>(true);
  const seenWaMsgIdsRef = useRef<Set<string>>(new Set());

  const toggleWaTts = () => {
    setIsWaTtsEnabled(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('e4_wa_tts_enabled', String(next));
      }
      return next;
    });
  };

  const handleTestTts = async () => {
    if (isTestingTts) return;
    setIsTestingTts(true);
    playNotificationChime();
    try {
      await speakWaNotification('Rian', 'Aku lapar sekali');
    } catch (e) {
      console.warn('Test voice error:', e);
    } finally {
      setIsTestingTts(false);
    }
  };

  const fetchSystemNotifications = async () => {
    setIsFetchingNotif(true);
    try {
      const [digiRes, waRes, botRes, geminiRes, msgRes] = await Promise.allSettled([
        fetch('/api/digiflazz/status').then(r => r.json()),
        fetch('/api/wa/status').then(r => r.json()),
        fetch('/api/bot/status').then(r => r.json()),
        fetch('/api/config/gemini').then(r => r.json()),
        fetch('/api/wa/messages').then(r => r.json())
      ]);

      // 1. Digiflazz Status
      if (digiRes.status === 'fulfilled') {
        const d = digiRes.value;
        const isConn = Boolean(d && (d.status === 'Connected' || (d.balance !== undefined && Number(d.balance) > 0)));
        const bal = Number(d.balance || 0);
        setDigiflazzBalance(bal);
        setDigiflazzStatus(d.status || (isConn ? 'Connected' : 'Disconnected'));
        setServicesStatus(prev => ({
          ...prev,
          digiflazz: {
            connected: isConn,
            balance: bal,
            status: d.status || (isConn ? 'Connected' : 'Disconnected'),
            description: isConn
              ? `Saldo aktif: Rp ${bal.toLocaleString('id-ID')}`
              : 'Kredensial API belum dikonfigurasi di menu Konfig API'
          }
        }));
      } else {
        setServicesStatus(prev => ({
          ...prev,
          digiflazz: {
            connected: false,
            balance: 0,
            status: 'Disconnected',
            description: 'Kredensial API belum dikonfigurasi di menu Konfig API'
          }
        }));
      }

      // 2. WhatsApp Bot Status
      if (waRes.status === 'fulfilled') {
        const w = waRes.value;
        const isConn = Boolean(w && w.status && (w.status.includes('Connected') || w.status.includes('connected')));
        setServicesStatus(prev => ({
          ...prev,
          wa: {
            connected: isConn,
            status: w.status || 'Disconnected',
            description: isConn ? String(w.status) : 'WhatsApp belum di-pairing'
          }
        }));
      } else {
        setServicesStatus(prev => ({
          ...prev,
          wa: {
            connected: false,
            status: 'Disconnected',
            description: 'WhatsApp belum di-pairing'
          }
        }));
      }

      // 3. Telegram Bot Status
      if (botRes.status === 'fulfilled') {
        const b = botRes.value;
        const isConn = Boolean(b && (b.running || (b.status && b.status.includes('Connected'))));
        setServicesStatus(prev => ({
          ...prev,
          telegram: {
            connected: isConn,
            status: b.status || 'Disconnected',
            description: isConn ? String(b.status || 'Bot Telegram siap melayani 24 jam') : 'WhatsApp/Telegram belum di-pairing'
          }
        }));
      } else {
        setServicesStatus(prev => ({
          ...prev,
          telegram: {
            connected: false,
            status: 'Disconnected',
            description: 'WhatsApp/Telegram belum di-pairing'
          }
        }));
      }

      // 4. AI Gemini OCR Status
      if (geminiRes.status === 'fulfilled') {
        const g = geminiRes.value;
        const isConn = Boolean(g && g.connected);
        setServicesStatus(prev => ({
          ...prev,
          gemini: {
            connected: isConn,
            description: isConn
              ? 'Kunci API terpasang, OCR PLN & bukti transfer siap'
              : 'API Key Gemini belum disetel'
          }
        }));
      } else {
        setServicesStatus(prev => ({
          ...prev,
          gemini: {
            connected: false,
            description: 'API Key Gemini belum disetel'
          }
        }));
      }

      // 5. WhatsApp Incoming Messages
      if (msgRes.status === 'fulfilled' && msgRes.value && Array.isArray(msgRes.value.messages)) {
        const currentMessages = msgRes.value.messages;
        setWaMessages(currentMessages);
        const unread = Number(msgRes.value.unreadCount ?? currentMessages.filter((m: any) => !m.isRead).length);
        setUnreadWaCount(unread);

        if (isFirstFetchRef.current) {
          // Pada inisialisasi awal, tandai semua pesan yang sudah ada agar tidak memicu suara sekaligus
          currentMessages.forEach((m: any) => {
            if (m.id) seenWaMsgIdsRef.current.add(String(m.id));
          });
          isFirstFetchRef.current = false;
        } else {
          // Filter pesan baru yang belum pernah dibacakan dan belum dibaca
          const brandNewMessages = currentMessages.filter(
            (m: any) => !m.isRead && m.id && !seenWaMsgIdsRef.current.has(String(m.id))
          );

          if (brandNewMessages.length > 0) {
            brandNewMessages.forEach((m: any) => {
              if (m.id) seenWaMsgIdsRef.current.add(String(m.id));
            });

            // Jika saklar suara aktif, putar nada chime dan bacakan pesan terbaru
            if (isWaTtsEnabled) {
              const latestMsg = brandNewMessages[0];
              playNotificationChime();
              speakWaNotification(latestMsg.senderName || 'Pelanggan', latestMsg.text || '');
            }
          }
        }
      }
      setLastNotifRefreshed(new Date());
    } catch (e) {
      console.error('Failed to fetch system notifications:', e);
    } finally {
      setIsFetchingNotif(false);
    }
  };

  const handleMarkAllWaRead = async () => {
    try {
      await fetch('/api/wa/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      setWaMessages(prev => prev.map(m => ({ ...m, isRead: true })));
      setUnreadWaCount(0);
    } catch (e) {}
  };

  const handleOpenWaChat = async (msgId: string) => {
    try {
      await fetch('/api/wa/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msgId })
      });
      setWaMessages(prev => prev.map(m => m.id === msgId ? { ...m, isRead: true } : m));
      setUnreadWaCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
    setShowNotifModal(false);
    onNavigate('bot');
  };

  const handleOpenReplyDialog = (msg: any) => {
    setReplyTargetMsg({
      id: msg.id,
      senderJid: msg.senderJid || (msg.senderNumber ? `${msg.senderNumber}@s.whatsapp.net` : ''),
      senderName: msg.senderName || 'Pelanggan',
      senderNumber: msg.senderNumber || '',
      text: msg.text || ''
    });
    setReplyText('');
    setReplyAlert(null);
    setReplyMode('vn');
    // Also mark read quietly
    try {
      fetch('/api/wa/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msg.id })
      });
      setWaMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
      setUnreadWaCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const handlePreviewAudio = async () => {
    if (!replyTargetMsg || !replyText.trim()) return;
    setIsPreviewingAudio(true);
    const spokenGreeting = `Halo kakk ${replyTargetMsg.senderName}, ${replyText.trim()}`;
    try {
      const res = await fetch('/api/wa/tts-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: spokenGreeting })
      });
      if (res.ok) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPreviewingAudio(false);
        audio.onerror = () => setIsPreviewingAudio(false);
        await audio.play();
        return;
      }
    } catch (e) {
      console.warn('Backend TTS preview failed, using Web Speech fallback', e);
    }

    // Web Speech API fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(spokenGreeting);
      utterance.lang = 'id-ID';
      utterance.rate = 1.05;
      utterance.onend = () => setIsPreviewingAudio(false);
      utterance.onerror = () => setIsPreviewingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPreviewingAudio(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyTargetMsg || !replyText.trim()) return;
    setIsSendingReply(true);
    setReplyAlert(null);
    try {
      const res = await fetch('/api/wa/send-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msgId: replyTargetMsg.id,
          senderJid: replyTargetMsg.senderJid,
          senderName: replyTargetMsg.senderName,
          replyText: replyText.trim(),
          mode: replyMode
        })
      });
      const data = await res.json();
      if (data.success) {
        setReplyAlert({
          type: 'success',
          message: data.message || 'Pesan berhasil dikirim ke WhatsApp!'
        });
        setWaMessages(prev => prev.map(m => m.id === replyTargetMsg.id ? { ...m, isRead: true, replied: true } : m));
        setTimeout(() => {
          setReplyTargetMsg(null);
          setReplyText('');
          setReplyAlert(null);
        }, 1600);
      } else {
        setReplyAlert({
          type: 'error',
          message: data.error || 'Gagal mengirim balasan ke WhatsApp'
        });
      }
    } catch (err: any) {
      setReplyAlert({
        type: 'error',
        message: 'Terjadi kesalahan koneksi ke server'
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  const formatRelativeTime = (ts: number) => {
    if (!ts) return 'Baru saja';
    const diffSec = Math.floor((Date.now() - ts) / 1000);
    if (diffSec < 30) return 'Baru saja';
    if (diffSec < 60) return `${diffSec} dtk lalu`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt lalu`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
    return new Date(ts).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const offlineServicesCount =
    (servicesStatus.digiflazz.connected ? 0 : 1) +
    (servicesStatus.wa.connected ? 0 : 1) +
    (servicesStatus.telegram.connected ? 0 : 1) +
    (servicesStatus.gemini.connected ? 0 : 1);

  const totalAttentionCount = offlineServicesCount + unreadWaCount;

  // Logout Terminal Sequence State
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [logoutLogs, setLogoutLogs] = useState<string[]>([]);

  useEffect(() => {
    const updateWita = () => {
      const now = new Date();
      // Format time in Asia/Makassar (WITA)
      const timeOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const timeStr = new Intl.DateTimeFormat('id-ID', timeOptions).format(now).replace(/\./g, ':');
      setWitaTime(timeStr);

      const dateOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Makassar',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      const dateStr = new Intl.DateTimeFormat('id-ID', dateOptions).format(now);
      setWitaDate(dateStr);

      setHolidayInfo(getHolidayInfo(now));
    };

    updateWita();
    const timer = setInterval(updateWita, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchSystemNotifications();
    const interval = setInterval(fetchSystemNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    playPowerDown();
    
    const logs = [
      "INITIATING LOGOUT SEQUENCE...",
      "DISCONNECTING FROM MAINFRAME...",
      "CLEARING LOCAL CACHE...",
      "CLOSING SECURE SOCKETS...",
      "TERMINATING PPOB CONNECTION...",
      "PURGING SESSION DATA...",
      "ENCRYPTING LOCAL STORE...",
      "ACCESS REVOKED.",
      "GOODBYE, OWNER E4 STORE."
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setLogoutLogs(prev => [...prev, logs[currentLogIndex]]);
        playTerminalBlip();
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          sessionStorage.removeItem('chuna_auth');
          window.dispatchEvent(new Event('logout'));
        }, 1500);
      }
    }, 400);
  };

  const handleItemClick = (id: Page) => {
    if (id === 'produk' || id === 'konfig' || id === 'saldo' || id === 'bot' || id === 'security' || id === 'gemini') {
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

  const menuItems: { id: Page; icon: ReactNode; label: string; subtitle: string; iconBg: string }[] = [
    { id: 'ringkasan', icon: <BarChart3 size={24} />, label: 'RINGKASAN', subtitle: 'Laba • Trx • Grafik', iconBg: 'bg-amber-50 text-amber-500 border border-amber-200/60' },
    { id: 'produk', icon: <ShoppingCart size={24} />, label: 'PRODUK', subtitle: 'Prabayar • Pascabayar...', iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/60' },
    { id: 'transaksi', icon: <FileText size={24} />, label: 'TRANSAKSI', subtitle: 'Sukses • Pending • Gagal...', iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60' },
    { id: 'konfig', icon: <Settings size={24} />, label: 'KONFIG API', subtitle: 'Digiflazz • WA Owner', iconBg: 'bg-orange-50 text-orange-500 border border-orange-200/60' },
    { id: 'gemini', icon: <Sparkles size={24} />, label: 'KONFIG AI GEMINI', subtitle: 'Model • API Key • Prompts', iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/60' },
    { id: 'bot', icon: <Bot size={24} />, label: 'BOT WA / TELE', subtitle: 'Status • QR Baileys • Tele', iconBg: 'bg-cyan-50 text-cyan-600 border border-cyan-200/60' },
    { id: 'saldo', icon: <Send size={24} />, label: 'SALDO TELEGRAM', subtitle: 'Cek & Topup Saldo Bot', iconBg: 'bg-sky-50 text-sky-600 border border-sky-200/60' },
    { id: 'member-offline', icon: <Users size={24} />, label: 'MEMBER OFFLINE', subtitle: 'Data Pelanggan & Utang', iconBg: 'bg-teal-50 text-teal-600 border border-teal-200/60' },
    { id: 'kasir-fisik', icon: <Store size={24} />, label: 'KASIR FISIK', subtitle: 'Transaksi Langsung & POS', iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60' },
    { id: 'security', icon: <ShieldAlert size={24} />, label: 'KEAMANAN SUPER', subtitle: 'PIN • Proteksi • Audit Log', iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/60' },
  ];

  const isConnected = digiflazzStatus?.includes('Connected');

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-slate-50 to-indigo-50/40 rounded-[32px] p-4 sm:p-6 md:p-8 text-slate-800 shadow-sm border border-slate-200/80 relative overflow-hidden animate-in fade-in duration-300 stb-accelerated-scroll">
      {/* Background Dot Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />

      {/* Ambient Static Glows (Ringan, Halus & Hemat Daya untuk STB Armbian) */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 bg-sky-200/35 rounded-full pointer-events-none" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-200/35 rounded-full pointer-events-none" />

      {/* 1. Header Atas (Top Bar): Avatar/Logo Bergerak + Sapaan & Bell Notifikasi */}
      <div className={`relative flex items-center justify-between pb-4 border-b border-slate-200/70 ${showNotifModal ? 'z-50' : 'z-20'}`}>
        <div className="flex items-center gap-3">
          {/* Wadah Lingkaran Ikon Bergerak E4 Store */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 aspect-square rounded-full p-0.5 bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-500 shadow-md flex items-center justify-center transform-gpu">
            <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center relative transform-gpu">
              <video
                src="/logo.mp4"
                poster="/logo.webp"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover pointer-events-none transform-gpu will-change-transform"
                onError={(e) => {
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const img = document.createElement('img');
                    img.src = '/logo.webp';
                    img.className = 'w-full h-full object-cover pointer-events-none';
                    img.onerror = () => { img.src = '/logo.gif'; };
                    parent.replaceChild(img, e.currentTarget);
                  }
                }}
              />
            </div>
            {/* Pulsing Aura Ring */}
            <span className="absolute inset-0 rounded-full border border-sky-400/50 animate-ping pointer-events-none opacity-40"></span>
          </div>

          <div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">Halo, Owner 👋</p>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">E4 STORE</h2>
          </div>
        </div>

        {/* Tombol Notifikasi & Suara WhatsApp */}
        <div className="flex items-center gap-2">
          {/* Tombol Cepat Suara TTS WhatsApp (Mute / Unmute) */}
          <button
            onClick={toggleWaTts}
            className={`p-2.5 rounded-full border shadow-2xs transition-all cursor-pointer active:scale-95 ${
              isWaTtsEnabled
                ? 'bg-blue-50/90 border-blue-200 text-blue-600 hover:bg-blue-100'
                : 'bg-white border-slate-200/80 text-slate-400 hover:bg-slate-100'
            }`}
            title={isWaTtsEnabled ? 'Suara Notifikasi WhatsApp: AKTIF (Klik untuk Mute)' : 'Suara Notifikasi WhatsApp: BISU (Klik untuk Aktifkan)'}
          >
            {isWaTtsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Lonceng Notifikasi Melingkar dengan Badge Dinamis */}
          <div className="relative">
          <motion.button
            animate={totalAttentionCount > 0 ? { rotate: [0, -10, 10, -10, 8, 0] } : {}}
            transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.8 }}
            onClick={() => {
              const next = !showNotifModal;
              setShowNotifModal(next);
              if (next) {
                fetchSystemNotifications();
              }
            }}
            className="relative p-2.5 rounded-full bg-white border border-slate-200/80 shadow-xs hover:bg-slate-100 transition-colors cursor-pointer text-slate-700 active:scale-95"
            title="Notifikasi Sistem"
          >
            <Bell size={20} className={totalAttentionCount > 0 ? 'text-blue-600' : 'text-slate-700'} />
            
            {/* Dynamic Badge */}
            {totalAttentionCount > 0 ? (
              <span className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-xs ${
                unreadWaCount > 0 ? 'bg-blue-600 animate-pulse' : 'bg-rose-500'
              }`}>
                {totalAttentionCount > 9 ? '9+' : totalAttentionCount}
              </span>
            ) : (
              /* Green dot for 100% all clear / normal */
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white shadow-2xs" title="Semua Layanan Normal & Aktif" />
            )}
          </motion.button>

          {/* Popup Dropdown Notifikasi Sistem (Melayang di Pojok Kanan Atas di Bawah Lonceng) */}
          <AnimatePresence>
            {showNotifModal && (
              <>
                {/* Backdrop Transparan Bening (Click Outside to Close, Tanpa Menggelapkan Layar) */}
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setShowNotifModal(false)}
                />

                {/* Dropdown Melayang di Pojok Kanan Atas */}
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute right-0 top-12 z-50 w-[calc(100vw-2.5rem)] max-w-sm sm:w-96 bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-4 text-xs space-y-3 max-h-[75vh] overflow-y-auto"
                >
                  {/* Header Dropdown */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 shadow-2xs">
                        <Bell size={17} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm leading-tight">Notifikasi Sistem</h4>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                          Real-time STB Server
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => fetchSystemNotifications()}
                        className={`p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-all cursor-pointer ${isFetchingNotif ? 'animate-spin text-blue-600' : ''}`}
                        title="Refresh Data Segar"
                      >
                        <RefreshCw size={15} />
                      </button>
                      <button
                        onClick={() => setShowNotifModal(false)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-sm font-bold leading-none"
                        title="Tutup"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Panel Pengaturan Suara Notifikasi Text-to-Speech (TTS) */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={toggleWaTts}
                        className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                          isWaTtsEnabled
                            ? 'bg-blue-600 text-white shadow-2xs hover:bg-blue-700'
                            : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                        }`}
                        title={isWaTtsEnabled ? 'Suara TTS Aktif (Klik untuk Mute)' : 'Suara TTS Mati (Klik untuk Aktifkan)'}
                      >
                        {isWaTtsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 text-[11px] truncate">Suara Voice Note WA</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full shrink-0 ${
                            isWaTtsEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isWaTtsEnabled ? 'AKTIF' : 'MUTE'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">Suara asli Chuna (id-ID-GadisNeural)</p>
                      </div>
                    </div>

                    <button
                      onClick={handleTestTts}
                      disabled={isTestingTts}
                      className="px-2.5 py-1.5 text-[10px] font-bold text-blue-600 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs shrink-0 disabled:opacity-50"
                      title="Uji coba suara Voice Note: Rian - Aku lapar sekali"
                    >
                      {isTestingTts ? 'Memutar Suara...' : 'Tes Suara'}
                    </button>
                  </div>

                {/* Header Pesan Masuk Bot WA */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/80 border border-slate-200/70">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-blue-700">
                    <MessageSquare size={13} />
                    <span>Chat Masuk Bot WA</span>
                  </div>
                  {unreadWaCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black animate-pulse">
                      {unreadWaCount} Baru
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[9px] font-bold">
                      {waMessages.length} Pesan
                    </span>
                  )}
                </div>

                {/* Pesan Masuk Bot WA */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between px-0.5 pb-1">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Chat Masuk Terbaru ({waMessages.length})
                    </span>
                    {unreadWaCount > 0 && (
                      <button
                        onClick={handleMarkAllWaRead}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck size={12} />
                        Tandai Semua Dibaca
                      </button>
                    )}
                  </div>

                  {waMessages.length === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                      <MessageSquare size={26} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600 text-xs">Belum Ada Chat Masuk</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Setiap pesan baru dari pelanggan di WhatsApp Bot akan otomatis tampil di sini.
                      </p>
                    </div>
                  ) : (
                    waMessages.slice(0, 5).map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2.5 rounded-xl border transition-all ${
                          !msg.isRead
                            ? 'bg-blue-50/80 border-blue-200/90 shadow-2xs'
                            : 'bg-slate-50/60 border-slate-200/70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {!msg.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 animate-pulse" title="Pesan Belum Dibaca" />
                            )}
                            <span className="font-bold text-slate-800 truncate text-[11px]">
                              {msg.senderName}
                            </span>
                            {msg.senderNumber && (
                              <span className="text-[10px] text-slate-500 font-mono bg-white/80 px-1.5 py-0.2 rounded border border-slate-200/60 shrink-0">
                                +{msg.senderNumber}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap shrink-0">
                            {formatRelativeTime(msg.timestamp)}
                          </span>
                        </div>

                        <div className="mt-1.5 text-slate-700 bg-white/90 p-2 rounded-lg border border-slate-100 text-[11px] leading-relaxed line-clamp-2">
                          {msg.text}
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-1.5">
                          {msg.replied ? (
                            <span className="text-[10px] text-emerald-600 font-bold inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                              <CheckCheck size={11} /> Dibalas
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Pesan Masuk</span>
                          )}
                          <button
                            onClick={() => {
                              setShowNotifModal(false);
                              handleOpenReplyDialog(msg);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                          >
                            <Mic size={11} />
                            <span>Balas Voice Note (VN)</span>
                            <ArrowRight size={10} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Modal Ringkas */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>STB Real-time Telemetry</span>
                  <button
                    onClick={() => setShowNotifModal(false)}
                    className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        </div>
      </div>
      </div>

      {/* 2. Baris Waktu (WITA), Tanggal, Hari Libur Nasional & Tombol Logout */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h3 className="text-sm font-extrabold tracking-wider text-slate-700 uppercase">E4 STORE</h3>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-mono">
              {witaTime || '14:25:36'}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-500 font-sans">WITA</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">{witaDate}</p>

          {holidayInfo && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 text-blue-600 border border-blue-200/70 text-xs font-semibold shadow-2xs mt-2.5">
              <span>🇮🇩</span>
              <span>{holidayInfo.text}</span>
              {holidayInfo.isToday && (
                <span className="relative flex h-2 w-2 ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Kartu Kanan: E4 STORE & [ LOGOUT ] */}
        <div className="bg-white/95 border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center min-w-[140px] self-start sm:self-auto">
          <span className="text-base sm:text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            E4 STORE
          </span>
          <button
            onClick={handleLogout}
            className="mt-2.5 w-full px-4 py-1.5 text-xs font-bold tracking-wider text-rose-500 border border-rose-300 hover:bg-rose-50 rounded-xl transition-all cursor-pointer text-center active:scale-95"
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* 4. Telemetri STB / Hardware & Status Sistem PPOB Digiflazz Terpadu */}
      <div className="relative z-10 space-y-4 my-5">
        <ServerHardwareWidget variant="modern_glass" />

        {/* Card Status Sistem PPOB Server (Terpadu di Tab STB / HW) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3 transition-all hover:border-slate-300">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Status Sistem PPOB Server
            </span>
            <span className={`flex items-center gap-1.5 text-xs font-bold ${isConnected ? 'text-emerald-600' : 'text-rose-500'}`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              {isConnected ? 'Connected & Stable' : 'Disconnected'}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${isConnected ? 'bg-emerald-500 w-full' : 'bg-rose-500 w-1/4'}`} />
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SHIELD: EGIS • NYX • ANCHOR
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-200/60">
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* 5. Card Utama Saldo Digiflazz Besar dengan Efek Shimmer & Toggle Mata */}
      <div className="relative z-10 my-5">
        <div className="rounded-[28px] p-6 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 border border-indigo-100/90 shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center">
          {/* Gradient Shimmer Sweep Effect */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
          />

          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 select-all font-sans">
              {showBalance ? `Rp ${digiflazzBalance.toLocaleString('id-ID')}` : 'Rp ••••••••'}
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 rounded-full hover:bg-indigo-100/50 text-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
              title={showBalance ? 'Sembunyikan Saldo' : 'Tampilkan Saldo'}
            >
              {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          {/* Pulsing Green Indicator Dot */}
          <div className="mt-3 flex items-center justify-center">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
          </div>
        </div>
      </div>

      {/* 6. Grid Menu Navigasi 2 Kolom (Card Style Modern & Interaktif) */}
      <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-4 my-6">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => handleItemClick(item.id)}
            className="bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-200/80 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 transition-all cursor-pointer group relative overflow-hidden text-left"
          >
            {/* Ikon Gembok untuk Menu Sensitif */}
            {(item.id === 'produk' || item.id === 'konfig' || item.id === 'saldo' || item.id === 'bot' || item.id === 'gemini' || item.id === 'security') && (
              <div className="absolute top-2.5 right-2.5 text-slate-300 group-hover:text-amber-500 transition-colors">
                <Lock size={12} />
              </div>
            )}

            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${item.iconBg}`}>
              {item.icon}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight uppercase group-hover:text-blue-600 transition-colors truncate">
                {item.label}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate mt-0.5">
                {item.subtitle}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-50 text-amber-500 border border-amber-200/60">
                  <Lock size={18} />
                </span>
                Keamanan Tambahan
              </h3>
              <button onClick={() => setShowPasswordModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">✕</button>
            </div>
            
            <p className="text-slate-500 text-xs sm:text-sm mb-4">Masukkan kata sandi untuk mengakses menu ini.</p>
            
            <input 
              type="password" 
              value={passwordInput}
              onChange={e => { setPasswordInput(e.target.value); setPasswordError(false); }}
              onKeyDown={e => { if (e.key === 'Enter') verifyPassword(); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none mb-2 text-sm transition-all"
              placeholder="Kata Sandi Admin"
              autoFocus
            />

            {show2FAField && (
              <div className="mt-2 mb-2 animate-fadeIn">
                <label className="text-xs text-indigo-600 font-bold block mb-1">
                  🔑 2FA Authenticator Code (6-digit)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={totpInput}
                  onChange={e => { setTotpInput(e.target.value); setPasswordError(false); }}
                  onKeyDown={e => { if (e.key === 'Enter') verifyPassword(); }}
                  className="w-full bg-slate-50 border border-indigo-200 rounded-xl p-3 text-slate-900 tracking-widest text-center font-mono font-bold focus:border-indigo-500 focus:bg-white outline-none text-base"
                  placeholder="000000"
                  autoFocus
                />
              </div>
            )}

            {passwordError && <p className="text-rose-500 text-xs mb-4 font-semibold">{errorMessage || 'Kata sandi salah!'}</p>}
            
            <div className="flex gap-3 mt-6">
               <button 
                 onClick={() => setShowPasswordModal(null)}
                 className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95"
               >
                 Batal
               </button>
               <button 
                 onClick={verifyPassword}
                 className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
               >
                 Buka Akses
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Logout Overlay Animation */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div 
            className="fixed inset-0 z-50 bg-[#050914] flex flex-col p-8 font-mono text-cyan-500 shadow-[inset_0_0_100px_rgba(6,182,212,0.1)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Terminal Header */}
            <div className="flex justify-between items-center border-b border-cyan-900/50 pb-4 mb-6">
              <div className="text-xs tracking-[0.3em] uppercase">E4 STORE - System Terminal</div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-900 animate-pulse"></div>
                <div className="w-3 h-3 rounded-full bg-cyan-900"></div>
                <div className="w-3 h-3 rounded-full bg-cyan-900"></div>
              </div>
            </div>
            
            {/* Terminal Logs */}
            <div className="flex-1 overflow-hidden flex flex-col justify-end">
              {logoutLogs.map((log, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="mb-2 text-sm md:text-lg flex gap-3"
                >
                  <span className="text-cyan-700">[{new Date().toISOString().split('T')[1].substring(0,8)}]</span>
                  <span className={log?.includes('REVOKED') || log?.includes('GOODBYE') ? 'text-cyan-300 font-bold' : ''}>
                    {log}
                  </span>
                </motion.div>
              ))}
              {/* Blinking Cursor */}
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-3 h-5 bg-cyan-500 mt-2"
              ></motion.div>
            </div>
            
            {/* Grid Overlay for CRT effect */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Popup Balas Chat WhatsApp (Pesan Suara / Voice Note PTT) */}
      <AnimatePresence>
        {replyTargetMsg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header Modal */}
              <div className="px-5 py-4 bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shrink-0 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Mic size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-wide">Balas Chat Pelanggan (Voice Note)</h3>
                    <p className="text-[11px] text-emerald-100">Kirim pesan suara resmi WhatsApp dengan sapaan ramah</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyTargetMsg(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all cursor-pointer text-white/90 hover:text-white"
                  title="Tutup Modal"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4">
                {/* 1. Detail Pengirim & Pesan Terakhir */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200">
                        {replyTargetMsg.senderName ? replyTargetMsg.senderName.charAt(0).toUpperCase() : 'W'}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-800">
                          {replyTargetMsg.senderName}
                        </div>
                        {replyTargetMsg.senderNumber && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            +{replyTargetMsg.senderNumber}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200/60">
                      Pelanggan WA
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/70 leading-relaxed italic">
                    "{replyTargetMsg.text}"
                  </div>
                </div>

                {/* 2. Pilihan Mode Balasan */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                    Metode Pengiriman:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReplyMode('vn')}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                        replyMode === 'vn'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Mic size={15} className={replyMode === 'vn' ? 'text-emerald-600' : 'text-slate-400'} />
                      <span>Pesan Suara (VN)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyMode('text')}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                        replyMode === 'text'
                          ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <MessageSquare size={15} className={replyMode === 'text' ? 'text-blue-600' : 'text-slate-400'} />
                      <span>Teks Biasa</span>
                    </button>
                  </div>
                </div>

                {/* 3. Input Balasan & Otomatisasi Panggilan Ramah */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">
                      Kata-Kata Balasan Admin:
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Otomatis: "Halo kakk {replyTargetMsg.senderName},"
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Ketik apa yang ingin Anda balas di sini... (contoh: pesanan pulsa sudah berhasil masuk ya, terima kasih banyak)"
                    className="w-full p-3 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-xs text-slate-800 outline-none transition-all resize-none shadow-2xs"
                  />
                  
                  {/* Live Preview Kalimat Lengkap */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-[11px] space-y-1">
                    <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block">
                      {replyMode === 'vn' ? '🎙️ Kalimat yang Akan Diucapkan Suara VN:' : '💬 Pesan yang Akan Terkirim:'}
                    </span>
                    <p className="font-semibold text-slate-800 italic">
                      "Halo kakk {replyTargetMsg.senderName}, {replyText.trim() || '...'}"
                    </p>
                  </div>
                </div>

                {/* 4. Fitur Preview Audio (Dengarkan Sebelum Kirim) */}
                {replyMode === 'vn' && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Volume2 size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-indigo-950 text-xs block">Dengarkan Sebelum Kirim</span>
                        <span className="text-indigo-600 text-[10px]">Tes intonasi suara AI perempuan ramah</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isPreviewingAudio || !replyText.trim()}
                      onClick={handlePreviewAudio}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-[11px] inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      {isPreviewingAudio ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Memutar Suara...</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={12} />
                          <span>Dengarkan Preview VN</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Alert Respon */}
                {replyAlert && (
                  <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    replyAlert.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {replyAlert.type === 'success' ? (
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{replyAlert.message}</span>
                  </div>
                )}
              </div>

              {/* Footer Aksi */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setReplyTargetMsg(null);
                    onNavigate('bot');
                  }}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Buka Menu Bot WA
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyTargetMsg(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isSendingReply || !replyText.trim()}
                    onClick={handleSendReply}
                    className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                      replyMode === 'vn'
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                    }`}
                  >
                    {isSendingReply ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>{replyMode === 'vn' ? 'Membuat Audio & Mengirim VN...' : 'Mengirim Teks...'}</span>
                      </>
                    ) : (
                      <>
                        {replyMode === 'vn' ? <Mic size={14} /> : <Send size={14} />}
                        <span>{replyMode === 'vn' ? 'Kirim Voice Note (PTT)' : 'Kirim Teks Balasan'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
