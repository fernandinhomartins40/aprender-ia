/**
 * Aprender IA — AI Launcher
 *
 * Abre a ferramenta de IA escolhida com o prompt já preenchido.
 *
 * IMPORTANTE: nem toda ferramenta aceita prompt via URL. As que não
 * aceitam usam a estratégia "copiar + abrir", e a interface avisa o
 * professor de que o prompt está na área de transferência.
 *
 * Cada adaptador declara honestamente sua estratégia em `metodo`.
 */

export type MetodoAbertura = "url" | "copiar-e-abrir";

export interface Ferramenta {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  url: string;
  metodo: MetodoAbertura;
  /** Monta a URL final. Recebe o prompt já com as variáveis aplicadas. */
  montarUrl: (prompt: string) => string;
  /** Selo de gratuidade, igual ao usado na apostila */
  selo: "verde" | "amarelo" | "vermelho";
  observacao?: string;
  /** Boa para quais tarefas — orienta a sugestão ao professor */
  bomPara: string[];
}

export const FERRAMENTAS: Record<string, Ferramenta> = {
  gemini: {
    id: "gemini",
    nome: "Google Gemini",
    descricao: "Gratuito com sua conta Google. Bom para quase tudo.",
    cor: "#4285F4",
    url: "https://gemini.google.com/app",
    metodo: "copiar-e-abrir",
    montarUrl: () => "https://gemini.google.com/app",
    selo: "verde",
    observacao: "O Gemini não aceita prompt pela URL — copiamos para você colar.",
    bomPara: ["planejamento", "pesquisa", "textos", "geral"],
  },

  chatgpt: {
    id: "chatgpt",
    nome: "ChatGPT",
    descricao: "O mais conhecido. Versátil para tarefas do dia a dia.",
    cor: "#10A37F",
    url: "https://chatgpt.com",
    metodo: "url",
    montarUrl: (p) => `https://chatgpt.com/?q=${encodeURIComponent(p)}`,
    selo: "amarelo",
    observacao: "Após várias perguntas pesadas, troca para um modelo mais simples.",
    bomPara: ["geral", "textos", "ideias"],
  },

  deepseek: {
    id: "deepseek",
    nome: "DeepSeek",
    descricao: "Sem limite de mensagens. Ótimo em matemática e ciências.",
    cor: "#4D6BFE",
    url: "https://chat.deepseek.com",
    metodo: "copiar-e-abrir",
    montarUrl: () => "https://chat.deepseek.com",
    selo: "verde",
    observacao: "Não aceita prompt pela URL — copiamos para você colar.",
    bomPara: ["matematica", "ciencias", "avaliacao", "raciocinio"],
  },

  qwen: {
    id: "qwen",
    nome: "Qwen",
    descricao: "Alternativa gratuita quando outra atingir o limite.",
    cor: "#615CED",
    url: "https://chat.qwen.ai",
    metodo: "copiar-e-abrir",
    montarUrl: () => "https://chat.qwen.ai",
    selo: "verde",
    bomPara: ["geral", "textos", "tabelas"],
  },

  claude: {
    id: "claude",
    nome: "Claude",
    descricao: "Escrita natural e empática. Bom para pareceres e comunicados.",
    cor: "#D97757",
    url: "https://claude.ai/new",
    metodo: "url",
    montarUrl: (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}`,
    selo: "amarelo",
    bomPara: ["pareceres", "comunicados", "textos-longos"],
  },

  notebooklm: {
    id: "notebooklm",
    nome: "NotebookLM",
    descricao: "Lê a BNCC e o livro didático sem inventar. Cita a página.",
    cor: "#F97316",
    url: "https://notebooklm.google.com",
    metodo: "copiar-e-abrir",
    montarUrl: () => "https://notebooklm.google.com",
    selo: "amarelo",
    observacao: "Anexe o PDF primeiro; depois cole o prompt. ~50 perguntas/dia.",
    bomPara: ["bncc", "documentos", "livro-didatico"],
  },
};

export const LISTA_FERRAMENTAS = Object.values(FERRAMENTAS);

/** Substitui as variáveis [CHAVE] pelos valores informados. */
export function aplicarVariaveis(
  corpo: string,
  valores: Record<string, string>,
): string {
  return corpo.replace(/\[([A-ZÀ-Ú0-9_ /]+)\]/g, (original, chave: string) => {
    const limpa = chave.trim();
    const valor = valores[limpa];
    return valor && valor.trim() ? valor.trim() : original;
  });
}

/** Lista as variáveis presentes num prompt, sem repetir. */
export function extrairVariaveis(corpo: string): string[] {
  const achadas = corpo.match(/\[([A-ZÀ-Ú0-9_ /]+)\]/g) ?? [];
  const unicas = new Set(achadas.map((v) => v.slice(1, -1).trim()));
  return [...unicas];
}

/** Verifica se ainda restam variáveis não preenchidas. */
export function variaveisPendentes(
  corpo: string,
  valores: Record<string, string>,
): string[] {
  return extrairVariaveis(corpo).filter((v) => !valores[v]?.trim());
}

export interface ResultadoAbertura {
  ok: boolean;
  copiado: boolean;
  metodo: MetodoAbertura;
  aviso?: string;
}

/**
 * Abre a ferramenta com o prompt.
 * Sempre copia para a área de transferência — mesmo no método "url",
 * como rede de segurança caso a ferramenta ignore o parâmetro.
 */
export async function abrirComPrompt(
  ferramentaId: string,
  prompt: string,
): Promise<ResultadoAbertura> {
  const f = FERRAMENTAS[ferramentaId];
  if (!f) return { ok: false, copiado: false, metodo: "url", aviso: "Ferramenta desconhecida." };

  let copiado = false;
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(prompt);
      copiado = true;
    }
  } catch {
    copiado = false;
  }

  const destino = f.montarUrl(prompt);
  if (typeof window !== "undefined") {
    window.open(destino, "_blank", "noopener,noreferrer");
  }

  const aviso =
    f.metodo === "copiar-e-abrir"
      ? copiado
        ? "Copiamos o prompt. É só colar na conversa que abriu."
        : "Não conseguimos copiar automaticamente — use o botão Copiar."
      : undefined;

  return { ok: true, copiado, metodo: f.metodo, aviso };
}

/** Sugere ferramentas adequadas a uma categoria de tarefa. */
export function sugerirFerramentas(categoria: string): Ferramenta[] {
  const combinam = LISTA_FERRAMENTAS.filter((f) => f.bomPara.includes(categoria));
  return combinam.length ? combinam : [FERRAMENTAS.gemini!, FERRAMENTAS.deepseek!];
}
