import Link from "next/link";
import { Logo } from "@/components/logo";
import { IconeApp } from "@/components/icone-app";

export default function Offline() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-grad-capa px-5 text-center">
      <Logo href={null} largura={160} />
      <div className="mt-8"><IconeApp nome="seguranca" tamanho={72} /></div>
      <h1 className="mt-4 font-titulo text-2xl font-extrabold">Você está sem conexão</h1>
      <p className="mt-3 max-w-md text-tinta-clara">
        As lições que você já abriu continuam disponíveis. Para praticar com a
        IA, você precisa de internet — ela abre em outro site.
      </p>
      <Link href="/app" className="btn-primario mt-8">Tentar novamente</Link>
    </main>
  );
}
