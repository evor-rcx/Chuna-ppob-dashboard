import re

with open("server.ts", "r") as f:
    content = f.read()

helper = """
function getProductFee(sku: string) {
    if (!sku) return { biasa: 0, vip: 0, owner: 0 };
    if (productFees[sku]) return productFees[sku];
    const upper = sku.toUpperCase();
    if (productFees[upper]) return productFees[upper];
    const lower = sku.toLowerCase();
    if (productFees[lower]) return productFees[lower];
    
    const key = Object.keys(productFees).find(k => k.toLowerCase() === lower);
    if (key) return productFees[key];
    
    return { biasa: 0, vip: 0, owner: 0 };
}
"""

if "function getProductFee" not in content:
    pos = content.find("let productFees: Record<string, {")
    if pos != -1:
        end_pos = content.find(";", pos)
        content = content[:end_pos+1] + "\n" + helper + content[end_pos+1:]
        with open("server.ts", "w") as f:
            f.write(content)
        print("Injected helper.")
