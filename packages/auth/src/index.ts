import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma, type Papel } from "@aprender/db";

/**
 * Autenticação do Aprender IA.
 *
 * Dois caminhos de entrada:
 *  - e-mail e senha (padrão; muitos professores não querem vincular contas)
 *  - Google (a maioria já tem conta institucional da escola)
 *
 * A sessão usa JWT em vez de sessão no banco: o adapter do Prisma cuida
 * do vínculo de contas OAuth, mas as credenciais não gravam sessão —
 * misturar as duas estratégias quebra o login por senha.
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
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,

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

        // Conta criada por Google não tem senha: não deixamos passar
        // com senha vazia, e a mensagem na tela orienta a entrar pelo Google.
        if (!usuario?.senhaHash) return null;

        const confere = await bcrypt.compare(senha, usuario.senhaHash);
        if (!confere) return null;

        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          image: usuario.avatar,
        };
      },
    }),

    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      // No login, e a cada atualização de perfil, relemos o papel do banco.
      if (user?.id) token.sub = user.id;

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
