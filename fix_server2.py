import re

with open("server.ts", "r") as f:
    content = f.read()

new_logic = """let cachedBgImage: any = null;
let font64: any = null;
let font32: any = null;

async function initJimp() {
    if (!font64) {
        font64 = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    }
    if (!font32) {
        font32 = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    }
    if (!cachedBgImage) {
        try {
            const bgPath = path.join(process.cwd(), 'src/assets/bg_nota.png');
            if (fs.existsSync(bgPath)) {
                cachedBgImage = await Jimp.read(bgPath);
            } else {
                throw new Error("File does not exist");
            }
        } catch (e: any) {
            console.error("Failed to load bg_nota.png, using white background. Error:", e.message);
            cachedBgImage = await new Promise((resolve, reject) => {
                new Jimp(1080, 1080, 0xFFFFFFFF, (err: any, image: any) => {
                    if (err) reject(err);
                    else resolve(image);
                });
            });
        }
    }
}"""

regex = r"let cachedBgImage: any = null;[\s\S]*?async function initJimp\(\) \{[\s\S]*?\}\n\}"
content = re.sub(regex, new_logic, content)

with open("server.ts", "w") as f:
    f.write(content)

