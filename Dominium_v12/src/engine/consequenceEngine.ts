import { 
  GameState, 
  Consequence, 
  ConsequenceResult, 
  ConsequenceOperation, 
  ConsequenceTargetCategory,
  CharacterAttributes,
  Company,
  RealEstateProperty,
  StockAsset,
  SportsTeam,
  RelationshipPerson,
  MajorProject,
  Loan,
  ConditionOperator,
  ConditionLogic,
  StateCondition,
  ConditionGroup,
  ConditionalConsequence,
  PendingDecision,
  LifeEvent,
  DelayedConsequence,
  PowerTier
} from '../types';
import { recordConsequenceHistory } from './historyEngine';
import { POWER_TIER_RANKS } from './powerTierEngine';

/**
 * Reads the actual value from the REAL game state for condition evaluation.
 */
export function extractStateValue(gameState: GameState, condition: StateCondition): any {
  const normalizedProp = (condition.property || '').toLowerCase();

  switch (condition.target) {
    case 'FINANCE': {
      if (normalizedProp.includes('cash') || normalizedProp === 'funds') {
        return gameState.finances.cash;
      }
      if (normalizedProp.includes('debt') || normalizedProp.includes('loan') || normalizedProp.includes('liabilit')) {
        if (condition.targetId) {
          const loan = gameState.finances.loans.find(l => l.id === condition.targetId);
          return loan ? loan.remainingBalance : 0;
        }
        return gameState.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0);
      }
      if (normalizedProp.includes('expense')) {
        return gameState.finances.monthlyBaseExpenses;
      }
      if (normalizedProp.includes('networth') || normalizedProp.includes('worth')) {
        const totalCash = gameState.finances.cash;
        const totalStocks = gameState.finances.stocks.reduce((acc, s) => acc + s.sharesOwned * s.currentPrice, 0);
        const totalProps = gameState.finances.properties.reduce((acc, p) => acc + p.currentValue, 0);
        const totalCompanyVal = gameState.companies.reduce((acc, c) => acc + (c.valuation * (c.playerOwnershipPercentage / 100)), 0);
        const totalSportsVal = gameState.sports.ownedTeams.reduce((acc, t) => acc + t.valuation, 0);
        const totalDebt = gameState.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0);
        return (totalCash + totalStocks + totalProps + totalCompanyVal + totalSportsVal) - totalDebt;
      }
      return gameState.finances.cash;
    }

    case 'COMPANY': {
      let comp: Company | undefined;
      if (condition.targetId) {
        comp = gameState.companies.find(c => c.id === condition.targetId || c.name.toLowerCase() === condition.targetId?.toLowerCase());
      }
      if (!comp && gameState.companies.length > 0) {
        comp = gameState.companies[0];
      }
      if (!comp) return null;

      if (normalizedProp.includes('revenue') || normalizedProp === 'sales') return comp.monthlyRevenue;
      if (normalizedProp.includes('expense') || normalizedProp === 'cost') return comp.monthlyExpenses;
      if (normalizedProp.includes('profit') || normalizedProp === 'netincome') return comp.monthlyNetProfit;
      if (normalizedProp.includes('ownership') || normalizedProp === 'equity') return comp.playerOwnershipPercentage;
      if (normalizedProp.includes('employee') || normalizedProp === 'headcount') return comp.employeesCount;
      if (normalizedProp.includes('valuation') || normalizedProp === 'marketcap') return comp.valuation;
      if (normalizedProp.includes('morale')) return comp.employeeMorale;
      if (normalizedProp.includes('product') || normalizedProp.includes('quality')) return comp.productQuality;
      if (normalizedProp.includes('brand') || normalizedProp.includes('reputation')) return comp.brandReputation;
      if (normalizedProp.includes('reserve') || normalizedProp === 'cash') return comp.cashReserve;
      if (normalizedProp.includes('marketshare')) return comp.marketShare;
      if (normalizedProp.includes('ispublic') || normalizedProp === 'public') return comp.isPublic;
      return comp;
    }

    case 'POWER': {
      const profile = gameState.playerPowerProfile;
      if (!profile) return null;
      if (normalizedProp.includes('score') || normalizedProp === 'powerscore') return profile.powerScore;
      if (normalizedProp.includes('tier') || normalizedProp === 'powertier') return profile.powerTier;
      if (normalizedProp.includes('rank') || normalizedProp === 'tierrank') return profile.tierRank;
      if (normalizedProp.includes('visibility')) return profile.visibility;
      if (normalizedProp.includes('media')) return profile.mediaAttention;
      if (normalizedProp.includes('political') || normalizedProp === 'politicalinfluence') return profile.politicalInfluence;
      if (normalizedProp.includes('business') || normalizedProp === 'businessinfluence') return profile.businessInfluence;
      if (normalizedProp.includes('public') || normalizedProp === 'publicinfluence') return profile.publicInfluence;
      if (normalizedProp.includes('scrutiny')) return profile.scrutiny;
      if (normalizedProp.includes('regulatory') || normalizedProp === 'regulatoryattention') return profile.regulatoryAttention;
      return profile;
    }

    case 'PLAYER':
    case 'HEALTH':
    case 'REPUTATION': {
      const attrs = gameState.character.attributes;
      const profile = gameState.playerPowerProfile;
      if (normalizedProp.includes('powertier') || (normalizedProp === 'tier' && profile)) return profile?.powerTier;
      if (normalizedProp.includes('powerscore') || (normalizedProp === 'power' && profile)) return profile?.powerScore;
      if (normalizedProp.includes('visibility') && profile) return profile.visibility;
      if (normalizedProp.includes('scrutiny') && profile) return profile.scrutiny;
      if (normalizedProp.includes('regulatory') && profile) return profile.regulatoryAttention;
      if (normalizedProp.includes('politicalinfluence') && profile) return profile.politicalInfluence;
      if (normalizedProp.includes('businessinfluence') && profile) return profile.businessInfluence;
      if (normalizedProp.includes('publicinfluence') && profile) return profile.publicInfluence;
      if (normalizedProp.includes('health')) return attrs.health;
      if (normalizedProp.includes('stress')) return attrs.stress;
      if (normalizedProp.includes('happiness')) return attrs.happiness;
      if (normalizedProp.includes('intelligence') || normalizedProp === 'intellect') return attrs.intelligence;
      if (normalizedProp.includes('charm')) return attrs.charm;
      if (normalizedProp.includes('attractiveness')) return attrs.attractiveness;
      if (normalizedProp.includes('reputation') || normalizedProp === 'standing') return attrs.reputation;
      if (normalizedProp.includes('influence') || normalizedProp === 'worldinfluence') return attrs.worldInfluence;
      if (normalizedProp.includes('credit') || normalizedProp === 'creditscore') return gameState.character.creditScore;
      if (normalizedProp.includes('age')) return gameState.character.age;
      if (normalizedProp.includes('social') || normalizedProp.includes('follower')) return gameState.character.socialFollowers;
      if (normalizedProp.includes('networth')) {
        const totalCash = gameState.finances.cash;
        const totalStocks = gameState.finances.stocks.reduce((acc, s) => acc + s.sharesOwned * s.currentPrice, 0);
        const totalProps = gameState.finances.properties.reduce((acc, p) => acc + p.currentValue, 0);
        const totalCompanyVal = gameState.companies.reduce((acc, c) => acc + (c.valuation * (c.playerOwnershipPercentage / 100)), 0);
        const totalSportsVal = gameState.sports.ownedTeams.reduce((acc, t) => acc + t.valuation, 0);
        const totalDebt = gameState.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0);
        return (totalCash + totalStocks + totalProps + totalCompanyVal + totalSportsVal) - totalDebt;
      }
      return null;
    }

    case 'INVESTMENT': {
      if (normalizedProp.includes('count') || normalizedProp === 'total') return gameState.finances.stocks.length;
      let stock: StockAsset | undefined;
      if (condition.targetId) {
        stock = gameState.finances.stocks.find(s => s.symbol.toUpperCase() === condition.targetId?.toUpperCase());
      }
      if (!stock && gameState.finances.stocks.length > 0) {
        stock = gameState.finances.stocks[0];
      }
      if (!stock) return null;
      if (normalizedProp.includes('shares') || normalizedProp === 'owned') return stock.sharesOwned;
      if (normalizedProp.includes('price')) return stock.currentPrice;
      if (normalizedProp.includes('value')) return stock.sharesOwned * stock.currentPrice;
      if (normalizedProp.includes('dividend')) return stock.dividendYieldAnnual;
      return stock;
    }

    case 'PROPERTY': {
      if (normalizedProp.includes('count') || normalizedProp === 'total') return gameState.finances.properties.length;
      let prop: RealEstateProperty | undefined;
      if (condition.targetId) {
        prop = gameState.finances.properties.find(p => p.id === condition.targetId);
      }
      if (!prop && gameState.finances.properties.length > 0) {
        prop = gameState.finances.properties[0];
      }
      if (!prop) return null;
      if (normalizedProp.includes('value') || normalizedProp === 'price') return prop.currentValue;
      if (normalizedProp.includes('rent') || normalizedProp === 'income') return prop.monthlyRent;
      if (normalizedProp.includes('condition')) return prop.condition;
      if (normalizedProp.includes('tenant')) return prop.tenantQuality;
      return prop;
    }

    case 'PROJECT': {
      if (normalizedProp.includes('count') || normalizedProp === 'total') return gameState.projects.length;
      let proj: MajorProject | undefined;
      if (condition.targetId) {
        proj = gameState.projects.find(p => p.id === condition.targetId);
      }
      if (!proj && gameState.projects.length > 0) {
        proj = gameState.projects[0];
      }
      if (!proj) return null;
      if (normalizedProp.includes('progress')) return proj.monthsProgress;
      if (normalizedProp.includes('completed')) return proj.completed;
      if (normalizedProp.includes('invested') || normalizedProp.includes('capital')) return proj.capitalInvested;
      return proj;
    }

    case 'POLITICS': {
      if (normalizedProp.includes('capital')) return gameState.politics.currentOffice.politicalCapital;
      if (normalizedProp.includes('approval')) return gameState.politics.currentOffice.approvalRating;
      if (normalizedProp.includes('office') || normalizedProp === 'title') return gameState.politics.currentOffice.title;
      if (normalizedProp.includes('party')) {
        const party = gameState.politics.parties.find(p => p.id === gameState.politics.selectedPartyId);
        return party ? party.playerReputationInParty : 0;
      }
      return null;
    }

    case 'FAMILY':
    case 'RELATIONSHIP': {
      if (normalizedProp.includes('count') || normalizedProp === 'total') return gameState.relationships.length;
      let person: RelationshipPerson | undefined;
      if (condition.targetId) {
        person = gameState.relationships.find(r => r.id === condition.targetId || r.name.toLowerCase() === condition.targetId?.toLowerCase() || r.relation.toLowerCase() === condition.targetId?.toLowerCase());
      }
      if (!person && gameState.relationships.length > 0) {
        person = gameState.relationships[0];
      }
      if (!person) return null;
      if (normalizedProp.includes('trust')) return person.trust;
      if (normalizedProp.includes('loyalty')) return person.loyalty;
      if (normalizedProp.includes('respect')) return person.respect;
      if (normalizedProp.includes('love') || normalizedProp === 'affection') return person.love;
      if (normalizedProp.includes('relation') || normalizedProp === 'role') return person.relation;
      if (normalizedProp.includes('wealth')) return person.wealth;
      return person;
    }

    case 'SPORTS': {
      if (normalizedProp.includes('count') || normalizedProp === 'teams') return gameState.sports.ownedTeams.length;
      let team: SportsTeam | undefined;
      if (condition.targetId) {
        team = gameState.sports.ownedTeams.find(t => t.id === condition.targetId);
      }
      if (!team && gameState.sports.ownedTeams.length > 0) {
        team = gameState.sports.ownedTeams[0];
      }
      if (!team) return null;
      if (normalizedProp.includes('performance') || normalizedProp === 'rating') return team.teamPerformanceScore;
      if (normalizedProp.includes('valuation')) return team.valuation;
      if (normalizedProp.includes('fan')) return team.fanBaseThousands;
      return team;
    }

    case 'DYNASTY': {
      if (normalizedProp.includes('generation') || normalizedProp === 'gen') return gameState.dynastyGeneration;
      if (normalizedProp.includes('heir')) return gameState.dynastyHeirId;
      return gameState.dynastyGeneration;
    }

    case 'WORLD': {
      const country = gameState.world[gameState.currentCountryIndex] || gameState.world[0];
      if (!country) return null;
      if (normalizedProp.includes('inflation')) return country.inflationRate;
      if (normalizedProp.includes('gdp') || normalizedProp.includes('growth')) return country.gdpGrowthRate;
      if (normalizedProp.includes('interest') || normalizedProp.includes('rate')) return country.centralBankInterestRate;
      if (normalizedProp.includes('stability')) return country.politicalStability;
      return country;
    }

    default:
      return null;
  }
}

