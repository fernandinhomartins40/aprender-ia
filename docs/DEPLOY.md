# Deploy — Aprender IA

Procedimento reproduzível de implantação, atualização, reversão e diagnóstico.

**Princípio que rege tudo:** a VPS **puxa, migra e sobe**. Nunca compila.

---

## 1. Como funciona

```
GitHub Actions                          VPS (72.60.10.108)
────────────────────────────────        ──────────────────────────────
job "build"                             (nada)
  carimba o sw.js com a release
  docker build
  push → ghcr.io/.../aprenderia-web:<sha>

job "deploy"  (needs: build)
  envia código por SSH          →       recebe a release
  docker login ghcr.io          →       autentica no registry
  executa remote-deploy.sh      →       docker compose pull
                                        sobe o postgres
                                        aplica migrations
                                        roda o seed
                                        docker compose up -d
  configura nginx + SSL         →       nginx do host + certbot
  health check                  →       valida /health e /api/health
  limpa imagens antigas no GHCR         (mantém as 5 últimas)
```

**Disparo:** `push` na branch `main`, ou `workflow_dispatch` manual.

⚠️ **Todo push na `main` é uma implantação em produção.** Não é marco de trabalho.

---

## 1.1 Garantias do deploy

Quatro propriedades verificadas por teste, não por leitura.

### a) Um deploy por vez

Duas travas independentes, porque uma só não cobre tudo:

| Trava | Cobre | Não cobre |
|---|---|---|
| `concurrency` do GitHub | duas execuções do workflow | deploy manual na VPS |
| **`flock` no `remote-deploy.sh`** | **a máquina inteira** | — |

O `flock` é a que vale para a VPS: nenhum segundo deploy entra, venha do
Actions ou de alguém rodando o script à mão.

**Testado** com `flock` real: o primeiro trabalha, o segundo simultâneo é
recusado com código 1, o terceiro (depois) passa normalmente.

⚠️ Se `flock` não existir no host, o deploy **segue com aviso** em vez de
travar. Proteção que impede toda operação seria pior que proteção nenhuma —
foi um defeito que escrevi e que um teste pegou.

### b) O deploy não deixa lixo

Limpeza **incondicional** ao fim de todo deploy bem-sucedido — antes ela só
rodava se o disco caísse abaixo de 3 GB, ou seja, quando já era emergência.

1. Containers efêmeros (`run --rm` interrompido)
2. Imagens órfãs **deste projeto** (filtro por rótulo)
3. Releases antigas, mantendo 3 — **e nunca a release em uso**
4. Conferência de que os volumes continuam lá

O passo 3 tem uma proteção que faltava: ordenar por data e apagar as mais
antigas removeria a release em uso se `current` apontasse para uma antiga
(depois de um rollback). Sobraria um container vivo apontando para diretório
inexistente — no ar só porque nunca reiniciou, e incapaz de subir de novo.

### c) Falha não deixa rastro

`trap` em `EXIT INT TERM` remove os containers efêmeros e grava o estado.
O deploy **seguinte** lê esse estado e, se o anterior não concluiu, varre o
que sobrou antes de começar.

O `trap` **não** derruba a aplicação: se a falha foi antes do `up`, a versão
antiga segue no ar — o estado seguro. Um `down` automático transformaria uma
falha de deploy numa queda do site.

**Testado:** em sucesso, código 0 e estado `concluido`; em falha, código
propagado (o job falha de verdade) e estado `falhou`.

### d) Volumes preservados

Nenhum comando do deploy remove volume. **Verificado por teste:**

| Comando | Efeito no volume |
|---|---|
| `up -d --remove-orphans` | ✅ preservado |
| `down` (sem `-v`) | ✅ preservado |
| `down -v` | 🔴 **apaga** — nunca em produção |

Os volumes carregam rótulos (`br.aprenderia.dados=producao`) que permitem
filtrá-los:

```bash
docker volume ls --filter "label=br.aprenderia.dados=producao"
```

⚠️ Rótulo **não impede** remoção — o Docker não tem essa trava. Serve para
que scripts e pessoas identifiquem o que é dado de produção.

---

## 2. Pré-requisitos

### No GitHub

| Item | Valor | Observação |
|---|---|---|
| Segredo `VPS_PASSWORD` | senha de root da VPS | único segredo necessário |
| `GITHUB_TOKEN` | automático | o job `build` declara `packages: write` |

**Não é preciso criar token de registry.** O `GITHUB_TOKEN` da própria execução
publica no GHCR e autentica a VPS; ele expira quando o job termina.

### Na VPS

Instalados automaticamente pelo passo "Prepare VPS runtime": `docker`,
`docker compose`, `nginx`, `certbot`, `openssl`, `ca-certificates`, `tar`.

### DNS

