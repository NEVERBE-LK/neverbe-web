const test = require("node:test");
const assert = require("node:assert/strict");
// Next's server bootstrap normally installs this before loading route utilities.
global.AsyncLocalStorage = require("node:async_hooks").AsyncLocalStorage;
const { unstable_getResponseFromNextConfig } = require("next/experimental/testing/server");

test("www redirects permanently to the canonical host, preserving product path and query", async () => {
  const { default: nextConfig } = await import("../next.config.mjs");
  const response = await unstable_getResponseFromNextConfig({
    url: "https://www.neverbe.lk/collections/running-shoes?page=2&sizes=40",
    headers: { host: "www.neverbe.lk" },
    nextConfig,
  });
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "https://neverbe.lk/collections/running-shoes?page=2&sizes=40");
});

test("only the public storefront can be indexed; staging and default hosting domains cannot", async () => {
  const { default: nextConfig } = await import("../next.config.mjs");
  for (const host of ["neverbe.lk", "dev.neverbe.lk", "store--preview.hosted.app", "neverbe.web.app", "localhost:3000"]) {
    const response = await unstable_getResponseFromNextConfig({
      url: `http://${host}/collections/running-shoes`,
      headers: { host },
      nextConfig,
    });
    assert.equal(response.headers.get("location"), null);
    assert.equal(response.headers.get("x-robots-tag"), host === "neverbe.lk" ? null : "noindex, nofollow");
  }
});
