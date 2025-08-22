// src/routes/registros.ts
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { recalcDisponibilidade } from '../services/availability'

const prisma = new PrismaClient()
const r = Router()

/**
 * GET /registros?transportadoraId=1&documentoId=2
 * Lista registros, podendo filtrar por transportadora/documento.
 * Inclui o "documento" para facilitar o front.
 */
r.get('/', async (req, res) => {
  try {
    const where: any = {}
    if (req.query.transportadoraId) where.transportadoraId = Number(req.query.transportadoraId)
    if (req.query.documentoId) where.documentoId = Number(req.query.documentoId)

    const rows = await prisma.registroDocumento.findMany({
      where,
      orderBy: { id: 'desc' },
      include: { documento: true },
    })
    return res.json(rows)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Falha ao listar registros.' })
  }
})

/**
 * POST /registros
 * body: { transportadoraId, documentoId, validade (YYYY-MM-DD), emissao?, numero?, arquivoUrl? }
 * Regra: desativa o anterior ATIVO do mesmo par (transportadoraId, documentoId).
 */
r.post('/', async (req, res) => {
  try {
    const { transportadoraId, documentoId, numero, emissao, validade, arquivoUrl } = req.body || {}
    if (!transportadoraId || !documentoId || !validade) {
      return res
        .status(400)
        .json({ error: 'transportadoraId, documentoId e validade são obrigatórios.' })
    }

    const v = new Date(validade)
    if (isNaN(v.getTime())) {
      return res.status(400).json({ error: 'validade inválida (use YYYY-MM-DD).' })
    }

    const data: any = {
      transportadoraId: Number(transportadoraId),
      documentoId: Number(documentoId),
      validade: v,
      numero: numero ?? null,
      arquivoUrl: arquivoUrl ?? null,
      ativo: true,
    }

    if (typeof emissao !== 'undefined') {
      const e = emissao ? new Date(emissao) : null
      if (e && isNaN(e.getTime())) return res.status(400).json({ error: 'emissao inválida.' })
      data.emissao = e
    }

    // Desativar o registro anterior ATIVO para este par
    await prisma.registroDocumento.updateMany({
      where: {
        transportadoraId: data.transportadoraId,
        documentoId: data.documentoId,
        ativo: true,
      },
      data: { ativo: false },
    })

    // Criar o novo registro
    const created = await prisma.registroDocumento.create({ data })

    // Recalcular disponibilidade da transportadora
    const disponivel = await recalcDisponibilidade(data.transportadoraId)

    return res.status(201).json({ registro: created, disponivel })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Falha ao criar registro de documento.' })
  }
})

export default r
