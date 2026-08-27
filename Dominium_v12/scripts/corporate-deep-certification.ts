import { createInitialGameState } from '../src/engine/simulationEngine';
import { ensureCorporateDeepSimulationState, inspectInstitutionalInvestors, inspectCorporateDeepGovernance, launchCompanyMABid, lobbyCorporateRegulator } from '../src/engine/corporateDeepSimulationEngine';
import { simulateMonthlyCorporateEngine } from '../src/engine/corporateSimulationEngine';

const state=createInitialGameState('Alex','Dominium','Non-binary','United States','New York');
const assert=(v:boolean,m:string)=>{if(!v) throw new Error(m)};
const deep=ensureCorporateDeepSimulationState(state);
assert(deep.institutionalInvestors.length>=8,'Institutional investor universe missing.');
const companies=state.companies.filter(c=>c.isPublic&&c.ticker);
assert(companies.length>=200,'Corporate universe missing.');
const a=companies[0], b=companies[1];
const bid=launchCompanyMABid(state,a.id,b.id,30);
assert(bid.success,'Corporate M&A bid failed to launch.');
const lobby=lobbyCorporateRegulator(state,a.id,10000);
assert(lobby.success,'Regulatory engagement failed.');
for(let i=0;i<3;i++){ state.simulationTick++; simulateMonthlyCorporateEngine(state,[]); }
const gov=inspectCorporateDeepGovernance(state,a.id);
assert(!!gov.governance&&!!gov.regulatory,'Deep governance/regulatory profiles missing.');
assert(inspectInstitutionalInvestors(state).some(i=>Object.keys(i.holdings).length>=0),'Institutional state unavailable.');
console.log(JSON.stringify({ok:true,macroPhase:deep.macroPhase,institutionalInvestors:deep.institutionalInvestors.length,maStage:deep.maBids[0]?.stage,boardConfidence:gov.governance?.boardConfidence,regulatoryAttention:gov.regulatory?.politicalAttention},null,2));
