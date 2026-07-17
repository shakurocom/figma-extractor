# figma-extractor docs

Documentation site for [@shakuroinc/figma-extractor](https://github.com/shakurocom/figma-extractor), built with [Fumadocs](https://fumadocs.dev) (Next.js, static export) and deployed to Cloudflare Workers as static assets.

## Development

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Content lives in `content/docs/*.mdx`; page order is set in `content/docs/meta.json`.

## Build

```bash
pnpm build        # static export to ./out
pnpm preview      # build + serve locally via wrangler
```

## Deploy

The site is deployed to Cloudflare Workers (static assets only, see `wrangler.jsonc`).

### Automatic (Workers Builds)

The Worker is connected to this GitHub repository via Workers Builds — every push to `master` that touches `docs/` triggers a build and deploy. Settings in the Cloudflare dashboard (Workers & Pages → figma-extractor → Settings → Build):

- **Root directory:** `/docs`
- **Build command:** `pnpm install --frozen-lockfile && pnpm build`
- **Deploy command:** `npx wrangler deploy`

### Manual

```bash
pnpm deploy       # build + wrangler deploy (requires `wrangler login`)
```
