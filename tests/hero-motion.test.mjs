import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const svg=fs.readFileSync(new URL('../public/site/assets/img/hero-transformation-system.svg',import.meta.url),'utf8');
const reducedFlame=fs.readFileSync(new URL('../public/site/assets/img/hero-resolved-flame.svg',import.meta.url),'utf8');
const heroCss=fs.readFileSync(new URL('../public/site/assets/css/components/hero.css',import.meta.url),'utf8');
const heroTemplate=fs.readFileSync(new URL('../site-source/templates/index.html',import.meta.url),'utf8');
test('hero motion reuses the complete animated SVG implementation SSOT before certified flame handoff',()=>{
  assert.match(svg,/<style type="text\/css">/);
  for(const id of ['Vector_1735','Vector_1734','Vector_1733','Vector_1732','Vector_1736','Ellipse_1755','fire','home-hero-arm_svg']) assert.match(svg,new RegExp(`id="${id}"`));
  for(const id of ['Vector_1735','Vector_1734','Vector_1733']) assert.match(svg,new RegExp(`kf_${id}_transform_0 9\\.916481s linear 1 forwards`));
  assert.match(svg,/id="Vector_1732"[\s\S]*attributeName="d"[\s\S]*keyTimes="0; 0\.254223; 0\.568293; 1"[\s\S]*dur="9\.91648s"/);
  assert.match(svg,/id="Vector_1736"[\s\S]*attributeName="d"[\s\S]*keyTimes="0; 0\.106691; 0\.221954; 0\.281854; 0\.362859; 0\.561058; 1"/);
  assert.match(svg,/kf_home-hero-arm_svg_transform_0[\s\S]*linear\(0, 0\.0287[\s\S]*20\.21%/);
  assert.match(svg,/id="Ellipse_1755"[\s\S]*keyTimes="0; 0\.4063; 0\.4754; 0\.4864; 0\.5054; 0\.529; 0\.639; 0\.8267; 1"/);
  assert.match(svg,/source_visual_handoff 10\.083148s linear 1 forwards/);
  assert.match(svg,/98\.347%/);
  assert.match(svg,/@keyframes human_energy_dissolve[\s\S]*0%, 63\.68%[\s\S]*cubic-bezier\(0\.5, 0, 0\.5, 1\)[\s\S]*67\.39%, 100% \{ opacity: 0; \}/);
  assert.match(svg,/\.source-energy-owner \{ animation: human_energy_dissolve 9\.916481s linear 1 forwards; \}/);
  assert.doesNotMatch(svg,/\.source-cloud-owner, \.source-energy-owner, \.source-fire-owner/);
  assert.match(svg,/class="source-cloud-owner"[\s\S]*class="source-energy-owner"[\s\S]*class="source-fire-owner"/);
  assert.match(svg,/begin="9\.916481s" dur="5\.4s" repeatCount="indefinite"/);
  assert.match(svg,/class="certified-flame-breathe"><svg x="476" y="191"/);
  assert.match(svg,/<linearGradient id="flame-fill" x1="213\.106" y1="-71\.4661" x2="213\.106" y2="274\.172"/);
  assert.match(svg,/id="Vector_1732"[\s\S]*repeatCount="1" fill="freeze"/);
  assert.match(svg,/id="Vector_1736"[\s\S]*repeatCount="1" fill="freeze"/);
  assert.match(svg,/id="Ellipse_1755"[\s\S]*attributeName="height"[\s\S]*repeatCount="1" fill="freeze"[\s\S]*attributeName="width"[\s\S]*repeatCount="1" fill="freeze"/);
  assert.match(heroTemplate,/<section class="hero"[^>]*>\s*<img class="hero__transformation"[\s\S]*<div class="hero__layout">/);
  assert.match(heroCss,/\.home-page main \{ overflow: visible; \}/);
  assert.match(heroCss,/\.hero__transformation \{[\s\S]*inset-inline-start: 0;[\s\S]*width: var\(--dimension-100vw\);[\s\S]*transform: none;/);
  assert.doesNotMatch(heroCss,/\.hero__transformation \{[\s\S]*inset-inline-start: 50%;[\s\S]*transform: translateX\(-50%\);/);
  assert.doesNotMatch(heroCss,/@keyframes hero-hand-enter/);
});

test('reduced motion resolves directly to one static flame at the host owner',()=>{
  assert.match(heroCss,/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.hero__transformation \{ display: none; \}[\s\S]*\.hero__resolved-flame \{ display: block; \}/);
  assert.match(heroTemplate,/class="hero__resolved-flame" src="\/site\/assets\/img\/hero-resolved-flame\.svg"/);
  assert.match(reducedFlame,/width="260" height="340"/);
  assert.doesNotMatch(reducedFlame,/hero-cloud|animation|@keyframes/);
});
