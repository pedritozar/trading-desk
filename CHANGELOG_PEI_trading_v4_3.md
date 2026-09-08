# PEI TRADING SYSTEM — CHANGELOG v4.3

**Proyectos:** Trading System (Dashboard + Excel) | Cartera Real (Alfy/Notion) | Reactor Nuclear IA
**Última actualización:** 2026-09-08 (sesión Cowork — poda general: sesiones cerradas del 26/08 al 07/09 comprimidas al historial; sección "Lecciones" nueva, no podable, para que errores repetidos como el TDZ no se vuelvan a perder; housekeeping de la carpeta: ~1.7MB de backups viejos eliminados)

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

## Sesión 2026-09-08 (Cowork) — Max Drawdown, TDZ, feature Histórico — CERRADA, todo pusheado

Sesión larga en 4 partes, las 4 cerradas y confirmadas por Pedro en el dashboard real. Commits `f328d96` → `322dd70`, todos pusheados a producción.

1. **Fix Max Drawdown** (`13b7fc9`): mostraba `-108.70%` con pocos R acumulados (pico chico — no era bug de lógica). Ahora muestra R absoluto primero + % de referencia + aviso "muestra chica" si el pico es < 5R. Confirmado en vivo.
2. **Aislamiento de `renderMetricas()`** (`baac734`): cada bloque en su propio try/catch (Lección #2). Contuvo el daño de lo que resultó ser el bug de abajo, aunque no explicaba la causa todavía.
3. **TDZ de `DD_MUESTRA_CHICA_R`** (`f2f224c`): causa raíz de "Sin datos" en TESLA/MALETA + Drawdown en blanco — ver Lección #1 para el detalle completo. Confirmado con reproducción Playwright (40 reloads con el CSV real de Pedro: 0/40 errores tras el fix) y por Pedro en el dashboard real.
4. **Feature nueva — archivo permanente por mes en Firestore + tab Histórico** (`322dd70`): nueva colección `trades_history` (proyecto `peisys`), un doc por mes cerrado (`"YYYY-MM"`) con resumen agregado + desglose TESLA/MALETA + cada trade crudo saneado (Firestore no acepta `/` en claves de campo — headers como `"r/r teórico"` se sanean a `"r_r teórico"`). Se archiva solo al cerrar el mes calendario, nunca el mes en curso. Tab "Histórico" nueva: comparativa año a año + gráfico de R acumulado multi-año + botón "Sincronizar ahora" para forzar/backfill. Verificado con Playwright (Firestore mockeado, sin acceso real desde el sandbox): archiva exactamente el mes correcto, no reescribe de más en reloads sucesivos, sí reescribe al forzar, nunca toca el mes en curso.

### ⚠️ Pendiente — acción manual de Pedro
- [ ] **Firestore Rules del proyecto `peisys`:** agregar permiso de `read` en `trades_history` (el puente pasó de solo-escritura a también leer). Si la tab Histórico no carga, es esto.
  ```
  match /trades_history/{doc} {
    allow read, write: if true; // o el mismo criterio que ya tenés en earnings_hist
  }
  ```
- [ ] Abrir la tab Histórico y confirmar que carga (usar "Sincronizar ahora" para forzar el archivado de agosto si arranca vacía).
- [ ] Sigue sin reconfirmarse si Equity Curve y P&L por Activo (Chart.js) renderizan siempre bien con internet real — pedir capturas si vuelve a fallar.
- [ ] A futuro: sumar a Histórico el desglose por activo/sistema por año, no solo el agregado global (quedó afuera del MVP a propósito).

*Cerrado: 2026-09-08, sesión Cowork (Claude Sonnet 5).*

---

## Sesión 2026-09-08 (Cowork, 2da) — RTSI, SPY/SPX, deploy.sh — CERRADA, commit local sin pushear

Commit `5ef022a` preparado en Cowork, falta que Pedro lo pushee desde su Terminal (Cowork no tiene credenciales de GitHub, ver Workflows).

1. **Fix RTSI sin datos** (`fetchMOEX()`): causa no era CORS (a diferencia de HSTECH/MOEX/CSI300) sino que RTSI no devuelve `marketdata` bajo el board fijo `SNDX` que sí funciona para IMOEX. Se agregó fallback: si el board fijo no trae datos, reintenta contra el endpoint sin filtro de board (devuelve `marketdata` de todos los boards donde cotiza) y toma la primera fila con valor real. No toca el camino de IMOEX. **Sin verificar en vivo** — MOEX bloquea el fetch tanto desde este sandbox como desde la Mac de Pedro (sin red en ninguna de las dos), así que el fix está razonado a partir de cómo responde la API MOEX ISS documentada, no confirmado con una respuesta real. Confirmar en el dashboard real y avisar si sigue en blanco.
2. **Desambiguado SPY vs SPX:** tab Precios ahora dice "S&P 500 (SPY)" — el tab Índices sigue con el SPX real sin cambios. Resuelve la inconsistencia anotada en Pendientes.
3. **`deploy.sh` arreglado:** usa `git rev-parse --show-toplevel` en vez de asumir `~/Desktop/trading-desk` — ya funciona desde sesiones Cowork.
4. **Formalizado en git** el `historicos txt/CHANGELOG_PEI_trading_ARCHIVO_HISTORICO.md` — estaba movido a mano a esa carpeta pero git seguía viéndolo como "borrado" de la raíz (contenido intacto, nunca se había hecho `git mv`). Registrado como rename, sin cambios de contenido. Actualizadas las referencias a la ruta nueva en este mismo archivo.

### ⚠️ Pendiente — acción manual de Pedro
- [ ] Pushear el commit `5ef022a` desde la Terminal real (`cd ~/Desktop/trading-desk && git push origin main`).
- [ ] Confirmar en el dashboard real (después del push) que RTSI ahora muestra precio en la tab Mercado. Si sigue en blanco, es un board distinto al que probé y hay que abrir consola para ver el error real.

*Cerrado: 2026-09-08, sesión Cowork (Claude Sonnet 5).*

---

## Sesión 2026-09-08 (Cowork, 3ra) — Earnings por Año → Trimestre — CERRADA, commit local sin pushear

Feature que estaba anotada como "Próxima sesión" desde el 26/08. Nueva card en el tab Earnings, debajo de "Próximos Earnings": `initEarningsHistorico()` lee la colección `earnings_hist` (Firestore, la misma que `persistEarningsHist()` viene llenando sola desde el 07/09 en cada visita al tab) vía `window.peisysGetCollection` — mismo patrón que ya usa la tab Histórico para `trades_history`.

- Selector de año (se puebla solo con los años que tengan datos guardados) + tabla agrupada por Q1/Q2/Q3/Q4: fecha, empresa, EPS estimado/real, sorpresa % (real vs. estimado, coloreado verde/rojo), revenue estimado/real.
- Botón "Exportar CSV" del año seleccionado — mismo formato ARG que el resto del dashboard (delimitador `;`, coma decimal, BOM para que Excel lo abra bien).
- **Sin datos para probar todavía:** `earnings_hist` recién empezó a llenarse el 07/09, así que hoy la tabla va a aparecer vacía o con muy poco cargado — no es un bug, es que la colección todavía no acumuló earnings reportados. Se completa sola visitando el tab Earnings de vez en cuando (sin requests extra a Finnhub, usa el fetch normal del tab).

*Cerrado: 2026-09-08, sesión Cowork (Claude Sonnet 5).*

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

- ✅ **En vivo y actualizado:** https://pedritozar.github.io/trading-desk/ — último commit pusheado y confirmado en producción: `322dd70` (08/09, feature Histórico). Todo lo que dice este changelog ya está deployado — no hay commits locales pendientes de push.
- ✅ Tabs: Overview · Trades · Métricas · Precios · Mercado · Índices · Earnings · **Histórico (nuevo 08/09)** · ⚙ Config
- ✅ Account selector multi-broker (Todas/CMC Demo/MT5 Demo/CMC Live/MT5 Live), persiste en localStorage
- ✅ Métricas: Rachas, Drawdown (formato R+%+aviso muestra chica), TESLA/MALETA, Prop Firm, Kelly, Sesgo por Activo, Resumen Mensual/Anual — cada bloque aislado en su propio try/catch (Lección #2)
- ✅ Histórico: archivo permanente por mes en Firestore (`trades_history`) + comparativa año a año + gráfico multi-año — pendiente que Pedro confirme las Firestore Rules (ver sesión de arriba)
- ✅ Mercado: Currency Strength + Commodities (Twelve Data) · RVOL · Flujo Institucional (Barchart, link directo) · Calendario Macro (iframe Investing.com)
- ✅ Índices: SPX, RUT, SOX, HSTECH, CSI300, MOEX + rotación de sectores
- ✅ Earnings: watchlist (Apple/Tesla/Nike/Salesforce/Citi/Alibaba) vía Finnhub + histórico perpetuo en Firestore (`earnings_hist`) + vista "por Año → Trimestre" (nueva 09/09, ver Pendientes) con export CSV formato ARG
- ✅ Panel Demo vs Live · Sección Análisis (torta, por activo, castigados)
- ✅ CSV: parser `;` ARG + localStorage + 3 formas de cargar — **CSV Manual** (selector de archivo nativo, hay que repetirlo si el archivo cambia), **Fijar CSV** (File System Access API, solo Chrome/Brave/Edge — habilita Auto-sync cada 30s), **Pegar CSV** (modal con textarea, la más rápida para cargas puntuales)
- ✅ Puente PEI·SYS: escribe `resumen_trading/actual` en cada `renderAll()` (dashboard separado, solo escritura)
- ⚠️ **Pendiente, acción de Pedro:** CORS de Yahoo Finance en Índices (HSTECH/MOEX/CSI300 en blanco) — `cloudflare_worker_proxy.js` ya está listo, solo falta que Pedro lo deploye en su cuenta de Cloudflare (5 min, instrucciones en el propio archivo) y pegue la URL en Config.
- ✅ RTSI (dentro de Mercado): fix aplicado 09/09 (ver sesión de arriba) — causa era un board equivocado en la API de MOEX, no CORS. Sin verificar en vivo todavía.

### Archivos HTML
- **`index.html`** (raíz) → **el que Pedro abre siempre**, haciendo doble click en la carpeta. Es el archivo real y actualizado — se actualiza solo cuando se corre `deploy.sh` (o el equivalente manual, ver Workflows). Nunca hace falta usar la URL en vivo para verlo: abrir este archivo local ES ver la versión de siempre.
- **`HTML- DASBOARD/NO_ABRIR_fuente_para_editar.html`** → la fuente que se edita cuando hay que tocar código. Pedro NO debe abrir este para usar el dashboard — el nombre ya lo dice.

---

## Pendientes Trading System

### 🔴 Alta prioridad
- [ ] **Cargar 3 trades de agosto al Excel** (están en Notion, no en la bitácora): EUR/USD 12/08 GANADA MT5 Demo · GBP-AUD 11/08 PERDIDA CMC Demo · AUD/USD 25/08 PERDIDA CMC Demo (MALETA). Falta que Pedro pase Entrada/SL/TP. Quedan afuera SPY500 (EN CURSO) y EUR/JPY (orden pendiente).
- [ ] **Disciplina:** Excel y Notion tienen que estar al día los dos — si uno se adelanta al otro, el dashboard solo ve hasta donde llegó el Excel.

### 🟡 Media prioridad
- [ ] Evaluar CORS de Yahoo Finance en tab Índices (HSTECH/MOEX/CSI300) — sin diagnosticar.
- [ ] Probar **FMP (Financial Modeling Prep)** para el calendario económico — única opción gratis (250 req/día) sin probar todavía para la alerta 30min antes. Ya descartados: Finnhub premium (`/calendar/economic` da 403 en el tier gratis), TradingEconomics (pago desde USD 39/mes), Investing.com (cuenta de usuario, no da API), TradingView (solo widget embebido).
- [ ] Fila 32 de la hoja DASHBOARD del Excel apunta a "RUSSELL 2000" (activo que ya no está en la bitácora) — cambiar por uno real o hacerla dinámica.
- [ ] Embed del dashboard en Notion (`/embed` + URL de GitHub Pages).
- [ ] Probar Currency Strength con mercados europeos abiertos (4AM ARG).
- [ ] Re-rendir examen TESLA+MALETA — objetivo 9/10 (fallas previas: T1, T5, M6, ver Checklists abajo).
- [ ] Auditoría Notion "Venture Capital Firm" — acciones manuales de Pedro (Claude no puede borrar vía API): borrar boilerplate del template, resolver 2 páginas "BCE" duplicadas, confirmar si "PORTAFOLIO INSTITUCIONAL" es el mismo fondo Alfy, renombrar la raíz.

### 🟢 Backlog
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
| 2026-09-08 | Fix Max Drawdown · aislamiento renderMetricas() · TDZ de DD_MUESTRA_CHICA_R encontrada y arreglada (2da vez este bug, ver Lecciones) · feature nueva: archivo permanente por mes en Firestore + tab Histórico |
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

*v4.3 — Claude Sonnet 5 · 2026-08-26 (podado de 408 a ~270 líneas) · 2026-08-28 (2 fixes deployados) · 2026-09-06 (puente PEI·SYS documentado) · 2026-09-08 (podado de ~680 a ~380 líneas: sesiones del 26/08 al 07/09 comprimidas al historial, sección "Lecciones" creada para no perder el patrón de bugs repetidos)*
