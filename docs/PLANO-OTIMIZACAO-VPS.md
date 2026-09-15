# Plano de otimização — Aprender IA

**Data:** 14/09/2026
**Base:** [AUDITORIA-OTIMIZACAO-VPS.md](./AUDITORIA-OTIMIZACAO-VPS.md)
**Estado:** ✅ **implementado em 15/09/2026** — validado localmente, **não
implantado**. Resultados em
[COMPARACAO-ANTES-DEPOIS.md](./COMPARACAO-ANTES-DEPOIS.md).

## Situação de cada item

| # | Item | Situação |
|---|---|---|
| 1 | Build no GitHub + GHCR | ✅ feito |
| 2 | Limite de log (5 serviços) | ✅ feito |
| 3 | Limites de CPU e PIDs (5 serviços) | ✅ feito |
| 4 | Engajamento a cada 24 h | ✅ feito |
| 5 | Remover o cron do host | ✅ feito |
| 6 | Landing consultando banco no build | ⏸️ mantido — ver decisão abaixo |
| 7 | Seed só quando muda | ⏸️ **adiado** por risco |
| 8 | Healthcheck a cada 60 s | ✅ feito |
| 9 | `.dockerignore` completo | ✅ feito |
| 10 | Retenção de imagens no GHCR | ✅ feito |

**Item 6:** mantido `revalidate = 60` (recomendação (b)). Trocar para
`force-dynamic` faria a página mais visitada consultar o banco a cada visitante —
mais consumo, não menos. A janela de até 60 s com conteúdo padrão após o deploy é
aceitável para página institucional. **Reversível a qualquer momento.**

**Item 7:** adiado deliberadamente. É o de maior risco (um marcador errado pula
seed necessário, e o sintoma é conteúdo faltando, não erro no deploy) com o menor
ganho imediato — a base está vazia.

### Um achado durante a implementação, que não estava no plano

Mover o build para o GitHub **quebraria o versionamento do service worker**. O
`sw.js` era carimbado pelo `remote-deploy.sh` na VPS, **antes** do build local;
sem build local, esse `sed` passaria a editar um arquivo que ninguém usa, e o
service worker sairia com a versão fixa do código — reintroduzindo o defeito de
"HTML novo com JavaScript velho" que o carimbo existe para corrigir.

O carimbo foi movido para o job `build`, antes do `docker build`. Sem essa
correção, o item 1 teria introduzido um defeito em silêncio.

---

## Contexto que mudou tudo

A auditoria foi escrita supondo uma aplicação sobrecarregando um servidor. Isso
**não é verdade**. Medido em 14/09/2026 na VPS 72.60.10.108:

- A aplicação **não está lá**. Sem containers, sem imagens, sem volumes, sem
  certificado, sem `/opt/aprenderia`. A busca `find / -iname '*aprender*'`
  voltou vazia.
- A VPS foi **resetada pelo dono**, porque o conjunto de aplicações anteriores
  a derrubou.
- A máquina está **folgada**: 4 vCPU, 15,9 GB de RAM com 516 MB em uso, disco em
  6% de 194 GB, carga 0,99.
- **Steal time de 1,4%** — o provedor entrega a CPU contratada. O problema nunca
  foi hospedagem.

**Portanto este não é um plano de reduzir consumo de algo que está no ar. É um
plano de deixar a aplicação pronta ANTES de subir**, para que ela não repita o
que derrubou a máquina. As correções entram no melhor momento possível: antes do
primeiro deploy, sem produção viva para quebrar.

### Decisões já tomadas pelo dono

| Decisão | Escolha |
|---|---|
| Build da imagem | **GitHub Actions + GHCR** — a VPS nunca compila |
| Escopo | **Só o aprender-ia** — o digiurban não será tocado |
| Primeiro deploy | **Implementar tudo, depois subir juntos** |
| Agendador duplicado | **Manter o `scheduler`** a 24h; remover o cron do host |

---

## Alinhamento com o padrão que você já escreveu

Existe trabalho anterior: `docs/PROMPT-AUDITORIA-DEPLOY.md`, no repositório
`urbansend`, de 14/09/2026. Este plano **segue aquele checklist** em vez de criar
um paralelo. A frase que resume o alvo é sua:

