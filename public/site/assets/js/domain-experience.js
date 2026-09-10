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
  const localize = (value) => {
    if (Array.isArray(value)) return value[language() === 'zh' ? 1 : 0] ?? value[0] ?? '';
    if (value && typeof value === 'object' && ('en' in value || 'zh' in value)) return language() === 'zh' ? (value.zh ?? value.en ?? '') : (value.en ?? value.zh ?? '');
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
  let rebuilding = false;

  const firstText = (...values) => values.map(scalarText).find(Boolean) || '';
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
    const sourceText = source?.textContent || '';
    return sourceText.match(/(?:19|20)\d{2}/)?.[0] || raw;
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
      rawProject?.businessImpact?.primaryMetrics,
      rawProject?.business_impact?.primary_metrics,
      adaptedProject?.cardMetrics,
      adaptedProject?.card_metrics,
      adaptedProject?.primaryMetrics,
      adaptedProject?.primary_metrics,
      adaptedProject?.metrics,
      adaptedProject?.impactEvidence?.primaryMetrics,
      adaptedProject?.impactEvidence?.primary_metrics,
      adaptedProject?.impact_evidence?.primaryMetrics,
      adaptedProject?.impact_evidence?.primary_metrics
    ];
    const result = [];
    const seen = new Set();
    for (const source of sources) {
      if (!Array.isArray(source)) continue;
      for (const item of source) {
        if (!item || typeof item !== 'object') continue;
        const value = firstText(item.value, item.metric, item.amount);
        const label = firstText(item.label, item.name, item.description);
        const period = firstText(item.period, item.window);
        if (!value || !label) continue;
        const key = `${value}|${label}`;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({ value, label: period ? `${label} · ${period}` : label });
        if (result.length === 3) return result;
      }
    }
    return result;
  };

  const buildVisual = (source, rawProject, adaptedProject, key) => {
    const visual = document.createElement('div');
    visual.className = 'domain-project-card-v2__visual';
    const image = source?.querySelector('img');
    if (image) {
      const clone = image.cloneNode(true);
      clone.className = 'domain-project-card-v2__image';
      clone.loading = 'lazy';
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
      img.loading = 'lazy';
      img.decoding = 'async';
      if (asset.width && asset.height) { img.width = asset.width; img.height = asset.height; }
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
    if (key) article.dataset.project = key;
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

    const supportText = firstText(
      rawProject?.what_this_proves,
      rawProject?.whatThisProves,
      adaptedProject?.what_this_proves,
      adaptedProject?.whatThisProves
    );
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
    cta.href = key ? `/work/${key}` : '#';
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
    previous.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); step(-1); });
    next.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); step(1); });
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
    related.className = `${related.className.replace(/\bdomain-experience__rail\b/g, '').trim()} domain-wheel-v2`;
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
      event.stopPropagation();
      setActive(index);
    }
  }, true);

  related?.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    step(event.key === 'ArrowRight' ? 1 : -1);
    cards[activeIndex]?.focus({ preventScroll: true });
  });

  related?.addEventListener('pointerdown', (event) => { pointerStartX = event.clientX; });
  related?.addEventListener('pointerup', (event) => {
    if (pointerStartX === null) return;
    const delta = event.clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(delta) < 36) return;
    step(delta < 0 ? 1 : -1);
  });
  related?.addEventListener('pointercancel', () => { pointerStartX = null; });

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
    requestAnimationFrame(rebuildFromCanonicalCards);
  });

  if (stage) stage.dataset.styleBDomainStage = 'golden-reference';
  requestAnimationFrame(rebuildFromCanonicalCards);
})();
