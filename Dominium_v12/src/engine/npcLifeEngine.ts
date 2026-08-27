import {
  GameState,
  LivingNpc,
  NPCSimulationTier,
  NPCPersonality,
  NPCLifeAmbition,
  NPCLifeStrategy,
  CanonicalNPCGoal,
  NPCGoalType,
  NPCOpportunity,
  NPCOpportunityType,
  NPCPlanAction,
  NPCRequestToPlayer,
  AutonomousBusiness,
  LifeEvent,
  NewsItem,
  WorldHistoryEntry,
  NpcMemoryRecord
} from '../types';

/**
 * Standard default 16-trait personality template.
 */
export const DEFAULT_NPC_PERSONALITY: NPCPersonality = {
  ambition: 60,
  intelligence: 65,
  discipline: 60,
  confidence: 60,
  sociability: 55,
  empathy: 50,
  integrity: 60,
  aggression: 40,
  loyalty: 65,
  patience: 55,
  greed: 45,
  generosity: 50,
  riskTolerance: 50,
  competitiveness: 55,
  entrepreneurialDrive: 50,
  politicalInterest: 35
};

/**
 * Deterministic pseudo-random number generator for reproducible NPC decisions.
 * Uses a linear congruential formula based on state tick, year, month, npcId and action key.
 */
export function getNpcDeterministicSeed(
  state: GameState,
  npcId: string,
  actionKey = 'action',
  extraSalt = 0
): number {
  let hash = 0x811c9dc5;
  const str = `${state.simulationTick}_${state.currentYear}_${state.currentMonth}_${npcId}_${actionKey}_${extraSalt}`;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (Math.abs(hash) % 1000000) / 1000000;
}

/**
 * Normalizes an NPC to guarantee all Expansion 4 canonical properties exist.
 */