/**
 * Evaluates a single StateCondition against the actual GameState.
 */
export function evaluateCondition(gameState: GameState, condition: StateCondition): boolean {
  const actualValue = extractStateValue(gameState, condition);
  const targetValue = condition.value;

  if (actualValue === null || actualValue === undefined) {
    if (condition.operator === 'hasEntity') return false;
    if (condition.operator === 'notEquals') return targetValue !== null;
    return false;
  }

  switch (condition.operator) {
    case 'equals':
      return actualValue === targetValue;

    case 'notEquals':
      return actualValue !== targetValue;

    case 'greaterThan':
      if (condition.property?.toLowerCase().includes('tier') && typeof actualValue === 'string' && typeof targetValue === 'string') {
        const actualRank = POWER_TIER_RANKS[actualValue as PowerTier] ?? -1;
        const targetRank = POWER_TIER_RANKS[targetValue as PowerTier] ?? -1;
        if (actualRank !== -1 && targetRank !== -1) return actualRank > targetRank;
      }
      return Number(actualValue) > Number(targetValue);

    case 'greaterThanOrEqual':
      if (condition.property?.toLowerCase().includes('tier') && typeof actualValue === 'string' && typeof targetValue === 'string') {
        const actualRank = POWER_TIER_RANKS[actualValue as PowerTier] ?? -1;
        const targetRank = POWER_TIER_RANKS[targetValue as PowerTier] ?? -1;
        if (actualRank !== -1 && targetRank !== -1) return actualRank >= targetRank;
      }
      return Number(actualValue) >= Number(targetValue);

    case 'lessThan':
      if (condition.property?.toLowerCase().includes('tier') && typeof actualValue === 'string' && typeof targetValue === 'string') {
        const actualRank = POWER_TIER_RANKS[actualValue as PowerTier] ?? -1;
        const targetRank = POWER_TIER_RANKS[targetValue as PowerTier] ?? -1;
        if (actualRank !== -1 && targetRank !== -1) return actualRank < targetRank;
      }
      return Number(actualValue) < Number(targetValue);

    case 'lessThanOrEqual':
      if (condition.property?.toLowerCase().includes('tier') && typeof actualValue === 'string' && typeof targetValue === 'string') {
        const actualRank = POWER_TIER_RANKS[actualValue as PowerTier] ?? -1;
        const targetRank = POWER_TIER_RANKS[targetValue as PowerTier] ?? -1;
        if (actualRank !== -1 && targetRank !== -1) return actualRank <= targetRank;
      }
      return Number(actualValue) <= Number(targetValue);

    case 'contains':
      if (typeof actualValue === 'string' && typeof targetValue === 'string') {
        return actualValue.toLowerCase().includes(targetValue.toLowerCase());
      }
      if (Array.isArray(actualValue)) {
        return actualValue.includes(targetValue);
      }
      return false;

    case 'hasEntity':
      return actualValue !== null && actualValue !== undefined;

    case 'percentageChange':
      // Evaluates whether numeric actualValue exceeds or equals targeted percentage threshold
      return Number(actualValue) >= Number(targetValue);

    case 'relationshipValue':
      return Number(actualValue) >= Number(targetValue);

    default:
      return false;
  }
}

