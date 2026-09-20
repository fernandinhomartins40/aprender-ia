# Padrão para criar um curso novo

Este documento existe por causa de um retrabalho concreto: o curso de IA
para Empreendedores foi feito duas vezes. A primeira versão passou em
todos os testes automáticos — tipagem limpa, zero vazamento entre cursos,
responsividade medida — e ainda assim o conteúdo estava raso e o deck de
slides, visualmente quebrado.

O que faltou não foi capacidade técnica: foi **comparar com a referência
antes de dar por pronto**. As medições abaixo são as que teriam revelado
o problema no primeiro dia.

---

## 1. A regra que resume tudo

> **Uma fonte só: o banco.**
> Lição, slide, roteiro de aula e apostila saem todos das mesmas lições.

No curso de Educadores o caminho é o inverso — o deck HTML é a fonte e o
banco recebe uma cópia. Funciona, e foi assim que o deck de Empreendedores
acabou com 13% de slides repetidos que a trilha não tinha: as duas versões
divergiram sem ninguém notar.

Com uma fonte só, corrigir o conteúdo corrige os quatro materiais juntos.

```
packages/db/prisma/<curso>/modulos.ts      ← o conteúdo, escrito à mão
                          ↓  seed
                    banco (Lesson)
                          ↓
     ┌────────────────────┼────────────────────┐
  trilha              gerar-deck.ts      gerar-pdf.ts
  (React)             slides .html       apostila .html → PDF
                          ↓
                    roteiros.ts → LessonScript (aula ao vivo)
```

---

## 2. Antes de escrever conteúdo: meça a referência

Rode isto **no começo**, não no fim. São os números que definem a meta.

### 2.1 Volume e profundidade das lições

```ts
// packages/db/prisma/_medir.ts (descartável)
const txt = (o: any): string =>
  o == null ? "" :
  typeof o === "string" ? o :
  Array.isArray(o) ? o.map(txt).join(" ") :
  typeof o === "object" ? Object.values(o).map(txt).join(" ") : String(o);

const c = await p.course.findUnique({ where: { slug }, include: { modulos: { include: { licoes: true } } } });
const ls = c.modulos.flatMap(m => m.licoes);
const soma = ls.reduce((s, l) => s + txt(l.conteudo).length, 0);
console.log(`${ls.length} lições · ${(soma/1000).toFixed(1)}k chars · média ${Math.round(soma/ls.length)}`);
```

**Referência (Educadores):** 82 lições, 52,3k caracteres, média 638/lição.

**Meta mínima para um curso novo:** igualar a média por lição, e não
ficar abaixo de 80% do número de lições.

### 2.2 Componentes visuais do deck — a medição que eu pulei

Esta é a que mais dói pular. O deck pode ter o conteúdo certo e mesmo
assim parecer vazio, porque não usa os blocos do `slides_base.css`.

```bash
python -c "
import re, collections
for f, n in [('<referencia>.html','REF'), ('<novo>.html','NOVO')]:
    s = open(f, encoding='utf-8').read()
    c = collections.Counter()
    for cls in re.findall(r'class=\"([^\"]*)\"', s):
        for x in cls.split(): c[x] += 1
    print(n, {k: c.get(k,0) for k in
      ['card','grid2','grid3','prompt-acoes','traduzindo','dica','atencao','chk','marcavel','sl-crono']})
"
```

**O que a primeira versão do deck de Empreendedores mostrou:**

| componente | Educadores | Empreendedores v1 |
|---|---|---|
| `card` | 144 | **0** |
| `grid2`/`grid3`/`grid4` | 41 | **0** |
| `prompt-acoes` (campos preenchíveis) | 16 | **0** |
| `ia-btn` (botões de IA) | 14 | **0** |
| `dica` | 18 | **0** |
| `traduzindo` | 12 | **0** |

Zero cards é o que produz "duas frases soltas num vazio de 1280×720".
**Se qualquer linha der zero, o deck não está pronto.**

### 2.3 Duplicação de conteúdo

