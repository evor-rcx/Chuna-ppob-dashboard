import re

with open('src/components/views/Produk.tsx', 'r') as f:
    code = f.read()

# Replace the input fields to add onBlur
code = code.replace(
    """onChange={e => handleFeeChange(p.buyer_sku_code, 'biasa', e.target.value)}""",
    """onChange={e => handleFeeChange(p.buyer_sku_code, 'biasa', e.target.value)}\n                      onBlur={() => handleSaveFee(p.buyer_sku_code)}"""
)

code = code.replace(
    """onChange={e => handleFeeChange(p.buyer_sku_code, 'vip', e.target.value)}""",
    """onChange={e => handleFeeChange(p.buyer_sku_code, 'vip', e.target.value)}\n                      onBlur={() => handleSaveFee(p.buyer_sku_code)}"""
)

code = code.replace(
    """onChange={e => handleHargaOwnerChange(p.buyer_sku_code, e.target.value)}""",
    """onChange={e => handleHargaOwnerChange(p.buyer_sku_code, e.target.value)}\n                      onBlur={() => handleSaveFee(p.buyer_sku_code)}"""
)

with open('src/components/views/Produk.tsx', 'w') as f:
    f.write(code)

print("Added onBlur")
