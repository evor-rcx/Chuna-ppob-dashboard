const fs = require('fs');

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

let registeredUsers = db.registeredUsers || {};
let members = db.members || [];

let deletedCount = 0;
for (const userId of Object.keys(registeredUsers)) {
    // Check if there is a member with telegram === 'ID:' + userId
    // OR if there is a member with id === 'MBR-' + userId
    const exists = members.some(m => {
        if (m.telegram === 'ID:' + userId) return true;
        if (m.id === 'MBR-' + userId) return true;
        
        // Also check if WA matches (just in case they were added as offline member and not linked yet)
        const cleanUserWa = registeredUsers[userId].wa.replace(/\\D/g, "").replace(/^0/, "62");
        const mWa = m.whatsapp.replace(/\\D/g, "").replace(/^0/, "62");
        if (mWa === cleanUserWa) return true;
        
        return false;
    });
    
    if (!exists) {
        console.log("Found orphan registeredUser:", userId, registeredUsers[userId]);
        delete registeredUsers[userId];
        deletedCount++;
    }
}

if (deletedCount > 0) {
    db.registeredUsers = registeredUsers;
    fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
    console.log("Deleted", deletedCount, "orphans");
} else {
    console.log("No orphans found");
}
