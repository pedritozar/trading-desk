# PEI TRADING SYSTEM — CHANGELOG v4.3

**Proyectos:** Trading System (Dashboard + Excel) | Cartera Real (Alfy/Notion) | Reactor Nuclear IA
**Última actualización:** 2026-09-08 (sesión Cowork — root cause encontrada y arreglada: TDZ en `DD_MUESTRA_CHICA_R` explicaba el "Sin datos" de Tesla/Maleta y el Drawdown en blanco; + fix Max Drawdown + aislamiento por bloque de renderMetricas() + git tracking)

> **Supersede a `CHANGELOG_PEI_trading_v4_2.md`** (podés borrarlo).
> El Reactor Nuclear IA tiene changelog propio: `CHANGELOG_reactor.md` en `Desktop/reactor IA/`. No mezclar.
> Criterio de poda: este archivo guarda **estado actual + pendientes + lecciones que evitan repetir errores**. El detalle de sesiones ya cerradas se borra.

---

## PROTOCOLO DE INICIO DE SESIÓN

1. Adjuntar este CHANGELOG al inicio de cada chat nuevo
2. Cualquier IA lo lee primero antes de responder
3. Al cerrar sesión importante → actualizar y **podar** lo ya resuelto
4. El CHANGELOG es la fuente de verdad — prioridad sobre memoria interna

---

## Sesión 2026-09-08 (Cowork) — fix Max Drawdown + git tracking

### Fix: Max Drawdown mostraba % sin sentido con pocos trades
Con solo 4 trades cargados, Métricas mostraba **Max Drawdown -108.70%** — imposible como %, pero el cálculo estaba bien: `calcDrawdown()` divide la caída (R) por el pico acumulado (R), y con un pico chico (1,84R) cualquier caída de -2R da un % gigante. No era un bug de lógica, era una unidad engañosa con muestra chica.

**Fix (`calcDrawdown` + nueva `formatDD()`):** ahora se muestra siempre el **R absoluto primero** (no depende de la escala) y el % como referencia entre paréntesis, marcando "muestra chica" (⚠ en tablas compactas) cuando el pico acumulado es menor a 5R. Ej: antes `-108.70%` → ahora `-2.00R (-108.7%, muestra chica)`. Aplicado en las 4 vistas que mostraban Max Drawdown: cards TESLA/MALETA, tabla Sesgo por Activo, panel Drawdown global y Prop Firm Challenge.

Verificado con `node --check` sobre el JS extraído del HTML — sin errores. No verificado aún en el navegador real (falta que Pedro recargue y confirme visualmente).

### Git tracking (housekeeping de la sesión anterior, cerrado hoy)
`deploy.sh`, el CHANGELOG y `HTML- DASBOARD/NO_ABRIR_fuente_para_editar.html` quedaron versionados (antes solo vivían en el disco del Mac). De paso se tapó un agujero: `trades_*.csv` no estaba en el `.gitignore` (solo `tracker_bitacora*.csv`), así que datos de trading reales se hubieran colado al repo público. Commit `f328d96`, pusheado por Pedro desde su Terminal real.


## Sesión 2026-09-08 (cont.) — Rachas/Sesgo por Activo caían a "Cargá el CSV" en un refresh puntual

### Reporte de Pedro
Confirmó el fix de Max Drawdown funcionando (`-2.00R (-108.7%, muestra chica)` visible en Métricas y Prop Firm). Pero mandó capturas de dos refrescos seguidos de `index.html` con los mismos 4 trades en localStorage: el primero (01:12:51) renderizaba Métricas completo; el segundo, 8 segundos después (01:12:59), mostraba Rachas y Sesgo por Activo con el placeholder "Cargá el CSV" y TESLA/MALETA en "Sin datos" — **con el mismo `trades.length` de 4** (el footer seguía mostrando "4 trades cargados" y el panel Drawdown seguía dibujando la curva). O sea: no es que se perdiera el CSV — algo dentro de `renderMetricas()` tira una excepción intermitente que corta la función a mitad de camino, dejando todo lo que viene después del punto de falla en su estado placeholder por defecto. Mismo patrón que el bug de TDZ del 07/09 (`renderAll()` se cortaba a la mitad), pero esta vez adentro de una sola función que no tenía aislamiento interno.

### Fix: `renderMetricas()` con cada bloque en su propio try/catch
No se pudo reproducir en vivo desde Cowork (sin browser real con su localStorage) para pescar el error exacto en consola, así que en vez de perseguir la causa puntual se aplicó el mismo patrón defensivo que ya usa `renderAll()`: cada bloque de `renderMetricas()` (Drawdown SVG+label, Rachas, TESLA/MALETA, Sesgo por Activo, Prop Firm, Kelly) quedó aislado en su propio `try/catch` con `console.error('renderMetricas: <bloque>', e)`. Además se agregaron guards `if (el)` antes de tocar `.textContent`/`.innerHTML` en los elementos que no los tenían. Resultado: si vuelve a pasar, cada panel se actualiza de forma independiente — un fallo puntual en un bloque ya no tapa el resto — y la consola del navegador va a decir exactamente en qué bloque fue, lo que hace falta para encontrar la causa de raíz si reaparece.

Verificado con `node --check` sobre el JS extraído del HTML — sin errores. **No verificado aún en vivo** (falta que Pedro repita el refresh y confirme, y si vuelve a fallar, que mande la consola del navegador con el mensaje `renderMetricas: ...`).

### Pendiente de esta sesión
- [x] Max Drawdown con formato nuevo (R + % + aviso de muestra chica) — confirmado por Pedro en capturas.
- [x] Rachas/Sesgo/TESLA-MALETA ya no caen a "Cargá el CSV" en refresh — **causa raíz encontrada y arreglada, ver sesión siguiente.**
- [ ] Sigue sin confirmarse si Equity Curve y P&L por Activo (Chart.js, tab Overview) renderizan en el Mac real de Pedro con internet — pedirle un refresh forzado (Cmd+Shift+R) y nuevas capturas.

---

## Sesión 2026-09-08 (cont. 2) — Root cause encontrada: TESLA/MALETA "Sin datos" + Drawdown en blanco

### Reporte de Pedro
Después del fix de aislamiento por bloque, mandó capturas nuevas: Rachas, Sesgo por Activo y Resumen Mensual ya renderizaban bien, pero las cards de **TESLA y MALETA seguían en "Sin datos"** y el label de **Drawdown global quedaba en blanco/"—"**. Pedro pidió investigar a fondo (no otro parche de superficie).

### Investigación (Playwright headless contra el `index.html` real de Pedro)
El aislamiento por bloque del fix anterior contenía el daño pero no explicaba la causa. Se armó una reproducción empírica: se bajó el `index.html` real de Pedro, se inyectó su CSV real (4 trades) en `localStorage` vía `page.addInitScript()`, y se recargó la página 40 veces en Chromium headless capturando `console.error`/`pageerror`.

**Resultado: `ReferenceError: Cannot access 'DD_MUESTRA_CHICA_R' before initialization` en el 100% de los reloads (40/40).** Causa: al aplicar el fix de Max Drawdown de esta misma sesión, `const DD_MUESTRA_CHICA_R = 5` quedó declarada cerca de `formatDD()` (línea ~2880), **muy por debajo** del punto donde `restoreCSV()` corre de forma síncrona al cargar la página y dispara `renderAll() → renderMetricas() → formatDD()`. Es el mismo bug de zona muerta temporal (TDZ) que ya se había arreglado una vez para `MESES_ABREV` — con comentario explícito en el código advirtiendo sobre este patrón — y que reintroduje yo mismo al no mover la nueva constante junto a esa convención.

El try/catch por bloque (fix anterior) atajaba la excepción en 3 puntos de `renderMetricas()` (drawdown SVG/label, tesla/maleta, prop firm — los tres únicos que llaman a `formatDD()`), dejando esos paneles en su placeholder por defecto ("Sin datos" / "—") mientras Rachas/Sesgo/Resumen Mensual (que no usan `formatDD()`) renderizaban bien. Esto explica el patrón exacto que reportó Pedro.

De paso la misma búsqueda encontró un **segundo TDZ pre-existente, no relacionado con mi fix**: `let analisisView = 'torta'` (línea 2640) también se declara después del punto de disparo síncrono, y `renderAnalisis()` puede correr en esa misma cadena — mismo riesgo, tab Análisis.

### Fix
Se movieron ambas declaraciones (`const DD_MUESTRA_CHICA_R` y `let analisisView`) junto a `MESES_ABREV` (~línea 1539), seteando el precedente de la convención documentada: **toda constante/variable que use cualquier función llamada desde la cadena síncrona de `restoreCSV()` (que en la práctica es casi todo `renderAll()`) va declarada arriba, antes de esa cadena, nunca cerca de donde se usa.**

### Verificación
- `node --check` sobre el JS extraído: sin errores de sintaxis.
- Re-corrida la reproducción Playwright (40 reloads, mismo CSV real de Pedro): **0/40 `ReferenceError`, 0/40 "Sin datos" en Tesla, 0/40 Drawdown en "—"**. Los únicos errores de consola remanentes son `ERR_TUNNEL_CONNECTION_FAILED` al CDN de Chart.js — artefacto del sandbox sin salida a internet real, no reproducible en el Mac de Pedro.
- **Pendiente: confirmación visual de Pedro** en el dashboard real (recarga forzada Cmd+Shift+R) — la reproducción es sólida pero la palabra final la tiene el navegador real.

