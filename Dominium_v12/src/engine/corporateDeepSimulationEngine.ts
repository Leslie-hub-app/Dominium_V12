import { Company, CorporateDeepSimulationState, CorporateInstitutionalInvestor, CorporateMABid, CorporateRegulatoryProfile, CorporateGovernanceProfile, GameState, CorporateStrategy } from '../types';
import { ensureCorporateSystemState, inspectCorporateCompany } from './corporateSimulationEngine';
import { ensureInvestmentMarketState } from './investmentEngine';

const INSTITUTIONS: Array<[string, string, CorporateInstitutionalInvestor['mandate'], number, number]> = [
  ['inst_apex_pension', 'Apex Pension Fund', 'INDEX', 2.2e12, 35],
  ['inst_global_index', 'Global Index Partners', 'INDEX', 1.8e12, 28],
  ['inst_meridian_value', 'Meridian Value Partners', 'VALUE', 7.5e11, 52],
  ['inst_northstar_growth', 'Northstar Growth Capital', 'GROWTH', 6.4e11, 72],
  ['inst_atlas_activist', 'Atlas Activist Fund', 'ACTIVIST', 1.8e11, 82],
  ['inst_income', 'Crown Income Trust', 'INCOME', 5.1e11, 42],
  ['inst_sovereign', 'Commonwealth Sovereign Fund', 'SOVEREIGN', 1.4e12, 30],
  ['inst_horizon', 'Horizon Long-Term Capital', 'VALUE', 4.4e11, 38],
];

const PHASES: CorporateDeepSimulationState['macroPhase'][] = ['EXPANSION','BOOM','SLOWDOWN','RECESSION','CRISIS'];

function clamp(v:number,min=0,max=100){ return Math.max(min,Math.min(max,v)); }
function ensureCompany(c: Company){
  c.sharePrice ||= 1; c.valuation ||= c.sharePrice*c.totalShares; c.totalShares ||= 1;
  c.publicFloatShares ??= Math.round(c.totalShares*0.65); c.institutionalShares ??= Math.round(c.totalShares*0.2); c.insiderShares ??= Math.max(0,c.totalShares-c.publicFloatShares-c.institutionalShares);
  c.creditRating ??= 'BBB'; c.employeeMorale ??= 70; c.employeeProductivity ??= 70; c.brandReputation ??= 65; c.marketShare ??= 5;
}

export function initializeCorporateDeepSimulationState(): CorporateDeepSimulationState {
  return {
    version: 1, macroPhase: 'EXPANSION', globalGDPGrowth: 2.4, inflationRate: 2.8, policyRate: 4.25,
    creditSpread: 1.2, tradeStress: 18, commodityIndex: 100, marketLiquidity: 82,
    institutionalInvestors: INSTITUTIONS.map(([id,name,mandate,aum,risk]) => ({ id,name,mandate,assetsUnderManagement:aum,cash:aum*0.04,riskTolerance:risk,activism:mandate==='ACTIVIST'?85:mandate==='GROWTH'?45:25,reputation:80,sectorPreferences:[],holdings:{},votingAlignment:55 })),
    regulatoryProfiles:{}, governanceProfiles:{}, maBids:[], lastProcessedTick:-1, systemicNews:[]
  };
}

export function ensureCorporateDeepSimulationState(state: GameState): CorporateDeepSimulationState {
  if (!state.corporateDeepSimulation) state.corporateDeepSimulation = initializeCorporateDeepSimulationState();
  const deep = state.corporateDeepSimulation;
  deep.institutionalInvestors ||= [];
  deep.regulatoryProfiles ||= {};
  deep.governanceProfiles ||= {};
  deep.maBids ||= [];
  deep.systemicNews ||= [];
  if (!deep.institutionalInvestors.length) deep.institutionalInvestors = initializeCorporateDeepSimulationState().institutionalInvestors;
  ensureCorporateSystemState(state);
  state.companies.filter(c=>c.isPublic).forEach(c=>ensureDeepCompanyProfiles(deep,c));
  return deep;
}

