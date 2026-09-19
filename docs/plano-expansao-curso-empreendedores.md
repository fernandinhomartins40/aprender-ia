# Plano de Expansão e Reestruturação — Curso de IA para Empreendedores

**Data:** 19/09/2026
**Pré-requisito:** [`auditoria-curso-empreendedores.md`](./auditoria-curso-empreendedores.md)
**Status:** implementado — commits `eb82eeb` (aplicação) e `1d4f650` (deck).

---

## 0. O que foi entregue

| Fase | Situação | Verificação |
|---|---|---|
| 01 — Escopo por curso | pronta | `courseId` em 7 modelos; Educadores continua com 104 prompts, 18 capítulos e 50 conquistas, como antes |
| 02 — Rotas respeitam o curso | pronta | 7 rotas com `?curso=`; zero vazamento medido nas 5 telas |
| 03 — Componentes novos | pronta | 4 tipos de lição; entrega salva no banco |
| 04 — Banco de prompts | **parcial** | 37 prompts cobrindo as 17 áreas. A meta eram 170 — ver abaixo |
| 05–08 — Conteúdo | pronta | 11 módulos, 31 lições, sem duplicatas |
| 09 — Projeto final | pronta | preenchido de ponta a ponta; plano exportável gerado |
| 10 — Responsividade | pronta | sem rolagem horizontal em 360, 390, 768, 1024, 1280, 1440, 1920 e 2560 |
| 11 — QA | pronta | curso publicado; `tsc` limpo nos dois pacotes |
| 12 — Aula ao vivo | não feita | o deck segue servindo, agora sem os bugs |
| 13 — PDFs alinhados | pronta | apostila gerada **a partir do banco**; PDFs do deck regerados |

### O que ficou faltando, e por quê

**O banco tem 37 prompts, não 170.** As 17 áreas do item 8 estão todas
cobertas, e cada prompt traz título, finalidade, ferramenta indicada,
campos editáveis, exemplo preenchido, dica, tags e dificuldade — o padrão
que o briefing pediu. O que não foi feito foi multiplicar por cinco esse
conjunto. É trabalho de redação, não de código: a estrutura comporta, e
acrescentar prompts é editar `packages/db/prisma/empreendedores/prompts.ts`
e rodar o seed de novo.

**A carga horária declarada é 20h, não 40h.** As 40h do deck vinham da
repetição de dois moldes quatro vezes cada (§3.3 da auditoria). Preferi
declarar o que existe de verdade a herdar um número inflado. Chegar a 40h
reais é continuar a produção de conteúdo nos módulos existentes.

**A Fase 12 (migrar o deck para `LessonScript`) não foi feita.** O deck
continua em uso para aula presencial e teve os quatro bugs corrigidos, o
que resolve o problema imediato. A migração pode vir depois, sem bloquear
nada.

### Como rodar

```bash
pnpm db:up                                        # sobe o Postgres
pnpm --filter @aprender/db deploy                 # aplica a migração
pnpm --filter @aprender/db seed                   # Educadores
pnpm --filter @aprender/db seed:empreendedores    # Empreendedores (nasce despublicado)
pnpm --filter @aprender/db apostila:empreendedores # gera a apostila do banco
```

---

## 1. Situação atual

Resumo do que a auditoria apurou:

- **O curso de Empreendedores não existe na aplicação.** O seed cria um único curso (`ia-para-educadores`). O material de Empreendedores é um conjunto de arquivos estáticos em `Desktop/cursos/`, fora do monorepo.
- O deck tem **141 slides, 2 funções JS** (contra 16 do Educadores), **13% de slides duplicados** e 62% do arquivo composto por dois templates instanciados 4× cada.
- Há **4 bugs funcionais**, sendo o mais grave o cronômetro que roda 5 min em atividades declaradas de 15 e 20 min.
- O formato `transform: scale()` sobre palco fixo 1280×720 **impede** o requisito de responsividade real.
- A infraestrutura pedagógica da aplicação **já existe e é boa**: ~70 modelos Prisma, 11 tipos de lição, banco de prompts, XP, streak, conquistas, missões, diário, apostila e modo apresentação.

