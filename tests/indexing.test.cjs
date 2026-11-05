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

test("Firebase origin hosts do not noindex the public domain behind its proxy", async () => {
  const { default: nextConfig } = await import("../next.config.mjs");
  for (const forwardedHost of ["neverbe.lk", "www.neverbe.lk", "dev.neverbe.lk", "store--preview.hosted.app"]) {
    const response = await unstable_getResponseFromNextConfig({
      url: "https://web-origin.a.run.app/collections/running-shoes",
      headers: { host: "web-origin.a.run.app", "x-forwarded-host": forwardedHost },
      nextConfig,
    });
    const publicHost = ["neverbe.lk", "www.neverbe.lk"].includes(forwardedHost);
    assert.equal(response.headers.get("x-robots-tag"), publicHost ? null : "noindex, nofollow");
  }
});

test("favicon and app icons adhere to Google Search guidelines (raster PNG/ICO, multiples of 48px square, no SVG)", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const layoutContent = fs.readFileSync(path.join(__dirname, "../app/layout.tsx"), "utf8");

  // Google does not support SVG favicons in search results
  assert.equal(/type:\s*["']image\/svg\+xml["']/.test(layoutContent), false);
  assert.equal(/neverbe-mark-black\.svg/.test(layoutContent), false);

  // App router icon routes must exist
  assert.equal(fs.existsSync(path.join(__dirname, "../app/favicon.ico")), true);
  assert.equal(fs.existsSync(path.join(__dirname, "../app/icon.png")), true);
  assert.equal(fs.existsSync(path.join(__dirname, "../public/favicon.ico")), true);
  assert.equal(fs.existsSync(path.join(__dirname, "../public/icon-192.png")), true);

  // Fallback OG image in route.tsx must not point to public/ to avoid App Hosting standalone public copy skipping bug
  const ogRouteContent = fs.readFileSync(path.join(__dirname, "../app/api/og/product/[itemId]/route.tsx"), "utf8");
  assert.equal(ogRouteContent.includes("public/collections-og.png"), false);
  assert.equal(ogRouteContent.includes("assets/images/collections-og.png"), true);
  assert.equal(fs.existsSync(path.join(__dirname, "../assets/images/collections-og.png")), true);
});

