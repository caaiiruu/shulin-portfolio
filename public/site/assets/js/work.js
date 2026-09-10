(() => {
  'use strict';

  const loadStyle = (href, owner) => {
    if (document.querySelector(`link[data-style-b-owner="${owner}"]`)) return;
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = href;
    style.dataset.styleBOwner = owner;
    document.head.append(style);
  };

  if (document.getElementById('domains')) {
    if (!document.querySelector('script[data-style-b-owner="domain-experience"]')) {
      const script = document.createElement('script');
      script.src = '/site/assets/js/domain-experience.js';
      script.defer = true;
      script.dataset.styleBOwner = 'domain-experience';
      document.body.append(script);
    }
    return;
  }

  const sourceLibrary = document.querySelector('.work-library-v32');
  const sourceHero = document.querySelector('.work-page-hero-v32');
  const sourceGallery = document.getElementById('workGallery');
  if (!sourceLibrary || !sourceGallery || document.querySelector('.work-index')) return;

  loadStyle('/site/assets/css/components/work-index.css', 'work-index');

  const DATA = window.PORTFOLIO_RUNTIME_DATA || window.PORTFOLIO_DATA || {};
  const language = () => window.getPortfolioLanguage?.() || (document.documentElement.lang.startsWith('zh') ? 'zh' : 'en');
  const copy = (en, zh) => language() === 'zh' ? zh : en;
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
  const firstText = (...values) => values.map(scalarText).find(Boolean) || '';

  const taxonomy = [
    ['all', 'All', '全部'],
    ['transactions', 'Transactions', '交易'],
    ['operations', 'Operations', '營運'],
    ['incentives', 'Incentives', '激勵'],
    ['zero', '0→1', '0→1'],
    ['connected', 'Connected journeys', '跨接旅程']
  ];
  const categoryMap = {
    voucher: ['incentives'],
    payment: ['transactions', 'zero'],
    dbs: ['operations'],
    booking: ['connected'],
    'game-center': ['incentives', 'zero']
  };

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const sourceCards = () => [...sourceGallery.querySelectorAll(':scope > article')].map((article) => {
    const button = article.querySelector('[data-project]');
    return {
      article,
      button,
      projectId: button?.dataset.project || '',
      title: article.querySelector('.work-card-v32__content h2'),
      cta: article.querySelector('.work-card-v32__action'),
      image: button?.querySelector('img') || null,
      date: article.dataset.projectDate || ''
    };
  }).filter((item) => item.projectId && item.button);

  const rawProject = (projectId) => DATA.projects?.[projectId] || {};
  const adaptedProject = (projectId) => window.adaptPortfolioProject?.(projectId) || {};
  const projectType = (raw, adapted) => firstText(raw?.infoGrid?.type, raw?.type, adapted?.infoGrid?.type, adapted?.type, 'Work');
  const projectCompany = (raw, adapted) => firstText(raw?.company, adapted?.company);
  const projectYear = (raw, adapted, source) => {
    const text = firstText(raw?.year, raw?.period, raw?.timeline, raw?.infoGrid?.timeline?.dateRange, adapted?.year, adapted?.period, adapted?.timeline, source.date);
    return text.match(/(?:19|20)\d{2}/)?.[0] || source.date.slice(0, 4);
  };
  const projectTitle = (raw, adapted, source) => firstText(raw?.cardTitle, adapted?.cardTitle, source.title?.textContent, raw?.title, adapted?.title, source.projectId);

  const evidenceRows = (raw, adapted, count) => {
    const sources = [
      raw?.impactEvidence?.primaryMetrics,
      raw?.impact_evidence?.primaryMetrics,
      adapted?.impactEvidence?.primaryMetrics,
      adapted?.impact_evidence?.primaryMetrics,
      raw?.impactEvidence?.supportingMetrics,
      raw?.impact_evidence?.supportingMetrics,
      adapted?.impactEvidence?.supportingMetrics,
      adapted?.impact_evidence?.supportingMetrics
    ];
    const rows = [];
    const seen = new Set();
    for (const items of sources) {
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const value = firstText(item.value, item.metric, item.amount);
        const label = firstText(item.label, item.name, item.description);
        if (!value || !label) continue;
        const key = `${value}|${label}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push({ value, label });
        if (rows.length === count) return rows;
      }
    }
    return rows;
  };

  const buildVisual = (source, raw, adapted) => {
    const visual = element('div', 'work-index-card__visual');
    visual.dataset.projectVisual = source.projectId;
    if (source.image) {
      const image = source.image.cloneNode(true);
      image.className = 'work-index-card__image';
      image.loading = 'eager';
      image.decoding = 'async';
      visual.append(image);
      return visual;
    }
    const assetId = raw?.heroVisualBrief?.assetId || raw?.hero_visual_brief?.assetId || adapted?.heroVisualBrief?.assetId || adapted?.hero_visual_brief?.assetId;
    const asset = assetId ? window.resolveProjectAsset?.(assetId, source.projectId) : null;
    if (asset?.src) {
      const image = document.createElement('img');
      image.className = 'work-index-card__image';
      image.src = asset.src;
      image.alt = scalarText(asset.alt);
      image.loading = 'eager';
      image.decoding = 'async';
      if (asset.width && asset.height) { image.width = asset.width; image.height = asset.height; }
      visual.append(image);
    }
    return visual;
  };

  const createCard = (source, variant, proofCount) => {
    const raw = rawProject(source.projectId);
    const adapted = adaptedProject(source.projectId);
    const article = element('article', `work-index-card work-index-card--${variant}`);
    article.dataset.workIndexProject = source.projectId;
    article.dataset.workCategories = (categoryMap[source.projectId] || []).join(' ');

    const button = element('button', 'work-index-card__button');
    button.type = 'button';
    button.dataset.projectProxy = source.projectId;
    button.setAttribute('aria-label', `${copy('Open', '開啟')} ${projectTitle(raw, adapted, source)}`);
    button.addEventListener('click', () => source.button.click());

    const content = element('div', 'work-index-card__content');
    const meta = element('div', 'work-index-card__meta');
    meta.append(element('span', 'work-index-card__type', projectType(raw, adapted)));
    const company = projectCompany(raw, adapted);
    if (company) {
      meta.append(element('span', 'work-index-card__meta-separator', '·'));
      meta.append(element('span', 'work-index-card__company', company));
    }
    const year = projectYear(raw, adapted, source);
    if (year) {
      meta.append(element('span', 'work-index-card__meta-separator', '·'));
      meta.append(element('span', 'work-index-card__year', year));
    }

    const title = element('h2', 'work-index-card__title', projectTitle(raw, adapted, source));
    const proofs = element('ul', 'work-index-card__proofs');
    evidenceRows(raw, adapted, proofCount).forEach(({ value, label }) => {
      const item = element('li');
      item.append(element('strong', '', value), element('span', '', label));
      proofs.append(item);
    });

    const cta = element('span', 'work-index-card__cta');
    cta.append(element('span', '', source.cta?.textContent.trim() || copy('View case', '查看案例')));
    const arrow = element('span', 'icon-arrow icon-arrow--right');
    arrow.setAttribute('aria-hidden', 'true');
    cta.append(arrow);

    content.append(meta, title, proofs, cta);
    button.append(content, buildVisual(source, raw, adapted));
    article.append(button);
    return article;
  };

  let activeFilter = 'all';
  const applyFilter = (root) => {
    root.querySelectorAll('.work-index-filter').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.workIndexFilter === activeFilter)));
    root.querySelectorAll('.work-index-card').forEach((card) => {
      const categories = card.dataset.workCategories?.split(' ').filter(Boolean) || [];
      card.hidden = activeFilter !== 'all' && !categories.includes(activeFilter);
    });
  };

  const build = () => {
    const cards = sourceCards();
    if (cards.length < 5) return false;
    document.querySelector('.work-index')?.remove();

    const root = element('section', 'work-index');
    const shell = element('div', 'page-shell work-index__shell');
    const intro = element('header', 'work-index__intro');
    intro.append(
      element('div', 'work-index__eyebrow', 'WORK'),
      element('h1', '', copy('Systems for complex product problems.', '為複雜產品問題建立清晰系統。'))
    );

    const filters = element('div', 'work-index__filters');
    filters.setAttribute('role', 'group');
    filters.setAttribute('aria-label', copy('Filter work by type', '依工作類型篩選'));
    taxonomy.forEach(([id, en, zh]) => {
      const button = element('button', 'work-index-filter', language() === 'zh' ? zh : en);
      button.type = 'button';
      button.dataset.workIndexFilter = id;
      button.setAttribute('aria-pressed', String(id === activeFilter));
      button.addEventListener('click', () => { activeFilter = id; applyFilter(root); });
      filters.append(button);
    });

    const featured = element('div', 'work-index__featured');
    featured.append(createCard(cards[0], 'hero', 3));
    featured.append(createCard(cards[1], 'secondary', 2));
    const secondRow = element('div', 'work-index__featured-secondary-row');
    secondRow.append(createCard(cards[2], 'half', 2), createCard(cards[3], 'half', 2));
    featured.append(secondRow);

    const more = element('section', 'work-index__more');
    const moreHead = element('div', 'work-index__more-head');
    moreHead.append(element('h2', '', copy('More work', '更多作品')));
    const moreGrid = element('div', 'work-index__more-grid');
    cards.slice(4).forEach((card) => moreGrid.append(createCard(card, 'compact', 1)));
    more.append(moreHead, moreGrid);

    shell.append(intro, filters, featured, more);
    root.append(shell);
    sourceHero?.insertAdjacentElement('beforebegin', root);
    sourceHero?.setAttribute('hidden', '');
    sourceLibrary.setAttribute('hidden', '');
    applyFilter(root);
    return true;
  };

  build();
  let allVisualsHydrated = sourceCards().length >= 5 && sourceCards().every((card) => card.image);
  if (!allVisualsHydrated) {
    const hydrationObserver = new MutationObserver(() => {
      const cards = sourceCards();
      const ready = cards.length >= 5 && cards.every((card) => card.image);
      if (!ready) return;
      allVisualsHydrated = true;
      build();
      hydrationObserver.disconnect();
    });
    hydrationObserver.observe(sourceGallery, { childList: true, subtree: true, characterData: true, attributes: true });
  }

  document.addEventListener('portfolio:language', () => requestAnimationFrame(() => requestAnimationFrame(build)));
})();
