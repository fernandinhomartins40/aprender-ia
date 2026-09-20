#!/usr/bin/env bash
# ============================================================
# Aprender IA — deploy na VPS
# Executado dentro da release recém-enviada.
# Variáveis esperadas: APP_ROOT, RELEASE, DEPLOY_PORT, IMAGE_TAG
#
# A VPS não compila mais: o build acontece no GitHub Actions e aqui só se
# baixa a imagem pronta. Ver o bloco "Imagem: baixada, não construída".
# ============================================================
set -euo pipefail

APP_ROOT="${APP_ROOT:?APP_ROOT não definido}"
RELEASE="${RELEASE:?RELEASE não definido}"
DEPLOY_PORT="${DEPLOY_PORT:?DEPLOY_PORT não definido}"
# Falhar aqui, e não no `pull`: sem a tag o compose puxaria `:latest` (ou uma
# referência vazia) e o deploy subiria uma versão que não é a deste commit —
# em silêncio, que é o pior modo de errar.
IMAGE_TAG="${IMAGE_TAG:?IMAGE_TAG não definido}"
export IMAGE_TAG

RELEASE_DIR="$APP_ROOT/releases/$RELEASE"
CURRENT_LINK="$APP_ROOT/current"
ENV_FILE="$APP_ROOT/.env"
LOCK_FILE="$APP_ROOT/.deploy.lock"
ESTADO_FILE="$APP_ROOT/.deploy-estado"

# ============================================================
# EXCLUSÃO MÚTUA — um deploy por vez nesta máquina.
#
# O `concurrency` do GitHub Actions impede duas execuções do MESMO workflow,
# mas não cobre dois casos reais:
#   - um deploy manual na VPS enquanto o automático roda;
#   - um `workflow_dispatch` disparado de outro branch/repo.
#
# Dois deploys simultâneos competem por CPU, disco e pelo MESMO container:
# um faz `up -d` enquanto o outro aplica migration, e o resultado é
# indeterminado. A trava aqui é a única que vale para a máquina inteira.
#
# `flock` é atômico e o descritor morre com o processo — se o deploy for
# morto (timeout do runner, queda de SSH), o lock é liberado pelo kernel,
# sem ficar preso exigindo limpeza manual.
# ============================================================
mkdir -p "$APP_ROOT"
if command -v flock >/dev/null 2>&1; then
  exec 9>"$LOCK_FILE"
  # `flock -n` devolve 1 quando a trava está ocupada. Qualquer outro código
  # é falha do próprio flock — e os dois casos exigem tratamento DIFERENTE.
  #
  # Tratar os dois como "ocupado" (que foi o primeiro jeito que escrevi,
  # e que um teste pegou) faria com que, se o flock falhasse por qualquer
  # motivo, TODO deploy passasse a ser recusado para sempre, com a mensagem
  # enganosa de "outro deploy em andamento". Proteção que trava a operação
  # inteira é pior que proteção nenhuma.
  flock -n 9 && TRAVA=ok || TRAVA=$?
  if [ "$TRAVA" = "1" ]; then
    DONO="$(cat "$LOCK_FILE" 2>/dev/null || echo 'desconhecido')"
    echo "ERRO: outro deploy está em andamento nesta VPS ($DONO)." >&2
    echo "      Aguarde a conclusão. Deploys simultâneos disputam CPU e disco" >&2
    echo "      e deixam o estado dos containers indeterminado." >&2
    exit 1
  elif [ "$TRAVA" != "ok" ]; then
    echo "AVISO: flock falhou (código $TRAVA); seguindo sem trava." >&2
    echo "       O 'concurrency' do GitHub Actions ainda impede execuções" >&2
    echo "       simultâneas do workflow." >&2
  else
    printf 'release=%s pid=%s inicio=%s\n' "$RELEASE" "$$" "$(date -Is)" >&9 || true
  fi
