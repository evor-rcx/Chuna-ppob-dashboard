#!/bin/bash
sed -i 's/{members.map((m) => (/{members.length > 0 ? members.map((m) => (/g' src/components/views/MemberOffline.tsx
sed -i 's/              <\/tr>\n            ))}/              <\/tr>\n            )) : <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">Tidak ada member offline.<\/td><\/tr>}/g' src/components/views/MemberOffline.tsx
