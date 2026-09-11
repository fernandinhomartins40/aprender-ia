-- Respostas escritas pelo aluno nas atividades de texto livre.
--
-- Até aqui, o que o professor escrevia no DUELO, no CASO e no CHECKPOINT
-- vivia só no estado do React: sair da tela apagava tudo. Não havia
-- retomada, não havia histórico e o painel não tinha o que mostrar sobre
-- a prática — só quantas lições foram marcadas como concluídas.
--
-- Por que uma tabela nova em vez de `exercise_responses`:
--
--   1. Aquela tabela exige `exerciseId` apontando para `exercises`, e
--      estas lições não têm registro em `exercises` — o conteúdo delas
--      mora no JSON de `lessons`. Criar exercícios sintéticos só para
--      satisfazer a chave estrangeira seria inventar dado.
--   2. Ela guarda `correta BOOLEAN`. Um prompt não é certo ou errado: o
--      motor P.T.C.F. devolve quatro dimensões, cada uma em três estados.
--      Achatar isso num booleano jogaria fora justamente a informação que
--      dá valor à atividade.
--
-- `exercise_responses` continua de pé e intocada, para os exercícios de
-- múltipla escolha.

CREATE TABLE "respostas_abertas" (
    "id" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    -- Qual atividade dentro da lição. Uma lição pode ter mais de um campo
    -- aberto no futuro; hoje é sempre "principal".
    "chave" TEXT NOT NULL DEFAULT 'principal',
    "texto" TEXT NOT NULL,
    -- O resultado do motor no momento em que a pessoa enviou. Guardado, e
    -- não recalculado na leitura, porque o motor vai evoluir: sem isto,
    -- uma análise feita hoje mudaria sozinha depois de um ajuste no
    -- léxico, e o histórico deixaria de refletir o que a pessoa viu.
    "analise" JSONB,
    -- Atalho para ordenar e filtrar no painel sem abrir o JSON.
    "completas" INTEGER NOT NULL DEFAULT 0,
    "tentativa" INTEGER NOT NULL DEFAULT 1,

    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respostas_abertas_pkey" PRIMARY KEY ("id")
);

-- Uma linha por campo por lição: reenviar ATUALIZA em vez de acumular.
-- O aluno reescreve várias vezes seguidas enquanto melhora o prompt (é o
-- comportamento que queremos), e guardar cada tentativa encheria a tabela
-- de rascunhos sem valor. `tentativa` conta quantas vezes foi reenviado.
CREATE UNIQUE INDEX "respostas_abertas_progressId_chave_key"
    ON "respostas_abertas"("progressId", "chave");

CREATE INDEX "respostas_abertas_progressId_idx" ON "respostas_abertas"("progressId");

-- CASCADE: progresso apagado (matrícula removida) não deixa resposta
-- órfã apontando para linha inexistente.
ALTER TABLE "respostas_abertas" ADD CONSTRAINT "respostas_abertas_progressId_fkey"
    FOREIGN KEY ("progressId") REFERENCES "lesson_progress"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