> "A VPS PULA, MIGRA e SOBE. Nunca compila."

Aquele documento também explica o reset: inventaria **~90 containers em 24
projetos**, muitos órfãos apontando para releases já apagadas — incluindo o
`aprenderia`, em 6º lugar, com "scheduler com release apagada".

⚠️ **Correção:** aquele documento aponta o projeto `erpnovo` como modelo real de
GHCR. **Ele não existe** — 404 em `erpnovo`, `erp-novo` e `ERPNovo`, e busca por
repositório retorna zero. O workflow será escrito do zero, com as ações oficiais.

---

## Evidência que sustenta a prioridade 1

Extraído do log do deploy #79 (último bem-sucedido, 13/09), **MEDIDO**:

| Etapa dentro da VPS | Tempo |
|---|---|
| `next build` (`builder 7/8`) | **157,6 s** |
| `prisma generate` | 10,4 s |
| esbuild do seed | 4,6 s |
| Instalação pnpm (`deps 9/9`) | 0 s — **estava em cache** |
| **Passo "Deploy on VPS" inteiro** | **333 s = 88% do deploy** |

E o histórico das 79 execuções mostra o que acontece quando o cache esfria:

| Execução | Duração | Fim |
|---|---|---|
| #76 | **45,5 min** | cancelada no limite |
| #75 | **45,3 min** | cancelada no limite |
| #77 | **32,7 min** | cancelada |
| #79 | 6,3 min | sucesso (cache quente) |
| #62–#67 | 2,7–3,0 min | sucesso |

**A mesma tarefa varia de 2,7 a 45,5 minutos.** Isso é a assinatura de um build
competindo por disco e CPU. Não é estimativa.

---

## Ordem de execução

Ordenado por impacto ÷ risco, respeitando dependências.

| # | Item | Prioridade | Risco | Depende de |
|---|---|---|---|---|
| 1 | Build no GitHub + GHCR | 🔴 CRÍTICA | Médio | — |
| 2 | Limite de log em todo container | 🔴 CRÍTICA | Muito baixo | — |
| 3 | Limites de CPU e PIDs | 🔴 CRÍTICA | Baixo | — |
| 4 | Engajamento a cada 24 h | 🟠 ALTA | Muito baixo | — |
| 5 | Remover o cron do host | 🟠 ALTA | Baixo | 4 |
| 6 | Landing consultando banco no build | 🟠 ALTA | Baixo | — |
| 7 | Seed só quando muda | 🟡 MÉDIA | Médio | 1 |
| 8 | Healthcheck a cada 60 s | 🟡 MÉDIA | Baixo | — |
| 9 | `.dockerignore` completo | 🟢 BAIXA | Nenhum | — |
| 10 | Retenção de imagens no GHCR | 🟢 BAIXA | Baixo | 1 |

---

## ITEM 1 — Build no GitHub Actions, publicação no GHCR

**Prioridade:** 🔴 CRÍTICA — é 88% do tempo de deploy e a causa dos 3 deploys perdidos.

### Problema

`remote-deploy.sh` linha 63 executa `docker compose build --pull` **dentro da
VPS**. A máquina que serve os usuários compila TypeScript, roda `next build`
(157,6 s), gera o Prisma Client e resolve 221 pacotes — a cada deploy.

O runner do GitHub, que é gratuito, ocioso e não compartilhado com ninguém, hoje
serve só de correia de transmissão: recebe o código e o repassa por SSH.

### Solução

```
GitHub Actions                    VPS
──────────────────────────        ─────────────────────
checkout + build da imagem   →    (nada)
docker push → GHCR           →    docker compose pull
                                  migrations (container efêmero --rm)
                                  docker compose up -d
```

Mudanças:

1. Novo job `build` no workflow, com `permissions: packages: write`.
2. `docker/login-action` + `docker/build-push-action`, com cache via
   `cache-from`/`cache-to: type=gha` (o cache passa a viver no GitHub, não na VPS).
3. Tag pela **SHA do commit** — identificador imutável — mais `:latest` como
   conveniência. Nunca só `:latest`.
4. `docker-compose.prod.yml`: o serviço `web` troca `build:` por
   `image: ghcr.io/fernandinhomartins40/aprenderia-web:${IMAGE_TAG}`.
