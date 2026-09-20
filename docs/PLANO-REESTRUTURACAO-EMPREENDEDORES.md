# Plano de reestruturação pedagógica — IA para Empreendedores

**Data:** 20/09/2026
**Especificação obrigatória:** [`PADRAO-NOVO-CURSO.md`](./PADRAO-NOVO-CURSO.md)
**Status:** plano para aprovação. Nenhum conteúdo alterado.

> **Nota sobre esta versão.** A primeira versão deste plano classificou
> 23 das 124 lições e agrupou o resto em blocos. Isso não é o que foi
> pedido, e escondia o problema dos módulos M8 a M14 — 50 lições sem
> análise nenhuma. Esta versão classifica **as 124, uma a uma**.

---

## 0. O diagnóstico

O curso tem volume e variedade: 124 lições e 15 tipos, contra 82 e 9 do
Educadores. O problema não é quantidade — é o que você já disse.

A medição que mostra onde está:

> **12 das 124 lições (10%) contêm passo a passo de ferramenta.**
> As outras 112 falam *sobre* IA.

Quem termina o curso hoje sabe o que é alucinação, o que é um agente e
por que a restrição importa. Não abriu o ChatGPT para criar um Projeto,
não subiu uma planilha para receber a análise, não montou uma automação
que rode. A regra de ouro do briefing — *"o que ele conseguirá FAZER
depois desta aula?"* — é reprovada em 112 lições.

### Os quatro problemas estruturais

**1. Cinco módulos violam a regra de variedade.**

| Módulo | Sequência | Teorias seguidas |
|---|---|---:|
| M6 Imagens | `TEOR LABO DUEL CACA LABO **TEOR TEOR TEOR TEOR** LABO NO_C` | **4** |
| M4 ChatGPT | `AQUE **TEOR TEOR TEOR** DUEL LABO CACA NO_C ANTE CHEC` | **3** |
| M9 Dados | `AQUE **TEOR TEOR TEOR** ANTE CASO LABO CACA NO_C DUEL CHEC` | **3** |
| M1 | `AQUE **TEOR TEOR** QUIZ …` | 2 |
| M7 Vídeo | `… **TEOR TEOR** DUEL NO_C CHEC` | 2 |

**2. O M3 tem seis `ANTES_DEPOIS` em sequência.** Não é TEORIA, mas é o
mesmo vício com outro rótulo — seis lições de estrutura idêntica viram
leitura contínua.

**3. Nenhuma ficha de ferramenta.** As 10 ferramentas têm `faixaAcesso`,
`limiteGratuito`, `verificadoEm` e `fonteUrl` — o padrão cumprido. Mas
falta o "Momento Ferramenta": o que é, para que serve, quando usar,
quando NÃO usar, demonstração, faça agora, exercício, atalho.

**4. O projeto é do último módulo.** As 8 seções são preenchidas de uma
vez no M14, em vez de crescerem ao longo do curso.

---

## ETAPA 1 — Classificação das 124 lições

**Legenda:** MANTER · MELHORAR (falta o "faça agora") · SUBSTITUIR
(teoria que deve virar prática) · FUNDIR · REMOVER

### M1 — IA sem complicação (11 → 9)

| # | Tipo | Lição | Decisão | Motivo |
|---|---|---|---|---|
| 1 | AQUECIMENTO | O que a IA já faria por você | MELHORAR | A pergunta certa existe; a resposta se perde. Deve gravar a dor no projeto transversal |
| 2 | TEORIA | O que é IA generativa | MANTER | Metáfora do teclado funciona |
| 3 | TEORIA | Quando a IA inventa | FUNDIR c/ 2 | Alucinação é consequência do que a 2 explica |
| 4 | QUIZ | O que dá e o que não dá | MANTER | Único quiz do curso |
| 5 | CACA_ERRO | Orçamento com dado inventado | MANTER | Exemplar do tipo |
| 6 | TEORIA | Escolher a ferramenta | REMOVER | Duplica o M13 inteiro |
| 7 | CASO | Norma que não existe | FUNDIR c/ 5 | Mesmo aprendizado, mesmo cenário |
| 8 | NO_CELULAR | Primeira conversa | MANTER | Faz abrir a ferramenta |
| 9 | TEORIA | O que nunca colar | SUBSTITUIR → PROMPT | Anonimizar é fazer, não ler |
| 10 | DUELO | Com e sem contexto | MANTER | |
| 11 | CHECKPOINT | | MELHORAR | Registrar a dor no projeto |

