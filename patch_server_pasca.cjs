const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
    /let adminFee = isOwnerCtx \? feeData\.owner : \(memberType === 'VIP' \? feeData\.vip : feeData\.biasa\);\s*let total = tagihan \+ adminFee;/g,
    `let adminFee = isOwnerCtx ? feeData.owner : (memberType === 'VIP' ? feeData.vip : feeData.biasa);
                         let total = tagihan + adminFee;
                         if (isOwnerCtx && feeData.owner_fixed !== undefined) {
                             total = feeData.owner_fixed;
                             adminFee = total - tagihan;
                         }`
);

fs.writeFileSync('server.ts', code);