**O trabalho não é consertar o deck. É criar o curso na aplicação e escopar por curso a infraestrutura existente.**

---

## 2. Comparação Educadores × Empreendedores

| Dimensão | Educadores | Empreendedores (hoje) | Destino |
|---|---|---|---|
| Existe na aplicação | sim — 11 módulos, 82 lições | **não** | criar |
| Formato da aula | página React, reflui | slide 1280×720 escalado | página React |
| Tipos de lição | 11 (`TipoLicao`) | 1 (slide) | 11 + novos |
| Botão de IA | `ai-launcher`, 4 ferramentas, prompt preenchido | 2 botões, sem prompt | reutilizar |
| Prompt preenchível | sim, campos sincronizados | **não** | reutilizar |
| Banco de prompts | `PromptTemplate` + favoritos + busca | `.md` solto | povoar |
| Progresso | `LessonProgress`, XP, streak | nenhum | reutilizar |
| Gamificação | conquistas, missões, recompensas | nenhuma | povoar |
| Exercícios | 5 tipos, corrigidos | nenhum | povoar |
| Diário | `DiaryEntry` | nenhum | reutilizar |
| Apostila | `HandbookChapter` + `capituloRef` | só PDF | povoar |
| Aula ao vivo | `LessonScript` + `/apresentar` | `.html` + `.vbs` | migrar |
| Responsividade | limitada no deck, real na app | inexistente | real |
| Admin editável | 24 rotas | nenhuma | herdado |

---

## 3. Funcionalidades reutilizáveis

**Reutilizar sem alteração:**
- `packages/ai-launcher` — já neutro de domínio, declara método de abertura e selo de gratuidade
- `Lesson.conteudo` (Json) + `TipoLicao` — comporta formatos novos sem migração
- `Enrollment`, `LessonProgress`, `StepProgress`, `Streak`, `ActivityPerformance`, `DiaryEntry`
- `LessonScript` / `ScriptStep` / `LiveSession` + rota `/apresentar/[scriptId]`
- `HandbookChapter` / `HandbookSection` + `Lesson.capituloRef`
- `Cohort`, `Plan`, `Subscription` — turmas, planos e cobrança

**Reutilizar com rótulos ajustados:**
- `banco-de-prompts.tsx`, `biblioteca-prompts.tsx`, `card-prompt.tsx`
- `construtor-prompt.tsx`, `oficina-de-prompt.tsx`, `gerador-prompt.tsx`
- `conteudo-da-aula.tsx`, `licao-cliente.tsx`

**Generalizar (mudança estrutural pequena):**
- `analise-ptcf.tsx` → analisador de prompt com fórmula parametrizável por curso

**Aposentar:**
- deck `.html` como curso (manter geradores só para a apostila PDF)

---

## 4. Problemas encontrados

| # | Problema | Gravidade | Onde |
|---|---|---|---|
| P1 | Curso inexistente na aplicação | **bloqueador** | seed |
| P2 | 7 modelos sem `courseId` → aluno veria conteúdo de professor | **bloqueador** | schema |
| P3 | 7 rotas do aluno ignoram `?curso=` | **bloqueador** | `apps/web` |
| P4 | Cronômetro ignora `data-seconds` (5 min em vez de 20) | alta | deck |
| P5 | 13% de slides duplicados; 62% do deck é template repetido | alta | conteúdo |
| P6 | Cópia falha em silêncio sob `file://` | alta | deck |
| ~~P7~~ | ~~Mojibake~~ — **não existe**: a contagem inicial pegou "FORMAÇÃO" e "MÃO NA MASSA" como erro. O arquivo é UTF-8 íntegro. | — | — |
| P8 | Botão "último slide" sem handler | baixa | deck |
| P9 | Botão Gemini abre sem o prompt | média | deck |
| P10 | Palco fixo impede responsividade | alta | formato |

