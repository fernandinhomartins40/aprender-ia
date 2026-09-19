# Auditoria — Curso de IA para Empreendedores

**Data:** 19/09/2026
**Escopo:** aplicação `aprender-ia` (monorepo) + pasta de produção `Desktop/cursos`
**Status:** auditoria concluída. Nenhum código foi alterado.

---

## 0. Antes de tudo: uma correção de premissa

O briefing parte de uma suposição que a auditoria **não confirmou**:

> "o curso de Empreendedores existente nesta aplicação"
> "compare os dois cursos existentes na mesma aplicação"

**O curso de Empreendedores não existe na aplicação.**

Verificação feita (`grep -ril "empreendedor"` em todo o repositório, exceto `node_modules` e `.git`): as únicas ocorrências estão em `apps/web/src/components/icone-app.tsx` e `apps/web/src/lib/icones-catalogo.ts` — nomes de ícones decorativos — além de artefatos de build em `.next/`. Não há `Course`, módulo, lição, rota ou seed de Empreendedores.

O seed (`packages/db/prisma/seed.ts`) cria **um único curso**: `slug: "ia-para-educadores"`.

### O que existe de Empreendedores, então

Um conjunto de **arquivos estáticos**, fora da aplicação, em `Desktop/cursos/Curso_IA_Empreendedores_2026/`:

| Artefato | O que é |
|---|---|
| `Slides_IA_para_Empreendedores_2026.html` | 93 KB, 141 slides, aberto em tela cheia por um `.vbs` |
| `Apostila_IA_para_Empreendedores_2026.html` + `.pdf` | apostila e edição econômica |
| ~20 scripts `.js` | geradores Node (Puppeteer) que montam HTML e PDF |
| `BIBLIOTECA_DE_PROMPTS.md` | banco de prompts em Markdown, **não** no banco de dados |

Ou seja: **o curso de Empreendedores é material de apresentação presencial, não um curso digital**. A comparação pedida no briefing ("funcionalidades presentes no Educadores e ausentes no Empreendedores") é, na prática, a comparação entre **um curso dentro da plataforma** e **um deck de slides fora dela**.

Isso muda a natureza do trabalho, e para melhor: não se trata de corrigir um curso ruim na aplicação, mas de **criar o curso na aplicação**, aproveitando uma infraestrutura que já está quase toda pronta. O detalhamento está em `plano-expansao-curso-empreendedores.md`.

### Consequência para os itens 16, 17 e 19 do briefing

Os itens "alterações de banco necessárias", "alterações de backend" e "conteúdo editável pelo painel administrativo" **têm onde pousar** — a aplicação tem Prisma, PostgreSQL, Next.js e painel admin. Eles serão tratados normalmente no plano.

O que **não** se aplica é a premissa de que basta editar um curso existente.

---

## 1. Arquitetura da aplicação (contexto para as duas auditorias)

```
aprender-ia/                  monorepo pnpm + turbo
├── apps/web/                 Next.js (App Router), React Server Components
├── packages/
│   ├── db/                   Prisma + PostgreSQL — 1709 linhas de schema
│   ├── ai-launcher/          abre ferramentas de IA com o prompt
│   ├── auth/                 NextAuth
│   ├── ui/                   tokens.css + cn.ts
│   ├── types/
│   └── config/
└── docker/                   Postgres + deploy
```

O schema tem **~70 modelos**. A camada pedagógica é rica e, em boa parte, **neutra de domínio**.

---

## 2. Auditoria do curso de Educadores (a referência)

### 2.1 Estrutura de conteúdo

Hierarquia no banco: `Course → Module → Lesson`, com `Exercise` e `PromptTemplate` pendurados na lição.

O curso real (conforme o seed e o comentário em `server/trilha.ts:126`): **11 módulos, 82 lições, 40h**.

`Lesson.conteudo` é um campo `Json` — a estrutura varia conforme `Lesson.tipo`. É isso que permite formatos de aula diferentes sem mudar o schema. **Esse é o mecanismo mais reaproveitável de toda a aplicação.**

### 2.2 Tipos de lição (`enum TipoLicao`)

