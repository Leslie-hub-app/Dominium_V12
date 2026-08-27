export type LifeStage = 'Early Childhood' | 'Childhood' | 'Teenage' | 'Young Adult' | 'Adult' | 'Mature Adult' | 'Senior';

export type GameMode = 'Life Mode' | 'Business Mode' | 'Tycoon Mode' | 'Sports Mode' | 'Political Mode' | 'Dynasty Mode';

export type GameDifficulty = 'Relaxed' | 'Realistic' | 'Hard' | 'Extreme';

export type PowerTier = 
  | 'UNKNOWN' 
  | 'LOCAL' 
  | 'SUCCESSFUL' 
  | 'PROMINENT' 
  | 'ELITE' 
  | 'POWERFUL' 
  | 'GLOBAL';

// -------------------------------------------------------------
// EXPANSION 1A: LIFE PROGRESSION & TIER SYSTEM TYPES
// -------------------------------------------------------------

export type LifeTier =
  | 'FOUNDATION'
  | 'INDEPENDENCE'
  | 'PROFESSIONAL_BUILDER'
  | 'ENTREPRENEUR_OWNER'
  | 'TYCOON'
  | 'POWER_INFLUENCE'
  | 'NATIONAL_GLOBAL_POWER'
  | 'LEGACY_DYNASTY';

// -------------------------------------------------------------
// EXPANSION 1B: DEEP LIFE SIMULATION & TIER-SPECIFIC GAMEPLAY TYPES
// -------------------------------------------------------------

export type ResponsibilityCategory =
  | 'PERSONAL'
  | 'FINANCIAL'
  | 'PROFESSIONAL'
  | 'ORGANIZATIONAL'
  | 'FAMILY'
  | 'PUBLIC'
  | 'POLITICAL'
  | 'INSTITUTIONAL'
  | 'GLOBAL'
  | 'DYNASTIC';

export type ResponsibilitySeverity = 'Low' | 'Moderate' | 'High' | 'Critical';
export type ResponsibilityScale = 'Personal' | 'Household' | 'Enterprise' | 'Civic' | 'National' | 'Global' | 'Generational';
export type ResponsibilityStatus = 'Active' | 'Under Control' | 'Neglected' | 'Critical';

export interface Responsibility {
  id: string;
  category: ResponsibilityCategory;
  title: string;
  description: string;
  severity: ResponsibilitySeverity;
  scale: ResponsibilityScale;
  status: ResponsibilityStatus;
  startedMonth: number;
  startedYear: number;
  ownerEntityId?: string;
  maintenanceRequirements: string;
  neglectConsequencesDescription: string;
  resolutionCondition?: string;
  isFulfilled?: boolean;
}

export type PressureType =
  | 'FINANCIAL'
  | 'CAREER'
  | 'BUSINESS'
  | 'REPUTATION'
  | 'FAMILY'
  | 'POLITICAL'
  | 'INSTITUTIONAL'
  | 'GLOBAL'
  | 'SUCCESSION';

export type PressureSeverity = 'Low' | 'Moderate' | 'Severe' | 'Crisis';
export type PressureTrend = 'Decreasing' | 'Stable' | 'Escalating';

export interface PressureMitigationOption {
  id: string;
  label: string;
  actionKey: string;
  cost?: number;
  description: string;
  potentialRelief: number; // estimated intensity reduction (e.g. -20)
}

export interface LifePressure {
  id: string;
  type: PressureType;
  title: string;
  intensity: number; // 0 - 100
  severity: PressureSeverity;
  trend: PressureTrend;
  source: string;
  sourceEntityId?: string;
  durationMonths: number;
  escalationPotential: string;
  mitigationOptions: PressureMitigationOption[];
  explainReason: string;
}

export type OpportunityCategory =
  | 'CAREER'
  | 'BUSINESS'
  | 'INVESTMENT'
  | 'PROPERTY'
  | 'RELATIONSHIP'
  | 'FAMILY'
  | 'POLITICAL'
  | 'INSTITUTIONAL'
  | 'GLOBAL'
  | 'DYNASTY';

export type OpportunityLifecycleStatus =
  | 'AVAILABLE'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'COMPLETED'
  | 'FAILED';

export interface LifeOpportunity {
  id: string;
  category: OpportunityCategory;
  title: string;
  description: string;
  status: OpportunityLifecycleStatus;
  minLifeTier: LifeTier;
  maxLifeTier?: LifeTier;
  risk: 'Low' | 'Medium' | 'High' | 'Extreme';
  potentialReward: string;
  requiredResources: {
    cash?: number;
    timeHours?: number;
    intelligence?: number;
    reputation?: number;
    minNetWorth?: number;
    minInfluence?: number;
  };
  expiresInMonths: number;
  availableSinceMonth: number;
  availableSinceYear: number;
  decisionOption: DecisionOption;
  futureConsequencesSummary?: string;
  explainReason: string;
}

export interface LifeComplexityProfile {
  overallComplexity: number; // 0 - 100
  lifestyleComplexity: number; // 0 - 100
  organizationalComplexity: number; // 0 - 100
  publicVisibilityComplexity: number; // 0 - 100
  familyComplexity: number; // 0 - 100
  legacyComplexity: number; // 0 - 100
  complexityTier: 'Minimal' | 'Manageable' | 'Demanding' | 'Heavy' | 'Extreme';
  activeContributors: { label: string; impact: number; category: string }[];
  managementCapacityRatio: number; // > 1.0 means overburdened
}

export type StrategyArchetype =
  | 'CAUTIOUS'
  | 'AGGRESSIVE'
  | 'OPPORTUNISTIC'
  | 'LONG_TERM'
  | 'PROFESSIONAL'
  | 'ENTREPRENEURIAL'
  | 'INFLUENTIAL'
  | 'DYNASTIC';

export interface PlayerStrategyProfile {
  primaryTendency: StrategyArchetype;
  secondaryTendency: StrategyArchetype;
  tendencyScores: Record<StrategyArchetype, number>; // 0 - 100 each
  recentBehaviorSummary: string;
  strengths: string[];
  vulnerabilities: string[];
}

export interface ActiveCrisisRecord {
  id: string;
  type: PressureType | string;
  title: string;
  description: string;
  severity: 'Moderate' | 'Severe' | 'Critical';
  startedTick: number;
  monthsInCrisis: number;
  escalationLevel: number; // 1, 2, or 3
  mitigationChoices: DecisionOption[];
  consequencesPerMonthSummary: string[];
  recoveryResolution: string;
  resolved: boolean;
}

export interface LifeMilestoneNarrative {
  id: string;
  month: number;
  year: number;
  age: number;
  tier: LifeTier;
  category: string;
  title: string;
  description: string;
  impactSummary: string;
  icon: string;
}

export interface LifeGameplayProfile {
  currentResponsibilities: Responsibility[];
  activePressures: LifePressure[];
  activeOpportunities: LifeOpportunity[];
  complexity: LifeComplexityProfile;
  strategyProfile: PlayerStrategyProfile;
  activeCrises: ActiveCrisisRecord[];
  milestones: LifeMilestoneNarrative[];
  lastEvaluatedTick: number;
  strategicOutlook: {
    summary: string;
    priorities: string[];
    criticalWarnings: string[];
  };
}

export type LifeTierChangeType = 'INITIAL' | 'PROMOTION' | 'REGRESSION' | 'RESTORATION' | 'MIGRATION';

export interface ProgressionScoreBreakdown {
  independenceScore: number;       // 0 - 100
  professionalScore: number;       // 0 - 100
  ownershipScore: number;          // 0 - 100
  economicPowerScore: number;      // 0 - 100
  socialInfluenceScore: number;    // 0 - 100
  politicalPowerScore: number;     // 0 - 100
  institutionalPowerScore: number; // 0 - 100
  globalInfluenceScore: number;    // 0 - 100
  responsibilityScore: number;     // 0 - 100
  legacyScore: number;             // 0 - 100
}

export interface LifeTierHistoryEntry {
  id: string;
  tier: LifeTier;
  previousTier: LifeTier | null;
  simulationTick: number;
  month: number;
  year: number;
  age: number;
  changeType: LifeTierChangeType;
  reason: string;
  summary: string;
  scoresSnapshot?: ProgressionScoreBreakdown;
  overallScoreSnapshot?: number;
}

export interface LifeTierDefinition {
  id: LifeTier;
  rank: number; // 1 to 8
  displayName: string;
  subtitle: string;
  description: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  focusAreas: string[];
  supportedEventCategories: string[];
  supportedDecisionCategories: string[];
  unlockedDomains: string[];
  unlockedActions: string[];
  promotionRequirements: {
    minOverallScore: number;
    description: string;
    qualifyingPaths: string[];
  };
  maintenanceRequirements: {
    minOverallScore: number;
    description: string;
    gracePeriodMonths: number;
  };
}

export interface LifeProgressionProfile {
  currentTier: LifeTier;
  highestTierAchieved: LifeTier;
  currentTierSince: {
    month: number;
    year: number;
    simulationTick: number;
  };
  tierRank: number; // 1 to 8
  tierHistory: LifeTierHistoryEntry[];
  
  scores: ProgressionScoreBreakdown;
  overallProgressionScore: number; // 0 - 1000
  progressToNextTier: number; // 0 - 100%
  nextTier: LifeTier | null;
  pointsToNextTier: number;
  
  promotionReasons: string[];
  regressionReasons: string[];
  instabilityWarnings: string[];
  monthsBelowMaintenance: number;
  isUnstable: boolean;
  
  unlockedDomains: string[];
  unlockedActions: string[];
}

export interface LifeTierChangeResult {
  changed: boolean;
  changeType: LifeTierChangeType | null;
  previousTier: LifeTier;
  currentTier: LifeTier;
  reasons: string[];
  unlockedDomains: string[];
  unlockedActions: string[];
  event?: LifeEvent;
  news?: NewsItem;
}

export interface PowerScoreBreakdown {
  netWorthScore: number;
  businessScore: number;
  politicsScore: number;
  reputationScore: number;
  mediaScore: number;
  projectsScore: number;
  sportsScore: number;
  philanthropyScore: number;
}

export interface PlayerPowerProfile {
  powerScore: number;
  powerTier: PowerTier;
  visibility: number; // 0-100
  mediaAttention: number; // 0-100
  politicalInfluence: number; // 0-100
  businessInfluence: number; // 0-100
  publicInfluence: number; // 0-100
  scrutiny: number; // 0-100
  regulatoryAttention: number; // 0-100
  breakdown: PowerScoreBreakdown;
  tierPerks: string[];
  tierBurdens: string[];
  progressToNextTierPercent: number;
  nextTier: PowerTier | null;
  pointsToNextTier: number;
  tierRank: number; // 0 to 6
}

export interface CharacterAttributes {
  health: number; // 0-100
  happiness: number; // 0-100
  intelligence: number; // 0-100
  stress: number; // 0-100 (Inverted: lower is better!)
  attractiveness: number; // 0-100
  charm: number; // 0-100
  reputation: number; // 0-100
  worldInfluence: number; // 0-100
}

export interface AttributeHistoryRecord {
  month: number;
  year: number;
  age: number;
  attributes: CharacterAttributes;
}

export interface StatusFactor {
  source: string;
  effect: number;
  isPositive: boolean;
}

export interface EducationRecord {
  id: string;
  institution: string;
  qualification: 'Primary' | 'Secondary' | 'Bachelor' | 'Master' | 'PhD' | 'Diploma' | 'Professional Certification' | 'Certification';
  field: string;
  startAge: number;
  durationMonths: number;
  monthsCompleted: number;
  tuitionPerMonth: number;
  completed: boolean;
  gradeAverage: number;
}

export interface JobRecord {
  id: string;
  title: string;
  field: string;
  level: 'Intern' | 'Junior' | 'Professional' | 'Senior' | 'Specialist' | 'Manager' | 'Director' | 'Executive' | 'Industry Leader';
  companyName: string;
  companyId?: string;
  monthlySalary: number;
  salary?: number;
  experience?: number;
  monthlyBonusPotential: number;
  stressLevel: number;
  workingHoursWeekly: number;
  reputationRequired: number;
  intelligenceRequired: number;
  educationRequired: string;
  startAge: number;
  performance: number; // 0-100
}

export interface ChildSkills {
  intellect: number; // 0-100
  creativity: number; // 0-100
  leadership: number; // 0-100
  discipline: number; // 0-100
}

export type ChildPotential = 'Prodigy' | 'High Potential' | 'Average' | 'Struggling' | 'Visionary';

export interface RelationshipPerson {
  id: string;
  name: string;
  relation: 'Father' | 'Mother' | 'Brother' | 'Sister' | 'Spouse' | 'Partner' | 'Son' | 'Daughter' | 'Friend' | 'Mentor' | 'Business Partner' | 'Rival' | 'Advisor';
  age: number;
  gender: 'Male' | 'Female' | 'Non-binary';
  occupation: string;
  wealth: number;
  trust: number; // 0-100
  love: number; // 0-100
  respect: number; // 0-100
  loyalty: number; // 0-100
  influence: number; // 0-100
  alive: boolean;
  avatarSeed: string;
  isHeirCandidate?: boolean;

  // Phase 16: Family & Child Dynamic Progression
  education?: string;
  career?: string;
  skills?: ChildSkills;
  health?: number; // 0-100
  potential?: ChildPotential;
  partnerName?: string;
  monthlyAllowance?: number;
  schoolType?: 'Public' | 'Private Elite' | 'International Academy' | 'Ivy League';
  lastInteractedTick?: number;
  traits?: string[];
  lifeMilestones?: string[];

  // Phase 18: Dynasty Heir & Successor Attributes
  leadership?: number; // 0-100
  businessAbility?: number; // 0-100
  politicalAbility?: number; // 0-100
  isRivalHeir?: boolean;
  isLoyalHeir?: boolean;
  conflictStatus?: 'Loyal' | 'Content' | 'Disgruntled' | 'Openly Rival' | 'Litigious';
  inheritanceSharePercent?: number;

  // Expansion 1E: Advanced Personalities & Emergent Narrative
  advancedPersonality?: AdvancedPersonality;
  personalityArchetype?: string;
  activeMotivations?: NpcMotivation[];
  goals?: NpcGoal[];
  memories?: NpcMemory[];
  sentiment?: RelationshipSentiment;
  relationshipStage?: RelationshipStage;
  rivalryStatus?: RivalryRecord;
  isAllianceMember?: boolean;
  allianceCommitment?: number; // 0-100
  biographyChronicle?: string[];
}

export type Relationship = RelationshipPerson;

export interface BankAccount {
  id: string;
  type: 'Checking' | 'High-Yield Savings' | 'Investment Portfolio' | 'Business Vault';
  balance: number;
  interestRateAnnual: number;
}

export interface Loan {
  id: string;
  title: string;
  principal: number;
  remainingBalance: number;
  monthlyPayment: number;
  interestRateAnnual: number;
  termMonthsRemaining: number;
}

export interface StockAsset {
  symbol: string;
  name: string;
  category: 'Tech' | 'Finance' | 'Energy' | 'Health' | 'Consumer' | 'Commodity' | 'Crypto';
  currentPrice: number;
  sharesOwned: number;
  avgBuyPrice: number;
  priceHistory: number[]; // Last 12 months
  dividendYieldAnnual: number;
  volatility: number;
}

export interface RealEstateProperty {
  id: string;
  name: string;
  type: 'Apartment' | 'Luxury Villa' | 'Office Tower' | 'Shopping Plaza' | 'Industrial Warehouse' | 'Land Parcel' | 'Penthouse' | 'House' | string;
  city: string;
  country: string;
  purchasePrice: number;
  currentValue: number;
  marketValue?: number;
  monthlyRent: number;
  monthlyMaintenance: number;
  monthlyExpenses?: number;
  location?: string;
  isRented: boolean;
  tenantQuality: number; // 0-100
  condition: number; // 0-100
  mortgage?: Loan;
  isPrimaryResidence?: boolean;
}

export interface Executive {
  id: string;
  name: string;
  role: 'CEO' | 'CFO' | 'CTO' | 'COO' | 'CMO' | 'CHRO' | 'CAO' | 'CPO' | 'General Counsel';
  salaryMonthly: number;
  competence: number;
  loyalty: number;
  ambition: number;
  personality: 'Aggressive Growth' | 'Conservative Prudent' | 'Tech Visionary' | 'Cost Cutter' | 'Dealmaker';
  aiOpinion?: string;
  npcId?: string;
}

export interface BoardMember {
  id: string;
  name: string;
  sharesPercentage: number;
  supportLevel: number; // 0-100
  agenda: 'Maximum Dividends' | 'R&D Innovation' | 'Aggressive M&A' | 'Cost Discipline' | 'Player Ally';
  personality: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  city: string;
  country: string;
  valuation: number;
  sharePrice: number;
  totalShares: number;
  playerOwnershipPercentage: number;
  isPublic: boolean;
  cashReserve: number;
  cash?: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyNetProfit: number;
  employeesCount: number;
  averageEmployeeSalary: number;
  employeeMorale: number; // 0-100
  employeeProductivity: number; // 0-100
  marketShare: number; // 0-100 %
  brandReputation: number; // 0-100
  productQuality: number; // 0-100
  pricingStrategy: 'Discount' | 'Competitive' | 'Premium Luxury';
  marketingBudgetMonthly: number;
  rdBudgetMonthly: number;
  capacityMonthlyUnits: number;
  inventoryUnits: number;
  unitCost: number;
  unitPrice: number;
  supplierType: 'Local' | 'International Low-Cost' | 'Premium Quality';
  supplierCostFactor: number;
  executives: Executive[];
  boardMembers: BoardMember[];
  historicalRevenue: number[];
  historicalProfit: number[];
  dividendPayoutRatio: number; // 0-1
  debt?: number; // Balance-sheet corporate debt
  debtInterestRate?: number; // Annual interest rate percentage (e.g. 5.5%)

  // Corporate Simulation Engine / ASX fields
  ticker?: string;
  exchange?: string;
  sector?: string;
  headquarters?: string;
  publicFloatShares?: number;
  insiderShares?: number;
  institutionalShares?: number;
  votingShares?: number;
  cogsMonthly?: number;
  fixedOverheadCostsMonthly?: number;
  fixedAssets?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  annualRevenue?: number;
  creditRating?: string;
  customerBase?: number;
  capacityUtilization?: number;
  demandCoefficient?: number;
  volatilityIndex?: number;
  high52Week?: number;
  low52Week?: number;
  peRatio?: number;
  dividendYield?: number;
  lastQuarterRevenue?: number;
  lastQuarterNetIncome?: number;
  lastQuarterRevenueGrowth?: number;
  revenueGrowthStreak?: number;
  corporateTaxRate?: number;
  listedSinceTick?: number;
  ceoApprovalRating?: number;
  employeeWageSatisfaction?: number;
  boardSeatCount?: number;
  boardControlThreshold?: number;
}


