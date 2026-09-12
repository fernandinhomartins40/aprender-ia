ALTER TABLE "prompt_templates"
  ADD COLUMN "etapaEnsino" TEXT,
  ADD COLUMN "objetivoPedagogico" TEXT,
  ADD COLUMN "tipoAtividade" TEXT,
  ADD COLUMN "nivelDificuldade" TEXT,
  ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "ai_tools"
  ADD COLUMN "capacidades" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "entradas" TEXT[] NOT NULL DEFAULT ARRAY['texto']::TEXT[],
  ADD COLUMN "saidas" TEXT[] NOT NULL DEFAULT ARRAY['texto']::TEXT[],
  ADD COLUMN "metodoAbertura" TEXT NOT NULL DEFAULT 'COPIAR_E_ABRIR',
  ADD COLUMN "urlComPrompt" TEXT,
  ADD COLUMN "observacaoIntegracao" TEXT;

CREATE TABLE "prompt_favorites" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "promptTemplateId" TEXT NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "prompt_favorites_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "prompt_favorites_userId_promptTemplateId_key" ON "prompt_favorites"("userId", "promptTemplateId");
CREATE INDEX "prompt_favorites_userId_criadoEm_idx" ON "prompt_favorites"("userId", "criadoEm");
CREATE INDEX "prompt_templates_etapaEnsino_idx" ON "prompt_templates"("etapaEnsino");
ALTER TABLE "prompt_favorites" ADD CONSTRAINT "prompt_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prompt_favorites" ADD CONSTRAINT "prompt_favorites_promptTemplateId_fkey" FOREIGN KEY ("promptTemplateId") REFERENCES "prompt_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
