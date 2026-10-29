# NEVERBE search visibility

See [the October 2026 Search Console review](SEARCH-CONSOLE-2026-10-22.md) for the supplied report baseline, implemented opportunities, and deployment/measurement follow-up.

## Implemented

- Server-rendered product results and crawlable `<a href>` pagination for all products, categories, new arrivals, offers and bundles. Each normal collection page has its own canonical URL and page title. First-page URLs omit `page=1`; page size is preserved when it changes the results.
- Filters and sorting are `noindex,follow` with a canonical to the curated collection. Curated categories remain indexable. Out-of-range product collection pages return `notFound` once a successful catalog response confirms the requested page is empty.
- Collection JSON-LD is shared `CollectionPage`, `ItemList` and breadcrumb markup referring to the actual products shown. Product offers stay on product detail pages; collection pages no longer invent shipping rates, delivery timelines, return windows, price expiry dates or bundle availability.
- Request normalization is shared by server rendering and the client. Successful initial results are reused instead of immediately requesting the same inventory again. API failure renders a retry state rather than presenting fabricated inventory.
- Useful collection buying guidance, delivery-policy links and category links replace sample bundle offers and unsupported promises. Product descriptions in metadata use the catalog description where present. Known product categories link directly to curated category URLs.
- About, contact and policy markup refer to the root Organization entity. The owner-supplied 09:00–19:00 opening hours and Thursday closure are shared by visible content and LocalBusiness markup. No coordinates are invented.
- Catalog-derived sitemap entries include populated legacy categories missing from the category dropdown. Confirmed empty collection pages are noindex. Homepage and collection links prioritize actual footwear inventory.
- Product and bundle sitemap reads validate their response shape and load every page. Failed or incomplete reads propagate an error instead of caching a successful static-only or partial sitemap. The hourly ISR cache keeps its previous successful result when regeneration fails; an initial build needs a reachable catalog. A confirmed empty catalog is accepted. Bundle modification dates are included only when supplied by the catalog.
- The application redirects www permanently to the apex domain and sends noindex headers on alternate hosting domains. A hosting/CDN rule that runs first must also use a permanent redirect; the public www check returned 302 before deployment.
- Search titles use actual brand/model information and retain explicit catalog replica disclosures. Product-review UI uses only valid returned ratings/text and labels its average as the displayed review sample.
- The existing Firebase integration now receives production `web_vital` events after initial rendering. Fields: `metric_name`, `metric_value`, `metric_delta`, `metric_rating`, `metric_id`, `page_type`. Values use native Web Vitals units (milliseconds for LCP/INP, unitless CLS). Dynamic product/order IDs and queries are omitted from the custom page-type field. Existing analytics configuration and availability apply; this is instrumentation, not a measured performance score.
- Optional server environment variable `GOOGLE_SITE_VERIFICATION` emits Google's verification meta tag only when configured with a real token.

## Deployment and account work

These require the deployed domain and the business owner's Google accounts. No deployment, account verification, sitemap submission or Business Profile edits were performed by this change.

1. Deploy to the canonical HTTPS domain, `https://neverbe.lk`. Confirm representative product, category, offer, paginated and missing URLs with live inventory. Confirm the production sitemap contains the full catalog and image URLs are accessible.
2. In Google Search Console, add a Domain property and verify through the supplied DNS TXT record. Alternatively, use a URL-prefix property and set `GOOGLE_SITE_VERIFICATION` to the real HTML-tag token before rebuilding. Never put a placeholder token in production.
3. Submit `https://neverbe.lk/sitemap.xml`. Inspect the homepage, a product, a curated category and its second page. Confirm that Google-selected canonicals match the intended URLs, indexed product HTML contains the actual catalog, and filter URLs are excluded as intended.
4. Validate a product using Google's Rich Results Test. Shipping and return structured data should only be added from verified policy/settings data that matches visible content and checkout.
5. Review Search Console performance with Country = Sri Lanka. Record clicks, impressions, CTR and average position by query and landing page. Compare equivalent periods and account for seasonality; code changes alone do not establish ranking improvement.
6. Measure the deployed site using PageSpeed Insights and Search Console Core Web Vitals. Aim for 75th-percentile LCP <= 2.5 seconds, INP <= 200 milliseconds and CLS <= 0.1. In Firebase/GA4, verify the `web_vital` events and register useful custom dimensions; use metric IDs/deltas if aggregating repeat reports. Lab scores and custom analytics do not substitute for Google's real-user report.
7. If eligible, verify the actual Google Business Profile. Keep the real business name, address, phone, categories, hours and customer-facing website accurate. Request honest customer reviews and respond to them. Do not create artificial locations or purchased reviews/links.
8. Improve real catalog descriptions with accurate material, fit, care and measurement details supplied by the business. Add original customer photos/reviews with permission. Avoid inventing product specifications or adding generic location pages.

Google determines indexing, rich-result eligibility and ranking. No ranking position or timetable is guaranteed.

## References

- [Google ecommerce pagination](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)
- [Google ecommerce site structure](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure)
- [Google structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start)
- [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
- [Local ranking](https://support.google.com/business/answer/7091)
