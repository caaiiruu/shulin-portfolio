import fs from 'node:fs';

const root=new URL('../',import.meta.url);
const pages=['index.html','work.html','experiments.html','profile.html'];
const errors=[];

for(const page of pages){
  const html=fs.readFileSync(new URL(page,root),'utf8');
  const styles=[...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(m=>m[1]);
  const scripts=[...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map(m=>m[1]);
  if(styles.length!==1||!/^\/site\/assets\/css\/production\.[a-f0-9]{16}\.css$/.test(styles[0]))errors.push(`${page}: exactly one fingerprinted production stylesheet is required`);
  if(scripts.length!==1||!/^\/site\/assets\/js\/production\.[a-f0-9]{16}\.js$/.test(scripts[0]))errors.push(`${page}: exactly one fingerprinted production runtime is required`);
  if(!html.includes('data-version="41"'))errors.push(`${page}: data-version is not 41`);
  for(const required of ['id="detailBack"']){
    if(!html.includes(required))errors.push(`${page}: required runtime contract missing: ${required}`);
  }
  if(html.includes('cursor-feedback')||html.includes('data-cursor='))errors.push(`${page}: custom cursor feedback still present`);
}

const tokens=fs.readFileSync(new URL('assets/css/tokens-v72.css',root),'utf8');
const system=fs.readFileSync(new URL('assets/css/system-v72.css',root),'utf8');
const popup=fs.readFileSync(new URL('assets/css/components/popup-shell.css',root),'utf8');
const rail=fs.readFileSync(new URL('assets/css/components/horizontal-rail.css',root),'utf8');
for(const token of ['--space-4','--color-text-primary','--font-sans','--text-body','--page-gutter','--radius-lg','--motion-base']){
  if(!tokens.includes(token))errors.push(`tokens-v72.css: ${token} missing`);
}
for(const contract of ['data-matcher-state="idle"','scroll-snap-type','grid-template-rows: auto minmax(3.2em, auto) 1fr auto','dialog-controls-v67','prefers-reduced-motion: reduce']){
  if(!system.includes(contract))errors.push(`system-v72.css: ${contract} contract missing`);
}
for(const contract of ['.detail-dialog-v45','.dialog-scroll','.dialog-controls-v67','.modal-back-v66','.modal-close','prefers-reduced-motion: reduce']){
  if(!popup.includes(contract))errors.push(`popup-shell.css: ${contract} contract missing`);
}
for(const contract of ['.rail-button','.rail-controls','scroll-snap-type:x mandatory','scroll-snap-stop:always','--rail-gap: 12px']){
  if(!rail.includes(contract))errors.push(`horizontal-rail.css: ${contract} contract missing`);
}
if(/!important[\s\S]*!important[\s\S]*!important/.test(tokens))errors.push('tokens-v72.css: tokens must not contain selector overrides');

if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('V41 design-system lint passed.');
