/**
 * Seed do administrador da plataforma.
 *
 * Cria (ou promove) o dono da plataforma como ADMIN, sem tocar em
 * nenhum outro dado. É idempotente: rodar de novo apenas garante que
 * a conta existe e tem o papel correto.
 *
 * Uso:
 *   ADMIN_EMAIL=voce@email.com \
 *   ADMIN_PASSWORD=suaSenha \
 *   ADMIN_NOME="Seu Nome" \
 *   node <tsx> packages/db/prisma/seed-admin.ts
 *
 * Se ADMIN_PASSWORD não for informada, geramos uma senha forte e a
 * exibimos uma única vez no final — para não deixar senha fraca por
 * padrão nem senha fixa em arquivo.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();

/** Senha aleatória legível: sem caracteres ambíguos (0/O, 1/l/I). */
function gerarSenha(tamanho = 18): string {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";
  const bytes = randomBytes(tamanho);
  return Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join("");
}

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  const nome = process.env.ADMIN_NOME?.trim() || "Administrador";
  const senhaInformada = process.env.ADMIN_PASSWORD;

  if (!email) {
    console.error("ERRO: defina ADMIN_EMAIL.");
    process.exit(1);
  }

  const senha = senhaInformada || gerarSenha();
  const gerada = !senhaInformada;

  const existente = await prisma.user.findUnique({ where: { email } });

  if (existente) {
    // Conta já existe: promovemos e, se veio senha, atualizamos.
    // Sem senha informada, preservamos a atual — trocar em silêncio
    // deixaria o dono sem acesso.
    await prisma.user.update({
      where: { id: existente.id },
      data: {
        papel: "ADMIN",
        nome,
        ...(senhaInformada ? { senhaHash: await bcrypt.hash(senha, 12) } : {}),
      },
    });

    await prisma.streak.upsert({
      where: { userId: existente.id },
      create: { userId: existente.id },
      update: {},
    });

    console.log(`\nConta existente atualizada: ${email}`);
    console.log(`  papel: ADMIN`);
    console.log(
      senhaInformada
        ? "  senha: atualizada conforme ADMIN_PASSWORD"
        : "  senha: preservada (nenhuma nova foi informada)",
    );
  } else {
    const novo = await prisma.user.create({
      data: {
        nome,
        email,
        senhaHash: await bcrypt.hash(senha, 12),
        papel: "ADMIN",
        ofensiva: { create: {} },
      },
    });

    console.log(`\nAdministrador criado: ${novo.email}`);
    console.log(`  nome:  ${novo.nome}`);
    console.log(`  papel: ADMIN`);

    if (gerada) {
      console.log("\n  ----------------------------------------");
      console.log(`  SENHA: ${senha}`);
      console.log("  ----------------------------------------");
      console.log("  Anote agora: ela não será exibida de novo.");
    }
  }

  const totalAdmins = await prisma.user.count({ where: { papel: "ADMIN" } });
  console.log(`\nA plataforma tem ${totalAdmins} administrador(es).`);
  console.log("Acesse: https://aprenderia.site/admin\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
