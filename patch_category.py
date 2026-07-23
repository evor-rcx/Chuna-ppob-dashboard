with open('src/components/views/KasirFisik.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const categories = ['Semua', ...Array.from(new Set(['Makanan', 'Minuman', 'Bensin', 'Sembako', 'Rokok', 'Lainnya', ...products.map(p => p.category || 'Lainnya')]))];",
    "const categories = ['Semua', ...Array.from(new Set(['Makanan', 'Minuman', 'Bensin', 'Sembako', 'Rokok', 'Lainnya', ...products.map(p => (p.category || 'Lainnya').trim())]))];"
)

content = content.replace(
    "const matchCategory = activeCategory === 'Semua' || (p.category || 'Lainnya') === activeCategory;",
    "const matchCategory = activeCategory === 'Semua' || (p.category || 'Lainnya').trim() === activeCategory.trim();"
)

with open('src/components/views/KasirFisik.tsx', 'w') as f:
    f.write(content)
