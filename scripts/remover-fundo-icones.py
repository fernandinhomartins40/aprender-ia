# -*- coding: utf-8 -*-
"""
Remove o fundo branco dos ícones 3dicons, gerando PNG com transparência.

Por que é preciso: o site serve os arquivos já achatados em RGB sobre
branco — não há versão com canal alpha disponível publicamente.

Estratégia: flood fill a partir das BORDAS, não substituição por cor.
Vários ícones têm branco na própria arte (o foguete tem faixa branca,
a lâmpada tem reflexo). Trocar "todo pixel branco" por transparente
esburacaria o desenho; preencher a partir das bordas só alcança o que
está de fato conectado ao fundo.

As bordas do recorte ganham alpha proporcional, para não ficarem
serrilhadas sobre fundos coloridos.

Uso:
    python scripts/remover-fundo-icones.py <pasta_entrada> <pasta_saida>
"""
from __future__ import annotations

import os
import sys
from collections import deque

from PIL import Image

# Tolerância: quão perto do branco puro conta como fundo.
LIMIAR_FUNDO = 244
# Faixa de transição, para suavizar a borda do recorte.
LIMIAR_BORDA = 200


def remover_fundo(caminho: str) -> Image.Image:
    im = Image.open(caminho).convert("RGBA")
    larg, alt = im.size
    px = im.load()
    if px is None:
        return im

    visitado = bytearray(larg * alt)
    fila: deque[tuple[int, int]] = deque()

    def claro(x: int, y: int) -> bool:
        r, g, b, _ = px[x, y]
        return r >= LIMIAR_FUNDO and g >= LIMIAR_FUNDO and b >= LIMIAR_FUNDO

    # Semeia a fila com os pixels claros das quatro bordas.
    for x in range(larg):
        for y in (0, alt - 1):
            if claro(x, y) and not visitado[y * larg + x]:
                visitado[y * larg + x] = 1
                fila.append((x, y))
    for y in range(alt):
        for x in (0, larg - 1):
            if claro(x, y) and not visitado[y * larg + x]:
                visitado[y * larg + x] = 1
                fila.append((x, y))

    # Espalha pelo fundo conectado.
    while fila:
        x, y = fila.popleft()
        px[x, y] = (255, 255, 255, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < larg and 0 <= ny < alt:
                i = ny * larg + nx
                if not visitado[i] and claro(nx, ny):
                    visitado[i] = 1
                    fila.append((nx, ny))

    # Suaviza a borda: pixels quase-brancos vizinhos de transparente
    # recebem alpha parcial, evitando o halo serrilhado.
    for y in range(alt):
        for x in range(larg):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            claridade = min(r, g, b)
            if claridade <= LIMIAR_BORDA:
                continue
            vizinho_vazio = False
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < larg and 0 <= ny < alt and px[nx, ny][3] == 0:
                    vizinho_vazio = True
                    break
            if vizinho_vazio:
                faixa = LIMIAR_FUNDO - LIMIAR_BORDA
                novo = int(255 * (LIMIAR_FUNDO - claridade) / faixa)
                px[x, y] = (r, g, b, max(0, min(255, novo)))

    return im


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 1

    entrada, saida = sys.argv[1], sys.argv[2]
    os.makedirs(saida, exist_ok=True)

    arquivos = sorted(
        f for f in os.listdir(entrada) if f.lower().endswith((".webp", ".png"))
    )
    if not arquivos:
        print(f"Nenhuma imagem em {entrada}", file=sys.stderr)
        return 1

    print(f"Processando {len(arquivos)} ícones...\n")
    for i, nome in enumerate(arquivos, 1):
        base = os.path.splitext(nome)[0]
        try:
            im = remover_fundo(os.path.join(entrada, nome))
            im.save(os.path.join(saida, f"{base}.png"), "PNG", optimize=True)
            print(f"  [{i}/{len(arquivos)}] {base}")
        except Exception as e:
            print(f"  [{i}/{len(arquivos)}] {base} -> ERRO: {e}", file=sys.stderr)

    print(f"\nPronto. PNGs com transparência em {saida}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
