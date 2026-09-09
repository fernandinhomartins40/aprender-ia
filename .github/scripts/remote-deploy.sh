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
# O binário do prisma não existe em node_modules/.bin no estágio runner:
# ele é devDependency e o pnpm não cria o symlink na imagem final. Por
# isso localizamos o pacote no store do pnpm e chamamos o build/index.js
# diretamente com node.
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" \
  run --rm --entrypoint sh web -c '
    set -e
    cd /app
    PRISMA_CLI=$(ls -d node_modules/.pnpm/prisma@*/node_modules/prisma/build/index.js 2>/dev/null | head -1)
    if [ -z "$PRISMA_CLI" ]; then
      echo "ERRO: CLI do Prisma não encontrado na imagem." >&2
      exit 1
    fi
    echo "    usando $PRISMA_CLI"
    node "$PRISMA_CLI" migrate deploy --schema packages/db/prisma/schema.prisma
  ' || { echo "ERRO: falha ao aplicar migrations." >&2; exit 1; }

# ------------------------------------------------------------
# Seed — idempotente: cria o curso, as lições e o primeiro admin
# sem duplicar nada em execuções repetidas.
# ------------------------------------------------------------
echo "==> Semeando conteúdo..."
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE"   run --rm --entrypoint sh web -c '
    cd /app
    # O tsx tem layout de arquivos variável entre versões; procuramos o
    # entrypoint real em vez de fixar um caminho que quebra a cada bump.
    # O bin declarado pelo tsx é dist/cli.mjs. Resolvemos pelo glob do
    # store do pnpm, com fallback para .cjs em versões mais antigas.
    TSX=$(ls -d node_modules/.pnpm/tsx@*/node_modules/tsx/dist/cli.mjs 2>/dev/null | head -1)
    [ -z "$TSX" ] && TSX=$(ls -d node_modules/.pnpm/tsx@*/node_modules/tsx/dist/cli.cjs 2>/dev/null | head -1)
    if [ -z "$TSX" ]; then
      echo "    tsx não encontrado; seed ignorado nesta release." >&2
      exit 0
    fi
    echo "    usando $TSX"
    node "$TSX" packages/db/prisma/seed.ts
  ' || echo "AVISO: seed não concluiu; a aplicação segue no ar." >&2

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
