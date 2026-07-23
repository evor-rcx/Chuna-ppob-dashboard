import re

with open('/app/applet/src/utils/printReceipt.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text += """
export function printReceiptHTML(transaction: any) {
  window.open('/api/nota/' + transaction.id, '_blank');
}
"""

with open('/app/applet/src/utils/printReceipt.ts', 'w', encoding='utf-8') as f:
    f.write(text)

with open('/app/applet/src/components/views/Transaksi.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('import { printReceiptBluetooth }', 'import { printReceiptBluetooth, printReceiptHTML }')

btn_old = """                    <button 
                      onClick={() => printReceiptBluetooth(t)}
                      className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-md text-xs font-semibold hover:bg-indigo-500/30 transition-colors flex items-center gap-1"
                      title="Cetak Struk via Bluetooth"
                    >
                      🖨️ Cetak Struk
                    </button>"""

btn_new = """                    <button 
                      onClick={() => printReceiptHTML(t)}
                      className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-md text-xs font-semibold hover:bg-indigo-500/30 transition-colors flex items-center gap-1"
                      title="Cetak Struk HTML"
                    >
                      🖨️ Cetak Struk
                    </button>"""

text = text.replace(btn_old, btn_new)

with open('/app/applet/src/components/views/Transaksi.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Replaced print button with HTML print")
