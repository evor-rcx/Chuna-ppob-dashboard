const members = [{"id":"MBR-1783330394737","name":"Lio","whatsapp":"085169949218","telegram":"","balance":51095,"type":"Biasa"},{"id":"MBR-7376015219","name":"Lili","whatsapp":"081350901128","telegram":"ID:7376015219","balance":32998,"type":"Biasa"}];
const userId = 7376015219;
const memberId = `MBR-${userId}`;
const isTelegramMatch = (telegram, userId, username) => {
    if (!telegram || !userId) return false;
    let parts = [];
    if (Array.isArray(telegram)) {
        parts = telegram.map(s => String(s).trim().toLowerCase());
    } else {
        parts = String(telegram).split(',').map(s => s.trim().toLowerCase());
    }
    const idStr = userId.toString().toLowerCase();
    const idPrefixed = `id:${idStr}`;
    const un = username ? (username.startsWith('@') ? username.toLowerCase() : `@${username.toLowerCase()}`) : null;
    return parts.includes(idStr) || parts.includes(idPrefixed) || (un && parts.includes(un));
};

const member = members.find(m => m.id === memberId || isTelegramMatch(m.telegram, userId, null));
console.log("member:", member);
