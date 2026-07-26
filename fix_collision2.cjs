const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Find the prepaid brands block
let p1 = code.indexOf('// Check prepaid brands');
let p2 = code.indexOf('// Check pasca brands', p1);
let p3 = code.indexOf('bot.on("photo"', p2);

console.log("Found indices:", p1, p2, p3);

function reorderBlock(blockName, codeSection, brandCheckStr, productCheckStr) {
    let brandIdx = codeSection.indexOf(brandCheckStr);
    let productIdx = codeSection.indexOf(productCheckStr);
    
    if (brandIdx === -1 || productIdx === -1) {
        console.log("Could not find blocks for", blockName);
        return codeSection;
    }
    
    // We want to extract the product check block and move it BEFORE the brand check block.
    // Let's find the end of the brand check block.
    // It ends right before productCheckStr.
    
    let beforeBrand = codeSection.substring(0, brandIdx);
    let brandBlock = codeSection.substring(brandIdx, productIdx);
    let productBlock = codeSection.substring(productIdx);
    
    // BUT wait! There's a `catch (e)` at the end of the whole try-catch.
    let catchIdx = productBlock.indexOf('} catch (e) {');
    if (catchIdx !== -1) {
        let actualProductBlock = productBlock.substring(0, catchIdx);
        let afterProduct = productBlock.substring(catchIdx);
        return beforeBrand + actualProductBlock + brandBlock + afterProduct;
    } else {
        return beforeBrand + productBlock + brandBlock;
    }
}

// 1. Reorder prepaid
let prepaidBlock = code.substring(p1, p2);
let newPrepaidBlock = reorderBlock('prepaid', prepaidBlock, 
    'if (prepaidBrands.includes(text)) {',
    '// Also check if text is a prepaid product name!');

// 2. Reorder pasca
let pascaBlock = code.substring(p2, p3);
let newPascaBlock = reorderBlock('pasca', pascaBlock,
    'if (pascaBrands.includes(text)) {',
    '// Also check if text is a pasca product name!');

if (newPrepaidBlock !== prepaidBlock || newPascaBlock !== pascaBlock) {
    code = code.substring(0, p1) + newPrepaidBlock + newPascaBlock + code.substring(p3);
    fs.writeFileSync('server.ts', code);
    console.log("Successfully reordered!");
} else {
    console.log("No changes made.");
}