### M2 — Como pedir (9 → 9) — o módulo mais bem resolvido

| # | Tipo | Lição | Decisão | Motivo |
|---|---|---|---|---|
| 1 | AQUECIMENTO | Por que a resposta veio genérica | MANTER | |
| 2 | TEORIA | C.O.F.R.E. | MANTER | Estrutura do curso |
| 3 | DUELO | O mesmo pedido, dois resultados | MANTER | É o duelo que o briefing pede |
| 4 | LABORATORIO | LAB 01 · cliente difícil | MANTER | |
| 5 | CACA_ERRO | O prompt que parece bom | MANTER | |
| 6 | TEORIA | Como pedir de novo | SUBSTITUIR → PROMPT | A lista de frases é para usar |
| 7 | PROMPT | Dar exemplo em vez de descrever | MANTER | |
| 8 | NO_CELULAR | Reescreva uma mensagem | MANTER | |
| 9 | CHECKPOINT | | MELHORAR | Salvar 3 prompts no projeto |

### M3 — IA no dia a dia (14 → 11)

| # | Tipo | Lição | Decisão | Motivo |
|---|---|---|---|---|
| 1 | ANTES_DEPOIS | WhatsApp | MANTER | Dor nº 1 |
| 2 | CASO | A loja do WhatsApp | MANTER | |
| 3 | LABORATORIO | LAB · procedimento | MANTER | |
| 4 | ANTES_DEPOIS | Orçamento e proposta | MELHORAR | Vira **LAB 02: orçamento sem inventar dados** |
| 5 | CASO | O salão sem tempo de postar | MANTER | |
| 6 | CACA_ERRO | Resposta automática | MANTER | |
| 7 | DESAFIO | Dez minutos | MANTER | |
| 8 | ANTES_DEPOIS | Reclamação | MANTER | Dor nº 2 |
| 9 | ANTES_DEPOIS | Anúncio e campanha | MELHORAR | Vira **LAB 03: campanha de WhatsApp** |
| 10 | ANTES_DEPOIS | Reunião | FUNDIR c/ 11 | |
| 11 | ANTES_DEPOIS | Contrato | FUNDIR c/ 10 → **LAB 07: documento empresarial** | |
| 12 | ANTES_DEPOIS | Resumir documento | FUNDIR c/ M10 | Pertence ao NotebookLM |
| 13 | CASO | O prestador que demorava | MANTER | |
| 14 | CHECKPOINT | | MELHORAR | Registrar tarefas repetitivas no projeto |

### M4 + M5 — ChatGPT (16 → 13, fundidos)

Os dois ensinam delegar. Fundidos, viram o módulo com a ficha completa.

| # | Origem | Lição | Decisão | Motivo |
|---|---|---|---|---|
| 1 | M4-1 | O que você não experimentou | MANTER | |
| 2 | M4-2 | Anexar arquivo | MELHORAR | Tem passo a passo; falta "faça agora" com arquivo real |
| 3 | M4-3 | Delegar um trabalho | FUNDIR c/ M5-1 | Mesma lição em dois módulos |
| 4 | M4-4 | Memória e instruções | SUBSTITUIR → PROMPT | Configurar é fazer |
| 5 | M4-5 | DUELO resposta × trabalho | FUNDIR c/ M5-5 | Dois duelos do mesmo tema |
| 6 | M4-6 | LAB · delegue de verdade | MANTER | |
| 7 | M4-7 | CACA · relatório inventado | MANTER | |
| 8 | M4-8 | NO_CELULAR · anexe | MANTER | |
| 9 | M4-9 | ANTES_DEPOIS · e-mail difícil | MANTER | |
| 10 | M4-10 | CHECKPOINT | MELHORAR | |
| 11 | M5-2 | LAB 03 · várias etapas | FUNDIR c/ M4-6 | |
| 12 | M5-3 | CASO · delegou sem revisar | MANTER | |
| 13 | M5-4 | O que a IA precisa ter | SUBSTITUIR → FLUXO | Vira o fluxo do trabalho delegado |
| 14 | M5-6 | NO_CELULAR · peça um trabalho | FUNDIR c/ M4-8 | |
| — | **novo** | **FERRAMENTA: ChatGPT** | CRIAR | Ficha completa |
| — | **novo** | **Projects** | CRIAR | Recurso 2026 não ensinado |
| — | **novo** | **Canvas** | CRIAR | Recurso 2026 não ensinado |
| — | **novo** | **LAB: delegar com entregável** | CRIAR | Relatório + apresentação, exemplo do briefing |