Onze formatos, e nenhum deles é "slide":

| Tipo | Função pedagógica |
|---|---|
| `AQUECIMENTO` | abre o encontro ligando o conteúdo à dor real, antes da teoria |
| `TEORIA` | explicação |
| `PROMPT` | prática com IA |
| `DUELO` | compara prompt ruim × prompt bom |
| `CACA_ERRO` | o aluno encontra o erro (ex.: IA que inventou uma fonte) |
| `CASO` | estudo de caso |
| `DESAFIO` | produção com cronômetro |
| `QUIZ` | verificação |
| `CHECKPOINT` | fechamento do encontro |
| `NO_CELULAR` | feito no próprio aparelho — para quem não tem computador |
| `EMERGENCIA` | guia de bolso, consultado "na hora do aperto" |

`NO_CELULAR` e `EMERGENCIA` são decisões de design notáveis: reconhecem a realidade material e a urgência do aluno. Ambos têm equivalente direto no público empreendedor.

### 2.3 Banco de prompts

`model PromptTemplate` — e ele já atende quase toda a especificação do item 8 do briefing:

| Pedido no briefing | Campo existente |
|---|---|
| título | `titulo` |
| prompt completo | `corpo` |
| campos editáveis | `variaveis` (Json: `[{chave, rotulo, exemplo}]`) |
| finalidade / situação | `dica`, `objetivoPedagogico` |
| ferramenta indicada | `ferramentasSugeridas: String[]` |
| tags | `tags: String[]` |
| filtros | `categoria`, `nivelDificuldade`, `tipoAtividade` |
| favoritos | `model PromptFavorite` |
| botão testar com IA | `model PromptRun` + `packages/ai-launcher` |

Seed: `packages/db/prisma/banco-prompts.ts`, 710 linhas.

**Só falta um campo para servir a dois cursos: `courseId`.** Ver §4.1.

### 2.4 Botão de IA — como funciona

`packages/ai-launcher/src/index.ts` (188 linhas) é **genérico e sem qualquer traço de educação**. Cada ferramenta declara:

```ts
metodo: "url" | "copiar-e-abrir"
selo: "verde" | "amarelo" | "vermelho"   // gratuidade
bomPara: string[]
montarUrl: (prompt: string) => string
```

Duas qualidades que merecem ser preservadas:

1. **Honestidade técnica.** O adaptador do Gemini diz: *"O Gemini não aceita prompt pela URL — copiamos para você colar."* Não simula uma integração que não existe.
2. **Cautela com dados.** O comentário do ChatGPT registra a recusa deliberada de passar prompt por URL: *"Evitamos expor prompts (inclusive dados pedagógicos sensíveis) em URL."*

Esse pacote é reutilizável **como está**, sem uma linha de alteração. Só precisa de entradas novas no catálogo (`model AiTool`) para as ferramentas de negócio.

### 2.5 Componentes de interface

~60 componentes em `apps/web/src/components/`. Os pedagogicamente relevantes:

| Componente | Função |
|---|---|
| `banco-de-prompts.tsx` / `biblioteca-prompts.tsx` / `card-prompt.tsx` | biblioteca, busca, filtro, favorito |
| `construtor-prompt.tsx` / `gerador-prompt.tsx` / `oficina-de-prompt.tsx` | laboratório de prompt |
| `analise-ptcf.tsx` | **analisa o prompt do aluno pela fórmula P.T.C.F.** |
| `conteudo-da-aula.tsx` / `licao-cliente.tsx` | renderiza `Lesson.conteudo` por tipo |
| `modo-apresentacao.tsx` / `palco-slide.tsx` | modo apresentação ao vivo |
| `central-conhecimento.tsx` | base de conhecimento consultável |
| `diario-*.tsx` | diário de prática do aluno |
| `feedback-conclusao.tsx` / `feedback-visual.tsx` | gamificação |

### 2.6 Progresso, gamificação e diário

Já implementados no schema: `Enrollment` (com `progressoPct`), `LessonProgress`, `StepProgress`, `Streak`, `Achievement`/`UserAchievement`, `Mission`/`UserMission`, `UserReward`, `ActivityPerformance`, `DiaryEntry`.

