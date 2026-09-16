-- A apostila deixa de ser só um PDF para baixar e passa a ser conteúdo
-- consultável: o aluno lê no celular, e o slide leva direto ao trecho certo.
--
-- Fica no banco, e não como arquivo servido, porque a aplicação precisa
-- procurá-la por seção ("mostre 2.2"). O PDF continua onde estava, para quem
-- quiser baixar.
CREATE TABLE "handbook_chapters" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "numero" INTEGER,
    "titulo" TEXT NOT NULL,
    "icone" TEXT NOT NULL DEFAULT '',
    "aberturaHtml" TEXT NOT NULL DEFAULT '',
    "ordem" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handbook_chapters_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "handbook_chapters_chave_key" ON "handbook_chapters"("chave");
CREATE INDEX "handbook_chapters_ordem_idx" ON "handbook_chapters"("ordem");

CREATE TABLE "handbook_sections" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "handbook_sections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "handbook_sections_chapterId_ordem_key" ON "handbook_sections"("chapterId", "ordem");
CREATE INDEX "handbook_sections_numero_idx" ON "handbook_sections"("numero");

ALTER TABLE "handbook_sections" ADD CONSTRAINT "handbook_sections_chapterId_fkey"
    FOREIGN KEY ("chapterId") REFERENCES "handbook_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- A seção que cada slide trata, para o botão que leva do slide ao material.
ALTER TABLE "script_steps" ADD COLUMN "secaoApostila" TEXT;
