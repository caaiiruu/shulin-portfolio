(() => {
  'use strict';

  const loadOnce = (src, owner) => {
    if (document.querySelector(`script[data-style-b-owner="${owner}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.dataset.styleBOwner = owner;
    document.body.append(script);
  };

  if (document.getElementById('domains')) {
    loadOnce('/site/assets/js/domain-experience.js', 'domain-experience');
  }

  if (document.querySelector('.work-library-v32')) {
    loadOnce('/site/assets/js/work-index.js', 'work-index');
  }

  const rail = document.getElementById('workFilterRail');
  if (!rail) return;
  const reset = () => { rail.scrollLeft = 0; };
  requestAnimationFrame(reset);
  window.addEventListener('pageshow', reset);
  document.querySelectorAll('[data-lang-toggle]').forEach((button) => button.addEventListener('click', () => requestAnimationFrame(reset)));
})();
