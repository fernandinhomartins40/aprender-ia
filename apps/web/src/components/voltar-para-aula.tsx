import Link from "next/link";

/**
 * O caminho de volta para a aula.
 *
 * Quem abre a apostila pelo "Aprofunde na apostila" está no meio de uma aula,
 * às vezes com o professor projetando. Sem esta faixa, voltar significava
 * achar o índice dos capítulos, depois o das aulas, depois a página certa —
 * e no meio disso a aula já andou.
 *
 * A origem vem na URL (`?de=1.23`), e não de uma sessão guardada: assim o
 * botão continua correto se a pessoa abrir o link numa aba nova, mandar para
 * um colega ou voltar pelo histórico.
 */
export function VoltarParaAula({ de }: { de?: string }) {
  const [encontro, passo] = (de ?? "").split(".");
  if (!encontro || !passo) return null;
  if (!/^\d+$/.test(encontro) || !/^\d+$/.test(passo)) return null;

  return (
    <Link
      href={`/app/aula/${encontro}/${passo}`}
      className="mb-4 flex items-center gap-3 rounded-xl border border-indigo-line bg-indigo-soft px-4 py-3 transition-colors hover:brightness-95"
    >
      <span aria-hidden className="shrink-0 font-titulo text-lg text-indigo">
        ‹
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-titulo text-xs font-bold uppercase tracking-wide text-indigo">
          Voltar para a aula
        </span>
        <span className="block font-titulo text-sm font-bold text-indigo-dark">
          Encontro {encontro} · página {passo}
        </span>
      </span>
    </Link>
  );
}
