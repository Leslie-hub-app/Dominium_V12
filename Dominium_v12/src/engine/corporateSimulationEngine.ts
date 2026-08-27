import {
  Company,
  CorporateBoardAgenda,
  CorporateBoardSeat,
  CorporateJobVacancy,
  CorporateResolution,
  CorporateShareholderRecord,
  CorporateSystemState,
  CorporateInterviewState,
  CorporateTakeoverDeal,
  GameState,
  InterviewQuestion,
  JobRecord,
  MarketAsset,
} from '../types';
import { generatePublicCompanyUniverse } from '../data/corporateCatalog';
import { ensureInvestmentMarketState } from './investmentEngine';
import { recordFinancialTransaction } from './financialLedgerEngine';
import { simulateMonthlyCorporateDeepEngine } from './corporateDeepSimulationEngine';
import { simulateCorporateCapitalMarkets } from './corporateCapitalMarketsEngine';


const SECTOR_SHOCKS = [
  { sector: 'Technology', label: 'Global semiconductor shortage', costMultiplier: 1.34, demandMultiplier: 0.94 },
  { sector: 'Mining', label: 'Commodity export disruption', costMultiplier: 1.18, demandMultiplier: 0.92 },
  { sector: 'Healthcare', label: 'Regulatory manufacturing review', costMultiplier: 1.12, demandMultiplier: 0.97 },
  { sector: 'Banking', label: 'Credit-market stress', costMultiplier: 1.16, demandMultiplier: 0.91 },
  { sector: 'Energy', label: 'Grid infrastructure shortage', costMultiplier: 1.28, demandMultiplier: 0.95 },
  { sector: 'Consumer', label: 'Household spending shock', costMultiplier: 1.05, demandMultiplier: 0.88 },
  { sector: 'Industrials', label: 'Industrial input shortage', costMultiplier: 1.25, demandMultiplier: 0.93 },
  { sector: 'Telecommunications', label: 'Network equipment disruption', costMultiplier: 1.22, demandMultiplier: 0.95 },
  { sector: 'Transport', label: 'Global freight bottleneck', costMultiplier: 1.30, demandMultiplier: 0.90 },
  { sector: 'Media', label: 'Advertising market contraction', costMultiplier: 1.04, demandMultiplier: 0.86 }
];

function ensureCorporateFields(company: Company): void {
  company.publicFloatShares ??= company.isPublic ? Math.round(company.totalShares * 0.65) : 0;
  company.insiderShares ??= company.isPublic ? Math.round(company.totalShares * 0.15) : company.totalShares;
  company.institutionalShares ??= company.isPublic ? Math.max(0, company.totalShares - company.publicFloatShares - company.insiderShares) : 0;
  company.votingShares ??= company.totalShares;
  company.cashReserve ??= company.cash ?? 0;
  company.cash ??= company.cashReserve;
  company.debt ??= 0;
  company.fixedAssets ??= Math.max(company.cashReserve, company.valuation * 0.6);
  company.totalAssets ??= company.fixedAssets + company.cashReserve;
  company.totalLiabilities ??= company.debt;
  company.cogsMonthly ??= Math.round(company.monthlyRevenue * 0.42);
  company.fixedOverheadCostsMonthly ??= Math.round(company.monthlyRevenue * 0.06);
  company.annualRevenue ??= company.monthlyRevenue * 12;
  company.customerBase ??= Math.max(1000, company.employeesCount * 30);
  company.capacityUtilization ??= 0.72;
  company.demandCoefficient ??= 1;
  company.volatilityIndex ??= 0.04;
  company.high52Week ??= company.sharePrice * 1.15;
  company.low52Week ??= company.sharePrice * 0.75;
  company.peRatio ??= company.monthlyNetProfit > 0 ? 18 : 10;
  company.dividendYield ??= 0;
  company.corporateTaxRate ??= 21;
  company.ceoApprovalRating ??= 70;
  company.employeeWageSatisfaction ??= Math.min(100, company.employeeMorale);
  company.boardSeatCount ??= 7;
  company.boardControlThreshold ??= 50;
  company.sector ??= company.industry;
  company.exchange ??= company.isPublic ? 'ASX' : undefined;
  if (!company.isPublic) {
    company.publicFloatShares = 0;
    company.votingShares = company.totalShares;
  }
}

function macroState(state: GameState): CorporateSystemState['marketSentiment'] {
  const country = state.world?.[state.currentCountryIndex || 0];
  if (!country) return 'STAGNANT';
  if (country.businessCycle === 'Boom') return 'BULL';
  if (country.businessCycle === 'Recession') return 'BEAR';
  if (country.businessCycle === 'Slowdown') return 'STAGNANT';
  return 'BULL';
}

function shareholderSeed(company: Company): CorporateShareholderRecord[] {
  const total = company.totalShares;
  const blocks: Array<[string, string, number, CorporateShareholderRecord['holderType']]> = [
    ['holder_founder', 'Founding Family Trust', 0.15, 'FOUNDER'],
    ['holder_pension', 'Apex Sovereign Pension Fund', 0.12, 'INSTITUTION'],
    ['holder_global', 'Global Index Partners', 0.10, 'INSTITUTION'],
    ['holder_activist', 'Northstar Activist Fund', 0.08, 'HEDGE_FUND'],
    ['holder_guardian', 'Crown Capital Guardian', 0.07, 'INSTITUTION'],
    ['holder_employee', 'Employee Ownership Trust', 0.03, 'EMPLOYEE_TRUST']
  ];
  const used = blocks.reduce((sum, [, , pct]) => sum + pct, 0);
  const retailPct = Math.max(0.01, 1 - used);
  const records = blocks.map(([holderId, holderName, pct, holderType]) => ({
    holderId, holderName, shares: Math.round(total * pct), ownershipPercent: pct * 100, votingPowerPercent: pct * 100, holderType
  }));
  records.push({ holderId: 'holder_retail', holderName: 'ASX Retail Public Float', shares: Math.round(total * retailPct), ownershipPercent: retailPct * 100, votingPowerPercent: retailPct * 100, holderType: 'RETAIL_POOL' });
  const delta = total - records.reduce((s, r) => s + r.shares, 0);
  records[records.length - 1].shares += delta;
  return records;
}

function boardFromShareholders(company: Company, shareholders: CorporateShareholderRecord[], state: GameState): CorporateBoardSeat[] {
  const playerShares = shareholders.find(s => s.holderId === 'player')?.shares || 0;
  const sorted = [...shareholders].sort((a, b) => b.shares - a.shares);
  const seats: CorporateBoardSeat[] = [];
  for (let i = 0; i < 7; i++) {
    const holder = sorted[i % Math.max(1, sorted.length)];
    const agenda: CorporateBoardAgenda = holder.holderId === 'player'
      ? 'PLAYER_ALLY'
      : i % 4 === 0 ? 'SHORT_TERM_ACTIVIST'
      : i % 4 === 1 ? 'CONSERVATIVE_GUARDIAN'
      : i % 4 === 2 ? 'INSULATED_BUREAUCRAT'
      : 'LONG_TERM_BUILDER';
    seats.push({
      id: `${company.id}_seat_${i + 1}`,
      holderId: holder.holderId,
      holderName: holder.holderName,
      representedShares: holder.shares,
      representedOwnershipPercent: holder.ownershipPercent,
      agenda,
      supportLevel: holder.holderId === 'player' ? 100 : 42 + ((i * 9 + company.id.length) % 44),
      influence: Math.min(100, holder.ownershipPercent * 2 + 20),
      isPlayerSeat: holder.holderId === 'player' || (playerShares > 0 && holder.holderId === 'player')
    });
  }
  const player = shareholders.find(s => s.holderId === 'player');
  if (player && player.ownershipPercent >= 5 && !seats.some(seat => seat.isPlayerSeat)) {
    const replaceIndex = seats.length - 1;
    seats[replaceIndex] = {
      id: `${company.id}_seat_${replaceIndex + 1}`,
      holderId: 'player', holderName: player.holderName, representedShares: player.shares,
      representedOwnershipPercent: player.ownershipPercent, agenda: 'PLAYER_ALLY', supportLevel: 100,
      influence: Math.min(100, player.ownershipPercent * 2 + 20), isPlayerSeat: true
    };
  }
  return seats;
}

