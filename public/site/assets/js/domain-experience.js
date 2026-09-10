(() => {
  'use strict';

  const section = document.getElementById('domains');
  if (!section || section.dataset.domainGoldenReferenceMounted === 'true') return;
  section.dataset.domainGoldenReferenceMounted = 'true';
  section.classList.add('domain-experience');

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '/site/assets/css/components/domain-experience.css';
  style.dataset.styleBOwner = 'domain-experience';
  document.head.append(style);

  const DATA = window.PORTFOLIO_RUNTIME_DATA || window.PORTFOLIO_DATA || {};
  const related = document.getElementById('relatedProjects');
  const stage = document.getElementById('domainStage');
  const contentRail = document.getElementById('domainContentRail');
  const language = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';

  let viewportSyncFrame = 0;
  const syncViewportWidth = () => {
    section.style.setProperty('--domain-viewport-width', `${document.documentElement.clientWidth}px`);
  };
  syncViewportWidth();
  window.addEventListener('resize', () => {
    cancelAnimationFrame(viewportSyncFrame);
    viewportSyncFrame = requestAnimationFrame(syncViewportWidth);
  });

  const localize = (value) => {
    if (Array.isArray(value)) return value[language() === 'zh' ? 1 : 0] ?? value[0] ?? '';
    if (value && typeof value === 'object' && ('en' in value || 'zh' in value)) {
      return language() === 'zh' ? (value.zh ?? value.en ?? '') : (value.en ?? value.zh ?? '');
    }
    return value ?? '';
  };

  const scalarText = (value, depth = 0) => {
    if (value == null || depth > 4) return '';
    const localized = localize(value);
    if (localized == null) return '';
    if (typeof localized === 'string' || typeof localized === 'number') return String(localized).trim();
    if (Array.isArray(localized)) {
      for (const item of localized) {
        const text = scalarText(item, depth + 1);
        if (text) return text;
      }
      return '';
    }
    if (typeof localized === 'object') {
      for (const key of ['value', 'label', 'text', 'publicLabel', 'title', 'name']) {
        const text = scalarText(localized[key], depth + 1);
        if (text) return text;
      }
    }
    return '';
  };
  const firstText = (...values) => values.map(scalarText).find(Boolean) || '';
  const asList = (value) => Array.isArray(value) ? value : value == null ? [] : [value];

  const tabIcon = {
    finance: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h18M5 10V20M9 10V20M15 10V20M19 10V20M3 20h18M12 3 3 8h18L12 3Z"/></svg>',
    operations: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="6" height="6"/><rect x="15" y="3" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/><rect x="15" y="15" width="6" height="6"/><path d="M9 6h6M6 9v6M18 9v6M9 18h6"/></svg>',
    growth: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16v12H4zM12 9v12M3 9h18M7 9c-2.5 0-3.5-1.5-3.5-3S5 3.5 6.5 4.5L12 9M17 9c2.5 0 3.5-1.5 3.5-3S19 3.5 17.5 4.5L12 9"/></svg>',
    travel: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9Z"/></svg>',
    commerce: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
    learning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5c3-1 6-.5 9 1.5v13c-3-2-6-2.5-9-1.5v-13ZM21 5.5c-3-1-6-.5-9 1.5v13c3-2 6-2.5 9-1.5v-13Z"/></svg>'
  };
  const ICON_KEY_BY_DOMAIN = {
    operations:'operations','enterprise-operations':'operations',operational:'operations',
    finance:'finance','financial-services':'finance',financial:'finance',
    commerce:'commerce','retail-commerce':'commerce','retail-and-commerce':'commerce',retail:'commerce',
    travel:'travel','travel-platforms':'travel',mobility:'travel',
    growth:'growth','growth-incentive-systems':'growth','rewards-incentives':'growth',rewards:'growth',incentive:'growth',
    learning:'learning','learning-platforms':'learning',education:'learning'
  };
  const normalizeDomainKey = (value) => String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const iconKeyForTab = (tab) => {
    const direct = normalizeDomainKey(tab?.dataset.domain);
    if (ICON_KEY_BY_DOMAIN[direct]) return ICON_KEY_BY_DOMAIN[direct];
    const label = normalizeDomainKey(tab?.querySelector('strong')?.textContent);
    if (label.includes('financial')) return 'finance';
    if (label.includes('retail') || label.includes('commerce')) return 'commerce';
    if (label.includes('travel')) return 'travel';
    if (label.includes('reward') || label.includes('incentive')) return 'growth';
    if (label.includes('learning')) return 'learning';
    return 'operations';
  };

  const enhanceTabs = () => {
    section.querySelectorAll('.domain-tab').forEach((tab) => {
      const number = tab.querySelector(':scope > span:not(.domain-tab__icon)');
      if (number) number.classList.add('domain-tab__number');
      const strong = tab.querySelector('strong');
      if (strong) strong.classList.add('domain-tab__label');
      const existing = tab.querySelector('.domain-tab__icon');
      const iconKey = iconKeyForTab(tab);
      if (existing) {
        if (existing.dataset.iconKey !== iconKey) existing.innerHTML = tabIcon[iconKey];
        existing.dataset.iconKey = iconKey;
        return;
      }
      const icon = document.createElement('span');
      icon.className = 'domain-tab__icon';
      icon.dataset.iconKey = iconKey;
      icon.innerHTML = tabIcon[iconKey];
      tab.prepend(icon);
    });
  };
  enhanceTabs();

  const projectPanel = related?.closest('.domain-panel-v30--projects');
  const problemsPanel = document.getElementById('domainProblems')?.closest('.domain-panel-v30');
  const solutionsPanel = document.getElementById('domainSolutions')?.closest('.domain-panel-v30');
  if (contentRail && projectPanel) contentRail.prepend(projectPanel);

  const makeDisclosure = (panel) => {
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

  const legacyHeading = projectPanel?.querySelector('.rail-heading');
  if (legacyHeading) legacyHeading.classList.add('domain-experience__project-heading');

  const DOMAIN_ALIASES = {
    operations: ['enterprise-operations', 'operations', 'operational'],
    finance: ['financial-services', 'finance', 'financial'],
    commerce: ['retail-commerce', 'retail-and-commerce', 'commerce', 'retail'],
    travel: ['travel-platforms', 'travel', 'mobility'],
    growth: ['growth-incentive-systems', 'rewards-incentives', 'incentive', 'rewards', 'growth'],
    learning: ['learning-platforms', 'learning', 'education']
  };

  const canonicalDomains = () => asList(DATA.contentDiscovery?.domains);
  const normalize = (value) => String(value || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const resolveDomain = (tab) => {
    const key = tab?.dataset.domain || '';
    const aliases = DOMAIN_ALIASES[key] || [key];
    const domains = canonicalDomains();
    return domains.find((domain) => aliases.includes(normalize(domain.id))) ||
      domains.find((domain) => {
        const searchable = [domain.id, localize(domain.label), ...asList(domain.legacyAliases)].map(normalize).join(' ');
        return aliases.some((alias) => searchable.includes(normalize(alias)));
      }) || null;
  };
  const selectedTab = () => section.querySelector('.domain-tab[aria-selected="true"]') || section.querySelector('.domain-tab');
  const projectIdsForDomain = (domain) => {
    if (!domain) return [];
    return [...new Set([...asList(domain.featuredProjectIds), ...asList(domain.supportingProjectIds)])]
      .filter((key) => DATA.projects?.[key]);
  };

  let activeIndex = 0;
  let cards = [];
  let pointerStartX = null;
  let pointerStartY = null;
  let activePointerId = null;
  let suppressClickUntil = 0;
  let rendering = false;
  let renderFrame = 0;
  let pendingRenderTab = null;
  let tabRenderGeneration = 0;

  const readYear = (project) => {
    const raw = firstText(project?.year, project?.period, project?.heroMetadata?.year, project?.heroMetadata?.period, project?.timeline_pair, project?.timeline);
    return raw.match(/(?:19|20)\d{2}/)?.[0] || raw;
  };
  const readType = (project) => firstText(project?.type, project?.infoGrid?.type, project?.type_pair, project?.projectType, project?.project_type, project?.systemClassification?.publicLabel, project?.systemClassification?.label);

  const conciseMetricLabel = (label) => {
    const text = String(label || '').trim();
    const normalized = text.toLowerCase();
    const zh = language() === 'zh';
    if (/programme|program/.test(normalized)) return zh ? '計畫' : 'programme';
    if (/digital.*share|share.*digital|redemption share|campaign.*share/.test(normalized)) return zh ? '數位佔比' : 'digital share';
    if (/redemption/.test(normalized)) return zh ? '兌換' : 'redemptions';
    if (/interview/.test(normalized)) return zh ? '訪談' : 'interviews';
    if (/participant|respondent/.test(normalized)) return zh ? '參與者' : 'participants';
    if (/core.*function|function|flow/.test(normalized)) return zh ? '功能' : 'functions';
    if (/market|countr/.test(normalized)) return zh ? '市場' : 'markets';
    if (/workflow/.test(normalized)) return zh ? '工作流' : 'workflow';
    if (/decision/.test(normalized)) return zh ? '決策模型' : 'decision model';
    if (/success/.test(normalized)) return zh ? '成功率' : 'success rate';
    if (/transaction/.test(normalized)) return zh ? '交易' : 'transactions';
    if (/month|week|day|timeline|duration/.test(normalized)) return zh ? '期間' : 'timeline';
    if (/time|second|minute|hour/.test(normalized)) return zh ? '時間' : 'time';
    if (/conversion/.test(normalized)) return zh ? '轉換率' : 'conversion';
    if (/user/.test(normalized)) return zh ? '使用者' : 'users';
    if (/store/.test(normalized)) return zh ? '門市' : 'stores';
    const cleaned = text.replace(/[+/]/g, ' ').replace(/[^\p{L}\p{N}%×~.-]+/gu, ' ').trim();
    return cleaned.split(/\s+/).filter(Boolean).slice(0, 2).join(' ');
  };

  const collectMetrics = (project) => {
    const sources = [
      project?.cardMetrics, project?.card_metrics, project?.primaryMetrics, project?.primary_metrics, project?.metrics,
      project?.impactEvidence?.primaryMetrics, project?.impactEvidence?.primary_metrics,
      project?.impact_evidence?.primaryMetrics, project?.impact_evidence?.primary_metrics,
      project?.publicContent?.impactEvidence?.primaryMetrics, project?.publicContent?.impact_evidence?.primary_metrics,
      project?.impactEvidence?.supportingMetrics, project?.impactEvidence?.supporting_metrics,
      project?.impact_evidence?.supportingMetrics, project?.impact_evidence?.supporting_metrics
    ];
    const result = [];
    const seen = new Set();
    for (const source of sources) {
      if (!Array.isArray(source)) continue;
      for (const item of source) {
        if (!item || typeof item !== 'object') continue;
        const value = firstText(item.value, item.metric, item.amount);
        const label = conciseMetricLabel(firstText(item.label, item.name, item.description));
        if (!value || !label) continue;
        const fingerprint = `${value}|${label}`;
        if (seen.has(fingerprint)) continue;
        seen.add(fingerprint);
        result.push({ value, label });
        if (result.length === 3) return result;
      }
    }
    return result;
  };

  const tintPalette = ['rgb(223 235 246)', 'rgb(231 229 249)', 'rgb(248 225 214)', 'rgb(224 241 233)', 'rgb(245 235 210)', 'rgb(230 238 225)'];
  const tintForProject = (key) => {
    const known = { voucher: 'rgb(218 233 247)', payment: 'rgb(223 240 233)', dbs: 'rgb(225 229 250)', booking: 'rgb(235 229 250)', 'game-center': 'rgb(247 226 214)', bandzo: 'rgb(242 234 210)' };
    if (known[key]) return known[key];
    const hash = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return tintPalette[hash % tintPalette.length];
  };

  const buildVisual = (project, key) => {
    const visual = document.createElement('div');
    visual.className = 'domain-project-card-v2__visual';
    const assetId = project?.hero_visual_brief?.assetId || project?.heroVisualBrief?.assetId;
    const asset = assetId ? window.resolveProjectAsset?.(assetId, key) : null;
    if (asset?.src) {
      const img = document.createElement('img');
      img.className = 'domain-project-card-v2__image';
      img.src = asset.src;
      img.alt = scalarText(asset.alt);
      img.loading = 'eager';
      img.decoding = 'async';
      img.draggable = false;
      if (asset.width && asset.height) { img.width = asset.width; img.height = asset.height; }
      visual.append(img);
      return visual;
    }
    const fallback = document.createElement('span');
    fallback.className = 'domain-project-card-v2__visual-fallback';
    fallback.textContent = firstText(project?.company);
    visual.append(fallback);
    return visual;
  };

  const buildCard = (key) => {
    const project = DATA.projects?.[key] || {};
    const article = document.createElement('article');
    article.className = 'domain-project-card-v2 domain-project-card-v2--large';
    article.dataset.projectCardVariant = 'large';
    article.dataset.project = key;
    article.style.setProperty('--project-card-tint', tintForProject(key));

    const body = document.createElement('div');
    body.className = 'domain-project-card-v2__content';
    const meta = document.createElement('div');
    meta.className = 'domain-project-card-v2__meta';
    const type = document.createElement('span');
    type.className = 'domain-project-card-v2__type';
    type.textContent = readType(project);
    const identity = document.createElement('span');
    identity.className = 'domain-project-card-v2__identity';
    const company = document.createElement('strong');
    company.className = 'domain-project-card-v2__company';
    company.textContent = firstText(project?.company);
    identity.append(company);
    const year = readYear(project);
    if (year) {
      const dot = document.createElement('span'); dot.setAttribute('aria-hidden', 'true'); dot.textContent = '·';
      const yearNode = document.createElement('span'); yearNode.className = 'domain-project-card-v2__year'; yearNode.textContent = year;
      identity.append(dot, yearNode);
    }
    if (type.textContent) meta.append(type);
    meta.append(identity);

    const title = document.createElement('h3');
    title.className = 'domain-project-card-v2__title';
    title.textContent = firstText(language() === 'zh' ? project?.transformation_zh : project?.transformation, project?.transformation, project?.title_pair, project?.title);

    const metrics = collectMetrics(project);
    const metricList = document.createElement('dl');
    metricList.className = 'domain-project-card-v2__metrics';
    metricList.dataset.metricCount = String(metrics.length);
    metrics.forEach(({ value }) => { const dt = document.createElement('dt'); dt.className = 'domain-project-card-v2__metric-value'; dt.textContent = value; metricList.append(dt); });
    metrics.forEach(({ label }) => { const dd = document.createElement('dd'); dd.className = 'domain-project-card-v2__metric-label'; dd.textContent = label; metricList.append(dd); });

    const cta = document.createElement('a');
    cta.className = 'domain-project-card-v2__cta';
    cta.href = `/work/${key}`;
    const ctaLabel = document.createElement('span'); ctaLabel.textContent = language() === 'zh' ? '查看案例' : 'View case';
    const arrow = document.createElement('span'); arrow.className = 'domain-project-card-v2__cta-arrow icon-arrow icon-arrow--right'; arrow.setAttribute('aria-hidden', 'true');
    cta.append(ctaLabel, arrow);

    body.append(meta, title);
    if (metrics.length) body.append(metricList);
    body.append(cta);
    article.append(body, buildVisual(project, key));
    return article;
  };

  const shortestOffset = (index, active, total) => {
    let offset = index - active;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    return offset;
  };
  const syncWheel = () => {
    const total = cards.length;
    cards.forEach((card, index) => {
      const offset = shortestOffset(index, activeIndex, total);
      card.dataset.wheelOffset = String(offset);
      card.dataset.wheelState = offset === 0 ? 'active' : Math.abs(offset) === 1 ? 'adjacent' : Math.abs(offset) === 2 ? 'secondary' : 'hidden';
      card.setAttribute('aria-hidden', String(Math.abs(offset) > 2));
      card.tabIndex = Math.abs(offset) <= 1 ? 0 : -1;
    });
  };
  const setActive = (index) => {
    if (!cards.length) return;
    activeIndex = (index + cards.length) % cards.length;
    syncWheel();
  };
  const step = (delta) => setActive(activeIndex + delta);
  const navigateCard = (card) => { const key = card?.dataset.project; if (key) window.location.href = `/work/${key}`; };

  const buildControls = () => {
    let controls = projectPanel?.querySelector('.domain-wheel-v2__controls');
    if (controls) return controls;
    controls = document.createElement('div');
    controls.className = 'domain-wheel-v2__controls';
    controls.setAttribute('aria-label', language() === 'zh' ? '專案輪播控制' : 'Project wheel controls');
    const previous = document.createElement('button');
    previous.type = 'button'; previous.className = 'domain-wheel-v2__control domain-wheel-v2__control--previous'; previous.setAttribute('aria-label', language() === 'zh' ? '上一個專案' : 'Previous project'); previous.innerHTML = '<span class="icon-arrow icon-arrow--left" aria-hidden="true"></span>';
    const next = document.createElement('button');
    next.type = 'button'; next.className = 'domain-wheel-v2__control domain-wheel-v2__control--next'; next.setAttribute('aria-label', language() === 'zh' ? '下一個專案' : 'Next project'); next.innerHTML = '<span class="icon-arrow icon-arrow--right" aria-hidden="true"></span>';
    previous.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); step(-1); });
    next.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); step(1); });
    controls.append(previous, next);
    related?.append(controls);
    return controls;
  };

  const renderSelectedDomain = (explicitTab = null) => {
    if (!related || rendering) return;
    const tab = explicitTab || pendingRenderTab || selectedTab();
    const domain = resolveDomain(tab);
    const ids = projectIdsForDomain(domain);
    if (!ids.length) return;
    rendering = true;
    activeIndex = 0;
    cards = ids.map(buildCard);
    related.replaceChildren(...cards);
    related.classList.add('domain-wheel-v2');
    related.removeAttribute('data-rail');
    related.removeAttribute('data-card-variant');
    buildControls();
    syncWheel();
    resetDisclosures();
    related.dataset.domainPresentationId = domain?.id || tab?.dataset.domain || '';
    pendingRenderTab = null;
    rendering = false;
  };
  const scheduleRender = (tab = null) => {
    if (tab) pendingRenderTab = tab;
    cancelAnimationFrame(renderFrame);
    renderFrame = requestAnimationFrame(() => requestAnimationFrame(() => renderSelectedDomain(pendingRenderTab)));
  };

  related?.addEventListener('click', (event) => {
    if (performance.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const card = event.target.closest('.domain-project-card-v2');
    if (!card) return;
    const index = cards.indexOf(card);
    if (index < 0) return;
    if (index !== activeIndex) { event.preventDefault(); setActive(index); return; }
    if (event.target.closest('.domain-project-card-v2__cta')) return;
    event.preventDefault(); navigateCard(card);
  });
  related?.addEventListener('keydown', (event) => {
    const card = event.target.closest('.domain-project-card-v2');
    if (!card || event.target.closest('.domain-project-card-v2__cta')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); cards[activeIndex]?.focus({ preventScroll: true }); return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && cards.indexOf(card) === activeIndex) { event.preventDefault(); navigateCard(card); }
  });
  related?.addEventListener('dragstart', (event) => {
    if (event.target.closest('.domain-project-card-v2__image')) event.preventDefault();
  });
  related?.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    if (event.target.closest('.domain-wheel-v2__control, .domain-project-card-v2__cta')) return;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    activePointerId = event.pointerId;
    try { related.setPointerCapture?.(event.pointerId); } catch {}
  });
  related?.addEventListener('pointerup', (event) => {
    if (activePointerId === null || event.pointerId !== activePointerId || pointerStartX === null || pointerStartY === null) return;
    const deltaX = event.clientX - pointerStartX;
    const deltaY = event.clientY - pointerStartY;
    try { if (related.hasPointerCapture?.(event.pointerId)) related.releasePointerCapture(event.pointerId); } catch {}
    pointerStartX = null;
    pointerStartY = null;
    activePointerId = null;
    if (Math.abs(deltaX) < 36 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    suppressClickUntil = performance.now() + 250;
    step(deltaX < 0 ? 1 : -1);
  });
  related?.addEventListener('pointercancel', (event) => {
    if (activePointerId !== null && event.pointerId === activePointerId) {
      try { if (related.hasPointerCapture?.(event.pointerId)) related.releasePointerCapture(event.pointerId); } catch {}
    }
    pointerStartX = null;
    pointerStartY = null;
    activePointerId = null;
  });

  if (related) {
    new MutationObserver(() => {
      if (rendering || pendingRenderTab) return;
      if (related.querySelector(':scope > .related-project-card-v45')) scheduleRender();
    }).observe(related, { childList: true });
  }

  section.querySelectorAll('.domain-tab').forEach((tab) => tab.addEventListener('click', () => {
    resetDisclosures();
    const generation = ++tabRenderGeneration;
    pendingRenderTab = tab;
    related?.querySelectorAll('.domain-project-card-v2[data-wheel-offset="0"]').forEach((card) => card.removeAttribute('data-wheel-offset'));
    setTimeout(() => {
      if (generation !== tabRenderGeneration) return;
      cancelAnimationFrame(renderFrame);
      renderFrame = 0;
      renderSelectedDomain(tab);
    }, 0);
  }));
  document.addEventListener('portfolio:language', () => {
    resetDisclosures(); enhanceTabs(); scheduleRender();
  });

  if (stage) stage.dataset.styleBDomainStage = 'featured-wheel-v2';
  scheduleRender();
})();
