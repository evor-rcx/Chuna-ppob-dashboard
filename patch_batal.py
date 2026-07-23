with open('src/components/views/KasirFisik.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "setFormData({name: '', price: '', stock: '', buyPrice: '', unit: 'pcs', buyPriceTotal: '', buyQty: '1', buyUnit: 'PAK', itemsPerUnit: '1'});",
    "setFormData({name: '', price: '', stock: '', buyPrice: '', unit: 'pcs', buyPriceTotal: '', buyQty: '1', buyUnit: 'PAK', itemsPerUnit: '1', category: 'Lainnya', promo: 'none', cupPrice: ''});"
)

with open('src/components/views/KasirFisik.tsx', 'w') as f:
    f.write(content)
