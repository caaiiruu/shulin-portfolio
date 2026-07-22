
#!/bin/zsh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
QA_DIR="$ROOT/qa"
OUT="$QA_DIR/browser-results"
rm -rf "$OUT" "$QA_DIR/test-results" "$QA_DIR/report" "$QA_DIR/browser-results.zip"
mkdir -p "$OUT"
cd "$QA_DIR"
if [ ! -d node_modules ]; then npm install; fi
npx playwright install chromium webkit
cd "$ROOT"
python3 -m http.server 4173 --bind 127.0.0.1 > "$QA_DIR/server.log" 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
sleep 2
cd "$QA_DIR"
npx playwright test
cp -R test-results "$OUT/" 2>/dev/null || true
cp -R report "$OUT/" 2>/dev/null || true
zip -r browser-results.zip browser-results >/dev/null
open -R "$QA_DIR/browser-results.zip"
echo "QA complete: $QA_DIR/browser-results.zip"
