import re

with open('server.ts', 'r') as f:
    content = f.read()

old_logic = """                        const adminFee = isOwnerCtx ? (getProductFee(matchedProduct.buyer_sku_code).owner) : (memberType === 'VIP' ? (getProductFee(matchedProduct.buyer_sku_code).vip) : (getProductFee(matchedProduct.buyer_sku_code).biasa));
                        const total = matchedProduct.price + adminFee;"""

new_logic = """                        const feeData = getProductFee(matchedProduct.buyer_sku_code);
                        let adminFee = isOwnerCtx ? feeData.owner : (memberType === 'VIP' ? feeData.vip : feeData.biasa);
                        let total = matchedProduct.price + adminFee;
                        if (isOwnerCtx && feeData.owner_fixed !== undefined) {
                            total = feeData.owner_fixed;
                            adminFee = total - matchedProduct.price;
                        }"""

content = content.replace(old_logic, new_logic)

with open('server.ts', 'w') as f:
    f.write(content)
