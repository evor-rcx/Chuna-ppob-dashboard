const fs = require('fs');
let code = fs.readFileSync('src/components/views/Menu.tsx', 'utf8');

code = code.replace("import { TransaksiWidget } from './TransaksiWidget';\n", "");
code = code.replace("import { TransaksiWidget } from './TransaksiWidget';", "");
code = code.replace("<TransaksiWidget />", "");

fs.writeFileSync('src/components/views/Menu.tsx', code);