### M6 — Imagens (11 → 13) — o pior caso

| # | Tipo | Lição | Decisão | Motivo |
|---|---|---|---|---|
| 1 | TEORIA | As oito partes | MANTER | É a estrutura |
| 2 | LABORATORIO | LAB 04 · foto do produto | MANTER | |
| 3 | DUELO | Vago × específico | MANTER | |
| 4 | CACA_ERRO | Imagem que não pode publicar | MANTER | |
| 5 | LABORATORIO | Fundo transparente | MANTER | |
| 6 | TEORIA | Editar em vez de gerar | **SUBSTITUIR → LABORATORIO** | Editar é fazer |
| 7 | TEORIA | Usar referência | **SUBSTITUIR → LABORATORIO** | |
| 8 | TEORIA | Consistência visual | **SUBSTITUIR → LABORATORIO** | Gerar 4 variações |
| 9 | TEORIA | Texto na imagem | FUNDIR c/ 1 | É uma das oito restrições |
| 10 | LABORATORIO | Cardápio | MANTER | |
| 11 | NO_CELULAR | Melhore uma foto | MANTER | |
| — | **novo** | **FERRAMENTA: ChatGPT Imagens** | CRIAR | Ficha + Templates (2026) |
| — | **novo** | **FLUXO: da foto ruim ao post** | CRIAR | |
| — | **novo** | **LAB: post, story e banner** | CRIAR | Formatos do briefing |

### M7 — Vídeo (9 → 10, reconstruído)

| # | Tipo | Lição | Decisão | Motivo |
|---|---|---|---|---|
| 1 | FLUXO | O caminho de um vídeo | MELHORAR | Ampliar às 8 etapas do briefing |
| 2 | TEORIA | O que dá e o que não dá | MANTER | Evita frustração |
| 3 | LABORATORIO | Primeiro vídeo | **SUBSTITUIR** | Vira **LAB 05: vídeo de 15s anunciando um produto**, em 8 etapas |
| 4 | CASO | Propaganda que prometeu demais | MANTER | |
| 5 | TEORIA | Seis tipos de vídeo | MELHORAR | Vira card comparativo, não leitura |
| 6 | TEORIA | Gravar com celular | SUBSTITUIR → NO_CELULAR | Gravar é fazer |
| 7 | DUELO | Vende × ensina | MANTER | |
| 8 | NO_CELULAR | Grave 30 segundos | FUNDIR c/ 6 | |
| 9 | CHECKPOINT | | MANTER | |
| — | **novo** | **FERRAMENTA: Flow/Veo** | CRIAR | Ficha + corrigir o limite |

### M8 — Documentos e planilhas (6 → 10)

| # | Tipo | Lição | Decisão | Motivo |
|---|---|---|---|---|
| 1 | TEORIA | Caminho gratuito e pago | MANTER | Honestidade sobre preço |
| 2 | LABORATORIO | LAB 05 · seus números | FUNDIR c/ M9-7 | Duplica o laboratório do M9 |
| 3 | PROMPT | Fazer a IA ler a planilha | MANTER | |
| 4 | CACA_ERRO | Análise que inventou | FUNDIR c/ M9-8 | Duplica |
| 5 | NO_CELULAR | Exporte e pergunte | FUNDIR c/ M9-9 | Duplica |
| 6 | LABORATORIO | A planilha que você não tinha | MANTER | |
| — | **novo** | **FERRAMENTA: Gemini no Docs** | CRIAR | Ficha |
| — | **novo** | **LAB: proposta no Docs** | CRIAR | Briefing: proposta, relatório, revisão |
| — | **novo** | **LAB: Sheets sem fórmula** | CRIAR | Tabela dinâmica e filtros por descrição (2026) |
| — | **novo** | **ANTES_DEPOIS: do caderno à planilha** | CRIAR | |
| — | **novo** | **NO_CELULAR: Drive e Gmail** | CRIAR | |

