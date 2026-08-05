/* Canonical shared runtime. Do not add versioned runtime owners. */
/* Migrated from loading-v59.js; runtime.js is the only production owner. */
(function(){
  'use strict';
  const doc=document;
  const runtimeCopy=(key)=>{
    const pair=window.PORTFOLIO_DATA?.localizationRegistry?.runtimeUiLabels?.[key]||{};
    return doc.documentElement.lang.startsWith('zh')?(pair.zh||pair.en||''):(pair.en||'');
  };
  const overlay=doc.createElement('div');
  overlay.className='portfolio-loader-v59';
  overlay.setAttribute('role','status');
  overlay.setAttribute('aria-live','polite');
  overlay.setAttribute('aria-hidden','true');
  const panel=doc.createElement('div');
  panel.className='portfolio-loader-v59__panel';
  const hand=doc.createElement('span');
  hand.className='portfolio-loader-v59__hand';
  hand.setAttribute('aria-hidden','true');
  const palm=doc.createElement('i');
  palm.className='portfolio-loader-v59__palm';
  hand.appendChild(palm);
  for(let index=0;index<5;index+=1){
    const finger=doc.createElement('i');
    finger.className='portfolio-loader-v59__finger';
    hand.appendChild(finger);
  }
  const initialLabel=doc.createElement('span');
  initialLabel.className='portfolio-loader-v59__label';
  initialLabel.textContent=runtimeCopy('opening');
  panel.append(hand,initialLabel);
  overlay.appendChild(panel);
  doc.body.appendChild(overlay);
  let shownAt=0;
  let hideTimer=0;
  let safetyTimer=0;
  const label=overlay.querySelector('.portfolio-loader-v59__label');
  const countSequence=[1,2,3,4,5,4,3,2];
  let countIndex=0;
  let countTimer=0;
  function stopCount(){
    window.clearInterval(countTimer);
    countTimer=0;
  }
  function startCount(){
    stopCount();
    countIndex=0;
    hand.dataset.count=String(countSequence[countIndex]);
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      hand.dataset.count='5';
      return;
    }
    countTimer=window.setInterval(()=>{
      countIndex=(countIndex+1)%countSequence.length;
      hand.dataset.count=String(countSequence[countIndex]);
    },180);
  }
  function show(text){
    window.clearTimeout(hideTimer);
    window.clearTimeout(safetyTimer);
    label.textContent=text||runtimeCopy('opening');
    shownAt=performance.now();
    startCount();
    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden','false');
    doc.body.setAttribute('aria-busy','true');
    safetyTimer=window.setTimeout(hide,8000);
  }
  function hide(){
    window.clearTimeout(safetyTimer);
    const remaining=Math.max(0,180-(performance.now()-shownAt));
    hideTimer=window.setTimeout(()=>{
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden','true');
      doc.body.removeAttribute('aria-busy');
      stopCount();
    },remaining);
  }
  doc.addEventListener('click',event=>{
    const detailTrigger=event.target.closest('[data-project],[data-experiment]');
    if(detailTrigger){show(runtimeCopy('opening'));return}
    const link=event.target.closest('a[href]');
    if(!link||event.defaultPrevented||event.button>0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    if(link.hasAttribute('download')||link.target==='_blank')return;
    const url=new URL(link.href,location.href);
    if(!['http:','https:'].includes(url.protocol)||url.hash&&url.pathname===location.pathname)return;
    if(url.origin===location.origin&&url.pathname!==location.pathname&&!/\.(?:pdf|zip|docx?)$/i.test(url.pathname)){
      show(runtimeCopy('loading'));
    }
  },true);
  doc.addEventListener('portfolio:detail-ready',hide);
  doc.addEventListener('portfolio:loading-start',event=>show(event.detail?.label));
  doc.addEventListener('portfolio:loading-ready',hide);
  show(runtimeCopy('loading'));
  if(doc.readyState==='complete')hide();
  else window.addEventListener('load',hide,{once:true});
  window.addEventListener('pageshow',event=>{if(event.persisted)hide()});
  window.setTimeout(hide,2500);
})();


/* Canonical navigation runtime owner. */
(() => {
  'use strict';
  const doc = document;

  const cleanGeneratedOverview = () => {
    doc.querySelectorAll('.info-grid-v45 > div,.project-signals-v45 > div').forEach(cell => {
      const value = cell.querySelector('strong,dd');
      const text = value?.textContent.trim() || '';
      const empty = !text || /^(undefined|null|—|-|n\/a)$/i.test(text);
      cell.dataset.empty = String(empty);
      // These cells are persistent render targets. They begin empty and are
      // populated from the Project SSOT only after a project is opened.
      cell.hidden = empty;
    });
    doc.querySelectorAll('.decision-result-v46').forEach(node => {
      node.setAttribute('role','note');
      node.setAttribute('aria-label',window.PORTFOLIO_DATA?.localizationRegistry?.runtimeUiLabels?.['decision-outcome']?.[doc.documentElement.lang === 'zh'?'zh':'en']||'');
    });
  };

  const dialog = doc.getElementById('detailDialog');
  if (dialog) new MutationObserver(cleanGeneratedOverview).observe(dialog,{subtree:true,childList:true,characterData:true});
  cleanGeneratedOverview();
})();


/* Canonical responsive runtime owner. */
(() => {
  'use strict';
  const doc=document;
  // Native links are the navigation owner. This guard catches accidental overlays
  // without hijacking modified clicks, downloads, hashes, or external links.
  doc.querySelectorAll('.site-header a[href]').forEach(link=>{
    link.addEventListener('click',event=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const url=new URL(link.href,location.href);
      if(url.origin===location.origin&&url.pathname.startsWith('/site/')) location.assign(url.href);
    });
  });
  doc.querySelectorAll('.modal-close').forEach(button=>button.setAttribute('aria-label',window.PORTFOLIO_DATA?.localizationRegistry?.runtimeUiLabels?.['close-project-details']?.[doc.documentElement.lang==='zh'?'zh':'en']||''));
})();
