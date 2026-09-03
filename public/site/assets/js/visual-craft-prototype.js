(function(){
  'use strict';
  const doc=document;
  const paymentMedia=[
    {label:'Shared transaction',src:'/site/assets/projects/payment/payment-system-transaction-map.jpg',alt:'Shared payment transaction model across customer and store surfaces',title:'One transaction, three visible surfaces',copy:'The App, cashier and self-checkout stay connected to the same payment logic.'},
    {label:'Value clarity',src:'/site/assets/projects/payment/payment-decision-02-value-visibility.jpg',alt:'Payment value hierarchy showing amount and loyalty value',title:'Payable value stays legible',copy:'Amount, LinkPoints and confirmation hierarchy remain clear at the handoff.'},
    {label:'Failure recovery',src:'/site/assets/projects/payment/payment-decision-03-recovery-traceability-v2.jpg',alt:'Payment failure and recovery states',title:'Failure becomes an actionable state',copy:'Clear status, retry and alternative paths preserve trust when payment fails.'},
    {label:'Refund traceability',src:'/site/assets/validation/payment/validation-payment-refund-state-03-r77.jpg',alt:'Refund progress status in the payment experience',title:'Refund progress remains visible',copy:'Customers and operations can follow the transaction beyond checkout.'}
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
    const section=doc.createElement('section');section.className='vc-state-viewer';section.dataset.componentOwner='VisualCraftPrototype';
    section.innerHTML='<div class="vc-state-viewer__copy"><span class="vc-state-viewer__eyebrow">INTERACTIVE PRODUCT SYSTEM</span><h2>See each decision change the product.</h2><p>Select a concept to inspect how one system responds across value, failure and post-payment states.</p><div class="vc-state-viewer__tabs" role="tablist" aria-label="Payment product concepts"></div></div><div class="vc-state-viewer__stage"><figure class="vc-state-viewer__figure"><img><figcaption><strong></strong><span></span></figcaption></figure></div>';
    const tabs=section.querySelector('.vc-state-viewer__tabs'),figure=section.querySelector('.vc-state-viewer__figure'),image=figure.querySelector('img'),title=figure.querySelector('strong'),copy=figure.querySelector('span');
    function select(index,focus){const item=paymentMedia[index];figure.classList.add('is-changing');setTimeout(()=>{image.src=item.src;image.alt=item.alt;title.textContent=item.title;copy.textContent=item.copy;figure.classList.remove('is-changing')},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:150);tabs.querySelectorAll('button').forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1});if(focus)tabs.children[index].focus()}
    paymentMedia.forEach((item,index)=>{const button=doc.createElement('button');button.type='button';button.className='vc-state-viewer__tab';button.setAttribute('role','tab');button.innerHTML=`<span>0${index+1}</span><span>${item.label}</span>`;button.addEventListener('click',()=>select(index));button.addEventListener('keydown',event=>{if(!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft'].includes(event.key))return;event.preventDefault();const delta=['ArrowDown','ArrowRight'].includes(event.key)?1:-1;select((index+delta+paymentMedia.length)%paymentMedia.length,true)});tabs.append(button)});select(0);return section;
  }
  function enhancePayment(){
    const surface=doc.getElementById('programmeSurface');if(!surface||surface.querySelector('.vc-product-sequence'))return;
    const title=doc.getElementById('detailTitle')?.textContent||'';if(!/payment system|付款系統/i.test(title))return;
    surface.dataset.visualCraftEnhanced='true';surface.prepend(stateViewer());surface.prepend(productSequence());
  }
  function enhancePrinciples(){
    const constellation=doc.querySelector('[data-principle-constellation]');if(!constellation)return;
    const images=['/site/assets/projects/payment/payment-decision-02-value-visibility.jpg','/site/assets/projects/payment/payment-decision-03-recovery-traceability-v2.jpg','/site/assets/projects/dbs/dbs-decision-03-cross-role-architecture-01.jpeg','/site/assets/projects/voucher/voucher-offer-reusable-system-shared-states-01.jpg'];
    const apply=()=>constellation.querySelectorAll('.principle-node').forEach((node,index)=>{if(node.querySelector('.vc-principle-evidence'))return;const figure=doc.createElement('figure');figure.className='vc-principle-evidence';figure.innerHTML=`<img src="${images[index%images.length]}" alt="Product interface evidence for this design principle" loading="lazy" decoding="async">`;node.querySelector('.principle-node__trigger')?.append(figure)});apply();new MutationObserver(apply).observe(constellation,{childList:true,subtree:true});
  }
  bindProjectButtons();enhancePrinciples();new MutationObserver(enhancePayment).observe(doc.body,{childList:true,subtree:true});enhancePayment();
})();
