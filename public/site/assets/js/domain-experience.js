(() => {
  'use strict';

  const section = document.getElementById('domains');
  if (!section || section.dataset.styleBMounted === 'true') return;
  section.dataset.styleBMounted = 'true';
  section.classList.add('domain-experience');

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const related = document.getElementById('relatedProjects');
  const stage = document.getElementById('domainStage');
  const content = document.getElementById('domainContentRail');

  const makeDisclosure = (panel) => {
    if (!panel || panel.matches('details')) return panel;
    const details = document.createElement('details');
    details.className = `${panel.className} domain-disclosure`;
    details.open = false;
    const summary = document.createElement('summary');
    summary.className = 'domain-disclosure__summary';
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
  if (projectHeading) projectHeading.classList.add('domain-project-heading--visually-hidden');
  if (projectPanel && controls) {
    const controlRow = document.createElement('div');
    controlRow.className = 'domain-wheel-controls';
    controlRow.setAttribute('aria-label', document.documentElement.lang.startsWith('zh') ? '專案瀏覽控制' : 'Project browsing controls');
    controlRow.append(controls);
    projectPanel.append(controlRow);
  }

  const resetDisclosures = () => {
    if (problemDisclosure) problemDisclosure.open = false;
    if (solutionDisclosure) solutionDisclosure.open = false;
  };

  const decorateCards = () => {
    if (!related) return;
    [...related.children].forEach((card) => {
      card.classList.add('domain-experience-card');
      const visual = card.querySelector('.related-project-card__visual-v45');
      const cardContent = card.querySelector('.related-project-card__content-v1612');
      if (visual) visual.classList.add('domain-experience-card__visual');
      if (cardContent) cardContent.classList.add('domain-experience-card__content');
    });
    resetDisclosures();
  };

  decorateCards();
  if (related) {
    new MutationObserver(() => requestAnimationFrame(decorateCards)).observe(related, { childList: true });
  }

  document.addEventListener('portfolio:language', () => {
    const row = section.querySelector('.domain-wheel-controls');
    if (row) row.setAttribute('aria-label', document.documentElement.lang.startsWith('zh') ? '專案瀏覽控制' : 'Project browsing controls');
    resetDisclosures();
  });

  section.querySelectorAll('.domain-tab').forEach((tab) => {
    tab.addEventListener('click', resetDisclosures);
  });

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
