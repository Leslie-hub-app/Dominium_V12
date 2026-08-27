import { GameState, PendingDecision, DecisionRiskLevel } from '../types';

export type DecisionInboxSection = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export interface EnrichedDecision extends PendingDecision {
  section: DecisionInboxSection;
  resolvedAffectedEntity: string;
  resolvedRisk: DecisionRiskLevel;
  resolvedPotentialUpside: string;
  resolvedPotentialDownside: string;
  resolvedUrgency: string;
  resolvedExpiration: string;
  resolvedDateCreated: string;
  isPostponeAllowed: boolean;
  remainingMonths: number | null;
  isExpiringSoon: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Determines which section a decision belongs to (CRITICAL, HIGH, NORMAL, LOW)
 */
export function getDecisionSection(decision: PendingDecision, state?: GameState): DecisionInboxSection {
  const urgencyUpper = (decision.urgency || '').toUpperCase();
  const priority = decision.priority ?? 50;
  const riskUpper = String(decision.risk || '').toUpperCase();

  // Expiration proximity check
  let remainingMonths: number | null = null;
  if (decision.expiresAtTick !== undefined && state?.simulationTick !== undefined) {
    remainingMonths = Math.max(0, decision.expiresAtTick - state.simulationTick);
  }

  // 1. CRITICAL:
  // - Immediate or Critical urgency
  // - Or 1 month remaining on urgent item
  // - Or priority >= 80
  // - Or explicit CRITICAL risk
  if (
    urgencyUpper === 'CRITICAL' ||
    urgencyUpper === 'IMMEDIATE' ||
    (remainingMonths !== null && remainingMonths <= 1 && (urgencyUpper === 'URGENT' || priority >= 70)) ||
    priority >= 80 ||
    riskUpper === 'CRITICAL'
  ) {
    return 'CRITICAL';
  }

  // 2. HIGH:
  // - Urgent or High urgency
  // - Or priority between 60 and 79
  // - Or explicit HIGH risk
  // - Or expiring in 1-2 months
  if (
    urgencyUpper === 'URGENT' ||
    urgencyUpper === 'HIGH' ||
    priority >= 60 ||
    riskUpper === 'HIGH' ||
    (remainingMonths !== null && remainingMonths <= 2 && priority >= 50)
  ) {
    return 'HIGH';
  }

  // 3. NORMAL:
  // - Standard / Normal urgency
  // - Or priority between 30 and 59
  // - Or MEDIUM risk
  if (
    urgencyUpper === 'STANDARD' ||
    urgencyUpper === 'NORMAL' ||
    priority >= 30 ||
    riskUpper === 'MEDIUM'
  ) {
    return 'NORMAL';
  }

  // 4. LOW:
  return 'LOW';
}

/**
 * Infers the affected entity name for a decision based on game state & metadata
 */
export function resolveAffectedEntity(decision: PendingDecision, state: GameState): string {
  if (decision.affectedEntity && decision.affectedEntity.trim() !== '') {
    return decision.affectedEntity;
  }

  // 1. Check if linked to a company
  if (decision.entityId) {
    const comp = state.companies.find(c => c.id === decision.entityId);
    if (comp) return comp.name;

    const rel = state.relationships.find(r => r.id === decision.entityId);
    if (rel) return `${rel.name} (${rel.relation})`;

    const team = state.sports.ownedTeams.find(t => t.id === decision.entityId);
    if (team) return team.name;

    const proj = state.projects.find(p => p.id === decision.entityId);
    if (proj) return proj.name;
  }

  // 2. Check contextData
  if (decision.contextData) {
    const parts = decision.contextData.split('|');
    if (parts[0] && parts[0].includes(':')) {
      const val = parts[0].split(':')[1].trim();
      if (val) return val;
    }
  }

  // 3. Infer from Category
  switch (decision.category) {
    case 'Business':
      return state.companies.length > 0 ? state.companies[0].name : `${state.character.lastName} Enterprises`;
    case 'Politics':
      return state.politics.currentOffice.inOffice ? state.politics.currentOffice.title : `${state.character.residenceCountry} Government`;
    case 'Family':
    case 'Dynasty': {
      const spouse = state.relationships.find(r => r.relation.toLowerCase() === 'spouse' || r.relation.toLowerCase() === 'partner');
      return spouse ? `${spouse.name} (${spouse.relation})` : `${state.character.lastName} Dynasty`;
    }
    case 'Sports':
      return state.sports.ownedTeams.length > 0 ? state.sports.ownedTeams[0].name : 'Athletic Syndicate';
    case 'Investment':
    case 'Finance':
    case 'Debt':
      return 'Global Capital Portfolio';
    case 'Career':
      return state.currentJob ? `${state.currentJob.title} (${state.currentJob.companyName})` : 'Professional Career';
    case 'Health':
      return `${state.character.firstName} ${state.character.lastName} (Personal Vitality)`;
    default:
      return `${state.character.firstName} ${state.character.lastName}`;
  }
}

/**
 * Resolves overall risk tier for a decision (CRITICAL, HIGH, MEDIUM, LOW)
 */
export function resolveRiskTier(decision: PendingDecision): DecisionRiskLevel {
  if (decision.risk) {
    const r = String(decision.risk).toUpperCase();
    if (r === 'CRITICAL') return 'CRITICAL';
    if (r === 'HIGH') return 'HIGH';
    if (r === 'MEDIUM') return 'MEDIUM';
    if (r === 'LOW') return 'LOW';
  }

  // Infer from options
  const hasHighRiskOption = decision.options.some(o => o.risk === 'High');
  const hasMedRiskOption = decision.options.some(o => o.risk === 'Medium');

  if (decision.urgency === 'Critical' || decision.urgency === 'Immediate') {
    return hasHighRiskOption ? 'CRITICAL' : 'HIGH';
  }

  if (hasHighRiskOption) return 'HIGH';
  if (hasMedRiskOption) return 'MEDIUM';
  return 'LOW';
}

/**
 * Resolves potential upside text
 */
export function resolvePotentialUpside(decision: PendingDecision): string {
  if (decision.potentialUpside && decision.potentialUpside.trim() !== '') {
    return decision.potentialUpside;
  }

  // Find best projected outcome from options
  const positiveOption = decision.options.find(o => 
    o.projectedOutcome && (
      o.projectedOutcome.toLowerCase().includes('restore') ||
      o.projectedOutcome.toLowerCase().includes('boost') ||
      o.projectedOutcome.toLowerCase().includes('growth') ||
      o.projectedOutcome.toLowerCase().includes('expansion') ||
      o.projectedOutcome.toLowerCase().includes('gain') ||
      o.projectedOutcome.toLowerCase().includes('+')
    )
  );

  if (positiveOption && positiveOption.projectedOutcome) {
    return positiveOption.projectedOutcome;
  }

  if (decision.options[0]?.projectedOutcome) {
    return decision.options[0].projectedOutcome;
  }

  switch (decision.category) {
    case 'Business':
      return 'Operational recovery, expanded market share, and revenue stability.';
    case 'Politics':
      return 'Elevated political capital, legislative momentum, and public approval.';
    case 'Family':
      return 'Restored emotional trust, domestic harmony, and dynastic unity.';
    case 'Investment':
    case 'Finance':
      return 'Asymmetric equity markup, enhanced liquidity, and institutional reputation.';
    case 'Career':
      return 'Professional advancement, prestige elevation, and higher earning power.';
    default:
      return 'Strategic resolution and forward momentum.';
  }
}

/**
 * Resolves potential downside text
 */
export function resolvePotentialDownside(decision: PendingDecision): string {
  if (decision.potentialDownside && decision.potentialDownside.trim() !== '') {
    return decision.potentialDownside;
  }

  if (decision.expirationEventDescription) {
    return decision.expirationEventDescription;
  }

  // Look for inaction or high-risk option
  const passOption = decision.options.find(o => 
    o.label.toLowerCase().includes('maintain') || 
    o.label.toLowerCase().includes('pass') || 
    o.label.toLowerCase().includes('decline') ||
    o.label.toLowerCase().includes('nothing')
  );

  if (passOption && passOption.projectedOutcome) {
    return passOption.projectedOutcome;
  }

  switch (decision.category) {
    case 'Business':
      return 'Further valuation loss, operational friction, and competitor market encroachment.';
    case 'Politics':
      return 'Erosion of public approval, legislative deadlock, and media scrutiny.';
    case 'Family':
      return 'Widened relational distance, diminished trust, and domestic strain.';
    case 'Investment':
    case 'Finance':
      return 'Forfeited allocation window, liquidity drag, or investment write-down.';
    case 'Career':
      return 'Missed promotion cycle and stagnating professional trajectory.';
    default:
      return 'Unaddressed friction and compound penalties over time.';
  }
}

/**
 * Formats expiration string (e.g. "2 months", "Immediate", "Persistent")
 */
export function resolveExpirationText(decision: PendingDecision, state: GameState): { text: string; remainingMonths: number | null; isExpiringSoon: boolean } {
  if (decision.expiresAtTick !== undefined && state.simulationTick !== undefined) {
    const remaining = Math.max(0, decision.expiresAtTick - state.simulationTick);
    if (remaining === 0) {
      return { text: 'Expiring this month', remainingMonths: 0, isExpiringSoon: true };
    }
    if (remaining === 1) {
      return { text: '1 month (Immediate)', remainingMonths: 1, isExpiringSoon: true };
    }
    return { text: `${remaining} months`, remainingMonths: remaining, isExpiringSoon: remaining <= 2 };
  }

  if (decision.expiresInMonths !== undefined) {
    return { 
      text: decision.expiresInMonths === 1 ? '1 month (Immediate)' : `${decision.expiresInMonths} months`,
      remainingMonths: decision.expiresInMonths,
      isExpiringSoon: decision.expiresInMonths <= 1
    };
  }

  if (decision.urgency === 'Immediate' || decision.urgency === 'Critical') {
    return { text: 'Immediate Action Required', remainingMonths: 0, isExpiringSoon: true };
  }

  return { text: 'No Expiration (Persistent)', remainingMonths: null, isExpiringSoon: false };
}

/**
 * Formats the creation date (e.g. "Month 2, 2026" or "February 2026")
 */
export function resolveDateCreated(decision: PendingDecision, state: GameState): string {
  const month = decision.createdMonth ?? state.currentMonth;
  const year = decision.createdYear ?? state.currentYear;
  const monthName = MONTH_NAMES[month - 1] || `Month ${month}`;
  return `${monthName} ${year}`;
}

/**
 * Determines whether a decision can be postponed
 * Rule: Do not allow postponement when the event requires immediate action or is Critical
 */
export function canPostponeDecision(decision: PendingDecision, state: GameState): boolean {
  // If explicitly flagged false
  if (decision.canBePostponed === false) {
    return false;
  }

  const urgencyUpper = (decision.urgency || '').toUpperCase();
  if (urgencyUpper === 'CRITICAL' || urgencyUpper === 'IMMEDIATE') {
    return false;
  }

  // If already reached limit of postponements (e.g. 2 times)
  if ((decision.postponeCount || 0) >= 2) {
    return false;
  }

  // If 0 months remaining and urgency is high
  if (decision.expiresAtTick !== undefined && state.simulationTick !== undefined) {
    const remaining = decision.expiresAtTick - state.simulationTick;
    if (remaining <= 0) {
      return false;
    }
  }

  return true;
}

/**
 * Enriches a single pending decision with all display and business attributes
 */
export function enrichDecision(decision: PendingDecision, state: GameState): EnrichedDecision {
  const section = getDecisionSection(decision, state);
  const resolvedAffectedEntity = resolveAffectedEntity(decision, state);
  const resolvedRisk = resolveRiskTier(decision);
  const resolvedPotentialUpside = resolvePotentialUpside(decision);
  const resolvedPotentialDownside = resolvePotentialDownside(decision);
  const { text: resolvedExpiration, remainingMonths, isExpiringSoon } = resolveExpirationText(decision, state);
  const resolvedDateCreated = resolveDateCreated(decision, state);
  const isPostponeAllowed = canPostponeDecision(decision, state);

  return {
    ...decision,
    section,
    resolvedAffectedEntity,
    resolvedRisk,
    resolvedPotentialUpside,
    resolvedPotentialDownside,
    resolvedUrgency: (decision.urgency || 'Standard').toUpperCase(),
    resolvedExpiration,
    resolvedDateCreated,
    isPostponeAllowed,
    remainingMonths,
    isExpiringSoon
  };
}

/**
 * Aggregates all pending decisions grouped into the 4 required sections:
 * CRITICAL, HIGH, NORMAL, LOW
 */
export function groupDecisionsBySection(state: GameState): Record<DecisionInboxSection, EnrichedDecision[]> {
  const grouped: Record<DecisionInboxSection, EnrichedDecision[]> = {
    CRITICAL: [],
    HIGH: [],
    NORMAL: [],
    LOW: []
  };

  const pending = state.pendingDecisions || [];
  for (const dec of pending) {
    const enriched = enrichDecision(dec, state);
    grouped[enriched.section].push(enriched);
  }

  return grouped;
}

/**
 * Postpones a decision by adding additional months to its expiration
 */
export function postponeDecision(
  state: GameState, 
  decisionId: string, 
  monthsToAdd: number = 1
): { nextState: GameState; success: boolean; message: string } {
  const decision = (state.pendingDecisions || []).find(d => d.id === decisionId);
  if (!decision) {
    return { nextState: state, success: false, message: 'Decision not found in inbox.' };
  }

  if (!canPostponeDecision(decision, state)) {
    return { 
      nextState: state, 
      success: false, 
      message: 'This critical situation requires immediate action and cannot be postponed.' 
    };
  }

  const updatedDecisions = state.pendingDecisions.map(d => {
    if (d.id === decisionId) {
      const currentExpTick = d.expiresAtTick ?? (state.simulationTick + (d.expiresInMonths ?? 2));
      const newExpTick = currentExpTick + monthsToAdd;
      const postponeCount = (d.postponeCount || 0) + 1;
      
      return {
        ...d,
        expiresAtTick: newExpTick,
        expiresInMonths: (d.expiresInMonths ?? 2) + monthsToAdd,
        postponeCount,
        // If postponed 2 times, disable further postponement
        canBePostponed: postponeCount < 2
      };
    }
    return d;
  });

  // Log a minor postponement note in events feed
  const postponeEvent = {
    id: `ev_postpone_${Date.now()}`,
    timestampMonth: state.currentMonth,
    timestampYear: state.currentYear,
    age: state.character.age,
    category: decision.category as any || 'Business',
    title: `Postponed Review: ${decision.title}`,
    description: `Executive review window postponed by +${monthsToAdd} month(s). Strategy briefing deferred.`,
    consequences: {
      stressChange: +1
    }
  };

  const nextState: GameState = {
    ...state,
    pendingDecisions: updatedDecisions,
    character: {
      ...state.character,
      attributes: {
        ...state.character.attributes,
        stress: Math.min(100, state.character.attributes.stress + 1)
      }
    },
    eventsFeed: [postponeEvent, ...state.eventsFeed].slice(0, 150)
  };

  return { 
    nextState, 
    success: true, 
    message: `Decision successfully postponed by ${monthsToAdd} month(s).` 
  };
}