else
  # Não é o caso desta VPS (flock existe, verificado), mas um host novo
  # pode não ter util-linux completo.
  echo "AVISO: 'flock' indisponível; deploy segue sem trava local." >&2
  echo "       O 'concurrency' do workflow continua valendo." >&2
fi

echo "==> Deploy da release $RELEASE"
cd "$RELEASE_DIR"

# O .env vive fora da release para sobreviver a novos deploys
if [ ! -f "$ENV_FILE" ]; then
  echo "ERRO: $ENV_FILE não encontrado." >&2
  exit 1
fi
ln -sfn "$ENV_FILE" "$RELEASE_DIR/.env"

# ============================================================
# RECUPERAÇÃO — o deploy anterior terminou?
#
# Um deploy interrompido (timeout do runner, queda de SSH, falha de
# migration) deixa rastro: containers efêmeros de `run --rm` que nunca
# foram removidos porque o `--rm` não chega a executar quando o processo
# é morto, e a release pela metade no disco.
#
# Sem isto o lixo se acumula em silêncio a cada falha — que é exatamente
# como uma VPS compartilhada chega ao ponto de precisar de reset.
# ============================================================
if [ -f "$ESTADO_FILE" ] && [ "$(cat "$ESTADO_FILE" 2>/dev/null)" != "concluido" ]; then
  ANTERIOR="$(cat "$ESTADO_FILE" 2>/dev/null || echo '?')"
  echo "==> AVISO: o deploy anterior não concluiu (estado: $ANTERIOR)."
  echo "    Limpando o que ele deixou para trás..."

  # Containers efêmeros órfãos: `compose run` cria nomes com sufixo `-run-`.
  # Filtramos pelo rótulo do projeto para não tocar em NADA de outras apps.
  ORFAOS="$(docker ps -aq \
    --filter "label=com.docker.compose.project=aprenderia" \
    --filter "name=-run-" 2>/dev/null || true)"
  if [ -n "$ORFAOS" ]; then
    echo "$ORFAOS" | xargs -r docker rm -f >/dev/null 2>&1 || true
    echo "    containers efêmeros removidos: $(echo "$ORFAOS" | wc -l)"
  fi

  # Containers do projeto parados por um deploy que morreu no meio.
  PARADOS="$(docker ps -aq \
    --filter "label=com.docker.compose.project=aprenderia" \
    --filter "status=exited" \
    --filter "status=created" 2>/dev/null || true)"
  if [ -n "$PARADOS" ]; then
    # `media-init` termina como `exited` por natureza — o compose o recria
    # no próximo `up`, então removê-lo aqui é seguro e evita acúmulo.
    echo "$PARADOS" | xargs -r docker rm -f >/dev/null 2>&1 || true
    echo "    containers parados removidos: $(echo "$PARADOS" | wc -l)"
  fi
fi

# Marca o início. Só vira "concluido" no fim, se tudo der certo.
printf 'em-andamento release=%s desde=%s\n' "$RELEASE" "$(date -Is)" > "$ESTADO_FILE"

# ============================================================
# LIMPEZA EM CASO DE FALHA
#
# `set -e` aborta o script no primeiro erro, mas a saída abrupta deixa
# rastro: containers de `run --rm` que não chegaram a ser removidos. Sem
# este trap, esse lixo só seria varrido no PRÓXIMO deploy — e se o próximo
# demorar dias, ele fica ocupando espaço até lá.
#
# O trap roda em qualquer saída não-zero, inclusive SIGTERM/SIGINT (runner
# cancelado, SSH derrubado). Não toca em volume, não toca na aplicação que
# está no ar: remove apenas os efêmeros DESTE projeto.
#
# 🔴 Deliberadamente NÃO faz `down` nem reverte a aplicação. Se a falha foi
# antes do `up`, a versão antiga segue no ar — que é o estado seguro. Um
# `down` automático aqui transformaria uma falha de deploy numa queda do
# site.
# ============================================================
limpar_em_falha() {
  codigo=$?
  [ "$codigo" -eq 0 ] && return 0
  echo "==> Deploy falhou (código $codigo). Removendo containers efêmeros..." >&2
  docker ps -aq \
    --filter "label=com.docker.compose.project=aprenderia" \
    --filter "name=-run-" 2>/dev/null \
    | xargs -r docker rm -f >/dev/null 2>&1 || true
  printf 'falhou release=%s codigo=%s em=%s\n' "$RELEASE" "$codigo" "$(date -Is)" > "$ESTADO_FILE"
  echo "==> Estado registrado. O próximo deploy limpará o restante." >&2
  return "$codigo"
}
trap limpar_em_falha EXIT INT TERM

