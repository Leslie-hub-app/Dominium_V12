import { GameState, PoliticalOffice } from '../types';
import { recordFinancialTransaction } from './financialLedgerEngine';

export type PublicManagementArea='BUDGET'|'INFRASTRUCTURE'|'HEALTH'|'EDUCATION'|'PUBLIC_SAFETY'|'ECONOMY'|'ENVIRONMENT'|'HOUSING'|'TRANSPORT'|'FOREIGN_AFFAIRS';
export interface PoliticalGovernanceProfile {
  version:number;
  campaigns:{id:string;office:string;jurisdiction:string;budget:number;polling:number;status:'ACTIVE'|'WON'|'LOST'|'WITHDRAWN';startedTick:number}[];
  publicBudgets:Record<string,number>;
  serviceLevels:Record<string,number>;
  approvalHistory:{tick:number;approval:number;office:string}[];
  policyHistory:{tick:number;office:string;area:PublicManagementArea;decision:string;effect:string}[];
  publicEvents:{tick:number;title:string;narrative:string;severity:'INFO'|'WARNING'|'CRISIS'}[];
  officePowers:Record<string,string[]>;
}
const DEFAULT_POWERS:Record<string,string[]>={
  'City Councillor':['BUDGET','INFRASTRUCTURE','HOUSING','TRANSPORT'],
  'Mayor':['BUDGET','INFRASTRUCTURE','HOUSING','TRANSPORT','PUBLIC_SAFETY','ENVIRONMENT'],
  'Member of Parliament / Senator':['BUDGET','ECONOMY','HEALTH','EDUCATION','FOREIGN_AFFAIRS'],
  'Cabinet Minister':['BUDGET','ECONOMY','HEALTH','EDUCATION','INFRASTRUCTURE','FOREIGN_AFFAIRS'],
  'President / Prime Minister':['BUDGET','INFRASTRUCTURE','HEALTH','EDUCATION','PUBLIC_SAFETY','ECONOMY','ENVIRONMENT','HOUSING','TRANSPORT','FOREIGN_AFFAIRS']
};
function tick(s:GameState){return s.simulationTick||((s.currentYear||2026)*12+(s.currentMonth||1));}
export function ensurePoliticalGovernance(state:GameState):PoliticalGovernanceProfile{
  if(!state.politicalGovernance) state.politicalGovernance={version:1,campaigns:[],publicBudgets:{},serviceLevels:{},approvalHistory:[],policyHistory:[],publicEvents:[],officePowers:DEFAULT_POWERS};
  return state.politicalGovernance;
}
export function runForPublicOffice(state:GameState,office:string,jurisdiction:string,budget:number){
  const profile=ensurePoliticalGovernance(state); const rep=state.character.attributes.reputation||0; const inf=state.character.attributes.worldInfluence||0;
  const req=office.includes('President')||office.includes('Prime')?{r:88,i:80}:office.includes('Mayor')?{r:55,i:25}:office.includes('Parliament')||office.includes('Senator')?{r:68,i:45}:{r:40,i:15};
  if(rep<req.r||inf<req.i) return {success:false,message:`Not eligible. Requires reputation ${req.r} and influence ${req.i}.`};
  if((state.finances.cash||0)<budget) return {success:false,message:'Insufficient campaign funds.'};
  state.finances.cash-=budget;
  const polling=Math.max(5,Math.min(75,35+rep*0.25+inf*0.2+Math.log10(Math.max(1,budget))*2-20));
  const campaign={id:`camp_${tick(state)}_${Math.random().toString(36).slice(2,7)}`,office,jurisdiction,budget,polling,status:'ACTIVE' as const,startedTick:tick(state)};
  profile.campaigns.push(campaign); profile.publicEvents.unshift({tick:tick(state),title:`Campaign Launch: ${office}`,narrative:`A formal campaign for ${office} begins in ${jurisdiction}. Organizers deploy field teams, media, policy staff and voter outreach.`,severity:'INFO'});
  state.eventsFeed?.unshift({id:campaign.id,timestampMonth:state.currentMonth,timestampYear:state.currentYear,age:state.character.age,category:'Politics',title:`Campaign launched for ${office}`,description:`Your campaign begins in ${jurisdiction} with a ${polling.toFixed(1)}% starting polling estimate.`,consequences:{cashChange:-budget,details:['Campaign spending recorded.','Election outcome will depend on approval, party support, opposition, events and jurisdictional conditions.']}} as any);
  return {success:true,message:`Campaign launched for ${office} in ${jurisdiction}. Starting polling ${polling.toFixed(1)}%.`};
}
export function managePublicOffice(state:GameState,area:PublicManagementArea,delta:number,decision:string){
  const office=state.politics.currentOffice; if(!office.inOffice) return {success:false,message:'You do not currently hold public office.'};
  const profile=ensurePoliticalGovernance(state); const powers=profile.officePowers[office.title]||[]; if(!powers.includes(area)) return {success:false,message:`${office.title} does not have authority over ${area}.`};
  const key=`${office.title}:${area}`; profile.serviceLevels[key]=Math.max(0,Math.min(100,(profile.serviceLevels[key]||50)+delta));
  const country=state.world[state.currentCountryIndex]; let effect='';
  if(country){ if(area==='INFRASTRUCTURE') country.infrastructureScore=Math.max(0,Math.min(100,country.infrastructureScore+delta*0.2)); if(area==='HEALTH') country.healthSystemScore=Math.max(0,Math.min(100,country.healthSystemScore+delta*0.2)); if(area==='EDUCATION') country.educationScore=Math.max(0,Math.min(100,country.educationScore+delta*0.2)); if(area==='PUBLIC_SAFETY') country.politicalStability=Math.max(0,Math.min(100,country.politicalStability+delta*0.15)); if(area==='ECONOMY') country.gdpGrowthRate+=delta*0.02; }
  effect=`${area} service level changed to ${profile.serviceLevels[key].toFixed(1)}.`; profile.policyHistory.unshift({tick:tick(state),office:office.title,area,decision,effect});
  office.approvalRating=Math.max(10,Math.min(95,office.approvalRating+delta*0.12)); profile.approvalHistory.unshift({tick:tick(state),approval:office.approvalRating,office:office.title});
  return {success:true,message:`Public policy executed. ${effect}`};
}
export function simulateMonthlyPoliticalGovernance(state:GameState){
  const profile=ensurePoliticalGovernance(state); const office=state.politics.currentOffice;
  profile.campaigns.filter(c=>c.status==='ACTIVE').forEach(c=>{
    const eventPressure=Math.random()*12-6; c.polling=Math.max(1,Math.min(95,c.polling+(office.approvalRating-50)*0.03+eventPressure*0.2));
    if(tick(state)-c.startedTick>=6){const won=c.polling>=50; c.status=won?'WON':'LOST'; if(won){office.title=c.office;office.cityOrNation=c.jurisdiction;office.inOffice=true;office.approvalRating=Math.max(55,c.polling);office.politicalCapital=Math.max(30,office.politicalCapital+15); state.character.attributes.worldInfluence=Math.min(100,state.character.attributes.worldInfluence+10); profile.publicEvents.unshift({tick:tick(state),title:`Election Result: ${c.office}`,narrative:`Election authorities certify your ${won?'victory':'defeat'} after a competitive campaign in ${c.jurisdiction}.`,severity:won?'INFO':'WARNING'});}}
  });
  if(office.inOffice){ const country=state.world[state.currentCountryIndex]; const pressure=country?.businessCycle==='Recession'?-0.6:0.15; office.approvalRating=Math.max(10,Math.min(95,office.approvalRating+pressure)); profile.approvalHistory.unshift({tick:tick(state),approval:office.approvalRating,office:office.title}); }
}