export function normalizeCanonicalNpc(npc: Partial<LivingNpc>, seedIndex = 0): LivingNpc {
  const s = Math.abs(seedIndex) % 100;
  
  // 1. Personality
  const personality: NPCPersonality = {
    ambition: npc.personality?.ambition ?? Math.min(99, Math.max(15, (npc.traits?.ambition || 55) + ((s * 7) % 25 - 12))),
    intelligence: npc.personality?.intelligence ?? Math.min(99, Math.max(20, 60 + ((s * 11) % 31 - 15))),
    discipline: npc.personality?.discipline ?? Math.min(99, Math.max(20, (npc.traits?.discipline || 60) + ((s * 13) % 25 - 12))),
    confidence: npc.personality?.confidence ?? Math.min(99, Math.max(20, 55 + ((s * 17) % 31 - 15))),
    sociability: npc.personality?.sociability ?? Math.min(99, Math.max(15, 50 + ((s * 19) % 35 - 17))),
    empathy: npc.personality?.empathy ?? Math.min(99, Math.max(10, 55 + ((s * 23) % 35 - 17))),
    integrity: npc.personality?.integrity ?? Math.min(99, Math.max(15, 60 + ((s * 29) % 31 - 15))),
    aggression: npc.personality?.aggression ?? Math.min(99, Math.max(5, (npc.traits?.aggression || 40) + ((s * 31) % 25 - 12))),
    loyalty: npc.personality?.loyalty ?? Math.min(99, Math.max(15, (npc.traits?.loyalty || 65) + ((s * 37) % 25 - 12))),
    patience: npc.personality?.patience ?? Math.min(99, Math.max(15, 55 + ((s * 41) % 31 - 15))),
    greed: npc.personality?.greed ?? Math.min(99, Math.max(10, 50 + ((s * 43) % 35 - 17))),
    generosity: npc.personality?.generosity ?? Math.min(99, Math.max(10, 50 + ((s * 47) % 35 - 17))),
    riskTolerance: npc.personality?.riskTolerance ?? Math.min(99, Math.max(10, (npc.traits?.riskTolerance || 50) + ((s * 53) % 25 - 12))),
    competitiveness: npc.personality?.competitiveness ?? Math.min(99, Math.max(15, 60 + ((s * 59) % 31 - 15))),
    entrepreneurialDrive: npc.personality?.entrepreneurialDrive ?? Math.min(99, Math.max(10, 50 + ((s * 61) % 35 - 17))),
    politicalInterest: npc.personality?.politicalInterest ?? Math.min(99, Math.max(5, 35 + ((s * 67) % 45 - 22)))
  };

  // 2. Derive Ambition & Life Strategy from Personality
  let ambition: NPCLifeAmbition = npc.ambition || 'CAREER_SUCCESS';
  let lifeStrategy: NPCLifeStrategy = npc.lifeStrategy || 'CAREER_CLIMBER';
  
  if (!npc.ambition) {
    if (personality.entrepreneurialDrive > 75) {
      ambition = 'ENTREPRENEURSHIP';
      lifeStrategy = 'ENTREPRENEUR';
    } else if (personality.politicalInterest > 75) {
      ambition = 'POLITICAL_POWER';
      lifeStrategy = 'POLITICIAN';
    } else if (personality.greed > 75 && personality.riskTolerance > 65) {
      ambition = 'WEALTH';
      lifeStrategy = 'INVESTOR';
    } else if (personality.generosity > 70 && personality.empathy > 70) {
      ambition = 'FAMILY';
      lifeStrategy = 'FAMILY_BUILDER';
    } else if (personality.ambition > 75) {
      ambition = 'INFLUENCE';
      lifeStrategy = 'CAREER_CLIMBER';
    }
  }

  // 3. Career Profile
  const career = npc.career || {
    occupation: 'Corporate Professional',
    field: 'Finance & Banking',
    monthlySalary: 8500,
    employerName: 'Metropolitan Commercial Corp',
    yearsInRole: 3,
    careerTier: 'Mid',
    jobSatisfaction: 70
  };

  // 4. Canonical Goals
  let canonicalGoals: CanonicalNPCGoal[] = npc.canonicalGoals || [];
  if (canonicalGoals.length === 0) {
    canonicalGoals = generateInitialGoalsForNpc(
      npc.id || `npc_${seedIndex}`,
      ambition,
      personality,
      npc.netWorth || 250000,
      career
    );
  }

  // 5. Build full normalized object
  const normalized: LivingNpc = {
    id: npc.id || `npc_auto_${seedIndex}`,
    firstName: npc.firstName || 'Alex',
    lastName: npc.lastName || 'Morgan',
    age: npc.age || 35,
    birthMonth: npc.birthMonth || 5,
    birthYear: npc.birthYear || 1991,
    gender: npc.gender || 'Non-binary',
    locationCity: npc.locationCity || 'New York',
    locationCountry: npc.locationCountry || 'United States',
    
    simulationTier: npc.simulationTier || (npc.lod === 'FULL' ? 'MAJOR' : 'ACTIVE'),
    lod: npc.lod || (npc.simulationTier === 'MAJOR' ? 'FULL' : 'ACTIVE'),
    
    personality,
    traits: personality,
    ambition,
    secondaryAmbition: npc.secondaryAmbition || (personality.greed > 60 ? 'WEALTH' : 'SECURITY'),
    lifeStrategy,
    primaryGoal: npc.primaryGoal || 'CAREER_ADVANCEMENT',
    
    canonicalGoals,
    activeGoals: npc.activeGoals || canonicalGoals.map(g => ({
      id: g.id,
      category: g.category || 'CAREER_ADVANCEMENT',
      title: g.title,
      targetProgress: 100,
      priorityScore: g.priority,
      reason: g.description
    })),
    activePlanAction: npc.activePlanAction,
    
    lifeTier: npc.lifeTier || 'PROFESSIONAL_BUILDER',
    powerTier: npc.powerTier || 'LOCAL',
    career,
    educationLevel: npc.educationLevel || 'Master Degree',
    skills: npc.skills || {
      management: Math.min(95, Math.max(30, personality.intelligence * 0.5 + personality.discipline * 0.4)),
      finance: Math.min(95, Math.max(30, personality.intelligence * 0.6 + personality.greed * 0.3)),
      technical: Math.min(95, Math.max(25, personality.intelligence * 0.7)),
      negotiation: Math.min(95, Math.max(30, personality.confidence * 0.5 + personality.sociability * 0.4)),
      politics: Math.min(95, Math.max(20, personality.politicalInterest * 0.7 + personality.sociability * 0.3))
    },
    
    netWorth: npc.netWorth !== undefined ? npc.netWorth : 350000,
    cash: npc.cash !== undefined ? npc.cash : 45000,
    monthlyIncome: npc.monthlyIncome || career.monthlySalary || 8500,
    monthlyExpenses: npc.monthlyExpenses || Math.round((career.monthlySalary || 8500) * 0.6),
    ownedPropertyIds: npc.ownedPropertyIds || [],
    ownedBusinessIds: npc.ownedBusinessIds || [],
    stockPortfolioValue: npc.stockPortfolioValue || 0,
    bankDebt: npc.bankDebt || 0,
    
    influence: npc.influence !== undefined ? npc.influence : 40,
    reputation: npc.reputation !== undefined ? npc.reputation : 65,
    politicalOfficeId: npc.politicalOfficeId,
    politicalPartyId: npc.politicalPartyId,
    politicalCapital: npc.politicalCapital || (personality.politicalInterest > 50 ? 30 : 5),
    
    familyId: npc.familyId,
    dynastyId: npc.dynastyId,
    relationshipToPlayer: npc.relationshipToPlayer || 'Acquaintance',
    relationshipScore: npc.relationshipScore !== undefined ? npc.relationshipScore : 10,
    isRival: !!npc.isRival,
    isAlly: !!npc.isAlly,
    isCompetitor: !!npc.isCompetitor,
    competitorId: npc.competitorId,
    
    memories: npc.memories || [],
    recentActions: npc.recentActions || [],
    biographyTimeline: npc.biographyTimeline || [
      `Completed education in ${career.field}.`,
      `Joined ${career.employerName} as ${career.occupation}.`
    ],
    lastSimulatedTick: npc.lastSimulatedTick || 0,
    requestsToPlayer: npc.requestsToPlayer || [],
    isRetired: !!npc.isRetired
  };

  return normalized;
}

