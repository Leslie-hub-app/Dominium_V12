import { GameState, LifeEvent, NewsItem, PendingDecision, WorldEnginePriority, WorldEngineRegistration, WorldGovernorCheckpoint } from '../types';
import { ensureWorldGovernor } from './worldGovernorState';

const ENGINE_DEFS: WorldEngineRegistration[] = [
  {id:'economy',name:'Macroeconomy',priority:'CRITICAL',dependsOn:[],health:'HEALTHY',lastTick:-1,relevance:100},
  {id:'banking',name:'Banking & Credit',priority:'CRITICAL',dependsOn:['economy'],health:'HEALTHY',lastTick:-1,relevance:95},
  {id:'government',name:'Government',priority:'HIGH',dependsOn:['economy'],health:'HEALTHY',lastTick:-1,relevance:80},
  {id:'politics',name:'Politics & Elections',priority:'HIGH',dependsOn:['government','economy'],health:'HEALTHY',lastTick:-1,relevance:78},
  {id:'companies',name:'Corporate World',priority:'HIGH',dependsOn:['economy','banking'],health:'HEALTHY',lastTick:-1,relevance:90},
  {id:'real_estate',name:'Real Estate Industry',priority:'HIGH',dependsOn:['economy','banking','government'],health:'HEALTHY',lastTick:-1,relevance:85},
  {id:'npc',name:'NPC Society',priority:'HIGH',dependsOn:['companies','government','economy'],health:'HEALTHY',lastTick:-1,relevance:88},
  {id:'households',name:'Households & Lifestyle',priority:'NORMAL',dependsOn:['npc','banking','economy'],health:'HEALTHY',lastTick:-1,relevance:82},
  {id:'markets',name:'Asset Markets',priority:'NORMAL',dependsOn:['companies','real_estate','banking'],health:'HEALTHY',lastTick:-1,relevance:76},
  {id:'events',name:'Causal Events',priority:'NORMAL',dependsOn:['npc','companies','government'],health:'HEALTHY',lastTick:-1,relevance:70},
  {id:'history',name:'History & Narrative',priority:'LOW',dependsOn:['events'],health:'HEALTHY',lastTick:-1,relevance:50},
  {id:'background',name:'Background World Activity',priority:'BACKGROUND',dependsOn:['economy','npc'],health:'HEALTHY',lastTick:-1,relevance:30}
];

const PRIORITY_WEIGHT:Record<WorldEnginePriority,number>={CRITICAL:5,HIGH:4,NORMAL:3,LOW:2,BACKGROUND:1};
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
function checkpointSnapshot(state:GameState){ const copy=clone(state); if(copy.worldGovernor) copy.worldGovernor.checkpoints=[]; return copy; }

export function ensureGovernor2(state:GameState){
 const g=ensureWorldGovernor(state);
 g.version=2; g.coordinationVersion=2;
 g.engineRegistry=g.engineRegistry?.length?g.engineRegistry:clone(ENGINE_DEFS);
 g.dependencyGraph=Object.fromEntries(g.engineRegistry.map(e=>[e.id,e.dependsOn]));
 g.enginePriorities=Object.fromEntries(g.engineRegistry.map(e=>[e.id,e.priority]));
 g.adaptiveLod=g.adaptiveLod||'FULL'; g.activeEngineIds=g.activeEngineIds||g.engineRegistry.map(e=>e.id);
 g.interestSignals=g.interestSignals||[]; g.feedbackLoops=g.feedbackLoops||[]; g.importanceQueue=g.importanceQueue||[]; g.compressedHistory=g.compressedHistory||[]; g.checkpoints=g.checkpoints||[]; g.anomalyCount=g.anomalyCount||0; g.playerActionJournal=g.playerActionJournal||[]; g.reconciliationLog=g.reconciliationLog||[]; g.engineMessageBus=g.engineMessageBus||[];
 return g;
}

function digest(state:GameState){return JSON.stringify({tick:state.simulationTick,cash:state.finances?.cash,netWorth:state.finances?.properties?.length,companies:state.companies?.length,pending:state.pendingDecisions?.length,events:state.eventsFeed?.length});}
function anomaly(state:GameState){
 const f=state.finances?.cash; if(!Number.isFinite(f)) return 'Player cash became non-finite.';
 if(!Number.isFinite(state.simulationTick)||state.simulationTick<0) return 'Simulation tick became invalid.';
 if((state.pendingDecisions||[]).length>50) return 'Decision queue exceeded governor safety threshold.';
 if((state.eventsFeed||[]).length>250) return 'Event feed exceeded governor safety threshold.';
 return null;
}

