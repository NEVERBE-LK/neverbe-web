# NEVERBE Search Console review

Reviewed 23 October 2026. Source export: Web (text-based), 1 September 2025–22 October 2026, all countries/devices. The 22 October row has zero clicks/impressions and blank CTR/position; exclude it from period comparisons. Recent populated days may still be preliminary.

## Baseline

| Metric | Export result |
| --- | ---: |
| Search clicks | 3,394 |
| Impressions | 41,818 |
| CTR, calculated from totals | 8.12% |
| Approximate impression-weighted position | 10.41 |
| Sri Lanka clicks | 3,214 (94.7% of site clicks) |
| Mobile clicks | 2,611 (76.9% of site clicks) |
| Product-snippet clicks | 1,043 |

| Comparable period | Clicks | Impressions | CTR | Approx. position |
| --- | ---: | ---: | ---: | ---: |
| 27 August–23 September 2026 | 583 | 8,153 | 7.15% | 10.83 |
| 24 September–21 October 2026 | 423 | 6,118 | 6.91% | 10.45 |

Clicks fell 27.4% and impressions fell 25.0%, while position improved slightly. This is not evidence of a ranking penalty or proof that a specific redesign caused the change. Demand, query mix, availability, indexing and seasonality need separate checks. CTR changed by −0.24 percentage points. No sessions, orders, revenue or conversion rate are included in this export.

## Priorities supported by the export

| Opportunity | Evidence | Implementation |
| --- | --- | --- |
| Running shoes | Collection: 572 clicks / 10,061 impressions / position 11.71. Exact query “running shoes sri lanka”: 116 clicks / 1,253 impressions / position 9.39. | Restore category discovery in sitemap from published products; prominent crawlable links; concise titles and guidance about prices, sizing and intended use. |
| Slides and sandals | Collection: 76 clicks / 1,161 impressions / position 15.25. Exact query “nike slides sri lanka”: 85 clicks / 794 impressions. | Clear slides/sandals/slippers naming, internal links, buying guidance and retained product URLs. |
| Product pages | Air Force 1 URL: 395 clicks / 3,714 impressions. Samba URL: 214 clicks / 3,414 impressions. | Use actual catalog brand/model in search titles; preserve explicit replica disclosures when descriptions are shortened; retain existing URLs and factual offer data. |
| Mobile shopping | Mobile accounts for 76.9% of clicks. | Touch-sized category links; fix active-colour tap disabling size/stock selection in product pages and quick view; delivery quote error/retry state. |
| Host consistency | Pages export includes 640 clicks on www URLs and 2,784 on apex URLs. | Permanent www-to-apex application redirect and preview-host noindex header. Hosting-layer follow-up required below. |
| Accurate trust information | Code audit found a hardcoded 4.5 rating, invented review text/default stars and conflicting delivery estimates. | Display only valid reviews with their actual average, distinguish failure from zero reviews, reuse the published 2–6-business-day delivery estimate. |

The query export contains exactly 1,000 rows: 1,452 clicks and 19,795 impressions, not the full site's totals. For a reproducible brand split, queries matching `never\s*be` case-insensitively contribute 357 clicks / 920 impressions. The remaining exported queries contribute 1,095 clicks / 18,875 impressions (5.80% CTR, approximate position 13.46). This split excludes hidden/anonymized or omitted queries and must not be extrapolated to all traffic.

Page-row sums differ from property totals because aggregation differs. Do not add page, query, device, country or search-appearance tables together. Do not infer Sri Lanka mobile traffic, or a query-to-page relationship, by joining these separate aggregates. Weighted position estimates use rounded exported positions.

## Public-site verification

Read-only checks during this review found:

- `https://www.neverbe.lk/collections/running-shoes?page=2` returned **302** to the matching apex URL, preserving the query string. The new app rule emits **308**, but a provider redirect can run before Next.js. Configure the hosting/CDN www redirect as permanent (301 or 308), preserving the full path and query. Verify this after deployment; code alone cannot replace an upstream 302.
- The running-shoes page returned 200 with a self-canonical, indexable metadata and four server-rendered product links. Its API returned four products, although the category dropdown omitted “Running Shoes”. The new sitemap uses the actual product catalog instead of the dropdown.
- Activewear and clothing queries returned zero products. Main homepage links now lead to established footwear collections. A successfully confirmed empty collection is noindex; request failure does not make an existing collection noindex.
- `dev.neverbe.lk` did not resolve during the check. Historical exports also contain ERP, API and admin hosts. That does not establish that these hosts are currently indexable. Preview headers in this storefront do not configure separate ERP/API/admin applications.

