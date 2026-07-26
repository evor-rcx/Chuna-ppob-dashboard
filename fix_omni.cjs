const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `const selectedPkg = state.data.omniPackages.find((p: any) => p.name + " - " + p.price === text.trim());
                if (!selectedKodebayarPkg) {
                    await ctx.reply("❌ Pilihan tidak valid. Silakan pilih dari menu di bawah atau klik Batal.");
                    return;
                }
                
                await ctx.reply("⏳ Sedang memproses Kode Bayar untuk " + selectedKodebayarPkg.name + "...");
                let omniFinalCustomerNo = selectedPkg.code;`;

const replacement1 = `const selectedPkg = state.data.omniPackages.find((p: any) => p.name + " - " + p.price === text.trim());
                if (!selectedPkg) {
                    await ctx.reply("❌ Pilihan tidak valid. Silakan pilih dari menu di bawah atau klik Batal.");
                    return;
                }
                
                await ctx.reply("⏳ Sedang memproses Kode Bayar untuk " + selectedPkg.name + "...");
                let omniFinalCustomerNo = selectedPkg.code;`;

code = code.replace(target1, replacement1);

const target2 = `let detail = selectedKodebayarPkg.name;`;
// Wait, I need to know where it is in OMNI. Let's see the rest of OMNI block.
