(function(){
'use strict';
const DATA=window.PORTFOLIO_DATA;
const ASSETS=window.PORTFOLIO_ASSET_MANIFEST?.items||{};
const lang=()=>window.getPortfolioLanguage?window.getPortfolioLanguage():'en';
const localize=value=>{
 if(Array.isArray(value))return value[lang()==='zh'?1:0];
 if(value&&typeof value==='object'&&('en' in value||'zh' in value))return lang()==='zh'?(value.zh??''):(value.en??'');
 return value;
};
const ui=key=>localize(DATA.localizationRegistry?.runtimeUiLabels?.[key]);
const result=document.getElementById('matcherResult');
const resultContent=document.getElementById('matcherResultContent');
const noResult=document.getElementById('matcherNoResult');
const workspace=document.getElementById('matcherWorkspace');
const status=document.getElementById('matcherStatus');
const queryPanel=document.querySelector('.matcher-query-panel');
const matcherInput=document.getElementById('matcherInput');
const suggestions=document.getElementById('matcherSuggestions');
if(!workspace)return;
let mode='idle';
let match='exception';
let lastQuery='';
let loadingTimer=0;
let pendingResultFocus=false;
// Every page load starts in the default, centred state. Search state lives only
// in this document and never leaves stale recruiter results in browser storage.
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
function projectTitle(project){return localize(project?.cardTitle||project?.title)||''}
function projectSummary(project){return localize(project?.at_a_glance_pair)||''}
function animateShift(before){
 if(!before||!queryPanel||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 requestAnimationFrame(()=>{const after=queryPanel.getBoundingClientRect();queryPanel.animate([{transform:`translate(${before.left-after.left}px,${before.top-after.top}px)`},{transform:'translate(0,0)'}],{duration:360,easing:'cubic-bezier(.16,1,.3,1)'});result?.animate([{opacity:0,transform:'translateX(22px)'},{opacity:1,transform:'translateX(0)'}],{duration:360,easing:'cubic-bezier(.16,1,.3,1)'})});
}
function projectBrand(key){
 const project=DATA.projects[key];
 return localize(project?.company)||'';
}
function projectContext(key){
 const project=DATA.projects[key];
 return localize(project?.domain_label)||'';
}
function projectVisualLabels(key){
 const map={
  voucher:['Discovery','Rules','Redemption'],
  dbs:['Case','Shared state','Decision'],
  booking:['Constraint','Readiness','Launch'],
  payment:['Discovery','Transaction states','Operations'],
  bandzo:['Lesson','Practice','Progress']
 };
 return map[key]||['Input','Model','Outcome'];
}
function createProjectVisual(key){
 const visual=element('div','related-project-card__visual-v45');
 const preferredAssetId=key==='voucher'?'voucher-offer-stage-discover-pdp-shipped-01':DATA.projects[key]?.heroVisualBrief?.assetId;
 const record=ASSETS[preferredAssetId];
 const isReal=record?.assetStatus==='production'&&record?.implementationStatus==='real-active';
 const fallback=ASSETS[record?.placeholderFallbackAssetId];
 const src=isReal?(record.productionUrl||record.publicPath):fallback?.publicPath;
 if(src){
  const image=element('img','related-project-card__image-v148');
  image.src=src;image.loading='lazy';image.decoding='async';
  image.alt=isReal?(lang()==='zh'?(record.alt_zh||record.alt||''):(record.alt||'')):(lang()==='zh'?'專案視覺素材待補。':'Project visual pending.');
  image.dataset.assetStatus=isReal?'real-active':'placeholder-active';
  visual.dataset.assetStatus=image.dataset.assetStatus;
  visual.append(image);return visual;
 }
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
 if(!p)throw new Error(`Integration Conflict: unresolved project ID "${key}"`);
 const card=element('button',`related-project-card related-project-card--${variant} related-project-card-v45`);
 card.type='button';card.dataset.project=key;
 card.setAttribute('aria-label',`${ui("open-project-9dcdb86a")}: ${projectTitle(p)}`);
 const top=element('div','related-project-card__top-v45');
 top.append(element('strong','related-project-card__company-v135',projectBrand(key)));
 const context=projectContext(key);
 if(context)top.append(element('span','related-project-card__context',context));
 const title=element('h5','related-project-card__title',projectTitle(p));
 const meta=element('dl','related-project-card__meta-v45');
 const rows=variant==='search'
  ?[
    [ui("why-it-fits-3421d244"),localize(p.search_relevance_pair)||projectSummary(p)],
    [ui("evidence-1111eae0"),localize([p.card_outcome,p.card_outcome_zh])]
   ]
  :variant==='domain'
   ?[[ui("what-this-proves-bfb1a5d4"),localize([p.domain_proof,p.domain_proof_zh])||projectSummary(p)]]
   :[[ui("direction-b41b4458"),localize(p.search_relevance_pair)||projectSummary(p)]];
 rows.forEach(([label,value])=>{const row=element('div');row.append(element('dt','',label),element('dd','',value));meta.append(row)});
 const action=element('span','related-project-card__action',ui("view-case-ca67a135"));
 if(variant==='search'){
  const intro=element('div','related-project-card__intro-v81');
  intro.append(top,title);
  card.append(intro,meta,action);
 }else{
  card.append(createProjectVisual(key),top,title,meta,action);
 }
 return card;
}
function createInitiativeCard(parentKey,key){
 const item=DATA.projects[parentKey]?.initiatives?.[key];
 if(!item)return null;
 const card=element('button','related-project-card related-project-card--search related-project-card-v45 related-initiative-card-v103');
 card.type='button';card.dataset.initiative=key;card.dataset.parentProject=parentKey;
 card.setAttribute('aria-label',`${ui("open-initiative-a5308e77")}: ${lang()==='zh'?item.title_zh:item.title}`);
 const top=element('div','related-project-card__top-v45');
 top.append(element('span','related-project-card__context',`${ui("voucher-offer-ecosystem-99a84b06")} · ${item.period}`));
 const title=element('h5','related-project-card__title',lang()==='zh'?item.title_zh:item.title);
 const meta=element('dl','related-project-card__meta-v45');
 [[ui("why-it-fits-3421d244"),lang()==='zh'?item.strategy_zh:item.strategy],[ui("problem-types-dd6fa301"),(lang()==='zh'?item.problem_types_zh:item.problem_types).join(' · ')]].forEach(([label,value])=>{const row=element('div');row.append(element('dt','',label),element('dd','',value));meta.append(row)});
 card.append(top,title,meta,element('span','related-project-card__action',ui("open-initiative-4403ec27")));
 return card;
}
function renderProjectRail(node,keys,variant,initiativeKeys=[]){if(!node)return;const cards=keys.map(k=>createProjectCard(k,variant));initiativeKeys.forEach(([parent,key])=>{const card=createInitiativeCard(parent,key);if(card)cards.push(card)});node.classList.toggle('is-single',cards.length===1);node.dataset.cardVariant=variant;node.replaceChildren(...cards);if(node.matches('[data-rail]'))window.refreshHorizontalRails?.()}

function createExplorationCard(key){
 const item=DATA.experiments?.[key]||DATA.sideProjects?.[key];
 if(!item)throw new Error(`Integration Conflict: unresolved exploration ID "${key}"`);
 const card=element('button','related-project-card related-project-card--domain related-project-card-v45');
 card.type='button';card.dataset.experiment=key;
 card.setAttribute('aria-label',`${ui("open-exploration-33b85a78")}: ${projectTitle(item)}`);
 const top=element('div','related-project-card__top-v45');
 top.append(element('strong','related-project-card__company-v135',ui("exploration-34bf5b09")));
 const meta=element('dl','related-project-card__meta-v45');
 const row=element('div');
 row.append(element('dt','',ui("direction-b41b4458")),element('dd','',localize(item.summary||item.description)||''));
 meta.append(row);
 card.append(top,element('h5','related-project-card__title',projectTitle(item)),meta,element('span','related-project-card__action',ui("view-exploration-9f45033c")));
 return card;
}

function focusMatcherResult(){
 if(!pendingResultFocus)return;
 pendingResultFocus=false;
 const target=mode==='matched'?resultContent:noResult;
 if(!target)return;
 target.tabIndex=-1;
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
   target.focus({preventScroll:true});
   target.scrollIntoView({block:'start',behavior:'auto'});
   requestAnimationFrame(()=>{
    const headerBottom=document.querySelector('.site-header')?.getBoundingClientRect().bottom||0;
    const compact=window.matchMedia('(max-width: 900px)').matches;
    const stickyBottom=compact?(queryPanel?.getBoundingClientRect().bottom||headerBottom):headerBottom;
    const spacing=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--space-5'))||24;
    const desiredTop=Math.max(headerBottom,stickyBottom)+spacing;
    const correction=target.getBoundingClientRect().top-desiredTop;
    window.scrollBy({top:correction,behavior:'auto'});
   });
 }));
}
function setWorkspace(nextMode,before){setMatcherState(nextMode);if(resultContent)resultContent.hidden=nextMode!=='matched';if(noResult)noResult.hidden=nextMode!=='no-match';animateShift(before);focusMatcherResult()}
function renderMatch(before){
 const data=DATA.matcher[match];
 safeText(document.getElementById('matchTitle'),localize(data.title));safeText(document.getElementById('matchExplain'),localize(data.explain));safeText(document.getElementById('matchWhy'),localize(data.why));
 const caps=document.getElementById('matchCaps');caps?.replaceChildren(...data.caps.map(v=>element('span','',localize(v))));
 renderProjectRail(document.getElementById('matchProjectRail'),data.projects,'search',match==='voucher'?[['voucher','brand-challenges']]:[]);
 document.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.match===match)));
 safeText(document.getElementById('matchQueryLabel'),lastQuery||localize(data.query||[match,match]));
 setWorkspace('matched',before);safeText(status,ui("search-results-updated-63052d26"));
}
function renderNoMatch(before){
 safeText(document.getElementById('noMatchQuery'),lastQuery);
 renderProjectRail(document.getElementById('noMatchProjectRail'),['voucher','dbs','booking'],'no-match');
 document.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed','false'));
 setWorkspace('no-match',before);safeText(status,ui("no-exact-public-case-found-other-paths-are-36305cc3"));
}
function load(next,query){
 pendingResultFocus=true;
 document.dispatchEvent(new CustomEvent('portfolio:loading-start',{detail:{label:ui("matching-df19c337")}}));
 window.clearTimeout(loadingTimer);const keep=['matched','no-match'].includes(mode);const before=keep?null:queryPanel?.getBoundingClientRect();setMatcherState('loading',keep);workspace?.classList.add('is-updating');
 safeText(status,ui("matching-relevant-experience-dc260d80"));
 loadingTimer=window.setTimeout(()=>{workspace?.classList.remove('is-updating');if(next){match=next;renderMatch(before)}else{lastQuery=query||lastQuery;renderNoMatch(before)}document.dispatchEvent(new CustomEvent('portfolio:loading-ready'))},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:220);
}
function normalizeSearchQuery(query){
 const q=String(query||'').toLowerCase().normalize('NFKC').replace(/[’']/g,"'").replace(/[\\/|,.;:!?()[\]{}]/g,' ').replace(/\s+/g,' ').trim();
 return {q,tokens:q.split(' ').filter(Boolean)};
}
const SEARCH_PROFILES=(DATA.search?.profiles||[]).map(profile=>({...profile,key:profile.id}));
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
 return ranked[0].score>=(DATA.search?.minimumScore??4)?ranked[0].key:null;
}
function bindSuggestion(chip){
 chip.addEventListener('click',()=>{
  const input=document.getElementById('matcherInput');
  const query=lang()==='zh'?chip.dataset.queryZh:chip.dataset.queryEn;
  if(input)input.value=query;
  lastQuery=query;
  load(chip.dataset.match,query);
 });
}
function loadSuggestions(){
 if(!suggestions)return;
 try{
  const chips=(DATA.search?.suggestions||[]).map(item=>{
   const chip=element('button','chip',lang()==='zh'?item.label.zh:item.label.en);
   chip.type='button';
   chip.dataset.pressable='';
   chip.dataset.match=item.id;
   chip.dataset.en=item.label.en;
   chip.dataset.zh=item.label.zh;
   chip.dataset.queryEn=item.query.en;
   chip.dataset.queryZh=item.query.zh;
   chip.setAttribute('aria-pressed','false');
   bindSuggestion(chip);
   return chip;
  });
  suggestions.replaceChildren(...chips);
 }catch(error){
  suggestions.hidden=true;
  safeText(status,ui("suggestions-are-temporarily-unavailable-yo-b3a409b3"));
  console.error(error);
 }
}
loadSuggestions();
document.getElementById('matcherForm')?.addEventListener('submit',event=>{event.preventDefault();const input=document.getElementById('matcherInput');const query=input.value.trim().slice(0,120);if(!query){safeText(status,ui("enter-a-problem-or-choose-a-suggestion-78d28d06"));return}lastQuery=query;load(resolveQuery(query),query)});

const stage=document.getElementById('domainStage');
const domainSource=[...(DATA.contentDiscovery?.domains||[])].sort((a,b)=>(a.order||0)-(b.order||0));
if(document.getElementById('domains')&&!domainSource.length)throw new Error('Integration Conflict: contentDiscovery.domains is empty');
for(const item of domainSource){
 for(const key of [...(item.featuredProjectIds||[]),...(item.supportingProjectIds||[])]){
  if(!DATA.projects?.[key])throw new Error(`Integration Conflict: domain "${item.id}" references missing project "${key}"`);
 }
 for(const key of item.supportingExplorationIds||[]){
  if(!DATA.experiments?.[key]&&!DATA.sideProjects?.[key])throw new Error(`Integration Conflict: domain "${item.id}" references missing exploration "${key}"`);
 }
}
let domain=domainSource[0]?.id||'';


// v56: floating domain navigation is reserved for compact viewports.
const domainSection=document.getElementById('domains');
const domainChipRail=document.getElementById('domainChipRail');
const domainFloatingNav=document.getElementById('domainFloatingNav');
let domainFloatingChips=[];
const compactDomainMedia=window.matchMedia('(max-width: 900px)');
let domainFloatFrame=0;
function scrollToDomainStart(event){
 if(!domainSection)return;
 event?.preventDefault();
 const headerBottom=document.querySelector('.site-header')?.getBoundingClientRect().bottom||0;
 const sectionContent=domainSection.querySelector('.domain-layout')||domainSection;
 const contentTop=sectionContent.getBoundingClientRect().top+window.scrollY;
 const anchorGap=parseFloat(getComputedStyle(domainSection).getPropertyValue('--domain-anchor-gap'))||0;
 const targetTop=Math.max(0,contentTop-headerBottom-anchorGap);
 window.scrollTo({
  top:targetTop,
  behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'
 });
 if(window.location.hash!=='#domains')history.pushState(null,'','#domains');
}
document.querySelectorAll('a[href="#domains"]').forEach(link=>
 link.addEventListener('click',scrollToDomainStart)
);
function syncFloatingDomain(key){
 domainFloatingChips.forEach(chip=>chip.setAttribute('aria-pressed',String(chip.dataset.domainFloating===key)));
 const selected=domainFloatingChips.find(chip=>chip.dataset.domainFloating===key);
 const rail=selected?.parentElement;
 if(selected&&rail&&domainFloatingNav?.classList.contains('is-visible')){
  const inset=parseFloat(getComputedStyle(rail).paddingInlineStart)||0;
  const ideal=selected.offsetLeft-((rail.clientWidth-selected.offsetWidth)/2);
  const max=Math.max(0,rail.scrollWidth-rail.clientWidth);
  const target=Math.min(max,Math.max(0,ideal-inset));
  rail.scrollTo({left:target,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 }
}
function updateDomainFloatingNav(){
 domainFloatFrame=0;
 if(!domainSection||!domainFloatingNav||!compactDomainMedia.matches){
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

function mountDomainSelectors(){
 const rail=document.getElementById('domainChipRail');
 const floatingRail=domainFloatingNav?.querySelector('.domain-floating-nav-v52__rail');
 if(!rail)return;
 const tabs=domainSource.map((item,index)=>{
  const tab=element('button','domain-tab domain-tab-v38');
  tab.type='button';tab.id=`domain-tab-${item.id}`;tab.dataset.domain=item.id;tab.dataset.pressable='';
  tab.setAttribute('role','tab');tab.setAttribute('aria-controls','domainStage');
  tab.setAttribute('aria-selected',String(index===0));tab.tabIndex=index===0?0:-1;
  const copy=element('span','domain-tab__copy');
  copy.append(element('strong','',localize(item.label)));
  tab.append(element('span','domain-tab__number',String(index+1).padStart(2,'0')),copy);
  return tab;
 });
 rail.replaceChildren(...tabs);
 if(floatingRail){
  const chips=domainSource.map((item,index)=>{
   const chip=element('button','domain-floating-chip-v52',localize(item.label));
   chip.type='button';chip.dataset.domainFloating=item.id;
   chip.setAttribute('aria-pressed',String(index===0));
   return chip;
  });
  floatingRail.replaceChildren(...chips);
  domainFloatingChips=chips;
 }
 const title=document.querySelector('.domain-statement');
 const section=DATA.contentDiscovery?.section;
 if(title&&section?.title){
  title.dataset.en=section.title.en||'';
  title.dataset.zh=section.title.zh||section.title.en||'';
  safeText(title,localize(section.title));
 }
}
mountDomainSelectors();

function renderDomain(shouldReanchor=false){
 const data=domainSource.find(item=>item.id===domain)||domainSource[0];
 if(!data)return;
 safeText(document.getElementById('domainName'),localize(data.label));
 safeText(document.getElementById('domainSynthesis'),localize(data.summary));

 const domainLabels=DATA.contentDiscovery?.domainDetailLabels||{};
 const problems=document.getElementById('domainProblems');
 problems?.replaceChildren(...(localize(data.commonProblemPatterns)||[]).map(v=>element('li','',v)));
 const problemHeading=problems?.closest('.domain-panel-v30')?.querySelector('h4');
 if(problemHeading)safeText(problemHeading,localize(domainLabels.commonProblemPatterns)|| (ui("common-problem-patterns-a13be30e")));
 const solutions=document.getElementById('domainSolutions');
 solutions?.replaceChildren(...(localize(data.howITypicallyAddressThem)||[]).map(v=>element('li','',v)));
 const solutionHeading=solutions?.closest('.domain-panel-v30')?.querySelector('h4');
 if(solutionHeading)safeText(solutionHeading,localize(domainLabels.howITypicallyAddressThem)|| (ui("how-i-typically-address-them-b8d9f07d")));
 const related=document.getElementById('relatedProjects');
 const cards=[
  ...(data.featuredProjectIds||[]).map(key=>createProjectCard(key,'domain')),
  ...(data.supportingProjectIds||[]).map(key=>createProjectCard(key,'domain')),
  ...(data.supportingExplorationIds||[]).map(createExplorationCard)
 ];
 related?.replaceChildren(...cards);
 window.refreshHorizontalRails?.();
 const projectPanel=related?.closest('.domain-panel-v30--projects');
 if(projectPanel){
  projectPanel.hidden=cards.length===0;
  const heading=projectPanel.querySelector('h4');
  if(heading)safeText(heading,ui("related-work-9e3ba8e3"));
 }

 document.querySelectorAll('.domain-tab').forEach(tab=>{const selected=tab.dataset.domain===domain;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected){stage?.setAttribute('aria-labelledby',tab.id);if(compactDomainMedia.matches){tab.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest',inline:'center'})}}});

 if(shouldReanchor){
   requestAnimationFrame(()=>scrollToDomainStart());
 }
}

function mountDesignPrinciples(){
 const root=document.querySelector('[data-principle-constellation]');
 const items=[...(DATA.designPrinciples?.items||[])].sort((a,b)=>a.order-b.order);
 const labels=DATA.designPrinciples?.labels||{};
 if(!root||!items.length)return;
 let activeId=root.dataset.activePrinciple||'';
 const reduceMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;

 const createPanel=(item,panelId,triggerId)=>{
  const panel=element('div','principle-node__panel');
  panel.id=panelId;
  panel.setAttribute('role','region');
  panel.setAttribute('aria-labelledby',triggerId);
  const how=element('section','principle-node__how');
  how.append(element('span','principle-node__label',localize(labels.howIWork)),element('p','',localize(item.expanded.howIWork)));
  const diagram=element('ol','principle-node__diagram');
  (localize(item.diagramLabels)||[]).forEach(label=>diagram.append(element('li','',label)));
  diagram.setAttribute('aria-label',localize(labels.diagram));
  const practice=element('section','principle-node__practice');
  practice.append(element('span','principle-node__label',localize(labels.practice)),element('strong','',localize(item.expanded.practice.companyProduct)),element('p','',localize(item.expanded.practice.summary)));
  const projectId=item.expanded.practice.projectId;
  if(projectId&&DATA.projects?.[projectId]){
    const cta=element('button','text-cta principle-node__case-cta',ui("view-case-a62dd0ad"));
    cta.type='button';cta.dataset.project=projectId;cta.dataset.pressable='';
    cta.appendChild(element('span','icon-arrow icon-arrow--right'));
    practice.appendChild(cta);
  }
  panel.append(how,diagram,practice);
  return panel;
 };

 const render=()=>{
  const compact=window.matchMedia('(max-width: 700px)').matches;
  const wide=window.matchMedia('(min-width: 901px)').matches;
  root.dataset.activePrinciple=activeId;
  root.classList.toggle('has-active',Boolean(activeId));
  const cards=items.map((item,index)=>{
   const expanded=item.id===activeId;
   const panelId=`principle-panel-${item.id}`;
   const triggerId=`principle-trigger-${item.id}`;
   const article=element('article',`principle-node principle-node--${index+1}`);
   article.dataset.principleId=item.id;
   if(expanded)article.classList.add('is-active');
   const trigger=element('button','principle-node__trigger');
   trigger.type='button';
   trigger.id=triggerId;
   trigger.dataset.pressable='';
   trigger.setAttribute('aria-expanded',String(expanded));
   trigger.setAttribute('aria-controls',panelId);
   trigger.append(element('span','principle-node__number',String(item.order).padStart(2,'0')),element('span','principle-node__title',localize(item.collapsed.title)),element('span','principle-node__value',localize(item.collapsed.value)),element('span','principle-node__toggle',expanded?'−':'+'));
   trigger.addEventListener('click',()=>changeActive(expanded?'':item.id,expanded?'':item.id));
   trigger.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&activeId){event.preventDefault();changeActive('',item.id)}
   });
   article.append(trigger);
   if(expanded&&(compact||wide))article.append(createPanel(item,panelId,triggerId));
   return article;
  });
  const activeItem=items.find(item=>item.id===activeId);
  const desktopPanel=activeItem&&!compact&&!wide?createPanel(activeItem,`principle-panel-${activeItem.id}`,`principle-trigger-${activeItem.id}`):null;
  if(desktopPanel)desktopPanel.classList.add('principle-constellation__detail');
  root.replaceChildren(...cards,...(desktopPanel?[desktopPanel]:[]));
 };
 const changeActive=(nextId,focusId)=>{
  activeId=nextId;
  const update=()=>render();
  const transition=!reduceMotion()&&document.startViewTransition?document.startViewTransition(update):null;
  if(!transition)update();
  (transition?.finished||Promise.resolve()).then(()=>{
   if(focusId)document.getElementById(`principle-trigger-${focusId}`)?.focus({preventScroll:true});
  });
 };
 render();
 document.addEventListener('portfolio:language',render);
 let layoutState=window.matchMedia('(max-width: 700px)').matches?'compact':window.matchMedia('(min-width: 901px)').matches?'wide':'medium';
 window.addEventListener('resize',()=>{
  const nextLayout=window.matchMedia('(max-width: 700px)').matches?'compact':window.matchMedia('(min-width: 901px)').matches?'wide':'medium';
  if(nextLayout!==layoutState){layoutState=nextLayout;render()}
 });
}
mountDesignPrinciples();
function selectDomain(next){
 if(!next||next===domain)return;
 document.dispatchEvent(new CustomEvent('portfolio:loading-start',{detail:{label:ui("switching-ac872a06")}}));
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
 document.querySelectorAll('.domain-tab').forEach(tab=>{
  const item=domainSource.find(entry=>entry.id===tab.dataset.domain);
  if(item){
   safeText(tab.querySelector('strong'),localize(item.label));
  }
 });
 domainFloatingChips.forEach(chip=>{
  const item=domainSource.find(entry=>entry.id===chip.dataset.domainFloating);
  if(item)safeText(chip,localize(item.label));
 });
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
compactDomainMedia.addEventListener?.('change',scheduleDomainFloatingNav);
syncFloatingDomain(domain);
updateDomainFloatingNav();

})();
