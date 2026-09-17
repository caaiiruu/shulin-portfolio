(() => {
  'use strict';

  const DATA = window.PORTFOLIO_RUNTIME_DATA || window.PORTFOLIO_DATA || {};
  const REGISTRY = window.PROJECT_PRESENTATION_REGISTRY || {};
  const workFilterRegistry = Array.isArray(DATA.workIndex?.workFilters) ? DATA.workIndex.workFilters : [];
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

  if (!document.querySelector('script[data-project-card-media="shared-v1"]')) {
    const mediaScript = document.createElement('script');
    mediaScript.src = '/site/assets/js/project-card-media.js';
    mediaScript.defer = true;
    mediaScript.dataset.projectCardMedia = 'shared-v1';
    document.body.append(mediaScript);
  }

  /* CSV2 exits app.js before the legacy shared-header interaction block. This
     bridge binds the SAME shared SiteHeader markup on non-legacy routes only. */
  const bindSharedChromeForPresentationRoute = () => {
    const path = window.location.pathname.replace(/\/$/,'') || '/';
    const route = REGISTRY.routes?.[path];
    if (!route || route.presentationContract === 'legacy') return;
    const header = document.querySelector('.site-header');
    if (!header || header.dataset.sharedChromeBound === 'true') return;
    header.dataset.sharedChromeBound = 'true';
    const menu = document.getElementById('mobileMenu');
    const toggle = document.querySelector('.menu-toggle');
    if (!menu || !toggle) return;
    const setOpen = open => {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
      if (open) menu.querySelector('a')?.focus();
    };
    toggle.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
    menu.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
    document.addEventListener('click', event => { if (menu.classList.contains('is-open') && !event.target.closest('.site-header')) setOpen(false); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.classList.contains('is-open')) { setOpen(false); toggle.focus(); } });
    window.matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) setOpen(false); });
  };
  bindSharedChromeForPresentationRoute();

  if (document.getElementById('domains')) {
    if (!document.querySelector('script[data-style-b-owner="domain-experience"]')) {
      const script = document.createElement('script');
      script.src = '/site/assets/js/domain-experience.js';
      script.defer = true;
      script.dataset.styleBOwner = 'domain-experience';
      document.body.append(script);
    }
  }

  const sourceLibrary = document.querySelector('.work-library-v32');
  const sourceHero = document.querySelector('.work-page-hero-v32');
  const sourceGallery = document.getElementById('workGallery');
  const sourceArchive = document.getElementById('workArchiveGrid');
  if (!sourceLibrary || !sourceGallery) {
    const rail = document.getElementById('workFilterRail');
    if (rail) {
      const reset = () => { rail.scrollLeft = 0; };
      requestAnimationFrame(reset);
      window.addEventListener('pageshow', reset);
    }
    return;
  }

  if (!document.querySelector('link[data-style-b-owner="work-index"]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = '/site/assets/css/components/work-index.css';
    style.dataset.styleBOwner = 'work-index';
    document.head.append(style);
  }

  const publicProjects = DATA.publicProjects || DATA.projects || {};
  const registryEntryForProject = id => Object.entries(REGISTRY.routes || {})
    .map(([route, entry]) => ({ route, entry }))
    .find(({ entry }) => entry.projectId === id && entry.publicDiscovery === true) || null;
  const projectionForProject = id => registryEntryForProject(id)?.entry?.workProjection || null;
  const projectIdFromCard = card => {
    if (card?.dataset?.workIndexProject) return card.dataset.workIndexProject;
    const control = card.querySelector('.work-card-v32__button');
    if (control?.dataset.project) return control.dataset.project;
    const route = control?.dataset.publicWorkRoute || control?.getAttribute('href');
    if (route) return REGISTRY.routes?.[route]?.projectId || String(route).split('?')[0].split('#')[0].split('/').filter(Boolean).pop() || '';
    return '';
  };
  const canonicalRouteForProject = id => registryEntryForProject(id)?.route || projectionForProject(id)?.route || `/work/${encodeURIComponent(id)}`;
  const presentationEntryForProject = id => registryEntryForProject(id)?.entry || null;
  const usesStandalonePage = id => {
    const entry = presentationEntryForProject(id);
    return Boolean(entry && entry.presentationContract && entry.presentationContract !== 'legacy');
  };
  const normalizeCardNavigation = (id, control) => {
    const href = canonicalRouteForProject(id);
    let link = control;
    if (control.tagName !== 'A') {
      link = document.createElement('a');
      [...control.attributes].forEach(({ name, value }) => {
        if (name !== 'type') link.setAttribute(name, value);
      });
      while (control.firstChild) link.append(control.firstChild);
      control.replaceWith(link);
    }
    link.setAttribute('href', href);
    link.dataset.publicWorkRoute = href;
    if (usesStandalonePage(id) && id !== 'daily-hours') link.removeAttribute('data-project');
    else link.dataset.project = id;
    link.setAttribute('aria-label', link.getAttribute('aria-label') || `View ${id} case study`);
    return link;
  };
  const allSourceCards = () => [...sourceGallery.querySelectorAll(':scope > .work-card-v32'), ...(sourceArchive ? [...sourceArchive.querySelectorAll(':scope > .work-card-v32')] : [])]
    .filter((card, index, array) => array.indexOf(card) === index && projectIdFromCard(card));

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
  const readYear = (project, projection, card) => {
    const raw = firstText(projection?.period, project?.year, project?.period, project?.timeline, project?.timeline_pair, card?.dataset.projectDate);
    return raw.match(/(?:19|20)\d{2}/)?.[0] || String(raw).slice(0,4);
  };
  const readType = (id, project, projection) => id === 'daily-hours' ? '0→1 Product' : firstText(projection?.type, project?.infoGrid?.type, project?.type_pair, project?.type, project?.systemClassification?.publicLabel, 'Work');
  const readCompany = (id, project, projection) => id === 'daily-hours' ? 'Shulin Studio' : (projection?.company || firstText(project?.company) || (project?.presentationContract !== 'legacy' ? 'Independent' : ''));
  const readTitle = (project, projection, id, card) => id === 'daily-hours' ? 'Track work. Decide what’s worth it.' : visibleProjectTitle(firstText(projection?.cardTitle, projection?.title, language() === 'zh' ? project?.transformation_zh : project?.transformation, project?.transformation, project?.title_pair, project?.title, card.querySelector('h2')?.textContent, id));

  const conciseMetricLabel = label => {
    const text = String(label || '').trim();
    const n = text.toLowerCase();
    if (/success/.test(n)) return 'success rate';
    if (/transaction/.test(n)) return 'transactions';
    if (/market|countr/.test(n)) return 'markets';
    if (/user/.test(n)) return 'users';
    if (/store/.test(n)) return 'stores';
    if (/redemption/.test(n)) return 'redemptions';
    if (/conversion/.test(n)) return 'conversion';
    if (/decision/.test(n)) return 'decision model';
    const cleaned = text.replace(/[+/]/g,' ').replace(/[^\p{L}\p{N}%×~.-]+/gu,' ').trim();
    return cleaned.split(/\s+/).filter(Boolean).slice(0,2).join(' ');
  };
  const proofTier = (value, label) => {
    const raw = String(label || '');
    if (/timeline|duration|interviews?|participants?|respondents?|functions?|flows?|prototypes?|usability tasks?/i.test(raw)) return 0;
    const text = `${raw} ${value}`.toLowerCase();
    if (/success|conversion|completion|adoption|active|usage|nps|satisfaction|retention|redemption|share|rate|faster|efficien|reduc|increas|improv|saved|accuracy|quality|error|lift|growth/.test(text)) return 2;
    if (/user|transaction|store|market|countr|bank|device|platform|channel|region|customer|booking|service|system|workflow|decision model/.test(text)) return 1;
    return 0;
  };
  const metricsFor = project => {
    const sources = [project?.cardMetrics,project?.primaryMetrics,project?.metrics,project?.impactEvidence?.primaryMetrics,project?.impact_evidence?.primaryMetrics,project?.impactEvidence?.supportingMetrics,project?.impact_evidence?.supportingMetrics];
    const out=[];const seen=new Set();
    for (const source of sources) {
      if (!Array.isArray(source)) continue;
      for (const item of source) {
        const value=firstText(item?.value,item?.metric,item?.amount);const rawLabel=firstText(item?.label,item?.name,item?.description);const label=conciseMetricLabel(rawLabel);const tier=proofTier(value,rawLabel);const fingerprint=`${value}|${label}`;
        if(!value||!label||!tier||seen.has(fingerprint))continue;seen.add(fingerprint);out.push({value,label,tier});
      }
    }
    return out.sort((a,b)=>b.tier-a.tier).slice(0,3);
  };

  const normalizeCategories = (id,projection) => [...new Set(['all', ...workFilterRegistry
    .filter(filter => filter.id !== 'all' && Array.isArray(filter.projectIds) && filter.projectIds.includes(id))
    .map(filter => filter.id), ...(Array.isArray(projection?.filterIds) ? projection.filterIds : [])])];

  const decorateCard = (card, variant) => {
    const id=projectIdFromCard(card);const project=publicProjects[id]||{};const projection=projectionForProject(id);let control=card.querySelector('.work-card-v32__button');const content=card.querySelector('.work-card-v32__content');if(!id||!control||!content)return null;
    control=normalizeCardNavigation(id,control);
    card.dataset.projectCardSystem='shared-v1';card.dataset.projectCardVariant=variant;card.dataset.workIndexProject=id;card.dataset.workCategories=normalizeCategories(id,projection).join(' ');
    card.classList.remove('work-card-v32--featured','work-card-v32--compact');
    const meta=document.createElement('div');meta.className='project-card__meta';
    const type=document.createElement('span');type.className='project-card__type';type.textContent=readType(id,project,projection);
    const identity=document.createElement('span');identity.className='project-card__identity';const company=document.createElement('strong');company.className='project-card__company';company.textContent=readCompany(id,project,projection);identity.append(company);const year=readYear(project,projection,card);if(year){const dot=document.createElement('span');dot.setAttribute('aria-hidden','true');dot.textContent='·';const y=document.createElement('span');y.className='project-card__year';y.textContent=year;identity.append(dot,y)}meta.append(type,identity);
    const title=document.createElement('h2');title.className='project-card__title';title.textContent=readTitle(project,projection,id,card);
    const rows=metricsFor(project);const metrics=document.createElement('dl');metrics.className='project-card__metrics';metrics.dataset.metricCount=String(rows.length);metrics.style.setProperty('--project-card-metric-count',String(Math.max(rows.length,1)));metrics.setAttribute('aria-hidden',String(rows.length===0));rows.forEach(({value,label})=>{const item=document.createElement('div');item.className='project-card__metric';const dt=document.createElement('dt');dt.className='project-card__metric-value';dt.textContent=value;const dd=document.createElement('dd');dd.className='project-card__metric-label';dd.textContent=label;item.append(dt,dd);metrics.append(item)});
    const action=document.createElement('span');action.className='work-card-v32__action related-project-card__action text-cta';const actionLabel=document.createElement('span');actionLabel.textContent='View case';const arrow=document.createElement('span');arrow.className='icon-arrow icon-arrow--right';arrow.setAttribute('aria-hidden','true');action.append(actionLabel,arrow);
    content.replaceChildren(meta,title,metrics,action);
    return card;
  };

  const taxonomy=workFilterRegistry.map(filter=>[filter.id,localize(filter.label)]);
  let activeFilter='all';
  const applyFilter=(root,render)=>{
    root.querySelectorAll('.work-index-filter').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.workIndexFilter===activeFilter)));
    render(activeFilter);
  };

  const build = () => {
    if (document.querySelector('.work-index[data-style-b-integrated="true"]')) return true;
    const cards=allSourceCards();
    if(cards.length<5)return false;
    const byId=new Map(cards.map(card=>[projectIdFromCard(card),card]));
    const preferred=(DATA.workIndex?.principalPortfolioArchitecture?.featuredOrder||[]).filter(id=>byId.has(id));
    const ordered=[...preferred,...cards.map(projectIdFromCard).filter(id=>!preferred.includes(id))].map(id=>byId.get(id)).filter(Boolean);

    const root=document.createElement('section');root.className='work-index';root.dataset.styleBIntegrated='true';
    const shell=document.createElement('div');shell.className='page-shell work-index__shell';
    const filters=document.createElement('div');filters.className='work-index__filters';filters.setAttribute('role','group');filters.setAttribute('aria-label','Filter work by type');

    const featured=document.createElement('div');featured.className='work-index__featured';
    const filtered=document.createElement('div');filtered.className='work-index__filtered-results';filtered.hidden=true;
    const more=document.createElement('section');more.className='work-index__more';const moreHead=document.createElement('div');moreHead.className='work-index__more-head';const moreTitle=document.createElement('h2');moreTitle.textContent='More work';moreHead.append(moreTitle);const moreGrid=document.createElement('div');moreGrid.className='work-index__more-grid';more.append(moreHead,moreGrid);
    const decorated=ordered.map((card,index)=>decorateCard(card,index===0?'featured':index<4?'standard':'compact'));
    const renderAll=()=>{
      featured.replaceChildren();moreGrid.replaceChildren();
      decorated.forEach((card,index)=>{
        card.dataset.projectCardVariant=index===0?'featured':index<4?'standard':'compact';
        if(index<1)featured.append(card);
      });
      const mediumRow=document.createElement('div');mediumRow.className='work-index__featured-secondary-row';decorated.slice(1,4).forEach(card=>mediumRow.append(card));if(mediumRow.children.length)featured.append(mediumRow);
      decorated.slice(4).forEach(card=>moreGrid.append(card));
      featured.hidden=false;more.hidden=moreGrid.children.length===0;filtered.hidden=true;filtered.replaceChildren();
    };
    const renderFilter=filter=>{
      if(filter==='all'){renderAll();return}
      const matches=decorated.filter(card=>card.dataset.workCategories.split(/\s+/).includes(filter));
      filtered.replaceChildren();filtered.dataset.resultCount=String(matches.length);
      matches.forEach((card,index)=>{
        card.dataset.projectCardVariant=matches.length===1||matches.length===2&&index===0?'featured':matches.length===2?'compact':'standard';
        card.dataset.filterResultRole=matches.length===1?'featured':matches.length===2?(index===0?'featured':'secondary'):'grid';
        filtered.append(card);
      });
      featured.hidden=true;more.hidden=true;filtered.hidden=false;
    };
    taxonomy.forEach(([id,label])=>{const button=document.createElement('button');button.type='button';button.className='work-index-filter';button.dataset.workIndexFilter=id;button.textContent=label;button.setAttribute('aria-pressed',String(id==='all'));button.addEventListener('click',()=>{activeFilter=id;applyFilter(root,renderFilter)});filters.append(button)});
    shell.append(filters,featured,filtered,more);root.append(shell);
    if(sourceHero){
      const kicker=sourceHero.querySelector('.kicker');const heading=sourceHero.querySelector('h1');
      if(kicker)kicker.textContent='WORK';if(heading)heading.textContent='Systems for complex product problems.';
      sourceHero.hidden=false;sourceHero.insertAdjacentElement('afterend',root);
    }else sourceLibrary.insertAdjacentElement('beforebegin',root);
    sourceLibrary.hidden=true;applyFilter(root,renderFilter);return true;
  };

  if(!build()){
    const observer=new MutationObserver(()=>{if(build())observer.disconnect()});
    observer.observe(document.body,{childList:true,subtree:true});
    window.setTimeout(()=>observer.disconnect(),10000);
  }
})();
