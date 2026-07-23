import re

with open('server.ts', 'r') as f:
    content = f.read()

# Prepaid generateCanvasReceipt
old_prepaid_nota = """                    if (pay_ref_id) notaBuffer = await generateCanvasReceipt("nota", { id: pay_ref_id, memberId: member.id, type: "prepaid", product: product.product_name, sku: product.buyer_sku_code, target: targetDisplay, price: total, modal: digiflazzPrice, cuan: cuan > 0 ? cuan : 0, status: status, method: method, date: new Date().toISOString() });"""
new_prepaid_nota = """                    if (pay_ref_id) notaBuffer = await generateCanvasReceipt("nota", { id: pay_ref_id, memberId: member.id, type: "prepaid", product: product.product_name, sku: product.buyer_sku_code, target: targetDisplay, price: total, modal: digiflazzPrice, cuan: cuan > 0 ? cuan : 0, status: status, method: method, sn: payJson.data?.sn || "-", date: new Date().toISOString() });"""
content = content.replace(old_prepaid_nota, new_prepaid_nota)

# Prepaid unshift
old_prepaid_unshift = """                    method: method,
                    date: new Date().toISOString(),
                    tgMsgId,
                    waMsgKey,
                    tgChatId: ctx.chat?.id,
                    waJid
                });"""
new_prepaid_unshift = """                    method: method,
                    sn: payJson.data?.sn || "-",
                    date: new Date().toISOString(),
                    tgMsgId,
                    waMsgKey,
                    tgChatId: ctx.chat?.id,
                    waJid
                });"""
content = content.replace(old_prepaid_unshift, new_prepaid_unshift)

# Pasca generateCanvasReceipt
old_pasca_nota = """                    if (pay_ref_id) notaBuffer = await generateCanvasReceipt("nota", { id: pay_ref_id, memberId: member.id, type: "pasca", product: stateData.product.product_name, sku: stateData.product.buyer_sku_code, target: customerNo, price: total, modal: digiflazzPrice, cuan: cuan > 0 ? cuan : 0, tagihan: stateData.checkResult?.selling_price || 0, admin_pel: stateData.adminFee || 0, status: status, method: method, date: new Date().toISOString() });"""
new_pasca_nota = """                    if (pay_ref_id) notaBuffer = await generateCanvasReceipt("nota", { id: pay_ref_id, memberId: member.id, type: "pasca", product: stateData.product.product_name, sku: stateData.product.buyer_sku_code, target: customerNo, price: total, modal: digiflazzPrice, cuan: cuan > 0 ? cuan : 0, tagihan: stateData.checkResult?.selling_price || 0, admin_pel: stateData.adminFee || 0, status: status, method: method, sn: payJson.data?.sn || "-", date: new Date().toISOString() });"""
content = content.replace(old_pasca_nota, new_pasca_nota)

# Pasca unshift
old_pasca_unshift = """                    method: method,
                    date: new Date().toISOString(),
                    tgMsgId,
                    waMsgKey,
                    tgChatId: ctx.chat?.id,
                    waJid
                });"""
new_pasca_unshift = """                    method: method,
                    sn: payJson.data?.sn || "-",
                    date: new Date().toISOString(),
                    tgMsgId,
                    waMsgKey,
                    tgChatId: ctx.chat?.id,
                    waJid
                });"""
content = content.replace(old_pasca_unshift, new_pasca_unshift)

# WhatsApp Image
old_wa = """                        let waMsg;
                        waMsg = await waSocket.sendMessage(jid, { text: msg });
                        if (waMsg) waMsgKey = waMsg.key;"""
new_wa = """                        let waMsg;
                        if (typeof notaBuffer !== 'undefined' && notaBuffer) {
                            waMsg = await waSocket.sendMessage(jid, { image: notaBuffer, caption: msg });
                        } else {
                            waMsg = await waSocket.sendMessage(jid, { text: msg });
                        }
                        if (waMsg) waMsgKey = waMsg.key;"""
content = content.replace(old_wa, new_wa)

with open('server.ts', 'w') as f:
    f.write(content)

