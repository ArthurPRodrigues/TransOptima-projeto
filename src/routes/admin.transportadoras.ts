// src/routes/admin.transportadoras.ts
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const r = Router()

// LISTAR
r.get('/', async (_req, res) => {
  try {
    const rows = await prisma.transportadora.findMany({ orderBy: { id: 'asc' } })
    return res.json(rows)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Falha ao listar transportadoras.' })
  }
})

// CREATE
r.post('/', async (req, res) => {
  try {
    let { razaoSocial, cnpj, uf } = req.body || {}

    if (!razaoSocial || !cnpj || !uf) {
      return res
        .status(400)
        .json({ error: 'razaoSocial, cnpj e uf são obrigatórios' })
    }

    uf = String(uf).trim().toUpperCase()
    if (!/^[A-Z]{2}$/.test(uf)) {
      return res.status(400).json({ error: 'UF inválida (use sigla, ex: SP)' })
    }

    const created = await prisma.transportadora.create({
      data: { razaoSocial, cnpj, uf },
    })
    return res.status(201).json(created)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Falha ao criar transportadora.' })
  }
})

// UPDATE
r.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const data: any = {}

    const { razaoSocial, cnpj, uf } = req.body || {}

    if (typeof razaoSocial !== 'undefined') data.razaoSocial = razaoSocial
    if (typeof cnpj !== 'undefined') data.cnpj = cnpj

    if (typeof uf !== 'undefined') {
      const u = String(uf).trim().toUpperCase()
      if (!/^[A-Z]{2}$/.test(u)) {
        return res.status(400).json({ error: 'UF inválida (use sigla, ex: SP)' })
      }
      data.uf = u
    }

    const updated = await prisma.transportadora.update({ where: { id }, data })
    return res.json(updated)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Falha ao atualizar transportadora.' })
  }
})

// DELETE
r.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    await prisma.transportadora.delete({ where: { id } })
    return res.json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Falha ao excluir transportadora.' })
  }
})

export default r
