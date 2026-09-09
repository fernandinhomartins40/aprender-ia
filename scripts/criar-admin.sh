#!/usr/bin/env bash
# ============================================================
# Cria (ou promove) um administrador da plataforma.
#
# Rode NA VPS, dentro de /opt/aprenderia/current:
#
#   ADMIN_EMAIL=voce@email.com ADMIN_NOME="Seu Nome" \
#     bash scripts/criar-admin.sh
#
# A senha pode ser informada em ADMIN_PASSWORD. Se não vier,
# uma senha forte é gerada e exibida uma única vez.
# ============================================================
set -euo pipefail

ENV_FILE="${ENV_FILE:-/opt/aprenderia/.env}"
COMPOSE="${COMPOSE:-docker-compose.prod.yml}"

if [ -z "${ADMIN_EMAIL:-}" ]; then
  echo "ERRO: defina ADMIN_EMAIL." >&2
  echo "Ex: ADMIN_EMAIL=voce@email.com ADMIN_NOME=\"Seu Nome\" bash scripts/criar-admin.sh" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "ERRO: $ENV_FILE não encontrado." >&2
  exit 1
fi

docker compose -f "$COMPOSE" --env-file "$ENV_FILE" \
  run --rm \
  -e ADMIN_EMAIL="$ADMIN_EMAIL" \
  -e ADMIN_NOME="${ADMIN_NOME:-Administrador}" \
  ${ADMIN_PASSWORD:+-e ADMIN_PASSWORD="$ADMIN_PASSWORD"} \
  --entrypoint sh web -c '
    set -e
    cd /app
    TSX=$(ls -d node_modules/.pnpm/tsx@*/node_modules/tsx/dist/cli.mjs 2>/dev/null | head -1)
    [ -z "$TSX" ] && TSX=$(ls -d node_modules/.pnpm/tsx@*/node_modules/tsx/dist/cli.cjs 2>/dev/null | head -1)
    if [ -z "$TSX" ]; then
      echo "ERRO: tsx não encontrado na imagem." >&2
      exit 1
    fi
    node "$TSX" packages/db/prisma/seed-admin.ts
  '
