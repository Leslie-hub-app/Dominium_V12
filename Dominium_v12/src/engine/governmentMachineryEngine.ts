import { GameState, GovernmentLivingProfile, GovernmentMinistry } from '../types';

export type ParliamentaryCommitteeType = 'FINANCE'|'PUBLIC_ACCOUNTS'|'DEFENCE'|'HEALTH'|'EDUCATION'|'JUSTICE'|'COMMERCE'|'LABOUR'|'ENVIRONMENT'|'FOREIGN_AFFAIRS';
export type PolicyStatus = 'DRAFT'|'CABINET'|'COMMITTEE'|'PARLIAMENT'|'ENACTED'|'REJECTED';

const committees: ParliamentaryCommitteeType[] = ['FINANCE','PUBLIC_ACCOUNTS','DEFENCE','HEALTH','EDUCATION','JUSTICE','COMMERCE','LABOUR','ENVIRONMENT','FOREIGN_AFFAIRS'];
const clamp=(n:number,a=0,b=100)=>Math.max(a,Math.min(b,n));
const tick=(s:GameState)=>s.simulationTick;
const title=(s:GameState)=>s.politics.currentOffice?.title||'';
const canNational=(s:GameState)=>!!s.politics.currentOffice?.inOffice && /President|Prime|Minister|Parliament|Senator|Mayor/.test(title(s));
function g(s:GameState){
  const p=s.governmentLiving as GovernmentLivingProfile & {machinery?:GovernmentMachineryState};
  if(!p) throw new Error('Government living profile has not been initialized.');
  p.machinery ??= createMachinery(s);
  return p.machinery;
}
function record(s:GameState, narrative:string, severity:'INFO'|'WARNING'|'CRISIS'='INFO'){
  s.eventsFeed?.unshift({id:`govmach_${tick(s)}_${Math.random().toString(36).slice(2,8)}`,timestampMonth:s.currentMonth,timestampYear:s.currentYear,age:s.character.age,category:'Politics',title:'Government Machinery',description:narrative,consequences:{details:[severity]}} as any);
}

export interface WhipState { partyId:string; chiefNpcId?:string; discipline:number; coalitionSupport:number; loyaltyPressure:number; }
export interface CommitteeState { id:string; type:ParliamentaryCommitteeType; chairNpcId?:string; memberNpcIds:string[]; workload:number; scrutiny:number; activeInvestigations:string[]; }
export interface CabinetMeeting { id:string; tick:number; agenda:string[]; attendanceNpcIds:string[]; decisions:string[]; confidence:number; }
export interface MinistryPolicyProposal { id:string; ministry:GovernmentMinistry; title:string; sponsorNpcId?:string; status:PolicyStatus; cost:number; expectedGrowth:number; expectedApproval:number; risk:number; rationale:string; }
export interface BudgetLine { id:string; ministry:GovernmentMinistry; category:string; requested:number; approved:number; votesFor:number; votesAgainst:number; status:'PROPOSED'|'APPROVED'|'CUT'|'REJECTED'; }
export interface TaxLine { id:string; category:'INCOME'|'CORPORATE'|'VAT'|'PROPERTY'|'CAPITAL_GAINS'|'PAYROLL'|'CUSTOMS'; rate:number; revenue:number; burden:number; progressivity:number; }
export interface DebtIssue { id:string; instrument:'TREASURY_BILL'|'GOVERNMENT_BOND'|'INFLATION_LINKED_BOND'; principal:number; coupon:number; maturityMonths:number; investorDemand:number; status:'ISSUED'|'PARTIALLY_FILLED'|'REJECTED'|'MATURED'; tick:number; }
export interface ProcurementTender { id:string; title:string; ministry:GovernmentMinistry; value:number; bidders:{companyId:string; companyName:string; bid:number; quality:number; integrity:number; score:number}[]; status:'OPEN'|'EVALUATED'|'AWARDED'|'CANCELLED'; winnerCompanyId?:string; }
export interface LobbyingRecord { id:string; companyId?:string; organization:string; targetArea:string; pressure:number; transparency:number; influence:number; tick:number; }
export interface Investigation { id:string; title:string; type:'CORRUPTION'|'PROCUREMENT'|'CONSTITUTIONAL'|'FINANCIAL'; targetNpcIds:string[]; targetCompanyIds:string[]; severity:number; evidence:number; status:'OPEN'|'HEARING'|'CLOSED'|'REFERRED_TO_COURT'; outcome?:string; }
export interface CourtCase { id:string; title:string; plaintiff:string; defendant:string; issue:string; constitutionalQuestion:boolean; urgency:number; probabilityForGovernment:number; status:'FILED'|'HEARING'|'JUDGMENT'|'APPEAL'|'CLOSED'; judgment?:string; }
export interface ConstitutionalConstraint { id:string; principle:string; protectedArea:string; threshold:number; breachRisk:number; active:boolean; }
export interface PoliticalCrisis { id:string; title:string; trigger:string; severity:number; escalation:number; monthsActive:number; resolved:boolean; }
export interface TreatyState { id:string; countryId:string; type:'TRADE'|'DEFENCE'|'INVESTMENT'|'DIPLOMATIC'; ratificationRequired:boolean; ratified:boolean; obligations:string[]; }
export interface GovernmentMachineryState {
  version:number; whips:WhipState[]; committees:CommitteeState[]; cabinetMeetings:CabinetMeeting[]; policyProposals:MinistryPolicyProposal[]; budgetLines:BudgetLine[]; taxes:TaxLine[]; debtIssues:DebtIssue[]; tenders:ProcurementTender[]; lobbying:LobbyingRecord[]; investigations:Investigation[]; courts:CourtCase[]; constitutionalConstraints:ConstitutionalConstraint[]; crises:PoliticalCrisis[]; treaties:TreatyState[]; lastProcessedTick:number;
}

