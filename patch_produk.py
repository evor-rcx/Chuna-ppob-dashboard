import re

with open('src/components/views/Produk.tsx', 'r') as f:
    code = f.read()

# Update state type
code = code.replace(
    'const [fees, setFees] = useState<Record<string, { biasa: number, vip: number, owner: number }>>({});',
    'const [fees, setFees] = useState<Record<string, { biasa: string, vip: string, owner: string }>>({});'
)

# Update fetchProducts newFees
code = code.replace(
    'const newFees: Record<string, { biasa: number, vip: number, owner: number }> = {};',
    'const newFees: Record<string, { biasa: string, vip: string, owner: string }> = {};'
)

code = code.replace(
    'newFees[p.buyer_sku_code] = { biasa: p.fee_biasa || 0, vip: p.fee_vip || 0, owner: feeOwner };',
    'newFees[p.buyer_sku_code] = { biasa: (p.fee_biasa || 0).toString(), vip: (p.fee_vip || 0).toString(), owner: feeOwner.toString() };'
)

# Update handleFeeChange
code = code.replace(
    "const handleFeeChange = (sku: string, field: 'biasa'|'vip', value: string) => {\n    setFees(prev => ({\n      ...prev,\n      [sku]: { ...(prev[sku] || { biasa: 0, vip: 0, owner: 0 }), [field]: parseInt(value) || 0 }\n    }));\n  };",
    "const handleFeeChange = (sku: string, field: 'biasa'|'vip', value: string) => {\n    setFees(prev => ({\n      ...prev,\n      [sku]: { ...(prev[sku] || { biasa: '0', vip: '0', owner: '0' }), [field]: value }\n    }));\n  };"
)

# Update handleSaveFee
code = code.replace(
    'const fee = fees[sku] || { biasa: 0, vip: 0, owner: 0 };',
    'const fee = fees[sku] || { biasa: "0", vip: "0", owner: "0" };'
)

code = code.replace(
    "body: JSON.stringify({ sku, biasa: fee.biasa, vip: fee.vip, owner: calculatedOwnerFee })",
    "body: JSON.stringify({ sku, biasa: parseInt(fee.biasa as string) || 0, vip: parseInt(fee.vip as string) || 0, owner: calculatedOwnerFee })"
)

# Update handleSaveAll
code = code.replace(
    'const fee = fees[p.buyer_sku_code] || { biasa: 0, vip: 0, owner: 0 };',
    'const fee = fees[p.buyer_sku_code] || { biasa: "0", vip: "0", owner: "0" };'
)

code = code.replace(
    'biasa: fee.biasa, vip: fee.vip, owner: calculatedOwnerFee',
    'biasa: parseInt(fee.biasa as string) || 0, vip: parseInt(fee.vip as string) || 0, owner: calculatedOwnerFee'
)

with open('src/components/views/Produk.tsx', 'w') as f:
    f.write(code)

print("Patched Produk.tsx")
