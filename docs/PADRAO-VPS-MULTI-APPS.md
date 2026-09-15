# Padrão para múltiplas aplicações numa VPS compartilhada

Regras derivadas da auditoria do **Aprender IA** (14–15/09/2026) e do que
realmente aconteceu com esta VPS: ela **caiu** e precisou ser resetada, com ~90
containers de 24 projetos disputando recursos sem teto.

Cada regra abaixo traz o **status de validação**: comprovada por medição nesta
auditoria, ou ainda não validada em produção.

---

## O princípio

> **A VPS puxa, migra e sobe. Nunca compila.**

Uma VPS compartilhada é um recurso finito dividido entre aplicações que não se
conhecem. O padrão existe para que **nenhuma delas consiga prejudicar as outras**
— nem por pico, nem por vazamento, nem por descuido.

Uma solução que funciona isolada mas quebra com 10, 20 ou 30 aplicações no mesmo
host **não serve**.

---

## 1. Build: fora da máquina de produção

**Status: ✅ comprovado por medição.**

O runner de CI é gratuito, ocioso e descartável. A VPS atende usuários. Compilar
na VPS é tirar CPU e disco de quem está usando o site.

### A evidência

Medido no histórico do Aprender IA (79 execuções):

| Métrica | Valor |
|---|---|
| `next build` dentro da VPS | **157,6 s** |
| Passo de deploy (com build) | **333 s — 88% do total** |
| Deploys mortos no timeout | **3** (45,5 / 45,3 / 32,7 min) |
| Variação da mesma tarefa | **2,7 a 45,5 min** |

Essa variação de 17× é a assinatura de um build disputando I/O. Houve inclusive
um caso de instalação que "escreveu 215 dos 217 pacotes e parou, sem erro" — I/O
saturado, não falha de rede.

### A regra

```
CI                                  VPS
─────────────────────────────       ────────────────────
build + test                   →    (nada)
docker build                   →    (nada)
push → registry (GHCR)         →    docker pull
                                    migrations (--rm)
                                    docker compose up -d
```

### Como fazer

```yaml
jobs:
  build:
    permissions:
      contents: read
      packages: write        # dá ao GITHUB_TOKEN acesso ao GHCR
    steps:
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: |
            ghcr.io/<dono>/<app>:${{ steps.meta.outputs.sha }}
            ghcr.io/<dono>/<app>:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
          labels: |
            org.opencontainers.image.source=https://github.com/<dono>/<repo>
```

**Nenhum segredo novo é necessário** — o `GITHUB_TOKEN` automático basta.

O cache `type=gha` vive no GitHub, não no disco da VPS. É isso que impede o
disco de lá de encher com cache de build.

---

## 2. Versionar por identificador imutável

**Status: ✅ comprovado (mecanismo validado localmente).**

Tag por **SHA do commit**, nunca só `:latest`. É o que transforma rollback numa
troca de variável em vez de um rebuild sob pressão.

```yaml
image: ghcr.io/<dono>/<app>:${IMAGE_TAG:-latest}
```

E a tag em produção fica **gravada no `.env` da VPS**, para que:

- todo comando do deploy resolva a mesma imagem (`--env-file`);
- a versão no ar seja legível (`grep IMAGE_TAG .env`);
- reverter seja editar uma linha.

⚠️ **Armadilha comprovada:** se um passo do deploy resolve a tag e outro cai no
fallback `:latest`, passos do mesmo deploy operam sobre imagens diferentes — sem
erro, só resultado errado. Gravar a tag no `.env` antes do primeiro `docker
compose` elimina isso.

---

## 3. Todo container com teto: memória, CPU, PIDs e log

**Status: ✅ comprovado por medição.** Verifiquei que o daemon aplica os quatro:

```
NanoCpus: 250000000   PidsLimit: 64   Memory: 134217728
LogConfig: max-file:3 max-size:10m
```

### Por que os quatro

| Sem limite de | O que acontece |
|---|---|
| Memória | vazamento consome a RAM do host |
| **CPU** | laço infinito toma toda a CPU |
| **PIDs** | fork bomb derruba o host inteiro |
| **Log** | `json-file` cresce **sem limite** até encher o disco |

Memória sozinha não protege. **Evidência viva:** nesta mesma VPS há hoje um
container de outro projeto em restart loop marcando **110,33% de CPU** — com a
memória intacta.

E disco cheio derruba **todas** as aplicações, não só a culpada.

### O molde

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "1.0"
          pids: 256
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

