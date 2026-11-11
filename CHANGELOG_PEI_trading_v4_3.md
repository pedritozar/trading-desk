# PEI TRADING SYSTEM — CHANGELOG v4.3

**Proyectos:** Trading System (Dashboard + Excel) | Cartera Real (Alfy/Notion) | Reactor Nuclear IA
**Última actualización:** 2026-11-11 (sesión Cowork, 10ma, pusheada `f80728a..e6f3ffa`: auditoría de este CHANGELOG, nuevo `REGISTRO_bugs_y_salud_del_codigo.md`, 6 `catch` vacíos de fuentes de datos ahora con log). Antes, 2026-11-09 (sesión Cowork, 9na cerrada y pusheada `69ba926..f80728a`: control de carpeta/git, revisión de bugs, `parseFechaFlex`, librerías (Chart.js 4.5.1 / Firebase 12.19.0), tipo de cambio con caché, Worker v2; antes, 30/10: sesión Cowork, 8va cerrada: reconciliación con historial CMC + reglas de riesgo + pestaña Riesgo v1 (calculadora, guardado, copiado a Excel); antes, 7ma — Escenarios: pegado texto/CSV, actualizaciones por fecha, Editar, bloque `Actualizar:`, carga histórica de Notion; pusheado `d6c6499..e62f0c9`)

> **Supersede a `CHANGELOG_PEI_trading_v4_2.md`** (podés borrarlo).
> El Reactor Nuclear IA tiene changelog propio: `CHANGELOG_reactor.md` en `Desktop/reactor IA/`. No mezclar.
> Criterio de poda: este archivo guarda **estado actual + pendientes + lecciones que evitan repetir errores**. El detalle de sesiones ya cerradas se borra — **la sección "Lecciones" es la excepción: se actualiza, nunca se poda.**
> **Antes de podar algo, el texto completo que se va a borrar acá se pega tal cual en `historicos txt/CHANGELOG_PEI_trading_ARCHIVO_HISTORICO.md`** (append-only, nunca se poda, nunca se edita lo ya escrito). Así la poda no es "borrar para siempre" — es mover el detalle a un archivo frío que se puede volver a consultar si algún día hace falta la base real de algo (por qué se tomó una decisión, el diagnóstico exacto de un bug viejo, etc.).

---

## PROTOCOLO DE INICIO DE SESIÓN

1. Adjuntar este CHANGELOG al inicio de cada chat nuevo (el `ARCHIVO_HISTORICO` NO hace falta adjuntarlo — se consulta solo si hace falta el detalle de algo puntual)
2. Cualquier IA lo lee primero antes de responder
3. Al cerrar sesión importante → actualizar y **podar** lo ya resuelto (la sección "Lecciones" nunca se poda). **Antes de borrar el detalle de una sesión, copiarlo entero a `historicos txt/CHANGELOG_PEI_trading_ARCHIVO_HISTORICO.md`** bajo una sección nueva "## Poda YYYY-MM-DD" — recién ahí se borra del changelog principal.
4. El CHANGELOG es la fuente de verdad — prioridad sobre memoria interna

---

## 🗺️ MAPA — dónde vive cada cosa (para chats nuevos; agregado 30/10)

Si algo no está en este CHANGELOG, probablemente vive en uno de estos lugares. **Antes de preguntarle a Pedro o al chat viejo, mirar acá.**

- **CMT / prop firm:** el detalle NO está en este archivo. `traiding:cmt/CHANGELOG_cmt_tutor.md` (v0.1, 12/08/2026): el **tutor CMT está sin iniciar, "en espera"** hasta que Pedro decida retomarlo en un chat dedicado; ahí están el diagnóstico de materiales y la estructura oficial del examen. Materiales en esa carpeta: `CMT PROGRAM GUIDE 2026.pdf`, Standards of Practice Handbook, `CMT_Level1_Glosario.xlsx` (también está en el Project de claude.ai), capturas del 11/08. La carpeta está en `.gitignore` (no se versiona ni se pushea). De la **prop firm de 100k** solo existe la línea "pendiente" en *Contexto del trader*: no hay estado del challenge ni plan en ningún archivo.
- **Trades de agosto (6 en Notion):** este CHANGELOG tiene el pendiente (ver 🔴 Alta prioridad). **Entrada/SL/TP de esos trades no están escritos en ningún archivo ni en Notion**: solo los tiene Pedro (broker/capturas). No hay nada más que sacar del chat viejo sobre esto.
- **Notion:** base "📊 Análisis TradingView 2026" (dentro de "📒 Bitácora Trading 2026"): 13 filas con propiedades (fecha, sesgo, resultado, notas) y **páginas de detalle vacías**; ya volcada a `ESCENARIOS_historicos_notion_30-10.txt`. La bitácora de trades de Notion es la otra fuente que hay que mantener al día junto con Excel/CSV.
- **Raíz del repo (todo lo demás):** `CHANGELOG_PEI_trading_v4_3.md` (fuente de verdad) · `RESEARCH_ideas_wallstreet.txt` (research institucional, append-only) · `ESCENARIOS_historicos_notion_30-10.txt` (bloque pegable de Escenarios; si Pedro ya lo pegó, no repetir: el pegado detecta duplicados) · `tracker_bitacora_traiding__DEFINITIVO.csv/.xlsx` · `historicos txt/CHANGELOG_PEI_trading_ARCHIVO_HISTORICO.md` (poda, append-only) · `ZAR vanguard/` (otro proyecto —Fondo de Emergencia—: no editar desde acá).
- **Firestore `peisys`:** colecciones `escenarios` (con `actualizaciones` embebidas), `riesgo_ordenes` (órdenes de la pestaña Riesgo), `riesgo_config` (doc `balances`: balance por cuenta), `trades_history`, `earnings_hist`, y el doc `resumen_trading/actual` (puente PEI·SYS). Reglas abiertas (wildcard).
- **Registro de bugs y salud del código:** `REGISTRO_bugs_y_salud_del_codigo.md` (raíz, creado 11/11): 33 bugs desde el 26/08 con causa (código / error de Claude / API / navegador / datos / proceso), cómo se detectó y cómo se arregló, conteos por mes, análisis de por qué aparecen y snapshot de salud del código. Se actualiza al cerrar cada sesión con cambios.
- **Fuera del repo:** los tests jsdom/Playwright de las sesiones (hoy `test.js`, `test2.js`, `test3.js`, `testfx.js`, `testcatch.js`, `tf.js`, `tw.mjs` en `$HOME/scratch/jd`; antes `t3`–`t9`) viven en la VM de Cowork (`$HOME/scratch/jd`), no se versionan. Lo que se verificó con ellos NO es lo mismo que verificado en el navegador real de Pedro: el CHANGELOG distingue ambos.
- **Lo que solo se dijo "de palabra" en el chat del 30/10 y NO afecta al sistema:** Pedro usa Bloomberg TV como panel visual (sin audio) al analizar y escucha música para trabajar; no hay nada que implementar.

---

## ⚠️ LECCIONES — errores que no hay que repetir

Esta sección es la excepción a la poda. Se actualiza, nunca se borra: es justo la parte que evita cometer el mismo error dos (o tres) veces.

### 1. TDZ (Temporal Dead Zone) — ya pasó TRES veces (26/08, 08/09, 22/10)
Una `const`/`let` declarada más abajo en el archivo que el punto donde `restoreCSV()` la necesita (corre síncrono apenas carga la página, y en la práctica dispara casi todo `renderAll()`) queda en zona muerta temporal: `ReferenceError` al cargar, que corta la función a mitad de camino y deja paneles enteros sin dibujar — **con los datos bien cargados**, así que parece "se perdió el CSV" cuando no es eso.
- **26/08:** `MESES_ABREV` declarada después del punto de disparo → Demo vs Live y Resumen Mensual quedaban vacíos.
- **08/09:** `DD_MUESTRA_CHICA_R` — **la reintroduje yo mismo** al agregar el fix de Max Drawdown, sin seguir esta misma regla que ya estaba documentada acá. Causó TESLA/MALETA "Sin datos" y Drawdown en blanco. La misma búsqueda encontró una tercera candidata (`analisisView`, tab Análisis) con el mismo problema, corregida en la misma pasada antes de que llegara a manifestarse.
- **22/10 (tercera vez):** al revisar con jsdom (carga simulada con CSV en localStorage) aparecieron 3 más: `TRIPLE_WITCHING_AVISO_DIAS` (banner Triple Witching vacío, era la "caja vacía" que se veía en Overview), `chartEquity` y `chartActivoBars` (gráficos sin dibujar en la primera carga). Las había introducido yo al agregar esas features sin respetar la regla. Ahora hay un bloque "Declaraciones previas a restoreCSV" junto a `bitacoraAnalisisData`; **toda declaración nueva va ahí**. **Chequeo de regresión recomendado antes de cada deploy:** cargar la página en jsdom con el CSV en `localStorage` y verificar que no aparezcan errores `before initialization` en consola (el try/catch del loop los esconde, por eso `node --check` no los ve).
- **Regla fija:** toda `const`/`let` que use CUALQUIER función llamada desde `renderAll()` (que en la práctica es casi cualquier función del dashboard) se declara ARRIBA de `restoreCSV()` — nunca cerca de donde se usa, por más prolijo que parezca en el momento. Ya hay un comentario de advertencia en el código junto a `MESES_ABREV` (línea ~1539): leerlo antes de agregar una constante nueva ahí, y agregar la constante nueva ahí mismo, no donde "queda mejor" cerca de su función.

### 2. Un render sin try/catch propio tumba todo lo que viene después
`renderAll()` y `renderMetricas()` corren varias funciones/bloques en secuencia. Si uno tira una excepción sin atrapar (un chart que no cargó, un elemento que no existe), TODO lo que está después en la lista nunca se ejecuta — y como pasa en el load de la página, da la sensación de "se borraron los datos" cuando en realidad nunca se llegaron a dibujar.
- **07/09:** `new Chart(...)` fallando (CDN no cargado a tiempo) cortaba `renderAll()` antes de llegar a la tabla de Trades y a toda la pestaña Métricas.
- **08/09:** mismo patrón puertas adentro de `renderMetricas()`, que antes era una sola función sin aislamiento interno.
- **Regla fija:** toda función/bloque de render nuevo que se agregue a `renderAll()` o a `renderMetricas()` va envuelto en su propio `try/catch` con `console.error('nombre: qué falló', e)`. Nunca agregar un paso "pelado" a esas listas — ya se hizo así con `archivarMesesCerrados()` (feature Histórico, 08/09).

### 3. Bugs silenciosos de formato/datos — no confiar en "se ve bien"
Tres bugs reales no tiraron ningún error visible, solo números plausibles pero falsos: coma decimal ARG (`parseFloat("+2,87")` devuelve `2` — P&L Neto mostraba +4,00R en vez de +6,62R), la key de Finnhub guardada a la mitad (20 de 40 caracteres, las dos mitades casi idénticas), y `change_percent` inexistente en Currency Strength.
- **Regla fija:** después de cualquier fix que toque un cálculo o un parseo, verificar contra una cuenta hecha a mano o un cálculo independiente. No alcanza con que el dashboard "se vea bien" — los tres bugs de esta lista se veían perfectamente bien.

### 4. No depender de globals implícitos en un handler (`event`, etc.)
`showTab()` usaba `event.target` sin recibirlo como argumento — Chrome lo tolera, Safari no lo garantiza en el mismo call path, y cuando falla corta el `onclick` a mitad de camino (mismo síntoma que los puntos 1 y 2: paneles que nunca cargan, sin relación con el bug real).
- **Regla fija:** todo handler recibe lo que necesita como argumento explícito (`onclick="fn(this)"`), nunca asume que un global del browser (`event`, `window.event`) va a estar disponible — y probar en Safari además de Chrome antes de dar un fix por confirmado.

### 5. No afirmar "hecho" sin leer el resultado de la escritura (nueva 30/10)
El 30/10 una corrección del CHANGELOG falló en silencio (el texto ancla no coincidía → `AssertionError`, commit vacío) y yo ya había dicho que estaba hecha. Pedro lo habría descubierto tarde.
- **Regla fija:** después de editar un archivo con un script, volver a leer las líneas cambiadas (o `grep`) y mostrar el resultado real antes de decir "hecho". Un `assert` que falla no cuenta como cambio. Mismo criterio con `git commit` (mirar `git log`/`git status`) y con cualquier push: se confirma con la salida real de Pedro (`d6c6499..e62f0c9`), no con lo que se esperaba.
- Corolario del mismo día: **nunca pegar texto en el modal "Pegar CSV" de Trades** salvo un CSV de trades (`parseCSV()` pisa `trades` y `pei_csv_backup` con cualquier cosa; guard pendiente abajo).

### 6. `col()` busca por substring: columnas con nombres parecidos se pisan (nueva 30/10)
`col(t,'riesgo')` devuelve la **primera** columna cuyo encabezado contiene "riesgo". Al sumar "RIESGO REAL%" junto a "RIESGO%", sin cambios el dashboard habría seguido usando el planificado sin avisar. Se resolvió con `riesgoDeTrade(t)` (busca explícito "riesgo real" y cae al planificado).
- **Regla fija:** antes de agregar una columna nueva al Excel/CSV, buscar con `grep` qué `col(...)` ya matchea por substring con su nombre y ajustar el código a esa columna.

### 7. Un `catch(e){}` vacío convierte un error de carga en "no hay datos" (nueva 9/11)
`restoreCSV()` envuelve `parseCSV(saved)` en un `try/catch` vacío: si la restauración tira un `ReferenceError` (TDZ), el dashboard arranca sin trades y **no deja ningún rastro**. Una prueba jsdom sin CSV guardado nunca lo detecta.
- **Regla fija:** la prueba de carga tiene que guardar un CSV real en `localStorage['pei_csv_backup']` antes de cargar la página y destapar ese `catch` (en la copia de prueba, guardar el error en `window.__restoreErr`). Está hecho en `$HOME/scratch/jd/test2.js`. **Hecho 9/11:** el `catch` ahora hace `console.error('restoreCSV: no se pudo restaurar el CSV guardado', e)`. El 11/11 se hizo lo mismo con 6 `catch` vacíos de fuentes de datos (tipo de cambio, Finnhub, MOEX ×4): ahora `console.warn` con el símbolo. Quedan 14 `catch` vacíos, todos de `localStorage` (tolerables).

### 8. Una regla escrita no alcanza: hace falta un chequeo mecánico (nueva 11/11)
El análisis de `REGISTRO_bugs_y_salud_del_codigo.md` muestra que de los 3 episodios de TDZ, **2 los reintroduje yo después de que la Lección #1 ya estaba escrita** (08/09 y 22/10). Los 5 errores propios documentados (15 % de los 33 bugs) son de dos tipos: reintroducir un bug conocido por no correr la verificación completa, y afirmar/escribir un número sin comprobarlo.
- **Regla fija:** después de **cualquier** cambio al HTML, correr `test2.js` (carga con CSV real + 13 pestañas) y ESLint (`no-undef` debe dar 0 errores) **antes** de decir que está listo; si se agregó una `const`/`let` de nivel superior, mirar que el número de avisos `no-use-before-define` no suba (hoy 30). Leer el resultado real, no suponerlo.
- Al cerrar cada sesión con cambios de código: agregar los bugs al registro y una fila al *Historial de snapshots*.

---

## Sesión 2026-11-11 (Cowork, 10ma — auditoría del CHANGELOG + registro de bugs y salud del código) — pusheada 11/11 (`f80728a..e6f3ffa`)

Pedido de Pedro (11/11 02:21): revisar si "esta sección" está desactualizada, actualizar los txt con los bugs encontrados y cómo se resolvieron, medir qué tan limpio está el código, y llevar la cuenta en el tiempo de **cada cuánto aparecen los bugs y a qué se deben** (código, error del modelo u otro). "Esta sección" no tenía adjunto: se interpretó como **todo este CHANGELOG** (si Pedro se refería a una sección puntual, decirlo).

