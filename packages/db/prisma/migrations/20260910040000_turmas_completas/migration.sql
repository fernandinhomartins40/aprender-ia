-- Turmas completas: modalidade, local, encontros, presença, vagas e instrutor.
--
-- Todas as colunas novas de "cohorts" entram com DEFAULT ou nulas: podem
-- existir turmas criadas antes desta migration, e nenhuma delas tem como
-- informar modalidade ou situação retroativamente.

CREATE TYPE "ModalidadeTurma" AS ENUM ('ONLINE', 'PRESENCIAL', 'HIBRIDA');
CREATE TYPE "SituacaoTurma" AS ENUM ('RASCUNHO', 'INSCRICOES_ABERTAS', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');
CREATE TYPE "ModalidadeEncontro" AS ENUM ('PRESENCIAL', 'REMOTO');
CREATE TYPE "PresencaEncontro" AS ENUM ('PRESENTE', 'FALTA', 'JUSTIFICADA');

-- ---- cohorts: novas colunas ----
ALTER TABLE "cohorts" ADD COLUMN "modalidade" "ModalidadeTurma" NOT NULL DEFAULT 'ONLINE';
-- Turmas que já existiam estavam em uso, não em rascunho: viram
-- INSCRICOES_ABERTAS logo abaixo, depois de a coluna ser criada.
ALTER TABLE "cohorts" ADD COLUMN "situacao" "SituacaoTurma" NOT NULL DEFAULT 'RASCUNHO';
ALTER TABLE "cohorts" ADD COLUMN "local" TEXT;
ALTER TABLE "cohorts" ADD COLUMN "endereco" TEXT;
ALTER TABLE "cohorts" ADD COLUMN "cidade" TEXT;
ALTER TABLE "cohorts" ADD COLUMN "uf" TEXT;
ALTER TABLE "cohorts" ADD COLUMN "sala" TEXT;
ALTER TABLE "cohorts" ADD COLUMN "linkOnline" TEXT;
ALTER TABLE "cohorts" ADD COLUMN "vagas" INTEGER;
ALTER TABLE "cohorts" ADD COLUMN "instrutorId" TEXT;
ALTER TABLE "cohorts" ADD COLUMN "observacoes" TEXT;
ALTER TABLE "cohorts" ADD COLUMN "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- "descricao" passa a ser texto longo.
ALTER TABLE "cohorts" ALTER COLUMN "descricao" TYPE TEXT;

-- Turma pré-existente já estava recebendo aluno: preserva o comportamento.
UPDATE "cohorts" SET "situacao" = 'INSCRICOES_ABERTAS' WHERE "criadoEm" < CURRENT_TIMESTAMP;

CREATE INDEX "cohorts_courseId_idx" ON "cohorts"("courseId");
CREATE INDEX "cohorts_situacao_idx" ON "cohorts"("situacao");
CREATE INDEX "cohorts_instrutorId_idx" ON "cohorts"("instrutorId");

ALTER TABLE "cohorts"
    ADD CONSTRAINT "cohorts_instrutorId_fkey"
    FOREIGN KEY ("instrutorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ---- encontros ----
CREATE TABLE "cohort_meetings" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "titulo" TEXT,
    "pauta" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "horaInicio" TEXT,
    "horaFim" TEXT,
    "modalidade" "ModalidadeEncontro" NOT NULL DEFAULT 'PRESENCIAL',
    "local" TEXT,
    "endereco" TEXT,
    "sala" TEXT,
    "linkOnline" TEXT,
    "canceladoEm" TIMESTAMP(3),
    "motivoCancelamento" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cohort_meetings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cohort_meetings_cohortId_ordem_key" ON "cohort_meetings"("cohortId", "ordem");
CREATE INDEX "cohort_meetings_data_idx" ON "cohort_meetings"("data");

ALTER TABLE "cohort_meetings"
    ADD CONSTRAINT "cohort_meetings_cohortId_fkey"
    FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---- presença ----
CREATE TABLE "meeting_attendances" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "situacao" "PresencaEncontro" NOT NULL DEFAULT 'PRESENTE',
    "anotacao" TEXT,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_attendances_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "meeting_attendances_meetingId_userId_key" ON "meeting_attendances"("meetingId", "userId");
CREATE INDEX "meeting_attendances_userId_idx" ON "meeting_attendances"("userId");

ALTER TABLE "meeting_attendances"
    ADD CONSTRAINT "meeting_attendances_meetingId_fkey"
    FOREIGN KEY ("meetingId") REFERENCES "cohort_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "meeting_attendances"
    ADD CONSTRAINT "meeting_attendances_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
