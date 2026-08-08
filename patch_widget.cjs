const fs = require('fs');
let code = fs.readFileSync('src/components/views/TransaksiWidget.tsx', 'utf8');
code = code.replace('import { formatRp } from "../../utils/formatRp";', 'const formatRp = (num: number) => `Rp ${num.toLocaleString("id-ID")}`;');
fs.writeFileSync('src/components/views/TransaksiWidget.tsx', code);
console.log("Patched TransaksiWidget.tsx");
