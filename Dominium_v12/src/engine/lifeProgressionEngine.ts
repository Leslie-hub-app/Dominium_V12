import { 
  GameState, 
  LifeTier, 
  LifeTierChangeType, 
  LifeTierDefinition, 
  LifeTierHistoryEntry, 
  LifeProgressionProfile, 
  ProgressionScoreBreakdown, 
  LifeTierChangeResult, 
  PlayerPowerProfile, 
  SimulationEvent, 
  PendingDecision, 
  NewsItem 
} from '../types';
import { 
  LIFE_TIER_RANKS, 
  LIFE_TIER_ORDER, 
  LIFE_TIER_DEFINITIONS, 
  PROGRESSION_DOMAIN_WEIGHTS 
} from './lifeProgressionConfig';
import { calculateNetWorth } from './simulationEngine';

// Re-export constants for easy access
export { 
  LIFE_TIER_RANKS, 
  LIFE_TIER_ORDER, 
  LIFE_TIER_DEFINITIONS, 
  PROGRESSION_DOMAIN_WEIGHTS,
  PROGRESSION_DOMAIN_WEIGHTS as DOMAIN_WEIGHTS
};

// Utility helper to clamp numeric values
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Returns numeric rank (1-8) of a Life Tier.
 */
export function getLifeTierRank(tier: LifeTier): number {
  return LIFE_TIER_RANKS[tier] ?? 1;
}

/**
 * Returns centralized metadata definition for a Life Tier.
 */
export function getLifeTierDefinition(tier: LifeTier): LifeTierDefinition {
  return LIFE_TIER_DEFINITIONS[tier] || LIFE_TIER_DEFINITIONS.FOUNDATION;
}

/**
 * Returns the next higher Life Tier, or null if at maximum rank.
 */
export function getNextLifeTier(tier: LifeTier): LifeTier | null {
  const rank = getLifeTierRank(tier);
  if (rank >= 8) return null;
  return LIFE_TIER_ORDER[rank] || null;
}

/**
 * Checks if current life tier is at least minTier.
 */
export function isLifeTierAtLeast(currentTier: LifeTier, minTier: LifeTier): boolean {
  return getLifeTierRank(currentTier) >= getLifeTierRank(minTier);
}

/**
 * Checks if current life tier is at most maxTier.
 */
export function isLifeTierAtMost(currentTier: LifeTier, maxTier: LifeTier): boolean {
  return getLifeTierRank(currentTier) <= getLifeTierRank(maxTier);
}

/**
 * Returns all cumulative unlocked domain capabilities up to and including the given tier.
 */
export function getUnlockedDomainsForTier(tier: LifeTier): string[] {
  const targetRank = getLifeTierRank(tier);
  const domains = new Set<string>();
  for (let r = 1; r <= targetRank; r++) {
    const t = LIFE_TIER_ORDER[r - 1];
    const def = LIFE_TIER_DEFINITIONS[t];
    if (def && def.unlockedDomains) {
      def.unlockedDomains.forEach(d => domains.add(d));
    }
  }
  return Array.from(domains);
}

/**
 * Returns all cumulative unlocked actions up to and including the given tier.
 */
export function getUnlockedActionsForTier(tier: LifeTier): string[] {
  const targetRank = getLifeTierRank(tier);
  const actions = new Set<string>();
  for (let r = 1; r <= targetRank; r++) {
    const t = LIFE_TIER_ORDER[r - 1];
    const def = LIFE_TIER_DEFINITIONS[t];
    if (def && def.unlockedActions) {
      def.unlockedActions.forEach(a => actions.add(a));
    }
  }
  return Array.from(actions);
}

// ---------------------------------------------------------------------------
// 1. MULTI-DOMAIN PROGRESSION SCORING (10 AUTHORITATIVE DOMAINS)
// ---------------------------------------------------------------------------

/**
 * Calculates domain scores (0-100 each) deterministically from authoritative game state.
 */
