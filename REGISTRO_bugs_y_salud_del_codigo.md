# REGISTRO DE BUGS Y SALUD DEL CÓDIGO — trading-desk

**Creado:** 2026-11-11 (sesión Cowork, 10ma) · **Propósito:** ver en el tiempo *cada cuánto* aparecen los bugs, *por qué* y *de dónde vienen* (código, error mío como modelo, API externa, navegador, datos, proceso).
**Relación con el CHANGELOG:** el `CHANGELOG_PEI_trading_v4_3.md` cuenta qué se hizo y qué sigue; este archivo es el **libro de contabilidad de bugs y de la salud del código**. Las *Lecciones* del CHANGELOG son las reglas; acá están los casos que las originaron y el conteo de cuántas veces se rompieron.

> **Cómo leer las clasificaciones (honestidad primero).** La columna *Causa* es **mi clasificación, inferida** de lo que dicen el CHANGELOG, el archivo histórico y los mensajes de commit. No es un hecho probado. Los commits de abril a agosto y parte de septiembre **no llevan el trailer `Co-Authored-By`**, así que no se sabe quién escribió ese código (Pedro usa varias IA: Claude, DeepSeek, Gemini). **No atribuyo a Claude nada que no esté documentado como mío.** Sólo marco `CLA` cuando el CHANGELOG lo dice con esas palabras ("la reintroduje yo", "las había introducido yo", "yo ya había dicho que estaba hecha") o lo hice yo en esta sesión.

## Códigos

| Causa | Significado |
|---|---|
| `COD` | Error de código o de diseño (lógica, orden de ejecución, fórmula mal referenciada, falta de aislamiento). **Autor no determinable** salvo que diga lo contrario |
| `CLA` | Error de Claude como modelo, **documentado como propio** (reintroducir un bug ya conocido, afirmar "hecho" sin verificar, contar mal) |
| `API` | Servicio externo: CORS, rate limit, plan gratuito sin el dato, endpoint cambiado |
| `NAV` | Diferencia entre navegadores (Safari vs Chrome) |
| `DAT` | Formato o dato de entrada: coma decimal ARG, fechas D/M, key guardada a medias, celdas del Excel mal cargadas |
| `PRO` | Proceso: prueba insuficiente, documentación desactualizada, archivo equivocado editado |

| Detección | Significado |
|---|---|
| `AUD` | Auditoría o revisión de código/Excel | `VER` | Verificación contra cálculo a mano |
| `CON` | Consola del navegador / verificación en vivo | `USR` | Pedro vio el síntoma (captura o reporte) |
| `TEST` | Test automatizado (jsdom/Playwright) | `AUTO` | Lo noté yo al releer mi propio trabajo |
| `PRE` | Preventivo: se detectó antes de que fallara | `ND` | El CHANGELOG no dice cómo se detectó |

## Registro cronológico

