import { useState, useEffect } from "react";
import { PageContainer } from '../PageContainer';

export function MemberOffline({ onBack }: { onBack: () => void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    waProfileName: string;
    whatsapp: string;
    telegram: string;
    tgProfileName: string;
    tgPhotoUrl: string;
    photoUrl: string;
    type: string;
    lid: string;
  }>({
    name: '',
    waProfileName: '',
    whatsapp: '',
    telegram: '',
    tgProfileName: '',
    tgPhotoUrl: '',
    photoUrl: '',
    type: 'Biasa',
    lid: ''
  });

  const [loadingSync, setLoadingSync] = useState<string | null>(null);
  const [loadingSpecific, setLoadingSpecific] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState<boolean>(false);
  const [loadingLookup, setLoadingLookup] = useState<boolean>(false);
  const [loadingBatchSync, setLoadingBatchSync] = useState<boolean>(false);
  const [isAddingMember, setIsAddingMember] = useState<boolean>(false);

  const [newMemberForm, setNewMemberForm] = useState<{
    name: string;
    waProfileName: string;
    whatsapp: string;
    telegram: string;
    tgProfileName: string;
    type: string;
    lid: string;
  }>({ name: '', waProfileName: '', whatsapp: '', telegram: '', tgProfileName: '', type: 'Biasa', lid: '' });

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
      telegram: m.telegram || '',
      tgProfileName: m.tgProfileName || '',
      tgPhotoUrl: m.tgPhotoUrl || '',
      photoUrl: m.photoUrl || '',
      type: m.type || 'Biasa',
      lid: m.lid || ''
    });
  };

  // 1 & 4 & 3: Tarik Otomatis Profil WhatsApp (Foto, Nama, dan LID)
  const handleLookupWa = async (phone: string, target: 'new' | 'edit') => {
    const clean = (phone || '').replace(/\D/g, '');
    if (!clean || clean.length < 8) {
      alert("⚠️ Masukkan nomor WhatsApp yang valid terlebih dahulu (minimal 8 angka).");
      return;
    }
    setLoadingLookup(true);
    try {
      const res = await fetch(`/api/wa/lookup/${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data.success) {
        if (target === 'new') {
          setNewMemberForm(prev => ({
            ...prev,
            name: prev.name || data.waProfileName || '',
            waProfileName: data.waProfileName || prev.waProfileName || '',
            lid: data.lid || prev.lid || ''
          }));
        } else {
          setEditForm(prev => ({
            ...prev,
            waProfileName: data.waProfileName || prev.waProfileName || '',
            photoUrl: data.photoUrl || prev.photoUrl,
            lid: data.lid || prev.lid || ''
          }));
          if (selectedMember) {
            setSelectedMember((prev: any) => ({
              ...prev,
              photoUrl: data.photoUrl || prev?.photoUrl,
              waProfileName: data.waProfileName || prev?.waProfileName,
              lid: data.lid || prev?.lid
            }));
          }
        }

        let msg = `✅ Berhasil menarik data WhatsApp!\n`;
        if (data.waProfileName) msg += `👤 Nama WA: ${data.waProfileName}\n`;
        if (data.lid) msg += `🆔 LID WA: ${data.lid}\n`;
        if (data.photoUrl) msg += `🖼️ Foto WA: Ditemukan & Tersimpan\n`;
        alert(msg);
      } else {
        alert(data.error || "Gagal menarik data dari WhatsApp.");
      }
    } catch (e) {
      alert("Gagal menghubungi server WhatsApp.");
    } finally {
      setLoadingLookup(false);
    }
  };

  // 2 & 5: Tarik Otomatis Profil Telegram (Foto & Nama Profil)
  const handleLookupTg = async (query: string, target: 'new' | 'edit') => {
    const clean = (query || '').replace(/^(ID:|@)/, '').trim();
    if (!clean) {
      alert("⚠️ Masukkan ID Telegram atau username terlebih dahulu (contoh: 123456789).");
      return;
    }
    setLoadingLookup(true);
    try {
      const res = await fetch(`/api/tg/lookup/${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data.success) {
        const formattedTgId = /^\d+$/.test(data.cleanId) ? `ID:${data.cleanId}` : `@${data.cleanId}`;
        if (target === 'new') {
          setNewMemberForm(prev => ({
            ...prev,
            telegram: formattedTgId,
            tgProfileName: data.tgProfileName || prev.tgProfileName || ''
          }));
        } else {
          setEditForm(prev => ({
            ...prev,
            telegram: formattedTgId,
            tgProfileName: data.tgProfileName || prev.tgProfileName || '',
            tgPhotoUrl: data.tgPhotoUrl || prev.tgPhotoUrl || ''
          }));
          if (selectedMember) {
            setSelectedMember((prev: any) => ({
              ...prev,
              telegram: formattedTgId,
              tgProfileName: data.tgProfileName || prev?.tgProfileName,
              tgPhotoUrl: data.tgPhotoUrl || prev?.tgPhotoUrl
            }));
          }
        }

        let msg = `✅ Berhasil menarik data Telegram!\n`;
        if (data.tgProfileName) msg += `👤 Nama TG: ${data.tgProfileName}\n`;
        if (data.tgPhotoUrl) msg += `🖼️ Foto TG: Ditemukan & Tersimpan\n`;
        alert(msg);
      } else {
        alert(data.error || "Gagal menarik data dari Telegram.");
      }
    } catch (e) {
      alert("Gagal menghubungi server Telegram.");
    } finally {
      setLoadingLookup(false);
    }
  };

  // TARIK SEMUA PROFIL LENGKAP UNTUK 1 MEMBER (Foto WA, Foto TG, LID WA, Nama WA, Nama TG)
  const handleSyncAll = async (memberId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLoadingSync(memberId);
    try {
      const res = await fetch(`/api/members/${memberId}/sync-all`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.member) {
        setMembers(prev => prev.map(m => m.id === memberId ? data.member : m));
        if (selectedMember && selectedMember.id === memberId) {
          setSelectedMember(data.member);
          setEditForm({
            name: data.member.name || '',
            waProfileName: data.member.waProfileName || '',
            whatsapp: data.member.whatsapp || '',
            telegram: data.member.telegram || '',
            tgProfileName: data.member.tgProfileName || '',
            tgPhotoUrl: data.member.tgPhotoUrl || '',
            photoUrl: data.member.photoUrl || '',
            type: data.member.type || 'Biasa',
            lid: data.member.lid || ''
          });
        }
        alert("✅ Berhasil menarik semua profil:\n1. Foto Profile WhatsApp\n2. Foto Profile Telegram\n3. LID WhatsApp\n4. Nama Profile WhatsApp\n5. Nama Profile Telegram");
      } else {
        alert(data.error || "Gagal menarik profil member.");
      }
    } catch (err) {
      alert("Gagal menghubungi server");
    } finally {
      setLoadingSync(null);
    }
  };

  // TARIK SEMUA PROFIL SECARA MASSAL (BATCH) UNTUK SEMUA MEMBER
  const handleSyncAllBatch = async () => {
    setLoadingBatchSync(true);
    try {
      const res = await fetch("/api/members/sync-all-batch", { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Sukses menarik otomatis semua profil WhatsApp & Telegram! (${data.updatedCount || 0} member diperbarui)`);
        fetchMembers();
      } else {
        alert(data.error || "Gagal sinkronisasi massal.");
      }
    } catch (e) {
      alert("Gagal menghubungi server.");
    } finally {
      setLoadingBatchSync(false);
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
          telegram: editForm.telegram,
          tgProfileName: editForm.tgProfileName,
          tgPhotoUrl: editForm.tgPhotoUrl,
          photoUrl: editForm.photoUrl,
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

  const handleAddMember = async () => {
    if (!newMemberForm.name.trim()) {
      alert("Nama member wajib diisi!");
      return;
    }
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMemberForm)
      });
      const data = await res.json();
      if (data.success && data.member) {
        alert("✅ Member offline berhasil didaftarkan!");
        setMembers(prev => [data.member, ...prev]);
        setIsAddingMember(false);
        setNewMemberForm({ name: '', waProfileName: '', whatsapp: '', telegram: '', tgProfileName: '', type: 'Biasa', lid: '' });
      } else {
        alert(data.error || "Gagal menambah member");
      }
    } catch (e) {
      alert("Gagal menghubungi server");
    }
  };

  return (
    <PageContainer title="Daftar Member & Penarik Profil WhatsApp & Telegram" onBack={onBack}>
      {/* TOOLBAR ATAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-xs text-slate-400">
            💡 Sistem otomatis menarik: <span className="text-emerald-400 font-semibold">Foto Profil WA/TG</span>, <span className="text-sky-400 font-semibold">Nama Profil WA/TG</span>, dan <span className="text-amber-400 font-semibold">LID WhatsApp</span> untuk nota & stiker transaksi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSyncAllBatch}
            disabled={loadingBatchSync}
            className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs text-white font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-sky-950/40 cursor-pointer disabled:opacity-50"
            title="Tarik otomatis Foto, Nama, dan LID (WA & Telegram) untuk semua member sekaligus"
          >
            {loadingBatchSync ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Menarik Semua Profil...</span>
              </>
            ) : (
              <>
                <span>⚡ Tarik Semua Profil (WA & Telegram)</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsAddingMember(true)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            ➕ Tambah Member
          </button>
          
          <button
            onClick={fetchMembers}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* TABEL DATA MEMBER */}
      <div className="-mx-6 overflow-x-auto">
        <table className="w-full text-left border-t border-slate-800/50">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800/50 bg-slate-800/20">
              <th className="px-6 py-3 font-semibold">ID Member</th>
              <th className="px-6 py-3 font-semibold text-center w-36">Foto Profil (WA & TG)</th>
              <th className="px-6 py-3 font-semibold">Nama Member</th>
              <th className="px-6 py-3 font-semibold">Profil WhatsApp</th>
              <th className="px-6 py-3 font-semibold">Profil Telegram</th>
              <th className="px-6 py-3 font-semibold">Kontak & LID WA</th>
              <th className="px-6 py-3 font-semibold text-right">Aksi Tarik Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {members.map((m) => {
              const hasWaPhoto = Boolean(m.photoUrl);
              const hasTgPhoto = Boolean(m.tgPhotoUrl);
              const waName = m.waProfileName && m.waProfileName !== '-' ? m.waProfileName : null;
              const tgName = m.tgProfileName && m.tgProfileName !== '-' ? m.tgProfileName : null;

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

                  {/* KOLOM 2: FOTO PROFIL WHATSAPP & TELEGRAM */}
                  <td className="px-6 py-4 text-sm text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Foto WA */}
                      <div className="relative group/wa" title={hasWaPhoto ? "Foto Profil WhatsApp" : "Foto WhatsApp Belum Ada"}>
                        {hasWaPhoto ? (
                          <img 
                            src={m.photoUrl} 
                            alt={m.name} 
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/80 shadow-sm" 
                            onError={(e) => { (e.target as any).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            WA
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 px-1 rounded-full text-[9px] bg-emerald-600 text-white font-bold">
                          WA
                        </span>
                      </div>

                      {/* Foto TG */}
                      <div className="relative group/tg" title={hasTgPhoto ? "Foto Profil Telegram" : "Foto Telegram Belum Ada"}>
                        {hasTgPhoto ? (
                          <img 
                            src={m.tgPhotoUrl} 
                            alt={m.name} 
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-sky-500/80 shadow-sm" 
                            onError={(e) => { (e.target as any).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
                            TG
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 px-1 rounded-full text-[9px] bg-sky-600 text-white font-bold">
                          TG
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* KOLOM 3: NAMA MEMBER */}
                  <td className="px-6 py-4 text-sm font-semibold text-white">
                    {m.name}
                  </td>

                  {/* KOLOM 4: NAMA PROFIL WHATSAPP */}
                  <td className="px-6 py-4 text-sm">
                    {waName ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                        💬 {waName}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic text-xs">-</span>
                    )}
                  </td>

                  {/* KOLOM 5: NAMA PROFIL TELEGRAM */}
                  <td className="px-6 py-4 text-sm">
                    {tgName ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-medium">
                        ✈️ {tgName}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic text-xs">{m.telegram || '-'}</span>
                    )}
                  </td>

                  {/* KOLOM 6: NOMOR WHATSAPP & LID */}
                  <td className="px-6 py-4 text-xs font-mono">
                    <div className="text-slate-300 font-semibold">{m.whatsapp || '-'}</div>
                    <div className="mt-1">
                      {m.lid ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] select-all" title="LID WhatsApp">
                          🆔 {m.lid}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">✨ Otomatis saat chat</span>
                      )}
                    </div>
                  </td>

                  {/* KOLOM 7: AKSI TARIK CEPAT */}
                  <td className="px-6 py-4 text-sm text-right">
                    <button
                      type="button"
                      disabled={loadingSync === m.id}
                      onClick={(e) => handleSyncAll(m.id, e)}
                      className="px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Tarik otomatis foto profil WA/TG, nama profil WA/TG, dan LID"
                    >
                      {loadingSync === m.id ? (
                        <>
                          <div className="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                          <span>Menarik...</span>
                        </>
                      ) : (
                        <>
                          <span>⚡ Tarik Lengkap</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}

            {members.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                  Belum ada data member. Klik tombol "➕ Tambah Member" di atas untuk menambahkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DETAIL & EDIT PROFIL LENGKAP */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                ⚙️ Profil & Penarik Data (WA & Telegram)
              </h3>
              <button 
                type="button"
                onClick={() => setSelectedMember(null)}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* KARTU FOTO PROFIL WHATSAPP & TELEGRAM */}
            <div className="grid grid-cols-2 gap-3 mb-5 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              {/* Box Foto WA */}
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-900/60 border border-emerald-500/20">
                <div className="relative mb-2">
                  {selectedMember.photoUrl ? (
                    <img 
                      src={selectedMember.photoUrl} 
                      alt="WA Photo" 
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500 shadow" 
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-slate-400 text-xs">
                      No WA Photo
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-600 text-white font-bold">
                    WA
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 mb-1">Foto Profil WhatsApp</span>
                <button
                  type="button"
                  disabled={loadingLookup}
                  onClick={() => handleLookupWa(editForm.whatsapp, 'edit')}
                  className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                >
                  🔄 Tarik Foto WA
                </button>
              </div>

              {/* Box Foto Telegram */}
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-900/60 border border-sky-500/20">
                <div className="relative mb-2">
                  {selectedMember.tgPhotoUrl ? (
                    <img 
                      src={selectedMember.tgPhotoUrl} 
                      alt="TG Photo" 
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-sky-500 shadow" 
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-slate-400 text-xs">
                      No TG Photo
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] bg-sky-600 text-white font-bold">
                    TG
                  </span>
                </div>
                <span className="text-[11px] font-bold text-sky-400 mb-1">Foto Profil Telegram</span>
                <button
                  type="button"
                  disabled={loadingLookup}
                  onClick={() => handleLookupTg(editForm.telegram, 'edit')}
                  className="px-2 py-1 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                >
                  🔄 Tarik Foto TG
                </button>
              </div>
            </div>

            {/* TOMBOL UTAMA: TARIK SEMUA PROFIL LENGKAP */}
            <div className="mb-5">
              <button
                type="button"
                disabled={loadingSync === selectedMember.id}
                onClick={() => handleSyncAll(selectedMember.id)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {loadingSync === selectedMember.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Menarik Semua Profil (WA & TG)...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Tarik Lengkap Sekaligus (Foto WA/TG, Nama WA/TG, LID)</span>
                  </>
                )}
              </button>
            </div>

            {/* FORMULIR DATA */}
            <div className="space-y-3.5 text-sm mb-6">
              {/* Nama Member */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Member (Nama Panggilan Kasir)
                </label>
                <input 
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Misal: Koi"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* 4. Menarik Nama Profil WhatsApp */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-emerald-400">
                    4. Nama Profil WhatsApp (Stiker & Nota)
                  </label>
                  <button
                    type="button"
                    disabled={loadingLookup}
                    onClick={() => handleLookupWa(editForm.whatsapp, 'edit')}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer disabled:opacity-50"
                  >
                    ⚡ Tarik Nama WA
                  </button>
                </div>
                <input 
                  type="text"
                  value={editForm.waProfileName}
                  onChange={(e) => setEditForm({ ...editForm, waProfileName: e.target.value })}
                  placeholder="Misal: Sar Tika"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* 5. Menarik Nama Profil Telegram */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-sky-400">
                    5. Nama Profil Telegram
                  </label>
                  <button
                    type="button"
                    disabled={loadingLookup}
                    onClick={() => handleLookupTg(editForm.telegram, 'edit')}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer disabled:opacity-50"
                  >
                    ⚡ Tarik Nama TG
                  </button>
                </div>
                <input 
                  type="text"
                  value={editForm.tgProfileName}
                  onChange={(e) => setEditForm({ ...editForm, tgProfileName: e.target.value })}
                  placeholder="Misal: Reza Firmansyah (@reza)"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-sky-500"
                />
              </div>

              {/* Nomor WhatsApp */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Nomor WhatsApp
                  </label>
                  <button
                    type="button"
                    disabled={loadingLookup}
                    onClick={() => handleLookupWa(editForm.whatsapp, 'edit')}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer disabled:opacity-50"
                  >
                    ⚡ Tarik Profil & LID WA
                  </button>
                </div>
                <input 
                  type="text"
                  value={editForm.whatsapp}
                  onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                  placeholder="0813xxxxxxxx"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* ID Telegram */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    ID / Username Telegram
                  </label>
                  <button
                    type="button"
                    disabled={loadingLookup}
                    onClick={() => handleLookupTg(editForm.telegram, 'edit')}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer disabled:opacity-50"
                  >
                    ⚡ Tarik Profil & Foto TG
                  </button>
                </div>
                <input 
                  type="text"
                  value={editForm.telegram}
                  onChange={(e) => setEditForm({ ...editForm, telegram: e.target.value })}
                  placeholder="Misal: ID:123456789 atau @username"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-sky-500"
                />
              </div>

              {/* 3. Menarik LID WhatsApp */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/70">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">🆔 3. LID WhatsApp</span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-semibold">
                      Auto-Detect
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={loadingLookup}
                    onClick={() => handleLookupWa(editForm.whatsapp, 'edit')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer disabled:opacity-50"
                  >
                    ⚡ Tarik LID dari WA
                  </button>
                </div>
                
                {editForm.lid ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                    <span className="text-xs font-mono text-sky-300 select-all font-semibold">
                      {editForm.lid}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(editForm.lid);
                        alert("✅ LID WhatsApp berhasil disalin!");
                      }}
                      className="px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-xs text-white flex items-center gap-1 cursor-pointer"
                    >
                      📋 Salin
                    </button>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-[11px] text-slate-300 leading-relaxed">
                    ✨ <strong>LID Otomatis:</strong> Tidak perlu input manual! Sistem bot akan otomatis menarik & menyinkronkan LID saat member mengirim pesan ke bot atau saat klik tombol <em>Tarik LID dari WA</em> di atas.
                  </div>
                )}
              </div>
            </div>

            {/* TOMBOL SIMPAN & KELUAR */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <button 
                type="button"
                disabled={savingEdit}
                onClick={handleSaveProfile}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {savingEdit ? 'Menyimpan...' : '💾 Simpan Perubahan'}
              </button>

              <button 
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {/* DANGER ZONE: HAPUS MEMBER */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end text-xs">
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
                className="text-red-400 hover:text-red-300 cursor-pointer"
              >
                🗑️ Hapus Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH MEMBER BARU */}
      {isAddingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                ➕ Tambah Member Baru
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddingMember(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Member * (Wajib)
                </label>
                <input 
                  type="text"
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  placeholder="Misal: Koi"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Nomor WhatsApp */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Nomor WhatsApp
                  </label>
                  <button
                    type="button"
                    disabled={loadingLookup}
                    onClick={() => handleLookupWa(newMemberForm.whatsapp, 'new')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    title="Tarik otomatis foto profil, nama, dan LID dari bot WhatsApp"
                  >
                    {loadingLookup ? (
                      <>
                        <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Menarik...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡ Tarik dari WA</span>
                      </>
                    )}
                  </button>
                </div>
                <input 
                  type="text"
                  value={newMemberForm.whatsapp}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, whatsapp: e.target.value })}
                  placeholder="0813xxxxxxxx"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* ID Telegram */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    ID Telegram (Opsional)
                  </label>
                  <button
                    type="button"
                    disabled={loadingLookup}
                    onClick={() => handleLookupTg(newMemberForm.telegram, 'new')}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    ⚡ Tarik dari TG
                  </button>
                </div>
                <input 
                  type="text"
                  value={newMemberForm.telegram}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, telegram: e.target.value })}
                  placeholder="Misal: 123456789 atau @username"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-sky-500"
                />
              </div>

              {/* Nama Profil WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Profil WhatsApp (Otomatis dari WA)
                </label>
                <input 
                  type="text"
                  value={newMemberForm.waProfileName}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, waProfileName: e.target.value })}
                  placeholder="Misal: Sar Tika"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Nama Profil Telegram */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Profil Telegram (Otomatis dari TG)
                </label>
                <input 
                  type="text"
                  value={newMemberForm.tgProfileName}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, tgProfileName: e.target.value })}
                  placeholder="Misal: Reza Firmansyah"
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-hidden focus:border-sky-500"
                />
              </div>

              {/* Status LID */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">🆔 LID WhatsApp</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                      Otomatis Ditarik Sistem
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {newMemberForm.lid ? (
                      <span className="text-sky-300 font-mono font-medium">Terhubung: {newMemberForm.lid}</span>
                    ) : (
                      "Sistem bot akan otomatis menarik & menyinkronkan LID saat nomor didaftarkan atau saat member chat."
                    )}
                  </p>
                </div>
                {newMemberForm.lid && (
                  <span className="px-2 py-1 rounded-lg bg-sky-500/20 text-sky-300 text-xs font-mono border border-sky-500/30">
                    ✅ Siap
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <button 
                type="button"
                onClick={handleAddMember}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                💾 Daftarkan Member
              </button>
              <button 
                type="button"
                onClick={() => setIsAddingMember(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
