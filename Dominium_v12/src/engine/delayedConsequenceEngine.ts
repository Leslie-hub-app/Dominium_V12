import { 
  GameState, 
  DelayedConsequence, 
  Consequence, 
  StateCondition, 
  ConditionGroup, 
  LifeEvent, 
  ConsequenceResult 
} from '../types';
import { applyConsequences, evaluateConditionLogic } from './consequenceEngine';

/**
 * Calculates future target month and year given an offset in months.
 */
export function calculateFutureDate(
  currentMonth: number, 
  currentYear: number, 
  delayMonths: number
): { month: number; year: number } {
  const totalMonths = (currentYear * 12) + (currentMonth - 1) + delayMonths;
  const year = Math.floor(totalMonths / 12);
  const month = (totalMonths % 12) + 1;
  return { month, year };
}

/**
 * Helper to schedule a delayed consequence.
 */
export function scheduleDelayedConsequence(
  gameState: GameState,
  params: {
    delayMonths: number; // 1, 3, 6, 12, or custom
    source: string;
    description: string;
    consequences: Consequence[];
    conditions?: StateCondition | ConditionGroup;
    decisionId?: string;
    eventId?: string;
    chainId?: string;
    newsHeadline?: string;
    customTargetDate?: { month: number; year: number };
  }
): { nextState: GameState; scheduledItem: DelayedConsequence } {
  let executeAtMonth: number;
  let executeAtYear: number;

  if (params.customTargetDate) {
    executeAtMonth = params.customTargetDate.month;
    executeAtYear = params.customTargetDate.year;
  } else {
    const future = calculateFutureDate(gameState.currentMonth, gameState.currentYear, params.delayMonths);
    executeAtMonth = future.month;
    executeAtYear = future.year;
  }

  const executeTick = gameState.simulationTick + params.delayMonths;

  const scheduledItem: DelayedConsequence = {
    id: `del_csq_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    executeAtMonth,
    executeAtYear,
    scheduledTick: gameState.simulationTick,
    executeTick,
    source: params.source,
    description: params.description,
    consequences: params.consequences,
    conditions: params.conditions,
    decisionId: params.decisionId,
    eventId: params.eventId,
    chainId: params.chainId,
    status: 'Pending',
    newsHeadline: params.newsHeadline
  };

  const nextState: GameState = {
    ...gameState,
    delayedConsequences: [...(gameState.delayedConsequences || []), scheduledItem]
  };

  return {
    nextState,
    scheduledItem
  };
}

/**
 * Process all delayed consequences that are DUE at the current month and year.
 * Executes:
 * 1. Condition evaluation against actual GameState
 * 2. Application of consequences
 * 3. Generation of LifeEvents
 * 4. Status update to 'Executed' or 'Failed'
 */
export function processDueDelayedConsequences(
  gameState: GameState
): {
  nextState: GameState;
  executedCount: number;
  results: ConsequenceResult[];
  generatedEvents: LifeEvent[];
} {
  let currentState: GameState = { ...gameState };
  const delayedList = [...(currentState.delayedConsequences || [])];
  const results: ConsequenceResult[] = [];
  const generatedEvents: LifeEvent[] = [];
  let executedCount = 0;

  for (let i = 0; i < delayedList.length; i++) {
    const item = delayedList[i];
    
    // Only process Pending items that are due now or overdue
    if (item.status !== 'Pending') continue;

    const isDue = 
      item.executeTick <= currentState.simulationTick || 
      (currentState.currentYear > item.executeAtYear || 
       (currentState.currentYear === item.executeAtYear && currentState.currentMonth >= item.executeAtMonth));

    if (!isDue) continue;

    // Evaluate conditions if specified
    let conditionMet = true;
    if (item.conditions) {
      conditionMet = evaluateConditionLogic(currentState, item.conditions);
    }

    if (conditionMet) {
      // Execute the consequences against actual game state
      const consequencesToRun = item.consequences.map(c => ({
        ...c,
        source: item.source,
        decisionId: item.decisionId || c.decisionId,
        eventId: item.eventId || c.eventId,
        chainId: item.chainId || c.chainId
      }));

      const { nextState: stateAfterExecution, results: batchResults } = applyConsequences(
        currentState,
        consequencesToRun,
        true // Record into persistent consequenceHistory ledger
      );

      currentState = stateAfterExecution;
      results.push(...batchResults);
      executedCount++;

      // Update status
      delayedList[i] = {
        ...item,
        status: 'Executed'
      };

      // Create Life Event for the delayed consequence manifestation
      const summaryDetails = batchResults.map(r => `${r.target} ${r.field}: ${r.change}`);
      generatedEvents.push({
        id: `ev_delayed_${item.id}_${currentState.simulationTick}`,
        timestampMonth: currentState.currentMonth,
        timestampYear: currentState.currentYear,
        age: currentState.character.age,
        category: 'Business',
        title: `Delayed Consequence Matured: ${item.source}`,
        description: item.description,
        consequences: {
          details: summaryDetails
        }
      });
    } else {
      // Conditions were not met at the time of execution
      delayedList[i] = {
        ...item,
        status: 'Failed'
      };

      generatedEvents.push({
        id: `ev_delayed_fail_${item.id}_${currentState.simulationTick}`,
        timestampMonth: currentState.currentMonth,
        timestampYear: currentState.currentYear,
        age: currentState.character.age,
        category: 'Business',
        title: `Delayed Condition Averted: ${item.source}`,
        description: `Scheduled consequence was not triggered because prerequisite state conditions were not met.`,
        consequences: {
          details: ['Consequence bypassed: State condition evaluated false at maturity.']
        }
      });
    }
  }

  currentState.delayedConsequences = delayedList;

  return {
    nextState: currentState,
    executedCount,
    results,
    generatedEvents
  };
}
