# PEI TRADING SYSTEM — ARCHIVO HISTÓRICO (detalle completo pre-poda)

> **Qué es este archivo:** el CHANGELOG principal (`CHANGELOG_PEI_trading_v4_3.md`) se poda cada tanto para que no se vuelva ilegible — se borra el detalle narrativo de sesiones ya cerradas y solo queda una fila en su "Historial comprimido de sesiones". Este archivo es la red de seguridad de esa poda: **antes de comprimir algo en el changelog principal, el texto completo que se va a borrar se pega acá, tal cual, con fecha.** Así, si en el futuro hace falta volver a la base de algo (por qué se tomó tal decisión, el detalle exacto de un bug viejo, un diagnóstico descartado), se puede volver a consultar en vez de haberse perdido para siempre.
>
> **Regla:** este archivo es **append-only — nunca se poda, nunca se edita el contenido ya escrito.** Solo crece. Cada poda agrega una sección nueva "## Poda YYYY-MM-DD", con el contenido tal cual estaba en el CHANGELOG principal justo antes de comprimirlo.
>
> **Cómo se usa:** no hace falta leerlo al empezar cada sesión (para eso está el CHANGELOG principal, podado y corto). Se consulta puntualmente cuando algo del CHANGELOG principal queda como una referencia corta ("ver Lección #1", "ver historial 26/08") y hace falta el detalle real de fondo.

---

## Poda 2026-09-08

Contenido completo de `CHANGELOG_PEI_trading_v4_3.md` tal como estaba **antes** de la poda del commit `9dbb8ea` (2026-09-08, sesión Cowork). Todo lo de acá abajo, en el changelog principal, quedó comprimido a: la sección "⚠️ LECCIONES" (para los patrones de bug que se repitieron) y filas nuevas en "Historial comprimido de sesiones" (para las sesiones del 26/08 al 07/09).

### Sesión 2026-09-08 (Cowork) — fix Max Drawdown + git tracking

#### Fix: Max Drawdown mostraba % sin sentido con pocos trades
Con solo 4 trades cargados, Métricas mostraba **Max Drawdown -108.70%** — imposible como %, pero el cálculo estaba bien: `calcDrawdown()` divide la caída (R) por el pico acumulado (R), y con un pico chico (1,84R) cualquier caída de -2R da un % gigante. No era un bug de lógica, era una unidad engañosa con muestra chica.

**Fix (`calcDrawdown` + nueva `formatDD()`):** ahora se muestra siempre el **R absoluto primero** (no depende de la escala) y el % como referencia entre paréntesis, marcando "muestra chica" (⚠ en tablas compactas) cuando el pico acumulado es menor a 5R. Ej: antes `-108.70%` → ahora `-2.00R (-108.7%, muestra chica)`. Aplicado en las 4 vistas que mostraban Max Drawdown: cards TESLA/MALETA, tabla Sesgo por Activo, panel Drawdown global y Prop Firm Challenge.

Verificado con `node --check` sobre el JS extraído del HTML — sin errores.

#### Git tracking (housekeeping de la sesión anterior, cerrado hoy)
`deploy.sh`, el CHANGELOG y `HTML- DASBOARD/NO_ABRIR_fuente_para_editar.html` quedaron versionados (antes solo vivían en el disco del Mac). De paso se tapó un agujero: `trades_*.csv` no estaba en el `.gitignore` (solo `tracker_bitacora*.csv`), así que datos de trading reales se hubieran colado al repo público. Commit `f328d96`, pusheado por Pedro desde su Terminal real.

### Sesión 2026-09-08 (cont.) — Rachas/Sesgo por Activo caían a "Cargá el CSV" en un refresh puntual

#### Reporte de Pedro
Confirmó el fix de Max Drawdown funcionando (`-2.00R (-108.7%, muestra chica)` visible en Métricas y Prop Firm). Pero mandó capturas de dos refrescos seguidos de `index.html` con los mismos 4 trades en localStorage: el primero (01:12:51) renderizaba Métricas completo; el segundo, 8 segundos después (01:12:59), mostraba Rachas y Sesgo por Activo con el placeholder "Cargá el CSV" y TESLA/MALETA en "Sin datos" — con el mismo `trades.length` de 4 (el footer seguía mostrando "4 trades cargados" y el panel Drawdown seguía dibujando la curva). O sea: no es que se perdiera el CSV — algo dentro de `renderMetricas()` tira una excepción intermitente que corta la función a mitad de camino, dejando todo lo que viene después del punto de falla en su estado placeholder por defecto. Mismo patrón que el bug de TDZ del 07/09 (`renderAll()` se cortaba a la mitad), pero esta vez adentro de una sola función que no tenía aislamiento interno.

