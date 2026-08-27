import fs from "node:fs";

const contentPath="public/site/content/portfolio-content.json";
const content=JSON.parse(fs.readFileSync(contentPath,"utf8"));
const failures=[];
const allowedPublicHosts=new Set(["asianbusinessreview.com","www.cna.com.tw"]);
const forbiddenTopLevel=[
  "contentUpdateLog","portfolioPrincipalReadinessAudit","sourceArchives","siteContentAudit",
  "contentIntegrationReviewQueue","currentContentResolutionQueue","recoveryMetadata",
  "r144Correction","r145Correction","r146Correction",
];
const forbiddenKeys=new Set([
  "auditVersion","principalReadinessAudit","prototypeUrl","rawInternalDecksVisible",
  "sourceFile","sourceFiles","sourceFilename","sourceFilenames","sourceFileId",
  "sourceFileLibraryId","sourcePackage","sourcePackageId","sourceProjectName","sourceSection",
  "canonicalSource","canonicalSources","duplicateUploadVerified",
]);

for(const key of forbiddenTopLevel)if(key in content)failures.push(`non-public top-level owner remains: ${key}`);
if(content.assetRegistry?.sourceAssets)failures.push("assetRegistry.sourceAssets remains in public SSOT");
if(content.implementationContracts?.projectDetailContentAudit)failures.push("projectDetailContentAudit remains in public SSOT");

function inspect(value,path=[]){
  if(Array.isArray(value)){value.forEach((entry,index)=>inspect(entry,[...path,index]));return}
  if(value&&typeof value==="object"){
    for(const [key,entry] of Object.entries(value)){
      const next=[...path,key];
      if(forbiddenKeys.has(key)||/^private(?:Source|Target|Values?)/.test(key)||/^keepInternal/.test(key))failures.push(`private provenance field: ${next.join(".")}`);
      inspect(entry,next);
    }
    return;
  }
  if(typeof value!=="string")return;
  const location=path.join(".");
  if(/(?:file:\/\/|\/Users\/|\/workspace\/|\/mnt\/data\/|[A-Za-z]:\\)/i.test(value))failures.push(`local filesystem path: ${location}`);
  if(/\b(?:file|libfile)_[0-9a-f]{16,}\b/i.test(value))failures.push(`private Library identifier: ${location}`);
  if(/\.(?:pdf|pptx?|key|pages|xlsx?|docx?)$/i.test(value))failures.push(`internal source filename: ${location}`);
  if(/\b[0-9a-f]{64}\b/i.test(value))failures.push(`working-file digest: ${location}`);
  for(const match of value.matchAll(/https?:\/\/[^\s"')]+/gi)){
    let host="";try{host=new URL(match[0]).hostname}catch{failures.push(`invalid URL: ${location}`);continue}
    if(host.endsWith("figma.com"))failures.push(`private Figma URL: ${location}`);
    else if(!allowedPublicHosts.has(host))failures.push(`non-allowlisted public URL (${host}): ${location}`);
  }
}
inspect(content);

if(failures.length){
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Public SSOT boundary passed: no private Figma URL, source location, Library handle, local path, or working audit metadata.");
