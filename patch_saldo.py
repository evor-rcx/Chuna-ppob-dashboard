import re

with open('src/components/views/Saldo.tsx', 'r') as f:
    code = f.read()

buttons = """                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={() => setTopupModal({ isOpen: true, memberId: m.id })}
                      className="bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 font-medium py-1.5 px-3 rounded-lg cursor-pointer transition-colors text-xs uppercase tracking-wider"
                      title="Topup Saldo"
                    >
                      Topup
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm("Reset PIN member ini ke 123456?")) {
                          fetch(`/api/members/${m.id}/reset-pin`, { method: 'POST' })
                          .then(res => res.json())
                          .then(data => {
                            if (data.success) {
                              alert(data.message + ". Member akan diminta membuat ulang PIN atau menggunakan 123456.");
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
                </td>"""

code = re.sub(r'<td className="px-6 py-4 text-right">.*?Topup.*?</td>', buttons, code, flags=re.DOTALL)

with open('src/components/views/Saldo.tsx', 'w') as f:
    f.write(code)

print("Saldo.tsx updated")