#### Fix: `renderMetricas()` con cada bloque en su propio try/catch
No se pudo reproducir en vivo desde Cowork (sin browser real con su localStorage) para pescar el error exacto en consola, así que en vez de perseguir la causa puntual se aplicó el mismo patrón defensivo que ya usa `renderAll()`: cada bloque de `renderMetricas()` (Drawdown SVG+label, Rachas, TESLA/MALETA, Sesgo por Activo, Prop Firm, Kelly) quedó aislado en su propio `try/catch` con `console.error('renderMetricas: <bloque>', e)`. Además se agregaron guards `if (el)` antes de tocar `.textContent`/`.innerHTML` en los elementos que no los tenían.

### Sesión 2026-09-08 (cont. 2) — Root cause encontrada: TESLA/MALETA "Sin datos" + Drawdown en blanco

#### Reporte de Pedro
Después del fix de aislamiento por bloque, mandó capturas nuevas: Rachas, Sesgo por Activo y Resumen Mensual ya renderizaban bien, pero las cards de TESLA y MALETA seguían en "Sin datos" y el label de Drawdown global quedaba en blanco/"—". Pedro pidió investigar a fondo (no otro parche de superficie).

#### Investigación (Playwright headless contra el `index.html` real de Pedro)
El aislamiento por bloque del fix anterior contenía el daño pero no explicaba la causa. Se armó una reproducción empírica: se bajó el `index.html` real de Pedro, se inyectó su CSV real (4 trades) en `localStorage` vía `page.addInitScript()`, y se recargó la página 40 veces en Chromium headless capturando `console.error`/`pageerror`.

**Resultado: `ReferenceError: Cannot access 'DD_MUESTRA_CHICA_R' before initialization` en el 100% de los reloads (40/40).** Causa: al aplicar el fix de Max Drawdown de esta misma sesión, `const DD_MUESTRA_CHICA_R = 5` quedó declarada cerca de `formatDD()` (línea ~2880), muy por debajo del punto donde `restoreCSV()` corre de forma síncrona al cargar la página y dispara `renderAll() → renderMetricas() → formatDD()`. Es el mismo bug de zona muerta temporal (TDZ) que ya se había arreglado una vez para `MESES_ABREV` — con comentario explícito en el código advirtiendo sobre este patrón — y que se reintrodujo al no mover la nueva constante junto a esa convención.

El try/catch por bloque (fix anterior) atajaba la excepción en 3 puntos de `renderMetricas()` (drawdown SVG/label, tesla/maleta, prop firm — los tres únicos que llaman a `formatDD()`), dejando esos paneles en su placeholder por defecto ("Sin datos" / "—") mientras Rachas/Sesgo/Resumen Mensual (que no usan `formatDD()`) renderizaban bien.

De paso la misma búsqueda encontró un segundo TDZ pre-existente, no relacionado con este fix: `let analisisView = 'torta'` (línea 2640) también se declara después del punto de disparo síncrono, y `renderAnalisis()` puede correr en esa misma cadena — mismo riesgo, tab Análisis.

#### Fix
Se movieron ambas declaraciones (`const DD_MUESTRA_CHICA_R` y `let analisisView`) junto a `MESES_ABREV` (~línea 1539).

#### Verificación
`node --check` sin errores. Reproducción Playwright re-corrida (40 reloads, mismo CSV real de Pedro): 0/40 `ReferenceError`, 0/40 "Sin datos" en Tesla, 0/40 Drawdown en "—". Los únicos errores de consola remanentes son `ERR_TUNNEL_CONNECTION_FAILED` al CDN de Chart.js — artefacto del sandbox sin salida a internet real.

### Sesión 2026-09-08 (cont. 3) — Feature nueva: archivo permanente por mes en Firestore + pestaña Histórico

(Detalle completo de diseño de datos, implementación y verificación — ver commit `322dd70` y el mensaje de commit correspondiente, que tiene el mismo nivel de detalle. No repetido acá para no duplicar.)

### Sesión 2026-09-07 (cont.) — 6 features nuevas: ideas extraídas de ZAR Finance + Macro Argentina (Cowork)

