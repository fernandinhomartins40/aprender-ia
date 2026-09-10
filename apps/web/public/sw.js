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
const ESSENCIAIS = ["/offline", "/manifest.json", "/marca/logo-900.png"];

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
  // Rotas que nunca devem vir do cache
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/admin")) return;

  // Nunca interceptamos a autenticação: uma resposta vinda do cache aqui
  // deixa o formulário de login pendurado.
  if (url.pathname.startsWith("/entrar") || url.pathname.startsWith("/cadastro")) return;

  // Assets com hash: cache primeiro
  if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/marca")
      || url.pathname.startsWith("/icones")) {
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
