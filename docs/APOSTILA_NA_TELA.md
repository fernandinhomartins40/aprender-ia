# A apostila na tela

O aluno lê a apostila como **página**, não como PDF. O PDF continua disponível
para baixar, para quem quer imprimir ou ler sem internet.

## Por que não o PDF

O PDF tem 9 MB e 113 páginas desenhadas para papel A4. No celular, em sala,
achar "a parte que o professor está mostrando" virava uma caçada: dar zoom,
rolar, comparar. A página resolve as duas coisas — o texto se adapta à tela, e
o slide leva direto ao trecho que ele trata.

## Como o conteúdo chega ao banco

```
apostila do curso (.html)
  └─ pnpm --filter @aprender/db apostila <caminho-da-apostila.html>
       └─ packages/db/prisma/apostila.ts        (gerado, versionado)
            └─ seed.ts, a cada deploy
                 └─ handbook_chapters + handbook_sections
```

- `prisma/extrair-apostila.ts` — fatia a apostila em capítulos e seções.
- `prisma/gerar-apostila.ts` — grava o resultado em `apostila.ts`.
- `prisma/apostila.ts` — **gerado; não edite à mão.**

O CSS segue o mesmo caminho do slide: é **derivado** do estilo da apostila, e
não copiado.

```bash
node scripts/derivar-css-apostila.mjs \
  ../cursos/Curso_IA_Educadores_v2/estilo.css \
  ../cursos/Curso_IA_Educadores_v2/componentes_novos.css \
  ../cursos/Curso_IA_Educadores_v2/componentes_ferramentas.css
```

O script escopa tudo sob `.apostila-curso`, troca as medidas de papel (`pt`)
por `rem` — com o corpo da apostila valendo 1rem, para o texto acompanhar o
tamanho de fonte do aparelho — e joga fora `@page` e os blocos `@media print`.

## Atualizar quando o curso mudar

1. Edite as partes em `cursos/Curso_IA_Educadores_v2/`.
2. Lá, rode `node montar_apostila.js`.
3. Aqui:

```bash
pnpm --filter @aprender/db apostila \
  ../../../cursos/Curso_IA_Educadores_v2/Apostila_IA_Educadores_2026.html
```

4. Se o **visual** mudou, rode também o `derivar-css-apostila.mjs`.
5. Commite os arquivos gerados. O deploy seguinte grava no banco.

## Do slide ao trecho

Os slides já dizem de que parte da apostila tratam: o badge traz
"Capítulo 2.2 · O coração do curso". O extrator lê esse número, e o slide sem
badge herda o do anterior — é o que a aula faz de fato, seguir no mesmo trecho
por vários slides. Assim 92 dos 96 passos apontam para algum lugar; os 4 que
não apontam são a capa, a abertura e os aquecimentos, que não tratam de seção
nenhuma.

Alguns badges citam o capítulo inteiro ("Capítulo 11"), e não uma seção. Por
isso `ondeFica()` aceita os dois, e cai no capítulo quando a seção não existe
mais — melhor abrir o capítulo certo do que não abrir nada.

## O que muda do papel para a tela

| No papel | Na tela |
|---|---|
| Medidas em `pt`, folha de 21cm | `rem`, acompanhando a fonte do aparelho |
| Tabela larga na folha | Tabela que rola dentro da própria caixa |
| Duas colunas | Uma só, no celular |
| Quebra de página | Um respiro |
| Sumário impresso | Montado a partir dos capítulos, nunca diverge |