### M9 — Dados (11 → 11)

| # | Tipo | Lição | Decisão | Motivo |
|---|---|---|---|---|
| 1 | AQUECIMENTO | A pergunta que você nunca respondeu | MANTER | |
| 2 | TEORIA | Perguntas melhores | MANTER | O teste da decisão |
| 3 | TEORIA | Vendas: o que o caixa esconde | **SUBSTITUIR → LABORATORIO** | **Oficina com a planilha didática** |
| 4 | TEORIA | Estoque e clientes | **SUBSTITUIR → LABORATORIO** | Oficina, parte 2 |
| 5 | ANTES_DEPOIS | Onde o dinheiro está indo | MANTER | |
| 6 | CASO | A loja que achava ser preço | MANTER | |
| 7 | LABORATORIO | LAB 06 · três perguntas | MELHORAR | Usar a planilha didática |
| 8 | CACA_ERRO | Análise que parecia profissional | MANTER | Os 3 erros clássicos |
| 9 | NO_CELULAR | Exporte e pergunte | MANTER | |
| 10 | DUELO | Pergunta que não muda nada | MANTER | |
| 11 | CHECKPOINT | | MELHORAR | Gravar a análise no projeto |
| — | **novo** | **FLUXO: pergunta → análise → conferência → decisão** | CRIAR | Do briefing |

### M10 — NotebookLM (9 → 10)

| # | Tipo | Lição | Decisão | Motivo |
|---|---|---|---|---|
| 1 | TEORIA | Só responde com seus arquivos | MANTER | |
| 2 | LABORATORIO | LAB 08 · base do negócio | MELHORAR | Vira **"o cérebro de documentos da sua empresa"** |
| 3 | CASO | O funcionário novo | MANTER | Caso pedido no briefing |
| 4 | TEORIA | Como escrever para a base | MELHORAR | Vira checklist prático |
| 5 | NO_CELULAR | Pergunte ao contrato | MANTER | |
| 6 | TEORIA | Sete usos | MELHORAR | Vira `grid3` de cards, não leitura |
| 7 | DUELO | Internet × seus arquivos | MANTER | |
| 8 | CACA_ERRO | Base com informação velha | MANTER | |
| 9 | CHECKPOINT | | MANTER | |
| — | **novo** | **FERRAMENTA: NotebookLM** | CRIAR | Ficha |

### M11 — Automação (8 → 11)

| # | Tipo | Lição | Decisão | Motivo |
|---|---|---|---|---|
| 1 | TEORIA | O que é automação | MANTER | Sem ferramenta, como pede o briefing |
| 2 | FLUXO | O lead que chega | MELHORAR | Acrescentar *"qual etapa você faz na mão?"* |
| 3 | LABORATORIO | LAB 09 · desenhar | MANTER | Mapear o processo |
| 4 | FLUXO | O pedido que vira trabalho | MANTER | |
| 5 | CASO | Automatizou antes de validar | MANTER | |
| 6 | CACA_ERRO | Automação que enviou sozinha | MANTER | |
| 7 | NO_CELULAR | Primeira automação | MELHORAR | Já cria uma que roda — reforçar |
| 8 | ANTES_DEPOIS | Orçamento que se repete | MANTER | |
| — | **novo** | **FERRAMENTA: Make** | CRIAR | Ficha |
| — | **novo** | **LAB 10: uma automação rodando** | CRIAR | Formulário → planilha → aviso |
| — | **novo** | **CHECKPOINT** | CRIAR | Módulo não tem fechamento |

### M12 — Agentes (8 → 10)

| # | Tipo | Lição | Decisão | Motivo |
|---|---|---|---|---|
| 1 | TEORIA | Chatbot, automação e agente | MANTER | A distinção do briefing |
| 2 | LABORATORIO | LAB 11 · regras do agente | MANTER | |
| 3 | TEORIA | Sete agentes | MELHORAR | Vira `grid3` de cards |
| 4 | DUELO | Com e sem limite | MANTER | |
| 5 | DESAFIO | Teste com perguntas difíceis | MANTER | |
| 6 | EMERGENCIA | Quando desconfiar | MOVER → M14 | É guia do curso todo |
| 7 | CASO | Agente que prometeu demais | MANTER | |
| 8 | NO_CELULAR | Escreva as regras | MANTER | |
| — | **novo** | **"Você precisa mesmo de um agente?"** | CRIAR | Atividade pedida: prompt basta? automação basta? |
| — | **novo** | **CHECKPOINT** | CRIAR | Sem fechamento |

