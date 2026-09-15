from pathlib import Path
import subprocess

STYLE_B='2d280c446703eb42002d6dfc7d9af41dcbf298db'

def git_show(path):
    return subprocess.check_output(['git','show',f'{STYLE_B}:{path}'],text=True)

# Copy approved Domain owners.
Path('public/site/assets/css/components/domain-experience.css').write_text(git_show('public/site/assets/css/components/domain-experience.css'))
s=git_show('public/site/assets/js/domain-experience.js')
s=s.replace("  const DATA = window.PORTFOLIO_RUNTIME_DATA || window.PORTFOLIO_DATA || {};", "  const DATA = window.PORTFOLIO_RUNTIME_DATA || window.PORTFOLIO_DATA || {};\n  const PUBLIC_PROJECTS = DATA.publicProjects || DATA.projects || {};")
old="""  const projectIdsForDomain = (domain) => {\n    if (!domain) return [];\n    return [...new Set([...asList(domain.featuredProjectIds), ...asList(domain.supportingProjectIds)])]\n      .filter((key) => DATA.projects?.[key]);\n  };"""
new="""  const projectIdsForDomain = (domain) => {\n    if (!domain) return [];\n    const ids = [...asList(domain.featuredProjectIds), ...asList(domain.supportingProjectIds)];\n    const normalizedDomain = normalize(domain.id);\n    const operationsAliases = DOMAIN_ALIASES.operations.map(normalize);\n    if (operationsAliases.includes(normalizedDomain) && PUBLIC_PROJECTS['daily-hours']) ids.push('daily-hours');\n    return [...new Set(ids)].filter((key) => PUBLIC_PROJECTS[key]);\n  };"""
if old not in s: raise SystemExit('projectIdsForDomain contract missing')
s=s.replace(old,new)
s=s.replace("    const project = DATA.projects?.[key] || {};", "    const project = PUBLIC_PROJECTS[key] || {};")
s=s.replace("    const asset = assetId ? window.resolveProjectAsset?.(assetId, key) : null;", "    const csv2Asset = project?.presentationContract && project.presentationContract !== 'legacy' ? window.CASE_STUDY_ASSETS?.[key]?.assets?.[assetId] : null;\n    const asset = csv2Asset ? {src:csv2Asset.publicPath,alt:csv2Asset.alt,width:csv2Asset.width,height:csv2Asset.height} : (assetId ? window.resolveProjectAsset?.(assetId, key) : null);")
s=s.replace("    type.textContent = readType(project);", "    type.textContent = readType(project) || (project.presentationContract && project.presentationContract !== 'legacy' ? firstText(project.company) : '');")
s=s.replace("    company.textContent = firstText(project?.company);", "    company.textContent = project.presentationContract && project.presentationContract !== 'legacy' ? 'Independent' : firstText(project?.company);")
s=s.replace("    cta.href = `/work/${key}`;", "    cta.href = project.publicRoute || `/work/${key}`;")
s=s.replace("  const navigateCard = (card) => { const key = card?.dataset.project; if (key) window.location.href = `/work/${key}`; };", "  const navigateCard = (card) => { const key = card?.dataset.project; const project = key ? PUBLIC_PROJECTS[key] : null; if (key) window.location.href = project?.publicRoute || `/work/${key}`; };")
Path('public/site/assets/js/domain-experience.js').write_text(s)

