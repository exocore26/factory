const STORAGE_KEY = 'exocore26-factory-forge-v1';
const STEPS = [
  ['Frame','Define the asset'],['Outcome','Problem and value'],['Flow','Inputs and outputs'],['Abstract','Find reusable mechanisms'],
  ['HITL','Roles and constraints'],['Accept','Done and boundaries'],['Review','Parent-Engine hypothesis'],['Generate','Requirements + TODO']
];

const CAPABILITIES = {
  intake: ['Requirement Intake & Resolver','Normalises free-text intent into a structured project brief and identifies missing fields.','Use when different project types need the same guided discovery sequence.'],
  questions: ['Question-Set Engine','Runs conditional question sets, branching on earlier answers and producing a stable answer schema.','Strong parent-engine candidate whenever the workflow is a guided specification process.'],
  context: ['Context / Knowledge Resolver','Selects the right project documents, indexed knowledge or source material for a task.','Separates retrieval/selection from project-specific processing.'],
  contracts: ['Schema & Contract Registry','Defines versioned inputs, outputs, validation rules and interface contracts.','Makes tools composable and prevents each project inventing its own shape.'],
  orchestration: ['Workflow / Task Orchestrator','Sequences steps, manages state, retries and completion criteria.','Useful when the tool crosses multiple operations or agents.'],
  hitl: ['HITL Gate & Role Resolver','Creates explicit human decision gates and maps them to roles/permissions.','Keeps human control as a first-class system mechanism.'],
  prompts: ['Prompt / Instruction Composer','Builds bounded instructions from structured context, role, objective and constraints.','Abstracts reusable instruction assembly away from individual projects.'],
  validation: ['Validation & Acceptance Engine','Runs checks against schemas, requirements and user-defined acceptance criteria.','Turns “looks right” into repeatable verification.'],
  artifacts: ['Artefact Generator','Renders structured data into Markdown, JSON, code scaffolds, checklists or other outputs.','Separates output formatting from the capability that decides what to produce.'],
  adapters: ['Adapter Boundary / Connector Layer','Provides a common interface over Git, files, APIs, storage or other external systems.','Prevents external services leaking into core business logic.'],
  provenance: ['Provenance / Session Log','Records source inputs, decisions, generated artefacts and version metadata.','Useful for replay, audit, debugging and self-documenting workflows.'],
  ui: ['Guided Form / UI Renderer','Renders question sets and result views from configuration rather than hardcoded screens.','Supports multiple factories with the same interaction primitives.'],
  templates: ['Scaffold / Template Engine','Applies reusable project templates and bounded generation recipes.','Useful where many projects share a skeleton but vary in content.'],
  registry: ['Capability / Tool Registry','Describes reusable tools, their contracts, required inputs, outputs and lifecycle status.','Creates discoverability without tightly coupling projects together.']
};

const AUTO_CAPS = new Set(['contracts','validation','provenance']);
const state = loadState() || createDefaultState();
let currentStep = 1;
let currentOutput = 'requirements';
let generated = {requirements:'',todo:''};

const stepList = document.getElementById('stepList');
const panels = [...document.querySelectorAll('.step-panel')];
const form = document.getElementById('forgeForm');
const outputPreview = document.getElementById('outputPreview');

renderStepList();
renderCapabilities();
bindInputs();
updateAll();

function createDefaultState(){
  const capabilities = {};
  Object.keys(CAPABILITIES).forEach(k => capabilities[k]=AUTO_CAPS.has(k));
  return {assetMode:'common-tool', targetEngine:'', domain:'developer-tooling', primaryUser:'builder', lifecycle:'idea', name:'', problem:'', outcome:'', success:'', invariants:'', inputs:'', outputs:'', decisions:'', dependencies:'', failures:'', capabilities, abstraction:'parent', humanGates:'', automation:'', roles:'', permissions:'', resources:'freemium-low-resource', stateModel:'stateless', interface:'web', mustDo:'', mustNotDo:'', acceptance:'', edgeCases:'', notes:''};
}

function renderStepList(){
  stepList.innerHTML = STEPS.map((s,i)=>`<button type="button" class="step-item" data-jump="${i+1}"><span class="step-num">${String(i+1).padStart(2,'0')}</span>${s[0]}<div class="muted">${s[1]}</div></button>`).join('');
  stepList.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>gotoStep(Number(b.dataset.jump))));
}

