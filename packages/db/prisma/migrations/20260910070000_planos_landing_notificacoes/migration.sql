-- Fases 3, 4 e 5 do painel administrativo:
--   planos e assinaturas (com campos prontos para um gateway futuro),
--   conteúdo editável da landing page,
--   notificações registradas por aluno.
--
-- Nada aqui altera dado existente. As tabelas nascem vazias e as colunas
-- novas em `payments` nascem nulas, então nenhuma cobrança já lançada muda
-- de significado.

-- ============================================================
-- PLANOS E ASSINATURAS
-- ============================================================

CREATE TYPE "Periodicidade" AS ENUM ('MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL', 'UNICA');

CREATE TYPE "StatusAssinatura" AS ENUM ('ATIVA', 'INADIMPLENTE', 'CANCELADA', 'EXPIRADA');

CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "precoCentavos" INTEGER NOT NULL,
    "periodicidade" "Periodicidade" NOT NULL DEFAULT 'MENSAL',
    "diasAcesso" INTEGER,
    "diasTeste" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "publico" BOOLEAN NOT NULL DEFAULT true,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "beneficios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "plans_slug_key" ON "plans"("slug");
CREATE INDEX "plans_ativo_idx" ON "plans"("ativo");

CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "StatusAssinatura" NOT NULL DEFAULT 'ATIVA',
    "precoCentavos" INTEGER NOT NULL,
    "periodicidade" "Periodicidade" NOT NULL,
    "inicioEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cicloFimEm" TIMESTAMP(3),
    "proximaEm" TIMESTAMP(3),
    "canceladoEm" TIMESTAMP(3),
    "motivoCancelamento" TEXT,
    "canceladoPor" TEXT,
    "falhasSeguidas" INTEGER NOT NULL DEFAULT 0,
    "gatewayProvedor" TEXT,
    "gatewayId" TEXT,
    "gatewayStatus" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");
CREATE INDEX "subscriptions_proximaEm_idx" ON "subscriptions"("proximaEm");

ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RESTRICT: apagar um plano que tem assinatura é erro de operação, não
-- intenção. O caminho correto é desativar o plano.
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---- Liga a cobrança à assinatura que a originou ----
ALTER TABLE "payments" ADD COLUMN "subscriptionId" TEXT;
ALTER TABLE "payments" ADD COLUMN "gatewayId" TEXT;

CREATE INDEX "payments_subscriptionId_idx" ON "payments"("subscriptionId");

-- SET NULL: se a assinatura for apagada, o histórico financeiro fica.
-- O que já foi pago não pode desaparecer do relatório.
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey"
    FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- LANDING PAGE EDITÁVEL
-- ============================================================

CREATE TABLE "landing_sections" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL,
    "titulo" TEXT,
    "subtitulo" TEXT,
    "texto" TEXT,
    "ctaTexto" TEXT,
    "ctaLink" TEXT,
    "cta2Texto" TEXT,
    "cta2Link" TEXT,
    "selo" TEXT,
    "imagem" TEXT,
    "video" TEXT,
    "visivel" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "atualizadoPor" TEXT,

    CONSTRAINT "landing_sections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "landing_sections_chave_key" ON "landing_sections"("chave");

CREATE TABLE "landing_items" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "texto" TEXT,
    "extra" TEXT,
    "icone" TEXT,
    "cor" TEXT,
    "selo" TEXT,
    "imagem" TEXT,
    "link" TEXT,
    "visivel" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landing_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "landing_items_sectionId_ordem_idx" ON "landing_items"("sectionId", "ordem");

ALTER TABLE "landing_items" ADD CONSTRAINT "landing_items_sectionId_fkey"
    FOREIGN KEY ("sectionId") REFERENCES "landing_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- NOTIFICAÇÕES
-- ============================================================

CREATE TYPE "CanalNotificacao" AS ENUM ('PLATAFORMA', 'EMAIL', 'WHATSAPP');

CREATE TYPE "StatusNotificacao" AS ENUM ('PENDENTE', 'ENVIADA', 'FALHOU', 'REGISTRADA');

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canal" "CanalNotificacao" NOT NULL DEFAULT 'PLATAFORMA',
    "status" "StatusNotificacao" NOT NULL DEFAULT 'PENDENTE',
    "assunto" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "link" TEXT,
    "autorNome" TEXT,
    "enviadoEm" TIMESTAMP(3),
    "lidoEm" TIMESTAMP(3),
    "erro" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_userId_lidoEm_idx" ON "notifications"("userId", "lidoEm");
CREATE INDEX "notifications_assunto_idx" ON "notifications"("assunto");
CREATE INDEX "notifications_criadoEm_idx" ON "notifications"("criadoEm");

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
