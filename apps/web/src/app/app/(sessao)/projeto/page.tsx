import Link from "next/link";
import { exigirAluno } from "@/server/trilha";
import { resolverCursoAtivo } from "@/server/curso-ativo";
import { meuProjeto } from "@/server/projeto-final";
import { PLANO_SECOES } from "@/lib/plano-adocao";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meu plano de adoção de IA" };

/**
 * O Plano de Adoção, montado com o que o cursista respondeu ao longo do
 * curso.
 *
 * É a única tela pensada para sair da plataforma: o cursista imprime ou
 * salva em PDF pelo próprio navegador e mostra a quem precisar. Por isso
 * ela não tem interatividade nenhuma — só o texto dele, organizado, com
 * as instruções de impressão escondidas na hora de imprimir.
 */
export default async function Projeto({
  searchParams,
}: {
  searchParams: Promise<{ curso?: string }>;
}) {
  const user = await exigirAluno();
  const { curso: cursoPedido } = await searchParams;
  const curso = await resolverCursoAtivo(user.id, cursoPedido);
  const projeto = curso ? await meuProjeto(user.id, curso.id) : null;

  const nome = projeto?.negocio?.nome?.trim();
  const ramo = projeto?.negocio?.ramo?.trim();
  const preenchidas = PLANO_SECOES.filter((s) =>
    (projeto?.secoes?.[s.chave] ?? []).some((r) => r?.trim()),
  );

  if (!projeto || preenchidas.length === 0) {
    return (
      <main className="mx-auto max-w-3xl py-6">
        <h1 className="font-titulo text-2xl font-extrabold">
          Meu plano de adoção de IA
        </h1>
        <p className="mt-2 text-tinta-clara">
          Seu plano se monta sozinho conforme você responde o projeto final ao
          longo do curso. Comece pela trilha e volte aqui quando quiser ver
          como está ficando.
        </p>
        <Link href="/app/trilha" className="btn-primario mt-6 inline-block">
          Ir para a trilha
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl py-6">
      {/* Some na impressão: quem tem o papel na mão não clica em nada. */}
      <div className="print:hidden">
        <Link href="/app/trilha" className="text-sm font-bold text-indigo hover:underline">
          ← Voltar para a trilha
        </Link>
      </div>

      <header className="mt-4 border-b border-borda pb-5">
        <h1 className="font-titulo text-3xl font-extrabold text-tinta">
          Plano de adoção de IA
        </h1>
        <p className="mt-1 text-lg text-tinta-clara">
          {nome ?? "Meu negócio"}
          {ramo ? ` · ${ramo}` : ""}
        </p>
        <p className="mt-2 text-sm text-cinza">
          Feito por {user.name ?? "um cursista"} em{" "}
          {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date())}
        </p>
      </header>

      <div className="mt-7 space-y-7">
        {preenchidas.map((s) => {
          const respostas = (projeto.secoes?.[s.chave] ?? []).filter((r) => r?.trim());
          return (
            <section key={s.chave} className="break-inside-avoid">
              <h2 className="font-titulo text-xl font-extrabold text-tinta">
                {s.titulo}
              </h2>
              {s.explicacao && (
                <p className="mt-1 text-sm text-cinza">{s.explicacao}</p>
              )}
              <ul className="mt-3 space-y-2">
                {respostas.map((r, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-borda bg-white p-4 text-tinta-clara"
                  >
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <footer className="mt-10 border-t border-borda pt-5 text-sm text-cinza">
        <p>
          Este plano é um ponto de partida. Reveja em 30 dias: o que funcionou
          continua, o que não funcionou sai, e uma tarefa nova entra.
        </p>
      </footer>

      <div className="mt-6 print:hidden">
        <p className="text-sm text-tinta-clara">
          Para guardar ou enviar: use <strong>Imprimir</strong> no seu navegador
          e escolha <strong>Salvar como PDF</strong>.
        </p>
      </div>
    </main>
  );
}