### Pendiente de esta sesión
- [ ] **Pedro: confirmar en el dashboard real** que TESLA/MALETA y el label de Drawdown ya muestran datos tras un refresh forzado.
- [ ] Sigue sin confirmarse si Equity Curve y P&L por Activo (Chart.js) renderizan con internet real — pedir capturas nuevas.

---

# PROYECTO 1 — TRADING SYSTEM

## Stack IA

| IA | Rol |
|---|---|
| **Claude Sonnet 5** | Lead: arquitectura, auditoría de código, Excel, Notion, dashboard, CHANGELOG |
| **DeepSeek R1 / Reactor** | Genera código JS denso desde specs exactas — SIEMPRE auditado por Claude antes de integrar |
| **Gemini Advanced** | Contexto amplio, exámenes TESLA/MALETA, documentos largos |
| **Google AI Mode** | Research y disparadores de ideas (no código de producción) |
| **GPT-4** | Reserva |

### Regla de oro (validada en la práctica, no negociable)
El código del Reactor/DeepSeek **no se pega directo**. Historial de fallas reales: variables CSS inventadas (`var(--txt)`), funciones-plantilla no ejecutables (`// resto igual`), colores hardcodeados fuera de paleta, reescritura completa de arquitectura al pedirle "extender".

**Checklist obligatorio para prompts a DeepSeek/Reactor:**
1. Pasar nombres exactos de funciones y variables del archivo real (Claude los lee primero).
2. "No inventes colores ni en `rgba()` — usá las CSS vars que te paso."
3. "Si agregás una card a un grid, decime cuántas columnas tiene y cuántas cards hay."
4. "Código completo y ejecutable, sin plantillas cortadas."
5. "Debe pasar `node --check` sin errores — criterio de aceptación explícito."
6. "Si un job supera el límite de la API por sí solo, dividilo en sub-requests; no lo mandes igual."
7. Si el contexto trae código existente: "PRESERVAR ARQUITECTURA — extender, no reescribir."

---

## Estado actual del dashboard

- ⚠️ En vivo: https://pedritozar.github.io/trading-desk/ · último deploy confirmado en producción sigue siendo `154f024` (06/09 — puente PEI·SYS). **7 commits locales del 07/09 sin pushear** (`da95be6`…`2bb35c8`, ver secciones de sesión) — Cowork no tiene credenciales de GitHub en esta VM. Nada de esto llegó a producción todavía. Ver Pendiente inmediato.
- ✅ Tabs: Overview · Trades · **Métricas** · Precios · Mercado · Índices · Earnings
- ✅ Account selector multi-broker (Todas/CMC Demo/MT5 Demo/CMC Live/MT5 Live), persiste en localStorage
- ✅ Métricas: Rachas, Drawdown, TESLA/MALETA, Prop Firm, Kelly, Sesgo por Activo, **Resumen Mensual/Anual (NUEVO 26/08)**
- ✅ Mercado: Currency Strength + Commodities (Twelve Data) · RVOL · Flujo Institucional (Barchart, link directo) · Calendario Macro (iframe Investing.com)
- ✅ Índices: SPX, RUT, SOX, HSTECH, CSI300, MOEX + rotación de sectores
- ✅ Earnings: Apple/Tesla/Nike/Salesforce/Citi/Alibaba vía Finnhub — **revivido 26/08** con el fix de key
- ✅ Panel Demo vs Live · Sección Análisis (torta, por activo, castigados)
- ✅ CSV parser con delimitador `;` ARG + localStorage
- ✅ **Bug coma decimal ARG — RESUELTO 26/08** (ver sección de sesión)
- ✅ **Precios forex — RESUELTO y verificado en vivo (28/08):** causa real era Frankfurter API bloqueando CORS (no Twelve Data). Fix: swap a `exchangerate-api.com/v4` (mismo esquema JSON). Deployado en `5324558` y confirmado en producción: los 10 pares (EUR/USD, GBP/USD, USD/JPY, GBP/JPY, GBP/CAD, AUD/USD, USD/CHF, EUR/CAD, NZD/USD, AUD/CHF) muestran precios reales. RTSI (dentro de MOEX) sigue sin cargar — problema de datos aparte, no CORS, sin diagnosticar.
- ✅ **Bug real de Mercado/Índices/Earnings — RESUELTO (28/08):** no era Twelve Data ni rate limit — `showTab()` dependía del global `event.target` (no estándar), que falla en Safari y cortaba el `onclick` **antes** de llegar a `initMercadoTab()`/`initIndicesTab()`/`initEarningsTab()`. Esos 3 tabs nunca disparaban la carga de datos en tu Safari. Fix: los botones pasan el elemento (`this`) explícito, sin depender de ningún global. Verificado en vivo con clicks reales: los tres tabs ahora sí inicializan (`mercadoInterval`/`indicesLoaded`/`earningsLoaded` pasan a `true`). Una vez que Mercado inicializa, sigue tardando ~2-4 min en poblarse por el rate-limit de Twelve Data (7 créditos/65s vs 19 necesarios) — eso sí es esperado, no es bug.
- ⚠️ **Nuevo — Índices tab, CORS en fallback Yahoo Finance (descubierto 28/08):** HSTECH/MOEX/CSI300 tiran error CORS en `query1.finance.yahoo.com` (mismo patrón que tenía Frankfurter). No se tocó hoy — pendiente para próxima sesión.
- ⚠️ **Inconsistencia S&P 500:** tab Precios muestra 765,91 y tab Índices muestra 7.619. Precios está trayendo el ETF (SPY) con etiqueta de índice. No está roto, pero confunde — unificar criterio.
- 🆕 **Puente PEI·SYS (descubierto y documentado 06/09):** `index.html` manda al final de cada `renderAll()` un resumen agregado (rachas, win rate, PnL semana/mes/año/global) a un Firestore compartido con tu otro dashboard PEI·SYS (`resumen_trading/actual`). Solo escribe, no lee nada de vuelta. Ver sección de sesión 2026-09-06 para el detalle y el problema que causó.

### Archivos HTML
- **`index.html`** (raíz) → **el que Pedro abre siempre, haciendo doble click en la carpeta.** Es el archivo real y actualizado — se actualiza solo cuando se corre `deploy.sh`. Nunca hace falta usar la URL en vivo para verlo: abrir este archivo local ES ver la versión de siempre.
- **`HTML- DASBOARD/NO_ABRIR_fuente_para_editar.html`** (renombrado 06/09, antes `trading_dashboard.html`) → la fuente que se edita cuando hay que tocar código. Pedro NO debe abrir este para usar el dashboard — el nombre ya lo dice. `deploy.sh` lo copia a `index.html` y hace el commit/push.
- ~~`HTML- DASBOARD/index.html`~~ → **ELIMINADO (06/09).** Era un duplicado muerto de junio (108KB, previo a todos los fixes de agosto) — la causa principal de la confusión de "hay dos o más HTML".

---

## Sesión 2026-09-07 (cont.) — 6 features nuevas: ideas extraídas de ZAR Finance + Macro Argentina (Cowork)

### Motivo
Sobre la paleta día/noche de esta misma sesión (ver arriba), Pedro pidió una revisión exhaustiva del changelog de ZAR Finance y de la carpeta "Macro Argentina" para extraer ideas aplicables al Trading Desk. De 6 ideas propuestas, Pedro dio luz verde a las 6 con la instrucción "de más fácil a más difícil, vemos qué nos abarca en esta sesión". Se llegó a las 6, todas construidas y verificadas (`node --check` + diff línea por línea + backup por cada una), commiteadas por separado. **Ninguna deployada a producción todavía** — mismo bloqueo de credenciales de Git ya documentado arriba.

### 1. Dedup por firma en el importador CSV (`c951271`)
`parseCSV()` construye una firma (`vals.join('|')`, todas las columnas de la fila) por cada línea del CSV pegado y saltea las que ya vio **dentro del mismo paste** — protege contra copiar/pegar un rango duplicado desde Excel antes de exportar. No protege re-pegar el mismo CSV dos veces porque eso ya no hacía falta: `parseCSV()` reemplaza `trades[]` entero cada vez, no es un import incremental como el de ZAR Finance (ahí sí hacía falta dedup contra lo ya cargado en Firebase). El status bar ahora muestra "(N duplicados salteados)" cuando corresponde. Probado con Node aislado: CSV de 4 filas con 1 duplicada → 3 trades, 1 duplicado detectado.

### 2. Tooltips educativos — botones ⓘ (`2be81a0`)
Sistema `INFO_TEXTS` + `showInfo()`/`hideInfo()` + overlay modal (mismo patrón visual que los tooltips de Macro Argentina, adaptado a la paleta y tipografía del Trading Desk). Aplicado a 5 indicadores: Expectancy, Profit Factor, Kelly Criterion, Currency Strength Meter, RVOL. Explican qué es cada métrica y cómo leerla, sin salir del dashboard.

