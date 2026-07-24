#!/bin/bash
sed -i 's/              <\/tr>\n            ))}/              <\/tr>\n            ))} {transactions.length === 0 \&\& <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">Tidak ada transaksi.<\/td><\/tr>}/g' src/components/views/Transaksi.tsx
