const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldType = `const registeredUsers: Record<number, { username: string, wa: string, pin: string }> = db.registeredUsers || {};`;
const newType = `const registeredUsers: Record<number, { username: string, wa: string, pin: string, gmail?: string }> = db.registeredUsers || {};`;
code = code.replace(oldType, newType);

const oldCaseOtp = `              case 'AWAITING_OTP':
                if (text !== state.data.generatedOtp) {
                   await ctx.reply(\`❌ Yah kode OTP-nya salah kak. Coba cek lagi ya kodenya!\`);
                   return;
                }
                state.step = 'AWAITING_PIN';
                await ctx.reply(\`Yeay kode OTP berhasil dikonfirmasi! 🎉\nSatu langkah lagi nih kak. Yuk buat PIN rahasia kakak (6 angka) biar transaksi kakak aman bareng Chuna! 🔒\`);
                return;
                  
              case 'AWAITING_PIN':
                state.data.pin = text;
                state.step = 'REGISTERED';
                registeredUsers[userId] = {
                  username: state.data.username,
                  wa: state.data.wa,
                  pin: state.data.pin
                };`;

const newCaseOtp = `              case 'AWAITING_OTP':
                if (text !== state.data.generatedOtp) {
                   await ctx.reply(\`❌ Yah kode OTP-nya salah kak. Coba cek lagi ya kodenya!\`);
                   return;
                }
                state.step = 'AWAITING_GMAIL';
                await ctx.reply(\`Yeay kode OTP berhasil dikonfirmasi! 🎉\nSekarang kirim alamat Gmail aktif kakak ya (contoh: chuna@gmail.com) 📧\`);
                return;

              case 'AWAITING_GMAIL':
                if (!text.includes('@')) {
                  await ctx.reply(\`❌ Format Gmail sepertinya kurang tepat kak. Coba kirim ulang ya! (contoh: chuna@gmail.com)\`);
                  return;
                }
                state.data.gmail = text;
                state.step = 'AWAITING_PIN';
                await ctx.reply(\`Oke Gmail aman! 👌\nSatu langkah lagi nih kak. Yuk buat PIN rahasia kakak (6 angka) biar transaksi kakak aman bareng Chuna! 🔒\`);
                return;
                  
              case 'AWAITING_PIN':
                state.data.pin = text;
                state.step = 'REGISTERED';
                registeredUsers[userId] = {
                  username: state.data.username,
                  wa: state.data.wa,
                  pin: state.data.pin,
                  gmail: state.data.gmail
                };`;

code = code.replace(oldCaseOtp, newCaseOtp);
fs.writeFileSync('server.ts', code);
