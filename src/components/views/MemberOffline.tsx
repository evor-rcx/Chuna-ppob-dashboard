import { useState, useEffect } from "react";
import { PageContainer } from '../PageContainer';

export function MemberOffline({ onBack }: { onBack: () => void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    waProfileName: string;
    whatsapp: string;
    type: string;
    lid: string;
  }>({ name: '', waProfileName: '', whatsapp: '', type: 'Biasa', lid: '' });
  const [loadingSync, setLoadingSync] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState<boolean>(false);

  const fetchMembers = () => {
    fetch("/api/members/offline")
      .then(res => res.json())
      .then(data => setMembers(data.members || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openDetail = (m: any) => {
    setSelectedMember(m);
    setEditForm({
      name: m.name || '',
      waProfileName: m.waProfileName === '-' ? '' : (m.waProfileName || ''),
      whatsapp: m.whatsapp || '',
      type: m.type || 'Biasa',
      lid: m.lid || ''
    });
  };

  const handleSyncWa = async (memberId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLoadingSync(memberId);
    try {
      const res = await fetch(`/api/members/${memberId}/sync-photo`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMembers(prev => prev.map(m => m.id === memberId ? { 
          ...m, 
          photoUrl: data.photoUrl || m.photoUrl,
          waProfileName: data.waProfileName || m.waProfileName,
          lid: data.lid || m.lid
        } : m));
        if (selectedMember && selectedMember.id === memberId) {
          setSelectedMember({ 
            ...selectedMember, 
            photoUrl: data.photoUrl || selectedMember.photoUrl,
            waProfileName: data.waProfileName || selectedMember.waProfileName,
            lid: data.lid || selectedMember.lid
          });
          setEditForm(prev => ({
            ...prev,
            waProfileName: data.waProfileName && data.waProfileName !== '-' ? data.waProfileName : prev.waProfileName,
            lid: data.lid || prev.lid
          }));
        }
        alert("✅ Berhasil menarik foto dan nama profil WhatsApp terbaru!");
      } else {
        alert(data.error || "Gagal sinkron dari WhatsApp.");
      }
    } catch (err) {
      alert("Gagal menghubungi server");
    } finally {
      setLoadingSync(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!selectedMember) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/members/${selectedMember.id}/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Data profil member berhasil disimpan!");
        const updated = { 
          ...selectedMember, 
          name: editForm.name,
          waProfileName: editForm.waProfileName || '-',
          whatsapp: editForm.whatsapp,
          type: editForm.type,
          lid: editForm.lid || null
        };
        setSelectedMember(updated);
        setMembers(prev => prev.map(m => m.id === selectedMember.id ? updated : m));
      } else {
        alert("Gagal menyimpan: " + data.error);
      }
    } catch (err) {
      alert("Gagal menghubungi server");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <PageContainer title="Daftar Member Offline & Profil WhatsApp" onBack={onBack}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <p className="text-xs text-slate-400">
          💡 Klik pada baris member untuk melihat/mengedit foto profil dan nama WhatsApp yang digunakan pada <span className="text-emerald-400 font-semibold">Stiker Konfirmasi Pembelian</span>.
        </p>
        <button
          onClick={fetchMembers}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors flex items-center gap-1.5"
        >
          🔄 Refresh Tabel
        </button>
      </div>

      <div className="-mx-6 overflow-x-auto">
        <table className="w-full text-left border-t border-slate-800/50">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800/50 bg-slate-800/20">
              <th className="px-6 py-3 font-semibold">ID Registrasi</th>
              <th className="px-6 py-3 font-semibold text-center w-24">Foto Profil WhatsApp</th>
              <th className="px-6 py-3 font-semibold">Nama Member</th>
              <th className="px-6 py-3 font-semibold">Nama Profil WhatsApp</th>
              <th className="px-6 py-3 font-semibold">Nomor WhatsApp</th>
              <th className="px-6 py-3 font-semibold">LID WhatsApp</th>
              <th className="px-6 py-3 font-semibold text-right">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {members.map((m) => {
              const hasPhoto = Boolean(m.photoUrl);
              const waName = m.waProfileName && m.waProfileName !== '-' ? m.waProfileName : null;

              return (
                <tr 
                  key={m.id} 
                  className="hover:bg-slate-700/15 transition-colors cursor-pointer group"
                  onClick={() => openDetail(m)}
                >
                  {/* KOLOM 1: ID REGISTRASI */}
                  <td className="px-6 py-4 text-sm font-mono text-slate-400">
                    {m.id}
                  </td>

                  {/* KOLOM 2: FOTO PROFIL WHATSAPP */}
                  <td className="px-6 py-4 text-sm text-center">
                    <div className="flex justify-center">
                      <div className="relative">
                        {hasPhoto ? (
                          <img 
                            src={m.photoUrl} 
                            alt={m.name} 
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/70 shadow-sm" 
                            onError={(e) => {
                              (e.target as any).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                            {(m.name || 'MB').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        {hasPhoto && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Foto Profil Aktif"></span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* KOLOM 3: NAMA MEMBER */}
                  <td className="px-6 py-4 text-sm">
                    <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {m.name}
                    </div>
                  </td>

                  {/* KOLOM 4: NAMA PROFIL WHATSAPP */}
                  <td className="px-6 py-4 text-sm">
                    {waName ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {waName}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">
                        Belum tersinkron (menggunakan {m.name})
                      </span>
                    )}
                  </td>

                  {/* KOLOM 5: NOMOR WHATSAPP */}
                  <td className="px-6 py-4 text-sm font-mono text-slate-300">
                    {m.whatsapp || '-'}
                  </td>

                  {/* KOLOM 6: LID WHATSAPP */}
                  <td className="px-6 py-4 text-sm font-mono">
                    {m.lid ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs select-all" title="LID WhatsApp">
                        🆔 {m.lid}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic text-xs">-</span>
                    )}
                  </td>

                  {/* KOLOM 7: AKSI CEPAT */}
                  <td className="px-6 py-4 text-sm text-right">
                    <button
                      type="button"
                      disabled={loadingSync === m.id}
                      onClick={(e) => handleSyncWa(m.id, e)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all"
                    >
                      {loadingSync === m.id ? '⏳ Menyinkron...' : '🔄 Tarik WA'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {members.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-sm">
                  Tidak ada data member offline yang terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DETAIL & EDIT PROFIL MEMBER */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>👤</span> Data Member & Profil Stiker WhatsApp
              </h3>
              <button 
                onClick={() => setSelectedMember(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* FOTO PROFIL HEADER */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 mb-5">
              <div className="relative">
                {selectedMember.photoUrl ? (
                  <img 
                    src={selectedMember.photoUrl} 
                    alt={selectedMember.name} 
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-500/60 shadow-md" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-2xl font-bold text-slate-300">
                    {(selectedMember.name || 'MB').slice(0, 2).toUpperCase()}
                  </div>
                )}
                {selectedMember.photoUrl && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg text-white">
                  {selectedMember.name}
                </div>
                <div className="text-xs font-mono text-slate-400">
                  ID: {selectedMember.id}
                </div>
                <div className="mt-1">
                  {selectedMember.photoUrl ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Foto Profil WhatsApp Terhubung
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      ⚠️ Foto WhatsApp Belum Tersambung
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* FORM EDIT DATA */}
            <div className="space-y-4 text-sm mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Member (Nama Panggilan)
                </label>
                <input 
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Misal: Koi"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Profil WhatsApp (Ditampilkan di Stiker Konfirmasi)
                </label>
                <input 
                  type="text"
                  value={editForm.waProfileName}
                  onChange={(e) => setEditForm({ ...editForm, waProfileName: e.target.value })}
                  placeholder="Misal: Sar Tika"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  *Nama ini yang akan dicetak pada kartu stiker saat transaksi diproses.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nomor WhatsApp
                  </label>
                  <input 
                    type="text"
                    value={editForm.whatsapp}
                    onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                    placeholder="0813xxxxxxxx"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipe Akun Member
                  </label>
                  <select 
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="Biasa">Biasa</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  LID WhatsApp (Linked Device Identifier)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={editForm.lid}
                    onChange={(e) => setEditForm({ ...editForm, lid: e.target.value })}
                    placeholder="Contoh: 123456789012345@lid"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-hidden focus:border-emerald-500"
                  />
                  {editForm.lid && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(editForm.lid);
                        alert("✅ LID WhatsApp berhasil disalin!");
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-sky-300 border border-slate-700 whitespace-nowrap flex items-center gap-1"
                    >
                      📋 Salin
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  *Identifier unik perangkat WhatsApp dari Baileys untuk identifikasi transaksi.
                </span>
              </div>
            </div>

            {/* ACTION TOMBOL SINKRONISASI & FOTO */}
            <div className="space-y-2 mb-6">
              <button
                type="button"
                disabled={loadingSync === selectedMember.id}
                onClick={() => handleSyncWa(selectedMember.id)}
                className="w-full py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold hover:bg-emerald-500/25 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {loadingSync === selectedMember.id ? '⏳ Menghubungi WhatsApp...' : '🔄 Ambil Otomatis dari WhatsApp Live (Foto & Nama)'}
              </button>

              <label className="w-full py-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 font-semibold hover:bg-sky-500/25 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer">
                📁 Upload Foto Profil Manual (Galeri/File)
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const imageBase64 = reader.result as string;
                      fetch(`/api/members/${selectedMember.id}/custom-photo`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imageBase64 })
                      })
                      .then(res => res.json())
                      .then(data => {
                        if (data.success && data.photoUrl) {
                          alert("✅ Foto profil berhasil diunggah!");
                          setSelectedMember({ ...selectedMember, photoUrl: data.photoUrl });
                          setMembers(members.map(m => m.id === selectedMember.id ? { ...m, photoUrl: data.photoUrl } : m));
                        } else {
                          alert(data.error || "Gagal menyimpan foto");
                        }
                      })
                      .catch(() => alert("Gagal mengirim file foto"));
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>

            {/* TOMBOL SIMPAN & KELUAR */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <button 
                type="button"
                disabled={savingEdit}
                onClick={handleSaveProfile}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
              >
                {savingEdit ? 'Menyimpan...' : '💾 Simpan Perubahan'}
              </button>

              <button 
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
              >
                Tutup
              </button>
            </div>

            {/* DANGER ZONE: HAPUS & RESET PIN */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <button 
                type="button"
                onClick={() => {
                  if (confirm("Reset PIN member ini? Bot akan meminta member membuat PIN baru.")) {
                    fetch(`/api/members/${selectedMember.id}/reset-pin`, { method: 'POST' })
                      .then(res => res.json())
                      .then(data => alert(data.success ? data.message : "Gagal: " + data.error));
                  }
                }}
                className="text-amber-400 hover:text-amber-300"
              >
                🔑 Reset PIN
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (confirm("Yakin ingin menghapus member ini?")) {
                    fetch(`/api/members/${selectedMember.id}`, { method: 'DELETE' })
                      .then(res => res.json())
                      .then(data => {
                        if (data.success) {
                          alert("Member berhasil dihapus");
                          setMembers(members.filter(m => m.id !== selectedMember.id));
                          setSelectedMember(null);
                        } else {
                          alert("Gagal: " + data.error);
                        }
                      });
                  }
                }}
                className="text-red-400 hover:text-red-300"
              >
                🗑️ Hapus Member
              </button>
            </div>

          </div>
        </div>
      )}
    </PageContainer>
  );
}
