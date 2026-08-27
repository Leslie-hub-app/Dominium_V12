import { 
  GameState, 
  DecisionHistoryEntry, 
  ConsequenceHistoryEntry, 
  DecisionCategory, 
  DecisionImportance, 
  DecisionRisk, 
  DecisionConsequenceData,
  ScheduledConsequence 
} from '../types';

/**
 * Deep freezes an object to ensure retroactive immutability of historical records.
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Freeze array elements or object properties recursively
  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = (obj as any)[prop];
    if (
      value !== null &&
      (typeof value === 'object' || typeof value === 'function') &&
      !Object.isFrozen(value)
    ) {
      deepFreeze(value);
    }
  });

  return obj as Readonly<T>;
}

export interface NewDecisionHistoryInput {
  id?: string;
  month?: number;
  year?: number;
  category: DecisionCategory | string;
  title: string;
  description: string;
  decisionId?: string;
  optionId?: string;
  optionLabel?: string;
  immediateConsequences?: DecisionConsequenceData | Record<string, any>;
  scheduledConsequences?: ScheduledConsequence[];
  affectedEntities?: string[];
  risk?: DecisionRisk | string;
  result?: string;
  success?: boolean;
  importance?: DecisionImportance | string;
  relatedEventId?: string;
  chainId?: string;
}

export interface NewConsequenceHistoryInput {
  id?: string;
  month?: number;
  year?: number;
  source: string;
  category: string;
  description: string;
  affectedEntity?: string;
  valueBefore?: number | string;
  valueAfter?: number | string;
  change?: number | string;
  relatedDecisionId?: string;
  relatedEventId?: string;
  delayed?: boolean;
  resolved?: boolean;
}

/**
 * Creates an immutable DecisionHistoryEntry
 */
export function createDecisionHistoryEntry(
  input: NewDecisionHistoryInput,
  currentMonth: number,
  currentYear: number
): DecisionHistoryEntry {
  const entry: DecisionHistoryEntry = {
    id: input.id || `dec-hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    month: input.month ?? currentMonth,
    year: input.year ?? currentYear,
    category: input.category,
    title: input.title,
    description: input.description,
    decisionId: input.decisionId,
    optionId: input.optionId,
    optionLabel: input.optionLabel,
    immediateConsequences: input.immediateConsequences ? JSON.parse(JSON.stringify(input.immediateConsequences)) : undefined,
    scheduledConsequences: input.scheduledConsequences ? JSON.parse(JSON.stringify(input.scheduledConsequences)) : undefined,
    affectedEntities: input.affectedEntities ? [...input.affectedEntities] : undefined,
    risk: input.risk || 'Low',
    result: input.result,
    success: input.success,
    importance: input.importance || 'Moderate',
    relatedEventId: input.relatedEventId,
    chainId: input.chainId
  };

  return deepFreeze(entry);
}

/**
 * Creates an immutable ConsequenceHistoryEntry
 */
export function createConsequenceHistoryEntry(
  input: NewConsequenceHistoryInput,
  currentMonth: number,
  currentYear: number
): ConsequenceHistoryEntry {
  const entry: ConsequenceHistoryEntry = {
    id: input.id || `csq-hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    month: input.month ?? currentMonth,
    year: input.year ?? currentYear,
    source: input.source,
    category: input.category,
    description: input.description,
    affectedEntity: input.affectedEntity,
    valueBefore: input.valueBefore,
    valueAfter: input.valueAfter,
    change: input.change,
    relatedDecisionId: input.relatedDecisionId,
    relatedEventId: input.relatedEventId,
    delayed: input.delayed ?? false,
    resolved: input.resolved ?? true
  };

  return deepFreeze(entry);
}

/**
 * Helper function to record a meaningful decision into the game state's decision history.
 * Guarantees that history does not mutate retroactively by creating a new frozen entry
 * and returning an updated immutable state slice.
 */
