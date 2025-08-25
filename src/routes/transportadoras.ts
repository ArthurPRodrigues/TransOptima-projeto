import { Router } from "express";
import prisma from "../prisma";
import { onlyDigits } from "../utils/cnpj";

const router = Router();

/** Criar */
router.post("/", async (req, res, next) => {
  try {
    const { nome, cnpj, uf, quimicosControlados } = req.body || {};
    if (!nome || !cnpj) throw new Error("Campos obrigatórios: nome e cnpj.");

    const created = await prisma.transportadora.create({
      data: {
        nome: String(nome).trim(),
        cnpj: onlyDigits(cnpj),
        uf: uf ? String(uf).toUpperCase().slice(0, 2) : null,
        quimicosControlados: !!quimicosControlados
      }
    });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

/** Listar (filtros: uf, disponivelParaFrete) */
router.get("/", async (req, res, next) => {
  try {
    const { uf, disponivelParaFrete } = req.query as any;
    const list = await prisma.transportadora.findMany({
      where: {
        uf: uf ? String(uf).toUpperCase().slice(0, 2) : undefined,
        ...(disponivelParaFrete !== undefined
          ? { disponivelParaFrete: String(disponivelParaFrete) === "true" }
          : {})
      },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, cnpj: true, uf: true, disponivelParaFrete: true }
    });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

/** Buscar por CNPJ */
router.get("/:cnpj", async (req, res, next) => {
  try {
    const cnpj = onlyDigits(req.params.cnpj);
    const t = await prisma.transportadora.findUnique({ where: { cnpj } });
    if (!t) return res.status(404).json({ error: "Transportadora não encontrada." });
    res.json(t);
  } catch (e) {
    next(e);
  }
});

/** Atualizar por CNPJ */
router.put("/:cnpj", async (req, res, next) => {
  try {
    const cnpj = onlyDigits(req.params.cnpj);
    const { nome, uf, quimicosControlados, disponivelParaFrete } = req.body || {};
    const updated = await prisma.transportadora.update({
      where: { cnpj },
      data: {
        ...(nome !== undefined ? { nome: String(nome).trim() } : {}),
        ...(uf !== undefined ? { uf: uf ? String(uf).toUpperCase().slice(0, 2) : null } : {}),
        ...(quimicosControlados !== undefined ? { quimicosControlados: !!quimicosControlados } : {}),
        ...(disponivelParaFrete !== undefined ? { disponivelParaFrete: !!disponivelParaFrete } : {})
      }
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

/** Deletar por CNPJ */
router.delete("/:cnpj", async (req, res, next) => {
  try {
    const cnpj = onlyDigits(req.params.cnpj);
    await prisma.transportadora.delete({ where: { cnpj } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
