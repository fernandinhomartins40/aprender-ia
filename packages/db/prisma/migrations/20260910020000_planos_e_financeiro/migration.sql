-- Níveis de acesso (FREE/PREMIUM), suspensão de conta e controle financeiro manual

CREATE TYPE "Plano" AS ENUM ('FREE', 'PREMIUM');
CREATE TYPE "SituacaoConta" AS ENUM ('ATIVO', 'SUSPENSO');
CREATE TYPE "TipoPagamento" AS ENUM ('UNICO', 'RECORRENTE');
CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO');

ALTER TABLE "users" ADD COLUMN "plano" "Plano" NOT NULL DEFAULT 'FREE';
ALTER TABLE "users" ADD COLUMN "situacao" "SituacaoConta" NOT NULL DEFAULT 'ATIVO';
ALTER TABLE "users" ADD COLUMN "premiumAte" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "observacoes" TEXT;

CREATE INDEX "users_plano_idx" ON "users"("plano");
CREATE INDEX "users_situacao_idx" ON "users"("situacao");

ALTER TABLE "courses" ADD COLUMN "pago" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "courses" ADD COLUMN "precoCentavos" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "tipo" "TipoPagamento" NOT NULL DEFAULT 'UNICO',
    "status" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
    "vencimentoEm" TIMESTAMP(3) NOT NULL,
    "pagoEm" TIMESTAMP(3),
    "formaPagamento" TEXT,
    "observacao" TEXT,
    "competencia" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "payments_userId_idx" ON "payments"("userId");
CREATE INDEX "payments_status_idx" ON "payments"("status");
CREATE INDEX "payments_vencimentoEm_idx" ON "payments"("vencimentoEm");

ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
