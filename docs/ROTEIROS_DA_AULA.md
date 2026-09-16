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

### Dois formatos, um só conteúdo

O mesmo material serve aos dois lados da sala, em formatos diferentes.

**O professor projeta um slide.** `/apresentar/:id` mostra o palco 1280x720
escalado, como no deck, com as teclas de sempre (setas, espaço, F, G) e o
painel da turma.

**O aluno abre uma página web.** `/app/aula/1/3` é uma página de verdade: tem
endereço próprio, recarrega, o link pode ser compartilhado e o botão voltar do
aparelho funciona. Nada de carrossel — o conteúdo da página é lido por rolagem,
e a navegação acontece ENTRE páginas, no rodapé, como em qualquer curso.

```
/app/aula                 índice dos encontros
/app/aula/1               índice do Encontro 1 — as 32 páginas
/app/aula/1/3             uma página de conteúdo
```

A página não é o slide reduzido. O componente desmonta o HTML do curso: faixa,
badge e título saem do corpo e viram o cabeçalho da página; o que sobra é
conteúdo, em seções empilhadas com respiro entre elas.

| No palco | Na página |
|---|---|
| Tudo posicionado numa folha 16:9 | Cabeçalho + seções verticais |
| Grades de 2, 3 e 4 colunas | Uma coluna no celular, duas em tela média |
| Navegação por slide | Navegação entre páginas, no rodapé |
| Figura flutuando no canto | Ilustração da seção |
| Tabela larga | Rola dentro da própria caixa |

O CSS é um só: `derivar-css-slide.mjs` escopa cada regra do deck para
`.palco-slide`, `.conteudo-aula` e `.modal-prompt` ao mesmo tempo. Mudar uma
cor no deck muda nos três.

### Durante a aula

Quando o professor avança no projetor, a página do aluno acompanha — mas só
enquanto ele não decide olhar outra coisa. No instante em que o aluno navega
por conta própria, o "seguir" se desliga e vira um convite discreto
("o professor está na página 12 · Acompanhar"), porque arrastar alguém para
fora do que está lendo é pior do que deixá-lo perdido por um momento.

### O banco de prompts

O slide "Banco de 15 prompts prontos" tem 15 cards que abrem o prompt completo
num modal, já copiado, com os campos `[ ]` preenchíveis e os botões das IAs.
Os cards guardam só o índice (`data-prompt="7"`); os textos vêm de
`PROMPTS_DO_BANCO`, extraído do deck junto com o roteiro. O modal serve aos
dois lados: o professor demonstra no projetor, o aluno usa na página.
