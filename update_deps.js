const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
delete pkg.dependencies['canvas'];
delete pkg.dependencies['@napi-rs/canvas'];
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