export function calculateProgressionScores(state: GameState, powerProfile?: PlayerPowerProfile): ProgressionScoreBreakdown {
  const netWorth = calculateNetWorth(state);
  const totalCash = Math.max(0, state.finances.cash);
  const totalDebt = state.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0);
  const monthlySalary = state.currentJob ? state.currentJob.monthlySalary : 0;
  const monthlyExpenses = state.finances.monthlyBaseExpenses || 1500;
  const monthlyNetCashFlow = monthlySalary - monthlyExpenses;

  // DOMAIN 1: INDEPENDENCE (0 - 100)
  // Evaluates: positive cashflow, emergency savings runway, low debt pressure, living stability, health
  let independenceScore = 0;
  // 1a. Cash reserves / Emergency Runway (up to 40 pts)
  if (totalCash >= 100000) independenceScore += 40;
  else if (totalCash >= 30000) independenceScore += 30;
  else if (totalCash >= 10000) independenceScore += 20;
  else if (totalCash >= 3000) independenceScore += 10;
  else if (totalCash > 500) independenceScore += 5;

  // 1b. Positive Net Cashflow / Solvency (up to 30 pts)
  if (monthlyNetCashFlow >= 10000) independenceScore += 30;
  else if (monthlyNetCashFlow >= 3000) independenceScore += 25;
  else if (monthlyNetCashFlow >= 1000) independenceScore += 20;
  else if (monthlyNetCashFlow > 0) independenceScore += 12;

  // 1c. Debt Management (up to 15 pts)
  if (totalDebt === 0) independenceScore += 15;
  else if (totalDebt < totalCash) independenceScore += 10;
  else if (totalDebt < netWorth * 0.5) independenceScore += 5;

  // 1d. Credit score & Health stability (up to 15 pts)
  const creditScore = state.character.creditScore || 650;
  if (creditScore >= 750) independenceScore += 8;
  else if (creditScore >= 680) independenceScore += 5;

  if (state.character.attributes.health >= 70 && state.character.attributes.stress <= 60) {
    independenceScore += 7;
  }
  independenceScore = clamp(independenceScore, 0, 100);

  // DOMAIN 2: PROFESSIONAL DEVELOPMENT (0 - 100)
  // Evaluates: job title level, salary, education degree, career performance, experience
  let professionalScore = 0;
  if (state.currentJob) {
    const job = state.currentJob;
    switch (job.level) {
      case 'Intern': professionalScore += 10; break;
      case 'Junior': professionalScore += 20; break;
      case 'Professional': professionalScore += 35; break;
      case 'Senior': professionalScore += 50; break;
      case 'Specialist': professionalScore += 60; break;
      case 'Manager': professionalScore += 70; break;
      case 'Director': professionalScore += 80; break;
      case 'Executive': professionalScore += 90; break;
      case 'Industry Leader': professionalScore += 100; break;
    }
    // Performance and bonus potential
    if (job.performance >= 85) professionalScore += 10;
    else if (job.performance >= 70) professionalScore += 5;
  } else {
    // Check career history
    if (state.careerHistory && state.careerHistory.length > 0) {
      professionalScore += Math.min(40, state.careerHistory.length * 10);
    }
  }

  // Education bonus
  const completedEdu = state.education.filter(e => e.completed);
  for (const edu of completedEdu) {
    if (edu.qualification === 'PhD') professionalScore += 25;
    else if (edu.qualification === 'Master') professionalScore += 18;
    else if (edu.qualification === 'Bachelor') professionalScore += 12;
    else if (edu.qualification === 'Professional Certification') professionalScore += 8;
  }
  professionalScore = clamp(professionalScore, 0, 100);

  // DOMAIN 3: OWNERSHIP (0 - 100)
  // Evaluates: operating businesses, equity valuation, property holdings, stock assets
  let ownershipScore = 0;
  const ownedCompanies = state.companies.filter(c => c.playerOwnershipPercentage > 0);
  const totalControlledCompanyVal = ownedCompanies.reduce((acc, c) => acc + (c.valuation * (c.playerOwnershipPercentage / 100)), 0);
  const totalPropertyValue = state.finances.properties.reduce((acc, p) => acc + p.currentValue, 0);
  const totalStockValue = state.finances.stocks.reduce((acc, s) => acc + (s.sharesOwned * s.currentPrice), 0);

  // Company ownership points (up to 50 pts)
  if (totalControlledCompanyVal >= 100000000) ownershipScore += 50;
  else if (totalControlledCompanyVal >= 20000000) ownershipScore += 42;
  else if (totalControlledCompanyVal >= 5000000) ownershipScore += 35;
  else if (totalControlledCompanyVal >= 1000000) ownershipScore += 25;
  else if (totalControlledCompanyVal >= 200000) ownershipScore += 15;
  else if (ownedCompanies.length > 0) ownershipScore += 8;

  // Real estate property ownership (up to 30 pts)
  if (totalPropertyValue >= 25000000) ownershipScore += 30;
  else if (totalPropertyValue >= 5000000) ownershipScore += 22;
  else if (totalPropertyValue >= 1000000) ownershipScore += 15;
  else if (totalPropertyValue >= 300000) ownershipScore += 8;

  // Stock portfolio (up to 20 pts)
  if (totalStockValue >= 10000000) ownershipScore += 20;
  else if (totalStockValue >= 1000000) ownershipScore += 14;
  else if (totalStockValue >= 100000) ownershipScore += 8;
  else if (totalStockValue > 5000) ownershipScore += 3;

  ownershipScore = clamp(ownershipScore, 0, 100);

  // DOMAIN 4: ECONOMIC POWER (0 - 100)
  // Reuses Power Profile netWorthScore or calculates from real net worth & recurring cashflow
  let economicPowerScore = 0;
  if (powerProfile && powerProfile.breakdown) {
    // Map Power Profile netWorthScore (0-600) to 0-100
    economicPowerScore = Math.floor((powerProfile.breakdown.netWorthScore / 600) * 100);
  } else {
    if (netWorth >= 1000000000) economicPowerScore = 100;
    else if (netWorth >= 100000000) economicPowerScore = 85;
    else if (netWorth >= 20000000) economicPowerScore = 70;
    else if (netWorth >= 5000000) economicPowerScore = 55;
    else if (netWorth >= 1000000) economicPowerScore = 40;
    else if (netWorth >= 250000) economicPowerScore = 25;
    else if (netWorth >= 50000) economicPowerScore = 12;
    else if (netWorth > 0) economicPowerScore = 5;
  }
  economicPowerScore = clamp(economicPowerScore, 0, 100);

  // DOMAIN 5: SOCIAL INFLUENCE (0 - 100)
  // Evaluates: reputation, charm, social followers, social media accounts, celebrity presence
  let socialInfluenceScore = 0;
  const attrs = state.character.attributes;
  socialInfluenceScore += Math.floor((attrs.reputation / 100) * 40);
  socialInfluenceScore += Math.floor((attrs.charm / 100) * 20);

  const followers = state.character.socialFollowers || 0;
  if (followers >= 10000000) socialInfluenceScore += 30;
  else if (followers >= 1000000) socialInfluenceScore += 22;
  else if (followers >= 100000) socialInfluenceScore += 14;
  else if (followers >= 10000) socialInfluenceScore += 7;

  if (state.lifeSystem?.socialAccounts) {
    const hasMonetized = Object.values(state.lifeSystem.socialAccounts).some(acc => acc.monetized || acc.verified);
    if (hasMonetized) socialInfluenceScore += 10;
  }
  socialInfluenceScore = clamp(socialInfluenceScore, 0, 100);

  // DOMAIN 6: POLITICAL POWER (0 - 100)
  // Evaluates: political office rank, approval, capital, past offices
  let politicalPowerScore = 0;
  const office = state.politics.currentOffice;
  if (office) {
    switch (office.title) {
      case 'Citizen': politicalPowerScore += 0; break;
      case 'Party Member': politicalPowerScore += 10; break;
      case 'Campaign Candidate': politicalPowerScore += 20; break;
      case 'City Councillor': politicalPowerScore += 45; break;
      case 'Mayor': politicalPowerScore += 65; break;
      case 'Member of Parliament': politicalPowerScore += 78; break;
      case 'Cabinet Minister': politicalPowerScore += 88; break;
      case 'Party Leader': politicalPowerScore += 92; break;
      case 'President / Prime Minister': politicalPowerScore += 100; break;
    }
    if (office.inOffice) {
      politicalPowerScore += Math.floor((office.approvalRating / 100) * 10);
      politicalPowerScore += Math.floor((office.politicalCapital / 100) * 8);
    }
  }
  if (state.politics.pastOffices && state.politics.pastOffices.length > 0) {
    politicalPowerScore += Math.min(20, state.politics.pastOffices.length * 5);
  }
  politicalPowerScore = clamp(politicalPowerScore, 0, 100);

  // DOMAIN 7: INSTITUTIONAL POWER (0 - 100)
  // Evaluates: public companies, monumental megaprojects, sports franchises, total employee base
  let institutionalPowerScore = 0;
  const totalEmployees = ownedCompanies.reduce((acc, c) => acc + c.employeesCount, 0);
  if (totalEmployees >= 5000) institutionalPowerScore += 35;
  else if (totalEmployees >= 1000) institutionalPowerScore += 28;
  else if (totalEmployees >= 200) institutionalPowerScore += 20;
  else if (totalEmployees >= 30) institutionalPowerScore += 12;
  else if (totalEmployees > 0) institutionalPowerScore += 5;

  const hasPublic = ownedCompanies.some(c => c.isPublic);
  if (hasPublic) institutionalPowerScore += 20;

  const completedProjects = state.projects.filter(p => p.completed);
  institutionalPowerScore += Math.min(30, completedProjects.length * 8);

  const sportsTeams = state.sports.ownedTeams || [];
  institutionalPowerScore += Math.min(20, sportsTeams.length * 10);

  institutionalPowerScore = clamp(institutionalPowerScore, 0, 100);

  // DOMAIN 8: GLOBAL INFLUENCE (0 - 100)
  // Evaluates: worldInfluence attribute, international multi-country presence, multinational companies
  let globalInfluenceScore = 0;
  globalInfluenceScore += Math.floor(((attrs.worldInfluence || 0) / 100) * 55);

  const distinctCountries = new Set([
    ...ownedCompanies.map(c => c.country).filter(Boolean),
    ...state.finances.properties.map(p => p.country).filter(Boolean),
    state.character.residenceCountry
  ]);
  if (distinctCountries.size >= 4) globalInfluenceScore += 30;
  else if (distinctCountries.size >= 2) globalInfluenceScore += 18;

  if (powerProfile && (powerProfile.powerTier === 'GLOBAL' || powerProfile.powerTier === 'POWERFUL')) {
    globalInfluenceScore += 20;
  }
  globalInfluenceScore = clamp(globalInfluenceScore, 0, 100);

  // DOMAIN 9: RESPONSIBILITY (0 - 100)
  // Evaluates: employees dependent on player, family dependents/children, companies managed, charity foundations
  let responsibilityScore = 0;
  if (totalEmployees >= 2000) responsibilityScore += 40;
  else if (totalEmployees >= 200) responsibilityScore += 30;
  else if (totalEmployees >= 20) responsibilityScore += 20;
  else if (totalEmployees > 0) responsibilityScore += 10;

  // Family responsibility (children + spouse)
  const children = state.relationships.filter(r => r.relation === 'Son' || r.relation === 'Daughter');
  const hasSpouse = state.relationships.some(r => r.relation === 'Spouse' || r.relation === 'Partner');
  if (children.length > 0) responsibilityScore += Math.min(25, children.length * 8);
  if (hasSpouse) responsibilityScore += 8;

  // Civic responsibility & charity projects
  const charityProjects = state.projects.filter(p => p.type === 'Charity Foundation' && p.completed);
  if (charityProjects.length > 0) responsibilityScore += 15;

  if (state.politics.currentOffice.inOffice) responsibilityScore += 15;

  responsibilityScore = clamp(responsibilityScore, 0, 100);

  // DOMAIN 10: LEGACY (0 - 100)
  // Evaluates: dynasty profile, heirs appointed, generational wealth, family harmony, lifetime philanthropy
  let legacyScore = 0;
  if (state.dynastyProfile) {
    const dp = state.dynastyProfile;
    if (dp.currentGeneration >= 3) legacyScore += 35;
    else if (dp.currentGeneration >= 2) legacyScore += 25;
    else legacyScore += 15;

    if (dp.dynastyStability >= 75) legacyScore += 15;
    else if (dp.dynastyStability >= 50) legacyScore += 10;

    if (dp.successionPlan?.primaryHeirId) legacyScore += 15;
    if (dp.timeline && dp.timeline.length > 0) {
      legacyScore += Math.min(15, dp.timeline.length * 3);
    }
  }

  const lifetimeDonated = state.lifetimePhilanthropy || 0;
  if (lifetimeDonated >= 25000000) legacyScore += 20;
  else if (lifetimeDonated >= 5000000) legacyScore += 14;
  else if (lifetimeDonated >= 500000) legacyScore += 8;
  else if (lifetimeDonated > 0) legacyScore += 3;

  legacyScore = clamp(legacyScore, 0, 100);

  return {
    independenceScore,
    professionalScore,
    ownershipScore,
    economicPowerScore,
    socialInfluenceScore,
    politicalPowerScore,
    institutionalPowerScore,
    globalInfluenceScore,
    responsibilityScore,
    legacyScore
  };
}

