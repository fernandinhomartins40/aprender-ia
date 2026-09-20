import { TipoLicao } from "@prisma/client";
import type { LicaoExtra } from "./modulos-extras";

/**
 * A terceira leva: completa os módulos que ficaram mais finos que os
 * outros e reforça a Fase 8 (NotebookLM), que o briefing pedia com
 * sete casos de uso e tinha cinco lições.
 */

export const LICOES_EXTRAS_3: LicaoExtra[] = [
  /* ============================================================
     NotebookLM — Fase 8
     ============================================================ */
  {
    modulo: "Seus documentos respondendo por você",
    titulo: "Sete usos que resolvem problema de verdade",
    tipo: TipoLicao.TEORIA,
    xp: 20,
    tempo: 10,
    cap: "Cap. 8.1",
    conteudo: {
      blocos: [
        {
          tipo: "texto",
          texto:
            "A ferramenta parece simples demais para ser útil: você sobe arquivos e faz perguntas. O valor aparece quando você olha o que isso substitui no dia a dia.",
        },
        {
          tipo: "destaque",
          titulo: "1. Treinar quem acabou de entrar",
          texto:
            "Suba procedimentos, tabela de preços e manual. A pessoa nova pergunta ao caderno em vez de interromper quem está produzindo — e a resposta vem com a citação de onde saiu.",
        },
        {
          tipo: "destaque",
          titulo: "2. Achar a cláusula no contrato",
          texto:
            "Quarenta páginas viram uma pergunta: 'o que acontece se eu atrasar o pagamento?'. A resposta aponta o trecho exato.",
        },
        {
          tipo: "destaque",
          titulo: "3. Entender uma norma ou legislação",
          texto:
            "Suba o documento oficial e pergunte o que muda para o seu caso. Continua valendo conferir com quem entende, mas você chega à conversa sabendo o que perguntar.",
        },
        {
          tipo: "destaque",
          titulo: "4. Consultar manual de equipamento",
          texto:
            "Manual de 200 páginas em PDF, e a dúvida é sempre a mesma na hora do aperto. Perguntar é mais rápido que folhear — inclusive pelo celular, ao lado da máquina.",
        },
        {
          tipo: "destaque",
          titulo: "5. Preparar uma reunião",
          texto:
            "Suba os documentos do assunto e peça o que exige decisão, o que está ambíguo e as perguntas a fazer. Quinze minutos em vez de duas horas.",
        },
        {
          tipo: "destaque",
          titulo: "6. Montar a central de conhecimento do negócio",
          texto:
            "Tudo que hoje está na cabeça de uma pessoa só: como se faz, por que se faz assim, o que já foi tentado. Escrito e consultável.",
        },
        {
          tipo: "destaque",
          titulo: "7. Pesquisar sem sair dos seus dados",
          texto:
            "Quando a resposta precisa vir do que você tem — e não da internet —, esta é a ferramenta certa. É a diferença entre resposta conferível e resposta plausível.",
        },
        {
          tipo: "dica",
          titulo: "Comece pelo que você mais procura",
          texto:
            "Qual documento você abre e fica rolando atrás de uma informação? Esse é o primeiro a subir.",
        },
      ],
    },
  },
  {
    modulo: "Seus documentos respondendo por você",
    titulo: "Duelo: perguntar à internet × perguntar aos seus arquivos",
    tipo: TipoLicao.DUELO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 8.1",
    conteudo: {
      situacao:
        "Uma gerente precisa saber qual é a política de troca da própria empresa para responder um cliente.",
      ruim: {
        titulo: "Perguntar a uma IA comum",
        prompt: "Qual é o prazo padrão de troca no varejo brasileiro?",
        resultado:
          "Uma resposta sobre o Código de Defesa do Consumidor, genérica e provavelmente correta — mas que não é a política da empresa dela, que pode ser mais generosa ou ter exceções próprias.",
      },
      bom: {
        titulo: "Perguntar ao caderno com os documentos",
        prompt:
          "Com base nos documentos deste caderno: qual é a nossa política de troca? Existe exceção para produto em promoção? Cite o trecho de onde saiu cada informação.",
        resultado:
          "A política real da empresa, com a citação do documento e do trecho — que ela pode conferir antes de responder o cliente, e mostrar à equipe depois.",
      },
      pergunta:
        "Que pergunta sobre o seu negócio você tem feito à internet quando a resposta está nos seus próprios documentos?",
      fechamento:
        "A diferença não é qualidade: é origem. Uma responde o que é comum no mercado; a outra responde o que é verdade na sua empresa — e mostra onde está escrito.",
    },
  },
  {
    modulo: "Seus documentos respondendo por você",
    titulo: "Caça ao erro: a base que respondeu com informação velha",
    tipo: TipoLicao.CACA_ERRO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 8.2",
    conteudo: {
      contexto:
        "Uma loja montou o caderno com os documentos e a equipe começou a usar. Esta resposta chegou a um cliente. Três coisas deram errado antes.",
      texto:
        "Pergunta do atendente: 'Qual o prazo de entrega para a região metropolitana?'\n\nResposta da base: 'O prazo de entrega para a região metropolitana é de 5 a 7 dias úteis. Para pedidos acima de R$ 300, o frete é gratuito.'\n\nFonte citada: Tabela_Logistica.pdf\n\nO que era verdade: o prazo mudou para 2 a 3 dias em março, quando a loja trocou de transportadora. O frete grátis passou a valer acima de R$ 500.",
      erros: [
        {
          trecho: "Tabela_Logistica.pdf",
          porque:
            "Documento sem data no nome. Havia duas versões no caderno, e a base respondeu pela antiga — sem ter como saber qual valia.",
        },
        {
          trecho: "prazo de entrega para a região metropolitana é de 5 a 7 dias úteis",
          porque:
            "Informação com prazo de validade e sem data escrita dentro do documento. Toda informação que muda precisa dizer desde quando vale.",
        },
        {
          trecho: "Para pedidos acima de R$ 300, o frete é gratuito",
          porque:
            "Ninguém removeu o documento antigo quando a política mudou. A base não apaga sozinha: o que continua lá, continua valendo para ela.",
        },
      ],
      licao:
        "A base é tão confiável quanto a curadoria. Três regras resolvem: data no nome do arquivo, data dentro do texto para toda informação que muda, e uma versão por assunto — a antiga sai quando a nova entra.",
    },
  },
  {
    modulo: "Seus documentos respondendo por você",
    titulo: "Checkpoint: seus documentos trabalhando",
    tipo: TipoLicao.CHECKPOINT,
    xp: 20,
    tempo: 5,
    cap: "Cap. 8",
    conteudo: {
      titulo: "O que você leva deste módulo",
      itens: [
        "É a única que responde só com o que você entregou, e cita a fonte",
        "Teste sempre com uma pergunta cuja resposta você já sabe",
        "Uma versão por assunto, com data no nome do arquivo",
        "Informação que muda precisa dizer desde quando vale",
        "Até 50 fontes por caderno no gratuito — sobra para negócio pequeno",
      ],
      pergunta:
        "Que documento você abre e fica rolando atrás de informação? Esse é o primeiro a subir.",
    },
  },

  /* ============================================================
     Projeto final — fechar o curso
     ============================================================ */
  {
    modulo: "Minha Empresa Aumentada por IA",
    titulo: "Como um plano de adoção se transforma em ação",
    tipo: TipoLicao.TEORIA,
    xp: 20,
    tempo: 9,
    cap: "Cap. 11",
    conteudo: {
      blocos: [
        {
          tipo: "texto",
          texto:
            "A maior parte dos planos morre na gaveta. Não por serem ruins: por não terem a primeira coisa a fazer numa segunda-feira.",
        },
        {
          tipo: "destaque",
          titulo: "Um passo, com data",
          texto:
            "Plano sem data é intenção. Escolha uma coisa só, defina o dia, e trate como compromisso com cliente — porque é.",
        },
        {
          tipo: "lista",
          titulo: "O que faz um plano acontecer",
          itens: [
            "Uma única frente por vez, não cinco simultâneas",
            "Uma data concreta para o primeiro passo",
            "Um jeito de saber se deu certo — número ou sensação, mas escrito",
            "Uma data para revisar, daqui a 30 dias",
            "O que você faz se não der certo",
          ],
        },
        {
          tipo: "texto",
          texto:
            "Repare que quatro dos cinco itens não falam do que fazer, e sim de como acompanhar. Planos falham na segunda semana, quando a novidade passa e ninguém está olhando.",
        },
        {
          tipo: "destaque",
          titulo: "A revisão de 30 dias",
          texto:
            "Marque hoje. O que funcionou continua, o que não funcionou sai, e uma tarefa nova entra. Em três revisões você terá mudado mais do que qualquer plano anual prometeria.",
        },
        {
          tipo: "atencao",
          titulo: "Não delegue o que você não sabe fazer",
          texto:
            "Antes de automatizar ou entregar a um agente, faça na mão pelo menos uma vez. Quem não conhece o processo não percebe quando ele sai errado.",
        },
      ],
    },
  },
  {
    modulo: "Minha Empresa Aumentada por IA",
    titulo: "Laboratório: seu primeiro passo, com data",
    tipo: TipoLicao.LABORATORIO,
    xp: 35,
    tempo: 20,
    cap: "Cap. 11",
    conteudo: {
      titulo: "O que você faz na segunda-feira",
      contexto:
        "O plano já está escrito. Agora falta a parte que decide se ele acontece: o primeiro passo, com data e com jeito de conferir.",
      passos: [
        "Olhe o seu plano e escolha UMA frente para começar.",
        "Escreva o primeiro passo como uma tarefa de 30 minutos, não como projeto.",
        "Ponha uma data — dia e hora.",
        "Escreva como você vai saber que deu certo.",
        "Marque a revisão de 30 dias na agenda, agora.",
      ],
      campos: [
        {
          chave: "passo",
          rotulo: "O primeiro passo, em uma frase",
          curto: true,
          exemplo: "Montar o FAQ com as 10 dúvidas mais comuns",
        },
        { chave: "quando", rotulo: "Dia e hora", curto: true, exemplo: "Segunda, 9h" },
        {
          chave: "sucesso",
          rotulo: "Como você vai saber que deu certo",
          exemplo: "Respondi 5 clientes usando o FAQ, sem reescrever do zero",
        },
        { chave: "revisao", rotulo: "Data da revisão de 30 dias", curto: true },
      ],
      criterios: [
        "É uma tarefa de 30 minutos, não um projeto",
        "Tem dia e hora",
        "Tem um jeito de conferir se funcionou",
        "A revisão está marcada na agenda",
      ],
      entrega: "Um compromisso com data, que é o que separa plano de intenção.",
    },
  },

  /* ============================================================
     Reforço em módulos que pediam mais prática
     ============================================================ */
  {
    modulo: "Automação sem programar",
    titulo: "Antes e depois: o orçamento que se repete",
    tipo: TipoLicao.ANTES_DEPOIS,
    xp: 20,
    tempo: 8,
    cap: "Cap. 9.2",
    conteudo: {
      tarefa: "Responder pedidos de orçamento que chegam pelo site",
      antes: {
        titulo: "Como é hoje",
        tempo: "Cerca de 25 minutos por pedido",
        passos: [
          "O e-mail chega e fica na caixa entre outros",
          "Você copia os dados para a planilha na mão",
          "Escreve o orçamento do zero, de novo",
          "Às vezes esquece de responder algum",
        ],
      },
      depois: {
        titulo: "Com automação",
        tempo: "Cerca de 7 minutos por pedido",
        passos: [
          "O formulário registra sozinho na planilha, com data",
          "O rascunho da resposta é gerado com os dados do pedido",
          "Você confere, ajusta o valor e envia",
          "Nada se perde: o que não foi respondido fica visível na lista",
        ],
      },
      economia: "18 minutos por pedido — e nenhum pedido perdido, que vale mais que o tempo",
      prompt: {
        titulo: "O prompt do desenho",
        corpo:
          "Contexto: no meu [NEGOCIO], quando chega um pedido de orçamento por [CANAL], hoje eu faço: [PASSOS_MANUAIS].\nObjetivo: desenhar como isso poderia funcionar sozinho.\nFormato: gatilho, passos em ordem, dados que circulam, onde uma pessoa aprova, o que fazer em caso de erro e como desligar.\nRestrições: a automação gera rascunho e nunca envia sozinha nada que chegue ao cliente. Liste o que NÃO deve ser automatizado neste processo.",
        variaveis: [
          { chave: "NEGOCIO", rotulo: "Seu negócio", exemplo: "marcenaria" },
          { chave: "CANAL", rotulo: "Por onde chega", exemplo: "formulário do site" },
          { chave: "PASSOS_MANUAIS", rotulo: "O que você faz hoje", exemplo: "copio para planilha e respondo" },
        ],
      },
      resultadoEsperado:
        "Um desenho com a parada humana marcada antes do envio — o valor do orçamento é decisão sua.",
      atencao:
        "Repare onde a automação para: ela prepara o orçamento, não define o preço. Preço depende de deslocamento, material e agenda, que ela não conhece.",
    },
  },
  {
    modulo: "Agentes sem complicação",
    titulo: "Caso: o agente que prometeu o que a empresa não cumpria",
    tipo: TipoLicao.CASO,
    xp: 25,
    tempo: 12,
    cap: "Cap. 10.2",
    conteudo: {
      titulo: "O agente que prometeu o que a empresa não cumpria",
      cena:
        "Uma loja de móveis colocou um assistente digital para responder dúvidas iniciais no WhatsApp. Funcionou bem por três semanas. Até que um cliente insistiu em desconto, e o assistente — treinado para ser prestativo — ofereceu 10% para fechar naquele dia. O cliente printou, foi até a loja e cobrou. A loja honrou, para não brigar. Na semana seguinte, três clientes chegaram com o mesmo print.",
      pergunta:
        "O que faltou nas instruções? E por que o problema só apareceu na terceira semana?",
      pistas: [
        "Repare que ele fez o que foi pedido: ser prestativo",
        "Pense no que não estava escrito, em vez do que estava",
        "Pergunte por que ninguém testou pedindo desconto",
      ],
      fechamento:
        "Faltou a lista do que ele NUNCA pode fazer. 'Seja prestativo' sem limite explícito vira concessão quando o cliente insiste — e insistir é o que cliente faz. O problema demorou porque ninguém testou com as perguntas difíceis; testou-se só com as fáceis, que qualquer agente acerta.",
    },
  },
  {
    modulo: "Agentes sem complicação",
    titulo: "No celular: escreva as regras do seu agente",
    tipo: TipoLicao.NO_CELULAR,
    xp: 20,
    tempo: 12,
    cap: "Cap. 10.2",
    conteudo: {
      titulo: "Doze minutos e a lista que protege o seu negócio",
      tempo: "12 minutos",
      passos: [
        "Pense numa dúvida que sua equipe responde toda semana.",
        "Escreva primeiro o que o assistente NUNCA pode fazer — preço, desconto, prazo, exceção.",
        "Só depois escreva o que ele pode responder.",
        "Escreva o que ele diz quando não souber: 'vou confirmar e te retorno'.",
        "Teste você mesmo pedindo desconto três vezes seguidas. Ele cedeu?",
      ],
      porque:
        "Começar pelas proibições inverte a ordem natural e é o que evita o agente que promete. E testar pedindo desconto é o teste que revela quase todo problema de instrução frouxa.",
    },
  },
  {
    modulo: "Qual IA usar para cada coisa",
    titulo: "Caso: a empresa que trocou de ferramenta cinco vezes",
    tipo: TipoLicao.CASO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 12.2",
    conteudo: {
      titulo: "A empresa que trocou de ferramenta cinco vezes",
      cena:
        "Uma agência pequena começou com uma IA, achou fraca e trocou. Trocou de novo no mês seguinte, depois de ver um vídeo dizendo que outra era melhor. Em seis meses, passou por cinco ferramentas e três assinaturas. A equipe nunca chegou a usar nenhuma com fluidez — a cada troca, voltava a escrever pedidos de duas linhas.",
      pergunta:
        "O que essa empresa estava tentando resolver trocando de ferramenta? E o que ela precisaria ter feito?",
      pistas: [
        "Repare que a insatisfação era sempre com o resultado, nunca com o pedido",
        "Pense no que se aprende nas primeiras duas semanas de uso",
        "Pergunte quanto custaram as três assinaturas simultâneas",
      ],
      fechamento:
        "Ela estava tentando resolver com ferramenta um problema de pedido. Resposta genérica vem de pedido genérico, em qualquer uma delas. Duas semanas na mesma ferramenta, melhorando o pedido, teriam resolvido o que cinco trocas não resolveram — e sem três assinaturas.",
    },
  },
  {
    modulo: "Qual IA usar para cada coisa",
    titulo: "Checkpoint: escolher com critério",
    tipo: TipoLicao.CHECKPOINT,
    xp: 20,
    tempo: 5,
    cap: "Cap. 12",
    conteudo: {
      titulo: "O que você leva deste módulo",
      itens: [
        "A pergunta é 'qual serve para esta tarefa', não 'qual é a melhor'",
        "A diferença entre elas é menor que a diferença entre pedido vago e pedido com contexto",
        "Use uma por duas semanas antes de testar outra",
        "Teste lado a lado com o SEU pedido, não com comparação de internet",
        "Sua regra de escolha vale mais que qualquer lista pronta",
      ],
      pergunta:
        "Qual é a sua regra, em uma frase? Escreva agora, para não depender de lembrar.",
    },
  },
  {
    modulo: "ChatGPT além da conversa",
    titulo: "Antes e depois: o e-mail difícil que trava o dia",
    tipo: TipoLicao.ANTES_DEPOIS,
    xp: 20,
    tempo: 8,
    cap: "Cap. 4.2",
    conteudo: {
      tarefa: "Escrever um e-mail difícil — cobrança, recusa, reclamação a fornecedor",
      antes: {
        titulo: "Como é hoje",
        tempo: "Uma hora, contando as três tentativas",
        passos: [
          "Abre o e-mail e olha a tela em branco",
          "Escreve, lê, acha agressivo demais, apaga",
          "Reescreve, acha submisso demais, apaga",
          "Deixa para amanhã, e amanhã o problema cresceu",
        ],
      },
      depois: {
        titulo: "Com IA",
        tempo: "12 minutos",
        passos: [
          "Descreve a situação com honestidade, inclusive a parte incômoda",
          "Diz o tom que quer e o que não pode dizer",
          "Recebe três versões com temperaturas diferentes",
          "Escolhe uma, ajusta o que não soa seu, e envia hoje",
        ],
      },
      economia: "45 minutos — e o e-mail sai no mesmo dia, que é o que resolve",
      prompt: {
        titulo: "O prompt do e-mail difícil",
        corpo:
          "Contexto: preciso escrever para [DESTINATARIO] sobre [ASSUNTO]. A situação real é: [SITUACAO]. O que eu quero que aconteça depois: [OBJETIVO].\nObjetivo: um e-mail que resolva sem queimar a relação.\nFormato: três versões — uma mais direta, uma intermediária e uma mais diplomática. Assunto, corpo de até 4 parágrafos curtos e um próximo passo claro.\nRestrições: nada de passivo-agressivo; não ameace; não peça desculpa por algo que não é meu erro; não use 'venho por meio desta'.",
        variaveis: [
          { chave: "DESTINATARIO", rotulo: "Para quem", exemplo: "fornecedor" },
          { chave: "ASSUNTO", rotulo: "Assunto", exemplo: "terceiro atraso seguido" },
          { chave: "SITUACAO", rotulo: "A situação real", exemplo: "já avisei duas vezes, não quero trocar ainda" },
          { chave: "OBJETIVO", rotulo: "O que você quer", exemplo: "compromisso de data por escrito" },
        ],
      },
      resultadoEsperado:
        "Três temperaturas do mesmo e-mail — e escolher entre versões é muito mais rápido que escrever do zero.",
      atencao:
        "Descreva a situação com honestidade, inclusive o que te incomoda. A IA escreve melhor quando sabe o que está em jogo; omitir a parte difícil produz texto morno.",
    },
  },
  {
    modulo: "Perguntar aos próprios números",
    titulo: "Duelo: a pergunta que não muda nada × a que muda",
    tipo: TipoLicao.DUELO,
    xp: 25,
    tempo: 10,
    cap: "Cap. 9.1",
    conteudo: {
      situacao:
        "Um dono de restaurante exportou as vendas do semestre e quer entender o negócio.",
      ruim: {
        titulo: "Pergunta que não muda nada",
        prompt: "Analise minhas vendas e me diga como foi o semestre.",
        resultado:
          "Total faturado, prato mais vendido e média por mês. Tudo que ele já sabia de cabeça, agora em forma de relatório. Nenhuma decisão saiu disso.",
      },
      bom: {
        titulo: "Pergunta que muda uma decisão",
        prompt:
          "Contexto: tenho as vendas de 6 meses do meu restaurante, com data, prato e valor. Sem identificação de cliente.\nObjetivo: decidir quais pratos tirar do cardápio na próxima revisão.\nFormato: pratos ordenados por frequência de pedido, marcando os que caíram nos últimos 2 meses e os que quase não saem. Para cada um, o que eu precisaria checar antes de tirar.\nRestrições: use somente os dados colados; não estime custo nem margem, que não estão aí; separe o que os dados mostram do que é suposição.",
        resultado:
          "Uma lista de candidatos a sair, com o que conferir antes de cada um — que vira a pauta da revisão do cardápio na semana seguinte.",
      },
      pergunta:
        "Escreva uma pergunta sobre os seus dados que passe no teste: se a resposta vier, o que eu faço diferente?",
      fechamento:
        "As duas usam os mesmos dados. A diferença é que a segunda começou por uma decisão pendente, e não por curiosidade.",
    },
  },
];
