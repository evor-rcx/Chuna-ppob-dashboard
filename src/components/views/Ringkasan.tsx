import { useState, useEffect } from "react";
import { PageContainer } from '../PageContainer';

export function Ringkasan({ onBack }: { onBack: () => void }) {
  const [summary, setSummary] = useState({
    pendapatan: 0,
    produkTerlaris: '-',
    statusServer: 'Checking...'
  });
  const [monthly, setMonthly] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/summary')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSummary(data.summary);
        }
      })
      .catch(() => setSummary(prev => ({ ...prev, statusServer: 'Offline' })));
      
    fetch('/api/monthly-summary')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMonthly(data.data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <PageContainer title="Ringkasan Penjualan" onBack={onBack}>
      <div className="space-y-4">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Total Keuntungan Bersih (Cuan)</p>
          <p className="text-2xl font-semibold text-emerald-400 mt-1">+ Rp {(summary as any).totalCuan?.toLocaleString('id-ID') || '0'}</p>
        </div>
        
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Total Saldo Digiflazz</p>
          <p className="text-xl font-medium text-white mt-1">Rp {summary.pendapatan.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Total Transaksi</p>
          <p className="text-xl font-medium text-white mt-1">{summary.produkTerlaris}</p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Status Server Digiflazz</p>
          <p className={`text-xl font-medium mt-1 ${summary.statusServer?.includes('Connected') || summary.statusServer?.includes('Normal') ? 'text-green-400' : 'text-amber-400'}`}>
            {summary.statusServer}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Laba Bersih Bulanan</h3>
        <div className="space-y-3">
          {monthly.length === 0 ? (
              <p className="text-slate-500 text-sm">Belum ada data bulanan.</p>
          ) : (
            monthly.map(m => (
              <div key={m.month} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-white font-medium">{new Date(m.month + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h4>
                  <div className="text-xs text-slate-500 mt-1 space-y-1">
                    <p>Digital (Digiflazz): <span className="text-emerald-400/80">Rp {m.digitalCuan.toLocaleString('id-ID')}</span></p>
                    <p>Fisik (Warung): <span className="text-blue-400/80">Rp {m.physicalCuan.toLocaleString('id-ID')}</span></p>
                    <p>Pengeluaran Tambahan: <span className="text-red-400/80">Rp {m.expenses.toLocaleString('id-ID')}</span></p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                    <p className="text-slate-400 text-xs mb-1">Total Laba Bersih</p>
                    <p className={`text-xl font-bold ${m.totalCuan >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      Rp {m.totalCuan.toLocaleString('id-ID')}
                    </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
}
