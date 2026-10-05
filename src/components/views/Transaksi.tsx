import { useState, useEffect } from "react";
import { printReceiptBluetooth } from '../../utils/printReceipt';
import { PageContainer } from '../PageContainer';

export function Transaksi({ onBack }: { onBack: () => void }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [previewModal, setPreviewModal] = useState<{ url: string; title: string; id?: string } | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  useEffect(() => {
    fetch("/api/transactions")
      .then(res => res.json())
      .then(data => setTransactions(data.transactions || []))
      .catch(() => {});
  }, []);

  // Calculate dynamic summary stats
  const totalTransaksi = transactions.length;
  const totalOmzet = transactions.reduce((sum, t) => sum + (Number(t.price || t.tagihan || 0)), 0);
  const totalCuan = transactions.reduce((sum, t) => {
    const cuan = t.cuan !== undefined ? Number(t.cuan) : (t.price && t.modal ? Number(t.price) - Number(t.modal) : 0);
    return sum + cuan;
  }, 0);

  const getStatusBadge = (t: any) => {
    const isUtangUnpaid = (t.method === 'utang' && !t.status?.toLowerCase().includes('lunas') && !t.isPaid) || t.status?.toLowerCase().includes('tidak lunas');
    const isPending = t.status?.toLowerCase() === 'pending';
    const isSukses = t.status?.toLowerCase().includes('sukses');
    
    if (isPending) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2a1d08]/90 text-amber-400 border border-amber-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Pending
        </span>
      );
    }

    if (isSukses) {
      if (isUtangUnpaid) {
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2d0f15]/90 text-red-400 border border-red-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            Belum Lunas
          </span>
        );
      }
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#06281e]/90 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Sukses
        </span>
      );
    }

    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-slate-400 border border-slate-700/60 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
        {t.status || 'Gagal'}
      </span>
    );
  };

  const handleSendEmail = (txId: string) => {
    const email = prompt("Masukkan email tujuan untuk mengirim nota:");
    if (email) {
      fetch(`/api/nota/${txId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Nota berhasil dikirim ke email!");
        } else {
          alert("Gagal: " + data.error);
        }
      })
      .catch(() => alert("Terjadi kesalahan saat mengirim email"));
    }
  };

  const handlePayUtang = (txId: string) => {
    if (confirm('Tandai utang ini sebagai Lunas dan kirim notifikasi?')) {
      fetch(`/api/transactions/${txId}/lunas`, { method: 'POST' })
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            setTransactions(transactions.map(tr => tr.id === txId ? { ...tr, status: 'Sukses (Lunas)' } : tr));
            alert('Utang berhasil dilunasi!');
          } else {
            alert('Gagal: ' + res.error);
          }
        });
    }
  };

  const handleRemind = (txId: string) => {
    if (confirm('Kirim pengingat utang ke WhatsApp pelanggan?')) {
      fetch(`/api/transactions/${txId}/remind`, { method: 'POST' })
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            alert(res.message);
          } else {
            alert('Gagal: ' + res.error);
          }
        });
    }
  };

  return (
    <PageContainer title="Daftar Transaksi Terakhir" onBack={onBack}>
      {/* 1. TOP METRICS / SUMMARY STATS BAR (Sesuai Screenshot) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="bg-[#0b1220]/90 border border-slate-800/80 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md shadow-lg shadow-black/20 flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">TRANSAKSI</span>
          <span className="text-xl sm:text-2xl font-black text-white mt-1">{totalTransaksi}</span>
        </div>
        <div className="bg-[#0b1220]/90 border border-slate-800/80 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md shadow-lg shadow-black/20 flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">OMZET</span>
          <div className="mt-1">
            <span className="text-[10px] text-slate-400 font-semibold block sm:inline">Rp </span>
            <span className="text-base sm:text-xl font-black text-white truncate">
              {totalOmzet.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
        <div className="bg-[#0b1220]/90 border border-slate-800/80 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md shadow-lg shadow-black/20 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
          <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wider">CUAN</span>
          <div className="mt-1">
            <span className="text-[10px] text-emerald-400 font-semibold block sm:inline">Rp </span>
            <span className="text-base sm:text-xl font-black text-emerald-400 truncate">
              {totalCuan.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Switcher & Title Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-medium text-slate-400">
          Menampilkan <span className="text-white font-bold">{transactions.length}</span> transaksi terakhir
        </div>
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'card' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            📇 Kartu
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'table' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 Tabel
          </button>
        </div>
      </div>

      {/* 2. CARD VIEW MODEL (Sesuai Screenshot dengan Animasi Modern) */}
      {viewMode === 'card' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          {transactions.map((t, idx) => {
            const dateStr = t.date ? new Date(t.date).toLocaleString('id-ID', { 
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            }).replace(',', ' •') : '-';
            
            const prodName = typeof t.product === 'object' ? t.product?.product_name || 'Unknown' : (t.product || '-');
            const targetVal = t.target || '-';
            const skuVal = t.sku || (typeof t.product === 'object' ? t.product?.buyer_sku_code : '-') || '-';
            const modalVal = Number(t.modal || 0);
            const hargaJualVal = Number(t.price || t.tagihan || 0);
            const cuanVal = t.cuan !== undefined ? Number(t.cuan) : (hargaJualVal - modalVal);

            // Format nomor telepon WhatsApp
            const waDisplay = t.whatsapp ? t.whatsapp : (t.phone ? t.phone : (t.target && t.target.startsWith('08') ? t.target : '-'));

            return (
              <div 
                key={t.id || idx} 
                className="bg-[#0c1322]/95 border border-slate-800/90 hover:border-sky-500/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl shadow-black/40 transition-all duration-300 hover:-translate-y-0.5 flex flex-col gap-3 group animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${Math.min(idx * 50, 400)}ms` }}
              >
                {/* Header: Nama Pelanggan + Jam + Status Badge */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-bold text-slate-100 text-base sm:text-lg group-hover:text-sky-300 transition-colors">
                      {t.username || t.customerName || t.name || 'Pelanggan Toko'}
                    </h4>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>🕒</span>
                      <span>{dateStr}</span>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(t)}
                  </div>
                </div>

                {/* Detail Information Rows (Sesuai Screenshot) */}
                <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-y-2 gap-x-2 text-xs sm:text-sm pt-1 items-center">
                  {/* WhatsApp */}
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span>📱</span> WhatsApp
                  </span>
                  <span className="text-slate-200 font-mono font-medium">
                    {waDisplay}
                  </span>

                  {/* Tujuan */}
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span>🎯</span> Tujuan
                  </span>
                  <span className="text-slate-100 font-bold">
                    {t.type === 'game' ? `ID Game: ${targetVal}` : targetVal}
                  </span>

                  {/* Produk */}
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span>📦</span> Produk
                  </span>
                  <span className="text-slate-100 font-bold">
                    {prodName}
                  </span>

                  {/* SKU */}
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span>🏷️</span> SKU
                  </span>
                  <span className="text-slate-400 font-mono text-xs">
                    {skuVal}
                  </span>

                  {/* SN / Token (Kotak Dashed Amber) */}
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span>🔑</span> SN/Token
                  </span>
                  <div>
                    {t.sn ? (
                      <div className="border border-dashed border-amber-500/60 bg-amber-500/10 px-3 py-1 rounded-lg font-mono text-xs text-amber-300 tracking-wider shadow-inner inline-block select-all">
                        {t.sn}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs italic tracking-wide">
                        - belum terbit -
                      </span>
                    )}
                  </div>

                  {/* Metode Bayar */}
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span>💳</span> Bayar
                  </span>
                  <div>
                    {t.method === 'cash' ? (
                      <span className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-0.5 rounded-md text-xs font-medium">
                        💵 Cash
                      </span>
                    ) : t.method === 'saldo' ? (
                      <span className="inline-flex items-center gap-1 bg-purple-950/70 border border-purple-500/40 text-purple-300 px-2.5 py-0.5 rounded-md text-xs font-medium">
                        👛 Saldo Member
                      </span>
                    ) : t.method === 'utang' ? (
                      <span className="inline-flex items-center gap-1 bg-amber-950/60 border border-amber-500/40 text-amber-300 px-2.5 py-0.5 rounded-md text-xs font-medium">
                        📝 Kasbon
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs">
                        {t.method || 'Cash'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Breakdown Container (Kotak Gelap Inset Cuan) */}
                <div className="bg-[#070b14]/90 rounded-xl p-3 sm:p-3.5 border border-slate-800/80 mt-1 space-y-1.5 shadow-inner">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Harga Modal</span>
                    <span className="text-slate-300 font-medium">
                      Rp {modalVal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Harga Jual</span>
                    <span className="text-slate-100 font-bold">
                      Rp {hargaJualVal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-800/90">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span>💰</span> Cuan Bersih
                    </span>
                    <span className="text-emerald-400 font-black text-sm tracking-tight">
                      +Rp {cuanVal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Row (Ikon Tombol Bawah Sesuai Screenshot) */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                  {/* 🖼️ Lihat Nota */}
                  {t.status?.includes('Sukses') && (
                    <button
                      type="button"
                      onClick={() => setPreviewModal({ url: `/api/nota/${t.id}/image`, title: `Nota #${t.id} - ${prodName}`, id: t.id })}
                      className="w-10 h-10 flex items-center justify-center bg-slate-800/90 hover:bg-sky-500/20 text-sky-400 border border-slate-700/70 hover:border-sky-500/50 rounded-xl transition-all active:scale-95 text-base shadow-sm"
                      title="Lihat Gambar Nota"
                    >
                      🖼️
                    </button>
                  )}

                  {/* ✉️ Email */}
                  {t.status?.includes('Sukses') && (
                    <button
                      type="button"
                      onClick={() => handleSendEmail(t.id)}
                      className="w-10 h-10 flex items-center justify-center bg-slate-800/90 hover:bg-red-500/20 text-red-400 border border-slate-700/70 hover:border-red-500/50 rounded-xl transition-all active:scale-95 text-base shadow-sm"
                      title="Kirim Nota ke Email"
                    >
                      ✉️
                    </button>
                  )}

                  {/* 🖨️ Cetak Bluetooth */}
                  {t.status?.includes('Sukses') && (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); printReceiptBluetooth(t); }}
                      className="w-10 h-10 flex items-center justify-center bg-slate-800/90 hover:bg-indigo-500/20 text-indigo-400 border border-slate-700/70 hover:border-indigo-500/50 rounded-xl transition-all active:scale-95 text-base shadow-sm"
                      title="Cetak Thermal Bluetooth"
                    >
                      🖨️
                    </button>
                  )}

                  {/* ⚠️ Pengingat Utang */}
                  {t.method === 'utang' && (
                    <button
                      type="button"
                      onClick={() => handleRemind(t.id)}
                      className="w-10 h-10 flex items-center justify-center bg-slate-800/90 hover:bg-amber-500/20 text-amber-400 border border-slate-700/70 hover:border-amber-500/50 rounded-xl transition-all active:scale-95 text-base shadow-sm"
                      title="Kirim Pengingat WhatsApp"
                    >
                      ⚠️
                    </button>
                  )}

                  {/* 🟢 Tombol Bayar Utang */}
                  {t.method === 'utang' && !t.status?.toLowerCase().includes('lunas') && (
                    <button
                      type="button"
                      onClick={() => handlePayUtang(t.id)}
                      className="h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl flex items-center gap-1.5 text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95 ml-auto cursor-pointer"
                      title="Lunasi Utang Sekarang"
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-950 text-emerald-400 flex items-center justify-center text-[10px] font-black">✓</span>
                      Bayar
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {transactions.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-sm bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              Belum ada riwayat transaksi tercatat.
            </div>
          )}
        </div>
      )}

      {/* 3. DESKTOP TABLE VIEW (Pilihan opsional jika ingin melihat tabel lebar) */}
      {viewMode === 'table' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-800/30">
                  <th className="px-5 py-3.5 font-semibold">Tanggal</th>
                  <th className="px-5 py-3.5 font-semibold">Username</th>
                  <th className="px-5 py-3.5 font-semibold">Tujuan</th>
                  <th className="px-5 py-3.5 font-semibold">Produk</th>
                  <th className="px-5 py-3.5 font-semibold">SN / Token</th>
                  <th className="px-5 py-3.5 font-semibold">Rincian Harga</th>
                  <th className="px-5 py-3.5 font-semibold">Bayar</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {transactions.map((t) => {
                  const dateStr = t.date ? new Date(t.date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-';
                  const prodName = typeof t.product === 'object' ? t.product?.product_name || 'Unknown' : (t.product || '-');
                  return (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-slate-400">{dateStr}</td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-200">{t.username || '-'}</td>
                      <td className="px-5 py-3.5 text-xs font-mono text-slate-300">{t.target}</td>
                      <td className="px-5 py-3.5 text-xs">
                        <div className="font-semibold text-slate-100">{prodName}</div>
                        <div className="text-[10px] text-sky-400 font-mono mt-0.5">{t.sku || '-'}</div>
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        {t.sn ? (
                          <span className="font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-dashed border-amber-500/40">
                            {t.sn}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">- belum terbit -</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs">
                        <div className="text-slate-300 font-semibold">
                          Rp {(t.price || t.tagihan || 0).toLocaleString('id-ID')}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-bold">
                          Cuan: +Rp {(t.cuan || ((t.price || t.tagihan || 0) - (t.modal || 0))).toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs uppercase font-medium text-slate-300">{t.method}</td>
                      <td className="px-5 py-3.5">{getStatusBadge(t)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {t.status?.includes('Sukses') && (
                            <button
                              type="button"
                              onClick={() => setPreviewModal({ url: `/api/nota/${t.id}/image`, title: `Nota #${t.id} - ${prodName}`, id: t.id })}
                              className="p-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg text-xs"
                              title="Lihat Nota"
                            >
                              🖼️
                            </button>
                          )}
                          {t.status?.includes('Sukses') && (
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); printReceiptBluetooth(t); }}
                              className="p-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg text-xs"
                              title="Bluetooth"
                            >
                              🖨️
                            </button>
                          )}
                          {t.method === 'utang' && !t.status?.toLowerCase().includes('lunas') && (
                            <button
                              type="button"
                              onClick={() => handlePayUtang(t.id)}
                              className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
                            >
                              ✓ Bayar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Modal Preview for Receipt Images */}
      {previewModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
          onClick={() => setPreviewModal(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl sm:max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-slate-100 text-sm sm:text-base truncate pr-2">
                {previewModal.title}
              </h3>
              <button 
                type="button" 
                onClick={() => setPreviewModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Quick Switcher inside modal if viewing demo */}
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] text-slate-400 font-medium shrink-0">Model:</span>
              <button
                type="button"
                onClick={() => setPreviewModal({ url: '/api/demo-nota/lunas', title: 'Contoh 1: Sukses (LUNAS) - Token PLN', id: 'demo-lunas' })}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors ${previewModal.url.includes('/demo-nota/lunas') ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                🟢 Lunas (PLN)
              </button>
              <button
                type="button"
                onClick={() => setPreviewModal({ url: '/api/demo-nota/belum-lunas', title: 'Contoh 2: Sukses (BELUM LUNAS) - Token PLN', id: 'demo-belum-lunas' })}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors ${previewModal.url.includes('/demo-nota/belum-lunas') ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                🟠 Belum Lunas (PLN)
              </button>
              <button
                type="button"
                onClick={() => setPreviewModal({ url: '/api/demo-nota/produk-biasa', title: 'Contoh 3: Sukses (Lunas) - No. Tujuan E-Money (DANA)', id: 'demo-produk-biasa' })}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors ${previewModal.url.includes('/demo-nota/produk-biasa') ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                📱 E-Money / Pulsa
              </button>
              <button
                type="button"
                onClick={() => setPreviewModal({ url: '/api/demo-nota/game', title: 'Contoh 4: Sukses (Lunas) - ID Tujuan Game (MLBB)', id: 'demo-game' })}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors ${previewModal.url.includes('/demo-nota/game') ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                🎮 Game
              </button>
              <button
                type="button"
                onClick={() => setPreviewModal({ url: '/api/demo-nota-tagihan-vintage', title: 'Bukti Catatan Tagihan (Desain Prangko Pos Vintage E4 Store + Foto WA di Kotak Orens)', id: 'demo-tagihan-vintage' })}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors ${previewModal.url.includes('/demo-nota-tagihan-vintage') ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                📮 Tagihan Prangko WA
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="p-4 overflow-y-auto flex items-center justify-center bg-slate-950/50">
              <img 
                src={previewModal.url} 
                alt={previewModal.title}
                className="max-w-full h-auto aspect-square rounded-xl shadow-lg border border-slate-700/50 object-contain"
              />
            </div>

            {/* Modal Footer Controls */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-2">
              <a 
                href={previewModal.url} 
                download="nota.png"
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                ⬇️ Unduh Gambar
              </a>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const printWindow = window.open(previewModal.url, '_blank');
                    if (printWindow) {
                      printWindow.onload = () => printWindow.print();
                    }
                  }}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  🖨️ Cetak
                </button>
                <button 
                  type="button" 
                  onClick={() => setPreviewModal(null)}
                  className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

