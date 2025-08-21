-- AlterTable
ALTER TABLE "Transportadora" ADD COLUMN     "tiposProduto" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "disponivelParaFrete" DROP NOT NULL,
ALTER COLUMN "disponivelParaFrete" DROP DEFAULT;
