"use server";

import { revalidatePath } from "next/cache";
import { prisma, type ModalidadeTurma, type SituacaoTurma } from "@aprender/db";
import { exigirAdmin } from "./admin";
import { deInputDate, gerarDatasSemanais, normalizarHora } from "@/lib/datas";

/**
 * Turmas: cadastro completo, encontros e presença.
 *
 * A turma é o centro do cadastro de aluno — ninguém entra na plataforma
 * pelo painel sem pertencer a uma. Por isso a criação de turma também
 * acontece de dentro do cadastro em lote (ver `criarTurmaBasica`), e não
 * só nesta tela.
 */

export type ResultadoTurma = { ok: boolean; mensagem: string; cohortId?: string };

const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Código curto e legível, sem 0/O nem 1/I — é copiado do quadro. */
function gerarCodigo(): string {
  return Array.from(
    { length: 6 },
    () => ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)],
  ).join("");
}

/**
 * Cria a turma tentando alguns códigos: `codigo` é único e uma colisão,
 * embora improvável (32^6), não pode derrubar o cadastro.
 */
async function criarComCodigoUnico<T>(
  criar: (codigo: string) => Promise<T>,
): Promise<T> {
  for (let tentativa = 0; tentativa < 6; tentativa++) {
    try {
      return await criar(gerarCodigo());
    } catch (e) {
      const ehColisao =
        e instanceof Error && e.message.includes("Unique constraint");
      if (!ehColisao || tentativa === 5) throw e;
    }
  }
  throw new Error("Não foi possível gerar um código único.");
}

function textoOuNulo(dados: FormData, campo: string): string | null {
  const v = String(dados.get(campo) ?? "").trim();
  return v || null;
}

/* ============================================================
   CRIAÇÃO E EDIÇÃO
   ============================================================ */

/**
 * Turma criada de dentro do cadastro de alunos: só o essencial, para não
 * interromper quem está com a lista de chamada na mão. O resto se
 * completa depois, na tela da turma.
 */
export async function criarTurmaBasica(dados: {
  nome: string;
  courseId: string;
  modalidade?: ModalidadeTurma;
  local?: string | null;
  inicioEm?: Date | null;
}): Promise<{ id: string; codigo: string }> {
  const nome = dados.nome.trim();
  if (!nome) throw new Error("Informe o nome da turma.");

  return criarComCodigoUnico((codigo) =>
    prisma.cohort.create({
      data: {
        nome,
        courseId: dados.courseId,
        codigo,
        modalidade: dados.modalidade ?? "ONLINE",
        local: dados.local ?? null,
        inicioEm: dados.inicioEm ?? null,
        // Nasce aberta: foi criada para receber os alunos que estão sendo
        // cadastrados agora mesmo.
        situacao: "INSCRICOES_ABERTAS",
      },
      select: { id: true, codigo: true },
    }),
  );
}

