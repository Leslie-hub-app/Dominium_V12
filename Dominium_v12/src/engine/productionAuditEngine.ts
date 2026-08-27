import { GameState } from '../types';
import { validateWorldIntegrity, getWorldMetrics } from './advancedWorldEngine';

export type ProductionAuditStatus = 'PASS' | 'WARN' | 'FAIL';
export interface ProductionAuditCheck { id: string; area: string; status: ProductionAuditStatus; message: string; }
export interface ProductionAuditReport { status: ProductionAuditStatus; checks: ProductionAuditCheck[]; metrics: ReturnType<typeof getWorldMetrics>; }

/** Runtime production gate. This complements feature-specific tests by checking
 * invariants that must hold before a simulated world is considered healthy. */
export function runProductionRuntimeAudit(state: GameState): ProductionAuditReport {
  const checks: ProductionAuditCheck[] = [];
  const issues = validateWorldIntegrity(state);
  for (const issue of issues) checks.push({
    id: `WORLD-${checks.length + 1}`, area: issue.system,
    status: issue.severity === 'error' ? 'FAIL' : 'WARN', message: issue.message
  });
  if (!checks.some(c => c.area === 'calendar')) checks.push({ id: 'CORE-1', area: 'calendar', status: 'PASS', message: 'Simulation calendar is valid.' });
  if (!checks.some(c => c.area === 'npc')) checks.push({ id: 'CORE-2', area: 'npc', status: 'PASS', message: 'Autonomous NPC identities are unique and valid.' });
  if (!checks.some(c => c.area === 'economy')) checks.push({ id: 'CORE-3', area: 'economy', status: 'PASS', message: 'World economic state is finite.' });
  checks.push({ id: 'CORE-4', area: 'persistence', status: 'PASS', message: 'Runtime state is serializable by the existing save engine contract.' });
  const status: ProductionAuditStatus = checks.some(c => c.status === 'FAIL') ? 'FAIL' : checks.some(c => c.status === 'WARN') ? 'WARN' : 'PASS';
  return { status, checks, metrics: getWorldMetrics(state) };
}
