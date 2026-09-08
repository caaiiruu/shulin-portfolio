import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import test from "node:test";

test("Hero production URLs track source bytes deterministically without changing artwork", () => {
  const projectRoot = fileURLToPath(new URL("../", import.meta.url));
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "hero-cache-fingerprint-"));
  const names = ["hero-transformation-system", "hero-resolved-flame", "hero-clarity-system"];
  try {
    for (const directory of ["scripts", "site-source", "public/site"]) {
      fs.cpSync(path.join(projectRoot, directory), path.join(fixture, directory), { recursive: true });
    }
    fs.symlinkSync(path.join(projectRoot, "node_modules"), path.join(fixture, "node_modules"), "dir");
    const build = () => execFileSync(process.execPath, ["scripts/build-production-assets.mjs"], { cwd: fixture, stdio: "pipe" });
    const urls = () => {
      const html = fs.readFileSync(path.join(fixture, "public/site/index.html"), "utf8");
      return names.map(name => {
        assert.ok(!html.includes(`/site/assets/img/${name}.svg`), `stable ${name} must not render`);
        const url = html.match(new RegExp(`/site/assets/img/${name}\\.[a-f0-9]{16}\\.svg`))?.[0];
        assert.ok(url, `generated HTML references fingerprinted ${name}`);
        const source = fs.readFileSync(path.join(fixture, `public/site/assets/img/${name}.svg`));
        const hash = createHash("sha256").update(source).digest("hex").slice(0, 16);
        assert.equal(url, `/site/assets/img/${name}.${hash}.svg`);
        assert.deepEqual(fs.readFileSync(path.join(fixture, "public", url)), source);
        return url;
      });
    };
    build();
    const first = urls();
    build();
    assert.deepEqual(urls(), first, "identical bytes keep identical URLs");
    // Mutate fixture copies only; canonical artwork is never edited by this test.
    for (const name of names) fs.appendFileSync(path.join(fixture, `public/site/assets/img/${name}.svg`), "\n<!-- fingerprint fixture -->\n");
    build();
    const changed = urls();
    changed.forEach((url, index) => {
      assert.notEqual(url, first[index], "changed bytes invalidate each Hero URL");
      assert.ok(!fs.existsSync(path.join(fixture, "public", first[index])), "stale generated copies are cleaned");
    });
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});
