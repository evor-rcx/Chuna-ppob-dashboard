import re

with open('/app/applet/src/components/views/Transaksi.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

btn_old = """                  {t.status.includes('Sukses') && (
                    <a 
                      href={`/api/nota/${t.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-md text-xs font-semibold hover:bg-indigo-500/30 transition-colors flex items-center gap-1 w-fit"
                      title="Cetak Struk HTML"
                    >
                      🖨️ Cetak Struk
                    </a>
                  )}"""

btn_new = """                  {t.status.includes('Sukses') && (
                    <div className="flex gap-2 items-center justify-end">
                      <a 
                        href={`/api/nota/${t.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded-md text-xs font-semibold hover:bg-sky-500/30 transition-colors flex items-center gap-1 w-fit"
                        title="Nota Web (HTML)"
                      >
                        🌐 Web
                      </a>
                      <button 
                        onClick={() => printReceiptBluetooth(t)}
                        className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-md text-xs font-semibold hover:bg-indigo-500/30 transition-colors flex items-center gap-1 w-fit"
                        title="Cetak Struk Bluetooth"
                      >
                        🖨️ Bluetooth
                      </button>
                    </div>
                  )}"""

text = text.replace(btn_old, btn_new)

with open('/app/applet/src/components/views/Transaksi.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Added bluetooth print button.")
