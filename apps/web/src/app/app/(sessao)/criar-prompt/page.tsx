import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";
import { ConstrutorPrompt } from "@/components/construtor-prompt";
import { AjudaContextual } from "@/components/ajuda-contextual";
export default async function CriarPrompt(){await exigirAluno();const ptcf=await prisma.knowledgeEntry.findUnique({where:{slug:"ptcf"}});return <div><div className="mb-6"><h1 className="font-titulo text-3xl font-extrabold">Criar um prompt guiado {ptcf&&<AjudaContextual item={{...ptcf,importancias:ptcf.importancias as Record<string,string>|null}} contexto="prompts"/>}</h1><p className="mt-1 text-tinta-clara">Monte um pedido claro em cinco passos e leve-o à ferramenta que preferir.</p></div><ConstrutorPrompt/></div>}
