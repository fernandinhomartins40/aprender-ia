/**
 * Service worker do Aprender IA.
 *
 * Estratégia deliberadamente conservadora:
 *  - assets estáticos: cache primeiro (mudam de hash a cada build)
 *  - navegação: rede primeiro, com página offline de reserva
 *  - nunca cacheamos /api, /admin nem rotas autenticadas — dado de
 *    progresso desatualizado confunde mais do que ajuda
 */
// A versão precisa mudar a CADA build. Com um valor fixo, o `activate`
// nunca encontra cache antigo para apagar e os chunks de /_next/static
// (servidos com cache-first) sobrevivem para sempre no navegador de quem
// já visitou o site — que passa a misturar HTML novo com JavaScript velho
// depois de cada deploy. O deploy reescreve este valor.
const VERSAO = "aprender-ia-v2";
// O manifest saiu daqui: virou rota dinâmica (`/manifest.webmanifest`) e
// não é mais um arquivo. Pré-cacheá-lo pelo nome antigo fazia o `addAll`
// falhar inteiro com 404 — e um `addAll` que rejeita aborta a instalação
// do service worker, derrubando junto o offline e as notificações.
// Também não faz sentido guardá-lo: ele precisa refletir o ícone atual.
const ESSENCIAIS = ["/offline", "/marca/logo-900.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSAO).then((c) => c.addAll(ESSENCIAIS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(chaves.filter((k) => k !== VERSAO).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  if (e.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // Rotas que nunca vêm do cache. `/app` entrou aqui: o comentário no
  // topo sempre disse "nunca cacheamos rotas autenticadas", mas o painel
  // do ALUNO não estava na lista — só o do administrador. Progresso de
  // lição servido do cache mostraria a trilha desatualizada.
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/app")
  ) {
    // Uma exceção: abrir o aplicativo instalado sem rede. O `start_url`
    // fica em `/app/entrar`, e sem tratar a navegação aqui o PWA abria na
    // tela de erro do navegador — o que, dentro de um aplicativo em tela
    // cheia, parece que o aplicativo quebrou. Respondemos a página
    // offline, sem cachear nada de `/app`: a rede continua sendo a única
    // fonte do conteúdo autenticado.
    if (e.request.mode === "navigate") {
      e.respondWith(fetch(e.request).catch(() => caches.match("/offline")));
    }
    return;
  }

  // Nunca interceptamos a autenticação: uma resposta vinda do cache aqui
  // deixa o formulário de login pendurado.
  if (url.pathname.startsWith("/entrar") || url.pathname.startsWith("/cadastro")) return;

  // Os ícones do aplicativo NÃO entram no cache-first.
  //
  // Eles não têm hash no nome: `/icones/icone-192.png` é o mesmo endereço
  // antes e depois de o administrador trocar a arte no painel. Servidos
  // pelo cache, o ícone antigo sobrevivia à troca e voltava a aparecer —
  // era por isso que "arrumava e estragava de novo". Rede primeiro, com o
  // cache só como reserva para quando não há conexão.
  if (url.pathname.startsWith("/icones")) {
    e.respondWith(
      fetch(e.request)
        .then((resp) => {
          const copia = resp.clone();
          caches.open(VERSAO).then((c) => c.put(e.request, copia));
          return resp;
        })
        .catch(() => caches.match(e.request)),
    );
    return;
  }

  // Assets com hash: cache primeiro
  if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/marca")) {
    e.respondWith(
      caches.match(e.request).then(
        (r) =>
          r ||
          fetch(e.request).then((resp) => {
            const copia = resp.clone();
            caches.open(VERSAO).then((c) => c.put(e.request, copia));
            return resp;
          }),
      ),
    );
    return;
  }

  // Navegação: rede primeiro
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match(e.request).then((r) => r || caches.match("/offline")),
      ),
    );
  }
});

/* ============================================================
   NOTIFICAÇÕES PUSH
   ============================================================
   Estes dois ouvintes são o que faz a notificação existir no aparelho.
   Sem eles, o servidor podia mandar quanto quisesse: o Push Service
   entregava ao navegador e a mensagem morria aqui, sem virar aviso na
   tela. O `push` roda mesmo com o aplicativo fechado — é o navegador que
   acorda o service worker.
   ============================================================ */

self.addEventListener("push", (e) => {
  // Um push sem corpo legível ainda precisa virar aviso: melhor um texto
  // genérico do que silêncio, porque no Android um push recebido e não
  // exibido faz o sistema revogar a permissão do site depois de algumas
  // ocorrências.
  let dados = {};
  try {
    dados = e.data ? e.data.json() : {};
  } catch {
    dados = {};
  }

  const titulo = dados.titulo || "Aprender IA";
  const corpo = dados.corpo || "Você tem um aviso novo.";
  const link = dados.link || "/app";

  e.waitUntil((async () => {
    if (dados.silenciosaSeAberto) {
      const abertas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      if (abertas.some((janela) => janela.visibilityState === "visible")) return;
    }
    return self.registration.showNotification(titulo, {
      body: corpo,
      icon: "/icones/icone-192.png",
      badge: "/icones/icone-96.png",
      lang: "pt-BR",
      // A tag agrupa: dois avisos do mesmo assunto não empilham duas
      // notificações iguais na barra.
      tag: dados.assunto || "aprender-ia",
      renotify: true,
      data: { link },
    });
  })());
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const link = (e.notification.data && e.notification.data.link) || "/app";
  let destino = new URL(link, self.location.origin);
  if (destino.origin !== self.location.origin) destino = new URL("/app", self.location.origin);

  // Se o aplicativo já está aberto, focamos a janela existente em vez de
  // abrir outra: duas instâncias do mesmo PWA confundem e perdem estado.
  //
  // O `navigate` fica dentro de try/catch porque não existe em todo
  // navegador (o WindowClient do Safari no iOS não implementa) e uma
  // exceção aqui cancelaria o waitUntil — o toque na notificação não
  // abriria nada. Sem ele, ao menos focamos a janela; e se nem focar der,
  // abrimos uma nova.
  e.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (janelas) => {
        for (const j of janelas) {
          // Compara a origem, não `includes("/app")`: uma URL de outro
          // site que contivesse "/app" casaria por engano.
          if (new URL(j.url).origin !== self.location.origin) continue;
          if (!("focus" in j)) continue;

          try {
            if ("navigate" in j) await j.navigate(destino.href);
          } catch {
            /* navegador sem navigate: seguimos para o focus */
          }
          try {
            return await j.focus();
          } catch {
            break; // não deu para focar: cai no openWindow
          }
        }
        return self.clients.openWindow(destino.href);
      }),
  );
});
