// src/routes/registros.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { recalcDisponibilidade } from '../services/availability';

const prisma = new PrismaClient();
const router = Router();

// Create
router.post('/', async (req, res) => {
  try {
    const { transportadoraId, documentoId, numero, emissao, validade, arquivoUrl } = req.body || {};

    if (!transportadoraId || !documentoId || !validade) {
      return res.status(400).json({ error: 'transportadoraId, documentoId e validade são obrigatórios.' });
    }

    const data: any = {
      transportadoraId: Number(transportadoraId),
      documentoId: Number(documentoId),
      numero: numero ?? null,
      arquivoUrl: arquivoUrl ?? null,
      validade: new Date(validade),
    };
    if (emissao) data.emissao = new Date(emissao);

    if (isNaN(data.validade.getTime())) {
      return res.status(400).json({ error: 'validade inválida (use formato ISO ex.: 2025-12-31).' });
    }

    const created = await prisma.registroDocumento.create({ data });
    const disponivel = await recalcDisponibilidade(Number(transportadoraId));

    return res.status(201).json({ registro: created, disponivel });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Falha ao criar registro de documento.' });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const old = await prisma.registroDocumento.findUnique({ where: { id } });
    if (!old) return res.status(404).json({ error: 'Registro não encontrado.' });

    const { numero, emissao, validade, arquivoUrl, documentoId } = req.body || {};
    const data: any = {};
    if (typeof numero !== 'undefined') data.numero = numero;
    if (typeof arquivoUrl !== 'undefined') data.arquivoUrl = arquivoUrl;
    if (typeof documentoId !== 'undefined') data.documentoId = Number(documentoId);
    if (typeof emissao !== 'undefined') {
      const d = emissao ? new Date(emissao) : null;
      if (d && isNaN(d.getTime())) return res.status(400).json({ error: 'emissao inválida.' });
      data.emissao = d;
    }
    if (typeof validade !== 'undefined') {
      const d = new Date(validade);
      if (isNaN(d.getTime())) return res.status(400).json({ error: 'validade inválida.' });
      data.validade = d;
    }

    const updated = await prisma.registroDocumento.update({ where: { id }, data });
    const disponivel = await recalcDisponibilidade(old.transportadoraId);

    return res.json({ registro: updated, disponivel });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Falha ao atualizar registro de documento.' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const old = await prisma.registroDocumento.findUnique({ where: { id } });
    if (!old) return res.status(404).json({ error: 'Registro não encontrado.' });

    await prisma.registroDocumento.delete({ where: { id } });
    const disponivel = await recalcDisponibilidade(old.transportadoraId);

    return res.json({ ok: true, disponivel });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Falha ao excluir registro de documento.' });
  }
});

export default router;
