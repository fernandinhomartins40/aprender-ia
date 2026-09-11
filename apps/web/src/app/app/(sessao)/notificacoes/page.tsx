import Link from "next/link";
import { IconeApp } from "@/components/icone-app";
import {
  marcarNotificacaoComoLida,
  minhasNotificacoes,
  minhasPreferenciasNotificacao,
  salvarPreferenciasNotificacao,
} from "@/server/notificacoes";

export const dynamic = "force-dynamic";

const CAMPOS = [
  ["lembretesEstudo", "Lembretes de estudo", "Retomar uma atividade ou proteger sua sequência."],
  ["novosDesafios", "Novos desafios", "Atividades especiais disponíveis para você."],
  ["conquistas", "Conquistas", "Marcos reais desbloqueados pelo seu progresso."],
  ["missoes", "Missões", "Objetivos curtos vinculados à trilha."],
] as const;

export default async function CentralNotificacoes() {
  const [{ lista, naoLidas }, preferencias] = await Promise.all([
    minhasNotificacoes(100),
    minhasPreferenciasNotificacao(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-indigo-soft p-3">
          <IconeApp nome="notificacoes" tamanho={42} prioridade />
        </div>
        <div>
          <h1 className="font-titulo text-3xl font-extrabold">Central de notificações</h1>
          <p className="mt-1 text-tinta-clara">
            {naoLidas ? `${naoLidas} aviso(s) ainda não lido(s).` : "Você está em dia com seus avisos."}
          </p>
        </div>
      </div>

      <section className="mt-7 space-y-3" aria-label="Histórico de notificações">
        {lista.length === 0 ? (
          <div className="card text-center text-tinta-clara">Nenhuma notificação por enquanto.</div>
        ) : lista.map((n) => (
          <article key={n.id} className={`card ${n.lidoEm ? "" : "border-indigo-line bg-indigo-soft/30"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-titulo font-bold">{n.titulo}</p>
                <p className="mt-1 whitespace-pre-line text-sm text-tinta-clara">{n.corpo}</p>
                <p className="mt-2 text-xs text-cinza">
                  {new Date(n.criadoEm).toLocaleDateString("pt-BR", { dateStyle: "long" })}
                </p>
              </div>
              {!n.lidoEm && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo" aria-label="Não lida" />}
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {n.link && <Link href={n.link} className="font-titulo text-sm font-bold text-indigo">Abrir</Link>}
              {!n.lidoEm && (
                <form action={marcarNotificacaoComoLida}>
                  <input type="hidden" name="id" value={n.id} />
                  <button className="font-titulo text-sm font-bold text-tinta-clara">Marcar como lida</button>
                </form>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="card mt-8">
        <h2 className="font-titulo text-xl font-extrabold">Preferências</h2>
        <p className="mt-1 text-sm text-tinta-clara">
          Avisos essenciais de acesso, segurança e cobrança continuam ativos.
        </p>
        <form action={salvarPreferenciasNotificacao} className="mt-5 space-y-4">
          {CAMPOS.map(([chave, titulo, descricao]) => (
            <label key={chave} className="flex cursor-pointer items-start gap-3 rounded-xl border border-borda p-3">
              <input
                type="checkbox"
                name={chave}
                defaultChecked={preferencias?.[chave] ?? true}
                className="mt-1 h-5 w-5 accent-indigo"
              />
              <span><strong className="block font-titulo">{titulo}</strong><span className="text-sm text-tinta-clara">{descricao}</span></span>
            </label>
          ))}
          <button className="btn-primario">Salvar preferências</button>
        </form>
      </section>
    </div>
  );
}

