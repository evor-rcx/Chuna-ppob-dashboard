import re
with open("server.ts", "r") as f:
    content = f.read()

old_code = """  if (data.data && Array.isArray(data.data)) {
    productsCache[cacheKey].data = data.data;
    productsCache[cacheKey].timestamp = Date.now();
    return data.data;
  } else {
    throw new Error(data.data?.message || "Gagal mengambil produk");
  }"""

new_code = """  if (data.data && Array.isArray(data.data)) {
    productsCache[cacheKey].data = data.data;
    productsCache[cacheKey].timestamp = Date.now();
    return data.data;
  } else {
    if (productsCache[cacheKey].data) {
        console.warn("Digiflazz pricelist error, using stale cache:", data.data?.message);
        return productsCache[cacheKey].data; // Fallback to stale cache
    }
    throw new Error(data.data?.message || data.message || "Gagal mengambil produk");
  }"""

content = content.replace(old_code, new_code)

# Increase CACHE_TTL to 15 minutes to be safe with rate limits
content = content.replace("const CACHE_TTL = 5 * 60 * 1000; // 5 minutes", "const CACHE_TTL = 15 * 60 * 1000; // 15 minutes")

# Disable telegraf auto start
content = content.replace("await bot.launch();\n        console.log(\"Telegram bot auto-started successfully.\");", "// await bot.launch();\n        console.log(\"Telegram bot auto-started successfully (DISABLED in AI Studio to prevent 409 conflict).\");")

with open("server.ts", "w") as f:
    f.write(content)
