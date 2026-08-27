import { GameState, Company, SimulationSnapshot, SimulationDiff, LifeEvent, NewsItem } from '../types';
import { calculateNetWorth } from './simulationEngine';
import { formatDecisionHistoryForAi, formatConsequenceHistoryForAi } from './historyEngine';
import { createSimulationSnapshot } from './causalEventEngine';

export interface AiConsultationResponse {
  answer: string;
  recommendations: string[];
  riskAssessment: string;
  sourceRole: string;
  dataPointsReferenced?: string[];
  contextSummary?: {
    netWorth: number;
    netWorthChange3M: number;
    netWorthChange3MFormatted: string;
    cash: number;
    powerTier: string;
    powerScore: number;
    activeChainsCount: number;
    pendingDecisionsCount: number;
    businessCycle: string;
  };
}

export interface MultiPeriodDiffs {
  diff1M: { netWorthChangePct: number; netWorthChangeVal: number; cashChangeVal: number; incomeChangeVal: number };
  diff3M: { netWorthChangePct: number; netWorthChangeVal: number; cashChangeVal: number; healthChangeVal: number; stressChangeVal: number };
  diff6M: { netWorthChangePct: number; netWorthChangeVal: number };
  diff12M: { netWorthChangePct: number; netWorthChangeVal: number };
}

/**
 * Calculates accurate multi-period simulation diffs from analyticsHistory.
 */
export function calculateMultiPeriodDiffs(state: GameState): MultiPeriodDiffs {
  const currentNetWorth = calculateNetWorth(state);
  const currentCash = state.finances.cash;
  const history = state.analyticsHistory || [];
  const len = history.length;

  const getRecord = (monthsAgo: number) => {
    if (len <= monthsAgo) return history[0] || null;
    return history[len - 1 - monthsAgo] || null;
  };

  const rec1M = getRecord(1);
  const rec3M = getRecord(3);
  const rec6M = getRecord(6);
  const rec12M = getRecord(12);

  const calcPct = (curr: number, prev: number | undefined) => {
    if (!prev || prev === 0) return 0;
    return Number((((curr - prev) / Math.abs(prev)) * 100).toFixed(1));
  };

  return {
    diff1M: {
      netWorthChangePct: rec1M ? calcPct(currentNetWorth, rec1M.netWorth) : 0,
      netWorthChangeVal: rec1M ? Math.round(currentNetWorth - rec1M.netWorth) : 0,
      cashChangeVal: rec1M ? Math.round(currentCash - rec1M.cash) : 0,
      incomeChangeVal: rec1M ? Math.round((state.currentJob?.monthlySalary || 0) - rec1M.monthlyIncome) : 0
    },
    diff3M: {
      netWorthChangePct: rec3M ? calcPct(currentNetWorth, rec3M.netWorth) : 0,
      netWorthChangeVal: rec3M ? Math.round(currentNetWorth - rec3M.netWorth) : 0,
      cashChangeVal: rec3M ? Math.round(currentCash - rec3M.cash) : 0,
      healthChangeVal: rec3M ? Math.round(state.character.attributes.health - rec3M.health) : 0,
      stressChangeVal: rec3M ? Math.round(state.character.attributes.stress - rec3M.stress) : 0
    },
    diff6M: {
      netWorthChangePct: rec6M ? calcPct(currentNetWorth, rec6M.netWorth) : 0,
      netWorthChangeVal: rec6M ? Math.round(currentNetWorth - rec6M.netWorth) : 0
    },
    diff12M: {
      netWorthChangePct: rec12M ? calcPct(currentNetWorth, rec12M.netWorth) : 0,
      netWorthChangeVal: rec12M ? Math.round(currentNetWorth - rec12M.netWorth) : 0
    }
  };
}

/**
 * Builds the comprehensive, fact-grounded context payload for the AI Advisor.
 */
