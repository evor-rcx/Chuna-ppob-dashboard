import re

with open('src/components/views/Transaksi.tsx', 'r') as f:
    code = f.read()

btn_pattern = r"""                      <a 
                        href=\{\`/api/nota/\$\{t\.id\}\`\}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded-md text-xs font-semibold hover:bg-sky-500/30 transition-colors flex items-center gap-1 w-fit"
                        title="Print Nota Gambar"
                      >
                        🖼️ Web Print
                      </a>"""

new_btn = """                      <a 
                        href={`/api/nota/${t.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded-md text-xs font-semibold hover:bg-sky-500/30 transition-colors flex items-center gap-1 w-fit"
                        title="Print Nota Gambar"
                      >
                        🖼️ Web Print
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          const email = prompt("Masukkan email tujuan untuk mengirim nota:");
                          if (email) {
                            fetch(`/api/nota/${t.id}/send-email`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email })
                            })
                            .then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                alert("Nota berhasil dikirim ke email!");
                              } else {
                                alert("Gagal: " + data.error);
                              }
                            })
                            .catch(() => alert("Terjadi kesalahan saat mengirim email"));
                          }
                        }}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-md text-xs font-semibold hover:bg-red-500/30 transition-colors flex items-center gap-1 w-fit"
                        title="Kirim Nota ke Gmail"
                      >
                        ✉️ Kirim Email
                      </button>"""

code = re.sub(btn_pattern, new_btn, code)

with open('src/components/views/Transaksi.tsx', 'w') as f:
    f.write(code)

print("Transaksi.tsx updated")
