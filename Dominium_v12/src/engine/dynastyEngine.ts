import { 
  GameState, 
  RelationshipPerson, 
  DynastyProfile, 
  DynastySuccessionPlan, 
  DynastyTimelineEvent, 
  SuccessionHistoryRecord, 
  SuccessionOutcomeType, 
  LegacyReport, 
  LegacyScorecard,
  PropertyDistributionStrategy,
  BusinessSuccessionStrategy,
  PoliticalHandoverStrategy,
  FinancialInheritanceSplit
} from '../types';
import { calculateNetWorth } from './simulationEngine';

export const DEFAULT_SUCCESSION_PLAN: DynastySuccessionPlan = {
  primaryHeirId: null,
  businessSuccessorId: null,
  politicalSuccessorId: null,
  businessStrategy: 'Sole Executive Control',
  propertyStrategy: 'Primary Heir Inherits All',
  financialInheritance: {
    primaryHeirPercent: 65,
    otherChildrenPercent: 20,
    philanthropyPercent: 10,
    familyTrustReservePercent: 5
  },
  politicalStrategy: 'Direct Dynastic Endorsement'
};

/**
 * Creates an initial Dynasty Profile for a starting character.
 */
export function createInitialDynastyProfile(
  character: GameState['character'], 
  currentYear: number, 
  currentMonth: number
): DynastyProfile {
  const dynastyName = `${character.lastName} Dynasty`;
  const founderName = `${character.firstName} ${character.lastName}`;

  return {
    dynastyName,
    motto: 'Perseverance, Legacy, Dominion',
    crestIcon: 'Crown',
    foundedYear: currentYear,
    foundedMonth: currentMonth,
    founderName,
    currentGeneration: 1,
    dynastyWealth: 0,
    dynastyReputation: Math.max(30, character.attributes.reputation),
    dynastyStability: 85,
    dynastyCompaniesCount: 0,
    dynastyPropertiesCount: 0,
    politicalInfluenceScore: Math.max(5, character.attributes.worldInfluence),
    majorAchievements: ['Established the Founding Family Line'],
    majorFailures: [],
    successionPlan: { ...DEFAULT_SUCCESSION_PLAN },
    successionHistory: [],
    timeline: [
      {
        id: `dtl_founding_${Date.now()}`,
        month: currentMonth,
        year: currentYear,
        generation: 1,
        characterName: founderName,
        category: 'FOUNDING',
        title: `Founding of the ${character.lastName} Dynasty`,
        description: `${founderName} laid the cornerstone of the dynastic family line in ${character.birthCity}, ${character.birthCountry}.`,
        significance: 'Historic',
        metricsChange: 'Dynasty Founded'
      }
    ]
  };
}

/**
 * Ensures the GameState has a fully populated, normalized Dynasty Profile and peak net worth tracking.
 */
export function ensureDynastyProfile(state: GameState): GameState {
  let updated = { ...state };

  if (!updated.peakNetWorth) {
    updated.peakNetWorth = calculateNetWorth(updated);
  } else {
    const currentNW = calculateNetWorth(updated);
    if (currentNW > updated.peakNetWorth) {
      updated.peakNetWorth = currentNW;
    }
  }

  if (updated.lifetimePhilanthropy === undefined) {
    updated.lifetimePhilanthropy = 0;
  }

  if (!updated.dynastyProfile) {
    updated.dynastyProfile = createInitialDynastyProfile(
      updated.character,
      updated.currentYear,
      updated.currentMonth
    );
  }

  // Ensure default timeline exists
  if (!updated.dynastyProfile.timeline || updated.dynastyProfile.timeline.length === 0) {
    updated.dynastyProfile.timeline = [
      {
        id: `dtl_founding_${updated.simulationTick}`,
        month: updated.dynastyProfile.foundedMonth || updated.currentMonth,
        year: updated.dynastyProfile.foundedYear || updated.currentYear,
        generation: 1,
        characterName: updated.dynastyProfile.founderName || `${updated.character.firstName} ${updated.character.lastName}`,
        category: 'FOUNDING',
        title: `Founding of the ${updated.character.lastName} Dynasty`,
        description: `The cornerstone of the family line was established.`,
        significance: 'Historic',
        metricsChange: 'Dynasty Founded'
      }
    ];
  }

  // Ensure succession plan defaults
  if (!updated.dynastyProfile.successionPlan) {
    updated.dynastyProfile.successionPlan = { ...DEFAULT_SUCCESSION_PLAN };
  }
  if (!updated.dynastyProfile.successionHistory) {
    updated.dynastyProfile.successionHistory = [];
  }
  if (!updated.dynastyProfile.majorAchievements) {
    updated.dynastyProfile.majorAchievements = ['Established the Founding Family Line'];
  }
  if (!updated.dynastyProfile.majorFailures) {
    updated.dynastyProfile.majorFailures = [];
  }

  // Normalize relationships & heir attributes
  updated.relationships = updated.relationships.map(rel => syncHeirAttributes(rel, updated));

  // Sync primary heir with state.dynastyHeirId if one is selected
  if (updated.dynastyHeirId && !updated.dynastyProfile.successionPlan.primaryHeirId) {
    updated.dynastyProfile.successionPlan.primaryHeirId = updated.dynastyHeirId;
  }
  if (updated.dynastyProfile.successionPlan.primaryHeirId && !updated.dynastyHeirId) {
    updated.dynastyHeirId = updated.dynastyProfile.successionPlan.primaryHeirId;
  }

  // Update dynamic metrics
  updated = updateDynastyMetrics(updated);

  return updated;
}

