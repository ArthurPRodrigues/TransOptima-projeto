// src/router.ts
import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import prisma from "./prisma";

const router = Router();

// Garante a pasta 'uploads'
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

/** Utils */
function onlyDigits(cnpj: string) {
  return (cnpj || "").replace(/\D+/g, "");
}

/* ==================== Transportadoras ==================== */

// Criar transportadora
router.post("/transportadoras", async (req, res) => {
  try {
    const { nome, cnpj, uf, quimicosControlados } = req.body;
    const cnpjNum = onlyDigits(cnpj);
    const created = await prisma.transportadora.create({
      data: { nome, cnpj: cnpjNum, uf, quimicosControlados: !!quimicosControlados },
    });
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Listar transportadoras com filtros opcionais
router.get("/transportadoras", async (req, res) => {
  try {
    const { uf, disponivelParaFrete } = req.query as any;
    const list = await prisma.transportadora.findMany({
      where: {
        uf: uf || undefined,
        ...(disponivelParaFrete !== undefined
          ? { disponivelParaFrete: String(disponivelParaFrete) === "true" }
          : {}),
      },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, cnpj: true, uf: true, disponivelParaFrete: true },
    });
    res.json(list);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Obter transportadora por CNPJ
router.get("/transportadoras/:cnpj", async (req, res) => {
  try {
    const cnpj = onlyDigits(req.params.cnpj);
    const t = await prisma.transportadora.findUnique({ where: { cnpj } });
    if (!t) return res.status(404).json({ error: "Transportadora não encontrada" });
    res.json(t);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

/* ==================== Tipos de Documento ==================== */

// Listar tipos
router.get("/tipos-documento", async (_req, res) => {
  const tipos = await prisma.tipoDocumento.findMany({ orderBy: { nome: "asc" } });
  res.json(tipos);
});

// Criar/atualizar tipo
router.post("/tipos-documento", async (req, res) => {
  try {
    const { nome, slug, diasAviso = 30, obrigatorio = true } = req.body;
    const up = await prisma.tipoDocumento.upsert({
      where: { slug },
      update: { nome, diasAviso: Number(diasAviso), obrigatorio: !!obrigatorio },
      create: { nome, slug, diasAviso: Number(diasAviso), obrigatorio: !!obrigatorio },
    });
    res.status(201).json(up);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

/* ==================== Documentos (por CNPJ) ==================== */

// Upload de documento (multipart/form-data)
// Campos: file (input name 'file')
//         tipoDocumentoId OU tipoSlug (obrigatório um dos dois)
//         validade (opcional, ISO: YYYY-MM-DD)
//         observacoes (opcional)
router.post(
  "/transportadoras/:cnpj/documentos",
  upload.single("file"),
  async (req, res) => {
    try {
      const cnpj = onlyDigits(req.params.cnpj);
      const t = await prisma.transportadora.findUnique({ where: { cnpj } });
      if (!t) return res.status(404).json({ error: "Transportadora não encontrada" });

      const { tipoDocumentoId, tipoSlug, validade, observacoes } = req.body;
      const file = req.file;
      if (!file) return res.status(400).json({ error: "Arquivo (file) é obrigatório" });

      let tipo = null;
      if (tipoDocumentoId) {
        tipo = await prisma.tipoDocumento.findUnique({ where: { id: String(tipoDocumentoId) } });
      } else if (tipoSlug) {
        tipo = await prisma.tipoDocumento.findUnique({ where: { slug: String(tipoSlug) } });
      }
      if (!tipo) return res.status(400).json({ error: "Tipo de documento inválido" });

      const created = await prisma.documento.create({
        data: {
          transportadoraId: t.id,
          tipoDocumentoId: tipo.id,
          nomeOriginal: file.originalname,
          caminhoArquivo: path.relative(process.cwd(), file.path),
          mimeType: file.mimetype,
          tamanhoBytes: file.size,
          validade: validade ? new Date(validade) : null,
          observacoes: observacoes || null,
        },
      });

      res.status(201).json(created);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
);

// Listar documentos por CNPJ com filtros
// Query params: ?tipoSlug=anvisa&vencendoEmDias=20&vencidos=true&validosAte=2025-12-31
router.get("/transportadoras/:cnpj/documentos", async (req, res) => {
  try {
    const cnpj = onlyDigits(req.params.cnpj);
    const t = await prisma.transportadora.findUnique({ where: { cnpj } });
    if (!t) return res.status(404).json({ error: "Transportadora não encontrada" });

    const { tipoSlug, vencendoEmDias, vencidos, validosAte } = req.query as any;

    let tipoFilter: any = undefined;
    if (tipoSlug) {
      const tipo = await prisma.tipoDocumento.findUnique({ where: { slug: String(tipoSlug) } });
      if (tipo) tipoFilter = { tipoDocumentoId: tipo.id };
      else return res.json([]); // tipo não existe => retorna vazio
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

    const documentos = await prisma.documento.findMany({
      where: {
        transportadoraId: t.id,
        ...(tipoFilter || {}),
        ...(Object.keys(whereValidade).length ? whereValidade : {}),
      },
      orderBy: [{ validade: "asc" }, { createdAt: "desc" }],
      include: { tipo: true },
    });

    res.json(documentos);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Download do arquivo
router.get("/documentos/:id/download", async (req, res) => {
  try {
    const doc = await prisma.documento.findUnique({
      where: { id: String(req.params.id) },
      include: { tipo: true, transportadora: true },
    });
    if (!doc) return res.status(404).json({ error: "Documento não encontrado" });

    const abs = path.resolve(doc.caminhoArquivo);
    if (!fs.existsSync(abs)) return res.status(404).json({ error: "Arquivo não está disponível no servidor" });

    res.download(abs, doc.nomeOriginal);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Excluir documento
router.delete("/documentos/:id", async (req, res) => {
  try {
    const doc = await prisma.documento.findUnique({ where: { id: String(req.params.id) } });
    if (!doc) return res.status(404).json({ error: "Documento não encontrado" });

    const abs = path.resolve(doc.caminhoArquivo);
    try {
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch {}

    await prisma.documento.delete({ where: { id: doc.id } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
