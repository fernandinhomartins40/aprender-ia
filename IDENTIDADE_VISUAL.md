# Aprender IA — Identidade Visual

> A identidade nasce da apostila do curso, mas **expande para o digital**: mais cor, mais energia, mais movimento — sem perder a seriedade de um material feito para professores.

---

## 1. Princípio

O curso impresso é **sóbrio e acolhedor**. O portal precisa ser **vivo e convidativo**, porque compete com a exaustão de quem abre o app às 22h depois de um dia inteiro de aula.

A ponte entre os dois: **as mesmas cores-âncora**, usadas com mais ousadia.

| | Apostila | Portal |
|---|---|---|
| Cor | Aplicada em detalhes | Aplicada em blocos e gradientes |
| Movimento | Estático | Micro-animações e transições |
| Tom | Material de consulta | Jornada com progresso |

---

## 2. Paleta

### Cores-âncora (herdadas do curso — não mudam)

| Token | Hex | Uso |
|---|---|---|
| `--indigo` | `#4F46E5` | Cor primária da marca, botões, links |
| `--indigo-dark` | `#4338CA` | Hover, estados ativos |
| `--indigo-soft` | `#EEF0FE` | Fundos, cards em destaque |
| `--laranja` | `#F97316` | Cor de energia: XP, ofensiva, CTAs secundários |
| `--laranja-soft` | `#FFF3E8` | Fundos de destaque quente |

### Cores funcionais (herdadas)

| Token | Hex | Significado |
|---|---|---|
| `--verde` | `#10B981` | Acerto, lição concluída, "Traduzindo" |
| `--vermelho` | `#EF4444` | Alerta, LGPD, atenção |
| `--amarelo` | `#EAB308` | Dica, aviso leve |
| `--azul` | `#2563EB` | Informação neutra |

### Cores de trilha (novas — exclusivas do portal)

Cada Encontro ganha sua própria cor, para o aluno se localizar visualmente no mapa:

| Encontro | Token | Hex | Tema |
|---|---|---|---|
| **1** — Fundamentos | `--enc-1` | `#6366F1` (índigo-violeta) | Começo, descoberta |
| **2** — Rotina e BNCC | `--enc-2` | `#0EA5E9` (azul-céu) | Organização, clareza |
| **3** — Materiais e inclusão | `--enc-3` | `#10B981` (verde-esmeralda) | Crescimento, acolhimento |
| **4** — Avaliação e ética | `--enc-4` | `#F59E0B` (âmbar) | Maturidade, conclusão |

### Cores de gamificação (novas)

| Token | Hex | Uso |
|---|---|---|
| `--xp` | `#F97316` | Pontos de experiência |
| `--streak` | `#EF4444` | Chama da ofensiva |
| `--conquista` | `#EAB308` | Medalhas e troféus |
| `--bloqueado` | `#94A3B8` | Lições ainda travadas |

### Neutros

| Token | Hex |
|---|---|
| `--tinta` | `#1E293B` |
| `--tinta-clara` | `#475569` |
| `--cinza` | `#64748B` |
| `--borda` | `#E2E8F0` |
| `--fundo` | `#FCFCFE` |
| `--superficie` | `#FFFFFF` |

### Gradientes de destaque

```css
--grad-marca:    linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #818CF8 100%);
--grad-energia:  linear-gradient(135deg, #F97316 0%, #FB923C 100%);
--grad-sucesso:  linear-gradient(135deg, #10B981 0%, #34D399 100%);
--grad-capa:     linear-gradient(150deg, #EEF0FE 0%, #F6F4FF 45%, #FFF8F0 100%);
```

---

## 3. Tipografia

Mesma do curso — a continuidade importa mais que a novidade.

| Papel | Fonte | Peso |
|---|---|---|
| Títulos e números | **Montserrat** | 700, 800 |
| Texto corrido e interface | **Nunito Sans** | 400, 600, 700 |
| Prompts e código | **JetBrains Mono** | 400, 500 |

### Escala (mobile-first)

