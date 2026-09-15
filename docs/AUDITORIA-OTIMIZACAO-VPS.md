# Auditoria de consumo de recursos — Aprender IA

**Data:** 14/09/2026
**Escopo:** aplicação `aprender-ia` em VPS compartilhada (72.60.10.108)
**Estado:** auditoria concluída. **Nenhuma alteração foi feita no projeto.**

Toda afirmação numérica neste documento carrega uma marca de origem:

- **MEDIDO** — comando executado, resultado observado. O comando é citado.
- **ESTIMADO** — raciocínio a partir do código. A base é citada.
- **NÃO MEDIDO** — desconhecido. Registrado como tal, nunca preenchido por estimativa.

---

> ## ⚠️ LEIA PRIMEIRO — esta auditoria foi escrita sob premissa falsa
>
> Este documento foi redigido **antes** de eu ter acesso à VPS, supondo que a
> aplicação estivesse em produção consumindo recursos. **Ela não estava.**
>
> Verificado em 15/09/2026 na VPS 72.60.10.108: sem containers, sem imagens, sem
> volumes, sem certificado, sem `/opt/aprenderia`. A busca
> `find / -iname '*aprender*'` voltou vazia. A VPS **foi resetada pelo dono**,
> porque o conjunto de ~90 containers de 24 projetos a derrubou.
>
> **O que isto invalida:**
> - Toda linguagem de "esta aplicação consome demais em produção" — não havia
>   produção. O diagnóstico de **código** segue válido (foi feito lendo código).
> - A afirmação de "~20 aplicações no mesmo host" (§1, §7.5): repeti o que os
>   comentários do código diziam. Hoje há **um** projeto (digiurban, 5
>   containers) e nenhum certificado.
> - A severidade do item P2: com **zero alunos**, ele não consome nada hoje. É
>   bomba-relógio, não incêndio.
>
> **O que isto confirma, com número que eu ainda não tinha:** o item P1 deixou de
> ser estimativa. O histórico dos 79 deploys mostra `next build` de **157,6 s**
> dentro da VPS, passo de deploy consumindo **333 s (88% do total)** e **três
> deploys mortos no timeout** (45,5 / 45,3 / 32,7 min).
>
> **Steal time medido: 1,4%.** O provedor entrega a CPU contratada — o problema
> nunca foi hospedagem.
>
> Ver [COMPARACAO-ANTES-DEPOIS.md](./COMPARACAO-ANTES-DEPOIS.md) para o que foi
> medido de fato, e [PLANO-OTIMIZACAO-VPS.md](./PLANO-OTIMIZACAO-VPS.md) para o
> que foi feito.

---

## 0. Correções de afirmações anteriores

Esta seção existe por exigência do método: um relatório que esconde o próprio erro
é pior que um incompleto. Durante a investigação eu afirmei **três** coisas
erradas.

### 0.0 "A VPS hospeda ~20 aplicações e ~24 domínios" — ERRADO HOJE

Repeti o que os comentários do código afirmam, sem verificar. Era verdade da
máquina **antiga**; a atual foi resetada e tem um único projeto. Ver o aviso no
topo.

### 0.3 "O workflow do digiurban é o padrão GHCR já funcionando na sua conta" — ERRADO

Deduzi isso das imagens `ghcr.io/fernandinhomartins40/...` rodando na VPS. Ao
**ler** o `deploy-incremental.yml` (295 linhas), ele não tem `ghcr`, nem
`login-action`, nem `build-push-action`: a linha 180 é `docker build` executado
por SSH **dentro da VPS** — o mesmo vício. E o projeto `erpnovo`, citado como
referência na sua documentação anterior, **não existe** (404 em três variações do
nome).

**Lição registrada no padrão:** a imagem que está rodando não prova como ela foi
produzida.

### 0.1 "As credenciais de admin entram na imagem Docker" — ERRADO

**O que afirmei:** que `CREDENCIAIS-ADMIN.txt`, por não estar no `.dockerignore`,
seria copiado pelo `COPY . .` do Dockerfile e as senhas de produção ficariam
gravadas numa camada da imagem.

**Por que estava errado:** tratei um ESTIMADO como MEDIDO. Eu havia lido o
`.dockerignore` (que de fato não barra o arquivo), mas não havia verificado *de
onde vem o contexto de build*. O workflow roda `actions/checkout@v4` e só então
empacota com `tar`. O checkout é um clone limpo do repositório, e
`git ls-files CREDENCIAIS-ADMIN.txt` retorna **0 arquivos** — o arquivo é
ignorado pelo `.gitignore` (regra `CREDENCIAIS-*.txt`) e nunca foi versionado.

**Conclusão correta:** **não há vazamento de credencial para a imagem publicada
nem para a VPS.** O risco remanescente é menor e de escopo local: um
`docker build` executado na sua máquina gravaria o arquivo numa camada. Ver §7.3.

### 0.2 "O contexto de build tem 479 MB" — ENGANOSO