function createMachinery(s:GameState):GovernmentMachineryState{
  const base=(s.governmentLiving?.parliamentarians||[]);
  const parties=[...new Set(base.map(x=>x.partyId))];
  return {version:1, whips:parties.map((partyId,i)=>({partyId,chiefNpcId:base.find(x=>x.partyId===partyId)?.npcId,discipline:65+i%20,coalitionSupport:50,loyaltyPressure:20})), committees:committees.map((type,i)=>({id:`committee_${type.toLowerCase()}`,type,chairNpcId:base[i]?.npcId,memberNpcIds:base.filter(x=>x.committee.toUpperCase().replace(/ /g,'_').includes(type)||i%3===0).slice(0,8).map(x=>x.npcId),workload:30,scrutiny:55,activeInvestigations:[]})),cabinetMeetings:[],policyProposals:[],budgetLines:[],taxes:[
    {id:'tax_income',category:'INCOME',rate:28,revenue:0,burden:35,progressivity:70},{id:'tax_corporate',category:'CORPORATE',rate:27,revenue:0,burden:25,progressivity:45},{id:'tax_vat',category:'VAT',rate:15,revenue:0,burden:30,progressivity:25},{id:'tax_property',category:'PROPERTY',rate:1,revenue:0,burden:10,progressivity:55},{id:'tax_capital_gains',category:'CAPITAL_GAINS',rate:18,revenue:0,burden:15,progressivity:65},{id:'tax_payroll',category:'PAYROLL',rate:2,revenue:0,burden:18,progressivity:40},{id:'tax_customs',category:'CUSTOMS',rate:5,revenue:0,burden:12,progressivity:20}],debtIssues:[],tenders:[],lobbying:[],investigations:[],courts:[],constitutionalConstraints:[{id:'budget_legality',principle:'Public spending requires lawful appropriation',protectedArea:'budget',threshold:100,breachRisk:0,active:true},{id:'judicial_review',principle:'Executive actions remain subject to judicial review',protectedArea:'executive',threshold:100,breachRisk:0,active:true},{id:'central_bank_independence',principle:'Monetary policy remains operationally independent',protectedArea:'monetary',threshold:50,breachRisk:0,active:true}],crises:[],treaties:[],lastProcessedTick:-1};
}

export function ensureGovernmentMachinery(state:GameState):GovernmentMachineryState { return g(state); }

export function callCabinetMeeting(state:GameState, agenda:string[]):{success:boolean;message:string;meeting?:CabinetMeeting}{
  if(!canNational(state)) return {success:false,message:'Cabinet authority is unavailable.'};
  const profile=state.governmentLiving!; const ministers=profile.ministries.map(m=>m.ministerNpcId).filter(Boolean) as string[];
  const confidence=clamp(55+ministers.length*2-(agenda.length-3)*5);
  const meeting={id:`cab_${tick(state)}_${Date.now()}`,tick:tick(state),agenda,attendanceNpcIds:ministers,decisions:[],confidence};
  g(state).cabinetMeetings.unshift(meeting); g(state).cabinetMeetings=g(state).cabinetMeetings.slice(0,60);
  record(state,`Cabinet meeting convened with ${attendanceNpcIdsLabel(meeting)}. Agenda: ${agenda.join(', ')}.`); return {success:true,message:'Cabinet meeting convened.',meeting};
}
function attendanceNpcIdsLabel(m:CabinetMeeting){return `${m.attendanceNpcIds.length} ministers/officials in attendance`;}