/**
 * Enriches a relationship with heir-specific attributes (leadership, business ability, political ability, loyalty, rival status).
 */
export function syncHeirAttributes(person: RelationshipPerson, state: GameState): RelationshipPerson {
  const p = { ...person };
  const isChild = p.relation === 'Son' || p.relation === 'Daughter';

  // Compute base abilities from skills / attributes / education if not already defined
  const skills = p.skills || { intellect: 60, creativity: 55, leadership: 55, discipline: 60 };

  if (p.leadership === undefined) {
    p.leadership = Math.min(100, Math.max(25, Math.round(skills.leadership * 0.9 + (p.age >= 18 ? 10 : 0))));
  }
  if (p.businessAbility === undefined) {
    const eduBoost = p.education?.includes('Economics') || p.education?.includes('Business') ? 20 : 5;
    p.businessAbility = Math.min(100, Math.max(20, Math.round(skills.intellect * 0.6 + skills.discipline * 0.4 + eduBoost)));
  }
  if (p.politicalAbility === undefined) {
    p.politicalAbility = Math.min(100, Math.max(15, Math.round(skills.leadership * 0.5 + (p.trust || 50) * 0.3 + (p.respect || 50) * 0.2)));
  }

  if (p.loyalty === undefined) {
    p.loyalty = Math.min(100, Math.max(10, Math.round(((p.trust || 60) * 0.6 + (p.love || 60) * 0.4))));
  }

  if (isChild) {
    const isPrimaryHeir = state.dynastyHeirId === p.id || state.dynastyProfile?.successionPlan.primaryHeirId === p.id;
    const plan = state.dynastyProfile?.successionPlan;
    
    // Evaluate Conflict Status
    if (isPrimaryHeir) {
      p.isLoyalHeir = true;
      p.isRivalHeir = false;
      p.conflictStatus = p.loyalty >= 60 ? 'Loyal' : 'Content';
    } else {
      // Non-primary children evaluate will fairness and relationship
      const fairCut = plan ? plan.financialInheritance.otherChildrenPercent : 20;
      if (p.loyalty < 40 && fairCut < 15 && p.age >= 18) {
        p.isRivalHeir = true;
        p.isLoyalHeir = false;
        p.conflictStatus = p.loyalty < 25 ? 'Litigious' : 'Openly Rival';
      } else if (p.loyalty < 55) {
        p.isRivalHeir = false;
        p.isLoyalHeir = false;
        p.conflictStatus = 'Disgruntled';
      } else {
        p.isRivalHeir = false;
        p.isLoyalHeir = p.loyalty >= 75;
        p.conflictStatus = p.loyalty >= 75 ? 'Loyal' : 'Content';
      }
    }
  }

  return p;
}

/**
 * Calculates and updates aggregate Dynasty Metrics.
 */
export function updateDynastyMetrics(state: GameState): GameState {
  if (!state.dynastyProfile) return state;

  const currentNW = calculateNetWorth(state);
  const children = state.relationships.filter(r => r.relation === 'Son' || r.relation === 'Daughter');
  const childrenWealth = children.reduce((acc, c) => acc + (c.wealth || 0), 0);
  const totalDynastyWealth = currentNW + childrenWealth;

  // Dynasty Reputation is weighted average of player reputation, corporate prestige, and dynastic stability
  const playerRep = state.character.attributes.reputation;
  const corporatePrestige = state.companies.length > 0 
    ? state.companies.reduce((acc, c) => acc + c.brandReputation, 0) / state.companies.length 
    : 40;
  const dynastyReputation = Math.min(100, Math.round((playerRep * 0.5) + (corporatePrestige * 0.3) + (state.dynastyGeneration * 3)));

  // Dynasty Stability is household love/trust adjusted for rival heirs and succession plan completeness
  const avgLove = state.relationships.length > 0 
    ? state.relationships.reduce((acc, r) => acc + r.love, 0) / state.relationships.length 
    : 80;
  const avgTrust = state.relationships.length > 0 
    ? state.relationships.reduce((acc, r) => acc + r.trust, 0) / state.relationships.length 
    : 80;
  
  const rivalHeirsCount = children.filter(c => c.isRivalHeir || c.conflictStatus === 'Litigious' || c.conflictStatus === 'Openly Rival').length;
  const hasHeirAssigned = !!state.dynastyProfile.successionPlan.primaryHeirId;

  let stabilityPenalty = (rivalHeirsCount * 15) - (hasHeirAssigned ? 5 : 15);
  const dynastyStability = Math.min(100, Math.max(10, Math.round(((avgLove * 0.5) + (avgTrust * 0.5)) - stabilityPenalty)));

  // Political Influence
  const officeFactor = state.politics.currentOffice.inOffice ? 40 : (state.politics.pastOffices.length * 10);
  const pacFactor = state.projects.some(p => p.type === 'Political PAC' && p.completed) ? 25 : 0;
  const polScore = Math.min(100, Math.round((state.character.attributes.worldInfluence * 0.4) + (officeFactor * 0.3) + pacFactor));

  const updatedProfile: DynastyProfile = {
    ...state.dynastyProfile,
    dynastyWealth: totalDynastyWealth,
    dynastyReputation,
    dynastyStability,
    dynastyCompaniesCount: state.companies.length,
    dynastyPropertiesCount: state.finances.properties.length,
    politicalInfluenceScore: polScore,
    currentGeneration: state.dynastyGeneration
  };

  return {
    ...state,
    dynastyProfile: updatedProfile
  };
}

