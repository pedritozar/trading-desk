#!/bin/bash
MSG=${1:-"update dashboard"}
SOURCE="HTML- DASBOARD/NO_ABRIR_fuente_para_editar.html"
REPO_DIR="$HOME/Desktop/trading-desk"
cd "$REPO_DIR" || { echo "❌ No se encontró ~/Desktop/trading-desk"; exit 1; }
cp "$SOURCE" ./index.html || { echo "❌ No se encontró el archivo fuente"; exit 1; }
git add index.html
git commit -m "$MSG"
git push origin main || git push origin main --force
echo "✅ Deploy completado → https://pedritozar.github.io/trading-desk/"