export function buildComprehensiveAiAdvisorContext(state: GameState, targetCompany?: Company) {
  const netWorth = calculateNetWorth(state);
  const diffs = calculateMultiPeriodDiffs(state);
  const currentCountry = state.world[state.currentCountryIndex] || state.world[0];
  const powerProfile = state.playerPowerProfile;

  // 1. Current State Summary
  const character = {
    fullName: `${state.character.firstName} ${state.character.lastName}`,
    age: state.character.age,
    lifeStage: state.character.lifeStage,
    residence: `${state.character.residenceCity}, ${state.character.residenceCountry}`,
    creditScore: state.character.creditScore,
    socialFollowers: state.character.socialFollowers,
    socialSentiment: state.character.socialSentiment,
    attributes: {
      health: Math.round(state.character.attributes.health),
      happiness: Math.round(state.character.attributes.happiness),
      intelligence: Math.round(state.character.attributes.intelligence),
      stress: Math.round(state.character.attributes.stress),
      reputation: Math.round(state.character.attributes.reputation),
      worldInfluence: Math.round(state.character.attributes.worldInfluence),
      charm: Math.round(state.character.attributes.charm),
      attractiveness: Math.round(state.character.attributes.attractiveness)
    },
    job: state.currentJob ? {
      title: state.currentJob.title,
      field: state.currentJob.field,
      company: state.currentJob.companyName,
      monthlySalary: state.currentJob.monthlySalary,
      performance: state.currentJob.performance
    } : 'Self-Employed / Private Tycoon'
  };

  // 2. Financial Breakdown & Asset Classes
  const totalStockValue = Math.round(state.finances.stocks.reduce((acc, s) => acc + s.sharesOwned * s.currentPrice, 0));
  const totalPropertyValue = Math.round(state.finances.properties.reduce((acc, p) => acc + p.currentValue, 0));
  const totalDebt = Math.round(
    state.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0) +
    state.finances.properties.reduce((acc, p) => acc + (p.mortgage?.remainingBalance || 0), 0)
  );
  const totalBusinessEquity = Math.round(
    state.companies.reduce((acc, c) => acc + (c.valuation * (c.playerOwnershipPercentage / 100)), 0)
  );

  const stockSectorBreakdown: Record<string, { totalValue: number; performanceTrend: string }> = {};
  for (const s of state.finances.stocks) {
    if (s.sharesOwned > 0) {
      const val = Math.round(s.sharesOwned * s.currentPrice);
      const firstPrice = s.priceHistory?.[0] || s.currentPrice;
      const pct = firstPrice > 0 ? (((s.currentPrice - firstPrice) / firstPrice) * 100).toFixed(1) : '0';
      stockSectorBreakdown[s.category] = {
        totalValue: (stockSectorBreakdown[s.category]?.totalValue || 0) + val,
        performanceTrend: `${pct}% (12M)`
      };
    }
  }

  const finances = {
    cash: state.finances.cash,
    netWorth,
    totalDebt,
    totalStockValue,
    totalPropertyValue,
    totalBusinessEquity,
    stockSectorHoldings: stockSectorBreakdown,
    monthlyBaseExpenses: state.finances.monthlyBaseExpenses,
    loansCount: state.finances.loans.length,
    propertiesCount: state.finances.properties.length
  };

  // 3. Business Performance Details
  const companies = state.companies.map(c => {
    const revenueGrowth = c.historicalRevenue && c.historicalRevenue.length >= 3
      ? (((c.monthlyRevenue - c.historicalRevenue[0]) / Math.max(1, c.historicalRevenue[0])) * 100).toFixed(1)
      : '0.0';
    return {
      id: c.id,
      name: c.name,
      industry: c.industry,
      valuation: c.valuation,
      playerOwnershipPct: c.playerOwnershipPercentage,
      playerEquityValue: Math.round((c.valuation * c.playerOwnershipPercentage) / 100),
      monthlyRevenue: c.monthlyRevenue,
      monthlyExpenses: c.monthlyExpenses,
      monthlyNetProfit: c.monthlyNetProfit,
      profitMarginPct: c.monthlyRevenue > 0 ? ((c.monthlyNetProfit / c.monthlyRevenue) * 100).toFixed(1) : '0.0',
      revenueGrowthRecentPct: `${revenueGrowth}%`,
      cashReserve: c.cashReserve,
      employeesCount: c.employeesCount,
      employeeMorale: c.employeeMorale,
      marketSharePct: c.marketShare,
      brandReputation: c.brandReputation,
      pricingStrategy: c.pricingStrategy,
      executivesCount: c.executives.length,
      boardMembersCount: c.boardMembers.length
    };
  });

  // 4. Family & Personal Situation
  const spouse = state.relationships.find(r => r.relation === 'Spouse');
  const partner = state.relationships.find(r => r.relation === 'Partner');
  const children = state.relationships.filter(r => r.relation === 'Son' || r.relation === 'Daughter');
  const family = {
    maritalStatus: spouse ? 'Married' : partner ? 'In a Relationship' : 'Single',
    spouseName: spouse ? spouse.name : partner ? partner.name : null,
    childrenCount: children.length,
    childrenNames: children.map(c => c.name),
    totalRelationshipsTracked: state.relationships.length,
    averageFamilyTrust: state.relationships.length > 0
      ? Math.round(state.relationships.reduce((acc, r) => acc + r.trust, 0) / state.relationships.length)
      : 0,
    heirNominated: state.relationships.find(r => r.id === state.dynastyHeirId)?.name || 'None'
  };

  // 5. Political Situation
  const politics = {
    currentOfficeTitle: state.politics.currentOffice.title,
    cityOrNation: state.politics.currentOffice.cityOrNation,
    inOffice: state.politics.currentOffice.inOffice,
    approvalRating: state.politics.currentOffice.approvalRating,
    politicalCapital: state.politics.currentOffice.politicalCapital,
    monthlySalary: state.politics.currentOffice.salaryMonthly,
    activeParty: state.politics.parties.find(p => p.id === state.politics.selectedPartyId)?.name || 'Independent / None',
    nationalPolicies: state.politics.nationalPolicies
  };

  // 6. World Macroeconomics & Business Cycle
  const worldConditions = {
    country: currentCountry.name,
    businessCycle: currentCountry.businessCycle,
    gdpGrowthRate: `${currentCountry.gdpGrowthRate}%`,
    inflationRate: `${currentCountry.inflationRate}%`,
    centralBankInterestRate: `${currentCountry.centralBankInterestRate}%`,
    unemploymentRate: `${currentCountry.unemploymentRate}%`,
    corporateTaxRate: `${currentCountry.corporateTaxRate}%`,
    politicalStability: `${currentCountry.politicalStability}/100`,
    economicClimate: currentCountry.politicalStability > 70 
      ? 'Strong Macro Expansion & Low Volatility' 
      : currentCountry.politicalStability > 40 
        ? 'Moderate Volatility' 
        : 'High Inflationary / Recessionary Headwinds'
  };

  // 7. Player Power Profile & Tiers
  const playerPowerProfile = {
    powerTier: powerProfile?.powerTier || 'UNKNOWN',
    powerScore: powerProfile?.powerScore || 0,
    tierRank: powerProfile?.tierRank || 0,
    visibility: powerProfile?.visibility || 0,
    mediaAttention: powerProfile?.mediaAttention || 0,
    politicalInfluence: powerProfile?.politicalInfluence || 0,
    businessInfluence: powerProfile?.businessInfluence || 0,
    publicInfluence: powerProfile?.publicInfluence || 0,
    scrutiny: powerProfile?.scrutiny || 0,
    regulatoryAttention: powerProfile?.regulatoryAttention || 0,
    scoreBreakdown: powerProfile?.breakdown,
    activeTierPerks: powerProfile?.tierPerks || [],
    activeTierBurdens: powerProfile?.tierBurdens || [],
    pointsToNextTier: powerProfile?.pointsToNextTier || 0,
    nextTier: powerProfile?.nextTier || null
  };

  // 8. Active Events, Dilemmas & Event Chains
  const activeEventChains = (state.activeEventChains || []).map(c => ({
    id: c.id,
    name: c.name,
    category: c.category,
    currentStage: c.currentStage,
    startedDate: `Year ${c.startedYear}, M${c.startedMonth}`,
    historySteps: c.history.map(h => `Stage ${h.stageSequence}: ${h.choiceLabel || 'In Progress'}`)
  }));

  const pendingDecisions = (state.pendingDecisions || []).map(d => ({
    id: d.id,
    title: d.title,
    category: d.category,
    urgency: d.urgency,
    expiresInMonths: d.expiresInMonths,
    options: d.options.map(o => ({
      label: o.label,
      cost: o.cost || 0,
      risk: o.risk,
      projectedOutcome: o.projectedOutcome
    }))
  }));

  const pendingDelayedConsequences = (state.delayedConsequences || []).map(dc => ({
    source: dc.source,
    targetDate: `Year ${dc.executeAtYear}, M${dc.executeAtMonth}`,
    description: dc.description
  }));

  // 9. Major History (Last 3-12 Months)
  const recentEvents = (state.eventsFeed || []).slice(0, 15).map(e => ({
    date: `Year ${e.timestampYear}, M${e.timestampMonth}`,
    category: e.category,
    title: e.title,
    description: e.description,
    triggerReason: e.triggerReason || undefined
  }));

  const recentNews = (state.newsArchive || []).slice(0, 10).map(n => ({
    date: `Year ${n.year}, M${n.month}`,
    headline: n.headline,
    category: n.category,
    importance: n.importance,
    impact: n.impactExplanation
  }));

  // 10. Immutable Decision & Consequence History
  const decisionHistoryFormatted = formatDecisionHistoryForAi(state, 12);
  const consequenceHistoryFormatted = formatConsequenceHistoryForAi(state, 12);

  return {
    currentDate: `Year ${state.currentYear}, Month ${state.currentMonth} (Simulation Tick: ${state.simulationTick})`,
    character,
    finances,
    diffs,
    companies,
    family,
    politics,
    worldConditions,
    playerPowerProfile,
    activeEventChains,
    pendingDecisions,
    pendingDelayedConsequences,
    recentEvents,
    recentNews,
    decisionHistorySummary: decisionHistoryFormatted,
    consequenceHistorySummary: consequenceHistoryFormatted,
    targetCompany: targetCompany ? {
      name: targetCompany.name,
      valuation: targetCompany.valuation,
      monthlyRevenue: targetCompany.monthlyRevenue,
      monthlyNetProfit: targetCompany.monthlyNetProfit,
      employeesCount: targetCompany.employeesCount,
      cashReserve: targetCompany.cashReserve
    } : null
  };
}