export function recordDecisionHistory(
  state: GameState,
  input: NewDecisionHistoryInput
): { nextState: GameState; recordedEntry: DecisionHistoryEntry } {
  const newEntry = createDecisionHistoryEntry(input, state.currentMonth, state.currentYear);
  
  // Prepend new entry to keep chronological ordering with newest first
  const existingHistory = state.decisionHistory || [];
  const updatedHistory = [newEntry, ...existingHistory];

  const nextState: GameState = {
    ...state,
    decisionHistory: updatedHistory
  };

  return { nextState, recordedEntry: newEntry };
}

/**
 * Helper function to record a consequence into the game state's consequence history.
 * Guarantees immutability and persistence.
 */
export function recordConsequenceHistory(
  state: GameState,
  input: NewConsequenceHistoryInput
): { nextState: GameState; recordedEntry: ConsequenceHistoryEntry } {
  const newEntry = createConsequenceHistoryEntry(input, state.currentMonth, state.currentYear);

  const existingHistory = state.consequenceHistory || [];
  const updatedHistory = [newEntry, ...existingHistory];

  const nextState: GameState = {
    ...state,
    consequenceHistory: updatedHistory
  };

  return { nextState, recordedEntry: newEntry };
}

/**
 * Combined helper to record both a major decision and its primary consequence simultaneously.
 */
export function recordDecisionWithConsequences(
  state: GameState,
  decisionInput: NewDecisionHistoryInput,
  consequences: NewConsequenceHistoryInput[] = []
): { nextState: GameState; decisionEntry: DecisionHistoryEntry; consequenceEntries: ConsequenceHistoryEntry[] } {
  const decResult = recordDecisionHistory(state, decisionInput);
  let currentState = decResult.nextState;
  const recordedConsequences: ConsequenceHistoryEntry[] = [];

  for (const csq of consequences) {
    const csqInput: NewConsequenceHistoryInput = {
      ...csq,
      relatedDecisionId: csq.relatedDecisionId || decResult.recordedEntry.id
    };
    const csqResult = recordConsequenceHistory(currentState, csqInput);
    currentState = csqResult.nextState;
    recordedConsequences.push(csqResult.recordedEntry);
  }

  return {
    nextState: currentState,
    decisionEntry: decResult.recordedEntry,
    consequenceEntries: recordedConsequences
  };
}

/**
 * Formats recent and major decisions into an executive summary text for AI consultation context.
 */
export function formatDecisionHistoryForAi(state: GameState, maxItems: number = 10): string {
  const history = state.decisionHistory || [];
  if (history.length === 0) {
    return 'No major recorded strategic decisions to date.';
  }

  const topDecisions = history.slice(0, maxItems);
  return topDecisions.map((d, index) => {
    const outcomeStr = d.result ? ` Outcome: ${d.result}.` : d.success !== undefined ? ` Result: ${d.success ? 'Success' : 'Failure'}.` : '';
    const affected = d.affectedEntities && d.affectedEntities.length > 0 ? ` [Entity: ${d.affectedEntities.join(', ')}]` : '';
    return `${index + 1}. [Year ${d.year}, M${d.month} - ${d.category} / ${d.importance || 'Major'}] "${d.title}" - ${d.description}${outcomeStr}${affected}`;
  }).join('\n');
}

/**
 * Formats consequence history for AI consultation context.
 */
export function formatConsequenceHistoryForAi(state: GameState, maxItems: number = 8): string {
  const history = state.consequenceHistory || [];
  if (history.length === 0) {
    return 'No long-term consequence tracking entries.';
  }

  const topConsequences = history.slice(0, maxItems);
  return topConsequences.map((c, idx) => {
    const entity = c.affectedEntity ? ` (${c.affectedEntity})` : '';
    const changeStr = c.change !== undefined ? ` Change: ${c.change}.` : '';
    return `${idx + 1}. [Year ${c.year}, M${c.month} - ${c.source}] ${c.description}${entity}.${changeStr}`;
  }).join('\n');
}
