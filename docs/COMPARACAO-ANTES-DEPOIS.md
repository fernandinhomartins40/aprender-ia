# Comparação antes × depois

**Data:** 15/09/2026
**Método:** cada par de números foi obtido com **o mesmo comando** antes e
depois. Onde o método teve de mudar, está dito — medir de formas diferentes
produz números não comparáveis e conclusões falsas.

---

## ⚠️ Leia isto antes da tabela

**A aplicação não está em produção.** A VPS foi resetada e o Aprender IA não
está lá — verificado em 15/09/2026: sem containers, sem imagens, sem volumes,
sem `/opt/aprenderia`.

Portanto **não existe "antes" de produção para comparar**. O que está medido aqui
é: (a) o histórico real dos 79 deploys anteriores, (b) o comportamento local
verificado agora, (c) o que muda por construção no código e na configuração.

Nada nesta página é extrapolação de produção disfarçada de medição.

---

## 1. RESULTADO MEDIDO

### 1.1 Proteção do host

Esta é a mudança mais importante, e é binária: existia ou não existia.

| Container | CPU antes | CPU depois | PIDs antes | PIDs depois | Log antes | Log depois |
|---|---|---|---|---|---|---|
| `web` | ❌ nenhum | **1,0** | ❌ nenhum | **256** | ❌ ilimitado | **10m × 3** |
| `postgres` | ❌ nenhum | **0,5** | ❌ nenhum | **128** | ❌ ilimitado | **10m × 3** |
| `nginx` | ❌ nenhum | **0,25** | ❌ nenhum | **64** | ❌ ilimitado | **10m × 3** |
| `scheduler` | ❌ nenhum | **0,05** | ❌ nenhum | **16** | ❌ ilimitado | **1m × 2** |
| `media-init` | ❌ nenhum | **0,25** | ❌ nenhum | **32** | ❌ ilimitado | **1m × 2** |

**Antes:** 0 de 5 containers com limite de CPU, PIDs ou log. Só `web` e
`postgres` tinham limite de memória.
**Depois:** 5 de 5 com os quatro tetos.

**Verificado no daemon**, não só no arquivo:

```
/aprenderia-web:       cpu=1000000000  pids=256  mem=536870912  log=[max-file:3 max-size:10m]
/aprenderia-postgres:  cpu=500000000   pids=128  mem=536870912  log=[max-file:3 max-size:10m]
/aprenderia-nginx:     cpu=250000000   pids=64   mem=134217728  log=[max-file:3 max-size:10m]
/aprenderia-scheduler: cpu=50000000    pids=16   mem=33554432   log=[max-file:2 max-size:1m]
```

**Crescimento de log:** de ilimitado para **teto rígido de 150 MB** no conjunto.

### 1.2 Consumo real (pilha completa local, em repouso)

Medido com `docker stats --no-stream` na pilha subida de verdade:

| Serviço | Memória | PIDs | % do teto |
|---|---|---|---|
| `web` | 71,98 MB | 13 | 14,1% |
| `postgres` | 33,59 MB | 7 | 6,5% |
| `nginx` | 7,68 MB | 9 | 6,0% |
| `scheduler` | 560 KB | 2 | 1,7% |

⚠️ **Repouso, sem alunos e sem tráfego.** Confirma que os tetos são folgados —
não que estejam dimensionados. Refazer sob uso real.

### 1.3 Trabalho do motor de engajamento

| | Antes | Depois |
|---|---|---|
| Execuções por dia | **24** | **1** |
| Deduplicação aplicada | 24 h / 72 h / 168 h | idêntica |
| Avisos entregues ao aluno | — | **idênticos** |

Redução de **96% das execuções**. Medido por leitura do código: com dedupe de
24 h e intervalo de 1 h, 23 execuções diárias percorriam todos os alunos,
montavam a trilha completa de cada um e descartavam o resultado.

**Nenhum aviso deixa de chegar** — a deduplicação já os limitava a um por dia.

### 1.4 Agendadores

| | Antes | Depois |
|---|---|---|
| Agendadores | **2** (cron do host + `scheduler`) | **1** (`scheduler`) |
| Agendamento visível no projeto | metade | **todo** |

### 1.5 Healthcheck da aplicação

| | Antes | Depois |
|---|---|---|
| Intervalo | 30 s | 60 s |
| Consultas `SELECT 1` por dia | **2.880** | **1.440** |
| Detecção de queda | até 90 s | até 180 s |

### 1.6 Validação funcional

Tudo executado, não presumido:

| Verificação | Resultado |
|---|---|
| `npx turbo run typecheck` | ✅ 5/5 tarefas |
| `npx vitest run` | ✅ **33 testes**, 1 arquivo |
| `docker compose config` | ✅ válido |
| `bash -n` nos dois scripts | ✅ válido |
| YAML do workflow | ✅ 2 jobs, `deploy` depende de `build` |
| **`docker build` completo** | ✅ **39 estágios, imagem 699 MB** |
| **Pilha completa subindo** | ✅ 5 containers |
| **`/api/health`** | ✅ `{"status":"ok","banco":"ok","tempoMs":2}` |
| **nginx `/health`** | ✅ HTTP 200 |