# ------------------------------------------------------------
# Espaço em disco — a VPS é compartilhada e um deploy sem espaço deixa
# TODAS as aplicações do host instáveis.
#
# A folga exigida caiu de 5GB para 3GB: sem build local, não há mais
# camadas intermediárias nem cache de build ocupando disco aqui. O que
# resta é o tamanho da imagem baixada do registry.
# ------------------------------------------------------------
LIVRE_GB=$(df -BG --output=avail / | tail -1 | tr -dc '0-9')
echo "==> Espaço livre: ${LIVRE_GB}GB"
if [ "$LIVRE_GB" -lt 3 ]; then
  echo "Espaço baixo. Removendo imagens órfãs DESTE projeto..."
  # Escopo restrito de propósito: `docker image prune -a` global apagaria
  # imagens de OUTROS projetos da VPS. O filtro por rótulo atinge só as
  # nossas, e `-f dangling=true` só as que nenhuma tag referencia.
  docker image prune -f --filter "label=org.opencontainers.image.source=https://github.com/fernandinhomartins40/aprender-ia" >/dev/null 2>&1 || true
  docker image prune -f >/dev/null 2>&1 || true
  LIVRE_GB=$(df -BG --output=avail / | tail -1 | tr -dc '0-9')
  echo "==> Após limpeza: ${LIVRE_GB}GB"
  if [ "$LIVRE_GB" -lt 2 ]; then
    echo "ERRO: menos de 2GB livres. Deploy abortado para não derrubar a VPS." >&2
    exit 1
  fi
fi

# ------------------------------------------------------------
# Imagem: baixada, não construída.
#
# O build migrou para o GitHub Actions (ver .github/workflows/deploy.yml).
# Medido no deploy #79: o `next build` sozinho levava 157,6s DENTRO desta
# VPS, e o passo de deploy consumia 333s — 88% do tempo total —, competindo
# por CPU e disco com as demais aplicações do host. Três deploys (#75, #76,
# #77) chegaram a morrer no limite de tempo, com 45min, quando o cache do
# pnpm esfriava.
#
# Agora a VPS PUXA, MIGRA e SOBE. Nunca compila.
#
# IMAGE_TAG vem do workflow, fixado na SHA do commit — identificador
# imutável. É isso que torna o rollback uma troca de variável em vez de um
# rebuild sob pressão.
# ------------------------------------------------------------
# Grava a tag no .env ANTES de qualquer `docker compose`.
#
# Todos os comandos do deploy e do health-check usam `--env-file "$ENV_FILE"`.
# Sem a tag gravada ali, o compose cairia no fallback `:latest` e passos
# diferentes do mesmo deploy poderiam operar sobre imagens diferentes — uma
# divergência que não dá erro, só um resultado errado.
#
# Persistir também serve ao rollback: a tag em produção fica legível no .env,
# e reverter é editar esta linha e subir de novo.
if grep -q '^IMAGE_TAG=' "$ENV_FILE"; then
  sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=${IMAGE_TAG}|" "$ENV_FILE"
else
  printf '%s\n' "IMAGE_TAG=${IMAGE_TAG}" >> "$ENV_FILE"
fi

