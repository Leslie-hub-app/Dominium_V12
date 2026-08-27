import { 
  GameState, 
  SimulationDiff, 
  SimulationSnapshot,
  MetricTransition,
  SimulationEvent, 
  SimulationEventChoice, 
  PendingDecision, 
  Company,
  PowerTier,
  LifeEvent,
  NewsItem
} from '../types';
import { ConsequenceEngine } from './consequenceEngine';
import { isEventOnCooldown, getRemainingCooldownMonths } from './eventControlEngine';
import { filterEventsByPowerTier, filterDecisionsByPowerTier, isPowerTierAtLeast } from './powerTierEngine';

function formatCurrency(val: number): string {
  const sign = val < 0 ? '-' : '';
  const abs = Math.abs(Math.round(val));
  return `${sign}$${abs.toLocaleString()}`;
}

function formatChange(val: number, isCurrency = true, unit = ''): string {
  if (val === 0) return isCurrency ? '$0' : '0' + unit;
  const sign = val > 0 ? '+' : '-';
  const abs = Math.abs(Math.round(val));
  return `${sign}${isCurrency ? '$' : ''}${abs.toLocaleString()}${unit}`;
}

export function calculateMonthlyIncome(state: GameState): number {
  let income = 0;
  if (state.currentJob) {
    income += state.currentJob.monthlySalary || 0;
  }
  if (state.sports?.personalAthleteCareer?.isPro) {
    income += state.sports.personalAthleteCareer.salaryMonthly || 0;
  }
  for (const prop of state.finances.properties) {
    income += prop.monthlyRent || 0;
  }
  for (const comp of state.companies) {
    if (comp.monthlyNetProfit > 0 && comp.dividendPayoutRatio > 0) {
      income += Math.round(comp.monthlyNetProfit * comp.dividendPayoutRatio * (comp.playerOwnershipPercentage / 100));
    }
  }
  return Math.round(income);
}

export function calculateMonthlyExpenses(state: GameState): number {
  let expenses = state.finances.monthlyBaseExpenses || 1200;
  for (const loan of state.finances.loans) {
    if (loan.remainingBalance > 0) {
      expenses += loan.monthlyPayment || 0;
    }
  }
  for (const prop of state.finances.properties) {
    if (prop.mortgage && prop.mortgage.remainingBalance > 0) {
      expenses += prop.mortgage.monthlyPayment || 0;
    }
  }
  return Math.round(expenses);
}

/**
 * Creates a complete state snapshot of the simulation at a given moment.
 */
export function createSimulationSnapshot(state: GameState): SimulationSnapshot {
  const cash = Math.round(state.finances.cash);
  const totalDebt = Math.round(
    state.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0) +
    state.finances.properties.reduce((acc, p) => acc + (p.mortgage?.remainingBalance || 0), 0)
  );

  const stockValue = Math.round(state.finances.stocks.reduce((acc, s) => acc + s.sharesOwned * s.currentPrice, 0));
  const propertyValue = Math.round(state.finances.properties.reduce((acc, p) => acc + p.currentValue, 0));
  const businessEquityValue = Math.round(
    state.companies.reduce((acc, c) => acc + (c.valuation * (c.playerOwnershipPercentage / 100)), 0)
  );
  const sportsVal = Math.round(state.sports.ownedTeams.reduce((acc, t) => acc + t.valuation, 0));
  const projectVal = Math.round(
    state.projects.reduce((acc, p) => acc + (p.completed ? p.capitalInvested * 1.25 : p.capitalInvested), 0)
  );
  const otherAssetsValue = sportsVal + projectVal;

  const netWorth = (cash + stockValue + propertyValue + businessEquityValue + otherAssetsValue) - totalDebt;
  const monthlyIncome = calculateMonthlyIncome(state);
  const monthlyExpenses = calculateMonthlyExpenses(state);

  const totalRevenue = Math.round(state.companies.reduce((acc, c) => acc + c.monthlyRevenue, 0));
  const totalProfit = Math.round(state.companies.reduce((acc, c) => acc + c.monthlyNetProfit, 0));
  const totalBusinessValuation = Math.round(state.companies.reduce((acc, c) => acc + c.valuation, 0));
  const totalEmployees = state.companies.reduce((acc, c) => acc + c.employeesCount, 0);

  const spouse = state.relationships.find(r => r.relation === 'Spouse');
  const children = state.relationships.filter(r => r.relation === 'Son' || r.relation === 'Daughter');

  let maritalStatus: 'Single' | 'Dating' | 'Married' | 'Widowed' | 'Divorced' = 'Single';
  if (spouse) {
    maritalStatus = spouse.alive ? 'Married' : 'Widowed';
  } else if (state.relationships.some(r => r.relation === 'Partner')) {
    maritalStatus = 'Dating';
  }

  const currOffice = state.politics.currentOffice;
  const country = state.world[state.currentCountryIndex] || state.world[0];

  const approval = currOffice ? currOffice.approvalRating : 50;
  const socialSent = state.character.socialSentiment || 50;
  const powerProfile = state.playerPowerProfile;
  const publicInfluence = powerProfile ? powerProfile.publicInfluence : state.character.attributes.worldInfluence;
  const pollingSupport = Math.min(100, Math.max(0, Math.round((approval * 0.45) + (socialSent * 0.35) + (publicInfluence * 0.20))));

  let businessCycle = 'Steady Expansion';
  if (country.gdpGrowthRate < 0) {
    businessCycle = 'Recessionary Downturn';
  } else if (country.gdpGrowthRate < 1.5) {
    businessCycle = 'Economic Slowdown';
  } else if (country.gdpGrowthRate > 3.8) {
    businessCycle = 'Macro Expansion Boom';
  }

  return {
    month: state.currentMonth,
    year: state.currentYear,
    tick: state.simulationTick,
    age: state.character.age,

    // Finance
    cash,
    netWorth,
    monthlyIncome,
    monthlyExpenses,
    totalDebt,
    stockValue,
    propertyValue,
    businessEquityValue,
    otherAssetsValue,

    // Investments
    stocks: state.finances.stocks.map(s => ({
      symbol: s.symbol,
      name: s.name,
      sharesOwned: s.sharesOwned,
      currentPrice: s.currentPrice,
      totalValue: Math.round(s.sharesOwned * s.currentPrice)
    })),
    properties: state.finances.properties.map(p => ({
      id: p.id,
      name: p.name,
      currentValue: p.currentValue,
      monthlyRent: p.monthlyRent,
      mortgageDebt: p.mortgage ? p.mortgage.remainingBalance : 0
    })),
    otherInvestments: [
      ...state.sports.ownedTeams.map(t => ({ name: t.name, type: 'Sports Franchise', value: t.valuation })),
      ...state.projects.map(p => ({ name: p.name, type: p.type, value: p.capitalInvested }))
    ],

    // Business
    totalRevenue,
    totalProfit,
    totalBusinessValuation,
    totalEmployees,
    companies: state.companies.map(c => ({
      id: c.id,
      name: c.name,
      industry: c.industry,
      monthlyRevenue: c.monthlyRevenue,
      monthlyNetProfit: c.monthlyNetProfit,
      valuation: c.valuation,
      employeesCount: c.employeesCount,
      playerOwnershipPercentage: c.playerOwnershipPercentage
    })),

    // Personal
    health: Math.round(state.character.attributes.health),
    stress: Math.round(state.character.attributes.stress),
    happiness: Math.round(state.character.attributes.happiness),
    careerTitle: state.currentJob ? state.currentJob.title : 'Self-Employed / Private Tycoon',
    careerSalary: state.currentJob ? state.currentJob.monthlySalary : 0,
    reputation: Math.round(state.character.attributes.reputation),
    worldInfluence: Math.round(state.character.attributes.worldInfluence),

    // Family
    maritalStatus,
    spouseName: spouse ? spouse.name : undefined,
    childrenCount: children.length,
    childrenNames: children.map(c => c.name),
    relationshipsCount: state.relationships.length,

    // Politics
    officeTitle: currOffice ? currOffice.title : 'Private Citizen',
    inOffice: currOffice ? currOffice.inOffice : false,
    approvalRating: currOffice ? currOffice.approvalRating : 0,
    politicalCapital: currOffice ? currOffice.politicalCapital : 0,
    publicInfluence,
    pollingSupport,

    // World
    countryName: country.name,
    gdpGrowthRate: Number(country.gdpGrowthRate.toFixed(2)),
    inflationRate: Number(country.inflationRate.toFixed(2)),
    interestRate: Number(country.centralBankInterestRate.toFixed(2)),
    economicClimate: country.politicalStability > 70 ? 'Strong Growth & Low Volatility' : country.politicalStability > 40 ? 'Moderate Market Volatility' : 'High Uncertainty & Tight Liquidity',
    businessCycle
  };
}

