const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
const p = code.indexOf('// Check prepaid brands');
if (!code.includes('// Check prepaid categories')) {
    const insert = `            // Check prepaid categories
            try {
                const prepaid = await getDigiflazzProducts("prepaid");
                const prepaidCats = [...new Set(prepaid.map((p: any) => p.category))].filter(Boolean);
                if (prepaidCats.includes(text)) {
                    const filtered = prepaid.filter((p: any) => p.category === text);
                    const brands = [...new Set(filtered.map((p: any) => p.brand))].sort();
                    
                    if (brands.length === 1 && brands[0] === text) {
                        // Skip
                    } else {
                        const keyboard = [];
                        for (let i = 0; i < brands.length; i += 2) {
                            const row = [{ text: brands[i] }];
                            if (brands[i+1]) row.push({ text: brands[i+1] });
                            keyboard.push(row);
                        }
                        keyboard.push([{ text: "🔙 Kembali" }]);
                        const prevMemberId = userStates[userId]?.data?.memberId;
                        userStates[userId] = { step: 'PREPAID_SELECT_BRAND', data: { category: text, memberId: prevMemberId } };
                        await ctx.reply(\`🛒 *Kategori \${text}*\\nSilakan pilih brand di bawah ini:\`, { 
                            parse_mode: 'Markdown',
                            reply_markup: { keyboard: keyboard, resize_keyboard: true }
                        });
                        handled = true;
                    }
                }
            } catch (e) { console.error("Error in prepaidCats check:", e.message); }
            if (handled) return;
            
            `;
    code = code.substring(0, p) + insert + code.substring(p);
    fs.writeFileSync('server.ts', code);
    console.log("Inserted prepaid categories check!");
}
