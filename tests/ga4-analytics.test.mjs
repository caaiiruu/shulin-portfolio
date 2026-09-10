import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve("public/site");
const measurementId = "G-RSC73N4BPX";

test("GA4 has one canonical runtime owner and one initialization path", () => {
  const build = fs.readFileSync("scripts/build-production-assets.mjs", "utf8");
  const analytics = fs.readFileSync(path.join(root, "assets/js/analytics.js"), "utf8");
  const trackedRuntimeOwners = [...build.matchAll(/"assets\/js\/([^"\n]+\.js)"/g)].map((match) => match[1]);

  assert.equal(trackedRuntimeOwners.filter((file) => file === "analytics.js").length, 1);
  assert.equal((analytics.match(/window\.gtag\('config',measurementId\)/g) || []).length, 1);
  assert.equal((analytics.match(/window\.__portfolioGa4Initialized=true/g) || []).length, 1);
  assert.match(analytics, /window\.dataLayer=window\.dataLayer\|\|\[\]/);
  assert.match(analytics, /www\.googletagmanager\.com\/gtag\/js\?id=/);
  assert.match(analytics, /try\{/);
  assert.match(analytics, /catch\{\}/);
});

test("Production CSP grants the required non-advertising GA4 origins", () => {
  const config = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
  const csp = config.headers[0].headers.find((header) => header.key === "Content-Security-Policy")?.value;

  assert.ok(csp);
  assert.match(csp, /script-src 'self' https:\/\/www\.googletagmanager\.com/);
  assert.match(csp, /img-src 'self' data: blob: https:\/\/\*\.google-analytics\.com https:\/\/www\.googletagmanager\.com/);
  assert.match(csp, /connect-src 'self' https:\/\/\*\.google-analytics\.com https:\/\/\*\.analytics\.google\.com https:\/\/www\.googletagmanager\.com/);
  assert.doesNotMatch(csp, /'unsafe-inline'/);
  assert.doesNotMatch(csp, /(?:^|;\s)(?:script-src|connect-src)[^;]*(?:\s\*|https:)\s*(?:;|$)/);
  assert.doesNotMatch(csp, /doubleclick|googlesyndication|googleadservices/);
});

test("Generated pages share one fingerprinted bundle containing one GA4 config", () => {
  const scripts = fs.readdirSync(path.join(root, "assets/js")).filter((file) => /^production\.[a-f0-9]{16}\.js$/.test(file));
  assert.equal(scripts.length, 1);
  const bundle = fs.readFileSync(path.join(root, "assets/js", scripts[0]), "utf8");

  assert.equal((bundle.match(new RegExp(measurementId, "g")) || []).length, 1);
  assert.equal((bundle.match(/www\.googletagmanager\.com\/gtag\/js\?id=/g) || []).length, 1);
  assert.equal((bundle.match(/window\.gtag\('config',measurementId\)/g) || []).length, 1);

  for (const page of ["index.html", "work.html", "experiments.html", "profile.html"]) {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    assert.equal((html.match(new RegExp(`/site/assets/js/${scripts[0].replaceAll(".", "\\.")}`, "g")) || []).length, 1);
  }
});
