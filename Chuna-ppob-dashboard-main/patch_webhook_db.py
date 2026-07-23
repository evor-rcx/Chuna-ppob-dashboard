import re

with open('server.ts', 'r') as f:
    code = f.read()

webhook_old = r"""                    if \(status === 'Gagal' && tx\.method !== 'cash'\) \{
                        member\.balance \+= tx\.price;
                    \}
                \}
                
                writeDB\(db\);"""

webhook_new = """                    if (status === 'Gagal' && tx.method !== 'cash') {
                        member.balance += tx.price;
                    }
                }
                
                db.transactions = transactions;
                db.members = members;
                writeDB(db);"""

code = re.sub(webhook_old, webhook_new, code)

with open('server.ts', 'w') as f:
    f.write(code)

print("Webhook db patched")
