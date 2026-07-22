import fs from 'node:fs';

const root=new URL('../',import.meta.url);
const pages=['index.html','work.html','experiments.html','profile.html'];
const failures=[];
const tokens=fs.readFileSync(new URL('assets/css/tokens-v72.css',root),'utf8');
const system=fs.readFileSync(new URL('assets/css/system-v72.css',root),'utf8');

for(const page of pages){
  const html=fs.readFileSync(new URL(page,root),'utf8');
  if(!html.includes('data-version="41"'))failures.push(`${page} is not V41`);
  const cssLinks=[...html.matchAll(/href="([^"]+\.css)"/g)].map(match=>match[1]);
  if(cssLinks.length!==1||!/^\/site\/assets\/css\/production\.[a-f0-9]{16}\.css$/.test(cssLinks[0]))failures.push(`${page} must load exactly one fingerprinted production stylesheet`);
  if(/Quick preview|快速預覽/.test(html))failures.push(`${page} still promises a quick preview`);
}

for(const semantic of ['--color-text-primary: var(','--color-surface: var(','--color-border: var(']){
  if(!tokens.includes(semantic))failures.push(`semantic token is not traceable: ${semantic}`);
}
for(const rawHex of system.match(/#[0-9a-f]{3,8}\b/gi)||[])failures.push(`canonical system CSS contains raw hex ${rawHex}`);
if(!system.includes('var(--section-space)')||!system.includes('var(--card-padding)'))failures.push('canonical spacing does not consume semantic tokens');

if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('V41 token governance passed.');
