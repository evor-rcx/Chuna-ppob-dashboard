const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `      const msgText = "⚠️ *INFO KEAMANAN*\\n\\nAdmin telah mereset PIN Anda. Silakan balas pesan ini dengan *PIN BARU* Anda (6 angka) untuk mengamankan kembali akun Anda.";`;
const replacementStr = `      // Set fallback pin to 123456 just in case
      registeredUsers[matchedKey].pin = '123456';
      db.registeredUsers = registeredUsers;
      writeDB(db);
      
      const msgText = "⚠️ *INFO KEAMANAN*\\n\\nAdmin telah mereset PIN Anda ke *123456*. Silakan balas pesan ini dengan *PIN BARU* Anda (6 angka) untuk mengamankan kembali akun Anda.";`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacementStr);
    fs.writeFileSync('server.ts', code);
    console.log("Updated server.ts with 123456 fallback");
} else {
    console.log("Target string not found in server.ts");
}
