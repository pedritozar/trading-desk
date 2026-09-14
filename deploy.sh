#!/bin/bash
MSG=${1:-"update dashboard"}
SOURCE="HTML- DASBOARD/NO_ABRIR_fuente_para_editar.html"
# Detecta la raíz del repo en vez de asumir ~/Desktop/trading-desk -- ese hardcode
# fallaba en sesiones Cowork (su $HOME no es /Users/pedritozar). Funciona igual
# desde la Mac de Pedro y desde cualquier otra ubicación del repo (fix 09/09).
REPO_DIR="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_DIR" ]; then
  echo "❌ No estás dentro del repo trading-desk (git rev-parse falló)"; exit 1
fi
cd "$REPO_DIR" || { echo "❌ No se pudo entrar a $REPO_DIR"; exit 1; }

# Revisión estricta de la carpeta ANTES de tocar git add (pedido de Pedro
# 14/09, tras encontrar archivos de otro proyecto sueltos acá). Si hay algo
# fuera de lugar, el deploy se corta acá -- no sigue a git add ni commit.
if [ -x "./check_folder.sh" ]; then
  ./check_folder.sh || { echo "❌ Deploy cancelado — resolvé la alerta de check_folder.sh primero"; exit 1; }
fi

cp "$SOURCE" ./index.html || { echo "❌ No se encontró el archivo fuente"; exit 1; }
git add index.html
git commit -m "$MSG"
git push origin main || git push origin main --force
echo "✅ Deploy completado → https://pedritozar.github.io/trading-desk/"
