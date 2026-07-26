const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The exact strings to extract (regex)
const prepaidBrandRegex = /(\/\/ Check prepaid brands\s+try \{\s+const prepaid = await getDigiflazzProducts\("prepaid"\);\s+)(const prepaidBrands = \[\.\.\.new Set\(prepaid\.map\(\(p: any\) => p\.brand\)\)\]\.filter\(Boolean\);\s+if \(prepaidBrands\.includes\(text\)\) \{[\s\S]*?handled = true;\s+\}\s+\})/m;
const prepaidProductRegex = /(\/\/ Also check if text is a prepaid product name!\s+if \(!handled\) \{[\s\S]*?handled = true;\s+\}\s+\})/m;

let mBrand = code.match(prepaidBrandRegex);
let mProduct = code.match(prepaidProductRegex);

if (mBrand && mProduct) {
    // Remove the product block from its original position
    code = code.replace(mProduct[0], '');
    
    // Insert it right before the brand block
    // Change "if (!handled)" to "if (true)" just in case, but it's fine
    code = code.replace(mBrand[2], mProduct[0] + '\n                ' + mBrand[2]);
    console.log("Prepaid fixed.");
} else {
    console.log("Prepaid regex failed.");
}

const pascaBrandRegex = /(\/\/ Check pasca brands\s+try \{\s+const pasca = await getDigiflazzProducts\("pasca"\);\s+)(const pascaBrands = \[\.\.\.new Set\(pasca\.map\(\(p: any\) => p\.brand\)\)\]\.filter\(Boolean\);\s+if \(pascaBrands\.includes\(text\)\) \{[\s\S]*?handled = true;\s+\}\s+\})/m;
const pascaProductRegex = /(\/\/ Also check if text is a pasca product name!\s+if \(!handled\) \{[\s\S]*?handled = true;\s+\}\s+\})/m;

let pBrand = code.match(pascaBrandRegex);
let pProduct = code.match(pascaProductRegex);

if (pBrand && pProduct) {
    code = code.replace(pProduct[0], '');
    code = code.replace(pBrand[2], pProduct[0] + '\n                ' + pBrand[2]);
    console.log("Pasca fixed.");
} else {
    console.log("Pasca regex failed.");
}

fs.writeFileSync('server.ts', code);