export const calculateDomainScores = calculateProgressionScores;

/**
 * Calculates overall progression score (0 - 1000) from the 10 domain scores.
 */
export function calculateOverallProgressionScore(breakdown: ProgressionScoreBreakdown): number {
  const total = 
    breakdown.independenceScore * PROGRESSION_DOMAIN_WEIGHTS.independence +
    breakdown.professionalScore * PROGRESSION_DOMAIN_WEIGHTS.professional +
    breakdown.ownershipScore * PROGRESSION_DOMAIN_WEIGHTS.ownership +
    breakdown.economicPowerScore * PROGRESSION_DOMAIN_WEIGHTS.economicPower +
    breakdown.socialInfluenceScore * PROGRESSION_DOMAIN_WEIGHTS.socialInfluence +
    breakdown.politicalPowerScore * PROGRESSION_DOMAIN_WEIGHTS.politicalPower +
    breakdown.institutionalPowerScore * PROGRESSION_DOMAIN_WEIGHTS.institutionalPower +
    breakdown.globalInfluenceScore * PROGRESSION_DOMAIN_WEIGHTS.globalInfluence +
    breakdown.responsibilityScore * PROGRESSION_DOMAIN_WEIGHTS.responsibility +
    breakdown.legacyScore * PROGRESSION_DOMAIN_WEIGHTS.legacy;

  return clamp(Math.round(total), 0, 1000);
}

