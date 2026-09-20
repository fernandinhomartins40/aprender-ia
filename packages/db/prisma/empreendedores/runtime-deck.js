
const slides = Array.from(document.querySelectorAll('.slide'));
let cur = 0;
function escalar(){
  const d = document.getElementById('deck');
  const s = Math.min(window.innerWidth/1280, (window.innerHeight-62)/720);
  d.style.transform = 'scale(' + s + ')';
}
window.addEventListener('resize', escalar); escalar();

/* ---- cronômetros das atividades ----
   Cada .sl-crono ganha Iniciar / Pausar / Zerar. O tempo inicial é o que
   já estava escrito no slide (ex.: "5:00"), então mudar a duração é mudar
   o HTML — o script não guarda durações próprias. */
const cronos = [];
document.querySelectorAll('.sl-crono').forEach(sl => {
  const num = sl.querySelector('.num');
  if (!num) return;
  const m = (num.textContent || '').trim().match(/^(\d+):(\d{2})$/);
  if (!m) return;                       // slide sem tempo no formato m:ss
  const total = (+m[1]) * 60 + (+m[2]);

  const btns = document.createElement('div');
  btns.className = 'crono-btns';
  const bIni = document.createElement('button'); bIni.textContent = '▶ Iniciar';
  const bZer = document.createElement('button'); bZer.textContent = '↺ Zerar';
  bZer.className = 'sec';
  btns.append(bIni, bZer);
  const dica = document.createElement('div');
  dica.className = 'crono-dica';
  dica.textContent = 'Barra de espaço inicia e pausa · Z zera';
  // depois do tempo e do título, antes do enunciado
  const alvo = sl.querySelector('h2') || num;
  alvo.after(btns, dica);

  const c = { sl, num, total, resta: total, id: null, rodando: false };

  function pinta(){
    const mm = Math.floor(c.resta / 60), ss = c.resta % 60;
    c.num.textContent = mm + ':' + String(ss).padStart(2, '0');
    c.num.classList.toggle('acabou', c.resta === 0);
  }
  function parar(){
    clearInterval(c.id); c.id = null; c.rodando = false; bIni.textContent = '▶ Iniciar';
  }
  c.zerar = function(){
    parar(); c.resta = c.total; c.sl.classList.remove('tocando'); pinta();
  };
  c.alternar = function(){
    if (c.rodando) { parar(); bIni.textContent = '▶ Continuar'; return; }
    if (c.resta === 0) c.zerar();
    c.rodando = true; bIni.textContent = '⏸ Pausar';
    c.sl.classList.remove('tocando');
    c.id = setInterval(() => {
      c.resta--; pinta();
      if (c.resta <= 0) { parar(); c.sl.classList.add('tocando'); }
    }, 1000);
  };

  bIni.onclick = c.alternar;
  bZer.onclick = c.zerar;
  cronos.push(c);
});
// o cronômetro do slide atual, se houver
const cronoAtivo = () => cronos.find(c => c.sl.closest('.slide') === slides[cur]);

/* ---- modal dos prompts ----
   Os textos vêm da apostila, embutidos na montagem. Abrir um card copia
   o prompt e oferece as quatro IAs: o apresentador clica, cola e mostra
   a resposta ao vivo. */

/* A lista é trocada pelo gerador, que a monta a partir das ferramentas
   do curso no banco. O valor abaixo é só o que vale se alguém abrir
   este arquivo solto, fora do deck. */
const LISTA_IAS = [{"id":"chatgpt","nome":"ChatGPT","url":"https://chatgpt.com","q":"q"},{"id":"gemini","nome":"Gemini","url":"https://gemini.google.com"}];
const modal = document.getElementById('prompt-modal');
const pmTitulo = document.getElementById('pm-titulo');
const pmTexto = document.getElementById('pm-texto');
const pmCopiar = document.getElementById('pm-copiar');
const pmIas = document.getElementById('pm-ias');
const pmDica = document.getElementById('pm-dica');

