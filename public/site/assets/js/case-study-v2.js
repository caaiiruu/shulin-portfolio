(function(){
  'use strict';
  const svgPaths={
    expand_more:'M7 10l5 5 5-5z',
    arrow_forward:'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z'
  };
  function node(tag,className,text){
    const element=document.createElement(tag);
    if(className)element.className=className;
    if(text!=null)element.textContent=text;
    return element;
  }
  function icon(name){
    const wrap=node('span','csv2-icon');
    wrap.setAttribute('aria-hidden','true');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',svgPaths[name]);
    svg.append(path);wrap.append(svg);
    return wrap;
  }
  function section(name,className=''){
    const element=node('section',`csv2-section ${className}`.trim());
    element.dataset.csv2Section=name;
    return element;
  }
  function shell(){return node('div','csv2-shell')}
  function assetRecord(manifest,id){return manifest?.assets?.[id]||null}
  function captionKey(value){
    return String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\b(primary|supporting|connected|context|decision|proof|evidence|media|image)\b/g,' ').replace(/\s+/g,' ').trim();
  }
  function explanatoryCaption(asset,label,decisionTitle){
    const caption=asset?.caption?.trim();
    if(!caption)return '';
    const captionIdentity=captionKey(caption);
    const duplicates=[label,asset.role,decisionTitle].some(value=>captionIdentity===captionKey(value));
    return duplicates?'':caption;
  }
  function imageFor(asset,id,critical=false){
    if(!asset?.publicPath)return null;
    const image=node('img');
    image.src=asset.publicPath;image.alt=asset.alt||'';
    image.width=asset.width;image.height=asset.height;
    image.loading=critical?'eager':'lazy';image.decoding='async';
    image.fetchPriority=critical?'high':'low';image.dataset.csv2Asset=id;
    return image;
  }
  function lifecycleModel(content){
    const model=node('div','csv2-lifecycle-model');
    model.dataset.csv2LifecycleModel='true';
    const states=node('div','csv2-lifecycle-states');
    content.lifecycleModel.states.forEach((state,index)=>{
      const item=node('div','csv2-lifecycle-state');
      item.append(node('strong','',state),node('span','',content.lifecycleModel.semantics[index]));
      states.append(item);
    });
    model.append(states,node('p','csv2-lifecycle-label',content.lifecycleModel.label));
    return model;
  }
  function evidenceVisual(content,assets,id){
    if(id==='daily-hours-lifecycle-model')return lifecycleModel(content);
    const asset=assetRecord(assets,id);
    const figure=node('figure','csv2-evidence-frame');
    const image=imageFor(asset,id);
    if(image)figure.append(image);
    return figure;
  }
  function disablePendingZh(){
    document.querySelectorAll('[data-lang-toggle]').forEach(button=>{
      button.disabled=true;
      button.setAttribute('aria-disabled','true');
      button.setAttribute('aria-label','Traditional Chinese pending Human approval');
      button.title='Traditional Chinese pending Human approval';
      button.textContent='中文（待核准）';
    });
  }
  function labelSharedChrome(){
    const labels={
      '/work':'Work',
      '/experiments':'Experiments',
      '/profile':'Profile',
      '#main':'Back to top'
    };
    document.querySelectorAll('.site-header a,.site-footer a').forEach(link=>{
      const href=link.getAttribute('href');
      if(labels[href]&&!link.textContent.trim())link.textContent=labels[href];
    });
    const menuToggle=document.querySelector('.menu-toggle');
    if(menuToggle&&!menuToggle.textContent.trim())menuToggle.setAttribute('aria-label','Open menu');
  }
  function mount({route,content,assets,motion}){
    const root=document.querySelector('[data-case-study-v2-root]');
    if(!root||root.dataset.csv2Mounted==='true')return false;
    if(route.presentationContract!=='case-study-v2')return false;
    if(content.localeStatus?.en!=='APPROVED'||content.localeStatus?.zh!=='PENDING_HUMAN_APPROVAL')throw new Error('CSV2 localization contract mismatch');
    if(motion.status!=='VIDEO_PENDING'||motion.heroFilm!==null||motion.playCta?.enabled!==false)throw new Error('CSV2 motion contract mismatch');
    root.dataset.csv2Mounted='true';root.className='csv2-main';
    document.body.classList.add('csv2-active');disablePendingZh();labelSharedChrome();

    const hero=section('hero','csv2-hero');
    const heroShell=shell();
    heroShell.append(node('p','csv2-eyebrow',content.hero.eyebrow));
    const h1=node('h1','csv2-display');h1.append(document.createTextNode(content.hero.lineOne),node('span','',content.hero.lineTwo));
    heroShell.append(h1,node('p','csv2-lede',content.hero.positioning));
    const heroMedia=node('figure','csv2-hero-media csv2-reveal');
    heroMedia.append(imageFor(assetRecord(assets,motion.heroStaticAsset),motion.heroStaticAsset,true));
    heroShell.append(heroMedia);hero.append(heroShell);

    const first=section('first-question');
    const firstGrid=shell();firstGrid.className+=' csv2-question-grid csv2-reveal';
    firstGrid.append(node('span','csv2-section-index','01 / First question'));
    const firstQuestion=node('h2','csv2-question');
    firstQuestion.append(document.createTextNode(content.firstQuestion.lineOne),node('span','',content.firstQuestion.lineTwo));
    firstGrid.append(firstQuestion);first.append(firstGrid);

    const shift=section('the-shift','csv2-shift');
    const shiftShell=shell();const shiftGrid=node('div','csv2-shift-grid csv2-reveal');
    shiftGrid.append(node('p','csv2-shift-copy',content.shift.problemClose));
    const reframe=node('p','csv2-shift-reframe',content.shift.reframeOne);reframe.append(node('span','',content.shift.reframeTwo));shiftGrid.append(reframe);
    const lifecycle=node('div','csv2-lifecycle-rail');content.lifecycle.forEach(label=>lifecycle.append(node('span','',label)));
    shiftShell.append(shiftGrid,lifecycle);shift.append(shiftShell);

    const decisions=section('three-decisions');
    const decisionsShell=shell();
    const head=node('div','csv2-section-head csv2-reveal');
    head.append(node('h2','csv2-heading','Three decisions'),node('p','csv2-support','A decision workspace organized around project health, attention, and lifecycle.'));
    const layout=node('div','csv2-decision-layout');
    const tabs=node('div','csv2-decision-nav');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Daily Hours decisions');
    const stage=node('article','csv2-decision-stage csv2-decision-panel');stage.id='csv2DecisionPanel';stage.setAttribute('role','tabpanel');stage.tabIndex=0;
    const copy=node('div','csv2-decision-copy');
    const kicker=node('p','csv2-decision-kicker');const title=node('h3','csv2-decision-title');const question=node('p','csv2-decision-question');const direction=node('p','csv2-decision-direction');
    copy.append(kicker,title,question,direction);stage.append(copy);
    const proof=node('div','csv2-proof');proof.dataset.csv2Section='primary-proof';
    const proofFrame=node('figure','csv2-proof-frame');proof.append(proofFrame);stage.append(proof);
    const evidence=node('div','csv2-evidence');evidence.dataset.csv2Section='supporting-evidence';
    const disclosure=node('button','csv2-disclosure');disclosure.type='button';disclosure.setAttribute('aria-expanded','false');disclosure.setAttribute('aria-controls','csv2EvidenceBody');
    const disclosureLabel=node('span','','Explore supporting evidence');disclosure.append(disclosureLabel,icon('expand_more'));
    const evidenceBody=node('div','csv2-evidence-body');evidenceBody.id='csv2EvidenceBody';evidenceBody.hidden=true;
    const evidenceIndex=node('div','csv2-evidence-index');evidenceIndex.setAttribute('role','tablist');evidenceIndex.setAttribute('aria-label','Supporting evidence');
    const evidenceMedia=node('div','csv2-evidence-media');
    evidenceBody.append(evidenceIndex,evidenceMedia);
    const accordion=node('div','csv2-accordion');accordion.hidden=true;
    evidence.append(disclosure,evidenceBody,accordion);stage.append(evidence);
    layout.append(tabs,stage);decisionsShell.append(head,layout);decisions.append(decisionsShell);

    let activeDecision=0;
    function renderEvidenceItem(decision,index){
      const id=decision.supportingAssets[index];const asset=assetRecord(assets,id);
      const label=asset?.role||'Lifecycle model';const caption=explanatoryCaption(asset,label,decision.title);
      const media=[evidenceVisual(content,assets,id)];if(caption)media.push(node('p','csv2-evidence-caption',caption));evidenceMedia.replaceChildren(...media);
      evidenceIndex.querySelectorAll('button').forEach((button,buttonIndex)=>button.setAttribute('aria-selected',String(buttonIndex===index)));
    }
    function buildEvidence(decision){
      evidenceIndex.replaceChildren();accordion.replaceChildren();
      decision.supportingAssets.forEach((id,index)=>{
        const asset=assetRecord(assets,id);const label=asset?.role||'Lifecycle model';
        const button=node('button','csv2-evidence-index-button');button.type='button';button.setAttribute('role','tab');button.setAttribute('aria-selected',String(index===0));
        button.append(node('span','',String(index+1).padStart(2,'0')),node('span','',label));
        button.addEventListener('click',()=>renderEvidenceItem(decision,index));evidenceIndex.append(button);
        button.addEventListener('keydown',event=>{
          if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(event.key))return;
          event.preventDefault();
          const last=decision.supportingAssets.length-1;
          const next=event.key==='Home'?0:event.key==='End'?last:(index+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+decision.supportingAssets.length)%decision.supportingAssets.length;
          renderEvidenceItem(decision,next);evidenceIndex.querySelectorAll('button')[next].focus();
        });
        const item=node('div','csv2-accordion-item');const summary=node('button','csv2-accordion-summary');summary.type='button';summary.id=`csv2AccordionTrigger-${decision.id}-${index}`;summary.setAttribute('aria-expanded',String(index===0));summary.setAttribute('aria-controls',`csv2AccordionPanel-${decision.id}-${index}`);
        summary.append(node('span','csv2-accordion-index',String(index+1).padStart(2,'0')),node('span','csv2-accordion-title',label),icon('expand_more'));
        const panel=node('div','csv2-accordion-panel');panel.id=`csv2AccordionPanel-${decision.id}-${index}`;panel.setAttribute('role','region');panel.setAttribute('aria-labelledby',summary.id);panel.hidden=index!==0;
        const caption=explanatoryCaption(asset,label,decision.title);panel.append(evidenceVisual(content,assets,id));if(caption)panel.append(node('p','csv2-evidence-caption',caption));
        summary.addEventListener('click',()=>{
          const opening=summary.getAttribute('aria-expanded')!=='true';
          accordion.querySelectorAll('.csv2-accordion-summary').forEach(control=>control.setAttribute('aria-expanded','false'));
          accordion.querySelectorAll('.csv2-accordion-panel').forEach(contentPanel=>{contentPanel.hidden=true});
          summary.setAttribute('aria-expanded',String(opening));panel.hidden=!opening;
        });
        item.append(summary,panel);accordion.append(item);
      });
      renderEvidenceItem(decision,0);
    }
    function renderDecision(index){
      activeDecision=index;const decision=content.decisions[index];
      stage.classList.add('is-switching');
      const apply=()=>{
        kicker.textContent=`Decision ${decision.number}`;title.textContent=decision.title;question.textContent=decision.question;direction.textContent=decision.direction;
        const asset=assetRecord(assets,decision.primaryAsset);proofFrame.replaceChildren(imageFor(asset,decision.primaryAsset));
        buildEvidence(decision);disclosure.setAttribute('aria-expanded','false');disclosureLabel.textContent='Explore supporting evidence';evidenceBody.hidden=true;accordion.hidden=true;
        tabs.querySelectorAll('button').forEach((button,buttonIndex)=>{button.setAttribute('aria-selected',String(buttonIndex===index));button.tabIndex=buttonIndex===index?0:-1});
        stage.classList.remove('is-switching');
      };
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)apply();else window.setTimeout(apply,120);
    }
    content.decisions.forEach((decision,index)=>{
      const button=node('button','csv2-decision-tab');button.type='button';button.setAttribute('role','tab');button.setAttribute('aria-controls',stage.id);button.setAttribute('aria-selected',String(index===0));button.tabIndex=index===0?0:-1;
      button.append(node('span','csv2-decision-number',decision.number),node('span','',decision.title));
      button.addEventListener('click',()=>renderDecision(index));
      button.addEventListener('keydown',event=>{
        if(!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(event.key))return;
        event.preventDefault();const delta=['ArrowRight','ArrowDown'].includes(event.key)?1:-1;const next=(activeDecision+delta+content.decisions.length)%content.decisions.length;
        renderDecision(next);tabs.querySelectorAll('button')[next].focus();
      });
      tabs.append(button);
    });
    disclosure.addEventListener('click',()=>{
      const expanded=disclosure.getAttribute('aria-expanded')==='true';
      disclosure.setAttribute('aria-expanded',String(!expanded));evidenceBody.hidden=expanded;accordion.hidden=expanded;
      disclosureLabel.textContent=expanded?'Explore supporting evidence':'Close supporting evidence';
    });
    renderDecision(0);

    const changed=section('what-changed','csv2-change');const changedShell=shell();
    const changedText=node('p','csv2-reveal',content.whatChanged.lineOne);changedText.append(node('span','',content.whatChanged.lineTwo));changedShell.append(changedText);changed.append(changedShell);

    const outcomes=section('outcomes');const outcomeShell=shell();const outcomeHead=node('div','csv2-section-head csv2-reveal');
    outcomeHead.append(node('h2','csv2-heading',content.outcomesHeadline));
    const outcomeGrid=node('div','csv2-outcome-grid');content.outcomes.forEach((item,index)=>{const card=node('article','csv2-outcome csv2-reveal');card.append(node('span','csv2-outcome-theme',item.theme),node('span','csv2-outcome-index',String(index+1).padStart(2,'0')),node('strong','',item.title),node('p','',item.statement));outcomeGrid.append(card)});
    outcomeShell.append(outcomeHead,outcomeGrid);outcomes.append(outcomeShell);

    const next=section('next-question','csv2-next');const nextShell=shell();nextShell.append(node('p','csv2-eyebrow','Next question'));
    nextShell.append(node('h2','csv2-next-question csv2-reveal',content.nextQuestion));next.append(nextShell);

    const demo=section('request-demo','csv2-demo');const demoShell=shell();const demoSurface=node('div','csv2-demo-surface csv2-reveal');
    const demoCopy=node('div','csv2-demo-copy');demoCopy.append(node('h2','csv2-demo-title',content.cta.headline),node('p','csv2-demo-support',content.cta.supportingCopy));
    const cta=node('a','csv2-cta');cta.href=content.cta.href;cta.append(node('span','csv2-cta-label',content.cta.label),icon('arrow_forward'));
    demoSurface.append(demoCopy,cta);demoShell.append(demoSurface);demo.append(demoShell);

    root.replaceChildren(hero,first,shift,decisions,changed,outcomes,next,demo);
    const reveal=()=>{
      const targets=[...document.querySelectorAll('.csv2-reveal,.csv2-lifecycle-model')];
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){targets.forEach(item=>item.classList.add('is-visible'));return}
      const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.12});
      targets.forEach(item=>observer.observe(item));
    };
    reveal();
    return true;
  }
  window.CASE_STUDY_PRESENTATIONS={...(window.CASE_STUDY_PRESENTATIONS||{}),'case-study-v2':{mount}};
})();
