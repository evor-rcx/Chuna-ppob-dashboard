import re

with open("server.ts", "r") as f:
    content = f.read()

# Modify parseAnnouncementText to avoid double prefix
def_start = "async function parseAnnouncementText(text: string) {"
pos = content.find(def_start)
if pos != -1:
    # Let's find the closing of the try-catch for holiday
    end_prefix_logic = 'prefix += "";'
    end_pos = content.find(end_prefix_logic, pos)
    
    if end_pos != -1:
        before = content[:pos]
        after = content[end_pos + len(end_prefix_logic):]
        
        new_logic = """async function parseAnnouncementText(text: string) {
    let prefix = "";
    // Hanya tambahkan prefix jika text belum mengandung kata pengumuman
    if (!text.toLowerCase().includes("pengumuman e4 store")) {
        prefix = "📢 *PENGUMUMAN E4 STORE* 📢\\n";
        try {
            const { getHolidayInfo } = await import('./src/utils/holidays');
            const holiday = getHolidayInfo(new Date());
            if (holiday) {
                prefix += `🗓️ Info Hari: ${holiday.text}\\n`;
            }
        } catch(e) {
            console.error("Failed to load holiday info", e);
        }
        prefix += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n";
    }
"""
        with open("server.ts", "w") as f:
            f.write(before + new_logic + after)
        print("Fixed prefix logic.")
