import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const r = Router();

/**
 * OBS: Para evitar erro se seu schema NÃO tiver 'uf' e 'tiposProduto',
 * este CRUD salva apenas 'razaoSocial' e 'cnpj'.
 * (Quando você migrar o schema, a gente atualiza para salvar UF etc.)
 */

// LISTAR
r.get('/', async (_req, res) => {
  const rows = await prisma.transportadora.findMany({ orderBy: { id: 'asc' } });
  res.json(rows);
});

// CRIAR (somente campos garantidos no schema básico)
r.post('/', async (req, res) => {
  try {
    const { razaoSocial, cnpj } = req.body || {};
    if (!razaoSocial || !cnpj) {
      return res.status(400).json({ error: 'razaoSocial e cnpj são obrigatórios' });
    }
    const created = await prisma.transportadora.create({
      data: { razaoSocial, cnpj },
    });
    res.status(201).json(created);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Falha ao criar' });
  }
});

// ATUALIZAR
r.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { razaoSocial, cnpj } = req.body || {};
    const updated = await prisma.transportadora.update({
      where: { id },
      data: {
        ...(razaoSocial !== undefined && { razaoSocial }),
        ...(cnpj !== undefined && { cnpj }),
      },
    });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Falha ao atualizar' });
  }
});

// EXCLUIR
r.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.transportadora.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Falha ao excluir' });
  }
});

export default r;