Path('public/site/assets/css/components/work-index.css').write_text('''/* Style B Work composition only. ProjectCard internals remain owned by project-card.css. */
.work-library-v32.style-b-work{padding-top:var(--space-8)}
.work-library-v32.style-b-work .work-library-v32__head{margin-bottom:var(--space-7)}
.work-gallery-v32.style-b-work-index{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:var(--space-6);align-items:stretch}
.work-gallery-v32.style-b-work-index>.work-card-v32{grid-column:span 3;min-width:0;height:100%}
.work-gallery-v32.style-b-work-index>.work-card-v32[data-style-b-tier="featured"]{grid-column:span 4}
.work-gallery-v32.style-b-work-index>.work-card-v32[data-style-b-tier="supporting"]{grid-column:span 2}
.work-gallery-v32.style-b-work-index>.work-card-v32[data-style-b-tier="standard"]{grid-column:span 3}
.work-archive-v33.style-b-more{display:grid!important;margin-top:var(--space-8)}
.work-archive-v33.style-b-more .work-archive-v33__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-6);align-items:stretch}
.work-archive-v33.style-b-more .work-card-v32{height:100%}
@media(max-width:1100px){.work-gallery-v32.style-b-work-index{grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-5)}.work-gallery-v32.style-b-work-index>.work-card-v32,.work-gallery-v32.style-b-work-index>.work-card-v32[data-style-b-tier]{grid-column:span 1}}
@media(max-width:640px){.work-gallery-v32.style-b-work-index,.work-archive-v33.style-b-more .work-archive-v33__grid{grid-template-columns:1fr;gap:var(--space-5)}}
''')

Path('public/site/assets/js/work.js').write_text(r'''(() => {
  'use strict';
  const loadStyle=(href,owner)=>{if(document.querySelector(`link[data-style-b-owner="${owner}"]`))return;const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.styleBOwner=owner;document.head.append(link)};
  const loadDomain=()=>{if(!document.getElementById('domains')||document.querySelector('script[data-style-b-owner="domain-experience"]'))return false;const script=document.createElement('script');script.src='/site/assets/js/domain-experience.js';script.defer=true;script.dataset.styleBOwner='domain-experience';document.body.append(script);return true};
  const ensureCsv2Header=()=>{const header=document.querySelector('.site-header');if(!header||header.dataset.sharedHeaderBound==='true')return;const menu=document.getElementById('mobileMenu'),toggle=document.querySelector('.menu-toggle'),body=document.body,media=matchMedia('(max-width: 900px)');header.dataset.sharedHeaderBound='true';header.dataset.themeSurface='site-chrome';document.querySelector('.site-footer')?.setAttribute('data-theme-surface','site-chrome');const label=open=>toggle?.setAttribute('aria-label',open?'Close menu':'Open menu');const setMenu=(open,{restoreFocus=false,moveFocus=false}={})=>{if(!menu||!toggle)return;menu.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));body.classList.toggle('is-locked',open);label(open);if(open&&moveFocus)requestAnimationFrame(()=>menu.querySelector('a,button')?.focus());if(!open&&restoreFocus)toggle.focus()};label(false);toggle?.addEventListener('click',()=>setMenu(!menu?.classList.contains('is-open'),{moveFocus:!menu?.classList.contains('is-open')}));menu?.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});document.addEventListener('click',e=>{if(menu?.classList.contains('is-open')&&!e.target.closest('.site-header'))setMenu(false)});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.classList.contains('is-open'))setMenu(false,{restoreFocus:true})});media.addEventListener('change',e=>{if(!e.matches)setMenu(false)})};
  if(document.body.classList.contains('csv2-active'))ensureCsv2Header();
  if(loadDomain())return;
  const rail=document.getElementById('workFilterRail');if(rail){const reset=()=>rail.scrollLeft=0;requestAnimationFrame(reset);window.addEventListener('pageshow',reset)}
  const library=document.querySelector('.work-library-v32'),gallery=document.getElementById('workGallery'),archive=document.getElementById('workArchive'),archiveGrid=document.getElementById('workArchiveGrid');if(!library||!gallery||!archive||!archiveGrid)return;
  loadStyle('/site/assets/css/components/work-index.css','work-index');library.classList.add('style-b-work');gallery.classList.add('style-b-work-index');archive.classList.add('style-b-more');
  const idForCard=card=>card.querySelector('[data-project]')?.dataset.project||(card.querySelector('[data-public-work-route]')?.getAttribute('href')||'').split('/').filter(Boolean).at(-1)||'';
  const cards=[...gallery.querySelectorAll(':scope > .work-card-v32'),...archiveGrid.querySelectorAll(':scope > .work-card-v32')],byId=new Map(cards.map(card=>[idForCard(card),card]).filter(([id])=>id));
  const selected=['voucher','payment','dbs','booking'],more=['game-center','daily-hours'];cards.forEach(card=>{card.hidden=true;card.removeAttribute('data-style-b-tier')});
  const apply=(card,tier,variant)=>{if(!card)return;card.hidden=false;card.dataset.styleBTier=tier;card.classList.remove('work-card-v32--featured','work-card-v32--supporting','work-card-v32--standard','work-card-v32--compact');card.classList.add(`work-card-v32--${variant}`)};
  selected.forEach((id,index)=>{const card=byId.get(id);if(!card)return;gallery.append(card);apply(card,index===0?'featured':index===1?'supporting':'standard',index===0?'featured':index===1?'supporting':'standard')});
  more.forEach(id=>{const card=byId.get(id);if(!card)return;archiveGrid.append(card);apply(card,'compact','compact')});archive.hidden=false;const archiveTitle=document.getElementById('workArchiveTitle');if(archiveTitle)archiveTitle.textContent='More Work';
  const taxonomy=[['all','All'],['transactions','Transactions'],['operations','Operations'],['incentives','Incentives'],['zero','0→1'],['connected','Connected journeys']],categories={voucher:['incentives'],payment:['transactions','zero'],dbs:['operations'],booking:['connected'],'game-center':['incentives','zero'],'daily-hours':['operations','zero']};
  const buttons=[...document.querySelectorAll('[data-work-filter]')];buttons.forEach((button,index)=>{const next=taxonomy[index];if(!next){button.hidden=true;return}button.hidden=false;button.dataset.workFilter=next[0];button.textContent=next[1];button.removeAttribute('data-copy-key')});for(const [id,card] of byId)card.dataset.workCategories=(categories[id]||[]).join(' ');
  const managed=new Set([...selected,...more]);buttons.forEach(button=>button.addEventListener('click',()=>{const filter=button.dataset.workFilter;buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));for(const id of managed){const card=byId.get(id);if(!card)continue;card.hidden=!(filter==='all'||(categories[id]||[]).includes(filter))}}));
})();
''')

