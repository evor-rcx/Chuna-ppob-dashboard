with open('src/components/views/KasirFisik.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const [products, setProducts] = useState<PhysicalProduct[]>([]);",
    "const [products, setProducts] = useState<PhysicalProduct[]>([]);\n  const [isNewCategory, setIsNewCategory] = useState(false);"
)

with open('src/components/views/KasirFisik.tsx', 'w') as f:
    f.write(content)