**O que afirmei:** que o projeto pesa 479 MB fora `node_modules` e `.git`, e
insinuei que esse peso ia para a VPS.

**Por que estava errado:** medi o **seu disco**, não o que o deploy envia. Os
diretórios pesados — `fuse3dicons/` (87 MB), `assets-3dicons/` (31 MB),
`assets landingpage/` (9,9 MB) e `video_abertura.mp4` (2,3 MB) — são todos
**não rastreados pelo git**, logo não existem no checkout e não entram no `tar`.

**Conclusão correta:** o contexto real é de **16 MB** (MEDIDO:
`git ls-files -z | xargs -0 du -ch`). Isso muda a prioridade do item: deixa de
ser um problema grande e vira um ajuste pequeno. Ver §7.1.

---

## 1. Resumo executivo

A aplicação **não é uma consumidora descontrolada de recursos.** Esta é a
conclusão mais importante da auditoria, e ela contraria a premissa do pedido.

O projeto já passou por um trabalho de otimização anterior, visível e bem
documentado no próprio código: a imagem usa `output: "standalone"`, há limites de
memória nos containers, o Postgres tem `shared_buffers` ajustado ao limite do
container, o heap do V8 tem teto explícito abaixo do limite do cgroup, o pool do
Prisma está fixado em 5 conexões e os healthchecks foram afrouxados de 10s para
30s. Cada uma dessas decisões está comentada com o motivo. **Nada disso deve ser
desfeito** — ver §8.

O que sobra são **cinco desperdícios reais**, e o maior deles não está na
aplicação: está no processo de deploy.

| # | Problema | Severidade | Onde |
|---|---|---|---|
| 1 | Build da imagem roda **na VPS de produção** | 🔴 Crítica | `.github/workflows/deploy.yml` |
| 2 | Motor de engajamento roda **24×/dia** com N+1 por aluno | 🔴 Crítica | `scheduler` + `engajamento.ts` |
| 3 | Agendamento **duplicado** (scheduler + cron do host) | 🟠 Alta | compose + `remote-deploy.sh` |
| 4 | Seed completo re-executado **a cada deploy** | 🟠 Alta | `remote-deploy.sh` |
| 5 | Healthcheck consulta o banco **2.880×/dia** | 🟡 Média | `Dockerfile.web` + `health/route.ts` |

Os itens 1 e 2 são os que pagam a conta. O item 1 é também o mais fácil de
argumentar: **compilar em produção disputa CPU com os usuários**, e este build
já consumiu, por medição registrada no próprio workflow, mais de 27 minutos só
baixando pacotes — numa máquina que hospeda cerca de 20 outras aplicações.

---

## 2. Linha de base (§2.1)

Estabelecida **antes** de qualquer alteração, para que seja possível saber se algo
quebrou depois.

| Verificação | Resultado | Origem |
|---|---|---|
| `npx turbo run typecheck` | ✅ 5/5 tarefas, 26,3 s | MEDIDO |
| `npx vitest run --root apps/web` | ✅ 1 arquivo, **33 testes**, 12,0 s | MEDIDO |
| Contexto de build (checkout) | **16 MB**, 364 arquivos | MEDIDO |
| Repositório `.git` | 21 MB | MEDIDO |
| `node_modules` local | **1.011 MB**, 221 pacotes em `.pnpm` | MEDIDO |
| `.next` local (após build) | 333 MB | MEDIDO |
| Banco local (dev) | **11 MB** | MEDIDO |
| Código-fonte | 165 arquivos `.ts/.tsx`, 33.653 linhas | MEDIDO |

### ⚠️ Sobre a rede de segurança automatizada

A suíte de testes **existe e roda de verdade** — verifiquei em vez de presumir,
como a Parte 5 exige. Mas é preciso ser explícito sobre o alcance: são **33
testes num único arquivo** (`apps/web/src/lib/motor-acesso.test.ts`), cobrindo o
motor de acesso, num código de 165 arquivos.

**Não há teste algum cobrindo build, container, deploy, migrations ou seed.**
Para mudanças de infraestrutura — que é exatamente o que este trabalho propõe —
**o primeiro deploy é o primeiro teste funcional real.** Isso eleva o nível de
cuidado necessário e é o principal argumento para tudo ser reversível.

---

## 3. Arquitetura atual

Monorepo Turborepo + pnpm, uma única aplicação Next.js 15 (App Router) servindo
três faces: landing (`/`), painel do aluno (`/app`) e painel administrativo
(`/admin`).

```
aprender-ia/
├── apps/web/            Next.js 15 — landing + aluno + admin
├── packages/
│   ├── db/              Prisma (44 models, 19 migrations)
│   ├── auth/            Auth.js v5 (credenciais, sem OAuth)
│   ├── ui/              tokens + cn
│   ├── types/           contratos Zod
│   ├── ai-launcher/     adaptadores que abrem cada IA
│   └── config/          tailwind compartilhado
├── docker/
│   ├── Dockerfile.web   multi-stage (4 estágios)
│   ├── nginx.conf       nginx INTERNO do compose
│   └── docker-compose.yml   ← DEV apenas
├── docker-compose.prod.yml  ← o que o deploy usa
└── .github/
    ├── workflows/deploy.yml
    └── scripts/remote-deploy.sh, remote-health-check.sh
```