**Hecho**
- **Auditoría del CHANGELOG.** Desactualizado y corregido: título de la Lección #1 ("DOS veces" → TRES, 26/08, 08/09, 22/10); Lección #7 pedía "loguear el catch" (ya hecho 9/11); MAPA sin el registro nuevo y con nombres viejos de tests; "Última actualización". Pendiente duplicado de claves de API unificado. El resto (lista de 13 pestañas, Estado actual, Excel, Workflows) coincide con la realidad.
- **Nuevo `REGISTRO_bugs_y_salud_del_codigo.md`** (raíz; `check_folder.sh` actualizado): 33 bugs desde el 26/08 clasificados por causa y detección, conteos por mes, análisis, snapshot de salud y protocolo para seguir llenándolo. Las clasificaciones son inferidas; no se atribuye a Claude nada que no esté documentado como suyo (los commits de abril a agosto no tienen trailer).
- **Bugs nuevos arreglados (B32):** 6 `catch(e){}` vacíos en fuentes de datos (`fetchFxRatesAll`, `fetchFinnhubPrice`, `fetchMOEX` ×2, `fetchMOEXIndice` ×2) → ahora `console.warn('… falló', símbolo, mensaje)`. No cambia el comportamiento, sólo deja rastro. Mi primer intento usó la variable `url` donde el loop usa `u` (B33), lo vi al releer y lo corregí antes de commitear.
- **Verificación:** `node --check` OK · ESLint 0 errores (30 avisos TDZ ya existentes, sin cambios) · 7 tests 0 fallas (Riesgo 25, carga con CSV real + 13 pestañas, fechas, tipo de cambio 11, catch, 13 fechas, Worker 17) · `index.html` idéntico a la fuente (`cmp`).

**Hallazgos principales**
- 33 bugs documentados: código 15 · error de Claude 5 · API 5 · datos 4 · proceso 3 · navegador 1. Mes: agosto 10, septiembre 12, octubre 5, noviembre 6.
- Aparecen **en racimos** cuando se audita (11 de 33 se hallaron por auditoría). El patrón que más repite es el TDZ (3 episodios, 6 variables) y 2 de los 3 los reintroduje yo con la regla ya escrita → Lección #8.
- Sin resolver: B14 (gráficos en blanco que se arreglaron solos, causa sin confirmar), B20 (commodities/RVOL en Mercado), B31 (re-deploy del Worker).

**Para Pedro (sin cambios respecto de la 9na):** push de los commits locales, re-deployar el Worker v2, pruebas en Safari, rotar claves, cargar los trades de agosto.

---

## Sesión 2026-11-09 (Cowork, 9na — control de carpeta/git + revisión de bugs) — CERRADA 9/11 ~19:35 ARG, pusheada por Pedro (`69ba926..f80728a`, 2 commits)

Pedido de Pedro: revisar que todo esté bien, buscar actualizaciones para los HTML, controlar que no se guardaron cosas de más y buscar/solucionar bugs.
- **Control de carpeta y git (verificado):** árbol limpio; 0 commits adelante y 0 atrás de `origin/main` (el push del 30/10 `cf16a20..69ba926` llegó); `index.html` idéntico a la fuente (`cmp`); `check_folder.sh` ✅. Solo 10 archivos versionados (856 KB): `index.html`, la fuente, CHANGELOG, `ESCENARIOS_historicos_notion_30-10.txt`, `RESEARCH_ideas_wallstreet.txt`, `cloudflare_worker_proxy.js`, `deploy.sh`, `check_folder.sh`, `.gitignore`, `historicos txt/`. Los PDFs del CMT (`traiding:cmt/`, 27 MB) y `ZAR vanguard/` viven dentro de la carpeta pero están **ignorados por git** (no se publican). Nada modificado en los últimos 10 días antes de hoy. Restos inofensivos en `.git`: 40 `stale-*` y 76 `tmp_obj_*`.
- **El CSV de la carpeta (`tracker_bitacora_traiding__DEFINITIVO.csv`, 26/08) tiene solo 5 trades** (29/05 a 17/06): lo de agosto sigue sin cargar (ver Pendientes 🔴).
- **Bug latente corregido: fechas.** Ocho lugares leían FECHA con `new Date(...)` (10 sitios en total), que solo entiende `M/D/AAAA` (como exporta hoy el Excel) e ISO. Con una fecha `D/M/AAAA` tipo `30/10/2026` daba "fecha inválida" y el trade **desaparecía de los resúmenes sin avisar**. Ahora todos usan `parseFechaFlex(v)`: igual que antes para todo lo que ya se leía bien, y además acepta D/M cuando el primer número es > 12. **Limitación conocida:** si ambos números son ≤ 12 (ej. `2/6/2026`) es ambigua y se sigue leyendo como M/D; un CSV completo en D/M dejaría esas filas en el mes equivocado. La defensa real es que el Excel mantenga un formato de fecha fijo (hoy `m/d/aaaa`).
  - Verificación (simulada en jsdom, no en el navegador real): 14 casos de la función (`tf.js`); mismo CSV en la versión anterior y la nueva: con fechas M/D resultado idéntico (5 de 5); con fechas D/M antes entraban 3 de 5 al resumen mensual y ahora 5 de 5 (`test3.js`). Regresión: `test.js` (Riesgo, 25 ok) y `test2.js` (carga con CSV real, 13 pestañas sin excepciones) siguen verdes.