/**
 * Consults the AI Advisor with upgraded deep simulation context.
 */
export async function consultAiAdvisor(
  prompt: string,
  role: 'CFO' | 'Political Strategist' | 'Executive Coach' | 'Investment Banker' | 'Health Specialist' | 'Senior Strategic Advisor' = 'Senior Strategic Advisor',
  state: GameState,
  targetCompany?: Company
): Promise<AiConsultationResponse> {
  const fullContext = buildComprehensiveAiAdvisorContext(state, targetCompany);
  const diffs = fullContext.diffs;
  const netWorth = fullContext.finances.netWorth;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 11000);

    const res = await fetch('/api/ai/consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt, 
        role, 
        context: fullContext 
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.answer) {
        return {
          ...data,
          contextSummary: {
            netWorth,
            netWorthChange3M: diffs.diff3M.netWorthChangePct,
            netWorthChange3MFormatted: `${diffs.diff3M.netWorthChangePct >= 0 ? '+' : ''}${diffs.diff3M.netWorthChangePct}%`,
            cash: state.finances.cash,
            powerTier: state.playerPowerProfile?.powerTier || 'UNKNOWN',
            powerScore: state.playerPowerProfile?.powerScore || 0,
            activeChainsCount: state.activeEventChains?.length || 0,
            pendingDecisionsCount: state.pendingDecisions?.length || 0,
            businessCycle: fullContext.worldConditions.businessCycle
          }
        };
      }
    }
  } catch (err) {
    // Graceful fallback to rich deterministic engine
  }

  return generateDeterministicConsultation(prompt, role, state, targetCompany, fullContext);
}

