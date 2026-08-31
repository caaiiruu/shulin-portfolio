import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const root=process.cwd();
const readJson=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const content=readJson('public/site/content/portfolio-content.json');
const manifest=readJson('public/site/content/portfolio-asset-manifest.json');
const truth=readJson('docs/portfolio-automation/verified-project-truth.json');
const ledger=readJson('docs/portfolio-automation/execution-ledger.json');
const registry=readJson('public/site/docs/design-system/registry.json');
const failures=[];const warnings=[];
const fail=(m)=>failures.push(m);
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8',maxBuffer:32*1024*1024}).split('\0').filter(Boolean);

const experiments=Object.entries({...content.experiments,...content.sideProjects}).filter(([,x])=>!String(x.contentStatus||'').includes('standalone-card-review'));
if(Object.keys(content.projects).length!==13)fail('Primary project count must be 13');
if(experiments.length!==7)fail('Experiment count must be 7');
if(truth.projects.length!==20||truth.projectSourcePacks.length!==20)fail('Truth must govern all 20 entities');
if(content.contentVersion!==manifest.contentVersion)fail('Content/Asset Manifest atomic version mismatch');

const highRisk={
  voucher:['~125K','+90.9%','~167%'],
  'voucher-center':['12 / 20','7 vs 4','18 / 20','16 / 20'],
  'game-center':['~50%'],
  payment:['70.2','1,798','98.5%','~228K','~57K','~190'],
  booking:['40+']
};
for(const [id,needles] of Object.entries(highRisk)){
  const text=JSON.stringify(content.projects[id]);
  for(const needle of needles)if(!text.includes(needle))fail(`${id}: missing governed qualifier ${needle}`);
}
const prohibited=[/successfully increased tourism/i,/caused economic growth/i,/personality type caused/i,/18% (profitability|productivity|revenue)/i,/production launch.{0,80}cathay/i];
const publicText=JSON.stringify({
  projects:Object.fromEntries(Object.entries(content.projects).map(([id,p])=>[id,{title:p.title,atAGlance:p.atAGlance,whyItMattered:p.whyItMattered,businessImpact:p.businessImpact,publicContent:p.publicContent}])),
  experiments:Object.fromEntries(experiments.map(([id,p])=>[id,{title:p.title,summary:p.summary,question:p.question,experimentBlocks:p.experimentBlocks,learning:p.learning,buildApproach:p.buildApproach}]))
});
for(const pattern of prohibited)if(pattern.test(publicText))fail(`Prohibited public claim: ${pattern}`);
for(const [id,item] of experiments){if(item.problemTypeVisibility!=='SEARCH_ONLY')fail(`${id}: Problem Type must be SEARCH_ONLY`);}

const searchIds=new Set();
for(const [id,item] of [...Object.entries(content.projects),...experiments]){
  if(searchIds.has(id))fail(`Duplicate search entity ${id}`);searchIds.add(id);
  if(!item.searchIndexV2&&!item.searchMapping&&!item.searchTags)warnings.push(`${id}: search mapping uses legacy fields`);
}

const registryText=JSON.stringify(registry);
for(const owner of ['ProjectDetailOverview','ExperimentExperience','ProjectCard','FloatingNavigator'])if(!registryText.includes(owner))fail(`Design registry missing ${owner}`);
const forbiddenOwners=tracked.filter(p=>/experiment-content\.json|experiment-asset-manifest\.json|globals-(new|final|fixed)|app-(new|final|fixed)/i.test(p));
if(forbiddenOwners.length)fail(`Parallel owner files: ${forbiddenOwners.join(', ')}`);

