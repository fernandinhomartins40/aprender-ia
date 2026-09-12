CREATE TABLE "knowledge_entries" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "termo" TEXT NOT NULL,
  "sinonimos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "categoria" TEXT NOT NULL,
  "resumo" TEXT NOT NULL,
  "explicacao" TEXT NOT NULL,
  "importancias" JSONB,
  "fonteNome" TEXT,
  "fonteUrl" TEXT,
  "saibaMaisUrl" TEXT,
  "relacionadoSlugs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "publicado" BOOLEAN NOT NULL DEFAULT true,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "knowledge_entries_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "knowledge_entries_slug_key" ON "knowledge_entries"("slug");
CREATE INDEX "knowledge_entries_publicado_categoria_idx" ON "knowledge_entries"("publicado", "categoria");
CREATE INDEX "knowledge_entries_termo_idx" ON "knowledge_entries"("termo");
