const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
function loadTs(relative, mocks = {}) {
  const filename = path.resolve(root, relative);
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const mod = { exports: {} };
  const localRequire = (name) =>
    Object.hasOwn(mocks, name)
      ? mocks[name]
      : name.startsWith("@/")
        ? loadTs(name.slice(2) + ".ts")
        : name.endsWith(".json")
          ? JSON.parse(
              fs.readFileSync(
                path.resolve(path.dirname(filename), name),
                "utf8",
              ),
            )
          : require(name);
  new Function("require", "module", "exports", compiled)(
    localRequire,
    mod,
    mod.exports,
  );
  return mod.exports;
}
const seo = loadTs("utils/seo.ts");
test("reviews never invent ratings, praise, verification or dates", () => {
  const { normalizeProductReviews, displayedReviewAverage } = loadTs("utils/productReviews.ts");
  const reviews = normalizeProductReviews({ reviews: [
    { id: "one", rating: 4, review: "Good fit", userName: "A", createdAt: "2026-10-01" },
    { id: "two", rating: 2, createdAt: "invalid" },
    { id: "no-rating", review: "Unrated" },
    { id: "out-of-range", rating: 9 },
    { id: "nan", rating: NaN },
    null,
  ] });
  assert.equal(reviews.length, 2);
  assert.equal(reviews[1].review, "");
  assert.equal(reviews[1].userName, "Customer");
  assert.equal(reviews[1].createdAt, undefined);
  assert.equal(displayedReviewAverage(reviews), 3);
  assert.equal(displayedReviewAverage([]), null);
  assert.equal(normalizeProductReviews([{ id: "same", rating: 4 }, { id: "same", rating: 4 }]).length, 1);
});
test("shipping quotes distinguish free delivery from unavailable and stale quotes", () => {
  const { parseShippingCost, currentShippingCost } = loadTs("utils/shippingQuote.ts");
  for (const invalid of [undefined, null, "", "500", NaN, Infinity, -1])
    assert.equal(parseShippingCost(invalid), null);
  assert.equal(parseShippingCost(0), 0);
  assert.equal(parseShippingCost(350), 350);
  assert.equal(currentShippingCost({ key: "old-cart", status: "ready", cost: 0 }, "new-cart"), null);
  for (const status of ["loading", "error"])
    assert.equal(currentShippingCost({ key: "cart", status }, "cart"), null);
  assert.equal(currentShippingCost({ key: "cart", status: "ready", cost: 0 }, "cart"), 0);
});
const sample = {
  id: "runner-1",
  name: "Everyday Runner",
  category: "Running shoes",
  brand: "NEVERBE",
  description: "<p>Made for your <strong>everyday</strong> run.</p>",
  thumbnail: { url: "/shoe.png" },
  variants: [
    { images: [{ url: "/shoe.png" }, { url: "https://example.com/side.png" }] },
  ],
  sellingPrice: 8500,
  discount: 10,
  inStock: true,
};
test("product SEO uses catalog price, LKR and real stock, with no invented social proof", () => {
  const data = seo.productStructuredData(sample);
  assert.equal(data.offers.price, "7650.00");
  assert.equal(data.offers.priceCurrency, "LKR");
  assert.equal(data.offers.availability, "https://schema.org/InStock");
  assert.equal(
    data.offers.url,
    "https://neverbe.lk/collections/products/runner-1",
  );
  assert.equal(data.description, "Made for your everyday run.");
  assert.deepEqual(data.image, [
    "https://neverbe.lk/shoe.png",
    "https://example.com/side.png",
  ]);
  assert.equal(data.aggregateRating, undefined);
  assert.equal(data.review, undefined);
  assert.equal(data.offers.shippingDetails, undefined);
  assert.equal(data.offers.priceValidUntil, undefined);
});
test("sold-out and unknown pricing never claim an available priced offer", () => {
  assert.equal(
    seo.productStructuredData({ ...sample, inStock: false }).offers
      .availability,
    "https://schema.org/OutOfStock",
  );
  assert.equal(
    seo.productStructuredData({ ...sample, sellingPrice: NaN }).offers,
    undefined,
  );
});
test("catalog text cannot close a JSON-LD script element", () => {
  const name = "</script><script>alert(1)</script>";
  const serialized = seo.serializeJsonLd({ name });
  assert.equal(serialized.includes("<"), false);
  assert.equal(JSON.parse(serialized).name, name);
});
test("product search labels include the catalog brand once and preserve explicit disclosures", () => {
  const product = { ...sample, brand: "Example", name: "Road Runner" };
  assert.equal(seo.productSearchName(product), "Example Road Runner");
  assert.equal(seo.productSearchName({ ...product, name: "Example Road Runner" }), "Example Road Runner");
  assert.equal(seo.productSearchName({ ...product, brand: "Fashion" }), "Road Runner");
  const replica = { ...product, description: "Long introduction. ".repeat(30) + "<p>Disclaimer: This is a high-quality replica product, not a genuine original.</p>" };
  assert.equal(seo.productSearchName(replica), "Example Road Runner (Replica)");
  assert.match(seo.productSearchDescription(replica), /\(Replica\)/);
  assert.ok(seo.productSearchDescription(replica).length <= 160);
  assert.equal(seo.productSearchName({ ...product, description: "This is not a replica." }), "Example Road Runner");
  assert.equal(seo.plainDescription("**Soft** lining and [size details](/sizes)."), "Soft lining and size details.");
});
test("sitemap includes published catalog categories even when the dropdown omits them", () => {
  const { catalogSitemapEntries } = loadTs("utils/catalogSitemap.ts");
  const entries = catalogSitemapEntries([
    { ...sample, category: "Running Shoes", updatedAt: "2026-10-21T00:00:00Z" },
    { ...sample, id: "sold out", category: "Running Shoes", inStock: false },
    { ...sample, id: "hidden", listing: false, category: "Activewear" },
    { ...sample, id: "deleted", isDeleted: true },
    { ...sample, id: "inactive", status: false },
  ]);
  assert.deepEqual(entries.map(e => e.url), [
    "https://neverbe.lk/collections/products/runner-1",
    "https://neverbe.lk/collections/running-shoes",
    "https://neverbe.lk/collections/products/sold%20out",
  ]);
  assert.equal(entries[0].lastModified.toISOString(), "2026-10-21T00:00:00.000Z");
  assert.equal(entries[2].lastModified, undefined);
});
test("sitemap loads every catalog page and propagates failures instead of publishing missing URLs", async () => {
  const products = Array.from({ length: 405 }, (_, index) => ({
    ...sample, id: `product-${index}`,
  }));
  const requested = [];
  const { getCatalogForSitemap } = loadTs("actions/productAction.ts", {
    "./axiosInstance": {
      get: async (url) => {
        const page = Number(new URL(url, "https://example.com").searchParams.get("page"));
        requested.push(page);
        return { data: { total: products.length, dataList: products.slice((page - 1) * 200, page * 200) } };
      },
    },
  });
  const entries = await getCatalogForSitemap();
  assert.deepEqual(requested, [1, 2, 3]);
  assert.equal(entries.filter(entry => entry.url.includes("/products/")).length, 405);

  const unavailable = loadTs("actions/productAction.ts", {
    "./axiosInstance": { get: async () => { throw new Error("Catalog unavailable"); } },
  });
  await assert.rejects(unavailable.getCatalogForSitemap(), /Catalog unavailable/);
  for (const data of [{}, { total: 3, dataList: [] }]) {
    const invalid = loadTs("actions/productAction.ts", {
      "./axiosInstance": { get: async () => ({ data }) },
    });
    await assert.rejects(invalid.getCatalogForSitemap(), /Invalid catalog|Incomplete catalog/);
  }
  const empty = loadTs("actions/productAction.ts", {
    "./axiosInstance": { get: async () => ({ data: { total: 0 } }) },
  });
  assert.deepEqual(await empty.getCatalogForSitemap(), []);
});
test("bundle sitemap includes every page, preserves real dates and rejects request failure", async () => {
  const combos = Array.from({ length: 101 }, (_, index) => ({ id: `combo ${index}` }));
  const { getCombosForSitemap } = loadTs("actions/promotionAction.ts", {
    "./axiosInstance": { get: async (url) => {
      const page = Number(new URL(url, "https://example.com").searchParams.get("page"));
      return { data: { total: combos.length, dataList: combos.slice((page - 1) * 100, page * 100) } };
    } },
  });
  const entries = await getCombosForSitemap();
  assert.equal(entries.length, 101);
  assert.equal(entries[100].url, "/collections/combos/combo%20100");
  assert.equal(entries[0].lastModified, undefined);
  const unavailable = loadTs("actions/promotionAction.ts", {
    "./axiosInstance": { get: async () => { throw new Error("Bundles unavailable"); } },
  });
  await assert.rejects(unavailable.getCombosForSitemap(), /Bundles unavailable/);
  const empty = loadTs("actions/promotionAction.ts", {
    "./axiosInstance": { get: async () => ({ data: { total: 0, totalPages: 0 } }) },
  });
  assert.deepEqual(await empty.getCombosForSitemap(), []);
});
test("sitemap generation rejects catalog failure rather than returning a static-only success", async () => {
  const sitemap = loadTs("app/sitemap.ts", {
    "@/actions/productAction": { getCatalogForSitemap: async () => { throw new Error("Catalog unavailable"); } },
    "@/actions/promotionAction": { getCombosForSitemap: async () => [] },
  }).default;
  await assert.rejects(sitemap(), /Catalog unavailable/);
});
test("light and dark theme roles stay complete and use one source", () => {
  const { designTokens, themeCss } = loadTs("config/theme.ts");
  assert.deepEqual(
    Object.keys(designTokens.light).sort(),
    Object.keys(designTokens.dark).sort(),
  );
  for (const mode of ["light", "dark"])
    for (const [role, value] of Object.entries(designTokens[mode]))
      assert.ok(themeCss.includes(`--${role}:${value}`));
});
const bag = loadTs("redux/bagSlice/bagSlice.ts");
function stateWith(items) {
  const data = new Map([["NEVERBEBag", JSON.stringify(items)]]);
  global.window = {
    localStorage: {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => data.set(key, value),
      removeItem: (key) => data.delete(key),
    },
  };
  return { ...bag.default(undefined, { type: "init" }), bag: items };
}
const cartItem = {
  itemId: "shoe",
  variantId: "black",
  size: "40",
  quantity: 2,
  price: 8500,
  discount: 1700,
  maxQuantity: 5,
};
test("quantity changes target the exact product, variant and size, and scale item discount", () => {
  const state = stateWith([
    cartItem,
    { ...cartItem, size: "41" },
    { ...cartItem, variantId: "white" },
  ]);
  const next = bag.default(
    state,
    bag.updateQuantity({ ...cartItem, quantity: 3 }),
  );
  assert.equal(next.bag[0].quantity, 3);
  assert.equal(next.bag[0].discount, 2550);
  assert.equal(next.bag[1].quantity, 2);
  assert.equal(next.bag[2].quantity, 2);
});
test("quantity limits and combo pricing cannot be bypassed by quantity controls", () => {
  for (const quantity of [0, -1, 1.2, 6])
    assert.equal(
      bag.default(
        stateWith([cartItem]),
        bag.updateQuantity({ ...cartItem, quantity }),
      ).bag[0].quantity,
      2,
    );
  const combo = { ...cartItem, isComboItem: true };
  assert.equal(
    bag.default(
      stateWith([combo]),
      bag.updateQuantity({ ...combo, quantity: 3 }),
    ).bag[0].quantity,
    2,
  );
});

