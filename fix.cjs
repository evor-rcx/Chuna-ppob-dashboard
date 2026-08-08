const fs = require('fs');
let code = fs.readFileSync('src/components/views/Konfig.tsx', 'utf8');
if (!code.includes("import { clearBgFile }")) {
  code = code.replace("import { PageContainer }", "import { PageContainer } from '../PageContainer';\nimport { clearBgFile, saveBgFile } from '../../lib/bgStore';");
  fs.writeFileSync('src/components/views/Konfig.tsx', code);
  console.log("Fixed Konfig.tsx");
}