export function createGovernorCheckpoint(state:GameState, reason='scheduled'){
 const g=ensureGovernor2(state); const cp:WorldGovernorCheckpoint={id:`wg_cp_${state.simulationTick}_${Date.now()}`,tick:state.simulationTick,month:state.currentMonth,year:state.currentYear,createdAt:new Date().toISOString(),stateDigest:digest(state),stateSnapshot:checkpointSnapshot(state)};
 g.checkpoints=[cp,...(g.checkpoints||[])].slice(0,3); g.lastCheckpointTick=state.simulationTick; g.lastGovernanceAction=`Checkpoint created (${reason})`; return cp;
}

export function recoverFromGovernorCheckpoint(state:GameState):GameState{
 const g=ensureGovernor2(state); const cp=g.checkpoints?.[0]; if(!cp) return state;
 const recovered=clone(cp.stateSnapshot) as GameState; const rg=ensureGovernor2(recovered); rg.anomalyCount=(rg.anomalyCount||0)+1; rg.lastAnomaly='Recovered from simulation anomaly using World Governor checkpoint.'; rg.lastGovernanceAction='Recovered last known-good checkpoint'; return recovered;
}

function calculatePlayerInterest(state:GameState){
 const out=[
  {key:'wealth',score:Math.min(100,Math.round((state.finances?.cash||0)/10000)),reason:'Cash and net-worth exposure'},
  {key:'career',score:state.currentJob?70:35,reason:'Current employment and career trajectory'},
  {key:'real_estate',score:Math.min(100,(state.realEstatePlatform?.projects?.length||0)*12+(state.finances?.properties?.length||0)*8),reason:'Property and development exposure'},
  {key:'corporate',score:Math.min(100,(state.companies?.length||0)*18),reason:'Corporate ownership and governance exposure'},
  {key:'politics',score:state.politics?.currentOffice?.title&&state.politics.currentOffice.title!=='None'?85:25,reason:'Political office and influence'},
  {key:'family',score:Math.min(100,(state.relationships?.length||0)*10),reason:'Household and relationship exposure'}
 ];
 return out.sort((a,b)=>b.score-a.score).slice(0,6);
}

function scoreEvent(e:LifeEvent){
 const severity=(e.severity||'Low').toString(); const base=severity==='Critical'?100:severity==='High'?75:severity==='Major'?60:severity==='Moderate'?35:15; return Math.min(100,base+(e.priority&&e.priority>=80?20:0));
}
function scoreNews(n:NewsItem){return n.importance==='BREAKING'?100:n.importance==='MAJOR'?70:n.importance==='NORMAL'?35:15;}
function scoreDecision(d:PendingDecision){return Math.min(100,(d.priority||50)+(d.urgency==='Critical'?25:d.urgency==='Urgent'?15:0));}

function reconcileCrossEngineConflicts(state:GameState, g:any){
 const conflicts:string[]=[];
 if((state.finances?.cash||0)<0){state.finances.cash=0;conflicts.push('negative player cash');}
 for(const p of state.finances?.properties||[]){if(!Number.isFinite(p.currentValue)||p.currentValue<0){p.currentValue=Math.max(0,p.purchasePrice||0);conflicts.push(`invalid property value:${p.id}`);}}
 for(const c of state.companies||[]){if(!Number.isFinite(c.cashReserve)) {c.cashReserve=Math.max(0,c.cash||0);conflicts.push(`invalid company cash:${c.id}`);}}
 g.reconciliationLog=[{tick:state.simulationTick,conflicts:conflicts.length,resolved:conflicts.length,summary:conflicts.length?`Governor reconciled ${conflicts.length} cross-engine state conflict(s).`:'No cross-engine conflicts detected.'},...(g.reconciliationLog||[])].slice(0,24);
 return conflicts.length;
}
function publishEngineSignals(state:GameState,g:any){
 const bus=[
  {tick:state.simulationTick,source:'economy',target:'real_estate',signal:`cycle:${state.livingWorld?.economy?.currentCycle||'UNKNOWN'}`,weight:5},
  {tick:state.simulationTick,source:'banking',target:'real_estate',signal:`credit:${state.character.creditScore||680}`,weight:4},
  {tick:state.simulationTick,source:'companies',target:'households',signal:`employment:${state.companies?.reduce((a,c)=>a+(c.employeesCount||0),0)||0}`,weight:4},
  {tick:state.simulationTick,source:'real_estate',target:'wealth',signal:`properties:${state.finances?.properties?.length||0}`,weight:3}
 ];
 g.engineMessageBus=[...bus,...(g.engineMessageBus||[])].slice(0,80);
}
export function recordWorldPlayerAction(state:GameState, actionType:string, summary:string, affectedSystems:string[], importance=60){const g=ensureGovernor2(state);g.playerActionJournal=[{tick:state.simulationTick,actionType,summary,affectedSystems,importance},...(g.playerActionJournal||[])].slice(0,100);return g;}

