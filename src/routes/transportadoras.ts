// src/routes/transportadoras.ts
import { Router } from "express";
import prisma from "../prisma";

const router = Router();

/** Util: remove tudo que não for dígito (aceita CNPJ com/sem máscara) */
function onlyDigits(cnpj: string) {
  return (cnpj || "").replace(/\D+/g, "");
}

/**
 * POST /api/transportadoras
 * Cria uma transportadora
 * Body: { nome: string, cnpj: string, uf?: string, quimicosControlados?: boolean }
 */
router.post("/", async (req, res) => {
  try {
    const { nome, cnpj, uf, quimicosControlados } = req.body || {};

    if (!nome || !cnpj) {
      return res.status(400).json({ error: "Campos obrigatórios: nome e cnpj." });
    }

    const cnpjNum = onlyDigits(cnpj);
    if (!cnpjNum) {
      return res.status(400).json({ error: "CNPJ inválido." });
    }

    const created = await prisma.transportadora.create({
      data: {
        nome: String(nome).trim(),
        cnpj: cnpjNum,
        uf: uf ? String(uf).toUpperCase().slice(0, 2) : null,
        quimicosControlados: !!quimicosControlados,
      },
    });

    return res.status(201).json(created);
  } catch (e: any) {
    if (e?.code === "P2002" && e?.meta?.target?.includes("cnpj")) {
      return res.status(400).json({ error: "CNPJ já cadastrado." });
    }
    return res.status(400).json({ error: e?.message || "Erro ao criar transportadora." });
  }
});

/**
 * GET /api/transportadoras
 * Lista transportadoras (filtros opcionais: ?uf=SC&disponivelParaFrete=true)
 */
router.get("/", async (req, res) => {
  try {
    const { uf, disponivelParaFrete } = req.query as {
      uf?: string;
      disponivelParaFrete?: string;
    };

    const list = await prisma.transportadora.findMany({
      where: {
        uf: uf ? String(uf).toUpperCase().slice(0, 2) : undefined,
        ...(typeof disponivelParaFrete !== "undefined"
          ? { disponivelParaFrete: String(disponivelParaFrete) === "true" }
          : {}),
      },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, cnpj: true, uf: true, disponivelParaFrete: true },
    });

    return res.json(list);
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || "Erro ao listar transportadoras." });
  }
});

/**
 * GET /api/transportadoras/:cnpj
 * Busca uma transportadora por CNPJ (com ou sem máscara)
 */
router.get("/:cnpj", async (req, res) => {
  try {
    const cnpj = onlyDigits(req.params.cnpj);
    if (!cnpj) return res.status(400).json({ error: "CNPJ inválido." });

    const t = await prisma.transportadora.findUnique({ where: { cnpj } });
    if (!t) return res.status(404).json({ error: "Transportadora não encontrada." });

    return res.json(t);
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || "Erro na busca por CNPJ." });
  }
});

/**
 * PUT /api/transportadoras/:cnpj
 * Atualiza campos da transportadora
 * Body: { nome?, uf?, quimicosControlados?, disponivelParaFrete? }
 */
router.put("/:cnpj", async (req, res) => {
  try {
    const cnpj = onlyDigits(req.params.cnpj);
    if (!cnpj) return res.status(400).json({ error: "CNPJ inválido." });

    const { nome, uf, quimicosControlados, disponivelParaFrete } = req.body || {};

    const updated = await prisma.transportadora.update({
      where: { cnpj },
      data: {
        ...(nome !== undefined ? { nome: String(nome).trim() } : {}),
        ...(uf !== undefined ? { uf: uf ? String(uf).toUpperCase().slice(0, 2) : null } : {}),
        ...(typeof quimicosControlados !== "undefined"
          ? { quimicosControlados: !!quimicosControlados }
          : {}),
        ...(typeof disponivelParaFrete !== "undefined"
          ? { disponivelParaFrete: !!disponivelParaFrete }
          : {}),
      },
    });

    return res.json(updated);
  } catch (e: any) {
    // Se não existir, o Prisma lança P2025
    if (e?.code === "P2025") {
      return res.status(404).json({ error: "Transportadora não encontrada." });
    }
    return res.status(400).json({ error: e?.message || "Erro ao atualizar transportadora." });
  }
});

/**
 * DELETE /api/transportadoras/:cnpj
 * Remove a transportadora (cascata apaga documentos)
 */
router.delete("/:cnpj", async (req, res) => {
  try {
    const cnpj = onlyDigits(req.params.cnpj);
    if (!cnpj) return res.status(400).json({ error: "CNPJ inválido." });

    await prisma.transportadora.delete({ where: { cnpj } });
    return res.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return res.status(404).json({ error: "Transportadora não encontrada." });
    }
    return res.status(400).json({ error: e?.message || "Erro ao remover transportadora." });
  }
});

export default router;
