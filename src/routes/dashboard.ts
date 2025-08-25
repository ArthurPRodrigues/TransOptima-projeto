import { Router } from "express";
import prisma from "../prisma";

const router = Router();

/**
 * GET /api/dashboard/counts
 * - transportadorasAtivas: disponivelParaFrete = true
 * - indisponiveisParaFrete: disponivelParaFrete = false
 * - documentosVencendo30d: documentos com validade entre hoje e +30 dias
 */
router.get("/counts", async (_req, res, next) => {
  try {
    const now = new Date();
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);

    const [ativas, indisponiveis, vencendo] = await Promise.all([
      prisma.transportadora.count({ where: { disponivelParaFrete: true } }),
      prisma.transportadora.count({ where: { disponivelParaFrete: false } }),
      prisma.documento.count({
        where: {
          validade: { gte: now, lte: in30 },
        },
      }),
    ]);

    res.json({
      transportadorasAtivas: ativas,
      indisponiveisParaFrete: indisponiveis,
      documentosVencendo30d: vencendo,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
