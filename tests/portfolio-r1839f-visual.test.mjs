import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const site=new URL("../public/site/",import.meta.url);
const read=path=>fs.readFileSync(new URL(path,site),"utf8");
const html=read("../../site-source/templates/work.html");
const css=read("assets/css/components/project-detail-overview.css");
const tokens=read("assets/css/tokens.css");
const registry=JSON.parse(read("docs/design-system/registry.json"));

test("R183.9F places the Transformation title before the visual flow",()=>{
  const start=html.indexOf('<section class="key-intervention-map"');
  const section=html.slice(start,html.indexOf('</section>',start));
  assert.ok(section.indexOf('key-intervention-map__title')<section.indexOf('projectKeyInterventionFlow'));
});

test("R183.9F gives SYSTEM CHANGE dominant shared-component hierarchy",()=>{
  assert.match(css,/\.key-intervention-map__node\.is-intervention\{[^}]*border:var\(--dimension-2px\)[^}]*background:var\(--color-text-primary\)[^}]*box-shadow:var\(--shadow-sm\)/);
  assert.match(css,/\.key-intervention-map__node\{[^}]*border:0;[^}]*border-top:var\(--dimension-2px\)/);
  assert.match(css,/\.key-intervention-map__node\.is-after\{border-color:var\(--color-text-accent\)\}/);
});

test("R183.9F preserves explicit forward progression and Contribution separation",()=>{
  assert.match(css,/\.key-intervention-map__connector\{--arrow-rotation:var\(--arrow-rotate-down\);justify-self:center\}/);
  assert.match(css,/\.key-intervention-map\+\.contribution-block\{margin-top:var\(--transformation-contribution-gap\)\}/);
  for(const token of ["transformation-flow-gap","transformation-shell-padding","transformation-node-padding","transformation-contribution-gap"]){
    assert.ok(tokens.includes(`--${token}:`),token);
    assert.equal(registry.governanceGraph.tokenContracts[token].owner,"ProjectDetailOverview");
  }
});
