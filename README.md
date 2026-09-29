# Pranav

Personal portfolio and searchable Markdown blog, built with Next.js, React, and TypeScript. Includes dark and light themes, project illustrations, and an RSS feed.

## Run locally

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. For production, run `npm run build` followed by `npm run start`. On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

## Content

Posts live in `content/posts`. Each Markdown file needs a title, description, quoted publication date, and category in its frontmatter. The filename becomes its URL.

Project selections live in `lib/projects.ts`; GitHub data lives in `data`. Run `npm run sync:data` to refresh the public profile and repositories. Set the `NEXT_PUBLIC_SITE_URL` environment variable before building to configure canonical URLs, RSS, and the sitemap.

## Checks

```sh
npm run lint
npm run typecheck
npm run verify
npm run verify:theme
npm run verify:motion
npm run verify:ui
```

Browser checks require `npx playwright install chromium` and a running production server. Set `REVIEW_THEME=light` to check the light theme. Test output is ignored by Git.

Fonts are self-hosted, with licenses in `public/fonts`. Icons are from Iconoir.