5. `remote-deploy.sh`: `docker compose build` vira `docker compose pull`.
6. A VPS faz `docker login ghcr.io` com o `GITHUB_TOKEN` do próprio workflow.

### Segredo necessário: nenhum novo

**MEDIDO:** o repositório tem **1 segredo**, `VPS_PASSWORD`. Não há token de
registry — e não precisa haver. O `GITHUB_TOKEN` que o Actions injeta
automaticamente tem `packages: write` quando o job o declara. O token é passado
à VPS apenas para o `docker login`, com validade de uma execução.

### Impacto

| Métrica | Antes | Depois |
|---|---|---|
| CPU da VPS em deploy | build completo (157,6 s de compilação) | só download e descompactação |
| Tempo do passo na VPS | 333 s MEDIDO | ESTIMADO 30–90 s (baixar ~200 MB) |
| Deploys perdidos por timeout | 3 de 79 MEDIDO | ESTIMADO zero |
| Rollback | exige rebuild | trocar a tag |

⚠️ O tempo total do workflow **pode não cair** — o build apenas muda de lugar.
O ganho é que ele sai de cima da máquina que atende os usuários. Esse é o
objetivo, não o cronômetro.

### Risco: MÉDIO

Altera o caminho inteiro do deploy. Riscos concretos:

- Imagem privada no GHCR e VPS sem login → `pull` falha, deploy aborta com a
  versão antiga no ar (estado seguro).
- Primeiro `pull` baixa a imagem inteira: 1–3 min a mais, só na primeira vez.
- O cache `type=gha` tem limite de 10 GB por repositório; acima disso o GitHub
  descarta o mais antigo, sem quebrar nada.

### Como testar

1. `docker build -f docker/Dockerfile.web .` local — a imagem ainda constrói.
2. Rodar o workflow com `workflow_dispatch` antes de qualquer push na `main`.
3. Conferir a imagem publicada no GHCR com a tag da SHA.
4. Na VPS: `docker compose pull` seguido de `up -d`, e `/api/health` respondendo 200.

### Como reverter

Manter o `remote-deploy.sh` atual como `remote-deploy-build-local.sh`. Reverter é
trocar de volta a linha do compose (`image:` → `build:`) e chamar o script antigo.
**A imagem anterior continua no GHCR**, então dá para voltar a qualquer release
por tag, sem rebuild — algo impossível hoje.

### Arquivos

`.github/workflows/deploy.yml`, `.github/scripts/remote-deploy.sh`,
`docker-compose.prod.yml`

---

## ITEM 2 — Limite de log em todo container

**Prioridade:** 🔴 CRÍTICA — é o que enche disco em VPS compartilhada.

### Problema

**MEDIDO:** nenhum dos 5 serviços define `logging`. O driver padrão do Docker
(`json-file`) **não tem limite**: o arquivo cresce até o disco acabar. Disco
cheio derruba **todas** as aplicações do host, não só esta.

O `remote-deploy.sh` já reconhece o risco — aborta o deploy abaixo de 3 GB
livres — mas trata o sintoma.

O seu próprio checklist já exige isto (§1.6): *"O driver json-file padrão cresce
SEM LIMITE até encher o disco."*

### Solução

Em cada um dos 5 serviços:

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

Teto de 30 MB por container, 150 MB no total, com rotação automática.

### Impacto

| Antes | Depois |
|---|---|
| crescimento ilimitado | **teto rígido de 150 MB** |

### Risco: MUITO BAIXO

A única perda é histórico antigo de log. Para diagnóstico, 30 MB por container
cobrem bastante coisa. Se precisar de retenção longa, aí é caso de enviar para
fora — mas isso é outra decisão, não entra aqui.

### Como testar

`docker compose config` valida o arquivo; após subir,
`docker inspect --format '{{.HostConfig.LogConfig}}' aprenderia-web`.

### Como reverter

Remover o bloco `logging`. Sem efeito colateral.

### Arquivos

`docker-compose.prod.yml`

---

## ITEM 3 — Limites de CPU e PIDs

**Prioridade:** 🔴 CRÍTICA — é o que impede uma app de derrubar o host.

### Problema