// ---------------------------------------------------------------------------
// 2. DECLARATIVE TIER EVALUATION & MULTI-PATH QUALIFICATION
// ---------------------------------------------------------------------------

export interface TierEvaluationResult {
  highestEligibleTier: LifeTier;
  qualifyingReasons: string[];
  allQualifyingTiers: LifeTier[];
}

/**
 * Evaluates whether the player qualifies for each tier based on overall score AND multi-path criteria.
 */
export function evaluateTierEligibility(
  state: GameState, 
  scores: ProgressionScoreBreakdown, 
  overallScore: number
): TierEvaluationResult {
  const netWorth = calculateNetWorth(state);
  const totalCash = Math.max(0, state.finances.cash);
  const ownedCompanies = state.companies.filter(c => c.playerOwnershipPercentage > 0);
  const totalControlledVal = ownedCompanies.reduce((acc, c) => acc + (c.valuation * (c.playerOwnershipPercentage / 100)), 0);
  const totalHeadcount = ownedCompanies.reduce((acc, c) => acc + c.employeesCount, 0);
  const office = state.politics.currentOffice;
  const isHeadOfState = office.inOffice && (office.title.includes('President') || office.title.includes('Prime Minister'));

  const qualifyingTiers: LifeTier[] = ['FOUNDATION'];
  const reasonsByTier: Record<LifeTier, string[]> = {
    FOUNDATION: ['Formative baseline personal development tier.'],
    INDEPENDENCE: [],
    PROFESSIONAL_BUILDER: [],
    ENTREPRENEUR_OWNER: [],
    TYCOON: [],
    POWER_INFLUENCE: [],
    NATIONAL_GLOBAL_POWER: [],
    LEGACY_DYNASTY: []
  };

  // TIER 2: INDEPENDENCE (Overall Score >= 120 + Path)
  if (overallScore >= LIFE_TIER_DEFINITIONS.INDEPENDENCE.promotionRequirements.minOverallScore) {
    const paths: string[] = [];
    if (scores.independenceScore >= 35) paths.push('Demonstrated strong monthly financial solvency and positive cashflow');
    if (totalCash >= 15000) paths.push(`Built $${totalCash.toLocaleString()} liquid savings reserve`);
    if (state.currentJob && state.currentJob.monthlySalary >= state.finances.monthlyBaseExpenses) {
      paths.push(`Earns steady employment income as ${state.currentJob.title}`);
    }
    if (ownedCompanies.length > 0) paths.push('Maintains operating self-employment or enterprise cashflow');

    if (paths.length > 0) {
      qualifyingTiers.push('INDEPENDENCE');
      reasonsByTier.INDEPENDENCE = paths;
    }
  }

  // TIER 3: PROFESSIONAL_BUILDER (Overall Score >= 260 + Path)
  if (overallScore >= LIFE_TIER_DEFINITIONS.PROFESSIONAL_BUILDER.promotionRequirements.minOverallScore) {
    const paths: string[] = [];
    if (scores.professionalScore >= 45) {
      paths.push(`Advanced to senior professional craft mastery (${state.currentJob?.level || 'Specialist'})`);
    }
    if (netWorth >= 250000 || state.finances.properties.length > 0) {
      paths.push(`Built $${Math.round(netWorth).toLocaleString()} net worth with property/equity assets`);
    }
    if (scores.socialInfluenceScore >= 40 || scores.ownershipScore >= 30) {
      paths.push('Established recognized reputation and initial commercial assets');
    }

    if (paths.length > 0) {
      qualifyingTiers.push('PROFESSIONAL_BUILDER');
      reasonsByTier.PROFESSIONAL_BUILDER = paths;
    }
  }

  // TIER 4: ENTREPRENEUR_OWNER (Overall Score >= 420 + Path)
  if (overallScore >= LIFE_TIER_DEFINITIONS.ENTREPRENEUR_OWNER.promotionRequirements.minOverallScore) {
    const paths: string[] = [];
    if (ownedCompanies.length > 0 && (totalControlledVal >= 500000 || totalHeadcount >= 5)) {
      paths.push(`Owns and directs operating enterprise (${ownedCompanies[0].name}) with $${Math.round(totalControlledVal).toLocaleString()} equity`);
    }
    if (scores.ownershipScore >= 45 || totalControlledVal >= 1500000) {
      paths.push(`Commands substantial commercial assets and business equity ($${Math.round(totalControlledVal).toLocaleString()})`);
    }
    if (state.currentJob && (state.currentJob.level === 'Director' || state.currentJob.level === 'Executive' || state.currentJob.level === 'Industry Leader')) {
      paths.push(`Commands organizational executive leadership as ${state.currentJob.title}`);
    }

    if (paths.length > 0) {
      qualifyingTiers.push('ENTREPRENEUR_OWNER');
      reasonsByTier.ENTREPRENEUR_OWNER = paths;
    }
  }

  // TIER 5: TYCOON (Overall Score >= 600 + Path)
  if (overallScore >= LIFE_TIER_DEFINITIONS.TYCOON.promotionRequirements.minOverallScore) {
    const paths: string[] = [];
    if (ownedCompanies.length >= 2 || totalControlledVal >= 15000000 || totalHeadcount >= 50) {
      paths.push(`Commands multi-enterprise conglomerate scale (${ownedCompanies.length} companies, ${totalHeadcount} employees)`);
    }
    if (netWorth >= 20000000) {
      paths.push(`Attained $${(netWorth / 1000000).toFixed(1)}M wealth with diversified asset holdings`);
    }
    if (state.projects.some(p => p.completed) || (state.sports.ownedTeams || []).length > 0) {
      paths.push('Completed major institutional megaprojects or sports franchise ownership');
    }

    if (paths.length > 0) {
      qualifyingTiers.push('TYCOON');
      reasonsByTier.TYCOON = paths;
    }
  }

  // TIER 6: POWER_INFLUENCE (Overall Score >= 760 + Path)
  if (overallScore >= LIFE_TIER_DEFINITIONS.POWER_INFLUENCE.promotionRequirements.minOverallScore) {
    const paths: string[] = [];
    if (office.inOffice && office.title !== 'Citizen' && office.title !== 'Party Member') {
      paths.push(`Holds high elected public office as ${office.title}`);
    }
    if (netWorth >= 50000000 && scores.economicPowerScore >= 60) {
      paths.push(`Wields major economic leverage ($${(netWorth / 1000000).toFixed(1)}M net worth)`);
    }
    if (scores.socialInfluenceScore >= 65 || (state.lifetimePhilanthropy || 0) >= 5000000) {
      paths.push('Commands prominent public voice, high civic reputation, and major philanthropic impact');
    }

    if (paths.length > 0) {
      qualifyingTiers.push('POWER_INFLUENCE');
      reasonsByTier.POWER_INFLUENCE = paths;
    }
  }

  // TIER 7: NATIONAL_GLOBAL_POWER (Overall Score >= 880 + Path)
  if (overallScore >= LIFE_TIER_DEFINITIONS.NATIONAL_GLOBAL_POWER.promotionRequirements.minOverallScore) {
    const paths: string[] = [];
    if (isHeadOfState || office.title === 'Party Leader') {
      paths.push(`Commands sovereign state mandate as ${office.title}`);
    }
    if (netWorth >= 250000000 && scores.globalInfluenceScore >= 60) {
      paths.push(`Commands global-scale capital ($${(netWorth / 1000000).toFixed(1)}M) and multinational reach`);
    }
    if (scores.institutionalPowerScore >= 75 && scores.globalInfluenceScore >= 65) {
      paths.push('Commands multinational conglomerate institutions across multiple world jurisdictions');
    }

    if (paths.length > 0) {
      qualifyingTiers.push('NATIONAL_GLOBAL_POWER');
      reasonsByTier.NATIONAL_GLOBAL_POWER = paths;
    }
  }

  // TIER 8: LEGACY_DYNASTY (Overall Score >= 940 + Path)
  if (overallScore >= LIFE_TIER_DEFINITIONS.LEGACY_DYNASTY.promotionRequirements.minOverallScore) {
    const paths: string[] = [];
    if (state.dynastyProfile && state.dynastyProfile.successionPlan?.primaryHeirId && state.dynastyProfile.dynastyStability >= 50) {
      paths.push(`Secured multi-generational dynasty continuity with designated heir and family stability (${state.dynastyProfile.dynastyStability}%)`);
    }
    if ((state.dynastyProfile?.dynastyWealth || netWorth) >= 100000000 && ownedCompanies.length >= 3) {
      paths.push('Established perpetual family enterprise holding structures with $100M+ generational assets');
    }
    if ((state.lifetimePhilanthropy || 0) >= 25000000 && state.character.attributes.reputation >= 80) {
      paths.push('Endowed historic philanthropic foundations establishing an indelible generational legacy');
    }

    if (paths.length > 0) {
      qualifyingTiers.push('LEGACY_DYNASTY');
      reasonsByTier.LEGACY_DYNASTY = paths;
    }
  }

  // Determine highest eligible tier
  let highestTier: LifeTier = 'FOUNDATION';
  for (const t of LIFE_TIER_ORDER) {
    if (qualifyingTiers.includes(t)) {
      highestTier = t;
    }
  }

  return {
    highestEligibleTier: highestTier,
    qualifyingReasons: reasonsByTier[highestTier] || ['Baseline qualification met.'],
    allQualifyingTiers: qualifyingTiers
  };
}