function ensureDeepCompanyProfiles(deep: CorporateDeepSimulationState, company: Company){
  ensureCompany(company);
  if (!deep.regulatoryProfiles[company.id]) deep.regulatoryProfiles[company.id] = {
    companyId:company.id, antitrustExposure:clamp(company.marketShare*1.7), laborExposure:clamp(100-company.employeeMorale),
    environmentalExposure:company.sector==='Energy'||company.sector==='Mining'?65:25, consumerExposure:company.sector==='Consumer'?55:20,
    financialExposure:company.sector==='Banking'?70:25, politicalAttention:clamp(company.marketShare*1.2), complianceScore:78,
    investigationTicks:0, finesAccrued:0, lobbyingInfluence:20
  };
  if (!deep.governanceProfiles[company.id]) deep.governanceProfiles[company.id] = {
    companyId:company.id, boardConfidence:70, ceoConfidence:company.ceoApprovalRating||70, ceoTenureMonths:18,
    strategy: 'BALANCED', executiveCompensationIndex:100, successionReadiness:62, shareholderActivism:25, boardIndependence:65
  };
}

function deriveMacro(state:GameState, deep:CorporateDeepSimulationState){
  const country = state.world?.[state.currentCountryIndex||0] as any;
  const cycle = country?.businessCycle;
  if(cycle==='Boom') deep.macroPhase='BOOM'; else if(cycle==='Recession') deep.macroPhase='RECESSION'; else if(cycle==='Slowdown') deep.macroPhase='SLOWDOWN'; else if(cycle==='Crisis') deep.macroPhase='CRISIS'; else deep.macroPhase='EXPANSION';
  deep.globalGDPGrowth = deep.macroPhase==='BOOM'?4.2:deep.macroPhase==='EXPANSION'?2.8:deep.macroPhase==='SLOWDOWN'?1.0:deep.macroPhase==='RECESSION'?-1.8:-4.0;
  deep.inflationRate = Number(country?.inflationRate ?? (deep.macroPhase==='CRISIS'?5.5:2.8));
  deep.policyRate = Number(country?.centralBankInterestRate ?? (deep.macroPhase==='RECESSION'?2.5:4.25));
  deep.tradeStress = clamp(deep.tradeStress + (deep.macroPhase==='CRISIS'?4:deep.macroPhase==='BOOM'?-2:0),5,90);
  deep.creditSpread = Math.max(0.6, Math.min(6, 1.1 + (deep.macroPhase==='RECESSION'?1.8:deep.macroPhase==='CRISIS'?3:deep.macroPhase==='BOOM'?-0.3:0)));
  deep.marketLiquidity = clamp(86 - deep.creditSpread*7 - deep.tradeStress*0.12,35,92);
}

