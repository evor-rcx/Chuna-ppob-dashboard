import re

with open("server.ts", "r") as f:
    content = f.read()

# Fix detail block for tagihan
content = re.sub(
    r"let detail = \"\";\s*if \(result\.desc && result\.desc\.detail\) \{\s*detail = \"\\n\\n\" \+ result\.desc\.detail;\s*\}",
    r"""let detail = "";
                         if (result.desc && result.desc.detail) {
                             if (Array.isArray(result.desc.detail)) {
                                 let parts = [];
                                 for (const d of result.desc.detail) {
                                     let str = "";
                                     for (const key in d) { str += `${key}: ${d[key]}\\n`; }
                                     parts.push(str);
                                 }
                                 detail = "\\n\\n" + parts.join('\\n');
                             } else if (typeof result.desc.detail === 'object') {
                                 let parts = [];
                                 for (const key in result.desc.detail) { parts.push(`${key}: ${result.desc.detail[key]}`); }
                                 detail = "\\n\\n" + parts.join('\\n');
                             } else {
                                 detail = "\\n\\n" + result.desc.detail;
                             }
                             // filter admin and total out of detail
                             detail = detail.split('\\n').filter(l => !l.toLowerCase().includes('admin') && !l.toLowerCase().includes('total')).join('\\n');
                         }""",
    content
)

with open("server.ts", "w") as f:
    f.write(content)
