/*
  Warnings:

  - You are about to drop the column `codigo` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `obgNaoQuimicos` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `obgQuimicos` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `RegistroDocumento` table. All the data in the column will be lost.
  - You are about to drop the column `urlArquivo` on the `RegistroDocumento` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nome]` on the table `Documento` will be added. If there are existing duplicate values, this will fail.
  - Made the column `validade` on table `RegistroDocumento` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "RegistroDocumento" DROP CONSTRAINT "RegistroDocumento_transportadoraId_fkey";

-- DropIndex
DROP INDEX "Documento_codigo_key";

-- AlterTable
ALTER TABLE "Documento" DROP COLUMN "codigo",
DROP COLUMN "obgNaoQuimicos",
DROP COLUMN "obgQuimicos",
ADD COLUMN     "diasAntecedenciaAviso" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "obrigatorio" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "RegistroDocumento" DROP COLUMN "createdAt",
DROP COLUMN "urlArquivo",
ADD COLUMN     "arquivoUrl" TEXT,
ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emissao" TIMESTAMP(3),
ADD COLUMN     "numero" TEXT,
ALTER COLUMN "validade" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Documento_nome_key" ON "Documento"("nome");

-- CreateIndex
CREATE INDEX "RegistroDocumento_transportadoraId_documentoId_validade_idx" ON "RegistroDocumento"("transportadoraId", "documentoId", "validade");

-- AddForeignKey
ALTER TABLE "RegistroDocumento" ADD CONSTRAINT "RegistroDocumento_transportadoraId_fkey" FOREIGN KEY ("transportadoraId") REFERENCES "Transportadora"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
