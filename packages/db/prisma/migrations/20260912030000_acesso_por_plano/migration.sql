-- Acesso derivado de planos: aluno → assinaturas → planos → cursos/módulos.
--
-- Antes, um plano definia só preço e cobrança; quem decidia acesso era o
-- enum `users.plano` (FREE/PREMIUM) somado a `courses.pago`. Pagar não
-- liberava conteúdo por si só, e não havia como um plano dar um curso e
-- outro plano dar outro.
--
-- Nada é destruído aqui. `users.plano`, `courses.pago` e `modules.pago`
-- continuam existindo: o primeiro passa a ser espelho mantido pelo motor
-- de acesso (relatórios e landing seguem lendo), e os outros dois viram o
-- fallback usado enquanto não existir plano gratuito configurado.

-- ---- Novos estados de assinatura ----
-- PENDENTE: escolheu o plano e ainda não pagou.
-- SUSPENSA: suspensa pela administração, sem cancelar o vínculo.
ALTER TYPE "StatusAssinatura" ADD VALUE IF NOT EXISTS 'PENDENTE';
ALTER TYPE "StatusAssinatura" ADD VALUE IF NOT EXISTS 'SUSPENSA';

-- ---- Abrangência: curso inteiro ou recorte de módulos ----
DO $$ BEGIN
  CREATE TYPE "AbrangenciaPlano" AS ENUM ('CURSO_COMPLETO', 'MODULOS_ESPECIFICOS');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---- Plano ----
ALTER TABLE "plans"
  ADD COLUMN IF NOT EXISTS "gratuito" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "plans_gratuito_idx" ON "plans"("gratuito");

-- Só um plano gratuito por vez. Índice parcial: a restrição vale apenas
-- para as linhas com gratuito = true, deixando os planos pagos livres.
-- Sem isto, dois planos FREE simultâneos tornariam indefinido qual vale
-- para quem não assinou nada.
CREATE UNIQUE INDEX IF NOT EXISTS "plans_um_gratuito_apenas"
  ON "plans"(("gratuito")) WHERE "gratuito" = true;

-- ---- Assinatura ----
ALTER TABLE "subscriptions"
  ADD COLUMN IF NOT EXISTS "semExpiracao" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "concedidaManualmente" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "subscriptions_userId_status_idx"
  ON "subscriptions"("userId", "status");

-- ---- O que cada plano libera ----
CREATE TABLE IF NOT EXISTS "plan_courses" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "abrangencia" "AbrangenciaPlano" NOT NULL DEFAULT 'CURSO_COMPLETO',
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "plan_courses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "plan_courses_planId_courseId_key"
  ON "plan_courses"("planId", "courseId");
CREATE INDEX IF NOT EXISTS "plan_courses_courseId_idx" ON "plan_courses"("courseId");

CREATE TABLE IF NOT EXISTS "plan_modules" (
  "id" TEXT NOT NULL,
  "planCourseId" TEXT NOT NULL,
  "moduleId" TEXT NOT NULL,
  CONSTRAINT "plan_modules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "plan_modules_planCourseId_moduleId_key"
  ON "plan_modules"("planCourseId", "moduleId");
CREATE INDEX IF NOT EXISTS "plan_modules_moduleId_idx" ON "plan_modules"("moduleId");

-- Curso e plano sem CASCADE: apagar conteúdo que planos vendem é erro,
-- não intenção — o banco deve recusar em vez de esvaziar o plano em
-- silêncio. Módulo COM cascade: remover um módulo do curso legitimamente
-- o remove das seleções que o citavam.
ALTER TABLE "plan_courses"
  ADD CONSTRAINT "plan_courses_planId_fkey"
  FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "plan_courses"
  ADD CONSTRAINT "plan_courses_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "plan_modules"
  ADD CONSTRAINT "plan_modules_planCourseId_fkey"
  FOREIGN KEY ("planCourseId") REFERENCES "plan_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "plan_modules"
  ADD CONSTRAINT "plan_modules_moduleId_fkey"
  FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