export type CorporateBoardAgenda = 'SHORT_TERM_ACTIVIST' | 'CONSERVATIVE_GUARDIAN' | 'INSULATED_BUREAUCRAT' | 'LONG_TERM_BUILDER' | 'PLAYER_ALLY';
export type CorporateResolutionType = 'HIRE_CEO' | 'FIRE_CEO' | 'DIVIDEND' | 'DEBT_ISSUANCE' | 'ASSET_SALE' | 'MERGER' | 'RESTRUCTURE' | 'CAPEX' | 'BYLAW_CHANGE';
export type CorporateDealStage = 'IDENTIFIED' | 'DUE_DILIGENCE' | 'BOARD_REVIEW' | 'REGULATORY_REVIEW' | 'FINANCING' | 'SHAREHOLDER_OFFER' | 'COMPLETED' | 'REJECTED';

export interface CorporateBoardSeat {
  id: string;
  holderId: string;
  holderName: string;
  representedShares: number;
  representedOwnershipPercent: number;
  agenda: CorporateBoardAgenda;
  supportLevel: number;
  influence: number;
  isPlayerSeat?: boolean;
}

export interface CorporateShareholderRecord {
  holderId: string;
  holderName: string;
  shares: number;
  ownershipPercent: number;
  votingPowerPercent: number;
  holderType: 'PLAYER' | 'FOUNDER' | 'INSTITUTION' | 'HEDGE_FUND' | 'RETAIL_POOL' | 'EMPLOYEE_TRUST';
}

export interface CorporateJobVacancy {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  field: string;
  tier: 1 | 2 | 3 | 4;
  level: JobRecord['level'];
  salaryMonthly: number;
  workingHoursWeekly: number;
  performanceBonusPercent: number;
  requiredIntelligence: number;
  requiredReputation: number;
  requiredEducation: string;
  requiredExperienceMonths: number;
  interviewDifficulty: number;
  postedTick: number;
  expiresTick: number;
  status: 'OPEN' | 'FILLED' | 'FROZEN' | 'EXPIRED';
}

export interface CorporateInterviewState {
  applicationId: string;
  vacancyId: string;
  companyId: string;
  currentQuestionIndex: number;
  score: number;
  questions: InterviewQuestion[];
  passingScore: number;
}

export interface CorporateResolution {
  id: string;
  companyId: string;
  type: CorporateResolutionType;
  title: string;
  description: string;
  proposedBy: string;
  requiredMajority: number;
  votesFor: number;
  votesAgainst: number;
  status: 'PENDING' | 'PASSED' | 'FAILED';
  createdTick: number;
}

export interface CorporateTakeoverDeal {
  id: string;
  targetCompanyId: string;
  bidderId: string;
  targetCompanyName: string;
  marketCapitalization: number;
  acquisitionPremiumPercent: number;
  offerValue: number;
  sharesTargeted: number;
  sharesAcquired: number;
  stage: CorporateDealStage;
  hostile: boolean;
  regulatoryRisk: number;
  financingRequired: number;
  financingDebt: number;
  createdTick: number;
  notes: string[];
}

export interface CorporateSystemState {
  exchangeName: string;
  exchangeSymbol: string;
  publicCompanyIds: string[];
  companyRegistryVersion: number;
  universeSeeded?: boolean;
  jobVacancies: CorporateJobVacancy[];
  activeInterviews: CorporateInterviewState[];
  shareholderRecords: Record<string, CorporateShareholderRecord[]>;
  boardSeats: Record<string, CorporateBoardSeat[]>;
  resolutions: CorporateResolution[];
  boardMeetings: CorporateBoardMeeting[];
  boardroomSessions?: CorporateBoardroomSession[];
  takeoverDeals: CorporateTakeoverDeal[];
  marketSentiment: 'BULL' | 'STAGNANT' | 'BEAR' | 'CRISIS';
  sectorShocks: Record<string, { label: string; costMultiplier: number; demandMultiplier: number; expiresTick: number } | undefined>;
  eventHistory: string[];
  lastProcessedTick: number;
  cSuiteExecutives: { id: string; name: string; role: Executive['role']; salaryMonthly: number; competence: number; loyalty: number; vision: number }[];
  acquisitionPipeline: { id: string; name: string; sector: string; marketSharePercent: number; annualRevenue: number; ebitdaMargin: number; askingPrice: number; synergyPotential: number; status: 'IDENTIFIED' | 'DUE_DILIGENCE' | 'BID_SUBMITTED' | 'ACQUIRED' | 'REJECTED' }[];
  totalEnterpriseValuation: number;
  consolidatedRevenueMonthly: number;
}


export type CorporateMacroPhase = 'BOOM' | 'EXPANSION' | 'SLOWDOWN' | 'RECESSION' | 'CRISIS';
export type InstitutionalMandate = 'INDEX' | 'VALUE' | 'GROWTH' | 'ACTIVIST' | 'INCOME' | 'SOVEREIGN';
export type CorporateStrategy = 'GROWTH' | 'BALANCED' | 'COST_DISCIPLINE' | 'INNOVATION' | 'ACQUISITIVE' | 'DEFENSIVE';

export interface CorporateInstitutionalInvestor {
  id: string;
  name: string;
  mandate: InstitutionalMandate;
  assetsUnderManagement: number;
  cash: number;
  riskTolerance: number;
  activism: number;
  reputation: number;
  sectorPreferences: string[];
  holdings: Record<string, number>;
  votingAlignment: number;
}

export interface CorporateRegulatoryProfile {
  companyId: string;
  antitrustExposure: number;
  laborExposure: number;
  environmentalExposure: number;
  consumerExposure: number;
  financialExposure: number;
  politicalAttention: number;
  complianceScore: number;
  investigationTicks: number;
  finesAccrued: number;
  lobbyingInfluence: number;
}

export interface CorporateGovernanceProfile {
  companyId: string;
  boardConfidence: number;
  ceoConfidence: number;
  ceoTenureMonths: number;
  strategy: CorporateStrategy;
  executiveCompensationIndex: number;
  successionReadiness: number;
  shareholderActivism: number;
  boardIndependence: number;
  pendingCeoElection?: string;
}

export interface CorporateMABid {
  id: string;
  bidderCompanyId: string;
  targetCompanyId: string;
  bidderName: string;
  targetName: string;
  bidValue: number;
  premiumPercent: number;
  financingRatio: number;
  expectedSynergyPercent: number;
  integrationRisk: number;
  antitrustRisk: number;
  politicalRisk: number;
  shareholderSupport: number;
  stage: 'RUMOR' | 'DUE_DILIGENCE' | 'BOARD_REVIEW' | 'REGULATORY' | 'FINANCING' | 'SHAREHOLDER_VOTE' | 'CLOSED' | 'BLOCKED' | 'FAILED';
  createdTick: number;
  notes: string[];
  crossBorder?: boolean;
  bidderCountry?: string;
  targetCountry?: string;
  fxRate?: number;
  treatyFriction?: number;
  antitrustCaseId?: string;
}


export type CorporateBoardMeetingAgenda = 'STRATEGY'|'CAPITAL_ALLOCATION'|'CEO_PERFORMANCE'|'EXECUTIVE_COMPENSATION'|'DIVIDEND'|'DEBT'|'CAPEX'|'M_AND_A'|'RESTRUCTURE'|'RISK_CRISIS';
export type CorporateBoardMeetingOutcome = 'APPROVED'|'REJECTED'|'DEFERRED'|'QUORUM_FAILED';
export interface CorporateBoardMeetingVote { seatId:string; holderId:string; holderName:string; vote:'FOR'|'AGAINST'|'ABSTAIN'; weight:number; rationale:string; }
export type CorporateBoardroomPhase = 'AGENDA'|'EXECUTIVE_REPORTS'|'DIRECTOR_DEBATE'|'AMENDMENTS'|'SHAREHOLDER_PRESSURE'|'FINAL_VOTE'|'CLOSED';
export type CorporateBoardroomCrisis = 'CEO_CONFIDENCE_CRISIS'|'ACTIVIST_CAMPAIGN'|'LEADERSHIP_CHALLENGE'|'DIRECTOR_RESIGNATION'|'INTERNAL_LEAK'|'PUBLIC_SCANDAL'|'EMERGENCY_MEETING';
export interface CorporateBoardroomDebate { id:string; speakerId:string; speakerName:string; role:string; position:'FOR'|'AGAINST'|'NEUTRAL'; argument:string; influence:number; tick:number; }
export interface CorporateBoardroomAmendment { id:string; proposedBy:string; text:string; accepted:boolean; voteFor:number; voteAgainst:number; }
export interface CorporateBoardroomShareholderPressure { id:string; holderId:string; holderName:string; ownershipPercent:number; demand:string; intensity:number; response:'ADDRESSED'|'IGNORED'|'CONCESSION'; }
export interface CorporateBoardroomSession {
  id:string; companyId:string; meetingId:string; phase:CorporateBoardroomPhase; startedTick:number; agenda:CorporateBoardMeetingAgenda;
  executiveReports:string[]; debates:CorporateBoardroomDebate[]; amendments:CorporateBoardroomAmendment[]; shareholderPressure:CorporateBoardroomShareholderPressure[];
  crises:CorporateBoardroomCrisis[]; status:'ACTIVE'|'CLOSED'; narrative:string[];
}
export interface CorporateBoardMeeting {
  id:string; companyId:string; scheduledTick:number; heldTick?:number; agenda:CorporateBoardMeetingAgenda; title:string; proposal:string; proposedBy:string;
  playerVote?:'FOR'|'AGAINST'|'ABSTAIN'; votes:CorporateBoardMeetingVote[]; quorumPercent:number; requiredMajority:number;
  outcome:'SCHEDULED'|'IN_PROGRESS'|'APPROVED'|'REJECTED'|'DEFERRED'|'QUORUM_FAILED'; outcomeReason?:string;
  consequences:string[]; minutes:string[]; boardSupportBefore:number; boardSupportAfter:number; ceoApprovalBefore?:number; ceoApprovalAfter?:number;
  phase?:CorporateBoardroomPhase; sessionId?:string; executiveArguments?:Record<string,'FOR'|'AGAINST'|'NEUTRAL'>; amendmentCount?:number; shareholderPressureScore?:number;
  crisisFlags?:CorporateBoardroomCrisis[];
}
export interface CorporateResolutionVote { resolutionId:string; forVotes:number; againstVotes:number; supportPercent:number; passed:boolean; }
export interface CorporateAGM { id:string; companyId:string; scheduledTick:number; attendeeParticipation:number; resolutions:CorporateResolutionVote[]; ceoEvaluation:number; boardElectionOccurred:boolean; boardSupportPercent:number; shareholderTurnoutPercent:number; }
export interface CorporateCEOCompensationPackage { baseSalary:number; targetBonusPercent:number; optionShares:number; strikePrice:number; vestedOptions:number; vestingMonthsRemaining:number; lastReviewTick:number; }
export type ActivistCampaignStage='PRIVATE_ENGAGEMENT'|'PUBLIC_CAMPAIGN'|'PROXY_SOLICITATION'|'SETTLEMENT'|'BOARD_CHALLENGE';
export interface CorporateActivistCampaign { id:string; companyId:string; institutionId:string; demand:string; ownershipPercent:number; supportPercent:number; stage:ActivistCampaignStage; status:'ACTIVE'|'SETTLED'|'FAILED'; createdTick:number; }
export interface CorporateDebtInstrument { id:string; companyId:string; principal:number; outstanding:number; couponRate:number; maturityTick:number; seniority:'SENIOR_SECURED'|'SENIOR_UNSECURED'|'SUBORDINATED'; creditRating:string; issuedTick:number; }
export interface CorporateOffering { id:string; companyId:string; type:'IPO'|'SECONDARY'; sharesOffered:number; remainingShares:number; offerPrice:number; proceeds:number; stage:'OPEN'|'PRICED'|'CLOSED'|'WITHDRAWN'; createdTick:number; }
export interface CorporateBankruptcyCase { id:string; companyId:string; stage:'EARLY_DISTRESS'|'RESTRUCTURING'|'CREDITOR_VOTE'|'LIQUIDATION_RISK'|'EMERGENCE'; status:'ACTIVE'|'EXITED'; cashAtFiling:number; debtAtFiling:number; restructuringPlan:'NEGOTIATE'|'DEBT_EQUITY_SWAP'|'ASSET_SALE'|'CHAPTER_REORGANIZATION'; creditorRecoveryEstimate:number; createdTick:number; }
export interface CorporateAntitrustCase { id:string; companyId:string; authority:string; jurisdiction:string; reason:string; risk:number; stage:'INVESTIGATION'|'REMEDIES'|'HEARING'|'DECIDED'; status:'OPEN'|'CLOSED'; fineExposure:number; createdTick:number; }
export interface CorporateGovernmentContract { id:string; companyId:string; agency:string; jurisdiction:string; contractValue:number; durationMonths:number; remainingMonths:number; stage:'BID_SUBMITTED'|'AWARDED'|'BREACH'|'COMPLETED'; performanceScore:number; awardProbability:number; createdTick:number; }
export interface CorporateLobbyingProgram { id:string; companyId:string; issue:string; monthlyBudget:number; influence:number; jurisdiction:string; status:'ACTIVE'|'SUSPENDED'|'ENDED'; createdTick:number; }
export type CorporateHistoryEventType='AGM'|'CEO_COMPENSATION'|'ACTIVISM'|'DEBT'|'IPO'|'ANTITRUST'|'GOVERNMENT_CONTRACT'|'LOBBYING'|'BANKRUPTCY'|'M_AND_A'|'CAPITAL_MARKETS';
export interface CorporateCorporateHistoryEvent { id:string; tick:number; companyId:string; type:CorporateHistoryEventType; title:string; description:string; impact:number; }
export interface CorporateCapitalMarketsState { version:number; agms:CorporateAGM[]; resolutions:CorporateResolution[]; activistCampaigns:CorporateActivistCampaign[]; debtInstruments:CorporateDebtInstrument[]; offerings:CorporateOffering[]; bankruptcyCases:CorporateBankruptcyCase[]; antitrustCases:CorporateAntitrustCase[]; governmentContracts:CorporateGovernmentContract[]; lobbyingPrograms:CorporateLobbyingProgram[]; maBids:CorporateMABid[]; ceoCompensation:Record<string,CorporateCEOCompensationPackage>; history:CorporateCorporateHistoryEvent[]; lastProcessedTick:number; }

export interface CorporateDeepSimulationState {
  version: number;
  macroPhase: CorporateMacroPhase;
  globalGDPGrowth: number;
  inflationRate: number;
  policyRate: number;
  creditSpread: number;
  tradeStress: number;
  commodityIndex: number;
  institutionalInvestors: CorporateInstitutionalInvestor[];
  regulatoryProfiles: Record<string, CorporateRegulatoryProfile>;
  governanceProfiles: Record<string, CorporateGovernanceProfile>;
  maBids: CorporateMABid[];
  marketLiquidity: number;
  lastProcessedTick: number;
  systemicNews: string[];
}

export interface PoliticalParty {
  id: string;
  name: string;
  ideology: 'Progressive Reform' | 'Conservative Enterprise' | 'Centrist Coalition' | 'Technocrat Forward' | 'Green Ecology';
  pollingPercentage: number;
  partyFunds: number;
  partyLeader: string;
  playerReputationInParty: number; // 0-100
}

export interface PoliticalOffice {
  title: 
    | 'Citizen' 
    | 'Party Member' 
    | 'Campaign Candidate' 
    | 'City Councillor' 
    | 'Mayor' 
    | 'Member of Parliament' 
    | 'Member of Parliament / Senator' 
    | 'Cabinet Minister' 
    | 'Party Leader' 
    | 'President / Prime Minister' 
    | 'Senior Statesman / Elder Diplomat'
    | string;
  cityOrNation: string;
  approvalRating: number; // 0-100
  politicalCapital: number; // 0-100
  inOffice: boolean;
  termMonthsRemaining: number;
  salaryMonthly: number;
  ministryAssigned?: 'Finance' | 'Health' | 'Education' | 'Defence' | 'Infrastructure' | 'Energy' | 'Justice' | 'Technology';
}

export interface CountryState {
  id: string;
  name: string;
  flag: string;
  currencySymbol: string;
  currencyName: string;
  gdpBillions: number;
  gdpGrowthRate: number; // e.g. 2.4%
  inflationRate: number; // e.g. 3.2%
  centralBankInterestRate: number; // e.g. 4.5%
  unemploymentRate: number; // e.g. 4.8%
  corporateTaxRate: number; // e.g. 21%
  incomeTaxRate: number; // e.g. 28%
  businessCycle: 'Boom' | 'Expansion' | 'Slowdown' | 'Recession' | 'Recovery';
  politicalStability: number; // 0-100
  infrastructureScore: number; // 0-100
  healthSystemScore: number; // 0-100
  educationScore: number; // 0-100
  nationalDebtBillions: number;
  publicApprovalOfGov: number;
  cities: CityState[];
}

export interface CityState {
  id: string;
  name: string;
  countryName: string;
  population: number;
  averageIncomeMonthly: number;
  propertyPriceIndex: number;
  crimeRate: number; // 0-100
  tourismIndex: number;
  businessOpportunityScore: number;
}

export interface SportsTeam {
  id: string;
  name: string;
  sport: 'Football / Soccer' | 'Basketball' | 'Motorsport Racing' | 'Tennis Club' | 'Cricket' | 'Rugby';
  city: string;
  valuation: number;
  playerOwnershipPercentage: number;
  fanBaseThousands: number;
  stadiumCapacity: number;
  ticketPrice: number;
  monthlySponsorship: number;
  monthlyPlayerWages: number;
  monthlyNetIncome: number;
  teamPerformanceScore: number; // 0-100
  leaguePosition: number;
  totalTeamsInLeague: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  headCoachName: string;
  starPlayerName: string;
  recentMatchResult?: string;
}

export interface MajorProject {
  id: string;
  name: string;
  type: 'Company HQ' | 'Skyscraper Construction' | 'Luxury Shopping Mall' | 'Tech R&D Lab' | 'Sports Stadium' | 'Political PAC' | 'Charity Foundation';
  totalBudgetRequired: number;
  capitalInvested: number;
  durationMonths: number;
  monthsProgress: number;
  completed: boolean;
  status: 'In Planning' | 'Active Construction' | 'Delayed by Supply Shortage' | 'Under Budget Review' | 'Completed' | 'Failed';
  expectedMonthlyIncomeBoost: number;
  expectedReputationBoost: number;
  expectedInfluenceBoost: number;
  riskFactor: 'Low' | 'Medium' | 'High';
}

export type SimulationEventCategory =
  | 'PERSONAL'
  | 'HEALTH'
  | 'CAREER'
  | 'FAMILY'
  | 'RELATIONSHIP'
  | 'BUSINESS'
  | 'FINANCE'
  | 'INVESTMENT'
  | 'REAL_ESTATE'
  | 'POLITICS'
  | 'ECONOMY'
  | 'PROJECT'
  | 'SPORTS'
  | 'REPUTATION'
  | 'MEDIA'
  | 'DYNASTY'
  | 'SUCCESSION'
  | 'WORLD'
  // Legacy / Display categories
  | 'Life'
  | 'Finance'
  | 'Business'
  | 'Career'
  | 'Politics'
  | 'Sports'
  | 'Family'
  | 'Relationships'
  | 'Achievements'
  | 'Failures'
  | 'Economy'
  | 'World';

