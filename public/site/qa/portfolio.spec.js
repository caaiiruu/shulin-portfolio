import { expect, test } from '@playwright/test';

const widths = [1440,900,768,430,375,320];
for (const width of widths) {
  test(`homepage reflow ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/index.html');
    await expect(page.locator('body')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await page.screenshot({path:testInfo.outputPath(`homepage-${width}.png`),fullPage:true});
  });
}

for (const width of [1440, 430, 320]) {
  test(`footer organic edge stays bounded and content remains unclipped ${width}`, async ({ page }) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/index.html');
    const geometry = await page.locator('.site-footer').evaluate((footer) => {
      const style = getComputedStyle(footer);
      const edge = getComputedStyle(footer, '::before');
      const contact = footer.querySelector('.contact-bar-v42').getBoundingClientRect();
      const footerBox = footer.getBoundingClientRect();
      return {
        clipPath: style.clipPath,
        edgeHeight: parseFloat(edge.height),
        contactTop: contact.top - footerBox.top,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(geometry.clipPath).toBe('none');
    expect(geometry.edgeHeight).toBeGreaterThanOrEqual(24);
    expect(geometry.edgeHeight).toBeLessThanOrEqual(49);
    expect(geometry.contactTop).toBeGreaterThanOrEqual(geometry.edgeHeight);
    expect(geometry.overflow).toBeLessThanOrEqual(1);
  });
}

test('text selection stays quiet and readable on light and dark surfaces', async ({page}) => {
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/index.html#principlesTitle');
  const result = await page.evaluate(() => {
    const selectionStyle = getComputedStyle(document.documentElement, '::selection');
    const heading = document.querySelector('#principlesTitle');
    const range = document.createRange();
    range.selectNodeContents(heading);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    return {
      background: selectionStyle.backgroundColor,
      color: selectionStyle.color,
      selectedText: selection.toString()
    };
  });
  expect(result.background).toBe('rgb(220, 238, 242)');
  expect(result.color).toBe('rgb(23, 27, 31)');
  expect(result.selectedText.length).toBeGreaterThan(0);
});

for (const width of [1419,871,430]) {
  test(`Principle Constellation remains operable at ${width}`, async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/index.html#principlesTitle');
    const constellation=page.locator('[data-principle-constellation]');
    await expect(constellation.locator('.principle-node')).toHaveCount(4);
    for (let index=0;index<4;index++) {
      const trigger=constellation.locator('.principle-node__trigger').nth(index);
      const before=await trigger.boundingBox();
      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(trigger).toHaveAttribute('aria-expanded','true');
      await expect(constellation.locator('.principle-node__panel:visible')).toHaveCount(1);
      const after=await constellation.locator('.principle-node__trigger').nth(index).boundingBox();
      if(width>700&&width<=900){
        expect(Math.abs(after.x-before.x)).toBeLessThanOrEqual(1);
        expect(Math.abs(after.y-before.y)).toBeLessThanOrEqual(1);
        expect(Math.abs(after.width-before.width)).toBeLessThanOrEqual(1);
      }
      if(width>900){
        const geometry=await constellation.evaluate(container=>({
          active:container.querySelector('.principle-node.is-active').getBoundingClientRect().toJSON(),
          side:[...container.querySelectorAll('.principle-node:not(.is-active)')].map(card=>card.getBoundingClientRect().toJSON())
        }));
        expect(geometry.side).toHaveLength(3);
        expect(geometry.side.every(card=>card.x>geometry.active.x&&card.width<geometry.active.width)).toBe(true);
        expect(geometry.side[0].y).toBeLessThan(geometry.side[1].y);
        expect(geometry.side[1].y).toBeLessThan(geometry.side[2].y);
      }
      await page.keyboard.press('Escape');
      await expect(constellation.locator('.principle-node__panel:visible')).toHaveCount(0);
    }
    const result=await constellation.evaluate(container=>{
      const cards=[...container.querySelectorAll('.principle-node')];
      return {
        overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        cards:cards.map(card=>({width:Math.round(card.getBoundingClientRect().width),title:card.querySelector('.principle-node__title').textContent.trim()}))
      };
    });
    expect(result.overflow).toBeLessThanOrEqual(1);
    expect(result.cards).toHaveLength(4);
    expect(result.cards.every(card=>card.width>0&&card.title.length>0)).toBe(true);
  });
}

test('playground controls keep a readable gap from the description',async({page})=>{
  await page.setViewportSize({width:430,height:900});
  await page.goto('/index.html');
  const gap=await page.evaluate(()=>{
    const copy=document.querySelector('.playground-head .body-copy').getBoundingClientRect();
    const controls=document.querySelector('.playground-controls').getBoundingClientRect();
    return Math.round(controls.top-copy.bottom);
  });
  expect(gap).toBeGreaterThanOrEqual(20);
});

test('search focus and same-session layout', async ({page},testInfo)=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/index.html');
  await expect(page.locator('#matcherResult')).toHaveAttribute('aria-hidden','true');
  await expect(page.locator('.matcher-workspace')).not.toHaveClass(/has-result/);
  await expect(page.locator('.matcher-workspace')).toHaveAttribute('data-matcher-state','idle');
  await expect(page.locator('#matcherResultContent')).toBeHidden();
  await page.locator('[data-match="global"]').click();
  await expect(page.locator('#matchResultAnnouncement')).toBeFocused();
  await expect(page.locator('.matcher-workspace')).toHaveAttribute('data-matcher-state','matched');
  await expect(page.locator('.matcher-workspace .chip-rail')).toBeHidden();
  await page.screenshot({path:testInfo.outputPath('search-result.png'),fullPage:true});
  const before=await page.locator('.matcher-query-panel').boundingBox();
  await page.locator('#matcherInput').focus();
  await expect(page.locator('#matcherInput')).toHaveCSS('box-shadow','none');
  await expect(page.locator('#matcherInput')).toHaveCSS('outline-style','none');
  await expect(page.locator('#matcherForm')).not.toHaveCSS('box-shadow','none');
  await expect(page.locator('.matcher-workspace')).toHaveClass(/is-search-focused/);
  await expect(page.locator('.chip-rail')).toBeVisible();
  await page.fill('#matcherInput','exception ownership escalation');
  await page.locator('#matcherForm button[type=submit]').click();
  await expect(page.locator('#matchResultAnnouncement')).toBeFocused();
  const after=await page.locator('.matcher-query-panel').boundingBox();
  expect(Math.abs(before.x-after.x)).toBeLessThan(2);
  const clearance=await page.evaluate(()=>{
    const panel=document.querySelector('.matcher-query-panel').getBoundingClientRect();
    const result=document.querySelector('#matcherResultContent').getBoundingClientRect();
    return Math.round(result.top-panel.bottom);
  });
  expect(clearance).toBeGreaterThanOrEqual(20);
  await expect(page.locator('#matchProjectRail [data-project]')).toHaveCount(2);
  await expect(page.locator('#matchProjectRail')).not.toHaveClass(/is-single/);
  await expect(page.locator('#matchProjectRail')).toHaveCSS('overflow-x','auto');
  await expect(page.locator('#matchProjectRail .related-project-card__visual-v45')).toHaveCount(0);
  await expect(page.locator('#matchProjectRail dt')).toHaveText(['Why it fits','Evidence','Why it fits','Evidence']);
});

for (const width of [900,430,320]) {
  test(`mobile search stays clear and resets to result start ${width}`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/index.html');
    await page.locator('[data-match="global"]').click();
    await expect(page.locator('#matchResultAnnouncement')).toBeFocused();
    await page.evaluate(()=>scrollBy(0,240));
    const stickyPosition=await page.evaluate(()=>{
      const header=document.querySelector('.site-header').getBoundingClientRect();
      const panel=document.querySelector('.matcher-query-panel').getBoundingClientRect();
      return Math.round(panel.top-header.bottom);
    });
    expect(Math.abs(stickyPosition)).toBeLessThanOrEqual(2);
    const firstClearance=await page.evaluate(()=>{
      const panel=document.querySelector('.matcher-query-panel').getBoundingClientRect();
      const target=document.querySelector('#matcherResultContent').getBoundingClientRect();
      return Math.round(target.top-panel.bottom);
    });
    expect(firstClearance).toBeGreaterThanOrEqual(20);
    await page.evaluate(()=>scrollBy(0,500));
    await page.locator('#matcherInput').fill('exception ownership escalation');
    await page.locator('#matcherForm button[type=submit]').click();
    await expect(page.locator('#matchResultAnnouncement')).toBeFocused();
    const resultPosition=await page.evaluate(()=>{
      const header=document.querySelector('.site-header').getBoundingClientRect();
      const panel=document.querySelector('.matcher-query-panel').getBoundingClientRect();
      const target=document.querySelector('#matcherResultContent').getBoundingClientRect();
      return {
        clearance:Math.round(target.top-Math.max(header.bottom,panel.bottom)),
        distanceFromExpected:Math.abs(Math.round(target.top-(Math.max(header.bottom,panel.bottom)+24)))
      };
    });
    expect(resultPosition.clearance).toBeGreaterThanOrEqual(20);
    expect(resultPosition.distanceFromExpected).toBeLessThanOrEqual(3);
    expect(await page.locator('#matchResultAnnouncement').evaluate(el=>Math.round(el.getBoundingClientRect().top))).toBeGreaterThan(0);
  });
}

test('search project evidence is full width only for a single project',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/index.html');
  await page.locator('[data-match="global"]').click();
  const rail=page.locator('#matchProjectRail');
  await rail.evaluate(node=>{
    const only=node.firstElementChild.cloneNode(true);
    node.replaceChildren(only);
    node.classList.add('is-single');
  });
  const [railBox,cardBox]=await Promise.all([rail.boundingBox(),rail.locator('[data-project]').boundingBox()]);
  expect(Math.abs(railBox.width-cardBox.width)).toBeLessThanOrEqual(2);
});

test('domain reset and mobile layout', async ({page},testInfo)=>{
  await page.setViewportSize({width:430,height:844});
  await page.goto('/index.html#domains');
  await expect(page.locator('#domainChipRail')).toBeVisible();
  await expect(page.locator('#domainChipRail')).toHaveCSS('overflow-x','auto');
  await page.locator('.domain-tab[data-domain="travel-platforms"]').click();
  await expect(page.locator('.domain-tab[data-domain="travel-platforms"]')).toHaveAttribute('aria-selected','true');
  await expect(page.locator('#domainName')).toContainText('Travel');
  const top=await page.locator('#domainStage').evaluate(el=>Math.round(el.getBoundingClientRect().top));
  expect(top).toBeGreaterThanOrEqual(60);
  await page.locator('#domainStage').scrollIntoViewIfNeeded();
  await page.evaluate(()=>scrollBy(0,240));
  await expect(page.locator('#domainFloatingNav')).toHaveClass(/is-visible/);
  await expect(page.locator('#domainFloatingNav')).toHaveAttribute('aria-hidden','false');
  await page.screenshot({path:testInfo.outputPath('domain-mobile.png'),fullPage:true});
});

test('domain desktop navigation remains sticky and keyboard operable',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/index.html#domains');
  await expect(page.locator('#domainFloatingNav')).toBeHidden();
  await expect(page.locator('.domain-intro')).toHaveCSS('position','sticky');
  const layout=await page.locator('.domain-layout').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
  expect(layout).toBe(2);
  const selectorBox=await page.locator('#domainChipRail').boundingBox();
  const stageBox=await page.locator('#domainStage').boundingBox();
  expect(selectorBox.x+selectorBox.width).toBeLessThan(stageBox.x);
  const initialDomainTop=await page.locator('.domain-layout').evaluate(el=>Math.round(el.getBoundingClientRect().top));
  await page.locator('.domain-tab[data-domain="financial-services"]').focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.domain-tab[data-domain="enterprise-operations"]')).toBeFocused();
  await expect(page.locator('.domain-tab[data-domain="enterprise-operations"]')).toHaveAttribute('aria-selected','true');
  await page.waitForTimeout(500);
  const switchedDomainTop=await page.locator('.domain-layout').evaluate(el=>Math.round(el.getBoundingClientRect().top));
  expect(Math.abs(switchedDomainTop-initialDomainTop)).toBeLessThanOrEqual(3);
});

test('popup reset and responsive impact', async ({page},testInfo)=>{
  await page.setViewportSize({width:900,height:900});
  await page.goto('/index.html');
  await page.locator('[data-project="dbs"]').first().click();
  await expect(page.locator('#detailDialog')).toBeVisible();
  expect(await page.locator('#detailDialog .dialog-scroll').evaluate(el=>el.scrollTop)).toBe(0);
  await page.locator('#detailDialog .dialog-scroll').evaluate(el=>el.scrollTop=el.scrollHeight);
  await page.locator('#detailRelatedRail [data-project]').first().click();
  expect(await page.locator('#detailDialog .dialog-scroll').evaluate(el=>el.scrollTop)).toBe(0);
  await page.screenshot({path:testInfo.outputPath('popup-impact.png'),fullPage:false});
});

for (const width of [1440,430,320]) {
  test(`project navigator targets every visible section ${width}`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/index.html?case=dbs');
    const scrollRoot=page.locator('#detailDialog .dialog-scroll');
    const nav=page.locator('#projectSectionNav');
    await expect(nav).toBeVisible();
    if(width<=700)await page.locator('#projectSectionNavToggle').click();
    for(const targetId of ['projectOverviewSection','projectComplexitySection','projectDecisionsSection','projectImpactSection']){
      if(width<=700&&!await page.locator('#projectSectionNav').evaluate(node=>node.classList.contains('is-open')))await page.locator('#projectSectionNavToggle').click();
      const link=page.locator(`#projectSectionNavLinks a[href="#${targetId}"]`);
      await link.click();
      await page.waitForTimeout(820);
      await expect(link).toHaveAttribute('aria-current','location');
      const targetTop=await page.locator(`#${targetId}`).evaluate(el=>Math.round(el.getBoundingClientRect().top));
      const controlsBottom=await page.locator('.dialog-controls-v67').evaluate(el=>Math.round(el.getBoundingClientRect().bottom));
      expect(Math.abs(targetTop-controlsBottom-24),`${targetId} at ${width}px`).toBeLessThanOrEqual(4);
      const headingTop=await page.locator(`#${targetId} :is(h2,h3)`).first().evaluate(el=>Math.round(el.getBoundingClientRect().top));
      expect(headingTop,`${targetId} heading remains visible at ${width}px`).toBeGreaterThanOrEqual(controlsBottom+24);
      expect(headingTop,`${targetId} heading remains in the first scan band at ${width}px`).toBeLessThan(controlsBottom+180);
    }
  });
}

