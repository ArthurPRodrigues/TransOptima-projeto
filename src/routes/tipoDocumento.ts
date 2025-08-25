import { Router } from "express";
import prisma from "../prisma";

const router = Router();

/** Listar */
router.get("/", async (_req, res, next) => {
  try {
    const tipos = await prisma.tipoDocumento.findMany({ orderBy: { nome: "asc" } });
    res.json(tipos);
  } catch (e) {
    next(e);
  }
});

/** Criar */
router.post("/", async (req, res, next) => {
  try {
    const { nome, slug, diasAviso = 30, obrigatorio = true } = req.body || {};
    if (!nome || !slug) throw new Error("Campos obrigatórios: nome e slug.");
    const created = await prisma.tipoDocumento.create({
      data: { nome, slug, diasAviso: Number(diasAviso), obrigatorio: !!obrigatorio }
    });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

/** Atualizar por slug */
router.put("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { nome, diasAviso, obrigatorio } = req.body || {};
    const updated = await prisma.tipoDocumento.update({
      where: { slug },
      data: {
        ...(nome !== undefined ? { nome } : {}),
        ...(diasAviso !== undefined ? { diasAviso: Number(diasAviso) } : {}),
        ...(obrigatorio !== undefined ? { obrigatorio: !!obrigatorio } : {})
      }
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

/** Deletar por slug */
router.delete("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    await prisma.tipoDocumento.delete({ where: { slug } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
