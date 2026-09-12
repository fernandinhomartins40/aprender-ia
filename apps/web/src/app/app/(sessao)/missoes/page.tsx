import Link from "next/link";
import { IconeApp } from "@/components/icone-app";
import { minhasMissoes, minhasRecompensas } from "@/server/missoes";
import { Termo } from "@/components/termo";

export const dynamic = "force-dynamic";

const ROTULO = { DIARIA: "Hoje", SEMANAL: "Nesta semana", ESPECIAL: "Especial" } as const;

export default async function Missoes() {
  const [missoes, recompensas] = await Promise.all([minhasMissoes(), minhasRecompensas()]);
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-4"><div className="rounded-2xl bg-amarelo-soft p-3"><IconeApp nome="metas" tamanho={48} prioridade /></div><div><h1 className="font-titulo text-3xl font-extrabold">Missões<Termo slug="missao" contexto="missoes" rotulo="Missões" /></h1><p className="text-tinta-clara">Objetivos opcionais que acompanham sua aprendizagem real.</p></div></div>
      <div className="mt-7 space-y-4">
        {missoes.map((m) => {
          const secreta = m.oculto && !m.concluida;
          const pct = Math.min(100, Math.round((m.progresso / m.alvo) * 100));
          return <article key={m.id} className={`card ${m.concluida ? "border-verde bg-verde-soft/40" : ""}`}>
            <div className="flex items-start gap-4"><IconeApp nome={m.concluida ? "conquistas" : "desafios"} tamanho={46} /><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wide text-indigo">{ROTULO[m.tipo]}</p><h2 className="font-titulo text-lg font-extrabold">{secreta ? "Missão secreta" : m.titulo}</h2><p className="mt-1 text-sm text-tinta-clara">{secreta ? "Continue explorando para descobrir." : m.descricao}</p></div><span className="font-titulo font-bold text-indigo">{secreta ? "?" : `${m.progresso}/${m.alvo}`}</span></div>
            {!secreta && <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-borda"><div className="progresso-vivo h-full rounded-full bg-grad-marca" style={{ width: `${pct}%` }} /></div>}
            {m.concluida && m.recompensaTitulo && <p className="mt-3 font-semibold text-verde-dark">Recompensa recebida: {m.recompensaTitulo}</p>}
            {!m.concluida && m.lessonId && <Link href={`/app/licao/${m.lessonId}`} className="mt-3 inline-block font-bold text-indigo">Abrir desafio →</Link>}
          </article>;
        })}
      </div>
      <section className="mt-9"><h2 className="font-titulo text-xl font-extrabold">Minhas recompensas</h2>{recompensas.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{recompensas.map((r) => <div key={r.id} className="card flex items-center gap-3"><IconeApp nome="recompensas" tamanho={42} /><div><p className="font-titulo font-bold">{r.titulo}</p><p className="text-xs text-cinza">Recebida em {r.recebidoEm.toLocaleDateString("pt-BR")}</p></div></div>)}</div> : <p className="mt-3 text-tinta-clara">Sua primeira recompensa aparece quando uma missão é concluída.</p>}</section>
    </div>
  );
}
