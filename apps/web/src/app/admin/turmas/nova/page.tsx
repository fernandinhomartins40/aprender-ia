import Link from "next/link";
import { prisma } from "@aprender/db";
import { exigirAdmin, listarInstrutores } from "@/server/admin";
import { salvarTurma } from "@/server/turmas";
import { FormularioTurma } from "@/components/formulario-turma";
import { TituloPagina, Cartao, Vazio } from "@/components/pagina-admin";

/**
 * Cadastro de turma, em página própria.
 *
 * O formulário vivia recolhido dentro de `/admin/alunos`, que já é a tela
 * mais densa do painel. Cadastrar uma turma tem cronograma, local,
 * encontros e vagas — conteúdo com fluxo próprio, que merece uma rota
 * para onde se possa mandar um link e onde o refresh não perca o
 * preenchimento de contexto.
 *
 * O formulário continua disponível em `/admin/alunos` para quem cadastra
 * turma e alunos na mesma sessão: é o caminho que o cadastro em lote usa.
 */
export const dynamic = "force-dynamic";

export default async function NovaTurmaPagina() {
  await exigirAdmin();

  const [cursos, instrutores] = await Promise.all([
    prisma.course.findMany({
      select: { id: true, titulo: true },
      orderBy: { ordem: "asc" },
    }),
    listarInstrutores(),
  ]);

  return (
    <div>
      <TituloPagina
        titulo="Nova turma"
        descricao="Cronograma, local e código de matrícula. Os alunos entram depois, pelo código ou pelo cadastro em lote."
        acoes={
          <Link href="/admin/turmas" className="btn-secundario text-sm">
            Ver turmas
          </Link>
        }
      />

      {cursos.length === 0 ? (
        <Vazio
          titulo="Nenhum curso cadastrado"
          descricao="Uma turma pertence a um curso. Cadastre o curso primeiro."
          acao={
            <Link href="/admin/cursos" className="btn-primario text-sm">
              Ir para cursos
            </Link>
          }
        />
      ) : (
        <Cartao>
          <FormularioTurma acao={salvarTurma} cursos={cursos} instrutores={instrutores} />
        </Cartao>
      )}
    </div>
  );
}
