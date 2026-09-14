# PEI TRADING SYSTEM — CHANGELOG v4.3

**Proyectos:** Trading System (Dashboard + Excel) | Cartera Real (Alfy/Notion) | Reactor Nuclear IA
**Última actualización:** 2026-09-14 (sesión Cowork — feature Riesgo Rolling; feature Consistencia del gestor; poda: 7 sesiones del 08/09 comprimidas al historial; control general de carpeta)

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

## ⚠️ LECCIONES — errores que no hay que repetir

Esta sección es la excepción a la poda. Se actualiza, nunca se borra: es justo la parte que evita cometer el mismo error dos (o tres) veces.

### 1. TDZ (Temporal Dead Zone) — ya pasó DOS veces
Una `const`/`let` declarada más abajo en el archivo que el punto donde `restoreCSV()` la necesita (corre síncrono apenas carga la página, y en la práctica dispara casi todo `renderAll()`) queda en zona muerta temporal: `ReferenceError` al cargar, que corta la función a mitad de camino y deja paneles enteros sin dibujar — **con los datos bien cargados**, así que parece "se perdió el CSV" cuando no es eso.
- **26/08:** `MESES_ABREV` declarada después del punto de disparo → Demo vs Live y Resumen Mensual quedaban vacíos.
- **08/09:** `DD_MUESTRA_CHICA_R` — **la reintroduje yo mismo** al agregar el fix de Max Drawdown, sin seguir esta misma regla que ya estaba documentada acá. Causó TESLA/MALETA "Sin datos" y Drawdown en blanco. La misma búsqueda encontró una tercera candidata (`analisisView`, tab Análisis) con el mismo problema, corregida en la misma pasada antes de que llegara a manifestarse.
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

---

## Sesión 2026-09-14 (Cowork) — Feature Riesgo Rolling (Sharpe/Vol de R) + control de carpeta — CERRADA, commit local sin pushear

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

## Sesión 2026-09-14 (Cowork, 2da) — Feature "Consistencia del gestor" (banner racha/ausencia + bitácora de análisis) — CERRADA, commit local sin pushear

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