| ID | Fecha | Bug | Causa | Detección | Cómo se arregló |
|---|---|---|---|---|---|
| B01 | 26/08 | Excel: P&L y R/R Teórico corridos 2 filas (`delete_rows` de openpyxl movió las fórmulas); ganadoras mostraban -1,00 | COD | AUD | Valores literales / fórmulas autoreferenciadas por fila |
| B02 | 26/08 | Excel: precios sin punto decimal (`1729025` por `17.29025`) → R/R absurdos (515,92) | DAT | AUD | 6 celdas corregidas |
| B03 | 26/08 | Excel: Win Rate y P&L por activo apuntaban a la columna equivocada (siempre 0%) | COD | AUD | Referencias corregidas |
| B04 | 26/08 | Excel: Drawdown Máx era copia del "Peor Trade", no medía caída acumulada | COD | AUD | Columnas AUX T:V en DASHBOARD |
| B05 | 26/08 | Key de Finnhub guardada a medias (20 de 40 caracteres, mitades casi idénticas); rompía Earnings, precios S&P/NASDAQ y calendario | DAT | AUD | Key completa |
| B06 | 26/08 | `parseFloat("+2,87")` devuelve 2: P&L Neto daba +4,00R en vez de +6,62R | DAT | VER | `parseNumAR()`, 23 llamadas migradas |
| B07 | 26/08 | **TDZ #1:** `MESES_ABREV` declarada después de `restoreCSV()` → Demo vs Live y Resumen Mensual vacíos | COD | VER | Constante movida arriba, con comentario |
| B08 | 28/08 | Diagnóstico "es Twelve Data" desactualizado: forex ya se había migrado a Frankfurter sin documentarlo | PRO | CON | CHANGELOG corregido |
| B09 | 28/08 | CORS bloqueado en `api.frankfurter.app` desde GitHub Pages (permanente) | API | CON | `exchangerate-api.com/v4`, mismo JSON |
| B10 | 28/08 | `showTab()` usaba `event.target` (global implícito): en Safari cortaba el `onclick` y 3 tabs nunca cargaban datos | NAV | AUD | Los botones pasan `this` como argumento |
| B11 | 06/09 | Puente PEI·SYS agregado editando `index.html` directo (sin pasar por la fuente) + 3 HTML duplicados | PRO | USR | Se copió index→fuente, borrados duplicados, fuente renombrada `NO_ABRIR_…` |
| B12 | 07/09 | `renderAll()` sin try/catch por función: un `new Chart` fallido cortaba Trades y Métricas | COD | ND | Array de funciones con try/catch individual + guard `typeof Chart` |
| B13 | 07/09 | "CSV Manual" no disparaba si se elegía el mismo archivo dos veces (el `change` no se repite) | COD | ND | `de8070d` |
| B14 | 07/09 | Gráficos en blanco que "se resolvieron solos" (hipótesis: CDN cacheando mal) | API | ND | Sin causa confirmada — **abierto como observación** |
| B15 | 08/09 | Max Drawdown en % engañoso con pico de capital chico | COD | ND | Formato R + % + aviso de muestra chica |
| B16 | 08/09 | **TDZ #2:** `DD_MUESTRA_CHICA_R` declarada debajo de `restoreCSV()` (**la reintroduje yo**, con la regla ya escrita); TESLA/MALETA "Sin datos" y Drawdown en blanco. Reproducido 40/40 en Chromium. Misma búsqueda halló `analisisView` | CLA | USR+TEST | Ambas declaraciones movidas arriba |
| B17 | 08/09 | `renderMetricas()` sin aislamiento interno: un fallo tumbaba paneles vecinos | COD | USR+TEST | try/catch por bloque |
| B18 | 08/09 | RTSI: board equivocado en la API de MOEX (no era CORS) | API | ND | Board corregido |
| B19 | 08/09 | HTTP 429 de Twelve Data: la ventana de créditos vivía sólo en memoria y se reseteaba al recargar | COD | USR | Ventana persistida en `localStorage['pei_td_window']` |
| B20 | 08/09 | Panel Commodities de Mercado en 0,00 y RVOL en 0.0x (hipótesis: el plan gratis no trae esos símbolos/volumen) | API | USR | **ABIERTO** — Pedro debe probar 2 URLs |
| B21 | 14/09 | Badge "ESTÁTICO" engañoso en Índices con datos reales | COD | ND | `isLive` corregido |
| B22 | 14/09 | CORS de Yahoo en Índices (HSTECH/MOEX/CSI300) | API | ND | Worker de Cloudflare como proxy |
| B23 | 19/10 | Si Yahoo fallaba (sin proxy) se guardaba un snapshot con todo en `null` | COD | ND | No se guarda snapshot incompleto + reintento |
| B24 | 22/10 | **TDZ #3:** `TRIPLE_WITCHING_AVISO_DIAS`, `chartEquity`, `chartActivoBars` (**las había introducido yo**); causaba la "caja vacía" bajo el banner y gráficos sin dibujar | CLA | TEST | Declaradas arriba de `restoreCSV()` |
| B25 | 30/10 | Corrección del CHANGELOG falló en silencio (`AssertionError`, commit vacío) y ya había dicho "hecho" | CLA | AUTO | Re-lectura; Lección #5 |
| B26 | 30/10 | Conteos mal escritos por mí: "26 pruebas" (eran 25) y "3 commits" (eran 4) | CLA | AUTO | Corregido (amend) |
| B27 | 30/10 | `col(t,'riesgo')` matchea por substring: "RIESGO REAL%" quedaría pisada por "RIESGO%" | COD | PRE | `riesgoDeTrade()`; Lección #6 |
| B28 | 09/11 | `catch(e){}` vacío en `restoreCSV()`: un error de carga se veía como "no hay datos" y las pruebas sin CSV guardado no lo detectaban | PRO | AUD | `console.error` en el catch; `test2.js` con CSV real; Lección #7 |
| B29 | 09/11 | Fechas D/M (`30/10/2026`) leídas como inválidas: 2 de 5 trades quedaban fuera del Resumen Mensual | DAT | AUD | `parseFechaFlex()` en 10 lugares (las ambiguas ≤12 siguen M/D) |
| B30 | 09/11 | Tipo de cambio: cada ciclo de precios re-pedía todo (riesgo de rate limit) | COD | AUD | `fetchFxRatesAll()` con caché de 1 h |
| B31 | 09/11 | Worker de Cloudflare sin caché de borde ni reintento ante 429/5xx | COD | AUD | Worker v2 (**falta que Pedro lo re-deploye**) |
| B32 | 11/11 | 6 `catch` vacíos en fuentes de datos (tipo de cambio, Finnhub, MOEX ×4): una fuente caída no dejaba rastro | COD | AUD | `console.warn` con símbolo y mensaje |
| B33 | 11/11 | Mi primer arreglo de B32 usó la variable `url` donde el loop del tipo de cambio la llama `u` (habría tirado `ReferenceError` dentro del propio catch) | CLA | AUTO | Corregido antes de commitear; ESLint `no-undef` = 0 |

