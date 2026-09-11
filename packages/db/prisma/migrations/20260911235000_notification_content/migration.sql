CREATE TABLE "notification_contents" (
  "id" TEXT NOT NULL, "slug" TEXT NOT NULL, "titulo" TEXT NOT NULL, "subtitulo" TEXT, "corpo" TEXT NOT NULL, "imagemUrl" TEXT, "videoUrl" TEXT, "icone" TEXT NOT NULL DEFAULT 'notificacoes', "categoria" TEXT NOT NULL DEFAULT 'ESSENCIAL', "prioridade" INTEGER NOT NULL DEFAULT 0, "ctaRotulo" TEXT, "ctaLink" TEXT, "ctaExterno" BOOLEAN NOT NULL DEFAULT false, "publico" TEXT NOT NULL DEFAULT 'todos', "publicoId" TEXT, "status" TEXT NOT NULL DEFAULT 'RASCUNHO', "publicarEm" TIMESTAMP(3), "expiraEm" TIMESTAMP(3), "criadoPor" TEXT, "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "atualizadoEm" TIMESTAMP(3) NOT NULL, CONSTRAINT "notification_contents_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "notification_contents_slug_key" ON "notification_contents"("slug");
CREATE INDEX "notification_contents_status_publicarEm_idx" ON "notification_contents"("status", "publicarEm");
ALTER TABLE "notifications" ADD COLUMN "contentId" TEXT;
CREATE INDEX "notifications_contentId_idx" ON "notifications"("contentId");
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "notification_contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
