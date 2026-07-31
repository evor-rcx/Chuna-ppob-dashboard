import re

with open('server.ts', 'r') as f:
    code = f.read()

# For prepaid failure
prepaid_fail_pattern = r"""                    let refundMsg = method === 'saldo' \? '✅ Saldo sebesar Rp ' \+ total\.toLocaleString\('id-ID'\) \+ ' telah dikembalikan ke akunmu!' : \(method === 'utang' \? '✅ Utang sebesar Rp ' \+ total\.toLocaleString\('id-ID'\) \+ ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' \+ total\.toLocaleString\('id-ID'\) \+ ' kepada pelanggan\.'\);
                    msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses\.

Kemungkinan ada kesalahan data atau saldo kurang\. Silakan cek kembali, atau hubungi Chuna untuk bantuan\$\{\(payJson\.data\.message \|\| ''\)\.toLowerCase\(\)\.includes\('ip'\) \? ' lebih lanjut' : ''\}\.

Keterangan : \$\{payJson\.data\.message \|\| 'Transaksi Gagal'\}
📦 Produk  : \$\{product\.product_name\}
🎯 Tujuan   : \$\{targetDisplay\} \(\$\{member\.name \|\| "-"\}\)

\$\{refundMsg\}

\$\{\(payJson\.data\.message \|\| ''\)\.toLowerCase\(\)\.includes\('ip'\) \? 'Jangan khawatir, Kakak bisa mencoba ulang kapan saja\.' : 'Tenang saja, Kakak bisa mencoba ulang kapan pun\.'\}

Butuh bantuan\? Chuna siap membantu dengan senyum! 😊💪`;"""

prepaid_fail_new = """                    let refundMsg = method === 'saldo' ? '✅ Saldo sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (method === 'utang' ? '✅ Utang sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' + total.toLocaleString('id-ID') + ' kepada pelanggan.');
                    let isIpError = (payJson.data.message || '').toLowerCase().includes('ip anda tidak kami kenali') || (payJson.data.message || '').toLowerCase().includes('ip');
                    let customerErrorMsg = isIpError ? 'Sedang ada pemeliharaan' : (payJson.data.message || 'Transaksi Gagal');
                    msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.

Kemungkinan ada kesalahan data atau saldo kurang. Silakan cek kembali, atau hubungi Chuna untuk bantuan${isIpError ? ' lebih lanjut' : ''}.

Keterangan : ${customerErrorMsg}
📦 Produk  : ${product.product_name}
🎯 Tujuan   : ${targetDisplay} (${member.name || "-"})

${refundMsg}

${isIpError ? 'Jangan khawatir, Kakak bisa mencoba ulang kapan saja.' : 'Tenang saja, Kakak bisa mencoba ulang kapan pun.'}

Butuh bantuan? Chuna siap membantu dengan senyum! 😊💪`;

                    if (isIpError) {
                        const ownerIpMsg = `🚨 *INFO PENTING DARI CHUNA!* 🚨
IP Digiflazz tidak dikenali!
Pelanggan mencoba memesan namun gagal karena error IP.
👤 *Pelanggan*: ${member.name || "-"} (${targetDisplay})
📦 *Produk*: ${product.product_name}
⚠️ *Error*: ${payJson.data.message}

Segera cek dan update whitelist IP di dashboard Digiflazz Kakak!`;
                        for (const ownerId of db.owners) {
                            try {
                                await bot.telegram.sendMessage(ownerId, ownerMsg, { parse_mode: 'Markdown' });
                            } catch(e) {
                                console.error("Failed to notify owner", e);
                            }
                        }
                    }"""

code = re.sub(prepaid_fail_pattern, prepaid_fail_new.replace('ownerMsg', 'ownerIpMsg'), code)

# Let's check postpaid pattern
# Line 2588

postpaid_fail_pattern = r"""                    let refundMsg = method === 'saldo' \? '✅ Saldo sebesar Rp ' \+ total\.toLocaleString\('id-ID'\) \+ ' telah dikembalikan ke akunmu!' : \(method === 'utang' \? '✅ Utang sebesar Rp ' \+ total\.toLocaleString\('id-ID'\) \+ ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' \+ total\.toLocaleString\('id-ID'\) \+ ' kepada pelanggan\.'\);
                    msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses\.

Kemungkinan ada kesalahan data atau saldo kurang\. Silakan cek kembali, atau hubungi Chuna untuk bantuan\$\{\(payJson\.data\.message \|\| ''\)\.toLowerCase\(\)\.includes\('ip'\) \? ' lebih lanjut' : ''\}\.

Keterangan : \$\{payJson\.data\.message \|\| 'Transaksi Gagal'\}
📦 Tagihan : \$\{stateData\.product\.product_name\}
🎯 Tujuan   : \$\{displayCustomerNo\} \(\$\{payJson\.data\?\.customer_name \|\| checkResult\?\.customer_name \|\| "-"\}\)

\$\{refundMsg\}

\$\{\(payJson\.data\.message \|\| ''\)\.toLowerCase\(\)\.includes\('ip'\) \? 'Jangan khawatir, Kakak bisa mencoba ulang kapan saja\.' : 'Tenang saja, Kakak bisa mencoba ulang kapan pun\.'\}

Butuh bantuan\? Chuna siap membantu dengan senyum! 😊💪`;"""