function institutionalStep(state:GameState, deep:CorporateDeepSimulationState){
  const companies = state.companies.filter(c=>c.isPublic && c.ticker);
  const corp = ensureCorporateSystemState(state);
  const market = ensureInvestmentMarketState(state);
  const flows: Record<string, number> = {};
  for(const inst of deep.institutionalInvestors){
    for(const company of companies){
      const earnings = company.monthlyNetProfit>0 ? Math.min(2,Math.max(0.5,(company.peRatio||18)/18)) : 0.35;
      const leverage = (company.debt||0)/Math.max(1,company.totalAssets||1);
      let target = 0;
      if(inst.mandate==='INDEX') target=0.0025;
      if(inst.mandate==='VALUE') target=company.peRatio && company.peRatio<16 ? 0.004 : 0.0005;
      if(inst.mandate==='GROWTH') target=company.lastQuarterRevenueGrowth && company.lastQuarterRevenueGrowth>0.06 ? 0.004 : 0.0004;
      if(inst.mandate==='ACTIVIST') target=(company.ceoApprovalRating||70)<55 ? 0.006 : 0.001;
      if(inst.mandate==='INCOME') target=(company.dividendYield||0)>2 ? 0.004 : 0.0005;
      if(inst.mandate==='SOVEREIGN') target=(company.creditRating||'BBB')>='BBB' ? 0.002 : 0.0002;
      target *= (earnings>1?1.1:0.85) * (leverage>0.75?0.65:1);
      const current = (inst.holdings[company.id]||0)/Math.max(1,company.totalShares);
      const delta = Math.round((target-current)*company.totalShares*0.08);
      if(delta===0) continue;
      if(delta>0){
        const cost=delta*company.sharePrice;
        if(inst.cash>=cost){ inst.cash-=cost; inst.holdings[company.id]=(inst.holdings[company.id]||0)+delta; flows[company.id]=(flows[company.id]||0)+delta; }
      }else{
        const qty=Math.min(inst.holdings[company.id]||0,Math.abs(delta));
        inst.cash+=qty*company.sharePrice; inst.holdings[company.id]=(inst.holdings[company.id]||0)-qty; flows[company.id]=(flows[company.id]||0)-qty;
      }
    }
  }
  for(const company of companies){
    ensureDeepCompanyProfiles(deep,company);
    const totalInstitutional = deep.institutionalInvestors.reduce((sum,i)=>sum+(i.holdings[company.id]||0),0);
    const cap=Math.max(0,company.totalShares-(company.insiderShares||0));
    company.institutionalShares=Math.min(cap,totalInstitutional);
    company.publicFloatShares=Math.max(0,company.totalShares-(company.insiderShares||0)-company.institutionalShares);
    const flow=flows[company.id]||0;
    // Institutional order flow becomes a bounded secondary price signal, not a replacement for fundamentals.
    if(flow!==0){
      const float=Math.max(1,company.publicFloatShares+Math.abs(flow));
      const impact=Math.max(-0.045,Math.min(0.045,(flow/float)*4));
      company.sharePrice=Math.max(1,Math.round(company.sharePrice*(1+impact)*100)/100);
      company.valuation=company.sharePrice*company.totalShares;
      const asset=market.marketAssets.find(a=>a.underlyingCompanyId===company.id);
      if(asset){ asset.currentPrice=company.sharePrice; asset.marketCapBillions=company.valuation/1e9; asset.priceHistory.push(company.sharePrice); if(asset.priceHistory.length>36) asset.priceHistory.shift(); }
    }
    // Reflect institutional blocks into the canonical shareholder ledger.
    const records=corp.shareholderRecords[company.id]||[];
    for(const inst of deep.institutionalInvestors){
      const shares=inst.holdings[company.id]||0;
      const existing=records.find(r=>r.holderId===inst.id);
      if(existing){ existing.shares=shares; existing.ownershipPercent=(shares/company.totalShares)*100; existing.votingPowerPercent=existing.ownershipPercent; }
      else if(shares>0) records.push({holderId:inst.id,holderName:inst.name,shares,ownershipPercent:(shares/company.totalShares)*100,votingPowerPercent:(shares/company.totalShares)*100,holderType:inst.mandate==='ACTIVIST'?'HEDGE_FUND':'INSTITUTION'});
    }
    corp.shareholderRecords[company.id]=records.filter(r=>r.holderId==='player'||r.holderId==='holder_founder'||r.holderId==='holder_retail'||r.shares>0);
  }
}

function governanceStep(state:GameState, deep:CorporateDeepSimulationState, news:string[]){
  const corp=ensureCorporateSystemState(state);
  for(const company of state.companies.filter(c=>c.isPublic)){
    const g=deep.governanceProfiles[company.id]; const reg=deep.regulatoryProfiles[company.id]; if(!g||!reg) continue;
    const ceo=company.executives.find(e=>e.role==='CEO');
    g.ceoTenureMonths += 1;
    if(ceo){ g.ceoConfidence=clamp(g.ceoConfidence + (ceo.competence-60)*0.015 + (ceo.loyalty-60)*0.01); company.ceoApprovalRating=g.ceoConfidence; }
    g.boardConfidence=clamp(g.boardConfidence + (company.monthlyNetProfit>0?1:-2) - reg.investigationTicks*0.4);
    g.shareholderActivism=clamp(g.shareholderActivism + (company.lastQuarterRevenueGrowth||0)<0 ? 3 : -1);
    if(g.ceoConfidence<45 || g.boardConfidence<40){
      news.push(`${company.name} faces a leadership confidence crisis as the board reviews executive performance.`);
      if(g.ceoConfidence<35 && state.simulationTick%3===0){ company.executives=company.executives.filter(e=>e.role!=='CEO'); g.pendingCeoElection=`ceo_election_${state.simulationTick}`; }
    }
    if(!ceo && !g.pendingCeoElection){
      g.pendingCeoElection=`ceo_election_${state.simulationTick}`;
    }
    if(g.pendingCeoElection && state.simulationTick%2===0){
      const candidate=company.executives.find(e=>e.role==='CFO') || company.executives.find(e=>e.role==='COO');
      if(candidate){ company.executives.forEach(e=>{if(e.role==='CEO') e.role='CFO'}); candidate.role='CEO'; candidate.loyalty=Math.min(100,candidate.loyalty+5); g.pendingCeoElection=undefined; news.push(`${company.name}'s board appointed ${candidate.name} as CEO.`); }
    }
    // Keep the legacy board representation synchronized with deep confidence.
    (corp.boardSeats[company.id]||[]).forEach(seat=>{ if(seat.isPlayerSeat) seat.supportLevel=100; else seat.supportLevel=clamp(seat.supportLevel+(g.boardConfidence-60)*0.03); });
  }
}