### 3. Panel Config editable — API keys (`a4bcd72`)
Pestaña nueva "⚙ Config". `FINNHUB_KEY`/`TWELVE_DATA_KEY` pasaron de `const` hardcodeada a `let` con override por `localStorage` (`pei_finnhub_key`/`pei_twelvedata_key`) — si el campo queda vacío se usa el default del archivo, sin romper nada para quien no toque la pestaña. Incluye validación en vivo de longitud de la key de Finnhub (aviso si no son 40 caracteres) — el mismo bug real de agosto (key cortada a la mitad, pasó desapercibido meses) ahora se ve al toque. De paso, auditoría encontró **`TWELVE_KEY`** (línea ~3225 original): una constante duplicada de `TWELVE_DATA_KEY`, declarada y **nunca usada** en ningún lado del archivo — resto muerto de un copy/paste viejo de la sección Índices. Eliminada. Probado con Node simulando `localStorage`/DOM: init con defaults, detección de key de 20 chars (el bug real de agosto reproducido a propósito), guardado, actualización en vivo de las variables, y restaurar-a-default — los 5 casos pasaron.

### 4. Histórico perpetuo de Earnings en Firestore (`1b15e2e`)
Patrón "Banco IPC" de Macro Argentina: en vez de re-pedirle a Finnhub el rango histórico cada vez (limitado por el free tier), cada Q **ya reportado** (`epsActual` real, no estimado) que trae el fetch normal de `fetchEarnings()` se guarda una sola vez en Firestore (`earnings_hist/{symbol}_{fecha}`, mismo proyecto `peisys` del puente PEI·SYS ya existente, `merge:true` así es idempotente). No pega requests extra — usa la misma respuesta de `data.earningsCalendar` que hoy ya se descartaba (solo se quedaba con el registro más cercano a hoy). Con el tiempo esto arma la base de datos propia para la vista "por año → trimestre" ya speada más abajo en este mismo CHANGELOG ("Próxima sesión — Histórico de Earnings por Q") — **esa vista (tabla + selector de año + export CSV) no se construyó hoy**, solo la capa de persistencia que la va a alimentar. Probado con Node: cálculo de trimestre/año desde fecha (6 casos, incluidos bordes de fin de trimestre) + guard de "no escribir si es estimado, no si falta el puente".

**⚠️ Pendiente externo de Pedro:** esto requiere que las Firestore Rules del proyecto `peisys` permitan `write` en la colección `earnings_hist`. Hoy solo está confirmado abierto `resumen_trading` (el del puente). Si abrís la consola de Firebase y no aparece nada guardándose ahí, revisar eso primero.

### 5. Meta de Cuenta — curva real vs. necesario (`428542a`)
Card nueva en Métricas, entre "Prop Firm Challenge" y "Kelly Criterion". Patrón "Objetivos Financieros" de ZAR Finance, pero más simple: acá no hace falta cargar aportes a mano porque el "avance real" ya es el P&L acumulado de los trades cargados (mismo dato que alimenta la curva de Equity) — cero estado nuevo que se pueda desincronizar. Pedro define nombre + monto objetivo en R + fecha inicio + fecha objetivo (guardado en `localStorage`, no Firebase — es config local del dashboard, no dato de trading). Gráfico SVG a mano (mismo patrón que `renderEquity()`, sin Chart.js) con la recta "necesario" vs. la curva real, y un aviso verde/rojo con cuánta R/día hace falta en lo que resta si está atrasado. Probado con Node: 4 casos (a tiempo, atrasado, trade previo a la fecha de inicio correctamente ignorado, meta ya cumplida) — los 4 dieron el resultado esperado.

### 6. Proxy CORS opcional (Cloudflare Worker) — arregla HSTECH/MOEX/CSI300 (`37a1e8a`)
La idea de mayor impacto de las 6, pero la única que necesita algo fuera de este archivo: una cuenta de Cloudflare (gratis) de Pedro. No se puede deployar desde Cowork (no hay credenciales de Cloudflare acá, ni se pretende tenerlas). Lo que se dejó listo:
- `cloudflare_worker_proxy.js` (raíz del repo): Worker completo, con **allowlist cerrado** a `query1/query2.finance.yahoo.com` (no es un proxy abierto a cualquier URL — evita que se pueda usar para pegarle a otra cosa a nombre de Pedro), cache de 60s, manejo de preflight CORS. Instrucciones de deploy (5 minutos, sin terminal, todo desde el dashboard web de Cloudflare) como comentario al principio del archivo mismo.
- Campo nuevo en "⚙ Config": "Proxy CORS (Cloudflare Worker)" — si se deja vacío, `fetchYahoo()` sigue andando exactamente igual que hoy (SPX/RUT/SOX ok, HSTECH/MOEX/CSI300 en blanco). Si se carga la URL del Worker deployado, los fetches de Yahoo pasan por ahí (`${PROXY}/?url=...`) y dejan de chocar con CORS.
- Sintaxis del Worker validada con `node --check` en modo ES module.

**Pendiente de Pedro:** deployar el Worker (instrucciones en el archivo) y pegar la URL en Config — recién ahí se puede confirmar en vivo que HSTECH/MOEX/CSI300 cargan.

### Verificación general (las 6 features)
- Cada una: backup con timestamp antes de tocar, `node --check` sobre los 2 bloques `<script>` después, diff línea por línea contra el backup confirmando que solo cambió lo esperado, commit propio con mensaje descriptivo.
- Balance de `<div>` chequeado tras la Meta de Cuenta (la edición HTML más grande de las 6): 413/413, sin desbalance.
- Simulación en Node (sin browser real) de la lógica de cada feature que tiene cálculo: dedup CSV, longitud de Finnhub key, trimestre/año de earnings, curva de Meta de Cuenta — todos los casos de prueba dieron el resultado esperado.
- **Lo que NO se pudo hacer desde Cowork:** confirmar visualmente en un navegador real (Safari/Chrome de Pedro) que las 6 se ven y funcionan bien con datos reales, y pushear los 6 commits a GitHub.

### Pendiente inmediato
- [ ] **Pedro: pushear los 6 commits** desde tu Terminal real: `cd ~/Desktop/trading-desk && git push origin main` (incluye la paleta día/noche + las 6 features de esta sección — todo junto, un solo push).
- [ ] **Pedro: confirmar visualmente** cada feature en tu navegador — especialmente la Meta de Cuenta (cargar una meta real y ver que la curva pinta bien) y el panel Config (que guardar/restaurar keys funcione en el navegador, no solo en la simulación de Node).
- [ ] **Pedro (opcional, para completar el punto 6):** deployar `cloudflare_worker_proxy.js` (instrucciones en el propio archivo) y cargar la URL en Config para que HSTECH/MOEX/CSI300 dejen de estar en blanco.
- [ ] **Pedro (para el punto 4):** revisar Firestore Rules del proyecto `peisys` — agregar permiso de `write` a `earnings_hist` si no está ya cubierto por una regla más general.
- [ ] Cuando `earnings_hist` tenga unos meses de datos acumulados, construir la vista "por año → trimestre" ya speada abajo en este CHANGELOG ("Próxima sesión — Histórico de Earnings por Q") — ahora tiene datos reales para mostrar en vez de arrancar vacía.

*Actualizado: 2026-09-07 (6 features de la revisión de ZAR Finance + Macro Argentina, Cowork) — Sesión Cowork (Claude Sonnet 5).*

---

## Sesión 2026-09-07 (cont. 2) — Equity Curve y P&L por Activo a Chart.js (`2bb35c8`)

### Motivo
Pedro mandó capturas del dashboard ya andando con las 6 features de la sección anterior, y de la web de Chart.js — preguntó si se podían agregar charts "coloridos" como esos. Se le presentaron 3 opciones (Chart.js vía CDN migrando Equity+Bar Chart / mejorar el SVG propio sin dependencias / Chart.js solo para un chart nuevo) y eligió la primera.

### Qué se hizo
- Chart.js v4.4.4 vía CDN (`cdn.jsdelivr.net`, versión pineada — no `@latest`).
- **Equity Curve** (antes SVG a mano): ahora `<canvas>` + line chart de Chart.js, gradiente de área (verde si el acumulado cierra positivo, rojo si no), tooltip con el R exacto por punto.
- **P&L por Activo** (antes barras HTML/CSS a mano): ahora `<canvas>` + bar chart horizontal de Chart.js, top 10 activos por |P&L|, verde/rojo por signo, tooltip con el R exacto.
- `cssVar(name)` — helper nuevo: el SVG/HTML anterior usaba `var(--x)` de CSS, que se actualiza solo con el tema del SO. Un `<canvas>` ya pintado NO es reactivo — los colores de Chart.js se resuelven una vez, con `getComputedStyle()`, al momento de renderizar.
- `matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)` nuevo — sin esto, cambiar el tema del Mac en vivo hubiera dejado los charts pintados con los colores del tema anterior hasta el próximo cambio de filtro/CSV. Ahora ambos charts se re-renderizan solos apenas el SO cambia de tema.
- Meta de Cuenta (feature 5 de la sección anterior) **queda igual, en SVG propio** — no se tocó, no estaba en el pedido.
- Verificado: backup con timestamp antes de tocar (`HTML- DASBOARD/backups/`), `node --check` sobre el bloque `<script>` principal, diff línea por línea contra el backup (222 líneas de diff, todas esperadas), balance `<div>` 410/410 y `<canvas>` 2/2, grep sin referencias colgantes a los ids viejos (`equity-svg`, `activo-bars`).
- **No se pudo confirmar visualmente en un navegador real** — mismo límite de siempre en Cowork. El CDN de Chart.js necesita internet en el navegador de Pedro para cargar (no hace falta nada más — no requiere key ni cuenta).

