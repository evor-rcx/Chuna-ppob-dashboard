import { BarChart3, ShoppingCart, FileText, Settings, Bot, Send, Users, Store, Lock, ShieldAlert, Sparkles, CheckCircle2, AlertCircle, RefreshCw, ZoomIn, Copy, Check, Crown, Search, Layers, Bell, Eye, EyeOff, MessageSquare, Clock, ArrowRight, ExternalLink, CheckCheck } from 'lucide-react';
import { Page } from '../../types';
import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getHolidayInfo } from '../../utils/holidays';
import { playPowerDown, playTerminalBlip } from '../../utils/audio';
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
  const [notifTab, setNotifTab] = useState<'services' | 'messages'>('services');
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
    senderNumber: string;
    senderName: string;
    text: string;
    timestamp: number;
    isRead: boolean;
  }>>([]);
  const [unreadWaCount, setUnreadWaCount] = useState<number>(0);

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
        setWaMessages(msgRes.value.messages);
        const unread = Number(msgRes.value.unreadCount ?? msgRes.value.messages.filter((m: any) => !m.isRead).length);
        setUnreadWaCount(unread);
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

  // Live Nota Model Preview State
  const [activeNotaTab, setActiveNotaTab] = useState<'price-list' | 'tagihan-pasca' | 'konfirmasi' | 'royal-tidaklunas' | 'royal' | 'tagihan' | 'lunas' | 'angsuran'>('price-list');
  const [pascaVariant, setPascaVariant] = useState<'ditemukan' | 'tidak-ditemukan'>('ditemukan');
  const [konfirmasiStatusTab, setKonfirmasiStatusTab] = useState<'pending' | 'sukses' | 'gagal-tujuan' | 'gagal-ip' | 'gagal-saldo' | 'gagal-cutoff' | 'gagal-refund-saldo' | 'gagal-refund-cash' | 'gagal-refund-utang'>('pending');
  const [royalCategory, setRoyalCategory] = useState<'game' | 'pln-token' | 'pln-pasca' | 'pulsa' | 'ewallet'>('pln-token');
  const [priceListCategory, setPriceListCategory] = useState<string>('Games');
  const [priceListBrand, setPriceListBrand] = useState<string>('FREE FIRE');
  const [priceListType, setPriceListType] = useState<'owner' | 'vip' | 'biasa'>('owner');
  const [priceListPage, setPriceListPage] = useState<number>(0);
  const [priceListTotalPages, setPriceListTotalPages] = useState<number>(1);
  const [priceListTotalProducts, setPriceListTotalProducts] = useState<number>(12);
  const [customBrandSearch, setCustomBrandSearch] = useState<string>('');
  const [imageTimestamp, setImageTimestamp] = useState<number>(Date.now());
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  useEffect(() => {
    fetch(`/api/price-list-meta?brand=${encodeURIComponent(priceListBrand)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          setPriceListTotalPages(data.totalPages || 1);
          setPriceListTotalProducts(data.totalProducts || 0);
          if (priceListPage >= (data.totalPages || 1)) {
            setPriceListPage(0);
          }
        }
      })
      .catch(() => {});
  }, [priceListBrand]);

  const tagihanPascaDitemukanCaption = `Tagihan Kak Samsul ditemukan!
Rincian lengkapnya sudah Chuna lampirkan di gambar ya. Silakan lanjutkan pembayaran.
Terima kasih telah berbelanja di E4 Store! 🐾
Chuna ~ Asisten Imutmu siap bantu 24 jam! 😊💖`;

  const tagihanPascaTidakDitemukanCaption = `❌ Yah, tagihan Kak Samsul tidak ditemukan.
Pastikan ID Pelanggan / Nomor Meter sudah benar`;

  const tagihanPascaCaption = pascaVariant === 'ditemukan'
    ? tagihanPascaDitemukanCaption
    : tagihanPascaTidakDitemukanCaption;

  const konfirmasiPendingCaption = `⏳ Kak Koi, pesanan sedang diproses sistem pusat E4 Store.
Akan update otomatis ya, Kak. Mohon ditunggu.

📦 Produk: Free Fire 70 Diamond
🎯 Tujuan: 121 (Koi)

Chuna siap bantu! 😊`;

  const konfirmasiSuksesCaption = `🎉 Horee! Sukses, Kak Koi!

Pesanan sudah diproses otomatis oleh E4 Store. 💪🔥

Terima kasih telah berbelanja di E4 Store! 🐾
Chuna ~ Asisten Imutmu siap bantu 24 jam! 😊💖`;

  const konfirmasiGagalTujuanCaption = `❌ Aduh, Kak Koi, pesanan belum bisa diproses nih.

📦 Produk: Free Fire 70 Diamond
🎯 Tujuan: 121 (Koi)

Sepertinya nomor tujuan / ID game / ID PLN yang dimasukkan kurang tepat ya, Kak. Coba dicek lagi, pastikan tidak ada angka yang tertukar atau kurang. Kalau sudah benar, silakan order ulang ya, Kak.

Chuna siap bantu! 😊`;

  const konfirmasiGagalIpCaption = `❌ Maaf ya Kak Koi, pesanan belum berhasil diproses.

📦 Produk: Free Fire 70 Diamond
🎯 Tujuan: 121 (Koi)

Saat ini sedang ada perbaikan server dari pusat, jadi transaksi belum bisa dilanjutkan. Mohon tunggu sampai server kembali normal ya, Kak. Nanti bisa dicoba order ulang.

Chuna siap bantu! 😊`;

  const konfirmasiGagalSaldoCaption = `❌ Maaf ya Kak Koi, pesanan belum bisa diproses.

📦 Produk: Free Fire 70 Diamond
🎯 Tujuan: 121 (Koi)

Produk ini sedang kosong di pusat, jadi belum bisa diproses saat ini. Silakan coba beberapa saat lagi atau pilih nominal lain ya, Kak.

Chuna siap bantu! 😊`;

  const konfirmasiGagalCutoffCaption = `❌ Maaf ya Kak Koi, pesanan belum bisa diproses.

📦 Produk: Free Fire 70 Diamond
🎯 Tujuan: 121 (Koi)

Produk ini sedang tutup sementara dari pusat, jadi belum bisa diproses. Silakan dicoba lagi nanti ya, Kak. Nanti Chuna kabari kalau sudah buka.

Chuna siap bantu! 😊`;

  const konfirmasiGagalRefundSaldoCaption = `❌ Maaf ya Kak Koi, transaksi belum berhasil diproses.

📌 Keterangan: Terjadi kendala teknis dari pusat
📦 Produk: Free Fire 70 Diamond
🎯 Tujuan: 121 (Koi)

Kabar baiknya, dana Kakak sudah kami proses:
✅ Saldo Rp 11.000 telah dikembalikan ke akun Kakak.

Silakan coba lagi kapan saja, Kak.
Chuna siap bantu! 😊💪`;

  const konfirmasiGagalRefundCashCaption = `❌ Maaf ya Kak Koi, transaksi belum berhasil diproses.

📌 Keterangan: Terjadi kendala teknis dari pusat
📦 Produk: Free Fire 70 Diamond
🎯 Tujuan: 121 (Koi)

Kabar baiknya, dana Kakak sudah kami proses:
✅ Mohon kembalikan uang tunai sebesar Rp 11.000 kepada pelanggan ya, Kak.

Silakan coba lagi kapan saja.
Chuna siap bantu! 😊💪`;

  const konfirmasiGagalRefundUtangCaption = `❌ Maaf ya Kak Koi, transaksi belum berhasil diproses.

📌 Keterangan: Terjadi kendala teknis dari pusat
📦 Produk: Free Fire 70 Diamond
🎯 Tujuan: 121 (Koi)

Kabar baiknya, dana Kakak sudah kami proses:
✅ Tenang, utang Rp 11.000 sudah Chuna batalkan ya, Kak.

Silakan coba lagi kapan saja.
Chuna siap bantu! 😊💪`;

  const konfirmasiCaption = 
    konfirmasiStatusTab === 'pending' ? konfirmasiPendingCaption :
    konfirmasiStatusTab === 'sukses' ? konfirmasiSuksesCaption :
    konfirmasiStatusTab === 'gagal-tujuan' ? konfirmasiGagalTujuanCaption :
    konfirmasiStatusTab === 'gagal-ip' ? konfirmasiGagalIpCaption :
    konfirmasiStatusTab === 'gagal-saldo' ? konfirmasiGagalSaldoCaption :
    konfirmasiStatusTab === 'gagal-cutoff' ? konfirmasiGagalCutoffCaption :
    konfirmasiStatusTab === 'gagal-refund-cash' ? konfirmasiGagalRefundCashCaption :
    konfirmasiStatusTab === 'gagal-refund-utang' ? konfirmasiGagalRefundUtangCaption :
    konfirmasiGagalRefundSaldoCaption;

  const royalGameCaption = `E4 STORE\nStruk Pembayaran\n\nStatus: SUKSES (LUNAS)\n\n----------------------------------------\nNama: Lio\nStatus: Lunas\nMetode: CASH\nItem Game: Magic Chess Go Go 5 Diamonds\n\nID Tujuan Game: 836351001\nOrder ID: PRE-1790198576914\nTanggal: 24/09/2026 05:23 WITA\n----------------------------------------\n\nSERIAL NUMBER / SN\n@41 . RefId: GTX-260924XD2H4IF01V\n\n----------------------------------------\nTOTAL BAYAR: Rp 3.000\n----------------------------------------\n\nTerima kasih telah berbelanja di E4 Store!\nCetak: 24/09/2026 05:23 WITA | Kode: #PRE-179\nKamis, 24 September 2026 - Hari Tani Nasional (Hari Ini)\nChuna - Asisten Imutmu siap bantu 24 jam!`;

  const royalPlnTokenCaption = `E4 STORE\nStruk Pembayaran\n\nStatus: SUKSES (LUNAS)\n\n----------------------------------------\nNama: Samsul\nID Pelanggan: 14123456789\nNama Pel.: SAMSUL SIFA\nTarif / Daya: R1 / 1300 VA\nJml KWH: 13.2 kWh\nPembelian: PLN 20.000\n\nOrder ID: PRE-1790198576914\nTanggal: 24/09/2026 05:23 WITA\nMetode: CASH\n----------------------------------------\n\nTOKEN LISTRIK PLN\n4521-8930-1094-8265-1739\n\n----------------------------------------\nTOTAL BAYAR: Rp 21.500\n----------------------------------------\n\nTerima kasih telah berbelanja di E4 Store!\nCetak: 24/09/2026 05:23 WITA | Kode: #PRE-179\nKamis, 24 September 2026 - Hari Tani Nasional (Hari Ini)\nChuna - Asisten Imutmu siap bantu 24 jam!`;

  const royalPlnPascaCaption = `E4 STORE\nStruk Pembayaran\n\nStatus: SUKSES (LUNAS)\n\n----------------------------------------\nNama: Samsul\nID Pelanggan: 537311234567\nNama Pel.: SAMSUL SIFA\nTarif / Daya: R1M / 900 VA\nPeriode: SEP 2026 (1 Lembar)\nStand Meter: 00007944 - 00008015\nTagihan: PLN Pascabayar\n\nOrder ID: PRE-1790198576914\nTanggal: 24/09/2026 05:23 WITA\nMetode: CASH\n----------------------------------------\n\nNOMOR REFERENSI / REF ID\nRefId: PLN-260924XD2H4IF01V\n\n----------------------------------------\nTOTAL BAYAR: Rp 115.252\n----------------------------------------\n\nTerima kasih telah berbelanja di E4 Store!\nCetak: 24/09/2026 05:23 WITA | Kode: #PRE-179\nKamis, 24 September 2026 - Hari Tani Nasional (Hari Ini)\nChuna - Asisten Imutmu siap bantu 24 jam!`;

  const royalPulsaCaption = `E4 STORE\nStruk Pembayaran\n\nStatus: SUKSES (LUNAS)\n\n----------------------------------------\nNama: Kak Reza\nStatus: Lunas\nMetode: CASH\nPembelian: Telkomsel 50.000\n\nNomor Tujuan: 085822094851\nOrder ID: PRE-1790198576914\nTanggal: 24/09/2026 05:23 WITA\n----------------------------------------\n\nSERIAL NUMBER / SN\n@41 . RefId: TSEL-260924XD2H4IF01V\n\n----------------------------------------\nTOTAL BAYAR: Rp 51.500\n----------------------------------------\n\nTerima kasih telah berbelanja di E4 Store!\nCetak: 24/09/2026 05:23 WITA | Kode: #PRE-179\nKamis, 24 September 2026 - Hari Tani Nasional (Hari Ini)\nChuna - Asisten Imutmu siap bantu 24 jam!`;

  const royalEwalletCaption = `E4 STORE\nStruk Pembayaran\n\nStatus: SUKSES (LUNAS)\n\n----------------------------------------\nNama: Kak Lio\nStatus: Lunas\nMetode: CASH\nPembelian: DANA 100.000\n\nNomor Tujuan: 085822094851\nOrder ID: PRE-1790198576914\nTanggal: 24/09/2026 05:23 WITA\n----------------------------------------\n\nSERIAL NUMBER / SN\n@41 . RefId: DANA-260924XD2H4IF01V\n\n----------------------------------------\nTOTAL BAYAR: Rp 101.500\n----------------------------------------\n\nTerima kasih telah berbelanja di E4 Store!\nCetak: 24/09/2026 05:23 WITA | Kode: #PRE-179\nKamis, 24 September 2026 - Hari Tani Nasional (Hari Ini)\nChuna - Asisten Imutmu siap bantu 24 jam!`;

  const royalTidakLunasPlnCaption = `E4 STORE\nStruk Pembayaran\n\nStatus: SUKSES (TIDAK LUNAS)\n\n----------------------------------------\nNama                         Lio\nID Pelanggan                 32185604272\nOrder ID                     PRE-1788868200773\nTanggal                      08/09/2026 19:50 WITA\nPembelian                    PLN 20.000\nNama Pel.                    YOHANIS-AF\nGol/Daya                     R1 / 000000900\n----------------------------------------\n\nSerial nomber / SN                   0585-9340-6917-6385-5660\n\n----------------------------------------\nTOTAL BAYAR                  Rp 25.000\n----------------------------------------\n\nTerima kasih telah berbelanja di E4 Store!\nCetak: 08/09/2026 19:50 WITA | Kode: #PRE-17\nSelasa, Hari Raya Natal (108 hari lagi)\n\n----------------------------------------\nChuna - Asisten Imutmu siap bantu 24 jam!`;

  const royalTidakLunasGameCaption = `E4 STORE\nStruk Pembayaran\n\nStatus: SUKSES (TIDAK LUNAS)\n\n----------------------------------------\nNama                         Lio\nID Tujuan Game               836351001\nOrder ID                     PRE-1788868200773\nTanggal                      08/09/2026 19:50 WITA\nItem Game                    Free Fire 140 Diamond\nStatus                       TIDAK LUNAS\n----------------------------------------\n\nSerial nomber / SN                   @41 . RefId: FF-260928XD2H4IF01V\n\n----------------------------------------\nTOTAL BAYAR                  Rp 20.000\n----------------------------------------\n\nTerima kasih telah berbelanja di E4 Store!\nCetak: 08/09/2026 19:50 WITA | Kode: #PRE-17\nSelasa, Hari Raya Natal (108 hari lagi)\n\n----------------------------------------\nChuna - Asisten Imutmu siap bantu 24 jam!`;

  const royalTidakLunasPulsaCaption = `E4 STORE\nStruk Pembayaran\n\nStatus: SUKSES (TIDAK LUNAS)\n\n----------------------------------------\nNama                         Lio\nNomor Tujuan                 085822094851\nOrder ID                     PRE-1788868200773\nTanggal                      08/09/2026 19:50 WITA\nPembelian                    Telkomsel 50.000\nStatus                       TIDAK LUNAS\n----------------------------------------\n\nSerial nomber / SN                   @41 . RefId: TSEL-260928XD2H4IF01V\n\n----------------------------------------\nTOTAL BAYAR                  Rp 52.000\n----------------------------------------\n\nTerima kasih telah berbelanja di E4 Store!\nCetak: 08/09/2026 19:50 WITA | Kode: #PRE-17\nSelasa, Hari Raya Natal (108 hari lagi)\n\n----------------------------------------\nChuna - Asisten Imutmu siap bantu 24 jam!`;

  const royalTidakLunasEwalletCaption = `E4 STORE\nStruk Pembayaran\n\nStatus: SUKSES (TIDAK LUNAS)\n\n----------------------------------------\nNama                         Lio\nNomor Akun                   085822094851\nOrder ID                     PRE-1788868200773\nTanggal                      08/09/2026 19:50 WITA\nTop Up                       DANA 100.000\nStatus                       TIDAK LUNAS\n----------------------------------------\n\nSerial nomber / SN                   @41 . RefId: DANA-260928XD2H4IF01V\n\n----------------------------------------\nTOTAL BAYAR                  Rp 102.000\n----------------------------------------\n\nTerima kasih telah berbelanja di E4 Store!\nCetak: 08/09/2026 19:50 WITA | Kode: #PRE-17\nSelasa, Hari Raya Natal (108 hari lagi)\n\n----------------------------------------\nChuna - Asisten Imutmu siap bantu 24 jam!`;

  const royalLunasCaption = `✅ Transaksi Berhasil! Nota pembelian Kakak sudah LUNAS ya, Kak. Detail notanya ada di gambar. Terima kasih sudah belanja di E4 Store! 🥰`;

  const royalBelumLunasCaption = `✅ Transaksi Berhasil! Nota pembelian Kakak sudah tercatat, tapi statusnya masih BELUM LUNAS ya, Kak. Detail notanya ada di gambar. Terima kasih sudah belanja di E4 Store! 🥰`;

  const royalTidakLunasCaption = royalBelumLunasCaption;
  const royalCaption = royalLunasCaption;

  const tagihanCaption = `E4 Store\nBUKTI CATATAN TAGIHAN\nStatus: BELUM LUNAS\n\n----------------------------------------\nCustomer: Padil\nTanggal: 27/08/2026\n----------------------------------------\n\nItem:\n- Free Fire 70 Diamond: Rp 11.000\n- Free Fire Level Up Pass - Level 15: Rp 1.000\n\nTOTAL UTANG: Rp 12.000\n----------------------------------------\n\n"Tolong segera diselesaikan ya kak, terima kasih"\n\n----------------------------------------\nNo. HP: 085822094851`;

  const lunasCaption = `🎉 Horee! Lunas, Kak Reza!

Utang Rp 105.000 sudah dinyatakan LUNAS. Pembayaran tercatat Rp 105.000. Detail nota ada di gambar ya, Kak. 💪🔥

Terima kasih belanja di E4 Store! 🐾
Chuna ~ Asisten Imutmu siap bantu 24 jam! 😊💖`;

  const angsuranCaption = `⏳ Kak Reza, pembayaran sebagian sudah diterima!

Utang awal Rp 10.000. Sudah dibayar Rp 5.000. Sisa Rp 5.000 lagi ya, Kak. Rincian ada di gambar.

Chuna tunggu pelunasannya! 😊💖`;

  const priceListCaption = `🏷️ DAFTAR HARGA RESMI E4 STORE
Produk: ${priceListBrand}
Tipe: ${priceListType === 'owner' ? 'Harga Jual Owner (Termurah)' : priceListType === 'vip' ? 'Member VIP' : 'Pelanggan Biasa'}
Status: Normal • Proses Instant • 24 Jam

Harga sewaktu-waktu dapat berubah mengikuti sistem pusat Digiflazz.
Chuna ~ Asisten Imutmu siap bantu 24 jam! 😊💪`;

  const currentImageUrl = activeNotaTab === 'tagihan-pasca'
    ? `/api/demo-nota-cek-tagihan?t=${imageTimestamp}`
    : activeNotaTab === 'konfirmasi'
    ? `/api/demo-nota-konfirmasi?t=${imageTimestamp}`
    : activeNotaTab === 'price-list'
    ? `/api/demo-price-list-image?brand=${encodeURIComponent(priceListBrand)}&type=${priceListType}&page=${priceListPage}&t=${imageTimestamp}`
    : activeNotaTab === 'royal'
    ? `/api/demo-nota-royal?category=${royalCategory}&t=${imageTimestamp}`
    : activeNotaTab === 'royal-tidaklunas'
    ? `/api/demo-nota-royal-tidaklunas?category=${royalCategory}&t=${imageTimestamp}`
    : activeNotaTab === 'tagihan'
    ? `/api/demo-nota-tagihan-vintage?t=${imageTimestamp}`
    : activeNotaTab === 'lunas' 
    ? `/api/demo-nota-pelunasan?t=${imageTimestamp}`
    : `/api/demo-nota-angsuran?t=${imageTimestamp}`;

  const currentCaption = activeNotaTab === 'tagihan-pasca'
    ? tagihanPascaCaption
    : activeNotaTab === 'konfirmasi'
    ? konfirmasiCaption
    : activeNotaTab === 'price-list'
    ? priceListCaption
    : activeNotaTab === 'royal'
    ? royalCaption
    : activeNotaTab === 'royal-tidaklunas'
    ? royalTidakLunasCaption
    : activeNotaTab === 'tagihan'
    ? tagihanCaption
    : activeNotaTab === 'lunas' 
    ? lunasCaption 
    : angsuranCaption;

  const handleCopyText = () => {
    navigator.clipboard.writeText(currentCaption);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
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
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-slate-50 to-indigo-50/40 rounded-[32px] p-4 sm:p-6 md:p-8 text-slate-800 shadow-xl border border-slate-200/70 relative overflow-hidden backdrop-blur-xl animate-in fade-in duration-300">
      {/* Background Dot Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />

      {/* Moving Ambient Aurora Orbs */}
      <motion.div
        animate={{ x: [0, 25, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 bg-sky-300/25 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-300/25 rounded-full blur-3xl"
      />

      {/* 1. Header Atas (Top Bar): Avatar/Logo Bergerak + Sapaan & Bell Notifikasi */}
      <div className={`relative flex items-center justify-between pb-4 border-b border-slate-200/70 ${showNotifModal ? 'z-50' : 'z-20'}`}>
        <div className="flex items-center gap-3">
          {/* Wadah Lingkaran Ikon Bergerak E4 Store */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 aspect-square rounded-full p-0.5 bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-500 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center relative">
              <video
                src="/logo.mp4"
                poster="/logo.webp"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover pointer-events-none"
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
            className="relative p-2.5 rounded-full bg-white/95 border border-slate-200/80 shadow-xs hover:bg-slate-100 transition-colors cursor-pointer text-slate-700 active:scale-95"
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

                {/* Switcher Tab Segmented (Status Layanan vs Pesan Masuk Bot WA) */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/70">
                  <button
                    onClick={() => setNotifTab('services')}
                    className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      notifTab === 'services'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <span>Status Layanan</span>
                    {offlineServicesCount > 0 ? (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[9px] font-extrabold border border-rose-200">
                        {offlineServicesCount}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold border border-emerald-200">
                        4/4
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setNotifTab('messages')}
                    className={`py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      notifTab === 'messages'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <MessageSquare size={12} />
                    <span>Chat WA Bot</span>
                    {unreadWaCount > 0 ? (
                      <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-black animate-pulse">
                        {unreadWaCount} Baru
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-600 text-[9px] font-bold">
                        {waMessages.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Tab 1: Status Layanan */}
                {notifTab === 'services' && (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {/* Digiflazz Status */}
                    <div className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                      servicesStatus.digiflazz.connected
                        ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                        : 'bg-rose-50/70 border-rose-200/80 text-rose-950'
                    }`}>
                      <span className={`w-2 h-2 mt-1 rounded-full shrink-0 ${servicesStatus.digiflazz.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            servicesStatus.digiflazz.connected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
                          }`}>
                            {servicesStatus.digiflazz.connected ? 'Digiflazz Terhubung' : 'Digiflazz Belum Terhubung'}
                          </span>
                          {!servicesStatus.digiflazz.connected && (
                            <button
                              onClick={() => { setShowNotifModal(false); onNavigate('konfig'); }}
                              className="text-[10px] font-semibold text-rose-700 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              Konfig <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                        <p className={`text-[11px] mt-1 font-medium leading-relaxed ${servicesStatus.digiflazz.connected ? 'text-emerald-800' : 'text-rose-700'}`}>
                          {servicesStatus.digiflazz.description}
                        </p>
                      </div>
                    </div>

                    {/* WhatsApp Bot Status */}
                    <div className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                      servicesStatus.wa.connected
                        ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                        : 'bg-amber-50/70 border-amber-200/80 text-amber-950'
                    }`}>
                      <span className={`w-2 h-2 mt-1 rounded-full shrink-0 ${servicesStatus.wa.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            servicesStatus.wa.connected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-600 text-white'
                          }`}>
                            {servicesStatus.wa.connected ? 'Bot Aktif' : 'Bot Belum Terhubung'}
                          </span>
                          {!servicesStatus.wa.connected && (
                            <button
                              onClick={() => { setShowNotifModal(false); onNavigate('bot'); }}
                              className="text-[10px] font-semibold text-amber-800 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              Pairing WA <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                        <p className={`text-[11px] mt-1 font-medium leading-relaxed ${servicesStatus.wa.connected ? 'text-emerald-800' : 'text-amber-800'}`}>
                          {servicesStatus.wa.description}
                        </p>
                      </div>
                    </div>

                    {/* Telegram Bot Status */}
                    <div className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                      servicesStatus.telegram.connected
                        ? 'bg-sky-50/70 border-sky-200/80 text-sky-950'
                        : 'bg-amber-50/70 border-amber-200/80 text-amber-950'
                    }`}>
                      <span className={`w-2 h-2 mt-1 rounded-full shrink-0 ${servicesStatus.telegram.connected ? 'bg-sky-500 animate-pulse' : 'bg-amber-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            servicesStatus.telegram.connected
                              ? 'bg-sky-600 text-white'
                              : 'bg-amber-600 text-white'
                          }`}>
                            {servicesStatus.telegram.connected ? 'Bot Aktif' : 'Bot Belum Terhubung'}
                          </span>
                          {!servicesStatus.telegram.connected && (
                            <button
                              onClick={() => { setShowNotifModal(false); onNavigate('bot'); }}
                              className="text-[10px] font-semibold text-amber-800 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              Setel Bot <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                        <p className={`text-[11px] mt-1 font-medium leading-relaxed ${servicesStatus.telegram.connected ? 'text-sky-800' : 'text-amber-800'}`}>
                          {servicesStatus.telegram.description}
                        </p>
                      </div>
                    </div>

                    {/* AI Gemini OCR Status */}
                    <div className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                      servicesStatus.gemini.connected
                        ? 'bg-purple-50/70 border-purple-200/80 text-purple-950'
                        : 'bg-amber-50/70 border-amber-200/80 text-amber-950'
                    }`}>
                      <span className={`w-2 h-2 mt-1 rounded-full shrink-0 ${servicesStatus.gemini.connected ? 'bg-purple-500 animate-pulse' : 'bg-amber-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            servicesStatus.gemini.connected
                              ? 'bg-purple-600 text-white'
                              : 'bg-amber-600 text-white'
                          }`}>
                            {servicesStatus.gemini.connected ? 'AI Gemini OCR Aktif' : 'AI Gemini Belum Aktif'}
                          </span>
                          {!servicesStatus.gemini.connected && (
                            <button
                              onClick={() => { setShowNotifModal(false); onNavigate('gemini'); }}
                              className="text-[10px] font-semibold text-amber-800 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              Setel API <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                        <p className={`text-[11px] mt-1 font-medium leading-relaxed ${servicesStatus.gemini.connected ? 'text-purple-800' : 'text-amber-800'}`}>
                          {servicesStatus.gemini.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Pesan Masuk Bot WA */}
                {notifTab === 'messages' && (
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

                          <div className="mt-2 flex items-center justify-end">
                            <button
                              onClick={() => handleOpenWaChat(msg.id)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                            >
                              <span>Buka Chat / Balas</span>
                              <ArrowRight size={10} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

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
        <div className="bg-white/95 border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md space-y-3 transition-all hover:border-slate-300">
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
        <div className="rounded-[28px] p-6 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 border border-indigo-100/80 shadow-sm relative overflow-hidden backdrop-blur-md flex flex-col items-center justify-center text-center">
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
            className="bg-white/95 border border-slate-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-blue-200/80 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 transition-all cursor-pointer group relative overflow-hidden text-left backdrop-blur-sm"
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

      {/* Live Showcase Model Nota Pembayaran E4 Store */}
      <div className="mt-10 bg-slate-900/80 border border-amber-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Soft Gold Background Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                  <Sparkles size={20} />
                </span>
                <h3 className="text-xl font-bold text-white tracking-wide">
                  Model Nota Pembayaran E4 Store (Chuna Luxury Gold)
                </h3>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Tampilan resmi nota pelunasan & angsuran utang dengan avatar profil WhatsApp, rincian produk, dan kalkulasi otomatis.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setImageTimestamp(Date.now())}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                title="Muat ulang gambar nota"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                onClick={() => setIsZoomed(true)}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 border border-amber-500/30 cursor-pointer"
                title="Perbesar gambar nota"
              >
                <ZoomIn size={14} /> Perbesar
              </button>
            </div>
          </div>

          {/* Tab Selector: Tagihan Pasca vs Konfirmasi vs Royal vs Tagihan vs Lunas vs Angsuran */}
          <div className="flex flex-wrap gap-2 my-5">
            <button
              onClick={() => setActiveNotaTab('tagihan-pasca')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeNotaTab === 'tagihan-pasca'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-950/50 border border-emerald-400/50'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <CheckCircle2 size={16} className="text-emerald-300" />
              Model Cek Tagihan: Pascabayar (Mentahan Baru)
            </button>
            <button
              onClick={() => setActiveNotaTab('konfirmasi')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeNotaTab === 'konfirmasi'
                  ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-fuchsia-600 text-white shadow-lg shadow-cyan-950/50 border border-cyan-400/50'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <Sparkles size={16} className="text-cyan-300" />
              Model Konfirmasi: Neon
            </button>
            <button
              onClick={() => setActiveNotaTab('royal-tidaklunas')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeNotaTab === 'royal-tidaklunas'
                  ? 'bg-gradient-to-r from-red-700 via-rose-700 to-amber-700 text-white shadow-lg shadow-red-950/50 border border-red-500/50'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <AlertCircle size={16} className="text-red-400" />
              Model Struk: Belum Lunas (Template Baru)
            </button>
            <button
              onClick={() => setActiveNotaTab('royal')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeNotaTab === 'royal'
                  ? 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-900/30 border border-amber-400/50'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <Crown size={16} className="text-amber-300" />
              Model Struk: Lunas (Royal Emas)
            </button>
            <button
              onClick={() => setActiveNotaTab('tagihan')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeNotaTab === 'tagihan'
                  ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-900/30 border border-cyan-400/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <Sparkles size={16} className="text-cyan-300" />
              Model Tagihan: Cyber Neon (Padil)
            </button>
            <button
              onClick={() => setActiveNotaTab('lunas')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeNotaTab === 'lunas'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/30 border border-emerald-400/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <CheckCircle2 size={16} />
              Model Pelunasan: Lunas (Picsart Chuna)
            </button>
            <button
              onClick={() => setActiveNotaTab('angsuran')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeNotaTab === 'angsuran'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-900/30 border border-amber-400/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <AlertCircle size={16} />
              Model Angsuran: Sisa Utang (Picsart Chuna)
            </button>
            <button
              onClick={() => setActiveNotaTab('price-list')}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeNotaTab === 'price-list'
                  ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 text-slate-950 font-bold shadow-lg shadow-orange-950/40 border border-orange-400/50'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <Sparkles size={16} className="text-orange-400" />
              Model Poster: List Harga (Game/E-Money)
            </button>
          </div>

          {/* Sub-selector khusus Model Poster List Harga Produk */}
          {activeNotaTab === 'price-list' && (
            <div className="flex flex-col gap-3 mb-6 p-4 bg-slate-900/90 border border-orange-500/40 rounded-2xl text-xs shadow-xl">
              {/* 1. Kategori Produk */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-orange-300 font-bold px-1 flex items-center gap-1.5">
                  <Layers size={14} className="text-orange-400" /> Kategori Produk:
                </span>
                {[
                  { id: 'Games', label: '🎮 Games' },
                  { id: 'E-Money', label: '💳 E-Money' },
                  { id: 'Pulsa', label: '📱 Pulsa' },
                  { id: 'PLN', label: '⚡ Token PLN' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setPriceListCategory(cat.id);
                      setPriceListPage(0);
                      if (cat.id === 'Games') setPriceListBrand('FREE FIRE');
                      else if (cat.id === 'E-Money') setPriceListBrand('DANA');
                      else if (cat.id === 'Pulsa') setPriceListBrand('TELKOMSEL');
                      else if (cat.id === 'PLN') setPriceListBrand('PLN');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      priceListCategory === cat.id
                        ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30 border border-orange-400/40'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* 2. Brand / Game Produk Sesuai Kategori */}
              <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-800">
                <span className="text-orange-300 font-bold px-1 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-orange-400" /> Pilih Brand ({priceListCategory}):
                </span>

                {priceListCategory === 'Games' && (
                  <>
                    {[
                      { id: 'FREE FIRE', label: '🔥 Free Fire' },
                      { id: 'MOBILE LEGENDS', label: '⚔️ Mobile Legends' },
                      { id: 'PUBG MOBILE', label: '🪂 PUBG Mobile' },
                      { id: 'GENSHIN IMPACT', label: '⚡ Genshin' },
                      { id: 'ROBLOX', label: '🧱 Roblox' },
                      { id: 'VALORANT', label: '🎯 Valorant' }
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => { setPriceListBrand(b.id); setPriceListPage(0); }}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                          priceListBrand === b.id
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </>
                )}

                {priceListCategory === 'E-Money' && (
                  <>
                    {[
                      { id: 'DANA', label: '💳 DANA' },
                      { id: 'GOPAY', label: '🟢 GoPay' },
                      { id: 'OVO', label: '🟣 OVO' },
                      { id: 'SHOPEEPAY', label: '🟠 ShopeePay' }
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => { setPriceListBrand(b.id); setPriceListPage(0); }}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                          priceListBrand === b.id
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </>
                )}

                {priceListCategory === 'Pulsa' && (
                  <>
                    {[
                      { id: 'TELKOMSEL', label: '🔴 Telkomsel' },
                      { id: 'INDOSAT', label: '🟡 Indosat' },
                      { id: 'XL', label: '🔵 XL' },
                      { id: 'AXIS', label: '🟣 Axis' },
                      { id: 'TRI', label: '🟠 Tri' },
                      { id: 'SMARTFREN', label: '🔴 Smartfren' }
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => { setPriceListBrand(b.id); setPriceListPage(0); }}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                          priceListBrand === b.id
                            ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </>
                )}

                {priceListCategory === 'PLN' && (
                  <button
                    onClick={() => { setPriceListBrand('PLN'); setPriceListPage(0); }}
                    className="px-3 py-1.5 rounded-xl font-bold bg-yellow-500 text-slate-950 shadow-md shadow-yellow-500/30"
                  >
                    ⚡ Token PLN
                  </button>
                )}

                {/* Input manual pencarian brand Digiflazz */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <input
                    type="text"
                    placeholder="Ketik brand lain..."
                    value={customBrandSearch}
                    onChange={(e) => setCustomBrandSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customBrandSearch.trim()) {
                        setPriceListBrand(customBrandSearch.trim().toUpperCase());
                        setPriceListPage(0);
                      }
                    }}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-36"
                  />
                  <button
                    onClick={() => {
                      if (customBrandSearch.trim()) {
                        setPriceListBrand(customBrandSearch.trim().toUpperCase());
                        setPriceListPage(0);
                      }
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer border border-slate-700"
                  >
                    <Search size={12} />
                  </button>
                </div>
              </div>

              {/* 3. Tipe Tarif Harga */}
              <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-800">
                <span className="text-amber-300 font-bold px-1 flex items-center gap-1.5">
                  <Crown size={14} className="text-amber-400" /> Tipe Tarif Harga:
                </span>
                <button
                  onClick={() => setPriceListType('owner')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    priceListType === 'owner'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                      : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  💼 Harga Jual Owner (Termurah)
                </button>
                <button
                  onClick={() => setPriceListType('vip')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    priceListType === 'vip'
                      ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                      : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  👑 Harga Member VIP
                </button>
                <button
                  onClick={() => setPriceListType('biasa')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    priceListType === 'biasa'
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  👤 Harga Pelanggan Biasa
                </button>
              </div>

              {/* 4. Halaman Poster (Multi-Part jika ada kelebihan) */}
              <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-800">
                <span className="text-orange-300 font-bold px-1 flex items-center gap-1.5">
                  📑 Halaman Poster (Multi-Part):
                </span>
                {Array.from({ length: priceListTotalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPriceListPage(idx)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      priceListPage === idx
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    📄 Part {idx + 1} {priceListTotalPages > 1 ? `(Item ${idx * 12 + 1}-${Math.min((idx + 1) * 12, priceListTotalProducts)})` : `(Semua ${priceListTotalProducts} Item)`}
                  </button>
                ))}
                <span className="text-[11px] text-slate-400 ml-1">
                  • Total {priceListTotalProducts} produk terdaftar ({priceListTotalPages} poster)
                </span>
              </div>
            </div>
          )}

          {/* Sub-selector khusus Model Cek Tagihan Pascabayar (Ditemukan vs Tidak Ditemukan) */}
          {activeNotaTab === 'tagihan-pasca' && (
            <div className="flex flex-wrap items-center gap-2 mb-5 p-2.5 bg-slate-900/90 border border-emerald-500/30 rounded-2xl text-xs">
              <span className="text-emerald-300 font-bold px-2 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" /> Status Cek Tagihan:
              </span>
              <button
                onClick={() => setPascaVariant('ditemukan')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  pascaVariant === 'ditemukan'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                ✅ Tagihan Ditemukan
              </button>
              <button
                onClick={() => setPascaVariant('tidak-ditemukan')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  pascaVariant === 'tidak-ditemukan'
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                ❌ Tagihan Tidak Ditemukan
              </button>
            </div>
          )}

          {/* Sub-selector khusus Model Struk Royal untuk menguji Kategori Produk */}
          {(activeNotaTab === 'royal' || activeNotaTab === 'royal-tidaklunas') && (
            <div className="flex flex-wrap items-center gap-2 mb-5 p-2.5 bg-slate-900/90 border border-amber-500/30 rounded-2xl text-xs">
              <span className="text-amber-300 font-bold px-2 flex items-center gap-1.5">
                <Crown size={14} className="text-amber-400" /> Uji Kelengkapan Produk:
              </span>
              <button
                onClick={() => setRoyalCategory('pln-token')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  royalCategory === 'pln-token'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                ⚡ Token Listrik (Lengkap: ID/Tarif/Kwh/20 Digit)
              </button>
              <button
                onClick={() => setRoyalCategory('pln-pasca')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  royalCategory === 'pln-pasca'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                📋 PLN Pasca (Lengkap: ID/Tarif/Meter/Periode)
              </button>
              <button
                onClick={() => setRoyalCategory('game')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  royalCategory === 'game'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                🎮 Game (ID Tujuan Game)
              </button>
              <button
                onClick={() => setRoyalCategory('pulsa')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  royalCategory === 'pulsa'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                📱 Pulsa / Kuota (Nomor Tujuan)
              </button>
              <button
                onClick={() => setRoyalCategory('ewallet')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  royalCategory === 'ewallet'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                👛 E-Wallet / DANA (Nomor Tujuan)
              </button>
            </div>
          )}

          {/* Sub-selector for Konfirmasi Statuses */}
          {activeNotaTab === 'konfirmasi' && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/80 border border-cyan-500/30 rounded-2xl mb-6 shadow-inner text-xs">
              <span className="text-cyan-300 font-semibold px-2 flex items-center gap-1.5">
                <Sparkles size={14} className="text-cyan-400" /> Siklus Status & Edit Caption:
              </span>
              <button
                onClick={() => setKonfirmasiStatusTab('pending')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  konfirmasiStatusTab === 'pending'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                ⏳ 1. Sedang Diproses (Awal Gambar + Caption)
              </button>
              <button
                onClick={() => setKonfirmasiStatusTab('sukses')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  konfirmasiStatusTab === 'sukses'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                ✅ 2. Edit Caption: Sukses
              </button>
              <button
                onClick={() => setKonfirmasiStatusTab('gagal-tujuan')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  konfirmasiStatusTab === 'gagal-tujuan'
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                ❌ 3. Gagal: Nomor/ID Salah
              </button>
              <button
                onClick={() => setKonfirmasiStatusTab('gagal-ip')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  konfirmasiStatusTab === 'gagal-ip'
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                ❌ 4. Gagal: Server / IP Berubah
              </button>
              <button
                onClick={() => setKonfirmasiStatusTab('gagal-saldo')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  konfirmasiStatusTab === 'gagal-saldo'
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                ❌ 5. Gagal: Saldo Kurang / Produk Kosong
              </button>
              <button
                onClick={() => setKonfirmasiStatusTab('gagal-cutoff')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  konfirmasiStatusTab === 'gagal-cutoff'
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                ❌ 6. Gagal: Cut Off / Tutup Sementara
              </button>
              <button
                onClick={() => setKonfirmasiStatusTab('gagal-refund-saldo')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  konfirmasiStatusTab === 'gagal-refund-saldo'
                    ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                ❌ 7. Gagal: Refund Saldo
              </button>
              <button
                onClick={() => setKonfirmasiStatusTab('gagal-refund-cash')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  konfirmasiStatusTab === 'gagal-refund-cash'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                💵 8. Gagal: Refund CASH (Lebih Halus)
              </button>
              <button
                onClick={() => setKonfirmasiStatusTab('gagal-refund-utang')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  konfirmasiStatusTab === 'gagal-refund-utang'
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                📝 9. Gagal: Batal UTANG (Lebih Halus)
              </button>
            </div>
          )}

          {/* Main Visual Display Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: The Generated Image Card / Pure Text Card */}
            <div className="lg:col-span-6 flex flex-col items-center w-full">
              {activeNotaTab === 'tagihan-pasca' && pascaVariant === 'tidak-ditemukan' ? (
                <div className="w-full max-w-md rounded-2xl overflow-hidden border-2 border-red-500/40 shadow-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-6 flex flex-col gap-4">
                  {/* Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
                      ❌ TAGIHAN TIDAK DITEMUKAN
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      Hanya Teks (Tanpa Gambar)
                    </span>
                  </div>

                  {/* Chat Preview Bubble */}
                  <div className="bg-[#0b141a] border border-[#202c33] rounded-2xl p-4 shadow-inner relative">
                    <div className="text-[11px] text-emerald-400 font-bold mb-1.5 flex items-center gap-1.5">
                      <span>🤖 Chuna ~ E4 Store</span>
                      <span className="text-slate-500 font-normal text-[10px]">• Pesan Otomatis</span>
                    </div>
                    <div className="bg-[#1f2c34] text-slate-100 p-3.5 rounded-2xl rounded-tl-sm text-sm font-medium whitespace-pre-wrap leading-relaxed border border-[#2a3942]">
                      {tagihanPascaTidakDitemukanCaption}
                    </div>
                    <div className="text-right text-[10px] text-slate-400 mt-1">
                      12:00 ✓✓
                    </div>
                  </div>

                  {/* Explanatory notice */}
                  <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3 text-xs text-red-300/90 flex items-start gap-2.5">
                    <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-200">Hanya Kirim Pesan Teks (Tanpa Nota)</p>
                      <p className="text-[11px] text-red-300/80 mt-0.5">
                        Karena tagihan tidak ditemukan di sistem, bot <b>hanya mengirimkan pesan teks di atas</b> dan tidak menghasilkan/mengirim gambar nota.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    onClick={() => setIsZoomed(true)}
                    className={`relative group cursor-pointer w-full ${activeNotaTab === 'price-list' ? 'max-w-xs' : 'max-w-md'} rounded-2xl overflow-hidden border-2 ${activeNotaTab === 'price-list' ? 'border-orange-500/50 hover:border-orange-400' : 'border-amber-500/40 hover:border-amber-400'} shadow-2xl bg-black transition-all hover:scale-[1.01]`}
                  >
                    <img
                      src={currentImageUrl}
                      alt="Preview Model Nota E4 Store"
                      className={`w-full h-auto ${activeNotaTab === 'price-list' ? 'aspect-[9/16] max-h-[660px]' : 'aspect-square'} object-contain block bg-[#0a0a0c]`}
                      loading="eager"
                    />
                    
                    {/* Overlay hover hint */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-sm backdrop-blur-[2px]">
                      <ZoomIn size={22} className="text-amber-400" /> Klik untuk memperbesar
                    </div>

                    {/* Badge Status */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-wider backdrop-blur-md ${
                        activeNotaTab === 'price-list'
                          ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white border border-orange-300/60 shadow-orange-500/30'
                          : activeNotaTab === 'royal'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 border border-amber-300/60 shadow-amber-500/20'
                          : activeNotaTab === 'lunas'
                          ? 'bg-emerald-500/90 text-white border border-emerald-300/40'
                          : 'bg-amber-500/90 text-slate-950 border border-amber-300/40'
                      }`}>
                        {activeNotaTab === 'price-list'
                          ? `🏷️ POSTER: ${priceListBrand} ${priceListTotalPages > 1 ? `(PART ${priceListPage + 1}/${priceListTotalPages})` : ''}`
                          : activeNotaTab === 'royal' 
                          ? '👑 STRUK PEMBAYARAN: LUNAS' 
                          : activeNotaTab === 'royal-tidaklunas'
                          ? '⚠️ STRUK: BELUM LUNAS'
                          : activeNotaTab === 'tagihan-pasca'
                          ? '🧾 CEK TAGIHAN: DITEMUKAN'
                          : activeNotaTab === 'lunas' 
                          ? '✓ STATUS: LUNAS' 
                          : activeNotaTab === 'konfirmasi'
                          ? (
                              konfirmasiStatusTab === 'pending' ? '⏳ 1. SEDANG DIPROSES' :
                              konfirmasiStatusTab === 'sukses' ? '✅ 2. EDIT CAPTION: SUKSES' :
                              konfirmasiStatusTab === 'gagal-tujuan' ? '❌ 3. GAGAL: NOMOR/ID SALAH' :
                              konfirmasiStatusTab === 'gagal-ip' ? '❌ 4. GAGAL: SERVER / IP BERUBAH' :
                              konfirmasiStatusTab === 'gagal-saldo' ? '❌ 5. GAGAL: PRODUK KOSONG' :
                              konfirmasiStatusTab === 'gagal-cutoff' ? '❌ 6. GAGAL: TUTUP SEMENTARA' :
                              konfirmasiStatusTab === 'gagal-refund-cash' ? '💵 8. GAGAL: REFUND CASH (LEBIH HALUS)' :
                              konfirmasiStatusTab === 'gagal-refund-utang' ? '📝 9. GAGAL: BATAL UTANG (LEBIH HALUS)' :
                              '❌ 7. GAGAL: REFUND SALDO'
                            )
                          : '⚠️ STATUS: BELUM LUNAS'}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs mt-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    {activeNotaTab === 'price-list'
                      ? `Poster Story 9:16 resmi E4 Store • Canvas 1080x1920 HD (${priceListTotalProducts} Produk terdaftar)`
                      : 'Gambar dibuat real-time dari render server (Canvas 1024x1024)'}
                  </p>
                </>
              )}
            </div>

            {/* Right: Explanations & Text Message Companion */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* Feature Points Box */}
              {activeNotaTab === 'price-list' ? (
                <div className="bg-slate-950/70 border border-orange-500/30 rounded-2xl p-4 space-y-3">
                  <h4 className="text-sm font-bold text-orange-400 flex items-center gap-2">
                    <Sparkles size={16} /> Keunggulan Poster List Harga (Sesuai Gambar 2):
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <p className="font-semibold text-white">📱 Format Story 9:16 (1080x1920)</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Proporsi pas untuk status WhatsApp & Instagram Story tanpa terpotong.</p>
                    </div>
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <p className="font-semibold text-white">📑 Multi-Part Otomatis</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Jika produk melebihi 12 item, otomatis dibagi ke Part 1, Part 2, dst. agar rapi dan tidak berdesakan.</p>
                    </div>
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <p className="font-semibold text-white">🔶 Ikon Diamond & Angka Emas</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Persis Gambar 2: ikon diamond oranye, nama item rapi, nominal kuning keemasan cerah.</p>
                    </div>
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <p className="font-semibold text-white">🔄 Sinkron Katalog Server</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Harga modal, margin keuntungan (Owner, VIP, Biasa), dan produk baru otomatis terhubung.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Sparkles size={16} /> Fitur & Struktur Model Nota:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <p className="font-semibold text-white">🔘 Lingkaran Foto Profil</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Otomatis mengambil foto profil WhatsApp pelanggan.</p>
                    </div>
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <p className="font-semibold text-white">🧮 Perhitungan Sisa / Lunas</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Jika pembayaran kurang, otomatis menampilkan Sisa Utang (Bukan Lunas).</p>
                    </div>
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <p className="font-semibold text-white">👧 Karakter 3D Chuna</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Karakter resmi Chuna E4 Store di sebelah kanan nota.</p>
                    </div>
                    <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                      <p className="font-semibold text-white">👑 Tema Luxury Gold</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Latar charcoal hitam dengan ukiran bingkai emas mewah.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Text Message Companion Box */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    💬 Format Pesan WhatsApp / Telegram:
                  </span>
                  <button
                    onClick={handleCopyText}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer border border-slate-700"
                  >
                    {copiedText ? (
                      <>
                        <Check size={12} className="text-emerald-400" /> Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Salin Teks
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-black/70 border border-slate-800 rounded-xl p-3 max-h-56 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 select-all whitespace-pre-wrap">
                  {currentCaption}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="relative max-w-2xl w-full bg-slate-950 border border-amber-500/40 rounded-3xl p-4 shadow-2xl flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                {activeNotaTab === 'price-list' 
                  ? `Poster List Harga: ${priceListBrand} (Part ${priceListPage + 1}/${priceListTotalPages})`
                  : `Model Nota: ${activeNotaTab === 'royal' ? 'Struk Pembayaran Royal (Lio)' : activeNotaTab === 'tagihan' ? 'Bukti Catatan Tagihan (Cyber Neon Padil)' : activeNotaTab === 'lunas' ? 'Lunas Total (Kak Reza)' : 'Angsuran / Belum Lunas'}`}
              </h4>
              <button 
                onClick={() => setIsZoomed(false)} 
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <img
              src={currentImageUrl}
              alt="Zoomed Nota"
              className={`w-full h-auto ${activeNotaTab === 'price-list' ? 'aspect-[9/16] max-h-[82vh]' : 'aspect-square max-h-[75vh]'} object-contain rounded-2xl border border-slate-800 bg-black`}
            />
            <div className="w-full flex items-center justify-between mt-3 text-xs text-slate-400">
              <span>Resolusi asli: {activeNotaTab === 'price-list' ? '1080 x 1920 Pixel PNG (Format Story 9:16)' : '1024 x 1024 Pixel PNG'}</span>
              <a
                href={currentImageUrl}
                download={activeNotaTab === 'price-list' ? `List_Harga_${priceListBrand}_Part${priceListPage + 1}.png` : `nota_${activeNotaTab}.png`}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                Download Gambar
              </a>
            </div>
          </div>
        </div>
      )}
      
      



      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/95 border border-slate-200/80 rounded-3xl w-full max-w-sm p-6 shadow-2xl backdrop-blur-xl text-slate-800">
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
    </div>
  );
}
