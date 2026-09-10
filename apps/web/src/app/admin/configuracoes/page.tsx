import {
  listarConfiguracoesParaTela,
  salvarConfiguracoes,
  restaurarPadrao,
} from "@/server/configuracoes";
import { exigirAdmin } from "@/server/admin";
import { FormConfiguracoes } from "@/components/form-configuracoes";

export const dynamic = "force-dynamic";

const GRUPOS: { chave: string; titulo: string; descricao: string }[] = [
  {
    chave: "acesso_free",
    titulo: "Acesso gratuito",
    descricao:
      "Por quanto tempo o aluno usa a plataforma de graça e o que acontece quando esse prazo termina.",
  },
  {
    chave: "geral",
    titulo: "Plataforma",
    descricao: "Identidade, contatos de suporte e abertura do cadastro público.",
  },
  {
    chave: "alunos",
    titulo: "Alunos",
    descricao: "Como o painel classifica atividade e inatividade.",
  },
  {
    chave: "financeiro",
    titulo: "Financeiro",
    descricao: "Valores padrão e o que fazer quando um pagamento atrasa.",
  },
];

export default async function Configuracoes() {
  await exigirAdmin();
  const itens = await listarConfiguracoesParaTela();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-3xl font-extrabold">Configurações</h1>
        <p className="mt-1 text-tinta-clara">
          As regras da plataforma. Tudo aqui vale imediatamente, sem alterar
          código — e o que você nunca tocou segue no valor padrão.
        </p>
      </div>

      <div className="space-y-6">
        {GRUPOS.map((g) => {
          const doGrupo = itens.filter((i) => i.grupo === g.chave);
          if (doGrupo.length === 0) return null;
          return (
            <FormConfiguracoes
              key={g.chave}
              acao={salvarConfiguracoes}
              acaoRestaurar={restaurarPadrao}
              titulo={g.titulo}
              descricao={g.descricao}
              itens={doGrupo}
            />
          );
        })}
      </div>
    </div>
  );
}
