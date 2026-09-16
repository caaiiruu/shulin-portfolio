from pathlib import Path

path = Path('.github/workflows/style-b-project-card-final-qa.yml')
source = path.read_text()

old_owner = """          const work=fs.readFileSync('public/site/assets/js/work.js','utf8');
          const domain=fs.readFileSync('public/site/assets/js/domain-experience.js','utf8');
          const media=fs.readFileSync('public/site/assets/js/project-card-media.js','utf8');
          for(const source of [work,domain]) if(/tintPalette|tintForProject|tintFor\\s*=/.test(source)) throw new Error('page-owned brand tint remains');
"""
new_owner = """          const work=fs.readFileSync('public/site/assets/js/work.js','utf8');
          const domain=fs.readFileSync('public/site/assets/js/domain-experience.js','utf8');
          const home=fs.readFileSync('public/site/assets/js/home.js','utf8');
          const media=fs.readFileSync('public/site/assets/js/project-card-media.js','utf8');
          for(const source of [work,domain]) if(/tintPalette|tintForProject|tintFor\\s*=/.test(source)) throw new Error('page-owned brand tint remains');
          if(/createProjectCard\\(key,'domain'\\)/.test(home)||/related\\?\\.replaceChildren\\(\\.\\.\\.cards\\)/.test(home)) throw new Error('Home parallel Domain ProjectCard renderer remains');
"""
if old_owner not in source:
    raise SystemExit('owner audit insertion point not found')
source = source.replace(old_owner, new_owner, 1)

old_work_shot = """              await work.screenshot({path:path.join(out,`work-${width}.png`),animations:'disabled'});
"""
new_work_shot = """              for(let i=0;i<count;i++){
                const card=cards.nth(i); const id=await card.getAttribute('data-work-index-project'); const img=card.locator('.work-card-v32__image-v225');
                await card.scrollIntoViewIfNeeded();
                const loaded=await img.evaluate(async el=>{
                  el.loading='eager';
                  if(el.complete&&el.naturalWidth>0)return true;
                  return await new Promise(resolve=>{
                    const finish=()=>resolve(el.complete&&el.naturalWidth>0);
                    el.addEventListener('load',finish,{once:true});
                    el.addEventListener('error',()=>resolve(false),{once:true});
                    setTimeout(finish,5000);
                  });
                });
                assert(loaded,`Work ${width} ${id}: Lead Visual failed to load`);
              }
              await work.scrollIntoViewIfNeeded();
              await page.waitForTimeout(150);
              await work.screenshot({path:path.join(out,`work-${width}.png`),animations:'disabled'});
"""
if old_work_shot not in source:
    raise SystemExit('Work screenshot insertion point not found')
source = source.replace(old_work_shot, new_work_shot, 1)

old_domain_entry = """              await page.goto(base+'/site/index.html',{waitUntil:'networkidle'});
              const domain=page.locator('#domains'); await domain.scrollIntoViewIfNeeded();
              await page.waitForFunction(()=>document.querySelector('#domains')?.dataset.domainGoldenReferenceMounted==='true');
              assert(await domain.locator('.domain-tab').count()===6,`Domain ${width}: expected six tabs`);
"""
new_domain_entry = """              await page.goto(base+'/site/index.html#domains',{waitUntil:'networkidle'});
              const domain=page.locator('#domains');
              await page.waitForFunction(()=>document.querySelector('#domains')?.dataset.domainGoldenReferenceMounted==='true');
              await page.waitForTimeout(350);
              const domainHeading=domain.locator('h2').first();
              assert(await domainHeading.count()===1,`Domain ${width}: heading missing`);
              const headerBox=await page.locator('.site-header').boundingBox();
              const headingBox=await domainHeading.boundingBox();
              assert(headerBox&&headingBox&&headingBox.y>=headerBox.y+headerBox.height-1,`Domain ${width}: heading obscured by fixed header`);
              assert(await domain.locator('.domain-tab').count()===6,`Domain ${width}: expected six tabs`);
"""
if old_domain_entry not in source:
    raise SystemExit('Domain entry insertion point not found')
source = source.replace(old_domain_entry, new_domain_entry, 1)

path.write_text(source)
