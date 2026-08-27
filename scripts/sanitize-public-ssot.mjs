import fs from "node:fs";

const contentPath="public/site/content/portfolio-content.json";
const content=JSON.parse(fs.readFileSync(contentPath,"utf8"));

// Public presentation keeps stable semantic/source IDs, but not private source
// locations, access-bearing URLs, filenames, Library handles, or working audits.
const removedTopLevel=[
  "contentUpdateLog",
  "portfolioPrincipalReadinessAudit",
  "sourceArchives",
  "siteContentAudit",
  "contentIntegrationReviewQueue",
  "currentContentResolutionQueue",
  "recoveryMetadata",
  "r144Correction",
  "r145Correction",
  "r146Correction",
];
for(const key of removedTopLevel)delete content[key];

if(content.assetRegistry)delete content.assetRegistry.sourceAssets;
if(content.implementationContracts){
  delete content.implementationContracts.projectDetailContentAudit;
  delete content.implementationContracts.projectCase?.deepEvidenceDisclosure?.internalOnly;
}
delete content.localizationRegistry?.releaseGate?.auditScope;

const privatePrototype=content.interactiveFlowRegistry?.["voucher-center-discovery-ut-2024"];
if(privatePrototype?.prototypeUrl){
  const source=new URL(privatePrototype.prototypeUrl);
  privatePrototype.prototypeReference={
    provider:"figma",
    fileName:"Nov 2024 Voucher Center with new voucher cards",
    nodeId:source.searchParams.get("node-id")?.replace("-",":")||"162:35182",
    frameName:"Voucher Center discovery usability-test prototype",
  };
  delete privatePrototype.prototypeUrl;
}

const forbiddenKeys=new Set([
  "auditVersion",
  "principalReadinessAudit",
  "rawInternalDecksVisible",
  "sourceFile",
  "sourceFiles",
  "sourceFilename",
  "sourceFilenames",
  "sourceFileId",
  "sourceFileLibraryId",
  "sourcePackage",
  "sourcePackageId",
  "sourceProjectName",
  "sourceSection",
  "canonicalSource",
  "canonicalSources",
  "duplicateUploadVerified",
  "needsConfirmation",
  "sourceStatus",
]);
function sanitize(value){
  if(Array.isArray(value)){value.forEach(sanitize);return}
  if(!value||typeof value!=="object")return;
  for(const key of Object.keys(value)){
    if(key==="imagePlan"){
      const publicAssetSlots=Array.isArray(value[key])
        ?value[key].filter(item=>item?.assetId).map(({order,assetId,role,loading})=>({order,assetId,role,loading}))
        :[];
      if(publicAssetSlots.length)value[key]=publicAssetSlots;
      else delete value[key];
      continue;
    }
    if(forbiddenKeys.has(key)||/^private(?:Source|Target|Values?)/.test(key)||/^keepInternal/.test(key)){
      delete value[key];
      continue;
    }
    if(["file","filename","source"].includes(key)&&typeof value[key]==="string"&&/\.(?:pdf|pptx?|key|pages|xlsx?|docx?)$/i.test(value[key])){
      delete value[key];
      continue;
    }
    sanitize(value[key]);
  }
}
sanitize(content);

fs.writeFileSync(contentPath,`${JSON.stringify(content,null,2)}\n`);
console.log(`Sanitized ${contentPath}`);
