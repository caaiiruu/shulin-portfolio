(function(){
'use strict';
const DATA=window.PORTFOLIO_DATA;
const lang=()=>window.getPortfolioLanguage?window.getPortfolioLanguage():'en';
const localize=value=>Array.isArray(value)?value[lang()==='zh'?1:0]:value;
const result=document.getElementById('matcherResult');
const resultContent=document.getElementById('matcherResultContent');
const noResult=document.getElementById('matcherNoResult');
const workspace=document.getElementById('matcherWorkspace');
const status=document.getElementById('matcherStatus');
const queryPanel=document.querySelector('.matcher-query-panel');
const matcherInput=document.getElementById('matcherInput');
if(!workspace)return;
let mode='idle';
let match='exception';
let lastQuery='';
let loadingTimer=0;
let pendingResultFocus=false;
const MATCHER_STATE_KEY='portfolioMatcherState_v70';
// A page load always starts in the default, centred state. Search state persists
// only while this document is open; a prior visit must never pre-populate results.
try{sessionStorage.removeItem(MATCHER_STATE_KEY)}catch(error){}
function setMatcherState(state,retainResult=false){
 mode=state;
 workspace?.setAttribute('data-matcher-state',state);
 const hasResult=['matched','no-match'].includes(state)||(state==='loading'&&retainResult);
 workspace?.classList.toggle('has-result',hasResult);
 result?.setAttribute('aria-hidden',String(!hasResult));
}
queryPanel?.addEventListener('focusin',()=>workspace?.classList.add('is-search-focused'));
queryPanel?.addEventListener('focusout',event=>{
 if(!queryPanel.contains(event.relatedTarget))workspace?.classList.remove('is-search-focused');
});

function safeText(node,text){if(node)node.textContent=text??''}
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node}
function animateShift(before){
 if(!before||!queryPanel||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 requestAnimationFrame(()=>{const after=queryPanel.getBoundingClientRect();queryPanel.animate([{transform:`translate(${before.left-after.left}px,${before.top-after.top}px)`},{transform:'translate(0,0)'}],{duration:360,easing:'cubic-bezier(.16,1,.3,1)'});result?.animate([{opacity:0,transform:'translateX(22px)'},{opacity:1,transform:'translateX(0)'}],{duration:360,easing:'cubic-bezier(.16,1,.3,1)'})});
}
function projectBrand(key){
 const map={voucher:'Incentive ecosystem',dbs:'DBS',booking:'Booking.com',hours:'Independent product',bandzo:'Bandzo'};
 return map[key]||'Project';
}
function projectVisualLabels(key){
 const map={
  voucher:['Discovery','Rules','Redemption'],
  dbs:['Case','Shared state','Decision'],
  booking:['Constraint','Readiness','Launch'],
  hours:['Effort','Revision','Closure'],
  bandzo:['Lesson','Practice','Progress']
 };
 return map[key]||['Input','Model','Outcome'];
}
function createProjectVisual(key){
 const visual=element('div','related-project-card__visual-v45');
 visual.setAttribute('aria-hidden','true');
 const brand=element('span','related-project-card__brand-v45',projectBrand(key));
 const flow=element('div','related-project-card__flow-v45');
 projectVisualLabels(key).forEach((label,index)=>{
  if(index)flow.append(element('i',''));
  flow.append(element('b',index===1?'is-core':'',label));
 });
 visual.append(brand,flow);return visual;
}
function createProjectCard(key,variant){
 const p=DATA.projects[key];
 const card=element('button',`related-project-card related-project-card--${variant} related-project-card-v45`);
 card.type='button';card.dataset.project=key;
 card.setAttribute('aria-label',`${lang()==='zh'?'開啟專案':'Open project'}: ${localize([p.transformation,p.transformation_zh])}`);
 const top=element('div','related-project-card__top-v45');
 top.append(element('span','related-project-card__context',localize([p.context,p.context_zh])));
 const title=element('h5','related-project-card__title',localize([p.transformation,p.transformation_zh]));
 const meta=element('dl','related-project-card__meta-v45');
 const rows=variant==='search'
  ?[[lang()==='zh'?'相關性':'Relevance',localize([p.search_relevance,p.search_relevance_zh])]]
  :variant==='domain'
   ?[[lang()==='zh'?'此案例證明':'What this proves',localize([p.domain_proof,p.domain_proof_zh])]]
   :[[lang()==='zh'?'方向':'Direction',localize([p.search_relevance,p.search_relevance_zh])]];
 rows.forEach(([label,value])=>{const row=element('div');row.append(element('dt','',label),element('dd','',value));meta.append(row)});
 const action=element('span','related-project-card__action',lang()==='zh'?'查看案例 ↗':'View case ↗');
 if(variant!=='search')card.append(createProjectVisual(key));
 card.append(top,title,meta,action);return card;
}
function renderProjectRail(node,keys,variant){if(!node)return;node.classList.toggle('is-single',keys.length===1);node.dataset.cardVariant=variant;node.replaceChildren(...keys.map(k=>createProjectCard(k,variant)));window.refreshHorizontalRails?.()}

function focusMatcherResult(){
 if(!pendingResultFocus)return;
 pendingResultFocus=false;
 const target=mode==='matched'?document.querySelector('.match-query-context-v45'):document.getElementById('noMatchProjectsTitle');
 if(!target)return;
 if(mode==='matched')target.id='matchResultAnnouncement';
 target.tabIndex=-1;
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 window.setTimeout(()=>{
   const header=document.querySelector('.site-header')?.getBoundingClientRect().height||0;
   const top=Math.max(0,workspace.getBoundingClientRect().top+window.scrollY-header-24);
   window.scrollTo({top,behavior:reduce?'auto':'smooth'});
   target.focus({preventScroll:true});
 },reduce?0:380);
}
function setWorkspace(nextMode,before){setMatcherState(nextMode);if(resultContent)resultContent.hidden=nextMode!=='matched';if(noResult)noResult.hidden=nextMode!=='no-match';animateShift(before);focusMatcherResult();try{sessionStorage.setItem(MATCHER_STATE_KEY,JSON.stringify({state:mode,match,query:lastQuery}))}catch(error){}}
function renderMatch(before){
 const data=DATA.matcher[match];
 safeText(document.getElementById('matchTitle'),localize(data.title));safeText(document.getElementById('matchExplain'),localize(data.explain));safeText(document.getElementById('matchWhy'),localize(data.why));
 const caps=document.getElementById('matchCaps');caps?.replaceChildren(...data.caps.map(v=>element('span','',v)));
 renderProjectRail(document.getElementById('matchProjectRail'),data.projects,'search');
 document.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.match===match)));
 safeText(document.getElementById('matchQueryLabel'),lastQuery||localize(data.query||[match,match]));
 setWorkspace('matched',before);safeText(status,lang()==='zh'?'已更新搜尋結果。':'Search results updated.');
}
function renderNoMatch(before){
 safeText(document.getElementById('noMatchQuery'),lastQuery);
 renderProjectRail(document.getElementById('noMatchProjectRail'),['voucher','dbs','booking'],'no-match');
 document.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed','false'));
 setWorkspace('no-match',before);safeText(status,lang()==='zh'?'沒有完全相符的公開案例，已提供其他瀏覽方向。':'No exact public case found. Other paths are available.');
}
function load(next,query){
 pendingResultFocus=true;
 document.dispatchEvent(new CustomEvent('portfolio:loading-start',{detail:{label:lang()==='zh'?'正在比對…':'Matching…'}}));
 window.clearTimeout(loadingTimer);const keep=['matched','no-match'].includes(mode);const before=keep?null:queryPanel?.getBoundingClientRect();setMatcherState('loading',keep);workspace?.classList.add('is-updating');
 safeText(status,lang()==='zh'?'正在比對相關經驗…':'Matching relevant experience…');
 loadingTimer=window.setTimeout(()=>{workspace?.classList.remove('is-updating');if(next){match=next;renderMatch(before)}else{lastQuery=query||lastQuery;renderNoMatch(before)}document.dispatchEvent(new CustomEvent('portfolio:loading-ready'))},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:220);
}
function normalizeSearchQuery(query){
 const q=String(query||'').toLowerCase().normalize('NFKC').replace(/[’']/g,"'").replace(/[\\/|,.;:!?()[\]{}]/g,' ').replace(/\s+/g,' ').trim();
 return {q,tokens:q.split(' ').filter(Boolean)};
}
const SEARCH_PROFILES=[
 {key:'zero',phrases:['0 to 1','zero to one','new product','early stage','analogous behaviour','analogous behavior','behaviour pattern','behavior pattern','從零到一','新產品','相似行為','行為邏輯'],terms:{'0→1':8,'prototype':4,'hypothesis':4,'analogy':5,'analogous':5,'behaviour':3,'behavior':3,'motivation':3,'iteration':3,'validation':3,'原型':4,'假設':4,'動機':3,'迭代':3,'驗證':3}},
 {key:'exception',phrases:['exception workflow','risk review','case review','negative scenario','failure recovery','例外流程','風險審查','負面情境','失敗復原'],terms:{'exception':6,'risk':5,'review':3,'escalation':5,'ownership':4,'case':3,'recovery':4,'error':3,'例外':6,'風險':5,'審查':3,'升級':5,'責任':4,'案件':3,'復原':4,'錯誤':3}},
 {key:'voucher',phrases:['incentive system','voucher ecosystem','promotion campaign','reward program','獎勵系統','票券生態','促銷活動'],terms:{'voucher':6,'reward':5,'incentive':6,'promotion':4,'campaign':4,'redemption':5,'eligibility':5,'票券':6,'獎勵':5,'促銷':4,'活動':3,'兌換':5,'資格':5}},
 {key:'global',phrases:['global rollout','market readiness','multi country','cross country','全球上線','市場準備度','跨國'],terms:{'global':6,'country':4,'countries':4,'market':3,'localisation':5,'localization':5,'travel':3,'booking':5,'launch':4,'全球':6,'國家':4,'市場':3,'在地化':5,'旅遊':3,'上線':4}},
 {key:'learning',phrases:['learning journey','guided practice','music learning','piano learning','學習旅程','引導練習','音樂學習','鋼琴學習'],terms:{'learning':6,'lesson':4,'practice':6,'feedback':5,'progress':4,'piano':6,'music':5,'education':4,'學習':6,'課程':4,'練習':6,'回饋':5,'進度':4,'鋼琴':6,'音樂':5,'教育':4}},
 {key:'systems',phrases:['disconnected tools','internal workflow','operating model','fragmented workflow','工具斷裂','內部流程','營運模型','分散流程'],terms:{'tool':4,'system':4,'disconnect':5,'fragmented':5,'workflow':4,'operations':4,'internal':3,'handoff':3,'系統':4,'工具':4,'分散':5,'流程':4,'營運':4,'內部':3,'交接':3}}
];
function scoreProfile(profile,q,tokens){
 let score=0;
 profile.phrases.forEach(phrase=>{if(q.includes(phrase))score+=10});
 Object.entries(profile.terms).forEach(([term,weight])=>{
   if(tokens.includes(term))score+=weight;
   else if(term.length>=3&&q.includes(term))score+=Math.max(1,weight*.55);
 });
 return score;
}
function resolveQuery(query){
 const {q,tokens}=normalizeSearchQuery(query);
 if(!q)return null;
 const ranked=SEARCH_PROFILES.map(profile=>({key:profile.key,score:scoreProfile(profile,q,tokens)})).sort((a,b)=>b.score-a.score);
 return ranked[0].score>=4?ranked[0].key:null;
}
document.querySelectorAll('.chip').forEach(chip=>chip.addEventListener('click',()=>{
 const input=document.getElementById('matcherInput');
 const query=lang()==='zh'?chip.dataset.queryZh:chip.dataset.queryEn;
 if(input)input.value=query;
 lastQuery=query;
 load(chip.dataset.match,query);
}));
document.getElementById('matcherForm')?.addEventListener('submit',event=>{event.preventDefault();const input=document.getElementById('matcherInput');const query=input.value.trim().slice(0,120);if(!query){safeText(status,lang()==='zh'?'請輸入問題或選擇建議。':'Enter a problem or choose a suggestion.');return}lastQuery=query;load(resolveQuery(query),query)});

const stage=document.getElementById('domainStage');
let domain='finance';


// v56: floating domain navigation is reserved for compact viewports.
const domainSection=document.getElementById('domains');
const domainChipRail=document.getElementById('domainChipRail');
const domainFloatingNav=document.getElementById('domainFloatingNav');
const domainFloatingChips=[...(domainFloatingNav?.querySelectorAll('[data-domain-floating]')||[])];
const desktopDomainMedia=window.matchMedia('(max-width: 900px)');
let domainFloatFrame=0;
function syncFloatingDomain(key){
 domainFloatingChips.forEach(chip=>chip.setAttribute('aria-pressed',String(chip.dataset.domainFloating===key)));
 const selected=domainFloatingChips.find(chip=>chip.dataset.domainFloating===key);
 if(selected&&domainFloatingNav?.classList.contains('is-visible'))selected.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest',inline:'center'});
}
function updateDomainFloatingNav(){
 domainFloatFrame=0;
 if(!domainSection||!domainFloatingNav||!desktopDomainMedia.matches){
  domainFloatingNav?.classList.remove('is-visible');
  domainFloatingNav?.setAttribute('aria-hidden','true');
  domainSection?.classList.remove('has-floating-domain-nav');
  return;
 }
 const rect=domainSection.getBoundingClientRect();
 const railRect=domainChipRail?.getBoundingClientRect();
 const header=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h'))||72;
 const within=rect.top<header&&rect.bottom>window.innerHeight-90;
 const railHasPassed=Boolean(railRect&&railRect.bottom<=header+8);
 const show=within&&railHasPassed;
 domainFloatingNav.classList.toggle('is-visible',show);
 domainFloatingNav.setAttribute('aria-hidden',String(!show));
 domainSection.classList.toggle('has-floating-domain-nav',show);
}
function scheduleDomainFloatingNav(){if(!domainFloatFrame)domainFloatFrame=requestAnimationFrame(updateDomainFloatingNav)}

const mobileDomainSelect=document.getElementById('domainMobileSelect');
if(mobileDomainSelect)mobileDomainSelect.value='finance';

function renderDomain(shouldScroll=false){
 const data=DATA.domains[domain]||DATA.domains.finance;
 const mobileSelect=document.getElementById('domainMobileSelect');
 if(mobileSelect)mobileSelect.value=domain;
 safeText(document.getElementById('domainName'),localize(data.name));
 safeText(document.getElementById('domainSynthesis'),localize(data.synthesis));

 const art=document.getElementById('domainArt');
 art?.replaceChildren();
 localize(data.nodes).forEach((label,index)=>{
   if(index)art.append(element('span','flow-line'));
   art.append(element('div',index===1?'flow-node flow-node--dark':'flow-node',label));
 });

 const problems=document.getElementById('domainProblems');
 problems?.replaceChildren(...localize(data.problems).map(v=>element('li','',v)));
 const solutions=document.getElementById('domainSolutions');
 solutions?.replaceChildren(...localize(data.solutions).map(v=>element('li','',v)));
 renderProjectRail(document.getElementById('relatedProjects'),data.projects,'domain');

 document.querySelectorAll('.domain-tab').forEach(tab=>{const selected=tab.dataset.domain===domain;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected){stage?.setAttribute('aria-labelledby',tab.id);if(window.matchMedia('(max-width: 871px)').matches){tab.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest',inline:'center'})}}});

 if(shouldScroll && stage){
   requestAnimationFrame(()=>stage.scrollIntoView({
     behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',
     block:'start'
   }));
 }
}
function selectDomain(next){
 if(!next||next===domain)return;
 document.dispatchEvent(new CustomEvent('portfolio:loading-start',{detail:{label:lang()==='zh'?'正在切換…':'Switching…'}}));
 domain=next;
 syncFloatingDomain(domain);
 stage?.classList.add('is-changing');
 window.setTimeout(()=>{
   renderDomain(true);
   requestAnimationFrame(()=>{stage?.classList.remove('is-changing');stage?.focus({preventScroll:true});document.dispatchEvent(new CustomEvent('portfolio:loading-ready'))});
 },window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:120);
}
document.querySelectorAll('.domain-tab').forEach(tab=>
 tab.addEventListener('click',()=>selectDomain(tab.dataset.domain))
);
document.getElementById('domainMobileSelect')?.addEventListener('change',event=>
 selectDomain(event.target.value)
);

document.querySelectorAll('.domain-tab').forEach(tab=>{
 tab.addEventListener('keydown',event=>{
   const tabs=[...document.querySelectorAll('.domain-tab')];
   const current=tabs.indexOf(event.currentTarget);
   let next=current;
   if(['ArrowRight','ArrowDown'].includes(event.key))next=(current+1)%tabs.length;
   else if(['ArrowLeft','ArrowUp'].includes(event.key))next=(current-1+tabs.length)%tabs.length;
   else if(event.key==='Home')next=0;
   else if(event.key==='End')next=tabs.length-1;
   else return;
   event.preventDefault();tabs[next].focus();selectDomain(tabs[next].dataset.domain);
 });
});

document.addEventListener('portfolio:language',()=>{
 if(mode==='matched')renderMatch(null);
 else if(mode==='no-match')renderNoMatch(null);
 renderDomain(false);
});
if(mode==='matched')renderMatch(null);
else if(mode==='no-match')renderNoMatch(null);
else{
 setMatcherState('idle');
 document.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed','false'));
}
if(matcherInput&&lastQuery)matcherInput.value=lastQuery;
renderDomain(false);

domainFloatingChips.forEach(chip=>chip.addEventListener('click',()=>{
 const original=document.querySelector(`.domain-tab[data-domain="${chip.dataset.domainFloating}"]`);
 original?.click();
 syncFloatingDomain(chip.dataset.domainFloating);
}));
window.addEventListener('scroll',scheduleDomainFloatingNav,{passive:true});
window.addEventListener('resize',scheduleDomainFloatingNav,{passive:true});
desktopDomainMedia.addEventListener?.('change',scheduleDomainFloatingNav);
syncFloatingDomain(domain);
updateDomainFloatingNav();

})();
