#!/usr/bin/env zsh
set -euo pipefail
source "${0:A:h}/dev-env.sh"
echo "node: $(command -v node) $(node -v)"
echo "npm:  $(command -v npm) $(npm -v)"
echo "npx:  $(command -v npx) $(npx -v)"
npx --no-install vite --version
npx --no-install tsc --version