function syncPlayerOwnership(state: GameState, company: Company): void {
  if (!company.isPublic || !company.totalShares) return;
  const market = ensureInvestmentMarketState(state);
  const asset = market.marketAssets.find(a => a.underlyingCompanyId === company.id);
  const holding = asset ? market.portfolioHoldings.find(h => h.assetId === asset.id) : undefined;
  const ownedShares = holding?.sharesOwned || 0;
  company.playerOwnershipPercentage = Math.max(0, Math.min(100, (ownedShares / company.totalShares) * 100));
}

function syncPlayerShareholder(state: GameState, company: Company, shareholders: CorporateShareholderRecord[]): CorporateShareholderRecord[] {
  const playerShares = Math.round(company.totalShares * ((company.playerOwnershipPercentage || 0) / 100));
  const base = shareholders.filter(s => s.holderId !== 'player').map(s => ({ ...s }));
  if (playerShares <= 0) return base;
  const remainingShares = Math.max(0, company.totalShares - playerShares);
  const baseTotal = Math.max(1, base.reduce((sum, s) => sum + s.shares, 0));
  let assigned = 0;
  base.forEach((holder, index) => {
    if (index === base.length - 1) {
      holder.shares = Math.max(0, remainingShares - assigned);
    } else {
      holder.shares = Math.round(remainingShares * (holder.shares / baseTotal));
      assigned += holder.shares;
    }
    holder.ownershipPercent = (holder.shares / company.totalShares) * 100;
    holder.votingPowerPercent = holder.ownershipPercent;
  });
  base.push({
    holderId: 'player', holderName: `${state.character.firstName} ${state.character.lastName}`, shares: playerShares,
    ownershipPercent: company.playerOwnershipPercentage || 0, votingPowerPercent: company.playerOwnershipPercentage || 0, holderType: 'PLAYER'
  });
  return base;
}

export function initializeCorporateSystemState(): CorporateSystemState {
  return {
    exchangeName: 'Apex Securities Exchange',
    exchangeSymbol: 'ASX',
    publicCompanyIds: [],
    companyRegistryVersion: 1,
    universeSeeded: false,
    jobVacancies: [],
    activeInterviews: [],
    shareholderRecords: {},
    boardSeats: {},
    resolutions: [],
    boardMeetings: [],
    takeoverDeals: [],
    marketSentiment: 'STAGNANT',
    sectorShocks: {},
    eventHistory: [],
    lastProcessedTick: -1,
    cSuiteExecutives: [],
    acquisitionPipeline: [],
    totalEnterpriseValuation: 0,
    consolidatedRevenueMonthly: 0
  };
}

export function ensureCorporateSystemState(state: GameState): CorporateSystemState {
  if (!state.corporateSystem) state.corporateSystem = initializeCorporateSystemState();
  const corp = state.corporateSystem;
  if (!Array.isArray(corp.publicCompanyIds)) corp.publicCompanyIds = [];
  if (!Array.isArray(corp.jobVacancies)) corp.jobVacancies = [];
  if (!Array.isArray(corp.takeoverDeals)) corp.takeoverDeals = [];
  if (!corp.shareholderRecords || typeof corp.shareholderRecords !== 'object') corp.shareholderRecords = {};
  if (!corp.boardSeats || typeof corp.boardSeats !== 'object') corp.boardSeats = {};
  if (!Array.isArray(corp.resolutions)) corp.resolutions = [];
  if (!Array.isArray(corp.activeInterviews)) corp.activeInterviews = [];
  if (!corp.sectorShocks || typeof corp.sectorShocks !== 'object') corp.sectorShocks = {};

  // Seed exactly 200 public companies on first initialization, as required by the supplied CSE specification.
  if (!corp.universeSeeded) {
    const existingPublic = state.companies.filter(c => c.isPublic && c.ticker);
    const generated = generatePublicCompanyUniverse();
    const existingIds = new Set(state.companies.map(c => c.id));
    generated.forEach(c => {
      if (!existingIds.has(c.id)) state.companies.push(c);
    });
    const publicCompanies = state.companies.filter(c => c.isPublic && c.ticker);
    corp.publicCompanyIds = publicCompanies.map(c => c.id);
    corp.universeSeeded = true;
    publicCompanies.forEach(company => {
      ensureCorporateFields(company);
      const seed = shareholderSeed(company);
      const shareholders = syncPlayerShareholder(state, company, seed);
      corp.shareholderRecords[company.id] = shareholders;
      corp.boardSeats[company.id] = boardFromShareholders(company, shareholders, state);
      syncLegacyBoardMembers(company, corp.boardSeats[company.id]);
    });
  } else {
    state.companies.forEach(ensureCorporateFields);
  }

  syncCorporateMarketAssets(state);
  seedInitialVacancies(state, corp);
  state.expansion2Corporate = corp;
  return corp;
}

export function syncCorporateMarketAssets(state: GameState): void {
  const corp = state.corporateSystem || initializeCorporateSystemState();
  const market = ensureInvestmentMarketState(state);
  const existingByCompany = new Set(market.marketAssets.filter(a => a.underlyingCompanyId).map(a => a.underlyingCompanyId));
  state.companies.filter(c => c.isPublic && c.ticker).forEach(company => {
    ensureCorporateFields(company);
    if (!existingByCompany.has(company.id)) {
      const history = company.historicalRevenue.length >= 12
        ? company.historicalRevenue.map((_, i) => Math.max(1, company.sharePrice * (0.88 + i * 0.01)))
        : Array.from({ length: 12 }, () => company.sharePrice);
      const asset: MarketAsset = {
        id: `stock_${company.id}`,
        symbol: company.ticker!,
        name: company.name,
        category: 'STOCK',
        sector: company.sector || company.industry,
        currentPrice: company.sharePrice,
        priceHistory: history.slice(-36),
        high52Week: company.high52Week || company.sharePrice,
        low52Week: company.low52Week || company.sharePrice,
        annualDividendYield: company.dividendYield || 0,
        volatilityRating: (company.volatilityIndex || 0.04) > 0.12 ? 'High' : (company.volatilityIndex || 0.04) > 0.07 ? 'Moderate' : 'Low',
        marketCapBillions: company.valuation / 1_000_000_000,
        underlyingCompanyId: company.id,
        description: `${company.sector || company.industry} company listed on the ${corp.exchangeName}.`
      };
      market.marketAssets.push(asset);
    }
  });
}

