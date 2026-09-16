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
