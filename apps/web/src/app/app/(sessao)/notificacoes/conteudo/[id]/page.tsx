import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";
import { IconeApp, type NomeIconeApp } from "@/components/icone-app";

export const dynamic = "force-dynamic";

export default async function ConteudoNotificacao({ params }: { params: Promise<{ id: string }> }) {
  const user = await exigirAluno(); const { id } = await params;
  const entrega = await prisma.notification.findFirst({ where: { userId: user.id, contentId: id }, include: { content: true } });
  if (!entrega?.content) notFound();
  const c = entrega.content;
  if (c.expiraEm && c.expiraEm < new Date()) notFound();
  if (!entrega.lidoEm) await prisma.notification.update({ where: { id: entrega.id }, data: { lidoEm: new Date() } });
  const interno = c.ctaLink?.startsWith("/");
  return <article className="mx-auto max-w-3xl"><header className="rounded-2xl bg-grad-marca p-6 text-white sm:p-9"><div className="flex items-center gap-3"><span className="rounded-xl bg-white/20 p-2"><IconeApp nome={(c.icone as NomeIconeApp) || "notificacoes"} tamanho={38}/></span><p className="text-sm font-bold uppercase tracking-wide">{c.categoria}</p></div><h1 className="mt-5 font-titulo text-3xl font-extrabold sm:text-4xl">{c.titulo}</h1>{c.subtitulo && <p className="mt-3 text-lg text-white/90">{c.subtitulo}</p>}</header><div className="card mt-5 overflow-hidden p-0"><div className="p-5 sm:p-7">{c.imagemUrl && <img src={c.imagemUrl} alt="" className="mb-6 max-h-[420px] w-full rounded-xl object-cover"/>}{c.videoUrl && <video controls preload="metadata" className="mb-6 w-full rounded-xl bg-black" src={c.videoUrl}>Seu navegador não suporta este vídeo.</video>}<div className="whitespace-pre-wrap text-base leading-7 text-tinta">{c.corpo}</div>{c.ctaLink && c.ctaRotulo && (interno ? <Link href={c.ctaLink} className="btn-primario mt-7">{c.ctaRotulo}</Link> : <a href={c.ctaLink} target="_blank" rel="noopener noreferrer" className="btn-primario mt-7">{c.ctaRotulo}</a>)}</div></div><Link href="/app/notificacoes" className="mt-5 inline-block font-bold text-indigo">← Voltar à central</Link></article>;
}