/**
 * Generates initial realistic goals for a newly initialized NPC based on ambition and wealth.
 */
export function generateInitialGoalsForNpc(
  npcId: string,
  ambition: NPCLifeAmbition,
  personality: NPCPersonality,
  netWorth: number,
  career: LivingNpc['career']
): CanonicalNPCGoal[] {
  const goals: CanonicalNPCGoal[] = [];

  switch (ambition) {
    case 'CAREER_SUCCESS':
      goals.push({
        id: `goal_${npcId}_promo`,
        npcId,
        type: 'PROMOTION',
        title: `Attain Senior / Executive Position in ${career.field}`,
        description: `Deliver exemplary operational performance at ${career.employerName} to secure executive appointment.`,
        category: 'CAREER_ADVANCEMENT',
        priority: 90,
        status: 'ACTIVE',
        targetValue: 100,
        currentValue: 35,
        progress: 35,
        startedMonth: 1,
        startedYear: 2026
      });
      break;

    case 'ENTREPRENEURSHIP':
      goals.push({
        id: `goal_${npcId}_startup`,
        npcId,
        type: 'START_COMPANY',
        title: `Found High-Growth Enterprise in ${career.field}`,
        description: `Accumulate capital reserve and assemble proprietary tech to launch venture.`,
        category: 'BUSINESS_GROWTH',
        priority: 95,
        status: 'ACTIVE',
        targetValue: 1000000,
        currentValue: netWorth,
        progress: Math.min(100, Math.round((netWorth / 1000000) * 100)),
        startedMonth: 1,
        startedYear: 2026
      });
      break;

    case 'WEALTH':
      goals.push({
        id: `goal_${npcId}_wealth`,
        npcId,
        type: 'WEALTH_TARGET',
        title: `Achieve $10,000,000 Liquid Net Worth`,
        description: `Systematically reinvest career cashflow and dividend yields into diversified asset classes.`,
        category: 'WEALTH_ACCUMULATION',
        priority: 85,
        status: 'ACTIVE',
        targetValue: 10000000,
        currentValue: netWorth,
        progress: Math.min(100, Math.round((netWorth / 10000000) * 100)),
        startedMonth: 1,
        startedYear: 2026
      });
      break;

    case 'PROPERTY':
      goals.push({
        id: `goal_${npcId}_prop`,
        npcId,
        type: 'BUY_PROPERTY',
        title: `Acquire Prime Metropolitan Real Estate Portfolio`,
        description: `Secure tier-one residential or commercial property assets with rental yields.`,
        category: 'WEALTH_ACCUMULATION',
        priority: 80,
        status: 'ACTIVE',
        targetValue: 2000000,
        currentValue: netWorth,
        progress: Math.min(100, Math.round((netWorth / 2000000) * 100)),
        startedMonth: 1,
        startedYear: 2026
      });
      break;

    case 'POLITICAL_POWER':
      goals.push({
        id: `goal_${npcId}_pol`,
        npcId,
        type: 'POLITICAL_OFFICE',
        title: `Win Parliamentary or Municipal Election`,
        description: `Build donor network, mobilize grassroots party delegates, and gain legislative seat.`,
        category: 'POWER',
        priority: 90,
        status: 'ACTIVE',
        targetValue: 100,
        currentValue: personality.politicalInterest,
        progress: Math.min(100, personality.politicalInterest),
        startedMonth: 1,
        startedYear: 2026
      });
      break;

    default:
      goals.push({
        id: `goal_${npcId}_stability`,
        npcId,
        type: 'WEALTH_TARGET',
        title: `Build Generational Financial Security`,
        description: `Maintain disciplined savings, debt-free solvency, and family trust reserves.`,
        category: 'STABILITY',
        priority: 75,
        status: 'ACTIVE',
        targetValue: 1000000,
        currentValue: netWorth,
        progress: Math.min(100, Math.round((netWorth / 1000000) * 100)),
        startedMonth: 1,
        startedYear: 2026
      });
      break;
  }

  return goals;
}

/**
 * Dynamic Promotion & Demotion: Evaluates importance of NPC relative to player and world.
 */
export function evaluateNPCSimulationImportance(state: GameState, npc: LivingNpc): NPCSimulationTier {
  // Major Tier Criteria:
  // 1. Close relationship to player (spouse, child, parent, close ally, bitter rival)
  const isClosePlayerFamily = state.relationships?.some(
    r => r.id === npc.id || (r.name && `${npc.firstName} ${npc.lastName}`.includes(r.name))
  );
  if (isClosePlayerFamily) return 'MAJOR';

  // 2. High Player Sentiment / Rivalry
  if (Math.abs(npc.relationshipScore) >= 30 || npc.isRival || npc.isAlly) return 'MAJOR';

  // 3. High Net Worth ($50M+) or Dynastic Head
  if (npc.netWorth >= 50000000 || npc.dynastyId || npc.lifeTier === 'TYCOON' || npc.lifeTier === 'LEGACY_DYNASTY') {
    return 'MAJOR';
  }

  // 4. Political Office Holder or Cabinet Minister
  if (npc.politicalOfficeId || npc.powerTier === 'POWERFUL' || npc.powerTier === 'GLOBAL') {
    return 'MAJOR';
  }

  // 5. Active Competitor Lead
  if (npc.competitorId || state.livingWorld?.competitors?.some(c => c.leadPersonId === npc.id)) {
    return 'MAJOR';
  }

  // 6. Has active pending requests to the player
  if (npc.requestsToPlayer && npc.requestsToPlayer.some(r => r.status === 'PENDING')) {
    return 'MAJOR';
  }

  // Active Tier Criteria:
  if (npc.netWorth >= 500000 || npc.career?.monthlySalary >= 10000 || (npc.recentActions && npc.recentActions.length > 0)) {
    return 'ACTIVE';
  }

  // Background Tier
  return 'BACKGROUND';
}

