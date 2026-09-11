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
# Versão do service worker
#
# O sw.js guarda os assets de /_next/static com cache-first e só apaga
# caches cuja chave difere da atual. Com uma VERSAO fixa no código, essa
# limpeza nunca acontecia: o navegador de quem já visitou o site seguia
# com os chunks do build antigo e passava a misturar HTML novo com
# JavaScript velho depois de cada deploy. Carimbamos a release aqui, no
# arquivo, antes do build da imagem.
# ------------------------------------------------------------
SW="$RELEASE_DIR/apps/web/public/sw.js"
if [ -f "$SW" ]; then
  sed -i "s/^const VERSAO = \".*\";/const VERSAO = \"aprender-ia-$RELEASE\";/" "$SW"
  echo "==> Service worker versionado: $(grep -m1 '^const VERSAO' "$SW")"
else
  echo "AVISO: sw.js não encontrado em $SW; cache do navegador não será invalidado." >&2
fi

# ------------------------------------------------------------
# Build e subida
# ------------------------------------------------------------
echo "==> Construindo imagens..."
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" build --pull

# ------------------------------------------------------------
# Banco e migrations ANTES de trocar a aplicação.
#
# A ordem importa e já causou incidente: quando o container novo subia
# primeiro, ele passava a servir código que consulta tabelas e colunas
# que a migration ainda não tinha criado — e o painel quebrava com erro
# de servidor. Se a migration falhar aqui, o deploy aborta com a versão
# ANTIGA no ar, que é o estado seguro.
#
# Só o Postgres sobe nesta etapa; a aplicação vem depois.
# ------------------------------------------------------------
echo "==> Subindo o banco..."
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" up -d postgres

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
# Só agora a aplicação sobe.
#
# Banco migrado primeiro, aplicação depois: assim o container novo nunca
# serve código que consulta tabela ou coluna que ainda não existe. Se
# algo acima falhou, o deploy já abortou com a versão antiga no ar.
# ------------------------------------------------------------
echo "==> Subindo a aplicação..."
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" up -d --remove-orphans

# Reengajamento diário às 9h de Brasília (a VPS opera em UTC). A rota
# aplica preferências, horário permitido, deduplicação e limite diário;
# o cron apenas acorda o motor. A instalação é idempotente e preserva os
# demais jobs da máquina.
if command -v crontab >/dev/null 2>&1; then
  CRON_TMP=$(mktemp)
  crontab -l 2>/dev/null | grep -v '# aprenderia-engajamento$' > "$CRON_TMP" || true
  printf '%s\n' "0 12 * * * SECRET=\$(grep '^CRON_SECRET=' '$ENV_FILE' | cut -d= -f2-); curl -fsS -X POST -H \"Authorization: Bearer \$SECRET\" 'http://127.0.0.1:${DEPLOY_PORT}/api/engajamento' >/dev/null 2>&1 # aprenderia-engajamento" >> "$CRON_TMP"
  crontab "$CRON_TMP"
  rm -f "$CRON_TMP"
  echo "==> Reengajamento diário agendado."
else
  echo "AVISO: crontab indisponível; rota de engajamento criada, mas sem agendamento." >&2
fi

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
