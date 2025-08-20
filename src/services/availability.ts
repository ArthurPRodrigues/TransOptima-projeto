import { prisma } from "../lib/prisma";

export async function recalcForTransportadora(transportadoraId: number) {
  const t = await prisma.transportadora.findUnique({ where: { id: transportadoraId } });
  if (!t) throw new Error("Transportadora não encontrada");

  const requiredDocs = await prisma.documento.findMany({
    where: t.quimicosControlados ? { obgQuimicos: true } : { obgNaoQuimicos: true },
    select: { id: true, codigo: true }
  });

  const regs = await prisma.registroDocumento.findMany({
    where: { transportadoraId },
    select: { documentoId: true, validade: true }
  });

  const today = new Date();
  const ok = requiredDocs.every(req =>
    regs.some(r => r.documentoId === req.id && (!r.validade || r.validade >= today))
  );

  await prisma.transportadora.update({
    where: { id: transportadoraId },
    data: { disponivelParaFrete: ok }
  });

  return ok;
}

export async function recalcAll() {
  const all = await prisma.transportadora.findMany({ select: { id: true } });
  for (const t of all) await recalcForTransportadora(t.id);
}