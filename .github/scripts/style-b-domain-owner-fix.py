from pathlib import Path

path = Path('public/site/assets/js/home.js')
source = path.read_text()
old = """ const related=document.getElementById('relatedProjects');
 const cards=[
  ...(data.featuredProjectIds||[]).map(key=>createProjectCard(key,'domain')),
  ...(data.supportingProjectIds||[]).map(key=>createProjectCard(key,'domain')),
  ...(data.supportingExplorationIds||[]).map(createExplorationCard)
 ];
 related?.replaceChildren(...cards);
 window.refreshHorizontalRails?.();
 const projectPanel=related?.closest('.domain-panel-v30--projects');
 if(projectPanel){
  projectPanel.hidden=cards.length===0;
  const heading=projectPanel.querySelector('h4');
  if(heading)safeText(heading,ui(\"related-work-9e3ba8e3\"));
 }
"""
new = """ // ProjectCard internals are owned by the shared ProjectCard runtime.
 // Home only owns Domain copy/state; domain-experience.js owns carousel composition.
 const related=document.getElementById('relatedProjects');
 const projectPanel=related?.closest('.domain-panel-v30--projects');
 if(projectPanel){
  projectPanel.hidden=false;
  const heading=projectPanel.querySelector('h4');
  if(heading)safeText(heading,ui(\"related-work-9e3ba8e3\"));
 }
"""
if old not in source:
    raise SystemExit('legacy Domain ProjectCard renderer block not found')
source = source.replace(old, new, 1)
path.write_text(source)
