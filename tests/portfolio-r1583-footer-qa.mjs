import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl=process.env.BASE_URL||"http://127.0.0.1:3000";
const outputRoot=process.env.EVIDENCE_DIR||"/tmp/portfolio-engineering-qa";
const evidenceDir=path.join(outputRoot,"r1583-footer");
fs.mkdirSync(evidenceDir,{recursive:true});
const stages=["discover","qualify","activate","redeem","review"];
const failures=[], report={baselineAudit:null,desktop:{},mobile:{},errors:[]};
const browser=await chromium.launch({headless:true});
const twoFrames=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const styles=(node,props)=>{const cs=getComputedStyle(node);return Object.fromEntries(props.map(p=>[p,cs.getPropertyValue(p)]))};
const rect=node=>{const r=node.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height}};
const props=["overflow","overflow-y","height","max-height","min-height","padding-top","padding-bottom","margin-top","margin-bottom","position","transform","display","box-sizing","flex","flex-basis"];

async function run(name,viewport,stage,audit=false){
 const context=await browser.newContext({viewport,hasTouch:viewport.width<=430,isMobile:viewport.width<=430});
 const page=await context.newPage(); const errors={console:[],runtime:[],network:[]};
 page.on("console",m=>{if(m.type()==="error")errors.console.push(m.text())});
 page.on("pageerror",e=>errors.runtime.push(e.message));
 page.on("requestfailed",r=>errors.network.push(r.method()+" "+r.url()+" "+(r.failure()?.errorText||"")));
 try{
  const response=await page.goto(baseUrl+"/site/work/voucher?case=voucher&stage="+stage,{waitUntil:"networkidle"});
  if(!response?.ok())throw new Error(stage+" HTTP "+response?.status());
  const footer=page.locator(".child-stage-navigation").first(); await footer.waitFor({state:"visible"});
  const before=await footer.evaluate((node,{audit,props})=>{
   const ancestors=[];for(let p=node.parentElement;p;p=p.parentElement)ancestors.push(p);
   const dialog=node.closest("dialog"),surface=node.closest(".dialog-scroll"),content=node.closest(".modal-content-v45");
   const owner=ancestors.find(p=>/(auto|scroll)/.test(getComputedStyle(p).overflowY)&&p.scrollHeight>p.clientHeight+1);
   const item=n=>n&&({tag:n.tagName,className:n.className,id:n.id,rect:(()=>{const r=n.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height}})(),clientHeight:n.clientHeight,scrollHeight:n.scrollHeight,scrollTop:n.scrollTop,styles:Object.fromEntries(props.map(p=>[p,getComputedStyle(n).getPropertyValue(p)])),before:{content:getComputedStyle(n,"::before").content,display:getComputedStyle(n,"::before").display,height:getComputedStyle(n,"::before").height},after:{content:getComputedStyle(n,"::after").content,display:getComputedStyle(n,"::after").display,height:getComputedStyle(n,"::after").height}});
   return{owner:item(owner),dialog:item(dialog),surface:item(surface),content:item(content),footer:item(node),shell:item(dialog?.parentElement),ancestors:audit?ancestors.map(item):undefined};
  },{audit,props});
  const ownerSelector=before.owner?.className?"."+String(before.owner.className).trim().split(/\s+/).join("."):before.owner?.tag?.toLowerCase();
  const owner=before.owner?footer.locator("xpath=ancestor::*[contains(concat(' ',normalize-space(@class),' '),' "+String(before.owner.className).trim().split(/\s+/)[0]+" ')][1]"):page.locator("dialog").first();
  await owner.evaluate(node=>{node.scrollTop=node.scrollHeight-node.clientHeight}); await twoFrames(page);
  const final=await footer.evaluate((node,props)=>{
   const ancestors=[];for(let p=node.parentElement;p;p=p.parentElement)ancestors.push(p);
   const owner=ancestors.find(p=>/(auto|scroll)/.test(getComputedStyle(p).overflowY)&&p.scrollHeight>p.clientHeight+1)||node.closest("dialog");
   const r=node.getBoundingClientRect(),rr=owner.getBoundingClientRect(),dialog=node.closest("dialog"),dr=dialog.getBoundingClientRect();
   const cs=getComputedStyle(node);
   return{scrollOwner:{tag:owner.tagName,className:owner.className,clientHeight:owner.clientHeight,scrollHeight:owner.scrollHeight,maxScrollTop:owner.scrollHeight-owner.clientHeight,scrollTop:owner.scrollTop,rect:{top:rr.top,bottom:rr.bottom,height:rr.height},styles:Object.fromEntries(props.map(p=>[p,getComputedStyle(owner).getPropertyValue(p)]))},footer:{top:r.top,bottom:r.bottom,height:r.height,styles:Object.fromEntries(props.map(p=>[p,cs.getPropertyValue(p)]))},dialog:{top:dr.top,bottom:dr.bottom,height:dr.height,clientHeight:dialog.clientHeight,scrollHeight:dialog.scrollHeight,scrollTop:dialog.scrollTop,styles:Object.fromEntries(props.map(p=>[p,getComputedStyle(dialog).getPropertyValue(p)]))},reachableBottom:Math.min(innerHeight,rr.bottom),overflow:Math.max(0,r.bottom-Math.min(innerHeight,rr.bottom)),bottomWhitespace:Math.max(0,Math.min(innerHeight,rr.bottom)-r.bottom),links:[...node.querySelectorAll("a,button")].map(x=>(x.textContent||x.getAttribute("aria-label")||"").trim()).filter(Boolean)};
  },props);
  await page.screenshot({path:path.join(evidenceDir,name+".png"),fullPage:false});
  report.errors.push({case:name,...errors});
  if(audit)report.baselineAudit=before;
  const pass=final.overflow<=1&&final.scrollOwner.maxScrollTop-final.scrollOwner.scrollTop<=1&&final.links.length>0&&!errors.console.length&&!errors.runtime.length&&!errors.network.length;
  return{ownerSelector,before,final,pass};
 }catch(error){failures.push(name+": "+error.message);return{pass:false,error:error.message}}
 finally{await context.close()}
}
report.desktop.discover=await run("desktop-discover",{width:1419,height:900},"discover",true);
for(const stage of stages.slice(1))report.desktop[stage]=await run("desktop-"+stage,{width:1419,height:900},stage);
for(const stage of ["discover","review"])report.mobile[stage]=await run("mobile-"+stage,{width:430,height:932},stage);
for(const [group,cases] of Object.entries({desktop:report.desktop,mobile:report.mobile}))for(const [stage,result] of Object.entries(cases))if(!result.pass)failures.push(group+"-"+stage+": "+JSON.stringify(result.final||result));
report.failures=failures;
fs.writeFileSync(path.join(evidenceDir,"r1583-footer-qa.json"),JSON.stringify(report,null,2)+"\n");
await browser.close();
if(failures.length)throw new Error(failures.join("\n"));
console.log("R158.3 FOCUSED FOOTER CERTIFICATION PASS");