export type SimulationEventType =
  | 'WARNING'
  | 'OPPORTUNITY'
  | 'CRISIS'
  | 'MILESTONE'
  | 'DECISION'
  | 'INFORMATION'
  | 'STORY';

export type SimulationEventSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type SimulationEventStatus = 'Active' | 'Resolved' | 'Expired' | 'Dismissed';

export interface SimulationEventChoice {
  id: string;
  label: string;
  description: string;
  cost?: number;
  risk?: 'Low' | 'Medium' | 'High';
  timeHorizon?: string;
  projectedOutcome?: string;
  handlerKey?: string;
  consequences?: Consequence[];
  delayedConsequences?: {
    delayMonths: 1 | 3 | 6 | 12 | number;
    source?: string;
    description: string;
    consequences: Consequence[];
    conditions?: StateCondition | ConditionGroup;
  }[];
}

export interface SimulationEvent {
  id: string;
  category: SimulationEventCategory;
  type?: SimulationEventType;
  title: string;
  description: string;
  severity?: SimulationEventSeverity;
  priority?: number;
  source?: string;
  sourceEntityId?: string;
  createdMonth?: number;
  createdYear?: number;
  expiresAt?: { month: number; year: number } | number;
  choices?: SimulationEventChoice[];
  conditions?: StateCondition | ConditionGroup;
  chainId?: string;
  parentEventId?: string;
  tags?: string[];
  status?: SimulationEventStatus;
  triggerReason?: string;
  minPowerTier?: PowerTier;
  maxPowerTier?: PowerTier;
  minLifeTier?: LifeTier;
  maxLifeTier?: LifeTier;

  // Backwards compatibility with LifeEvent
  timestampMonth?: number;
  timestampYear?: number;
  age?: number;
  consequences?: {
    cashChange?: number;
    netWorthChange?: number;
    healthChange?: number;
    happinessChange?: number;
    intelligenceChange?: number;
    stressChange?: number;
    attractivenessChange?: number;
    charmChange?: number;
    reputationChange?: number;
    worldInfluenceChange?: number;
    details?: string[];
  };
  newsHeadline?: string;
}

export type LifeEvent = SimulationEvent;

export interface SimulationSnapshot {
  month: number;
  year: number;
  tick: number;
  age: number;

  // Finance
  cash: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalDebt: number;
  stockValue: number;
  propertyValue: number;
  businessEquityValue: number;
  otherAssetsValue: number;

  // Investments
  stocks: { symbol: string; name: string; sharesOwned: number; currentPrice: number; totalValue: number }[];
  properties: { id: string; name: string; currentValue: number; monthlyRent: number; mortgageDebt: number }[];
  otherInvestments: { name: string; type: string; value: number }[];

  // Business
  totalRevenue: number;
  totalProfit: number;
  totalBusinessValuation: number;
  totalEmployees: number;
  companies: {
    id: string;
    name: string;
    industry: string;
    monthlyRevenue: number;
    monthlyNetProfit: number;
    valuation: number;
    employeesCount: number;
    playerOwnershipPercentage: number;
  }[];

  // Personal
  health: number;
  stress: number;
  happiness: number;
  careerTitle: string;
  careerSalary: number;
  reputation: number;
  worldInfluence: number;

  // Family
  maritalStatus: 'Single' | 'Dating' | 'Married' | 'Widowed' | 'Divorced';
  spouseName?: string;
  childrenCount: number;
  childrenNames: string[];
  relationshipsCount: number;

  // Politics
  officeTitle: string;
  inOffice: boolean;
  approvalRating: number;
  politicalCapital: number;
  publicInfluence: number;
  pollingSupport: number;

  // World
  countryName: string;
  gdpGrowthRate: number;
  inflationRate: number;
  interestRate: number;
  economicClimate: string;
  businessCycle: string;
}

export interface MetricTransition {
  previous: number;
  current: number;
  change: number;
  percentChange?: number;
  formattedPrevious?: string;
  formattedCurrent?: string;
  formattedChange?: string;
}

export interface SimulationDiff {
  // Snapshots
  snapshotBefore?: SimulationSnapshot;
  snapshotAfter?: SimulationSnapshot;

  month: number;
  year: number;
  executiveSummary: string;

  // Finance
  cashTransition: MetricTransition;
  netWorthTransition: MetricTransition;
  incomeTransition: MetricTransition;
  expensesTransition: MetricTransition;
  debtTransition: MetricTransition;

  // Investments
  investments: {
    stocks: {
      totalValueTransition: MetricTransition;
      items: { name: string; symbol: string; shares: number; price: number; totalValue: number; priceChange: number }[];
    };
    properties: {
      totalValueTransition: MetricTransition;
      items: { id: string; name: string; value: number; rent: number; valueChange: number }[];
    };
    otherInvestments: {
      totalValueTransition: MetricTransition;
      items: { name: string; type: string; value: number }[];
    };
  };

  // Business
  business: {
    revenueTransition: MetricTransition;
    profitTransition: MetricTransition;
    valuationTransition: MetricTransition;
    employeesTransition: MetricTransition;
    majorCompanyChanges: string[];
  };

  // Personal
  personal: {
    healthTransition: MetricTransition;
    stressTransition: MetricTransition;
    career: {
      title: string;
      previousSalary: number;
      currentSalary: number;
      changeText?: string;
      isEmployed: boolean;
    };
    happinessTransition: MetricTransition;
    reputationTransition: MetricTransition;
    worldInfluenceTransition: MetricTransition;
  };

  // Family
  family: {
    majorRelationshipChanges: string[];
    children: string[];
    marriage: string;
    familyEvents: string[];
  };

  // Politics
  politics: {
    approvalTransition: MetricTransition;
    influenceTransition: MetricTransition;
    office: string;
    inOffice: boolean;
    pollingTransition: MetricTransition;
  };

  // World
  world: {
    gdpTransition: MetricTransition;
    inflationTransition: MetricTransition;
    interestRateTransition: MetricTransition;
    businessCycle: string;
    economicClimate: string;
    countryName: string;
  };

  // Major Events
  majorEvents: LifeEvent[];

  // Unresolved Decisions
  unresolvedDecisions: PendingDecision[];

  // Opportunities
  opportunities: LifeEvent[];

  // Risks
  risks: {
    id?: string;
    title: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    category?: string;
  }[];

  // Outlook
  outlook: string[];

  // Backwards compatibility fields
  tickDiff: number;
  cashDiff: number;
  netWorthDiff: number;
  netWorthPercentChange: number;
  debtDiff: number;
  totalDebt: number;
  interestRateDiff: number;
  currentInterestRate: number;
  gdpGrowthDiff: number;
  inflationDiff: number;
  healthDiff: number;
  currentHealth: number;
  stressDiff: number;
  currentStress: number;
  happinessDiff: number;
  reputationDiff: number;
  worldInfluenceDiff: number;
  companyDiffs: {
    id: string;
    name: string;
    oldRevenue: number;
    newRevenue: number;
    revenueDiff: number;
    revenuePercentChange: number;
    oldProfit: number;
    newProfit: number;
    profitDiff: number;
    oldMorale: number;
    newMorale: number;
    moraleDiff: number;
    oldValuation: number;
    newValuation: number;
    valuationPercentChange: number;
  }[];
  propertyDiffs: {
    id: string;
    name: string;
    condition: number;
    valueDiff: number;
    rentDiff: number;
  }[];
  relationshipDiffs: {
    id: string;
    name: string;
    relation: string;
    oldTrust: number;
    newTrust: number;
    trustDiff: number;
    oldLove: number;
    newLove: number;
    loveDiff: number;
  }[];
  projectDiffs: {
    id: string;
    name: string;
    monthsProgress: number;
    durationMonths: number;
    progressPercent: number;
    completed: boolean;
    status: string;
  }[];
  politicsDiff?: {
    title: string;
    approvalDiff: number;
    currentApproval: number;
    capitalDiff: number;
    currentCapital: number;
    inOffice: boolean;
  };
  lifeProgressionTransition?: {
    previousTier: LifeTier;
    currentTier: LifeTier;
    isPromotion: boolean;
    isRegression: boolean;
    changeReasons: string[];
    scoreChange: number;
    newTierDisplayName: string;
  };
  lifeGameplayDiff?: {
    newResponsibilities: Responsibility[];
    resolvedResponsibilities: string[];
    pressureChanges: { type: PressureType; oldIntensity: number; newIntensity: number; trend: PressureTrend }[];
    newOpportunities: LifeOpportunity[];
    expiredOpportunities: string[];
    crisesTriggered: ActiveCrisisRecord[];
    crisesResolved: string[];
    strategicOutlookSummary: string;
  };
  emergentNarrativeDiff?: {
    newStoryThreads: StoryThread[];
    updatedStoryThreads: { id: string; title: string; state: StoryThreadState; tensionDelta: number; recentEvent: string }[];
    resolvedStoryThreads: string[];
    newScandals: ScandalRecord[];
    escalatedScandals: string[];
    resolvedScandals: string[];
    newRivalries: RivalryRecord[];
    rivalryUpdates: { id: string; opponentName: string; stage: RivalryEscalationStage; delta: number }[];
    landmarkMemoriesCreated: { npcName: string; headline: string }[];
    monthlyNarrative: { summary: string; highlights: string[]; riskNarrative: string; opportunityNarrative: string };
  };
}

export type ConsequenceOperation = 'SET' | 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'PERCENTAGE_CHANGE';

export type ConditionOperator = 
  | 'equals' 
  | 'notEquals' 
  | 'greaterThan' 
  | 'greaterThanOrEqual' 
  | 'lessThan' 
  | 'lessThanOrEqual' 
  | 'contains' 
  | 'hasEntity' 
  | 'percentageChange' 
  | 'relationshipValue';

export type ConditionLogic = 'AND' | 'OR';

export interface StateCondition {
  target: ConsequenceTargetCategory;
  property: string;
  operator: ConditionOperator;
  value: any;
  targetId?: string;
  description?: string;
}

export interface ConditionGroup {
  logic: ConditionLogic;
  conditions: StateCondition[];
}

export interface ConditionalConsequence {
  id?: string;
  name?: string;
  description?: string;
  eventKey?: string;
  entityId?: string;
  cooldownMonths?: number;
  oncePerPlayer?: boolean;
  priority?: number;
  condition: StateCondition | ConditionGroup;
  consequences: Consequence[];
  elseConsequences?: Consequence[];
  unlocksDecisions?: PendingDecision[];
  unlocksEvents?: LifeEvent[];
  source?: string;
}

export interface RiskResolutionResult {
  successProbability: number; // 0.05 to 0.95
  isSuccess: boolean;
  baseProbability: number;
  modifiers: { label: string; value: number; formatted: string }[];
  breakdownText: string;
}

export interface MonthlySimulationResult {
  nextState: GameState;
  beforeSnapshot: SimulationSnapshot;
  afterSnapshot: SimulationSnapshot;
  simulationDiff: SimulationDiff;
  monthlyEvents: LifeEvent[];
  monthlyNews: NewsItem[];
  decisions: PendingDecision[];
  consequences: ConsequenceHistoryEntry[];
}

export type DelayedConsequenceStatus = 'Pending' | 'Executed' | 'Cancelled' | 'Failed';

export interface DelayedConsequence {
  id: string;
  executeAtMonth: number;
  executeAtYear: number;
  scheduledTick: number;
  executeTick: number;
  source: string;
  description: string;
  consequences: Consequence[];
  conditions?: StateCondition | ConditionGroup;
  decisionId?: string;
  eventId?: string;
  chainId?: string;
  status: DelayedConsequenceStatus;
  newsHeadline?: string;
}

export type ConsequenceTargetCategory =
  | 'PLAYER'
  | 'POWER'
  | 'FINANCE'
  | 'COMPANY'
  | 'INVESTMENT'
  | 'PROPERTY'
  | 'PROJECT'
  | 'POLITICS'
  | 'FAMILY'
  | 'RELATIONSHIP'
  | 'HEALTH'
  | 'CAREER'
  | 'REPUTATION'
  | 'SPORTS'
  | 'DYNASTY'
  | 'WORLD';

export interface Consequence {
  id?: string;
  type: string;
  target: ConsequenceTargetCategory;
  targetId?: string;
  property?: string;
  operation: ConsequenceOperation;
  value: number | string | boolean | any;
  duration?: number;
  description?: string;
  source?: string;
  decisionId?: string;
  eventId?: string;
  chainId?: string;
}

export interface ConsequenceResult {
  consequenceId: string;
  success: boolean;
  target: ConsequenceTargetCategory;
  targetId?: string;
  field: string;
  previousValue: any;
  newValue: any;
  change: string | number;
  description: string;
  warnings: string[];
  followUpTriggers: string[];
  recordedInHistory: boolean;
}

export type DecisionRiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type DecisionUrgency = 'Critical' | 'Urgent' | 'Standard' | 'Immediate' | 'Low' | 'High' | 'Normal';

export interface PendingDecision {
  id: string;
  category: 'Business' | 'Career' | 'Politics' | 'Investment' | 'Family' | 'Ethics' | 'Sports' | 'Finance' | 'Life' | 'Health' | 'Dynasty' | 'Debt';
  title: string;
  description: string;
  contextData?: string;
  urgency: DecisionUrgency;
  priority?: number;
  eventTypeKey?: string;
  entityId?: string;
  affectedEntity?: string;
  risk?: DecisionRiskLevel | 'Low' | 'Medium' | 'High' | 'Critical';
  potentialUpside?: string;
  potentialDownside?: string;
  canBePostponed?: boolean;
  postponeCount?: number;
  createdMonth?: number;
  createdYear?: number;
  createdTick?: number;
  createdDate?: string;
  expiresInMonths?: number;
  expiresAtTick?: number;
  minPowerTier?: PowerTier;
  maxPowerTier?: PowerTier;
  minLifeTier?: LifeTier;
  maxLifeTier?: LifeTier;
  expirationConsequences?: Consequence[];
  expirationEventHeadline?: string;
  expirationEventDescription?: string;
  options: {
    id: string;
    label: string;
    description: string;
    cost?: number;
    risk: 'Low' | 'Medium' | 'High';
    timeHorizon: string;
    projectedOutcome: string;
    handlerKey: string;
    consequences?: Consequence[];
    delayedConsequences?: {
      delayMonths: 1 | 3 | 6 | 12 | number;
      source?: string;
      description: string;
      consequences: Consequence[];
      conditions?: StateCondition | ConditionGroup;
      customTargetDate?: { month: number; year: number };
    }[];
  }[];
}

export type DecisionOption = PendingDecision['options'][number];

export interface RiskResolutionResult {
  successProbability: number;
  isSuccess: boolean;
  baseProbability: number;
  modifiers: { label: string; value: number; formatted: string }[];
  positiveFactors?: string[];
  negativeFactors?: string[];
  consequences?: Consequence[];
  breakdownText: string;
}

export type NewsImportance = 'MINOR' | 'NORMAL' | 'MAJOR' | 'BREAKING';

export interface NewsItem {
  id: string;
  month: number;
  year: number;
  headline: string;
  body: string;
  category: 'World' | 'Business' | 'Economy' | 'Politics' | 'Sports' | 'Celebrity' | 'Tech' | 'Family' | 'Life';
  importance: NewsImportance;
  severity?: 'Info' | 'Positive' | 'Warning' | 'Breaking'; // Backwards compatibility
  impactExplanation?: string;
  relatedEventId?: string;
  relatedDecisionId?: string;
  sourceEntityId?: string;
  financialImpact?: number;
  source?: string;
  tags?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'Wealth' | 'Business' | 'Politics' | 'Sports' | 'Dynasty' | 'Career' | 'Life';
  icon: string;
  unlocked: boolean;
  unlockedAtAge?: number;
}

export type DecisionCategory =
  | 'Business'
  | 'Politics'
  | 'Wealth'
  | 'Life'
  | 'Family'
  | 'Projects'
  | 'Sports'
  | 'Health'
  | 'Philanthropy'
  | 'Career'
  | 'Education'
  | 'Controversial'
  | 'Succession'
  | 'Ethics'
  | 'Investment';

export type DecisionImportance = 'Minor' | 'Moderate' | 'Major' | 'Historic' | 'Critical';
export type DecisionRisk = 'Low' | 'Medium' | 'High' | 'Extreme';

export interface DecisionConsequenceData {
  cashChange?: number;
  netWorthChange?: number;
  healthChange?: number;
  happinessChange?: number;
  intelligenceChange?: number;
  stressChange?: number;
  attractivenessChange?: number;
  charmChange?: number;
  reputationChange?: number;
  worldInfluenceChange?: number;
  details?: string[];
  [key: string]: any;
}

export interface ScheduledConsequence {
  id: string;
  triggerMonth: number;
  triggerYear: number;
  description: string;
  category: string;
  effect: Record<string, any>;
  applied: boolean;
}

export type EventChainStatus = 'Active' | 'Completed' | 'Failed' | 'Paused';

export interface EventChainHistoryEntry {
  stageId: string;
  stageSequence: number;
  stageTitle: string;
  choiceId?: string;
  choiceLabel?: string;
  month: number;
  year: number;
  tick: number;
  outcomeDescription?: string;
}

export interface EventChainStage {
  id: string;
  sequence: number;
  title: string;
  description: string;
  conditions?: StateCondition | ConditionGroup;
  choices: SimulationEventChoice[];
  consequences?: Consequence[];
  nextStage?: string;
  failureStage?: string;
  successStage?: string;
  delayMonths?: number;
}

export interface EventChain {
  id: string;
  name: string;
  category: SimulationEventCategory;
  currentStage: string | number;
  status: EventChainStatus;
  startedMonth: number;
  startedYear: number;
  variables: Record<string, any>;
  history: EventChainHistoryEntry[];
  parentEventId?: string;
  delayUntilTick?: number;
  stages?: EventChainStage[];
}

export interface EventCooldownRecord {
  eventType: string;
  entityId: string; // e.g. 'company_1', 'rel_spouse', 'global'
  lastTriggeredMonth: number;
  lastTriggeredYear: number;
  lastTriggeredTick: number;
  cooldownMonths: number;
  expiresAtTick: number;
}

export interface EventControlConfig {
  maxActiveDecisions: number;
  maxActivePerCategory: Record<string, number>;
  categoryMonthlyEventLimits: Record<string, number>;
  globalCooldowns: Record<string, number>; // default cooldowns in months by eventType
}

export interface EventControlState {
  cooldowns: EventCooldownRecord[];
  monthlyCategoryCounters: Record<string, number>;
  expiredEventsCount: number;
  config: EventControlConfig;
}

export interface DecisionHistoryEntry {
  readonly id: string;
  readonly month: number;
  readonly year: number;
  readonly category: DecisionCategory | string;
  readonly title: string;
  readonly description: string;
  readonly decisionId?: string;
  readonly optionId?: string;
  readonly optionLabel?: string;
  readonly immediateConsequences?: DecisionConsequenceData | Record<string, any>;
  readonly scheduledConsequences?: ScheduledConsequence[];
  readonly affectedEntities?: string[];
  readonly risk?: DecisionRisk | string;
  readonly result?: string;
  readonly success?: boolean;
  readonly importance?: DecisionImportance | string;
  readonly relatedEventId?: string;
  readonly chainId?: string;
}

