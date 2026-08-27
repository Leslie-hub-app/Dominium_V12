import { 
  GameState, 
  PendingDecision, 
  SimulationEvent, 
  EventControlState, 
  EventControlConfig, 
  EventCooldownRecord,
  Consequence 
} from '../types';
import { ConsequenceEngine } from './consequenceEngine';
import { isLifeTierAtLeast, isLifeTierAtMost } from './lifeProgressionEngine';

// ==========================================
// DEFAULT EVENT CONTROL CONFIGURATION
// ==========================================

export const DEFAULT_EVENT_CONTROL_CONFIG: EventControlConfig = {
  maxActiveDecisions: 5,
  maxActivePerCategory: {
    Business: 2,
    Finance: 2,
    Politics: 2,
    Career: 2,
    Family: 2,
    Ethics: 2,
    Sports: 2,
    Health: 2
  },
  categoryMonthlyEventLimits: {
    PERSONAL: 2,
    HEALTH: 2,
    CAREER: 2,
    FAMILY: 2,
    RELATIONSHIP: 2,
    BUSINESS: 2,
    FINANCE: 2,
    INVESTMENT: 2,
    REAL_ESTATE: 2,
    POLITICS: 2,
    ECONOMY: 2,
    PROJECT: 2,
    SPORTS: 2,
    REPUTATION: 2,
    MEDIA: 2,
    DYNASTY: 1,
    SUCCESSION: 1,
    WORLD: 2
  },
  globalCooldowns: {
    // Business Revenue Decline: 6 months per company
    BUSINESS_REVENUE_DECLINE: 6,
    // Company Morale Breakdown: 6 months per company
    BUSINESS_MORALE_BREAKDOWN: 6,
    // Debt & Interest Rate Crisis: 6 months
    FINANCE_DEBT_CRISIS: 6,
    // Net Worth Expansion Opportunity: 8 months
    FINANCE_NET_WORTH_SURGE: 8,
    // Family Conflict / Relationship Strain: 3 months per relationship
    FAMILY_RELATIONSHIP_STRAIN: 3,
    // Major Political Scandal / Slump: 12 months
    POLITICS_APPROVAL_SLUMP: 12,
    POLITICS_SCANDAL: 12,
    POLITICS_MANDATE_MILESTONE: 8,
    // Real Estate Decay: 6 months per property
    REAL_ESTATE_CONDITION_DECAY: 6,
    // Health & Executive Burnout: 4 months
    HEALTH_EXECUTIVE_BURNOUT: 4,
    // Project Bottleneck: 4 months per project
    PROJECT_SUPPLY_BOTTLENECK: 4,
    // Generic Default
    DEFAULT_EVENT_COOLDOWN: 3
  }
};

export function createInitialEventControlState(): EventControlState {
  return {
    cooldowns: [],
    monthlyCategoryCounters: {},
    expiredEventsCount: 0,
    config: DEFAULT_EVENT_CONTROL_CONFIG
  };
}

// ==========================================
// COOLDOWN & DUPLICATE CHECKS
// ==========================================

/**
 * Checks whether an event or decision of a specific type for an entity is currently on cooldown.
 */
export function isEventOnCooldown(
  state: GameState,
  eventType: string,
  entityId: string = 'global'
): boolean {
  const ctrl = state.eventControlState || createInitialEventControlState();
  const currentTick = state.simulationTick;

  const record = (ctrl.cooldowns || []).find(
    c => c.eventType === eventType && c.entityId === entityId
  );

  if (!record) return false;
  return currentTick < record.expiresAtTick;
}

/**
 * Gets remaining cooldown months for an event type on an entity.
 */
export function getRemainingCooldownMonths(
  state: GameState,
  eventType: string,
  entityId: string = 'global'
): number {
  const ctrl = state.eventControlState || createInitialEventControlState();
  const currentTick = state.simulationTick;

  const record = (ctrl.cooldowns || []).find(
    c => c.eventType === eventType && c.entityId === entityId
  );

  if (!record) return 0;
  return Math.max(0, record.expiresAtTick - currentTick);
}

/**
 * Sets or refreshes a cooldown for an event type and entity.
 */
export function recordEventCooldown(
  state: GameState,
  eventType: string,
  entityId: string = 'global',
  customCooldownMonths?: number
): GameState {
  let ctrl = state.eventControlState ? { ...state.eventControlState } : createInitialEventControlState();
  const config = ctrl.config || DEFAULT_EVENT_CONTROL_CONFIG;
  const cooldownMonths = customCooldownMonths ?? config.globalCooldowns[eventType] ?? config.globalCooldowns.DEFAULT_EVENT_COOLDOWN ?? 3;
  const currentTick = state.simulationTick;
  const expiresAtTick = currentTick + cooldownMonths;

  const existingIndex = (ctrl.cooldowns || []).findIndex(
    c => c.eventType === eventType && c.entityId === entityId
  );

  const newRecord: EventCooldownRecord = {
    eventType,
    entityId,
    lastTriggeredMonth: state.currentMonth,
    lastTriggeredYear: state.currentYear,
    lastTriggeredTick: currentTick,
    cooldownMonths,
    expiresAtTick
  };

  let updatedCooldowns = [...(ctrl.cooldowns || [])];
  if (existingIndex >= 0) {
    updatedCooldowns[existingIndex] = newRecord;
  } else {
    updatedCooldowns.push(newRecord);
  }

  // Clean up expired cooldowns (older than 24 ticks expired) to keep state lean
  updatedCooldowns = updatedCooldowns.filter(c => currentTick <= c.expiresAtTick + 24);

  return {
    ...state,
    eventControlState: {
      ...ctrl,
      cooldowns: updatedCooldowns
    }
  };
}

