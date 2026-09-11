-- A trilha passa a reproduzir a apostila inteira.
--
-- Medido antes desta migration: a plataforma tinha 18 lições para uma
-- apostila que pede ~70. Faltavam 7 dos 8 duelos, os 8 estudos de caso,
-- os 4 testes no celular, os 4 desafios cronometrados e os 4
-- aquecimentos — 26% do curso.
--
-- Três formatos da apostila não tinham tipo correspondente:
--
--   AQUECIMENTO — abre cada encontro com uma pergunta que conecta o
--                 conteúdo à dor real antes de qualquer teoria.
--   NO_CELULAR  — o cursista faz agora, no próprio aparelho. Existe
--                 para derrubar a barreira do "não tenho computador".
--   EMERGENCIA  — o Guia de Bolso (Cap. 12): 6 prompts para imprevistos
--                 da rotina, consultados no momento do aperto.
--
-- DESAFIO, CASO e CHECKPOINT já existiam no enum e nunca foram usados:
-- os players estavam prontos e sem conteúdo. Não são criados aqui.

ALTER TYPE "TipoLicao" ADD VALUE IF NOT EXISTS 'AQUECIMENTO';
ALTER TYPE "TipoLicao" ADD VALUE IF NOT EXISTS 'NO_CELULAR';
ALTER TYPE "TipoLicao" ADD VALUE IF NOT EXISTS 'EMERGENCIA';

-- Módulo pago: é o que sustenta a trilha AVANÇADA.
--
-- O bloqueio existente é por CURSO (`courses.pago` + avaliarAcesso).
-- Como o Extra e o Avançado são módulos do mesmo curso, o controle
-- precisa descer um nível. `false` em tudo que já existe: nenhum módulo
-- de hoje muda de comportamento.
ALTER TABLE "modules" ADD COLUMN IF NOT EXISTS "pago" BOOLEAN NOT NULL DEFAULT false;

-- Rótulo curto para a trilha agrupar visualmente ("Extra", "Avançado").
-- Nulo nos encontros normais, que não precisam de selo.
ALTER TABLE "modules" ADD COLUMN IF NOT EXISTS "faixa" TEXT;
