(()=>{
  try{
    const measurementId='G-RSC73N4BPX';
    window.dataLayer=window.dataLayer||[];
    window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
    if(window.__portfolioGa4Initialized)return;
    window.__portfolioGa4Initialized=true;
    const script=document.createElement('script');
    script.async=true;
    script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.onerror=()=>{};
    document.head.append(script);
    window.gtag('js',new Date());
    window.gtag('config',measurementId);
  }catch{}
})();