/**
 * Deterministic consultation engine that calculates exact causal answers referencing real simulation values.
 */
export function generateDeterministicConsultation(
  prompt: string,
  role: string,
  state: GameState,
  company?: Company,
  providedContext?: ReturnType<typeof buildComprehensiveAiAdvisorContext>
): AiConsultationResponse {
  const context = providedContext || buildComprehensiveAiAdvisorContext(state, company);
  const netWorth = context.finances.netWorth;
  const diffs = context.diffs;
  const query = prompt.toLowerCase();
  const primaryCompany = company || state.companies[0];
  const powerProfile = state.playerPowerProfile;

  const dataPoints: string[] = [
    `Net Worth: $${netWorth.toLocaleString()}`,
    `3M Net Worth Delta: ${diffs.diff3M.netWorthChangePct >= 0 ? '+' : ''}${diffs.diff3M.netWorthChangePct}% ($${diffs.diff3M.netWorthChangeVal.toLocaleString()})`,
    `Power Tier: ${powerProfile?.powerTier || 'UNKNOWN'} (${powerProfile?.powerScore || 0} pts)`,
    `Macro Cycle: ${context.worldConditions.businessCycle} (Benchmark: ${context.worldConditions.centralBankInterestRate})`
  ];

  // 1. "Why did my net worth fall?" / "Why did my net worth change?"
  if (query.includes('net worth') || query.includes('why did my money') || query.includes('wealth drop') || query.includes('wealth change') || query.includes('worth fall')) {
    const pct3M = diffs.diff3M.netWorthChangePct;
    const val3M = diffs.diff3M.netWorthChangeVal;
    const stockVal = context.finances.totalStockValue;
    const debtVal = context.finances.totalDebt;
    const compEquity = context.finances.totalBusinessEquity;

    let primaryDriver = 'steady balance sheet performance.';
    const driversList: string[] = [];

    if (pct3M < 0) {
      if (stockVal > 0) driversList.push(`capital market volatility in your investment portfolio`);
      if (debtVal > 500000) driversList.push(`debt obligations and interest expenses of $${debtVal.toLocaleString()}`);
      if (primaryCompany && primaryCompany.monthlyNetProfit < 0) driversList.push(`operating losses of $${Math.abs(primaryCompany.monthlyNetProfit).toLocaleString()}/mo in ${primaryCompany.name}`);
      if (diffs.diff3M.cashChangeVal < -50000) driversList.push(`recent capital outlays reducing liquid cash by $${Math.abs(diffs.diff3M.cashChangeVal).toLocaleString()}`);
      primaryDriver = driversList.length > 0 ? driversList.join(', ') : 'macroeconomic business cycle contractions and monthly living outlays.';

      const answer = `Your net worth has shifted ${pct3M}% ($${val3M.toLocaleString()}) over the last three months, primarily because of ${primaryDriver}. Liquid cash stands at $${state.finances.cash.toLocaleString()}, with total business equity valued at $${compEquity.toLocaleString()}.`;

      return {
        sourceRole: 'Chief Financial Officer (CFO)',
        answer,
        recommendations: [
          'Maintain a minimum liquid reserve of 6 months of combined personal and enterprise burn.',
          'Hedge equity exposures against elevated central bank benchmark interest rates.',
          'Review capital expenditure schedules and postpone non-essential M&A allocations.'
        ],
        riskAssessment: Math.abs(pct3M) > 15 ? 'Critical Balance Sheet Drawdown' : 'Manageable Market Fluctuation',
        dataPointsReferenced: dataPoints,
        contextSummary: {
          netWorth,
          netWorthChange3M: pct3M,
          netWorthChange3MFormatted: `${pct3M}%`,
          cash: state.finances.cash,
          powerTier: powerProfile?.powerTier || 'UNKNOWN',
          powerScore: powerProfile?.powerScore || 0,
          activeChainsCount: state.activeEventChains?.length || 0,
          pendingDecisionsCount: state.pendingDecisions?.length || 0,
          businessCycle: context.worldConditions.businessCycle
        }
      };
    } else {
      const answer = `Your net worth expanded +${pct3M}% (+$${Math.abs(val3M).toLocaleString()}) over the past three months, driven by corporate equity appreciation, retained operating earnings, and compounding asset returns. Total net worth is now $${netWorth.toLocaleString()}.`;
      return {
        sourceRole: 'Chief Financial Officer (CFO)',
        answer,
        recommendations: [
          'Reallocate surplus corporate dividends into diversified income-generating assets.',
          'De-lever any floating-rate debt to protect return on equity against rate hikes.',
          'Audit supply chain efficiency to lock in margin gains.'
        ],
        riskAssessment: 'Strong Capital Accumulation',
        dataPointsReferenced: dataPoints,
        contextSummary: {
          netWorth,
          netWorthChange3M: pct3M,
          netWorthChange3MFormatted: `+${pct3M}%`,
          cash: state.finances.cash,
          powerTier: powerProfile?.powerTier || 'UNKNOWN',
          powerScore: powerProfile?.powerScore || 0,
          activeChainsCount: state.activeEventChains?.length || 0,
          pendingDecisionsCount: state.pendingDecisions?.length || 0,
          businessCycle: context.worldConditions.businessCycle
        }
      };
    }
  }

  // 2. "What changed?"
  if (query.includes('what changed') || query.includes('summary of changes') || query.includes('recent changes') || query.includes('status update')) {
    const netDiff = diffs.diff3M.netWorthChangePct;
    const compCount = state.companies.length;
    const office = state.politics.currentOffice.title;
    const tier = powerProfile?.powerTier || 'UNKNOWN';
    const recentDecCount = (state.decisionHistory || []).length;
    const recentCsqCount = (state.consequenceHistory || []).length;

    const answer = `Over the past quarter: Your Net Worth moved ${netDiff >= 0 ? '+' : ''}${netDiff}% to $${netWorth.toLocaleString()}. Liquid reserves stand at $${state.finances.cash.toLocaleString()}. You currently control ${compCount} registered enterprise${compCount === 1 ? '' : 's'}, hold the public rank of "${office}", and sit at the "${tier}" Power Tier (${powerProfile?.powerScore || 0} pts). A total of ${recentDecCount} strategic decisions and ${recentCsqCount} consequence records are tracked in your dossier.`;

    return {
      sourceRole: 'Senior Strategic Advisor',
      answer,
      recommendations: [
        'Review the Decision Inbox for pending urgent strategic dilemmas.',
        'Monitor active multi-stage event chains for critical choice junctures.',
        'Ensure health attributes (Health: ' + Math.round(state.character.attributes.health) + '/100, Stress: ' + Math.round(state.character.attributes.stress) + '/100) are balanced.'
      ],
      riskAssessment: state.character.attributes.stress > 60 ? 'Elevated Executive Stress' : 'Operational Equilibrium',
      dataPointsReferenced: dataPoints
    };
  }

  // 3. "What decisions caused this?"
  if (query.includes('what decisions') || query.includes('caused this') || query.includes('decision history') || query.includes('consequences of my decisions')) {
    const recentDecs = (state.decisionHistory || []).slice(0, 3);
    const recentCsqs = (state.consequenceHistory || []).slice(0, 3);

    let decDetails = 'No major recorded strategic decisions in recent cycles.';
    if (recentDecs.length > 0) {
      decDetails = recentDecs.map(d => `"${d.title}" (${d.category}, ${d.result || 'executed'})`).join('; ');
    }

    let csqDetails = '';
    if (recentCsqs.length > 0) {
      csqDetails = ` Resulting systemic consequences included: ${recentCsqs.map(c => `${c.source}: ${c.description} (${c.change || ''})`).join('; ')}.`;
    }

    const answer = `Tracing your historical causality chain: Your recent milestone decisions include: ${decDetails}.${csqDetails} Every choice creates persistent downstream consequences across balance sheets and world influence.`;

    return {
      sourceRole: 'Executive Strategy & Risk Analyst',
      answer,
      recommendations: [
        'Evaluate the risk profile and long-term delayed consequences before committing capital.',
        'Use the Consequence History tracker to inspect the exact before/after metrics of past actions.',
        'Avoid high-risk options during macro downturns unless backed by substantial cash reserves.'
      ],
      riskAssessment: 'Causal Tracking Verified',
      dataPointsReferenced: dataPoints
    };
  }

  // 4. "What happened to my company?"
  if (query.includes('company') || query.includes('business') || query.includes('enterprise') || query.includes('profit') || query.includes('revenue')) {
    if (!primaryCompany) {
      return {
        sourceRole: 'Investment Banker & M&A Advisor',
        answer: `You do not currently own an active corporate entity. You can incorporate a new business or acquire a distressed enterprise from the Corporate Empire Hub.`,
        recommendations: [
          'Build an initial seed fund of at least $50,000 before incorporation.',
          'Target high-margin sectors like Technology, Renewable Energy, or Financial Services.',
          'Recruit high-competence executives to delegate operational burdens.'
        ],
        riskAssessment: 'No Enterprise Risk',
        dataPointsReferenced: dataPoints
      };
    }

    const answer = `${primaryCompany.name} is currently valued at $${primaryCompany.valuation.toLocaleString()} with you holding ${primaryCompany.playerOwnershipPercentage}% equity ($${Math.round((primaryCompany.valuation * primaryCompany.playerOwnershipPercentage) / 100).toLocaleString()}). Monthly revenue stands at $${primaryCompany.monthlyRevenue.toLocaleString()} against expenses of $${primaryCompany.monthlyExpenses.toLocaleString()}, generating $${primaryCompany.monthlyNetProfit.toLocaleString()}/month in net earnings. Headcount is ${primaryCompany.employeesCount} with employee morale at ${primaryCompany.employeeMorale}/100.`;

    return {
      sourceRole: 'Chief Executive Consultant',
      answer,
      recommendations: [
        'Optimize pricing strategy (' + primaryCompany.pricingStrategy + ') to protect market share (' + primaryCompany.marketShare + '%).',
        'Maintain corporate cash reserves (current: $' + primaryCompany.cashReserve.toLocaleString() + ') to absorb supplier cost shocks.',
        'Appoint experienced executives (CFO/COO) to increase organizational productivity.'
      ],
      riskAssessment: primaryCompany.monthlyNetProfit < 0 ? 'Negative Operating Cash Flow' : 'Profitable Enterprise Operation',
      dataPointsReferenced: [
        `${primaryCompany.name} Valuation: $${primaryCompany.valuation.toLocaleString()}`,
        `Monthly Net Profit: $${primaryCompany.monthlyNetProfit.toLocaleString()}`,
        `Headcount: ${primaryCompany.employeesCount}`,
        ...dataPoints
      ]
    };
  }

  // 5. "What are my biggest risks?"
  if (query.includes('risk') || query.includes('danger') || query.includes('threat') || query.includes('vulnerability')) {
    const risks: string[] = [];
    if (state.finances.cash < 25000) risks.push('Low liquidity buffer ($' + state.finances.cash.toLocaleString() + ') makes you vulnerable to sudden cash calls');
    if (state.character.attributes.stress > 60) risks.push('High executive stress (' + Math.round(state.character.attributes.stress) + '/100) accelerates burnout risk');
    if (state.character.attributes.health < 45) risks.push('Declining health (' + Math.round(state.character.attributes.health) + '/100) poses acute mortality risk');
    if (powerProfile && powerProfile.scrutiny > 50) risks.push('Elevated regulatory scrutiny (' + powerProfile.scrutiny + '/100) increases audit and antitrust vulnerability');
    if (context.worldConditions.businessCycle === 'Recession' || context.worldConditions.businessCycle === 'Slowdown') {
      risks.push('Macroeconomic ' + context.worldConditions.businessCycle + ' cycle compresses asset valuations and consumer demand');
    }
    if (state.politics.currentOffice.inOffice && state.politics.currentOffice.approvalRating < 40) {
      risks.push('Public approval deficit (' + state.politics.currentOffice.approvalRating + '%) threatens next electoral cycle');
    }

    const answer = risks.length > 0 
      ? `Our risk assessment identifies the following primary vulnerabilities: 1) ${risks.join('. 2) ')}.`
      : `Your strategic position is robust. Liquidity balance ($${state.finances.cash.toLocaleString()}), health (${Math.round(state.character.attributes.health)}/100), and debt coverage ratios remain in conservative safety corridors.`;

    return {
      sourceRole: 'Chief Risk Officer (CRO)',
      answer,
      recommendations: [
        'Prioritize health restoration and vacation days if stress surpasses 50.',
        'Keep total debt service under 35% of monthly gross income.',
        'Maintain regulatory compliance to reduce systemic scrutiny scores.'
      ],
      riskAssessment: risks.length > 2 ? 'High Systemic Exposure' : 'Controlled Operational Risk',
      dataPointsReferenced: dataPoints
    };
  }

  // 6. "What should I focus on?"
  if (query.includes('focus') || query.includes('what should i do') || query.includes('priority') || query.includes('roadmap') || query.includes('next steps')) {
    const tier = powerProfile?.powerTier || 'UNKNOWN';
    const nextTier = powerProfile?.nextTier || 'MAX';
    const ptsNeeded = powerProfile?.pointsToNextTier || 0;
    const pendingCount = state.pendingDecisions.length;

    const answer = `At age ${state.character.age} in the "${tier}" Power Tier (${powerProfile?.powerScore || 0} pts), your strategic roadmap centers on: 1) Resolving ${pendingCount} pending decision${pendingCount === 1 ? '' : 's'} in your inbox; 2) Earning ${ptsNeeded} more power points to ascend to "${nextTier}"; and 3) Expanding cashflow from enterprise equity and diversified assets.`;

    return {
      sourceRole: 'Senior Strategic Advisor',
      answer,
      recommendations: [
        'Check the Decision Inbox to resolve expiring high-urgency proposals.',
        'Scale company revenues or complete capital projects to boost Power Score.',
        'Cultivate high-trust mentor and political alliances in the Family & Network Hub.'
      ],
      riskAssessment: 'Strategic Expansion Priority',
      dataPointsReferenced: dataPoints
    };
  }

  // 7. "Why am I receiving more media attention?"
  if (query.includes('media') || query.includes('press') || query.includes('news') || query.includes('public attention') || query.includes('scrutiny')) {
    const mediaAttn = powerProfile?.mediaAttention || 5;
    const visibility = powerProfile?.visibility || 5;
    const scrutiny = powerProfile?.scrutiny || 5;
    const tier = powerProfile?.powerTier || 'UNKNOWN';

    const answer = `Your media profile reflects a Media Attention score of ${mediaAttn}/100 and Visibility of ${visibility}/100 at the "${tier}" Power Tier. Major financial transactions, public office roles ("${state.politics.currentOffice.title}"), and expanding corporate market share naturally amplify journalistic coverage and regulatory scrutiny (${scrutiny}/100).`;

    return {
      sourceRole: 'Chief Communications Officer & Publicist',
      answer,
      recommendations: [
        'Leverage high media visibility to promote brand reputation and political capital.',
        'Retain top-tier legal counsel when scrutiny surpasses 60 to prevent investigative fallout.',
        'Engage in high-profile philanthropy to maintain favorable social sentiment.'
      ],
      riskAssessment: scrutiny > 60 ? 'Elevated Public & Regulatory Exposure' : 'Normal Media Footprint',
      dataPointsReferenced: [
        `Media Attention: ${mediaAttn}/100`,
        `Visibility: ${visibility}/100`,
        `Scrutiny: ${scrutiny}/100`,
        ...dataPoints
      ]
    };
  }

  // 8. "Why has my political influence changed?"
  if (query.includes('politic') || query.includes('influence') || query.includes('approval') || query.includes('office') || query.includes('election')) {
    const polInfluence = powerProfile?.politicalInfluence || 2;
    const approval = state.politics.currentOffice.approvalRating;
    const capital = state.politics.currentOffice.politicalCapital;
    const inOffice = state.politics.currentOffice.inOffice;

    const answer = `Your political influence score is currently ${polInfluence}/100. As "${state.politics.currentOffice.title}" (${inOffice ? 'In Office' : 'Private Citizen'}), your public approval stands at ${approval}% with ${capital} accumulated political capital. Policy enactments and business prestige directly feed your institutional reach.`;

    return {
      sourceRole: 'Chief Political Strategist',
      answer,
      recommendations: [
        'Organize fundraising galas to increase political capital reserves.',
        'Align national policy proposals with prevailing electorate demands.',
        'Leverage corporate endorsements to build cross-party coalitions.'
      ],
      riskAssessment: approval < 45 ? 'Challenging Polling Deficit' : 'Solid Electorate Standing',
      dataPointsReferenced: [
        `Political Influence: ${polInfluence}/100`,
        `Approval Rating: ${approval}%`,
        `Political Capital: ${capital} pts`,
        ...dataPoints
      ]
    };
  }

  // 9. "How has my family situation changed?"
  if (query.includes('family') || query.includes('marriage') || query.includes('spouse') || query.includes('child') || query.includes('relationship') || query.includes('heir')) {
    const spouse = state.relationships.find(r => r.relation === 'Spouse');
    const children = state.relationships.filter(r => r.relation === 'Son' || r.relation === 'Daughter');
    const heir = state.relationships.find(r => r.id === state.dynastyHeirId);
    const avgTrust = context.family.averageFamilyTrust;

    const answer = `Your family profile: Marital Status is ${spouse ? `Married to ${spouse.name} (Trust: ${spouse.trust}%, Love: ${spouse.love}%)` : 'Single'}. You have ${children.length} child${children.length === 1 ? '' : 'ren'}. Average relationship trust across all ${state.relationships.length} tracked contacts is ${avgTrust}/100. Nominated dynastic heir: ${heir ? heir.name : 'None selected'}.`;

    return {
      sourceRole: 'Family & Dynasty Counselor',
      answer,
      recommendations: [
        'Spend quality time and fund family gifts to maintain marital love above 80.',
        'Nominate a qualified heir candidate early to ensure orderly succession.',
        'Cultivate high trust with mentors and business partners for network synergies.'
      ],
      riskAssessment: avgTrust < 50 ? 'Relationship Friction Detected' : 'Harmonious Family Network',
      dataPointsReferenced: [
        `Marital Status: ${context.family.maritalStatus}`,
        `Children: ${children.length}`,
        `Average Family Trust: ${avgTrust}/100`,
        ...dataPoints
      ]
    };
  }

  // General Executive Consultation
  return {
    sourceRole: role || 'Senior Strategic Advisor',
    answer: `At age ${state.character.age}, your personal net worth of $${netWorth.toLocaleString()} and "${powerProfile?.powerTier || 'UNKNOWN'}" Power Tier (${powerProfile?.powerScore || 0} pts) provide significant strategic leverage. The national economy is operating in a ${context.worldConditions.businessCycle} cycle with central bank rates at ${context.worldConditions.centralBankInterestRate}. Focus on disciplined capital deployment, risk hedging, and power tier ascension.`,
    recommendations: [
      'Check the Decision Inbox to review and execute pending strategic dilemmas.',
      'Maintain adequate liquid reserves against macroeconomic volatility.',
      'Balance executive workload to keep stress under 50 and health above 75.'
    ],
    riskAssessment: 'Stable Strategic Trajectory',
    dataPointsReferenced: dataPoints,
    contextSummary: {
      netWorth,
      netWorthChange3M: diffs.diff3M.netWorthChangePct,
      netWorthChange3MFormatted: `${diffs.diff3M.netWorthChangePct >= 0 ? '+' : ''}${diffs.diff3M.netWorthChangePct}%`,
      cash: state.finances.cash,
      powerTier: powerProfile?.powerTier || 'UNKNOWN',
      powerScore: powerProfile?.powerScore || 0,
      activeChainsCount: state.activeEventChains?.length || 0,
      pendingDecisionsCount: state.pendingDecisions?.length || 0,
      businessCycle: context.worldConditions.businessCycle
    }
  };
}

export function generateEventExplanation(title: string, category: string, state: GameState): string {
  const country = state.world[state.currentCountryIndex];
  const matchingEvent = (state.eventsFeed || []).find(e => e.title === title);

  if (matchingEvent && matchingEvent.triggerReason) {
    return `Causal Origin: "${matchingEvent.triggerReason}" | Evaluated under ${country?.name}'s ${country?.businessCycle} economic cycle (Interest Rate: ${country?.centralBankInterestRate}%, Inflation: ${country?.inflationRate}%).`;
  }

  return `This outcome emerged from the interplay of ${country?.name}'s current ${country?.businessCycle} economic cycle, prevailing benchmark interest rates of ${country?.centralBankInterestRate}%, and your character's current reputation (${Math.round(state.character.attributes.reputation)}/100) and stress levels (${Math.round(state.character.attributes.stress)}/100).`;
}
