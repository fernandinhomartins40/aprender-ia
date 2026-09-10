import nodemailer from "nodemailer";

/**
 * Envio de e-mail da plataforma.
 *
 * O projeto roda numa VPS sem servidor de e-mail próprio, então o envio
 * depende de um SMTP externo configurado por variáveis de ambiente.
 *
 * Quando o SMTP NÃO está configurado, não fingimos que enviamos: o
 * conteúdo vai para o log do servidor e o retorno diz `entregue: false`.
 * Assim o fluxo de recuperação continua testável em desenvolvimento, e
 * em produção fica evidente no log que falta configurar o SMTP — em vez
 * de o professor esperar por um e-mail que nunca sairia.
 */

export type ResultadoEnvio = {
  entregue: boolean;
  motivo?: string;
};

function smtpConfigurado(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function remetente(): string {
  return (
    process.env.SMTP_FROM ??
    `Aprender IA <${process.env.SMTP_USER ?? "nao-responda@aprenderia.site"}>`
  );
}

let transporte: nodemailer.Transporter | null = null;

function obterTransporte(): nodemailer.Transporter {
  if (transporte) return transporte;

  const porta = Number(process.env.SMTP_PORT ?? 587);

  transporte = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: porta,
    // 465 é TLS implícito; 587 usa STARTTLS depois de conectar.
    secure: porta === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporte;
}

export async function enviarEmail(opcoes: {
  para: string;
  assunto: string;
  texto: string;
  html: string;
}): Promise<ResultadoEnvio> {
  if (!smtpConfigurado()) {
    // Não é erro: é o modo de desenvolvimento. O link aparece aqui.
    console.warn(
      [
        "",
        "─".repeat(64),
        "SMTP não configurado — e-mail NÃO enviado.",
        `Para:    ${opcoes.para}`,
        `Assunto: ${opcoes.assunto}`,
        "",
        opcoes.texto,
        "─".repeat(64),
        "",
      ].join("\n"),
    );
    return { entregue: false, motivo: "smtp-nao-configurado" };
  }

  try {
    await obterTransporte().sendMail({
      from: remetente(),
      to: opcoes.para,
      subject: opcoes.assunto,
      text: opcoes.texto,
      html: opcoes.html,
    });
    return { entregue: true };
  } catch (e) {
    // Falha de envio nunca derruba o fluxo de quem pediu a recuperação:
    // quem chama trata o `entregue: false`.
    console.error("Falha ao enviar e-mail:", e);
    return {
      entregue: false,
      motivo: e instanceof Error ? e.message.slice(0, 200) : "erro-desconhecido",
    };
  }
}

/* ============================================================
   MODELO: RECUPERAÇÃO DE SENHA
   ============================================================ */

export function montarEmailRecuperacao(dados: {
  nome: string;
  link: string;
  validadeMinutos: number;
}): { assunto: string; texto: string; html: string } {
  const primeiroNome = dados.nome.split(" ")[0] ?? "";
  const assunto = "Redefinir sua senha — Aprender IA";

  const texto = [
    `Olá, ${primeiroNome}.`,
    "",
    "Recebemos um pedido para redefinir a sua senha no Aprender IA.",
    "Abra o endereço abaixo para escolher uma nova senha:",
    "",
    dados.link,
    "",
    `O link vale por ${dados.validadeMinutos} minutos e só pode ser usado uma vez.`,
    "",
    "Se não foi você quem pediu, ignore esta mensagem — sua senha atual continua valendo.",
  ].join("\n");

  const html = `
<div style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; font-size:16px; line-height:1.6; color:#1E293B; max-width:520px; margin:0 auto; padding:24px;">
  <p style="font-size:20px; font-weight:800; margin:0 0 24px;">
    Aprender<span style="color:#F97316;">IA</span>
  </p>
  <p>Olá, ${primeiroNome}.</p>
  <p>Recebemos um pedido para redefinir a sua senha. Clique no botão abaixo para escolher uma nova:</p>
  <p style="margin:28px 0;">
    <a href="${dados.link}"
       style="display:inline-block; background:#4F46E5; color:#ffffff; text-decoration:none; font-weight:700; padding:14px 24px; border-radius:12px;">
      Criar nova senha
    </a>
  </p>
  <p style="color:#475569; font-size:14px;">
    O link vale por ${dados.validadeMinutos} minutos e só pode ser usado uma vez.
  </p>
  <p style="color:#475569; font-size:14px;">
    Se o botão não funcionar, copie e cole este endereço no navegador:<br>
    <span style="word-break:break-all; color:#4F46E5;">${dados.link}</span>
  </p>
  <hr style="border:none; border-top:1px solid #E2E8F0; margin:28px 0;">
  <p style="color:#64748B; font-size:14px; margin:0;">
    Se não foi você quem pediu, ignore esta mensagem — sua senha atual continua valendo.
  </p>
</div>`.trim();

  return { assunto, texto, html };
}

/* ============================================================
   MODELO: ACESSO GRATUITO
   ============================================================ */

/** Moldura comum dos e-mails, para não repetir o HTML em cada modelo. */
function moldura(corpo: string): string {
  return `
<div style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; font-size:16px; line-height:1.6; color:#1E293B; max-width:520px; margin:0 auto; padding:24px;">
  <p style="font-size:20px; font-weight:800; margin:0 0 24px;">
    Aprender<span style="color:#F97316;">IA</span>
  </p>
  ${corpo}
</div>`.trim();
}

function botao(link: string, rotulo: string): string {
  return `<p style="margin:28px 0;">
    <a href="${link}" style="display:inline-block; background:#4F46E5; color:#ffffff; text-decoration:none; font-weight:700; padding:14px 24px; border-radius:12px;">${rotulo}</a>
  </p>`;
}

export function montarEmailAcessoAprovado(dados: {
  nome: string;
  dias: number;
  ate: string;
  link: string;
}): { assunto: string; texto: string; html: string } {
  const primeiroNome = dados.nome.split(" ")[0] ?? "";
  return {
    assunto: "Seu acesso foi liberado — Aprender IA",
    texto: [
      `Olá, ${primeiroNome}.`,
      "",
      `Seu acesso à plataforma foi liberado por ${dados.dias} dias, até ${dados.ate}.`,
      "",
      "Continue de onde parou:",
      dados.link,
      "",
      "Seu progresso e suas anotações estavam guardados e continuam lá.",
    ].join("\n"),
    html: moldura(`
  <p>Olá, ${primeiroNome}.</p>
  <p>Seu acesso à plataforma foi liberado por <strong>${dados.dias} dias</strong>, até <strong>${dados.ate}</strong>.</p>
  ${botao(dados.link, "Continuar meu curso")}
  <p style="color:#475569; font-size:14px;">Seu progresso e suas anotações estavam guardados e continuam lá.</p>`),
  };
}

export function montarEmailAcessoRecusado(dados: {
  nome: string;
  contato?: string | null;
}): { assunto: string; texto: string; html: string } {
  const primeiroNome = dados.nome.split(" ")[0] ?? "";
  const linhaContato = dados.contato
    ? `Se quiser conversar sobre isso, fale com a coordenação: ${dados.contato}.`
    : "Se quiser conversar sobre isso, procure a coordenação do curso.";

  return {
    assunto: "Sobre seu pedido de acesso — Aprender IA",
    texto: [
      `Olá, ${primeiroNome}.`,
      "",
      "Analisamos seu pedido de novo acesso gratuito e não foi possível liberá-lo agora.",
      "",
      linhaContato,
      "",
      "Seu progresso continua salvo — nada foi apagado.",
    ].join("\n"),
    html: moldura(`
  <p>Olá, ${primeiroNome}.</p>
  <p>Analisamos seu pedido de novo acesso gratuito e não foi possível liberá-lo agora.</p>
  <p>${linhaContato}</p>
  <p style="color:#475569; font-size:14px;">Seu progresso continua salvo — nada foi apagado.</p>`),
  };
}

export function montarEmailAcessoExpirando(dados: {
  nome: string;
  diasRestantes: number;
  ate: string;
  link: string;
}): { assunto: string; texto: string; html: string } {
  const primeiroNome = dados.nome.split(" ")[0] ?? "";
  const quando =
    dados.diasRestantes === 0
      ? "hoje"
      : dados.diasRestantes === 1
        ? "amanhã"
        : `em ${dados.diasRestantes} dias`;

  return {
    assunto: `Seu acesso gratuito termina ${quando} — Aprender IA`,
    texto: [
      `Olá, ${primeiroNome}.`,
      "",
      `Seu acesso gratuito termina ${quando} (${dados.ate}).`,
      "",
      "Se ainda faltam lições, aproveite este período:",
      dados.link,
      "",
      "Quando o prazo terminar, seu progresso continua salvo e você poderá solicitar um novo acesso.",
    ].join("\n"),
    html: moldura(`
  <p>Olá, ${primeiroNome}.</p>
  <p>Seu acesso gratuito termina <strong>${quando}</strong> (${dados.ate}).</p>
  ${botao(dados.link, "Continuar agora")}
  <p style="color:#475569; font-size:14px;">Quando o prazo terminar, seu progresso continua salvo e você poderá solicitar um novo acesso.</p>`),
  };
}
