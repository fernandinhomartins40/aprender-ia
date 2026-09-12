import Link from "next/link";
import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";
import { acessoDoAluno } from "@/server/acesso";
import { assinaturaVale, podeVerModulo } from "@/lib/motor-acesso";
import { ROTULO_STATUS } from "@/lib/assinaturas";
import { reais } from "@/lib/dinheiro";
import { IconeApp } from "@/components/icone-app";

export const dynamic = "force-dynamic";

/**
 * Meus planos e o que eles liberam.
 *
 * Mostra ao aluno, com a mesma fonte que o servidor usa para autorizar:
 * que planos ele tem, o que alcança e — quando bloqueado — o que falta.
 * Sem isto, o conteúdo trancado aparecia sem explicação nenhuma.
 */
export default async function MeusPlanos() {
  const user = await exigirAluno();

  const [acesso, assinaturas, cursos, planosOfertados] = await Promise.all([
    acessoDoAluno(user.id),
    prisma.subscription.findMany({
      where: { userId: user.id },
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        status: true,
        cicloFimEm: true,
        semExpiracao: true,
        precoCentavos: true,
        concedidaManualmente: true,
        plan: { select: { nome: true, gratuito: true, descricao: true } },
      },
    }),
    prisma.course.findMany({
      where: { publicado: true },
      orderBy: { ordem: "asc" },
      select: {
        id: true,
        titulo: true,
        modulos: { orderBy: { ordem: "asc" }, select: { id: true, titulo: true, ordem: true } },
      },
    }),
    // Para explicar o bloqueio: que planos existem e dão o que falta.
    prisma.plan.findMany({
      where: { ativo: true, publico: true, gratuito: false },
      orderBy: { ordem: "asc" },
      select: {
        id: true,
        nome: true,
        precoCentavos: true,
        cursos: { select: { courseId: true } },
      },
    }),
  ]);

  const agora = new Date();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">Meus planos</h1>
        <p className="mt-1 max-w-2xl text-tinta-clara">
          O que você tem hoje e a que conteúdo isso dá acesso.
        </p>
      </div>

      {/* ---------------------------------------------- planos ---- */}
      <section className="mb-8">
        <h2 className="mb-3 font-titulo text-xl font-extrabold">Seus planos</h2>

        {assinaturas.length === 0 ? (
          <div className="card">
            <p className="text-tinta-clara">
              Você está no acesso gratuito da plataforma. O conteúdo liberado
              aparece abaixo.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {assinaturas.map((a) => {
              const vale = assinaturaVale(
                {
                  id: a.id,
                  status: a.status,
                  cicloFimEm: a.cicloFimEm,
                  semExpiracao: a.semExpiracao,
                  plano: { id: "", nome: a.plan.nome, gratuito: a.plan.gratuito, cursos: [] },
                },
                agora,
              );

              return (
                <li key={a.id} className="card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-titulo font-bold">
                        {a.plan.nome}
                        {a.plan.gratuito && <span className="ml-2 selo-indigo">gratuito</span>}
                      </p>
                      {a.plan.descricao && (
                        <p className="mt-0.5 text-sm text-tinta-clara">{a.plan.descricao}</p>
                      )}
                      <p className="mt-1.5 text-sm text-tinta-clara">
                        {a.semExpiracao
                          ? "Acesso sem data de término"
                          : a.cicloFimEm
                            ? `Acesso até ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(a.cicloFimEm)}`
                            : "Sem prazo definido"}
                        {a.concedidaManualmente && " · concedido pela coordenação"}
                      </p>
                    </div>
                    <span className={vale.vale ? "selo-verde" : "selo-cinza"}>
                      {vale.vale ? "Ativo" : ROTULO_STATUS[a.status]}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ------------------------------------------- conteúdos ---- */}
      <section>
        <h2 className="mb-3 font-titulo text-xl font-extrabold">Seus cursos</h2>

        {acesso.contaSuspensa && (
          <p className="mb-3 rounded-lg border border-vermelho bg-vermelho-soft p-4 text-sm text-vermelho-dark">
            Seu acesso está temporariamente suspenso. Seu progresso está guardado —
            fale com a coordenação para regularizar.
          </p>
        )}

        <ul className="space-y-3">
          {cursos.map((c) => {
            const doCurso = acesso.porCurso.get(c.id);
            const completo = acesso.irrestrito || doCurso?.tipo === "completo";
            const liberados = c.modulos.filter(
              (m) => podeVerModulo(acesso, c.id, m.id).permitido,
            );
            const bloqueados = c.modulos.length - liberados.length;

            // Que plano à venda daria o que falta. Só citamos planos que
            // realmente incluem este curso — sugerir um que não resolve
            // seria pior que não sugerir nada.
            const planosQueResolvem = planosOfertados.filter((p) =>
              p.cursos.some((pc) => pc.courseId === c.id),
            );

            return (
              <li key={c.id} className="card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <IconeApp nome="cursos" tamanho={34} />
                    <p className="font-titulo font-bold">{c.titulo}</p>
                  </div>
                  <span
                    className={
                      completo ? "selo-verde" : liberados.length > 0 ? "selo-amarelo" : "selo-cinza"
                    }
                  >
                    {completo
                      ? "acesso completo"
                      : liberados.length > 0
                        ? `${liberados.length} de ${c.modulos.length} módulos`
                        : "sem acesso"}
                  </span>
                </div>

                {liberados.length > 0 && (
                  <Link
                    href="/app/trilha"
                    className="mt-3 inline-block text-sm font-bold text-indigo hover:underline"
                  >
                    Abrir na trilha →
                  </Link>
                )}

                {/* O requisito pede explicar o bloqueio, não só escondê-lo. */}
                {!completo && bloqueados > 0 && (
                  <div className="mt-3 rounded-lg bg-fundo p-3.5">
                    <p className="text-sm font-semibold text-tinta">
                      {bloqueados} módulo(s) fora do seu plano
                    </p>
                    {planosQueResolvem.length > 0 ? (
                      <p className="mt-1 text-sm text-tinta-clara">
                        Incluídos em:{" "}
                        {planosQueResolvem
                          .map((p) => `${p.nome} (${reais(p.precoCentavos)})`)
                          .join(", ")}
                        . Fale com a coordenação para liberar.
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-tinta-clara">
                        Fale com a coordenação para saber como liberar.
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