/**
 * Evaluates a ConditionGroup or StateCondition with AND / OR boolean logic against real game state.
 */
export function evaluateConditionLogic(gameState: GameState, condition: StateCondition | ConditionGroup): boolean {
  if ('conditions' in condition) {
    const group = condition as ConditionGroup;
    if (!group.conditions || group.conditions.length === 0) return true;

    if (group.logic === 'AND') {
      return group.conditions.every(c => evaluateCondition(gameState, c));
    } else if (group.logic === 'OR') {
      return group.conditions.some(c => evaluateCondition(gameState, c));
    }
    return true;
  }

  return evaluateCondition(gameState, condition as StateCondition);
}

/**
 * Evaluates and applies a ConditionalConsequence if conditions are met against real game state.
 */
export function evaluateConditionalConsequence(
  gameState: GameState,
  conditional: ConditionalConsequence,
  recordToHistory: boolean = true
): {
  nextState: GameState;
  conditionMet: boolean;
  results: ConsequenceResult[];
  unlockedDecisions: PendingDecision[];
  unlockedEvents: LifeEvent[];
} {
  const isConditionMet = evaluateConditionLogic(gameState, conditional.condition);
  let nextState = gameState;
  const results: ConsequenceResult[] = [];
  const unlockedDecisions: PendingDecision[] = [];
  const unlockedEvents: LifeEvent[] = [];

  if (isConditionMet) {
    if (conditional.consequences && conditional.consequences.length > 0) {
      const consequencesToApply = conditional.consequences.map(c => ({
        ...c,
        source: conditional.name || conditional.source || c.source || 'Conditional Trigger'
      }));
      const { nextState: updatedState, results: batchResults } = applyConsequences(nextState, consequencesToApply, recordToHistory);
      nextState = updatedState;
      results.push(...batchResults);
    }

    if (conditional.unlocksDecisions && conditional.unlocksDecisions.length > 0) {
      unlockedDecisions.push(...conditional.unlocksDecisions);
    }

    if (conditional.unlocksEvents && conditional.unlocksEvents.length > 0) {
      unlockedEvents.push(...conditional.unlocksEvents);
    }
  } else if (conditional.elseConsequences && conditional.elseConsequences.length > 0) {
    const elseConsequencesToApply = conditional.elseConsequences.map(c => ({
      ...c,
      source: `${conditional.name || 'Conditional Trigger'} (Else)`
    }));
    const { nextState: updatedState, results: elseResults } = applyConsequences(nextState, elseConsequencesToApply, recordToHistory);
    nextState = updatedState;
    results.push(...elseResults);
  }

  return {
    nextState,
    conditionMet: isConditionMet,
    results,
    unlockedDecisions,
    unlockedEvents
  };
}

/**
 * Normalizes any untyped legacy event consequence impacts (e.g. cashChange, healthChange)
 * into strictly typed, verifiable Consequence objects for execution via ConsequenceEngine.
 */
export function normalizeEventConsequencesToTyped(event: LifeEvent | any): Consequence[] {
  const consequences: Consequence[] = [];
  const csq = event.consequences;
  if (!csq) return consequences;

  const eventSource = event.title || event.source || 'Simulation Event';
  const eventId = event.id;

  if (typeof csq.cashChange === 'number' && csq.cashChange !== 0) {
    consequences.push(
      ConsequenceEngine.cash(
        csq.cashChange > 0 ? 'ADD' : 'SUBTRACT',
        Math.abs(csq.cashChange),
        { source: eventSource, eventId, description: `${eventSource}: Cash ${csq.cashChange > 0 ? '+' : '-'}$${Math.abs(csq.cashChange).toLocaleString()}` }
      )
    );
  }

  if (typeof csq.healthChange === 'number' && csq.healthChange !== 0) {
    consequences.push(
      ConsequenceEngine.playerAttribute(
        'health',
        csq.healthChange > 0 ? 'ADD' : 'SUBTRACT',
        Math.abs(csq.healthChange),
        { source: eventSource, eventId, description: `${eventSource}: Health ${csq.healthChange > 0 ? '+' : '-'}${Math.abs(csq.healthChange)}` }
      )
    );
  }

  if (typeof csq.happinessChange === 'number' && csq.happinessChange !== 0) {
    consequences.push(
      ConsequenceEngine.playerAttribute(
        'happiness',
        csq.happinessChange > 0 ? 'ADD' : 'SUBTRACT',
        Math.abs(csq.happinessChange),
        { source: eventSource, eventId, description: `${eventSource}: Happiness ${csq.happinessChange > 0 ? '+' : '-'}${Math.abs(csq.happinessChange)}` }
      )
    );
  }

  if (typeof csq.stressChange === 'number' && csq.stressChange !== 0) {
    consequences.push(
      ConsequenceEngine.playerAttribute(
        'stress',
        csq.stressChange > 0 ? 'ADD' : 'SUBTRACT',
        Math.abs(csq.stressChange),
        { source: eventSource, eventId, description: `${eventSource}: Stress ${csq.stressChange > 0 ? '+' : '-'}${Math.abs(csq.stressChange)}` }
      )
    );
  }

  if (typeof csq.reputationChange === 'number' && csq.reputationChange !== 0) {
    consequences.push(
      ConsequenceEngine.reputation(
        csq.reputationChange > 0 ? 'ADD' : 'SUBTRACT',
        Math.abs(csq.reputationChange),
        { source: eventSource, eventId, description: `${eventSource}: Reputation ${csq.reputationChange > 0 ? '+' : '-'}${Math.abs(csq.reputationChange)}` }
      )
    );
  }

  if (typeof csq.worldInfluenceChange === 'number' && csq.worldInfluenceChange !== 0) {
    consequences.push(
      ConsequenceEngine.playerAttribute(
        'worldInfluence',
        csq.worldInfluenceChange > 0 ? 'ADD' : 'SUBTRACT',
        Math.abs(csq.worldInfluenceChange),
        { source: eventSource, eventId, description: `${eventSource}: World Influence ${csq.worldInfluenceChange > 0 ? '+' : '-'}${Math.abs(csq.worldInfluenceChange)}` }
      )
    );
  }

  return consequences;
}

