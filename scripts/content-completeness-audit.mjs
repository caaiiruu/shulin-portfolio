import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const ssotPath=path.join(root,'public/site/content/portfolio-content.json');
const appPath=path.join(root,'public/site/assets/js/app.js');
const data=JSON.parse(fs.readFileSync(ssotPath,'utf8'));
const app=fs.readFileSync(appPath,'utf8');
const contract=data.implementationContracts?.contentPresentationContract;
if(!contract)throw new Error('Missing implementationContracts.contentPresentationContract');
const allowed=new Set(contract.allowedPublicRoles||[]);
const failures=[];
const report={contentVersion:data.contentVersion,projects:{}};
const list=value=>Array.isArray(value)?value:value==null?[]:[value];
const hasPath=(object,pathText)=>pathText.split('.').reduce((value,key)=>value==null?undefined:value[key],object)!==undefined;
const approved=value=>typeof value==='string'&&new RegExp(contract.approvedStatusPattern||'^approved').test(value);
const statusBlocks=(project,id)=>{
  const rows=[];
  const walk=(value,parts)=>{
    if(!value||typeof value!=='object')return;
    if(!Array.isArray(value)&&approved(value.contentStatus))rows.push(parts.join('.'));
    for(const [key,child] of Object.entries(value))if(key!=='contentStatus')walk(child,[...parts,key]);
  };
  walk(project,[]);
  for(const key of Object.keys(project.publicContent||{})){
    const relative='publicContent.'+key;
    if(!rows.some(item=>item===relative||item.startsWith(relative+'.')))rows.push(relative);
  }
  return [...new Set(rows)].sort();
};
const starts=(pathText,prefix)=>pathText===prefix||pathText.startsWith(prefix+'.');

for(const [id,project] of Object.entries(data.projects||{})){
  const projectContract=contract.projects?.[id]||{sections:{}};
  const renderContracts=[];
  for(const sectionId of project.sectionOrder||[]){
    const specific=projectContract.sections?.[sectionId];
    const sources=[...list(specific?.sourcePaths),...list(contract.sharedSectionSources?.[sectionId])];
    for(const sourcePath of new Set(sources))renderContracts.push({
      sourcePath,publicRole:'RENDER',sectionId,
      presentationType:specific?.presentationType||'shared-section',
      renderRequired:specific?.renderRequired!==false
    });
  }
  const supporting=list(projectContract.supporting).map(item=>({...item,publicRole:'SUPPORTING',renderRequired:false}));
  const explicit=[...renderContracts,...supporting].sort((a,b)=>b.sourcePath.length-a.sourcePath.length);
  const blocks=statusBlocks(project,id);
  const resolved=blocks.map(blockPath=>{
    const match=explicit.find(item=>starts(blockPath,item.sourcePath));
    if(match)return {blockPath,...match,contentStatus:(blockPath.split('.').reduce((v,k)=>v?.[k],project)||{}).contentStatus||'public-recruiter-content'};
    return {blockPath,contentStatus:(blockPath.split('.').reduce((v,k)=>v?.[k],project)||{}).contentStatus||'public-recruiter-content',...contract.defaultApprovedContract};
  });
  const renderRequired=resolved.filter(item=>item.publicRole==='RENDER'&&item.renderRequired);
  const supportingBlocks=resolved.filter(item=>item.publicRole==='SUPPORTING');
  const demoted=resolved.filter(item=>item.publicRole==='DEMOTED');
  const privateBlocks=resolved.filter(item=>item.publicRole==='PRIVATE');
  const orphaned=resolved.filter(item=>!allowed.has(item.publicRole));
  const unexpectedMissing=renderRequired.filter(item=>!project.sectionOrder?.includes(item.sectionId)||!hasPath(project,item.sourcePath)||!app.includes(`'${item.sectionId}'`));
  const invalidSupporting=supportingBlocks.filter(item=>!item.parentSectionId||!project.sectionOrder?.includes(item.parentSectionId)||!hasPath(project,item.sourcePath));
  const invalidDemoted=demoted.filter(item=>!item.reasonIfDemoted);
  const duplicates=renderRequired.filter((item,index,all)=>all.findIndex(other=>other.blockPath===item.blockPath&&other.sectionId===item.sectionId)!==index);
  report.projects[id]={
    approvedPublicBlocks:resolved.length,
    renderRequiredBlocks:renderRequired.map(item=>item.blockPath),
    supportingBlocks:supportingBlocks.map(item=>item.blockPath),
    demotedBlocks:demoted.map(item=>item.blockPath),
    privateBlocks:privateBlocks.map(item=>item.blockPath),
    renderedBlocks:renderRequired.map(item=>({blockPath:item.blockPath,sectionId:item.sectionId})),
    unexpectedMissingBlocks:unexpectedMissing.map(item=>item.blockPath),
    orphanedBlocks:orphaned.map(item=>item.blockPath),
    duplicateBlocks:duplicates.map(item=>item.blockPath),
    invalidSupportingBlocks:invalidSupporting.map(item=>item.blockPath)
  };
  if(unexpectedMissing.length||orphaned.length||duplicates.length||invalidSupporting.length||invalidDemoted.length){
    failures.push(`${id}: ${JSON.stringify(report.projects[id])}`);
  }
}
const output=path.join(root,'public/site/docs/content-completeness-audit.json');
if(process.argv.includes('--write')){
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify(report,null,2));
if(failures.length)throw new Error('Content completeness contract failed\n'+failures.join('\n'));
console.error('PASS: all approved/public recruiter blocks resolve to RENDER, SUPPORTING, DEMOTED, or PRIVATE with zero missing/orphaned blocks');
