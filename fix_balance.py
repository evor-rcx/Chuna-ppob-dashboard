import re

with open('/app/applet/server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Webhook
webhook_old = r'''                    if (status === 'Gagal' && tx.method !== 'cash') {
                        member.balance += tx.price;
                    }'''
webhook_new = r'''                    const isOwnerSelf = member.telegram && member.telegram.some((tid: any) => db.owners.includes(parseInt(tid)));
                    if (status === 'Gagal' && tx.method === 'saldo' && !isOwnerSelf) {
                        member.balance += tx.price;
                    }'''
text = text.replace(webhook_old, webhook_new)

# 2. Preflight Prepaid
prepaid_utang_deduct = r'''            } else if (method === 'utang') {
                member.balance -= total;
                db.members = members;
                writeDB(db);
            }'''
text = text.replace(prepaid_utang_deduct, r'''            }''')

# 3. Direct failure replacements
text = text.replace("if (!isOwnerSelf && method !== 'cash')", "if (!isOwnerSelf && method === 'saldo')")

with open('/app/applet/server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Balance logic fixed.")
