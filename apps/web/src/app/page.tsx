import Link from "next/link";

const LADROES = [
  { icone: "📝", titulo: "Pareceres descritivos", texto: "30 a 40 textos individuais, todo fim de bimestre." },
  { icone: "📚", titulo: "Planejamento", texto: "Horas montando planos de aula do zero." },
  { icone: "✏️", titulo: "Correção", texto: "Pilhas de provas e redações no fim de semana." },
  { icone: "📋", titulo: "Burocracia", texto: "Atas, relatórios, comunicados e diários." },
];

const ENCONTROS = [
  {
    n: 1,
    cor: "#6366F1",
    fundo: "#EEF2FF",
    titulo: "Primeiros passos e a arte de conversar com a IA",
    leva: "1 plano de aula completo, gerado e refinado por você",
  },
  {
    n: 2,
    cor: "#0EA5E9",
    fundo: "#E0F2FE",
    titulo: "Sua rotina, seu planejamento e a BNCC",
    leva: "3 pareceres, 1 ata e 1 sequência didática prontos",
  },
  {
    n: 3,
    cor: "#10B981",
    fundo: "#ECFDF5",
    titulo: "Materiais, inclusão e recursos visuais",
    leva: "1 atividade em 3 níveis e 1 material adaptado",
  },
  {
    n: 4,
    cor: "#F59E0B",
    fundo: "#FEF3C7",
    titulo: "Avaliação, ética e seu projeto final",
    leva: "1 prova com gabarito, 1 rubrica e seu projeto",
  },
];

const FERRAMENTAS = [
  { nome: "DeepSeek", cor: "#4D6BFE", selo: "verde", nota: "Sem limite de mensagens" },
  { nome: "Google Gemini", cor: "#4285F4", selo: "verde", nota: "Gratuito com conta Google" },
  { nome: "Canva Educação", cor: "#00A8B0", selo: "verde", nota: "Pro gratuito para docentes" },
  { nome: "NotebookLM", cor: "#F97316", selo: "amarelo", nota: "~50 perguntas por dia" },
  { nome: "ChatGPT", cor: "#10A37F", selo: "amarelo", nota: "Troca de modelo após uso intenso" },
  { nome: "Diffit", cor: "#EC4899", selo: "amarelo", nota: "Não exporta para Docs no free" },
];

const seloClasse: Record<string, string> = {
  verde: "selo-verde",
  amarelo: "selo-amarelo",
  vermelho: "selo-vermelho",
};

export default function Home() {
  return (
    <main>
      {/* ---------- Cabeçalho ---------- */}
      <header className="sticky top-0 z-50 border-b border-borda bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="font-titulo text-xl font-extrabold text-tinta">
            Aprender<span className="text-laranja">IA</span>
          </span>
          <nav className="flex items-center gap-3">
            <Link href="/entrar" className="btn-fantasma hidden sm:inline-flex">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-primario">
              Começar agora
            </Link>
          </nav>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="bg-grad-capa">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo px-5 py-2 font-titulo text-sm font-bold text-white">
            🕐 Formação de 40 horas · Rede pública
          </span>

          <h1 className="mx-auto mt-7 max-w-4xl font-titulo text-4xl font-extrabold leading-tight text-tinta sm:text-6xl">
            Menos burocracia.
            <br />
            Aulas melhores.
            <br />
            <span className="text-laranja">Seu fim de semana de volta.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-tinta-clara sm:text-xl">
            Uma trilha prática para você usar Inteligência Artificial na rotina
            escolar — com ferramentas <strong>100% gratuitas</strong>, sem jargão
            técnico e sem precisar de cartão de crédito.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/cadastro" className="btn-primario w-full sm:w-auto">
              Criar minha conta gratuita
            </Link>
            <Link href="#trilha" className="btn-secundario w-full sm:w-auto">
              Ver como funciona
            </Link>
          </div>

          <p className="mt-5 text-sm text-cinza">
            Gratuito para professores da rede pública · Sem cartão de crédito
          </p>
        </div>
      </section>

      {/* ---------- A dor ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <h2 className="text-center font-titulo text-3xl font-extrabold sm:text-4xl">
          Onde foi parar o seu tempo?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-tinta-clara">
          Você foi formado para ensinar, inspirar e transformar vidas. Mas boa
          parte das suas horas vai para outra coisa.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LADROES.map((l) => (
            <div key={l.titulo} className="card text-center">
              <div className="text-4xl">{l.icone}</div>
              <h3 className="mt-3 font-titulo text-lg font-bold">{l.titulo}</h3>
              <p className="mt-2 text-tinta-clara">{l.texto}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg bg-indigo-soft p-7 text-center">
          <p className="mx-auto max-w-3xl text-lg text-indigo-dark">
            A IA <strong>não substitui</strong> o professor. Ela assume o trabalho
            braçal e repetitivo — a digitação, o rascunho, a formatação — e devolve
            a você o recurso mais escasso da educação:{" "}
            <strong>tempo para olhar nos olhos dos seus alunos.</strong>
          </p>
        </div>
      </section>

      {/* ---------- A trilha ---------- */}
      <section id="trilha" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center font-titulo text-3xl font-extrabold sm:text-4xl">
            Quatro encontros. Sempre com algo pronto na mão.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-tinta-clara">
            Você não sai de nenhum encontro de mãos vazias — cada um termina com
            material que dá para usar na segunda-feira.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {ENCONTROS.map((e) => (
              <div
                key={e.n}
                className="card border-l-8"
                style={{ borderLeftColor: e.cor, background: e.fundo }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-titulo text-2xl font-extrabold text-white"
                    style={{ background: e.cor }}
                  >
                    {e.n}
                  </div>
                  <div>
                    <h3 className="font-titulo text-lg font-bold">{e.titulo}</h3>
                    <p className="mt-2 text-tinta-clara">
                      <strong>Você leva:</strong> {e.leva}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Ferramentas ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <h2 className="text-center font-titulo text-3xl font-extrabold sm:text-4xl">
          Ferramentas gratuitas de verdade
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-tinta-clara">
          Nada de descobrir na terceira pergunta que precisa pagar. Dizemos os
          limites reais de cada uma — verificados em setembro de 2026.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FERRAMENTAS.map((f) => (
            <div key={f.nome} className="card">
              <div className="flex items-center justify-between gap-3">
                <span
                  className="font-titulo text-lg font-bold"
                  style={{ color: f.cor }}
                >
                  {f.nome}
                </span>
                <span className={seloClasse[f.selo]}>
                  {f.selo === "verde" ? "🟢" : "🟡"}
                </span>
              </div>
              <p className="mt-2 text-tinta-clara">{f.nota}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Chamada final ---------- */}
      <section className="bg-grad-marca py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-titulo text-3xl font-extrabold text-white sm:text-4xl">
            Comece hoje. A primeira lição leva 5 minutos.
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Sem instalação, sem cartão de crédito, direto do seu celular.
          </p>
          <Link
            href="/cadastro"
            className="btn mt-8 bg-white text-indigo hover:bg-indigo-soft"
          >
            Criar minha conta gratuita
          </Link>
        </div>
      </section>

      {/* ---------- Rodapé ---------- */}
      <footer className="border-t border-borda bg-white py-8">
        <div className="mx-auto max-w-6xl px-5 text-center text-sm text-cinza">
          <p className="font-titulo font-bold text-tinta">
            Aprender<span className="text-laranja">IA</span>
          </p>
          <p className="mt-2">
            Formação em Inteligência Artificial para professores da rede pública.
          </p>
        </div>
      </footer>
    </main>
  );
}
