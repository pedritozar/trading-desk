#!/bin/bash
# check_folder.sh — Revisión estricta de la carpeta trading-desk antes de
# cualquier `git add`. Pedido de Pedro 14/09 tras encontrar archivos de OTRO
# proyecto (ZAR Vanguard / Fondo de Emergencia) sueltos acá adentro por una
# sesión de Cowork que escribió en la carpeta equivocada.
#
# Uso: ./check_folder.sh   (o lo llama deploy.sh automáticamente antes de
# hacer git add — si esto devuelve ALERTA, deploy.sh corta y no sigue).
#
# Qué hace: compara el CONTENIDO REAL de la carpeta raíz contra una lista
# blanca de lo que pertenece a este repo. Cualquier archivo o carpeta nueva
# que no esté en la lista y no esté cubierto por .gitignore = ALERTA ROJA.
# Así, si otro proceso/sesión vuelve a tirar archivos de otro proyecto acá,
# se detecta ANTES de que un `git add -A`/`git add .` (aunque hoy deploy.sh
# no lo use) los suba por error a este repo público.

REPO_DIR="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_DIR" ]; then
  echo "❌ No estás dentro del repo trading-desk (git rev-parse falló)"; exit 1
fi
cd "$REPO_DIR" || exit 1

# ── Lista blanca: lo que SÍ pertenece a este repo ──
# Archivos sueltos en la raíz (trackeados o no, pero legítimos)
ALLOWED_FILES=(
  ".gitignore"
  "CHANGELOG_PEI_trading_v4_3.md"
  "RESEARCH_ideas_wallstreet.txt"
  "cloudflare_worker_proxy.js"
  "deploy.sh"
  "check_folder.sh"
  "index.html"
  "tracker_bitacora_traiding__DEFINITIVO.csv"
  "tracker_bitacora_traiding__DEFINITIVO.xlsx"
  ".DS_Store"
)
# Carpetas de primer nivel legítimas
ALLOWED_DIRS=(
  "HTML- DASBOARD"
  "historicos txt"
  "traiding:cmt"
  ".git"
)

ALERTAS=()

# Chequear cada entrada de primer nivel contra las listas blancas
while IFS= read -r entry; do
  name="$(basename "$entry")"
  if [ -d "$entry" ]; then
    match=0
    for allowed in "${ALLOWED_DIRS[@]}"; do
      [ "$name" == "$allowed" ] && match=1 && break
    done
    [ "$match" -eq 0 ] && ALERTAS+=("📁 Carpeta NO reconocida: \"$name\" — no pertenece a trading-desk según la lista blanca de check_folder.sh")
  else
    match=0
    for allowed in "${ALLOWED_FILES[@]}"; do
      [ "$name" == "$allowed" ] && match=1 && break
    done
    [ "$match" -eq 0 ] && ALERTAS+=("📄 Archivo NO reconocido: \"$name\" en la raíz — no pertenece a trading-desk según la lista blanca de check_folder.sh")
  fi
done < <(find . -maxdepth 1 -mindepth 1 ! -name ".git")

# Doble chequeo defensivo: nada que matchee patrones de secretos debería
# estar ni siquiera untracked-pero-por-agregar. git check-ignore confirma
# que .gitignore los tapa; si ALGO sensible aparece sin estar ignorado, alertar.
while IFS= read -r f; do
  [ -z "$f" ] && continue
  if ! git check-ignore -q "$f" 2>/dev/null; then
    case "$f" in
      *contr*eña*|*contr*ena*|*contrase*|*contrsen*|*password*|*passwd*|*credencial*|*.key|*.pem|*.env*|*secrets*|*token*.txt|*mt5*.png|*MT5*.png)
        ALERTAS+=("🔴 POSIBLE SECRETO sin ignorar: \"$f\" — revisar antes de commitear")
        ;;
    esac
  fi
done < <(git status --porcelain | awk '{print $2}')

echo "════════════════════════════════════════"
echo " check_folder.sh — trading-desk"
echo "════════════════════════════════════════"
if [ ${#ALERTAS[@]} -eq 0 ]; then
  echo "✅ OK — la carpeta coincide con lo esperado, nada fuera de lugar."
  exit 0
else
  echo "🔴 ALERTA ROJA — hay ${#ALERTAS[@]} cosa(s) que no cuadran:"
  for a in "${ALERTAS[@]}"; do
    echo "  - $a"
  done
  echo ""
  echo "No se sigue con git add hasta resolver esto."
  exit 1
fi
