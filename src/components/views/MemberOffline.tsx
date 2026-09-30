import { useState, useEffect } from "react";
import { PageContainer } from '../PageContainer';

export function MemberOffline({ onBack }: { onBack: () => void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/members/offline")
      .then(res => res.json())
      .then(data => setMembers(data.members || []))
      .catch(() => {});
  }, []);

  return (
    <PageContainer title="Daftar Member Offline" onBack={onBack}>
      <p className="text-xs text-slate-500 mb-6">Klik pada baris tabel untuk melihat detail member</p>
      <div className="-mx-6">
        <table className="w-full text-left border-t border-slate-800/50">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800/50 bg-slate-800/20">
              <th className="px-6 py-3 font-semibold">ID Registrasi</th>
              <th className="px-6 py-3 font-semibold">Username</th>
              <th className="px-6 py-3 font-semibold">Nomor WhatsApp</th>
              <th className="px-6 py-3 font-semibold">Tipe Akun</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {members.map((m) => (
              <tr 
                key={m.id} 
                className="hover:bg-slate-700/10 transition-colors cursor-pointer"
                onClick={() => setSelectedMember(m)}
              >
                <td className="px-6 py-4 text-sm font-mono text-slate-400">{m.id}</td>
                <td className="px-6 py-4 text-sm text-slate-200">
                  <div className="flex items-center gap-3">
                    {m.photoUrl ? (
                      <img 
                        src={m.photoUrl} 
                        alt={m.name} 
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/60" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
                        {(m.name || 'MB').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-white">{m.name}</span>
                      {m.photoUrl ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-normal">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span> Foto WA Terhubung
                        </span>
                      ) : (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          WA: {m.whatsapp}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{m.whatsapp}</td>
                <td className="px-6 py-4 text-sm text-sky-400">{m.type || 'Biasa'}</td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">Tidak ada member offline.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-6">
              {selectedMember.photoUrl ? (
                <img 
                  src={selectedMember.photoUrl} 
                  alt={selectedMember.name} 
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-500/50" 
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-xl font-bold text-slate-300">
                  {(selectedMember.name || 'MB').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedMember.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedMember.id}</p>
                {selectedMember.photoUrl ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Foto WhatsApp Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 mt-1">
                    Belum Terhubung Foto WA
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
              <div className="flex justify-between">
                <span className="text-slate-400">Nomor WhatsApp:</span>
                <span className="text-slate-200 font-medium">{selectedMember.whatsapp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tipe Akun:</span>
                <span className="text-sky-400 font-medium">{selectedMember.type || 'Biasa'}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  fetch(`/api/members/${selectedMember.id}/sync-photo`, { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                      if (data.success && data.photoUrl) {
                        alert("Foto profil WhatsApp berhasil disinkron!");
                        setSelectedMember({ ...selectedMember, photoUrl: data.photoUrl });
                        setMembers(members.map(m => m.id === selectedMember.id ? { ...m, photoUrl: data.photoUrl } : m));
                      } else {
                        alert(data.error || "Gagal mengambil foto");
                      }
                    })
                    .catch(() => alert("Gagal menghubungi server"));
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium hover:bg-emerald-500/25 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                🔄 Ambil Otomatis dari WhatsApp Live
              </button>

              <label className="w-full py-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 font-medium hover:bg-sky-500/25 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer">
                📁 Upload Foto Profil dari Galeri / File
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
                          alert("Foto profil berhasil diunggah dan disimpan ke WhatsApp profile!");
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
            
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => {
                  if (confirm("Apakah Anda yakin ingin menghapus member ini?")) {
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
                className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors"
              >
                Hapus Member
              </button>
              <button 
                onClick={() => {
                  if (confirm("Reset PIN member ini? Bot akan mengirim pesan untuk meminta member membuat PIN baru.")) {
                    fetch(`/api/members/${selectedMember.id}/reset-pin`, { method: 'POST' })
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
                className="flex-1 py-2 rounded-lg bg-amber-500/10 text-amber-400 font-medium hover:bg-amber-500/20 transition-colors"
              >
                Reset PIN
              </button>
              <button 
                onClick={() => setSelectedMember(null)}
                className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