echo "==> Baixando a imagem ${IMAGE_TAG}..."
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" pull --quiet web

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
# O binário do prisma não fica em node_modules/.bin na imagem final, então
# chamamos o build/index.js diretamente com node.
#
# Procuramos em dois layouts porque a imagem mudou de empacotamento: a
# árvore achatada do npm (atual, vinda do standalone) e o store do pnpm
# (anterior). O `find` cobre o caso de mudar de novo — fixar um caminho
# só foi exatamente o que quebrou este passo quando o standalone entrou.
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" \
  run --rm --entrypoint sh web -c '
    set -e
    cd /app
    PRISMA_CLI=$(ls -d node_modules/prisma/build/index.js 2>/dev/null | head -1)
    [ -z "$PRISMA_CLI" ] && PRISMA_CLI=$(ls -d node_modules/.pnpm/prisma@*/node_modules/prisma/build/index.js 2>/dev/null | head -1)
    [ -z "$PRISMA_CLI" ] && PRISMA_CLI=$(find node_modules -path "*/prisma/build/index.js" -print -quit 2>/dev/null)
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
    # O seed agora chega compilado (seed.mjs), gerado no build: o Node o
    # executa direto, sem transpilador na imagem de runtime.
    #
    # O caminho antigo (tsx + seed.ts) continua como reserva para uma
    # imagem construída antes desta mudança — durante um rollback, por
    # exemplo.
    if [ -f seed.mjs ]; then
      echo "    usando seed.mjs (compilado)"
      node seed.mjs || exit $?
      # Conteúdo de cada curso vem em seu próprio seed. Ele nasce
      # despublicado de propósito: o curso só aparece para o aluno depois
      # de conferido e publicado em /admin/cursos.
      if [ -f seed-empreendedores.mjs ]; then
        echo "    semeando curso de Empreendedores"
        node seed-empreendedores.mjs \
          || echo "    AVISO: seed de Empreendedores não concluiu." >&2
      fi
      exit 0
    fi
    TSX=$(ls -d node_modules/.pnpm/tsx@*/node_modules/tsx/dist/cli.mjs 2>/dev/null | head -1)
    [ -z "$TSX" ] && TSX=$(ls -d node_modules/.pnpm/tsx@*/node_modules/tsx/dist/cli.cjs 2>/dev/null | head -1)
    if [ -z "$TSX" ]; then
      echo "    seed não encontrado nesta imagem; ignorado." >&2
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

# ------------------------------------------------------------
# Reengajamento: quem agenda é o serviço `scheduler` do compose.
#
# Antes havia DOIS agendadores para a mesma rota: este cron do host (1×/dia)
# e o container `scheduler` (1×/hora). Não gerava aviso duplicado — o
# `dedupeHoras` do motor protege —, mas metade do agendamento vivia fora do
# compose, invisível para quem lê o projeto, e dependia de `crontab` existir
# na máquina.
#
# Ficou o `scheduler`, agora a cada 24h (ver ENGAGEMENT_INTERVAL_SECONDS no
# compose). A remoção abaixo é o passo que não pode faltar: sem apagar a
# entrada nas máquinas onde ela JÁ foi instalada, o cron sobrevive e os dois
# agendadores voltam a coexistir.
# ------------------------------------------------------------
if command -v crontab >/dev/null 2>&1; then
  if crontab -l 2>/dev/null | grep -q '# aprenderia-engajamento$'; then
    crontab -l 2>/dev/null | grep -v '# aprenderia-engajamento$' | crontab - || true
    echo "==> Cron de engajamento do host removido; quem agenda é o scheduler."
  fi
fi

# ------------------------------------------------------------
# Aponta 'current' para esta release
# ------------------------------------------------------------
ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

# ============================================================
# LIMPEZA — incondicional, ao fim de TODO deploy bem-sucedido.
#
# Antes só acontecia quando o disco caía abaixo de 3GB: limpeza reativa,
# que permite o lixo crescer até virar emergência. Agora o deploy é
# idempotente também no que deixa para trás — rodar duas vezes não acumula.
#
# 🔴 NENHUM comando aqui toca volume. Ver a trava logo abaixo.
# ============================================================
echo "==> Limpeza pós-deploy"