export async function salvarTurma(
  _anterior: ResultadoTurma | null,
  dados: FormData,
): Promise<ResultadoTurma> {
  await exigirAdmin();

  const id = String(dados.get("id") ?? "");
  const nome = String(dados.get("nome") ?? "").trim();
  const courseId = String(dados.get("courseId") ?? "");
  const modalidade = String(dados.get("modalidade") ?? "ONLINE") as ModalidadeTurma;
  const situacao = String(dados.get("situacao") ?? "RASCUNHO") as SituacaoTurma;

  if (nome.length < 3) {
    return { ok: false, mensagem: "O nome da turma precisa de ao menos 3 caracteres." };
  }
  if (!courseId) {
    return { ok: false, mensagem: "Escolha o curso da turma." };
  }

  // Turma presencial sem lugar é um convite ao "onde é mesmo?" no dia.
  const local = textoOuNulo(dados, "local");
  if (modalidade !== "ONLINE" && !local) {
    return {
      ok: false,
      mensagem: "Turma presencial ou híbrida precisa do local dos encontros.",
    };
  }

  const linkOnline = textoOuNulo(dados, "linkOnline");
  if (modalidade === "ONLINE" && !linkOnline) {
    return {
      ok: false,
      mensagem: "Turma online precisa do link da sala virtual.",
    };
  }

  const vagasBruto = String(dados.get("vagas") ?? "").trim();
  const vagas = vagasBruto ? Number(vagasBruto) : null;
  if (vagas !== null && (!Number.isInteger(vagas) || vagas < 1)) {
    return { ok: false, mensagem: "Vagas deve ser um número inteiro maior que zero." };
  }

  const inicioEm = deInputDate(String(dados.get("inicioEm") ?? ""));
  const fimEm = deInputDate(String(dados.get("fimEm") ?? ""));
  if (inicioEm && fimEm && fimEm < inicioEm) {
    return { ok: false, mensagem: "A data de término é anterior à de início." };
  }

  const instrutorId = textoOuNulo(dados, "instrutorId");

  const comuns = {
    nome,
    courseId,
    modalidade,
    situacao,
    descricao: textoOuNulo(dados, "descricao"),
    local,
    endereco: textoOuNulo(dados, "endereco"),
    cidade: textoOuNulo(dados, "cidade"),
    uf: textoOuNulo(dados, "uf")?.toUpperCase().slice(0, 2) ?? null,
    sala: textoOuNulo(dados, "sala"),
    linkOnline,
    vagas,
    instrutorId,
    observacoes: textoOuNulo(dados, "observacoes"),
    inicioEm,
    fimEm,
  };

  if (id) {
    // Reduzir vagas abaixo de quem já está dentro deixaria a turma num
    // estado impossível de explicar ao aluno que já foi matriculado.
    if (vagas !== null) {
      const inscritos = await prisma.cohortMember.count({ where: { cohortId: id } });
      if (inscritos > vagas) {
        return {
          ok: false,
          mensagem: `A turma já tem ${inscritos} inscrito(s) — não é possível limitar a ${vagas} vaga(s).`,
        };
      }
    }

    await prisma.cohort.update({ where: { id }, data: comuns });
    revalidatePath("/admin/turmas");
    revalidatePath(`/admin/turmas/${id}`);
    revalidatePath("/admin/alunos");
    return { ok: true, mensagem: "Turma atualizada.", cohortId: id };
  }

  const criada = await criarComCodigoUnico((codigo) =>
    prisma.cohort.create({ data: { ...comuns, codigo }, select: { id: true } }),
  );

  revalidatePath("/admin/turmas");
  revalidatePath("/admin/alunos");
  return { ok: true, mensagem: "Turma criada.", cohortId: criada.id };
}

/* ============================================================
   CÓDIGO DE MATRÍCULA
   ============================================================ */

/** Gera um código novo: o antigo para de funcionar na hora. */
export async function regerarCodigo(dados: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(dados.get("id") ?? "");
  if (!id) return;

  await criarComCodigoUnico((codigo) =>
    prisma.cohort.update({ where: { id }, data: { codigo }, select: { id: true } }),
  );

  revalidatePath("/admin/turmas");
  revalidatePath(`/admin/turmas/${id}`);
}

/** Abre ou fecha as inscrições sem apagar a turma. */
export async function alternarInscricoes(dados: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(dados.get("id") ?? "");
  const abrir = dados.get("abrir") === "1";
  if (!id) return;

  await prisma.cohort.update({
    where: { id },
    data: { situacao: abrir ? "INSCRICOES_ABERTAS" : "EM_ANDAMENTO" },
  });

  revalidatePath("/admin/turmas");
  revalidatePath(`/admin/turmas/${id}`);
}

/* ============================================================
   ENCONTROS
   ============================================================ */

export async function adicionarEncontro(
  _anterior: ResultadoTurma | null,
  dados: FormData,
): Promise<ResultadoTurma> {
  await exigirAdmin();

  const cohortId = String(dados.get("cohortId") ?? "");
  const data = deInputDate(String(dados.get("data") ?? ""));
  if (!cohortId || !data) {
    return { ok: false, mensagem: "Informe a data do encontro." };
  }

  const ultimo = await prisma.cohortMeeting.findFirst({
    where: { cohortId },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });

  await prisma.cohortMeeting.create({
    data: {
      cohortId,
      ordem: (ultimo?.ordem ?? 0) + 1,
      data,
      titulo: textoOuNulo(dados, "titulo"),
      pauta: textoOuNulo(dados, "pauta"),
      horaInicio: normalizarHora(String(dados.get("horaInicio") ?? "")) || null,
      horaFim: normalizarHora(String(dados.get("horaFim") ?? "")) || null,
      modalidade:
        String(dados.get("modalidade") ?? "PRESENCIAL") === "REMOTO"
          ? "REMOTO"
          : "PRESENCIAL",
      local: textoOuNulo(dados, "local"),
      endereco: textoOuNulo(dados, "endereco"),
      sala: textoOuNulo(dados, "sala"),
      linkOnline: textoOuNulo(dados, "linkOnline"),
    },
  });

  revalidatePath(`/admin/turmas/${cohortId}`);
  return { ok: true, mensagem: "Encontro adicionado." };
}

