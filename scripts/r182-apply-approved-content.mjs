import fs from 'node:fs';

const read=(path)=>JSON.parse(fs.readFileSync(path,'utf8'));
const write=(path,value)=>fs.writeFileSync(path,`${JSON.stringify(value,null,2)}\n`);
const contentPath='public/site/content/portfolio-content.json';
const manifestPath='public/site/content/portfolio-asset-manifest.json';
const ledgerPath='docs/portfolio-automation/execution-ledger.json';
const truthPath='docs/portfolio-automation/verified-project-truth.json';
const content=read(contentPath),manifest=read(manifestPath),ledger=read(ledgerPath),truth=read(truthPath);
const version='2026-08-25-r182-non-asset-complete';

const pair=(en,zh)=>({en,zh});
const setProject=(id,{title,at,timeline,role,ownership,problemTypes,positioning,boundary})=>{
  const p=content.projects[id];
  if(!p)throw new Error(`Missing project ${id}`);
  p.title=pair(...title);p.transformation=title[0];p.transformation_zh=title[1];
  p.atAGlance=pair(...at);p.at_glance=at[0];p.at_glance_zh=at[1];
  if(problemTypes){p.problemTypes={en:problemTypes.en,zh:problemTypes.zh};p.problem_types=problemTypes.en;p.problem_types_zh=problemTypes.zh;}
  if(timeline){p.infoGrid??={};p.infoGrid.timeline={...(p.infoGrid.timeline||{}),duration:pair(...timeline.duration),dateRange:pair(...timeline.dateRange),status:'human-approved-r182'};p.timeline=timeline.dateRange[0];}
  if(role){p.infoGrid??={};p.infoGrid.role=pair(...role);p.role=role[0];p.role_zh=role[1];}
  if(ownership){p.ownershipModel??={};p.ownershipModel.publicSummary=pair(...ownership);}
  if(positioning)p.publicContent={...(p.publicContent||{}),primaryPositioning:pair(...positioning)};
  if(boundary)p.publicContent={...(p.publicContent||{}),approvedDeliveryBoundary:pair(...boundary)};
  p.contentStatus='approved-r182-non-asset';
};

