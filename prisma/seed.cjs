
// prisma/seed.cjs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Escolhe um delegate que pareça ser o catálogo de tipos de documentos.
 * No seu client os delegates são: transportadora, documento, registroDocumento.
 * Vamos priorizar "documento".
 */
function pickDelegate(p) {
  const preferidos = ['documento', 'tipoDocumento', 'documentType'];
  for (const k of preferidos) if (p[k]) return p[k];

  // fallback: heurística por nome
  const keys = Object.keys(p).filter(k => !k.startsWith('$'));
  const byScore = keys
    .map(k => {
      const s = k.toLowerCase();
      let score = 0;
      if (s.includes('doc')) score += 3;
      if (s.includes('document')) score += 3;
      if (s.includes('documento')) score += 3;
      if (s.includes('tipo') || s.includes('type')) score += 2;
      return { k, score };
    })
    .sort((a,b)=>b.score-a.score);

  return byScore.length && byScore[0].score > 0 ? p[byScore[0].k] : null;
}

/**
 * Tenta criar/atualizar usando combinações seguras de campos.
 * Se o modelo tiver só "nome" ou só "name", ainda funciona.
 */
async function createOrEnsure(tipoDoc, nome, dias) {
  // tenta achar por 'nome'
  try {
    const found = await tipoDoc.findFirst({ where: { nome }, select: { id: true } });
    if (found?.id) {
      // tenta atualizar campo de dias, se existir
      const updates = [
        { diasAntecedenciaAviso: dias },
        { diasAviso: dias },
        { daysNotice: dias },
        { noticeDays: dias },
      ];
      for (const data of updates) {
        try { await tipoDoc.update({ where: { id: found.id }, data }); break; } catch {}
      }
      return;
    }
  } catch {}

  // tenta achar por 'name'
  try {
    const found = await tipoDoc.findFirst({ where: { name: nome }, select: { id: true } });
    if (found?.id) {
      const updates = [
        { daysNotice: dias },
        { noticeDays: dias },
        { diasAntecedenciaAviso: dias },
        { diasAviso: dias },
      ];
      for (const data of updates) {
        try { await tipoDoc.update({ where: { id: found.id }, data }); break; } catch {}
      }
      return;
    }
  } catch {}

  // criar (várias formas, da mais completa até só o nome)
  const variants = [
    { nome: nome, diasAntecedenciaAviso: dias },
    { nome: nome, diasAviso: dias },
    { name: nome, daysNotice: dias },
    { name: nome, noticeDays: dias },
    { nome: nome },
    { name: nome },
  ];
  for (const data of variants) {
    try { await tipoDoc.create({ data }); return; } catch (e) {
      // ignora e tenta a próxima variante
      if (e?.code === 'P2002') return; // unique violation -> já existe
    }
  }
}

async function main() {
  const tipoDoc = pickDelegate(prisma);
  if (!tipoDoc) {
    const available = Object.keys(prisma).filter(k => !k.startsWith('$'));
    throw new Error('Delegate não identificado. Disponíveis: ' + available.join(', '));
  }

  // Catálogo base
  const tipos = [
    { nome: 'ANTT - RNTRC', dias: 30 },
    { nome: 'Licença Ambiental', dias: 45 },
    { nome: 'Seguro RCTR-C', dias: 30 },
    { nome: 'Certidão Negativa Federal', dias: 15 },
    { nome: 'Certidão Negativa Estadual', dias: 15 },
    { nome: 'Alvará de Funcionamento', dias: 30 },
  ];

  for (const t of tipos) {
    await createOrEnsure(tipoDoc, t.nome, t.dias);
  }

  console.log('✅ Seed concluído.');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
