const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("import { fetchTiktok } from './downloader';")) {
    code = code.replace(/import express from "express";/, 'import express from "express";\nimport { fetchTiktok } from "./downloader";');
    fs.writeFileSync('server.ts', code);
    console.log("Import added");
}

code = code.replace(/const \{ getRealUrl, fetchTiktok \} = require\('\.\/downloader'\);/g, '');
fs.writeFileSync('server.ts', code);

