import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const pages={
  'index.html':'https://shulinchou.com/',
  'work.html':'https://shulinchou.com/work',
  'experiments.html':'https://shulinchou.com/experiments',
  'profile.html':'https://shulinchou.com/profile'
};
const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
const runtime=fs.readFileSync('public/site/assets/js/app.js','utf8');
const homepageRuntime=fs.readFileSync('public/site/assets/js/home.js','utf8');

test('human-facing templates emit only clean page URLs',()=>{
  for(const [file,canonical] of Object.entries(pages)){
    const html=fs.readFileSync(`site-source/templates/${file}`,'utf8');
    const hrefs=[...html.matchAll(/href="([^"]+)"/g)].map(match=>match[1]);
    const pageHrefs=hrefs.filter(href=>href.startsWith('/')&&!href.startsWith('/site/assets/'));
    assert.equal(pageHrefs.some(href=>href==='/site'||href.startsWith('/site/')||href.includes('.html')),false,`${file}: clean page links`);
    assert.match(html,new RegExp(`<link rel="canonical" href="${canonical.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}"/>`));
    assert.match(html,new RegExp(`<meta property="og:url" content="${canonical.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}"/>`));
  }
});

test('built pages retain one clean canonical and no implementation-detail page links',()=>{
  const built=['index.html','work.html','experiments.html','profile.html',...fs.readdirSync('public/site/work').filter(file=>file.endsWith('.html')).map(file=>`work/${file}`)];
  for(const file of built){
    const html=fs.readFileSync(`public/site/${file}`,'utf8');
    assert.equal((html.match(/<link rel="canonical"/g)||[]).length,1,`${file}: one canonical`);
    assert.equal((html.match(/<meta property="og:url"/g)||[]).length,1,`${file}: one og:url`);
    const hrefs=[...html.matchAll(/href="([^"]+)"/g)].map(match=>match[1]);
    const pageHrefs=hrefs.filter(href=>href.startsWith('/')&&!href.startsWith('/site/assets/'));
    assert.equal(pageHrefs.some(href=>href==='/site'||href.startsWith('/site/')||href.includes('.html')),false,`${file}: clean built page links`);
  }
});

test('clean routes rewrite to the preserved static site tree',()=>{
  const rewrites=Object.fromEntries(config.rewrites.map(({source,destination})=>[source,destination]));
  assert.deepEqual(rewrites,{
    '/':'/site/index',
    '/work':'/site/work',
    '/experiments':'/site/experiments',
    '/profile':'/site/profile',
    '/work/:projectId':'/site/work/:projectId'
  });
});

test('legacy human-visible routes permanently redirect to clean canonicals',()=>{
  const redirects=Object.fromEntries(config.redirects.map(({source,destination,permanent})=>[source,{destination,permanent}]));
  for(const [source,destination] of Object.entries({
    '/site':'/',
    '/site/index':'/',
    '/site/index.html':'/',
    '/site/work':'/work',
    '/site/work.html':'/work',
    '/site/experiments':'/experiments',
    '/site/experiments.html':'/experiments',
    '/site/profile':'/profile',
    '/site/profile.html':'/profile',
    '/site/playground':'/experiments',
    '/site/work/:projectId':'/work/:projectId'
  }))assert.deepEqual(redirects[source],{destination,permanent:true});
});

test('popup history emits clean project URLs without weakening scroll restoration',()=>{
  assert.match(runtime,/url\.pathname=`\/work\/\$\{encodeURIComponent\(canonicalProjectId\(projectId\)\)\}`/);
  assert.match(runtime,/url\.pathname='\/work'/);
  assert.match(runtime,/history\.pushState\(\{detail:\{type:'project',key\},scrollTop:0\},'',nextProjectUrl\)/);
  assert.match(runtime,/restoreScrollTop:Number\.isFinite\(event\.state\?\.scrollTop\)/);
  assert.doesNotMatch(runtime,/url\.pathname=['`]\/site\/work/);
});

test('direct canonical homepage anchors invoke the governed Domains offset owner',()=>{
  assert.match(homepageRuntime,/function positionDomainStart\(\{behavior='auto',updateHistory=false\}=\{\}\)/);
  assert.match(homepageRuntime,/function scrollToDomainStart\(event\)[\s\S]*positionDomainStart\(\{[\s\S]*updateHistory:true/);
  assert.match(homepageRuntime,/function scheduleDomainHashPosition\(\)[\s\S]*requestAnimationFrame\(\(\)=>requestAnimationFrame\(\(\)=>\{[\s\S]*positionDomainStart\(\{behavior:'instant'\}\)/);
  assert.match(homepageRuntime,/window\.addEventListener\('hashchange',[\s\S]*scheduleDomainHashPosition\(\)/);
  assert.match(homepageRuntime,/window\.addEventListener\('pageshow',[\s\S]*scheduleDomainHashPosition\(\)/);
  assert.doesNotMatch(homepageRuntime,/history\.pushState\([^\n]*#domains[^\n]*scheduleDomainHashPosition/);
});
