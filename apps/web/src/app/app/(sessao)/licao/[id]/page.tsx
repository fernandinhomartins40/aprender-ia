import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirAluno, carregarLicao } from "@/server/trilha";
import {
  concluirLicao,
  registrarPrompt,
  analisarResposta,
  registrarDesempenho,
  salvarEtapas,
} from "@/server/acoes";
import { LicaoCliente } from "@/components/licao-cliente";
import { AcessoBloqueado } from "@/components/acesso-bloqueado";
import { IconeApp } from "@/components/icone-app";
import { verbetes } from "@/server/conhecimento";
import { Termo } from "@/components/termo";
import { entregaDoLab, salvarEntregaLab } from "@/server/laboratorio";
import { meuProjeto, salvarProjeto } from "@/server/projeto-final";

export const dynamic = "force-dynamic";

/**
 * Termos que NÃO entram na marcação automática do texto da lição.
 *
 * "Lição", "trilha", "XP", "conquista" e "missão" são vocabulário da
 * própria plataforma: dentro do material do curso eles aparecem em
 * sentido comum ("nesta lição você vai…") e acender um ícone ali
 * explicaria o óbvio, poluindo o texto que o professor está lendo.
 */
const FORA_DA_MARCACAO = new Set([
  "licao",
  "trilha-formacao",
  "xp",
  "nivel",
  "ofensiva",
  "missao",
  "conquista",
  "diario-bordo",
  "banco-prompts",
]);

export default async function Licao({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await exigirAluno();
  const { id } = await params;
  const [dados, todosVerbetes] = await Promise.all([
    carregarLicao(user.id, id),
    verbetes(),
  ]);

  if (!dados) notFound();

  // Sem acesso ao curso (plano/suspensão) vem antes do bloqueio
  // sequencial: é um impedimento de outra natureza.
  if (dados.semAcesso) {
    return <AcessoBloqueado veredito={dados.veredito} />;
  }

  if (dados.bloqueada) {
    return (
      <div className="card text-center">
        <div className="py-10">
          <div className="mx-auto flex justify-center" aria-hidden="true">
            <IconeApp nome="seguranca" tamanho={56} prioridade />
          </div>
          <h1 className="mt-3 font-titulo text-xl font-bold">
            Lição bloqueada
          </h1>
          <p className="mt-2 text-tinta-clara">
            Conclua as lições anteriores para liberar esta.
          </p>
          <Link href="/app/trilha" className="btn-primario mt-6">
            Voltar para a trilha
          </Link>
        </div>
      </div>
    );
  }

  const { licao, resumo, proxima, posicao, totalLicoes } = dados;
  const template = licao.promptTemplates[0];

  // Só as lições que produzem algo carregam o que já foi escrito. As
  // outras não pagam a consulta.
  const entregaLab =
    licao.tipo === "LABORATORIO" ? await entregaDoLab(user.id, licao.id) : undefined;
  const projetoSalvo =
    licao.tipo === "PROJETO"
      ? ((await meuProjeto(user.id, dados.courseId)) ?? undefined)
      : undefined;

  const termos = Object.fromEntries(
    todosVerbetes
      .filter((v) => !FORA_DA_MARCACAO.has(v.slug))
      .map((v) => [v.slug, v]),
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/app/trilha"
          className="text-sm font-bold text-indigo hover:underline"
        >
          ← Voltar para a trilha
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-3 py-1 font-titulo text-xs font-bold text-white"
            style={{ background: resumo.moduloCor }}
          >
            {resumo.moduloTitulo}
          </span>
          <span className="text-sm text-cinza">
            Lição {posicao} de {totalLicoes} · {resumo.xp} XP
            <Termo slug="xp" contexto="trilha" rotulo="XP" />
          </span>
        </div>
        <h1 className="mt-3 font-titulo text-3xl font-extrabold">
          {licao.titulo}
        </h1>
        {/* A lição não repete a apostila: quando o assunto pede mais
            fôlego, aponta o capítulo. O link fecha o caminho — antes era
            só um rótulo, e o cursista tinha de procurar sozinho. */}
        {licao.capituloRef && (
          <Link
            href="/app/apostila"
            className="mt-1 inline-block text-sm text-cinza hover:text-indigo hover:underline"
          >
            Aprofunde na apostila · {licao.capituloRef} →
          </Link>
        )}
      </div>

      <LicaoCliente
        tipo={licao.tipo}
        conteudo={licao.conteudo}
        lessonId={licao.id}
        proximaId={proxima?.id ?? null}
        template={
          template
            ? {
                id: template.id,
                corpo: template.corpo,
                variaveis: (template.variaveis as any) ?? [],
                ferramentasSugeridas: template.ferramentasSugeridas,
                dica: template.dica,
              }
            : null
        }
        concluir={concluirLicao}
        registrar={registrarPrompt}
        analisar={analisarResposta}
        registrarDesempenho={registrarDesempenho}
        salvarEtapas={salvarEtapas}
        concluidaInicialmente={resumo.status === "CONCLUIDA"}
        respostasAbertas={dados.respostasAbertas}
        termos={termos}
        entregaLab={entregaLab}
        salvarEntrega={salvarEntregaLab}
        projetoSalvo={projetoSalvo}
        salvarProjeto={salvarProjeto}
      />
    </div>
  );
}
