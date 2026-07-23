import re

with open('src/components/views/KasirFisik.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "setEditId(null);\n        await fetchProducts();",
    "setEditId(null);\n        setIsNewCategory(false);\n        await fetchProducts();"
)

content = content.replace(
    "setEditId(null); setFormData({name:",
    "setEditId(null); setIsNewCategory(false); setFormData({name:"
)

with open('src/components/views/KasirFisik.tsx', 'w') as f:
    f.write(content)
