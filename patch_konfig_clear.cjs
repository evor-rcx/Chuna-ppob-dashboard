const fs = require('fs');
let code = fs.readFileSync('src/components/views/Konfig.tsx', 'utf8');

const targetStr = `              onChange={(e) => {
                setBgType(e.target.value);
                localStorage.setItem('chuna_bg_type', e.target.value);
                window.dispatchEvent(new Event('chuna_bg_update'));
              }}`;

const replacementStr = `              onChange={async (e) => {
                setBgType(e.target.value);
                localStorage.setItem('chuna_bg_type', e.target.value);
                await clearBgFile();
                setBgUrl('');
                window.dispatchEvent(new Event('chuna_bg_update'));
              }}`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/views/Konfig.tsx', code);
