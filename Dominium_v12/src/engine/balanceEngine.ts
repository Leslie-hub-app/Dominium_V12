import { 
  GameState, 
  Loan, 
  Company, 
  PoliticalOffice, 
  CharacterAttributes 
} from '../types';

export interface BorrowingCapacityResult {
  maxBorrowingCapacity: number;
  currentTotalDebt: number;
  remainingBorrowingCapacity: number;
  debtToEquityRatio: number;
  debtToIncomeRatio: number;
  estimatedApr: number;
  creditTier: 'Super Prime' | 'Prime' | 'Near Prime' | 'Subprime' | 'Distressed';
  isApproved: boolean;
  rejectionReason?: string;
  monthlyDebtService: number;
}

export interface MonthlyTradeoffAudit {
  baseLivingCost: number;
  wealthOverhead: number;
  politicalOfficeUpkeep: number;
  securityCost: number;
  totalLivingExpenses: number;
  totalDebtService: number;
  totalMonthlyExpenses: number;
  workloadHoursWeekly: number;
  workloadCategory: 'Leisure' | 'Balanced' | 'Heavy' | 'Overworked' | 'Severe Burnout';
  stressDelta: number;
  healthDelta: number;
  relationshipDecayDelta: number;
  tradeOffNotes: string[];
}

/**
 * Calculates total annual gross income from all active revenue streams
 */
export function calculateAnnualIncome(state: GameState): number {
  let monthlyTotal = 0;

  // 1. Employment Salary
  if (state.currentJob) {
    monthlyTotal += state.currentJob.monthlySalary;
  }

  // 2. Political Office Salary
  if (state.politics.currentOffice.inOffice && state.politics.currentOffice.salaryMonthly > 0) {
    monthlyTotal += state.politics.currentOffice.salaryMonthly;
  }

  // 3. Real Estate Net Rental Income
  state.finances.properties.forEach(p => {
    if (p.isRented) {
      monthlyTotal += Math.max(0, p.monthlyRent - p.monthlyMaintenance);
    }
  });

  // 4. Company Dividends (Estimated monthly yield from profitable companies)
  state.companies.forEach(c => {
    if (c.dividendPayoutRatio > 0 && c.monthlyNetProfit > 0) {
      monthlyTotal += (c.monthlyNetProfit * c.dividendPayoutRatio * (c.playerOwnershipPercentage / 100));
    }
  });

  // 5. Sports Team Net Income
  state.sports.ownedTeams.forEach(t => {
    if (t.monthlyNetIncome > 0 && t.playerOwnershipPercentage > 0) {
      monthlyTotal += (t.monthlyNetIncome * (t.playerOwnershipPercentage / 100));
    }
  });

  // 6. Stock Dividends
  state.finances.stocks.forEach(s => {
    if (s.sharesOwned > 0 && s.dividendYieldAnnual > 0) {
      monthlyTotal += (s.sharesOwned * s.currentPrice * (s.dividendYieldAnnual / 100)) / 12;
    }
  });

  return Math.round(monthlyTotal * 12);
}

/**
 * Evaluates bank underwriting standards, credit capacity, and leverage limits
 * to prevent infinite borrowing and enforce realistic debt covenants.
 */