/**
 * Calculates progress percentage toward next tier.
 */
export function calculateProgressToNextTier(currentTier: LifeTier, overallScore: number): {
  progressPercent: number;
  nextTier: LifeTier | null;
  pointsToNextTier: number;
} {
  const currentRank = getLifeTierRank(currentTier);
  if (currentRank >= 8) {
    return {
      progressPercent: 100,
      nextTier: null,
      pointsToNextTier: 0
    };
  }

  const nextTier = LIFE_TIER_ORDER[currentRank];
  const currentDef = LIFE_TIER_DEFINITIONS[currentTier];
  const nextDef = LIFE_TIER_DEFINITIONS[nextTier];

  const currentFloor = currentDef.promotionRequirements.minOverallScore;
  const nextTarget = nextDef.promotionRequirements.minOverallScore;
  const span = Math.max(1, nextTarget - currentFloor);
  const currentProgress = overallScore - currentFloor;

  const progressPercent = clamp(Math.floor((currentProgress / span) * 100), 0, 100);
  const pointsToNextTier = Math.max(0, nextTarget - overallScore);

  return {
    progressPercent,
    nextTier,
    pointsToNextTier
  };
}

// ---------------------------------------------------------------------------
// 3. AUTHORITATIVE PROFILE EVALUATION & TRANSITION ENGINE
// ---------------------------------------------------------------------------

