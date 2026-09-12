import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma, type Papel } from "@aprender/db";

/**
 * Autenticação do Aprender IA.
 *
 * Um único caminho de entrada: identificador + senha.
 *  - o professor que se cadastrou sozinho entra pelo e-mail
 *  - o aluno cadastrado em lote entra pelo telefone
 *
 * Login social foi deliberadamente descartado: a plataforma não usa
 * autenticação por terceiros. As tabelas Account/Session continuam no
 * schema porque o PrismaAdapter as exige, mas nenhum provider OAuth
 * está registrado.
 *
 * A sessão usa JWT em vez de sessão no banco: as credenciais não gravam
 * sessão — misturar as duas estratégias quebra o login por senha.
 */

declare module "next-auth" {
  /**
   * Estendemos o usuário da sessão em vez de substituí-lo: o
   * PrismaAdapter exige os campos do AdapterUser (emailVerified etc.),
   * e trocar o tipo inteiro quebra a compilação.
   */
  interface Session {
    user: {
      id: string;
      nome: string;
      papel: Papel;
      avatar?: string | null;
    } & DefaultSession["user"];
  }

  /** Devolvido por `authorize` e lido no callback `jwt`. */
  interface User {
    manterConectado?: boolean;
  }
}

/**
 * O prazo da sessão viaja no próprio token: `session.maxAge` é um valor
 * único para toda a aplicação e não sabe distinguir quem marcou a caixa
 * "manter conectado" de quem não marcou.
 *
 * Não augmentamos a interface JWT por módulo: ela é declarada em
 * `@auth/core/jwt` (não em `next-auth/jwt`, que só a re-exporta) e o
 * caminho muda entre betas do next-auth. Como `JWT` já estende
 * `Record<string, unknown>`, gravar e ler estes campos é válido — a
 * leitura usa uma conversão pontual, como o resto do arquivo já faz.
 */

/** Duração da sessão quando o usuário marca "manter conectado". */
export const SESSAO_LONGA_SEGUNDOS = 30 * 24 * 60 * 60;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: SESSAO_LONGA_SEGUNDOS },
  trustHost: true,

  /**
   * O segredo é aceito pelos dois nomes de propósito.
   *
   * O Auth.js v5 procura `AUTH_SECRET`; este projeto nasceu com
   * `NEXTAUTH_SECRET`, que é o nome injetado pelo compose de produção e
   * gerado pelo workflow de deploy. Sem aceitar ambos, todas as rotas de
   * `/api/auth` respondem 500 com `error=Configuration` enquanto o resto
   * da aplicação continua de pé — um sintoma que não aponta para a causa.
   */
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,

  /**
   * "Manter conectado" de verdade.
   *
   * O cookie é declarado SEM `maxAge`, o que o torna um cookie de sessão:
   * o navegador o descarta ao fechar. Quem marca a caixa recebe, no
   * callback `jwt`, um prazo gravado no próprio token — e a sessão passa
   * a valer por 30 dias.
   *
   * A distinção importa: muitos professores acessam do computador
   * compartilhado da sala dos professores, onde deixar a sessão aberta
   * por 30 dias entrega a conta a quem sentar depois.
   */
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  pages: {
    signIn: "/entrar",
    error: "/entrar",
  },

  providers: [
    Credentials({
      name: "credenciais",
      credentials: {
        email: { label: "E-mail ou telefone", type: "text" },
        senha: { label: "Senha", type: "password" },
        manterConectado: { label: "Manter conectado", type: "text" },
      },
      async authorize(credentials) {
        const identificador = String(credentials?.email ?? "").toLowerCase().trim();
        const senha = String(credentials?.senha ?? "");
        if (!identificador || !senha) return null;

        // O campo aceita e-mail ou telefone. Alunos cadastrados em lote
        // entram pelo telefone; quem se cadastrou sozinho usa o e-mail.
        const apenasDigitos = identificador.replace(/\D/g, "");
        const pareceTelefone =
          apenasDigitos.length >= 10 && apenasDigitos.length <= 13 &&
          !identificador.includes("@");

        const usuario = pareceTelefone
          ? await prisma.user.findFirst({
              where: {
                OR: [
                  { telefone: apenasDigitos },
                  { email: `${apenasDigitos}@aluno.aprenderia.site` },
                ],
              },
            })
          : await prisma.user.findUnique({ where: { email: identificador } });

        // Conta sem senha definida não entra: comparar contra um hash
        // inexistente passaria com senha vazia.
        if (!usuario?.senhaHash) return null;

        const confere = await bcrypt.compare(senha, usuario.senhaHash);
        if (!confere) return null;

        // Carimbo do acesso. É a única fonte para "aluno ativo" e
        // "inativo" no painel: a ofensiva só se move quando o aluno
        // conclui lição, e entrar sem estudar também conta como acesso.
        // Falhar aqui não pode impedir o login.
        try {
          await prisma.user.update({
            where: { id: usuario.id },
            data: { ultimoAcessoEm: new Date() },
          });
        } catch {
          /* o login segue mesmo sem o carimbo */
        }

        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          image: usuario.avatar,
          // Lido pelo callback `jwt` para definir o prazo da sessão.
          manterConectado: String(credentials?.manterConectado ?? "") === "true",
        } as { id: string; name: string; email: string; image: string | null; manterConectado: boolean };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      // No login, e a cada atualização de perfil, relemos o papel do banco.
      if (user?.id) token.sub = user.id;

      // No login gravamos o prazo escolhido no próprio token. Sem a caixa
      // marcada, o cookie já morre ao fechar o navegador; o prazo curto
      // aqui garante que um token copiado também não sobreviva.
      if (user) {
        const manter = (user as { manterConectado?: boolean }).manterConectado === true;
        token.manterConectado = manter;
        token.expiraEm = manter
          ? Date.now() + SESSAO_LONGA_SEGUNDOS * 1000
          : Date.now() + 12 * 60 * 60 * 1000;
      }

      // Token além do prazo: devolvemos vazio para forçar novo login.
      if (typeof token.expiraEm === "number" && Date.now() > token.expiraEm) {
        return null;
      }

      if (token.sub && (user || trigger === "update" || !token.papel)) {
        const atual = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { nome: true, papel: true, avatar: true, email: true },
        });
        if (atual) {
          token.nome = atual.nome;
          token.papel = atual.papel;
          token.avatar = atual.avatar;
          token.email = atual.email;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.nome = (token.nome as string) ?? "";
        session.user.papel = (token.papel as Papel) ?? "ALUNO";
        session.user.avatar = (token.avatar as string | null) ?? null;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },

  events: {
    /** Toda conta nova começa como ALUNO e ganha sua ofensiva zerada. */
    async createUser({ user }) {
      if (!user.id) return;
      await prisma.streak.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      });
    },
  },
});

/* ============================================================
   Utilidades de senha e permissão
   ============================================================ */

export async function gerarHashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 12);
}

export async function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

const HIERARQUIA: Record<Papel, number> = {
  ALUNO: 1,
  INSTRUTOR: 2,
  ADMIN: 3,
};

/** Verifica se o papel atende ao nível mínimo exigido. */
export function temPermissao(papel: Papel | undefined, minimo: Papel): boolean {
  if (!papel) return false;
  return HIERARQUIA[papel] >= HIERARQUIA[minimo];
}

export function ehAdmin(papel: Papel | undefined): boolean {
  return papel === "ADMIN";
}
