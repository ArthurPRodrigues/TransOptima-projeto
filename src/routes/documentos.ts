import { Router } from "express";
import { prisma } from "../lib/prisma";

export const documentos = Router();

documentos.get("/tipos-documento", async (_req, res, next) => {
  try {
    const list = await prisma.documento.findMany({ orderBy: { codigo: "asc" } });
    res.json(list);
  } catch (e) { next(e); }
});