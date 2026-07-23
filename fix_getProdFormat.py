import re

with open("server.ts", "r") as f:
    content = f.read()

content = content.replace("productFees[p.buyer_sku_code]?.biasa || getProductFee(sku).biasa", "getProductFee(sku).biasa")
content = content.replace("productFees[p.buyer_sku_code]?.vip || getProductFee(sku).vip", "getProductFee(sku).vip")

with open("server.ts", "w") as f:
    f.write(content)
print("Fixed getProdFormat.")
