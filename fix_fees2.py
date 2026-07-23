import re

with open("server.ts", "r") as f:
    content = f.read()

old_fee_biasa = 'const feeBiasa = productFees[product.buyer_sku_code]?.biasa || 0;'
new_fee_biasa = 'const feeBiasa = productFees[product.buyer_sku_code]?.biasa || productFees[sku.toUpperCase().trim()]?.biasa || productFees[sku.toLowerCase().trim()]?.biasa || 0;'

old_fee_vip = 'const feeVip = productFees[product.buyer_sku_code]?.vip || 0;'
new_fee_vip = 'const feeVip = productFees[product.buyer_sku_code]?.vip || productFees[sku.toUpperCase().trim()]?.vip || productFees[sku.toLowerCase().trim()]?.vip || 0;'

if old_fee_biasa in content:
    content = content.replace(old_fee_biasa, new_fee_biasa)
    content = content.replace(old_fee_vip, new_fee_vip)
    with open("server.ts", "w") as f:
        f.write(content)
    print("Fixed fee lookup 2.")
else:
    print("Could not find fee lookup 2.")