### 🔴 Limite externo exige ajuste interno

Limitar memória **sem ajustar a configuração do processo** causa morte por falta
de memória exatamente sob carga — pior que não limitar.

| Runtime | Ajuste obrigatório |
|---|---|
| Node.js | `NODE_OPTIONS=--max-old-space-size=<60–75% do limite>` |
| PostgreSQL | `shared_buffers` ≈ 25% do limite, `effective_cache_size`, `max_connections` |
| JVM | `-XX:MaxRAMPercentage=75` |
| PHP-FPM | `pm.max_children` compatível com `memory_limit` |

Sem isso o processo só descobre o teto quando o kernel o mata.

### Como dimensionar

1. Medir o **pico**, não a ociosidade.
2. Teto com folga real sobre o pico.
3. Ajustar a configuração interna para caber.
4. Justificar cada número com a medição.

Enquanto não houver medição, use **teto de proteção folgado** e marque como
estimado. Proteção frouxa é melhor que proteção ausente — mas não vale chamá-la
de dimensionamento.

---

## 4. Uma porta no host, por aplicação

**Status: ✅ comprovado (em uso).**

```yaml
ports:
  - "127.0.0.1:${DEPLOY_PORT}:80"   # só loopback
```

Tudo o mais usa `expose` e a rede interna do compose. O nginx do **host** faz o
TLS e o proxy para a porta de loopback.

Vantagens: uma porta por app evita colisão; serviços internos não ficam expostos
à internet; o certificado é gerenciado num lugar só.

---

## 5. Nomear o projeto no compose

**Status: ✅ comprovado.**

```yaml
name: minhaapp
```

Sem isso, o Compose usa o nome do diretório — que muda a cada release — e cada
deploy tenta criar containers com nomes já em uso.

---

## 6. Migrations antes de subir a aplicação

**Status: ✅ comprovado (já causou incidente no Aprender IA).**

```
1. sobe só o banco
2. aplica migrations (container efêmero, --rm)
3. SE FALHAR: aborta com a versão ANTIGA no ar  ← estado seguro
4. só então sobe a aplicação
```

Na ordem inversa, o container novo serve código que consulta tabela ou coluna
que a migration ainda não criou.

⚠️ **Isso não dá rollback de graça.** Rollback de imagem não desfaz migration.
Se a migration foi destrutiva, o caminho é restaurar backup.

---

## 7. Retenção em tudo que cresce

**Status: ⚠️ parcialmente validado** — releases e log comprovados; retenção de
imagem no GHCR ainda não exercitada em produção.

| Item | Política | Onde |
|---|---|---|
| Releases no disco | manter 3 | script de deploy |
| Imagens no registry | manter 5 | passo final do CI |
| Logs de container | 10 MB × 3 | compose |
| Cache de build | no CI, não na VPS | `cache-to: type=gha` |
| Dados históricos | **decisão do dono** | nunca automático |

**Imagens: manter 5, não 3.** A imagem para a qual você pode querer reverter
precisa existir. Apagar de menos custa alguns MB; apagar de mais custa um
rebuild sob pressão.

E limpar **só depois** do deploy validado — apagar antes remove justamente o
destino do rollback.

---

## 8. Limpeza sempre com escopo

**Status: ✅ comprovado** (o `down -v` do teste removeu volumes de nome fixo).

### Seguro

```bash
docker image prune -f --filter "label=org.opencontainers.image.source=<repo>"
```

### 🔴 Proibido em host compartilhado

| Comando | Estrago |
|---|---|
| `docker system prune -a` | imagens de **todos** os projetos |
| `docker volume prune` | "dangling" pode ser o banco de um projeto parado |
| `docker builder prune -af` | cache útil de outros projetos |
| `docker compose down -v` | **apaga o banco** |

O `-v` é o mais perigoso porque parece limpeza de rotina. Volumes com `name:`
fixo têm o mesmo nome em teste e produção — comprovei isso ao derrubar o
ambiente de teste e ver `aprenderia_postgres_data` sendo removido.

---

## 9. Segredos que não podem ser regerados

**Status: ✅ comprovado (em uso).**

Gerador de `.env` idempotente precisa distinguir dois casos:

```bash
ensure_env  VAR valor   # só define se estiver vazio  → preserva
upsert_env  VAR valor   # sempre sobrescreve          → deriváveis
```