### Pendiente inmediato
- [ ] **Pedro: pushear los 7 commits** — `cd ~/Desktop/trading-desk && git push origin main` (paleta + 6 features + Chart.js, todo junto).
- [ ] **Pedro: confirmar visualmente** que los charts nuevos cargan bien (el `<script src>` de jsdelivr necesita que el navegador tenga internet al abrir `index.html` — si Pedro abre el archivo local sin conexión, los charts van a quedar vacíos aunque el resto del dashboard funcione).

*Actualizado: 2026-09-07 (Chart.js, Cowork) — Sesión Cowork (Claude Sonnet 5).*

---

## Sesión 2026-09-07 (cont. 3) — Fix crítico: un chart roto tumbaba toda la tabla de Trades y Métricas (`1909d94`)

### Qué encontró Pedro
Después del push de Chart.js, Pedro mandó capturas del dashboard en vivo. Las capturas mostraban algo mucho más serio que "los charts tardan en cargar": con 5 trades cargados (los KPIs del Overview mostraban los números reales — +6.62R, WR 60%, Expectancy +1.32R), la **tabla de Trades entera** mostraba "Cargá el CSV desde el botón superior" y **toda la pestaña Métricas** (Rachas, Drawdown, TESLA, MALETA, Sesgo por Activo, Resumen Mensual) mostraba "Cargá el CSV..." o "Sin datos" — como si no hubiera ningún trade cargado, contradiciendo los KPIs de arriba.

### Causa real
`renderAll()` llama a cada función de render en secuencia (`renderKPIs(); renderEquity(); renderTrades(); renderActivoBars(); ...`) sin try/catch individual. Si `new Chart(...)` (agregado hoy) tira una excepción sin atrapar — el escenario más probable es que el CDN de Chart.js no llegó a cargar a tiempo (o quedó bloqueado) y `Chart` queda `undefined`, entonces `new Chart(...)` tira `ReferenceError` — esa excepción corta la ejecución de `renderAll()` ahí mismo, y **todo lo que viene después en la lista nunca se ejecuta**. `renderEquity()` es la 2da función de la lista; `renderTrades()` es la 3ra — coincide exactamente con el patrón de las capturas (KPIs, que corren 1ros, sí se ven; todo lo que corre después de `renderEquity()` no).

### Fix (dos capas)
1. `renderAll()` ahora itera un array de funciones con try/catch individual en cada una — si una falla (hoy o en el futuro, por cualquier motivo), las demás se siguen ejecutando en vez de quedar todas colgadas. Esto cierra esta clase entera de bug, no solo el caso de Chart.js.
2. `renderEquity()`/`renderActivoBars()`: guard explícito `typeof Chart === 'undefined'` — si el CDN no cargó, el panel muestra un mensaje claro ("Chart.js no cargó, revisá tu conexión y recargá") en vez de tirar una excepción silenciosa.
- Verificado: `node --check`, diff línea por línea contra backup (51 líneas, todas esperadas), balance `<div>` 410/410.

### Pendiente inmediato
- [ ] **Pedro: pushear los 8 commits** — `cd ~/Desktop/trading-desk && git push origin main`.
- [ ] **Pedro: confirmar** que ahora la tabla de Trades y Métricas se pueblan aunque el chart de Equity/P&L por Activo no cargue (por ejemplo, sin internet en el momento de abrir el archivo local).

*Actualizado: 2026-09-07 (fix crítico renderAll, Cowork) — Sesión Cowork (Claude Sonnet 5).*

---

## Sesión 2026-09-07 (cierre) — Chart.js resuelto solo, CSV cargado OK, se agregó "Pegar CSV"

### Estado final al cerrar
- **10 commits del día, TODOS pusheados a producción** (`da95be6`…`de8070d`, confirmado por Pedro desde su Terminal real — `1909d94..de8070d main -> main`). Nada pendiente de deploy.
- **El bug de los charts en blanco se resolvió sin tocar nada** — probablemente fue el CDN de Chart.js tardando/cacheando mal la primera vez. Con capturas nuevas, Equity Curve y P&L por Activo ya renderizan bien (línea con gradiente, barras verdes/rojas). No hizo falta debug de consola.
- **El CSV de las 4 operaciones se cargó y verificó en vivo:** 4 trades, 2 ganadas / 2 perdidas, P&L neto -0,16R, mejor EUR/JPY +1,84R, peor AUD/USD -1,00R — todo matchea exacto con lo calculado a mano. Confirma que el flujo bróker→reconstrucción→CSV→dashboard funciona de punta a punta.
- **Bug real encontrado y arreglado (`de8070d`):** "CSV Manual" (el input de archivo) no volvía a disparar si Pedro elegía el mismo archivo dos veces seguidas — comportamiento estándar del navegador (el evento `change` no se dispara si el `value` no cambió), pero daba la sensación de un botón roto. Fix: se resetea `input.value` después de leer el archivo.
- **Feature nueva (`de8070d`): botón "📋 Pegar CSV"** — modal con textarea para cargar el CSV pegando el texto directo, sin guardar un archivo primero (Pedro lo pidió recordando el patrón de ZAR Finance). Reusa `parseCSV()` tal cual, mismo dedup y mismo formato que el import por archivo.

### Las 3 formas de cargar CSV — para qué sirve cada una (explicado a pedido de Pedro)
Las tres terminan en la misma función (`parseCSV()`), que guarda el texto en `localStorage['pei_csv_backup']` y llama a `renderAll()`. La diferencia es SOLO cómo llega el texto hasta ahí:
- **"CSV Manual"** (`<input type="file">`): abre el selector de archivos nativo del sistema operativo, lee el archivo elegido una sola vez. Funciona en cualquier navegador. Hay que repetir el paso cada vez que el archivo cambia.
- **"Fijar CSV"**: usa la File System Access API (solo Chrome/Brave/Edge — Safari no la soporta, cae automáticamente al selector normal). Al elegir el archivo, el navegador guarda un handle "vivo" a ese archivo en disco. Con eso se habilita el botón "Auto-sync": cada 30s vuelve a leer el mismo archivo y, si cambió, recarga solo. Es para el caso de "tengo un CSV en una carpeta que voy actualizando" y no querés reimportar a mano cada vez.
- **"Pegar CSV"** (nueva de hoy): modal con textarea, pegás el texto directo (por ejemplo lo que te paso yo en el chat) sin necesidad de guardar un archivo primero. Es la más rápida para cargas puntuales como la de hoy.

### Por qué antes, al recargar, parecía que se borraba el CSV
No se borraba — era un síntoma del bug de `renderAll()` que se arregló en `1909d94`. El `localStorage.setItem('pei_csv_backup', text)` pasa ANTES de llamar a `renderAll()`, así que el CSV siempre quedaba guardado. Pero al recargar la página, `restoreCSV()` vuelve a llamar a `parseCSV()` con ese texto guardado, y ese `parseCSV()` termina en el mismo `renderAll()` de siempre. Antes del fix, si el primer chart (Equity Curve, recién migrado a Chart.js) tiraba una excepción sin atrapar, TODO lo que venía después en la secuencia (tabla de Trades, pestaña Métricas) se cortaba en seco — y como eso pasa automático al abrir la página, daba la sensación de "se borró el CSV" cuando en realidad los datos seguían ahí, solo que no se estaban dibujando. Con el fix de `1909d94` (cada función de `renderAll()` corre en su propio try/catch) ese efecto cascada ya no puede volver a pasar, aunque algún chart puntual falle.

### Pendiente real para la próxima sesión (poco)
- [ ] Si Pedro se acuerda el SL que le había puesto a NZD/CAD, completar esa fila del CSV con la R real (hoy quedó en blanco, sin bracket order registrado en ningún lado).
- [ ] Confirmar/corregir sistema-tipo-sesión de las 4 filas cargadas hoy (fueron inferencias mías cruzando con Notion, marcadas como tal en su momento — no bloqueante, el dashboard ya las tiene cargadas).
- [ ] Sumar Interactive Brokers al flujo cuando Pedro empiece a operar ahí — confirmado que TradingView soporta conectar IBKR (Live y Paper, mismo login que CMC) para exportar el historial igual que se hizo hoy con CMC.

### Contexto de negocio de la sesión (por si se pierde el hilo)
Pedro pidió automatizar la carga de trades para no perderlos por estar corriendo entre trading/trabajo/facultad. Se investigaron 3 vías de auto-sync (CMC API: no existe para retail; MT5 API: necesita terminal local corriendo, mala fit para Mac; myfxbook API: existe pero con límites y fricción de credenciales) y se optó por un flujo manual-asistido: Pedro manda el export del historial del bróker (mejor desde TradingView, que tiene la cuenta CMC conectada y exporta a CSV limpio — mucho más confiable que transcribir capturas del terminal) y Claude reconstruye las operaciones cerradas cruzando entrada/salida/SL/TP y devuelve el CSV en el formato exacto del importador. Ese flujo ya se probó de punta a punta hoy con resultado correcto.

