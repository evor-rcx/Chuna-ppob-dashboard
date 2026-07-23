with open('src/components/views/KasirFisik.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "buyPriceTotal: product.buyPriceTotal || '', buyQty: product.buyQty || '1', buyUnit: product.buyUnit || 'PAK', itemsPerUnit: product.itemsPerUnit || '1'",
    "buyPriceTotal: product.buyPriceTotal ? product.buyPriceTotal.toString() : '', buyQty: product.buyQty ? product.buyQty.toString() : '1', buyUnit: product.buyUnit || 'PAK', itemsPerUnit: product.itemsPerUnit ? product.itemsPerUnit.toString() : '1'"
)

with open('src/components/views/KasirFisik.tsx', 'w') as f:
    f.write(content)
