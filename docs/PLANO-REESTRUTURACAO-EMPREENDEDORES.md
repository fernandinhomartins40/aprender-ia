# Plano de reestruturação pedagógica — IA para Empreendedores

**Data:** 20/09/2026
**Especificação obrigatória:** [`PADRAO-NOVO-CURSO.md`](./PADRAO-NOVO-CURSO.md)
**Status:** plano para aprovação. Nenhum conteúdo alterado ainda.

---

## 0. O diagnóstico em uma frase

O curso tem volume e variedade — 124 lições, 15 tipos contra 9 do
Educadores. O que falta não é conteúdo: é o aluno **operar a ferramenta**.

A medição que mostra isso:

> **12 das 124 lições (10%) contêm passo a passo de uma ferramenta.**
> As outras 112 falam *sobre* IA.

Uma pessoa que termina o curso hoje sabe o que é alucinação, o que é um
agente e por que a restrição importa. O que ela não fez foi abrir o
ChatGPT e criar um Projeto, subir uma planilha e receber a análise, ou
montar uma automação que rode.

---

## ETAPA 1 — Classificação das 124 lições

### Resumo

| Decisão | Lições | Por quê |
|---|---:|---|
| **MANTER** | 61 | Já fazem o aluno produzir ou decidir |
| **MELHORAR** | 34 | Boas, mas param antes do "faça agora" |
| **SUBSTITUIR** | 12 | Teoria que deveria ser prática |
| **FUNDIR** | 13 | Repetem a mesma ideia com outro rótulo |
| **REMOVER** | 4 | Não sobrevivem ao teste da regra de ouro |

### Os quatro problemas estruturais

**1. Sequências de teoria — cinco módulos violam a regra de variedade**

| Módulo | Sequência | Teorias seguidas |
|---|---|---:|
| M6 Imagens | `TEOR LABO DUEL CACA LABO TEOR TEOR TEOR TEOR LABO NO_C` | **4** |
| M4 ChatGPT | `AQUE TEOR TEOR TEOR DUEL LABO CACA NO_C ANTE CHEC` | **3** |
| M9 Dados | `AQUE TEOR TEOR TEOR ANTE CASO LABO CACA NO_C DUEL CHEC` | **3** |
| M1 Fundamentos | `AQUE TEOR TEOR QUIZ …` | 2 |
| M7 Vídeo | `… TEOR TEOR DUEL NO_C CHEC` | 2 |

**2. O M3 tem seis `ANTES_DEPOIS` em sequência.** Não viola a letra da
regra (não é TEORIA), mas viola o espírito: seis lições com a mesma
estrutura viram leitura contínua. É o vício com outro rótulo — o próprio
briefing alerta contra isso.

**3. Ferramentas ensinadas sem serem operadas.** As 10 estão cadastradas
com `faixaAcesso`, `limiteGratuito`, `verificadoEm` e `fonteUrl` — o
padrão cumprido. Mas nenhuma tem a ficha completa que o Educadores usa:
o que é, quando usar, quando NÃO usar, demonstração, faça agora.

**4. O projeto final é do último módulo.** As 8 seções são preenchidas de
uma vez no M14. O briefing pede construção transversal — o aluno
acrescenta a cada módulo.

### Classificação por módulo

#### M1 — IA sem complicação (11 lições)

| # | Tipo | Lição | Decisão | Motivo |
|---|---|---|---|---|
| 1 | AQUECIMENTO | O que a IA já faria por você | **MELHORAR** | A pergunta é boa, mas a resposta se perde. Deve alimentar o projeto transversal |
| 2 | TEORIA | O que é IA generativa | MANTER | Metáfora do teclado funciona |
| 3 | TEORIA | Quando a IA inventa | **FUNDIR** com #2 | Alucinação é consequência do que a #2 explica; separadas viram duas leituras |
| 4 | QUIZ | O que dá e o que não dá | MANTER | Único quiz do curso |
| 5 | CACA_ERRO | Orçamento com dado inventado | MANTER | Exemplar do tipo |
| 6 | TEORIA | Escolher a ferramenta | **REMOVER** | Duplica o M13 inteiro, que é sobre isso |
| 7 | CASO | Norma que não existe | **FUNDIR** com #5 | Mesmo aprendizado, mesmo cenário de orçamento |
| 8 | NO_CELULAR | Primeira conversa | MANTER | Faz abrir a ferramenta |
| 9 | TEORIA | O que nunca colar | **MELHORAR** | Vira `FAÇA AGORA`: anonimizar um texto real |
| 10 | DUELO | Com e sem contexto | MANTER | |
| 11 | CHECKPOINT | | **MELHORAR** | Deve registrar a dor principal no projeto |

