import { BarChart3, ShoppingCart, FileText, Settings, Bot, Wallet, Users, Store, Lock, ShieldAlert, Sparkles, CheckCircle2, AlertCircle, RefreshCw, ZoomIn, Copy, Check, Crown } from 'lucide-react';
import { Page } from '../../types';
import { ReactNode, useState } from 'react';

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

  // Live Nota Model Preview State
  const [activeNotaTab, setActiveNotaTab] = useState<'tagihan-pasca' | 'konfirmasi' | 'royal-tidaklunas' | 'royal' | 'tagihan' | 'lunas' | 'angsuran'>('tagihan-pasca');
  const [pascaVariant, setPascaVariant] = useState<'ditemukan' | 'tidak-ditemukan'>('ditemukan');
  const [konfirmasiStatusTab, setKonfirmasiStatusTab] = useState<'pending' | 'sukses' | 'gagal-tujuan' | 'gagal-ip' | 'gagal-saldo' | 'gagal-cutoff' | 'gagal-refund-saldo' | 'gagal-refund-cash' | 'gagal-refund-utang'>('pending');
  const [royalCategory, setRoyalCategory] = useState<'game' | 'pln-token' | 'pln-pasca' | 'pulsa' | 'ewallet'>('pln-token');
  const [imageTimestamp, setImageTimestamp] = useState<number>(Date.now());
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

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

  const currentImageUrl = activeNotaTab === 'tagihan-pasca'
    ? `/api/demo-nota-cek-tagihan?t=${imageTimestamp}`
    : activeNotaTab === 'konfirmasi'
    ? `/api/demo-nota-konfirmasi?t=${imageTimestamp}`
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
    if (id === 'produk' || id === 'konfig' || id === 'saldo' || id === 'bot' || id === 'security') {
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

  const menuItems: { id: Page; icon: ReactNode; label: string }[] = [
    { id: 'ringkasan', icon: <BarChart3 size={32} />, label: 'Ringkasan' },
    { id: 'produk', icon: <ShoppingCart size={32} />, label: 'Kelola Produk' },
    { id: 'transaksi', icon: <FileText size={32} />, label: 'Transaksi' },
    { id: 'konfig', icon: <Settings size={32} />, label: 'Konfig API' },
    { id: 'bot', icon: <Bot size={32} />, label: 'Bot WA/Tele' },
    { id: 'saldo', icon: <Wallet size={32} />, label: 'Customer Telegram' },
    { id: 'member-offline', icon: <Users size={32} />, label: 'Member Offline' },
    { id: 'kasir-fisik', icon: <Store size={32} />, label: 'Kasir Jualan Fisik' },
    { id: 'security', icon: <ShieldAlert size={32} className="text-indigo-400" />, label: 'Keamanan Super' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white">Menu Utama</h2>
          <p className="text-slate-400 text-sm">Selamat datang kembali, Admin.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700"></div>
        </div>
      </header>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-2xl flex flex-col items-center gap-3 hover:bg-slate-800/50 transition-all cursor-pointer group relative"
          >
            {(item.id === 'produk' || item.id === 'konfig' || item.id === 'saldo' || item.id === 'bot') && (
               <div className="absolute top-3 right-3 text-slate-500 group-hover:text-amber-400 transition-colors">
                  <Lock size={14} />
               </div>
            )}
            <div className="text-slate-300 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
          </button>
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
          </div>

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
                    className="relative group cursor-pointer w-full max-w-md rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-black transition-all hover:scale-[1.01] hover:border-amber-400"
                  >
                    <img
                      src={currentImageUrl}
                      alt="Preview Model Nota E4 Store"
                      className="w-full h-auto aspect-square object-contain block bg-[#0a0a0c]"
                      loading="eager"
                    />
                    
                    {/* Overlay hover hint */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-sm backdrop-blur-[2px]">
                      <ZoomIn size={22} className="text-amber-400" /> Klik untuk memperbesar
                    </div>

                    {/* Badge Status */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-wider backdrop-blur-md ${
                        activeNotaTab === 'royal'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 border border-amber-300/60 shadow-amber-500/20'
                          : activeNotaTab === 'lunas'
                          ? 'bg-emerald-500/90 text-white border border-emerald-300/40'
                          : 'bg-amber-500/90 text-slate-950 border border-amber-300/40'
                      }`}>
                        {activeNotaTab === 'royal' 
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
                    Gambar dibuat real-time dari render server (Canvas 1024x1024)
                  </p>
                </>
              )}
            </div>

            {/* Right: Explanations & Text Message Companion */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* Feature Points Box */}
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
                Model Nota: {activeNotaTab === 'royal' ? 'Struk Pembayaran Royal (Lio)' : activeNotaTab === 'tagihan' ? 'Bukti Catatan Tagihan (Cyber Neon Padil)' : activeNotaTab === 'lunas' ? 'Lunas Total (Kak Reza)' : 'Angsuran / Belum Lunas'}
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
              className="w-full h-auto aspect-square object-contain rounded-2xl border border-slate-800 bg-black"
            />
            <div className="w-full flex items-center justify-between mt-3 text-xs text-slate-400">
              <span>Resolusi asli: 1024 x 1024 Pixel PNG</span>
              <a
                href={currentImageUrl}
                download={`nota_${activeNotaTab}.png`}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                Download Gambar
              </a>
            </div>
          </div>
        </div>
      )}
      
      



      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock size={20} className="text-amber-400" /> Keamanan Tambahan
              </h3>
              <button onClick={() => setShowPasswordModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <p className="text-slate-400 text-sm mb-4">Masukkan kata sandi untuk mengakses menu ini.</p>
            
            <input 
              type="password" 
              value={passwordInput}
              onChange={e => { setPasswordInput(e.target.value); setPasswordError(false); }}
              onKeyDown={e => { if (e.key === 'Enter') verifyPassword(); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none mb-2"
              placeholder="Kata Sandi Admin"
              autoFocus
            />

            {show2FAField && (
              <div className="mt-2 mb-2 animate-fadeIn">
                <label className="text-xs text-indigo-300 font-semibold block mb-1">
                  🔑 2FA Authenticator Code (6-digit)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={totpInput}
                  onChange={e => { setTotpInput(e.target.value); setPasswordError(false); }}
                  onKeyDown={e => { if (e.key === 'Enter') verifyPassword(); }}
                  className="w-full bg-slate-950 border border-indigo-500/50 rounded-lg p-3 text-white tracking-widest text-center font-mono font-bold focus:border-indigo-400 outline-none"
                  placeholder="000000"
                  autoFocus
                />
              </div>
            )}

            {passwordError && <p className="text-red-400 text-xs mb-4">{errorMessage || 'Kata sandi salah!'}</p>}
            
            <div className="flex gap-3 mt-6">
               <button 
                 onClick={() => setShowPasswordModal(null)}
                 className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
               >
                 Batal
               </button>
               <button 
                 onClick={verifyPassword}
                 className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
               >
                 Buka Akses
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
