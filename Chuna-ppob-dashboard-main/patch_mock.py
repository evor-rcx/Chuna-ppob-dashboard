import json

with open('db.json', 'r', encoding='utf-8') as f:
    db = json.load(f)

for tx in db.get('transactions', []):
    if tx['status'] == 'Sukses':
        tx['status'] = 'Pending'
        print("Set tx to Pending: " + tx['id'])
        break

with open('db.json', 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=4)
