with open('src/components/views/Produk.tsx', 'r') as f:
    code = f.read()

new_fn_ts = """const handleHargaOwnerChange = (sku: string, value: string) => {
    let finalValue = value;
    if (finalValue.startsWith('0') && finalValue.length > 1) {
        finalValue = parseInt(finalValue, 10).toString();
        if (finalValue === 'NaN') finalValue = '';
    }
    setHargas(prev => ({
      ...prev,
      [sku]: { owner: finalValue }
    }));
  };"""

code = code.replace(
    "const handleHargaOwnerChange = (sku: string, value: string) => {\n    setHargas(prev => ({\n      ...prev,\n      [sku]: { owner: value }\n    }));\n  };",
    new_fn_ts
)

with open('src/components/views/Produk.tsx', 'w') as f:
    f.write(code)

print("Patched harga")