export function calculateBorrowingCapacity(state: GameState, requestedAmount: number = 0): BorrowingCapacityResult {
  const creditScore = Math.max(300, Math.min(850, state.character.creditScore || 700));
  const annualIncome = calculateAnnualIncome(state);
  const monthlyIncome = Math.max(1, annualIncome / 12);

  // Calculate current liabilities
  const unsecuredDebt = state.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0);
  const mortgageDebt = state.finances.properties.reduce((acc, p) => acc + (p.mortgage ? p.mortgage.remainingBalance : 0), 0);
  const currentTotalDebt = unsecuredDebt + mortgageDebt;

  // Calculate total monthly debt payments
  let monthlyDebtService = state.finances.loans.reduce((acc, l) => acc + l.monthlyPayment, 0);
  state.finances.properties.forEach(p => {
    if (p.mortgage) monthlyDebtService += p.mortgage.monthlyPayment;
  });

  // Calculate net worth and tangible collateral
  let tangibleAssets = state.finances.cash;
  state.finances.accounts.forEach(a => { if (a.type !== 'Checking') tangibleAssets += a.balance; });
  state.finances.stocks.forEach(s => { tangibleAssets += (s.sharesOwned * s.currentPrice); });
  state.finances.properties.forEach(p => { tangibleAssets += p.currentValue; });
  state.companies.forEach(c => { tangibleAssets += (c.valuation * (c.playerOwnershipPercentage / 100)); });
  state.sports.ownedTeams.forEach(t => { tangibleAssets += (t.valuation * (t.playerOwnershipPercentage / 100)); });

  const netWorth = tangibleAssets - currentTotalDebt;

  // Debt-to-Equity (DTE) & Debt-to-Income (DTI)
  const debtToEquityRatio = tangibleAssets > 0 ? (currentTotalDebt / tangibleAssets) : (currentTotalDebt > 0 ? 1.0 : 0);
  const debtToIncomeRatio = monthlyIncome > 0 ? (monthlyDebtService / monthlyIncome) : 1.0;

  // Credit Tier Assessment
  let creditTier: BorrowingCapacityResult['creditTier'] = 'Prime';
  let baseApr = state.world[state.currentCountryIndex]?.centralBankInterestRate || 4.5;
  let riskSpread = 2.0;

  if (creditScore >= 780) {
    creditTier = 'Super Prime';
    riskSpread = 1.0;
  } else if (creditScore >= 700) {
    creditTier = 'Prime';
    riskSpread = 2.5;
  } else if (creditScore >= 620) {
    creditTier = 'Near Prime';
    riskSpread = 5.0;
  } else if (creditScore >= 540) {
    creditTier = 'Subprime';
    riskSpread = 8.5;
  } else {
    creditTier = 'Distressed';
    riskSpread = 13.0;
  }

  // Additional leverage penalty spread
  if (debtToEquityRatio > 0.5) riskSpread += 3.0;
  if (debtToIncomeRatio > 0.45) riskSpread += 2.5;

  const estimatedApr = Math.round((baseApr + riskSpread) * 10) / 10;

  // Maximum Borrowing Capacity Formulation:
  // 1. Income-based borrowing limit: max 4.5x annual income (standard banking debt-to-income ceiling)
  const incomeCapacity = annualIncome * 4.5;
  
  // 2. Asset-based collateral limit: max 45% of net tangible assets
  const assetCapacity = Math.max(10000, netWorth * 0.45);

  // Weighted Capacity scaled by Credit Score factor
  const creditFactor = Math.max(0.2, (creditScore - 400) / 400); // 0.25 at 500, 1.0 at 800
  let maxBorrowingCapacity = Math.round(Math.min(incomeCapacity, assetCapacity) * creditFactor);

  // Minimum baseline for starting citizens with decent credit
  if (creditScore >= 650 && maxBorrowingCapacity < 25000) {
    maxBorrowingCapacity = 25000;
  }

  // Hard Cap on total personal unsecured debt to prevent integer/scaling runaway
  maxBorrowingCapacity = Math.min(250000000, maxBorrowingCapacity);

  const remainingBorrowingCapacity = Math.max(0, maxBorrowingCapacity - currentTotalDebt);

  // Underwriting Decision Check
  let isApproved = true;
  let rejectionReason: string | undefined;

  if (creditScore < 500) {
    isApproved = false;
    rejectionReason = `Credit score (${creditScore}) is below statutory lending minimum (500).`;
  } else if (debtToEquityRatio > 0.65) {
    isApproved = false;
    rejectionReason = `Debt-to-Equity ratio (${(debtToEquityRatio * 100).toFixed(1)}%) exceeds institutional leverage covenant (65%).`;
  } else if (debtToIncomeRatio > 0.60) {
    isApproved = false;
    rejectionReason = `Debt Service Coverage ratio (${(debtToIncomeRatio * 100).toFixed(1)}% DTI) exceeds maximum debt service capability (60%).`;
  } else if (netWorth <= -50000) {
    isApproved = false;
    rejectionReason = `Negative personal net worth ($${netWorth.toLocaleString()}) disqualifies new unsecured debt facilities.`;
  } else if (requestedAmount > 0 && requestedAmount > remainingBorrowingCapacity) {
    isApproved = false;
    rejectionReason = `Requested amount ($${requestedAmount.toLocaleString()}) exceeds remaining borrowing capacity ($${remainingBorrowingCapacity.toLocaleString()}).`;
  }

  return {
    maxBorrowingCapacity,
    currentTotalDebt,
    remainingBorrowingCapacity,
    debtToEquityRatio: Math.round(debtToEquityRatio * 1000) / 10,
    debtToIncomeRatio: Math.round(debtToIncomeRatio * 1000) / 10,
    estimatedApr,
    creditTier,
    isApproved,
    rejectionReason,
    monthlyDebtService: Math.round(monthlyDebtService)
  };
}

