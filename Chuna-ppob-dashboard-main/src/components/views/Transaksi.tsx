import { useState, useEffect } from "react";
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
              <th className="px-6 py-3 font-semibold">Kode SKU</th>
              <th className="px-6 py-3 font-semibold">Pembayaran</th>
              <th className="px-6 py-3 font-semibold">Whatsapp</th>
              <th className="px-6 py-3 font-semibold">ID Telegram</th>
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
                <td className="px-6 py-4 text-sm text-slate-200">{t.product}</td>
                <td className="px-6 py-4 text-sm font-mono text-sky-400">{t.sku || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-200 uppercase">{t.method}</td>
                <td className="px-6 py-4 text-sm font-mono text-slate-400">{t.whatsapp}</td>
                <td className="px-6 py-4 text-sm font-mono text-slate-400">{t.telegram}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${t.status.includes('Sukses') ? 'bg-emerald-500/10 text-emerald-500' : t.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                    {t.status}
                  </span>
                  {t.method === 'utang' && t.status === 'Sukses' && t.paidAmount > 0 && (
                    <div className="mt-1 text-[10px] text-amber-400">
                      Cicil: Rp {t.paidAmount.toLocaleString('id-ID')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
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
                <td colSpan={10} className="px-6 py-8 text-center text-slate-400 text-sm">Tidak ada transaksi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
