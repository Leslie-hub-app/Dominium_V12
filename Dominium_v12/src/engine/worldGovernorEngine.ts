import { GameState, MonthlySimulationResult } from '../types';
import { advanceOneMonth } from './simulationEngine';
import { ensureWorldGovernor } from './worldGovernorState';
import { ensureRealEstateIndustry } from './realEstateIndustryEngine';

type Governor = NonNullable<GameState['worldGovernor']>;
export const WORLD_GOVERNOR_MAX_TARGET=100000;

function summarizeSystems(state:GameState){return {economy:state.livingWorld?.economy?.currentCycle||'UNKNOWN',companies:state.companies?.length||0,properties:state.finances?.properties?.length||0,realEstateProjects:state.realEstatePlatform?.projects?.length||0,government:!!state.governmentLiving,politics:!!state.politicalGovernance};}

function retainHighSignal(state:GameState,before:number){const g=ensureWorldGovernor(state);const newEvents=(state.eventsFeed||[]).slice(0,30);const important=newEvents.filter(e=>['Critical','High'].includes(e.severity||'')).map(e=>e.title);g.criticalSignals=[...important,...g.criticalSignals].slice(0,30);const excess=Math.max(0,(state.eventsFeed||[]).length-before);g.eventsSuppressed+=Math.max(0,excess-3);state.eventsFeed=(state.eventsFeed||[]).filter(e=>['Critical','High'].includes(e.severity||'')||(e.importance as any)==='MAJOR'||(e.importance as any)===100).slice(0,60);state.newsArchive=(state.newsArchive||[]).slice(0,120);state.pendingDecisions=(state.pendingDecisions||[]).sort((a,b)=>(b.priority||50)-(a.priority||50)).slice(0,5);}

export function auditLivingWorld(state:GameState){const g=ensureWorldGovernor(state);g.lastAuditTick=state.simulationTick;g.systemHealth={...summarizeSystems(state),eventQueue:state.eventsFeed?.length||0,pendingDecisions:state.pendingDecisions?.length||0,realEstateIndustry:ensureRealEstateIndustry(state).industryHistory.length};return g;}

/** Internal/autonomous long-horizon simulation. No UI action is exposed. Uses the canonical monthly engine so every existing engine remains authoritative. Output is aggressively compressed. */
export function runGovernedSimulation(state:GameState,targetMonths:number,options:{maxMonthsPerCall?:number}={}):{state:GameState;monthsProcessed:number;criticalSignals:string[]}{
 const g=ensureWorldGovernor(state); const target=Math.max(0,Math.min(WORLD_GOVERNOR_MAX_TARGET,Math.floor(targetMonths))); const maxPerCall=options.maxMonthsPerCall??target; let processed=0;
 while(processed<target&&processed<maxPerCall){const beforeEvents=state.eventsFeed?.length||0;const result:MonthlySimulationResult=advanceOneMonth(state);Object.assign(state,result.nextState);processed++;g.processedTicks++;g.simulationsRun++;retainHighSignal(state,beforeEvents);if(processed%12===0)auditLivingWorld(state);}
 return {state,monthsProcessed:processed,criticalSignals:[...g.criticalSignals]};
}

/** Faster governance-facing batch used by tests and background progression. It deliberately never creates a player-facing "simulate 20,000" control. */
export async function runGovernedSimulationAsync(state:GameState,targetMonths:number,onProgress?:(completed:number,total:number)=>void){
 const total=Math.max(0,Math.min(WORLD_GOVERNOR_MAX_TARGET,Math.floor(targetMonths)));let done=0;while(done<total){const batch=Math.min(12,total-done);runGovernedSimulation(state,batch,{maxMonthsPerCall:batch});done+=batch;onProgress?.(done,total);await new Promise<void>(resolve=>setTimeout(resolve,0));}return {state,monthsProcessed:done,criticalSignals:ensureWorldGovernor(state).criticalSignals};
}
export function runAutonomousBackgroundCycle(state:GameState,months:number){return runGovernedSimulation(state,months,{maxMonthsPerCall:Math.min(months,12)});}
