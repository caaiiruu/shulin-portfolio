(function(){
  'use strict';
  const doc=document;
  const paymentMedia=[
    {label:'One app',voice:'I have to fish out 2 cards — MyNTUC and a credit card. Here, it’s only one app.',role:'SHOPPER VOICE',image:'/site/assets/projects/payment/payment-decision-01-app-entry-r1649h.jpg',alt:'FairPrice app entry connected with store checkout',format:'wide',title:'One entry, one shared transaction',copy:'App, cashier and self-checkout use the same payment reference instead of separate channel logic.',impact:['One app entry','Shared reference','Consistent handoff']},
    {label:'Fewer steps',voice:'It’s express payment. It cuts down the steps of swiping cards, and it’s cashless.',role:'SHOPPER VOICE',image:'/site/assets/validation/payment/validation-payment-video-order-details-poster-light-r77.webp',video:'/site/assets/validation/payment/validation-payment-video-order-details-light-r77.mp4',alt:'Order details moving through the payment experience',format:'wide',title:'Value stays visible through completion',copy:'The product keeps amount, benefits and confirmation legible while removing unnecessary checkout steps.',impact:['9 → 6 SCO steps','Amount hierarchy','Clear confirmation']},
    {label:'When it fails',voice:'What happens if payment doesn’t complete?',role:'JOURNEY QUESTION',image:'/site/assets/validation/payment/validation-payment-refund-state-02-r77.jpg',alt:'Payment recovery state with a clear next action',format:'phone',title:'Failure becomes a recoverable path',copy:'Status, next action and assisted recovery remain connected to the original transaction.',impact:['Visible status','Actionable next step','Assisted recovery']},
    {label:'After checkout',voice:'How can I follow a refund after checkout?',role:'JOURNEY QUESTION',image:'/site/assets/validation/payment/validation-payment-refund-state-03-r77.jpg',alt:'Return QR and refund progress in the customer app',format:'phone',title:'The transaction stays traceable',copy:'Customers can follow progress while support teams can find the corresponding operational record.',impact:['Refund progress','Transaction record','Operational follow-through']}
  ];
  function bindProjectButtons(){
    doc.querySelectorAll('.vc-work-card[data-project]').forEach(button=>button.addEventListener('click',()=>{
      const source=doc.querySelector(`.project-card-hit[data-project="${button.dataset.project}"],.work-card-v32__button[data-project="${button.dataset.project}"]`);
      if(source)source.click();
    }));
  }
  function productSequence(){
    const section=doc.createElement('section');section.className='vc-product-sequence';section.dataset.componentOwner='VisualCraftPrototype';
    section.innerHTML='<header class="vc-product-sequence__head"><div><span class="vc-product-sequence__label">EARLY PRODUCT EXPRESSION</span><h2>One payment journey, across every handoff.</h2></div><p>The product becomes visible before the case study asks the reader to absorb its architecture: entry, checkout, processing, confirmation and operational follow-through.</p></header><div class="vc-product-sequence__rail"></div>';
    const items=[
      ['App entry','/site/assets/projects/payment/payment-decision-01-app-entry-r1649h.jpg','App payment entry'],
      ['Self-checkout','/site/assets/validation/payment/validation-payment-sco-entry-final-r77.jpg','Self-checkout payment entry'],
      ['Processing','/site/assets/validation/payment/validation-payment-refund-state-01-r77.jpg','Payment or refund processing state'],
      ['Confirmation','/site/assets/validation/payment/validation-payment-receipt-email-mobile-r77.jpg','Payment confirmation receipt'],
      ['Operations','/site/assets/validation/payment/validation-payment-internal-portal-list-r77.jpg','Internal transaction review']
    ];
    const rail=section.querySelector('.vc-product-sequence__rail');items.forEach(([label,src,alt])=>{const figure=doc.createElement('figure');figure.className='vc-product-sequence__step';figure.innerHTML=`<img src="${src}" alt="${alt}" loading="lazy" decoding="async"><figcaption>${label}</figcaption>`;rail.append(figure)});return section;
  }
  function stateViewer(){
    const section=doc.createElement('section');section.className='vc-state-viewer';section.id='transaction-lab';section.dataset.componentOwner='VisualCraftPrototype';
    section.innerHTML='<header class="vc-state-viewer__head"><span class="vc-state-viewer__eyebrow">FROM SHOPPER SIGNAL TO PRODUCT BEHAVIOUR</span><h2>Tap a customer problem. See the product respond.</h2></header><div class="vc-state-viewer__experience"><div class="vc-state-viewer__tabs" role="tablist" aria-label="Customer problems"></div><div class="vc-state-viewer__stage"><div class="vc-device" data-format="wide"><span class="vc-device__label">PRODUCT RESPONSE</span><div class="vc-device__screen"><img><video muted loop playsinline preload="none" aria-hidden="true"></video></div></div><div class="vc-state-viewer__result" aria-live="polite"><strong></strong><span></span><ul></ul></div></div></div>';
    const tabs=section.querySelector('.vc-state-viewer__tabs'),device=section.querySelector('.vc-device'),image=device.querySelector('img'),video=device.querySelector('video'),title=section.querySelector('.vc-state-viewer__result strong'),copy=section.querySelector('.vc-state-viewer__result>span'),impact=section.querySelector('.vc-state-viewer__result ul');let visible=false,current=0;
    function syncVideo(){const item=paymentMedia[current],reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(item.video&&visible&&!reduced){if(video.getAttribute('src')!==item.video)video.src=item.video;video.hidden=false;image.hidden=true;video.play().catch(()=>{})}else{video.pause();video.removeAttribute('src');video.load();video.hidden=true;image.hidden=false}}
    function select(index,focus){const item=paymentMedia[index];current=index;device.classList.add('is-changing');setTimeout(()=>{device.dataset.format=item.format;image.src=item.image;image.alt=item.alt;title.textContent=item.title;copy.textContent=item.copy;impact.innerHTML=item.impact.map(point=>`<li>${point}</li>`).join('');syncVideo();device.classList.remove('is-changing')},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:120);tabs.querySelectorAll('button').forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1});if(focus)tabs.children[index].focus()}
    paymentMedia.forEach((item,index)=>{const button=doc.createElement('button');button.type='button';button.className='vc-state-viewer__tab';button.setAttribute('role','tab');button.innerHTML=`<span>${item.role}</span><strong>${item.voice}</strong><i>${item.label}</i>`;button.addEventListener('click',()=>select(index));button.addEventListener('keydown',event=>{if(!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft'].includes(event.key))return;event.preventDefault();const delta=['ArrowDown','ArrowRight'].includes(event.key)?1:-1;select((index+delta+paymentMedia.length)%paymentMedia.length,true)});tabs.append(button)});
    new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting||false;syncVideo()},{rootMargin:'160px'}).observe(section);select(0);return section;
  }
  function enhancePayment(){
    const surface=doc.getElementById('programmeSurface');if(!surface||surface.querySelector('.vc-product-sequence'))return;
    const title=doc.getElementById('detailTitle')?.textContent||'';if(!/payment system|付款系統/i.test(title))return;
    surface.dataset.visualCraftEnhanced='true';surface.prepend(productSequence());surface.prepend(stateViewer());
    if(window.location.hash==='#transaction-lab')window.requestAnimationFrame(()=>doc.getElementById('transaction-lab')?.scrollIntoView({block:'start'}));
  }
  function enhancePrinciples(){
    const constellation=doc.querySelector('[data-principle-constellation]');if(!constellation)return;
    const images=['/site/assets/projects/payment/payment-decision-02-value-visibility.jpg','/site/assets/projects/payment/payment-decision-03-recovery-traceability-v2.jpg','/site/assets/projects/dbs/dbs-decision-03-cross-role-architecture-01.jpeg','/site/assets/projects/voucher/voucher-offer-reusable-system-shared-states-01.jpg'];
    const apply=()=>constellation.querySelectorAll('.principle-node').forEach((node,index)=>{if(node.querySelector('.vc-principle-evidence'))return;const figure=doc.createElement('figure');figure.className='vc-principle-evidence';figure.innerHTML=`<img src="${images[index%images.length]}" alt="Product interface evidence for this design principle" loading="lazy" decoding="async">`;node.querySelector('.principle-node__trigger')?.append(figure)});apply();new MutationObserver(apply).observe(constellation,{childList:true,subtree:true});
  }
  bindProjectButtons();enhancePrinciples();new MutationObserver(enhancePayment).observe(doc.body,{childList:true,subtree:true});enhancePayment();
})();
