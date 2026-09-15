import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const html=fs.readFileSync('public/site/work/daily-hours.html','utf8');
const content=JSON.parse(fs.readFileSync('public/site/content/portfolio-content.json','utf8'));

test('Daily Hours emits an isolated Preview document with exact SEO',()=>{
  assert.match(html,/<title>Daily Hours — Shulin Chou<\/title>/);
  assert.match(html,/<meta name="description" content="An independent freelance project-economics and decision workspace\."\/>/);
  assert.match(html,/<link rel="canonical" href="https:\/\/shulinchou\.com\/work\/daily-hours"\/>/);
  assert.match(html,/data-presentation-contract="case-study-v2"/);
  assert.match(html,/data-case-study-v2-root="daily-hours"/);
  assert.doesNotMatch(html,/id="detailDialog"|data-project="daily-hours"|work-card-v32/);
});

test('public IA and legacy project roster remain unchanged',()=>{
  assert.equal(Object.keys(content.projects).length,13);
  assert.equal(content.projects['daily-hours'],undefined);
  const matches=Object.values(content.experiments||{}).filter(item=>item.publicSlug==='daily-hours'&&item.title?.en==='Daily Hours');
  assert.equal(matches.length,1);
  const work=fs.readFileSync('public/site/work.html','utf8');
  assert.doesNotMatch(work,/data-project="daily-hours"/);
});

test('generated runtime contains one V2 registry and no film CTA',()=>{
  const script=html.match(/src="(\/site\/assets\/js\/production\.[a-f0-9]+\.js)"/)?.[1];
  assert.ok(script);
  const runtime=fs.readFileSync(`public/site/${script.slice('/site/'.length)}`,'utf8');
  assert.match(runtime,/PROJECT_PRESENTATION_REGISTRY/);
  assert.match(runtime,/CASE_STUDY_PRESENTATIONS/);
  assert.doesNotMatch(runtime,/Play product film/);
});