export function proposeMinistryPolicy(state:GameState, ministry:GovernmentMinistry, proposal:{title:string;cost:number;expectedGrowth:number;expectedApproval:number;risk:number;rationale:string}):{success:boolean;message:string;proposal?:MinistryPolicyProposal}{
  if(!canNational(state)) return {success:false,message:'You do not hold sufficient public office authority.'};
  const ps=g(state); const p:MinistryPolicyProposal={id:`policy_${tick(state)}_${Date.now()}`,ministry,title:proposal.title,sponsorNpcId:state.character.id,status:'CABINET',...proposal}; ps.policyProposals.unshift(p);
  record(state,`${ministry} submits policy proposal “${p.title}”. It enters cabinet review before parliamentary scrutiny.`); return {success:true,message:'Policy proposal submitted to Cabinet.',proposal:p};
}

export function votePolicyProposal(state:GameState, proposalId:string, pass:boolean){
  const ps=g(state); const p=ps.policyProposals.find(x=>x.id===proposalId); if(!p)return{success:false,message:'Policy proposal not found.'};
  if(pass){p.status='COMMITTEE'; const c=ps.committees.find(x=>x.type===committeeFor(p.ministry)); if(c)c.workload=clamp(c.workload+10); record(state,`Cabinet advanced “${p.title}” to parliamentary committee review.`);}else{p.status='REJECTED';record(state,`Cabinet rejected “${p.title}”.`,'WARNING');}
  return{success:true,message:`Policy is now ${p.status}.`};
}
function committeeFor(m:GovernmentMinistry):ParliamentaryCommitteeType{const map:Record<GovernmentMinistry,ParliamentaryCommitteeType>={Finance:'FINANCE','Foreign Affairs':'FOREIGN_AFFAIRS',Health:'HEALTH',Education:'EDUCATION',Defence:'DEFENCE',Infrastructure:'PUBLIC_ACCOUNTS',Energy:'COMMERCE',Justice:'JUSTICE',Commerce:'COMMERCE',Labour:'LABOUR',Environment:'ENVIRONMENT'};return map[m];}

export function createLineItemBudget(state:GameState, ministry:GovernmentMinistry, category:string, requested:number){const ps=g(state);const line:BudgetLine={id:`budget_${tick(state)}_${Date.now()}`,ministry,category,requested,approved:0,votesFor:0,votesAgainst:0,status:'PROPOSED'};ps.budgetLines.unshift(line);return line;}
export function voteBudgetLine(state:GameState,lineId:string,approve:boolean){const ps=g(state);const line=ps.budgetLines.find(x=>x.id===lineId);if(!line)return{success:false,message:'Budget line not found.'};line[approve?'votesFor':'votesAgainst']++;if(line.votesFor>=Math.max(1,line.votesAgainst+1)){line.approved=line.requested;line.status='APPROVED';}else if(line.votesAgainst>=line.votesFor+2){line.status='CUT';line.approved=Math.max(0,line.requested*.75);}return{success:true,message:`${line.category} is ${line.status.toLowerCase()}.`};}

export function setTaxCategory(state:GameState,category:TaxLine['category'],rate:number){if(!canNational(state))return{success:false,message:'Tax policy requires national authority.'};const ps=g(state);const t=ps.taxes.find(x=>x.category===category);if(!t)return{success:false,message:'Tax category not found.'};const old=t.rate;t.rate=clamp(rate,0,60);const country=state.world[state.currentCountryIndex];const gdp=(country?.gdpBillions||1000)*1e9;const baseShare={INCOME:.18,CORPORATE:.08,VAT:.14,PROPERTY:.03,CAPITAL_GAINS:.03,PAYROLL:.03,CUSTOMS:.02}[category];t.revenue=gdp*baseShare*(t.rate/30);const total=ps.taxes.reduce((a,x)=>a+x.revenue,0);ps.taxes.forEach(x=>x.revenue=x.revenue||0);state.governmentLiving!.budget.totalRevenue=Math.max(0,total);record(state,`${category.replace('_',' ')} tax rate changed from ${old.toFixed(1)}% to ${t.rate.toFixed(1)}%. Household and business behavior will respond through the living economy.`);return{success:true,message:`${category} tax set to ${t.rate.toFixed(1)}%.`};}