- **Revisión estática:** ESLint (`no-undef`, `no-redeclare`, claves duplicadas, etc.) sin errores; 0 IDs duplicados; los 45 handlers `on*` apuntan a funciones que existen; los 30 avisos de "uso antes de definir" son falsos positivos (claves de API y datos de Histórico/Índices usados dentro de funciones que se llaman después de cargar). 
- **Hallazgos sin corregir en la primera parte** (después se resolvieron (2) librerías y (3) `catch` de `restoreCSV`, y el proxy/fuentes se revisaron: ver "Continuación" abajo; siguen abiertos (1) claves de API y (4) comprobar fuentes en vivo, que solo puede Pedro): (1) las claves de **Finnhub y Twelve Data** están escritas en el HTML público (planes gratuitos; el backlog solo mencionaba Twelve Data); (2) librerías desactualizadas y sin SRI: Chart.js 4.4.4 (hoy 4.6.1) y Firebase 10.8.0 (hoy 13.x) — no se tocaron porque no se pueden verificar sin el navegador real y Firestore; (3) `restoreCSV` con `catch` vacío (Lección #7); (4) **no se pudo comprobar** que el proxy CORS, Yahoo y MOEX respondan: la red de la VM no llega a esos dominios, queda como prueba de Pedro.
- **Continuación (9/11 tarde) — pedido de Pedro: "resolvé los bugs y avanzá con librerías, proxy y fuentes de datos":**
  - **`restoreCSV`:** el `catch` ahora hace `console.error` (probado forzando un error, `testcatch.js`).
  - **Librerías — Chart.js 4.4.4 → 4.5.1 y Firebase 10.8.0 → 12.19.0.** Se eligieron versiones maduras a propósito: ya existen Chart.js 4.6.1 (22/10) y Firebase 13.2.0 (2/11), pero son muy recientes. Las notas oficiales de Firebase no listan cambios incompatibles para las 6 funciones que usa el puente (`initializeApp`, `getFirestore`, `doc`, `setDoc`, `collection`, `getDocs`); lo que cambió en 11/12/13 es de Node, ES2020 y AI Logic. **Verificado en Chromium real (no Safari):** HTML servido bajo el dominio de Pages, Chart.js 4.5.1 real, SDK 12.19.0 real empaquetado con esbuild y fuentes de datos simuladas → 13 pestañas sin excepciones, `Chart.version` = 4.5.1, equity y barras pintados, calculadora Riesgo da 4.774 u. **No se pudo probar:** Safari, la conexión real a Firestore (red bloqueada) ni que gstatic tenga publicada la 12.19.0 (debería). Observación: con el SDK nuevo y sin red `getDocs` devolvió vacío en vez de error. **Rollback:** volver las 3 URLs (`chart.js@4.4.4`, `firebasejs/10.8.0` en las 2 importaciones).
  - **Tipo de cambio (bug de uso):** el ciclo de precios corre cada 60 s y borraba la caché en cada vuelta, pidiendo las tasas ~1.440 veces por día a `api.exchangerate-api.com/v4`; la fuente actualiza 1 vez por día y bloquea con 429 unos 20 min. Ahora hay caché de 1 hora (memoria + `localStorage['pei_fx_cache']`), el endpoint abierto vigente `open.er-api.com/v6/latest/USD` con el v4 como respaldo y, si ambos fallan, las últimas tasas guardadas. Se agregó la **atribución obligatoria** al pie de Precios ("Rates By Exchange Rate API"). 11 pruebas en jsdom (`testfx.js`). **No verificado:** que `open.er-api.com` mande CORS al navegador (por eso queda el v4 de respaldo).
  - **Proxy CORS — Worker v2 (`cloudflare_worker_proxy.js`):** caché de borde de 120 s solo para respuestas 200 (antes el `Cache-Control` solo servía al navegador), reintento en el otro host (query1↔query2) ante 429/5xx/red, solo deja pasar `/v8/finance/chart/` y solo GET/OPTIONS, errores con `no-store`. 17 casos simulados con Yahoo falso (`tw.mjs`), **no probado en Cloudflare**. **Hay que re-deployarlo a mano** (pasos en el encabezado del archivo; la URL no cambia, no se toca ⚙ Config). Motivo: Yahoo devuelve cada vez más 429 en 2026 y no publica límites.
  - **Estado de las fuentes (investigado 9/11; lo no confirmado figura como tal):** Twelve Data Basic = 8 créditos/min y 800/día (el código ya usa 7/min: OK). Finnhub gratis ≈ 60 llamadas/min (si el calendario de earnings sigue siendo gratis: no confirmado; en uso real funcionaba). MOEX ISS: datos con retraso gratis, sin autenticación informada, sin cambios confirmados. Yahoo: sin límites publicados, más 429. Investing.com (iframe del calendario macro): sin información; solo se comprueba mirándolo. **Desde la VM no se pudo consultar ninguna fuente en vivo.**
  - **Pruebas (herramientas):** en el Mac, `$HOME/scratch/jd/` → `testfx.js`, `testcatch.js`, `tw.mjs`. La prueba en Chromium real vive en la nube y es efímera: se rehace con Playwright sirviendo el HTML en `https://pedritozar.github.io/trading-desk/`, `npm i chart.js firebase esbuild` y empaquetando el SDK con `esbuild --bundle --splitting` para servirlo en lugar de gstatic.
- **Herramientas de prueba (fuera del repo, en el Mac):** `$HOME/scratch/jd/` → `test.js`, `test2.js`, `test3.js`, `tf.js`, `eslintrc.json`.

---

## Sesión 2026-10-30 (Cowork, 8va — chat nuevo dedicado a trading) — CERRADA 17:40 ARG, pusheada por Pedro el 30/10 (`cf16a20..69ba926`, 4 commits)

Contexto: chat nuevo dedicado a todo lo de trading; el chat viejo no tiene nada más pendiente (confirmado por Pedro; ver MAPA). **Pruebas en el navegador real (capturas de Pedro):** "＋ Actualización" OK (se guarda, chip "Últ. actualización hoy", desplegable con link). **Siguen sin probar:** Editar GBPCHF → Creado 02/10/2026 (en la captura seguía "creado hoy") y el pegado de `ESCENARIOS_historicos_notion_30-10.txt` (los contadores seguían en 0).

- **La fuente de verdad de los trades es el historial del broker, no Notion.** La base "Trades 2026" de Notion tiene solo propiedades + capturas: Entrada/SL/TP están dentro de las imágenes (la propia Bitácora dice que lo numérico vive en el Excel). Desde la VM de Cowork no se pueden bajar esas imágenes (el proxy bloquea el host de archivos de Notion, 403): hay que pegar las capturas en el chat o pasar el historial del broker.
- **Historial CMC Demo (capturas de Pedro 30/10; ventana visible 30/07–30/10, con huecos).** Cada monto se chequeó contra precio × unidades. R/R y R: cálculo de Claude.

| Apertura | Activo | Unid. | Entrada / SL / TP | Salida | Resultado | En Notion |
|---|---|---|---|---|---|---|
| 20/08 09:43 | NZD/CAD short | 16.791 | 0,81970 / 0,82047 / 0,81403 | cierre no visible | ? | no está |
| 20/08 21:31 | EUR/JPY short | 4.106 | 185,857 / 187,970 / 181,970 | cierre no visible | ? | dice 28/8→4/9 GANADA (fecha no coincide) |
| 25/08 10:11 | AUD/USD short | 800 | 0,71594 / 0,71710 / 0,71180 | SL 0,71710 (22:30) | −0,93 USD · −1R · R/R teórico 3,57 | PERDIDA (coincide) |
| 08/09 16:13 | Oro (Gold Cash) buy | 1 | 4.372,62 / 4.352,78 / 4.426,26 | SL ejecutado 4.345,60 (17:49) | −27,02 USD · −1,36R (deslizamiento) · R/R teórico 2,70 | fecha 5/8, resultado 09/09 (no coincide) |
| 22/09 02:50 | NZD/CAD short | 802 | 0,80502 / 0,80633 / 0,80025 | SL 0,80633 (05:52) | −0,75 USD · −1R · R/R teórico 3,64 | "short order / SIN entrada oficial" pero SÍ se ejecutó |
| 08/10 03:59 | Petróleo WTI Dic-26 short | 9 | 90,010 / 90,011* / 87,000 | stop 90,043 (mismo segundo) | −0,30 USD (≈ breakeven) | EN CURSO (nunca se cerró) |
| 13/10 08:38 | NZD/CAD short (a mercado) | 16.800 | 0,79973 / sin SL | cerrado 6 s después a 0,79998 | −2,96 USD | no está |
| 30/10 16:14 | USD/NZD buy limit | 500 | 1,76659 / 1,75438 / 1,79460 | PENDIENTE (sin ejecutar) | — (R/R 2,29) | no está |

  *Petróleo: SL original 90,530 (TP 86,830); el 06/10 08:18 Pedro movió el SL a 90,011 (= entrada) ANTES de que la orden se ejecutara, por eso se activó y se cerró en el mismo segundo. Con el SL original el riesgo era ≈ 4,68 USD → ≈ −0,06R. **Verificado con 3 capturas de TradingView de Pedro (30/10, modo replay, TVC CFD WTI 1h):** (a) recortado al 06/10 ~12:00 el precio tocó ≈86,9 → la zona objetivo 86–87 / TP 87,00 SE CUMPLIÓ el 06/10, ANTES de que la orden del broker se ejecutara; (b) recortado al 08/10 el precio subió de ≈88 a ≈92,8, muy por encima del SL original (90,53 en CMC / 90,20 en TV) → mover el SL a la entrada evitó una pérdida de ≈ −1R (≈ −4,7 USD en vez de −0,30). **Matiz:** la orden Sell Limit quedó viva ~2 días después de cumplido el objetivo y se ejecutó recién el 08/10 en un rebote contra la tesis; lo correcto era cancelarla al cumplirse el escenario. Además el gráfico de TV (TVC CFD WTI) no es el mismo instrumento que el contrato de CMC (WTI Dic-26) y los precios difieren unas décimas, lo que probablemente explica la "diferencia de posiciones" (posición de papel ejecutada en TV, orden del broker no): hipótesis de Claude, no verificada. Mover el SL a la entrada ANTES de la ejecución protegió esta vez, pero es una muestra de un solo trade. El escenario va a Escenarios como cumplido; el trade del broker queda BREAKEVEN. Notion: pasar de EN CURSO a BREAKEVEN (pendiente, lo hace Pedro o se le pide permiso).
- **Huecos del historial CMC:** falta el tramo 25/08→08/09 (cierres de NZD/CAD y EUR/JPY abiertos el 20/08) y 30/07→20/08 (GBP-AUD 11/8, SPY500 13/8, oro "5/8" de Notion). CMC solo muestra ~3 meses: capturar/exportar antes de fines de noviembre. No se confirmó si hay exportación a CSV. Cuenta CMC al 30/10: Account Value = Cash = 10.166,93 USD, margen 0, sin posiciones abiertas.
- **MT5 Demo (EUR/USD 12/08 y anteriores):** se borró. La doc de MetaTrader dice que una demo vencida se borra del Navigator y su historial deja de verse; el plazo lo fija cada broker (p. ej. Pepperstone: 60 días). Falta saber con qué broker es la MT5 Demo de Pedro. Del EUR/USD solo quedan las capturas de Notion. Hábito sugerido: exportar el historial cada mes antes del vencimiento.
- **RIESGO%: el del Excel es el PLANIFICADO, no el real.** Pedro saca el real de las calculadoras de myfxbook; a veces, si el precio ya está cerca del punto de entrada, pone la orden sin calculadora y calcula a mano rápido. Reglas de riesgo de Pedro: 0,33–0,50% por trade, hasta 1% de la cuenta; **tope 1% diario**; puede desglosar ese presupuesto por día/semana (pendiente que lo defina).
- **Riesgo real en CMC (sobre 10.000 USD; unidades × distancia al SL):** AUD/USD 25/08 ≈ 0,009% · NZD/CAD 22/09 ≈ 0,008% · petróleo ≈ 0,05% (con SL original) · NZD/CAD 20/08 ≈ 0,09% (estimado, CAD→USD ≈ 0,72) · oro ≈ 0,20% · EUR/JPY 20/08 ≈ 0,55% (estimado). Solo oro y EUR/JPY se acercan al rango planificado.
- **Consecuencia en el dashboard:** el Resumen Mensual/Anual calcula el % de cuenta como P&L(R) × RIESGO% de cada trade (`parseRiesgo`), o sea que con RIESGO% planificado sobreestima el % real. Las R no cambian (se calculan por distancia de precio).
- **Hallazgo menor en el Excel:** la hoja 🚀 TESLA quedó con la ficha del USD/MXN 02/06 con SL/TP sin punto decimal (`1727664`, `1733222` en vez de 17,27664 / 17,33222) y entrada 17.129 (la bitácora dice 17,29025). No se verificó si alimenta algo.
- **Pestaña "Riesgo" v1 construida (30/10, commit local, sin pushear; NO probada todavía en el navegador real de Pedro).** Alcance acordado con Pedro: calculadora + guardar órdenes + copiar fila para Excel. Lo que hace:
  - **Calculadora:** unidades = riesgo USD ÷ (distancia al SL × valor por unidad). Cuenta (CMC/MT5 Demo/Live) con **balance tipeado y guardado por cuenta** (localStorage + Firestore `riesgo_config/balances`). Tipo de cotización autodetectado por el activo (cotizado en USD → valor 1; USD primero → 1÷entrada; cruce → Pedro tipea el valor en USD de la moneda cotizada, ej. CAD→USD). Redondea siempre **hacia abajo** (el riesgo real nunca pasa del objetivo). Muestra riesgo USD, distancia, unidades, lotes FX (100.000 u. = 1), R/R, ganancia al TP y semáforo (>1% rojo, >0,50% amarillo). Si se tipean las unidades realmente usadas, muestra el riesgo real. Valida que SL/TP estén del lado correcto.
  - **Guardar órdenes:** Firestore colección `riesgo_ordenes` (id = `Date.now()`), con estado pendiente/ejecutada/cancelada editable, sistema, tipo y nota. Guarda riesgo planificado y **riesgo real** (USD y %).
  - **Copiar para Excel:** dos botones por orden. "B→J" copia FECHA, ACTIVO, SISTEMA, TIPO, DIR, ENTRADA, SL, TP, RIESGO% (decimales con coma; no toca K–N, que son fórmulas/datos). "Q→S" copia CUENTA, RIESGO REAL%, UNIDADES.
  - **Dashboard:** nueva `riesgoDeTrade(t)`: el % de cuenta de Resumen Mensual/Anual usa la columna "RIESGO REAL%" si existe y tiene valor; si no, el RIESGO% planificado (comportamiento anterior intacto). Sin esa función el dashboard habría seguido usando el planificado aunque existiera la columna nueva, porque `col(t,'riesgo')` devuelve la primera columna que contiene "riesgo".
  - **Verificado en simulación, no en el navegador real:** `node --check` de los dos bloques `<script>` OK; 25 pruebas en jsdom con Firestore y portapapeles simulados (autodetección, cruce, guardado, recarga, estado, copiado, validaciones, `riesgoDeTrade`); la matemática reproduce los 6 ejemplos de la página de Notion (con piso: NZD/CAD 35.182 u. y EUR/JPY 2.470 u., Notion redondeó a 35.183 y 2.471). `index.html` idéntico a la fuente (`cmp`); `check_folder.sh` OK.
  - **Para que funcione completo, Pedro agrega al Excel** (a la derecha de Q CUENTA) las columnas **R "RIESGO REAL%"** y **S "UNIDADES"** a la tabla `ResultadosTraiding`, formato porcentaje con 3 decimales en R (`parseRiesgo` toma un número sin % menor a 0,1 como fracción: "0,05" sin % se leería como 5%).
  - **Pruebas pendientes de Pedro (Safari, tras el push):** pestaña Riesgo → elegir CMC Demo, escribir balance (se guarda al salir del campo) → USD/NZD short entrada 1,76659, SL 1,7788 → debe dar 4.774 u. con 0,33%; guardar la orden, recargar la página y ver que sigue ahí; "B→J" y "Q→S" y pegar en el Excel.
- **Trades de agosto: todavía sin cargar al Excel/CSV.** Falta el hueco del historial, sistema (TESLA/MALETA) y tipo (intraday/scalping/swing) de cada uno, y que Pedro confirme cargar TODOS los trades ejecutados en el broker (recomendación de Claude).

### Cierre de la sesión 9na (9/11 ~19:35 ARG) — estado final y qué sigue

*Repo al cierre: pusheado hasta `f80728a`; el commit que actualiza este CHANGELOG puede quedar 1 adelante (solo texto) y viaja en el próximo push. `index.html` == fuente, `check_folder.sh` ✅. Todo lo de esta sesión se verificó en simulación (jsdom, Chromium de la nube, Worker con Yahoo falso), **nada en Safari ni contra las fuentes reales**.*

**Orden sugerido para el próximo chat (adjuntar este CHANGELOG):**
1. **Pedro, ya en vivo (recarga dura Cmd+Shift+R):** probar en Safari lo de "Pedro, en Safari tras el push" (Pendientes 🟡) y **re-deployar el Worker v2** en Cloudflare. Probar también la pestaña Riesgo (caso USD/NZD = 4.774 u.) y agregar al Excel las columnas R "RIESGO REAL%" y S "UNIDADES".
2. **Decisión de Pedro:** claves de API de Finnhub y Twelve Data en el HTML público → ¿rotarlas y pasarlas a ⚙ Config? (no se tocó).
3. **Datos de agosto (bloquea cargar trades):** capturas del historial CMC 25/08→08/09 y 30/07→20/08, sistema/tipo de cada trade y OK para cargar TODOS los ejecutados. Ver cierre de la 8va, puntos 2 a 6, que siguen vigentes.
4. **Opcionales sin OK:** guard de `parseCSV()`, detección del formato de fecha del CSV completo (D/M vs M/D), Chart.js 4.6.1 / Firebase 13.x cuando tengan más de un mes, `integrity` (SRI) en los CDN.
5. **Aviso permanente:** cargar los trades reales va antes que más herramientas (pedido de Pedro).

### Cierre de la sesión 8va (30/10 ~17:40 ARG) — estado final y qué sigue

*Estado del repo al cierre: 4 commits locales, **pusheados por Pedro el 30/10 (`cf16a20..69ba926`)** (`5204ca4` sesión/riesgo, `b965f61` petróleo verificado, `85202b6` pestaña Riesgo v1, y el commit de cierre de este CHANGELOG). Árbol limpio, `check_folder.sh` ✅, `index.html` idéntico a la fuente (`cmp`). Locks de git del commit movidos a `.git/stale-*`. Pedro pushea con `cd ~/Desktop/trading-desk` y `git push origin main`.*

**Descubierto / decidido en la sesión (para no volver a averiguarlo):**
- **La fuente de verdad de un trade es el historial del broker (CMC), no Notion ni el Excel.** El Excel guarda lo *planificado*; el real sale del broker (o de myfxbook). Notion no tiene niveles numéricos. Reconciliación de 8 trades CMC vs Notion en la sección de arriba (fechas de oro y EUR/JPY, NZD/CAD 22/09 mal rotulado, trades no registrados, USD/OIL "EN CURSO" desactualizado).
- **El historial de CMC llega a ~3 meses; el de MT5 Demo se borró** (Pedro cree que es por vencimiento de la demo al mes: *hipótesis, no verificada*, depende del broker). Hay que bajar/guardar el historial CMC antes de que venza.
- **Reglas de riesgo de Pedro:** 0,33–0,50% por trade, hasta 1% como excepción; tope 1% diario (puede desglosarse por día/semana). A veces calcula a mano rápido sin calculadora, por eso el riesgo real puede diferir del planificado. Cálculo a mano documentado en Notion: "🧮 Calculadora de tamaño de posición (a mano)" (borrador privado, id `409cc364-eb92-8122-8185-f3305995c7cb`; moverlo bajo la Bitácora).
- **Redondeo:** la calculadora redondea hacia abajo; la página de Notion redondeó al más cercano (35.183 y 2.471 vs 35.182 y 2.470). Diferencia de una unidad, intencional.
- **Las imágenes de Notion no se pueden bajar desde la VM** (el proxy responde 403): las capturas hay que pegarlas en el chat.
- **jsdom funciona en el Mac de Pedro:** `npm i jsdom` en `$HOME/scratch/jd` anduvo. La prueba de la pestaña Riesgo está en `$HOME/scratch/jd/test.js` y los fragmentos de código en `$HOME/scratch/rg/` (fuera del repo, no se versionan).
- **Petróleo 08/10 verificado con 3 capturas de TradingView:** el objetivo se alcanzó el 06/10 antes del fill; poner el SL en la entrada evitó ≈−1R; la orden pendiente quedó viva ~2 días. Lección de proceso: cancelar la orden pendiente cuando el escenario ya se cumplió. Muestra de 1 trade; hipótesis de diferencia de contrato TVC vs CMC.

**Orden sugerido para el próximo chat (adjuntar este CHANGELOG):**
1. **Pedro:** (a) ~~`git push origin main` (4 commits)~~ **hecho 30/10**; (b) agregar al Excel, a la derecha de Q CUENTA, las columnas **R "RIESGO REAL%"** (formato % con 3 decimales) y **S "UNIDADES"**; (c) probar la pestaña Riesgo en Safari (recarga dura): CMC Demo + balance → USD/NZD short entrada 1,76659, SL 1,7788 → 4.774 u. al 0,33%; guardar, recargar y ver que sigue; copiar "B→J" y "Q→S" y pegar en el Excel. Si algo falla, captura.
2. **Pedro manda los datos de agosto (bloquea cargar los trades):** capturas del historial CMC 25/08→08/09 y 30/07→20/08 (filtro Type = Trade; ver si hay ícono de exportar); sistema (TESLA/MALETA) y tipo (intraday/scalping/swing) de cada trade; OK para cargar TODOS los trades ejecutados en el broker (incluido el NZD/CAD de 6 segundos y los no registrados); opcional: historial de MT5 Demo y EUR/USD 12/08.
3. **Claude, con eso:** cargar los trades al Excel + CSV (pegar B–J y Q–S por separado para no pisar las fórmulas de K–N), recalcular el dashboard, y armar el bloque pegable de Escenarios del petróleo (cumplido, Creado 05/10/2026, link `https://www.tradingview.com/x/qumDgzz3/`).
4. **Pruebas de la 7ma que siguen abiertas:** Editar GBPCHF → Creado `02/10/2026`; pegar `ESCENARIOS_historicos_notion_30-10.txt` ("11 listos") con el filtro en "todos".
5. **Notion (Pedro, o Claude con permiso):** USD/OIL-WTI "EN CURSO" → BREAKEVEN (fin 08/10); NZD/CAD 22/09 "short order / SIN entrada oficial" → ejecutado en CMC Demo; fila GBPCHF (Cuenta/Estado/Sistema); mover la página de la calculadora.
6. **Datos de escenarios sin responder:** USD/MXN 17/06 (SL vs "Cumplió Sí"), GBP/CAD 19/03 ¿trade real?, EUR/USD 10/03 4H vs D1, ¿"Parcial" cuenta como acierto?, y las actualizaciones de GBPCHF (02/10, 15/10, 29/10, 30/10: texto + link TradingView).
7. **Riesgo v2:** presupuesto diario/semanal contra el tope de 1% (decidir si las pendientes cuentan y cómo reparte Pedro el 1%), TC automático para cruces, borrar/editar órdenes, riesgo real de operaciones pasadas desde el broker.
8. **Higiene y backlog:** igual que el cierre de la 7ma (guard de `parseCSV()`, blindaje contra borrado de historial de Safari, sacar el `--force` de `deploy.sh`, limpiar `.git/stale-*`, key de Twelve Data, FedWatch, bonos globales).
9. **Aviso permanente:** cargar los trades reales va antes que más herramientas (pedido explícito de Pedro de que se lo recuerde).

---

## Sesión 2026-10-30 (Cowork, 7ma) — Pegado de escenarios (texto/CSV) + actualizaciones/Editar + carga histórica de Notion + diagnóstico de borrado de historial en Safari — CERRADA, pusheada 30/10 (`d6c6499..e62f0c9`)

Contexto: Pedro mostró (30/10) capturas del dashboard en su navegador real: la pestaña **Escenarios** y la card **Clase de activo** en Config ya aparecen tras el push del 22/10, pero el pie decía **"Sin datos cargados"** y la card de Clase pedía cargar el CSV → el CSV (`pei_csv_backup`, localStorage) se había borrado. Pedro suele **borrar el historial de Safari (no el caché)**.

- **Diagnóstico (sin código todavía):** todo lo de Config + el CSV viven en localStorage (`pei_csv_backup`, umbrales, mensajes, mapa de clases, meta de cuenta, cuenta/clase activa, `pei_commodities_history`, `pei_bonos_history`). Una respuesta de la comunidad de Apple indica que "Borrar historial" en iPhone también borra los datos de sitios web, y que en Mac con Option el menú pasa a "Clear History and Keep Website Data" (NO verificado por mí; la página oficial de Apple no lo confirma). Safari además aplica el tope de 7 días a los datos de sitios sin interacción. Se SALVA lo que está en Firestore: escenarios, bitácora de análisis, histórico archivado, earnings. Lo ÚNICO irrecuperable: el historial acumulado de Commodities/Bonos (el CSV maestro y el Excel están en la carpeta). Las API keys de la captura son los defaults del archivo (no se pierde nada). **Blindaje propuesto y pendiente de OK de Pedro:** (1) auto-respaldo a Firestore (colección nueva, sin tocar reglas) de CSV + ajustes + historial Commodities/Bonos, SIN API keys, con rotación actual/previo y restauración automática si falta el CSV local; (2) botón Exportar/Importar respaldo JSON en Config; (3) aviso visible cuando no hay datos. Costo a informar: reglas de Firestore abiertas → el CSV (cuentas demo) quedaría legible para quien conozca la config del proyecto.
- **Pegado de escenarios (nuevo):** card "Pegar escenarios" en la pestaña Escenarios, entre "Nuevo escenario" y la lista. Acepta (a) bloques `Campo: valor` (uno por escenario; empieza con `Activo:` o se separa con `---`; tesis multilínea; cercos ``` ignorados; el valor de Activo se corta en el primer hueco de 2+ espacios, así se pega tal cual el bloque que genera Claude) y (b) CSV con encabezado (`;`, tab o `,`, con comillas). Alias de campos (par/ticker, sl/stop, tp/target, tf, etc.), sinónimos de sesgo (long/short/bull/bear), de temporalidad (diario, 1h, h4...) y de estado. Obligatorios: Activo, Tesis, Invalidación. **Vista previa antes de guardar** (tabla con ✓ listo / ⚠ duplicado / ✕ error + avisos), botón "Guardar N", "Insertar plantilla" y "Limpiar". Campo opcional **`Creado: dd/mm/aaaa`** para cargar anotaciones atrasadas con su fecha real (se ordena por esa fecha). Duplicado = mismo activo + temporalidad + sesgo + entrada (contra lo ya guardado y dentro del mismo pegado) → se omite. Ids `Date.now()+i` (sin colisiones), candado anti doble clic, si Firestore falla conserva el texto. Sin constantes de nivel superior (mapas dentro de las funciones, evita TDZ); solo `let escPegadoItems/escPegadoGuardando` declaradas arriba junto a `escenariosFiltro`. Test jsdom (scratch, no está en el repo) con 42 verificaciones OK + regresión de carga/TDZ, clase, escenarios y tanda 2 sin errores; flujo completo verificado también en Chromium real (Playwright).
- **Arreglo de usabilidad (mismo día, tras el reporte de Pedro "no guarda nada"):** el botón Guardar nacía `disabled` (se habilitaba recién tras Analizar) y un botón deshabilitado no da ninguna señal → Pedro lo tocó sin respuesta. Ahora (a) el análisis corre SOLO al pegar/escribir (evento `input`, debounce 350 ms; vaciar el texto limpia la vista previa), (b) Guardar NUNCA está `disabled` (se atenúa con opacity .5 si no hay nada listo), (c) tocar Guardar sin haber analizado el texto actual analiza, muestra la vista previa y pide tocar Guardar de nuevo, (d) "Insertar plantilla" analiza al insertar. Diagnóstico: en Chromium real el flujo anterior funcionaba end-to-end, por eso la causa más probable fue el botón deshabilitado; NO se pudo probar en Safari (si Analizar tampoco responde en Safari, pedir el error de la consola de JavaScript). **Lección de UX:** no usar `disabled` en acciones principales sin explicar por qué; preferir atenuar + mensaje al tocar.
- **Casi-accidente a evitar:** Pedro pegó un escenario en el modal "Pegar CSV" de TRADES (arriba); `parseCSV()` reemplaza `trades` entero y pisa `pei_csv_backup` con cualquier texto → con ese texto habría perdido los 5 trades. No ocurrió (lo frené). **Pendiente (OK de Pedro):** que `parseCSV()` rechace el texto si no hay encabezado con FECHA y ACTIVO y no toque `trades` ni el backup en ese caso.
- **Estado de Git al 30/10 14:57:** al clonar origin/main se vio que el commit `0bde108` (pegado) todavía NO estaba pusheado — Pedro estaba probando su copia local de `index.html`.
- **GBPCHF (2/10, long 4H, entrada 1,08917 / invalidación 1,08390 / objetivo 1,10723, riesgo 0,33% de 10k USD, R/R 3,43):** Pedro confirmó que **NO se tomó en el broker** (no dejó orden pendiente) → es solo **escenario** (posición de papel en TradingView), no va al CSV de trades. Ojo: Pedro tipeó stop 1,08930 (queda sobre la entrada de un long = inválido); el gráfico muestra 1,08390. En Notion figura Cuenta CMC Demo / EN CURSO / TESLA; corresponde "SIN entrada oficial" / "Operacion traidingview" y el gráfico usa el indicador "Maleta Abdelrock Emas" → sistema MALETA (pendiente que Pedro decida si lo corrijo en Notion).
- **Notion vs mis pendientes de agosto:** Notion muestra 6 trades de agosto con resultado (no 3): gold-usd 5/8 PERDIDA, GBP-AUD 11/8 PERDIDA (SWINGTRADE), EUR/USD 12/8 GANADA, SPY500 13/8 PERDIDA, AUD/USD 25/8 PERDIDA, Eur/jpy 28/8→4/9 GANADA (SWING TRADE). Notion los marca todos TESLA (el CHANGELOG decía AUD/USD MALETA). Falta que Pedro confirme cuáles se ejecutaron en el broker vs de papel, y sistema/tipo (los swing deberían ser MALETA/swing). USD/OIL-WTI (5/10) figura EN CURSO con fecha fin 6/10 → ¿cerrado?
- Pedro cargará GBPCHF a mano en Escenarios mientras tanto; después prueba el pegado.
- **Actualizaciones de escenario + Editar + bloque `Actualizar:` (mismo día, pedido de Pedro: "como en Notion, por fechas, con capturas"):** cada escenario tiene ahora `actualizaciones: [{id, fecha, texto, link, registrado}]` **embebidas en el mismo doc** de Firestore (`escenarios`; sin subcolecciones ni Storage). Imagen = **link de TradingView** por actualización (decisión de Pedro; no se suben archivos). En la tarjeta: botón "＋ Actualización" (fecha dd/mm/aaaa editable, nota, link), línea de tiempo desplegable (más reciente arriba, borrar con confirm), chip "Últ. actualización hace N d" / "Sin actualizaciones · creado …" y aviso "⚠ sin revisar" si un escenario **vigente** pasa de 7 días sin actualizar (`DIAS_SIN_REVISAR = 7`). Botón **Editar** (activo, TF, sesgo, niveles, tesis, link y **fecha de creación**) → sirve para corregir GBPCHF a 02/10/2026. Pegado: bloque `Actualizar: ACTIVO` (+ `Fecha:`, `Link:`, `Texto:`, opcional `Temporalidad:`) se asocia al escenario **vigente** de ese activo; error claro si no hay ninguno o si hay varios sin Temporalidad; detecta duplicados (día+texto+link); varias actualizaciones al mismo escenario = **una sola escritura**; un mismo pegado puede traer **escenario nuevo + su historial atrasado** (Creado: + N bloques Actualizar). Todo texto/links escapados (XSS) y links solo http(s).
- **Bug cosmético corregido en el test:** plural "actualizaciónes" (con tilde) en el mensaje de guardado/vista previa → ahora "actualización/actualizaciones".
- **Carga histórica de la base Notion "Análisis TradingView" (30/10, pedido de Pedro: "que queden registrados los puros análisis en sus meses"):** se leyeron las 13 filas por la API de Notion (las páginas de detalle están VACÍAS: no hay niveles ni capturas, solo propiedades). Se armó `ESCENARIOS_historicos_notion_30-10.txt` con **11 bloques** (excluye GBPCHF, que ya está cargado, y la fila vacía "SPY500"): `Creado:` = fecha de Notion (feb–jun 2026), `Estado:` mapeado desde Resultado (TP / Parcial TP → cumplido; SL → invalidado; Indefinido → archivado), `Invalidación: No registrada` (el campo es obligatorio y Notion no tiene niveles), y el resultado original va al final de la tesis como `[Notion: Resultado X · Cumplió Y]`. Temporalidad solo donde Notion la dice (BRENT D1; Russell, S&P y EUR/USD 10/03 en 4H); el resto queda en D1 por defecto (aviso "sin temporalidad"). **Dudas marcadas:** USD/MXN 17/06 tiene Resultado SL pero Cumplió ✅ Sí (contradictorio; se cargó invalidado); GBP/CAD 31/03 avisa que el 1er escenario (19/03 → TP 25/03) puede ser trade REAL a verificar en broker; EUR/USD 10/03 dice "4H/D1" (se cargó 4H).
- **Cambio en la clave de duplicado (`escClave`)**: si el bloque trae `Creado:` explícito, el **día** forma parte de la clave → dos análisis del mismo par y sesgo en fechas distintas ya no se marcan como duplicado (EUR/USD 23/02 y 10/03, GOLD 01/03 y 16/03, USD/MXN 02/06 y 17/06). Sin `Creado:` todo sigue igual (probado: t9 11/11 sin falsos duplicados, re-pegar = 11 duplicados, regresión t5–t8 OK). `check_folder.sh`: se agregó el .txt a la lista blanca.
- **Verificación (jsdom, `$HOME/scratch/jd/t8.js`, 49 checks OK / 0 fallas) + regresiones t3–t7 sin errores; `node --check` OK en ambos `<script>`.** Aprendizaje de herramienta: `device_bash` rechaza comandos muy largos (E2BIG) → scripts grandes en fragmentos `cat > fichero <<'EOF'`.

### Cierre de la sesión 30/10 — estado final y qué sigue (para el próximo chat)

*Cerrado: 2026-10-30 ~15:40 ARG, Cowork (Claude Sonnet 5.5). Pusheado por Pedro: `d6c6499..e62f0c9` (`0bde108`, `46e30e4`, `b55f862`, `e62f0c9`). Control de carpeta exhaustivo hecho al cierre: árbol limpio, local = origin, `index.html` byte a byte igual a la fuente, `check_folder.sh` ✅, `contrseña mt5.png` ignorado por `.gitignore` (no trackeado). CHANGELOG en ~520 líneas → **no hace falta podar** (umbral ~1000). Qué ya NO está pendiente: pegado de escenarios, actualizaciones, Editar, bloque `Actualizar:`, histórico de Notion (todo hecho y pusheado; falta solo que Pedro lo pruebe).*

**Orden sugerido para el próximo chat (adjuntar este CHANGELOG):**
1. **Pedro prueba en el navegador real** (recarga dura Cmd+Shift+R): (a) Editar GBPCHF → Creado `02/10/2026`; (b) pegar `ESCENARIOS_historicos_notion_30-10.txt` (debe decir "11 listos") + Guardar, filtro de estado en "todos"; (c) tarjeta con "＋ Actualización". Si algo falla, captura.
2. **Cargar las actualizaciones de GBPCHF** (02/10, 15/10, 29/10, 30/10) con bloques `Actualizar:`: Claude necesita el texto de cada una + link de TradingView (están en la página de GBPCHF en Notion; las páginas de la base "Análisis TradingView" leídas por API tienen el cuerpo vacío, así que hay que copiarlas a mano o pasar capturas).
3. **Respuestas de Pedro pendientes:** stop de GBPCHF = 1,08390 (había tipeado 1,08930) · USD/MXN 17/06 (Resultado SL pero Cumplió ✅ Sí: se cargó invalidado) · GBP/CAD: el 1er escenario (19/03 → TP 25/03) ¿fue trade real? (si sí, va al CSV de trades) · EUR/USD 10/03 "4H/D1" (se cargó 4H) · **criterio de "tasa de acierto analítico":** GOLD 16/03 y USD/OIL 27/03 se cargaron `invalidado` (SL tocado) aunque Pedro anotó "análisis correcto / Cumplió Parcial"; el resumen de acierto del tab los cuenta como fallo → decidir si "Parcial" debe contar como acierto (o llevar un estado/etiqueta aparte).
4. **Decisiones de diseño sin OK todavía:** guard de `parseCSV()` (exigir FECHA+ACTIVO) · blindaje contra borrado de historial de Safari (auto-respaldo a Firestore de CSV + ajustes + historial Commodities/Bonos, sin API keys; export/import JSON; aviso si no hay datos; tip Mac: Option + "Clear History and Keep Website Data", a verificar) · Escenarios como "actividad de gestor" (recomendación: solo para la alerta de ausencia).
5. **6 trades de agosto de Notion:** confirmar cuáles se ejecutaron en el broker y cuáles son de papel + Entrada/SL/TP + sistema/tipo (swing = MALETA; Notion los marca todos TESLA). Mantener Excel/Notion/CSV al día.
6. **Notion, fila GBPCHF:** quedó con Cuenta "SIN entrada oficial", Estado "EN CURSO", Cumplió "Parcial", Sistema TESLA (un swing debería ser MALETA) → ajustar a mano.
7. **Higiene técnica:** (a) `deploy.sh` hace `git push origin main || git push origin main --force` → el `--force` de respaldo puede pisar GitHub: sacarlo (no se tocó); para este tipo de pushes usar `git push origin main` a mano; (b) restos de git creados desde la carpeta montada en Cowork (26 archivos `.git/stale-*` y ~53 `.git/objects/*/tmp_obj_*`): inofensivos, pero se pueden limpiar desde la Terminal de la Mac con git cerrado (`rm .git/stale-*` y `find .git/objects -name 'tmp_obj_*' -delete`) — no hacerlo con git corriendo; (c) los tests de la sesión (jsdom `t3`–`t9`, Playwright) viven **fuera del repo** en la VM de Cowork (`$HOME/scratch/jd`); si se pierde esa VM hay que rehacerlos (no se versionan).
8. **Backlog sin cambios:** rotar/sacar la API key de Twelve Data del repo, FedWatch (después de Economías Globales), GuruFocus vía script aparte en Cifra, filtros de Métricas, bonos globales (Bund/JGB/Gilt/China), etc. (ver Pendientes).

## Sesión 2026-10-22 (Cowork, 6ta) — Fix TDZ #3 + clase de activo + tab Escenarios + tanda 2 (duración, links por ticker) — CERRADA, pusheada 22/10 (`aa81b28..d6c6499`)

Contexto: Pedro aclaró (21-22/10) que, además de forex, planea hacer **swing en índices, bonos y acciones** (anotado en seminarios de análisis técnico de acciones e índices) y quiere cargar **análisis y escenarios** en el dashboard. Revisión de código: el registro de trades era genérico (activo = texto libre) pero la bitácora de análisis guardaba solo `{fecha, texto}`, sin estructura ni forma de medir aciertos, y no había clasificación por clase de activo. Decisiones confirmadas con Pedro antes de tocar código: tab nueva "Escenarios" · campos completos · clase de activo auto-detectada con mapa editable (sin tocar CSV/Excel) · arreglar primero el TDZ.

**1) Fix TDZ (commit `e7f95eb`)** — ver Lección #1, tercer caso. Movidas 6 declaraciones arriba de `restoreCSV()`. Verificado con jsdom: de 3 errores `before initialization` a 0; banner Triple Witching con contenido.

**2) Clase de activo (commit `e22c6fe`)** — `claseAuto()`/`claseDeActivo()`: forex por par de monedas (EUR/USD, AUD-JPY, USDMXN), índices/commodities/bonos por nombre conocido, el resto "Sin clasificar" (acciones: se asignan a mano). Mapa editable en ⚙ Config (card "Clase de activo", `localStorage` `pei_clase_map`, solo guarda lo que difiere de la auto-detección). Selector "Clase" en Overview junto al de Cuenta (`pei_clase_activa`), aplicado en `getTradesFiltrados()`. **Alcance real (corregido en `159ba94`; el primer texto de Config decía "métricas" y era impreciso):** afecta KPIs, Equity, Meta de cuenta, tabla de Trades, barras por activo, resumen por sistema, resumen mensual/anual y Distribución. **NO afecta** la tab Métricas (Rachas, Drawdown, TESLA/MALETA, Sesgo por Activo, Prop Firm, Kelly), el Calendario, Análisis, el Histórico ni el puente PEI·SYS: usan `trades` completo — limitación que ya tenía el filtro de Cuenta. **No afecta** `archivarMesesCerrados`, el puente PEI·SYS ni el Histórico (usan `trades` completo, a propósito, para no archivar datos parciales). Verificado: 17/17 casos de detección, filtro y mapa de usuario.

**3) Tab Escenarios (commit `0b7d62a`)** — colección Firestore nueva `escenarios` (vía `peisysSetDoc`/`peisysGetCollection`, no toca `bitacora_analisis`). Campos: activo*, clase (sugerida desde el nombre), temporalidad (15m/1H/4H/D1/W1/M1), sesgo, tesis*, entrada (nivel o zona, texto libre), invalidación*, objetivo, link TradingView (solo http/https), estado (vigente/cumplido/invalidado/archivado). *Obligatorios. La invalidación es obligatoria a propósito: sin condición que lo anule no se puede medir. Lista con filtros (estado, clase, búsqueda por activo) y resumen "Acierto (cerrados)" = cumplidos / (cumplidos + invalidados). Todo texto de usuario se escapa. Verificado con jsdom + Firestore simulado en memoria: 15/15 chequeos, sin errores. **NO verificado en navegador real ni contra Firestore real** — falta probar guardar un escenario en producción y revisar que las reglas de `peisys` lo permitan (son comodín abierto, debería).

Decisión pendiente (no implementada): contar los escenarios como "actividad de gestor" en el banner de consistencia (un escenario es análisis real aunque no haya trade, igual que la bitácora).

**4) Tanda 2 (commit `159ba94`)** — acordada con Pedro: (3) duración del trade y (4) acciones puntuales.
- **Duración de trades** (card nueva en Métricas, entre Sesgo por Activo y Resumen mensual; paso `renderDuracionTrades` en `renderAll`, aislado por el try/catch): el CSV solo tiene FECHA de entrada, así que hoy se calcula la **antigüedad en días de los trades EN CURSO**; la duración de cerrados (promedio general / ganadores / perdedores) aparece cuando el CSV trae la columna opcional **FECHA CIERRE** (misma forma que FECHA, al final del Excel; el parser ya detecta cualquier encabezado con "fecha" y "cierre"). Avisa cerrados sin fecha, cierres anteriores a la entrada (ignorados) y muestra chica (<5). Respeta Cuenta y Clase. **Pendiente de Pedro:** agregar la columna al Excel si la quiere.
- **Links por ticker** (card "Abrir ticker" arriba de la tab Escenarios): TradingView, Finviz, SEC EDGAR y Yahoo Finance, sin API (ticker validado y codificado, `noopener`). Los patrones de URL son los estándar de cada sitio; **no los abrí desde el sandbox** — probar uno en el navegador. Finviz/SEC solo acciones de EE. UU.
- **Decidido NO hacer ahora:** ficha con Finnhub y GuruFocus en este dashboard. GuruFocus (Data API, plan Free 100 requests/mes, Data API Agreement sin leer) lo llevó Pedro al chat de **Cifra** (`cifra.html`); **aclarado 22/10 con capturas de Pedro: no hay contradicción.** El chat de Cifra (casi seguro) plantea GuruFocus en Cifra vía un **script aparte** (cruce de cifras SEC + GuruFocus), no como llamada de red en el HTML: Cifra no usa red ni keys y está congelado hasta cerrar SPCX 3Q26; más adelante, una pestaña "Cruce" levantaría el resultado. Esto reemplaza mi idea inicial de Worker + cache dentro de Cifra (rompía esa regla). Nada de GuruFocus en trading-desk. Ver `RESEARCH_ideas_wallstreet.txt` (entrada 22/10).
- Verificado con jsdom: duración con y sin FECHA CIERRE, filtro de clase, links y validación, 0 errores. **No probado en navegador real.**

*Cerrado: 2026-10-22, sesión Cowork (Claude Sonnet 5.5). Pusheado 22/10. Commits: `e7f95eb` (TDZ), `e22c6fe` (clase), `0b7d62a` (Escenarios), `b2f4fa4` (CHANGELOG), `159ba94` (tanda 2) y el de este CHANGELOG — Pedro pushea desde su Terminal.*

---

## Sesión 2026-10-19 (Cowork, 5ta) — RGBI/OFZ ruso vía MOEX ISS en tab Bonos + fix Yahoo sin datos — CERRADA, pusheada 19/10

Retomando el pendiente de 🟡 Media prioridad (bonos globales, 18/09): de los cuatro candidatos (Bund, JGB, Gilt, Rusia, China), el OFZ ruso vía MOEX ISS era el único validado al 100% contra el código real en la sesión del 18/09 (3ra) -- `fetchMOEX()` ya pega directo a `iss.moex.com` sin proxy CORS. Pedro confirmó arrancar por ahí ("arranca si, prosigue").

**Implementado:** nueva fila en `BONOS_CONFIG` (`id:'rgbi'`, ticker `RGBI` -- índice de precio limpio del mercado de OFZ, el más citado como "índice de bonos rusos") con `fuente:'moex'`. Nueva función `fetchMOEXIndice()`: mismo patrón de 2 intentos que `fetchMOEX()` (board `SNDX` fijo, y si no hay dato, fallback sin filtro de board -- la misma causa que tuvo RTSI, fix 09/09, por eso el fallback viene incluido desde el día 1 en vez de esperar a que falle en vivo). Devuelve la misma forma `{price, change, status}` que `fetchYahoo()`, así que `refreshBonos()` solo necesitó un branch de una línea (`cfg.fuente === 'moex' ? fetchMOEXIndice(...) : fetchYahoo(...)`) y `buildBonoCard()` un label de fuente dinámico ("MOEX ISS" vs "Yahoo Finance"). No se tocó `renderAll()` -- Bonos sigue siendo tab lazy-loaded, no aplica la Lección #1 (TDZ).

**Nota sobre el endpoint de MOEX ISS:** no distingue mercado abierto/cerrado en los campos pedidos (`marketdata`), así que el `status` queda fijo en `'closed'` cuando hay dato -- mismo criterio de cadencia diaria que ya tiene el resto de Bonos, no es una limitación nueva.

**Verificado en vivo por Pedro (19/10, capturas):** la card de RGBI muestra 111,69 pts, fuente MOEX ISS, badge CERRADO. (El sandbox de Claude y el Mac bloquean `iss.moex.com` por red, así que la prueba real fue en el browser de Pedro.) Var. semana queda en "—" hasta juntar 5+ días de historial, esperado.

**Bug real encontrado el mismo día (commit `e978950`) -- Commodities/Bonos/Índices sin datos:** Pedro abrió el dashboard y Commodities, 7 de 8 cards de Bonos y 3 Índices (HSTECH/CSI300/MOEX, ESTÁTICO) no mostraban nada. Dos causas combinadas: (1) la URL del Worker de Cloudflare (`pei-cors-proxy.pzacarias18.workers.dev`) vivía SOLO en `localStorage` -- cada navegador/origen arranca con el campo vacío y Yahoo bloquea por CORS. Ahora `PROXY_CORS_DEFAULT` está en el código (arriba de `restoreCSV()`, Lección #1), como las keys de Finnhub/Twelve Data; el Worker tiene allowlist de hosts de Yahoo, no es proxy abierto. (2) **Bug de caché:** un fetch fallido guardaba igual un snapshot con todo en `null` y la lógica lo daba por "al día" (Bonos hasta mañana, Commodities 7 días) -- aunque se arreglara el proxy, recargar no reintentaba. Nuevo `snapshotCompleto()`: un snapshot sin precio en algún instrumento se reintenta en la próxima apertura de la tab, y un reintento fallido no pisa un dato bueno del mismo día. Efecto colateral aceptado: un ticker que Yahoo nunca devuelva haría que esa tab refetchee en cada apertura (hoy no pasa: los 11 de Commodities y los 8 de Bonos responden, confirmado por capturas). **Lección:** un fallo transitorio nunca debe quedar cacheado como dato válido.

Quedan pendientes, sin fuente gratuita confirmada: CGB chino (Sina Finance, CORS sin probar), JGB japonés (solo yield, sin fuente confirmada), Bund alemán y Gilt UK (sin fuente viable todavía).

Verificado: `node --check` OK en los 2 bloques `<script>`, `index.html` sincronizado con la fuente (`diff -q` IGUALES), `check_folder.sh` ✅ OK. Commits locales (`ce8b6f3` RGBI, `e978950` fix proxy/caché, más los de CHANGELOG), pusheados por Pedro desde su Terminal (`468169a..b9dbac2`).

*Cerrado: 2026-10-19, sesión Cowork (Claude Sonnet 5).*

**Adenda posterior al push (19/10, misma sesión):** se implementaron las citas del banner de ausencia (detalle en 🟡 Pendientes, ítem tachado). Cambios (pusheados después, `d03ac32`): editado `NO_ABRIR_fuente_para_editar.html` + `index.html` copiados byte a byte, `check_folder.sh` ✅. Dudas de Pedro respondidas: el mensaje "Acumulando historial (necesita 2+ semanas guardadas)" de Commodities/Bonos guarda en `localStorage` del navegador (no en Firebase ni en archivos de la Mac): `pei_commodities_history` ~1 KB por semana (máx. 12 → ~12 KB) y `pei_bonos_history` ~0,8 KB por día (máx. 30 → ~23 KB), con tope `slice(-MAX)` -- no crece; límite del navegador ~5 MB. Es por navegador y por origen (file:// local y github.io tienen historiales separados) y se pierde si se borran datos del sitio. Migrar a Firestore (como `trades_history`) queda como opción, con el riesgo conocido de reglas abiertas.

---

## Sesión 2026-09-18 (Cowork, 4ta) — Banner de aviso de Triple Witching en Overview — CERRADA, pusheada 18/09

Pedro vio una noticia sobre el "triple witching" de hoy y pidió sumarlo al dashboard "sin tanta rigurosidad como los demás features, pero para estar presente y atento". Research antes de construir (WebSearch, con fuentes): triple witching es el tercer viernes de marzo/junio/septiembre/diciembre, cuando vencen a la vez opciones sobre acciones, futuros de índices y opciones de índices -- es una fecha 100% calculable de antemano, no depende de ninguna API. Efecto documentado: en 2021 el volumen promedio del S&P 500 casi se duplicó esos días y el rango intradía se expandió ~7% (Citadel Securities / optionalpha.com) -- es mecánica de rebalanceo forzado, no una señal direccional. Fechas 2026 confirmadas: 20/03, 19/06, **18/09 (hoy)** y 18/12.

**Decisiones confirmadas con Pedro antes de tocar código:** banner chico en Overview (mismo patrón visual que el banner de Consistencia del gestor, pero sin su rigurosidad) · avisar también unos días antes, no solo el día mismo.

**Implementado:** `banner-triple-witching` (card nueva, debajo del banner de Consistencia). Al ser una fecha calculable no necesita fetch, localStorage ni historial -- se recalcula en cada `renderAll()`. `proximoTripleWitching()`/`tercerViernes()` (funciones puras) + `renderBannerTripleWitching()` agregada al array de `pasos` de `renderAll()` (dentro del try/catch del loop, Lección #2 -- son funciones sin estado persistente, no aplica la Lección #1 TDZ). Tres estados visuales: el día mismo (borde rojo, aviso fuerte + explicación de qué esperar), 3 días antes (`TRIPLE_WITCHING_AVISO_DIAS`, borde amarillo, aviso suave), y el resto del tiempo solo "Próximo triple witching: DD/MM" en chico sin alarma. Verificado a mano con `node`: la fecha calculada para hoy (18/09/2026) coincide exactamente con el vencimiento real, y el rollover a marzo del año siguiente después de diciembre funciona bien. `node --check` OK en los 3 bloques `<script>`. `index.html` sincronizado. `check_folder.sh` ✅ OK.

*Cerrado: 2026-09-18, sesión Cowork (Claude Sonnet 5).*

---

## Sesión 2026-09-18 (Cowork, 3ra) — Mini-gráficos Commodities/Bonos + validación research DeepSeek (bonos globales) — CERRADA, pusheada 18/09

Pedro le pasó a un chat de DeepSeek dedicado el resumen de research de la sesión anterior (bonos globales pendientes: Bund, Gilt, JGB, Rusia, China) para ampliar la búsqueda por su cuenta. Volvió con una propuesta concreta que Claude validó contra fuentes primarias antes de aceptar nada (nunca tomar un "✅" de otra IA como verificado):

- **OFZ ruso vía MOEX ISS — confirmado, el más sólido de los tres.** Revisando el código real del dashboard: `fetchMOEX()` ya pega directo a `iss.moex.com` con `fetch()` sin pasar por el proxy CORS (funciona sin problema, a diferencia de Yahoo). El índice `RGBI`/`RGBITR` se puede sumar reusando ese mismo patrón.
- **CGB chino vía Sina Finance — dato real, CORS sin confirmar.** El endpoint (`bond.finance.sina.com.cn/hq/gb/daily?symbol=CN10YT`) devuelve JSON real con series históricas de yield (probado con WebFetch). No se pudo confirmar si manda headers CORS para `fetch()` de browser -- tanto el sandbox de Claude como el Mac de Pedro bloquean `curl` directo por política de red. **Pendiente: Pedro prueba el fetch a mano en la consola de su navegador antes de integrarlo.**
- **JGB japonés vía J-Quants — CORREGIDO un dato de DeepSeek.** DeepSeek dijo "free tier con 12 semanas de delay" para los futuros; la doc oficial de J-Quants dice otra cosa: el free tier **no incluye futuros/derivados en absoluto**, solo el plan Premium (pago) los tiene. Si se quiere JGB gratis, sería solo el yield (no el futuro) vía alguna fuente tipo Eulerpool -- sin confirmar todavía que cubra Japón/Alemania.
- **Bund alemán y Gilt UK — sigue sin fuente gratuita viable.** Coincide con el research anterior, sin novedades.

Decisión: no se integró ninguno de los tres todavía. Arranca en Pendientes, empezando por OFZ ruso (el único 100% verificado) en una próxima sesión.

**Feature aparte, pedida por Pedro tras ver las tabs armadas:** mini-gráficos (evolución histórica) en las cards de Commodities y Bonos, mismo estilo visual que ya usa Índices (curva acumulada con área + línea + % total, `renderSVGCurve()`). Decisiones confirmadas antes de tocar código: Commodities pasa a acumular 12 semanas de historial (antes solo guardaba el snapshot actual + el anterior); Bonos amplía el cap de historial de 14 a 30 días; mismo estilo grande que Índices, no un sparkline chico.

**Implementado:**
- Helpers compartidos nuevos `historyToReturns()` / `fmtShortDate()`: convierten cualquier serie de precios guardada en el formato `{ret, mes}` que ya consume `renderSVGCurve()` -- cero código SVG nuevo, mismo look pixel-a-pixel que Índices.
- Commodities: reemplazado el cache de "actual + anterior" (`pei_commodities_cache`) por un historial acumulativo (`pei_commodities_history`, hasta 12 snapshots semanales). **El cache viejo queda huérfano** (cambió la key de localStorage) -- el mini gráfico arranca vacío y se va llenando semana a semana desde esta sesión en adelante, avisado en el disclaimer del tab.
- Bonos: `BONOS_HISTORY_MAX` subido de 14 a 30 (misma key `pei_bonos_history`, no se pierde lo ya guardado).
- Ambas cards ahora tienen un `idx-chart-wrap` con la curva acumulada del historial disponible; mientras no haya al menos 2 puntos guardados muestra "Acumulando historial..." en vez de un gráfico vacío o roto.
- `node --check` OK en los 3 bloques `<script>` del archivo. `index.html` sincronizado. `check_folder.sh` ✅ OK.

**Devolución a Pedro sobre el desempeño de DeepSeek en esta tarea:** bien en general -- dijo "no hay nada" para Gilt en vez de forzar una alternativa mala, y trajo endpoints concretos, no solo nombres de fuente. Dos cosas a corregir en su research a futuro: (1) se equivocó en el límite del free tier de J-Quants (confundió el delay de datos de acciones con la restricción binaria de derivados); (2) presentó a Sina Finance con el mismo nivel de confianza "✅" que a MOEX, sin marcar que el CORS estaba sin probar -- convendría pedirle que distinga sistemáticamente "fuente verificada en vivo" de "endpoint que existe pero sin probar" en cada fila de sus tablas, no solo la primera vez que lo menciona.

*Cerrado: 2026-09-18, sesión Cowork (Claude Sonnet 5).*

---

## Sesión 2026-09-18 (Cowork, 2da) — Feature Bonos (US Treasuries, CME Group) — CERRADA, pusheada 18/09

Pedro pidió un vistazo de día y semana de "T-bonds globales" (tiene cuenta en CME Group). Research antes de construir (WebSearch, no memoria): confirmado que Yahoo Finance tiene tickers reales para los futuros CME 2Y/5Y/10Y/30Y (`ZT=F`/`ZF=F`/`ZN=F`/`ZB=F`) y para los índices de yield 5Y/10Y/30Y (`^FVX`/`^TNX`/`^TYX`) -- páginas confirmadas en finance.yahoo.com. Para lo "global" del pedido (Bund alemán, Gilt UK, JGB japonés): Bund y JGB solo existen en Yahoo como índices de retorno total de Deutsche Bank (`^BUNL`/`^JGBL`) -- otra escala y otra lectura que el precio del futuro puro -- y Gilt no tiene ticker confiable en Yahoo (solo aparece en TradingView/Barchart, no habilitados acá). Presentado el research a Pedro: decidió arrancar solo con US Treasuries y dejar lo global pendiente de una fuente mejor.

**Implementado:** tab "Bonos" nueva, con los 7 instrumentos de arriba vía `fetchYahoo()` (reusado tal cual, mismo proxy CORS). A diferencia de Commodities (cadencia semanal), acá la cadencia es diaria: cada apertura de la tab guarda 1 snapshot por día en `pei_bonos_history` (localStorage, hasta 14 días, dedup por fecha para no pegarle a la API más de una vez por día). "Var. día" es el `change` que ya devuelve Yahoo; "Var. semana" se calcula comparando contra el snapshot más viejo disponible con ≥5 días de antigüedad — necesita unos días de historial acumulado antes de mostrar algo (al principio da "—", esperado). Botón "Actualizar ahora" fuerza el refresh salteando el dedup diario. Misma tab lazy-loaded que Commodities/Índices, no toca `renderAll()`. `node --check` OK, `index.html` sincronizado.

**Pendiente de research (anotado por Pedro en la sesión):** buscar una fuente de datos mejor para Bund alemán y JGB japonés (idealmente precio del futuro, no un índice derivado) y para Gilt UK, y sumar bonos soberanos de **Rusia** y **China** al tab Bonos cuando se encuentre fuente. Va a 🟡 Pendientes.

*Cerrado: 2026-09-18, sesión Cowork (Claude Sonnet 5).*

---

## Sesión 2026-09-18 (Cowork) — Feature Commodities Chicago/CBOT + skill de recomendación de modelo — CERRADA, pusheada 18/09

Pedro pidió dos cosas en paralelo: (1) una skill de Claude que sugiera subir de nivel "Medio" a "Alto" solo cuando la tarea sea grande/compleja (avisando el consumo extra de tokens, nunca cambiando el nivel por su cuenta) -- se armó y quedó propuesta para que Pedro la guarde, no toca este repo. (2) Sumar a las sesiones habituales un seguimiento de commodities de Chicago (CBOT/CME/COMEX): trigo, arroz, carnes, petróleo, gas, oro, y a pedido de Pedro también maíz, plata, cobre y acero.

**Research antes de construir:** Twelve Data (ya usado en el dashboard) no cubre bien commodities agrícolas en el plan free -- es la misma limitación de fondo del pendiente 🟡 "Commodities en 0,00" (WTI/BRENT/COPPER/NATGAS). Yahoo Finance sí tiene tickers de futuros estándar para todo el set pedido, y el proxy CORS que Pedro ya deployó para Índices (`pei-cors-proxy.pzacarias18.workers.dev`) sirve igual acá sin trabajo extra.

**Decisiones confirmadas con Pedro antes de tocar código:** tab nueva "Commodities" (no mezclar con Mercado, que es de refresco diario) · cadencia semanal, no diaria · lista final: trigo (`ZW=F`), arroz (`ZR=F`), maíz (`ZC=F`), ganado (`LE=F`), cerdo (`HE=F`), petróleo WTI (`CL=F`), gas natural (`NG=F`), oro (`GC=F`), plata (`SI=F`), cobre (`HG=F`), acero HRC Midwest (`HRC=F`).

**Implementado:** tab "Commodities" nueva, con `fetchYahoo()` (ya existente, reusado tal cual) para los 11 símbolos. Cache en localStorage (`pei_commodities_cache`) con timestamp -- si pasaron menos de 7 días desde el último fetch, se muestra el dato guardado sin pegarle de nuevo a la API; botón "↻ Actualizar ahora" fuerza el refresh salteando el gate. La "Var. semana" que se muestra compara contra el snapshot anterior guardado (no el % diario que devuelve Yahoo) -- disclaimer visible en el dashboard. Primera carga de cada commodity no tiene comparación todavía (muestra "—"). Es una tab lazy-loaded igual que Índices/Earnings/Histórico (no entra al pipeline de `renderAll()`), así que no aplica la Lección #1 (TDZ) ni la #2 (try/catch) -- mismo patrón ya usado y seguro. `node --check` OK en los 2 bloques `<script>` del archivo. `index.html` sincronizado.

**Segundo hallazgo de carpeta ajena mezclada (mismo patrón que el 14/09):** `check_folder.sh` encontró la carpeta `ZAR vanguard` (proyecto Fondo de Emergencia, con su propio `.git`, archivos del 14 al 17/09 -- otra sesión de Cowork la había escrito ahí por error) suelta dentro de `trading-desk/`. Consultado con Pedro: decidió dejarla ahí a propósito en vez de moverla. Se sumó `"ZAR vanguard"` a `ALLOWED_DIRS` de `check_folder.sh` (con comentario de por qué) y se agregó `ZAR vanguard/` a `.gitignore` (tiene su propio `.git` anidado, no se trackea desde acá). `check_folder.sh` vuelve a dar ✅ OK.

*Cerrado: 2026-09-18, sesión Cowork (Claude Sonnet 5).*

---

## Sesión 2026-09-14 (Cowork) — Feature Riesgo Rolling (Sharpe/Vol de R) + control de carpeta — CERRADA, pusheada

Pedro mostró una foto de un dashboard institucional genérico (mockup "Vanquish Holdings", típico de fotos aesthetic de setup de trading) con 6 paneles: Performance, Drawdown, Rolling Sharpe Ratio, Rolling Volatility, Rolling Alpha vs S&P 500, Rolling Beta vs S&P 500. Preguntó si tenía sentido implementar algo así.

**Decisión tomada con Pedro:** dos targets separados, en HTML distintos (no mezclar):
1. **Trading System (esta carpeta)** — cuenta real de trading discrecional (TESLA/MALETA).
2. **Fondo de Emergencia** — portafolio en un ALyC local, fondo en USD, perfil renta fija, ritmo de seguimiento mucho más lento (no diario). Va en un HTML aparte, todavía no arrancado — ver Pendientes/Backlog abajo.

De los 4 paneles "rolling" del mockup, **Drawdown y Performance acumulada ya existen** (Métricas, Histórico). Se implementaron los 2 más inmediatos que faltaban:

**Rolling Sharpe(R) y Rolling Volatilidad(R) — nuevo card en tab Histórico.** Se calculan sobre la serie mensual de R que ya arma el feature Histórico (trades_history archivado en Firestore + el mes en curso calculado en vivo desde `trades`), en ventana móvil de 3 meses (`ROLLING_RISK_VENTANA`, elegida chica porque la bitácora recién tiene unos meses de historia — subirla a futuro cuando haya más data archivada). No depende de Twelve Data ni de una curva de equity en $ (que la bitácora no lleva) — 100% con datos que ya existen.

⚠ **Aclaración importante, ya documentada como comentario en el código:** no es un Sharpe Ratio de manual (ese se calcula sobre retornos % de una curva de equity contra una tasa libre de riesgo). Acá se calcula sobre R acumulado por mes (la unidad de riesgo de la bitácora) y sin risk-free (asumido 0) — es un proxy propio para ver si la consistencia mes a mes mejora o empeora, no es comparable con el Sharpe de un fondo real. El disclaimer queda visible en el dashboard, debajo del gráfico.

**Rolling Alpha/Beta vs S&P 500 (los otros 2 paneles del mockup) quedaron afuera de este paso** — no se puede armar sin antes definir cómo convertir R por trade en una serie de retornos % comparable contra SPY, y con pocos meses de historia el cálculo sería puro ruido. Anotado en Pendientes.

Funciones nuevas: `construirSerieMensualR()`, `mediaYDesvio()`, `calcularRollingRiskSerie()`, `renderRollingRisk()`. Verificado con `node --check`. `index.html` sincronizado con la fuente.

**Control general de la carpeta:** repo limpio (sin cambios sin commitear al empezar la sesión), sin locks de git colgados después de esta sesión. Nota: el commit `c202ad6` (fix 429, sesión 7ma) todavía no estaba pusheado a origin al momento de arrancar esta sesión — falta el `git push origin main` de Pedro para esa sesión y esta.

*Cerrado: 2026-09-14, sesión Cowork (Claude Sonnet 5).*

---

## Sesión 2026-09-14 (Cowork, 2da) — Feature "Consistencia del gestor" (banner racha/ausencia + bitácora de análisis) — CERRADA, pusheada

Pedro pidió investigar (research real, no opinión) cómo la banca/academia/traders profesionales piensan la constancia mes a mes, para diseñar un feature que le hable a él mismo: si pasa mucho tiempo sin gestionar, que el dashboard se lo diga con un mensaje que **él mismo escribió antes**; si viene sosteniendo una racha, ídem en positivo.

**Research (con fuentes):**
- Bridgewater/Dalio usa un **Issue Log** y un **Pain Button** — el trader anota su error o frustración en el momento, como dato para ver el patrón después, no como autocastigo puntual.
- **Commitment device** de economía del comportamiento (Thaler & Benartzi, "Save More Tomorrow") — la persona de HOY, con la cabeza fría, le deja una instrucción pre-escrita a la persona de dentro de unas semanas, y el sistema la ejecuta solo. Es el mecanismo exacto que arma este feature: Pedro escribe el mensaje en ⚙ Config, el dashboard solo lo entrega cuando se cumple la condición — nunca genera ni suaviza el texto.
- Locke & Mann (*Journal of Financial Economics*, "Professional trader discipline and trade disposition") y literatura de rutina pre-mercado: lo que distingue al profesional no es el timing, es la consistencia de proceso — "lo que importa no es la perfección, es correr la rutina todos los días, sin importar cuán confiado te sentís"; cuando la rutina se rompe, lo que aparece es toma de decisión emocional (FOMO, revenge trade).

**Implementado:**
- **Bitácora de análisis** (card nueva en Overview): textarea + botón para anotar un escenario/análisis del día, aunque no haya trade — nueva colección Firestore `bitacora_analisis` (mismo puente peisys). Un día sin operar pero con análisis real cuenta como actividad real de gestor.
- **"Actividad de gestor"** = fecha del último trade cargado O de la última entrada de bitácora (lo que sea más reciente).
- **Banner de consistencia** (arriba de todo en Overview, imposible de no ver): si pasaron ≥ N días sin actividad (default 14, configurable), muestra un mensaje del pool de "ausencia" que Pedro escribió; si hay ≥ M semanas consecutivas con actividad (default 3, configurable), muestra un mensaje del pool de "racha". Si no se cumple ninguna condición, muestra solo el dato neutral ("última actividad: hace X días"). El mensaje rota entre los que Pedro cargó (uno por línea en Config), determinístico por día — no cambia en cada refresh, sí cambia día a día.
- **⚙ Config → nueva card "Consistencia del gestor":** umbral de días para ausencia, umbral de semanas para racha, y dos textareas (mensajes de ausencia / mensajes de racha, uno por línea). Todo en localStorage, mismo criterio que las API keys ("se guarda en este navegador").
- Aplica igual a cuenta personal, demo, y el día de mañana fondeada — la métrica es "¿estás gestionando?", no de qué cuenta.
- `renderBannerConsistencia` agregado al pipeline de `renderAll()` (aislado en su propio try/catch, Lección #2). `bitacoraAnalisisData` declarado arriba de `restoreCSV()` (Lección #1 TDZ) porque `renderAll()` puede correr sincrónicamente en el parseo inicial del script.

**Pendiente / a evaluar con el tiempo:** los mensajes y umbrales viven en localStorage (no Firestore) — si Pedro limpia el navegador o cambia de dispositivo, los pierde y hay que volver a tipearlos (bajo costo, pero real). Se dejó así por consistencia con cómo ya funciona el resto de ⚙ Config, no por limitación técnica — si en algún momento pesa la pérdida, migrar a Firestore es directo (mismo patrón que `trades_history`).

*Cerrado: 2026-09-14, sesión Cowork (Claude Sonnet 5).*

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

- ✅ **Pusheado 30/10 (`cf16a20..69ba926`, 4 commits):** pestaña **Riesgo** v1 y CHANGELOG de la 8va. La pestaña Riesgo está en vivo pero **todavía no se probó en el navegador real de Pedro** (solo en jsdom).
- ✅ **Pusheado 11/11 (`f80728a..e6f3ffa`, 3 commits, 10ma):** CHANGELOG de la 9na (`12e214c`) + 6 `catch` de fuentes de datos con log (B32, `255467a`) + `REGISTRO_bugs_y_salud_del_codigo.md` y `check_folder.sh` (`e6f3ffa`). El cambio de código es sólo de logs, no cambia el comportamiento.
- ✅ **Pusheado 9/11 (`69ba926..f80728a`, 2 commits):** `parseFechaFlex` (fechas D/M), `catch` de `restoreCSV`, Chart.js 4.5.1, Firebase 12.19.0, tipo de cambio con caché y Worker v2 (el archivo; **el Worker en Cloudflare sigue siendo el viejo hasta que Pedro lo re-deploye**). Todavía **no probado en Safari**.
- 📦 **Librerías (9/11, en vivo tras el push):** Chart.js 4.5.1 (antes 4.4.4) y Firebase 12.19.0 (antes 10.8.0). Tipo de cambio: `open.er-api.com/v6` con caché de 1 hora.
- ✅ **En vivo:** https://pedritozar.github.io/trading-desk/ — `origin/main` en `e6f3ffa` (11/11; el CHANGELOG puede ir 1 commit adelante) — **pusheado 30/10** (`d6c6499..e62f0c9`, 4 commits: pegado de escenarios, UX del pegado, actualizaciones/Editar/`Actualizar:`, carga histórica de Notion + clave de duplicado por día). Local = origin, árbol limpio, `index.html` idéntico a la fuente, `check_folder.sh` ✅. **Falta que Pedro pruebe en el navegador real con recarga forzada (Cmd+Shift+R).**
- ✅ Tab nueva **Commodities** (18/09): trigo/arroz/maíz/ganado/cerdo/WTI/gas/oro/plata/cobre/acero vía Yahoo Finance, historial semanal en localStorage (hasta 12 snapshots) + mini gráfico de evolución (nuevo 18/09, 3ra sesión — ver detalle).
- ✅ Tab nueva **Bonos** (18/09): US Treasuries — futuros 2Y/5Y/10Y/30Y (CME) + yields 5Y/10Y/30Y, vía Yahoo Finance, historial diario en localStorage (hasta 30 días) para var. día/semana + mini gráfico de evolución (ampliado de 14 a 30 días, 3ra sesión).
- ✅ **RGBI (OFZ ruso) sumado al tab Bonos (19/10, 5ta sesión):** vía MOEX ISS (`fetchMOEXIndice()`, mismo patrón que `fetchMOEX()`), mismo historial diario/mini gráfico que el resto de Bonos. **Verificado en vivo** (111,69 pts, CERRADO).
- ✅ **Proxy CORS con valor por defecto en el código + reintento de snapshots incompletos (19/10):** Commodities/Bonos/Índices ya no dependen de que el proxy esté cargado en `localStorage`. **Verificado en vivo por Pedro (19/10, capturas):** Commodities 11/11 cards LIVE (incluido acero `HRC=F`) y Bonos 8/8 con datos (7 vía Yahoo + RGBI vía MOEX).
- ✅ **Banner Triple Witching en Overview (18/09, 4ta sesión):** aviso liviano sin API -- calcula el tercer viernes de marzo/junio/septiembre/diciembre, con aviso fuerte el día mismo y suave 3 días antes.
- ✅ Tabs: Overview · Trades · Métricas · Precios · Mercado · Índices · **Commodities (18/09)** · **Bonos (18/09)** · Earnings · **Histórico (nuevo 08/09)** · **Riesgo (nuevo 30/10, v1 sin probar en navegador real)** · **Escenarios (nuevo 22/10; 30/10: pegado texto/CSV, actualizaciones por fecha, Editar)** · ⚙ Config. Filtros globales en Overview: **Cuenta** y **Clase de activo (nuevo 22/10)**.
- ✅ **Escenarios (22/10):** tab con formulario estructurado (activo, clase, temporalidad, sesgo, tesis, entrada, invalidación*, objetivo, link TV, estado), filtros y resumen de acierto sobre cerrados; colección Firestore `escenarios`. Card "Abrir ticker" con links a TradingView/Finviz/SEC/Yahoo. *Sin probar en navegador real ni contra Firestore real.
- ✅ **Duración de trades (22/10, tab Métricas):** antigüedad de los EN CURSO + duración de cerrados con la columna opcional FECHA CIERRE.
- ✅ Account selector multi-broker (Todas/CMC Demo/MT5 Demo/CMC Live/MT5 Live), persiste en localStorage
- ✅ Métricas: Rachas, Drawdown (formato R+%+aviso muestra chica), TESLA/MALETA, Prop Firm, Kelly, Sesgo por Activo, Resumen Mensual/Anual — cada bloque aislado en su propio try/catch (Lección #2)
- ✅ Histórico: archivo permanente por mes en Firestore (`trades_history`) + comparativa año a año + gráfico multi-año, más Rolling Sharpe(R)/Volatilidad(R) (nuevo 14/09, ventana 3 meses — ver Pendientes para Rolling Alpha/Beta)
- ✅ Mercado: Currency Strength + Commodities (Twelve Data) · RVOL · Flujo Institucional (Barchart, link directo) · Calendario Macro (iframe Investing.com)
- ✅ Índices: SPX, RUT, SOX, HSTECH, CSI300, MOEX + rotación de sectores
- ✅ Earnings: watchlist (Apple/Tesla/Nike/Salesforce/Citi/Alibaba) vía Finnhub + histórico perpetuo en Firestore (`earnings_hist`) + vista "por Año → Trimestre" (nueva 09/09, ver Pendientes) con export CSV formato ARG
- ✅ Panel Demo vs Live · Sección Análisis (torta, por activo, castigados)
- ✅ CSV: parser `;` ARG + localStorage + 3 formas de cargar — **CSV Manual** (selector de archivo nativo, hay que repetirlo si el archivo cambia), **Fijar CSV** (File System Access API, solo Chrome/Brave/Edge — habilita Auto-sync cada 30s), **Pegar CSV** (modal con textarea, la más rápida para cargas puntuales)
- ✅ Puente PEI·SYS: escribe `resumen_trading/actual` en cada `renderAll()` (dashboard separado, solo escritura)
- ✅ **CORS de Yahoo Finance en Índices — RESUELTO 14/09, verificado end-to-end.** Worker deployado por Pedro (`pei-cors-proxy.pzacarias18.workers.dev`), pegado en ⚙ Config → Proxy CORS y confirmado cargado (`PROXY_CORS_URL` verificado por consola). MOEX (`IMOEX.ME`) y CSI300 (`000300.SS`) ya devolvían datos reales con el símbolo correcto, solo faltaba el proxy. **HSTECH tenía además un segundo bug real:** el código usaba `%5EHSTECH` (`^HSTECH`), que Yahoo no reconoce (`"error":{"code":"Not Found"}`) — el ticker correcto es `HSTECH.HK`. Corregido en `YAHOO_SYMBOLS` (línea ~4667).
- ✅ **Badge "ESTÁTICO" engañoso en Índices — RESUELTO 14/09.** Con el proxy ya funcionando, HSTECH/CSI300/MOEX traían datos reales de Yahoo pero la tarjeta seguía marcando "ESTÁTICO" como si fuera el número fijo hardcodeado. Causa real: en `fetchYahoo()`, `isLive` solo se ponía `true` si Yahoo devolvía `meta.regularMarketPrice`, campo que Yahoo no llena cuando ese mercado (Hong Kong/Shanghái/Moscú) está fuera de su rueda — el fetch traía igual el último cierre real, pero quedaba indistinguible del fallback estático. Fix: nuevo estado intermedio `status` (`'live'` | `'closed'` | `'static'`) en `buildIdxCard()` — badge **CERRADO** (color `--blue`) para "fetch OK, mercado cerrado, dato real"; **ESTÁTICO** (naranja) ahora se reserva solo para cuando el fetch realmente falla. También se corrigió el label "Fuente:", hardcodeado a "Twelve Data" para las 6 tarjetas por igual — ahora dice "Yahoo Finance" para HSTECH/CSI300/MOEX y "Twelve Data" para SPX/RUT/SOX. `node --check` OK, `index.html` sincronizado, commit local pendiente de push (ver 🔴 Pushear commits).
- ✅ RTSI (dentro de Mercado): fix aplicado 08/09 (board equivocado en la API de MOEX, no CORS — detalle completo en `historicos txt/CHANGELOG_PEI_trading_ARCHIVO_HISTORICO.md` si hace falta). Verificado en vivo 19/10 (tab Precios muestra RTSI y MOEX con valor).

### Archivos HTML
- **`index.html`** (raíz) → **el que Pedro abre siempre**, haciendo doble click en la carpeta. Es el archivo real y actualizado — se actualiza solo cuando se corre `deploy.sh` (o el equivalente manual, ver Workflows). Nunca hace falta usar la URL en vivo para verlo: abrir este archivo local ES ver la versión de siempre.
- **`HTML- DASBOARD/NO_ABRIR_fuente_para_editar.html`** → la fuente que se edita cuando hay que tocar código. Pedro NO debe abrir este para usar el dashboard — el nombre ya lo dice.

---

## Pendientes Trading System

### 🔴 Alta prioridad
- [x] ~~Pushear commits locales (19/10)~~ — **pusheados 19/10** (`468169a..b9dbac2`): RGBI/OFZ ruso (`ce8b6f3`), fix proxy CORS por defecto + reintento de snapshots incompletos (`e978950`) y sus CHANGELOGs (`26b6b93`, `64f2050`, `b9dbac2`).
- [x] ~~Pushear commits locales~~ — **pusheados 18/09** (`5cb613c..43d5660`): tab Commodities + `check_folder.sh`/`.gitignore`, CHANGELOG Commodities, tab Bonos US Treasuries, CHANGELOG Bonos, mini-gráficos Commodities/Bonos, CHANGELOG mini-gráficos, CHANGELOG Estado actual, banner Triple Witching y sus CHANGELOGs.
- [x] ~~Pushear commit local~~ — **pusheado 14/09** (`ecba91e..94c27ac`): fix del badge "ESTÁTICO" engañoso en Índices (HSTECH/CSI300/MOEX ahora distinguen CERRADO de ESTÁTICO real) + label "Fuente:" correcto por índice.
- [x] ~~Firestore Rules de `peisys`~~ — **verificado 14/09, no hacía falta ningún cambio.** Las reglas son un wildcard abierto (`match /{document=**} { allow read, write: if true; }`) que ya cubre cualquier colección, incluida `bitacora_analisis`. ⚠️ **Firebase marca esto como inseguro** ("reglas públicas, cualquiera puede robar/modificar/borrar tu base") — el dashboard no usa auth, así que cualquiera con el `projectId` (`peisys`) podría en teoría escribir en la base. No bloqueante hoy (nada crítico/financiero real ahí, son métricas derivadas), pero queda anotado como riesgo a monitorear/blindar a futuro (reglas por colección o App Check).
- [x] ~~Pushear 4 commits locales (30/10, 8va)~~ — **pusheados 30/10 (`cf16a20..69ba926`)**.
- [ ] **Re-deployar el Worker v2 en Cloudflare (Pedro, 3 min; 9/11):** pegar `cloudflare_worker_proxy.js` en Workers & Pages → pei-cors-proxy → Edit code → Deploy. Sin esto el proxy sigue siendo el viejo (funciona, pero sin caché de borde ni reintento).
- [x] ~~Pushear los 2 commits de la sesión 9na~~ — **pusheados 9/11 (`69ba926..f80728a`)**.
- [ ] **Probar la pestaña Riesgo en Safari + agregar columnas R "RIESGO REAL%" y S "UNIDADES" al Excel** (pasos en el cierre de la sesión 8va).
- [ ] **Cargar 3 trades de agosto al Excel** (están en Notion, no en la bitácora): EUR/USD 12/08 GANADA MT5 Demo · GBP-AUD 11/08 PERDIDA CMC Demo · AUD/USD 25/08 PERDIDA CMC Demo (MALETA). Falta que Pedro pase Entrada/SL/TP. Quedan afuera SPY500 (EN CURSO) y EUR/JPY (orden pendiente). **Pedro lo hace al final del día 19/10 (acordado); antes de eso el banner de ausencia dice "124 días sin actividad (última 17/6)" por esto, no por falta de actividad real.** **Pedro lo hace el 23/10 (pospuesto del 19/10).**
  - **Actualización 30/10:** en Notion hay 6 trades de agosto con resultado (+ gold-usd 5/8, SPY500 13/8, Eur/jpy 28/8→4/9), no 3; Pedro debe confirmar cuáles fueron ejecutados de verdad y sistema/tipo (swing = MALETA). Falta Entrada/SL/TP de cada uno. GBPCHF NO va acá: es escenario (ver sesión 30/10).
  - **Actualización 30/10 (8va):** el historial de CMC trae 8 trades reconciliados (tabla en la sesión 8va); faltan capturas de CMC 25/08→08/09 y 30/07→20/08, sistema/tipo de cada trade y el OK de Pedro para cargar TODOS los ejecutados. Ya está resuelto que el broker es la fuente de verdad.
- [ ] **Disciplina:** Excel y Notion tienen que estar al día los dos — si uno se adelanta al otro, el dashboard solo ve hasta donde llegó el Excel.

### 🟡 Media prioridad
- [x] ~~Tanda 2 del plan de swing~~ — **hecha 22/10 (`159ba94`)**: duración de trades + links por ticker. Lo que queda abierto de esa línea: (a) **Pedro agrega FECHA CIERRE al Excel** si quiere duración de cerrados; (b) ficha de acción con fundamentales (Finnhub o GuruFocus) — GuruFocus queda en Cifra vía script aparte (ver línea 64); no se hace en este dashboard; si algo entra acá, Worker propio con token como secreto, nunca en el HTML (repo público).
- [ ] **Card FedWatch / FOMC (probabilidades de tasa de la Fed) en este dashboard — pendiente explícito de Pedro, NO empezar todavía:** primero se arma en Economías Globales (Tanda 8: réplica del método público de CME sobre futuros ZQ vía Yahoo, calendario FOMC hardcodeado) y ese chat deja un instructivo para este. Esperar a que esté corrida y probada en navegador real, que Pedro pegue el instructivo y adaptarla. Ventaja acá: el Worker de Cloudflare ya acepta hosts de Yahoo; sin verificar aún si Yahoo expone cada contrato mensual ZQ.
- [x] **Registro/calculadora de riesgo en el dashboard — v1 construida 30/10 (pestaña "Riesgo", commit local; falta probarla en el navegador real).** Ver Sesión 8va. **Queda para v2:** (a) presupuesto de riesgo diario/semanal contra el tope de 1% diario — decisiones abiertas: si las órdenes pendientes cuentan o solo las ejecutadas, y cómo desglosa Pedro el 1% por día/semana; (b) tipos de cambio automáticos para cruces (hoy los tipea Pedro; el dashboard ya tiene proxy Yahoo/Twelve Data); (c) borrar/editar órdenes guardadas (hoy solo cambia el estado; no hay `delete` en el puente Firebase); (d) cargar el riesgo real de las operaciones pasadas desde el historial del broker.
- [x] ~~Actualizar librerías del HTML~~ — **hecho 9/11 (commit local):** Chart.js 4.5.1 y Firebase 12.19.0, probado en Chromium real. Pendiente: verlo en Safari tras el push. Quedan por subir Chart.js 4.6.1 y Firebase 13.2.0 cuando tengan más de un mes de salida; considerar agregar `integrity` (SRI) a las etiquetas de CDN.
- [ ] **Claves de API en el código público (9/11):** Finnhub y Twelve Data están escritas en el HTML (`*_DEFAULT`). Rotarlas y pasarlas a ⚙ Config / localStorage como ya hace el código con el valor guardado.
- [x] ~~Loguear el error en el `catch` de `restoreCSV()`~~ — **hecho 9/11.** Sigue pendiente el guard de `parseCSV()` (abajo), que necesita OK de Pedro.
- [ ] **Versionar los tests en el repo (11/11) — propuesta, necesita OK de Pedro:** hoy los 7 tests viven sólo en la VM de Cowork (`$HOME/scratch/jd`); si la VM se pierde, se pierde la red de seguridad contra los TDZ. Propuesta: carpeta `tests/` con los scripts y un `README` (más `check_folder.sh` actualizado). No arrancar sin OK.
- [ ] **Fechas ambiguas D/M (9/11):** si Pedro quiere, detectar el formato del CSV completo (si alguna fila tiene primer número > 12 y ninguna segundo > 12, todo el CSV es D/M). Hoy `parseFechaFlex` solo rescata las inequívocas.
- [ ] **Pedro, en Safari tras el push (9/11):** recarga dura (Cmd+Shift+R) y ver que: (a) cargan Precios (tipo de cambio y atribución al pie), Índices, Commodities y Bonos; (b) Escenarios y Riesgo guardan y releen de Firestore con el SDK nuevo; (c) los gráficos de Overview/Métricas/Histórico se dibujan. Si algo falla: captura y la consola (Cmd+Option+C); rollback en el bloque de la sesión 9na. La VM no pudo consultar Yahoo, MOEX, Finnhub, Twelve Data ni el calendario de Investing.
- [ ] **Proteger `parseCSV()` de texto que no es un CSV de trades (30/10)** — hoy cualquier texto pegado en "Pegar CSV" reemplaza `trades` y el backup. Propuesta: exigir encabezado con FECHA y ACTIVO; si no, mostrar error y no tocar nada. Esperando OK de Pedro.
- [ ] **Blindaje contra borrado de historial de Safari (30/10) — diseño propuesto, esperando OK de Pedro** (ver sesión 30/10): auto-respaldo a Firestore de CSV + ajustes + historial Commodities/Bonos (sin API keys), restauración automática, exportar/importar JSON, aviso cuando no hay datos. Tip inmediato sin código: Mac → mantener Option y elegir "Clear History and Keep Website Data" (a verificar).
- [ ] **Decidir si la tab Métricas respeta los filtros Cuenta/Clase** (hoy Rachas, Drawdown, TESLA/MALETA, Sesgo por Activo, Prop Firm, Kelly y Calendario usan todos los trades). Con forex y swing de índices/acciones mezclados, las métricas por clase importan. Ojo: Prop Firm probablemente deba seguir usando todo; cambiar Kelly/Drawdown a subconjuntos chicos suma ruido (muestra chica). Es decisión de diseño — preguntar antes.
- [ ] **Probar en el navegador real tras el push (22/10):** tab Escenarios (guardar uno, recargar, cambiar estado), selector Clase + mapa en Config, card Duración en Métricas, un link de ticker, y que ya no haya caja vacía bajo el banner ni gráficos sin dibujar en la primera carga.
  - **30/10:** Pedro mostró capturas en navegador real: pestaña Escenarios y card Clase de activo en Config presentes. Falta confirmar guardado/recarga de un escenario, la card Duración y los links de ticker.
- [ ] **Probar en el navegador real (30/10, ya pusheado `e62f0c9`):** recarga dura (Cmd+Shift+R): Editar GBPCHF → Creado 02/10/2026; pegar `ESCENARIOS_historicos_notion_30-10.txt` (11 listos) + Guardar; filtro estado "todos"; probar "＋ Actualización" y un bloque `Actualizar:`. Lo verificado hasta ahora fue en jsdom/Chromium simulado, NO en el navegador de Pedro.
- [ ] **Cargar el historial de actualizaciones de GBPCHF (02/10, 15/10, 29/10, 30/10)** con bloques `Actualizar:` (texto + link TradingView por fecha; ver Cierre de la sesión 30/10). Pendiente: confirmar stop 1,08390.
- [ ] **Criterio de "tasa de acierto analítico" en Escenarios (30/10):** los análisis con SL tocado pero "Cumplió Parcial" en Notion (GOLD 16/03, USD/OIL 27/03) se cargaron `invalidado` → el resumen los cuenta como fallo. Decidir si "Parcial" cuenta como acierto o si hace falta un estado/etiqueta aparte. También 3 dudas de datos: USD/MXN 17/06 (SL vs Cumplió Sí), GBP/CAD 19/03 (¿trade real?), EUR/USD 10/03 (4H vs D1).
- [ ] **Escenarios como "actividad de gestor"** en el banner de consistencia (hoy cuentan solo trades y bitácora de texto) — decisión pendiente de Pedro.
  - **Recomendación 30/10 (Pedro: "no sé si contaría"):** que cuenten SOLO para la alerta de ausencia (escenario creado o actualizado), no para la racha positiva de semanas. Sin implementar, pendiente de su OK.
- [x] ~~OFZ ruso (RGBI) vía MOEX ISS~~ — **integrado 19/10** (5ta sesión), ver Estado actual. Verificado en vivo por Pedro (111,69 pts, CERRADO).
- [ ] **Bonos globales restantes (Bund, JGB, Gilt, China)** — pedido explícito de Pedro (18/09). **CGB chino vía Sina Finance — dato real, falta confirmar CORS** (Pedro prueba el fetch a mano en su navegador antes de sumarlo). **JGB japonés vía J-Quants — el free tier NO incluye futuros** (solo Premium pago); si se quiere, sería solo el yield vía otra fuente sin confirmar cobertura todavía. **Bund y Gilt siguen sin fuente gratuita viable.**
- [x] ~~Banner de ausencia con citas~~ — **implementado 19/10 y pusheado (`b9dbac2..d03ac32`); Pedro lo vio en pantalla: cita Ackman en nivel 4 (124 días), se ve bien**. Pedro aprobó 7 citas de la Tanda 4 (Buffett 1990, Lefèvre x2, Ackman x3, Bai Gui); Rusia afuera hasta encontrar una relevante y verificada. Código: `CITAS_AUSENCIA` (arriba de `restoreCSV()`, junto a `DD_MUESTRA_CHICA_R`, por TDZ #1) + `nivelAusencia()`, `elegirCitaDelDia()`, `htmlCitaAusencia()` (cerca de `elegirMensajeDelDia`); `renderBannerConsistencia` agrega la cita DEBAJO del mensaje propio de Pedro (que mantiene prioridad). Criterios de Claude a validar por Pedro: niveles de énfasis <30/<60/<90/≥90 días (tamaño de letra, negrita y fondo rojo suave crecen); citas de tono 'paciencia' solo con <30 días, con ≥30 solo 'retomar' (3 citas: Ackman x2 + Bai Gui); traducción al español es de Claude y se rotula 'traducción libre' con el original al lado. Rotación = misma fórmula por día que los mensajes propios. Verificado: `node --check` OK + test puro de selección (ninguna cita 'paciencia' sale con ≥30 días). **Pendiente chico:** cotejar Buffett 1990 en berkshirehathaway.com y el chino de Bai Gui en ctext.org (WebFetch pide que Pedro pegue las URLs). **Ojo:** hasta cargar los trades de agosto el banner sigue diciendo "124 días" y ahora con énfasis fuerte = falsa alarma visible; se corrige al cargar agosto (fin del día 19/10).
- [x] ~~Caja vacía bajo el banner de ausencia~~ — **causa encontrada y arreglada 22/10 (`e7f95eb`)**: era el banner de Triple Witching vacío por TDZ de `TRIPLE_WITCHING_AVISO_DIAS` (ver Lección #1). **Verificar en el navegador de Pedro tras el push.** Sigue pendiente lo chico: el placeholder "Escribí tu propio mensaje de ausencia en Config" arriba de la cita se lee como regaño — ocultarlo cuando hay cita.
- [ ] **Panel Commodities de la tab *Mercado* en 0,00 (WTI/BRENT/COBRE/GAS NAT.; ORO sí anda) y RVOL en 0.0x/sin datos** (no confundir con la tab Commodities nueva, que ya anda por Yahoo) — **idea de arreglo ahora posible:** la tab Commodities ya trae WTI (`CL=F`), cobre (`HG=F`) y gas (`NG=F`) reales vía Yahoo + proxy; ese panel de Mercado podría alimentarse de la misma fuente en vez de Twelve Data. Hipótesis original del fallo: límite del plan gratis de Twelve Data (símbolos de futuros y/o volumen real no incluidos en Basic). Pedro: probar en el navegador y reportar qué devuelven —
  1. `https://api.twelvedata.com/quote?symbol=WTI/USD,BRENT/USD,COPPER/USD,NATGAS/USD&apikey=3e257ff3e9e14bd6bb24f2d7bd0e57c3` (¿precios reales o error "symbol not found"/plan pago?)
  2. `https://api.twelvedata.com/time_series?symbol=SPY&interval=1day&outputsize=21&apikey=3e257ff3e9e14bd6bb24f2d7bd0e57c3` (¿el campo `"volume"` de cada barra viene con números reales o en `"0"`?)
- [ ] **(Duplica «Claves de API en el código público», arriba; se resuelven juntos.)** **Sacar la API key hardcodeada de Twelve Data del repo público** — hoy cualquiera que use el default comparte el mismo límite de 8 créditos/min con Pedro, lo que puede estar causando/agravando los 429. Pedro puede sacar su propia key gratis y cargarla en Config; ahí se evalúa si conviene sacar el default del código o dejarlo como fallback de todos modos.
- [x] ~~Evaluar CORS de Yahoo Finance en tab Índices~~ — resuelto 14/09, ver Estado actual arriba.
- [ ] Probar **FMP (Financial Modeling Prep)** para el calendario económico — única opción gratis (250 req/día) sin probar todavía para la alerta 30min antes. Ya descartados: Finnhub premium (`/calendar/economic` da 403 en el tier gratis), TradingEconomics (pago desde USD 39/mes), Investing.com (cuenta de usuario, no da API), TradingView (solo widget embebido).
- [ ] **Rolling Alpha/Beta vs S&P 500 (cuenta real)** — los 2 paneles del mockup que quedaron afuera de la sesión 14/09. Requiere definir cómo pasar de R por trade a un retorno % comparable con SPY, y juntar más meses de historia archivada (con 3-4 meses el cálculo es ruido). No arrancar hasta tener más data en Histórico.
- [ ] Probar Currency Strength con mercados europeos abiertos (4AM ARG).
- [ ] Re-rendir examen TESLA+MALETA — objetivo 9/10 (fallas previas: T1, T5, M6, ver Checklists abajo).
- [ ] Auditoría Notion "Venture Capital Firm" — acciones manuales de Pedro (Claude no puede borrar vía API): borrar boilerplate del template, resolver 2 páginas "BCE" duplicadas, confirmar si "PORTAFOLIO INSTITUCIONAL" es el mismo fondo Alfy, renombrar la raíz.

### 🟢 Backlog
- [ ] **Dashboard de Riesgo para Fondo de Emergencia (HTML aparte, no mezclar con este)** — portafolio en un ALyC local, fondo en USD, perfil renta fija. Orientado al ritmo real del activo (no diario como Mercado acá) — pensado más para seguimiento periódico que para refrescar en vivo. Todavía sin arrancar: falta definir qué datos hay disponibles del ALyC (¿API, export manual, carga a mano?) antes de diseñar qué métricas tienen sentido (probablemente Performance + Drawdown nada más, dado el perfil conservador — Sharpe/Vol/Alpha/Beta rolling tienen menos sentido en renta fija que en una cuenta de trading activo).
- [x] Calculadora de lotaje en el dashboard — cubierta por la pestaña Riesgo v1 (30/10); falta probarla en el navegador real y contrastar una vez contra myfxbook.
- [ ] Módulo Racha/Sesgo por Sesión (requiere agregar columna SESIÓN al Excel; ya existe la versión por Activo).
- [ ] Safari fix (workaround FileReader) · App en Dock desde Brave · Filtros en tabla de trades · Throttling Finnhub.

### 🔬 Ideas de research — mundo institucional/Wall Street
Mudado a `RESEARCH_ideas_wallstreet.txt` (misma carpeta) — archivo aparte, fechado, append-only, para que el research vaya creciendo con el tiempo sin inflar este CHANGELOG. Ahí están las 2 tandas ya hechas (Mauboussin/SQN/pre-mortem/circuit breaker; y fondos especulativos/pensiones/seguros/hedge funds/market makers/family offices/gestoras NY) con fuentes.

### Decisiones ya tomadas — no reabrir sin novedad real
- **Notion "HTML blocks":** descartado para dashboards con API externa — el sandbox de Notion bloquea fetch a APIs externas y el localStorage no sincroniza (inútil para Twelve Data/Finnhub/Firebase). Sirve solo para herramientas 100% autocontenidas.
- **Barchart plan pago (USD 10/mes):** no aporta — levanta el límite de vistas del sitio, no da API ni arregla el bloqueo del iframe de Investing.com, y no hace calendario económico. Con 20 vistas gratis/día alcanza.
- **Kelly Criterion:** ya implementado en Métricas, alimentado solo de la bitácora — no duplicar con un simulador aparte en Notion.
- **Auditoría externa (a futuro):** Excel/Notion sirven para control de proceso propio, pero un auditor/firma va a pedir statements del broker o track record verificado (MyFxBook conectado en vivo) — conviene ir guardando statements reales como respaldo.

---

## Excel — Estado actual

**Archivo:** `tracker_bitacora_traiding__DEFINITIVO.xlsx` · Hoja: `resultados traiding` (Tabla de Excel `ResultadosTraiding` — al agregar una fila justo debajo de la última, las fórmulas se copian solas)

| Fecha | Activo | Sistema | Tipo | Dir | R/R Real | Resultado | P&L | Cuenta |
|---|---|---|---|---|---|---|---|---|
| 29/05/26 | USD/JPY | TESLA | intraday | LONG | — | PERDIDA | -1,00 | CMC Demo |
| 02/06/26 | USDMXN | TESLA | intraday | LONG | 2,87 | GANADA | +2,87 | MT5 Demo |
| 02/06/26 | USDMXN | TESLA | scalping | LONG | 2,91 | GANADA | +2,91 | MT5 Demo |
| 09/06/26 | aud/jpy | TESLA | scalping | SHORT | 2,84 | GANADA | +2,84 | CMC Demo |
| 17/06/26 | USDMXN | TESLA | intraday | LONG | — | PERDIDA | -1,00 | MT5 Demo |

**Totales:** 5 trades · WR 60% · **+6,62R** · Expectancy 1,324 · Drawdown -1R · 100% TESLA

> RUSSEL 2000 y SYP500 eran análisis de TradingView (no ejecutados) → migrados a Notion.
> Nota: esta tabla quedó desactualizada frente a Notion (que tiene los trades de agosto) — ver "Cargar 3 trades de agosto al Excel" en Pendientes.

---

## Workflows

### Deploy
```bash
cd ~/Desktop/trading-desk
rm -f .git/index.lock          # el lock aparece solo, es falso positivo
./check_folder.sh              # NUEVO 14/09 -- corta acá si hay algo fuera de lugar
cp "HTML- DASBOARD/NO_ABRIR_fuente_para_editar.html" ./index.html
git add index.html "HTML- DASBOARD/NO_ABRIR_fuente_para_editar.html"
git commit -m "mensaje"
git push origin main
```
> **`check_folder.sh` — revisión estricta antes de `git add` (nuevo 14/09).** Pedido de Pedro tras encontrar `SPEC_zar_vanguard_capital_partners.md`/`CHANGELOG_zar_vanguard_capital_partners.md` (de OTRO proyecto, Fondo de Emergencia) sueltos dentro de `trading-desk/` — una sesión de Cowork los había escrito ahí por error. El script compara el contenido de la raíz contra una lista blanca de lo que pertenece a este repo; si aparece algo nuevo no reconocido (carpeta o archivo) imprime **🔴 ALERTA ROJA** con el detalle y corta con exit 1 — `deploy.sh` ya lo llama automáticamente antes de tocar `git add` y aborta el deploy si hay alerta. Si da **✅ OK**, todo coincide y se puede seguir. Si Pedro agrega un archivo/carpeta legítima nueva al repo, hay que sumarla a `ALLOWED_FILES`/`ALLOWED_DIRS` dentro de `check_folder.sh`, si no el script la va a marcar como alerta para siempre.
> Si el push falla con "Invalid username or token": el PAT venció. Generar uno nuevo en github.com/settings/tokens (scope `repo`), guardarlo en Notion, y `git remote set-url origin https://pedritozar:TOKEN@github.com/pedritozar/trading-desk.git`

> ⚠️ **Desde una sesión de Cowork** `deploy.sh` falla — su `$HOME` no es `/Users/pedritozar` (ver pendiente en Backlog). Mientras no se arregle: repetir los mismos comandos a mano usando la ruta montada (`$HOME/mnt/trading-desk` dentro de esa sesión) en vez de `~/Desktop/trading-desk` — **incluyendo `./check_folder.sh` antes de cualquier `git add`**, no solo cuando se corre `deploy.sh` entero. Cowork tampoco tiene credenciales de GitHub — el commit se prepara ahí y el `git push` final SIEMPRE lo corre Pedro desde su Terminal real. Si aparece un `.git/index.lock` o `.git/HEAD.lock` que `rm` no puede borrar ("Operation not permitted"), usar `mv` para sacarlo del camino en vez de `rm` — probado y funciona.

### CSV → Dashboard (3 formas, ver "Estado actual" arriba para el detalle de cada una)
1. Exportar CSV desde el Excel (hoja `resultados traiding`) o pegar directo el texto que te paso en el chat.
2. Dashboard → tab Trades → **CSV Manual** / **Fijar CSV** / **Pegar CSV**, la que corresponda.
3. Usar el selector de cuenta (Overview) para filtrar por broker.

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
- **Reglas de riesgo (dichas por Pedro 30/10):** 0,33–0,50% por trade, hasta 1% de la cuenta; tope 1% diario (desglosable por día/semana). A veces calcula el tamaño a mano, rápido, sin calculadora. El RIESGO% del Excel es el planificado; el real sale de las calculadoras de myfxbook o del historial del broker.
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
- ✅ **Fix 20/08:** regla nueva en el `sys` para preservar arquitectura cuando el contexto trae código existente (antes reescribía todo de cero al pedirle "extender"). Confirmado con caso real.
- 💬 Idea en debate: "Modo Auditor" — sin resolver
- ✅ **Resuelto (01/09):** `PRECIOS` ahora usa `getPrecios()` con corte automático por fecha (`PROMO_SONNET5_FIN`) — ya devuelve e:0.003/s:0.015 sin tocar el archivo a mano.
- ✅ **18/10:** Reactor migrado a gen 5.5 y ya activo en `generador.html` (Sonnet 5.5 / Opus 5.5 / Haiku 5.5, `getPrecios(modelo, itok)` sin promo; respaldo del original en `reactor IA/generador_BACKUP_pre55_2026-10-18.html`). Falta una generación de prueba con Sonnet 5.5 y Haiku 5.5. Detalle y motivos en `CHANGELOG_reactor.md`.

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
| 2026-09-08 | Fix Max Drawdown · aislamiento renderMetricas() · TDZ de DD_MUESTRA_CHICA_R (2da vez, ver Lecciones) · feature Histórico (Firestore) · fix RTSI + SPY/SPX + deploy.sh · feature Earnings por Año→Trimestre · limpieza fila 32 Excel · embed dashboard en Notion · cache + fix real de HTTP 429 en Mercado (7 sesiones, detalle completo en `historicos txt/CHANGELOG_PEI_trading_ARCHIVO_HISTORICO.md`) |
| 2026-09-07 | Paleta día/noche (insp. Macro Argentina) · 6 features (dedup CSV, tooltips ⓘ, panel Config, earnings_hist en Firestore, Meta de Cuenta, proxy CORS Cloudflare) · Equity/P&L migrados a Chart.js · fix crítico renderAll() sin try/catch (ver Lecciones) · botón "Pegar CSV" — 10 commits, todos pusheados y confirmados en vivo |
| 2026-09-06 | Encontrado y documentado el puente PEI·SYS (Firestore, solo-escritura) agregado sin anotar en su momento · eliminados HTMLs duplicados · fuente renombrada a `NO_ABRIR_fuente_para_editar.html` |
| 2026-08-28 | Precios forex (CORS Frankfurter → exchangerate-api) + showTab Safari (ver Lección #4) — 2 bugs reales, deployados y verificados en producción |
| 2026-08-26 | Excel auditado (5 bugs: P&L desfasado, R/R desfasado, precios sin decimal, WR y P&L por activo mal referenciados, Drawdown falso) · Tabla de Excel · resumen mensual/anual · fix key Finnhub (ver Lección #3) |
| 2026-08-03 | Account selector, Sesgo por Activo, RVOL, calendario macro, Barchart, tab Earnings, fix Currency Strength (`percent_change`) |
| 2026-07-06 | 4 trades de junio a Notion · bug P&L identificado · CHANGELOGs unificados |
| 2026-06-29 | Cierre de junio · Excel con datos reales de brokers · columna CUENTA completada |
| 2026-06-24 | Borradores AT relevados · base Notion de Análisis TradingView |
| 2026-06-10 | `deploy.sh` · CSV pipeline · Panel Demo vs Live · Sección Análisis |
| 2026-06-01 | Tab Mercado (Twelve Data) · Tab Índices |
| 2026-05-29 | Kelly Criterion · examen 6/10 |
| 2026-04/05 | Dashboard deployado · CSV parser · TESLA y MALETA completas |

---

*v4.3 — Claude Sonnet 5 · 2026-08-26 (podado de 408 a ~270 líneas) · 2026-08-28 (2 fixes deployados) · 2026-09-06 (puente PEI·SYS documentado) · 2026-09-08 (podado de ~680 a ~380 líneas: sesiones del 26/08 al 07/09 comprimidas al historial, sección "Lecciones" creada) · 2026-09-14 (podado de 433 a 342 líneas: 7 sesiones del 08/09 comprimidas al historial — detalle completo en `historicos txt/CHANGELOG_PEI_trading_ARCHIVO_HISTORICO.md`) · 2026-10-19 (sin poda: ~445 líneas, umbral ~1000; saneado de coherencia — estado de pusheos, tabs, verificaciones en vivo)*