export function governWorldTick(state:GameState, context?:{events?:LifeEvent[];news?:NewsItem[];decisions?:PendingDecision[]}):GameState{
 let s=state; const g=ensureGovernor2(s); reconcileCrossEngineConflicts(s,g); publishEngineSignals(s,g); const interest=calculatePlayerInterest(s); g.interestSignals=interest;
 const signals=[...(context?.events||[]).map(e=>({id:e.id,score:scoreEvent(e),kind:'EVENT' as const,summary:e.title})),...(context?.news||[]).map(n=>({id:n.id,score:scoreNews(n),kind:'NEWS' as const,summary:n.headline})),...(context?.decisions||[]).map(d=>({id:d.id,score:scoreDecision(d),kind:'DECISION' as const,summary:d.title}))];
 g.importanceQueue=signals.sort((a,b)=>b.score-a.score).slice(0,25);
 const economyScore=state.livingWorld?.economy?.currentCycle==='EXPANSION'?75:state.livingWorld?.economy?.currentCycle==='RECESSION'?25:50;
 const propertyDemand=100-(state.realEstatePlatform?.averageVacancyRate||7)*5;
 const creditCapacity=state.creditProfileState?.creditScore||state.character.creditScore||680;
 const corporateMomentum=Math.min(100,(state.companies?.length||0)*10+((state.corporateDeepSimulation?.globalGDPGrowth||0)+3)*10);
 g.feedbackLoops=[
  {id:'economy_property',source:'economy',target:'real_estate',signal:Math.round((economyScore+propertyDemand)/2),direction:economyScore>50?'POSITIVE':economyScore<40?'NEGATIVE':'NEUTRAL',narrative:'Economic conditions steer property demand, vacancy and development appetite.'},
  {id:'credit_development',source:'banking',target:'real_estate',signal:Math.round(creditCapacity/8.5),direction:creditCapacity>700?'POSITIVE':creditCapacity<600?'NEGATIVE':'NEUTRAL',narrative:'Credit availability changes development financing capacity.'},
  {id:'corporate_jobs',source:'companies',target:'households',signal:Math.round(corporateMomentum),direction:corporateMomentum>55?'POSITIVE':corporateMomentum<35?'NEGATIVE':'NEUTRAL',narrative:'Corporate expansion or contraction feeds employment and household income.'},
  {id:'property_wealth',source:'real_estate',target:'wealth',signal:Math.round(propertyDemand),direction:propertyDemand>60?'POSITIVE':propertyDemand<35?'NEGATIVE':'NEUTRAL',narrative:'Property valuations and occupancy feed player and NPC wealth.'}
 ];
 const pressure=signals.reduce((a,x)=>a+x.score,0)/Math.max(1,signals.length);
 g.adaptiveLod=pressure>70?'FULL':pressure>45?'BALANCED':pressure>20?'ECONOMY':'DEEP_BACKGROUND';
 const active=g.engineRegistry.filter(e=>e.priority!=='BACKGROUND'||pressure>25||interest.some(i=>i.key===e.id&&i.score>40)).map(e=>e.id); g.activeEngineIds=active;
 for(const e of g.engineRegistry)e.lastTick=s.simulationTick;
 // Reconcile queues without deleting consequential history: retain high-value decisions and compress low-value output.
 const beforeD=s.pendingDecisions.length; const beforeE=s.eventsFeed.length;
 s.pendingDecisions=s.pendingDecisions.sort((a,b)=>scoreDecision(b)-scoreDecision(a)).slice(0,5);
 s.eventsFeed=s.eventsFeed.filter(e=>scoreEvent(e)>=45||e.priority&&e.priority>=80).slice(0,80);
 g.decisionsSuppressed+=(beforeD-s.pendingDecisions.length); g.eventsSuppressed+=(beforeE-s.eventsFeed.length);
 if(s.simulationTick%12===0){
  const hist=(s.eventsFeed||[]).length+(s.newsArchive||[]).length; g.compressedHistory=[{fromTick:Math.max(0,s.simulationTick-11),toTick:s.simulationTick,events:hist,decisions:beforeD,summary:`Governed annual-scale activity compressed at ${g.adaptiveLod} detail.`},...(g.compressedHistory||[])].slice(0,24);
 }
 const issue=anomaly(s); if(issue){g.anomalyCount=(g.anomalyCount||0)+1;g.lastAnomaly=issue;return recoverFromGovernorCheckpoint(s);}
 if(s.simulationTick%12===0 || !g.checkpoints?.length) createGovernorCheckpoint(s,'annual governance checkpoint');
 g.lastGovernanceTick=s.simulationTick; g.lastGovernanceAction=`Cross-engine reconciliation completed at ${g.adaptiveLod} detail.`; return s;
}