/**
 * Reusable Action Scoring Formula:
 * Calculates objective decision score for an action based on goals, personality, feasibility, risk, and expected payoff.
 */
export function calculateNpcActionScore(
  npc: LivingNpc,
  action: NPCPlanAction,
  state: GameState
): number {
  const p = npc.personality;
  let goalAlignment = 50;
  let personalityAlignment = 50;

  // Personality alignment based on action type
  switch (action.actionType) {
    case 'START_BUSINESS':
      personalityAlignment = (p.entrepreneurialDrive * 1.5 + p.riskTolerance * 1.2 + p.ambition) / 3.7;
      goalAlignment = npc.ambition === 'ENTREPRENEURSHIP' ? 95 : (npc.ambition === 'WEALTH' ? 70 : 40);
      break;

    case 'APPLY_JOB':
      personalityAlignment = (p.ambition * 1.3 + p.discipline + (100 - p.riskTolerance) * 0.5) / 2.8;
      goalAlignment = npc.ambition === 'CAREER_SUCCESS' ? 95 : 60;
      break;

    case 'BUY_PROPERTY':
      personalityAlignment = (p.patience * 1.2 + p.greed + p.discipline) / 3.2;
      goalAlignment = npc.ambition === 'PROPERTY' ? 95 : (npc.ambition === 'WEALTH' ? 80 : 50);
      break;

    case 'INVEST_STOCKS':
      personalityAlignment = (p.riskTolerance * 1.4 + p.greed * 1.2 + p.intelligence) / 3.6;
      goalAlignment = npc.ambition === 'WEALTH' ? 90 : 55;
      break;

    case 'CAMPAIGN_POLITICS':
      personalityAlignment = (p.politicalInterest * 1.6 + p.sociability * 1.2 + p.confidence) / 3.8;
      goalAlignment = npc.ambition === 'POLITICAL_POWER' ? 98 : 30;
      break;

    case 'PROPOSE_ALLIANCE':
      personalityAlignment = (p.sociability * 1.3 + p.loyalty + p.empathy) / 3.3;
      goalAlignment = 65;
      break;

    case 'COMPETE_RIVAL':
      personalityAlignment = (p.competitiveness * 1.5 + p.aggression * 1.2 + (100 - p.empathy)) / 3.7;
      goalAlignment = npc.isRival ? 90 : 40;
      break;

    case 'SEND_PLAYER_REQUEST':
      personalityAlignment = (p.confidence * 1.2 + p.sociability + p.ambition) / 3.2;
      goalAlignment = 75;
      break;

    case 'RETIRE':
      personalityAlignment = ((100 - p.ambition) + p.patience) / 2;
      goalAlignment = npc.age >= 65 ? 90 : 10;
      break;

    default:
      personalityAlignment = 50;
      goalAlignment = 50;
      break;
  }

  // Financial feasibility: Can the NPC afford this without ruin?
  let financialFeasibility = 50;
  if (action.estimatedCost <= 0) {
    financialFeasibility = 90;
  } else if (npc.cash >= action.estimatedCost * 1.2) {
    financialFeasibility = 95;
  } else if (npc.cash >= action.estimatedCost) {
    financialFeasibility = 70;
  } else if ((npc.cash + (npc.netWorth * 0.3)) >= action.estimatedCost) {
    financialFeasibility = 40; // Requires financing
  } else {
    financialFeasibility = 5; // Unaffordable
  }

  // Relationship value (if targeting player or ally)
  let relationshipValue = 50;
  if (action.targetEntityId === 'player') {
    relationshipValue = 50 + (npc.relationshipScore * 0.5);
  }

  // Controlled deterministic seeded variance
  const seed = getNpcDeterministicSeed(state, npc.id, action.actionType, action.estimatedCost);
  const seededVariance = (seed - 0.5) * 15;

  const score = 
    (goalAlignment * 0.25) +
    (personalityAlignment * 0.25) +
    (financialFeasibility * 0.20) +
    (Math.min(100, action.expectedBenefit / 1000) * 0.15) +
    (relationshipValue * 0.05) -
    (action.risk * 0.10) +
    seededVariance;

  return Math.max(0, Math.round(score * 10) / 10);
}

/**
 * Opportunity Engine: Generates open monthly societal and market opportunities.
 */
