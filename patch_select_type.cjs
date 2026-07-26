const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `                if (state && state.step === 'PREPAID_SELECT_TYPE' && !handled) {
                    const brandProducts = prepaid.filter((p: any) => p.brand === state.data.brand);
                    const types = [...new Set(brandProducts.map((p: any) => p.type))].filter(Boolean);`;

const rep = `                if (state && state.step === 'PREPAID_SELECT_TYPE' && !handled) {
                    let brandProducts = prepaid.filter((p: any) => p.brand === state.data.brand);
                    if (state.data.category) {
                        brandProducts = brandProducts.filter((p: any) => p.category === state.data.category);
                    }
                    const types = [...new Set(brandProducts.map((p: any) => p.type))].filter(Boolean);`;

code = code.replace(target, rep);

fs.writeFileSync('server.ts', code);
console.log("Patched PREPAID_SELECT_TYPE!");
