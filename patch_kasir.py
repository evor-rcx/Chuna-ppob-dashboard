with open('src/components/views/KasirFisik.tsx', 'r') as f:
    content = f.read()

# Replace the setFormData on edit
content = content.replace(
    "buyPriceTotal: '', buyQty: '1', buyUnit: 'PAK', itemsPerUnit: '1'",
    "buyPriceTotal: product.buyPriceTotal || '', buyQty: product.buyQty || '1', buyUnit: product.buyUnit || 'PAK', itemsPerUnit: product.itemsPerUnit || '1'"
)

with open('src/components/views/KasirFisik.tsx', 'w') as f:
    f.write(content)