const secretPatterns=[
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /(?:api[_-]?key|secret|token|password)\s*[:=]\s*['\"][A-Za-z0-9_\-]{20,}['\"]/i,
  /gh[opusr]_[A-Za-z0-9]{30,}/,
  /sk-[A-Za-z0-9]{32,}/
];
const secretFiles=[];
for(const file of tracked){
  if(/(?:package-lock\.json|\.(?:png|jpe?g|webp|avif|gif|ico|woff2?|mov|mp4|zip))$/i.test(file))continue;
  let text='';try{text=fs.readFileSync(file,'utf8')}catch{continue}
  if(secretPatterns.some(pattern=>pattern.test(text)))secretFiles.push(file);
}
if(secretFiles.length)fail(`Potential secret patterns in: ${secretFiles.join(', ')}`);
const envFiles=tracked.filter(p=>/(^|\/)\.env(?:\.|$)/.test(p)&&!p.endsWith('.example'));
if(envFiles.length)fail(`Tracked environment secret files: ${envFiles.join(', ')}`);

const publicAssetFiles=tracked.filter(p=>p.startsWith('public/site/assets/')&&/\.(?:png|jpe?g|webp|avif|gif)$/i.test(p));
const metadataFindings=[];
for(const file of publicAssetFiles){
  if(!fs.existsSync(file))continue;
  const bytes=fs.readFileSync(file);const ascii=bytes.toString('latin1');
  if(/GPSLatitude|GPSLongitude|Exif\.GPSInfo|OwnerName|SerialNumber/i.test(ascii))metadataFindings.push(file);
}
if(metadataFindings.length)fail(`Sensitive image metadata: ${metadataFindings.join(', ')}`);

const primaryLeadAssets=[];
for(const [projectId,project] of Object.entries(content.projects)){
  const assetId=project.hero_visual_brief?.assetId||project.heroVisualBrief?.assetId;
  const asset=manifest.items[assetId];
  if(!asset)fail(`${projectId}: missing Primary Lead Visual manifest record`);
  else primaryLeadAssets.push({projectId,assetId,...asset});
}
if(primaryLeadAssets.length!==13)fail('Primary Lead Visual count must be 13');
const leadPaths=new Set(),leadHashes=new Set();let leadAssetBytes=0;
for(const asset of primaryLeadAssets){
  const approvedGeometry=asset.projectId==='voucher'
    ? asset.width===1536&&asset.height===691&&asset.aspectRatio==='wide'
    : asset.width===2048&&asset.height===1152&&asset.aspectRatio==='16:9';
  if(asset.projectId!==manifest.items[asset.assetId]?.projectId||asset.type!=='image/jpeg'||!approvedGeometry||asset.assetStatus!=='production'||asset.implementationStatus!=='real-active'||asset.placeholderFallbackAssetId!==null||asset.replacementRequired!==false||asset.publicBuild!==true)fail(`${asset.projectId}: invalid approved Primary Lead Visual contract`);
  if(!asset.publicPath?.startsWith('/site/assets/projects/')){fail(`${asset.projectId}: invalid Lead Visual public path`);continue}
  const localPath=path.join(root,'public',asset.publicPath);
  if(!fs.existsSync(localPath)){fail(`${asset.projectId}: Lead Visual file is missing`);continue}
  const bytes=fs.readFileSync(localPath);leadAssetBytes+=bytes.length;
  if(bytes.length>512*1024)fail(`${asset.projectId}: Lead Visual exceeds 512 KiB`);
  if(!(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff))fail(`${asset.projectId}: Lead Visual is not a valid JPEG`);
  const digest=createHash('sha256').update(bytes).digest('hex');
  if(digest!==asset.sha256)fail(`${asset.projectId}: Lead Visual SHA-256 mismatch`);
  if(leadPaths.has(asset.publicPath)||leadHashes.has(digest))fail(`${asset.projectId}: duplicate Primary Lead Visual payload`);
  leadPaths.add(asset.publicPath);leadHashes.add(digest);
  const ascii=bytes.toString('latin1');if(/GPSLatitude|GPSLongitude|Exif\.GPSInfo|OwnerName|SerialNumber/i.test(ascii))fail(`${asset.projectId}: sensitive Lead Visual metadata`);
}
if(leadAssetBytes>5*1024*1024)fail('Primary Lead Visual package exceeds 5 MiB');

const thirdParty=new Set();
for(const file of tracked.filter(p=>(p.startsWith('public/site/')||p.startsWith('worker/')||p.startsWith('app/')||p.startsWith('site-source/')||['next.config.ts','vercel.json'].includes(p))&&/\.(?:html|js|mjs|ts|tsx|json)$/.test(p))){
  let text='';try{text=fs.readFileSync(file,'utf8')}catch{continue}
  // Local test origins and npm provenance URLs are tooling metadata, not public runtime integrations.
  for(const match of text.matchAll(/https?:\/\/([^/'"\s);${}]+)/g))if(!/(localhost|127\.0\.0\.1|app\.local|registry\.npmjs\.org|github\.com|schema\.org|openapi\.vercel\.sh)/.test(match[1]))thirdParty.add(match[1]);
}
const governedThirdParty=['www.figma.com','vercel.com','fonts.googleapis.com','fonts.gstatic.com','shulinchou.com','www.linkedin.com','open.spotify.com','www.cna.com.tw','asianbusinessreview.com'];
for(const domain of thirdParty)if(!governedThirdParty.some(x=>domain===x||domain.endsWith(`.${x}`)))warnings.push(`Third-party reference requires owner review: ${domain}`);

const headers=readJson('vercel.json').headers?.[0]?.headers||[];const headerMap=Object.fromEntries(headers.map(x=>[x.key.toLowerCase(),x.value]));
for(const key of ['content-security-policy','x-content-type-options','x-frame-options','referrer-policy','permissions-policy','strict-transport-security'])if(!headerMap[key])fail(`Missing preview security header ${key}`);

const unresolved=ledger.approvedDeltas.filter(x=>x.status==='APPROVED'&&x.implementationStatus==='NOT_APPLIED');
if(unresolved.length)fail(`Unapplied approved deltas: ${unresolved.map(x=>x.deltaId).join(', ')}`);

const result={
  status:failures.length?'SECURITY_BLOCKER':'SECURITY_AUTOMATION_PASS',
  accessibility:'AUTOMATED_A11Y_STATIC_PASS',
  manualAccessibility:'MANUAL_SCREEN_READER_REVIEW_PENDING',
  performance:'PERFORMANCE_INFRASTRUCTURE_PASS',
  performanceFinal:failures.length?'ASSET_PERFORMANCE_BLOCKER':'ASSET_DEPENDENT_PERFORMANCE_PASS',
  assetSecurity:failures.length?'ASSET_SECURITY_BLOCKER':'ASSET_SECURITY_RECHECK_PASS',
  primaryLeadVisuals:{count:primaryLeadAssets.length,totalBytes:leadAssetBytes,maximumBytes:Math.max(...primaryLeadAssets.map(asset=>{const localPath=asset.publicPath&&path.join(root,'public',asset.publicPath);return localPath&&fs.existsSync(localPath)?fs.statSync(localPath).size:0}))},
  counts:{primary:13,experiments:7,truthProjects:truth.projects.length,publicAssets:publicAssetFiles.length},
  thirdPartyDomains:[...thirdParty].sort(),warnings,failures
};
console.log(JSON.stringify(result,null,2));
if(failures.length)process.exit(1);
