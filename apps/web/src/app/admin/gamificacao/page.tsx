import { TituloPagina, Secao } from "@/components/pagina-admin";
import { dadosGamificacaoAdmin, salvarMissao, alternarMissao, salvarXpLicao, salvarConquista } from "@/server/missoes";

export const dynamic = "force-dynamic";

export default async function GamificacaoAdmin() {
  const { missoes, conquistas, licoes } = await dadosGamificacaoAdmin();
  return (
    <div>
      <TituloPagina titulo="Gamificação" descricao="Missões, recompensas e XP ligados ao progresso real do curso." />

      <Secao titulo="Nova missão" descricao="O progresso é calculado pelos registros do aluno; não pode ser preenchido manualmente.">
        <form action={salvarMissao} className="grid gap-3 md:grid-cols-2">
          <input name="titulo" className="campo" placeholder="Título" required />
          <input name="descricao" className="campo" placeholder="Descrição curta" required />
          <select name="tipo" className="campo"><option value="DIARIA">Diária</option><option value="SEMANAL">Semanal</option><option value="ESPECIAL">Especial</option></select>
          <select name="criterio" className="campo"><option value="licoes">Lições concluídas</option><option value="prompts">Prompts praticados</option><option value="sequencia">Dias de sequência</option><option value="tipos_atividade">Tipos diferentes explorados</option></select>
          <input name="alvo" type="number" min="1" defaultValue="1" className="campo" aria-label="Meta numérica" />
          <input name="recompensaTitulo" className="campo" placeholder="Título/recompensa visual" />
          <input name="icone" className="campo" defaultValue="metas" placeholder="Nome do ícone 3D" />
          <select name="lessonId" className="campo"><option value="">Sem atividade específica</option>{licoes.map((l) => <option key={l.id} value={l.id}>{l.module.titulo} · {l.titulo}</option>)}</select>
          <input name="iniciaEm" type="datetime-local" className="campo" aria-label="Início opcional" />
          <input name="terminaEm" type="datetime-local" className="campo" aria-label="Término opcional" />
          <label className="flex items-center gap-2"><input type="checkbox" name="ativo" defaultChecked /> Ativa</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="oculto" /> Descoberta oculta</label>
          <button className="btn-primario md:col-span-2">Criar missão</button>
        </form>
      </Secao>

      <Secao titulo="Missões cadastradas">
        <div className="space-y-3">
          {missoes.map((m) => (
            <div key={m.id} className="rounded-xl border border-borda p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="font-titulo font-bold">{m.titulo}</p><p className="text-sm text-tinta-clara">{m.tipo} · {m.criterio}: {m.alvo} · {m.recompensaTitulo || "sem título"}</p></div>
                <form action={alternarMissao}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="ativa" value={String(!m.ativo)} /><button className={m.ativo ? "btn-secundario" : "btn-primario"}>{m.ativo ? "Pausar" : "Ativar"}</button></form>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-bold text-indigo">Editar missão</summary>
                <form action={salvarMissao} className="mt-3 grid gap-2 md:grid-cols-2">
                  <input type="hidden" name="id" value={m.id} />
                  <input name="titulo" defaultValue={m.titulo} className="campo" required />
                  <input name="descricao" defaultValue={m.descricao} className="campo" required />
                  <select name="tipo" defaultValue={m.tipo} className="campo"><option value="DIARIA">Diária</option><option value="SEMANAL">Semanal</option><option value="ESPECIAL">Especial</option></select>
                  <select name="criterio" defaultValue={m.criterio} className="campo"><option value="licoes">Lições concluídas</option><option value="prompts">Prompts praticados</option><option value="sequencia">Dias de sequência</option><option value="tipos_atividade">Tipos diferentes</option></select>
                  <input name="alvo" type="number" min="1" defaultValue={m.alvo} className="campo" />
                  <input name="recompensaTitulo" defaultValue={m.recompensaTitulo ?? ""} className="campo" placeholder="Título/recompensa" />
                  <input name="icone" defaultValue={m.icone} className="campo" />
                  <select name="lessonId" defaultValue={m.lessonId ?? ""} className="campo"><option value="">Sem atividade específica</option>{licoes.map((l) => <option key={l.id} value={l.id}>{l.module.titulo} · {l.titulo}</option>)}</select>
                  <input name="iniciaEm" type="datetime-local" defaultValue={m.iniciaEm ? m.iniciaEm.toISOString().slice(0, 16) : ""} className="campo" aria-label="Início opcional" />
                  <input name="terminaEm" type="datetime-local" defaultValue={m.terminaEm ? m.terminaEm.toISOString().slice(0, 16) : ""} className="campo" aria-label="Término opcional" />
                  <label className="flex items-center gap-2"><input type="checkbox" name="ativo" defaultChecked={m.ativo} /> Ativa</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="oculto" defaultChecked={m.oculto} /> Descoberta oculta</label>
                  <button className="btn-secundario md:col-span-2">Salvar alterações</button>
                </form>
              </details>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Conquistas e recompensas">
        <form action={salvarConquista} className="mb-5 grid gap-2 rounded-xl border-2 border-dashed border-indigo-line p-4 md:grid-cols-2">
          <input name="titulo" className="campo" placeholder="Nova conquista" required />
          <input name="descricao" className="campo" placeholder="Como ela é conquistada" required />
          <select name="criterioTipo" className="campo"><option value="licoes">Lições concluídas</option><option value="prompts">Prompts praticados</option><option value="ofensiva">Dias de sequência</option><option value="modulo">Módulos concluídos</option><option value="curso">Percentual da trilha</option></select>
          <input name="criterioValor" type="number" min="1" defaultValue="1" className="campo" aria-label="Meta para desbloquear" />
          <input name="icone" defaultValue="🏅" className="campo" aria-label="Ícone" />
          <input name="recompensaTitulo" className="campo" placeholder="Título/recompensa recebida" />
          <label className="flex items-center gap-2"><input type="checkbox" name="oculto" /> Oculta até desbloquear</label>
          <button className="btn-primario">Criar conquista</button>
        </form>
        <div className="grid gap-3 lg:grid-cols-2">
          {conquistas.map((c) => {
            const criterio = c.criterio as { tipo?: string; valor?: number };
            return (
            <form key={c.id} action={salvarConquista} className="rounded-xl border border-borda p-4">
              <input type="hidden" name="id" value={c.id} />
              <div className="grid gap-2"><input name="titulo" defaultValue={c.titulo} className="campo" /><textarea name="descricao" defaultValue={c.descricao} className="campo" /><div className="grid grid-cols-2 gap-2"><select name="criterioTipo" defaultValue={criterio.tipo ?? "licoes"} className="campo"><option value="licoes">Lições</option><option value="prompts">Prompts</option><option value="ofensiva">Sequência</option><option value="modulo">Módulos</option><option value="curso">Trilha (%)</option></select><input name="criterioValor" type="number" min="1" defaultValue={criterio.valor ?? 1} className="campo" /></div><div className="grid grid-cols-2 gap-2"><input name="icone" defaultValue={c.icone} className="campo" /><input name="recompensaTitulo" defaultValue={c.recompensaTitulo ?? ""} className="campo" placeholder="Título recebido" /></div><label className="flex items-center gap-2"><input type="checkbox" name="oculto" defaultChecked={c.oculto} /> Oculta até desbloquear</label><button className="btn-secundario">Salvar conquista</button></div>
            </form>
          );})}
        </div>
      </Secao>

      <Secao titulo="XP por atividade" descricao="Alterar afeta novas conclusões; XP já recebido permanece preservado.">
        <div className="space-y-2">
          {licoes.map((l) => <form key={l.id} action={salvarXpLicao} className="flex items-center gap-3 rounded-lg border border-borda p-3"><input type="hidden" name="id" value={l.id} /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{l.titulo}</p><p className="text-xs text-cinza">{l.module.titulo} · {l.tipo}</p></div><input name="xp" type="number" min="0" max="500" defaultValue={l.xpRecompensa} className="campo w-24" aria-label={`XP de ${l.titulo}`} /><button className="btn-secundario">Salvar</button></form>)}
        </div>
      </Secao>
    </div>
  );
}