**MEDIDO:** só `postgres` e `web` têm limite de **memória**. **Nenhum container
tem limite de CPU. Nenhum tem limite de PIDs.**

Sem limite de CPU, um laço infinito consome toda a CPU e degrada as outras
aplicações. Sem limite de PIDs, um fork bomb derruba o host inteiro.

**Isto não é teoria.** Agora mesmo, nesta VPS, o container `ultrazend-messages`
(do digiurban) está em restart loop marcando **110,33% de CPU** — MEDIDO com
`docker stats`. É exatamente o cenário que o limite previne. Não vou tocar nesse
container, porque o escopo é só o aprender-ia, mas ele é a prova viva.

### Solução

Dimensionamento com base nos limites de memória já validados e no perfil de cada
serviço:

| Serviço | CPU | PIDs | Memória | Justificativa |
|---|---|---|---|---|
| `web` | `1.0` | 256 | 512M (mantém) | Next.js usa 1 processo; 1 vCPU de 4 dá folga e deixa 3 para o host |
| `postgres` | `0.5` | 128 | 512M (mantém) | base pequena; `max_connections=30` já limita processos |
| `nginx` | `0.25` | 64 | **128M (novo)** | proxy leve; nginx:alpine em repouso usa ~5 MB |
| `scheduler` | `0.05` | 16 | **32M (novo)** | é um `curl` a cada 24 h |
| `media-init` | — | — | — | roda uma vez e sai |

⚠️ **Sobre os números:** os limites de memória de `web` e `postgres` foram
dimensionados por quem escreveu o compose, com base em medição de produção
(143 MB no web, registrado em comentário). **Os valores de CPU e PIDs acima são
ESTIMADOS**, por perfil de serviço, porque a aplicação não está no ar para medir
o pico. São **tetos de proteção, deliberadamente folgados** — não vão apertar o
uso normal. Depois do primeiro deploy, com `docker stats` sob uso real, ajustamos
com número medido.

Esta é a diferença entre limite de proteção e limite de dimensionamento: o
primeiro impede catástrofe, o segundo otimiza. Agora precisamos do primeiro.

### Risco: BAIXO

O perigo clássico é limitar memória de banco sem ajustar a configuração interna —
o processo morre por falta de memória sob carga. **Aqui isso já está feito**: o
`shared_buffers=128MB` foi escolhido contra o limite de 512M, e o heap do Node
está em 320 MB contra os mesmos 512M. Não estou mexendo em memória; estou
acrescentando CPU e PIDs, que não têm esse acoplamento.

### Como testar

`docker compose config`, depois `docker inspect` conferindo `NanoCpus` e
`PidsLimit`, e `/api/health` respondendo 200 com os limites ativos.

### Como reverter

Remover as chaves `cpus` e `pids`. Volta ao comportamento atual.

### Arquivos

`docker-compose.prod.yml`

---

## ITEM 4 — Engajamento a cada 24 horas

**Prioridade:** 🟠 ALTA — melhor relação impacto ÷ risco de todo o plano.

### Problema

`ENGAGEMENT_INTERVAL_SECONDS` vale **3600** — o motor roda **24 vezes por dia**.
Mas o próprio motor aplica `dedupeHoras` de 24 h, 72 h ou 168 h.

**23 das 24 execuções diárias percorrem todos os alunos, montam a trilha completa
de cada um e descartam o resultado na deduplicação.** É trabalho computado para
ser jogado fora, por construção.

O custo por aluno, MEDIDO por leitura do código:

| Consulta | Onde |
|---|---|
| `enrollment.findFirst` | linha 43 |
| `lessonProgress.findFirst` | linha 71 |
| **`carregarTrilha()`** — sozinha são 4+ consultas | linha 80 |
| `notificar()` → preferências, dedupe, push | linhas 57/103 |

`carregarTrilha` não é uma consulta: são `enrollment.findUnique`,
`course.findUnique` com módulos **e todas as lições**, `acessoDoAluno()`
(assinaturas → planos → cursos → módulos) e `lessonProgress.findMany`.

| Alunos | Consultas por execução | Por dia (24×) | Por dia (1×) |
|---|---|---|---|
| 50 | ~200 | ~4.800 | **~200** |
| 200 | ~800 | ~19.200 | **~800** |
| 500 | ~2.000 | ~48.000 | **~2.000** |

