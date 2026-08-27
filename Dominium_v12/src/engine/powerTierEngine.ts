import { 
  GameState, 
  PlayerPowerProfile, 
  PowerTier, 
  PowerScoreBreakdown, 
  SimulationEvent, 
  PendingDecision 
} from '../types';

export const POWER_TIER_RANKS: Record<PowerTier, number> = {
  UNKNOWN: 0,
  LOCAL: 1,
  SUCCESSFUL: 2,
  PROMINENT: 3,
  ELITE: 4,
  POWERFUL: 5,
  GLOBAL: 6
};

export interface PowerTierDefinition {
  tier: PowerTier;
  rank: number;
  minScore: number;
  maxScore: number;
  label: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  description: string;
  typicalNetWorth: string;
  typicalScope: string;
  basePerks: string[];
  baseBurdens: string[];
}

export const POWER_TIER_DEFINITIONS: Record<PowerTier, PowerTierDefinition> = {
  UNKNOWN: {
    tier: 'UNKNOWN',
    rank: 0,
    minScore: 0,
    maxScore: 69,
    label: 'Unknown Citizen',
    badgeColor: '#9ca3af',
    badgeBg: 'rgba(156, 163, 175, 0.1)',
    badgeBorder: 'rgba(156, 163, 175, 0.25)',
    description: 'An ordinary individual navigating daily civilian life with low visibility and negligible public or commercial influence.',
    typicalNetWorth: '< $250k',
    typicalScope: 'Private Household',
    basePerks: [
      'Low Profile Immunity: Zero regulatory audits or investigative journalism scrutiny',
      'Freedom of Movement: Complete anonymity without public or media intrusion',
      'Minimal Lifestyle Overhead: No executive security or public relations expenses'
    ],
    baseBurdens: [
      'Negligible Political Access: Must interact with government purely as an ordinary citizen',
      'Restricted Capital Access: Standard consumer retail loan interest rates and tight credit limits',
      'Excluded from High-Tier Dealflow: Ineligible for private equity, sovereign, or institutional syndicates'
    ]
  },
  LOCAL: {
    tier: 'LOCAL',
    rank: 1,
    minScore: 70,
    maxScore: 199,
    label: 'Local Pillar',
    badgeColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.1)',
    badgeBorder: 'rgba(16, 185, 129, 0.25)',
    description: 'A respected local entrepreneur, civic leader, or professional with recognized standing within their home city or district.',
    typicalNetWorth: '$250k - $2M',
    typicalScope: 'City / District',
    basePerks: [
      'Municipal Access: Direct contact with local city councillors and zoning boards',
      'Local Commercial Credit: Preferential rates at regional commercial banks',
      'Community Standing: Local newspaper coverage and chamber of commerce networking'
    ],
    baseBurdens: [
      'Local Competitor Friction: Direct price undercutting and rivalry from neighbourhood incumbents',
      'Municipal Oversight: Routine commercial inspections and local licensing audits',
      'Family Financial Expectations: Modest requests for personal loans and family support'
    ]
  },
  SUCCESSFUL: {
    tier: 'SUCCESSFUL',
    rank: 2,
    minScore: 200,
    maxScore: 449,
    label: 'Successful Leader',
    badgeColor: '#06b6d4',
    badgeBg: 'rgba(6, 182, 212, 0.1)',
    badgeBorder: 'rgba(6, 182, 212, 0.25)',
    description: 'A thriving business owner, prominent executive, or regional politician commanding real capital and regional authority.',
    typicalNetWorth: '$2M - $20M',
    typicalScope: 'Regional / State',
    basePerks: [
      'Regional Influence: Invitations to angel syndicates and mid-market commercial deals',
      'Corporate Credit Lines: Access to multimillion-dollar working capital credit facilities',
      'Keynote Speaker Status: Regional business symposiums and industry trade group leadership'
    ],
    baseBurdens: [
      'Tax Authority Scrutiny: Elevated audit risk on high-net-worth tax filings',
      'Talent Headhunting: Aggressive competitor poaching of senior managers and key staff',
      'Rising Family Pressure: Heightened expectations for trust funds and inheritance planning'
    ]
  },
  PROMINENT: {
    tier: 'PROMINENT',
    rank: 3,
    minScore: 450,
    maxScore: 799,
    label: 'Prominent Figure',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.1)',
    badgeBorder: 'rgba(245, 158, 11, 0.25)',
    description: 'A high-profile national figure, established tycoon, or parliamentary leader commanding substantial media exposure and industry sway.',
    typicalNetWorth: '$20M - $100M',
    typicalScope: 'National',
    basePerks: [
      'National Political Access: Direct advisory line to Members of Parliament, Mayors, and party bosses',
      'Private Equity Dealflow: Exclusive co-investment rights in mid-to-large private equity rounds',
      'Financial Press Stature: Front-page features in major national publications and TV news commentary',
      'Prestige Club Access: Elite country clubs, luxury yacht berths, and private banking desks'
    ],
    baseBurdens: [
      'Antitrust & Regulatory Review: Corporate M&A subject to preliminary regulatory scrutiny',
      'Paparazzi & Media Invasions: Public curiosity into personal relationships and spending',
      'Labor Union Clashes: Target of organized workforce bargaining and wage disputes',
      'Competitor Espionage: Corporate rivals attempting to uncover strategic R&D and confidential plans'
    ]
  },
  ELITE: {
    tier: 'ELITE',
    rank: 4,
    minScore: 800,
    maxScore: 1299,
    label: 'Elite Tycoon / Statesman',
    badgeColor: '#8b5cf6',
    badgeBg: 'rgba(139, 92, 246, 0.1)',
    badgeBorder: 'rgba(139, 92, 246, 0.25)',
    description: 'A major corporate titan or Cabinet-level powerbroker capable of shaping national industry, legislation, and public discourse.',
    typicalNetWorth: '$100M - $1B',
    typicalScope: 'National / Continental',
    basePerks: [
      'Cabinet-Level Power: Direct policy discussions with the Prime Minister/President and Cabinet Ministers',
      'Sovereign Syndicate Access: Co-investment opportunities with sovereign wealth and pension mega-funds',
      'Wall Street Lead Underwriting: Syndicated debt facilities of $100M+ at institutional prime rates',
      'Private Compound Assets: Ownership of private islands, commercial helipads, and aerospace hangars',
      'Legislative PAC Influence: Massive lobbying capital to shape taxation and regulatory policy'
    ],
    baseBurdens: [
      'DOJ / FTC Antitrust Probes: Formal investigations into market dominance and monopolistic practices',
      'Hostile Takeover Battles: Institutional predator funds attempting hostile board takeovers',
      'Kidnapping & Security Threats: Compulsory executive close-protection detail ($25k-$50k/mo upkeep)',
      'Aggressive Media Exposés: Investigative journalism digging into personal affairs, offshore accounts, and taxes',
      'Philanthropic Pressure: Public expectation to pledge $10M+ to high-profile disaster relief and charities'
    ]
  },
  POWERFUL: {
    tier: 'POWERFUL',
    rank: 5,
    minScore: 1300,
    maxScore: 1899,
    label: 'Sovereign Titan',
    badgeColor: '#fbbf24',
    badgeBg: 'rgba(251, 191, 36, 0.15)',
    badgeBorder: 'rgba(251, 191, 36, 0.35)',
    description: 'A multi-billionaire oligarch or Head of Government wielding formidable economic leverage, state authority, and market-moving power.',
    typicalNetWorth: '$1B - $10B',
    typicalScope: 'Continental / Global',
    basePerks: [
      'Sovereign Bilateral Treaties: Direct state investment compacts, special economic zone concessions, and tax holidays',
      'Multinational M&A Hegemony: Capacity to acquire entire corporate conglomerates outright with cash/syndicated debt',
      'Party Kingmaker: Ability to finance, endorse, and decisively swing national election outcomes',
      'Diplomatic Stature: State dinner seats, presidential delegations, and bespoke diplomatic passport privileges',
      'Unlimited Tier-1 Liquidity: Sovereign credit lines and bespoke derivative financing structures'
    ],
    baseBurdens: [
      'Congressional Subpoenas: Compelled testimony before televised parliamentary and senate inquiry committees',
      'Predatory Short-Seller Cartels: Coordinated activist hedge fund short-selling and smear campaigns',
      'Geopolitical Espionage: State-sponsored surveillance and intelligence agency interest',
      'Intense Political Backlash: Fierce opposition from rival parties and anti-monopoly coalitions',
      'Dynastic Succession Wars: High-stakes intra-family conflict and inheritance lawsuits over empire control'
    ]
  },
  GLOBAL: {
    tier: 'GLOBAL',
    rank: 6,
    minScore: 1900,
    maxScore: 9999,
    label: 'Global Power Broker',
    badgeColor: '#ec4899',
    badgeBg: 'rgba(236, 72, 153, 0.15)',
    badgeBorder: 'rgba(236, 72, 153, 0.35)',
    description: 'One of the most powerful individuals on earth. Commands global capital, moves international commodity markets, and dictates world policy.',
    typicalNetWorth: '$10B+',
    typicalScope: 'Global World Order',
    basePerks: [
      'World Economic Leadership: Keynote addresses at G7/G20 summits, Davos plenary sessions, and UN General Assemblies',
      'Market-Moving Sway: Single statements move global equity indices, foreign exchange rates, and commodity benchmarks',
      'Geopolitical Immunity: Strategic economic indispensability provides insulation from localized downturns',
      'Global Mega-Foundations: Direct funding of space exploration, global health eradication, and fusion energy initiatives',
      'Dynastic Immortality: Generational multi-billion trust architecture spanning global sovereign jurisdictions'
    ],
    baseBurdens: [
      'International Antitrust Alliances: Joint investigations by the US, EU, and Asian competition authorities',
      'Mass Global Activism: Worldwide protests, boycotts, and civil society campaigns targeting your enterprises',
      'Global Intelligence Standoffs: Foreign sovereign state intelligence operations and cyber-warfare attempts',
      'Extreme Assassination Risk: Requires military-grade private intelligence and armored motorcade logistics',
      'Permanent Global Spotlight: Every personal, familial, or corporate decision is subjected to worldwide scrutiny'
    ]
  }
};

