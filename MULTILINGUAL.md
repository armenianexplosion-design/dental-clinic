# Aurevia multilingual edition

The existing page components, section order, motion values, scroll offsets, animation timings, image assets and colour system are preserved. Translation happens at render boundaries. React keys and select values remain language-independent, keeping the same DOM nodes, comparison positions, pricing tab, FAQ state and treatment choice while switching.

## Editing content

- `public/clinic.json`: clinic name, wordmark, descriptor, telephone, email, address, map link and hours. The legal pages also read the name and telephone here.
- `src/i18n/clinic.ts`: shared navigation, services, doctors, prices, process, results, reviews and FAQs. Images and icons remain attached to one shared content model.
- `public/translations.json`: central Armenian (`hy`), Russian (`ru`) and English (`en`) text catalog, including accessible labels, legal pages and message templates. English source strings are stable lookup keys; when adding or changing a key, provide all three translations. Placeholder names in braces must stay the same.
- `src/i18n/language.tsx`: React language context and selectors. No third-party translation runtime.
- `src/styles.css`: the appended language layer. Original animation rules are untouched.

Armenian is the server-rendered default. The saved preference is restored after hydration; a fresh browser receives Armenian. The preference uses `aurevia.language` in localStorage. Switching still works if storage is blocked; persistence then depends on browser permissions. Treatment and timing are deliberately not persisted, matching the existing message builder. All existing feedback messages are translated. The form contains only preselected menus, so it has no missing-field validation or new fields.

## Fonts

Armenian uses bundled Noto Serif Armenian (400) for editorial display headings and Noto Sans Armenian (400/500) for body text and small labels. Display copy is edited for short, deliberate lines. Latin and Cyrillic use the existing Playfair Display / Inter families with explicit Cyrillic subsets and a real Cyrillic italic face. Font files are self-hosted; no Google Fonts connection is required. The Latin Aurevia wordmark remains unchanged. Armenian display text avoids synthetic italics and compressed tracking.

## URLs and SEO

This release keeps the working `/` page and existing section anchors. The locale definitions include `/hy`, `/ru`, `/en` for future routing, but these paths are not advertised or generated as duplicate pages. Page title, description, Open Graph title/description and document language update on selection. Initial HTML and metadata are Armenian.

For independently indexable localized URLs later, add real server-rendered locale routes using the same HomePage and content model, resolve the URL locale before rendering, then add canonical and hreflang links for the final production domain. Do not merely rewrite history or add links to nonexistent routes.

The linked privacy and terms pages also retain the selected language. Their existing demonstration disclosures remain, with a factual note added for language-preference storage.

## Run

Node 22+ recommended by the existing Vite toolchain.

```sh
npm ci
npm run dev
npm run build
```

This is the editable source project, not a single HTML file. No site was deployed by this update.

## Verification completed

- TypeScript compilation and production build passed.
- Chromium desktop (1440 px) and mobile (390 px and 320 px) layouts checked in Armenian, Russian and English; localized card and dialog overflow corrected.
- Refresh persistence, native select values, prepared message language, legal-page language, pricing/FAQ state and comparison-slider positions checked.
- Existing animated DOM elements remain mounted on language changes. All 52 original motion, scroll and inline-style expressions match the attached source.
- No runtime page errors observed. Physical Windows/macOS/iPhone/Android devices were not available; the bundled Unicode WOFF2 fonts avoid system-font dependencies on those platforms.

Responsive refinement: phone, tablet and desktop typography scales are separate; headings wrap at word boundaries. Short-screen menus scroll, tablet content columns have room to shrink, and service cards grow with translated copy.

Latest editorial responsive verification: Chromium at 320×568, 390×844, 768×1024 and 1440×900 in all three languages. Heading, pricing, navigation and column overflow checks passed with no page errors. Mobile and tablet hero, team, pricing and contact layouts were visually inspected. Original motion expressions remain unchanged.

The language selector is an editorial index: compact native abbreviations on desktop, full native names with an active underline in the mobile menu. Small labels use separate spacing and weight rules rather than inheriting display typography.

Font selection reference supplied by the client: https://fonter.am/en/fonts/noto-serif. The selected regular-width Noto Serif Armenian preserves the editorial serif hierarchy; fonts remain bundled locally through Fontsource.

Language control update: click the current language to open the compact selector on desktop or inside the mobile menu. Selection, outside click, focus leaving the control, or Escape closes it; selection restores focus and persists without a page reload.