for (const width of [1419,871,430]) {
  test(`project navigator keeps the final rapid click ${width}`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/work.html?case=dbs');
    if(width<=700)await page.locator('#projectSectionNavToggle').click();
    const overview=page.locator('#projectSectionNavLinks a[href="#projectOverviewSection"]');
    const complexity=page.locator('#projectSectionNavLinks a[href="#projectComplexitySection"]');
    await complexity.click();
    if(width<=700)await page.locator('#projectSectionNavToggle').click();
    await overview.click();
    if(width<=700)await page.locator('#projectSectionNavToggle').click();
    await complexity.click();
    await page.waitForTimeout(520);
    await expect(complexity).toHaveAttribute('aria-current','location');
    await expect(page.locator('#projectComplexitySection')).toBeFocused();
    const alignment=await page.locator('#projectComplexitySection').evaluate(el=>{
      const controls=document.querySelector('.dialog-controls-v67');
      return Math.round(el.getBoundingClientRect().top-controls.getBoundingClientRect().bottom-24);
    });
    expect(Math.abs(alignment)).toBeLessThanOrEqual(4);
  });
}

test('project navigator restores scroll-spy after keyboard scrolling and honours reduced motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:871,height:900});
  await page.goto('/work.html?case=dbs');
  const complexity=page.locator('#projectSectionNavLinks a[href="#projectComplexitySection"]');
  await complexity.click();
  await expect(complexity).toHaveAttribute('aria-current','location');
  await expect(page.locator('#projectComplexitySection')).toBeFocused();
  await page.locator('#detailDialog .dialog-scroll').press('Home');
  await page.waitForTimeout(80);
  await expect(page.locator('#projectSectionNavLinks a[href="#projectOverviewSection"]')).toHaveAttribute('aria-current','location');
});