export interface ConsequenceHistoryEntry {
  readonly id: string;
  readonly month: number;
  readonly year: number;
  readonly source: string;
  readonly category: string;
  readonly description: string;
  readonly affectedEntity?: string;
  readonly valueBefore?: number | string;
  readonly valueAfter?: number | string;
  readonly change?: number | string;
  readonly relatedDecisionId?: string;
  readonly relatedEventId?: string;
  readonly delayed?: boolean;
  readonly resolved?: boolean;
}

export interface ChallengeScenario {
  id: string;
  title: string;
  description: string;
  initialCash: number;
  initialAge: number;
  targetGoal: string;
  targetConditionDesc: string;
  difficulty: GameDifficulty;
  completed: boolean;
}

// Phase 19: Dynamic Objective & Campaign System Types
export type ObjectiveCategory = 
  | 'Wealth' 
  | 'Business' 
  | 'Projects' 
  | 'Politics' 
  | 'Global' 
  | 'Philanthropy' 
  | 'Dynasty' 
  | 'Lifestyle' 
  | 'Sports' 
  | 'Special';

export type ObjectiveStatus = 'In Progress' | 'Completed' | 'Failed' | 'Locked';

export interface ObjectiveSubGoal {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  formattedCurrent: string;
  formattedTarget: string;
  percentage: number; // 0 to 100
  isCompleted: boolean;
  status: ObjectiveStatus;
}

export interface GameObjective {
  id: string;
  title: string;
  tagline?: string;
  category: ObjectiveCategory;
  description: string;
  targetGoal: string;
  iconName: string;
  
  // Real Game State Metric Calculation
  currentValue: number;
  targetValue: number;
  formattedCurrent: string;
  formattedTarget: string;
  unit?: string;
  percentage: number; // 0 to 100
  status: ObjectiveStatus;
  
  // Composite Sub-goals for multi-condition goals (e.g. THE BALANCED LIFE, THE GLOBALIST)
  subGoals?: ObjectiveSubGoal[];
  
  // Campaign association
  isCampaignGoal?: boolean;
  campaignId?: string;
  minLifeTier?: LifeTier;
  targetLifeTier?: LifeTier;
  completedAtTick?: number;
  completedAtYear?: number;
  completedAtMonth?: number;
  rewardClaimed?: boolean;
  rewardDescription?: string;
}

export interface CampaignDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  badge: string;
  difficulty: GameDifficulty;
  primaryObjectiveId: string;
  secondaryObjectiveIds: string[];
  initialCash?: number;
  initialAge?: number;
  initialBackground?: string;
  specialPerk?: string;
  sandboxCompatible: boolean;
}

// Phase 18: Complete Dynasty & Legacy System Types
export type PropertyDistributionStrategy = 
  | 'Primary Heir Inherits All' 
  | 'Equally Distributed Among Children' 
  | 'Transferred to Family Trust' 
  | 'Liquidated into Cash Estate';

export type BusinessSuccessionStrategy =
  | 'Sole Executive Control'
  | 'Equal Board Voting Power'
  | 'Appoint External Professional CEO'
  | 'Family Trust Managed Holding';

export type PoliticalHandoverStrategy =
  | 'Direct Dynastic Endorsement'
  | 'PAC War Chest Transfer'
  | 'Party Patronage Backing'
  | 'Independent / Neutral Path';

export interface FinancialInheritanceSplit {
  primaryHeirPercent: number; // e.g. 60
  otherChildrenPercent: number; // e.g. 25
  philanthropyPercent: number; // e.g. 10
  familyTrustReservePercent: number; // e.g. 5
}

export interface DynastySuccessionPlan {
  primaryHeirId: string | null;
  businessSuccessorId: string | null;
  politicalSuccessorId: string | null;
  businessStrategy: BusinessSuccessionStrategy;
  propertyStrategy: PropertyDistributionStrategy;
  financialInheritance: FinancialInheritanceSplit;
  politicalStrategy: PoliticalHandoverStrategy;
  lastUpdatedTick?: number;
}

export type DynastyTimelineCategory = 
  | 'FOUNDING'
  | 'ACQUISITION'
  | 'PROJECT'
  | 'POLITICAL'
  | 'FAMILY_MILESTONE'
  | 'SCANDAL'
  | 'SUCCESSION'
  | 'PHILANTHROPY'
  | 'CRISIS';

export interface DynastyTimelineEvent {
  id: string;
  month: number;
  year: number;
  generation: number;
  characterName: string;
  category: DynastyTimelineCategory;
  title: string;
  description: string;
  significance: 'Historic' | 'Major' | 'Notable';
  metricsChange?: string;
}

export type SuccessionOutcomeType = 
  | 'Triumphant Coronation'
  | 'Smooth Transition'
  | 'Contested Will'
  | 'Family Schism'
  | 'Corporate Fragmentation'
  | 'Litigious Crisis';

export interface SuccessionHistoryRecord {
  id: string;
  generation: number;
  predecessorName: string;
  successorName: string;
  month: number;
  year: number;
  outcome: SuccessionOutcomeType;
  dynastyWealth: number;
  companiesTransferred: number;
  propertiesTransferred: number;
  legacyScore: number;
  legacyGrade: string;
  details: string[];
  rivalHeirConflict?: string;
  businessFragmentationRate?: number; // % corporate valuation loss or discount
}

export interface DynastyProfile {
  dynastyName: string;
  motto: string;
  crestIcon: string;
  foundedYear: number;
  foundedMonth: number;
  founderName: string;
  currentGeneration: number;
  dynastyWealth: number;
  dynastyReputation: number; // 0-100
  dynastyStability: number; // 0-100 (Household harmony + heir loyalty)
  dynastyCompaniesCount: number;
  dynastyPropertiesCount: number;
  politicalInfluenceScore: number; // 0-100
  majorAchievements: string[];
  majorFailures: string[];
  successionPlan: DynastySuccessionPlan;
  successionHistory: SuccessionHistoryRecord[];
  timeline: DynastyTimelineEvent[];
}

export interface LegacyScorecard {
  wealthScore: number; // 0-100
  businessScore: number; // 0-100
  familyScore: number; // 0-100
  healthScore: number; // 0-100
  reputationScore: number; // 0-100
  politicsScore: number; // 0-100
  philanthropyScore: number; // 0-100
  achievementsScore: number; // 0-100
  stabilityScore: number; // 0-100
  totalLegacyScore: number; // 0 - 1000
  legacyGrade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  legacyTitle: string; // e.g. "The Sovereign Architect", "The Gilded Patriarch", "The Visionary Reformer"
}

export interface LegacyReport {
  id: string;
  characterName: string;
  generation: number;
  ageAtDeath: number;
  birthYear: number;
  deathYear: number;
  yearsActive: number;
  lifeSummary: string;
  
  // Categorical Legacies
  financialLegacy: {
    peakNetWorth: number;
    finalNetWorth: number;
    lifetimePhilanthropy: number;
    cashPassedOn: number;
    realEstateValue: number;
    commentary: string;
  };
  businessLegacy: {
    companiesFoundedOrLed: number;
    totalCompanyValuation: number;
    peakEmployees: number;
    landmarkDeals: string[];
    commentary: string;
  };
  politicalLegacy: {
    highestOfficeHeld: string;
    politicalCapitalAtPeak: number;
    majorPoliciesEnacted: string[];
    partyInfluence: string;
    commentary: string;
  };
  familyLegacy: {
    spouseName?: string;
    childrenCount: number;
    householdHarmony: number;
    heirAppointedName: string;
    dynastyStabilityScore: number;
    commentary: string;
  };

  majorAchievements: string[];
  majorFailures: string[];
  majorDecisions: {
    title: string;
    category: string;
    importance: string;
    year: number;
    outcome: string;
  }[];

  reputation: number;
  worldInfluence: number;
  scores: LegacyScorecard;
  generatedAtTick: number;
}

export interface SaveSlot {
  slotId: string;
  title: string;
  savedAt: string;
  characterName: string;
  age: number;
  cash: number;
  netWorth: number;
  careerTitle: string;
  gameMode: GameMode;
  difficulty: GameDifficulty;
  saveVersion?: number;
  gameState: GameState;
}

export interface LivingBankingProfile {
  version:number;
  accountProducts: Record<string,{annualRate:number; fee:number; liquidity:'INSTANT'|'LIMITED'|'LOCKED'; insuranceLimit:number; notes:string[]}>;
  relationshipScores: Record<string,number>;
  creditLines: Record<string,{limit:number; used:number; rate:number}>;
  monthlyEvents: {tick:number; bankId:string; title:string; narrative:string; severity:'INFO'|'WARNING'|'CRISIS'}[];
  totalInterestReceived:number;
}

export type GovernmentMinistry = 'Finance' | 'Foreign Affairs' | 'Health' | 'Education' | 'Defence' | 'Infrastructure' | 'Energy' | 'Justice' | 'Commerce' | 'Labour' | 'Environment';
export type GovernmentOfficeLevel = 'MUNICIPAL' | 'REGIONAL' | 'NATIONAL';
export interface GovernmentCivilServant { id:string; npcId:string; name:string; ministry:GovernmentMinistry; role:string; grade:number; competence:number; loyalty:number; integrity:number; salary:number; morale:number; status:'ACTIVE'|'SUSPENDED'|'RESIGNED'; }
export interface GovernmentMinistryState { id:string; name:GovernmentMinistry; ministerNpcId?:string; permanentSecretaryNpcId?:string; budget:number; capacity:number; morale:number; policyPriority:string; headcount:number; }
export interface ParliamentaryMember { id:string; npcId:string; name:string; partyId:string; constituency:string; ideology:string; loyalty:number; influence:number; committee:string; attendance:number; }
export interface ParliamentaryBill { id:string; title:string; sponsorNpcId:string; sponsorName:string; chamber:'PARLIAMENT'|'COUNCIL'; status:'INTRODUCED'|'DEBATING'|'VOTING'|'PASSED'|'REJECTED'|'VETOED'; supportFor:number; supportAgainst:number; fiscalCost:number; policyArea:string; }
export interface GovernmentBudgetState { fiscalYear:number; totalRevenue:number; totalExpenditure:number; deficit:number; debt:number; taxRate:number; departmentAllocations:Record<string,number>; publicInvestment:number; welfareSpending:number; defenceSpending:number; }
export interface PublicProject { id:string; name:string; category:'INFRASTRUCTURE'|'HEALTH'|'EDUCATION'|'HOUSING'|'TRANSPORT'|'ENERGY'|'DIGITAL'; jurisdiction:string; budget:number; spent:number; progress:number; jobsCreated:number; status:'PLANNED'|'ACTIVE'|'COMPLETED'|'CANCELLED'; }
export interface ProcurementContract { id:string; title:string; ministry:GovernmentMinistry; companyId?:string; supplierName:string; value:number; durationMonths:number; status:'TENDER'|'AWARDED'|'ACTIVE'|'COMPLETED'|'CANCELLED'; integrityRisk:number; }
export interface GovernmentScandal { id:string; title:string; severity:'MINOR'|'MAJOR'|'CRISIS'; involvedNpcIds:string[]; ministry?:GovernmentMinistry; approvalImpact:number; resolved:boolean; }
export interface ProtestStrike { id:string; type:'PROTEST'|'STRIKE'; title:string; group:string; intensity:number; participants:number; approvalImpact:number; active:boolean; }
export interface DemographicApproval { group:string; approval:number; weight:number; }
export interface DiplomaticRelation { countryId:string; countryName:string; relationship:number; tradeAlignment:number; securityAlignment:number; trust:number; activeTreaties:string[]; disputes:string[]; }
export interface GovernmentLivingProfile { version:number; level:GovernmentOfficeLevel; machinery?: import('./engine/governmentMachineryEngine').GovernmentMachineryState; ministries:GovernmentMinistryState[]; civilServants:GovernmentCivilServant[]; parliamentarians:ParliamentaryMember[]; bills:ParliamentaryBill[]; budget:GovernmentBudgetState; projects:PublicProject[]; procurement:ProcurementContract[]; scandals:GovernmentScandal[]; protestsStrikes:ProtestStrike[]; demographics:DemographicApproval[]; diplomacy:DiplomaticRelation[]; lobbyingPressure:Record<string,number>; centralBank:{independence:number; policyRate:number; inflationTarget:number; lastDecision:string; policyHistory:{tick:number;rate:number;reason:string}[]}; election:{nextElectionTick:number; turnout:number; incumbentSupport:number; oppositionMomentum:number}; governmentHistory:{tick:number;title:string;narrative:string;category:'POLICY'|'ELECTION'|'SCANDAL'|'ECONOMY'|'DIPLOMACY'|'PROTEST'|'PROCUREMENT';}[]; }

export interface PoliticalGovernanceProfile {
  version:number; campaigns:{id:string;office:string;jurisdiction:string;budget:number;polling:number;status:'ACTIVE'|'WON'|'LOST'|'WITHDRAWN';startedTick:number}[];
  publicBudgets:Record<string,number>; serviceLevels:Record<string,number>;
  approvalHistory:{tick:number;approval:number;office:string}[];
  policyHistory:{tick:number;office:string;area:string;decision:string;effect:string}[];
  publicEvents:{tick:number;title:string;narrative:string;severity:'INFO'|'WARNING'|'CRISIS'}[];
  officePowers:Record<string,string[]>;
}


export interface RealEstateIndustryState {
  version:number;
  agents:{id:string;name:string;agency:string;city:string;country:string;reputation:number;dealVolume:number;commissionRate:number}[];
  propertyManagers:{id:string;name:string;company:string;city:string;country:string;reputation:number;managedUnits:number;occupancyRate:number}[];
  tenants:{id:string;name:string;type:'RESIDENTIAL'|'COMMERCIAL';creditQuality:number;income:number;reliability:number;activeLeaseId:string|null}[];
  mortgages:{id:string;propertyId:string;principal:number;remainingBalance:number;interestRateAnnual:number;termMonthsRemaining:number;monthlyPayment:number;lender:string;status:'ACTIVE'|'PAID_OFF'|'DEFAULT'}[];
  contractors:{id:string;name:string;city:string;country:string;reputation:number;capacity:number;quality:number;backlog:number}[];
  professionals:{id:string;name:string;discipline:'Architecture'|'Engineering';reputation:number;capacity:number}[];
  permits:{id:string;projectId:string;type:string;authority:string;status:'SUBMITTED'|'APPROVED'|'REJECTED';monthsPending:number}[];
  inspections:{id:string;projectId:string;type:string;status:'SCHEDULED'|'PASSED'|'FAILED';score:number}[];
  auctions:{id:string;assetId:string;reservePrice:number;currentBid:number;bidderCount:number;type:'VOLUNTARY'|'DISTRESSED';status:'OPEN'|'SOLD'|'CANCELLED';monthsOpen:number}[];
  distressedAssets:{id:string;assetId:string;reason:string;discountPercent:number;status:'WATCH'|'LISTED'|'SOLD'}[];
  taxes:{id:string;propertyId:string;annualAmount:number;status:'CURRENT'|'OVERDUE'}[];
  insurancePolicies:{id:string;propertyId:string;provider:string;annualPremium:number;coverageAmount:number;status:'ACTIVE'|'LAPSED'}[];
  commercialLeases:{id:string;propertyId:string;tenantId:string;monthlyRent:number;termMonthsRemaining:number;escalationAnnual:number;status:'ACTIVE'|'EXPIRED'|'TERMINATED'}[];
  reits:{id:string;name:string;strategy:'Income'|'Growth'|'Mixed';aum:number;occupancy:number;leverage:number;dividendYield:number}[];
  jvs:{id:string;projectId:string;partnerName:string;equity:number;sharePercent:number;status:'ACTIVE'|'EXITED'}[];
  spvs:{id:string;projectId:string;name:string;entityStatus:'ACTIVE'|'WOUND_DOWN';bankAccountBalance:number;debt:number}[];
  developmentFinancing:{id:string;projectId:string;lender:string;amount:number;drawn:number;interestRateAnnual:number;status:'COMMITTED'|'ACTIVE'|'REPAID'|'CANCELLED'}[];
  preSales:{id:string;projectId:string;buyerName:string;value:number;status:'RESERVED'|'COMPLETED'|'CANCELLED'}[];
  constructionContracts:{id:string;projectId:string;contractorId:string;value:number;progress:number;status:'ACTIVE'|'COMPLETED'|'TERMINATED';variationReserve:number}[];
  companyEmployees:{id:string;companyId:string;npcId?:string;name:string;role:string;salaryMonthly:number;performance:number;morale:number;status:'ACTIVE'|'ON_LEAVE'|'EXITED'}[];
  industryHistory:{tick:number;month:number;year:number;title:string;narrative:string;significance:'INFO'|'MAJOR'|'CRISIS'}[];
  lastProcessedTick:number;
}

export type WorldEnginePriority = 'CRITICAL'|'HIGH'|'NORMAL'|'LOW'|'BACKGROUND';
export interface WorldEngineRegistration { id:string; name:string; priority:WorldEnginePriority; dependsOn:string[]; health:'HEALTHY'|'DEGRADED'|'PAUSED'; lastTick:number; relevance:number; }
export interface WorldGovernorCheckpoint { id:string; tick:number; month:number; year:number; createdAt:string; stateDigest:string; stateSnapshot:any; }
export interface WorldGovernorState {
  version:number;
  mode:'AUTONOMOUS'|'PLAYER_FOCUS';
  processedTicks:number;
  simulationsRun:number;
  decisionsSuppressed:number;
  eventsSuppressed:number;
  criticalSignals:string[];
  systemHealth:Record<string,any>;
  lastAuditTick:number;
  playerIntent:{riskTolerance:number;preferredIndustries:string[];policyPreferences:string[];capitalAllocationBias:'CONSERVATIVE'|'BALANCED'|'AGGRESSIVE'};
  engineRegistry?:WorldEngineRegistration[];
  dependencyGraph?:Record<string,string[]>;
  enginePriorities?:Record<string,WorldEnginePriority>;
  adaptiveLod?:'FULL'|'BALANCED'|'ECONOMY'|'DEEP_BACKGROUND';
  activeEngineIds?:string[];
  interestSignals?:{key:string;score:number;reason:string}[];
  importanceQueue?:{id:string;score:number;kind:'EVENT'|'NEWS'|'DECISION';summary:string}[];
  compressedHistory?:{fromTick:number;toTick:number;events:number;decisions:number;summary:string}[];
  checkpoints?:WorldGovernorCheckpoint[];
  anomalyCount?:number;
  lastAnomaly?:string;
  lastGovernanceAction?:string;
  lastGovernanceTick?:number;
  lastCheckpointTick?:number;
  coordinationVersion?:number;
  feedbackLoops?:{id:string;source:string;target:string;signal:number;direction:'POSITIVE'|'NEGATIVE'|'NEUTRAL';narrative:string}[];
  playerActionJournal?:{tick:number;actionType:string;summary:string;affectedSystems:string[];importance:number}[];
  reconciliationLog?:{tick:number;conflicts:number;resolved:number;summary:string}[];
  engineMessageBus?:{tick:number;source:string;target:string;signal:string;weight:number}[];
}

