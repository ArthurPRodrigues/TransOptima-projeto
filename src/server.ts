// src/server.ts
import express from "express";
import transportadorasRouter from "./routes/transportadoras.js";

const app = express();
app.use(express.json());

// Healthcheck simples (para saber se o servidor está vivo)
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});

// Rotas de Transportadoras (Passo 2)
app.use("/api/transportadoras", transportadorasRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TransOptima API on http://localhost:${PORT}`);
});
