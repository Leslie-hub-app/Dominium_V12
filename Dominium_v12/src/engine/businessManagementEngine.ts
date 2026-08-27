import { 
  GameState, 
  Company, 
  CompanyExecutive, 
  MergerAcquisitionDeal, 
  MADealStage 
} from '../types';
import { recordFinancialTransaction } from './financialLedgerEngine';

export function hireCompanyExecutive(
  state: GameState,
  companyId: string,
  exec: {
    name: string;
    role: 'CEO' | 'CFO' | 'COO' | 'CTO' | 'CMO' | 'General Counsel';
    salaryMonthly: number;
    competence: number;
    loyalty: number;
    personality: 'Aggressive Growth' | 'Conservative Prudent' | 'Tech Visionary' | 'Cost Cutter' | 'Dealmaker';
  }
): { success: boolean; message: string; executive?: CompanyExecutive } {
  const company = state.companies.find(c => c.id === companyId);
  if (!company) return { success: false, message: 'Company not found.' };

  const newExecutive: CompanyExecutive = {
    id: `exec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    companyId,
    name: exec.name,
    role: exec.role,
    salaryMonthly: exec.salaryMonthly,
    competence: exec.competence,
    loyalty: exec.loyalty,
    ambition: Math.floor(Math.random() * 40) + 60,
    personality: exec.personality,
    performanceRecord: [`Appointed as ${exec.role}.`]
  };

  // Attach or replace executive in company
  if (!(company as any).executives) {
    (company as any).executives = [];
  }
  (company as any).executives = (company as any).executives.filter((e: CompanyExecutive) => e.role !== exec.role);
  (company as any).executives.push(newExecutive);

  return {
    success: true,
    message: `Appointed ${exec.name} as ${exec.role} of ${company.name} ($${exec.salaryMonthly.toLocaleString()}/mo).`,
    executive: newExecutive
  };
}

export function fireCompanyExecutive(
  state: GameState,
  companyId: string,
  executiveId: string
): { success: boolean; message: string } {
  const company = state.companies.find(c => c.id === companyId);
  if (!company || !(company as any).executives) {
    return { success: false, message: 'Company or executive roster not found.' };
  }

  const exec = (company as any).executives.find((e: CompanyExecutive) => e.id === executiveId);
  if (!exec) return { success: false, message: 'Executive not found.' };

  const severance = exec.salaryMonthly * 3;
  const currentCash = company.cashReserve ?? (company.cash || 0);
  if (currentCash >= severance) {
    company.cashReserve = currentCash - severance;
    company.cash = company.cashReserve;
  }

  (company as any).executives = (company as any).executives.filter((e: CompanyExecutive) => e.id !== executiveId);

  return {
    success: true,
    message: `Dismissed ${exec.name} (${exec.role}) with $${severance.toLocaleString()} severance package.`
  };
}

export function launchCorporateMergerAcquisition(
  state: GameState,
  companyId: string,
  targetCompanyName: string,
  targetIndustry: string,
  targetValuation: number,
  financingMethod: 'ALL_CASH' | 'DEBT_FINANCED' | 'STOCK_SWAP' | 'HYBRID'
): { success: boolean; message: string; deal?: MergerAcquisitionDeal } {
  const company = state.companies.find(c => c.id === companyId);
  if (!company) return { success: false, message: 'Acquiring company not found.' };

  const offerPrice = Math.round(targetValuation * 1.15); // 15% control premium
  const currentCash = company.cashReserve ?? (company.cash || 0);

  if (financingMethod === 'ALL_CASH' && currentCash < offerPrice) {
    return { success: false, message: `Insufficient corporate treasury cash ($${currentCash.toLocaleString()}) for all-cash buyout of $${offerPrice.toLocaleString()}.` };
  }

  const deal: MergerAcquisitionDeal = {
    id: `ma_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    targetCompanyName,
    targetIndustry,
    targetValuation,
    proposedPurchasePrice: offerPrice,
    financingMethod,
    stage: 'DUE_DILIGENCE',
    synergyPotentialAnnual: Math.round(offerPrice * 0.15),
    integrationRisk: 'Moderate',
    status: 'PENDING'
  };

  if (!(company as any).activeMADeals) {
    (company as any).activeMADeals = [];
  }
  (company as any).activeMADeals.push(deal);

  return {
    success: true,
    message: `M&A offer launched for ${targetCompanyName} at $${offerPrice.toLocaleString()} valuation (${financingMethod}). Advancing to due diligence.`,
    deal
  };
}