### M13 — Qual IA usar (8 → 9)

| # | Tipo | Lição | Decisão | Motivo |
|---|---|---|---|---|
| 1 | AQUECIMENTO | A pergunta errada que todo mundo faz | MANTER | Desmonta "qual é a melhor" |
| 2 | TEORIA | O que cada uma faz melhor | MANTER | Única teoria do módulo |
| 3 | PROMPT | O mesmo pedido nas três | MANTER | O teste que o briefing pede |
| 4 | DUELO | Trocar de ferramenta × melhorar o pedido | MANTER | Corrige o erro mais comum |
| 5 | LABORATORIO | Monte a sua tabela de escolha | MELHORAR | Gravar a regra no projeto |
| 6 | EMERGENCIA | Qual abrir agora | MANTER | Guia de bolso |
| 7 | CASO | Trocou de ferramenta cinco vezes | MANTER | |
| 8 | CHECKPOINT | Escolher com critério | MANTER | |
| — | **novo** | **FERRAMENTA: Claude** | CRIAR | Ficha + criação de Excel, Word, PowerPoint e PDF (2026) |

### M14 — Projeto (4 → 6, transversal)

| # | Tipo | Lição | Decisão | Motivo |
|---|---|---|---|---|
| 1 | PROJETO | Plano de adoção | **SUBSTITUIR** | Vira consolidação do que foi gravado nos módulos |
| 2 | CHECKPOINT | O que você já mudou | MANTER | |
| 3 | TEORIA | Como um plano vira ação | MELHORAR | |
| 4 | LABORATORIO | Primeiro passo com data | MANTER | |
| — | **novo** | EMERGENCIA (vindo do M12) | MOVER | |
| — | **novo** | **CHECKPOINT final** | CRIAR | As 12 frases do critério do briefing |

### Totais

| Decisão | Lições |
|---|---:|
| MANTER | 64 |
| MELHORAR | 22 |
| SUBSTITUIR | 11 |
| FUNDIR | 16 (→ 8) |
| REMOVER | 1 |
| MOVER | 1 |
| **CRIAR** | **19** |
| **Total final** | **124 → 126** |

---

## ETAPA 2 — Experiências ausentes

| Experiência | Educadores | Empreendedores | Ação |
|---|---|---|---|
| Ficha de ferramenta ("Momento Ferramentas") | 6 | **0** | Criar 8 |
| Projeto transversal | — | 1 lição no fim | Gravar em 9 módulos |
| Planilha didática para praticar | — | **0** | Criar e anexar |
| Automação que roda | — | **0** | LAB 10 |
| Atividade "precisa mesmo de agente?" | — | **0** | Criar |
| Quadro "Traduzindo" na lição | 12 | 4 | Ampliar |

**O que o Empreendedores já faz melhor** e será preservado:
`LABORATORIO` com entrega salva (16 × 0), `ANTES_DEPOIS` (10 × 0),
`FLUXO` (3 × 0), prompts por lição (25 × 8).

---

## ETAPA 3 — Pesquisa de ferramentas (20/09/2026)

| Achado | Impacto no curso |
|---|---|
| **ChatGPT Projects** — chats, arquivos e instruções juntos, memória própria | Lição nova no M4 |
| **ChatGPT Canvas** — editar lado a lado | Lição nova no M4 |
| **ChatGPT no Excel e Sheets** (Business) | Corrige o M8 |
| **Images 2.5: Templates (flyer, foto de produto), comentários na imagem, Sketch** | Corrige o M6 |
| **Claude cria Excel, Word, PowerPoint e PDF para baixar** | "Delegar" passa a ter entregável |
| **Gemini no Sheets: tabela dinâmica, formatação condicional, filtros por descrição** | O aluno não precisa de fórmula |
| **Google Flow: 50 créditos/dia grátis** | **Corrige erro atual**: o curso diz "~10 gerações/mês" |

Todas as fichas registrarão `faixaAcesso`, `limiteGratuito`,
`verificadoEm` e `fonteUrl`, como o padrão exige.