// Os botões do modal são recriados a cada abertura, porque o link de
// quem aceita prompt na URL muda conforme o prompt escolhido.
const botoesIA = LISTA_IAS.map(ia => {
  const a = document.createElement('a');
  a.className = 'ia-btn ' + ia.id;
  a.target = '_blank'; a.rel = 'noopener';
  a.innerHTML = '<span class="pt"></span>' + ia.nome +
    (ia.q ? '<span class="ja">já com o texto</span>' : '');
  a.title = ia.q
    ? 'Abre o ' + ia.nome + ' com o prompt já escrito — é só apertar Enter'
    : 'Abre o ' + ia.nome + '. O prompt já está copiado: cole com Ctrl+V';
  pmIas.appendChild(a);
  return { ia, a };
});
// Atualiza o href de cada botão para o prompt que está aberto.
function apontarBotoes(texto){
  botoesIA.forEach(({ ia, a }) => {
    a.href = ia.q ? ia.url + '/?' + ia.q + '=' + encodeURIComponent(texto) : ia.url;
  });
}

function copiar(txt, btn){
  const feito = () => {
    const antes = btn.textContent;
    btn.textContent = '✓ Copiado!'; btn.classList.add('ok');
    setTimeout(() => { btn.textContent = antes; btn.classList.remove('ok'); }, 1800);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(txt).then(feito).catch(() => fallback(txt, feito));
  } else fallback(txt, feito);
}
// file:// não é contexto seguro em todo navegador — daí o plano B.
function fallback(txt, feito){
  const ta = document.createElement('textarea');
  ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); feito(); } catch(e) {}
  document.body.removeChild(ta);
}

/* ---- prompts preenchíveis ----
   Onde o prompt traz [ALGO], o pedaço vira um campo de digitação no
   próprio texto. O que o formador escreve entra no prompt na hora, e
   os botões passam a levar a versão preenchida. */

// Um placeholder pode atravessar quebra de linha no texto original
// (ex.: "[X" e "semanas]" em linhas distintas); a chave normaliza os
// espaços para agrupar as ocorrências iguais.
const chaveVar = v => v.replace(/\s+/g, ' ').trim();

// Quantos caracteres o campo deve ter, para não estourar o slide.
function larguraVar(v){
  const n = chaveVar(v).length;
  return Math.max(6, Math.min(n + 2, 30));
}

/* Monta o prompt dentro do elemento alvo, com campos no lugar dos [ ].
   Devolve uma função que lê o texto atual, já preenchido. */
function montarPromptEditavel(alvo, texto, aoMudar){
  alvo.textContent = '';
  const campos = new Map();   // chave normalizada -> [inputs]
  const partes = texto.split(/(\[[^\]]*\])/);
  partes.forEach(p => {
    const m = p.match(/^\[([^\]]*)\]$/);
    if (!m) { alvo.appendChild(document.createTextNode(p)); return; }
    const bruto = m[1], chave = chaveVar(bruto);
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'var-campo';
    inp.placeholder = chave;
    inp.size = larguraVar(bruto);
    inp.dataset.chave = chave;
    inp.setAttribute('aria-label', chave);
    if (!campos.has(chave)) campos.set(chave, []);
    campos.get(chave).push(inp);
    // O input vai dentro de um span porque um <input> não aceita
    // ::before/::after — e é por eles que os colchetes voltam na
    // versão impressa, onde o campo em branco não diria nada.
    const env = document.createElement('span');
    env.className = 'var-env';
    env.appendChild(inp);
    alvo.appendChild(env);
  });
  // O mesmo campo aparece várias vezes ([ANO] repetido): digitar em um
  // preenche os outros, senão o formador digitaria a mesma coisa 3x.
  // O campo acompanha o que está sendo digitado: sem isso um texto
  // maior que o nome do placeholder ficaria cortado na tela.
  function ajustarLargura(inp){
    const base = chaveVar(inp.dataset.chave).length;
    const atual = inp.value.length;
    inp.size = Math.max(6, Math.min(Math.max(base, atual) + 2, 46));
  }
  function sincronizar(e){
    const inp = e.target;
    (campos.get(inp.dataset.chave) || []).forEach(o => {
      if (o !== inp) o.value = inp.value;
      o.classList.toggle('preenchido', !!inp.value.trim());
      ajustarLargura(o);
    });
    inp.classList.toggle('preenchido', !!inp.value.trim());
    ajustarLargura(inp);
    if (aoMudar) aoMudar(lerTexto());
  }
  alvo.addEventListener('input', sincronizar);

  function lerTexto(){
    let out = '';
    alvo.childNodes.forEach(n => {
      if (n.nodeType === 3) { out += n.nodeValue; return; }
      const inp = n.tagName === 'INPUT' ? n : n.querySelector && n.querySelector('input');
      // campo vazio volta a ser [PLACEHOLDER]: o prompt continua
      // utilizável mesmo sem preencher tudo
      if (inp) out += inp.value.trim() || '[' + inp.dataset.chave + ']';
    });
    return out;
  }
  return { lerTexto, temCampos: campos.size > 0 };
}