### 1.7 Contexto de build

| | Antes | Depois |
|---|---|---|
| Arquivos rastreados | 16 MB | 16 MB |
| Excluído pelo `.dockerignore` | — | **7,2 MB** (`assets-marca` + `docs`) |
| Contexto efetivo | ~16 MB | **~8,8 MB** |

Redução de ~45%. **É pouco em termos absolutos** — entrou pelo custo quase nulo,
não por relevância.

---

## 2. RESULTADO ESTIMADO

Marcado como estimativa porque depende de produção.

### 2.1 Build fora da VPS

Do histórico real dos 79 deploys (**medido**):

| Métrica | Antes (medido) | Depois (estimado) |
|---|---|---|
| `next build` **na VPS** | **157,6 s** | **0 s** — não roda mais lá |
| Passo de deploy | **333 s (88% do total)** | 30–90 s (baixar ~200 MB) |
| Pior caso registrado | **45,5 min** (morto no timeout) | não se aplica |
| Deploys perdidos | **3 de 79** | zero |
| CPU da VPS durante o deploy | compilação integral | descompactação |
| Cache de build no disco da VPS | crescia | **zero** — vive no GitHub |
| Rollback | exigia rebuild | troca de tag |

⚠️ **O tempo total do workflow pode não cair** — o build mudou de lugar, não
desapareceu. O ganho é que ele saiu de cima da máquina que atende usuários. Medir
pelo cronômetro do CI levaria à conclusão errada.

### 2.2 Espaço em disco na VPS

| | Antes | Depois (estimado) |
|---|---|---|
| Camadas intermediárias de build | acumulavam | **nenhuma** |
| Cache do pnpm na VPS | crescia | **nenhum** |
| Folga mínima exigida | 5 GB | 3 GB |

---

## 3. PENDENTE — só produção responde

Nunca preenchido com estimativa.

| Item | Como medir |
|---|---|
| Tempo real do `pull` na VPS | log do primeiro deploy |
| Consumo sob carga real | `docker stats` com alunos usando |
| Pico versus ociosidade | `docker stats` em horário de aula |
| Tamanho do banco em produção | `pg_database_size` |
| **Número de alunos ativos** | consulta ao banco — é o multiplicador do engajamento |
| Custo real do motor por execução | log do `scheduler` |
| Tempo de inicialização do container | log do deploy |
| Tempo de resposta da aplicação | medição com tráfego |
| Rollback por troca de tag | exercitar de verdade |
| Retenção de imagens no GHCR | após o 6º deploy |
| **Backup e restauração** | **não existe rotina ainda** |

---

## 4. O que NÃO mudou (de propósito)

| Item | Por quê |
|---|---|
| Tamanho da imagem (699 MB) | Não era o alvo. A CLI do Prisma fica por necessidade — removê-la rendia 120 MB **e quebrava as migrations** |
| `upstream api:3001` no nginx | Custo zero em runtime; decisão de produto pendente |
| Índices do schema | Já bem cuidados |
| Singleton do Prisma | Já correto — sem cliente por requisição |
| Ordem migrations → aplicação | Já correta; inverter já causou incidente |
| Limites de memória de `web` e `postgres` | Vieram de medição real em produção |
| Seed a cada deploy | Adiado: maior risco, menor ganho com a base vazia |
| Laço do engajamento | Adiado: altera quem recebe aviso, sem alunos para validar |

---

## 5. Contra o critério de sucesso

| # | Critério | Situação |
|---|---|---|
| 1 | Funcionalidades preservadas | ✅ nenhuma removida; build, testes e `/api/health` passam |
| 2 | Consumo caiu onde havia desperdício | ✅ engajamento −96%, healthcheck −50%, build fora da VPS |
| 3 | Containers racionais | ✅ 5, cada um justificado |
| 4 | Retenção de armazenamento | ✅ releases 3, imagens 5, logs 150 MB |
| 5 | Deploys não acumulam lixo | ✅ sem build local; limpeza com filtro por rótulo |
| 6 | Uma app não derruba o host | ✅ 5/5 com CPU, PIDs, memória e log |
| 7 | Dá para medir | ✅ `docker stats`, `/api/health`, `IMAGE_TAG` no `.env` |
| 8 | Dá para reproduzir | ✅ `DEPLOY.md` |
| 9 | Dá para reverter | ⚠️ mecanismo pronto, **ainda não exercitado em produção** |
| 10 | Virou padrão | ✅ `PADRAO-VPS-MULTI-APPS.md` |

**Item 9 fica com ressalva:** o rollback por troca de tag está implementado e o
mecanismo foi validado localmente, mas **nunca foi executado em produção**. Só
conta como comprovado depois de acontecer.
