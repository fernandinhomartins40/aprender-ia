import Link from "next/link";
import { exigirAdmin } from "@/server/admin";
import {
  listarSolicitacoes,
  aprovarSolicitacao,
  recusarSolicitacao,
} from "@/server/acesso-free";
import { lerNumero } from "@/server/configuracoes";
import { CartaoPedido, type PedidoNaFila } from "@/components/fila-solicitacoes";

export const dynamic = "force-dynamic";

const FILTROS = [
  { valor: undefined, rotulo: "Todos" },
  { valor: "PENDENTE" as const, rotulo: "Aguardando" },
  { valor: "APROVADA" as const, rotulo: "Aprovados" },
  { valor: "RECUSADA" as const, rotulo: "Recusados" },
];

export default async function Solicitacoes({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await exigirAdmin();
  const params = await searchParams;

  const filtro = FILTROS.find((f) => f.valor === params.status)?.valor;

  const [pedidos, diasSugeridos] = await Promise.all([
    listarSolicitacoes(filtro),
    lerNumero("free.dias_ao_aprovar"),
  ]);

  const pendentes = pedidos.filter((p) => p.status === "PENDENTE").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">
          Solicitações de acesso
        </h1>
        <p className="mt-1 text-tinta-clara">
          Pedidos de novo período gratuito. Nada é liberado sem a sua aprovação.
          O prazo padrão vem das{" "}
          <Link
            href="/admin/configuracoes"
            className="font-bold text-indigo hover:underline"
          >
            configurações
          </Link>
          .
        </p>
      </div>

      <nav
        className="mb-6 flex flex-wrap gap-2 border-b border-borda pb-4"
        aria-label="Filtrar por situação"
      >
        {FILTROS.map((f) => (
          <Link
            key={f.rotulo}
            href={f.valor ? `/admin/solicitacoes?status=${f.valor}` : "/admin/solicitacoes"}
            aria-current={filtro === f.valor ? "page" : undefined}
            className={`rounded-md px-3.5 py-2 font-titulo text-sm font-bold ${
              filtro === f.valor
                ? "bg-indigo text-white"
                : "border-2 border-borda text-tinta-clara hover:border-indigo"
            }`}
          >
            {f.rotulo}
            {f.valor === "PENDENTE" && pendentes > 0 && ` (${pendentes})`}
          </Link>
        ))}
      </nav>

      {pedidos.length === 0 ? (
        <div className="card text-center">
          <p className="py-8 text-cinza">
            {filtro
              ? "Nenhum pedido com essa situação."
              : "Nenhum pedido de acesso até agora. Eles aparecem aqui quando o prazo gratuito de alguém termina."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((p) => (
            <CartaoPedido
              key={p.id}
              pedido={p as unknown as PedidoNaFila}
              diasSugeridos={diasSugeridos || 15}
              acaoAprovar={aprovarSolicitacao}
              acaoRecusar={recusarSolicitacao}
            />
          ))}
        </div>
      )}
    </div>
  );
}
