const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const oldReset = `  app.post("/api/members/:id/reset-pin", async (req, res) => {
    const { id } = req.params;
    const memberIndex = members.findIndex(m => m.id === id);
    if (memberIndex !== -1) {
      const userId = id.replace('MBR-', '');
      let found = false;
      let matchedKey = userId;`;

const newReset = `  app.post("/api/members/:id/reset-pin", async (req, res) => {
    const { id } = req.params;
    const memberIndex = members.findIndex(m => m.id === id);
    if (memberIndex !== -1) {
      const member = members[memberIndex];
      let userId = id.replace('MBR-', '');
      if (member.telegram && member.telegram.startsWith('ID:')) {
         userId = member.telegram.substring(3);
      }
      let found = false;
      let matchedKey = userId;`;

if (code.includes(oldReset)) {
    code = code.replace(oldReset, newReset);
    fs.writeFileSync('server.ts', code);
    console.log("Updated RESET PIN logic in server.ts");
} else {
    console.log("Could not find old RESET PIN logic");
}
