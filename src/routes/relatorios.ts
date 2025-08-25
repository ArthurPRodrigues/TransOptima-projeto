import { Router } from "express";
import prisma from "../lib/prisma";

const r = Router();

r.get("/vencimentos", async (_req, res) => {
  const hoje = new Date();
  const in30d = new Date();
  in30d.setDate(hoje.getDate() + 30);

  const registros = await prisma.registroDocumento.findMany({
    where: { validade: { lte: in30d } },
    include: { documento: true, transportadora: true }
  });

  res.json(registros);
});

export default r;
