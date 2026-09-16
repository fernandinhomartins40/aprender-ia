# Acompanhe a Aula — plano da funcionalidade

## O problema que originou isto

Na primeira aula do curso, dois sintomas apareceram:

1. **Os alunos ficaram perdidos.** Só assistiam à projeção; quem desviava a
   atenção por um minuto não sabia mais onde estávamos.
2. **A aula parou várias vezes** para ensinar, um a um, como acessar as IAs —
   digitar o endereço, achar o botão de login, copiar o prompt do slide.

O material não tem defeito. O que falta é o aluno ter **na mão** o que está
sendo projetado, com os atalhos já prontos: abrir a IA, colar o prompt,
preencher o que é dele.

## O que será construído

Uma área nova na aplicação, **fora da trilha**, chamada **Acompanhe a Aula**.

Enquanto o professor apresenta, o aluno abre essa área no celular e vê os
mesmos slides — só que interativos: cada prompt tem botão para abrir na IA já
preenchido, cada endereço é um link, cada checklist é clicável.

Não substitui a trilha (que é o estudo assíncrono, entre encontros). É a
**companhia do encontro presencial**.

---

## Decisões tomadas

### Navegação livre, com "voltar ao professor"

O aluno navega sozinho. Uma tarja — **"Ir para onde o professor está"** — leva
ao slide que está sendo projetado.

Por que a tela do aluno não acompanha a do professor automaticamente:

- Sincronia forçada **atrapalha em sala**: se o aluno está digitando um prompt e
  a tela pula, ele perde o que escreveu. Quem ficou para trás não consegue
  reler o slide anterior.
- O aluno que quer acompanhar em tempo real toca na tarja e está lá. Quem
  precisa de mais um minuto fica onde está.

O professor **não precisa publicar nada à mão**: como ele apresenta pela própria
aplicação (ver abaixo), avançar o slide já registra o passo atual.

### Celular primeiro

A apostila inteira já ensina pelo celular (os blocos "NO CELULAR"). Então a
tela do aluno **não** é um slide 16:9 encolhido — é uma lista vertical rolável,
com botões do tamanho do dedo.

Um slide 16:9 espremido num celular deixaria o prompt ilegível, que é
justamente o que precisa ser lido e copiado.

---

## O que a aplicação já tem (e será reaproveitado)

Esta é a parte boa: quase nada precisa ser inventado.

| Peça pronta | Onde está | Serve para |
|---|---|---|
| Abrir IA com prompt na URL | `components/gerador-prompt.tsx` | Botão "Abrir no ChatGPT já preenchido" |
| Formulário de variáveis do prompt | `components/card-prompt.tsx` | Os campos `[ANO]`, `[DISCIPLINA]` |
| Catálogo de ferramentas | model `AiTool` | Endereços, `metodoAbertura`, `urlComPrompt` |
| Banco de prompts | model `PromptTemplate` (campo `variaveis`) | Os prompts dos slides |
| Encontros da turma | model `CohortMeeting` | Saber qual aula está acontecendo |
| Presença | model `MeetingAttendance` | Quem está na sala |
| O deck pronto | `cursos/.../Slides_IA_Educadores_2026.html` | Os 97 slides, já interativos |

E o próprio deck já tem, em HTML, o cronômetro, o modal de prompt, os campos
`[ ]` preenchíveis, os botões de IA e os checklists clicáveis — construídos nas
últimas sessões. O modo apresentação serve esse arquivo; a tela do aluno
reaproveita a mesma lógica em React.

O `AiTool.metodoAbertura` já distingue `URL_COM_PROMPT` de `COPIAR_E_ABRIR` —
exatamente a diferença que existe hoje entre ChatGPT (aceita prompt na URL) e
Gemini, DeepSeek e NotebookLM (não aceitam).

---

## Estrutura da tela do aluno

