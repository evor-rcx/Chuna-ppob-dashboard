import { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '../PageContainer';
import { 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  Save, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Gamepad2, 
  CreditCard, 
  Smartphone, 
  Zap, 
  Sparkles, 
  Check, 
  Flame, 
  Layers, 
  X, 
  CheckCircle2,
  Tv,
  Receipt,
  Ticket
} from 'lucide-react';

interface ProdukProps {
  onBack: () => void;
}

export function Produk({ onBack }: { onBack: () => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [type, setType] = useState('prepaid');
  const [search, setSearch] = useState('');
  
  // Category & Brand Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  
  // Sorting State - default is price ascending with diamond tie-breaker
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'nominal-asc' | 'name-asc' | 'name-desc'>('price-asc');

  // Track modified fees locally before saving
  const [fees, setFees] = useState<Record<string, { biasa: string, vip: string, owner: string }>>({});
  const [hargas, setHargas] = useState<Record<string, { owner: string }>>({});
  const [savingSku, setSavingSku] = useState<string | null>(null);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string>('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/digiflazz/products?type=${type}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
        const newFees: Record<string, { biasa: string, vip: string, owner: string }> = {};
        const newHargas: Record<string, { owner: string }> = {};
        data.data.forEach((p: any) => {
           const price = Number(p.price) || 0;
           const feeOwner = p.fee_owner || 0;
           newFees[p.buyer_sku_code] = { 
             biasa: (p.fee_biasa || 0).toString(), 
             vip: (p.fee_vip || 0).toString(), 
             owner: feeOwner.toString() 
           };
           newHargas[p.buyer_sku_code] = { 
             owner: p.owner_fixed !== undefined ? p.owner_fixed.toString() : (price + feeOwner).toString() 
           };
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

  // When type changes, reset filters
  useEffect(() => {
    setSelectedCategory('ALL');
    setSelectedBrand('ALL');
  }, [type]);

  // Extract nominal number from product title for smart sorting
  const extractNominal = (name: string): number => {
    if (!name) return 0;
    // Match diamond/uc/token/amount numbers like "70 Diamond", "3 Diamonds", "10.000", "50000"
    const match = name.match(/(\d+[\.\d]*)/);
    if (!match) return 0;
    return parseFloat(match[0].replace(/\./g, '')) || 0;
  };

  // Helper to categorize product accurately
  const getNormalizedCategory = (p: any): string => {
    const cat = (p.category || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const name = (p.product_name || '').toLowerCase();

    if (cat.includes('game') || brand.includes('free fire') || brand.includes('mobile legend') || brand.includes('pubg') || brand.includes('genshin') || brand.includes('roblox') || brand.includes('valorant')) {
      return 'Games';
    }
    if (cat.includes('money') || cat.includes('wallet') || brand.includes('dana') || brand.includes('gopay') || brand.includes('ovo') || brand.includes('shopee') || brand.includes('linkaja')) {
      return 'E-Money';
    }
    if (cat.includes('pulsa') || (!cat.includes('data') && (brand.includes('telkomsel') || brand.includes('indosat') || brand.includes('xl') || brand.includes('axis') || brand.includes('tri') || brand.includes('smartfren')) && !name.includes('data') && !name.includes('gb'))) {
      return 'Pulsa';
    }
    if (cat.includes('data') || cat.includes('paket') || name.includes('data') || name.includes('gb')) {
      return 'Data';
    }
    if (cat.includes('pln') || brand.includes('pln') || name.includes('pln') || name.includes('token')) {
      return 'PLN';
    }
    if (cat.includes('voucher') || brand.includes('google play') || brand.includes('steam')) {
      return 'Voucher';
    }
    if (cat.includes('stream') || cat.includes('tv') || brand.includes('netflix') || brand.includes('spotify')) {
      return 'Streaming';
    }
    if (cat.includes('pasca') || cat.includes('tagihan') || p.type === 'Tagihan') {
      return 'Pascabayar';
    }
    return p.category || 'Lainnya';
  };

  // All categories available in current product list
  const availableCategories = useMemo(() => {
    const catMap = new Map<string, number>();
    products.forEach(p => {
      const cat = getNormalizedCategory(p);
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });

    const standardOrder = ['Games', 'E-Money', 'Pulsa', 'Data', 'PLN', 'Voucher', 'Streaming', 'Pascabayar'];
    const sortedCats: { name: string; count: number }[] = [];

    // Add standard ones in preferred order if present
    standardOrder.forEach(sc => {
      if (catMap.has(sc)) {
        sortedCats.push({ name: sc, count: catMap.get(sc)! });
        catMap.delete(sc);
      }
    });

    // Add any remaining categories
    catMap.forEach((count, name) => {
      sortedCats.push({ name, count });
    });

    return sortedCats;
  }, [products]);

  // Available brands under current category (e.g. all games when Games is selected)
  const availableBrands = useMemo(() => {
    const brandMap = new Map<string, number>();
    products.forEach(p => {
      const cat = getNormalizedCategory(p);
      if (selectedCategory === 'ALL' || cat === selectedCategory) {
        const b = p.brand ? p.brand.trim() : 'Lainnya';
        brandMap.set(b, (brandMap.get(b) || 0) + 1);
      }
    });

    return Array.from(brandMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => {
        // Prioritize famous brands like FREE FIRE, MOBILE LEGENDS, DANA, GOPAY, TELKOMSEL
        const getPriority = (str: string) => {
          const s = str.toUpperCase();
          if (s.includes('FREE FIRE')) return 1;
          if (s.includes('MOBILE LEGEND')) return 2;
          if (s.includes('PUBG')) return 3;
          if (s.includes('GENSHIN')) return 4;
          if (s.includes('ROBLOX')) return 5;
          if (s.includes('DANA')) return 1;
          if (s.includes('GOPAY')) return 2;
          if (s.includes('OVO')) return 3;
          if (s.includes('SHOPEEPAY')) return 4;
          if (s.includes('TELKOMSEL')) return 1;
          if (s.includes('INDOSAT')) return 2;
          if (s.includes('XL')) return 3;
          return 10;
        };
        const pA = getPriority(a.name);
        const pB = getPriority(b.name);
        if (pA !== pB) return pA - pB;
        return a.name.localeCompare(b.name);
      });
  }, [products, selectedCategory]);

  // Handle changing category: auto-reset or retain brand if valid
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedBrand('ALL');
  };

  // Filtered & Sorted Products
  const displayedProducts = useMemo(() => {
    const q = search.toLowerCase().trim();

    const filtered = products.filter(p => {
      // Category filter
      if (selectedCategory !== 'ALL') {
        const cat = getNormalizedCategory(p);
        if (cat !== selectedCategory) return false;
      }

      // Brand filter (e.g. Free Fire, Mobile Legends, Dana, etc.)
      if (selectedBrand !== 'ALL') {
        if ((p.brand || '').trim().toUpperCase() !== selectedBrand.toUpperCase()) {
          return false;
        }
      }

      // Search query
      if (q) {
        const matchName = (p.product_name && p.product_name.toLowerCase().includes(q));
        const matchBrand = (p.brand && p.brand.toLowerCase().includes(q));
        const matchSku = (p.buyer_sku_code && p.buyer_sku_code.toLowerCase().includes(q));
        const matchCat = (p.category && p.category.toLowerCase().includes(q));
        if (!matchName && !matchBrand && !matchSku && !matchCat) return false;
      }

      return true;
    });

    // Smart Sorting: Fixes "Mobile Legends masi berantakan contoh nya"
    return filtered.sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;

      if (sortBy === 'price-asc') {
        if (priceA !== priceB) return priceA - priceB;
        // Tie-breaker: sort by diamond count / numeric value in product name
        return extractNominal(a.product_name) - extractNominal(b.product_name);
      }
      if (sortBy === 'price-desc') {
        if (priceA !== priceB) return priceB - priceA;
        return extractNominal(b.product_name) - extractNominal(a.product_name);
      }
      if (sortBy === 'nominal-asc') {
        const nomA = extractNominal(a.product_name);
        const nomB = extractNominal(b.product_name);
        if (nomA !== nomB) return nomA - nomB;
        return priceA - priceB;
      }
      if (sortBy === 'name-asc') {
        return (a.product_name || '').localeCompare(b.product_name || '');
      }
      if (sortBy === 'name-desc') {
        return (b.product_name || '').localeCompare(a.product_name || '');
      }
      return priceA - priceB;
    });
  }, [products, selectedCategory, selectedBrand, search, sortBy]);

  const handleFeeChange = (sku: string, field: 'biasa'|'vip', value: string) => {
    let finalValue = value.replace(/\D/g, '');
    if (finalValue !== '') {
      finalValue = parseInt(finalValue, 10).toString();
    }
    setFees(prev => ({
      ...prev,
      [sku]: { ...(prev[sku] || { biasa: '', vip: '', owner: '' }), [field]: finalValue }
    }));
  };

  const handleHargaOwnerChange = (sku: string, value: string) => {
    let finalValue = value.replace(/\D/g, '');
    if (finalValue !== '') {
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
        body: JSON.stringify({ 
          sku, 
          biasa: parseInt(fee.biasa as string) || 0, 
          vip: parseInt(fee.vip as string) || 0, 
          owner: calculatedOwnerFee, 
          owner_fixed: hargaOwnerVal 
        })
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccessMsg(`SKU ${sku} tersimpan!`);
        setTimeout(() => setSavedSuccessMsg(''), 2500);
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
      const bulkFees = displayedProducts.map(p => {
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
          owner: calculatedOwnerFee, 
          owner_fixed: hargaOwnerVal
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
        setSavedSuccessMsg(`Berhasil menyimpan ${bulkFees.length} produk!`);
        setTimeout(() => setSavedSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan bulk fee');
    } finally {
      setLoading(false);
    }
  };

  // Helper for category icon
  const getCategoryIcon = (catName: string) => {
    switch (catName) {
      case 'Games': return <Gamepad2 size={16} className="text-amber-400" />;
      case 'E-Money': return <CreditCard size={16} className="text-emerald-400" />;
      case 'Pulsa': return <Smartphone size={16} className="text-sky-400" />;
      case 'Data': return <Zap size={16} className="text-indigo-400" />;
      case 'PLN': return <Zap size={16} className="text-yellow-400" />;
      case 'Voucher': return <Ticket size={16} className="text-pink-400" />;
      case 'Streaming': return <Tv size={16} className="text-purple-400" />;
      case 'Pascabayar': return <Receipt size={16} className="text-teal-400" />;
      default: return <Layers size={16} className="text-slate-400" />;
    }
  };

  // Brand icon indicator
  const getBrandIcon = (brandName: string) => {
    const b = brandName.toUpperCase();
    if (b.includes('FREE FIRE')) return <Flame size={14} className="text-orange-400 animate-pulse" />;
    if (b.includes('MOBILE LEGEND')) return <Sparkles size={14} className="text-cyan-400" />;
    if (b.includes('PUBG')) return <span className="text-xs">🪂</span>;
    if (b.includes('GENSHIN')) return <span className="text-xs">⚡</span>;
    if (b.includes('ROBLOX')) return <span className="text-xs">🧱</span>;
    if (b.includes('DANA')) return <span className="text-xs text-blue-400 font-bold">D</span>;
    if (b.includes('GOPAY')) return <span className="text-xs text-emerald-400 font-bold">G</span>;
    if (b.includes('OVO')) return <span className="text-xs text-purple-400 font-bold">O</span>;
    return null;
  };

  return (
    <PageContainer onBack={onBack} title="Kelola Harga & Markup Produk Digiflazz">
      <div className="space-y-6">

        {/* Top Bar: Prepaid / Pasca Toggle & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setType('prepaid')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                type === 'prepaid' 
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20' 
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Smartphone size={16} /> Prabayar
            </button>
            <button 
              onClick={() => setType('pasca')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                type === 'pasca' 
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20' 
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Receipt size={16} /> Pascabayar
            </button>
          </div>

          {/* Quick Action: Refresh & Save All */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={fetchProducts}
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer border border-slate-700"
              title="Refresh Produk dari Server"
            >
              <RefreshCw size={15} className={loading ? "animate-spin text-sky-400" : ""} />
            </button>

            <button 
              onClick={handleSaveAll}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Save size={16} /> Simpan Semua ({displayedProducts.length})
            </button>
          </div>
        </div>

        {/* Success / Error Banners */}
        {savedSuccessMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* 1. ROW TOMBOL KATEGORI UTAMA: Dari E-Money, Games, sampai Semua Kategori */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-300">
              <Layers size={14} className="text-sky-400" /> Kategori Produk Digiflazz:
            </span>
            <span className="text-[11px] text-slate-400">
              Total {products.length} produk terhubung
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSelectCategory('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'ALL'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 ring-2 ring-amber-300/50'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/50'
              }`}
            >
              <Sparkles size={14} /> Semua Kategori ({products.length})
            </button>

            {availableCategories.map(cat => {
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => handleSelectCategory(cat.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20 ring-2 ring-sky-400/50'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/50'
                  }`}
                >
                  {getCategoryIcon(cat.name)}
                  <span>{cat.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. SUB-ROW TOMBOL BRAND GAME / E-MONEY / PROVIDER */}
        {/* Ketika di pencet game, otomatis menarik semua game yang ada di Digiflazz (Free Fire, Mobile Legends, PUBG, dll.) */}
        <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                {selectedCategory === 'Games' 
                  ? '🎮 Pilih Game Spesifik (Otomatis Ditarik dari Digiflazz):' 
                  : selectedCategory === 'E-Money'
                  ? '💳 Pilih Layanan E-Money:'
                  : selectedCategory === 'Pulsa' || selectedCategory === 'Data'
                  ? '📱 Pilih Operator / Provider:'
                  : `Daftar Brand / Sub-kategori ${selectedCategory !== 'ALL' ? `(${selectedCategory})` : ''}:`}
              </span>
            </div>
            {selectedBrand !== 'ALL' && (
              <button
                onClick={() => setSelectedBrand('ALL')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 underline cursor-pointer"
              >
                Reset ke Semua {selectedCategory === 'Games' ? 'Game' : 'Brand'}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedBrand('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedBrand === 'ALL'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm shadow-amber-400/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              🌟 Semua {selectedCategory === 'Games' ? 'Game' : selectedCategory === 'E-Money' ? 'E-Money' : 'Brand'}
            </button>

            {availableBrands.map(b => {
              const isBrandActive = selectedBrand.toUpperCase() === b.name.toUpperCase();
              const isFreeFire = b.name.toUpperCase().includes('FREE FIRE');
              const isMobileLegends = b.name.toUpperCase().includes('MOBILE LEGEND');

              return (
                <button
                  key={b.name}
                  onClick={() => setSelectedBrand(b.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isBrandActive
                      ? isFreeFire
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold border-amber-400 shadow-md shadow-orange-500/30 ring-2 ring-orange-400/50'
                        : isMobileLegends
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold border-cyan-400 shadow-md shadow-cyan-500/30 ring-2 ring-cyan-400/50'
                        : 'bg-sky-500 text-white font-bold border-sky-400 shadow-md shadow-sky-500/20'
                      : isFreeFire
                      ? 'bg-slate-800/90 text-orange-300 hover:text-white hover:bg-orange-500/20 border-orange-500/30'
                      : isMobileLegends
                      ? 'bg-slate-800/90 text-cyan-300 hover:text-white hover:bg-cyan-500/20 border-cyan-500/30'
                      : 'bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700/60'
                  }`}
                >
                  {getBrandIcon(b.name)}
                  <span>{b.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isBrandActive ? 'bg-black/30 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    {b.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. SEARCH & SMART SORT BAR (URUTKAN HARGA PRODUK) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-7 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Cari produk di ${selectedBrand !== 'ALL' ? selectedBrand : selectedCategory !== 'ALL' ? selectedCategory : 'semua produk'}... (contoh: 70 Diamond, DANA 50rb)`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/60 pl-10 pr-10 py-2.5 rounded-xl text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sort Selector: "Oy urutkan harga produk contoh mobile legends masi berantakan contoh nya" */}
          <div className="md:col-span-5 flex items-center justify-end gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
              <ArrowUpDown size={14} className="text-amber-400" /> Urutkan:
            </span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-xl outline-none focus:border-sky-500 cursor-pointer w-full sm:w-auto"
            >
              <option value="price-asc">💰 Harga: Termurah → Termahal (Rekomendasi)</option>
              <option value="price-desc">💎 Harga: Termahal → Termurah</option>
              <option value="nominal-asc">🔢 Diamond / Nominal: Rendah → Tinggi</option>
              <option value="name-asc">🔤 Nama Produk: A → Z</option>
              <option value="name-desc">🔤 Nama Produk: Z → A</option>
            </select>
          </div>
        </div>

        {/* ACTIVE FILTER STATUS BADGE */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 bg-slate-900/30 px-3 py-2 rounded-xl border border-slate-800/50">
          <div className="flex items-center gap-2">
            <span>Filter Aktif:</span>
            <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
              {selectedCategory === 'ALL' ? 'Semua Kategori' : selectedCategory}
            </span>
            {selectedBrand !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Brand: {selectedBrand}
              </span>
            )}
            <span className="text-slate-400">• Menampilkan <b>{displayedProducts.length}</b> produk</span>
          </div>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <Check size={13} /> Terurut otomatis dari nominal & harga terendah
          </span>
        </div>

        {/* 4. TABEL PRODUK DIGIFLAZZ DENGAN HARGA TERURUT RAPI */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xl">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-800/60">
                <th className="px-5 py-3.5 font-bold">No</th>
                <th className="px-5 py-3.5 font-bold">Brand & Kategori</th>
                <th className="px-5 py-3.5 font-bold">Kode SKU</th>
                <th className="px-5 py-3.5 font-bold">Nama Produk</th>
                <th className="px-5 py-3.5 font-bold text-amber-400">Harga Modal</th>
                <th className="px-5 py-3.5 font-bold text-sky-400">Fee (Biasa)</th>
                <th className="px-5 py-3.5 font-bold text-purple-400">Fee (VIP)</th>
                <th className="px-5 py-3.5 font-bold text-emerald-400">Harga Jual (Owner)</th>
                <th className="px-5 py-3.5 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-sm">
              {displayedProducts.map((p, idx) => {
                const isSaving = savingSku === p.buyer_sku_code;
                const pFee = fees[p.buyer_sku_code] || { biasa: '0', vip: '0', owner: '0' };
                const originalPrice = Number(p.price) || 0;
                const pHargaOwner = hargas[p.buyer_sku_code]?.owner !== undefined ? hargas[p.buyer_sku_code].owner : originalPrice.toString();
                const ownerProfit = Math.max(0, (parseInt(pHargaOwner) || originalPrice) - originalPrice);

                return (
                  <tr key={p.buyer_sku_code} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        {getBrandIcon(p.brand || '')}
                        <span>{p.brand}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{p.category}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sky-400 text-xs">
                      {p.buyer_sku_code}
                    </td>
                    <td className="px-5 py-3.5 text-slate-200">
                      <div className="font-medium text-white">{p.product_name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Status: {p.buyer_product_status ? '🟢 Normal' : '🔴 Gangguan'}</span>
                        {p.desc && <span className="truncate max-w-xs text-slate-400">• {p.desc}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-amber-300 font-mono">
                      Rp {originalPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400">+Rp</span>
                        <input 
                          type="text" 
                          inputMode="numeric" 
                          placeholder="0" 
                          value={pFee.biasa}
                          onChange={e => handleFeeChange(p.buyer_sku_code, 'biasa', e.target.value)}
                          onBlur={() => handleSaveFee(p.buyer_sku_code)}
                          className="w-20 bg-slate-800 border border-slate-700 p-1.5 rounded-lg text-white text-xs font-mono outline-none focus:border-sky-500 transition-all text-right"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400">+Rp</span>
                        <input 
                          type="text" 
                          inputMode="numeric" 
                          placeholder="0" 
                          value={pFee.vip}
                          onChange={e => handleFeeChange(p.buyer_sku_code, 'vip', e.target.value)}
                          onBlur={() => handleSaveFee(p.buyer_sku_code)}
                          className="w-20 bg-slate-800 border border-slate-700 p-1.5 rounded-lg text-white text-xs font-mono outline-none focus:border-purple-500 transition-all text-right"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400">Rp</span>
                          <input 
                            type="text" 
                            inputMode="numeric" 
                            placeholder={originalPrice.toString()} 
                            value={pHargaOwner}
                            onChange={e => handleHargaOwnerChange(p.buyer_sku_code, e.target.value)}
                            onBlur={() => handleSaveFee(p.buyer_sku_code)}
                            className="w-24 bg-slate-800 border border-emerald-500/40 p-1.5 rounded-lg text-emerald-300 font-bold text-xs font-mono outline-none focus:border-emerald-400 transition-all text-right"
                          />
                        </div>
                        {ownerProfit > 0 && (
                          <span className="text-[10px] text-emerald-400 font-mono text-right pr-1">
                            Cuan: +Rp {ownerProfit.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button 
                        onClick={() => handleSaveFee(p.buyer_sku_code)}
                        disabled={isSaving}
                        className="bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/30 hover:border-sky-500 disabled:opacity-50 font-semibold py-1 px-3 rounded-lg cursor-pointer transition-colors text-xs flex items-center gap-1 ml-auto"
                      >
                        {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {displayedProducts.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 text-sm">
                    <p className="font-semibold text-slate-300">Tidak ada produk ditemukan.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba ganti filter brand atau kategori di atas.
                    </p>
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
