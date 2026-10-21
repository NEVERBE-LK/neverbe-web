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