### Por que isso importa mesmo com zero alunos hoje

**MEDIDO: a base de produção não existe e não há alunos.** Então isto não
consome nada agora. É uma **bomba-relógio**: o custo cresce linearmente com o
sucesso da plataforma, e você descobriria o problema exatamente quando ela
começasse a dar certo. Corrigir antes de subir custa uma variável; corrigir
depois é incidente.

### Solução

`ENGAGEMENT_INTERVAL_SECONDS` de `3600` para `86400` no `.env` da VPS, via
`upsert_env` no workflow.

**Zero perda funcional.** Os avisos continuam idênticos, porque o `dedupeHoras`
já os limitava a um por dia. Redução ESTIMADA de ~96% do trabalho do motor.

### O que NÃO farei agora

Otimizar o laço em si — filtrar alunos inativos **no SQL** antes de iterar, e
trocar `carregarTrilha` por consulta enxuta. São mudanças de código com risco
real de alterar quem recebe notificação, e **sem alunos não há como validar**.
Fica registrado para depois da primeira medição em produção.

### Risco: MUITO BAIXO

É uma variável de ambiente. Nenhuma linha de lógica muda.

### Como testar

Após o deploy: `docker logs aprenderia-scheduler` mostra uma execução por dia.
Chamada manual da rota com `CRON_SECRET` continua funcionando.

### Como reverter

Voltar a variável para `3600`. Efeito imediato ao reiniciar o `scheduler`.

### Arquivos

`.github/workflows/deploy.yml`, `.env.example`

---

## ITEM 5 — Remover o cron do host

**Prioridade:** 🟠 ALTA · **Depende do item 4**

### Problema

O mesmo endpoint é acionado por **dois** agendadores: o container `scheduler`
(de hora em hora) e um cron instalado no host pelo `remote-deploy.sh` (12:00 UTC).
Classificação: **Duplicado**.

Não causa notificação repetida — o `dedupeHoras` protege. O desperdício é de
processo e, pior, de clareza: metade do agendamento vive fora do compose,
invisível para quem lê o projeto.

### Solução

Conforme sua decisão: **manter o `scheduler`, remover o cron do host.**

O bloco `crontab` do `remote-deploy.sh` sai, substituído por uma remoção
idempotente da entrada antiga — senão o cron continua existindo nas máquinas
onde já foi instalado, e a configuração morta ressuscita.

```bash
# Remove o agendamento antigo do host. O scheduler do compose assumiu.
crontab -l 2>/dev/null | grep -v '# aprenderia-engajamento$' | crontab - || true
```

### Checklist de remoção (§8.1 do seu prompt)

- [x] Definição na orquestração — o `scheduler` **permanece**, é migração e não remoção
- [x] Volumes e redes — nenhum associado ao cron
- [x] Variáveis de ambiente — `CRON_SECRET` continua, usada pelo `scheduler`
- [x] **Gerador de configuração** — o bloco do `remote-deploy.sh` é justamente o
      gerador; sem removê-lo, o cron ressuscita a cada deploy
- [x] Rotas/proxies — `/api/engajamento` continua existindo e protegida
- [x] Clientes que chamam a rota — o `scheduler` continua chamando
- [x] Telas — nenhuma; é rota de máquina
- [x] Limpeza no host — a linha acima remove a entrada já instalada

**A funcionalidade continua existindo. É migração, não remoção** — e o destino
(`scheduler`) já está definido e em operação.

### Risco: BAIXO

Se o `scheduler` falhar, o engajamento para. Mitigação: ele tem
`restart: unless-stopped` e a rota pode ser chamada à mão a qualquer momento.

### Como reverter

Reinstalar a linha do crontab. Está preservada no histórico do git.

### Arquivos

`.github/scripts/remote-deploy.sh`

---

## ITEM 6 — Landing consulta o banco durante o build

**Prioridade:** 🟠 ALTA — é defeito de correção, não de recursos.

### Problema

**MEDIDO**, no log do build #79:

```
#24 119.2 [landing] tabelas indisponíveis; usando conteúdo padrão.
Error [PrismaClientInitializationError]
```

