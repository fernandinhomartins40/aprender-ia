import { redirect } from "next/navigation";

/**
 * Rota antiga do financeiro.
 *
 * A tela virou `/admin/cobrancas` — o nome descreve o que ela faz, e a
 * parte de "planos e acesso" que vivia aqui repetia o que /admin/planos e
 * /admin/assinaturas já fazem.
 *
 * O redirecionamento fica: links salvos nos favoritos do administrador
 * continuam funcionando.
 */
export default function FinanceiroAntigo() {
  redirect("/admin/cobrancas");
}