pc=Path('public/site/assets/css/components/project-card.css')
pcs=pc.read_text();marker='/* Style B shared ProjectCard variants — reusable, project-agnostic. */'
if marker not in pcs:
    pcs += '''\n\n/* Style B shared ProjectCard variants — reusable, project-agnostic. */\n.work-card-v32--featured .work-card-v32__button{grid-template-columns:minmax(0,.84fr) minmax(0,1.16fr)}\n.work-card-v32--supporting .work-card-v32__button{grid-template-columns:1fr;grid-template-rows:auto auto}\n.work-card-v32--standard .work-card-v32__button{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}\n.work-card-v32--supporting .work-artifact{min-height:0;height:auto;aspect-ratio:16/9}\n.work-card-v32--supporting .work-card-v32__content{border-top:var(--dimension-1px) solid var(--color-border)}\n.work-card-v32--standard .work-card-v32__content{min-height:var(--dimension-280px)}\n.work-card-v32--supporting .work-card-v32__content,.work-card-v32--standard .work-card-v32__content,.work-card-v32--compact .work-card-v32__content{--project-card-company-title-gap:var(--space-6)}\n.work-card-v32--supporting .work-card-v32__content>p,.work-card-v32--standard .work-card-v32__content>p{margin-top:var(--space-5)}\n@media(max-width:1100px){.work-card-v32--featured .work-card-v32__button,.work-card-v32--supporting .work-card-v32__button,.work-card-v32--standard .work-card-v32__button{grid-template-columns:1fr;grid-template-rows:auto auto}}\n'''
pc.write_text(pcs)

# The temporary EN-only locale owner and CSV2 files remain untouched by this script.
