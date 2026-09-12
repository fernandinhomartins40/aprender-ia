import Link from "next/link";
import { exigirAluno } from "@/server/trilha";
import { Termo } from "@/components/termo";

export const dynamic = "force-dynamic";

/**
 * BNCC explicada do zero.
 *
 * Material progressivo, sem pressupor conhecimento prévio: começa em "o
 * que é" e chega em "como usar na prática". Existe porque a BNCC é o
 * assunto que mais gera dúvida na plataforma e porque um verbete de
 * popover não dá conta de doze perguntas encadeadas.
 *
 * Regra que atravessa a página: nenhuma habilidade é citada por
 * aproximação. Explicamos a ESTRUTURA de um código e mandamos conferir a
 * descrição no documento oficial. A plataforma não tem a tabela de
 * habilidades, e afirmar conteúdo sem ela seria repetir exatamente o erro
 * que o curso ensina a evitar.
 *
 * Cada afirmação normativa aponta a fonte. O que é leitura nossa está
 * marcado como tal.
 */

const OFICIAL = "https://basenacionalcomum.mec.gov.br/";
const ABASE = "https://basenacionalcomum.mec.gov.br/abase/";
const PDF = "https://basenacionalcomum.mec.gov.br/images/BNCC_EI_EF_110518_versaofinal_site.pdf";

const SECOES = [
  { id: "o-que-e", titulo: "O que é a BNCC?" },
  { id: "para-que-serve", titulo: "Para que ela serve?" },
  { id: "quem-usa", titulo: "Quem utiliza?" },
  { id: "competencias", titulo: "O que são competências?" },
  { id: "habilidades", titulo: "O que são habilidades?" },
  { id: "diferenca", titulo: "Competência e habilidade: qual a diferença?" },
  { id: "codigos", titulo: "O que significam os códigos?" },
  { id: "ler-codigo", titulo: "Como interpretar um código?" },
  { id: "atividade", titulo: "Como se relaciona com uma atividade?" },
  { id: "planejamento", titulo: "Como se relaciona com o planejamento?" },
  { id: "obrigatorio", titulo: "É obrigatório utilizar a BNCC?" },
  { id: "pratica", titulo: "Como usar na prática?" },
];

