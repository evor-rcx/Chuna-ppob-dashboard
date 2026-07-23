with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("} catch (e) { console.error(\"Error in prepaidBrands check:\", e.message); }\n                    }\n                    })();)();", "} catch (e) { console.error(\"Error in prepaidBrands check:\", e.message); }\n                    })();")
content = content.replace("})();)();", "})();")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