export function issueGovernmentDebt(state:GameState, instrument:DebtIssue['instrument'], principal:number, maturityMonths:number, coupon:number){if(!canNational(state))return{success:false,message:'Debt issuance requires national authority.'};const ps=g(state);const demand=clamp(70-(state.governmentLiving!.budget.debt/Math.max(1,state.governmentLiving!.budget.totalRevenue))*10+state.governmentLiving!.centralBank.independence*.1);const d:DebtIssue={id:`debt_${tick(state)}_${Date.now()}`,instrument,principal,coupon,maturityMonths,investorDemand:demand,status:demand>45?'ISSUED':'PARTIALLY_FILLED',tick:tick(state)};ps.debtIssues.unshift(d);const filled=d.status==='ISSUED'?principal:principal*.6;state.governmentLiving!.budget.debt+=filled;state.governmentLiving!.budget.totalRevenue+=filled;record(state,`Treasury issued ${instrument.replace('_',' ').toLowerCase()} worth $${Math.round(filled).toLocaleString()} at ${coupon.toFixed(2)}% coupon.`,'WARNING');return{success:true,message:`Debt issue ${d.status.toLowerCase()}.`,issue:d};}

export function openProcurementTender(state:GameState,title:string,ministry:GovernmentMinistry,value:number){if(!canNational(state))return{success:false,message:'Procurement authority unavailable.'};const ps=g(state);const bidders=state.companies.slice(0,8).map(c=>{const bid=value*(.85+Math.random()*.3);const quality=clamp(c.productQuality||60);const integrity=clamp(70-(c.creditRating==='CCC'?20:0));return{companyId:c.id,companyName:c.name,bid,quality,integrity,score:quality*.45+integrity*.25+(value/Math.max(1,bid))*30};});const t:ProcurementTender={id:`tender_${tick(state)}_${Date.now()}`,title,ministry,value,bidders,status:'EVALUATED'};t.bidders.sort((a,b)=>b.score-a.score);t.winnerCompanyId=t.bidders[0]?.companyId;t.status=t.winnerCompanyId?'AWARDED':'OPEN';ps.tenders.unshift(t);if(t.winnerCompanyId){const c=state.companies.find(x=>x.id===t.winnerCompanyId);state.governmentLiving!.procurement.unshift({id:`contract_${t.id}`,title,ministry,companyId:c?.id,supplierName:c?.name||'Unknown Supplier',value:t.bidders[0].bid,durationMonths:12,status:'AWARDED',integrityRisk:100-t.bidders[0].integrity});}record(state,`Competitive procurement tender “${title}” evaluated across ${bidders.length} corporate bidders. Winner: ${t.bidders[0]?.companyName||'none'}.`,'INFO');return{success:true,message:`Tender awarded to ${t.bidders[0]?.companyName||'no bidder'}.`,tender:t};}

export function submitCorporateLobbying(state, organization:string,targetArea:string,pressure:number,companyId?:string){const ps=g(state);const rec:LobbyingRecord={id:`lobby_${tick(state)}_${Date.now()}`,companyId,organization,targetArea,pressure:clamp(pressure),transparency:companyId?65:80,influence:clamp(pressure*.8),tick:tick(state)};ps.lobbying.unshift(rec);state.governmentLiving!.lobbyingPressure[targetArea]=(state.governmentLiving!.lobbyingPressure[targetArea]||0)+rec.influence;record(state,`${organization} lobbied government on ${targetArea}. Influence is recorded and subject to transparency and integrity review.`);return{success:true,message:'Lobbying activity registered.',record:rec};}

export function openGovernmentInvestigation(state:GameState,title:string,type:Investigation['type'],targetNpcIds:string[]=[],targetCompanyIds:string[]=[]){const ps=g(state);const evidence=clamp(35+targetNpcIds.length*8+targetCompanyIds.length*6+Math.random()*30);const inv:Investigation={id:`inv_${tick(state)}_${Date.now()}`,title,type,targetNpcIds,targetCompanyIds,severity:Math.round(clamp(evidence)),evidence,status:'OPEN'};ps.investigations.unshift(inv);if(type==='CONSTITUTIONAL')inv.status='REFERRED_TO_COURT';record(state,`Investigation opened: ${title}. Evidence strength is ${Math.round(evidence)}/100.`,'WARNING');return{success:true,message:'Investigation opened.',investigation:inv};}

