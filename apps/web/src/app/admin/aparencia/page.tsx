import {
  tamanhosIcone,
  lerIconeOrigem,
  lerIconesGerados,
  salvarIconesPwa,
  restaurarIconesPwa,
} from "@/server/icones-pwa";
import { exigirAdmin } from "@/server/admin";
import { EditorIconePwa } from "@/components/editor-icone-pwa";
import { TituloPagina, Secao, Cartao } from "@/components/pagina-admin";

export const dynamic = "force-dynamic";

export default async function Aparencia() {
  await exigirAdmin();

  const [tamanhos, origem, gerados] = await Promise.all([
    tamanhosIcone(),
    lerIconeOrigem(),
    lerIconesGerados(),
  ]);

  return (
    <div>
      <TituloPagina
        titulo="Aparência do aplicativo"
        descricao="O ícone que aparece na tela inicial de quem instala o Aprender IA no celular."
      />

      <Secao>
        <Cartao>
          <EditorIconePwa
            acao={salvarIconesPwa}
            acaoRestaurar={restaurarIconesPwa}
            tamanhos={tamanhos}
            origemSalva={origem}
            geradosSalvos={gerados}
          />
        </Cartao>
      </Secao>

      <Secao titulo="Como funciona">
        <Cartao>
          <ul className="space-y-2.5 text-sm text-tinta-clara">
            <li>
              <strong className="text-tinta">Uma imagem só.</strong> Você envia,
              recorta e o sistema gera os sete tamanhos que Android, iPhone e
              desktop pedem — não é preciso preparar cada um à mão.
            </li>
            <li>
              <strong className="text-tinta">Use uma imagem quadrada e grande</strong>{" "}
              (512 px ou mais). O recorte é sempre proporcional: ícone esticado
              é o defeito mais visível de um aplicativo instalado.
            </li>
            <li>
              <strong className="text-tinta">O círculo tracejado importa.</strong>{" "}
              O Android recorta o ícone num círculo. O que ficar fora dele pode
              ser cortado em alguns aparelhos.
            </li>
            <li>
              <strong className="text-tinta">Quem já instalou</strong> verá o
              ícone novo quando o sistema atualizar o atalho — costuma levar de
              algumas horas a um dia, e não depende da plataforma.
            </li>
          </ul>
        </Cartao>
      </Secao>
    </div>
  );
}
