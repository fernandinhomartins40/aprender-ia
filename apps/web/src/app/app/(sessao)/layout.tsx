import Link from "next/link";
import { signOut } from "@aprender/auth";
import { Logo } from "@/components/logo";
import { redirect } from "next/navigation";
import { prisma } from "@aprender/db";
import { exigirAluno } from "@/server/trilha";
import { lerNumero } from "@/server/configuracoes";
import { avaliarFree, textoPrazo } from "@/lib/acesso-free";
import { minhasNotificacoes, marcarComoLidas } from "@/server/notificacoes";
import { chavePublicaPush } from "@/server/push";
import { SinoNotificacoes } from "@/components/sino-notificacoes";
import { AtivarAvisos } from "@/components/ativar-avisos";
import { ConviteInstalar } from "@/components/convite-instalar";
import { IconeApp, type NomeIconeApp } from "@/components/icone-app";
import { BarraInferior } from "@/components/barra-inferior";

// Ícones 3D autorais, como no painel administrativo.
const MENU: { href: string; rotulo: string; icone: NomeIconeApp }[] = [
  { href: "/app", rotulo: "Início", icone: "inicio" },
  { href: "/app/trilha", rotulo: "Trilha", icone: "trilhas" },
  { href: "/app/prompts", rotulo: "Prompts", icone: "prompt" },
  { href: "/app/diario", rotulo: "Diário", icone: "documentos" },
  { href: "/app/conquistas", rotulo: "Conquistas", icone: "conquistas" },
];

function dataLonga(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(d));
}

export default async function LayoutAluno({ children }: { children: React.ReactNode }) {
  const user = await exigirAluno();

  // Contas criadas em lote entram com senha provisória. Barramos o acesso
  // à trilha até que o aluno defina a sua — a provisória é adivinhável
  // por quem tem a lista de chamada.
  const conta = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      precisaTrocarSenha: true,
      plano: true,
      freeAte: true,
      freeRevogadoEm: true,
    },
  });
  if (conta?.precisaTrocarSenha) redirect("/trocar-senha");

  // Aviso de prazo: um acesso que expira sem avisar é uma porta que
  // fecha na cara de quem estava estudando. Só aparece na janela
  // configurada, e não para quem tem plano completo.
  const avisarDiasAntes = await lerNumero("free.avisar_dias_antes");
  const situacaoFree =
    conta && conta.plano !== "PREMIUM"
      ? avaliarFree(conta, avisarDiasAntes || 7)
      : null;

  const avisos = await minhasNotificacoes();
  const chavePush = await chavePublicaPush();

  return (
    // O respiro inferior soma a altura da barra, o botão central elevado
    // e a faixa de gestos do aparelho: sem os três, o último cartão da
    // página fica escondido atrás da navegação.
    <div className="min-h-screen bg-fundo pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <header className="sticky top-0 z-40 border-b border-borda bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <Logo href="/app" largura={112} prioridade />

          <div className="flex items-center gap-2">
            <SinoNotificacoes
              lista={avisos.lista}
              naoLidas={avisos.naoLidas}
              aoAbrir={marcarComoLidas}
            />
            {user.papel === "ADMIN" && (
              <Link href="/admin" className="btn-fantasma text-sm">
                Administração
              </Link>
            )}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="btn-fantasma text-sm">
                Sair
              </button>
            </form>
          </div>
        </div>

        {/* menu no desktop */}
        <nav className="mx-auto hidden max-w-5xl px-5 md:block">
          <ul className="flex gap-1 pb-1">
            {MENU.map((m) => (
              <li key={m.href}>
                <Link
                  href={m.href}
                  className="inline-flex items-center gap-2 rounded-t-md px-4 py-2.5 font-titulo text-sm font-bold text-tinta-clara transition-colors hover:bg-indigo-soft hover:text-indigo-dark"
                >
                  <IconeApp nome={m.icone} tamanho={22} />
                  {m.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {situacaoFree?.avisar && conta?.freeAte && (
        <div className="border-b border-amarelo bg-amarelo-soft">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3">
            <p className="text-sm text-amarelo-dark">
              <strong>
                Seu acesso gratuito termina{" "}
                {textoPrazo(situacaoFree.diasRestantes ?? 0)}
              </strong>{" "}
              ({dataLonga(conta.freeAte)}). Seu progresso fica salvo — você poderá
              pedir mais tempo.
            </p>
            <Link
              href="/app/acesso"
              className="shrink-0 font-titulo text-sm font-bold text-amarelo-dark underline"
            >
              Ver meu acesso
            </Link>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl overflow-x-hidden px-5 py-8">
        {/* Fica dentro do aplicativo, nunca na tela de login: empilhar um
            pedido de permissão sobre o primeiro acesso faz a pessoa negar
            por reflexo — e o navegador nunca mais pergunta. */}
        {/* Quem já entrou também precisa poder instalar: antes o convite
            só existia na tela de login, então quem tinha sessão salva
            nunca via oferta nenhuma. */}
        <div className="mb-6 space-y-4 empty:mb-0">
          <ConviteInstalar />
          <AtivarAvisos chavePublica={chavePush} />
        </div>
        {children}
      </main>

      {/* A barra anterior tinha os 5 destinos lado a lado, sem destaque,
          sem marcar o item atual e sem respeitar a faixa de gestos do
          iPhone. Esta tem ação central elevada, estado ativo e área
          segura — e o botão "Mais" abriga o que não cabe em 5 posições. */}
      <BarraInferior
        aoSair={
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="flex min-h-[52px] w-full items-center gap-3 rounded-xl px-3 font-semibold text-vermelho-dark"
            >
              <IconeApp nome="seguranca" tamanho={28} />
              Sair da conta
            </button>
          </form>
        }
      />
    </div>
  );
}
