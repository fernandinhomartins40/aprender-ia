"use client";

import { useActionState, useState } from "react";
import type { Periodicidade } from "@aprender/db";
import type { ResultadoAssinatura } from "@/server/assinaturas";
import { ROTULO_PERIODO } from "@/lib/assinaturas";

type Acao = (
  anterior: ResultadoAssinatura | null,
  dados: FormData,
) => Promise<ResultadoAssinatura>;

export type PlanoParaForm = {
  id: string;
  nome: string;
  descricao: string | null;
  precoCentavos: number;
  periodicidade: Periodicidade;
  diasAcesso: number | null;
  diasFree: number | null;
  diasTeste: number;
  gratuito: boolean;
  ativo: boolean;
  publico: boolean;
  destaque: boolean;
  ordem: number;
  beneficios: string[];
};

const PERIODOS: Periodicidade[] = ["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL", "UNICA"];

/**
 * Cadastro e edição de plano.
 *
 * Recolhido por padrão quando é "novo plano": a tela principal é a lista,
 * e um formulário aberto empurraria tudo para baixo.
 */
export function FormPlano({
  acao,
  plano,
  aberto: abertoInicial = false,
}: {
  acao: Acao;
  plano?: PlanoParaForm;
  aberto?: boolean;
}) {
  const [estado, enviar, pendente] = useActionState(acao, null);
  const [aberto, setAberto] = useState(abertoInicial || Boolean(plano));
  // O campo "dias de acesso" só existe em pagamento único, e é obrigatório
  // ali — por isso a periodicidade é estado, não só um <select> solto.
  const [periodo, setPeriodo] = useState<Periodicidade>(plano?.periodicidade ?? "MENSAL");
  // Controlado para que o campo de dias free apareça/suma junto com a marcação.
  const [gratuito, setGratuito] = useState(plano?.gratuito ?? false);

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="btn-primario">
        Novo plano
      </button>
    );
  }

  return (
    <section className="card">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-titulo text-xl font-extrabold">
            {plano ? `Editar "${plano.nome}"` : "Novo plano"}
          </h2>
          <p className="mt-1 text-sm text-tinta-clara">
            O preço fica travado em cada assinatura já feita: reajustar aqui
            vale só para quem assinar depois.
          </p>
        </div>
        {!plano && (
          <button onClick={() => setAberto(false)} className="text-sm text-cinza hover:text-tinta">
            cancelar
          </button>
        )}
      </div>

      {estado && (
        <div
          role="status"
          className={`mb-5 rounded-md border-l-4 px-4 py-3 ${
            estado.ok
              ? "border-verde bg-verde-soft text-verde-dark"
              : "border-vermelho bg-vermelho-soft text-vermelho-dark"
          }`}
        >
          {estado.mensagem}
        </div>
      )}

      <form action={enviar} className="grid gap-4 md:grid-cols-6">
        {plano && <input type="hidden" name="id" value={plano.id} />}

        <label className="md:col-span-3">
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">Nome</span>
          <input
            name="nome"
            required
            defaultValue={plano?.nome}
            placeholder="Acesso completo"
            className="campo w-full"
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
            Preço (R$)
          </span>
          <input
            name="preco"
            required
            inputMode="decimal"
            defaultValue={plano ? (plano.precoCentavos / 100).toFixed(2).replace(".", ",") : ""}
            placeholder="97,00"
            className="campo w-full"
          />
        </label>

        <label>
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">Ordem</span>
          <input
            name="ordem"
            type="number"
            defaultValue={plano?.ordem ?? 0}
            className="campo w-full"
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
            Periodicidade
          </span>
          <select
            name="periodicidade"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as Periodicidade)}
            className="campo w-full"
          >
            {PERIODOS.map((p) => (
              <option key={p} value={p}>
                {ROTULO_PERIODO[p]}
              </option>
            ))}
          </select>
        </label>

        {periodo === "UNICA" ? (
          <label className="md:col-span-2">
            <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
              Dias de acesso
            </span>
            <input
              name="diasAcesso"
              type="number"
              min={1}
              required
              defaultValue={plano?.diasAcesso ?? 90}
              className="campo w-full"
            />
            <span className="mt-1 block text-xs text-cinza">
              Quanto tempo a compra libera.
            </span>
          </label>
        ) : (
          <label className="md:col-span-2">
            <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
              Dias de teste
            </span>
            <input
              name="diasTeste"
              type="number"
              min={0}
              defaultValue={plano?.diasTeste ?? 0}
              className="campo w-full"
            />
            <span className="mt-1 block text-xs text-cinza">
              0 = cobra desde o primeiro dia.
            </span>
          </label>
        )}

        <div className="flex flex-wrap items-end gap-4 md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-bold text-tinta-clara">
            <input
              type="checkbox"
              name="ativo"
              defaultChecked={plano?.ativo ?? true}
              className="h-4 w-4"
            />
            Ativo
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-tinta-clara">
            <input
              type="checkbox"
              name="publico"
              defaultChecked={plano?.publico ?? true}
              className="h-4 w-4"
            />
            Na landing
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-tinta-clara">
            <input
              type="checkbox"
              name="destaque"
              defaultChecked={plano?.destaque ?? false}
              className="h-4 w-4"
            />
            Destaque
          </label>
          {/* O plano gratuito da plataforma: define o que recebe quem não
              tem plano pago. Só um pode existir por vez (o servidor
              recusa o segundo) e o preço é zerado ao salvar. */}
          <label className="flex items-center gap-2 text-sm font-bold text-indigo-dark">
            <input
              type="checkbox"
              name="gratuito"
              checked={gratuito}
              onChange={(e) => setGratuito(e.target.checked)}
              className="h-4 w-4"
            />
            É o plano gratuito
          </label>
        </div>

        {/* Prazo do acesso gratuito deste plano.
            Só aparece quando o plano É o gratuito: num plano pago o campo
            não teria significado, e um número guardado ali viraria
            configuração morta esperando para confundir alguém. */}
        {gratuito && (
          <label className="md:col-span-6">
            <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
              Dias de acesso gratuito
            </span>
            <input
              name="diasFree"
              type="number"
              min={0}
              placeholder="Deixe vazio para usar o padrão da plataforma"
              defaultValue={plano?.diasFree ?? ""}
              className="campo w-full"
            />
            <span className="mt-1 block text-xs text-cinza">
              Quantos dias de acesso um aluno novo recebe por este plano. Vazio = usa o
              padrão de Configurações → Acesso gratuito. 0 = sem expiração. O prazo de um
              aluno específico, definido na tela dele, sempre vence este valor.
            </span>
          </label>
        )}

        <label className="md:col-span-6">
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
            Descrição
          </span>
          <input
            name="descricao"
            defaultValue={plano?.descricao ?? ""}
            placeholder="Para quem quer a trilha inteira, com certificado."
            className="campo w-full"
          />
        </label>

        <label className="md:col-span-6">
          <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
            Benefícios
          </span>
          <textarea
            name="beneficios"
            rows={4}
            defaultValue={plano?.beneficios.join("\n") ?? ""}
            placeholder={"Trilha completa de 40 horas\nCertificado\nBiblioteca de prompts"}
            className="campo w-full"
          />
          <span className="mt-1 block text-xs text-cinza">
            Um por linha. Aparecem na landing, na ordem em que você escrever.
          </span>
        </label>

        <div className="md:col-span-6">
          <button type="submit" disabled={pendente} className="btn-primario">
            {pendente ? "Salvando…" : plano ? "Salvar alterações" : "Criar plano"}
          </button>
        </div>
      </form>
    </section>
  );
}
