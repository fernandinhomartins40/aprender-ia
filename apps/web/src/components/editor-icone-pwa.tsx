"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { ResultadoIcone, TamanhoIcone } from "@/server/icones-pwa";

type Acao = (
  anterior: ResultadoIcone | null,
  dados: FormData,
) => Promise<ResultadoIcone>;

/**
 * Recorte e geração dos ícones do aplicativo.
 *
 * O recorte é quadrado e sempre proporcional: ícone deformado é o defeito
 * mais visível de um aplicativo instalado, e deixar a proporção livre
 * convidaria exatamente a isso. A pessoa escolhe o zoom e arrasta para
 * enquadrar; a área de recorte fica fixa.
 *
 * Os tamanhos são gerados aqui, com canvas, e enviados prontos: o
 * servidor não tem biblioteca de imagem, e mandar o original para
 * reprocessar lá seria mais lento e mais frágil.
 */
export function EditorIconePwa({
  acao,
  acaoRestaurar,
  tamanhos,
  origemSalva,
  geradosSalvos,
}: {
  acao: Acao;
  acaoRestaurar: () => void;
  tamanhos: TamanhoIcone[];
  origemSalva: string | null;
  geradosSalvos: Record<string, string>;
}) {
  const [estado, enviar, pendente] = useActionState(acao, null);

  const [origem, setOrigem] = useState<string | null>(origemSalva);
  const [zoom, setZoom] = useState(1);
  const [deslocX, setDeslocX] = useState(0);
  const [deslocY, setDeslocY] = useState(0);
  const [gerados, setGerados] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState("");

  const imgRef = useRef<HTMLImageElement | null>(null);
  const arrastando = useRef<{ x: number; y: number } | null>(null);

  // Recorte novo invalida os tamanhos já gerados: exibi-los daria a
  // impressão de que o ajuste atual foi aplicado.
  useEffect(() => {
    setGerados({});
  }, [origem, zoom, deslocX, deslocY]);

  function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      setAviso("Escolha um arquivo de imagem (PNG ou JPG).");
      return;
    }
    if (arquivo.size > 8 * 1024 * 1024) {
      setAviso("A imagem passa de 8 MB. Use uma menor.");
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      setOrigem(String(leitor.result));
      setZoom(1);
      setDeslocX(0);
      setDeslocY(0);
      setAviso("");
    };
    leitor.readAsDataURL(arquivo);
  }

  /** Desenha o recorte atual num canvas do tamanho pedido. */
  function recortar(lado: number): string | null {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return null;

    const canvas = document.createElement("canvas");
    canvas.width = lado;
    canvas.height = lado;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.imageSmoothingQuality = "high";

    // A menor dimensão define o lado do recorte: assim a área sempre cabe
    // na imagem, seja ela retrato ou paisagem.
    const base = Math.min(img.naturalWidth, img.naturalHeight);
    const recorte = base / zoom;

    // O deslocamento vem em fração da área visível (-0,5 a 0,5).
    const centroX = img.naturalWidth / 2 - deslocX * recorte;
    const centroY = img.naturalHeight / 2 - deslocY * recorte;

    const sx = Math.max(0, Math.min(img.naturalWidth - recorte, centroX - recorte / 2));
    const sy = Math.max(0, Math.min(img.naturalHeight - recorte, centroY - recorte / 2));

    ctx.drawImage(img, sx, sy, recorte, recorte, 0, 0, lado, lado);
    // PNG mantém a transparência; JPEG pintaria o fundo de preto.
    return canvas.toDataURL("image/png");
  }

  function gerar() {
    const novos: Record<string, string> = {};
    for (const t of tamanhos) {
      const d = recortar(t.lado);
      if (!d) {
        setAviso("A imagem ainda está carregando. Tente de novo.");
        return;
      }
      novos[t.chave] = d;
    }
    setGerados(novos);
    setAviso("");
  }

  // ---- Arrastar para enquadrar ----
  function iniciar(clientX: number, clientY: number) {
    arrastando.current = { x: clientX, y: clientY };
  }
  function mover(clientX: number, clientY: number, larguraCaixa: number) {
    if (!arrastando.current) return;
    const dx = (clientX - arrastando.current.x) / larguraCaixa;
    const dy = (clientY - arrastando.current.y) / larguraCaixa;
    // Limite de meia área para cada lado: sem ele a arte sairia do quadro.
    setDeslocX((v) => Math.max(-0.5, Math.min(0.5, v + dx)));
    setDeslocY((v) => Math.max(-0.5, Math.min(0.5, v + dy)));
    arrastando.current = { x: clientX, y: clientY };
  }
  const soltar = () => {
    arrastando.current = null;
  };

  const prontos = Object.keys(gerados).length === tamanhos.length;

  return (
    <div className="space-y-6">
      {estado && (
        <p
          role="status"
          className={`rounded-xl border-l-4 px-4 py-3 text-sm ${
            estado.ok
              ? "border-verde bg-verde-soft text-verde-dark"
              : "border-vermelho bg-vermelho-soft text-vermelho-dark"
          }`}
        >
          {estado.mensagem}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px),1fr]">
        {/* ---- Recorte ---- */}
        <div>
          <label className="btn-secundario w-full cursor-pointer text-sm">
            {origem ? "Trocar imagem" : "Escolher imagem"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={aoEscolher}
              className="sr-only"
            />
          </label>

          {aviso && (
            <p role="alert" className="mt-2 text-sm font-semibold text-vermelho-dark">
              {aviso}
            </p>
          )}

          {origem && (
            <div className="mt-4">
              <div
                className="relative aspect-square w-full cursor-move overflow-hidden rounded-xl border-2 border-borda bg-[repeating-conic-gradient(#F1F5F9_0_25%,#fff_0_50%)] bg-[length:20px_20px]"
                onMouseDown={(e) => iniciar(e.clientX, e.clientY)}
                onMouseMove={(e) => mover(e.clientX, e.clientY, e.currentTarget.clientWidth)}
                onMouseUp={soltar}
                onMouseLeave={soltar}
                onTouchStart={(e) => iniciar(e.touches[0]!.clientX, e.touches[0]!.clientY)}
                onTouchMove={(e) =>
                  mover(e.touches[0]!.clientX, e.touches[0]!.clientY, e.currentTarget.clientWidth)
                }
                onTouchEnd={soltar}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={origem}
                  alt="Imagem escolhida"
                  draggable={false}
                  className="absolute left-1/2 top-1/2 max-w-none select-none"
                  style={{
                    width: `${zoom * 100}%`,
                    transform: `translate(calc(-50% + ${deslocX * 100}%), calc(-50% + ${deslocY * 100}%))`,
                  }}
                />
                {/* Guia do recorte circular: é como o Android vai exibir. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-tinta/10"
                >
                  <div className="absolute inset-[8%] rounded-full border-2 border-dashed border-white/70" />
                </div>
              </div>

              <label className="mt-4 block">
                <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
                  Aproximar
                </span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </label>

              <p className="mt-1 text-xs text-cinza">
                Arraste a imagem para enquadrar. O círculo tracejado mostra o
                que o Android mantém ao recortar o ícone.
              </p>

              <button onClick={gerar} type="button" className="btn-primario mt-4 w-full text-sm">
                Gerar os tamanhos
              </button>
            </div>
          )}
        </div>

        {/* ---- Prévia ---- */}
        <div>
          <h3 className="font-titulo font-bold text-tinta">Prévia</h3>
          <p className="mt-0.5 text-sm text-tinta-clara">
            {prontos
              ? "É assim que o ícone vai aparecer. Salve para aplicar."
              : "Gere os tamanhos para ver como cada plataforma exibe."}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {tamanhos.map((t) => {
              const atual = gerados[t.chave] ?? geradosSalvos[t.chave];
              return (
                <div
                  key={t.chave}
                  className="flex items-center gap-3 rounded-xl border border-borda bg-white p-3"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-fundo">
                    {atual ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={atual} alt="" aria-hidden className="h-12 w-12 rounded-lg" />
                    ) : (
                      <span className="text-xs text-cinza">—</span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-titulo text-sm font-bold text-tinta">
                      {t.rotulo}
                    </span>
                    <span className="block text-xs text-tinta-clara">{t.onde}</span>
                  </span>
                </div>
              );
            })}
          </div>

          <form action={enviar} className="mt-5 flex flex-wrap items-center gap-3">
            <input type="hidden" name="origem" value={origem ?? ""} />
            {tamanhos.map((t) => (
              <input key={t.chave} type="hidden" name={t.chave} value={gerados[t.chave] ?? ""} />
            ))}
            <button
              type="submit"
              disabled={!prontos || pendente}
              className="btn-primario text-sm"
            >
              {pendente ? "Salvando…" : "Salvar ícones"}
            </button>
            {!prontos && (
              <span className="text-sm text-cinza">Gere os tamanhos primeiro.</span>
            )}
          </form>

          {(origemSalva || Object.keys(geradosSalvos).length > 0) && (
            <form action={acaoRestaurar} className="mt-4 border-t border-borda pt-4">
              <button
                type="submit"
                className="text-sm font-bold text-vermelho-dark hover:underline"
              >
                Voltar aos ícones originais
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