```
┌─────────────────────────────┐
│ Encontro 1 · A arte de      │  ← cabeçalho fixo
│ conversar com a IA          │
│ ▸ Professor está no passo 8 │  ← só quando há aula acontecendo
├─────────────────────────────┤
│                             │
│  8. Quatro ferramentas.     │  ← o passo atual, rolável
│     Só quatro.              │
│                             │
│  [texto do slide]           │
│                             │
│  ┌───────────────────────┐  │
│  │ Aja como professor de │  │  ← prompt, com campos
│  │ [Ciências] do [6º ano]│  │     preenchíveis
│  └───────────────────────┘  │
│                             │
│  [📋 Copiar]  [Abrir no ▾]  │  ← ações grandes
│                             │
│  ☐ Criei minha conta        │  ← checklist do aluno
│                             │
├─────────────────────────────┤
│  ‹ anterior   8/24   próx › │  ← navegação
│  [ Ir para onde o professor │
│    está ]                   │  ← só quando ele está longe
└─────────────────────────────┘
```

### O que cada passo pode conter

Os slides viram **passos**. Um passo tem um título e qualquer combinação de:

- **Texto** — o conteúdo do slide, em corpo legível no celular
- **Prompt** — com os campos `[ ]` preenchíveis; ao preencher, os botões passam
  a levar a versão completa
- **Ferramenta** — botão que abre a IA (com prompt na URL onde a ferramenta
  aceita; nas outras, copia e abre)
- **Checklist** — itens que o aluno marca ("criei minha conta no Gemini")
- **Imagem** — quando o slide tem figura

---

## O modo apresentação, dentro da aplicação

O professor **apresenta pela própria aplicação**, em
`/admin/turmas/[id]/apresentar`. É o mesmo deck que hoje se abre pelo
`Iniciar_Apresentacao.vbs`, só que servido pela plataforma.

Isso resolve a sincronia sem esforço nenhum do professor: **cada vez que ele
avança o slide, a aplicação registra o passo atual**. Não há botão "publicar"
para lembrar de clicar no meio da aula — avançar o slide já é a publicação.

```
  Notebook do professor                Celular do aluno
  ┌────────────────────────┐           ┌──────────────┐
  │                        │           │ ▸ professor  │
  │   [slide projetado]    │  ──────▶  │   no passo 8 │
  │                        │  registra │              │
  │  ‹  8 / 24  ›     ⛶    │  o passo  │ [ir para lá] │
  └────────────────────────┘           └──────────────┘
```

A tela de apresentação tem:

- O deck em tela cheia, com as mesmas teclas de hoje (setas, F, G)
- **Visão do apresentador** numa faixa lateral recolhível:
  - **"12 de 18 acompanhando"** — quem está com o celular aberto
  - **"7 ainda não criaram conta no Gemini"** — do checklist do passo
  - O próximo passo, para saber o que vem
- Botão **"Encerrar apresentação"**, que fecha a sessão e libera os alunos

Esse contador do checklist é o que resolve o problema original. Em vez de
perguntar "todo mundo conseguiu?" e receber silêncio, o professor **vê** quem
travou — e atende só quem precisa, sem parar a aula inteira.

### Como o aluno sabe onde o professor está

O celular pergunta ao servidor a cada poucos segundos qual é o passo atual
(*polling* simples, não precisa de websocket). Se o aluno estiver em outro
passo, aparece a tarja **"ir para onde o professor está"**. Ele decide se vai.

Um endpoint leve — `GET /api/aula/[meetingId]/atual` devolvendo só o número do
passo — aguenta 30 celulares perguntando a cada 5 segundos sem esforço.

---

## Modelo de dados

Três tabelas novas. Nomes em inglês, como o resto do schema.

