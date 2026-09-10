-- Acesso gratuito com prazo, e o pedido de nova liberação.
--
-- `freeAte` entra NULO de propósito: contas criadas antes desta regra
-- nunca tiveram prazo, e carimbar uma data retroativa expulsaria da
-- plataforma quem já estava dentro. Nulo significa "sem prazo", e o
-- administrador define caso a caso quando quiser.

ALTER TABLE "users" ADD COLUMN "freeAte" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "freeConcedidoEm" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "freeRevogadoEm" TIMESTAMP(3);

CREATE INDEX "users_freeAte_idx" ON "users"("freeAte");

CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'APROVADA', 'RECUSADA');

CREATE TABLE "access_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
    "motivo" TEXT,
    "expiradoEm" TIMESTAMP(3),
    "ordem" INTEGER NOT NULL DEFAULT 1,
    "decididoEm" TIMESTAMP(3),
    "decididoPor" TEXT,
    "decisorNome" TEXT,
    "diasConcedidos" INTEGER,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "access_requests_userId_idx" ON "access_requests"("userId");
CREATE INDEX "access_requests_status_idx" ON "access_requests"("status");
CREATE INDEX "access_requests_criadoEm_idx" ON "access_requests"("criadoEm");

ALTER TABLE "access_requests"
    ADD CONSTRAINT "access_requests_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- O pedido sobrevive à exclusão de quem decidiu; o nome fica em
-- "decisorNome", que não depende da conta continuar existindo.
ALTER TABLE "access_requests"
    ADD CONSTRAINT "access_requests_decididoPor_fkey"
    FOREIGN KEY ("decididoPor") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