function syncLegacyBoardMembers(company: Company, seats: CorporateBoardSeat[]): void {
  company.boardMembers = seats.map(seat => ({
    id: seat.id,
    name: seat.holderName,
    sharesPercentage: seat.representedOwnershipPercent,
    supportLevel: seat.supportLevel,
    agenda: seat.agenda === 'SHORT_TERM_ACTIVIST' ? 'Maximum Dividends' : seat.agenda === 'CONSERVATIVE_GUARDIAN' ? 'Cost Discipline' : seat.agenda === 'LONG_TERM_BUILDER' ? 'R&D Innovation' : seat.agenda === 'PLAYER_ALLY' ? 'Player Ally' : 'Aggressive M&A',
    personality: seat.agenda
  }));
}

function sectorMacroModifier(company: Company, state: GameState): number {
  const country = state.world?.[state.currentCountryIndex || 0];
  const cycle = country?.businessCycle;
  const base = cycle === 'Boom' ? 1.08 : cycle === 'Recession' ? 0.78 : cycle === 'Slowdown' ? 0.94 : cycle === 'Expansion' ? 1.04 : 1.01;
  const rate = country?.centralBankInterestRate || 4.5;
  const inflation = country?.inflationRate || 2.5;
  let sector = 1;
  if (company.sector === 'Banking') sector += (rate - 4) * 0.012;
  if (company.sector === 'Energy') sector -= Math.max(0, rate - 6) * 0.008;
  if (company.sector === 'Consumer') sector -= Math.max(0, inflation - 3) * 0.015;
  if (company.sector === 'Technology') sector += cycle === 'Boom' ? 0.025 : cycle === 'Recession' ? -0.035 : 0;
  return Math.max(0.55, Math.min(1.35, base * sector));
}

function applyEntrepreneurshipContribution(state: GameState, company: Company): number {
  const hours = state.lifeSystem?.timeAllocation?.entrepreneurshipHours || 0;
  if (hours <= 0 || company.playerOwnershipPercentage < 50) return 0;
  const diminishing = 1 - Math.exp(-hours / 110);
  const leadership = ((state.lifeSystem?.personality?.leadership || 50) + (state.character.attributes.intelligence || 50)) / 200;
  return Math.min(0.055, diminishing * 0.055 * (0.65 + leadership * 0.35));
}

function processCompanyFinancials(state: GameState, company: Company, corp: CorporateSystemState, news: string[]): void {
  ensureCorporateFields(company);
  syncPlayerOwnership(state, company);
  const country = state.world?.[state.currentCountryIndex || 0];
  const shock = company.sector ? corp.sectorShocks[company.sector] : undefined;
  const macro = sectorMacroModifier(company, state);
  const shockCost = shock && shock.expiresTick >= state.simulationTick ? shock.costMultiplier : 1;
  const shockDemand = shock && shock.expiresTick >= state.simulationTick ? shock.demandMultiplier : 1;
  const productivity = Math.max(0.45, Math.min(1.45, (company.employeeProductivity / 100) * (0.75 + (company.employeeWageSatisfaction || 60) / 400)));
  const management = 1 + applyEntrepreneurshipContribution(state, company);
  const demand = Math.max(0.4, Math.min(1.8, (company.demandCoefficient || 1) * macro * shockDemand * (0.82 + company.productQuality / 500) * (0.85 + company.brandReputation / 700)));
  const capacity = Math.max(1, company.capacityMonthlyUnits);
  const maxUnits = Math.round(capacity * (company.capacityUtilization || 0.7) * productivity * management);
  const unitsSold = Math.min(maxUnits, Math.max(1, Math.round((company.customerBase || 1000) * demand * 0.12)));
  const unitPrice = Math.max(1, company.unitPrice || Math.max(1, company.monthlyRevenue / Math.max(1, capacity)));
  const revenue = Math.round(unitsSold * unitPrice);
  const cogs = Math.round(revenue * (0.34 + (shockCost - 1) * 0.35) / productivity);
  const payroll = Math.round(company.employeesCount * company.averageEmployeeSalary * (1 + Math.max(0, 1 - company.employeeMorale / 100) * 0.03));
  const overhead = Math.round((company.fixedOverheadCostsMonthly || 0) + (company.marketingBudgetMonthly || 0) + (company.rdBudgetMonthly || 0));
  const interestRate = company.debtInterestRate || ((country?.centralBankInterestRate || 4.5) + 2);
  const interest = Math.round(((company.debt || 0) * interestRate) / 100 / 12);
  const taxRate = company.corporateTaxRate || country?.corporateTaxRate || 21;
  const pretax = revenue - cogs - payroll - overhead - interest;
  const tax = pretax > 0 ? Math.round(pretax * taxRate / 100) : 0;
  const netIncome = Math.round(pretax - tax);

  company.monthlyRevenue = revenue;
  company.annualRevenue = revenue * 12;
  company.cogsMonthly = cogs;
  company.monthlyExpenses = Math.max(0, cogs + payroll + overhead + interest + tax);
  company.monthlyNetProfit = netIncome;
  company.cashReserve = (company.cashReserve || 0) + netIncome;
  company.cash = company.cashReserve;
  company.totalAssets = Math.max(0, (company.fixedAssets || 0) + company.cashReserve);
  company.totalLiabilities = Math.max(0, company.debt || 0);
  company.employeeProductivity = Math.max(10, Math.min(100, company.employeeProductivity + (company.employeeMorale - 60) * 0.015));
  company.employeeWageSatisfaction = Math.max(10, Math.min(100, 50 + (company.averageEmployeeSalary / Math.max(1, 5000)) * 35 + (company.employeeMorale - 50) * 0.2));
  company.capacityUtilization = Math.max(0.2, Math.min(1.0, maxUnits / capacity));
  company.customerBase = Math.max(100, Math.round((company.customerBase || 1000) * (0.997 + (demand - 1) * 0.08 + (company.brandReputation - 50) / 10000)));
  company.marketShare = Math.max(0.05, Math.min(85, company.marketShare + (demand - 1) * 0.08 + (company.productQuality - 50) * 0.002));

  if (company.cashReserve < 0) {
    const creditLine = Math.max(0, company.annualRevenue * 0.12);
    const draw = Math.min(creditLine, Math.abs(company.cashReserve));
    company.debt = (company.debt || 0) + draw;
    company.cashReserve += draw;
    company.creditRating = 'BBB-';
    company.employeeMorale = Math.max(10, company.employeeMorale - 3);
    news.push(`${company.name} drew emergency credit after a liquidity deficit.`);
  } else if ((company.debt || 0) / Math.max(1, company.totalAssets || 1) < 0.25) {
    company.creditRating = 'A';
  } else if ((company.debt || 0) / Math.max(1, company.totalAssets || 1) < 0.55) {
    company.creditRating = 'BBB';
  } else {
    company.creditRating = 'BB';
  }

  company.historicalRevenue.push(revenue);
  company.historicalProfit.push(netIncome);
  if (company.historicalRevenue.length > 36) company.historicalRevenue.shift();
  if (company.historicalProfit.length > 36) company.historicalProfit.shift();
  const previousQuarter = company.lastQuarterRevenue || revenue * 3;
  const currentQuarter = revenue * 3;
  company.lastQuarterRevenueGrowth = previousQuarter > 0 ? (currentQuarter - previousQuarter) / previousQuarter : 0;
  company.lastQuarterRevenue = currentQuarter;
  company.lastQuarterNetIncome = netIncome * 3;
  company.revenueGrowthStreak = company.lastQuarterRevenueGrowth > 0.08 ? (company.revenueGrowthStreak || 0) + 1 : 0;

  const eps = (netIncome * 12) / Math.max(1, company.totalShares);
  const navPerShare = Math.max(0.25, ((company.totalAssets || 0) - (company.totalLiabilities || 0)) / Math.max(1, company.totalShares));
  const pe = Math.max(7, Math.min(35, (company.peRatio || 18) + (macro - 1) * 12));
  const fundamental = Math.max(1, eps * pe + navPerShare);
  const sentiment = corp.marketSentiment === 'BULL' ? 1.05 : corp.marketSentiment === 'BEAR' ? 0.93 : corp.marketSentiment === 'CRISIS' ? 0.80 : 1;
  const volatility = (Math.random() - 0.5) * (company.volatilityIndex || 0.04);
  company.sharePrice = Math.max(1, Math.round(fundamental * sentiment * (1 + volatility) * 100) / 100);
  company.valuation = Math.round(company.sharePrice * company.totalShares);
  company.peRatio = eps > 0 ? Math.round((company.sharePrice / eps) * 100) / 100 : 0;
  company.dividendYield = company.sharePrice > 0 ? Math.round(((netIncome * Math.max(0, company.dividendPayoutRatio)) / Math.max(1, company.totalShares) / company.sharePrice) * 100 * 100) / 100 : 0;
  company.high52Week = Math.max(company.high52Week || company.sharePrice, company.sharePrice);
  company.low52Week = Math.min(company.low52Week || company.sharePrice, company.sharePrice);

  const market = ensureInvestmentMarketState(state);
  const asset = market.marketAssets.find(a => a.underlyingCompanyId === company.id);
  if (asset) {
    asset.currentPrice = company.sharePrice;
    asset.high52Week = company.high52Week;
    asset.low52Week = company.low52Week;
    asset.annualDividendYield = company.dividendYield;
    asset.marketCapBillions = company.valuation / 1_000_000_000;
    asset.priceHistory.push(company.sharePrice);
    if (asset.priceHistory.length > 36) asset.priceHistory.shift();
  }
}

