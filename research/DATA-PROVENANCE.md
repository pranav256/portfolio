# Content provenance

Prepared on November 5, 2026. The requested September dates describe the staged local Git history, not the date of this research.

## Sources

The initial `github-repositories.json` was a reduced copy of the public GitHub repository snapshot found at `D:\Projects\ANTIGRAVITY\all_public_repos.json`. Once network access was enabled, `scripts/fetch-github.mjs` replaced it with a fresh, reduced response from the public GitHub API. `github-live/manifest.json` records retrieval times, URLs, and HTTP results. `github-profile.json` and the four READMEs in `github-live/` were also retrieved directly.

The snapshot contains 76 public repository records belonging to `pranav256`: 49 original repositories and 27 forks. The copy retains repository names, descriptions, URLs, languages, topics, fork flags, and timestamps. It excludes API plumbing and unrelated owner metadata.

## Editorial rules

- Feature original repositories; clearly identify any fork mentioned elsewhere.
- Describe features supported by repository descriptions, topics, or a subsequently inspected README.
- A repository creation date establishes when a repository existed, not when Pranav first learned a language or held a job.
- Do not invent employers, clients, qualifications, user counts, endorsements, project outcomes, availability, or contact details.
- Blog essays written for this site are new editorial copy; do not present them as imported historical posts.
- Link directly to the matching public repository. Do not create, push to, or otherwise write to GitHub.

## Current research access

The initial environment blocked external network requests and browser execution. The resumed session has working network access, Playwright Chromium, and Better Design MCP tools. All reference URLs have now been opened in a real browser. Some hardware-heavy or gated pages required further attempts; see `REFERENCE-STUDY.md` and the actual captures for the limits of those observations.

No inaccessible reference has been marked as studied, and no screenshot or computed-style observation has been fabricated.
