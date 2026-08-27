import { 
  GameState, 
  LifeEvent, 
  NewsItem, 
  CharacterAttributes,
  JobRecord,
  Company,
  SportsTeam,
  RealEstateProperty,
  PendingDecision,
  PoliticalOffice,
  SimulationDiff,
  MonthlySimulationResult
} from '../types';
import { COUNTRIES_DATA, INITIAL_STOCKS, INITIAL_ACHIEVEMENTS, CHALLENGE_SCENARIOS } from '../data/initialData';
import { CAREER_CATALOG, AVAILABLE_PROPERTIES_CATALOG, INITIAL_PARTIES, SPORTS_TEAMS_AVAILABLE } from '../data/catalogs';
import { getSystemicConditionalRules } from './conditionalRules';
import { evaluateConditionalConsequence, ConsequenceEngine, normalizeEventConsequencesToTyped } from './consequenceEngine';
import { processDueDelayedConsequences } from './delayedConsequenceEngine';
import { calculateSimulationDiff, evaluateCausalEvents, createSimulationSnapshot } from './causalEventEngine';
import { 
  processActiveEventChains, 
  startEventChain, 
  advanceEventChain, 
  createBusinessCrisisChain, 
  createPoliticalCampaignChain 
} from './eventChainEngine';
import { evaluatePoliticalTriggers } from './politicalEventEngine';
import { advanceFamilySimulation } from './familyEngine';
import { evaluateCompanyEventTriggers } from './companyEventEngine';
import {
  createInitialEventControlState,
  processExpiredDecisions,
  filterAndControlEvents,
  filterAndControlDecisions,
  isEventOnCooldown,
  setEventCooldown
} from './eventControlEngine';
import {
  calculatePlayerPowerProfile,
  POWER_TIER_DEFINITIONS,
  POWER_TIER_RANKS,
  getPowerTierRank,
  isPowerTierAtLeast,
  isPowerTierAtMost,
  filterEventsByPowerTier,
  filterDecisionsByPowerTier
} from './powerTierEngine';
import {
  generateConsequenceNews,
  calculateNewsImportance,
  formatCurrencyShort,
  mapImportanceToSeverity
} from './newsEngine';
import {
  createInitialDynastyProfile,
  ensureDynastyProfile,
  scanAndRecordDynastyMilestones,
  executeDynastySuccession,
  generateLegacyReport,
  calculateLegacyScorecard,
  simulateSuccessionDynamics,
  syncHeirAttributes,
  updateDynastyMetrics,
  recordDynastyTimelineEvent,
  DEFAULT_SUCCESSION_PLAN
} from './dynastyEngine';
import {
  calculateMonthlyTradeoffsAndOverhead,
  calculateCompanyComplexityOverhead
} from './balanceEngine';
import {
  evaluateAllObjectives,
  checkAndNotifyObjectiveCompletions,
  donateToPhilanthropy,
  claimObjectiveReward,
  pinObjective,
  setCampaign,
  setSandboxMode,
  getAllCampaigns,
  getActiveCampaign,
  CAMPAIGNS_CATALOG
} from './objectiveEngine';
import {
  initializeProgressionProfile,
  evaluateLifeProgression,
  LIFE_TIER_DEFINITIONS
} from './lifeProgressionEngine';
import {
  evaluateLifeGameplay,
  deriveResponsibilities,
  calculateLifePressures,
  generateStateOpportunities,
  calculateComplexityProfile,
  inferPlayerStrategyProfile
} from './lifeGameplayEngine';
import {
  advanceMonthlyLife,
  ensureLifeSystemState,
  calculateMonthlyTimeBudget,
  recordLifeBiography,
  DEFAULT_MONTHLY_ALLOCATION
} from './lifeEngine';
import {
  initializeLivingWorldProfile,
  ensureLivingWorldProfile,
  advanceLivingWorldSimulation
} from './livingWorldEngine';
import { ensureFinancialLedger, recordFinancialTransaction } from './financialLedgerEngine';
import { ensureExpandedCareerProfile, simulateMonthlyCareerStep } from './careerEngine';
import { ensureBankingSystemProfile, simulateMonthlyBankingStep } from './bankingEngine';
import { ensureCreditProfileState, simulateMonthlyCreditStep } from './creditEngine';
import { ensureInvestmentMarketState, simulateMonthlyInvestmentStep } from './investmentEngine';
import { ensureLegalSystemProfile, simulateMonthlyLegalStep } from './legalEngine';
import { ensurePropertySystemState, simulateMonthlyPropertyStep } from './propertyEngine';
import { simulateMonthlyRealEstatePlatform, ensureRealEstatePlatform } from './realEstatePlatformEngine';
import { governWorldTick } from './worldGovernorCoordinator';
import { simulatePersonalManagementMonthly } from './personalLifeManagementEngine';
import { simulateMonthlyTaxStep } from './taxSystemEngine';
import { simulateMonthlyJusticeStep } from './justiceWorldEngine';
import { simulateMonthlyRealEstateIndustry, ensureRealEstateIndustry } from './realEstateIndustryEngine';
import { ensureWorldGovernor } from './worldGovernorState';
import { simulateMonthlyCorporateManagement } from './businessManagementEngine';
import { simulateMonthlyCorporateManagementV2 } from './corporateManagementEngine';
import { simulateMonthlyLivingWealth } from './livingWealthEngine';
import { ensureCorporateSystemState, simulateMonthlyCorporateEngine } from './corporateSimulationEngine';
import { ensureGovernmentOfficeState, simulateMonthlyGovernmentOfficeStep } from './governmentEngine';
import { ensureLivingBankingProfile, simulateMonthlyLivingBanking } from './livingBankingEngine';
import { ensurePoliticalGovernance, simulateMonthlyPoliticalGovernance } from './politicalGovernanceEngine';
import { simulateMonthlyGovernmentLiving } from './governmentLivingEngine';
import { simulateGovernmentMachinery } from './governmentMachineryEngine';
import { simulateCorporateWorkforceMonthly } from './corporateWorkforceEngine';
import { processCorporateBoardroomMonthly } from './corporateBoardMeetingEngine';
import { advanceAdvancedWorld, validateWorldIntegrity } from './advancedWorldEngine';
import { advancePlayablePaths } from './playablePathsEngine';
import { advanceDeepGameplay } from './deepGameplayEngine';

export {
  initializeLivingWorldProfile,
  ensureLivingWorldProfile,
  advanceLivingWorldSimulation
} from './livingWorldEngine';

export {
  evaluateLifeGameplay,
  deriveResponsibilities,
  calculateLifePressures,
  generateStateOpportunities,
  calculateComplexityProfile,
  inferPlayerStrategyProfile
} from './lifeGameplayEngine';

export {
  advanceMonthlyLife,
  ensureLifeSystemState,
  calculateMonthlyTimeBudget,
  recordLifeBiography,
  DEFAULT_MONTHLY_ALLOCATION
} from './lifeEngine';

export {
  createInitialDynastyProfile,
  ensureDynastyProfile,
  scanAndRecordDynastyMilestones,
  executeDynastySuccession,
  generateLegacyReport,
  calculateLegacyScorecard,
  simulateSuccessionDynamics,
  syncHeirAttributes,
  updateDynastyMetrics,
  recordDynastyTimelineEvent,
  DEFAULT_SUCCESSION_PLAN
} from './dynastyEngine';

export {
  evaluateAllObjectives,
  checkAndNotifyObjectiveCompletions,
  donateToPhilanthropy,
  claimObjectiveReward,
  pinObjective,
  setCampaign,
  setSandboxMode,
  getAllCampaigns,
  getActiveCampaign
} from './objectiveEngine';

export {
  generateConsequenceNews,
  calculateNewsImportance,
  formatCurrencyShort,
  mapImportanceToSeverity
} from './newsEngine';

export {
  calculatePlayerPowerProfile,
  POWER_TIER_DEFINITIONS,
  POWER_TIER_RANKS,
  getPowerTierRank,
  isPowerTierAtLeast,
  isPowerTierAtMost,
  filterEventsByPowerTier,
  filterDecisionsByPowerTier
} from './powerTierEngine';

export {
  createInitialEventControlState,
  processExpiredDecisions,
  filterAndControlEvents,
  filterAndControlDecisions,
  isEventOnCooldown,
  getRemainingCooldownMonths,
  recordEventCooldown,
  DEFAULT_EVENT_CONTROL_CONFIG
} from './eventControlEngine';

export {
  calculateSimulationDiff,
  createSimulationSnapshot,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  evaluateCausalEvents
} from './causalEventEngine';

export {
  processActiveEventChains,
  startEventChain,
  advanceEventChain,
  createBusinessCrisisChain,
  createPoliticalCampaignChain,
  createPartyRecruitmentChain,
  createComprehensiveCampaignChain,
  createPolicyCrisisChain,
  createPoliticalLobbyingChain,
  createPoliticalScandalChain,
  createReElectionCampaignChain,
  evaluatePoliticalTriggers
} from './eventChainEngine';

export {
  recordDecisionHistory,
  recordConsequenceHistory,
  recordDecisionWithConsequences,
  createDecisionHistoryEntry,
  createConsequenceHistoryEntry,
  formatDecisionHistoryForAi,
  formatConsequenceHistoryForAi
} from './historyEngine';

export {
  scheduleDelayedConsequence,
  processDueDelayedConsequences,
  calculateFutureDate
} from './delayedConsequenceEngine';