---

## ETAPA 4 — Matriz completa

Formato do briefing: objetivo → problema → ferramenta → habilidade →
tipo → atividade → entrega → apostila.

| # | Módulo | Objetivo | Problema empresarial | Ferramenta | Habilidade | Tipos predominantes | Atividade | Entrega | Apostila |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Por onde vai o seu tempo | Tirar o medo e escolher a tarefa do curso | "Não sei se dá para confiar" | ChatGPT/Gemini | Reconhecer alucinação; anonimizar | AQUE · TEOR · CACA · QUIZ · NO_C · PROM · DUEL · CHEC | Primeira conversa + anonimizar um texto real | **Dor principal no projeto** | Cap. 1 |
| 2 | Como pedir | Pedido que devolve o que serve | Resposta genérica | ChatGPT | C.O.F.R.E. e restrições | AQUE · TEOR · DUEL · LABO · CACA · PROM · NO_C · CHEC | LAB 01 cliente difícil | **3 prompts salvos** | Cap. 2 |
| 3 | As tarefas da semana | Resolver as 5 dores mais repetidas | WhatsApp, orçamento, reclamação | ChatGPT | Adaptar prompt à tarefa | ANTE · CASO · LABO · CACA · DESA · CHEC | LAB 02 orçamento · LAB 03 campanha · LAB 07 documento | **Resposta + orçamento + procedimento** | Cap. 3 |
| 4 | ChatGPT a fundo | Delegar, não conversar | "Refaço tudo na mão" | ChatGPT (arquivos, Projects, Canvas) | Pedido de trabalho com parada | FERR · TEOR · PROM · DUEL · LABO · CACA · NO_C · ANTE · CHEC | Criar um Projeto do negócio | **Projeto configurado + trabalho revisado** | Cap. 4 |
| 5 | Imagens | Produzir material que se usa | "Minhas fotos não vendem" | ChatGPT Imagens 2.5 | Prompt visual em 8 partes; editar; consistência | FERR · TEOR · LABO×5 · DUEL · CACA · FLUX · NO_C | LAB 04 foto de produto | **Foto + post + cardápio** | Cap. 5 |
| 6 | Vídeo | Ideia → vídeo publicado | "Nunca gravei nada" | Flow/Veo · Pika · celular | As 8 etapas do processo | FERR · FLUX · TEOR · LABO · CASO · DUEL · NO_C · CHEC | LAB 05 vídeo de 15s | **Um vídeo pronto** | Cap. 6 |
| 7 | Documentos e planilhas | Trabalhar dentro do Google | "Não sei fórmula" | Gemini no Docs/Sheets/Drive | Pedir por descrição, não por fórmula | FERR · TEOR · LABO×3 · PROM · ANTE · NO_C | LAB Sheets sem fórmula | **Proposta + planilha de controle** | Cap. 7 |
| 8 | Dados | Perguntar aos próprios números | "Não sei o que perguntar" | ChatGPT/Gemini + planilha didática | Teste da decisão; separar fato de hipótese | AQUE · TEOR · LABO×3 · ANTE · CASO · CACA · FLUX · DUEL · NO_C · CHEC | Oficina com planilha didática | **Uma decisão com número** | Cap. 8 |
| 9 | NotebookLM | Montar o cérebro de documentos | "A resposta está num PDF que ninguém acha" | NotebookLM | Curadoria; conferir citação | FERR · TEOR · LABO · CASO · DUEL · CACA · NO_C · CHEC | LAB 08 base da empresa | **Base montada e testada** | Cap. 9 |
| 10 | Automação | Desenhar e ligar a primeira | "Copio de um lugar para outro" | Make · Google Formulários | Lógica antes da ferramenta; parada humana | TEOR · FLUX×2 · LABO×2 · CASO · CACA · NO_C · ANTE · CHEC | **LAB 10: automação rodando** | **Uma automação funcionando** | Cap. 10 |
| 11 | Agentes | Saber quando precisa — e quando não | "Todo mundo fala em agente" | ChatGPT · Claude | Escrever as proibições primeiro | TEOR · LABO×2 · DUEL · DESA · CASO · NO_C · CHEC | "Você precisa mesmo de um agente?" | **Regras testadas** | Cap. 11 |
| 12 | Qual IA usar | Escolher pela tarefa | "Qual é a melhor?" | As três + Claude com arquivos | Critério próprio | FERR · AQUE · TEOR · PROM · DUEL · LABO · EMER · CASO · CHEC | Mesmo pedido nas três | **Sua regra de escolha** | Cap. 12 |
| 13 | Projeto | Consolidar o plano | "Não sei por onde começar" | — | Priorizar e datar | PROJ · TEOR · LABO · EMER · CHEC×2 | Revisar o que foi gravado | **Plano de adoção** | Cap. 13 |

