import re

with open('/app/applet/server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

replacement = """                    type: "pasca",
                    product: stateData.product.product_name,
                    sku: stateData.product.buyer_sku_code,
                    target: customerNo,
                    price: total,
                    modal: digiflazzPrice,
                    cuan: cuan > 0 ? cuan : 0,
                    tagihan: stateData.checkResult?.selling_price || 0,
                    admin_pel: stateData.adminFee || 0,"""

text = text.replace('                    type: "pasca",\n                    product: stateData.product.product_name,\n                    sku: stateData.product.buyer_sku_code,\n                    target: customerNo,\n                    price: total,\n                    modal: digiflazzPrice,\n                    cuan: cuan > 0 ? cuan : 0,', replacement)

with open('/app/applet/server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Modified server.ts")
