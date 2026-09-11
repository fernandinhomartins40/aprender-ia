import { redirect } from "next/navigation";
import { carregarTrilha, exigirAluno } from "@/server/trilha";

/** Leva o aluno diretamente à próxima atividade liberada, sem duplicar a trilha. */
export default async function ContinuarEstudando() {
  const user = await exigirAluno();
  const trilha = await carregarTrilha(user.id);
  if (!trilha || trilha.bloqueado) redirect("/app/trilha");
  const proxima = trilha.modulos
    .flatMap((modulo) => modulo.licoes)
    .find((licao) => licao.status === "EM_ANDAMENTO" || licao.status === "DISPONIVEL");
  redirect(proxima ? `/app/licao/${proxima.id}` : "/app/trilha");
}
