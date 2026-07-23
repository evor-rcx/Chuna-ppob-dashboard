import re

with open("server.ts", "r") as f:
    content = f.read()

content = content.replace("const skus = Object.keys(productFees).filter(k => k !== '0');", "const skus = Object.keys(productFees).filter(k => k !== '0').map(k => k.toLowerCase());")
content = content.replace("if (skus.includes(sku)) {", "if (skus.includes(sku.toLowerCase())) {")

with open("server.ts", "w") as f:
    f.write(content)
print("Fixed skus case sensitivity.")