/**
 * Calculates recurring monthly expenses, lifestyle maintenance, political upkeep,
 * security costs, and workload stress/health trade-offs.
 */
export function calculateMonthlyTradeoffsAndOverhead(state: GameState, currentNetWorth: number): MonthlyTradeoffAudit {
  const tradeOffNotes: string[] = [];

  // 1. Base Living Costs
  const baseLivingCost = state.finances.monthlyBaseExpenses + 
    (state.character.possessions.homesCount * 650) + 
    (state.character.possessions.vehicles.length * 350);

  // 2. High Wealth Overhead & Private Security Detail (Anti-Exploit: Billionaires have substantial real-world upkeep)
  let wealthOverhead = 0;
  let securityCost = 0;

  if (currentNetWorth >= 10000000000) {
    wealthOverhead = 350000;
    securityCost = 250000;
    tradeOffNotes.push('Global Power Tier: $600,000/mo allocated to global security apparatus & sovereign wealth trust management.');
  } else if (currentNetWorth >= 1000000000) {
    wealthOverhead = 120000;
    securityCost = 80000;
    tradeOffNotes.push('Sovereign Titan: $200,000/mo dedicated to 24/7 executive security, private aviation retainers & family office.');
  } else if (currentNetWorth >= 100000000) {
    wealthOverhead = 35000;
    securityCost = 25000;
    tradeOffNotes.push('Elite Tycoon: $60,000/mo wealth management retainers & residential security detail.');
  } else if (currentNetWorth >= 20000000) {
    wealthOverhead = 10000;
    securityCost = 5000;
    tradeOffNotes.push('Prominent Figure: $15,000/mo estate accounting & private security oversight.');
  } else if (currentNetWorth >= 2000000) {
    wealthOverhead = 2500;
    securityCost = 500;
  }

  // 3. High Political Power In-Office Operations & Staff Upkeep
  let politicalOfficeUpkeep = 0;
  if (state.politics.currentOffice.inOffice) {
    const officeTitle = state.politics.currentOffice.title;
    if (officeTitle === 'President / Prime Minister') {
      politicalOfficeUpkeep = 35000;
      tradeOffNotes.push('Head of State: $35,000/mo executive staff retainers & campaign communications machine.');
    } else if (officeTitle === 'Cabinet Minister') {
      politicalOfficeUpkeep = 15000;
      tradeOffNotes.push('Cabinet Minister: $15,000/mo policy advisory staff & constituency operations.');
    } else if (officeTitle === 'Member of Parliament' || officeTitle === 'Senator') {
      politicalOfficeUpkeep = 6000;
      tradeOffNotes.push('Parliamentary Office: $6,000/mo legislative research staff & public communications.');
    } else if (officeTitle === 'Mayor') {
      politicalOfficeUpkeep = 2000;
      tradeOffNotes.push('Mayoral Office: $2,000/mo municipal liaison & communications.');
    }
  }

  // 4. Workload Calculation (Multi-Role Compounding)
  let workloadHoursWeekly = 0;

  // Career Job Hours
  if (state.currentJob) {
    workloadHoursWeekly += state.currentJob.workingHoursWeekly;
  }

  // Company Executive Hours (12 hours/week per operating business where player owns >= 20%)
  const activeCompaniesCount = state.companies.filter(c => c.playerOwnershipPercentage >= 20).length;
  workloadHoursWeekly += (activeCompaniesCount * 12);

  // Political Office Hours
  if (state.politics.currentOffice.inOffice) {
    const officeTitle = state.politics.currentOffice.title;
    if (officeTitle === 'President / Prime Minister') workloadHoursWeekly += 48;
    else if (officeTitle === 'Cabinet Minister') workloadHoursWeekly += 36;
    else if (officeTitle === 'Member of Parliament') workloadHoursWeekly += 24;
    else if (officeTitle === 'Mayor') workloadHoursWeekly += 20;
    else workloadHoursWeekly += 10;
  }

  // Workload Impact Assessment
  let stressDelta = 0;
  let healthDelta = 0;
  let relationshipDecayDelta = 0;
  let workloadCategory: MonthlyTradeoffAudit['workloadCategory'] = 'Balanced';

  if (workloadHoursWeekly >= 75) {
    workloadCategory = 'Severe Burnout';
    stressDelta = +10;
    healthDelta = -3;
    relationshipDecayDelta = -3;
    tradeOffNotes.push(`Extreme Overwork (${workloadHoursWeekly} hrs/wk): Severe burnout risk, health decay (-3), relationships strained (-3).`);
  } else if (workloadHoursWeekly >= 60) {
    workloadCategory = 'Overworked';
    stressDelta = +6;
    healthDelta = -1;
    relationshipDecayDelta = -2;
    tradeOffNotes.push(`Heavy Multi-Role Workload (${workloadHoursWeekly} hrs/wk): Elevated stress (+6), family neglect (-2).`);
  } else if (workloadHoursWeekly >= 45) {
    workloadCategory = 'Heavy';
    stressDelta = +2;
    relationshipDecayDelta = -1;
  } else if (workloadHoursWeekly <= 30) {
    workloadCategory = 'Leisure';
    stressDelta = -5;
    healthDelta = +1;
    relationshipDecayDelta = +1;
    tradeOffNotes.push(`Balanced Lifestyle (${workloadHoursWeekly} hrs/wk): Ample rest restores health (+1) and family relationships (+1).`);
  } else {
    workloadCategory = 'Balanced';
    stressDelta = -2;
  }

  // 5. Debt Service
  const totalDebtService = state.finances.loans.reduce((acc, l) => acc + l.monthlyPayment, 0);

  const totalLivingExpenses = baseLivingCost + wealthOverhead + securityCost + politicalOfficeUpkeep;
  const totalMonthlyExpenses = totalLivingExpenses + totalDebtService;

  return {
    baseLivingCost,
    wealthOverhead,
    politicalOfficeUpkeep,
    securityCost,
    totalLivingExpenses,
    totalDebtService,
    totalMonthlyExpenses,
    workloadHoursWeekly,
    workloadCategory,
    stressDelta,
    healthDelta,
    relationshipDecayDelta,
    tradeOffNotes
  };
}

