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
  maskables,
  origemSalva,
  geradosSalvos,
}: {
  acao: Acao;
  acaoRestaurar: () => void;
  tamanhos: TamanhoIcone[];
  /// Versões com margem para o recorte circular do Android.
  maskables: TamanhoIcone[];
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
  const [peso, setPeso] = useState("");

  const imgRef = useRef<HTMLImageElement | null>(null);
  const arrastando = useRef<{ x: number; y: number } | null>(null);

  // Recorte novo invalida os tamanhos já gerados: exibi-los daria a
  // impressão de que o ajuste atual foi aplicado.
  useEffect(() => {
    setGerados({});
    setPeso("");
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

    // WebP com qualidade 0,9: mantém transparência como o PNG e pesa
    // cerca de um quinto. Sete PNGs de 512px somavam bem mais que o
    // limite de corpo das Server Actions, e o envio falhava inteiro.
    // Todo navegador que roda este editor suporta WebP; o `startsWith`
    // abaixo confirma, e cai para PNG se algum não suportar.
    const webp = canvas.toDataURL("image/webp", 0.9);
    return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
  }

  /**
   * Versão recortável: a arte ocupando o quadro inteiro.
   *
   * O Android corta um círculo inscrito no quadrado. A tentação é
   * encolher a arte e preencher a sobra com uma cor — foi o que fiz
   * antes, e sai errado por dois motivos.
   *
   * O primeiro é visual: a arte fica pequena no meio de uma moldura
   * larga, e é essa miniatura que o sistema mostra na instalação.
   *
   * O segundo só apareceu medindo. Para escolher a cor da moldura eu
   * amostrava os cantos da imagem. Numa arte com fundo degradê — como a
   * nossa, um céu estrelado — os quatro cantos dão cores distintas
   * (medido: de rgb(1,4,58) a rgb(30,2,157)), e a cor escolhida diferia
   * em até 158 da borda adjacente. Resultado: uma faixa nítida no lugar
   * de uma emenda invisível. Não existe cor sólida que resolva isso.
   *
   * Então não há moldura. A arte enviada é quadrada e já traz a própria
   * margem, e o que o círculo apara são os cantos do fundo — fundo, não
   * conteúdo. O enquadramento que a pessoa escolheu, com o círculo
   * tracejado à vista, é exatamente o que vai para a tela inicial.
   */
  function recortarMaskable(lado: number): string | null {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return null;

    // O mesmo enquadramento de `recortar`, calculado de novo aqui: passar
    // por uma data URL intermediária exigiria esperar o decode da imagem,
    // e um `drawImage` antes disso desenha um quadro vazio — o ícone
    // sairia como fundo liso, sem arte.
    const base = Math.min(img.naturalWidth, img.naturalHeight);
    const recorte = base / zoom;
    const centroX = img.naturalWidth / 2 - deslocX * recorte;
    const centroY = img.naturalHeight / 2 - deslocY * recorte;
    const sx = Math.max(0, Math.min(img.naturalWidth - recorte, centroX - recorte / 2));
    const sy = Math.max(0, Math.min(img.naturalHeight - recorte, centroY - recorte / 2));

    const canvas = document.createElement("canvas");
    canvas.width = lado;
    canvas.height = lado;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // A arte ocupa o quadro inteiro: sem moldura, sem redução.
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, sx, sy, recorte, recorte, 0, 0, lado, lado);

    const webp = canvas.toDataURL("image/webp", 0.9);
    return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
  }

  /**
   * A imagem original, reduzida para guardar.
   *
   * Ela é salva junto para permitir reenquadrar depois sem reenviar o
   * arquivo. Mas o original pode ter 8 MB, e somado aos sete tamanhos
   * estourava o limite de corpo da Server Action — foi o que fez o
   * primeiro envio falhar. 1024px é folgado para recortar um ícone de
   * 512px e pesa uma fração disso.
   */
  function origemReduzida(): string | null {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return null;

    const maior = Math.max(img.naturalWidth, img.naturalHeight);
    if (maior <= 1024) return origem;

    const escala = 1024 / maior;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * escala);
    canvas.height = Math.round(img.naturalHeight * escala);
    const ctx = canvas.getContext("2d");
    if (!ctx) return origem;

    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", 0.9);
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

    // Os recortáveis usam o mesmo enquadramento, porém com margem: são o
    // que o Android põe na tela inicial.
    for (const t of maskables) {
      const d = recortarMaskable(t.lado);
      if (!d) {
        setAviso("A imagem ainda está carregando. Tente de novo.");
        return;
      }
      novos[t.chave] = d;
    }

    const total = Object.values(novos).reduce((s, v) => s + v.length, 0);
    const emMB = (total / 1_048_576).toFixed(1);
    setGerados(novos);
    setAviso("");
    setPeso(emMB);
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

  const prontos = Object.keys(gerados).length === tamanhos.length + maskables.length;

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
            {[...tamanhos, ...maskables].map((t) => {
              const atual = gerados[t.chave] ?? geradosSalvos[t.chave];
              return (
                <div
                  key={t.chave}
                  className="flex items-center gap-3 rounded-xl border border-borda bg-white p-3"
                >
                  {/* A imagem não leva borda arredondada: arredondar aqui
                      cortava a arte e dava a impressão de que o ícone tinha
                      saído estragado. Cada sistema aplica a própria máscara
                      ao exibir; a prévia mostra o arquivo como ele é. */}
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-fundo">
                    {atual ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={atual} alt="" aria-hidden className="h-12 w-12" />
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
            {/* A original vai reduzida: inteira, somada aos sete tamanhos,
                estourava o limite de corpo da Server Action. */}
            <input type="hidden" name="origem" value={prontos ? (origemReduzida() ?? "") : ""} />
            {[...tamanhos, ...maskables].map((t) => (
              <input key={t.chave} type="hidden" name={t.chave} value={gerados[t.chave] ?? ""} />
            ))}
            <button
              type="submit"
              disabled={!prontos || pendente}
              className="btn-primario text-sm"
            >
              {pendente ? "Salvando…" : "Salvar ícones"}
            </button>
            {!prontos ? (
              <span className="text-sm text-cinza">Gere os tamanhos primeiro.</span>
            ) : (
              peso && <span className="text-sm text-cinza">{peso} MB no total</span>
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
