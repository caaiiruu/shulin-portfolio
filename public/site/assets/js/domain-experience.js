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
    section.style.setProperty('--domain-viewport-width', `${window.innerWidth}px`);
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

  const tabIcon = {
    finance: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h18M5 10V20M9 10V20M15 10V20M19 10V20M3 20h18M12 3 3 8h18L12 3Z"/></svg>',
    operations: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="6" height="6"/><rect x="15" y="3" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/><rect x="15" y="15" width="6" height="6"/><path d="M9 6h6M6 9v6M18 9v6M9 18h6"/></svg>',
    growth: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16v12H4zM12 9v12M3 9h18M7 9c-2.5 0-3.5-1.5-3.5-3S5 3.5 6.5 4.5L12 9M17 9c2.5 0 3.5-1.5 3.5-3S19 3.5 17.5 4.5L12 9"/></svg>',
    travel: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9Z"/></svg>',
    commerce: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
    learning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5c3-1 6-.5 9 1.5v13c-3-2-6-2.5-9-1.5v-13ZM21 5.5c-3-1-6-.5-9 1.5v13c3-2 6-2.5 9-1.5v-13Z"/></svg>'
  };

  const enhanceTabs = () => {
    section.querySelectorAll('.domain-tab').forEach((tab) => {
      if (tab.querySelector('.domain-tab__icon')) return;
      const number = tab.querySelector(':scope > span');
      if (number) number.classList.add('domain-tab__number');
      const strong = tab.querySelector('strong');
      if (strong) strong.classList.add('domain-tab__label');
      const icon = document.createElement('span');
      icon.className = 'domain-tab__icon';
      icon.innerHTML = tabIcon[tab.dataset.domain] || tabIcon.operations;
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

  let activeIndex = 0;
  let cards = [];
  let pointerStartX = null;
  let pointerStartY = null;
  let rebuilding = false;

  const readYear = (rawProject, adaptedProject, source) => {
    const raw = firstText(
      rawProject?.year,
      rawProject?.period,
      rawProject?.heroMetadata?.year,
      rawProject?.heroMetadata?.period,
      adaptedProject?.year,
      adaptedProject?.period,
      adaptedProject?.heroMetadata?.year,
      adaptedProject?.heroMetadata?.period,
      rawProject?.timeline,
      adaptedProject?.timeline
    );
    const match = raw.match(/(?:19|20)\d{2}/);
    if (match) return match[0];
    return source?.textContent.match(/(?:19|20)\d{2}/)?.[0] || raw;
  };

  const readType = (rawProject, adaptedProject, source) => firstText(
    rawProject?.type,
    rawProject?.infoGrid?.type,
    rawProject?.projectType,
    rawProject?.project_type,
    adaptedProject?.type,
    adaptedProject?.infoGrid?.type,
    adaptedProject?.projectType,
    adaptedProject?.project_type,
    rawProject?.systemClassification?.publicLabel,
    adaptedProject?.systemClassification?.publicLabel,
    rawProject?.systemClassification?.label,
    adaptedProject?.systemClassification?.label,
    source?.querySelector('[class*="context"]')?.textContent
  );

  const readSupport = (rawProject, adaptedProject) => firstText(
    language() === 'zh' ? rawProject?.whatThisProves_zh : rawProject?.whatThisProves,
    rawProject?.whatThisProves,
    rawProject?.what_this_proves,
    rawProject?.publicContent?.whatThisProves,
    rawProject?.publicContent?.what_this_proves,
    language() === 'zh' ? adaptedProject?.whatThisProves_zh : adaptedProject?.whatThisProves,
    adaptedProject?.whatThisProves,
    adaptedProject?.what_this_proves,
    adaptedProject?.publicContent?.whatThisProves,
    adaptedProject?.publicContent?.what_this_proves
  );

  const conciseMetricLabel = (label) => {
    const text = String(label || '').trim();
    const normalized = text.toLowerCase();
    const zh = language() === 'zh';
    if (/programme|program/.test(normalized)) return zh ? '計畫' : 'programme';
    if (/digital.*share|share.*digital|redemption share|campaign.*share/.test(normalized)) return zh ? '數位佔比' : 'digital share';
    if (/redemption/.test(normalized)) return zh ? '兌換' : 'redemptions';
    if (/market|countr/.test(normalized)) return zh ? '市場' : 'markets';
    if (/workflow/.test(normalized)) return zh ? '工作流' : 'workflow';
    if (/decision/.test(normalized)) return zh ? '決策模型' : 'decision model';
    if (/success/.test(normalized)) return zh ? '成功率' : 'success rate';
    if (/time|second|minute|hour/.test(normalized)) return zh ? '處理時間' : 'time';
    if (/user/.test(normalized)) return zh ? '使用者' : 'users';
    if (/transaction/.test(normalized)) return zh ? '交易' : 'transactions';
    const words = text.split(/\s+/).filter(Boolean);
    return words.slice(0, 2).join(' ');
  };

  const collectMetrics = (rawProject, adaptedProject) => {
    const sources = [
      rawProject?.cardMetrics,
      rawProject?.card_metrics,
      rawProject?.primaryMetrics,
      rawProject?.primary_metrics,
      rawProject?.metrics,
      rawProject?.impactEvidence?.primaryMetrics,
      rawProject?.impactEvidence?.primary_metrics,
      rawProject?.impact_evidence?.primaryMetrics,
      rawProject?.impact_evidence?.primary_metrics,
      rawProject?.publicContent?.impactEvidence?.primaryMetrics,
      rawProject?.publicContent?.impact_evidence?.primary_metrics,
      adaptedProject?.cardMetrics,
      adaptedProject?.card_metrics,
      adaptedProject?.primaryMetrics,
      adaptedProject?.primary_metrics,
      adaptedProject?.metrics,
      adaptedProject?.impactEvidence?.primaryMetrics,
      adaptedProject?.impactEvidence?.primary_metrics,
      adaptedProject?.impact_evidence?.primaryMetrics,
      adaptedProject?.impact_evidence?.primary_metrics,
      rawProject?.impactEvidence?.supportingMetrics,
      rawProject?.impactEvidence?.supporting_metrics,
      rawProject?.impact_evidence?.supportingMetrics,
      rawProject?.impact_evidence?.supporting_metrics,
      rawProject?.publicContent?.impactEvidence?.supportingMetrics,
      rawProject?.publicContent?.impact_evidence?.supporting_metrics,
      adaptedProject?.impactEvidence?.supportingMetrics,
      adaptedProject?.impactEvidence?.supporting_metrics,
      adaptedProject?.impact_evidence?.supportingMetrics,
      adaptedProject?.impact_evidence?.supporting_metrics
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
        const key = `${value}|${label}`;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({ value, label });
        if (result.length === 3) return result;
      }
    }
    return result;
  };

  const tintPalette = [
    'rgb(223 235 246)',
    'rgb(231 229 249)',
    'rgb(248 225 214)',
    'rgb(224 241 233)',
    'rgb(245 235 210)',
    'rgb(230 238 225)'
  ];
  const tintForProject = (key) => {
    const known = {
      voucher: 'rgb(218 233 247)',
      payment: 'rgb(223 240 233)',
      dbs: 'rgb(225 229 250)',
      booking: 'rgb(235 229 250)',
      'game-center': 'rgb(247 226 214)',
      bandzo: 'rgb(242 234 210)'
    };
    if (known[key]) return known[key];
    const hash = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return tintPalette[hash % tintPalette.length];
  };

  const buildVisual = (source, rawProject, adaptedProject, key) => {
    const visual = document.createElement('div');
    visual.className = 'domain-project-card-v2__visual';
    const image = source?.querySelector('img');
    if (image) {
      const clone = image.cloneNode(true);
      clone.className = 'domain-project-card-v2__image';
      clone.loading = 'eager';
      clone.decoding = 'async';
      visual.append(clone);
      return visual;
    }

    const assetId = rawProject?.hero_visual_brief?.assetId || rawProject?.heroVisualBrief?.assetId || adaptedProject?.hero_visual_brief?.assetId || adaptedProject?.heroVisualBrief?.assetId;
    const asset = assetId ? window.resolveProjectAsset?.(assetId, key) : null;
    if (asset?.src) {
      const img = document.createElement('img');
      img.className = 'domain-project-card-v2__image';
      img.src = asset.src;
      img.alt = scalarText(asset.alt);
      img.loading = 'eager';
      img.decoding = 'async';
      if (asset.width && asset.height) {
        img.width = asset.width;
        img.height = asset.height;
      }
      visual.append(img);
      return visual;
    }

    const fallback = document.createElement('span');
    fallback.className = 'domain-project-card-v2__visual-fallback';
    fallback.textContent = firstText(rawProject?.company, adaptedProject?.company, source?.querySelector('[class*="company"]')?.textContent);
    visual.append(fallback);
    return visual;
  };

  const buildCard = (source) => {
    const key = source.dataset.project || '';
    const rawProject = key ? (DATA.projects?.[key] || {}) : {};
    const adaptedProject = key ? (window.adaptPortfolioProject?.(key) || {}) : {};
    const article = document.createElement('article');
    article.className = 'domain-project-card-v2 domain-project-card-v2--large';
    article.dataset.projectCardVariant = 'large';
    article.dataset.project = key;
    article.style.setProperty('--project-card-tint', tintForProject(key));
    if (source.dataset.experiment) article.dataset.experiment = source.dataset.experiment;

    const body = document.createElement('div');
    body.className = 'domain-project-card-v2__content';

    const meta = document.createElement('div');
    meta.className = 'domain-project-card-v2__meta';
    const type = document.createElement('span');
    type.className = 'domain-project-card-v2__type';
    type.textContent = readType(rawProject, adaptedProject, source);
    const identity = document.createElement('span');
    identity.className = 'domain-project-card-v2__identity';
    const company = document.createElement('strong');
    company.className = 'domain-project-card-v2__company';
    company.textContent = firstText(rawProject?.company, adaptedProject?.company, source.querySelector('[class*="company"]')?.textContent);
    const year = readYear(rawProject, adaptedProject, source);
    identity.append(company);
    if (year) {
      const dot = document.createElement('span');
      dot.setAttribute('aria-hidden', 'true');
      dot.textContent = '·';
      const yearNode = document.createElement('span');
      yearNode.className = 'domain-project-card-v2__year';
      yearNode.textContent = year;
      identity.append(dot, yearNode);
    }
    if (type.textContent) meta.append(type);
    meta.append(identity);

    const title = document.createElement('h3');
    title.className = 'domain-project-card-v2__title';
    title.textContent = firstText(
      language() === 'zh' ? rawProject?.transformation_zh : rawProject?.transformation,
      rawProject?.transformation,
      adaptedProject?.transformation,
      rawProject?.title,
      adaptedProject?.title,
      source.querySelector('[class*="title"]')?.textContent
    );

    const supportText = readSupport(rawProject, adaptedProject);
    const support = document.createElement('p');
    support.className = 'domain-project-card-v2__support';
    support.textContent = supportText;

    const metrics = collectMetrics(rawProject, adaptedProject);
    const metricList = document.createElement('dl');
    metricList.className = 'domain-project-card-v2__metrics';
    metricList.dataset.metricCount = String(metrics.length);
    metrics.forEach(({ value }) => {
      const dt = document.createElement('dt');
      dt.className = 'domain-project-card-v2__metric-value';
      dt.textContent = value;
      metricList.append(dt);
    });
    metrics.forEach(({ label }) => {
      const dd = document.createElement('dd');
      dd.className = 'domain-project-card-v2__metric-label';
      dd.textContent = label;
      metricList.append(dd);
    });

    const cta = document.createElement('a');
    cta.className = 'domain-project-card-v2__cta';
    cta.href = `/work/${key}`;
    const ctaLabel = document.createElement('span');
    ctaLabel.textContent = language() === 'zh' ? '查看案例' : 'View case';
    const arrow = document.createElement('span');
    arrow.className = 'domain-project-card-v2__cta-arrow icon-arrow icon-arrow--right';
    arrow.setAttribute('aria-hidden', 'true');
    cta.append(ctaLabel, arrow);

    body.append(meta, title);
    if (supportText) body.append(support);
    if (metrics.length) body.append(metricList);
    body.append(cta);
    article.append(body, buildVisual(source, rawProject, adaptedProject, key));
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

  const navigateCard = (card) => {
    const key = card?.dataset.project;
    if (key) window.location.href = `/work/${key}`;
  };

  const buildControls = () => {
    let controls = projectPanel?.querySelector('.domain-wheel-v2__controls');
    if (controls) return controls;
    controls = document.createElement('div');
    controls.className = 'domain-wheel-v2__controls';
    controls.setAttribute('aria-label', language() === 'zh' ? '專案輪播控制' : 'Project wheel controls');

    const previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'domain-wheel-v2__control domain-wheel-v2__control--previous';
    previous.setAttribute('aria-label', language() === 'zh' ? '上一個專案' : 'Previous project');
    previous.innerHTML = '<span class="icon-arrow icon-arrow--left" aria-hidden="true"></span>';

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'domain-wheel-v2__control domain-wheel-v2__control--next';
    next.setAttribute('aria-label', language() === 'zh' ? '下一個專案' : 'Next project');
    next.innerHTML = '<span class="icon-arrow icon-arrow--right" aria-hidden="true"></span>';

    previous.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      step(-1);
    });
    next.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      step(1);
    });
    controls.append(previous, next);
    projectPanel?.append(controls);
    return controls;
  };

  const rebuildFromCanonicalCards = () => {
    if (!related || rebuilding) return;
    const sourceCards = [...related.children].filter((node) => node.matches('.related-project-card-v45'));
    if (!sourceCards.length) return;
    rebuilding = true;
    cards = sourceCards.map(buildCard);
    activeIndex = 0;
    related.replaceChildren(...cards);
    related.classList.add('domain-wheel-v2');
    related.removeAttribute('data-rail');
    related.removeAttribute('data-card-variant');
    buildControls();
    syncWheel();
    resetDisclosures();
    rebuilding = false;
  };

  related?.addEventListener('click', (event) => {
    const card = event.target.closest('.domain-project-card-v2');
    if (!card) return;
    const index = cards.indexOf(card);
    if (index < 0) return;
    if (index !== activeIndex) {
      event.preventDefault();
      setActive(index);
      return;
    }
    if (event.target.closest('.domain-project-card-v2__cta')) return;
    event.preventDefault();
    navigateCard(card);
  });

  related?.addEventListener('keydown', (event) => {
    const card = event.target.closest('.domain-project-card-v2');
    if (!card || event.target.closest('.domain-project-card-v2__cta')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      step(event.key === 'ArrowRight' ? 1 : -1);
      cards[activeIndex]?.focus({ preventScroll: true });
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && cards.indexOf(card) === activeIndex) {
      event.preventDefault();
      navigateCard(card);
    }
  });

  related?.addEventListener('pointerdown', (event) => {
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
  });
  related?.addEventListener('pointerup', (event) => {
    if (pointerStartX === null || pointerStartY === null) return;
    const deltaX = event.clientX - pointerStartX;
    const deltaY = event.clientY - pointerStartY;
    pointerStartX = null;
    pointerStartY = null;
    if (Math.abs(deltaX) < 36 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    step(deltaX < 0 ? 1 : -1);
  });
  related?.addEventListener('pointercancel', () => {
    pointerStartX = null;
    pointerStartY = null;
  });

  if (related) {
    new MutationObserver(() => {
      if (rebuilding) return;
      if (related.querySelector(':scope > .related-project-card-v45')) requestAnimationFrame(rebuildFromCanonicalCards);
    }).observe(related, { childList: true });
  }

  section.querySelectorAll('.domain-tab').forEach((tab) => tab.addEventListener('click', () => {
    resetDisclosures();
    activeIndex = 0;
  }));

  document.addEventListener('portfolio:language', () => {
    resetDisclosures();
    enhanceTabs();
    requestAnimationFrame(rebuildFromCanonicalCards);
  });

  if (stage) stage.dataset.styleBDomainStage = 'featured-wheel-v2';
  requestAnimationFrame(rebuildFromCanonicalCards);
})();