`apps/web/src/app/page.tsx` tem `export const revalidate = 60`, o que faz o Next
tentar pré-renderizar a página **em tempo de build** — quando não existe banco
algum acessível. A falha é tratada e cai para conteúdo padrão, então o site não
quebra. Mas **a primeira versão servida da landing sai com texto genérico em vez
dos seus dados reais**, até a primeira revalidação.

Isto não estava na auditoria original. Apareceu ao ler o log do build.

### Solução — precisa da sua decisão

Duas saídas legítimas, com efeitos diferentes:

- **(a)** Trocar para `export const dynamic = "force-dynamic"`: a landing passa a
  consultar o banco a cada requisição. Sempre atual, custo por visita.
- **(b)** Manter `revalidate = 60` e adicionar
  `export const dynamicParams`/`generateStaticParams` vazio, ou simplesmente
  aceitar o fallback: a primeira visita após o deploy dispara a revalidação e o
  conteúdo real aparece em até 60 s.

**Minha recomendação: (b)**, aceitando o comportamento atual e apenas
documentando — porque a landing é a página mais visitada e `force-dynamic` a
faria consultar o banco a cada visitante, o que é *mais* consumo, não menos. A
janela de 60 s com conteúdo padrão é aceitável para uma página institucional.

⚠️ **Mas isto é decisão sua**, porque envolve o que o visitante vê.

### Risco: BAIXO em (b), MÉDIO em (a)

(a) aumenta a carga no banco proporcionalmente ao tráfego da landing.

### Arquivos

`apps/web/src/app/page.tsx` (só se escolher (a))

---

## ITEM 7 — Seed só quando muda

**Prioridade:** 🟡 MÉDIA · **Depende do item 1**

### Problema

**MEDIDO:** `seed.ts` tem 1.091 linhas e roda **a cada deploy**, com 8 blocos de
`upsert`, alguns em laço — curso, ferramentas, módulos, **82 lições**, **50
verbetes**, planos, conquistas, missões.

É idempotente e **isso está certo**. O desperdício é reescrever centenas de
linhas no Postgres para produzir um estado quase sempre idêntico — gerando
escrita em disco e WAL a cada deploy.

### Solução

Gravar o hash do conteúdo do seed numa tabela de controle e pular quando não
mudou, com uma variável `FORCE_SEED=1` para forçar.

### Risco: MÉDIO — e por isso vem depois

Um marcador errado pula um seed **necessário**, e o sintoma seria conteúdo
faltando em produção, não erro no deploy. Exige o caminho de forçar execução e
teste explícito das duas trajetórias.

Por ser o item de maior risco com o menor ganho imediato (a base está vazia
hoje), **pode ficar para depois do primeiro deploy**. Recomendo adiá-lo.

### Arquivos

`.github/scripts/remote-deploy.sh`, `packages/db/prisma/seed.ts`

---

## ITEM 8 — Healthcheck a cada 60 segundos

**Prioridade:** 🟡 MÉDIA

### Problema

**MEDIDO:** o healthcheck do `web` (Dockerfile linha 215) chama `/api/health`, que
executa `prisma.$queryRaw\`SELECT 1\``. A cada 30 s: **2.880 consultas/dia**, mais
2.880 do `pg_isready`.

`SELECT 1` é barato e **o healthcheck deve mesmo verificar o banco** — um
container que responde HTTP mas perdeu o banco está degradado. **Não remover.**

### Solução

Intervalo de 30 s para 60 s no `HEALTHCHECK` do Dockerfile. Corta metade.
É o mesmo raciocínio que já foi aplicado ao `postgres` (de 10 s para 30 s), com o
motivo registrado em comentário.

### Risco: BAIXO

Detecção de falha fica até 30 s mais lenta. Aceitável para esta aplicação.

⚠️ Seu checklist alerta (§1.8) que timeout curto em máquina saturada gera falso
"unhealthy" e realimenta consumo. O `timeout: 5s` atual é folgado para um
`SELECT 1`; mantenho.

### Arquivos

`docker/Dockerfile.web`

---

## ITEM 9 — `.dockerignore` completo

**Prioridade:** 🟢 BAIXA — custo zero, ganho pequeno.

### Problema

