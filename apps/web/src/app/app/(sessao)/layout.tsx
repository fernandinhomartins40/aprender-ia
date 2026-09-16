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
import { IconeApp } from "@/components/icone-app";
import { BarraInferior } from "@/components/barra-inferior";
import { MenuDesktop, type ItemMenuAluno } from "@/components/menu-desktop";

// Ícones 3D autorais, como no painel administrativo.
//
// Os 11 itens não cabiam numa linha: somavam ~1.466px dentro dos 984px úteis
// do cabeçalho, então os últimos quebravam para a segunda linha e
// "Notificações" saía cortado. Ficam na barra os que o aluno usa durante o
// encontro; o resto vai para o botão "Mais" (ver MenuDesktop).
const MENU_PRINCIPAL: ItemMenuAluno[] = [
  { href: "/app", rotulo: "Início", icone: "inicio" },
  { href: "/app/trilha", rotulo: "Trilha", icone: "trilhas" },
  { href: "/app/aula", rotulo: "Aulas", icone: "apresentacao" },
  { href: "/app/prompts", rotulo: "Prompts", icone: "prompt" },
  { href: "/app/ferramentas", rotulo: "Ferramentas", icone: "ferramentas" },
];

const MENU_SECUNDARIO: ItemMenuAluno[] = [
  { href: "/app/apostila", rotulo: "Apostila", icone: "documentos" },
  { href: "/app/criar-prompt", rotulo: "Criar prompt", icone: "ideias" },
  { href: "/app/conhecimento", rotulo: "Conhecimento", icone: "ideias" },
  { href: "/app/diario", rotulo: "Diário de bordo", icone: "documentos" },
  { href: "/app/conquistas", rotulo: "Conquistas", icone: "conquistas" },
  { href: "/app/missoes", rotulo: "Missões", icone: "metas" },
  { href: "/app/meus-planos", rotulo: "Meus planos", icone: "planos" },
  { href: "/app/notificacoes", rotulo: "Notificações", icone: "notificacoes" },
];

function dataLonga(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(d));
}

export default async function LayoutAluno({ children }: { children: React.ReactNode }) {
  const user = await exigirAluno();

  // Este layout roda em TODA navegação do aluno — são 16 páginas. As
  // quatro leituras eram sequenciais, cada uma esperando a anterior:
  // somavam quatro idas ao banco em série no caminho crítico. Em
  // paralelo, o custo passa a ser o da mais lenta.
  //
  // Nenhuma depende do resultado da outra, então não há o que ordenar.
  const [conta, avisarDiasAntes, avisos, chavePush] = await Promise.all([
    // Contas criadas em lote entram com senha provisória. Barramos o
    // acesso à trilha até que o aluno defina a sua — a provisória é
    // adivinhável por quem tem a lista de chamada.
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        precisaTrocarSenha: true,
        plano: true,
        freeAte: true,
        freeRevogadoEm: true,
      },
    }),
    lerNumero("free.avisar_dias_antes"),
    minhasNotificacoes(),
    chavePublicaPush(),
  ]);

  // Dentro do escopo `/app`: a tela equivalente em `/trocar-senha` fica
  // fora dele e expulsava do aplicativo instalado quem tinha senha
  // provisória — logo no primeiro acesso.
  if (conta?.precisaTrocarSenha) redirect("/app/trocar-senha");

  // Aviso de prazo: um acesso que expira sem avisar é uma porta que
  // fecha na cara de quem estava estudando. Só aparece na janela
  // configurada, e não para quem tem plano completo.
  const situacaoFree =
    conta && conta.plano !== "PREMIUM"
      ? avaliarFree(conta, avisarDiasAntes || 7)
      : null;

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
              <Link href="/admin" target="_blank" rel="noopener" className="btn-fantasma text-sm">
                Administração
              </Link>
            )}
            <form
              action={async () => {
                "use server";
                // Dentro do escopo `/app`: sair mandava para `/`, que é a
              // landing e fica FORA do escopo do PWA. No aplicativo
              // instalado isso abria a barra do navegador e acabava com a
              // experiência de aplicativo. `/app/entrar` é a tela de
              // login do próprio app.
              await signOut({ redirectTo: "/app/entrar" });
              }}
            >
              <button type="submit" className="btn-fantasma text-sm">
                Sair
              </button>
            </form>
          </div>
        </div>

        {/* menu no desktop */}
        <MenuDesktop principais={MENU_PRINCIPAL} secundarios={MENU_SECUNDARIO} />
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

      <main className="mx-auto max-w-5xl overflow-x-hidden px-3 py-8 sm:px-5">
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
              // Dentro do escopo `/app`: sair mandava para `/`, que é a
              // landing e fica FORA do escopo do PWA. No aplicativo
              // instalado isso abria a barra do navegador e acabava com a
              // experiência de aplicativo. `/app/entrar` é a tela de
              // login do próprio app.
              await signOut({ redirectTo: "/app/entrar" });
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
