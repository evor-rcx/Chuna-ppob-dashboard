const fs = require('fs');
let code = fs.readFileSync('src/components/views/Produk.tsx', 'utf8');

code = code.replace(
    /const filteredProducts = products\.filter\(\(p\) => \{[\s\S]*?\}\);/g,
    `const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.product_name && p.product_name.toLowerCase()?.includes(q)) ||
      (p.brand && p.brand.toLowerCase()?.includes(q)) ||
      (p.buyer_sku_code && p.buyer_sku_code.toLowerCase()?.includes(q))
    );
  }).sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));`
);

fs.writeFileSync('src/components/views/Produk.tsx', code);