const catalog = loadTs("utils/catalogQuery.ts");
const collections = loadTs("utils/collectionSeo.ts");
test("catalog queries normalize malformed pagination and agree on repeated parameters", () => {
  for (const page of ["0", "-2", "1.5", "Infinity", "not-a-page"])
    assert.equal(catalog.catalogQuery({ page }).page, 1);
  assert.equal(catalog.catalogQuery({ size: "999" }).size, 100);
  const server = catalog.catalogQuery({
    page: ["2", "8"],
    brand: ["Example", "Other"],
  });
  const client = catalog.catalogQuery(
    catalog.catalogSearchParams(
      new URLSearchParams("page=2&page=8&brand=Example&brand=Other"),
    ),
  );
  assert.equal(server.key, client.key);
  assert.equal(server.params.brand, "example");
});
test("category pagination retains filters without adding a redundant category query", () => {
  const query = catalog.catalogQuery(
    { page: "2", sizes: "40,41", category: "boots" },
    "Sneakers",
  );
  assert.equal(query.params.category, "sneakers");
  const href = new URL(
    catalog.catalogPageHref("/collections/sneakers", query, 3),
    seo.SITE_URL,
  );
  assert.equal(href.searchParams.get("page"), "3");
  assert.equal(href.searchParams.get("sizes"), "40,41");
  assert.equal(href.searchParams.has("category"), false);
  assert.equal(href.searchParams.has("size"), false);
  assert.equal(
    catalog.catalogPageHref(
      "/collections/sneakers",
      catalog.catalogQuery({}, "Sneakers"),
      1,
    ),
    "/collections/sneakers",
  );
});
test("unfiltered collection pages have distinct canonicals; facets stay noindex", () => {
  const base = {
    title: "Sneakers in Sri Lanka | NEVERBE",
    openGraph: { images: ["/collections-og.png"] },
  };
  const page2 = collections.collectionMetadata(
    base,
    "/collections/sneakers",
    catalog.catalogQuery({ page: "2" }, "Sneakers"),
  );
  assert.equal(
    page2.alternates.canonical,
    "https://neverbe.lk/collections/sneakers?page=2",
  );
  assert.equal(
    page2.title.absolute,
    "Sneakers in Sri Lanka | NEVERBE — Page 2",
  );
  assert.equal(page2.openGraph.url, page2.alternates.canonical);
  assert.equal(page2.robots.index, true);
  const filtered = collections.collectionMetadata(
    base,
    "/collections/sneakers",
    catalog.catalogQuery(
      { page: "2", brand: "example", sort: "low" },
      "Sneakers",
    ),
  );
  assert.equal(filtered.robots.index, false);
  assert.equal(filtered.robots.follow, true);
  assert.equal(
    filtered.alternates.canonical,
    "https://neverbe.lk/collections/sneakers",
  );
  const empty = collections.collectionMetadata(base, "/collections/sneakers", catalog.catalogQuery({}), { empty: true });
  assert.equal(empty.robots.index, false);
  assert.equal(empty.robots.follow, true);
});
test("collection schema describes this page's actual links without invented offers", () => {
  const schema = collections.collectionStructuredData({
    name: "Sneakers",
    description: "Browse sneakers.",
    path: "/collections/sneakers",
    query: catalog.catalogQuery({ page: "2" }, "Sneakers"),
    items: [sample],
    categoryName: "Sneakers",
  });
  const collection = schema["@graph"][1];
  assert.equal(
    collection.url,
    "https://neverbe.lk/collections/sneakers?page=2",
  );
  assert.equal(collection.mainEntity.itemListElement[0].position, 13);
  assert.equal(
    collection.mainEntity.itemListElement[0].url,
    "https://neverbe.lk/collections/products/runner-1",
  );
  assert.equal(collection.mainEntity.itemListElement[0].name, sample.name);
  for (const key of [
    "offers",
    "priceValidUntil",
    "shippingRate",
    "merchantReturnDays",
    "aggregateRating",
  ])
    assert.equal(JSON.stringify(schema).includes(`"${key}"`), false);
  const bundle = collections.collectionStructuredData({
    name: "Bundles",
    description: "Current bundles",
    path: "/collections/combos",
    query: catalog.catalogQuery({}),
    items: [{ id: "bundle one", name: "Bundle" }],
  });
  assert.equal(
    bundle["@graph"][1].mainEntity.itemListElement[0].url,
    "https://neverbe.lk/collections/combos/bundle%20one",
  );
});
test("large catalogs have bounded navigation with real crawlable links", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const Pagination = loadTs("components/CatalogPagination.tsx").default;
  const query = catalog.catalogQuery({ page: "5000", brand: "example" });
  const html = renderToStaticMarkup(
    React.createElement(Pagination, {
      path: "/collections/products",
      query,
      total: 1200000,
    }),
  );
  assert.ok(
    html.includes('href="/collections/products?page=5001&amp;brand=example"'),
  );
  assert.ok(html.includes('aria-current="page"'));
  assert.equal(html.includes("<button"), false);
  assert.ok((html.match(/<a /g) || []).length <= 9);
  const first = renderToStaticMarkup(
    React.createElement(Pagination, {
      path: "/collections/products",
      query: catalog.catalogQuery({}),
      total: 25,
    }),
  );
  assert.equal(first.includes("Previous"), false);
  assert.ok(first.includes('href="/collections/products?page=2"'));
  assert.equal(
    renderToStaticMarkup(
      React.createElement(Pagination, {
        path: "/collections/products",
        query: catalog.catalogQuery({}),
        total: 12,
      }),
    ),
    "",
  );
});
test("out-of-range collection pages do not create indexable empty pagination", () => {
  assert.equal(catalog.catalogPageExists(catalog.catalogQuery({}), 0), true);
  assert.equal(
    catalog.catalogPageExists(catalog.catalogQuery({ page: "2" }), 0),
    false,
  );
  assert.equal(
    catalog.catalogPageExists(catalog.catalogQuery({ page: "2" }), 13),
    true,
  );
  assert.equal(
    catalog.catalogPageExists(catalog.catalogQuery({ page: "3" }), 13),
    false,
  );
});