export {
  applyConsequence,
  applyConsequences,
  evaluateCondition,
  evaluateConditionLogic,
  evaluateConditionalConsequence,
  extractStateValue,
  ConsequenceEngine,
  calculateOperationValue
} from './consequenceEngine';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function createInitialGameState(
  firstName: string,
  lastName: string,
  gender: 'Male' | 'Female' | 'Non-binary',
  birthCountry: string = 'United States',
  birthCity: string = 'New York',
  gameMode: any = 'Life Mode',
  difficulty: any = 'Realistic',
  challengeId?: string
): GameState {
  const challenge = challengeId ? CHALLENGE_SCENARIOS.find(c => c.id === challengeId) : null;
  const campaign = challengeId ? CAMPAIGNS_CATALOG.find(c => c.id === challengeId) : null;

  let initialCash = difficulty === 'Relaxed' ? 15000 : 2500;
  let initialAge = 18;

  if (campaign) {
    if (campaign.initialCash !== undefined) initialCash = campaign.initialCash;
    if (campaign.initialAge !== undefined) initialAge = campaign.initialAge;
  } else if (challenge) {
    initialCash = challenge.initialCash;
    initialAge = challenge.initialAge;
  }
  const startYear = 2026;
  const startMonth = 1;

  const initialAttributes: CharacterAttributes = {
    health: 85,
    happiness: 80,
    intelligence: 65,
    stress: 20,
    attractiveness: 70,
    charm: 60,
    reputation: 30,
    worldInfluence: 5
  };

  const initialOffice: PoliticalOffice = {
    title: 'Citizen',
    cityOrNation: birthCity,
    approvalRating: 50,
    politicalCapital: 10,
    inOffice: false,
    termMonthsRemaining: 0,
    salaryMonthly: 0
  };

  const state: GameState = {
    version: '2.1',
    saveVersion: 21,
    gameMode,
    difficulty,
    currentMonth: startMonth,
    currentYear: startYear,
    simulationTick: 0,
    character: {
      id: 'player_001',
      firstName,
      lastName,
      gender,
      birthMonth: startMonth,
      birthYear: startYear - initialAge,
      age: initialAge,
      avatarSeed: `${firstName}_${gender}_${initialAge}`,
      attributes: initialAttributes,
      birthCity,
      birthCountry,
      residenceCity: birthCity,
      residenceCountry: birthCountry,
      lifeStage: initialAge < 26 ? 'Young Adult' : 'Adult',
      creditScore: 680,
      socialFollowers: 350,
      socialSentiment: 65,
      hobbies: ['Fitness & Jogging', 'Reading Business Books'],
      possessions: {
        homesCount: 0,
        vehicles: ['Pre-owned Compact Sedan'],
        luxuries: ['Stainless Steel Wristwatch']
      },
      lifeGoals: [
        { id: 'g1', text: 'Reach $1,000,000 Net Worth', completed: false },
        { id: 'g2', text: 'Own a registered profitable enterprise', completed: false },
        { id: 'g3', text: 'Obtain a University Degree or Professional Certification', completed: false },
        { id: 'g4', text: 'Attain a high leadership position (Director, CEO, or Public Office)', completed: false }
      ]
    },
    education: [
      {
        id: 'edu_init_hs',
        institution: `${birthCity} Central Academy`,
        qualification: 'Secondary',
        field: 'General Studies',
        startAge: 14,
        durationMonths: 48,
        monthsCompleted: 48,
        tuitionPerMonth: 0,
        completed: true,
        gradeAverage: 88
      }
    ],
    currentJob: null,
    careerHistory: [],
    relationships: [
      {
        id: 'rel_father',
        name: `Robert ${lastName}`,
        relation: 'Father',
        age: initialAge + 28,
        gender: 'Male',
        occupation: 'Senior Logistics Specialist',
        wealth: 65000,
        trust: 90,
        love: 95,
        respect: 85,
        loyalty: 95,
        influence: 60,
        alive: true,
        avatarSeed: 'robert_father'
      },
      {
        id: 'rel_mother',
        name: `Eleanor ${lastName}`,
        relation: 'Mother',
        age: initialAge + 26,
        gender: 'Female',
        occupation: 'Educator & High School Teacher',
        wealth: 52000,
        trust: 95,
        love: 98,
        respect: 90,
        loyalty: 95,
        influence: 65,
        alive: true,
        avatarSeed: 'eleanor_mother'
      },
      {
        id: 'rel_friend_1',
        name: 'David Vance',
        relation: 'Friend',
        age: initialAge,
        gender: 'Male',
        occupation: 'Junior Web Developer',
        wealth: 8000,
        trust: 80,
        love: 70,
        respect: 75,
        loyalty: 80,
        influence: 40,
        alive: true,
        avatarSeed: 'david_friend'
      }
    ],
    familyTree: [],
    finances: {
      cash: initialCash,
      accounts: [
        { id: 'acc_chk', type: 'Checking', balance: initialCash, interestRateAnnual: 0.5 }
      ],
      loans: [],
      stocks: JSON.parse(JSON.stringify(INITIAL_STOCKS)),
      properties: [],
      monthlyBaseExpenses: 1200
    },
    companies: [],
    politics: {
      currentOffice: initialOffice,
      parties: JSON.parse(JSON.stringify(INITIAL_PARTIES)),
      selectedPartyId: null,
      pastOffices: [],
      nationalPolicies: {
        taxBracket: 'Balanced Moderate',
        healthcareSpending: 'Universal',
        educationInvestment: 'High STEM',
        infrastructureFocus: 'Smart Cities',
        defenceLevel: 'Standard'
      }
    },
    sports: {
      personalAthleteCareer: undefined,
      ownedTeams: []
    },
    projects: [],
    world: JSON.parse(JSON.stringify(COUNTRIES_DATA)),
    currentCountryIndex: 0,
    eventsFeed: [
      {
        id: `ev_start_${Date.now()}`,
        timestampMonth: startMonth,
        timestampYear: startYear,
        age: initialAge,
        category: 'Life',
        title: 'A New Journey Begins in Dominium',
        description: `You begin your adult life in ${birthCity}, ${birthCountry}. With $${initialCash.toLocaleString()} in your account and high ambitions, the simulated world awaits your decisions.`,
        consequences: {
          cashChange: 0,
          healthChange: 0,
          happinessChange: +5,
          details: ['Character initialized with standard life parameters.']
        }
      }
    ],
    pendingDecisions: [
      {
        id: 'dec_first_direction',
        category: 'Career',
        title: 'Initial Career Direction',
        description: 'You have completed basic secondary education. How will you take your first major career step?',
        urgency: 'Standard',
        priority: 2,
        affectedEntity: `${firstName} ${lastName} (Personal Career)`,
        risk: 'Medium',
        potentialUpside: 'Establish foundational salary, career momentum, or equity ownership.',
        potentialDownside: 'Opportunity cost of delayed university education or early startup capital loss.',
        canBePostponed: true,
        expiresAtTick: 6,
        createdTick: 1,
        createdDate: `${MONTH_NAMES[startMonth - 1]} ${startYear}`,
        options: [
          {
            id: 'opt_seek_job',
            label: 'Enter the Workforce Immediately',
            description: 'Apply for an entry-level position to start generating stable income and career experience.',
            risk: 'Low',
            timeHorizon: '1-3 months',
            projectedOutcome: 'Immediate cash flow, entry onto the professional ladder.',
            handlerKey: 'OPT_SEEK_JOB'
          },
          {
            id: 'opt_enroll_uni',
            label: 'Enroll in University Degree',
            description: 'Invest in higher education to unlock high-earning corporate, tech, or medical professions.',
            cost: 950,
            risk: 'Low',
            timeHorizon: '2-4 years',
            projectedOutcome: '+18 Intelligence, higher salary cap, elite career access.',
            handlerKey: 'OPT_ENROLL_UNI'
          },
          {
            id: 'opt_start_hustle',
            label: 'Bootstrap a Tech Micro-Startup',
            description: 'Take a high-risk entrepreneurial bet using initial savings to develop software products.',
            cost: 1500,
            risk: 'High',
            timeHorizon: '6-12 months',
            projectedOutcome: 'Equity ownership in your first business entity or early capital loss.',
            handlerKey: 'OPT_START_HUSTLE'
          }
        ]
      }
    ],
    newsArchive: [
      {
        id: 'news_init_1',
        month: startMonth,
        year: startYear,
        headline: 'Global Markets Open the Year with Moderate Growth',
        body: 'Central banks maintain steady benchmark rates while technology sector rallies on breakthroughs in artificial intelligence and automation.',
        category: 'Economy',
        importance: 'NORMAL',
        severity: 'Info',
        impactExplanation: 'Technology equities and capital investments present strong short-term tailwinds.'
      }
    ],
    achievements: JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)),
    analyticsHistory: [
      {
        month: startMonth,
        year: startYear,
        age: initialAge,
        netWorth: initialCash,
        cash: initialCash,
        monthlyIncome: 0,
        monthlyExpenses: 1200,
        health: 85,
        stress: 20,
        reputation: 30,
        worldInfluence: 5
      }
    ],
    dynastyGeneration: 1,
    dynastyHeirId: null,
    activeChallengeId: challengeId || null,

    // Phase 19: Dynamic Objectives & Campaign System
    activeCampaignId: campaign ? campaign.id : (challengeId?.startsWith('camp_') ? challengeId : null),
    isSandboxMode: challengeId === 'camp_sandbox' || (!challengeId && !campaign),
    pinnedObjectiveId: campaign ? campaign.primaryObjectiveId : null,
    completedObjectiveIds: [],
    claimedObjectiveRewardIds: [],
    lifetimePhilanthropy: 0,

    decisionHistory: [],
    consequenceHistory: [],
    delayedConsequences: [],
    activeEventChains: [],
    completedEventChains: [],
    eventControlState: createInitialEventControlState(),
    playerPowerProfile: {
      powerScore: 0,
      powerTier: 'UNKNOWN',
      visibility: 5,
      mediaAttention: 5,
      politicalInfluence: 2,
      businessInfluence: 2,
      publicInfluence: 5,
      scrutiny: 5,
      regulatoryAttention: 2,
      breakdown: {
        netWorthScore: 0,
        businessScore: 0,
        politicsScore: 0,
        reputationScore: 0,
        mediaScore: 0,
        projectsScore: 0,
        sportsScore: 0,
        philanthropyScore: 0
      },
      tierPerks: [],
      tierBurdens: [],
      progressToNextTierPercent: 0,
      nextTier: 'LOCAL',
      pointsToNextTier: 70,
      tierRank: 0
    }
  };

  // Find country index
  const countryIdx = state.world.findIndex(c => c.name === birthCountry);
  if (countryIdx !== -1) {
    state.currentCountryIndex = countryIdx;
  }

  // Setup Turnaround CEO challenge initial condition
  if (challengeId === 'chal_turnaround_ceo') {
    const distressedCompany: Company = {
      id: 'comp_distressed_01',
      name: 'Vanguard Precision Manufacturing',
      industry: 'Manufacturing',
      city: birthCity,
      country: birthCountry,
      valuation: 4500000,
      sharePrice: 4.5,
      totalShares: 1000000,
      playerOwnershipPercentage: 65,
      isPublic: false,
      cashReserve: 120000,
      monthlyRevenue: 180000,
      monthlyExpenses: 215000,
      monthlyNetProfit: -35000,
      employeesCount: 45,
      averageEmployeeSalary: 3800,
      employeeMorale: 42,
      employeeProductivity: 58,
      marketShare: 6.5,
      brandReputation: 50,
      productQuality: 70,
      pricingStrategy: 'Competitive',
      marketingBudgetMonthly: 12000,
      rdBudgetMonthly: 8000,
      capacityMonthlyUnits: 5000,
      inventoryUnits: 1200,
      unitCost: 32,
      unitPrice: 45,
      supplierType: 'International Low-Cost',
      supplierCostFactor: 1.0,
      executives: [
        {
          id: 'exec_cfo_1',
          name: 'Arthur Sterling',
          role: 'CFO',
          salaryMonthly: 14000,
          competence: 72,
          loyalty: 65,
          ambition: 80,
          personality: 'Cost Cutter',
          aiOpinion: 'We are burning $35,000 monthly. I advise immediate supplier renegotiation and cutting overhead.'
        }
      ],
      boardMembers: [
        { id: 'bm_1', name: 'Helena Drake', sharesPercentage: 20, supportLevel: 45, agenda: 'Cost Discipline', personality: 'Stern Investor' },
        { id: 'bm_2', name: 'Marcus Sterling', sharesPercentage: 15, supportLevel: 60, agenda: 'Player Ally', personality: 'Supportive Founder' }
      ],
      historicalRevenue: [195000, 190000, 185000, 180000],
      historicalProfit: [-20000, -25000, -30000, -35000],
      dividendPayoutRatio: 0
    };
    state.companies.push(distressedCompany);
  }

  // Calculate actual initial power profile from initial state
  state.playerPowerProfile = calculatePlayerPowerProfile(state);

  // Initialize Phase 18 Dynasty Profile and Peak Net Worth
  state.peakNetWorth = initialCash;
  state.lifetimePhilanthropy = 0;
  state.dynastyProfile = createInitialDynastyProfile(state.character, startYear, startMonth);

  // Initialize Phase 4 Life Mode System State
  ensureLifeSystemState(state);

  // Initialize Expansion 1A Life Progression Profile
  state.lifeProgression = initializeProgressionProfile(state);

  // Initialize Expansion 1B Deep Life Gameplay Profile (Responsibilities, Pressures, Opportunities, Complexity, Strategy)
  const { updatedGameplayProfile } = evaluateLifeGameplay(state, state);
  state.lifeGameplay = updatedGameplayProfile;

  // Initialize Expansion 1D Living World & Autonomous Simulation Profile
  state.livingWorld = initializeLivingWorldProfile(state);
  state.financialLedger = ensureFinancialLedger(state);
  state.expandedCareer = ensureExpandedCareerProfile(state);
  state.bankingProfile = ensureBankingSystemProfile(state);
  state.creditProfileState = ensureCreditProfileState(state);
  state.investmentMarket = ensureInvestmentMarketState(state);
  ensureCorporateSystemState(state);
  state.propertyPortfolio = ensurePropertySystemState(state);
  state.legalProfile = ensureLegalSystemProfile(state);
  state.governmentOffice = ensureGovernmentOfficeState(state);

  return state;
}

