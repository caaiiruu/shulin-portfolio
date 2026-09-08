import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const content=JSON.parse(fs.readFileSync('public/site/content/portfolio-content.json','utf8'));
test('Profile career facts match the canonical CV and have one rendering owner',()=>{
 const contract=content.profile.careerTimelineContract;
 const expected=[['freelance-2026-present','Independent Product Designer','Jan 2026–Present',''],['fairprice-voucher-2022-2025','Senior Product Designer','Nov 2022–Dec 2025','Contract'],['dbs-2021-2022','Senior Product Designer','Nov 2021–Oct 2022',''],['fairprice-payment-2020-2021','Product Designer','Oct 2020–Oct 2021',''],['booking-2018-2019','UX Designer','Nov 2018–Dec 2019',''],['aja-creative-2015-2018','UX Designer','Dec 2015–Apr 2018','']];
 assert.equal(createHash('sha256').update(fs.readFileSync('public/site/assets/docs/Shulin-Chou-CV.pdf')).digest('hex'),'b235a40a423fa0e287c2496c285814f6d7e01f08bb97e51a8995893ea69d29dd');
 assert.deepEqual(contract.renderOrder,expected.map(x=>x[0]));
 for(const [id,title,period,type] of expected){const item=content.profile.careerTimeline[id];assert.equal(item.title.en,title);assert.equal(item.period.en,period);assert.equal(item.employmentType.en,type);assert.ok(item.title.zh&&item.period.zh);}
 const template=fs.readFileSync('site-source/templates/profile.html','utf8');
 assert.match(template,/id="profileCareerTimeline"/);assert.doesNotMatch(template,/profile\.2022-now|profile\.fairprice-group-freelance|experience-org-group/);
 const app=fs.readFileSync('public/site/assets/js/app.js','utf8');assert.match(app,/profile\?\.careerTimelineContract\?\.renderOrder/);assert.match(app,/portfolio:language',renderCareerTimeline/);
});
