#!/usr/bin/env bash
# ============================================================
# Aprender IA — deploy na VPS
# Executado dentro da release recém-enviada.
# Variáveis esperadas: APP_ROOT, RELEASE, DEPLOY_PORT
# ============================================================
set -euo pipefail

APP_ROOT="${APP_ROOT:?APP_ROOT não definido}"
RELEASE="${RELEASE:?RELEASE não definido}"
DEPLOY_PORT="${DEPLOY_PORT:?DEPLOY_PORT não definido}"

RELEASE_DIR="$APP_ROOT/releases/$RELEASE"
CURRENT_LINK="$APP_ROOT/current"
ENV_FILE="$APP_ROOT/.env"

echo "==> Deploy da release $RELEASE"
cd "$RELEASE_DIR"

# O .env vive fora da release para sobreviver a novos deploys
if [ ! -f "$ENV_FILE" ]; then
  echo "ERRO: $ENV_FILE não encontrado." >&2
  exit 1
fi
ln -sfn "$ENV_FILE" "$RELEASE_DIR/.env"

# ------------------------------------------------------------
# Espaço em disco — a VPS é compartilhada com ~20 aplicações e
# um build sem espaço deixa TODAS elas instáveis.
# ------------------------------------------------------------
LIVRE_GB=$(df -BG --output=avail / | tail -1 | tr -dc '0-9')
echo "==> Espaço livre: ${LIVRE_GB}GB"
if [ "$LIVRE_GB" -lt 5 ]; then
  echo "Espaço crítico. Limpando cache de build do Docker..."
  docker builder prune -af >/dev/null 2>&1 || true
  LIVRE_GB=$(df -BG --output=avail / | tail -1 | tr -dc '0-9')
  echo "==> Após limpeza: ${LIVRE_GB}GB"
  if [ "$LIVRE_GB" -lt 3 ]; then
    echo "ERRO: menos de 3GB livres. Deploy abortado para não derrubar a VPS." >&2
    exit 1
  fi
fi

# ------------------------------------------------------------
# Build e subida
# ------------------------------------------------------------
echo "==> Construindo imagens..."
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" build --pull

echo "==> Subindo serviços..."
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" up -d --remove-orphans

# ------------------------------------------------------------
# Migrations — depois do banco estar saudável
# ------------------------------------------------------------
echo "==> Aguardando o banco ficar pronto..."
for i in $(seq 1 30); do
  if docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" \
       exec -T postgres pg_isready -q 2>/dev/null; then
    echo "    banco pronto."
    break
  fi
  [ "$i" -eq 30 ] && { echo "ERRO: banco não respondeu em 60s." >&2; exit 1; }
  sleep 2
done

echo "==> Aplicando migrations..."
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" \
  run --rm --entrypoint sh web \
  -c "cd /app && node_modules/.bin/prisma migrate deploy --schema packages/db/prisma/schema.prisma" \
  || { echo "ERRO: falha ao aplicar migrations." >&2; exit 1; }

# ------------------------------------------------------------
# Aponta 'current' para esta release
# ------------------------------------------------------------
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

# ------------------------------------------------------------
# Mantém apenas as 3 releases mais recentes
# ------------------------------------------------------------
cd "$APP_ROOT/releases"
ls -1dt */ 2>/dev/null | tail -n +4 | xargs -r rm -rf
echo "==> Releases mantidas: $(ls -1d */ 2>/dev/null | wc -l)"

echo "==> Deploy concluído."
