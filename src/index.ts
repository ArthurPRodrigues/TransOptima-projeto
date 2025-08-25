import express from "express";
import path from "path";
import transportadoras from "./routes/transportadoras";
import tipoDocumento from "./routes/tipoDocumento";
import documentos from "./routes/documentos";
import { errorHandler } from "./middlewares/error";

const app = express();
app.use(express.json());

// Página inicial simples
app.get("/", (_req, res) => {
  res.send("TransOptima API está no ar. Experimente /api/health");
});

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, at: new Date().toISOString() });
});

// Arquivos enviados (estático)
app.use("/uploads", express.static(path.resolve(process.env.UPLOAD_DIR || "uploads")));

// Rotas da API
app.use("/api/transportadoras", transportadoras);
app.use("/api/tipos-documento", tipoDocumento);
app.use("/api", documentos); // contém /transportadoras/:cnpj/documentos e /documentos/:id/...

// Middleware de erro (fica por último)
app.use(errorHandler);

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`TransOptima API on http://localhost:${PORT}`);
});