/**
 * Authoritatively evaluates Life Progression profile and detects tier transitions during simulation.
 */
export function evaluateLifeProgression(
  prevState: GameState,
  currentState: GameState,
  powerProfile?: PlayerPowerProfile,
  allowMultiTierJump: boolean = false
): { updatedProfile: LifeProgressionProfile; changeResult: LifeTierChangeResult } {
  // 1. Calculate real domain scores & overall score
  const scores = calculateProgressionScores(currentState, powerProfile);
  const overallScore = calculateOverallProgressionScore(scores);

  // 2. Retrieve previous progression profile
  const prevProfile = prevState.lifeProgression || initializeProgressionProfile(prevState);
  const previousTier = prevProfile.currentTier;
  const prevRank = getLifeTierRank(previousTier);
  let highestTierAchieved = prevProfile.highestTierAchieved || previousTier;
  if (getLifeTierRank(highestTierAchieved) < prevRank) {
    highestTierAchieved = previousTier;
  }

  // 3. Evaluate eligibility
  const { highestEligibleTier, qualifyingReasons } = evaluateTierEligibility(currentState, scores, overallScore);
  const eligibleRank = getLifeTierRank(highestEligibleTier);

  let newTier = previousTier;
  let changeType: LifeTierChangeType | null = null;
  let transitionReasons: string[] = [];
  let monthsBelowMaintenance = prevProfile.monthsBelowMaintenance || 0;
  let isUnstable = false;
  const instabilityWarnings: string[] = [];

  const currentDef = LIFE_TIER_DEFINITIONS[previousTier];
  const maintenanceThreshold = currentDef.maintenanceRequirements.minOverallScore;
  const gracePeriod = currentDef.maintenanceRequirements.gracePeriodMonths;

  // A. PROMOTION / RESTORATION EVALUATION
  if (eligibleRank > prevRank) {
    if (allowMultiTierJump) {
      newTier = highestEligibleTier;
    } else {
      // Normal simulation: One-tier-per-month step
      newTier = LIFE_TIER_ORDER[prevRank]; // Step up by 1 rank
    }

    const newRank = getLifeTierRank(newTier);
    if (newRank > getLifeTierRank(highestTierAchieved)) {
      highestTierAchieved = newTier;
      changeType = 'PROMOTION';
    } else {
      changeType = 'RESTORATION';
    }

    transitionReasons = qualifyingReasons;
    monthsBelowMaintenance = 0;
    isUnstable = false;
  } 
  // B. MAINTENANCE & REGRESSION EVALUATION
  else {
    // Check if player satisfies maintenance requirement of current tier
    if (overallScore >= maintenanceThreshold) {
      // Stable in current tier
      monthsBelowMaintenance = 0;
      isUnstable = false;
    } else {
      // Below maintenance threshold
      monthsBelowMaintenance += 1;
      isUnstable = true;
      const monthsRemainingInGrace = Math.max(0, gracePeriod - monthsBelowMaintenance);

      if (monthsBelowMaintenance <= gracePeriod) {
        // Still within grace period: remain in tier with instability warning
        newTier = previousTier;
        instabilityWarnings.push(
          `Tier Instability Warning: Progression score (${overallScore} pts) is below ${currentDef.displayName} maintenance threshold (${maintenanceThreshold} pts). ${monthsRemainingInGrace} month(s) remaining in grace period before regression.`
        );
      } else {
        // Grace period expired: REGRESS
        newTier = highestEligibleTier;
        changeType = 'REGRESSION';
        transitionReasons = [
          `Sustained decline below ${currentDef.displayName} maintenance threshold for ${monthsBelowMaintenance} consecutive months.`,
          `Current overall score: ${overallScore} pts (required: ${maintenanceThreshold} pts).`,
          'Operating scale has contracted while historical highest tier remains permanently recorded.'
        ];
        monthsBelowMaintenance = 0;
        isUnstable = false;
      }
    }
  }

  const isChanged = newTier !== previousTier;
  const newRank = getLifeTierRank(newTier);
  const newDef = LIFE_TIER_DEFINITIONS[newTier];

  // 4. Update Tier History if changed
  const tierHistory = [...(prevProfile.tierHistory || [])];
  if (isChanged && changeType) {
    const historyEntry: LifeTierHistoryEntry = {
      id: `lth_${currentState.simulationTick}_${Date.now()}`,
      tier: newTier,
      previousTier: previousTier,
      simulationTick: currentState.simulationTick,
      month: currentState.currentMonth,
      year: currentState.currentYear,
      age: currentState.character.age,
      changeType: changeType,
      reason: transitionReasons[0] || `${changeType} to ${newDef.displayName}`,
      summary: `${changeType === 'PROMOTION' ? 'Promoted' : changeType === 'RESTORATION' ? 'Restored' : 'Regressed'} to ${newDef.displayName} (Tier ${newRank} of 8).`,
      scoresSnapshot: { ...scores },
      overallScoreSnapshot: overallScore
    };
    tierHistory.unshift(historyEntry);
  }

  // 5. Progress to next tier calculations
  const { progressPercent, nextTier, pointsToNextTier } = calculateProgressToNextTier(newTier, overallScore);
  const unlockedDomains = getUnlockedDomainsForTier(newTier);
  const unlockedActions = getUnlockedActionsForTier(newTier);

  // 6. Build updated profile
  const updatedProfile: LifeProgressionProfile = {
    currentTier: newTier,
    highestTierAchieved,
    currentTierSince: isChanged ? {
      month: currentState.currentMonth,
      year: currentState.currentYear,
      simulationTick: currentState.simulationTick
    } : (prevProfile.currentTierSince || {
      month: currentState.currentMonth,
      year: currentState.currentYear,
      simulationTick: currentState.simulationTick
    }),
    tierRank: newRank,
    tierHistory: tierHistory.slice(0, 50),
    scores,
    overallProgressionScore: overallScore,
    progressToNextTier: progressPercent,
    nextTier,
    pointsToNextTier,
    promotionReasons: changeType === 'PROMOTION' || changeType === 'RESTORATION' ? transitionReasons : prevProfile.promotionReasons || [],
    regressionReasons: changeType === 'REGRESSION' ? transitionReasons : [],
    instabilityWarnings,
    monthsBelowMaintenance,
    isUnstable,
    unlockedDomains,
    unlockedActions
  };

  // 7. Generate milestone Event & News if tier changed
  let milestoneEvent: SimulationEvent | undefined;
  let milestoneNews: NewsItem | undefined;

  if (isChanged && changeType) {
    const isPromo = changeType === 'PROMOTION' || changeType === 'RESTORATION';
    milestoneEvent = {
      id: `ev_life_tier_${currentState.simulationTick}`,
      timestampMonth: currentState.currentMonth,
      timestampYear: currentState.currentYear,
      age: currentState.character.age,
      category: 'Life',
      type: isPromo ? 'MILESTONE' : 'WARNING',
      title: isPromo 
        ? `🌟 Life Milestone: Reached ${newDef.displayName} (Tier ${newRank}/8)`
        : `⚠️ Life Tier Shift: Adjusted to ${newDef.displayName} (Tier ${newRank}/8)`,
      description: isPromo
        ? `Your real-life simulated achievements, career, assets, and influence have elevated you to ${newDef.displayName}. ${transitionReasons.join(' ')}`
        : `Your simulated operational scale and resources have adjusted to ${newDef.displayName}. Your historical peak of ${LIFE_TIER_DEFINITIONS[highestTierAchieved].displayName} remains permanently recorded.`,
      severity: isPromo ? 'High' : 'Medium',
      consequences: {
        happinessChange: isPromo ? +12 : -6,
        reputationChange: isPromo ? +8 : -3,
        worldInfluenceChange: isPromo ? +6 : -2,
        details: [
          `New Life Tier: ${newDef.displayName} (Rank ${newRank}/8)`,
          `Overall Progression Score: ${overallScore} / 1000 pts`,
          `Unlocked Focus Areas: ${newDef.focusAreas.slice(0, 3).join('; ')}`
        ]
      }
    };

    milestoneNews = {
      id: `news_life_tier_${currentState.simulationTick}`,
      month: currentState.currentMonth,
      year: currentState.currentYear,
      headline: `${currentState.character.firstName} ${currentState.character.lastName} ${isPromo ? 'Reaches' : 'Adjusts to'} ${newDef.displayName} Tier`,
      body: `Biographical chronicles and industry watchers document an evolving life scale for ${currentState.character.firstName} ${currentState.character.lastName}, reflecting a progression score of ${overallScore} points.`,
      category: 'Life',
      importance: newRank >= 6 ? 'MAJOR' : 'NORMAL',
      severity: isPromo ? 'Positive' : 'Warning',
      impactExplanation: `Life Progression tier transitioned to ${newDef.displayName} (${newRank}/8).`,
      source: 'National Biographical Record',
      tags: ['LifeTier', newTier, 'Milestone']
    };
  }

  return {
    updatedProfile,
    changeResult: {
      changed: isChanged,
      changeType,
      previousTier,
      currentTier: newTier,
      reasons: transitionReasons,
      unlockedDomains,
      unlockedActions,
      event: milestoneEvent,
      news: milestoneNews
    }
  };
}

