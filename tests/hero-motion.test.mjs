import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const svg=fs.readFileSync(new URL('../public/site/assets/img/hero-transformation-system.svg',import.meta.url),'utf8');
const reducedFlame=fs.readFileSync(new URL('../public/site/assets/img/hero-resolved-flame.svg',import.meta.url),'utf8');
const heroCss=fs.readFileSync(new URL('../public/site/assets/css/components/hero.css',import.meta.url),'utf8');
const heroTemplate=fs.readFileSync(new URL('../site-source/templates/index.html',import.meta.url),'utf8');
test('hero motion reuses the animated SVG implementation SSOT through certified flame handoff',()=>{
  for(const id of ['Vector_1735','Vector_1734','Vector_1733','Vector_1732','Vector_1736','Ellipse_1755','fire','home-hero-arm_svg']) assert.match(svg,new RegExp(`id="${id}"`));
  for(const id of ['Vector_1735','Vector_1734','Vector_1733']) assert.match(svg,new RegExp(`kf_${id}_transform_0 9\\.916481s linear infinite`));
  assert.match(svg,/id="Vector_1732"[\s\S]*attributeName="d"[\s\S]*keyTimes="0; 0\.254223; 0\.568293; 1"[\s\S]*dur="9\.91648s"/);
  assert.match(svg,/id="Vector_1736"[\s\S]*attributeName="d"[\s\S]*keyTimes="0; 0\.106691; 0\.221954; 0\.281854; 0\.362859; 0\.561058; 1"/);
  assert.match(svg,/kf_home-hero-arm_svg_transform_0[\s\S]*linear\(0, 0\.0287[\s\S]*20\.21%/);
  assert.match(svg,/id="Ellipse_1755"[\s\S]*keyTimes="0; 0\.4063; 0\.4754; 0\.4864; 0\.5054; 0\.529; 0\.639; 0\.8267; 1"/);
  assert.match(svg,/67\.39%[\s\S]*69\.07%/);
  assert.match(svg,/begin="6\.682717s" dur="5\.4s"/);
  assert.doesNotMatch(heroCss,/@keyframes hero-hand-enter/);
});

test('reduced motion resolves directly to one static flame at the host owner',()=>{
  assert.match(heroCss,/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.hero__transformation \{ display: none; \}[\s\S]*\.hero__resolved-flame \{ display: block; \}/);
  assert.match(heroTemplate,/class="hero__resolved-flame" src="\/site\/assets\/img\/hero-resolved-flame\.svg"/);
  assert.match(reducedFlame,/width="260" height="340"/);
  assert.doesNotMatch(reducedFlame,/hero-cloud|animation|@keyframes/);
});
