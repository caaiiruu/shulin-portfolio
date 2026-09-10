(() => {
  'use strict';

  const section = document.getElementById('domains');
  if (!section || section.dataset.styleBMounted === 'true') return;
  section.dataset.styleBMounted = 'true';
  section.classList.add('domain-experience');

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '/site/assets/css/components/domain-experience.css';
  style.dataset.styleBOwner = 'domain-experience';
  document.head.append(style);

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const related = document.getElementById('relatedProjects');
  const stage = document.getElementById('domainStage');
  const content = document.getElementById('domainContentRail');

  const makeDisclosure = (panel) => {
    if (!panel || panel.matches('details')) return panel;
    const details = document.createElement('details');
    details.className = `${panel.className} domain-experience-disclosure`;
    details.open = false;
    const summary = document.createElement('summary');
    summary.className = 'domain-experience-disclosure__summary';
    const heading = panel.querySelector('h4');
    if (heading) summary.append(heading);
    while (panel.firstChild) details.append(panel.firstChild);
    details.prepend(summary);
    panel.replaceWith(details);
    return details;
  };

  const projectPanel = related?.closest('.domain-panel-v30--projects');
  const problemsPanel = document.getElementById('domainProblems')?.closest('.domain-panel-v30');
  const solutionsPanel = document.getElementById('domainSolutions')?.closest('.domain-panel-v30');

  if (content && projectPanel) content.prepend(projectPanel);
  const problemDisclosure = makeDisclosure(problemsPanel);
  const solutionDisclosure = makeDisclosure(solutionsPanel);

  const projectHeading = projectPanel?.querySelector('.rail-heading');
  const controls = projectHeading?.querySelector('.rail-controls');
  if (projectHeading) projectHeading.classList.add('domain-experience__project-heading');
  if (projectPanel && controls) {
    const controlRow = document.createElement('div');
    controlRow.className = 'domain-experience__controls';
    controlRow.setAttribute('aria-label', document.documentElement.lang.startsWith('zh') ? '專案瀏覽控制' : 'Project browsing controls');
    controlRow.append(controls);
    projectPanel.append(controlRow);
  }

  const resetDisclosures = () => {
    if (problemDisclosure) problemDisclosure.open = false;
    if (solutionDisclosure) solutionDisclosure.open = false;
  };

  const ownVisual = (source) => {
    const visual = document.createElement('div');
    visual.className = 'domain-experience-card__visual';
    const image = source.querySelector('img');
    if (image) {
      const clone = image.cloneNode(true);
      clone.className = 'domain-experience-card__image';
      clone.loading = 'lazy';
      clone.decoding = 'async';
      visual.append(clone);
      return visual;
    }
    const brand = source.querySelector('[class*="brand"]')?.textContent.trim();
    const labels = [...source.querySelectorAll('[class*="flow"] b')].map((node) => node.textContent.trim()).filter(Boolean);
    if (brand) {
      const brandNode = document.createElement('span');
      brandNode.className = 'domain-experience-card__visual-brand';
      brandNode.textContent = brand;
      visual.append(brandNode);
    }
    if (labels.length) {
      const flow = document.createElement('div');
      flow.className = 'domain-experience-card__visual-flow';
      labels.forEach((label, index) => {
        const item = document.createElement('span');
        item.textContent = label;
        if (index === 1) item.classList.add('is-core');
        flow.append(item);
      });
      visual.append(flow);
    }
    return visual;
  };

  const ownCard = (source) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'domain-experience-card';
    card.dataset.pressable = '';
    if (source.dataset.project) card.dataset.project = source.dataset.project;
    if (source.dataset.experiment) card.dataset.experiment = source.dataset.experiment;
    const label = source.getAttribute('aria-label');
    if (label) card.setAttribute('aria-label', label);

    const contentNode = document.createElement('div');
    contentNode.className = 'domain-experience-card__content';

    const meta = document.createElement('div');
    meta.className = 'domain-experience-card__meta';
    const company = source.querySelector('[class*="company"]')?.textContent.trim();
    const context = source.querySelector('[class*="context"]')?.textContent.trim();
    [company, context].filter(Boolean).forEach((text) => {
      const item = document.createElement('span');
      item.textContent = text;
      meta.append(item);
    });

    const title = document.createElement('h3');
    title.className = 'domain-experience-card__title';
    title.textContent = source.querySelector('[class*="title"]')?.textContent.trim() || '';

    const proof = document.createElement('p');
    proof.className = 'domain-experience-card__proof';
    proof.textContent = source.querySelector('dd')?.textContent.trim() || '';

    const cta = document.createElement('span');
    cta.className = 'domain-experience-card__cta';
    cta.textContent = source.querySelector('[class*="action"]')?.textContent.trim() || (document.documentElement.lang.startsWith('zh') ? '查看案例' : 'View case');
    const arrow = document.createElement('span');
    arrow.className = 'icon-arrow icon-arrow--right';
    arrow.setAttribute('aria-hidden', 'true');
    cta.append(arrow);

    contentNode.append(meta, title);
    if (proof.textContent) contentNode.append(proof);
    contentNode.append(cta);
    card.append(contentNode, ownVisual(source));
    return card;
  };

  let transforming = false;
  const transformCards = () => {
    if (!related || transforming) return;
    const sharedCards = [...related.children].filter((node) => node.matches('.related-project-card-v45'));
    if (!sharedCards.length) {
      resetDisclosures();
      return;
    }
    transforming = true;
    const owned = sharedCards.map(ownCard);
    related.replaceChildren(...owned);
    related.classList.add('domain-experience__rail');
    related.removeAttribute('data-card-variant');
    related.removeAttribute('data-rail');
    transforming = false;
    resetDisclosures();
  };

  transformCards();
  if (related) {
    new MutationObserver(() => requestAnimationFrame(transformCards)).observe(related, { childList: true });
  }

  document.addEventListener('portfolio:language', () => {
    const row = section.querySelector('.domain-experience__controls');
    if (row) row.setAttribute('aria-label', document.documentElement.lang.startsWith('zh') ? '專案瀏覽控制' : 'Project browsing controls');
    resetDisclosures();
    requestAnimationFrame(transformCards);
  });

  section.querySelectorAll('.domain-tab').forEach((tab) => tab.addEventListener('click', resetDisclosures));

  related?.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const cards = [...related.querySelectorAll('.domain-experience-card')];
    const current = cards.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next = cards[(current + delta + cards.length) % cards.length];
    next?.focus({ preventScroll: true });
    next?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  });

  if (stage) stage.setAttribute('data-style-b-domain-stage', 'true');
})();
