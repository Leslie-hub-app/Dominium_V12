import { GameState } from '../types';
import { recordFinancialTransaction } from './financialLedgerEngine';
import {
  initializeCorporateSystemState as initializeAdvancedCorporateSystemState,
  ensureCorporateSystemState as ensureAdvancedCorporateSystemState,
  simulateMonthlyCorporateEngine,
  launchCorporateTakeover,
  advanceCorporateTakeover
} from './corporateSimulationEngine';

export interface CorporateExecutive {
  id: string;
  name: string;
  role: 'CEO' | 'CFO' | 'CTO' | 'COO' | 'CMO' | 'General Counsel';
  salaryMonthly: number;
  competence: number;
  loyalty: number;
  vision: number;
}

export interface MergerAcquisitionTarget {
  id: string;
  name: string;
  sector: string;
  marketSharePercent: number;
  annualRevenue: number;
  ebitdaMargin: number;
  askingPrice: number;
  synergyPotential: number;
  status: 'IDENTIFIED' | 'DUE_DILIGENCE' | 'BID_SUBMITTED' | 'ACQUIRED' | 'REJECTED';
}

export type CorporateSystemState = import('../types').CorporateSystemState;

export function initializeCorporateSystemState(): CorporateSystemState {
  return initializeAdvancedCorporateSystemState();
}

export function ensureCorporateSystemState(state: GameState): CorporateSystemState {
  return ensureAdvancedCorporateSystemState(state);
}

export function simulateMonthlyCorporateSystem(state: GameState): void {
  const news: string[] = [];
  simulateMonthlyCorporateEngine(state, news);
  if (news.length) {
    news.forEach((headline, i) => state.newsArchive.unshift({
      id: `corp_news_${state.simulationTick}_${i}`,
      month: state.currentMonth,
      year: state.currentYear,
      headline,
      body: headline,
      category: 'Business',
      importance: 'NORMAL',
      severity: 'Warning',
      impactExplanation: 'Corporate Simulation Engine event.'
    }));
  }
}

export function launchMergerBid(state: GameState, targetId: string, offerAmount: number): boolean {
  const target = state.companies.find(c => c.id === targetId);
  if (!target) return false;
  const premium = target.valuation > 0 ? Math.max(20, ((offerAmount / target.valuation) - 1) * 100) : 25;
  const started = launchCorporateTakeover(state, targetId, premium, true);
  if (!started.success) return false;
  const deal = ensureAdvancedCorporateSystemState(state).takeoverDeals.at(-1);
  if (!deal) return false;
  // Legacy callers expect a single-step bid; preserve that behavior by advancing to the first review stage.
  advanceCorporateTakeover(state, deal.id);
  recordFinancialTransaction(state, { type: 'MISCELLANEOUS', category: 'EXPENSE', amount: 0, description: `Legacy M&A bid submitted for ${target.name}.` });
  return true;
}
