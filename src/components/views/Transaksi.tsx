import { useState, useEffect } from "react";
import { printReceiptBluetooth, printReceiptHTML } from '../../utils/printReceipt';
import { PageContainer } from '../PageContainer';

export function Transaksi({ onBack }: { onBack: () => void }) {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/transactions")
      .then(res => res.json())
      .then(data => setTransactions(data.transactions || []))
      .catch(() => {});
  }, []);

  return (
    <PageContainer title="Daftar Transaksi Terakhir" onBack={onBack}>
      <div className="-mx-6 -mt-6 overflow-x-auto">
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
                  {t.whatsapp ? (
                    <div>{t.whatsapp}</div>
                  ) : null}
                  {t.telegram ? (
                    <div className="text-sky-400 mt-1">TG: {t.telegram}</div>
                  ) : null}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${t.status?.includes('Sukses') ? 'bg-emerald-500/10 text-emerald-500' : t.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                    {t.status}
                  </span>
                  {t.method === 'utang' && t.status === 'Sukses' && t.paidAmount > 0 && (
                    <div className="mt-1 text-[10px] text-amber-400">
                      Cicil: Rp {t.paidAmount.toLocaleString('id-ID')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right flex flex-col gap-2 items-end justify-center">
                  {t.status?.includes('Sukses') && (
                    <div className="flex gap-2 items-center justify-end">
                      <a 
                        href={`/api/nota/${t.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded-md text-xs font-semibold hover:bg-sky-500/30 transition-colors flex items-center gap-1 w-fit"
                        title="Print Nota Gambar"
                      >
                        🖼️ Web Print
                      </a>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          printReceiptBluetooth(t);
                        }}
                        className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-md text-xs font-semibold hover:bg-indigo-500/30 transition-colors flex items-center gap-1 w-fit"
                        title="Cetak Struk Bluetooth"
                      >
                        🖨️ Bluetooth
                      </button>
                    </div>
                  )}
                  {t.method === 'utang' && t.status === 'Sukses' && (
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
                      className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded-md text-xs font-semibold hover:bg-sky-500/30 transition-colors"
                    >
                      Bayar Utang
                    </button>
                  )}
                </td>
              </tr>
            )})}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-slate-400 text-sm">Tidak ada transaksi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
