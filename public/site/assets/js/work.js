(() => {
  'use strict';

  const loadOnce = (src, owner) => {
    if (document.querySelector(`script[data-style-b-owner="${owner}"]`)) return true;
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.dataset.styleBOwner = owner;
    document.body.append(script);
    return true;
  };

  const mountScopedStyleB = () => {
    let mounted = false;
    if (document.getElementById('domains')) {
      loadOnce('/site/assets/js/domain-experience.js', 'domain-experience');
      mounted = true;
    }
    if (document.querySelector('.work-library-v32') && document.getElementById('workGallery')) {
      loadOnce('/site/assets/js/work-index.js', 'work-index');
      mounted = true;
    }
    return mounted;
  };

  mountScopedStyleB();

  if (!document.querySelector('script[data-style-b-owner="work-index"]') && !document.getElementById('domains')) {
    const observer = new MutationObserver(() => {
      if (!document.querySelector('.work-library-v32') || !document.getElementById('workGallery')) return;
      loadOnce('/site/assets/js/work-index.js', 'work-index');
      observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('load', () => {
      if (document.querySelector('script[data-style-b-owner="work-index"]')) observer.disconnect();
    }, { once: true });
  }

  const rail = document.getElementById('workFilterRail');
  if (!rail) return;
  const reset = () => { rail.scrollLeft = 0; };
  requestAnimationFrame(reset);
  window.addEventListener('pageshow', reset);
  document.querySelectorAll('[data-lang-toggle]').forEach((button) => button.addEventListener('click', () => requestAnimationFrame(reset)));
})();
