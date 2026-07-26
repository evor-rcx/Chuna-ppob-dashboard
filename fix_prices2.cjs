const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `                            packages.forEach((pkg: any) => {
                                let cleanPrice = pkg.price.replace(/[^0-9]/g, '');
                                if (cleanPrice) {
                                    let priceNum = parseInt(cleanPrice, 10);
                                    let total = priceNum + adminFee;
                                    if (isOwnerCtx && feeData.owner_fixed !== undefined) {
                                        total = feeData.owner_fixed;
                                    }
                                    pkg.price = \`Rp. \${total.toLocaleString('id-ID')}\`;
                                }
                            });
                            
                            userStates[userId] = {
                                step: 'KODEBAYAR_SELECT_PACKAGE',`;

const replacement1 = `                            packages.forEach((pkg: any) => {
                                let cleanPrice = pkg.price.replace(/[^0-9]/g, '');
                                if (cleanPrice) {
                                    let priceNum = parseInt(cleanPrice, 10);
                                    let digiflazzAdmin = product.admin || 0;
                                    let total = digiflazzAdmin + priceNum + adminFee;
                                    if (isOwnerCtx && feeData.owner_fixed !== undefined) {
                                        total = feeData.owner_fixed;
                                    }
                                    pkg.price = \`Rp. \${total.toLocaleString('id-ID')}\`;
                                }
                            });
                            
                            userStates[userId] = {
                                step: 'KODEBAYAR_SELECT_PACKAGE',`;

code = code.replace(target1, replacement1);

const target2 = `                            packages.forEach((pkg: any) => {
                                let cleanPrice = pkg.price.replace(/[^0-9]/g, '');
                                if (cleanPrice) {
                                    let priceNum = parseInt(cleanPrice, 10);
                                    let total = priceNum + adminFee;
                                    if (isOwnerCtx && feeData.owner_fixed !== undefined) {
                                        total = feeData.owner_fixed;
                                    }
                                    pkg.price = \`Rp. \${total.toLocaleString('id-ID')}\`;
                                }
                            });
                            
                            userStates[userId] = {
                                step: 'OMNI_SELECT_PACKAGE',`;

const replacement2 = `                            packages.forEach((pkg: any) => {
                                let cleanPrice = pkg.price.replace(/[^0-9]/g, '');
                                if (cleanPrice) {
                                    let priceNum = parseInt(cleanPrice, 10);
                                    let digiflazzAdmin = product.admin || 0;
                                    let total = digiflazzAdmin + priceNum + adminFee;
                                    if (isOwnerCtx && feeData.owner_fixed !== undefined) {
                                        total = feeData.owner_fixed;
                                    }
                                    pkg.price = \`Rp. \${total.toLocaleString('id-ID')}\`;
                                }
                            });
                            
                            userStates[userId] = {
                                step: 'OMNI_SELECT_PACKAGE',`;

code = code.replace(target2, replacement2);

fs.writeFileSync('server.ts', code);
console.log("Fixed packages price mapping again");
