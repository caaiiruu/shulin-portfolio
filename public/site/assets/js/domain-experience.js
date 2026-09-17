(() => {
  'use strict';

  const section = document.getElementById('domains');
  if (!section || section.dataset.domainGoldenReferenceMounted === 'true') return;
  const DATA = window.PORTFOLIO_RUNTIME_DATA || window.PORTFOLIO_DATA || {};
  const REGISTRY = window.PROJECT_PRESENTATION_REGISTRY || {};
  const related = document.getElementById('relatedProjects');
  const stage = document.getElementById('domainStage');
  const contentRail = document.getElementById('domainContentRail');
  if (!related || !contentRail) return;

  section.dataset.domainGoldenReferenceMounted = 'true';
  section.classList.add('domain-experience');
  if (!document.querySelector('link[data-style-b-owner="domain-experience"]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = '/site/assets/css/components/domain-experience.css';
    style.dataset.styleBOwner = 'domain-experience';
    document.head.append(style);
  }

  const language = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  const localize = value => {
    if (Array.isArray(value)) return value[language() === 'zh' ? 1 : 0] ?? value[0] ?? '';
    if (value && typeof value === 'object' && ('en' in value || 'zh' in value)) return language() === 'zh' ? (value.zh ?? value.en ?? '') : (value.en ?? value.zh ?? '');
    return value ?? '';
  };
  const scalarText = (value, depth = 0) => {
    if (value == null || depth > 4) return '';
    const v = localize(value);
    if (typeof v === 'string' || typeof v === 'number') return String(v).trim();
    if (Array.isArray(v)) return v.map(item => scalarText(item, depth + 1)).find(Boolean) || '';
    if (v && typeof v === 'object') {
      for (const key of ['value','label','text','publicLabel','title','name']) {
        const text = scalarText(v[key], depth + 1);
        if (text) return text;
      }
    }
    return '';
  };
  const firstText = (...values) => values.map(scalarText).find(Boolean) || '';
  const asList = value => Array.isArray(value) ? value : value == null ? [] : [value];
  const normalize = value => String(value || '').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const publicProjects = DATA.publicProjects || DATA.projects || {};

  const visibleProjectTitle = value => {
    let text = String(value || '').trim();
    const prefixes = DATA.implementationContracts?.recruiterFirstPresentation?.hero?.forbiddenVisiblePrefixes;
    for (const prefix of Array.isArray(prefixes) ? prefixes : []) {
      if (prefix && text.startsWith(prefix)) {
        text = text.slice(prefix.length).trimStart();
        text = text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
        break;
      }
    }
    return text;
  };

  const projectionForProject = projectId => Object.entries(REGISTRY.routes || {})
    .map(([route, entry]) => ({ route, entry }))
    .find(({ entry }) => entry.projectId === projectId && entry.publicDiscovery === true)?.entry?.workProjection || null;
  const routeForProject = projectId => {
    const project = publicProjects[projectId];
    const projection = projectionForProject(projectId);
    return project?.publicRoute || projection?.route || `/work/${projectId}`;
  };
  const usesStandalonePage = projectId => Object.values(REGISTRY.routes || {}).some(entry =>
    entry?.projectId === projectId && entry?.publicDiscovery === true && entry?.presentationContract && entry.presentationContract !== 'legacy'
  );

  let viewportFrame = 0;
  const syncViewportWidth = () => section.style.setProperty('--domain-viewport-width', `${document.documentElement.clientWidth}px`);
  syncViewportWidth();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(viewportFrame);
    viewportFrame = requestAnimationFrame(syncViewportWidth);
  });

  const icons = {
    finance:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h18M5 10V20M9 10V20M15 10V20M19 10V20M3 20h18M12 3 3 8h18L12 3Z"/></svg>',
    operations:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="6" height="6"/><rect x="15" y="3" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/><rect x="15" y="15" width="6" height="6"/><path d="M9 6h6M6 9v6M18 9v6M9 18h6"/></svg>',
    growth:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16v12H4zM12 9v12M3 9h18M7 9c-2.5 0-3.5-1.5-3.5-3S5 3.5 6.5 4.5L12 9M17 9c2.5 0 3.5-1.5 3.5-3S19 3.5 17.5 4.5L12 9"/></svg>',
    travel:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9Z"/></svg>',
    commerce:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
    learning:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5c3-1 6-.5 9 1.5v13c-3-2-6-2.5-9-1.5v-13ZM21 5.5c-3-1-6-.5-9 1.5v13c3-2 6-2.5 9-1.5v-13Z"/></svg>'
  };
  const aliasMap = {
    operations:['enterprise-operations','operations','operational'],
    finance:['financial-services','finance','financial'],
    commerce:['retail-commerce','retail-and-commerce','commerce','retail'],
    travel:['travel-platforms','travel','mobility'],
    growth:['growth-incentive-systems','rewards-incentives','incentive','rewards','growth'],
    learning:['learning-platforms','learning','education']
  };
  const iconKeyFor = tab => {
    const key = normalize(tab?.dataset.domain);
    if (aliasMap[key]) return key;
    const label = normalize(tab?.querySelector('strong')?.textContent);
    if (label.includes('financial')) return 'finance';
    if (label.includes('retail') || label.includes('commerce')) return 'commerce';
    if (label.includes('travel')) return 'travel';
    if (label.includes('reward') || label.includes('incentive')) return 'growth';
    if (label.includes('learning')) return 'learning';
    return 'operations';
  };
  const enhanceTabs = () => section.querySelectorAll('.domain-tab').forEach(tab => {
    const number = tab.querySelector(':scope > span:not(.domain-tab__icon)');
    if (number) number.classList.add('domain-tab__number');
    const label = tab.querySelector('strong');
    if (label) label.classList.add('domain-tab__label');
    let icon = tab.querySelector('.domain-tab__icon');
    if (!icon) {
      icon = document.createElement('span');
      icon.className = 'domain-tab__icon';
      tab.prepend(icon);
    }
    const key = iconKeyFor(tab);
    icon.dataset.iconKey = key;
    icon.innerHTML = icons[key];
  });
  enhanceTabs();

  const projectPanel = related.closest('.domain-panel-v30--projects');
  const problemsPanel = document.getElementById('domainProblems')?.closest('.domain-panel-v30');
  const solutionsPanel = document.getElementById('domainSolutions')?.closest('.domain-panel-v30');
  if (projectPanel) contentRail.prepend(projectPanel);
  const makeDisclosure = panel => {
    if (!panel || panel.matches('details')) return panel;
    const details = document.createElement('details');
    details.className = `${panel.className} domain-experience-disclosure`;
    const summary = document.createElement('summary');
    summary.className = 'domain-experience-disclosure__summary';
    const heading = panel.querySelector('h4');
    if (heading) summary.append(heading);
    while (panel.firstChild) details.append(panel.firstChild);
    details.prepend(summary);
    details.open = false;
    panel.replaceWith(details);
    return details;
  };
  const problemDisclosure = makeDisclosure(problemsPanel);
  const solutionDisclosure = makeDisclosure(solutionsPanel);
  const resetDisclosures = () => {
    if (problemDisclosure) problemDisclosure.open = false;
    if (solutionDisclosure) solutionDisclosure.open = false;
  };
  projectPanel?.querySelector('.rail-heading')?.classList.add('domain-experience__project-heading');

  const canonicalDomains = () => asList(DATA.contentDiscovery?.domains);
  const resolveDomain = tab => {
    const key = normalize(tab?.dataset.domain);
    const aliases = aliasMap[key] || [key];
    return canonicalDomains().find(domain => aliases.includes(normalize(domain.id))) ||
      canonicalDomains().find(domain => {
        const searchable = [domain.id, localize(domain.label), ...asList(domain.legacyAliases)].map(normalize).join(' ');
        return aliases.some(alias => searchable.includes(normalize(alias)));
      }) || null;
  };
  const selectedTab = () => section.querySelector('.domain-tab[aria-selected="true"]') || section.querySelector('.domain-tab');
  const projectedDomainIdsForEntry = entry => {
    const explicit = asList(entry?.workProjection?.domainIds).map(normalize).filter(Boolean);
    if (explicit.length) return explicit;
    const search = entry?.workProjection?.searchIndexV2 || {};
    const publicSignals = [
      ...asList(search?.problemTags?.en),
      ...asList(search?.problemTags?.zh),
      ...asList(search?.capabilityTags?.en),
      ...asList(search?.capabilityTags?.zh)
    ].map(normalize).filter(Boolean);
    const operationsSignal = publicSignals.some(signal =>
      signal.includes('operations') ||
      signal.includes('operational') ||
      signal.includes('workflow') ||
      signal.includes('project-health') ||
      signal.includes('workload-planning')
    );
    return operationsSignal ? ['operations'] : [];
  };
  const canonicalDomainKey = domain => {
    const signals = [domain?.id, localize(domain?.label), ...asList(domain?.legacyAliases)].map(normalize).filter(Boolean);
    return Object.keys(aliasMap).find(key => [key, ...aliasMap[key]].some(alias => signals.some(signal => signal === alias || signal.includes(alias)))) || normalize(domain?.id);
  };
  const registryProjectsForDomain = domain => {
    if (!domain) return [];
    const key = canonicalDomainKey(domain);
    const accepted = new Set([key, ...(aliasMap[key] || [])].map(normalize));
    return Object.values(REGISTRY.routes || {})
      .filter(entry => entry.publicDiscovery === true && projectedDomainIdsForEntry(entry).some(id => accepted.has(normalize(id))))
      .map(entry => entry.projectId);
  };
  const projectIdsForDomain = domain => {
    if (!domain) return [];
    const base = [...asList(domain.featuredProjectIds), ...asList(domain.supportingProjectIds)];
    return [...new Set([...base, ...registryProjectsForDomain(domain)])].filter(key => publicProjects[key]);
  };

  const readYear = (project, projection) => {
    const raw = firstText(projection?.period, project?.year, project?.period, project?.heroMetadata?.year, project?.heroMetadata?.period, project?.timeline_pair, project?.timeline);
    return raw.match(/(?:19|20)\d{2}/)?.[0] || raw;
  };
  const readType = (key, project, projection) => key === 'daily-hours' ? '0→1 Product' : firstText(projection?.type, project?.type, project?.infoGrid?.type, project?.type_pair, project?.projectType, project?.project_type, project?.systemClassification?.publicLabel, project?.systemClassification?.label);
  const companyFor = (key, project, projection) => key === 'daily-hours' ? 'Shulin Studio' : (projection?.company || firstText(project?.company) || (project?.presentationContract !== 'legacy' ? 'Independent' : ''));
  const titleFor = (project, projection, key) => visibleProjectTitle(firstText(projection?.title, language() === 'zh' ? project?.transformation_zh : project?.transformation, project?.transformation, project?.title_pair, project?.title, key));

  const conciseMetricLabel = label => {
    const text = String(label || '').trim();
    const normalized = text.toLowerCase();
    if (/success/.test(normalized)) return 'success rate';
    if (/transaction/.test(normalized)) return 'transactions';
    if (/market|countr/.test(normalized)) return 'markets';
    if (/user/.test(normalized)) return 'users';
    if (/store/.test(normalized)) return 'stores';
    if (/redemption/.test(normalized)) return 'redemptions';
    if (/conversion/.test(normalized)) return 'conversion';
    if (/decision/.test(normalized)) return 'decision model';
    const cleaned = text.replace(/[+/]/g,' ').replace(/[^\p{L}\p{N}%×~.-]+/gu,' ').trim();
    return cleaned.split(/\s+/).filter(Boolean).slice(0,2).join(' ');
  };
  const proofTier = (value, rawLabel) => {
    const label = String(rawLabel || '').trim();
    if (/timeline|duration|interviews?|participants?|respondents?|functions?|flows?|prototypes?|usability tasks?/i.test(label)) return 0;
    const text = `${label} ${value}`.toLowerCase();
    if (/success|conversion|completion|adoption|active|usage|nps|satisfaction|retention|redemption|share|rate|faster|efficien|reduc|increas|improv|saved|accuracy|quality|error|lift|growth/.test(text)) return 2;
    if (/user|transaction|store|market|countr|bank|device|platform|channel|region|customer|booking|service|system|workflow|decision model/.test(text)) return 1;
    return 0;
  };
  const collectMetrics = project => {
    const sources = [project?.cardMetrics, project?.primaryMetrics, project?.metrics, project?.impactEvidence?.primaryMetrics, project?.impact_evidence?.primaryMetrics, project?.impactEvidence?.supportingMetrics, project?.impact_evidence?.supportingMetrics];
    const candidates = [];
    const seen = new Set();
    for (const source of sources) {
      if (!Array.isArray(source)) continue;
      for (const item of source) {
        const value = firstText(item?.value,item?.metric,item?.amount);
        const rawLabel = firstText(item?.label,item?.name,item?.description);
        const label = conciseMetricLabel(rawLabel);
        const tier = proofTier(value,rawLabel);
        const metricKey = `${value}|${label}`;
        if (!value || !label || !tier || seen.has(metricKey)) continue;
        seen.add(metricKey);candidates.push({value,label,tier});
      }
    }
    return candidates.sort((a,b)=>b.tier-a.tier).slice(0,3);
  };

  const buildVisual = (project,key,projection) => {
    const visual = document.createElement('div');
    visual.className = 'domain-project-card-v2__visual';
    const assetId = projection?.coverAssetId || project?.coverAssetId || project?.hero_visual_brief?.assetId || project?.heroVisualBrief?.assetId;
    const caseAsset = project?.presentationContract !== 'legacy' ? window.CASE_STUDY_ASSETS?.[key]?.assets?.[assetId] : null;
    const asset = caseAsset ? {src:caseAsset.publicPath,alt:caseAsset.alt,width:caseAsset.width,height:caseAsset.height} : (assetId ? window.resolveProjectAsset?.(assetId,key) : null);
    if (asset?.src) {
      const img = document.createElement('img');
      img.className = 'domain-project-card-v2__image';
      img.src = asset.src;img.alt = scalarText(asset.alt);img.loading='eager';img.decoding='async';img.draggable=false;
      if (asset.width && asset.height) {img.width=asset.width;img.height=asset.height}
      visual.append(img);
    } else {
      const fallback=document.createElement('span');fallback.className='domain-project-card-v2__visual-fallback';fallback.textContent=companyFor(key,project,projection);visual.append(fallback);
    }
    return visual;
  };

  const buildCard = key => {
    const project = publicProjects[key] || {};
    const projection = projectionForProject(key);
    const article = document.createElement('article');
    article.className='domain-project-card-v2 domain-project-card-v2--large';
    article.dataset.project=key;article.dataset.projectCardSystem='shared-v1';article.dataset.projectCardVariant='featured';
    const content=document.createElement('div');content.className='domain-project-card-v2__content';
    const meta=document.createElement('div');meta.className='domain-project-card-v2__meta';
    const type=document.createElement('span');type.className='domain-project-card-v2__type';type.textContent=readType(key,project,projection);
    const identity=document.createElement('span');identity.className='domain-project-card-v2__identity';
    const company=document.createElement('strong');company.className='domain-project-card-v2__company';company.textContent=companyFor(key,project,projection);identity.append(company);
    const year=readYear(project,projection);if(year){const dot=document.createElement('span');dot.setAttribute('aria-hidden','true');dot.textContent='·';const yearNode=document.createElement('span');yearNode.className='domain-project-card-v2__year';yearNode.textContent=year;identity.append(dot,yearNode)}
    if(type.textContent)meta.append(type);meta.append(identity);
    const title=document.createElement('h3');title.className='domain-project-card-v2__title';title.textContent=titleFor(project,projection,key);
    const metrics=collectMetrics(project);const metricList=document.createElement('dl');metricList.className='domain-project-card-v2__metrics';metricList.dataset.metricCount=String(metrics.length);metricList.setAttribute('aria-hidden',String(metrics.length===0));metricList.style.gridTemplateColumns=`repeat(${Math.max(metrics.length,1)},minmax(0,1fr))`;
    metrics.forEach(({value})=>{const dt=document.createElement('dt');dt.className='domain-project-card-v2__metric-value';dt.textContent=value;metricList.append(dt)});
    metrics.forEach(({label})=>{const dd=document.createElement('dd');dd.className='domain-project-card-v2__metric-label';dd.textContent=label;metricList.append(dd)});
    const cta=document.createElement('a');cta.className='domain-project-card-v2__cta';cta.href=routeForProject(key);const ctaLabel=document.createElement('span');ctaLabel.textContent='View case';const arrow=document.createElement('span');arrow.className='domain-project-card-v2__cta-arrow icon-arrow icon-arrow--right';arrow.setAttribute('aria-hidden','true');cta.append(ctaLabel,arrow);
    content.append(meta,title,metricList,cta);article.append(content,buildVisual(project,key,projection));return article;
  };

  let cards=[];let activeIndex=0;let pointerStartX=null;let pointerStartY=null;let pointerId=null;let pointerCaptureCard=null;let suppressClickUntil=0;let renderFrame=0;let pendingTab=null;
  const shortestOffset=(index,active,total)=>{let offset=index-active;if(offset>total/2)offset-=total;if(offset<-total/2)offset+=total;return offset};
  const syncWheel=()=>cards.forEach((card,index)=>{const offset=shortestOffset(index,activeIndex,cards.length);card.dataset.wheelOffset=String(offset);card.dataset.wheelState=offset===0?'active':Math.abs(offset)===1?'adjacent':Math.abs(offset)===2?'secondary':'hidden';card.setAttribute('aria-hidden',String(Math.abs(offset)>2));card.tabIndex=Math.abs(offset)<=1?0:-1});
  const setActive=index=>{if(!cards.length)return;activeIndex=(index+cards.length)%cards.length;syncWheel()};
  const step=delta=>setActive(activeIndex+delta);
  const controls=()=>{
    projectPanel?.querySelector('.domain-wheel-v2__controls')?.remove();
    if(cards.length<=1)return;
    const wrap=document.createElement('div');wrap.className='domain-wheel-v2__controls';
    const prev=document.createElement('button');prev.type='button';prev.className='domain-wheel-v2__control';prev.setAttribute('aria-label','Previous project');prev.innerHTML='<span class="icon-arrow icon-arrow--left" aria-hidden="true"></span>';
    const next=document.createElement('button');next.type='button';next.className='domain-wheel-v2__control';next.setAttribute('aria-label','Next project');next.innerHTML='<span class="icon-arrow icon-arrow--right" aria-hidden="true"></span>';
    prev.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();step(-1)});next.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();step(1)});wrap.append(prev,next);related.append(wrap);
  };
  const render=tab=>{
    const domain=resolveDomain(tab||pendingTab||selectedTab());const ids=projectIdsForDomain(domain);if(!ids.length)return;
    activeIndex=0;cards=ids.map(buildCard);syncWheel();related.replaceChildren(...cards);related.classList.add('domain-wheel-v2');related.removeAttribute('data-rail');related.removeAttribute('data-card-variant');controls();resetDisclosures();related.dataset.domainPresentationId=domain?.id||tab?.dataset.domain||'';pendingTab=null;
  };
  const schedule=tab=>{if(tab)pendingTab=tab;cancelAnimationFrame(renderFrame);renderFrame=requestAnimationFrame(()=>requestAnimationFrame(()=>render(pendingTab)))};

  related.addEventListener('click',event=>{
    if(performance.now()<suppressClickUntil){event.preventDefault();event.stopPropagation();return}
    const card=event.target.closest('.domain-project-card-v2');if(!card)return;const index=cards.indexOf(card);if(index<0)return;if(index!==activeIndex){event.preventDefault();setActive(index);return}if(event.target.closest('.domain-project-card-v2__cta'))return;if(usesStandalonePage(card.dataset.project)){event.preventDefault();window.location.href=routeForProject(card.dataset.project);return}
    // Legacy ProjectCards deliberately fall through to app.js. The shared legacy
    // detail owner opens the dialog and pushes the canonical /work/{slug} URL.
  });
  related.addEventListener('keydown',event=>{const card=event.target.closest('.domain-project-card-v2');if(!card||event.target.closest('.domain-project-card-v2__cta'))return;if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();step(event.key==='ArrowRight'?1:-1);cards[activeIndex]?.focus({preventScroll:true})}else if(['Enter',' '].includes(event.key)&&cards.indexOf(card)===activeIndex){event.preventDefault();if(usesStandalonePage(card.dataset.project)){window.location.href=routeForProject(card.dataset.project)}else{card.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))}}});
  related.addEventListener('pointerdown',event=>{if(!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0)||event.target.closest('.domain-wheel-v2__control,.domain-project-card-v2__cta'))return;const card=event.target.closest('.domain-project-card-v2');if(!card)return;pointerStartX=event.clientX;pointerStartY=event.clientY;pointerId=event.pointerId;pointerCaptureCard=card;try{card.setPointerCapture?.(event.pointerId)}catch{}});
  related.addEventListener('pointerup',event=>{if(pointerId===null||event.pointerId!==pointerId||pointerStartX===null||pointerStartY===null)return;const dx=event.clientX-pointerStartX,dy=event.clientY-pointerStartY;try{if(pointerCaptureCard?.hasPointerCapture?.(event.pointerId))pointerCaptureCard.releasePointerCapture(event.pointerId)}catch{}pointerStartX=pointerStartY=pointerId=pointerCaptureCard=null;if(Math.abs(dx)<36||Math.abs(dx)<=Math.abs(dy))return;suppressClickUntil=performance.now()+250;step(dx<0?1:-1)});
  related.addEventListener('pointercancel',()=>{pointerStartX=pointerStartY=pointerId=pointerCaptureCard=null});

  section.querySelectorAll('.domain-tab').forEach(tab=>tab.addEventListener('click',()=>{resetDisclosures();pendingTab=tab;setTimeout(()=>render(tab),0)}));
  document.addEventListener('portfolio:language',()=>{enhanceTabs();resetDisclosures();schedule()});
  if(stage)stage.dataset.styleBDomainStage='featured-wheel-v2';
  schedule();
})();