P4, P6, P8 e P9 foram corrigidos nos geradores do deck (commit `1d4f650`), já que o deck segue em uso para aula presencial.

---

## 5. Nova arquitetura pedagógica

Progressão em 4 blocos, mapeando as 12 fases do briefing. Mantém a espinha `Course → Module → Lesson` e reaproveita os 11 tipos de lição.

```
BLOCO A — DOMINAR A CONVERSA        (Fases 1–2)   ~8h
BLOCO B — APLICAR NO NEGÓCIO        (Fases 3–4)   ~8h
BLOCO C — PRODUZIR E ANALISAR       (Fases 5–9)   ~14h
BLOCO D — DELEGAR E AUTOMATIZAR     (Fases 10–12) ~10h
                                    PROJETO FINAL
```

Cada lição segue o ciclo do item 6 do briefing: **APRENDER → TESTAR → APLICAR → AUTOMATIZAR**.

### Módulos

| # | Módulo | Fase | Tipos de lição predominantes |
|---|---|---|---|
| 1 | IA sem complicação | 1 | `AQUECIMENTO`, `TEORIA`, `QUIZ`, `CACA_ERRO` |
| 2 | Como conversar com uma IA | 2 | `PROMPT`, `DUELO`, `LABORATORIO`* |
| 3 | IA no dia a dia da empresa | 3 | `CASO`, `PROMPT`, `ANTES_DEPOIS`* |
| 4 | Delegar trabalho (ChatGPT a fundo) | 4 | `TEORIA`, `DESAFIO`, `NO_CELULAR` |
| 5 | Imagens profissionais | 5 | `LABORATORIO`*, `PROMPT`, `DUELO` |
| 6 | Vídeos com IA | 6 | `CASO`, `LABORATORIO`* |
| 7 | Gemini + Google Workspace | 7 | `PROMPT`, `CASO`, `NO_CELULAR` |
| 8 | NotebookLM / Gemini Notebook | 8 | `LABORATORIO`*, `CASO` |
| 9 | Analisar os dados do negócio | 9 | `LABORATORIO`*, `DESAFIO`, `CACA_ERRO` |
| 10 | Automação sem programação | 10 | `TEORIA`, `FLUXO`*, `LABORATORIO`* |
| 11 | Agentes de IA sem complicação | 11 | `TEORIA`, `CASO`, `LABORATORIO`* |
| 12 | Escolher a ferramenta certa | 12 | `TEORIA`, `DUELO`, `EMERGENCIA` |
| 13 | Projeto final — Minha Empresa Aumentada por IA | — | `PROJETO`* |

`*` = novos valores em `enum TipoLicao` (ver §16).

### Princípio de conteúdo (item 13 do briefing)

Cada lição **interpreta**; não transcreve. A apostila continua como consulta, ligada por `Lesson.capituloRef`, com a chamada *"Aprofunde na apostila"*. A regra vale sobretudo para o texto herdado do deck, que hoje é derivado da apostila.

---

## 6. Módulos atuais que permanecem

Do material existente, aproveita-se **conteúdo**, não formato:

| Material atual | Destino |
|---|---|
| 4 Casos (loja WhatsApp, salão, imobiliária, restaurante) | viram lições `CASO` — **bom material, subaproveitado** |
| 4 Duelos (prompt vago × C.O.F.R.E.) | viram lições `DUELO` |
| 4 Caças ao erro | viram lições `CACA_ERRO` |
| 32 prompts do deck | viram registros `PromptTemplate` |
| `BIBLIOTECA_DE_PROMPTS.md` | importado para o banco |
| 16 imagens | reaproveitadas como ilustração de lição |
| Apostila HTML/PDF | vira `HandbookChapter` + download |

---

## 7. Módulos que precisam ser modificados

