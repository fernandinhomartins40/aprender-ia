"use client";

import { useActionState, useState } from "react";
import type { ResultadoNotificacao } from "@/server/notificacoes";

type Acao = (
  anterior: ResultadoNotificacao | null,
  dados: FormData,
) => Promise<ResultadoNotificacao>;

type Destino = "aluno" | "turma" | "todos" | "inadimplentes" | "free_a_vencer" | "free_expirado";

const DESTINOS: { valor: Destino; rotulo: string; ajuda: string }[] = [
  { valor: "aluno", rotulo: "Um aluno", ajuda: "Escolha a pessoa na lista." },
  { valor: "turma", rotulo: "Uma turma", ajuda: "Todos os alunos matriculados na turma." },
  { valor: "todos", rotulo: "Todos os alunos", ajuda: "Use com parcimônia." },
  {
    valor: "inadimplentes",
    rotulo: "Inadimplentes",
    ajuda: "Quem tem cobrança vencida em aberto.",
  },
  {
    valor: "free_a_vencer",
    rotulo: "Acesso gratuito a vencer",
    ajuda: "Quem tem prazo terminando nos próximos 7 dias.",
  },
  {
    valor: "free_expirado",
    rotulo: "Acesso gratuito expirado",
    ajuda: "Quem já perdeu o acesso e pode voltar.",
  },
];

/**
 * Envio de mensagem pelo painel.
 *
 * A mensagem sempre fica registrada no painel do aluno. O e-mail é
 * opcional e pode falhar — quem se cadastrou só com telefone não tem
 * e-mail real, e a lista abaixo mostra esses casos para você mandar pelo
 * WhatsApp.
 */
export function FormNotificacao({
  acao,
  alunos,
  turmas,
}: {
  acao: Acao;
  alunos: { id: string; nome: string; email: string; telefone: string | null }[];
  turmas: { id: string; nome: string; inscritos: number }[];
}) {
  const [estado, enviar, pendente] = useActionState(acao, null);
  const [destino, setDestino] = useState<Destino>("aluno");

  const escolhido = DESTINOS.find((d) => d.valor === destino);

  return (
    <section className="card">
      <h2 className="font-titulo text-xl font-extrabold">Enviar mensagem</h2>
      <p className="mt-1 text-sm text-tinta-clara">
        Fica registrada no painel do aluno. Marque o e-mail para tentar
        entregar também na caixa de entrada.
      </p>

      {estado && (
        <div
          role="status"
          className={`mt-4 rounded-md border-l-4 px-4 py-3 ${
            estado.ok
              ? "border-verde bg-verde-soft text-verde-dark"
              : "border-vermelho bg-vermelho-soft text-vermelho-dark"
          }`}
        >
          {estado.mensagem}
        </div>
      )}

      <form action={enviar} className="mt-5 grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label>
            <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
              Para quem
            </span>
            <select
              name="destino"
              value={destino}
              onChange={(e) => setDestino(e.target.value as Destino)}
              className="campo w-full"
            >
              {DESTINOS.map((d) => (
                <option key={d.valor} value={d.valor}>
                  {d.rotulo}
                </option>
              ))}
            </select>
            {escolhido && (
              <span className="mt-1 block text-xs text-cinza">{escolhido.ajuda}</span>
            )}
          </label>

          {destino === "aluno" && (
            <label>
              <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
                Aluno
              </span>
              <select name="alvoId" required className="campo w-full">
                <option value="">Selecione…</option>
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome} {a.telefone ? `· ${a.telefone}` : `· ${a.email}`}
                  </option>
                ))}
              </select>
            </label>
          )}

          {destino === "turma" && (
            <label>
              <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
                Turma
              </span>
              <select name="alvoId" required className="campo w-full">
                <option value="">Selecione…</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} · {t.inscritos} aluno(s)
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <label>
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
            Título
          </span>
          <input
            name="titulo"
            required
            placeholder="Nosso próximo encontro mudou de sala"
            className="campo w-full"
          />
        </label>

        <label>
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
            Mensagem
          </span>
          <textarea
            name="corpo"
            required
            rows={5}
            placeholder="Escreva como você falaria com a pessoa."
            className="campo w-full"
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-bold text-tinta-clara">
          <input type="checkbox" name="porEmail" className="h-4 w-4" />
          Tentar enviar por e-mail também
        </label>

        <div>
          <button type="submit" disabled={pendente} className="btn-primario">
            {pendente ? "Enviando…" : "Enviar mensagem"}
          </button>
        </div>
      </form>
    </section>
  );
}