#### Motivo
Sobre la paleta día/noche de esta misma sesión, Pedro pidió una revisión exhaustiva del changelog de ZAR Finance y de la carpeta "Macro Argentina" para extraer ideas aplicables al Trading Desk. De 6 ideas propuestas, Pedro dio luz verde a las 6 con la instrucción "de más fácil a más difícil, vemos qué nos abarca en esta sesión". Se llegó a las 6, todas construidas y verificadas (`node --check` + diff línea por línea + backup por cada una), commiteadas por separado.

#### 1. Dedup por firma en el importador CSV (`c951271`)
`parseCSV()` construye una firma (`vals.join('|')`, todas las columnas de la fila) por cada línea del CSV pegado y saltea las que ya vio dentro del mismo paste — protege contra copiar/pegar un rango duplicado desde Excel antes de exportar. El status bar muestra "(N duplicados salteados)" cuando corresponde.

#### 2. Tooltips educativos — botones ⓘ (`2be81a0`)
Sistema `INFO_TEXTS` + `showInfo()`/`hideInfo()` + overlay modal. Aplicado a 5 indicadores: Expectancy, Profit Factor, Kelly Criterion, Currency Strength Meter, RVOL.

#### 3. Panel Config editable — API keys (`a4bcd72`)
Pestaña "⚙ Config". `FINNHUB_KEY`/`TWELVE_DATA_KEY` pasaron de `const` hardcodeada a `let` con override por `localStorage`. Incluye validación en vivo de longitud de la key de Finnhub. Auditoría encontró `TWELVE_KEY` (constante duplicada, nunca usada) — eliminada.

#### 4. Histórico perpetuo de Earnings en Firestore (`1b15e2e`)
Cada Q ya reportado (`epsActual` real) que trae `fetchEarnings()` se guarda una sola vez en Firestore (`earnings_hist/{symbol}_{fecha}`, `merge:true`). Requiere que las Firestore Rules de `peisys` permitan `write` en `earnings_hist`.

#### 5. Meta de Cuenta — curva real vs. necesario (`428542a`)
Card en Métricas: nombre + monto objetivo en R + fecha inicio + fecha objetivo (localStorage). Gráfico SVG a mano con la recta "necesario" vs. curva real, y aviso de ritmo.

#### 6. Proxy CORS opcional (Cloudflare Worker) — arregla HSTECH/MOEX/CSI300 (`37a1e8a`)
`cloudflare_worker_proxy.js`: Worker con allowlist cerrado a `query1/query2.finance.yahoo.com`, cache de 60s, manejo de preflight CORS. Campo nuevo en Config para la URL del proxy. Pendiente que Pedro lo deploye (instrucciones en el propio archivo).

### Sesión 2026-09-07 (cont. 2) — Equity Curve y P&L por Activo a Chart.js (`2bb35c8`)
Chart.js v4.4.4 vía CDN. Equity Curve y P&L por Activo migrados de SVG/HTML a mano a `<canvas>` + Chart.js, con gradientes y tooltips. `cssVar(name)` — helper para resolver colores de tema una vez al renderizar (canvas no es reactivo a CSS vars). Listener de `matchMedia('(prefers-color-scheme: dark)')` para re-renderizar si cambia el tema del SO en vivo.

### Sesión 2026-09-07 (cont. 3) — Fix crítico: un chart roto tumbaba toda la tabla de Trades y Métricas (`1909d94`)
`renderAll()` llamaba cada función en secuencia sin try/catch individual — si `new Chart(...)` tiraba excepción (CDN no cargado), todo lo que venía después en la lista nunca se ejecutaba. Fix de dos capas: (1) `renderAll()` itera un array de funciones con try/catch individual en cada una; (2) guard explícito `typeof Chart === 'undefined'` en `renderEquity()`/`renderActivoBars()`.

### Sesión 2026-09-07 (cierre) — Chart.js resuelto solo, CSV cargado OK, se agregó "Pegar CSV"
10 commits del día, todos pusheados. El bug de charts en blanco se resolvió solo (probablemente CDN cacheando mal la primera vez). CSV de 4 operaciones cargado y verificado en vivo, matchea con el cálculo a mano. Bug real arreglado (`de8070d`): "CSV Manual" no volvía a disparar si Pedro elegía el mismo archivo dos veces seguidas (el evento `change` no se dispara si `value` no cambió) — fix: resetear `input.value` después de leer. Feature nueva: botón "📋 Pegar CSV" — modal con textarea para cargar el CSV pegando texto directo.

