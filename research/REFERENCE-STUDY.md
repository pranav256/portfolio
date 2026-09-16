# Reference study

Captured November 5, 2026, with Playwright in real Chromium at 1440 × 1000. Each named site was opened. Desktop, scroll, and hover captures are saved when the site and browser permitted them. `observation.json` contains computed CSS, not guessed font names. Follow-up `settled-*` files distinguish content after a loader or entry action from the initial screen.

| Reference | Concrete observations | Adaptation / limitation |
| --- | --- | --- |
| Andreas | DaVinci/Newsreader display serif at 132px with Geist body; black/white content framed by blue pixel clouds; compact pill navigation; arrow transition uses a 0.6s cubic-bezier curve; many canvas elements. | Serif/sans contrast, small navigation, artwork as identity. Initial programmatic scrolling stayed at the hero; follow-up uses wheel input. |
| Beige Zone | Avery Display/Avery/Avery Mono; cream and purple; split index/detail layout; recessed illustrated preview; native cursor hidden; color and surface transitions around 0.3–1s. | A consistent material and illustration language. Do not adopt the hidden cursor or the dense text at mobile sizes. |
| Griflan Labs | Warm near-black canvas, cream serif wordmark, restrained sans/mono-sized support. The browser displays a WebGPU requirement. | Only the fallback is verified. The underlying scene, transitions, and motion cannot be inferred from it. |
| Daiki Fujita | Inter Tight, warm gray/black palette; 288px/0.86-line-height display in the DOM; project titles around 78px; 0.2s link color transition. | Large type against a quiet ground. The initial screenshots show a loader and then an Enter gate; a follow-up attempts the actual entry. |
| Webdrift | Host sans with Geist Mono details; near-black, warm white, deep red; 124px tight headline; a 3D keypad beside copy; animated project transitions; an optional retro desktop intro. | Artwork beside the headline, compact technical detail, explicit project action. Some additional full-page captures timed out; desktop and scroll captures exist. |
| Endcap | Heavy Endcap Grotesk/Hanken, ~192px display, warm off-white, chartreuse/ink surfaces, thin line illustrations. Section titles reveal with a 1s transform/filter transition. | Scale contrast, line art, varied section rhythm. Retain the selected Editorial Warm palette instead of borrowing chartreuse. |
| Ys uria | The initial view is black with sound/muted entry choices. | Do not infer the full design from the entry gate. A follow-up uses the muted entry; no autoplay sound will be adopted. |
| Nader | Inter throughout; light gray, hairline grid, bright green, modular letter/art collage; 0.15s hover colors; project and writing lists lower down. | Clear hierarchy between selected work, small experiments, and writing; color reserved for emphasis. |
| First December | Tartuffo display serif (80–120px), PP Neue Montreal body, DM Mono details; warm cream and near-black; film-led opening and large editorial sections. | Serif/sans/mono hierarchy, spacious pacing, full footer wayfinding. Some portfolio media explicitly showed “No media found”; those are not successful media observations. |
| Vadim Carazan | Editorial Old Italic / Instrument Serif paired with Inter Tight; warm-white on near-black; compact edge navigation and work metadata in the DOM. Initial images show a loader. | The requested illustrated/art-driven motifs are a direction from the brief, not a verified observation of this current loading view. Do not copy a presumed older design. A longer follow-up checks the actual artwork. |
| Suho | Figtree; purple vortex opening, dark night palette changing to warm-white project sections; very large, tight section type; scroll-led narrative. | A change of scale and an original illustrated atmosphere. Captured desktop and three scroll views; first-link hover timed out and is unverified. |
| Awwwards portfolio board | Inter Tight, neutral gray/white, image-first gallery with small captions and filter navigation; varied type-led, illustrated, and 3D portfolios. | Give project imagery room, and keep navigation readable. Desktop and three scroll captures exist; an extra full-page screenshot timed out. |

## Shared direction

Use a strong type pairing, one coherent palette, real work, and memorable original art. Keep text and actions stable while artwork carries the movement. Native scrolling, immediate content, visible keyboard focus, and a quiet blog make the experience more dependable than the references' loading and audio gates.

No artwork, customer name, testimonial, project screenshot, or copy from these references is reused in the portfolio.
