import { GameState } from '../types';
import { 
  ensureExpandedCareerProfile, 
  simulateMonthlyCareerStep, 
  attemptLicensingExam, 
  submitJobApplication 
} from './careerEngine';

export function ensureCareerSystemState(state: GameState) {
  const profile = ensureExpandedCareerProfile(state);
  state.expansion2Career = profile;
  return {
    ...profile,
    activeLicenses: profile.licensesHeld,
    reputationScore: profile.workPerformanceScore
  };
}

export function simulateMonthlyCareerSystem(state: GameState): void {
  simulateMonthlyCareerStep(state);
  ensureCareerSystemState(state);
}

export function takeLicensingExam(state: GameState, licenseId: string = 'CFA_CHARTER') {
  const res = attemptLicensingExam(state, licenseId);
  ensureCareerSystemState(state);
  return {
    passed: res.success || res.acquired,
    message: res.message
  };
}

export function applyForExecutiveJob(state: GameState, jobTitle: string = 'Managing Director - Private Equity') {
  const res = submitJobApplication(state, 'occ_pe_director');
  ensureCareerSystemState(state);
  return {
    success: res.success,
    message: res.message
  };
}
