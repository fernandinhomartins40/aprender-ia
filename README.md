# Aprender IA

> Portal de cursos com trilha gamificada para professores da rede pública praticarem Inteligência Artificial na rotina escolar.

Extensão prática do curso **IA para Educadores** (40h): o professor não apenas lê a apostila — ele percorre a trilha, testa prompts reais nas ferramentas gratuitas e acompanha o próprio progresso.

---

## Status

🚧 **Em desenvolvimento** — Fase 0 (Fundação)

Veja o [Plano de Implementação](./PLANO_IMPLEMENTACAO.md) para o roteiro completo das 9 fases.

---

## O diferencial

Cada prompt do curso vira um **card interativo**:

1. O professor lê o prompt e o contexto pedagógico
2. Personaliza os campos entre colchetes — `[ANO]`, `[TEMA]`, `[DISCIPLINA]`
3. Clica em **"Praticar no Gemini"** (ou ChatGPT, DeepSeek…)
4. A ferramenta abre **com o prompt já preenchido**
5. Volta ao portal e registra o que aprendeu

> Nem toda IA aceita prompt via URL. Onde não aceita, o portal copia para a área de transferência e abre a ferramenta, avisando o professor. Tratado por adaptador em `packages/ai-launcher`.

---

## As três faces

| Área | Rota | Para quem |
|---|---|---|
| **Landing** | `/` | Visitante — conhece o curso e se inscreve |
| **Painel do aluno** | `/app` | Professor — trilha, exercícios, prompts, progresso |
| **Painel admin** | `/admin` | Dono da plataforma — cursos, alunos, turmas, métricas |

---

## Stack

| Camada | Tecnologia |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Framework | Next.js 15 (App Router) + TypeScript |
| Banco | PostgreSQL 16 (Docker) + Prisma |
| Auth | Auth.js (NextAuth v5) — papéis ALUNO / INSTRUTOR / ADMIN |
| Estilo | Tailwind CSS + shadcn/ui |
| PWA | Serwist (`@serwist/next`) |
| Estado | TanStack Query |
| Testes | Vitest + Playwright |

---

## Estrutura planejada

```
aprender-ia/
├── apps/
│   └── web/                 # Next.js — landing + aluno + admin
├── packages/
│   ├── ui/                  # Design system
│   ├── db/                  # Prisma schema, client, seeds
│   ├── auth/                # Auth.js e papéis
│   ├── ai-launcher/         # Adaptadores que abrem cada IA
│   ├── config/              # ESLint, TS, Tailwind
│   └── types/               # Contratos Zod
├── docker/
│   └── docker-compose.yml   # Postgres + Adminer
└── turbo.json
```

---

## Como rodar (após a Fase 0)

```bash
# instalar dependências
pnpm install

# subir o banco
docker compose -f docker/docker-compose.yml up -d

# migrations e seed
pnpm db:migrate && pnpm db:seed

# ambiente de desenvolvimento
pnpm dev
```

---

## Identidade visual

Herda as cores do curso e expande para o digital. Ver [Identidade Visual](./IDENTIDADE_VISUAL.md).

| | Cor |
|---|---|
| Primária | `#4F46E5` índigo |
| Energia | `#F97316` laranja |
| Encontro 1 | `#6366F1` |
| Encontro 2 | `#0EA5E9` |
| Encontro 3 | `#10B981` |
| Encontro 4 | `#F59E0B` |

**Tipografia:** Montserrat · Nunito Sans · JetBrains Mono

---

## Projeto relacionado

📘 [**cursos**](https://github.com/fernandinhomartins40/cursos) — material didático do curso (apostila de 92 páginas e 87 slides) que originou este portal.