/**
 * Calculates numeric output according to ConsequenceOperation.
 */
export function calculateOperationValue(
  previousValue: number, 
  operation: ConsequenceOperation, 
  value: number
): number {
  switch (operation) {
    case 'SET':
      return value;
    case 'ADD':
      return previousValue + value;
    case 'SUBTRACT':
      return previousValue - value;
    case 'MULTIPLY':
      return previousValue * value;
    case 'PERCENTAGE_CHANGE': {
      // Handles +15 for +15%, or -5 for -5%
      const factor = 1 + (value / 100);
      return previousValue * factor;
    }
    default:
      return previousValue;
  }
}

/**
 * Formats a clean representation of the change for history & UI audits.
 */
function formatValueChange(
  previousValue: any, 
  newValue: any, 
  field: string
): string {
  if (typeof previousValue === 'number' && typeof newValue === 'number') {
    const diff = newValue - previousValue;
    const isCurrency = field.toLowerCase().includes('cash') || 
                       field.toLowerCase().includes('debt') || 
                       field.toLowerCase().includes('revenue') || 
                       field.toLowerCase().includes('valuation') || 
                       field.toLowerCase().includes('salary') || 
                       field.toLowerCase().includes('rent') ||
                       field.toLowerCase().includes('price') ||
                       field.toLowerCase().includes('budget') ||
                       field.toLowerCase().includes('reserve');

    if (isCurrency) {
      return `${diff >= 0 ? '+' : '-'}$${Math.abs(Math.round(diff)).toLocaleString()}`;
    }

    const isPercentage = field.toLowerCase().includes('percentage') || 
                         field.toLowerCase().includes('rate') || 
                         field.toLowerCase().includes('margin') ||
                         field.toLowerCase().includes('share');

    if (isPercentage) {
      return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
    }

    return `${diff >= 0 ? '+' : ''}${Math.round(diff)}`;
  }
  return `${String(previousValue)} → ${String(newValue)}`;
}

/**
 * Core engine to apply an individual consequence against REAL game state.
 * Mutates clone immutably and logs historical impact.
 */