`aprenderia.site` e `www.aprenderia.site` apontando para o IP da VPS.
Verificado em 15/09/2026: ambos resolvem para `72.60.10.108`. ✅

---

## 3. Variáveis de ambiente

Vivem em `/opt/aprenderia/.env`, **fora** do diretório da release, para
sobreviver a novos deploys. Permissão `600`.

| Variável | Origem | Sobrescrita a cada deploy? |
|---|---|---|
| `POSTGRES_USER`, `POSTGRES_DB` | fixas | não (`ensure_env`) |
| `POSTGRES_PASSWORD` | `openssl rand -hex 32` | não — trocar quebraria o banco |
| `NEXTAUTH_SECRET` | `openssl rand -hex 32` | não — trocar desloga todos |
| `CRON_SECRET` | `openssl rand -hex 24` | não |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | gerado na VPS | **não** — trocar invalida TODAS as inscrições push |
| `SMTP_*` | preenchido à mão | **não** — é editado manualmente na VPS |
| `DATABASE_URL` | montada | sim |
| `NODE_ENV`, `DEPLOY_PORT`, `CANONICAL_URL`… | fixas | sim |
| `IMAGE_TAG` | SHA do commit | sim — **é o que define a versão no ar** |

🔴 **Nunca sobrescrever `VAPID_PUBLIC_KEY`.** O navegador amarra cada inscrição
à chave com que ela foi criada. Trocar a chave desliga silenciosamente as
notificações de todos os alunos que já autorizaram.

---

## 4. Volumes

| Volume | Conteúdo | Perda significa |
|---|---|---|
| `aprenderia_postgres_data` | **banco inteiro** | perda total de dados |
| `aprenderia_notification_media` | mídia das notificações | perda de uploads |

### 🔴 A armadilha do `down -v`

Os volumes têm nome fixo no compose. Isso é correto — garante que sobrevivam ao
deploy —, mas cria um risco concreto:

```bash
docker compose -f docker-compose.prod.yml down -v   # ☠️ APAGA O BANCO
```

O `-v` remove os volumes nomeados. **Não existe desfazer.** Para parar a
aplicação sem destruir dados:

```bash
docker compose -f docker-compose.prod.yml --env-file /opt/aprenderia/.env down
```

---

## 5. Deploy normal

```bash
git push origin main
```

Acompanhar em *Actions → Deploy Production*. O job `build` publica a imagem; o
job `deploy` implanta.

### Deploy manual (sem commit)

*Actions → Deploy Production → Run workflow.* Usa o código da `main`.

---

## 6. Rollback

É aqui que o novo formato paga: **reverter é trocar uma tag, não reconstruir.**

### 6.1 Rollback rápido (só a aplicação)

```bash
ssh root@72.60.10.108
cd /opt/aprenderia/current

# Ver as versões disponíveis no registry (últimas 5 são mantidas)
docker images ghcr.io/fernandinhomartins40/aprenderia-web

# Apontar para a versão anterior
sed -i 's|^IMAGE_TAG=.*|IMAGE_TAG=<sha-anterior>|' /opt/aprenderia/.env

docker compose -f docker-compose.prod.yml --env-file /opt/aprenderia/.env pull web
docker compose -f docker-compose.prod.yml --env-file /opt/aprenderia/.env up -d web

curl -s http://127.0.0.1:3130/api/health
```

Tempo estimado: menos de um minuto, sem build.

### 6.2 ⚠️ Rollback com migration no meio

**O rollback de código não desfaz migration.** Se a versão nova aplicou uma
migration destrutiva (coluna removida, tipo alterado), voltar a imagem antiga
faz o código velho consultar um banco novo — e quebrar.

Antes de reverter, verificar:

```bash
docker compose -f docker-compose.prod.yml --env-file /opt/aprenderia/.env \
  run --rm --entrypoint sh web -c \
  'node node_modules/prisma/build/index.js migrate status --schema packages/db/prisma/schema.prisma'
```

Se houve migration destrutiva, é caso de restaurar backup — não de rollback de
imagem.

### 6.3 Reverter o código no GitHub

```bash
git revert <sha-ruim>
git push origin main
```

Dispara um deploy normal com o código revertido.

---

## 7. Limpeza segura

🔴 **A VPS é compartilhada. Todo comando de limpeza precisa de escopo.**

### Seguro

```bash
# Imagens sem tag, só as órfãs deste projeto
docker image prune -f --filter \
  "label=org.opencontainers.image.source=https://github.com/fernandinhomartins40/aprender-ia"

# Releases: o deploy já mantém apenas as 3 últimas, automaticamente
ls -1dt /opt/aprenderia/releases/*/
```

### 🔴 Proibido nesta VPS