setProject('voucher',{
  title:['Fragmented voucher journeys to a reusable incentive ecosystem','從分散的優惠券旅程到可重用的獎勵生態系'],
  at:['Led multi-year product design across voucher discovery, qualification and redemption, turning fragmented campaign journeys into reusable incentive capabilities across 2022–2025.','主導 2022–2025 年跨優惠券探索、資格判定與兌換的多年產品設計，將分散的活動旅程轉化為可重用的獎勵能力。'],
  timeline:{duration:['2022–2025','2022–2025 年'],dateRange:['2022–2025','2022–2025 年']},
  problemTypes:{en:['Incentive systems','Voucher lifecycle','Commerce operations'],zh:['獎勵系統','優惠券生命週期','商務營運']}
});
setProject('voucher-center',{
  title:['Campaign-based voucher discovery to a persistent claim product','從活動型優惠券探索到常設領取產品'],
  at:['Led product structure and interaction design for a persistent voucher claim experience, using 20-participant validation to turn campaign-specific discovery into reusable entry, claim and ownership states.','主導常設優惠券領取體驗的產品架構與互動設計，透過 20 位參與者驗證，將活動專屬探索轉化為可重用的入口、領取與擁有狀態。'],
  timeline:{duration:['5 months','5 個月'],dateRange:['Nov 2024–Apr 2025','2024 年 11 月–2025 年 4 月']},
  problemTypes:{en:['Voucher discovery','Incentive systems','Claim-state workflows'],zh:['優惠券探索','獎勵系統','領取狀態流程']}
});
setProject('game-center',{
  title:['Single-game entry to scalable multi-game discovery','從單一遊戲入口到可擴展的多遊戲探索'],
  at:['Led the product model and interaction design for a multi-game discovery system, replacing a single-campaign destination with a scalable structure for concurrent and changing game availability.','主導多遊戲探索系統的產品模型與互動設計，將單一活動目的地轉化為可支援多個同時進行、持續變動遊戲狀態的可擴展架構。'],
  problemTypes:{en:['Engagement systems','Content discovery','Availability management'],zh:['互動參與系統','內容探索','供應狀態管理']}
});
setProject('dbs',{
  title:['Fragmented excess handling to a shared cross-market risk workflow','從分散的超額處理到跨市場共用風險流程'],
  at:['Led problem framing and end-to-end workflow design for excess and risk operations, translating fragmented market practices into a shared decision model validated across six markets.','主導超額與風險營運的問題定義與端到端流程設計，將分散的市場作法轉化為經六個市場驗證的共用決策模型。'],
  timeline:{duration:['Jan–Jun 2022','2022 年 1–6 月'],dateRange:['Jan–Jun 2022','2022 年 1–6 月']},
  positioning:['Cross-market system standardisation under risk and operational constraints.','在風險與營運限制下建立跨市場系統標準。'],
  problemTypes:{en:['Risk operations','Exception handling','Cross-market workflows'],zh:['風險營運','例外處理','跨市場流程']}
});
setProject('booking',{
  title:['Fragmented booking touchpoints to a connected trip timeline','從分散的預訂接觸點到連續的旅程時間軸'],
  at:['As the team’s sole UX Designer, designed a connected trip timeline across Booking.com touchpoints, reducing fragmentation across the booking journey for a product operating in 40+ countries.','作為團隊唯一的 UX Designer，設計串聯 Booking.com 多個接觸點的旅程時間軸，減少預訂旅程中的斷裂，服務涵蓋 40 多個國家的產品。'],
  timeline:{duration:['Apr–Oct 2019','2019 年 4–10 月'],dateRange:['Apr–Oct 2019','2019 年 4–10 月']},
  role:['UX Designer','UX Designer · 團隊唯一設計師'],
  ownership:['Sole designer on the team; owned the UX design workstream while product, engineering, research and data partners retained their respective decisions.','團隊唯一設計師；負責 UX 設計工作，產品、工程、研究與數據夥伴仍各自負責其專業決策。'],
  problemTypes:{en:['Travel journeys','Cross-product continuity','Booking lifecycle'],zh:['旅遊旅程','跨產品連續性','預訂生命週期']}
});
setProject('bandzo',{
  title:['Fragmented practice to a guided cross-device experience','從分散練習到具引導性的跨裝置體驗'],
  at:['Designed the product structure for a guided cross-device practice experience, organizing fragmented activities into a clearer progression across the shipped product.','設計具引導性的跨裝置練習產品架構，將分散的活動整理成更清楚的使用進程並落實於已交付產品。'],
  timeline:{duration:['Sep 2016–Jan 2017 · 5 months','2016 年 9 月–2017 年 1 月 · 5 個月'],dateRange:['Sep 2016–Jan 2017','2016 年 9 月–2017 年 1 月']},
  problemTypes:{en:['Guided practice','Cross-device experience','Learning workflows'],zh:['引導式練習','跨裝置體驗','學習流程']}
});
setProject('payment',{
  title:['Transaction continuity across App and in-store checkout','串連 App 與門市結帳的交易連續性'],
  at:['Led end-to-end payment experience design across app and self-checkout, connecting payment, value visibility, recovery and transaction traceability into one continuous system.','主導 App 與自助結帳的端到端支付體驗設計，將付款、價值顯示、失敗復原與交易追蹤串連為一套連續系統。'],
  timeline:{duration:['Dec 2020–Nov 2021','2020 年 12 月–2021 年 11 月'],dateRange:['Dec 2020–Nov 2021','2020 年 12 月–2021 年 11 月']},
  problemTypes:{en:['Payment systems','Checkout continuity','Transaction recovery'],zh:['支付系統','結帳連續性','交易復原']}
});
setProject('cathay-sit-online-account-opening',{
  title:['Fragmented account-opening steps to a validated end-to-end flow','從分散的開戶步驟到經驗證的端到端流程'],
  at:['Led product design and target-flow definition for a validated end-to-end account-opening experience, aligning customer progression with stakeholder and implementation constraints.','主導端到端開戶目標流程的產品設計與定義，在顧客進程、利害關係人需求與實作限制之間建立一致的經驗證方案。'],
  boundary:['Validated target flow — final implementation and development remained client-owned.','經驗證的目標流程；最終實作與開發由客戶端負責。'],
  problemTypes:{en:['Account-opening workflows','Financial onboarding','Delivery constraints'],zh:['開戶流程','金融服務啟用','交付限制']}
});

