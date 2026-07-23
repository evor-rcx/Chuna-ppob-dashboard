with open('src/components/views/KasirFisik.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "name: product.name, price:",
    "name: product.name || '', price:"
)

content = content.replace(
    "category: product.category || 'Lainnya',",
    "category: (product.category || 'Lainnya').trim(),"
)

with open('src/components/views/KasirFisik.tsx', 'w') as f:
    f.write(content)
