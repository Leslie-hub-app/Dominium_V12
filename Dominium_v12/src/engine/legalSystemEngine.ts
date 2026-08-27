import { GameState } from '../types';
import { 
  ensureLegalSystemProfile, 
  simulateMonthlyLegalStep, 
  fileNewLawsuit, 
  retainLegalCounsel as retainCounsel 
} from './legalEngine';

export function ensureLegalSystemState(state: GameState) {
  const profile = ensureLegalSystemProfile(state);
  state.expansion2Legal = profile;
  return {
    ...profile,
    activeLitigations: profile.activeCases.map(c => ({
      ...c,
      currentCourt: c.jurisdiction
    })),
    retainedCounsel: {
      name: profile.retainedCounselTier === 'ELITE_WHITE_COLLAR' ? 'Sterling & Blackwell LLP' : 'Standard Counsel',
      tier: profile.retainedCounselTier
    },
    legalBudgetMonthly: profile.retainedCounselMonthlyRetainer || 5000
  };
}

export function simulateMonthlyLegalSystem(state: GameState): void {
  simulateMonthlyLegalStep(state);
  ensureLegalSystemState(state);
}

export function fileLegalCase(
  state: GameState, 
  claimType: any = 'PATENT_INFRINGEMENT', 
  role: string = 'DEFENDANT', 
  defendantName: string = 'Global Tech Conglomerate', 
  claimAmount: number = 250000
) {
  const res = fileNewLawsuit(state, defendantName, 'CORPORATE_BREACH', 'FEDERAL_CIRCUIT', claimAmount);
  ensureLegalSystemState(state);
  return res;
}

export function retainLegalCounsel(state: GameState, counselTier: any = 'ELITE_WHITE_COLLAR') {
  const res = retainCounsel(state, 'ELITE_WHITE_COLLAR');
  ensureLegalSystemState(state);
  return res;
}
