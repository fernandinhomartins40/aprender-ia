"use client";

import { useActionState, useState } from "react";

type Resultado = { ok: boolean; mensagem: string };
type Turma = { id: string; nome: string };
type Licao = { id: string; titulo: string; modulo: string };
type Acao = (anterior: Resultado | null, dados: FormData) => Promise<Resultado>;

export function FormConteudoNotificacao({
  acao,
  turmas,
  licoes,
}: {
  acao: Acao;
  turmas: Turma[];
  licoes: Licao[];
}) {
  const [estado, enviar, pendente] = useActionState(acao, null);
  const [publico, setPublico] = useState("todos");
  const [destino, setDestino] = useState("");

  return (
    <section className="card">
      <h2 className="font-titulo text-xl font-extrabold">
        Novo conteúdo de notificação
      </h2>
      <p className="mt-1 text-sm text-tinta-clara">
        Crie uma página própria, com mídia hospedada pela plataforma, CTA e
        entrega agendada.
      </p>
      {estado && (
        <p
          className={`mt-3 rounded-lg p-3 text-sm font-semibold ${estado.ok ? "bg-verde-soft text-verde-dark" : "bg-vermelho-soft text-vermelho-dark"}`}
        >
          {estado.mensagem}
        </p>
      )}
      <form
        action={enviar}
        className="mt-5 grid gap-4"
        encType="multipart/form-data"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="titulo"
            required
            className="campo"
            placeholder="Título"
          />
          <input
            name="subtitulo"
            className="campo"
            placeholder="Subtítulo (resumo no Push)"
          />
        </div>
        <textarea
          name="corpo"
          required
          className="campo min-h-32"
          placeholder="Conteúdo completo da página"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold">
            Imagem (JPG, PNG ou WebP, até 25 MB)
            <input
              name="imagem"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="mt-1 block w-full text-sm"
            />
          </label>
          <label className="text-sm font-bold">
            Vídeo (MP4 ou WebM, até 25 MB)
            <input
              name="video"
              type="file"
              accept="video/mp4,video/webm"
              className="mt-1 block w-full text-sm"
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <select name="categoria" className="campo">
            <option value="ESSENCIAL">Sistema</option>
            <option value="ESTUDO">Estudo</option>
            <option value="DESAFIO">Desafio</option>
            <option value="CONQUISTA">Conquista</option>
            <option value="MISSAO">Missão</option>
          </select>
          <select name="icone" className="campo">
            <option value="notificacoes">Aviso</option>
            <option value="desafios">Desafio</option>
            <option value="conquistas">Conquista</option>
            <option value="metas">Missão</option>
          </select>
          <input
            name="prioridade"
            type="number"
            min="0"
            max="9"
            defaultValue="0"
            className="campo"
            placeholder="Prioridade"
          />
          <input
            name="ctaRotulo"
            className="campo"
            placeholder="Texto do botão"
          />
        </div>
        <select
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          className="campo"
        >
          <option value="">CTA sem destino</option>
          <option value="/app/trilha">Trilha</option>
          <option value="/app/missoes">Missões</option>
          <option value="/app/prompts">Banco de prompts</option>
          {licoes.map((licao) => (
            <option key={licao.id} value={`/app/licao/${licao.id}`}>
              {licao.modulo} · {licao.titulo}
            </option>
          ))}
        </select>
        <input type="hidden" name="ctaLink" value={destino} />
        <label className="flex gap-2 text-sm">
          <input name="ctaExterno" type="checkbox" /> O destino é externo (use
          apenas URL HTTPS abaixo)
        </label>
        <input
          name="ctaLinkExterno"
          className="campo"
          placeholder="https://... (substitui o destino interno)"
        />
        <div className="grid gap-4 md:grid-cols-3">
          <select
            name="publico"
            value={publico}
            onChange={(e) => setPublico(e.target.value)}
            className="campo"
          >
            <option value="todos">Todos os alunos</option>
            <option value="turma">Uma turma</option>
            <option value="inativos">Alunos inativos (7+ dias)</option>
          </select>
          {publico === "turma" && (
            <select name="publicoId" className="campo" required>
              <option value="">Selecione a turma</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome}
                </option>
              ))}
            </select>
          )}
          <input
            name="publicarEm"
            type="datetime-local"
            className="campo"
            title="Vazio = publicar agora"
          />
          <input
            name="expiraEm"
            type="datetime-local"
            className="campo"
            title="Expiração opcional"
          />
        </div>
        <button disabled={pendente} className="btn-primario justify-self-start">
          {pendente ? "Salvando…" : "Publicar ou agendar conteúdo"}
        </button>
      </form>
    </section>
  );
}
