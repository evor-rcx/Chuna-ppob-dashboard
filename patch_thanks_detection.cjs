const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `if (lowerText.includes("makasih") || lowerText.includes("mksih") || lowerText.includes("makasi") || lowerText.includes("terima kasih") || lowerText.includes("thanks") || lowerText.includes("tq") || lowerText.includes("suwun")) {`;

const replacement = `const thankYouWords = [
            "makasih", "mksih", "makasi", "terima kasih", "terimakasih", "suwun", "hatur nuhun", "trmks", "mksi", "mks", "trimakasih", "thx", "tq",
            "thanks", "thank you", "ty", "thankyou",
            "arigatou", "arigato", "ありがとう", "az",
            "gomawo", "kamsahamnida", "고마워", "감사합니다",
            "xiexie", "xie xie", "谢谢",
            "syukron", "shukran", "شكرا"
        ];
        if (thankYouWords.some(word => lowerText.includes(word))) {`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched successfully!");
} else {
    console.log("Target string not found.");
}
