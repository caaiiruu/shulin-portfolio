
const { test, expect } = require('@playwright/test');
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
  await expect(page.locator('#matchProjectRail [data-project]')).toHaveCount(1);
  await expect(page.locator('#matchProjectRail .related-project-card__visual-v45')).toHaveCount(0);
  await expect(page.locator('#matchProjectRail dt')).toHaveText(['Relevance']);
});

test('domain reset and mobile layout', async ({page},testInfo)=>{
  await page.setViewportSize({width:430,height:844});
  await page.goto('/index.html#domains');
  await expect(page.locator('#domainMobileSelect')).toHaveValue('finance');
  await page.locator('#domainMobileSelect').selectOption('travel');
  await expect(page.locator('#domainName')).toContainText('Travel');
  const top=await page.locator('#domainStage').evaluate(el=>Math.round(el.getBoundingClientRect().top));
  expect(top).toBeGreaterThanOrEqual(60);
  await page.screenshot({path:testInfo.outputPath('domain-mobile.png'),fullPage:true});
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

test('mobile menu remains available after scroll', async ({page})=>{
  await page.setViewportSize({width:430,height:844});
  await page.goto('/index.html');
  await page.evaluate(()=>scrollTo(0,900));
  await page.locator('.menu-toggle').click();
  await expect(page.locator('#mobileMenu')).toBeVisible();
  expect(await page.locator('.site-header').evaluate(el=>getComputedStyle(el).position)).toBe('fixed');
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
  await expect(page.locator('.info-grid-v45 > div[data-empty="true"]')).toHaveCount(0);
  await expect(page.locator('.project-signals-v45')).toBeVisible();
  await expect(page.locator('.project-signals-v45 > div')).toHaveCount(3);
  await expect(page.locator('.project-signals-v45 > div')).toBeVisible();
  await expect(page.locator('.project-signals-v45 dt')).toHaveText(['My role','Scale & reach','Design strategy']);
  for (const value of await page.locator('.project-signals-v45 dd').allTextContents()) expect(value.trim()).not.toBe('');
  const signalText=await page.locator('.project-signals-v45').innerText();
  expect(signalText).not.toContain('TYPE');
  expect(signalText).not.toContain('SCOPE');
  expect(signalText).not.toContain('AUDIENCE');
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

test('every flagship project renders all three visible SSOT signals', async ({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/work.html');
  for (const project of ['voucher','dbs','booking','hours']) {
    await page.locator(`[data-project="${project}"]`).first().click();
    const signals=page.locator('.project-signals-v45 > div');
    await expect(signals).toHaveCount(3);
    await expect(signals).toBeVisible();
    await expect(page.locator('.project-signals-v45 dt')).toHaveText(['My role','Scale & reach','Design strategy']);
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