**Nada disso precisa ser construído.** Precisa ser povoado e, em alguns casos, escopado por curso.

### 2.7 Aula ao vivo (modo presencial)

`LessonScript` → `ScriptStep` → `StepProgress`, com `LiveSession`, `Cohort`, `CohortMeeting`, `MeetingAttendance`, e a rota `/apresentar/[scriptId]`.

**Este é o substituto natural do deck de slides.** O que hoje é `Slides_IA_para_Empreendedores_2026.html` aberto por um `.vbs` pode virar um `LessonScript` dentro da aplicação — com a diferença de que o aluno acompanha pelo próprio aparelho e o progresso fica registrado.

### 2.8 Apostila — separada do curso, como o briefing quer

`HandbookChapter` → `HandbookSection`, rota `/app/apostila/[capitulo]`, componente `baixar-apostila.tsx`, e `Lesson.capituloRef` ("Cap. 2.2") ligando a lição ao capítulo.

**A regra do item 13 do briefing já é a arquitetura vigente no Educadores:** a apostila é material de consulta, a lição é a experiência, e há um ponteiro de uma para a outra. Isso não precisa ser inventado — precisa ser respeitado ao criar o curso novo.

### 2.9 Painel administrativo

24 rotas em `/admin`, incluindo `cursos`, `aulas`, `praticas`, `conhecimento`, `ferramentas-ia`, `gamificacao`, `turmas`, `planos`. O conteúdo é editável pelo painel — o requisito do item 17 do briefing está satisfeito pela arquitetura atual.

---

## 3. Auditoria do material de Empreendedores

Como não há curso na aplicação, a auditoria recai sobre os arquivos estáticos. As medições abaixo foram feitas por script, não por leitura visual.

### 3.1 Comparação de funcionalidade — decks lado a lado

Medido extraindo e comparando os blocos `<script>` dos dois arquivos:

| Métrica | Educadores | Empreendedores |
|---|---|---|
| JavaScript | **19.126 caracteres** | **2.895 caracteres** |
| Funções nomeadas | **16** | **2** (`go`, `scale`) |
| Slides com `data-title` | 97 | 141 |
| Classes CSS distintas usadas | 96 | 59 |

Os dois carregam **o mesmo `slides_base.css`** — arquivos byte a byte idênticos (27.573 bytes cada). A diferença visual não vem do CSS: vem de o deck de Empreendedores **não usar 60 das classes disponíveis**, entre elas `card`, `grid2`, `grid3`, `grid4`, `fig-slide`, `dica`, `lead`, `selo`, `ia-btn`, `ia-barra`, `prompt-acoes`, `var-campo`.

O template está lá. O curso de Empreendedores simplesmente não o aproveita.

### 3.2 Funcionalidades ausentes (confirmadas por diff de código)

| Recurso | Educadores | Empreendedores |
|---|---|---|
| **Prompt preenchível** (campos `[VARIÁVEL]` viram `<input>` no texto) | sim — `montarPromptEditavel()`, 60 linhas | **não** |
| Campos repetidos sincronizados (digita `[ANO]` uma vez, preenche todos) | sim | não |
| **Botões de IA** (Gemini / ChatGPT / DeepSeek / NotebookLM) | sim — `LISTA_IAS`, `ia-barra`, `ia-btns` | **não** — só 2 botões dentro do modal |
| Botões apontam para o prompt **já preenchido** | sim — `apontarBotoes()` | não |
| Cópia com fallback para `file://` | sim — `copiar()` + `fallback()` | **não** — `navigator.clipboard` puro, falha silenciosa |
| Cronômetro: pausar / continuar | sim | **não** — só inicia e zera |
| Cronômetro: aviso visual ao acabar | sim — classe `tocando` | não |
| Atalhos de teclado no cronômetro (espaço / Z) | sim | não |
| Teclado cede o foco a campos de texto | sim | não (não há campos) |
| Checklist que reseta ao trocar de slide | sim | não |
| Modal de banco de prompts (20 prompts navegáveis) | sim — `PROMPTS[]` + `abrirModal()` | **não** |
| Botão "ir para o último slide" | sim | declarado e **nunca ligado** — ver §3.4 |

