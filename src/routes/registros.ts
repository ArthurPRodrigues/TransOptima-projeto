// src/routes/registros.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { recalcDisponibilidade } from '../services/availability';

const prisma = new PrismaClient();
const router = Router();

/**
 * Helper simples de data válida (YYYY-MM-DD, etc.)
 */
function parseDateOrNull(v: unknown): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
}

/**
 * CREATE
 * RN01: antes de criar, desativa qualquer registro ATIVO do mesmo par
 *       (transportadoraId, documentoId), preservando histórico.
 */
router.post('/', async (req, res) => {
  try {
    const { transportadoraId, documentoId, numero, emissao, validade, arquivoUrl } = req.body || {};

    if (!transportadoraId || !documentoId || !validade) {
      return res.status(400).json({ error: 'transportadoraId, documentoId e validade são obrigatórios.' });
    }

    const tId = Number(transportadoraId);
    const dId = Number(documentoId);
    const dtVal = parseDateOrNull(validade);
    const dtEmi = parseDateOrNull(emissao);

    if (!Number.isFinite(tId) || !Number.isFinite(dId)) {
      return res.status(400).json({ error: 'transportadoraId/documentoId inválidos.' });
    }
    if (!dtVal) {
      return res.status(400).json({ error: 'validade inválida (use YYYY-MM-DD).' });
    }
    if (emissao && !dtEmi) {
      return res.status(400).json({ error: 'emissao inválida.' });
    }

    // RN01: exclusividade de ATIVO por par
    await prisma.registroDocumento.updateMany({
      where: { transportadoraId: tId, documentoId: dId, ativo: true },
      data: { ativo: false },
    });

    const created = await prisma.registroDocumento.create({
      data: {
        transportadoraId: tId,
        documentoId: dId,
        numero: numero ?? null,
        arquivoUrl: arquivoUrl ?? null,
        emissao: dtEmi ?? undefined,
        validade: dtVal,
        ativo: true,
      },
    });

    const disponivel = await recalcDisponibilidade(tId);
    return res.status(201).json({ registro: created, disponivel });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Falha ao criar registro de documento.' });
  }
});

/**
 * UPDATE
 * Se após o update o registro permanecer ATIVO, garante RN01 desativando
 * outros ativos do mesmo par (transportadoraId/documentoId).
 */
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido.' });

    const old = await prisma.registroDocumento.findUnique({ where: { id } });
    if (!old) return res.status(404).json({ error: 'Registro não encontrado.' });

    const { numero, emissao, validade, arquivoUrl, documentoId, transportadoraId, ativo } = req.body || {};

    const data: any = {};
    if (typeof numero !== 'undefined') data.numero = numero;
    if (typeof arquivoUrl !== 'undefined') data.arquivoUrl = arquivoUrl;

    if (typeof documentoId !== 'undefined') {
      const dId = Number(documentoId);
      if (!Number.isFinite(dId)) return res.status(400).json({ error: 'documentoId inválido.' });
      data.documentoId = dId;
    }
    if (typeof transportadoraId !== 'undefined') {
      const tId = Number(transportadoraId);
      if (!Number.isFinite(tId)) return res.status(400).json({ error: 'transportadoraId inválido.' });
      data.transportadoraId = tId;
    }

    if (typeof emissao !== 'undefined') {
      const dtEmi = emissao ? parseDateOrNull(emissao) : null;
      if (emissao && !dtEmi) return res.status(400).json({ error: 'emissao inválida.' });
      data.emissao = dtEmi;
    }
    if (typeof validade !== 'undefined') {
      const dtVal = parseDateOrNull(validade);
      if (!dtVal) return res.status(400).json({ error: 'validade inválida.' });
      data.validade = dtVal;
    }

    if (typeof ativo !== 'undefined') {
      data.ativo = Boolean(ativo);
    }

    const updated = await prisma.registroDocumento.update({ where: { id }, data });

    // RN01: se o registro ficou ATIVO, desativa outros ativos do mesmo par
    if (updated.ativo) {
      const pairTransportadoraId = updated.transportadoraId;
      const pairDocumentoId = updated.documentoId;
      await prisma.registroDocumento.updateMany({
        where: {
          id: { not: updated.id },
          transportadoraId: pairTransportadoraId,
          documentoId: pairDocumentoId,
          ativo: true,
        },
        data: { ativo: false },
      });
    }

    const disponivel = await recalcDisponibilidade(updated.transportadoraId);
    return res.json({ registro: updated, disponivel });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Falha ao atualizar registro de documento.' });
  }
});

/**
 * DELETE
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido.' });

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
