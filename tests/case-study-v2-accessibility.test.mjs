import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const css=fs.readFileSync('public/site/assets/css/components/case-study-v2.css','utf8');
const content=JSON.parse(fs.readFileSync('public/site/content/case-studies/daily-hours/content.json','utf8'));
const tokens=Object.fromEntries([...css.matchAll(/--(csv2-[\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([,name,value])=>[name,value.toLowerCase()]));
const luminance=hex=>{
  const channels=hex.match(/[0-9a-f]{2}/gi).map(value=>parseInt(value,16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);
  return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];
};
const contrast=(foreground,background)=>{
  const values=[luminance(foreground),luminance(background)].sort((a,b)=>b-a);
  return (values[0]+.05)/(values[1]+.05);
};
const critical=[
  ['hero brand emphasis',tokens['csv2-brand'],tokens['csv2-bg'],3],
  ['small accent on page',tokens['csv2-accent-text'],tokens['csv2-bg'],4.5],
  ['small accent on panel',tokens['csv2-accent-text'],tokens['csv2-panel'],4.5],
  ['primary text on page',tokens['csv2-text'],tokens['csv2-bg'],4.5],
  ['muted text on page',tokens['csv2-muted'],tokens['csv2-bg'],4.5],
  ['muted text on panel',tokens['csv2-muted'],tokens['csv2-panel'],4.5],
  ['selected-state text',tokens['csv2-text'],tokens['csv2-panel-strong'],4.5],
  ['selected-state border',tokens['csv2-control'],tokens['csv2-panel-strong'],3],
  ['focus indicator',tokens['csv2-focus'],tokens['csv2-bg'],3],
  ['dark large text on brand',tokens['csv2-on-brand'],tokens['csv2-brand'],3],
  ['CTA text on action surface','#ffffff',tokens['csv2-action'],4.5]
];

test('CSV2 semantic colors meet WCAG 2.2 AA critical contrast gates',()=>{
  for(const [name,foreground,background,minimum] of critical){
    assert.ok(foreground&&background,`${name}: colors resolve`);
    assert.ok(contrast(foreground,background)>=minimum,`${name}: ${contrast(foreground,background).toFixed(2)} >= ${minimum}`);
  }
  assert.ok(contrast(tokens['csv2-brand'],tokens['csv2-bg'])<4.5,'brand blue remains explicitly excluded from small text');
});

test('CSV2 closing content is distinct, native, and Human-approved',()=>{
  assert.equal(content.outcomesHeadline,'A working decision system, not a portfolio concept.');
  assert.deepEqual(content.outcomes.map(item=>[item.theme,item.title,item.statement]),[
    ['Reality','Live product','Used in real freelance work, not built only as a portfolio concept.'],
    ['Velocity','~2 days','To the first usable version, shortening the problem-to-learning loop.'],
    ['Learning','Continuous iteration','Real usage continues to expose where the system should change next.']
  ]);
  assert.equal(content.decisions.some(decision=>content.outcomes.some(outcome=>outcome.title===decision.title||outcome.statement===decision.direction)),false);
  assert.equal(content.cta.label,'Request demo access');
  assert.equal(content.cta.headline,'Try the working product');
  assert.match(content.cta.href,/^mailto:r\.c\.shulin@gmail\.com\?subject=Daily%20Hours%20demo%20access%20request&body=/);
});

export {contrast,critical};