/**
 * Applies organizational complexity drag, antitrust compliance, and heir executive trait synergy.
 * (Improvement #6: Heir Trait Synergy & Improvement #7: Antitrust Overhead Scaling)
 */
export function calculateCompanyComplexityOverhead(company: Company, state?: GameState): {
  overheadMultiplier: number;
  complexityDescription: string;
  antitrustComplianceCost: number;
  productivityFactor: number;
  heirSynergyNote?: string;
} {
  let overheadMultiplier = 1.0;
  let complexityDescription = 'Nimble & Streamlined';
  let antitrustComplianceCost = 0;
  let heirSynergyNote: string | undefined = undefined;

  // Headcount complexity scaling
  if (company.employeesCount >= 2500) {
    overheadMultiplier = 1.65;
    complexityDescription = 'Massive Global Bureaucracy';
  } else if (company.employeesCount >= 1000) {
    overheadMultiplier = 1.45;
    complexityDescription = 'Heavy Corporate Hierarchy';
  } else if (company.employeesCount >= 250) {
    overheadMultiplier = 1.25;
    complexityDescription = 'Multi-Divisional Administration';
  } else if (company.employeesCount >= 50) {
    overheadMultiplier = 1.12;
    complexityDescription = 'Growing Middle Management';
  }

  // Antitrust & Monopolistic Regulatory Compliance (Improvement #7)
  if (company.marketShare >= 70) {
    antitrustComplianceCost = 145000;
  } else if (company.marketShare >= 50) {
    antitrustComplianceCost = 65000;
  } else if (company.marketShare >= 35) {
    antitrustComplianceCost = 25000;
  } else if (company.marketShare >= 25) {
    antitrustComplianceCost = 8000;
  }

  // Employee Morale & Productivity Impact
  let productivityFactor = 1.0;
  if (company.employeeMorale >= 85) {
    productivityFactor = 1.15; // High performance culture
  } else if (company.employeeMorale <= 35) {
    productivityFactor = 0.70; // Severe labor disengagement / slowdown
  } else if (company.employeeMorale <= 50) {
    productivityFactor = 0.85; // Low morale friction
  }

  // Heir Trait Synergy (Improvement #6)
  if (state && state.relationships) {
    const familyMembers = state.relationships.filter(r => r.relation === 'Son' || r.relation === 'Daughter' || r.relation === 'Spouse');
    const assignedHeirs = familyMembers.filter(f => 
      company.executives.some(e => e.name.toLowerCase() === f.name.toLowerCase()) ||
      company.boardMembers.some(b => b.name.toLowerCase() === f.name.toLowerCase()) ||
      (state.dynastyHeirId === f.id && company.playerOwnershipPercentage >= 50)
    );

    if (assignedHeirs.length > 0) {
      const topHeir = assignedHeirs[0];
      const intellect = topHeir.skills?.intellect ?? (topHeir.businessAbility || 70);
      const discipline = topHeir.skills?.discipline ?? 70;
      const leadership = topHeir.skills?.leadership ?? 70;

      // Intellect boosts productivity
      if (intellect >= 80) {
        productivityFactor += 0.12;
      } else if (intellect >= 65) {
        productivityFactor += 0.06;
      }

      // Discipline reduces organizational bloat and overhead
      if (discipline >= 80) {
        overheadMultiplier = Math.max(0.85, overheadMultiplier - 0.15);
      } else if (discipline >= 65) {
        overheadMultiplier = Math.max(0.90, overheadMultiplier - 0.08);
      } else if (discipline < 40) {
        overheadMultiplier += 0.10; // Cost leakage from undisciplined oversight
      }

      // Leadership enhances workplace morale resilience
      if (leadership >= 75) {
        heirSynergyNote = `Heir Synergy: ${topHeir.name}'s leadership & discipline bolstered executive efficiency (+${Math.round((productivityFactor - 1) * 100)}% productivity).`;
      }
    }
  }

  return {
    overheadMultiplier,
    complexityDescription,
    antitrustComplianceCost,
    productivityFactor,
    heirSynergyNote
  };
}
