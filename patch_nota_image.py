import re

with open("server.ts", "r") as f:
    content = f.read()

# Let's find app.get("/api/nota/:id"
target = 'app.get("/api/nota/:id", (req, res) => {'

image_route = """app.get("/api/nota/:id/image", async (req, res) => {
    const { id } = req.params;
    const tx = db.transactions.find(t => t.id === id);
    if (!tx) {
        return res.status(404).send("Nota tidak ditemukan.");
    }
    const buffer = await generateCanvasReceipt("nota", tx);
    if (buffer) {
        res.setHeader('Content-Type', 'image/png');
        res.send(buffer);
    } else {
        res.status(500).send("Gagal generate gambar");
    }
});

app.get("/api/nota/:id", (req, res) => {"""

if image_route not in content:
    content = content.replace(target, image_route)

with open("server.ts", "w") as f:
    f.write(content)
print("done")