test("server-rendered listings expose the selected page immediately without a loading-only grid", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const search = new URLSearchParams("page=2&gender=men");
  const { useProductListing } = loadTs("hooks/useProductListing.ts", {
    "next/navigation": {
      useSearchParams: () => search,
      usePathname: () => "/collections/products",
      useRouter: () => ({ push() {} }),
    },
    "@/actions/axiosInstance": {
      get() {
        throw new Error("SSR must use its supplied catalog response");
      },
    },
  });
  const query = catalog.catalogQuery(catalog.catalogSearchParams(search));
  function Results() {
    const result = useProductListing({
      apiEndpoint: "/web/products",
      initialKey: query.key,
      initialData: { products: [sample], total: 36, error: false },
    });
    return React.createElement(
      "div",
      { "data-page": result.page, "data-total": result.total },
      result.loading
        ? "Loading"
        : result.products.map((product) => product.name).join(","),
    );
  }
  const html = renderToStaticMarkup(React.createElement(Results));
  assert.ok(html.includes('data-page="2"'));
  assert.ok(html.includes('data-total="36"'));
  assert.ok(html.includes("Everyday Runner"));
  assert.equal(html.includes("Loading"), false);
});

const pricing = loadTs("utils/pricing.ts");
test("pricing logic displays our real sellingPrice as higher price for item discounts, and marketPrice when no item discount", () => {
  const itemWithDiscount = {
    ...sample,
    sellingPrice: 7500,
    marketPrice: 13990,
    discount: 20,
  };
  // Item discount: original higher price must be our real sellingPrice (7500), not marketPrice (13990)
  assert.equal(pricing.getOriginalPrice(itemWithDiscount), 7500);
  assert.equal(pricing.calculateFinalPrice(itemWithDiscount), 6000);
  assert.equal(pricing.calculateSavings(itemWithDiscount), 1500);
  assert.equal(pricing.calculateSavingsPercent(itemWithDiscount), 20);

  const itemWithoutDiscount = {
    ...sample,
    sellingPrice: 7500,
    marketPrice: 13990,
    discount: 0,
  };
  // No item discount: show marketPrice (13990) as higher price and our real price (7500) as current
  assert.equal(pricing.getOriginalPrice(itemWithoutDiscount), 13990);
  assert.equal(pricing.calculateFinalPrice(itemWithoutDiscount), 7500);
  assert.equal(pricing.calculateSavings(itemWithoutDiscount), 6490);
  assert.equal(pricing.calculateSavingsPercent(itemWithoutDiscount), 46);

  const regularItem = {
    ...sample,
    sellingPrice: 7500,
    marketPrice: 7500,
    discount: 0,
  };
  assert.equal(pricing.getOriginalPrice(regularItem), 7500);
  assert.equal(pricing.calculateFinalPrice(regularItem), 7500);
  assert.equal(pricing.calculateSavings(regularItem), 0);
});

test("discount colors: red for item discount, yellow for promotion", () => {
  const itemWithDiscount = {
    ...sample,
    sellingPrice: 7500,
    marketPrice: 7500,
    discount: 15,
  };
  const regularItem = {
    ...sample,
    sellingPrice: 7500,
    marketPrice: 7500,
    discount: 0,
  };
  const activePromo = {
    id: "promo-1",
    name: "Flash Sale",
    type: "PERCENTAGE",
    actions: [{ value: 10 }],
    conditions: [],
  };

  // Item-level discount only: type is item, color is text-error (red)
  assert.equal(pricing.getDiscountType(itemWithDiscount), "item");
  assert.equal(pricing.getDiscountColorClass("item"), "text-error");

  // Promotion discount only: type is promotion, color is text-warning (yellow)
  assert.equal(pricing.getDiscountType(regularItem, activePromo), "promotion");
  assert.equal(pricing.getDiscountColorClass("promotion"), "text-warning");

  // No discount: type is null, color is empty
  assert.equal(pricing.getDiscountType(regularItem), null);
  assert.equal(pricing.getDiscountColorClass(null), "");

  // Promotion takes precedence over item discount when active
  assert.equal(pricing.getDiscountType(itemWithDiscount, activePromo), "promotion");
});


