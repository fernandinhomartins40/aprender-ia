import { exigirAluno } from "@/server/trilha";
import { registrarMontagemPrompt } from "@/server/acoes";
import { ConstrutorPrompt } from "@/components/construtor-prompt";
import { mapaVerbetes } from "@/server/conhecimento";
import { Termo } from "@/components/termo";

export const dynamic = "force-dynamic";

/** Um verbete por campo do P.T.C.F., na ordem em que aparecem. */
const TERMOS = ["ptcf", "objetivo-pedagogico", "revisao-humana", "privacidade", "alucinacao"];

export default async function CriarPrompt() {
  await exigirAluno();
  const ajuda = await mapaVerbetes(TERMOS);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">
          Criar um prompt guiado
          <Termo slug="ptcf" contexto="criar-prompt" rotulo="P.T.C.F." />
        </h1>
        <p className="mt-1 text-tinta-clara">
          Monte um pedido claro em cinco passos e leve-o à ferramenta que preferir.
          <Termo slug="privacidade" contexto="criar-prompt" rotulo="Privacidade de estudantes" />
        </p>
      </div>
      <ConstrutorPrompt ajuda={ajuda} aoUsar={registrarMontagemPrompt} />
    </div>
  );
}
