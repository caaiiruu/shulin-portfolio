import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const svg=fs.readFileSync(new URL('../public/site/assets/img/hero-transformation-system.svg',import.meta.url),'utf8');
const reducedFlame=fs.readFileSync(new URL('../public/site/assets/img/hero-resolved-flame.svg',import.meta.url),'utf8');
const heroCss=fs.readFileSync(new URL('../public/site/assets/css/components/hero.css',import.meta.url),'utf8');
const heroTemplate=fs.readFileSync(new URL('../site-source/templates/index.html',import.meta.url),'utf8');
const approvedUnifiedPath='M176.256 35.4244C208.222 13.6951 231.464 62.7063 227.372 89.9974';
const trajectories={
  top:[[0,0],[-11,136],[-17,210],[-19,238],[-20,247]],
  upperRight:[[0,0],[-278,109],[-430,169],[-487,191],[-505,198]],
  bottom:[[0,0],[-46,-86],[-71,-133],[-80,-150],[-83,-156]],
  left:[[0,0],[313,6],[483,9],[548,10],[568,10]],
  lowerRight:[[0,0],[-375,-35],[-580,-54],[-658,-62],[-682,-64]],
};

test('cloud convergence is monotonic and retains readable mass',()=>{
  for(const [name,points] of Object.entries(trajectories)){
    const end=points.at(-1);const distances=points.map(([x,y])=>Math.hypot(end[0]-x,end[1]-y));
    assert.ok(distances.every((distance,index)=>index===0||distance<=distances[index-1]),`${name} must move continuously inward`);
  }
  assert.match(svg,/hero-unified-cloud/);
  assert.ok(svg.includes(approvedUnifiedPath),'unified state must use the Human-approved silhouette');
  assert.match(svg,/@keyframes unified-cloud-takeover[\s\S]*50%[\s\S]*58% \{ opacity:\.32;[\s\S]*68% \{ opacity:\.92;[\s\S]*86% \{ opacity:\.76;/);
  assert.match(svg,/hero-cloud,.hero-unified-cloud \{ display:none!important/);
  assert.doesNotMatch(svg,/scale\(\.(?:08|1|14)\)/);
  assert.match(svg,/0%, 78%[\s\S]*84%[\s\S]*90%[\s\S]*96%[\s\S]*100%/);
  assert.match(svg,/cubic-bezier\(\.4, 0, \.2, 1\)/);
  assert.match(svg,/cubic-bezier\(\.33,0,\.2,1\)/);
  assert.match(svg,/cubic-bezier\(\.3, 0, \.15, 1\)/);
  assert.match(svg,/animation-duration: 4\.5s/);
  assert.match(svg,/animation:unified-cloud-takeover 6\.67s/);
  assert.match(svg,/animation: flame-reveal 6\.67s/);
  assert.match(svg,/animation: flame-breathe 4\.4s[\s\S]*6\.67s infinite/);
  assert.match(heroCss,/hero-hand-enter var\(--dimension-700ms\)[\s\S]*both/);
  assert.doesNotMatch(heroCss,/hero-hand-enter var\(--dimension-2400ms\)/);
});

test('reduced motion resolves directly to one static flame at the host owner',()=>{
  assert.match(heroCss,/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.hero__transformation \{ display: none; \}[\s\S]*\.hero__resolved-flame \{ display: block; \}/);
  assert.match(heroTemplate,/class="hero__resolved-flame" src="\/site\/assets\/img\/hero-resolved-flame\.svg"/);
  assert.match(reducedFlame,/width="260" height="340"/);
  assert.doesNotMatch(reducedFlame,/hero-cloud|animation|@keyframes/);
});
