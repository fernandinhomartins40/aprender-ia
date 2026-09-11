import { prisma } from "@aprender/db";
import { exigirAdmin } from "@/server/admin";
import {
  atualizarDados,
  atualizarEmail,
  atualizarSenha,
  encerrarSessoes,
  removerLoginExterno,
} from "@/server/perfil";
import {
  FormDados,
  FormEmail,
  FormSenha,
  BotaoAcao,
} from "@/components/formularios-perfil";

export const dynamic = "force-dynamic";

function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <h2 className="font-titulo text-xl font-extrabold">{titulo}</h2>
      {descricao && <p className="mt-1 max-w-2xl text-sm text-tinta-clara">{descricao}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function Perfil() {
  const admin = await exigirAdmin();

  const usuario = await prisma.user.findUnique({
    where: { id: admin.id },
    select: {
      nome: true,
      email: true,
      senhaHash: true,
      papel: true,
      disciplina: true,
      anoEscolar: true,
      escola: true,
      iaFavorita: true,
      criadoEm: true,
      contas: { select: { provider: true } },
      _count: { select: { execucoesPrompt: true, sessoes: true } },
    },
  });

  if (!usuario) {
    return (
      <div className="card text-center">
        <p className="py-8 text-cinza">Não foi possível carregar o seu perfil.</p>
      </div>
    );
  }

  const temSenha = Boolean(usuario.senhaHash);
  // Vínculo OAuth herdado: a plataforma não cria mais nenhum.
  const temLoginExterno = usuario.contas.length > 0;
  const totalAdmins = await prisma.user.count({ where: { papel: "ADMIN" } });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-titulo text-2xl font-extrabold text-tinta sm:text-3xl">Meu perfil</h1>
        <p className="mt-1 max-w-2xl text-sm text-tinta-clara">
          Seus dados de acesso e informações da conta.
        </p>
      </div>

      {/* ---- Resumo ---- */}
      <div className="card mb-6 bg-grad-capa">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo font-titulo text-2xl font-extrabold text-white">
            {usuario.nome.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-titulo text-xl font-extrabold">{usuario.nome}</p>
            <p className="text-tinta-clara">{usuario.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="selo-verde">{usuario.papel}</span>
              {temLoginExterno && (
                <span className="selo-amarelo">Login externo herdado</span>
              )}
              {!temSenha && (
                <span className="selo-vermelho">Sem senha definida</span>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-cinza">
            <p>
              Na plataforma desde{" "}
              {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
                usuario.criadoEm,
              )}
            </p>
            <p>{usuario._count.execucoesPrompt} prompts praticados</p>
          </div>
        </div>
      </div>

      {!temSenha && (
        <div className="mb-6 rounded-lg border-l-4 border-amarelo bg-amarelo-soft p-5">
          <p className="font-titulo font-bold text-amarelo-dark">
            ⚠️ Você ainda não tem senha
          </p>
          <p className="mt-1 text-amarelo-dark">
            Defina uma senha abaixo para poder entrar na plataforma — e para
            conseguir trocar o e-mail depois.
          </p>
        </div>
      )}

      <div className="space-y-6">
        <Secao
          titulo="Dados pessoais"
          descricao="Usamos a disciplina e o ano para sugerir prompts adequados à sua realidade."
        >
          <FormDados
            acao={atualizarDados}
            inicial={{
              nome: usuario.nome,
              disciplina: usuario.disciplina,
              anoEscolar: usuario.anoEscolar,
              escola: usuario.escola,
              iaFavorita: usuario.iaFavorita,
            }}
          />
        </Secao>

        <Secao
          titulo="E-mail de acesso"
          descricao="É com ele que você entra na plataforma."
        >
          <FormEmail
            acao={atualizarEmail}
            emailAtual={usuario.email}
            temSenha={temSenha}
          />
        </Secao>

        <Secao
          titulo={temSenha ? "Alterar senha" : "Definir senha"}
          descricao={
            temSenha
              ? "Recomendamos trocar a senha se ela foi enviada a você por mensagem."
              : "Defina uma senha para poder entrar na plataforma."
          }
        >
          <FormSenha acao={atualizarSenha} temSenha={temSenha} />
        </Secao>

        <Secao
          titulo="Segurança"
          descricao="Acessos vinculados à sua conta."
        >
          <div className="space-y-5">
            <div>
              <p className="font-titulo text-sm font-bold">Sessões de dispositivo</p>
              <p className="mb-3 text-sm text-tinta-clara">
                Você tem {usuario._count.sessoes} sessão(ões) registrada(s).{" "}
                <strong>
                  O acesso por senha usa token temporário: para invalidá-lo de
                  imediato, troque a senha.
                </strong>
              </p>
              <BotaoAcao
                acao={encerrarSessoes}
                rotulo="Encerrar sessões de dispositivo"
                rotuloPendente="Encerrando..."
                confirmacao="Encerrar as sessões registradas desta conta?"
              />
            </div>

            {temLoginExterno && (
              <div className="border-t border-borda pt-5">
                <p className="font-titulo text-sm font-bold">Login externo herdado</p>
                <p className="mb-3 text-sm text-tinta-clara">
                  Esta conta ainda tem um vínculo de login por terceiros, de
                  antes de a plataforma passar a usar apenas senha. Removê-lo
                  não afeta o seu acesso por e-mail e senha.
                  {!temSenha && " Defina uma senha antes, para não perder o acesso."}
                </p>
                <BotaoAcao
                  acao={removerLoginExterno}
                  rotulo="Remover vínculo externo"
                  rotuloPendente="Removendo..."
                  confirmacao="Remover o vínculo de login externo desta conta?"
                  variante="perigo"
                />
              </div>
            )}
          </div>
        </Secao>

        <Secao titulo="Sobre a plataforma">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-cinza">Seu papel</dt>
              <dd className="font-titulo font-bold">{usuario.papel}</dd>
            </div>
            <div>
              <dt className="text-sm text-cinza">Administradores</dt>
              <dd className="font-titulo font-bold">{totalAdmins}</dd>
            </div>
            <div>
              <dt className="text-sm text-cinza">Login por senha</dt>
              <dd className="font-titulo font-bold">
                {temSenha ? "Ativo" : "Não configurado"}
              </dd>
            </div>

          </dl>
          {totalAdmins === 1 && (
            <p className="mt-4 rounded-md bg-indigo-soft px-4 py-3 text-sm text-indigo-dark">
              Você é o único administrador. Considere promover uma segunda
              pessoa em <strong>Alunos</strong>, para não ficar sem acesso caso
              perca a senha.
            </p>
          )}
        </Secao>
      </div>
    </div>
  );
}
