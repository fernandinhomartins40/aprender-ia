"""
Converte a arte original em alta para o WebP que a aplicação serve.

Os ícones autorais vêm em ~1250px e ~1MB cada (87MB somados) e a arte da
landing em ~1.4MB por peça. São exibidos entre 32 e 400px: servir o
original faria o celular de um professor baixar dezenas de megabytes à toa.

As pastas de origem ficam FORA do repositório (ver .gitignore); só o
resultado WebP é versionado. Este script existe para que essa conversão
seja repetível — ao acrescentar um ícone novo, rode-o de novo.

    python scripts/otimizar-imagens.py

Depois de acrescentar ou remover ícones, regenere também a união de tipos:

    python scripts/gerar-catalogo-icones.py
"""

from pathlib import Path

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    raise SystemExit("Pillow não instalado. Rode: pip install pillow")

RAIZ = Path(__file__).resolve().parent.parent

# 256px cobre exibição até 128px em tela 2x — o maior uso é 44px.
ICONES_ORIGEM = RAIZ / "fuse3dicons"
ICONES_DESTINO = RAIZ / "apps/web/public/icones-app"
ICONES_LADO = 256

# A arte da landing aparece grande; cada peça tem seu limite.
LANDING_ORIGEM = RAIZ / "assets landingpage"
LANDING_DESTINO = RAIZ / "apps/web/public/landing"
LANDING = {
    "ChatGPT Image 10_09_2026, 18_20_41.png": ("hero-banner", 1600),
    "ChatGPT Image 10_09_2026, 18_20_45.png": ("robo-comemorando", 720),
    "ChatGPT Image 10_09_2026, 18_20_49.png": ("robo-notebook", 720),
    "ChatGPT Image 10_09_2026, 18_21_00.png": ("publico-educadores", 560),
    "ChatGPT Image 10_09_2026, 18_20_56.png": ("publico-estudantes", 560),
    "ChatGPT Image 10_09_2026, 18_20_54.png": ("publico-profissionais", 560),
    "ChatGPT Image 10_09_2026, 18_20_52.png": ("publico-curiosos", 560),
}


def converter(origem: Path, destino: Path, lado: int, qualidade: int) -> tuple[int, int]:
    """Redimensiona preservando a transparência e devolve (antes, depois)."""
    img = Image.open(origem).convert("RGBA")
    img.thumbnail((lado, lado), Image.LANCZOS)
    destino.parent.mkdir(parents=True, exist_ok=True)
    img.save(destino, "WEBP", quality=qualidade, method=6)
    return origem.stat().st_size, destino.stat().st_size


def main() -> None:
    antes = depois = 0
    feitos = 0

    if ICONES_ORIGEM.is_dir():
        for png in sorted(ICONES_ORIGEM.glob("*.png")):
            nome = png.stem.removesuffix("_hd")
            a, d = converter(png, ICONES_DESTINO / f"{nome}.webp", ICONES_LADO, 88)
            antes, depois, feitos = antes + a, depois + d, feitos + 1
    else:
        print(f"aviso: {ICONES_ORIGEM.name}/ não encontrada — ícones não regerados")

    if LANDING_ORIGEM.is_dir():
        for arquivo, (nome, lado) in LANDING.items():
            origem = LANDING_ORIGEM / arquivo
            if not origem.exists():
                print(f"aviso: falta {arquivo}")
                continue
            a, d = converter(origem, LANDING_DESTINO / f"{nome}.webp", lado, 90)
            antes, depois, feitos = antes + a, depois + d, feitos + 1
    else:
        print(f"aviso: '{LANDING_ORIGEM.name}/' não encontrada — arte não regerada")

    if feitos:
        print(f"{feitos} imagens: {antes / 1_048_576:.1f} MB -> {depois / 1_048_576:.2f} MB")


if __name__ == "__main__":
    main()
