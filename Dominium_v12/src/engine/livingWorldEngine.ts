import {
  GameState,
  LivingWorldProfile,
  LivingNpc,
  CompetitorProfile,
  LivingFamily,
  LivingDynasty,
  AutonomousBusiness,
  IndustryMarketCondition,
  LivingEconomyState,
  GlobalWorldState,
  PoliticalActor,
  PoliticalFaction,
  LivingWorldEvent,
  WorldHistoryEntry,
  WorldOpportunityContest,
  LifeEvent,
  NewsItem,
  SimulationDiff,
  EconomicCyclePhase,
  SimulationLOD,
  CompetitorStrategyType,
  NpcGoalCategory
} from '../types';

import {
  INITIAL_INDUSTRY_CONDITIONS,
  INITIAL_REGIONS_DATA,
  INITIAL_LIVING_DYNASTIES,
  INITIAL_LIVING_FAMILIES,
  INITIAL_LIVING_NPCS,
  INITIAL_COMPETITOR_PROFILES,
  INITIAL_AUTONOMOUS_BUSINESSES,
  INITIAL_POLITICAL_FACTIONS,
  INITIAL_POLITICAL_ACTORS,
  INITIAL_LIVING_ECONOMY,
  INITIAL_GLOBAL_WORLD_STATE,
  INITIAL_WORLD_EVENTS
} from './livingWorldConfig';
import { simulateAutonomousNpcEcosystem } from './npcLifeEngine';

/**
 * Deterministic world RNG. The world simulation must be replayable for the same
 * player/world identity and simulation tick. A local sequence is used so the
 * existing engine can be migrated away from random() without changing each
 * rule's probability contract.
 */
