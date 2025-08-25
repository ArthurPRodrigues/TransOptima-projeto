import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const tipos = [
    { nome: "ANVISA", slug: "anvisa", diasAviso: 30, obrigatorio: true },
    { nome: "ANTT", slug: "antt", diasAviso: 30, obrigatorio: true },
    { nome: "Seguro RCTR-C", slug: "seguro-rctr", diasAviso: 15, obrigatorio: true },
    { nome: "Alvará Municipal", slug: "alvara", diasAviso: 20, obrigatorio: false }
  ];
  for (const t of tipos) {
    await prisma.tipoDocumento.upsert({
      where: { slug: t.slug },
      update: t,
      create: t
    });
  }
  console.log("Seed OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
