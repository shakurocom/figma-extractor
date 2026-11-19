![Shakuro Figma extractor](title-image.png)
<br><br>

# Figma extractor

[![npm](https://img.shields.io/npm/v/@shakuroinc/figma-extractor)](https://www.npmjs.com/package/@shakuroinc/figma-extractor)
[![license](https://img.shields.io/npm/l/@shakuroinc/figma-extractor)](https://www.npmjs.com/package/@shakuroinc/figma-extractor)

Extract a style system (colors, effects, text styles, responsive variables) and SVG icons from Figma into ready-to-use TypeScript and CSS files.

## Setup

1. Install the package `pnpm add -D @shakuroinc/figma-extractor`
2. Add a config file `figma-extractor.config.js`
3. Add a variables JSON file exported from Figma
4. Run `pnpm figma-extract`

## Documentation

Full documentation: https://figma-extractor.shakuro.workers.dev

- [Get started](https://figma-extractor.shakuro.workers.dev/docs)
- [Configuration](https://figma-extractor.shakuro.workers.dev/docs/configuration)
- [CLI API](https://figma-extractor.shakuro.workers.dev/docs/cli-api)
- [How to find node id](https://figma-extractor.shakuro.workers.dev/docs/how-to-find-node-id)
- [Using themes in your project](https://figma-extractor.shakuro.workers.dev/docs/how-to-use-themes-in-your-project)

The documentation source lives in [`docs/`](docs) (built with [Fumadocs](https://fumadocs.dev), deployed to Cloudflare Workers).

Take a look at our <a href="https://shakuro.com/services/web-dev/?utm_source=github&utm_medium=repository&utm_campaign=figma-extractor">web development services</a>

If you need professional assistance with your mobile or web project, feel free to <a href="https://shakuro.com/get-in-touch/?utm_source=github&utm_medium=repository&utm_campaign=figma-extractor">contact our team</a>

## Claude Code plugins

The project relies on the Claude Code plugins declared in `.claude/settings.json` (`enabledPlugins` + `extraKnownMarketplaces`). That file only *enables* them for the team — Claude Code never installs plugins automatically, so every developer installs them once. Install with `--scope user`: the plugins are shared across projects, and `.claude/settings.json` stays the single source of truth for *which* plugins this repo needs.

### Sync plugins with Claude Code

Paste this prompt into Claude Code from the repo root — it emulates an "install missing plugins" command:

```
Sync my Claude Code plugins with this project.

1. Read `enabledPlugins` and `extraKnownMarketplaces` from `.claude/settings.json` (project scope).
2. Compare with `claude plugin list` and `claude plugin marketplace list`.
3. For every marketplace from `extraKnownMarketplaces` that is missing locally, run `claude plugin marketplace add <source>` using the `source` from the settings file.
4. For every plugin from `enabledPlugins` that is not installed in user scope, run `claude plugin install <plugin>@<marketplace> --scope user`.
5. Do not edit `.claude/settings.json`, `.claude/settings.local.json` or `~/.claude/settings.json` by hand — only the `claude plugin` CLI may change them.
6. Finish with a table: plugin, marketplace, status (already installed / installed now / failed with reason). Remind me to restart Claude Code if anything was installed.
```

Or install manually:

```sh
claude plugin install context-mode@context-mode --scope user
claude plugin install skill-creator@claude-plugins-official --scope user
claude plugin install superpowers@claude-plugins-official --scope user
```

Restart Claude Code after installing; `claude plugin list` shows what is installed.

When adding a new plugin, install it with `--scope user`, add it to `enabledPlugins` (and its marketplace to `extraKnownMarketplaces`) in `.claude/settings.json`, commit that change, and add the command to the list above.
