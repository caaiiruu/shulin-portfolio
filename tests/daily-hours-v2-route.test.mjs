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

test('public IA adds one CSV2 projection while the legacy project roster remains unchanged',()=>{
  assert.equal(Object.keys(content.projects).length,13);
  assert.equal(content.projects['daily-hours'],undefined);
  const matches=Object.values(content.experiments||{}).filter(item=>item.publicSlug==='daily-hours'&&item.title?.en==='Daily Hours');
  assert.equal(matches.length,1);
  assert.equal(matches[0].releaseEligibility,'DEFERRED_NON_SHIPPING');
  const work=fs.readFileSync('public/site/work.html','utf8');
  assert.doesNotMatch(work,/data-project="daily-hours"/);
  const runtime=fs.readFileSync('public/site/assets/js/app.js','utf8');
  assert.match(runtime,/dataset\.publicWorkRoute/);
});

test('temporary EN-only mode removes switch controls from generated public HTML without deleting zh content',()=>{
  assert.equal(content.publicLocaleMode,'EN_ONLY_TEMPORARY');
  for(const file of ['index.html','work.html','experiments.html','profile.html','work/daily-hours.html']){
    const page=fs.readFileSync(`public/site/${file}`,'utf8');
    assert.doesNotMatch(page,/data-lang-toggle/);
    assert.match(page,/<html lang="en">/);
  }
  assert.equal(content.projects.voucher.title.zh.length>0,true);
});

test('public sitemap contains one canonical Daily Hours route',()=>{
  const sitemap=fs.readFileSync('public/sitemap.xml','utf8');
  assert.equal((sitemap.match(/https:\/\/shulinchou\.com\/work\/daily-hours/g)||[]).length,1);
  assert.doesNotMatch(sitemap,/experiments\?experiment=daily-hours/);
});

test('generated runtime contains one V2 registry and no film CTA',()=>{
  const script=html.match(/src="(\/site\/assets\/js\/production\.[a-f0-9]+\.js)"/)?.[1];
  assert.ok(script);
  const runtime=fs.readFileSync(`public/site/${script.slice('/site/'.length)}`,'utf8');
  assert.match(runtime,/PROJECT_PRESENTATION_REGISTRY/);
  assert.match(runtime,/CASE_STUDY_PRESENTATIONS/);
  assert.doesNotMatch(runtime,/Play product film/);
});


test('Daily Hours reuses its canonical renderer inside the shared project dialog',()=>{
  const runtime=fs.readFileSync('public/site/assets/js/app.js','utf8');
  const workRuntime=fs.readFileSync('public/site/assets/js/work.js','utf8');
  assert.match(runtime,/function renderCaseStudyPopup\(projectId\)/);
  assert.match(runtime,/window\.CASE_STUDY_PRESENTATIONS\?\.\[entry\?\.presentationContract\]/);
  assert.match(runtime,/CASE_STUDY_CONTENT\?\.\[projectId\]/);
  assert.match(runtime,/CASE_STUDY_ASSETS\?\.\[projectId\]/);
  assert.match(runtime,/CASE_STUDY_MOTION\?\.\[projectId\]/);
  assert.match(runtime,/legacyDialogContent\.hidden=active/);
  assert.match(runtime,/body\.classList\.remove\('csv2-active'\)/);
  assert.match(workRuntime,/id !== 'daily-hours'/);
  assert.match(workRuntime,/link\.dataset\.project = id/);
});
