import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const r = Router();

// LISTAR
r.get('/', async (_req, res) => {
  const rows = await prisma.documento.findMany({ orderBy: { id: 'asc' } });
  res.json(rows);
});

// CRIAR
r.post('/', async (req, res) => {
  try {
    const { nome, diasAntecedenciaAviso = 7, obrigatorio = true } = req.body || {};
    if (!nome) return res.status(400).json({ error: 'nome é obrigatório' });
    const created = await prisma.documento.create({
      data: { nome, diasAntecedenciaAviso, obrigatorio },
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
    const { nome, diasAntecedenciaAviso, obrigatorio } = req.body || {};
    const updated = await prisma.documento.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(diasAntecedenciaAviso !== undefined && { diasAntecedenciaAviso }),
        ...(obrigatorio !== undefined && { obrigatorio }),
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
    await prisma.documento.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Falha ao excluir' });
  }
});

export default r;
