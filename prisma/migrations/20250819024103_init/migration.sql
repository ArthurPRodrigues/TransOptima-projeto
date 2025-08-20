-- CreateTable
CREATE TABLE "Transportadora" (
    "id" SERIAL NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "uf" VARCHAR(2) NOT NULL,
    "quimicosControlados" BOOLEAN NOT NULL DEFAULT false,
    "disponivelParaFrete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transportadora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "obgQuimicos" BOOLEAN NOT NULL DEFAULT false,
    "obgNaoQuimicos" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroDocumento" (
    "id" SERIAL NOT NULL,
    "transportadoraId" INTEGER NOT NULL,
    "documentoId" INTEGER NOT NULL,
    "validade" TIMESTAMP(3),
    "urlArquivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transportadora_cnpj_key" ON "Transportadora"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Documento_codigo_key" ON "Documento"("codigo");

-- AddForeignKey
ALTER TABLE "RegistroDocumento" ADD CONSTRAINT "RegistroDocumento_transportadoraId_fkey" FOREIGN KEY ("transportadoraId") REFERENCES "Transportadora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroDocumento" ADD CONSTRAINT "RegistroDocumento_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "Documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