*Cerrado: 2026-09-07, sesión Cowork (Claude Sonnet 5).*

---

## Sesión 2026-09-06 — Por qué había HTMLs duplicados: puente PEI·SYS no documentado + limpieza

### Motivo
Pedro reportó confusión real ("por qué carajos hay dos o más HTML, me confundo todo") y pidió revisar y borrar los viejos.

### 1. Lo que realmente pasó (no era solo "un archivo viejo")
Había 3 archivos HTML en 2 carpetas:
- `index.html` (raíz) — el que corre en producción.
- `HTML- DASBOARD/trading_dashboard.html` — la "fuente" que se supone que se edita.
- `HTML- DASBOARD/index.html` — duplicado de junio, ya muerto.

El problema de fondo: en algún momento del 06/09 se agregó una función nueva (el puente a PEI·SYS, ver abajo) editando `index.html` **directamente**, sin tocar `trading_dashboard.html` ni anotarlo acá. Resultado: `index.html` quedó con 80 líneas más que la "fuente" — se desincronizaron sin que quedara registro. `diff` entre ambos confirmó que esa era la ÚNICA diferencia real (nada más divergió).

### 2. Feature nueva encontrada y ahora documentada: Puente Trading → PEI·SYS
`index.html` agregó un módulo Firebase (Firestore, proyecto `peisys` — el mismo que usa el otro dashboard PEI·SYS) que en cada `renderAll()` calcula rachas, win rate y PnL (semana/mes/año/global) desde `trades[]` y los escribe en el documento `resumen_trading/actual` vía `setDoc(..., {merge:true})`. Es **solo de escritura** — el Trading Desk no lee nada de PEI·SYS de vuelta. Hay un indicador `#status-puente` en la barra de estado con la hora del último sync (o el error, si falla). Commit: `154f024`.

### 3. Acción tomada
- Se copió `index.html` → `HTML- DASBOARD/trading_dashboard.html` (dirección inversa a la normal — acá `index.html` era la versión más nueva y correcta). Verificado por `md5sum`: ambos archivos ahora idénticos.
- Se pidió permiso de borrado y se eliminaron los archivos muertos: `HTML- DASBOARD/index.html` (duplicado de junio) y `_dummy_test_delete.txt` (resto de prueba suelto).
- **Renombrado (a pedido de Pedro):** `HTML- DASBOARD/trading_dashboard.html` → `HTML- DASBOARD/NO_ABRIR_fuente_para_editar.html`, para que quede imposible confundirlo con el que hay que abrir. Se actualizó `deploy.sh` (variable `SOURCE`) para que apunte al nuevo nombre.

### Pendiente / recomendación
- [ ] **Disciplina hacia adelante:** editar SIEMPRE `HTML- DASBOARD/trading_dashboard.html`, nunca `index.html` a mano. Si se vuelve a editar `index.html` directo, se va a desincronizar otra vez.
- [ ] Evaluar mover el bloque del puente PEI·SYS a un archivo `.js` separado, para que sea más difícil tocarlo sin querer al editar el dashboard.
- Nota aparte (no tocado hoy): `git status` sigue mostrando el mismo quilombo de tracking de siempre (README.md y trading_dashboard.html como "deleted" en la raíz; `HTML- DASBOARD/`, `deploy.sh` y este changelog como untracked). Es prexistente, ya señalado en sesiones anteriores — no se tocó.

---

## Sesión 2026-09-07 — Paleta día/noche nueva, inspirada en Macro Argentina (Cowork)

### Motivo
Pedro adjuntó material de otros proyectos (changelog de ZAR Finance + carpeta "Macro Argentina" recién conectada) pidiendo revisión exhaustiva como fuente de ideas visuales/funcionales "para copiar a nuestros modelos", y pidió puntualmente cambiar los colores del dashboard — tanto el modo noche como el día, con auto-switch por sistema (`prefers-color-scheme`).

### Diagnóstico
El `@media (prefers-color-scheme: dark)` **ya existía** en `index.html`/la fuente desde antes — no había que construirlo, solo rediseñar la paleta de ambos modos. Modo día era un tono "papel/crema" cálido (`--bg:#f5f2ed`) y modo noche un dorado/tostado (`--accent:#c8a870`) — sin relación visual con el resto de los proyectos de Pedro.

`macro_argentina.html` (carpeta recién conectada) resultó la mejor referencia: paleta 100% oscura, técnica, con celeste (`#5ba3d9`/`#7cc4f5`) como acento y semánticos verde/rojo/ámbar sobre fondo casi negro (`#0a0e14`) — identidad "Argentina/quant" reutilizable.

### Qué se hizo
Confirmado con Pedro el alcance antes de tocar nada (AskUserQuestion): **solo `index.html`/fuente de Trading Desk**, paleta inspirada en Macro Argentina para ambos modos (no solo copiar el modo noche — se derivó también un modo día coherente, frío/técnico en vez del cálido anterior).

Se reemplazaron **únicamente** los 2 bloques `:root` (claro y `@media (prefers-color-scheme: dark)`) en `HTML- DASBOARD/NO_ABRIR_fuente_para_editar.html` — 17 variables de color en cada modo, mismos nombres de variable (`--bg`, `--accent`, `--green`, etc.), así que no hizo falta tocar nada más del archivo (todo el resto ya usa `var(--...)`, confirmado por auditoría — no hay colores hardcodeados fuera de paleta en el CSS, solo en JS para categorías de gráficos, ver abajo).

**Nuevo modo día:** fondo gris-azulado frío `#f4f6f9`, acento celeste `#2f7bb8`, verdes/rojos/ámbar más saturados para contraste sobre blanco.
**Nuevo modo noche:** calca la identidad de Macro Argentina — `#0a0e14`/`#131922`, acento celeste `#5ba3d9`, semánticos vívidos sobre fondo oscuro.

**Colores NO tocados (a propósito):** paleta categórica del gráfico de torta (Forex/Índices/Commodities/Acciones/Otros — `#4ade80`/`#60a5fa`/`#fbbf24`/`#f472b6`/`#94a3b8`) y el umbral de Currency Strength (`#ffaa00`) — son colores fijos por categoría, no del tema día/noche, quedan igual salvo pedido explícito.

### Verificación
- Preview de swatches enviado a Pedro (día + noche) antes de tocar `index.html` — aprobado ("me parece lindo").
- Backup del original: `HTML- DASBOARD/NO_ABRIR_fuente_para_editar.html.bak_20260907_034239`.
- `node --check` sobre los 2 bloques `<script>` de la fuente → OK.
- `diff` línea por línea contra el backup: **solo** cambiaron las 34 líneas de color de los 2 bloques `:root` — cero líneas de lógica tocadas.
- `cp` fuente → `index.html`, `md5sum` idéntico confirmado entre ambos.
- `git commit` local hecho (`da95be6`). **`git push` falló** — esta VM de Cowork no tiene credenciales de GitHub configuradas (sin credential helper, sin `gh` autenticado, sin token en el entorno). No es el mismo problema del path hardcodeado de `deploy.sh` (ya conocido, sigue en backlog) — es autenticación, no ruta.

### Pendiente inmediato
- [ ] **Pedro: pushear el commit `da95be6`** desde tu Terminal real (`cd ~/Desktop/trading-desk && git push origin main`) — el commit ya existe en tu copia local del repo, solo falta subirlo a GitHub para que se vea en `pedritozar.github.io/trading-desk`.
- [ ] **Pedro: confirmar visualmente** en tu Mac (abriendo `index.html` o la fuente) que la paleta se ve bien en modo día y modo noche (cambiando el modo del sistema) — no se pudo verificar en navegador real desde Cowork.

*Actualizado: 2026-09-07 — Sesión Cowork (Claude Sonnet 5).*

---

## Sesión 2026-08-28 — Dos bugs reales encontrados y resueltos: Precios forex (CORS) + showTab (Safari)

### Motivo
Se retomó el pendiente "Precios forex sin cargar" con debugging en vivo (browser + consola del navegador), en vez de asumir la causa que había quedado anotada el 26/08.

### 1. La causa NO era Twelve Data — diagnóstico del 26/08 quedó desactualizado
El tab Precios ya no llama a Twelve Data para forex: en algún momento (sin documentar en ningún CHANGELOG) se había migrado a Frankfurter API (`api.frankfurter.app`). La consola del navegador mostró el error real:
```
Access to fetch at 'https://api.frankfurter.app/latest?from=USD' from origin 'https://pedritozar.github.io'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```
Es permanente — el `setInterval` de `fetchPrices()` reintenta cada 60s y falla exactamente igual siempre. Esperar no lo arregla.

### 2. Fix aplicado — reemplazo de API, mismo esquema JSON
`exchangerate-api.com/v4/latest/USD` devuelve el mismo JSON (`base/date/rates`) que Frankfurter, así que es reemplazo directo sin tocar `getFXPrice()` ni el resto de la lógica downstream. Verificado:
- Fetch real ejecutado desde el propio origin `pedritozar.github.io` (vía consola del browser) → CORS OK, datos reales devueltos.
- `node --check` sobre el bloque `<script>` completo → sintaxis OK.