export function advanceMergerAcquisitionDeal(
  state: GameState,
  companyId: string,
  dealId: string
): { success: boolean; message: string; completed?: boolean } {
  const company = state.companies.find(c => c.id === companyId);
  if (!company || !(company as any).activeMADeals) {
    return { success: false, message: 'Company or M&A deals not found.' };
  }

  const deal = (company as any).activeMADeals.find((d: MergerAcquisitionDeal) => d.id === dealId);
  if (!deal || deal.status !== 'PENDING') {
    return { success: false, message: 'Active M&A deal not found.' };
  }

  const stageFlow: MADealStage[] = [
    'DUE_DILIGENCE',
    'VALUATION_AND_OFFER',
    'BOARD_NEGOTIATION',
    'FINANCING_APPROVAL',
    'INTEGRATION',
    'COMPLETED'
  ];

  const curIdx = stageFlow.indexOf(deal.stage);
  if (curIdx >= 0 && curIdx < stageFlow.length - 1) {
    deal.stage = stageFlow[curIdx + 1];

    if (deal.stage === 'COMPLETED') {
      deal.status = 'COMPLETED';
      // Add acquired valuation and revenue synergies
      company.valuation += deal.targetValuation;
      company.monthlyRevenue += Math.round(deal.synergyPotentialAnnual / 12);
      
      return {
        success: true,
        message: `ACQUISITION COMPLETE: ${deal.targetCompanyName} successfully consolidated into ${company.name}! Valuation expanded by +$${deal.targetValuation.toLocaleString()}.`,
        completed: true
      };
    }

    return {
      success: true,
      message: `Deal stage advanced to: ${deal.stage.replace(/_/g, ' ')}.`,
      completed: false
    };
  }

  return { success: true, message: 'Deal is already finalized.' };
}

export function executeCorporateExit(
  state: GameState,
  companyId: string,
  exitType: 'SELL_STAKE' | 'SECONDARY_BUYOUT' | 'FULL_SALE',
  stakePercent: number
): { success: boolean; message: string; grossProceeds: number } {
  const company = state.companies.find(c => c.id === companyId);
  if (!company) return { success: false, message: 'Company not found.', grossProceeds: 0 };

  const sellPercent = Math.min(stakePercent, company.playerOwnershipPercentage);
  if (sellPercent <= 0) {
    return { success: false, message: 'You have no remaining equity ownership in this firm.', grossProceeds: 0 };
  }

  const grossProceeds = Math.round((company.valuation * sellPercent) / 100);
  company.playerOwnershipPercentage -= sellPercent;
  state.finances.cash += grossProceeds;

  recordFinancialTransaction(state, {
    type: 'COMPANY_ACQUISITION',
    category: 'INCOME',
    amount: grossProceeds,
    description: `Corporate equity exit: Sold ${sellPercent}% of ${company.name} (${exitType})`,
    destinationAccount: 'Liquid Cash'
  });

  if (company.playerOwnershipPercentage <= 0) {
    state.companies = state.companies.filter(c => c.id !== companyId);
  }

  return {
    success: true,
    message: `Sold ${sellPercent}% stake in ${company.name} for $${grossProceeds.toLocaleString()} net proceeds.`,
    grossProceeds
  };
}

export function simulateMonthlyCorporateManagement(state: GameState): void {
  state.companies.forEach(company => {
    const executives = (company as any).executives as CompanyExecutive[] | undefined;
    if (executives && executives.length > 0) {
      let totalExecCost = 0;
      let avgCompetence = 0;

      executives.forEach(exec => {
        totalExecCost += exec.salaryMonthly;
        avgCompetence += exec.competence;
      });

      avgCompetence = Math.round(avgCompetence / executives.length);

      // Deduct executive payroll
      const currentCash = company.cashReserve ?? (company.cash || 0);
      if (currentCash >= totalExecCost) {
        company.cashReserve = currentCash - totalExecCost;
        company.cash = company.cashReserve;
      }

      // High competence executive boost to revenue
      if (avgCompetence > 75) {
        const boost = Math.round(company.monthlyRevenue * 0.04);
        company.monthlyRevenue += boost;
      }
    }
  });
}
