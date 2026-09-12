-- Diário de bordo: de cronômetro a memória pedagógica.
--
-- Os registros existentes são preservados na íntegra. As colunas novas
-- entram com default ou nulas, e `ferramentaUsada` passa a aceitar NULL:
-- nem toda prática pedagógica passa por uma ferramenta de IA, e exigir a
-- escolha de uma era parte da burocracia que mantinha o diário vazio.

CREATE TYPE "OrigemRegistro" AS ENUM ('MANUAL', 'AUTOMATICO', 'CONFIRMADO');

CREATE TYPE "CategoriaRegistro" AS ENUM (
  'AULA', 'PLANEJAMENTO', 'ATIVIDADE', 'AVALIACAO', 'ESTRATEGIA',
  'DIFICULDADE', 'ADAPTACAO', 'OBSERVACAO', 'RESULTADO', 'IDEIA_FUTURA',
  'RECURSO', 'REFLEXAO'
);

ALTER TABLE "diary_entries"
  ALTER COLUMN "ferramentaUsada" DROP NOT NULL,
  ADD COLUMN "origem" "OrigemRegistro" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN "categoria" "CategoriaRegistro",
  ADD COLUMN "tema" TEXT,
  ADD COLUMN "disciplina" TEXT,
  ADD COLUMN "etapa" TEXT,
  ADD COLUMN "marcadores" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "fonteTipo" TEXT,
  ADD COLUMN "fonteId" TEXT,
  ADD COLUMN "pendente" BOOLEAN NOT NULL DEFAULT false,
  -- `atualizadoEm` é NOT NULL no schema; o default preenche as linhas que
  -- já existem, sem precisar de UPDATE em massa.
  ADD COLUMN "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- O índice antigo (só userId) vira redundante: toda leitura do diário
-- ordena por data dentro do professor.
DROP INDEX IF EXISTS "diary_entries_userId_idx";

CREATE INDEX "diary_entries_userId_registradoEm_idx" ON "diary_entries"("userId", "registradoEm");
CREATE INDEX "diary_entries_userId_pendente_idx" ON "diary_entries"("userId", "pendente");
CREATE INDEX "diary_entries_userId_categoria_idx" ON "diary_entries"("userId", "categoria");

-- Um evento, um registro. Em Postgres NULLs não colidem em índice único,
-- então os registros manuais (sem fonte) não são afetados por esta regra.
CREATE UNIQUE INDEX "diary_entries_userId_fonteTipo_fonteId_key"
  ON "diary_entries"("userId", "fonteTipo", "fonteId");