De paso se renombró la etiqueta interna `source: 'frankfurter'` → `'fxrate'` (y comentarios relacionados) para que el código no mienta sobre qué API llama — mismo criterio que evitó el bug de la key de Finnhub a medias.

**Aplicado en:** `HTML- DASBOARD/trading_dashboard.html`. **Deployado 28/08** (commit `5324558`, push directo — `deploy.sh` no funcionó desde el entorno de Cowork por path hardcodeado a `~/Desktop/trading-desk`, se replicaron los mismos pasos a mano) y **verificado en vivo**: los 10 pares muestran precios reales en producción.

### 3. Dos hallazgos más mientras se debuggeaba (ninguno tocado hoy)
- **Tab Mercado no está roto.** Usa Twelve Data correctamente — solo que el presupuesto de rate-limit (7 créditos/65s) tarda ~2-4 min en traer los 19 créditos que necesita (15 de Currency Strength+Commodities + 4 de RVOL). Se vio la cola (`twelveDataQueue`/`twelveDataCreditsUsed`) drenar en vivo, un lote por ventana. Es lento, no un bug.
- **Índices tab tiene un CORS nuevo.** HSTECH, MOEX y CSI300 (fallback Yahoo Finance, `query1.finance.yahoo.com`) están bloqueados por CORS — mismo patrón que tenía Frankfurter. Posiblemente Yahoo endureció su política. Sin diagnosticar en profundidad.

### 4. Segundo bug real — mismo día, encontrado porque Pedro probó en Safari
Después de deployar el fix de Precios, Pedro probó en vivo (su Safari) y reportó: Precios cargaba bien pero Mercado seguía en "Cargando..." tras varios minutos — más de lo esperado incluso con el rate-limit de Twelve Data.

**Causa:** `showTab(tab)` marcaba el botón activo con `event.target.classList.add('active')`, usando el global implícito `event` (no estándar, deprecado — `window.event`). Chrome lo tolera en la mayoría de los casos; Safari no lo garantiza en el mismo call path. Cuando falla, tira `TypeError: Cannot read properties of undefined (reading 'target')` **a mitad del `onclick`**, y como el `onclick` de Mercado/Índices/Earnings es `showTab(...); if(!X) initXTab();` en una sola línea, la excepción corta la ejecución antes de llegar a `initMercadoTab()` / `initIndicesTab()` / `initEarningsTab()`. Esos tres tabs **nunca disparaban la carga de datos** en Safari — cero relación con CORS o rate limit, a pesar de que ambos hallazgos de la sesión pasada (Frankfurter y el rate-limit de Twelve Data) eran reales también.

**Fix:** los 7 botones de navegación pasan el elemento clickeado como argumento explícito (`onclick="showTab('mercado', this); ..."`), y `showTab(tab, btn)` usa ese `btn` en vez de cualquier global. No depende de `event` en ningún punto — funciona igual en Safari, Chrome o cualquier otro navegador.

**Verificado en producción con clicks reales** (no simulados): tras el click, `mercadoInterval`/`indicesLoaded` pasan a `true` y los tabs inicializan. `earningsLoaded` queda `false` momentáneamente porque es async (se resuelve solo tras el fetch) — comportamiento esperado, no bug.

**Deployado en:** commit `dc58b10`.

### Pendiente inmediato
- [x] Correr deploy y confirmar en vivo que los 10 pares de Precios cargan. **Hecho 28/08 — commit `5324558`.**
- [x] Fix de `showTab()` para Safari. **Hecho y verificado 28/08 — commit `dc58b10`.**
- [ ] Evaluar el bug de Yahoo Finance en Índices en la próxima sesión (sigue sin diagnosticar — es un CORS real, no relacionado con showTab).
- [ ] **Pedro: recargar el dashboard en tu Safari y confirmar que Mercado/Índices/Earnings ya cargan** (dales los ~2-4 min a Mercado por el rate-limit de Twelve Data antes de asumir que algo falló).

---

## Sesión 2026-08-26 — Auditoría de Excel + resumen mensual + fix Finnhub

### 1. Excel — 5 bugs reales encontrados y corregidos
El archivo arrastraba errores silenciosos desde junio:

| Bug | Detalle | Estado |
|---|---|---|
| P&L desfasado | Fórmulas corridas 2 filas por `delete_rows` de openpyxl → ganadoras mostraban -1,00 | ✅ valores literales 2,87 / 2,91 / 2,84 |
| R/R Teórico desfasado | Mismo problema, columna K | ✅ fórmulas autoreferenciadas por fila |
| Precios sin punto decimal | `1729025` en vez de `17.29025` (6 celdas, filas 5-7) → R/R absurdos (515,92) | ✅ corregidos |
| Win Rate por activo siempre 0% | Hoja DASHBOARD comparaba col L (R/R Real) contra "GANADA" en vez de col M | ✅ |
| P&L por activo siempre 0 | Sumaba col M (texto RESULTADO) en vez de col N | ✅ |
| Drawdown Máx falso | Era copia de "Peor Trade" (`MIN` del P&L), no medía caída acumulada | ✅ columnas AUX T:V en DASHBOARD |

**Además:** hoja convertida en **Tabla de Excel** (`ResultadosTraiding`, rango B4:Q9) → al escribir una fila nueva justo debajo de la última, las fórmulas se copian solas. Bitácora reordenada cronológicamente (necesario para que el drawdown sea correcto). Hoja renombrada de `tracker_bitacora_traiding__DEFI` (nombre que Excel le puso solo) a `resultados traiding`.

**Verificación:** 25 chequeos automáticos, todos OK. P&L Neto **+6,62R**, WR 60%, Expectancy 1,324, Drawdown -1R. El R/R Teórico calculado desde precios (2,873/2,913/2,836) ahora coincide con el R/R Real anotado a mano (2,87/2,91/2,84) — confirmación de que los precios quedaron bien.

### 2. Módulo Resumen Mensual/Anual (tab Métricas)
Grilla de 12 meses con P&L **en R y en % real de cuenta**, semáforo verde/rojo, totales del año y botón de exportar CSV.

- **No guarda estado propio** — se recalcula desde los trades cargados. Decisión deliberada: un acumulador guardado aparte es exactamente lo que se desincroniza del Excel (misma clase de bug que el P&L).
- El % se calcula por trade como `P&L(R) × RIESGO% de esa operación`, no con riesgo fijo — fiel aunque mezcles 0,33% y 1%. Si falta RIESGO%, suma en R y avisa.
- CSV exportado en formato ARG (`;` + coma decimal + BOM) → se pega directo en una pestaña nueva del Excel por año.
- Validado: 9 formatos de riesgo + 6 casos borde (año vacío, fecha inválida, EN CURSO, BREAKEVEN, sin riesgo).

### 3. Fix key Finnhub — bug silencioso de meses
La key estaba guardada **a medias**: solo la segunda mitad (20 de 40 caracteres). Las dos mitades son casi idénticas (terminan en `m0` y `mg`), así que el recorte pasó desapercibido. Finnhub devolvía `{"error":"Invalid API key."}` y el dashboard lo tapaba con `|| 0` / "sin datos".

**Rompía tres cosas a la vez:** tab Earnings vacío, precios S&P500/NASDAQ en "Cargando..." eterno, y calendario económico. Todo revivido con la key completa.

> ⚠️ Si Finnhub vuelve a fallar, **verificar primero que la key tenga 40 caracteres.**

### 4. Calendario económico — fuentes evaluadas y descartadas
La alerta 30min antes sigue sin ser posible (el iframe de Investing.com es cross-origin, JS no puede leer su DOM). Se probaron todas las alternativas:

| Fuente | Resultado |
|---|---|
| Finnhub `/calendar/economic` | ❌ `"You don't have access to this resource"` — premium (probado con key válida) |
| TradingEconomics | ❌ Sin tier gratis con API — desde USD 39/mes |
| Investing.com (cuenta gratis de Pedro) | ❌ Cuenta de usuario final, no da API |
| TradingView (suscripción de Pedro) | ❌ Solo widget embebido, sin API pública de calendario ni con plan pago |
| **FMP (Financial Modeling Prep)** | ⏳ **Única opción gratis pendiente de probar** — 250 req/día, requiere cuenta y key nueva |

### 5. Dos bugs encontrados al verificar el deploy (arreglados en el acto)

**a) Bug de coma decimal ARG — el que tapaba todos los números.** Los trades ganadores mostraban `+2.00R` en vez de 2,87 / 2,91 / 2,84, y el P&L Neto daba **+4,00R en vez de +6,62R**. Causa: `parseFloat("+2,87")` devuelve `2` — corta en la coma. La cuenta cerraba exacto: −1 −1 +2 +2 +2 = 4.

Solución: función `parseNumAR()` que maneja formato ARG (coma decimal, punto de miles) y **23 llamadas migradas** en todo el dashboard. Verificado end-to-end parseando el CSV real: P&L Neto 6,62R, WR 60%, mejor +2,91R, peor −1,00R, drawdown −1R — todo coincide con el Excel.