export function fileConstitutionalCase(state:GameState,title:string,plaintiff:string,defendant:string,issue:string){const ps=g(state);const caseFile:CourtCase={id:`case_${tick(state)}_${Date.now()}`,title,plaintiff,defendant,issue,constitutionalQuestion:true,urgency:60,probabilityForGovernment:clamp(50+state.governmentLiving!.centralBank.independence*.05),status:'FILED'};ps.courts.unshift(caseFile);record(state,`Constitutional challenge filed over ${issue}. Government must prepare a legal defence.`,'WARNING');return{success:true,message:'Case filed.',caseFile};}

export function resolveCourtCase(state:GameState,caseId:string){const ps=g(state);const c=ps.courts.find(x=>x.id===caseId);if(!c)return{success:false,message:'Court case not found.'};c.status='JUDGMENT';const win=Math.random()*100<c.probabilityForGovernment;c.judgment=win?'Government action upheld':'Government action limited or struck down';c.status='CLOSED';record(state,`Court judgment: ${c.judgment}.`,'WARNING');return{success:true,message:c.judgment};}

export function proposeTreaty(state:GameState,countryId:string,type:TreatyState['type'],obligations:string[]){const ps=g(state);const d=state.governmentLiving!.diplomacy.find(x=>x.countryId===countryId);if(!d)return{success:false,message:'Country not found.'};const treaty:TreatyState={id:`treaty_${tick(state)}_${Date.now()}`,countryId,type,ratificationRequired:true,ratified:false,obligations};ps.treaties.unshift(treaty);d.activeTreaties.push(treaty.id);record(state,`A ${type.toLowerCase()} treaty was negotiated with ${d.countryName}; parliamentary ratification is required.`);return{success:true,message:'Treaty negotiated; ratification pending.',treaty};}
export function ratifyTreaty(state:GameState,treatyId:string){const ps=g(state);const t=ps.treaties.find(x=>x.id===treatyId);if(!t)return{success:false,message:'Treaty not found.'};const support=state.governmentLiving!.parliamentarians.filter(x=>x.partyId===state.politics.selectedPartyId).length; t.ratified=support>=3;if(t.ratified)record(state,`Parliament ratified the treaty with ${state.governmentLiving!.diplomacy.find(x=>x.countryId===t.countryId)?.countryName||t.countryId}.`);return{success:t.ratified,message:t.ratified?'Treaty ratified.':'Treaty failed to secure parliamentary support.'};}

export function simulateGovernmentMachinery(state:GameState,news:string[]=[]){const ps=g(state);if(ps.lastProcessedTick===tick(state))return;const gov=state.governmentLiving!;ps.committees.forEach(c=>{c.workload=clamp(c.workload-(c.workload>60?3:1));c.scrutiny=clamp(c.scrutiny+(c.workload>70?2:-.5));});ps.whips.forEach(w=>{w.discipline=clamp(w.discipline+(Math.random()>.75?-2:1));});
  ps.lobbying.forEach(l=>{l.influence=clamp(l.influence-(l.transparency<50?1:2));});
  ps.investigations.filter(i=>i.status==='OPEN').forEach(i=>{i.evidence=clamp(i.evidence+(Math.random()*8-2));if(i.evidence>85){i.status='HEARING';news.push(`Investigation escalated: ${i.title}.`);}});
  ps.crises.filter(c=>!c.resolved).forEach(c=>{c.monthsActive++;c.escalation=clamp(c.escalation+(c.severity>70?1:-1),0,10);if(c.monthsActive>6&&c.escalation>7)news.push(`Political crisis deepening: ${c.title}.`);});
  const avgApproval=gov.demographics.reduce((a,d)=>a+d.approval*d.weight,0)/Math.max(1,gov.demographics.reduce((a,d)=>a+d.weight,0));
  gov.election.incumbentSupport=clamp(avgApproval); gov.election.oppositionMomentum=clamp(100-avgApproval);
  if(avgApproval<35&&Math.random()<.15){const crisis:PoliticalCrisis={id:`crisis_${tick(state)}_${Date.now()}`,title:'Government confidence crisis',trigger:'Sustained public approval collapse',severity:70,escalation:4,monthsActive:0,resolved:false};ps.crises.unshift(crisis);record(state,'A government confidence crisis has emerged after sustained public dissatisfaction.','CRISIS');}
  ps.lastProcessedTick=tick(state);
}
