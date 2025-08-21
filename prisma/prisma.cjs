cat <<'EOF' > prisma/seed.cjs
// prisma/seed.cjs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tenta encontrar o delegate correto, qualquer que seja o nome do model
function getDelegate(p, candidates) {
  for (const name of candidates) {
    if (p[name]) return p[name];
  }
  return null;
}

async function main() {
  // Ajuste os valores como quiser; os nomes/colunas o script resolve via delegate
  const tipos = [
    { nome: 'ANTT - RNTRC', diasAntecedenciaAviso: 30 },
    { nome: 'Licença Ambiental', diasAntecedenciaAviso: 45 },
    { nome: 'Seguro RCTR-C', diasAntecedenciaAviso: 30 },
    { nome: 'Certidão Negativa Federal', diasAntecedenciaAviso: 15 },
    { nome: 'Certidão Negativa Estadual', diasAntecedenciaAviso: 15 },
    { nome: 'Alvará de Funcionamento', diasAntecedenciaAviso: 30 },
  ];

  const candidates = [
    'tipoDocumento',     // Prisma model TipoDocumento
    'documentType',      // Prisma model DocumentType
    'tipo_documento',    // variante snake_case
    'TipoDocumento',     // (pouco provável; Prisma usa camelCase no client)
    'DocumentType'
  ];

  const tipoDoc = getDelegate(prisma, candidates);

  if (!tipoDoc) {
    // Lista delegates disponíveis para você me dizer qual usar
    const available = Object.keys(prisma).filter((k) => !k.startsWith('$'));
    throw new Error(
      'Não encontrei o delegate do model de tipos de documentos. Delegates disponíveis: ' +
      available.join(', ')
    );
  }

  for (const t of tipos) {
    // Tenta encontrar por nome (se existir o campo 'nome')
    // Se seu campo se chamar diferente (ex.: 'name'), ajuste aqui.
    const existente = await tipoDoc.findFirst({
      where: { nome: t.nome },
      select: { id: true },
    }).catch(() => null); // se 'nome' não existir, cai no catch e vamos criar direto

    if (existente && existente.id) {
      await tipoDoc.update({
        where: { id: existente.id },
        data: { diasAntecedenciaAviso: t.diasAntecedenciaAviso },
      });
    } else {
      await tipoDoc.create({ data: t }).catch(async (e) => {
        // Fallback: se coluna/nomes forem diferentes, esse create falha.
        // Loga os campos existentes para você ajustar rapidamente.
        console.error('Falha ao criar registro. Verifique nomes de campos no schema.');
        // Tenta introspectar um exemplo de estrutura:
        try {
          const sample = await tipoDoc.findFirst().catch(() => null);
          console.error('Exemplo de registro (ou null):', sample);
        } catch {}
        throw e;
      });
    }
  }

  console.log('✅ Seed de TipoDocumento concluído.');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF
