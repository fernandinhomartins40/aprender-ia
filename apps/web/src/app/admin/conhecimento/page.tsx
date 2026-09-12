import { prisma } from "@aprender/db";
import { CATEGORIAS_CONHECIMENTO } from "@aprender/db";
import { exigirAdmin } from "@/server/admin";
import {
  alternarPublicacaoVerbete,
  excluirVerbete,
  salvarVerbete,
} from "@/server/base-conhecimento";
import {
  Cartao,
  GradeIndicadores,
  Indicador,
  Secao,
  TituloPagina,
  Vazio,
} from "@/components/pagina-admin";

export const dynamic = "force-dynamic";

/**
 * Gestão da Base de Conhecimento.
 *
 * Uma explicação salva aqui muda em toda a aplicação de uma vez — nos
 * ícones ⓘ espalhados pelas telas e na Central de Conhecimento.
 *
 * Duas decisões de formulário que evitam expor estrutura de dados a quem
 * escreve conteúdo:
 *
 * - Sinônimos e termos relacionados são uma entrada por linha, em vez de
 *   array JSON.
 * - As importâncias por contexto usam `contexto: texto`, uma por linha.
 *   É o campo mais poderoso do sistema (é ele que faz a explicação mudar
 *   conforme a tela) e precisava ser editável sem escrever JSON.
 */

type Verbete = Awaited<ReturnType<typeof prisma.knowledgeEntry.findMany>>[number];

/** Os contextos reconhecidos, para orientar quem preenche. */
const CONTEXTOS = [
  "inicio",
  "trilha",
  "licao",
  "prompts",
  "criar-prompt",
  "gerador",
  "ferramentas",
  "diario",
  "missoes",
  "conquistas",
  "planejamento",
];