function generateVacancies(state: GameState, corp: CorporateSystemState): void {
  const openByCompany = new Set(corp.jobVacancies.filter(v => v.status === 'OPEN').map(v => v.companyId));
  state.companies.filter(c => c.isPublic && corp.publicCompanyIds.includes(c.id)).forEach(company => {
    const strongExpansion = (company.revenueGrowthStreak || 0) >= 2 && (company.lastQuarterRevenueGrowth || 0) > 0.08;
    const liquiditySafe = (company.cashReserve || 0) > Math.max(1, company.monthlyExpenses * 3);
    if (strongExpansion && liquiditySafe && !openByCompany.has(company.id)) {
      const tier = company.employeesCount > 25000 ? 2 : 1;
      const titles = tier === 1 ? ['Analyst', 'Operations Associate', 'Client Services Associate'] : ['Department Manager', 'Operations Manager', 'Senior Analyst'];
      for (let i = 0; i < 2; i++) {
        const title = titles[(state.simulationTick + i + company.id.length) % titles.length];
        corp.jobVacancies.push({
          id: `vac_${company.id}_${state.simulationTick}_${i}`,
          companyId: company.id,
          companyName: company.name,
          title,
          field: company.industry,
          tier: tier as 1 | 2,
          level: tier === 1 ? 'Professional' : 'Manager',
          salaryMonthly: Math.round((company.averageEmployeeSalary * (tier === 1 ? 1.35 : 2.5)) / 100) * 100,
          workingHoursWeekly: tier === 1 ? 40 : 45,
          performanceBonusPercent: tier === 1 ? 8 : 15,
          requiredIntelligence: tier === 1 ? 50 : 65,
          requiredReputation: tier === 1 ? 20 : 40,
          requiredEducation: tier === 1 ? 'Secondary' : 'Bachelor',
          requiredExperienceMonths: tier === 1 ? 0 : 36,
          interviewDifficulty: tier === 1 ? 1 : 2,
          postedTick: state.simulationTick,
          expiresTick: state.simulationTick + 6,
          status: 'OPEN'
        });
      }
    }
    if (!liquiditySafe) {
      corp.jobVacancies.filter(v => v.companyId === company.id && v.status === 'OPEN').forEach(v => v.status = 'FROZEN');
    }
  });
  corp.jobVacancies.forEach(v => {
    if (v.status === 'OPEN' && v.expiresTick < state.simulationTick) v.status = 'EXPIRED';
  });
  if (corp.jobVacancies.length > 500) corp.jobVacancies = corp.jobVacancies.slice(-500);
}

function questionSet(vacancy: CorporateJobVacancy): InterviewQuestion[] {
  const industry = vacancy.field;
  return [
    {
      prompt: `A major ${industry} competitor cuts prices while demand is uncertain. What is your first response?`,
      options: [
        { text: 'Model unit economics and customer elasticity before changing price.', score: 35 },
        { text: 'Immediately match the competitor to protect market share.', score: 15 },
        { text: 'Increase marketing aggressively and ignore the price move.', score: 10 }
      ]
    },
    {
      prompt: `Your team misses a critical operational target at ${vacancy.companyName}. What do you do?`,
      options: [
        { text: 'Identify the bottleneck, coach the team and establish measurable recovery milestones.', score: 35 },
        { text: 'Replace the lowest performers immediately.', score: 15 },
        { text: 'Escalate the failure without changing the operating process.', score: 5 }
      ]
    },
    {
      prompt: `Senior management asks you to choose between short-term profit and a high-return long-term investment.`,
      options: [
        { text: 'Compare risk-adjusted returns, liquidity needs and strategic positioning before recommending a mix.', score: 30 },
        { text: 'Always maximize the current quarter.', score: 10 },
        { text: 'Always maximize long-term growth regardless of cash constraints.', score: 15 }
      ]
    }
  ];
}

function seedInitialVacancies(state: GameState, corp: CorporateSystemState): void {
  if (corp.jobVacancies.length > 0) return;
  const companies = state.companies.filter(c => c.isPublic && corp.publicCompanyIds.includes(c.id)).slice(0, 20);
  companies.forEach((company, index) => {
    const title = ['Analyst', 'Operations Associate', 'Client Services Associate', 'Junior Financial Analyst'][index % 4];
    corp.jobVacancies.push({
      id: `vac_initial_${company.id}`, companyId: company.id, companyName: company.name, title, field: company.industry, tier: 1, level: 'Professional',
      salaryMonthly: Math.round((company.averageEmployeeSalary * 1.35) / 100) * 100, workingHoursWeekly: 40, performanceBonusPercent: 8,
      requiredIntelligence: 45, requiredReputation: 15, requiredEducation: 'Secondary', requiredExperienceMonths: 0, interviewDifficulty: 1,
      postedTick: state.simulationTick, expiresTick: state.simulationTick + 12, status: 'OPEN'
    });
  });
}

