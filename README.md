# Ely Christian Engineers

A nationwide invitation to Christian men to consider a life in Ely, Minnesota: become better husbands, build strong Christ-centered families, and pursue meaningful work in AI research. **Ephesians 5:21–33** is the foundation of this integrated mission.

The original site is at [ElyEngineering/Christian-Engineering](https://github.com/ElyEngineering/Christian-Engineering). This independent remake belongs in [ElyEngineering/DOTS---Christian-Engineering](https://github.com/ElyEngineering/DOTS---Christian-Engineering); it does not change the original repository.

## Run locally

No build step, framework, or package installation is required.

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080`. Any static host can serve the project. All site and image paths are relative, so it also works under a repository subpath.

## What’s inside

- A forest-and-paper design system, geometric brand mark, responsive layouts, and local photography
- A five-part, keyboard-accessible Scripture reader, plus the full ESV passage in a native disclosure
- A substantive mission: faithful husbands, strong families, and meaningful AI research
- A research-and-career invitation and a nationwide invitation to consider Ely
- Once-only cinematic entrance motion and an animated research illustration, with reduced-motion fallbacks
- Mobile navigation with Escape-to-close, focus management, and a keyboard focus loop
- Passive reading progress and section navigation, without scroll-jacking
- Reduced-motion support, meaningful focus states, a skip link, and printable Scripture
- Progressive enhancement: all Scripture, core content, and native disclosures remain available without JavaScript

## Contact and hosting

The site publishes the community contact approved by the owner: **Call/text: 218-996-9792**. Both `tel:` and `sms:` links use the international form `+12189969792`; the visitor chooses whether to call or compose a text in their own app. Nothing is sent automatically.

The source repository’s placeholder email is not used. There are no invented meeting dates, member counts, or testimonials. Landscape imagery is illustrative; the site does not claim the photos depict Ely or the Boundary Waters.

Deployment is managed by the owner. This repository contains the ready-to-serve static files and does not add a deployment workflow or change hosting settings.

## Files and customization

- `index.html`: semantic content, all thirteen verses, five reader panels, mission and research content, and approved call/text contact
- `styles.css`: the design system, responsive breakpoints, reduced motion, and print styles
- `script.js`: progressive enhancement for navigation, reader tabs, entrance motion, and reading progress
- `favicon.svg`: custom geometric site mark
- `images/`: existing source imagery and [photography attribution](images/CREDITS.md)
- `tests/`: automated checks

The palette, font stacks, and sizing tokens are defined at the top of `styles.css`. Fonts are requested from Google Fonts with system fallbacks. Photos are local; no other runtime services, analytics, cookies, or storage are used.

The tabs use manual activation: arrow keys move focus, Enter or Space selects, and Home/End moves to the first/last tab. On mobile, the tab list becomes horizontally scrollable and uses Left/Right arrows.

## Checks

```sh
python3 tests/check_site.py
node --check script.js
```

Additional interaction-test instructions are documented alongside the tests. For release QA, also inspect desktop, tablet, and small-phone layouts in a real browser; test keyboard navigation, reduced motion, native disclosures, repeated tab changes, and back/forward navigation.

## Content and attribution

The full ESV passage is preserved from the source site. Mission and audience copy reflect the owner’s direction: Christian marriage and family life in Ely, with AI research work supporting that vision. The site does not invent specific vacancies, compensation, guaranteed jobs, housing, relocation benefits, or an application process. It contains no religion- or marital-status-based employment screening requirements. Daily practices and rotating reflection features are intentionally omitted. Source image attribution and license references are preserved in `images/CREDITS.md`. Only the three photographs used on the page are included.