### 3.3 Conteúdo: o problema apontado pelo usuário, medido

O usuário afirma que o deck "é apenas a cópia da apostila". A medição **confirma e agrava** o diagnóstico: além de derivado, o conteúdo é **repetido dentro do próprio deck**.

Normalizando o texto dos slides (removendo apenas o número da trilha/módulo) e contando duplicatas:

- **141 slides, 123 únicos, 18 literalmente repetidos (13%)**

Seis blocos aparecem **4 vezes cada**, com texto idêntico:

| Slide repetido 4× | Texto |
|---|---|
| "Escolha um problema pequeno e real" | mesma pergunta de partida nas trilhas 1, 2, 3 e 4 |
| "Antes de abrir a ferramenta" | idêntico nos módulos 1–4 |
| "Régua de qualidade" | idêntico nos módulos 1–4 |
| "Teste no celular" | idêntico nos 4 encontros |
| "Defina seu próximo experimento" (15:00) | idêntico |
| "Produza, revise e registre" (20:00) | idêntico |

Os slides 55–142 (62% do deck) são **dois templates instanciados 4× cada** — "Trilha N" e "Módulo N" —, preenchidos com texto genérico. O slide 55 e o 67 diferem apenas na frase de resultado esperado; a "Regra de qualidade" é a mesma palavra por palavra.

Isso não é um curso de 40h: é um molde repetido para preencher volume.

### 3.4 Bugs reais encontrados no deck

Não são questões de estilo — são defeitos de funcionamento:

**1. Cronômetros ignoram a própria duração.**
O HTML declara três durações — `data-seconds="300"`, `"900"`, `"1200"` (5, 15 e 20 min) — e exibe `05:00`, `15:00`, `20:00`. Mas o JavaScript ignora o atributo:

```js
let left=300,id;                    // sempre 300
s.querySelector('.reset').onclick=()=>{ ... left=300; paint()}
```

**Consequência:** os oito desafios de 15 e 20 minutos rodam 5 minutos e o mostrador salta de `15:00` para `04:59` ao iniciar. Em sala, toda atividade longa é cortada pela metade ou mais.
O deck de Educadores lê a duração do próprio slide e acerta.

**2. Botão "último slide" morto.**
`last=by('last')` é capturado, o elemento existe no HTML, mas nenhum `last.onclick` é atribuído. Clicar não faz nada.

**3. Cópia falha em silêncio.**
`pmCopiar.onclick=()=>navigator.clipboard.writeText(activePrompt)` — sem `catch`, sem confirmação visual. `navigator.clipboard` exige contexto seguro; o deck é aberto via `file://` pelo `.vbs`, onde a API **pode não existir**. O prompt não é copiado e o usuário não é avisado. O Educadores tem `fallback()` com `execCommand` exatamente para esse caso, e confirma com "✓ Copiado!".

**4. ~~Texto corrompido (mojibake).~~ — RETIRADO, era erro da auditoria.**
A primeira medição contou 21 ocorrências da sequência de bytes de `Ã` e concluiu haver mojibake. A verificação com contexto mostrou que todas as 21 são texto legítimo: "FORMAÇÃO COMPLETA" e "MÃO NA MASSA". **O arquivo é UTF-8 válido e está íntegro.** Não há nada a corrigir aqui.

**5. Botão "Abrir Gemini" não leva o prompt.**
`pmGemini.onclick=()=>window.open('https://gemini.google.com','_blank')` — abre a ferramenta vazia. Combinado com o bug 3 (cópia silenciosamente falha), o aluno chega ao Gemini **sem o prompt e sem saber disso**.

### 3.5 Problemas de UI/UX e responsividade

O deck usa `transform: scale()` sobre um palco fixo de 1280×720:

```js
d.style.transform='scale('+Math.min(innerWidth/1280,(innerHeight-62)/720)+')'
```

