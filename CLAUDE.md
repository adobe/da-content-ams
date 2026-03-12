# da-content-ams — Cloudflare Worker

Content proxy Worker for DA (Document Authoring). Proxies content requests from the edge to `aem-content-stage` S3 bucket, handling partition logic for preview/live.

## Rules

@/Users/schmidt/Documents/git/eds_tools/ams-eds-terraform/.cursor/rules/cloudflare-workers-conventions.md
@/Users/schmidt/Documents/git/eds_tools/ams-eds-terraform/.cursor/rules/cloudflare-workers-deployment.md
@/Users/schmidt/Documents/git/eds_tools/ams-eds-terraform/.cursor/rules/development-standards-shared.md

## Stack

- Runtime: Cloudflare Workers
- Config: `wrangler.toml`
- Entry: `src/`

## Key Responsibility

When `fstab.yaml` points to an external URL, the delivery worker does NOT append partition (`/live` or `/preview`). This worker handles that partition logic before reading from `aem-content-stage`.

## Branch Strategy

- `main` — upstream mirror. Do not commit here.
- `main-ams` — primary working branch
