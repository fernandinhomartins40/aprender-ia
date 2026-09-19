-- A plataforma deixa de ter um curso só.
--
-- Até aqui, prompts, ferramentas, verbetes, missões, conquistas, apostila e
-- roteiros não precisavam dizer a que curso pertenciam: só havia o de
-- Educadores. Com um segundo curso, o que era implícito vira vazamento — um
-- empreendedor abriria "Prompts" e leria "Aja como professor(a) de
-- [DISCIPLINA]… habilidade BNCC".
--
-- Por isso `courseId` entra NULO em todas estas tabelas. Nulo significa
-- "vale para todos os cursos", que é exatamente o comportamento de hoje:
-- nenhuma linha existente muda de sentido, e o curso de Educadores continua
-- enxergando o acervo inteiro sem que uma única delas seja reescrita.

-- 1. Escopo por curso -------------------------------------------------------

ALTER TABLE "prompt_templates"  ADD COLUMN "courseId" TEXT;
ALTER TABLE "ai_tools"          ADD COLUMN "courseId" TEXT;
ALTER TABLE "knowledge_entries" ADD COLUMN "courseId" TEXT;
ALTER TABLE "missions"          ADD COLUMN "courseId" TEXT;
ALTER TABLE "achievements"      ADD COLUMN "courseId" TEXT;
ALTER TABLE "handbook_chapters" ADD COLUMN "courseId" TEXT;
ALTER TABLE "lesson_scripts"    ADD COLUMN "courseId" TEXT;

CREATE INDEX "prompt_templates_courseId_idx"  ON "prompt_templates"("courseId");
CREATE INDEX "ai_tools_courseId_idx"          ON "ai_tools"("courseId");
CREATE INDEX "knowledge_entries_courseId_idx" ON "knowledge_entries"("courseId");
CREATE INDEX "missions_courseId_idx"          ON "missions"("courseId");
CREATE INDEX "achievements_courseId_idx"      ON "achievements"("courseId");
CREATE INDEX "handbook_chapters_courseId_idx" ON "handbook_chapters"("courseId");
CREATE INDEX "lesson_scripts_courseId_ordem_idx" ON "lesson_scripts"("courseId", "ordem");

ALTER TABLE "prompt_templates"  ADD CONSTRAINT "prompt_templates_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_tools"          ADD CONSTRAINT "ai_tools_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "knowledge_entries" ADD CONSTRAINT "knowledge_entries_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "missions"          ADD CONSTRAINT "missions_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "achievements"      ADD CONSTRAINT "achievements_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "handbook_chapters" ADD CONSTRAINT "handbook_chapters_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lesson_scripts"    ADD CONSTRAINT "lesson_scripts_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. O prompt também serve a quem tem negócio -------------------------------
-- `disciplina` e `etapaEnsino` não dizem nada a um dono de salão. `setor` e
-- `porteEmpresa` são os equivalentes, e ficam nulos no curso de Educadores.

ALTER TABLE "prompt_templates" ADD COLUMN "setor" TEXT;
ALTER TABLE "prompt_templates" ADD COLUMN "porteEmpresa" TEXT;
ALTER TABLE "prompt_templates" ADD COLUMN "exemploPreenchido" TEXT;
CREATE INDEX "prompt_templates_setor_idx" ON "prompt_templates"("setor");

-- 3. Faixa de acesso das ferramentas ----------------------------------------
-- O curso promete priorizar o que é gratuito. Sem registrar a faixa, a
-- promessa só é conferida quando o cursista esbarra na assinatura.
-- O padrão é GRATUITO_COM_LIMITES porque é o caso da maioria das
-- ferramentas já cadastradas, e o mais honesto quando ninguém conferiu.

ALTER TABLE "ai_tools" ADD COLUMN "faixaAcesso" TEXT NOT NULL DEFAULT 'GRATUITO_COM_LIMITES';
ALTER TABLE "ai_tools" ADD COLUMN "limiteGratuito" TEXT;
ALTER TABLE "ai_tools" ADD COLUMN "verificadoEm" TIMESTAMP(3);
ALTER TABLE "ai_tools" ADD COLUMN "fonteUrl" TEXT;

-- 4. Formatos de aula que o curso de negócios exige -------------------------

ALTER TYPE "TipoLicao" ADD VALUE 'LABORATORIO';
ALTER TYPE "TipoLicao" ADD VALUE 'ANTES_DEPOIS';
ALTER TYPE "TipoLicao" ADD VALUE 'FLUXO';
ALTER TYPE "TipoLicao" ADD VALUE 'PROJETO';

-- 5. O que o cursista produz e leva embora ----------------------------------

CREATE TABLE "prompt_user_versions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptTemplateId" TEXT NOT NULL,
    "titulo" TEXT,
    "corpo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompt_user_versions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "prompt_user_versions_userId_promptTemplateId_key"
  ON "prompt_user_versions"("userId", "promptTemplateId");
CREATE INDEX "prompt_user_versions_userId_idx" ON "prompt_user_versions"("userId");

ALTER TABLE "prompt_user_versions" ADD CONSTRAINT "prompt_user_versions_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prompt_user_versions" ADD CONSTRAINT "prompt_user_versions_promptTemplateId_fkey"
  FOREIGN KEY ("promptTemplateId") REFERENCES "prompt_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- A entrega do laboratório é presa ao usuário e à lição, não ao progresso:
-- quem refaz a lição volta ao próprio rascunho, em vez da folha em branco.
CREATE TABLE "lab_deliveries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "conteudo" JSONB NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lab_deliveries_userId_lessonId_key" ON "lab_deliveries"("userId", "lessonId");
CREATE INDEX "lab_deliveries_userId_idx" ON "lab_deliveries"("userId");
CREATE INDEX "lab_deliveries_lessonId_idx" ON "lab_deliveries"("lessonId");

ALTER TABLE "lab_deliveries" ADD CONSTRAINT "lab_deliveries_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lab_deliveries" ADD CONSTRAINT "lab_deliveries_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- O projeto final atravessa o curso inteiro. As seções ficam em JSON porque
-- mudam junto com o conteúdo, e nenhuma dessas mudanças deveria exigir uma
-- migração de banco.
CREATE TABLE "final_projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "negocio" JSONB NOT NULL,
    "secoes" JSONB NOT NULL DEFAULT '{}',
    "concluidoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "final_projects_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "final_projects_userId_courseId_key" ON "final_projects"("userId", "courseId");
CREATE INDEX "final_projects_userId_idx" ON "final_projects"("userId");

ALTER TABLE "final_projects" ADD CONSTRAINT "final_projects_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "final_projects" ADD CONSTRAINT "final_projects_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
