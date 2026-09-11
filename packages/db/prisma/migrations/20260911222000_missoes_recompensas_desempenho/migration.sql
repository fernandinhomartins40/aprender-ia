ALTER TABLE "achievements"
  ADD COLUMN "oculto" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "recompensaTitulo" TEXT;

ALTER TABLE "notifications"
  ADD COLUMN "categoria" TEXT NOT NULL DEFAULT 'ESSENCIAL';

CREATE TYPE "TipoMissao" AS ENUM ('DIARIA', 'SEMANAL', 'ESPECIAL');

CREATE TABLE "missions" (
  "id" TEXT NOT NULL, "chave" TEXT NOT NULL, "titulo" TEXT NOT NULL, "descricao" TEXT NOT NULL,
  "tipo" "TipoMissao" NOT NULL, "criterio" TEXT NOT NULL, "alvo" INTEGER NOT NULL,
  "icone" TEXT NOT NULL DEFAULT 'metas', "recompensaTitulo" TEXT,
  "lessonId" TEXT, "ativo" BOOLEAN NOT NULL DEFAULT true,
  "oculto" BOOLEAN NOT NULL DEFAULT false, "iniciaEm" TIMESTAMP(3), "terminaEm" TIMESTAMP(3),
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "missions_ativo_tipo_idx" ON "missions"("ativo", "tipo");
CREATE INDEX "missions_lessonId_idx" ON "missions"("lessonId");
CREATE UNIQUE INDEX "missions_chave_key" ON "missions"("chave");
ALTER TABLE "missions" ADD CONSTRAINT "missions_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "user_missions" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "missionId" TEXT NOT NULL,
  "ciclo" TEXT NOT NULL, "progresso" INTEGER NOT NULL DEFAULT 0,
  "concluidoEm" TIMESTAMP(3), "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "user_missions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_missions_userId_missionId_ciclo_key" ON "user_missions"("userId", "missionId", "ciclo");
CREATE INDEX "user_missions_userId_concluidoEm_idx" ON "user_missions"("userId", "concluidoEm");
ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "user_rewards" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "origem" TEXT NOT NULL,
  "titulo" TEXT NOT NULL, "icone" TEXT NOT NULL DEFAULT 'recompensas',
  "recebidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_rewards_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_rewards_userId_origem_key" ON "user_rewards"("userId", "origem");
CREATE INDEX "user_rewards_userId_recebidoEm_idx" ON "user_rewards"("userId", "recebidoEm");
ALTER TABLE "user_rewards" ADD CONSTRAINT "user_rewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "activity_performances" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "lessonId" TEXT NOT NULL,
  "acertos" INTEGER NOT NULL, "total" INTEGER NOT NULL, "tentativa" INTEGER NOT NULL DEFAULT 1,
  "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "activity_performances_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "activity_performances_userId_registradoEm_idx" ON "activity_performances"("userId", "registradoEm");
CREATE INDEX "activity_performances_lessonId_idx" ON "activity_performances"("lessonId");
ALTER TABLE "activity_performances" ADD CONSTRAINT "activity_performances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_performances" ADD CONSTRAINT "activity_performances_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