### O projeto transversal — o que cada módulo grava

| Módulo | Grava no projeto |
|---|---|
| 1 | **Minha dor principal** |
| 2 | **Meus prompts** (3) |
| 3 | **Minhas tarefas repetitivas** |
| 4 | Meu primeiro trabalho delegado |
| 5 | **Uma imagem/campanha** |
| 6 | Um vídeo |
| 7–8 | **Uma análise** |
| 9 | Minha base de documentos |
| 10 | **Um processo + uma automação** |
| 11 | **Uma ideia de agente** |
| 12 | **Minhas ferramentas** |
| 13 | Consolida tudo → **Plano de Adoção** |

### Os 11 laboratórios do briefing

| LAB | Módulo | Situação hoje |
|---|---|---|
| 01 Cliente difícil | M2 | existe |
| 02 Orçamento sem inventar | M3 | **converter de ANTES_DEPOIS** |
| 03 Campanha de WhatsApp | M3 | **converter** |
| 04 Imagem de produto | M5 | existe |
| 05 Vídeo curto | M6 | **reconstruir em 8 etapas** |
| 06 Analisar planilha | M8 | existe, usar planilha didática |
| 07 Documento empresarial | M3 | **converter** |
| 08 Base no NotebookLM | M9 | existe |
| 09 Mapear processo | M10 | existe |
| 10 Criar automação | M10 | **criar — hoje só há desenho** |
| 11 Primeiro agente | M11 | existe |

---

## ETAPA 5 — Métricas: antes e meta

| Métrica | Hoje | Meta |
|---|---:|---:|
| Lições | 124 | ~126 |
| **% TEORIA** | **25%** | **≤ 18%** |
| **Teorias seguidas (máx.)** | **4** | **1** |
| **Lições que operam ferramenta** | **12 (10%)** | **≥ 40 (32%)** |
| **Fichas de ferramenta** | **0** | **8** |
| LABORATORIO | 16 | 24 |
| CASO | 11 | 13 |
| DUELO | 10 | 12 |
| CACA_ERRO | 9 | 11 |
| FLUXO | 3 | 6 |
| NO_CELULAR (celular) | 11 | 16 |
| DESAFIO | 2 | 4 |
| **Entregas produzidas** | **19** | **26** |
| Prompts no banco | 170 | 170 (meta do padrão) |
| **Prompts preenchíveis no deck** | **35** | **≥ 45** |
| **Botões de IA no deck** (`ia-btn`) | 4 por prompt | manter |
| Ferramentas ensinadas | 10 | 12 |
| Cards no deck | 148 | ≥ 148 |
| Duplicação no deck | 0% | 0% |
| Vazamento entre cursos | 0 | 0 |
| Sem rolagem horizontal | 8 larguras | 8 larguras |

**A métrica que define sucesso é a terceira.** As outras podem melhorar
sem o curso mudar de natureza; essa não.

### Banco de prompts — 17 áreas do briefing

Hoje há 170 prompts em 18 categorias. As 17 pedidas estão cobertas;
"Gestão" aparece distribuída entre Planejamento e Administrativo. Na
implementação, os prompts novos dos módulos reforçarão Imagens, Vídeos e
Automação, que são os mais finos.

---

## Como cada regra do briefing será cumprida

