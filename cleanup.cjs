const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace `selectedPkg` with `selectedKodebayarPkg` in KODEBAYAR_SELECT_PACKAGE
code = code.replace(/const selectedPkg = state\.data\.kodebayarPackages/g, 'const selectedKodebayarPkg = state.data.kodebayarPackages');
code = code.replace(/if \(!selectedPkg\)/g, 'if (!selectedKodebayarPkg)');
code = code.replace(/selectedPkg\.name/g, 'selectedKodebayarPkg.name');
code = code.replace(/generateKodeBayar\(state\.data\.customerNo, selectedPkg,/g, 'generateKodeBayar(state.data.customerNo, selectedKodebayarPkg,');

// Delete the old BYU_SELECT_PACKAGE and old logic block at 4030
const oldLogicStart = `                // --- BY.U Auto Kode Bayar ---`;
const oldLogicEnd = `                }
                try {
                    const result = await checkPascaBill(product.buyer_sku_code, finalCustomerNo);`;
                    
const idxStart = code.lastIndexOf(oldLogicStart);
if (idxStart !== -1) {
    const idxEnd = code.indexOf(oldLogicEnd, idxStart);
    if (idxEnd !== -1) {
        code = code.substring(0, idxStart) + `                try {\n                    const result = await checkPascaBill(product.buyer_sku_code, finalCustomerNo);` + code.substring(idxEnd + oldLogicEnd.length);
    }
}

const oldCaseStart = `            case 'BYU_SELECT_PACKAGE':`;
const oldCaseEnd = `            case 'PASCA_INPUT_NUMBER':`;
const idxCaseStart = code.indexOf(oldCaseStart);
if (idxCaseStart !== -1) {
    const idxCaseEnd = code.indexOf(oldCaseEnd, idxCaseStart);
    if (idxCaseEnd !== -1) {
        code = code.substring(0, idxCaseStart) + code.substring(idxCaseEnd);
    }
}

fs.writeFileSync('server.ts', code);
console.log("Cleanup done");
