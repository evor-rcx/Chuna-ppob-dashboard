const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import { CustomAlert } from './components/CustomAlert';")) {
  code = code.replace("import { Login } from './components/views/Login';", "import { Login } from './components/views/Login';\nimport { CustomAlert } from './components/CustomAlert';");
  
  const returnStr = `    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 font-sans flex justify-center relative">`;
  const returnReplacement = `    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 font-sans flex justify-center relative">\n      <CustomAlert />`;
  
  code = code.replace(returnStr, returnReplacement);
  
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx");
} else {
  console.log("Already patched");
}
