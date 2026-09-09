import Link from "next/link";
import { metricasGerais, ferramentasMaisUsadas } from "@/server/admin";

export const dynamic = "force-dynamic";

function Cartao({
  rotulo,
  valor,
  detalhe,
  cor,
}: {
  rotulo: string;
  valor: number | string;
  detalhe?: string;
  cor: string;
}) {
  return (
    <div className="card border-t-4" style={{ borderTopColor: cor }}>
      <p className="font-titulo text-4xl font-extrabold" style={{ color: cor }}>
        {valor}
      </p>
      <p className="mt-1 font-titulo text-sm font-bold text-tinta">{rotulo}</p>
      {detalhe && <p className="mt-1 text-sm text-cinza">{detalhe}</p>}
    </div>
  );
}

export default async function VisaoGeral() {
  const m = await metricasGerais();
  const ferramentas = await ferramentasMaisUsadas();
  const maisUsada = ferramentas[0]?.usos ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-titulo text-3xl font-extrabold">Visão geral</h1>
        <p className="mt-1 text-tinta-clara">
          Acompanhe a adoção da plataforma pelos professores.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Cartao
          rotulo="Professores cadastrados"
          valor={m.alunos}
          detalhe={`${m.novosNaSemana} nos últimos 7 dias`}
          cor="#4F46E5"
        />
        <Cartao
          rotulo="Matrículas ativas"
          valor={m.matriculas}
          detalhe={`em ${m.cursos} curso(s)`}
          cor="#0EA5E9"
        />
        <Cartao
          rotulo="Lições concluídas"
          valor={m.licoesFeitas}
          cor="#10B981"
        />
        <Cartao
          rotulo="Prompts executados"
          valor={m.execucoes}
          detalhe="prática real com IA"
          cor="#F97316"
        />
      </div>

      {/* ---- Ferramentas mais usadas ---- */}
      <section className="mt-10">
        <h2 className="font-titulo text-xl font-extrabold">
          Ferramentas que os professores mais usam
        </h2>
        <p className="mt-1 text-tinta-clara">
          Baseado nos prompts realmente executados na plataforma.
        </p>

        <div className="card mt-4">
          {ferramentas.length === 0 ? (
            <p className="py-6 text-center text-cinza">
              Ainda não há prompts executados. Os dados aparecem quando os
              professores começarem a praticar.
            </p>
          ) : (
            <ul className="space-y-3">
              {ferramentas.map((f) => (
                <li key={f.ferramenta} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 font-titulo text-sm font-bold capitalize">
                    {f.ferramenta}
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-indigo-soft">
                    <div
                      className="h-full rounded-full bg-grad-marca"
                      style={{ width: `${Math.round((f.usos / maisUsada) * 100)}%` }}
                    />
                  </div>
                  <span className="w-14 shrink-0 text-right text-sm text-tinta-clara">
                    {f.usos}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ---- Atalhos ---- */}
      <section className="mt-10">
        <h2 className="font-titulo text-xl font-extrabold">Gerenciar</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Link href="/admin/alunos" className="card transition-shadow hover:shadow-lg">
            <div className="text-3xl">👩‍🏫</div>
            <h3 className="mt-2 font-titulo font-bold">Alunos</h3>
            <p className="mt-1 text-sm text-tinta-clara">
              Ver progresso, buscar e definir permissões
            </p>
          </Link>
          <Link href="/admin/cursos" className="card transition-shadow hover:shadow-lg">
            <div className="text-3xl">📚</div>
            <h3 className="mt-2 font-titulo font-bold">Cursos</h3>
            <p className="mt-1 text-sm text-tinta-clara">
              Módulos, lições e publicação
            </p>
          </Link>
          <Link href="/admin/turmas" className="card transition-shadow hover:shadow-lg">
            <div className="text-3xl">🎓</div>
            <h3 className="mt-2 font-titulo font-bold">Turmas</h3>
            <p className="mt-1 text-sm text-tinta-clara">
              Grupos com código de matrícula
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