*No hay entradas de abril a junio: el CHANGELOG sólo conserva el detalle desde agosto. Git muestra commits de arreglo en esos meses (ver abajo) pero sin descripción recuperable del bug.*

## Conteos

**Por causa (33 bugs documentados):**

| Causa | Cantidad | % |
|---|---|---|
| COD | 15 | 45 % |
| CLA | 5 | 15 % |
| API | 5 | 15 % |
| DAT | 4 | 12 % |
| PRO | 3 | 9 % |
| NAV | 1 | 3 % |

**Por mes (fecha del bug):** agosto 10 · septiembre 12 · octubre 5 · noviembre 6 (al 11/11).
**Proxy independiente — commits de git cuyo mensaje habla de fix/bug/error, sobre el total de commits del mes:** abril 6/14 · mayo 3/4 · junio 7/11 · agosto 5/5 · septiembre 19/49 (39 %) · octubre 7/27 (26 %) · noviembre 2/3. (Es una búsqueda por palabras clave: sirve de tendencia, no de recuento exacto.)

**Cómo se detectaron (33):** AUD 11 · ND 8 · USR 5 · AUTO 3 · VER 2 · CON 2 · TEST 1 · PRE 1.

## Análisis: ¿cada cuánto y por qué aparecen?

1. **Aparecen en racimos, no a ritmo constante.** Los días con más bugs son los de auditoría: 26/08 (8), 08/09 (6), 09/11 (4), 30/10 (3), 11/11 (2). Cuando se mira a propósito aparecen; cuando no, se acumulan en silencio. La mitad de lo documentado (11 de 33) se encontró por auditoría, no porque algo se rompiera a la vista.
2. **El patrón que más se repite es el TDZ (orden de ejecución):** 3 episodios (26/08, 08/09, 22/10) y 6 variables en total (`MESES_ABREV`, `DD_MUESTRA_CHICA_R`, `analisisView`, `TRIPLE_WITCHING_AVISO_DIAS`, `chartEquity`, `chartActivoBars`). Separación entre episodios: 13 y 44 días. **Dos de los tres (B16, B24) los reintroduje yo después de que la regla estaba escrita en el CHANGELOG.** Conclusión: *una regla escrita no alcanza*; lo que sí funcionó fue el test con CSV real cargado (B24 lo encontró un test, no una persona). El origen de fondo es de diseño: un archivo de ~7.000 líneas donde `restoreCSV()` dispara casi todo el render en el momento de carga y el orden de las `const` importa.
3. **Errores de Claude (5 de 33, 15 %).** Son de dos tipos: (a) *reintroducir un bug ya conocido* por aplicar un arreglo local sin correr la verificación completa (B16, B24); (b) *afirmar o escribir un número sin comprobarlo* (B25, B26, B33). Ambos tipos se evitan con el mismo hábito: **leer el resultado real antes de decir "hecho"** y **correr el test con CSV real después de cada cambio**. No hay evidencia en el CHANGELOG de errores de Claude en abril–agosto, pero tampoco de que no los hubiera: esos commits no tienen trailer.
4. **Externos (API 5 + NAV 1 = 6, 18 %) no se evitan, se absorben.** Planes gratuitos, CORS y 429 van a seguir apareciendo. Lo que baja su costo es lo que se hizo el 09/11 (caché, reintentos, fallback, logs en lugar de `catch` vacío).
5. **Datos regionales (DAT 4, 12 %):** coma decimal ARG, fechas D/M, celdas mal cargadas. Mientras el Excel lo cargue un humano en formato local, esta categoría va a seguir. B29 sólo cubre las fechas inequívocas.
6. **Los fallos silenciosos son el riesgo más caro:** B01–B06, B28 y B32 (8 de 33) mostraban números plausibles o "sin datos" sin ningún error visible. Por eso la Lección #3 (verificar contra cálculo a mano) y #7 (no usar `catch` vacío).
7. **Tendencia:** la proporción de commits que arreglan algo bajó de 39 % (septiembre) a 26 % (octubre). Con tan pocos datos no se puede afirmar mejora; el indicador a mirar es **cuántos TDZ nuevos aparecen** (hoy: 0 desde el 22/10, es decir 20 días al 11/11).

