import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { recalcForTransportadora } from "../services/availability";

export const transportadoras = Router();

const createSchema = z.object({
  razaoSocial: z.string().min(2),
  cnpj: z.string().min(11),
  uf: z.string().length(2),
  quimicosControlados: z.boolean().optional().default(false)
});

transportadoras.post("/transportadoras", async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const t = await prisma.transportadora.create({ data });
    await recalcForTransportadora(t.id);
    res.status(201).json(t);
  } catch (e) { next(e); }
});

transportadoras.get("/transportadoras", async (_req, res, next) => {
  try {
    const list = await prisma.transportadora.findMany({ orderBy: { razaoSocial: "asc" } });
    res.json(list);
  } catch (e) { next(e); }
});

transportadoras.get("/transportadoras/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const t = await prisma.transportadora.findUnique({ where: { id } });
    if (!t) return res.status(404).json({ message: "Não encontrada" });
    res.json(t);
  } catch (e) { next(e); }
});

// Documentos da transportadora
const regDocSchema = z.object({
  documentoId: z.number().int().optional(),
  documentoCodigo: z.string().optional(),
  validade: z.string().datetime({ offset: false }).optional(), // ISO yyyy-mm-dd ou yyyy-mm-ddTHH:MM:SS
  urlArquivo: z.string().url().optional()
}).refine(d => d.documentoId || d.documentoCodigo, {
  message: "Informe documentoId ou documentoCodigo"
});

transportadoras.get("/transportadoras/:id/documentos", async (req, res, next) => {
  try {
    const transportadoraId = Number(req.params.id);
    const docs = await prisma.registroDocumento.findMany({
      where: { transportadoraId },
      include: { documento: true }
    });
    res.json(docs);
  } catch (e) { next(e); }
});

transportadoras.post("/transportadoras/:id/documentos", async (req, res, next) => {
  try {
    const transportadoraId = Number(req.params.id);
    const data = regDocSchema.parse(req.body);

    let documentoId = data.documentoId ?? null;
    if (!documentoId && data.documentoCodigo) {
      const doc = await prisma.documento.findUnique({ where: { codigo: data.documentoCodigo } });
      if (!doc) return res.status(400).json({ message: "Documento código inválido" });
      documentoId = doc.id;
    }

    const created = await prisma.registroDocumento.create({
      data: {
        transportadoraId,
        documentoId: documentoId!,
        validade: data.validade ? new Date(data.validade) : null,
        urlArquivo: data.urlArquivo ?? null
      }
    });

    await recalcForTransportadora(transportadoraId);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

transportadoras.delete("/transportadoras/:id/documentos/:registroId", async (req, res, next) => {
  try {
    const transportadoraId = Number(req.params.id);
    const registroId = Number(req.params.registroId);
    await prisma.registroDocumento.delete({ where: { id: registroId } });
    await recalcForTransportadora(transportadoraId);
    res.status(204).send();
  } catch (e) { next(e); }
});