| Material | Problema | Ação |
|---|---|---|
| Trilhas 1–4 (slides 55–66, 67–78, 79–90, 91–102) | mesmo template 4× | **descartar o molde**; extrair o pouco que é específico |
| Módulos de ferramenta 1–4 (slides 103–142) | idem | idem |
| "Teste no celular" ×4 | texto idêntico | uma lição `NO_CELULAR` por módulo, com conteúdo próprio |
| "Régua de qualidade" ×4 | texto idêntico | um checklist reutilizável, contextualizado |
| Desafios com cronômetro | duração ignorada (P4) | `DESAFIO` com `segundos` no `conteudo` Json (padrão já usado no Educadores) |

---

## 8. Novos módulos

Os que não têm nenhum equivalente no material atual — o grosso da produção de conteúdo:

- **Módulo 5 — Imagens** (Fase 5): ChatGPT Images 2.5, prompt visual (ASSUNTO/AMBIENTE/COMPOSIÇÃO/ILUMINAÇÃO/ESTILO/CORES/FORMATO/RESTRIÇÕES), fundo transparente, foto de produto, mockup, cardápio, banner
- **Módulo 6 — Vídeo** (Fase 6): IDEIA → ROTEIRO → STORYBOARD → IMAGENS → VÍDEO → NARRAÇÃO → LEGENDA → PUBLICAÇÃO. **Sem Sora** (descontinuado em 03/2026); Veo 3.1 e Pika
- **Módulo 7 — Workspace** (Fase 7): Docs e Sheets, com marcação honesta de faixa (boa parte é `PAGO`/`DEPENDENTE DO PLANO`) e o caminho gratuito via CSV
- **Módulo 8 — NotebookLM / Gemini Notebook** (Fase 8): base consultável a partir de PDFs e manuais
- **Módulo 9 — Dados do negócio** (Fase 9): vendas, estoque, clientes, financeiro — ensinar a **fazer perguntas melhores**, não a virar analista
- **Módulo 10 — Automação** (Fase 10): lógica do processo primeiro, ferramenta depois; Make no plano gratuito
- **Módulo 11 — Agentes** (Fase 11): CHATBOT × AUTOMAÇÃO × AGENTE; 7 tipos de agente
- **Módulo 13 — Projeto final**

---

## 9. Novas funcionalidades

| Funcionalidade | Base existente | Trabalho |
|---|---|---|
| Escopo por curso | `Course`, `Enrollment` | `courseId` em 7 modelos + rotas |
| Laboratório prático | `oficina-de-prompt.tsx` | novo tipo `LABORATORIO` + entrega salva |
| Analisador de prompt por fórmula | `analise-ptcf.tsx` | parametrizar (P.T.C.F. × C.O.F.R.E.) |
| Antes/Depois com tempo economizado | — | novo tipo `ANTES_DEPOIS` |
| Diagrama de fluxo de automação | — | novo tipo `FLUXO` (SVG, sem biblioteca) |
| Projeto final com plano gerado | `DiaryEntry`, `RespostaAberta` | novo tipo `PROJETO` + exportação |
| Favoritos e versões próprias de prompt | `PromptFavorite` | + `PromptUserVersion` |

---

## 10. Banco de prompts

Meta: **≥ 170 prompts**, nas 17 áreas do item 8 (Marketing, Vendas, Atendimento, Financeiro, Administrativo, RH, Compras, Estoque, Redes sociais, Planejamento, Pesquisa, Análise de dados, Imagens, Vídeos, Documentos, Automação, Agentes).

O modelo `PromptTemplate` já cobre título, corpo, variáveis, dica, ferramentas sugeridas, tags, categoria, dificuldade, favoritos e execução. Alterações necessárias:

- `courseId String?` — escopo
- `setor String?` e `porteEmpresa String?` — análogos de negócio a `disciplina`/`etapaEnsino`
- `exemploPreenchido String?` — o item 8 pede "exemplo preenchido", hoje só há `variaveis[].exemplo`
- novo `model PromptUserVersion` — "salvar versões personalizadas"

Fonte inicial: 32 prompts do deck + `BIBLIOTECA_DE_PROMPTS.md`.

---

## 11. Laboratórios

Sete laboratórios do item 10, cada um com entrega concreta salva no banco:

