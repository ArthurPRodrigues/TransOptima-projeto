import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const tipos = [
  { codigo: "CNPJ", nome: "Cartão CNPJ", obgQuimicos: true, obgNaoQuimicos: true },
  { codigo: "APOLICE", nome: "Apólice de Seguro", obgQuimicos: true, obgNaoQuimicos: true },
  { codigo: "ANTT", nome: "ANTT", obgQuimicos: true, obgNaoQuimicos: true },
  { codigo: "ALVARA", nome: "Alvará de Funcionamento", obgQuimicos: true, obgNaoQuimicos: true },
  // Específicos de químicos controlados
  { codigo: "ALVARA_PC", nome: "Alvará Polícia Civil", obgQuimicos: true, obgNaoQuimicos: false },
  { codigo: "EXERCITO", nome: "Certificação Exército", obgQuimicos: true, obgNaoQuimicos: false },
  { codigo: "LIC_FUNC_PF", nome: "Licença Funcionamento PF", obgQuimicos: true, obgNaoQuimicos: false },
  { codigo: "IBAMA", nome: "IBAMA", obgQuimicos: true, obgNaoQuimicos: false },
  { codigo: "FATMA", nome: "FATMA/IMA", obgQuimicos: true, obgNaoQuimicos: false }
];

async function main() {
  for (const t of tipos) {
    await prisma.documento.upsert({
      where: { codigo: t.codigo },
      update: t,
      create: t,
    });
  }
  console.log("Tipos de documento seed: OK");
}

main().finally(async () => prisma.$disconnect());