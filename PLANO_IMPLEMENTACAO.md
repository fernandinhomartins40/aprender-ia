# Plano de Implementação — Portal de Cursos

> Uma extensão prática do curso "IA para Educadores": o professor não apenas **lê** a apostila, ele **pratica** a trilha, testa prompts de verdade e vê o próprio progresso.

**Data:** 09/09/2026
**Primeiro curso:** IA para Educadores (4 encontros · 12 capítulos · 98 prompts)
**Identidade visual:** herdada da apostila (índigo #4F46E5 + laranja #F97316)

---

## 1. O que estamos construindo

Um **portal multiusuário de cursos** em que a jornada de aprendizado é guiada, gamificada e prática — no espírito do Duolingo, mas com o conteúdo e o tom do curso que já existe.

### As três faces do produto

| Face | Para quem | O que faz |
|---|---|---|
| **Landing page** | Visitante | Apresenta o curso, mostra a proposta, capta inscrição |
| **Painel do aluno** | Professor cursista | Trilha gamificada, exercícios, prompts com botão que abre a IA, progresso |
| **Painel administrativo** | Você (dono) | Gerencia cursos, capítulos, exercícios, alunos, turmas e métricas |

### O diferencial: o botão que abre a IA

Este é o coração da aplicação e o que a diferencia de qualquer plataforma de curso genérica.

Cada prompt da apostila vira um **card interativo**:
1. O aluno lê o prompt e o contexto pedagógico
2. Personaliza os campos entre colchetes (`[ANO]`, `[TEMA]`, `[DISCIPLINA]`) num formulário simples
3. Clica em **"Praticar no ChatGPT"** / **"no Gemini"** / **"no DeepSeek"**
4. A ferramenta abre em nova aba **com o prompt já preenchido**
5. O aluno volta, cola o resultado e **registra o que aprendeu**

> **Nota técnica honesta:** nem toda IA aceita prompt pré-preenchido por URL. ChatGPT (`?q=`), Gemini e Claude aceitam via query string; outras não. Para essas, a solução é **copiar para a área de transferência + abrir a ferramenta**, com um aviso claro ("copiamos o prompt — é só colar"). Isso será tratado por adaptador, ferramenta a ferramenta, e validado na Fase 3.

---

## 2. Decisões de arquitetura

### Stack (verificado em setembro/2026)

| Camada | Escolha | Por quê |
|---|---|---|
| Monorepo | **Turborepo + pnpm workspaces** | Padrão de mercado em 2026; cache remoto acelera CI |
| Framework | **Next.js 15 (App Router)** | Server Components, rotas de API, SSR para SEO da landing |
| Linguagem | **TypeScript** (strict) | Contratos compartilhados entre apps e packages |
| Banco | **PostgreSQL 16** (Docker) | Pedido do cliente; relacional serve bem à modelagem de trilha |
| ORM | **Prisma** | Migrations versionadas, tipos gerados, ótimo DX |
| Auth | **Auth.js (NextAuth v5)** | Multiusuário com papéis; e-mail/senha + Google |
| Estilo | **Tailwind CSS** + tokens do curso | Tokens da apostila viram design system |
| UI | **shadcn/ui** (Radix) | Acessível, sem lock-in, estilizável com nossos tokens |
| PWA | **Serwist** (`@serwist/next`) | Sucessor oficial do next-pwa, compatível com App Router |
| Estado servidor | **TanStack Query** | Cache, revalidação, offline-friendly |
| Animação | **Framer Motion** | Micro-interações da gamificação |
| Validação | **Zod** | Compartilhada entre client e server |
| Testes | **Vitest** + **Playwright** | Unidade e E2E dos fluxos críticos |

### Estrutura do monorepo

```
portal-cursos/
├── apps/
│   ├── web/                 # Next.js — landing + aluno + admin
│   └── docs/                # (opcional) documentação interna
├── packages/
│   ├── ui/                  # Design system (tokens da apostila)
│   ├── db/                  # Prisma schema, client, seeds
│   ├── auth/                # Configuração Auth.js e papéis
│   ├── ai-launcher/         # Adaptadores que abrem cada IA
│   ├── config/              # ESLint, TS, Tailwind compartilhados
│   └── types/               # Contratos Zod compartilhados
├── docker/
│   ├── docker-compose.yml   # Postgres + Adminer
│   └── Dockerfile.web
├── turbo.json
└── pnpm-workspace.yaml
```

**Decisão:** um único app Next.js com três áreas de rota (`/`, `/app`, `/admin`) em vez de três apps separados. Motivo: compartilham sessão, design system e deploy — separar traria complexidade sem ganho real nesta escala.

---

## 3. Modelagem de dados

### Entidades principais

```
User            id, nome, email, senhaHash, avatar, papel, criadoEm
                papel: ALUNO | ADMIN | INSTRUTOR

Course          id, slug, titulo, descricao, capa, cargaHoraria,
                publicado, ordem

Module          id, courseId, titulo, descricao, ordem, icone, cor
                (= os 4 Encontros)

Lesson          id, moduleId, titulo, tipo, conteudo(JSON), ordem,
                xpRecompensa, tempoEstimado
                tipo: TEORIA | PROMPT | DUELO | CACA_ERRO | CASO |
                      DESAFIO | QUIZ | CHECKPOINT

PromptTemplate  id, lessonId, titulo, corpo, variaveis(JSON),
                ferramentasSugeridas[], categoria, dica

Exercise        id, lessonId, tipo, enunciado, opcoes(JSON),
                respostaCorreta, explicacao, ordem

Enrollment      id, userId, courseId, iniciadoEm, concluidoEm,
                progressoPct

LessonProgress  id, enrollmentId, lessonId, status, xpGanho,
                tentativas, concluidoEm
                status: BLOQUEADA | DISPONIVEL | EM_ANDAMENTO | CONCLUIDA

PromptRun       id, userId, promptTemplateId, ferramenta,
                variaveisPreenchidas(JSON), reflexao, executadoEm

Streak          id, userId, diasSeguidos, ultimoAcesso, recorde

Achievement     id, chave, titulo, descricao, icone, criterio(JSON)
UserAchievement id, userId, achievementId, conquistadoEm

Cohort          id, courseId, nome, inicioEm, fimEm   (turmas)
CohortMember    id, cohortId, userId
```

### Observações de modelagem

- **`Lesson.conteudo` como JSON** permite que cada tipo de lição tenha sua própria forma sem explodir o schema em 8 tabelas.
- **`PromptRun`** é o registro que dá valor real ao admin: mostra **quais prompts os professores realmente usam** e em qual ferramenta.
- **`LessonProgress.status`** implementa o desbloqueio progressivo da trilha.

---

## 4. A trilha gamificada

### Como o curso vira trilha

Os 12 capítulos da apostila viram **4 módulos** (os encontros) com nós sequenciais:

```
ENCONTRO 1 ─── Cap 1: O que é IA          [TEORIA]      +10 XP
           ├── Quiz: mitos e verdades      [QUIZ]        +15 XP
           ├── Caça ao Erro 1              [CACA_ERRO]   +25 XP
           ├── Cap 2: Fórmula P.T.C.F.     [TEORIA]      +10 XP
           ├── Duelo 1: atividade genérica [DUELO]       +30 XP
           ├── Prompt: plano de aula       [PROMPT]      +20 XP
           ├── Caso 1: a aula de amanhã    [CASO]        +40 XP
           └── ✓ Checkpoint Encontro 1     [CHECKPOINT]  +50 XP
```

### Mecânicas (e por que cada uma existe)

| Mecânica | Função pedagógica |
|---|---|
| **XP e níveis** | Torna visível um progresso que hoje é invisível |
| **Ofensiva (streak)** | Estimula constância — o inimigo do curso é o abandono |
| **Desbloqueio progressivo** | Impede pular o P.T.C.F. e chegar quebrado nos casos |
| **Conquistas** | Reconhecem marcos reais ("primeiro parecer gerado") |
| **Checkpoint por encontro** | Fecha o ciclo com a sensação de "levei algo pronto" |
| **Diário de bordo digital** | Versão online do destacável — registra tempo economizado |

> **Cuidado deliberado:** gamificação aqui é **suporte**, não espetáculo. O público é professor adulto, muitos com pouca familiaridade digital. Nada de mascote falante, som alto ou penalidade por errar. Errar num Caça ao Erro **não tira ponto** — ele existe para ensinar a duvidar.

---

## 5. As três áreas, tela a tela

### 5.1 Landing page (`/`)

- **Hero** — "Menos burocracia. Aulas melhores. Seu fim de semana de volta."
- **A dor** — os 4 ladrões de tempo (pareceres, planejamento, correção, burocracia)
- **O que você leva pronto** — produtos concretos de cada encontro
- **Como funciona** — a trilha em 4 passos, com preview
- **Ferramentas gratuitas** — a tabela com selos 🟢🟡🔴
- **Prova social** — depoimentos (quando houver)
- **FAQ** — certificação, gratuidade, requisitos
- **CTA** — criar conta

### 5.2 Painel do aluno (`/app`)

| Rota | Tela |
|---|---|
| `/app` | Dashboard: próxima lição, ofensiva, XP, atalho "praticar agora" |
| `/app/trilha/[curso]` | Mapa visual da trilha, nós conectados, bloqueados/liberados |
| `/app/licao/[id]` | Player da lição — muda conforme o tipo |
| `/app/prompts` | Biblioteca dos 98 prompts, busca e filtro por disciplina |
| `/app/diario` | Diário de bordo — o que testou, tempo economizado |
| `/app/conquistas` | Conquistas e progresso geral |
| `/app/perfil` | Dados, preferências, IA favorita |

**O player de lição por tipo:**
- `TEORIA` → conteúdo com os mesmos boxes da apostila (Traduzindo, Atenção, Dica)
- `PROMPT` → card com variáveis editáveis + botões das IAs + campo de reflexão
- `DUELO` → prompt ruim / campo para o aluno reescrever / revelação do bom
- `CACA_ERRO` → resposta da IA com erro; aluno aponta; gabarito comentado
- `CASO` → cena, campo de resposta, solução comentada
- `DESAFIO` → cronômetro visual + tarefa
- `QUIZ` → múltipla escolha com explicação
- `CHECKPOINT` → checklist "o que levo deste encontro"

### 5.3 Painel administrativo (`/admin`)

| Rota | Função |
|---|---|
| `/admin` | Visão geral: alunos ativos, conclusão média, lições travadas |
| `/admin/cursos` | CRUD de cursos, módulos e lições |
| `/admin/cursos/[id]/trilha` | Editor visual da trilha (ordenar, XP, pré-requisitos) |
| `/admin/prompts` | Gerenciar os 98 prompts e ferramentas sugeridas |
| `/admin/alunos` | Lista, progresso individual, redefinir senha |
| `/admin/turmas` | Cohorts, matrícula em lote, acompanhamento |
| `/admin/metricas` | Prompts mais usados, IA preferida, evasão por lição |
| `/admin/config` | Identidade, textos da landing, integrações |

**A métrica que mais importa:** *em qual lição os alunos param*. É ela que diz onde o curso precisa melhorar — e alimenta a próxima revisão da apostila.

---

## 6. PWA e responsividade

### Estratégia mobile-first

O público acessa **majoritariamente pelo celular** — muitos na sala dos professores, no intervalo. Portanto:

- Layout desenhado primeiro para 360px, depois expandido
- Alvos de toque ≥ 44px
- A trilha rola **verticalmente** no celular (como Duolingo), horizontal no desktop
- Prompts com botão **"copiar"** sempre visível

### PWA com Serwist

- `manifest.json` com ícones, tema índigo e `display: standalone`
- Service worker via `@serwist/next`
- **Offline:** lições de teoria já visitadas ficam em cache; prompts ficam disponíveis offline (são texto)
- **Fila de sincronização:** progresso feito offline sobe quando a conexão voltar
- Prompt de instalação customizado ("Adicione à tela inicial")

> **Limite honesto:** abrir a IA externa **exige internet**. O PWA garante que o *conteúdo* funcione offline, não a prática com a ferramenta.

---

## 7. Fases de implementação

### Fase 0 — Fundação (semana 1)
- Monorepo Turborepo + pnpm, TypeScript strict
- `docker-compose.yml` com Postgres 16 + Adminer
- Prisma schema completo + migrations + seed inicial
- Design system em `packages/ui` com os tokens da apostila
- **Entregável:** `pnpm dev` sobe tudo; banco populado

### Fase 1 — Autenticação e papéis (semana 2)
- Auth.js com credenciais + Google
- Papéis ALUNO / ADMIN / INSTRUTOR e middleware de rota
- Cadastro, login, recuperação de senha
- **Entregável:** login funcional com áreas protegidas

### Fase 2 — Conteúdo e trilha (semanas 3-4)
- Importador que converte a apostila em lições no banco
- Mapa da trilha com desbloqueio progressivo
- Player de lição para TEORIA e QUIZ
- Progresso e XP
- **Entregável:** Encontro 1 navegável ponta a ponta

### Fase 3 — O motor de prompts (semanas 5-6)
- `packages/ai-launcher` com adaptadores por ferramenta
- Card de prompt com variáveis editáveis
- Deep links validados ferramenta a ferramenta + fallback copiar
- Registro de `PromptRun` e campo de reflexão
- **Entregável:** aluno pratica um prompt real de ponta a ponta

### Fase 4 — Tipos ricos de lição (semanas 7-8)
- Player de DUELO, CACA_ERRO, CASO, DESAFIO, CHECKPOINT
- Cronômetro visual
- Diário de bordo digital
- **Entregável:** os 4 encontros completos e praticáveis

### Fase 5 — Gamificação (semana 9)
- Ofensiva, conquistas, níveis
- Animações de transição e celebração
- Notificações de retorno (respeitosas, opt-in)
- **Entregável:** jornada com feedback e recompensa

### Fase 6 — Painel administrativo (semanas 10-11)
- CRUD completo de cursos e lições
- Editor visual da trilha
- Gestão de alunos e turmas
- Dashboard de métricas
- **Entregável:** você opera a plataforma sem tocar em código

### Fase 7 — Landing e PWA (semana 12)
- Landing page completa e otimizada para SEO
- Serwist, manifest, offline, instalação
- Lighthouse ≥ 90 em performance e acessibilidade
- **Entregável:** app instalável e site público

### Fase 8 — Qualidade e implantação (semana 13)
- Testes E2E dos fluxos críticos (cadastro → trilha → prompt)
- Seed de produção com o curso completo
- Docker de produção, backup do banco, variáveis de ambiente
- **Entregável:** pronto para receber os primeiros professores

---

## 8. Riscos e como tratamos

| Risco | Impacto | Tratamento |
|---|---|---|
| **Deep link não funciona em toda IA** | Alto — é o diferencial | Adaptador por ferramenta + fallback "copiar e abrir", validado na Fase 3 |
| Professor com pouca familiaridade digital | Alto | Onboarding guiado, linguagem sem jargão, tudo em 2 toques |
| Ferramentas de IA mudam URL/política | Médio | Adaptadores isolados num package; trocar = editar 1 arquivo |
| Gamificação infantilizar o público | Médio | Tom adulto, sem mascote, sem punição; testar com 3 professores reais |
| Conteúdo desatualizar (como já aconteceu) | Médio | Admin permite editar sem deploy; campo "verificado em" por ferramenta |
| Escopo crescer demais | Alto | Fases fechadas; nada entra sem sair algo |

---

## 9. O que fica fora desta versão

Registrado para não virar mal-entendido depois:

- ❌ Pagamento e assinatura (o curso é gratuito para a rede pública)
- ❌ Emissão automática de certificado (Fase futura — exige regra da Secretaria)
- ❌ Fórum ou chat entre alunos
- ❌ App nativo (o PWA cobre a necessidade)
- ❌ IA própria integrada — a proposta é justamente **levar o professor às ferramentas gratuitas**, não intermediá-las
- ❌ Videoaulas (o curso é presencial; o portal é a prática)

---

## 10. Definição de pronto

A aplicação estará pronta quando um professor conseguir, sozinho:

1. Descobrir o curso pela landing e criar conta em menos de 2 minutos
2. Instalar o app no celular
3. Percorrer o Encontro 1 inteiro, incluindo um Duelo e um Caça ao Erro
4. Personalizar um prompt, abrir a IA com ele preenchido e registrar o resultado
5. Ver seu progresso, XP e ofensiva
6. Voltar no dia seguinte e retomar de onde parou — inclusive offline

E quando **você** conseguir, sem programar:
7. Criar um curso novo, com módulos e lições
8. Ver quantos alunos travaram em cada lição
9. Matricular uma turma inteira de uma vez

---

## 11. Verificação ao final

Como no plano do curso, ao concluir apresento a tabela **prometido × entregue**, medida objetivamente:

| Item | Meta |
|---|---|
| Apps e packages do monorepo | 1 app + 6 packages |
| Tabelas no banco | ~14 entidades |
| Tipos de lição implementados | 8 |
| Prompts importados da apostila | 98 |
| Rotas do painel do aluno | 7 |
| Rotas do admin | 8 |
| Lighthouse (performance / a11y) | ≥ 90 |
| Cobertura E2E dos fluxos críticos | 5 fluxos |
| PWA instalável (Android e iOS) | sim |

---

## 12. Decisões que preciso de você

1. **Domínio e marca** — o portal terá nome próprio ou será "IA para Educadores"?
2. **Cadastro** — aberto a qualquer professor, ou só por convite/turma que você cria?
3. **Login social** — habilitar Google? (a maioria dos professores tem conta Google pela escola)
4. **Certificado** — o portal deve gerar algum comprovante de conclusão da trilha, ou a certificação fica 100% pelo curso presencial?
5. **Hospedagem** — Vercel (mais simples) ou VPS própria com Docker (mais controle e custo fixo)?