```prisma
/// Um roteiro de aula: a versão navegável dos slides de um encontro.
model LessonScript {
  id       String  @id @default(cuid())
  cohortId String?          // roteiro de uma turma específica
  meetingId String? @unique // ou preso a um encontro
  titulo   String
  passos   ScriptStep[]
  sessoes  LiveSession[]
  criadoEm DateTime @default(now())
}

/// Uma apresentação acontecendo agora. Criada quando o professor abre o modo
/// apresentação e encerrada quando ele fecha — é o que diz ao aluno em que
/// passo o professor está, sem ele precisar publicar nada à mão.
model LiveSession {
  id        String   @id @default(cuid())
  scriptId  String
  meetingId String?
  /// Atualizado a cada avanço de slide. O aluno lê isto para "ir até lá".
  passoAtual Int     @default(1)
  iniciadaEm DateTime @default(now())
  encerradaEm DateTime?
  script    LessonScript @relation(fields: [scriptId], references: [id], onDelete: Cascade)
  @@index([meetingId, encerradaEm])
}

/// Um passo do roteiro — equivale a um slide.
model ScriptStep {
  id       String @id @default(cuid())
  scriptId String
  ordem    Int
  titulo   String
  /// Blocos do passo: texto, prompt, ferramenta, checklist, imagem.
  /// JSON porque a combinação varia de passo para passo.
  blocos   Json
  script   LessonScript @relation(fields: [scriptId], references: [id], onDelete: Cascade)
  @@unique([scriptId, ordem])
}

/// O que cada aluno marcou. Serve ao painel do professor e ao próprio aluno,
/// que reencontra o progresso se fechar o celular.
model StepProgress {
  id       String @id @default(cuid())
  userId   String
  stepId   String
  /// Itens de checklist marcados, por índice.
  marcados Int[]  @default([])
  /// Valores que o aluno digitou nos campos do prompt — ele não perde o que
  /// escreveu ao trocar de passo.
  valores  Json?
  visto    DateTime @default(now())
  @@unique([userId, stepId])
}
```

**Por que `blocos` em JSON:** cada passo mistura texto, prompt e checklist em
ordens diferentes. Tabelas separadas para cada tipo exigiriam quatro joins para
montar uma tela que é lida inteira de uma vez.

---

## Como os slides viram passos

O deck em `cursos/Curso_IA_Educadores_v2/Slides_IA_Educadores_2026.html` já tem
tudo marcado em HTML: `.prompt`, `.card.abrivel`, `.it.marcavel`, `.ia-btn`.

Um script de importação lê o deck e gera os passos — o mesmo caminho que
`montar_slides.js` já usa para extrair os prompts da apostila. Os 97 slides
viram passos automaticamente, sem redigitar nada.

Encontro 1 é o piloto: 24 passos.

---

## Etapas de implementação

| # | Etapa | Entrega |
|---|---|---|
| 1 | Modelo de dados + migração | As quatro tabelas no banco |
| 2 | Importador do deck | Encontro 1 virando 24 passos |
| 3 | Tela do aluno (`/app/acompanhar`) | Navegação, texto, imagem |
| 4 | Blocos interativos | Prompt com campos, botões de IA, checklist |
| 5 | Modo apresentação (`/admin/turmas/[id]/apresentar`) | Deck na aplicação, registrando o passo |
| 6 | Sincronia e visão do apresentador | "Ir até o professor" + quem travou |
| 7 | Entrada na aplicação | Item no menu + destaque no Início durante o encontro |

As etapas 1 a 4 já entregam valor: o aluno acompanha e acessa as IAs sozinho.
A 5 e a 6 fecham o ciclo — o professor apresenta pela plataforma e enxerga a
turma. A 7 é o acabamento.

**Se o tempo apertar antes do próximo encontro:** as etapas 1 a 4 sozinhas já
resolvem o problema maior (o aluno acessando as IAs sem parar a aula). A
apresentação pela aplicação pode vir depois, com o deck continuando a abrir
pelo atalho atual.

---

## Detalhes que decidem se funciona em sala

**Entrar rápido.** Durante o encontro, a área precisa estar na primeira tela do
aplicativo — não a três toques de distância. Um aviso no Início ("Seu encontro
começa agora → Acompanhar") resolve.

**Funcionar com internet ruim.** Escola pública, 30 celulares na mesma rede. Os
passos devem ser carregados de uma vez e ficar em cache; marcar um checklist
grava depois, quando a rede voltar.

**Não perder o que foi digitado.** O aluno preenche `[ANO]` com "6º ano", troca
de passo e volta: o valor continua lá. É o `StepProgress.valores`.

**Botão grande.** "Abrir no ChatGPT" precisa ser tocável com o polegar, na
correria da sala — não um link de 12px.

---

## O que este plano não resolve

- **A tela do aluno não pula sozinha.** Foi decisão consciente: a aplicação
  sabe onde o professor está, mas quem decide seguir é o aluno — senão a tela
  muda na mão de quem está digitando um prompt.
- **Não substitui o projetor.** A projeção continua sendo o centro da aula; a
  tela do aluno é a mão que executa.
- **Não cobre os outros três encontros de saída.** O Encontro 1 é o piloto. Se
  funcionar, os outros entram pelo mesmo importador, sem código novo.