function renderCapabilities(){
  const grid = document.getElementById('capabilityGrid');
  grid.innerHTML = Object.entries(CAPABILITIES).map(([key,[title,desc,why]])=>`<label><input type="checkbox" data-capability="${key}" ${state.capabilities[key]?'checked':''}><span><span>${title}</span><small>${desc}</small></span></label>`).join('');
  grid.querySelectorAll('[data-capability]').forEach(el=>el.addEventListener('change',()=>{
    state.capabilities[el.dataset.capability]=el.checked; persist(); updateReview();
  }));
}

function bindInputs(){
  form.querySelectorAll('[data-key]').forEach(el=>{
    if(el.type==='radio') { if(state[el.dataset.key]===el.value) el.checked=true; el.addEventListener('change',()=>{state[el.dataset.key]=el.value; persist(); updateAll();}); }
    else { el.value=state[el.dataset.key] ?? ''; el.addEventListener('input',()=>{state[el.dataset.key]=el.value; persist(); updateAll();}); el.addEventListener('change',()=>{state[el.dataset.key]=el.value; persist(); updateAll();}); }
  });
  document.getElementById('nextBtn').addEventListener('click',()=>gotoStep(Math.min(8,currentStep+1)));
  document.getElementById('backBtn').addEventListener('click',()=>gotoStep(Math.max(1,currentStep-1)));
  document.getElementById('generateBtn').addEventListener('click',()=>{generateAll(); showOutput('requirements');});
  document.getElementById('downloadReqBtn').addEventListener('click',()=>downloadText((generated.requirements||generateAll().requirements),'Requirements.md'));
  document.getElementById('downloadTodoBtn').addEventListener('click',()=>downloadText((generated.todo||generateAll().todo),'TODO.md'));
  document.getElementById('downloadBundleBtn').addEventListener('click',downloadBundle);
  document.getElementById('newSessionBtn').addEventListener('click',()=>{if(confirm('Start a new Forge session? Your current answers will be cleared.')){Object.assign(state,createDefaultState()); persist(); location.reload();}});
  document.getElementById('saveSessionBtn').addEventListener('click',()=>downloadText(JSON.stringify(state,null,2),`${slug(state.name||'forge-session')}.json`));
  document.getElementById('loadSessionInput').addEventListener('change',loadJson);
  document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>showOutput(t.dataset.output)));
}

function gotoStep(n){currentStep=n; panels.forEach(p=>p.classList.toggle('active',Number(p.dataset.step)===n)); stepList.querySelectorAll('.step-item').forEach((b,i)=>{b.classList.toggle('active',i+1===n);b.classList.toggle('done',i+1<n)}); document.getElementById('progressLabel').textContent=`Step ${n} of 8`; document.getElementById('progressBar').style.width=`${n/8*100}%`; document.getElementById('backBtn').disabled=n===1; document.getElementById('nextBtn').textContent=n===8?'Stay on output':'Next'; document.getElementById('stepHint').textContent=STEPS[n-1][1]; if(n===7) updateReview(); if(n===8){generateAll(); showOutput(currentOutput);} window.scrollTo({top:0,behavior:'smooth'});}

function updateAll(){ updateReview(); document.getElementById('autosaveLabel').textContent='Autosave: on'; }
function updateReview(){
  const selected = Object.entries(state.capabilities).filter(([,v])=>v).map(([k])=>CAPABILITIES[k][0]);
  document.getElementById('projectSpecificReview').textContent = state.targetEngine || state.name || 'Define the project-specific mechanism';
  document.getElementById('reusableReview').textContent = selected.slice(0,3).join(' · ') || 'No reusable capability selected yet';
  document.getElementById('boundaryReview').textContent = state.abstraction==='parent'?'Parent-Engine primitive':state.abstraction==='shared-module'?'Shared module':'Project-local';
  const recs=document.getElementById('recommendations');
  recs.innerHTML = (selected.length ? selected : ['No candidates yet']).map(title=>{const [key,data]=Object.entries(CAPABILITIES).find(([,v])=>v[0]===title)||[];return `<article class="recommendation"><h3>${title}</h3><p>${data?data[1]: 'Select capabilities on Step 4 to test reuse hypotheses.'}</p>${key?`<span class="tag">candidate shared capability</span>`:''}</article>`}).join('');
}

function generateAll(){
  generated.requirements = buildRequirements();
  generated.todo = buildTodo();
  outputPreview.textContent = currentOutput==='requirements'?generated.requirements:currentOutput==='todo'?generated.todo:JSON.stringify(state,null,2);
  return generated;
}
function showOutput(which){currentOutput=which; document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.output===which)); if(which==='json') outputPreview.textContent=JSON.stringify(state,null,2); else outputPreview.textContent=generated[which] || generateAll()[which];}

