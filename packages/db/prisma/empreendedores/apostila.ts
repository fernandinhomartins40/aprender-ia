/**
 * A apostila do curso de Empreendedores.
 *
 * Material de CONSULTA, e não o conteúdo das aulas. A diferença é de
 * propósito: a lição explica, demonstra e faz produzir; a apostila é onde
 * se procura uma referência depois, quando a dúvida aparece no meio do
 * expediente.
 *
 * Por isso ela não repete o texto das lições. Ela guarda o que se
 * consulta: as listas, as fórmulas, os limites das ferramentas, o
 * vocabulário. E é daqui que sai o PDF — apostila na tela e apostila
 * impressa precisam dizer a mesma coisa.
 */

type Secao = { numero: string; titulo: string; html: string };
type Capitulo = {
  chave: string;
  numero: number | null;
  titulo: string;
  icone: string;
  aberturaHtml: string;
  secoes: Secao[];
};

export const APOSTILA_EMPREENDEDORES: Capitulo[] = [
  {
    chave: "emp-cap-1",
    numero: 1,
    titulo: "O que a IA faz e o que ela não faz",
    icone: "🤖",
    aberturaHtml:
      "<p>Resumo de consulta rápida. A explicação completa está nas lições do Módulo 1.</p>",
    secoes: [
      {
        numero: "1.1",
        titulo: "O que esperar",
        html: "<p><strong>Faz bem:</strong> escrever, reescrever, resumir, organizar informação, dar ideias, explicar algo complicado em linguagem simples, transformar anotação em documento.</p><p><strong>Não faz:</strong> saber o que aconteceu no seu negócio, garantir que um número está certo, decidir preço ou crédito, conhecer seus clientes e contratos — a menos que você mostre.</p>",
      },
      {
        numero: "1.2",
        titulo: "Alucinação: quando ela inventa com segurança",
        html: "<p>A IA monta o texto mais provável. Quando não tem o dado, ela completa mesmo assim — e com a mesma confiança de quando acerta.</p><p><strong>Onde ela mais inventa:</strong> preço, prazo, medida, telefone, endereço, CNPJ, lei e número de norma, dados do seu negócio, fontes de pesquisa (inclusive links que não abrem).</p><p><strong>Regra:</strong> nada que tenha número, nome ou consequência sai sem conferência.</p>",
      },
      {
        numero: "1.3",
        titulo: "O que não colar na IA",
        html: "<p>Nome completo, CPF, RG, telefone, endereço, dado bancário, número de cartão, prontuário, informação sob sigilo contratual.</p><p><strong>O que fazer:</strong> trocar por marcadores — CLIENTE A, VALOR X, FORNECEDOR 1. O resultado é o mesmo e o dado não sai da sua casa.</p>",
      },
    ],
  },
  {
    chave: "emp-cap-2",
    numero: 2,
    titulo: "C.O.F.R.E. — a estrutura de um bom pedido",
    icone: "🔐",
    aberturaHtml:
      "<p>As cinco partes, para consultar na hora de escrever.</p>",
    secoes: [
      {
        numero: "2.1",
        titulo: "As cinco partes",
        html: "<p><strong>C — Contexto:</strong> quem é você e qual é a situação.</p><p><strong>O — Objetivo:</strong> o que você quer conseguir.</p><p><strong>F — Formato:</strong> como a resposta deve chegar.</p><p><strong>R — Restrições:</strong> o que não pode. A parte mais esquecida e a que mais muda o resultado.</p><p><strong>E — Entrada:</strong> o material com que ela deve trabalhar, sem dado pessoal.</p>",
      },
      {
        numero: "2.2",
        titulo: "Restrições que valem para quase tudo",
        html: "<ul><li>Não invente preço, prazo ou medida — deixe [VALOR] onde eu devo preencher</li><li>Não prometa o que depende de mim confirmar</li><li>Não use promessa absoluta ('o melhor', 'garantido')</li><li>Onde faltar informação, escreva [CONFIRMAR] em vez de supor</li><li>Separe o que é fato do que é hipótese</li></ul>",
      },
    ],
  },
  {
    chave: "emp-cap-3",
    numero: 3,
    titulo: "Prompt visual: pedir imagem",
    icone: "🖼️",
    aberturaHtml: "<p>As oito partes de um pedido de imagem.</p>",
    secoes: [
      {
        numero: "3.1",
        titulo: "As oito partes",
        html: "<ol><li><strong>Assunto</strong> — o que aparece, com detalhe</li><li><strong>Ambiente</strong> — onde está</li><li><strong>Composição</strong> — de onde se vê</li><li><strong>Iluminação</strong> — que luz</li><li><strong>Estilo</strong> — fotografia realista, ilustração</li><li><strong>Cores</strong> — a paleta da sua marca</li><li><strong>Formato</strong> — quadrado, deitado</li><li><strong>Restrições</strong> — sem texto, sem marca de terceiros, sem pessoas</li></ol>",
      },
      {
        numero: "3.2",
        titulo: "Por que pedir sem texto",
        html: "<p>Letra gerada por IA costuma sair torta ou com erro de grafia. Gere a imagem limpa e escreva o texto depois, no Canva: fica melhor e dá para corrigir quando quiser.</p>",
      },
    ],
  },
  {
    chave: "emp-cap-4",
    numero: 4,
    titulo: "Ferramentas e o que é gratuito de verdade",
    icone: "🧰",
    aberturaHtml:
      "<p>Faixas conferidas na documentação oficial em setembro de 2026. Isto envelhece: confirme na própria ferramenta antes de decidir.</p>",
    secoes: [
      {
        numero: "4.1",
        titulo: "Assistentes de texto",
        html: "<p><strong>ChatGPT</strong> — gratuito com limites. Conversa de texto sem limite fixo; imagem, upload e voz têm cota. Plano Go a US$ 8/mês amplia 10×.</p><p><strong>Gemini</strong> — gratuito com conta Google, com cota diária nos modelos melhores.</p><p><strong>Claude</strong> — gratuito com cota. Delegar trabalho sobre pastas de arquivos é dos planos pagos.</p>",
      },
      {
        numero: "4.2",
        titulo: "Documentos, planilhas e base de conhecimento",
        html: "<p><strong>Gemini no Documentos e Planilhas</strong> — depende do plano. Montar planilha inteira por descrição exige Google AI Pro ou Ultra. O caminho gratuito é exportar CSV e analisar no chat.</p><p><strong>NotebookLM (Gemini Notebook)</strong> — gratuito com limites: até 50 fontes por caderno, cada uma com até 500 mil palavras ou 200 MB.</p>",
      },
      {
        numero: "4.3",
        titulo: "Imagem, vídeo e automação",
        html: "<p><strong>ChatGPT Imagens</strong> — gratuito com limites; poucas imagens por dia.</p><p><strong>Google Veo</strong> — cerca de 10 gerações por mês em conta comum.</p><p><strong>Pika</strong> — gratuito com uso comercial permitido, limitado a 480p.</p><p><strong>Make</strong> — 1.000 operações por mês e 2 automações ativas no gratuito.</p><p><em>Nota: o Sora foi encerrado pela OpenAI em março de 2026 e não consta deste material.</em></p>",
      },
    ],
  },
  {
    chave: "emp-cap-5",
    numero: 5,
    titulo: "Automação e agentes",
    icone: "⚙️",
    aberturaHtml: "<p>As definições e as regras de segurança.</p>",
    secoes: [
      {
        numero: "5.1",
        titulo: "Chatbot, automação e agente",
        html: "<p><strong>Chatbot</strong> responde perguntas.</p><p><strong>Automação</strong> executa passos fixos, sempre na mesma ordem.</p><p><strong>Agente</strong> recebe um objetivo e decide os passos.</p>",
      },
      {
        numero: "5.2",
        titulo: "Regras que não se negociam",
        html: "<ul><li>Automação gera rascunho; quem envia ao cliente é uma pessoa</li><li>O agente nunca decide preço, desconto, crédito, cancelamento ou questão jurídica</li><li>Quando não souber, ele diz que vai confirmar — nunca inventa</li><li>Todo processo tem de ter um jeito de desligar</li></ul>",
      },
      {
        numero: "5.3",
        titulo: "Antes de ligar uma automação",
        html: "<p>Teste: dado faltando, dado errado, execução em duplicidade, pico de volume e desligamento no meio. Se não houver resposta para 'como eu desligo isso numa sexta às duas da tarde', não ligue.</p>",
      },
    ],
  },
  {
    chave: "emp-anexo-a",
    numero: null,
    titulo: "Guia de bolso",
    icone: "🆘",
    aberturaHtml:
      "<p>Para consultar no meio do expediente, quando não há tempo de procurar a lição.</p>",
    secoes: [
      {
        numero: "A.1",
        titulo: "A resposta veio genérica",
        html: "<p>Falta uma das cinco partes — quase sempre a restrição. Acrescente o que NÃO pode e peça de novo.</p>",
      },
      {
        numero: "A.2",
        titulo: "A IA citou um dado que eu não dei",
        html: "<p>É alucinação. Acrescente: 'use somente as informações que eu forneci; onde faltar dado, escreva [FALTA]'.</p>",
      },
      {
        numero: "A.3",
        titulo: "Preciso colar algo com dado de cliente",
        html: "<p>Troque por marcadores antes: CLIENTE A, VALOR X. Se for muito texto, peça primeiro à IA que aponte o que deve ser removido — e cole só o texto limpo.</p>",
      },
      {
        numero: "A.4",
        titulo: "O texto não parece meu",
        html: "<p>Dê um exemplo de algo que você escreveu e peça para seguir aquele tom. Descrever o tom funciona menos que mostrar.</p>",
      },
    ],
  },
];
