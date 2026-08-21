#!/usr/bin/env node
/*
 * Renders wrangler.toml from wrangler.toml.tpl by substituting ${VAR} tokens
 * with values from process.env. Mirrors the helix-cloudflare-*-ams convention.
 *
 * Env vars are sourced from ams-eds-terraform's environments/<env>.env (generated
 * by scripts/generate-env-file.sh) — customer/env specifics live there, NOT in
 * this repo. Invoked via the `predeploy` npm hook.
 *
 * When NODE_ENV is set (the env-var-driven deploy path), every ${VAR} in the
 * template MUST resolve or this exits 1.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tplPath = path.join(repoRoot, 'wrangler.toml.tpl');
const outPath = path.join(repoRoot, 'wrangler.toml');

const envVarDrivenMode = Boolean(process.env.NODE_ENV);
const tpl = fs.readFileSync(tplPath, 'utf8');
const missing = new Set();

const rendered = tpl.replace(/\$\{(\w+)\}/g, (match, key) => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    missing.add(key);
    return envVarDrivenMode ? '' : match;
  }
  return value;
});

if (envVarDrivenMode && missing.size > 0) {
  console.error(`✗ Missing required env vars: ${[...missing].sort().join(', ')}`);
  console.error('  Source the environment file (environments/<env>.env) before re-running.');
  process.exit(1);
}

fs.writeFileSync(outPath, rendered);
console.log(`✓ Rendered ${path.relative(process.cwd(), outPath)} from wrangler.toml.tpl`);