function buildRequirements(){
  const selected = selectedCaps();
  const date = new Date().toISOString().slice(0,10);
  const name = state.name || 'Unnamed Factory Capability';
  return `# Requirements Document — ${name}\n\nGenerated: ${date}\nFactory: Exocore-26\nAsset mode: ${label(state.assetMode)}\nTarget sub-project / engine: ${state.targetEngine || 'TBD'}\nDomain: ${label(state.domain)}\nPrimary user: ${label(state.primaryUser)}\nLifecycle: ${label(state.lifecycle)}\n\n## 1. Purpose\n${block(state.outcome,'No desired outcome supplied yet.')}\n\n## 2. Problem\n${block(state.problem,'No problem statement supplied yet.')}\n\n## 3. Success Evidence\n${block(state.success,'Define observable evidence of success.')}\n\n## 4. Invariants to Preserve\n${block(state.invariants,'None recorded.')}\n\n## 5. Transformation Model\n### Inputs\n${block(state.inputs,'None recorded.')}\n\n### Decisions / Rules\n${block(state.decisions,'None recorded.')}\n\n### Outputs\n${block(state.outputs,'None recorded.')}\n\n### External Dependencies\n${block(state.dependencies,'None recorded.')}\n\n### Failure + Recovery\n${block(state.failures,'None recorded.')}\n\n## 6. Candidate Parent-Engine Capabilities\n${selected.length ? selected.map(c=>`### ${c.title}\n- Rationale: ${c.desc}\n- Abstraction intent: ${c.why}`).join('\n\n') : 'No shared capabilities selected. Re-run the abstraction test before build.'}\n\n## 7. Boundary Decision\n**Preferred boundary:** ${state.abstraction==='parent'?'Parent-Engine service / primitive':state.abstraction==='shared-module'?'Shared module':'Project-local implementation'}\n\nProject-specific concerns must remain outside the reusable primitive unless they are proven to be contract-level concerns.\n\n## 8. HITL / Roles\n### Human decision points\n${block(state.humanGates,'None recorded.')}\n\n### Automation responsibilities\n${block(state.automation,'None recorded.')}\n\n### Roles\n${block(state.roles,'None recorded.')}\n\n### Permissions / data sensitivity\n${block(state.permissions,'None recorded.')}\n\n## 9. Constraints\n- Resource profile: ${label(state.resources)}\n- State model: ${label(state.stateModel)}\n- Primary interface: ${label(state.interface)}\n- The system should keep dependencies explicit and avoid coupling a shared primitive to one project adapter.\n\n## 10. Functional Requirements\n${functionalRequirements(selected)}\n\n## 11. Validation and Acceptance\n### Must do\n${block(state.mustDo,'Define the required first-version behaviour.')}\n\n### Must not do\n${block(state.mustNotDo,'Define explicit exclusions.')}\n\n### Acceptance tests\n${listOrBlock(state.acceptance)}\n\n### Edge cases\n${listOrBlock(state.edgeCases)}\n\n## 12. Open Questions\n- Which parts of the proposed capability are genuinely cross-project?\n- Which interfaces should be versioned?\n- What data should be persisted versus reconstructed per run?\n- Which adapters belong outside the Parent-Engine boundary?\n- What is the smallest useful implementation that can be exercised by two different sub-projects?\n\n## 13. Additional Notes\n${block(state.notes,'None recorded.')}\n\n## 14. Design Status\nThis document is a generated working specification. Candidate Parent-Engine capabilities are **hypotheses for extraction**, not claims that those components already exist.\n`;
}

