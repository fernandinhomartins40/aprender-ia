import Link from "next/link";
import {
  listarLandingParaTela,
  salvarSecao,
  restaurarSecao,
  alternarVisibilidade,
  salvarItem,
  excluirItem,
  moverItem,
} from "@/server/landing";
import { EditorSecao } from "@/components/editor-landing";

export const dynamic = "force-dynamic";

export default async function Landing() {
  const secoes = await listarLandingParaTela();

  const editadas = secoes.filter((s) => s.personalizada).length;
  const escondidas = secoes.filter((s) => !s.visivel).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-titulo text-2xl font-extrabold text-tinta sm:text-3xl">Página inicial</h1>
          <p className="mt-1 max-w-2xl text-sm text-tinta-clara">
            Todo o texto da landing, editável sem tocar no código.
          </p>
        </div>
        <Link href="/" target="_blank" className="btn-fantasma text-sm">
          Ver a página
        </Link>
      </div>

      <div className="rounded-lg border-l-4 border-indigo bg-indigo-soft p-4 text-sm text-indigo-dark">
        <p className="font-titulo font-bold">Como funciona</p>
        <ul className="mt-2 space-y-1">
          <li>
            As seções são fixas — você edita textos, itens, ordem e o que
            aparece; o desenho da página continua garantido.
          </li>
          <li>
            Campo deixado em branco volta ao texto original, então não há como
            zerar a página por engano.
          </li>
          <li>
            A página inicial guarda o conteúdo por até 1 minuto: espere um
            instante e recarregue para ver a mudança publicada.
          </li>
        </ul>
        <p className="mt-3">
          {editadas} de {secoes.length} seções editadas
          {escondidas > 0 ? ` · ${escondidas} escondida(s)` : ""}.
        </p>
      </div>

      <div className="space-y-4">
        {secoes.map((s) => (
          <EditorSecao
            key={s.chave}
            secao={s}
            acaoSalvar={salvarSecao}
            acaoRestaurar={restaurarSecao}
            acaoVisibilidade={alternarVisibilidade}
            acaoSalvarItem={salvarItem}
            acaoExcluirItem={excluirItem}
            acaoMoverItem={moverItem}
          />
        ))}
      </div>
    </div>
  );
}