export function applyConsequence(
  gameState: GameState,
  consequence: Consequence,
  recordToHistory: boolean = true
): { nextState: GameState; result: ConsequenceResult } {
  const consequenceId = consequence.id || `csq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const warnings: string[] = [];
  const followUpTriggers: string[] = [];

  // Deep clone top-level state
  let nextState: GameState = JSON.parse(JSON.stringify(gameState));

  let previousValue: any = null;
  let newValue: any = null;
  let field = consequence.type;
  let affectedEntityName: string = consequence.target;
  let success = false;
  let description = consequence.description || '';

  const normalizedType = (consequence.property || consequence.type || '').toLowerCase();

  switch (consequence.target) {
    case 'FINANCE': {
      if (normalizedType.includes('cash') || normalizedType === 'funds' || normalizedType === 'capital') {
        field = 'cash';
        previousValue = nextState.finances.cash;
        newValue = calculateOperationValue(previousValue, consequence.operation, Number(consequence.value));
        nextState.finances.cash = Math.round(newValue);
        affectedEntityName = 'Personal Liquid Cash';
        success = true;

        if (nextState.finances.cash < 0) {
          warnings.push(`Liquid cash deficit: Account is overdrawn by $${Math.abs(nextState.finances.cash).toLocaleString()}`);
          followUpTriggers.push('PERSONAL_INSOLVENCY_ALERT');
        }
      } else if (normalizedType.includes('debt') || normalizedType.includes('loan') || normalizedType.includes('liability')) {
        field = 'debt';
        if (consequence.targetId) {
          const loan = nextState.finances.loans.find(l => l.id === consequence.targetId);
          if (loan) {
            previousValue = loan.remainingBalance;
            newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
            loan.remainingBalance = Math.round(newValue);
            affectedEntityName = loan.title;
            success = true;
          }
        } else {
          // Global debt adjustment
          const totalDebt = nextState.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0);
          previousValue = totalDebt;
          const delta = Number(consequence.value);

          if (consequence.operation === 'ADD') {
            const apr = 5.5;
            const term = 120; // 10 years default
            const pmt = Math.round((delta * (1 + (apr / 100))) / term);
            const newLoan: Loan = {
              id: `loan-${Date.now()}`,
              title: consequence.description || 'Commercial Credit Syndicate Facility',
              principal: delta,
              remainingBalance: delta,
              monthlyPayment: pmt,
              interestRateAnnual: apr,
              termMonthsRemaining: term
            };
            nextState.finances.loans.push(newLoan);
            newValue = totalDebt + delta;
            affectedEntityName = 'Commercial Debt Obligations';
            success = true;
            followUpTriggers.push('DEBT_SERVICE_INCREASED');
          } else if (consequence.operation === 'SUBTRACT') {
            let remainingToSubtract = delta;
            for (const l of nextState.finances.loans) {
              if (remainingToSubtract <= 0) break;
              if (l.remainingBalance <= remainingToSubtract) {
                remainingToSubtract -= l.remainingBalance;
                l.remainingBalance = 0;
              } else {
                l.remainingBalance -= remainingToSubtract;
                remainingToSubtract = 0;
              }
            }
            nextState.finances.loans = nextState.finances.loans.filter(l => l.remainingBalance > 0);
            newValue = nextState.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0);
            affectedEntityName = 'Personal Debt Portfolio';
            success = true;
          } else {
            newValue = calculateOperationValue(previousValue, consequence.operation, delta);
            affectedEntityName = 'Total Liabilities';
            success = true;
          }
        }
      } else if (normalizedType.includes('expense')) {
        field = 'monthlyBaseExpenses';
        previousValue = nextState.finances.monthlyBaseExpenses;
        newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
        nextState.finances.monthlyBaseExpenses = Math.round(newValue);
        affectedEntityName = 'Living Expenses';
        success = true;
      }
      break;
    }

    case 'COMPANY': {
      // Find company
      let comp: Company | undefined;
      if (consequence.targetId) {
        comp = nextState.companies.find(c => c.id === consequence.targetId);
      }
      if (!comp && nextState.companies.length > 0) {
        comp = nextState.companies[0];
      }

      if (comp) {
        affectedEntityName = comp.name;

        if (normalizedType.includes('revenue') || normalizedType === 'sales') {
          field = 'monthlyRevenue';
          previousValue = comp.monthlyRevenue;
          newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          comp.monthlyRevenue = Math.round(newValue);
          comp.monthlyNetProfit = comp.monthlyRevenue - comp.monthlyExpenses;
          
          // Re-estimate valuation if revenue changed significantly
          const annualRev = comp.monthlyRevenue * 12;
          comp.valuation = Math.max(100000, Math.round(annualRev * 4 + comp.cashReserve));
          if (comp.totalShares > 0) {
            comp.sharePrice = +(comp.valuation / comp.totalShares).toFixed(2);
          }
          success = true;

          if (comp.monthlyNetProfit < 0) {
            warnings.push(`${comp.name} is operating at a monthly cash deficit of -$${Math.abs(comp.monthlyNetProfit).toLocaleString()}/mo.`);
            followUpTriggers.push('COMPANY_BURN_WARNING');
          }
        } else if (normalizedType.includes('expense') || normalizedType === 'cost') {
          field = 'monthlyExpenses';
          previousValue = comp.monthlyExpenses;
          newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          comp.monthlyExpenses = Math.round(newValue);
          comp.monthlyNetProfit = comp.monthlyRevenue - comp.monthlyExpenses;
          success = true;
        } else if (normalizedType.includes('ownership') || normalizedType === 'equity') {
          field = 'playerOwnershipPercentage';
          previousValue = comp.playerOwnershipPercentage;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          comp.playerOwnershipPercentage = Math.round(newValue);
          success = true;

          if (comp.playerOwnershipPercentage < 50 && previousValue >= 50) {
            warnings.push(`Loss of Majority Control: Player stake in ${comp.name} fell to ${comp.playerOwnershipPercentage}%.`);
            followUpTriggers.push('LOSS_OF_MAJORITY_CONTROL');
          } else if (comp.playerOwnershipPercentage === 100) {
            followUpTriggers.push('SOLE_OWNER_CONSOLIDATED');
          }
        } else if (normalizedType.includes('employee') || normalizedType === 'headcount' || normalizedType === 'staff') {
          field = 'employeesCount';
          previousValue = comp.employeesCount;
          newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          comp.employeesCount = Math.round(newValue);
          success = true;
        } else if (normalizedType.includes('valuation') || normalizedType === 'marketcap') {
          field = 'valuation';
          previousValue = comp.valuation;
          newValue = Math.max(50000, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          comp.valuation = Math.round(newValue);
          if (comp.totalShares > 0) {
            comp.sharePrice = +(comp.valuation / comp.totalShares).toFixed(2);
          }
          success = true;
        } else if (normalizedType.includes('morale')) {
          field = 'employeeMorale';
          previousValue = comp.employeeMorale;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          comp.employeeMorale = Math.round(newValue);
          success = true;

          if (comp.employeeMorale < 25) {
            warnings.push(`Critical morale in ${comp.name}: Risk of talent exodus and walkout.`);
            followUpTriggers.push('LABOR_STRIKE_RISK');
          }
        } else if (normalizedType.includes('product') || normalizedType.includes('quality')) {
          field = 'productQuality';
          previousValue = comp.productQuality;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          comp.productQuality = Math.round(newValue);
          success = true;
        } else if (normalizedType.includes('brand') || normalizedType.includes('reputation')) {
          field = 'brandReputation';
          previousValue = comp.brandReputation;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          comp.brandReputation = Math.round(newValue);
          success = true;
        } else if (normalizedType.includes('reserve') || normalizedType === 'cash') {
          field = 'cashReserve';
          previousValue = comp.cashReserve;
          newValue = calculateOperationValue(previousValue, consequence.operation, Number(consequence.value));
          comp.cashReserve = Math.round(newValue);
          success = true;

          if (comp.cashReserve < 0) {
            warnings.push(`${comp.name} treasury depleted! Emergency capital call required.`);
            followUpTriggers.push('CORPORATE_LIQUIDITY_CRISIS');
          }
        } else if (normalizedType.includes('marketshare')) {
          field = 'marketShare';
          previousValue = comp.marketShare;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          comp.marketShare = Math.round(newValue);
          success = true;
        }
      } else {
        warnings.push(`Company target ${consequence.targetId || ''} not found in enterprise portfolio.`);
      }
      break;
    }

    case 'PLAYER':
    case 'HEALTH':
    case 'REPUTATION': {
      const attrs = nextState.character.attributes;
      affectedEntityName = `${nextState.character.firstName} ${nextState.character.lastName}`;

      if (normalizedType.includes('health')) {
        field = 'health';
        previousValue = attrs.health;
        newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
        attrs.health = Math.round(newValue);
        success = true;

        if (attrs.health < 25) {
          warnings.push('Severe Health Emergency: Health score dropped below critical threshold (25%).');
          followUpTriggers.push('CRITICAL_HEALTH_HOSPITALIZATION');
        }
      } else if (normalizedType.includes('stress')) {
        field = 'stress';
        previousValue = attrs.stress;
        newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
        attrs.stress = Math.round(newValue);
        success = true;

        if (attrs.stress > 85) {
          warnings.push('Acute Stress Collapse: Physical & mental burnout risk.');
          followUpTriggers.push('BURNOUT_CRISIS');
        }
      } else if (normalizedType.includes('happiness')) {
        field = 'happiness';
        previousValue = attrs.happiness;
        newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
        attrs.happiness = Math.round(newValue);
        success = true;
      } else if (normalizedType.includes('intelligence') || normalizedType === 'intellect') {
        field = 'intelligence';
        previousValue = attrs.intelligence;
        newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
        attrs.intelligence = Math.round(newValue);
        success = true;
      } else if (normalizedType.includes('charm')) {
        field = 'charm';
        previousValue = attrs.charm;
        newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
        attrs.charm = Math.round(newValue);
        success = true;
      } else if (normalizedType.includes('attractiveness')) {
        field = 'attractiveness';
        previousValue = attrs.attractiveness;
        newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
        attrs.attractiveness = Math.round(newValue);
        success = true;
      } else if (normalizedType.includes('reputation') || normalizedType === 'fame' || normalizedType === 'standing') {
        field = 'reputation';
        previousValue = attrs.reputation;
        newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
        attrs.reputation = Math.round(newValue);
        success = true;

        if (attrs.reputation < 15) {
          warnings.push('Reputation tarnished: Industry allies withdrawing support.');
          followUpTriggers.push('REPUTATIONAL_SCANDAL');
        } else if (attrs.reputation >= 90) {
          followUpTriggers.push('GLOBAL_REPUTATION_SUMMIT');
        }
      } else if (normalizedType.includes('influence') || normalizedType === 'worldinfluence') {
        field = 'worldInfluence';
        previousValue = attrs.worldInfluence;
        newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
        attrs.worldInfluence = Math.round(newValue);
        success = true;
      } else if (normalizedType.includes('credit') || normalizedType === 'creditscore') {
        field = 'creditScore';
        previousValue = nextState.character.creditScore;
        newValue = Math.min(850, Math.max(300, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
        nextState.character.creditScore = Math.round(newValue);
        success = true;
      } else if (normalizedType.includes('follower') || normalizedType === 'socialfollowers') {
        field = 'socialFollowers';
        previousValue = nextState.character.socialFollowers;
        newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
        nextState.character.socialFollowers = Math.round(newValue);
        success = true;
      }
      break;
    }

    case 'INVESTMENT': {
      let stock: StockAsset | undefined;
      if (consequence.targetId) {
        stock = nextState.finances.stocks.find(s => s.symbol.toUpperCase() === consequence.targetId?.toUpperCase());
      }
      if (!stock && nextState.finances.stocks.length > 0) {
        stock = nextState.finances.stocks[0];
      }

      if (stock) {
        affectedEntityName = `${stock.name} (${stock.symbol})`;

        if (normalizedType.includes('share') || normalizedType === 'count') {
          field = 'sharesOwned';
          previousValue = stock.sharesOwned;
          newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          stock.sharesOwned = Math.round(newValue);
          success = true;
        } else if (normalizedType.includes('price') || normalizedType === 'val') {
          field = 'currentPrice';
          previousValue = stock.currentPrice;
          newValue = Math.max(0.01, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          stock.currentPrice = +newValue.toFixed(2);
          stock.priceHistory.push(stock.currentPrice);
          if (stock.priceHistory.length > 12) stock.priceHistory.shift();
          success = true;
        } else if (normalizedType.includes('dividend')) {
          field = 'dividendYieldAnnual';
          previousValue = stock.dividendYieldAnnual;
          newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          stock.dividendYieldAnnual = +newValue.toFixed(2);
          success = true;
        }
      } else {
        warnings.push(`Securities asset '${consequence.targetId}' not found.`);
      }
      break;
    }

    case 'PROPERTY': {
      let prop: RealEstateProperty | undefined;
      if (consequence.targetId) {
        prop = nextState.finances.properties.find(p => p.id === consequence.targetId);
      }
      if (!prop && nextState.finances.properties.length > 0) {
        prop = nextState.finances.properties[0];
      }

      if (prop) {
        affectedEntityName = prop.name;

        if (normalizedType.includes('value') || normalizedType === 'price') {
          field = 'currentValue';
          previousValue = prop.currentValue;
          newValue = Math.max(10000, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          prop.currentValue = Math.round(newValue);
          success = true;
        } else if (normalizedType.includes('rent') || normalizedType === 'income') {
          field = 'monthlyRent';
          previousValue = prop.monthlyRent;
          newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          prop.monthlyRent = Math.round(newValue);
          success = true;
        } else if (normalizedType.includes('maintenance') || normalizedType === 'upkeep') {
          field = 'monthlyMaintenance';
          previousValue = prop.monthlyMaintenance;
          newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          prop.monthlyMaintenance = Math.round(newValue);
          success = true;
        } else if (normalizedType.includes('condition')) {
          field = 'condition';
          previousValue = prop.condition;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          prop.condition = Math.round(newValue);
          success = true;

          if (prop.condition < 25) {
            warnings.push(`Severe property deterioration at ${prop.name}. Renovation required.`);
            followUpTriggers.push('PROPERTY_DILAPIDATED_WARNING');
          }
        } else if (normalizedType.includes('tenant') || normalizedType === 'tenantquality') {
          field = 'tenantQuality';
          previousValue = prop.tenantQuality;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          prop.tenantQuality = Math.round(newValue);
          success = true;
        }
      } else {
        warnings.push(`Real estate property '${consequence.targetId}' not found.`);
      }
      break;
    }

    case 'PROJECT': {
      let proj: MajorProject | undefined;
      if (consequence.targetId) {
        proj = nextState.projects.find(p => p.id === consequence.targetId);
      }
      if (!proj && nextState.projects.length > 0) {
        proj = nextState.projects[0];
      }

      if (proj) {
        affectedEntityName = proj.name;

        if (normalizedType.includes('progress') || normalizedType === 'months') {
          field = 'monthsProgress';
          previousValue = proj.monthsProgress;
          newValue = Math.min(proj.durationMonths, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          proj.monthsProgress = Math.round(newValue);
          if (proj.monthsProgress >= proj.durationMonths) {
            proj.completed = true;
            proj.status = 'Completed';
            followUpTriggers.push('MAJOR_PROJECT_COMPLETED');
          }
          success = true;
        } else if (normalizedType.includes('capital') || normalizedType.includes('funding') || normalizedType.includes('invested')) {
          field = 'capitalInvested';
          previousValue = proj.capitalInvested;
          newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          proj.capitalInvested = Math.round(newValue);
          success = true;
        } else if (normalizedType.includes('status')) {
          field = 'status';
          previousValue = proj.status;
          proj.status = consequence.value;
          newValue = proj.status;
          success = true;
        }
      } else {
        warnings.push(`Megaproject target '${consequence.targetId}' not found.`);
      }
      break;
    }

    case 'POLITICS': {
      affectedEntityName = `Political Office (${nextState.politics.currentOffice.title})`;

      if (normalizedType.includes('capital') || normalizedType === 'politicalcapital') {
        field = 'politicalCapital';
        previousValue = nextState.politics.currentOffice.politicalCapital;
        newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
        nextState.politics.currentOffice.politicalCapital = Math.round(newValue);
        success = true;
      } else if (normalizedType.includes('approval') || normalizedType === 'approvalrating') {
        field = 'approvalRating';
        previousValue = nextState.politics.currentOffice.approvalRating;
        newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
        nextState.politics.currentOffice.approvalRating = Math.round(newValue);
        success = true;

        if (nextState.politics.currentOffice.approvalRating < 25) {
          warnings.push('Political Approval Crisis: Approval rating collapsed below 25%.');
          followUpTriggers.push('NO_CONFIDENCE_VOTE_THREAT');
        }
      } else if (normalizedType.includes('inoffice') || normalizedType === 'office' || normalizedType === 'title') {
        field = 'office';
        previousValue = nextState.politics.currentOffice.title;
        if (typeof consequence.value === 'string') {
          nextState.politics.currentOffice.title = consequence.value;
          nextState.politics.currentOffice.inOffice = consequence.value !== 'Citizen' && consequence.value !== 'Party Member';
          if (nextState.politics.currentOffice.inOffice && nextState.politics.currentOffice.termMonthsRemaining <= 0) {
            nextState.politics.currentOffice.termMonthsRemaining = 48;
          }
          if (consequence.value === 'President / Prime Minister') nextState.politics.currentOffice.salaryMonthly = 85000;
          else if (consequence.value === 'Cabinet Minister') nextState.politics.currentOffice.salaryMonthly = 45000;
          else if (consequence.value === 'Member of Parliament / Senator') nextState.politics.currentOffice.salaryMonthly = 24000;
          else if (consequence.value === 'Mayor') nextState.politics.currentOffice.salaryMonthly = 12000;
          else if (consequence.value === 'City Councillor') nextState.politics.currentOffice.salaryMonthly = 4500;
        } else if (typeof consequence.value === 'boolean') {
          nextState.politics.currentOffice.inOffice = consequence.value;
        }
        newValue = nextState.politics.currentOffice.title;
        affectedEntityName = `Office of the ${nextState.politics.currentOffice.title}`;
        success = true;
      } else if (normalizedType.includes('term') || normalizedType === 'termmonthsremaining') {
        field = 'termMonthsRemaining';
        previousValue = nextState.politics.currentOffice.termMonthsRemaining;
        newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
        nextState.politics.currentOffice.termMonthsRemaining = Math.round(newValue);
        success = true;
      } else if (normalizedType.includes('partyfunds') || normalizedType === 'funds') {
        field = 'partyFunds';
        const party = nextState.politics.parties.find(p => p.id === (consequence.targetId || nextState.politics.selectedPartyId)) || nextState.politics.parties[0];
        if (party) {
          previousValue = party.partyFunds;
          newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          party.partyFunds = Math.round(newValue);
          affectedEntityName = `${party.name} War Chest`;
          success = true;
        }
      } else if (normalizedType.includes('polling') || normalizedType === 'partypolling') {
        field = 'pollingPercentage';
        const party = nextState.politics.parties.find(p => p.id === (consequence.targetId || nextState.politics.selectedPartyId)) || nextState.politics.parties[0];
        if (party) {
          previousValue = party.pollingPercentage;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          party.pollingPercentage = Math.round(newValue);
          affectedEntityName = `${party.name} Polling`;
          success = true;
        }
      } else if (normalizedType.includes('party') || normalizedType === 'standing' || normalizedType === 'loyalty') {
        field = 'playerReputationInParty';
        const party = nextState.politics.parties.find(p => p.id === (consequence.targetId || nextState.politics.selectedPartyId)) || nextState.politics.parties[0];
        if (party) {
          previousValue = party.playerReputationInParty;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          party.playerReputationInParty = Math.round(newValue);
          affectedEntityName = `${party.name} Standing`;
          success = true;
        }
      }
      break;
    }

    case 'FAMILY':
    case 'RELATIONSHIP': {
      let person: RelationshipPerson | undefined;
      if (consequence.targetId) {
        person = nextState.relationships.find(r => r.id === consequence.targetId || r.name.toLowerCase() === consequence.targetId?.toLowerCase());
      }
      if (!person && nextState.relationships.length > 0) {
        person = nextState.relationships[0];
      }

      if (person) {
        affectedEntityName = `${person.name} (${person.relation})`;

        if (normalizedType.includes('trust')) {
          field = 'trust';
          previousValue = person.trust;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          person.trust = Math.round(newValue);
          success = true;
        } else if (normalizedType.includes('loyalty')) {
          field = 'loyalty';
          previousValue = person.loyalty;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          person.loyalty = Math.round(newValue);
          success = true;

          if (person.loyalty < 20) {
            warnings.push(`Disloyalty risk: ${person.name}'s loyalty is critically low.`);
            followUpTriggers.push('RELATIONSHIP_BETRAYAL_RISK');
          }
        } else if (normalizedType.includes('respect')) {
          field = 'respect';
          previousValue = person.respect;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          person.respect = Math.round(newValue);
          success = true;
        } else if (normalizedType.includes('love') || normalizedType === 'affection') {
          field = 'love';
          previousValue = person.love;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          person.love = Math.round(newValue);
          success = true;
        } else if (normalizedType.includes('influence')) {
          field = 'influence';
          previousValue = person.influence;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          person.influence = Math.round(newValue);
          success = true;
        } else if (normalizedType.includes('wealth')) {
          field = 'wealth';
          previousValue = person.wealth;
          newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          person.wealth = Math.round(newValue);
          success = true;
        }
      } else {
        warnings.push(`Relationship contact '${consequence.targetId}' not found.`);
      }
      break;
    }

    case 'CAREER': {
      if (nextState.currentJob) {
        affectedEntityName = `Job: ${nextState.currentJob.title} (${nextState.currentJob.companyName})`;

        if (normalizedType.includes('salary') || normalizedType === 'wage' || normalizedType === 'compensation') {
          field = 'monthlySalary';
          previousValue = nextState.currentJob.monthlySalary;
          newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          nextState.currentJob.monthlySalary = Math.round(newValue);
          success = true;
        } else if (normalizedType.includes('performance') || normalizedType === 'review') {
          field = 'performance';
          previousValue = nextState.currentJob.performance;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          nextState.currentJob.performance = Math.round(newValue);
          success = true;

          if (nextState.currentJob.performance < 30) {
            warnings.push('Poor workplace performance: Risk of formal dismissal / firing.');
            followUpTriggers.push('CAREER_DISMISSAL_THREAT');
          } else if (nextState.currentJob.performance >= 90) {
            followUpTriggers.push('CAREER_PROMOTION_ELIGIBLE');
          }
        } else if (normalizedType.includes('stress')) {
          field = 'stressLevel';
          previousValue = nextState.currentJob.stressLevel;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          nextState.currentJob.stressLevel = Math.round(newValue);
          success = true;
        } else if (normalizedType.includes('hours')) {
          field = 'workingHoursWeekly';
          previousValue = nextState.currentJob.workingHoursWeekly;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          nextState.currentJob.workingHoursWeekly = Math.round(newValue);
          success = true;
        }
      } else {
        warnings.push('Player does not currently hold an active employment position.');
      }
      break;
    }

    case 'SPORTS': {
      let team: SportsTeam | undefined;
      if (consequence.targetId) {
        team = nextState.sports.ownedTeams.find(t => t.id === consequence.targetId);
      }
      if (!team && nextState.sports.ownedTeams.length > 0) {
        team = nextState.sports.ownedTeams[0];
      }

      if (team) {
        affectedEntityName = team.name;

        if (normalizedType.includes('performance') || normalizedType === 'rating') {
          field = 'teamPerformanceScore';
          previousValue = team.teamPerformanceScore;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          team.teamPerformanceScore = Math.round(newValue);
          success = true;

          if (team.teamPerformanceScore >= 90) {
            followUpTriggers.push('CHAMPIONSHIP_TITLE_FAVORITE');
          }
        } else if (normalizedType.includes('valuation') || normalizedType === 'worth') {
          field = 'valuation';
          previousValue = team.valuation;
          newValue = Math.max(1000000, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          team.valuation = Math.round(newValue);
          success = true;
        } else if (normalizedType.includes('fan') || normalizedType === 'fans') {
          field = 'fanBaseThousands';
          previousValue = team.fanBaseThousands;
          newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          team.fanBaseThousands = Math.round(newValue);
          success = true;
        } else if (normalizedType.includes('sponsorship')) {
          field = 'monthlySponsorship';
          previousValue = team.monthlySponsorship;
          newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          team.monthlySponsorship = Math.round(newValue);
          team.monthlyNetIncome = team.monthlySponsorship - team.monthlyPlayerWages;
          success = true;
        }
      } else {
        warnings.push(`Sports franchise '${consequence.targetId}' not found.`);
      }
      break;
    }

    case 'DYNASTY': {
      affectedEntityName = `${nextState.character.lastName} Dynasty`;

      if (normalizedType.includes('generation') || normalizedType === 'gen') {
        field = 'dynastyGeneration';
        previousValue = nextState.dynastyGeneration;
        newValue = Math.max(1, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
        nextState.dynastyGeneration = Math.round(newValue);
        success = true;
      } else if (normalizedType.includes('heir')) {
        field = 'dynastyHeirId';
        previousValue = nextState.dynastyHeirId;
        nextState.dynastyHeirId = consequence.targetId || String(consequence.value);
        newValue = nextState.dynastyHeirId;
        success = true;
      }
      break;
    }

    case 'WORLD': {
      const country = nextState.world[nextState.currentCountryIndex] || nextState.world[0];
      if (country) {
        affectedEntityName = country.name;

        if (normalizedType.includes('inflation')) {
          field = 'inflationRate';
          previousValue = country.inflationRate;
          newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          country.inflationRate = +newValue.toFixed(2);
          success = true;
        } else if (normalizedType.includes('gdp') || normalizedType.includes('growth')) {
          field = 'gdpGrowthRate';
          previousValue = country.gdpGrowthRate;
          newValue = calculateOperationValue(previousValue, consequence.operation, Number(consequence.value));
          country.gdpGrowthRate = +newValue.toFixed(2);
          success = true;
        } else if (normalizedType.includes('interest') || normalizedType.includes('centralbank')) {
          field = 'centralBankInterestRate';
          previousValue = country.centralBankInterestRate;
          newValue = Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value)));
          country.centralBankInterestRate = +newValue.toFixed(2);
          success = true;
        } else if (normalizedType.includes('stability')) {
          field = 'politicalStability';
          previousValue = country.politicalStability;
          newValue = Math.min(100, Math.max(0, calculateOperationValue(previousValue, consequence.operation, Number(consequence.value))));
          country.politicalStability = Math.round(newValue);
          success = true;
        }
      }
      break;
    }

    default:
      warnings.push(`Unrecognized consequence target category: ${consequence.target}`);
  }

  const changeFormatted = formatValueChange(previousValue, newValue, field);
  if (!description) {
    description = `${consequence.target} ${field} updated: ${changeFormatted}`;
  }

  // Create Structured Result
  const result: ConsequenceResult = {
    consequenceId,
    success,
    target: consequence.target,
    targetId: consequence.targetId,
    field,
    previousValue,
    newValue,
    change: changeFormatted,
    description,
    warnings,
    followUpTriggers,
    recordedInHistory: false
  };

  // Record to persistent immutable consequence history
  if (recordToHistory && success) {
    const { nextState: stateWithHistory, recordedEntry } = recordConsequenceHistory(nextState, {
      source: consequence.source || consequence.target,
      category: consequence.target,
      description,
      affectedEntity: affectedEntityName,
      valueBefore: previousValue,
      valueAfter: newValue,
      change: changeFormatted,
      relatedDecisionId: consequence.decisionId,
      relatedEventId: consequence.eventId,
      delayed: (consequence.duration && consequence.duration > 0) ? true : false,
      resolved: true
    });

    nextState = stateWithHistory;
    result.recordedInHistory = true;
  }

  return { nextState, result };
}