content.contentVersion=version;manifest.contentVersion=version;
const approved=ledger.approvedDeltas.find(x=>x.deltaId==='DELTA-R1801-APPROVED-CONTENT-PACKAGE');
approved.implementationStatus='APPLIED_ON_R182_BRANCH';approved.mutationAuthorized=true;
ledger.ledgerVersion=version;
ledger.approvedDeltas.push({deltaId:'DELTA-R182-NON-ASSET-CLOSURE',status:'APPROVED',approvedBy:'HUMAN',approvedAt:'2026-08-25',targetType:'NON_ASSET_CLOSURE',implementationStatus:'APPLIED_ON_R182_BRANCH',truthReferences:approved.truthReferences,contentTruthReferences:approved.contentTruthReferences,assetTruthReferences:[],operations:[{operation:'APPLY_APPROVED_PRIMARY_CONTENT',path:contentPath},{operation:'RECONSTRUCT_STALE_PR_NON_ASSET_DELTAS',path:contentPath},{operation:'ADD_ZERO_COST_CERTIFICATION',path:'scripts/portfolio-certification.mjs'}],mutationAuthorized:true});
ledger.workOrders.push({workOrderId:'WO-R182-NON-ASSET-CLOSURE',status:'APPROVED',state:'ENGINEERING_QA',repository:'caaiiruu/shulin-portfolio',baseBranch:'migration/r181-experiments-shared-ia',expectedHead:'a959d6021e2a7beffad2995ec36501dd20cd2ab2',approvedDeltaIds:['DELTA-R1801-APPROVED-CONTENT-PACKAGE','DELTA-R182-NON-ASSET-CLOSURE'],allowedPaths:['public/site/content/**','public/site/assets/js/**','public/site/docs/**','docs/portfolio-automation/**','scripts/**','tests/**','.github/workflows/**','package.json','vercel.json'],forbiddenPaths:['public/site/assets/projects/**'],qaRoutes:['AUTOMATION_VALIDATOR','SSOT_VALIDATION','DESIGN_SYSTEM_LINT','RENDERED_HTML','BROWSER_RESPONSIVE','ACCESSIBILITY_AUTOMATION','PERFORMANCE_BASELINE','SECURITY_PRIVACY'],productionAuthorized:false,approvedBy:'HUMAN'});
ledger.reconciliations=[
  {pr:16,head:'36e5ab0363ba19a330dc62f2e2cb9dd4af90ef5f',projectId:'game-center',status:'SUPERSEDED_CANDIDATE_AFTER_R182',classifications:['ALREADY_CANONICAL','STILL_REQUIRED','SUPERSEDED_BY_HUMAN_DELTA','ASSET_DEFERRED','SHARED_OWNER_OBSOLETE'],result:'Human-approved title and At a Glance applied; current evidence semantics and ~50% boundary retained; replacement image deferred.'},
  {pr:17,head:'3a45925d62de3e92527bb4eb7c6b65476f4bfc9f',projectId:'voucher-center',status:'SUPERSEDED_CANDIDATE_AFTER_R182',classifications:['STILL_REQUIRED','SUPERSEDED_BY_HUMAN_DELTA','ASSET_DEFERRED','SHARED_OWNER_OBSOLETE'],result:'Human-approved timeline and recruiter framing applied; four validation signals and non-shipped boundaries retained; hero deferred.'},
  {pr:12,head:'10821d25833af40bcd6d1db37f5d07bc03d9a1a8',projectId:'payment',status:'SUPERSEDED_CANDIDATE_AFTER_R182',classifications:['ALREADY_CANONICAL','STILL_REQUIRED','SUPERSEDED_BY_HUMAN_DELTA','ASSET_DEFERRED','REJECTED'],result:'Approved At a Glance and hierarchy retained; optional media deferred; unverified uplift remains rejected.'}
];
ledger.technicalDebtClassification={unexplainedWarnings:0,acceptedWarnings:[{owner:'public/site/assets/js/app.js',classification:'LEGACY_SAFE',count:14,rationale:'Inactive helper bindings remain inside the canonical shared runtime; removing them without an owner migration would create disproportionate regression risk. Generated production runtime mirrors this owner.'},{owner:'public/site/assets/js/home.js',classification:'LEGACY_SAFE',count:1,rationale:'Unused callback index is non-public behavior and retained until the canonical Home owner is next modified.'},{owner:'public/site/assets/js/production.*.js',classification:'GENERATED_OWNER',count:15,rationale:'Generated mirror of canonical source; never edited independently.'},{owner:'public/site/qa and focused historical tests',classification:'FALSE_POSITIVE',count:4,rationale:'Read-only geometry/debug captures intentionally preserve intermediate values in historical QA owners.'}],fixedWarnings:['Removed unused content-completeness project parameter','Removed unused browser-QA separator style binding'],mustFixBeforeRelease:[]};
ledger.designSystemClosureAudit={status:'PASS_NO_UNRESOLVED_P0_P1',canonicalOwners:{projectDetail:'ProjectDetailOverview / RecruiterFirstCaseStudy',experiments:'ExperimentExperience',cards:'ProjectCard',navigator:'FloatingNavigator',search:'SearchMatcher',evidence:'SelectedEvidence / ArtifactVisual'},verified:['registry parity','token ownership','single generated-runtime owner','no parallel Experiment renderer','no project-specific R182 CSS','no globals.css reusable override','no stale shared-owner code reconstructed from PR #12/#16/#17'],unresolvedP0P1:[]};
ledger.consolidatedAssetIntake={status:'ONE_FUTURE_HUMAN_SESSION',primary:['Voucher Center hero','Booking hero','Bandzo hero','Cathay Online Account Opening hero','CTBC Mortgage Self-Service hero','Voucher 4–8 high-information-density candidate source visuals'],experiments:['Freelance Project Operations Tool screenshot set','Weekly Design Session visual pack','Food Testing Workshop visual pack','AJA Creative Workshop visual pack','Capture Ideas visual pack','A-Ha! Creative Toolbox visual pack','Hello SABAU! visual pack'],eliminatedByGovernedReuse:['Game Center replacement already exists on PR #16 and does not require a new upload','Payment candidate media already exists on PR #12; reconcile before requesting any upload','DBS, Taishin, Cathay Mortgage, Cathay Review and Booking Taxi Strategy require no upload']};
truth.truthVersion=version;truth.status='R182_NON_ASSET_COMPLETE';
truth.facts.push({factId:'FACT-R182-STALE-PR-RECONCILIATION',projectId:'game-center',field:'stalePrReconciliation',value:{prs:[12,16,17],status:'SUPERSEDED_CANDIDATE_AFTER_R182',assetWorkDeferred:true},sourceIds:['SRC-R179-PAYMENT-PR12','SRC-R179-GAME-CENTER-PR16','SRC-R179-VOUCHER-CENTER-PR17'],provenance:{producer:'HUMAN_APPROVED_RECONCILIATION',precedence:1,verifiedAt:'2026-08-25'},lifecycle:'APPROVED',confidence:'HIGH',publicSafety:'PUBLIC_SAFE',deliveryBoundary:'UNKNOWN',supersedes:[]});

write(contentPath,content);write(manifestPath,manifest);write(ledgerPath,ledger);write(truthPath,truth);
console.log(`Applied ${version}`);
