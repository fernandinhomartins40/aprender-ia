import { exigirAluno } from "@/server/trilha";
import { ConstrutorPrompt } from "@/components/construtor-prompt";

export default async function CriarPrompt() { await exigirAluno(); return <div><div className="mb-6"><h1 className="font-titulo text-3xl font-extrabold">Criar um prompt guiado</h1><p className="mt-1 text-tinta-clara">Monte um pedido claro em cinco passos e leve-o à ferramenta que preferir.</p></div><ConstrutorPrompt /></div>; }