/**
 * Applies a batch of multiple consequences sequentially against REAL game state.
 */
export function applyConsequences(
  gameState: GameState,
  consequences: Consequence[],
  recordToHistory: boolean = true
): { nextState: GameState; results: ConsequenceResult[] } {
  let currentState = gameState;
  const results: ConsequenceResult[] = [];

  for (const c of consequences) {
    const { nextState, result } = applyConsequence(currentState, c, recordToHistory);
    currentState = nextState;
    results.push(result);
  }

  return { nextState: currentState, results };
}

/**
 * Consequence Builder Helpers for declarative usage
 */
export const ConsequenceEngine = {
  apply: applyConsequence,
  applyBatch: applyConsequences,

  // Finance Builders
  cash(operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'cash',
      target: 'FINANCE',
      operation,
      value,
      ...options
    };
  },

  debt(operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'debt',
      target: 'FINANCE',
      operation,
      value,
      ...options
    };
  },

  // Company Builders
  companyRevenue(companyId: string | undefined, operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'revenue',
      target: 'COMPANY',
      targetId: companyId,
      operation,
      value,
      ...options
    };
  },

  companyExpenses(companyId: string | undefined, operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'expenses',
      target: 'COMPANY',
      targetId: companyId,
      operation,
      value,
      ...options
    };
  },

  companyReserve(companyId: string | undefined, operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'cashReserve',
      target: 'COMPANY',
      targetId: companyId,
      operation,
      value,
      ...options
    };
  },

  companyOwnership(companyId: string | undefined, operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'ownership',
      target: 'COMPANY',
      targetId: companyId,
      operation,
      value,
      ...options
    };
  },

  companyEmployees(companyId: string | undefined, operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'employees',
      target: 'COMPANY',
      targetId: companyId,
      operation,
      value,
      ...options
    };
  },

  companyValuation(companyId: string | undefined, operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'valuation',
      target: 'COMPANY',
      targetId: companyId,
      operation,
      value,
      ...options
    };
  },

  companyMorale(companyId: string | undefined, operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'morale',
      target: 'COMPANY',
      targetId: companyId,
      operation,
      value,
      ...options
    };
  },

  companyProductQuality(companyId: string | undefined, operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'productQuality',
      target: 'COMPANY',
      targetId: companyId,
      operation,
      value,
      ...options
    };
  },

  companyBrandReputation(companyId: string | undefined, operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'brandReputation',
      target: 'COMPANY',
      targetId: companyId,
      operation,
      value,
      ...options
    };
  },

  companyMarketShare(companyId: string | undefined, operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'marketShare',
      target: 'COMPANY',
      targetId: companyId,
      operation,
      value,
      ...options
    };
  },

  // Player Attribute Builders
  playerAttribute(attr: keyof CharacterAttributes, operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    const target: ConsequenceTargetCategory = (attr === 'health' || attr === 'stress') ? 'HEALTH' : (attr === 'reputation' || attr === 'worldInfluence') ? 'REPUTATION' : 'PLAYER';
    return {
      type: attr,
      target,
      operation,
      value,
      ...options
    };
  },

  stress(operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'stress',
      target: 'HEALTH',
      operation,
      value,
      ...options
    };
  },

  reputation(operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'reputation',
      target: 'REPUTATION',
      operation,
      value,
      ...options
    };
  },

  // Relationship Builder
  relationship(personId: string | undefined, metric: 'trust' | 'love' | 'respect' | 'loyalty' | 'influence', operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: metric,
      target: 'RELATIONSHIP',
      targetId: personId,
      operation,
      value,
      ...options
    };
  },

  // Property Builder
  propertyValue(propertyId: string | undefined, operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'value',
      target: 'PROPERTY',
      targetId: propertyId,
      operation,
      value,
      ...options
    };
  },

  // Politics Builders
  politicalCapital(operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'politicalCapital',
      target: 'POLITICS',
      operation,
      value,
      ...options
    };
  },

  approval(operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'approvalRating',
      target: 'POLITICS',
      operation,
      value,
      ...options
    };
  },

  politicalOffice(title: string, inOffice: boolean = true, options?: Partial<Consequence>): Consequence {
    return {
      type: 'office',
      target: 'POLITICS',
      operation: 'SET',
      value: title,
      ...options
    };
  },

  partyLoyalty(partyId: string | undefined, operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'playerReputationInParty',
      target: 'POLITICS',
      targetId: partyId,
      operation,
      value,
      ...options
    };
  },

  partyFunds(partyId: string | undefined, operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'partyFunds',
      target: 'POLITICS',
      targetId: partyId,
      operation,
      value,
      ...options
    };
  },

  partyPolling(partyId: string | undefined, operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: 'pollingPercentage',
      target: 'POLITICS',
      targetId: partyId,
      operation,
      value,
      ...options
    };
  },

  // Power & Influence Builder (Phase 10)
  power(property: string, operation: ConsequenceOperation, value: number, options?: Partial<Consequence>): Consequence {
    return {
      type: property,
      target: 'POWER',
      property,
      operation,
      value,
      ...options
    };
  },

  // Condition Helpers (Phase 5)
  condition(
    target: ConsequenceTargetCategory, 
    property: string, 
    operator: ConditionOperator, 
    value: any, 
    targetId?: string
  ): StateCondition {
    return {
      target,
      property,
      operator,
      value,
      targetId
    };
  },

  andGroup(...conditions: StateCondition[]): ConditionGroup {
    return {
      logic: 'AND',
      conditions
    };
  },

  orGroup(...conditions: StateCondition[]): ConditionGroup {
    return {
      logic: 'OR',
      conditions
    };
  },

  evaluateCondition,
  evaluateConditionLogic,
  evaluateConditional: evaluateConditionalConsequence,

  // Delayed Consequence Builders (Phase 6)
  delayed(
    delayMonths: 1 | 3 | 6 | 12 | number,
    source: string,
    description: string,
    consequences: Consequence[],
    conditions?: StateCondition | ConditionGroup,
    options?: Partial<DelayedConsequence>
  ): { delayMonths: number; source: string; description: string; consequences: Consequence[]; conditions?: StateCondition | ConditionGroup; options?: Partial<DelayedConsequence> } {
    return {
      delayMonths,
      source,
      description,
      consequences,
      conditions,
      options
    };
  }
};

