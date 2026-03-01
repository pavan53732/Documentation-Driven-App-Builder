import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "project-state.json");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API routes
  app.get("/api/state", async (req, res) => {
    try {
      const data = await fs.readFile(DATA_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (err: any) {
      if (err.code === "ENOENT") {
        res.json(null);
      } else {
        res.status(500).json({ error: "Failed to read state" });
      }
    }
  });

  app.post("/api/state", async (req, res) => {
    try {
      const data = JSON.stringify(req.body, null, 2);
      const tempFile = `${DATA_FILE}.tmp`;
      
      // Atomic write: write to temp file, then rename
      await fs.writeFile(tempFile, data, "utf-8");
      await fs.rename(tempFile, DATA_FILE);
      
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to save state:", err);
      res.status(500).json({ error: "Failed to save state" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