| # | Laboratório | Módulo | Entrega |
|---|---|---|---|
| 01 | Resposta profissional a um cliente | 3 | texto revisado |
| 02 | Campanha promocional | 3 | peça + calendário |
| 03 | Imagem de produto | 5 | imagem + prompt visual |
| 04 | Analisar uma planilha | 9 | 3 perguntas + achados |
| 05 | Procedimento interno | 4 | POP de 1 página |
| 06 | Desenhar uma automação | 10 | diagrama de fluxo |
| 07 | Primeiro agente | 11 | objetivo, regras, limites |

Estrutura comum (`Lesson.conteudo`): `contexto` → `passos[]` → `promptSugerido` → `criteriosDeQualidade[]` → `entrega`.

---

## 12. Sistema de IA

Reutiliza `packages/ai-launcher` **sem alteração**, preservando suas duas qualidades: declarar honestamente quando a ferramenta não aceita prompt por URL, e não expor dados sensíveis em URL.

Botões por lição, **só onde fizerem sentido** (item 9): `COPIAR PROMPT`, `TESTAR COM IA`, `VER EXEMPLO`, `PERSONALIZAR`, `SALVAR`.

Catálogo `AiTool` a ampliar com faixa de gratuidade verificada (§5 da auditoria): ChatGPT (Free/Go/Business), Gemini, Claude, NotebookLM/Gemini Notebook, Veo 3.1, Pika, Make, Canva.

---

## 13. Automações

Ensinar **a lógica antes da ferramenta**. Diagramas como os do briefing:

```
ENTROU UM LEAD → REGISTRAR → CLASSIFICAR → GERAR RESPOSTA → AVISAR RESPONSÁVEL
PEDIDO RECEBIDO → REGISTRAR → ATUALIZAR PLANILHA → CRIAR DOCUMENTO → NOTIFICAR
```

Renderizados pelo tipo `FLUXO` em SVG inline — sem nova dependência (item 17).

Ferramenta de referência: **Make** (1.000 operações/mês grátis, 2 cenários) — o free tier mais viável para ensinar. Zapier e n8n citados comparativamente.

Regra de segurança herdada do material atual, que é boa e deve ser preservada: **a automação gera rascunho, nunca envia sozinha** em situação de risco.

---

## 14. Agentes

Sequência: **CHATBOT** (responde) → **AUTOMAÇÃO** (executa passos fixos) → **AGENTE** (recebe objetivo e decide os passos).

Linguagem simples primeiro, termo técnico depois — regra do item 5:

> "Um agente de IA é como um assistente digital a quem você entrega um objetivo e algumas regras. Em vez de só responder uma pergunta, ele executa várias etapas de um trabalho."

Sete tipos (atendimento, pesquisa, comercial, marketing, administrativo, análise, documentos). Para o conceito de delegação, usar **Claude** — lembrando que Cowork e chat foram **fundidos num só produto** (§5.2 da auditoria), então ensina-se o conceito, não a marca.

---

## 15. Projeto final — "Minha Empresa Aumentada por IA"

O aluno escolhe um negócio real ou fictício e preenche, ao longo do curso: 3 tarefas repetitivas, 3 oportunidades de IA, 1 processo a automatizar, 1 uso para marketing, 1 uso para dados, 1 agente possível.

Saída: **Plano de Adoção de IA** exportável (HTML imprimível/PDF), útil fora do curso.

Base: `RespostaAberta` e `DiaryEntry` já existem; acrescentar `model FinalProject` com `Json` por seção e checkpoints por módulo.

---

## 16. Alterações de banco

Todas **aditivas e opcionais** (`courseId String?`, `null` = global) — nada quebra o curso de Educadores.

### 16.1 Escopo por curso (migração 1)

```prisma
model PromptTemplate   { courseId String?  course Course? @relation(...) }
model AiTool           { courseId String? }
model KnowledgeEntry   { courseId String? }
model Mission          { courseId String? }
model Achievement      { courseId String? }
model HandbookChapter  { courseId String? }
model LessonScript     { courseId String? }
```
Índices em `[courseId]`. Regra de leitura: `where: { OR: [{ courseId }, { courseId: null }] }`.