function buildTodo(){
  const selected=selectedCaps();
  const name=state.name||'unnamed-factory-capability';
  const tasks=[];
  tasks.push(`1. Freeze the problem statement and success evidence for ${name}.`);
  tasks.push(`2. Split the project-specific behaviour from the reusable mechanism; record the boundary decision in the repository.`);
  tasks.push(`3. Define the input/output schema and versioning rules before implementing the reusable primitive.`);
  selected.forEach((c,i)=>tasks.push(`${tasks.length+1}. Specify the ${c.title} contract: inputs, outputs, failure modes, lifecycle and ownership.`));
  tasks.push(`${tasks.length+1}. Build the smallest reusable primitive that can serve two materially different sub-projects.`);
  tasks.push(`${tasks.length+1}. Keep project-specific adapters outside the shared primitive; expose them through explicit boundaries.`);
  tasks.push(`${tasks.length+1}. Add validation tests from the acceptance criteria and edge cases.`);
  if(state.humanGates.trim()) tasks.push(`${tasks.length+1}. Implement and test the defined HITL decision gates and role permissions.`);
  if(state.dependencies.trim()) tasks.push(`${tasks.length+1}. Isolate external dependencies behind adapters and document fallbacks.`);
  tasks.push(`${tasks.length+1}. Run a reuse test against a second hypothetical or real sub-project.`);
  tasks.push(`${tasks.length+1}. Record provenance: source inputs, schema version, generated artefacts and test outcome.`);
  tasks.push(`${tasks.length+1}. Publish the reusable contract and usage example before wiring every project to it.`);
  return `# Development TODO — ${name}\n\nGenerated: ${new Date().toISOString().slice(0,10)}\nFactory: Exocore-26\n\n## Build sequence\n${tasks.map(t=>`- [ ] ${t.replace(/^\\d+\\. /,'')}`).join('\n')}\n\n## Parent-Engine extraction checkpoints\n- [ ] **Checkpoint A — Contract:** can the shared capability be described without naming the first project?\n- [ ] **Checkpoint B — Isolation:** can project-specific adapters be removed without changing the core contract?\n- [ ] **Checkpoint C — Dual-use:** demonstrate the primitive against two materially different consumers.\n- [ ] **Checkpoint D — HITL:** verify human decision points remain visible and controllable.\n- [ ] **Checkpoint E — Replay:** confirm a recorded input/session can be re-run or inspected enough to diagnose failure.\n- [ ] **Checkpoint F — Resource fit:** validate the implementation against the selected resource profile (${label(state.resources)}).\n\n## Suggested implementation order\n1. Schema + contract\n2. Core deterministic transformation\n3. Validation\n4. Adapter boundary\n5. HITL / role gate (where required)\n6. Artefact rendering\n7. UI / CLI wrapper\n8. Documentation + example\n9. Second-consumer reuse test\n\n## Project-local TODO\n${listOrBlock(state.mustDo)}\n\n## Explicit exclusions\n${listOrBlock(state.mustNotDo)}\n\n## Notes\n${block(state.notes,'None recorded.')}\n`;
}

function functionalRequirements(selected){
  const lines=[];
  lines.push('- The tool SHALL accept the defined input set and reject or route incomplete inputs explicitly.');
  lines.push('- The tool SHALL expose a stable, inspectable output contract.');
  lines.push('- The tool SHOULD separate project-specific content from reusable mechanisms.');
  if(selected.some(x=>x.key==='questions')) lines.push('- The tool SHOULD support conditional question-set branching without hardcoding project screens.');
  if(selected.some(x=>x.key==='context')) lines.push('- Context retrieval/selection SHALL remain separable from the project-specific transformation.');
  if(selected.some(x=>x.key==='orchestration')) lines.push('- Workflow state and step completion SHALL be observable and recoverable.');
  if(selected.some(x=>x.key==='hitl')) lines.push('- Human gates SHALL be explicit, role-aware and auditable.');
  if(selected.some(x=>x.key==='artifacts')) lines.push('- Artefact rendering SHALL consume structured data rather than embed project logic in output templates.');
  if(selected.some(x=>x.key==='adapters')) lines.push('- External services SHALL be accessed through explicit adapters rather than direct calls from the reusable core.');
  if(selected.some(x=>x.key==='provenance')) lines.push('- Runs SHALL retain enough provenance to understand the origin of inputs, decisions and outputs.');
  return lines.join('\n');
}
function selectedCaps(){return Object.entries(state.capabilities).filter(([,v])=>v).map(([key])=>({key,title:CAPABILITIES[key][0],desc:CAPABILITIES[key][1],why:CAPABILITIES[key][2]}));}
function listOrBlock(text){if(!text || !text.trim()) return 'Not yet defined.'; return text.split(/\n+/).filter(Boolean).map(x=>`- ${x.replace(/^[-*]\s*/,'')}`).join('\n');}
function block(text,fallback){return text&&text.trim()?text.trim():fallback;}
function label(value){return (value||'').replaceAll('-',' ').replace(/\b\w/g,m=>m.toUpperCase());}
function slug(s){return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,60)||'forge-session';}
function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')}catch{return null}}
function downloadText(text,filename){const blob=new Blob([text],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function loadJson(e){const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result);Object.assign(state,createDefaultState(),parsed);persist();location.reload()}catch{alert('That JSON file could not be loaded.')}};reader.readAsText(file)}
function downloadBundle(){const req=generated.requirements||buildRequirements();const todo=generated.todo||buildTodo();const json=JSON.stringify(state,null,2);const fence='```';const bundle='# Exocore-26 Factory Forge Bundle\n\n## Requirements.md\n\n'+req+'\n\n---\n\n## TODO.md\n\n'+todo+'\n\n---\n\n## session.json\n\n'+fence+'json\n'+json+'\n'+fence+'\n';downloadText(bundle,'exocore26-forge-bundle.md')}