test('search covers projects and public explorations while excluding review-only entities',async({page})=>{
  await page.goto('/index.html');
  await page.locator('.header-search-v114').click();
  await page.fill('#globalSearchInput','Red Dot Design Award');
  await page.locator('.global-search-v114__submit').click();
  await expect(page.locator('#globalSearchDialog [data-experiment="hello-sabau"]')).toBeVisible();
  await expect(page.locator('#globalSearchDialog [data-experiment="matsu-temple-packaging"]')).toHaveCount(0);
  await page.fill('#globalSearchInput','credit exception');
  await page.locator('.global-search-v114__submit').click();
  await expect(page.locator('#globalSearchDialog [data-project="dbs"]')).toBeVisible();
});

test('company names stay on one line in every project-card surface',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/index.html?case=dbs');
  const companies=page.locator('#detailRelatedRail .related-project-card__company-v135');
  await expect(companies.first()).toBeVisible();
  const wrapped=await companies.evaluateAll(nodes=>nodes.filter(node=>node.getClientRects().length!==1||node.scrollHeight>node.clientHeight+1).map(node=>node.textContent));
  expect(wrapped).toEqual([]);
});

for (const route of ['/index.html','/work.html','/profile.html','/experiments.html']) {
  test(`global header search is available and keyboard operable on ${route}`,async({page})=>{
    await page.setViewportSize({width:430,height:900});
    await page.goto(route);
    const trigger=page.locator('.header-search-v114');
    await expect(trigger).toBeVisible();
    expect((await trigger.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await trigger.click();
    await expect(page.locator('#globalSearchDialog')).toBeVisible();
    await expect(page.locator('#globalSearchInput')).toBeFocused();
    await page.fill('#globalSearchInput','exception ownership escalation');
    await page.locator('.global-search-v114__form').press('Enter');
    await expect(page.locator('.global-search-v114__results')).toBeVisible();
    await expect(page.locator('.global-search-v114__results')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#globalSearchDialog')).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });
}

test('detail scroll restores only for the same programme parent',async({page})=>{
  await page.setViewportSize({width:900,height:900});
  await page.goto('/index.html');
  await page.locator('[data-project="voucher"]').first().click();
  const scrollRoot=page.locator('#detailDialog .dialog-scroll');
  await scrollRoot.evaluate(el=>el.scrollTop=640);
  const saved=await scrollRoot.evaluate(el=>el.scrollTop);
  await page.locator('#detailDialog [data-initiative="brand-challenges"]').first().click();
  expect(await scrollRoot.evaluate(el=>el.scrollTop)).toBe(0);
  await page.locator('#detailBack').click();
  expect(Math.abs((await scrollRoot.evaluate(el=>el.scrollTop))-saved)).toBeLessThanOrEqual(2);
  await scrollRoot.evaluate(el=>el.scrollTop=el.scrollHeight);
  await page.locator('#detailRelatedRail [data-project]').first().click();
  expect(await scrollRoot.evaluate(el=>el.scrollTop)).toBe(0);
  await expect(page.locator('#detailBack')).toBeHidden();
});

test('deep-linked stage evidence starts at top without synthetic history',async({page})=>{
  await page.goto('/index.html?case=voucher&stage=activate');
  await expect(page.locator('#detailDialog')).toBeVisible();
  expect(await page.locator('#detailDialog .dialog-scroll').evaluate(el=>el.scrollTop)).toBe(0);
  await expect(page.locator('#detailBack')).toBeVisible();
});

for (const width of [1440,900,430,320]) {
  test(`voucher stage evidence returns to its parent and stays usable ${width}`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/index.html?case=voucher');
    const scrollRoot=page.locator('#detailDialog .dialog-scroll');
    await scrollRoot.evaluate(el=>el.scrollTop=640);
    const saved=await scrollRoot.evaluate(el=>el.scrollTop);
    await page.locator('#programmeSurface [data-stage="activate"]').click();
    await expect(page).toHaveURL(/case=voucher&stage=activate/);
    await expect(page.locator('#detailBack')).toBeVisible();
    await expect(page.locator('#detailBack')).toContainText('Voucher / Offer overview');
    await expect(page.locator('#programmeSurface .stage-parent-link')).toHaveCount(0);
    await expect(page.locator('#projectEvidence')).toBeHidden();
    expect(await scrollRoot.evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
    await page.locator('#detailBack').click();
    await expect(page).toHaveURL(/case=voucher(?!.*stage)/);
    await expect(page.locator('#detailTitle')).toContainText('Unifying Voucher mechanics');
    expect(Math.abs((await scrollRoot.evaluate(el=>el.scrollTop))-saved)).toBeLessThanOrEqual(2);
  });
}

test('voucher stage deep link opens readable evidence',async({page})=>{
  await page.goto('/index.html?case=voucher&stage=redeem');
  await expect(page.locator('#detailDialog')).toBeVisible();
  await expect(page).toHaveURL(/case=voucher&stage=redeem/);
  await expect(page.locator('#detailTitle')).toContainText('From manual trial and error');
  await expect(page.locator('#detailBack')).toBeVisible();
});

for (const project of ['voucher','voucher-center','game-center']) {
  test(`${project} resolves as an independent parent project`,async({page})=>{
    await page.setViewportSize({width:430,height:900});
    await page.goto(`/index.html?case=${project}`);
    await expect(page.locator('#detailDialog')).toBeVisible();
    await expect(page.locator('#detailBack')).toBeHidden();
    await expect(page.locator('#projectSignals small').first()).toHaveText('Scope');
    expect(await page.locator('#detailDialog .dialog-scroll').evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
  });
}

test('voucher parent keeps internal operations and Game Center out of its journey map',async({page})=>{
  await page.goto('/index.html?case=voucher');
  await expect(page.locator('#programmeSurface')).toBeVisible();
  await expect(page.locator('#programmeSurface')).not.toContainText('Voucher Center');
  await expect(page.locator('#programmeSurface')).not.toContainText('Game Center');
  await expect(page.locator('#programmeSurface')).toContainText('PDP and contextual offer visibility');
  await expect(page.locator('#detailDialog')).not.toContainText('[object Object]');
  await expect(page.locator('#programmeSurface .programme-stage-case')).toHaveCount(5);
  await expect(page.locator('#programmeSurface [data-stage]')).toHaveCount(5);
  await expect(page.locator('#programmeSurface')).toContainText('View stage evidence');
  await expect(page.locator('#detailRelatedRail [data-project="voucher-center"]')).toBeVisible();
  await expect(page.locator('#detailRelatedRail [data-project="game-center"]')).toBeVisible();
});

for (const width of [1440,900,430,320]) {
  test(`project detail sections and related cards stay aligned ${width}`, async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/work.html');
    await page.locator('[data-project="dbs"]').first().click();
    await expect(page.locator('#detailDialog')).toBeVisible();
    const result=await page.locator('#detailDialog').evaluate(dialog=>{
      const impact=dialog.querySelector('.impact-grid-v45 article');
      const ownership=dialog.querySelector('.ownership-section-v45');
      const cards=[...dialog.querySelectorAll('.detail-related-card-v45')];
      const boxes=cards.map(card=>{
        const media=card.querySelector('.detail-related-card-v45__visual').getBoundingClientRect();
        const action=card.querySelector('.detail-related-action-v46').getBoundingClientRect();
        const cardBox=card.getBoundingClientRect();
        return {
          mediaHeight:Math.round(media.height),
          actionBottomGap:Math.round(cardBox.bottom-action.bottom)
        };
      });
      return {
        overflow:dialog.querySelector('.dialog-scroll').scrollWidth-dialog.querySelector('.dialog-scroll').clientWidth,
        impactBackground:getComputedStyle(impact).backgroundColor,
        ownershipBackground:getComputedStyle(ownership).backgroundColor,
        boxes
      };
    });
    expect(result.overflow).toBeLessThanOrEqual(1);
    expect(result.impactBackground).not.toBe(result.ownershipBackground);
    expect(result.boxes.length).toBeGreaterThanOrEqual(2);
    expect(new Set(result.boxes.map(box=>box.mediaHeight)).size).toBe(1);
    expect(Math.max(...result.boxes.map(box=>box.actionBottomGap))-Math.min(...result.boxes.map(box=>box.actionBottomGap))).toBeLessThanOrEqual(1);
  });
}

test('mobile menu remains available after scroll', async ({page})=>{
  await page.setViewportSize({width:430,height:844});
  await page.goto('/work.html');
  await page.evaluate(()=>scrollTo(0,900));
  const toggle=page.locator('.menu-toggle');
  await toggle.click();
  await expect(page.locator('#mobileMenu')).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  await expect(toggle).toHaveAttribute('aria-label','Close menu');
  await expect(page.locator('#mobileMenu a[href="/site/work.html"]')).toHaveAttribute('aria-current','page');
  expect(await page.locator('.site-header').evaluate(el=>getComputedStyle(el).position)).toBe('fixed');
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobileMenu')).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await expect(toggle).toBeFocused();
});

test('header profile entry and direct profile route both work', async ({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/index.html');
  await page.locator('.nav a[href="/site/profile.html"]').click();
  await expect(page).toHaveURL(/profile\.html$/);
  await expect(page.locator('.profile-hero-v36')).toBeVisible();
  await page.goto('/site/profile.html');
  await expect(page.locator('.profile-hero-v36')).toBeVisible();
});

test('project and experiment detail contracts remain stable', async ({page},testInfo)=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/work.html');
  await page.locator('[data-project="dbs"]').first().click();
  await expect(page.locator('#detailDialog')).toBeVisible();
  await expect(page.locator('.project-signals-v45')).toBeVisible();
  await expect(page.locator('.project-signals-v45 > div')).toHaveCount(2);
  await expect(page.locator('.project-signals-v45 > div')).toBeVisible();
  await expect(page.locator('.project-signals-v45 small')).toHaveText(['Scope','Audience']);
  for (const value of await page.locator('.project-signals-v45 dd').allTextContents()) expect(value.trim()).not.toBe('');
  const signalText=await page.locator('.project-signals-v45').innerText();
  expect(signalText).not.toContain('TYPE');
  expect(signalText).not.toContain('SCOPE');
  expect(signalText).toContain('Audience');
  await expect(page.locator('.team-impact-role-v47')).toHaveCount(3);
  for(const label of await page.locator('.team-impact-role-v47').allTextContents())expect(label.trim()).not.toBe('');
  await expect(page.locator('#recruiterProof .recruiter-proof-item-v46')).toHaveCount(3);
  await expect(page.locator('.decision-result-v46').first()).toHaveAttribute('aria-label','Decision outcome');
  await page.locator('#detailRelatedRail [data-project]').first().click();
  await expect(page.locator('#detailBack')).toBeVisible();
  const controls=await page.locator('.dialog-controls-v67').boundingBox();
  const heading=await page.locator('.modal-head-v45').boundingBox();
  expect(controls.y+controls.height).toBeLessThanOrEqual(heading.y);
  await page.locator('#detailBack').click();
  await expect(page.locator('#detailBack')).toBeHidden();
  await expect(page.locator('#detailTitle')).toBeFocused();
  await page.screenshot({path:testInfo.outputPath('project-detail-v70.png'),fullPage:false});
  await page.locator('#detailClose').click();
  await expect(page.locator('[data-project="dbs"]').first()).toBeFocused();
  await page.goto('/experiments.html');
  await page.locator('[data-experiment]').first().click();
  await expect(page.locator('#experimentView')).toBeVisible();
  expect(await page.locator('#experimentView').evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
});

for (const width of [1440,900,430,320]) {
  test(`project overview uses a consistent reading rhythm ${width}`,async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/work.html');
    await page.locator('[data-project="dbs"]').first().click();
    const rhythm=await page.evaluate(()=>{
      const summary=document.querySelector('.project-summary-v45').getBoundingClientRect();
      const signals=document.querySelector('.project-signals-v45').getBoundingClientRect();
      const why=document.querySelector('.project-context-v45 article').getBoundingClientRect();
      const style=getComputedStyle(document.documentElement);
      const expected=parseFloat(style.getPropertyValue('--space-6'));
      return {
        expected,
        summaryToSignals:Math.round(signals.top-summary.bottom),
        signalsToWhy:Math.round(why.top-signals.bottom)
      };
    });
    expect(Math.abs(rhythm.summaryToSignals-rhythm.expected)).toBeLessThanOrEqual(2);
    expect(Math.abs(rhythm.signalsToWhy-rhythm.expected)).toBeLessThanOrEqual(2);
  });
}

for (const width of [1440,900,430,320]) {
  test(`experiment cards and detail remain usable ${width}`, async ({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/experiments.html');
    expect(await page.locator('html').evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
    const card=page.locator('.experiment-index-card-v36').first();
    await expect(card.locator('.experiment-index-card-v38__learning small')).toHaveText('Current learning');
    await expect(card.locator('.experiment-card-action')).toHaveText('View experiment ↗');
    const before=await card.evaluate(el=>getComputedStyle(el).boxShadow);
    await card.hover();
    const after=await card.evaluate(el=>getComputedStyle(el).boxShadow);
    expect(after).not.toBe(before);
    await card.focus();
    await expect(card).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#experimentView')).toBeVisible();
    await expect(page.locator('#projectView')).toBeHidden();
    await expect(page.locator('#experimentView .info-grid-v45--experiment')).toContainText('CURRENT STAGE');
    expect(await page.locator('#detailDialog .dialog-scroll').evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
    const close=await page.locator('#detailClose').boundingBox();
    expect(close.width).toBeGreaterThanOrEqual(44);
    expect(close.height).toBeGreaterThanOrEqual(44);
    await page.keyboard.press('Escape');
    await expect(card).toBeFocused();
  });
}

test('every flagship project avoids repeating header metadata in its overview', async ({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/work.html');
  for (const project of ['voucher','dbs','booking','payment']) {
    await page.locator(`[data-project="${project}"]`).first().click();
    const signals=page.locator('.project-signals-v45 > div');
    await expect(signals).toHaveCount(2);
    await expect(signals).toBeVisible();
    await expect(page.locator('.project-signals-v45 small')).toHaveText(['Scope','Audience']);
    for (const value of await page.locator('.project-signals-v45 dd').allTextContents()) expect(value.trim()).not.toBe('');
    await page.locator('#detailClose').click();
  }
});

for (const width of [1440,900,430,320]) {
  test(`popup shell clearance ${width}`, async ({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/work.html');
    const invoker=page.locator('[data-project="dbs"]').first();
    await invoker.click();
    await expect(page.locator('#detailDialog')).toBeVisible();
    const overflow=await page.locator('#detailDialog .dialog-scroll').evaluate(el=>el.scrollWidth-el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const controls=await page.locator('.dialog-controls-v67').boundingBox();
    const heading=await page.locator('.modal-head-v45').boundingBox();
    expect(controls.y+controls.height).toBeLessThanOrEqual(heading.y);
    await page.keyboard.press('Escape');
    await expect(page.locator('#detailDialog')).not.toBeVisible();
    await expect(invoker).toBeFocused();
  });
}
