"""
Gera a união de tipos e a lista dos ícones a partir dos arquivos reais.

Manter a lista à mão convidaria a divergir dos arquivos: um nome com erro
de digitação compilaria e só quebraria como imagem faltando em produção.
Derivando da pasta, um ícone que não existe não compila.

    python scripts/gerar-catalogo-icones.py

Rode depois de acrescentar ou remover ícones em public/icones-app.
"""

from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ICONES = RAIZ / "apps/web/public/icones-app"
COMPONENTE = RAIZ / "apps/web/src/components/icone-app.tsx"
CATALOGO = RAIZ / "apps/web/src/lib/icones-catalogo.ts"

AVISO = "// Gerado por scripts/gerar-catalogo-icones.py — não edite à mão."


def em_linhas(nomes: list[str], molde: str, largura: int = 74) -> str:
    """Quebra a lista em linhas legíveis em vez de uma linha quilométrica."""
    linhas: list[str] = []
    atual = "  "
    for n in nomes:
        peca = molde % n
        if len(atual) + len(peca) > largura:
            linhas.append(atual.rstrip())
            atual = "  "
        atual += peca
    linhas.append(atual.rstrip().rstrip(","))
    return "\n".join(linhas)


def main() -> None:
    nomes = sorted(p.stem for p in ICONES.glob("*.webp"))
    if not nomes:
        raise SystemExit(f"nenhum .webp em {ICONES}")

    COMPONENTE.write_text(
        f'''import Image from "next/image";

/**
 * Ícones 3D da identidade do Aprender IA.
 *
 * São PNGs autorais convertidos para WebP a 256px: o original tinha ~1 MB
 * por ícone em 1250px, o que somava 87 MB para exibir figuras de 32 a 64px
 * — peso que o celular de um professor pagaria à toa. A 256px eles ainda
 * ficam nítidos no dobro do maior tamanho usado.
 *
 * {AVISO[3:]}
 */
export type NomeIconeApp =
{em_linhas(nomes, '| "%s" ')};

export function IconeApp({{
  nome,
  tamanho = 40,
  className = "",
  prioridade = false,
}}: {{
  nome: NomeIconeApp;
  tamanho?: number;
  className?: string;
  prioridade?: boolean;
}}) {{
  return (
    <Image
      src={{`/icones-app/${{nome}}.webp`}}
      // Ícone aqui é sempre decorativo: o rótulo ao lado carrega o
      // significado, e repeti-lo faria o leitor de tela dizer tudo duas vezes.
      alt=""
      aria-hidden="true"
      width={{tamanho}}
      height={{tamanho}}
      priority={{prioridade}}
      className={{className}}
      style={{{{ width: tamanho, height: "auto" }}}}
    />
  );
}}
''',
        encoding="utf-8",
        newline="\n",
    )

    CATALOGO.write_text(
        f'''import type {{ NomeIconeApp }} from "@/components/icone-app";

/**
 * Lista dos ícones, para o seletor do painel.
 *
 * Vive em `lib/` e não junto do componente porque a tela de edição é um
 * Client Component e precisa da lista em tempo de execução, não só do tipo.
 * A ordem é alfabética: com dezenas de opções, procurar pelo nome é o único
 * jeito prático de achar.
 *
 * {AVISO[3:]}
 */
export const ICONES_APP: NomeIconeApp[] = [
{em_linhas(nomes, '"%s", ')},
];

/**
 * Redes sociais do rodapé.
 *
 * Separada porque essas marcas são SVG de terceiros, não fazem parte do
 * conjunto 3D autoral — ver `components/redes-sociais`.
 */
export const ICONES_REDE = ["youtube", "instagram", "linkedin", "discord"];
''',
        encoding="utf-8",
        newline="\n",
    )

    print(f"{len(nomes)} ícones -> {COMPONENTE.name} e {CATALOGO.name}")


if __name__ == "__main__":
    main()
