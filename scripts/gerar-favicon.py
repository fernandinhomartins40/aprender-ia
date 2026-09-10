"""
Gera o favicon e os ícones do PWA a partir da arte da marca.

Origem: assets-marca/favicon-origem.png (o "iA" com capelo, 1254px RGBA).

Cada destino tem uma exigência diferente, e ignorá-las é o que produz
ícone cortado ou com fundo preto:

  favicon.ico   16/32/48px. Acima disso o navegador prefere o PNG do
                manifest, então carregar 256px aqui só pesaria o arquivo.
  maskable      O Android recorta num círculo: precisa de 20% de margem
                de segurança e fundo sólido, senão o capelo é decepado.
  apple-touch   O iOS ignora transparência e pinta o vazio de preto —
                por isso vai com fundo branco.

    python scripts/gerar-favicon.py
"""

from pathlib import Path

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    raise SystemExit("Pillow não instalado. Rode: pip install pillow")

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / "assets-marca/favicon-origem.png"
PUBLICO = RAIZ / "apps/web/public"
ICONES = PUBLICO / "icones"

BRANCO = (255, 255, 255, 255)


def em_quadrado(arte: Image.Image, lado: int, margem: float = 0.02, fundo=None):
    """Centraliza a arte num quadrado, reservando `margem` de cada lado."""
    util = int(lado * (1 - 2 * margem))
    a = arte.copy()
    a.thumbnail((util, util), Image.LANCZOS)

    tela = Image.new("RGBA", (lado, lado), fundo or (0, 0, 0, 0))
    tela.paste(a, ((lado - a.width) // 2, (lado - a.height) // 2), a)
    return tela


def main() -> None:
    if not ORIGEM.exists():
        raise SystemExit(f"não encontrei {ORIGEM}")

    origem = Image.open(ORIGEM).convert("RGBA")
    # Tira a margem transparente para a arte ocupar o quadro inteiro.
    caixa = origem.getbbox()
    arte = origem.crop(caixa) if caixa else origem

    ICONES.mkdir(parents=True, exist_ok=True)

    em_quadrado(arte, 192, 0.04).save(ICONES / "icone-192.png")
    em_quadrado(arte, 512, 0.04).save(ICONES / "icone-512.png")
    em_quadrado(arte, 512, 0.20, BRANCO).save(ICONES / "icone-maskable-512.png")
    em_quadrado(arte, 180, 0.06, BRANCO).save(ICONES / "apple-touch-icon.png")

    em_quadrado(arte, 32).save(PUBLICO / "favicon-32.png")
    em_quadrado(arte, 96).save(PUBLICO / "favicon-96.png")
    em_quadrado(arte, 48).save(
        PUBLICO / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)]
    )

    for nome in [
        "favicon.ico", "favicon-32.png", "favicon-96.png",
        "icones/icone-192.png", "icones/icone-512.png",
        "icones/icone-maskable-512.png", "icones/apple-touch-icon.png",
    ]:
        print(f"{nome:34} {(PUBLICO / nome).stat().st_size / 1024:6.1f} KB")


if __name__ == "__main__":
    main()