| Nunca sobrescrever | Porque |
|---|---|
| Senha do banco | quebra o acesso ao volume existente |
| Segredo de sessão | desloga todos |
| **Chave pública VAPID** | invalida **todas** as inscrições push já feitas |
| Credenciais SMTP | são preenchidas à mão na VPS |

O caso VAPID é o mais traiçoeiro: nada quebra visivelmente, as notificações
simplesmente param de chegar.

---

## 10. Healthcheck que verifica o que importa

**Status: ✅ comprovado.**

Deve tocar a dependência crítica — um container que responde HTTP mas perdeu o
banco está degradado e precisa ser detectado.

Mas o intervalo é custo recorrente: a 30 s são **2.880 verificações/dia** por
container. A 60 s a queda ainda é detectada em menos de 2 min (60 s × 3
retries), com metade do custo.

⚠️ `timeout` curto em máquina sob carga gera falso "unhealthy", e o retry consome
mais CPU — um ciclo que se realimenta. Prefira 5 s a 3 s.

---

## 11. Frequência alinhada ao efeito

**Status: ✅ comprovado por análise de código.**

Antes de definir o intervalo de um job, pergunte **com que frequência o
resultado muda**.

No Aprender IA o motor de engajamento rodava de hora em hora, mas deduplicava em
24 h/72 h/168 h: **23 das 24 execuções diárias faziam todo o trabalho e
descartavam o resultado.** Alinhar o intervalo à deduplicação cortou ~96% do
trabalho **sem que um único aviso deixasse de chegar**.

E **um agendador só**. Ter cron do host *e* container agendador é duplicação;
metade fica invisível para quem lê o projeto.

---

## 12. Cliente de banco compartilhado, nunca por requisição

**Status: ✅ comprovado (auditado no Aprender IA — está correto lá).**

