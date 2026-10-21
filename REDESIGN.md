# NEVERBE storefront redesign

The storefront uses an editorial sportswear direction with bold type, full-width photography, neutral surfaces and a restrained green/lime accent. NEVERBE remains the brand throughout.

## Scope

- New homepage, responsive header, footer, collection introduction and shared product-card styling.
- Mobile navigation, horizontal category discovery and two-column product grids; desktop and tablet layouts have their own breakpoints.
- Theme preference applies before rendering, follows the operating system until a preference is saved, and is available from the mobile header.
- Existing catalog APIs, authentication, promotions, bag, checkout and account routes remain connected.
- Homepage and editorial sections render on the server. No scroll-hijacking engine, entrance-animation dependencies or idle animation loops on the new landing page.
- Bag, mobile menu and product quick view load on demand. Only the hero image is preloaded; supporting photography uses responsive image sizes and lazy loading.
- Sri Lankan page copy, locale, local business information, canonical home URL and working social preview images. Placeholder verification and unverified opening hours/coordinates were removed. Search-result pages are noindexed and omitted from the sitemap.

## Photography

The hero uses the first configured slider when available. Unsplash editorial images provide the fallback hero and category/lifestyle imagery; replace these with owned campaign photography for the final brand campaign. These images are not presented as inventory. All products and prices come from the existing API.

## Verification

Run `npm ci`, `npm run typecheck`, `npm run lint`, and `npm run build`. The existing Next.js configuration skips TypeScript errors during builds; run the standalone type check to see issues in legacy pages as well.

Manual responsive checks should cover 320, 375, 390, 640, 768, 1024 and 1440 CSS-pixel widths in both themes, navigation drawer keyboard/escape behavior, category swipe, search submission, product quick view and bag. Checkout requires the configured API and payment environment. No measured Core Web Vitals improvement or search ranking is implied by these changes.

### Checks completed

- `npm run build -- --webpack`: passed (Next.js 16.0.8).
- Focused ESLint checks on the new homepage, header, footer, theme controls, root layout and providers: passed.
- Browser layout checks at 320, 390, 768 and 1440 CSS pixels: no page-level horizontal overflow. Mobile navigation opened and closed; theme switching and saved preference were exercised.
- `npm run typecheck`: still reports 20 errors in pre-existing checkout, account, legacy animation and utility code. The rewritten components pass type checking. The production build retains the repository's existing `ignoreBuildErrors` setting.
- The development catalog API at `localhost:8080` was unavailable. Live catalog, checkout and payment integration could not be verified end to end. Empty product rails are intentionally omitted rather than populated with fake inventory.

Previews are saved in `docs/previews/`.