```bash
# Normaliza (tira o número do módulo/trilha) e conta repetidos
python -c "
import re, html, collections
s = open('<deck>.html', encoding='utf-8').read()
sl = re.findall(r'<div class=\"slide\"[^>]*>(.*?)(?=<div class=\"slide\"|<div class=\"controls\")', s, re.S)
norm = lambda x: re.sub(r'\s+',' ', re.sub(r'(Trilha|Módulo)\s*[1-9]','X', html.unescape(re.sub(r'<[^>]+>',' ',x)))).strip()
c = collections.Counter(map(norm, sl))
dup = sum(v-1 for v in c.values() if v>1)
print(f'{len(sl)} slides, {len(c)} únicos, {dup} repetidos ({100*dup//len(sl)}%)')
"
```

**Aceite: 0% de repetição.** O deck v1 tinha 13%, e 62% do arquivo eram
dois moldes instanciados quatro vezes cada.

---

## 3. Escopo por curso — o bloqueador silencioso

Sete modelos têm `courseId` **opcional**, onde `null` significa "vale para
todos os cursos". Um curso novo **precisa** preencher esse campo, ou o
conteúdo dele vaza para os outros:

`PromptTemplate` · `AiTool` · `KnowledgeEntry` · `Mission` ·
`Achievement` · `HandbookChapter` · `LessonScript`

```ts
// Sempre, em todo upsert do seed do curso novo:
data: { ...dados, courseId: curso.id }
```

### Teste de vazamento (obrigatório antes de publicar)

```ts
for (const slug of ["curso-a", "curso-b"]) {
  const c = await p.course.findUnique({ where: { slug } });
  const escopo = { OR: [{ courseId: c.id }, { courseId: null }] };
  console.log(slug, {
    prompts: await p.promptTemplate.count({ where: escopo }),
    ferramentas: await p.aiTool.count({ where: { ativo: true, ...escopo } }),
    capitulos: await p.handbookChapter.count({ where: escopo }),
    conquistas: await p.achievement.count({ where: escopo }),
    roteiros: await p.lessonScript.count({ where: escopo }),
  });
}
```

Os números têm de bater com o que cada curso semeou. Se um curso enxerga
mais do que criou, há conteúdo com `courseId` nulo indevidamente.

### Rotas do aluno

Estas sete precisam propagar `?curso=`:
`/app/prompts` · `/app/ferramentas` · `/app/conhecimento` ·
`/app/missoes` · `/app/conquistas` · `/app/diario` · `/app/apostila`

Use `resolverCursoAtivo()` e `doCurso()` de `server/curso-ativo.ts`.

### Acesso

Curso fora de um `Plan` responde **"Acesso indisponível"** na trilha,
mesmo publicado. Vincule ao plano gratuito no seed:

```ts
const planoFree = await prisma.plan.findUnique({ where: { slug: "gratuito" } });
// + PlanCourse + PlanModule — ver seed-empreendedores.ts
```

---

## 4. Estrutura do conteúdo

### 4.1 Tipos de lição (15 no `enum TipoLicao`)

| Tipo | Quando usar |
|---|---|
| `AQUECIMENTO` | abre o módulo ligando o assunto à dor real |
| `TEORIA` | explicação — **nunca só texto: use blocos** |
| `DUELO` | pedido ruim × pedido bom, lado a lado |
| `CASO` | situação real + pergunta, sem resposta pronta |
| `CACA_ERRO` | o aluno acha os erros num material plausível |
| `QUIZ` | verificação rápida |
| `PROMPT` | prática com prompt preenchível |
| `LABORATORIO` | **produz algo e a entrega fica salva** |
| `ANTES_DEPOIS` | mesma tarefa com e sem IA + tempo economizado |
| `FLUXO` | processo passo a passo, com parada humana |
| `DESAFIO` | cronometrado |
| `NO_CELULAR` | feito no aparelho, agora |
| `EMERGENCIA` | guia de bolso, consulta rápida |
| `CHECKPOINT` | fecha o módulo |
| `PROJETO` | atravessa o curso e gera documento final |

**Proporção saudável:** no máximo 30% de `TEORIA`. Se passar disso, o
curso virou apostila em telas — exatamente o que o briefing proíbe.

### 4.2 Blocos de uma lição de TEORIA

Uma teoria de 5 blocos rende um slide vazio. Use **12 a 15**:

