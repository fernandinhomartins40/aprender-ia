import {
  IconCircleCheckFilled,
  IconUserFilled,
  IconInfinity,
  IconSchoolFilled,
  IconSettingsFilled,
  IconFileTextFilled,
  IconBookFilled,
  IconRocket,
  IconPencilFilled,
  IconBriefcaseFilled,
  IconBulbFilled,
  IconHeartFilled,
  IconStarFilled,
  type Icon as TipoIcone,
} from "@tabler/icons-react";

/**
 * Ícones planos da landing, do Tabler.
 *
 * Usamos a variante `Filled` sempre que ela existe: o desenho da página pede
 * silhueta cheia, e desenhar isso à mão deformava as figuras — a engrenagem
 * virava um borrão, o foguete perdia o contorno — porque a área fechada de um
 * caminho de traço não corresponde à silhueta da forma.
 *
 * Três ícones não têm versão preenchida no Tabler (`pessoas`, `infinito` e
 * `foguete`). Para eles, um traço mais grosso aproxima o peso visual dos
 * demais, em vez de trocar por uma figura que não diz a mesma coisa.
 *
 * Decorativos por natureza: o rótulo ao lado carrega o significado, e
 * repeti-lo faria o leitor de tela dizer tudo duas vezes.
 */

type Entrada = { icone: TipoIcone; cheio: boolean };

const ICONES: Record<string, Entrada> = {
  // ---- Selos do hero ----
  check: { icone: IconCircleCheckFilled, cheio: true },
  pessoas: { icone: IconUserFilled, cheio: false },
  infinito: { icone: IconInfinity, cheio: false },

  // ---- Pilares da faixa escura ----
  capelo: { icone: IconSchoolFilled, cheio: true },
  engrenagem: { icone: IconSettingsFilled, cheio: true },
  documento: { icone: IconFileTextFilled, cheio: true },

  // ---- Trilhas ----
  livro: { icone: IconBookFilled, cheio: true },
  foguete: { icone: IconRocket, cheio: false },
  lapis: { icone: IconPencilFilled, cheio: true },
  maleta: { icone: IconBriefcaseFilled, cheio: true },
  lampada: { icone: IconBulbFilled, cheio: true },

  // ---- Números ----
  coracao: { icone: IconHeartFilled, cheio: true },
  estrela: { icone: IconStarFilled, cheio: true },
};

export type NomeIconePlano = keyof typeof ICONES;

/** Só a figura, sem moldura — para os selos e a faixa de números. */
export function TracoIcone({ nome, tamanho = 20 }: { nome: string; tamanho?: number }) {
  const entrada = ICONES[nome];
  if (!entrada) return null;

  const { icone: Icone, cheio } = entrada;

  return (
    <Icone
      size={tamanho}
      // Traço grosso só em quem não tem versão preenchida, para o peso
      // visual acompanhar o dos ícones cheios ao lado.
      stroke={cheio ? undefined : 2.4}
      aria-hidden="true"
      focusable="false"
    />
  );
}

/**
 * O ícone dentro do quadrado colorido, como no desenho da página.
 *
 * `preenchido` usa a cor cheia com a figura branca; sem ele o quadrado fica
 * na versão suave, com a figura na própria cor.
 */
export function IconePlano({
  nome,
  cor,
  tamanho = 44,
  preenchido = true,
  className = "",
}: {
  nome: string;
  cor: string;
  tamanho?: number;
  preenchido?: boolean;
  className?: string;
}) {
  if (!ICONES[nome]) return null;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[30%] ${className}`}
      style={{
        width: tamanho,
        height: tamanho,
        // 1F ≈ 12% de opacidade: fundo suave o bastante para não competir
        // com o cartão branco, e forte o bastante para dar forma ao ícone.
        background: preenchido ? cor : `${cor}1F`,
        color: preenchido ? "#FFFFFF" : cor,
      }}
    >
      <TracoIcone nome={nome} tamanho={Math.round(tamanho * 0.54)} />
    </span>
  );
}

/** Selo do hero: figura colorida dentro de um círculo suave. */
export function SeloIcone({ nome, cor }: { nome: string; cor: string }) {
  if (!ICONES[nome]) return null;

  return (
    <span
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      style={{ background: `${cor}1F`, color: cor }}
    >
      <TracoIcone nome={nome} tamanho={20} />
    </span>
  );
}