**Contexto de negocio:** Pedro pidió automatizar la carga de trades para no perderlos por estar corriendo entre trading/trabajo/facultad. Se investigaron 3 vías de auto-sync (CMC API: no existe para retail; MT5 API: necesita terminal local; myfxbook API: existe pero con fricción de credenciales) y se optó por un flujo manual-asistido: Pedro manda el export del historial del bróker (TradingView, que exporta a CSV limpio) y Claude reconstruye las operaciones cerradas y devuelve el CSV en el formato del importador.

### Sesión 2026-09-06 — Por qué había HTMLs duplicados: puente PEI·SYS no documentado + limpieza

Pedro reportó confusión real ("por qué carajos hay dos o más HTML"). Había 3 archivos HTML en 2 carpetas: `index.html` (producción), `HTML- DASBOARD/trading_dashboard.html` (la "fuente"), `HTML- DASBOARD/index.html` (duplicado muerto de junio). El problema de fondo: en algún momento del 06/09 se agregó el puente a PEI·SYS editando `index.html` **directamente**, sin tocar la fuente ni anotarlo — se desincronizaron sin dejar registro.

**Feature encontrada y documentada:** Puente Trading → PEI·SYS — módulo Firebase que en cada `renderAll()` calcula rachas/WR/PnL y los escribe en `resumen_trading/actual` (Firestore, proyecto `peisys`), solo escritura. Commit `154f024`.

**Acción tomada:** se copió `index.html` → la fuente (dirección inversa a la normal, porque acá `index.html` era la versión correcta). Se eliminaron los archivos muertos (`HTML- DASBOARD/index.html`, `_dummy_test_delete.txt`). Se renombró la fuente a `NO_ABRIR_fuente_para_editar.html` para que sea imposible confundirla con el que hay que abrir.

### Sesión 2026-09-07 — Paleta día/noche nueva, inspirada en Macro Argentina (Cowork)

Pedro pidió revisión de otros proyectos (ZAR Finance, "Macro Argentina") como fuente de ideas y cambiar los colores del dashboard. `macro_argentina.html` resultó la mejor referencia: paleta oscura técnica, celeste como acento. Se reemplazaron únicamente los 2 bloques `:root` (claro y `@media (prefers-color-scheme: dark)`) — 17 variables de color en cada modo, mismos nombres, sin tocar el resto del archivo. Nuevo modo día: gris-azulado frío `#f4f6f9`, acento celeste `#2f7bb8`. Nuevo modo noche: `#0a0e14`/`#131922`, acento celeste `#5ba3d9`. Colores NO tocados a propósito: paleta categórica del gráfico de torta y umbral de Currency Strength (son colores fijos por categoría, no de tema). Preview de swatches aprobado por Pedro antes de tocar el archivo real.

### Sesión 2026-08-28 — Dos bugs reales encontrados y resueltos: Precios forex (CORS) + showTab (Safari)

#### 1. La causa NO era Twelve Data — diagnóstico del 26/08 quedó desactualizado
El tab Precios ya no llamaba a Twelve Data para forex: se había migrado (sin documentar) a Frankfurter API. La consola mostró el error real: CORS bloqueado en `api.frankfurter.app` desde `pedritozar.github.io`. Permanente, no se arregla solo.

#### 2. Fix — reemplazo de API, mismo esquema JSON
`exchangerate-api.com/v4/latest/USD` devuelve el mismo JSON que Frankfurter — reemplazo directo sin tocar `getFXPrice()`. Verificado con fetch real desde el origin de producción vía consola del browser. Deployado (`5324558`), verificado en vivo: los 10 pares muestran precios reales.

#### 3. Hallazgos sin tocar
Tab Mercado no estaba roto — solo tarda 2-4 min por el rate-limit de Twelve Data (7 créditos/65s vs 19 necesarios). Índices tab tiene un CORS nuevo en el fallback de Yahoo Finance (HSTECH/MOEX/CSI300) — mismo patrón que Frankfurter, sin diagnosticar en profundidad ese día.

