import React from "react";
import { useState, useEffect } from 'react';
import { printPhysicalReceiptBluetooth } from '../../utils/printReceipt';
import { PageContainer } from '../PageContainer';
import { ShoppingCart, Plus, Minus, Trash2, Search, Package, PlusCircle, Edit, DollarSign } from 'lucide-react';

interface PhysicalProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  buyPrice: number;
  unit: string;
  category?: string;
  promo?: string;
  cupPrice?: number;
}

interface CartItem extends PhysicalProduct {
  quantity: number;
  withCup?: boolean;
  cartId?: string;
}

export function KasirFisik({ onBack }: { onBack: () => void }) {
  const [products, setProducts] = useState<PhysicalProduct[]>([]);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'kasir'|'stok'|'riwayat'|'utang'>('kasir');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [transactions, setTransactions] = useState<any[]>([]);

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutMethod, setCheckoutMethod] = useState<'cash'|'utang'>('cash');
  const [checkoutCustomer, setCheckoutCustomer] = useState('');
  const [checkoutCashAmount, setCheckoutCashAmount] = useState('');
  const [checkoutShouldPrint, setCheckoutShouldPrint] = useState(false);
  
  // Pay Partial State
  const [payModalTx, setPayModalTx] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  
  // Manage Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', buyPrice: '', unit: 'pcs', buyPriceTotal: '', buyQty: '1', buyUnit: 'PAK', itemsPerUnit: '1', category: 'Lainnya', promo: 'none', cupPrice: '' });
  
  const [stats, setStats] = useState({ totalModalKeseluruhan: 0, totalNilaiStok: 0, totalPendapatan: 0, totalKeuntungan: 0, modalTerjual: 0, totalPengeluaran: 0, totalPiutang: 0 });
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');



  const calculateItemTotal = (item: CartItem) => {
      const activePrice = item.withCup && item.cupPrice ? item.cupPrice : item.price;
      if (item.promo === 'b2g1') {
          const freeCount = Math.floor(item.quantity / 3);
          const paidCount = item.quantity - freeCount;
          return paidCount * activePrice;
      }
      return item.quantity * activePrice;
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/physical-transactions');
      if (res.ok) setTransactions(await res.json());
    } catch(e) {}
  };
  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) setExpenses(await res.json());
    } catch(e) {}
  };

  
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/physical-stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch(e) {}
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/physical-products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(); fetchStats(); fetchExpenses(); fetchTransactions();
  }, []);

  const addToCart = (product: PhysicalProduct) => {
    if (product.stock <= 0) {
      alert('Stok habis!');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('Maksimal stok tercapai!');
          return prev;
        }
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        if (newQ > item.stock) {
            alert('Maksimal stok tercapai!');
            return item;
        }
        if (newQ <= 0) return { ...item, quantity: 0 };
        return { ...item, quantity: newQ };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const openCheckoutModal = (shouldPrint: boolean) => {
    if (cart.length === 0) return;
    setCheckoutShouldPrint(shouldPrint);
    setCheckoutMethod('cash');
    setCheckoutCustomer('');
    setCheckoutCashAmount('');
    setShowCheckoutModal(true);
  };

  const processCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    
    let method = checkoutMethod;
    let customer = checkoutCustomer.trim();
    
    if (method === 'utang' && !customer) {
        alert('Untuk utang, nama pembeli wajib diisi!');
        return;
    }
    
    if (method === 'cash') {
        const cashAmountNum = parseInt(checkoutCashAmount.replace(/\D/g, '')) || 0;
        if (cashAmountNum < total) {
            alert('Uang yang dibayar kurang dari total belanja!');
            return;
        }
    }
    
    if (!customer) customer = 'Umum';

    setLoading(true);
    try {
      const res = await fetch('/api/physical-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          total,
          method,
          customer
        })
      });

      if (res.ok) {
        const resData = await res.json();
        alert('Transaksi berhasil dicatat!');
        if (checkoutShouldPrint) {
            printPhysicalReceiptBluetooth(resData);
        }
        setShowCheckoutModal(false);
        setCart([]);
        fetchProducts(); fetchStats(); fetchExpenses(); fetchTransactions(); // Refresh stock
      } else {
        alert('Gagal mencatat transaksi.');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editId ? `/api/physical-products/${editId}` : '/api/physical-products';
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setFormData({ name: '', price: '', stock: '', buyPrice: '', unit: 'pcs', buyPriceTotal: '', buyQty: '1', buyUnit: 'PAK', itemsPerUnit: '1', category: 'Lainnya', promo: 'none', cupPrice: '' });
        setEditId(null);
        setIsNewCategory(false);
        await fetchProducts(); fetchStats(); fetchExpenses(); fetchTransactions();
      } else {
        alert("Gagal menyimpan produk. Coba lagi.");
      }
    } catch(e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };
  

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: expenseName, amount: expenseAmount })
      });
      if (res.ok) {
        setExpenseName('');
        setExpenseAmount('');
        fetchExpenses();
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Hapus pengeluaran ini?')) return;
    setLoading(true);
    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      fetchExpenses();
      fetchStats();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
      if (!confirm('Hapus produk ini?')) return;
      setLoading(true);
      try {
          await fetch(`/api/physical-products/${id}`, { method: 'DELETE' });
          await fetchProducts(); fetchStats(); fetchExpenses(); fetchTransactions();
      } catch(e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handlePayUtang = async (id: string) => {
    if (!confirm('Tandai transaksi ini sudah lunas?')) return;
    try {
      const res = await fetch(`/api/physical-transactions/${id}/pay`, { method: 'PUT' });
      if (res.ok) {
        await fetchTransactions();
        await fetchStats();
      }
    } catch(e) {}
  };

  const categories = ['Semua', ...Array.from(new Set(['Makanan', 'Minuman', 'Bensin', 'Sembako', 'Rokok', 'Obat', 'Lainnya', ...products.map(p => (p.category || 'Lainnya').trim())]))];
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'Semua' || (p.category || 'Lainnya').trim() === activeCategory.trim();
    return matchSearch && matchCategory;
  });
  const total = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  
  const utangCustomers = Array.from(new Set(transactions.filter(t => t.method === 'utang' && t.customer !== 'Umum').map(t => t.customer)));

  return (
    <PageContainer title="Kasir Jualan Fisik" onBack={onBack}>
      <div className="flex gap-2 sm:gap-4 mb-6 overflow-x-auto pb-2">
          <button 
            onClick={() => setActiveTab('kasir')}
            className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'kasir' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Kasir POS
          </button>
          <button 
            onClick={() => setActiveTab('stok')}
            className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'stok' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Kelola Stok Fisik
          </button>
          <button 
            onClick={() => setActiveTab('riwayat')}
            className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'riwayat' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Riwayat Transaksi
          </button>
          <button 
            onClick={() => setActiveTab('utang')}
            className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'utang' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Daftar Utang
          </button>
      </div>

      {activeTab === 'kasir' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari produk fisik..."
                  value={search || ''}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`bg-slate-800 border border-slate-700 rounded-xl p-4 text-left hover:border-blue-500 transition-colors cursor-pointer flex flex-col justify-between ${product.stock <= 0 ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div>
                      <h3 className="font-medium text-white mb-1 line-clamp-2">{product.name}</h3>
                      <div className="text-blue-400 font-semibold mb-2 flex justify-between items-center">
                        <span>Rp {product.price.toLocaleString('id-ID')}</span>
                        {product.promo === 'b2g1' && <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30">Beli 2 Gratis 1</span>}
                      </div>
                      <div className="flex items-center text-xs text-slate-400 mb-3">
                        <Package size={12} className="mr-1" /> Stok: {product.stock} {product.unit || 'pcs'}
                      </div>
                  </div>
                  {product.cupPrice && product.cupPrice > 0 && (
                      <button 
                         onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                         className="w-full bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs py-1.5 rounded-lg transition-colors border border-blue-500/30"
                      >
                         + Pakai Gelas (Rp {product.cupPrice.toLocaleString('id-ID')})
                      </button>
                  )}
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && (
                <div className="text-center text-slate-400 py-10">
                    Produk tidak ditemukan.
                </div>
            )}
          </div>

          {/* Cart */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl flex flex-col h-[calc(100vh-200px)] lg:h-[600px]">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <ShoppingCart size={20} />
                Keranjang
              </h3>
              <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full font-medium">
                {cart.length} Item
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-slate-500 h-full flex items-center justify-center">
                  Keranjang kosong
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-800/80 p-3 rounded-lg border border-slate-700/50">
                    <div>
                      <div className="text-sm font-medium text-white">{item.name}</div>
                      <div className="text-xs text-slate-400">Rp {item.price.toLocaleString('id-ID')}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-lg text-slate-300 hover:text-white">
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-lg text-slate-300 hover:text-white">
                        <Plus size={14} />
                      </button>
                      <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-400/10 rounded-lg ml-1">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-700 bg-slate-800/80">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400">Total Pembayaran</span>
                <span className="text-xl font-bold text-white">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex gap-2">
                  <button
                    onClick={() => openCheckoutModal(false)}
                    disabled={cart.length === 0 || loading}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                  >
                    {loading ? 'Memproses...' : 'Simpan Transaksi'}
                  </button>
                  <button
                    onClick={() => openCheckoutModal(true)}
                    disabled={cart.length === 0 || loading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    🖨️ Cetak & Simpan
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stok' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                    {editId ? 'Edit Produk' : 'Tambah Produk Baru'}
                </h3>
                <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nama Produk</label>
                        <input type="text" id="edit-form-focus" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" placeholder="Contoh: Bensin, Snack Uang" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Kategori</label>
                        {isNewCategory ? (
                            <div className="flex gap-2">
                                <input type="text" autoFocus value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" placeholder="Ketik kategori baru..." />
                                <button type="button" onClick={() => { setIsNewCategory(false); setFormData({...formData, category: 'Lainnya'}); }} className="px-4 py-3 bg-slate-700 text-white rounded-lg">Batal</button>
                            </div>
                        ) : (
                            <select value={formData.category || ''} onChange={e => {
                                if (e.target.value === '__NEW__') {
                                    setIsNewCategory(true);
                                    setFormData({...formData, category: ''});
                                } else {
                                    setFormData({...formData, category: e.target.value});
                                }
                            }} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white appearance-auto cursor-pointer relative z-10">
                                {Array.from(new Set(['Makanan', 'Minuman', 'Bensin', 'Sembako', 'Rokok', 'Obat', 'Lainnya', ...products.map(p => p.category).filter(Boolean)])).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                                <option value="__NEW__">+ Tambah Kategori Baru...</option>
                            </select>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Harga Pakai Gelas (Opsional)</label>
                        <input type="number" value={formData.cupPrice || ''} onChange={e => setFormData({...formData, cupPrice: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" placeholder="Contoh: 5000" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Promo Khusus</label>
                        <select value={formData.promo || 'none'} onChange={e => setFormData({...formData, promo: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white appearance-auto cursor-pointer relative z-10">
                            <option value="none">Tidak ada promo</option>
                            <option value="b2g1">Beli 2 Gratis 1</option>
                        </select>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl space-y-4">
                        <h4 className="text-sm font-medium text-slate-300">Data Pembelian (Grosir/Paketan)</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Total Modal Belanja (Rp)</label>
                                <input type="number" required value={formData.buyPriceTotal || ''} onChange={e => {
                                    const val = e.target.value;
                                    const qty = Number(formData.buyQty) || 1;
                                    const items = Number(formData.itemsPerUnit) || 1;
                                    const totalItems = qty * items;
                                    const unitPrice = val ? Math.round(Number(val) / totalItems) : '';
                                    setFormData({...formData, buyPriceTotal: val, buyPrice: unitPrice.toString(), stock: totalItems.toString()});
                                }} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white" placeholder="Ex: 10000" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Belanja Berapa?</label>
                                <div className="flex gap-2">
                                    <input type="number" required value={formData.buyQty || ''} onChange={e => {
                                        const qty = e.target.value;
                                        const items = Number(formData.itemsPerUnit) || 1;
                                        const totalItems = (Number(qty) || 1) * items;
                                        const unitPrice = formData.buyPriceTotal ? Math.round(Number(formData.buyPriceTotal) / totalItems) : formData.buyPrice;
                                        setFormData({...formData, buyQty: qty, buyPrice: unitPrice.toString(), stock: totalItems.toString()});
                                    }} className="w-16 bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-center" placeholder="3" />
                                    <input type="text" value={formData.buyUnit || ''} onChange={e => setFormData({...formData, buyUnit: e.target.value})} className="flex-1 min-w-0 bg-slate-800 border border-slate-600 rounded-lg p-2 text-white" placeholder="RTG / PAK" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">1 {formData.buyUnit || 'PAK'} isinya berapa?</label>
                                <input type="number" required value={formData.itemsPerUnit || ''} onChange={e => {
                                    const items = e.target.value;
                                    const qty = Number(formData.buyQty) || 1;
                                    const totalItems = qty * (Number(items) || 1);
                                    const unitPrice = formData.buyPriceTotal ? Math.round(Number(formData.buyPriceTotal) / totalItems) : formData.buyPrice;
                                    setFormData({...formData, itemsPerUnit: items, buyPrice: unitPrice.toString(), stock: totalItems.toString()});
                                }} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white" placeholder="Ex: 10 / 24" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Satuan Eceran (Hasil Pecahan)</label>
                                <input type="text" required value={formData.unit || ''} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white" placeholder="Ex: pcs, botol" />
                            </div>
                        </div>
                        
                        <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-lg flex justify-between items-center text-sm">
                            <span className="text-blue-300">Total Stok Masuk:</span>
                            <span className="font-bold text-white">{(Number(formData.buyQty) || 1) * (Number(formData.itemsPerUnit) || 1)} {formData.unit || 'pcs'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Harga Jual per {formData.unit || 'Satuan'}</label>
                            <input type="number" required value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" placeholder="Contoh: 2000" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Modal per {formData.unit || 'Satuan'}</label>
                            <input type="number" readOnly value={formData.buyPrice || ''} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-400 cursor-not-allowed" placeholder="Otomatis dihitung" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Stok Tersedia Saat Ini (Total {formData.unit || 'Satuan'})</label>
                        <input type="number" required value={formData.stock || ''} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" placeholder="Contoh: 10" />
                    </div>

                    <div className="pt-2 flex gap-2">
                        {editId && (
                            <button type="button" onClick={() => { setEditId(null); setIsNewCategory(false); setFormData({name: '', price: '', stock: '', buyPrice: '', unit: 'pcs', buyPriceTotal: '', buyQty: '1', buyUnit: 'PAK', itemsPerUnit: '1', category: 'Lainnya', promo: 'none', cupPrice: ''}); }} className="flex-1 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors">
                                Batal
                            </button>
                        )}
                        <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors disabled:opacity-50">
                            {loading ? 'Menyimpan...' : 'Simpan Produk'}
                        </button>
                    </div>
                </form>
            </div>
            
            <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex justify-between items-center">
                    <span>Daftar Stok Produk Fisik</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Modal Awal Keseluruhan</div>
                        <div className="text-lg font-bold text-slate-300">Rp {(stats.totalModalKeseluruhan || 0).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Nilai Stok Sisa (Uang Mati)</div>
                        <div className="text-lg font-bold text-yellow-400">Rp {(stats.totalNilaiStok || 0).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Total Penjualan Masuk</div>
                        <div className="text-lg font-bold text-blue-400">Rp {(stats.totalPendapatan || 0).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Pengeluaran Lain</div>
                        <div className="text-lg font-bold text-red-400">Rp {(stats.totalPengeluaran || 0).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                        <div className="text-xs text-slate-400 mb-1">Piutang (Belum Lunas)</div>
                        <div className="text-lg font-bold text-orange-400">Rp {(stats.totalPiutang || 0).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 col-span-2 sm:col-span-1">
                        <div className="text-xs text-slate-400 mb-1">Laba Bersih Akhir</div>
                        <div className={`text-lg font-bold ${stats.totalKeuntungan < 0 ? 'text-red-400' : 'text-green-400'}`}>Rp {(stats.totalKeuntungan || 0).toLocaleString('id-ID')}</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="p-3 text-sm font-medium text-slate-400">Nama Produk</th>
                                <th className="p-3 text-sm font-medium text-slate-400">Harga Jual</th>
                                <th className="p-3 text-sm font-medium text-slate-400">Modal</th>
                                <th className="p-3 text-sm font-medium text-slate-400">Stok</th>
                                <th className="p-3 text-sm font-medium text-slate-400 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                        Belum ada data produk fisik.
                                    </td>
                                </tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                                        <td className="p-3 text-sm font-medium text-white">{product.name}</td>
                                        <td className="p-3 text-sm text-slate-300">Rp {product.price.toLocaleString('id-ID')}</td>
                                        <td className="p-3 text-sm text-slate-300">Rp {(product.buyPrice || 0).toLocaleString('id-ID')}</td>
                                        <td className="p-3 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${product.stock <= 5 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                {product.stock} {product.unit || 'pcs'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-right space-x-2">
                                            <button type="button" onClick={() => {
                                                setEditId(product.id);
                                                setFormData({ name: product.name || '', price: (product.price || 0).toString(), stock: (product.stock || 0).toString(), buyPrice: (product.buyPrice || 0).toString(), unit: product.unit || 'pcs', buyPriceTotal: product.buyPriceTotal ? product.buyPriceTotal.toString() : '', buyQty: product.buyQty ? product.buyQty.toString() : '1', buyUnit: product.buyUnit || 'PAK', itemsPerUnit: product.itemsPerUnit ? product.itemsPerUnit.toString() : '1', category: (product.category || 'Lainnya').trim(), promo: product.promo || 'none', cupPrice: (product.cupPrice || '').toString() });
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                setTimeout(() => {
                                                    document.getElementById('edit-form-focus')?.focus();
                                                }, 100);
                                            }} className="p-2 bg-slate-700 hover:bg-blue-600 rounded-lg text-slate-300 hover:text-white transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button type="button" onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-slate-700 hover:bg-red-600 rounded-lg text-slate-300 hover:text-white transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-8 border-t border-slate-700 pt-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Pengeluaran Tambahan (Plastik Es, Bahan Lain)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                            <form onSubmit={handleSaveExpense} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Nama Pengeluaran</label>
                                    <input type="text" required value={expenseName || ''} onChange={e => setExpenseName(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white" placeholder="Ex: Plastik Es Batu" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Total Biaya (Rp)</label>
                                    <input type="number" required value={expenseAmount || ''} onChange={e => setExpenseAmount(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white" placeholder="Ex: 5000" />
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                                    Catat Pengeluaran
                                </button>
                            </form>
                        </div>
                        <div className="md:col-span-2">
                            <div className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-700 bg-slate-800/50">
                                            <th className="p-3 text-sm font-medium text-slate-400">Tanggal</th>
                                            <th className="p-3 text-sm font-medium text-slate-400">Nama Pengeluaran</th>
                                            <th className="p-3 text-sm font-medium text-slate-400">Biaya</th>
                                            <th className="p-3 text-sm font-medium text-slate-400 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenses.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-center text-slate-500 text-sm">Belum ada pengeluaran tambahan tercatat.</td>
                                            </tr>
                                        ) : (
                                            expenses.map(exp => (
                                                <tr key={exp.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                                                    <td className="p-3 text-sm text-slate-400">{new Date(exp.date).toLocaleDateString('id-ID')}</td>
                                                    <td className="p-3 text-sm text-white">{exp.name}</td>
                                                    <td className="p-3 text-sm text-red-400">-Rp {exp.amount.toLocaleString('id-ID')}</td>
                                                    <td className="p-3 text-sm text-right">
                                                        <button type="button" onClick={() => handleDeleteExpense(exp.id)} className="p-1.5 bg-slate-800 hover:bg-red-600 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      )}
      {activeTab === 'riwayat' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800/50 bg-slate-800/20">
                  <th className="px-6 py-3 font-semibold">Tanggal</th>
                  <th className="px-6 py-3 font-semibold">Pembeli</th>
                  <th className="px-6 py-3 font-semibold">Item Pembelian</th>
                  <th className="px-6 py-3 font-semibold">Metode</th>

                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      Belum ada transaksi fisik
                    </td>
                  </tr>
                ) : (
                  transactions.slice().reverse().map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-300">{new Date(t.date).toLocaleDateString('id-ID')}</div>
                        <div className="text-xs text-slate-500">{new Date(t.date).toLocaleTimeString('id-ID')}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-300">{t.customer || 'Umum'}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        <ul className="list-disc list-inside">
                          {t.items?.map((item: any, i: number) => (
                            <li key={i}>{item.quantity}x {item.name}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${t.method === 'utang' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-400'}`}>
                          {t.method?.toUpperCase() || 'CASH'}
                        </span>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md my-auto flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold text-white">Proses Pembayaran</h3>
                <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                <form id="checkout-form" onSubmit={processCheckout} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Metode Pembayaran</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                type="button" 
                                onClick={() => setCheckoutMethod('cash')}
                                className={`py-3 px-4 rounded-xl font-medium transition-colors border ${checkoutMethod === 'cash' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                            >
                                💵 Cash Tunai
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setCheckoutMethod('utang')}
                                className={`py-3 px-4 rounded-xl font-medium transition-colors border ${checkoutMethod === 'utang' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                            >
                                📝 Utang
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                            Nama Pelanggan {checkoutMethod === 'cash' ? '(Opsional)' : '(Wajib)'}
                        </label>
                        <input 
                            type="text" 
                            required={checkoutMethod === 'utang'}
                            value={checkoutCustomer || ''} 
                            onChange={e => setCheckoutCustomer(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder="Masukkan nama pelanggan"
                        />
                        {checkoutMethod === 'utang' && utangCustomers.length > 0 && (
                            <div className="mt-2">
                                <p className="text-xs text-slate-500 mb-2">Pilih dari pelanggan utang sebelumnya:</p>
                                <div className="flex flex-wrap gap-2">
                                    {utangCustomers.map((c: any) => (
                                        <button 
                                            key={c}
                                            type="button"
                                            onClick={() => setCheckoutCustomer(c)}
                                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs transition-colors"
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {checkoutMethod === 'cash' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Uang Dibayar</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-slate-500">Rp</span>
                                </div>
                                <input 
                                    type="text" 
                                    inputMode="numeric"
                                    required={checkoutMethod === 'cash'}
                                    value={checkoutCashAmount || ''} 
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setCheckoutCashAmount(val ? parseInt(val).toLocaleString('id-ID') : '');
                                    }}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 p-3 text-white font-bold text-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                            
                            {(() => {
                                const dibayarNum = parseInt(checkoutCashAmount.replace(/\D/g, '')) || 0;
                                if (dibayarNum > 0) {
                                    if (dibayarNum < total) {
                                        return <p className="text-sm text-red-400 mt-2">Kurang: Rp {(total - dibayarNum).toLocaleString('id-ID')}</p>;
                                    } else {
                                        return <p className="text-sm text-green-400 mt-2">Kembalian: Rp {(dibayarNum - total).toLocaleString('id-ID')}</p>;
                                    }
                                }
                                return null;
                            })()}
                        </div>
                    )}
                    
                    <div className="pt-4 border-t border-slate-800">
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-400">Total Tagihan</span>
                            <span className="text-xl font-bold text-white">Rp {total.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </form>
            </div>
            
            <div className="p-6 border-t border-slate-800 shrink-0">
                <button 
                    form="checkout-form"
                    type="submit" 
                    disabled={loading || (checkoutMethod === 'cash' && (parseInt(checkoutCashAmount.replace(/\D/g, '')) || 0) < total)}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-900/20 text-lg"
                >
                    {loading ? 'Memproses...' : (checkoutShouldPrint ? '🖨️ Simpan & Cetak' : '✅ Simpan Transaksi')}
                </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'utang' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-800/80">
            <h3 className="text-lg font-semibold text-white">Daftar Piutang Pelanggan</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800/50 bg-slate-800/20">
                  <th className="px-6 py-3 font-semibold">Tanggal</th>
                  <th className="px-6 py-3 font-semibold">Pembeli</th>
                  <th className="px-6 py-3 font-semibold">Total Tagihan</th>
                  <th className="px-6 py-3 font-semibold">Telah Dibayar</th>
                  <th className="px-6 py-3 font-semibold">Sisa Tagihan</th>
                  <th className="px-6 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {transactions.filter(t => t.method === 'utang').length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Tidak ada data utang yang belum lunas.
                    </td>
                  </tr>
                ) : (
                  transactions.filter(t => t.method === 'utang').map((t: any) => {
                    const sisa = t.total - (t.paidAmount || 0);
                    return (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-300">{new Date(t.date).toLocaleDateString('id-ID')}</div>
                        <div className="text-xs text-slate-500">{new Date(t.date).toLocaleTimeString('id-ID')}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{t.customer}</td>
                      <td className="px-6 py-4 text-slate-300">Rp {t.total.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-green-400">Rp {(t.paidAmount || 0).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 font-bold text-yellow-400">Rp {sisa.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => { setPayModalTx(t); setPayAmount(sisa.toString()); }} 
                            className="px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white rounded-lg text-sm transition-colors border border-yellow-600/50 hover:border-yellow-600"
                          >
                            Cicil / Bayar
                          </button>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {payModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md my-auto flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Bayar / Cicil Utang</h3>
                <button onClick={() => setPayModalTx(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Pembeli</p>
                  <p className="text-lg font-bold text-white">{payModalTx.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Item Dibeli</p>
                  <ul className="list-disc list-inside text-slate-300 text-sm mt-1">
                    {payModalTx.items?.map((item: any, i: number) => (
                      <li key={i}>{item.quantity}x {item.name}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-between items-center bg-slate-800 p-3 rounded-lg">
                  <div>
                    <p className="text-xs text-slate-400">Total Utang</p>
                    <p className="text-sm font-semibold text-white">Rp {payModalTx.total.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Sisa Tagihan</p>
                    <p className="text-sm font-bold text-yellow-400">Rp {(payModalTx.total - (payModalTx.paidAmount || 0)).toLocaleString('id-ID')}</p>
                  </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Nominal Pembayaran (Angsuran)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-500">Rp</span>
                        </div>
                        <input 
                            type="text" 
                            inputMode="numeric"
                            value={payAmount || ''} 
                            onChange={e => {
                                const val = e.target.value.replace(/\D/g, '');
                                setPayAmount(val ? parseInt(val).toLocaleString('id-ID') : '');
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 p-3 text-white font-bold text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>
            
            <div className="p-6 border-t border-slate-800 flex gap-3">
                <button 
                    onClick={async () => {
                        const amount = parseInt(payAmount.replace(/\D/g, '')) || 0;
                        const sisa = payModalTx.total - (payModalTx.paidAmount || 0);
                        if (amount <= 0) {
                            alert("Masukkan nominal pembayaran");
                            return;
                        }
                        if (amount > sisa) {
                            alert("Nominal pembayaran melebihi sisa tagihan!");
                            return;
                        }
                        try {
                            const res = await fetch(`/api/physical-transactions/${payModalTx.id}/pay`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ amount })
                            });
                            if (res.ok) {
                                setPayModalTx(null);
                                setPayAmount('');
                                fetchTransactions();
                                fetchStats();
                            }
                        } catch (e) {}
                    }}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
                >
                    Simpan Pembayaran
                </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
