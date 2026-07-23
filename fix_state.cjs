const fs = require('fs');
let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
    'export function Sidebar() {',
    'export function Sidebar() {\n  const [videoError, setVideoError] = useState(false);'
);
fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

let login = fs.readFileSync('src/components/views/Login.tsx', 'utf8');
login = login.replace(
    'export function Login({ onLogin }: { onLogin: () => void }) {',
    'export function Login({ onLogin }: { onLogin: () => void }) {\n  const [videoError, setVideoError] = useState(false);'
);

if (!login.includes('useState')) {
    login = "import { useState } from 'react';\n" + login;
}

fs.writeFileSync('src/components/views/Login.tsx', login);