function regulatoryStep(state:GameState, deep:CorporateDeepSimulationState, news:string[]){
  for(const company of state.companies.filter(c=>c.isPublic)){
    const reg=deep.regulatoryProfiles[company.id]; if(!reg) continue;
    const taxPolicy=state.politics?.nationalPolicies?.taxBracket;
    const taxStress=taxPolicy==='High Social Support'?8:taxPolicy==='Low Enterprise'?-6:0;
    reg.politicalAttention=clamp(reg.politicalAttention + (company.marketShare>20?1.5:-0.3) + (company.debt||0)/Math.max(1,company.totalAssets||1)*4);
    reg.complianceScore=clamp(reg.complianceScore - Math.max(0,(company.employeeMorale<45?1:0)) + (taxStress<0?0.2:0));
    const trigger = reg.politicalAttention>72 || reg.complianceScore<38 || (company.sector==='Banking' && (company.debt||0)/Math.max(1,company.totalAssets||1)>0.8);
    if(trigger && reg.investigationTicks<=0){ reg.investigationTicks=3; news.push(`${company.name} is under regulatory scrutiny; compliance and financing conditions have tightened.`); }
    if(reg.investigationTicks>0){ reg.investigationTicks--; const fine=Math.round(Math.max(0,company.monthlyRevenue)*0.015); company.cashReserve=Math.max(0,company.cashReserve-fine); reg.finesAccrued+=fine; company.volatilityIndex=Math.min(0.25,(company.volatilityIndex||0.04)+0.02); }
  }
}

function processMABids(state:GameState, deep:CorporateDeepSimulationState, news:string[]){
  for(const bid of deep.maBids.filter(b=>!['CLOSED','BLOCKED','FAILED'].includes(b.stage))){
    const target=state.companies.find(c=>c.id===bid.targetCompanyId); const bidder=state.companies.find(c=>c.id===bid.bidderCompanyId); if(!target||!bidder) continue;
    if(bid.stage==='RUMOR') bid.stage='DUE_DILIGENCE';
    else if(bid.stage==='DUE_DILIGENCE') bid.stage='BOARD_REVIEW';
    else if(bid.stage==='BOARD_REVIEW'){
      const boardConfidence=deep.governanceProfiles[target.id]?.boardConfidence||60;
      bid.shareholderSupport=clamp(45 + bid.premiumPercent*0.8 + (boardConfidence-60)*0.4 - (bid.integrationRisk*0.15));
      bid.stage=bid.shareholderSupport>55?'REGULATORY':'FAILED';
    } else if(bid.stage==='REGULATORY'){
      bid.antitrustRisk=clamp((target.marketShare||0)*1.8 + ((bidder.marketShare||0))*1.2 + (state.companies.filter(c=>c.sector===target.sector&&c.playerOwnershipPercentage>50).length*8));
      bid.politicalRisk=deep.regulatoryProfiles[target.id]?.politicalAttention||30;
      bid.stage=(bid.antitrustRisk>78 || bid.politicalRisk>88)?'BLOCKED':'FINANCING';
      if(bid.stage==='BLOCKED') news.push(`${bid.targetName} acquisition blocked by competition and public-interest review.`);
    } else if(bid.stage==='FINANCING'){
      const available=bid.bidValue*bid.financingRatio; const cash=bidder.cashReserve||0;
      if(cash>=available){ bidder.cashReserve-=available; bidder.debt=(bidder.debt||0)+(bid.bidValue-available); bid.stage='SHAREHOLDER_VOTE'; }
      else bid.stage='FAILED';
    } else if(bid.stage==='SHAREHOLDER_VOTE'){
      if(bid.shareholderSupport>=60){
        target.playerOwnershipPercentage=0; target.isPublic=false; target.exchange=undefined; target.publicFloatShares=0; target.institutionalShares=0; target.insiderShares=target.totalShares; bidder.cashReserve+=(target.cashReserve||0); bidder.fixedAssets=(bidder.fixedAssets||0)+(target.fixedAssets||0)*0.9; bidder.customerBase=(bidder.customerBase||0)+(target.customerBase||0)*0.45; bid.stage='CLOSED'; news.push(`${bidder.name} completed its acquisition of ${target.name}.`);
      } else bid.stage='FAILED';
    }
  }
}

