import { useState, useEffect } from "react";
import { PageContainer } from '../PageContainer';

export function Ringkasan({ onBack }: { onBack: () => void }) {
  const [summary, setSummary] = useState({
    pendapatan: 0,
    produkTerlaris: '-',
    statusServer: 'Checking...'
  });

  useEffect(() => {
    fetch('/api/summary')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSummary(data.summary);
        }
      })
      .catch(() => setSummary(prev => ({ ...prev, statusServer: 'Offline' })));
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
          <p className={`text-xl font-medium mt-1 ${summary.statusServer.includes('Connected') || summary.statusServer.includes('Normal') ? 'text-green-400' : 'text-amber-400'}`}>
            {summary.statusServer}
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
