import { Router } from "express";
import { prisma } from "../lib/prisma";

export const frete = Router();

// Exemplo simples com filtros básicos + paginação
frete.get("/frete/disponibilidade", async (req, res, next) => {
  try {
    const uf = (req.query.uf as string | undefined)?.toUpperCase();
    const tipoProduto = (req.query.tipoProduto as string | undefined)?.toUpperCase() ?? "NAO_QUIMICO";
    const page = Number(req.query.page ?? 0);
    const size = Math.min(100, Number(req.query.size ?? 20));

    const quimico = tipoProduto === "QUIMICO";

    const where: any = { disponivelParaFrete: true };
    if (uf) where.uf = uf;
    if (typeof quimico === "boolean") where.quimicosControlados = quimico;

    const [items, total] = await Promise.all([
      prisma.transportadora.findMany({ where, orderBy: { razaoSocial: "asc" }, skip: page * size, take: size }),
      prisma.transportadora.count({ where })
    ]);

    res.json({ page, size, total, items });
  } catch (e) { next(e); }
});