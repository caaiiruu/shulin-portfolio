(function(){
  'use strict';
  const doc=document;
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
  initialLabel.textContent='Opening…';
  panel.append(hand,initialLabel);
  overlay.appendChild(panel);
  doc.body.appendChild(overlay);
  let shownAt=0;
  let hideTimer=0;
  const label=overlay.querySelector('.portfolio-loader-v59__label');
  function show(text){
    window.clearTimeout(hideTimer);
    label.textContent=text||'Opening…';
    shownAt=performance.now();
    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden','false');
  }
  function hide(){
    const remaining=Math.max(0,180-(performance.now()-shownAt));
    hideTimer=window.setTimeout(()=>{
      overlay.classList.remove('is-active');
      overlay.setAttribute('aria-hidden','true');
    },remaining);
  }
  doc.addEventListener('click',event=>{
    const detailTrigger=event.target.closest('[data-project],[data-experiment]');
    if(detailTrigger){show(doc.documentElement.lang.startsWith('zh')?'正在開啟…':'Opening…');return}
    const link=event.target.closest('a[href]');
    if(!link||event.defaultPrevented||event.button>0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const url=new URL(link.href,location.href);
    if(url.origin===location.origin&&url.pathname!==location.pathname){show(doc.documentElement.lang.startsWith('zh')?'載入中…':'Loading…')}
  },true);
  doc.addEventListener('portfolio:detail-ready',hide);
  doc.addEventListener('portfolio:loading-start',event=>show(event.detail?.label));
  doc.addEventListener('portfolio:loading-ready',hide);
  window.addEventListener('pageshow',hide);
  window.setTimeout(hide,2500);
})();
