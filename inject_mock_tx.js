import fs from 'fs';

const dbFile = 'db.json';
let db = { transactions: [] };
if (fs.existsSync(dbFile)) {
    db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
}

const mockTx = {
    id: 'PRE-1784107457845',
    date: new Date().toISOString(),
    memberId: 'MBR-1784112760039', // Using one of the members from the log
    product: {
        product_name: 'Free Fire 70 Diamond',
        brand: 'FREE FIRE'
    },
    targetNo: '16180441089',
    price: 8365,
    paidAmount: 8365,
    profit: 500,
    status: 'Sukses',
    method: 'saldo',
    sn: "-who'aul-",
    type: 'prepaid'
};

// Check if already exists
const existingIndex = db.transactions.findIndex(t => t.id === mockTx.id);
if (existingIndex >= 0) {
    db.transactions[existingIndex] = mockTx;
} else {
    db.transactions.unshift(mockTx);
}

fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
console.log("Mock transaction injected successfully! Refresh the 'Transaksi' page to see it.");