```ts
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Instanciar cliente dentro de um handler é **a causa mais comum e mais grave de
esgotamento em produção**, e passa despercebido em leitura superficial. Some com
`connection_limit` explícito — o padrão do Prisma é `CPUs × 2 + 1`, e cada
conexão custa 5–10 MB no Postgres.

---

## 13. Contexto de build enxuto

**Status: ✅ comprovado.**

O `.dockerignore` **não herda** o `.gitignore`. Verifique os dois.

```
node_modules
.next
.git
.github
docs
*.md
!README.md
CREDENCIAIS-*.txt
<pastas de arte/fonte>
```

⚠️ Antes de excluir `*.md`, confirme que nenhum passo do build lê um. Verifiquei
no Aprender IA; era seguro.

⚠️ **Arquivo de credencial:** mesmo fora do git (e portanto fora do checkout do
CI), um `docker build` **local** gravaria o conteúdo numa camada. Espelhe a
regra do `.gitignore` no `.dockerignore`.

---

## 14. Estágios de build separados por necessidade real

**Status: ✅ comprovado** (o build da imagem otimizada passa: 699 MB).

Multi-stage não é estética — é o que mantém compilador e ferramenta de
desenvolvimento fora da imagem que fica residente.

⚠️ **Mas verifique antes de podar.** Duas armadilhas comprovadas no Aprender IA:

- **Ferramenta de CLI que o deploy usa de dentro do container.** Remover a CLI
  do Prisma rendia ~120 MB **e quebrava as migrations** — a aplicação servia
  páginas e o banco nunca migrava.
- **Transpilador exigido em runtime.** O seed era TypeScript e pedia `tsx` na
  imagem final. A solução certa não foi manter o `tsx`: foi **compilar o seed no
  build**, com o esbuild que o bundler já traz.

Pergunte sempre: *o runtime realmente invoca isto, ou só o build?*

---

## ✅ Checklist — aplicação nova

**Build e imagem**
- [ ] Build no CI, nunca na VPS
- [ ] Imagem no registry com tag de **SHA** (nunca só `latest`)
- [ ] Cache de build no CI (`type=gha`), não no disco da VPS
- [ ] Multi-stage; sem compilador nem devDependencies no runtime
- [ ] Imagem rotulada com `org.opencontainers.image.source`
- [ ] `.dockerignore` cobrindo docs, arte, credenciais e artefatos

**Compose**
- [ ] `name:` do projeto fixado
- [ ] **Todo** container com `memory`, `cpus`, `pids`
- [ ] **Todo** container com `max-size` e `max-file` de log
- [ ] Ajuste interno compatível com o limite externo
- [ ] Uma única porta publicada, em `127.0.0.1`
- [ ] Volumes com nome explícito e finalidade documentada
- [ ] Healthcheck tocando a dependência crítica, intervalo ≥ 60 s

**Deploy**
- [ ] VPS só faz `pull` + `up`
- [ ] Tag gravada no `.env` antes do primeiro `docker compose`
- [ ] Migrations **antes** de subir a aplicação, em container `--rm`
- [ ] Falha de migration aborta com a versão antiga no ar
- [ ] `--remove-orphans` no `up`
- [ ] Retenção: 3 releases, 5 imagens
- [ ] Limpeza só após validação, e sempre com filtro por rótulo
- [ ] Health check pós-deploy que falha o job de verdade

**Segredos**
- [ ] `.env` fora do diretório da release, permissão 600
- [ ] `ensure_env` para o que não pode ser regerado
- [ ] Nenhum segredo no repositório nem na imagem

**Operação**
- [ ] `DEPLOY.md` com rollback **testado**
- [ ] Rotina de backup — e restauração **testada**

---

## ✅ Checklist — revisão periódica

- [ ] `docker stats` — algum container perto do teto?
- [ ] `df -h` — disco crescendo?
- [ ] `docker ps -a` — container reiniciando em laço?
- [ ] Releases e imagens dentro da retenção?
- [ ] Algum container apontando para release **já apagada** do disco?
      *(está vivo só porque nunca reiniciou; se cair, não sobe mais)*
- [ ] Volumes órfãos de serviços removidos?
- [ ] Steal time — o provedor está entregando a CPU?

---

## ✅ Checklist — remover um serviço

Remoção pela metade deixa a aplicação **pior**: o custo da configuração morta,
sem nenhum benefício.

- [ ] Definição na orquestração
- [ ] Volumes e redes associados *(remover a chave e esquecer o resto invalida o arquivo)*
- [ ] Variáveis de ambiente
- [ ] **Geradores de configuração** — se algo reescreve o `.env` a cada deploy, a configuração morta **ressuscita sozinha**
- [ ] Dependências declaradas por outros serviços
- [ ] Passos de build e deploy
- [ ] **Rotas/proxies que apontam para ele**
- [ ] **Clientes que chamam essas rotas**
- [ ] **Telas que usam esses clientes**
- [ ] Validações de build que exigem seus artefatos
- [ ] Volumes e containers órfãos no host
- [ ] Ajustes de sistema feitos por causa dele

> **Se a funcionalidade continua existindo no produto, não é remoção — é
> migração**, e precisa de destino definido antes de desligar o antigo.

---

## 🔴 Não faça

| Não faça | Porque |
|---|---|
| Compilar na VPS | disputa CPU e I/O com os usuários; 3 deploys perdidos por isso |
| `docker system prune -a` | atinge todos os projetos do host |
| `docker volume prune` | dangling ≠ lixo; pode ser banco de projeto parado |
| `down -v` em produção | apaga o banco, sem desfazer |
| Juntar banco e app num container | ciclos de vida diferentes; ajuste de um interfere no outro |
| Limitar memória sem ajustar o processo | morte por falta de memória sob carga |
| Runner self-hosted na própria VPS | o CI volta a competir com a produção |
| Remover "código morto" sem provar | busque da **raiz**, e considere forma indireta |
| Tratar ocioso como obsoleto | tráfego zero + integrado ao código = **opcional**, dimensione |
| Confiar em `:latest` para rollback | tag móvel não identifica versão |
| Apagar imagens antigas antes de validar | remove o destino do rollback |
| Deduzir que um padrão existe sem ler o arquivo | *erro que cometi nesta auditoria* — ver abaixo |

### Sobre a última linha

Durante esta auditoria eu afirmei que outro projeto seu já usava GHCR, deduzindo
das imagens `ghcr.io/...` rodando na VPS. Ao **ler** o workflow, ele fazia
`docker build` por SSH dentro da VPS — o mesmo vício. E o projeto citado como
referência na documentação anterior **não existia** (404).

A lição vale como regra de engenharia: **a imagem que está rodando não conta como
prova de como ela foi produzida.**

---

## O que ainda não foi validado em produção

| Item | Como validar |
|---|---|
| Deploy completo pelo novo fluxo | primeiro push na `main` |
| Tempo real de `pull` na VPS | log do deploy |
| Rollback por troca de tag | exercitar em produção |
| Retenção de imagens no GHCR | após o 6º deploy |
| Limites sob carga real | `docker stats` com alunos usando |
| Backup e restauração | **nem existe ainda** |

Nenhum destes deve ser apresentado como comprovado antes de acontecer.