export interface GameState {
  version: string;
  saveVersion?: number;
  gameMode: GameMode;
  difficulty: GameDifficulty;
  currentMonth: number; // 1-12
  currentYear: number;
  simulationTick: number; // total elapsed months
  
  // Character
  character: {
    id: string;
    firstName: string;
    lastName: string;
    gender: 'Male' | 'Female' | 'Non-binary';
    birthMonth: number;
    birthYear: number;
    age: number;
    avatarSeed: string;
    attributes: CharacterAttributes;
    education?: string;
    occupation?: string;
    intelligence?: number;
    reputation?: number;
    health?: number;
    stress?: number;
    happiness?: number;
    birthCity: string;
    birthCountry: string;
    residenceCity: string;
    residenceCountry: string;
    lifeStage: LifeStage;
    creditScore: number; // 300 - 850
    socialFollowers: number;
    socialSentiment: number; // 0-100
    hobbies: string[];
    possessions: {
      homesCount: number;
      vehicles: string[];
      luxuries: string[];
    };
    lifeGoals: { id: string; text: string; completed: boolean }[];
  };

  // Systems
  education: EducationRecord[];
  currentJob: JobRecord | null;
  careerHistory: JobRecord[];
  
  relationships: RelationshipPerson[];
  familyTree: RelationshipPerson[];
  
  finances: {
    cash: number;
    accounts: BankAccount[];
    loans: Loan[];
    stocks: StockAsset[];
    properties: RealEstateProperty[];
    monthlyBaseExpenses: number;
  };
  
  companies: Company[];
  
  politics: {
    currentOffice: PoliticalOffice;
    parties: PoliticalParty[];
    selectedPartyId: string | null;
    pastOffices: string[];
    nationalPolicies: {
      taxBracket: 'Low Enterprise' | 'Balanced Moderate' | 'High Social Support';
      healthcareSpending: 'Budget' | 'Universal' | 'Advanced Medical Tech';
      educationInvestment: 'Standard' | 'High STEM' | 'Free Higher Ed';
      infrastructureFocus: 'Green Energy' | 'Transport & Rail' | 'Smart Cities';
      defenceLevel: 'Peacekeeping' | 'Standard' | 'Global Superpower';
    };
  };

  sports: {
    personalAthleteCareer?: {
      sport: string;
      isPro: boolean;
      skillLevel: number;
      championshipsWon: number;
      salaryMonthly: number;
    };
    ownedTeams: SportsTeam[];
  };

  projects: MajorProject[];
  
  world: CountryState[];
  currentCountryIndex: number;
  
  eventsFeed: LifeEvent[];
  pendingDecisions: PendingDecision[];
  newsArchive: NewsItem[];
  achievements: Achievement[];
  
  analyticsHistory: {
    month: number;
    year: number;
    age: number;
    netWorth: number;
    cash: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    health: number;
    stress: number;
    reputation: number;
    worldInfluence: number;
  }[];

  dynastyGeneration: number;
  dynastyHeirId: string | null;
  activeChallengeId: string | null;

  // Historical Records & Schedulers (Phase 3, Phase 6 & Phase 8)
  decisionHistory: DecisionHistoryEntry[];
  consequenceHistory: ConsequenceHistoryEntry[];
  delayedConsequences: DelayedConsequence[];
  activeEventChains: EventChain[];
  completedEventChains: EventChain[];

  // Event Control & Spam Prevention System (Phase 9)
  eventControlState: EventControlState;

  // Player Power Profile & Tiers (Phase 10)
  playerPowerProfile: PlayerPowerProfile;

  // Phase 18: Dynasty & Legacy Engine
  dynastyProfile?: DynastyProfile;
  peakNetWorth?: number;
  lifetimePhilanthropy?: number;
  activeLegacyReport?: LegacyReport | null;

  // Phase 19: Dynamic Objectives & Campaign System
  activeCampaignId?: string | null;
  isSandboxMode?: boolean;
  pinnedObjectiveId?: string | null;
  completedObjectiveIds?: string[];
  claimedObjectiveRewardIds?: string[];

  // Phase 20: Comprehensive System Snapshots for diffing & persistence
  simulationSnapshots?: SimulationSnapshot[];

  // Life Mode & Systems State Container
  lifeSystem?: LifeSystemState;

  // Expansion 1A: Persistent Life Progression & Tier System
  lifeProgression?: LifeProgressionProfile;

  // Expansion 1B: Deep Life Simulation & Tier-Specific Gameplay
  lifeGameplay?: LifeGameplayProfile;

  // Expansion 1E: Advanced Personalities & Emergent Narrative
  emergentNarrative?: EmergentNarrativeProfile;

  // Expansion 1D: Living World & Autonomous Simulation Profile
  livingWorld?: LivingWorldProfile;

  // Expansion 2: Professional Power, Wealth, Property, Business, Law, Government & Global Strategy
  financialLedger?: FinancialLedgerRecord;
  bankingProfile?: BankingSystemProfile;
  creditProfileState?: PlayerCreditProfileState;
  investmentMarket?: InvestmentMarketState;
  propertyPortfolio?: PropertySystemState;
  realEstatePlatform?: RealEstatePlatformState;
  realEstateIndustry?: RealEstateIndustryState;
  worldGovernor?: WorldGovernorState;
  legalProfile?: LegalSystemProfile;
  governmentOffice?: GovernmentOfficeState;
  expandedCareer?: ExpandedCareerProfile;
  corporateSystem?: CorporateSystemState;
  corporateDeepSimulation?: CorporateDeepSimulationState;
  corporateCapitalMarkets?: CorporateCapitalMarketsState;
  corporateManagement?: CorporateManagementState;
  livingWealth?: LivingWealthState;
  livingBanking?: LivingBankingProfile;
  politicalGovernance?: PoliticalGovernanceProfile;
  governmentLiving?: GovernmentLivingProfile;

  personalManagement?: PersonalManagementProfile;
  taxSystem?: TaxSystemProfile;
  justiceWorld?: JusticeWorldProfile;

  // Expansion 2 Test & Alias state wrappers
  month?: number;
  year?: number;
  time?: { month: number; year: number; tick?: number };
  realEstate?: any[];
  vehicles?: any[];
  inventory?: any[];
  loans?: any[];
  expansion2FinancialLedger?: any;
  expansion2BankingCredit?: any;
  expansion2Government?: any;
  expansion2Legal?: any;
  expansion2Career?: any;
  expansion2Property?: any;
  expansion2PropertySystem?: any;
  expansion2Investment?: any;
  expansion2InvestmentMarket?: any;
  expansion2Corporate?: any;
  expansion2CorporateSystem?: any;
}

// -------------------------------------------------------------
// LIFE MODE EXPANSION TYPES
// -------------------------------------------------------------

export interface CharacterPersonality {
  ambition: number; // 0-100
  confidence: number; // 0-100
  discipline: number; // 0-100
  sociability: number; // 0-100
  creativity: number; // 0-100
  empathy: number; // 0-100
  leadership: number; // 0-100
  patience: number; // 0-100
  riskTolerance: number; // 0-100
}

export interface MonthlyTimeAllocation {
  // Primary 720-hour Life Operating System allocations
  careerHours: number;
  partnerHours: number;
  entrepreneurshipHours: number;
  // Legacy granular fields retained for backward compatibility and mirrored from the primary allocations
  workHours: number; // baseline contract hours (e.g. 160)
  overtimeHours: number; // optional overtime (0 - 40)
  educationHours: number; // scheduled class/lecture hours
  studyHours: number; // homework, revision, research
  fitnessHours: number; // gym, running, training
  familyHours: number; // family dinners, parenting, quality time
  datingHours: number; // romance, dates, courtship
  friendsHours: number; // social outings, gatherings
  socialMediaHours: number; // content creation, posting
  hobbiesHours: number; // creative pursuits, gaming, reading
  wellnessHours: number; // spa, meditation, therapy, rest
}

export interface MonthlyTimeBudget {
  totalMonthlyHours: number; // standard 720h total in a month
  sleepAndRoutineHours: number; // ~240h sleep + 80h basic human maintenance = 320h
  discretionaryCapacityHours: number; // ~400 hours available for allocation
  allocatedHours: number;
  remainingHours: number;
  utilizationPercentage: number; // % of discretionary capacity
  burnoutRisk: 'None' | 'Mild' | 'Moderate' | 'Severe' | 'Critical';
}

export interface LifeBiographyEntry {
  id: string;
  ageYears: number;
  ageMonths: number;
  month: number;
  year: number;
  category: 'Birth' | 'Education' | 'Career' | 'Romance' | 'Family' | 'Wealth' | 'Lifestyle' | 'Achievement' | 'Milestone' | 'Crisis';
  title: string;
  description: string;
  iconName?: string;
  significance: 'Minor' | 'Notable' | 'Major' | 'Historic';
}

export interface UniversityProgram {
  id: string;
  name: string;
  degreeLevel: 'Bachelor' | 'Master' | 'PhD' | 'Diploma' | 'Certification';
  field: string;
  durationMonths: number;
  tuitionPerMonth: number;
  difficulty: number; // 0-100
  requiredIntelligence: number;
  intellectGainPerMonth: number;
  reputationGainTotal: number;
  careerBoostFields: string[];
}

export interface UniversityInstitution {
  id: string;
  name: string;
  country: string;
  city: string;
  prestige: number; // 0-100
  academicQuality: number; // 0-100
  researchStrength: number; // 0-100
  networkingStrength: number; // 0-100
  careerPlacementRate: number; // 0-100 %
  admissionDifficulty: number; // 0-100
  accommodationCostMonthly: number;
  studentLifeScore: number; // 0-100
  badge: string;
  programs: UniversityProgram[];
  description: string;
}

export interface UniversityApplication {
  id: string;
  universityId: string;
  programId: string;
  appliedMonth: number;
  appliedYear: number;
  status: 'Pending' | 'Accepted' | 'Conditional' | 'Rejected' | 'Scholarship Offered';
  scholarshipAmountMonthly?: number;
  decisionMonth: number;
  decisionYear: number;
}

export interface ColleaguePerson {
  id: string;
  name: string;
  role: string;
  tier: 'Executive' | 'Division Head' | 'Manager' | 'Supervisor' | 'Peer' | 'Subordinate';
  department: string;
  age: number;
  personality: string;
  trust: number; // 0-100
  respect: number; // 0-100
  relationshipWithPlayer: number; // 0-100
  ambition: number; // 0-100
  competence: number; // 0-100
  avatarSeed: string;
}

export interface WorkplaceProfile {
  companyName: string;
  industry: string;
  department: string;
  workplaceCulture: 'Collaborative' | 'Competitive Cutthroat' | 'Bureaucratic' | 'Innovative Fast-Paced';
  managerName: string;
  managerTrust: number; // 0-100
  managerRespect: number; // 0-100
  managerPerception: number; // 0-100
  supervisorName: string;
  colleagues: ColleaguePerson[];
  teamMorale: number; // 0-100
  teamPerformance: number; // 0-100
  monthlyOvertimeHours: number;
  remoteWorkApproved: boolean;
}

export interface DatingProfile {
  bio: string;
  relationshipGoal: 'Casual Dating' | 'Long-Term Partnership' | 'Marriage & Family' | 'Networking / Open';
  interests: string[];
  lifestyleStyle: 'Active & Athletic' | 'Intellectual & Scholarly' | 'Luxury & Jetset' | 'Artistic & Creative' | 'Career Focused';
  minAge: number;
  maxAge: number;
  preferredLocation: string;
  isActive: boolean;
}

export interface DatingCandidate {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Non-binary';
  occupation: string;
  education: string;
  personality: string;
  interests: string[];
  lifestyle: string;
  wealthLevel: 'Modest' | 'Comfortable' | 'Affluent' | 'High Net Worth' | 'Dynastic Wealth';
  relationshipGoal: string;
  compatibilityScore: number; // 0-100
  location: string;
  avatarSeed: string;
  appearanceDescription: string;
  matched: boolean;
  messages: { sender: 'candidate' | 'player'; text: string; month: number; year: number }[];
}

export interface DateActivity {
  id: string;
  name: string;
  type: 'Coffee & Stroll' | 'Fine Dining' | 'Art Gallery & Museum' | 'Live Concert' | 'Cinema & Theatre' | 'Luxury Yacht / Getaway';
  cost: number;
  timeHours: number;
  romanticImpact: number;
  funScore: number;
  description: string;
}

export type MarketplaceCategory = 
  | 'Vehicles' 
  | 'Homes' 
  | 'Fashion' 
  | 'Watches & Jewellery' 
  | 'Tech & Gadgets' 
  | 'Collectibles' 
  | 'Experiences & Travel';

export interface MarketplaceAssetItem {
  id: string;
  category: MarketplaceCategory;
  subcategory?: string;
  name: string;
  brand: string;
  description: string;
  purchasePrice: number;
  monthlyMaintenance: number;
  depreciationAnnualRate: number; // %
  resaleValue: number;
  prestigeScore: number; // 0-100
  qualityScore: number; // 0-100
  rarity: 'Common' | 'Uncommon' | 'Exclusive' | 'Ultra Rare' | 'One-of-a-Kind';
  specs?: Record<string, string | number>;
  imageOrIcon?: string;
  purchased: boolean;
  purchasedMonth?: number;
  purchasedYear?: number;
  isEquippedOrActive?: boolean;
  storeId?: string;
  storeName?: string;
  storeTier?: 'ORDINARY'|'PREMIUM'|'LUXURY'|'ULTRA_LUXURY';
  offerTick?: number;
  ownershipId?: string;
  useActions?: string[];
  effectProfile?: { happiness?:number; stress?:number; health?:number; reputation?:number; intelligence?:number; social?:number };
  location?: string;
  condition?: number;
  usageHours?: number;
  passengerCapacity?: number;
}

export type SocialPlatformType = 'PULSE' | 'VISTA' | 'LINKUP' | 'STREAM' | 'CIRCLE';

export interface SocialMediaAccount {
  platform: SocialPlatformType;
  handle: string;
  name: string;
  followers: number;
  following: number;
  engagementRate: number; // % e.g. 4.2%
  sentimentScore: number; // 0-100
  verified: boolean;
  monetized: boolean;
  monthlyAdRevenue: number;
  contentNiche: string;
}

export interface SocialMediaPost {
  id: string;
  platform: SocialPlatformType;
  month: number;
  year: number;
  content: string;
  topic: string;
  likes: number;
  shares: number;
  commentsCount: number;
  reach: number;
  isViral: boolean;
  sentiment: 'Positive' | 'Neutral' | 'Controversial' | 'Negative';
}

export interface WellnessActivity {
  id: string;
  name: string;
  category: 'Fitness' | 'Mental' | 'Grooming' | 'Leisure' | 'Recovery';
  cost: number;
  timeHours: number;
  healthDelta: number;
  happinessDelta: number;
  stressDelta: number; // negative reduces stress
  charmDelta?: number;
  attractivenessDelta?: number;
  intelligenceDelta?: number;
  description: string;
}

export interface LifeSystemState {
  personality: CharacterPersonality;
  timeAllocation: MonthlyTimeAllocation;
  biography: LifeBiographyEntry[];
  universityApplications: UniversityApplication[];
  currentDegreeStatus?: {
    universityId: string;
    programId: string;
    gpa: number; // 0.0 - 4.0
    studyHoursMonthly: number;
    extracurriculars: string[];
    academicStanding: 'Distinction' | 'Good Standing' | 'Academic Probation';
  };
  workplace?: WorkplaceProfile;
  datingProfile: DatingProfile;
  datingCandidates: DatingCandidate[];
  marketplaceInventory: MarketplaceAssetItem[];
  socialAccounts: Record<SocialPlatformType, SocialMediaAccount>;
  socialPosts: SocialMediaPost[];
  activeLifestyleLevel: 'Frugal' | 'Comfortable' | 'Affluent' | 'Luxury Jetset' | 'Ultra High Net Worth';
  lifestyleExpensesMonthly: number;
  __allocationMigrated?: boolean;
  socialInteractionHistory?: SocialInteractionRecord[];
}

export interface SocialInteractionRecord { tick:number; withNpcId?:string; action:string; summary:string; }

export interface PersonalStaffRecord { id:string; npcId:string; name:string; role:string; monthlySalary:number; competence:number; loyalty:number; assignedPropertyIds:string[]; active:boolean; hiredTick:number; }
export interface PersonalManagementProfile { staff:PersonalStaffRecord[]; primaryResidenceId?:string; staffBudgetMonthly:number; maintenanceSavingsMonthly:number; householdServiceLevel:number; managementNotes:string[]; history:{tick:number;type:string;summary:string}[]; }
export interface TaxSystemProfile { authorityName:string; taxpayerId:string; estimatedAnnualIncome:number; estimatedAnnualTax:number; taxPaidYTD:number; taxCredits:number; filingStatus:'CURRENT'|'DUE'|'OVERDUE'|'UNDER_REVIEW'; lastAssessmentTick:number; auditRisk:number; history:{tick:number;type:string;amount:number;summary:string}[]; }
export interface JusticeWorldProfile { agencies:{id:string;name:string;type:string;city:string;reputation:number;capacity:number}[]; playerStatus:'FREE'|'UNDER_INVESTIGATION'|'ARRESTED'|'INCARCERATED'|'ON_BAIL'; charges:{id:string;title:string;severity:string;status:string;sentenceMonths:number;fine:number}[]; prison:{facility:string;gangId?:string;lettersSent:number;progression:number}; history:{tick:number;summary:string}[]; }

// -------------------------------------------------------------
// EXPANSION 1E: ADVANCED PERSONALITIES & EMERGENT NARRATIVE
// -------------------------------------------------------------

export interface AdvancedPersonality {
  ambition: number;      // 0 - 100: Pursuit of growth, hierarchy, authority
  riskTolerance: number; // 0 - 100: Tolerance for financial, legal & market variance
  loyalty: number;       // 0 - 100: Resistance to betrayal, commitment to pacts
  discipline: number;    // 0 - 100: Execution rigor, work ethic, impulse control
  aggression: number;    // 0 - 100: Willingness to attack rivals, compete ruthlessly
  empathy: number;       // 0 - 100: Compassion for subordinates, family, public
  pride: number;         // 0 - 100: Sensitivity to humiliation, need for respect
  caution: number;       // 0 - 100: Preference for risk-hedging, security reserves
  adaptability: number;  // 0 - 100: Resilience during structural market changes
  vanity: number;        // 0 - 100: Craving for fame, luxury visibility, status
  patience: number;      // 0 - 100: Willingness to play multi-year compounding games
  integrity: number;     // 0 - 100: Moral adherence, resistance to dirty tricks
}

export type PersonalityArchetype =
  | 'The Ambitious Builder'
  | 'The Loyal Ally'
  | 'The Calculating Opportunist'
  | 'The Aggressive Competitor'
  | 'The Careful Strategist'
  | 'The Power Broker'
  | 'The Family-First Patriarch'
  | 'The Family-First Matriarch'
  | 'The Vengeful Rival'
  | 'The Ethical Reformer'
  | 'The Quiet Operator'
  | 'The Visionary Titan'
  | 'The Pragmatic Realist';

