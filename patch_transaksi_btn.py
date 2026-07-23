import re

with open('/app/applet/src/components/views/Transaksi.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_btn = """                      <button 
                        onClick={() => printReceiptBluetooth(t)}
                        className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-md text-xs font-semibold hover:bg-indigo-500/30 transition-colors flex items-center gap-1 w-fit"
                        title="Cetak Struk Bluetooth"
                      >
                        🖨️ Bluetooth
                      </button>"""

new_btn = """                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          printReceiptBluetooth(t);
                        }}
                        className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-md text-xs font-semibold hover:bg-indigo-500/30 transition-colors flex items-center gap-1 w-fit"
                        title="Cetak Struk Bluetooth"
                      >
                        🖨️ Bluetooth
                      </button>"""

text = text.replace(old_btn, new_btn)

with open('/app/applet/src/components/views/Transaksi.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Button patched.")