/**
 * Cria vários encontros de uma vez a partir de uma recorrência semanal.
 *
 * O curso tem 4 encontros semanais; digitar quatro datas à mão a cada
 * turma é trabalho repetido que convida ao erro. As datas geradas ficam
 * editáveis uma a uma depois.
 */
export async function gerarEncontrosEmSerie(
  _anterior: ResultadoTurma | null,
  dados: FormData,
): Promise<ResultadoTurma> {
  await exigirAdmin();

  const cohortId = String(dados.get("cohortId") ?? "");
  const primeira = deInputDate(String(dados.get("primeiraData") ?? ""));
  const quantidade = Number(String(dados.get("quantidade") ?? "0"));
  const intervalo = Number(String(dados.get("intervaloSemanas") ?? "1")) || 1;

  if (!cohortId || !primeira) {
    return { ok: false, mensagem: "Informe a data do primeiro encontro." };
  }
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 60) {
    return { ok: false, mensagem: "Quantidade de encontros deve estar entre 1 e 60." };
  }

  const turma = await prisma.cohort.findUnique({
    where: { id: cohortId },
    select: { modalidade: true, local: true, endereco: true, sala: true, linkOnline: true },
  });
  if (!turma) return { ok: false, mensagem: "Turma não encontrada." };

  const horaInicio = normalizarHora(String(dados.get("horaInicio") ?? "")) || null;
  const horaFim = normalizarHora(String(dados.get("horaFim") ?? "")) || null;

  const ultimo = await prisma.cohortMeeting.findFirst({
    where: { cohortId },
    orderBy: { ordem: "desc" },
    select: { ordem: true },
  });
  const base = ultimo?.ordem ?? 0;

  const datas = gerarDatasSemanais(primeira, quantidade, intervalo);

  await prisma.cohortMeeting.createMany({
    data: datas.map((data, i) => ({
      cohortId,
      ordem: base + i + 1,
      data,
      horaInicio,
      horaFim,
      // Turma online gera encontros remotos; as demais, presenciais.
      modalidade: turma.modalidade === "ONLINE" ? ("REMOTO" as const) : ("PRESENCIAL" as const),
      // Herdam o lugar da turma — o caso comum é todos no mesmo local.
      local: turma.modalidade === "ONLINE" ? null : turma.local,
      endereco: turma.modalidade === "ONLINE" ? null : turma.endereco,
      sala: turma.modalidade === "ONLINE" ? null : turma.sala,
      linkOnline: turma.modalidade === "ONLINE" ? turma.linkOnline : null,
    })),
  });

  // A primeira e a última data viram o período da turma, se ainda não houver.
  await prisma.cohort.update({
    where: { id: cohortId },
    data: {
      inicioEm: datas[0],
      fimEm: datas[datas.length - 1],
    },
  });

  revalidatePath(`/admin/turmas/${cohortId}`);
  return { ok: true, mensagem: `${datas.length} encontro(s) criado(s).` };
}

export async function editarEncontro(
  _anterior: ResultadoTurma | null,
  dados: FormData,
): Promise<ResultadoTurma> {
  await exigirAdmin();

  const id = String(dados.get("id") ?? "");
  const cohortId = String(dados.get("cohortId") ?? "");
  const data = deInputDate(String(dados.get("data") ?? ""));
  if (!id || !data) return { ok: false, mensagem: "Data inválida." };

  await prisma.cohortMeeting.update({
    where: { id },
    data: {
      data,
      titulo: textoOuNulo(dados, "titulo"),
      pauta: textoOuNulo(dados, "pauta"),
      horaInicio: normalizarHora(String(dados.get("horaInicio") ?? "")) || null,
      horaFim: normalizarHora(String(dados.get("horaFim") ?? "")) || null,
      modalidade:
        String(dados.get("modalidade") ?? "PRESENCIAL") === "REMOTO"
          ? "REMOTO"
          : "PRESENCIAL",
      local: textoOuNulo(dados, "local"),
      endereco: textoOuNulo(dados, "endereco"),
      sala: textoOuNulo(dados, "sala"),
      linkOnline: textoOuNulo(dados, "linkOnline"),
    },
  });

  revalidatePath(`/admin/turmas/${cohortId}`);
  return { ok: true, mensagem: "Encontro atualizado." };
}

