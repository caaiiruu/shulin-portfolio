import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const content=JSON.parse(read('public/site/content/portfolio-content.json'));
const registry=JSON.parse(read('public/site/content/project-presentation-registry.json'));
const projectCardCss=read('public/site/assets/css/components/project-card.css');
const profileCss=read('public/site/assets/css/components/profile-card.css');
const detailCss=read('public/site/assets/css/components/project-detail-overview.css');
const app=read('public/site/assets/js/app.js');
const work=read('public/site/assets/js/work.js');
const domainExperience=read('public/site/assets/js/domain-experience.js');
const workCss=read('public/site/assets/css/components/work-index.css');
const profileTemplate=read('site-source/templates/profile.html');
const assetManifest=JSON.parse(read('public/site/content/portfolio-asset-manifest.json'));
const projectCardMedia=read('public/site/assets/js/project-card-media.js');
const popupCss=read('public/site/assets/css/components/popup-shell.css');
const foundationCss=read('public/site/assets/css/components/foundation.css');
const experimentCss=read('public/site/assets/css/components/experiment-card.css');
const domainCss=read('public/site/assets/css/components/domain-experience.css');
const supportingCss=read('public/site/assets/css/components/supporting-page-layout.css');
const workTemplate=read('site-source/templates/work.html');
const experimentsTemplate=read('site-source/templates/experiments.html');
const rgb=value=>{const channels=value.match(/\d+(?:\.\d+)?/g)?.slice(0,3).map(Number);assert.equal(channels?.length,3,`unsupported color: ${value}`);return channels};
const luminance=value=>{const channels=rgb(value).map(channel=>channel/255).map(channel=>channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4);return .2126*channels[0]+.7152*channels[1]+.0722*channels[2]};
const contrast=(foreground,background)=>{const a=luminance(foreground),b=luminance(background);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};

