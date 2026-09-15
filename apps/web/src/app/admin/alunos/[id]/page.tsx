import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirAdmin } from "@/server/admin";
import {
  alterarAssinaturaDoAluno,
  concederPlano,
  planosParaConceder,
  removerAssinaturaDoAluno,
  retratoDeAcesso,
} from "@/server/acesso-planos";
import { editarAluno, redefinirSenhaAluno } from "@/server/aluno-individual";
import { assinaturaVale, podeVerModulo } from "@/lib/motor-acesso";
import { AcessosDoAluno } from "@/components/acessos-do-aluno";
import { FormAluno } from "@/components/form-aluno";
import { PainelSenhaAluno } from "@/components/painel-senha-aluno";
import { TituloPagina } from "@/components/pagina-admin";

export const dynamic = "force-dynamic";

/**
 * Acessos de um aluno.
 *
 * Responde de uma vez às duas perguntas do requisito: que planos ele tem
 * e o que efetivamente alcança. O cálculo vem de `retratoDeAcesso`, que
 * usa o mesmo motor do acesso real — o que o administrador vê aqui é o
 * que o aluno encontra na trilha.
 */
export default async function AcessosAluno({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await exigirAdmin();
  const { id } = await params;

  const [retrato, planos] = await Promise.all([retratoDeAcesso(id), planosParaConceder()]);
  if (!retrato) notFound();

  const { aluno, acesso, cursos } = retrato;
  const agora = new Date();

  return (
    <div>
      <nav aria-label="Trilha" className="mb-4 text-sm">
        <Link href="/admin/alunos" className="font-semibold text-indigo hover:underline">
          Alunos e turmas
        </Link>
        <span className="mx-1.5 text-cinza">/</span>
        <span className="text-tinta-clara">{aluno.nome}</span>
      </nav>

      <TituloPagina
        titulo={aluno.nome}
        descricao={`${aluno.email} · ${aluno.papel === "ALUNO" ? "Aluno" : aluno.papel} · conta ${aluno.situacao.toLowerCase()}`}
      />

      {/* Dados cadastrais antes dos acessos: corrigir um telefone digitado
          errado é a operação mais frequente nesta tela, e antes dela não
          havia lugar nenhum para fazer isso. */}
      <section className="mb-6 rounded-xl border border-borda bg-white p-5 sm:p-6">
        <h2 className="mb-4 font-titulo text-lg font-extrabold text-tinta">
          Dados cadastrais
        </h2>
        <FormAluno
          acao={editarAluno}
          aluno={{
            id: aluno.id,
            nome: aluno.nome,
            email: aluno.email,
            telefone: aluno.telefone,
            situacao: aluno.situacao,
          }}
        />
      </section>

      <PainelSenhaAluno userId={aluno.id} acao={redefinirSenhaAluno} />

      <AcessosDoAluno
        userId={aluno.id}
        contaSuspensa={acesso.contaSuspensa}
        irrestrito={acesso.irrestrito}
        assinaturas={aluno.assinaturas.map((a) => ({
          id: a.id,
          planoNome: a.plan.nome,
          gratuito: a.plan.gratuito,
          status: a.status,
          inicioEm: a.inicioEm.toISOString(),
          cicloFimEm: a.cicloFimEm?.toISOString() ?? null,
          semExpiracao: a.semExpiracao,
          concedidaManualmente: a.concedidaManualmente,
          // A validade sai do motor, não de uma segunda leitura do status
          // — é o que impede a tela de divergir do acesso real.
          valeAgora: assinaturaVale(
            {
              id: a.id,
              status: a.status,
              cicloFimEm: a.cicloFimEm,
              semExpiracao: a.semExpiracao,
              plano: { id: a.plan.id, nome: a.plan.nome, gratuito: a.plan.gratuito, cursos: [] },
            },
            agora,
          ).vale,
        }))}
        cursos={cursos.map((c) => {
          const doCurso = acesso.porCurso.get(c.id);
          return {
            id: c.id,
            titulo: c.titulo,
            tipo: acesso.irrestrito ? "completo" : (doCurso?.tipo ?? "nenhum"),
            porPlanos:
              doCurso && doCurso.tipo !== "nenhum" ? [...new Set(doCurso.porPlanos)] : [],
            modulos: c.modulos.map((m) => ({
              id: m.id,
              titulo: m.titulo,
              ordem: m.ordem,
              liberado: podeVerModulo(acesso, c.id, m.id).permitido,
            })),
          };
        })}
        planos={planos.map((p) => ({
          id: p.id,
          nome: p.nome,
          gratuito: p.gratuito,
          ativo: p.ativo,
        }))}
        aoConceder={concederPlano}
        aoAlterar={alterarAssinaturaDoAluno}
        aoRemover={removerAssinaturaDoAluno}
      />
    </div>
  );
}
