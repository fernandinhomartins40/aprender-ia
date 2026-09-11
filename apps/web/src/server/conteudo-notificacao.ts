"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@aprender/db";
import { exigirAdmin } from "./admin";
import { notificar } from "./notificacoes";

const MIDIA = path.join(process.cwd(), "public", "uploads", "notificacoes");
const TIPOS = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]);

async function salvarMidia(arquivo: File | null) {
  if (!arquivo || !arquivo.size) return null;
  if (!TIPOS.has(arquivo.type) || arquivo.size > 25 * 1024 * 1024) throw new Error("Mídia inválida ou maior que 25 MB.");
  await mkdir(MIDIA, { recursive: true });
  const ext = arquivo.type.split("/")[1]!.replace("jpeg", "jpg");
  const nome = `${randomUUID()}.${ext}`;
  await writeFile(path.join(MIDIA, nome), Buffer.from(await arquivo.arrayBuffer()));
  return `/uploads/notificacoes/${nome}`;
}

async function destinatarios(publico: string, publicoId: string | null) {
  if (publico === "turma" && publicoId) return (await prisma.cohortMember.findMany({ where: { cohortId: publicoId }, select: { userId: true } })).map(x => x.userId);
  if (publico === "inativos") {
    const limite = new Date(Date.now() - 7 * 86_400_000);
    return (await prisma.user.findMany({ where: { papel: "ALUNO", ultimoAcessoEm: { lt: limite } }, select: { id: true } })).map(x => x.id);
  }
  return (await prisma.user.findMany({ where: { papel: "ALUNO" }, select: { id: true } })).map(x => x.id);
}

export async function publicarConteudo(id: string) {
  const conteudo = await prisma.notificationContent.findUnique({ where: { id } });
  if (!conteudo || conteudo.status === "EXPIRADO" || (conteudo.expiraEm && conteudo.expiraEm < new Date())) return 0;
  const ids = await destinatarios(conteudo.publico, conteudo.publicoId);
  let total = 0;
  for (const userId of ids) {
    const existente = await prisma.notification.findFirst({ where: { userId, contentId: id }, select: { id: true } });
    if (existente) continue;
    const r = await notificar({ userId, contentId: id, assunto: `conteudo.${id}`, titulo: conteudo.titulo, corpo: conteudo.subtitulo ?? conteudo.corpo.slice(0, 160), link: `/app/notificacoes/conteudo/${id}`, categoria: conteudo.categoria as any, autorNome: conteudo.criadoPor, dedupeHoras: 24, enviarPushAgora: true });
    if (r.registrada) total++;
  }
  await prisma.notificationContent.update({ where: { id }, data: { status: "PUBLICADO" } });
  return total;
}

export async function criarConteudoNotificacao(_prev: { ok: boolean; mensagem: string } | null, dados: FormData) {
  const admin = await exigirAdmin();
  const titulo = String(dados.get("titulo") ?? "").trim(); const corpo = String(dados.get("corpo") ?? "").trim();
  if (!titulo || !corpo) return { ok: false, mensagem: "Título e conteúdo são obrigatórios." };
  try {
    const imagemUrl = await salvarMidia(dados.get("imagem") as File); const videoUrl = await salvarMidia(dados.get("video") as File);
    const publicarEmTexto = String(dados.get("publicarEm") ?? ""); const publicarEm = publicarEmTexto ? new Date(publicarEmTexto) : null;
    const expiraTexto = String(dados.get("expiraEm") ?? ""); const expiraEm = expiraTexto ? new Date(expiraTexto) : null;
    if ((publicarEm && Number.isNaN(+publicarEm)) || (expiraEm && Number.isNaN(+expiraEm))) return { ok: false, mensagem: "Data inválida." };
    const slug = `${titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
    const externo = dados.get("ctaExterno") === "on";
    const ctaLink = String(externo ? dados.get("ctaLinkExterno") : dados.get("ctaLink") ?? "").trim() || null;
    if (externo && ctaLink && !/^https:\/\//i.test(ctaLink)) return { ok: false, mensagem: "Links externos precisam usar HTTPS." };
    const conteudo = await prisma.notificationContent.create({ data: { slug, titulo, subtitulo: String(dados.get("subtitulo") ?? "").trim() || null, corpo, imagemUrl, videoUrl, icone: String(dados.get("icone") ?? "notificacoes"), categoria: String(dados.get("categoria") ?? "ESSENCIAL"), prioridade: Number(dados.get("prioridade") ?? 0) || 0, ctaRotulo: String(dados.get("ctaRotulo") ?? "").trim() || null, ctaLink, ctaExterno: externo, publico: String(dados.get("publico") ?? "todos"), publicoId: String(dados.get("publicoId") ?? "").trim() || null, publicarEm, expiraEm, status: publicarEm && publicarEm > new Date() ? "AGENDADO" : "PUBLICADO", criadoPor: admin.nome } });
    const total = conteudo.status === "PUBLICADO" ? await publicarConteudo(conteudo.id) : 0;
    revalidatePath("/admin/notificacoes");
    return { ok: true, mensagem: conteudo.status === "AGENDADO" ? "Conteúdo agendado." : `Conteúdo publicado para ${total} aluno(s).` };
  } catch (e) { return { ok: false, mensagem: e instanceof Error ? e.message : "Não foi possível salvar o conteúdo." }; }
}

export async function processarConteudosAgendados() {
  const agora = new Date();
  const pendentes = await prisma.notificationContent.findMany({ where: { status: "AGENDADO", publicarEm: { lte: agora } }, select: { id: true } });
  let publicados = 0; for (const c of pendentes) publicados += await publicarConteudo(c.id); return publicados;
}