**Arquivo que realmente vale (§2.1):** `docker-compose.prod.yml` na raiz.
Confirmado MEDIDO — `remote-deploy.sh` o referencia em todas as 6 invocações do
`docker compose`. O `docker/docker-compose.yml` é **só de desenvolvimento**
(Postgres na porta 5544 + Adminer na 8081) e **nunca vai para produção**.

**Fluxo de uma requisição em produção:**

```
internet → nginx do HOST (443, TLS, certbot)
         → 127.0.0.1:3130
         → nginx do COMPOSE (container, porta 80)
         → web:3000 (Node standalone)
         → postgres:5432
```

### 3.1 Proporção cliente/servidor

| Métrica | Valor | Origem |
|---|---|---|
| Arquivos com `"use client"` | 50 | MEDIDO |
| Arquivos com `"use server"` | 34 | MEDIDO |
| Ocorrências de `useEffect` | 31 | MEDIDO |
| Componentes | 53 | MEDIDO |
| Rotas de API | **6** | MEDIDO |

A arquitetura é predominantemente **Server Components + Server Actions**, com
apenas 6 rotas de API. Isso é bom para consumo: quase não há camada de API
intermediária, e o trabalho acontece no servidor sem round-trip extra.

**Não há polling no cliente.** Busquei `setInterval`, `refetchInterval` e
`pollingInterval` em todo `apps/web/src` e `packages` — a única ocorrência de
revalidação temporal é `export const revalidate = 60` na landing, que é
apropriado (a landing lê do banco e não pode ser estática). MEDIDO.

---

## 4. Inventário de containers

Classificação conforme a tabela de cinco estados do método.

| Container | Imagem | Estado | Limite atual | Veredito |
|---|---|---|---|---|
| `postgres` | postgres:16-alpine | **Necessário** | 512 MB | Manter. Tuning já correto. |
| `web` | build próprio | **Necessário** | 512 MB | Manter. Heap já ajustado. |
| `nginx` | nginx:1.27-alpine | **Necessário mas otimizável** | ❌ **sem limite** | Adicionar limite |
| `media-init` | alpine:3.21 | **Necessário** | — (roda e sai) | Manter |
| `scheduler` | curlimages/curl:8.12.1 | **Duplicado** | ❌ **sem limite** | Consolidar (§6.2) |

**Cinco containers, quatro deles justificados.** O número é racional: cada um tem
ciclo de vida próprio. Não recomendo juntar nada — em particular, **não** juntar
o Postgres com o web, que é a "otimização" que mais quebra aplicação em VPS
compartilhada.

### 4.1 Limites de recurso ausentes

**MEDIDO** (leitura do `docker-compose.prod.yml`): apenas `postgres` e `web` têm
`deploy.resources.limits.memory`. **Nenhum container tem limite de CPU. Nenhum
tem limite de PIDs.**

Sem limite de CPU, um processo em laço na aplicação consome toda a CPU
disponível do host e degrada as ~20 outras aplicações. Sem limite de PIDs, um
fork bomb (acidental ou não) derruba o host inteiro. Em host compartilhado isso
não é aperto, é **proteção ausente**.

### 4.2 O serviço `api:3001` — configuração reservada, sem consumidor

O `nginx.conf` roteia `/api/backend/*` para um `upstream api:3001` que **não
existe** como serviço no compose.

**Onde procurei (§1.2 — provar que procurei no lugar certo):**

1. Descobri a estrutura real primeiro: o código vive em `apps/web/src/app/`
   (App Router), não em `src/` nem em `app/` na raiz.
2. Busquei `api/backend` a partir da **raiz do projeto**, em `.ts .tsx .js .json
   .conf .yml`, excluindo `node_modules`, `.next`, `.git` e `.turbo`.
3. Busquei a forma indireta: `fetch("http...`, `baseURL`, `API_URL`,
   `BACKEND_URL`, `NEXT_PUBLIC_*`.
4. Listei as rotas de API de fato existentes: `auth/[...nextauth]`, `cadastro`,
   `engajamento`, `health`, `push/inscrever`, `recuperar-senha`. **Nenhuma é
   `backend`.**

**Resultado MEDIDO:** as únicas ocorrências da string em todo o projeto são as do
próprio `nginx.conf` (linhas 6, 66, 69, 71) e um comentário no
`docker-compose.prod.yml` (linha 7). **Zero consumidores.**

**Classificação: Opcional, não Obsoleto.** E a distinção importa. Isto **não** é
o caso da §1.5 (funcionalidade quebrada), porque não existe cliente algum a
preservar — nunca houve. É andaime deixado para um serviço planejado. Já está
tratado de forma defensiva e correta: resolve o nome via DNS do Docker em tempo
de requisição, o que impede o nginx de abortar no boot, e devolve 503 explícito.

