// src/routes/transportadoras.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { batchDisponibilidade } from '../services/availability';

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /transportadoras?uf=SC&produto=quimico
 * Requer que o model Transportadora tenha os campos:
 *   - uf: String
 *   - tiposProduto: String[]   (array no Postgres)
 */
router.get('/', async (req, res) => {
  try {
    const { uf, produto } = req.query as { uf?: string; produto?: string };

    // >>> ESTE É O TRECHO QUE VOCÊ PERGUNTOU “AONDE VAI?” <<<
    const where: any = {};
    if (uf) where.uf = uf.toString().toUpperCase();
    if (produto) where.tiposProduto = { has: produto.toString().toLowerCase() };
    // <<< FIM DO TRECHO >>>

    const items = await prisma.transportadora.findMany({
      where,
      orderBy: { id: 'asc' },
    });

    if (!items.length) return res.json({ disponiveis: [], indisponiveis: [] });

    const ids = items.map(t => t.id);
    const dispMap = await batchDisponibilidade(ids);

    const disponiveis: typeof items = [];
    const indisponiveis: typeof items = [];

    for (const t of items) {
      (dispMap.get(t.id) ? disponiveis : indisponiveis).push(t);
    }

    return res.json({ disponiveis, indisponiveis });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Falha ao listar transportadoras' });
  }
});

export default router;
