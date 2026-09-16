# Roteiros da aula

O roteiro que o professor projeta em **Apresentar aula** é **conteúdo do curso**,
não um arquivo que alguém envia pelo painel. Ele chega pronto no deploy, junto
com as lições e o banco de prompts.

## Por que não há importação

O painel já exigia que o professor encontrasse o `Slides_IA_Educadores_2026.html`
e o enviasse antes de conseguir apresentar. Isso deixava o curso dependente de
uma ação manual repetida em cada ambiente novo — e a tela ficava vazia até
alguém fazer o upload. O roteiro não muda de professor para professor: é o
mesmo curso. Logo, pertence ao conteúdo versionado.

## Como o conteúdo chega ao banco

```
deck do curso (.html)
  └─ pnpm --filter @aprender/db roteiros <caminho-do-deck.html>   (relativo a packages/db)
       └─ packages/db/prisma/roteiros-aula.ts   (gerado, versionado)
            └─ seed.ts, a cada deploy
                 └─ lesson_scripts + script_steps
```

- `prisma/extrair-roteiro.ts` — lê o deck e devolve os passos por encontro.
- `prisma/gerar-roteiros.ts` — grava o resultado em `roteiros-aula.ts`.
- `prisma/roteiros-aula.ts` — **gerado; não edite à mão.**

## Atualizar o roteiro quando o curso mudar

1. Edite o deck em `cursos/Curso_IA_Educadores_v2/`.
2. Lá, rode `node montar_slides.js` para remontar o HTML.
3. Aqui:

```bash
pnpm --filter @aprender/db roteiros \
  ../../../cursos/Curso_IA_Educadores_v2/Slides_IA_Educadores_2026.html
```

4. Commite `roteiros-aula.ts`. O deploy seguinte grava os passos no banco.

O seed pula a execução quando nada mudou (hash do arquivo compilado). Como o
esbuild empacota `roteiros-aula.ts`, alterar o roteiro já muda o hash e o seed
roda sozinho.

## O progresso dos alunos é preservado

Os passos são atualizados por `(scriptId, ordem)`, nunca apagados e recriados.
`StepProgress` cascateia de `ScriptStep`: regravar do zero apagaria o que os
alunos marcaram e digitaram nas aulas já dadas. Só saem do banco os passos
excedentes, quando o deck encurta.

## O slide, e não uma remontagem dele

Projetor e celular desenham **o slide do deck**, com o CSS do deck. Não há uma
segunda versão do curso em JSX para manter sincronizada com a primeira: o que
muda no deck aparece nos dois lugares no deploy seguinte.

| Peça | O que é |
|---|---|
| `script_steps.html` | O slide como está no deck, gerado pelo extrator |
| `apps/web/src/app/slide-curso.css` | O CSS do deck, escopado sob `.palco-slide` (**derivado**) |
| `scripts/derivar-css-slide.mjs` | Quem gera esse CSS a partir do `slides_base.css` |
| `components/palco-slide.tsx` | Desenha o slide e religa as interações |

Quando o **visual** do deck mudar, regere também o CSS:

```bash
node scripts/derivar-css-slide.mjs   ../cursos/Curso_IA_Educadores_v2/slides_base.css
```

### O que o palco religa

O deck fazia isto em JavaScript solto, e o palco refaz sobre o DOM montado:

- **Cronômetro** das atividades — botões Iniciar/Zerar, barra de espaço e Z
- **Campos `[ ]` do prompt** — viram caixas de digitação; campos de mesmo nome
  andam juntos, e os botões de IA passam a levar o texto preenchido
- **Botões de IA** — ChatGPT, Gemini, DeepSeek e NotebookLM, com o prompt na
  URL onde a ferramenta aceita
- **Checklist clicável** — e, na tela do aluno, o que ele marca sobe para o
  painel do professor

O palco escreve o HTML ele mesmo (`innerHTML`), em vez de
`dangerouslySetInnerHTML`: os botões e campos acrescentados são nós que o React
não conhece, e com o conteúdo sob controle dele a primeira re-renderização os
apagava.

### O mesmo slide em duas telas

O palco tem 1280x720 fixos e é **escalado** para caber no espaço.

- **Tela larga** (projetor, computador): o slide inteiro cabe, como no deck.
- **Celular em pé**: encaixá-lo inteiro poria o corpo do texto em 4px. Abaixo de
  uma escala mínima de leitura o slide cresce até alcançá-la e a caixa passa a
  rolar. Girar 90° foi tentado e é pior: obriga a virar o aparelho e deixa o
  texto de lado.