export type NpcMotivationType =
  | 'SECURITY'
  | 'WEALTH'
  | 'STATUS'
  | 'POWER'
  | 'REVENGE'
  | 'RECOGNITION'
  | 'FAMILY'
  | 'LEGACY'
  | 'INDEPENDENCE'
  | 'CONTROL'
  | 'REDEMPTION'
  | 'SURVIVAL';

export interface NpcMotivation {
  type: NpcMotivationType;
  priority: number; // 1 (Highest) to 10
  source: string;
  targetEntityId?: string;
  description: string;
  durationMonthsRemaining?: number;
}

export interface NpcGoal {
  id: string;
  title: string;
  description: string;
  category: 'Career' | 'Business' | 'Financial' | 'Political' | 'Family' | 'Reputation' | 'Dynasty' | 'Rivalry';
  targetMetric: string;
  targetValue: number;
  currentValue: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'ABANDONED';
  progressPercent: number; // 0 - 100
  startedMonth: number;
  startedYear: number;
  completedMonth?: number;
  completedYear?: number;
}

export type MemorySignificance = 'Minor' | 'Moderate' | 'Major' | 'Historic';
export type MemoryPersistenceTier = 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM' | 'LANDMARK';

export interface NpcMemory {
  id: string;
  subject: string;
  eventType: 
    | 'BETRAYAL' 
    | 'SUPPORT' 
    | 'RESCUE' 
    | 'PARTNERSHIP' 
    | 'RIVALRY_CLASH' 
    | 'HUMILIATION' 
    | 'FAMILY_DISPUTE' 
    | 'VICTORY' 
    | 'ACQUISITION' 
    | 'POLITICAL_FAVOR' 
    | 'PROMOTION' 
    | 'GENEROSITY' 
    | 'INSULT' 
    | 'LEADERSHIP';
  participants: string[];
  significance: MemorySignificance;
  persistenceTier: MemoryPersistenceTier;
  emotionalImpact: number; // -100 to +100
  sentimentDelta: {
    trust?: number;
    respect?: number;
    affection?: number;
    fear?: number;
    resentment?: number;
    loyalty?: number;
  };
  month: number;
  year: number;
  decayMonthsRemaining: number; // -1 for LANDMARK (never decays)
  description: string;
}

export interface RelationshipSentiment {
  trust: number;       // 0 - 100
  respect: number;     // 0 - 100
  affection: number;   // 0 - 100
  fear: number;        // 0 - 100
  resentment: number;  // 0 - 100
  dependency: number;  // 0 - 100
  loyalty: number;     // 0 - 100
  competition: number; // 0 - 100
  descriptor: string;  // e.g., "Respected Adversary", "Strategic Ally", "Devoted Protege"
}

export type RelationshipStage =
  | 'STRANGER'
  | 'ACQUAINTANCE'
  | 'CONFIDANT'
  | 'TRUSTED_PARTNER'
  | 'STRATEGIC_ALLY'
  | 'COMPETITOR'
  | 'BITTER_RIVAL'
  | 'ARCH_NEMESIS'
  | 'ESTRANGED';

export type RivalryEscalationStage = 'TENSION' | 'COMPETITION' | 'OPEN_CONFLICT' | 'ESCALATION' | 'CRISIS' | 'RESOLVED';

export interface RivalryRecord {
  id: string;
  opponentId: string;
  opponentName: string;
  opponentRole: string;
  domain: 'Professional' | 'Corporate' | 'Political' | 'Dynastic' | 'Social';
  intensity: number; // 0 - 100
  originEvent: string;
  startedMonth: number;
  startedYear: number;
  escalationStage: RivalryEscalationStage;
  currentObjective: string;
  playerAdvantage: number; // -100 (Opponent Dominates) to +100 (Player Dominates)
  historyHighlights: string[];
}

export type StoryThreadCategory =
  | 'CAREER_RIVALRY'
  | 'BUSINESS_EXPANSION'
  | 'FAMILY_CONFLICT'
  | 'SUCCESSION_CRISIS'
  | 'POLITICAL_RISE'
  | 'PUBLIC_SCANDAL'
  | 'FINANCIAL_RECOVERY'
  | 'DYNASTIC_ASCENT'
  | 'HOSTILE_TAKEOVER'
  | 'CORPORATE_TURNAROUND';

export type StoryThreadState =
  | 'EMERGING'
  | 'ACTIVE'
  | 'ESCALATING'
  | 'DORMANT'
  | 'RESOLVED'
  | 'FAILED'
  | 'TRANSFORMED';

export type NarrativeArcType =
  | 'RISE'
  | 'FALL'
  | 'COMEBACK'
  | 'RIVALRY'
  | 'BETRAYAL'
  | 'REDEMPTION'
  | 'SUCCESSION'
  | 'DYNASTIC_ASCENT'
  | 'POLITICAL_ASCENT'
  | 'INSTITUTIONAL_DECLINE';

export interface StoryKeyEvent {
  month: number;
  year: number;
  headline: string;
  significance: string;
}

export interface StoryThread {
  id: string;
  category: StoryThreadCategory;
  title: string;
  summary: string;
  participants: { id: string; name: string; role: string }[];
  state: StoryThreadState;
  tensionLevel: number; // 0 - 100
  startedMonth: number;
  startedYear: number;
  lastUpdatedTick: number;
  keyEvents: StoryKeyEvent[];
  recentDevelopment: string;
  possiblePlayerRelevance: string;
  narrativeArc: NarrativeArcType;
}

export interface StorySeed {
  id: string;
  category: StoryThreadCategory;
  title: string;
  triggerFact: string;
  entityIds: string[];
  priority: number;
  startingTension: number;
}

export type ScandalStage =
  | 'PRIVATE'
  | 'RUMOR'
  | 'EMERGING'
  | 'PUBLIC'
  | 'ESCALATING'
  | 'RESOLVED'
  | 'LINGERING';

export type ScandalResponseOption =
  | 'DENY'
  | 'EXPLAIN'
  | 'APOLOGIZE'
  | 'ACCEPT_CONSEQUENCES'
  | 'COUNTERATTACK'
  | 'RESIGN'
  | 'NEGOTIATE'
  | 'REFORM';

export type StakeholderGroup =
  | 'PUBLIC'
  | 'BUSINESS'
  | 'PROFESSIONAL'
  | 'POLITICAL'
  | 'FAMILY'
  | 'INSTITUTIONAL';

export interface StakeholderPerception {
  group: StakeholderGroup;
  sentimentScore: number; // 0 - 100
  stance: string;          // e.g., "Highly Supportive", "Distrustful", "Watchful Neutral"
  primaryConcerns: string[];
  keyFactor: string;
}

export interface ScandalResponseRecord {
  month: number;
  year: number;
  responseType: ScandalResponseOption;
  statement: string;
  outcome: string;
}

export interface ScandalRecord {
  id: string;
  title: string;
  category: 'Business' | 'Politics' | 'Personal' | 'Family' | 'Financial' | 'Corporate Ethics';
  stage: ScandalStage;
  exposureLevel: number; // 0 - 100
  publicImpact: number;  // 0 - 100
  factualBasis: string;
  affectedStakeholders: StakeholderGroup[];
  reputationPenaltyMonthly: number;
  legalRisk: number;     // 0 - 100
  startedMonth: number;
  startedYear: number;
  resolvedMonth?: number;
  resolvedYear?: number;
  responseHistory: ScandalResponseRecord[];
}

export type PublicAttentionLevel =
  | 'NO_ATTENTION'
  | 'LOCAL_ATTENTION'
  | 'REGIONAL_ATTENTION'
  | 'NATIONAL_ATTENTION'
  | 'GLOBAL_ATTENTION';

export type MediaFramingTone =
  | 'Laudatory'
  | 'Cautiously Optimistic'
  | 'Neutral'
  | 'Scrutinizing'
  | 'Hostile';

export interface MediaAttentionProfile {
  level: PublicAttentionLevel;
  score: number; // 0 - 100
  scrutinyMultiplier: number; // 1.0 to 3.5x
  prevailingFraming: MediaFramingTone;
  mediaFocusAreas: string[];
  activeCoverageCount: number;
}

export interface LifeChapterRecord {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  startMonth: number;
  startYear: number;
  endMonth?: number;
  endYear?: number;
  isCurrent: boolean;
  theme: string;
  majorAccomplishments: string[];
  majorStruggles: string[];
  summary: string;
}

export interface EmergentNarrativeProfile {
  activeStoryThreads: StoryThread[];
  resolvedStoryThreads: StoryThread[];
  activeRivalries: RivalryRecord[];
  activeScandals: ScandalRecord[];
  scandalHistory: ScandalRecord[];
  publicAttention: MediaAttentionProfile;
  stakeholderPerceptions: Record<StakeholderGroup, StakeholderPerception>;
  lifeChapters: LifeChapterRecord[];
  currentLifeChapter: LifeChapterRecord;
  legacyNarrative: {
    title: string;
    summary: string;
    pillars: string[];
    historicalStanding: string;
  };
  monthlyNarrativeSummary: {
    summary: string;
    highlights: string[];
    riskNarrative: string;
    opportunityNarrative: string;
  };
}

// -------------------------------------------------------------
// EXPANSION 4 & 1D: AUTONOMOUS NPC SYSTEMS, AMBITIONS & LIVING WORLD
// -------------------------------------------------------------

export type SimulationLOD = 'FULL' | 'ACTIVE' | 'BACKGROUND' | 'AGGREGATED';
export type NPCSimulationTier = 'MAJOR' | 'ACTIVE' | 'BACKGROUND';

export type NpcGoalCategory =
  | 'SURVIVAL'
  | 'STABILITY'
  | 'CAREER_ADVANCEMENT'
  | 'WEALTH_ACCUMULATION'
  | 'BUSINESS_GROWTH'
  | 'RELATIONSHIP'
  | 'FAMILY'
  | 'POWER'
  | 'INFLUENCE'
  | 'LEGACY';

export interface NPCPersonality {
  ambition: number;             // 0-100: Pursuit of career, hierarchy, prestige
  intelligence: number;         // 0-100: Problem solving, academic/technical competence
  discipline: number;           // 0-100: Execution rigor, impulse control, work ethic
  confidence: number;           // 0-100: Self-assurance, resilience to criticism
  sociability: number;          // 0-100: Extroversion, networking affinity, charm
  empathy: number;              // 0-100: Compassion, moral consideration for others
  integrity: number;            // 0-100: Ethics, honesty, resistance to corruption
  aggression: number;           // 0-100: Ruthlessness, willingness to attack rivals
  loyalty: number;              // 0-100: Resistance to betrayal, commitment to pacts
  patience: number;             // 0-100: Willingness to play multi-year compounding games
  greed: number;                // 0-100: Appetite for raw financial wealth & material gain
  generosity: number;           // 0-100: Propensity for philanthropy, mentorship, gift giving
  riskTolerance: number;        // 0-100: Tolerance for financial and career volatility
  competitiveness: number;      // 0-100: Desire to defeat rivals, win market share
  entrepreneurialDrive: number; // 0-100: Drive to found new companies and build equity
  politicalInterest: number;    // 0-100: Ambition for public office, parties, policy influence
  adaptability?: number;        // 0-100: Flexibility and resilience to market shifts
}

export type NpcPersonalityProfile = NPCPersonality;

export type NPCLifeAmbition =
  | 'CAREER_SUCCESS'
  | 'WEALTH'
  | 'ENTREPRENEURSHIP'
  | 'PROPERTY'
  | 'POLITICAL_POWER'
  | 'FAME'
  | 'FAMILY'
  | 'SECURITY'
  | 'INFLUENCE';

export type NPCLifeStrategy =
  | 'CAREER_CLIMBER'
  | 'ENTREPRENEUR'
  | 'INVESTOR'
  | 'PROPERTY_DEVELOPER'
  | 'POLITICIAN'
  | 'FAMILY_BUILDER'
  | 'INHERITOR'
  | 'OPPORTUNIST';

export type NPCGoalType =
  | 'PROMOTION'
  | 'WEALTH_TARGET'
  | 'BUY_PROPERTY'
  | 'START_COMPANY'
  | 'ACQUIRE_BUSINESS'
  | 'POLITICAL_OFFICE'
  | 'RETIREMENT'
  | 'DEFEAT_RIVAL'
  | 'EDUCATION_DEGREE'
  | 'DEBT_PAYOFF'
  | 'PHILANTHROPY'
  | 'EXPAND_MARKET_SHARE'
  | 'FOUND_DYNASTY';

export interface CanonicalNPCGoal {
  id: string;
  npcId: string;
  type: NPCGoalType;
  title: string;
  description: string;
  category?: NpcGoalCategory;
  priority: number; // 1 (Highest) to 100
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'ABANDONED';
  targetValue?: number;
  currentValue?: number;
  progress: number; // 0 - 100 %
  deadlineMonthsRemaining?: number;
  rewardExplanation?: string;
  startedMonth: number;
  startedYear: number;
  completedMonth?: number;
  completedYear?: number;
}

export interface NpcGoalRecord {
  id: string;
  category: NpcGoalCategory;
  title: string;
  targetProgress: number; // 0 - 100
  priorityScore: number;  // 0 - 100
  deadlineTick?: number;
  reason: string;
}

export interface NpcMemoryRecord {
  id: string;
  tick: number;
  month: number;
  year: number;
  sourceEntityId: string;
  sourceEntityName: string;
  eventType: string;
  emotionalImpact: number; // -100 to +100
  description: string;
  isPermanent: boolean;
}

export interface NpcCareerProfile {
  occupation: string;
  field: string;
  monthlySalary: number;
  employerName: string;
  employerCompanyId?: string;
  yearsInRole: number;
  careerTier: 'Entry' | 'Mid' | 'Senior' | 'Executive' | 'Eminent';
  jobSatisfaction?: number; // 0-100
}

export type NPCOpportunityType =
  | 'JOB_OPENING'
  | 'PROMOTION'
  | 'EDUCATION'
  | 'STARTUP_VENTURE'
  | 'STOCK_INVESTMENT'
  | 'PROPERTY_PURCHASE'
  | 'POLITICAL_ELECTION'
  | 'BUSINESS_PARTNERSHIP'
  | 'LOAN_DEAL'
  | 'RIVALRY_CLASH';

export interface NPCOpportunity {
  id: string;
  type: NPCOpportunityType;
  title: string;
  description: string;
  domain: string;
  requirements?: {
    minEducation?: string;
    minIntelligence?: number;
    minReputation?: number;
    minCapital?: number;
  };
  potentialReward: number;
  risk: number; // 0-100
  companyId?: string;
  companyName?: string;
  positionTitle?: string;
  industry?: string;
  salary?: number;
  price?: number;
  expiresTick: number;
  status: 'OPEN' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  npcParticipants: { npcId: string; npcName: string; score: number }[];
  playerCanParticipate: boolean;
}

export interface NPCPlanAction {
  id: string;
  actionType:
    | 'APPLY_JOB'
    | 'START_BUSINESS'
    | 'BUY_PROPERTY'
    | 'SELL_PROPERTY'
    | 'INVEST_STOCKS'
    | 'TAKE_LOAN'
    | 'REPAY_LOAN'
    | 'SEEK_EDUCATION'
    | 'CAMPAIGN_POLITICS'
    | 'PROPOSE_ALLIANCE'
    | 'COMPETE_RIVAL'
    | 'SEND_PLAYER_REQUEST'
    | 'EXPAND_BUSINESS'
    | 'RETIRE';
  targetEntityId?: string;
  description: string;
  expectedBenefit: number;
  estimatedCost: number;
  risk: number;
  score: number;
}

export interface NPCRequestToPlayer {
  id: string;
  npcId: string;
  npcName: string;
  npcRole: string;
  requestType: 'JOB_APPLICATION' | 'INVESTMENT_PITCH' | 'PARTNERSHIP_OFFER' | 'LOAN_REQUEST' | 'POLITICAL_ENDORSEMENT';
  title: string;
  description: string;
  details?: string;
  financialAmount?: number;
  equityOfferedPercent?: number;
  targetCompanyId?: string;
  targetJobTitle?: string;
  requestedSalaryMonthly?: number;
  month: number;
  year: number;
  tick: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'NEGOTIATED';
}

export interface LivingNpc {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  birthMonth?: number;
  birthYear?: number;
  gender: 'Male' | 'Female' | 'Non-binary';
  locationCity: string;
  locationCountry: string;
  
  // Simulation Tier & LOD
  simulationTier?: NPCSimulationTier;
  lod: SimulationLOD;
  
  // Personality & Ambition
  personality?: NPCPersonality;
  traits?: any; // Alias for backward compatibility
  ambition?: NPCLifeAmbition;
  secondaryAmbition?: NPCLifeAmbition;
  lifeStrategy?: NPCLifeStrategy;
  primaryGoal: NpcGoalCategory;
  
  // Goals & Plans
  canonicalGoals?: CanonicalNPCGoal[];
  activeGoals: NpcGoalRecord[]; // Backward compatibility
  activePlanAction?: NPCPlanAction;
  
  // Tiers & Career
  lifeTier: LifeTier;
  powerTier: PowerTier;
  career: NpcCareerProfile;
  educationLevel?: string;
  skills?: {
    management?: number;
    finance?: number;
    technical?: number;
    negotiation?: number;
    politics?: number;
  };
  
  // Wealth & Assets
  netWorth: number;
  cash: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  ownedPropertyIds?: string[];
  ownedBusinessIds?: string[];
  stockPortfolioValue?: number;
  bankDebt?: number;
  
  // Influence & Politics
  influence: number;   // 0 - 100
  reputation: number;  // 0 - 100
  politicalOfficeId?: string;
  politicalPartyId?: string;
  politicalCapital?: number; // 0 - 100
  
  // Social & Dynastic Graph
  familyId?: string;
  dynastyId?: string;
  relationshipToPlayer: string;
  relationshipScore: number; // -100 to +100
  isRival: boolean;
  isAlly: boolean;
  isCompetitor: boolean;
  competitorId?: string;
  
  // Memory & History
  memories: NpcMemoryRecord[];
  recentActions: string[];
  biographyTimeline: string[];
  lastSimulatedTick: number;
  
  // Interactive Requests
  requestsToPlayer?: NPCRequestToPlayer[];
  isRetired?: boolean;
}

export type CompetitorDomain =
  | 'CAREER'
  | 'BUSINESS'
  | 'INVESTMENT'
  | 'POLITICAL'
  | 'INSTITUTIONAL'
  | 'DYNASTIC';

export type CompetitorStrategyType =
  | 'CONSERVATIVE'
  | 'AGGRESSIVE_GROWTH'
  | 'MARKET_DOMINATION'
  | 'INNOVATION'
  | 'NETWORK_BUILDING'
  | 'POLITICAL_INFLUENCE'
  | 'LONG_TERM_ACCUMULATION';