#### 4. Segundo bug real — showTab() y Safari
`showTab(tab)` usaba `event.target.classList.add('active')` con el global implícito `event`. Chrome lo tolera, Safari no en el mismo call path — tiraba `TypeError` a mitad del `onclick`, cortando antes de llegar a `initMercadoTab()`/`initIndicesTab()`/`initEarningsTab()`. Esos 3 tabs nunca disparaban la carga de datos en Safari. Fix: los 7 botones de navegación pasan el elemento clickeado como argumento explícito (`this`). Deployado en `dc58b10`, verificado en producción con clicks reales.

### Sesión 2026-08-26 — Auditoría de Excel + resumen mensual + fix Finnhub

#### 1. Excel — 5 bugs reales encontrados y corregidos
El archivo arrastraba errores silenciosos desde junio:

| Bug | Detalle | Estado |
|---|---|---|
| P&L desfasado | Fórmulas corridas 2 filas por `delete_rows` de openpyxl → ganadoras mostraban -1,00 | ✅ valores literales 2,87 / 2,91 / 2,84 |
| R/R Teórico desfasado | Mismo problema, columna K | ✅ fórmulas autoreferenciadas por fila |
| Precios sin punto decimal | `1729025` en vez de `17.29025` (6 celdas, filas 5-7) → R/R absurdos (515,92) | ✅ corregidos |
| Win Rate por activo siempre 0% | Hoja DASHBOARD comparaba col L (R/R Real) contra "GANADA" en vez de col M | ✅ |
| P&L por activo siempre 0 | Sumaba col M (texto RESULTADO) en vez de col N | ✅ |
| Drawdown Máx falso | Era copia de "Peor Trade" (`MIN` del P&L), no medía caída acumulada | ✅ columnas AUX T:V en DASHBOARD |

Además: hoja convertida en Tabla de Excel (`ResultadosTraiding`, rango B4:Q9). Bitácora reordenada cronológicamente. Hoja renombrada de `tracker_bitacora_traiding__DEFI` a `resultados traiding`.

**Verificación:** 25 chequeos automáticos, todos OK. P&L Neto +6,62R, WR 60%, Expectancy 1,324, Drawdown -1R.

#### 2. Módulo Resumen Mensual/Anual (tab Métricas)
Grilla de 12 meses con P&L en R y en % real de cuenta, semáforo verde/rojo, totales del año y botón de exportar CSV. No guarda estado propio — se recalcula desde los trades cargados (misma lección que el bug de P&L: un acumulador guardado aparte se desincroniza). El % se calcula por trade como P&L(R) × RIESGO% de esa operación.

#### 3. Fix key Finnhub — bug silencioso de meses
La key estaba guardada a medias: solo la segunda mitad (20 de 40 caracteres). Las dos mitades son casi idénticas (terminan en `m0` y `mg`). Rompía Earnings, precios S&P500/NASDAQ y calendario económico a la vez.

#### 4. Calendario económico — fuentes evaluadas y descartadas

| Fuente | Resultado |
|---|---|
| Finnhub `/calendar/economic` | ❌ "You don't have access to this resource" — premium |
| TradingEconomics | ❌ Sin tier gratis con API — desde USD 39/mes |
| Investing.com (cuenta gratis) | ❌ Cuenta de usuario final, no da API |
| TradingView (suscripción) | ❌ Solo widget embebido, sin API pública |
| FMP (Financial Modeling Prep) | ⏳ Única opción gratis pendiente de probar — 250 req/día |

#### 5. Dos bugs encontrados al verificar el deploy
**a) Bug de coma decimal ARG.** `parseFloat("+2,87")` devuelve `2` — corta en la coma. P&L Neto daba +4,00R en vez de +6,62R. Solución: `parseNumAR()`, 23 llamadas migradas.

**b) TDZ en el módulo nuevo.** `MESES_ABREV` declarada con `const` después de `restoreCSV()` — Demo vs Live y Resumen Mensual quedaban vacíos. Solución: constante movida arriba, con comentario explicando por qué.

#### 6. Otras decisiones de la sesión
Notion "HTML blocks" descartado (sandbox bloquea APIs externas). Barchart USD 10/mes no aporta (solo levanta límite de vistas). Kelly Criterion ya implementado, no duplicar en Notion. Auditoría externa futura va a pedir statements del broker o track record verificado.

---

*Este archivo se creó el 2026-09-08, junto con la poda del CHANGELOG principal (commit `9dbb8ea`). A partir de acá, toda poda futura agrega su propia sección "## Poda YYYY-MM-DD" arriba de esta línea (o abajo, según convenga cronológicamente) — nunca se borra nada de lo ya escrito.*
