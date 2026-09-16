"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { passoDoProfessorPorOrdem } from "@/server/acoes-aula";

/**
 * Leva o aluno à página que o professor está mostrando.
 *
 * Durante a aula presencial, o professor avança no projetor e a turma precisa
 * acompanhar sem procurar a página certa. Aqui isso acontece sozinho — mas só
 * enquanto o aluno não decide olhar outra coisa: no instante em que ele navega
 * por conta própria, o "seguir" se desliga e vira um convite discreto, porque
 * arrastar alguém para fora do que ele está lendo é pior do que deixá-lo
 * perdido por um momento.
 */
export function SegueOProfessor({
  scriptOrdem,
  passoAtual,
  passoInicialDoProfessor,
}: {
  scriptOrdem: number;
  passoAtual: number;
  passoInicialDoProfessor: number | null;
}) {
  const router = useRouter();
  const [ondeEle, setOndeEle] = useState(passoInicialDoProfessor);
  // Começa seguindo quando o aluno chegou na mesma página do professor — é o
  // caso de quem acabou de entrar na aula. Se ele abriu outra, está lendo por
  // conta própria, e não seria levado embora sem pedir.
  const [seguindo, setSeguindo] = useState(
    passoInicialDoProfessor === null || passoInicialDoProfessor === passoAtual,
  );

  // Poll simples em vez de websocket: a aplicação não tem infraestrutura de
  // tempo real, e a consulta devolve só um número.
  useEffect(() => {
    let vivo = true;
    const perguntar = () =>
      passoDoProfessorPorOrdem(scriptOrdem)
        .then((n) => vivo && setOndeEle(n))
        .catch(() => {});
    const t = setInterval(perguntar, 8000);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, [scriptOrdem]);

  useEffect(() => {
    if (!seguindo || ondeEle === null || ondeEle === passoAtual) return;
    router.push(`/app/aula/${scriptOrdem}/${ondeEle}`);
  }, [seguindo, ondeEle, passoAtual, router, scriptOrdem]);

  if (ondeEle === null || ondeEle === passoAtual) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-verde-soft px-4 py-3">
      <span aria-hidden className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verde opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-verde" />
      </span>
      <span className="min-w-0 flex-1 font-titulo text-sm font-bold text-verde-dark">
        O professor está na página {ondeEle}
      </span>
      <Link
        href={`/app/aula/${scriptOrdem}/${ondeEle}`}
        onClick={() => setSeguindo(true)}
        className="shrink-0 rounded-full bg-verde-dark px-4 py-1.5 font-titulo text-xs font-bold text-white"
      >
        Acompanhar
      </Link>
    </div>
  );
}