**MEDIDO:** contexto real de build é **16 MB** (não os 479 MB que eu havia
afirmado por engano — ver correção §0.2 da auditoria). Desses, **7,1 MB são
`assets-marca/`**, que está versionado mas cujo único consumidor é
`scripts/gerar-favicon.py` — um script que roda na sua máquina, não na aplicação.

Além disso, `CREDENCIAIS-*.txt` não é barrado. **Não vaza para produção** (não
está no git, portanto não está no checkout), mas um `docker build` local gravaria
as senhas numa camada.

### Solução

```
assets-marca
CREDENCIAIS-*.txt
docs
*.mp4
```

### Impacto

16 MB → ~8,5 MB de contexto (MEDIDO na origem). **É pouco** — entra pelo custo
praticamente nulo, não por relevância.

### Risco: NENHUM

Nada em `assets-marca` é referenciado pela aplicação. Provado por busca a partir
da raiz.

### Arquivos

`.dockerignore`

---

## ITEM 10 — Retenção de imagens no GHCR

**Prioridade:** 🟢 BAIXA · **Depende do item 1**

Com tags por SHA, cada deploy cria uma imagem nova no GHCR. Sem retenção, elas
acumulam indefinidamente (o GHCR é gratuito para repositório privado, mas conta
armazenamento).

**Solução:** passo final no workflow que mantém as **5 tags mais recentes**,
usando `actions/delete-package-versions`.

**Risco:** baixo, mas atenção — apagar a imagem para a qual você quer reverter
inviabiliza o rollback. Por isso **5**, não 3.

**Reverter:** remover o passo. Imagens já apagadas não voltam; por isso o número
é conservador.

---

## 🔴 NÃO FAZER

Tão importante quanto a lista do que fazer. Cada item abaixo foi considerado e
**recusado**, com o motivo — para que ninguém (nem eu, numa próxima sessão)
refaça a análise e cometa o erro.

### Não remover o `upstream api:3001` do nginx

Parece código morto: aponta para um serviço que não existe e **não tem nenhum
consumidor** — provado por busca a partir da raiz, em todos os tipos de arquivo,
incluindo formas indiretas (`baseURL`, `fetch` absoluto, `NEXT_PUBLIC_*`). As
únicas ocorrências são o próprio `nginx.conf` e um comentário do compose.

**Mas o custo em runtime é zero**, e já está tratado de forma correta: resolve o
nome por DNS em tempo de requisição (o que impede o nginx de abortar no boot) e
devolve 503 explícito. Removê-lo não economiza nada e reintroduzir depois custa
tempo. **Decisão pendente do dono** — enquanto não houver, fica.

### Não juntar Postgres e aplicação no mesmo container

Reduziria a contagem de containers, que parece progresso. É o erro que mais
quebra aplicação em VPS compartilhada: os ciclos de vida são diferentes, o banco
passa a reiniciar junto com a aplicação, e o ajuste de memória de um interfere no
outro.

### Não remover a CLI do Prisma nem `@prisma/engines` da imagem

Renderia ~120 MB. **Já foi tentado e quebrou o deploy** — as migrations são
aplicadas de dentro do container. O comentário no Dockerfile registra: "a
aplicação servia páginas, mas o banco nunca migrava".

### Não podar `devDependencies` presumindo que só servem ao build

Armadilha clássica, e aqui **já resolvida corretamente**: o seed era TypeScript e
exigia `tsx` no runtime; a solução foi compilá-lo com esbuild em tempo de build.
O caminho antigo continua como reserva para rollback. Não mexer.

### Não trocar a imagem base por uma menor

`node:22-alpine` já é enxuta. Trocar por `distroless` ou similar quebraria o
Prisma, que carrega binário nativo por caminho em runtime.

### Não apagar dados de produção, nem propor retenção agora

Tabelas como `admin_audit_log`, `notifications`, `prompt_runs` e
`activity_performance` crescem sem teto. **Isso é proposta separada**, com
impacto explicado, e jamais executada por iniciativa própria. Além disso, **não
há dado nenhum hoje** — a base não existe. Discutir retenção antes de existir
dado é otimização prematura.

### Não rodar limpeza global de Docker na VPS

🔴 `docker system prune -a` e `docker volume prune` atingiriam o **digiurban**,
que está no ar. Seu próprio checklist já diz: *"dangling não significa lixo; pode
ser o banco de um projeto cujos containers foram derrubados"*. Qualquer limpeza
deve ser filtrada por rótulo ou idade, com escopo no projeto.

