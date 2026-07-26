const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `                        keyboard.push([{ text: "🔙 Kembali" }]);
                        await ctx.reply(\`📋 *Kategori \${text} (Prabayar)*\\nSilakan pilih brand di bawah ini:\`, { 
                            parse_mode: 'Markdown',
                            reply_markup: {
                                keyboard: keyboard,
                                resize_keyboard: true
                            }
                        });
                        handled = true;`;
console.log(code.includes(target));
