const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Use createRequire for btch-downloader
if (!code.includes("import { createRequire }")) {
    code = code.replace(/import express from "express";/, 'import express from "express";\nimport { createRequire } from "module";\nconst require = createRequire(import.meta.url);');
}

code = code.replace(/const btch = \(await import\('btch-downloader'\)\).default \|\| await import\('btch-downloader'\);/g, "const btch = require('btch-downloader');");

fs.writeFileSync('server.ts', code);
console.log("Patched back to require!");
