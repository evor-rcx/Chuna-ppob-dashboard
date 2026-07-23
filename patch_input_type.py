import re

with open('src/components/views/Produk.tsx', 'r') as f:
    code = f.read()

# Replace handleFeeChange
new_handle_fee = """const handleFeeChange = (sku: string, field: 'biasa'|'vip', value: string) => {
    let finalValue = value.replace(/\\D/g, '');
    if (finalValue === '') {
        finalValue = '';
    } else {
        finalValue = parseInt(finalValue, 10).toString();
    }
    setFees(prev => ({
      ...prev,
      [sku]: { ...(prev[sku] || { biasa: '', vip: '', owner: '' }), [field]: finalValue }
    }));
  };"""
  
code = code.replace("const handleFeeChange = (sku: string, field: 'biasa'|'vip', value: string) => {\\n    let finalValue = value;\\n    if (finalValue.startsWith('0') && finalValue.length > 1) {\\n        finalValue = parseInt(finalValue, 10).toString();\\n        if (finalValue === 'NaN') finalValue = '';\\n    }\\n    setFees(prev => ({\\n      ...prev,\\n      [sku]: { ...(prev[sku] || { biasa: '0', vip: '0', owner: '0' }), [field]: finalValue }\\n    }));\\n  };", new_handle_fee.replace('\\\\', '\\'))

# Replace handleHargaOwnerChange
new_handle_harga = """const handleHargaOwnerChange = (sku: string, value: string) => {
    let finalValue = value.replace(/\\D/g, '');
    if (finalValue === '') {
        finalValue = '';
    } else {
        finalValue = parseInt(finalValue, 10).toString();
    }
    setHargas(prev => ({
      ...prev,
      [sku]: { owner: finalValue }
    }));
  };"""

# I will just use string replace to be safe.
# First read the file again to avoid re module issues entirely.
