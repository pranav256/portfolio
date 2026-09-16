# Pranav — design direction

Prepared on November 5, 2026, before application code. The local commit dates are a requested staged history, not research dates.

## Foundation

The user selected [Editorial Warm](https://better-design.com/design-systems/editorial-warm). Keep its cream canvas, warm ink, terracotta accent, Fraunces headings, Inter body, JetBrains Mono code, glass surfaces, and 24px base radius. Install the React kit; do not recreate its primitives. The assigned icon family is Iconoir, default variant.

The portfolio is for people exploring Pranav's software and writing. Lead with what he builds and links to the actual work. This is an informational personal site, not an agency sales page. No invented clients, availability, outcomes, career credentials, or testimonials.

## Short style guide

- **Type:** expressive, large Fraunces display type on the home and writing index; comfortable Inter for descriptions; Fraunces section anchors; mono only for code and aligned figures. Use an italic phrase for emphasis, not a second decorative font. Article text stays within 68 characters per line.
- **Color:** use the installed semantic tokens. Cream is the continuous page; warm ink carries content; terracotta identifies links, focus, and the primary action. Project artwork can use the same palette at different proportions. No arbitrary rainbow of card colors.
- **Composition:** a compact masthead, split introduction with artwork beside the copy, selected projects, a brief evidence-based journey, recent writing, and contact. Wide gutters and changes in scale establish rhythm. Avoid filling every section with identical cards.
- **Artwork:** original, code-native illustrations of a maker's workbench and the projects' ideas. Crisp contours, a few generous shapes, restrained hatching, and offset paper forms. Reference artwork is inspiration, never copied or represented as Pranav's work.
- **Interactions:** keep native links and scrolling. Project previews may respond to a fine pointer; the system cursor remains usable. Hover changes an illustration or surface, not the clickable target's position. A small reveal is progressive enhancement, with all content readable without JavaScript.
- **Motion:** use the design system's easing and duration tokens. No intro gate, autoplay sound, scroll hijack, long loader, or motion needed to read. Honor reduced motion and coarse pointers.
- **Mobile:** keep Work, Writing, and About visible. Stack the hero and artwork; project covers keep their proportions. Use at least 44px touch targets, visible focus, and no horizontal page scrolling at 360px.
- **Writing:** Markdown is the source. Include search across complete articles, category filters, shareable URL state, individual pages, reading time, headings, a table of contents, code copying, related notes, and RSS. Empty results explain how to reset.

## Accepted trade-off

Editorial Warm gives readers a calm, familiar surface and gives the work room to speak. It is less cinematic than the immersive references. Original illustrations and short optional motion supply character while the reading and navigation remain direct.

## Reference synthesis

The actual browser captures and computed styles are in `research/references/`; `research/REFERENCE-STUDY.md` records what was observed and what could not be verified. Key influences are Andreas's serif/sans pairing and small navigation, Beige's deliberate material language, Endcap's confident scale and line art, Nader's project/writing hierarchy, First December's editorial rhythm, and Webdrift's compact hover details. Loading screens and hardware-dependent scenes are not evidence that the underlying experience was reviewed.

## Component and content contract

Before feature work, read `components/ui/` and map the pattern to its real exports: Button for actions, Card for project previews, Badge for project metadata, Input for search, and the installed copy/progress primitives when suitable. This is a portfolio, so use semantic header/nav/main/footer; it is not a dashboard and needs no sidebar.

Keep all three starter essays in `content/posts/`. They were written for this site on November 5, 2026. Project descriptions come from the fresh public GitHub snapshot and READMEs. Repository creation dates describe repository history, not a person's employment or when a language was first learned.

## Review contract

Better Design's UI, UX, and positioning guidance was loaded before styling and behavior. After implementation, load review rules, check comprehension for the real screens, and inspect spacing using rendered DOM evidence. Fix every critical and serious issue. Verify keyboard navigation, filters and browser history, article links, RSS, reduced motion, narrow layouts, and actual font loading. Save desktop/mobile screenshots and test results in the local repository; do not publish or push.