#### M2 — Como pedir (9 lições) — **o módulo mais bem resolvido**

Todas **MANTER**, exceto #6 (*Como pedir de novo*) → **MELHORAR**: a
lista de frases é boa e deveria ser praticada, não lida.

#### M3 — IA no dia a dia (14 lições)

Seis `ANTES_DEPOIS` seguidos. Decisão: **manter 3, fundir 3**.

| Lições | Decisão |
|---|---|
| WhatsApp, Orçamento, Reclamação | **MANTER** — as três dores mais citadas |
| Anúncio + Reunião + Contrato + Resumir | **FUNDIR em 2** e converter uma em `LABORATORIO` |
| 3 CASOS + CACA + DESAFIO + CHECK | MANTER |

#### M4 — ChatGPT além da conversa (10 lições)

| # | Lição | Decisão | Motivo |
|---|---|---|---|
| 2 | Anexar arquivo | **MELHORAR** | Tem passo a passo, falta o `FAÇA AGORA` com arquivo real |
| 3 | Delegar um trabalho | **MANTER** | |
| 4 | Memória e instruções | **SUBSTITUIR** por `PROMPT` | Configurar é fazer, não ler |
| — | **NOVO: Projects** | **CRIAR** | Pesquisa 2026: recurso central, não ensinado |
| — | **NOVO: Canvas** | **CRIAR** | Editar junto com a IA — não ensinado |

#### M5 — Delegar (6 lições) → **FUNDIR com M4**

Os dois módulos ensinam a mesma coisa. Juntos viram um módulo de 12
lições com o "Momento Ferramenta" do ChatGPT completo.

#### M6 — Imagens (11 lições) — **o pior caso**

Quatro teorias seguidas: *As oito partes*, *Editar*, *Referência*,
*Consistência*, *Texto na imagem*.

| Decisão | O quê |
|---|---|
| **MANTER 1 teoria** | As oito partes (é a estrutura) |
| **SUBSTITUIR 3 teorias por LABORATÓRIOS** | Editar / Referência / Consistência viram prática |
| **CRIAR** | Templates de foto de produto e flyer (recurso 2026) |
| **CRIAR** | Um `FLUXO`: da foto ruim ao post pronto |

#### M7 — Vídeo (9 lições) — **reconstruir**

O briefing pede o processo inteiro: IDEIA → ROTEIRO → CENAS → IMAGENS →
GERAÇÃO → NARRAÇÃO → LEGENDA → VÍDEO. Hoje há 1 `FLUXO` e 2 teorias.

Vira: 1 `FLUXO` (o processo) + 1 `LABORATORIO` longo em 8 etapas
("vídeo de 15 segundos anunciando um produto") + os casos existentes.

#### M8–M14

| Módulo | Decisão principal |
|---|---|
| M8 Documentos e planilhas | **MELHORAR** — falta ChatGPT no Sheets (recurso 2026) |
| M9 Dados | **SUBSTITUIR** 2 das 3 teorias seguidas por oficina com planilha didática |
| M10 NotebookLM | **MELHORAR** — o laboratório existe, falta o caso do funcionário novo consultando |
| M11 Automação | **MELHORAR** — falta criar **uma automação que rode**, não só o desenho |
| M12 Agentes | **CRIAR** a atividade "Você precisa mesmo de um agente?" |
| M13 Qual IA usar | MANTER + absorver a lição removida do M1 |
| M14 Projeto | **SUBSTITUIR** pelo formato transversal |

---

## ETAPA 2 — Experiências ausentes

Comparando com o Educadores e com o padrão:

| Experiência | Educadores | Empreendedores | Ação |
|---|---|---|---|
| Ficha de ferramenta completa | 6 fichas | **0** | Criar `FERRAMENTA` como formato |
| Projeto construído ao longo | — | 1 lição no fim | Transversal |
| Planilha didática para praticar | — | **0** | Criar e anexar |
| Automação que roda de verdade | — | **0** (só desenho) | Criar no M11 |
| Prompts por lição | 8 | 25 | Manter — já supera |

**O que o Empreendedores já faz melhor** e deve ser preservado:
`LABORATORIO` com entrega salva (16 contra 0), `ANTES_DEPOIS` (10
contra 0), `FLUXO` (3 contra 0).

---

## ETAPA 3 — Pesquisa de ferramentas (20/09/2026)

Cinco achados que **mudam o conteúdo planejado**:

| Achado | Impacto |
|---|---|
| **ChatGPT Projects** — chats, arquivos e instruções juntos, com memória própria | Módulo novo. É o recurso que mais economiza tempo de quem repete contexto |
| **ChatGPT Canvas** — espaço de edição lado a lado | Lição nova: editar junto, não pedir e recopiar |
| **ChatGPT para Excel e Sheets** (Business) | Corrige o M8: hoje ensina só o caminho via CSV |
| **Images 2.5: Templates, comentários na imagem, Sketch** | Corrige o M6: templates de foto de produto e flyer |
| **Claude cria Excel, Word, PowerPoint e PDF para baixar** | Corrige o M4/M5: "delegar" passa a ter entregável |
| **Google Flow: 50 créditos/dia grátis** | **Corrige erro atual do curso**, que diz "~10 gerações/mês" |

O curso diz hoje que o Veo dá "cerca de 10 gerações por mês em conta
comum". A documentação de 2026 fala em **50 créditos por dia no Flow**.
É o tipo de dado que o padrão manda datar — e que envelheceu em um dia.

---

## ETAPA 4 — Nova matriz por módulo

Formato: **objetivo → problema empresarial → ferramenta → habilidade →
tipo → atividade → entrega → apostila**.

### M1 — Por onde começa o seu tempo (8 lições, era 11)

| | |
|---|---|
| **Objetivo** | Tirar o medo e escolher a tarefa que será trabalhada no curso inteiro |
| **Problema** | "Não sei se dá para confiar" + "não sei por onde começar" |
| **Ferramenta** | ChatGPT ou Gemini (a que o aluno já tem) |
| **Habilidade** | Reconhecer alucinação; anonimizar antes de colar |
| **Entrega** | **A dor principal, registrada no projeto** |
| **Apostila** | Cap. 1 |

Sequência: `AQUECIMENTO → TEORIA → CACA_ERRO → QUIZ → NO_CELULAR → PROMPT(anonimizar) → DUELO → CHECKPOINT`

### M2 — Como pedir (9 lições, sem mudança estrutural)

Entrega: **3 prompts próprios salvos no projeto**. Apostila Cap. 2.

### M3 — As tarefas da sua semana (11 lições, era 14)

Entrega: **resposta + orçamento + procedimento**, prontos para usar.

### M4 — ChatGPT a fundo (12 lições, funde M4+M5)

| | |
|---|---|
| **Ferramenta** | ChatGPT: arquivos, Projects, Canvas, trabalho delegado |
| **Habilidade** | Delegar trabalho de várias etapas com ponto de parada |
| **Atividade** | Criar um Projeto do próprio negócio, com instruções e arquivos |
| **Entrega** | **Um Projeto configurado + um trabalho delegado e revisado** |

Inclui a **ficha de ferramenta** completa do ChatGPT.

### M5 — Imagens (12 lições, era 11 — mas 3 teorias viram laboratórios)

Entrega: **foto de produto + post + material com texto**, os três usáveis.

### M6 — Vídeo (9 lições, reconstruído)

Entrega: **um vídeo de 15 segundos publicado ou pronto**.

### M7 — Documentos e planilhas · M8 — Dados (18 lições)

Entrega: **uma planilha de controle + uma decisão tomada com números**.

### M9 — NotebookLM (9 lições) · M10 — Automação (10) · M11 — Agentes (9)

Entregas: **base montada**, **automação rodando**, **agente com regras
testadas**.

