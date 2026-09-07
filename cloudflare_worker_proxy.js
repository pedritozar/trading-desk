// ══════════════════════════════════════════════════════════════════════════
// PEI TRADING DESK — Proxy CORS (Cloudflare Worker)
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

// Hosts permitidos. Agregar acá si en el futuro aparece otro caso de CORS
// bloqueado (mismo patrón: agregar el host, no abrir el proxy entero).
const ALLOWED_HOSTS = [
  'query1.finance.yahoo.com',
  'query2.finance.yahoo.com',
];

export default {
  async fetch(request) {
    const reqUrl = new URL(request.url);

    // Preflight CORS (el navegador lo manda antes del fetch real en algunos casos)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

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

    try {
      const upstream = await fetch(targetUrl.toString(), {
        headers: { 'User-Agent': 'Mozilla/5.0 (PEI Trading Desk proxy)' },
      });
      const body = await upstream.text();
      return new Response(body, {
        status: upstream.status,
        headers: {
          ...corsHeaders(),
          'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
          // Cache corto (60s) — Yahoo no necesita más frecuencia que eso acá,
          // y evita pegarle de más si el dashboard queda abierto con varias
          // pestañas o se recarga seguido.
          'Cache-Control': 'public, max-age=60',
        },
      });
    } catch (e) {
      return jsonError('Error consultando el upstream: ' + e.message, 502);
    }
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonError(msg, status) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}
