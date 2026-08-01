const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `import fs from "fs";`;
const replacementStr = `import fs from "fs";\nimport dotenv from "dotenv";\ndotenv.config();\nimport { z } from "zod";`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', code);
