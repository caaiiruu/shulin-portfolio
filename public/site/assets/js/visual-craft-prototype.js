(function(){
  'use strict';
  const doc=document;
  const paymentMedia=[
    {label:'Shared transaction',phone:'/site/assets/projects/payment/payment-decision-01-app-entry-r1649h.jpg',phoneAlt:'FairPrice app payment entry',store:'/site/assets/validation/payment/validation-payment-sco-entry-final-r77.jpg',storeAlt:'Self-checkout payment entry',title:'One transaction, visible at every handoff',copy:'The same payment reference connects the customer app with cashier and self-checkout execution.',impact:['One app entry','Shared payment reference','Consistent handoff']},
    {label:'Value clarity',phone:'/site/assets/validation/payment/validation-payment-receipt-email-mobile-r77.jpg',phoneAlt:'Mobile payment receipt with payable value',store:'/site/assets/validation/payment/validation-payment-sco-entry-final-r77.jpg',storeAlt:'Self-checkout loyalty and discount selection',title:'Value remains legible across surfaces',copy:'Payable amount, LinkPoints and confirmation remain visible before and after checkout.',impact:['Amount hierarchy','Loyalty visibility','Clear confirmation']},
    {label:'Failure recovery',phone:'/site/assets/validation/payment/validation-payment-refund-state-02-r77.jpg',phoneAlt:'Customer recovery state in the app',store:'/site/assets/projects/payment/payment-return-recovery-human-r1649d.webp',storeAlt:'Cashier recovery and return verification interface',title:'Failure becomes a recoverable path',copy:'The experience makes the next action visible and carries the same transaction into assisted recovery.',impact:['Visible status','Actionable next step','Assisted recovery']},
    {label:'Refund traceability',phone:'/site/assets/validation/payment/validation-payment-refund-state-03-r77.jpg',phoneAlt:'Return QR code in the customer app',store:'/site/assets/validation/payment/validation-payment-internal-portal-list-r77.jpg',storeAlt:'Internal transaction lookup for operational follow-through',title:'The transaction stays traceable after checkout',copy:'Customers can follow the refund while support teams can find the corresponding operational record.',impact:['Refund progress','Transaction record','Operational follow-through']}
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
    section.innerHTML='<div class="vc-state-viewer__copy"><span class="vc-state-viewer__eyebrow">INTERACTIVE PRODUCT DEMO</span><h2>Interactive Transaction Lab</h2><p>Change one product rule and watch every surface respond. Select a decision, then inspect its consequence in the customer app and store system—without leaving this viewport.</p><div class="vc-state-viewer__tabs" role="tablist" aria-label="Payment product concepts"></div></div><div class="vc-state-viewer__stage"><div class="vc-state-viewer__surfaces" role="group" aria-label="Inspect product surface"><button type="button" data-surface="phone" aria-pressed="true">Phone</button><button type="button" data-surface="store" aria-pressed="false">Cashier / SCO</button><button type="button" data-surface="both" aria-pressed="false">Connected view</button></div><div class="vc-state-viewer__devices" data-active-surface="phone"><figure class="vc-device vc-device--phone"><span class="vc-device__label">CUSTOMER APP</span><div class="vc-device__screen"><img></div></figure><figure class="vc-device vc-device--store"><span class="vc-device__label">CASHIER / SELF-CHECKOUT</span><div class="vc-device__screen"><img></div></figure></div><div class="vc-state-viewer__result" aria-live="polite"><strong></strong><span></span><ul></ul></div></div>';
    const tabs=section.querySelector('.vc-state-viewer__tabs'),devices=section.querySelector('.vc-state-viewer__devices'),phone=section.querySelector('.vc-device--phone img'),store=section.querySelector('.vc-device--store img'),title=section.querySelector('.vc-state-viewer__result strong'),copy=section.querySelector('.vc-state-viewer__result>span'),impact=section.querySelector('.vc-state-viewer__result ul');
    function select(index,focus){const item=paymentMedia[index];devices.classList.add('is-changing');setTimeout(()=>{phone.src=item.phone;phone.alt=item.phoneAlt;store.src=item.store;store.alt=item.storeAlt;title.textContent=item.title;copy.textContent=item.copy;impact.innerHTML=item.impact.map(point=>`<li>${point}</li>`).join('');devices.classList.remove('is-changing')},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:120);tabs.querySelectorAll('button').forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1});if(focus)tabs.children[index].focus()}
    paymentMedia.forEach((item,index)=>{const button=doc.createElement('button');button.type='button';button.className='vc-state-viewer__tab';button.setAttribute('role','tab');button.innerHTML=`<span>0${index+1}</span><span>${item.label}</span>`;button.addEventListener('click',()=>select(index));button.addEventListener('keydown',event=>{if(!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft'].includes(event.key))return;event.preventDefault();const delta=['ArrowDown','ArrowRight'].includes(event.key)?1:-1;select((index+delta+paymentMedia.length)%paymentMedia.length,true)});tabs.append(button)});
    section.querySelectorAll('[data-surface]').forEach(button=>button.addEventListener('click',()=>{devices.dataset.activeSurface=button.dataset.surface;section.querySelectorAll('[data-surface]').forEach(option=>option.setAttribute('aria-pressed',String(option===button)))}));select(0);return section;
  }
  function enhancePayment(){
    const surface=doc.getElementById('programmeSurface');if(!surface||surface.querySelector('.vc-product-sequence'))return;
    const title=doc.getElementById('detailTitle')?.textContent||'';if(!/payment system|付款系統/i.test(title))return;
    surface.dataset.visualCraftEnhanced='true';surface.prepend(stateViewer());surface.prepend(productSequence());
    if(window.location.hash==='#transaction-lab')window.requestAnimationFrame(()=>doc.getElementById('transaction-lab')?.scrollIntoView({block:'start'}));
  }
  function enhancePrinciples(){
    const constellation=doc.querySelector('[data-principle-constellation]');if(!constellation)return;
    const images=['/site/assets/projects/payment/payment-decision-02-value-visibility.jpg','/site/assets/projects/payment/payment-decision-03-recovery-traceability-v2.jpg','/site/assets/projects/dbs/dbs-decision-03-cross-role-architecture-01.jpeg','/site/assets/projects/voucher/voucher-offer-reusable-system-shared-states-01.jpg'];
    const apply=()=>constellation.querySelectorAll('.principle-node').forEach((node,index)=>{if(node.querySelector('.vc-principle-evidence'))return;const figure=doc.createElement('figure');figure.className='vc-principle-evidence';figure.innerHTML=`<img src="${images[index%images.length]}" alt="Product interface evidence for this design principle" loading="lazy" decoding="async">`;node.querySelector('.principle-node__trigger')?.append(figure)});apply();new MutationObserver(apply).observe(constellation,{childList:true,subtree:true});
  }
  bindProjectButtons();enhancePrinciples();new MutationObserver(enhancePayment).observe(doc.body,{childList:true,subtree:true});enhancePayment();
})();
