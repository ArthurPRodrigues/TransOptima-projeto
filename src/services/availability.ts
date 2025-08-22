// src/services/availability.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Disponível = para cada Documento obrigatório do catálogo,
 * existe ao menos um RegistroDocumento ATIVO com validade >= hoje.
 */
export async function computeDisponivelParaFrete(transportadoraId: number): Promise<boolean> {
  // Só documentos obrigatórios
  const obrigatorios = await prisma.documento.findMany({
    where: { obrigatorio: true },
    select: { id: true },
  });
  if (obrigatorios.length === 0) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Última validade por documento (apenas registros ATIVOS)
  const grouped = await prisma.registroDocumento.groupBy({
    by: ['documentoId'],
    where: { transportadoraId, ativo: true },
    _max: { validade: true },
  });

  const latestByDoc = new Map<number, Date | null>();
  for (const g of grouped) latestByDoc.set(g.documentoId, g._max.validade);

  // Se faltar ou estiver vencido, indisponível
  for (const { id } of obrigatorios) {
    const validade = latestByDoc.get(id);
    if (!validade || validade < today) return false;
  }
  return true;
}

/**
 * Recalcula e tenta persistir em Transportadora.disponivelParaFrete (se o campo existir).
 */
export async function recalcDisponibilidade(transportadoraId: number): Promise<boolean> {
  const disponivel = await computeDisponivelParaFrete(transportadoraId);
  try {
    await prisma.transportadora.update({
      where: { id: transportadoraId },
      data: { disponivelParaFrete: disponivel },
    });
  } catch {
    // Campo pode não existir no schema; ignoramos o erro e só retornamos o valor.
  }
  return disponivel;
}

/**
 * Calcula disponibilidade para várias transportadoras (em paralelo).
 */
export async function batchDisponibilidade(transportadoraIds: number[]): Promise<Map<number, boolean>> {
  const pairs = await Promise.all(
    transportadoraIds.map(async (id) => [id, await computeDisponivelParaFrete(id)] as const)
  );
  return new Map<number, boolean>(pairs);
}
