/*
  Warnings:

  - You are about to drop the column `nomeArquivo` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `valido` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `vencimento` on the `Documento` table. All the data in the column will be lost.
  - Added the required column `caminhoArquivo` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomeOriginal` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tamanhoBytes` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoDocumentoId` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transportadora` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Documento" DROP CONSTRAINT "Documento_transportadoraId_fkey";

-- AlterTable
ALTER TABLE "Documento" DROP COLUMN "nomeArquivo",
DROP COLUMN "tipo",
DROP COLUMN "valido",
DROP COLUMN "vencimento",
ADD COLUMN     "caminhoArquivo" TEXT NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "nomeOriginal" TEXT NOT NULL,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "tamanhoBytes" INTEGER NOT NULL,
ADD COLUMN     "tipoDocumentoId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validade" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Transportadora" ADD COLUMN     "quimicosControlados" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "uf" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TipoDocumento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "diasAviso" INTEGER NOT NULL DEFAULT 30,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TipoDocumento_nome_key" ON "TipoDocumento"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TipoDocumento_slug_key" ON "TipoDocumento"("slug");

-- CreateIndex
CREATE INDEX "Documento_transportadoraId_idx" ON "Documento"("transportadoraId");

-- CreateIndex
CREATE INDEX "Documento_tipoDocumentoId_idx" ON "Documento"("tipoDocumentoId");

-- CreateIndex
CREATE INDEX "Documento_validade_idx" ON "Documento"("validade");

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_transportadoraId_fkey" FOREIGN KEY ("transportadoraId") REFERENCES "Transportadora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "TipoDocumento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
