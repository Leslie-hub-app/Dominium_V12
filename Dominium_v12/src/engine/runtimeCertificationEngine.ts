import { GameState } from '../types';
import { createInitialGameState, advanceOneMonth } from './simulationEngine';
import { autoSaveGame, loadGameFromSlot } from './saveEngine';
import { runProductionRuntimeAudit } from './productionAuditEngine';
import { runMasterFunctionalityAudit } from './masterFunctionalityAudit';
import { runAllIntegrationTests } from './integrationTestEngine';

export type CertificationStatus = 'PASS' | 'WARN' | 'FAIL';
export interface CertificationCheck {
  id: string;
  surface: 'ENGINE' | 'SIMULATION' | 'PERSISTENCE' | 'INTEGRATION' | 'STATE';
  status: CertificationStatus;
  message: string;
  evidence?: string;
}
export interface RuntimeCertificationReport {
  generatedAt: string;
  status: CertificationStatus;
  checks: CertificationCheck[];
  summary: { total: number; passed: number; warnings: number; failed: number };
}

const push = (checks: CertificationCheck[], check: CertificationCheck) => checks.push(check);

/**
 * Production runtime gate. Uses fresh, deterministic game state and exercises the
 * authoritative simulation, persistence and existing integration suites. It does
 * not certify a feature merely because its source file exists.
 */
export async function runRuntimeCertification(): Promise<RuntimeCertificationReport> {
  const checks: CertificationCheck[] = [];
  let state: GameState = createInitialGameState('Runtime', 'Auditor', 'Male', 'United States', 'New York', 'Business Mode', 'Realistic');

  const baseline = runProductionRuntimeAudit(state);
  push(checks, {
    id: 'RTC-ENGINE-001', surface: 'ENGINE', status: baseline.status,
    message: 'Fresh world integrity gate.', evidence: baseline.checks.map(c => `${c.id}:${c.status}`).join(', ')
  });

  try {
    const startTick = state.simulationTick || 0;
    const first = advanceOneMonth(state);
    state = first.nextState;
    const second = advanceOneMonth(state);
    state = second.nextState;
    const advanced = (state.simulationTick || 0) >= startTick + 2;
    push(checks, {
      id: 'RTC-SIM-001', surface: 'SIMULATION', status: advanced ? 'PASS' : 'FAIL',
      message: 'Two consecutive authoritative monthly simulations advance without replacing canonical state.',
      evidence: `tick ${startTick} -> ${state.simulationTick}; date ${state.month}/${state.year}`
    });
    push(checks, {
      id: 'RTC-SIM-002', surface: 'SIMULATION',
      status: first.afterSnapshot && second.afterSnapshot && Array.isArray(second.monthlyEvents) ? 'PASS' : 'FAIL',
      message: 'Monthly snapshots, events and result contracts are returned.',
      evidence: `events=${second.monthlyEvents.length}, news=${second.monthlyNews.length}`
    });
  } catch (error) {
    push(checks, { id: 'RTC-SIM-EX', surface: 'SIMULATION', status: 'FAIL', message: 'Authoritative monthly simulation threw an exception.', evidence: String(error) });
  }

  try {
    autoSaveGame(state);
    const restored = loadGameFromSlot('autosave_main');
    const passed = !!restored && restored.character.id === state.character.id && restored.month === state.month && restored.year === state.year;
    push(checks, {
      id: 'RTC-PERSIST-001', surface: 'PERSISTENCE', status: passed ? 'PASS' : 'FAIL',
      message: 'Autosave and reload preserve canonical identity and calendar.',
      evidence: restored ? `${restored.month}/${restored.year}` : 'No restored state'
    });
  } catch (error) {
    push(checks, { id: 'RTC-PERSIST-EX', surface: 'PERSISTENCE', status: 'FAIL', message: 'Persistence contract threw an exception.', evidence: String(error) });
  }

  try {
    const master = runMasterFunctionalityAudit();
    push(checks, {
      id: 'RTC-MASTER-001', surface: 'STATE', status: master.passed ? 'PASS' : 'FAIL',
      message: 'Master functionality audit completed.',
      evidence: `${master.passedAssertions}/${master.totalAssertions} assertions passed`
    });
  } catch (error) {
    push(checks, { id: 'RTC-MASTER-EX', surface: 'STATE', status: 'FAIL', message: 'Master functionality audit threw an exception.', evidence: String(error) });
  }

  try {
    const suite = await runAllIntegrationTests();
    push(checks, {
      id: 'RTC-INTEGRATION-001', surface: 'INTEGRATION', status: suite.allPassed ? 'PASS' : suite.failedCount === 0 ? 'WARN' : 'FAIL',
      message: 'Integration suite completed.', evidence: `${suite.passedCount}/${suite.totalTests} tests passed`
    });
  } catch (error) {
    push(checks, { id: 'RTC-INTEGRATION-EX', surface: 'INTEGRATION', status: 'FAIL', message: 'Integration suite threw an exception.', evidence: String(error) });
  }

  const passed = checks.filter(c => c.status === 'PASS').length;
  const warnings = checks.filter(c => c.status === 'WARN').length;
  const failed = checks.filter(c => c.status === 'FAIL').length;
  return {
    generatedAt: new Date().toISOString(),
    status: failed ? 'FAIL' : warnings ? 'WARN' : 'PASS',
    checks,
    summary: { total: checks.length, passed, warnings, failed }
  };
}
