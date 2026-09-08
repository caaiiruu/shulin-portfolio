import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
const app=fs.readFileSync(new URL('../public/site/assets/js/app.js',import.meta.url),'utf8');
const content=JSON.parse(fs.readFileSync(new URL('../public/site/content/portfolio-content.json',import.meta.url)));
const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/search-resolution-baseline.json',import.meta.url)));
function runtime(source,content,lang){
 const adapters=source.slice(source.indexOf('  function pair('),source.indexOf("  document.querySelector('[data-project-route-summary]')"));
 const localization=source.slice(source.indexOf('  const normalizePublicCopy='),source.indexOf('  const ui='));
 const search=source.slice(source.indexOf('    const normalize=value=>'),source.indexOf('    const SEARCH_RESULT_PROJECT_PROJECTIONS='));
 const sandbox={content,lang,URLSearchParams,window:{location:{hostname:'localhost',search:''}}};
 return vm.runInNewContext(`${adapters}\nconst DATA=adaptContent(content);\n${localization}\n${search}\n({searchEntities,normalize,normalizeQuery:typeof normalizeSearchQuery==='undefined'?normalize:normalizeSearchQuery,matchingIntentIds,shortcuts:SEARCH_RECOMMENDED_QUERIES,DATA})`,sandbox);
}

const en=runtime(app,content,'en'),zh=runtime(app,content,'zh');
const summary=rows=>Array.from(rows,x=>({id:x.key,score:x.score,intents:Array.from(x.matchedIntentIds)}));
const labels=['0→1 Product Design','Payment Experience','Operational Workflows','Internal Tools','Exception Handling','Onboarding Flows','Cross-Market Products','Product Strategy'];
const top=['payment','payment','dbs','dbs','dbs','cathay-sit-online-account-opening','dbs','booking-taxi-pickup-service-strategy'];
test('all eight approved shortcut labels and their order are retained',()=>assert.deepEqual(Array.from(en.shortcuts,x=>x.label.en),labels));
for(const [i,item] of en.shortcuts.entries())test(`shortcut ${item.label.en} resolves canonically with EN/ZH parity`,()=>{
 const a=en.searchEntities(item.query.en),b=zh.searchEntities(item.query.zh);
 assert.ok(a.some(r=>r.type==='project'&&content.projects[r.key]));
 assert.equal(a[0].key,top[i]);
 for(const result of a){assert.ok(en.DATA.projects[result.key]||en.DATA.experiments[result.key],result.key);assert.ok(result.score>0);assert.ok(result.reasons.length>0);}
 assert.deepEqual(summary(b).map(({id,intents})=>({id,intents})),summary(a).map(({id,intents})=>({id,intents})));
 assert.ok(b.every(result=>result.score>0&&result.reasons.length>0));
 assert.deepEqual(summary(a),baseline.shortcuts[item.query.en]);
 assert.equal(zh.normalizeQuery(item.query.zh),en.normalizeQuery(item.query.en));
});
test('unmatched input remains empty and exact aliases do not broaden free text',()=>{
 for(const r of [en,zh]){assert.equal(r.searchEntities('qzx-unmatched-987').length,0);assert.equal(r.searchEntities('').length,0);assert.equal(r.normalizeQuery('unrelated 支付 request'),r.normalize('unrelated 支付 request'));}
});
test('shortcut matches cannot come from a fallback when canonical entities are absent',()=>{
 const empty=runtime(app,{...content,projects:{},experiments:{},sideProjects:{}},'en');
 for(const item of empty.shortcuts)assert.equal(empty.searchEntities(item.query.en).length,0);
});
test('existing manual free-text rankings and scores remain unchanged in both languages',()=>{
 for(const lang of ['en','zh'])for(const [query,expected] of Object.entries(baseline.manual[lang]))assert.deepEqual(summary(runtime(app,content,lang).searchEntities(query)),expected,`${lang}: ${query}`);
});