export function calculateNetWorth(state: GameState): number {
  let total = state.finances.cash;

  // Add bank savings
  state.finances.accounts.forEach(acc => {
    if (acc.type !== 'Checking') {
      total += acc.balance;
    }
  });

  // Add stock assets value
  state.finances.stocks.forEach(stock => {
    total += stock.sharesOwned * stock.currentPrice;
  });

  // Add property equity (Value - Remaining Mortgage)
  state.finances.properties.forEach(prop => {
    const mortgageDebt = prop.mortgage ? prop.mortgage.remainingBalance : 0;
    total += Math.max(0, prop.currentValue - mortgageDebt);
  });

  // Add Company equity share
  state.companies.forEach(comp => {
    const playerCompanyEquity = (comp.valuation * comp.playerOwnershipPercentage) / 100;
    total += Math.max(0, playerCompanyEquity);
  });

  // Add Sports Teams equity
  state.sports.ownedTeams.forEach(team => {
    total += (team.valuation * team.playerOwnershipPercentage) / 100;
  });

  // Deduct personal unsecured loans
  state.finances.loans.forEach(loan => {
    total -= loan.remainingBalance;
  });

  return Math.round(total);
}

export function advanceOneMonth(prevState: GameState): MonthlySimulationResult {
  const beforeSnapshot = createSimulationSnapshot(prevState);
  let state: GameState = JSON.parse(JSON.stringify(prevState));
  const events: LifeEvent[] = [];
  const news: NewsItem[] = [];

  state.simulationTick += 1;
  state.currentMonth += 1;
  if (state.currentMonth > 12) {
    state.currentMonth = 1;
    state.currentYear += 1;
  }
  // Keep compatibility calendar fields synchronized with the authoritative current date.
  state.month = state.currentMonth;
  state.year = state.currentYear;

  // 0. PROCESS EXPIRED DECISIONS & COOLDOWNS (Phase 9)
  const expirationOutcome = processExpiredDecisions(state);
  state = expirationOutcome.nextState;
  if (expirationOutcome.generatedEvents.length > 0) {
    events.push(...expirationOutcome.generatedEvents);
  }

  // 0.1 PROCESS DUE DELAYED CONSEQUENCES (Phase 6)
  const delayedOutcome = processDueDelayedConsequences(state);
  state = delayedOutcome.nextState;
  if (delayedOutcome.generatedEvents.length > 0) {
    events.push(...delayedOutcome.generatedEvents);
  }

  // 0.5 PROCESS ACTIVE MULTI-STAGE EVENT CHAINS (Phase 8)
  const chainOutcome = processActiveEventChains(state);
  state = chainOutcome.nextState;
  if (chainOutcome.generatedEvents.length > 0) {
    events.push(...chainOutcome.generatedEvents);
  }

  const isBirthday = state.currentMonth === state.character.birthMonth;
  if (isBirthday) {
    state.character.age += 1;
    // Update life stage
    if (state.character.age >= 61) state.character.lifeStage = 'Senior';
    else if (state.character.age >= 41) state.character.lifeStage = 'Mature Adult';
    else if (state.character.age >= 26) state.character.lifeStage = 'Adult';
    else if (state.character.age >= 18) state.character.lifeStage = 'Young Adult';
    else if (state.character.age >= 13) state.character.lifeStage = 'Teenage';
    else if (state.character.age >= 6) state.character.lifeStage = 'Childhood';

    events.push({
      id: `ev_bday_${state.simulationTick}`,
      timestampMonth: state.currentMonth,
      timestampYear: state.currentYear,
      age: state.character.age,
      category: 'Life',
      title: `Celebrated ${state.character.age}th Birthday! 🎂`,
      description: `You turned ${state.character.age} years old. Family and colleagues celebrated your milestone year.`,
      consequences: {
        happinessChange: +6,
        healthChange: state.character.age > 50 ? -1 : 0,
        details: [`Life stage is now: ${state.character.lifeStage}`]
      }
    });
  }

  // 1. MACRO ECONOMIC ENGINE
  const country = state.world[state.currentCountryIndex];
  if (country) {
    // Cycle simulation
    const cycleShifts: Record<string, { next: any; prob: number }> = {
      'Recovery': { next: 'Expansion', prob: 0.15 },
      'Expansion': { next: 'Boom', prob: 0.12 },
      'Boom': { next: 'Slowdown', prob: 0.18 },
      'Slowdown': { next: 'Recession', prob: 0.20 },
      'Recession': { next: 'Recovery', prob: 0.25 },
    };

    if (Math.random() < cycleShifts[country.businessCycle]?.prob) {
      const oldCycle = country.businessCycle;
      country.businessCycle = cycleShifts[country.businessCycle].next;
      const isMajor = country.businessCycle === 'Recession' || country.businessCycle === 'Boom';
      news.push({
        id: `news_cycle_${state.simulationTick}`,
        month: state.currentMonth,
        year: state.currentYear,
        headline: `National Economy Shifts into ${country.businessCycle} Phase`,
        body: `Economic analysts at the central statistical agency report transition from ${oldCycle} to ${country.businessCycle}.`,
        category: 'Economy',
        importance: isMajor ? 'MAJOR' : 'NORMAL',
        severity: country.businessCycle === 'Recession' ? 'Warning' : 'Info',
        impactExplanation: `Macroeconomic cycle transitioned from ${oldCycle} to ${country.businessCycle}.`
      });
    }

    // Dynamic economic variables
    if (country.businessCycle === 'Boom') {
      country.gdpGrowthRate = Math.min(5.5, country.gdpGrowthRate + 0.1);
      country.unemploymentRate = Math.max(2.5, country.unemploymentRate - 0.1);
      country.inflationRate = Math.min(6.5, country.inflationRate + 0.15);
    } else if (country.businessCycle === 'Recession') {
      country.gdpGrowthRate = Math.max(-3.5, country.gdpGrowthRate - 0.2);
      country.unemploymentRate = Math.min(12.0, country.unemploymentRate + 0.25);
      country.inflationRate = Math.max(0.8, country.inflationRate - 0.1);
    } else if (country.businessCycle === 'Slowdown') {
      country.gdpGrowthRate = Math.max(0.5, country.gdpGrowthRate - 0.1);
      country.unemploymentRate = Math.min(6.5, country.unemploymentRate + 0.05);
    } else if (country.businessCycle === 'Expansion' || country.businessCycle === 'Recovery') {
      country.gdpGrowthRate = Math.min(3.5, Math.max(1.5, country.gdpGrowthRate + 0.05));
      country.unemploymentRate = Math.max(3.8, country.unemploymentRate - 0.05);
    }

    // Dynamic Central Bank Rate Reaction Rule (Improvement #1)
    // Formula: targetRate = neutralRate + max(0, (inflation - 2.0) * 0.6) + cycleSpread
    const neutralRate = country.id === 'country_jp' ? 0.5 : (country.id === 'country_ch' ? 1.0 : (country.id === 'country_za' ? 6.5 : 2.5));
    const inflationGap = country.inflationRate - 2.0;
    const inflationComponent = Math.max(0, inflationGap * 0.6);
    const cycleSpread = country.businessCycle === 'Boom' ? 0.75 : (country.businessCycle === 'Recession' ? -1.0 : (country.businessCycle === 'Slowdown' ? 0.25 : 0));
    const targetRate = Math.max(0.1, Math.min(16.0, Math.round((neutralRate + inflationComponent + cycleSpread) * 100) / 100));

    const prevRate = country.centralBankInterestRate || neutralRate;
    const rateDiff = targetRate - prevRate;
    if (Math.abs(rateDiff) >= 0.05) {
      const step = Math.sign(rateDiff) * Math.min(0.25, Math.abs(rateDiff));
      country.centralBankInterestRate = Math.round((prevRate + step) * 100) / 100;

      // Report benchmark monetary policy adjustments when shift is >= 0.25%
      if (Math.abs(country.centralBankInterestRate - prevRate) >= 0.20 && Math.random() < 0.35) {
        const isHike = country.centralBankInterestRate > prevRate;
        news.push({
          id: `news_cbrate_${state.simulationTick}`,
          month: state.currentMonth,
          year: state.currentYear,
          headline: `Central Bank ${isHike ? 'Hikes' : 'Lowers'} Benchmark Interest Rate to ${country.centralBankInterestRate}%`,
          body: `Monetary policy authorities reacted to ${country.inflationRate.toFixed(1)}% inflation and ${country.businessCycle.toLowerCase()} macro dynamics by adjusting statutory lending rates.`,
          category: 'Economy',
          importance: 'NORMAL',
          severity: isHike ? 'Warning' : 'Positive',
          impactExplanation: `Borrowing costs and corporate debt interest adjusted to ${country.centralBankInterestRate}%.`
        });
      }
    }
  }

  // 1.5 CORPORATE SIMULATION ENGINE — public companies are processed from macro → sector → operations → financials → market price.
  const corporateNews: string[] = [];
  simulateMonthlyCorporateEngine(state, corporateNews);
  corporateNews.forEach((headline, i) => news.push({
    id: `corp_news_${state.simulationTick}_${i}`,
    month: state.currentMonth,
    year: state.currentYear,
    headline,
    body: headline,
    category: 'Business',
    importance: 'NORMAL',
    severity: 'Warning',
    impactExplanation: 'Generated by the Corporate Simulation Engine.'
  }));

  // 2. STOCKS & FINANCIAL MARKETS SIMULATION (Improvement #2: Sector Fundamentals Integration)
  state.finances.stocks.forEach(stock => {
    const marketDirection = country?.businessCycle === 'Boom' ? 0.018 : (country?.businessCycle === 'Recession' ? -0.022 : (country?.businessCycle === 'Slowdown' ? -0.005 : 0.006));
    
    // Map stock category to operating company industries
    const sectorIndustryMap: Record<string, string[]> = {
      'Tech': ['Technology', 'Software', 'AI & Quantum', 'Semiconductors', 'Robotics', 'Internet'],
      'Health': ['Healthcare', 'Biotechnology', 'Pharmaceuticals', 'Medical Devices', 'Health'],
      'Finance': ['Finance', 'Banking', 'Fintech', 'Venture Capital', 'Asset Management', 'Insurance'],
      'Energy': ['Energy', 'Renewable Energy', 'CleanTech', 'Oil & Gas', 'Utilities'],
      'Consumer': ['Retail', 'Consumer Goods', 'E-Commerce', 'Food & Beverage', 'Hospitality', 'Logistics'],
      'Commodity': ['Manufacturing', 'Mining', 'Agriculture', 'Raw Materials', 'Industrial'],
      'Crypto': ['Technology', 'Fintech', 'Software']
    };

    const matchingIndustries = sectorIndustryMap[stock.category] || [stock.category];
    const relevantCompanies = state.companies.filter(c => 
      matchingIndustries.some(ind => c.industry.toLowerCase().includes(ind.toLowerCase()) || ind.toLowerCase().includes(c.industry.toLowerCase()))
    );

    let sectorFundamentalSignal = 0;
    if (relevantCompanies.length > 0) {
      // Calculate weighted aggregate company performance signal
      let weightedHealthSum = 0;
      let totalWeight = 0;

      relevantCompanies.forEach(comp => {
        const profitMargin = comp.monthlyRevenue > 0 ? (comp.monthlyNetProfit / comp.monthlyRevenue) : 0;
        const marginScore = Math.max(-0.5, Math.min(0.5, profitMargin));
        const qualityScore = ((comp.productQuality || 50) - 50) / 100;
        const brandScore = ((comp.brandReputation || 50) - 50) / 100;
        const compHealth = (marginScore * 0.5) + (qualityScore * 0.25) + (brandScore * 0.25);
        
        // Weight by relative scale (bounded so player company exerts realistic market pull)
        const weight = Math.min(0.35, ((comp.valuation / 50_000_000) * 0.15) + ((comp.marketShare / 100) * 0.20));
        weightedHealthSum += compHealth * weight;
        totalWeight += weight;
      });

      const avgWeightedHealth = totalWeight > 0 ? (weightedHealthSum / totalWeight) : 0;
      // Bounded sector fundamental impact [-3.5%, +3.5%]
      sectorFundamentalSignal = Math.max(-0.035, Math.min(0.035, avgWeightedHealth * Math.min(0.35, totalWeight)));
    } else {
      // Sector structural drift when player has no active operating enterprise in that sector
      if (stock.category === 'Tech') {
        sectorFundamentalSignal = country?.businessCycle === 'Boom' ? 0.008 : 0.002;
      } else if (stock.category === 'Finance') {
        const rateBonus = ((country?.centralBankInterestRate || 4.5) - 3.5) * 0.0015;
        sectorFundamentalSignal = Math.max(-0.01, Math.min(0.01, rateBonus));
      } else if (stock.category === 'Energy') {
        sectorFundamentalSignal = (country?.inflationRate || 2.5) > 3.5 ? 0.006 : -0.002;
      }
    }

    const noise = (Math.random() - 0.48) * stock.volatility * 0.38;
    const monthlyReturn = marketDirection + sectorFundamentalSignal + noise;
    const prevPrice = stock.currentPrice;
    stock.currentPrice = Math.max(1.0, Math.round((prevPrice * (1 + monthlyReturn)) * 100) / 100);
    stock.priceHistory.push(stock.currentPrice);
    if (stock.priceHistory.length > 24) stock.priceHistory.shift();

    // Dividend payout
    if (stock.sharesOwned > 0 && stock.dividendYieldAnnual > 0) {
      const monthlyDividend = (stock.sharesOwned * stock.currentPrice * (stock.dividendYieldAnnual / 100)) / 12;
      if (monthlyDividend >= 10) {
        state.finances.cash += Math.round(monthlyDividend);
      }
    }
  });

  // 3. EMPLOYMENT & CAREER
  let monthlySalaryEarned = 0;
  if (state.currentJob) {
    monthlySalaryEarned = state.currentJob.monthlySalary;
    state.finances.cash += monthlySalaryEarned;

    // Career stress & fatigue calculation
    const hoursPenalty = Math.max(0, (state.currentJob.workingHoursWeekly - 40) * 0.4);
    state.character.attributes.stress = Math.min(100, Math.max(0, state.character.attributes.stress + (state.currentJob.stressLevel * 0.1) + hoursPenalty - 2));

    // Performance review
    const performanceDelta = (state.character.attributes.intelligence * 0.3 + state.character.attributes.reputation * 0.3 - state.character.attributes.stress * 0.2) / 100;
    state.currentJob.performance = Math.min(100, Math.max(10, state.currentJob.performance + performanceDelta));

    // Automatic Promotion Opportunity Check (Causal: Performance >= 90 and not on 12-month promotion cooldown)
    if (state.currentJob.performance >= 90) {
      const companyKey = state.currentJob.companyId || state.currentJob.field;
      if (!isEventOnCooldown(state, 'CAREER_PROMOTION_EVALUATION', companyKey)) {
        const careerDef = CAREER_CATALOG.find(c => c.field === state.currentJob?.field);
        if (careerDef) {
          const currIdx = careerDef.levels.findIndex(l => l.title === state.currentJob?.title);
          if (currIdx !== -1 && currIdx < careerDef.levels.length - 1) {
            const nextLevel = careerDef.levels[currIdx + 1];
            if (state.character.attributes.intelligence >= nextLevel.intelligenceReq && state.character.attributes.reputation >= nextLevel.reputationReq) {
              const oldTitle = state.currentJob.title;
              state.currentJob.title = nextLevel.title;
              state.currentJob.level = nextLevel.level;
              state.currentJob.monthlySalary = nextLevel.salaryMonthly;
              state.currentJob.stressLevel = nextLevel.stress;
              state.currentJob.workingHoursWeekly = nextLevel.hours;
              state.currentJob.performance = 75;

              // Apply 12-month promotion evaluation cooldown for this role
              state = setEventCooldown(state, 'CAREER_PROMOTION_EVALUATION', companyKey, 12);

              events.push({
                id: `ev_promo_${state.simulationTick}`,
                timestampMonth: state.currentMonth,
                timestampYear: state.currentYear,
                age: state.character.age,
                category: 'Career',
                title: `Promoted to ${nextLevel.title}! 🚀`,
                description: `Recognized for stellar leadership and superior performance (${state.currentJob.performance}/100), you advanced from ${oldTitle} to ${nextLevel.title}.`,
                triggerReason: `High sustained performance score (${state.currentJob.performance}/100) and qualifying credentials met statutory promotion threshold.`,
                consequences: {
                  cashChange: nextLevel.salaryMonthly,
                  reputationChange: +6,
                  worldInfluenceChange: +3,
                  stressChange: +4,
                  details: [`New monthly compensation: $${nextLevel.salaryMonthly.toLocaleString()}/month`]
                }
              });
            }
          }
        }
      }
    }
  }

  // 4. EDUCATION PROGRESS
  state.education.forEach(edu => {
    if (!edu.completed) {
      edu.monthsCompleted += 1;
      if (edu.tuitionPerMonth > 0) {
        state.finances.cash -= edu.tuitionPerMonth;
      }
      if (edu.monthsCompleted >= edu.durationMonths) {
        edu.completed = true;
        state.character.attributes.intelligence = Math.min(100, state.character.attributes.intelligence + 15);
        state.character.attributes.reputation = Math.min(100, state.character.attributes.reputation + 8);
        events.push({
          id: `ev_grad_${state.simulationTick}`,
          timestampMonth: state.currentMonth,
          timestampYear: state.currentYear,
          age: state.character.age,
          category: 'Life',
          title: `Graduated from ${edu.institution}! 🎓`,
          description: `Successfully completed your ${edu.qualification} in ${edu.field}. Your academic credentials and market stature have increased significantly.`,
          consequences: {
            intelligenceChange: +15,
            reputationChange: +8,
            happinessChange: +10,
            details: ['Unlocked advanced corporate, scientific, and legal careers.']
          }
        });
      }
    }
  });

  // 4.5 ADVANCE LIFE MODE SYSTEM (Time budget, burnout, workplace dynamics, university progression, social media)
  const lifeSimulationResult = advanceMonthlyLife(state);
  if (lifeSimulationResult.monthlyEvents.length > 0) {
    events.push(...lifeSimulationResult.monthlyEvents);
  }
  if (lifeSimulationResult.monthlyNews.length > 0) {
    news.push(...lifeSimulationResult.monthlyNews);
  }

  // 5. PROPERTIES & REAL ESTATE
  let monthlyNetRent = 0;
  state.finances.properties.forEach(prop => {
    let income = 0;
    if (prop.isRented) {
      income = prop.monthlyRent;
      monthlyNetRent += (income - prop.monthlyMaintenance);
    } else {
      monthlyNetRent -= prop.monthlyMaintenance;
    }

    // Mortgage servicing
    if (prop.mortgage && prop.mortgage.remainingBalance > 0) {
      const payment = Math.min(prop.mortgage.remainingBalance, prop.mortgage.monthlyPayment);
      prop.mortgage.remainingBalance -= (payment * 0.8); // 80% principal, 20% interest
      monthlyNetRent -= payment;
    }

    // Property appreciation
    const appreciationRate = ((country?.gdpGrowthRate || 2.0) / 100 / 12) + ((Math.random() - 0.45) * 0.004);
    prop.currentValue = Math.round(prop.currentValue * (1 + appreciationRate));
  });
  state.finances.cash += monthlyNetRent;

  // 6. BUSINESS EMPIRE SIMULATION (Improvement #3: Corporate Debt & #6: Heir Synergy & #7: Antitrust)
  state.companies.forEach(comp => {
    // Listed companies are processed by the Corporate Simulation Engine above.
    if (comp.isPublic && state.corporateSystem?.publicCompanyIds?.includes(comp.id)) return;
    // Complexity overhead, heir synergy and antitrust regulation
    const complexity = calculateCompanyComplexityOverhead(comp, state);

    // Entrepreneurship is a management contribution, never the sole company performance driver.
    if ((comp.playerOwnershipPercentage || 0) >= 50) {
      const hours = state.lifeSystem?.timeAllocation?.entrepreneurshipHours || 0;
      const managementContribution = (1 - Math.exp(-hours / 110)) * 0.05 * ((state.lifeSystem?.personality?.leadership || 50) / 100);
      comp.employeeProductivity = Math.min(100, comp.employeeProductivity + managementContribution * 4);
      comp.brandReputation = Math.min(100, comp.brandReputation + managementContribution);
    }

    // Dynamic demand model with diminishing returns on marketing and quality
    const econFactor = country?.businessCycle === 'Boom' ? 1.25 : (country?.businessCycle === 'Recession' ? 0.75 : 1.0);
    const marketingEffect = Math.log10(Math.max(10, comp.marketingBudgetMonthly)) * 0.15;
    const qualityEffect = (comp.productQuality / 100) * 0.30;
    const brandEffect = (comp.brandReputation / 100) * 0.25;
    const priceAttractiveness = comp.pricingStrategy === 'Discount' ? 1.2 : (comp.pricingStrategy === 'Premium Luxury' ? 0.75 : 1.0);

    const baseDemandUnits = Math.round((comp.capacityMonthlyUnits * 0.8) * econFactor * (1 + marketingEffect + qualityEffect + brandEffect) * priceAttractiveness);
    const unitsSold = Math.min(comp.inventoryUnits + comp.capacityMonthlyUnits, baseDemandUnits);

    const grossRevenue = unitsSold * comp.unitPrice;
    const productionCost = unitsSold * (comp.unitCost * comp.supplierCostFactor * (1 / complexity.productivityFactor));
    
    // Headcount complexity drag and administrative overhead
    const basePayroll = (comp.employeesCount * comp.averageEmployeeSalary) + comp.executives.reduce((s, e) => s + e.salaryMonthly, 0);
    const payroll = Math.round(basePayroll * complexity.overheadMultiplier);

    // Improvement #3: Corporate Balance-Sheet Debt Interest Servicing
    const corporateDebt = comp.debt || 0;
    const debtInterestAnnual = comp.debtInterestRate || ((country?.centralBankInterestRate || 4.5) + 2.0);
    const monthlyDebtInterest = corporateDebt > 0 ? Math.round((corporateDebt * (debtInterestAnnual / 100)) / 12) : 0;

    const opEx = payroll + comp.marketingBudgetMonthly + comp.rdBudgetMonthly + complexity.antitrustComplianceCost + monthlyDebtInterest;

    const ebitda = grossRevenue - productionCost - opEx;
    const tax = ebitda > 0 ? (ebitda * (country?.corporateTaxRate || 21) / 100) : 0;
    const netProfit = Math.round(ebitda - tax);

    comp.monthlyRevenue = Math.round(grossRevenue);
    comp.monthlyExpenses = Math.round(productionCost + opEx + tax);
    comp.monthlyNetProfit = netProfit;
    comp.cashReserve += netProfit;

    // Financial Distress Handling & Negative Cash Drag
    if (comp.cashReserve < 0) {
      comp.employeeMorale = Math.max(10, comp.employeeMorale - 3.0);
      if (Math.abs(comp.cashReserve) > (comp.monthlyRevenue * 3) && Math.random() < 0.25) {
        news.push({
          id: `news_distress_${comp.id}_${state.simulationTick}`,
          month: state.currentMonth,
          year: state.currentYear,
          headline: `Liquidity Squeeze Warning at ${comp.name}`,
          body: `Credit rating analysts note negative cash reserves (-$${Math.abs(comp.cashReserve).toLocaleString()}) and urge recapitalization.`,
          category: 'Business',
          importance: 'NORMAL',
          severity: 'Warning',
          impactExplanation: `${comp.name} is operating in treasury deficit. Consider a founder cash injection or equity round.`
        });
      }
    } else {
      // Wage competitiveness and employee morale calibration
      if (comp.averageEmployeeSalary < 3200) {
        comp.employeeMorale = Math.max(15, comp.employeeMorale - 1.5);
      } else if (comp.averageEmployeeSalary >= 4800) {
        comp.employeeMorale = Math.min(100, comp.employeeMorale + 1.0);
      }
    }

    // Market share growth ceiling (Anti-Exploit: capped at 85% due to antitrust laws)
    if (grossRevenue > 0) {
      const shareDelta = (marketingEffect + qualityEffect - 0.2) * 0.1;
      comp.marketShare = Math.min(85, Math.max(0.5, comp.marketShare + shareDelta));
    }

    comp.historicalRevenue.push(comp.monthlyRevenue);
    comp.historicalProfit.push(comp.monthlyNetProfit);
    if (comp.historicalRevenue.length > 24) comp.historicalRevenue.shift();
    if (comp.historicalProfit.length > 24) comp.historicalProfit.shift();

    // Valuation formula: EBITDA multiple with cash buffer / corporate debt drag (Improvement #3)
    const industryMultiple = 10;
    const annualizedProfit = Math.max(50000, netProfit * 12);
    comp.valuation = Math.round(Math.max(100000, annualizedProfit * industryMultiple + Math.max(0, comp.cashReserve) - corporateDebt));
    comp.sharePrice = Math.round((comp.valuation / comp.totalShares) * 100) / 100;

    // Dividend distribution
    if (comp.dividendPayoutRatio > 0 && netProfit > 0 && comp.cashReserve > (netProfit * 2)) {
      const totalDividend = netProfit * comp.dividendPayoutRatio;
      const playerShare = Math.round(totalDividend * (comp.playerOwnershipPercentage / 100));
      comp.cashReserve -= Math.round(totalDividend);
      state.finances.cash += playerShare;
    }
  });

  // 7. SPORTS TEAMS SIMULATION
  state.sports.ownedTeams.forEach(team => {
    // Match simulation
    const matchRoll = Math.random() * 100;
    const performanceBoost = team.teamPerformanceScore * 0.6;
    const totalScore = matchRoll * 0.4 + performanceBoost;

    let resultDesc = '';
    if (totalScore > 65) {
      team.matchesWon += 1;
      team.leaguePosition = Math.max(1, team.leaguePosition - 1);
      team.teamPerformanceScore = Math.min(100, team.teamPerformanceScore + 1.5);
      resultDesc = `Victory (3-1)! Fan morale surges.`;
    } else if (totalScore > 40) {
      team.matchesDrawn += 1;
      resultDesc = `Draw (1-1). Solid tactical display.`;
    } else {
      team.matchesLost += 1;
      team.leaguePosition = Math.min(team.totalTeamsInLeague, team.leaguePosition + 1);
      team.teamPerformanceScore = Math.max(20, team.teamPerformanceScore - 2);
      resultDesc = `Defeat (0-2). Fans urge coaching adjustments.`;
    }
    team.recentMatchResult = resultDesc;

    // Financials
    const ticketRevenue = team.stadiumCapacity * (team.teamPerformanceScore / 100) * team.ticketPrice * 2; // 2 home games
    const teamRevenue = ticketRevenue + team.monthlySponsorship;
    const teamExpenses = team.monthlyPlayerWages + (team.stadiumCapacity * 4);
    team.monthlyNetIncome = Math.round(teamRevenue - teamExpenses);
    team.valuation = Math.round(team.valuation * (1 + (team.teamPerformanceScore - 50) * 0.001));

    if (team.playerOwnershipPercentage > 0) {
      state.finances.cash += Math.round(team.monthlyNetIncome * (team.playerOwnershipPercentage / 100));
    }
  });

  // 8. MAJOR PROJECTS PROGRESSION
  state.projects.forEach(proj => {
    if (!proj.completed && proj.status === 'Active Construction') {
      proj.monthsProgress += 1;
      if (proj.monthsProgress >= proj.durationMonths) {
        proj.completed = true;
        proj.status = 'Completed';
        state.character.attributes.reputation = Math.min(100, state.character.attributes.reputation + proj.expectedReputationBoost);
        state.character.attributes.worldInfluence = Math.min(100, state.character.attributes.worldInfluence + proj.expectedInfluenceBoost);
        events.push({
          id: `ev_proj_${state.simulationTick}`,
          timestampMonth: state.currentMonth,
          timestampYear: state.currentYear,
          age: state.character.age,
          category: 'Business',
          title: `Project Inauguration: ${proj.name}! 🏗️`,
          description: `The monumental project '${proj.name}' has been successfully completed and inaugurated to global fanfare.`,
          consequences: {
            reputationChange: proj.expectedReputationBoost,
            worldInfluenceChange: proj.expectedInfluenceBoost,
            happinessChange: +12,
            details: [`Monthly recurring return activated: +$${proj.expectedMonthlyIncomeBoost.toLocaleString()}/mo`]
          }
        });
      }
    }
  });

  // 8.5 POLITICAL OFFICE IN-OFFICE DYNAMICS (Phase 15 & Phase 22 Balancing)
  if (state.politics.currentOffice.inOffice) {
    // 1. Monthly salary from public office
    if (state.politics.currentOffice.salaryMonthly > 0) {
      state.finances.cash += state.politics.currentOffice.salaryMonthly;
    }

    // 2. Decrement remaining constitutional term & Enforce Strict Expiry (Improvement #5)
    if (state.politics.currentOffice.termMonthsRemaining !== undefined && state.politics.currentOffice.termMonthsRemaining > 0) {
      state.politics.currentOffice.termMonthsRemaining = Math.max(0, state.politics.currentOffice.termMonthsRemaining - 1);
    }

    // Strict Term Limit Expiration Hand-off
    if (state.politics.currentOffice.termMonthsRemaining !== undefined && state.politics.currentOffice.termMonthsRemaining <= 0) {
      const expiredTitle = state.politics.currentOffice.title;
      state.politics.currentOffice.inOffice = false;
      
      if (!state.politics.pastOffices.includes(expiredTitle)) {
        state.politics.pastOffices.push(expiredTitle);
      }

      state.politics.currentOffice.title = 'Senior Statesman / Elder Diplomat';
      state.politics.currentOffice.salaryMonthly = 0;
      state.politics.currentOffice.termMonthsRemaining = 0;
      state.politics.currentOffice.politicalCapital = Math.max(25, Math.round(state.politics.currentOffice.politicalCapital * 0.75));

      events.push({
        id: `ev_term_expired_${state.simulationTick}`,
        timestampMonth: state.currentMonth,
        timestampYear: state.currentYear,
        age: state.character.age,
        category: 'Politics',
        type: 'MILESTONE',
        title: `Constitutional Term Concluded: ${expiredTitle}`,
        description: `Your statutory constitutional mandate as ${expiredTitle} has concluded. You transition with honor into the respected role of Senior Statesman and Elder Diplomat.`,
        consequences: {
          reputationChange: +10,
          worldInfluenceChange: +8,
          happinessChange: +5,
          details: [
            `Completed constitutional term as ${expiredTitle}`,
            'Public office workload eliminated',
            'Permanent Senior Statesman credentials established'
          ]
        }
      });

      news.push({
        id: `news_term_end_${state.simulationTick}`,
        month: state.currentMonth,
        year: state.currentYear,
        headline: `Political Transition: ${state.character.firstName} ${state.character.lastName} Concludes Term as ${expiredTitle}`,
        body: `Following the completion of their statutory mandate, ${state.character.firstName} ${state.character.lastName} officially steps down from active executive office into an advisory elder statesman stature.`,
        category: 'Politics',
        importance: 'MAJOR',
        severity: 'Info',
        impactExplanation: `Constitutional mandate as ${expiredTitle} concluded peacefully.`
      });
    }

    // 3. Macroeconomic impact on approval
    if (country?.businessCycle === 'Boom') {
      state.politics.currentOffice.approvalRating = Math.min(95, state.politics.currentOffice.approvalRating + 0.4);
    } else if (country?.businessCycle === 'Recession' || (country?.inflationRate || 0) > 4.5) {
      state.politics.currentOffice.approvalRating = Math.max(15, state.politics.currentOffice.approvalRating - 0.7);
    }

    // 4. Policy alignment impact
    if (state.politics.nationalPolicies?.healthcareSpending === 'Universal') {
      state.politics.currentOffice.approvalRating = Math.min(95, state.politics.currentOffice.approvalRating + 0.3);
      state.character.attributes.health = Math.min(100, state.character.attributes.health + 0.2);
    }

    // 5. Natural Approval Drift & Scrutiny
    if (state.politics.currentOffice.approvalRating > 65) {
      state.politics.currentOffice.approvalRating = Math.max(50, state.politics.currentOffice.approvalRating - 0.3);
    } else if (state.politics.currentOffice.approvalRating < 45 && country?.businessCycle !== 'Recession') {
      state.politics.currentOffice.approvalRating = Math.min(50, state.politics.currentOffice.approvalRating + 0.3);
    }

    // Conflict of Interest Scrutiny (Owning commercial enterprise while holding high public office)
    if (state.companies.some(c => c.monthlyRevenue > 250000)) {
      state.character.attributes.reputation = Math.max(10, state.character.attributes.reputation - 0.4);
    }
  }

  // 9. SYSTEMIC LIVING COSTS, WEALTH OVERHEAD & FULL DEBT SERVICING (Phase 22)
  const currentNetWorth = calculateNetWorth(state);
  const tradeoffs = calculateMonthlyTradeoffsAndOverhead(state, currentNetWorth);

  // Deduct systemic living, security and wealth overhead
  state.finances.cash -= tradeoffs.totalLivingExpenses;

  // Monthly Loan Servicing (Amortization & Interest)
  let monthlyDebtServicePaid = 0;
  const remainingActiveLoans = [];

  for (const loan of state.finances.loans) {
    const payment = Math.min(loan.remainingBalance, loan.monthlyPayment);
    monthlyDebtServicePaid += payment;
    const principalPortion = Math.round(payment * 0.85); // 85% Principal reduction
    loan.remainingBalance = Math.max(0, loan.remainingBalance - principalPortion);
    loan.termMonthsRemaining = Math.max(0, loan.termMonthsRemaining - 1);

    if (loan.remainingBalance > 10 && loan.termMonthsRemaining > 0) {
      remainingActiveLoans.push(loan);
    }
  }
  state.finances.loans = remainingActiveLoans;
  state.finances.cash -= monthlyDebtServicePaid;

  // Insolvency & Overdraft Delinquency Penalties (Anti-Exploit)
  if (state.finances.cash < 0) {
    const deficitMagnitude = Math.abs(state.finances.cash);
    const lateFee = Math.min(5000, Math.max(250, Math.round(deficitMagnitude * 0.02)));
    state.finances.cash -= lateFee;

    // Credit score penalty for delinquency
    state.character.creditScore = Math.max(320, (state.character.creditScore || 700) - 15);
    state.character.attributes.stress = Math.min(100, state.character.attributes.stress + 8);
    state.character.attributes.happiness = Math.max(0, state.character.attributes.happiness - 6);
  }

  // 10. WORKLOAD & ATTRIBUTE EVOLUTION (Phase 22 Balance Engine)
  state.character.attributes.stress = Math.max(0, Math.min(100, state.character.attributes.stress + tradeoffs.stressDelta));
  state.character.attributes.health = Math.max(0, Math.min(100, state.character.attributes.health + tradeoffs.healthDelta));

  // Natural Relationship Maintenance & Neglect Decay
  for (const rel of state.relationships) {
    if (tradeoffs.relationshipDecayDelta < 0) {
      rel.love = Math.max(10, rel.love + tradeoffs.relationshipDecayDelta);
      rel.trust = Math.max(10, rel.trust + tradeoffs.relationshipDecayDelta);
    } else if (tradeoffs.relationshipDecayDelta > 0) {
      rel.love = Math.min(100, rel.love + tradeoffs.relationshipDecayDelta);
      rel.trust = Math.min(100, rel.trust + tradeoffs.relationshipDecayDelta);
    }

    // Inactivity Decay (If player hasn't interacted in > 6 months)
    if (state.simulationTick - (rel.lastInteractedTick || 0) > 6) {
      rel.love = Math.max(20, rel.love - 1);
      rel.trust = Math.max(20, rel.trust - 1);
    }
  }

  // World Influence calculation (Bounded [0, 100])
  let calculatedInfluence = 5;
  if (currentNetWorth > 1000000000) calculatedInfluence += 65;
  else if (currentNetWorth > 100000000) calculatedInfluence += 45;
  else if (currentNetWorth > 10000000) calculatedInfluence += 25;
  else if (currentNetWorth > 1000000) calculatedInfluence += 12;

  if (state.politics.currentOffice.title === 'President / Prime Minister') calculatedInfluence += 40;
  else if (state.politics.currentOffice.title === 'Cabinet Minister') calculatedInfluence += 25;
  else if (state.politics.currentOffice.title === 'Mayor') calculatedInfluence += 15;
  if (state.companies.length > 0) calculatedInfluence += Math.min(20, state.companies.length * 4);
  state.character.attributes.worldInfluence = Math.min(100, calculatedInfluence);

  // Soft Caps & Bounded Attributes (Improvement #4: Permanent Philanthropy Floor)
  const lifetimePhil = state.lifetimePhilanthropy || 0;
  let philanthropyReputationFloor = 0;
  if (lifetimePhil >= 50000000) philanthropyReputationFloor = 75;
  else if (lifetimePhil >= 10000000) philanthropyReputationFloor = 60;
  else if (lifetimePhil >= 1000000) philanthropyReputationFloor = 45;
  else if (lifetimePhil >= 100000) philanthropyReputationFloor = 25;
  else if (lifetimePhil > 0) philanthropyReputationFloor = Math.min(20, Math.round(lifetimePhil / 10000));

  state.character.attributes.reputation = Math.max(philanthropyReputationFloor, Math.min(100, state.character.attributes.reputation));
  state.character.socialSentiment = Math.max(philanthropyReputationFloor, Math.min(100, state.character.socialSentiment || 50));
  state.character.attributes.happiness = Math.max(0, Math.min(100, state.character.attributes.happiness));
  state.character.attributes.intelligence = Math.max(0, Math.min(100, state.character.attributes.intelligence));
  state.character.attributes.charm = Math.max(0, Math.min(100, state.character.attributes.charm));
  state.character.attributes.attractiveness = Math.max(0, Math.min(100, state.character.attributes.attractiveness));

  // Check achievements
  state.achievements.forEach(ach => {
    if (!ach.unlocked) {
      if (ach.id === 'ach_millionaire' && currentNetWorth >= 1000000) {
        ach.unlocked = true;
        ach.unlockedAtAge = state.character.age;
      }
      if (ach.id === 'ach_founder' && state.companies.length >= 1) {
        ach.unlocked = true;
        ach.unlockedAtAge = state.character.age;
      }
      if (ach.id === 'ach_unicorn' && state.companies.some(c => c.valuation >= 1000000000)) {
        ach.unlocked = true;
        ach.unlockedAtAge = state.character.age;
      }
      if (ach.id === 'ach_president' && state.politics.currentOffice.title === 'President / Prime Minister') {
        ach.unlocked = true;
        ach.unlockedAtAge = state.character.age;
      }
      if (ach.id === 'ach_degree' && state.education.some(e => e.completed && e.qualification !== 'Secondary')) {
        ach.unlocked = true;
        ach.unlockedAtAge = state.character.age;
      }
      if (ach.id === 'ach_influence_elite' && state.character.attributes.worldInfluence >= 90) {
        ach.unlocked = true;
        ach.unlockedAtAge = state.character.age;
      }
    }
  });

  // Record history
  state.analyticsHistory.push({
    month: state.currentMonth,
    year: state.currentYear,
    age: state.character.age,
    netWorth: currentNetWorth,
    cash: state.finances.cash,
    monthlyIncome: monthlySalaryEarned + monthlyNetRent,
    monthlyExpenses: tradeoffs.totalMonthlyExpenses,
    health: state.character.attributes.health,
    stress: state.character.attributes.stress,
    reputation: state.character.attributes.reputation,
    worldInfluence: state.character.attributes.worldInfluence
  });
  if (state.analyticsHistory.length > 60) state.analyticsHistory.shift();

  // 9.5 RECALCULATE PLAYER POWER PROFILE & DETECT TIER TRANSITIONS (Phase 10)
  const prevTier = state.playerPowerProfile ? state.playerPowerProfile.powerTier : 'UNKNOWN';
  state.playerPowerProfile = calculatePlayerPowerProfile(state);
  const currentTier = state.playerPowerProfile.powerTier;

  if (prevTier !== currentTier) {
    const isPromoted = getPowerTierRank(currentTier) > getPowerTierRank(prevTier);
    const tierDef = POWER_TIER_DEFINITIONS[currentTier];

    events.push({
      id: `ev_power_shift_${state.simulationTick}`,
      timestampMonth: state.currentMonth,
      timestampYear: state.currentYear,
      age: state.character.age,
      category: 'Life',
      type: isPromoted ? 'OPPORTUNITY' : 'WARNING',
      title: isPromoted ? `Power Tier Elevation: Ascended to ${tierDef.label}! ⚡` : `Power Tier Shift: Adjusted to ${tierDef.label}`,
      description: `Your combined net worth ($${currentNetWorth.toLocaleString()}), business ownership, and strategic footprint have established you as a ${tierDef.label} (${currentTier} Tier). Power Score: ${state.playerPowerProfile.powerScore} pts.`,
      severity: isPromoted ? 'High' : 'Medium',
      consequences: {
        happinessChange: isPromoted ? +8 : -4,
        worldInfluenceChange: isPromoted ? +5 : -2,
        details: [
          `New Power Tier: ${currentTier} (Rank ${tierDef.rank}/6)`,
          `Perks: ${tierDef.basePerks.slice(0, 2).join('; ')}`,
          `Burdens: ${tierDef.baseBurdens.slice(0, 2).join('; ')}`
        ]
      }
    });

    const tierImportance = calculateNewsImportance(
      isPromoted ? 'MAJOR' : 'NORMAL',
      state.playerPowerProfile.visibility,
      currentTier,
      true,
      currentTier === 'GLOBAL'
    );

    news.push({
      id: `news_power_tier_${state.simulationTick}`,
      month: state.currentMonth,
      year: state.currentYear,
      headline: `${state.character.firstName} ${state.character.lastName} Ascends to ${tierDef.label} (${currentTier} Power Tier)`,
      body: `Financial commentators and national analysts highlight expanding systemic influence, enterprise control, and capital reach.`,
      category: 'Business',
      importance: tierImportance,
      severity: isPromoted ? 'Positive' : 'Warning',
      impactExplanation: `Power tier transitioned to ${tierDef.label} (${state.playerPowerProfile.powerScore} pts).`,
      source: 'National Business Review',
      tags: ['PowerTier', currentTier, 'Status']
    });
  }

  // 9.6 EVALUATE LIFE PROGRESSION PROFILE & DETECT TIER TRANSITIONS (Expansion 1A)
  const prevLifeScore = prevState.lifeProgression ? prevState.lifeProgression.overallProgressionScore : 0;
  const { updatedProfile: lifeProfile, changeResult: lifeChangeResult } = evaluateLifeProgression(prevState, state, state.playerPowerProfile);
  state.lifeProgression = lifeProfile;

  if (lifeChangeResult.changed) {
    if (lifeChangeResult.event) {
      events.push(lifeChangeResult.event);
    }
    if (lifeChangeResult.news) {
      news.push(lifeChangeResult.news);
    }
  }

  // 9.7 EVALUATE DEEP LIFE SIMULATION & TIER-SPECIFIC GAMEPLAY (Expansion 1B)
  const { updatedGameplayProfile: gameplayProfile, gameplayDiff } = evaluateLifeGameplay(prevState, state);
  state.lifeGameplay = gameplayProfile;

  // 10. CALCULATE SIMULATION DIFF & EVALUATE CAUSAL EVENTS (Phase 7 & Phase 10)
  const diff = calculateSimulationDiff(prevState, state);

  // 10.05 ADVANCE LIVING WORLD & AUTONOMOUS SIMULATION (Expansion 1D)
  const advancedWorldResult = advanceAdvancedWorld(prevState, state, diff);
  state = advancedWorldResult.state;
  events.push(...advancedWorldResult.events);
  news.push(...advancedWorldResult.news);

  // Development integrity warnings are surfaced as simulation events instead of
  // silently allowing invalid canonical world state to propagate.
  for (const issue of advancedWorldResult.issues.filter(issue => issue.severity === 'error')) {
    events.push({
      id: `world_integrity_${state.simulationTick}_${events.length}`,
      timestampMonth: state.currentMonth,
      timestampYear: state.currentYear,
      age: state.character.age,
      category: 'World',
      type: 'WARNING',
      title: 'World simulation integrity alert',
      description: `[${issue.system}] ${issue.message}`,
      severity: 'High',
      consequences: { details: ['The simulation detected an invalid world-state invariant.'] }
    });
  }

  // 10.08 ADVANCE EXPANSION 2 MULTI-SYSTEM SIMULATION ENGINES
  simulateMonthlyCareerStep(state);
  simulateMonthlyBankingStep(state);
  simulateMonthlyLivingBanking(state);
  simulateMonthlyCreditStep(state);
  simulateMonthlyInvestmentStep(state);
  simulateMonthlyPropertyStep(state);
  ensureRealEstatePlatform(state);
  ensureRealEstateIndustry(state);
  const corporateManagementNews: string[] = [];
  simulateMonthlyRealEstateIndustry(state, corporateManagementNews);
  ensureWorldGovernor(state);
  simulateMonthlyCorporateManagement(state);
  simulateMonthlyRealEstatePlatform(state, corporateManagementNews);
  simulateMonthlyCorporateManagementV2(state, corporateManagementNews);
  simulateCorporateWorkforceMonthly(state, corporateManagementNews);
  processCorporateBoardroomMonthly(state, corporateManagementNews);
  simulateMonthlyLivingWealth(state);
  for (const headline of corporateManagementNews) {
    state.newsArchive.unshift({ id: `corp_mgmt_${state.simulationTick}_${Math.random().toString(36).slice(2,8)}`, month: state.currentMonth, year: state.currentYear, headline, body: headline, category: 'Business', importance: 'NORMAL', severity: 'Warning', impactExplanation: 'Corporate management and living wealth simulation event.' });
  }
  simulateMonthlyLegalStep(state);
  simulatePersonalManagementMonthly(state, corporateManagementNews);
  simulateMonthlyTaxStep(state);
  simulateMonthlyJusticeStep(state);
  simulateMonthlyGovernmentOfficeStep(state);
  simulateMonthlyPoliticalGovernance(state);
  simulateMonthlyGovernmentLiving(state);
  simulateGovernmentMachinery(state, corporateManagementNews);

  // 10.09 ADVANCE PLAYABLE PATHS: career, politics, business, tycoon and sports.
  // These decisions use canonical state and feed the same monthly event/decision pipeline.
  const playablePathResult = advancePlayablePaths(state);
  const deepGameplayResult = advanceDeepGameplay(state);
  events.push(...playablePathResult.events);
  events.push(...deepGameplayResult.events);
  for (const decision of playablePathResult.decisions) {
    if (!state.pendingDecisions.some(d => d.id === decision.id)) state.pendingDecisions.push(decision);
  }
  for (const decision of deepGameplayResult.decisions) {
    if (!state.pendingDecisions.some(d => d.id === decision.id)) state.pendingDecisions.push(decision);
  }

  const { generatedEvents: causalEvents, unlockedDecisions: causalDecisions } = evaluateCausalEvents(prevState, state, diff);

  // Apply causal event impacts & record them with triggerReason
  for (const causalEv of causalEvents) {
    if (causalEv.consequences) {
      const typedCsqs = normalizeEventConsequencesToTyped(causalEv);
      if (typedCsqs.length > 0) {
        const { nextState: updatedState } = ConsequenceEngine.applyBatch(state, typedCsqs, true);
        state = updatedState;
      }
    }
    events.push(causalEv);
  }

  // 10.2 EVALUATE POLITICAL TRIGGERS & UNLOCK POLITICAL EVENT CHAINS (Phase 15)
  const { generatedEvents: polEvents, unlockedChains: polChains } = evaluatePoliticalTriggers(prevState, state, diff);
  for (const polEv of polEvents) {
    if (polEv.consequences) {
      const typedCsqs = normalizeEventConsequencesToTyped(polEv);
      if (typedCsqs.length > 0) {
        const { nextState: updatedState } = ConsequenceEngine.applyBatch(state, typedCsqs, true);
        state = updatedState;
      }
    }
    events.push(polEv);
  }

  // Start any newly unlocked political chains
  for (const chain of polChains) {
    const { nextState } = startEventChain(state, chain);
    state = nextState;
  }

  // 10.3 ADVANCE FAMILY SIMULATION & EVALUATE CAUSAL FAMILY TRIGGERS (Phase 16)
  const { nextState: familyUpdatedState, familyEvents, familyNews } = advanceFamilySimulation(prevState, state, diff);
  state = familyUpdatedState;
  for (const famEv of familyEvents) {
    if (famEv.consequences) {
      const typedCsqs = normalizeEventConsequencesToTyped(famEv);
      if (typedCsqs.length > 0) {
        const { nextState: updatedState } = ConsequenceEngine.applyBatch(state, typedCsqs, true);
        state = updatedState;
      }
    }
    events.push(famEv);
  }
  news.push(...familyNews);

  // 10.4 EVALUATE COMPANY SYSTEMIC TRIGGERS & BUSINESS CHAINS (Phase 17)
  const { generatedEvents: compEvents, unlockedDecisions: compDecisions, unlockedChains: compChains } = evaluateCompanyEventTriggers(prevState, state, diff);
  for (const compEv of compEvents) {
    if (compEv.consequences) {
      const typedCsqs = normalizeEventConsequencesToTyped(compEv);
      if (typedCsqs.length > 0) {
        const { nextState: updatedState } = ConsequenceEngine.applyBatch(state, typedCsqs, true);
        state = updatedState;
      }
    }
    events.push(compEv);
  }

  // Start any newly unlocked company chains (e.g., expansion, crisis, leadership)
  for (const chain of compChains) {
    const { nextState } = startEventChain(state, chain);
    state = nextState;
  }

  // Pass company decisions through filterAndControlDecisions
  if (compDecisions.length > 0) {
    const { admittedDecisions: admittedCompDecs, nextState: controlledState } = filterAndControlDecisions(state, compDecisions);
    state = controlledState;
    for (const cDec of admittedCompDecs) {
      if (!state.pendingDecisions.some(d => d.id === cDec.id)) {
        state.pendingDecisions.push(cDec);
      }
    }
  }

  // 10.5 EVALUATE CONDITIONAL CONSEQUENCES & SYSTEMIC TRIGGERS (Phase 5)
  const systemicRules = getSystemicConditionalRules(state);
  const conditionalCandidateDecisions: PendingDecision[] = [];
  for (const rule of systemicRules) {
    const { nextState: updatedState, conditionMet, results: ruleResults, unlockedDecisions, unlockedEvents } = evaluateConditionalConsequence(
      state,
      rule,
      true
    );
    state = updatedState;

    if (conditionMet && ruleResults.length > 0) {
      const summaryDetails = ruleResults.map(r => `${r.target} ${r.field}: ${r.change}`);
      events.push({
        id: `ev_cond_${rule.id}_${state.simulationTick}`,
        timestampMonth: state.currentMonth,
        timestampYear: state.currentYear,
        age: state.character.age,
        category: 'Business',
        title: `${rule.name || 'Systemic Shift'} Active`,
        description: rule.description || 'Underlying economic and strategic thresholds have triggered systemic consequences.',
        consequences: {
          details: summaryDetails
        }
      });
    }

    if (unlockedDecisions && unlockedDecisions.length > 0) {
      for (const uDec of unlockedDecisions) {
        conditionalCandidateDecisions.push({
          ...uDec,
          eventTypeKey: uDec.eventTypeKey || rule.eventKey || rule.id,
          entityId: uDec.entityId || rule.entityId || 'global',
          priority: uDec.priority ?? rule.priority ?? 70
        });
      }
    }
    if (unlockedEvents && unlockedEvents.length > 0) {
      events.push(...unlockedEvents);
    }
  }

  if (conditionalCandidateDecisions.length > 0) {
    const { admittedDecisions: admittedCondDecs, nextState: controlledState } = filterAndControlDecisions(state, conditionalCandidateDecisions);
    state = controlledState;
    for (const cDec of admittedCondDecs) {
      if (!state.pendingDecisions.some(d => d.id === cDec.id)) {
        state.pendingDecisions.push(cDec);
      }
    }
  }

  // 11. PROCESS CAUSAL DECISIONS (Phase 21: Pure State Eligibility via Causal Engines)
  if (causalDecisions.length > 0) {
    const { admittedDecisions: admittedCausal, nextState: controlledState } = filterAndControlDecisions(state, causalDecisions);
    state = controlledState;
    for (const cDec of admittedCausal) {
      if (!state.pendingDecisions.some(d => d.id === cDec.id)) {
        state.pendingDecisions.push(cDec);
      }
    }
  }

  // 12. FILTER AND CONTROL EVENTS (Phase 9 Spam Prevention & Category Limits)
  const { filteredEvents, nextState: finalState } = filterAndControlEvents(state, events);
  state = finalState;

  // 13. GENERATE FACT-GROUNDED CONSEQUENCE NEWS (Phase 11)
  const consequenceNews = generateConsequenceNews(prevState, state, diff, filteredEvents);
  for (const cn of consequenceNews) {
    if (!news.some(n => n.headline === cn.headline || n.id === cn.id)) {
      news.push(cn);
    }
  }

  // 14. DYNASTY MILESTONE SCANNING & METRICS UPDATE (Phase 18)
  state = scanAndRecordDynastyMilestones(state, calculateNetWorth(prevState));
  state = ensureDynastyProfile(state);

  // 15. DYNAMIC OBJECTIVE & CAMPAIGN SCANNING (Phase 19)
  const { nextState: stateWithObjectives } = checkAndNotifyObjectiveCompletions(prevState, state);
  state = stateWithObjectives;

  // Prepend controlled events to the top of feed
  state.eventsFeed = [...filteredEvents, ...state.eventsFeed].slice(0, 150);
  state.newsArchive = [...news, ...state.newsArchive].slice(0, 100);

  // 15.5 WORLD GOVERNOR 2.0: cross-engine coordination, adaptive LOD, event importance, queue reconciliation and anomaly recovery.
  state = governWorldTick(state, { events: filteredEvents, news, decisions: state.pendingDecisions });

  // 16. GENERATE FINAL ACCURATE SIMULATION SNAPSHOT & DIFF
  const afterSnapshot = createSimulationSnapshot(state);
  const simulationDiff = calculateSimulationDiff(prevState, state, filteredEvents, news);
  simulationDiff.snapshotBefore = beforeSnapshot;
  simulationDiff.snapshotAfter = afterSnapshot;

  if (lifeChangeResult.changed) {
    simulationDiff.lifeProgressionTransition = {
      previousTier: lifeChangeResult.previousTier,
      currentTier: lifeChangeResult.currentTier,
      isPromotion: lifeChangeResult.changeType === 'PROMOTION' || lifeChangeResult.changeType === 'RESTORATION',
      isRegression: lifeChangeResult.changeType === 'REGRESSION',
      changeReasons: lifeChangeResult.reasons,
      scoreChange: lifeProfile.overallProgressionScore - prevLifeScore,
      newTierDisplayName: LIFE_TIER_DEFINITIONS[lifeChangeResult.currentTier].displayName
    };
  }

  // Attach Expansion 1B Life Gameplay Diff
  simulationDiff.lifeGameplayDiff = gameplayDiff;

  // Persist snapshot to rolling 24-month history
  state.simulationSnapshots = [...(state.simulationSnapshots || []), afterSnapshot].slice(-24);

  return {
    nextState: state,
    beforeSnapshot,
    afterSnapshot,
    simulationDiff,
    monthlyEvents: filteredEvents,
    monthlyNews: news,
    decisions: state.pendingDecisions,
    consequences: (state.consequenceHistory || []).slice(-10)
  };
}

