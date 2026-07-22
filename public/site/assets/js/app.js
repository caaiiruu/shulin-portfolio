(function(){
  'use strict';
  const DATA=window.PORTFOLIO_DATA;
  const doc=document;
  const body=doc.body;
  const root=doc.documentElement;
  let lang='en';
  let currentInvoker=null;
  let rootInvoker=null;
  let currentDetail=null;
  let galleryIndex=0;
  const detailStack=[];
  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const precisePointer=window.matchMedia('(pointer: fine)');

  const localize=(value)=>Array.isArray(value)?value[lang==='zh'?1:0]:value;
  function safeText(node,value){if(node)node.textContent=value==null?'':String(value)}
  function clear(node){while(node&&node.firstChild)node.removeChild(node.firstChild)}
  function element(tag,className,text){const node=doc.createElement(tag);if(className)node.className=className;if(text!==undefined)safeText(node,text);return node}
  function appendList(node,items){clear(node);(items||[]).forEach(item=>node.appendChild(element('li','',item)))}

  try{lang=localStorage.getItem('portfolioLang')||'en'}catch(error){lang='en'}
  function renderLimitedRichText(node,raw){
    clear(node);
    let target=node;
    String(raw||'').split(/(<br>|<em>|<\/em>)/).forEach(token=>{
      if(token==='<br>'){target.appendChild(doc.createElement('br'));return}
      if(token==='<em>'){const emphasis=doc.createElement('em');target.appendChild(emphasis);target=emphasis;return}
      if(token==='</em>'){target=node;return}
      if(token)target.appendChild(doc.createTextNode(token));
    });
  }
  function applyLanguage(next){
    lang=next==='zh'?'zh':'en';root.lang=lang==='zh'?'zh-Hant':'en';
    try{localStorage.setItem('portfolioLang',lang)}catch(error){}
    doc.querySelectorAll('[data-en]').forEach(node=>safeText(node,node.dataset[lang]||node.dataset.en));
    doc.querySelectorAll('[data-en-html]').forEach(node=>renderLimitedRichText(node,node.dataset[lang+'Html']||node.dataset.enHtml));
    doc.querySelectorAll('[data-lang-toggle]').forEach(node=>safeText(node,lang==='en'?'中文':'EN'));
    if(currentDetail)renderDetail();
    doc.dispatchEvent(new CustomEvent('portfolio:language',{detail:{lang}}));
  }
  doc.querySelectorAll('[data-lang-toggle]').forEach(button=>button.addEventListener('click',()=>applyLanguage(lang==='en'?'zh':'en')));
  const heroRole=doc.querySelector('.hero-role');
  const heroLead=doc.querySelector('.hero .lead-copy');
  if(heroRole){heroRole.dataset.en='Senior Product Designer · Complex systems · AI-assisted products';heroRole.dataset.zh='資深產品設計師 · 複雜系統 · AI 輔助產品';}
  if(heroLead){heroLead.dataset.en='I turn complex operations into clear, scalable product systems.';heroLead.dataset.zh='我把複雜營運轉化為清楚、可擴展的產品系統。';}
  doc.querySelectorAll('.case-link-v53').forEach(link=>{link.dataset.en='View case ↗';link.dataset.zh='查看案例 ↗';});
  applyLanguage(lang);
  window.getPortfolioLanguage=()=>lang;

  const menu=doc.getElementById('mobileMenu');
  const menuToggle=doc.querySelector('.menu-toggle');
  function setMenu(open){
    if(!menu||!menuToggle)return;
    menu.classList.toggle('is-open',open);menuToggle.setAttribute('aria-expanded',String(open));body.classList.toggle('is-locked',open);
    cursor.hide();
  }
  menuToggle?.addEventListener('click',()=>setMenu(!menu.classList.contains('is-open')));
  menu?.addEventListener('click',event=>{if(event.target.closest('a'))setMenu(false)});
  doc.addEventListener('click',event=>{if(menu?.classList.contains('is-open')&&!event.target.closest('.site-header'))setMenu(false)});

  // Purposeful scroll-trigger: static without JS, animated only after activation.
  const revealNodes=[...doc.querySelectorAll('[data-motion-reveal]')];
  if(!prefersReduced.matches)body.classList.add('motion-ready');
  if('IntersectionObserver' in window&&!prefersReduced.matches){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-inview');observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -7%'});
    revealNodes.forEach(node=>observer.observe(node));
  }else{revealNodes.forEach(node=>node.classList.add('is-inview'))}
  window.requestAnimationFrame(()=>doc.querySelector('.hero')?.classList.add('is-ready'));

  // Native pointer feedback only. Custom cursor labels were removed because they obscured content.
  const cursor={hide(){}};

  // Subtle artifact tilt via Web Animations API (no inline style ownership).
  if(precisePointer.matches&&!prefersReduced.matches){
    doc.querySelectorAll('[data-tilt]').forEach(target=>{
      target.addEventListener('pointermove',event=>{
        const rect=target.getBoundingClientRect();
        const x=(event.clientX-rect.left)/rect.width-.5;
        const y=(event.clientY-rect.top)/rect.height-.5;
        target.animate({transform:`rotateX(${(-y*2.2).toFixed(2)}deg) rotateY(${(x*2.2).toFixed(2)}deg) rotateZ(-2deg)`},{duration:120,fill:'forwards',easing:'cubic-bezier(.2,0,0,1)'});
      });
      target.addEventListener('pointerleave',()=>target.animate({transform:'rotateX(0deg) rotateY(0deg) rotateZ(-2deg)'},{duration:220,fill:'forwards',easing:'cubic-bezier(.2,0,0,1)'}));
    });
  }

  // Shared horizontal rail controller: native scrolling, visible controls, no auto-rotation.
  function railControlsFor(id){
    return {
      prev:doc.querySelector(`[data-rail-prev="${id}"]`),
      next:doc.querySelector(`[data-rail-next="${id}"]`)
    };
  }
  function updateRailControls(rail){
    if(!rail||!rail.id)return;
    const {prev,next}=railControlsFor(rail.id);
    const max=Math.max(0,rail.scrollWidth-rail.clientWidth);
    const atStart=rail.scrollLeft<=2;
    const atEnd=rail.scrollLeft>=max-2;
    const scrollable=max>2;
    rail.dataset.railScrollable=String(scrollable);
    if(prev){prev.hidden=!scrollable;prev.disabled=atStart;prev.setAttribute('aria-disabled',String(atStart))}
    if(next){next.hidden=!scrollable;next.disabled=atEnd;next.setAttribute('aria-disabled',String(atEnd))}
  }
  function bindRail(rail){
    if(!rail||rail.dataset.railBound==='true')return;
    rail.dataset.railBound='true';
    const {prev,next}=railControlsFor(rail.id);
    const move=direction=>{
      const visibleItems=[...rail.children].filter(item=>!item.hidden);
      const first=visibleItems[0];
      const second=visibleItems[1];
      const gap=second?Math.max(0,second.offsetLeft-first.offsetLeft-first.getBoundingClientRect().width):0;
      const amount=first?Math.max(1,Math.round(first.getBoundingClientRect().width+gap)):Math.max(240,Math.floor(rail.clientWidth*.84));
      rail.scrollBy({left:direction*amount,behavior:prefersReduced.matches?'auto':'smooth'});
    };
    prev?.addEventListener('click',()=>move(-1));
    next?.addEventListener('click',()=>move(1));
    rail.addEventListener('scroll',()=>updateRailControls(rail),{passive:true});
    updateRailControls(rail);
  }
  function refreshHorizontalRails(){
    doc.querySelectorAll('[data-rail]').forEach(bindRail);
    doc.querySelectorAll('[data-rail]').forEach(updateRailControls);
  }
  window.refreshHorizontalRails=refreshHorizontalRails;
  const railResizeObserver='ResizeObserver' in window?new ResizeObserver(refreshHorizontalRails):null;
  doc.querySelectorAll('[data-rail]').forEach(rail=>railResizeObserver?.observe(rail));
  window.addEventListener('resize',refreshHorizontalRails);
  refreshHorizontalRails();



  // v33: scalable project ordering.
  const scalableWorkGallery=doc.querySelector('[data-scalable-work-gallery]');
  const workArchive=doc.getElementById('workArchive');
  const workArchiveGrid=doc.getElementById('workArchiveGrid');
  if(scalableWorkGallery && workArchive && workArchiveGrid){
    const allWorkCards=[...scalableWorkGallery.querySelectorAll('[data-feature-rank]')];
    allWorkCards.sort((a,b)=>{
      const rankDiff=Number(a.dataset.featureRank||999)-Number(b.dataset.featureRank||999);
      if(rankDiff!==0) return rankDiff;
      return String(b.dataset.projectDate||'').localeCompare(String(a.dataset.projectDate||''));
    });
    allWorkCards.forEach(card=>scalableWorkGallery.appendChild(card));
    if(allWorkCards.length>4){
      allWorkCards.slice(4).forEach(card=>{
        card.dataset.archiveCard='true';
        workArchiveGrid.appendChild(card);
      });
      workArchive.hidden=false;
    }
  }

  // v33: experiment rails follow explicit priority, then DOM order.
  doc.querySelectorAll('[data-rail]').forEach(rail=>{
    const ordered=[...rail.querySelectorAll('[data-experiment-priority]')];
    if(ordered.length){
      ordered.sort((a,b)=>Number(a.dataset.experimentPriority||999)-Number(b.dataset.experimentPriority||999));
      ordered.forEach(card=>rail.appendChild(card));
    }
  });

  // Work page problem filters.
  const workFilterButtons=[...doc.querySelectorAll('[data-work-filter]')];
  const workCards=[...doc.querySelectorAll('[data-work-category]')];
  function applyWorkFilter(filter){
    workFilterButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.workFilter===filter)));
    workCards.forEach(card=>{card.hidden=filter!=='all'&&card.dataset.workCategory!==filter});
    scalableWorkGallery?.classList.toggle('is-filtered',filter!=='all');
    if(workArchive&&workArchiveGrid){const visible=[...workArchiveGrid.children].some(card=>!card.hidden);workArchive.hidden=!visible}
  }
  workFilterButtons.forEach(button=>button.addEventListener('click',()=>{
 applyWorkFilter(button.dataset.workFilter);
 button.scrollIntoView({behavior:prefersReduced.matches?'auto':'smooth',block:'nearest',inline:'nearest'});
}));

  const dialog=doc.getElementById('detailDialog');
  const dialogTitle=doc.getElementById('detailTitle');
  const projectView=doc.getElementById('projectView');
  const experimentView=doc.getElementById('experimentView');
  const dialogClose=doc.getElementById('detailClose');
  const dialogBack=doc.getElementById('detailBack');
  const dialogStatus=doc.getElementById('dialogStatus');
  const dialogScrollRoot=dialog?.querySelector('.dialog-scroll');
  dialogScrollRoot?.addEventListener('scroll',()=>{
    if(dialogScrollRoot.scrollLeft!==0)dialogScrollRoot.scrollLeft=0;
  },{passive:true});

  function setDialogOpenState(open){body.classList.toggle('is-locked',open);cursor.hide()}
  function updateCloseControl(){
    if(!dialogClose)return;
    const canGoBack=detailStack.length>0;
    dialogClose.classList.remove('is-back');
    dialogClose.setAttribute('aria-label',lang==='zh'?'關閉所有詳情':'Close all details');
    clear(dialogClose);
    dialogClose.appendChild(element('span','modal-close__icon','×'));
    if(dialogBack){
      dialogBack.hidden=!canGoBack;
      dialogBack.setAttribute('aria-label',lang==='zh'?'返回上一個詳情':'Back to previous details');
      clear(dialogBack);
      if(canGoBack)dialogBack.append(element('span','', '←'),element('span','',lang==='zh'?'返回':'Back'));
    }
  }
  function returnToPreviousDetail(){
    if(!dialog?.open)return;
    if(detailStack.length){
      const previous=detailStack.pop();
      currentDetail=previous.detail;
      currentInvoker=previous.invoker;
      galleryIndex=previous.galleryIndex;
      renderDetail();
      if(dialogScrollRoot)dialogScrollRoot.scrollTo({top:previous.scrollTop||0,left:0,behavior:'auto'});
      updateCloseControl();
      dialogTitle.focus({preventScroll:true});
      safeText(dialogStatus,lang==='zh'?'已返回上一個詳情':'Returned to previous details');
      return;
    }
  }
  function closeDialog(){
    if(!dialog?.open)return;
    dialog.classList.add('is-closing');
    const finish=()=>{dialog.classList.remove('is-closing');dialog.close();setDialogOpenState(false);safeText(dialogStatus,lang==='zh'?'詳情已關閉':'Details closed');rootInvoker?.focus();detailStack.length=0;rootInvoker=null;currentInvoker=null;currentDetail=null;updateCloseControl()};
    if(prefersReduced.matches)finish();else window.setTimeout(finish,140);
  }
  dialogClose?.addEventListener('click',closeDialog);
  dialogBack?.addEventListener('click',returnToPreviousDetail);
  dialog?.addEventListener('click',event=>{if(event.target===dialog)closeDialog()});
  dialog?.addEventListener('cancel',event=>{event.preventDefault();closeDialog()});

  function renderArtifact(labels){
    const art=doc.getElementById('galleryArt');clear(art);
    appendArtifactContents(art,labels);
  }
  function appendArtifactContents(node,labels){
    const top=element('div','window-top');for(let i=0;i<3;i++)top.appendChild(element('i'));
    const flow=element('div','flow');
    labels.forEach((label,index)=>{if(index)flow.appendChild(element('span','flow-line'));flow.appendChild(element('div',index===1?'flow-node flow-node--dark':'flow-node',label))});
    node.append(top,flow);
  }
  function projectArtifactLabels(key){
    if(key==='voucher')return lang==='zh'?['探索','可重用規則','兌換']:['Discovery','Reusable rules','Redemption'];
    if(key==='hours')return lang==='zh'?['工時','修改','結案']:['Effort','Revision','Closure'];
    if(key==='booking')return lang==='zh'?['市場限制','準備度模型','上線決策']:['Market constraint','Readiness model','Launch decision'];
    if(key==='bandzo')return lang==='zh'?['課程','練習回饋','進度']:['Lesson','Practice feedback','Progress'];
    return lang==='zh'?['申請人','共享狀態','營運']:['Applicant','Shared state','Operations'];
  }
  function experimentArtifactLabels(key,index){
    const map={
      memory:[['Choice','Pattern','Reflection'],['選擇','模式','回饋']],
      chat:[['Prompt','Turns','Close'],['提問','輪流','結束']],
      story:[['Emotion','Scene','Rhythm'],['情緒','場景','節奏']],
      'ai-assistant':[['Source','Uncertainty','Approval'],['來源','不確定性','核准']]
    };
    return map[key][lang==='zh'?1:0];
  }
  function renderGallery(){
    if(!currentDetail)return;
    const {type,key}=currentDetail;
    const data=type==='project'?DATA.projects[key]:DATA.experiments[key];
    const item=data.gallery[galleryIndex];
    if(type==='project'){
      safeText(doc.getElementById('galleryTitle'),localize([item[0],item[2]]));
      safeText(doc.getElementById('galleryText'),localize([item[1],item[3]]));
      renderArtifact(projectArtifactLabels(key));
    }else{
      safeText(doc.getElementById('galleryTitle'),localize(item[0]));
      safeText(doc.getElementById('galleryText'),localize(item[1]));
      renderArtifact(experimentArtifactLabels(key,galleryIndex));
    }
    safeText(doc.getElementById('galleryCount'),`${String(galleryIndex+1).padStart(2,'0')} / ${String(data.gallery.length).padStart(2,'0')}`);
    const thumbs=doc.getElementById('galleryThumbs');clear(thumbs);
    data.gallery.forEach((_,index)=>{
      const button=element('button','gallery-thumb');button.type='button';button.setAttribute('role','tab');button.setAttribute('aria-selected',String(index===galleryIndex));button.setAttribute('aria-label',`${lang==='zh'?'查看證據':'View evidence'} ${index+1}`);button.addEventListener('click',()=>{galleryIndex=index;renderGallery()});thumbs.appendChild(button)
    });
    if(!prefersReduced.matches){
      const art=doc.getElementById('galleryArt');
      const copy=doc.querySelector('.gallery-copy-v45');
      art?.animate([{opacity:.35,transform:'translateX(8px)'},{opacity:1,transform:'none'}],{duration:220,easing:'cubic-bezier(.16,1,.3,1)'});
      copy?.animate([{opacity:.55,transform:'translateY(5px)'},{opacity:1,transform:'none'}],{duration:220,easing:'cubic-bezier(.16,1,.3,1)'});
    }
  }
  doc.getElementById('galleryPrev')?.addEventListener('click',()=>{if(!currentDetail)return;const data=currentDetail.type==='project'?DATA.projects[currentDetail.key]:DATA.experiments[currentDetail.key];galleryIndex=(galleryIndex-1+data.gallery.length)%data.gallery.length;renderGallery()});
  doc.getElementById('galleryNext')?.addEventListener('click',()=>{if(!currentDetail)return;const data=currentDetail.type==='project'?DATA.projects[currentDetail.key]:DATA.experiments[currentDetail.key];galleryIndex=(galleryIndex+1)%data.gallery.length;renderGallery()});

  function renderInfoGrid(targetId,items){const grid=doc.getElementById(targetId);clear(grid);items.forEach(([label,value])=>{const cell=element('div');cell.append(element('small','',label),element('strong','',value));grid.appendChild(cell)})}
  function renderTags(tags){const node=doc.getElementById('detailTags');clear(node);tags.forEach(tag=>node.appendChild(element('span','modal-tag',tag)))}
  function cleanDecisionText(value){
    return String(value||'')
      .replace(/^(Alternative considered|Trade-off accepted|Trade-off)\s*[—–:\-]\s*/i,'')
      .replace(/^(曾考慮方案|接受的取捨|取捨)\s*[—–：:\-]\s*/,'')
      .trim();
  }
  const TEAM_IMPACT_LABELS={
    dbs:[['Alignment','團隊對齊'],['Delivery','交付'],['Operations','營運']],
    voucher:[['Strategy','策略'],['System','系統'],['Adoption','沿用']],
    booking:[['Product','產品'],['Localisation','在地化'],['Engineering','工程']],
    hours:[['Project visibility','專案可見性'],['Revision visibility','修改可見性'],['Future planning','未來規劃']],
    bandzo:[['Learning model','學習模型'],['Feedback','回饋'],['Cross-device','跨裝置']]
  };
  function renderTeamImpact(projectKey,project){
    const node=doc.getElementById('crossImpact');clear(node);
    const labels=TEAM_IMPACT_LABELS[projectKey]||[];
    project.recruiter.cross.forEach((pair,index)=>{
      const item=element('article','team-impact-item-v47');
      item.append(
        element('span','team-impact-role-v47',localize(labels[index]||[lang==='zh'?'影響':'Impact',lang==='zh'?'影響':'Impact'])),
        element('p','',localize(pair))
      );
      node.appendChild(item);
    });
  }

  function renderRecruiterProof(project){
    const node=doc.getElementById('recruiterProof');clear(node);
    const fields=[
      [lang==='zh'?'團隊組成':'Team composition',localize(project.recruiter.team)],
      [lang==='zh'?'交付狀態':'Delivery status',localize(project.recruiter.delivery)],
      [lang==='zh'?'結果證據':'Result evidence',localize(project.recruiter.metric)]
    ];
    fields.forEach(([label,value])=>{const cell=element('div','recruiter-proof-item-v46');cell.append(element('small','',label),element('strong','',value));node.appendChild(cell)})
  }
  function renderProject(key){
    const p=DATA.projects[key];
    const classification=doc.getElementById('detailClassification');
 if(classification)classification.hidden=false;
 safeText(doc.getElementById('detailTaxonomyLabel'),lang==='zh'?'問題類型':'Problem types');
    safeText(doc.getElementById('gallerySectionTitle'),lang==='zh'?'專案證據':'Project evidence');
    safeText(doc.getElementById('detailContext'),localize([p.context,p.context_zh]));
    safeText(doc.getElementById('detailPeriod'),localize([p.timeline,p.timeline_zh]));
    safeText(dialogTitle,localize([p.transformation,p.transformation_zh]));
    const detailStatus=doc.getElementById('detailStatus');
 const isConfidential=String(p.status||'').toLowerCase().includes('confidential');
 if(detailStatus){
   detailStatus.hidden=!isConfidential;
   safeText(detailStatus,isConfidential?(lang==='zh'?'保密案例':'Confidential'):'');
 }
    renderTags(lang==='zh'?p.problem_types_zh:p.problem_types);
    safeText(doc.getElementById('projectAtGlance'),localize([p.at_glance,p.at_glance_zh]));
    safeText(doc.getElementById('projectWhy'),localize([p.why,p.why_zh]));
    safeText(doc.getElementById('projectImpact'),localize([p.impact,p.impact_zh]));
    const audience=localize([p.audience,p.audience_zh]).replace(/\s+(Secondary:|Discovery stakeholders:|次要：|探索階段利害關係人：)/,'\n$1');
    renderInfoGrid('detailInfo',[
      [lang==='zh'?'我設計的範圍':'WHAT I DESIGNED',localize([p.scope,p.scope_zh])],
      [lang==='zh'?'主要使用者':'PRIMARY USERS',audience]
    ]);
    const role=localize([p.role,p.role_zh]);
    const contribution=localize([p.owned,p.owned_zh]);
    safeText(doc.getElementById('quickResponsibility'),contribution?`${role} — ${contribution}`:role);
    safeText(doc.getElementById('quickDecision'),localize([p.decision,p.decision_zh]));
    safeText(doc.getElementById('quickScale'),localize([p.scale,p.scale_zh]));
    const confidentiality=doc.getElementById('confidentialityNote');
    if(confidentiality)confidentiality.hidden=!String(p.status).toLowerCase().includes('confidential');
    renderRecruiterProof(p);
    appendList(doc.getElementById('projectHard'),lang==='zh'?p.hard_zh:p.hard);
    const decisions=doc.getElementById('projectDecisions');clear(decisions);
    p.decisions.forEach((decision,index)=>{
      const card=element('article','decision-card-v46');
      const number=element('span','decision-number-v48',`${lang==='zh'?'決策':'Decision'} ${index+1}`);
      const body=element('div','decision-body-v46');
      const result=element('div','decision-result-block-v58');
      result.append(
        element('span','decision-field-label-v58',lang==='zh'?'帶來的改變':'WHAT CHANGED'),
        element('p','decision-result-v46',localize([decision.result,decision.result_zh]))
      );
      body.append(element('h4','',localize([decision.title,decision.title_zh])),result);
      const considerations=element('dl','decision-considerations-v46');
      const alternative=element('div');
      alternative.append(
        element('dt','',lang==='zh'?'曾考慮的替代方案':'Alternative considered'),
        element('dd','',cleanDecisionText(localize([decision.alternative,decision.alternative_zh])))
      );
      const tradeoff=element('div');
      tradeoff.append(
        element('dt','',lang==='zh'?'最終方向承擔的代價':'Trade-off of chosen direction'),
        element('dd','',cleanDecisionText(localize([decision.tradeoff,decision.tradeoff_zh])))
      );
      considerations.append(alternative,tradeoff);
      const evidence=element('div','decision-evidence-v58');
      evidence.append(
        element('span','decision-field-label-v58',lang==='zh'?'選擇依據':'WHY THIS CHOICE'),
        element('p','',localize([decision.evidence||decision.why,decision.evidence_zh||decision.why_zh]))
      );
      const visual=element('figure','decision-visual-v58');
      const visualArt=element('div','decision-visual-v67__crop');
      const relatedLabels=projectArtifactLabels(key);
      appendArtifactContents(visualArt,relatedLabels);
      visual.append(
        element('span','decision-visual-v58__eyebrow',`${lang==='zh'?'對應畫面':'Related visual'} ${String(index+1).padStart(2,'0')}`),
        visualArt,
        element('figcaption','sr-only',lang==='zh'?'上方證據圖庫的局部擷取':'Cropped detail from the evidence gallery above')
      );
      body.append(considerations,evidence);
      card.append(number,body,visual);decisions.appendChild(card);
    });
    appendList(doc.getElementById('projectLed'),lang==='zh'?p.led_zh:p.led);
    appendList(doc.getElementById('projectContributed'),lang==='zh'?p.contributed_zh:p.contributed);
    renderTeamImpact(key,p);
    safeText(doc.getElementById('projectReflection'),localize(p.recruiter.reflection));
  }
  function renderExperiment(key){
    const e=DATA.experiments[key];
    const classification=doc.getElementById('detailClassification');
 if(classification)classification.hidden=true;
 const experimentStatus=doc.getElementById('detailStatus');
 if(experimentStatus){experimentStatus.hidden=true;safeText(experimentStatus,'');}
    safeText(doc.getElementById('gallerySectionTitle'),lang==='zh'?'原型證據':'Prototype evidence');
    safeText(doc.getElementById('detailContext'),localize(e.category));
    safeText(doc.getElementById('detailPeriod'),localize(e.timeline));
    safeText(dialogTitle,localize(e.title));
    const fullStatus=localize(e.status);const stage=String(fullStatus).split(' · ')[0];
    
    renderTags([]);
    safeText(doc.getElementById('experimentQuestion'),localize(e.question));safeText(doc.getElementById('experimentSummary'),localize(e.summary));
    renderInfoGrid('detailInfoExperiment',[[lang==='zh'?'目前階段':'CURRENT STAGE',stage]]);
    safeText(doc.getElementById('experimentPrototype'),localize(e.prototype));safeText(doc.getElementById('experimentLearning'),localize(e.learning));safeText(doc.getElementById('experimentNext'),localize(e.next));
  }
  const RELATED_PROJECTS={voucher:['dbs','booking','hours'],dbs:['voucher','booking','hours'],booking:['dbs','voucher','bandzo'],hours:['bandzo','voucher','dbs'],bandzo:['hours','booking','voucher']};
  const RELATED_EXPERIMENTS={memory:['chat','story','ai-assistant'],chat:['memory','story','ai-assistant'],story:['memory','chat','ai-assistant'],'ai-assistant':['memory','chat','story']};
  function detailBrand(type,key){
    if(type==='experiment')return lang==='zh'?'實驗':'Experiment';
    const map={voucher:'Incentive ecosystem',dbs:'DBS',booking:'Booking.com',hours:lang==='zh'?'個人產品':'Independent',bandzo:'Bandzo'};
    return map[key]||'Project';
  }
  function detailVisualLabels(type,key){
    if(type==='experiment'){
      const map={memory:['Choice','Pattern','Reflection'],chat:['Prompt','Turns','Close'],story:['Emotion','Scene','Rhythm'],'ai-assistant':['Source','Control','Approval']};
      return map[key]||['Question','Model','Learning'];
    }
    return projectArtifactLabels(key);
  }
  function detailRelatedVisual(type,key){
    const visual=element('div','detail-related-card-v45__visual');
    visual.setAttribute('aria-hidden','true');
    const brand=element('span','detail-related-card-v45__brand',detailBrand(type,key));
    const flow=element('div','detail-related-card-v45__flow');
    detailVisualLabels(type,key).forEach((label,index)=>{
      if(index)flow.append(element('i',''));
      flow.append(element('b',index===1?'is-core':'',label));
    });
    visual.append(brand,flow);return visual;
  }
  function relatedCard(type,key){
    const item=type==='project'?DATA.projects[key]:DATA.experiments[key];
    const card=element('button','detail-related-card-v45');card.type='button';card.dataset[type]=key;
    const context=type==='project'?localize([item.context,item.context_zh]):localize(item.category);
    const title=type==='project'?localize([item.transformation,item.transformation_zh]):localize(item.title);
    card.append(
      detailRelatedVisual(type,key),
      element('span','detail-related-card-v45__context',context),
      element('h4','',title),
      element('span','detail-related-action-v46',lang==='zh'?(type==='project'?'查看案例 ↗':'查看實驗 ↗'):(type==='project'?'View case ↗':'View experiment ↗'))
    );
    return card;
  }
  function renderRelated(){
    if(!currentDetail)return;const type=currentDetail.type;const keys=(type==='project'?RELATED_PROJECTS[currentDetail.key]:RELATED_EXPERIMENTS[currentDetail.key])||[];
    const rail=doc.getElementById('detailRelatedRail');clear(rail);keys.forEach(key=>rail.appendChild(relatedCard(type,key)));
    safeText(doc.getElementById('detailRelatedTitle'),lang==='zh'?'相關作品':'Related work');
    safeText(doc.getElementById('detailRelatedCopy'),'');
    window.refreshHorizontalRails?.();
  }
  function renderDetail(){
    if(!currentDetail)return;const isProject=currentDetail.type==='project';projectView.hidden=!isProject;experimentView.hidden=isProject;doc.getElementById('projectEvidence').hidden=!isProject;doc.getElementById('experimentEvidence').hidden=isProject;
    dialog?.classList.toggle('is-experiment',!isProject);dialog?.classList.toggle('is-project',isProject);if(isProject)renderProject(currentDetail.key);else renderExperiment(currentDetail.key);renderGallery();renderRelated();
    if(dialogScrollRoot){dialogScrollRoot.scrollLeft=0;}
  }
  function openDetail(type,key,invoker){
    const source=type==='project'?DATA.projects[key]:DATA.experiments[key];if(!dialog||!source)return;
    if(dialog.open&&currentDetail){
      detailStack.push({detail:{...currentDetail},invoker:currentInvoker,galleryIndex,scrollTop:dialogScrollRoot?.scrollTop||0});
    }else{
      detailStack.length=0;
      rootInvoker=invoker;
    }
    currentInvoker=invoker;currentDetail={type,key};galleryIndex=0;
    const dialogScroll=dialog.querySelector('.dialog-scroll');
    if(dialogScroll){dialogScroll.scrollTop=0;dialogScroll.scrollLeft=0;}
    renderDetail();
    updateCloseControl();
    if(!dialog.open){setDialogOpenState(true);dialog.classList.add('is-opening');dialog.showModal()}
    requestAnimationFrame(()=>{dialog.classList.remove('is-opening');
      if(dialogScroll){dialogScroll.scrollTo({top:0,left:0,behavior:'auto'});}
      dialogTitle.focus({preventScroll:true});
      doc.dispatchEvent(new CustomEvent('portfolio:detail-ready'));
    });
    safeText(dialogStatus,lang==='zh'?'詳情已開啟':'Details opened');
  }
  doc.addEventListener('click',event=>{const project=event.target.closest('[data-project]');if(project){event.preventDefault();openDetail('project',project.dataset.project,project);return}const experiment=event.target.closest('[data-experiment]');if(experiment){event.preventDefault();openDetail('experiment',experiment.dataset.experiment,experiment)}});
  const deepLinkedCase=new URLSearchParams(window.location.search).get('case');
  if(deepLinkedCase&&DATA.projects[deepLinkedCase]){
    window.requestAnimationFrame(()=>openDetail('project',deepLinkedCase,doc.querySelector(`[data-project="${deepLinkedCase}"]`)));
  }
  doc.addEventListener('keydown',event=>{if(!dialog?.open)return;if(event.key==='ArrowLeft'){event.preventDefault();doc.getElementById('galleryPrev').click()}if(event.key==='ArrowRight'){event.preventDefault();doc.getElementById('galleryNext').click()}});
  doc.querySelectorAll('img').forEach(image=>{
    if(!image.hasAttribute('width'))image.width=640;
    if(!image.hasAttribute('height'))image.height=420;
    image.loading=image.dataset.critical==='true'?'eager':'lazy';
    image.decoding='async';
    image.fetchPriority=image.dataset.critical==='true'?'high':'low';
  });
})();
