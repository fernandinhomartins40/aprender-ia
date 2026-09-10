-- Fundação do painel administrativo: configurações editáveis, registro de
-- ações e o carimbo de último acesso.
--
-- `ultimoAcessoEm` entra nulo: não há como saber retroativamente quando
-- cada pessoa entrou pela última vez, e inventar uma data faria todo aluno
-- antigo aparecer como ativo (ou inativo) sem base.

ALTER TABLE "users" ADD COLUMN "ultimoAcessoEm" TIMESTAMP(3);
CREATE INDEX "users_ultimoAcessoEm_idx" ON "users"("ultimoAcessoEm");

-- ---- configurações ----
CREATE TYPE "TipoConfiguracao" AS ENUM ('TEXTO', 'NUMERO', 'BOOLEANO', 'JSON');

CREATE TABLE "platform_settings" (
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo" "TipoConfiguracao" NOT NULL DEFAULT 'TEXTO',
    "grupo" TEXT NOT NULL DEFAULT 'geral',
    "rotulo" TEXT NOT NULL,
    "descricao" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "atualizadoPor" TEXT,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("chave")
);

CREATE INDEX "platform_settings_grupo_idx" ON "platform_settings"("grupo");

-- ---- auditoria ----
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "atorId" TEXT,
    "atorNome" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT,
    "resumo" TEXT NOT NULL,
    "dados" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "admin_audit_logs_atorId_idx" ON "admin_audit_logs"("atorId");
CREATE INDEX "admin_audit_logs_entidade_entidadeId_idx" ON "admin_audit_logs"("entidade", "entidadeId");
CREATE INDEX "admin_audit_logs_criadoEm_idx" ON "admin_audit_logs"("criadoEm");
CREATE INDEX "admin_audit_logs_acao_idx" ON "admin_audit_logs"("acao");

-- O log sobrevive à exclusão do ator: SET NULL preserva o registro com o
-- nome já gravado em "atorNome".
ALTER TABLE "admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_atorId_fkey"
    FOREIGN KEY ("atorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
