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

export type OpcoesEmail = {
  para: string;
  assunto: string;
  texto: string;
  html: string;
  /** ID de template privado na VeloMail, quando configurado no ambiente. */
  templateId?: number;
  /** Variáveis para um template VeloMail, caso ele seja utilizado. */
  variaveis?: Record<string, string | number | boolean>;
  /** Links de redefinição não devem passar pelo redirecionador de tracking. */
  rastrear?: boolean;
}

function smtpConfigurado(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function veloMailConfigurado(): boolean {
  return Boolean(process.env.ULTRAZEND_API_KEY || process.env.VELOMAIL_API_KEY);
}

function remetente(): string {
  return (
    process.env.ULTRAZEND_FROM ??
    process.env.VELOMAIL_FROM ??
    process.env.SMTP_FROM ??
    `Aprender IA <${process.env.SMTP_USER ?? "nao-responda@aprenderia.site"}>`
  );
}

function apiVeloMail(): string {
  return (
    process.env.ULTRAZEND_API_URL ??
    process.env.VELOMAIL_API_URL ??
    "https://www.velomail.com.br/api"
  ).replace(/\/$/, "");
}

function chaveVeloMail(): string | undefined {
  return process.env.ULTRAZEND_API_KEY ?? process.env.VELOMAIL_API_KEY;
}

function trackingHabilitado(): boolean {
  const valor = process.env.ULTRAZEND_TRACKING_ENABLED ?? process.env.VELOMAIL_TRACKING_ENABLED;
  return valor?.toLowerCase() !== "false";
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

export async function enviarEmail(opcoes: OpcoesEmail): Promise<ResultadoEnvio> {
  if (veloMailConfigurado()) {
    return enviarPelaVeloMail(opcoes);
  }

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

async function enviarPelaVeloMail(opcoes: OpcoesEmail): Promise<ResultadoEnvio> {
  const chave = chaveVeloMail();
  if (!chave) return { entregue: false, motivo: "velomail-nao-configurado" };

  const resposta = await fetch(`${apiVeloMail()}/emails/send`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": chave,
    },
    body: JSON.stringify({
      from: remetente(),
      to: opcoes.para,
      subject: opcoes.assunto,
      html: opcoes.html,
      text: opcoes.texto,
      ...(opcoes.templateId ? { template_id: opcoes.templateId } : {}),
      ...(opcoes.variaveis ? { variables: opcoes.variaveis } : {}),
      tracking_enabled: opcoes.rastrear ?? trackingHabilitado(),
    }),
    signal: AbortSignal.timeout(15_000),
  }).catch((erro: unknown) => ({
    ok: false,
    status: 0,
    textoErro: erro instanceof Error ? erro.message : "erro de rede",
  }));

  if (!resposta.ok) {
    let motivo = "falha ao enviar pela VeloMail";
    if ("text" in resposta) {
      const corpo = await resposta.text().catch(() => "");
      motivo = corpo.slice(0, 200) || `HTTP ${resposta.status}`;
    } else if ("textoErro" in resposta) {
      motivo = resposta.textoErro.slice(0, 200);
    }
    console.error("Falha ao enviar e-mail pela VeloMail:", motivo);
    return { entregue: false, motivo };
  }

  return { entregue: true };
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

  const html = moldura(`
  <p>Olá, ${escaparHtml(primeiroNome)}.</p>
  <p>Recebemos um pedido para redefinir a sua senha. Escolha uma nova para continuar aprendendo.</p>
  ${botao(dados.link, "Criar nova senha")}
  <p style="color:#475569; font-size:14px;">O link vale por ${dados.validadeMinutos} minutos e só pode ser usado uma vez.</p>
  <p style="color:#475569; font-size:14px;">Se o botão não funcionar, copie e cole este endereço no navegador:<br><span style="word-break:break-all; color:#4F46E5;">${escaparHtml(dados.link)}</span></p>
  <p style="color:#64748B; font-size:14px;">Se não foi você quem pediu, ignore esta mensagem. Sua senha atual continua valendo.</p>`);

  return { assunto, texto, html };
}

/* ============================================================
   MODELO: ACESSO GRATUITO
   ============================================================ */

/** Moldura comum dos e-mails, para não repetir o HTML em cada modelo. */
function moldura(corpo: string): string {
  return `
<!doctype html>
<html lang="pt-BR"><body style="margin:0;padding:0;background:#EEF0FE;color:#1E293B;font-family:Arial,'Helvetica Neue',sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#EEF0FE;padding:28px 12px;"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#FFFFFF;border-radius:12px;overflow:hidden;">
      <tr><td style="height:6px;background:#4F46E5;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:32px 32px 12px;"><div style="font-size:24px;line-height:1;font-weight:800;letter-spacing:0;color:#1E293B;">Aprender<span style="color:#F97316;">IA</span></div></td></tr>
      <tr><td style="padding:8px 32px 32px;font-size:16px;line-height:1.6;color:#1E293B;">${corpo}</td></tr>
      <tr><td style="padding:20px 32px;background:#FCFCFE;border-top:1px solid #E2E8F0;font-size:13px;line-height:1.5;color:#64748B;">Formação em Inteligência Artificial para professores.</td></tr>
    </table>
  </td></tr></table>
</body></html>`.trim();
}

function botao(link: string, rotulo: string): string {
  return `<p style="margin:28px 0;">
    <a href="${escaparHtml(link)}" style="display:inline-block; background:#4F46E5; color:#ffffff; text-decoration:none; font-weight:700; padding:14px 24px; border-radius:8px;">${escaparHtml(rotulo)}</a>
  </p>`;
}

function escaparHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** E-mails livres enviados pelo painel também usam a identidade da plataforma. */
export function montarEmailNotificacao(dados: {
  titulo: string;
  corpo: string;
  link?: string | null;
}): string {
  const paragrafos = dados.corpo
    .split("\n\n")
    .map(
      (paragrafo) =>
        `<p style="margin:0 0 14px;line-height:1.6;">${escaparHtml(paragrafo).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");

  return moldura(`
  <h1 style="font-size:22px;line-height:1.25;margin:0 0 20px;color:#1E293B;">${escaparHtml(dados.titulo)}</h1>
  ${paragrafos}
  ${dados.link ? botao(dados.link, "Abrir na plataforma") : ""}`);
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