**Custo real: zero em runtime.** Recomendo **manter** e apenas documentar. Removê-lo
rende nada e reintroduzi-lo depois custa tempo. Vai para a seção "NÃO FAZER" do
plano.

---

## 5. Problemas por severidade

### 🔴 P1 — O build da imagem roda na VPS de produção

**Onde:** `.github/workflows/deploy.yml` → `remote-deploy.sh` linha 63.

**O que acontece (MEDIDO, por leitura do fluxo completo):** o runner do GitHub
empacota o código-fonte com `tar`, envia por SSH, e então executa
`docker compose build --pull` **dentro da VPS**. O runner do GitHub Actions —
que é gratuito, ocioso e não compartilhado com ninguém — é usado apenas como
intermediário de transferência.

**Por que é o item mais caro:** durante todo o build, a VPS está compilando
TypeScript, rodando `next build`, gerando o Prisma Client, resolvendo 221 pacotes
e executando `esbuild` — enquanto serve as ~20 outras aplicações e os usuários
desta. O próprio workflow documenta o custo em seus comentários: o timeout
precisou ir de 45 para **90 minutos**, e um install chegou a **27 minutos só de
download**, tendo estourado o limite anterior e perdido o deploy.

Há inclusive uma evidência de I/O saturado registrada no Dockerfile: com a
concorrência padrão do pnpm (16), o build "chegou a escrever 215 dos 217 pacotes
e parou ali, sem erro". A solução adotada foi baixar a concorrência para 4/2 —
correta como paliativo, mas ela trata o sintoma. **A causa é build em produção.**

**Impacto ESTIMADO:** durante 10–40 min por deploy, a VPS opera sob carga de
compilação. Não posso medir o pico sem acesso à VPS (§9).

**Solução:** construir no runner do GitHub, publicar em registry (GHCR é gratuito
para repositório privado), e a VPS apenas puxar a imagem pronta. Isso também
habilita versionamento por hash imutável e rollback por troca de tag — hoje
impossível sem rebuild.

**Risco da mudança:** médio. Requer segredo de registry e altera o caminho de
deploy inteiro. **Exige janela combinada.**

---

### 🔴 P2 — Motor de engajamento: N+1 por aluno, 24 vezes por dia

**Onde:** `apps/web/src/server/engajamento.ts` + serviço `scheduler` no compose.

**O que o laço faz por aluno (MEDIDO, por leitura das linhas 43–105):**

| Consulta | Linha | Sempre? |
|---|---|---|
| `enrollment.findFirst` | 43 | sim |
| `userMission.findUnique` | 52 | se há missão nova |
| `lessonProgress.findFirst` | 71 | sim |
| **`carregarTrilha(aluno.id)`** | 80 | se inativo |
| `notificar()` → preferências + dedupe + push | 57/103 | se notifica |

O agravante está na linha 80. **`carregarTrilha` não é uma consulta — são
quatro**, no mínimo: `enrollment.findUnique`, `course.findUnique` com `include`
aninhado de módulos **e todas as lições**, `acessoDoAluno()` (que por sua vez
consulta assinaturas → planos → cursos → módulos) e `lessonProgress.findMany`.
MEDIDO por leitura de `trilha.ts` linhas 79–115.

**Custo ESTIMADO por execução:** cerca de `2 + N×(2 a 8)` consultas, onde N é o
número de alunos ativos com matrícula. Base do cálculo: as duas consultas iniciais
(missões + lista de alunos) mais o laço acima.

| Alunos ativos | Consultas/execução | Consultas/dia (24×) |
|---|---|---|
| 50 | ~200 | **~4.800** |
| 200 | ~800 | **~19.200** |
| 500 | ~2.000 | **~48.000** |

**⚠️ N é NÃO MEDIDO** — só o banco de produção responde, e não tenho acesso à VPS
nesta sessão. O banco local (dev) tem 11 MB e nenhum aluno real. Esta é a
variável que decide se P2 é grave ou apenas desperdício modesto, e é a primeira
coisa a medir quando houver acesso.

**O desperdício não é o trabalho — é a frequência.** O `ENGAGEMENT_INTERVAL_SECONDS`
padrão é **3600** (1 hora), então o scheduler executa o motor **24 vezes por
dia**. Mas o próprio motor aplica `dedupeHoras` de 24 h, 72 h ou 168 h. Ou seja:
**23 das 24 execuções diárias percorrem todos os alunos, montam a trilha
completa de cada um, e descartam o resultado na deduplicação.**

É trabalho computado para ser jogado fora, por construção.

**Solução:** elevar o intervalo para 24 h (`ENGAGEMENT_INTERVAL_SECONDS=86400`),
alinhando a frequência à deduplicação que o próprio código já aplica. **Zero
perda funcional** — os avisos continuam idênticos, porque o dedupe já os
limitava a um por dia. Redução ESTIMADA de ~96% do trabalho deste motor.

