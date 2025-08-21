// src/services/availability.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/** Disponibilidade = todos os docs obrigatórios estão válidos hoje. */
export async function computeDisponivelParaFrete(transportadoraId: number): Promise<boolean> {
  const docs = await prisma.documento.findMany({ select: { id: true } });
  if (docs.length === 0) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // última validade por documento para a transportadora (uma query)
  const grouped = await prisma.registroDocumento.groupBy({
    by: ['documentoId'],
    where: { transportadoraId },
    _max: { validade: true },
  });

  const latestByDoc = new Map<number, Date | null>(
    grouped.map(g => [g.documentoId, g._max.validade])
  );

  for (const { id } of docs) {
    const validade = latestByDoc.get(id);
    if (!validade || validade < today) return false;
  }
  return true;
}

/** Recalcula e tenta persistir no campo disponivelParaFrete (se existir). */
export async function recalcDisponibilidade(transportadoraId: number) {
  const disponivel = await computeDisponivelParaFrete(transportadoraId);
  try {
    await prisma.transportadora.update({
      where: { id: transportadoraId },
      data: { disponivelParaFrete: disponivel as any }, // se o campo não existir, o try/catch ignora
    });
  } catch {}
  return disponivel;
}

/** Batch para a listagem. */
export async function batchDisponibilidade(transportadoraIds: number[]) {
  const map = new Map<number, boolean>();
  for (const id of transportadoraIds) {
    map.set(id, await computeDisponivelParaFrete(id));
  }
  return map;
}
