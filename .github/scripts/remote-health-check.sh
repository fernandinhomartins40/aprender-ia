#!/usr/bin/env bash
# ============================================================
# Aprender IA — verificação pós-deploy dentro da VPS
# Variáveis esperadas: APP_ROOT, DEPLOY_PORT, RELEASE
# ============================================================
set -euo pipefail

APP_ROOT="${APP_ROOT:?}"
DEPLOY_PORT="${DEPLOY_PORT:?}"
RELEASE="${RELEASE:?}"

RELEASE_DIR="$APP_ROOT/releases/$RELEASE"
ENV_FILE="$APP_ROOT/.env"
cd "$RELEASE_DIR"

falhas=0

echo "==> Estado dos containers"
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" ps \
  --format 'table {{.Service}}\t{{.State}}\t{{.Status}}'

# ------------------------------------------------------------
# Nenhum container pode estar reiniciando em laço
# ------------------------------------------------------------
reiniciando=$(docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" ps \
  --format '{{.Service}} {{.State}}' | awk '$2=="restarting"{print $1}')
if [ -n "$reiniciando" ]; then
  echo "::error::Containers em restart loop: $reiniciando" >&2
  falhas=1
fi

# ------------------------------------------------------------
# nginx interno responde?
# ------------------------------------------------------------
echo "==> Verificando nginx interno em 127.0.0.1:${DEPLOY_PORT}"
for i in $(seq 1 20); do
  codigo=$(curl -s -o /dev/null -w '%{http_code}' --max-time 8 \
    "http://127.0.0.1:${DEPLOY_PORT}/health" 2>/dev/null || echo 000)
  if [ "$codigo" = "200" ]; then
    echo "    nginx interno ok"
    break
  fi
  if [ "$i" -eq 20 ]; then
    echo "::error::nginx interno não respondeu (último código: $codigo)" >&2
    falhas=1
  fi
  sleep 3
done

# ------------------------------------------------------------
# A aplicação responde?
# ------------------------------------------------------------
echo "==> Verificando a aplicação"
for i in $(seq 1 30); do
  codigo=$(curl -s -o /dev/null -w '%{http_code}' --max-time 12 \
    "http://127.0.0.1:${DEPLOY_PORT}/api/health" 2>/dev/null || echo 000)
  if [ "$codigo" = "200" ]; then
    echo "    aplicação ok"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "::error::A aplicação não respondeu em /api/health (último código: $codigo)" >&2
    echo "--- últimas linhas do log do web ---" >&2
    docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" \
      logs --tail 40 web >&2 || true
    falhas=1
  fi
  sleep 4
done

# ------------------------------------------------------------
# Banco acessível
# ------------------------------------------------------------
echo "==> Verificando o banco"
if docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" \
     exec -T postgres pg_isready -q 2>/dev/null; then
  echo "    banco ok"
else
  echo "::error::Banco não respondeu ao pg_isready" >&2
  falhas=1
fi

if [ "$falhas" -ne 0 ]; then
  echo "Verificação falhou." >&2
  exit 1
fi

echo "==> Tudo saudável."
