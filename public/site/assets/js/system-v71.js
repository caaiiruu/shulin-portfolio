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
  doc.querySelectorAll('.modal-close').forEach(button=>button.setAttribute('aria-label',doc.documentElement.lang==='zh'?'關閉專案詳情':'Close project details'));
})();
