import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import prisma from "../prisma";
import { onlyDigits } from "../utils/cnpj";

const router = Router();

// Pasta de uploads
const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${ts}-${safe}`);
  }
});
const upload = multer({ storage });

/** Helper: recalcula disponivelParaFrete */
async function recalcDisponibilidade(transportadoraId: string) {
  // pega os tipos obrigatórios
  const tiposObrigatorios = await prisma.tipoDocumento.findMany({ where: { obrigatorio: true } });
  const obrigatoriosIds = new Set(tiposObrigatorios.map(t => t.id));
  if (!obrigatoriosIds.size) return;

  const docs = await prisma.documento.findMany({
    where: { transportadoraId },
    include: { tipo: true }
  });

  const now = new Date();
  // para cada tipo obrigatório, precisa existir doc sem validade vencida (ou sem validade)
  const okPorTipo = new Map<string, boolean>();
  for (const t of tiposObrigatorios) okPorTipo.set(t.id, false);

  for (const d of docs) {
    if (!obrigatoriosIds.has(d.tipoDocumentoId)) continue;
    const valido = !d.validade || d.validade >= now;
    if (valido) okPorTipo.set(d.tipoDocumentoId, true);
  }

  const allOk = Array.from(okPorTipo.values()).every(Boolean);
  await prisma.transportadora.update({
    where: { id: transportadoraId },
    data: { disponivelParaFrete: allOk }
  });
}

/** Upload documento por CNPJ (file + tipoSlug ou tipoDocumentoId) */
router.post("/transportadoras/:cnpj/documentos", upload.single("file"), async (req, res, next) => {
  try {
    const cnpj = onlyDigits(req.params.cnpj);
    const t = await prisma.transportadora.findUnique({ where: { cnpj } });
    if (!t) return res.status(404).json({ error: "Transportadora não encontrada." });

    const file = req.file;
    if (!file) return res.status(400).json({ error: "Arquivo (file) é obrigatório." });

    const { tipoSlug, tipoDocumentoId, validade, observacoes } = req.body || {};
    let tipo = null;
    if (tipoDocumentoId) {
      tipo = await prisma.tipoDocumento.findUnique({ where: { id: String(tipoDocumentoId) } });
    } else if (tipoSlug) {
      tipo = await prisma.tipoDocumento.findUnique({ where: { slug: String(tipoSlug) } });
    }
    if (!tipo) return res.status(400).json({ error: "Tipo de documento inválido." });

    const created = await prisma.documento.create({
      data: {
        transportadoraId: t.id,
        tipoDocumentoId: tipo.id,
        nomeOriginal: file.originalname,
        caminhoArquivo: path.relative(process.cwd(), file.path),
        mimeType: file.mimetype,
        tamanhoBytes: file.size,
        validade: validade ? new Date(validade) : null,
        observacoes: observacoes || null
      }
    });

    // recalcular disponibilidade
    await recalcDisponibilidade(t.id);

    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

/** Listar documentos por CNPJ (filtros: tipoSlug, vencendoEmDias, vencidos, validosAte) */
router.get("/transportadoras/:cnpj/documentos", async (req, res, next) => {
  try {
    const cnpj = onlyDigits(req.params.cnpj);
    const t = await prisma.transportadora.findUnique({ where: { cnpj } });
    if (!t) return res.status(404).json({ error: "Transportadora não encontrada." });

    const { tipoSlug, vencendoEmDias, vencidos, validosAte } = req.query as any;

    let tipoFilter: any = undefined;
    if (tipoSlug) {
      const tipo = await prisma.tipoDocumento.findUnique({ where: { slug: String(tipoSlug) } });
      if (tipo) tipoFilter = { tipoDocumentoId: tipo.id };
      else return res.json([]);
    }

    const now = new Date();
    const whereValidade: any = {};
    if (vencendoEmDias) {
      const limite = new Date(now);
      limite.setDate(limite.getDate() + Number(vencendoEmDias));
      whereValidade.validade = { lte: limite, gte: now };
    }
    if (String(vencidos) === "true") {
      whereValidade.validade = { lt: now };
    }
    if (validosAte) {
      whereValidade.validade = { lte: new Date(String(validosAte)) };
    }

    const docs = await prisma.documento.findMany({
      where: {
        transportadoraId: t.id,
        ...(tipoFilter || {}),
        ...(Object.keys(whereValidade).length ? whereValidade : {})
      },
      include: { tipo: true },
      orderBy: [{ validade: "asc" }, { createdAt: "desc" }]
    });

    res.json(docs);
  } catch (e) {
    next(e);
  }
});

/** Download por id */
router.get("/documentos/:id/download", async (req, res, next) => {
  try {
    const doc = await prisma.documento.findUnique({ where: { id: String(req.params.id) } });
    if (!doc) return res.status(404).json({ error: "Documento não encontrado." });

    const abs = path.resolve(doc.caminhoArquivo);
    if (!fs.existsSync(abs)) return res.status(404).json({ error: "Arquivo não está disponível no servidor." });

    res.download(abs, doc.nomeOriginal);
  } catch (e) {
    next(e);
  }
});

/** Deletar documento por id */
router.delete("/documentos/:id", async (req, res, next) => {
  try {
    const doc = await prisma.documento.findUnique({ where: { id: String(req.params.id) } });
    if (!doc) return res.status(404).json({ error: "Documento não encontrado." });

    const abs = path.resolve(doc.caminhoArquivo);
    try {
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch {}

    await prisma.documento.delete({ where: { id: doc.id } });

    // recalcular disponibilidade
    await recalcDisponibilidade(doc.transportadoraId);

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/** Recalcular disponibilidade manualmente (se quiser forçar) */
router.post("/transportadoras/:cnpj/recalcular-disponibilidade", async (req, res, next) => {
  try {
    const cnpj = onlyDigits(req.params.cnpj);
    const t = await prisma.transportadora.findUnique({ where: { cnpj } });
    if (!t) return res.status(404).json({ error: "Transportadora não encontrada." });
    await recalcDisponibilidade(t.id);
    const updated = await prisma.transportadora.findUnique({ where: { id: t.id } });
    res.json({ ok: true, disponivelParaFrete: updated?.disponivelParaFrete });
  } catch (e) {
    next(e);
  }
});

export default router;