Melhorias adicionais possíveis (filtrar alunos por inatividade **no SQL**, antes
do laço; substituir `carregarTrilha` por uma consulta enxuta) são de maior risco
e devem vir depois, com medição real.

**Risco:** baixo. É mudança de uma variável de ambiente.

---

### 🟠 P3 — Agendamento duplicado

**MEDIDO.** O mesmo endpoint `/api/engajamento` é acionado por **dois**
mecanismos independentes:

1. O container `scheduler`, a cada `ENGAGEMENT_INTERVAL_SECONDS` (padrão 3600 s)
   → `http://web:3000/api/engajamento` (compose, linhas do serviço `scheduler`)
2. Um **cron no host**, instalado pelo `remote-deploy.sh`, às 12:00 UTC
   → `http://127.0.0.1:3130/api/engajamento` (`remote-deploy.sh`, bloco crontab)

Classificação: **Duplicado**. Dois agendadores para uma tarefa. Um container
inteiro (`curlimages/curl`) existe para fazer o que o cron do host já faz.

**Ressalva importante:** isto **não** causa notificação duplicada ao aluno — o
`dedupeHoras` protege. O desperdício é de processo e de clareza, não de
experiência do usuário.

**Decisão pendente (§1.8 — é decisão sua, não minha):** qual dos dois manter?

- **Manter o cron do host, remover o `scheduler`:** menos um container, menos uma
  imagem. Mas o agendamento passa a viver fora do compose, invisível para quem
  lê o projeto, e depende de `crontab` existir na VPS.
- **Manter o `scheduler`, remover o cron:** tudo fica dentro do compose,
  auto-contido e visível. Custa um container (~4 MB ociosos, ESTIMADO por
  comparação com o `adminer` local, medido em 6,4 MB).

**Minha recomendação:** manter o `scheduler` com intervalo de 24 h e remover o
cron do host. O compose passa a ser a descrição completa da aplicação, o que vale
mais em host compartilhado do que os poucos MB do container. Mas a escolha é sua.

---

### 🟠 P4 — Seed completo re-executado a cada deploy

**Onde:** `remote-deploy.sh`, bloco "Semeando conteúdo".

**MEDIDO:** `seed.ts` tem 1.091 linhas e executa **8 blocos de `upsert`**,
alguns dentro de laços — curso, ferramentas de IA, módulos, **82 lições**, **50
verbetes** da base de conhecimento, planos, `planModule.createMany`, conquistas
e missões. A base de conhecimento (`base-conhecimento.ts`) tem 913 linhas.

O seed é **idempotente e isso está correto** — não duplica nada. O problema é
outro: ele reescreve centenas de linhas no Postgres a cada deploy, gerando escrita
em disco e churn de WAL numa VPS compartilhada, para produzir um estado que na
imensa maioria das vezes já é idêntico ao existente.

**Impacto ESTIMADO:** dezenas de segundos de escrita por deploy e WAL
proporcional. Não medido em produção.

**Solução proposta:** guardar um marcador de versão do seed (hash do conteúdo) e
pular a execução quando nada mudou. **Não remover o seed** — ele é necessário
para instalação nova e para o primeiro admin.

**Risco:** médio. Um marcador errado pula um seed necessário. Precisa de cuidado
e de caminho de forçar execução.

---

### 🟡 P5 — Healthcheck consulta o banco 2.880 vezes por dia

**MEDIDO.** Três healthchecks, todos a cada 30 s:

| Healthcheck | Onde | Bate no banco? |
|---|---|---|
| `postgres` → `pg_isready` | compose | leve, direto |
| `nginx` → `wget /health` | compose | não (§ nginx.conf: `return 200`) |
| **`web` → `/api/health`** | `Dockerfile.web` linha 215 | **sim: `SELECT 1` via Prisma** |

O terceiro executa `await prisma.$queryRaw\`SELECT 1\`` (MEDIDO,
`health/route.ts` linha 11). A 30 s de intervalo: **2.880 consultas/dia**, mais
2.880 do `pg_isready`.

`SELECT 1` é barato, e o healthcheck **deve** verificar o banco — um container
que responde HTTP mas perdeu o banco está degradado e precisa ser detectado.
**Isto está conceitualmente certo e não deve ser removido.**

A questão é só o intervalo. O comentário do compose já registra o raciocínio ao
afrouxar o `postgres` de 10 s para 30 s. O mesmo argumento se aplica aqui: 60 s
detecta queda com rapidez suficiente e corta metade das verificações.

**Risco:** baixo. Detecção de falha fica até 30 s mais lenta.

---

## 6. Dependências

**MEDIDO:** 221 pacotes em `node_modules/.pnpm`, 1.011 MB em disco local.

