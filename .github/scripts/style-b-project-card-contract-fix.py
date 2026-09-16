from pathlib import Path

work_path = Path('public/site/assets/js/work.js')
work = work_path.read_text()

old_project_id = """  const projectIdFromCard = card => {
    const control = card.querySelector('.work-card-v32__button');
    if (control?.dataset.project) return control.dataset.project;
    const route = control?.dataset.publicWorkRoute || control?.getAttribute('href');
    if (route) return REGISTRY.routes?.[route]?.projectId || '';
    return '';
  };
"""
new_project_id = """  const projectIdFromCard = card => {
    if (card?.dataset?.workIndexProject) return card.dataset.workIndexProject;
    const control = card.querySelector('.work-card-v32__button');
    if (control?.dataset.project) return control.dataset.project;
    const route = control?.dataset.publicWorkRoute || control?.getAttribute('href');
    if (route) return REGISTRY.routes?.[route]?.projectId || String(route).split('?')[0].split('#')[0].split('/').filter(Boolean).pop() || '';
    return '';
  };
  const canonicalRouteForProject = id => registryEntryForProject(id)?.route || projectionForProject(id)?.route || `/work/${encodeURIComponent(id)}`;
  const normalizeCardNavigation = (id, control) => {
    const href = canonicalRouteForProject(id);
    let link = control;
    if (control.tagName !== 'A') {
      link = document.createElement('a');
      [...control.attributes].forEach(({ name, value }) => {
        if (name !== 'type' && name !== 'data-project') link.setAttribute(name, value);
      });
      link.innerHTML = control.innerHTML;
      control.replaceWith(link);
    } else {
      link.removeAttribute('data-project');
    }
    link.setAttribute('href', href);
    link.dataset.publicWorkRoute = href;
    link.setAttribute('aria-label', link.getAttribute('aria-label') || `View ${id} case study`);
    return link;
  };
"""
if old_project_id not in work:
    raise SystemExit('projectIdFromCard block not found')
work = work.replace(old_project_id, new_project_id, 1)

old_decorate = """  const decorateCard = (card, variant) => {
    const id=projectIdFromCard(card);const project=publicProjects[id]||{};const projection=projectionForProject(id);const control=card.querySelector('.work-card-v32__button');const content=card.querySelector('.work-card-v32__content');if(!id||!control||!content)return null;
    card.dataset.projectCardSystem='shared-v1';card.dataset.projectCardVariant=variant;card.dataset.workIndexProject=id;card.dataset.workCategories=normalizeCategories(id,project,card,projection).join(' ');
"""
new_decorate = """  const decorateCard = (card, variant) => {
    const id=projectIdFromCard(card);const project=publicProjects[id]||{};const projection=projectionForProject(id);let control=card.querySelector('.work-card-v32__button');const content=card.querySelector('.work-card-v32__content');if(!id||!control||!content)return null;
    control=normalizeCardNavigation(id,control);
    card.dataset.projectCardSystem='shared-v1';card.dataset.projectCardVariant=variant;card.dataset.workIndexProject=id;card.dataset.workCategories=normalizeCategories(id,project,card,projection).join(' ');
"""
if old_decorate not in work:
    raise SystemExit('decorateCard block not found')
work = work.replace(old_decorate, new_decorate, 1)
work_path.write_text(work)

qa_path = Path('.github/workflows/style-b-project-card-final-qa.yml')
qa = qa_path.read_text()
qa = qa.replace("id==='dbs'||id==='taishin-p2p-marketplace'", "id==='dbs'||id==='taishin-p2p-marketplace-platform'")
qa = qa.replace("id==='booking'||id==='booking-taxi-strategy'", "id==='booking'||id==='booking-taxi-pickup-service-strategy'")

old_work_visual = """                assert(styles.fit==='cover'&&styles.opacity==='1',`Work ${width} ${id}: not full bleed`);
                const tint=await card.evaluate(el=>getComputedStyle(el).getPropertyValue('--project-card-tint').trim());
"""
new_work_visual = """                assert(styles.fit==='cover'&&styles.opacity==='1',`Work ${width} ${id}: not full bleed`);
                const geometry=await img.evaluate(el=>{const r=el.getBoundingClientRect();const f=el.parentElement.getBoundingClientRect();return {dx:Math.abs(r.x-f.x),dy:Math.abs(r.y-f.y),dw:Math.abs(r.width-f.width),dh:Math.abs(r.height-f.height)}});
                assert(Math.max(geometry.dx,geometry.dy,geometry.dw,geometry.dh)<=1,`Work ${width} ${id}: Lead Visual not geometrically full bleed ${JSON.stringify(geometry)}`);
                const tint=await card.evaluate(el=>getComputedStyle(el).getPropertyValue('--project-card-tint').trim());
"""
if old_work_visual not in qa:
    raise SystemExit('work visual assertion block not found')
qa = qa.replace(old_work_visual, new_work_visual, 1)

old_domain_visual = """                assert(await img.evaluate(el=>getComputedStyle(el).objectFit)==='cover',`Domain ${width} ${id}: image not cover`);
                assert(await active.locator('.domain-project-card-v2__title').evaluate(el=>getComputedStyle(el).textDecorationLine)==='none',`Domain ${width} ${id}: title underline`);
"""
new_domain_visual = """                assert(await img.evaluate(el=>getComputedStyle(el).objectFit)==='cover',`Domain ${width} ${id}: image not cover`);
                const geometry=await img.evaluate(el=>{const r=el.getBoundingClientRect();const f=el.parentElement.getBoundingClientRect();return {dx:Math.abs(r.x-f.x),dy:Math.abs(r.y-f.y),dw:Math.abs(r.width-f.width),dh:Math.abs(r.height-f.height)}});
                assert(Math.max(geometry.dx,geometry.dy,geometry.dw,geometry.dh)<=1,`Domain ${width} ${id}: Lead Visual not geometrically full bleed ${JSON.stringify(geometry)}`);
                assert(await active.locator('.domain-project-card-v2__title').evaluate(el=>getComputedStyle(el).textDecorationLine)==='none',`Domain ${width} ${id}: title underline`);
"""
if old_domain_visual not in qa:
    raise SystemExit('domain visual assertion block not found')
qa = qa.replace(old_domain_visual, new_domain_visual, 1)
qa_path.write_text(qa)
