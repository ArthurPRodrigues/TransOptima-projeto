// prisma/seed.cjs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Ajuste nomes/campos se no seu schema forem diferentes
  const tipos = [
    { nome: 'ANTT - RNTRC', diasAntecedenciaAviso: 30 },
    { nome: 'Licença Ambiental', diasAntecedenciaAviso: 45 },
    { nome: 'Seguro RCTR-C', diasAntecedenciaAviso: 30 },
    { nome: 'Certidão Negativa Federal', diasAntecedenciaAviso: 15 },
    { nome: 'Certidão Negativa Estadual', diasAntecedenciaAviso: 15 },
    { nome: 'Alvará de Funcionamento', diasAntecedenciaAviso: 30 },
  ];

  for (const t of tipos) {
    const existente = await prisma.tipoDocumento.findFirst({
      where: { nome: t.nome },
      select: { id: true },
    });

    if (existente) {
      await prisma.tipoDocumento.update({
        where: { id: existente.id },
        data: { diasAntecedenciaAviso: t.diasAntecedenciaAviso },
      });
    } else {
      await prisma.tipoDocumento.create({ data: t });
    }
  }

  console.log('✅ Seed de TipoDocumento concluído.');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