## Deployment and measurement

### Follow-up validation, 29 October 2026

Final local checks exposed a sitemap failure path: catalog errors were converted into empty arrays and cached as a successful sitemap containing only static pages. Product and bundle sitemap loaders now reject unavailable, malformed or incomplete responses, paginate the full inventory, and accept confirmed empty responses. Sitemap generation propagates failures so an unsuccessful regeneration cannot replace the previous valid sitemap. The first build requires catalog availability. This uses [Next.js ISR error handling](https://nextjs.org/docs/app/guides/incremental-static-regeneration#handling-uncaught-exceptions).

The final local production build generated 62 sitemap URLs, including 43 published products and the running-shoes collection. Production HTTP checks passed for the sitemap, crawlable homepage links, server-rendered products, category canonical, confirmed empty and filtered collection noindex, www 308 redirect with path/query preservation, preview-host noindex and the product's explicit replica disclosure. Build/TypeScript and regression tests passed. Full-project lint reported zero errors and eight existing warnings; changed source/test files passed lint without warnings. Regression tests cover pagination, real empty catalogs, request failure and incomplete responses. Bundle entries no longer invent a modification date when none is provided. These are local implementation checks, not evidence of a deployed ranking or order increase. No orders or payments were submitted. These checks were completed before the owner-requested deployment on 29 October 2026; verify rollout status in Firebase App Hosting separately.

### Deployment checklist

1. Deploy the tested storefront and change any upstream www redirect from temporary to permanent. Confirm apex remains indexable and staging/default hosting URLs emit `X-Robots-Tag: noindex, nofollow`.
2. Check `/sitemap.xml` contains the running-shoes collection and published product URLs. Submit it in the existing Search Console property. Use URL Inspection on the homepage, running-shoes, slides-sandals, and the leading product URLs; inspect Google-selected canonicals and request re-indexing of the changed priority pages.
3. Validate actual product markup with Google's Rich Results Test. Keep all catalog disclosures and actual prices/stock accurate. No ratings, shipping amounts, performance specifications or authentication claims should be invented for search.
4. Measure the deployed mobile pages with PageSpeed Insights and Search Console Core Web Vitals. Deferring the next carousel image removes one competing initial image request; this is not a measured Core Web Vitals improvement.
5. Record the deployment date. Compare equal 28-day periods after recrawling, filtering Country = Sri Lanka and separating mobile/desktop, brand/non-brand, and priority landing pages. Compare clicks, impressions, CTR and position together, accounting for catalog changes and seasonality. The supplied export cannot isolate recent Sri Lankan queries; export that slice next.
6. For orders, verify GA4 ecommerce events against actual orders: `view_item`, `add_to_cart`, `begin_checkout`, and `purchase` with LKR, actual order totals and a deduplicated transaction ID. This change does not implement purchase attribution; current page-view/Web Vitals events cannot establish order conversion. Never fire `purchase` just because an external payment form opened. Reconcile confirmed orders and cancellations/refunds with the backend.
7. Keep the Google Business Profile accurate, including Thursday closure. Add real product photos, measurements and descriptions, and seek honest reviews from actual customers. No account edits or external submissions were made in this task.

An additional checkout audit found cart clearing before offsite payment confirmation. It needs a separate verified payment-return/cancellation recovery change; payment handoff and transaction state were not changed here. No live orders or payments were submitted in testing.

## Sources

Unmodified local inputs, all in `/home/nadun-malwenna/Downloads/neverbe.lk-Performance-on-Search-2026-10-22/`:

- `Filters.csv`: search type and date range.
- `Chart.csv`: site totals and equal-period trends.
- `Countries.csv`, `Devices.csv`: geographic and device distributions.
- `Queries.csv`: exact-query opportunities and limited exported brand split.
- `Pages.csv`: landing-page and host observations.
- `Search appearance.csv`: appearance metrics (not mutually additive).

Google guidance: [ecommerce structure](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure), [descriptive titles](https://developers.google.com/search/docs/appearance/title-link), [canonical consolidation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

These changes address observed technical/content/conversion issues. Rankings, rich-result display and additional orders cannot be guaranteed or measured before deployment and subsequent data collection.
