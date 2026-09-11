CREATE TABLE "notification_preferences" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "lembretesEstudo" BOOLEAN NOT NULL DEFAULT true,
  "novosDesafios" BOOLEAN NOT NULL DEFAULT true,
  "conquistas" BOOLEAN NOT NULL DEFAULT true,
  "missoes" BOOLEAN NOT NULL DEFAULT true,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notification_preferences_userId_key"
  ON "notification_preferences"("userId");

ALTER TABLE "notification_preferences"
  ADD CONSTRAINT "notification_preferences_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
