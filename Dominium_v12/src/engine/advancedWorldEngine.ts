import { GameState, LifeEvent, NewsItem, SimulationDiff } from '../types';
import { advanceLivingWorldSimulation, ensureLivingWorldProfile } from './livingWorldEngine';

export interface WorldIntegrityIssue {
  severity: 'warning' | 'error';
  system: string;
  message: string;
}

export interface AdvancedWorldStepResult {
  state: GameState;
  events: LifeEvent[];
  news: NewsItem[];
  issues: WorldIntegrityIssue[];
}

/**
 * Production-facing adapter for the Dominium living world. It deliberately
 * reuses the canonical Living World Engine instead of creating a second
 * simulation loop.
 */
export function advanceAdvancedWorld(
  previousState: GameState,
  state: GameState,
  diff: SimulationDiff
): AdvancedWorldStepResult {
  const result = advanceLivingWorldSimulation(previousState, state, diff);
  return {
    state: result.nextState,
    events: result.generatedEvents,
    news: result.generatedNews,
    issues: validateWorldIntegrity(result.nextState)
  };
}

export function validateWorldIntegrity(state: GameState): WorldIntegrityIssue[] {
  const issues: WorldIntegrityIssue[] = [];
  const world = ensureLivingWorldProfile(state);
  const npcIds = new Set(world.npcs.map(npc => npc.id));

  // GameState historically carries both canonical currentMonth/currentYear and
  // compatibility month/year fields. Keep them synchronized until legacy callers
  // can be fully migrated.
  if (!Number.isFinite(state.currentYear) || !Number.isFinite(state.currentMonth)) {
    issues.push({ severity: 'error', system: 'calendar', message: 'World calendar is invalid.' });
  }
  if (state.month !== state.currentMonth || state.year !== state.currentYear) {
    issues.push({ severity: 'warning', system: 'calendar', message: 'Legacy and canonical calendar fields are out of sync.' });
  }
  if (state.currentMonth < 1 || state.currentMonth > 12) {
    issues.push({ severity: 'error', system: 'calendar', message: 'Current month must remain between 1 and 12.' });
  }
  if (!Number.isFinite(world.economy.nationalGdpGrowth)) {
    issues.push({ severity: 'error', system: 'economy', message: 'GDP growth is not finite.' });
  }
  if (world.global.worldStability !== undefined && !Number.isFinite(world.global.worldStability)) {
    issues.push({ severity: 'error', system: 'global', message: 'World stability is not finite.' });
  }
  if (world.worldHistory.length > 5000) {
    issues.push({ severity: 'warning', system: 'history', message: 'World history exceeds the production retention threshold and should be compacted.' });
  }
  for (const npc of world.npcs) {
    if (!npc.id || !npc.firstName || !npc.lastName) {
      issues.push({ severity: 'warning', system: 'npc', message: 'An autonomous NPC is missing canonical identity data.' });
    }
  }
  if (npcIds.size !== world.npcs.length) {
    issues.push({ severity: 'error', system: 'npc', message: 'Duplicate autonomous NPC IDs detected.' });
  }
  return issues;
}

/** Compact diagnostic snapshot suitable for a stress harness or developer UI. */
export function getWorldMetrics(state: GameState) {
  const world = ensureLivingWorldProfile(state);
  return {
    tick: state.simulationTick,
    npcs: world.npcs.length,
    competitors: world.competitors.length,
    businesses: world.businesses.length,
    politicalActors: world.politicalActors.length,
    activeEvents: world.activeWorldEvents.length,
    historyEntries: world.worldHistory.length,
    economyCycle: world.economy.currentCycle,
    worldStability: world.global.worldStability ?? 100
  };
}
