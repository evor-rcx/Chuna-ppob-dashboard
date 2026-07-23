import re

with open('src/components/views/KasirFisik.tsx', 'r') as f:
    content = f.read()

# find the exact category input to replace
pattern = r'<div className="flex flex-col">.*?<datalist id="category-options">.*?</datalist>\s*</div>'

# find products
products_pattern = r'const \[products, setProducts\] = useState<any\[\]>\(\[\]\);'
content = re.sub(
    products_pattern,
    r'const [products, setProducts] = useState<any[]>([]);\n  const [isNewCategory, setIsNewCategory] = useState(false);',
    content
)

replacement = """{isNewCategory ? (
                            <div className="flex gap-2">
                                <input type="text" autoFocus value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" placeholder="Ketik kategori baru..." />
                                <button type="button" onClick={() => { setIsNewCategory(false); setFormData({...formData, category: 'Lainnya'}); }} className="px-4 py-3 bg-slate-700 text-white rounded-lg">Batal</button>
                            </div>
                        ) : (
                            <select value={formData.category} onChange={e => {
                                if (e.target.value === '__NEW__') {
                                    setIsNewCategory(true);
                                    setFormData({...formData, category: ''});
                                } else {
                                    setFormData({...formData, category: e.target.value});
                                }
                            }} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white">
                                {Array.from(new Set(['Makanan', 'Minuman', 'Bensin', 'Sembako', 'Rokok', 'Obat', 'Lainnya', ...products.map(p => p.category).filter(Boolean)])).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                                <option value="__NEW__">+ Tambah Kategori Baru...</option>
                            </select>
                        )}"""

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/components/views/KasirFisik.tsx', 'w') as f:
    f.write(content)
