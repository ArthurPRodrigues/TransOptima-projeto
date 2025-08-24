/*
  Warnings:

  - The primary key for the `Documento` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `diasAntecedenciaAviso` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `obrigatorio` on the `Documento` table. All the data in the column will be lost.
  - The primary key for the `Transportadora` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `quimicosControlados` on the `Transportadora` table. All the data in the column will be lost.
  - You are about to drop the column `razaoSocial` on the `Transportadora` table. All the data in the column will be lost.
  - You are about to drop the column `tiposProduto` on the `Transportadora` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Transportadora` table. All the data in the column will be lost.
  - You are about to drop the `RegistroDocumento` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nomeArquivo` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transportadoraId` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `Transportadora` table without a default value. This is not possible if the table is not empty.
  - Made the column `disponivelParaFrete` on table `Transportadora` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "RegistroDocumento" DROP CONSTRAINT "RegistroDocumento_documentoId_fkey";

-- DropForeignKey
ALTER TABLE "RegistroDocumento" DROP CONSTRAINT "RegistroDocumento_transportadoraId_fkey";

-- DropIndex
DROP INDEX "Documento_nome_key";

-- AlterTable
ALTER TABLE "Documento" DROP CONSTRAINT "Documento_pkey",
DROP COLUMN "diasAntecedenciaAviso",
DROP COLUMN "nome",
DROP COLUMN "obrigatorio",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nomeArquivo" TEXT NOT NULL,
ADD COLUMN     "tipo" TEXT NOT NULL,
ADD COLUMN     "transportadoraId" TEXT NOT NULL,
ADD COLUMN     "valido" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "vencimento" TIMESTAMP(3),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Documento_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Documento_id_seq";

-- AlterTable
ALTER TABLE "Transportadora" DROP CONSTRAINT "Transportadora_pkey",
DROP COLUMN "quimicosControlados",
DROP COLUMN "razaoSocial",
DROP COLUMN "tiposProduto",
DROP COLUMN "updatedAt",
ADD COLUMN     "nome" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "uf" SET DATA TYPE TEXT,
ALTER COLUMN "disponivelParaFrete" SET NOT NULL,
ALTER COLUMN "disponivelParaFrete" SET DEFAULT false,
ADD CONSTRAINT "Transportadora_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Transportadora_id_seq";

-- DropTable
DROP TABLE "RegistroDocumento";

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_transportadoraId_fkey" FOREIGN KEY ("transportadoraId") REFERENCES "Transportadora"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