export const setEventCooldown = recordEventCooldown;

// ==========================================
// CATEGORY LIMITS & DUPLICATE ARBITRATION
// ==========================================

/**
 * Validates and filters candidate events to prevent spam, duplicate identical events,
 * and category flooding in a single monthly cycle.
 */
export function filterAndControlEvents(
  state: GameState,
  candidateEvents: SimulationEvent[]
): {
  filteredEvents: SimulationEvent[];
  nextState: GameState;
} {
  let currentState = { ...state };
  let ctrl = currentState.eventControlState ? { ...currentState.eventControlState } : createInitialEventControlState();
  const config = ctrl.config || DEFAULT_EVENT_CONTROL_CONFIG;
  const monthlyCategoryCounters = { ...(ctrl.monthlyCategoryCounters || {}) };

  const filteredEvents: SimulationEvent[] = [];

  for (const event of candidateEvents) {
    const currentLifeTier = currentState.lifeProgression?.currentTier || 'FOUNDATION';
    if (event.minLifeTier && !isLifeTierAtLeast(currentLifeTier, event.minLifeTier)) {
      continue;
    }
    if (event.maxLifeTier && !isLifeTierAtMost(currentLifeTier, event.maxLifeTier)) {
      continue;
    }

    const category = event.category || 'PERSONAL';
    const categoryCount = monthlyCategoryCounters[category] || 0;
    const categoryLimit = config.categoryMonthlyEventLimits[category] ?? 2;

    // Check monthly category limit
    if (categoryCount >= categoryLimit) {
      continue;
    }

    // Check duplicate identical title in current events feed from recent months
    const hasRecentIdentical = (currentState.eventsFeed || []).slice(0, 8).some(
      existing => existing.title === event.title && existing.sourceEntityId === event.sourceEntityId
    );
    if (hasRecentIdentical) {
      continue;
    }

    // Event is accepted
    filteredEvents.push(event);
    monthlyCategoryCounters[category] = categoryCount + 1;
  }

  currentState.eventControlState = {
    ...ctrl,
    monthlyCategoryCounters
  };

  return {
    filteredEvents,
    nextState: currentState
  };
}

/**
 * Validates and filters candidate decisions based on:
 * 1. Global max active decisions (e.g. max 5)
 * 2. Category max active decisions (e.g. max 2 per Business)
 * 3. Event cooldowns per (eventTypeKey, entityId)
 * 4. Priority arbitration (higher priority decisions take precedence)
 */
