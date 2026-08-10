(function(){
  'use strict';
  function pair(value,fallback=''){
    if(value&&typeof value==='object'&&!Array.isArray(value))return [value.en??fallback,value.zh??''];
    return [value??fallback,''];
  }
  function list(value){
    if(value==null||value==='')return [];
    if(Array.isArray(value))return value;
    if(typeof value!=='object')return [value];
    if('en' in value||'zh' in value)return [value];
    return Object.values(value);
  }
  function decisionText(decision,names){
    for(const name of names){
      const value=decision?.[name];
      if(value!=null)return pair(value);
    }
    return ['',''];
  }
  function valueAtPath(root,path){
    if(!root||!path)return undefined;
    return String(path).replace(/\[(\d+)\]/g,'.$1').split('.').filter(Boolean)
      .reduce((value,key)=>value==null?undefined:value[key],root);
  }
  function adaptDecision(decision){
    const title=decisionText(decision,['title','decisionTitle']);
    const result=decisionText(decision,['whatIDecided','whatWeDecided','whatChanged','decision','result','summary']);
    const why=decisionText(decision,['whyThisChoice','why','evidence','rationale']);
    const problem=decisionText(decision,['problemOrConstraint','problem','constraint','principle']);
    const effect=decisionText(decision,['effectOrResult','resultingModel','preservedDirection','impactAndOwnership']);
    const delivery=decisionText(decision,['deliveryBoundary','claimBoundary']);
    const optionalSource=decision.optionalBlock||{};
    const optional=decisionText(decision,['tradeOffAccepted','tradeoff','tradeOff','whatThisRequired','constraintManaged','riskManaged']);
    const optionalType=optionalSource.type||
      (decision.tradeOffAccepted||decision.tradeoff||decision.tradeOff?'TRADE-OFF ACCEPTED':
        decision.whatThisRequired?'WHAT THIS REQUIRED':
          decision.constraintManaged?'CONSTRAINT MANAGED':
            decision.riskManaged?'RISK MANAGED':'');
    return {
      ...decision,
      title:title[0],title_zh:title[1],
      result:result[0],result_zh:result[1],
      evidence:why[0],evidence_zh:why[1],
      problem:problem[0],problem_zh:problem[1],
      effect:effect[0],effect_zh:effect[1],
      deliveryBoundary:delivery[0],deliveryBoundary_zh:delivery[1],
      tradeoff:optional[0],tradeoff_zh:optional[1],
      optionalBlock:{...optionalSource,type:optionalType,content:optionalSource.content||optional[0]},
      optional_block_type:optionalType
    };
  }
  function decisionList(value){
    if(!value)return [];
    if(Array.isArray(value))return value;
    if(typeof value==='object'&&(
      value.title||value.decisionTitle||value.whatIDecided||value.whatWeDecided||
      value.whyThisChoice||value.tradeOffAccepted
    ))return [value];
    return Object.values(value);
  }
  function adaptProject(id,p,raw){
    const title=pair(p.title);const atGlance=pair(p.atAGlance);const info=p.infoGrid||{};
    const infoPair=(value)=>{
      if(value&&typeof value==='object'&&!Array.isArray(value)&&('primary' in value||'secondary' in value)){
        const primary=pair(value.primary);
        const secondaryEn=list(value.secondary?.en);
        const secondaryZh=list(value.secondary?.zh);
        return [
          `Primary: ${primary[0]}${secondaryEn.length?`\nSecondary: ${secondaryEn.join(', ')}`:''}`,
          `主要：${primary[1]}${secondaryZh.length?`\n次要：${secondaryZh.join('、')}`:''}`
        ];
      }
      if(value&&typeof value==='object'&&!Array.isArray(value)&&'value' in value){
        const typeZh={
          'Internal System':'內部系統','Incentive System':'獎勵系統','Transaction System':'交易系統',
          'Marketplace Platform':'市場平台','0→1 Product':'0→1 產品'
        };
        return [value.value,typeZh[value.value]||''];
      }
      if(value&&typeof value==='object'&&!Array.isArray(value)&&value.duration)return pair(value.duration);
      return pair(value);
    };
    const type=infoPair(info.type);
    const scope=infoPair(info.scope);
    const audience=infoPair(info.audience);
    const timeline=infoPair(info.timeline);
    const why=pair(p.whyItMattered);
    const impact=pair(p.businessImpact);
    const company=typeof p.company==='string'?[p.company,p.company]:pair(p.company);
    const domain=pair(p.domain);
    const problemTypes=p.problemTypes?.en||[];const problemTypesZh=p.problemTypes?.zh||[];
    const decisions=decisionList(p.decisionNarrative?.primaryDecisions).map(item=>{
      const decision=adaptDecision(item);
      const evidence=p.decisionEvidenceMap?.[decision.id];
      return {...decision,evidenceAssetId:evidence?.publicAssetId||null};
    });
    const gallery=id==='payment'?[
      {assetId:'payment-evidence-sco-entry-public-v2',title:['Self-checkout entry','自助結帳入口'],text:['Responsive evidence with a reserved aspect ratio and deferred loading.','保留固定比例並延後載入的 Responsive evidence。'],src:'/site/assets/validation/payment/validation-payment-sco-entry-final-r77.jpg',alt:['The self-checkout loyalty and discount screen with a FairPrice app payment entry.','Self-checkout 會員與折扣畫面中的 FairPrice App 支付入口。']},
      {assetId:'payment-evidence-operational-recovery-public-v2',title:['Operational transaction review','營運交易檢視'],text:['A representative internal payment-operations view.','代表性的內部 Payment operations 畫面。'],src:'/site/assets/validation/payment/validation-payment-internal-portal-list-r77.jpg',alt:['An internal payment transaction review list.','內部 Payment transaction review 清單。']},
      ...['01','02','03','04','05'].map((step,index)=>({title:[`Refund state ${index+1}`,`退款狀態 ${index+1}`],text:['A deferred-loading state from the cross-channel refund flow.','跨通路退款流程中延後載入的狀態畫面。'],src:`/site/assets/validation/payment/validation-payment-refund-state-${step}-r77.jpg`,alt:[`Refund flow state ${index+1}.`,`退款流程狀態 ${index+1}。`]})),
      {title:['Payment receipt','付款收據'],text:['Supporting customer communication loaded only with this evidence section.','僅在此證據區塊載入的顧客溝通畫面。'],src:'/site/assets/validation/payment/validation-payment-receipt-email-mobile-r77.jpg',alt:['Mobile payment receipt email.','Mobile 付款收據 Email。']},
      {title:['Refund receipt','退款收據'],text:['Supporting refund communication loaded only with this evidence section.','僅在此證據區塊載入的退款溝通畫面。'],src:'/site/assets/validation/payment/validation-payment-refund-email-mobile-r77.jpg',alt:['Mobile refund receipt email.','Mobile 退款收據 Email。']},
      {assetId:'payment-video-core-app-pos-public-v1',title:['Order-details interaction','訂單詳情互動'],text:['Poster-first video; media mounts only on demand.','Poster-first 影片；媒體僅在需要時掛載。'],poster:'/site/assets/validation/payment/validation-payment-video-order-details-poster-r77.png',video:'/site/assets/validation/payment/validation-payment-video-order-details-r77.mov',alt:['Order details interaction preview.','Order details 互動預覽。']}
    ]:[[title[0],atGlance[0],title[1],atGlance[1]]];
    const status=String(p.status||p.publicStatus||p.contentStatus||'');
    const confidentiality=pair(
      p.confidentialityNote||
      p.publicContent?.confidentialityNote||
      p.confidentiality?.metricDisclosurePolicy?.confidentialityNote||
      ''
    );
    const rawValueIBrought=p.valueIBrought||p.publicContent?.myContribution?.summary||p.publicContent?.contribution?.summary||p.ownershipModel?.publicSummary;
    const valueIBrought=rawValueIBrought&&typeof rawValueIBrought==='object'&&('en' in rawValueIBrought||'zh' in rawValueIBrought)
      ? {headline:rawValueIBrought}
      : rawValueIBrought;
    const ownership=p.ownershipModel||p.roleAndOwnership||p.roleAndCollaboration||p.ownership||{};
    const ownedWork=ownership.ledByMe||ownership.ownedWork||ownership.directOwnership||ownership.ownership||ownership.systemOwnership||p.publicContent?.myContribution?.owned||p.publicContent?.contribution?.owned||[];
    const partneredWork=ownership.coDecided||ownership.teamPartners||ownership.collaboration||ownership.teamBoundary||ownership.teamAndStakeholderBoundary||p.publicContent?.myContribution?.shared||p.publicContent?.contribution?.shared||[];
    const leadershipWork=ownership.partnerOwned||ownership.designLeadership||ownership.teamOrSystemInfluence||p.publicContent?.myContribution?.designLeadership||p.publicContent?.contribution?.designLeadership||[];
    const programmeContent=p.publicContent||{};
    const interactiveFlows=list(raw?.projectInteractiveFlowRefs?.[id]).map(ref=>{
      const flow=raw?.interactiveFlowRegistry?.[ref];
      if(!flow)return null;
      return {
        ...flow,
        evidence:list(flow.evidenceRefs).map(path=>valueAtPath(raw,path)).filter(Boolean)
      };
    }).filter(Boolean);
    const journeyStages=list(programmeContent.journeyChapters).map(stage=>({
      ...stage,
      label:stage.label,
      transformation:stage.title,
      stage_label:stage.label,
      direction:stage.direction,
      signal:stage.representativeShippedSignal,
      status:stage.status
    }));
    const initiativeMap=journeyStages.map((stage,index)=>({
      id:stage.id,
      primary_stage:index+1,
      title:stage.signal,
      problem:stage.problem,
      capability:stage.direction,
      status:stage.status
    }));
    return {
      ...p,project_id:id,valueIBrought,company,domain,title_pair:title,
      problem_type_pairs:problemTypes.map((item,index)=>[pair(item)[0],pair(problemTypesZh[index])[0]]),
      at_a_glance_pair:atGlance,
      type_pair:type,scope_pair:scope,audience_pair:audience,timeline_pair:timeline,why_pair:why,impact_pair:impact,
      decisions,gallery,status,
      ownership_model:p.ownershipModel||null,
      outcome_evidence_model:p.outcomeEvidenceModel||[],
      impact_evidence:p.impactEvidence||null,
      what_this_proves:pair(p.whatThisProves),
      search_relevance_pair:pair(p.searchRelevance||p.searchRelevancePair||p.atAGlance),
      search_evidence_pair:pair(p.whatThisProves),
      delivery_highlights:p.deliveryHighlights||null,
      hero_visual_brief:p.heroVisualBrief||raw?.heroVisualSystem?.projects?.[id]||null,
      key_intervention_map:p.keyInterventionMap||null,
      hard:list(p.whatMadeThisHard||[]),
      confidentiality_note:confidentiality[0],confidentiality_note_zh:confidentiality[1],
      section_order:p.sectionOrder,
      led:list(ownedWork).map(item=>pair(item)[0]),
      led_zh:list(ownedWork).map(item=>pair(item)[1]),
      contributed:list(partneredWork).map(item=>pair(item)[0]),
      contributed_zh:list(partneredWork).map(item=>pair(item)[1]),
      leadership:list(leadershipWork).map(item=>pair(item)[0]),
      leadership_zh:list(leadershipWork).map(item=>pair(item)[1]),
      project_model:p.project_model||(p.projectModel?.renderVariant==='programme-case-with-stage-evidence'?'programme-case-with-child-evidence':p.projectModel?.renderVariant),
      journey_stages:p.journey_stages||journeyStages,
      initiative_map:p.initiative_map||initiativeMap,
      interactive_flows:interactiveFlows,
      recruiter:{team:['',''],delivery:[status,status],metric:['',''],reflection:['',''],cross:[]},
      search_relevance_pair:atGlance,
      searchIndexV2:p.searchIndexV2||{}
    };
  }
  function adaptExploration(id,item){
    const title=pair(item.title||item.name||id);
    const indexedQuestions=item.searchIndexV2?.queryExamples||{};
    const question=pair(item.question||item.problem||item.purpose||{
      en:list(indexedQuestions.en)[0]||'',
      zh:list(indexedQuestions.zh)[0]||list(indexedQuestions.en)[0]||''
    });
    const summary=pair(item.summary||item.description||item.outcome);
    const deliverables=list(item.deliverables);
    const prototype=pair(item.prototype||item.whatIBuilt||item.output||(deliverables.length?deliverables.join(' · '):''));
    const learning=pair(item.learning||item.currentLearning||item.reflection);
    const next=pair(item.next||item.nextStep||item.futureDirection);
    return {...item,title,question,summary,prototype,learning,next,category:pair(item.category||item.explorationType||item.type||'Exploration'),timeline:pair(item.timeline||item.period),status:pair(item.status||item.contentStatus),gallery:[[[title[0],title[1]],summary]]};
  }
  function adaptContent(raw){
    const domains=list(raw.contentDiscovery?.domains);
    const projects=Object.fromEntries(Object.entries(raw.projects||{}).map(([id,p])=>{
      const project=adaptProject(id,p,raw);
      const matchedDomains=domains.filter(domain=>[
        ...list(domain.featuredProjectIds),...list(domain.supportingProjectIds)
      ].includes(id));
      const searchIndex=project.searchIndexV2||{};
      project.searchIndexV2={
        ...searchIndex,
        canonicalId:id,
        domainIds:[...new Set([...list(searchIndex.domainIds),...matchedDomains.map(domain=>domain.id)])],
        intentIds:[...new Set([...list(searchIndex.intentIds),...matchedDomains.flatMap(domain=>list(domain.queryIntents))])],
        problemTags:searchIndex.problemTags||p.problemTypes,
        capabilityTags:searchIndex.capabilityTags||{en:[],zh:[]},
        systemTags:searchIndex.systemTags||{en:[],zh:[]},
        audienceTags:searchIndex.audienceTags||{en:[],zh:[]},
        outcomeTags:searchIndex.outcomeTags||{en:[],zh:[]}
      };
      return [id,project];
    }));
    const explorations=Object.fromEntries(Object.entries({...(raw.experiments||{}),...(raw.sideProjects||{})})
      .filter(([,item])=>!String(item.contentStatus||'').includes('standalone-card-review')));
    const intentCatalog=list(raw.contentDiscovery?.queryIntentCatalog);
    const searchContract=raw.contentDiscovery?.searchMatchingContract||{};
    return {
      ...raw,
      projects,
      experiments:Object.fromEntries(Object.entries(explorations).map(([id,p])=>[id,adaptExploration(id,p)])),
      search:{
        intentCatalog,
        contract:searchContract,
        suggestions:intentCatalog.map(intent=>({id:intent.id,label:pair(intent.label),query:pair(intent.label)})),
        fallbackProjectIds:Object.keys(projects).slice(0,4)
      }
    };
  }
  document.querySelector('[data-project-route-summary]')?.remove();
  const DATA=adaptContent(window.PORTFOLIO_DATA||{});
  window.PORTFOLIO_RUNTIME_DATA=DATA;
  window.adaptPortfolioProject=(id)=>DATA.projects?.[id]||null;
  const ASSET_MANIFEST=window.PORTFOLIO_ASSET_MANIFEST?.items||{};
  function resolveProjectAsset(assetId){
    if(!assetId)return null;
    const record=ASSET_MANIFEST[assetId];
    if(!record)throw new Error(`Asset governance: unknown runtime asset ${assetId}`);
    if(record.assetStatus==='production'&&record.implementationStatus==='real-active'){
      const src=record.productionUrl||record.publicPath;
      if(!src||!src.startsWith('/site/'))throw new Error(`Asset governance: invalid public production path for ${assetId}`);
      return {assetId,src,status:'production',isPlaceholder:false,isVideo:/video/i.test(record.type||''),alt:[record.alt||'',record.alt_zh||'']};
    }
    if(record.assetStatus==='awaiting-user-asset'&&record.placeholderFallbackAssetId){
      const fallback=ASSET_MANIFEST[record.placeholderFallbackAssetId];
      if(!fallback?.publicPath?.startsWith('/site/'))throw new Error(`Asset governance: invalid placeholder fallback for ${assetId}`);
      return {assetId,src:fallback.publicPath,status:'placeholder-active',isPlaceholder:true,isVideo:/video/i.test(record.type||''),alt:['Project visual pending.','專案視覺素材待補。']};
    }
    throw new Error(`Asset governance: public runtime asset has no real file or placeholder: ${assetId}`);
  }
  window.resolveProjectAsset=resolveProjectAsset;
  function canonicalProjectId(projectId){
    const alias=DATA.projectAliasRegistry?.[projectId];
    return alias?.routePolicy==='permanent-redirect'&&DATA.projects[alias.canonicalProjectId]
      ?alias.canonicalProjectId
      :projectId;
  }
  function projectIdFromPath(pathname=window.location.pathname){
    const match=String(pathname).match(/^\/site\/work\/([^/]+)\/?$/);
    if(!match)return null;
    try{return decodeURIComponent(match[1])}catch{return match[1]}
  }
  function canonicalProjectUrl(projectId,url=new URL(window.location.href)){
    url.pathname=`/site/work/${encodeURIComponent(canonicalProjectId(projectId))}`;
    url.searchParams.delete('case');
    return url;
  }
  function workIndexUrl(url=new URL(window.location.href)){
    url.pathname='/site/work.html';
    url.searchParams.delete('case');
    url.searchParams.delete('initiative');
    url.searchParams.delete('stage');
    return url;
  }
  const doc=document;
  const body=doc.body;
  const root=doc.documentElement;
  let lang='en';
  let currentInvoker=null;
  let rootInvoker=null;
  let currentDetail=null;
  let galleryIndex=0;
  let initiativeGallery=[];
  const detailStack=[];
  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const precisePointer=window.matchMedia('(pointer: fine)');
  const arrowDirections={
    '↓':'down','→':'right','↑':'up','←':'left',
    '↗':'up-right','↘':'down-right','↙':'down-left','↖':'up-left'
  };

  const normalizePublicCopy=(value)=>{
    if(value==null)return value;
    if(Array.isArray(value))return value.map(normalizePublicCopy);
    if(typeof value==='object')return value;
    let text=String(value);
    if(lang!=='zh')return text;
    const genericZhTerms=[
      [/\bmonitoring\b/gi,'監控'],[/\bhandling\b/gi,'處理'],[/\bactors?\b/gi,'參與角色'],[/\bneeds?\b/gi,'需求'],
      [/\bProduct\b/g,'產品'],[/\bEngineering\b/g,'工程'],[/\bOperations\b/g,'營運'],[/\bBusiness\b/g,'商務'],
      [/\bResearch\b/g,'研究'],[/\bData\b/g,'數據'],[/\bSponsors?\b/g,'贊助單位'],[/\bCampaign operations\b/gi,'活動營運'],
      [/\bPhase planning\b/gi,'階段規劃'],[/\bGamification\b/gi,'遊戲化'],[/\bResponsive evidence\b/gi,'響應式設計證據'],
      [/\bPayment operations\b/gi,'付款營運'],[/\btransaction review\b/gi,'交易檢視'],[/\bOrder details\b/gi,'訂單詳情'],
      [/\bEmail\b/gi,'電子郵件'],[/\bMobile\b/gi,'行動版'],[/\bfailure\b/gi,'失敗狀態'],[/\bbadge\b/gi,'標記'],
      [/\bAdd to cart\b/gi,'加入購物車'],[/\brelevance\b/gi,'相關性']
    ];
    genericZhTerms.forEach(([pattern,replacement])=>{text=text.replace(pattern,replacement)});
    return text
      .normalize('NFC')
      // Only remove accidental horizontal spacing. Newlines are semantic
      // content owned by the SSOT (for example Audience primary/secondary)
      // and must survive localisation unchanged.
      .replace(/([\u3400-\u9fff])[\t ]+(?=[\u3400-\u9fff])/g,'$1')
      .replace(/[\t ]+([，。；：！？、])/g,'$1')
      .replace(/([（「『])[\t ]+/g,'$1')
      .replace(/[\t ]+([）」』])/g,'$1')
      .replace(/(^|[\s，。；：！？、])s(?=$|[\s，。；：！？、])/gi,'$1')
      .replace(/我的角色/g,'擔任角色')
      .replace(/我的主導與協作/g,'決策責任')
      .replace(/我的責任邊界/g,'決策責任邊界')
      .replace(/我的責任/g,'決策責任')
      .replace(/我的決策/g,'決策內容')
      .replace(/我的貢獻/g,'核心貢獻')
      .replace(/我的做法/g,'工作方法')
      .replace(/我的學習/g,'關鍵學習')
      .replace(/探索我的領域經驗/g,'探索領域經驗')
      .trim();
  };
  const localize=(value)=>{
    if(Array.isArray(value))return normalizePublicCopy(value[lang==='zh'?1:0]);
    if(value&&typeof value==='object'&&('en' in value||'zh' in value))return normalizePublicCopy(lang==='zh'?(value.zh??''):(value.en??''));
    return normalizePublicCopy(value);
  };
  const ui=(key)=>localize(DATA.localizationRegistry?.runtimeUiLabels?.[key]);
  const detailLabel=(key)=>localize(DATA.localizationRegistry?.projectSectionLabels?.[key]);
  const staticCopy=(key)=>localize(DATA.localizationRegistry?.staticPageCopy?.[key]);
  function safeText(node,value){
    if(!node)return;
    const resolved=localize(value);
    const text=resolved&&typeof resolved==='object'
      ?[...new Set(publicSectionRows(resolved).map(item=>item.trim()).filter(Boolean))].join(' · ')
      :resolved;
    node.textContent=text==null?'':String(text);
  }
  function clear(node){while(node&&node.firstChild)node.removeChild(node.firstChild)}
  function decorateArrow(node){
    if(!node||node.children?.length||node.querySelector?.('.icon-arrow'))return;
    const raw=node.textContent||'';
    const match=raw.match(/\s*([↓→↑←↗↘↙↖])\s*$/);
    if(!match)return;
    const direction=arrowDirections[match[1]];
    const label=raw.slice(0,match.index).trimEnd();
    node.textContent=label;
    const icon=doc.createElement('span');
    icon.className=`icon-arrow icon-arrow--${direction}`;
    icon.setAttribute('aria-hidden','true');
    node.appendChild(icon);
  }
  const arrowTargets='a,button,[class*="action"],[class*="Action"],.hero__cta-icon';
  function decorateDocumentArrows(){doc.querySelectorAll(arrowTargets).forEach(decorateArrow)}
  function element(tag,className,text){const node=doc.createElement(tag);if(className)node.className=className;if(text!==undefined){safeText(node,text);decorateArrow(node)}return node}
  function appendList(node,items){clear(node);(items||[]).forEach(item=>node.appendChild(element('li','',item)))}

  try{lang=localStorage.getItem('portfolioLang')||'en'}catch{lang='en'}
  function renderLimitedRichText(node,raw){
    clear(node);
    let target=node;
    String(raw||'').split(/(<br>|<em>|<\/em>)/).forEach(token=>{
      if(token==='<br>'){target.appendChild(doc.createElement('br'));return}
      if(token==='<em>'){const emphasis=doc.createElement('em');target.appendChild(emphasis);target=emphasis;return}
      if(token==='</em>'){target=node;return}
      if(token)target.appendChild(doc.createTextNode(token));
    });
  }
  function applyLanguage(next){
    const scrollX=window.scrollX;
    const scrollY=window.scrollY;
    lang=next==='zh'?'zh':'en';root.lang=lang;
    try{localStorage.setItem('portfolioLang',lang)}catch{}
    doc.querySelectorAll('[data-copy-key]').forEach(node=>{
      safeText(node,staticCopy(node.dataset.copyKey));
      if(node.hasAttribute('data-career-context-only'))safeText(node,node.textContent.split(' · ').at(-1).trim());
      decorateArrow(node);
    });
    doc.querySelectorAll('[data-copy-html-key]').forEach(node=>renderLimitedRichText(node,staticCopy(node.dataset.copyHtmlKey)));
    doc.querySelectorAll('[data-aria-key]').forEach(node=>node.setAttribute('aria-label',staticCopy(node.dataset.ariaKey)));
    doc.querySelectorAll('[data-lang-toggle]').forEach(node=>{
      clear(node);
      const en=element('span','lang-toggle__option','EN');
      const zh=element('span','lang-toggle__option','中文');
      en.setAttribute('aria-current',String(lang==='en'));
      zh.setAttribute('aria-current',String(lang==='zh'));
      node.append(en,zh);
      node.setAttribute('aria-label',ui(lang==='en'?'switch-language-current-english':'switch-language-current-chinese'));
    });
    if(currentDetail)renderDetail();
    const routeProjectKey=canonicalProjectId(decodeURIComponent(new URL(window.location.href).pathname.split('/').filter(Boolean).at(-1)||''));
    const visibleProjectKey=currentDetail?.type==='project'?currentDetail.key:routeProjectKey;
    if(DATA.projects[visibleProjectKey])requestAnimationFrame(()=>requestAnimationFrame(()=>refreshVisibleOutcomeProjection(DATA.projects[visibleProjectKey])));
    decorateDocumentArrows();
    doc.dispatchEvent(new CustomEvent('portfolio:language',{detail:{lang}}));
    requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo({left:scrollX,top:scrollY,behavior:'auto'})));
  }
  doc.querySelectorAll('[data-lang-toggle]').forEach(button=>button.addEventListener('click',()=>applyLanguage(lang==='en'?'zh':'en')));
  applyLanguage(lang);
  const arrowObserver=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
    if(!(node instanceof Element))return;
    if(node.matches(arrowTargets))decorateArrow(node);
    node.querySelectorAll?.(arrowTargets).forEach(decorateArrow);
  })));
  arrowObserver.observe(doc.body,{childList:true,subtree:true});
  window.getPortfolioLanguage=()=>lang;

  const menu=doc.getElementById('mobileMenu');
  const menuToggle=doc.querySelector('.menu-toggle');
  const mobileMenuMedia=window.matchMedia('(max-width: 900px)');
  const heroHeader=doc.querySelector('.site-header--hero');
  let headerScrollFrame=0;
  function syncHeroHeader(){
    headerScrollFrame=0;
    if(!heroHeader)return;
    const isScrolled=window.scrollY>2;
    heroHeader.classList.toggle('is-scrolled',isScrolled);
    heroHeader.dataset.scrollState=isScrolled?'scrolled':'top';
  }
  function scheduleHeroHeaderSync(){
    if(headerScrollFrame)return;
    headerScrollFrame=window.requestAnimationFrame(syncHeroHeader);
  }
  syncHeroHeader();
  window.addEventListener('scroll',scheduleHeroHeaderSync,{passive:true});
  const currentPath=new URL(window.location.href).pathname;
  menu?.querySelectorAll('a').forEach(link=>{
    const isCurrent=new URL(link.href,window.location.href).pathname===currentPath;
    if(isCurrent)link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  function updateMenuLabel(open){
    if(!menuToggle)return;
    const isZh=doc.documentElement.lang==='zh-Hant';
    menuToggle.setAttribute('aria-label',isZh?(open?'關閉選單':'開啟選單'):(open?'Close menu':'Open menu'));
  }
  function setMenu(open,{restoreFocus=false,moveFocus=false}={}){
    if(!menu||!menuToggle)return;
    menu.classList.toggle('is-open',open);menuToggle.setAttribute('aria-expanded',String(open));body.classList.toggle('is-locked',open);
    updateMenuLabel(open);
    if(open&&moveFocus)requestAnimationFrame(()=>menu.querySelector('a,button')?.focus());
    if(!open&&restoreFocus)menuToggle.focus();
    cursor.hide();
  }
  updateMenuLabel(false);
  doc.addEventListener('portfolio:language',()=>updateMenuLabel(menu?.classList.contains('is-open')));
  menuToggle?.addEventListener('click',()=>setMenu(!menu.classList.contains('is-open'),{moveFocus:!menu.classList.contains('is-open')}));
  menu?.addEventListener('click',event=>{if(event.target.closest('a'))setMenu(false)});
  doc.addEventListener('click',event=>{if(menu?.classList.contains('is-open')&&!event.target.closest('.site-header'))setMenu(false)});
  doc.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&menu?.classList.contains('is-open'))setMenu(false,{restoreFocus:true});
  });
  mobileMenuMedia.addEventListener('change',event=>{if(!event.matches)setMenu(false)});

  // Global search is owned by site chrome so it is available from every route.
  // The homepage matcher remains as a no-JS fallback and is hidden only after
  // this fully operable dialog has been mounted.
  function mountGlobalSearch(){
    const headerInner=doc.querySelector('.header-inner');
    if(!headerInner||!DATA?.search||doc.getElementById('globalSearchDialog'))return;
    const trigger=element('button','header-search-v114');
    trigger.type='button';
    trigger.dataset.pressable='';
    trigger.setAttribute('aria-haspopup','dialog');
    trigger.setAttribute('aria-controls','globalSearchDialog');
    trigger.setAttribute('aria-expanded','false');
    trigger.append(element('span','header-search-v114__icon'),element('span','header-search-v114__label',ui("search-8fb22e8f")));
    headerInner.insertBefore(trigger,menuToggle||null);

    const searchDialog=element('dialog','global-search-v114');
    searchDialog.id='globalSearchDialog';
    searchDialog.setAttribute('aria-labelledby','globalSearchTitle');
    const shell=element('div','global-search-v114__shell');
    const close=element('button','global-search-v114__close modal-close');
    close.type='button';
    close.setAttribute('aria-label',ui("close-site-search-376ce6d7"));
    close.append(element('span','modal-close__icon'));
    const title=element('h2','',ui("what-are-you-trying-to-solve-27f7ebed"));
    title.id='globalSearchTitle';
    const intro=element('p','global-search-v114__intro',ui("search-by-company-domain-product-problem-o-405a6756"));
    const form=element('form','global-search-v114__form');
    const label=element('label','sr-only',ui("product-challenge-8a385573"));
    label.htmlFor='globalSearchInput';
    const input=element('input','global-search-v114__input');
    input.id='globalSearchInput';input.type='search';input.maxLength=120;input.autocomplete='off';
    input.dataset.focusManaged='true';
    input.placeholder=ui("try-a-company-domain-or-product-problem-3a452b87");
    const clearSearch=element('button','global-search-v114__clear');
    clearSearch.type='button';
    clearSearch.hidden=true;
    clearSearch.setAttribute('aria-label',ui("clear-search-20cb7d1c"));
    clearSearch.append(element('span','global-search-v114__clear-icon'));
    const submit=element('button','button button--dark global-search-v114__submit',ui("search-8fb22e8f"));
    submit.type='submit';
    form.append(label,input,clearSearch,submit);
    const suggestions=element('div','global-search-v114__suggestions');
    suggestions.setAttribute('aria-label',ui("suggested-problems-221529dc"));
    const status=element('div','sr-only');status.setAttribute('aria-live','polite');
    const results=element('section','global-search-v114__results');
    results.hidden=true;results.tabIndex=-1;
    shell.append(close,title,intro,form,suggestions,status,results);
    searchDialog.append(shell);
    doc.body.append(searchDialog);
    body.classList.add('has-global-search');

    const normalize=value=>String(value||'')
      .toLocaleLowerCase()
      .normalize('NFKC')
      .replace(/[\u2010-\u2015/／_,.:;!?()[\]{}]+/g,' ')
      .replace(/\s+/g,' ')
      .trim();
    const allLocalizedList=value=>[...list(value?.en),...list(value?.zh)].filter(Boolean);
    const phraseMatches=(query,value)=>{
      const needle=normalize(value);
      if(!needle)return false;
      return query.includes(needle)||needle.includes(query);
    };
    const matchingIntentIds=query=>DATA.search.intentCatalog.filter(intent=>{
      const candidates=[
        ...allLocalizedList(intent.aliases),
        ...allLocalizedList({en:[intent.label?.en],zh:[intent.label?.zh]})
      ];
      return candidates.some(candidate=>phraseMatches(query,candidate));
    }).map(intent=>intent.id);
    const reasonLabel=(kind,value)=>{
      const labels={
        title:['Title match','標題配對'],
        problemTags:['Problem match','問題配對'],
        intentIds:['Need match','需求配對'],
        capabilityTags:['Capability match','能力配對'],
        domainIds:['Domain match','領域配對'],
        systemOrAudienceTags:['System or audience match','系統或受眾配對'],
        outcomeTags:['Outcome match','成果配對']
      };
      return `${labels[kind][lang==='zh'?1:0]} · ${value}`;
    };
    const rankProject=(key,project,query,matchedIntentIds)=>{
      const index=project.searchIndexV2||{};
      const weights=DATA.search.contract.weights||{};
      const reasons=[];
      let score=0;
      const register=(kind,weight,values)=>{
        const matched=values.filter(value=>phraseMatches(query,value));
        if(!matched.length)return;
        score=Math.max(score,Number(weight)||0);
        matched.slice(0,2).forEach(value=>reasons.push({kind,label:reasonLabel(kind,value)}));
      };
      register('title',weights.exactTitleOrAlias||100,[
        ...project.title_pair,
        ...allLocalizedList(index.aliases)
      ]);
      const intentMatches=list(index.intentIds).filter(id=>matchedIntentIds.includes(id));
      if(intentMatches.length){
        score=Math.max(score,Number(weights.queryIntent)||85);
        intentMatches.forEach(id=>{
          const intent=DATA.search.intentCatalog.find(item=>item.id===id);
          if(intent)reasons.push({kind:'intentIds',label:reasonLabel('intentIds',localize(intent.label))});
        });
      }
      register('problemTags',Number(weights.problemTag)||75,allLocalizedList(index.problemTags));
      register('capabilityTags',Number(weights.capabilityTag)||55,allLocalizedList(index.capabilityTags));
      register('domainIds',Number(weights.primaryDomain)||65,list(index.domainIds));
      register('systemOrAudienceTags',Number(weights.systemOrAudienceTag)||35,[
        ...allLocalizedList(index.systemTags),
        ...allLocalizedList(index.audienceTags)
      ]);
      register('outcomeTags',Number(weights.outcomeTag)||25,allLocalizedList(index.outcomeTags));
      return {
        key,
        score,
        matchCount:new Set(reasons.map(reason=>reason.label)).size,
        reasons:reasons.slice(0,DATA.search.contract.resultPresentation?.maxReasons||3)
      };
    };
    const searchEntities=query=>{
      const normalized=normalize(query);
      if(!normalized)return [];
      const intentIds=matchingIntentIds(normalized);
      const projects=Object.entries(DATA.projects).map(([key,item])=>({key,type:'project',item}));
      const explorations=Object.entries(DATA.experiments).map(([key,item])=>({key,type:'experiment',item:{
        ...item,
        title_pair:item.title,
        searchIndexV2:item.searchIndexV2||{}
      }}));
      return [...projects,...explorations]
        .map(entity=>({...rankProject(entity.key,entity.item,normalized,intentIds),type:entity.type}))
        .filter(result=>result.score>0)
        .sort((a,b)=>b.score-a.score||b.matchCount-a.matchCount);
    };
    const appendProject=(container,key,reasons=[])=>{
      const project=DATA.projects[key];if(!project)return;
      const card=element('button','related-project-card related-project-card--search related-project-card-v45');
      card.type='button';card.dataset.project=key;
      const intro=element('div','related-project-card__intro-v81');
      const top=element('div','related-project-card__top-v45');
      top.append(element('strong','related-project-card__company-v135',localize(project.company)));
      if(project.domain_label)top.append(element('span','related-project-card__context',localize(project.domain_label)));
      intro.append(top,element('h5','related-project-card__title',localize(project.title_pair)));
      const meta=element('dl','related-project-card__meta-v45');
      const why=element('div');
      why.append(
        element('dt','',ui("why-it-fits-3421d244")),
        element('dd','',reasons.length?reasons.map(item=>item.label).join(' · '):localize(project.search_relevance_pair))
      );
      const evidence=element('div');
      evidence.append(
        element('dt','',ui("evidence-1111eae0")),
        element('dd','',localize(project.search_evidence_pair))
      );
      meta.append(why,evidence);
      const action=element('span','related-project-card__action');
      action.append(
        element('span','related-project-card__action-label',ui("view-case-a62dd0ad")),
        element('span','related-project-card__action-arrow','↗')
      );
      card.append(intro,meta,action);
      container.append(card);
    };
    const appendExploration=(container,key,reasons=[])=>{
      const item=DATA.experiments[key];if(!item)return;
      const card=element('button','related-project-card related-project-card--search related-project-card-v45');
      card.type='button';card.dataset.experiment=key;
      const intro=element('div','related-project-card__intro-v81');
      const top=element('div','related-project-card__top-v45');
      top.append(element('strong','related-project-card__company-v135',localize(item.category)));
      intro.append(top,element('h5','related-project-card__title',localize(item.title)));
      const meta=element('dl','related-project-card__meta-v45');
      const row=element('div');
      row.append(element('dt','',ui("why-it-fits-3421d244")),element('dd','',reasons.map(reason=>reason.label).join(' · ')));
      meta.append(row);
      const action=element('span','related-project-card__action');
      action.append(element('span','related-project-card__action-label',ui("view-experiment-8788e030")),element('span','related-project-card__action-arrow','↗'));
      card.append(intro,meta,action);container.append(card);
    };
    const renderResults=query=>{
      clear(results);
      const ranked=searchEntities(query);
      const bestIntent=matchingIntentIds(normalize(query))[0];
      const intent=DATA.search.intentCatalog.find(item=>item.id===bestIntent);
      const heading=element('div','global-search-v114__result-head');
      heading.append(
        element('span','kicker',ranked.length?(ui("most-relevant-direction-7603c296")):(ui("no-exact-match-2688ce0c"))),
        element('h3','',intent?localize(intent.label):(ranked.length?(ui("relevant-work-for-your-problem-59a01a0d")):(ui("no-matching-public-work-yet-92409723"))))
      );
      results.append(heading);
      const projects=element('div','global-search-v114__projects');
      const visible=ranked.slice(0,4);
      visible.forEach(result=>result.type==='project'?appendProject(projects,result.key,result.reasons):appendExploration(projects,result.key,result.reasons));
      if(bestIntent==='design-incentive-systems'){
        const initiative=DATA.projects.voucher?.initiatives?.['brand-challenges'];
        if(initiative){
          const card=element('button','related-project-card related-project-card--search related-project-card-v45 related-initiative-card-v103');
          card.type='button';card.dataset.initiative='brand-challenges';card.dataset.parentProject='voucher';
          const intro=element('div','related-project-card__intro-v81');
          const top=element('div','related-project-card__top-v45');
          top.append(
            element('strong','related-project-card__company-v135','FairPrice Group'),
            element('span','related-project-card__context',ui("initiative-2f35f4be"))
          );
          intro.append(top,element('h5','related-project-card__title',lang==='zh'?initiative.title_zh:initiative.title));
          const meta=element('dl','related-project-card__meta-v45');
          const row=element('div');
          row.append(
            element('dt','',ui("why-it-fits-3421d244")),
            element('dd','',lang==='zh'?initiative.strategy_zh:initiative.strategy)
          );
          meta.append(row);
          const action=element('span','related-project-card__action');
          action.append(
            element('span','related-project-card__action-label',ui("view-initiative-6fde5688")),
            element('span','related-project-card__action-arrow','↗')
          );
          card.append(intro,meta,action);
          projects.append(card);
        }
      }
      results.append(projects);results.hidden=false;enhanceCompanyNames(results);
      safeText(status,ui("search-results-updated-1833c496"));
      results.focus({preventScroll:true});
      results.scrollIntoView({block:'start',behavior:'auto'});
    };
    const openSearch=()=>{
      setMenu(false);
      if(!searchDialog.open)searchDialog.showModal();
      trigger.setAttribute('aria-expanded','true');
      body.classList.add('is-locked');
      requestAnimationFrame(()=>input.focus());
    };
    const closeSearch=({restoreFocus=true}={})=>{
      if(!searchDialog.open)return;
      searchDialog.close();trigger.setAttribute('aria-expanded','false');body.classList.remove('is-locked');
      if(restoreFocus)trigger.focus();
    };
    const renderSuggestions=()=>{
      clear(suggestions);
      DATA.search.suggestions.forEach(item=>{
        const chip=element('button','global-search-v114__chip',localize(item.label));
        chip.type='button';
        chip.addEventListener('click',()=>{input.value=localize(item.query);syncClear();renderResults(input.value)});
        suggestions.append(chip);
      });
    };
    renderSuggestions();
    const syncClear=()=>{clearSearch.hidden=!input.value};
    input.addEventListener('input',syncClear);
    clearSearch.addEventListener('click',()=>{
      input.value='';
      syncClear();
      results.hidden=true;
      clear(results);
      input.focus();
    });
    trigger.addEventListener('click',openSearch);
    doc.querySelectorAll('[data-open-global-search]').forEach(node=>node.addEventListener('click',event=>{event.preventDefault();openSearch()}));
    close.addEventListener('click',()=>closeSearch());
    searchDialog.addEventListener('click',event=>{if(event.target===searchDialog)closeSearch()});
    searchDialog.addEventListener('cancel',event=>{event.preventDefault();closeSearch()});
    form.addEventListener('submit',event=>{event.preventDefault();if(input.value.trim())renderResults(input.value)});
    results.addEventListener('click',event=>{
      if(event.target.closest('[data-project],[data-initiative]'))closeSearch({restoreFocus:false});
    });
    doc.addEventListener('portfolio:language',()=>{
      safeText(trigger.querySelector('.header-search-v114__label'),ui("search-8fb22e8f"));
      trigger.setAttribute('aria-label',ui("search-entire-site-a8673eed"));
      close.setAttribute('aria-label',ui("close-site-search-376ce6d7"));
      safeText(title,ui("what-are-you-trying-to-solve-27f7ebed"));
      safeText(intro,ui("search-by-company-domain-product-problem-o-405a6756"));
      safeText(label,ui("product-challenge-8a385573"));
      input.placeholder=ui("try-a-company-domain-or-product-problem-3a452b87");
      clearSearch.setAttribute('aria-label',ui("clear-search-20cb7d1c"));
      safeText(submit,ui("search-8fb22e8f"));
      suggestions.setAttribute('aria-label',ui("suggested-problems-221529dc"));
      const matchedSuggestion=DATA.search.suggestions.find(item=>Object.values(item.query||{}).includes(input.value));
      if(matchedSuggestion)input.value=localize(matchedSuggestion.query);
      syncClear();
      renderSuggestions();
      if(!results.hidden&&input.value.trim())renderResults(input.value);
    });
  }
  mountGlobalSearch();

  function emphasiseCompanyName(node){
    if(!node||node.querySelector('.company-name-v132'))return;
    const parts=node.textContent.trim().split(/\s+·\s+/);
    if(parts.length<2)return;
    node.replaceChildren(element('strong','company-name-v132',parts.shift()),element('span','company-context-v132',parts.join(' · ')));
  }
  function projectEyebrow(project){
    if(!project)return '';
    return [localize(project.company),localize(project.domain)].filter(Boolean).join(' · ');
  }
  function enhanceCompanyNames(root=doc){
    root.querySelectorAll('.project-context').forEach(node=>{
      const key=node.closest('[data-project]')?.dataset.project;
      const eyebrow=projectEyebrow(DATA.projects?.[key]);
      if(eyebrow)safeText(node,eyebrow);
    });
    root.querySelectorAll('.evidence-feature,.evidence-list__item').forEach(card=>{
      const key=card.querySelector('[data-project]')?.dataset.project;
      const context=card.querySelector('.evidence-list__context');
      const eyebrow=projectEyebrow(DATA.projects?.[key]);
      if(context&&eyebrow)safeText(context,eyebrow);
    });
    root.querySelectorAll('.experience-orgs-v44__list span,.evidence-list__context,.project-context,.detail-related-card-v45__context,#detailContext').forEach(emphasiseCompanyName);
  }
  enhanceCompanyNames();
  doc.addEventListener('portfolio:language',()=>requestAnimationFrame(()=>enhanceCompanyNames()));

  function hydrateCanonicalCardCopy(){
    doc.querySelectorAll('.work-card-v32 [data-project],.evidence-feature [data-project],.evidence-list__item [data-project]').forEach(trigger=>{
      const project=DATA.projects?.[trigger.dataset.project];
      if(!project)return;
      const card=trigger.closest('.work-card-v32,.evidence-feature,.evidence-list__item');
      if(!card)return;
      const title=card.querySelector('h2,h3');
      const summary=card.querySelector(':scope p,.work-card-v32__content>p,.evidence-list__summary');
      const context=card.querySelector('.project-context,.evidence-list__context');
      safeText(title,localize(project.title_pair));
      if(summary)safeText(summary,localize(project.at_a_glance_pair));
      if(context)safeText(context,projectEyebrow(project));
      let proof=card.querySelector('.what-this-proves-v147');
      const proofText=localize(project.what_this_proves);
      if(proofText&&!proof){
        proof=element('div','what-this-proves-v147');
        proof.append(
          element('span','what-this-proves-v147__label',localize(DATA.implementationContracts?.whatThisProvesLabel)),
          element('p','what-this-proves-v147__body',proofText)
        );
        const action=card.querySelector('.evidence-feature__action,.evidence-list__action,.work-card-v32__action');
        if(action)action.before(proof);else trigger.before(proof);
      }
      if(proof)proof.hidden=!proofText;
      trigger.setAttribute('aria-label',`${ui("open-project-9dcdb86a")}: ${localize(project.title_pair)}`);
    });
    doc.querySelectorAll('.experiment-feature-card-v32[data-experiment],.experiment-index-card-v36[data-experiment],.poster[data-experiment]').forEach(card=>{
      const item=DATA.experiments?.[card.dataset.experiment];
      if(!item)return;
      if(card.closest('#profileSideRail')){card.setAttribute('aria-label',`${ui("open-exploration-33b85a78")}: ${localize(item.title)}`);return;}
      safeText(card.querySelector('h2,h3'),localize(item.title));
      safeText(card.querySelector('p'),localize(item.summary));
      const kicker=card.querySelector('.kicker');
      if(kicker)safeText(kicker,localize(item.category));
      const preview=card.querySelector('.experiment-learning-preview-v38,.experiment-index-card-v38__learning');
      if(preview){
        const learning=localize(item.learning);
        preview.hidden=!learning;
        safeText(preview.querySelector('strong'),learning);
      }
      card.setAttribute('aria-label',`${ui("open-exploration-33b85a78")}: ${localize(item.title)}`);
    });
  }
  hydrateCanonicalCardCopy();
  doc.addEventListener('portfolio:language',()=>requestAnimationFrame(hydrateCanonicalCardCopy));

  // Purposeful scroll-trigger: static without JS, animated only after activation.
  const revealNodes=[...doc.querySelectorAll('[data-motion-reveal]')];
  if(!prefersReduced.matches)body.classList.add('motion-ready');
  if('IntersectionObserver' in window&&!prefersReduced.matches){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-inview');observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -7%'});
    revealNodes.forEach(node=>observer.observe(node));
  }else{revealNodes.forEach(node=>node.classList.add('is-inview'))}
  window.requestAnimationFrame(()=>doc.querySelector('.hero')?.classList.add('is-ready'));

  // Native pointer feedback only. Custom cursor labels were removed because they obscured content.
  const cursor={hide(){}};

  // Subtle artifact tilt via Web Animations API (no inline style ownership).
  if(precisePointer.matches&&!prefersReduced.matches){
    doc.querySelectorAll('[data-tilt]').forEach(target=>{
      target.addEventListener('pointermove',event=>{
        const rect=target.getBoundingClientRect();
        const x=(event.clientX-rect.left)/rect.width-.5;
        const y=(event.clientY-rect.top)/rect.height-.5;
        target.animate({transform:`rotateX(${(-y*2.2).toFixed(2)}deg) rotateY(${(x*2.2).toFixed(2)}deg) rotateZ(-2deg)`},{duration:120,fill:'forwards',easing:'cubic-bezier(.2,0,0,1)'});
      });
      target.addEventListener('pointerleave',()=>target.animate({transform:'rotateX(0deg) rotateY(0deg) rotateZ(-2deg)'},{duration:220,fill:'forwards',easing:'cubic-bezier(.2,0,0,1)'}));
    });
  }

  // Shared horizontal rail controller: native scrolling, visible controls, no auto-rotation.
  function railControlsFor(id){
    return {
      prev:doc.querySelector(`[data-rail-prev="${id}"]`),
      next:doc.querySelector(`[data-rail-next="${id}"]`)
    };
  }
  function logicalRailMax(rail){
    const visibleItems=[...rail.children].filter(item=>!item.hidden);
    const last=visibleItems.at(-1);
    if(!last)return 0;
    const paddingEnd=parseFloat(getComputedStyle(rail).paddingInlineEnd)||0;
    // Offset geometry excludes decorative transforms. Rotated experiment cards
    // must not create a false extra view just to reveal their painted edge.
    return Math.max(0,last.offsetLeft+last.offsetWidth+paddingEnd-rail.clientWidth);
  }
  function updateRailControls(rail){
    if(!rail||!rail.id)return;
    const {prev,next}=railControlsFor(rail.id);
    const max=logicalRailMax(rail);
    const atStart=rail.scrollLeft<=2;
    const atEnd=rail.scrollLeft>=max-2;
    const scrollable=max>2;
    rail.dataset.railScrollable=String(scrollable);
    if(prev){prev.hidden=!scrollable;prev.disabled=atStart;prev.setAttribute('aria-disabled',String(atStart))}
    if(next){next.hidden=!scrollable;next.disabled=atEnd;next.setAttribute('aria-disabled',String(atEnd))}
  }
  function bindRail(rail){
    if(!rail||rail.dataset.railBound==='true')return;
    rail.dataset.railBound='true';
    const {prev,next}=railControlsFor(rail.id);
    const move=direction=>{
      const visibleItems=[...rail.children].filter(item=>!item.hidden);
      const paddingStart=parseFloat(getComputedStyle(rail).paddingInlineStart)||0;
      const max=logicalRailMax(rail);
      const anchors=visibleItems.map(item=>Math.min(max,Math.max(0,item.offsetLeft-paddingStart)));
      const current=Math.min(max,Math.max(0,rail.scrollLeft));
      const target=direction>0
        ? (anchors.find(anchor=>anchor>current+2)??max)
        : ([...anchors].reverse().find(anchor=>anchor<current-2)??0);
      rail.scrollTo({left:target,behavior:prefersReduced.matches?'auto':'smooth'});
    };
    prev?.addEventListener('click',()=>move(-1));
    next?.addEventListener('click',()=>move(1));
    rail.addEventListener('scroll',()=>updateRailControls(rail),{passive:true});
    updateRailControls(rail);
  }
  function refreshHorizontalRails(){
    doc.querySelectorAll('[data-rail]').forEach(bindRail);
    doc.querySelectorAll('[data-rail]').forEach(updateRailControls);
  }
  window.refreshHorizontalRails=refreshHorizontalRails;
  const railResizeObserver='ResizeObserver' in window?new ResizeObserver(refreshHorizontalRails):null;
  doc.querySelectorAll('[data-rail]').forEach(rail=>railResizeObserver?.observe(rail));
  window.addEventListener('resize',refreshHorizontalRails);
  refreshHorizontalRails();



  // v33: scalable project ordering.
  const scalableWorkGallery=doc.querySelector('[data-scalable-work-gallery]');
  const workArchive=doc.getElementById('workArchive');
  const workArchiveGrid=doc.getElementById('workArchiveGrid');
  const workFilterRegistry=list(DATA.workIndex?.workFilters);
  const workFilterIdsForProject=id=>workFilterRegistry
    .filter(filter=>filter.id!=='all'&&list(filter.projectIds).includes(id))
    .map(filter=>filter.id);
  function createWorkCard(id,project,index){
    const card=element('article','work-card-v32');
    card.classList.add(index===0?'work-card-v32--featured':'work-card-v32--compact');
    card.dataset.featureRank=String(index+1);
    card.dataset.projectDate=String(project.period||project.timeline||'');
    card.dataset.workCategories=workFilterIdsForProject(id).join(' ');
    const button=element('button','work-card-v32__button');
    button.type='button';button.dataset.project=id;button.dataset.pressable='';
    const coverAssetId=id==='voucher'?'voucher-hero-incentive-journey-public-v1':(project.hero_visual_brief?.assetId||project.heroVisualBrief?.assetId);
    const coverAsset=coverAssetId?resolveProjectAsset(coverAssetId):null;
    const visual=element('div',coverAsset?'work-artifact work-card-v32__visual-v225':`work-artifact work-artifact--${id}`);
    visual.dataset.frameRole='project-cover';
    if(coverAsset){
      const image=element('img','work-card-v32__image-v225');
      image.src=coverAsset.src;image.loading=index===0?'eager':'lazy';image.decoding='async';
      image.alt=localize(coverAsset.alt);image.dataset.assetId=coverAsset.assetId;
      image.dataset.assetStatus=coverAsset.isPlaceholder?'placeholder-active':'real-active';
      visual.dataset.assetStatus=image.dataset.assetStatus;
      visual.append(image);
    }else{
      visual.setAttribute('aria-hidden','true');
      appendArtifactContents(visual,projectArtifactLabels(id));
    }
    const content=element('div','work-card-v32__content');
    const top=element('div','work-card-v32__top related-project-card__top-v45');
    top.append(element('strong','related-project-card__company-v135',localize(project.company)));
    const domain=localize(project.domain_label);
    if(index===0&&domain)top.append(element('span','project-context related-project-card__context',domain));
    const title=element('h2','',localize(project.title_pair));
    const summary=element('p','',localize(project.at_a_glance_pair));
    const action=element('span','work-card-v32__action related-project-card__action');
    action.append(
      element('span','related-project-card__action-label',ui("view-case-a62dd0ad")),
      element('span','icon-arrow icon-arrow--right')
    );
    content.append(top,title,summary,action);
    button.append(visual,content);card.append(button);return card;
  }
  if(scalableWorkGallery){
    clear(scalableWorkGallery);
    const architecture=DATA.workIndex?.principalPortfolioArchitecture||{};
    const featured=architecture.featuredOrder||[];
    const primaryFeature=featured[0]||'voucher';
    const supportingFeatures=featured.slice(1,5);
    const featuredIds=[primaryFeature,...supportingFeatures].filter(id=>DATA.projects[id]);
    const moreWork=Object.keys(DATA.projects).filter(id=>!featuredIds.includes(id));
    featuredIds.forEach((id,index)=>scalableWorkGallery.append(createWorkCard(id,DATA.projects[id],index)));
    if(workArchiveGrid){
      clear(workArchiveGrid);
      moreWork.forEach((id,index)=>workArchiveGrid.append(createWorkCard(id,DATA.projects[id],index+featuredIds.length)));
    }
  }
  const leadership=DATA.profile?.designLeadership;
  const leadershipGrid=doc.getElementById('designLeadershipGrid');
  if(leadership&&leadershipGrid){
    safeText(doc.getElementById('designLeadershipTitle'),localize(leadership.title));
    clear(leadershipGrid);
    list(leadership.items).forEach((item,index)=>{
      const card=element('article','profile-leadership-v81__item');
      card.append(
        element('span','profile-leadership-v81__number',String(index+1).padStart(2,'0')),
        element('small','',localize(item.label)),
        element('p','',localize(item.content))
      );
      const links=element('div','profile-leadership-v81__links');
      list(item.evidenceLinks).slice(0,1).forEach(link=>{
        const source=link.type==='project'?DATA.projects[link.id]:DATA.experiments[link.id];
        if(!source)return;
        const fullTitle=link.type==='project'
          ?localize(source.cardTitle)||localize(source.title_pair)
          :localize(source.title);
        const rawLinkTitle=link.type==='project'?ui("view-case-a62dd0ad"):ui("view-experiment-8788e030");
        const linkTitle=rawLinkTitle.replace(/\s*[→↗]\s*$/,'');
        const button=element('button','text-cta profile-leadership-v81__link',linkTitle);
        button.type='button';button.dataset.pressable='';
        button.dataset[link.type]=link.id;
        button.setAttribute('aria-label',`${linkTitle}: ${fullTitle}`);
        button.appendChild(element('span',`icon-arrow ${link.type==='project'?'icon-arrow--right':'icon-arrow--up-right'}`));
        links.appendChild(button);
      });
      if(links.childElementCount)card.appendChild(links);
      leadershipGrid.appendChild(card);
    });
  }
  const explorationRail=doc.getElementById('experimentPageRail');
  if(explorationRail){
    clear(explorationRail);
    Object.entries(DATA.experiments).forEach(([id,item],index)=>{
      const card=element('button','experiment-index-card-v36');
      card.type='button';card.dataset.experiment=id;card.dataset.experimentPriority=String(index+1);card.dataset.pressable='';
      card.append(element('div','kicker',localize(item.category)),element('h3','',localize(item.title)),element('p','',localize(item.question)),element('span','experiment-card-action',ui("view-experiment-8788e030")));
      explorationRail.append(card);
    });
  }
  if(scalableWorkGallery){
    const allWorkCards=[...scalableWorkGallery.querySelectorAll('[data-feature-rank]')];
    allWorkCards.sort((a,b)=>{
      const rankDiff=Number(a.dataset.featureRank||999)-Number(b.dataset.featureRank||999);
      if(rankDiff!==0) return rankDiff;
      return String(b.dataset.projectDate||'').localeCompare(String(a.dataset.projectDate||''));
    });
    allWorkCards.forEach(card=>scalableWorkGallery.appendChild(card));
    if(workArchive)workArchive.hidden=!workArchiveGrid?.childElementCount;
  }

  // v33: experiment rails follow explicit priority, then DOM order.
  doc.querySelectorAll('[data-rail]').forEach(rail=>{
    const ordered=[...rail.querySelectorAll('[data-experiment-priority]')];
    if(ordered.length){
      ordered.sort((a,b)=>Number(a.dataset.experimentPriority||999)-Number(b.dataset.experimentPriority||999));
      ordered.forEach(card=>rail.appendChild(card));
    }
  });

  // Work page problem filters. Labels and many-to-many project mappings are SSOT-owned.
  const workFilterRail=doc.getElementById('workFilterRail');
  if(workFilterRail&&workFilterRegistry.length){
    clear(workFilterRail);
    workFilterRegistry.forEach((filter,index)=>{
      const button=element('button','work-filter-chip',localize(filter.label));
      button.type='button';button.dataset.workFilter=filter.id;button.dataset.pressable='';
      button.dataset.en=filter.label?.en||'';button.dataset.zh=filter.label?.zh||'';
      button.setAttribute('aria-pressed',String(index===0));
      workFilterRail.append(button);
    });
  }
  const workFilterButtons=[...doc.querySelectorAll('[data-work-filter]')];
  const workCards=[...doc.querySelectorAll('[data-work-categories]')];
  function applyWorkFilter(filter){
    workFilterButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.workFilter===filter)));
    workCards.forEach(card=>{card.hidden=filter!=='all'&&!card.dataset.workCategories.split(/\s+/).includes(filter)});
    scalableWorkGallery?.classList.toggle('is-filtered',filter!=='all');
    if(workArchive&&workArchiveGrid){const visible=[...workArchiveGrid.children].some(card=>!card.hidden);workArchive.hidden=filter!=='all'||!visible}
  }
  workFilterButtons.forEach(button=>button.addEventListener('click',()=>{
 applyWorkFilter(button.dataset.workFilter);
 button.scrollIntoView({behavior:prefersReduced.matches?'auto':'smooth',block:'nearest',inline:'nearest'});
}));

  const dialog=doc.getElementById('detailDialog');
  const dialogTitle=doc.getElementById('detailTitle');
  const projectView=doc.getElementById('projectView');
  const experimentView=doc.getElementById('experimentView');
  const dialogClose=doc.getElementById('detailClose');
  const dialogBack=doc.getElementById('detailBack');
  const dialogStatus=doc.getElementById('dialogStatus');
  const dialogScrollRoot=dialog?.querySelector('.dialog-scroll');
  const dialogControls=dialog?.querySelector('.dialog-controls-v67');
  const evidenceLightbox=element('dialog','evidence-lightbox-v147');
  evidenceLightbox.setAttribute('aria-modal','true');
  const evidenceLightboxClose=element('button','evidence-lightbox-v147__close','×');
  evidenceLightboxClose.type='button';
  evidenceLightboxClose.setAttribute('aria-label',localize(DATA?.implementationContracts?.expandableImageLabels?.close)||'Close');
  const evidenceLightboxImage=doc.createElement('img');
  evidenceLightboxImage.className='evidence-lightbox-v147__image';
  const evidenceLightboxCaption=element('p','evidence-lightbox-v147__caption');
  evidenceLightbox.append(evidenceLightboxClose,evidenceLightboxImage,evidenceLightboxCaption);
  body.append(evidenceLightbox);
  let evidenceLightboxInvoker=null;
  function closeEvidenceLightbox(){
    if(!evidenceLightbox.open)return;
    evidenceLightbox.close();
    evidenceLightboxInvoker?.focus({preventScroll:true});
    evidenceLightboxInvoker=null;
  }
  function openEvidenceLightbox(invoker,image){
    if(!image?.src||image.dataset.assetStatus==='placeholder-active')return;
    evidenceLightboxInvoker=invoker;
    evidenceLightboxImage.src=image.currentSrc||image.src;
    evidenceLightboxImage.alt=image.alt||'';
    const figure=invoker.closest('figure,.before-after-evidence-v147__item,.decision-visual-v58');
    safeText(evidenceLightboxCaption,figure?.querySelector('figcaption,.before-after-evidence-v147__caption')?.textContent?.trim()||image.alt||'');
    evidenceLightbox.showModal();
    evidenceLightboxClose.focus();
  }
  function enableExpandableEvidence(rootNode=doc){
    rootNode.querySelectorAll('.decision-visual-v58 img,.programme-stage-visual img,#sharedGallery img').forEach(image=>{
      if(image.dataset.assetStatus==='placeholder-active')return;
      const invoker=image.closest('[data-expandable-evidence]')||image;
      invoker.tabIndex=0;
      invoker.setAttribute('role','button');
      invoker.setAttribute('aria-haspopup','dialog');
      if(!invoker.getAttribute('aria-label'))invoker.setAttribute('aria-label',image.alt||localize(DATA.implementationContracts?.expandableImageLabels?.expand));
    });
  }
  evidenceLightboxClose.addEventListener('click',closeEvidenceLightbox);
  evidenceLightbox.addEventListener('click',event=>{if(event.target===evidenceLightbox)closeEvidenceLightbox()});
  evidenceLightbox.addEventListener('cancel',event=>{event.preventDefault();closeEvidenceLightbox()});
  doc.addEventListener('click',event=>{
    const invoker=event.target.closest('[data-expandable-evidence],.decision-visual-v58 img,.programme-stage-visual img,#sharedGallery img');
    if(!invoker)return;
    const image=invoker.matches('img')?invoker:invoker.querySelector('img');
    openEvidenceLightbox(invoker,image);
  });
  doc.addEventListener('keydown',event=>{
    if(evidenceLightbox.open&&event.key==='Tab'){
      event.preventDefault();evidenceLightboxClose.focus();return;
    }
    if(event.key!=='Enter'&&event.key!==' ')return;
    const invoker=event.target.closest('[data-expandable-evidence],.decision-visual-v58 img,.programme-stage-visual img,#sharedGallery img');
    if(!invoker)return;
    event.preventDefault();
    openEvidenceLightbox(invoker,invoker.matches('img')?invoker:invoker.querySelector('img'));
  });
  const projectSectionNav=doc.getElementById('projectSectionNav');
  const projectSectionNavToggle=doc.getElementById('projectSectionNavToggle');
  const projectSectionNavLinks=doc.getElementById('projectSectionNavLinks');
  let suppressHistorySync=false;
  let projectSectionNavigation=null;
  let projectSectionNavigationId=0;
  let activeProjectSectionId='';
  let visibleProjectSectionId='';
  const PROJECT_NAV_ITEMS=[
    ['overview','projectOverviewSection','Overview','概覽'],
    ['complexity','projectComplexitySection','Complexity','複雜度'],
    ['decisions','projectDecisionsSection','Decisions','設計決策'],
    ['impact','projectImpactSection','Impact','影響與成果']
  ];
  function closeProjectSectionMenu(){
    projectSectionNav?.classList.remove('is-open');
    projectSectionNavToggle?.setAttribute('aria-expanded','false');
  }
  function projectSectionInset(){
    if(!dialogScrollRoot)return 0;
    const rootTop=dialogScrollRoot.getBoundingClientRect().top;
    const controlsBottom=dialogControls?.getBoundingClientRect().bottom||rootTop;
    return Math.max(0,controlsBottom-rootTop)+24;
  }
  function alignProjectSectionTarget(target){
    if(!target||!dialogScrollRoot)return;
    const rootTop=dialogScrollRoot.getBoundingClientRect().top;
    const targetTop=target.getBoundingClientRect().top;
    const correction=targetTop-rootTop-projectSectionInset();
    if(Math.abs(correction)>2)dialogScrollRoot.scrollTop=Math.max(0,dialogScrollRoot.scrollTop+correction);
  }
  function setActiveProjectSection(id){
    activeProjectSectionId=id||'';
    projectSectionNavLinks?.querySelectorAll('a').forEach(link=>{
      if(link.getAttribute('href')===`#${activeProjectSectionId}`)link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
  function cancelProjectSectionNavigation({restoreScrollSpy=true}={}){
    const transaction=projectSectionNavigation;
    if(transaction){
      transaction.frames.forEach(frame=>window.cancelAnimationFrame(frame));
      transaction.timers.forEach(timer=>window.clearTimeout(timer));
      projectSectionNavigation=null;
    }
    if(restoreScrollSpy)updateProjectSectionLocation();
  }
  function scheduleProjectSectionFrame(transaction,callback){
    const frame=window.requestAnimationFrame(time=>{
      transaction.frames.delete(frame);
      if(projectSectionNavigation===transaction)callback(time);
    });
    transaction.frames.add(frame);
  }
  function scrollToProjectSection(target){
    if(!target||!dialogScrollRoot)return;
    cancelProjectSectionNavigation({restoreScrollSpy:false});
    closeProjectSectionMenu();
    const transaction={id:++projectSectionNavigationId,targetId:target.id,frames:new Set(),timers:new Set()};
    projectSectionNavigation=transaction;
    setActiveProjectSection(target.id);
    scheduleProjectSectionFrame(transaction,()=>scheduleProjectSectionFrame(transaction,()=>{
      const rootTop=dialogScrollRoot.getBoundingClientRect().top;
      const targetTop=target.getBoundingClientRect().top;
      const startTop=dialogScrollRoot.scrollTop;
      const initialTop=Math.max(0,startTop+targetTop-rootTop-projectSectionInset());
      const duration=prefersReduced.matches?0:420;
      let startedAt=null;
      const finish=()=>{
        if(projectSectionNavigation!==transaction)return;
        alignProjectSectionTarget(target);
        target.focus?.({preventScroll:true});
        visibleProjectSectionId=target.id;
        setActiveProjectSection(target.id);
        projectSectionNavigation=null;
        updateProjectSectionLocation();
      };
      if(!duration){
        dialogScrollRoot.scrollTo({left:0,top:initialTop,behavior:'auto'});
        finish();
        return;
      }
      const animate=time=>{
        if(startedAt===null)startedAt=time;
        const progress=Math.min(1,(time-startedAt)/duration);
        const eased=1-Math.pow(1-progress,3);
        const currentRootTop=dialogScrollRoot.getBoundingClientRect().top;
        const currentTargetTop=target.getBoundingClientRect().top;
        const desiredTop=Math.max(0,dialogScrollRoot.scrollTop+currentTargetTop-currentRootTop-projectSectionInset());
        const endTop=progress<1?initialTop+(desiredTop-initialTop)*progress:desiredTop;
        dialogScrollRoot.scrollTop=startTop+(endTop-startTop)*eased;
        if(progress<1)scheduleProjectSectionFrame(transaction,animate);
        else finish();
      };
      scheduleProjectSectionFrame(transaction,animate);
    }));
  }
  function updateProjectSectionLocation(){
    if(!projectSectionNav||projectSectionNav.hidden||!dialogScrollRoot)return;
    const visible=PROJECT_NAV_ITEMS
      .map(([,id])=>doc.getElementById(id))
      .filter(node=>node&&!node.hidden&&node.getClientRects().length);
    const offset=dialogScrollRoot.getBoundingClientRect().top+projectSectionInset();
    let current=visible[0];
    visible.forEach(node=>{if(node.getBoundingClientRect().top<=offset)current=node});
    visibleProjectSectionId=current?.id||'';
    if(!projectSectionNavigation)setActiveProjectSection(visibleProjectSectionId);
  }
  function renderProjectSectionNav(){
    if(!projectSectionNav||!projectSectionNavLinks)return;
    cancelProjectSectionNavigation({restoreScrollSpy:false});
    activeProjectSectionId='';
    visibleProjectSectionId='';
    clear(projectSectionNavLinks);
    const items=PROJECT_NAV_ITEMS.filter(([,id])=>{
      const target=doc.getElementById(id);
      return target&&!target.hidden;
    });
    projectSectionNav.hidden=currentDetail?.type!=='project'||items.length<2;
    closeProjectSectionMenu();
    if(projectSectionNav.hidden)return;
    items.forEach(([,id,en,zh])=>{
      const link=element('a','pd-section-nav__link',lang==='zh'?zh:en);
      link.href=`#${id}`;
      link.addEventListener('click',event=>{
        event.preventDefault();
        scrollToProjectSection(doc.getElementById(id));
      });
      projectSectionNavLinks.appendChild(link);
    });
    updateProjectSectionLocation();
  }
  projectSectionNavToggle?.addEventListener('click',()=>{
    const open=projectSectionNav?.classList.toggle('is-open');
    projectSectionNavToggle.setAttribute('aria-expanded',String(Boolean(open)));
  });
  dialogScrollRoot?.addEventListener('scroll',()=>{
    if(dialogScrollRoot.scrollLeft!==0)dialogScrollRoot.scrollLeft=0;
    updateProjectSectionLocation();
  },{passive:true});
  const restoreManualProjectSectionScrollSpy=()=>cancelProjectSectionNavigation();
  dialogScrollRoot?.addEventListener('wheel',restoreManualProjectSectionScrollSpy,{passive:true});
  dialogScrollRoot?.addEventListener('touchstart',restoreManualProjectSectionScrollSpy,{passive:true});
  dialogScrollRoot?.addEventListener('keydown',event=>{
    if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))restoreManualProjectSectionScrollSpy();
  });

  function setDialogOpenState(open){body.classList.toggle('is-locked',open);cursor.hide()}
  function updateCloseControl(){
    if(!dialogClose)return;
    const isJourneyStage=currentDetail?.type==='stage';
    const isProgrammeChild=currentDetail?.type==='initiative'||isJourneyStage;
    const canGoBack=detailStack.length>0||isProgrammeChild;
    dialogClose.classList.remove('is-back');
    dialogClose.setAttribute('aria-label',ui("close-all-details-6520d3a1"));
    clear(dialogClose);
    dialogClose.appendChild(element('span','modal-close__icon','×'));
    if(dialogBack){
      dialogBack.hidden=!canGoBack;
      const toProgramme=currentDetail?.type==='initiative'||isJourneyStage;
      dialogBack.setAttribute('aria-label',toProgramme?(ui("back-to-voucher-offer-overview-0370bac9")):(ui("back-to-previous-details-c2b70957")));
      clear(dialogBack);
      if(canGoBack)dialogBack.append(element('span','', '←'),element('span','',toProgramme?(ui("voucher-offer-overview-2e269be3")):(ui("back-e66c18aa"))));
    }
  }
  function returnToParentProject(){
    const parentKey=currentDetail?.parentKey;
    if(!parentKey||!DATA.projects[parentKey])return false;
    const parentSnapshot=[...detailStack].reverse().find(entry=>entry.detail?.type==='project'&&entry.detail.key===parentKey);
    detailStack.length=0;
    currentDetail={type:'project',key:parentKey};
    currentInvoker=parentSnapshot?.invoker||doc.querySelector(`[data-project="${parentKey}"]`);
    galleryIndex=parentSnapshot?.galleryIndex||0;
    renderDetail();
    if(dialogScrollRoot){
      const restoreTop=parentSnapshot?.scrollTop||0;
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        dialogScrollRoot.scrollTo({top:restoreTop,left:0,behavior:'auto'});
      }));
    }
    updateCloseControl();
    dialogTitle.focus({preventScroll:true});
    safeText(dialogStatus,ui("returned-to-voucher-offer-overview-9d685c97"));
    if(!suppressHistorySync){
      const url=new URL(window.location.href);
      url.searchParams.set('case',parentKey);
      url.searchParams.delete('initiative');
      url.searchParams.delete('stage');
      history.replaceState({detail:currentDetail},'',url);
    }
    return true;
  }
  function returnToPreviousDetail(){
    if(!dialog?.open)return;
    if((currentDetail?.type==='stage'||currentDetail?.type==='initiative')&&returnToParentProject())return;
    if(detailStack.length){
      const previous=detailStack.pop();
      currentDetail=previous.detail;
      currentInvoker=previous.invoker;
      galleryIndex=previous.galleryIndex;
      renderDetail();
      if(dialogScrollRoot)dialogScrollRoot.scrollTo({top:0,left:0,behavior:'auto'});
      updateCloseControl();
      dialogTitle.focus({preventScroll:true});
      safeText(dialogStatus,ui("returned-to-previous-details-1df10e00"));
      const url=new URL(window.location.href);
      if(!suppressHistorySync&&currentDetail.type==='project'){
        url.searchParams.set('case',currentDetail.key);
        url.searchParams.delete('initiative');
        url.searchParams.delete('stage');
        history.replaceState({detail:currentDetail},'',url);
      }
      return;
    }
  }
  function closeDialog(options={}){
    const syncHistory=options?.syncHistory!==false;
    if(!dialog?.open)return;
    dialog.classList.add('is-closing');
    const finish=()=>{dialog.classList.remove('is-closing');dialog.close();setDialogOpenState(false);safeText(dialogStatus,ui("details-closed-8df67313"));rootInvoker?.focus();detailStack.length=0;rootInvoker=null;currentInvoker=null;currentDetail=null;if(syncHistory)history.replaceState({},'',workIndexUrl());updateCloseControl()};
    if(prefersReduced.matches)finish();else window.setTimeout(finish,140);
  }
  dialogClose?.addEventListener('click',closeDialog);
  dialogBack?.addEventListener('click',returnToPreviousDetail);
  dialog?.addEventListener('click',event=>{if(event.target===dialog)closeDialog()});
  dialog?.addEventListener('cancel',event=>{event.preventDefault();closeDialog()});

  function renderArtifact(labels,assetId=''){
    const art=doc.getElementById('galleryArt');clear(art);art.dataset.frameRole='supporting-evidence';
    const resolved=assetId?resolveProjectAsset(assetId):null;
    if(resolved){
      const image=doc.createElement('img');
      image.className='portfolio-media';image.src=resolved.src;image.alt=localize(resolved.alt);image.loading='lazy';image.decoding='async';
      image.sizes='(max-width: 720px) 92vw, 56vw';
      if(resolved.isPlaceholder){image.dataset.assetStatus='placeholder-active';image.setAttribute('aria-label',localize(resolved.alt));}
      art.append(image);return;
    }
    appendArtifactContents(art,labels);
  }
  function renderGalleryMedia(item){
    const art=doc.getElementById('galleryArt');clear(art);art.dataset.frameRole='supporting-evidence';
    const resolved=item.assetId?resolveProjectAsset(item.assetId):null;
    if(resolved){
      const image=doc.createElement('img');image.className='portfolio-media';image.src=resolved.src;image.alt=localize(resolved.alt);image.loading='lazy';image.decoding='async';
      if(resolved.isPlaceholder){image.dataset.assetStatus='placeholder-active';image.setAttribute('aria-label',localize(resolved.alt));}
      art.append(image);return;
    }
    if(item.video){
      const video=doc.createElement('video');
      video.className='portfolio-media portfolio-media--video';
      video.poster=item.poster;video.preload='none';video.muted=true;video.playsInline=true;
      video.setAttribute('aria-label',localize(item.alt));
      if(!prefersReduced.matches){
        const play=element('button','portfolio-media__play',ui("play-interaction-1503d44b"));
        play.type='button';
        play.addEventListener('click',()=>{
          if(!video.querySelector('source')){
            const source=doc.createElement('source');source.src=item.video;video.append(source);video.load();
          }
          video.play();play.hidden=true;
        });
        art.append(video,play);
        const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)video.pause()}),{threshold:.1});
        observer.observe(video);
      }else art.append(video);
      return;
    }
    const image=doc.createElement('img');
    image.className='portfolio-media';
    image.src=item.src;image.alt=localize(item.alt);image.loading='lazy';image.decoding='async';
    image.sizes='(max-width: 720px) 92vw, 56vw';
    art.append(image);
  }
  function appendArtifactContents(node,labels){
    const top=element('div','window-top');for(let i=0;i<3;i++)top.appendChild(element('i'));
    const flow=element('div','flow');
    labels.forEach((label,index)=>{if(index)flow.appendChild(element('span','flow-line'));flow.appendChild(element('div',index===1?'flow-node flow-node--dark':'flow-node',label))});
    node.append(top,flow);
  }
  function projectArtifactLabels(key){
    const brief=DATA.projects?.[key]?.hero_visual_brief;
    if(brief){
      const concise=value=>String(localize(value)||'')
        .split(/\s+(?:and|across|with)\s+|,/i)[0]
        .trim()
        .split(/\s+/)
        .slice(0,4)
        .join(' ');
      const signals=[brief.problemSignal,brief.systemSignal,brief.outcomeSignal].map(concise);
      if(signals.every(Boolean))return signals;
    }
    if(key==='voucher')return lang==='zh'?['探索','可重用規則','兌換']:['Discovery','Reusable rules','Redemption'];
    if(key==='game-center')return lang==='zh'?['參與','進程','獎勵']:['Participation','Progress','Reward'];
    if(key==='payment')return lang==='zh'?['探索','交易狀態','營運']:['Discovery','Transaction states','Operations'];
    if(key==='booking')return lang==='zh'?['市場限制','準備度模型','上線決策']:['Market constraint','Readiness model','Launch decision'];
    if(key==='bandzo')return lang==='zh'?['課程','練習回饋','進度']:['Lesson','Practice feedback','Progress'];
    return lang==='zh'?['申請人','共享狀態','營運']:['Applicant','Shared state','Operations'];
  }
  function experimentArtifactLabels(key){
    const map={
      'capture-ideas':[['Capture','Shape','Return'],['捕捉','整理','回訪']],
      'aha-creative-toolbox':[['Prompt','Play','Idea'],['提示','遊戲','點子']],
      'hello-sabau':[['Culture','Practice','Recall'],['文化','練習','記憶']],
      'food-testing-workshop':[['Test','Compare','Learn'],['測試','比較','學習']],
      'aja-creative-workshop':[['Insight','Make','Reflect'],['洞察','實作','反思']],
      'weekly-design-session':[['Share','Critique','Decide'],['分享','講評','決策']]
    };
    return (map[key]||[['Question','Model','Learning'],['問題','模型','學習']])[lang==='zh'?1:0];
  }
  function renderGallery(){
    if(!currentDetail)return;
    const {type,key}=currentDetail;
    const data=type==='project'?DATA.projects[key]:type==='initiative'?{gallery:initiativeGallery}:DATA.experiments[key];
    const item=data.gallery[galleryIndex];
    if(type==='initiative'){
      safeText(doc.getElementById('gallerySectionTitle'),ui("shipped-case-53efd516"));
      safeText(doc.getElementById('galleryTitle'),item.title);
      safeText(doc.getElementById('galleryText'),item.text);
      renderArtifact(item.labels);
    }else if(type==='project'){
      if(item&&typeof item==='object'&&!Array.isArray(item)){
        safeText(doc.getElementById('galleryTitle'),localize(item.title));
        safeText(doc.getElementById('galleryText'),localize(item.text));
        renderGalleryMedia(item);
      }else{
        safeText(doc.getElementById('galleryTitle'),localize([item[0],item[2]]));
        safeText(doc.getElementById('galleryText'),localize([item[1],item[3]]));
        renderArtifact(projectArtifactLabels(key),data.hero_visual_brief?.assetId);
      }
    }else{
      safeText(doc.getElementById('galleryTitle'),localize(item[0]));
      safeText(doc.getElementById('galleryText'),localize(item[1]));
      renderArtifact(experimentArtifactLabels(key,galleryIndex));
    }
    safeText(doc.getElementById('galleryCount'),`${String(galleryIndex+1).padStart(2,'0')} / ${String(data.gallery.length).padStart(2,'0')}`);
    const thumbs=doc.getElementById('galleryThumbs');clear(thumbs);
    data.gallery.forEach((galleryItem,index)=>{
      const button=element('button','gallery-thumb');button.type='button';button.setAttribute('role','tab');button.setAttribute('aria-selected',String(index===galleryIndex));button.setAttribute('aria-label',`${ui("view-material-25cccff8")} ${index+1}`);button.addEventListener('click',()=>{galleryIndex=index;renderGallery()});thumbs.appendChild(button)
      if(galleryItem&&typeof galleryItem==='object'&&!Array.isArray(galleryItem)&&(galleryItem.src||galleryItem.poster)){
        const thumb=doc.createElement('img');thumb.src=galleryItem.poster||galleryItem.src;thumb.alt='';thumb.loading='lazy';thumb.decoding='async';button.appendChild(thumb);
      }else{
        const labels=type==='experiment'?experimentArtifactLabels(key,index):projectArtifactLabels(key);
        const preview=element('span','gallery-thumb__preview');labels.slice(0,3).forEach(()=>preview.appendChild(element('i')));button.appendChild(preview);
      }
    });
    if(!prefersReduced.matches){
      const art=doc.getElementById('galleryArt');
      const copy=doc.querySelector('.gallery-copy-v45');
      art?.animate([{opacity:.35,transform:'translateX(8px)'},{opacity:1,transform:'none'}],{duration:220,easing:'cubic-bezier(.16,1,.3,1)'});
      copy?.animate([{opacity:.55,transform:'translateY(5px)'},{opacity:1,transform:'none'}],{duration:220,easing:'cubic-bezier(.16,1,.3,1)'});
    }
  }
  doc.getElementById('galleryPrev')?.addEventListener('click',()=>{if(!currentDetail)return;const data=currentDetail.type==='project'?DATA.projects[currentDetail.key]:currentDetail.type==='initiative'?{gallery:initiativeGallery}:DATA.experiments[currentDetail.key];galleryIndex=(galleryIndex-1+data.gallery.length)%data.gallery.length;renderGallery()});
  doc.getElementById('galleryNext')?.addEventListener('click',()=>{if(!currentDetail)return;const data=currentDetail.type==='project'?DATA.projects[currentDetail.key]:currentDetail.type==='initiative'?{gallery:initiativeGallery}:DATA.experiments[currentDetail.key];galleryIndex=(galleryIndex+1)%data.gallery.length;renderGallery()});

  function renderInfoGrid(targetId,items){
    const grid=doc.getElementById(targetId);grid?.classList.add('info-grid-v45');clear(grid);
    items.filter(([,value])=>Array.isArray(value)?value.some(line=>String(line||'').trim()):String(value||'').trim()).forEach(([label,value,slot])=>{
      const cell=element('div',slot?`info-grid-v45__${slot}`:'');
      const content=element('strong');
      if(Array.isArray(value))value.filter(line=>String(line||'').trim()).forEach(line=>content.append(element('span','info-grid-v45__line',line)));
      else safeText(content,value);
      cell.append(element('small','',label),content);grid.appendChild(cell);
    });
  }
  function renderTags(tags){const node=doc.getElementById('detailTags');clear(node);tags.forEach(tag=>node.appendChild(element('span','modal-tag',tag)))}
  function renderDeliveryStatus(value){
    const row=doc.getElementById('detailStatus');
    clear(row);
    const raw=String(value||'').trim();
    const text=raw?formatStatus(raw):'';
    row.hidden=!text;
    if(!text)return;
    const chip=element('span','detail-status__chip',text);
    const state=statusCategory(raw);
    if(state)chip.dataset.state=state;
    row.append(
      element('span','detail-status__label',ui("delivery-status-8365b679")),
      chip
    );
  }
  function renderProjectValue(value){
    const section=doc.querySelector('.project-value-v207');
    const headlineNode=doc.getElementById('projectValueHeadline');
    const supportingNode=doc.getElementById('projectValueSupporting');
    if(!section||!headlineNode||!supportingNode)return;
    section.hidden=false;
    const headline=typeof value==='object'?localize(value.headline):String(value||'').trim();
    const supporting=typeof value==='object'?localize(value.supportingStatement):'';
    safeText(headlineNode,headline||(lang==='zh'?headlineNode.dataset.placeholderZh:headlineNode.dataset.placeholderEn));
    safeText(supportingNode,supporting);
    supportingNode.hidden=!supporting;
    section.toggleAttribute('data-awaiting-content',!headline);
  }
  function cleanDecisionText(value){
    return String(value||'')
      .replace(/^(Alternative considered|Trade-off accepted|Trade-off)\s*[—–:\-]\s*/i,'')
      .replace(/^(曾考慮方案|接受的取捨|取捨)\s*[—–：:\-]\s*/,'')
      .trim();
  }
  const sectionContract=(owner,surface='canvas',required=false)=>({owner,surface,headingLevel:2,required});
  const CASE_STUDY_SECTION_REGISTRY={hero:sectionContract('hero','canvas',true),'value-i-brought':sectionContract('value','canvas',true),overview:sectionContract('overview','soft',true),'at-a-glance':sectionContract('overview','soft',true),'info-grid':sectionContract('overview','soft',true),'problem':sectionContract('problem','canvas',true),'critical-problem':sectionContract('problem','canvas',true),'why-it-mattered':sectionContract('problem'),'what-made-this-hard':sectionContract('complexity'),'core-system-insight':sectionContract('supplemental','canvas'),'key-decisions':sectionContract('decisions','soft'),'key-design-decisions':sectionContract('decisions','soft'),'business-impact':sectionContract('impact','soft'),'team-impact':sectionContract('impact','soft'),'validated-outcomes':sectionContract('impact','soft'),'shipped-outcomes':sectionContract('impact','soft'),'shipped-proof':sectionContract('impact','soft'),'conversion-evidence':sectionContract('impact','soft'),'delivery-proof':sectionContract('impact','soft'),'validation-and-launch':sectionContract('impact','soft'),'recommendation-evidence':sectionContract('impact','soft'),'delivery-and-measurement':sectionContract('delivery'),'confidentiality-note':sectionContract('delivery'),'status-and-disclosure':sectionContract('delivery'),'ownership-and-collaboration':sectionContract('ownership'),'ownership-and-evidence':sectionContract('ownership'),'my-contribution':sectionContract('ownership'),'continue-exploring':sectionContract('related','soft'),prototype:sectionContract('evidence','soft')};
  ['system-coverage-map','selected-shipped-evidence','future-vision','system-foundation','phased-validation-path','research-changed-the-model','product-scope','reusable-system','task-and-reward-model','shipped-experience','completion-evidence','operating-model','connected-trip-model','learning-and-entitlement-model','research-and-validation','released-product-scope','taishin-research-definition-model','research-and-specification-evidence','consultation-model','transaction-model','voucher-and-loyalty-integration','recognition','multi-route-transaction-model','five-phase-journey-map','initial-strategies','confidence-model','booking-pickup-research-strategy'].forEach((id,index)=>{CASE_STUDY_SECTION_REGISTRY[id]=sectionContract('supplemental',index%2?'canvas':'soft')});Object.assign(CASE_STUDY_SECTION_REGISTRY['core-system-insight'],{programmeOwner:'insight'});Object.assign(CASE_STUDY_SECTION_REGISTRY['system-coverage-map'],{programmeOwner:'journey'});Object.assign(CASE_STUDY_SECTION_REGISTRY['key-decisions'],{programmeOwner:'decisions'});Object.assign(CASE_STUDY_SECTION_REGISTRY['selected-shipped-evidence'],{programmeOwner:'shipped'});Object.assign(CASE_STUDY_SECTION_REGISTRY['future-vision'],{programmeOwner:'future'});Object.assign(CASE_STUDY_SECTION_REGISTRY['system-foundation'],{programmeOwner:'system'});Object.assign(CASE_STUDY_SECTION_REGISTRY['ownership-and-evidence'],{programmeOwner:'accountability'});
  const SECTION_LABELS={
    'core-system-insight':['Core system insight','核心系統洞察'],
    'evidence-to-strategy':['Evidence to strategy','從證據到策略'],
    'end-to-end-customer-journey':['End-to-end customer journey','端到端顧客旅程'],
    'selected-initiatives':['Selected initiatives','精選子專案'],
    'selected-shipped-evidence':['Selected shipped evidence','已上線證據'],
    'future-vision':['Future vision','未來方向'],
    'system-behind-the-journey':['System behind the journey','旅程背後的系統'],
    'product-evolution':['Product evolution','產品演進'],
    'research-evolution':['Research evolution','研究演進'],
    'shipped-scope':['Shipped scope','已上線範圍'],
    'future-direction':['Future direction','未來方向'],
    'visual-system-guardrail':['Visual system guardrail','視覺系統準則'],
    'system-foundation':['System foundation','系統基礎'],
    'validated-outcomes':['Validated outcomes','已驗證成果'],
    'research-scale':['Research scale','研究規模'],
    'operating-model':['Operating model','營運模型'],
    'prototype-proof':['Prototype proof','原型證據'],
    'programme-leadership':['Programme leadership','計畫領導'],
    'field-research':['Field research','實地研究'],
    'research-and-validation':['Research and validation','研究與驗證'],
    'operational-system-ownership':['Operational system ownership','營運系統責任'],
    'operational-readiness':['Operational readiness','營運準備度'],
    'delivery-and-measurement':['Delivery and measurement','交付與衡量'],
    'shipped-outcomes':['Shipped outcomes','已上線成果'],
    recognition:['Recognition','肯定'],
    'system-framing':['System framing','系統定義'],
    'delivery-proof':['Delivery proof','交付證據'],
    'operating-baseline':['Operating baseline','營運基準'],
    'workshop-prioritisation':['Workshop prioritisation','工作坊優先排序'],
    'user-entry-model':['User entry model','使用者進入模型'],
    'system-architecture':['System architecture','系統架構'],
    'transaction-model':['Transaction model','交易模型'],
    'voucher-and-loyalty-integration':['Voucher and loyalty integration','禮券與會員整合'],
    'consultation-model':['Consultation model','諮詢模型'],
    'multi-route-transaction-model':['Multi-route transaction model','多路徑交易模型']
  };
  const toCamel=value=>String(value).replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase());
  function contentPresentationSection(project,sectionId){
    return DATA.implementationContracts?.contentPresentationContract?.projects?.[project.project_id]?.sections?.[sectionId]||null;
  }
  function contentPresentationSources(project,sectionId){
    const projectContract=contentPresentationSection(project,sectionId);
    const shared=DATA.implementationContracts?.contentPresentationContract?.sharedSectionSources?.[sectionId]||[];
    return [...list(projectContract?.sourcePaths),...list(shared)];
  }
  function publicSectionValue(project,sectionId){
    for(const path of contentPresentationSources(project,sectionId)){
      const contracted=valueAtPath(project,path);
      if(contracted!=null)return contracted;
    }
    if(sectionId==='reusable-system')return project.publicContent?.systemFoundation??project.systemFoundation;
    const key=toCamel(sectionId);
    return project.publicContent?.[key]??project[key];
  }
  function publicSectionRows(value,depth=0){
    if(value==null||depth>3)return [];
    if(typeof value==='string'||typeof value==='number')return [String(value)];
    if(Array.isArray(value))return value.flatMap(item=>publicSectionRows(item,depth+1));
    if(typeof value==='object'){
      if('en' in value||'zh' in value){
        const text=localize(value);
        return text?[String(text)]:[];
      }
      const ignored=/^(?:id|type|contentStatus|implementationStatus|status|source|sourceId|sourceIds|assetId|assetIds|path|order|renderer|sectionOrder)$/i;
      return Object.entries(value).filter(([key])=>!ignored.test(key)).flatMap(([,item])=>publicSectionRows(item,depth+1));
    }
    return [];
  }
  function renderResearchScaleSection(value){
    if(!value||!Array.isArray(value.proof)||!value.proof.length)return null;
    const section=element('section','project-section-v81 research-scale-v185');
    section.dataset.projectSection='research-scale';
    const heading=element('div','research-scale-v185__heading');
    heading.appendChild(element('h3','',localize(value.title)||localize(SECTION_LABELS['research-scale'])));
    const summary=localize(value.summary);
    if(summary)heading.appendChild(element('p','',summary));
    section.appendChild(heading);
    const grid=element('div','research-scale-v185__grid');
    value.proof.forEach(item=>{
      const metric=element('article','research-scale-v185__item');
      metric.append(
        element('strong','research-scale-v185__value',localize(item.value)),
        element('span','research-scale-v185__label',localize(item.label))
      );
      grid.appendChild(metric);
    });
    section.appendChild(grid);
    const boundary=localize(value.claimBoundary);
    if(boundary)section.appendChild(element('p','research-scale-v185__note',boundary));
    return section;
  }
  function renderEditorialStatementSection(sectionId,value){
    if(!value||typeof value!=='object')return null;
    const statement=localize(value.title||value.statement);
    const supporting=localize(value.statement&&value.title?value.statement:value.supporting);
    if(!statement)return null;
    const section=element('section','project-section-v81 editorial-statement-v224');
    section.dataset.projectSection=sectionId;
    section.append(
      element('h3','',localize(SECTION_LABELS[sectionId])),
      element('p','editorial-statement-v224__statement',statement)
    );
    if(supporting)section.appendChild(element('p','editorial-statement-v224__supporting',supporting));
    return section;
  }
  function appendTextList(target,items,className='project-story-v198__list'){
    const values=list(items).map(item=>localize(item)).filter(Boolean);
    if(!values.length)return;
    const ul=element('ul',className);
    values.forEach(value=>ul.appendChild(element('li','',value)));
    target.appendChild(ul);
  }
  function storyCard(label,title,body,meta=''){
    const card=element('article','project-story-v198__card');
    if(label)card.appendChild(element('small','project-story-v198__label',label));
    if(title)card.appendChild(element('h4','',title));
    if(body)card.appendChild(element('p','',body));
    if(meta)card.appendChild(element('span','project-story-v198__meta',meta));
    return card;
  }
  function renderNarrativeProjectSection(sectionId,value){
    if(!value||typeof value!=='object')return null;
    const section=element('section',`project-section-v81 project-story-v198 project-story-v198--${sectionId}`);
    section.dataset.projectSection=sectionId;
    section.appendChild(element('h3','',localize(SECTION_LABELS[sectionId])));
    const intro=element('div','project-story-v198__intro');
    const label=localize(value.eyebrow||value.label);
    const title=localize(value.title);
    const summary=localize(value.summary);
    if(label)intro.appendChild(element('small','project-story-v198__label',label));
    if(title&&title!==localize(SECTION_LABELS[sectionId]))intro.appendChild(element('h4','',title));
    if(summary)intro.appendChild(element('p','',summary));
    if(intro.childElementCount)section.appendChild(intro);

    const grid=element('div','project-story-v198__grid');
    if(sectionId==='product-evolution'){
      const source=value.flashVoucherAddendum||{};
      const sourceTitle=localize(source.title);
      const sourceSummary=localize(source.atAGlance);
      if(sourceTitle||sourceSummary)grid.appendChild(storyCard(
        localize(source.eyebrow),
        sourceTitle,
        sourceSummary
      ));
    }
    if(sectionId==='research-evolution'){
      list(value.stages).forEach((stage,index)=>{
        const card=storyCard(
          localize(stage.label),
          localize(stage.focus),
          localize(stage.result),
          localize(stage.sample)
        );
        card.dataset.sequence=String(index+1).padStart(2,'0');
        grid.appendChild(card);
      });
    }
    if(sectionId==='future-direction'){
      const funnel=value.funnelEvidence||{};
      const comparison=localize(funnel.observationalComparison);
      if(comparison)grid.appendChild(storyCard(
        ui("observational-signal-defecd96"),'',comparison
      ));
      [funnel.drop1,funnel.drop2].filter(Boolean).forEach(drop=>{
        const rate=drop.dropOff||drop.withDetailsDropOff;
        grid.appendChild(storyCard(drop.stage,rate,localize(drop.interpretation)));
      });
      [value.phase1,value.phase2].filter(Boolean).forEach((phase,index)=>{
        const card=storyCard(
          `${ui("future-phase-4109197e")} ${index+1}`,
          phase.name,
          phase.focus
        );
        appendTextList(card,phase.concepts);
        grid.appendChild(card);
      });
    }
    if(sectionId==='visual-system-guardrail'){
      const shipped=storyCard(
        ui("shipped-direction-b0abc086"),
        localize(value.title),''
      );
      appendTextList(shipped,value.shippedDirection);
      grid.appendChild(shipped);
      const guardrails=storyCard(
        ui("claim-boundaries-6dbb2cfe"),
        ui("separate-shipped-and-future-states-4538887f"),''
      );
      appendTextList(guardrails,list(value.claimBoundary).slice(0,4));
      grid.appendChild(guardrails);
    }
    if(sectionId==='system-foundation'){
      list(value.evolution).forEach((item,index)=>{
        const card=storyCard(localize(item.label),localize(item.title),localize(item.content));
        card.dataset.sequence=String(index+1).padStart(2,'0');
        grid.appendChild(card);
      });
      if(!grid.childElementCount){
        const card=storyCard('',localize(value.title),'');
        appendTextList(card,value.items,'project-story-v198__capabilities');
        grid.appendChild(card);
      }
      const boundary=localize(value.ownership||value.contentBoundary);
      if(boundary)section.appendChild(element('p','project-story-v198__boundary',boundary));
    }
    if(grid.childElementCount)section.insertBefore(grid,section.querySelector('.project-story-v198__boundary'));
    return grid.childElementCount||intro.childElementCount?section:null;
  }
  function renderStructuredProjectSection(sectionId,value){
    if(!value||typeof value!=='object')return null;
    const section=element('section','project-section-v81 structured-evidence-v223');
    section.dataset.projectSection=sectionId;
    section.appendChild(element('h3','',localize(SECTION_LABELS[sectionId]||[sectionId.replaceAll('-',' '),sectionId.replaceAll('-',' ')])));

    const intro=element('div','structured-evidence-v223__intro');
    const title=localize(value.title);
    const summary=localize(value.summary);
    if(title)intro.appendChild(element('h4','',title));
    if(summary)intro.appendChild(element('p','',summary));
    if(intro.childElementCount)section.appendChild(intro);

    const proof=list(value.proof);
    if(proof.length){
      const metrics=element('dl','structured-evidence-v223__metrics');
      proof.forEach(item=>{
        const label=localize(item.label);
        const metricValue=localize(item.value||item.content);
        if(!label||!metricValue)return;
        const pair=element('div','structured-evidence-v223__metric');
        pair.append(
          element('dt','',label),
          element('dd','',metricValue)
        );
        metrics.appendChild(pair);
      });
      if(metrics.childElementCount)section.appendChild(metrics);
    }

    const groups=list(value.capabilityGroups);
    if(groups.length){
      const grid=element('div','structured-evidence-v223__groups');
      groups.forEach(group=>{
        const card=element('article','structured-evidence-v223__group');
        card.appendChild(element('h4','',localize(group.label)));
        appendTextList(card,group.coverage,'structured-evidence-v223__list');
        grid.appendChild(card);
      });
      section.appendChild(grid);
    }

    const boundary=localize(value.shipmentBoundary);
    if(boundary)section.appendChild(element('p','structured-evidence-v223__boundary',boundary));
    if(section.childElementCount===1){
      const rows=[...new Set(publicSectionRows(value).map(item=>item.trim()).filter(Boolean))].slice(0,8);
      if(rows.length){
        const fallback=element('div','structured-evidence-v223__editorial');
        rows.forEach(row=>fallback.appendChild(element('p','',row)));
        section.appendChild(fallback);
      }
    }
    return section.childElementCount>1?section:null;
  }
  function humaniseDeliveryStatus(value){
    const text=String(value||'').trim();
    if(!text)return '';
    return text
      .replace(/[-_]+/g,' ')
      .replace(/\b([a-z])/g,letter=>letter.toUpperCase());
  }
  function humaniseEvidenceCopy(value){
    const text=String(value||'').trim();
    if(!text)return '';
    const letters=text.replace(/[^A-Za-z]/g,'');
    const capitals=(letters.match(/[A-Z]/g)||[]).length;
    if(letters.length>6&&capitals/letters.length>.82){
      return text.charAt(0).toUpperCase()+text.slice(1).toLowerCase();
    }
    return text;
  }
  function embeddedOutcomeMetric(text){
    const arabic=text.match(/(?:\ball\s+|\bacross\s+)?([~≈]?\s*\d[\d,.]*\+?(?:%|\/\d+)?(?:\s*(?:markets?|countries|users?|participants?|stores?|rides?|workshops?|roles?|journeys?|cases?|teams?|days?|months?|years?))?)/i);
    if(arabic)return arabic[1].replace(/\s+/g,' ').trim();
    const chinese=text.match(/([~≈]?(?:\d[\d,.+]*|[零〇一二兩三四五六七八九十百千萬]+)(?:個)?(?:市場|國家|使用者|參與者|門市|趟|場|角色|旅程|案件|團隊|天|日|月|年))/);
    return chinese?chinese[1]:'';
  }
  function appendEvidenceValue(card,value){
    const text=humaniseEvidenceCopy(value);
    const segments=text.split(/\s*[·•]\s*/).map(item=>item.trim()).filter(Boolean);
    const metrics=segments.map(segment=>{
      const match=segment.match(/^([~≈]?\s*[\d,.]+(?:%|\/\d+)?)\s+(.+)$/);
      return match?[match[1].replace(/\s+/g,''),match[2]]:null;
    });
    if(metrics.length&&metrics.every(Boolean)){
      const cluster=element('div','recruiter-proof-item-v46__metrics');
      metrics.forEach(([metric,label])=>{
        const item=element('span','recruiter-proof-item-v46__metric');
        item.append(
          element('strong','recruiter-proof-item-v46__metric-value',metric),
          element('span','recruiter-proof-item-v46__metric-label',label)
        );
        cluster.appendChild(item);
      });
      card.appendChild(cluster);
      return;
    }
    const embeddedMetric=embeddedOutcomeMetric(text);
    if(embeddedMetric){
      const cluster=element('div','recruiter-proof-item-v46__metrics');
      const item=element('span','recruiter-proof-item-v46__metric');
      item.append(
        element('strong','recruiter-proof-item-v46__metric-value',embeddedMetric),
        element('span','recruiter-proof-item-v46__metric-label recruiter-proof-item-v46__metric-label--statement',text)
      );
      cluster.appendChild(item);
      card.appendChild(cluster);
      return;
    }
    card.appendChild(element('strong','recruiter-proof-item-v46__statement',text));
  }
  function publicOutcomeSignals(project){
    const governed=list(project.outcome_evidence_model)
      .map((item,index)=>{
        if(!item||['private','blocked'].includes(item.publicUse))return null;
        const sourceField=item.claim?'claim':item.publicValue?'publicValue':item.values?'values':'';
        const value=localize(item.claim)||localize(item.publicValue)||list(item.values).map(localize).filter(Boolean).join(' · ');
        if(!sourceField||!value)return null;
        return {item,index,value,sourcePath:`outcomeEvidenceModel.${index}.${sourceField}`};
      })
      .filter(Boolean);
    if(governed.length)return governed;
    const fallback=[];
    const completion=project.publicContent?.completionEvidence;
    if(completion?.publicValue&&completion?.label){
      fallback.push({
        item:{outcomeType:{en:'Completion evidence',zh:'完成證據'}},
        value:`${String(completion.publicValue)} ${localize(completion.label)}`.trim(),
        sourcePath:'publicContent.completionEvidence.publicValue+label'
      });
    }
    const walk=(value,path)=>{
      if(!value||fallback.length>=4)return;
      if(value&&typeof value==='object'&&!Array.isArray(value)&&typeof value.en==='string'&&typeof value.zh==='string'){
        const copy=localize(value);
        if(copy&&value.en.length>=8&&value.zh.length>=8&&!path.endsWith('.label'))fallback.push({item:{outcomeType:{en:'Completion evidence',zh:'完成證據'}},value:copy,sourcePath:path});
        return;
      }
      if(Array.isArray(value))value.forEach((item,index)=>walk(item,`${path}.${index}`));
      else if(typeof value==='object')Object.entries(value).forEach(([key,item])=>walk(item,`${path}.${key}`));
    };
    walk(project.publicContent?.completionEvidence,'publicContent.completionEvidence');
    return fallback;
  }
  function renderImpactEvidence(project,node,section,deliverySection){
    const model=project.impact_evidence;
    const signals=publicOutcomeSignals(project);
    if(!model||!signals.length)return false;
    const labels=DATA.implementationContracts?.impactEvidenceLabels||{};
    const shell=element('div',`impact-evidence-v147 impact-evidence-v147--${model.variant||'scale-and-system-change'}`);
    shell.dataset.impactVariant=model.variant||'';
    shell.dataset.recruiterOutcome='visible';
    shell.dataset.outcomeExactProjection='true';
    const primary=signals[0];
    const heading=element('div','impact-evidence-v147__heading');
    heading.append(
      element('span','impact-evidence-v147__eyebrow',lang==='zh'?'主要成果':'Primary outcome'),
      element('h3','impact-evidence-v147__primary',primary.value)
    );
    heading.querySelector('h3').dataset.outcomeSourcePath=primary.sourcePath;
    shell.append(heading);
    const metrics=element('dl','impact-evidence-v147__metrics');
    signals.slice(1,4).forEach(signal=>{
      const metric=element('div','impact-evidence-v147__metric');
      metric.dataset.outcomeSourcePath=signal.sourcePath;
      metric.append(
        element('dt','',localize(signal.item.outcomeType)||localize(labels[model.variant])||(lang==='zh'?'成果證據':'Outcome evidence')),
        element('dd','',signal.value)
      );
      metrics.append(metric);
    });
    if(metrics.childElementCount)shell.append(metrics);
    const businessImpact=localize(project.businessImpact)||localize(project.impact_pair);
    if(businessImpact&&businessImpact!==primary.value){
      const impact=element('div','impact-evidence-v147__business-impact');
      impact.append(
        element('span','impact-evidence-v147__eyebrow',lang==='zh'?'商業影響':'Business impact'),
        element('p','',businessImpact)
      );
      shell.append(impact);
    }
    const boundary=localize(project.confidentialityNote)||localize(project.confidentiality_note);
    if(boundary){
      const note=element('p','impact-evidence-v147__boundary',boundary);
      shell.append(note);
    }
    node.append(shell);
    section.hidden=false;
    return true;
  }

  function refreshVisibleOutcomeProjection(project){
    if(!project)return;
    const values=new Map(publicOutcomeSignals(project).map(signal=>[signal.sourcePath,signal.value]));
    doc.querySelectorAll('[data-outcome-source-path]').forEach(node=>{
      const value=values.get(node.dataset.outcomeSourcePath);
      if(!value)return;
      const target=node.matches('div')?node.querySelector('dd'):node;
      if(target)safeText(target,value);
    });
    doc.querySelectorAll('.case-study-section[data-recruiter-outcome-section="visible"]').forEach(section=>{
      const title=section.querySelector(':scope > .case-study-section__header h2');
      if(title)safeText(title,lang==='zh'?'成果':'Outcomes');
      const impactLabel=section.querySelector('.case-study-impact-copy__label');
      if(impactLabel)safeText(impactLabel,lang==='zh'?'商業影響':'Business impact');
    });
  }
  function renderDeliveryOutcomes(project){
    const node=doc.getElementById('recruiterProof');
    const section=node?.closest('article');
    const deliverySection=section?.closest('.delivery-grid-v45');
    if(!node||!section)return;
    clear(node);
    section.querySelector('.delivery-measurement-boundary')?.remove();
    if(renderImpactEvidence(project,node,section,deliverySection))return;
    const highlights=project.delivery_highlights;
    if(highlights&&Array.isArray(highlights.items)){
      highlights.items.forEach(item=>{
        const label=localize(item.label);
        const detail=localize(item.detail);
        if(!item.value||!label||!detail)return;
        const card=element('article','recruiter-proof-item-v46 is-delivery-highlight');
        card.append(
          element('strong','recruiter-proof-item-v46__metric-value',String(item.value)),
          element('span','recruiter-proof-item-v46__metric-label',label),
          element('span','recruiter-proof-item-v46__source',detail)
        );
        node.appendChild(card);
      });
      const boundary=localize(highlights.measurementBoundary);
      if(boundary){
        const note=element('p','delivery-measurement-boundary',boundary);
        node.after(note);
      }
      section.hidden=!node.childElementCount;
      if(deliverySection)deliverySection.hidden=!node.childElementCount;
      return;
    }
    const evidenceModel=list(project.outcome_evidence_model).filter(item=>item&&item.publicUse!=='private');
    if(evidenceModel.length){
      const tierLabels={
        A:ui("product-outcome-9ead1ca3"),
        B:ui("behaviour-evidence-b887db72"),
        C:ui("shipped-adoption-d6f439f1"),
        'A-private':ui("confidential-outcome-9b3b13ca")
      };
      evidenceModel.slice(0,4).forEach(item=>{
        const value=localize(item.claim)||localize(item.publicValue)||list(item.values).map(localize).filter(Boolean).join(' · ');
        if(!value)return;
        const card=element('article',`recruiter-proof-item-v46 is-tier-${String(item.tier||'evidence').toLowerCase().replace(/[^a-z]+/g,'-')}`);
        card.appendChild(element('small','',localize(item.outcomeType)||tierLabels[item.tier]||(ui("outcome-evidence-862c533c"))));
        appendEvidenceValue(card,value);
        const metadata=[item.caveat,item.attribution,item.source,item.sourceType].find(candidate=>candidate&&(typeof candidate==='object'||lang!=='zh'));
        const boundary=localize(metadata);
        if(boundary)card.append(element('span','recruiter-proof-item-v46__source',boundary));
        node.appendChild(card);
      });
      section.hidden=!node.childElementCount;
      if(deliverySection){
        const reflectionArticle=doc.getElementById('projectReflection')?.closest('article');
        if(reflectionArticle)reflectionArticle.hidden=true;
        deliverySection.hidden=!node.childElementCount;
      }
      return;
    }
    const validated=localize(project.businessImpact?.validationOutcome);
    const publicValues=[
      publicSectionValue(project,'validated-outcomes'),
      publicSectionValue(project,'shipped-outcomes'),
      publicSectionValue(project,'delivery-proof'),
      publicSectionValue(project,'delivery-and-measurement'),
      publicSectionValue(project,'outcome'),
      publicSectionValue(project,'outcomes'),
      publicSectionValue(project,'primary-outcome'),
      publicSectionValue(project,'delivery-evolution'),
      publicSectionValue(project,'selected-shipped-proofs'),
      publicSectionValue(project,'shipped-scope')
    ];
    const confirmedDelivery=publicSectionRows(project.deliveryBoundary?.confirmed).slice(-2);
    const systemOutcome=localize(project.businessImpact);
    const outcomes=[validated,...publicValues.flatMap(value=>publicSectionRows(value)),...confirmedDelivery,systemOutcome]
      .map(value=>String(value||'').trim())
      .filter(Boolean);
    const uniqueOutcomes=[...new Set(outcomes)];
    const delivery=humaniseDeliveryStatus(project.status||project.contentStatus);
    const boundary=localize(project.businessImpact?.claimBoundary)||
      localize(project.deliveryBoundary?.claimBoundary)||
      localize(project.publicContent?.deliveryAndMeasurement?.claimBoundary);
    const cards=[];
    if(delivery)cards.push([ui("delivery-1866660c"),delivery,'is-delivery']);
    if(uniqueOutcomes[0])cards.push([ui("validated-outcome-ee3013f0"),humaniseEvidenceCopy(uniqueOutcomes[0]),'is-outcome']);
    if(uniqueOutcomes[1])cards.push([ui("additional-outcome-signal-105dfab8"),humaniseEvidenceCopy(uniqueOutcomes[1]),'is-evidence']);
    if(boundary)cards.push([ui("measurement-boundary-72fa7f84"),humaniseEvidenceCopy(boundary),'is-boundary']);
    cards.slice(0,4).forEach(([label,value,variant])=>{
      const card=element('article',`recruiter-proof-item-v46 ${variant}`);
      card.appendChild(element('small','',label));
      appendEvidenceValue(card,value);
      node.appendChild(card);
    });
    section.hidden=!node.childElementCount;
    if(deliverySection){
      const reflectionArticle=doc.getElementById('projectReflection')?.closest('article');
      if(reflectionArticle)reflectionArticle.hidden=true;
      deliverySection.hidden=!node.childElementCount;
    }
  }
  function renderVoucherPhaseSection(value){
    if(!value||!list(value.stages).length)return null;
    const section=element('section','project-section-v81 project-story-v198 project-story-v198--phased-validation-path');
    section.dataset.projectSection='phased-validation-path';
    section.appendChild(element('h3','',localize(value.title)));
    const grid=element('div','project-story-v198__grid');
    list(value.stages).forEach((stage,index)=>{
      const card=storyCard(localize(stage.label),localize(stage.role),localize(stage.evidence));
      const boundary=localize(stage.boundary);
      if(boundary)card.appendChild(element('p','project-story-v198__boundary',boundary));
      card.dataset.sequence=String(index+1).padStart(2,'0');
      grid.appendChild(card);
    });
    section.appendChild(grid);return section;
  }
  function renderVoucherResearchSection(value){
    if(!value||!value.study)return null;
    const section=element('section','project-section-v81 structured-evidence-v223');
    section.dataset.projectSection='research-changed-the-model';
    section.appendChild(element('h3','',localize(value.title)));
    const metrics=element('dl','structured-evidence-v223__metrics');
    list(value.study.evidence).forEach(item=>{
      const row=element('div','structured-evidence-v223__metric');
      row.append(element('dt','',item.value),element('dd','',localize(item)));
      metrics.appendChild(row);
    });
    section.appendChild(metrics);
    const grid=element('div','project-story-v198__grid');
    grid.append(
      storyCard('',ui("interpretation-90a60677"),localize(value.interpretation)),
      storyCard('',ui("decision-2b39b948"),localize(value.productChange))
    );
    section.appendChild(grid);return section;
  }
  function renderProductScopeSection(value){
    if(!value)return null;
    const section=element('section','project-section-v81 project-story-v198 project-story-v198--product-scope');
    section.dataset.projectSection='product-scope';
    section.appendChild(element('h3','',lang==='zh'?'已上線／下一步':'Shipped / Next'));
    const grid=element('div','project-story-v198__grid');
    const shipped=storyCard('',localize(SECTION_LABELS['shipped-scope']),'');
    appendTextList(shipped,value.confirmedShipped);
    grid.appendChild(shipped);
    const next=storyCard('',localize(SECTION_LABELS['future-direction']),'');
    list(value.nextDirection).forEach(item=>next.appendChild(storyCard(item.evidence,'',localize(item))));
    appendTextList(next,value.notShipped);
    grid.appendChild(next);
    section.appendChild(grid);return section;
  }
  function renderRegisteredProjectSections(project){
    const host=doc.getElementById('projectSupplementalSections');
    if(!host)return;
    doc.querySelectorAll('#projectEvidence > [data-project-section]').forEach(node=>node.remove());
    clear(host);
    const order=[...new Set(project.section_order||[])];
    order.forEach(sectionId=>{
      const contract=CASE_STUDY_SECTION_REGISTRY[sectionId];if(!contract){console.warn(`[CaseStudySection] Unknown canonical section "${sectionId}"; no implicit renderer was used.`);return}if(contract.owner!=='supplemental')return;
      // The project overview already owns the five-second summary. Repeating the
      // same problem / strategy / outcome as detached cards weakens the scan path.
      if(sectionId==='executive-summary')return;
      if([
        'validated-outcomes','shipped-outcomes','delivery-proof','delivery-and-measurement',
        'outcome','outcomes','primary-outcome','delivery-evolution','selected-shipped-proofs','shipped-scope'
      ].includes(sectionId))return;
      if(sectionId==='phased-validation-path'){
        const section=renderVoucherPhaseSection(publicSectionValue(project,sectionId));
        if(section)host.appendChild(section);
        return;
      }
      if(sectionId==='research-changed-the-model'){
        const section=renderVoucherResearchSection(publicSectionValue(project,sectionId));
        if(section)host.appendChild(section);
        return;
      }
      if(sectionId==='product-scope'){
        const section=renderProductScopeSection(publicSectionValue(project,sectionId));
        if(section)host.appendChild(section);
        return;
      }
      if(sectionId==='research-scale'){
        const section=renderResearchScaleSection(publicSectionValue(project,sectionId));
        if(section)host.appendChild(section);
        return;
      }
      if(sectionId==='core-system-insight'){
        const section=renderEditorialStatementSection(sectionId,publicSectionValue(project,sectionId));
        if(section)host.appendChild(section);
        return;
      }
      if(sectionId==='system-evidence'){
        const value=publicSectionValue(project,sectionId);
        if(!value||!Array.isArray(value.items)||!value.items.length)return;
        const section=element('section','project-system-change-v214');
        section.dataset.projectSection=sectionId;
        const heading=element('div','project-system-change-v214__heading');
        heading.append(
          element('span','project-system-change-v214__eyebrow',ui("system-change-55d34fbe")),
          element('h3','',localize(value.title)||localize(SECTION_LABELS[sectionId]))
        );
        const listNode=element('div','project-system-change-v214__list');
        value.items.forEach(item=>{
          const row=element('article','project-system-change-v214__row');
          const before=element('div','project-system-change-v214__state is-before');
          before.append(
            element('span','',ui("before-4c8e2fbf")),
            element('p','',localize(item.before)||item.before)
          );
          const after=element('div','project-system-change-v214__state is-after');
          after.append(
            element('span','',ui("after-146cbe2c")),
            element('p','',localize(item.after)||item.after)
          );
          row.append(
            element('h4','',localize(item.label)||item.label),
            before,
            element('span','project-system-change-v214__arrow','→'),
            after
          );
          row.querySelector('.project-system-change-v214__arrow')?.setAttribute('aria-hidden','true');
          listNode.appendChild(row);
        });
        section.append(heading,listNode);
        host.appendChild(section);
        return;
      }
      if(['product-evolution','research-evolution','future-direction','visual-system-guardrail','system-foundation','reusable-system'].includes(sectionId)){
        const narrativeId=sectionId==='reusable-system'?'system-foundation':sectionId;
        const section=renderNarrativeProjectSection(narrativeId,publicSectionValue(project,sectionId));
        if(section){section.dataset.projectSection=sectionId;host.appendChild(section)}
        return;
      }
      const source=publicSectionValue(project,sectionId);
      if(source&&typeof source==='object'){
        const structured=renderStructuredProjectSection(sectionId,source);
        if(structured)host.appendChild(structured);
        return;
      }
      const rows=[...new Set(publicSectionRows(source).map(text=>text.trim()).filter(Boolean))];
      if(!rows.length)return;
      const section=element('section','project-section-v81');
      section.dataset.projectSection=sectionId;
      section.appendChild(element('h3','',localize(SECTION_LABELS[sectionId]||[sectionId.replaceAll('-',' '),sectionId.replaceAll('-',' ')])));
      const grid=element('div','project-section-v81__grid');
      rows.slice(0,8).forEach(text=>grid.appendChild(element('p','',text)));
      section.appendChild(grid);host.appendChild(section);
    });
    host.hidden=!host.childElementCount;
  }
  function caseStudySection(node,id,surface='canvas'){if(!node)return null;node.classList.remove('case-study-section--canvas','case-study-section--soft','case-study-section--emphasis');node.classList.add('case-study-section',`case-study-section--${surface}`);node.dataset.caseStudySection=id;return node}
  function caseStudyHeader(node,index=''){if(!node)return;const governed=node.matches('.case-study-section__header')?node:node.querySelector(':scope > .case-study-section__header');if(governed){const eyebrow=governed.querySelector('.case-study-section__eyebrow');if(index&&eyebrow)safeText(eyebrow,index);return}const existing=node.matches('.section-heading-v45')?node:node.querySelector(':scope > .section-heading-v45');const header=existing||node.querySelector(':scope > h2, :scope > h3, :scope > h4')||node.querySelector('h2, h3, h4');if(!header)return;if(existing){existing.classList.add('case-study-section__header');const eyebrow=existing.querySelector('.case-study-section__eyebrow');if(index&&eyebrow)safeText(eyebrow,index);else if(index)existing.prepend(element('span','case-study-section__eyebrow',index));const title=existing.querySelector('h3, h4');if(title){const h2=element('h2',title.className,title.textContent);for(const attr of title.attributes)if(attr.name!=='class')h2.setAttribute(attr.name,attr.value);title.replaceWith(h2)}return}if(header.matches('h3, h4')){const h2=element('h2',header.className,header.textContent);for(const attr of header.attributes)if(attr.name!=='class')h2.setAttribute(attr.name,attr.value);header.replaceWith(h2)}const title=node.querySelector(':scope > h2')||node.querySelector('h2');if(!title)return;const wrapper=element('div','case-study-section__header');if(index)wrapper.appendChild(element('span','case-study-section__eyebrow',index));node.prepend(wrapper);wrapper.appendChild(title)}
  function applyCaseStudySectionSystem(project){const evidence=doc.getElementById('projectEvidence'),overview=doc.getElementById('projectOverviewSection'),value=doc.querySelector('.project-value-v207');const context=overview?.querySelector('.project-context-v45--overview');const problem=context?.querySelector('article:first-child')||doc.querySelector('.case-study-problem');const impactCopy=context?.querySelector('article:nth-child(2)')||doc.querySelector('.case-study-impact-copy');const complexity=doc.getElementById('projectComplexitySection'),intervention=doc.getElementById('projectKeyIntervention'),decisions=doc.getElementById('projectDecisionsSection'),impact=doc.getElementById('projectImpactSection'),ownership=doc.querySelector('.ownership-section-v45'),delivery=doc.querySelector('.delivery-grid-v45'),related=doc.getElementById('detailRelated'),gallery=doc.getElementById('sharedGallery');if(!evidence||!overview)return;caseStudySection(value,'value-i-brought');caseStudySection(overview,'overview','soft');if(problem){problem.classList.add('case-study-problem');caseStudySection(problem,'critical-problem')}if(impactCopy){impactCopy.classList.add('case-study-impact-copy');impact?.prepend(impactCopy)}const impactEvidence=doc.querySelector('.impact-evidence-v147');if(impactEvidence)impact?.appendChild(impactEvidence);caseStudySection(complexity,'what-made-this-hard');caseStudySection(decisions,'key-decisions','soft');caseStudySection(gallery,'evidence','soft');caseStudySection(impact,'impact','soft');caseStudySection(ownership,'ownership');caseStudySection(delivery,'delivery');caseStudySection(related,'related','soft');const supplemental=[...doc.querySelectorAll('#projectSupplementalSections > [data-project-section]')];supplemental.forEach(section=>caseStudySection(section,section.dataset.projectSection,CASE_STUDY_SECTION_REGISTRY[section.dataset.projectSection]?.surface||'canvas'));if(intervention&&!intervention.hidden&&supplemental[0]){intervention.classList.remove('case-study-section','case-study-section--soft');intervention.dataset.caseStudyComponent='key-intervention';supplemental[0].appendChild(intervention)}const owners={problem,complexity,decisions,impact,ownership,delivery,related,evidence:gallery},candidates=[problem,complexity,...supplemental,decisions,gallery,impact,ownership,delivery,related].filter(Boolean),renderable=new Set(candidates.filter(node=>!node.hidden)),appended=new Set(),ordered=[],mapped=[];candidates.forEach(node=>{node.hidden=true;delete node.dataset.canonicalSectionId});const canonicalOrder=[...new Set(project.section_order||[])];const canonicalOwners=new Set(canonicalOrder.map(sectionId=>CASE_STUDY_SECTION_REGISTRY[sectionId]?.owner).filter(Boolean));for(const owner of new Set(Object.values(CASE_STUDY_SECTION_REGISTRY).filter(contract=>contract.required&&!['hero','value','overview'].includes(contract.owner)).map(contract=>contract.owner))){if(!canonicalOwners.has(owner))console.warn(`[CaseStudySection] Required owner "${owner}" is missing from canonical sectionOrder.`)}for(const sectionId of canonicalOrder){const contract=CASE_STUDY_SECTION_REGISTRY[sectionId];if(!contract){console.warn(`[CaseStudySection] Unknown canonical section "${sectionId}"; no implicit renderer was used.`);continue}if(['hero','value','overview'].includes(contract.owner))continue;let node;if(contract.owner==='supplemental')node=supplemental.find(item=>item.dataset.projectSection===sectionId);else node=owners[contract.owner];if(!node||!renderable.has(node)||appended.has(node))continue;node.hidden=false;node.dataset.canonicalSectionId=sectionId;node.dataset.contentBlockIds=contentPresentationSources(project,sectionId).join('|');ordered.push(node);mapped.push(sectionId);appended.add(node)}if(impactEvidence&&!appended.has(impact)){impact.hidden=false;impact.dataset.recruiterSectionId='outcomes';const ownershipIndex=ordered.indexOf(ownership);if(ownershipIndex>=0)ordered.splice(ownershipIndex,0,impact);else ordered.push(impact);appended.add(impact)}ordered.forEach(node=>evidence.appendChild(node));evidence.querySelectorAll('[data-canonical-section-id]').forEach(node=>{if(!ordered.includes(node))delete node.dataset.canonicalSectionId});ordered.filter(node=>!node.hidden).forEach((node,index)=>caseStudyHeader(node,String(index+3).padStart(2,'0')));if(appended.has(impact)){const outcomeTitle=impact.querySelector(':scope > .case-study-section__header h2');if(outcomeTitle)safeText(outcomeTitle,lang==='zh'?'成果':'Outcomes');if(impactCopy&&!impactCopy.querySelector(':scope > .case-study-impact-copy__label'))impactCopy.prepend(element('span','case-study-impact-copy__label',lang==='zh'?'商業影響':'Business impact'));impact.dataset.recruiterOutcomeSection='visible'}caseStudyHeader(value,'01 · VALUE I BROUGHT');const summary=overview.querySelector('.project-summary-v45');if(summary)caseStudyHeader(summary,'02 · OVERVIEW');evidence.dataset.canonicalSectionOrder=canonicalOrder.join(' ');evidence.dataset.mappedCanonicalSectionOrder=mapped.join(' ');const cleanupDirectRouteCanonical=()=>{const directSurface=doc.getElementById('programmeSurface');if(evidence.closest('[hidden]')&&directSurface&&!directSurface.hidden&&directSurface.getClientRects().length)evidence.querySelectorAll('[data-canonical-section-id]').forEach(node=>delete node.dataset.canonicalSectionId)};cleanupDirectRouteCanonical();requestAnimationFrame(cleanupDirectRouteCanonical)}
  function renderKeyInterventionMap(project){
    const section=doc.getElementById('projectKeyIntervention');
    const flow=doc.getElementById('projectKeyInterventionFlow');
    const supporting=doc.getElementById('projectKeyInterventionSupporting');
    if(!section||!flow||!supporting)return;
    clear(flow);
    const map=project.key_intervention_map;
    const status=String(map?.status||'');
    const fields=[map?.before,map?.intervention,map?.after];
    const isVerified=status.startsWith('verified')&&fields.every(value=>String(localize(value)||'').trim());
    section.hidden=!isVerified;
    if(!isVerified){safeText(supporting,'');return}
    safeText(section.querySelector('.key-intervention-map__title'),lang==='zh'?'系統轉變關鍵':localize(map.sectionLabel));
    const stages=[
      [{en:'Before',zh:'原始狀態'},map.before,'is-before'],
      [{en:'Key intervention',zh:'關鍵介入'},map.intervention,'is-intervention'],
      [{en:'After',zh:'建立後'},map.after,'is-after']
    ];
    stages.forEach(([label,value,variant],index)=>{
      const item=element('article',`key-intervention-map__node ${variant}`);
      item.append(
        element('span','key-intervention-map__label',localize(label)),
        element('p','',localize(value))
      );
      flow.appendChild(item);
      if(index<stages.length-1){
        const connector=element('span','key-intervention-map__connector','→');
        connector.setAttribute('aria-hidden','true');
        flow.appendChild(connector);
      }
    });
    safeText(supporting,localize(map.supportingCopy));
  }
  const TEAM_IMPACT_LABELS={
    dbs:[['Alignment','團隊對齊'],['Delivery','交付'],['Operations','營運']],
    voucher:[['Strategy','策略'],['System','系統'],['Adoption','沿用']],
    booking:[['Product','產品'],['Localisation','在地化'],['Engineering','工程']],
    payment:[['Transaction visibility','交易可見性'],['Recovery visibility','復原可見性'],['Operational planning','營運規劃']],
    bandzo:[['Learning model','學習模型'],['Feedback','回饋'],['Cross-device','跨裝置']]
  };
  function renderTeamImpact(projectKey,project){
    const node=doc.getElementById('crossImpact');clear(node);
    const section=node?.closest('article');
    const labels=TEAM_IMPACT_LABELS[projectKey]||[];
    project.recruiter.cross.forEach((pair,index)=>{
      const item=element('article','team-impact-item-v47');
      item.append(
        element('span','team-impact-role-v47',localize(labels[index]||[ui("impact-0e223a77"),ui("impact-0e223a77")])),
        element('p','',localize(pair))
      );
      node.appendChild(item);
    });
    if(section)section.hidden=!node.childElementCount;
  }

  function createDecisionCard(decision,index,{projectKey='',showVisual=true}={}){
    const card=element('article','decision-card-v46');
    const number=element('span','decision-number-v48',`${ui("decision-3649f9fa")} ${String(index+1).padStart(2,'0')}`);
    const body=element('div','decision-body-v46');
    const title=localize([decision.title,decision.title_zh]);
    const changed=localize([decision.result||decision.whatIDecided,decision.result_zh]);
    const rationale=localize([decision.evidence||decision.why||decision.whyThisChoice,decision.evidence_zh||decision.why_zh]);
    body.append(element('h4','',title));
    const problem=localize([decision.problem,decision.problem_zh]);
    if(problem){
      const block=element('div','decision-problem-v147');
      block.append(element('span','decision-field-label-v58',lang==='zh'?'問題':'PROBLEM'),element('p','',problem));
      body.append(block);
    }
    if(changed){
      const result=element('div','decision-result-block-v58');
      result.append(
        element('span','decision-field-label-v58',lang==='zh'?'決策':'DECISION'),
        element('p','decision-result-v46',changed)
      );
      body.append(result);
    }
    if(rationale){
      const evidence=element('div','decision-evidence-v58');
      evidence.append(
        element('span','decision-field-label-v58',ui("why-this-choice-76f54207")),
        element('p','',rationale)
      );
      body.append(evidence);
    }
    const effectText=localize([decision.effect,decision.effect_zh]);
    if(effectText){
      const effect=element('div','decision-effect-v147');
      effect.append(element('span','decision-field-label-v58',localize(DATA.implementationContracts?.designDecisionLabels?.effect)),element('p','',effectText));
      body.append(effect);
    }
    const considerations=element('dl','decision-considerations-v46');
    const optional=decision.optionalBlock||{};
    const tradeoffText=cleanDecisionText(localize(optional.content||[decision.tradeoff,decision.tradeoff_zh]));
    if(tradeoffText){
      const optionalType=optional.type||decision.optional_block_type;
      const optionalLabel={
        'required':ui("what-this-required-218ee435"),
        'WHAT THIS REQUIRED':ui("what-this-required-218ee435"),
        'constraint':ui("constraint-managed-78a44d2e"),
        'CONSTRAINT MANAGED':ui("constraint-managed-78a44d2e"),
        'RISK MANAGED':ui("risk-managed-ab511c88"),
        'TRADE-OFF ACCEPTED':ui("trade-off-accepted-29c76c94")
      }[optionalType]||(ui("trade-off-accepted-29c76c94"));
      const tradeoff=element('div');
      tradeoff.append(element('dt','',optionalLabel),element('dd','',tradeoffText));
      considerations.append(tradeoff);
    }
    if(considerations.childElementCount)body.append(considerations);
    const deliveryBoundary=localize([decision.deliveryBoundary,decision.deliveryBoundary_zh]);
    if(deliveryBoundary){
      const boundary=element('div','decision-delivery-boundary-v147');
      boundary.append(element('span','decision-field-label-v58',ui("delivery-boundary-c71a736f")),element('p','',deliveryBoundary));
      body.append(boundary);
    }
    const ownership=localize(decision.ownershipDetail);
    if(ownership){
      const ownershipBlock=element('div','decision-ownership-v83');
      const ownershipLabel={
        led:ui("led-by-me-de65c5ac"),
        'co-led':ui("co-led-cf15c90a"),
        'co-decided':ui("co-decided-3c254067")
      }[decision.ownership]||(ui("ownership-47ffa2b6"));
      ownershipBlock.append(element('span','decision-field-label-v58',ownershipLabel),element('p','',ownership));
      body.append(ownershipBlock);
    }
    card.append(number,body);
    if(showVisual&&projectKey){
      const visual=element('figure','decision-visual-v58');
      const visualArt=element('div','decision-visual-v67__crop');
      const resolved=decision.evidenceAssetId?resolveProjectAsset(decision.evidenceAssetId):null;
      if(resolved){
        const image=doc.createElement('img');image.className='portfolio-media';image.src=resolved.src;image.alt=localize(resolved.alt);image.loading='lazy';image.decoding='async';
        if(resolved.isPlaceholder)image.dataset.assetStatus='placeholder-active';
        visualArt.append(image);
      }else appendArtifactContents(visualArt,projectArtifactLabels(projectKey));
      visual.append(
        element('span','decision-visual-v58__eyebrow',`${ui("related-visual-5a70e92c")} ${String(index+1).padStart(2,'0')}`),
        visualArt,
        element('figcaption','sr-only',ui("cropped-detail-from-the-project-gallery-ab-15414e5c"))
      );
      card.append(visual);
    }
    return card;
  }
  function interactiveFlowById(flowId){
    if(!flowId)return null;
    for(const project of Object.values(DATA.projects)){
      const match=list(project.interactive_flows).find(flow=>flow.id===flowId);
      if(match)return match;
    }
    return null;
  }
  function prototypeEmbedUrl(prototypeUrl){
    const source=new URL(prototypeUrl);
    source.searchParams.set('show-proto-sidebar','0');
    source.searchParams.set('hide-ui','1');
    return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(source.toString())}`;
  }
  function createInteractiveFlow(flow,{compact=false}={}){
    const section=element('section',`interactive-flow-v195${compact?' interactive-flow-v195--compact':''}`);
    section.dataset.interactiveFlow=flow.id;
    const copy=element('div','interactive-flow-v195__copy');
    copy.append(
      element('span','interactive-flow-v195__status',ui("final-tested-version-30ed4cfc")),
      element(compact?'h4':'h3','',localize(flow.title)),
      element('p','interactive-flow-v195__notice',ui("this-is-the-final-prototype-version-that-a-10c4a51a"))
    );
    const stage=element('div','interactive-flow-v195__stage');
    const preview=element('div','interactive-flow-v195__preview');
    preview.setAttribute('aria-hidden','true');
    preview.append(element('span','interactive-flow-v195__phone-bar',''));
    const actions=element('div','interactive-flow-v195__actions');
    const activate=element('button','button button--dark interactive-flow-v195__activate',ui("try-this-flow-81dbcc96"));
    activate.type='button';
    activate.setAttribute('aria-expanded','false');
    actions.append(activate);
    preview.appendChild(actions);
    stage.append(preview);
    activate.addEventListener('click',()=>{
      const expanded=activate.getAttribute('aria-expanded')==='true';
      if(expanded)return;
      const embed=element('iframe','interactive-flow-v195__embed');
      embed.title=localize(flow.title);
      embed.loading='lazy';
      embed.allowFullscreen=true;
      embed.referrerPolicy='strict-origin-when-cross-origin';
      embed.allow='fullscreen';
      embed.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-presentation');
      embed.src=prototypeEmbedUrl(flow.prototypeUrl);
      const loading=element('div','interactive-flow-v195__loading');
      loading.setAttribute('role','status');
      loading.append(
        element('span','interactive-flow-v195__spinner',''),
        element('strong','',ui("loading-prototype-b24eab50"))
      );
      stage.append(loading,embed);
      preview.hidden=true;
      activate.setAttribute('aria-expanded','true');
      activate.disabled=true;
      const loadingTimeout=window.setTimeout(()=>{
        const label=loading.querySelector('strong');
        if(label)safeText(label,ui("prototype-load-delayed-f1a4c982"));
        loading.classList.add('is-delayed');
      },12000);
      embed.addEventListener('load',()=>{
        window.clearTimeout(loadingTimeout);
        loading.remove();
        embed.classList.add('is-ready');
      },{once:true});
    });
    section.append(copy,stage);
    return section;
  }
  function renderProject(key){
    const p=DATA.projects[key];
    const classification=doc.getElementById('detailClassification');
 if(classification)classification.hidden=false;
 safeText(doc.getElementById('detailTaxonomyLabel'),ui("problem-types-dd6fa301"));
    safeText(doc.getElementById('gallerySectionTitle'),ui("selected-material-f0024342"));
    safeText(doc.getElementById('detailContext'),projectEyebrow(p)||localize([p.context,p.context_zh]));
    emphasiseCompanyName(doc.getElementById('detailContext'));
    // Type and timeline belong to the structured scan grid. Keeping them out of
    // the title metadata prevents duplicate signals and preserves title focus.
    safeText(doc.getElementById('detailPeriod'),'');
    safeText(dialogTitle,localize(p.title));
    renderDeliveryStatus('');
    renderTags(key==='voucher'?[]:(localize(p.problemTypes)||[]));
    if(classification&&key==='voucher')classification.hidden=true;
    renderProjectValue(p.valueIBrought||localizedField(p,'value_i_bring'));
    safeText(doc.getElementById('projectAtGlance'),localize(p.atAGlance));
    const confidentiality=doc.getElementById('confidentialityNote');
    const confidentialityText=localize([p.confidentiality_note,p.confidentiality_note_zh]);
    safeText(confidentiality?.querySelector('em'),String(confidentialityText||'').replace(/^\*|\*$/g,''));
    if(confidentiality)confidentiality.hidden=!String(confidentialityText||'').trim();
    // Audience is intentionally rendered as semantic lines. The SSOT owns the
    // primary/secondary break; the renderer must not flatten it and then guess
    // where to insert presentation markup.
    const audience=String(localize(p.audience_pair)||'').split(/\n+/);
    const signalItems=[
      [ui("type-64d42969"),localize(p.type_pair),'type'],
      [ui("timeline-7ac9ee4d"),localize(p.timeline_pair),'timeline'],
      [ui("scope-59eb4415"),localize(p.scope_pair),'scope'],
      [ui("audience-44d1fe90"),audience,'audience']
    ].filter(([,value])=>String(value||'').trim());
    renderInfoGrid('projectSignals',signalItems);
    renderKeyInterventionMap(p);
    safeText(doc.getElementById('projectWhy'),localize(p.why_pair));
    safeText(doc.getElementById('projectImpact'),localize(p.impact_pair));
    doc.getElementById('projectEvidence')?.setAttribute('data-section-order',(p.section_order||[]).join(' '));
    renderRegisteredProjectSections(p);
    doc.querySelectorAll('#projectImpactSection > .impact-evidence-v147').forEach(node=>node.remove());
    renderDeliveryOutcomes(p);
    const hardList=doc.getElementById('projectHard');clear(hardList);
    list(p.hard).forEach((item,index)=>{
      const row=element('li','complexity-item-v86');
      row.append(
        element('span','complexity-item-v86__index',String(index+1).padStart(2,'0')),
        element('strong','complexity-item-v86__title',localize(item.title)),
        element('p','complexity-item-v86__description',localize(item.description))
      );
      hardList?.append(row);
    });
    const decisions=doc.getElementById('projectDecisions');clear(decisions);
    (p.decisions||[]).forEach((decision,index)=>{
      decisions.appendChild(createDecisionCard(decision,index,{projectKey:key}));
    });
    list(p.interactive_flows).forEach(flow=>decisions.appendChild(createInteractiveFlow(flow)));
    const decisionSection=decisions?.closest('.decision-section-v45');
    if(decisionSection)decisionSection.hidden=!p.decisions?.length;
    appendList(doc.getElementById('projectLed'),lang==='zh'?p.led_zh:p.led);
    appendList(doc.getElementById('projectContributed'),lang==='zh'?p.contributed_zh:p.contributed);
    const ownershipGrid=doc.querySelector('.ownership-grid-v45');
    const ledArticle=doc.getElementById('projectLed')?.closest('article');
    const contributedArticle=doc.getElementById('projectContributed')?.closest('article');
    if(p.ownership_model){
      safeText(doc.querySelector('.ownership-section-v45 .section-heading-v45 :is(h2,h3)'),detailLabel('ownershipAndCollaboration'));
      safeText(ledArticle?.querySelector('h4'),detailLabel('iLed'));
      safeText(contributedArticle?.querySelector('h4'),detailLabel('coDecided'));
      const ownershipIntro=doc.querySelector('.ownership-section-v45 .section-heading-v45 p');
      safeText(ownershipIntro,localize(p.ownership_model.publicSummary));
    }
    if(ledArticle)ledArticle.hidden=!doc.getElementById('projectLed')?.childElementCount;
    if(contributedArticle)contributedArticle.hidden=!doc.getElementById('projectContributed')?.childElementCount;
    const leadershipArticle=doc.getElementById('projectLeadership')?.closest('article');
    if(leadershipArticle)leadershipArticle.hidden=true;
    const ownershipSection=ownershipGrid?.closest('.ownership-section-v45');
    if(ownershipSection)ownershipSection.hidden=!ownershipGrid?.querySelector('article:not([hidden])');
    const hardSection=doc.getElementById('projectHard')?.closest('.project-context-v45__hard');
    if(hardSection)hardSection.hidden=!doc.getElementById('projectHard')?.childElementCount;
    renderTeamImpact(key,p);
    safeText(doc.getElementById('projectReflection'),localize(p.recruiter.reflection));
    applyCaseStudySectionSystem(p);
  }
  function localizedField(item,key){
    if(!item)return '';
    const legacy=lang==='zh'?item[`${key}_zh`]:undefined;
    return localize(legacy??item[key])??'';
  }
  function formatStatus(value){
    const status=String(value||'').replace(/[-_]+/g,' ').trim();
    if(!status)return ui("documented-in-the-ssot-d4eaf672");
    const category=statusCategory(status);
    if(lang==='zh')return {shipped:'已上線',partial:'部分上線',concept:'概念／未上線'}[category]||'狀態待確認';
    return {shipped:'Shipped',partial:'Partially shipped',concept:'Concept / not shipped'}[category]||'Status to confirm';
  }
  function statusCategory(value){
    const status=String(value||'').replace(/[-_]+/g,' ').trim().toLowerCase();
    if(!status)return '';
    if(/\b(concept|future|not shipped|unshipped|exploratory|planned)\b/.test(status)&&!/\b(partial|selected cases)\b/.test(status))return 'concept';
    if(/\b(partial|partially|selected cases|partially realised|partially realized)\b/.test(status))return 'partial';
    if(/\b(shipped|launched|live|used|delivered|complete)\b/.test(status))return 'shipped';
    return '';
  }
  function stageEvidenceItems(parent,stageId){
    const groups=parent?.journeyStageOptimisations||{};
    const relevantKeys=stageId==='discover'||stageId==='qualify'?['discoverQualify']:[stageId];
    return relevantKeys.flatMap(key=>Object.values(groups[key]||{}));
  }
  function stageEvidenceTitle(item){
    return item.workingTitle||item.title||item.designDecision?.title||item.designDirection?.coreDecision?.title||'';
  }
  function stageEvidenceDecision(item){
    return item.designDecision||item.designDirection?.coreDecision||{};
  }
  function stageEvidenceProblem(item){
    return item.problem?.customer||item.sourceSignal?.summary||item.problem||'';
  }
  function stageEvidenceOwnership(item){
    return item.ownership?.publicLine||item.ownershipLine||'';
  }
  function stageEvidenceStatus(item){
    return item.designDirection?.shippingStatus||
      item.release2025?.status||
      item.release2024?.status||
      item.phaseStatus?.phase2?.status||
      item.phaseStatus?.phase1?.status||
      item.shippedScope?.status||
      item.status||
      item.contentStatus||
      '';
  }
  function createProgrammeSection(title,copy,className='programme-section-v103'){
    const section=element('section',`${className} case-study-section case-study-section--canvas`);
    section.dataset.caseStudySection=String(title||'programme-section').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const head=element('div','section-heading-v45 case-study-section__header');
    const wrap=element('div');
    wrap.append(element('h2','',title));
    if(copy)wrap.append(element('p','',copy));
    head.append(wrap);section.append(head);return section;
  }
  function programmeSurface(){
    let surface=doc.getElementById('programmeSurface');
    if(surface)return surface;
    surface=element('div','programme-surface-v103');surface.id='programmeSurface';
    doc.getElementById('projectEvidence')?.before(surface);
    return surface;
  }
  function positionProjectContext(asInitiative=false){
    const context=doc.querySelector('#projectView .project-context-v45, #programmeSurface > .project-context-v45');
    const signals=doc.getElementById('projectSignals');
    const surface=asInitiative?programmeSurface():null;
    if(!context||!signals)return;
    context.classList.toggle('project-context-v45--decision-band',asInitiative);
    if(asInitiative)surface?.prepend(context);
    else signals.after(context);
  }
  function renderProgrammeParent(key,p){
 const surface=programmeSurface();clear(surface);const c=p.recruiterFirstPopup||{},t=x=>localize(x);
 const section=(eyebrow,title,copy='')=>{const n=element('section','voucher-r149-section case-study-section case-study-section--canvas'),h=element('header','voucher-r149-heading case-study-section__header');if(eyebrow)h.append(element('span','voucher-r149-eyebrow',eyebrow));if(title)h.append(element('h2','',title));if(copy)h.append(element('p','voucher-r149-intro',copy));n.append(h);return n};
 const hard=section(lang==='zh'?'困難之處':'WHAT MADE THIS HARD',t(c.whatMadeThisHard?.title),t(c.whatMadeThisHard?.description));
 const contribution=section(lang==='zh'?'貢獻':'CONTRIBUTION',t(c.contribution?.title));const flow=element('div','voucher-r149-flow');list(c.contribution?.transformation).forEach((x,i)=>{const a=element('article');a.append(element('span','voucher-r149-eyebrow',t(x.label)),element('p','',t(x.text)));flow.append(a);if(i<2)flow.append(element('i','','→'))});const teams=element('div','voucher-r149-rows');teams.append(element('h3','',lang==='zh'?'跨團隊啟用':'ENABLED ACROSS TEAMS'));list(c.contribution?.teams).forEach(x=>{const r=element('div');r.append(element('strong','',t(x.label)),element('p','',t(x.text)));teams.append(r)});contribution.append(flow,teams);
 const insight=section(lang==='zh'?'核心系統洞察':'CORE SYSTEM INSIGHT',t(c.coreInsight?.title),t(c.coreInsight?.statement));insight.classList.add('voucher-r149-insight');
 const journey=section('',lang==='zh'?'一條旅程——五個階段':'One journey — five stages'),ol=element('ol','voucher-r149-stages');
 list(c.stages).forEach((s,i)=>{const li=element('li','voucher-r149-stage programme-stage-case');li.dataset.stageCard=s.id;const h=element('header','voucher-r149-stage__head');h.append(element('span','voucher-r149-stage__number',String(i+1).padStart(2,'0')),element('h3','',t(s.label)));const facts=element('div','voucher-r149-stage__facts');[[lang==='zh'?'關鍵洞察':'KEY INSIGHT',s.keyInsight],[lang==='zh'?'改變內容':'WHAT CHANGED',s.whatChanged]].forEach(([l,x])=>{const d=element('div');d.append(element('span','voucher-r149-eyebrow',l),element('p','',t(x)));facts.append(d)});const shipped=element('div','voucher-r149-stage__shipped');shipped.append(element('span','voucher-r149-eyebrow',lang==='zh'?'調整前 → 已上線':'BEFORE → SHIPPED'),element('strong','',t(s.shipped)));const visual=(s.visualEvidence||p.publicContent?.journeyChapters?.find(x=>x.id===s.id)?.visualEvidence)?.primary;if(visual?.beforeAssetId&&visual?.shippedAssetId){const fig=element('figure','voucher-r149-evidence'),grid=element('div','before-after-evidence-v147__grid'),copy=visual.copy?.[lang==='zh'?'zh':'en']||{};[[visual.beforeAssetId,copy.beforeLabel,copy.beforeCaption,'is-before'],[visual.shippedAssetId,copy.shippedLabel,copy.shippedCaption,'is-shipped']].forEach(([id,l,cap,state])=>{const asset=resolveProjectAsset(id),part=element('div',`before-after-evidence-v147__item ${state}`),frame=element('button','before-after-evidence-v147__frame');frame.type='button';frame.dataset.expandableEvidence='true';const img=doc.createElement('img');img.src=asset.src;img.alt=localize(asset.alt);img.loading='lazy';frame.append(img);const fc=element('figcaption','before-after-evidence-v147__caption');fc.append(element('strong','',l),element('span','',cap));part.append(frame,fc);grid.append(part)});fig.append(grid);li.append(h,facts,fig,shipped)}else li.append(h,facts,shipped);const b=element('button','button button--dark programme-stage-case__cta',lang==='zh'?'查看解決方案細節 →':'View solution details →');b.type='button';b.dataset.stage=s.id;b.dataset.parentProject=key;li.append(b);ol.append(li)});journey.append(ol);
 const reusable=section('',t(c.reusableSystem?.title)),found=element('div','voucher-r149-rows');list(c.reusableSystem?.foundations).forEach(x=>{const r=element('div');r.append(element('strong','',t(x.label)),element('p','',t(x.text)));found.append(r)});reusable.append(found);
 const vc=element('section','voucher-r149-subsection');vc.append(element('span','voucher-r149-eyebrow',lang==='zh'?'VOUCHER CARD 系統':'VOUCHER CARD SYSTEM'),element('h3','',t(c.reusableSystem?.voucherCard?.headline)),element('p','',t(c.reusableSystem?.voucherCard?.history)));const vm=element('div','voucher-r149-metrics');list(c.reusableSystem?.voucherCard?.metrics).forEach(x=>{const d=element('div');d.append(element('strong','',x.value),element('span','',t(x.label)));vm.append(d)});vc.append(vm,element('p','',t(c.reusableSystem?.voucherCard?.insight)));reusable.append(vc);
 const delivery=element('section','voucher-r149-subsection');delivery.append(element('span','voucher-r149-eyebrow',lang==='zh'?'交付邊界':'DELIVERY BOUNDARY'));const dr=element('div','voucher-r149-rows');list(c.reusableSystem?.delivery).forEach(x=>{const r=element('div');r.append(element('strong','',t(x.label)),element('p','',t(x.text)));dr.append(r)});delivery.append(dr);reusable.append(delivery);
 const future=element('section','voucher-r149-subsection');future.append(element('span','voucher-r149-eyebrow',lang==='zh'?'未來方向':'FUTURE DIRECTION'),element('h3','',t(c.reusableSystem?.future?.headline)),element('p','',t(c.reusableSystem?.future?.thesis)));const fr=element('div','voucher-r149-rows');list(c.reusableSystem?.future?.items).forEach(x=>{const r=element('div');r.append(element('strong','',t(x.label)),element('p','',t(x.content)));fr.append(r)});future.append(fr,element('p','voucher-r149-status',t(c.reusableSystem?.future?.status)));reusable.append(future);
 const outcomes=section(lang==='zh'?'成果':'OUTCOMES',t(c.outcomes?.title)),metrics=element('div','voucher-r149-metrics');outcomes.dataset.outcomeExactProjection='true';list(c.outcomes?.metrics).forEach((x,index)=>{const d=element('div');d.dataset.outcomeSourcePath=`recruiterFirstPopup.outcomes.metrics.${index}.value+label`;d.append(element('strong','',x.value),element('span','',t(x.label)));metrics.append(d)});outcomes.append(metrics,element('p','voucher-r149-system-change',t(c.outcomes?.systemChange)));
 contribution.dataset.canonicalSectionId='my-contribution';contribution.dataset.contentBlockIds='recruiterFirstPopup.contribution';
 insight.dataset.canonicalSectionId='core-system-insight';insight.dataset.contentBlockIds='publicContent.coreSystemInsight';
 journey.dataset.canonicalSectionId='system-coverage-map';journey.dataset.contentBlockIds='publicContent.journeyChapters';
 reusable.dataset.canonicalSectionId='reusable-system';reusable.dataset.contentBlockIds='recruiterFirstPopup.reusableSystem|publicContent.systemFoundations|publicContent.futureVision';
 outcomes.dataset.canonicalSectionId='validated-outcomes';outcomes.dataset.contentBlockIds='recruiterFirstPopup.outcomes|impactEvidence';
 const account=section('',lang==='zh'?'我的責任範圍':'MY ACCOUNTABILITY',t(c.accountability?.intro)),ag=element('div','voucher-r149-accountability');[c.accountability?.owned,c.accountability?.shared].forEach(x=>{const a=element('article');a.append(element('span','voucher-r149-eyebrow',t(x.label)),element('h3','',t(x.title)),element('p','',t(x.text)));ag.append(a)});account.append(ag);account.dataset.canonicalSectionId='ownership-and-evidence';account.dataset.contentBlockIds='recruiterFirstPopup.accountability|ownershipModel';
 [hard,contribution,insight,journey,reusable,outcomes,account].forEach(n=>surface.append(n));
}
  function renderInitiative(parentKey,initiativeKey){
    const parent=DATA.projects[parentKey];const item=parent?.initiatives?.[initiativeKey];if(!item)return;
    const parentStage=parent.journey_stages?.find(stage=>stage.id===item.parentStageId);
    safeText(doc.getElementById('detailContext'),`FairPrice Group · ${localizedField(parentStage,'label')}`);
    // Professional-case metadata belongs to the context grid, never above the title.
    safeText(doc.getElementById('detailPeriod'),'');
    safeText(dialogTitle,localizedField(item,'title'));
    renderTags(lang==='zh'?item.problem_types_zh:item.problem_types);
    renderDeliveryStatus('');
    renderProjectValue(localizedField(item,'value_i_bring'));
    safeText(doc.getElementById('projectAtGlance'),localizedField(item,'at_glance'));
    renderInfoGrid('projectSignals',[
      [ui("type-64d42969"),localizedField(item,'type')||localize([parent.type,parent.type_zh]),'type'],
      [ui("timeline-7ac9ee4d"),localizedField(item,'period')||localizedField(item,'timeline'),'timeline'],
      [ui("scope-59eb4415"),localizedField(item,'scope'),'scope'],
      [ui("audience-44d1fe90"),localizedField(item,'audience'),'audience']
    ]);
    safeText(doc.getElementById('projectWhy'),localizedField(item,'why'));
    safeText(doc.getElementById('projectImpact'),localizedField(item,'impact'));
    doc.getElementById('confidentialityNote').hidden=false;

    const surface=programmeSurface();clear(surface);
    positionProjectContext(true);
    const stageNumber=parent.journey_stages?.findIndex(stage=>stage.id===item.parentStageId)+1;
    const stageEntry=parent.initiative_map?.find(entry=>(entry.primary_stage||entry.range?.[0])===stageNumber&&(!entry.initiative_id||entry.initiative_id===initiativeKey));
    const stageLabel=localizedField(parentStage,'label');
    const stageFocus=createProgrammeSection(stageLabel,'','stage-focus-v148');
    const relationship=localizedField(stageEntry,'capability')||localizedField(parentStage,'direction');
    stageFocus.append(element('p','stage-focus-v148__statement',lang==='zh'?`此子案透過「${relationship}」推進 ${stageLabel}。`:`This initiative advances ${stageLabel} by ${relationship}.`));
    const gallery=doc.getElementById('sharedGallery');
    gallery?.classList.add('is-initiative-context');
    initiativeGallery=lang==='zh'?[
      {title:'在購物情境中發現相關挑戰',text:'在購物意圖出現的位置顯示商品相關性與挑戰價值。',labels:['購物情境','個人相關性','接受挑戰']},
      {title:'讓參與進度成為可辨識狀態',text:'把資格、下一步與里程碑進度收進同一段可持續理解的旅程。',labels:['資格','下一步','進度']},
      {title:'用清楚的獎勵狀態完成旅程',text:'確認獎勵結果，並在未完成或辨識失敗時提供恢復路徑。',labels:['達成條件','獎勵確認','恢復路徑']}
    ]:[
      {title:'Discover a relevant challenge in context',text:'Surface product relevance and challenge value where shopping intent begins.',labels:['Shopping context','Personal relevance','Accept challenge']},
      {title:'Turn participation into visible states',text:'Connect eligibility, next action, and milestone progress in one understandable journey.',labels:['Eligibility','Next action','Progress']},
      {title:'Close the journey with reward clarity',text:'Confirm the reward outcome and provide recovery when completion or recognition fails.',labels:['Qualification','Reward status','Recovery']}
    ];
    galleryIndex=0;renderGallery();
    doc.getElementById('galleryThumbs').hidden=false;
    doc.getElementById('galleryPrev').hidden=false;
    doc.getElementById('galleryNext').hidden=false;
    const signals=createProgrammeSection(ui("what-the-campaign-data-revealed-3a3e136f"),ui("three-pre-redesign-signals-that-defined-th-20b4448c"));
    const signalGrid=element('div','initiative-signal-grid-v103');
    item.problem_signals.forEach(signal=>{const card=element('article','initiative-signal-card-v103');card.append(element('strong','',localizedField(signal,'value')),element('span','',localizedField(signal,'label')),element('small','',signal.source));signalGrid.append(card)});
    signals.append(signalGrid);

    const journey=createProgrammeSection(ui("how-research-signals-shaped-each-design-re-ee502af7"),ui("each-row-follows-one-causal-line-research--3b5e4bc3"));
    const steps=element('ol','initiative-journey-v103');
    const researchItems=lang==='zh'?item.research_findings_zh:item.research_findings;
    const researchMap=[0,1,2,3,3];
    (lang==='zh'?item.journey_zh:item.journey).forEach((step,index)=>{
      const li=element('li');
      const stage=element('div','initiative-journey-v103__stage');
      stage.append(element('span','programme-card-meta-v103',String(index+1).padStart(2,'0')),element('h4','',step[0]));
      const evidence=element('div','initiative-journey-v103__detail initiative-journey-v103__evidence');
      evidence.append(element('span','programme-card-meta-v103',ui("research-signal-faaada18")),element('p','',researchItems[researchMap[index]]));
      const breakdown=element('div','initiative-journey-v103__detail');
      breakdown.append(element('span','programme-card-meta-v103',ui("breakpoint-d033a58e")),element('p','',step[1]));
      const implication=element('div','initiative-journey-v103__detail');
      implication.append(element('span','programme-card-meta-v103',ui("design-response-1135c403")),element('p','',step[2]));
      li.append(stage,evidence,breakdown,implication);steps.append(li)
    });journey.append(steps);

    const contribution=createProgrammeSection(
      ui("reusable-system-outcome-0ca965ee"),
      '',
      'programme-contribution-v103'
    );
    contribution.append(element('p','programme-contribution-v103__statement',localizedField(item,'system_contribution')));
    surface.append(stageFocus,signals,journey,contribution);
  }
  function renderExperiment(key){
    const e=DATA.experiments[key];
    const classification=doc.getElementById('detailClassification');
 if(classification)classification.hidden=true;
 renderDeliveryStatus('');
    const valueSection=doc.querySelector('.project-value-v207');
    if(valueSection)valueSection.hidden=true;
    safeText(doc.getElementById('gallerySectionTitle'),ui("prototype-material-ab30eb18"));
    safeText(doc.getElementById('detailContext'),localize(e.category));
    safeText(doc.getElementById('detailPeriod'),localize(e.timeline));
    safeText(dialogTitle,localize(e.title));
    const fullStatus=localize(e.status);const stage=String(fullStatus).split(' · ')[0];

    renderTags([]);
    const questionText=localize(e.question);
    const prototypeText=localize(e.prototype);
    const learningText=localize(e.learning);
    const nextText=localize(e.next);
    safeText(doc.getElementById('experimentQuestion'),questionText);safeText(doc.getElementById('experimentSummary'),localize(e.summary));
    renderInfoGrid('detailInfoExperiment',[
      [ui("current-stage-890e8af9"),stage],
      [ui("what-i-built-1e30e5f3"),prototypeText]
    ]);
    safeText(doc.getElementById('experimentPrototype'),prototypeText);safeText(doc.getElementById('experimentLearning'),learningText);safeText(doc.getElementById('experimentNext'),nextText);
    doc.getElementById('experimentQuestion')?.closest('.experiment-overview-v45__question')?.toggleAttribute('hidden',!questionText&&!localize(e.summary));
    doc.getElementById('experimentPrototype')?.closest('.experiment-overview-v45__build')?.toggleAttribute('hidden',true);
    doc.getElementById('experimentLearning')?.closest('article')?.toggleAttribute('hidden',!learningText);
    doc.getElementById('experimentNext')?.closest('article')?.toggleAttribute('hidden',!nextText);
  }
  const RELATED_PROJECTS={
    voucher:['voucher-center','game-center','dbs'],
    'voucher-center':['voucher','game-center','dbs'],
    'game-center':['voucher','voucher-center','payment'],
    dbs:['voucher','booking','payment'],
    booking:['dbs','voucher','bandzo'],
    payment:['voucher','dbs','taishin-p2p-marketplace-platform'],
    bandzo:['payment','booking','voucher'],
    'taishin-p2p-marketplace-platform':['payment','dbs','cathay-mortgage-assistant'],
    'cathay-mortgage-assistant':['ctbc-mortgage-self-service-app','dbs','payment'],
    'cathay-sit-online-account-opening':['ctbc-mortgage-self-service-app','cathay-sit-review-remediation-operations','dbs'],
    'cathay-sit-review-remediation-operations':['cathay-sit-online-account-opening','dbs','payment'],
    'ctbc-mortgage-self-service-app':['cathay-sit-online-account-opening','dbs','cathay-mortgage-assistant'],
    'booking-taxi-pickup-service-strategy':['booking','taishin-p2p-marketplace-platform','dbs']
  };
  const RELATED_EXPERIMENTS={
    'capture-ideas':['aha-creative-toolbox','hello-sabau','weekly-design-session'],
    'aha-creative-toolbox':['capture-ideas','hello-sabau','aja-creative-workshop'],
    'hello-sabau':['capture-ideas','aha-creative-toolbox','food-testing-workshop'],
    'food-testing-workshop':['aja-creative-workshop','weekly-design-session','capture-ideas'],
    'aja-creative-workshop':['food-testing-workshop','weekly-design-session','aha-creative-toolbox'],
    'weekly-design-session':['aja-creative-workshop','food-testing-workshop','capture-ideas']
  };
  function detailBrand(type,key){
    if(type==='experiment')return ui("experiment-81b73d30");
    const map={voucher:'Customer incentives','voucher-center':'Voucher Center','game-center':'Game Center',dbs:'DBS',booking:'Booking.com',payment:'FairPrice Group',bandzo:'Bandzo'};
    return map[key]||'Project';
  }
  function detailVisualLabels(type,key){
    if(type==='experiment'){
      return experimentArtifactLabels(key);
    }
    return projectArtifactLabels(key);
  }
  function detailRelatedVisual(type,key){
    const visual=element('div','detail-related-card-v45__visual');
    visual.setAttribute('aria-hidden','true');
    const brand=element('span','detail-related-card-v45__brand',detailBrand(type,key));
    const flow=element('div','detail-related-card-v45__flow');
    detailVisualLabels(type,key).forEach((label,index)=>{
      if(index)flow.append(element('i',''));
      flow.append(element('b',index===1?'is-core':'',label));
    });
    visual.append(brand,flow);return visual;
  }
  function relatedCard(type,key){
    const item=type==='project'?DATA.projects[key]:DATA.experiments[key];
    const card=element('button',type==='experiment'?'detail-related-card-v45 detail-experiment-card-v101':'detail-related-card-v45');card.type='button';card.dataset[type]=key;
    const context=type==='project'?localize(item.company):localize(item.category);
    const title=type==='project'?localize(item.cardTitle)||localize(item.title_pair):localize(item.title);
    if(type==='experiment'){
      const learning=element('div','detail-experiment-card-v101__learning');
      learning.append(element('small','',ui("current-learning-112d6ab4")),element('strong','',localize(item.learning)));
      card.append(element('span','detail-related-card-v45__context',context),element('h4','',title),element('p','detail-experiment-card-v101__question',localize(item.question)),learning,element('span','experiment-card-action',ui("view-experiment-8788e030")));
      return card;
    }
    const action=element('span','detail-related-action-v46');
    action.append(element('span','related-project-card__action-label',ui("view-case-a62dd0ad")),element('span','related-project-card__action-arrow','↗'));
    card.append(
      element('span','detail-related-card-v45__context',context),
      element('h4','',title),
      action
    );
    return card;
  }
  function renderRelated(){
    if(!currentDetail)return;const type=currentDetail.type;const nested=type==='initiative'||type==='stage';const relatedType=nested?'project':type;const relatedKey=nested?currentDetail.parentKey:currentDetail.key;const keys=(relatedType==='project'?RELATED_PROJECTS[relatedKey]:RELATED_EXPERIMENTS[relatedKey])||[];
    const rail=doc.getElementById('detailRelatedRail');clear(rail);keys.forEach(key=>rail.appendChild(relatedCard(relatedType,key)));enhanceCompanyNames(rail);
    safeText(doc.getElementById('detailRelatedTitle'),ui("related-work-9e3ba8e3"));
    safeText(doc.getElementById('detailRelatedCopy'),'');
    window.refreshHorizontalRails?.();
  }
  function renderDetail(){
    if(!currentDetail)return;const isStage=currentDetail.type==='stage';const isProject=currentDetail.type==='project'||currentDetail.type==='initiative'||isStage;const isInitiative=currentDetail.type==='initiative';projectView.hidden=!isProject;experimentView.hidden=isProject;
    const detailCommerce=doc.querySelector('.detail-commerce-v45');if(detailCommerce)detailCommerce.hidden=isStage;
    const overviewContext=doc.querySelector('.project-context-v45--overview');
    if(overviewContext)overviewContext.hidden=!isProject;
    if(currentDetail.type!=='project')doc.getElementById('projectKeyIntervention').hidden=true;
    const isProgramme=currentDetail.type==='project'&&DATA.projects[currentDetail.key]?.project_model==='programme-case-with-child-evidence';
    doc.getElementById('projectEvidence').hidden=!isProject||isInitiative||isStage||isProgramme;
    doc.getElementById('experimentEvidence').hidden=isProject;
    // Professional cases use contextual evidence beside the claim it proves.
    // The detached gallery remains only for experiments and initiative demos.
    doc.getElementById('sharedGallery').hidden=isStage||currentDetail.type==='project';
    if(!isInitiative){
      doc.getElementById('sharedGallery').classList.remove('is-initiative-context');
      doc.getElementById('galleryThumbs').hidden=false;
      doc.getElementById('galleryPrev').hidden=false;
      doc.getElementById('galleryNext').hidden=false;
    }
    programmeSurface().hidden=!(isProgramme||isInitiative||isStage);
    dialog?.classList.toggle('is-experiment',!isProject);dialog?.classList.toggle('is-project',isProject);dialog?.classList.toggle('is-programme',isProgramme);dialog?.classList.toggle('is-initiative',isInitiative);dialog?.classList.toggle('is-stage',isStage);
    if(!isInitiative)positionProjectContext(false);
    if(isStage){
      const parent=DATA.projects[currentDetail.parentKey];clear(programmeSurface());
      const stageIndex=parent.journey_stages.findIndex(item=>item.id===currentDetail.key);const stage=parent.journey_stages[stageIndex];const item=parent.initiative_map.find(entry=>(entry.primary_stage||entry.range?.[0])===stageIndex+1)||{};
      safeText(doc.getElementById('detailContext'),`FairPrice Group · ${localizedField(stage,'label')}`);
      safeText(doc.getElementById('detailPeriod'),`${ui("stage-f31c1647")} ${String(stageIndex+1).padStart(2,'0')} / ${String(parent.journey_stages.length).padStart(2,'0')}`);
      safeText(dialogTitle,localizedField(stage,'label'));
      renderTags([]);
      const classification=doc.getElementById('detailClassification');if(classification)classification.hidden=true;
      renderDeliveryStatus('');
      const stageLabel=localizedField(stage,'label');
      const stageProjection=parent.recruiterFirstPopup?.stages?.find(entry=>entry.id===currentDetail.key);
      const section=createProgrammeSection(stageLabel,'');
      section.classList.add('voucher-stage-case','voucher-r149-solution','voucher-r149-details');
      const stageSummary=localizedField(stageProjection||stage,'whatChanged')||localizedField(item,'capability')||localizedField(stage,'direction');
      if(stageSummary)section.append(element('p','voucher-r149-intro',stageSummary));
      const projectedDecisions=list(stageProjection?.decisions);
      const evidenceItems=projectedDecisions.length?projectedDecisions:stageEvidenceItems(parent,currentDetail.key);
      if(evidenceItems.length){
        const evidenceGrid=element('div','voucher-r149-decision-list');
        evidenceItems.forEach((source,index)=>{
          const legacy=projectedDecisions.length?null:stageEvidenceDecision(source);
          const model=projectedDecisions.length?{
            title:source.title,
            problem:source.problem,
            result:source.decision,
            effect:source.effect,
            optionalBlock:source.optionalBlock
          }:{
            title:stageEvidenceTitle(source),
            problem:stageEvidenceProblem(source),
            result:legacy?.whatIDecided,
            effect:legacy?.whyThisChoice,
            optionalBlock:legacy?.optionalBlock
          };
          const card=createDecisionCard(model,index,{showVisual:false});
          card.classList.add('voucher-r149-decision');
          if(source.trend?.value){
            const trend=element('div','voucher-r149-decision__trend');
            trend.append(element('strong','',source.trend.value),element('span','',localize(source.trend.label)),element('p','',localize(source.trend.boundary)));
            card.querySelector('.decision-body-v46')?.append(trend);
          }
          const ownership=projectedDecisions.length?localize(source.ownership):localize(stageEvidenceOwnership(source));
          if(ownership){
            const owner=element('div','voucher-r149-decision__ownership');
            owner.append(element('span','decision-field-label-v58',lang==='zh'?'責任邊界':'OWNERSHIP BOUNDARY'),element('p','',ownership));
            card.querySelector('.decision-body-v46')?.append(owner);
          }
          evidenceGrid.append(card);
        });
        section.append(evidenceGrid);
      }
      const visual=stageProjection?.visualEvidence?.primary||parent.publicContent?.journeyChapters?.find(entry=>entry.id===currentDetail.key)?.visualEvidence?.primary;
      if(visual?.beforeAssetId&&visual?.shippedAssetId){
        const figure=element('figure','voucher-r149-evidence'),grid=element('div','before-after-evidence-v147__grid'),copy=visual.copy?.[lang==='zh'?'zh':'en']||{};
        [[visual.beforeAssetId,copy.beforeLabel,copy.beforeCaption,'is-before'],[visual.shippedAssetId,copy.shippedLabel,copy.shippedCaption,'is-shipped']].forEach(([assetId,label,caption,state])=>{
          const asset=resolveProjectAsset(assetId),part=element('div',`before-after-evidence-v147__item ${state}`),frame=element('button','before-after-evidence-v147__frame');
          frame.type='button';frame.dataset.expandableEvidence='true';frame.dataset.frameRole='primary-evidence';
          const image=doc.createElement('img');image.src=asset.src;image.alt=localize(asset.alt);image.loading='lazy';
          const htmlCaption=element('figcaption','before-after-evidence-v147__caption');htmlCaption.append(element('strong','',label),element('span','',caption));
          frame.append(image);part.append(frame,htmlCaption);grid.append(part);
        });
        figure.append(grid);section.append(figure);
      }
      programmeSurface().append(section);
    }else if(isInitiative)renderInitiative(currentDetail.parentKey,currentDetail.key);
    else if(isProject){renderProject(currentDetail.key);if(isProgramme)renderProgrammeParent(currentDetail.key,DATA.projects[currentDetail.key])}
    else renderExperiment(currentDetail.key);
    enableExpandableEvidence(projectView);
    renderProjectSectionNav();
    if(currentDetail.type==='experiment')renderGallery();
    renderRelated();
    if(dialogScrollRoot){dialogScrollRoot.scrollLeft=0;}
  }
  function openDetail(type,key,invoker,parentKey){
    if(type==='project')key=canonicalProjectId(key);
    if(parentKey)parentKey=canonicalProjectId(parentKey);
    const source=type==='project'?DATA.projects[key]:type==='initiative'?DATA.projects[parentKey]?.initiatives?.[key]:type==='stage'?DATA.projects[parentKey]?.journey_stages?.find(item=>item.id===key):DATA.experiments[key];if(!dialog||!source)return;
    const continuesFromOpenDetail=dialog.open&&currentDetail;
    if(continuesFromOpenDetail){
      detailStack.push({
        detail:{...currentDetail},
        invoker:currentInvoker,
        galleryIndex,
        scrollTop:dialogScrollRoot?.scrollTop||0,
        anchorStage:invoker?.dataset?.stage||''
      });
    }else{
      detailStack.length=0;
      if(!dialog.open)rootInvoker=invoker;
    }
    currentInvoker=invoker;currentDetail={type,key,...(parentKey?{parentKey}:{})};galleryIndex=0;
    const dialogScroll=dialog.querySelector('.dialog-scroll');
    if(dialogScroll){dialogScroll.scrollTop=0;dialogScroll.scrollLeft=0;}
    try{
      renderDetail();
    }catch(error){
      console.error('Portfolio detail render failed',{type,key,parentKey,error});
      safeText(dialogTitle,localize(source.title_pair||source.title||source.question)||key);
    }
    updateCloseControl();
    if(!dialog.open){setDialogOpenState(true);dialog.classList.add('is-opening');dialog.showModal()}
    requestAnimationFrame(()=>{dialog.classList.remove('is-opening');
      if(dialogScroll){dialogScroll.scrollTo({top:0,left:0,behavior:'auto'});}
      dialogTitle.focus({preventScroll:true});
      doc.dispatchEvent(new CustomEvent('portfolio:detail-ready'));
    });
    safeText(dialogStatus,ui("details-opened-c2398239"));
  }
  doc.addEventListener('click',event=>{
    const stageBack=event.target.closest('[data-stage-back]');
    if(stageBack){event.preventDefault();returnToParentProject();return}
    const stage=event.target.closest('[data-stage]');
    if(stage){
      event.preventDefault();
      const parentKey=stage.dataset.parentProject||'voucher';
      openDetail('stage',stage.dataset.stage,stage,parentKey);
      const url=new URL(window.location.href);
      url.searchParams.set('case',parentKey);
      url.searchParams.set('stage',stage.dataset.stage);
      url.searchParams.delete('initiative');
      history.pushState({detail:{type:'stage',key:stage.dataset.stage,parentKey}},'',url);
      return;
    }
    const initiative=event.target.closest('[data-initiative]');
    if(initiative){event.preventDefault();openInitiative(initiative.dataset.parentProject||'voucher',initiative.dataset.initiative,initiative);return}
    const project=event.target.closest('[data-project]');
    if(project){
      event.preventDefault();
      const key=canonicalProjectId(project.dataset.project);
      openDetail('project',key,project);
      history.pushState({detail:{type:'project',key}},'',canonicalProjectUrl(key));
      return;
    }
    const experiment=event.target.closest('[data-experiment]');
    if(experiment){event.preventDefault();openDetail('experiment',experiment.dataset.experiment,experiment)}
  });
  function openInitiative(parentKey,key,invoker,direct=false){
    const item=DATA.projects[parentKey]?.initiatives?.[key];if(!item)return;
    if(direct&&!dialog?.open){
      openDetail('initiative',key,invoker,parentKey);
      return;
    }
    openDetail('initiative',key,invoker,parentKey);
    const url=new URL(window.location.href);url.searchParams.set('case',parentKey);url.searchParams.set('initiative',key);
    history.pushState({detail:{type:'initiative',key,parentKey}},'',url);
  }
  const requestedDeepLinkedCase=new URLSearchParams(window.location.search).get('case')||projectIdFromPath();
  const deepLinkedCase=canonicalProjectId(requestedDeepLinkedCase);
  const deepLinkedInitiative=new URLSearchParams(window.location.search).get('initiative');
  const deepLinkedStage=new URLSearchParams(window.location.search).get('stage');
  if(deepLinkedCase&&DATA.projects[deepLinkedCase]){
    if(requestedDeepLinkedCase!==deepLinkedCase){
      const canonicalUrl=new URL(window.location.href);
      canonicalProjectUrl(deepLinkedCase,canonicalUrl);
      history.replaceState({detail:{type:'project',key:deepLinkedCase}},'',canonicalUrl);
    }
    window.requestAnimationFrame(()=>{
      if(deepLinkedInitiative&&DATA.projects[deepLinkedCase]?.initiatives?.[deepLinkedInitiative]){
        openDetail('initiative',deepLinkedInitiative,doc.querySelector(`[data-project="${deepLinkedCase}"]`),deepLinkedCase);
      }else if(deepLinkedStage&&DATA.projects[deepLinkedCase]?.journey_stages?.some(item=>item.id===deepLinkedStage)){
        openDetail('stage',deepLinkedStage,doc.querySelector(`[data-project="${deepLinkedCase}"]`),deepLinkedCase);
      }else{
        if(deepLinkedStage){const url=new URL(window.location.href);url.searchParams.delete('stage');history.replaceState({detail:{type:'project',key:deepLinkedCase}},'',url)}
        openDetail('project',deepLinkedCase,doc.querySelector(`[data-project="${deepLinkedCase}"]`));
      }
    });
  }
  window.addEventListener('popstate',()=>{
    const params=new URLSearchParams(window.location.search);
    const requestedParent=params.get('case')||projectIdFromPath();
    const parent=canonicalProjectId(requestedParent);
    if(!parent||!DATA.projects[parent]){
      if(dialog?.open)closeDialog({syncHistory:false});
      return;
    }
    if(!dialog?.open){
      openDetail('project',parent,doc.querySelector(`[data-project="${parent}"]`));
      return;
    }
    const initiative=params.get('initiative');
    const stage=params.get('stage');
    if(stage&&(currentDetail?.type!=='stage'||currentDetail.key!==stage))openDetail('stage',stage,currentInvoker,parent);
    else if(initiative&&currentDetail?.type!=='initiative')openDetail('initiative',initiative,currentInvoker,parent);
    else if(!stage&&!initiative&&(currentDetail?.type==='initiative'||currentDetail?.type==='stage')){suppressHistorySync=true;returnToPreviousDetail();suppressHistorySync=false}
    else if(!stage&&!initiative&&(currentDetail?.type!=='project'||currentDetail.key!==parent))openDetail('project',parent,doc.querySelector(`[data-project="${parent}"]`));
  });
  doc.addEventListener('keydown',event=>{if(!dialog?.open)return;if(event.key==='ArrowLeft'){event.preventDefault();doc.getElementById('galleryPrev').click()}if(event.key==='ArrowRight'){event.preventDefault();doc.getElementById('galleryNext').click()}});
  doc.querySelectorAll('img').forEach(image=>{
    if(!image.hasAttribute('width'))image.width=640;
    if(!image.hasAttribute('height'))image.height=420;
    image.loading=image.dataset.critical==='true'?'eager':'lazy';
    image.decoding='async';
    image.fetchPriority=image.dataset.critical==='true'?'high':'low';
  });
})();
