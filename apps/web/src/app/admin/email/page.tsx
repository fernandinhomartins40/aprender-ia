import {
  lerEstadoChave,
  lerEstadoEnvio,
  lerTemplates,
  lerHistorico,
  salvarChave,
  salvarEnvio,
  salvarTemplates,
  testarEnvio,
  removerChave,
} from "@/server/credenciais-email";
import { exigirAdmin } from "@/server/admin";
import { FormChaveEmail } from "@/components/form-chave-email";

export const dynamic = "force-dynamic";

export default async function Email() {
  const admin = await exigirAdmin();
  const [estado, envio, templates, historico] = await Promise.all([
    lerEstadoChave(),
    lerEstadoEnvio(),
    lerTemplates(),
    lerHistorico(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-titulo text-2xl font-extrabold text-tinta sm:text-3xl">
          E-mail
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-tinta-clara">
          A credencial que envia os e-mails da plataforma — recuperação de
          senha, avisos de acesso e notificações. Quando ela falha, nenhuma
          dessas mensagens sai.
        </p>
      </div>

      <FormChaveEmail
        estadoAtual={estado}
        estadoEnvio={envio}
        templates={templates}
        historico={historico}
        acaoSalvar={salvarChave}
        acaoTestar={testarEnvio}
        acaoRemover={removerChave}
        acaoSalvarEnvio={salvarEnvio}
        acaoSalvarTemplates={salvarTemplates}
        emailDoAdmin={admin.email ?? ""}
      />
    </div>
  );
}
