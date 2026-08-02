const fs = require('fs');
let code = fs.readFileSync('src/components/views/Konfig.tsx', 'utf8');

code = code.replace(
  /alert\("Gagal menyimpan file ke penyimpanan lokal\."\);/,
  "alert(\"Gagal menyimpan file: \" + (err instanceof Error ? err.message : String(err)) + \"\\n\\nJika file video terlalu besar, cobalah kompres ukurannya.\");"
);

fs.writeFileSync('src/components/views/Konfig.tsx', code);
