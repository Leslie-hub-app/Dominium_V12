import { GameState, LivingNpc } from '../types';
import { 
  normalizeCanonicalNpc, 
  evaluateNPCSimulationImportance, 
  getNpcDeterministicSeed, 
  calculateNpcActionScore,
  simulateAutonomousNpcEcosystem 
} from './npcLifeEngine';
import { respondToNpcRequest, offerJobToNpc, socializeWithLivingNpc } from './npcActionEngine';
import { ensureLivingWorldProfile } from './livingWorldEngine';

export interface Expansion4ValidationResult {
  passed: boolean;
  totalNpcsAudited: number;
  majorNpcsCount: number;
  activeNpcsCount: number;
  deterministicConsistency: boolean;
  goalIntegrityPassed: boolean;
  actionEnginePassed: boolean;
  errors: string[];
  summary: string;
}

/**
 * Runs a comprehensive validation and stress test suite on Expansion 4 Autonomous NPC Systems.
 */
export function runExpansion4ValidationSuite(state: GameState): Expansion4ValidationResult {
  const errors: string[] = [];
  const lw = ensureLivingWorldProfile(state);

  if (!lw || !Array.isArray(lw.npcs) || lw.npcs.length === 0) {
    errors.push('Living world NPCs array is empty or undefined.');
    return {
      passed: false,
      totalNpcsAudited: 0,
      majorNpcsCount: 0,
      activeNpcsCount: 0,
      deterministicConsistency: false,
      goalIntegrityPassed: false,
      actionEnginePassed: false,
      errors,
      summary: 'Expansion 4 validation failed: no living NPCs.'
    };
  }

  let majorCount = 0;
  let activeCount = 0;
  const seenIds = new Set<string>();

  // 1. Audit every NPC structure
  for (let i = 0; i < lw.npcs.length; i++) {
    const raw = lw.npcs[i];
    const npc = normalizeCanonicalNpc(raw, i);
    lw.npcs[i] = npc;

    if (seenIds.has(npc.id)) {
      errors.push(`Duplicate NPC ID detected: ${npc.id}`);
    }
    seenIds.add(npc.id);

    if (npc.simulationTier === 'MAJOR') majorCount++;
    if (npc.simulationTier === 'ACTIVE') activeCount++;

    // Check Personality range
    const p = npc.personality;
    const traits = [
      p.ambition, p.intelligence, p.discipline, p.confidence,
      p.sociability, p.empathy, p.integrity, p.aggression,
      p.loyalty, p.patience, p.greed, p.generosity,
      p.riskTolerance, p.competitiveness, p.entrepreneurialDrive, p.politicalInterest
    ];

    for (const t of traits) {
      if (typeof t !== 'number' || isNaN(t) || t < 0 || t > 100) {
        errors.push(`Invalid personality trait value in NPC ${npc.id}: ${t}`);
      }
    }

    // Check canonical goals
    if (!Array.isArray(npc.canonicalGoals) || npc.canonicalGoals.length === 0) {
      errors.push(`NPC ${npc.id} has no canonical goals.`);
    }

    // Check finances
    if (typeof npc.netWorth !== 'number' || isNaN(npc.netWorth)) {
      errors.push(`Invalid netWorth in NPC ${npc.id}`);
    }
  }

  // 2. Deterministic Consistency Test
  const testNpc = lw.npcs[0];
  const seed1 = getNpcDeterministicSeed(state, testNpc.id, 'APPLY_JOB', 100);
  const seed2 = getNpcDeterministicSeed(state, testNpc.id, 'APPLY_JOB', 100);
  const deterministicConsistency = seed1 === seed2 && seed1 >= 0 && seed1 < 1;
  if (!deterministicConsistency) {
    errors.push('Deterministic PRNG seed check failed.');
  }

  // 3. Test Action Engine Interaction Execution
  const testStateClone: GameState = JSON.parse(JSON.stringify(state));
  const testNpcClone = testStateClone.livingWorld!.npcs[0];
  const initialSentiment = testNpcClone.relationshipScore;
  const socResult = socializeWithLivingNpc(testStateClone, testNpcClone.id, 'COFFEE');
  const actionEnginePassed = socResult.success && testNpcClone.relationshipScore >= initialSentiment;

  // 4. Test Multi-Month Simulation Step
  const simEvents: any[] = [];
  const simNews: any[] = [];
  simulateAutonomousNpcEcosystem(testStateClone, simEvents, simNews);

  const passed = errors.length === 0 && deterministicConsistency && actionEnginePassed;

  return {
    passed,
    totalNpcsAudited: lw.npcs.length,
    majorNpcsCount: majorCount,
    activeNpcsCount: activeCount,
    deterministicConsistency,
    goalIntegrityPassed: errors.length === 0,
    actionEnginePassed,
    errors,
    summary: passed 
      ? `Expansion 4 validation passed across ${lw.npcs.length} canonical living NPCs (${majorCount} Major, ${activeCount} Active).` 
      : `Expansion 4 validation detected ${errors.length} issues.`
  };
}