function makeTransition(prev: number, curr: number, isCurrency = true, unit = ''): MetricTransition {
  const change = curr - prev;
  const percentChange = prev !== 0 ? ((change / Math.abs(prev)) * 100) : 0;
  return {
    previous: prev,
    current: curr,
    change,
    percentChange: Number(percentChange.toFixed(2)),
    formattedPrevious: isCurrency ? formatCurrency(prev) : `${prev.toLocaleString()}${unit}`,
    formattedCurrent: isCurrency ? formatCurrency(curr) : `${curr.toLocaleString()}${unit}`,
    formattedChange: formatChange(change, isCurrency, unit)
  };
}

/**
 * Calculates a comprehensive diff between two consecutive game states.
 */
export function calculateSimulationDiff(
  prevState: GameState, 
  currentState: GameState,
  monthlyEvents?: LifeEvent[],
  monthlyNews?: NewsItem[]
): SimulationDiff {
  const snapBefore = createSimulationSnapshot(prevState);
  const snapAfter = createSimulationSnapshot(currentState);

  const cashTransition = makeTransition(snapBefore.cash, snapAfter.cash, true);
  const netWorthTransition = makeTransition(snapBefore.netWorth, snapAfter.netWorth, true);
  const incomeTransition = makeTransition(snapBefore.monthlyIncome, snapAfter.monthlyIncome, true, '/mo');
  const expensesTransition = makeTransition(snapBefore.monthlyExpenses, snapAfter.monthlyExpenses, true, '/mo');
  const debtTransition = makeTransition(snapBefore.totalDebt, snapAfter.totalDebt, true);

  // Investments Transition
  const stockValueTransition = makeTransition(snapBefore.stockValue, snapAfter.stockValue, true);
  const propertyValueTransition = makeTransition(snapBefore.propertyValue, snapAfter.propertyValue, true);
  const otherAssetsTransition = makeTransition(snapBefore.otherAssetsValue, snapAfter.otherAssetsValue, true);

  const stockItems = currentState.finances.stocks.map(s => {
    const prevStock = prevState.finances.stocks.find(ps => ps.symbol === s.symbol);
    const prevPrice = prevStock ? prevStock.currentPrice : s.currentPrice;
    return {
      name: s.name,
      symbol: s.symbol,
      shares: s.sharesOwned,
      price: s.currentPrice,
      totalValue: Math.round(s.sharesOwned * s.currentPrice),
      priceChange: Number((s.currentPrice - prevPrice).toFixed(2))
    };
  });

  const propertyItems = currentState.finances.properties.map(p => {
    const prevProp = prevState.finances.properties.find(pp => pp.id === p.id);
    const prevVal = prevProp ? prevProp.currentValue : p.currentValue;
    return {
      id: p.id,
      name: p.name,
      value: p.currentValue,
      rent: p.monthlyRent,
      valueChange: p.currentValue - prevVal
    };
  });

  const otherItems = snapAfter.otherInvestments;

  // Business Transitions
  const revenueTransition = makeTransition(snapBefore.totalRevenue, snapAfter.totalRevenue, true, '/mo');
  const profitTransition = makeTransition(snapBefore.totalProfit, snapAfter.totalProfit, true, '/mo');
  const valuationTransition = makeTransition(snapBefore.totalBusinessValuation, snapAfter.totalBusinessValuation, true);
  const employeesTransition = makeTransition(snapBefore.totalEmployees, snapAfter.totalEmployees, false);

  const majorCompanyChanges: string[] = [];
  for (const c of currentState.companies) {
    const prevC = prevState.companies.find(pc => pc.id === c.id);
    if (!prevC) {
      majorCompanyChanges.push(`Founded/Acquired new enterprise: ${c.name} in ${c.industry} ($${c.valuation.toLocaleString()} valuation)`);
    } else {
      const revDiff = c.monthlyRevenue - prevC.monthlyRevenue;
      const valDiff = c.valuation - prevC.valuation;
      if (Math.abs(revDiff) >= 5000) {
        majorCompanyChanges.push(`${c.name}: Revenue shifted ${formatChange(revDiff, true)}/mo to $${c.monthlyRevenue.toLocaleString()}/mo`);
      }
      if (Math.abs(valDiff) >= 25000) {
        majorCompanyChanges.push(`${c.name}: Enterprise valuation adjusted ${formatChange(valDiff, true)} to $${c.valuation.toLocaleString()}`);
      }
      if (c.employeesCount !== prevC.employeesCount) {
        majorCompanyChanges.push(`${c.name}: Headcount changed by ${c.employeesCount - prevC.employeesCount > 0 ? '+' : ''}${c.employeesCount - prevC.employeesCount} (Total: ${c.employeesCount})`);
      }
    }
  }

  // Personal Transitions
  const healthTransition = makeTransition(snapBefore.health, snapAfter.health, false, '%');
  const stressTransition = makeTransition(snapBefore.stress, snapAfter.stress, false, '%');
  const happinessTransition = makeTransition(snapBefore.happiness, snapAfter.happiness, false, '%');
  const reputationTransition = makeTransition(snapBefore.reputation, snapAfter.reputation, false, ' pts');
  const worldInfluenceTransition = makeTransition(snapBefore.worldInfluence, snapAfter.worldInfluence, false, ' pts');

  let careerChangeText = '';
  if (prevState.currentJob?.title !== currentState.currentJob?.title) {
    careerChangeText = currentState.currentJob ? `Transitioned to ${currentState.currentJob.title}` : 'Left previous employment';
  } else if (prevState.currentJob && currentState.currentJob && prevState.currentJob.monthlySalary !== currentState.currentJob.monthlySalary) {
    const salDiff = currentState.currentJob.monthlySalary - prevState.currentJob.monthlySalary;
    careerChangeText = `Salary adjusted ${formatChange(salDiff, true)}/mo`;
  }

  // Family Transitions
  const majorRelationshipChanges: string[] = [];
  for (const currRel of currentState.relationships) {
    const prevRel = prevState.relationships.find(pr => pr.id === currRel.id);
    if (!prevRel) {
      majorRelationshipChanges.push(`Formed new bond: ${currRel.name} (${currRel.relation})`);
    } else {
      const trustD = currRel.trust - prevRel.trust;
      const loveD = currRel.love - prevRel.love;
      if (Math.abs(trustD) >= 5 || Math.abs(loveD) >= 5) {
        majorRelationshipChanges.push(`${currRel.name} (${currRel.relation}): Trust ${trustD >= 0 ? '+' : ''}${trustD}, Love ${loveD >= 0 ? '+' : ''}${loveD}`);
      }
      if (currRel.relation !== prevRel.relation) {
        majorRelationshipChanges.push(`${currRel.name}: Relationship status evolved to ${currRel.relation}`);
      }
    }
  }

  const familyEventsList: string[] = (monthlyEvents || [])
    .filter(e => e.category === 'Family' || e.category === 'Relationships')
    .map(e => `${e.title}: ${e.description}`);

  let marriageText: string = snapAfter.maritalStatus;
  if (snapAfter.spouseName) {
    marriageText = `Married to ${snapAfter.spouseName}`;
  } else if (snapBefore.maritalStatus !== snapAfter.maritalStatus) {
    marriageText = `Marital status transitioned to ${snapAfter.maritalStatus}`;
  }

  // Politics Transitions
  const approvalTransition = makeTransition(snapBefore.approvalRating, snapAfter.approvalRating, false, '%');
  const influenceTransition = makeTransition(snapBefore.publicInfluence, snapAfter.publicInfluence, false, ' pts');
  const pollingTransition = makeTransition(snapBefore.pollingSupport, snapAfter.pollingSupport, false, '%');

  // World Transitions
  const gdpTransition = makeTransition(snapBefore.gdpGrowthRate, snapAfter.gdpGrowthRate, false, '%');
  const inflationTransition = makeTransition(snapBefore.inflationRate, snapAfter.inflationRate, false, '%');
  const interestRateTransition = makeTransition(snapBefore.interestRate, snapAfter.interestRate, false, '%');

  // Major Events
  const meaningfulEvents = (monthlyEvents || []).filter(e => {
    if (e.severity === 'High' || e.severity === 'Critical') return true;
    if (e.type === 'CRISIS' || e.type === 'MILESTONE' || e.type === 'OPPORTUNITY' || e.type === 'WARNING') return true;
    if (e.consequences && (e.consequences.cashChange || e.consequences.reputationChange || e.consequences.healthChange)) return true;
    if (e.category === 'Business' || e.category === 'Politics' || e.category === 'Career') return true;
    return false;
  });

  // Opportunities
  const opportunityEvents = (monthlyEvents || []).filter(e => {
    if (e.type === 'OPPORTUNITY') return true;
    const lowTitle = (e.title || '').toLowerCase();
    const lowDesc = (e.description || '').toLowerCase();
    return lowTitle.includes('opportunity') || lowTitle.includes('expansion') || lowTitle.includes('promot') || lowTitle.includes('venture') || lowDesc.includes('opportunity');
  });

  // Detected Risks
  const detectedRisks: SimulationDiff['risks'] = [];
  (monthlyEvents || []).forEach(e => {
    if (e.type === 'WARNING' || e.type === 'CRISIS' || e.severity === 'Critical' || e.severity === 'High') {
      detectedRisks.push({
        id: e.id,
        title: e.title,
        description: e.description,
        severity: e.severity || 'High',
        category: e.category
      });
    }
  });

  // Systemic Financial / Health / Business Risks from actual state
  if (snapAfter.cash < snapAfter.monthlyExpenses * 1.5 && snapAfter.monthlyExpenses > 0) {
    detectedRisks.push({
      title: 'Constrained Cash Buffer',
      description: `Liquid reserves ($${snapAfter.cash.toLocaleString()}) cover less than 2 months of standard living & debt obligations ($${snapAfter.monthlyExpenses.toLocaleString()}/mo).`,
      severity: snapAfter.cash < snapAfter.monthlyExpenses ? 'Critical' : 'High',
      category: 'Finance'
    });
  }

  if (snapAfter.totalDebt > snapAfter.netWorth * 0.7 && snapAfter.totalDebt > 50000) {
    detectedRisks.push({
      title: 'High Balance Sheet Leverage',
      description: `Total liabilities ($${snapAfter.totalDebt.toLocaleString()}) represent over 70% of total asset equity.`,
      severity: 'Medium',
      category: 'Finance'
    });
  }

  if (snapAfter.health < 50) {
    detectedRisks.push({
      title: 'Diminished Physical Vitality',
      description: `Health index dropped to ${snapAfter.health}%. Increased vulnerability to medical events and burnout.`,
      severity: snapAfter.health < 35 ? 'Critical' : 'High',
      category: 'Personal'
    });
  }

  if (snapAfter.stress > 70) {
    detectedRisks.push({
      title: 'Elevated Stress Overload',
      description: `Stress level recorded at ${snapAfter.stress}%. Prolonged stress erodes happiness and executive focus.`,
      severity: snapAfter.stress > 85 ? 'Critical' : 'High',
      category: 'Personal'
    });
  }

  for (const comp of currentState.companies) {
    if (comp.monthlyNetProfit < 0) {
      detectedRisks.push({
        title: `Enterprise Deficit: ${comp.name}`,
        description: `${comp.name} is burning $${Math.abs(comp.monthlyNetProfit).toLocaleString()}/month in negative operating cash flow.`,
        severity: comp.cashReserve < Math.abs(comp.monthlyNetProfit) * 3 ? 'Critical' : 'Medium',
        category: 'Business'
      });
    }
  }

  // Outlook Generation
  const outlook: string[] = [];
  if (currentState.pendingDecisions.length > 0) {
    outlook.push(`${currentState.pendingDecisions.length} pending strategic decision(s) currently await your executive review in the Decision Inbox.`);
  }

  if (snapAfter.monthlyIncome > snapAfter.monthlyExpenses) {
    outlook.push(`Positive monthly net cash flow of +$${(snapAfter.monthlyIncome - snapAfter.monthlyExpenses).toLocaleString()}/mo will steadily build liquid reserves.`);
  } else if (snapAfter.monthlyIncome < snapAfter.monthlyExpenses) {
    outlook.push(`Net monthly cash deficit of -$${(snapAfter.monthlyExpenses - snapAfter.monthlyIncome).toLocaleString()}/mo requires expense rationalization or revenue growth.`);
  }

  if (snapAfter.interestRate >= 5.5) {
    outlook.push(`Elevated central bank interest rates (${snapAfter.interestRate}%) increase borrowing costs and reward capital preservation.`);
  }

  if (currentState.projects.some(p => !p.completed)) {
    const activeP = currentState.projects.find(p => !p.completed);
    if (activeP) {
      const remaining = activeP.durationMonths - activeP.monthsProgress;
      outlook.push(`Landmark Project "${activeP.name}" is ${Math.round((activeP.monthsProgress / activeP.durationMonths) * 100)}% complete with ${remaining} month(s) remaining.`);
    }
  }

  if (snapAfter.stress > 65 || snapAfter.health < 60) {
    outlook.push(`Personal wellness requires attention: prioritize rest, medical checkups, or delegation to avoid executive fatigue.`);
  }

  if (currentState.politics.currentOffice?.inOffice) {
    outlook.push(`Office tenure as ${currentState.politics.currentOffice.title} requires active political capital management (Current approval: ${currentState.politics.currentOffice.approvalRating}%).`);
  }

  if (outlook.length === 0) {
    outlook.push('Operational trajectory is steady. Monitor corporate earnings and capital allocations for expansion windows.');
  }

  // Executive Summary Generation
  const netWorthDeltaStr = formatChange(netWorthTransition.change, true);
  const netWorthPctStr = netWorthTransition.percentChange !== 0 ? ` (${netWorthTransition.percentChange > 0 ? '+' : ''}${netWorthTransition.percentChange}%)` : '';
  const cashDeltaStr = formatChange(cashTransition.change, true);
  
  let summaryDetails = `In Month ${currentState.currentMonth}, ${currentState.currentYear}, net worth shifted by ${netWorthDeltaStr}${netWorthPctStr} to reach $${snapAfter.netWorth.toLocaleString()}. Cash balance closed at $${snapAfter.cash.toLocaleString()} (${cashDeltaStr}). `;
  
  if (snapAfter.companies.length > 0) {
    summaryDetails += `Corporate operations across ${snapAfter.companies.length} enterprise(s) generated $${snapAfter.totalRevenue.toLocaleString()}/mo in total revenue with a net operating profit of $${snapAfter.totalProfit.toLocaleString()}/mo. `;
  } else if (currentState.currentJob) {
    summaryDetails += `Professional career as ${currentState.currentJob.title} provided stable baseline compensation of $${currentState.currentJob.monthlySalary.toLocaleString()}/mo. `;
  }

  if (snapAfter.health < 50 || snapAfter.stress > 70) {
    summaryDetails += `Personal vitals show elevated stress (${snapAfter.stress}%) and reduced physical vitality (${snapAfter.health}%). `;
  } else {
    summaryDetails += `Personal wellness remained resilient at ${snapAfter.health}% health and ${snapAfter.happiness}% happiness. `;
  }

  if (currentState.pendingDecisions.length > 0) {
    summaryDetails += `${currentState.pendingDecisions.length} strategic decision(s) are pending review.`;
  }

  // Legacy diffs for backwards compatibility
  const companyDiffs = currentState.companies.map(currComp => {
    const prevComp = prevState.companies.find(c => c.id === currComp.id);
    const oldRevenue = prevComp ? prevComp.monthlyRevenue : currComp.monthlyRevenue;
    const oldProfit = prevComp ? prevComp.monthlyNetProfit : currComp.monthlyNetProfit;
    const oldMorale = prevComp ? prevComp.employeeMorale : currComp.employeeMorale;
    const oldValuation = prevComp ? prevComp.valuation : currComp.valuation;
    return {
      id: currComp.id,
      name: currComp.name,
      oldRevenue,
      newRevenue: currComp.monthlyRevenue,
      revenueDiff: currComp.monthlyRevenue - oldRevenue,
      revenuePercentChange: oldRevenue > 0 ? ((currComp.monthlyRevenue - oldRevenue) / oldRevenue) * 100 : 0,
      oldProfit,
      newProfit: currComp.monthlyNetProfit,
      profitDiff: currComp.monthlyNetProfit - oldProfit,
      oldMorale,
      newMorale: currComp.employeeMorale,
      moraleDiff: currComp.employeeMorale - oldMorale,
      oldValuation,
      newValuation: currComp.valuation,
      valuationPercentChange: oldValuation > 0 ? ((currComp.valuation - oldValuation) / oldValuation) * 100 : 0
    };
  });

  const propertyDiffs = currentState.finances.properties.map(currProp => {
    const prevProp = prevState.finances.properties.find(p => p.id === currProp.id);
    const oldValue = prevProp ? prevProp.currentValue : currProp.currentValue;
    const oldRent = prevProp ? prevProp.monthlyRent : currProp.monthlyRent;
    return {
      id: currProp.id,
      name: currProp.name,
      condition: currProp.condition,
      valueDiff: currProp.currentValue - oldValue,
      rentDiff: currProp.monthlyRent - oldRent
    };
  });

  const relationshipDiffs = (currentState.relationships || []).map(currRel => {
    const prevRel = (prevState.relationships || []).find(r => r.id === currRel.id);
    const oldTrust = prevRel ? prevRel.trust : currRel.trust;
    const oldLove = prevRel ? prevRel.love : currRel.love;
    return {
      id: currRel.id,
      name: currRel.name,
      relation: currRel.relation,
      oldTrust,
      newTrust: currRel.trust,
      trustDiff: currRel.trust - oldTrust,
      oldLove,
      newLove: currRel.love,
      loveDiff: currRel.love - oldLove
    };
  });

  const projectDiffs = (currentState.projects || []).map(currProj => {
    const progressPercent = currProj.durationMonths > 0 ? Math.min(100, Math.round((currProj.monthsProgress / currProj.durationMonths) * 100)) : 0;
    return {
      id: currProj.id,
      name: currProj.name,
      monthsProgress: currProj.monthsProgress,
      durationMonths: currProj.durationMonths,
      progressPercent,
      completed: currProj.completed,
      status: currProj.status
    };
  });

  let politicsDiff: SimulationDiff['politicsDiff'] | undefined;
  if (currentState.politics.currentOffice) {
    const currOffice = currentState.politics.currentOffice;
    const prevOffice = prevState.politics.currentOffice;
    politicsDiff = {
      title: currOffice.title,
      approvalDiff: currOffice.approvalRating - (prevOffice ? prevOffice.approvalRating : currOffice.approvalRating),
      currentApproval: currOffice.approvalRating,
      capitalDiff: currOffice.politicalCapital - (prevOffice ? prevOffice.politicalCapital : currOffice.politicalCapital),
      currentCapital: currOffice.politicalCapital,
      inOffice: currOffice.inOffice
    };
  }

  return {
    snapshotBefore: snapBefore,
    snapshotAfter: snapAfter,
    month: currentState.currentMonth,
    year: currentState.currentYear,
    executiveSummary: summaryDetails,

    // Structured transitions
    cashTransition,
    netWorthTransition,
    incomeTransition,
    expensesTransition,
    debtTransition,

    investments: {
      stocks: {
        totalValueTransition: stockValueTransition,
        items: stockItems
      },
      properties: {
        totalValueTransition: propertyValueTransition,
        items: propertyItems
      },
      otherInvestments: {
        totalValueTransition: otherAssetsTransition,
        items: otherItems
      }
    },

    business: {
      revenueTransition,
      profitTransition,
      valuationTransition,
      employeesTransition,
      majorCompanyChanges
    },

    personal: {
      healthTransition,
      stressTransition,
      career: {
        title: snapAfter.careerTitle,
        previousSalary: snapBefore.careerSalary,
        currentSalary: snapAfter.careerSalary,
        changeText: careerChangeText,
        isEmployed: Boolean(currentState.currentJob)
      },
      happinessTransition,
      reputationTransition,
      worldInfluenceTransition
    },

    family: {
      majorRelationshipChanges,
      children: snapAfter.childrenNames,
      marriage: marriageText,
      familyEvents: familyEventsList
    },

    politics: {
      approvalTransition,
      influenceTransition,
      office: snapAfter.officeTitle,
      inOffice: snapAfter.inOffice,
      pollingTransition
    },

    world: {
      gdpTransition,
      inflationTransition,
      interestRateTransition,
      businessCycle: snapAfter.businessCycle,
      economicClimate: snapAfter.economicClimate,
      countryName: snapAfter.countryName
    },

    majorEvents: meaningfulEvents,
    unresolvedDecisions: currentState.pendingDecisions,
    opportunities: opportunityEvents,
    risks: detectedRisks,
    outlook,

    // Legacy fields
    tickDiff: currentState.simulationTick - prevState.simulationTick,
    cashDiff: cashTransition.change,
    netWorthDiff: netWorthTransition.change,
    netWorthPercentChange: netWorthTransition.percentChange || 0,
    debtDiff: debtTransition.change,
    totalDebt: snapAfter.totalDebt,
    interestRateDiff: interestRateTransition.change,
    currentInterestRate: snapAfter.interestRate,
    gdpGrowthDiff: gdpTransition.change,
    inflationDiff: inflationTransition.change,
    healthDiff: healthTransition.change,
    currentHealth: snapAfter.health,
    stressDiff: stressTransition.change,
    currentStress: snapAfter.stress,
    happinessDiff: happinessTransition.change,
    reputationDiff: reputationTransition.change,
    worldInfluenceDiff: worldInfluenceTransition.change,
    companyDiffs,
    propertyDiffs,
    relationshipDiffs,
    projectDiffs,
    politicsDiff
  };
}