export function getCorporateJobVacancies(state: GameState, field?: string): CorporateJobVacancy[] {
  const corp = ensureCorporateSystemState(state);
  return corp.jobVacancies.filter(v => v.status === 'OPEN' && (!field || v.field === field));
}

export function applyForCorporateVacancy(state: GameState, vacancyId: string): { success: boolean; message: string; interview?: CorporateInterviewState } {
  const corp = ensureCorporateSystemState(state);
  const vacancy = corp.jobVacancies.find(v => v.id === vacancyId && v.status === 'OPEN');
  if (!vacancy) return { success: false, message: 'Vacancy is no longer open.' };
  if ((state.character.attributes.intelligence || 0) < vacancy.requiredIntelligence) return { success: false, message: `Intelligence requirement not met (${vacancy.requiredIntelligence}).` };
  if ((state.character.attributes.reputation || 0) < vacancy.requiredReputation) return { success: false, message: `Professional reputation requirement not met (${vacancy.requiredReputation}).` };
  const applicationId = `corp_app_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const interview: CorporateInterviewState = {
    applicationId,
    vacancyId,
    companyId: vacancy.companyId,
    currentQuestionIndex: 0,
    score: 0,
    questions: questionSet(vacancy),
    passingScore: vacancy.tier === 1 ? 45 : vacancy.tier === 2 ? 65 : vacancy.tier === 3 ? 80 : 90
  };
  corp.activeInterviews.push(interview);
  return { success: true, message: `Interview started for ${vacancy.title} at ${vacancy.companyName}.`, interview };
}

export function answerCorporateInterview(state: GameState, applicationId: string, choiceIndex: number): { success: boolean; message: string; completed?: boolean; hired?: boolean } {
  const corp = ensureCorporateSystemState(state);
  const interview = corp.activeInterviews.find(i => i.applicationId === applicationId);
  if (!interview) return { success: false, message: 'No active corporate interview found.' };
  const vacancy = corp.jobVacancies.find(v => v.id === interview.vacancyId);
  if (!vacancy) return { success: false, message: 'Vacancy no longer exists.' };
  const question = interview.questions[interview.currentQuestionIndex];
  const option = question?.options[Math.max(0, Math.min(choiceIndex, (question?.options.length || 1) - 1))];
  interview.score += option?.score || 0;
  interview.currentQuestionIndex += 1;
  if (interview.currentQuestionIndex < interview.questions.length) {
    return { success: true, completed: false, message: `Question ${interview.currentQuestionIndex} of 3 answered.` };
  }

  const company = state.companies.find(c => c.id === vacancy.companyId);
  const passed = interview.score >= interview.passingScore;
  corp.activeInterviews = corp.activeInterviews.filter(i => i.applicationId !== applicationId);
  if (!passed || !company) {
    return { success: true, completed: true, hired: false, message: `Interview complete: ${interview.score}/${interview.questions.reduce((s, q) => s + Math.max(...q.options.map(o => o.score)), 0)}. The hiring committee declined the application.` };
  }

  vacancy.status = 'FILLED';
  const job: JobRecord = {
    id: `job_${Date.now()}`,
    title: vacancy.title,
    field: vacancy.field,
    level: vacancy.level,
    companyName: company.name,
    companyId: company.id,
    monthlySalary: vacancy.salaryMonthly,
    salary: vacancy.salaryMonthly,
    monthlyBonusPotential: Math.round(vacancy.salaryMonthly * vacancy.performanceBonusPercent / 100),
    stressLevel: vacancy.tier === 1 ? 45 : vacancy.tier === 2 ? 62 : 75,
    workingHoursWeekly: vacancy.workingHoursWeekly,
    reputationRequired: vacancy.requiredReputation,
    intelligenceRequired: vacancy.requiredIntelligence,
    educationRequired: vacancy.requiredEducation,
    startAge: state.character.age,
    performance: 65 + Math.min(25, Math.round((interview.score / 100) * 25)),
    experience: 0
  };
  state.currentJob = job;
  state.character.occupation = vacancy.title;
  if (state.lifeSystem) {
    state.lifeSystem.workplace = undefined;
  }
  return { success: true, completed: true, hired: true, message: `Interview passed. You are now employed by ${company.name} as ${vacancy.title} at $${vacancy.salaryMonthly.toLocaleString()}/month.` };
}

function ownershipTier(percent: number): number {
  if (percent >= 100) return 4;
  if (percent >= 75) return 3.5;
  if (percent >= 50) return 3;
  if (percent >= 25) return 2.5;
  if (percent >= 10) return 2;
  if (percent >= 5) return 1.5;
  if (percent >= 1) return 1;
  return 0;
}

export function inspectCorporateCompany(state: GameState, companyIdOrTicker: string): Company | undefined {
  ensureCorporateSystemState(state);
  return state.companies.find(c => c.id === companyIdOrTicker || c.ticker?.toUpperCase() === companyIdOrTicker.toUpperCase());
}

export function buyCorporateShares(state: GameState, ticker: string, quantity: number): { success: boolean; message: string } {
  const company = inspectCorporateCompany(state, ticker);
  if (!company || !company.isPublic || !company.ticker) return { success: false, message: 'Public company not found.' };
  if (!Number.isFinite(quantity) || quantity <= 0) return { success: false, message: 'Quantity must be positive.' };
  const market = ensureInvestmentMarketState(state);
  const asset = market.marketAssets.find(a => a.underlyingCompanyId === company.id);
  if (!asset) return { success: false, message: 'Company security is not available on the exchange.' };
  const available = Math.max(0, company.publicFloatShares || company.totalShares);
  const owned = market.portfolioHoldings.find(h => h.assetId === asset.id)?.sharesOwned || 0;
  if (quantity > available + owned) return { success: false, message: 'Order exceeds available public float.' };
  const total = Math.round(asset.currentPrice * quantity * 100) / 100;
  if (state.finances.cash < total) return { success: false, message: `Insufficient cash: $${total.toLocaleString()} required.` };
  state.finances.cash -= total;
  let holding = market.portfolioHoldings.find(h => h.assetId === asset.id);
  if (!holding) {
    holding = { assetId: asset.id, symbol: asset.symbol, name: asset.name, category: 'STOCK', sharesOwned: quantity, avgPurchasePrice: asset.currentPrice, currentValue: total, totalCostBasis: total, unrealizedGainLoss: 0, unrealizedGainLossPercent: 0, dividendsEarnedLifetime: 0 };
    market.portfolioHoldings.push(holding);
  } else {
    const newCost = holding.totalCostBasis + total;
    holding.sharesOwned += quantity;
    holding.avgPurchasePrice = newCost / holding.sharesOwned;
    holding.totalCostBasis = newCost;
    holding.currentValue = holding.sharesOwned * asset.currentPrice;
  }
  const floatBefore = Math.max(1, company.publicFloatShares || company.totalShares);
  company.publicFloatShares = Math.max(0, floatBefore - quantity);
  const demandImpact = Math.min(0.08, (quantity / floatBefore) * 0.6);
  company.sharePrice = Math.max(1, Math.round(company.sharePrice * (1 + demandImpact) * 100) / 100);
  company.valuation = Math.round(company.sharePrice * company.totalShares);
  company.playerOwnershipPercentage = (holding.sharesOwned / company.totalShares) * 100;
  const corp = ensureCorporateSystemState(state);
  corp.shareholderRecords[company.id] = syncPlayerShareholder(state, company, corp.shareholderRecords[company.id] || shareholderSeed(company));
  corp.boardSeats[company.id] = boardFromShareholders(company, corp.shareholderRecords[company.id], state);
  syncLegacyBoardMembers(company, corp.boardSeats[company.id]);
  recordFinancialTransaction(state, { type: 'STOCK_PURCHASE', category: 'ASSET', amount: total, description: `Purchased ${quantity.toLocaleString()} shares of ${company.ticker} on ASX.` });
  return { success: true, message: `Purchased ${quantity.toLocaleString()} ${company.ticker} shares. Ownership: ${company.playerOwnershipPercentage.toFixed(2)}%.` };
}

export function sellCorporateShares(state: GameState, ticker: string, quantity: number): { success: boolean; message: string } {
  const company = inspectCorporateCompany(state, ticker);
  if (!company || !company.isPublic || !company.ticker) return { success: false, message: 'Public company not found.' };
  const market = ensureInvestmentMarketState(state);
  const asset = market.marketAssets.find(a => a.underlyingCompanyId === company.id);
  const holding = asset ? market.portfolioHoldings.find(h => h.assetId === asset.id) : undefined;
  if (!asset || !holding || holding.sharesOwned < quantity || quantity <= 0) return { success: false, message: 'Insufficient shares.' };
  const proceeds = Math.round(quantity * asset.currentPrice * 100) / 100;
  holding.sharesOwned -= quantity;
  holding.totalCostBasis = Math.max(0, holding.totalCostBasis - quantity * holding.avgPurchasePrice);
  holding.currentValue = holding.sharesOwned * asset.currentPrice;
  state.finances.cash += proceeds;
  company.publicFloatShares = Math.min(company.totalShares, (company.publicFloatShares || 0) + quantity);
  const supplyImpact = Math.min(0.08, (quantity / Math.max(1, company.totalShares)) * 0.8);
  company.sharePrice = Math.max(1, Math.round(company.sharePrice * (1 - supplyImpact) * 100) / 100);
  company.valuation = Math.round(company.sharePrice * company.totalShares);
  if (holding.sharesOwned <= 0) market.portfolioHoldings = market.portfolioHoldings.filter(h => h.assetId !== asset.id);
  company.playerOwnershipPercentage = (holding.sharesOwned / company.totalShares) * 100;
  const corp = ensureCorporateSystemState(state);
  corp.shareholderRecords[company.id] = syncPlayerShareholder(state, company, corp.shareholderRecords[company.id] || shareholderSeed(company));
  corp.boardSeats[company.id] = boardFromShareholders(company, corp.shareholderRecords[company.id], state);
  syncLegacyBoardMembers(company, corp.boardSeats[company.id]);
  return { success: true, message: `Sold ${quantity.toLocaleString()} ${company.ticker} shares for $${proceeds.toLocaleString()}.` };
}

function applyCorporateResolution(state: GameState, resolution: CorporateResolution): void {
  if (resolution.status !== 'PASSED') return;
  const company = state.companies.find(c => c.id === resolution.companyId);
  if (!company) return;
  if (resolution.type === 'DIVIDEND') company.dividendPayoutRatio = Math.min(0.8, Math.max(0, company.dividendPayoutRatio || 0) + 0.1);
  if (resolution.type === 'DEBT_ISSUANCE') company.debt = (company.debt || 0) + Math.round(company.valuation * 0.05);
  if (resolution.type === 'ASSET_SALE') { const proceeds = Math.round((company.fixedAssets || 0) * 0.05); company.fixedAssets = Math.max(0, (company.fixedAssets || 0) - proceeds); company.cashReserve += proceeds; }
  if (resolution.type === 'RESTRUCTURE') company.employeesCount = Math.max(1, Math.round(company.employeesCount * 0.97));
  if (resolution.type === 'CAPEX') { const spend = Math.min(company.cashReserve, Math.round(company.cashReserve * 0.08)); company.cashReserve -= spend; company.capacityMonthlyUnits = Math.round(company.capacityMonthlyUnits * 1.04); company.productQuality = Math.min(100, company.productQuality + 1); }
}

export function proposeCorporateResolution(state: GameState, companyId: string, type: CorporateResolution['type'], title: string, description: string): { success: boolean; message: string } {
  const company = inspectCorporateCompany(state, companyId);
  if (!company) return { success: false, message: 'Company not found.' };
  const percent = company.playerOwnershipPercentage || 0;
  if (percent < 10) return { success: false, message: 'At least 10% ownership is required to introduce a formal corporate resolution.' };
  const corp = ensureCorporateSystemState(state);
  corp.resolutions.push({ id: `res_${Date.now()}`, companyId, type, title, description, proposedBy: 'player', requiredMajority: type === 'MERGER' || type === 'BYLAW_CHANGE' ? 66 : 50, votesFor: percent, votesAgainst: 0, status: 'PENDING', createdTick: state.simulationTick });
  return { success: true, message: 'Resolution submitted for shareholder/board consideration.' };
}

export function launchCorporateProxyBattle(state: GameState, companyId: string): { success: boolean; message: string } {
  const company = inspectCorporateCompany(state, companyId);
  if (!company || !company.isPublic) return { success: false, message: 'Proxy battles require a listed public company.' };
  if ((company.playerOwnershipPercentage || 0) < 5) return { success: false, message: 'At least 5% ownership is required to launch a proxy battle.' };
  const corp = ensureCorporateSystemState(state);
  const board = corp.boardSeats[company.id] || [];
  let support = company.playerOwnershipPercentage || 0;
  board.forEach(seat => {
    if (seat.isPlayerSeat) return;
    const affinity = seat.agenda === 'PLAYER_ALLY' ? 0.9 : seat.agenda === 'SHORT_TERM_ACTIVIST' ? 0.65 : seat.agenda === 'INSULATED_BUREAUCRAT' ? 0.42 : 0.32;
    support += seat.representedOwnershipPercent * affinity;
  });
  const influenceCost = Math.max(5000, Math.round(company.valuation * 0.00008));
  if (state.finances.cash < influenceCost) return { success: false, message: `Proxy campaign requires $${influenceCost.toLocaleString()} in advisory, legal and shareholder outreach costs.` };
  state.finances.cash -= influenceCost;
  if (support >= 50) {
    company.ceoApprovalRating = Math.max(20, (company.ceoApprovalRating || 70) - 20);
    corp.eventHistory.unshift(`Proxy battle succeeded at ${company.name}; board alignment shifted toward the player.`);
    return { success: true, message: `Proxy battle succeeded with estimated ${support.toFixed(1)}% support. Board alignment shifted.` };
  }
  corp.eventHistory.unshift(`Proxy battle failed at ${company.name}; incumbent board retained control.`);
  return { success: true, message: `Proxy battle failed with estimated ${support.toFixed(1)}% support. Incumbent board retained control.` };
}

export function executeCorporateSqueezeOut(state: GameState, companyId: string): { success: boolean; message: string } {
  const company = inspectCorporateCompany(state, companyId);
  if (!company || !company.isPublic) return { success: false, message: 'Company is not a public listing.' };
  if ((company.playerOwnershipPercentage || 0) < 90) return { success: false, message: 'At least 90% ownership is required for a squeeze-out.' };
  const market = ensureInvestmentMarketState(state);
  const asset = market.marketAssets.find(a => a.underlyingCompanyId === company.id);
  if (!asset) return { success: false, message: 'Security not found.' };
  const remainingShares = Math.max(0, company.totalShares - Math.round(company.totalShares * company.playerOwnershipPercentage / 100));
  const cost = Math.round(remainingShares * asset.currentPrice);
  if (state.finances.cash < cost) return { success: false, message: `Squeeze-out requires $${cost.toLocaleString()}.` };
  state.finances.cash -= cost;
  company.playerOwnershipPercentage = 100;
  company.isPublic = false;
  company.exchange = undefined;
  company.publicFloatShares = 0;
  company.insiderShares = company.totalShares;
  company.institutionalShares = 0;
  const corp = ensureCorporateSystemState(state);
  corp.publicCompanyIds = corp.publicCompanyIds.filter(id => id !== company.id);
  return { success: true, message: `${company.name} has been fully acquired and delisted after the 90% squeeze-out.` };
}

export function launchCorporateTakeover(state: GameState, targetId: string, premiumPercent = 25, hostile = true): { success: boolean; message: string; deal?: CorporateTakeoverDeal } {
  const company = inspectCorporateCompany(state, targetId);
  if (!company || !company.isPublic) return { success: false, message: 'Target must be a listed public company.' };
  const premium = Math.max(20, Math.min(45, premiumPercent));
  const offerValue = Math.round(company.valuation * (1 + premium / 100));
  const playerNetWorth = Math.max(0, state.finances.cash);
  const regulatoryRisk = Math.min(95, Math.max(5, (company.marketShare > 20 ? 45 : 10) + (state.companies.filter(c => c.playerOwnershipPercentage >= 50 && c.sector === company.sector).length * 12)));
  if (playerNetWorth < offerValue * 0.15) return { success: false, message: `Financing capacity insufficient. The transaction requires at least 15% of the offer value in committed equity.` };
  const corp = ensureCorporateSystemState(state);
  const deal: CorporateTakeoverDeal = {
    id: `deal_${Date.now()}`,
    targetCompanyId: company.id,
    bidderId: 'player',
    targetCompanyName: company.name,
    marketCapitalization: company.valuation,
    acquisitionPremiumPercent: premium,
    offerValue,
    sharesTargeted: company.totalShares,
    sharesAcquired: Math.round(company.totalShares * company.playerOwnershipPercentage / 100),
    stage: 'BOARD_REVIEW',
    hostile,
    regulatoryRisk,
    financingRequired: offerValue,
    financingDebt: Math.round(offerValue * 0.65),
    createdTick: state.simulationTick,
    notes: [`Acquisition premium ${premium}%`, `Regulatory risk ${regulatoryRisk}%`]
  };
  corp.takeoverDeals.push(deal);
  return { success: true, message: `Takeover offer submitted at ${premium}% premium for $${offerValue.toLocaleString()}.`, deal };
}

export function advanceCorporateTakeover(state: GameState, dealId: string): { success: boolean; message: string } {
  const corp = ensureCorporateSystemState(state);
  const deal = corp.takeoverDeals.find(d => d.id === dealId);
  if (!deal) return { success: false, message: 'Deal not found.' };
  const company = state.companies.find(c => c.id === deal.targetCompanyId);
  if (!company) return { success: false, message: 'Target company not found.' };
  if (deal.stage === 'BOARD_REVIEW') {
    const board = corp.boardSeats[company.id] || [];
    const hostileResistance = deal.hostile ? board.filter(b => b.agenda === 'CONSERVATIVE_GUARDIAN' || b.agenda === 'LONG_TERM_BUILDER').length * 8 : 0;
    if (deal.acquisitionPremiumPercent < 30 && hostileResistance > 16) {
      deal.stage = 'REJECTED';
      return { success: true, message: 'The board rejected the takeover as undervalued.' };
    }
    deal.stage = 'REGULATORY_REVIEW';
    return { success: true, message: 'Board review passed. Deal routed to regulatory review.' };
  }
  if (deal.stage === 'REGULATORY_REVIEW') {
    if (deal.regulatoryRisk > 70) {
      deal.stage = 'REJECTED';
      return { success: true, message: 'Antitrust review blocked the transaction.' };
    }
    deal.stage = 'FINANCING';
    return { success: true, message: 'Regulatory review cleared. Financing structure is now required.' };
  }
  if (deal.stage === 'FINANCING') {
    const equityNeeded = deal.offerValue - deal.financingDebt;
    if (state.finances.cash < equityNeeded) {
      return { success: false, message: `You need $${equityNeeded.toLocaleString()} cash equity to close this financing package.` };
    }
    deal.stage = 'SHAREHOLDER_OFFER';
    return { success: true, message: 'Financing committed. Shareholder tender phase opened.' };
  }
  if (deal.stage === 'SHAREHOLDER_OFFER') {
    const equityNeeded = deal.offerValue - deal.financingDebt;
    if (state.finances.cash < equityNeeded) return { success: false, message: 'Cash equity is no longer sufficient.' };
    state.finances.cash -= equityNeeded;
    const companyShares = company.totalShares;
    company.playerOwnershipPercentage = 100;
    company.isPublic = false;
    company.exchange = undefined;
    company.publicFloatShares = 0;
    company.insiderShares = companyShares;
    company.institutionalShares = 0;
    company.votingShares = companyShares;
    company.cashReserve += Math.round(deal.financingDebt * 0.35);
    company.debt = (company.debt || 0) + deal.financingDebt;
    corp.publicCompanyIds = corp.publicCompanyIds.filter(id => id !== company.id);
    deal.sharesAcquired = companyShares;
    deal.stage = 'COMPLETED';
    return { success: true, message: `${company.name} is now a private wholly-owned company. The ticker has been delisted.` };
  }
  return { success: false, message: 'Deal is not awaiting an actionable stage.' };
}

export function appointCorporateCEO(state: GameState, companyId: string, name: string, competence = 80): { success: boolean; message: string } {
  const company = inspectCorporateCompany(state, companyId);
  if (!company) return { success: false, message: 'Company not found.' };
  if ((company.playerOwnershipPercentage || 0) < 50) return { success: false, message: 'Controlling interest is required to appoint the CEO.' };
  const existing = company.executives.find(e => e.role === 'CEO');
  if (existing) {
    existing.name = name;
    existing.competence = Math.max(40, Math.min(100, competence));
    existing.loyalty = 85;
  } else {
    company.executives.push({ id: `ceo_${Date.now()}`, name, role: 'CEO', salaryMonthly: Math.max(15000, company.averageEmployeeSalary * 8), competence: Math.max(40, Math.min(100, competence)), loyalty: 85, ambition: 80, personality: 'Aggressive Growth' });
  }
  company.ceoApprovalRating = 75;
  return { success: true, message: `${name} appointed CEO of ${company.name}.` };
}

export function removeCorporateCEO(state: GameState, companyId: string): { success: boolean; message: string } {
  const company = inspectCorporateCompany(state, companyId);
  if (!company) return { success: false, message: 'Company not found.' };
  if ((company.playerOwnershipPercentage || 0) < 50) return { success: false, message: 'Controlling interest is required to remove the CEO.' };
  const before = company.executives.length;
  company.executives = company.executives.filter(e => e.role !== 'CEO');
  company.ceoApprovalRating = 40;
  return before !== company.executives.length ? { success: true, message: `CEO removed from ${company.name}; the board must now appoint replacement leadership.` } : { success: false, message: 'No CEO found.' };
}

export function executeCorporateCommand(state: GameState, companyId: string, command: 'SET_WAGE' | 'HIRE' | 'RESTRUCTURE' | 'DIVIDEND', value: number): { success: boolean; message: string } {
  const company = inspectCorporateCompany(state, companyId);
  if (!company) return { success: false, message: 'Company not found.' };
  const ownership = company.playerOwnershipPercentage || 0;
  if (ownership < 50) return { success: false, message: 'Controlling interest of at least 50% is required.' };
  if (command === 'SET_WAGE') {
    const marketWage = Math.max(1000, company.averageEmployeeSalary);
    company.averageEmployeeSalary = Math.round(Math.max(marketWage * 0.85, Math.min(marketWage * 1.15, value)));
    company.employeeMorale = Math.max(10, Math.min(100, company.employeeMorale + (company.averageEmployeeSalary >= marketWage ? 2 : -3)));
    return { success: true, message: `Average wage set to $${company.averageEmployeeSalary.toLocaleString()}.` };
  }
  if (command === 'HIRE') {
    const count = Math.max(1, Math.min(10000, Math.round(value)));
    company.employeesCount += count;
    company.capacityMonthlyUnits = Math.round(company.capacityMonthlyUnits * (1 + count / Math.max(1, company.employeesCount) * 0.65));
    return { success: true, message: `Hired ${count.toLocaleString()} employees. Capacity increased.` };
  }
  if (command === 'RESTRUCTURE') {
    const count = Math.max(0, Math.min(company.employeesCount - 1, Math.round(value)));
    company.employeesCount -= count;
    company.employeeMorale = Math.max(10, company.employeeMorale - Math.min(20, count / Math.max(1, company.employeesCount) * 12));
    return { success: true, message: `Restructured ${count.toLocaleString()} positions. Morale has been reduced.` };
  }
  const payout = Math.max(0, Math.min(1, value));
  company.dividendPayoutRatio = payout;
  return { success: true, message: `Dividend payout ratio set to ${(payout * 100).toFixed(0)}%.` };
}

function processCareerProgression(state: GameState, corp: CorporateSystemState): void {
  if (!state.currentJob || !state.currentJob.companyId) return;
  const company = state.companies.find(c => c.id === state.currentJob?.companyId);
  if (!company) return;
  const profile = state.expandedCareer;
  const months = profile?.monthsInCurrentRole || 0;
  if (months < 12 || (state.currentJob.performance || 0) < 85) return;
  const alreadyPending = corp.jobVacancies.some(v => v.status === 'OPEN' && v.companyId === company.id && v.title.startsWith('Promotion:'));
  if (alreadyPending) return;
  const nextTier = state.currentJob.level === 'Professional' ? 2 : state.currentJob.level === 'Manager' ? 3 : 4;
  if (nextTier <= 4) {
    corp.jobVacancies.push({
      id: `promo_${company.id}_${state.simulationTick}`, companyId: company.id, companyName: company.name, title: `Promotion: ${nextTier >= 3 ? 'Director' : 'Senior ' + state.currentJob.title}`, field: company.industry,
      tier: nextTier as 1 | 2 | 3 | 4, level: nextTier === 2 ? 'Manager' : nextTier === 3 ? 'Director' : 'Executive', salaryMonthly: Math.round(state.currentJob.monthlySalary * 1.18),
      workingHoursWeekly: nextTier >= 3 ? 48 : 42, performanceBonusPercent: nextTier >= 3 ? 22 : 15, requiredIntelligence: 60 + nextTier * 5, requiredReputation: 35 + nextTier * 8, requiredEducation: nextTier >= 3 ? 'Bachelor' : 'Secondary',
      requiredExperienceMonths: months, interviewDifficulty: nextTier, postedTick: state.simulationTick, expiresTick: state.simulationTick + 4, status: 'OPEN'
    });
  }
}

export function simulateMonthlyCorporateEngine(state: GameState, news: string[] = []): void {
  // Deep corporate layer: CEO succession, institutional capital, regulation and M&A.
  const corp = ensureCorporateSystemState(state);
  corp.marketSentiment = macroState(state);
  corp.lastProcessedTick = state.simulationTick;

  // Rare industry shock; the effect is deterministic for the current turn once selected.
  if (Math.random() < 0.18) {
    const shock = SECTOR_SHOCKS[state.simulationTick % SECTOR_SHOCKS.length];
    corp.sectorShocks[shock.sector] = { label: shock.label, costMultiplier: shock.costMultiplier, demandMultiplier: shock.demandMultiplier, expiresTick: state.simulationTick + 2 };
    corp.eventHistory.unshift(`${shock.label} affects ${shock.sector} companies.`);
    news.push(`${shock.label} affects the ${shock.sector} sector.`);
  }

  corp.publicCompanyIds.forEach(id => {
    const company = state.companies.find(c => c.id === id);
    if (company && company.isPublic) processCompanyFinancials(state, company, corp, news);
  });


  generateVacancies(state, corp);
  processCareerProgression(state, corp);
  corp.totalEnterpriseValuation = state.companies.filter(c => c.playerOwnershipPercentage > 0).reduce((sum, c) => sum + c.valuation * (c.playerOwnershipPercentage / 100), 0);
  corp.consolidatedRevenueMonthly = state.companies.filter(c => c.playerOwnershipPercentage > 0).reduce((sum, c) => sum + c.monthlyRevenue * (c.playerOwnershipPercentage / 100), 0);

  // Annual general meeting every four turns (the supplied document defines a four-quarter cycle).
  if (state.simulationTick > 0 && state.simulationTick % 12 === 0) {
    corp.resolutions.filter(r => r.status === 'PENDING').forEach(r => {
      const company = state.companies.find(c => c.id === r.companyId);
      if (!company) return;
      const board = corp.boardSeats[company.id] || [];
      const support = board.reduce((sum, seat) => {
        if (seat.agenda === 'SHORT_TERM_ACTIVIST' && ['DIVIDEND', 'RESTRUCTURE'].includes(r.type)) return sum + seat.representedOwnershipPercent;
        if (seat.agenda === 'CONSERVATIVE_GUARDIAN' && ['DEBT_ISSUANCE', 'ASSET_SALE'].includes(r.type)) return sum + seat.representedOwnershipPercent;
        if (seat.isPlayerSeat) return sum + company.playerOwnershipPercentage;
        return sum + seat.representedOwnershipPercent * (seat.supportLevel / 100);
      }, 0);
      r.votesFor = support;
      r.votesAgainst = Math.max(0, 100 - support);
      r.status = support >= r.requiredMajority ? 'PASSED' : 'FAILED';
      applyCorporateResolution(state, r);
    });
  }
  // Deep layer runs after base company financials so it can react to the current turn's results.
  simulateMonthlyCorporateDeepEngine(state, news);
  simulateCorporateCapitalMarkets(state, news);
}