**Não encontrei dependência não usada nem duplicada.** As bibliotecas declaradas
em `apps/web` são todas de uso evidente: `next`, `react`, `next-auth`, `zod`,
`@prisma/client`, `web-push`, `bcryptjs`, `framer-motion`, `lucide-react`,
`@tabler/icons-react`, `@tanstack/react-query`.

Dois pontos de atenção, ambos **já tratados corretamente** no projeto:

- **`tsx` como dependência de `packages/db`** — é exatamente a armadilha que o
  método §1.6 descreve (ferramenta de desenvolvimento invocada pelo deploy dentro
  do container). O projeto **já resolveu isto**: o seed é compilado com `esbuild`
  em tempo de build (`seed.mjs`), e o `remote-deploy.sh` mantém o caminho antigo
  via `tsx` apenas como reserva para rollback. Solução correta, bem comentada.
- **CLI do Prisma e `@prisma/engines` na imagem final** — o comentário no
  Dockerfile registra que removê-los rendia ~120 MB **e quebrava o deploy**,
  porque as migrations são aplicadas de dentro do container. Mantidos por
  necessidade real, com a evidência anotada. **Não mexer.**

Ambos são exemplos de "boa prática verificada antes de aplicada". Vão para §8.

---

## 7. Armazenamento

### 7.1 Contexto de build

| Categoria | Tamanho | Vai no deploy? | Origem |
|---|---|---|---|
| Arquivos rastreados (checkout) | **16 MB** | ✅ sim | MEDIDO |
| `assets-marca/` | 7,1 MB | ✅ **sim** | MEDIDO |
| `apps/web/public/` | 6,7 MB | ✅ sim (necessário) | MEDIDO |
| `fuse3dicons/` | 87 MB | ❌ não rastreado | MEDIDO |
| `assets-3dicons/` | 31 MB | ❌ não rastreado | MEDIDO |
| `assets landingpage/` | 9,9 MB | ❌ não rastreado | MEDIDO |
| `video_abertura.mp4` (raiz) | 2,3 MB | ❌ não rastreado | MEDIDO |

**O achado:** `assets-marca/` (7,1 MB, 8 arquivos PNG em alta) **está versionado**
e portanto entra no checkout, no `tar` e no contexto de build — ocupando **44%
dos 16 MB**.

**Onde procurei um consumidor (§1.2):** busca por `assets-marca` em todo o
projeto a partir da raiz. **Resultado MEDIDO:** a única referência é
`scripts/gerar-favicon.py` (linhas 4 e 31), um script de geração de assets que
roda na máquina do desenvolvedor. **Nenhum código da aplicação o referencia.**

Classificação: **Necessário mas otimizável** — é fonte de arte, não recurso de
runtime. A aplicação usa as versões processadas em `apps/web/public/marca/`.

**Proposta:** adicionar `assets-marca` ao `.dockerignore`. Ele continua no git
(é a fonte para regerar o favicon), mas deixa de entrar na imagem. Economia
MEDIDA de 7,1 MB no contexto, ~44%.

**Nota de honestidade sobre o tamanho do ganho:** 7 MB por deploy é pouco. O
item entra pelo custo praticamente nulo e risco quase nulo, não por ser
relevante sozinho.

### 7.2 Retenção

| Item | Política atual | Avaliação |
|---|---|---|
| Releases na VPS | mantém as 3 mais recentes | ✅ **já correto** |
| Cache de build Docker | poda só se disco < 5 GB | ⚠️ reativo |
| Logs dos containers | ❌ **nenhuma** | 🔴 **crescimento infinito** |
| Volume `notification-media` | ❌ nenhuma | ⚠️ cresce com uploads |
| Tokens de senha vencidos | limpos a cada pedido | ✅ já correto |
| Tabelas históricas | ❌ nenhuma | ⚠️ ver §7.4 |

**🔴 Logs sem limite é o problema real desta seção.** Nenhum serviço define
`logging.options.max-size`. O driver padrão do Docker (`json-file`) **não tem
limite por padrão**: o arquivo de log cresce até o disco acabar. Em VPS
compartilhada, disco cheio derruba **todas** as aplicações, não só esta.

O `remote-deploy.sh` já reconhece o risco de disco — ele aborta o deploy abaixo
de 3 GB livres. Mas trata o sintoma, não a causa.

**Solução:** `max-size: "10m"` e `max-file: "3"` por serviço. Teto de 30 MB por
container, 150 MB no total. Risco baixo; a única perda é histórico antigo de log.

### 7.3 Risco local de credencial

Conforme a correção da §0.1: `CREDENCIAIS-ADMIN.txt` **não** vaza para produção.
Mas o `.dockerignore` não o barra, então um `docker build` **na sua máquina**
gravaria as senhas numa camada da imagem local.

**Proposta:** adicionar `CREDENCIAIS-*.txt` ao `.dockerignore`, espelhando o que
o `.gitignore` já faz. Custo zero.

