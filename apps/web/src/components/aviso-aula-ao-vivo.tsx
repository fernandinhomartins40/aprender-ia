import Link from "next/link";
import { prisma } from "@aprender/db";
import { IconeApp } from "@/components/icone-app";

/**
 * Aviso no Início quando há uma apresentação acontecendo.
 *
 * Durante o encontro, entrar no "Acompanhar" não pode custar três toques: o
 * aluno está com o professor falando e a turma seguindo em frente. Por isso
 * este aviso aparece no topo, acima de tudo, e some sozinho quando a
 * apresentação é encerrada.
 */
export async function AvisoAulaAoVivo() {
  const sessao = await prisma.liveSession.findFirst({
    where: { encerradaEm: null },
    orderBy: { iniciadaEm: "desc" },
    select: {
      passoAtual: true,
      script: { select: { id: true, titulo: true } },
    },
  });

  if (!sessao) return null;

  return (
    <Link
      href={`/app/acompanhar?r=${sessao.script.id}`}
      className="mt-5 flex items-center gap-4 rounded-2xl border-2 border-indigo bg-indigo-soft p-4 transition-colors hover:bg-indigo-line"
    >
      <IconeApp nome="apresentacao" tamanho={40} />
      <div className="min-w-0 flex-1">
        <p className="font-titulo text-base font-extrabold text-indigo-dark">
          A aula está acontecendo agora
        </p>
        <p className="truncate text-sm text-indigo-dark/80">
          {sessao.script.titulo} · professor no passo {sessao.passoAtual}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-indigo px-4 py-2 font-titulo text-sm font-bold text-white">
        Acompanhar
      </span>
    </Link>
  );
}