/**
 * Calculates a player's power profile deterministically from REAL game state.
 */
export function calculatePlayerPowerProfile(state: GameState): PlayerPowerProfile {
  // 1. Calculate Real Net Worth from all assets and liabilities
  const totalCash = Math.max(0, state.finances.cash);
  const totalStocks = state.finances.stocks.reduce((acc, s) => acc + s.sharesOwned * s.currentPrice, 0);
  const totalProperties = state.finances.properties.reduce((acc, p) => acc + p.currentValue, 0);
  const totalCompaniesVal = state.companies.reduce((acc, c) => acc + (c.valuation * (c.playerOwnershipPercentage / 100)), 0);
  const totalSportsVal = state.sports.ownedTeams.reduce((acc, t) => acc + t.valuation, 0);
  const totalDebt = state.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0);
  const netWorth = (totalCash + totalStocks + totalProperties + totalCompaniesVal + totalSportsVal) - totalDebt;

  // 2. Net Worth Component (0 - 600 points)
  let netWorthScore = 0;
  if (netWorth <= 0) {
    netWorthScore = 0;
  } else if (netWorth < 100000) {
    netWorthScore = Math.floor((netWorth / 100000) * 15);
  } else if (netWorth < 1000000) {
    netWorthScore = 15 + Math.floor(((netWorth - 100000) / 900000) * 55);
  } else if (netWorth < 10000000) {
    netWorthScore = 70 + Math.floor(((netWorth - 1000000) / 9000000) * 90);
  } else if (netWorth < 100000000) {
    netWorthScore = 160 + Math.floor(((netWorth - 10000000) / 90000000) * 120);
  } else if (netWorth < 1000000000) {
    netWorthScore = 280 + Math.floor(((netWorth - 100000000) / 900000000) * 150);
  } else if (netWorth < 10000000000) {
    netWorthScore = 430 + Math.floor(((netWorth - 1000000000) / 9000000000) * 120);
  } else {
    netWorthScore = Math.min(600, 550 + Math.floor(Math.log10(netWorth / 10000000000) * 35));
  }

  // 3. Business Empire Component (0 - 550 points)
  let businessScore = 0;
  let totalHeadcount = 0;
  let totalMonthlyRevenue = 0;
  let hasPublicCompany = false;
  let maxMarketShare = 0;

  for (const comp of state.companies) {
    const controlledVal = comp.valuation * (comp.playerOwnershipPercentage / 100);
    totalHeadcount += comp.employeesCount;
    totalMonthlyRevenue += comp.monthlyRevenue;
    if (comp.isPublic) hasPublicCompany = true;
    if (comp.marketShare > maxMarketShare) maxMarketShare = comp.marketShare;

    // Valuation points
    if (controlledVal >= 1000000000) businessScore += 180;
    else if (controlledVal >= 100000000) businessScore += 110;
    else if (controlledVal >= 10000000) businessScore += 65;
    else if (controlledVal >= 1000000) businessScore += 35;
    else businessScore += 15;
  }

  // Headcount bonus
  if (totalHeadcount >= 10000) businessScore += 80;
  else if (totalHeadcount >= 2000) businessScore += 50;
  else if (totalHeadcount >= 500) businessScore += 30;
  else if (totalHeadcount >= 100) businessScore += 15;

  // Monthly revenue bonus
  if (totalMonthlyRevenue >= 50000000) businessScore += 80;
  else if (totalMonthlyRevenue >= 10000000) businessScore += 50;
  else if (totalMonthlyRevenue >= 1000000) businessScore += 25;

  if (hasPublicCompany) businessScore += 40;
  if (maxMarketShare >= 40) businessScore += 50;
  else if (maxMarketShare >= 20) businessScore += 25;

  businessScore = Math.min(550, businessScore);

  // 4. Political Office & Political Influence Component (0 - 450 points)
  let politicsScore = 0;
  const office = state.politics.currentOffice;
  if (office) {
    switch (office.title) {
      case 'Citizen': politicsScore += 0; break;
      case 'Party Member': politicsScore += 15; break;
      case 'Campaign Candidate': politicsScore += 30; break;
      case 'City Councillor': politicsScore += 70; break;
      case 'Mayor': politicsScore += 130; break;
      case 'Member of Parliament': politicsScore += 190; break;
      case 'Cabinet Minister': politicsScore += 280; break;
      case 'Party Leader': politicsScore += 320; break;
      case 'President / Prime Minister': politicsScore += 400; break;
    }

    if (office.inOffice) {
      politicsScore += Math.floor((office.approvalRating / 100) * 30);
      politicsScore += Math.floor((office.politicalCapital / 100) * 20);
    }
  }

  // Past offices bonus
  if (state.politics.pastOffices && state.politics.pastOffices.length > 0) {
    politicsScore += Math.min(50, state.politics.pastOffices.length * 15);
  }
  politicsScore = Math.min(450, politicsScore);

  // 5. Reputation & World Influence Attributes (0 - 250 points)
  const attrs = state.character.attributes;
  let reputationScore = 0;
  reputationScore += Math.floor((attrs.reputation / 100) * 75);
  reputationScore += Math.floor((attrs.worldInfluence / 100) * 110);
  reputationScore += Math.floor((attrs.charm / 100) * 25);
  reputationScore += Math.floor((attrs.intelligence / 100) * 25);

  // Social followers bonus
  const followers = state.character.socialFollowers || 0;
  if (followers >= 10000000) reputationScore += 40;
  else if (followers >= 1000000) reputationScore += 25;
  else if (followers >= 100000) reputationScore += 12;

  reputationScore = Math.min(250, reputationScore);

  // 6. Media Exposure & Publicity (0 - 200 points)
  let mediaScore = 0;
  const newsCount = state.newsArchive ? state.newsArchive.length : 0;
  mediaScore += Math.min(40, newsCount * 2);

  if (followers >= 5000000) mediaScore += 45;
  else if (followers >= 500000) mediaScore += 25;

  if (office && office.inOffice) {
    if (office.title === 'President / Prime Minister') mediaScore += 80;
    else if (office.title === 'Cabinet Minister' || office.title === 'Mayor') mediaScore += 45;
  }
  if (hasPublicCompany) mediaScore += 35;
  mediaScore = Math.min(200, mediaScore);

  // 7. Major Projects Component (0 - 200 points)
  let projectsScore = 0;
  for (const proj of state.projects) {
    if (proj.completed) {
      if (proj.type === 'Skyscraper Construction' || proj.type === 'Company HQ') projectsScore += 50;
      else if (proj.type === 'Sports Stadium' || proj.type === 'Luxury Shopping Mall') projectsScore += 40;
      else if (proj.type === 'Tech R&D Lab' || proj.type === 'Political PAC') projectsScore += 35;
      else if (proj.type === 'Charity Foundation') projectsScore += 30;
    } else if (proj.status === 'Active Construction') {
      projectsScore += 15;
    }
  }
  projectsScore = Math.min(200, projectsScore);

  // 8. Sports Franchise Ownership (0 - 180 points)
  let sportsScore = 0;
  for (const team of state.sports.ownedTeams) {
    if (team.valuation >= 1000000000) sportsScore += 75;
    else if (team.valuation >= 200000000) sportsScore += 45;
    else sportsScore += 25;

    if (team.fanBaseThousands >= 1000) sportsScore += 30;
    else if (team.fanBaseThousands >= 200) sportsScore += 15;

    if (team.leaguePosition <= 3) sportsScore += 20;
  }
  sportsScore = Math.min(180, sportsScore);

  // 9. Philanthropy & Civic Foundations (0 - 150 points) (Improvement #4: Permanent Philanthropy Floor)
  let philanthropyScore = 0;
  const lifetimeDonated = state.lifetimePhilanthropy || 0;
  if (lifetimeDonated >= 50000000) philanthropyScore += 100;
  else if (lifetimeDonated >= 10000000) philanthropyScore += 70;
  else if (lifetimeDonated >= 1000000) philanthropyScore += 40;
  else if (lifetimeDonated >= 100000) philanthropyScore += 20;
  else if (lifetimeDonated > 0) philanthropyScore += Math.min(15, Math.round(lifetimeDonated / 10000));

  const charityProjects = state.projects.filter(p => p.type === 'Charity Foundation');
  for (const cp of charityProjects) {
    if (cp.completed) philanthropyScore += 35;
    else philanthropyScore += 15;
  }
  if (attrs.reputation > 80 && netWorth > 10000000) {
    philanthropyScore += 15;
  }
  philanthropyScore = Math.min(150, philanthropyScore);

  // Total Combined Power Score
  const totalPowerScore = netWorthScore + businessScore + politicsScore + reputationScore + mediaScore + projectsScore + sportsScore + philanthropyScore;

  // Determine Power Tier
  let currentTier: PowerTier = 'UNKNOWN';
  if (totalPowerScore >= 1900) currentTier = 'GLOBAL';
  else if (totalPowerScore >= 1300) currentTier = 'POWERFUL';
  else if (totalPowerScore >= 800) currentTier = 'ELITE';
  else if (totalPowerScore >= 450) currentTier = 'PROMINENT';
  else if (totalPowerScore >= 200) currentTier = 'SUCCESSFUL';
  else if (totalPowerScore >= 70) currentTier = 'LOCAL';
  else currentTier = 'UNKNOWN';

  const tierDef = POWER_TIER_DEFINITIONS[currentTier];
  const tierRank = tierDef.rank;

  // Next tier progress calculation
  const nextTierOrder: PowerTier[] = ['UNKNOWN', 'LOCAL', 'SUCCESSFUL', 'PROMINENT', 'ELITE', 'POWERFUL', 'GLOBAL'];
  const nextTierIndex = nextTierOrder.indexOf(currentTier) + 1;
  const nextTier = nextTierIndex < nextTierOrder.length ? nextTierOrder[nextTierIndex] : null;

  let progressToNextTierPercent = 100;
  let pointsToNextTier = 0;

  if (nextTier) {
    const nextTierDef = POWER_TIER_DEFINITIONS[nextTier];
    const span = nextTierDef.minScore - tierDef.minScore;
    const currentProgress = totalPowerScore - tierDef.minScore;
    progressToNextTierPercent = Math.min(100, Math.max(0, Math.floor((currentProgress / span) * 100)));
    pointsToNextTier = Math.max(0, nextTierDef.minScore - totalPowerScore);
  }

  // Calculate 7 Specialized Influence & Scrutiny Meters (0 - 100 each)
  // 1. Visibility (0-100)
  const visibility = Math.min(100, Math.max(5, Math.floor(
    (mediaScore / 200) * 35 +
    (reputationScore / 250) * 25 +
    (politicsScore / 450) * 25 +
    (followers > 1000000 ? 15 : followers > 50000 ? 8 : 0)
  )));

  // 2. Media Attention (0-100)
  const mediaAttention = Math.min(100, Math.max(5, Math.floor(
    (visibility * 0.5) +
    (mediaScore / 200) * 30 +
    (tierRank >= 4 ? 20 : tierRank >= 2 ? 10 : 0)
  )));

  // 3. Political Influence (0-100)
  const politicalInfluence = Math.min(100, Math.max(2, Math.floor(
    (politicsScore / 450) * 60 +
    (netWorthScore / 600) * 25 +
    (attrs.worldInfluence / 100) * 15
  )));

  // 4. Business Influence (0-100)
  const businessInfluence = Math.min(100, Math.max(2, Math.floor(
    (businessScore / 550) * 60 +
    (netWorthScore / 600) * 30 +
    (projectsScore / 200) * 10
  )));

  // 5. Public Influence (0-100)
  const publicInfluence = Math.min(100, Math.max(5, Math.floor(
    (visibility * 0.35) +
    (politicalInfluence * 0.3) +
    (businessInfluence * 0.2) +
    (attrs.reputation / 100) * 15
  )));

  // 6. Scrutiny (0-100) — Rises naturally with power tier rank, world influence, reputation, net worth, and visibility
  const tierScrutinyBase = tierRank >= 4 ? (tierRank === 6 ? 40 : tierRank === 5 ? 30 : 20) : (tierRank === 3 ? 10 : 0);
  const scrutiny = Math.min(100, Math.max(5, Math.floor(
    tierScrutinyBase +
    (visibility * 0.25) +
    (netWorthScore / 600) * 20 +
    (politicsScore / 450) * 15 +
    (attrs.reputation / 100) * 15 +
    (attrs.worldInfluence / 100) * 15 +
    (attrs.stress > 60 ? 5 : 0)
  )));

  // 7. Regulatory Attention (0-100) — Escalates with market dominance, high office, public companies
  const regulatoryAttention = Math.min(100, Math.max(2, Math.floor(
    (businessInfluence * 0.4) +
    (hasPublicCompany ? 20 : 0) +
    (maxMarketShare > 30 ? 25 : maxMarketShare > 15 ? 10 : 0) +
    (scrutiny * 0.25)
  )));

  const breakdown: PowerScoreBreakdown = {
    netWorthScore,
    businessScore,
    politicsScore,
    reputationScore,
    mediaScore,
    projectsScore,
    sportsScore,
    philanthropyScore
  };

  // Custom Perks & Burdens tailored to the current profile
  const tierPerks = [...tierDef.basePerks];
  if (businessInfluence > 70) {
    tierPerks.push('Supply Chain Monopoly Leverage: Negotiate premier wholesale and distributor rates');
  }
  if (politicalInfluence > 75) {
    tierPerks.push('Legislative Fast-Track: Introduce priority national bills and regulatory amendments');
  }
  if (totalProperties > 25000000) {
    tierPerks.push('Prime Real Estate Sovereign Portfolio: Unlocks exclusive offshore freehold estates');
  }

  const tierBurdens = [...tierDef.baseBurdens];
  if (scrutiny > 70) {
    tierBurdens.push('Heightened Tax Audit Probability: High-frequency IRS/revenue service deep-dive audits');
  }
  if (regulatoryAttention > 65) {
    tierBurdens.push('Active Antitrust Monitoring: Mandatory pre-merger approvals by competition regulators');
  }
  if (tierRank >= 4) {
    tierBurdens.push('Security Upkeep Overhead: Required 24/7 executive and family security detail');
  }

  return {
    powerScore: totalPowerScore,
    powerTier: currentTier,
    visibility,
    mediaAttention,
    politicalInfluence,
    businessInfluence,
    publicInfluence,
    scrutiny,
    regulatoryAttention,
    breakdown,
    tierPerks,
    tierBurdens,
    progressToNextTierPercent,
    nextTier,
    pointsToNextTier,
    tierRank
  };
}

