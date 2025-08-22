// src/routes/relatorios.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /relatorios/vencidos?formato=json|csv
 * Retorna registros ATIVOS com validade < hoje.
 */
router.get('/vencidos', async (req, res) => {
  try {
    const format = (req.query.formato || 'json').toString().toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rows = await prisma.registroDocumento.findMany({
      where: { ativo: true, validade: { lt: today } },
      include: { transportadora: true, documento: true },
      orderBy: [{ transportadoraId: 'asc' }, { documentoId: 'asc' }],
    });

    if (format === 'csv') {
      const header = 'transportadoraId,razaoSocial,uf,documento,validade\n';
      const body = rows
        .map((r) => {
          const v = new Date(r.validade).toISOString().slice(0, 10);
          const razao = (r.transportadora?.razaoSocial || '').replace(/,/g, ' ');
          const uf = (r.transportadora as any)?.uf || ''; // se não tiver UF no schema, fica vazio
          const doc = (r.documento?.nome || '').replace(/,/g, ' ');
          return `${r.transportadoraId},${razao},${uf},${doc},${v}`;
        })
        .join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="vencidos.csv"');
      res.setHeader('Cache-Control', 'no-store');
      return res.send(header + body + '\n');
    }

    return res.json({ total: rows.length, itens: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Falha ao gerar relatório.' });
  }
});

export default router;
