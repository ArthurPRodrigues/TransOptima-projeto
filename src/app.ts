import express from "express";
import cors from "cors";
import { routes } from "./routes";

export function buildApp() {
  const app = express();
  app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"], credentials: true }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use(routes);

  // error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err);
    res.status(400).json({ message: err?.message ?? "Erro" });
  });

  return app;
}