export function generateMonthlyNpcOpportunities(state: GameState): NPCOpportunity[] {
  const opps: NPCOpportunity[] = [];
  const tick = state.simulationTick;
  const currentYear = state.currentYear;
  const currentMonth = state.currentMonth;

  // 1. Corporate Executive Vacancies in Autonomous & Player Firms
  const industries = ['Technology & AI', 'Finance & Banking', 'Healthcare & Biotechnology', 'CleanTech', 'Real Estate'];
  for (let i = 0; i < 3; i++) {
    const ind = industries[(tick + i) % industries.length];
    const baseSalaries = [18000, 25000, 38000, 52000];
    const salary = baseSalaries[(tick * 3 + i) % baseSalaries.length];
    const roles = ['VP of Operations', 'Director of Strategic Growth', 'Chief Technology Officer', 'Senior Managing Director'];
    const title = roles[(tick + i) % roles.length];
    
    opps.push({
      id: `opp_job_${tick}_${i}`,
      type: 'JOB_OPENING',
      title: `${title} (${ind})`,
      description: `Prime executive opening at leading enterprise offering $${salary.toLocaleString()}/mo compensation.`,
      domain: ind,
      requirements: {
        minEducation: 'Master Degree',
        minIntelligence: 65,
        minReputation: 50
      },
      potentialReward: salary * 12,
      risk: 15,
      positionTitle: title,
      industry: ind,
      salary,
      expiresTick: tick + 3,
      status: 'OPEN',
      npcParticipants: [],
      playerCanParticipate: true
    });
  }

  // 2. Startup Seed Venture Funding Deals
  if (tick % 2 === 0) {
    opps.push({
      id: `opp_startup_${tick}`,
      type: 'STARTUP_VENTURE',
      title: 'Disruptive CleanTech Battery Consortium',
      description: 'Syndicate looking for founding partners and anchor co-investors ($150,000 entry).',
      domain: 'CleanTech',
      requirements: {
        minCapital: 150000,
        minIntelligence: 60
      },
      potentialReward: 1200000,
      risk: 45,
      price: 150000,
      expiresTick: tick + 2,
      status: 'OPEN',
      npcParticipants: [],
      playerCanParticipate: true
    });
  }

  // 3. Prime Real Estate Commercial Parcel Auction
  if (tick % 3 === 0) {
    opps.push({
      id: `opp_prop_${tick}`,
      type: 'PROPERTY_PURCHASE',
      title: 'Midtown High-Rise Commercial Suite',
      description: 'Off-market institutional property available at distressed 18% discount.',
      domain: 'Real Estate & Infrastructure',
      requirements: {
        minCapital: 450000
      },
      potentialReward: 750000,
      risk: 20,
      price: 450000,
      expiresTick: tick + 2,
      status: 'OPEN',
      npcParticipants: [],
      playerCanParticipate: true
    });
  }

  // 4. Municipal / Parliamentary Political Candidacy
  if (tick % 6 === 0) {
    opps.push({
      id: `opp_pol_${tick}`,
      type: 'POLITICAL_ELECTION',
      title: 'Metropolitan District Parliamentary By-Election',
      description: 'Open legislative seat contested across Enterprise, Technocrat, and Heritage party tickets.',
      domain: 'Politics',
      requirements: {
        minReputation: 60
      },
      potentialReward: 250000,
      risk: 40,
      expiresTick: tick + 4,
      status: 'OPEN',
      npcParticipants: [],
      playerCanParticipate: true
    });
  }

  return opps;
}

/**
 * Main Autonomous Monthly NPC Simulation Engine (Dominium Expansion 4 Core).
 * Iterates through all NPCs, advances careers, evaluates ambitions, handles job competition,
 * executes property/startup moves, and surfaces player interactions.
 */