Isso **não é responsividade** — é redução proporcional. Num celular de 360 px de largura o conteúdo é reduzido a ~28%, tornando o texto ilegível. O requisito do item 14 do briefing (mobile-first, notebook sem layout desktop comprimido) é **estruturalmente inatingível** neste formato: um palco de proporção fixa não reflui.

Vale registrar que o Educadores tem exatamente a mesma limitação — é uma restrição do formato "deck", não um descuido do Empreendedores. **É o argumento técnico decisivo para migrar o curso para a aplicação**, onde a lição é uma página React que reflui de verdade.

### 3.6 Ausências estruturais

Comparado ao que a aplicação oferece ao curso de Educadores, o material de Empreendedores não tem:

- persistência de progresso (nada é salvo; o checklist some ao trocar de slide, por design)
- matrícula, turma, certificado
- banco de prompts consultável (existe um `.md` solto, fora da aplicação)
- exercícios corrigidos, quiz, XP, conquistas, missões, streak
- diário de prática
- apostila navegável na tela (só PDF)
- qualquer separação entre "material de apoio" e "experiência de aula"

---

## 4. Comparação objetiva e diagnóstico

### 4.1 O gargalo arquitetural (o achado mais importante)

A aplicação **já é parcialmente multi-curso**, mais do que se esperaria:

- `Course` é uma entidade de primeira classe, com `Enrollment` por curso;
- `/app/trilha` já mostra um **seletor de cursos** quando o aluno tem mais de um (`trilha/page.tsx:24`), navegando por `?curso=<id>`;
- `carregarTrilha(userId, courseId?)` aceita o curso como parâmetro;
- não há **nenhum** slug de curso hardcoded no frontend (verificado por grep).

O bloqueio está noutro lugar. **Sete modelos centrais não têm `courseId`**:

| Modelo | Tem `courseId`? |
|---|---|
| `PromptTemplate` | **não** |
| `AiTool` | **não** |
| `KnowledgeEntry` | **não** |
| `Mission` | **não** |
| `Achievement` | **não** |
| `HandbookChapter` | **não** |
| `LessonScript` | **não** |

E as rotas do aluno correspondentes ignoram o curso — contagem de menções à palavra "curso" em cada página:

| Rota | Menções a curso |
|---|---|
| `/app/apostila` | 2 |
| `/app/prompts` | **0** |
| `/app/ferramentas` | **0** |
| `/app/conhecimento` | **0** |
| `/app/missoes` | **0** |
| `/app/conquistas` | **0** |
| `/app/diario` | **0** |

**Consequência concreta e previsível:** publicar o curso de Empreendedores hoje faria o aluno empreendedor abrir "Prompts" e encontrar *"Aja como professor(a) de [DISCIPLINA] do [ANO]… habilidade BNCC"*. A apostila mostraria capítulos de educação. As conquistas seriam de professor.

O trabalho de banco não é criar infraestrutura — é **escopar por curso a que já existe**. É uma migração aditiva, de baixo risco (`courseId` opcional, `null` = global).

### 4.2 Acoplamento ao domínio de educação

25 dos ~60 componentes mencionam `bncc|disciplina|professor|escola|pedagog`. Mas o acoplamento é de **vocabulário**, não de estrutura:

- `PromptTemplate.disciplina` e `.etapaEnsino` são campos opcionais — um curso de negócios simplesmente não os usa (ou ganha campos análogos, como `setor` e `portePorte`);
- `analise-ptcf.tsx` implementa a fórmula P.T.C.F. do curso de Educadores. O briefing pede, para Empreendedores, uma fórmula de 5 partes (OBJETIVO/CONTEXTO/INFORMAÇÕES/RESTRIÇÕES/FORMATO) e o material atual usa "C.O.F.R.E.". **Aqui há decisão pedagógica pendente** — ver §6.

### 4.3 Resumo do que se reutiliza

