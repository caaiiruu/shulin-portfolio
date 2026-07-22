(function(){
  const projects=window.PORTFOLIO_DATA&&window.PORTFOLIO_DATA.projects;
  if(!projects)return;

  Object.assign(projects.dbs,{
    context:'Financial services · Enterprise SaaS',
    context_zh:'金融服務 · 企業內部系統',
    transformation:'Untangling operational chaos into a scalable decision system.',
    transformation_zh:'把營運混亂整理成可擴展的決策系統。',
    problem_types:['Exception handling','Cross-team misalignment','Risk decision workflows'],
    problem_types_zh:['例外處理','跨團隊失焦','風險決策流程'],
    at_glance:'Led problem framing and end-to-end design of a centralised exception-management system, replacing fragmented manual work and enabling more consistent decisions across six countries.',
    at_glance_zh:'主導問題定義與端到端設計，將分散的人工例外管理整合成中央系統，支援六個國家做出更一致的決策。',
    role:'Lead Product Designer',
    role_zh:'主責產品設計師',
    scale:'6 countries · 4 roles · 3 co-creation workshops',
    scale_zh:'6 個國家 · 4 種角色 · 3 場共創工作坊',
    decision:'Turn broad cross-role input into one decision-ready workflow centred on actionable cases, visible context, and explicit ownership.',
    decision_zh:'把跨角色的大量意見收斂成一套可直接決策的流程，以待處理案件、可見脈絡與明確責任為核心。',
    scope:'Centralised case triage, case review, decision context, ownership and status visibility, approval tracking, and next actions',
    scope_zh:'中央案件分流、案件審查、決策脈絡、責任與狀態可見性、核准追蹤及下一步行動',
    audience:'Primary: CCU and CRM decision teams\nDiscovery stakeholders: RM and Operations',
    audience_zh:'主要：CCU 與 CRM 決策團隊\n探索階段利害關係人：RM 與 Operations',
    timeline:'2022–2023',
    timeline_zh:'2022–2023',
    why:'Most locations relied on offline excess-handling processes. Incomplete end-of-day reports forced teams to filter, cross-check, and follow up manually, increasing time, error, and operational risk.',
    why_zh:'多數地區依賴離線超額處理流程；資料不完整的日終報表迫使團隊人工篩選、交叉核對與追蹤，增加時間、錯誤與營運風險。',
    impact:'Created a centralised excess-management workflow that automates case triage, surfaces decision context, preserves visibility across roles, and supports more consistent handling.',
    impact_zh:'建立中央超額管理流程，自動進行案件分流、集中呈現決策脈絡、維持跨角色可見性，並支援更一致的處理方式。',
    hard:[
      'Four roles brought different assumptions, priorities, and information needs into one workflow.',
      'Teams had to identify actionable cases before they could begin making decisions.',
      'Context, ownership, approvals, and follow-ups were fragmented across reports, tools, and email.'
    ],
    hard_zh:[
      '四種角色帶著不同假設、優先順序與資訊需求進入同一流程。',
      '團隊必須先從資料中找出待處理案件，才能開始做決策。',
      '脈絡、責任、核准與追蹤分散在報表、工具與 Email 中。'
    ],
    decisions:[
      {
        title:'Start from action, not raw report data',
        title_zh:'從待採取的行動開始，而不是從原始報表開始',
        alternative:'Improve filtering in the end-of-day report without changing the report-led workflow.',
        alternative_zh:'只改善日終報表的篩選方式，不改變以報表為中心的流程。',
        tradeoff:'Required reliable classification rules and shared case-state definitions before interface design.',
        tradeoff_zh:'在介面設計前，必須先建立可靠的分類規則與共享案件狀態定義。',
        result:'The system pre-classified and prioritised actionable cases so teams could begin with decisions instead of manual triage.',
        result_zh:'系統預先分類並排序待處理案件，讓團隊從決策開始，而不是先做人工分流。',
        evidence:'Pain-point ratings across 3 six-country co-creation workshops and a feature-importance survey identified manual triage as a structural, high-priority problem.',
        evidence_zh:'3 場跨六國共創工作坊的痛點評分與功能重要性調查，都將人工分流辨識為高優先且結構性的問題。'
      },
      {
        title:'Bring every decision into one case view',
        title_zh:'把每項決策所需資訊集中到同一案件畫面',
        alternative:'Keep supporting context in source tools and link users out when more detail was needed.',
        alternative_zh:'將支援資訊留在來源工具中，需要細節時再讓使用者跳轉查找。',
        tradeoff:'Expanded data-dependency and information-architecture alignment before the case view could be finalised.',
        tradeoff_zh:'在案件畫面定案前，需要投入更多資料相依與資訊架構對齊。',
        result:'Critical reason, date, expiry, approval, and status context became assessable without manually stitching together separate sources.',
        result_zh:'關鍵原因、日期、到期、核准與狀態脈絡集中可見，不再需要人工拼接不同來源。',
        evidence:'The cross-role journey map exposed repeated cross-checking; card sorting then shaped the information structure used in recurring prototype tests.',
        evidence_zh:'跨角色旅程圖揭露重複交叉核對的問題；卡片分類進一步形成資訊架構，並投入滾動式原型測試。'
      },
      {
        title:'Make ownership, progress, and next action explicit',
        title_zh:'讓責任、進度與下一步成為明確系統狀態',
        alternative:'Infer ownership from permissions and continue coordinating progress through email follow-ups.',
        alternative_zh:'從權限推測責任，並繼續透過 Email 追蹤進度。',
        tradeoff:'Required shared definitions for ownership, approvals, ageing, and handover states across roles.',
        tradeoff_zh:'需要跨角色共同定義責任、核准、案件時間與交接狀態。',
        result:'Teams gained shared visibility of who owned a case, its current status, and what needed to happen next.',
        result_zh:'團隊能共同看到案件由誰負責、目前狀態，以及下一步需要完成什麼。',
        evidence:'Recurring prototype testing finalised the CCU–CRM handover; handoff and QA reviews aligned edge cases, states, and data dependencies before build.',
        evidence_zh:'滾動式原型測試確認 CCU–CRM 交接；設計交付與 QA 檢視則在開發前對齊例外、狀態與資料相依。'
      }
    ],
    gallery:[
      ['Actionable case prioritisation','Automated filtering and prioritised states move teams from report triage to decision-making.','待處理案件優先排序','自動篩選與優先狀態讓團隊從報表分流轉向決策。'],
      ['Decision context in one place','Critical case context is organised for assessment without cross-checking disconnected sources.','集中呈現決策脈絡','整理關鍵案件脈絡，無須在分散來源間交叉核對。'],
      ['Ownership and progress states','Ownership, approval status, ageing, and next actions remain visible across the handover.','責任與進度狀態','責任、核准狀態、案件時間與下一步在交接過程持續可見。']
    ],
    recruiter:{
      team:['4 roles · CCU, RM, CRM, and Operations','4 種角色 · CCU、RM、CRM 與 Operations'],
      delivery:['3 six-country co-creation workshops · Recurring group-specific interviews and online prototype tests','3 場跨六國共創工作坊 · 針對不同使用者群的持續訪談與線上原型測試'],
      metric:['6 countries · 4 enterprise user roles · Exact outcome metrics confidential','6 個國家 · 4 種企業使用者角色 · 精確成果數據保密'],
      cross:[
        ['I facilitated 3 co-creation workshops across six countries to expose shared and country-specific workflow needs.','我主持 3 場橫跨六國的共創工作坊，揭露共通與各國特有的流程需求。'],
        ['I followed with recurring small-group interviews and online tests tailored to different user roles.','後續持續針對不同使用者角色進行小組訪談與線上測試。'],
        ['The evidence gave product and engineering a shared basis for iterative workflow and delivery decisions.','這些證據成為產品與工程迭代流程及交付決策的共同依據。']
      ],
      reflection:['Next, use AI to accelerate early synthesis while keeping prioritisation and risk decisions under stakeholder ownership.','下一步可用 AI 加速早期資料整理，但優先排序與風險決策仍由利害關係人共同負責。']
    },
    card_outcome:'A centralised workflow for faster, more consistent decisions.',
    card_outcome_zh:'建立中央流程，支援更快且更一致的決策。'
  });

  Object.assign(projects.voucher,{
    context:'NTUC FairPrice · Rewards and gamification',
    context_zh:'NTUC FairPrice · 獎勵與遊戲化',
    transformation:'From fragmented promotions to a scalable incentive ecosystem.',
    transformation_zh:'從分散促銷走向可擴展的獎勵生態系。',
    problem_types:['Incentive systems','Promotion orchestration','Marketplace monetisation'],
    problem_types_zh:['獎勵系統','促銷協作','平台商業化'],
    at_glance:'Led incentive-system strategy and end-to-end modelling, turning fragmented promotion logic into reusable capabilities across online, in-store, and supplier-funded journeys.',
    at_glance_zh:'主導獎勵系統策略與端到端模型，將分散促銷邏輯轉化為可跨線上、門市與供應商活動重用的能力。',
    role:'Product Designer',
    role_zh:'產品設計師',
    scale:'Online + in-store · Customer, supplier, business, operations, and product teams',
    scale_zh:'線上 + 實體門市 · 使用者、供應商、商務、營運與產品團隊',
    decision:'Organise fragmented voucher mechanics into reusable capabilities for discovery, eligibility, redemption, and supplier-funded campaigns.',
    decision_zh:'把分散票券機制整理成探索、資格、兌換與供應商出資活動都能重用的平台能力。',
    scope:'Voucher taxonomy, wallet, PDP and in-store offer visibility, auto-apply and cart matching, code redemption, brand challenges, and reusable campaign modules',
    scope_zh:'票券分類、票券錢包、商品頁與店內優惠可見性、自動套用與購物車匹配、代碼兌換、品牌挑戰及可重用活動模組',
    audience:'Primary: Customers\nSecondary: Suppliers, business, operations, and product teams',
    audience_zh:'主要：使用者\n次要：供應商、商務、營運與產品團隊',
    timeline:'2022–2025',
    timeline_zh:'2022–2025',
    why:'Campaign-specific voucher logic had fragmented discovery, claim, redemption, supplier-funded mechanics, and internal setup across channels.',
    why_zh:'以活動為單位建立的票券邏輯，使探索、領取、兌換、供應商出資機制與內部設定分散在不同通路。',
    impact:'Created a modular incentive ecosystem with shared eligibility and redemption logic and more scalable supplier-funded campaign capabilities.',
    impact_zh:'建立模組化獎勵生態系，共用資格與兌換邏輯，並形成更可擴展的供應商出資活動能力。',
    hard:[
      'Voucher mechanics had grown through separate campaigns, business needs, and channel-specific implementations.',
      'Users could not always tell what was relevant, usable, expiring, or connected to their shopping intent.',
      'New promotion ideas repeatedly introduced new logic, surfaces, and operational interpretation.'
    ],
    hard_zh:[
      '票券機制隨不同活動、商業需求與通路實作各自成長。',
      '使用者不一定知道哪些優惠相關、可用、即將到期或符合購物意圖。',
      '新的促銷想法不斷帶來新的邏輯、介面與營運解讀。'
    ],
    decisions:[
      {
        title:'Design campaign mechanics as reusable modules',
        title_zh:'把活動機制設計成可重用模組',
        alternative:'Continue designing each campaign as an independent journey with its own rules and surfaces.',
        alternative_zh:'繼續把每個活動做成擁有獨立規則與介面的單次旅程。',
        tradeoff:'Required a shared mechanics taxonomy and governance before teams could move quickly at module level.',
        tradeoff_zh:'團隊要快速建立模組前，必須先建立共享機制分類與治理方式。',
        result:'Fragmented mechanics became a modular system with shared eligibility, claim, expiry, redemption, and sponsorship logic.',
        result_zh:'分散機制轉化為模組化系統，共用資格、領取、到期、兌換與出資邏輯。',
        evidence:'The mechanics audit, logic-grouping table, opportunity prioritisation, and principle-to-module map established the reusable structure used across modules.',
        evidence_zh:'機制盤點、邏輯分類表、機會優先矩陣與原則到模組對照，共同建立跨模組重用的結構。'
      },
      {
        title:'Surface savings at the moment of shopping intent',
        title_zh:'在購物意圖發生時呈現可用優惠',
        alternative:'Keep voucher discovery primarily inside a central voucher area and expect users to search for value.',
        alternative_zh:'把票券探索集中在單一票券區域，期待使用者主動尋找優惠。',
        tradeoff:'Expanded the number of product surfaces that needed consistent relevance, eligibility, and expiry behaviour.',
        tradeoff_zh:'增加需要維持一致相關性、資格與到期行為的產品介面數量。',
        result:'Wallet, product-detail, and in-store surfaces made relevant savings visible earlier in the shopping journey.',
        result_zh:'票券錢包、商品詳情與店內介面，讓相關優惠更早出現在購物旅程中。',
        evidence:'Journey mapping identified where users discovered, lost, applied, or failed to redeem vouchers; module designs responded at those specific moments.',
        evidence_zh:'旅程圖找出使用者發現、遺失、套用或兌換失敗的節點，模組設計則直接回應這些時刻。'
      },
      {
        title:'Reduce redemption effort and make eligibility visible',
        title_zh:'降低兌換負擔，並讓資格條件可見',
        alternative:'Keep voucher selection, entry, and eligibility checking as manual user tasks.',
        alternative_zh:'維持由使用者手動選擇、輸入票券並檢查資格。',
        tradeoff:'Increased initial implementation work for shared states, cart matching, auto-apply, and validation feedback.',
        tradeoff_zh:'增加共享狀態、購物車匹配、自動套用與驗證回饋的初期實作範圍。',
        result:'Auto-apply, cart matching, code validation, and explicit eligibility states reduced ambiguity across discovery and checkout.',
        result_zh:'自動套用、購物車匹配、代碼驗證與明確資格狀態，降低探索到結帳之間的模糊性。',
        evidence:'The voucher audit exposed repeated redemption conditions; cross-module alignment and edge-case specifications made the same states reusable across flows.',
        evidence_zh:'票券盤點揭露重複兌換條件；跨模組對齊與例外規格讓相同狀態能在不同流程重用。'
      },
      {
        title:'Turn supplier funding into reusable engagement',
        title_zh:'把供應商出資轉化為可重用互動機制',
        alternative:'Rely on static voucher placement for supplier-funded promotions.',
        alternative_zh:'供應商出資活動只依賴靜態票券陳列。',
        tradeoff:'Needed participation, progress, reward, and sponsorship states that could work across campaign formats.',
        tradeoff_zh:'需要建立可跨活動形式使用的參與、進度、獎勵與出資狀態。',
        result:'Brand challenges and reusable campaign modules created more scalable supplier-funded engagement mechanics.',
        result_zh:'品牌挑戰與可重用活動模組形成更可擴展的供應商出資互動機制。',
        evidence:'Stakeholder interviews clarified supplier-funded constraints; brand-challenge, flash-voucher, and campaign modules translated them into repeatable patterns.',
        evidence_zh:'利害關係人訪談釐清供應商出資限制；品牌挑戰、限時票券與活動模組再將其轉化為可重複模式。'
      }
    ],
    gallery:[
      ['Reusable incentive architecture','Voucher types, rules, and campaign mechanics connect through one modular system.','可重用獎勵架構','票券類型、規則與活動機制透過同一模組系統連結。'],
      ['Contextual offer discovery','Wallet, product, and in-store surfaces reveal relevant value at shopping intent.','情境式優惠探索','票券錢包、商品與店內介面在購物意圖發生時呈現相關價值。'],
      ['Eligibility and redemption states','Shared eligibility, auto-apply, matching, and validation states reduce redemption ambiguity.','資格與兌換狀態','共享資格、自動套用、匹配與驗證狀態降低兌換模糊性。'],
      ['Supplier-funded engagement modules','Brand challenges and reusable campaigns extend supplier value beyond static placement.','供應商出資互動模組','品牌挑戰與可重用活動讓供應商價值超越靜態陳列。']
    ],
    recruiter:{
      team:['Product, business, operations, and supplier-funded campaign stakeholders','產品、商務、營運與供應商出資活動利害關係人'],
      delivery:['Executive interviews · Joint concept tests · Cross-functional alignment workshop · End-to-end evidence map','高層訪談 · 共同概念測試 · 跨職能對齊工作坊 · 端到端證據流程圖'],
      metric:['Exact outcome metrics confidential · System outcome documented qualitatively','精確成果數據保密 · 以質性方式呈現系統成果'],
      cross:[
        ['I combined past research, tests, internal interviews, business value, breakdowns, and opportunities into one end-to-end analysis map for planning.','我將歷年研究、測試、內部訪談、商業利益、斷點與機會點整合成一份供產品規劃使用的端到端分析圖。'],
        ['A simplified voucher and offer taxonomy gave operations and marketing one reference for configuration and campaign strategy.','精簡的票券與優惠分類，讓營運與行銷能以同一份參考進行設定與活動策略規劃。'],
        ['Mapping each category to reusable components reduced repeated clarification for design and engineering; other designers also referenced the analysis-map template.','將分類對應到可重用元件，減少設計與工程反覆確認；其他設計師也參考使用這份分析圖樣板。']
      ],
      reflection:['Next, define the incentive-mechanics taxonomy earlier and use it as the decision framework before module-level design.','下一步會更早定義獎勵機制分類，並在模組設計前用它作為決策框架。']
    },
    card_outcome:'Reusable incentive capabilities across online, in-store, and supplier-funded journeys.',
    card_outcome_zh:'建立可跨線上、實體門市與供應商出資旅程重用的獎勵能力。'
  });
})();
