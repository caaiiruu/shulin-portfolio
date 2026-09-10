(() => {
  'use strict';

  const sourceLibrary = document.querySelector('.work-library-v32');
  const sourceHero = document.querySelector('.work-page-hero-v32');
  const sourceGallery = document.getElementById('workGallery');
  if (!sourceLibrary || !sourceGallery || document.querySelector('.work-index')) return;

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '/site/assets/css/components/work-index.css';
  style.dataset.styleBOwner = 'work-index';
  document.head.append(style);

  const language = () => window.getPortfolioLanguage?.() || (document.documentElement.lang.startsWith('zh') ? 'zh' : 'en');
  const copy = (en, zh) => language() === 'zh' ? zh : en;
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
    dbs: ['operations'],
    booking: ['connected'],
    payment: ['transactions', 'zero'],
    bandzo: ['connected']
  };
  const typeMap = {
    voucher: ['Incentives', '激勵系統'],
    dbs: ['Operations', '營運系統'],
    booking: ['Connected journeys', '跨接旅程'],
    payment: ['Transactions · 0→1', '交易 · 0→1'],
    bandzo: ['Connected journeys', '跨接旅程']
  };

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const cloneCopy = (tag, className, source, fallback = '') => {
    const node = element(tag, className, source?.textContent.trim() || fallback);
    const key = source?.dataset?.copyKey;
    if (key) node.dataset.copyKey = key;
    return node;
  };

  const sourceCards = () => [...sourceGallery.querySelectorAll(':scope > article')].map((article) => ({
    article,
    button: article.querySelector('[data-project]'),
    projectId: article.querySelector('[data-project]')?.dataset.project || '',
    title: article.querySelector('.work-card-v32__content h2'),
    context: article.querySelector('.project-context'),
    proofs: [...article.querySelectorAll('.work-card-signals-v44 > div')],
    cta: article.querySelector('.work-card-v32__action'),
    visual: article.querySelector('.work-artifact'),
    date: article.dataset.projectDate || ''
  })).filter((item) => item.projectId && item.button);

  const hasHydratedCopy = () => {
    const cards = sourceCards();
    return cards.length >= 5 && cards.slice(0, 4).every((card) => card.title?.textContent.trim());
  };

  const cloneVisual = (source, projectId) => {
    const visual = element('div', 'work-index-card__visual');
    visual.dataset.projectVisual = projectId;
    if (!source) return visual;
    const image = source.querySelector('img');
    if (image) {
      const clonedImage = image.cloneNode(true);
      clonedImage.className = 'work-index-card__image';
      clonedImage.loading = 'lazy';
      clonedImage.decoding = 'async';
      visual.append(clonedImage);
      return visual;
    }
    [...source.childNodes].forEach((child) => visual.append(child.cloneNode(true)));
    return visual;
  };

  const proofRows = (source, count) => {
    const candidates = source.proofs;
    if (count === 1) return candidates.slice(-1);
    if (count === 2) return candidates.slice(-2);
    return candidates.slice(0, 3);
  };

  const createCard = (source, variant, proofCount) => {
    const article = element('article', `work-index-card work-index-card--${variant}`);
    article.dataset.workIndexProject = source.projectId;
    article.dataset.workCategories = (categoryMap[source.projectId] || []).join(' ');

    const button = element('button', 'work-index-card__button');
    button.type = 'button';
    button.dataset.projectProxy = source.projectId;
    button.setAttribute('aria-label', `${copy('Open', '開啟')} ${source.title?.textContent.trim() || source.projectId}`);
    button.addEventListener('click', () => source.button.click());

    const content = element('div', 'work-index-card__content');
    const meta = element('div', 'work-index-card__meta');
    meta.append(element('span', 'work-index-card__type', typeMap[source.projectId]?.[language() === 'zh' ? 1 : 0] || 'Work'));
    const contextText = source.context?.textContent.trim() || '';
    const companyText = contextText.split('·')[0]?.trim() || contextText;
    const company = cloneCopy('span', 'work-index-card__company', source.context, companyText);
    if (company.textContent || company.dataset.copyKey) {
      meta.append(element('span', 'work-index-card__meta-separator', '·'));
      meta.append(company);
    }
    const year = source.date.slice(0, 4);
    if (year) {
      meta.append(element('span', 'work-index-card__meta-separator', '·'));
      meta.append(element('span', 'work-index-card__year', year));
    }

    const title = cloneCopy('h2', 'work-index-card__title', source.title);
    const proofs = element('ul', 'work-index-card__proofs');
    proofRows(source, proofCount).forEach((row) => {
      const item = element('li');
      item.append(cloneCopy('strong', '', row.querySelector('dt')), cloneCopy('span', '', row.querySelector('dd')));
      proofs.append(item);
    });
    const cta = element('span', 'work-index-card__cta');
    cta.append(cloneCopy('span', '', source.cta, copy('View case', '查看案例')));
    const arrow = element('span', 'icon-arrow icon-arrow--right');
    arrow.setAttribute('aria-hidden', 'true');
    cta.append(arrow);

    content.append(meta, title, proofs, cta);
    button.append(content, cloneVisual(source.visual, source.projectId));
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
      button.addEventListener('click', () => {
        activeFilter = id;
        applyFilter(root);
      });
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

  let hydrated = hasHydratedCopy();
  build();
  const hydrationObserver = new MutationObserver(() => {
    if (hydrated || !hasHydratedCopy()) return;
    hydrated = true;
    build();
    hydrationObserver.disconnect();
  });
  hydrationObserver.observe(sourceGallery, { childList: true, subtree: true, characterData: true });

  document.addEventListener('portfolio:language', () => requestAnimationFrame(() => requestAnimationFrame(build)));
})();
