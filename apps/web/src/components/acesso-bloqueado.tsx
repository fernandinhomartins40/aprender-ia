import Link from "next/link";
import type { Veredito } from "@/server/acesso";

const TITULO: Record<string, string> = {
  "curso-pago-plano-free": "Este curso faz parte do plano completo",
  "conta-suspensa": "Seu acesso está temporariamente suspenso",
  "premium-expirado": "Seu acesso ao plano completo expirou",
  "free-expirado": "Seu período de acesso gratuito terminou",
  "free-revogado": "Seu acesso gratuito foi encerrado",
};

const ICONE: Record<string, string> = {
  "curso-pago-plano-free": "🔒",
  "conta-suspensa": "⏸️",
  "premium-expirado": "⏳",
  "free-expirado": "⏳",
  "free-revogado": "🔒",
};

/** Motivos em que pedir um novo acesso gratuito faz sentido. */
const PODE_SOLICITAR = new Set(["free-expirado", "free-revogado"]);

/**
 * Tela mostrada quando o aluno não pode acessar o curso.
 *
 * O tom é deliberadamente acolhedor: quem chega aqui costuma ser um
 * professor cujo prazo terminou, não alguém tentando burlar o sistema.
 * Por isso reforçamos que o progresso continua guardado — e, quando o
 * caso é prazo vencido, oferecemos o caminho para pedir mais tempo em vez
 * de deixar a pessoa numa parede.
 */
export function AcessoBloqueado({
  veredito,
  cursoTitulo,
}: {
  veredito: Extract<Veredito, { permitido: false }>;
  cursoTitulo?: string;
}) {
  const contato = process.env.NEXT_PUBLIC_WHATSAPP_SUPORTE;
  const podeSolicitar = PODE_SOLICITAR.has(veredito.motivo);

  return (
    <div className="mx-auto max-w-xl">
      <div className="card text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amarelo-soft text-4xl">
          {ICONE[veredito.motivo] ?? "🔒"}
        </div>

        <h1 className="font-titulo text-2xl font-extrabold">
          {TITULO[veredito.motivo] ?? "Acesso indisponível"}
        </h1>

        {cursoTitulo && (
          <p className="mt-1 font-titulo text-sm font-bold uppercase tracking-wide text-indigo">
            {cursoTitulo}
          </p>
        )}

        <p className="mt-4 text-tinta-clara">{veredito.mensagem}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {podeSolicitar && (
            <Link href="/app/acesso" className="btn-primario">
              Solicitar novo acesso
            </Link>
          )}
          {contato && (
            <a
              href={`https://wa.me/${contato}?text=${encodeURIComponent(
                "Olá! Gostaria de liberar meu acesso ao curso na Aprender IA.",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={podeSolicitar ? "btn-secundario" : "btn-primario"}
            >
              Falar com a coordenação
            </a>
          )}
          {!podeSolicitar && (
            <Link href="/app/acesso" className="btn-secundario">
              Ver meu acesso
            </Link>
          )}
        </div>

        <p className="mt-6 text-sm text-cinza">
          Seu progresso e suas anotações continuam salvos.
        </p>
      </div>
    </div>
  );
}
