import { PageContainer } from '../PageContainer';
import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, Image as ImageIcon, ShieldCheck, RefreshCw } from 'lucide-react';

export function Saldo({ onBack }: { onBack: () => void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [topupRequests, setTopupRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'members'>('requests');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string; req: any } | null>(null);
  
  const [topupModal, setTopupModal] = useState<{ isOpen: boolean; memberId: string | null }>({ isOpen: false, memberId: null });
  const [topupAmount, setTopupAmount] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const fetchMembers = () => {
    fetch('/api/members')
      .then(res => res.json())
      .then(data => {
        if (data.success) setMembers(data.members || []);
      })
      .catch(() => {});
  };

  const fetchTopupRequests = () => {
    fetch('/api/topup-requests')
      .then(res => res.json())
      .then(data => {
        if (data.success) setTopupRequests(data.topupRequests || []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchMembers();
    fetchTopupRequests();
    const interval = setInterval(fetchTopupRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveTopup = async (reqId: string, memberName: string, nominal: number) => {
    if (!confirm(`Setujui pengisian saldo sebesar ${formatRupiah(nominal)} untuk ${memberName}? Saldo akun akan langsung bertambah dan notifikasi dikirimkan ke Telegram.`)) {
      return;
    }

    setLoadingAction(reqId);
    try {
      const res = await fetch(`/api/topup-requests/${reqId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Sukses! Saldo sebesar ${formatRupiah(nominal)} berhasil ditambahkan ke akun ${memberName}.`);
        fetchTopupRequests();
        fetchMembers();
      } else {
        alert("Gagal: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejectTopup = async (reqId: string, memberName: string) => {
    if (!confirm(`Tolak permintaan pengisian saldo untuk ${memberName}?`)) {
      return;
    }

    setLoadingAction(reqId);
    try {
      const res = await fetch(`/api/topup-requests/${reqId}/reject`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Permintaan isi saldo untuk ${memberName} telah ditolak.`);
        fetchTopupRequests();
      } else {
        alert("Gagal: " + (data.error || "Terjadi kesalahan"));
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoadingAction(null);
    }
  };

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
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
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
        fetchMembers();
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
  const pendingCount = topupRequests.filter(r => r.status === 'pending').length;

  const filteredRequests = topupRequests.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <PageContainer title="Manajemen Saldo & Verifikasi Bukti Transfer" onBack={onBack}>
      {/* Top Banner & Tabs */}
      <div className="-mx-6 -mt-6 mb-6 bg-slate-900/80 border-b border-slate-800/80 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={14} /> Merchant: E4store, Elektronik (Bontang)
              </span>
              <span className="text-xs text-slate-400">Pajak 0.3% untuk saldo ≥ Rp 400.000</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Konfirmasi Saldo & Member Telegram</h2>
            <p className="text-xs text-slate-400">Verifikasi otomatis AI Vision, salinan struk transfer, dan persetujuan saldo manual owner.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchTopupRequests(); fetchMembers(); }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700/50 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mt-6 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-4 font-semibold text-sm transition-all cursor-pointer relative flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'text-sky-400 border-b-2 border-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📥 Permintaan Isi Saldo (Bukti Struk)</span>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 px-4 font-semibold text-sm transition-all cursor-pointer relative flex items-center gap-2 ${
              activeTab === 'members'
                ? 'text-sky-400 border-b-2 border-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>👥 Data Member & Saldo Akun</span>
            <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">
              {members.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'requests' ? (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/30 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Filter Status:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${statusFilter === 'all' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                Semua ({topupRequests.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${statusFilter === 'pending' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-amber-400 hover:bg-slate-700'}`}
              >
                Menunggu ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${statusFilter === 'approved' ? 'bg-emerald-500 text-white font-bold' : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'}`}
              >
                Disetujui ({topupRequests.filter(r => r.status === 'approved').length})
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${statusFilter === 'rejected' ? 'bg-red-500 text-white font-bold' : 'bg-slate-800 text-red-400 hover:bg-slate-700'}`}
              >
                Ditolak ({topupRequests.filter(r => r.status === 'rejected').length})
              </button>
            </div>
            <div className="text-xs text-slate-400">
              💡 Owner dapat menyetujui langsung dari sini atau via tombol bot Telegram.
            </div>
          </div>

          {/* Topup Requests Table */}
          <div className="-mx-6">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800/50 bg-slate-800/20">
                  <th className="px-6 py-3 font-semibold">Waktu / ID</th>
                  <th className="px-6 py-3 font-semibold">Member</th>
                  <th className="px-6 py-3 font-semibold">Nominal Saldo</th>
                  <th className="px-6 py-3 font-semibold">Pajak (0.3%)</th>
                  <th className="px-6 py-3 font-semibold">Total Struk</th>
                  <th className="px-6 py-3 font-semibold">Hasil Bacaan AI</th>
                  <th className="px-6 py-3 font-semibold text-center">Bukti Struk</th>
                  <th className="px-6 py-3 font-semibold text-center">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Aksi Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-700/10 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      <div>{req.dateStr || new Date(req.createdAt).toLocaleDateString('id-ID')}</div>
                      <div className="text-[10px] text-slate-500">{req.timeStr || new Date(req.createdAt).toLocaleTimeString('id-ID')}</div>
                      <div className="text-[9px] text-slate-600 mt-0.5">{req.id}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-white">{req.memberName}</div>
                      <div className="text-xs text-sky-400">{req.memberUsername || `ID: ${req.memberTelegram}`}</div>
                      {req.memberWhatsapp && req.memberWhatsapp !== '-' && (
                        <div className="text-[11px] text-slate-400">WA: {req.memberWhatsapp}</div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-emerald-400">
                        {formatRupiah(req.nominalSaldo)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {req.pajak > 0 ? (
                        <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {formatRupiah(req.pajak)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Gratis (0%)</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-white">
                        {formatRupiah(req.totalBayar || req.transferredAmount)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-300 max-w-xs">
                      <div className="font-mono text-[11px] text-slate-400">Ref: <span className="text-slate-200">{req.transactionId || '-'}</span></div>
                      <div>Bank/Pengirim: <span className="text-slate-200">{req.senderName || '-'}</span></div>
                      <div className="text-[11px] text-slate-400">Tujuan: <span className="text-emerald-300">{req.targetMerchant || 'E4store, Elektronik'}</span></div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {req.photoFileId ? (
                        <button
                          onClick={() => setSelectedPhoto({
                            url: `/api/topup-requests/photo/${req.photoFileId}`,
                            title: `Bukti Transfer - ${req.memberName} (${formatRupiah(req.nominalSaldo)})`,
                            req
                          })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-medium border border-sky-500/20 cursor-pointer transition-colors"
                        >
                          <ImageIcon size={14} /> Lihat Foto
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Tanpa Foto</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {req.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle size={12} /> Disetujui
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle size={12} /> Ditolak
                        </span>
                      )}
                      {req.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                          <Clock size={12} /> Menunggu
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            disabled={loadingAction === req.id}
                            onClick={() => handleApproveTopup(req.id, req.memberName, req.nominalSaldo)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors text-xs flex items-center gap-1 shadow-md shadow-emerald-950/30"
                            title="Setujui dan Tambah Saldo Member"
                          >
                            <CheckCircle size={13} /> Setujui
                          </button>
                          <button
                            disabled={loadingAction === req.id}
                            onClick={() => handleRejectTopup(req.id, req.memberName)}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium py-1.5 px-2.5 rounded-lg cursor-pointer transition-colors text-xs"
                            title="Tolak Permintaan"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          {req.processedAt ? new Date(req.processedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Selesai'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400 text-sm">
                      Tidak ada permintaan isi saldo dengan status "{statusFilter}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Member Table */
        <div className="-mx-6">
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
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setTopupModal({ isOpen: true, memberId: m.id })}
                        className="bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors text-xs uppercase tracking-wider"
                        title="Topup Saldo Manual"
                      >
                        Topup Manual
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm("Reset PIN member ini? Bot akan meminta member membuat PIN baru.")) {
                            fetch(`/api/members/${m.id}/reset-pin`, { method: 'POST' })
                            .then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                alert(data.message);
                              } else {
                                alert("Gagal: " + data.error);
                              }
                            });
                          }
                        }}
                        className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors text-xs uppercase tracking-wider"
                        title="Reset PIN"
                      >
                        PIN
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm("Apakah Anda yakin ingin menghapus member ini?")) {
                            fetch(`/api/members/${m.id}`, { method: 'DELETE' })
                            .then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                alert("Member berhasil dihapus");
                                fetchMembers();
                              } else {
                                alert("Gagal: " + data.error);
                              }
                            });
                          }
                        }}
                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors text-xs uppercase tracking-wider"
                        title="Hapus Member"
                      >
                        Hapus
                      </button>
                    </div>
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
      )}

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-slate-700/60 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">{selectedPhoto.title}</h3>
                <p className="text-xs text-slate-400">Bukti transfer yang dikirimkan oleh customer</p>
              </div>
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-black/40 rounded-xl border border-slate-800 flex items-center justify-center p-2 overflow-hidden min-h-[300px]">
                <img 
                  src={selectedPhoto.url} 
                  alt="Bukti Transfer" 
                  className="max-h-[500px] w-auto object-contain rounded-lg shadow-lg"
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/400x500/1e293b/94a3b8?text=Gagal+Memuat+Foto";
                  }}
                />
              </div>

              <div className="w-full md:w-64 space-y-3 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-800/80">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] border-b border-slate-700/50 pb-2">Rincian Hasil AI OCR</h4>
                <div>
                  <span className="text-slate-400">Nominal Saldo:</span>
                  <p className="font-bold text-emerald-400 text-sm">{formatRupiah(selectedPhoto.req.nominalSaldo)}</p>
                </div>
                {selectedPhoto.req.pajak > 0 && (
                  <div>
                    <span className="text-slate-400">Biaya Pajak (0.3%):</span>
                    <p className="font-semibold text-amber-400">{formatRupiah(selectedPhoto.req.pajak)}</p>
                  </div>
                )}
                <div>
                  <span className="text-slate-400">Total di Struk:</span>
                  <p className="font-bold text-white">{formatRupiah(selectedPhoto.req.totalBayar || selectedPhoto.req.transferredAmount)}</p>
                </div>
                <div>
                  <span className="text-slate-400">ID Referensi:</span>
                  <p className="font-mono text-slate-200 break-all">{selectedPhoto.req.transactionId || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Pengirim / Bank:</span>
                  <p className="text-slate-200">{selectedPhoto.req.senderName || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Tujuan di Struk:</span>
                  <p className="text-slate-200">{selectedPhoto.req.targetMerchant || 'E4store, Elektronik'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Waktu Struk:</span>
                  <p className="text-slate-200">{selectedPhoto.req.dateStr} {selectedPhoto.req.timeStr}</p>
                </div>

                {selectedPhoto.req.status === 'pending' && (
                  <div className="pt-3 border-t border-slate-700/50 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        handleApproveTopup(selectedPhoto.req.id, selectedPhoto.req.memberName, selectedPhoto.req.nominalSaldo);
                        setSelectedPhoto(null);
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors cursor-pointer text-center"
                    >
                      ✅ Setujui & Tambah Saldo
                    </button>
                    <button
                      onClick={() => {
                        handleRejectTopup(selectedPhoto.req.id, selectedPhoto.req.memberName);
                        setSelectedPhoto(null);
                      }}
                      className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg transition-colors cursor-pointer text-center"
                    >
                      ❌ Tolak Bukti Transfer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Topup Modal */}
      {topupModal.isOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-slate-700/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-800/50">
              <h3 className="text-lg font-semibold text-white">Topup Saldo Manual</h3>
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