| Uso | Mobile | Desktop |
|---|---|---|
| Display (hero) | 32px | 56px |
| H1 | 26px | 36px |
| H2 | 21px | 26px |
| H3 | 18px | 20px |
| Corpo | 16px | 16px |
| Apoio | 14px | 14px |
| Legenda | 12px | 12px |

> **Corpo nunca abaixo de 16px.** O público inclui professores com présbita; texto pequeno é barreira de acesso, não escolha estética.

---

## 4. Formas e profundidade

```css
--raio-sm:   8px;    /* chips, badges */
--raio-md:   12px;   /* botões, inputs */
--raio-lg:   16px;   /* cards */
--raio-xl:   24px;   /* modais, seções */
--raio-full: 999px;  /* pílulas, avatares */

--sombra-sm: 0 1px 3px rgba(15,23,42,.06);
--sombra-md: 0 5px 18px rgba(15,23,42,.05);
--sombra-lg: 0 12px 32px rgba(15,23,42,.09);
--sombra-cor: 0 8px 24px rgba(79,70,229,.22);  /* sombra colorida da marca */
```

**Espaçamento:** múltiplos de 4px (4, 8, 12, 16, 24, 32, 48, 64).

---

## 5. Componentes-assinatura

### O nó da trilha

O elemento mais importante da interface. Três estados:

| Estado | Aparência |
|---|---|
| **Bloqueado** | Cinza `--bloqueado`, ícone de cadeado, sem sombra |
| **Disponível** | Cor do encontro, sombra colorida, leve pulsação |
| **Concluído** | Verde `--verde`, ícone de check, brilho sutil |

Círculo de 64px (mobile) / 72px (desktop), conectado ao próximo por uma linha que **se preenche** conforme o progresso.

### O card de prompt

O componente que diferencia o produto:

- Fundo escuro `#151F38` (idêntico ao da apostila — continuidade visual)
- Fonte monoespaçada
- Variáveis `[ANO]`, `[TEMA]` destacadas em laranja e **editáveis inline**
- Barra inferior com os botões das IAs, cada uma com sua cor de marca
- Botão "copiar" sempre visível

### A barra de progresso

Gradiente `--grad-marca`, altura 8px, cantos arredondados, animação suave ao avançar.

### A chama da ofensiva

Ícone de chama em `--streak`, com o número de dias. Anima quando incrementa.

---

## 6. Movimento

| Interação | Duração | Curva |
|---|---|---|
| Hover, foco | 150ms | `ease-out` |
| Transição de tela | 250ms | `ease-in-out` |
| Conclusão de lição | 500ms | `spring` |
| Celebração (checkpoint) | 900ms | `spring` + confete |

> **Respeitar `prefers-reduced-motion`.** Toda animação precisa de alternativa estática.

---

## 7. Tom da interface

O portal fala com o professor **como o curso fala**: direto, acolhedor, sem jargão e sem infantilizar.

| ❌ Evitar | ✅ Preferir |
|---|---|
| "Ops! Você errou!" | "Não foi dessa vez — veja por quê" |
| "Parabéns, campeão!" | "Pronto. Você já pode usar isso amanhã." |
| "Continue sua jornada épica" | "Continuar de onde parei" |
| "Desbloqueie o próximo nível!" | "Próxima lição: Pareceres descritivos" |

**Regra:** o professor é um profissional adulto e experiente. A interface o trata como tal — a gamificação apoia, não fantasia.

---

## 8. Logo

> ⏳ **Aguardando o arquivo.** Quando você enviar, defino aqui as variações (horizontal, símbolo isolado, monocromática), a área de proteção, os tamanhos mínimos e gero o favicon e os ícones do PWA (192px, 512px, maskable).

**Enquanto isso**, o portal usará um logotipo tipográfico provisório: "Aprender" em Montserrat 800 `--tinta` + "IA" em `--laranja`, para não bloquear o desenvolvimento.

---

## 9. Acessibilidade

- Contraste mínimo **4.5:1** em todo texto (WCAG AA)
- Foco visível em todos os elementos interativos
- Alvos de toque ≥ **44×44px**
- Cor **nunca** é o único indicador de estado — sempre acompanhada de ícone ou texto
- Navegação completa por teclado
- Testado com leitor de tela nos fluxos críticos