```ts
blocos: [
  { tipo: "texto",    texto: "abertura pela experiência que a pessoa já tem" },
  { tipo: "texto",    texto: "a ponte para o conceito" },
  { tipo: "destaque", titulo: "O nome técnico", texto: "só agora o termo" },
  { tipo: "lista",    titulo: "Faz bem",  itens: [...] },
  { tipo: "lista",    titulo: "Não faz",  itens: [...] },
  { tipo: "texto",    texto: "exemplo aplicado a um negócio concreto" },
  { tipo: "destaque", titulo: "O erro mais comum", texto: "..." },
  { tipo: "dica",     titulo: "Como conferir", texto: "..." },
  { tipo: "atencao",  titulo: "Quando NÃO usar", texto: "..." },
]
```

Tipos renderizados por `PlayerTeoria`: `texto`, `lista`, `destaque`,
`dica`, `atencao`, `traduzindo`.

**Regra do briefing:** linguagem simples primeiro, termo técnico depois.
Nunca abrir com "um agente executa workflows multi-step".

### 4.3 Toda lição aponta a apostila

`capituloRef: "Cap. 2.3"` vira o link *"Aprofunde na apostila"*. A aula
interpreta e faz produzir; a apostila é consulta. **Não copiar parágrafo
da apostila para a lição.**

---

## 5. Pesquisa de ferramentas — obrigatória, e com data

Ferramenta de IA muda em meses. Três achados de setembro/2026 que
mudaram o conteúdo planejado:

- **Sora foi encerrado** pela OpenAI em 24/03/2026 — ensinar seria erro
- **Cowork e chat viraram um só Claude** — ensinar o conceito, não a marca
- **Gemini no Sheets é majoritariamente pago** (beta AI Pro/Ultra)

Todo `AiTool` precisa de:

```ts
faixaAcesso: "GRATUITO" | "GRATUITO_COM_LIMITES" | "PAGO" | "DEPENDE_DO_PLANO",
limiteGratuito: "50 fontes por caderno",   // o limite concreto
verificadoEm: new Date("2026-09-19"),      // a data da conferência
fonteUrl: "https://...",                   // a fonte oficial
```

Sem `verificadoEm` não há como saber se a aula envelheceu.

---

## 6. Banco de prompts

Meta: **≥ 170 prompts**, cobrindo as áreas do negócio (não os assuntos de
IA — quem procura está com um problema na mão).

Cada prompt: `titulo`, `corpo` (C.O.F.R.E.), `categoria`, `setor`, `dica`,
`exemploPreenchido`, `variaveis[]`, `ferramentasSugeridas[]`,
`nivelDificuldade`, `tags[]`.

**`exemploPreenchido` não é opcional.** Campo em branco não ensina: ver o
prompt preenchido com um caso real é o que mostra o nível de detalhe.

Divida em arquivos por bloco temático — um arquivo passa de 2.000 linhas
e deixa de ser navegável. E valide títulos duplicados no seed:

```ts
const repetidos = titulosDuplicados();
if (repetidos.length) throw new Error(`Títulos repetidos: ${repetidos.join(" · ")}`);
```

O título é a chave de idempotência; repetido, um prompt some sem aviso.

---

## 7. Deck de slides

**Nunca escrever o deck à mão.** Gere de `gerar-deck.ts`, que lê o banco.

### Componentes obrigatórios por tipo de slide

| Conteúdo | Blocos a usar |
|---|---|
| Comparação (faz/não faz, antes/depois) | `grid2` com dois `card`, o segundo com `background:var(--indigo-soft)` |
| Termo técnico | `traduzindo` com `<div class="t">📖 Traduzindo: …</div>` |
| Prompt | `prompt p12` + `prompt-acoes[data-prompt-txt]` |
| Lista de itens | `card` com `<ul>` — nunca `<p>` solto |
| Alerta | `atencao`; dica → `dica` |
| Checklist | `chk` dentro de `dica` |
| Cronômetro | `sl-crono` com `.num[data-seconds]` |

### O runtime

Copie `runtime-deck.js` (extraído do deck de Educadores). Ele entrega:

- **Prompt preenchível**: `[VARIÁVEL]` vira campo; repetidos sincronizam
- **Botões de IA**: levam o prompt **já preenchido** (Gemini, ChatGPT, DeepSeek, NotebookLM)
- **Cópia com plano B**: `file://` não é contexto seguro — sem fallback a cópia falha calada
- **Cronômetro**: lê `data-seconds` do slide, com pausar/continuar
- **Navegação**: setas, grade (G), tela cheia (F), miniaturas

### Bugs que o deck antigo tinha (não repetir)

1. `let left=300` fixo → desafio de 20 min rodava 5, e o mostrador saltava de `20:00` para `04:59`
2. `navigator.clipboard` sem `catch` → cópia falhava em silêncio sob `file://`
3. `last` capturado sem `onclick` → botão morto
4. Botão do Gemini abria sem copiar o prompt antes

---

## 8. Checklist de aceite

Nenhum item é opcional. Marque só o que **mediu**.

**Isolamento**
- [ ] Os 7 modelos com `courseId` preenchido
- [ ] Teste de vazamento: cada curso vê só o que semeou
- [ ] As 7 rotas do aluno propagam `?curso=`
- [ ] Curso vinculado a um `Plan` (senão: "Acesso indisponível")
- [ ] Curso de referência **inalterado** (conferir contagens antes/depois)

**Conteúdo**
- [ ] Média de caracteres por lição ≥ a da referência
- [ ] `TEORIA` ≤ 30% das lições
- [ ] Toda lição com `capituloRef`
- [ ] 0% de slides duplicados
- [ ] Nenhum parágrafo copiado da apostila

**Deck**
- [ ] `card` > 0 (comparar com a referência)
- [ ] `prompt-acoes` > 0 e campos aparecem na tela
- [ ] Botões de IA presentes e levando o prompt
- [ ] Cronômetro respeita `data-seconds` — **medir**: `20:00 → 19:58`
- [ ] Botão "último slide" funciona

**Ferramentas**
- [ ] Toda `AiTool` com faixa, limite, `verificadoEm` e fonte
- [ ] Nenhuma ferramenta descontinuada
- [ ] Caminho gratuito declarado onde o recurso é pago

**Materiais**
- [ ] Apostila e deck gerados **do banco**
- [ ] PDFs regerados após qualquer mudança
- [ ] PDF da apostila < 15 MB (comprimir imagens se passar)

**Técnico**
- [ ] `tsc --noEmit` limpo em `apps/web` e `packages/db`
- [ ] Sem rolagem horizontal em 360/390/768/1024/1280/1440/1920/2560
- [ ] Curso nasce `publicado: false`

---

## 9. Arquivos de referência

```
packages/db/prisma/
├── seed-empreendedores.ts              o seed completo, com o vínculo de plano
└── empreendedores/
    ├── modulos.ts                      estrutura + lições principais
    ├── modulos-extras.ts               lições que completam os módulos
    ├── prompts*.ts                     170 prompts em 6 arquivos temáticos
    ├── prompts-todos.ts                junta e valida duplicatas
    ├── ferramentas.ts                  catálogo com faixa e data
    ├── apostila.ts                     capítulos de consulta
    ├── conhecimento.ts                 verbetes, conquistas, missões
    ├── roteiros.ts                     gera LessonScript das lições
    ├── gerar-deck.ts                   gera o deck .html do banco
    ├── gerar-pdf.ts                    gera a apostila do banco
    └── runtime-deck.js                 runtime do deck (copiado de Educadores)

apps/web/src/
├── server/curso-ativo.ts               resolverCursoAtivo() e doCurso()
├── lib/cursos.ts                       slugs e PDF por curso
└── components/players-negocio.tsx      LABORATORIO, ANTES_DEPOIS, FLUXO, PROJETO
```

## 10. Comandos

```bash
pnpm db:up                                          # Postgres
pnpm --filter @aprender/db deploy                   # migrações
pnpm --filter @aprender/db seed                     # Educadores
pnpm --filter @aprender/db seed:empreendedores      # Empreendedores
pnpm --filter @aprender/db apostila:empreendedores  # apostila do banco
pnpm --filter @aprender/db deck:empreendedores      # deck do banco
```