# --- 1. Containers efêmeros deste deploy -----------------------------
# `compose run --rm` remove ao terminar normalmente, mas não se o processo
# for interrompido. Varremos por garantia, restrito ao rótulo do projeto.
EFEMEROS="$(docker ps -aq \
  --filter "label=com.docker.compose.project=aprenderia" \
  --filter "name=-run-" 2>/dev/null || true)"
if [ -n "$EFEMEROS" ]; then
  echo "$EFEMEROS" | xargs -r docker rm -f >/dev/null 2>&1 || true
  echo "    containers efêmeros removidos: $(echo "$EFEMEROS" | wc -l)"
fi

# --- 2. Imagens antigas DESTE projeto --------------------------------
# Filtro duplo por segurança: o rótulo garante que são nossas, e o
# `dangling=true` que nenhuma tag as referencia. Uma imagem em uso por
# container em execução nunca é dangling, então a que está no ar está a
# salvo — e a anterior continua no GHCR para o rollback.
#
# 🔴 Nunca `docker image prune -a` (sem filtro): apagaria imagens de
# TODOS os projetos do host.
ANTES_IMG="$(docker images -q | wc -l)"
docker image prune -f \
  --filter "label=org.opencontainers.image.source=https://github.com/fernandinhomartins40/aprender-ia" \
  >/dev/null 2>&1 || true
DEPOIS_IMG="$(docker images -q | wc -l)"
echo "    imagens removidas: $(( ANTES_IMG - DEPOIS_IMG ))"

# --- 3. Releases antigas no disco ------------------------------------
# Mantém 3, MAS nunca apaga a release em uso.
#
# A ordenação por data sozinha é perigosa: se `current` apontar para uma
# release antiga (depois de um rollback, por exemplo), ela cairia na faixa
# de descarte — e sobraria um container vivo apontando para um diretório
# que não existe mais. Ele continuaria no ar só porque nunca reiniciou; na
# primeira queda, não subiria mais.
ATUAL_REAL="$(readlink -f "$CURRENT_LINK" 2>/dev/null || echo '')"
cd "$APP_ROOT/releases"
for velha in $(ls -1dt */ 2>/dev/null | tail -n +4); do
  ALVO="$(readlink -f "$velha" 2>/dev/null || echo '')"
  if [ -n "$ALVO" ] && [ "$ALVO" = "$ATUAL_REAL" ]; then
    echo "    preservando $velha (é a release em uso)"
    continue
  fi
  rm -rf "$velha"
done
echo "    releases mantidas: $(ls -1d */ 2>/dev/null | wc -l)"

# --- 4. Conferência: os volumes continuam lá? ------------------------
# 🔴 Os volumes guardam o banco e os uploads. Nada neste script os remove
# — nem `down`, nem `volume prune`, nem `down -v`. Esta conferência existe
# para que a PERDA seja detectada no mesmo deploy, e não semanas depois,
# caso alguém acrescente um comando destrutivo aqui no futuro.
for vol in aprenderia_postgres_data aprenderia_notification_media; do
  if docker volume inspect "$vol" >/dev/null 2>&1; then
    echo "    volume preservado: $vol"
  else
    # Na primeira instalação o volume ainda não existe — o compose o cria
    # no `up`. Só é anomalia se a aplicação já estava no ar.
    echo "    AVISO: volume $vol não encontrado (normal na primeira instalação)." >&2
  fi
done

DISCO_LIVRE="$(df -BG --output=avail / | tail -1 | tr -dc '0-9')"
echo "==> Disco livre após limpeza: ${DISCO_LIVRE}GB"

# Marca a conclusão. É esta linha que diz ao PRÓXIMO deploy que este aqui
# terminou inteiro — sem ela, ele assume interrupção e limpa os restos.
printf 'concluido\n' > "$ESTADO_FILE"

echo "==> Deploy concluído."