### M12 — Qual IA usar (8) · M13 — Projeto (transversal)

---

## ETAPA 5 — Métricas: antes e meta

| Métrica | Hoje | Meta | Como medir |
|---|---:|---:|---|
| Lições | 124 | ~126 | contagem |
| **% TEORIA** | **25%** | **≤ 18%** | por tipo |
| **Teorias seguidas (máx.)** | **4** | **1** | sequência por módulo |
| **Lições com passo a passo de ferramenta** | **12 (10%)** | **≥ 40 (32%)** | regex no conteúdo |
| **Fichas de ferramenta completas** | **0** | **8** | formato novo |
| LABORATORIO | 16 | 24 | por tipo |
| CASO | 11 | 13 | por tipo |
| DUELO | 10 | 12 | por tipo |
| CACA_ERRO | 9 | 11 | por tipo |
| FLUXO | 3 | 6 | por tipo |
| NO_CELULAR | 11 | 16 | por tipo |
| Prompts no banco | 170 | 170 | meta do padrão, já cumprida |
| Prompts preenchíveis no deck | 35 | ≥ 35 | contagem CSS |
| Ferramentas ensinadas | 10 | 12 | `AiTool` do curso |
| **Entregas produzidas pelo aluno** | **19** | **26** | lições com `campos` |
| Duplicação no deck | 0% | 0% | script do padrão |
| Vazamento entre cursos | 0 | 0 | teste do padrão |

**A métrica que define o sucesso** é a terceira: lições em que o aluno
opera a ferramenta. De 10% para 32%.

---

## ETAPA 6 — Ordem de implementação

Um módulo por vez, com os 12 passos do briefing. Ordem escolhida pelo
tamanho do problema, não pela numeração:

| # | Módulo | Por que primeiro |
|---|---|---|
| 1 | **M6 Imagens** | Pior caso: 4 teorias seguidas |
| 2 | **M4+M5 ChatGPT** | Funde dois módulos e traz Projects e Canvas |
| 3 | **M7 Vídeo** | Reconstrução completa |
| 4 | **M9 Dados** | 3 teorias seguidas + planilha didática |
| 5 | **M11 Automação** | Criar a automação que roda |
| 6 | **M1** | Fundir, remover, ligar ao projeto |
| 7 | **M3** | Fundir os ANTES_DEPOIS |
| 8 | **M14 → transversal** | Depende de todos os outros |
| 9 | **M8, M10, M12, M13** | Ajustes menores |

Após cada módulo: regenerar deck e apostila, rodar os testes do padrão,
comparar componentes com o Educadores.

---

## O que NÃO será feito

- **Não recriar do zero.** 61 lições ficam como estão.
- **Não alterar o curso de Educadores.**
- **Não inflar métrica.** O total sobe de 124 para ~126: a mudança é de
  natureza, não de volume.
- **Não renomear teoria como laboratório.** Substituir significa
  reescrever a lição como prática, com campos de entrega.
- **Não criar componentes paralelos.** Os 15 tipos e os blocos do deck
  já existem. O único formato novo é a ficha de ferramenta, e ela se
  monta com `card`, `grid2`, `selo` e `prompt-acoes` existentes.

---

## Fontes da pesquisa (20/09/2026)

- [Projects in ChatGPT](https://help.openai.com/en/articles/10169521-projects-in-chatgpt)
- [ChatGPT Capabilities Overview](https://help.openai.com/en/articles/9260256-chatgpt-capabilities-overview)
- [More ways to work with your team and tools in ChatGPT](https://openai.com/index/more-ways-to-work-with-your-team/)
- [Introducing ChatGPT Images 2.5](https://openai.com/index/introducing-chatgpt-images-2-5/)
- [Images in ChatGPT](https://help.openai.com/en/articles/11084440-images-in-chatgpt)
- [Veo 3.1 — Google DeepMind](https://deepmind.google/models/veo/)
- [Google Flow — créditos diários](https://support.google.com/googleone/thread/450387797/)
- [What are projects? — Claude](https://support.claude.com/en/articles/9517075-what-are-projects)
- [Create and edit files with Claude](https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude)
- [What are skills? — Claude](https://support.claude.com/en/articles/12512176-what-are-skills)