export default async function BnccExplicada() {
  await exigirAluno();

  return (
    <div className="mx-auto max-w-3xl">
      <nav aria-label="Trilha de navegação" className="mb-4 text-sm">
        <Link href="/app/conhecimento" className="font-semibold text-indigo hover:underline">
          Central de Conhecimento
        </Link>
        <span className="mx-1.5 text-cinza">/</span>
        <span className="text-tinta-clara">BNCC explicada do zero</span>
      </nav>

      <header>
        <h1 className="font-titulo text-3xl font-extrabold">BNCC explicada do zero</h1>
        <p className="mt-2 leading-relaxed text-tinta-clara">
          Doze perguntas em ordem, sem pressupor que você já conhece o assunto. Se você
          nunca leu o documento, comece aqui e leia na sequência.
        </p>
      </header>

      {/* Índice: doze seções em uma página longa precisam de acesso
          direto, sobretudo no celular. */}
      <nav aria-label="Nesta página" className="mt-6 rounded-xl border border-borda bg-white p-5">
        <p className="font-titulo text-sm font-bold text-tinta">Nesta página</p>
        <ol className="mt-2.5 space-y-1.5">
          {SECOES.map((s, i) => (
            <li key={s.id} className="text-sm">
              <a href={`#${s.id}`} className="text-indigo hover:underline">
                <span className="font-bold">{i + 1}.</span> {s.titulo}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-4 rounded-xl border border-verde bg-verde-soft p-4 text-sm leading-relaxed text-verde-dark">
        <b className="font-bold">Como ler esta página.</b> As afirmações sobre o que a
        BNCC determina vêm do documento oficial, sempre com link para a fonte. As
        orientações de uso em sala são leitura pedagógica da plataforma e estão marcadas
        como tal — você pode discordar delas; do documento, não.
      </div>

      <article className="mt-8 space-y-10">
        {/* ------------------------------------------------------- 1 */}
        <Secao id="o-que-e" numero={1} titulo="O que é a BNCC?">
          <p>
            A Base Nacional Comum Curricular <Termo slug="bncc" /> é um documento de
            caráter normativo que define o conjunto orgânico e progressivo de
            aprendizagens essenciais que todos os estudantes devem desenvolver ao longo
            da Educação Básica — da Educação Infantil ao Ensino Médio.
          </p>
          <p>
            Três coisas que ela <b>não</b> é, e que causam a maior parte da confusão:
          </p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Não é um currículo pronto. Currículo quem faz é a rede e a escola.</li>
            <li>Não é um plano de aula nem uma lista de atividades.</li>
            <li>Não é um material didático nem substitui o livro que você usa.</li>
          </ul>
          <p>
            É uma <b>referência comum</b>: um piso de aprendizagens que deve estar
            garantido em qualquer escola do país, sobre o qual cada rede constrói o seu
            currículo considerando a realidade local.
          </p>
          <Fonte href={OFICIAL} nome="Portal oficial da BNCC · MEC" />
        </Secao>

        {/* ------------------------------------------------------- 2 */}
        <Secao id="para-que-serve" numero={2} titulo="Para que ela serve?">
          <p>
            A função central é de equidade: garantir que uma criança em qualquer
            município tenha direito ao mesmo conjunto de aprendizagens essenciais que
            uma criança em outro. Antes dela, o que se esperava de um 5º ano variava
            muito de rede para rede.
          </p>
          <p>Na prática, ela é referência para:</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>a elaboração dos currículos das redes e das propostas das escolas;</li>
            <li>a produção de material didático;</li>
            <li>a formação de professores;</li>
            <li>as avaliações em larga escala.</li>
          </ul>
          <Fonte href={OFICIAL} nome="Portal oficial da BNCC · MEC" />
        </Secao>

        {/* ------------------------------------------------------- 3 */}
        <Secao id="quem-usa" numero={3} titulo="Quem utiliza?">
          <p>
            Redes de ensino e escolas, ao construir currículo e proposta pedagógica.
            Editoras, ao produzir material. Instituições, ao formar professores. Órgãos
            de avaliação, ao elaborar provas.
          </p>
          <p>
            E o professor — mas de um jeito específico que vale esclarecer. Você
            normalmente não trabalha com a BNCC diretamente: trabalha com o currículo da
            sua rede, que já foi construído a partir dela. A consulta ao documento
            original é útil quando você quer entender a progressão de um tema, conferir
            um código que apareceu em algum lugar, ou justificar uma escolha pedagógica.
          </p>
          <Nossa>
            Se o seu município tem currículo próprio alinhado à BNCC, ele é a sua
            referência mais imediata. O documento nacional continua valendo como base
            do que aquele currículo organizou.
          </Nossa>
        </Secao>

        {/* ------------------------------------------------------- 4 */}
        <Secao id="competencias" numero={4} titulo="O que são competências?">
          <p>
            A BNCC define competência <Termo slug="competencia" /> como a mobilização de
            conhecimentos (conceitos e procedimentos), habilidades (práticas, cognitivas
            e socioemocionais), atitudes e valores para resolver demandas complexas da
            vida cotidiana, do pleno exercício da cidadania e do mundo do trabalho.
          </p>
          <p>
            Repare no verbo: <b>mobilizar</b>. Competência não é o que se sabe, é o que
            se faz com o que se sabe, numa situação que exige decidir.
          </p>
          <p>
            O documento organiza <b>dez competências gerais</b>{" "}
            <Termo slug="competencias-gerais" /> que atravessam toda a Educação Básica e
            todos os componentes. Elas tratam de conhecimento, pensamento científico e
            crítico, repertório cultural, comunicação, cultura digital, trabalho e
            projeto de vida, argumentação, autoconhecimento, empatia e cooperação, e
            responsabilidade e cidadania.
          </p>
          <p>
            A redação completa de cada uma está na fonte. Vale ler no original: são
            parágrafos densos que resumos costumam achatar.
          </p>
          <Fonte href={ABASE} nome="BNCC · competências gerais (MEC)" />
        </Secao>

        {/* ------------------------------------------------------- 5 */}
        <Secao id="habilidades" numero={5} titulo="O que são habilidades?">
          <p>
            Habilidade <Termo slug="habilidade-bncc" /> é a descrição de uma
            aprendizagem específica esperada em determinada etapa e componente
            curricular. É o nível mais concreto do documento.
          </p>
          <p>Cada habilidade é escrita com uma estrutura reconhecível:</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              <b>um verbo</b> no início, que indica o processo cognitivo envolvido —
              identificar, comparar, analisar, justificar, criar;
            </li>
            <li>
              <b>o objeto de conhecimento</b> <Termo slug="objeto-conhecimento" /> sobre
              o qual esse processo se aplica;
            </li>
            <li>
              <b>o contexto ou a modalidade</b>, quando há.
            </li>
          </ul>
          <p>
            O verbo é a parte mais importante para o planejamento, e a mais ignorada.
            Uma habilidade que pede &quot;justificar&quot; não se cumpre com uma
            atividade em que o estudante apenas localiza a resposta no texto — mesmo que
            o assunto seja exatamente o mesmo.
          </p>
          <Fonte href={ABASE} nome="BNCC · MEC" />
        </Secao>

        {/* ------------------------------------------------------- 6 */}
        <Secao id="diferenca" numero={6} titulo="Competência e habilidade: qual a diferença?">
          <p>
            É a dúvida mais frequente sobre o documento. A diferença é de{" "}
            <b>escopo e de tempo</b>.
          </p>
          <div className="overflow-x-auto rounded-xl border border-borda">
            <table className="w-full text-left text-sm">
              <thead className="bg-fundo">
                <tr>
                  <th className="p-3 font-titulo font-bold">&nbsp;</th>
                  <th className="p-3 font-titulo font-bold">Competência</th>
                  <th className="p-3 font-titulo font-bold">Habilidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borda">
                <tr>
                  <th className="p-3 font-bold text-tinta-clara">Amplitude</th>
                  <td className="p-3">Ampla, atravessa componentes</td>
                  <td className="p-3">Específica de uma etapa e componente</td>
                </tr>
                <tr>
                  <th className="p-3 font-bold text-tinta-clara">Tempo</th>
                  <td className="p-3">Desenvolve-se ao longo de anos</td>
                  <td className="p-3">Pode ser trabalhada em aulas ou semanas</td>
                </tr>
                <tr>
                  <th className="p-3 font-bold text-tinta-clara">Observação</th>
                  <td className="p-3">Indireta, por indícios acumulados</td>
                  <td className="p-3">Direta, em produções e desempenhos</td>
                </tr>
                <tr>
                  <th className="p-3 font-bold text-tinta-clara">No documento</th>
                  <td className="p-3">Dez competências gerais, sem código</td>
                  <td className="p-3">Centenas de habilidades, com código</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            A relação entre as duas é de composição: habilidades desenvolvidas ao longo
            do tempo, em vários componentes, é o que constitui uma competência. Uma
            habilidade só, cumprida numa aula, não forma competência nenhuma — e uma
            competência não se ensina diretamente numa aula.
          </p>
          <Nossa>
            Um jeito prático de decidir: se você consegue observar em uma produção da
            semana, é habilidade. Se só se percebe olhando o percurso de um ano, é
            competência.
          </Nossa>
        </Secao>

        {/* ------------------------------------------------------- 7 */}
        <Secao id="codigos" numero={7} titulo="O que significam os códigos?">
          <p>
            Cada habilidade tem um código alfanumérico{" "}
            <Termo slug="codigo-bncc" /> que serve para localizá-la no documento. É
            endereço, não conteúdo: o código diz <i>onde</i> a habilidade está, não{" "}
            <i>o que</i> ela pede.
          </p>
          <p>
            A distinção importa mais do que parece. Escrever um código no plano de aula
            não alinha nada, se a descrição daquela habilidade não foi lida. E como as
            estruturas são regulares, é fácil <b>inventar</b> um código que pareça
            perfeitamente válido e não exista — que é precisamente o que ferramentas de
            IA fazem com frequência <Termo slug="alucinacao" contexto="prompts" />.
          </p>
          <Fonte href={PDF} nome="BNCC · documento oficial em PDF (MEC)" />
        </Secao>

        {/* ------------------------------------------------------- 8 */}
        <Secao id="ler-codigo" numero={8} titulo="Como interpretar um código?">
          <p>
            No Ensino Fundamental o código tem quatro partes. Tomando{" "}
            <b>EF05CI05</b> como exemplo:
          </p>
          <div className="overflow-x-auto rounded-xl border border-borda">
            <table className="w-full text-left text-sm">
              <thead className="bg-fundo">
                <tr>
                  <th className="p-3 font-titulo font-bold">Parte</th>
                  <th className="p-3 font-titulo font-bold">Significa</th>
                  <th className="p-3 font-titulo font-bold">No exemplo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borda">
                <tr>
                  <td className="p-3 font-mono font-bold">EF</td>
                  <td className="p-3">Etapa</td>
                  <td className="p-3">Ensino Fundamental</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold">05</td>
                  <td className="p-3">Ano ou bloco de anos</td>
                  <td className="p-3">5º ano</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold">CI</td>
                  <td className="p-3">Componente ou área</td>
                  <td className="p-3">Ciências</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold">05</td>
                  <td className="p-3">Sequencial da habilidade</td>
                  <td className="p-3">quinta da lista</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Quando os dois dígitos do meio não correspondem a um ano (como{" "}
            <b>15</b> ou <b>69</b>), trata-se de um bloco: 1º ao 5º, 6º ao 9º. A
            habilidade vale para o bloco inteiro, e a rede decide a distribuição.
          </p>
          <p>
            <b>As outras etapas usam estruturas próprias.</b> A Educação Infantil{" "}
            <Termo slug="campos-experiencia" /> combina grupo etário e campo de
            experiência; o Ensino Médio usa três letras para a área e três dígitos para
            o sequencial. Não tente ler um código de Médio com a régua do Fundamental.
          </p>
          <div className="rounded-xl border-2 border-indigo bg-indigo-soft p-4">
            <p className="font-titulo text-sm font-bold text-indigo-dark">
              Experimente na Central
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-tinta-clara">
              Digite um código na busca da{" "}
              <Link href="/app/conhecimento" className="font-bold text-indigo underline">
                Central de Conhecimento
              </Link>{" "}
              e ela decompõe a estrutura para você. A descrição da habilidade, essa só
              existe no documento oficial — e é para lá que a Central manda.
            </p>
          </div>
          <Fonte href={PDF} nome="BNCC · documento oficial em PDF (MEC)" />
        </Secao>

        {/* ------------------------------------------------------- 9 */}
        <Secao id="atividade" numero={9} titulo="Como se relaciona com uma atividade?">
          <p>
            A relação honesta entre atividade e habilidade passa pelo verbo. Se a
            habilidade pede &quot;comparar&quot;, a atividade precisa colocar o
            estudante diante de dois casos e pedir que ele estabeleça a relação. Se a
            atividade só pede que ele identifique um dado no texto, o processo cognitivo
            é outro — e o alinhamento é só aparente.
          </p>
          <p>Três perguntas resolvem a maior parte dos casos:</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>O que a atividade pede é o processo que o verbo da habilidade descreve?</li>
            <li>O objeto de conhecimento é o mesmo?</li>
            <li>
              O que o estudante vai produzir permite <i>observar</i> essa aprendizagem{" "}
              <Termo slug="evidencia-aprendizagem" contexto="planejamento" />?
            </li>
          </ul>
          <Nossa>
            Se a resposta a qualquer uma for &quot;não&quot;, a relação é decorativa:
            o código está no papel e a aprendizagem prevista não está sendo trabalhada.
          </Nossa>
        </Secao>

        {/* ------------------------------------------------------ 10 */}
        <Secao id="planejamento" numero={10} titulo="Como se relaciona com o planejamento?">
          <p>
            A ordem que funciona é esta, e é o contrário do que se faz com frequência:
          </p>
          <ol className="ml-5 list-decimal space-y-1.5">
            <li>Você decide o que a turma precisa aprender, a partir do que observou.</li>
            <li>
              Consulta o currículo da rede (ou a BNCC) para ver como aquela aprendizagem
              está prevista para essa etapa.
            </li>
            <li>
              Escreve o objetivo da aula <Termo slug="objetivo-pedagogico" contexto="planejamento" />{" "}
              em palavras suas.
            </li>
            <li>Desenha a atividade e decide a evidência.</li>
            <li>Registra o código, se o seu formulário pede.</li>
          </ol>
          <p>
            O caminho inverso — pegar um código e tentar montar uma aula em volta dele —
            produz planos que cumprem a papelada e não respondem à turma que está na
            sala.
          </p>
          <Nossa>
            A BNCC entra no passo 2, como referência de progressão{" "}
            <Termo slug="progressao" contexto="planejamento" />: ajuda a ver o que vem
            antes e o que vem depois do que você está ensinando.
          </Nossa>
        </Secao>

        {/* ------------------------------------------------------ 11 */}
        <Secao id="obrigatorio" numero={11} titulo="É obrigatório utilizar a BNCC?">
          <p>
            A BNCC tem <b>caráter normativo</b>: as redes de ensino e as instituições
            escolares têm a obrigação de adequar seus currículos e propostas pedagógicas
            a ela. Nesse nível, sim, é obrigatória.
          </p>
          <p>
            Para o professor, a obrigação chega pela forma que a sua rede adotou — o
            currículo local, o formato do plano, os campos que o sistema pede. Isso varia
            de rede para rede, e é com a sua coordenação que você confirma o que é
            exigido no seu caso.
          </p>
          <p>
            O que ela <b>não</b> determina: a metodologia da sua aula, a ordem dos
            conteúdos no bimestre, os materiais que você usa, a forma da sua avaliação.
            Essas escolhas continuam sendo profissionais e suas.
          </p>
          <Fonte href={OFICIAL} nome="Portal oficial da BNCC · MEC" />
        </Secao>

        {/* ------------------------------------------------------ 12 */}
        <Secao id="pratica" numero={12} titulo="Como usar na prática?">
          <p>Quatro usos que compensam o tempo de consulta:</p>
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <b>Ver a progressão de um tema.</b> Antes de ensinar frações no 6º ano,
              olhar o que estava previsto no 5º diz de onde a turma deveria vir — e onde
              ela está de fato.
            </li>
            <li>
              <b>Conferir o nível de exigência.</b> O verbo da habilidade informa se o
              esperado é identificar, comparar ou justificar. Isso calibra a atividade e
              a avaliação.
            </li>
            <li>
              <b>Justificar uma escolha.</b> Quando você quer defender um projeto ou um
              uso de tecnologia, a competência de cultura digital{" "}
              <Termo slug="cultura-digital" contexto="planejamento" /> é um argumento
              documental, não uma opinião.
            </li>
            <li>
              <b>Conferir o que a IA devolveu.</b> Todo código sugerido por ferramenta de
              IA precisa ser verificado na fonte{" "}
              <Termo slug="revisao-humana" contexto="prompts" />. É o uso mais frequente
              do documento no dia a dia de quem trabalha com essas ferramentas.
            </li>
          </ul>

          <div className="rounded-xl bg-fundo p-5">
            <p className="font-titulo font-bold text-tinta">Continuar daqui</p>
            <ul className="mt-2.5 space-y-2 text-sm">
              <li>
                <a href={ABASE} target="_blank" rel="noopener noreferrer" className="font-bold text-indigo underline">
                  Consultar a BNCC oficial por etapa e componente →
                </a>
              </li>
              <li>
                <Link href="/app/conhecimento" className="font-bold text-indigo underline">
                  Voltar à Central de Conhecimento →
                </Link>
              </li>
              <li>
                <Link href="/app/prompts" className="font-bold text-indigo underline">
                  Ver prompts de planejamento no banco →
                </Link>
              </li>
            </ul>
          </div>
        </Secao>
      </article>
    </div>
  );
}

function Secao({
  id,
  numero,
  titulo,
  children,
}: {
  id: string;
  numero: number;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    // `scroll-mt` compensa o cabeçalho fixo: sem isso o título da seção
    // fica escondido atrás dele ao chegar por link de âncora.
    <section id={id} className="scroll-mt-28">
      <h2 className="font-titulo text-xl font-extrabold text-tinta sm:text-2xl">
        <span className="text-indigo">{numero}.</span> {titulo}
      </h2>
      <div className="mt-3 space-y-3 leading-relaxed text-tinta-clara">{children}</div>
    </section>
  );
}

/** Fonte oficial de uma afirmação normativa. */
function Fonte({ href, nome }: { href: string; nome: string }) {
  return (
    <p className="border-t border-borda pt-3 text-xs text-cinza">
      <b className="font-bold text-tinta-clara">Informação oficial · </b>
      <a href={href} target="_blank" rel="noopener noreferrer" className="font-bold text-indigo underline">
        {nome}
      </a>
    </p>
  );
}

/** Leitura pedagógica da plataforma — marcada para não se confundir com norma. */
function Nossa({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border-l-4 border-indigo bg-indigo-soft/50 p-4 text-sm leading-relaxed">
      <b className="block font-titulo text-xs font-bold uppercase tracking-wide text-indigo-dark">
        Leitura da plataforma
      </b>
      <span className="mt-1 block text-tinta-clara">{children}</span>
    </div>
  );
}