export interface CompetitorProfile {
  id: string;
  name: string;
  leadPersonId: string;
  domain: CompetitorDomain;
  strategy: CompetitorStrategyType;
  currentResources: number;
  marketPower: number; // 0 - 100
  growthRate: number;  // monthly %
  targetIndustry?: string;
  targetMarket?: string;
  activeInitiative: string;
  recentMoves: string[];
  threatLevel: 'Low' | 'Moderate' | 'Formidable' | 'Predatory';
  headquartersCity: string;
  rivalryIntensity: number; // 0 - 100
}

export interface LivingFamily {
  id: string;
  familyName: string;
  headPersonId: string;
  memberIds: string[];
  totalWealth: number;
  socialPrestige: number; // 0 - 100
  reputation: number;    // 0 - 100
  residenceCity: string;
  heirPersonId?: string;
  familyValues: string[];
  alliedFamilyIds: string[];
  rivalFamilyIds: string[];
  recentFamilyEvents: string[];
}

export type FamilyPrestigeRank = 'Local Prominence' | 'Regional Powerhouse' | 'National Aristocracy' | 'Global Patrician';

export interface LivingDynasty {
  id: string;
  dynastyName: string;
  foundingYear: number;
  currentGeneration: number;
  headPersonId: string;
  heirPersonId?: string;
  totalDynastyWealth: number;
  prestigeRank: FamilyPrestigeRank;
  controlledCompanyIds: string[];
  politicalFactionId?: string;
  legacyPillars: string[];
  successionRisk: 'Stable' | 'Contested' | 'Fragile' | 'Crisis';
  dynastyHistory: string[];
}

export interface AutonomousBusiness {
  id: string;
  name: string;
  industry: string;
  founderId?: string;
  valuation: number;
  marketShare: number; // 0 - 100 %
  monthlyRevenue: number;
  monthlyProfit: number;
  employeeCount: number;
  brandReputation: number; // 0 - 100
  productQuality: number;  // 0 - 100
  isPublic: boolean;
  status: 'Flourishing' | 'Stable' | 'Expanding' | 'Struggling' | 'Distressed' | 'Acquired' | 'Liquidated';
  currentStrategy: CompetitorStrategyType;
  recentCorporateEvents: string[];
}

export type IndustryState = 'EXPANDING' | 'STABLE' | 'COMPETITIVE' | 'DECLINING' | 'DISRUPTED';

export interface IndustryMarketCondition {
  industry: string;
  state: IndustryState;
  growthRateAnnual: number; // e.g. 8.5%
  competitionIndex: number; // 0 - 100
  disruptionRisk: number;   // 0 - 100
  entryBarrier: 'Low' | 'Moderate' | 'High' | 'Formidable';
  marketSizeBillions: number;
  dominantPlayerName: string;
  recentDevelopments: string[];
}

export type EconomicCyclePhase =
  | 'EXPANSION'
  | 'STABLE_GROWTH'
  | 'OVERHEATING'
  | 'SLOWDOWN'
  | 'RECESSION'
  | 'RECOVERY';

export interface LivingEconomyState {
  currentCycle: EconomicCyclePhase;
  monthsInCurrentCycle: number;
  transitionProbability: number;
  nationalGdpGrowth: number;
  inflationRate: number;
  benchmarkInterestRate: number;
  centralBankRate?: number;
  unemploymentRate: number;
  marketConfidenceIndex: number;  // 0 - 100
  businessConfidenceIndex: number;// 0 - 100
  creditAvailability: 'Loose' | 'Normal' | 'Tight' | 'Frozen';
  cycleHistory: { tick: number; cycle: EconomicCyclePhase; summary: string }[];
}

export interface RegionalMarketState {
  regionId: string;
  regionName: string;
  countryName: string;
  economicVibrancy: number; // 0 - 100
  costOfLivingIndex: number; // 100 = baseline
  businessTaxScore: number; // 0 - 100
  talentPoolQuality: number;// 0 - 100
  politicalStability: number;// 0 - 100
  keyIndustries: string[];
  currentOpportunityHeadline: string;
}

export type GlobalConditionType =
  | 'GLOBAL_GROWTH'
  | 'GLOBAL_RECESSION'
  | 'MARKET_INSTABILITY'
  | 'TRADE_EXPANSION'
  | 'GEOPOLITICAL_TENSION'
  | 'GLOBAL_OPPORTUNITY';

export interface GlobalWorldState {
  primaryCondition: GlobalConditionType;
  conditionSeverity: 'Mild' | 'Moderate' | 'Intense';
  tradeFrictionScore: number;      // 0 - 100
  globalCapitalFlowScore: number;  // 0 - 100
  activeInternationalTreaties: string[];
  globalCrisis: string | null;
}

export interface PoliticalActor {
  id: string;
  name: string;
  currentRole: string;
  factionId?: string;
  influenceScore: number;    // 0 - 100
  ambitionScore: number;     // 0 - 100
  politicalCapital: number;  // 0 - 100
  reputation: number;        // 0 - 100
  stanceOnPlayer: 'Supportive' | 'Neutral' | 'Opposed' | 'Openly Hostile';
  keyAgenda: string;
  scandalVulnerability: number; // 0 - 100
}

export interface PoliticalFaction {
  id: string;
  name: string;
  ideologicalFocus: string;
  parliamentarySeatsPercent: number;
  donorCapital: number;
  leaderId: string;
  influenceScore: number; // 0 - 100
  stanceOnPlayer: 'Aligned Ally' | 'Pragmatic Partner' | 'Neutral Observer' | 'Fierce Opposition';
  policyPriorities: string[];
}

export interface LivingWorldEvent {
  id: string;
  title: string;
  headline: string;
  category: 'ECONOMY' | 'BUSINESS' | 'POLITICS' | 'GLOBAL' | 'INDUSTRY' | 'DYNASTY' | 'SOCIETY';
  severity: 'Minor' | 'Notable' | 'Major' | 'Systemic Crisis';
  startTick: number;
  durationMonths: number;
  monthsElapsed: number;
  isResolved: boolean;
  affectedIndustries?: string[];
  affectedRegionIds?: string[];
  description: string;
  simulationImpacts: {
    gdpImpact?: number;
    marketVolatilityDelta?: number;
    interestRateShift?: number;
    corporateRevenueImpactPercent?: number;
    hiringDemandFactor?: number;
  };
  rippleSummary: string[];
  resolvedTick?: number;
}

export interface WorldHistoryEntry {
  tick: number;
  month: number;
  year: number;
  headline: string;
  category: 'Economy' | 'Business' | 'Politics' | 'Dynasty' | 'Global' | 'Society';
  significance: 'Historical' | 'Major' | 'Notable';
  affectedDomains: string[];
  summary: string;
}

export interface WorldOpportunityContest {
  opportunityId: string;
  title: string;
  category: string;
  rewardSummary: string;
  playerContender: boolean;
  npcContenders: { npcId: string; name: string; bidStrength: number }[];
  status: 'OPEN' | 'WON_BY_PLAYER' | 'LOST_TO_NPC' | 'EXPIRED';
  winnerName?: string;
  explainReason: string;
}

export interface LivingWorldProfile {
  economy: LivingEconomyState;
  global: GlobalWorldState;
  industries: IndustryMarketCondition[];
  regions: RegionalMarketState[];
  npcs: LivingNpc[];
  competitors: CompetitorProfile[];
  families: LivingFamily[];
  dynasties: LivingDynasty[];
  businesses: AutonomousBusiness[];
  politicalActors: PoliticalActor[];
  politicalFactions: PoliticalFaction[];
  activeWorldEvents: LivingWorldEvent[];
  resolvedWorldEvents: LivingWorldEvent[];
  worldHistory: WorldHistoryEntry[];
  activeOpportunityContests: WorldOpportunityContest[];
  activeOpportunities?: NPCOpportunity[];
  npcRequestsToPlayer?: NPCRequestToPlayer[];
  playerWorldReputation: {
    fearScore: number;
    respectScore: number;
    trustworthinessScore: number;
    notorietyScore: number;
  };
  worldReactionLog: {
    tick: number;
    month: number;
    year: number;
    actorName: string;
    reactionType: string;
    reason: string;
  }[];
  monthlyEcosystemDigest: {
    summary: string;
    keyMoves: string[];
    threatAlerts: string[];
    opportunityWindows: string[];
  };
}

// -------------------------------------------------------------
// EXPANSION 2: PROFESSIONAL POWER, WEALTH, PROPERTY, BUSINESS,
// LAW, GOVERNMENT AND GLOBAL STRATEGY TYPES
// -------------------------------------------------------------

// 1. SHARED FINANCIAL LEDGER & TRANSACTIONS
export type FinancialTransactionType =
  | 'SALARY'
  | 'DIVIDEND'
  | 'RENT_INCOME'
  | 'INVESTMENT_RETURN'
  | 'BUSINESS_PROFIT'
  | 'LIVING_EXPENSE'
  | 'DEBT_INTEREST'
  | 'LOAN_PRINCIPAL'
  | 'PROPERTY_PURCHASE'
  | 'PROPERTY_SALE'
  | 'STOCK_PURCHASE'
  | 'STOCK_SALE'
  | 'COMPANY_FOUNDING'
  | 'COMPANY_ACQUISITION'
  | 'TAX_PAYMENT'
  | 'LEGAL_FEE'
  | 'LEGAL_JUDGMENT'
  | 'RENOVATION_COST'
  | 'DEVELOPMENT_EXPENSE'
  | 'CAMPAIGN_EXPENSE'
  | 'PHILANTHROPY'
  | 'BANK_FEE'
  | 'BANK_INTEREST'
  | 'ASSET_LIQUIDATION'
  | 'MISCELLANEOUS';

export interface FinancialTransaction {
  id: string;
  tick: number;
  month: number;
  year: number;
  type: FinancialTransactionType;
  category: 'INCOME' | 'EXPENSE' | 'ASSET' | 'LIABILITY' | 'TRANSFER' | 'EQUITY';
  amount: number;
  description: string;
  sourceAccount?: string;
  destinationAccount?: string;
  entityId?: string;
  balanceAfter: number;
}

export type FinancialLedgerEntry = FinancialTransaction;

export interface FinancialLedgerRecord {
  transactions: FinancialTransaction[];
  entries?: FinancialTransaction[];
  totalLifetimeEarned: number;
  totalLifetimeSpent: number;
  totalLifetimeTaxes: number;
  totalLifetimeDividends: number;
  totalLifetimeDebtService: number;
  rollingMonthlyNetCashFlow: number[];
  monthlyGrossIncome?: number;
  monthlyTotalExpenses?: number;
  monthlyNetCashflow?: number;
  cumulativeEarnedLifetime?: number;
}

// 2. EXPANDED CAREER PACKAGE & OCCUPATIONS
export type CareerFieldId =
  | 'BUSINESS_AND_MANAGEMENT'
  | 'FINANCE_AND_BANKING'
  | 'LAW_AND_JUSTICE'
  | 'MEDICINE_AND_HEALTHCARE'
  | 'TECHNOLOGY'
  | 'ENGINEERING_AND_CONSTRUCTION'
  | 'EDUCATION_AND_ACADEMIA'
  | 'GOVERNMENT_AND_PUBLIC_SERVICE'
  | 'MEDIA_AND_ENTERTAINMENT'
  | 'SECURITY_AND_DEFENSE'
  | 'SCIENCE_AND_RESEARCH'
  | 'SKILLED_TRADES'
  | 'ENTREPRENEURSHIP';

export type CareerActionType =
  | 'MANAGE'
  | 'NEGOTIATE'
  | 'ANALYZE'
  | 'BUILD'
  | 'SERVE'
  | 'CREATE'
  | 'LEAD'
  | 'ADVISE'
  | 'INVESTIGATE'
  | 'REPRESENT'
  | 'TEACH'
  | 'RESEARCH';

export interface ProfessionalLicense {
  id: string;
  name: string;
  field: CareerFieldId;
  examDifficulty: number; // 0-100
  requiredEducation: string;
  maintenanceFeeAnnual: number;
  acquiredTick?: number;
  tuitionCost?: number;
  regulatoryBody?: string;
  difficultyLevel?: string;
  description?: string;
  studyHoursRequired?: number;
}

export interface OccupationDef {
  id: string;
  title: string;
  field: CareerFieldId;
  description: string;
  entryRequirements: {
    minIntelligence: number;
    minReputation: number;
    requiredEducation: string;
    requiredLicenseId?: string;
    minExperienceMonths: number;
  };
  salaryMonthlyBase: number;
  promotionCriteria: string;
  responsibilityProfile: {
    stressRating: number;   // 0-100
    weeklyHours: number;
    riskOfScandal: number;  // 0-100
    burnoutFactor: number;  // 0-100
  };
  primaryAction: CareerActionType;
  transferableSkills: string[];
  requiredLicenseId?: string;
  industry?: string;
  tierLevel?: string | number;
  baseSalaryMonthly?: number;
  minIntelligence?: number;
  annualBonusPotential?: number;
}

export interface JobApplication {
  id: string;
  occupationId: string;
  employerName: string;
  employerCompanyId?: string;
  vacancyId?: string;
  interviewScore?: number;
  appliedTick: number;
  offeredSalaryMonthly: number;
  status: 'PENDING' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'REJECTED' | 'ACCEPTED';
  interviewQuestions?: {
    question: string;
    choices: { text: string; successProbability: number; bonusSalaryPercent: number }[];
  }[];
}

export type OccupationTemplate = OccupationDef;

export interface InterviewQuestionOption {
  text: string;
  score: number;
  bonusPercent?: number;
}

export interface InterviewQuestion {
  prompt: string;
  options: InterviewQuestionOption[];
}

export interface InterviewState {
  targetJobId: string;
  targetJobTitle: string;
  companyName: string;
  currentQuestionIndex: number;
  accumulatedScore: number;
  questions: InterviewQuestion[];
}

export interface ActiveJobRecord {
  title: string;
  employer: string;
  tierLevel: number | string;
  salaryMonthly: number;
  performance: number;
  tenureMonths: number;
  promotionsEarned: number;
  hoursPerWeek: number;
}

export interface ExpandedCareerProfile {
  licensesHeld: string[];
  obtainedLicenses: string[];
  studyProgress: Record<string, number>;
  boardDirectorships: any[];
  jobApplications: JobApplication[];
  workPerformanceScore: number; // 0-100
  monthsInCurrentRole: number;
  consecutiveHighPerformanceMonths: number;
  careerReputationInField: Record<string, number>;
  unemploymentBenefitMonthsRemaining: number;
  recentWorkActions: {
    tick: number;
    actionType: CareerActionType;
    outcomeSummary: string;
    performanceDelta: number;
    salaryBonus?: number;
  }[];
  activeInterview?: InterviewState | null;
  activeJobRecord?: ActiveJobRecord | null;
}

// 3. BANKING INSTITUTIONS & MULTI-ACCOUNTS
export type BankCategory =
  | 'RETAIL_BANK'
  | 'COMMERCIAL_BANK'
  | 'INVESTMENT_BANK'
  | 'PRIVATE_BANK'
  | 'DIGITAL_BANK'
  | 'CREDIT_UNION';

export interface BankInstitution {
  id: string;
  name: string;
  category: BankCategory;
  reputation: number;        // 0-100
  stability: number;         // 0-100
  minDepositRequired: number;
  minimumDeposit?: number;
  country?: string;
  jurisdiction?: string;
  tier?: string;
  savingsApy?: number;
  cdYield12Month?: number;
  depositRateBonus: number;   // % added to base benchmark
  lendingRateMargin: number;  // % added to base benchmark
  monthlyMaintenanceFee: number;
  perks: string[];
  totalDeposits?: number;
  totalLoans?: number;
  netInterestMargin?: number;
  capitalRatio?: number;
  nonPerformingLoanRate?: number;
  marketShare?: number;
  monthlyProfit?: number;
  activeCorporateClients?: number;
}

export type BankPartner = BankInstitution;
export type BankAccountTier = string;
export type LoanType = string;

export type BankAccountType =
  | 'TRANSACTION_ACCOUNT'
  | 'SAVINGS_ACCOUNT'
  | 'HIGH_INTEREST_SAVINGS'
  | 'FIXED_DEPOSIT'
  | 'MONEY_MARKET_ACCOUNT'
  | 'INVESTMENT_ACCOUNT'
  | 'RETIREMENT_ACCOUNT'
  | 'BUSINESS_ACCOUNT';

export interface BankDepositAccount {
  id: string;
  bankId: string;
  bankName: string;
  institutionName?: string;
  type: BankAccountType;
  accountType?: string;
  currency?: string;
  accountNumber?: string;
  isPrimaryChecking?: boolean;
  isOffshore?: boolean;
  secrecyLevel?: string;
  balance: number;
  interestRateAnnual: number;
  monthlyFee: number;
  openedTick: number;
  isLockedForFixedTerm?: boolean;
  termMonthsRemaining?: number;
  termMonths?: number;
  monthsHeld?: number;
  interestEarnedLifetime: number;
}

export interface BankingSystemProfile {
  institutions: BankInstitution[];
  depositAccounts: BankDepositAccount[];
  accounts: BankDepositAccount[];
  totalDepositedCash: number;
  totalDepositsBalance: number;
  weightedAverageDepositYield: number;
  monthlyInterestEarned: number;
  monthlyInterestYield: number;
}

// 4. CREDIT PROFILE, BORROWING & DEFAULT PIPELINE
export type CreditProductType =
  | 'PERSONAL_LOAN'
  | 'MORTGAGE'
  | 'VEHICLE_FINANCE'
  | 'BUSINESS_LOAN'
  | 'REVOLVING_CREDIT'
  | 'CREDIT_CARD'
  | 'OVERDRAFT'
  | 'LINE_OF_CREDIT'
  | 'SECURED_LOAN';

export interface LoanAgreement {
  id: string;
  bankId: string;
  bankName: string;
  lenderName?: string;
  productType: CreditProductType;
  type?: string;
  title: string;
  principal: number;
  remainingBalance: number;
  monthlyPayment: number;
  interestRateAnnual: number;
  termMonthsTotal: number;
  termMonthsRemaining: number;
  collateralAssetId?: string;
  collateralType?: 'PROPERTY' | 'COMPANY_STOCK' | 'PORTFOLIO';
  collateralValue?: number;
  missedPaymentsCount: number;
  inArrears: boolean;
  arrearsAmount: number;
  status: 'ACTIVE' | 'RESTRUCTURED' | 'DEFAULTED' | 'PAID_OFF';
}

export interface DebtCollectionNotice {
  id: string;
  loanId: string;
  bankName: string;
  stage: 'NOTICE_1' | 'FINAL_WARNING' | 'COLLECTION_AGENCY' | 'LEGAL_PROCEEDING';
  issuedTick: number;
  demandedAmount: number;
  deadlineTick: number;
  resolved: boolean;
}

export interface PlayerCreditProfileState {
  creditScore: number;          // 300 - 850
  creditRating: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT' | 'PRIME';
  debtToIncomeRatio: number;    // DTI %
  debtServiceRatio: number;     // DSR %
  borrowingCapacityMax: number;
  maxBorrowingCapacity?: number;
  totalOutstandingDebt?: number;
  paymentHistoryOnTimePercent?: number;
  missedPaymentsCount?: number;
  totalActiveCreditLines?: number;
  activeLoans: LoanAgreement[];
  collectionNotices: DebtCollectionNotice[];
  creditHistoryEvents: { tick: number; event: string; scoreDelta: number }[];
}

