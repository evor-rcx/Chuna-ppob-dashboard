import re

with open('/app/applet/src/components/views/Transaksi.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace table headers
old_thead = """              <th className="px-6 py-3 font-semibold">Tujuan</th>
              <th className="px-6 py-3 font-semibold">Produk</th>
              <th className="px-6 py-3 font-semibold">Kode SKU</th>
              <th className="px-6 py-3 font-semibold">Pembayaran</th>
              <th className="px-6 py-3 font-semibold">Whatsapp</th>
              <th className="px-6 py-3 font-semibold">ID Telegram</th>
              <th className="px-6 py-3 font-semibold">Status</th>"""

new_thead = """              <th className="px-6 py-3 font-semibold">Tujuan</th>
              <th className="px-6 py-3 font-semibold">Produk</th>
              <th className="px-6 py-3 font-semibold">Ket/SN</th>
              <th className="px-6 py-3 font-semibold">Detail Harga</th>
              <th className="px-6 py-3 font-semibold">Pembayaran</th>
              <th className="px-6 py-3 font-semibold">Whatsapp</th>
              <th className="px-6 py-3 font-semibold">Status</th>"""

text = text.replace(old_thead, new_thead)

# Replace table body cells
old_tbody = """                <td className="px-6 py-4 text-sm font-mono text-slate-400">{t.target}</td>
                <td className="px-6 py-4 text-sm text-slate-200">{t.product}</td>
                <td className="px-6 py-4 text-sm font-mono text-sky-400">{t.sku || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-200 uppercase">{t.method}</td>
                <td className="px-6 py-4 text-sm font-mono text-slate-400">{t.whatsapp}</td>
                <td className="px-6 py-4 text-sm font-mono text-slate-400">{t.telegram}</td>
                <td className="px-6 py-4">"""

new_tbody = """                <td className="px-6 py-4 text-sm font-mono text-slate-400">{t.target}</td>
                <td className="px-6 py-4 text-sm text-slate-200">
                  <div className="font-semibold">{t.product}</div>
                  <div className="text-[10px] text-sky-400 font-mono mt-0.5">{t.sku || '-'}</div>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-amber-400 max-w-[150px] whitespace-normal break-all">
                  {t.sn || '-'}
                </td>
                <td className="px-6 py-4">
                  {t.type === 'pasca' ? (
                    <div className="flex flex-col gap-1 text-[11px] min-w-[140px]">
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Tagihan Pel:</span>
                        <span className="text-slate-200">Rp {(t.tagihan || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Admin Pel:</span>
                        <span className="text-slate-200">Rp {(t.admin_pel || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Harga Pel:</span>
                        <span className="text-slate-200">Rp {(t.price || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-t border-slate-700/50 pt-1 mt-1">
                        <span className="text-emerald-400">Fee/Cuan:</span>
                        <span className="text-emerald-400 font-bold">Rp {(t.cuan || 0).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 text-[11px] min-w-[140px]">
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Harga Modal:</span>
                        <span className="text-slate-200">Rp {(t.modal || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Harga Jual:</span>
                        <span className="text-slate-200">Rp {(t.price || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-t border-slate-700/50 pt-1 mt-1">
                        <span className="text-emerald-400">Fee/Cuan:</span>
                        <span className="text-emerald-400 font-bold">Rp {(t.cuan || 0).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-200 uppercase">{t.method}</td>
                <td className="px-6 py-4 text-xs font-mono text-slate-400">
                  {t.whatsapp ? (
                    <div>{t.whatsapp}</div>
                  ) : null}
                  {t.telegram ? (
                    <div className="text-sky-400 mt-1">TG: {t.telegram}</div>
                  ) : null}
                </td>
                <td className="px-6 py-4">"""

text = text.replace(old_tbody, new_tbody)
# Adjust colspan for empty state
text = text.replace("colSpan={10}", "colSpan={9}")

with open('/app/applet/src/components/views/Transaksi.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Modified Transaksi.tsx")