postpaid_fail_new = """                    let refundMsg = method === 'saldo' ? '✅ Saldo sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (method === 'utang' ? '✅ Utang sebesar Rp ' + total.toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' + total.toLocaleString('id-ID') + ' kepada pelanggan.');
                    let isIpError = (payJson.data.message || '').toLowerCase().includes('ip anda tidak kami kenali') || (payJson.data.message || '').toLowerCase().includes('ip');
                    let customerErrorMsg = isIpError ? 'Sedang ada pemeliharaan' : (payJson.data.message || 'Transaksi Gagal');
                    msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.

Kemungkinan ada kesalahan data atau saldo kurang. Silakan cek kembali, atau hubungi Chuna untuk bantuan${isIpError ? ' lebih lanjut' : ''}.

Keterangan : ${customerErrorMsg}
📦 Tagihan : ${stateData.product.product_name}
🎯 Tujuan   : ${displayCustomerNo} (${payJson.data?.customer_name || checkResult?.customer_name || "-"})

${refundMsg}

${isIpError ? 'Jangan khawatir, Kakak bisa mencoba ulang kapan saja.' : 'Tenang saja, Kakak bisa mencoba ulang kapan pun.'}

Butuh bantuan? Chuna siap membantu dengan senyum! 😊💪`;

                    if (isIpError) {
                        const ownerIpMsg = `🚨 *INFO PENTING DARI CHUNA!* 🚨
IP Digiflazz tidak dikenali!
Pelanggan mencoba memesan namun gagal karena error IP.
👤 *Pelanggan*: ${payJson.data?.customer_name || checkResult?.customer_name || "-"} (${displayCustomerNo})
📦 *Tagihan*: ${stateData.product.product_name}
⚠️ *Error*: ${payJson.data.message}

Segera cek dan update whitelist IP di dashboard Digiflazz Kakak!`;
                        for (const ownerId of db.owners) {
                            try {
                                await bot.telegram.sendMessage(ownerId, ownerIpMsg, { parse_mode: 'Markdown' });
                            } catch(e) {
                                console.error("Failed to notify owner", e);
                            }
                        }
                    }"""

code = re.sub(postpaid_fail_pattern, postpaid_fail_new, code)


# Let's check checkTopupStatus block
# Line 956

check_fail_pattern = r"""                    let refundMsg = tx\.method === 'saldo' \? '✅ Saldo sebesar Rp ' \+ tx\.price\.toLocaleString\('id-ID'\) \+ ' telah dikembalikan ke akunmu!' : \(tx\.method === 'utang' \? '✅ Utang sebesar Rp ' \+ tx\.price\.toLocaleString\('id-ID'\) \+ ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' \+ tx\.price\.toLocaleString\('id-ID'\) \+ ' kepada pelanggan\.'\);
                    msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses\.

Kemungkinan ada kesalahan data atau saldo kurang\. Silakan cek kembali, atau hubungi Chuna untuk bantuan\$\{\(data\.message \|\| ''\)\.toLowerCase\(\)\.includes\('ip'\) \? ' lebih lanjut' : ''\}\.

Keterangan : \$\{data\.message \|\| 'Transaksi Gagal'\}
📦 Produk  : \$\{tx\.product\}
🎯 Tujuan   : \$\{tx\.target\} \(\$\{nama\}\)

\$\{refundMsg\}

\$\{\(data\.message \|\| ''\)\.toLowerCase\(\)\.includes\('ip'\) \? 'Jangan khawatir, Kakak bisa mencoba ulang kapan saja\.' : 'Tenang saja, Kakak bisa mencoba ulang kapan pun\.'\}

Butuh bantuan\? Chuna siap membantu dengan senyum! 😊💪`;"""

check_fail_new = """                    let refundMsg = tx.method === 'saldo' ? '✅ Saldo sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' telah dikembalikan ke akunmu!' : (tx.method === 'utang' ? '✅ Utang sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' telah dibatalkan!' : '✅ Mohon kembalikan uang tunai sebesar Rp ' + tx.price.toLocaleString('id-ID') + ' kepada pelanggan.');
                    let isIpError = (data.message || '').toLowerCase().includes('ip anda tidak kami kenali') || (data.message || '').toLowerCase().includes('ip');
                    let customerErrorMsg = isIpError ? 'Sedang ada pemeliharaan' : (data.message || 'Transaksi Gagal');
                    msg = `❌ Maaf Kak, pembayaran untuk pesanan Anda gagal diproses.

Kemungkinan ada kesalahan data atau saldo kurang. Silakan cek kembali, atau hubungi Chuna untuk bantuan${isIpError ? ' lebih lanjut' : ''}.

Keterangan : ${customerErrorMsg}
📦 Produk  : ${tx.product}
🎯 Tujuan   : ${tx.target} (${nama})

${refundMsg}

${isIpError ? 'Jangan khawatir, Kakak bisa mencoba ulang kapan saja.' : 'Tenang saja, Kakak bisa mencoba ulang kapan pun.'}

Butuh bantuan? Chuna siap membantu dengan senyum! 😊💪`;

                    if (isIpError) {
                        const ownerIpMsg = `🚨 *INFO PENTING DARI CHUNA!* 🚨
IP Digiflazz tidak dikenali (Webhook Update)!
Pelanggan pesanan gagal karena error IP.
👤 *Pelanggan*: ${nama} (${tx.target})
📦 *Produk*: ${tx.product}
⚠️ *Error*: ${data.message}

Segera cek dan update whitelist IP di dashboard Digiflazz Kakak!`;
                        for (const ownerId of db.owners) {
                            try {
                                await bot.telegram.sendMessage(ownerId, ownerIpMsg, { parse_mode: 'Markdown' });
                            } catch(e) {
                                console.error("Failed to notify owner", e);
                            }
                        }
                    }"""

code = re.sub(check_fail_pattern, check_fail_new, code)

with open('server.ts', 'w') as f:
    f.write(code)

print("Updated server.ts successfully!")
