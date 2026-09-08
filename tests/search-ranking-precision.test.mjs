import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const app = fs.readFileSync(new URL("../public/site/assets/js/app.js", import.meta.url), "utf8");

test("ranking keeps project intent relevance distinct from domain membership", () => {
  assert.match(app, /intentIds:\[\.\.\.new Set\(list\(searchIndex\.intentIds\)\)\]/);
  assert.match(app, /featuredDomainIds:matchedDomains\.filter/);
  assert.match(app, /supportingDomainIds:matchedDomains\.filter/);
  assert.doesNotMatch(app, /intentIds:\[\.\.\.new Set\(\[\.\.\.list\(searchIndex\.intentIds\),\.\.\.matchedDomains\.flatMap/);
});

test("intent classification is one-way and does not activate a longer alias from one generic word", () => {
  assert.match(app, /intentCandidates\(intent\)\.some\(candidate=>identityMatches\(query,candidate\)\)/);
  assert.match(app, /query\.includes\(' '\)&&!needle\.includes\(' '\)&&query!==needle/);
  assert.match(app, /'design-payment-experience':\['payments','payment success','transaction system'\]/);
});

test("ranking uses explicit intent, domain and portfolio ordering before incidental source order", () => {
  assert.match(app, /const SEARCH_INTENT_PROJECT_ORDER=\{/);
  assert.match(app, /intentRank:intentMatches\.length/);
  assert.match(app, /domainRank:matchedDomains\.length/);
  assert.match(app, /portfolioRank:Math\.max\(0,searchPortfolioOrder\.indexOf\(key\)\)/);
  assert.match(app, /b\.score-a\.score\|\|a\.intentRank-b\.intentRank\|\|b\.matchCount-a\.matchCount\|\|a\.domainRank-b\.domainRank\|\|a\.portfolioRank-b\.portfolioRank/);
  assert.match(app, /!intentIds\.length\|\|result\.matchedIntentIds\.length\|\|result\.score>=Number\(DATA\.search\.contract\.weights\?\.problemTag\|\|75\)/);
});

test("certification cross-checks have explicit deterministic query owners", () => {
  for (const contract of [
    "'case-management':['case management']",
    "'retail-checkout':['checkout','self checkout','improve checkout conversion']",
    "'refund-operations':['refund']",
    "'payment-performance':['payment success']",
    "'reduce-expansion-risk':['reduce launch risk']",
    "'scale-across-markets':['scale','cross-market'",
    "'launch-zero-to-one-product':['0→1 product'",
    "'financial-services':['fintech']",
    "'travel-platforms':['mobility']",
    "'growth-incentive-systems':['incentives']",
  ]) assert.ok(app.includes(contract), contract);
});

test("local Top-5 certification mode cannot alter production result count", () => {
  assert.match(app, /\['localhost','127\.0\.0\.1'\]\.includes\(window\.location\.hostname\).*qa-search-ranking/);
  assert.match(app, /ranked\.slice\(0,qaRankingMatrix\?5:4\)/);
});

test("capability shortcuts reuse certified query phrases without changing ranking contracts", () => {
  for (const query of [
    "query:{en:'0→1 product'",
    "query:{en:'payment'",
    "query:{en:'operational workflow'",
    "query:{en:'internal tools'",
    "query:{en:'onboarding'",
    "query:{en:'cross-market'",
    "query:{en:'exception handling'",
    "query:{en:'product strategy'",
  ]) assert.ok(app.includes(query), query);
});
