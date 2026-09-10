-- Login por telefone e senha provisória para cadastro em lote

ALTER TABLE "users" ADD COLUMN "telefone" TEXT;
ALTER TABLE "users" ADD COLUMN "precisaTrocarSenha" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "users_telefone_key" ON "users"("telefone");
CREATE INDEX "users_telefone_idx" ON "users"("telefone");
