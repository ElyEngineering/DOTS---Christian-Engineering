# Ely Christian Engineers: current site

The root README is retained byte-for-byte at the owner's request. It describes a previous version. This file documents the current implementation.

## Run locally

No build step or package installation is needed. From the repository root:

```sh
python3 -m http.server 8080
```

Open http://localhost:8080. Any static host can serve the site. All local paths are relative, including assets and fonts. Deployment remains under the owner's control; there is no deployment workflow, vendor integration, payment service, or account creation.

## Design and content

- A complete, responsive presentation site for a national Christian community anchored in Ely, Minnesota
- Exact mission tagline: “Men who build and love like Christ.”
- Ephesians 5:25 in the opening; all of 5:21–33 visible in the normal reading flow
- Original commitments: Sacrificial love, Servant leadership, Integrity in engineering
- Family-centered invitation and useful AI/engineering work in support of that mission
- Current owner-provided property description: 51 acres, a third property and a third cabin
- Authentic public-domain Boundary Waters photography and the owner's original portrait
- Planned Slack community and possible future communication/learning formats clearly identified as plans
- Verified manual phone, text, and email links; no form submission, automated messaging, membership, classes, or payments implied

## Files

- `index.html`: content, semantic headings, visible Scripture, native mobile menu dialog, and contact links
- `styles.css`: custom typography and layout, responsive breakpoints, restrained motion, print styles
- `script.js`: progressive enhancement for navigation, one-time motion, reading progress, and current year
- `assets/`: local optimized photography, local fonts, licenses and credits
- `tests/check_site.py`: local static integrity/content tests using Python's standard library
- `tests/browser-checks.md`: desktop/mobile visual and interaction acceptance checklist

The entire core reading experience and contact links remain available without JavaScript. Small-screen navigation has a no-JavaScript fallback. Motion respects `prefers-reduced-motion`; nothing scroll-jacks or loops continuously. The native dialog provides focus containment and Escape dismissal in modern browsers. No personal data is collected or stored by the site.

## Verify

```sh
python3 tests/check_site.py
node --check script.js
```

Static checks do not substitute for browser inspection. Review desktop, tablet, narrow phone, keyboard, reduced motion, no-JavaScript, and print views using `tests/browser-checks.md` before release. Check the actual hosted result separately after deployment.
