import re

with open('server.ts', 'r') as f:
    content = f.read()

old_logic = """                    if (status === 'Gagal' && tx.method === 'saldo' && !isOwnerSelf) {
                        member.balance += tx.price;
                    }
                }
                
                db.transactions = transactions;
                db.members = members;
                writeDB(db);"""

new_logic = """                    if (status === 'Gagal' && tx.method === 'saldo' && !isOwnerSelf) {
                        member.balance += tx.price;
                    }
                }
                
                // Initialize waReceiptSent to false when first moving from Pending
                tx.waReceiptSent = false;
                
                db.transactions = transactions;
                db.members = members;
                writeDB(db);"""

content = content.replace(old_logic, new_logic)

with open('server.ts', 'w') as f:
    f.write(content)
