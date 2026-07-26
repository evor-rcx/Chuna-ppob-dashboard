const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `                if (prepaidBrands.includes(text)) {
                    let filtered = prepaid.filter((p: any) => p.brand === text);
                    const types = [...new Set(filtered.map((p: any) => p.type))].filter(Boolean);
                    
                    if (types.length > 1) {
                        const prevMemberId = userStates[userId]?.data?.memberId;
                        userStates[userId] = { step: 'PREPAID_SELECT_TYPE', data: { brand: text, memberId: prevMemberId } };`;

const rep = `                if (prepaidBrands.includes(text)) {
                    let filtered = prepaid.filter((p: any) => p.brand === text);
                    
                    const stateCategory = (state && state.step === 'PREPAID_SELECT_BRAND') ? state.data.category : null;
                    if (stateCategory) {
                        filtered = filtered.filter((p: any) => p.category === stateCategory);
                    } else {
                        // If no category in state, check if brand has multiple categories
                        const cats = [...new Set(filtered.map((p: any) => p.category))].filter(Boolean);
                        if (cats.length > 1) {
                            const keyboard = [];
                            for (let i = 0; i < cats.length; i += 2) {
                                const row = [{ text: String(cats[i]) }];
                                if (cats[i+1]) row.push({ text: String(cats[i+1]) });
                                keyboard.push(row);
                            }
                            keyboard.push([{ text: "🔙 Kembali" }]);
                            await ctx.reply(\`📋 *Brand \${text}*\\nProduk ini memiliki beberapa kategori. Silakan pilih kategori:\`, { 
                                parse_mode: 'Markdown',
                                reply_markup: { keyboard: keyboard, resize_keyboard: true }
                            });
                            handled = true;
                            return; // Stop processing further here
                        }
                    }
                    
                    const types = [...new Set(filtered.map((p: any) => p.type))].filter(Boolean);
                    
                    if (types.length > 1) {
                        const prevMemberId = userStates[userId]?.data?.memberId;
                        userStates[userId] = { step: 'PREPAID_SELECT_TYPE', data: { brand: text, category: stateCategory, memberId: prevMemberId } };`;

code = code.replace(target, rep);

fs.writeFileSync('server.ts', code);
console.log("Patched brands handling!");
