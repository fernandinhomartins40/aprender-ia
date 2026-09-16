-- Acompanhe a Aula: o aluno segue o encontro pelo celular.
--
-- Nasceu de um problema concreto da primeira aula: os alunos se perdiam só
-- com a projeção, e a aula parava várias vezes para ensinar, um a um, a
-- acessar as IAs. Aqui cada passo da aula chega ao celular já com o prompt
-- preenchível e o botão que abre a ferramenta.
--
-- São quatro tabelas novas. Nenhuma coluna de tabela existente muda, então
-- nada do que já funciona é afetado por esta migration.

-- O roteiro de um encontro: a versão navegável dos slides.
CREATE TABLE IF NOT EXISTS "lesson_scripts" (
  "id"           TEXT NOT NULL,
  -- Roteiro de uma turma específica, quando o conteúdo é só dela.
  "cohortId"     TEXT,
  -- Ou preso a um encontro do calendário.
  "meetingId"    TEXT,
  "titulo"       TEXT NOT NULL,
  -- Encontro 1, 2, 3... ordena a lista.
  "ordem"        INTEGER NOT NULL DEFAULT 1,
  "ativo"        BOOLEAN NOT NULL DEFAULT true,
  "criadoEm"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "lesson_scripts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "lesson_scripts_meetingId_key"
  ON "lesson_scripts"("meetingId");
CREATE INDEX IF NOT EXISTS "lesson_scripts_cohortId_ordem_idx"
  ON "lesson_scripts"("cohortId", "ordem");

-- Um passo do roteiro — equivale a um slide da projeção.
CREATE TABLE IF NOT EXISTS "script_steps" (
  "id"       TEXT NOT NULL,
  "scriptId" TEXT NOT NULL,
  "ordem"    INTEGER NOT NULL,
  "titulo"   TEXT NOT NULL,
  -- Texto, prompt, ferramenta, checklist, imagem — em JSON porque a
  -- combinação muda de passo para passo, e a tela lê tudo de uma vez.
  "blocos"   JSONB NOT NULL,
  CONSTRAINT "script_steps_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "script_steps_scriptId_ordem_key"
  ON "script_steps"("scriptId", "ordem");

-- Uma apresentação acontecendo agora.
--
-- É o que diz ao aluno em que passo o professor está. Como o professor
-- apresenta pela própria aplicação, avançar o slide já atualiza `passoAtual`
-- — não existe botão de "publicar" para ele lembrar de clicar no meio da aula.
CREATE TABLE IF NOT EXISTS "live_sessions" (
  "id"          TEXT NOT NULL,
  "scriptId"    TEXT NOT NULL,
  "meetingId"   TEXT,
  "passoAtual"  INTEGER NOT NULL DEFAULT 1,
  "iniciadaEm"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "encerradaEm" TIMESTAMP(3),
  CONSTRAINT "live_sessions_pkey" PRIMARY KEY ("id")
);

-- A busca do aluno é sempre "sessão aberta deste roteiro".
CREATE INDEX IF NOT EXISTS "live_sessions_meetingId_encerradaEm_idx"
  ON "live_sessions"("meetingId", "encerradaEm");
CREATE INDEX IF NOT EXISTS "live_sessions_scriptId_encerradaEm_idx"
  ON "live_sessions"("scriptId", "encerradaEm");

-- O que cada aluno marcou e digitou num passo.
--
-- Serve ao painel do professor ("7 ainda não criaram conta") e ao próprio
-- aluno, que reencontra o que escreveu ao voltar a um passo.
CREATE TABLE IF NOT EXISTS "step_progress" (
  "id"       TEXT NOT NULL,
  "userId"   TEXT NOT NULL,
  "stepId"   TEXT NOT NULL,
  -- Índices dos itens de checklist marcados.
  "marcados" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  -- O que ele digitou nos campos do prompt: { "ANO": "6º ano" }.
  "valores"  JSONB,
  "visto"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "step_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "step_progress_userId_stepId_key"
  ON "step_progress"("userId", "stepId");
CREATE INDEX IF NOT EXISTS "step_progress_stepId_idx"
  ON "step_progress"("stepId");

-- Chaves estrangeiras.
--
-- ON DELETE CASCADE em todas: apagar um roteiro não pode deixar passos órfãos,
-- e apagar um aluno não pode deixar progresso apontando para ninguém.
ALTER TABLE "script_steps"
  ADD CONSTRAINT "script_steps_scriptId_fkey"
  FOREIGN KEY ("scriptId") REFERENCES "lesson_scripts"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "live_sessions"
  ADD CONSTRAINT "live_sessions_scriptId_fkey"
  FOREIGN KEY ("scriptId") REFERENCES "lesson_scripts"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "step_progress"
  ADD CONSTRAINT "step_progress_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "step_progress"
  ADD CONSTRAINT "step_progress_stepId_fkey"
  FOREIGN KEY ("stepId") REFERENCES "script_steps"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
