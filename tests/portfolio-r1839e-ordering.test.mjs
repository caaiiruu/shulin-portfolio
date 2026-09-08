import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const site=new URL("../public/site/",import.meta.url);
const read=path=>fs.readFileSync(new URL(path,site),"utf8");
const ssot=JSON.parse(read("content/portfolio-content.json"));
const app=read("assets/js/app.js");
const presentation=ssot.implementationContracts.portfolioPresentation;

test("R183.9E owns canonical Transformation to Contribution adjacency in the SSOT",()=>{
  assert.equal(Object.keys(ssot.projects).length,13);
  assert.deepEqual(presentation.requiredAdjacencies,[{
    predecessor:"transformation",
    predecessorComponent:"KeyInterventionMap",
    successor:"contribution",
    successorComponent:"ContributionBlock",
    scope:"canonical-projects",
    required:true
  }]);
});

test("R183.9E shared renderers enforce the SSOT-owned adjacency after section assembly",()=>{
  const helper=app.slice(app.indexOf("function enforceCanonicalAdjacency"),app.indexOf("function caseStudyHeader"));
  assert.match(helper,/portfolioPresentation\?\.requiredAdjacencies/);
  assert.match(helper,/successor\.before\(predecessor\)/);
  const primary=app.slice(app.indexOf("function renderSystemCaseParent"),app.indexOf("function renderProgrammeParent"));
  const programme=app.slice(app.indexOf("function renderProgrammeParent"),app.indexOf("function renderInitiative"));
  assert.match(primary,/enforceCanonicalAdjacency\(surface\)/);
  assert.match(programme,/enforceCanonicalAdjacency\(surface\)/);
  assert.doesNotMatch(app,/supplemental\[0\]\.appendChild\(intervention\)/);
});

test("R183.9E keeps canonical Transformation and Contribution source coverage intact",()=>{
  const labels=presentation.semanticSlots.transformation.visibleLabels;
  assert.deepEqual(labels,{before:{en:"Before",zh:"原始狀態"},systemChange:{en:"System change",zh:"系統改變"},after:{en:"After",zh:"建立後"}});
  for(const [id,project] of Object.entries(ssot.projects)){
    assert.ok(project.keyInterventionMap?.status?.startsWith("verified"),`${id}: Transformation`);
    assert.ok(project.valueIBrought||project.publicContent?.contribution||project.publicContent?.myContribution,`${id}: Contribution source`);
  }
  assert.doesNotMatch(app,/My intervention|MY INTERVENTION|我的介入/);
});
