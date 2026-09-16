import { redirect } from "next/navigation";
import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";

/**
 * O layout das páginas de aula: a tela inteira, sem a moldura do aplicativo.
 *
 * Aqui o aluno está estudando, não navegando. O cabeçalho e a barra inferior
 * do app roubavam 9rem de altura de uma tela de celular — em 844px, mais de um
 * décimo — e competiam com o conteúdo por atenção. Saem os dois; no lugar
 * fica uma barra fina com o que a página precisa: onde estou, como avanço e
 * como saio.
 *
 * As guardas do `(sessao)` continuam valendo: sem elas, bastaria conhecer o
 * endereço de uma página para ler a aula sem conta e sem trocar a senha
 * provisória.
 */
export default async function LayoutImersivo({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await exigirAluno();

  // Contas criadas em lote entram com senha provisória, que é adivinhável por
  // quem tem a lista de chamada. Mesma regra do resto do aplicativo.
  const conta = await prisma.user.findUnique({
    where: { id: user.id },
    select: { precisaTrocarSenha: true },
  });
  if (conta?.precisaTrocarSenha) redirect("/app/trocar-senha");

  return <div className="min-h-[100dvh] bg-fundo">{children}</div>;
}