document.querySelectorAll('.prompt-acoes').forEach(cx => {
  const texto = cx.dataset.promptTxt || '';
  if (!texto) return;

  // o .prompt que este bloco de ações acompanha
  const cxPrompt = cx.previousElementSibling;
  let ler = () => texto;
  if (cxPrompt && cxPrompt.classList.contains('prompt') && /\[[^\]]*\]/.test(texto)) {
    const ed = montarPromptEditavel(cxPrompt, texto, () => atualizar());
    ler = ed.lerTexto;
    cx.classList.add('tem-campos');
  }

  const bt = document.createElement('button');
  bt.className = 'copiar-mini';
  bt.textContent = '📋 Copiar';
  bt.onclick = () => copiar(ler(), bt);
  cx.appendChild(bt);

  // A lição diz em `data-ias` quais ferramentas fazem o que o prompt
  // pede. Sem isso, valem as de uso geral: oferecer as oito do curso em
  // todo prompt mandaria o aluno gerar um plano de negócio no Pika, que
  // faz vídeo. Quem escreve texto resolve qualquer prompt do curso.
  const pedidas = (cx.dataset.ias || '').split(',').filter(Boolean);
  const oferecidas = pedidas.length
    ? pedidas.map(id => LISTA_IAS.find(ia => ia.id === id)).filter(Boolean)
    : LISTA_IAS.filter(ia => ia.geral);

  const links = oferecidas.map(ia => {
    const a = document.createElement('a');
    a.className = 'ia-btn mini ' + ia.id;
    a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = '<span class="pt"></span>' + ia.nome;
    a.title = ia.q
      ? 'Abre o ' + ia.nome + ' com este prompt já escrito'
      : 'Abre o ' + ia.nome + ' — copie antes com o botão ao lado';
    cx.appendChild(a);
    return { ia, a };
  });

  function atualizar(){
    const t = ler();
    links.forEach(({ ia, a }) => {
      a.href = ia.q ? ia.url + '/?' + ia.q + '=' + encodeURIComponent(t) : ia.url;
    });
  }
  atualizar();
});

function abrirModal(i){
  const p = PROMPTS[i];
  if (!p) return;
  pmTitulo.textContent = p.titulo;
  // o prompt vira editável quando tem [ ]; os botões seguem o que for digitado
  const ed = montarPromptEditavel(pmTexto, p.texto, t => {
    apontarBotoes(t);
    pmCopiar.onclick = () => copiar(t, pmCopiar);
  });
  const ler = ed.lerTexto;
  pmDica.style.display = ed.temCampos ? '' : 'none';
  pmCopiar.onclick = () => copiar(ler(), pmCopiar);
  apontarBotoes(ler());
  modal.classList.add('aberto');
  copiar(ler(), pmCopiar);   // já copia ao abrir: um clique a menos em sala
  // foca o primeiro campo, para já sair digitando
  const primeiro = pmTexto.querySelector('.var-campo');
  if (primeiro) setTimeout(() => primeiro.focus(), 60);
}
function fecharModal(){ modal.classList.remove('aberto'); }

