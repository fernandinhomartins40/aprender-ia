"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import type { ResultadoPerfil } from "@/server/perfil";
import { CampoSenha } from "@/components/campo-senha";

type Acao = (
  anterior: ResultadoPerfil | null,
  dados: FormData,
) => Promise<ResultadoPerfil>;

/** Mensagem de retorno, com papel de status para leitores de tela. */
function Aviso({ estado }: { estado: ResultadoPerfil | null }) {
  if (!estado) return null;
  return (
    <p
      role="status"
      className={`mt-4 rounded-md border-l-4 px-4 py-3 text-sm ${
        estado.ok
          ? "border-verde bg-verde-soft text-verde-dark"
          : "border-vermelho bg-vermelho-soft text-vermelho-dark"
      }`}
    >
      {estado.mensagem}
    </p>
  );
}

/* ============================================================
   DADOS PESSOAIS
   ============================================================ */

export function FormDados({
  acao,
  inicial,
}: {
  acao: Acao;
  inicial: {
    nome: string;
    disciplina: string | null;
    anoEscolar: string | null;
    escola: string | null;
    iaFavorita: string | null;
  };
}) {
  const [estado, enviar, pendente] = useActionState(acao, null);
  const router = useRouter();

  return (
    <form
      action={async (d) => {
        await enviar(d);
        router.refresh(); // atualiza o nome no cabeçalho
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="nome" className="mb-1 block font-titulo text-sm font-bold">
          Nome completo
        </label>
        <input
          id="nome"
          name="nome"
          required
          minLength={3}
          defaultValue={inicial.nome}
          className="campo"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="disciplina" className="mb-1 block font-titulo text-sm font-bold">
            Disciplina
          </label>
          <input
            id="disciplina"
            name="disciplina"
            defaultValue={inicial.disciplina ?? ""}
            placeholder="Ex: Matemática"
            className="campo"
          />
        </div>
        <div>
          <label htmlFor="anoEscolar" className="mb-1 block font-titulo text-sm font-bold">
            Ano ou série
          </label>
          <input
            id="anoEscolar"
            name="anoEscolar"
            defaultValue={inicial.anoEscolar ?? ""}
            placeholder="Ex: 6º ano"
            className="campo"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="escola" className="mb-1 block font-titulo text-sm font-bold">
            Escola
          </label>
          <input
            id="escola"
            name="escola"
            defaultValue={inicial.escola ?? ""}
            className="campo"
          />
        </div>
        <div>
          <label htmlFor="iaFavorita" className="mb-1 block font-titulo text-sm font-bold">
            IA preferida
          </label>
          <select
            id="iaFavorita"
            name="iaFavorita"
            defaultValue={inicial.iaFavorita ?? ""}
            className="campo"
          >
            <option value="">Sem preferência</option>
            <option value="gemini">Google Gemini</option>
            <option value="deepseek">DeepSeek</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="claude">Claude</option>
            <option value="qwen">Qwen</option>
          </select>
        </div>
      </div>

      <button type="submit" disabled={pendente} className="btn-primario">
        {pendente ? "Salvando..." : "Salvar dados"}
      </button>

      <Aviso estado={estado} />
    </form>
  );
}

/* ============================================================
   E-MAIL
   ============================================================ */

export function FormEmail({
  acao,
  emailAtual,
  temSenha,
}: {
  acao: Acao;
  emailAtual: string;
  temSenha: boolean;
}) {
  const [estado, enviar, pendente] = useActionState(acao, null);

  return (
    <form action={enviar} className="space-y-4">
      <p className="text-sm text-tinta-clara">
        E-mail atual: <strong className="text-tinta">{emailAtual}</strong>
      </p>

      <div>
        <label htmlFor="novoEmail" className="mb-1 block font-titulo text-sm font-bold">
          Novo e-mail
        </label>
        <input
          id="novoEmail"
          name="email"
          type="email"
          required
          placeholder="novo@email.com"
          className="campo"
        />
      </div>

      <CampoSenha
        id="senhaEmail"
        name="senhaAtual"
        rotulo="Confirme com a sua senha"
        required={temSenha}
        autoComplete="current-password"
      >
        <p className="mt-1 text-sm text-cinza">
          Pedimos a senha porque o e-mail é a sua identidade de login.
        </p>
      </CampoSenha>

      <button type="submit" disabled={pendente} className="btn-primario">
        {pendente ? "Alterando..." : "Alterar e-mail"}
      </button>

      <Aviso estado={estado} />
    </form>
  );
}

/* ============================================================
   SENHA
   ============================================================ */

export function FormSenha({ acao, temSenha }: { acao: Acao; temSenha: boolean }) {
  const [estado, enviar, pendente] = useActionState(acao, null);
  const [nova, setNova] = useState("");

  // Medidor simples e honesto: comprimento e variedade de caracteres.
  const forca = (() => {
    if (!nova) return null;
    let pontos = 0;
    if (nova.length >= 8) pontos++;
    if (nova.length >= 12) pontos++;
    if (/[a-z]/.test(nova) && /[A-Z]/.test(nova)) pontos++;
    if (/\d/.test(nova)) pontos++;
    if (/[^\w\s]/.test(nova)) pontos++;
    if (pontos <= 2) return { rotulo: "Fraca", cor: "#EF4444", pct: 33 };
    if (pontos <= 3) return { rotulo: "Razoável", cor: "#EAB308", pct: 66 };
    return { rotulo: "Forte", cor: "#10B981", pct: 100 };
  })();

  return (
    <form action={enviar} className="space-y-4">
      {temSenha && (
        <CampoSenha
          id="senhaAtual"
          name="senhaAtual"
          rotulo="Senha atual"
          required
          autoComplete="current-password"
        />
      )}

      <CampoSenha
        id="novaSenha"
        name="novaSenha"
        rotulo={temSenha ? "Nova senha" : "Defina uma senha"}
        required
        minLength={8}
        value={nova}
        onChange={(e) => setNova(e.target.value)}
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
      >
        {forca && (
          <div className="mt-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-borda">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${forca.pct}%`, background: forca.cor }}
              />
            </div>
            <p className="mt-1 text-sm" style={{ color: forca.cor }}>
              {forca.rotulo}
            </p>
          </div>
        )}
      </CampoSenha>

      <CampoSenha
        id="confirmarSenha"
        name="confirmarSenha"
        rotulo="Repita a nova senha"
        required
        minLength={8}
        autoComplete="new-password"
      />

      <button type="submit" disabled={pendente} className="btn-primario">
        {pendente ? "Alterando..." : temSenha ? "Alterar senha" : "Definir senha"}
      </button>

      <Aviso estado={estado} />
    </form>
  );
}

/* ============================================================
   AÇÕES DE SEGURANÇA
   ============================================================ */

export function BotaoAcao({
  acao,
  rotulo,
  rotuloPendente,
  confirmacao,
  variante = "secundario",
}: {
  acao: () => Promise<ResultadoPerfil>;
  rotulo: string;
  rotuloPendente: string;
  confirmacao?: string;
  variante?: "secundario" | "perigo";
}) {
  const [estado, setEstado] = useState<ResultadoPerfil | null>(null);
  const [pendente, setPendente] = useState(false);

  async function executar() {
    if (confirmacao && !window.confirm(confirmacao)) return;
    setPendente(true);
    setEstado(await acao());
    setPendente(false);
  }

  return (
    <div>
      <button
        onClick={executar}
        disabled={pendente}
        className={
          variante === "perigo"
            ? "btn border-2 border-vermelho text-vermelho-dark hover:bg-vermelho-soft"
            : "btn-secundario"
        }
      >
        {pendente ? rotuloPendente : rotulo}
      </button>
      <Aviso estado={estado} />
    </div>
  );
}
