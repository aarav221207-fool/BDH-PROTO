import express from "express";
import path from "path";
import { execFile } from "child_process";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for BDH live analysis
  app.post("/api/analyze", (req, res) => {
    const startTime = Date.now();
    const text = req.body?.text || "The dragon flew over the city.";

    if (typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid input: 'text' field must be a non-empty string.",
        fallback: true
      });
    }

    const scriptPath = path.join(process.cwd(), "lib", "bdh_instrument.py");

    execFile(
      "python3",
      [scriptPath, text],
      { maxBuffer: 20 * 1024 * 1024 },
      (error, stdout, stderr) => {
        const totalMs = Date.now() - startTime;

        if (error) {
          console.error("Python Execution Error:", stderr || error.message);
          return res.status(500).json({
            success: false,
            error: stderr || error.message || "Failed to execute Python BDH instrumentation script.",
            fallback: true,
            server_measured_ms: totalMs
          });
        }

        try {
          const parsed = JSON.parse(stdout);
          if (parsed.error) {
            return res.status(500).json({
              success: false,
              error: parsed.error,
              traceback: parsed.traceback,
              fallback: true,
              server_measured_ms: totalMs
            });
          }

          return res.json({
            success: true,
            version: parsed.version || "1.0-live",
            model: parsed.model || "BDH (Dragon Hatchling)",
            total_params: parsed.total_params,
            input_entry: parsed.input_entry,
            benchmark: {
              ...parsed.benchmark,
              server_measured_ms: totalMs
            }
          });
        } catch (parseErr) {
          console.error("Failed to parse Python output:", stdout);
          return res.status(500).json({
            success: false,
            error: "Failed to parse Python instrumentation JSON output.",
            raw_stdout: stdout.substring(0, 1000),
            fallback: true,
            server_measured_ms: totalMs
          });
        }
      }
    );
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "bdh-inspector-api" });
  });

  // Vite middleware for dev or static serving for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BDH Inspector] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
