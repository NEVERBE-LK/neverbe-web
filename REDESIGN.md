# NEVERBE storefront redesign

The storefront uses one sportswear design system for the landing page, collections, product detail, filters, quick view, shopping bag, mobile menu, search, checkout controls, account, authentication, reviews, size guides and secondary content pages.

## Shared design source

`config/design-tokens.json` is the source for light/dark interface colors, status colors, image overlays, scrollbars, social cards and printed invoices. `config/theme.ts` produces the server-rendered CSS properties; Ant Design reads the same palette. Run `npm run check:theme` to prevent color literals from returning to components and stylesheets. Static raster and vector brand exports retain their own exported pixel/vector colors.

All busy indicators use `components/Spinner.tsx`: a simple CSS ring with an accessible loading label and no visible text or branding. Existing account, inventory, coupon, promotion and payment integrations are preserved.

## Sri Lanka SEO

- English/Sri Lanka locale, Sri Lankan copy, canonical URLs, local organization/store details and LKR product offers.
- Product structured data uses the catalog price, stock, images and description. Fixed ratings, sample reviews, invented price expiry dates and fixed delivery quotes were removed.
- Product JSON-LD escapes markup delimiters from catalog content.
- The hourly sitemap fetches the complete paginated catalog with bounded concurrency, includes known category routes and excludes redundant brand query URLs, search, account, cart and checkout pages.
- Private routes remain noindexed. Crawlers can fetch product social images under `/api/og/`.
- Social images use the centralized palette and product discount price. The manifest uses the same theme source.

## Performance

- Native scrolling replaces idle GSAP/Lenis tickers.
- Cart, mobile menu, quick view and review form load on demand.
- reCAPTCHA loads when the review form opens instead of on every storefront page.
- Firebase Analytics loads after the initial page render, with cancellation during navigation.
- Public promotion requests share a short-lived cache and pending request; empty carts skip eligibility requests. Authenticated requests and inventory responses are not stored in this cache.
- Product selection fetches inventory for the active variant, and stale listing requests are cancelled.
- Responsive image sizes, AVIF/WebP, bounded image widths and preload of the primary image reduce unnecessary image work. Stable brand filenames revalidate instead of remaining immutable for a year.

## Verification

- `npm test`: six regression tests covering product pricing/stock metadata, absent invented ratings, JSON-LD escaping, complete theme roles, exact cart variant/size quantity changes and quantity/combo limits; plus the color-source guard.
- `npm run typecheck`: passed.
- `npm run lint`: no errors; existing warnings remain in legacy hook dependencies and unoptimized image elements.
- `npm run build -- --webpack`: production compilation and type validation checked.

Earlier screenshots under `docs/previews/` record the first design iteration. Current browser verification was blocked when automatic approval review could not complete after the browser-use allowance was reached. The final changes have build and source validation; an updated visual pass, live API checkout verification and measured Core Web Vitals remain to be performed.

Implementation references: [Next.js sitemaps](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap), [Google product structured data](https://developers.google.com/search/docs/appearance/structured-data/product-snippet).

## Further search improvements

Collection pagination now renders matching products and crawlable links on the server, with distinct paginated canonicals and titles. Filtered/sorted browsing states are noindexed. Shared collection schema removes guessed policy/offer details from all collection types, while product detail pages retain factual offers. Category guidance and internal links replace sample marketing claims. Contact, about and policy schema reference the root organization consistently.

Production Web Vitals reporting uses the existing Firebase analytics integration; optional Search Console verification reads a real `GOOGLE_SITE_VERIFICATION` token. See [SEO deployment and measurement steps](docs/SEO.md) for the remaining domain/account work. These changes do not establish an improvement in measured Google rankings.

The regression suite now includes thirteen tests, covering pagination links, SSR initial products, query normalization, canonical/indexing behavior and collection schema in addition to the original cart/theme/product checks.
