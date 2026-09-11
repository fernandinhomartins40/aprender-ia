ALTER TABLE "prompt_templates"
  ADD COLUMN "origem" TEXT,
  ADD COLUMN "faixa" TEXT NOT NULL DEFAULT 'Gratuito';

CREATE TABLE "ai_tools" (
  "id" TEXT NOT NULL,
  "chave" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "descricao" TEXT NOT NULL,
  "categoria" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "urlCadastro" TEXT,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "ordem" INTEGER NOT NULL DEFAULT 0,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ai_tools_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ai_tools_chave_key" ON "ai_tools"("chave");
CREATE INDEX "ai_tools_ativo_ordem_idx" ON "ai_tools"("ativo", "ordem");
