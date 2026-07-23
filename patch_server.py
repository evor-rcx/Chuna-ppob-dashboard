import re

with open('server.ts', 'r') as f:
    content = f.read()

# For POST
content = content.replace(
    "const { name, price, stock, buyPrice, unit, category, promo, cupPrice } = req.body;",
    "const { name, price, stock, buyPrice, unit, category, promo, cupPrice, buyPriceTotal, buyQty, buyUnit, itemsPerUnit } = req.body;"
)
content = content.replace(
    "cupPrice: cupPrice ? Number(cupPrice) : undefined",
    "cupPrice: cupPrice ? Number(cupPrice) : undefined,\n      buyPriceTotal: buyPriceTotal || '',\n      buyQty: buyQty || '1',\n      buyUnit: buyUnit || 'PAK',\n      itemsPerUnit: itemsPerUnit || '1'"
)

# For PUT
content = content.replace(
    "const { name, price, stock, buyPrice, unit, category, promo, cupPrice } = req.body;",
    "const { name, price, stock, buyPrice, unit, category, promo, cupPrice, buyPriceTotal, buyQty, buyUnit, itemsPerUnit } = req.body;"
)

put_replacement = """db.physicalProducts[index] = { ...db.physicalProducts[index], name, price: Number(price), stock: Number(stock), buyPrice: Number(buyPrice || 0), unit: unit || 'pcs', category: category || 'Lainnya', promo: promo || 'none', cupPrice: cupPrice ? Number(cupPrice) : undefined, buyPriceTotal: buyPriceTotal !== undefined ? buyPriceTotal : db.physicalProducts[index].buyPriceTotal, buyQty: buyQty !== undefined ? buyQty : db.physicalProducts[index].buyQty, buyUnit: buyUnit !== undefined ? buyUnit : db.physicalProducts[index].buyUnit, itemsPerUnit: itemsPerUnit !== undefined ? itemsPerUnit : db.physicalProducts[index].itemsPerUnit };"""

content = re.sub(
    r"db\.physicalProducts\[index\] = \{ \.\.\.db\.physicalProducts\[index\], name, price: Number\(price\), stock: Number\(stock\), buyPrice: Number\(buyPrice \|\| 0\), unit: unit \|\| 'pcs', category: category \|\| 'Lainnya', promo: promo \|\| 'none', cupPrice: cupPrice \? Number\(cupPrice\) : undefined \};",
    put_replacement,
    content
)

with open('server.ts', 'w') as f:
    f.write(content)
