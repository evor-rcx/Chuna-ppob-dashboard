import re
with open("server.ts", "r") as f:
    content = f.read()

pattern = r'app\.get\("\*", \(req, res\)$'
replacement = """app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  
  // Enable graceful stop
  process.once('SIGINT', () => bot && bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot && bot.stop('SIGTERM'));
}

startServer();"""

content = re.sub(pattern, replacement, content)
with open("server.ts", "w") as f:
    f.write(content)
