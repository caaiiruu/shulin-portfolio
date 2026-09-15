(() => {
  'use strict';

  const ids = [
    'payment',
    'voucher',
    'voucher-center',
    'game-center',
    'dbs',
    'booking',
    'cathay-mortgage-assistant',
    'cathay-sit-online-account-opening',
    'cathay-sit-review-remediation-operations',
    'ctbc-mortgage-self-service-app',
    'daily-hours'
  ];

  const leadVisuals = Object.freeze(Object.fromEntries(ids.map(id => [id, Object.freeze({
    src800: `/site/assets/style-b/lead-visuals-webp/${id}-800.webp`,
    src1200: `/site/assets/style-b/lead-visuals-webp/${id}-1200.webp`,
    src1600: `/site/assets/style-b/lead-visuals-webp/${id}-1600.webp`,
    width: 1600,
    height: 900
  })])));

  window.PROJECT_CARD_SYSTEM = Object.freeze({
    version: 'shared-v1',
    variants: Object.freeze(['featured', 'standard', 'compact']),
    leadVisuals
  });

  const applyImage = (img, visual, sizes, priority = false) => {
    if (!img || !visual) return;
    img.src = visual.src1600;
    img.srcset = `${visual.src800} 800w, ${visual.src1200} 1200w, ${visual.src1600} 1600w`;
    img.sizes = sizes;
    img.width = visual.width;
    img.height = visual.height;
    img.loading = priority ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.fetchPriority = priority ? 'high' : 'auto';
    img.removeAttribute('style');
  };

  const hydrateWorkCard = card => {
    const id = card.dataset.workIndexProject;
    const visual = leadVisuals[id];
    if (!visual || card.dataset.projectCardLeadVisual === 'responsive-webp') return;
    const frame = card.querySelector('.work-artifact');
    if (!frame) return;
    let img = frame.querySelector('.work-card-v32__image-v225');
    if (!img) {
      img = document.createElement('img');
      img.className = 'work-card-v32__image-v225';
      img.alt = card.querySelector('.project-card__title')?.textContent?.trim() || '';
      frame.replaceChildren(img);
    }
    const variant = card.dataset.projectCardVariant;
    const sizes = variant === 'featured'
      ? '(max-width: 1100px) 100vw, 58vw'
      : variant === 'standard'
        ? '(max-width: 1100px) 100vw, 50vw'
        : '(max-width: 640px) 100vw, 33vw';
    applyImage(img, visual, sizes, variant === 'featured');
    card.dataset.projectCardLeadVisual = 'responsive-webp';
  };

  const hydrateDomainCard = card => {
    const id = card.dataset.project;
    const visual = leadVisuals[id];
    if (!visual || card.dataset.projectCardLeadVisual === 'responsive-webp') return;
    const frame = card.querySelector('.domain-project-card-v2__visual');
    if (!frame) return;
    let img = frame.querySelector('.domain-project-card-v2__image');
    if (!img) {
      img = document.createElement('img');
      img.className = 'domain-project-card-v2__image';
      img.alt = card.querySelector('.domain-project-card-v2__title')?.textContent?.trim() || '';
      frame.replaceChildren(img);
    }
    applyImage(img, visual, '(max-width: 900px) 84vw, 48vw', card.dataset.wheelOffset === '0');
    card.dataset.projectCardLeadVisual = 'responsive-webp';
  };

  let frame = 0;
  const hydrate = () => {
    frame = 0;
    document.querySelectorAll('.work-card-v32[data-project-card-system="shared-v1"]').forEach(hydrateWorkCard);
    document.querySelectorAll('.domain-project-card-v2[data-project-card-system="shared-v1"]').forEach(hydrateDomainCard);
  };
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(hydrate);
  };

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-work-index-project','data-project-card-system','data-project-card-variant','data-wheel-offset'] });
})();