## Snapshot de salud del código

**Cómo se mide (reproducible):** `wc` y `grep` sobre `HTML- DASBOARD/NO_ABRIR_fuente_para_editar.html`; ESLint 8 con las reglas `no-undef`, `no-redeclare`, `no-dupe-keys`, `no-unreachable`, `no-const-assign`, `no-use-before-define` (config en `$HOME/scratch/jd/eslintrc.json`, fuera del repo); los 7 tests de `$HOME/scratch/jd`.

| Métrica | 11/11/2026 (después de B32) |
|---|---|
| Líneas / tamaño del HTML fuente | 6.876 / 345.182 bytes (`index.html` idéntico, verificado con `cmp`) |
| Líneas del script principal | 5.156 |
| Funciones declaradas | 230 · nombres duplicados: **0** |
| ESLint | **0 errores** · 30 avisos `no-use-before-define` (variables que se usan dentro de funciones antes de su declaración por orden del archivo; el test con CSV real no dispara ninguna en la carga) |
| `catch` vacíos | **14** (antes 20); los 14 restantes son `localStorage` (modo privado o cuota llena), tolerables |
| Marcadores TODO/FIXME reales | 0 (las 2 coincidencias son la palabra «TODOS» en comentarios) · `console.log` sueltos: 0 |
| Claves en el código | Finnhub y Twelve Data (públicas en el repo, **pendiente rotar**) · Firebase `apiKey` (pública por diseño; la protección real son las reglas de Firestore, hoy abiertas) |
| Claves de `localStorage` | 16 distintas + `CLASE_MAP_KEY` |
| Librerías | Chart.js 4.5.1 · Firebase 12.19.0 |
| Tests | 7 scripts, **0 fallas**: Riesgo 25 · carga con CSV real + 13 pestañas · fechas (antes/después) · 13 casos de fecha · tipo de cambio 11 · catch · Worker 17 |
| Tests versionados en el repo | **No** (viven en la VM de Cowork; si la VM se pierde, se pierden) |
| Repo | 10 archivos versionados + este registro · 113 commits al 11/11 (antes de los de hoy) |

**Historial de snapshots (agregar una fila por sesión de revisión):**

| Fecha | Líneas HTML | Funciones | Errores ESLint | Avisos TDZ | `catch` vacíos | Tests | Bugs nuevos |
|---|---|---|---|---|---|---|---|
| 11/11/2026 | 6.876 | 230 | 0 | 30 | 14 | 7/7 OK | 2 (B32, B33) |

## Bugs abiertos / sin resolver

- **B14** (gráficos en blanco que se arreglaron solos, 07/09): causa sin confirmar. Si vuelve, mirar la consola y la pestaña Network.
- **B20** (Mercado: commodities en 0,00 y RVOL en 0.0x): Pedro debe abrir 2 URLs de Twelve Data (en el CHANGELOG, Pendientes). Alternativa ya posible: alimentar el panel desde Yahoo + proxy como la tab Commodities.
- **B31** (Worker v2): el archivo está listo, falta re-deploy en Cloudflare.
- **Claves en el código público** y **reglas de Firestore abiertas** (riesgo, no bug): decisión de Pedro.
- **Fechas ambiguas ≤12** siguen leyéndose M/D (límite conocido de B29).
- **Sin probar en Safari:** Riesgo, librerías nuevas y tipo de cambio.

## Protocolo para seguir llenando este registro

Al cerrar cada sesión en la que se encontró o arregló algo:
1. Agregar una fila `Bnn` (siguiente número) con fecha, síntoma, causa, detección y arreglo. Si no se sabe la causa, poner `ND` o "sin confirmar" y dejarlo en *Abiertos*; nunca inventar.
2. Marcar `CLA` **sólo** si fue un error mío documentado; si el código tiene trailer `Co-Authored-By: Claude` pero el error no está descrito como propio, queda `COD`.
3. Si un bug repite uno anterior, anotar en la fila "repite Bxx" y actualizar el análisis (ese conteo es lo que mide si una Lección funciona).
4. Actualizar *Conteos* y agregar una fila al *Historial de snapshots* (correr los tests y ESLint antes y poner los números reales, no estimados).
5. Si cambia la lista de archivos de la raíz, actualizar `check_folder.sh`.
