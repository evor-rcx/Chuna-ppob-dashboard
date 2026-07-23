with open("server.ts", "r") as f:
    content = f.read()

target_start = """  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("/api/tagihan-nota", (req, res) => {"""

replacement_start = """  app.get("/api/tagihan-nota", (req, res) => {"""

# We need to move the `/api/tagihan-nota` route and others up.
# Actually, the problem is that `app.get('*', ...)` is probably at the end of the `else` block or somewhere.
