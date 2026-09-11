import Link from "next/link";
import { exigirAluno } from "@/server/trilha";
import { meuAcesso, solicitarAcesso } from "@/server/acesso-free";
import { SolicitarAcesso } from "@/components/solicitar-acesso";
import { textoPrazo } from "@/lib/acesso-free";

export const dynamic = "force-dynamic";

const ROTULO_STATUS: Record<string, { texto: string; classe: string }> = {
  PENDENTE: { texto: "Em análise", classe: "selo-amarelo" },
  APROVADA: { texto: "Aprovado", classe: "selo-verde" },
  RECUSADA: { texto: "Não aprovado", classe: "selo-vermelho" },
};

function dataLonga(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(d));
}

/**
 * "Meu acesso" — o aluno vê o que tem, até quando, e o que acontece
 * depois.
 *
 * Existe porque um prazo que expira sem aviso é uma porta que fecha na
 * cara de quem estava estudando.
 */
export default async function MeuAcesso() {
  await exigirAluno();
  const acesso = await meuAcesso();

  if (!acesso) {
    return (
      <div className="card text-center">
        <p className="py-8 text-cinza">Não foi possível carregar seus dados.</p>
      </div>
    );
  }

  const { situacao, plano, premiumAte } = acesso;
  const ehPremium = plano === "PREMIUM";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-titulo text-3xl font-extrabold">Meu acesso</h1>
      <p className="mt-1 text-tinta-clara">
        Até quando você pode usar a plataforma, e o que acontece depois.
      </p>

      {/* ---------- Situação atual ---------- */}
      <div className="card mt-6">
        {ehPremium ? (
          <>
            <span className="selo-verde">Plano completo</span>
            <p className="mt-3 font-titulo text-2xl font-extrabold">
              {premiumAte
                ? `Ativo até ${dataLonga(premiumAte)}`
                : "Ativo, sem prazo de término"}
            </p>
            <p className="mt-2 text-tinta-clara">
              Você tem acesso a todos os cursos, inclusive os pagos.
            </p>
          </>
        ) : situacao.revogado ? (
          <>
            <span className="selo-vermelho">Acesso encerrado</span>
            <p className="mt-3 font-titulo text-2xl font-extrabold">
              Seu acesso gratuito foi encerrado
            </p>
            <p className="mt-2 text-tinta-clara">
              Seu progresso e suas anotações continuam salvos. Você pode pedir um
              novo período abaixo.
            </p>
          </>
        ) : situacao.permanente ? (
          <>
            <span className="selo-verde">Acesso gratuito</span>
            <p className="mt-3 font-titulo text-2xl font-extrabold">
              Sem prazo de término
            </p>
            <p className="mt-2 text-tinta-clara">
              Você pode estudar no seu ritmo, sem data limite.
            </p>
          </>
        ) : situacao.expirado ? (
          <>
            <span className="selo-vermelho">Prazo terminado</span>
            <p className="mt-3 font-titulo text-2xl font-extrabold">
              Seu acesso gratuito terminou
            </p>
            <p className="mt-2 text-tinta-clara">
              Seu progresso e suas anotações continuam salvos — nada foi apagado.
              Peça um novo período abaixo para continuar de onde parou.
            </p>
          </>
        ) : (
          <>
            <span className={situacao.avisar ? "selo-amarelo" : "selo-verde"}>
              Acesso gratuito
            </span>
            <p className="mt-3 font-titulo text-2xl font-extrabold">
              Termina {textoPrazo(situacao.diasRestantes ?? 0)}
            </p>
            <p className="mt-2 text-tinta-clara">
              {situacao.avisar
                ? "Aproveite este período para concluir as lições que faltam. Quando o prazo terminar, seu progresso continua salvo e você poderá pedir mais tempo."
                : "Você está com acesso liberado. Bons estudos!"}
            </p>
            <Link href="/app/trilha" className="btn-primario mt-4">
              Continuar minha trilha
            </Link>
          </>
        )}
      </div>

      {/* ---------- Pedido de novo acesso ---------- */}
      {!ehPremium && (situacao.expirado || situacao.revogado || situacao.avisar) && (
        <div className="card mt-6">
          <h2 className="font-titulo text-xl font-extrabold">
            Pedir um novo período
          </h2>
          {acesso.podeSolicitar ? (
            <>
              <p className="mt-1 text-tinta-clara">
                O pedido vai para a coordenação, que define por quanto tempo
                liberar. Não é automático.
              </p>
              <div className="mt-4">
                <SolicitarAcesso
                  acao={solicitarAcesso}
                  temPendente={acesso.temPendente}
                />
              </div>
            </>
          ) : (
            <p className="mt-1 text-tinta-clara">
              Os pedidos estão fechados no momento. Fale com a coordenação do
              curso para liberar seu acesso.
            </p>
          )}
        </div>
      )}

      {/* ---------- Histórico ---------- */}
      {acesso.solicitacoes.length > 0 && (
        <div className="card mt-6">
          <h2 className="font-titulo text-lg font-bold">Seus pedidos</h2>
          <ul className="mt-3 divide-y divide-borda">
            {acesso.solicitacoes.map((s) => {
              const r = ROTULO_STATUS[s.status] ?? ROTULO_STATUS.PENDENTE!;
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className={r.classe}>{r.texto}</span>
                  <span className="text-sm text-tinta-clara">
                    Pedido em {dataLonga(s.criadoEm)}
                  </span>
                  {s.status === "APROVADA" && s.diasConcedidos && (
                    <span className="text-sm text-verde-dark">
                      +{s.diasConcedidos} dias
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
