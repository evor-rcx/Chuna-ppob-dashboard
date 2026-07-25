const fs = require('fs');

function replaceInFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  const targetStr = '<img src="./logo.gif?v=3" alt="Logo" className="w-full h-full object-contain" />';
  const newStr = '<video src="./logo.mp4" autoPlay loop muted playsInline className="w-full h-full object-contain pointer-events-none" />';
  
  if(code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync(filePath, code);
    console.log("Patched " + filePath);
  } else {
    console.log("Not found in " + filePath);
  }
}

replaceInFile('src/components/views/Login.tsx');
replaceInFile('src/components/Sidebar.tsx');
