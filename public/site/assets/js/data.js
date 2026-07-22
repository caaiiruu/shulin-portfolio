window.PORTFOLIO_DATA = {
  projects: {
    dbs: {
      context: "Financial services · Operational workflows",
      context_zh: "金融服務 · 營運流程",
      home_title: "The form was not the real problem.",
      home_title_zh: "真正的問題，不是表單。",
      transformation: "From fragmented exceptions to one review model.",
      transformation_zh: "從分散例外到單一審查模型。",
      problem_types: [
        "Operational workflows",
        "Exception handling",
        "Risk operations",
      ],
      problem_types_zh: ["營運流程", "例外處理", "風險營運"],
      summary:
        "An internal exception workflow used by teams across six countries needed one shared decision state across roles and operational teams.",
      summary_zh:
        "供六個國家內部團隊使用的例外流程，需要一個跨角色與營運團隊共享的決策狀態。",
      role: "Lead Product Designer",
      role_zh: "主責產品設計師",
      owned:
        "Problem framing · 3 six-country co-creation workshops · User interviews and testing · Workflow architecture · Delivery",
      owned_zh:
        "問題定義 · 3 場跨六國共創工作坊 · 使用者訪談與測試 · 流程架構 · 交付",
      decision:
        "Make ownership, exception states, and escalation explicit before adding screens.",
      decision_zh: "在增加畫面前，先讓責任、例外狀態與升級機制明確可見。",
      evidence:
        "Role-state model · Exception flow · Representative system artifact",
      evidence_zh: "角色狀態模型 · 例外流程 · 代表性系統證據",
      status: "Professional work · Confidential",
      status_zh: "專業專案 · 保密",
      at_glance:
        "Led problem framing and end-to-end design of a centralised exception-management system, making priority, ownership, and next action visible to internal teams across six countries.",
      at_glance_zh:
        "主導問題定義與端到端例外管理系統設計，讓六個國家的內部團隊清楚看到優先順序、責任與下一步。",
      type: "Internal System",
      scope:
        "End-to-end exception intake, review, ownership, escalation, and decision states",
      scope_zh: "涵蓋例外案件進件、審查、責任、升級與決策狀態的端到端流程",
      audience:
        "Primary: Internal operations teams across six countries\nSecondary: Risk stakeholders, decision owners",
      audience_zh:
        "主要：六個國家的內部營運團隊\n次要：風險利害關係人、決策負責人",
      timeline: "Confidential",
      timeline_zh: "保密",
      why: "Case information was fragmented across tools and teams, making prioritisation inconsistent and slowing operational decisions.",
      why_zh:
        "案件資訊分散於不同工具與團隊，使優先順序不一致，並拖慢營運決策。",
      impact:
        "Established a more consistent and traceable operating model for exception review.",
      impact_zh: "建立更一致、可追溯的例外審查營運模型。",
      hard: [
        "Country operations and ownership rules varied across internal teams.",
        "Standard paths and exception paths shared the same operational surface.",
        "Traceability was required without slowing routine decisions.",
      ],
      hard_zh: [
        "不同國家內部團隊的營運方式與責任規則不同。",
        "標準流程與例外流程共用同一營運介面。",
        "系統需要可追溯，同時不能拖慢日常決策。",
      ],
      decisions: [
        {
          title: "Separate the stable path from exception-specific decisions",
          title_zh: "把穩定路徑與例外決策分開",
          why: "Reduced conditional complexity in the normal workflow.",
          why_zh: "降低正常流程中暴露的條件複雜度。",
          alternative:
            "Alternative considered — add exception controls to every screen.",
          alternative_zh: "曾考慮方案 — 在每個畫面加入例外控制。",
          tradeoff: "Trade-off — required more up-front workflow modelling.",
          tradeoff_zh: "取捨 — 需要更多前期流程建模。",
          result:
            "Routine cases stayed on one stable path; exception logic appeared only when triggered.",
          result_zh: "日常案件維持單一穩定路徑，只有在觸發時才顯示例外邏輯。",
        },
        {
          title: "Make ownership and escalation explicit states",
          title_zh: "把責任與升級設計成明確狀態",
          why: "Allowed teams to interpret case responsibility consistently.",
          why_zh: "讓不同團隊能一致理解案件責任。",
          alternative:
            "Alternative considered — infer ownership from team permissions.",
          alternative_zh: "曾考慮方案 — 從團隊權限推論責任。",
          tradeoff: "Trade-off — added explicit states before visual polish.",
          tradeoff_zh: "取捨 — 在視覺精修前先增加明確狀態。",
          result:
            "Every case state displayed a named owner and an escalation condition.",
          result_zh: "每個案件狀態都顯示明確負責人與升級條件。",
        },
        {
          title: "Use one review model across country operations",
          title_zh: "跨國營運使用同一審查模型",
          why: "Preserved shared logic while supporting local operating differences.",
          why_zh: "在支援在地差異的同時保留共用邏輯。",
          alternative:
            "Alternative considered — duplicate workflows by country operation.",
          alternative_zh: "曾考慮方案 — 依各國營運複製流程。",
          tradeoff:
            "Trade-off — preserved a shared core while allowing local configuration.",
          tradeoff_zh: "取捨 — 保留共享核心，同時允許在地設定。",
          result:
            "Country-specific variants reused one core review model with configurable local rules.",
          result_zh:
            "各國版本重用同一核心審查模型，並以可設定規則支援在地差異。",
        },
      ],
      led: [
        "Problem framing",
        "Workflow architecture",
        "Interaction design",
        "Cross-functional alignment",
        "Delivery",
      ],
      led_zh: ["問題定義", "流程架構", "互動設計", "跨職能對齊", "交付"],
      contributed: [
        "Business rules",
        "Technical feasibility",
        "Implementation",
        "Measurement",
      ],
      contributed_zh: ["商業規則", "技術可行性", "實作", "成效衡量"],
      gallery: [
        [
          "One coordinated review state",
          "A shared state connects applicant, operations, and decision ownership.",
          "單一協調審查狀態",
          "共享狀態連結申請人、營運與決策責任。",
        ],
        [
          "Exception-specific decision path",
          "The normal path stays simple while exceptional cases expose the required decision logic.",
          "例外專屬決策路徑",
          "正常流程保持簡單，例外案件才顯示必要決策邏輯。",
        ],
        [
          "Ownership and escalation model",
          "Responsibility, blockers, and escalation points remain visible throughout review.",
          "責任與升級模型",
          "責任、阻礙與升級節點在審查過程中持續可見。",
        ],
      ],
      recruiter: {
        team: [
          "4 roles · CCU, RM, CRM, and Operations",
          "4 種角色 · CCU、RM、CRM 與 Operations",
        ],
        delivery: [
          "3 six-country co-creation workshops · Recurring group-specific interviews and online prototype tests",
          "3 場跨六國共創工作坊 · 針對不同使用者群的持續訪談與線上原型測試",
        ],
        metric: [
          "6 countries · 4 enterprise user roles · Exact outcome metrics confidential",
          "6 個國家 · 4 種企業使用者角色 · 精確成果數據保密",
        ],
        cross: [
          [
            "I facilitated 3 co-creation workshops across six countries to expose shared and country-specific workflow needs.",
            "我主持 3 場橫跨六國的共創工作坊，揭露共通與各國特有的流程需求。",
          ],
          [
            "I followed with recurring small-group interviews and online tests tailored to different user roles.",
            "後續持續針對不同使用者角色進行小組訪談與線上測試。",
          ],
          [
            "The evidence gave product and engineering a shared basis for iterative workflow and delivery decisions.",
            "這些證據成為產品與工程迭代流程及交付決策的共同依據。",
          ],
        ],
        reflection: [
          "Next, validate whether local exceptions can be configured without fragmenting the core model.",
          "下一步驗證在地例外能否在不破壞核心模型下被設定。",
        ],
      },
      scale: "6 countries · Cross-country internal operations",
      scale_zh: "6 個國家 · 跨國內部營運",
      card_outcome: "One traceable review model across internal teams.",
      card_outcome_zh: "讓內部團隊使用同一套可追溯的審查模型。",
      domain_proof:
        "A shared review model for six-country internal operations.",
      domain_proof_zh: "供六個國家內部營運使用的共享審查模型。",
      search_relevance:
        "Exception handling, shared states, ownership, and escalation across internal operations.",
      search_relevance_zh: "處理內部營運中的例外、共享狀態、責任與升級機制。",
    },
    voucher: {
      context: "Growth systems · Incentive ecosystem",
      context_zh: "成長系統 · 獎勵生態系",
      home_title: "Promotion rules became a reusable product model.",
      home_title_zh: "促銷規則成為可重用的產品模型。",
      transformation: "From one-off campaigns to reusable incentives.",
      transformation_zh: "從一次性活動到可重用獎勵。",
      problem_types: [
        "Incentive systems",
        "Multi-party operations",
        "Platform scalability",
      ],
      problem_types_zh: ["獎勵系統", "多方營運", "平台擴展"],
      summary:
        "Campaign-specific logic had to become a reusable system for discovery, eligibility, claim, redemption, and partner value.",
      summary_zh:
        "一次性的活動邏輯需要轉化為支援探索、資格、領取、兌換與夥伴價值的可重用系統。",
      role: "Product Designer",
      role_zh: "產品設計師",
      owned:
        "Stakeholder interviews · Concept testing · Workshop facilitation · End-to-end analysis · Incentive taxonomy · Component mapping",
      owned_zh:
        "利害關係人訪談 · 概念測試 · 工作坊主持 · 端到端分析 · 獎勵分類 · 元件對應",
      decision:
        "Build reusable incentive rules before multiplying campaign screens.",
      decision_zh: "在增加活動畫面前，先建立可重用的獎勵規則。",
      evidence: "Incentive taxonomy · Eligibility states · Redemption model",
      evidence_zh: "獎勵分類 · 資格狀態 · 兌換模型",
      status: "Professional work · Confidential",
      status_zh: "專業專案 · 保密",
      at_glance:
        "Led product strategy and system design for fragmented voucher and offer journeys, turning evidence into shared rules and reusable components across customer, partner, and operational workflows.",
      at_glance_zh:
        "主導分散票券與優惠旅程的產品策略及系統設計，將證據轉化為跨顧客、夥伴與營運流程共用的規則及可重用元件。",
      type: "Incentive System",
      scope:
        "Discovery, eligibility, claim, redemption, partner, and operational workflows",
      scope_zh: "涵蓋探索、資格、領取、兌換、夥伴與營運流程",
      audience:
        "Primary: Customers\nSecondary: Partners, operations, platform teams",
      audience_zh: "主要：使用者\n次要：夥伴、營運、平台團隊",
      timeline: "Confidential",
      timeline_zh: "保密",
      why: "Users struggled to find relevant vouchers, while teams relied on campaign-specific logic and manual coordination.",
      why_zh: "使用者難以找到相關票券，團隊則依賴一次性活動邏輯與人工協作。",
      impact:
        "Established reusable incentive capabilities that could support multiple campaign models.",
      impact_zh: "建立可支援多種活動模型的可重用獎勵能力。",
      hard: [
        "Customer value, partner exposure, and platform conversion were interdependent.",
        "Eligibility and redemption rules varied across campaigns.",
        "New promotions risked creating more one-off interfaces.",
      ],
      hard_zh: [
        "使用者價值、夥伴曝光與平台轉換彼此相依。",
        "不同活動的資格與兌換規則不同。",
        "新增促銷容易產生更多一次性介面。",
      ],
      decisions: [
        {
          title: "Separate incentive rules from campaign presentation",
          title_zh: "把獎勵規則與活動呈現分開",
          why: "New campaigns could reuse the same underlying product model.",
          why_zh: "新活動可以重用相同的底層產品模型。",
          alternative:
            "Alternative considered — design each campaign as a separate journey.",
          alternative_zh: "曾考慮方案 — 將每個活動設計成獨立旅程。",
          tradeoff:
            "Trade-off — the rule model needed governance before rapid campaign creation.",
          tradeoff_zh: "取捨 — 快速建立活動前，需要先治理規則模型。",
          result:
            "New campaigns reused the same rule model while changing only the presentation layer.",
          result_zh: "新活動重用相同規則模型，只調整呈現層。",
        },
        {
          title: "Model eligibility and redemption as explicit states",
          title_zh: "把資格與兌換建模為明確狀態",
          why: "Reduced ambiguity across customer and operational flows.",
          why_zh: "降低使用者與營運流程中的模糊性。",
          alternative:
            "Alternative considered — keep eligibility as hidden backend logic.",
          alternative_zh: "曾考慮方案 — 將資格維持為隱藏後端邏輯。",
          tradeoff:
            "Trade-off — more explicit states increased initial implementation scope.",
          tradeoff_zh: "取捨 — 更明確的狀態增加初期實作範圍。",
          result:
            "Eligibility and redemption states became visible to customers and operations.",
          result_zh: "資格與兌換狀態同時對使用者與營運團隊可見。",
        },
        {
          title: "Use one programme model across roles",
          title_zh: "跨角色使用同一方案模型",
          why: "Connected customer value, partner exposure, and platform conversion.",
          why_zh: "連結使用者價值、夥伴曝光與平台轉換。",
          alternative:
            "Alternative considered — optimise each role separately.",
          alternative_zh: "曾考慮方案 — 分別最佳化各角色。",
          tradeoff:
            "Trade-off — one programme model constrained some local presentation freedom.",
          tradeoff_zh: "取捨 — 單一方案模型限制部分在地呈現自由。",
          result:
            "Customer, partner, operations, and platform teams referenced one programme definition.",
          result_zh: "使用者、夥伴、營運與平台團隊共用同一方案定義。",
        },
      ],
      led: [
        "Problem framing",
        "Incentive modelling",
        "Workflow design",
        "Cross-functional delivery",
      ],
      led_zh: ["問題定義", "獎勵模型", "流程設計", "跨職能交付"],
      contributed: [
        "Business rules",
        "Technical feasibility",
        "Implementation",
        "Measurement",
      ],
      contributed_zh: ["商業規則", "技術可行性", "實作", "成效衡量"],
      gallery: [
        [
          "Reusable incentive model",
          "Discovery, eligibility, claim, and redemption share one product model.",
          "可重用獎勵模型",
          "探索、資格、領取與兌換共用一套產品模型。",
        ],
        [
          "Eligibility and redemption states",
          "Explicit states make campaign behaviour easier to reuse and operate.",
          "資格與兌換狀態",
          "明確狀態讓活動行為更容易重用與營運。",
        ],
        [
          "Multi-party programme view",
          "Customer, partner, operations, and platform needs connect through the same programme.",
          "多方方案視角",
          "使用者、夥伴、營運與平台需求透過同一方案連結。",
        ],
      ],
      recruiter: {
        team: [
          "Product, business, operations, and supplier-funded campaign stakeholders",
          "產品、商務、營運與供應商出資活動利害關係人",
        ],
        delivery: [
          "Executive interviews · Joint concept tests · Cross-functional alignment workshop · End-to-end evidence map",
          "高層訪談 · 共同概念測試 · 跨職能對齊工作坊 · 端到端證據流程圖",
        ],
        metric: [
          "Exact outcome metrics confidential · System outcome documented qualitatively",
          "精確成果數據保密 · 以質性方式呈現系統成果",
        ],
        cross: [
          [
            "I combined past research, tests, internal interviews, business value, breakdowns, and opportunities into one end-to-end analysis map for planning.",
            "我將歷年研究、測試、內部訪談、商業利益、斷點與機會點整合成一份供產品規劃使用的端到端分析圖。",
          ],
          [
            "A simplified voucher and offer taxonomy gave operations and marketing one reference for configuration and campaign strategy.",
            "精簡的票券與優惠分類，讓營運與行銷能以同一份參考進行設定與活動策略規劃。",
          ],
          [
            "Mapping each category to reusable components reduced repeated clarification for design and engineering; other designers also referenced the analysis-map template.",
            "將分類對應到可重用元件，減少設計與工程反覆確認；其他設計師也參考使用這份分析圖樣板。",
          ],
        ],
        reflection: [
          "Next, test which rules can become self-serve without increasing operational risk.",
          "下一步測試哪些規則可自助設定且不增加營運風險。",
        ],
      },
      scale: "Customer, partner, operations, and platform ecosystem",
      scale_zh: "使用者、夥伴、營運與平台生態系",
      card_outcome:
        "Reusable incentive capabilities across customer, partner, and operations workflows.",
      card_outcome_zh: "建立可跨顧客、夥伴與營運流程重用的獎勵能力。",
      domain_proof:
        "Reusable eligibility and redemption logic across a multi-party ecosystem.",
      domain_proof_zh: "跨多方生態系可重用的資格與兌換規則。",
      search_relevance:
        "Reusable eligibility, redemption, partner, and campaign logic across an incentive ecosystem.",
      search_relevance_zh:
        "把資格、兌換、夥伴與活動規則整合成可重用的獎勵生態系。",
    },
    hours: {
      context: "Independent 0→1 product",
      context_zh: "個人 0→1 產品",
      home_title: "Project closure became a repeatable system.",
      home_title_zh: "專案結案成為可重複的系統。",
      transformation: "From scattered records to clear project closure.",
      transformation_zh: "從分散紀錄到清楚結案。",
      problem_types: [
        "Freelance operations",
        "Time tracking",
        "Project closure",
      ],
      problem_types_zh: ["接案營運", "工時追蹤", "專案結案"],
      summary:
        "A lightweight tool connected effort, revisions, deliverables, and closing review through real freelance use.",
      summary_zh:
        "一個透過真實接案使用，連結工時、修改、交付與結案檢視的輕量工具。",
      role: "Designer and builder",
      role_zh: "設計與建置",
      owned: "Problem framing · Workflow design · Build · Iteration",
      owned_zh: "問題定義 · 流程設計 · 建置 · 迭代",
      decision:
        "Ship the smallest useful closing model, then refine it through real use.",
      decision_zh: "先交付最小可用的結案模型，再透過真實使用調整。",
      evidence: "Working tool · Active use · Iteration log",
      evidence_zh: "可運作工具 · 實際使用 · 迭代紀錄",
      status: "Independent · In active use · First usable version in 2 days",
      status_zh: "個人產品 · 實際使用中 · 2 天完成首個可用版本",
      at_glance:
        "Designed and built a lightweight freelance project-closing system in two days, connecting fragmented effort, revision, and delivery records and revealing 18% under-estimated work across three projects.",
      at_glance_zh:
        "用兩天設計並建置輕量接案結案系統，串連分散的工時、修改與交付紀錄，並在三個專案中辨識出 18% 的低估工時。",
      type: "0→1 Product",
      scope:
        "Freelance time tracking, revision records, deliverables, and project closure",
      scope_zh: "涵蓋接案工時、修改紀錄、交付物與專案結案",
      audience:
        "Primary: Independent product designer\nSecondary: Project collaborators",
      audience_zh: "主要：獨立產品設計師\n次要：專案協作者",
      timeline: "2 days to first usable version",
      timeline_zh: "2 天完成首個可用版本",
      why: "Hours, revisions, and deliverables were recorded across separate tools, making estimated and actual effort difficult to compare.",
      why_zh: "工時、修改與交付分散在不同工具中，使預估與實際投入難以比較。",
      impact:
        "Established a repeatable closing review that made under-estimated work visible and improved future planning.",
      impact_zh: "建立可重複的結案檢視，讓低估工時變得可見並改善後續規劃。",
      hard: [
        "Records were distributed across several tools.",
        "The first version needed to become useful within two days.",
        "The model had to improve through real project closure behaviour.",
      ],
      hard_zh: [
        "紀錄分散在多個工具中。",
        "首個版本需要在兩天內具備使用價值。",
        "模型必須依真實結案行為持續改善。",
      ],
      decisions: [
        {
          title: "Start with the closing decision",
          title_zh: "從結案決策開始",
          why: "Kept the first version small enough to use immediately.",
          why_zh: "讓首個版本維持足夠小，能立即投入使用。",
          alternative:
            "Alternative considered — rebuild a complete freelance CRM first.",
          alternative_zh: "曾考慮方案 — 先重建完整接案 CRM。",
          tradeoff:
            "Trade-off — the first version covered closure, not every project-management task.",
          tradeoff_zh: "取捨 — 首版聚焦結案，而非所有專案管理任務。",
          result:
            "The first usable version reached active freelance use in two days.",
          result_zh: "首個可用版本在兩天內投入真實接案使用。",
        },
        {
          title: "Connect effort to revisions and deliverables",
          title_zh: "連結工時、修改與交付",
          why: "Made under-estimated work visible in context.",
          why_zh: "讓低估工時能在脈絡中被看見。",
          alternative:
            "Alternative considered — track hours without revision context.",
          alternative_zh: "曾考慮方案 — 只追蹤工時，不記錄修改脈絡。",
          tradeoff:
            "Trade-off — slightly more structure was required during logging.",
          tradeoff_zh: "取捨 — 紀錄時需要多一點結構。",
          result:
            "Under-estimated work became visible beside revisions and deliverables.",
          result_zh: "低估工時能與修改及交付內容一起被看見。",
        },
        {
          title: "Iterate from active freelance use",
          title_zh: "依真實接案使用迭代",
          why: "Changed the model based on actual closure behaviour.",
          why_zh: "依實際結案行為調整模型。",
          alternative:
            "Alternative considered — wait for a polished automation.",
          alternative_zh: "曾考慮方案 — 等到完整自動化後再使用。",
          tradeoff:
            "Trade-off — manual inputs remained while the model was being validated.",
          tradeoff_zh: "取捨 — 模型驗證期間仍保留人工輸入。",
          result:
            "The workflow changed based on completed-project closing reviews.",
          result_zh: "流程依已結案專案的實際檢視結果持續調整。",
        },
      ],
      led: [
        "Problem framing",
        "Workflow design",
        "Build",
        "Real-use iteration",
      ],
      led_zh: ["問題定義", "流程設計", "建置", "真實使用迭代"],
      contributed: ["Project requirements", "Data structure", "Usage review"],
      contributed_zh: ["專案需求", "資料結構", "使用檢視"],
      gallery: [
        [
          "Project overview",
          "Active projects, effort, and closure readiness appear in one working view.",
          "專案總覽",
          "進行中專案、投入工時與結案準備集中在一個可運作視圖。",
        ],
        [
          "Work and revision log",
          "Effort is connected to revision type, deliverable, and project phase.",
          "工作與修改紀錄",
          "投入工時連結修改類型、交付內容與專案階段。",
        ],
        [
          "Closing review",
          "Estimated and actual effort are compared before a project is archived.",
          "結案檢視",
          "專案封存前比較預估與實際投入。",
        ],
      ],
      recruiter: {
        team: ["Solo product · Real freelance use", "個人產品 · 真實接案使用"],
        delivery: [
          "In active use · First usable version in 2 days",
          "實際使用中 · 2 天完成首個可用版本",
        ],
        metric: [
          "Identified 18% under-estimated effort across three projects",
          "於三個專案辨識出 18% 低估工時",
        ],
        cross: [
          [
            "Project records became comparable at closure.",
            "專案紀錄在結案時可直接比較。",
          ],
          [
            "Revision work became visible alongside deliverables.",
            "修改工作與交付內容能一起被看見。",
          ],
          [
            "Future estimates could reference completed-project evidence.",
            "未來估時可引用已結案專案證據。",
          ],
        ],
        reflection: [
          "Next, test a lightweight estimate-quality score without adding daily logging burden.",
          "下一步測試輕量估時品質分數，同時避免增加每日紀錄負擔。",
        ],
      },
      scale: "Freelance tracking and project closure",
      scale_zh: "接案追蹤與專案結案",
      card_outcome:
        "A useful closing system shipped in two days and refined through real work.",
      card_outcome_zh: "兩天上線可用結案系統，並透過真實工作持續調整。",
      domain_proof:
        "The smallest useful workflow refined through real freelance use.",
      domain_proof_zh: "透過真實接案修正的最小可用流程。",
      search_relevance:
        "A 0→1 workflow built quickly, then improved through active freelance use.",
      search_relevance_zh: "快速建立 0→1 流程，再透過真實接案持續優化。",
    },
    booking: {
      context: "Booking.com · Global product rollout",
      context_zh: "Booking.com · 全球產品上線",
      home_title: "Market conflicts were resolved before global release.",
      home_title_zh: "市場衝突在全球發布前被解決。",
      transformation: "From global rollout to market-ready launch.",
      transformation_zh: "從全球上線到市場就緒。",
      problem_types: [
        "Global product rollout",
        "Localization constraints",
        "Launch readiness",
      ],
      problem_types_zh: ["全球產品上線", "在地化限制", "上線準備度"],
      summary:
        "A product launching across 40+ countries required simultaneous validation of language, content, colour, and market-specific usability constraints.",
      summary_zh:
        "產品需於 40+ 國家同步上線，因此必須同時驗證語言、內容、色彩與各市場使用限制。",
      role: "Product Designer",
      role_zh: "產品設計師",
      owned:
        "Experience design · Cross-market validation · Research-insight toolkit · Weekly design sessions · Launch-readiness QA",
      owned_zh:
        "體驗設計 · 跨市場驗證 · 研究洞察工具 · 每週設計分享 · 上線準備度 QA",
      decision:
        "Treat localisation conflicts as product constraints before release, not post-launch translation fixes.",
      decision_zh: "在發布前把在地化衝突視為產品限制，而不是上線後的翻譯修補。",
      evidence:
        "Market-readiness matrix · Content conflict log · Visual constraint review",
      evidence_zh: "市場準備度矩陣 · 內容衝突紀錄 · 視覺限制檢查",
      status: "In-house product work · Global rollout",
      status_zh: "內部產品經驗 · 全球上線",
      at_glance:
        "Led UX strategy and cross-market design for a taxi-booking journey, resolving localisation constraints before rollout across 40+ countries and contributing to a 7% conversion uplift in two weeks.",
      at_glance_zh:
        "主導計程車預訂旅程的 UX 策略與跨市場設計，在 40+ 國家上線前解決在地化限制，並於兩週內帶來 7% 轉換提升。",
      type: "Marketplace Platform",
      scope:
        "Launch-readiness validation across language, content, colour, and market constraints",
      scope_zh: "涵蓋語言、內容、色彩與市場限制的上線準備度驗證",
      audience:
        "Primary: Travellers\nSecondary: Localisation, product, engineering, market teams",
      audience_zh: "主要：旅客\n次要：在地化、產品、工程與市場團隊",
      timeline: "2-week optimisation cycle",
      timeline_zh: "2 週優化週期",
      why: "A design that worked in one market could fail elsewhere because of language conflicts, cultural meaning, visual conventions, or local product constraints.",
      why_zh:
        "在單一市場有效的設計，可能因語言衝突、文化語意、視覺慣例或在地產品限制而在其他市場失效。",
      impact:
        "Reduced avoidable launch risk by making market-specific conflicts visible before release.",
      impact_zh: "在發布前讓市場特定衝突可見，降低可避免的上線風險。",
      hard: [
        "Forty-plus countries needed to be assessed in parallel.",
        "Content and colour could carry conflicting meaning in specific markets.",
        "Issues had to be resolved without fragmenting the shared product experience.",
      ],
      hard_zh: [
        "需要同步評估 40+ 國家。",
        "內容與色彩在特定市場可能產生衝突語意。",
        "問題必須被解決，同時不能讓共用產品體驗碎片化。",
      ],
      decisions: [
        {
          title: "Create one cross-market readiness matrix",
          title_zh: "建立單一跨市場準備度矩陣",
          why: "Made launch constraints comparable across countries.",
          why_zh: "讓不同國家的上線限制可以被比較。",
          alternative:
            "Alternative considered — track issues independently by market.",
          alternative_zh: "曾考慮方案 — 各市場分開追蹤問題。",
          tradeoff:
            "Trade-off — required a shared taxonomy before validation began.",
          tradeoff_zh: "取捨 — 驗證開始前必須先建立共用分類。",
          result:
            "Product, localisation, and market teams reviewed conflicts through one shared readiness model.",
          result_zh: "產品、在地化與市場團隊透過同一準備度模型檢視衝突。",
        },
        {
          title: "Treat content conflict as a product issue",
          title_zh: "把內容衝突視為產品問題",
          why: "Prevented market-specific language failures from being dismissed as translation details.",
          why_zh: "避免市場特定語言失效被視為單純翻譯細節。",
          alternative:
            "Alternative considered — resolve copy after interface approval.",
          alternative_zh: "曾考慮方案 — 介面核准後再處理文案。",
          tradeoff:
            "Trade-off — content review entered the design cycle earlier.",
          tradeoff_zh: "取捨 — 內容檢查必須更早進入設計週期。",
          result:
            "Conflicting language was identified before release rather than after market launch.",
          result_zh: "衝突文字在發布前被辨識，而不是市場上線後才發現。",
        },
        {
          title: "Validate visual meaning, not only visual consistency",
          title_zh: "驗證視覺語意，而不只視覺一致性",
          why: "Colour and interaction conventions could change meaning across markets.",
          why_zh: "色彩與互動慣例在不同市場可能改變語意。",
          alternative:
            "Alternative considered — enforce one visual treatment globally.",
          alternative_zh: "曾考慮方案 — 全球強制使用單一視覺處理。",
          tradeoff:
            "Trade-off — selected exceptions needed documented rationale.",
          tradeoff_zh: "取捨 — 特定例外需要記錄清楚依據。",
          result:
            "Market-specific visual conflicts were resolved without abandoning the shared product system.",
          result_zh: "在不放棄共用產品系統的前提下解決市場特定視覺衝突。",
        },
      ],
      led: [
        "Experience design",
        "Cross-market validation",
        "Launch-readiness QA",
        "Issue resolution",
      ],
      led_zh: ["體驗設計", "跨市場驗證", "上線準備度 QA", "問題解決"],
      contributed: [
        "Localisation review",
        "Engineering feasibility",
        "Market coordination",
        "Release validation",
      ],
      contributed_zh: ["在地化檢查", "工程可行性", "市場協作", "發布驗證"],
      gallery: [
        [
          "Cross-market readiness matrix",
          "One shared view tracks content, visual, and usability constraints across launch markets.",
          "跨市場準備度矩陣",
          "以單一視圖追蹤各上線市場的內容、視覺與可用性限制。",
        ],
        [
          "Content conflict review",
          "Market-specific language conflicts are identified before release.",
          "內容衝突檢查",
          "市場特定語言衝突在發布前被辨識。",
        ],
        [
          "Visual constraint resolution",
          "Colour and interaction exceptions are documented without fragmenting the shared system.",
          "視覺限制解決",
          "記錄色彩與互動例外，同時避免共用系統碎片化。",
        ],
      ],
      recruiter: {
        team: [
          "Product · Localisation · Engineering · Market teams",
          "產品 · 在地化 · 工程 · 市場團隊",
        ],
        delivery: [
          "Product launched across 40+ countries · Research-sharing toolkit used by designers and researchers",
          "產品於 40+ 國家上線 · 設計師與研究員使用研究分享工具",
        ],
        metric: [
          "Research sharing report reduced from 3–5 days to 2 days",
          "研究分享報告由通常 3–5 天縮短至 2 天",
        ],
        cross: [
          [
            "I built a toolkit that combined user-testing, data-mining, and research insights into a repeatable reporting workflow.",
            "我建立工具，將使用者測試、資料分析與研究洞察整合成可重複的報告流程。",
          ],
          [
            "Designers and researchers could complete a sharing report in 2 days instead of the usual 3–5 days.",
            "設計師與研究員能在 2 天內完成分享報告，取代通常需要的 3–5 天。",
          ],
          [
            "Weekly design sessions shared research findings and solution rationale with the team, especially engineering colleagues.",
            "每週設計分享把研究發現與解法依據帶給團隊，尤其是工程夥伴。",
          ],
        ],
        reflection: [
          "Next, validate which market exceptions can become reusable design-system guidance.",
          "下一步驗證哪些市場例外可轉化為可重用設計系統指引。",
        ],
      },
      scale: "40+ countries · Simultaneous launch-readiness validation",
      scale_zh: "40+ 國家 · 同步上線準備度驗證",
      card_outcome:
        "Launch conflicts surfaced before release across 40+ countries.",
      card_outcome_zh: "在 40+ 國家發布前找出上線衝突。",
      domain_proof: "Market-readiness validation before a 40+ country launch.",
      domain_proof_zh: "在 40+ 國家上線前完成市場準備度驗證。",
      search_relevance:
        "Global rollout readiness across language, content, colour, and market constraints.",
      search_relevance_zh: "處理語言、內容、色彩與市場限制下的全球上線準備度。",
    },
    bandzo: {
      context: "Learning platforms · Music practice",
      context_zh: "學習平台 · 音樂練習",
      home_title: "Practice needed a clearer next step.",
      home_title_zh: "練習需要更清楚的下一步。",
      transformation: "From lesson content to confident piano practice.",
      transformation_zh: "從課程內容到更有信心的鋼琴練習。",
      problem_types: [
        "Learning platforms",
        "Practice guidance",
        "Cross-device learning",
      ],
      problem_types_zh: ["學習平台", "練習引導", "跨裝置學習"],
      summary:
        "A piano-learning experience across app and tablet needed to connect lesson progression, practice feedback, and the next useful action.",
      summary_zh:
        "跨 App 與平板的鋼琴學習體驗，需要連結課程進度、練習回饋與下一個有用行動。",
      role: "Product Designer",
      role_zh: "產品設計師",
      owned:
        "Problem framing · Learning flow · Interaction design · Prototyping",
      owned_zh: "問題定義 · 學習流程 · 互動設計 · 原型",
      decision:
        "Design around real practice conditions—not only lesson delivery.",
      decision_zh: "以真實練習情境為核心，而不只是提供課程內容。",
      evidence: "Lesson progression · Practice guidance · Feedback model",
      evidence_zh: "課程進度 · 練習引導 · 回饋模型",
      status: "Project case · Details to verify",
      status_zh: "專案案例 · 細節待確認",
      at_glance:
        "Designed a piano-learning experience across app and tablet, connecting lesson progression, practice feedback, and next actions so learners could continue with more confidence.",
      at_glance_zh:
        "設計跨 App 與平板的鋼琴學習體驗，連結課程進度、練習回饋與下一步，讓學習者能更有信心地持續練習。",
      type: "0→1 Product",
      scope:
        "Lesson discovery, guided practice, feedback, progress, and app–tablet continuity",
      scope_zh: "涵蓋課程探索、引導練習、回饋、進度與 App／平板連續性",
      audience:
        "Primary: Piano learners\nSecondary: Learning-content and support teams",
      audience_zh: "主要：鋼琴學習者\n次要：學習內容與支援團隊",
      timeline: "To verify",
      timeline_zh: "待確認",
      why: "Learning content alone did not ensure learners knew what to practise next, how to recover from mistakes, or whether progress was meaningful.",
      why_zh:
        "只有課程內容，仍無法確保學習者知道下一步要練什麼、如何從錯誤中恢復，以及進步是否有意義。",
      impact:
        "Established a clearer learning model connecting lesson progression, practice feedback, and next actions.",
      impact_zh: "建立更清楚的學習模型，連結課程進度、練習回饋與下一步。",
      hard: [
        "Learners practised at different skill levels, speeds, and confidence levels.",
        "The experience had to support a real piano, tablet interaction, and lesson content at the same time.",
        "Feedback needed to guide recovery without making mistakes feel punitive.",
      ],
      hard_zh: [
        "學習者的程度、速度與信心不同。",
        "體驗需要同時支援真實鋼琴、平板互動與課程內容。",
        "回饋需要引導修正，同時避免讓錯誤帶來懲罰感。",
      ],
      decisions: [
        {
          title: "Make the next practice action explicit",
          title_zh: "讓下一個練習行動明確可見",
          why: "Reduced uncertainty after each lesson or practice attempt.",
          why_zh: "降低每次課程或練習後的不確定性。",
          alternative:
            "Alternative considered — rely on learners to navigate the full lesson catalogue.",
          alternative_zh: "曾考慮方案 — 讓學習者自行瀏覽完整課程目錄。",
          tradeoff:
            "Trade-off — required a clearer progression model before adding more content.",
          tradeoff_zh: "取捨 — 在增加更多內容前，需要先建立更清楚的進度模型。",
          result:
            "Each state connected the learner to one useful next practice action.",
          result_zh: "每個狀態都把學習者連結到一個有用的下一步練習。",
        },
        {
          title: "Turn mistakes into recoverable guidance",
          title_zh: "把錯誤轉化為可復原的引導",
          why: "Supported confidence while still making feedback actionable.",
          why_zh: "在維持信心的同時，讓回饋仍可採取行動。",
          alternative:
            "Alternative considered — show only pass or fail feedback.",
          alternative_zh: "曾考慮方案 — 只顯示成功或失敗。",
          tradeoff:
            "Trade-off — feedback states needed more nuance and content coordination.",
          tradeoff_zh: "取捨 — 回饋狀態需要更細緻，並增加內容協作。",
          result:
            "Feedback identified what happened and offered a clear way to try again.",
          result_zh: "回饋說明發生了什麼，並提供清楚的再次嘗試方式。",
        },
        {
          title: "Preserve continuity between app, tablet, and piano",
          title_zh: "維持 App、平板與鋼琴之間的連續性",
          why: "Learning was distributed across content, device interaction, and physical practice.",
          why_zh: "學習分散於內容、裝置互動與實體練習之間。",
          alternative:
            "Alternative considered — optimise each surface independently.",
          alternative_zh: "曾考慮方案 — 分別最佳化每個介面。",
          tradeoff:
            "Trade-off — required shared progress and state definitions across devices.",
          tradeoff_zh: "取捨 — 需要跨裝置共享進度與狀態定義。",
          result:
            "Learners could understand where they were and what to do next across the experience.",
          result_zh: "學習者能在整個體驗中理解目前進度與下一步。",
        },
      ],
      led: [
        "Problem framing",
        "Learning journey",
        "Interaction design",
        "Prototyping",
      ],
      led_zh: ["問題定義", "學習旅程", "互動設計", "原型"],
      contributed: [
        "Learning-content model",
        "Technical feasibility",
        "Validation planning",
      ],
      contributed_zh: ["學習內容模型", "技術可行性", "驗證規劃"],
      gallery: [
        [
          "Lesson-to-practice progression",
          "Lessons connect directly to the next useful practice action.",
          "課程到練習的進度",
          "課程直接連結到下一個有用的練習行動。",
        ],
        [
          "Supportive feedback states",
          "Feedback explains what happened and how to recover without breaking confidence.",
          "支持性的回饋狀態",
          "回饋說明發生了什麼，以及如何修正，同時不破壞信心。",
        ],
        [
          "Cross-device learning continuity",
          "Progress and next actions remain understandable across app, tablet, and physical practice.",
          "跨裝置學習連續性",
          "進度與下一步在 App、平板與實體練習之間保持清楚。",
        ],
      ],
      recruiter: {
        team: ["To verify", "待確認"],
        delivery: [
          "App and tablet learning experience · Details to verify",
          "App 與平板學習體驗 · 細節待確認",
        ],
        metric: ["Observed outcome to verify", "觀察結果待確認"],
        cross: [
          [
            "Learning content and interaction states were organised around one progression model.",
            "學習內容與互動狀態依同一套進度模型整理。",
          ],
          [
            "Feedback states connected instructional intent with a recoverable learner action.",
            "回饋狀態把教學意圖連結到可復原的學習行動。",
          ],
          [
            "App and tablet surfaces referenced shared progress and next-action definitions.",
            "App 與平板介面共用進度與下一步定義。",
          ],
        ],
        reflection: [
          "Next, validate the model across learner skill levels and real practice environments.",
          "下一步，跨不同程度學習者與真實練習環境驗證此模型。",
        ],
      },
      scale: "App + tablet · Piano learning journey",
      scale_zh: "App + 平板 · 鋼琴學習旅程",
      card_outcome: "A clearer path from lesson content to confident practice.",
      card_outcome_zh: "建立從課程內容到有信心練習的清楚路徑。",
      domain_proof:
        "Practice guidance and recovery for real learning conditions.",
      domain_proof_zh: "支援真實學習情境的練習引導與復原。",
      search_relevance:
        "Practice, feedback, recovery, and progress across a real piano-learning journey.",
      search_relevance_zh: "處理真實鋼琴學習旅程中的練習、回饋、復原與進度。",
    },
  },
  experiments: {
    memory: {
      category: ["Personal product", "個人產品"],
      title: ["Life Decision Memory", "人生決策記憶庫"],
      status: [
        "Concept prototype · No commercial outcome claimed",
        "概念原型 · 不宣稱商業成果",
      ],
      question: [
        "How might small daily choices become a long-term personal feedback system?",
        "如何把每日小選擇轉化為長期個人回饋系統？",
      ],
      summary: [
        "A private decision memory that learns from lightweight daily choices instead of asking users to maintain a journal.",
        "以輕量每日選擇學習的私密決策記憶，不要求使用者持續寫日記。",
      ],
      prototype: [
        "Swipe-based daily choices, evolving pattern summaries, and a private personal memory layer.",
        "左右滑每日選擇、逐步演化的模式摘要與私密個人記憶層。",
      ],
      learning: [
        "The product must give immediate value before asking for long-term commitment.",
        "產品必須在要求長期投入前先提供立即價值。",
      ],
      next: [
        "Test whether five visual choices can produce a useful, non-deterministic reflection.",
        "測試五個視覺選擇是否能產生有用且非決定論的回饋。",
      ],
      timeline: ["2-week concept sprint", "2 週概念衝刺"],
      gallery: [
        [
          ["Daily choice ritual", "每日選擇儀式"],
          [
            "A five-minute visual choice flow lowers the effort required to contribute personal signals.",
            "五分鐘視覺選擇流程降低提供個人訊號的負擔。",
          ],
        ],
        [
          ["Pattern memory", "模式記憶"],
          [
            "Repeated choices form an evolving pattern summary rather than a fixed personality label.",
            "重複選擇形成持續演化的模式摘要，而非固定人格標籤。",
          ],
        ],
        [
          ["Private reflection", "私密回饋"],
          [
            "The system explains what changed and preserves user control over retained memories.",
            "系統解釋發生的變化，並保留使用者對記憶的控制。",
          ],
        ],
      ],
    },
    chat: {
      category: ["Conversation product", "對話產品"],
      title: ["Five-minute bedtime chat", "五分鐘睡前聊天"],
      status: [
        "Early product hypothesis · No commercial outcome claimed",
        "早期產品假設 · 不宣稱商業成果",
      ],
      question: [
        "How might a daily conversation ritual stay compact enough to continue?",
        "如何讓每日對話儀式足夠精簡，能持續使用？",
      ],
      summary: [
        "One focused prompt per night, designed to create a meaningful exchange in under five minutes.",
        "每晚一個聚焦問題，設計成五分鐘內完成有意義的交流。",
      ],
      prototype: [
        "Daily prompt, two-person turn-taking, saved highlights, and a gentle closing state.",
        "每日提問、雙人輪流回答、重點保存與柔和結束狀態。",
      ],
      learning: [
        "Sustainability depends more on ritual boundaries than on content volume.",
        "能否持續更取決於儀式邊界，而不是內容數量。",
      ],
      next: [
        "Test whether a single shared question produces enough emotional value over seven days.",
        "測試單一共享問題在七天內是否能產生足夠情緒價值。",
      ],
      timeline: ["7-day prototype test", "7 天原型測試"],
      gallery: [
        [
          ["One prompt", "一個提問"],
          [
            "The experience begins with one specific question rather than an open-ended chat box.",
            "體驗從一個具體問題開始，而不是開放式聊天框。",
          ],
        ],
        [
          ["Turn-taking", "輪流回答"],
          [
            "Clear turns reduce pressure and make participation feel balanced.",
            "清楚輪流降低壓力，讓參與感更平衡。",
          ],
        ],
        [
          ["Gentle close", "柔和結束"],
          [
            "A visible ending protects the five-minute promise and supports habit formation.",
            "清楚結束保護五分鐘承諾並支援習慣形成。",
          ],
        ],
      ],
    },
    story: {
      category: ["Story system", "故事系統"],
      title: ["Emotion to Story", "情緒轉故事"],
      status: [
        "Creative system exploration · No commercial outcome claimed",
        "創意系統探索 · 不宣稱商業成果",
      ],
      question: [
        "How might lived emotion become narrative, music, and moving images without becoming generic AI content?",
        "如何把真實情緒轉化為敘事、音樂與動態影像，同時避免成為制式 AI 內容？",
      ],
      summary: [
        "An authored pipeline that converts one emotional truth into lyrics, scenes, music direction, and visual continuity.",
        "把一個情緒真相轉化為歌詞、場景、音樂方向與視覺連續性的作者式流程。",
      ],
      prototype: [
        "Emotion map, narrative beats, musical motif, storyboard, and visual continuity checks.",
        "情緒地圖、敘事節點、音樂動機、分鏡與視覺連續性檢查。",
      ],
      learning: [
        "AI output becomes more distinctive when the human decision framework is explicit.",
        "當人的決策框架明確時，AI 輸出會更具辨識度。",
      ],
      next: [
        "Test a repeatable continuity rubric across one complete music-story sequence.",
        "在一段完整音樂故事序列中測試可重複的連續性評分準則。",
      ],
      timeline: ["4-week creative prototype", "4 週創意原型"],
      gallery: [
        [
          ["Emotion map", "情緒地圖"],
          [
            "The system begins with emotional direction and narrative tension, not visual generation.",
            "系統從情緒方向與敘事張力開始，而不是先生成視覺。",
          ],
        ],
        [
          ["Scene continuity", "場景連續性"],
          [
            "Each frame is evaluated against lyrics, viewpoint, character consistency, and emotional progression.",
            "每一幀依歌詞、視角、角色一致性與情緒進展檢查。",
          ],
        ],
        [
          ["Music-to-image rhythm", "音樂到影像節奏"],
          [
            "Visual timing follows musical phrasing so motion supports meaning rather than decoration.",
            "視覺節奏跟隨音樂樂句，讓動態支援意義而非裝飾。",
          ],
        ],
      ],
    },
    "ai-assistant": {
      category: ["AI interaction", "AI 互動"],
      title: ["Human-controlled Decision Assistant", "人類可控決策助理"],
      status: [
        "Interaction prototype · No production outcome claimed",
        "互動原型 · 不宣稱正式產品成果",
      ],
      question: [
        "How might AI reduce case synthesis without removing human decision ownership?",
        "AI 如何降低案件整理負擔，同時不移除人的決策責任？",
      ],
      summary: [
        "An operational assistant that summarises evidence, flags missing information, and proposes next actions with source, reason, and uncertainty.",
        "營運助理整理證據、標示缺漏資訊，並以來源、理由與不確定性提出下一步。",
      ],
      prototype: [
        "Case summary, source trace, uncertainty state, editable recommendation, approval, escalation, and undo.",
        "案件摘要、來源追溯、不確定狀態、可編輯建議、核准、升級與復原。",
      ],
      learning: [
        "Trust depends on calibrated control and recoverability, not a confident conversational tone.",
        "信任取決於校準過的控制與可復原性，而不是自信的對話語氣。",
      ],
      next: [
        "Test correction rate, decision quality, and trust calibration with operational users.",
        "與營運使用者測試修正率、決策品質與信任校準。",
      ],
      timeline: ["10-day interaction prototype", "10 天互動原型"],
      gallery: [
        [
          ["Traceable summary", "可追溯摘要"],
          [
            "Every generated statement links back to its supporting source.",
            "每個生成陳述都能連回支援來源。",
          ],
        ],
        [
          ["Visible uncertainty", "可見不確定性"],
          [
            "Low-confidence and conflicting evidence states require review instead of silent automation.",
            "低信心與證據衝突狀態要求人工檢視，而非靜默自動化。",
          ],
        ],
        [
          ["Human approval and recovery", "人工核准與復原"],
          [
            "Users can edit, reject, escalate, retry, and undo before the system acts.",
            "使用者可在系統執行前編輯、拒絕、升級、重試與復原。",
          ],
        ],
      ],
    },
  },
  matcher: {
    exception: {
      title: [
        "Make the normal path simple—and design exceptions explicitly.",
        "讓正常路徑保持簡單，並明確設計例外。",
      ],
      explain: [
        "Separate repeatable steps from exception logic, then define ownership, escalation, and decision states.",
        "把可重複步驟與例外邏輯分開，再定義責任、升級與決策狀態。",
      ],
      why: [
        "Operational consistency depends on shared states, not more screens.",
        "營運一致性取決於共享狀態，而不是更多畫面。",
      ],
      caps: [
        "Operational modelling",
        "Exception handling",
        "Ownership states",
        "Escalation logic",
      ],
      projects: ["dbs", "hours"],
    },
    voucher: {
      title: [
        "You need reusable incentive logic—not one-off campaign screens.",
        "你需要可重用的獎勵邏輯，而不是一次性的活動畫面。",
      ],
      explain: [
        "Connect discovery, eligibility, claim, redemption, supplier funding, and campaign setup into reusable capabilities.",
        "把探索、資格、領取、兌換、供應商出資與活動設定連結成可重用能力。",
      ],
      why: [
        "Fragmented promotion mechanics become a scalable incentive ecosystem across channels.",
        "讓分散的促銷機制轉化為可跨通路擴展的獎勵生態系。",
      ],
      caps: [
        "Incentive taxonomy",
        "Eligibility states",
        "Redemption logic",
        "Campaign modules",
      ],
      projects: ["voucher", "hours"],
    },
    global: {
      title: [
        "Treat global rollout as a product constraint—not a translation task.",
        "把全球上線視為產品限制，而不是翻譯工作。",
      ],
      explain: [
        "Validate language, content, colour, and interaction readiness across 40+ countries before release.",
        "發布前驗證 40+ 國家的語言、內容、色彩與互動可行性。",
      ],
      why: [
        "Market conflicts found before launch reduce avoidable release risk.",
        "在上線前找出市場衝突，可降低可避免的發布風險。",
      ],
      caps: [
        "Launch readiness",
        "Localization QA",
        "Market constraints",
        "Cross-country validation",
      ],
      projects: ["booking", "dbs"],
    },
    systems: {
      title: [
        "Connect the operating model before connecting more tools.",
        "先連結營運模型，再連結更多工具。",
      ],
      explain: [
        "Define shared states, ownership, evidence, and handoffs so tools support one operating model instead of becoming the operating model.",
        "先定義共享狀態、責任、證據與交接，讓工具支援同一營運模型，而不是讓工具本身成為營運模型。",
      ],
      why: [
        "Disconnected tools create hidden coordination work and inconsistent decisions.",
        "工具斷裂會產生隱性協作成本與不一致決策。",
      ],
      caps: [
        "System framing",
        "Workflow architecture",
        "State modelling",
        "Delivery alignment",
      ],
      projects: ["hours", "dbs"],
    },
    learning: {
      title: [
        "Design the practice journey—not only the lesson library.",
        "設計練習旅程，而不只是課程目錄。",
      ],
      explain: [
        "Connect progression, guided practice, supportive feedback, and cross-device continuity so learners know what to do next.",
        "連結進度、引導練習、支持性回饋與跨裝置連續性，讓學習者知道下一步。",
      ],
      why: [
        "Learning confidence depends on clear next actions and recoverable feedback in real practice conditions.",
        "學習信心取決於真實練習情境中的清楚下一步與可復原回饋。",
      ],
      caps: [
        "Learning journey",
        "Practice guidance",
        "Feedback states",
        "Cross-device continuity",
      ],
      projects: ["bandzo"],
    },
    zero: {
      title: [
        "Start from analogous behaviour—then learn in use.",
        "從相似行為出發，再透過真實使用修正。",
      ],
      explain: [
        "Study the motivation and decision logic behind comparable behaviours, translate them into the smallest useful product model, then refine it through observed use, hesitation, failure, and recovery.",
        "研究可借鏡行為背後的動機與決策邏輯，轉化為最小可用的產品模型，再依實際使用、猶豫、失敗與復原持續修正。",
      ],
      why: [
        "A 0→1 product still needs evidence before stable usage patterns exist. Analogous behaviour provides a grounded starting point without copying an existing interface.",
        "0→1 產品在穩定使用模式形成前仍需要依據；相似行為能提供有根據的起點，而不是複製既有介面。",
      ],
      caps: [
        "Analogous behaviour analysis",
        "0→1 product framing",
        "Rapid prototyping",
        "Behaviour-led iteration",
      ],
      projects: ["hours", "bandzo"],
    },
  },
  domains: {
    finance: {
      name: ["Financial services", "金融服務"],
      synthesis: [
        "The difficult part is rarely the form itself. It is coordinating roles, eligibility, consent, exceptions, and operational ownership.",
        "真正困難的通常不是表單，而是協調角色、資格、同意、例外與營運責任。",
      ],
      nodes: [
        ["Applicant", "Consent", "Shared state"],
        ["申請人", "同意", "共享狀態"],
      ],
      problems: [
        [
          "Multi-person application state",
          "Regulatory and identity constraints",
          "Exception handling across channels",
        ],
        ["多人申請狀態", "監管與身分限制", "跨通路例外處理"],
      ],
      solutions: [
        [
          "Make role and status visible",
          "Model exceptions before polishing the ideal flow",
          "Align user progress with operational progress",
        ],
        [
          "讓角色與狀態可見",
          "先建模例外，再美化理想流程",
          "對齊使用者與營運進度",
        ],
      ],
      projects: ["dbs"],
      focus: ["Roles · Consent · Exceptions", "角色 · 同意 · 例外"],
    },
    operations: {
      name: ["Enterprise operations", "企業營運"],
      synthesis: [
        "Operational products fail when ownership, shared states, and escalation remain implicit.",
        "當責任、共享狀態與升級機制仍是隱性的，營運產品就會失效。",
      ],
      nodes: [
        ["Request", "Ownership", "Next action"],
        ["請求", "責任", "下一步"],
      ],
      problems: [
        ["Fragmented tools", "Unclear handoffs", "Manual interpretation"],
        ["工具分散", "交接不清", "依賴人工解讀"],
      ],
      solutions: [
        [
          "Create one operating model",
          "Expose ownership at every state",
          "Define recovery and escalation",
        ],
        ["建立單一營運模型", "在每個狀態顯示責任", "定義復原與升級"],
      ],
      projects: ["dbs", "hours"],
      focus: ["Ownership · States · Escalation", "責任 · 狀態 · 升級"],
    },
    growth: {
      name: ["Growth & incentive systems", "成長與獎勵系統"],
      synthesis: [
        "The challenge is turning campaign mechanics into reusable capabilities without losing commercial flexibility.",
        "挑戰是把活動機制轉成可重用能力，同時保留商業彈性。",
      ],
      nodes: [
        ["Discovery", "Reusable rules", "Redemption"],
        ["探索", "可重用規則", "兌換"],
      ],
      problems: [
        [
          "One-off campaigns",
          "Conflicting eligibility",
          "Partner coordination",
        ],
        ["一次性活動", "資格衝突", "夥伴協作"],
      ],
      solutions: [
        [
          "Separate rules from presentation",
          "Model eligibility and redemption states",
          "Share one programme model",
        ],
        ["把規則與呈現分開", "建立資格與兌換狀態", "共享單一方案模型"],
      ],
      projects: ["voucher"],
      focus: ["Eligibility · Redemption · Partners", "資格 · 兌換 · 夥伴"],
    },
    travel: {
      name: ["Travel marketplaces", "旅遊市場平台"],
      focus: [
        "Market readiness · Localisation · Release",
        "市場準備度 · 在地化 · 發布",
      ],
      synthesis: [
        "Global travel products must resolve language, content, colour, and interaction constraints before release—not after translation begins.",
        "全球旅遊產品必須在發布前解決語言、內容、色彩與互動限制，而不是翻譯開始後才處理。",
      ],
      nodes: [
        ["Market constraint", "Launch readiness", "Global release"],
        ["市場限制", "上線準備度", "全球發布"],
      ],
      problems: [
        [
          "Language and content conflicts",
          "Market-specific usability constraints",
          "Simultaneous release coordination",
        ],
        ["語言與內容衝突", "市場特定可用性限制", "同步發布協調"],
      ],
      solutions: [
        [
          "Treat localisation as product design",
          "Validate conflicts before release",
          "Create reusable readiness criteria",
        ],
        ["把在地化視為產品設計", "發布前驗證衝突", "建立可重用的準備度標準"],
      ],
      projects: ["booking"],
    },
    commerce: {
      name: ["Retail & commerce", "零售與商務"],
      focus: ["Offers · Value exchange · Operations", "優惠 · 價值交換 · 營運"],
      synthesis: [
        "Commerce experiences connect discovery, eligibility, value exchange, partner funding, and operational fulfilment—not only the purchase screen.",
        "商務體驗連結探索、資格、價值交換、夥伴出資與營運履行，而不只是購買畫面。",
      ],
      nodes: [
        ["Offer discovery", "Eligibility", "Value exchange"],
        ["優惠探索", "資格", "價值交換"],
      ],
      problems: [
        [
          "Fragmented offer mechanics",
          "Eligibility mismatch",
          "Partner and operations handoffs",
        ],
        ["優惠機制分散", "資格不一致", "夥伴與營運交接"],
      ],
      solutions: [
        [
          "Create one offer model",
          "Make eligibility explicit",
          "Connect customer and fulfilment states",
        ],
        ["建立單一優惠模型", "讓資格條件明確", "連結顧客與履行狀態"],
      ],
      projects: ["voucher"],
    },
    learning: {
      name: ["Learning platforms", "學習平台"],
      focus: ["Practice · Feedback · Progress", "練習 · 回饋 · 進度"],
      synthesis: [
        "Learning products must support real practice conditions: different skill levels, devices, mistakes, pacing, and confidence—not only deliver content.",
        "學習產品需要支援真實練習情境：不同程度、裝置、錯誤、節奏與信心，而不只是提供內容。",
      ],
      nodes: [
        ["Lesson", "Guided practice", "Confident progress"],
        ["課程", "引導練習", "有信心的進步"],
      ],
      problems: [
        [
          "Unclear next practice action",
          "Feedback that feels punitive or arrives too late",
          "Discontinuity across app, tablet, and physical practice",
        ],
        [
          "下一步練習不清楚",
          "回饋帶來懲罰感或出現太晚",
          "App、平板與實體練習之間斷裂",
        ],
      ],
      solutions: [
        [
          "Make progression and next action visible",
          "Turn mistakes into recoverable guidance",
          "Preserve progress and context across devices",
        ],
        [
          "讓進度與下一步可見",
          "把錯誤轉化為可復原的引導",
          "跨裝置維持進度與情境",
        ],
      ],
      projects: ["bandzo"],
    },
  },
};