document.addEventListener('click', e => {
  const card = e.target.closest('.card.abrivel');
  if (card) { abrirModal(+card.dataset.prompt); return; }
  // checklist: marcar e desmarcar, só efeito visual
  const item = e.target.closest('.sl-saida .it.marcavel, .chk');
  if (item) { item.classList.toggle('feito'); return; }
  if (e.target === modal) fecharModal();       // clique fora fecha
});
document.getElementById('pm-fechar').onclick = fecharModal;
const modalAberto = () => modal.classList.contains('aberto');

function ir(n){
  cur = Math.max(0, Math.min(slides.length-1, n));
  // sair de um slide de atividade zera o relógio dele
  cronos.forEach(c => { if (c.sl.closest('.slide') !== slides[cur]) c.zerar(); });
  // e desmarca o checklist, para a próxima turma começar limpo
  slides.forEach((s,i) => { if (i !== cur)
    s.querySelectorAll('.feito').forEach(it => it.classList.remove('feito')); });
  slides.forEach((s,i)=>s.classList.toggle('active', i===cur));
  document.getElementById('counter').textContent = (cur+1)+' / '+slides.length;
  document.getElementById('bar').style.width = ((cur+1)/slides.length*100)+'%';
  document.querySelectorAll('.thumb').forEach((t,i)=>t.classList.toggle('current', i===cur));
}
document.getElementById('next').onclick=()=>ir(cur+1);
document.getElementById('prev').onclick=()=>ir(cur-1);
document.getElementById('first').onclick=()=>ir(0);
document.getElementById('last').onclick=()=>ir(slides.length-1);
document.getElementById('full').onclick=()=>{
  if(!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
};
const overlay=document.getElementById('thumb-overlay'), grid=document.getElementById('thumb-grid');
slides.forEach((s,i)=>{
  const t=document.createElement('div'); t.className='thumb';
  t.innerHTML='<div class="thumb-num">'+(i+1)+'</div><div class="thumb-title">'+(s.dataset.title||'')+'</div>';
  t.onclick=()=>{ir(i); overlay.style.display='none';}; grid.appendChild(t);
});
document.getElementById('grid').onclick=()=>{overlay.style.display=overlay.style.display==='block'?'none':'block';};
document.getElementById('thumb-close').onclick=()=>overlay.style.display='none';
document.addEventListener('keydown', e=>{
  // Digitando num campo do prompt, o teclado é dele: sem isso a seta
  // trocaria de slide e o espaço avançaria a apresentação no meio de
  // uma palavra. Esc devolve o foco à navegação.
  if(e.target.classList && e.target.classList.contains('var-campo')){
    if(e.key==='Escape'){ e.target.blur(); e.preventDefault(); }
    return;
  }
  // com o prompt aberto, o teclado pertence ao modal
  if(modalAberto()){
    if(e.key==='Escape'){e.preventDefault();fecharModal();}
    return;
  }
  // num slide de cronômetro a barra controla o relógio, não a navegação:
  // é a tecla que a mão do apresentador já procura. Seta direita avança.
  const cr = cronoAtivo();
  if(cr && e.key===' '){e.preventDefault();cr.alternar();return;}
  if(cr && (e.key==='z'||e.key==='Z')){e.preventDefault();cr.zerar();return;}
  if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){e.preventDefault();ir(cur+1);}
  else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();ir(cur-1);}
  else if(e.key==='Home')ir(0); else if(e.key==='End')ir(slides.length-1);
  else if(e.key==='g'||e.key==='G')document.getElementById('grid').click();
  else if(e.key==='f'||e.key==='F')document.getElementById('full').click();
  else if(e.key==='Escape')overlay.style.display='none';
});
/* A barra de controles fica discreta para não cobrir o rodapé dos
   slides cheios, e reaparece a cada navegação ou movimento do mouse. */
const barraCtrl = document.querySelector('.controls');
let sumirCtrl;
function piscarControles(){
  barraCtrl.classList.add('ativa');
  clearTimeout(sumirCtrl);
  sumirCtrl = setTimeout(() => barraCtrl.classList.remove('ativa'), 2500);
}
document.addEventListener('keydown', piscarControles);
document.addEventListener('mousemove', piscarControles);

ir(0);
piscarControles();