/**
 * Causal Event Evaluation Engine with Event Control & Cooldown Protection (Phase 9)
 * Evaluates state changes and diffs to generate causal events with explicit trigger reasons.
 */
export function evaluateCausalEvents(
  prevState: GameState, 
  currentState: GameState, 
  diff: SimulationDiff
): { 
  generatedEvents: SimulationEvent[]; 
  unlockedDecisions: PendingDecision[];
} {
  const generatedEvents: SimulationEvent[] = [];
  const unlockedDecisions: PendingDecision[] = [];
  const currentMonth = currentState.currentMonth;
  const currentYear = currentState.currentYear;
  const age = currentState.character.age;
  const tick = currentState.simulationTick;

  // 1. COMPANY REVENUE CONTRACTION (>10% DROP) — Cooldown: 6 months per company
  for (const cDiff of diff.companyDiffs) {
    if (cDiff.revenuePercentChange <= -10 && cDiff.newRevenue > 0) {
      if (isEventOnCooldown(currentState, 'BUSINESS_REVENUE_DECLINE', cDiff.id)) {
        continue;
      }

      const company = currentState.companies.find(c => c.id === cDiff.id);
      if (company) {
        const dropPercent = Math.abs(cDiff.revenuePercentChange).toFixed(1);
        const triggerReason = `Revenue at ${company.name} declined ${dropPercent}% (from $${cDiff.oldRevenue.toLocaleString()} to $${cDiff.newRevenue.toLocaleString()}) over recent operational cycles.`;

        const choices: SimulationEventChoice[] = [
          {
            id: `opt_cut_costs_${company.id}_${tick}`,
            label: 'Implement 15% Operational Cost Reductions',
            description: 'Trim non-critical overhead and negotiate vendor discounts to stabilize operating margin.',
            risk: 'Low',
            timeHorizon: '1 month',
            projectedOutcome: 'Reduces monthly expenses by 15%, slight employee morale dip (-8).',
            handlerKey: 'OPT_CUT_COSTS',
            consequences: [
              ConsequenceEngine.companyExpenses(company.id, 'PERCENTAGE_CHANGE', -15, { description: 'Trimmed corporate monthly overhead by 15%' }),
              ConsequenceEngine.companyMorale(company.id, 'SUBTRACT', 8, { description: 'Budget freezes caused minor staff anxiety (-8 Morale)' })
            ]
          },
          {
            id: `opt_invest_recovery_${company.id}_${tick}`,
            label: 'Deploy $50,000 Emergency Marketing & Sales Blitz',
            description: 'Reignite pipeline growth with targeted customer acquisition campaigns.',
            cost: 50000,
            risk: 'Medium',
            timeHorizon: '3 months',
            projectedOutcome: 'Restores revenue trajectory (+12%), consumes $50k treasury.',
            handlerKey: 'OPT_INVEST_RECOVERY',
            consequences: [
              {
                type: 'cashReserve',
                target: 'COMPANY',
                targetId: company.id,
                operation: 'SUBTRACT',
                value: 50000,
                description: 'Deployed $50k marketing recovery budget'
              },
              ConsequenceEngine.companyRevenue(company.id, 'PERCENTAGE_CHANGE', 12, { description: 'Targeted marketing campaign boosted sales (+12%)' })
            ]
          },
          {
            id: `opt_seek_credit_${company.id}_${tick}`,
            label: 'Secure $250,000 Working Capital Line of Credit',
            description: 'Borrow short-term liquidity from commercial lenders to bridge cash flow gap.',
            risk: 'Medium',
            timeHorizon: '6 months',
            projectedOutcome: 'Adds $250,000 corporate cash buffer with monthly interest service.',
            handlerKey: 'OPT_SEEK_CREDIT',
            consequences: [
              {
                type: 'cashReserve',
                target: 'COMPANY',
                targetId: company.id,
                operation: 'ADD',
                value: 250000,
                description: 'Drew $250k working capital credit line'
              },
              ConsequenceEngine.companyExpenses(company.id, 'ADD', 4500, { description: 'Debt service on working capital line ($4,500/mo)' })
            ]
          },
          {
            id: `opt_divest_equity_${company.id}_${tick}`,
            label: 'Sell 10% Equity Stake to Strategic Investor',
            description: 'Inject $300,000 fresh growth capital in exchange for minority company ownership.',
            risk: 'Low',
            timeHorizon: 'Immediate',
            projectedOutcome: 'Injects $300,000 cash, reduces ownership by 10%.',
            handlerKey: 'OPT_DIVEST_EQUITY',
            consequences: [
              {
                type: 'cashReserve',
                target: 'COMPANY',
                targetId: company.id,
                operation: 'ADD',
                value: 300000,
                description: 'Received $300,000 strategic equity injection'
              },
              ConsequenceEngine.companyOwnership(company.id, 'SUBTRACT', 10, { description: 'Surrendered 10% equity stake to investor' })
            ]
          },
          {
            id: `opt_do_nothing_${company.id}_${tick}`,
            label: 'Maintain Course without Interventions',
            description: 'Rely on existing market momentum and product strength to self-correct.',
            risk: 'High',
            timeHorizon: 'Quarterly',
            projectedOutcome: 'Preserves capital, but risks continued revenue erosion.',
            handlerKey: 'OPT_DO_NOTHING',
            consequences: []
          }
        ];

        generatedEvents.push({
          id: `ev_rev_drop_${company.id}_${tick}`,
          category: 'BUSINESS',
          type: 'WARNING',
          title: `Revenue Contraction at ${company.name}`,
          description: `Revenue at ${company.name} has declined ${dropPercent}% over recent operational cycles. Decisive executive action is recommended to restore top-line trajectory.`,
          severity: 'High',
          priority: 85,
          source: company.name,
          sourceEntityId: company.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Business', 'Revenue', 'Crisis Management', company.name],
          triggerReason,
          choices,
          consequences: {
            details: [`Monthly revenue adjusted by -${dropPercent}% (loss of $${Math.abs(cDiff.revenueDiff).toLocaleString()}/mo)`]
          }
        });

        // Also expose as a PendingDecision with expiration & cooldown metadata
        unlockedDecisions.push({
          id: `dec_rev_recov_${company.id}_${tick}`,
          eventTypeKey: 'BUSINESS_REVENUE_DECLINE',
          entityId: company.id,
          category: 'Business',
          title: `Executive Response: Revenue Contraction at ${company.name}`,
          description: triggerReason,
          urgency: 'Critical',
          priority: 85,
          expiresInMonths: 3,
          expirationEventHeadline: `Turnaround Window Expired: ${company.name}`,
          expirationEventDescription: `No intervention was taken to address revenue contraction at ${company.name}. Market share continues to face structural downward pressure.`,
          expirationConsequences: [
            ConsequenceEngine.companyMorale(company.id, 'SUBTRACT', 5, { description: 'Staff morale dipped due to unaddressed business decline' })
          ],
          options: choices.map(ch => ({
            id: ch.id,
            label: ch.label,
            description: ch.description,
            cost: ch.cost,
            risk: ch.risk || 'Medium',
            timeHorizon: ch.timeHorizon || '1-3 months',
            projectedOutcome: ch.projectedOutcome || '',
            handlerKey: ch.handlerKey || 'OPT_BUSINESS_ACTION',
            consequences: ch.consequences
          }))
        });
      }
    }
  }

  // 2. RISING INTEREST RATES WHILE DEBT IS ELEVATED — Cooldown: 6 months
  if (diff.totalDebt > 5000000 && (diff.currentInterestRate > 6.0 || diff.interestRateDiff > 0.4)) {
    if (!isEventOnCooldown(currentState, 'FINANCE_DEBT_CRISIS', 'global')) {
      const triggerReason = `Central bank benchmark interest rate reached ${diff.currentInterestRate}% while carrying $${diff.totalDebt.toLocaleString()} in total leveraged debt.`;
      
      generatedEvents.push({
        id: `ev_interest_debt_${tick}`,
        category: 'FINANCE',
        type: 'CRISIS',
        title: 'Rising Interest Rates Impacting Debt Servicing Costs',
        description: `Rising benchmark central bank interest rates (${diff.currentInterestRate}%) are increasing your variable debt servicing costs on $${diff.totalDebt.toLocaleString()} in liabilities.`,
        severity: 'High',
        priority: 80,
        source: 'Macroeconomic Debt Syndicate',
        createdMonth: currentMonth,
        createdYear: currentYear,
        timestampMonth: currentMonth,
        timestampYear: currentYear,
        age,
        status: 'Active',
        tags: ['Finance', 'Macro', 'Debt', 'Interest Rates'],
        triggerReason,
        consequences: {
          stressChange: +6,
          details: [
            `Debt servicing burden escalated on $${diff.totalDebt.toLocaleString()} liability portfolio.`,
            `Benchmark rate: ${diff.currentInterestRate}%`
          ]
        }
      });
    }
  }

  // 3. SPOUSAL / RELATIONSHIP STRAIN (Trust or Love below threshold) — Cooldown: 3 months per relationship
  const spouse = (currentState.relationships || []).find(r => 
    r.relation.toLowerCase() === 'spouse' || 
    r.relation.toLowerCase() === 'partner' || 
    r.relation.toLowerCase() === 'fiancée' || 
    r.relation.toLowerCase() === 'fiancé'
  );
  if (spouse && (spouse.trust < 45 || spouse.love < 45)) {
    if (!isEventOnCooldown(currentState, 'FAMILY_RELATIONSHIP_STRAIN', spouse.id)) {
      const triggerReason = `Relationship trust dropped to ${spouse.trust}/100 and love to ${spouse.love}/100 due to intense executive workloads.`;
      
      const spouseChoices: SimulationEventChoice[] = [
        {
          id: `opt_spouse_sabbatical_${tick}`,
          label: 'Take a 2-Week Family Sabbatical',
          description: 'Step away from daily operations to focus entirely on spousal bonding and emotional connection.',
          cost: 15000,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: '+25 Trust, +20 Love, -12 Stress, consumes $15,000.',
          handlerKey: 'OPT_SPOUSE_SABBATICAL',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 15000, { description: 'Funded private family retreat sabbatical' }),
            ConsequenceEngine.relationship(spouse.id, 'trust', 'ADD', 25, { description: 'Restored spousal trust through dedicated time' }),
            ConsequenceEngine.relationship(spouse.id, 'love', 'ADD', 20, { description: 'Deepened spousal intimacy' }),
            ConsequenceEngine.stress('SUBTRACT', 12, { description: 'Relaxed during family retreat' })
          ]
        },
        {
          id: `opt_spouse_luxury_gift_${tick}`,
          label: 'Plan Exclusive Luxury Anniversary Getaway',
          description: 'Book a high-end luxury resort weekend and fine dining experience.',
          cost: 6000,
          risk: 'Low',
          timeHorizon: 'Weekend',
          projectedOutcome: '+12 Trust, +15 Love, consumes $6,000.',
          handlerKey: 'OPT_SPOUSE_GIFT',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 6000, { description: 'Luxury anniversary weekend getaway' }),
            ConsequenceEngine.relationship(spouse.id, 'trust', 'ADD', 12, { description: 'Improved spousal trust' }),
            ConsequenceEngine.relationship(spouse.id, 'love', 'ADD', 15, { description: 'Warm romantic getaway' })
          ]
        },
        {
          id: `opt_spouse_prioritize_work_${tick}`,
          label: 'Explain Critical Business Deadlines & Stay Focused on Work',
          description: 'Ask for patience while prioritizing pressing business and investment milestones.',
          risk: 'High',
          timeHorizon: 'Ongoing',
          projectedOutcome: 'Preserves executive focus, but strains relationship further (-10 Trust).',
          handlerKey: 'OPT_SPOUSE_WORK',
          consequences: [
            ConsequenceEngine.relationship(spouse.id, 'trust', 'SUBTRACT', 10, { description: 'Spousal friction escalated due to missed family time' }),
            ConsequenceEngine.stress('ADD', 4, { description: 'Domestic tension added personal stress' })
          ]
        }
      ];

      generatedEvents.push({
        id: `ev_spouse_strain_${tick}`,
        category: 'FAMILY',
        type: 'WARNING',
        title: 'Spousal Relationship Strain',
        description: `Your spouse ${spouse.name} believes your demanding corporate commitments are consuming too much of your personal life.`,
        severity: 'Medium',
        priority: 75,
        source: spouse.name,
        sourceEntityId: spouse.id,
        createdMonth: currentMonth,
        createdYear: currentYear,
        timestampMonth: currentMonth,
        timestampYear: currentYear,
        age,
        status: 'Active',
        tags: ['Family', 'Relationships', spouse.name],
        triggerReason,
        choices: spouseChoices,
        consequences: {
          happinessChange: -4,
          details: [`Spousal trust: ${spouse.trust}/100, Love: ${spouse.love}/100`]
        }
      });

      unlockedDecisions.push({
        id: `dec_spouse_reconcile_${tick}`,
        eventTypeKey: 'FAMILY_RELATIONSHIP_STRAIN',
        entityId: spouse.id,
        category: 'Family',
        title: `Family Balance: Reconnecting with ${spouse.name}`,
        description: triggerReason,
        urgency: 'Standard',
        priority: 75,
        expiresInMonths: 3,
        expirationEventHeadline: `Spousal Distance Widened: ${spouse.name}`,
        expirationEventDescription: `Failing to address ongoing relationship strain with ${spouse.name} led to further emotional detachment.`,
        expirationConsequences: [
          ConsequenceEngine.relationship(spouse.id, 'trust', 'SUBTRACT', 8, { description: 'Spousal trust diminished after unresolved strain' })
        ],
        options: spouseChoices.map(ch => ({
          id: ch.id,
          label: ch.label,
          description: ch.description,
          cost: ch.cost,
          risk: ch.risk || 'Low',
          timeHorizon: ch.timeHorizon || 'Immediate',
          projectedOutcome: ch.projectedOutcome || '',
          handlerKey: ch.handlerKey || 'OPT_FAMILY_ACTION',
          consequences: ch.consequences
        }))
      });
    }
  }

  // 4. SIGNIFICANT NET WORTH SURGE — Cooldown: 8 months
  const currentNetWorth = calculateTotalNetWorth(currentState);
  if (diff.netWorthPercentChange >= 15 && diff.netWorthDiff > 100000) {
    if (!isEventOnCooldown(currentState, 'FINANCE_NET_WORTH_SURGE', 'global')) {
      const triggerReason = `Personal net worth surged +${diff.netWorthPercentChange.toFixed(1)}% (+$${diff.netWorthDiff.toLocaleString()}) reaching $${currentNetWorth.toLocaleString()}.`;

      const wealthChoices: SimulationEventChoice[] = [
        {
          id: `opt_wealth_family_office_${tick}`,
          label: 'Retain Multi-Family Office Wealth Advisors',
          description: 'Set up an institutional wealth preservation trust and tax-optimized asset holding structure.',
          cost: 35000,
          risk: 'Low',
          timeHorizon: '1 month',
          projectedOutcome: '+10 World Influence, lowers future tax liabilities, $35k initial retainer.',
          handlerKey: 'OPT_WEALTH_OFFICE',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 35000, { description: 'Established family office advisory structure' }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 6, { description: 'Institutional family office network established' }),
            ConsequenceEngine.reputation('ADD', 4, { description: 'Acclaimed wealth management reputation' })
          ]
        },
        {
          id: `opt_wealth_angel_syndicate_${tick}`,
          label: 'Form a $500,000 Early-Stage Angel Syndicate',
          description: 'Back high-potential technology founders with anchor venture capital checks.',
          cost: 500000,
          risk: 'High',
          timeHorizon: '24 months',
          projectedOutcome: '+12 Reputation, potential asymmetric equity returns on breakthrough startups.',
          handlerKey: 'OPT_ANGEL_SYNDICATE',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 500000, { description: 'Funded early-stage angel syndication pool' }),
            ConsequenceEngine.reputation('ADD', 8, { description: 'Venture angel syndicate leader recognition' }),
            ConsequenceEngine.playerAttribute('intelligence', 'ADD', 3, { description: 'Technology venture evaluation insights' })
          ]
        }
      ];

      generatedEvents.push({
        id: `ev_wealth_surge_${tick}`,
        category: 'FINANCE',
        type: 'OPPORTUNITY',
        title: 'Private Wealth Surge & Elite Deal Flow',
        description: `Your rapidly expanding capital base (now $${currentNetWorth.toLocaleString()}) has positioned you as a preferred anchor partner for premier institutional deals.`,
        severity: 'Medium',
        priority: 70,
        source: 'Global Private Wealth Network',
        createdMonth: currentMonth,
        createdYear: currentYear,
        timestampMonth: currentMonth,
        timestampYear: currentYear,
        age,
        status: 'Active',
        tags: ['Wealth', 'Finance', 'Investment', 'Milestone'],
        triggerReason,
        choices: wealthChoices,
        consequences: {
          reputationChange: +3,
          worldInfluenceChange: +2,
          details: [`Net worth expansion: +${diff.netWorthPercentChange.toFixed(1)}%`]
        }
      });
    }
  }

  // 5. POLITICAL APPROVAL & LEGISLATIVE DYNAMICS — Cooldown: 12 months for scandal/slump
  if (currentState.politics.currentOffice.inOffice) {
    const office = currentState.politics.currentOffice;
    if (office.approvalRating < 40) {
      if (!isEventOnCooldown(currentState, 'POLITICS_APPROVAL_SLUMP', office.title)) {
        const triggerReason = `Public approval rating in ${office.cityOrNation} has slid to ${office.approvalRating}% amid policy debates.`;

        generatedEvents.push({
          id: `ev_pol_approval_drop_${tick}`,
          category: 'POLITICS',
          type: 'WARNING',
          title: `Legislative Friction: Public Approval at ${office.approvalRating}%`,
          description: `Electorate polling indicates dissatisfaction with recent administrative priorities. Opposition leaders are leveraging polling deficits in municipal media.`,
          severity: 'High',
          priority: 78,
          source: `${office.title} Administration`,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Politics', 'Approval', office.title],
          triggerReason,
          consequences: {
            stressChange: +5,
            reputationChange: -3,
            details: [`Public approval down to ${office.approvalRating}%`]
          }
        });
      }
    } else if (office.approvalRating >= 75 && office.politicalCapital >= 60) {
      if (!isEventOnCooldown(currentState, 'POLITICS_MANDATE_MILESTONE', office.title)) {
        const triggerReason = `Public approval commanding ${office.approvalRating}% alongside ${office.politicalCapital} political capital grants strong governing mandate.`;

        generatedEvents.push({
          id: `ev_pol_mandate_${tick}`,
          category: 'POLITICS',
          type: 'MILESTONE',
          title: `Statesman Mandate: High Approval Rating (${office.approvalRating}%)`,
          description: `Your administration enjoys broad public support across regional constituencies, unlocking historic legislative initiatives.`,
          severity: 'Low',
          priority: 65,
          source: `${office.title} Administration`,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Politics', 'Statesmanship', 'Milestone'],
          triggerReason,
          consequences: {
            worldInfluenceChange: +5,
            happinessChange: +6,
            details: [`Approval rating commanding ${office.approvalRating}%`]
          }
        });
      }
    }
  }

  // 6. MAJOR PROJECTS DELAYS OR BOTTLENECKS — Cooldown: 4 months per project
  for (const proj of currentState.projects) {
    if (!proj.completed && proj.status === 'Delayed by Supply Shortage') {
      if (isEventOnCooldown(currentState, 'PROJECT_SUPPLY_BOTTLENECK', proj.id)) {
        continue;
      }

      const triggerReason = `Supply chain delays stalled construction progress on '${proj.name}' at ${proj.monthsProgress}/${proj.durationMonths} months.`;

      const projChoices: SimulationEventChoice[] = [
        {
          id: `opt_proj_expedite_${proj.id}_${tick}`,
          label: 'Deploy $75,000 Emergency Supply Expediting Capital',
          description: 'Secure priority freight contracts to overcome supply shortages and resume construction.',
          cost: 75000,
          risk: 'Low',
          timeHorizon: '1 month',
          projectedOutcome: 'Restores active construction status, consumes $75,000.',
          handlerKey: 'OPT_EXPEDITE_PROJECT',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 75000, { description: `Deployed $75,000 expediting fee for ${proj.name}` })
          ]
        },
        {
          id: `opt_proj_delay_accept_${proj.id}_${tick}`,
          label: 'Accept Timeline Extension Without Added Capital',
          description: 'Wait out component lead times without incurring financial penalties.',
          risk: 'Medium',
          timeHorizon: '3-6 months',
          projectedOutcome: 'Saves immediate capital, delays completion date by 3 months.',
          handlerKey: 'OPT_ACCEPT_DELAY',
          consequences: []
        }
      ];

      generatedEvents.push({
        id: `ev_proj_delay_${proj.id}_${tick}`,
        category: 'PROJECT',
        type: 'CRISIS',
        title: `Construction Delay: ${proj.name}`,
        description: `Logistics bottlenecks and material shortages have delayed milestones on '${proj.name}'. Strategic intervention is required.`,
        severity: 'Medium',
        priority: 72,
        source: proj.name,
        sourceEntityId: proj.id,
        createdMonth: currentMonth,
        createdYear: currentYear,
        timestampMonth: currentMonth,
        timestampYear: currentYear,
        age,
        status: 'Active',
        tags: ['Project', 'Construction', proj.name],
        triggerReason,
        choices: projChoices,
        consequences: {
          stressChange: +4,
          details: [`Project progress: ${proj.monthsProgress} / ${proj.durationMonths} months`]
        }
      });
    }
  }

  // 7. EXTREME STRESS & EXECUTIVE HEALTH DETERIORATION — Cooldown: 4 months
  if (diff.currentStress >= 75) {
    if (!isEventOnCooldown(currentState, 'HEALTH_EXECUTIVE_BURNOUT', 'global')) {
      const triggerReason = `Character stress reached critical threshold of ${diff.currentStress}/100 with health at ${diff.currentHealth}/100.`;

      generatedEvents.push({
        id: `ev_health_stress_alert_${tick}`,
        category: 'HEALTH',
        type: 'WARNING',
        title: 'Acute Executive Fatigue & Physiological Strain',
        description: `Sustained high stress (${diff.currentStress}/100) is causing severe fatigue, sleep disruption, and cardiovascular strain. Restorative action is strongly advised.`,
        severity: 'Critical',
        priority: 90,
        source: 'Personal Medical Advisor',
        createdMonth: currentMonth,
        createdYear: currentYear,
        timestampMonth: currentMonth,
        timestampYear: currentYear,
        age,
        status: 'Active',
        tags: ['Health', 'Stress', 'Burnout'],
        triggerReason,
        consequences: {
          healthChange: -3,
          happinessChange: -4,
          details: [`Stress: ${diff.currentStress}/100, Health: ${diff.currentHealth}/100`]
        }
      });
    }
  }

  // 8. CORPORATE MORALE COLLAPSE (<40) — Cooldown: 6 months per company
  for (const comp of currentState.companies) {
    if (comp.employeeMorale < 40) {
      if (isEventOnCooldown(currentState, 'BUSINESS_MORALE_BREAKDOWN', comp.id)) {
        continue;
      }

      const triggerReason = `Workforce morale at ${comp.name} collapsed to ${comp.employeeMorale}/100 due to cost pressures and operational pacing.`;

      generatedEvents.push({
        id: `ev_morale_collapse_${comp.id}_${tick}`,
        category: 'BUSINESS',
        type: 'CRISIS',
        title: `Talent Discontent & Walkout Warning at ${comp.name}`,
        description: `Employee morale has fallen to ${comp.employeeMorale}/100. Senior engineering and executive leaders warn of impending brain-drain if compensation and workplace culture are not addressed.`,
        severity: 'High',
        priority: 82,
        source: comp.name,
        sourceEntityId: comp.id,
        createdMonth: currentMonth,
        createdYear: currentYear,
        timestampMonth: currentMonth,
        timestampYear: currentYear,
        age,
        status: 'Active',
        tags: ['Business', 'HR', 'Morale', comp.name],
        triggerReason,
        consequences: {
          stressChange: +5,
          details: [`Morale at critical index: ${comp.employeeMorale}/100`]
        }
      });
    }
  }

  // 9. REAL ESTATE PROPERTY CONDITION (<50) — Cooldown: 6 months per property
  for (const prop of currentState.finances.properties) {
    if (prop.condition < 50) {
      if (isEventOnCooldown(currentState, 'REAL_ESTATE_CONDITION_DECAY', prop.id)) {
        continue;
      }

      const triggerReason = `Property '${prop.name}' maintenance condition decayed to ${prop.condition}/100, prompting tenant complaints.`;

      generatedEvents.push({
        id: `ev_prop_condition_${prop.id}_${tick}`,
        category: 'REAL_ESTATE',
        type: 'WARNING',
        title: `Tenant Maintenance Dispute: ${prop.name}`,
        description: `Tenants at ${prop.name} have filed formal grievances regarding building infrastructure. Failure to renovate may result in lease cancellations.`,
        severity: 'Medium',
        priority: 68,
        source: prop.name,
        sourceEntityId: prop.id,
        createdMonth: currentMonth,
        createdYear: currentYear,
        timestampMonth: currentMonth,
        timestampYear: currentYear,
        age,
        status: 'Active',
        tags: ['Real Estate', 'Properties', prop.name],
        triggerReason,
        consequences: {
          details: [`Property condition: ${prop.condition}/100`]
        }
      });
    }
  }

  // 10. POWER TIER SPECIFIC CAUSAL EVENTS (Phase 10)
  const power = currentState.playerPowerProfile;
  if (power) {
    // 10A. HIGH SCRUTINY & REGULATORY INQUIRY (Scrutiny >= 65 or Regulatory >= 60) — Cooldown: 6 months
    if ((power.scrutiny >= 65 || power.regulatoryAttention >= 60) && isPowerTierAtLeast(power.powerTier, 'PROMINENT')) {
      if (!isEventOnCooldown(currentState, 'POWER_REGULATORY_PROBE', 'global')) {
        const triggerReason = `Player power tier (${power.powerTier}) elevated scrutiny to ${power.scrutiny}/100 and regulatory attention to ${power.regulatoryAttention}/100.`;
        const auditFine = Math.min(2500000, Math.max(100000, Math.floor(currentState.finances.cash * 0.05)));

        const probeChoices: SimulationEventChoice[] = [
          {
            id: `opt_hire_top_defense_${tick}`,
            label: 'Retain Elite White-Collar Defense Counsel',
            description: 'Deploy top constitutional and corporate litigators to cooperate cleanly and squash all inquiries.',
            cost: Math.min(500000, Math.max(50000, Math.floor(auditFine * 0.4))),
            risk: 'Low',
            timeHorizon: '2-4 months',
            projectedOutcome: '-$150k legal retainers, avoids public fines, secures regulatory clearance.',
            handlerKey: 'OPT_LEGAL_DEFENSE',
            consequences: [
              ConsequenceEngine.cash('SUBTRACT', Math.min(500000, Math.max(50000, Math.floor(auditFine * 0.4))), { description: 'Elite defense counsel retainer' }),
              ConsequenceEngine.reputation('ADD', 2, { description: 'Maintained integrity through legal rigor' }),
              ConsequenceEngine.stress('ADD', 4, { description: 'Legal preparation stress' })
            ]
          },
          {
            id: `opt_settle_compliance_${tick}`,
            label: 'Fast-Track Civil Settlement & Enhanced Compliance',
            description: 'Pay a negotiated settlement fine to close the inquiry immediately with no admission of wrongdoing.',
            cost: auditFine,
            risk: 'Low',
            timeHorizon: 'Immediate',
            projectedOutcome: `Consumes $${auditFine.toLocaleString()}, eliminates probe, -3 Reputation.`,
            handlerKey: 'OPT_SETTLE_PROBE',
            consequences: [
              ConsequenceEngine.cash('SUBTRACT', auditFine, { description: 'Regulatory settlement fine' }),
              ConsequenceEngine.reputation('SUBTRACT', 3, { description: 'Public settlement minor optics hit' }),
              ConsequenceEngine.stress('SUBTRACT', 6, { description: 'Relief at closing investigation' })
            ]
          },
          {
            id: `opt_fight_subpoena_${tick}`,
            label: 'Aggressively Counter-Lobby & Challenge Jurisdiction',
            description: 'Use political capital and media surrogates to dispute the regulatory committee\'s legal standing.',
            risk: 'High',
            timeHorizon: '6-12 months',
            projectedOutcome: 'Saves cash, but risks high-profile media fallout or political blowback.',
            handlerKey: 'OPT_FIGHT_SUBPOENA',
            consequences: [
              ConsequenceEngine.reputation('SUBTRACT', 5, { description: 'Public controversy over regulatory resistance' }),
              ConsequenceEngine.stress('ADD', 12, { description: 'Intense public standoff stress' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_reg_probe_${tick}`,
          category: 'BUSINESS',
          type: 'CRISIS',
          title: `Federal Regulatory Scrutiny & Inquest: ${power.powerTier} Tier`,
          description: `Given your commanding prominence and business footprint, regulatory oversight bodies have initiated a formal compliance review into your market influence and financial disclosures.`,
          severity: 'High',
          priority: 88,
          source: 'Federal Trade & Securities Commission',
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          minPowerTier: 'PROMINENT',
          tags: ['Power', 'Regulatory', 'Scrutiny', 'Legal'],
          triggerReason,
          choices: probeChoices,
          consequences: {
            stressChange: +6,
            details: [`Scrutiny Level: ${power.scrutiny}/100`, `Regulatory Index: ${power.regulatoryAttention}/100`]
          }
        });
      }
    }

    // 10B. ELITE DEALFLOW: SOVEREIGN / PE SYNDICATE ALLOCATION (Power Tier >= PROMINENT) — Cooldown: 6 months
    if (isPowerTierAtLeast(power.powerTier, 'PROMINENT') && !isEventOnCooldown(currentState, 'POWER_ELITE_DEALFLOW', 'global')) {
      const dealSize = power.powerTier === 'GLOBAL' ? 250000000 : (power.powerTier === 'POWERFUL' ? 50000000 : 10000000);
      const buyIn = Math.floor(dealSize * 0.1);

      if (currentState.finances.cash >= buyIn * 0.5) {
        const triggerReason = `Commanding ${power.powerTier} Power Tier unlocked exclusive access to institutional private equity syndication.`;

        const dealChoices: SimulationEventChoice[] = [
          {
            id: `opt_join_syndicate_${tick}`,
            label: `Commit $${(buyIn / 1000000).toFixed(1)}M Anchor Equity to Syndicate`,
            description: `Participate as an anchor co-investor alongside premier sovereign wealth and institutional funds.`,
            cost: buyIn,
            risk: 'Medium',
            timeHorizon: '12-24 months',
            projectedOutcome: `Invests $${buyIn.toLocaleString()}, targets 35-60% IRR, boosts international influence (+8 Influence).`,
            handlerKey: 'OPT_JOIN_SYNDICATE',
            consequences: [
              ConsequenceEngine.cash('SUBTRACT', buyIn, { description: 'Sovereign private equity syndicate anchor allocation' }),
              ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 8, { description: 'Institutional dealmaking recognition' }),
              ConsequenceEngine.reputation('ADD', 4, { description: 'Prestige co-investment with sovereign funds' })
            ]
          },
          {
            id: `opt_decline_syndicate_${tick}`,
            label: 'Pass on the Syndicate Opportunity',
            description: 'Preserve maximum liquid cash reserves for proprietary organic operations.',
            risk: 'Low',
            timeHorizon: 'Immediate',
            projectedOutcome: 'No capital committed; relationships maintained.',
            handlerKey: 'OPT_PASS_DEAL',
            consequences: []
          }
        ];

        generatedEvents.push({
          id: `ev_pe_syndicate_${tick}`,
          category: 'INVESTMENT',
          type: 'OPPORTUNITY',
          title: `Exclusive Sovereign Wealth Co-Investment Syndicate`,
          description: `An elite global investment consortium has invited you to co-lead a $${(dealSize / 1000000).toFixed(0)}M private equity buyout round. This deal is strictly restricted to ${power.powerTier} tier powerbrokers.`,
          severity: 'Low',
          priority: 78,
          source: 'International Sovereign Consortium',
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          minPowerTier: 'PROMINENT',
          tags: ['Power', 'Investment', 'Private Equity', 'Syndicate'],
          triggerReason,
          choices: dealChoices,
          consequences: {
            details: [`Exclusive dealflow reserved for ${power.powerTier} Tier.`]
          }
        });
      }
    }

    // 10C. GLOBAL SOVEREIGN SUMMIT OR G20/WEF INVITATION (Tier POWERFUL or GLOBAL) — Cooldown: 8 months
    if ((power.powerTier === 'POWERFUL' || power.powerTier === 'GLOBAL') && !isEventOnCooldown(currentState, 'POWER_GLOBAL_SUMMIT', 'global')) {
      const triggerReason = `Reached ${power.powerTier} power tier with ${power.powerScore} power points, commanding international systemic influence.`;

      const summitChoices: SimulationEventChoice[] = [
        {
          id: `opt_deliver_keynote_${tick}`,
          label: 'Deliver Plenary Keynote on Global Economic Policy',
          description: 'Address heads of state, central bank governors, and multinational CEOs on structural capital reform.',
          cost: 50000,
          risk: 'Low',
          timeHorizon: '1 month',
          projectedOutcome: '+15 World Influence, +10 Reputation, establishes unmatched global statesmanship.',
          handlerKey: 'OPT_GLOBAL_KEYNOTE',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 50000, { description: 'Diplomatic delegation and summit logistics' }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 15, { description: 'Global Economic Summit Keynote Address' }),
            ConsequenceEngine.reputation('ADD', 10, { description: 'International statesman recognition' }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 8, { description: 'Historic milestone accomplishment' })
          ]
        },
        {
          id: `opt_private_bilateral_${tick}`,
          label: 'Focus on Closed-Door Bilateral State Investment Pacts',
          description: 'Conduct discrete meetings with visiting foreign prime ministers to negotiate preferential economic zone treaties.',
          cost: 25000,
          risk: 'Low',
          timeHorizon: '1 month',
          projectedOutcome: '+12 Business Influence, unlocks overseas tax treaties, +8 World Influence.',
          handlerKey: 'OPT_BILATERAL_PACTS',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 25000, { description: 'Bilateral state summit hosting' }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 8, { description: 'Bilateral trade pacts secured' }),
            ConsequenceEngine.reputation('ADD', 5, { description: 'Discreet powerbroker stature' })
          ]
        }
      ];

      generatedEvents.push({
        id: `ev_global_summit_${tick}`,
        category: 'WORLD',
        type: 'OPPORTUNITY',
        title: `Global Economic Summit: Plenary Keynote & State Reception`,
        description: `As a recognized ${power.powerTier} tier titan, you have been formally invited to address the plenary session of the Global Economic Summit in Switzerland alongside G20 heads of state.`,
        severity: 'Low',
        priority: 92,
        source: 'World Economic Forum Secretariat',
        createdMonth: currentMonth,
        createdYear: currentYear,
        timestampMonth: currentMonth,
        timestampYear: currentYear,
        age,
        status: 'Active',
        minPowerTier: 'POWERFUL',
        tags: ['Power', 'Geopolitics', 'Global', 'Summit'],
        triggerReason,
        choices: summitChoices,
        consequences: {
          details: [`Systemic Stature: ${power.powerTier} Tier`]
        }
      });
    }
  }

  // 11. DEEPTECH ANGEL SYNDICATE OPPORTUNITY (Cash >= $50k, Net Worth >= $300k, Reputation >= 35) — Cooldown: 6 months
  if (currentState.finances.cash >= 50000 && calculateTotalNetWorth(currentState) >= 300000 && currentState.character.attributes.reputation >= 35) {
    if (!isEventOnCooldown(currentState, 'FINANCE_ANGEL_SYNDICATE', 'global')) {
      const triggerReason = `Liquid capital ($${currentState.finances.cash.toLocaleString()}) and market reputation (${currentState.character.attributes.reputation}/100) attracted an invitation from an elite DeepTech venture syndicate.`;

      const angelOptions: SimulationEventChoice[] = [
        {
          id: `opt_angel_lead_${tick}`,
          label: 'Lead Syndicate: Invest $50,000 Anchor Check',
          description: 'Take lead angel position in an autonomous robotics startup aiming for a Series A markup.',
          cost: 50000,
          risk: 'High',
          timeHorizon: '24 months',
          projectedOutcome: 'Invests $50,000, high probability of multi-fold equity markup, +6 Reputation.',
          handlerKey: 'OPT_ANGEL_LEAD',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 50000, { description: 'Deployed $50,000 lead angel investment check' }),
            ConsequenceEngine.reputation('ADD', 6, { description: 'DeepTech syndicate lead investor reputation' }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 3, { description: 'Venture ecosystem prominence' })
          ]
        },
        {
          id: `opt_angel_follow_${tick}`,
          label: 'Participate as Member: Invest $20,000',
          description: 'Take a smaller allocation alongside institutional venture partners with lower downside exposure.',
          cost: 20000,
          risk: 'Medium',
          timeHorizon: '24 months',
          projectedOutcome: 'Invests $20,000, steady equity appreciation potential.',
          handlerKey: 'OPT_ANGEL_FOLLOW',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 20000, { description: 'Deployed $20,000 syndicate co-investment' }),
            ConsequenceEngine.reputation('ADD', 2, { description: 'Venture angel co-investor' })
          ]
        },
        {
          id: `opt_angel_pass_${tick}`,
          label: 'Pass on the Syndicate Round',
          description: 'Keep all liquid capital preserved for personal operations.',
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: 'No capital committed; relationships preserved.',
          handlerKey: 'OPT_ANGEL_PASS',
          consequences: []
        }
      ];

      unlockedDecisions.push({
        id: `dec_angel_${tick}`,
        eventTypeKey: 'FINANCE_ANGEL_SYNDICATE',
        category: 'Investment',
        title: 'DeepTech Angel Syndicate Co-Investment Invitation',
        description: triggerReason,
        urgency: 'Standard',
        priority: 76,
        expiresInMonths: 2,
        expirationEventHeadline: 'Angel Syndicate Round Closed: DeepTech AI Allocation',
        expirationEventDescription: 'The oversubscribed seed financing round has closed to outside angels.',
        options: angelOptions.map(opt => ({
          id: opt.id,
          label: opt.label,
          description: opt.description,
          cost: opt.cost,
          risk: opt.risk || 'Medium',
          timeHorizon: opt.timeHorizon || '24 months',
          projectedOutcome: opt.projectedOutcome || '',
          handlerKey: opt.handlerKey || 'OPT_BUSINESS_ACTION',
          consequences: opt.consequences
        }))
      });
    }
  }

  // Filter all generated events and unlocked decisions according to Power Tier constraints
  const filteredEvents = power ? filterEventsByPowerTier(generatedEvents, power) : generatedEvents;
  const filteredDecisions = power ? filterDecisionsByPowerTier(unlockedDecisions, power) : unlockedDecisions;

  return {
    generatedEvents: filteredEvents,
    unlockedDecisions: filteredDecisions
  };
}

function calculateTotalNetWorth(state: GameState): number {
  const totalCash = state.finances.cash;
  const totalStocks = state.finances.stocks.reduce((acc, s) => acc + s.sharesOwned * s.currentPrice, 0);
  const totalProps = state.finances.properties.reduce((acc, p) => acc + p.currentValue, 0);
  const totalComp = state.companies.reduce((acc, c) => acc + (c.valuation * (c.playerOwnershipPercentage / 100)), 0);
  const totalSports = state.sports.ownedTeams.reduce((acc, t) => acc + t.valuation, 0);
  const totalDebt = state.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0);
  return (totalCash + totalStocks + totalProps + totalComp + totalSports) - totalDebt;
}