**b) TDZ en el módulo nuevo — introducido en esta misma sesión.** `MESES_ABREV` se declaró con `const` **después** de `restoreCSV()`, que corre al cargar la página. Quedaba en zona muerta temporal → `ReferenceError` → `renderAll()` se cortaba a la mitad y dejaba sin dibujar los paneles siguientes (**Demo vs Live quedó vacío**, Resumen Mensual mostraba el placeholder con 5 trades cargados).

Solución: constante movida arriba de todo, con comentario en el código explicando por qué va ahí.

> **Lección:** los dos bugs eran silenciosos — nada tiraba error visible, solo números plausibles pero falsos. Es el tercer bug de este tipo en el proyecto (los otros: `change_percent` inexistente en Currency Strength, key de Finnhub a medias). **Siempre verificar contra un cálculo independiente, no confiar en que "se ve bien".**

### 6. Otras decisiones de la sesión
- **Notion HTML blocks (función nueva):** evaluado y descartado para los proyectos actuales. El sandbox bloquea llamadas a APIs externas y el localStorage no sincroniza → inútil para dashboard (Twelve Data/Finnhub), Reactor (api.anthropic.com) y cualquier cosa con Firebase. Sirve solo para herramientas 100% autocontenidas. El embed del dashboard sigue siendo `/embed` + URL de GitHub Pages.
- **Barchart USD 10/mes:** no aporta. Ese plan levanta el límite de vistas del sitio web, no da API ni arregla el bloqueo del iframe, y Barchart no hace calendario económico. Con 20 vistas gratis/día alcanza para la rutina actual.
- **Kelly Criterion:** ya está implementado en el tab Métricas y se alimenta solo de la bitácora. Un "simulador" aparte en Notion sería duplicar trabajo a mano. Descartado.
- **Auditoría externa (a futuro):** Excel y Notion sirven para control de proceso propio, pero un auditor/firma va a pedir statements del broker o track record verificado (MyFxBook conectado en vivo). Conviene ir guardando statements reales como respaldo.

---

## Pendientes Trading System

### ✅ Verificado en vivo (26/08, 01:20)
Tras el deploy `8ce1588`, con el CSV recargado: P&L Neto **+6,62R** · WR 60% · Expectancy +1,32R · Mejor +2,91R · Peor −1,00R · Drawdown −13,12% · Profit Factor 4,31 · Resumen Mensual May −1,00R / Jun +7,62R / Total 2026 +6,62R (+4,09%) · Demo vs Live andando · Earnings con datos reales. Todo coincide con el Excel.

### 🔴 Alta prioridad
- [x] ~~Deploy del fix de Precios forex~~ — **hecho y verificado 28/08** (commit `5324558`).
- [ ] **Cargar 3 trades de agosto al Excel** (están en Notion, no en la bitácora): EUR/USD 12/08 GANADA MT5 Demo · GBP-AUD 11/08 PERDIDA CMC Demo · AUD/USD 25/08 PERDIDA CMC Demo (MALETA). **Falta que Pedro pase Entrada/SL/TP.** Quedan afuera SPY500 (EN CURSO) y Eur/jpy (orden pendiente).
- [ ] **Pedro: recargar CSV en el dashboard** con "FIJAR CSV" → el localStorage todavía tiene datos viejos (mostraba P&L Neto -2,00R en vez de +6,62R).
- [ ] **Pedro: verificar visualmente** tab Earnings (debería mostrar fechas reales ahora) y el nuevo Resumen Mensual.
- [ ] **Disciplina pendiente:** Excel y Notion tienen que estar al día los dos. Hoy Notion va adelantado — el dashboard solo ve hasta el 17/06.

### 🔵 Próxima sesión — Histórico de Earnings por Q (diseño ya acordado)

Objetivo: que los earnings de la watchlist (Apple, Tesla, Nike, Salesforce, Citi, Alibaba + las que se sumen) queden registrados por trimestre y se puedan exportar al Excel a fin de año.

**Decisión de diseño (tomada 26/08): NO acumular en localStorage — pedir el histórico a la API.**
Finnhub ya guarda los Q pasados con EPS real: en la prueba de AAPL devolvió Q3-2026 reportado (`epsActual: 1.91`, `revenueActual`) junto con los estimados futuros. Basta pedir un rango amplio (`from=2023-01-01&to=hoy+12m`) para traer varios años de una. Ventajas sobre acumular: no se pierde si se borra la caché o se abre desde otra máquina, no hay estado propio que se desincronice (misma lección del bug de P&L y del resumen mensual).

**A construir:**
1. Tabla agrupada por año → trimestre (Q1-Q4), por compañía: fecha, EPS estimado, EPS real, sorpresa (beat/miss en % y color), revenue estimado vs real.
2. Selector de año (mismo patrón que el Resumen Mensual).
3. Botón "Exportar CSV" en formato ARG (`;` + coma decimal + BOM) → una fila por compañía/Q, se pega directo en una pestaña del Excel.
4. Costo de API: 6 símbolos = 6 requests, muy por debajo del límite free (60/min). Sin problema.
5. Verificar cuánto histórico devuelve realmente el free tier — si corta, ajustar el rango y documentarlo.

### 🟡 Media prioridad
- [ ] Evaluar CORS de Yahoo Finance en tab Índices (HSTECH/MOEX/CSI300) — descubierto 28/08, sin diagnosticar.
- [ ] **Unificar S&P 500:** tab Precios trae el ETF (SPY, ~765) y tab Índices el índice real (SPX, ~7.619). Decidir cuál va y etiquetarlo bien.
- [ ] Probar **FMP** para el calendario económico en JSON (última opción gratis para la alerta 30min).
- [ ] Fila 32 de la hoja DASHBOARD apunta a "RUSSELL 2000", activo que ya no está en la bitácora → cambiar por un activo real o hacerla dinámica.
- [ ] Embed dashboard en Notion (`/embed` + URL GitHub Pages).
- [ ] Probar Currency Strength con mercados europeos abiertos (4AM ARG).
- [ ] Re-rendir examen TESLA+MALETA — objetivo 9/10 (fallas T1, T5, M6).
- [ ] Auditoría Notion "Venture Capital Firm" — acciones manuales de Pedro (Claude no puede borrar vía API): borrar boilerplate del template (Companies + 4 satélites + All Firm Team + Investment Team Wiki), resolver 2 páginas "BCE" duplicadas, confirmar si "PORTAFOLIO INSTITUCIONAL" es el mismo fondo Alfy, renombrar la raíz.

### 🟢 Backlog
- [ ] Calculadora de lotaje en el dashboard (hoy Pedro usa myfxbook — es táctico por trade, complementa a Kelly que es estratégico).
- [ ] Módulo Racha/Sesgo por Sesión (requiere agregar columna SESIÓN al Excel; ya existe la versión por Activo).
- [ ] Safari fix (workaround FileReader) · App en Dock desde Brave · Filtros en tabla de trades · Throttling Finnhub.
- [ ] `deploy.sh` tiene el path hardcodeado a `$HOME/Desktop/trading-desk` — falla en sesiones Cowork (su `$HOME` es otro). Hacerlo detectar la raíz del repo (`git rev-parse --show-toplevel`) en vez de asumir la ruta.

---

## Excel — Estado actual

**Archivo:** `tracker_bitacora_traiding__DEFINITIVO.xlsx` · Hoja: `resultados traiding` (Tabla `ResultadosTraiding`)

| Fecha | Activo | Sistema | Tipo | Dir | R/R Real | Resultado | P&L | Cuenta |
|---|---|---|---|---|---|---|---|---|
| 29/05/26 | USD/JPY | TESLA | intraday | LONG | — | PERDIDA | -1,00 | CMC Demo |
| 02/06/26 | USDMXN | TESLA | intraday | LONG | 2,87 | GANADA | +2,87 | MT5 Demo |
| 02/06/26 | USDMXN | TESLA | scalping | LONG | 2,91 | GANADA | +2,91 | MT5 Demo |
| 09/06/26 | aud/jpy | TESLA | scalping | SHORT | 2,84 | GANADA | +2,84 | CMC Demo |
| 17/06/26 | USDMXN | TESLA | intraday | LONG | — | PERDIDA | -1,00 | MT5 Demo |

**Totales:** 5 trades · WR 60% · **+6,62R** · Expectancy 1,324 · Drawdown -1R · 100% TESLA

> RUSSEL 200 y SYP500 eran análisis de TradingView (no ejecutados) → migrados a Notion.

---

## Workflows

### Deploy
```bash
cd ~/Desktop/trading-desk
rm -f .git/index.lock          # el lock aparece solo, es falso positivo
cp "HTML- DASBOARD/trading_dashboard.html" ./index.html
git add index.html
git commit -m "mensaje"
git push origin main
```
> Si el push falla con "Invalid username or token": el PAT venció. Generar uno nuevo en github.com/settings/tokens (scope `repo`), guardarlo en Notion, y `git remote set-url origin https://pedritozar:TOKEN@github.com/pedritozar/trading-desk.git`

> ⚠️ **Desde una sesión de Cowork** este script falla — su `$HOME` no es `/Users/pedritozar`, así que `cd ~/Desktop/trading-desk` no encuentra la carpeta (ver pendiente de `deploy.sh` en Backlog). Mientras no se arregle: repetir los mismos comandos a mano usando la ruta montada (`$HOME/mnt/trading-desk` dentro de esa sesión) en vez de `~/Desktop/trading-desk`. Si aparece también un `.git/HEAD.lock` que `rm` no puede borrar ("Operation not permitted"), usar `mv` en vez de `rm` para sacarlo del camino — probado y funciona (28/08).