- ⚠️ **En vivo:** https://pedritozar.github.io/trading-desk/ — hay commits locales sin pushear (fix 429, Rolling Risk, Consistencia del gestor — ver Pendientes 🔴). Lo deployado hoy en producción es anterior a esta sesión.
- ✅ Tabs: Overview · Trades · Métricas · Precios · Mercado · Índices · Earnings · **Histórico (nuevo 08/09)** · ⚙ Config
- ✅ Account selector multi-broker (Todas/CMC Demo/MT5 Demo/CMC Live/MT5 Live), persiste en localStorage
- ✅ Métricas: Rachas, Drawdown (formato R+%+aviso muestra chica), TESLA/MALETA, Prop Firm, Kelly, Sesgo por Activo, Resumen Mensual/Anual — cada bloque aislado en su propio try/catch (Lección #2)
- ✅ Histórico: archivo permanente por mes en Firestore (`trades_history`) + comparativa año a año + gráfico multi-año, más Rolling Sharpe(R)/Volatilidad(R) (nuevo 14/09, ventana 3 meses — ver Pendientes para Rolling Alpha/Beta)
- ✅ Mercado: Currency Strength + Commodities (Twelve Data) · RVOL · Flujo Institucional (Barchart, link directo) · Calendario Macro (iframe Investing.com)
- ✅ Índices: SPX, RUT, SOX, HSTECH, CSI300, MOEX + rotación de sectores
- ✅ Earnings: watchlist (Apple/Tesla/Nike/Salesforce/Citi/Alibaba) vía Finnhub + histórico perpetuo en Firestore (`earnings_hist`) + vista "por Año → Trimestre" (nueva 09/09, ver Pendientes) con export CSV formato ARG
- ✅ Panel Demo vs Live · Sección Análisis (torta, por activo, castigados)
- ✅ CSV: parser `;` ARG + localStorage + 3 formas de cargar — **CSV Manual** (selector de archivo nativo, hay que repetirlo si el archivo cambia), **Fijar CSV** (File System Access API, solo Chrome/Brave/Edge — habilita Auto-sync cada 30s), **Pegar CSV** (modal con textarea, la más rápida para cargas puntuales)
- ✅ Puente PEI·SYS: escribe `resumen_trading/actual` en cada `renderAll()` (dashboard separado, solo escritura)
- ⚠️ **Pendiente, acción de Pedro:** CORS de Yahoo Finance en Índices (HSTECH/MOEX/CSI300 en blanco) — `cloudflare_worker_proxy.js` ya está listo, solo falta que Pedro lo deploye en su cuenta de Cloudflare (5 min, instrucciones en el propio archivo) y pegue la URL en Config.
- ✅ RTSI (dentro de Mercado): fix aplicado 08/09 (board equivocado en la API de MOEX, no CORS — detalle completo en `historicos txt/CHANGELOG_PEI_trading_ARCHIVO_HISTORICO.md` si hace falta). Sin verificar en vivo todavía.

### Archivos HTML
- **`index.html`** (raíz) → **el que Pedro abre siempre**, haciendo doble click en la carpeta. Es el archivo real y actualizado — se actualiza solo cuando se corre `deploy.sh` (o el equivalente manual, ver Workflows). Nunca hace falta usar la URL en vivo para verlo: abrir este archivo local ES ver la versión de siempre.
- **`HTML- DASBOARD/NO_ABRIR_fuente_para_editar.html`** → la fuente que se edita cuando hay que tocar código. Pedro NO debe abrir este para usar el dashboard — el nombre ya lo dice.

---

## Pendientes Trading System

### 🔴 Alta prioridad
- [ ] **Pushear 3 commits locales** (`git push origin main` desde tu Terminal real): fix HTTP 429 en Mercado, feature Rolling Sharpe(R)/Volatilidad(R), feature Consistencia del gestor. Cowork no tiene credenciales de GitHub — esto siempre lo corrés vos.
- [ ] **Firestore Rules de `peisys`:** agregar permiso de `write` (e idealmente `read`) en la colección nueva `bitacora_analisis` — si no, la Bitácora de análisis (Overview) falla en silencio al guardar.
- [ ] **Cargar 3 trades de agosto al Excel** (están en Notion, no en la bitácora): EUR/USD 12/08 GANADA MT5 Demo · GBP-AUD 11/08 PERDIDA CMC Demo · AUD/USD 25/08 PERDIDA CMC Demo (MALETA). Falta que Pedro pase Entrada/SL/TP. Quedan afuera SPY500 (EN CURSO) y EUR/JPY (orden pendiente).
- [ ] **Disciplina:** Excel y Notion tienen que estar al día los dos — si uno se adelanta al otro, el dashboard solo ve hasta donde llegó el Excel.

### 🟡 Media prioridad
- [ ] **Commodities en 0,00 (WTI/BRENT/COPPER/NATGAS) y RVOL en 0.0x/sin datos** — hipótesis: límite del plan gratis de Twelve Data (símbolos de futuros y/o volumen real no incluidos en Basic). Pedro: probar en el navegador y reportar qué devuelven —
  1. `https://api.twelvedata.com/quote?symbol=WTI/USD,BRENT/USD,COPPER/USD,NATGAS/USD&apikey=3e257ff3e9e14bd6bb24f2d7bd0e57c3` (¿precios reales o error "symbol not found"/plan pago?)
  2. `https://api.twelvedata.com/time_series?symbol=SPY&interval=1day&outputsize=21&apikey=3e257ff3e9e14bd6bb24f2d7bd0e57c3` (¿el campo `"volume"` de cada barra viene con números reales o en `"0"`?)
- [ ] **Sacar la API key hardcodeada de Twelve Data del repo público** — hoy cualquiera que use el default comparte el mismo límite de 8 créditos/min con Pedro, lo que puede estar causando/agravando los 429. Pedro puede sacar su propia key gratis y cargarla en Config; ahí se evalúa si conviene sacar el default del código o dejarlo como fallback de todos modos.
- [ ] Evaluar CORS de Yahoo Finance en tab Índices (HSTECH/MOEX/CSI300) — sin diagnosticar.
- [ ] Probar **FMP (Financial Modeling Prep)** para el calendario económico — única opción gratis (250 req/día) sin probar todavía para la alerta 30min antes. Ya descartados: Finnhub premium (`/calendar/economic` da 403 en el tier gratis), TradingEconomics (pago desde USD 39/mes), Investing.com (cuenta de usuario, no da API), TradingView (solo widget embebido).
- [ ] **Rolling Alpha/Beta vs S&P 500 (cuenta real)** — los 2 paneles del mockup que quedaron afuera de la sesión 14/09. Requiere definir cómo pasar de R por trade a un retorno % comparable con SPY, y juntar más meses de historia archivada (con 3-4 meses el cálculo es ruido). No arrancar hasta tener más data en Histórico.
- [ ] Probar Currency Strength con mercados europeos abiertos (4AM ARG).
- [ ] Re-rendir examen TESLA+MALETA — objetivo 9/10 (fallas previas: T1, T5, M6, ver Checklists abajo).
- [ ] Auditoría Notion "Venture Capital Firm" — acciones manuales de Pedro (Claude no puede borrar vía API): borrar boilerplate del template, resolver 2 páginas "BCE" duplicadas, confirmar si "PORTAFOLIO INSTITUCIONAL" es el mismo fondo Alfy, renombrar la raíz.

### 🟢 Backlog
- [ ] **Dashboard de Riesgo para Fondo de Emergencia (HTML aparte, no mezclar con este)** — portafolio en un ALyC local, fondo en USD, perfil renta fija. Orientado al ritmo real del activo (no diario como Mercado acá) — pensado más para seguimiento periódico que para refrescar en vivo. Todavía sin arrancar: falta definir qué datos hay disponibles del ALyC (¿API, export manual, carga a mano?) antes de diseñar qué métricas tienen sentido (probablemente Performance + Drawdown nada más, dado el perfil conservador — Sharpe/Vol/Alpha/Beta rolling tienen menos sentido en renta fija que en una cuenta de trading activo).
- [ ] Calculadora de lotaje en el dashboard (hoy Pedro usa myfxbook — es táctico por trade, complementa a Kelly que es estratégico).
- [ ] Módulo Racha/Sesgo por Sesión (requiere agregar columna SESIÓN al Excel; ya existe la versión por Activo).
- [ ] Safari fix (workaround FileReader) · App en Dock desde Brave · Filtros en tabla de trades · Throttling Finnhub.

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
cp "HTML- DASBOARD/NO_ABRIR_fuente_para_editar.html" ./index.html
git add index.html "HTML- DASBOARD/NO_ABRIR_fuente_para_editar.html"
git commit -m "mensaje"
git push origin main
```
> Si el push falla con "Invalid username or token": el PAT venció. Generar uno nuevo en github.com/settings/tokens (scope `repo`), guardarlo en Notion, y `git remote set-url origin https://pedritozar:TOKEN@github.com/pedritozar/trading-desk.git`

> ⚠️ **Desde una sesión de Cowork** `deploy.sh` falla — su `$HOME` no es `/Users/pedritozar` (ver pendiente en Backlog). Mientras no se arregle: repetir los mismos comandos a mano usando la ruta montada (`$HOME/mnt/trading-desk` dentro de esa sesión) en vez de `~/Desktop/trading-desk`. Cowork tampoco tiene credenciales de GitHub — el commit se prepara ahí y el `git push` final SIEMPRE lo corre Pedro desde su Terminal real. Si aparece un `.git/index.lock` o `.git/HEAD.lock` que `rm` no puede borrar ("Operation not permitted"), usar `mv` para sacarlo del camino en vez de `rm` — probado y funciona.

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

*v4.3 — Claude Sonnet 5 · 2026-08-26 (podado de 408 a ~270 líneas) · 2026-08-28 (2 fixes deployados) · 2026-09-06 (puente PEI·SYS documentado) · 2026-09-08 (podado de ~680 a ~380 líneas: sesiones del 26/08 al 07/09 comprimidas al historial, sección "Lecciones" creada) · 2026-09-14 (podado de 433 a 342 líneas: 7 sesiones del 08/09 comprimidas al historial — detalle completo en `historicos txt/CHANGELOG_PEI_trading_ARCHIVO_HISTORICO.md`)*