**Decisão sua (§1.8):** as senhas no arquivo são de produção e estão em texto
claro (painel admin de `aprenderia.site` e sua conta pessoal). O arquivo instrui
a trocá-las no primeiro acesso. **Isso foi feito?** Se não, vale trocar —
independentemente desta auditoria.

### 7.4 Banco de dados

**MEDIDO (banco local de desenvolvimento, 11 MB):**

| Tabela | Linhas |
|---|---|
| `prompt_templates` | 104 |
| `lessons` | 82 |
| `knowledge_entries` | 50 |
| `_prisma_migrations` | 19 |
| `modules` | 11 |

**⚠️ Isto NÃO representa produção.** É o banco de dev, sem alunos reais. O
tamanho e o crescimento em produção são **NÃO MEDIDOS**.

**Schema:** 44 models, 1.529 linhas, 19 migrations. **Os índices estão bem
cuidados** — contei índices compostos alinhados aos padrões de consulta
(`@@index([userId, criadoEm])`, `@@index([ativo, ordem])`,
`@@index([publicado, categoria])`, `@@index([status, publicarEm])`). Não
encontrei tabela grande sem índice. Isto é trabalho bem feito.

**Tabelas que crescem sem teto** (ESTIMADO por análise do schema, não medido):
`admin_audit_log`, `notifications`, `prompt_runs`, `activity_performance`,
`diary_entries`.

🔴 **Nenhuma proposta de exclusão será feita.** Política de retenção é proposta
separada, com impacto explicado, e **jamais executada por iniciativa própria**.
Registro apenas que o tema existe e precisa de decisão quando houver medição real.

### 7.5 Ambiente local (não afeta produção)

**MEDIDO** na sua máquina:

```
Images         21 total   26,72 GB   22,04 GB recuperáveis (82%)
Build Cache   359 itens   24,92 GB   22,27 GB recuperáveis
Local Volumes   7 total    1,66 GB    1,52 GB recuperáveis (91%)
```

**~44 GB recuperáveis.** Há imagens de outros projetos (`ultrazend`, `makucho`,
`php`, `maven`) e o container `aprender-ia-adminer` está de pé há 2 dias
consumindo 6,4 MB à toa.

Isto **não afeta a VPS**. Registro como higiene local. E vale o alerta da §7 do
método: **em host compartilhado, nunca rodar `docker system prune -a` global** —
aqui na sua máquina o risco é menor, mas o hábito é o mesmo.

---

## 8. O que está CORRETO e não deve ser mexido

Esta seção é tão importante quanto a lista de problemas. O projeto já recebeu
otimização competente, e desfazê-la por desconhecimento seria regressão.

| Decisão | Por que está certa | Onde |
|---|---|---|
| `output: "standalone"` | Corta TypeScript/Tailwind/Vitest da imagem final | `next.config.mjs` |
| `outputFileTracingRoot` | Obrigatório em monorepo; sem ele o container sobe quebrado | `next.config.mjs` |
| Estágio `prisma-deploy` separado | Motor nativo não é import rastreável; árvore npm achatada evita hash do pnpm | `Dockerfile.web` |
| Recriar caminho `.pnpm` por link | O bundle grava caminho com hash em build; sem o link, erro a cada boot | `Dockerfile.web` |
| Manter CLI do Prisma na imagem | Removê-la rendia 120 MB **e quebrava as migrations** | `Dockerfile.web` |
| `--max-old-space-size=320` vs 512 MB | GC age antes do OOM killer; heap em ~62% do limite | `Dockerfile.web` |
| `shared_buffers=128MB` + limite 512 MB | Limite externo **com** ajuste interno — evita OOM sob carga | compose |
| `connection_limit=5` no Prisma | Padrão abriria 9 conexões × 5–10 MB cada | `deploy.yml` |
| Cache de store do pnpm | Salvou o deploy quando o lockfile mudou | `Dockerfile.web` |
| Migrations **antes** de subir o app | Já causou incidente ao ser feito na ordem inversa | `remote-deploy.sh` |
| `ensure_env` para VAPID e SMTP | Sobrescrever invalidaria todas as inscrições push | `deploy.yml` |
| Seed compilado com esbuild | Tira o `tsx` do runtime | `Dockerfile.web` |
| Versionar `sw.js` por release | Evita HTML novo com JS velho | `remote-deploy.sh` |
| `upstream api` por DNS + variável | Impede o nginx de abortar no boot | `nginx.conf` |
| Espera por outro certbot | VPS tem ~24 domínios; matar processo quebraria outros sites | `deploy.yml` |
| Manter 3 releases | Retenção já existe e é sensata | `remote-deploy.sh` |
| Índices compostos do schema | Alinhados aos padrões de consulta | `schema.prisma` |
| `prisma` singleton global | **Sem** `new PrismaClient` por requisição | `packages/db/src/client.ts` |

### 8.1 Sobre o risco mais grave que o método manda procurar

A §2.2 destaca "recurso criado por requisição" como a causa mais comum e mais
grave de esgotamento em produção.