| Comando | Por quê |
|---|---|
| `docker system prune -a` | apaga imagens de **todos** os projetos do host |
| `docker volume prune` | "dangling" não é lixo — pode ser o banco de um projeto parado |
| `docker builder prune -af` | sem filtro de idade, destrói cache útil de outros projetos |
| `down -v` | apaga o banco (§4) |

---

## 8. Diagnóstico

```bash
cd /opt/aprenderia/current
ENV=/opt/aprenderia/.env

# Estado
docker compose -f docker-compose.prod.yml --env-file $ENV ps

# Logs (limitados a 10 MB × 3 arquivos por container)
docker compose -f docker-compose.prod.yml --env-file $ENV logs --tail 100 web

# Consumo contra os limites
docker stats --no-stream | grep aprenderia

# Saúde
curl -s http://127.0.0.1:3130/health       # nginx interno
curl -s http://127.0.0.1:3130/api/health   # aplicação + banco
curl -s https://aprenderia.site/api/health # ponta a ponta

# Qual versão está no ar
grep IMAGE_TAG $ENV
```

### Sintomas comuns

| Sintoma | Causa provável | Verificação |
|---|---|---|
| `pull` falha com `denied` | VPS sem login no GHCR | `docker login ghcr.io` |
| Container reiniciando | erro na aplicação | `logs --tail 100` |
| `/api/health` com `banco: "erro"` | Postgres fora ou credencial errada | `docker compose ps postgres` |
| Site fora, containers de pé | nginx do host | `nginx -t && systemctl status nginx` |
| HTTPS vencido | certbot | `certbot certificates` |
| Deploy aborta por espaço | disco | `df -h /` |

---

## 9. Limites de recurso

Todo container tem teto de CPU, memória, PIDs e log.

| Serviço | CPU | Memória | PIDs | Log |
|---|---|---|---|---|
| `web` | 1,0 | 512 MB | 256 | 10m × 3 |
| `postgres` | 0,5 | 512 MB | 128 | 10m × 3 |
| `nginx` | 0,25 | 128 MB | 64 | 10m × 3 |
| `scheduler` | 0,05 | 32 MB | 16 | 1m × 2 |
| `media-init` | 0,25 | 64 MB | 32 | 1m × 2 |

**Consumo medido** em pilha completa local (15/09/2026), em repouso:

| Serviço | Memória | PIDs | Uso do teto |
|---|---|---|---|
| `web` | 71,98 MB | 13 | 14% |
| `postgres` | 33,59 MB | 7 | 6,5% |
| `nginx` | 7,68 MB | 9 | 6% |
| `scheduler` | 560 KB | 2 | 1,7% |

⚠️ **Repouso, não pico, e sem alunos.** São tetos de proteção, não
dimensionamento. Refazer a medição sob uso real e ajustar.

O ajuste externo acompanha o interno — limitar sem isso causa morte por falta de
memória sob carga:

- `web`: `--max-old-space-size=320` (62% dos 512 MB)
- `postgres`: `shared_buffers=128MB` (25%), `effective_cache_size=384MB`,
  `max_connections=30`
- Prisma: `connection_limit=5`

---

## 10. Primeiro deploy numa VPS limpa

O workflow é idempotente e cuida de tudo. Sequência esperada:

1. `build` publica a imagem no GHCR (primeira vez: sem cache, mais lento).
2. `deploy` instala docker/nginx/certbot se faltarem.
3. Gera `.env` com segredos aleatórios e o par VAPID.
4. Baixa a imagem, sobe o Postgres, aplica **19 migrations**, roda o seed.
5. Sobe a aplicação, configura nginx e emite o certificado.
6. Valida `/health`, `/api/health` e o HTTPS público.

**Após o primeiro deploy, anotar:**

```bash
docker stats --no-stream | grep aprenderia   # consumo real
docker exec aprenderia-postgres psql -U aprenderia -d aprenderia \
  -c "SELECT pg_size_pretty(pg_database_size('aprenderia'));"
```

São os números que faltam para dimensionar de verdade.

---

## 11. Backup — pendente

🔴 **Verificado em 15/09/2026: não existe rotina de backup na VPS.** O crontab
do root está vazio e não há diretório de backups.

Enquanto não houver, uma cópia manual antes de qualquer mudança de risco:

```bash
docker exec aprenderia-postgres pg_dump -U aprenderia -d aprenderia \
  | gzip > /opt/aprenderia/backup-$(date +%Y%m%d-%H%M).sql.gz
```

Restauração:

```bash
gunzip -c backup-AAAAMMDD-HHMM.sql.gz \
  | docker exec -i aprenderia-postgres psql -U aprenderia -d aprenderia
```

⚠️ **Backup nunca testado em restauração não é backup.** Definir rotina
automática e testar a volta é decisão pendente.