// ---------------------------------------------------------------------------
// 4. INITIALIZATION & SAVE MIGRATION (IDEMPOTENT & DEFENSIVE)
// ---------------------------------------------------------------------------

/**
 * Initializes a clean LifeProgressionProfile for a new game or scenario.
 */
export function initializeProgressionProfile(
  state: GameState, 
  explicitStartingTier?: LifeTier
): LifeProgressionProfile {
  const scores = calculateProgressionScores(state, state.playerPowerProfile);
  const overallScore = calculateOverallProgressionScore(scores);

  let startTier: LifeTier = explicitStartingTier || 'FOUNDATION';
  if (!explicitStartingTier) {
    const { highestEligibleTier } = evaluateTierEligibility(state, scores, overallScore);
    startTier = highestEligibleTier;
  }

  const rank = getLifeTierRank(startTier);
  const def = LIFE_TIER_DEFINITIONS[startTier];
  const { progressPercent, nextTier, pointsToNextTier } = calculateProgressToNextTier(startTier, overallScore);

  const initialHistory: LifeTierHistoryEntry = {
    id: `lth_init_${state.simulationTick || 0}`,
    tier: startTier,
    previousTier: null,
    simulationTick: state.simulationTick || 0,
    month: state.currentMonth || 1,
    year: state.currentYear || 2026,
    age: state.character.age || 18,
    changeType: 'INITIAL',
    reason: `Initial Life Tier established as ${def.displayName}.`,
    summary: `Embarked upon life journey as ${def.displayName} (Tier ${rank} of 8).`,
    scoresSnapshot: { ...scores },
    overallScoreSnapshot: overallScore
  };

  return {
    currentTier: startTier,
    highestTierAchieved: startTier,
    currentTierSince: {
      month: state.currentMonth || 1,
      year: state.currentYear || 2026,
      simulationTick: state.simulationTick || 0
    },
    tierRank: rank,
    tierHistory: [initialHistory],
    scores,
    overallProgressionScore: overallScore,
    progressToNextTier: progressPercent,
    nextTier,
    pointsToNextTier,
    promotionReasons: [`Initialized at ${def.displayName}`],
    regressionReasons: [],
    instabilityWarnings: [],
    monthsBelowMaintenance: 0,
    isUnstable: false,
    unlockedDomains: getUnlockedDomainsForTier(startTier),
    unlockedActions: getUnlockedActionsForTier(startTier)
  };
}

