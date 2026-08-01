import re

with open('src/components/views/MemberOffline.tsx', 'r') as f:
    code = f.read()

buttons = """            <div className="mt-8 flex gap-3">
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
                  if (confirm("Reset PIN member ini ke 123456?")) {
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
            </div>"""

code = re.sub(r'<div className="mt-8 flex gap-3">.*?Tutup.*?</div>', buttons, code, flags=re.DOTALL)

with open('src/components/views/MemberOffline.tsx', 'w') as f:
    f.write(code)

print("MemberOffline.tsx updated")