/**
 * Appends a milestone or historical event to the Dynasty Timeline.
 */
export function recordDynastyTimelineEvent(
  state: GameState, 
  event: Omit<DynastyTimelineEvent, 'id'>
): GameState {
  const ensured = ensureDynastyProfile(state);
  const newEvent: DynastyTimelineEvent = {
    ...event,
    id: `dtl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  };

  // Avoid identical duplicate entries on the exact same month/category/title
  const exists = ensured.dynastyProfile!.timeline.some(
    e => e.year === event.year && e.month === event.month && e.title === event.title
  );

  if (!exists) {
    ensured.dynastyProfile!.timeline = [
      newEvent,
      ...ensured.dynastyProfile!.timeline
    ];
  }

  return ensured;
}

/**
 * Scans current game achievements, acquisitions, and events to automatically record timeline entries.
 */
export function scanAndRecordDynastyMilestones(
  state: GameState, 
  prevNetWorth: number = 0
): GameState {
  let s = ensureDynastyProfile(state);
  const charName = `${s.character.firstName} ${s.character.lastName}`;
  const currentNW = calculateNetWorth(s);

  // 1. Net worth landmark milestones
  const thresholds = [
    { value: 1000000, label: '$1 Million' },
    { value: 10000000, label: '$10 Million' },
    { value: 50000000, label: '$50 Million' },
    { value: 100000000, label: '$100 Million' },
    { value: 500000000, label: '$500 Million' },
    { value: 1000000000, label: '$1 Billion Unicorn Estate' }
  ];

  for (const t of thresholds) {
    if (currentNW >= t.value && prevNetWorth < t.value) {
      s = recordDynastyTimelineEvent(s, {
        month: s.currentMonth,
        year: s.currentYear,
        generation: s.dynastyGeneration,
        characterName: charName,
        category: 'ACQUISITION',
        title: `Dynasty Estate Reached ${t.label}`,
        description: `Through disciplined investment and empire expansion, the family net worth breached ${t.label}.`,
        significance: t.value >= 100000000 ? 'Historic' : 'Major',
        metricsChange: `+$${t.value.toLocaleString()} Net Worth`
      });

      if (!s.dynastyProfile!.majorAchievements.includes(`Reached ${t.label} Family Estate`)) {
        s.dynastyProfile!.majorAchievements.push(`Reached ${t.label} Family Estate`);
      }
    }
  }

  // 2. Political breakthroughs
  if (s.politics.currentOffice.inOffice) {
    const officeTitle = s.politics.currentOffice.title;
    const polKey = `Elected as ${officeTitle}`;
    if (!s.dynastyProfile!.majorAchievements.includes(polKey)) {
      s.dynastyProfile!.majorAchievements.push(polKey);
      s = recordDynastyTimelineEvent(s, {
        month: s.currentMonth,
        year: s.currentYear,
        generation: s.dynastyGeneration,
        characterName: charName,
        category: 'POLITICAL',
        title: `Political Triumph: ${officeTitle}`,
        description: `${charName} ascended to the high office of ${officeTitle}, establishing formidable political sway for the dynasty.`,
        significance: 'Historic',
        metricsChange: `High Office: ${officeTitle}`
      });
    }
  }

  return s;
}

/**
 * Simulates succession dynamics and predicts family reactions, rival factions, and corporate risk.
 */
export function simulateSuccessionDynamics(
  state: GameState, 
  plan: DynastySuccessionPlan = state.dynastyProfile?.successionPlan || DEFAULT_SUCCESSION_PLAN
): {
  outcome: SuccessionOutcomeType;
  stabilityScore: number;
  rivalHeirs: RelationshipPerson[];
  loyalHeirs: RelationshipPerson[];
  businessFragmentationRiskPercent: number;
  summaryExplanation: string;
  contestedReasons: string[];
} {
  const children = state.relationships.filter(r => r.relation === 'Son' || r.relation === 'Daughter');
  const primaryHeir = children.find(c => c.id === plan.primaryHeirId) || children[0];
  const contestedReasons: string[] = [];

  const rivalHeirs: RelationshipPerson[] = [];
  const loyalHeirs: RelationshipPerson[] = [];

  if (!primaryHeir && children.length > 0) {
    contestedReasons.push('No primary heir designated in legal will.');
  }

  const otherChildren = children.filter(c => c.id !== primaryHeir?.id);
  const otherShare = plan.financialInheritance.otherChildrenPercent;

  otherChildren.forEach(child => {
    const isUnderfunded = otherShare < (children.length > 1 ? 15 : 5);
    const hasLowTrust = (child.trust || 50) < 45 || (child.loyalty || 50) < 45;

    if (isUnderfunded && hasLowTrust && child.age >= 18) {
      rivalHeirs.push(child);
      contestedReasons.push(`${child.name} feels disinherited (allocated share is only ${otherShare}%) and harbours deep resentment.`);
    } else if ((child.loyalty || 50) >= 70) {
      loyalHeirs.push(child);
    }
  });

  // Calculate Base Stability
  let stabilityScore = 80;
  if (!primaryHeir) stabilityScore -= 35;
  if (rivalHeirs.length > 0) stabilityScore -= rivalHeirs.length * 25;
  if (plan.financialInheritance.philanthropyPercent > 40 && children.length > 0) {
    stabilityScore -= 15;
    contestedReasons.push('Extremely high philanthropic donation caused friction with expectant heirs.');
  }

  if (plan.businessStrategy === 'Appoint External Professional CEO' && primaryHeir && (primaryHeir.businessAbility || 0) >= 70) {
    stabilityScore -= 10;
    contestedReasons.push(`${primaryHeir.name} was passed over for CEO in favour of external management.`);
  }

  stabilityScore = Math.min(100, Math.max(10, stabilityScore));

  // Determine Outcome
  let outcome: SuccessionOutcomeType = 'Smooth Transition';
  let fragmentationRisk = 0;

  if (stabilityScore >= 85 && rivalHeirs.length === 0) {
    outcome = 'Triumphant Coronation';
    fragmentationRisk = 0;
  } else if (stabilityScore >= 65 && rivalHeirs.length === 0) {
    outcome = 'Smooth Transition';
    fragmentationRisk = 0;
  } else if (stabilityScore >= 45) {
    outcome = 'Contested Will';
    fragmentationRisk = 10; // 10% company valuation friction
  } else if (stabilityScore >= 30) {
    outcome = 'Corporate Fragmentation';
    fragmentationRisk = 20;
  } else {
    outcome = 'Litigious Crisis';
    fragmentationRisk = 35;
  }

  let summaryExplanation = '';
  switch (outcome) {
    case 'Triumphant Coronation':
      summaryExplanation = 'Unanimous dynastic alignment. The heir assumes control with unwavering family and institutional backing.';
      break;
    case 'Smooth Transition':
      summaryExplanation = 'The succession proceeds cleanly with minor formalities and minimal corporate disruption.';
      break;
    case 'Contested Will':
      summaryExplanation = 'Disgruntled family members register formal legal objections, causing momentary stock volatility and legal fees.';
      break;
    case 'Corporate Fragmentation':
      summaryExplanation = 'Rival factions demand board seats and divestitures, forcing asset spin-offs and 20% valuation discount.';
      break;
    case 'Litigious Crisis':
      summaryExplanation = 'Open dynastic warfare. Lawsuits and public mudslinging severely impact enterprise valuation and reputation.';
      break;
    default:
      summaryExplanation = 'Succession finalized with moderate complications.';
  }

  return {
    outcome,
    stabilityScore,
    rivalHeirs,
    loyalHeirs,
    businessFragmentationRiskPercent: fragmentationRisk,
    summaryExplanation,
    contestedReasons
  };
}

/**
 * Calculates the comprehensive multi-dimensional Legacy Scorecard (0 - 1000).
 */
export function calculateLegacyScorecard(state: GameState): LegacyScorecard {
  const currentNW = calculateNetWorth(state);
  const peakNW = Math.max(state.peakNetWorth || currentNW, currentNW);
  
  // 1. Wealth Score (0-100)
  let wealthScore = 0;
  if (peakNW >= 1000000000) wealthScore = 100;
  else if (peakNW >= 250000000) wealthScore = 90 + Math.round((peakNW - 250000000) / 750000000 * 10);
  else if (peakNW >= 50000000) wealthScore = 75 + Math.round((peakNW - 50000000) / 200000000 * 15);
  else if (peakNW >= 10000000) wealthScore = 55 + Math.round((peakNW - 10000000) / 40000000 * 20);
  else if (peakNW >= 1000000) wealthScore = 35 + Math.round((peakNW - 1000000) / 9000000 * 20);
  else wealthScore = Math.max(5, Math.round(peakNW / 1000000 * 35));

  // 2. Business Score (0-100)
  const compVal = state.companies.reduce((acc, c) => acc + c.valuation, 0);
  const compEmployees = state.companies.reduce((acc, c) => acc + c.employeesCount, 0);
  let businessScore = Math.min(100, Math.round((state.companies.length * 15) + (compVal / 10000000 * 3) + (compEmployees / 100 * 2)));

  // 3. Family Score (0-100)
  const children = state.relationships.filter(r => r.relation === 'Son' || r.relation === 'Daughter');
  const avgLove = state.relationships.length > 0 
    ? state.relationships.reduce((acc, r) => acc + r.love, 0) / state.relationships.length 
    : 70;
  const avgTrust = state.relationships.length > 0 
    ? state.relationships.reduce((acc, r) => acc + r.trust, 0) / state.relationships.length 
    : 70;
  let familyScore = Math.min(100, Math.round((children.length * 12) + (avgLove * 0.35) + (avgTrust * 0.35)));

  // 4. Health & Longevity Score (0-100)
  const age = state.character.age;
  const health = state.character.attributes.health;
  const stressInverted = Math.max(0, 100 - state.character.attributes.stress);
  let healthScore = Math.min(100, Math.round((Math.min(90, age) * 0.5) + (health * 0.3) + (stressInverted * 0.2)));

  // 5. Reputation Score (0-100)
  const reputationScore = state.character.attributes.reputation;

  // 6. Politics Score (0-100)
  let politicsScore = 10;
  if (state.politics.currentOffice.title.includes('President') || state.politics.currentOffice.title.includes('Prime Minister')) politicsScore = 100;
  else if (state.politics.currentOffice.title.includes('Cabinet') || state.politics.currentOffice.title.includes('Senator') || state.politics.currentOffice.title.includes('Parliament')) politicsScore = 80;
  else if (state.politics.currentOffice.title.includes('Mayor')) politicsScore = 60;
  else if (state.politics.currentOffice.title.includes('Councillor')) politicsScore = 40;
  else politicsScore = Math.min(100, Math.round((state.character.attributes.worldInfluence * 0.6) + (state.politics.pastOffices.length * 15)));

  // 7. Philanthropy Score (0-100)
  const philDonated = state.lifetimePhilanthropy || 0;
  let philanthropyScore = 0;
  if (philDonated >= 50000000) philanthropyScore = 100;
  else if (philDonated >= 10000000) philanthropyScore = 85;
  else if (philDonated >= 1000000) philanthropyScore = 65;
  else if (philDonated >= 100000) philanthropyScore = 40;
  else philanthropyScore = Math.min(30, Math.round(philDonated / 10000 * 3));

  // 8. Achievements Score (0-100)
  const unlockedAchCount = state.achievements.filter(a => a.unlocked).length;
  const achievementsScore = Math.min(100, Math.round(unlockedAchCount * 10));

  // 9. Dynasty Stability Score (0-100)
  const stabilityScore = state.dynastyProfile?.dynastyStability || 80;

  // Total Legacy Score calculation out of 1000
  const totalLegacyScore = Math.min(1000, Math.round(
    (wealthScore * 1.8) +
    (businessScore * 1.5) +
    (familyScore * 1.3) +
    (healthScore * 1.0) +
    (reputationScore * 1.1) +
    (politicsScore * 1.0) +
    (philanthropyScore * 0.9) +
    (achievementsScore * 0.7) +
    (stabilityScore * 0.7)
  ));

  // Legacy Grade
  let legacyGrade: LegacyScorecard['legacyGrade'] = 'C';
  if (totalLegacyScore >= 900) legacyGrade = 'S+';
  else if (totalLegacyScore >= 800) legacyGrade = 'S';
  else if (totalLegacyScore >= 680) legacyGrade = 'A';
  else if (totalLegacyScore >= 520) legacyGrade = 'B';
  else if (totalLegacyScore >= 380) legacyGrade = 'C';
  else if (totalLegacyScore >= 240) legacyGrade = 'D';
  else legacyGrade = 'F';

  // Dynamic Sovereign Title
  let legacyTitle = 'The Self-Made Pioneer';
  if (totalLegacyScore >= 900) {
    legacyTitle = 'The Sovereign Architect of Empires';
  } else if (wealthScore >= 85 && businessScore >= 80) {
    legacyTitle = 'The Gilded Industrial Titan';
  } else if (politicsScore >= 80) {
    legacyTitle = 'The Supreme Statesman & Visionary';
  } else if (philanthropyScore >= 75) {
    legacyTitle = 'The Grand Benefactor & Patron';
  } else if (familyScore >= 85 && stabilityScore >= 85) {
    legacyTitle = 'The Beloved Patriarch of the Golden House';
  } else if (businessScore >= 75) {
    legacyTitle = 'The Venture Conqueror';
  } else if (totalLegacyScore >= 650) {
    legacyTitle = 'The Renowned Dynastic Founder';
  } else {
    legacyTitle = 'The Resilient Empire Builder';
  }

  return {
    wealthScore,
    businessScore,
    familyScore,
    healthScore,
    reputationScore,
    politicsScore,
    philanthropyScore,
    achievementsScore,
    stabilityScore,
    totalLegacyScore,
    legacyGrade,
    legacyTitle
  };
}

/**
 * Generates the definitive comprehensive Legacy Report for a character.
 */
export function generateLegacyReport(state: GameState): LegacyReport {
  const char = state.character;
  const currentNW = calculateNetWorth(state);
  const peakNW = Math.max(state.peakNetWorth || currentNW, currentNW);
  const scores = calculateLegacyScorecard(state);

  const spouse = state.relationships.find(r => r.relation === 'Spouse' || r.relation === 'Partner');
  const children = state.relationships.filter(r => r.relation === 'Son' || r.relation === 'Daughter');
  const primaryHeir = children.find(c => c.id === state.dynastyHeirId) || children[0];

  // Financial commentary
  let finCommentary = `Built a final estate evaluated at $${currentNW.toLocaleString()}, reaching an all-time peak valuation of $${peakNW.toLocaleString()}.`;
  if (currentNW >= 100000000) {
    finCommentary += ' Commanded titan-tier capital resources that shaped international markets and institutions.';
  } else if (currentNW >= 10000000) {
    finCommentary += ' Successfully established multi-generational dynastic security with diversified assets.';
  } else {
    finCommentary += ' Maintained disciplined financial prudence through evolving macroeconomic cycles.';
  }

  // Business commentary
  const totalCompVal = state.companies.reduce((acc, c) => acc + c.valuation, 0);
  const totalEmployees = state.companies.reduce((acc, c) => acc + c.employeesCount, 0);
  let bizCommentary = `Founded or governed ${state.companies.length} corporate entities with a collective enterprise value of $${totalCompVal.toLocaleString()} and ${totalEmployees.toLocaleString()} employees.`;
  if (state.companies.length >= 3) {
    bizCommentary += ' Constructed a diversified conglomerate across key industrial and technological sectors.';
  }

  // Political commentary
  let polCommentary = state.politics.currentOffice.inOffice 
    ? `Served the nation as ${state.politics.currentOffice.title}, exercising statecraft and regulatory governance.`
    : `Wielded formidable civic influence and diplomatic stature across public spheres.`;

  // Family commentary
  const avgHarmony = state.relationships.length > 0 
    ? Math.round(state.relationships.reduce((acc, r) => acc + r.love, 0) / state.relationships.length) 
    : 80;
  let famCommentary = `Raised ${children.length} heirs across Generation ${state.dynastyGeneration} with a family harmony index of ${avgHarmony}%.`;
  if (primaryHeir) {
    famCommentary += ` Invested heavily in grooming ${primaryHeir.name} as the dynastic torchbearer.`;
  }

  // Major Decisions (filtered from decisionHistory)
  const majorDecisions = (state.decisionHistory || [])
    .filter(d => d.importance === 'Historic' || d.importance === 'Major' || d.importance === 'Critical')
    .slice(0, 8)
    .map(d => ({
      title: d.title,
      category: d.category,
      importance: d.importance || 'Major',
      year: d.year,
      outcome: d.result || d.description
    }));

  // Major Achievements & Failures
  const majorAchievements = [...(state.dynastyProfile?.majorAchievements || [])];
  state.achievements.filter(a => a.unlocked).forEach(a => {
    if (!majorAchievements.includes(a.title)) {
      majorAchievements.push(a.title);
    }
  });

  const majorFailures = [...(state.dynastyProfile?.majorFailures || [])];
  if (state.character.attributes.health <= 0 && state.character.age < 50) {
    majorFailures.push('Premature health collapse before dynastic consolidation');
  }
  if (state.finances.loans.some(l => l.remainingBalance > 10000000)) {
    majorFailures.push('High leverage debt burdens carried into succession');
  }

  const lifeSummary = `${char.firstName} ${char.lastName} leaves behind an enduring mark on the world as ${scores.legacyTitle}. Rising through Generation ${state.dynastyGeneration}, their life encompassed landmark business deals, deep familial lineage, and immense societal influence.`;

  return {
    id: `legacy_rep_${Date.now()}`,
    characterName: `${char.firstName} ${char.lastName}`,
    generation: state.dynastyGeneration,
    ageAtDeath: char.age,
    birthYear: char.birthYear,
    deathYear: state.currentYear,
    yearsActive: char.age - 18,
    lifeSummary,
    financialLegacy: {
      peakNetWorth: peakNW,
      finalNetWorth: currentNW,
      lifetimePhilanthropy: state.lifetimePhilanthropy || 0,
      cashPassedOn: state.finances.cash,
      realEstateValue: state.finances.properties.reduce((acc, p) => acc + p.currentValue, 0),
      commentary: finCommentary
    },
    businessLegacy: {
      companiesFoundedOrLed: state.companies.length,
      totalCompanyValuation: totalCompVal,
      peakEmployees: totalEmployees,
      landmarkDeals: state.companies.map(c => `${c.name} (${c.industry}) - $${c.valuation.toLocaleString()}`),
      commentary: bizCommentary
    },
    politicalLegacy: {
      highestOfficeHeld: state.politics.currentOffice.title || 'Civic Leader',
      politicalCapitalAtPeak: state.politics.currentOffice.politicalCapital || 50,
      majorPoliciesEnacted: state.politics.pastOffices,
      partyInfluence: `${state.politics.parties.find(p => p.id === state.politics.selectedPartyId)?.name || 'Independent'} Patron`,
      commentary: polCommentary
    },
    familyLegacy: {
      spouseName: spouse?.name,
      childrenCount: children.length,
      householdHarmony: avgHarmony,
      heirAppointedName: primaryHeir?.name || 'Junior Family Branch',
      dynastyStabilityScore: state.dynastyProfile?.dynastyStability || 80,
      commentary: famCommentary
    },
    majorAchievements: majorAchievements.slice(0, 10),
    majorFailures: majorFailures.slice(0, 6),
    majorDecisions,
    reputation: char.attributes.reputation,
    worldInfluence: char.attributes.worldInfluence,
    scores,
    generatedAtTick: state.simulationTick
  };
}

/**
 * Executes Dynastic Succession, distributing assets, initializing the successor, and logging history.
 */
export function executeDynastySuccession(
  state: GameState, 
  customPlan?: DynastySuccessionPlan
): { nextState: GameState; legacyReport: LegacyReport; successionRecord: SuccessionHistoryRecord } {
  let s = ensureDynastyProfile(state);
  const plan = customPlan || s.dynastyProfile!.successionPlan || DEFAULT_SUCCESSION_PLAN;
  const legacyReport = generateLegacyReport(s);

  const predecessorName = `${s.character.firstName} ${s.character.lastName}`;
  const children = s.relationships.filter(r => r.relation === 'Son' || r.relation === 'Daughter');
  const primaryHeir = children.find(c => c.id === plan.primaryHeirId) || children[0];

  const dynamics = simulateSuccessionDynamics(s, plan);

  const totalCash = s.finances.cash;
  const heirCashShare = Math.round(totalCash * (plan.financialInheritance.primaryHeirPercent / 100));
  const otherChildrenCash = Math.round(totalCash * (plan.financialInheritance.otherChildrenPercent / 100));
  const philanthropyCash = Math.round(totalCash * (plan.financialInheritance.philanthropyPercent / 100));
  const trustReserveCash = Math.round(totalCash * (plan.financialInheritance.familyTrustReservePercent / 100));

  // Distribute other children cash
  const otherChildren = children.filter(c => c.id !== primaryHeir?.id);
  if (otherChildren.length > 0) {
    const perChild = Math.round(otherChildrenCash / otherChildren.length);
    otherChildren.forEach(c => {
      c.wealth = (c.wealth || 0) + perChild;
    });
  }

  // Adjust companies according to fragmentation risk
  let updatedCompanies = [...s.companies];
  if (dynamics.businessFragmentationRiskPercent > 0) {
    const factor = (100 - dynamics.businessFragmentationRiskPercent) / 100;
    updatedCompanies = updatedCompanies.map(c => ({
      ...c,
      valuation: Math.round(c.valuation * factor),
      sharePrice: Math.round(c.sharePrice * factor * 100) / 100,
      monthlyRevenue: Math.round(c.monthlyRevenue * factor)
    }));
  }

  // Adjust properties according to strategy
  let updatedProperties = [...s.finances.properties];
  if (plan.propertyStrategy === 'Liquidated into Cash Estate') {
    const propCash = updatedProperties.reduce((acc, p) => acc + p.currentValue, 0);
    updatedProperties = [];
    s.finances.cash += propCash;
  } else if (plan.propertyStrategy === 'Equally Distributed Among Children' && children.length > 1) {
    // Primary heir keeps top 50% properties, remainder gifted to other heirs
    const keepCount = Math.max(1, Math.ceil(updatedProperties.length / 2));
    updatedProperties = updatedProperties.slice(0, keepCount);
  }

  const successorName = primaryHeir ? primaryHeir.name : `Julian ${s.character.lastName}`;
  const successorAge = primaryHeir ? primaryHeir.age : 22;
  const successorGender = primaryHeir ? primaryHeir.gender : 'Male';

  // Inherited Attributes Calculation
  const successorAttributes = {
    health: primaryHeir?.health || 92,
    happiness: 85,
    intelligence: primaryHeir?.skills?.intellect || 84,
    charm: 78,
    stress: 15,
    reputation: Math.round(s.character.attributes.reputation * 0.75 + (primaryHeir?.loyalty || 70) * 0.1),
    attractiveness: 80,
    worldInfluence: Math.round(s.character.attributes.worldInfluence * 0.65)
  };

  const nextGenNumber = s.dynastyGeneration + 1;

  // Build Succession History Record
  const successionRecord: SuccessionHistoryRecord = {
    id: `succ_hist_${nextGenNumber}_${Date.now()}`,
    generation: nextGenNumber,
    predecessorName,
    successorName,
    month: s.currentMonth,
    year: s.currentYear,
    outcome: dynamics.outcome,
    dynastyWealth: calculateNetWorth(s),
    companiesTransferred: updatedCompanies.length,
    propertiesTransferred: updatedProperties.length,
    legacyScore: legacyReport.scores.totalLegacyScore,
    legacyGrade: legacyReport.scores.legacyGrade,
    details: [
      `Predecessor: ${predecessorName} (Legacy Grade: ${legacyReport.scores.legacyGrade}, Score: ${legacyReport.scores.totalLegacyScore})`,
      `Successor: ${successorName} (Generation ${nextGenNumber})`,
      `Outcome: ${dynamics.outcome} - ${dynamics.summaryExplanation}`,
      `Financial Split: ${plan.financialInheritance.primaryHeirPercent}% Heir / ${plan.financialInheritance.otherChildrenPercent}% Siblings / ${plan.financialInheritance.philanthropyPercent}% Charity`,
      ...(dynamics.contestedReasons.length > 0 ? dynamics.contestedReasons : [])
    ],
    rivalHeirConflict: dynamics.rivalHeirs.map(r => r.name).join(', ') || undefined,
    businessFragmentationRate: dynamics.businessFragmentationRiskPercent
  };

  // Construct Next Generation State
  const nextGenState: GameState = {
    ...s,
    character: {
      ...s.character,
      firstName: primaryHeir ? primaryHeir.name.split(' ')[0] : 'Julian',
      lastName: s.character.lastName,
      age: successorAge,
      gender: successorGender,
      birthMonth: s.currentMonth,
      birthYear: s.currentYear - successorAge,
      attributes: successorAttributes,
      creditScore: 780,
      socialFollowers: Math.round(s.character.socialFollowers * 0.6),
      lifeStage: successorAge >= 26 ? 'Adult' : 'Young Adult'
    },
    currentJob: null,
    careerHistory: [],
    dynastyGeneration: nextGenNumber,
    dynastyHeirId: null,
    finances: {
      ...s.finances,
      cash: heirCashShare + trustReserveCash,
      properties: updatedProperties
    },
    companies: updatedCompanies,
    relationships: [
      {
        id: `parent_late_${s.dynastyGeneration}`,
        name: `${predecessorName} (Late Patriarch/Matriarch)`,
        relation: s.character.gender === 'Female' ? 'Mother' : 'Father',
        age: s.character.age,
        gender: s.character.gender,
        wealth: 0,
        trust: 100,
        love: 100,
        respect: 100,
        loyalty: 100,
        influence: 95,
        occupation: `Founder - Generation ${s.dynastyGeneration}`,
        alive: false,
        avatarSeed: `patriarch_${s.dynastyGeneration}`
      },
      ...otherChildren.map(c => ({
        ...c,
        relation: c.gender === 'Female' ? 'Sister' as const : 'Brother' as const,
        trust: c.isRivalHeir ? 30 : Math.min(100, c.trust + 10),
        love: c.isRivalHeir ? 35 : Math.min(100, c.love + 5)
      }))
    ],
    peakNetWorth: undefined,
    lifetimePhilanthropy: 0,
    activeLegacyReport: legacyReport
  };

  // Update Dynasty Profile on nextGenState
  const updatedProfile: DynastyProfile = {
    ...nextGenState.dynastyProfile!,
    currentGeneration: nextGenNumber,
    successionHistory: [
      successionRecord,
      ...nextGenState.dynastyProfile!.successionHistory
    ],
    timeline: [
      {
        id: `dtl_succ_${nextGenNumber}_${Date.now()}`,
        month: s.currentMonth,
        year: s.currentYear,
        generation: nextGenNumber,
        characterName: successorName,
        category: 'SUCCESSION',
        title: `Dynastic Succession: Generation ${nextGenNumber} Takes the Helm`,
        description: `${successorName} succeeded ${predecessorName} as sovereign leader of the family line under a ${dynamics.outcome} outcome.`,
        significance: 'Historic',
        metricsChange: `Generation ${nextGenNumber} Begun`
      },
      ...nextGenState.dynastyProfile!.timeline
    ],
    successionPlan: {
      ...DEFAULT_SUCCESSION_PLAN,
      primaryHeirId: null
    }
  };

  nextGenState.dynastyProfile = updatedProfile;

  // Add life event feed entry
  nextGenState.eventsFeed = [
    {
      id: `ev_succ_${Date.now()}`,
      timestampMonth: s.currentMonth,
      timestampYear: s.currentYear,
      age: successorAge,
      category: 'Family',
      type: 'MILESTONE',
      title: `Dynastic Succession: Generation ${nextGenNumber}`,
      description: `${successorName} ascends to lead the ${s.character.lastName} dynasty following the passing of ${predecessorName}.`,
      consequences: {
        reputationChange: +10,
        details: [
          `Outcome: ${dynamics.outcome}`,
          `Inherited cash: $${(heirCashShare + trustReserveCash).toLocaleString()}`,
          `Inherited ${updatedCompanies.length} companies and ${updatedProperties.length} properties.`
        ]
      }
    },
    ...nextGenState.eventsFeed
  ];

  return {
    nextState: nextGenState,
    legacyReport,
    successionRecord
  };
}

export function updateDynastySuccessionPlan(state: GameState, plan: DynastySuccessionPlan): GameState {
  const ensuredState = ensureDynastyProfile(state);
  return {
    ...ensuredState,
    dynastyHeirId: plan.primaryHeirId || ensuredState.dynastyHeirId,
    dynastyProfile: {
      ...ensuredState.dynastyProfile!,
      successionPlan: {
        ...plan,
        lastUpdatedTick: state.simulationTick
      }
    }
  };
}