### CSV → Dashboard
1. Abrir el xlsx → hoja `resultados traiding` → exportar CSV (solo esa hoja)
2. Dashboard → tab Trades → "Fijar CSV" → seleccionar el archivo
3. Usar el selector de cuenta (Overview) para filtrar por broker

> Columnas requeridas: FECHA · ACTIVO · SISTEMA · TIPO · DIR · ENTRADA · SL · TP · RIESGO% · R/R TEÓRICO · R/R REAL · RESULTADO · P&L (R) · ESTADO · NOTAS/LINK TV · CUENTA

---

## Checklists TESLA y MALETA

### TESLA — 7 obligatorios
1. Cruce EMA 3 por sobre/bajo EMA 6
2. EMA 3 y 6 por sobre/bajo EMA 50
3. Estocástico cruzando o acercándose al 50%
4. Confirmación de dirección (cierre de vela)
5. R/R mínimo 1:2 confirmado **antes** de entrar
6. Sin noticias de alto impacto en la sesión
7. Ruptura LT de contratendencia confirmada (cierre de vela)

**Precisión (8):** FVG · Fibonacci 38.2–78.6% · CHoCH entrada · Divergencia MACD/Estocástico · Contexto macro · Gatillo CHoCH · FVG de Impulso · Canal Intraday

### MALETA — 8 obligatorios
1. EMA 50 como soporte/resistencia clave confirmado
2. Cruce EMAs 3 y 6 confirma dirección
3. Estructura de mercado confirmada (HH/HL o LH/LL en 4H/D1)
4. Zona de imbalance o FVG en temporalidad mayor (D1/4H)
5. Retroceso Fibonacci 38.2–78.6% activo
6. CHoCH confirmado en temporalidad mayor (D1 o 4H)
7. R/R mínimo 1:3 confirmado antes de entrar
8. Estructura LT validada con mínimo 3 toques (D1/4H)

**Precisión (6):** Divergencia Estocástico/MACD · Contexto macro · Sin eventos alto impacto · CHoCH+Canal · Mediana Canal · Zona FVG

### Fallas del examen a corregir (6/10 — Gemini, 29/05)
- **T1** ❌ Gatillo CHoCH es Precisión #6, NO obligatorio
- **T5** ❌ crítico — NUNCA mover SL para forzar R/R 1:2
- **M6** ❌ LT necesita mínimo 3 toques para ser válida

---

## Contexto del trader

- **Perfil:** Pedro Zacarias (PEI) — Lic. Economía UBA (en curso), trabajo en relación de dependencia, judo 3x/semana
- **Rutina:** mañanas antes del trabajo (horario asiático) — análisis, revisión de mercado, órdenes pendientes si el AT confirma. Bloomberg digital (USD 10 estudiante) como fondo/research.
- **Objetivo:** trader/analista institucional nivel NY — CMT + CFA + track record auditado. A futuro: hedge fund / consultora / fondo especulativo chico.
- **Certificaciones:** CMT Level I (post prop firm challenge) · CFA (futuro)
- **Prop firm:** 100k account — pendiente
- **Brokers:** CMC Demo · MT5 Demo · Alfy CC57857 (cartera real)
- **Setup:** MacBook Air + monitor ultrawide LG · TradingView, Excel/Numbers, Notion, GitHub Pages
- **Nota:** Bloomberg digital NO es Terminal — sin BLPAPI ni feed de datos, no sirve para conectar APIs. Sí como lectura para el CMT.

---

# PROYECTO 2 — CARTERA REAL (FONDO PEI)

- ✅ Broker **Alfy** (Gallo Financial Technology) · Cuenta **CC57857**
- ✅ Posición: **T30A7** (BONCAP Tesoro, vto. 30/04/2027) · 183.354 títulos @ $129,05 = $236.618,34 · ISIN AR0224546884 · TEM ~2,51%
- ✅ Patrimonio 16/06/2026: **$441.991,79** · Cash ARS $204.673,94
- ✅ Regla de aporte: 10% mensual (bono/salario/aguinaldo)
- ⚠️ Cayó de $1.222.701 (abril) a $441.991 (junio) por retiros personales — en saneamiento

**Fuente de verdad:** Alfy (primaria) → Notion (posiciones + registro mensual) → Excel (histórico y simuladores)
> "ZAR Capital Partners" = sandbox ficticio, proyecto separado. No mezclar.

### Pendientes Cartera
- [ ] **Pedro:** precio de entrada / fecha de compra real de T30A7 en Alfy ("Resultados por especie" / "Histórico tenencia") — P&L está en $0 placeholder
- [ ] **Pedro:** borrar ejemplos viejos del template Notion (Oro, Apple, Tesla, Plata) — Claude no puede vía API
- [ ] Registrar aporte julio/agosto 2026 en "Resultados mensuales" (encadenar a Mes 0)
- [ ] Definir política de asignación objetivo (% renta fija / variable / liquidez)

### Links Notion — Cartera
| Recurso | URL |
|---|---|
| Hub "Gestión de portafolio institucional" | https://app.notion.com/p/173cc364eb9280ed96c7cfc5f0af3617 |
| Inversiones renta fija | https://app.notion.com/p/173cc364eb92810483ddff954bd39d61 |
| Inversiones renta variable | https://app.notion.com/p/173cc364eb92812b8145ea048181cc1e |
| Resultados mensuales | https://app.notion.com/p/24bcc364eb9280f9b499ebc7dd0c778e |
| Posición T30A7 | https://app.notion.com/p/382cc364eb9281529739fa54610d2c07 |
| Registro mensual Junio 2026 (Mes 0) | https://app.notion.com/p/382cc364eb9281a2a568eb8636bfad60 |
| HUB "Economía Personal" | https://app.notion.com/p/341cc364eb9281a7b177e138c3854b7f |

---

# PROYECTO 3 — REACTOR NUCLEAR IA

> Detalle completo en `CHANGELOG_reactor.md` (`Desktop/reactor IA/`). Acá solo el estado.

- ✅ v3.0 — IDs de modelo corregidos (Sonnet 5, Opus 5, Haiku 4.5), precios actualizados, fix de `content[0].text` con thinking blocks, sanitizer con confirmación bloqueante
- ✅ **Fix 20/08:** regla nueva en el `sys` para preservar arquitectura cuando el contexto trae código existente (antes reescribía todo de cero al pedirle "extender"). **Confirmado con caso real** — la segunda prueba preservó todo y agregó solo lo pedido.
- 💬 Idea en debate: "Modo Auditor" — sin resolver
- ✅ **Resuelto (01/09):** `PRECIOS` ahora usa `getPrecios()` con corte automático por fecha (`PROMO_SONNET5_FIN`) — ya devuelve e:0.003/s:0.015 sin que haya que tocar el archivo a mano. Ver `CHANGELOG_reactor.md`.

---

## Links Notion — Trading

| Recurso | URL |
|---|---|
| Análisis TradingView 2026 | https://app.notion.com/p/389cc364eb9281189720d6bd557b7354 |
| Bitácora Trading 2026 | https://app.notion.com/p/344cc364eb92816992e9c4971736a679 |
| Hub general research (macro/corporativo/geopolítica) — "Venture Capital Firm in a Box" | https://app.notion.com/p/174cc364eb92809ebe09df58c9effe8f |

### Pendiente Notion — AT
- [ ] Completar BRENT 20/02 y EUR/USD 23/02 (screenshots sin texto confirmatorio)
- [ ] Verificar si fueron trades REALES (van a Excel si se confirma): GBP/CAD 19/03 → TP 25/03 · AUD/JPY 18/03 (RBA) · USD/MXN 13/03

---

## Historial comprimido de sesiones

| Fecha | Hito |
|---|---|
| 2026-08-26 | Excel auditado (5 bugs), Tabla de Excel, resumen mensual/anual, fix key Finnhub |
| 2026-08-03 | Account selector, Sesgo por Activo, RVOL, calendario macro, Barchart, tab Earnings, fix Currency Strength (`percent_change`) |
| 2026-07-06 | 4 trades de junio a Notion · bug P&L identificado · CHANGELOGs unificados |
| 2026-06-29 | Cierre de junio · Excel con datos reales de brokers · columna CUENTA completada |
| 2026-06-24 | Borradores AT relevados · base Notion de Análisis TradingView |
| 2026-06-10 | `deploy.sh` · CSV pipeline · Panel Demo vs Live · Sección Análisis |
| 2026-06-01 | Tab Mercado (Twelve Data) · Tab Índices |
| 2026-05-29 | Kelly Criterion · examen 6/10 |
| 2026-04/05 | Dashboard deployado · CSV parser · TESLA y MALETA completas |

---

*v4.3 — Claude Sonnet 5 · 2026-08-26 (podado de 408 a ~270 líneas) · actualizado 2026-08-28 (2 fixes deployados y verificados: Precios forex + showTab/Safari) · actualizado 2026-09-06 (puente PEI·SYS documentado + limpieza de HTML duplicados)*
