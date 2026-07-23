import re

with open('src/components/views/KasirFisik.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "price: product.price.toString(), stock: product.stock.toString(),",
    "price: (product.price || 0).toString(), stock: (product.stock || 0).toString(),"
)

with open('src/components/views/KasirFisik.tsx', 'w') as f:
    f.write(content)