| Camada | Veredito |
|---|---|
| `packages/ai-launcher` | **reutilizar como está** — já é neutro |
| Schema pedagógico (`Lesson.conteudo` Json, `TipoLicao`) | **reutilizar** — comporta formatos novos sem migração |
| Progresso, XP, streak, conquistas, missões, diário | **reutilizar** — só escopar por curso |
| `LessonScript`/`ScriptStep` + `/apresentar` | **reutilizar** — substitui o deck `.html` |
| `HandbookChapter` + `Lesson.capituloRef` | **reutilizar** — já implementa a regra "apostila ≠ aula" |
| Componentes de prompt (biblioteca, card, construtor) | **reutilizar** — ajustar rótulos, não estrutura |
| `analise-ptcf.tsx` | **generalizar** — a fórmula precisa ser parametrizável |
| Rotas periféricas do aluno | **modificar** — passar a respeitar `?curso=` |
| Deck `.html` + scripts geradores | **aposentar** como curso; manter só para gerar o PDF da apostila |

---

## 5. Pesquisa de ferramentas — achados que mudam o conteúdo planejado

Pesquisa feita em fontes oficiais (setembro/2026). Três achados contradizem o briefing e **precisam de decisão antes de escrever conteúdo**:

### 5.1 Sora foi descontinuado

A Fase 6 do briefing pede um módulo de vídeo. **A OpenAI concluiu o encerramento do Sora em 24/03/2026.** Ensiná-lo seria exatamente o erro que o item 4 do briefing proíbe ("não ensine funcionalidades antigas ou descontinuadas").