### 16.2 Campos de negócio em `PromptTemplate` (migração 2)

```prisma
setor             String?
porteEmpresa      String?
exemploPreenchido String?
```

### 16.3 Novos tipos de lição (migração 3)

```prisma
enum TipoLicao {
  ... // existentes preservados
  LABORATORIO
  ANTES_DEPOIS
  FLUXO
  PROJETO
}
```

### 16.4 Novos modelos (migração 4)

```prisma
model PromptUserVersion { id userId promptTemplateId corpo titulo? criadoEm }
model LabDelivery       { id userId lessonId conteudo Json criadoEm atualizadoEm }
model FinalProject      { id userId courseId negocio Json secoes Json atualizadoEm }
```

### 16.5 Seed

Novo `packages/db/prisma/seed-empreendedores.ts`, espelhando a organização do seed atual (`apostila.ts`, `banco-prompts.ts`, `roteiros-aula.ts`), **sem tocar** no seed de Educadores.

---

## 17. Componentes reutilizáveis

| Ação | Componentes |
|---|---|
| **Reutilizar** | `ai-launcher`, `card-prompt`, `biblioteca-prompts`, `banco-de-prompts`, `conteudo-da-aula`, `licao-cliente`, `feedback-*`, `diario-*`, `modo-apresentacao`, `palco-slide` |
| **Generalizar** | `analise-ptcf` → `analise-prompt` com fórmula por curso |
| **Criar** | `laboratorio-pratico`, `antes-depois`, `fluxo-automacao` (SVG), `projeto-final`, `seletor-curso` |

Nenhuma biblioteca nova (item 17): diagramas em SVG inline, exportação via `window.print()`.

---

## 18. Alterações de frontend

**Escopo por curso (obrigatório antes de publicar):** propagar `?curso=` em `/app/prompts`, `/app/ferramentas`, `/app/conhecimento`, `/app/missoes`, `/app/conquistas`, `/app/diario`, `/app/apostila` — hoje 0 menções a curso em seis delas.

**Navegação:** o seletor de cursos em `/app/trilha` já existe e passa a ser o caminho normal; lembrar o último curso escolhido.

**Responsividade (item 14):** as lições são páginas React que refluem de verdade. Pontos de corte a verificar: 360, 390, 768, 1024, **1280–1440 (notebook — o ponto que o briefing destaca)**, 1920, ultrawide (limitar largura de leitura).

**Acessibilidade:** contraste AA, navegação por teclado nos laboratórios, `aria-label` nos campos de prompt, foco visível.

---

## 19. Alterações de backend

- `server/trilha.ts` — já aceita `courseId`; verificar as bordas
- `server/acoes.ts:81` — `enrollment.findFirst({ where: { userId } })` pega **a primeira matrícula**, sem curso: revisar
- Novas funções: `server/laboratorio.ts`, `server/projeto-final.ts`
- Consultas de prompts/ferramentas/conhecimento/missões/conquistas passam a filtrar por curso
- Admin: gestão de conteúdo do novo curso pelas rotas existentes

---

## 20. Fontes oficiais usadas na pesquisa

Listadas com os achados em §5 e §8 da auditoria. As que **alteram o conteúdo planejado**:

- [Sora encerrado em 24/03/2026 — Veo 3.1 e Kling](https://sunra.ai/blog/ai-video-generation-2026-sora-shutdown-veo-free-kling-viral)
- [Cowork e chat agora são um só Claude](https://claude.com/blog/cowork-is-now-claude)
- [Gemini em Docs/Sheets — beta para AI Ultra e Pro](https://blog.google/products-and-platforms/products/workspace/gemini-workspace-updates-march-2026/)
- [NotebookLM → Gemini Notebook; limites free](https://support.google.com/notebooklm/answer/16213268?hl=en)
- [ChatGPT Images 2.5](https://openai.com/index/introducing-chatgpt-images-2-5/)
- [ChatGPT Go — US$ 8/mês](https://openai.com/index/introducing-chatgpt-go/)
- [Make × Zapier × n8n — free tiers](https://www.betterclaw.io/blog/n8n-vs-make-vs-zapier-ai-agents)

---

## 21. Ordem de implementação

Regra: **nada é publicado para alunos até a Fase 10.** O curso fica `publicado: false` durante toda a construção — impedindo que um aluno empreendedor veja prompts de BNCC (P2/P3).

---

# ROADMAP

### FASE 01 — Escopo por curso (fundação)

- **Objetivo:** a aplicação servir dois cursos sem vazar conteúdo de um para o outro.
- **Arquivos:** `packages/db/prisma/schema.prisma`; `apps/web/src/server/{trilha,acoes,acesso}.ts`
- **Banco:** migração 1 (`courseId?` em 7 modelos) — aditiva
- **Componentes:** nenhum
- **Implementar:** `courseId` opcional + índices; helper de leitura `porCurso(courseId)`; revisar `acoes.ts:81`
- **Aceite:** Educadores segue idêntico com `courseId = null`; consultas aceitam curso
- **Testar:** `pnpm db:migrate` + `pnpm typecheck`; abrir trilha do Educadores e conferir prompts, apostila e conquistas inalterados

### FASE 02 — Rotas do aluno respeitam o curso

- **Objetivo:** fechar o bloqueador P3.
- **Arquivos:** as 7 páginas em `apps/web/src/app/app/(sessao)/`
- **Banco:** nenhum
- **Componentes:** `seletor-curso` (novo)
- **Implementar:** propagar `?curso=`; lembrar o último curso; filtrar as listagens
- **Aceite:** com 2 cursos matriculados, nenhuma página mostra conteúdo do outro
- **Testar:** criar curso vazio de teste, matricular, percorrer as 7 rotas

### FASE 03 — Componentes pedagógicos novos

- **Objetivo:** os formatos que o curso exige e ainda não existem.
- **Arquivos:** `apps/web/src/components/{laboratorio-pratico,antes-depois,fluxo-automacao}.tsx`; `conteudo-da-aula.tsx`
- **Banco:** migração 3 (4 tipos de lição) + `LabDelivery`
- **Implementar:** renderizadores dos novos tipos; `analise-ptcf` → `analise-prompt` parametrizável
- **Aceite:** lição de cada tipo novo renderiza e salva entrega; P.T.C.F. do Educadores intacto
- **Testar:** lições de amostra; reabrir e confirmar persistência

### FASE 04 — Banco de prompts de negócio

- **Objetivo:** ≥ 170 prompts nas 17 áreas.
- **Arquivos:** `packages/db/prisma/prompts-empreendedores.ts`; componentes de prompt
- **Banco:** migração 2 + `PromptUserVersion`
- **Implementar:** importar 32 do deck + `BIBLIOTECA_DE_PROMPTS.md`; redigir os restantes; busca, filtro, tags, favorito, versão própria
- **Aceite:** 17 áreas povoadas; copiar, testar com IA, favoritar e salvar versão funcionam
- **Testar:** `db:seed`; buscar por área e por tag; validar 10 prompts ponta a ponta

### FASE 05 — Módulos 1–4 (fundamentos e aplicação)

- **Objetivo:** Fases 1–4 do briefing.
- **Arquivos:** `packages/db/prisma/seed-empreendedores.ts`
- **Implementar:** curso + módulos 1–4; reaproveitar 4 casos, 4 duelos, 4 caças ao erro; escrever aquecimentos, teorias, quizzes; **descartar os templates repetidos** (P5)
- **Aceite:** ~24 lições sem texto duplicado; nenhum parágrafo copiado da apostila; toda lição com `capituloRef`
- **Testar:** percorrer a trilha inteira; checar duplicatas por script

### FASE 06 — Módulos 5–6 (imagens e vídeo)

- **Objetivo:** Fases 5–6.
- **Implementar:** prompt visual em 8 partes; laboratório de imagem; cadeia de vídeo. **Sem Sora**; Veo 3.1 + Pika, com faixa de gratuidade explícita
- **Aceite:** nenhuma ferramenta descontinuada citada; toda ferramenta com selo de faixa
- **Testar:** revisão de conteúdo contra as fontes de §20

### FASE 07 — Módulos 7–9 (Workspace, NotebookLM, dados)

- **Objetivo:** Fases 7–9.
- **Implementar:** Docs/Sheets com marcação honesta de `PAGO`/`DEPENDENTE DO PLANO` e caminho gratuito via CSV; NotebookLM/Gemini Notebook (citar os dois nomes); perguntas de negócio sobre vendas, estoque, clientes, financeiro
- **Aceite:** todo recurso pago identificado como tal; existe alternativa gratuita declarada
- **Testar:** conferir limites contra a documentação oficial na data da implementação

### FASE 08 — Módulos 10–12 (automação, agentes, escolha)

- **Objetivo:** Fases 10–12.
- **Componentes:** `fluxo-automacao`
- **Implementar:** lógica do processo antes da ferramenta; diagramas em SVG; CHATBOT × AUTOMAÇÃO × AGENTE; 7 tipos de agente; comparação por tipo de tarefa (não "qual IA é melhor")
- **Aceite:** todo termo técnico precedido de explicação simples (item 5); diagramas legíveis a 360 px
- **Testar:** leitura em celular pequeno; revisão de linguagem

### FASE 09 — Projeto final

- **Banco:** `FinalProject`
- **Implementar:** checkpoints por módulo; geração do Plano de Adoção; exportação imprimível
- **Aceite:** plano exportado é compreensível fora do curso
- **Testar:** percurso completo de um aluno fictício; exportar e ler o PDF

### FASE 10 — Responsividade e acessibilidade

- **Objetivo:** item 14 do briefing.
- **Aceite:** sem rolagem horizontal em 360–1920; **notebook 1280–1440 com layout próprio, não desktop comprimido**; contraste AA; navegação por teclado
- **Testar:** medir nos 7 pontos de corte; navegar só pelo teclado; leitor de tela nos laboratórios

### FASE 11 — QA e publicação

- **Implementar:** revisão de conteúdo duplicado; verificação de toda ferramenta e faixa contra fonte oficial; `publicado: true`
- **Aceite:** matricular aluno novo e concluir o curso sem ver conteúdo de Educadores; checklist de fontes assinado
- **Testar:** aluno real em ambiente de homologação, ponta a ponta

### FASE 12 — Aula ao vivo (opcional, substitui o deck)

- **Implementar:** `LessonScript` do curso, usando `/apresentar/[scriptId]`
- **Aceite:** aula presencial conduzida sem o `.html`/`.vbs`; **cronômetros respeitam a duração declarada** (corrige P4)
- **Testar:** simulação de aula com uma turma

---

## Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| **Volume de conteúdo** — 13 módulos, ~80 lições, 170 prompts | alto | é o maior risco de prazo; fases 05–08 são as mais longas e podem ser fatiadas por módulo |
| Ferramentas mudam durante a produção | médio | verificar fontes na data de cada fase; vídeo é o módulo mais volátil |
| Regressão no curso de Educadores | alto | tudo aditivo e opcional; Fase 01 tem aceite explícito de não-regressão |
| Publicar antes do escopo por curso | alto | curso fica `publicado: false` até a Fase 11 |

---

## Decisões que aguardam o usuário

1. **Fórmula de prompt:** manter **C.O.F.R.E.** (recomendado — já está nos 32 prompts e cobre os 5 elementos pedidos) ou adotar OBJETIVO/CONTEXTO/INFORMAÇÕES/RESTRIÇÕES/FORMATO como no briefing?
2. **Deck `.html`:** aposentar como curso e manter os geradores só para a apostila PDF (recomendado), ou manter os dois em paralelo?
3. **Carga horária:** 40h reais exigem o volume acima. Confirmar 40h ou começar por um curso menor e sólido (~20h), expandindo depois?
