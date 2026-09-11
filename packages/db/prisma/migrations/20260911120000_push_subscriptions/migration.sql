-- Notificações push para o aplicativo do aluno.
--
-- Até aqui a plataforma registrava a mensagem na tabela `notifications` e,
-- no máximo, mandava e-mail. Nada chegava ao aparelho: o aluno só via o
-- aviso se abrisse o aplicativo e olhasse o sino. Esta tabela guarda a
-- autorização de cada aparelho para receber push de verdade.
--
-- Nada aqui altera dado existente: a tabela nasce vazia e nenhuma coluna
-- de outra tabela muda.

CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "agente" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimoEnvioEm" TIMESTAMP(3),

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- O endpoint é a identidade do aparelho e o navegador o gera único. A
-- unicidade fica nele (e não em userId+endpoint) para que reinstalar o
-- aplicativo atualize a linha em vez de criar uma duplicada que receberia
-- a mesma notificação duas vezes.
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");

-- CASCADE: aluno removido não deixa inscrição órfã apontando para conta
-- que não existe mais.
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
