import fs from "node:fs";
import path from "node:path";

const root=path.resolve("public/site");
const content=JSON.parse(fs.readFileSync(path.join(root,"content/portfolio-content.json"),"utf8"));
const manifest=JSON.parse(fs.readFileSync(path.join(root,"content/portfolio-asset-manifest.json"),"utf8"));
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
  const canonical=`https://shulinchou.com/site/work/${id}`;
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
    .replace(/<title>[\s\S]*?<\/title>/i,metadata)
    .replace(/<meta\s+content="[^"]*"\s+name="description"\s*\/>/i,"");
}
function routeSummary(project,id){
  return `<section class="page-shell direct-project-summary" data-project-route-summary="${escapeHtml(id)}"><p>${escapeHtml(project.company)}</p><h1>${escapeHtml(project.title.en)}</h1><p>${escapeHtml(project.atAGlance.en)}</p><p><strong>Critical problem:</strong> ${escapeHtml(project.criticalProblem.en)}</p></section>`;
}
for(const [id,project] of Object.entries(content.projects||{})){
  if(!project.title?.en||!project.atAGlance?.en||!project.criticalProblem?.en)throw new Error(`Incomplete direct-route content: ${id}`);
  let html=replaceHead(work,project,id);
  html=html.replace('<main id="main">',`<main id="main">\n${routeSummary(project,id)}`);
  fs.writeFileSync(path.join(outDir,`${id}.html`),html);
}
console.log(`Generated ${Object.keys(content.projects||{}).length} canonical project documents.`);
