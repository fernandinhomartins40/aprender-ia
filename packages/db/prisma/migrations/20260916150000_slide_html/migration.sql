-- O slide como está no deck, para ser desenhado com o CSS do deck.
--
-- Os `blocos` continuam: são a leitura estruturada que o painel do professor
-- consulta ("quantos marcaram este item?"). O que muda é que o desenho deixa
-- de ser reconstruído a partir deles e passa a ser o slide real.
--
-- Nulo nos passos antigos: o seed preenche no deploy seguinte, e a tela cai
-- nos blocos enquanto isso.
ALTER TABLE "script_steps" ADD COLUMN "html" TEXT;
