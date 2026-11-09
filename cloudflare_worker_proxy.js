// ══════════════════════════════════════════════════════════════════════════
// PEI TRADING DESK — Proxy CORS (Cloudflare Worker) — v2 (9/11/2026)
// ══════════════════════════════════════════════════════════════════════════
// Qué resuelve: Yahoo Finance (query1.finance.yahoo.com) no manda cabeceras
// CORS, así que el navegador bloquea el fetch directo desde
// pedritozar.github.io. Es el mismo tipo de bug que tuvo el forex con
// Frankfurter (resuelto el 28/08 cambiando de API) — acá no hay API
// alternativa con el mismo dato (HSTECH/MOEX/CSI300), así que en vez de
// perseguir otra API que algún día vuelva a bloquear CORS, este Worker hace
// el fetch del lado del servidor (Cloudflare, no el navegador) y le agrega
// las cabeceras CORS a la respuesta antes de devolverla.
//
// Por seguridad, es un allowlist cerrado de hosts, NO un proxy abierto a
// cualquier URL — así no se puede usar para pegarle a otra cosa random y
// generar tráfico/abuso a tu nombre.
//
// ── CÓMO DEPLOYARLO (5 minutos, sin instalar nada) ──
// 1. Andá a https://dash.cloudflare.com → creá una cuenta gratis si no
//    tenés una (el plan Free alcanza de sobra para esto).
// 2. En el menú izquierdo: Workers & Pages → Create → Create Worker.
// 3. Ponele un nombre (ej. "pei-cors-proxy") → Deploy (te crea uno vacío).
// 4. Click en "Edit code" → borrá todo el contenido de ejemplo → pegá TODO
//    este archivo → Deploy (arriba a la derecha, botón azul).
// 5. Cloudflare te da una URL tipo:
//    https://pei-cors-proxy.TU-USUARIO.workers.dev
//    Copiá esa URL completa.
// 6. En el Trading Desk, pestaña "⚙ Config" → pegala en "Proxy CORS
//    (Cloudflare Worker)" → Guardar. Listo, sin recargar ni redeployar nada
//    más — el próximo fetch de Índices ya lo usa.
//
// No hace falta wrangler ni terminal — todo se hace desde el dashboard web.
// ══════════════════════════════════════════════════════════════════════════
// ── CAMBIOS DE LA v2 (9/11/2026) — mismo formato de pedido: /?url=<URL codificada> ──
// • Caché real en el borde de Cloudflare (120 s, solo respuestas 200): varias pestañas/recargas
//   comparten una sola consulta a Yahoo. Antes el "Cache-Control" solo servía al navegador.
//   Yahoo responde 429 (Too Many Requests) cada vez más seguido, y menos consultas = menos 429.
// • Si Yahoo contesta 429, error 5xx o no responde, reintenta UNA vez con el otro host
//   (query1 <-> query2) antes de devolver el error.
// • Solo deja pasar la ruta /v8/finance/chart/ (la única que usa el dashboard) y solo GET/OPTIONS.
// • Los errores no se cachean (Cache-Control: no-store).
// ── CÓMO ACTUALIZAR EL WORKER YA DEPLOYADO (3 minutos) ──
// dash.cloudflare.com → Workers & Pages → "pei-cors-proxy" → Edit code → borrar todo →
// pegar TODO este archivo → Deploy. La URL no cambia: no hay que tocar nada en ⚙ Config.
// Para volver atrás: pegar el archivo anterior (git: cloudflare_worker_proxy.js del commit previo).
// ══════════════════════════════════════════════════════════════════════════

// Hosts y ruta permitidos. Agregar acá si en el futuro aparece otro caso de CORS
// bloqueado (mismo patrón: agregar el host/ruta, no abrir el proxy entero).
const ALLOWED_HOSTS = [
  'query1.finance.yahoo.com',
  'query2.finance.yahoo.com',
];
const ALLOWED_PATH_PREFIX = '/v8/finance/chart/';
const CACHE_SECONDS = 120;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

export default {
  async fetch(request) {
    // Preflight CORS (el navegador lo manda antes del fetch real en algunos casos)
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return jsonError('Método no permitido', 405);
    }

    const reqUrl = new URL(request.url);
    const target = reqUrl.searchParams.get('url');
    if (!target) {
      return jsonError('Falta el parámetro ?url=', 400);
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch (e) {
      return jsonError('URL inválida', 400);
    }

    if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
      return jsonError(`Host no permitido: ${targetUrl.hostname}`, 403);
    }
    if (!targetUrl.pathname.startsWith(ALLOWED_PATH_PREFIX)) {
      return jsonError('Ruta no permitida', 403);
    }

    // Primero el host pedido; si falla (429/5xx/red), una vez con el otro.
    const otro = ALLOWED_HOSTS.find(h => h !== targetUrl.hostname);
    const intentos = [targetUrl.hostname, otro];
    let ultima = null;

    for (const host of intentos) {
      const u = new URL(targetUrl.toString());
      u.hostname = host;
      try {
        const upstream = await fetch(u.toString(), {
          headers: { 'User-Agent': UA, 'Accept': 'application/json,text/plain,*/*', 'Accept-Language': 'en-US,en;q=0.9' },
          // Caché en el borde de Cloudflare solo para respuestas buenas; los errores no se guardan.
          cf: { cacheTtlByStatus: { '200-299': CACHE_SECONDS, '300-599': 0 }, cacheEverything: true },
        });
        const body = await upstream.text();
        ultima = { status: upstream.status, body, ct: upstream.headers.get('Content-Type'), host };
        if (upstream.status === 429 || upstream.status >= 500) continue; // probar con el otro host
        break;
      } catch (e) {
        ultima = { error: e.message, host };
      }
    }

    if (!ultima || ultima.error) {
      return jsonError('Error consultando el upstream: ' + (ultima ? ultima.error : 'sin respuesta'), 502);
    }
    const ok = ultima.status >= 200 && ultima.status < 300;
    return new Response(ultima.body, {
      status: ultima.status,
      headers: {
        ...corsHeaders(),
        'Content-Type': ultima.ct || 'application/json',
        'Cache-Control': ok ? 'public, max-age=60' : 'no-store',
        'X-Proxy-Upstream': ultima.host,
      },
    });
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Expose-Headers': 'X-Proxy-Upstream',
  };
}

function jsonError(msg, status) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
