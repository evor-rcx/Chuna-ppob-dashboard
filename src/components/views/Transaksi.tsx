import { useState, useEffect } from "react";
import { printReceiptBluetooth } from '../../utils/printReceipt';
import { PageContainer } from '../PageContainer';

export function Transaksi({ onBack }: { onBack: () => void }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [previewModal, setPreviewModal] = useState<{ url: string; title: string; id?: string } | null>(null);

  useEffect(() => {
    fetch("/api/transactions")
      .then(res => res.json())
      .then(data => setTransactions(data.transactions || []))
      .catch(() => {});
  }, []);

  const getStatusBadge = (t: any) => {
    const isUtangUnpaid = (t.method === 'utang' && !t.status?.toLowerCase().includes('lunas') && !t.isPaid) || t.status?.toLowerCase().includes('tidak lunas');
    const isPending = t.status?.toLowerCase() === 'pending';
    const isSukses = t.status?.toLowerCase().includes('sukses');
    
    let badgeColor = 'bg-red-500/10 text-red-500 border border-red-500/20';
    if (isPending) {
      badgeColor = 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    } else if (isSukses) {
      if (isUtangUnpaid) {
        badgeColor = 'bg-red-500/10 text-red-500 border border-red-500/20';
      } else {
        badgeColor = 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      }
    }
    
    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
        {t.status} {isUtangUnpaid && !t.status?.toLowerCase().includes('tidak lunas') ? '(BELUM LUNAS)' : ''}
      </span>
    );
  };

  const renderActions = (t: any) => {
    return (
      <div className="flex flex-wrap gap-1.5 items-center">
        {t.status?.includes('Sukses') && (
          <>
            <button 
              type="button"
              onClick={() => setPreviewModal({ url: `/api/nota/${t.id}/image`, title: `Nota #${t.id} - ${t.product || 'Produk'}`, id: t.id })}
              className="px-2.5 py-1 bg-sky-500/20 text-sky-400 rounded-md text-xs font-semibold hover:bg-sky-500/30 transition-colors flex items-center gap-1"
              title="Lihat Gambar Nota Langsung"
            >
              🖼️ Lihat Nota
            </button>
            <button
              type="button"
              onClick={() => {
                const email = prompt("Masukkan email tujuan untuk mengirim nota:");
                if (email) {
                  fetch(`/api/nota/${t.id}/send-email`, {
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
              }}
              className="px-2.5 py-1 bg-red-500/20 text-red-400 rounded-md text-xs font-semibold hover:bg-red-500/30 transition-colors flex items-center gap-1"
              title="Kirim Nota ke Gmail"
            >
              ✉️ Email
            </button>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                printReceiptBluetooth(t);
              }}
              className="px-2.5 py-1 bg-indigo-500/20 text-indigo-400 rounded-md text-xs font-semibold hover:bg-indigo-500/30 transition-colors flex items-center gap-1"
              title="Cetak Struk Bluetooth"
            >
              🖨️ Bluetooth
            </button>
          </>
        )}
        {t.method === 'utang' && t.status === 'Sukses' && (
          <>
            <button 
              onClick={() => {
                if (confirm('Tandai utang ini sebagai Lunas dan kirim notifikasi?')) {
                  fetch(`/api/transactions/${t.id}/lunas`, { method: 'POST' })
                    .then(res => res.json())
                    .then(res => {
                      if (res.success) {
                        setTransactions(transactions.map(tr => tr.id === t.id ? { ...tr, status: 'Sukses (Lunas)' } : tr));
                        alert('Utang berhasil dilunasi!');
                      } else {
                        alert('Gagal: ' + res.error);
                      }
                    });
                }
              }}
              className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
            >
              ✅ Bayar Utang
            </button>
            <button 
              onClick={() => {
                if (confirm('Kirim pengingat utang 1 bulan ke WhatsApp pelanggan?')) {
                  fetch(`/api/transactions/${t.id}/remind`, { method: 'POST' })
                    .then(res => res.json())
                    .then(res => {
                      if (res.success) {
                        alert(res.message);
                      } else {
                        alert('Gagal: ' + res.error);
                      }
                    });
                }
              }}
              className="px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-md text-xs font-semibold hover:bg-amber-500/30 transition-colors flex items-center gap-1"
            >
              ⚠️ Pengingat
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <PageContainer title="Daftar Transaksi Terakhir" onBack={onBack}>
      {/* Top Action Bar for Live Receipt Preview Examples */}
      <div className="mb-4 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
            ✨ Model Nota Baru (E4 Store):
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Format mewah dengan penempatan tulisan seragam & foto profile WhatsApp.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPreviewModal({ url: '/api/demo-nota/lunas', title: 'Contoh 1: Sukses (LUNAS) - Token PLN', id: 'demo-lunas' })}
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            🟢 Gambar 1 (Lunas)
          </button>
          <button
            type="button"
            onClick={() => setPreviewModal({ url: '/api/demo-nota/belum-lunas', title: 'Contoh 2: Sukses (BELUM LUNAS) - Token PLN', id: 'demo-belum-lunas' })}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            🟠 Gambar 2 (Belum Lunas)
          </button>
          <button
            type="button"
            onClick={() => setPreviewModal({ url: '/api/demo-nota/produk-biasa', title: 'Contoh 3: Sukses (Lunas) - No. Tujuan E-Money (DANA)', id: 'demo-produk-biasa' })}
            className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            📱 E-Money / Pulsa
          </button>
          <button
            type="button"
            onClick={() => setPreviewModal({ url: '/api/demo-nota/game', title: 'Contoh 4: Sukses (Lunas) - ID Tujuan Game (MLBB)', id: 'demo-game' })}
            className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            🎮 Game (ID Tujuan Game)
          </button>
          <button
            type="button"
            onClick={() => setPreviewModal({ url: '/api/demo-nota/cek-tagihan', title: 'Contoh 5: Nota Cek Tagihan (PLN Pascabayar)', id: 'demo-cek-tagihan' })}
            className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            📋 Cek Tagihan
          </button>
          <button
            type="button"
            onClick={() => setPreviewModal({ url: '/api/demo-nota/privat-e4', title: 'Contoh 6: Foto WA Privat (Lingkaran Huruf E4)', id: 'demo-privat-e4' })}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            🔒 WA Privat (E4)
          </button>
          <button
            type="button"
            onClick={() => setPreviewModal({ url: '/api/demo-nota-pelunasan', title: 'Contoh 7: Nota Pembayaran Lunas (Desain Chuna E4 Store)', id: 'demo-pelunasan-lunas' })}
            className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            📜 Nota Pembayaran Lunas
          </button>
          <button
            type="button"
            onClick={() => setPreviewModal({ url: '/api/demo-sticker-konfirmasi', title: 'Stiker Animasi WhatsApp: Konfirmasi Pembelian (Bergerak + Efek Kilau & Foto Profil)', id: 'demo-stiker-konfirmasi' })}
            className="px-3 py-1.5 bg-emerald-500/30 hover:bg-emerald-500/40 border border-emerald-400 text-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ring-1 ring-emerald-500/50"
          >
            ✨ Stiker Animasi WA Konfirmasi
          </button>
        </div>
      </div>

      {/* Mobile Card View (shown on mobile screens) */}
      <div className="md:hidden flex flex-col gap-3">
        {transactions.map((t) => {
          const dateStr = t.date ? new Date(t.date).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-';
          return (
            <div key={t.id} className="p-4 bg-slate-800/30 border border-slate-800/80 rounded-xl flex flex-col gap-2.5">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="font-semibold text-slate-100 text-sm">
                    {typeof t.product === 'object' ? t.product?.product_name || 'Unknown' : t.product}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {t.target} {t.username ? `• ${t.username}` : ''}
                  </div>
                </div>
                <div>{getStatusBadge(t)}</div>
              </div>

              {t.sn && (
                <div className="bg-slate-900/60 p-2 rounded-md font-mono text-xs text-amber-300 break-all border border-slate-700/40">
                  <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Token / SN:</span>
                  {t.sn}
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-slate-300 pt-1 border-t border-slate-700/40">
                <span className="text-slate-400">{dateStr}</span>
                <span className="font-bold text-emerald-400">Rp {(t.price || t.tagihan || 0).toLocaleString('id-ID')}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                {renderActions(t)}
              </div>
            </div>
          );
        })}

        {transactions.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm bg-slate-800/20 rounded-xl">
            Tidak ada transaksi.
          </div>
        )}
      </div>

      {/* Desktop Table View (shown on medium and larger screens) */}
      <div className="hidden md:block -mx-6 -mt-2 overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800/50 bg-slate-800/20">
              <th className="px-6 py-3 font-semibold">Tanggal</th>
              <th className="px-6 py-3 font-semibold">Username</th>
              <th className="px-6 py-3 font-semibold">Tujuan</th>
              <th className="px-6 py-3 font-semibold">Produk</th>
              <th className="px-6 py-3 font-semibold">Ket/SN</th>
              <th className="px-6 py-3 font-semibold">Detail Harga</th>
              <th className="px-6 py-3 font-semibold">Pembayaran</th>
              <th className="px-6 py-3 font-semibold">Whatsapp</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {transactions.map((t) => {
              const dateStr = t.date ? new Date(t.date).toLocaleString('id-ID') : '-';
              return (
              <tr key={t.id} className="hover:bg-slate-700/10 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-400">{dateStr}</td>
                <td className="px-6 py-4 text-sm text-slate-200">{t.username}</td>
                <td className="px-6 py-4 text-sm font-mono text-slate-400">{t.target}</td>
                <td className="px-6 py-4 text-sm text-slate-200">
                  <div className="font-semibold">{typeof t.product === 'object' ? t.product?.product_name || 'Unknown' : t.product}</div>
                  <div className="text-[10px] text-sky-400 font-mono mt-0.5">{t.sku || '-'}</div>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-amber-400 max-w-[150px] whitespace-normal break-all">
                  {t.sn || '-'}
                </td>
                <td className="px-6 py-4">
                  {t.type === 'pasca' ? (
                    <div className="flex flex-col gap-1 text-[11px] min-w-[140px]">
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Tagihan Pel:</span>
                        <span className="text-slate-200">Rp {(t.tagihan || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Admin Pel:</span>
                        <span className="text-slate-200">Rp {(t.admin_pel || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Harga Pel:</span>
                        <span className="text-slate-200">Rp {(t.price || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-t border-slate-700/50 pt-1 mt-1">
                        <span className="text-emerald-400">Fee/Cuan:</span>
                        <span className="text-emerald-400 font-bold">Rp {(t.cuan || 0).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 text-[11px] min-w-[140px]">
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Harga Modal:</span>
                        <span className="text-slate-200">Rp {(t.modal || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Harga Jual:</span>
                        <span className="text-slate-200">Rp {(t.price || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-t border-slate-700/50 pt-1 mt-1">
                        <span className="text-emerald-400">Fee/Cuan:</span>
                        <span className="text-emerald-400 font-bold">Rp {(t.cuan || 0).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-200 uppercase">{t.method}</td>
                <td className="px-6 py-4 text-xs font-mono text-slate-400">
                  {t.whatsapp ? <div>{t.whatsapp}</div> : null}
                  {t.telegram ? <div className="text-sky-400 mt-1">TG: {t.telegram}</div> : null}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(t)}
                  {t.method === 'utang' && t.status === 'Sukses' && t.paidAmount > 0 && (
                    <div className="mt-1 text-[10px] text-amber-400">
                      Cicil: Rp {t.paidAmount.toLocaleString('id-ID')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end">
                    {renderActions(t)}
                  </div>
                </td>
              </tr>
            )})}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-slate-400 text-sm">Tidak ada transaksi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
                onClick={() => setPreviewModal({ url: '/api/demo-nota/cek-tagihan', title: 'Contoh 5: Nota Cek Tagihan (PLN Pascabayar)', id: 'demo-cek-tagihan' })}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors ${previewModal.url.includes('/demo-nota/cek-tagihan') ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                📋 Cek Tagihan
              </button>
              <button
                type="button"
                onClick={() => setPreviewModal({ url: '/api/demo-nota/privat-e4', title: 'Contoh 6: Foto WA Privat (Lingkaran Huruf E4)', id: 'demo-privat-e4' })}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors ${previewModal.url.includes('/demo-nota/privat-e4') ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                🔒 WA Privat (E4)
              </button>
              <button
                type="button"
                onClick={() => setPreviewModal({ url: '/api/demo-nota-pelunasan', title: 'Contoh 7: Nota Pembayaran Lunas (Desain Chuna E4 Store)', id: 'demo-pelunasan-lunas' })}
                className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors ${previewModal.url.includes('/demo-nota-pelunasan') ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                📜 Nota Pembayaran Lunas
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
