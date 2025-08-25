import { Router } from "express";
import prisma from "../lib/prisma";

const r = Router();

// Lista registros por transportadora
r.get("/:transportadoraId", async (req, res) => {
  const { transportadoraId } = req.params;
  const rows = await prisma.registroDocumento.findMany({
    where: { transportadoraId },
    include: { documento: true }
  });
  res.json(rows);
});

// Cria/atualiza registro de documento
r.post("/", async (req, res) => {
  const { transportadoraId, documentoId, validade } = req.body;

  const upserted = await prisma.registroDocumento.upsert({
    where: { transportadoraId_documentoId: { transportadoraId, documentoId } },
    update: { validade: new Date(validade) },
    create: { transportadoraId, documentoId, validade: new Date(validade) }
  });

  res.status(201).json(upserted);
});

export default r;