function importanciasEmTexto(valor: unknown): string {
  if (!valor || typeof valor !== "object") return "";
  return Object.entries(valor as Record<string, string>)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

function Formulario({ verbete }: { verbete?: Verbete }) {
  const novo = !verbete;
  return (
    <form action={salvarVerbete} className="grid gap-3 md:grid-cols-2">
      <input type="hidden" name="id" value={verbete?.id ?? ""} />

      <label className="md:col-span-1">
        <span className="mb-1 block text-sm font-bold text-tinta">Termo *</span>
        <input
          className="campo w-full"
          name="termo"
          required
          defaultValue={verbete?.termo}
          placeholder="Ex.: Avaliação formativa"
        />
      </label>

      <label className="md:col-span-1">
        <span className="mb-1 block text-sm font-bold text-tinta">
          Identificador (slug)
        </span>
        <input
          className="campo w-full"
          name="slug"
          defaultValue={verbete?.slug}
          placeholder="deixe vazio para gerar a partir do termo"
        />
      </label>

      <label className="md:col-span-1">
        <span className="mb-1 block text-sm font-bold text-tinta">Categoria</span>
        <input
          className="campo w-full"
          name="categoria"
          list="categorias-conhecimento"
          defaultValue={verbete?.categoria}
          placeholder="Ex.: Avaliação"
        />
        <datalist id="categorias-conhecimento">
          {CATEGORIAS_CONHECIMENTO.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>

      <label className="md:col-span-1">
        <span className="mb-1 block text-sm font-bold text-tinta">
          Sinônimos <span className="font-normal text-cinza">(um por linha)</span>
        </span>
        <textarea
          className="campo min-h-[42px] w-full"
          name="sinonimos"
          rows={2}
          defaultValue={verbete?.sinonimos.join("\n")}
          placeholder={"devolutiva\nfeedback"}
        />
      </label>

      <label className="md:col-span-2">
        <span className="mb-1 block text-sm font-bold text-tinta">
          Definição curta *{" "}
          <span className="font-normal text-cinza">
            (uma frase; é o que aparece primeiro no ícone ⓘ)
          </span>
        </span>
        <textarea
          className="campo w-full"
          name="resumo"
          required
          rows={2}
          defaultValue={verbete?.resumo}
        />
      </label>

      <label className="md:col-span-2">
        <span className="mb-1 block text-sm font-bold text-tinta">
          Explicação completa *{" "}
          <span className="font-normal text-cinza">
            (linha vazia separa parágrafos; escreva para quem nunca ouviu o termo)
          </span>
        </span>
        <textarea
          className="campo w-full"
          name="explicacao"
          required
          rows={7}
          defaultValue={verbete?.explicacao}
        />
      </label>

      <label className="md:col-span-2">
        <span className="mb-1 block text-sm font-bold text-tinta">
          Por que importa, por contexto{" "}
          <span className="font-normal text-cinza">
            (uma linha por contexto, no formato <code>contexto: texto</code>)
          </span>
        </span>
        <textarea
          className="campo w-full"
          name="importancias"
          rows={4}
          defaultValue={importanciasEmTexto(verbete?.importancias)}
          placeholder={"prompts: Informar isso evita material genérico.\nplanejamento: Ajuda a conferir a coerência da aula."}
        />
        <span className="mt-1 block text-xs text-cinza">
          Contextos reconhecidos: {CONTEXTOS.join(", ")}
        </span>
      </label>

      <label className="md:col-span-1">
        <span className="mb-1 block text-sm font-bold text-tinta">Nome da fonte oficial</span>
        <input
          className="campo w-full"
          name="fonteNome"
          defaultValue={verbete?.fonteNome ?? ""}
          placeholder="Ex.: BNCC · MEC"
        />
        <span className="mt-1 block text-xs text-cinza">
          Vazio = a interface mostra como explicação didática da plataforma, não como
          norma.
        </span>
      </label>

      <label className="md:col-span-1">
        <span className="mb-1 block text-sm font-bold text-tinta">URL da fonte oficial</span>
        <input
          className="campo w-full"
          name="fonteUrl"
          defaultValue={verbete?.fonteUrl ?? ""}
          placeholder="https://..."
        />
        <span className="mt-1 block text-xs text-cinza">Apenas https.</span>
      </label>

      <label className="md:col-span-1">
        <span className="mb-1 block text-sm font-bold text-tinta">
          &quot;Saiba mais&quot; — destino
        </span>
        <input
          className="campo w-full"
          name="saibaMaisUrl"
          defaultValue={verbete?.saibaMaisUrl ?? ""}
          placeholder="/app/conhecimento/bncc ou https://..."
        />
        <span className="mt-1 block text-xs text-cinza">
          Prefira conteúdo interno (começa com /) quando ele existir.
        </span>
      </label>

      <label className="md:col-span-1">
        <span className="mb-1 block text-sm font-bold text-tinta">
          Termos relacionados{" "}
          <span className="font-normal text-cinza">(slugs, um por linha)</span>
        </span>
        <textarea
          className="campo min-h-[42px] w-full"
          name="relacionadoSlugs"
          rows={2}
          defaultValue={verbete?.relacionadoSlugs.join("\n")}
          placeholder={"bncc\nhabilidade-bncc"}
        />
      </label>

      <div className="flex flex-wrap items-center gap-4 md:col-span-2">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="publicado" defaultChecked={verbete?.publicado ?? true} />
          Visível para os professores
        </label>
        <button className="btn-primario">{novo ? "Adicionar termo" : "Salvar alterações"}</button>
      </div>
    </form>
  );
}

export default async function ConhecimentoAdmin() {
  await exigirAdmin();
  const verbetes = await prisma.knowledgeEntry.findMany({
    orderBy: [{ categoria: "asc" }, { termo: "asc" }],
  });

  const publicados = verbetes.filter((v) => v.publicado).length;
  const semFonte = verbetes.filter((v) => !v.fonteNome).length;
  const categorias = new Set(verbetes.map((v) => v.categoria)).size;

  return (
    <div>
      <TituloPagina
        titulo="Base de Conhecimento"
        descricao="As explicações que aparecem nos ícones ⓘ de toda a aplicação e na Central de Conhecimento. Editar aqui muda em todas as telas de uma vez."
      />

      <GradeIndicadores>
        <Indicador rotulo="Termos cadastrados" valor={String(verbetes.length)} />
        <Indicador
          rotulo="Visíveis aos professores"
          valor={String(publicados)}
          tom={publicados === verbetes.length ? "positivo" : "atencao"}
          detalhe={publicados < verbetes.length ? `${verbetes.length - publicados} oculto(s)` : undefined}
        />
        <Indicador rotulo="Categorias" valor={String(categorias)} />
        <Indicador
          rotulo="Sem fonte oficial"
          valor={String(semFonte)}
          detalhe="mostrados como explicação da plataforma"
        />
      </GradeIndicadores>

      <Secao
        titulo="Novo termo"
        descricao="Escreva para um professor que nunca ouviu falar do assunto. Se a informação for normativa, indique a fonte oficial."
      >
        <Cartao>
          <Formulario />
        </Cartao>
      </Secao>

      <Secao titulo="Termos cadastrados">
        {verbetes.length === 0 ? (
          <Vazio
            titulo="Nenhum termo cadastrado"
            descricao="Rode o seed para carregar a base inicial, ou cadastre o primeiro termo no formulário acima."
          />
        ) : (
          <div className="space-y-4">
            {verbetes.map((v) => (
              <Cartao key={v.id}>
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-titulo font-bold text-tinta">
                      {v.termo}
                      {!v.publicado && (
                        <span className="ml-2 rounded-full bg-amarelo-soft px-2 py-0.5 text-xs font-bold text-amarelo-dark">
                          oculto
                        </span>
                      )}
                      {!v.fonteNome && (
                        <span className="ml-2 rounded-full bg-fundo px-2 py-0.5 text-xs font-semibold text-cinza">
                          sem fonte oficial
                        </span>
                      )}
                    </h3>
                    <p className="mt-0.5 text-xs text-cinza">
                      {v.categoria} · <code>{v.slug}</code>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <form action={alternarPublicacaoVerbete}>
                      <input type="hidden" name="id" value={v.id} />
                      <button className="text-sm font-bold text-indigo">
                        {v.publicado ? "Ocultar" : "Publicar"}
                      </button>
                    </form>
                    <form action={excluirVerbete}>
                      <input type="hidden" name="id" value={v.id} />
                      <button className="text-sm font-bold text-vermelho-dark">Excluir</button>
                    </form>
                  </div>
                </div>
                <details>
                  <summary className="cursor-pointer text-sm font-bold text-indigo">
                    Editar este termo
                  </summary>
                  <div className="mt-4">
                    <Formulario verbete={v} />
                  </div>
                </details>
              </Cartao>
            ))}
          </div>
        )}
      </Secao>
    </div>
  );
}
