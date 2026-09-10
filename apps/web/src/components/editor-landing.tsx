"use client";

import { useActionState, useEffect, useState } from "react";
import type { ResultadoLanding, SecaoResolvida } from "@/server/landing";

type AcaoForm = (
  anterior: ResultadoLanding | null,
  dados: FormData,
) => Promise<ResultadoLanding>;

/**
 * Editor de uma seção da landing.
 *
 * Cada seção é um formulário próprio, recolhido. Um formulário único para
 * a página inteira significaria que salvar o rodapé reescreve a capa — e
 * qualquer erro de digitação num campo derrubaria o envio de todos.
 *
 * Os campos exibidos vêm do catálogo (`campos`, `camposItem`), porque nem
 * toda seção tem selo, botão ou lista.
 */
export function EditorSecao({
  secao,
  acaoSalvar,
  acaoRestaurar,
  acaoVisibilidade,
  acaoSalvarItem,
  acaoExcluirItem,
  acaoMoverItem,
}: {
  secao: SecaoResolvida;
  acaoSalvar: AcaoForm;
  acaoRestaurar: (dados: FormData) => void;
  acaoVisibilidade: (dados: FormData) => void;
  acaoSalvarItem: AcaoForm;
  acaoExcluirItem: (dados: FormData) => void;
  acaoMoverItem: (dados: FormData) => void;
}) {
  const [estado, enviar, pendente] = useActionState(acaoSalvar, null);
  const [aberto, setAberto] = useState(false);

  const tem = (campo: string) => secao.campos.includes(campo as never);

  return (
    <section className={`card ${secao.visivel ? "" : "opacity-70"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-titulo text-lg font-bold">{secao.rotulo}</h2>
            {!secao.visivel && <span className="selo-cinza">Escondida</span>}
            {!secao.personalizada && (
              <span className="selo-amarelo">Conteúdo original</span>
            )}
          </div>
          <p className="mt-1 text-sm text-tinta-clara">{secao.ajuda}</p>
          {secao.personalizada && secao.atualizadoPor && (
            <p className="mt-1 text-xs text-cinza">
              editada por {secao.atualizadoPor}
              {secao.atualizadoEm
                ? ` em ${new Date(secao.atualizadoEm).toLocaleDateString("pt-BR")}`
                : ""}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <form action={acaoVisibilidade}>
            <input type="hidden" name="chave" value={secao.chave} />
            <button
              type="submit"
              className="rounded-md border-2 border-borda px-3 py-1.5 text-sm font-bold text-tinta-clara hover:border-indigo"
            >
              {secao.visivel ? "Esconder" : "Exibir"}
            </button>
          </form>
          <button
            onClick={() => setAberto((a) => !a)}
            className="rounded-md border-2 border-indigo-line px-3 py-1.5 text-sm font-bold text-indigo hover:border-indigo"
          >
            {aberto ? "Fechar" : "Editar"}
          </button>
        </div>
      </div>

      {/* Prévia curta, para reconhecer a seção sem abrir. */}
      {!aberto && (secao.titulo || secao.texto) && (
        <p className="mt-3 line-clamp-2 border-l-4 border-borda pl-3 text-sm text-cinza">
          {(secao.titulo || secao.texto).replace(/\n/g, " · ")}
        </p>
      )}

      {aberto && (
        <>
          {estado && (
            <div
              role="status"
              className={`mt-4 rounded-md border-l-4 px-4 py-3 ${
                estado.ok
                  ? "border-verde bg-verde-soft text-verde-dark"
                  : "border-vermelho bg-vermelho-soft text-vermelho-dark"
              }`}
            >
              {estado.mensagem}
            </div>
          )}

          <form action={enviar} className="mt-5 grid gap-4">
            <input type="hidden" name="chave" value={secao.chave} />
            <input type="hidden" name="ordem" value={secao.ordem} />
            {/* O checkbox de visibilidade tem botão próprio; aqui só
                preservamos o estado atual para não zerá-lo ao salvar. */}
            {secao.visivel && <input type="hidden" name="visivel" value="on" />}

            {tem("selo") && (
              <Campo rotulo="Faixa acima do título" nome="selo" valor={secao.selo} />
            )}

            {tem("titulo") && (
              <Campo
                rotulo="Título"
                nome="titulo"
                valor={secao.titulo}
                linhas={secao.chave === "hero" ? 3 : 2}
                ajuda={
                  secao.chave === "hero"
                    ? "Cada quebra de linha aqui vira uma quebra de linha na página."
                    : undefined
                }
              />
            )}

            {tem("subtitulo") && (
              <Campo rotulo="Subtítulo" nome="subtitulo" valor={secao.subtitulo} linhas={3} />
            )}

            {tem("texto") && (
              <Campo
                rotulo={secao.chave === "dor" ? "Faixa destacada" : "Texto de apoio"}
                nome="texto"
                valor={secao.texto}
                linhas={3}
              />
            )}

            {tem("cta") && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo rotulo="Botão principal" nome="ctaTexto" valor={secao.ctaTexto} />
                <Campo rotulo="Link do botão" nome="ctaLink" valor={secao.ctaLink} />
              </div>
            )}

            {tem("cta2") && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo rotulo="Botão secundário" nome="cta2Texto" valor={secao.cta2Texto} />
                <Campo rotulo="Link do secundário" nome="cta2Link" valor={secao.cta2Link} />
              </div>
            )}

            {tem("imagem") && (
              <Campo rotulo="Imagem (URL)" nome="imagem" valor={secao.imagem ?? ""} />
            )}
            {tem("video") && (
              <Campo rotulo="Vídeo (URL)" nome="video" valor={secao.video ?? ""} />
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={pendente} className="btn-primario">
                {pendente ? "Salvando…" : "Salvar seção"}
              </button>
              {secao.personalizada && (
                <span className="text-sm text-cinza">
                  Campo em branco volta ao texto original.
                </span>
              )}
            </div>
          </form>

          {secao.listaRotulo && (
            <ListaItens
              secao={secao}
              acaoSalvarItem={acaoSalvarItem}
              acaoExcluirItem={acaoExcluirItem}
              acaoMoverItem={acaoMoverItem}
            />
          )}

          {secao.personalizada && (
            <form action={acaoRestaurar} className="mt-5 border-t border-borda pt-4">
              <input type="hidden" name="chave" value={secao.chave} />
              <button
                type="submit"
                className="text-sm font-bold text-vermelho-dark hover:underline"
              >
                Restaurar conteúdo original desta seção
              </button>
              <p className="mt-1 text-xs text-cinza">
                Apaga também os itens desta seção e volta à lista original.
              </p>
            </form>
          )}
        </>
      )}
    </section>
  );
}

function Campo({
  rotulo,
  nome,
  valor,
  linhas,
  ajuda,
}: {
  rotulo: string;
  nome: string;
  valor: string;
  linhas?: number;
  ajuda?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-titulo text-sm font-bold text-tinta-clara">
        {rotulo}
      </span>
      {linhas && linhas > 1 ? (
        <textarea name={nome} rows={linhas} defaultValue={valor} className="campo w-full" />
      ) : (
        <input name={nome} defaultValue={valor} className="campo w-full" />
      )}
      {ajuda && <span className="mt-1 block text-xs text-cinza">{ajuda}</span>}
    </label>
  );
}

/* ============================================================
   ITENS DA SEÇÃO
   ============================================================ */

function ListaItens({
  secao,
  acaoSalvarItem,
  acaoExcluirItem,
  acaoMoverItem,
}: {
  secao: SecaoResolvida;
  acaoSalvarItem: AcaoForm;
  acaoExcluirItem: (dados: FormData) => void;
  acaoMoverItem: (dados: FormData) => void;
}) {
  const [novo, setNovo] = useState(false);

  return (
    <div className="mt-6 border-t border-borda pt-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-titulo font-bold">{secao.listaRotulo}</h3>
        <button
          onClick={() => setNovo((n) => !n)}
          className="rounded-md border-2 border-indigo-line px-3 py-1.5 text-sm font-bold text-indigo hover:border-indigo"
        >
          {novo ? "Cancelar" : "Adicionar"}
        </button>
      </div>

      {!secao.personalizada && secao.itens.length > 0 && (
        <p className="mb-3 rounded-md bg-amarelo-soft px-3 py-2 text-xs text-amarelo-dark">
          Estes itens são o conteúdo original. Ao salvar qualquer um deles, a
          seção passa a ser editável por completo.
        </p>
      )}

      {novo && (
        <div className="mb-4">
          <FormItem
            secao={secao}
            acao={acaoSalvarItem}
            aoConcluir={() => setNovo(false)}
          />
        </div>
      )}

      {secao.itens.length === 0 ? (
        <p className="py-4 text-sm text-cinza">
          Nenhum item. Enquanto a lista estiver vazia, esta seção não aparece
          na página inicial.
        </p>
      ) : (
        <ul className="space-y-2">
          {secao.itens.map((item, i) => (
            <li
              key={item.id}
              className={`rounded-md border-2 border-borda p-3 ${
                item.visivel ? "" : "opacity-60"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.cor && (
                      <span
                        aria-hidden
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ background: item.cor }}
                      />
                    )}
                    <span className="font-titulo font-bold">{item.titulo}</span>
                    {!item.visivel && <span className="selo-cinza">oculto</span>}
                  </div>
                  {item.texto && (
                    <p className="mt-1 line-clamp-2 text-sm text-tinta-clara">{item.texto}</p>
                  )}
                  {item.extra && (
                    <p className="mt-1 line-clamp-2 text-sm text-cinza">{item.extra}</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {!item.padrao && (
                    <>
                      <form action={acaoMoverItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="direcao" value="cima" />
                        <button
                          type="submit"
                          disabled={i === 0}
                          aria-label={`Subir ${item.titulo}`}
                          className="rounded-md border-2 border-borda px-2 py-1 text-xs font-bold text-tinta-clara hover:border-indigo disabled:opacity-30"
                        >
                          ↑
                        </button>
                      </form>
                      <form action={acaoMoverItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="direcao" value="baixo" />
                        <button
                          type="submit"
                          disabled={i === secao.itens.length - 1}
                          aria-label={`Descer ${item.titulo}`}
                          className="rounded-md border-2 border-borda px-2 py-1 text-xs font-bold text-tinta-clara hover:border-indigo disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>

              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-bold text-indigo">
                  Editar item
                </summary>
                <div className="mt-3">
                  <FormItem secao={secao} acao={acaoSalvarItem} item={item} />
                  {!item.padrao && (
                    <form action={acaoExcluirItem} className="mt-3">
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="text-xs font-bold text-vermelho-dark hover:underline"
                      >
                        Remover item
                      </button>
                    </form>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FormItem({
  secao,
  acao,
  item,
  aoConcluir,
}: {
  secao: SecaoResolvida;
  acao: AcaoForm;
  item?: SecaoResolvida["itens"][number];
  aoConcluir?: () => void;
}) {
  const [estado, enviar, pendente] = useActionState(acao, null);
  const tem = (c: string) => secao.camposItem.includes(c as never);

  // Fecha o formulário de "novo item" quando o salvamento deu certo.
  // Em efeito, e não no corpo do componente: chamar o setState do pai
  // durante a renderização quebra o React.
  useEffect(() => {
    if (estado?.ok) aoConcluir?.();
  }, [estado, aoConcluir]);

  const rotuloTitulo =
    secao.chave === "faq" ? "Pergunta" : secao.chave === "depoimentos" ? "Nome" : "Título";
  const rotuloTexto =
    secao.chave === "faq" ? "Resposta" : secao.chave === "depoimentos" ? "Depoimento" : "Texto";

  return (
    <form action={enviar} className="grid gap-3 rounded-md bg-fundo p-3">
      <input type="hidden" name="chave" value={secao.chave} />
      {/* Item do catálogo não tem registro: enviar o id "padrao:N" faz a
          ação criar em vez de atualizar. */}
      {item && !item.padrao && <input type="hidden" name="id" value={item.id} />}

      {estado && !estado.ok && (
        <p role="status" className="rounded-md bg-vermelho-soft px-3 py-2 text-sm text-vermelho-dark">
          {estado.mensagem}
        </p>
      )}

      <label>
        <span className="mb-1 block font-titulo text-xs font-bold text-tinta-clara">
          {rotuloTitulo}
        </span>
        <input
          name="titulo"
          required
          defaultValue={item?.titulo ?? ""}
          className="campo w-full"
        />
      </label>

      {tem("texto") && (
        <label>
          <span className="mb-1 block font-titulo text-xs font-bold text-tinta-clara">
            {rotuloTexto}
          </span>
          <textarea
            name="texto"
            rows={2}
            defaultValue={item?.texto ?? ""}
            className="campo w-full"
          />
        </label>
      )}

      {tem("extra") && (
        <label>
          <span className="mb-1 block font-titulo text-xs font-bold text-tinta-clara">
            {secao.chave === "trilha" ? "Você leva" : "Escola ou cargo"}
          </span>
          <input name="extra" defaultValue={item?.extra ?? ""} className="campo w-full" />
        </label>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {tem("icone") && (
          <label>
            <span className="mb-1 block font-titulo text-xs font-bold text-tinta-clara">
              Ícone
            </span>
            <input
              name="icone"
              defaultValue={item?.icone ?? ""}
              placeholder="notebook"
              className="campo w-full"
            />
          </label>
        )}

        {tem("cor") && (
          <label>
            <span className="mb-1 block font-titulo text-xs font-bold text-tinta-clara">
              Cor
            </span>
            <input
              name="cor"
              type="color"
              defaultValue={item?.cor ?? "#6366F1"}
              className="h-10 w-full rounded-md border-2 border-borda"
            />
          </label>
        )}

        {tem("selo") && (
          <label>
            <span className="mb-1 block font-titulo text-xs font-bold text-tinta-clara">
              Selo
            </span>
            <select name="selo" defaultValue={item?.selo ?? "verde"} className="campo w-full">
              <option value="verde">Gratuito</option>
              <option value="amarelo">Com limite</option>
              <option value="vermelho">Pago</option>
            </select>
          </label>
        )}

        {tem("link") && (
          <label>
            <span className="mb-1 block font-titulo text-xs font-bold text-tinta-clara">
              Link
            </span>
            <input name="link" defaultValue={item?.link ?? ""} className="campo w-full" />
          </label>
        )}

        {tem("imagem") && (
          <label>
            <span className="mb-1 block font-titulo text-xs font-bold text-tinta-clara">
              Foto (URL)
            </span>
            <input name="imagem" defaultValue={item?.imagem ?? ""} className="campo w-full" />
          </label>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm font-bold text-tinta-clara">
        <input
          type="checkbox"
          name="visivel"
          defaultChecked={item?.visivel ?? true}
          className="h-4 w-4"
        />
        Visível na página
      </label>

      <div>
        <button type="submit" disabled={pendente} className="btn-primario text-sm">
          {pendente ? "Salvando…" : item && !item.padrao ? "Salvar item" : "Adicionar item"}
        </button>
      </div>
    </form>
  );
}
