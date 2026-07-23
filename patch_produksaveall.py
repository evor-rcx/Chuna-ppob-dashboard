import re

with open('src/components/views/Produk.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    'biasa: fee.biasa,\n          vip: fee.vip,\n          owner: calculatedOwnerFee',
    'biasa: parseInt(fee.biasa as string) || 0,\n          vip: parseInt(fee.vip as string) || 0,\n          owner: calculatedOwnerFee'
)

# And also for the normal save:
# Wait, it was body: JSON.stringify({ sku, biasa: parseInt(fee.biasa as string) || 0, vip: parseInt(fee.vip as string) || 0, owner: calculatedOwnerFee })
# Let's ensure this worked.

with open('src/components/views/Produk.tsx', 'w') as f:
    f.write(code)

