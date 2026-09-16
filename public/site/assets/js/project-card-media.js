(() => {
  'use strict';

  const REGISTRY_URL = '/site/content/portfolio-asset-manifest.json';
  const variants = Object.freeze(['featured', 'standard', 'compact']);
  let registry = null;
  let animationFrame = 0;

  const projectEntry = id => registry?.projects?.[id] || null;
  const sizesForWorkVariant = variant => variant === 'featured'
    ? '(max-width: 1100px) 100vw, 58vw'
    : variant === 'standard'
      ? '(max-width: 1100px) 100vw, 50vw'
      : '(max-width: 640px) 100vw, 33vw';

  const applyBrandTint = (card, entry) => {
    if (!card || !entry?.brandTint) return;
    card.style.setProperty('--project-card-tint', entry.brandTint);
    card.dataset.projectCardBrandFamily = entry.brandFamily || '';
  };

  const clearUnresolvedMedia = (card, frame, entry) => {
    applyBrandTint(card, entry);
    if (!frame) return;
    if (frame.querySelector('img')) frame.replaceChildren();
    card.dataset.projectCardLeadVisual = 'unresolved';
  };

  const applyImage = (img, entry, sizes, priority = false) => {
    const canonical = entry?.canonicalMaster;
    if (!img || !canonical) return false;
    const sources = Array.isArray(entry.deliverySources) ? entry.deliverySources : [];
    const srcset = sources
      .filter(source => source?.path && Number(source?.width) > 0)
      .sort((a,b) => a.width - b.width)
      .map(source => `${source.path} ${source.width}w`)
      .join(', ');

    img.src = canonical;
    if (srcset) img.srcset = srcset;
    else img.removeAttribute('srcset');
    img.sizes = sizes;
    const [width, height] = Array.isArray(entry.expectedDimensions) ? entry.expectedDimensions : [];
    if (width && height) {
      img.width = width;
      img.height = height;
    }
    img.loading = priority ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.fetchPriority = priority ? 'high' : 'auto';
    img.draggable = false;
    img.removeAttribute('style');
    return true;
  };

  const hydrateWorkCard = card => {
    const id = card.dataset.workIndexProject;
    const entry = projectEntry(id);
    if (!entry) return;
    applyBrandTint(card, entry);
    const frame = card.querySelector('.work-artifact');
    if (!frame) return;
    if (!entry.canonicalMaster || entry.sourceStatus !== 'active-approved-canonical') {
      clearUnresolvedMedia(card, frame, entry);
      return;
    }
    let img = frame.querySelector('.work-card-v32__image-v225');
    if (!img) {
      img = document.createElement('img');
      img.className = 'work-card-v32__image-v225';
      img.alt = card.querySelector('.project-card__title')?.textContent?.trim() || '';
      frame.replaceChildren(img);
    }
    const variant = card.dataset.projectCardVariant;
    if (applyImage(img, entry, sizesForWorkVariant(variant), variant === 'featured')) {
      card.dataset.projectCardLeadVisual = 'canonical-jpg';
    }
  };

  const hydrateDomainCard = card => {
    const id = card.dataset.project;
    const entry = projectEntry(id);
    if (!entry) return;
    applyBrandTint(card, entry);
    const frame = card.querySelector('.domain-project-card-v2__visual');
    if (!frame) return;
    if (!entry.canonicalMaster || entry.sourceStatus !== 'active-approved-canonical') {
      clearUnresolvedMedia(card, frame, entry);
      return;
    }
    let img = frame.querySelector('.domain-project-card-v2__image');
    if (!img) {
      img = document.createElement('img');
      img.className = 'domain-project-card-v2__image';
      img.alt = card.querySelector('.domain-project-card-v2__title')?.textContent?.trim() || '';
      frame.replaceChildren(img);
    }
    if (applyImage(img, entry, '(max-width: 900px) 84vw, 48vw', card.dataset.wheelOffset === '0')) {
      card.dataset.projectCardLeadVisual = 'canonical-jpg';
    }
  };

  const hydrate = () => {
    animationFrame = 0;
    if (!registry) return;
    document.querySelectorAll('.work-card-v32[data-project-card-system="shared-v1"]').forEach(hydrateWorkCard);
    document.querySelectorAll('.domain-project-card-v2[data-project-card-system="shared-v1"]').forEach(hydrateDomainCard);
  };

  const schedule = () => {
    if (animationFrame) return;
    animationFrame = requestAnimationFrame(hydrate);
  };

  const start = async () => {
    const response = await fetch(REGISTRY_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`ProjectCard registry HTTP ${response.status}`);
    const manifest = await response.json();
    registry = manifest.projectCardLeadVisuals;
    if (!registry) throw new Error('ProjectCard Lead Visual registry missing from asset manifest');
    window.PROJECT_CARD_REGISTRY = Object.freeze(registry);
    window.PROJECT_CARD_SYSTEM = Object.freeze({
      version: registry.version,
      variants,
      registryUrl: REGISTRY_URL
    });
    schedule();
    new MutationObserver(schedule).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-work-index-project','data-project','data-project-card-system','data-project-card-variant','data-wheel-offset']
    });
  };

  start().catch(error => {
    document.documentElement.dataset.projectCardRegistry = 'failed';
    console.error(error);
  });
})();
