let registeredUsers = {
    '7376015219': { username: 'Lili', wa: '081350901128', pin: '123456' }
};

let members = [
    {"id":"MBR-7376015219","name":"Lili","whatsapp":"081350901128","telegram":"ID:7376015219","balance":32998,"type":"Biasa"}
];

const id = 'MBR-7376015219';
const memberIndex = members.findIndex(m => m.id === id);
if (memberIndex !== -1) {
    const member = members[memberIndex];
    members.splice(memberIndex, 1);
    
    let userId = id.replace('MBR-', '');
    if (member.telegram && member.telegram.startsWith('ID:')) {
        userId = member.telegram.substring(3);
    }
    
    if (registeredUsers[userId]) {
        delete registeredUsers[userId];
    } else {
        const keys = Object.keys(registeredUsers);
        const matchingKey = keys.find(k => String(k) === String(userId));
        if (matchingKey) {
            delete registeredUsers[matchingKey];
        }
    }
}
console.log("registeredUsers:", registeredUsers);
