(() => {
  'use strict';

  const ASSET_MANIFEST_URL = '/site/content/portfolio-asset-manifest.json';
  const variants = Object.freeze(['featured', 'standard', 'compact']);
  const DATA = window.PORTFOLIO_RUNTIME_DATA || window.PORTFOLIO_DATA || {};
  const publicProjects = DATA.publicProjects || DATA.projects || {};
  let assetManifest = null;
  let animationFrame = 0;

  const sizesForWorkVariant = variant => variant === 'featured'
    ? '(max-width: 1100px) 100vw, 58vw'
    : variant === 'standard'
      ? '(max-width: 1100px) 100vw, 50vw'
      : '(max-width: 640px) 100vw, 33vw';

  const heroAssetIdForProject = id => {
    const project = publicProjects[id];
    const planned = Array.isArray(project?.publicContent?.imagePlan)
      ? project.publicContent.imagePlan.find(item => item?.role === 'hero' && item?.assetId)?.assetId
      : '';
    return planned || project?.heroVisualBrief?.assetId || '';
  };

  // Project-specific surface metadata is owned by the canonical asset manifest, not CSS/page owners.
  const tintForProject = id => assetManifest?.projectCardLeadVisuals?.brandTints?.[id] || '';

  const visualForProject = id => {
    if (!assetManifest) return null;
    if (id === 'daily-hours') {
      const daily = assetManifest.projectCardLeadVisuals?.dailyHours;
      if (!daily?.publicPath) return null;
      return {
        path: daily.publicPath,
        width: Number(daily.width) || 1600,
        height: Number(daily.height) || 900,
        assetId: 'daily-hours-listing-projection'
      };
    }
    const assetId = heroAssetIdForProject(id);
    const item = assetManifest.items?.[assetId];
    if (!item?.publicPath || item?.type !== 'image/jpeg') return null;
    return {
      path: item.publicPath,
      width: Number(item.width) || 2048,
      height: Number(item.height) || 1152,
      assetId
    };
  };

  const clearUnresolvedMedia = (card, frame) => {
    if (!frame) return;
    if (frame.querySelector('img')) frame.replaceChildren();
    card.dataset.projectCardLeadVisual = 'unresolved';
  };

  const applyImage = (img, visual, sizes, priority = false) => {
    if (!img || !visual?.path) return false;
    img.src = visual.path;
    img.removeAttribute('srcset');
    img.sizes = sizes;
    img.width = visual.width;
    img.height = visual.height;
    img.loading = priority ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.fetchPriority = priority ? 'high' : 'auto';
    img.draggable = false;
    img.removeAttribute('style');
    return true;
  };

  const hydrateWorkCard = card => {
    const id = card.dataset.workIndexProject;
    const visual = visualForProject(id);
    const tint = tintForProject(id);
    if (tint) card.style.setProperty('--project-card-tint', tint);
    else card.style.removeProperty('--project-card-tint');
    const frame = card.querySelector('.work-artifact');
    if (!frame) return;
    if (!visual) {
      clearUnresolvedMedia(card, frame);
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
    if (applyImage(img, visual, sizesForWorkVariant(variant), variant === 'featured')) {
      card.dataset.projectCardLeadVisual = 'canonical-jpg';
      card.dataset.projectCardAssetId = visual.assetId;
    }
  };

  const hydrateDomainCard = card => {
    const id = card.dataset.project;
    const visual = visualForProject(id);
    const tint = tintForProject(id);
    if (tint) card.style.setProperty('--project-card-tint', tint);
    else card.style.removeProperty('--project-card-tint');
    const frame = card.querySelector('.domain-project-card-v2__visual');
    if (!frame) return;
    if (!visual) {
      clearUnresolvedMedia(card, frame);
      return;
    }
    let img = frame.querySelector('.domain-project-card-v2__image');
    if (!img) {
      img = document.createElement('img');
      img.className = 'domain-project-card-v2__image';
      img.alt = card.querySelector('.domain-project-card-v2__title')?.textContent?.trim() || '';
      frame.replaceChildren(img);
    }
    if (applyImage(img, visual, '(max-width: 900px) 84vw, 48vw', card.dataset.wheelOffset === '0')) {
      card.dataset.projectCardLeadVisual = 'canonical-jpg';
      card.dataset.projectCardAssetId = visual.assetId;
    }
  };

  const hydrate = () => {
    animationFrame = 0;
    if (!assetManifest) return;
    document.querySelectorAll('.work-card-v32[data-project-card-system="shared-v1"]').forEach(hydrateWorkCard);
    document.querySelectorAll('.domain-project-card-v2[data-project-card-system="shared-v1"]').forEach(hydrateDomainCard);
  };

  const schedule = () => {
    if (animationFrame) return;
    animationFrame = requestAnimationFrame(hydrate);
  };

  const start = async () => {
    const response = await fetch(ASSET_MANIFEST_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`ProjectCard asset manifest HTTP ${response.status}`);
    assetManifest = await response.json();
    window.PROJECT_CARD_SYSTEM = Object.freeze({
      version: 'shared-v1',
      variants,
      assetManifestUrl: ASSET_MANIFEST_URL
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