| Regra | Como |
|---|---|
| Apostila ≠ curso | A apostila fica como está (15 capítulos de consulta). As lições não copiam dela; `capituloRef` liga as duas |
| Regra de ouro | Cada lição nova declara o que o aluno fará; teoria que não passa vira prática |
| Público não técnico | Termo técnico só depois da explicação simples, em `traduzindo` |
| Narrativa do negócio | Módulos renomeados pela dor: "Por onde vai o seu tempo", "As tarefas da semana" |
| Começar pelas dores | M1 abre com *"qual tarefa você repetiu esta semana?"* e grava a resposta |
| Mostrar a ferramenta | 8 fichas com os 10 itens do briefing |
| Variedade | Nenhum módulo com 2 teorias seguidas |
| ≤30% teoria | Meta mais dura: 18% |
| Slides | Gerados do banco; componentes medidos contra Educadores |
| Mobile | Lição é página React que reflui; medida em 8 larguras |
| Uma fonte só | Tudo no banco; deck, apostila e roteiros gerados dele |
| courseId | Todo conteúdo novo com o curso; teste de vazamento por módulo |

---

## ETAPA 6 — Ordem de implementação

Um módulo por vez, com os 12 passos do briefing.

| # | Módulo | Por que nesta posição |
|---|---|---|
| 1 | **M6 Imagens** | Pior caso: 4 teorias seguidas → 3 laboratórios |
| 2 | **M4+M5 ChatGPT** | Funde dois módulos; traz Projects e Canvas |
| 3 | **M7 Vídeo** | Reconstrução em 8 etapas |
| 4 | **M9 Dados** | 3 teorias seguidas + planilha didática |
| 5 | **M11 Automação** | A automação que roda |
| 6 | **M8 Docs/Sheets** | Gemini no Workspace |
| 7 | **M1** | Fundir, remover, abrir o projeto transversal |
| 8 | **M3** | Converter os ANTES_DEPOIS em laboratórios |
| 9 | **M12 Agentes** | "Precisa mesmo de um agente?" |
| 10 | **M14 → transversal** | Depende de todos |
| 11 | **M2, M10, M13** | Ajustes menores |

Após cada módulo: regenerar deck e apostila, rodar os testes do padrão,
comparar componentes com o Educadores, medir responsividade.

---

## Critério final — as 12 frases

O trabalho só termina quando um empreendedor sem conhecimento técnico
puder dizer as 12 frases do briefing. Cada uma tem um módulo e uma
entrega que a sustenta:

| Frase | Módulo | Entrega que prova |
|---|---|---|
| "Consigo responder meus clientes" | M2, M3 | Resposta pronta e enviada |
| "Consigo pesquisar melhor" | M12 | Comparação nas três |
| "Consigo criar documentos" | M3, M7 | Procedimento e proposta |
| "Consigo criar imagens" | M5 | Foto de produto usável |
| "Consigo criar um vídeo simples" | M6 | Vídeo de 15s |
| "Consigo trabalhar com meus dados" | M8 | Decisão com número |
| "Consigo usar IA com docs e planilhas" | M7 | Planilha de controle |
| "Consigo montar uma base" | M9 | Base testada |
| "Consigo identificar tarefas repetitivas" | M1, M3 | Lista no projeto |
| "Consigo automatizar um processo" | M10 | Automação rodando |
| "Entendo quando preciso de um agente" | M11 | Atividade da decisão |
| "Consigo montar um plano real" | M13 | Plano de Adoção |

---

## Fontes (20/09/2026)

- [Projects in ChatGPT](https://help.openai.com/en/articles/10169521-projects-in-chatgpt)
- [ChatGPT Capabilities Overview](https://help.openai.com/en/articles/9260256-chatgpt-capabilities-overview)
- [More ways to work with your team and tools in ChatGPT](https://openai.com/index/more-ways-to-work-with-your-team/)
- [Introducing ChatGPT Images 2.5](https://openai.com/index/introducing-chatgpt-images-2-5/)
- [Images in ChatGPT](https://help.openai.com/en/articles/11084440-images-in-chatgpt)
- [Gemini updates to Docs, Sheets, Slides and Drive](https://blog.google/products-and-platforms/products/workspace/gemini-workspace-updates-march-2026/)
- [Collaborate with Gemini in Google Sheets](https://support.google.com/docs/answer/14356410?hl=en)
- [Veo 3.1 — Google DeepMind](https://deepmind.google/models/veo/)
- [Google Flow — créditos diários](https://support.google.com/googleone/thread/450387797/)
- [What are projects? — Claude](https://support.claude.com/en/articles/9517075-what-are-projects)
- [Create and edit files with Claude](https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude)
- [What are skills? — Claude](https://support.claude.com/en/articles/12512176-what-are-skills)
