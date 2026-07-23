with open('src/components/views/KasirFisik.tsx', 'r') as f:
    content = f.read()

# Fix handleSaveProduct (line ~228) and Batal button (line ~590)
content = content.replace(
    "buyPriceTotal: product.buyPriceTotal || '', buyQty: product.buyQty || '1', buyUnit: product.buyUnit || 'PAK', itemsPerUnit: product.itemsPerUnit || '1', category: 'Lainnya'",
    "buyPriceTotal: '', buyQty: '1', buyUnit: 'PAK', itemsPerUnit: '1', category: 'Lainnya'"
)

content = content.replace(
    "buyPriceTotal: product.buyPriceTotal || '', buyQty: product.buyQty || '1', buyUnit: product.buyUnit || 'PAK', itemsPerUnit: product.itemsPerUnit || '1'});",
    "buyPriceTotal: '', buyQty: '1', buyUnit: 'PAK', itemsPerUnit: '1'});"
)

with open('src/components/views/KasirFisik.tsx', 'w') as f:
    f.write(content)
