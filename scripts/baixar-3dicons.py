# -*- coding: utf-8 -*-
"""
Baixa a biblioteca 3dicons (CC0) para uso local.

Os PNGs não estão no repositório do GitHub — o site os serve a partir de
um storage público. Este script extrai a lista de ícones da página e
baixa cada combinação de ângulo e estilo.

Estrutura de saída:
    <destino>/<estilo>/<angulo>/<nome>.webp

Uso:
    python scripts/baixar-3dicons.py [destino] [--tamanho 400] [--somente-color]
"""
from __future__ import annotations

import argparse
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

BASE = "https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes"
PAGINAS = ["https://3dicons.co/", "https://3dicons.co/explore"]

ANGULOS = ["dynamic", "front", "iso"]
ESTILOS = ["color", "clay", "gradient", "premium"]
TAMANHOS_VALIDOS = [20, 100, 200, 400]

UA = {"User-Agent": "Mozilla/5.0 (compatible; aprender-ia-asset-fetch)"}


def buscar(url: str, tentativas: int = 3) -> bytes:
    for i in range(tentativas):
        try:
            with urlopen(Request(url, headers=UA), timeout=30) as r:
                return r.read()
        except (HTTPError, URLError, TimeoutError) as e:
            if isinstance(e, HTTPError) and e.code in (400, 404):
                raise
            if i == tentativas - 1:
                raise
            time.sleep(1.5 * (i + 1))
    raise RuntimeError("inalcançável")


def coletar_ids() -> list[str]:
    """Extrai os identificadores <hash>-<nome> das páginas públicas."""
    achados: set[str] = set()
    for pag in PAGINAS:
        try:
            html = buscar(pag).decode("utf-8", errors="replace")
        except Exception as e:
            print(f"  aviso: não consegui ler {pag} ({e})", file=sys.stderr)
            continue
        achados |= set(re.findall(r"sizes/([a-z0-9]{6}-[a-z0-9_-]+)/", html))
    return sorted(achados)


def nome_limpo(ident: str) -> str:
    """'744cc0-rocket' -> 'rocket'"""
    return ident.split("-", 1)[1] if "-" in ident else ident


def baixar_um(ident: str, angulo: str, estilo: str, tamanho: int, destino: str):
    nome = nome_limpo(ident)
    pasta = os.path.join(destino, estilo, angulo)
    os.makedirs(pasta, exist_ok=True)
    caminho = os.path.join(pasta, f"{nome}.webp")

    if os.path.exists(caminho) and os.path.getsize(caminho) > 0:
        return ("pulado", caminho)

    url = f"{BASE}/{ident}/{angulo}/{tamanho}/{estilo}.webp"
    try:
        dados = buscar(url)
    except HTTPError as e:
        return (f"faltando({e.code})", url)
    except Exception as e:
        return (f"erro({type(e).__name__})", url)

    if len(dados) < 200:  # resposta de erro disfarçada
        return ("vazio", url)

    with open(caminho, "wb") as f:
        f.write(dados)
    return ("ok", caminho)


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("destino", nargs="?", default="assets-3dicons")
    p.add_argument("--tamanho", type=int, default=400, choices=TAMANHOS_VALIDOS)
    p.add_argument("--somente-color", action="store_true",
                   help="baixa apenas o estilo color (mais rápido)")
    p.add_argument("--somente-dynamic", action="store_true",
                   help="baixa apenas o ângulo dynamic")
    p.add_argument("--paralelo", type=int, default=8)
    args = p.parse_args()

    estilos = ["color"] if args.somente_color else ESTILOS
    angulos = ["dynamic"] if args.somente_dynamic else ANGULOS

    print("Coletando a lista de ícones...")
    ids = coletar_ids()
    if not ids:
        print("ERRO: nenhum ícone encontrado. O site pode ter mudado.", file=sys.stderr)
        return 1

    total = len(ids) * len(angulos) * len(estilos)
    print(f"  {len(ids)} ícones · {len(angulos)} ângulos · {len(estilos)} estilos")
    print(f"  {total} arquivos a baixar em {args.tamanho}px\n")

    tarefas = [
        (i, a, e) for i in ids for a in angulos for e in estilos
    ]
    contagem = {"ok": 0, "pulado": 0}
    problemas: list[str] = []

    with ThreadPoolExecutor(max_workers=args.paralelo) as pool:
        futuros = {
            pool.submit(baixar_um, i, a, e, args.tamanho, args.destino): (i, a, e)
            for i, a, e in tarefas
        }
        for n, fut in enumerate(as_completed(futuros), 1):
            estado, _ = fut.result()
            if estado in contagem:
                contagem[estado] += 1
            else:
                problemas.append(f"{futuros[fut]} -> {estado}")
            if n % 100 == 0 or n == total:
                print(f"  {n}/{total}  baixados={contagem['ok']} "
                      f"existentes={contagem['pulado']} falhas={len(problemas)}",
                      flush=True)

    print(f"\nConcluído: {contagem['ok']} baixados, {contagem['pulado']} já existiam.")
    if problemas:
        print(f"{len(problemas)} combinações indisponíveis (normal: nem todo "
              f"ícone tem todos os estilos).")
        for x in problemas[:5]:
            print("   ", x)

    # Licença junto dos arquivos, para não se perder a procedência
    os.makedirs(args.destino, exist_ok=True)
    with open(os.path.join(args.destino, "LICENCA.txt"), "w", encoding="utf-8") as f:
        f.write(
            "3dicons — https://3dicons.co\n"
            "Autor: Vijay Verma (realvjy)\n"
            "Licença: CC0 1.0 Universal (domínio público)\n"
            "Uso livre, pessoal e comercial, sem exigência de atribuição.\n"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
