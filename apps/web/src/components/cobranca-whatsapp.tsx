"use client";

import { useState } from "react";
import { reais, dataBR } from "@/lib/dinheiro";

/**
 * Botão de cobrança por WhatsApp.
 *
 * Abre o wa.me com a mensagem já escrita. Não é integração de pagamento
 * — é só o atalho para o dono da plataforma falar com quem está devendo,
 * sem ter que redigir a mesma mensagem dezenas de vezes.
 */
export function CobrancaWhatsApp({
  telefone,
  nome,
  descricao,
  valorCentavos,
  vencimentoEm,
}: {
  telefone: string | null;
  nome: string;
  descricao: string;
  valorCentavos: number;
  vencimentoEm: Date | string;
}) {
  const [copiado, setCopiado] = useState(false);

  const primeiroNome = nome.split(" ")[0] ?? nome;
  const mensagem =
    `Olá, ${primeiroNome}! Tudo bem?\n\n` +
    `Passando para lembrar do pagamento de "${descricao}", ` +
    `no valor de ${reais(valorCentavos)}, com vencimento em ${dataBR(new Date(vencimentoEm))}.\n\n` +
    `Assim que regularizar, seu acesso ao curso continua normalmente. ` +
    `Qualquer dúvida, é só me chamar por aqui!`;

  if (!telefone) {
    return (
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(mensagem);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 2000);
        }}
        title="Este aluno não tem telefone cadastrado — copie a mensagem"
        className="rounded-md border-2 border-borda px-3 py-1.5 text-sm font-bold text-tinta-clara hover:border-cinza"
      >
        {copiado ? "Copiado!" : "Copiar cobrança"}
      </button>
    );
  }

  // O WhatsApp precisa do DDI. Números brasileiros salvos com 10 ou 11
  // dígitos entram sem o 55, então completamos aqui.
  const numero = telefone.length <= 11 ? `55${telefone}` : telefone;

  return (
    <a
      href={`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-md border-2 border-verde px-3 py-1.5 text-sm font-bold text-verde-dark hover:bg-verde-soft"
    >
      Cobrar no WhatsApp
    </a>
  );
}
