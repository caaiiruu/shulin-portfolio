import fs from "node:fs";
import path from "node:path";

const root=path.resolve("public/site");
const content=JSON.parse(fs.readFileSync(path.join(root,"content/portfolio-content.json"),"utf8"));
const manifest=JSON.parse(fs.readFileSync(path.join(root,"content/portfolio-asset-manifest.json"),"utf8"));
const presentationRegistry=JSON.parse(fs.readFileSync(path.join(root,"content/project-presentation-registry.json"),"utf8"));
const work=fs.readFileSync(path.join(root,"work.html"),"utf8");
const outDir=path.join(root,"work");
fs.mkdirSync(outDir,{recursive:true});
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const metaEscape=value=>escapeHtml(value).replace(/\n/g," ");
function resolveImage(project){
  const id=project.heroVisualBrief?.assetId;
  const record=manifest.items?.[id];
  const direct=record?.publicPath;
  const fallback=manifest.items?.[record?.placeholderFallbackAssetId]?.publicPath;
  return direct?.startsWith("/site/")?direct:fallback?.startsWith("/site/")?fallback:"";
}
function replaceHead(html,project,id){
  const title=`${project.title.en} — Shulin Chou`;
  const description=project.atAGlance.en;
  const canonical=`https://shulinchou.com/work/${id}`;
  const image=resolveImage(project);
  const metadata=[
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${metaEscape(description)}"/>`,
    `<link rel="canonical" href="${canonical}"/>`,
    `<meta property="og:type" content="article"/>`,
    `<meta property="og:title" content="${metaEscape(title)}"/>`,
    `<meta property="og:description" content="${metaEscape(description)}"/>`,
    `<meta property="og:url" content="${canonical}"/>`,
    image?`<meta property="og:image" content="https://shulinchou.com${image}"/>`:""
  ].filter(Boolean).join("\n");
  return html
    .replace(/<link\s+rel="canonical"\s+href="[^"]+"\s*\/?>/i,"")
    .replace(/<meta\s+property="og:url"\s+content="[^"]+"\s*\/?>/i,"")
    .replace(/<title>[\s\S]*?<\/title>/i,metadata)
    .replace(/<meta\s+content="[^"]*"\s+name="description"\s*\/>/i,"");
}
function routeSummary(project,id){
  const recruiterFirst=project.presentation?.composition==="recruiter-first-system-case";
  const legacySummary=recruiterFirst?"":`<p><strong>Critical problem:</strong> ${escapeHtml(project.criticalProblem.en)}</p>`;
  return `<section class="page-shell direct-project-summary" data-project-route-summary="${escapeHtml(id)}"><p>${escapeHtml(project.company)}</p><h1>${escapeHtml(project.title.en)}</h1><p>${escapeHtml(project.atAGlance.en)}</p>${legacySummary}</section>`;
}
for(const [id,project] of Object.entries(content.projects||{})){
  if(!project.title?.en||!project.atAGlance?.en||!project.criticalProblem?.en)throw new Error(`Incomplete direct-route content: ${id}`);
  let html=replaceHead(work,project,id);
  html=html.replace('<main id="main">',`<main id="main">\n${routeSummary(project,id)}`);
  fs.writeFileSync(path.join(outDir,`${id}.html`),html);
}
const header=work.match(/<header\b[\s\S]*?<\/header>/i)?.[0];
const footer=work.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0];
const stylesheet=work.match(/<link\b[^>]*rel="stylesheet"[^>]*>/i)?.[0];
const runtime=work.match(/<script\b[^>]*src="\/site\/assets\/js\/production\.[a-f0-9]+\.js"[^>]*><\/script>/i)?.[0];
const icons=[...work.matchAll(/<link\b[^>]*rel="(?:icon|apple-touch-icon)"[^>]*>/gi)].map(match=>match[0]).join("\n");
if(!header||!footer||!stylesheet||!runtime)throw new Error("Shared chrome or production assets missing from generated Work page");
const v2Routes=Object.entries(presentationRegistry.routes||{}).filter(([,entry])=>entry.presentationContract==="case-study-v2");
for(const [route,entry] of v2Routes){
  if(!/^\/work\/[a-z0-9-]+$/.test(route)||entry.projectId!==route.split("/").at(-1))throw new Error(`Invalid Case Study v2 route registration: ${route}`);
  const caseRoot=path.join(root,"content/case-studies",entry.projectId);
  const caseContent=JSON.parse(fs.readFileSync(path.join(caseRoot,"content.json"),"utf8"));
  if(caseContent.identity!=="DH-CONTENT-1.0"||caseContent.presentationContract!=="case-study-v2")throw new Error(`Invalid Case Study v2 content contract: ${entry.projectId}`);
  const title=caseContent.seo.title;
  const description=caseContent.seo.description;
  const canonical=caseContent.seo.canonical;
  const html=`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="referrer" content="no-referrer"/>
<title>${escapeHtml(title)}</title>
<meta name="description" content="${metaEscape(description)}"/>
<link rel="canonical" href="${escapeHtml(canonical)}"/>
<meta property="og:type" content="article"/>
<meta property="og:title" content="${metaEscape(title)}"/>
<meta property="og:description" content="${metaEscape(description)}"/>
<meta property="og:url" content="${escapeHtml(canonical)}"/>
${icons}
${stylesheet}
</head><body data-presentation-contract="case-study-v2">
<a class="skip-link" data-pressable="" href="#main"><span>Skip to content</span></a>
${header}
<main id="main" data-case-study-v2-root="${escapeHtml(entry.projectId)}"><noscript><p>JavaScript is required to view this case study.</p></noscript></main>
${footer}
${runtime}
</body></html>`;
  fs.writeFileSync(path.join(outDir,`${entry.projectId}.html`),html);
}
console.log(`Generated ${Object.keys(content.projects||{}).length} canonical project documents and ${v2Routes.length} Case Study v2 document.`);
