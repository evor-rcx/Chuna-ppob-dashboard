import re

with open("server.ts", "r") as f:
    content = f.read()

replacements = [
    ('productFees[sku]?.biasa || 0', 'getProductFee(sku).biasa'),
    ('productFees[sku]?.vip || 0', 'getProductFee(sku).vip'),
    ('productFees[p.buyer_sku_code]?.biasa || productFees[sku]?.biasa || 0', 'getProductFee(p.buyer_sku_code).biasa'),
    ('productFees[p.buyer_sku_code]?.vip || productFees[sku]?.vip || 0', 'getProductFee(p.buyer_sku_code).vip'),
    ('productFees[product.buyer_sku_code]?.biasa || productFees[sku.toUpperCase().trim()]?.biasa || productFees[sku.toLowerCase().trim()]?.biasa || 0', 'getProductFee(product.buyer_sku_code).biasa'),
    ('productFees[product.buyer_sku_code]?.vip || productFees[sku.toUpperCase().trim()]?.vip || productFees[sku.toLowerCase().trim()]?.vip || 0', 'getProductFee(product.buyer_sku_code).vip'),
    ('productFees[p.buyer_sku_code]?.biasa || 0', 'getProductFee(p.buyer_sku_code).biasa'),
    ('productFees[p.buyer_sku_code]?.vip || 0', 'getProductFee(p.buyer_sku_code).vip'),
    ('productFees[p.buyer_sku_code]?.owner || 0', 'getProductFee(p.buyer_sku_code).owner'),
    ('productFees[product.buyer_sku_code]?.owner || 0', 'getProductFee(product.buyer_sku_code).owner'),
    ('productFees[product.buyer_sku_code]?.vip || 0', 'getProductFee(product.buyer_sku_code).vip'),
    ('productFees[product.buyer_sku_code]?.biasa || 0', 'getProductFee(product.buyer_sku_code).biasa'),
    ('productFees[matchedProduct.buyer_sku_code]?.owner || 0', 'getProductFee(matchedProduct.buyer_sku_code).owner'),
    ('productFees[matchedProduct.buyer_sku_code]?.vip || 0', 'getProductFee(matchedProduct.buyer_sku_code).vip'),
    ('productFees[matchedProduct.buyer_sku_code]?.biasa || 0', 'getProductFee(matchedProduct.buyer_sku_code).biasa'),
]

for old, new in replacements:
    content = content.replace(old, new)

with open("server.ts", "w") as f:
    f.write(content)
print("Fixed all fee usages.")