test('ProjectCard actions keep semantic content color, neutral dividers, no underline, and bottom ownership',()=>{
  assert.match(projectCardCss,/Final shared ProjectCard action contract/);
  assert.match(projectCardCss,/background-image:none!important/);
  assert.match(projectCardCss,/\.work-card-v32__action::after\{content:none!important/);
  assert.match(projectCardCss,/color:var\(--project-card-cta-foreground,var\(--cta-foreground-on-light\)\)!important/);
  assert.match(projectCardCss,/\.work-card-v32__action::before\{background:color-mix\(in srgb,var\(--color-text-primary\) 16%,transparent\)!important/);
  assert.match(projectCardCss,/experiment-index-card-v36\[data-experiment-card-system="shared-v1"\][\s\S]*transform:none!important/);
  assert.match(projectCardCss,/\.icon-arrow\{transform:translateX\(var\(--project-card-system-hover-shift\)\) rotate\(var\(--arrow-rotation,var\(--arrow-rotate-right\)\)\)!important/);
  assert.match(projectCardCss,/\.work-card-v32\[data-project-card-system="shared-v1"\] \.work-card-v32__content[\s\S]*height:100%/);
  assert.match(projectCardCss,/\.work-card-v32__action,[\s\S]*align-self:end/);
});

test('one and two Work matches use the shared featured hierarchy and Bandzo stays outside zero-to-one',()=>{
  assert.match(work,/matches\.length===1\|\|matches\.length===2&&index===0\?'featured'/);
  assert.match(work,/dataset\.filterResultRole=matches\.length===1\?'featured':matches\.length===2\?\(index===0\?'featured':'secondary'\):'grid'/);
  assert.match(workCss,/data-result-count="1"\]\>\[data-filter-result-role="featured"\][\s\S]*grid-template-columns:minmax\(0,\.62fr\) minmax\(0,1fr\)/);
  assert.match(workCss,/data-result-count="2"\]\{grid-template-columns:minmax\(0,1\.6fr\) minmax/);
  const zero=content.workIndex.workFilters.find(item=>item.id==='zero');
  assert.ok(zero);
  assert.equal(zero.projectIds.includes('bandzo'),false);
});

test('Daily Hours uses its narrative listing title and one shared popup/direct presentation',()=>{
  assert.match(work,/id === 'daily-hours' \? 'Track work\. Decide what’s worth it\.'/);
  const route=registry.routes['/work/daily-hours'];
  assert.equal(route.workProjection.cardTitle,'Track work. Decide what’s worth it.');
  assert.equal(route.presentationContract,'case-study-v2');
  assert.match(domainExperience,/projection\?\.cardTitle, projection\?\.title/);
  assert.doesNotMatch(domainExperience,/usesStandalonePage\(card\.dataset\.project\)/);
  assert.match(app,/renderCaseStudyPopup\(currentDetail\.key\)/);
  assert.match(app,/DATA\.projects\[key\]\|\|DATA\.caseStudyProjects\?\.\[key\]/);
});

test('Profile reuses approved Hero cloud vectors and presents the portrait organically',()=>{
  for(const id of ['Vector_1735','Vector_1734','Vector_1733'])assert.match(profileTemplate,new RegExp(`hero-transformation-system\\.svg#${id}`));
  assert.match(profileCss,/profile-cloud-drift-one/);
  assert.match(profileCss,/profile-cloud-drift-two/);
  assert.match(profileCss,/profile-cloud-drift-three/);
  assert.match(profileCss,/clip-path:polygon/);
  assert.doesNotMatch(profileCss,/\.profile-hero-v36__portrait\{[^}]*border-radius/);
  assert.match(profileCss,/@media\(prefers-reduced-motion:reduce\)\{\.profile-hero-v36__cloud\{animation:none/);
  assert.match(profileCss,/\.profile-hero-v36\{overflow:visible/);
  assert.match(profileCss,/\.profile-hero-v36__summary\{[^}]*var\(--dimension-2-2rem\)/);
  assert.match(profileCss,/\.profile-summary-highlight\.is-visible\{ text-decoration-color:var\(--portfolio-coral-500\)\}/);
  const copy=content.localizationRegistry.staticPageCopy;
  assert.equal(copy['profile.principal-product-designer-final-polish'].en,'SENIOR PRODUCT DESIGNER');
  assert.equal(copy['profile.cv-summary-final-polish'].en,'9+ years shaping complex products and services across fintech, banking, retail, and global travel. I connect customer needs, business rules, operations, and real-world constraints from product direction through shipped outcomes.');
  assert.doesNotMatch(copy['profile.cv-summary-final-polish'].en,/digital products/i);
  assert.match(app,/const phrases=lang==='en'\?\['fintech, banking, retail, and global travel'\]:\[\]/);
});

test('testimonial SSOT renders excerpt plus Name and Company through a progressive carousel',()=>{
  const reviews=content.profile.testimonials.items.filter(item=>item.visible!==false);
  assert.equal(reviews.length,7);
  assert.equal(reviews[0].name.en,'Sip Khoon');
  assert.equal(reviews[0].company.en,'FairPrice Group');
  assert.equal(reviews.at(-1).name.en,'Michelle Tan J.Y.');
  assert.equal(reviews.at(-1).quote.en,'Shulin is an outstanding Product Designer and an invaluable collaborator. Working with her at FairPrice Group was a highlight of my time there.\n\nKey areas I will always remember from our time together:\n\n• Mentorship & Generosity: She actively takes time to break down complex design concepts and uplift her teammates.\n\n• Collaborative Brainstorming: She brings vocal, well-articulated opinions to the table while staying incredibly open to alternative concepts.\n\n• Adaptability & Content Literacy: She truly values content design and can pivot design flows rapidly when content restructuring changes the user journey.\n\nShulin is a sharp thinker, compelling presenter, and a dream team player. I cannot recommend her highly enough!');
  assert.equal(reviews.at(-1).displayQuote.en,'Shulin is an outstanding Product Designer and an invaluable collaborator. Working with her at FairPrice Group was a highlight of my time there.\n\nShulin is a sharp thinker, compelling presenter, and a dream team player. I cannot recommend her highly enough!');
  assert.equal(content.profile.testimonials.contentStatus,'human-approved-package-2026-09-17');
  assert.match(app,/localize\(item\.displayQuote\|\|item\.quote\)/);
  assert.match(app,/\[localize\(item\.name\|\|item\.author\),localize\(item\.company\)\]\.filter\(Boolean\)\.join\(' · '\)/);
  assert.match(app,/let activeIndex=0,testimonialTimer=0/);
  assert.match(app,/testimonialAutoplayEnabled=.*!testimonialHovered&&!testimonialFocusWithin&&!testimonialDragging&&!doc\.hidden&&!prefersReduced\.matches/);
  assert.match(app,/window\.__portfolioTestimonialQa=testimonialQaState/);
  assert.match(app,/moveTestimonial\(activeIndex\+1,\{source:'autoplay'\}\)/);
  assert.match(app,/translate3d\(/);
  assert.match(app,/profile-testimonials-v1__track/);
  assert.doesNotMatch(profileTemplate,/profileTestimonialsCount/);
  assert.match(app,/rotationIntervalMs\)\|\|7500/);
  assert.doesNotMatch(app,/testimonialPauseReasons|pauseTestimonialManually|setInterval/);
  assert.match(app,/event\.key==='ArrowLeft'\|\|event\.key==='ArrowRight'/);
  assert.match(app,/testimonialViewport\?\.addEventListener\('pointerdown',event=>/);
  assert.match(profileCss,/grid-auto-columns:calc\(var\(--dimension-640px\) - var\(--space-5\)\)/);
  assert.match(profileCss,/transition:transform calc\(var\(--motion-base\) \* 2\) cubic-bezier\(\.22,1,\.36,1\)/);
  assert.match(profileCss,/\.profile-testimonials-v1__viewport\{[^}]*overflow:hidden/);
  assert.match(profileCss,/\.profile-testimonial-v1\{[^}]*min-height:var\(--dimension-260px\)/);
  assert.match(profileCss,/\.profile-testimonial-v1__attribution\{[^}]*text-align:center/);
  assert.doesNotMatch(app,/profile-testimonial-v1[^\n]*avatar/);
});

test('Daily Hours media rules are removed in the shared root and Travel uses approved supporting copy',()=>{
  assert.match(popupCss,/\[data-case-study-v2-root="daily-hours"\] \.csv2-evidence\{[^}]*border-top:0/);
  assert.match(popupCss,/\[data-case-study-v2-root="daily-hours"\] \.csv2-accordion-item,[\s\S]*border-top:0;border-bottom:0/);
  assert.match(popupCss,/\[data-case-study-v2-root="daily-hours"\] \.csv2-demo\{border-top:0\}/);
  assert.match(profileTemplate,/profile\.travel-supporting-copy-final/);
  assert.equal(content.localizationRegistry.staticPageCopy['profile.travel-supporting-copy-final'].en,'To be continued. More cultures, landscapes, animals, and whatever comes next.');
});

test('compact ProjectCards omit metric dividers and CTA foreground follows semantic surface context',()=>{
  assert.match(projectCardCss,/data-project-card-variant="secondary"[^\n]*data-project-card-variant="supporting"[^\n]*data-project-card-variant="compact"[^\n]*\.project-card__metrics\{border-top:0\}/);
  assert.match(foundationCss,/--text-cta-foreground,var\(--cta-foreground-on-light\)/);
  assert.match(projectCardCss,/--project-card-cta-foreground:var\(--project-theme-on-surface,var\(--cta-foreground-on-light\)\)/);
  assert.match(experimentCss,/experiment-index-card-v36--see-all\{--project-card-cta-foreground:var\(--cta-foreground-on-dark\)/);
  assert.match(foundationCss,/\.text-cta:hover::after,\.text-cta:focus-visible::after\{\s*background:var\(--text-cta-underline\)/);
});

test('shared popup shell becomes visible before detail rendering and exposes timing events',()=>{
  const start=app.indexOf('function openDetail(');
  const end=app.indexOf("doc.addEventListener('portfolio:project-theme-ready'",start);
  const source=app.slice(start,end);
  assert.ok(source.indexOf('dialog.showModal()')<source.indexOf('renderDetail()'));
  assert.match(source,/setPopupLoading\(true\)/);
  assert.match(source,/portfolio:detail-shell-visible/);
  assert.match(source,/portfolio:detail-ready/);
  assert.match(app,/pointerover[^\n]*prewarmFromTrigger/);
  assert.match(app,/focusin[^\n]*prewarmFromTrigger/);
  assert.match(app,/rootMargin:'320px'/);
  assert.match(popupCss,/\.popup-loading-v1\{/);
  assert.match(popupCss,/\.popup-loading-v1__spinner\{/);
});

test('Experiment cards, final See all entry, and supporting heroes use the final shared contracts',()=>{
  assert.match(projectCardCss,/data-experiment-card-system="shared-v1"\] \.work-card-v32__content\{min-height:var\(--dimension-220px\)/);
  assert.match(projectCardCss,/data-experiment-card-system="shared-v1"\] \.project-card__metrics\{display:none\}/);
  assert.match(app,/const visibleLabel=lang==='zh'\?'查看全部':'See all'/);
  assert.match(app,/card\.dataset\.projectChrome='dark'/);
  assert.match(app,/card\.dataset\.experimentCardId=id/);
  assert.match(app,/doc\.addEventListener\('click',event=>\{\s*const experiment=event\.target\.closest\?\.\('\[data-experiment\]'\)/);
  assert.doesNotMatch(experimentsTemplate,/moreExperimentsTitle|experiments\.more-experiments|experiment-index-v36__head/);
  assert.match(app,/sharedDetailTitle\.dataset\.detailTitleSystem='shared-v1'/);
  assert.match(app,/sharedDetailTitle\.dataset\.detailKind=currentDetail\.type==='experiment'\?'experiment':'work'/);
  assert.match(app,/action\.setAttribute\('aria-hidden','true'\)/);
  assert.match(experimentCss,/experiment-index-card-v36__see-all-content\{display:flex;align-items:center;justify-content:center/);
  assert.match(experimentCss,/see-all:is\(:hover,:focus-visible\)[^}]*icon-arrow\{transform:translateX/);
  assert.match(workTemplate,/work-page-hero-v32--work/);
  assert.doesNotMatch(workTemplate,/page-hero-mark-v45/);
  assert.match(supportingCss,/\.work-page-hero-v32--work::before\{content:none\}/);
  assert.match(supportingCss,/\.work-page-hero-v32 \.page-hero-copy>\.kicker\{[^}]*text-transform:uppercase/);
  assert.match(experimentsTemplate,/class="kicker" data-copy-key="index\.experiment/);
});

test('shared disclosure icon motion has a reduced-motion override',()=>{
  assert.match(domainCss,/domain-experience-disclosure__summary::after\{[^}]*transition:/);
  assert.match(domainCss,/@media\(prefers-reduced-motion:reduce\)[^{]*\{[^}]*domain-experience-disclosure__summary::after\{transition:none\}/);
});

test('one canonical semantic Project Theme registry resolves every public project and shared popup chrome',()=>{
  const themes=assetManifest.projectCardLeadVisuals.projectThemes;
  const keys=['brand','surface','surfaceSubtle','onSurface','accent','onAccent','chrome','onChrome','border'];
  for(const id of Object.keys(content.projects)){
    assert.ok(themes[id],`missing project theme: ${id}`);
    for(const key of keys)assert.ok(themes[id][key],`${id}.${key}`);
    assert.match(themes[id].chrome,/^(light|dark)$/);
    assert.ok(contrast(themes[id].onSurface,themes[id].surface)>=4.5,`${id} surface/onSurface contrast`);
    assert.ok(contrast(themes[id].onSurface,themes[id].surfaceSubtle)>=4.5,`${id} surfaceSubtle/onSurface contrast`);
    assert.ok(contrast(themes[id].onAccent,themes[id].accent)>=4.5,`${id} accent/onAccent contrast`);
  }
  assert.equal(assetManifest.projectCardLeadVisuals.brandTints,undefined);
  assert.match(projectCardMedia,/const themeForProject/);
  assert.match(projectCardMedia,/applyTheme\(card,id\)/);
  assert.match(projectCardMedia,/applyTheme\(card,'shulin-studio'\)/);
  assert.match(app,/PROJECT_CARD_SYSTEM\?\.applyTheme\?\.\(dialog/);
  assert.match(popupCss,/data-project-chrome="dark"/);
  assert.doesNotMatch(popupCss,/is-case-study-v2 \.modal-close\{[^}]*var\(--csv2/);
});

test('shared tooltip has real click ownership, ARIA state, keyboard close, and safe portal outside-click logic',()=>{
  assert.match(detailCss,/\.info-tooltip__trigger\{position:relative/);
  assert.match(detailCss,/\.info-tooltip__trigger::before\{position:absolute;inset:calc\(\(var\(--control-height\) - var\(--dimension-16px\)\) \/ -2\)/);
  assert.match(app,/trigger\.setAttribute\('aria-controls',id\)/);
  assert.match(app,/trigger\.setAttribute\('aria-describedby',id\)/);
  assert.match(app,/if\(event\.key==='Escape'\)/);
  assert.match(app,/!root\.contains\(event\.target\)&&!panel\.contains\(event\.target\)/);
});

test('legacy shared media renderers omit redundant image captions while semantic quote attribution remains',()=>{
  assert.doesNotMatch(app,/visual\.append\(element\('figcaption','evidence-frame__caption'/);
  assert.doesNotMatch(app,/figure\.append\(element\('figcaption','evidence-frame__caption',translate\(caption\)\)\)/);
  assert.doesNotMatch(app,/list\(source\.captions\)\[assetIndex\][\s\S]{0,100}evidence-frame__caption/);
  assert.match(app,/structured-evidence-quote'[\s\S]*figcaption/);
});
