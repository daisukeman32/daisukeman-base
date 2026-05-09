#!/bin/sh
# git push + Cloudflare Pages デプロイを一発で実行
cd "$(dirname "$0")"
git push && npx wrangler pages deploy . --project-name daisukeman-base --branch main --commit-dirty=true