export function launchCompanyMABid(state:GameState,bidderCompanyId:string,targetCompanyId:string,premiumPercent=25):{success:boolean;message:string;bid?:CorporateMABid}{
  const bidder=inspectCorporateCompany(state,bidderCompanyId); const target=inspectCorporateCompany(state,targetCompanyId); if(!bidder||!target||bidder.id===target.id) return {success:false,message:'Valid distinct bidder and target companies are required.'};
  if(!bidder.isPublic||!target.isPublic) return {success:false,message:'Both companies must currently be public.'};
  const premium=Math.max(10,Math.min(60,premiumPercent)); const deep=ensureCorporateDeepSimulationState(state);
  const bid:CorporateMABid={id:`ma_${Date.now()}_${bidder.id}_${target.id}`,bidderCompanyId:bidder.id,targetCompanyId:target.id,bidderName:bidder.name,targetName:target.name,bidValue:Math.round(target.valuation*(1+premium/100)),premiumPercent:premium,financingRatio:0.45,expectedSynergyPercent:Math.max(2,Math.min(18,10-(Math.abs((bidder.marketShare||0)-(target.marketShare||0))/10))),integrationRisk:Math.max(10,Math.min(75,30+(target.employeesCount/(bidder.employeesCount||1))*10)),antitrustRisk:0,politicalRisk:0,shareholderSupport:0,stage:'RUMOR',createdTick:state.simulationTick,notes:[`Premium ${premium}%`,`Expected synergy ${Math.round(10)}%`]};
  deep.maBids.push(bid); return {success:true,message:`M&A proposal launched: ${bidder.name} → ${target.name} at a ${premium}% premium.`,bid};
}

export function inspectInstitutionalInvestors(state:GameState){ return ensureCorporateDeepSimulationState(state).institutionalInvestors; }
export function inspectCorporateDeepGovernance(state:GameState,companyId:string){ const d=ensureCorporateDeepSimulationState(state); return {governance:d.governanceProfiles[companyId],regulatory:d.regulatoryProfiles[companyId],institutional:d.institutionalInvestors.map(i=>({name:i.name,mandate:i.mandate,shares:i.holdings[companyId]||0,ownershipPercent:((i.holdings[companyId]||0)/Math.max(1,state.companies.find(c=>c.id===companyId)?.totalShares||1))*100}))}; }

export function lobbyCorporateRegulator(state:GameState, companyId:string, spend:number):{success:boolean;message:string}{
  const company=inspectCorporateCompany(state,companyId); if(!company) return {success:false,message:'Company not found.'};
  const deep=ensureCorporateDeepSimulationState(state); const reg=deep.regulatoryProfiles[company.id]; if(!reg) return {success:false,message:'Regulatory profile unavailable.'};
  const amount=Math.max(1000,Math.min(Math.max(1000,state.finances.cash),spend));
  state.finances.cash-=amount;
  const influence=Math.min(12,Math.sqrt(amount)/1200);
  reg.lobbyingInfluence=clamp(reg.lobbyingInfluence+influence);
  reg.politicalAttention=clamp(reg.politicalAttention-influence*0.35);
  reg.complianceScore=clamp(reg.complianceScore+influence*0.12);
  deep.systemicNews.unshift(`${company.name} expanded its government-relations and regulatory engagement program.`);
  return {success:true,message:`Spent $${amount.toLocaleString()} on lawful government-relations activity; regulatory attention eased modestly.`};
}

export function requestRegulatoryReview(state:GameState, companyId:string):{success:boolean;message:string}{
  const company=inspectCorporateCompany(state,companyId); if(!company) return {success:false,message:'Company not found.'};
  const deep=ensureCorporateDeepSimulationState(state); const reg=deep.regulatoryProfiles[company.id]; if(!reg) return {success:false,message:'Regulatory profile unavailable.'};
  reg.investigationTicks=Math.max(reg.investigationTicks,2);
  return {success:true,message:`A formal compliance review has been requested for ${company.name}.`};
}

export function simulateMonthlyCorporateDeepEngine(state:GameState,news:string[]=[]){
  const deep=ensureCorporateDeepSimulationState(state); if(deep.lastProcessedTick===state.simulationTick) return;
  deriveMacro(state,deep); institutionalStep(state,deep); governanceStep(state,deep,news); regulatoryStep(state,deep,news); processMABids(state,deep,news);
  deep.lastProcessedTick=state.simulationTick; deep.systemicNews.unshift(...news.slice(0,12)); deep.systemicNews=deep.systemicNews.slice(0,100);
}