/**
 * Migrates existing saves missing lifeProgression without resetting advanced players to FOUNDATION.
 * Idempotent: safe to run multiple times.
 */
export function migrateProgressionProfile(state: GameState): LifeProgressionProfile {
  // If already exists and valid, return it defensively
  if (state.lifeProgression && state.lifeProgression.currentTier && Array.isArray(state.lifeProgression.tierHistory)) {
    const currentTier = state.lifeProgression.currentTier;
    const scores = state.lifeProgression.scores || calculateProgressionScores(state, state.playerPowerProfile);
    const overallScore = state.lifeProgression.overallProgressionScore ?? calculateOverallProgressionScore(scores);
    const { progressPercent, nextTier, pointsToNextTier } = calculateProgressToNextTier(currentTier, overallScore);

    return {
      ...state.lifeProgression,
      tierRank: getLifeTierRank(currentTier),
      highestTierAchieved: state.lifeProgression.highestTierAchieved || currentTier,
      scores,
      overallProgressionScore: overallScore,
      progressToNextTier: progressPercent,
      nextTier,
      pointsToNextTier,
      unlockedDomains: state.lifeProgression.unlockedDomains || getUnlockedDomainsForTier(currentTier),
      unlockedActions: state.lifeProgression.unlockedActions || getUnlockedActionsForTier(currentTier)
    };
  }

  // Calculate from authoritative state with multi-tier detection
  const scores = calculateProgressionScores(state, state.playerPowerProfile);
  const overallScore = calculateOverallProgressionScore(scores);
  const { highestEligibleTier, qualifyingReasons } = evaluateTierEligibility(state, scores, overallScore);
  const rank = getLifeTierRank(highestEligibleTier);
  const def = LIFE_TIER_DEFINITIONS[highestEligibleTier];
  const { progressPercent, nextTier, pointsToNextTier } = calculateProgressToNextTier(highestEligibleTier, overallScore);

  const migrationHistory: LifeTierHistoryEntry = {
    id: `lth_mig_${Date.now()}`,
    tier: highestEligibleTier,
    previousTier: null,
    simulationTick: state.simulationTick || 0,
    month: state.currentMonth || 1,
    year: state.currentYear || 2026,
    age: state.character.age || 18,
    changeType: 'MIGRATION',
    reason: `Save state migrated to Expansion 1A schema at ${def.displayName}.`,
    summary: `Migrated existing career, assets, and influence into ${def.displayName} (Tier ${rank} of 8).`,
    scoresSnapshot: { ...scores },
    overallScoreSnapshot: overallScore
  };

  return {
    currentTier: highestEligibleTier,
    highestTierAchieved: highestEligibleTier,
    currentTierSince: {
      month: state.currentMonth || 1,
      year: state.currentYear || 2026,
      simulationTick: state.simulationTick || 0
    },
    tierRank: rank,
    tierHistory: [migrationHistory],
    scores,
    overallProgressionScore: overallScore,
    progressToNextTier: progressPercent,
    nextTier,
    pointsToNextTier,
    promotionReasons: qualifyingReasons,
    regressionReasons: [],
    instabilityWarnings: [],
    monthsBelowMaintenance: 0,
    isUnstable: false,
    unlockedDomains: getUnlockedDomainsForTier(highestEligibleTier),
    unlockedActions: getUnlockedActionsForTier(highestEligibleTier)
  };
}

// ---------------------------------------------------------------------------
// 5. EVENT & DECISION FILTERING EXTENSION
// ---------------------------------------------------------------------------

/**
 * Filters simulation events taking both PowerTier AND LifeTier into account.
 */
export function filterEventsByLifeTier(events: SimulationEvent[], currentTier: LifeTier): SimulationEvent[] {
  return events.filter(ev => {
    if (ev.minLifeTier && !isLifeTierAtLeast(currentTier, ev.minLifeTier)) {
      return false;
    }
    if (ev.maxLifeTier && !isLifeTierAtMost(currentTier, ev.maxLifeTier)) {
      return false;
    }
    return true;
  });
}

/**
 * Filters pending decisions taking both PowerTier AND LifeTier into account.
 */
export function filterDecisionsByLifeTier(decisions: PendingDecision[], currentTier: LifeTier): PendingDecision[] {
  return decisions.filter(dec => {
    if (dec.minLifeTier && !isLifeTierAtLeast(currentTier, dec.minLifeTier)) {
      return false;
    }
    if (dec.maxLifeTier && !isLifeTierAtMost(currentTier, dec.maxLifeTier)) {
      return false;
    }
    return true;
  });
}