export function simulateAutonomousNpcEcosystem(
  state: GameState,
  events: LifeEvent[],
  news: NewsItem[]
): void {
  const lw = state.livingWorld;
  if (!lw || !Array.isArray(lw.npcs)) return;

  const currentTick = state.simulationTick;
  const currentMonth = state.currentMonth;
  const currentYear = state.currentYear;

  // Initialize or update opportunities pool
  if (!Array.isArray(lw.activeOpportunities)) lw.activeOpportunities = [];
  
  // Prune expired opportunities
  lw.activeOpportunities = lw.activeOpportunities.filter(o => o.expiresTick > currentTick && o.status === 'OPEN');
  
  // Replenish new monthly opportunities
  const newOpps = generateMonthlyNpcOpportunities(state);
  lw.activeOpportunities.push(...newOpps);

  // Maintain NPC Requests to Player list
  if (!Array.isArray(lw.npcRequestsToPlayer)) lw.npcRequestsToPlayer = [];

  // Iterate across all NPCs
  for (let i = 0; i < lw.npcs.length; i++) {
    const rawNpc = lw.npcs[i];
    const npc = normalizeCanonicalNpc(rawNpc, i);
    lw.npcs[i] = npc;

    // 1. Dynamic Importance & Tier Recalibration
    npc.simulationTier = evaluateNPCSimulationImportance(state, npc);
    npc.lod = npc.simulationTier === 'MAJOR' ? 'FULL' : (npc.simulationTier === 'ACTIVE' ? 'ACTIVE' : 'BACKGROUND');
    npc.lastSimulatedTick = currentTick;

    // 2. Birthday / Aging
    if (currentMonth === (npc.birthMonth || 1)) {
      npc.age += 1;
    }

    // 3. Income, Cost of Living & Wealth Compounding
    const salary = npc.career?.monthlySalary || 7500;
    npc.monthlyIncome = salary;
    const expenseRatio = npc.personality.greed > 70 ? 0.75 : (npc.personality.discipline > 70 ? 0.45 : 0.60);
    npc.monthlyExpenses = Math.round(salary * expenseRatio);
    const netSavings = npc.monthlyIncome - npc.monthlyExpenses;
    
    // Add savings to cash
    npc.cash = Math.max(0, npc.cash + netSavings);

    // Debt service
    if (npc.bankDebt && npc.bankDebt > 0) {
      const debtPayment = Math.min(npc.cash, Math.round(npc.bankDebt * 0.015));
      npc.cash -= debtPayment;
      npc.bankDebt = Math.max(0, npc.bankDebt - (debtPayment * 0.8));
    }

    // Recompute total net worth
    npc.netWorth = Math.round(npc.cash + (npc.stockPortfolioValue || 0) + ((npc.ownedPropertyIds?.length || 0) * 650000) - (npc.bankDebt || 0));

    // 4. RETIREMENT & SUCCESSION (Age 65+)
    if (npc.age >= 68 && !npc.isRetired) {
      const retirementScore = calculateNpcActionScore(npc, {
        id: `ret_${npc.id}`,
        actionType: 'RETIRE',
        description: 'Retire from active executive duties.',
        expectedBenefit: 5000,
        estimatedCost: 0,
        risk: 5,
        score: 0
      }, state);

      if (retirementScore > 60 || npc.age >= 76) {
        npc.isRetired = true;
        npc.career.occupation = `Retired ${npc.career.occupation}`;
        npc.career.monthlySalary = Math.round(npc.career.monthlySalary * 0.4); // Pension / dividends
        npc.recentActions.push(`Formally retired from executive career at age ${npc.age}.`);
        npc.biographyTimeline.push(`${currentYear}: Retired with distinction following decades of leadership.`);
        if (npc.recentActions.length > 6) npc.recentActions.shift();

        if (npc.simulationTier === 'MAJOR') {
          lw.worldHistory.push({
            tick: currentTick,
            month: currentMonth,
            year: currentYear,
            headline: `Retirement: ${npc.firstName} ${npc.lastName} Steps Down`,
            category: 'Society',
            significance: 'Notable',
            affectedDomains: ['Corporate Leadership', npc.career.field],
            summary: `Prominent figure ${npc.firstName} ${npc.lastName} formally announced retirement at age ${npc.age}.`
          });
        }
      }
    }

    // 5. SIMULATION ACTIONS FOR MAJOR & ACTIVE NPCS
    if (npc.simulationTier === 'MAJOR' || (npc.simulationTier === 'ACTIVE' && currentTick % 2 === 0)) {
      evaluateAndExecuteNpcPlans(npc, state, events, news);
    }

    // 6. Memory Decay
    if (Array.isArray(npc.memories)) {
      npc.memories = npc.memories.filter(m => m.isPermanent || (currentTick - m.tick < 36));
    }
  }
}

/**
 * Evaluates available actions and executes the highest-scoring plan for an NPC.
 */
