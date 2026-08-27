import { GameState, LifeEvent, PendingDecision } from '../types';

export type PlayablePath = 'CAREER'|'POLITICS'|'BUSINESS'|'TYCOON'|'SPORTS';
export interface PlayablePathState { path: PlayablePath; reputation:number; influence:number; skill:number; capital:number; momentum:number; relationships:number; narrative:number; lastDecision?:string; }
export interface PlayablePathsProfile { paths: Record<PlayablePath,PlayablePathState>; unlocked:string[]; }

const base=(path:PlayablePath):PlayablePathState=>({path,reputation:0,influence:0,skill:0,capital:0,momentum:0,relationships:0,narrative:0});
export function ensurePlayablePaths(state:GameState):PlayablePathsProfile {
 const s:any=state; if(!s.playablePaths) s.playablePaths={paths:Object.fromEntries((['CAREER','POLITICS','BUSINESS','TYCOON','SPORTS'] as PlayablePath[]).map(p=>[p,base(p)])),unlocked:[]}; return s.playablePaths;
}
export const PLAYABLE_DECISION_CATALOG:Record<PlayablePath,Array<{id:string;title:string;description:string}>>={
 CAREER:[{id:'career_network',title:'Build your network',description:'Spend time building relationships that unlock referrals and hidden opportunities.'},{id:'career_skill',title:'Invest in mastery',description:'Study, certify or practise for long-term advancement.'},{id:'career_risk',title:'Take the stretch role',description:'Accept a difficult role with greater upside and failure risk.'}],
 POLITICS:[{id:'politics_local',title:'Build a local base',description:'Work through community, party or civic networks.'},{id:'politics_policy',title:'Champion a policy',description:'Trade popularity, influence and principle to build a political identity.'},{id:'politics_coalition',title:'Negotiate a coalition',description:'Gain power through alliances, compromises and rivalries.'}],
 BUSINESS:[{id:'business_product',title:'Launch or improve a product',description:'Choose differentiation, quality, price and speed.'},{id:'business_contract',title:'Negotiate a contract',description:'Trade margin against certainty and long-term relationships.'},{id:'business_hire',title:'Make a key hire',description:'Choose talent, loyalty, cost and cultural fit.'}],
 TYCOON:[{id:'tycoon_acquire',title:'Acquire an asset',description:'Use capital or leverage to expand your portfolio.'},{id:'tycoon_merge',title:'Pursue a merger',description:'Create scale but accept integration and political risk.'},{id:'tycoon_allocate',title:'Reallocate capital',description:'Choose liquidity, growth, dividends or strategic control.'}],
 SPORTS:[{id:'sports_recruit',title:'Recruit talent',description:'Balance potential, cost, personality and team fit.'},{id:'sports_strategy',title:'Set competitive strategy',description:'Choose development, immediate results or rebuilding.'},{id:'sports_media',title:'Handle the media',description:'Protect relationships, reputation and morale under pressure.'}]
};
export function makePlayablePathDecisions(state:GameState):PendingDecision[]{
 const p=ensurePlayablePaths(state); const month=(state.currentMonth||state.month||1); const candidates=(Object.keys(p.paths) as PlayablePath[]).filter((_,i)=>(month+i)%3===0).slice(0,2);
 return candidates.map(path=>{const opts=PLAYABLE_DECISION_CATALOG[path]; const o=opts[(month+path.length)%opts.length]; return {id:`path_${path}_${state.simulationTick}_${o.id}`,category:'Opportunity',title:o.title,description:`${o.description} This choice can affect your ${path.toLowerCase()} trajectory, relationships and future narratives.`,options:[{id:'commit',label:'Commit',description:'Pursue the opportunity.'},{id:'decline',label:'Decline',description:'Preserve resources and wait.'}],expiresAtTick:(state.simulationTick||0)+2} as any});
}
export function advancePlayablePaths(state:GameState):{events:LifeEvent[];decisions:PendingDecision[]}{
 const profile=ensurePlayablePaths(state); const events:LifeEvent[]=[]; for(const p of Object.values(profile.paths)){
   const macro:any=(state as any).livingWorld?.globalConditions; const pressure=Math.max(0, Number(macro?.economicStress||0));
   p.momentum=Math.max(-100,Math.min(100,p.momentum+(p.skill+p.relationships+p.reputation)/300-pressure/20-1));
   p.narrative+=1;
   if(p.momentum>20 && p.narrative%6===0) events.push({id:`path_event_${p.path}_${state.simulationTick}`,timestampMonth:state.currentMonth,timestampYear:state.currentYear,age:state.character.age,category:p.path,type:'MILESTONE',title:`${p.path} momentum is building`,description:'Your recent decisions are beginning to create new opportunities and reactions from other actors.',severity:'Medium',consequences:{details:['New opportunities may become available.']}} as any);
 }
 return {events,decisions:makePlayablePathDecisions(state)};
}