// 5. INVESTMENT PLATFORM & HISTORICAL ASSET SERIES
export type InvestmentAssetCategory =
  | 'STOCK'
  | 'ETF'
  | 'INDEX_FUND'
  | 'MUTUAL_FUND'
  | 'GOVERNMENT_BOND'
  | 'CORPORATE_BOND'
  | 'COMMODITY'
  | 'CRYPTO_ASSET'
  | 'PRIVATE_COMPANY'
  | 'STARTUP_INVESTMENT';

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  category: InvestmentAssetCategory;
  sector: string;
  currentPrice: number;
  priceHistory: number[];       // minimum 24 months
  high52Week: number;
  low52Week: number;
  annualDividendYield: number;  // %
  volatilityRating: 'Low' | 'Moderate' | 'High' | 'Speculative';
  marketCapBillions?: number;
  underlyingCompanyId?: string;
  description: string;
}

export interface PortfolioHolding {
  assetId: string;
  symbol: string;
  name: string;
  category: InvestmentAssetCategory;
  sharesOwned: number;
  avgPurchasePrice: number;
  currentValue: number;
  totalCostBasis: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  dividendsEarnedLifetime: number;
}

export interface InvestmentMarketState {
  marketAssets: MarketAsset[];
  portfolioHoldings: PortfolioHolding[];
  totalPortfolioValue: number;
  totalCostBasis: number;
  totalUnrealizedPnl: number;
  totalRealizedPnlLifetime: number;
  monthlyDividendIncome: number;
}

// 6. LEGAL SYSTEM, COURTS & INSOLVENCY
export type CourtJurisdiction =
  | 'SMALL_CLAIMS'
  | 'CIVIL'
  | 'COMMERCIAL'
  | 'FAMILY'
  | 'CRIMINAL'
  | 'APPEAL'
  | 'SUPREME_OR_CONSTITUTIONAL';

export type LegalCaseStage =
  | 'FILED'
  | 'DISCOVERY'
  | 'SETTLEMENT_OFFER'
  | 'HEARING'
  | 'JUDGMENT_RENDERED'
  | 'APPEAL_PENDING'
  | 'CLOSED';

export type LegalClaimType =
  | 'DEBT_COLLECTION'
  | 'CONTRACT_BREACH'
  | 'BREACH_OF_CONTRACT'
  | 'EMPLOYMENT_DISPUTE'
  | 'BUSINESS_MERGER_DISPUTE'
  | 'PROPERTY_BOUNDARY_DISPUTE'
  | 'TENANT_EVICTION'
  | 'FAMILY_INHERITANCE'
  | 'REGULATORY_COMPLIANCE'
  | 'DEFAMATION_SLANDER'
  | string;

export type LegalRepresentationTier =
  | 'SELF_REPRESENTED'
  | 'PUBLIC_DEFENDER'
  | 'STANDARD_COUNSEL'
  | 'SENIOR_LITIGATOR'
  | 'ELITE_DEFENSE_FIRM'
  | 'ELITE_WHITE_COLLAR';


// 10. CORPORATE MANAGEMENT & LIVING WEALTH ECOSYSTEM
export type CorporateDepartmentType = 'OPERATIONS'|'PRODUCTION'|'MARKETING'|'HUMAN_RESOURCES'|'ADMINISTRATION'|'RESEARCH_DEVELOPMENT'|'SALES'|'FINANCE';
export type CompanyManagementPermission = 'NONE'|'SHAREHOLDER'|'CEO'|'BOARD_CHAIR'|'OWNER';
export type OrganizationStructure = 'FUNCTIONAL'|'DIVISIONAL'|'MATRIX'|'GEOGRAPHIC'|'HOLDING_COMPANY';

export interface CompanyManagementPlan {
  departmentBudgets: Record<CorporateDepartmentType, number>;
  departmentHeadcount: Record<CorporateDepartmentType, number>;
  organizationStructure: OrganizationStructure|string;
  productionTarget: number;
  marketingIntensity: number;
  hrWagePolicy: number;
  trainingBudgetMonthly: number;
  capexBudgetMonthly: number;
  workingCapitalTargetMonths: number;
  customerServiceLevel: number;
  procurementEfficiency: number;
  managementNotes: string[];
  activeLoanIds: string[];
}

export interface CorporateLoanApplication {
  id:string; companyId:string; bankId:string; bankName:string; principal:number; interestRateAnnual:number; termMonths:number; monthlyPayment:number;
  status:'PENDING'|'APPROVED'|'DECLINED'|'DEFAULTED'|'PAID'; underwritingScore:number; createdTick:number; officerNpcId?:string; missedPayments?:number;
}
export interface CorporateManagementHistory { tick:number; companyId:string; type:string; summary:string; }
export interface CorporateManagementState { version:number; companies:Record<string,CompanyManagementPlan>; loanApplications:CorporateLoanApplication[]; history:CorporateManagementHistory[]; lastProcessedTick:number; workforce?: import('./engine/corporateWorkforceEngine').CorporateWorkforceState; }

export interface LivingBankOfficer { npcId:string; bankId:string; title:string; relationshipScore:number; underwritingInfluence:number; }
export interface LivingInvestmentAdvisor { npcId:string; platformId:string; specialization:'WEALTH'|'EQUITIES'|'BONDS'|'PRIVATE_MARKETS'|'RETIREMENT'; relationshipScore:number; }
export interface InvestmentPlatform { id:string; name:string; bankId?:string; platformType:'BROKERAGE'|'ROBO_ADVISOR'|'PRIVATE_WEALTH'|'PENSION'|'EXCHANGE'; feeRate:number; reputation:number; assetsUnderManagement:number; clientCount:number; }
export interface LivingWealthState {
  version:number; investmentPlatforms:InvestmentPlatform[]; bankOfficers:LivingBankOfficer[]; investmentAdvisors:LivingInvestmentAdvisor[];
  corporateBankRelationships:Record<string,{bankId:string; relationshipScore:number; creditLimit:number; lastDecisionTick:number}[]>;
  investmentResearch:Record<string,{rating:'BUY'|'HOLD'|'SELL'; confidence:number; thesis:string; analystNpcId?:string}>;
  wealthHistory:{tick:number; type:string; entityId:string; summary:string}[];
}

export interface LegalSettlementOffer {
  id: string;
  offeredBy: 'PLAINTIFF' | 'DEFENDANT';
  amount: number;
  terms: string;
  expiresTick: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface LegalCase {
  id: string;
  title: string;
  caseNumber: string;
  jurisdiction: CourtJurisdiction;
  claimType: LegalClaimType;
  stage: LegalCaseStage;
  plaintiffName: string;
  defendantName: string;
  isPlayerPlaintiff: boolean;
  claimAmount: number;
  evidenceStrengthPlayer: number; // 0-100
  evidenceStrengthOpponent: number; // 0-100
  playerRepresentation: LegalRepresentationTier;
  monthlyLegalFees: number;
  settlementOffer?: LegalSettlementOffer;
  judgmentVerdict?: 'WON' | 'LOST' | 'DISMISSED' | 'SETTLED';
  awardedDamages?: number;
  caseSummaryHistory: string[];
  filedTick: number;
}

export type InsolvencyStatus =
  | 'SOLVENT'
  | 'FINANCIAL_DISTRESS'
  | 'VOLUNTARY_RESTRUCTURING'
  | 'SEQUESTRATION'
  | 'ASSET_LIQUIDATION'
  | 'RECOVERED';

export interface LegalSystemProfile {
  activeCases: LegalCase[];
  caseHistory: LegalCase[];
  totalLegalFeesSpentLifetime: number;
  insolvencyStatus: InsolvencyStatus;
  retainedCounselTier?: string;
  retainedCounselMonthlyRetainer?: number;
  restructuringPlan?: {
    totalRestructuredDebt: number;
    monthlyRepaymentTarget: number;
    monthsRemaining: number;
  };
}

// 7. REAL ESTATE, RENTAL PROPERTY MANAGEMENT, RENOVATIONS & LAND DEVELOPMENT
export type RealEstateCategory =
  | 'RESIDENTIAL'
  | 'COMMERCIAL'
  | 'INDUSTRIAL'
  | 'HOSPITALITY'
  | 'LAND';

export interface PropertyTenantProfile {
  tenantName: string;
  leaseMonthsRemaining: number;
  monthlyRentPaid: number;
  paymentReliability: number; // 0-100
  careOfProperty: number;     // 0-100
  disputeHistory: string[];
}

export type RenovationType =
  | 'GENERAL_REPAIR'
  | 'MODERNIZATION'
  | 'KITCHEN_AND_BATH'
  | 'LUXURY_OVERHAUL'
  | 'LUXURY_FINISHES'
  | 'STRUCTURAL_REINFORCEMENT'
  | 'ENERGY_EFFICIENCY_UPGRADE'
  | 'LANDSCAPING_AND_CURB_APPEAL'
  | 'FULL_GUT_RENOVATION'
  | string;

export interface RenovationProject {
  id: string;
  propertyId: string;
  type: RenovationType;
  title: string;
  totalCost: number;
  costPaid: number;
  durationMonths: number;
  monthsCompleted: number;
  contractorQuality: 'Economy' | 'Standard' | 'Premium Master Builders';
  riskOfDelayOrOverrun: number; // 0-100
  projectedValueIncrease: number;
  projectedRentIncreaseMonthly: number;
  status: 'IN_PROGRESS' | 'DELAYED_SUPPLY' | 'COMPLETED' | 'CANCELLED';
}

export type LandDevelopmentType =
  | 'HOUSING_DEVELOPMENT'
  | 'APARTMENT_COMPLEX'
  | 'COMMERCIAL_CENTER'
  | 'INDUSTRIAL_PARK'
  | 'HOTEL_RESORT'
  | 'MIXED_USE_TOWER'
  | 'RESIDENTIAL_TOWER'
  | string;

export type DevelopmentStage =
  | 'LAND_ACQUISITION'
  | 'FEASIBILITY_STUDY'
  | 'PROJECT_FINANCING'
  | 'ZONING_AND_PERMITS'
  | 'EXCAVATION_AND_FOUNDATION'
  | 'CORE_CONSTRUCTION'
  | 'INTERIOR_FITOUT'
  | 'COMPLETED_OPERATIONAL';

export interface LandDevelopmentProject {
  id: string;
  title: string;
  type: LandDevelopmentType;
  city: string;
  country: string;
  stage: DevelopmentStage;
  totalEstimatedCost: number;
  capitalCommitted: number;
  monthsInStage: number;
  totalDurationMonths: number;
  completedValueProjected: number;
  annualOperatingIncomeProjected: number;
  status: 'ON_SCHEDULE' | 'DELAYED' | 'BUDGET_OVERRUN' | 'COMPLETED';
}

export type RealEstateAssetClass =
  | 'House' | 'Townhouse' | 'Apartment' | 'Condominium' | 'Penthouse' | 'Luxury Villa' | 'Mansion'
  | 'Office' | 'Retail' | 'Shopping Mall' | 'Industrial' | 'Warehouse' | 'Logistics Park'
  | 'Hotel' | 'Resort' | 'Student Housing' | 'Senior Living' | 'Mixed Use' | 'Data Center' | 'Land';

export type RealEstateDevelopmentType =
  | 'Single Family Estate' | 'Townhouse Development' | 'Apartment Development' | 'Luxury Residential Tower'
  | 'Office Tower' | 'Shopping Centre' | 'Mixed Use District' | 'Industrial Park' | 'Logistics Hub'
  | 'Hotel' | 'Resort' | 'Student Housing' | 'Senior Living Community' | 'Data Center'
  | 'Business Park' | 'Sports & Entertainment Complex' | 'Healthcare Campus' | 'Renewable Energy Site'
  | 'Master Planned Community' | 'Custom Project';

export type RealEstateProjectPhase =
  | 'Site Identification' | 'Acquisition' | 'Feasibility' | 'Due Diligence' | 'Planning & Design'
  | 'Zoning & Entitlements' | 'Financing' | 'Procurement' | 'Construction' | 'Fit Out'
  | 'Pre Leasing' | 'Marketing & Sales' | 'Completion' | 'Stabilized' | 'Exited' | 'Failed';

export interface LandParcel {
  id: string;
  name: string;
  city: string;
  country: string;
  areaSqm: number;
  zoning: string;
  permittedUses: string[];
  purchasePrice: number;
  currentValue: number;
  infrastructureScore: number;
  developmentPotential: number;
  status: 'OWNED' | 'LISTED_FOR_SALE' | 'UNDER_DEVELOPMENT' | 'SOLD';
}

export interface RealEstateListing {
  id: string;
  assetType: RealEstateAssetClass;
  name: string;
  city: string;
  country: string;
  seller: string;
  askingPrice: number;
  areaSqm: number;
  condition: number;
  rentalYield: number;
  developmentPotential: number;
  status: 'LISTED' | 'UNDER_OFFER' | 'SOLD';
}

export interface RealEstateProject {
  id: string;
  name: string;
  developmentType: RealEstateDevelopmentType;
  landParcelId?: string;
  city: string;
  country: string;
  phase: RealEstateProjectPhase;
  budget: number;
  spent: number;
  financingDebt: number;
  equityCommitted: number;
  expectedValue: number;
  expectedAnnualIncome: number;
  expectedUnits: number;
  monthsTotal: number;
  monthsElapsed: number;
  progress: number;
  constructionQuality: number;
  approvalRisk: number;
  costOverrunRisk: number;
  marketRisk: number;
  contractorQuality: number;
  jobsCreated: number;
  status: 'PLANNING' | 'ACTIVE' | 'DELAYED' | 'COMPLETED' | 'FAILED' | 'SOLD';
}

export interface RealEstateTransaction {
  id: string;
  month: number;
  year: number;
  type: 'PURCHASE' | 'SALE' | 'LAND_PURCHASE' | 'LAND_SALE' | 'RENOVATION' | 'DEVELOPMENT' | 'FINANCING';
  assetName: string;
  amount: number;
  counterparty: string;
  description: string;
}

export interface RealEstatePlatformState {
  landParcels: LandParcel[];
  listings: RealEstateListing[];
  projects: RealEstateProject[];
  transactions: RealEstateTransaction[];
  marketCycle: 'BOOM' | 'GROWTH' | 'STABLE' | 'SLOWDOWN' | 'RECESSION';
  constructionCostIndex: number;
  averageVacancyRate: number;
  developmentSentiment: number;
  totalLandValue: number;
  totalProjectValue: number;
  jobsCreated: number;
  lastMarketUpdateTick: number;
}

export interface PropertySystemState {
  rentalProperties: RealEstateProperty[];
  activeRenovations: RenovationProject[];
  activeDevelopments: LandDevelopmentProject[];
  totalRealEstateValue: number;
  totalMonthlyGrossRent: number;
  totalMonthlyMaintenance: number;
  averageOccupancyRate: number; // %
}

// 8. ADVANCED BUSINESS EMPIRE, EXECUTIVES, M&A & EXITS
export interface CompanyExecutive {
  id: string;
  companyId: string;
  name: string;
  role: 'CEO' | 'CFO' | 'COO' | 'CTO' | 'CMO' | 'General Counsel';
  salaryMonthly: number;
  competence: number; // 0-100
  loyalty: number;    // 0-100
  ambition: number;   // 0-100
  personality: 'Aggressive Growth' | 'Conservative Prudent' | 'Tech Visionary' | 'Cost Cutter' | 'Dealmaker';
  aiOpinion?: string;
  performanceRecord: string[];
}

export type MADealStage =
  | 'DUE_DILIGENCE'
  | 'VALUATION_AND_OFFER'
  | 'BOARD_NEGOTIATION'
  | 'FINANCING_APPROVAL'
  | 'INTEGRATION'
  | 'COMPLETED';

export interface MergerAcquisitionDeal {
  id: string;
  targetCompanyName: string;
  targetIndustry: string;
  targetValuation: number;
  proposedPurchasePrice: number;
  financingMethod: 'ALL_CASH' | 'DEBT_FINANCED' | 'STOCK_SWAP' | 'HYBRID';
  stage: MADealStage;
  synergyPotentialAnnual: number;
  integrationRisk: 'Low' | 'Moderate' | 'High';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
}

// 9. GOVERNMENT OFFICE, NATIONAL RESOURCES, DEFENSE & GLOBAL STRATEGY
export interface GovernmentCabinetMinister {
  id: string;
  name: string;
  ministry: 'Finance' | 'Foreign Affairs' | 'Health' | 'Education' | 'Defence' | 'Infrastructure' | 'Energy' | 'Justice' | 'Commerce';
  competence: number; // 0-100
  loyalty: number;    // 0-100
  approvalRating: number; // 0-100
  corruptionRisk: number; // 0-100
  recentPolicies: string[];
}

export type StrategicAssetType =
  | 'MINERAL_MINE'
  | 'OIL_AND_GAS_FIELD'
  | 'ENERGY_GRID'
  | 'AGRICULTURAL_RESERVE'
  | 'NATIONAL_PORT_AND_RAIL'
  | 'TELECOM_INFRASTRUCTURE'
  | 'STATE_PHARMACEUTICAL';

export interface NationalStrategicAsset {
  id: string;
  name: string;
  type: StrategicAssetType;
  ownership: 'STATE_OWNED' | 'PUBLIC_PRIVATE_PARTNERSHIP' | 'PRIVATIZED';
  monthlyRevenueGross: number;
  monthlyOperatingCost: number;
  strategicImportanceScore: number; // 0-100
  strategicImportance?: number | string;
  sector?: string;
  modernizationLevel: number;       // 0-100
}

export interface DefenseSecurityProfile {
  defenseBudgetMonthly: number;
  militaryReadinessScore: number;   // 0-100
  securityPosture: 'Defensive Neutral' | 'Regional Peacekeeping' | 'Forward Deterrence' | 'Global Power Projection';
  alliedTreaties: string[];
  strategicDeterrenceRating: number;// 0-100
}

export interface InternationalCrisis {
  id: string;
  title: string;
  opposingNation: string;
  tensionLevel: 'DIPLOMATIC_DISPUTE' | 'TRADE_SANCTIONS' | 'BORDER_STANDOFF' | 'SYSTEMIC_SECURITY_CRISIS';
  monthsActive: number;
  diplomaticResolutionProgress: number; // 0-100
  consequencesSummary: string[];
}

export interface GovernmentOfficeState {
  unlocked: boolean;
  headOfStateTitle: string;
  nationalTreasuryBillions: number;
  monthlyTaxRevenueBillions: number;
  monthlyExpenditureBillions: number;
  sovereignDebtBillions: number;
  sovereignCreditRating: 'AAA' | 'AA+' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  cabinet: GovernmentCabinetMinister[];
  strategicAssets: NationalStrategicAsset[];
  cabinetMinisters?: any[];
  strategicAssetInvestments?: any[];
  defenseProfile: DefenseSecurityProfile;
  activeCrises: InternationalCrisis[];
  policyDecreeHistory: { tick: number; decree: string; impact: string }[];
}


