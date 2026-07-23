import { PageContainer } from '../PageContainer';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function Saldo({ onBack }: { onBack: () => void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [topupModal, setTopupModal] = useState<{ isOpen: boolean; memberId: string | null }>({ isOpen: false, memberId: null });
  const [topupAmount, setTopupAmount] = useState('');

  const fetchMembers = () => {
    fetch('/api/members')
      .then(res => res.json())
      .then(data => {
        if (data.success) setMembers(data.members || []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  
  
  const handleBalanceChange = async (memberId: string, currentBalance: number) => {
    const newBalanceStr = prompt("Masukkan jumlah saldo baru:", currentBalance.toString());
    if (newBalanceStr !== null) {
      const newBalance = parseInt(newBalanceStr);
      if (!isNaN(newBalance) && newBalance !== currentBalance) {
        try {
          const res = await fetch(`/api/members/${memberId}/balance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ balance: newBalance })
          });
          const data = await res.json();
          if (data.success) {
            setMembers(members.map(m => m.id === memberId ? { ...m, balance: newBalance } : m));
          } else {
            alert(data.error);
          }
        } catch (err) {
          alert("Error updating balance");
        }
      }
    }
  };

  const handleTelegramChange = async (memberId: string, currentTelegram: string) => {
    const newTelegram = prompt("Masukkan ID/Username Telegram baru:", currentTelegram);
    if (newTelegram !== null && newTelegram !== currentTelegram) {
      try {
        const res = await fetch(`/api/members/${memberId}/telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegram: newTelegram })
        });
        const data = await res.json();
        if (data.success) {
          setMembers(members.map(m => m.id === memberId ? { ...m, telegram: newTelegram } : m));
        } else {
          alert(data.error);
        }
      } catch (err) {
        alert("Error updating telegram id");
      }
    }
  };

  const handleTypeChange = async (memberId: string, newType: string) => {
    try {
      const res = await fetch(`/api/members/${memberId}/type`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: newType })
      });
      const data = await res.json();
      if (data.success) {
        setMembers(members.map(m => m.id === memberId ? { ...m, type: newType } : m));
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error updating member type");
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleTopup = async () => {
    if (!topupModal.memberId || !topupAmount) return;
    
    const amount = parseInt(topupAmount, 10);
    if (isNaN(amount) || amount <= 0) return;

    try {
      const res = await fetch(`/api/members/${topupModal.memberId}/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (data.success) {
        fetchMembers(); // refresh
        setTopupModal({ isOpen: false, memberId: null });
        setTopupAmount('');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error topup");
    }
  };

  const selectedMember = members.find(m => m.id === topupModal.memberId);

  return (
    <PageContainer title="Saldo Member" onBack={onBack}>
      <div className="-mx-6 -mt-6">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800/50 bg-slate-800/20">
              <th className="px-6 py-3 font-semibold">ID Member</th>
              <th className="px-6 py-3 font-semibold">Username</th>
              <th className="px-6 py-3 font-semibold text-center">Tipe Member</th>
              <th className="px-6 py-3 font-semibold">Nomor WhatsApp</th>
              <th className="px-6 py-3 font-semibold">ID Telegram</th>
              <th className="px-6 py-3 font-semibold text-right">Sisa Saldo</th>
              <th className="px-6 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-700/10 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-slate-400">{m.id}</td>
                <td className="px-6 py-4 text-sm text-slate-200">{m.name}</td>
                <td className="px-6 py-4 text-center">
                  <select
                    value={m.type}
                    onChange={(e) => handleTypeChange(m.id, e.target.value)}
                    className={`bg-slate-800/50 border border-slate-700/50 rounded-lg px-2 py-1 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all text-xs font-semibold cursor-pointer ${m.type === 'VIP' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-slate-300'}`}
                  >
                    <option value="Biasa" className="text-slate-900">Biasa</option>
                    <option value="VIP" className="text-slate-900">VIP</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{m.whatsapp}</td>
                <td className="px-6 py-4 text-sm text-sky-400 cursor-pointer hover:underline" onClick={() => handleTelegramChange(m.id, m.telegram)} title="Klik untuk mengubah ID Telegram">
                  {m.telegram} ✏️
                </td>
                <td className="px-6 py-4 text-sm text-slate-200 font-medium text-right cursor-pointer hover:underline" onClick={() => handleBalanceChange(m.id, m.balance)} title="Klik untuk mengubah Saldo">
                  {formatRupiah(m.balance)} ✏️
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setTopupModal({ isOpen: true, memberId: m.id })}
                    className="bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors text-xs uppercase tracking-wider"
                  >
                    Topup
                  </button>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400 text-sm">
                  Tidak ada data member.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {topupModal.isOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-slate-700/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-800/50">
              <h3 className="text-lg font-semibold text-white">Topup Saldo</h3>
              <button 
                onClick={() => setTopupModal({ isOpen: false, memberId: null })}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/30">
                <p className="text-xs text-slate-400 mb-1">Member</p>
                <p className="text-sm font-medium text-white">{selectedMember.name} <span className="text-slate-500 font-normal">({selectedMember.id})</span></p>
                <p className="text-xs text-slate-400 mt-2 mb-1">Saldo Saat Ini</p>
                <p className="text-sm font-medium text-sky-400">{formatRupiah(selectedMember.balance)}</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nominal Topup</label>
                <input 
                  type="number" 
                  placeholder="Contoh: 50000" 
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setTopupModal({ isOpen: false, memberId: null })}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700/50 text-slate-300 font-medium hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  onClick={handleTopup}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-medium hover:from-sky-400 hover:to-indigo-500 transition-colors shadow-lg shadow-sky-900/20 cursor-pointer"
                >
                  Proses Topup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