function evaluateAndExecuteNpcPlans(
  npc: LivingNpc,
  state: GameState,
  events: LifeEvent[],
  news: NewsItem[]
): void {
  const lw = state.livingWorld!;
  const currentTick = state.simulationTick;
  const currentYear = state.currentYear;
  const currentMonth = state.currentMonth;

  const candidateActions: NPCPlanAction[] = [];

  // Action Option A: Apply for Promotion or Job Opening
  const availableJob = lw.activeOpportunities?.find(o => o.type === 'JOB_OPENING' && o.status === 'OPEN');
  if (availableJob && (!npc.career || availableJob.salary! > (npc.career.monthlySalary || 0) * 1.15) && !npc.isRetired) {
    candidateActions.push({
      id: `act_job_${npc.id}`,
      actionType: 'APPLY_JOB',
      targetEntityId: availableJob.id,
      description: `Apply for ${availableJob.positionTitle} position in ${availableJob.domain}`,
      expectedBenefit: (availableJob.salary || 15000) * 12,
      estimatedCost: 0,
      risk: 10,
      score: 0
    });
  }

  // Action Option B: Found a New Startup Business
  if (npc.personality.entrepreneurialDrive >= 65 && npc.cash >= 80000 && !npc.isRetired) {
    candidateActions.push({
      id: `act_startup_${npc.id}`,
      actionType: 'START_BUSINESS',
      description: `Found an autonomous startup enterprise in ${npc.career.field}`,
      expectedBenefit: 500000,
      estimatedCost: 65000,
      risk: 40,
      score: 0
    });
  }

  // Action Option C: Buy Investment Property
  if (npc.cash >= 150000 && (npc.ownedPropertyIds?.length || 0) < 3) {
    candidateActions.push({
      id: `act_prop_${npc.id}`,
      actionType: 'BUY_PROPERTY',
      description: `Acquire prime metropolitan residential/commercial real estate`,
      expectedBenefit: 250000,
      estimatedCost: 120000,
      risk: 15,
      score: 0
    });
  }

  // Action Option D: Stock Portfolio Reinvestment
  if (npc.cash >= 30000) {
    candidateActions.push({
      id: `act_stock_${npc.id}`,
      actionType: 'INVEST_STOCKS',
      description: `Allocate capital into high-yield equity portfolios and public markets`,
      expectedBenefit: 60000,
      estimatedCost: 25000,
      risk: 25,
      score: 0
    });
  }

  // Action Option E: Run for Political Office / Join Party
  if (npc.personality.politicalInterest >= 65 && !npc.politicalOfficeId) {
    candidateActions.push({
      id: `act_pol_${npc.id}`,
      actionType: 'CAMPAIGN_POLITICS',
      description: `Launch campaign for parliamentary/municipal office`,
      expectedBenefit: 180000,
      estimatedCost: 35000,
      risk: 35,
      score: 0
    });
  }

  // Action Option F: Interactive Proposal to Player (if player has company or capital)
  const hasPlayerCompany = state.companies && state.companies.length > 0;
  const alreadyHasPendingRequest = lw.npcRequestsToPlayer?.some(r => r.npcId === npc.id && r.status === 'PENDING');
  
  if (hasPlayerCompany && !alreadyHasPendingRequest && npc.relationshipScore >= 5 && Math.random() < 0.12) {
    const playerComp = state.companies[0];
    if (npc.personality.entrepreneurialDrive >= 70) {
      candidateActions.push({
        id: `act_pitch_${npc.id}`,
        actionType: 'SEND_PLAYER_REQUEST',
        targetEntityId: 'player',
        description: `Pitch investment / joint venture proposal to player for $100,000`,
        expectedBenefit: 200000,
        estimatedCost: 10000,
        risk: 20,
        score: 0
      });
    } else if (npc.career?.careerTier === 'Executive' || npc.career?.careerTier === 'Senior') {
      candidateActions.push({
        id: `act_hire_pitch_${npc.id}`,
        actionType: 'SEND_PLAYER_REQUEST',
        targetEntityId: 'player',
        description: `Submit executive job application to ${playerComp.name}`,
        expectedBenefit: 120000,
        estimatedCost: 0,
        risk: 10,
        score: 0
      });
    }
  }

  if (candidateActions.length === 0) return;

  // Score all candidate actions
  for (const act of candidateActions) {
    act.score = calculateNpcActionScore(npc, act, state);
  }

  // Sort descending
  candidateActions.sort((a, b) => b.score - a.score);
  const bestAction = candidateActions[0];

  // Minimum threshold to execute action
  if (!bestAction || bestAction.score < 52) return;

  npc.activePlanAction = bestAction;

  // Execute Action
  switch (bestAction.actionType) {
    case 'START_BUSINESS': {
      npc.cash -= bestAction.estimatedCost;
      const bizName = `${npc.lastName} ${npc.career.field.split(' ')[0]} Ventures`;
      const newBizId = `biz_auto_${npc.id}_${currentTick}`;
      const newBiz: AutonomousBusiness = {
        id: newBizId,
        name: bizName,
        industry: npc.career.field,
        founderId: npc.id,
        valuation: 450000,
        marketShare: 1.2,
        monthlyRevenue: 28000,
        monthlyProfit: 8500,
        employeeCount: 6,
        brandReputation: 60,
        productQuality: 70,
        isPublic: false,
        status: 'Flourishing',
        currentStrategy: 'AGGRESSIVE_GROWTH',
        recentCorporateEvents: [`Founded in ${currentYear} by ${npc.firstName} ${npc.lastName}.`]
      };

      lw.businesses.push(newBiz);
      if (!npc.ownedBusinessIds) npc.ownedBusinessIds = [];
      npc.ownedBusinessIds.push(newBizId);
      npc.career.occupation = `Founder & CEO, ${bizName}`;
      npc.career.monthlySalary = Math.round(npc.career.monthlySalary * 1.5);
      npc.recentActions.push(`Founded new autonomous venture ${bizName}.`);
      npc.biographyTimeline.push(`${currentYear}: Founded ${bizName} with initial capital injection.`);
      if (npc.recentActions.length > 6) npc.recentActions.shift();

      // Update goal
      const startupGoal = npc.canonicalGoals.find(g => g.type === 'START_COMPANY');
      if (startupGoal) {
        startupGoal.status = 'COMPLETED';
        startupGoal.progress = 100;
        startupGoal.completedMonth = currentMonth;
        startupGoal.completedYear = currentYear;
      }

      if (npc.simulationTier === 'MAJOR') {
        lw.worldHistory.push({
          tick: currentTick,
          month: currentMonth,
          year: currentYear,
          headline: `Venture Launch: ${npc.firstName} ${npc.lastName} Founds ${bizName}`,
          category: 'Business',
          significance: 'Notable',
          affectedDomains: ['Autonomous Enterprise', npc.career.field],
          summary: `${npc.firstName} ${npc.lastName} established ${bizName} with proprietary technology and growth funding.`
        });
      }
      break;
    }

    case 'APPLY_JOB': {
      const opp = lw.activeOpportunities?.find(o => o.id === bestAction.targetEntityId);
      if (opp && opp.status === 'OPEN') {
        // Multi-candidate competition evaluation
        const applicantScore = (npc.skills?.management || 50) * 0.4 + (npc.personality.intelligence) * 0.3 + (npc.reputation) * 0.3;
        opp.npcParticipants.push({
          npcId: npc.id,
          npcName: `${npc.firstName} ${npc.lastName}`,
          score: applicantScore
        });

        // If top candidate, win role
        if (applicantScore > 65) {
          opp.status = 'ACCEPTED';
          npc.career.occupation = opp.positionTitle || npc.career.occupation;
          npc.career.monthlySalary = opp.salary || Math.round(npc.career.monthlySalary * 1.3);
          npc.recentActions.push(`Appointed to ${opp.positionTitle} in ${opp.domain}.`);
          npc.biographyTimeline.push(`${currentYear}: Secured prestigious appointment as ${opp.positionTitle}.`);
          if (npc.recentActions.length > 6) npc.recentActions.shift();

          const promoGoal = npc.canonicalGoals.find(g => g.type === 'PROMOTION');
          if (promoGoal) {
            promoGoal.progress = Math.min(100, promoGoal.progress + 40);
            if (promoGoal.progress >= 100) {
              promoGoal.status = 'COMPLETED';
              promoGoal.completedMonth = currentMonth;
              promoGoal.completedYear = currentYear;
            }
          }
        }
      }
      break;
    }

    case 'BUY_PROPERTY': {
      npc.cash -= bestAction.estimatedCost;
      const propId = `prop_npc_${npc.id}_${currentTick}`;
      if (!npc.ownedPropertyIds) npc.ownedPropertyIds = [];
      npc.ownedPropertyIds.push(propId);
      npc.recentActions.push('Purchased prime metropolitan investment real estate.');
      npc.biographyTimeline.push(`${currentYear}: Expanded personal real estate portfolio with premier metropolitan parcel.`);
      if (npc.recentActions.length > 6) npc.recentActions.shift();

      const propGoal = npc.canonicalGoals.find(g => g.type === 'BUY_PROPERTY');
      if (propGoal) {
        propGoal.progress = 100;
        propGoal.status = 'COMPLETED';
        propGoal.completedMonth = currentMonth;
        propGoal.completedYear = currentYear;
      }
      break;
    }

    case 'INVEST_STOCKS': {
      npc.cash -= bestAction.estimatedCost;
      npc.stockPortfolioValue = (npc.stockPortfolioValue || 0) + bestAction.estimatedCost;
      npc.recentActions.push('Expanded diversified equities and sovereign bond portfolio.');
      if (npc.recentActions.length > 6) npc.recentActions.shift();
      break;
    }

    case 'CAMPAIGN_POLITICS': {
      npc.cash -= bestAction.estimatedCost;
      npc.politicalCapital = Math.min(100, (npc.politicalCapital || 20) + 18);
      npc.recentActions.push('Conducted major campaign rallies and donor dinner presentations.');
      if (npc.recentActions.length > 6) npc.recentActions.shift();
      break;
    }

    case 'SEND_PLAYER_REQUEST': {
      const isPitch = bestAction.description.includes('investment');
      const reqId = `req_${npc.id}_${currentTick}`;
      const newReq: NPCRequestToPlayer = {
        id: reqId,
        npcId: npc.id,
        npcName: `${npc.firstName} ${npc.lastName}`,
        npcRole: npc.career.occupation,
        requestType: isPitch ? 'INVESTMENT_PITCH' : 'JOB_APPLICATION',
        title: isPitch ? `Strategic Seed Investment Pitch ($100,000)` : `Executive Application for Leadership Role`,
        description: isPitch
          ? `${npc.firstName} ${npc.lastName} is raising $100,000 in exchange for 15% equity in a high-yield enterprise.`
          : `${npc.firstName} ${npc.lastName} (${npc.career.occupation}) wishes to join your flagship enterprise as an executive director.`,
        financialAmount: isPitch ? 100000 : undefined,
        equityOfferedPercent: isPitch ? 15 : undefined,
        targetCompanyId: state.companies?.[0]?.id,
        targetJobTitle: isPitch ? undefined : 'Executive Vice President',
        requestedSalaryMonthly: isPitch ? undefined : 22000,
        month: currentMonth,
        year: currentYear,
        tick: currentTick,
        status: 'PENDING'
      };

      if (!lw.npcRequestsToPlayer) lw.npcRequestsToPlayer = [];
      lw.npcRequestsToPlayer.push(newReq);
      if (!npc.requestsToPlayer) npc.requestsToPlayer = [];
      npc.requestsToPlayer.push(newReq);

      // Generate a High-Relevance Player Notification Event
      events.push({
        id: `ev_npcreq_${reqId}`,
        category: 'BUSINESS',
        title: `Proposal from ${npc.firstName} ${npc.lastName}`,
        description: newReq.description,
        severity: 'Medium',
        createdMonth: currentMonth,
        createdYear: currentYear,
        sourceEntityId: npc.id
      });
      break;
    }
  }
}
