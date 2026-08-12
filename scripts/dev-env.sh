#!/usr/bin/env zsh
# Prepend the local Node 24.19.0 toolchain (Homebrew is not installed).
# From repo root:  source ./scripts/dev-env.sh
export PATH="${HOME}/.local/nodejs/bin:${HOME}/.local/bin:${PATH}"
