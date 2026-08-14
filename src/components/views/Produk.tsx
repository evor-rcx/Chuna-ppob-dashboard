import { useState, useEffect } from 'react';
import { PageContainer } from '../PageContainer';

export function Produk({ onBack }: { onBack: () => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [type, setType] = useState('prepaid');
  const [search, setSearch] = useState('');
  
  // Track modified fees locally before saving
  const [fees, setFees] = useState<Record<string, { biasa: string, vip: string, owner: string }>>({});
  const [hargas, setHargas] = useState<Record<string, { owner: string }>>({});
  const [savingSku, setSavingSku] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/digiflazz/products?type=${type}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        const newFees: Record<string, { biasa: string, vip: string, owner: string }> = {};
        const newHargas: Record<string, { owner: string }> = {};
        data.data.forEach((p: any) => {
           const price = Number(p.price) || 0;
           const feeOwner = p.fee_owner || 0;
           newFees[p.buyer_sku_code] = { biasa: (p.fee_biasa || 0).toString(), vip: (p.fee_vip || 0).toString(), owner: feeOwner.toString() };
           newHargas[p.buyer_sku_code] = { owner: p.owner_fixed !== undefined ? p.owner_fixed.toString() : (price + feeOwner).toString() };
        });
        setFees(newFees);
        setHargas(newHargas);
      } else {
        setError(data.error || 'Gagal mengambil produk');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [type]);

  const handleFeeChange = (sku: string, field: 'biasa'|'vip', value: string) => {
    let finalValue = value.replace(/\D/g, '');
    if (finalValue === '') {
        finalValue = '';
    } else {
        finalValue = parseInt(finalValue, 10).toString();
    }
    setFees(prev => ({
      ...prev,
      [sku]: { ...(prev[sku] || { biasa: '', vip: '', owner: '' }), [field]: finalValue }
    }));
  };

  const handleHargaOwnerChange = (sku: string, value: string) => {
    let finalValue = value.replace(/\D/g, '');
    if (finalValue === '') {
        finalValue = '';
    } else {
        finalValue = parseInt(finalValue, 10).toString();
    }
    setHargas(prev => ({
      ...prev,
      [sku]: { owner: finalValue }
    }));
  };

  const handleSaveFee = async (sku: string) => {
    setSavingSku(sku);
    try {
      const p = products.find(prod => prod.buyer_sku_code === sku);
      const basePrice = Number(p?.price) || 0;
      
      const fee = fees[sku] || { biasa: "0", vip: "0", owner: "0" };
      const hargaOwnerStr = hargas[sku]?.owner !== undefined && hargas[sku]?.owner !== "" ? hargas[sku].owner : basePrice.toString();
      const hargaOwnerVal = parseInt(hargaOwnerStr) || basePrice;
      const calculatedOwnerFee = Math.max(0, hargaOwnerVal - basePrice);

      const res = await fetch('/api/digiflazz/products/fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, biasa: parseInt(fee.biasa as string) || 0, vip: parseInt(fee.vip as string) || 0, owner: calculatedOwnerFee, owner_fixed: hargaOwnerVal })
      });
      const data = await res.json();
      if (!data.success) {
        console.error(data.error || 'Gagal menyimpan fee');
      }
    } catch (err) {
      console.error('Terjadi kesalahan saat menyimpan fee');
    } finally {
      setSavingSku(null);
    }
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      const bulkFees = filteredProducts.map(p => {
        const sku = p.buyer_sku_code;
        const fee = fees[sku] || { biasa: "0", vip: "0", owner: "0" };
        const basePrice = Number(p.price) || 0;
        const hargaOwnerStr = hargas[sku]?.owner !== undefined && hargas[sku]?.owner !== "" ? hargas[sku].owner : basePrice.toString();
        const hargaOwnerVal = parseInt(hargaOwnerStr) || basePrice;
        const calculatedOwnerFee = Math.max(0, hargaOwnerVal - basePrice);
        
        return {
          sku,
          biasa: parseInt(fee.biasa as string) || 0,
          vip: parseInt(fee.vip as string) || 0,
          owner: calculatedOwnerFee, owner_fixed: hargaOwnerVal
        };
      });
      
      const res = await fetch('/api/digiflazz/products/fee/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fees: bulkFees })
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Gagal menyimpan bulk fee');
      } else {
        alert('Semua perubahan berhasil disimpan!');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan bulk fee');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.product_name && p.product_name.toLowerCase()?.includes(q)) ||
      (p.brand && p.brand.toLowerCase()?.includes(q)) ||
      (p.buyer_sku_code && p.buyer_sku_code.toLowerCase()?.includes(q))
    );
  });

  return (
    <PageContainer onBack={onBack} title="Kelola Harga Produk Digiflazz">
      <div className="space-y-6">

        <div className="flex gap-2">
          <button 
            onClick={() => setType('prepaid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'prepaid' ? 'bg-sky-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}
          >
            Prabayar
          </button>
          <button 
            onClick={() => setType('pasca')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'pasca' ? 'bg-sky-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}
          >
            Pascabayar
          </button>
        </div>

        <input 
          type="text" 
          placeholder="Cari produk, brand, kode sku..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700/50 p-3 rounded-lg text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
        />

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={fetchProducts}
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {loading ? 'Memuat...' : '🔄 Refresh'}
            </button>
          </div>
          <button 
            onClick={handleSaveAll}
            disabled={loading}
            className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 px-6 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/10"
          >
            💾 Simpan Semua (Bulk Save)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800/50 bg-slate-800/20">
                <th className="px-6 py-3 font-semibold">Brand</th>
                <th className="px-6 py-3 font-semibold">Kode SKU</th>
                <th className="px-6 py-3 font-semibold">Produk</th>
                <th className="px-6 py-3 font-semibold">Harga Modal</th>
                <th className="px-6 py-3 font-semibold">Fee (Biasa)</th>
                <th className="px-6 py-3 font-semibold">Fee (VIP)</th>
                <th className="px-6 py-3 font-semibold">Harga Jual (Owner)</th>
                <th className="px-6 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {filteredProducts.map((p) => {
                const isSaving = savingSku === p.buyer_sku_code;
                const pFee = fees[p.buyer_sku_code] || { biasa: 0, vip: 0, owner: 0 };
                const originalPrice = Number(p.price) || 0;
                const pHargaOwner = hargas[p.buyer_sku_code]?.owner !== undefined ? hargas[p.buyer_sku_code].owner : originalPrice.toString();
                return (
                <tr key={p.buyer_sku_code} className="hover:bg-slate-700/10 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-400">{p.brand}</td>
                  <td className="px-6 py-4 text-sm font-mono text-sky-400">{p.buyer_sku_code}</td>
                  <td className="px-6 py-4 text-sm text-slate-200">
                    <div>{p.product_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{p.category}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-200 font-medium">Rp {originalPrice.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" inputMode="numeric" placeholder="0" 
                      value={pFee.biasa}
                      onChange={e => handleFeeChange(p.buyer_sku_code, 'biasa', e.target.value)}
                      onBlur={() => handleSaveFee(p.buyer_sku_code)}
                      className="w-24 bg-slate-800/50 border border-slate-700/50 p-2 rounded-lg text-white text-sm outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" inputMode="numeric" placeholder="0" 
                      value={pFee.vip}
                      onChange={e => handleFeeChange(p.buyer_sku_code, 'vip', e.target.value)}
                      onBlur={() => handleSaveFee(p.buyer_sku_code)}
                      className="w-24 bg-slate-800/50 border border-slate-700/50 p-2 rounded-lg text-white text-sm outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" inputMode="numeric" placeholder="0" 
                      value={pHargaOwner}
                      onChange={e => handleHargaOwnerChange(p.buyer_sku_code, e.target.value)}
                      onBlur={() => handleSaveFee(p.buyer_sku_code)}
                      className="w-24 bg-slate-800/50 border border-slate-700/50 p-2 rounded-lg text-white text-sm outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleSaveFee(p.buyer_sku_code)}
                      disabled={isSaving}
                      className="bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/20 hover:border-sky-500 disabled:opacity-50 font-medium py-1.5 px-4 rounded-lg cursor-pointer transition-colors text-sm"
                    >
                      {isSaving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </td>
                </tr>
              )})}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400 text-sm">
                    {search ? 'Produk tidak ditemukan.' : 'Tidak ada produk untuk kategori ini.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