Alternativas atuais: **Google Veo 3.1** (via Google AI Studio; ~10 gerações/mês gratuitas por conta Google via Google Vids), **Kling** (free generoso, mas **veda uso comercial** e marca d'água — desqualificante para o público), **Pika** (free permite uso comercial, limitado a 480p).

**Recomendação:** Veo 3.1 como ferramenta principal; Pika como alternativa gratuita com uso comercial permitido. Tratar vídeo como o módulo mais volátil do curso.

### 5.2 "Claude Cowork" deixou de ser produto separado

A Fase 12 pede um módulo "Claude e Cowork". A Anthropic **fundiu Cowork e chat num só Claude**, em lançamento progressivo nos planos Pro e Max. Manter os dois como produtos distintos ensinaria uma distinção que já não existe na interface.

**Recomendação:** ensinar o conceito — *delegar um trabalho de várias etapas sobre seus arquivos* versus *fazer uma pergunta* — e não a marca. O conceito sobrevive ao rename; a marca não.

### 5.3 O Gemini no Sheets é majoritariamente pago

A Fase 7 é descrita como "muito prática" e o item 4 manda priorizar o gratuito. Mas os recursos fortes de 2026 (construir planilha inteira por linguagem natural, mini-apps, dashboards no canvas) estão **em beta para assinantes Google AI Ultra e Pro**, e em inglês.

**Recomendação:** marcar a Fase 7 honestamente como `PAGO` / `DEPENDENTE DO PLANO`, e ensinar o caminho gratuito de verdade (exportar CSV → analisar em chat de IA), que funciona para qualquer MEI hoje.

### 5.4 NotebookLM está sendo renomeado

A documentação do Google já usa **"Gemini Notebook"** ao lado de NotebookLM, e há mudança de limites anunciada para 02/09/2026. Free: até 50 fontes por notebook, 500 mil palavras ou 200 MB por fonte.

**Recomendação:** citar os dois nomes no conteúdo durante a transição.

### 5.5 Demais faixas confirmadas

| Ferramenta | Faixa |
|---|---|
| ChatGPT Free | texto ilimitado; imagem, upload, voz e análise com limites |
| ChatGPT Go | US$ 8/mês — 10× mais mensagens, uploads e imagens |
| ChatGPT Business | US$ 25/usuário/mês (mín. 2 usuários) |
| ChatGPT Images 2.5 | confirmado; suporta fundo transparente e edição por seleção |
| Make | **1.000 operações/mês grátis**, 2 cenários — melhor free tier para ensinar automação |
| Zapier | free limitado; pago a partir de US$ 29,99/mês |
| n8n | self-hosted gratuito e ilimitado (exige servidor) |

**Recomendação para a Fase 10:** ensinar a **lógica do processo** com Make no plano gratuito. Zapier no free tier é restritivo demais para um curso inteiro.

---

## 6. Decisões pendentes (dependem do usuário)

Três pontos em que o briefing conflita consigo mesmo ou com os achados. Não foram decididos unilateralmente:

1. **Fórmula de prompt.** O briefing (Fase 2) pede OBJETIVO/CONTEXTO/INFORMAÇÕES/RESTRIÇÕES/FORMATO. O material atual usa **C.O.F.R.E.** (Contexto/Objetivo/Formato/Restrições/…), que é mnemônico e já está nos 32 prompts do deck. Manter C.O.F.R.E. preserva o material; adotar a nova ordem exige reescrever tudo. **Recomendação: manter C.O.F.R.E.**, que cobre os mesmos cinco elementos com uma mnemônica melhor.

2. **Destino do deck `.html`.** Migrar o curso para a aplicação torna o deck redundante — exceto para aula presencial sem internet. **Recomendação:** manter os geradores apenas para a apostila em PDF e substituir o deck por `LessonScript` + `/apresentar`.

3. **Carga horária.** O deck alega 40h via repetição de template (§3.3). Um curso de 40h real, nas 12 fases do briefing, é um volume de conteúdo substancialmente maior que o existente. **É o maior risco de prazo do projeto** e está dimensionado no plano.

---

## 7. Conclusão

O diagnóstico do usuário está correto — e a causa é mais estrutural do que "faltam botões":

1. **O curso de Empreendedores não está na aplicação.** É um deck estático de 141 slides, com 2 funções JavaScript contra 16 do Educadores, fora de toda a infraestrutura pedagógica.
2. **O conteúdo não é só derivado da apostila — é repetido.** 13% dos slides são duplicatas literais; 62% do deck são dois templates instanciados quatro vezes.
3. **Há quatro bugs funcionais**, sendo o mais grave o cronômetro que ignora a duração declarada e roda 5 minutos em atividades de 20.
4. **A infraestrutura necessária já existe e está bem construída.** O trabalho principal não é criar sistema: é **escopar sete modelos por curso** e **produzir conteúdo**.

O caminho recomendado não é melhorar o deck. É **criar o curso dentro da aplicação**, onde botão de IA, banco de prompts, progresso, laboratórios e responsividade real já existem — e passam a servir dois cursos em vez de um.

O plano está em [`plano-expansao-curso-empreendedores.md`](./plano-expansao-curso-empreendedores.md).

---

## 8. Fontes consultadas

- [ChatGPT Free Tier FAQ — OpenAI](https://help.openai.com/en/articles/9275245-chatgpt-free-tier-faq)
- [Business Pricing — OpenAI](https://openai.com/business/pricing/)
- [Introducing ChatGPT Go — OpenAI](https://openai.com/index/introducing-chatgpt-go/)
- [Introducing ChatGPT Images 2.5 — OpenAI](https://openai.com/index/introducing-chatgpt-images-2-5/)
- [Images in ChatGPT — OpenAI Help Center](https://help.openai.com/en/articles/11084440-images-in-chatgpt)
- [Claude Cowork — Anthropic](https://claude.com/product/cowork)
- [Claude Cowork and chat are now one Claude — Anthropic](https://claude.com/blog/cowork-is-now-claude)
- [Gemini updates to Docs, Sheets, Slides and Drive — Google](https://blog.google/products-and-platforms/products/workspace/gemini-workspace-updates-march-2026/)
- [Gemini AI features included in Workspace subscriptions — Google](https://support.google.com/a/answer/15756885?hl=en)
- [Upgrade Gemini Notebook — Google](https://support.google.com/notebooklm/answer/16213268?hl=en)
- [Add or discover new sources — Gemini Notebook Help](https://support.google.com/gemininotebook/answer/16215270?hl=en)
- [Free AI Video in 2026: Sora's Exit, Veo 3.1 & Kling — Sunra](https://sunra.ai/blog/ai-video-generation-2026-sora-shutdown-veo-free-kling-viral)
- [n8n vs Make vs Zapier for AI Agents: 2026 Comparison](https://www.betterclaw.io/blog/n8n-vs-make-vs-zapier-ai-agents)
