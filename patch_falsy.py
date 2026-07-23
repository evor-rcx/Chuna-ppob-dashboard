with open('src/components/views/Produk.tsx', 'r') as f:
    code = f.read()

# Fix the render bindings
code = code.replace(
    'const pHargaOwner = hargas[p.buyer_sku_code]?.owner || originalPrice.toString();',
    'const pHargaOwner = hargas[p.buyer_sku_code]?.owner !== undefined ? hargas[p.buyer_sku_code].owner : originalPrice.toString();'
)

# And in handleSaveFee
code = code.replace(
    'const hargaOwnerStr = hargas[sku]?.owner || basePrice.toString();',
    'const hargaOwnerStr = hargas[sku]?.owner !== undefined && hargas[sku]?.owner !== "" ? hargas[sku].owner : basePrice.toString();'
)

# And in handleSaveAll
code = code.replace(
    'const hargaOwnerStr = hargas[sku]?.owner || basePrice.toString();',
    'const hargaOwnerStr = hargas[sku]?.owner !== undefined && hargas[sku]?.owner !== "" ? hargas[sku].owner : basePrice.toString();'
)

with open('src/components/views/Produk.tsx', 'w') as f:
    f.write(code)

print("Patched falsy values")
