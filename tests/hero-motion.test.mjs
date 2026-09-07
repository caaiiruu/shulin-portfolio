import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const svg=fs.readFileSync(new URL('../public/site/assets/img/hero-transformation-system.svg',import.meta.url),'utf8');
const reducedFlame=fs.readFileSync(new URL('../public/site/assets/img/hero-resolved-flame.svg',import.meta.url),'utf8');
const heroCss=fs.readFileSync(new URL('../public/site/assets/css/components/hero.css',import.meta.url),'utf8');
const heroTemplate=fs.readFileSync(new URL('../site-source/templates/index.html',import.meta.url),'utf8');
const approvedUnifiedPath='M176.256 35.4244C208.222 13.6951 231.464 62.7063 227.372 89.9974';
test('hero motion follows the approved 30fps reference timeline through flame handoff',()=>{
  assert.match(svg,/hero-unified-cloud/);
  assert.ok(svg.includes(approvedUnifiedPath),'unified state must use the Human-approved silhouette');
  for(const name of ['cloud-top-converge','cloud-upper-right-converge','cloud-bottom-converge','cloud-left-converge','cloud-lower-right-converge']){
    const block=svg.match(new RegExp(`@keyframes ${name} \\{([\\s\\S]*?)\\n    \\}`))?.[1]||'';
    assert.ok((block.match(/% \{/g)||[]).length>=95,`${name} must retain frame-sampled interpolation stops`);
  }
  assert.match(svg,/@keyframes unified-cloud-takeover[\s\S]*60\.804% \{ opacity:0\.72;[\s\S]*75\.377% \{ opacity:1;[\s\S]*96\.985% \{ opacity:0\.72;/);
  assert.match(svg,/hero-cloud,.hero-unified-cloud \{ display:none!important/);
  assert.match(svg,/animation-duration: 6\.633333s/);
  assert.match(svg,/animation-timing-function: linear/);
  assert.match(svg,/animation:unified-cloud-takeover 6\.633333s linear both/);
  assert.match(svg,/animation: flame-reveal 6\.633333s linear both/);
  assert.match(svg,/96\.985% \{ opacity:0\.12;[\s\S]*100% \{ opacity:1;/);
  assert.match(svg,/begin="6\.433333s" dur="5\.4s"/);
  assert.match(svg,/animation: flame-breathe 4\.4s[\s\S]*6\.433333s infinite/);
  assert.match(heroCss,/hero-hand-enter calc\(var\(--dimension-700ms\) \* 2\.380952\) linear both/);
  assert.match(heroCss,/38% \{ opacity:1; transform:translateX\(9\.737%\); \}[\s\S]*100% \{ opacity:1; transform:translateX\(0%\); \}/);
});

test('reduced motion resolves directly to one static flame at the host owner',()=>{
  assert.match(heroCss,/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.hero__transformation \{ display: none; \}[\s\S]*\.hero__resolved-flame \{ display: block; \}/);
  assert.match(heroTemplate,/class="hero__resolved-flame" src="\/site\/assets\/img\/hero-resolved-flame\.svg"/);
  assert.match(reducedFlame,/width="260" height="340"/);
  assert.doesNotMatch(reducedFlame,/hero-cloud|animation|@keyframes/);
});
