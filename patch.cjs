const fs = require('fs');
let code = fs.readFileSync('src/components/views/KasirFisik.tsx', 'utf-8');

const oldGrid = `<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Total Modal Terpakai (Aset + Biaya)</div>
                        <div className="text-lg font-bold text-slate-300">Rp {(stats.totalModalKeseluruhan || 0).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Total Aset Uang di Barang</div>
                        <div className="text-lg font-bold text-yellow-400">Rp {(stats.totalNilaiStok || 0).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="bg-slate-900 border border-emerald-900/50 rounded-xl p-4">
                        <div className="text-xs text-emerald-400/70 mb-1">Fee / Laba (Bulan Ini)</div>
                        <div className="text-lg font-bold text-emerald-400">Rp {(stats.totalFeeTerjual || 0).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Sisa Uang Laci (Bulan Ini)</div>
                        <div className="text-lg font-bold text-blue-400">Rp {((stats.totalPendapatan || 0) - (stats.totalPengeluaran || 0)).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Pengeluaran Lain (Bulan Ini)</div>
                        <div className="text-lg font-bold text-red-400">Rp {(stats.totalPengeluaran || 0).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Kerugian (Bulan Ini)</div>
                        <div className="text-lg font-bold text-yellow-500">Rp {((stats as any).totalKerugian || 0).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Piutang (Belum Lunas)</div>
                        <div className="text-lg font-bold text-orange-400">Rp {(stats.totalPiutang || 0).toLocaleString('id-ID')}</div>
                    </div>`;

const newGrid = `<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 relative overflow-hidden">
                        <div className="text-xs text-slate-400 mb-1">Total Modal di Barang</div>
                        <div className="text-lg font-bold text-yellow-400">Rp {(stats.totalNilaiStok || 0).toLocaleString('id-ID')}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Turun jika produk laku</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Total Modal Sudah Balik</div>
                        <div className="text-lg font-bold text-emerald-400">Rp {(stats.modalTerjual || 0).toLocaleString('id-ID')}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Modal dari barang yg laku</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Pengeluaran Tambahan</div>
                        <div className="text-lg font-bold text-red-400">Rp {(stats.totalPengeluaran || 0).toLocaleString('id-ID')}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Plastik, es, operasional</div>
                    </div>
                    <div className="bg-slate-900 border border-emerald-900/50 rounded-xl p-4">
                        <div className="text-xs text-emerald-400/70 mb-1">Keuntungan / Laba Bersih</div>
                        <div className="text-lg font-bold text-emerald-400">Rp {((stats as any).totalKeuntungan || 0).toLocaleString('id-ID')}</div>
                        <div className="text-[10px] text-emerald-400/50 mt-1">Pendapatan - Modal - Biaya</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Estimasi Uang Laci (Cash)</div>
                        <div className="text-lg font-bold text-blue-400">Rp {((stats.totalPendapatan || 0) - (stats.totalPengeluaran || 0)).toLocaleString('id-ID')}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Uang tunai yg diterima</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Kerugian (Barang Rusak)</div>
                        <div className="text-lg font-bold text-yellow-500">Rp {((stats as any).totalKerugian || 0).toLocaleString('id-ID')}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Nilai modal terbuang</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Piutang (Belum Lunas)</div>
                        <div className="text-lg font-bold text-orange-400">Rp {(stats.totalPiutang || 0).toLocaleString('id-ID')}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Hutang pelanggan</div>
                    </div>`;

code = code.replace(oldGrid, newGrid);
fs.writeFileSync('src/components/views/KasirFisik.tsx', code);
