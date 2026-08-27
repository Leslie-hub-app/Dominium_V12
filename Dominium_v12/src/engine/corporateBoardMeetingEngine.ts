import { launchActivistCampaign } from './corporateCapitalMarketsEngine';
import { GameState, Company, CorporateBoardMeeting, CorporateBoardMeetingAgenda, CorporateBoardSeat, CorporateBoardMeetingVote, CorporateBoardroomPhase, CorporateBoardroomSession, CorporateBoardroomDebate, CorporateBoardroomAmendment, CorporateBoardroomShareholderPressure, CorporateBoardroomCrisis } from '../types';

const clamp=(n:number,a=0,b=100)=>Math.max(a,Math.min(b,n));
const agendaLabel=(a:CorporateBoardMeetingAgenda)=>a.replace('M_AND_A','M&A').replace(/_/g,' ');
function corp(state:GameState,id:string){return state.companies.find(c=>c.id===id);}
function seats(state:GameState,id:string):CorporateBoardSeat[]{return state.corporateSystem?.boardSeats?.[id]||[];}
function playerName(state:GameState){return `${state.character.firstName} ${state.character.lastName}`;}
function ensure(state:GameState){
  state.corporateSystem??={exchangeName:'Apex Securities Exchange',exchangeSymbol:'ASX',publicCompanyIds:[],companyRegistryVersion:1,jobVacancies:[],activeInterviews:[],shareholderRecords:{},boardSeats:{},resolutions:[],boardMeetings:[],takeoverDeals:[],marketSentiment:'STAGNANT',sectorShocks:{},eventHistory:[],lastProcessedTick:-1,cSuiteExecutives:[],acquisitionPipeline:[],totalEnterpriseValuation:0,consolidatedRevenueMonthly:0};
  state.corporateSystem.boardMeetings??=[]; state.corporateSystem.boardroomSessions??=[]; return state.corporateSystem;
}
function isPlayerSeat(state:GameState,companyId:string){return seats(state,companyId).some(s=>s.isPlayerSeat)||(corp(state,companyId)?.playerOwnershipPercentage||0)>=51;}
function canVote(state:GameState,c:Company){return isPlayerSeat(state,c.id);}
function baseSupport(ss:CorporateBoardSeat[]){return ss.length?ss.reduce((a,s)=>a+s.supportLevel*s.representedOwnershipPercent,0)/Math.max(1,ss.reduce((a,s)=>a+s.representedOwnershipPercent,0)):50;}
function alignment(seat:CorporateBoardSeat,agenda:CorporateBoardMeetingAgenda,proposal:string){
 const t=proposal.toLowerCase(); let score=0;
 if(seat.agenda==='SHORT_TERM_ACTIVIST'&&['DIVIDEND','RESTRUCTURE','CAPITAL_ALLOCATION','CEO_PERFORMANCE'].includes(agenda))score+=18;
 if(seat.agenda==='CONSERVATIVE_GUARDIAN'&&['RISK_CRISIS','DEBT','CAPITAL_ALLOCATION'].includes(agenda))score+=18;
 if(seat.agenda==='LONG_TERM_BUILDER'&&['STRATEGY','CAPEX','M_AND_A'].includes(agenda))score+=18;
 if(seat.agenda==='INSULATED_BUREAUCRAT'&&['RISK_CRISIS','CEO_PERFORMANCE'].includes(agenda))score+=14;
 if(seat.agenda==='PLAYER_ALLY')score+=22;
 if(t.includes('dividend')&&seat.agenda==='CONSERVATIVE_GUARDIAN')score-=14;
 if(t.includes('debt')&&seat.agenda==='CONSERVATIVE_GUARDIAN')score+=12;
 if(t.includes('r&d')&&seat.agenda==='LONG_TERM_BUILDER')score+=12;
 return score;
}
function emit(state:GameState,title:string,description:string,type:'SUCCESS'|'WARNING'|'INFO'='INFO'){
 state.eventsFeed.unshift({id:`ev_boardroom_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,timestampMonth:state.currentMonth,timestampYear:state.currentYear,age:state.character.age,category:'Business',type,title,description,consequences:{details:[description]}} as any);
 ensure(state).eventHistory.unshift(`${title}: ${description}`);
}
function findSession(state:GameState,sessionId:string){return ensure(state).boardroomSessions!.find(s=>s.id===sessionId);}
function findMeeting(state:GameState,meetingId:string){return ensure(state).boardMeetings.find(m=>m.id===meetingId);}
function advancePhase(session:CorporateBoardroomSession,phase:CorporateBoardroomPhase){session.phase=phase;session.narrative.push(`Boardroom moved to ${phase.replace(/_/g,' ').toLowerCase()}.`);}

export function startCorporateBoardroom(state:GameState,companyId:string,agenda:CorporateBoardMeetingAgenda,proposal:string){
 const c=corp(state,companyId); if(!c)return{success:false,message:'Company not found.'}; if(!canVote(state,c))return{success:false,message:'You need controlling ownership or a board seat to convene and direct a board meeting.'};
 const ss=seats(state,companyId); if(!ss.length)return{success:false,message:'This company has no constituted board.'};
 const before=baseSupport(ss); const id=`board_meeting_${companyId}_${state.simulationTick}_${Date.now()}`; const sessionId=`board_session_${id}`;
 const meeting:CorporateBoardMeeting={id,companyId,scheduledTick:state.simulationTick,heldTick:state.simulationTick,agenda,title:`Board Meeting — ${agendaLabel(agenda)}`,proposal,proposedBy:playerName(state),votes:[],quorumPercent:0,requiredMajority:50,outcome:'IN_PROGRESS',consequences:[],minutes:[],boardSupportBefore:before,boardSupportAfter:before,ceoApprovalBefore:c.ceoApprovalRating,phase:'AGENDA',sessionId,crisisFlags:[]};
 const session:CorporateBoardroomSession={id:sessionId,companyId,meetingId:id,phase:'AGENDA',startedTick:state.simulationTick,agenda,executiveReports:[],debates:[],amendments:[],shareholderPressure:[],crises:[],status:'ACTIVE',narrative:[`The board convenes to consider: ${proposal}`]};
 ensure(state).boardMeetings.unshift(meeting); ensure(state).boardroomSessions!.unshift(session);
 emit(state,`${c.name}: Board meeting convened`,`The board has opened a multi-stage ${agendaLabel(agenda).toLowerCase()} meeting. Directors, executives and shareholders can now influence the outcome.`);
 return{success:true,message:'Board meeting opened.',meeting,session};
}

export function advanceCorporateBoardroomPhase(state:GameState,sessionId:string){
 const session=findSession(state,sessionId); if(!session||session.status!=='ACTIVE')return{success:false,message:'Boardroom session is not active.'};
 const next:Record<CorporateBoardroomPhase,CorporateBoardroomPhase>={AGENDA:'EXECUTIVE_REPORTS',EXECUTIVE_REPORTS:'DIRECTOR_DEBATE',DIRECTOR_DEBATE:'AMENDMENTS',AMENDMENTS:'SHAREHOLDER_PRESSURE',SHAREHOLDER_PRESSURE:'FINAL_VOTE',FINAL_VOTE:'FINAL_VOTE',CLOSED:'CLOSED'};
 const n=next[session.phase]; if(n===session.phase)return{success:false,message:'The boardroom is already at its final stage.'};
 advancePhase(session,n);
 const m=findMeeting(state,session.meetingId); if(m)m.phase=n;
 if(n==='DIRECTOR_DEBATE' && session.debates.length===0){
   const ss=seats(state,session.companyId).filter(x=>!x.isPlayerSeat);
   for(const seat of ss.slice(0,5)){const p=clamp(50+seat.supportLevel*.35+alignment(seat,session.agenda,m?.proposal||''));const position=p>62?'FOR':p<43?'AGAINST':'NEUTRAL';const argument=position==='FOR'?`${seat.holderName} argues that the proposal is consistent with their mandate and can create value if execution remains disciplined.`:position==='AGAINST'?`${seat.holderName} warns that the proposal exposes shareholders to risks that have not been adequately compensated.`:`${seat.holderName} requests additional evidence and safeguards before committing their voting block.`;session.debates.push({id:`debate_${Date.now()}_${seat.id}`,speakerId:seat.holderId,speakerName:seat.holderName,role:'Director',position,argument,influence:seat.influence,tick:state.simulationTick});}
   session.narrative.push(`${session.debates.length} directors entered positions during the debate.`);
 }
 return{success:true,message:`Boardroom advanced to ${n.replace(/_/g,' ').toLowerCase()}.`,session};
}

export function presentCorporateExecutiveReport(state:GameState,sessionId:string,executiveRole:string,report?:string){
 const session=findSession(state,sessionId); if(!session||session.status!=='ACTIVE')return{success:false,message:'Boardroom session is not active.'}; const c=corp(state,session.companyId); if(!c)return{success:false,message:'Company not found.'};
 if(session.phase==='AGENDA')advancePhase(session,'EXECUTIVE_REPORTS');
 const exec=c.executives?.find(e=>e.role===executiveRole); let text=report;
 if(!text){ if(executiveRole==='CFO')text=`Cash reserve is $${Math.round(c.cashReserve||0).toLocaleString()}, debt is $${Math.round(c.debt||0).toLocaleString()}, and monthly net profit is $${Math.round(c.monthlyNetProfit||0).toLocaleString()}. The finance function recommends a disciplined approach to capital.`; else if(executiveRole==='CEO')text=`Management recommends the board ${session.agenda==='RESTRUCTURE'?'approve restructuring to protect margins':'maintain a coherent strategic mandate while balancing growth, liquidity and workforce stability'}.`; else text=`${executiveRole} reports competence ${exec?.competence??70}/100 and recommends that the board consider operational execution risk before voting.`; }
 session.executiveReports.push(`${executiveRole}: ${text}`); session.narrative.push(text); const m=findMeeting(state,session.meetingId); if(m)m.phase=session.phase; if(session.executiveReports.length>=2&&session.phase==='EXECUTIVE_REPORTS'){advancePhase(session,'DIRECTOR_DEBATE');if(m)m.phase=session.phase;}
 return{success:true,message:`${executiveRole} report presented.`,report:text};
}
export function submitCorporateDirectorDebate(state:GameState,sessionId:string,position:'FOR'|'AGAINST'|'NEUTRAL',argument:string){
 const session=findSession(state,sessionId); if(!session||session.status!=='ACTIVE')return{success:false,message:'Boardroom session is not active.'}; const m=findMeeting(state,session.meetingId); if(!m)return{success:false,message:'Meeting not found.'};
 if(session.phase==='AGENDA'||session.phase==='EXECUTIVE_REPORTS')advancePhase(session,'DIRECTOR_DEBATE'); const seat=seats(state,session.companyId).find(s=>s.isPlayerSeat); const d:CorporateBoardroomDebate={id:`debate_${Date.now()}`,speakerId:seat?.holderId||'player',speakerName:playerName(state),role:'Director',position,argument,influence:seat?.influence||50,tick:state.simulationTick}; session.debates.push(d); session.narrative.push(`${d.speakerName} argued ${position.toLowerCase()}: ${argument}`); m.phase=session.phase; return{success:true,message:'Director position entered into the minutes.',debate:d};
}
export function proposeCorporateAmendment(state:GameState,sessionId:string,text:string){
 const session=findSession(state,sessionId); if(!session||session.status!=='ACTIVE')return{success:false,message:'Boardroom session is not active.'}; if(!text.trim())return{success:false,message:'Amendment cannot be empty.'}; if(session.phase!=='AMENDMENTS')advancePhase(session,'AMENDMENTS');
 const ss=seats(state,session.companyId); let f=0,a=0; for(const s of ss){const p=clamp(50+s.supportLevel*.3+(s.agenda==='PLAYER_ALLY'?15:0)); if(Math.random()*100<p)f+=s.representedOwnershipPercent; else a+=s.representedOwnershipPercent;} const accepted=f>a; const amendment:CorporateBoardroomAmendment={id:`amend_${Date.now()}`,proposedBy:playerName(state),text,accepted,voteFor:f,voteAgainst:a}; session.amendments.push(amendment); session.narrative.push(`Amendment ${accepted?'accepted':'rejected'}: ${text}`); const m=findMeeting(state,session.meetingId); if(m)m.amendmentCount=session.amendments.length; return{success:true,message:accepted?'Amendment accepted by the board.':'Amendment rejected by the board.',amendment};
}
export function applyCorporateShareholderPressure(state:GameState,sessionId:string,holderId:string,demand:string,response:'ADDRESSED'|'IGNORED'|'CONCESSION'='ADDRESSED'){
 const session=findSession(state,sessionId); if(!session||session.status!=='ACTIVE')return{success:false,message:'Boardroom session is not active.'}; if(session.phase!=='SHAREHOLDER_PRESSURE')advancePhase(session,'SHAREHOLDER_PRESSURE');
 const holders=ensure(state).shareholderRecords[session.companyId]||[]; const h=holders.find(x=>x.holderId===holderId); if(!h)return{success:false,message:'Shareholder not found.'}; const pressure:CorporateBoardroomShareholderPressure={id:`pressure_${Date.now()}`,holderId,holderName:h.holderName,ownershipPercent:h.ownershipPercent,demand,intensity:clamp(h.ownershipPercent*2+(h.holderType==='HEDGE_FUND'||h.holderType==='INSTITUTION'?25:5)),response}; session.shareholderPressure.push(pressure); session.narrative.push(`${h.holderName} applied shareholder pressure: ${demand}`); const m=findMeeting(state,session.meetingId); if(m)m.shareholderPressureScore=session.shareholderPressure.reduce((x,p)=>x+p.intensity,0); return{success:true,message:`${h.holderName}'s pressure was recorded.`,pressure};
}
function applyOutcome(state:GameState,c:Company,m:CorporateBoardMeeting,passed:boolean){
 const consequences:string[]=[]; const profitBase=Math.max(1,Math.abs(c.monthlyNetProfit||0));
 if(passed){switch(m.agenda){case'STRATEGY':c.employeeProductivity=clamp(c.employeeProductivity+3);c.brandReputation=clamp(c.brandReputation+2);consequences.push('Strategic mandate approved; productivity and market confidence should improve.');break;case'CAPITAL_ALLOCATION':c.cashReserve=Math.max(0,(c.cashReserve||0)-Math.min(c.cashReserve||0,profitBase*.5));c.productQuality=clamp(c.productQuality+2);consequences.push('Capital reallocated toward growth, reducing near-term liquidity.');break;case'CEO_PERFORMANCE':c.ceoApprovalRating=clamp((c.ceoApprovalRating??65)+6);consequences.push('CEO received a renewed board mandate.');break;case'EXECUTIVE_COMPENSATION':c.cashReserve=Math.max(0,(c.cashReserve||0)-Math.min(c.cashReserve||0,profitBase*.1));c.ceoApprovalRating=clamp((c.ceoApprovalRating??65)+3);consequences.push('Executive compensation approved.');break;case'DIVIDEND':{const payout=Math.min(c.cashReserve||0,Math.max(0,(c.valuation||0)*.005));c.cashReserve=Math.max(0,(c.cashReserve||0)-payout);c.dividendPayoutRatio=clamp((c.dividendPayoutRatio||0)+.05,0,1);consequences.push(`Approximately $${Math.round(payout).toLocaleString()} authorised for shareholders.`);break;}case'DEBT':c.debt=(c.debt||0)+profitBase*.5;c.cashReserve=(c.cashReserve||0)+profitBase*.5;c.creditRating=c.creditRating==='AAA'?'AA':(c.creditRating||'BBB');consequences.push('New financing authorised; leverage increased.');break;case'CAPEX':c.fixedAssets=(c.fixedAssets||0)+profitBase*.75;c.cashReserve=Math.max(0,(c.cashReserve||0)-Math.min(c.cashReserve||0,profitBase*.75));c.capacityMonthlyUnits*=1.05;consequences.push('Capacity expanded through capital expenditure.');break;case'M_AND_A':c.valuation*=1.02;c.marketShare=clamp(c.marketShare+1);consequences.push('Acquisition mandate approved; integration risk now active.');break;case'RESTRUCTURE':c.employeesCount=Math.max(1,Math.round(c.employeesCount*.96));c.employeeMorale=clamp(c.employeeMorale-7);c.monthlyExpenses=Math.max(0,c.monthlyExpenses*.96);consequences.push('Restructuring reduced costs but damaged morale.');break;case'RISK_CRISIS':c.employeeMorale=clamp(c.employeeMorale+3);c.brandReputation=clamp(c.brandReputation+1);consequences.push('Risk response approved; stakeholder confidence stabilised.');break;}} else consequences.push(`The ${agendaLabel(m.agenda).toLowerCase()} proposal failed; management must maintain the current course or return with a revised proposal.`);
 return consequences;
}
function generateCrisisConsequences(state:GameState,c:Company,m:CorporateBoardMeeting,session:CorporateBoardroomSession){
 const crises:CorporateBoardroomCrisis[]=[]; const support=c.ceoApprovalRating??65; const failed=m.outcome!=='APPROVED';
 if(failed&&support<55)crises.push('CEO_CONFIDENCE_CRISIS');
 if(failed&&Math.random()<.35)crises.push('ACTIVIST_CAMPAIGN');
 if((m.agenda==='CEO_PERFORMANCE'||crises.includes('CEO_CONFIDENCE_CRISIS'))&&failed&&Math.random()<.38)crises.push('LEADERSHIP_CHALLENGE');
 if(failed&&Math.random()<.18)crises.push('DIRECTOR_RESIGNATION');
 if((m.agenda==='RESTRUCTURE'||m.agenda==='RISK_CRISIS'||session.shareholderPressure.length>0)&&Math.random()<.2)crises.push('INTERNAL_LEAK');
 if(session.shareholderPressure.reduce((a,p)=>a+p.intensity,0)>55&&Math.random()<.2)crises.push('PUBLIC_SCANDAL');
 if(crises.length&&Math.random()<.65)crises.push('EMERGENCY_MEETING');
 return [...new Set(crises)];
}
export function callCorporateBoardVote(state:GameState,sessionId:string,playerVote:'FOR'|'AGAINST'|'ABSTAIN'='FOR'){
 const session=findSession(state,sessionId); if(!session||session.status!=='ACTIVE')return{success:false,message:'Boardroom session is not active.'}; const m=findMeeting(state,session.meetingId); const c=corp(state,session.companyId); if(!m||!c)return{success:false,message:'Meeting or company not found.'};
 if(session.phase!=='FINAL_VOTE')advancePhase(session,'FINAL_VOTE'); const ss=seats(state,c.id); const total=ss.reduce((x,s)=>x+s.representedOwnershipPercent,0); let f=0,a=0; const votes:CorporateBoardMeetingVote[]=[];
 for(const s of ss){let vote:'FOR'|'AGAINST'|'ABSTAIN';let rationale='';if(s.isPlayerSeat){vote=playerVote;rationale='Player director/controlling shareholder decision.';}else{const p=clamp(50+s.supportLevel*.35+alignment(s,m.agenda,m.proposal));const r=Math.random()*100;vote=r<p?'FOR':r>p+18?'AGAINST':'ABSTAIN';rationale=vote==='FOR'?'Board member supports the mandate.':vote==='AGAINST'?'Board member opposes the mandate.':'Board member withheld support.';}const v={seatId:s.id,holderId:s.holderId,holderName:s.holderName,vote,weight:s.representedOwnershipPercent,rationale};votes.push(v);if(vote==='FOR')f+=v.weight;if(vote==='AGAINST')a+=v.weight;}
 m.votes=votes; const participating=f+a; m.quorumPercent=clamp(total?(participating/total)*100:0); const passed=m.quorumPercent>=50&&f/Math.max(1,participating)*100>m.requiredMajority; m.outcome=m.quorumPercent<50?'QUORUM_FAILED':passed?'APPROVED':'REJECTED'; m.outcomeReason=m.quorumPercent<50?'Insufficient voting participation.':`${f.toFixed(1)}% voting weight supported the proposal against ${a.toFixed(1)}%.`;
 m.consequences=applyOutcome(state,c,m,passed); const crises=generateCrisisConsequences(state,c,m,session); m.crisisFlags=crises; session.crises.push(...crises); m.phase='CLOSED'; session.phase='CLOSED'; session.status='CLOSED';
 const shift=passed?3:-4;ss.forEach(s=>{if(!s.isPlayerSeat)s.supportLevel=clamp(s.supportLevel+(alignment(s,m.agenda,m.proposal)>0?shift:shift/2));}); m.boardSupportAfter=baseSupport(ss); m.ceoApprovalAfter=c.ceoApprovalRating;
 for(const crisis of crises){const text=crisis.replace(/_/g,' ').toLowerCase();m.consequences.push(`Boardroom consequence: ${text}.`);if(crisis==='CEO_CONFIDENCE_CRISIS')c.ceoApprovalRating=clamp((c.ceoApprovalRating??60)-12);if(crisis==='ACTIVIST_CAMPAIGN'){c.brandReputation=clamp(c.brandReputation-2);const ar=launchActivistCampaign(state,c.id,'inst_boardroom_activist','Boardroom accountability: improve capital allocation, governance and shareholder communication.');if(ar.success)m.consequences.push(ar.message);}if(crisis==='LEADERSHIP_CHALLENGE'){c.ceoApprovalRating=clamp((c.ceoApprovalRating??60)-10);m.consequences.push('A director faction has begun positioning an alternative leadership slate.');}if(crisis==='DIRECTOR_RESIGNATION'){const idx=ss.findIndex(s=>!s.isPlayerSeat);if(idx>=0){const departed=ss.splice(idx,1)[0];m.consequences.push(`${departed.holderName} resigned from the board.`);}}if(crisis==='INTERNAL_LEAK'){c.brandReputation=clamp(c.brandReputation-4);emit(state,`${c.name}: Boardroom leak`,`Confidential board deliberations have leaked into the living-world information network.`, 'WARNING');}if(crisis==='PUBLIC_SCANDAL'){c.brandReputation=clamp(c.brandReputation-8);emit(state,`${c.name}: Corporate scandal`,`A boardroom dispute has escalated into a public corporate scandal.`, 'WARNING');}}
 m.minutes=[`Boardroom phases completed: executive reports, director debate, amendments, shareholder pressure and final vote.`,`Quorum: ${m.quorumPercent.toFixed(0)}%.`, `Vote: ${f.toFixed(1)}% FOR / ${a.toFixed(1)}% AGAINST.`,m.outcomeReason,...m.consequences]; session.narrative.push(`Final vote: ${m.outcome.toLowerCase()}.`); ensure(state).eventHistory.unshift(`${c.name}: boardroom concluded — ${m.outcome.toLowerCase()} (${agendaLabel(m.agenda)}).`); emit(state,`${c.name} Boardroom: ${m.outcome}`,`${m.proposal} ${m.outcomeReason}${crises.length?` Boardroom fallout: ${crises.map(x=>x.replace(/_/g,' ')).join(', ')}.`:''}`,passed?'SUCCESS':'WARNING');
 if(crises.includes('EMERGENCY_MEETING')){const emergency=startCorporateBoardroom(state,c.id,'RISK_CRISIS',`Emergency governance review following the ${m.outcome.toLowerCase()} boardroom and resulting leadership/shareholder fallout.`);if(emergency.success)m.consequences.push('An emergency board meeting was automatically convened for the next governance response.');}
 return{success:true,message:`Board vote concluded: ${m.outcome.toLowerCase()}.`,meeting:m,session};
}
export function holdCorporateBoardMeeting(state:GameState,companyId:string,agenda:CorporateBoardMeetingAgenda,proposal:string,playerVote:'FOR'|'AGAINST'|'ABSTAIN'='FOR'){
 const started=startCorporateBoardroom(state,companyId,agenda,proposal); if(!started.success)return started; const session=(started as any).session as CorporateBoardroomSession; presentCorporateExecutiveReport(state,session.id,'CEO'); presentCorporateExecutiveReport(state,session.id,'CFO'); submitCorporateDirectorDebate(state,session.id,playerVote==='FOR'?'FOR':playerVote==='AGAINST'?'AGAINST':'NEUTRAL',`Player voted ${playerVote.toLowerCase()} and requested a formal board decision.`); return callCorporateBoardVote(state,session.id,playerVote);
}
export function getCorporateBoardroom(state:GameState,companyId:string){return{meetings:ensure(state).boardMeetings.filter(m=>m.companyId===companyId),sessions:ensure(state).boardroomSessions!.filter(s=>s.companyId===companyId)};}
export function processCorporateBoardroomMonthly(state:GameState,news:string[]=[]){
 const system=ensure(state); const active=system.boardroomSessions!.filter(s=>s.status==='ACTIVE'); for(const s of active){if(state.simulationTick-s.startedTick>=2){const m=findMeeting(state,s.meetingId);if(m&&m.outcome==='IN_PROGRESS'){news.push(`${corp(state,s.companyId)?.name||'Company'} has an unresolved board meeting requiring an emergency governance session.`);}}}
 for(const c of state.companies){const recent=system.boardMeetings.find(m=>m.companyId===c.id&&m.heldTick===state.simulationTick-1&&m.crisisFlags?.includes('EMERGENCY_MEETING'));if(recent){news.push(`${c.name} convened an emergency board meeting following governance fallout.`);}}
}
export { agendaLabel };
