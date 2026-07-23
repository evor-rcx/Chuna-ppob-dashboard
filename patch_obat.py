with open('src/components/views/KasirFisik.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const categories = ['Semua', ...Array.from(new Set(['Makanan', 'Minuman', 'Bensin', 'Sembako', 'Rokok', 'Lainnya', ...products.map(p => (p.category || 'Lainnya').trim())]))];",
    "const categories = ['Semua', ...Array.from(new Set(['Makanan', 'Minuman', 'Bensin', 'Sembako', 'Rokok', 'Obat', 'Lainnya', ...products.map(p => (p.category || 'Lainnya').trim())]))];"
)

with open('src/components/views/KasirFisik.tsx', 'w') as f:
    f.write(content)
