# Project instructions

Read DESIGN.md and research/DATA-PROVENANCE.md before changing the site. Preserve the selected Editorial Warm system and Iconoir icons. This is a local-only portfolio; do not create a remote or push. The existing Git dates are a requested staged history, not actual development dates.

<!-- better-design:start -->
Use the Better Design MCP for UI work. Start with find-design-system (existingScreen: true for an existing screen), retain the product's design, get UI principles before styling and UX principles before behavior, then review with get-review-rules, check-comprehension and inspect-spacing on rendered evidence. Fix every critical and serious finding.

Read DESIGN.md. Compose installed components/ui/* primitives. Never hand-roll a button, input or dialog when an installed component fits. Preserve font loaders and resolve every font token. Use app/globals.css tokens. See .better-design/rules.md for the full contract.
<!-- better-design:end -->


<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
