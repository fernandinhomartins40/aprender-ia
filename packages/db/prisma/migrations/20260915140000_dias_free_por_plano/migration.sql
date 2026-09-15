-- Dias de acesso gratuito definidos POR PLANO.
--
-- Até aqui o prazo do acesso gratuito era um número único da plataforma,
-- guardado em `platform_settings` sob a chave `free.dias_padrao` (padrão 30).
-- Isso bastava enquanto existia um só jeito de entrar de graça, mas não
-- permite ter dois planos gratuitos com prazos diferentes — por exemplo, um
-- de degustação curto e outro para uma rede parceira.
--
-- O campo é novo, e NÃO um reaproveitamento de `dias_acesso`. Aquele
-- pertence ao ciclo de uma compra de periodicidade UNICA e é lido por
-- `somarPeriodo` para calcular vencimento de assinatura. Usar a mesma coluna
-- para as duas coisas faria o número significar "dias de acesso pago" ou
-- "dias de acesso gratuito" conforme o plano, e quem fosse mexer em cobrança
-- depois teria de descobrir isso lendo o código inteiro.
--
-- Nulo mantém o comportamento atual: o prazo vem de `free.dias_padrao`. Só
-- quando preenchido o plano passa a mandar. Nenhuma linha existente muda de
-- comportamento por causa desta migration.
ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "diasFree" INTEGER;

COMMENT ON COLUMN "plans"."diasFree" IS
  'Dias de acesso gratuito concedidos por este plano quando ele é o gratuito. Nulo = usa free.dias_padrao das configurações. 0 = sem expiração.';