function createWorldRng(state: GameState): () => number {
  const source = `${state.character.id}|${state.character.birthYear}|${state.simulationTick}|${state.currentYear}|${state.currentMonth}`;
  let seed = 2166136261;
  for (let i = 0; i < source.length; i++) {
    seed ^= source.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  return () => {
    seed += 0x6D2B79F5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Initializes a pristine Living World profile for a new game state.
 */
export function initializeLivingWorldProfile(state: GameState): LivingWorldProfile {
  return {
    economy: JSON.parse(JSON.stringify(INITIAL_LIVING_ECONOMY)),
    global: JSON.parse(JSON.stringify(INITIAL_GLOBAL_WORLD_STATE)),
    industries: JSON.parse(JSON.stringify(INITIAL_INDUSTRY_CONDITIONS)),
    regions: JSON.parse(JSON.stringify(INITIAL_REGIONS_DATA)),
    npcs: JSON.parse(JSON.stringify(INITIAL_LIVING_NPCS)),
    competitors: JSON.parse(JSON.stringify(INITIAL_COMPETITOR_PROFILES)),
    families: JSON.parse(JSON.stringify(INITIAL_LIVING_FAMILIES)),
    dynasties: JSON.parse(JSON.stringify(INITIAL_LIVING_DYNASTIES)),
    businesses: JSON.parse(JSON.stringify(INITIAL_AUTONOMOUS_BUSINESSES)),
    politicalActors: JSON.parse(JSON.stringify(INITIAL_POLITICAL_ACTORS)),
    politicalFactions: JSON.parse(JSON.stringify(INITIAL_POLITICAL_FACTIONS)),
    activeWorldEvents: JSON.parse(JSON.stringify(INITIAL_WORLD_EVENTS)),
    resolvedWorldEvents: [],
    worldHistory: [
      {
        tick: 0,
        month: state.currentMonth || 1,
        year: state.currentYear || 2026,
        headline: 'Genesis of the Modern Autonomous Living World',
        category: 'Society',
        significance: 'Historical',
        affectedDomains: ['Global', 'Economy', 'Corporate', 'Politics'],
        summary: 'International commercial networks, prominent dynastic houses, and sovereign institutions enter a period of dynamic autonomous competition.'
      }
    ],
    activeOpportunityContests: [],
    playerWorldReputation: {
      fearScore: 10,
      respectScore: 25,
      trustworthinessScore: 50,
      notorietyScore: 5
    },
    worldReactionLog: [],
    monthlyEcosystemDigest: {
      summary: 'The living world is operating in stable macroeconomic equilibrium with balanced corporate competition.',
      keyMoves: [
        'House of Sterling established conservative liquidity reserves in sovereign bonds.',
        'NovaCore Systems advanced next-generation semiconductor fabrication facilities.'
      ],
      threatAlerts: [],
      opportunityWindows: [
        'Technology & AI industry expansion provides accelerated growth multiples.',
        'Central bank interest rate stability creates favorable debt financing conditions.'
      ]
    }
  };
}

/**
 * Ensures that the GameState has a valid LivingWorldProfile, performing idempotent migration if needed.
 */
export function ensureLivingWorldProfile(state: GameState): LivingWorldProfile {
  if (!state.livingWorld) {
    state.livingWorld = initializeLivingWorldProfile(state);
    return state.livingWorld;
  }

  const lw = state.livingWorld;
  if (!lw.economy) lw.economy = JSON.parse(JSON.stringify(INITIAL_LIVING_ECONOMY));
  if (!lw.global) lw.global = JSON.parse(JSON.stringify(INITIAL_GLOBAL_WORLD_STATE));
  if (!Array.isArray(lw.industries) || lw.industries.length === 0) lw.industries = JSON.parse(JSON.stringify(INITIAL_INDUSTRY_CONDITIONS));
  if (!Array.isArray(lw.regions) || lw.regions.length === 0) lw.regions = JSON.parse(JSON.stringify(INITIAL_REGIONS_DATA));
  if (!Array.isArray(lw.npcs) || lw.npcs.length === 0) lw.npcs = JSON.parse(JSON.stringify(INITIAL_LIVING_NPCS));
  if (!Array.isArray(lw.competitors) || lw.competitors.length === 0) lw.competitors = JSON.parse(JSON.stringify(INITIAL_COMPETITOR_PROFILES));
  if (!Array.isArray(lw.families) || lw.families.length === 0) lw.families = JSON.parse(JSON.stringify(INITIAL_LIVING_FAMILIES));
  if (!Array.isArray(lw.dynasties) || lw.dynasties.length === 0) lw.dynasties = JSON.parse(JSON.stringify(INITIAL_LIVING_DYNASTIES));
  if (!Array.isArray(lw.businesses) || lw.businesses.length === 0) lw.businesses = JSON.parse(JSON.stringify(INITIAL_AUTONOMOUS_BUSINESSES));
  if (!Array.isArray(lw.politicalActors) || lw.politicalActors.length === 0) lw.politicalActors = JSON.parse(JSON.stringify(INITIAL_POLITICAL_ACTORS));
  if (!Array.isArray(lw.politicalFactions) || lw.politicalFactions.length === 0) lw.politicalFactions = JSON.parse(JSON.stringify(INITIAL_POLITICAL_FACTIONS));
  if (!Array.isArray(lw.activeWorldEvents)) lw.activeWorldEvents = [];
  if (!Array.isArray(lw.resolvedWorldEvents)) lw.resolvedWorldEvents = [];
  if (!Array.isArray(lw.worldHistory)) lw.worldHistory = [];
  if (!Array.isArray(lw.activeOpportunityContests)) lw.activeOpportunityContests = [];
  if (!lw.playerWorldReputation) {
    lw.playerWorldReputation = { fearScore: 10, respectScore: 25, trustworthinessScore: 50, notorietyScore: 5 };
  }
  if (!Array.isArray(lw.worldReactionLog)) lw.worldReactionLog = [];
  if (!lw.monthlyEcosystemDigest) {
    lw.monthlyEcosystemDigest = {
      summary: 'Autonomous simulation active.',
      keyMoves: [],
      threatAlerts: [],
      opportunityWindows: []
    };
  }

  return lw;
}

/**
 * Monthly Living World Simulation Pipeline Coordinator (Stage 33)
 */
export function advanceLivingWorldSimulation(
  prevState: GameState,
  state: GameState,
  diff: SimulationDiff
): {
  nextState: GameState;
  generatedEvents: LifeEvent[];
  generatedNews: NewsItem[];
} {
  const generatedEvents: LifeEvent[] = [];
  const generatedNews: NewsItem[] = [];

  const lw = ensureLivingWorldProfile(state);
  const currentTick = state.simulationTick;
  const currentMonth = state.currentMonth;
  const currentYear = state.currentYear;

  const keyMoves: string[] = [];
  const threatAlerts: string[] = [];
  const opportunityWindows: string[] = [];
  const random = createWorldRng(state);

  // =========================================================================
  // 1. MACRO ECONOMIC CYCLE & GLOBAL CONDITIONS SIMULATION (Stages 16, 17, 23)
  // =========================================================================
  lw.economy.monthsInCurrentCycle += 1;
  const cycle = lw.economy.currentCycle;

  // Cycle Transition Logic with bounded Markov probabilities
  const cycleTransitions: Record<EconomicCyclePhase, { next: EconomicCyclePhase; baseProb: number }> = {
    'RECOVERY': { next: 'EXPANSION', baseProb: 0.08 },
    'EXPANSION': { next: 'STABLE_GROWTH', baseProb: 0.07 },
    'STABLE_GROWTH': { next: 'OVERHEATING', baseProb: 0.06 },
    'OVERHEATING': { next: 'SLOWDOWN', baseProb: 0.09 },
    'SLOWDOWN': { next: 'RECESSION', baseProb: 0.10 },
    'RECESSION': { next: 'RECOVERY', baseProb: 0.12 }
  };

  const transitionDef = cycleTransitions[cycle];
  const cycleDurationBonus = Math.min(0.25, lw.economy.monthsInCurrentCycle * 0.015);
  const transitionChance = transitionDef.baseProb + cycleDurationBonus;

  if (random() < transitionChance && lw.economy.monthsInCurrentCycle >= 6) {
    const oldCycle = cycle;
    lw.economy.currentCycle = transitionDef.next;
    lw.economy.monthsInCurrentCycle = 0;

    const cycleSummary = `National macroeconomic cycle transitioned from ${oldCycle} to ${lw.economy.currentCycle}.`;
    lw.economy.cycleHistory.push({
      tick: currentTick,
      cycle: lw.economy.currentCycle,
      summary: cycleSummary
    });
    if (lw.economy.cycleHistory.length > 20) lw.economy.cycleHistory.shift();

    // Record World History for significant economic transitions
    lw.worldHistory.push({
      tick: currentTick,
      month: currentMonth,
      year: currentYear,
      headline: `Economic Transition: Economy Enters ${lw.economy.currentCycle} Phase`,
      category: 'Economy',
      significance: (lw.economy.currentCycle === 'RECESSION' || lw.economy.currentCycle === 'OVERHEATING') ? 'Major' : 'Notable',
      affectedDomains: ['National Economy', 'Capital Markets', 'Enterprise Profitability'],
      summary: `Central statistical authorities and market analysts confirmed official shift into ${lw.economy.currentCycle}.`
    });
    if (lw.worldHistory.length > 60) lw.worldHistory.shift();

    generatedNews.push({
      id: `news_lw_cycle_${currentTick}`,
      month: currentMonth,
      year: currentYear,
      headline: `Living World Macro Shift: National Economy Enters ${lw.economy.currentCycle}`,
      body: `Statistical monitoring confirms transition into ${lw.economy.currentCycle}. Corporate lenders and sovereign institutions are adjusting strategic risk horizons.`,
      category: 'Economy',
      importance: (lw.economy.currentCycle === 'RECESSION' || lw.economy.currentCycle === 'OVERHEATING') ? 'MAJOR' : 'NORMAL',
      severity: lw.economy.currentCycle === 'RECESSION' ? 'Warning' : 'Info',
      impactExplanation: `Macroeconomic cycle transitioned to ${lw.economy.currentCycle}.`,
      source: 'Global Economic Intelligence',
      tags: ['LivingWorld', 'Economy', lw.economy.currentCycle]
    });
  }

  // Evolve quantitative economic indicators
  switch (lw.economy.currentCycle) {
    case 'EXPANSION':
    case 'STABLE_GROWTH':
      lw.economy.nationalGdpGrowth = Math.min(4.5, Math.max(1.8, lw.economy.nationalGdpGrowth + 0.05));
      lw.economy.unemploymentRate = Math.max(3.5, lw.economy.unemploymentRate - 0.05);
      lw.economy.inflationRate = Math.min(3.2, Math.max(1.8, lw.economy.inflationRate + 0.03));
      lw.economy.marketConfidenceIndex = Math.min(95, lw.economy.marketConfidenceIndex + 1);
      lw.economy.businessConfidenceIndex = Math.min(95, lw.economy.businessConfidenceIndex + 1);
      lw.economy.creditAvailability = 'Loose';
      opportunityWindows.push('Economic growth creates strong demand across consumer goods, tech, and construction.');
      break;

    case 'OVERHEATING':
      lw.economy.nationalGdpGrowth = Math.min(5.8, lw.economy.nationalGdpGrowth + 0.1);
      lw.economy.unemploymentRate = Math.max(2.8, lw.economy.unemploymentRate - 0.08);
      lw.economy.inflationRate = Math.min(6.5, lw.economy.inflationRate + 0.15);
      lw.economy.benchmarkInterestRate = Math.min(7.5, lw.economy.benchmarkInterestRate + 0.1);
      lw.economy.creditAvailability = 'Normal';
      threatAlerts.push('Rising inflation and central bank benchmark rate hikes are increasing corporate borrowing costs.');
      break;

    case 'SLOWDOWN':
      lw.economy.nationalGdpGrowth = Math.max(0.5, lw.economy.nationalGdpGrowth - 0.1);
      lw.economy.unemploymentRate = Math.min(6.0, lw.economy.unemploymentRate + 0.08);
      lw.economy.marketConfidenceIndex = Math.max(45, lw.economy.marketConfidenceIndex - 1.5);
      lw.economy.businessConfidenceIndex = Math.max(40, lw.economy.businessConfidenceIndex - 1.5);
      lw.economy.creditAvailability = 'Tight';
      threatAlerts.push('Credit markets tightening; mid-tier corporate refinancing spreads widening.');
      break;

    case 'RECESSION':
      lw.economy.nationalGdpGrowth = Math.max(-3.5, lw.economy.nationalGdpGrowth - 0.2);
      lw.economy.unemploymentRate = Math.min(11.5, lw.economy.unemploymentRate + 0.2);
      lw.economy.inflationRate = Math.max(0.8, lw.economy.inflationRate - 0.1);
      lw.economy.benchmarkInterestRate = Math.max(1.5, lw.economy.benchmarkInterestRate - 0.1);
      lw.economy.marketConfidenceIndex = Math.max(25, lw.economy.marketConfidenceIndex - 2);
      lw.economy.businessConfidenceIndex = Math.max(20, lw.economy.businessConfidenceIndex - 2);
      lw.economy.creditAvailability = 'Frozen';
      threatAlerts.push('Macroeconomic contraction reduces consumer discretionary revenues.');
      opportunityWindows.push('Distressed commercial assets and corporate equity available at substantial discounts.');
      break;

    case 'RECOVERY':
      lw.economy.nationalGdpGrowth = Math.min(2.5, Math.max(0.0, lw.economy.nationalGdpGrowth + 0.1));
      lw.economy.unemploymentRate = Math.max(5.0, lw.economy.unemploymentRate - 0.1);
      lw.economy.marketConfidenceIndex = Math.min(70, lw.economy.marketConfidenceIndex + 2);
      lw.economy.businessConfidenceIndex = Math.min(70, lw.economy.businessConfidenceIndex + 2);
      lw.economy.creditAvailability = 'Normal';
      opportunityWindows.push('Early recovery dynamics favor agile investors recapitalizing depressed industries.');
      break;
  }

  // Global conditions drift (Stage 23)
  if (random() < 0.05) {
    const globalConditions: Array<GlobalWorldState['primaryCondition']> = [
      'GLOBAL_GROWTH',
      'GLOBAL_OPPORTUNITY',
      'TRADE_EXPANSION',
      'MARKET_INSTABILITY',
      'GEOPOLITICAL_TENSION',
      'GLOBAL_RECESSION'
    ];
    const newGlobal = globalConditions[Math.floor(random() * globalConditions.length)];
    if (newGlobal !== lw.global.primaryCondition) {
      lw.global.primaryCondition = newGlobal;
      generatedNews.push({
        id: `news_lw_global_${currentTick}`,
        month: currentMonth,
        year: currentYear,
        headline: `International Panorama: Global State Shifts to ${newGlobal.replace(/_/g, ' ')}`,
        body: `International trade summits and cross-border financial flows reflect a systemic shift toward ${newGlobal.toLowerCase().replace(/_/g, ' ')}.`,
        category: 'World',
        importance: 'NORMAL',
        severity: (newGlobal === 'GLOBAL_RECESSION' || newGlobal === 'GEOPOLITICAL_TENSION') ? 'Warning' : 'Info',
        impactExplanation: `Global commerce condition transitioned to ${newGlobal}.`,
        source: 'Transnational Strategic Forum',
        tags: ['LivingWorld', 'Global', newGlobal]
      });
    }
  }

  // =========================================================================
  // 2. INDUSTRY & MARKET CONDITIONS SIMULATION (Stage 15)
  // =========================================================================
  for (const ind of lw.industries) {
    const industryCycleBonus = lw.economy.currentCycle === 'EXPANSION' ? 1.5 : (lw.economy.currentCycle === 'RECESSION' ? -2.0 : 0);
    ind.growthRateAnnual = Math.max(-5.0, Math.min(25.0, ind.growthRateAnnual + (random() - 0.48) * 0.5 + (industryCycleBonus * 0.1)));
    
    // Dynamic Industry State Shifts
    if (ind.growthRateAnnual > 10.0 && ind.competitionIndex > 75) {
      ind.state = 'EXPANDING';
    } else if (ind.growthRateAnnual < 0.0) {
      ind.state = 'DECLINING';
    } else if (ind.disruptionRisk > 70) {
      ind.state = 'DISRUPTED';
    } else if (ind.competitionIndex > 80) {
      ind.state = 'COMPETITIVE';
    } else {
      ind.state = 'STABLE';
    }

    // Market size growth
    const monthlyGrowthFraction = (ind.growthRateAnnual / 100) / 12;
    ind.marketSizeBillions = Math.max(500, Math.round((ind.marketSizeBillions * (1 + monthlyGrowthFraction)) * 10) / 10);
  }

  // =========================================================================
  // 3. LIVING BUSINESS ECOSYSTEM (Stage 14)
  // =========================================================================
  for (const biz of lw.businesses) {
    const matchingInd = lw.industries.find(i => i.industry === biz.industry);
    const indGrowth = matchingInd ? (matchingInd.growthRateAnnual / 100) : 0.05;
    const macroEconFactor = lw.economy.currentCycle === 'EXPANSION' ? 1.08 : (lw.economy.currentCycle === 'RECESSION' ? 0.90 : 1.0);

    // Strategic modifiers
    let strategyRevenueMult = 1.0;
    let strategyProfitMult = 1.0;
    if (biz.currentStrategy === 'AGGRESSIVE_GROWTH') {
      strategyRevenueMult = 1.06;
      strategyProfitMult = 0.92; // Higher marketing/capex burn
    } else if (biz.currentStrategy === 'LONG_TERM_ACCUMULATION' || biz.currentStrategy === 'CONSERVATIVE') {
      strategyRevenueMult = 1.01;
      strategyProfitMult = 1.08; // Disciplined cost containment
    } else if (biz.currentStrategy === 'INNOVATION') {
      strategyRevenueMult = 1.04;
      strategyProfitMult = 0.96;
      biz.productQuality = Math.min(99, biz.productQuality + 0.2);
    } else if (biz.currentStrategy === 'MARKET_DOMINATION') {
      strategyRevenueMult = 1.03;
      biz.brandReputation = Math.min(99, biz.brandReputation + 0.15);
    }

    const revenueDeltaRate = ((indGrowth / 12) + (random() - 0.48) * 0.02) * macroEconFactor * strategyRevenueMult;
    biz.monthlyRevenue = Math.max(1000000, Math.round(biz.monthlyRevenue * (1 + revenueDeltaRate)));

    // Calculate profitability
    const margin = (biz.monthlyProfit / Math.max(1, biz.monthlyRevenue));
    const targetMargin = Math.max(0.08, Math.min(0.35, margin + (random() - 0.48) * 0.01)) * strategyProfitMult;
    biz.monthlyProfit = Math.round(biz.monthlyRevenue * targetMargin);

    // Valuation formula: 10-14x annualized net profit
    const annualProfit = biz.monthlyProfit * 12;
    biz.valuation = Math.max(50000000, Math.round(annualProfit * 12 + biz.monthlyRevenue * 1.5));

    // Market share adjustment
    if (biz.marketShare > 0) {
      const shareDrift = (biz.productQuality > 90 ? 0.1 : (biz.productQuality < 80 ? -0.1 : 0)) + (random() - 0.49) * 0.1;
      biz.marketShare = Math.max(1.0, Math.min(65.0, Math.round((biz.marketShare + shareDrift) * 10) / 10));
    }

    // Corporate Status Evaluation
    if (biz.monthlyProfit > 15000000 && biz.marketShare > 20) {
      biz.status = 'Flourishing';
    } else if (revenueDeltaRate > 0.03) {
      biz.status = 'Expanding';
    } else if (biz.monthlyProfit < 1000000 && lw.economy.currentCycle === 'RECESSION') {
      biz.status = 'Struggling';
    } else {
      biz.status = 'Stable';
    }

    // Occasional M&A or Major Corporate Action
    if (random() < 0.03 && biz.valuation > 2000000000) {
      const eventMsg = `${biz.name} completed strategic acquisition of regional technology and supplier assets.`;
      biz.recentCorporateEvents.push(eventMsg);
      if (biz.recentCorporateEvents.length > 8) biz.recentCorporateEvents.shift();
      keyMoves.push(`${biz.name} expanded asset footprint via bolt-on acquisition.`);
    }
  }

  // =========================================================================
  // 4. AUTONOMOUS NPC GOAL EVALUATION & PERSONAL DEVELOPMENT (Expansion 4)
  // =========================================================================
  simulateAutonomousNpcEcosystem(state, generatedEvents, generatedNews);

  // =========================================================================
  // 5. AUTONOMOUS COMPETITOR STRATEGIES & CHALLENGES (Stages 9, 10, 31)
  // =========================================================================
  for (const comp of lw.competitors) {
    const leadNpc = lw.npcs.find(n => n.id === comp.leadPersonId);
    
    // Competitive growth based on strategy
    let monthlyResourceGrowth = 0.005;
    if (comp.strategy === 'AGGRESSIVE_GROWTH') monthlyResourceGrowth = 0.022;
    else if (comp.strategy === 'INNOVATION') monthlyResourceGrowth = 0.015;
    else if (comp.strategy === 'MARKET_DOMINATION') monthlyResourceGrowth = 0.012;
    else if (comp.strategy === 'POLITICAL_INFLUENCE') monthlyResourceGrowth = 0.008;
    else monthlyResourceGrowth = 0.006;

    comp.currentResources = Math.round(comp.currentResources * (1 + monthlyResourceGrowth));
    comp.marketPower = Math.min(98, Math.max(10, comp.marketPower + (random() - 0.48) * 0.8));

    // Autonomous Competitor Action Generator
    if (random() < 0.10) {
      let actionDesc = '';
      if (comp.strategy === 'AGGRESSIVE_GROWTH') {
        actionDesc = `${comp.name} launched aggressive customer acquisition campaign in ${comp.targetIndustry || 'key sector'}.`;
        comp.recentMoves.push(actionDesc);
        threatAlerts.push(`${comp.name} is aggressively bidding to undercut rival pricing.`);
      } else if (comp.strategy === 'INNOVATION') {
        actionDesc = `${comp.name} secured breakthrough patent licensing in ${comp.targetMarket || 'enterprise hardware'}.`;
        comp.recentMoves.push(actionDesc);
        keyMoves.push(`${comp.name} unveiled proprietary next-generation R&D advances.`);
      } else if (comp.strategy === 'POLITICAL_INFLUENCE') {
        actionDesc = `${comp.name} organized industry lobbying coalition regarding corporate tax harmonization.`;
        comp.recentMoves.push(actionDesc);
      } else {
        actionDesc = `${comp.name} fortified balance sheet cash reserves and increased dividend distributions.`;
        comp.recentMoves.push(actionDesc);
      }

      if (comp.recentMoves.length > 8) comp.recentMoves.shift();
    }

    // Adaptive Strategy Response (Stage 31)
    // If player has massive market footprint, competitor adapts
    const playerCompanyTotalVal = state.companies.reduce((sum, c) => sum + c.valuation, 0);
    if (playerCompanyTotalVal > comp.currentResources && comp.strategy === 'CONSERVATIVE' && random() < 0.15) {
      comp.strategy = 'INNOVATION';
      comp.recentMoves.push('Pivoted strategy toward specialized innovation to outmaneuver dominant player scale.');
    }
  }

  // =========================================================================
  // 6. AI FAMILIES & DYNASTIES EVOLUTION (Stages 11, 12, 13)
  // =========================================================================
  for (const dyn of lw.dynasties) {
    const headNpc = lw.npcs.find(n => n.id === dyn.headPersonId);
    
    // Accumulate generational wealth
    const dynReturn = (lw.economy.nationalGdpGrowth / 100) / 12 + 0.003;
    dyn.totalDynastyWealth = Math.round(dyn.totalDynastyWealth * (1 + dynReturn));

    // Dynamic prestige rank
    if (dyn.totalDynastyWealth > 3000000000) {
      dyn.prestigeRank = 'Global Patrician';
    } else if (dyn.totalDynastyWealth > 1000000000) {
      dyn.prestigeRank = 'National Aristocracy';
    } else if (dyn.totalDynastyWealth > 250000000) {
      dyn.prestigeRank = 'Regional Powerhouse';
    } else {
      dyn.prestigeRank = 'Local Prominence';
    }

    // Generational Succession Hooks (Stage 13)
    if (headNpc && headNpc.age >= 78 && random() < 0.05) {
      const heirNpc = lw.npcs.find(n => n.id === dyn.heirPersonId);
      if (heirNpc) {
        const oldPatriarch = `${headNpc.firstName} ${headNpc.lastName}`;
        const newPatriarch = `${heirNpc.firstName} ${heirNpc.lastName}`;
        
        dyn.headPersonId = heirNpc.id;
        dyn.currentGeneration += 1;
        dyn.dynastyHistory.push(`${currentYear}: Generational succession completed. ${newPatriarch} ascended to head the ${dyn.dynastyName}, succeeding ${oldPatriarch}.`);
        if (dyn.dynastyHistory.length > 12) dyn.dynastyHistory.shift();

        lw.worldHistory.push({
          tick: currentTick,
          month: currentMonth,
          year: currentYear,
          headline: `Dynastic Succession: ${newPatriarch} Takes Helm of ${dyn.dynastyName}`,
          category: 'Dynasty',
          significance: 'Major',
          affectedDomains: ['Generational Dynasties', 'Capital Control', 'Family Enterprises'],
          summary: `Following the retirement of ${oldPatriarch}, the ${dyn.dynastyName} formally confirmed ${newPatriarch} as reigning head.`
        });

        generatedNews.push({
          id: `news_dyn_succ_${currentTick}`,
          month: currentMonth,
          year: currentYear,
          headline: `Dynastic Transition: ${dyn.dynastyName} Confirms ${newPatriarch} as New Head`,
          body: `Generational transition completed at ${dyn.dynastyName}. The $${(dyn.totalDynastyWealth / 1000000000).toFixed(1)}B patrician dynasty will now be guided by ${newPatriarch}.`,
          category: 'Business',
          importance: 'MAJOR',
          severity: 'Info',
          impactExplanation: `Generational succession completed at ${dyn.dynastyName}.`,
          source: 'Patrician Heritage Gazette',
          tags: ['LivingWorld', 'Dynasty', 'Succession']
        });
      }
    }
  }

  // =========================================================================
  // 7. POLITICAL ACTORS & FACTIONS (Stages 19, 20, 21)
  // =========================================================================
  for (const polAct of lw.politicalActors) {
    const macroPolDelta = lw.economy.currentCycle === 'EXPANSION' ? 0.3 : (lw.economy.currentCycle === 'RECESSION' ? -0.5 : 0);
    polAct.influenceScore = Math.max(10, Math.min(99, polAct.influenceScore + (random() - 0.48) * 1.2 + macroPolDelta));
    polAct.politicalCapital = Math.max(5, Math.min(100, polAct.politicalCapital + (random() - 0.48) * 1.5));
    
    // Scandal Vulnerability Event Trigger
    if (random() < (polAct.scandalVulnerability / 1000)) {
      polAct.influenceScore = Math.max(20, polAct.influenceScore - 15);
      polAct.politicalCapital = Math.max(10, polAct.politicalCapital - 25);
      polAct.reputation = Math.max(15, polAct.reputation - 20);

      lw.worldHistory.push({
        tick: currentTick,
        month: currentMonth,
        year: currentYear,
        headline: `Political Controversy: Ethics Inquiry Involving ${polAct.name}`,
        category: 'Politics',
        significance: 'Notable',
        affectedDomains: ['Legislative Governance', 'Public Ethics', 'Political Capital'],
        summary: `National media investigative reporting exposed regulatory conflict inquiries concerning ${polAct.name}.`
      });

      generatedNews.push({
        id: `news_pol_scandal_${currentTick}`,
        month: currentMonth,
        year: currentYear,
        headline: `Ethics Scrutiny Emerges Around ${polAct.name}`,
        body: `Parliamentary oversight committees initiated preliminary inquiry into regulatory decisions championed by ${polAct.name}.`,
        category: 'Politics',
        importance: 'NORMAL',
        severity: 'Warning',
        impactExplanation: `${polAct.name} experienced substantial political capital contraction.`,
        source: 'Capital Standard Dispatch',
        tags: ['LivingWorld', 'Politics', 'Scandal']
      });
    }
  }

  for (const fac of lw.politicalFactions) {
    fac.influenceScore = Math.max(15, Math.min(95, fac.influenceScore + (random() - 0.48) * 1.0));
  }

  // =========================================================================
  // 8. LIVING WORLD EVENTS & RIPPLE PROPAGATION (Stages 24, 25)
  // =========================================================================
  const stillActiveEvents: LivingWorldEvent[] = [];
  for (const wev of lw.activeWorldEvents) {
    wev.monthsElapsed += 1;

    // Apply simulation impacts to macro variables and corporations
    if (wev.simulationImpacts) {
      if (wev.simulationImpacts.gdpImpact) {
        lw.economy.nationalGdpGrowth = Math.max(-4.0, Math.min(6.5, lw.economy.nationalGdpGrowth + (wev.simulationImpacts.gdpImpact * 0.05)));
      }
      if (wev.simulationImpacts.interestRateShift) {
        lw.economy.benchmarkInterestRate = Math.max(0.25, Math.min(12.0, lw.economy.benchmarkInterestRate + wev.simulationImpacts.interestRateShift * 0.05));
      }
    }

    // Check resolution
    if (wev.monthsElapsed >= wev.durationMonths) {
      wev.isResolved = true;
      wev.resolvedTick = currentTick;
      lw.resolvedWorldEvents.push(wev);
      if (lw.resolvedWorldEvents.length > 20) lw.resolvedWorldEvents.shift();

      lw.worldHistory.push({
        tick: currentTick,
        month: currentMonth,
        year: currentYear,
        headline: `Resolution: ${wev.title} Concludes`,
        category: wev.category === 'ECONOMY' ? 'Economy' : (wev.category === 'POLITICS' ? 'Politics' : 'Global'),
        significance: 'Notable',
        affectedDomains: wev.affectedIndustries || ['General Commerce'],
        summary: `The systemic effects of '${wev.headline}' have fully stabilized and integrated into normal baseline operations.`
      });

      generatedNews.push({
        id: `news_wev_resolved_${wev.id}_${currentTick}`,
        month: currentMonth,
        year: currentYear,
        headline: `World Event Stabilizes: ${wev.title}`,
        body: `International regulatory bodies and corporate markets report that the market shifts surrounding ${wev.title.toLowerCase()} have stabilized.`,
        category: 'World',
        importance: 'NORMAL',
        severity: 'Info',
        impactExplanation: `${wev.title} has formally concluded.`,
        source: 'Global Market Observer',
        tags: ['LivingWorld', 'Resolution', wev.category]
      });
    } else {
      stillActiveEvents.push(wev);
    }
  }
  lw.activeWorldEvents = stillActiveEvents;

  // Spontaneous Generation of New World Events (Stage 24)
  if (lw.activeWorldEvents.length < 3 && random() < 0.08) {
    const candidateEvents: Partial<LivingWorldEvent>[] = [
      {
        title: 'Transnational Clean Energy Grid Accord',
        headline: 'Global Coalition Ratifies $80B Renewable Grid Integration Treaty',
        category: 'GLOBAL',
        severity: 'Notable',
        durationMonths: 14,
        affectedIndustries: ['Energy & CleanTech', 'Aerospace & Industrial', 'Real Estate & Infrastructure'],
        description: 'Multi-nation treaty standardizes clean power transmission protocols, unlocking massive cross-border utility project financing.',
        simulationImpacts: {
          gdpImpact: 0.25,
          corporateRevenueImpactPercent: 5.0
        },
        rippleSummary: [
          'CleanTech enterprises see surging commercial order books.',
          'Heavy industrial component manufacturers expand production lines.'
        ]
      },
      {
        title: 'Global Semiconductor Supply Squeeze',
        headline: 'Advanced Foundry Capacity Shortfall Triggers Multi-Industry Backlog',
        category: 'INDUSTRY',
        severity: 'Major',
        durationMonths: 10,
        affectedIndustries: ['Technology & AI', 'Aerospace & Industrial', 'Consumer Goods & Retail'],
        description: 'Record demand for high-end AI processors and automotive microcontrollers strains global lithography capacity.',
        simulationImpacts: {
          corporateRevenueImpactPercent: -3.5,
          marketVolatilityDelta: 0.20
        },
        rippleSummary: [
          'Hardware delivery delays impact consumer electronics and automotive assembly.',
          'Foundry operators command record margin pricing.'
        ]
      },
      {
        title: 'International Sovereign Debt Restructuring',
        headline: 'Multilateral Financial Institutions Standardize Emerging Market Debt Relief',
        category: 'ECONOMY',
        severity: 'Notable',
        durationMonths: 8,
        affectedIndustries: ['Finance & Banking', 'Real Estate & Infrastructure'],
        description: 'Coordinated credit enhancements stabilize cross-border sovereign yields and restore international debt underwriting.',
        simulationImpacts: {
          interestRateShift: -0.15,
          marketVolatilityDelta: -0.10
        },
        rippleSummary: [
          'Merchant banks benefit from restored cross-border syndication fees.',
          'Institutional sovereign debt risk premia narrow.'
        ]
      }
    ];

    const chosenTemplate = candidateEvents[Math.floor(random() * candidateEvents.length)];
    const newEvent: LivingWorldEvent = {
      id: `wev_emergent_${currentTick}_${Math.floor(random() * 1000)}`,
      title: chosenTemplate.title || 'Global Shift',
      headline: chosenTemplate.headline || 'Systemic Shift Emerges',
      category: chosenTemplate.category || 'GLOBAL',
      severity: chosenTemplate.severity || 'Notable',
      startTick: currentTick,
      durationMonths: chosenTemplate.durationMonths || 12,
      monthsElapsed: 1,
      isResolved: false,
      affectedIndustries: chosenTemplate.affectedIndustries || [],
      description: chosenTemplate.description || 'Global dynamics evolve.',
      simulationImpacts: chosenTemplate.simulationImpacts || {},
      rippleSummary: chosenTemplate.rippleSummary || []
    };

    lw.activeWorldEvents.push(newEvent);

    generatedNews.push({
      id: `news_wev_spawn_${newEvent.id}`,
      month: currentMonth,
      year: currentYear,
      headline: `World Event: ${newEvent.headline}`,
      body: newEvent.description,
      category: 'World',
      importance: newEvent.severity === 'Major' ? 'MAJOR' : 'NORMAL',
      severity: newEvent.severity === 'Major' ? 'Warning' : 'Info',
      impactExplanation: `Active world event initiated with multi-industry ripple effects.`,
      source: 'Global News Network',
      tags: ['LivingWorld', newEvent.category, 'WorldEvent']
    });
  }

  // =========================================================================
  // 9. PLAYER IMPACT ON THE WORLD & WORLD REACTIONS (Stages 28, 29, 36)
  // =========================================================================
  const playerNetWorth = state.analyticsHistory?.[state.analyticsHistory.length - 1]?.netWorth || 2500;
  const playerPowerRank = state.playerPowerProfile ? state.playerPowerProfile.powerScore : 10;
  const playerCompanyCount = state.companies.length;
  const playerInOffice = state.politics?.currentOffice?.inOffice || false;

  // Calculate dynamic world reputation scores
  let respect = 20;
  let fear = 5;
  let notoriety = 5;
  let trustworthiness = 50;

  if (playerNetWorth > 1000000000) {
    respect += 45;
    fear += 35;
  } else if (playerNetWorth > 100000000) {
    respect += 30;
    fear += 20;
  } else if (playerNetWorth > 10000000) {
    respect += 15;
    fear += 10;
  }

  if (playerCompanyCount >= 3) {
    fear += 15;
    respect += 10;
  }

  if (playerInOffice) {
    respect += 20;
    notoriety += 15;
  }

  lw.playerWorldReputation = {
    respectScore: Math.min(100, respect),
    fearScore: Math.min(100, fear),
    trustworthinessScore: Math.min(100, trustworthiness),
    notorietyScore: Math.min(100, notoriety)
  };

  // Significant Player Action Reaction Checks (Stage 29)
  const netWorthDelta = diff.netWorthDiff || 0;
  if (netWorthDelta > 50000000 && random() < 0.35) {
    const reactionEntry = {
      tick: currentTick,
      month: currentMonth,
      year: currentYear,
      actorName: 'Sterling Merchant Bancorp',
      reactionType: 'CAPITAL_MONITORING',
      reason: `Observed player capital expansion of +$${Math.round(netWorthDelta / 1000000)}M; heightened competitive risk analysis.`
    };
    lw.worldReactionLog.push(reactionEntry);
    if (lw.worldReactionLog.length > 15) lw.worldReactionLog.shift();
  }

  // =========================================================================
  // 10. GENERATE MONTHLY ECOSYSTEM DIGEST (Stage 35)
  // =========================================================================
  let digestSummary = `The living world is in an ${lw.economy.currentCycle.toLowerCase().replace(/_/g, ' ')} cycle with ${(lw.economy.nationalGdpGrowth).toFixed(1)}% annual GDP growth.`;
  if (threatAlerts.length > 0) {
    digestSummary += ` Autonomous competitors are actively adjusting positioning in response to macro shifts.`;
  }

  lw.monthlyEcosystemDigest = {
    summary: digestSummary,
    keyMoves: keyMoves.slice(0, 4),
    threatAlerts: threatAlerts.slice(0, 3),
    opportunityWindows: opportunityWindows.slice(0, 3)
  };

  return {
    nextState: state,
    generatedEvents,
    generatedNews
  };
}