/**
 * Cancela um encontro sem apagá-lo: o aluno que faltou por causa do
 * cancelamento não deve aparecer como ausente num encontro que não houve.
 */
export async function cancelarEncontro(dados: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(dados.get("id") ?? "");
  const cohortId = String(dados.get("cohortId") ?? "");
  if (!id) return;

  await prisma.cohortMeeting.update({
    where: { id },
    data: {
      canceladoEm: new Date(),
      motivoCancelamento: textoOuNulo(dados, "motivo"),
    },
  });

  revalidatePath(`/admin/turmas/${cohortId}`);
}

export async function reativarEncontro(dados: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(dados.get("id") ?? "");
  const cohortId = String(dados.get("cohortId") ?? "");
  if (!id) return;

  await prisma.cohortMeeting.update({
    where: { id },
    data: { canceladoEm: null, motivoCancelamento: null },
  });

  revalidatePath(`/admin/turmas/${cohortId}`);
}

export async function removerEncontro(dados: FormData): Promise<void> {
  await exigirAdmin();
  const id = String(dados.get("id") ?? "");
  const cohortId = String(dados.get("cohortId") ?? "");
  if (!id) return;

  await prisma.cohortMeeting.delete({ where: { id } });
  revalidatePath(`/admin/turmas/${cohortId}`);
}

/* ============================================================
   PRESENÇA
   ============================================================ */

/**
 * Registra a chamada de um encontro.
 *
 * Só grava quem foi marcado. Ausência de registro significa "não
 * chamado" — diferente de falta, que é uma afirmação sobre o aluno.
 */
export async function registrarPresenca(
  _anterior: ResultadoTurma | null,
  dados: FormData,
): Promise<ResultadoTurma> {
  await exigirAdmin();

  const meetingId = String(dados.get("meetingId") ?? "");
  const cohortId = String(dados.get("cohortId") ?? "");
  if (!meetingId) return { ok: false, mensagem: "Encontro não informado." };

  // Os campos vêm como presenca_<userId> = PRESENTE | FALTA | JUSTIFICADA | ""
  const marcacoes: { userId: string; situacao: "PRESENTE" | "FALTA" | "JUSTIFICADA" }[] = [];
  const semMarcacao: string[] = [];

  for (const [chave, valor] of dados.entries()) {
    if (!chave.startsWith("presenca_")) continue;
    const userId = chave.slice("presenca_".length);
    const v = String(valor);
    if (v === "PRESENTE" || v === "FALTA" || v === "JUSTIFICADA") {
      marcacoes.push({ userId, situacao: v });
    } else {
      semMarcacao.push(userId);
    }
  }

  await prisma.$transaction([
    // Quem voltou para "não chamado" perde o registro anterior.
    prisma.meetingAttendance.deleteMany({
      where: { meetingId, userId: { in: semMarcacao } },
    }),
    ...marcacoes.map((m) =>
      prisma.meetingAttendance.upsert({
        where: { meetingId_userId: { meetingId, userId: m.userId } },
        create: { meetingId, userId: m.userId, situacao: m.situacao },
        update: { situacao: m.situacao, registradoEm: new Date() },
      }),
    ),
  ]);

  revalidatePath(`/admin/turmas/${cohortId}`);
  return {
    ok: true,
    mensagem: `Chamada registrada: ${marcacoes.length} aluno(s).`,
  };
}

/* ============================================================
   DUPLICAR
   ============================================================ */

/**
 * Copia uma turma para o próximo período.
 *
 * Traz a estrutura (modalidade, local, vagas, instrutor e os encontros,
 * deslocados no tempo) mas nenhum aluno: a turma nova nasce vazia, com
 * código próprio.
 */