**Procurei especificamente e MEDI:** `grep -rn "new PrismaClient"` em todo o
projeto retorna **três** ocorrências, e todas estão certas:

- `packages/db/src/client.ts:7` — **singleton**, com cache em `globalThis` fora
  de produção (padrão recomendado pelo Prisma para sobreviver ao hot-reload).
- `packages/db/prisma/seed.ts:21` e `seed-admin.ts:22` — scripts de linha de
  comando, processo de vida curta. Apropriado.

**Nenhum handler, Server Action ou rota instancia cliente de banco.** Este é o
defeito mais caro que eu poderia ter encontrado, e ele **não existe aqui**.

---

## 9. O que NÃO pôde ser medido

Registrado com transparência, conforme §1.1. Nada disto será preenchido com
estimativa disfarçada.

| Item | Por que não foi medido |
|---|---|
| CPU, RAM e disco da VPS | **Sem acesso SSH nesta sessão** |
| **Steal time da VPS** | idem — ⚠️ ver alerta abaixo |
| Consumo real dos containers em produção | idem |
| Pico vs ociosidade | idem |
| Tamanho do banco em produção | idem |
| **Número de alunos ativos** | idem — é o multiplicador de P2 |
| Tamanho da imagem construída | idem — build roda na VPS |
| Tempo real de build e de deploy | idem |
| Nº de aplicações no mesmo host | ~20 (citado em comentários; não verificado) |

### ⚠️ Steal time — verificar antes de culpar a aplicação

O método (§2.6) é explícito: **se o provedor não entrega a CPU contratada, o load
alto não vem do código e nenhuma otimização resolve.**

Isto não foi verificado e **precisa ser o primeiro comando** quando houver
acesso:

```bash
top -bn1 | head -3          # coluna "st" em %Cpu(s)
vmstat 1 5                  # coluna "st"
```

Se o steal estiver alto, o problema é de hospedagem, não desta aplicação — e
seria um erro atribuir a ela um problema do provedor.

---

## 10. Perguntas que preciso que você responda

Conforme §1.8, estas são decisões de produto ou ações irreversíveis. Não as tomo
sozinho.

1. **Acesso à VPS** — consigo acesso SSH nesta sessão? Sem ele, tudo em §9
   permanece NÃO MEDIDO e a otimização fica limitada ao que se valida por código.

2. **Quantos alunos ativos há em produção?** Decide se P2 é grave ou modesto.
   Se houver acesso, eu mesmo meço.

3. **Agendamento duplicado (P3):** manter o `scheduler` do compose ou o cron do
   host? Minha recomendação é o `scheduler`, com intervalo de 24 h.

4. **Janela de manutenção:** o deploy pode ter downtime? Existe backup do banco
   de produção e ele já foi testado em restauração?

5. **`api:3001`:** o serviço de API dedicado ainda está nos planos? Se sim,
   mantemos o andaime (recomendado). Se foi abandonado, removemos — mas aí o
   checklist de remoção da §8.1 do método precisa ser percorrido inteiro.

6. **Credenciais (§7.3):** as senhas do `CREDENCIAIS-ADMIN.txt` já foram trocadas
   no primeiro acesso?

7. ⚠️ **`push` na `main` dispara deploy em produção** (MEDIDO:
   `on: push: branches: [main]`). Portanto **nenhum commit meu é marco de
   trabalho — é implantação.** Combino o momento com você antes de qualquer
   commit. Confirma esse entendimento?

---

## 11. Conclusão

A aplicação está **melhor do que o pedido sugeria**. Não encontrei os defeitos
clássicos de esgotamento: não há cliente de banco por requisição, não há polling
no cliente, não há dependência inútil, não há índice faltando, não há container
supérfluo além do `scheduler` duplicado, e os limites que existem foram
dimensionados com ajuste interno correspondente — que é a parte que quase todo
mundo erra.

O desperdício real está concentrado em **dois lugares**:

1. **O build roda na máquina que serve os usuários** (P1) — o maior, e o único
   que exige mudança estrutural.
2. **Um motor caro roda 24×/dia para que 23 execuções sejam descartadas pela
   própria deduplicação** (P2) — o de melhor relação impacto ÷ risco, corrigível
   por uma variável de ambiente.

Os demais (P3, P4, P5, logs, `.dockerignore`) são ajustes de baixo risco que
somam higiene e previsibilidade.

**Nenhuma funcionalidade precisa ser removida para reduzir consumo.** Todas as
propostas preservam capacidade funcional integral — inclusive P2, onde a
frequência cai 96% sem que um único aviso deixe de chegar ao aluno, porque a
deduplicação já os limitava.

---

**Próximo passo:** conforme o método, **paro aqui para sua leitura.** O plano
(`docs/PLANO-OTIMIZACAO-VPS.md`) só será escrito depois que você ler esta
auditoria e responder as perguntas da §10 — em especial a do acesso à VPS, que
determina quanto do plano pode ser validado por medição e quanto ficará marcado
como pendente de produção.
