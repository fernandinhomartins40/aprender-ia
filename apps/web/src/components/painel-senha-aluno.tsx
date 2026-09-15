"use client";

import { useActionState, useState } from "react";
import type { ResultadoAluno } from "@/server/aluno-individual";

/**
 * Gera uma senha provisória nova para o aluno.
 *
 * Fica atrás de um clique, e não aberto na tela, porque é uma ação
 * destrutiva: a senha anterior deixa de valer no instante em que esta é
 * gerada. Um botão solto ao lado dos dados cadastrais seria clicado por
 * engano.
 *
 * A senha aparece uma única vez. O banco guarda só o hash, então não existe
 * "ver de novo" — o texto diz isso antes, não depois.
 */
export function PainelSenhaAluno({
  userId,
  acao,
}: {
  userId: string;
  acao: (
    anterior: ResultadoAluno | null,
    dados: FormData,
  ) => Promise<ResultadoAluno>;
}) {
  const [estado, enviar, enviando] = useActionState(acao, null);
  const [aberto, setAberto] = useState(false);

  return (
    <section className="mb-6 rounded-xl border border-borda bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-titulo text-lg font-extrabold text-tinta">Senha de acesso</h2>
          <p className="mt-0.5 text-sm text-tinta-clara">
            Para o aluno que perdeu a senha e não tem e-mail que receba mensagem.
          </p>
        </div>
        {!aberto && (
          <button onClick={() => setAberto(true)} className="btn-secundario">
            Gerar senha nova
          </button>
        )}
      </div>

      {aberto && (
        <form action={enviar} className="mt-4 space-y-3">
          <input type="hidden" name="userId" value={userId} />

          <label className="block max-w-xs">
            <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
              Senha <span className="font-normal text-cinza">(opcional)</span>
            </span>
            <input name="senha" className="campo w-full" placeholder="Vazio = gerar automática" />
          </label>

          <p className="rounded-lg border border-amarelo/40 bg-amarelo-soft p-3 text-sm text-tinta-clara">
            A senha atual do aluno deixa de funcionar assim que esta for gerada.
          </p>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={enviando} className="btn-primario">
              {enviando ? "Gerando…" : "Confirmar e gerar"}
            </button>
            <button type="button" onClick={() => setAberto(false)} className="btn-secundario">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {estado && (
        <div
          role="status"
          className={`mt-4 rounded-xl border p-4 text-sm ${
            estado.ok
              ? "border-verde/30 bg-verde-soft text-verde-dark"
              : "border-vermelho/30 bg-vermelho-soft text-vermelho-dark"
          }`}
        >
          <p className="font-bold">{estado.mensagem}</p>
          {estado.senhaProvisoria && (
            <div className="mt-3 rounded-lg border border-borda bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-cinza">
                Senha provisória
              </p>
              <p className="mt-1 font-mono text-lg font-bold text-tinta">
                {estado.senhaProvisoria}
              </p>
              <p className="mt-1 text-xs text-tinta-clara">
                Anote agora: ela não pode ser consultada depois.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
