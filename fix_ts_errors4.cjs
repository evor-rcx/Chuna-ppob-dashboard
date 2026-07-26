const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The line is:
// if (pay_ref_id) { var notaBuffer: any = await generateCanvasReceipt("nota", { id: pay_ref_id, memberId: member.id, type: "prepaid", product: product.product_name, sku: product.buyer_sku_code, target: targetDisplay, price: total, modal: digiflazzPrice, cuan: cuan > 0 ? cuan : 0, status: status, method: method, sn: payJson.data?.sn || "-", date: new Date().toISOString() });
// And it doesn't have a closing brace. I should just close it at the end of the line!
code = code.replace(/(if \(pay_ref_id\) \{ var notaBuffer: any = await generateCanvasReceipt\([^;]+\);)/g, '$1 }');

fs.writeFileSync('server.ts', code);
console.log("Fixed brace");