### Não otimizar o laço do engajamento agora

Filtrar alunos no SQL e enxugar `carregarTrilha` renderia mais que o item 4. Mas
altera **quem recebe notificação**, e com zero alunos não há como validar. Fica
para depois da primeira medição real.

### Não mexer no digiurban

Está fora do escopo decidido. O container `ultrazend-messages` em restart loop a
110% de CPU é problema real, mas é de outro repositório e está no ar agora.
**Reportado, não tocado.**

### Não usar o tempo total do workflow como métrica de sucesso do item 1

O build muda de lugar; o relógio pode não melhorar. O objetivo é tirar a
compilação de cima da máquina que atende usuários. Medir pelo cronômetro do CI
levaria à conclusão errada.

---

## Sobre a rede de segurança

**MEDIDO:** a suíte existe e roda — `npx vitest run --root apps/web`: **33 testes
em 1 arquivo**, todos passando, 12 s. O typecheck passa: 5/5 tarefas, 26 s.

Mas é preciso ser explícito: são 33 testes cobrindo **um** arquivo
(`motor-acesso.test.ts`) num código de 165 arquivos e 33.653 linhas. **Não há
teste algum cobrindo build, container, deploy, migrations ou seed** — que é
exatamente o que este plano muda.

**Para as mudanças de infraestrutura, o primeiro deploy é o primeiro teste
funcional real.** É por isso que todo item acima tem caminho de reversão
explícito, e por isso o item 1 mantém o script antigo lado a lado.

Atenuante importante: **não há produção viva para quebrar.** O pior caso é o
deploy falhar e o site não subir — não há usuário perdendo acesso.

---

## O que fica pendente de produção

Nada disto será preenchido com estimativa disfarçada.

| Item | Como medir depois |
|---|---|
| Consumo real de CPU/RAM dos containers | `docker stats` sob uso |
| Pico versus ociosidade | `docker stats` em horário de aula |
| Tamanho da imagem publicada | `docker images` após o item 1 |
| Tempo real de `pull` na VPS | log do deploy |
| Número de alunos ativos | consulta ao banco |
| Custo real do motor de engajamento | log do `scheduler` |
| Ajuste fino dos limites de CPU/PID | `docker stats` — os valores atuais são teto de proteção, não dimensionamento |

---

## Sequência de implementação

Seguindo a ordem recomendada (desbloquear → código de baixo risco → build e
imagem → infraestrutura → pós-produção → requer autorização):

**Bloco A — infraestrutura declarativa, risco baixo, sem tocar em código**
Itens 2 (logs), 3 (CPU/PIDs), 9 (`.dockerignore`).
Validação: `docker compose config`, typecheck, testes.

**Bloco B — agendamento**
Itens 4 (24 h) e 5 (remover cron).
Validação: typecheck, testes, revisão do script.

**Bloco C — build e publicação**
Itens 1 (GHCR) e 10 (retenção).
Validação: build local da imagem, `workflow_dispatch` antes de qualquer push na `main`.

**Bloco D — healthcheck**
Item 8.

**Adiados para depois do primeiro deploy:** item 7 (seed) e a otimização do laço
de engajamento. Item 6 aguarda sua decisão.

---

## Decisões que preciso de você

1. **Item 6 (landing no build):** aceita a recomendação (b) — manter
   `revalidate = 60` e conviver com até 60 s de conteúdo padrão após o deploy?
   Ou prefere (a) `force-dynamic`, sempre atual mas consultando o banco a cada
   visita?

2. **Item 7 (seed):** concorda em **adiar** para depois do primeiro deploy? É o
   de maior risco e menor ganho imediato, com a base vazia.

3. **`api:3001`:** ainda pretende criar o serviço de API dedicado? Se sim ou
   talvez, fica como está. Se foi abandonado, removo com o checklist completo.

4. ⚠️ **Confirmação do deploy:** implementado tudo, o push na `main` **é a
   implantação**. Aviso antes e espero sua palavra — conforme combinado.

---

**Próximo passo:** conforme o método, **paro aqui para sua leitura.** Só
implemento depois da sua validação.