/**
 * Returns numerical rank (0-6) of a power tier.
 */
export function getPowerTierRank(tier: PowerTier): number {
  return POWER_TIER_RANKS[tier] ?? 0;
}

/**
 * Checks if current power tier is at least minTier.
 */
export function isPowerTierAtLeast(currentTier: PowerTier, minTier: PowerTier): boolean {
  return getPowerTierRank(currentTier) >= getPowerTierRank(minTier);
}

/**
 * Checks if current power tier is at most maxTier.
 */
export function isPowerTierAtMost(currentTier: PowerTier, maxTier: PowerTier): boolean {
  return getPowerTierRank(currentTier) <= getPowerTierRank(maxTier);
}

/**
 * Filters simulation events according to minPowerTier and maxPowerTier constraints.
 */
export function filterEventsByPowerTier(events: SimulationEvent[], profile: PlayerPowerProfile): SimulationEvent[] {
  return events.filter(ev => {
    if (ev.minPowerTier && !isPowerTierAtLeast(profile.powerTier, ev.minPowerTier)) {
      return false;
    }
    if (ev.maxPowerTier && !isPowerTierAtMost(profile.powerTier, ev.maxPowerTier)) {
      return false;
    }
    return true;
  });
}

/**
 * Filters pending decisions according to minPowerTier and maxPowerTier constraints.
 */
export function filterDecisionsByPowerTier(decisions: PendingDecision[], profile: PlayerPowerProfile): PendingDecision[] {
  return decisions.filter(dec => {
    if (dec.minPowerTier && !isPowerTierAtLeast(profile.powerTier, dec.minPowerTier)) {
      return false;
    }
    if (dec.maxPowerTier && !isPowerTierAtMost(profile.powerTier, dec.maxPowerTier)) {
      return false;
    }
    return true;
  });
}
