import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import prisma from "./prisma";

const router = Router();

/* --------------------------------- Uploads -------------------------------- */
fs.mkdirSync(path.resolve("uploads"), { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.resolve("uploads")),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${ts}-${safe}`);
  },
});
const upload = multer({ storage });

/* ------------------------------ Transportadoras --------------------------- */
// GET /api/transportadoras?page=0&size=10&q=trans&uf=SC
router.get("/api/transportadoras", async (req, res) => {
  const page = Math.max(0, Number(req.query.page ?? 0));
  const size = Math.min(100, Math.max(1, Number(req.query.size ?? 10)));
  const q = String(req.query.q ?? "").trim();
  const uf = String(req.query.uf ?? "").trim();

  const where: any = {};
  if (q) {
    where.OR = [
      { nome: { contains: q, mode: "insensitive" } },
      { cnpj: { contains: q } },
    ];
  }
  if (uf) where.uf = uf;

  const totalElements = await prisma.transportadora.count({ where });
  const content = await prisma.transportadora.findMany({
    where,
    skip: page * size,
    take: size,
    orderBy: { createdAt: "desc" },
  });

  res.json({
    content,
    totalElements,
    totalPages: Math.max(1, Math.ceil(totalElements / size)),
    page,
    size,
  });
});

// POST /api/transportadoras
router.post("/api/transportadoras", async (req, res) => {
  const { nome, cnpj, uf } = req.body ?? {};
  if (!nome || !cnpj || !uf) {
    return res.status(400).json({ error: "Campos obrigatórios: nome, cnpj, uf" });
  }
  try {
    const created = await prisma.transportadora.create({
      data: { nome, cnpj, uf },
    });
    return res.status(201).json(created);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

/* -------------------------------- Documentos ------------------------------ */
// GET /api/transportadoras/:id/documentos
router.get("/api/transportadoras/:id/documentos", async (req, res) => {
  const { id } = req.params;
  const docs = await prisma.documento.findMany({
    where: { transportadoraId: id },
    orderBy: { createdAt: "desc" },
  });
  res.json(docs);
});

// POST /api/transportadoras/:id/documentos  (multipart/form-data)
router.post(
  "/api/transportadoras/:id/documentos",
  upload.single("arquivo"),
  async (req, res) => {
    const { id } = req.params;
    const { tipo, vencimento } = (req.body ?? {}) as { tipo?: string; vencimento?: string };

    if (!tipo || !req.file) {
      return res.status(400).json({ error: "Campos obrigatórios: tipo e arquivo" });
    }

    let dt: Date | undefined = undefined;
    if (vencimento) {
      const tmp = new Date(vencimento);
      if (!isNaN(tmp.getTime())) dt = tmp;
    }

    const created = await prisma.documento.create({
      data: {
        tipo,
        nomeArquivo: req.file.originalname,
        vencimento: dt,
        valido: true,
        transportadoraId: id,
      },
    });

    res.status(201).json(created);
  }
);

/* ------------------------------- Dashboard -------------------------------- */
router.get("/api/dashboard/counts", async (_req, res) => {
  const transportadorasAtivas = await prisma.transportadora.count();

  // Regra provisória: indisponível quando disponivelParaFrete = false
  const indisponiveisParaFrete = await prisma.transportadora.count({
    where: { disponivelParaFrete: false },
  });

  const hoje = new Date();
  const daqui30 = new Date();
  daqui30.setDate(hoje.getDate() + 30);

  const documentosVencendo30d = await prisma.documento.count({
    where: {
      valido: true,
      vencimento: { not: null, lte: daqui30 },
    },
  });

  res.json({ transportadorasAtivas, documentosVencendo30d, indisponiveisParaFrete });
});

/* --------------------------------- Health --------------------------------- */
router.get("/api/health", (_req, res) => res.json({ ok: true }));

export default router;