export function filterAndControlDecisions(
  state: GameState,
  candidateDecisions: PendingDecision[]
): {
  admittedDecisions: PendingDecision[];
  nextState: GameState;
} {
  let currentState = { ...state };
  let ctrl = currentState.eventControlState ? { ...currentState.eventControlState } : createInitialEventControlState();
  const config = ctrl.config || DEFAULT_EVENT_CONTROL_CONFIG;
  const currentPending = currentState.pendingDecisions || [];

  const admittedDecisions: PendingDecision[] = [];

  // Sort candidate decisions by priority descending (default priority 50)
  const sortedCandidates = [...candidateDecisions].sort((a, b) => (b.priority ?? 50) - (a.priority ?? 50));

  for (const dec of sortedCandidates) {
    const currentLifeTier = currentState.lifeProgression?.currentTier || 'FOUNDATION';
    if (dec.minLifeTier && !isLifeTierAtLeast(currentLifeTier, dec.minLifeTier)) {
      continue;
    }
    if (dec.maxLifeTier && !isLifeTierAtMost(currentLifeTier, dec.maxLifeTier)) {
      continue;
    }

    // 1. Check if total active decisions capacity is reached
    const totalActive = currentPending.length + admittedDecisions.length;
    if (totalActive >= config.maxActiveDecisions) {
      // If candidate has critical priority (>85), allow replacing a low priority active decision (<30)
      if ((dec.priority ?? 50) >= 85) {
        const lowPriorityIndex = currentPending.findIndex(d => (d.priority ?? 50) < 30);
        if (lowPriorityIndex >= 0) {
          currentPending.splice(lowPriorityIndex, 1);
        } else {
          continue;
        }
      } else {
        continue;
      }
    }

    // 2. Check category limits
    const category = dec.category || 'Business';
    const activeInCat = currentPending.filter(d => d.category === category).length +
      admittedDecisions.filter(d => d.category === category).length;
    const catLimit = config.maxActivePerCategory[category] ?? 2;
    if (activeInCat >= catLimit) {
      continue;
    }

    // 3. Check Cooldowns if eventTypeKey is present
    const eventTypeKey = dec.eventTypeKey;
    const entityId = dec.entityId || 'global';
    if (eventTypeKey && isEventOnCooldown(currentState, eventTypeKey, entityId)) {
      continue;
    }

    // 4. Check duplicate prevention (by ID or same eventTypeKey + entityId)
    const isDuplicate = currentPending.some(d => d.id === dec.id || (eventTypeKey && d.eventTypeKey === eventTypeKey && d.entityId === entityId)) ||
      admittedDecisions.some(d => d.id === dec.id || (eventTypeKey && d.eventTypeKey === eventTypeKey && d.entityId === entityId));
    if (isDuplicate) {
      continue;
    }

    // Set creation metadata & expiration ticks if specified
    const enrichedDecision: PendingDecision = {
      ...dec,
      createdMonth: dec.createdMonth ?? currentState.currentMonth,
      createdYear: dec.createdYear ?? currentState.currentYear,
      createdTick: dec.createdTick ?? currentState.simulationTick,
      expiresAtTick: dec.expiresInMonths ? currentState.simulationTick + dec.expiresInMonths : dec.expiresAtTick
    };

    admittedDecisions.push(enrichedDecision);

    // If decision has a cooldown type, record it
    if (eventTypeKey) {
      currentState = recordEventCooldown(currentState, eventTypeKey, entityId);
    }
  }

  return {
    admittedDecisions,
    nextState: currentState
  };
}

// ==========================================
// DECISION & EVENT EXPIRATION SYSTEM
// ==========================================

export interface ExpirationResult {
  nextState: GameState;
  expiredDecisions: PendingDecision[];
  generatedEvents: SimulationEvent[];
}

/**
 * Evaluates all active PendingDecisions and expires those whose expiresAtTick is reached.
 * Executes any designated expiration consequences (e.g. competitor buys target, lost opportunity)
 * and logs an EXPIRED simulation event.
 */
export function processExpiredDecisions(gameState: GameState): ExpirationResult {
  let state = { ...gameState };
  const currentTick = state.simulationTick;
  const activeDecisions = state.pendingDecisions || [];

  const remainingDecisions: PendingDecision[] = [];
  const expiredDecisions: PendingDecision[] = [];
  const generatedEvents: SimulationEvent[] = [];

  for (const dec of activeDecisions) {
    if (dec.expiresAtTick && currentTick >= dec.expiresAtTick) {
      expiredDecisions.push(dec);

      // 1. Execute expiration consequences if configured
      if (dec.expirationConsequences && dec.expirationConsequences.length > 0) {
        for (const consequence of dec.expirationConsequences) {
          const { nextState: updatedAfterConsequence } = ConsequenceEngine.apply(state, consequence, true);
          state = updatedAfterConsequence;
        }
      }

      // 2. Generate EXPIRED LifeEvent
      const headline = dec.expirationEventHeadline || `Opportunity Expired: ${dec.title}`;
      const description = dec.expirationEventDescription || `The window of opportunity for '${dec.title}' has closed after remaining unaddressed. Market dynamics or counter-parties have moved forward without your participation.`;

      const expiredEvent: SimulationEvent = {
        id: `ev_expired_${dec.id}_${currentTick}`,
        category: (dec.category?.toUpperCase() as any) || 'BUSINESS',
        type: 'WARNING',
        title: headline,
        description: description,
        severity: 'Medium',
        priority: 45,
        source: 'Event Control & Expiration Engine',
        sourceEntityId: dec.entityId || dec.id,
        createdMonth: state.currentMonth,
        createdYear: state.currentYear,
        timestampMonth: state.currentMonth,
        timestampYear: state.currentYear,
        age: state.character.age,
        status: 'Expired',
        tags: ['Expired', dec.category || 'Business', 'EventControl'],
        triggerReason: `Decision '${dec.title}' was active for ${dec.expiresInMonths || 2} months without player action and automatically expired at Tick ${currentTick}.`
      };

      generatedEvents.push(expiredEvent);
    } else {
      remainingDecisions.push(dec);
    }
  }

  // Update expired count in event control state
  const ctrl = state.eventControlState ? { ...state.eventControlState } : createInitialEventControlState();
  state.eventControlState = {
    ...ctrl,
    expiredEventsCount: (ctrl.expiredEventsCount || 0) + expiredDecisions.length,
    monthlyCategoryCounters: {} // reset monthly category counters at tick start
  };

  state.pendingDecisions = remainingDecisions;

  return {
    nextState: state,
    expiredDecisions,
    generatedEvents
  };
}
