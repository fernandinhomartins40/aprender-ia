import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";
import { CentralConhecimento } from "@/components/central-conhecimento";
export const dynamic="force-dynamic";
export default async function Conhecimento(){await exigirAluno();const itens=await prisma.knowledgeEntry.findMany({where:{publicado:true},orderBy:{termo:"asc"}});return <div><div className="mb-6"><h1 className="font-titulo text-3xl font-extrabold">Central de Conhecimento</h1><p className="mt-1 text-tinta-clara">Consulte conceitos pedagógicos, BNCC e uso responsável de IA com fontes identificadas.</p></div><CentralConhecimento itens={itens}/></div>}
