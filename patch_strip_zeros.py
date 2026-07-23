import re

with open('src/components/views/Produk.tsx', 'r') as f:
    code = f.read()

new_fn = """const handleFeeChange = (sku: string, field: 'biasa'|'vip', value: string) => {
    let finalValue = value;
    if (finalValue.startswith('0') && finalValue.length > 1) {
        finalValue = parseInt(finalValue, 10).toString();
        if (finalValue === 'NaN') finalValue = '';
    }
    setFees(prev => ({
      ...prev,
      [sku]: { ...(prev[sku] || { biasa: '0', vip: '0', owner: '0' }), [field]: finalValue }
    }));
  };"""
  
new_fn_ts = """const handleFeeChange = (sku: string, field: 'biasa'|'vip', value: string) => {
    let finalValue = value;
    if (finalValue.startsWith('0') && finalValue.length > 1) {
        finalValue = parseInt(finalValue, 10).toString();
        if (finalValue === 'NaN') finalValue = '';
    }
    setFees(prev => ({
      ...prev,
      [sku]: { ...(prev[sku] || { biasa: '0', vip: '0', owner: '0' }), [field]: finalValue }
    }));
  };"""

code = code.replace(
    "const handleFeeChange = (sku: string, field: 'biasa'|'vip', value: string) => {\n    setFees(prev => ({\n      ...prev,\n      [sku]: { ...(prev[sku] || { biasa: '0', vip: '0', owner: '0' }), [field]: value }\n    }));\n  };",
    new_fn_ts
)

with open('src/components/views/Produk.tsx', 'w') as f:
    f.write(code)

print("Patched zeros")