export async function duplicarTurma(
  _anterior: ResultadoTurma | null,
  dados: FormData,
): Promise<ResultadoTurma> {
  await exigirAdmin();

  const id = String(dados.get("id") ?? "");
  const novoNome = String(dados.get("nome") ?? "").trim();
  const novaPrimeiraData = deInputDate(String(dados.get("primeiraData") ?? ""));
  if (!id) return { ok: false, mensagem: "Turma não informada." };

  const origem = await prisma.cohort.findUnique({
    where: { id },
    include: { encontros: { orderBy: { ordem: "asc" } } },
  });
  if (!origem) return { ok: false, mensagem: "Turma não encontrada." };

  // O deslocamento preserva os intervalos entre encontros: se eram
  // semanais, seguem semanais a partir da nova data.
  const primeiraOriginal = origem.encontros[0]?.data ?? null;
  const deslocamentoMs =
    novaPrimeiraData && primeiraOriginal
      ? novaPrimeiraData.getTime() - new Date(primeiraOriginal).getTime()
      : 0;

  const nova = await criarComCodigoUnico((codigo) =>
    prisma.cohort.create({
      data: {
        codigo,
        nome: novoNome || `${origem.nome} (cópia)`,
        courseId: origem.courseId,
        descricao: origem.descricao,
        modalidade: origem.modalidade,
        situacao: "RASCUNHO",
        local: origem.local,
        endereco: origem.endereco,
        cidade: origem.cidade,
        uf: origem.uf,
        sala: origem.sala,
        linkOnline: origem.linkOnline,
        vagas: origem.vagas,
        instrutorId: origem.instrutorId,
        observacoes: origem.observacoes,
        inicioEm: deslocamentoMs && origem.inicioEm
          ? new Date(new Date(origem.inicioEm).getTime() + deslocamentoMs)
          : null,
        fimEm: deslocamentoMs && origem.fimEm
          ? new Date(new Date(origem.fimEm).getTime() + deslocamentoMs)
          : null,
      },
      select: { id: true },
    }),
  );

  if (origem.encontros.length > 0) {
    await prisma.cohortMeeting.createMany({
      data: origem.encontros.map((e) => ({
        cohortId: nova.id,
        ordem: e.ordem,
        titulo: e.titulo,
        pauta: e.pauta,
        data: new Date(new Date(e.data).getTime() + deslocamentoMs),
        horaInicio: e.horaInicio,
        horaFim: e.horaFim,
        modalidade: e.modalidade,
        local: e.local,
        endereco: e.endereco,
        sala: e.sala,
        linkOnline: e.linkOnline,
      })),
    });
  }

  revalidatePath("/admin/turmas");
  return {
    ok: true,
    mensagem: `Turma duplicada com ${origem.encontros.length} encontro(s).`,
    cohortId: nova.id,
  };
}

/* ============================================================
   CONSULTAS
   ============================================================ */

/** Verifica se a turma ainda aceita mais N alunos. */
/**
 * Duplicação disparada por um `<form action=...>` simples.
 *
 * `duplicarTurma` tem a forma que o `useActionState` espera (estado
 * anterior + FormData). Um form comum passa só o FormData, então o
 * primeiro argumento chegaria no lugar errado — este adaptador existe
 * para não depender de um cast que silencia o problema em vez de resolvê-lo.
 */
export async function duplicarTurmaDireto(dados: FormData): Promise<void> {
  await duplicarTurma(null, dados);
}

export async function podeReceber(
  cohortId: string,
  quantos: number,
): Promise<{ pode: boolean; motivo?: string; vagasRestantes?: number }> {
  const turma = await prisma.cohort.findUnique({
    where: { id: cohortId },
    select: { vagas: true, situacao: true, _count: { select: { membros: true } } },
  });
  if (!turma) return { pode: false, motivo: "Turma não encontrada." };

  if (turma.situacao === "CANCELADA") {
    return { pode: false, motivo: "Esta turma foi cancelada." };
  }
  if (turma.situacao === "CONCLUIDA") {
    return { pode: false, motivo: "Esta turma já foi concluída." };
  }
  if (turma.vagas === null) return { pode: true };

  const restantes = turma.vagas - turma._count.membros;
  if (restantes < quantos) {
    return {
      pode: false,
      motivo: `A turma tem ${restantes < 0 ? 0 : restantes} vaga(s) livre(s) e você está cadastrando ${quantos}.`,
      vagasRestantes: Math.max(0, restantes),
    };
  }
  return { pode: true, vagasRestantes: restantes };
}

export async function obterTurma(id: string) {
  return prisma.cohort.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, titulo: true } },
      instrutor: { select: { id: true, nome: true } },
      encontros: {
        orderBy: { ordem: "asc" },
        include: {
          presencas: {
            select: { userId: true, situacao: true },
          },
        },
      },
      membros: {
        orderBy: { entrouEm: "asc" },
        include: {
          user: {
            select: {
              id: true,
              nome: true,
              telefone: true,
              email: true,
              escola: true,
              precisaTrocarSenha: true,
            },
          },
        },
      },
    },
  });
}