export { ensureRealEstateIndustry, seedRealEstateIndustry, simulateMonthlyRealEstateIndustry, createMortgage, createCommercialLease, createPermit, scheduleInspection, createConstructionContract, createJV, createSPV, createDevelopmentFinance, createPreSale, createREIT, startAuction, createPropertyTax, createInsurancePolicy, registerDistressedAsset, sellLandParcel } from './realEstateIndustryEngine';
export { auditLivingWorld, runGovernedSimulation, runGovernedSimulationAsync, runAutonomousBackgroundCycle, WORLD_GOVERNOR_MAX_TARGET } from './worldGovernorEngine';
export { ensureWorldGovernor } from './worldGovernorState';
export { governWorldTick, ensureGovernor2, createGovernorCheckpoint, recoverFromGovernorCheckpoint } from './worldGovernorCoordinator';
export { getMarketplaceStores, ensureWorldMarketplace, refreshWorldMarketplace, purchaseWorldMarketplaceItem, sellWorldMarketplaceItem, useWorldPossession } from './worldMarketplaceEngine';
export { ensurePersonalManagement, hirePersonalStaff, firePersonalStaff, setPrimaryResidence, assignStaffToProperty, performPrimaryResidenceAction, getRentalMaintenanceRequirement, simulatePersonalManagementMonthly } from './personalLifeManagementEngine';
export { ensureTaxSystem, assessPlayerTax, payTax, requestTaxReview, simulateMonthlyTaxStep } from './taxSystemEngine';
export { ensureJusticeWorld, seekLegalCounsel, visitHospital, commitMinorOffense, sendPrisonLetter, joinPrisonGang, simulateMonthlyJusticeStep } from './justiceWorldEngine';
export { performSocialAction } from './socialWorldEngine';
