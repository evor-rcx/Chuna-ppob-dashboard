import re

with open('server.ts', 'r') as f:
    content = f.read()

old_logic = """                         const isOwnerCtx = db.owners.includes(ctx.from?.id);
                         const adminFee = isOwnerCtx ? (getProductFee(product.buyer_sku_code).owner) : (memberType === 'VIP' ? (getProductFee(product.buyer_sku_code).vip) : (getProductFee(product.buyer_sku_code).biasa));
                         const total = tagihan + adminFee;"""

new_logic = """                         const isOwnerCtx = db.owners.includes(ctx.from?.id);
                         const feeData = getProductFee(product.buyer_sku_code);
                         let adminFee = isOwnerCtx ? feeData.owner : (memberType === 'VIP' ? feeData.vip : feeData.biasa);
                         let total = tagihan + adminFee;
                         if (isOwnerCtx && feeData.owner_fixed !== undefined) {
                             total = feeData.owner_fixed;
                             adminFee = total - tagihan;
                         }"""

content = content.replace(old_logic, new_logic)

with open('server.ts', 'w') as f:
    f.write(content)
