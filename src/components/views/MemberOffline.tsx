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
                <td className="px-6 py-4 text-sm text-slate-200">{m.name}</td>
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
            <h3 className="text-lg font-semibold text-white mb-4">Detail Member Offline</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">ID Registrasi:</span>
                <span className="text-slate-200 font-mono">{selectedMember.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Username:</span>
                <span className="text-slate-200">{selectedMember.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nomor WhatsApp:</span>
                <span className="text-slate-200">{selectedMember.whatsapp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tipe Akun:</span>
                <span className="text-sky-400 font-medium">{selectedMember.type || 'Biasa'}</span>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3">
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
