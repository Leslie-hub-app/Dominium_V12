import { 
  GameState, 
  SaveSlot, 
  PlayerPowerProfile, 
  EventControlState, 
  PendingDecision, 
  DelayedConsequence, 
  EventChain,
  DynastyProfile,
  DynastyTimelineEvent,
  SuccessionHistoryRecord,
  SimulationSnapshot,
  RelationshipPerson,
  Company,
  RealEstateProperty,
  StockAsset,
  Loan,
  BankAccount,
  EducationRecord,
  JobRecord,
  PoliticalOffice,
  MajorProject,
  CountryState,
  SimulationEvent,
  NewsItem,
  Achievement
} from '../types';
import { calculateNetWorth } from './simulationEngine';
import { calculatePlayerPowerProfile } from './powerTierEngine';
import { createInitialDynastyProfile, DEFAULT_SUCCESSION_PLAN } from './dynastyEngine';
import { DEFAULT_EVENT_CONTROL_CONFIG } from './eventControlEngine';
import { migrateProgressionProfile } from './lifeProgressionEngine';
import { evaluateLifeGameplay } from './lifeGameplayEngine';
import { ensureLivingWorldProfile } from './livingWorldEngine';
import { ensureFinancialLedger } from './financialLedgerEngine';
import { ensureExpandedCareerProfile } from './careerEngine';
import { ensureBankingSystemProfile } from './bankingEngine';
import { ensureCreditProfileState } from './creditEngine';
import { ensureInvestmentMarketState } from './investmentEngine';
import { ensurePropertySystemState } from './propertyEngine';
import { ensureLegalSystemProfile } from './legalEngine';
import { ensureGovernmentOfficeState } from './governmentEngine';
import { ensureBankingCreditState } from './bankingCreditEngine';
import { ensureCorporateSystemState } from './corporateSystemEngine';
import { ensureLegalSystemState } from './legalSystemEngine';
import { ensureGovernmentSystemState } from './governmentSystemEngine';
import { ensureCareerSystemState } from './careerSystemEngine';

export const CURRENT_SAVE_VERSION = 23;
const STORAGE_KEY = 'dominium_save_slots_v1';
export const AUTOSAVE_SLOT_ID = 'autosave_main';

// In-memory fallback for environments without window.localStorage (e.g. Node/test runners)
let memoryStore: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStore[key] || null;
    }
  }
  return memoryStore[key] || null;
}

function setStorageItem(key: string, value: string): void {
  memoryStore[key] = value;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn('LocalStorage save failed, using memory store', e);
    }
  }
}

/**
 * Validates and sanitizes a PendingDecision item from older or external save data.
 */
function sanitizePendingDecision(dec: any): PendingDecision {
  return {
    id: dec.id || `decision_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    category: dec.category || 'Business',
    title: dec.title || 'Untitled Decision',
    description: dec.description || 'Pending player directive.',
    contextData: dec.contextData,
    urgency: dec.urgency || 'Standard',
    priority: typeof dec.priority === 'number' ? dec.priority : 50,
    eventTypeKey: dec.eventTypeKey,
    entityId: dec.entityId,
    affectedEntity: dec.affectedEntity,
    risk: dec.risk || 'Medium',
    potentialUpside: dec.potentialUpside || 'Strategic growth and capital progress.',
    potentialDownside: dec.potentialDownside || 'Operational setbacks and financial cost.',
    canBePostponed: typeof dec.canBePostponed === 'boolean' ? dec.canBePostponed : true,
    postponeCount: typeof dec.postponeCount === 'number' ? dec.postponeCount : 0,
    createdMonth: typeof dec.createdMonth === 'number' ? dec.createdMonth : 1,
    createdYear: typeof dec.createdYear === 'number' ? dec.createdYear : 2026,
    createdTick: typeof dec.createdTick === 'number' ? dec.createdTick : 0,
    createdDate: dec.createdDate,
    expiresInMonths: typeof dec.expiresInMonths === 'number' ? dec.expiresInMonths : 3,
    expiresAtTick: typeof dec.expiresAtTick === 'number' ? dec.expiresAtTick : 3,
    minPowerTier: dec.minPowerTier,
    maxPowerTier: dec.maxPowerTier,
    expirationConsequences: Array.isArray(dec.expirationConsequences) ? dec.expirationConsequences : [],
    expirationEventHeadline: dec.expirationEventHeadline,
    expirationEventDescription: dec.expirationEventDescription,
    options: Array.isArray(dec.options) && dec.options.length > 0 ? dec.options.map((opt: any, idx: number) => ({
      id: opt.id || `opt_${idx}`,
      label: opt.label || `Option ${idx + 1}`,
      description: opt.description || 'Proceed with standard executive approach.',
      cost: typeof opt.cost === 'number' ? opt.cost : 0,
      risk: opt.risk || 'Medium',
      timeHorizon: opt.timeHorizon || 'Immediate',
      projectedOutcome: opt.projectedOutcome || 'Neutral progress',
      handlerKey: opt.handlerKey || 'OPT_DEFAULT',
      consequences: Array.isArray(opt.consequences) ? opt.consequences : [],
      delayedConsequences: Array.isArray(opt.delayedConsequences) ? opt.delayedConsequences : []
    })) : [
      {
        id: 'opt_default_1',
        label: 'Acknowledge & Dismiss',
        description: 'Take standard operational course.',
        risk: 'Low',
        timeHorizon: 'Immediate',
        projectedOutcome: 'Minimal systemic impact.',
        handlerKey: 'OPT_ACKNOWLEDGE'
      }
    ]
  };
}

/**
 * Validates and sanitizes a DelayedConsequence from older save data.
 */
function sanitizeDelayedConsequence(c: any): DelayedConsequence {
  return {
    id: c.id || `delayed_csq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    executeAtMonth: typeof c.executeAtMonth === 'number' ? c.executeAtMonth : 1,
    executeAtYear: typeof c.executeAtYear === 'number' ? c.executeAtYear : 2026,
    scheduledTick: typeof c.scheduledTick === 'number' ? c.scheduledTick : 0,
    executeTick: typeof c.executeTick === 'number' ? c.executeTick : 1,
    source: c.source || 'Executive Decision',
    description: c.description || 'Scheduled consequence execution.',
    consequences: Array.isArray(c.consequences) ? c.consequences : [],
    conditions: c.conditions,
    decisionId: c.decisionId,
    eventId: c.eventId,
    chainId: c.chainId,
    status: c.status || 'Pending',
    newsHeadline: c.newsHeadline
  };
}

/**
 * Validates and sanitizes an EventChain from older save data.
 */
function sanitizeEventChain(chain: any): EventChain {
  return {
    id: chain.id || `chain_${Date.now()}`,
    name: chain.name || 'Strategic Narrative Arc',
    category: chain.category || 'BUSINESS',
    currentStage: chain.currentStage || 1,
    status: chain.status || 'Active',
    startedMonth: typeof chain.startedMonth === 'number' ? chain.startedMonth : 1,
    startedYear: typeof chain.startedYear === 'number' ? chain.startedYear : 2026,
    variables: typeof chain.variables === 'object' && chain.variables !== null ? chain.variables : {},
    history: Array.isArray(chain.history) ? chain.history : [],
    parentEventId: chain.parentEventId,
    delayUntilTick: chain.delayUntilTick,
    stages: Array.isArray(chain.stages) ? chain.stages : []
  };
}

/**
 * Fully migrates and sanitizes any raw game state (including older schemas, v1, or incomplete JSON).
 * Preserves 100% of player state while backfilling safe defaults for all Phase systems.
 */
export function migrateGameState(raw: any): GameState {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid save state data: expected non-null object');
  }

  const currentYear = typeof raw.currentYear === 'number' ? raw.currentYear : 2026;
  const currentMonth = typeof raw.currentMonth === 'number' ? raw.currentMonth : 1;
  const simulationTick = typeof raw.simulationTick === 'number' ? raw.simulationTick : 0;

  // 1. Character & Attributes
  const rawChar = raw.character || {};
  const rawAttrs = rawChar.attributes || {};
  const character = {
    id: rawChar.id || 'player_001',
    firstName: rawChar.firstName || 'Alex',
    lastName: rawChar.lastName || 'Vance',
    gender: rawChar.gender || 'Male',
    birthMonth: typeof rawChar.birthMonth === 'number' ? rawChar.birthMonth : 1,
    birthYear: typeof rawChar.birthYear === 'number' ? rawChar.birthYear : currentYear - (rawChar.age || 18),
    age: typeof rawChar.age === 'number' ? rawChar.age : 18,
    avatarSeed: rawChar.avatarSeed || `${rawChar.firstName || 'Alex'}_${rawChar.gender || 'Male'}_${rawChar.age || 18}`,
    attributes: {
      health: typeof rawAttrs.health === 'number' ? rawAttrs.health : 85,
      happiness: typeof rawAttrs.happiness === 'number' ? rawAttrs.happiness : 80,
      intelligence: typeof rawAttrs.intelligence === 'number' ? rawAttrs.intelligence : 65,
      stress: typeof rawAttrs.stress === 'number' ? rawAttrs.stress : 20,
      attractiveness: typeof rawAttrs.attractiveness === 'number' ? rawAttrs.attractiveness : 70,
      charm: typeof rawAttrs.charm === 'number' ? rawAttrs.charm : 60,
      reputation: typeof rawAttrs.reputation === 'number' ? rawAttrs.reputation : 30,
      worldInfluence: typeof rawAttrs.worldInfluence === 'number' ? rawAttrs.worldInfluence : 5
    },
    birthCity: rawChar.birthCity || 'New York',
    birthCountry: rawChar.birthCountry || 'United States',
    residenceCity: rawChar.residenceCity || rawChar.birthCity || 'New York',
    residenceCountry: rawChar.residenceCountry || rawChar.birthCountry || 'United States',
    lifeStage: rawChar.lifeStage || (rawChar.age < 26 ? 'Young Adult' : 'Adult'),
    creditScore: typeof rawChar.creditScore === 'number' ? rawChar.creditScore : 680,
    socialFollowers: typeof rawChar.socialFollowers === 'number' ? rawChar.socialFollowers : 350,
    socialSentiment: typeof rawChar.socialSentiment === 'number' ? rawChar.socialSentiment : 65,
    hobbies: Array.isArray(rawChar.hobbies) ? rawChar.hobbies : ['Fitness & Jogging', 'Reading Business Books'],
    possessions: {
      homesCount: typeof rawChar.possessions?.homesCount === 'number' ? rawChar.possessions.homesCount : 0,
      vehicles: Array.isArray(rawChar.possessions?.vehicles) ? rawChar.possessions.vehicles : [],
      luxuries: Array.isArray(rawChar.possessions?.luxuries) ? rawChar.possessions.luxuries : []
    },
    lifeGoals: Array.isArray(rawChar.lifeGoals) ? rawChar.lifeGoals : []
  };

  // 2. Finances
  const rawFin = raw.finances || {};
  const finances = {
    cash: typeof rawFin.cash === 'number' ? rawFin.cash : 2500,
    accounts: Array.isArray(rawFin.accounts) && rawFin.accounts.length > 0 
      ? rawFin.accounts.map((a: any, idx: number) => ({
          id: a.id || `acc_primary_${idx + 1}`,
          type: a.type || a.accountType || 'Checking',
          balance: typeof a.balance === 'number' ? a.balance : 2500,
          interestRateAnnual: typeof a.interestRateAnnual === 'number' ? a.interestRateAnnual : 0.5
        }))
      : [
          {
            id: 'acc_chk',
            type: 'Checking',
            balance: typeof rawFin.cash === 'number' ? rawFin.cash : 2500,
            interestRateAnnual: 0.5
          }
        ],
    loans: Array.isArray(rawFin.loans) ? rawFin.loans : [],
    stocks: Array.isArray(rawFin.stocks) ? rawFin.stocks : [],
    properties: Array.isArray(rawFin.properties) ? rawFin.properties : [],
    monthlyBaseExpenses: typeof rawFin.monthlyBaseExpenses === 'number' ? rawFin.monthlyBaseExpenses : 1200
  };

  // 3. Politics
  const rawPol = raw.politics || {};
  const politics = {
    currentOffice: rawPol.currentOffice || {
      title: 'Citizen',
      cityOrNation: character.birthCity,
      approvalRating: 50,
      politicalCapital: 10,
      inOffice: false,
      termMonthsRemaining: 0,
      salaryMonthly: 0
    },
    parties: Array.isArray(rawPol.parties) ? rawPol.parties : [],
    selectedPartyId: rawPol.selectedPartyId || null,
    pastOffices: Array.isArray(rawPol.pastOffices) ? rawPol.pastOffices : [],
    nationalPolicies: rawPol.nationalPolicies || {
      taxBracket: 'Balanced Moderate',
      healthcareSpending: 'Universal',
      educationInvestment: 'Standard',
      infrastructureFocus: 'Green Energy',
      defenceLevel: 'Standard'
    }
  };

  // 4. Sports & Projects
  const rawSports = raw.sports || {};
  const sports = {
    personalAthleteCareer: rawSports.personalAthleteCareer,
    ownedTeams: Array.isArray(rawSports.ownedTeams) ? rawSports.ownedTeams : []
  };

  const projects: MajorProject[] = Array.isArray(raw.projects) ? raw.projects : [];
  const companies: Company[] = Array.isArray(raw.companies) ? raw.companies : [];
  const education: EducationRecord[] = Array.isArray(raw.education) ? raw.education : [];
  const careerHistory: JobRecord[] = Array.isArray(raw.careerHistory) ? raw.careerHistory : [];
  const currentJob: JobRecord | null = raw.currentJob || null;
  const relationships: RelationshipPerson[] = Array.isArray(raw.relationships) ? raw.relationships : [];
  const familyTree: RelationshipPerson[] = Array.isArray(raw.familyTree) ? raw.familyTree : [];
  const world: CountryState[] = Array.isArray(raw.world) && raw.world.length > 0 ? raw.world : [];
  const currentCountryIndex: number = typeof raw.currentCountryIndex === 'number' ? raw.currentCountryIndex : 0;

  // 5. Events Feed, Decisions & News
  const eventsFeed: SimulationEvent[] = Array.isArray(raw.eventsFeed) ? raw.eventsFeed : [];
  const pendingDecisions: PendingDecision[] = Array.isArray(raw.pendingDecisions) 
    ? raw.pendingDecisions.map(sanitizePendingDecision) 
    : [];
  const newsArchive: NewsItem[] = Array.isArray(raw.newsArchive) ? raw.newsArchive : [];
  const achievements: Achievement[] = Array.isArray(raw.achievements) ? raw.achievements : [];
  const analyticsHistory = Array.isArray(raw.analyticsHistory) ? raw.analyticsHistory : [];

  // 6. Histories & Schedulers (Phases 3, 6, 8)
  const decisionHistory = Array.isArray(raw.decisionHistory) ? raw.decisionHistory : [];
  const consequenceHistory = Array.isArray(raw.consequenceHistory) ? raw.consequenceHistory : [];
  const delayedConsequences = Array.isArray(raw.delayedConsequences) 
    ? raw.delayedConsequences.map(sanitizeDelayedConsequence) 
    : [];
  const activeEventChains = Array.isArray(raw.activeEventChains) 
    ? raw.activeEventChains.map(sanitizeEventChain) 
    : [];
  const completedEventChains = Array.isArray(raw.completedEventChains) 
    ? raw.completedEventChains.map(sanitizeEventChain) 
    : [];

  // 7. Event Control State (Cooldowns & Expiration - Phase 9)
  const rawEventCtrl = raw.eventControlState || {};
  const eventControlState: EventControlState = {
    cooldowns: Array.isArray(rawEventCtrl.cooldowns) ? rawEventCtrl.cooldowns : [],
    monthlyCategoryCounters: typeof rawEventCtrl.monthlyCategoryCounters === 'object' && rawEventCtrl.monthlyCategoryCounters !== null
      ? rawEventCtrl.monthlyCategoryCounters
      : {},
    expiredEventsCount: typeof rawEventCtrl.expiredEventsCount === 'number' ? rawEventCtrl.expiredEventsCount : 0,
    config: rawEventCtrl.config || DEFAULT_EVENT_CONTROL_CONFIG
  };

  // 8. Dynasty Profile & Timeline (Phase 18)
  const dynastyGeneration: number = typeof raw.dynastyGeneration === 'number' ? raw.dynastyGeneration : 1;
  const dynastyHeirId: string | null = raw.dynastyHeirId || null;
  const activeChallengeId: string | null = raw.activeChallengeId || null;

  let dynastyProfile: DynastyProfile;
  if (raw.dynastyProfile && typeof raw.dynastyProfile === 'object') {
    const rawDp = raw.dynastyProfile;
    dynastyProfile = {
      dynastyName: rawDp.dynastyName || `${character.lastName} Dynasty`,
      motto: rawDp.motto || 'Perseverance, Legacy, Dominion',
      crestIcon: rawDp.crestIcon || 'Crown',
      foundedYear: typeof rawDp.foundedYear === 'number' ? rawDp.foundedYear : currentYear,
      foundedMonth: typeof rawDp.foundedMonth === 'number' ? rawDp.foundedMonth : currentMonth,
      founderName: rawDp.founderName || `${character.firstName} ${character.lastName}`,
      currentGeneration: typeof rawDp.currentGeneration === 'number' ? rawDp.currentGeneration : dynastyGeneration,
      dynastyWealth: typeof rawDp.dynastyWealth === 'number' ? rawDp.dynastyWealth : 0,
      dynastyReputation: typeof rawDp.dynastyReputation === 'number' ? rawDp.dynastyReputation : character.attributes.reputation,
      dynastyStability: typeof rawDp.dynastyStability === 'number' ? rawDp.dynastyStability : 85,
      dynastyCompaniesCount: typeof rawDp.dynastyCompaniesCount === 'number' ? rawDp.dynastyCompaniesCount : companies.length,
      dynastyPropertiesCount: typeof rawDp.dynastyPropertiesCount === 'number' ? rawDp.dynastyPropertiesCount : finances.properties.length,
      politicalInfluenceScore: typeof rawDp.politicalInfluenceScore === 'number' ? rawDp.politicalInfluenceScore : character.attributes.worldInfluence,
      majorAchievements: Array.isArray(rawDp.majorAchievements) ? rawDp.majorAchievements : ['Established the Founding Family Line'],
      majorFailures: Array.isArray(rawDp.majorFailures) ? rawDp.majorFailures : [],
      successionPlan: rawDp.successionPlan || { ...DEFAULT_SUCCESSION_PLAN },
      successionHistory: Array.isArray(rawDp.successionHistory) ? rawDp.successionHistory : [],
      timeline: Array.isArray(rawDp.timeline) ? rawDp.timeline : [
        {
          id: `dtl_founding_${Date.now()}`,
          month: currentMonth,
          year: currentYear,
          generation: 1,
          characterName: `${character.firstName} ${character.lastName}`,
          category: 'FOUNDING',
          title: `Founding of the ${character.lastName} Dynasty`,
          description: `${character.firstName} ${character.lastName} established the foundational lineage.`,
          significance: 'Historic',
          metricsChange: 'Dynasty Line Established'
        }
      ]
    };
  } else {
    dynastyProfile = createInitialDynastyProfile(character, currentYear, currentMonth);
  }

  // 9. Objectives & Campaigns (Phase 19)
  const activeCampaignId = raw.activeCampaignId !== undefined 
    ? raw.activeCampaignId 
    : (activeChallengeId?.startsWith('camp_') ? activeChallengeId : null);
  const isSandboxMode = typeof raw.isSandboxMode === 'boolean' 
    ? raw.isSandboxMode 
    : (activeCampaignId === 'camp_sandbox' || !activeCampaignId);
  const pinnedObjectiveId = raw.pinnedObjectiveId !== undefined ? raw.pinnedObjectiveId : null;
  const completedObjectiveIds = Array.isArray(raw.completedObjectiveIds) ? raw.completedObjectiveIds : [];
  const claimedObjectiveRewardIds = Array.isArray(raw.claimedObjectiveRewardIds) ? raw.claimedObjectiveRewardIds : [];
  const lifetimePhilanthropy = typeof raw.lifetimePhilanthropy === 'number' ? raw.lifetimePhilanthropy : 0;
  const activeLegacyReport = raw.activeLegacyReport || null;

  // 10. Assemble Intermediate State for Calculations
  const baseState: GameState = {
    version: '2.0',
    saveVersion: CURRENT_SAVE_VERSION,
    gameMode: raw.gameMode || 'Life Mode',
    difficulty: raw.difficulty || 'Realistic',
    currentMonth,
    currentYear,
    simulationTick,
    character,
    education,
    currentJob,
    careerHistory,
    relationships,
    familyTree,
    finances,
    companies,
    politics,
    sports,
    projects,
    world,
    currentCountryIndex,
    eventsFeed,
    pendingDecisions,
    newsArchive,
    achievements,
    analyticsHistory,
    dynastyGeneration,
    dynastyHeirId,
    activeChallengeId,
    decisionHistory,
    consequenceHistory,
    delayedConsequences,
    activeEventChains,
    completedEventChains,
    eventControlState,
    dynastyProfile,
    peakNetWorth: typeof raw.peakNetWorth === 'number' ? raw.peakNetWorth : 0,
    lifetimePhilanthropy,
    activeLegacyReport,
    activeCampaignId,
    isSandboxMode,
    pinnedObjectiveId,
    completedObjectiveIds,
    claimedObjectiveRewardIds,
    simulationSnapshots: Array.isArray(raw.simulationSnapshots) ? raw.simulationSnapshots : [],
    playerPowerProfile: raw.playerPowerProfile // temporary
  } as GameState;

  // Calculate Peak Net Worth if uninitialized
  const currentNetWorth = calculateNetWorth(baseState);
  if (!baseState.peakNetWorth || baseState.peakNetWorth < currentNetWorth) {
    baseState.peakNetWorth = currentNetWorth;
  }

  // 11. Player Power Profile & Scrutiny (Phase 10)
  if (raw.playerPowerProfile && typeof raw.playerPowerProfile === 'object' && raw.playerPowerProfile.breakdown) {
    const rawP = raw.playerPowerProfile;
    baseState.playerPowerProfile = {
      powerScore: typeof rawP.powerScore === 'number' ? rawP.powerScore : 0,
      powerTier: rawP.powerTier || 'UNKNOWN',
      visibility: typeof rawP.visibility === 'number' ? rawP.visibility : 5,
      mediaAttention: typeof rawP.mediaAttention === 'number' ? rawP.mediaAttention : 5,
      politicalInfluence: typeof rawP.politicalInfluence === 'number' ? rawP.politicalInfluence : 2,
      businessInfluence: typeof rawP.businessInfluence === 'number' ? rawP.businessInfluence : 2,
      publicInfluence: typeof rawP.publicInfluence === 'number' ? rawP.publicInfluence : 5,
      scrutiny: typeof rawP.scrutiny === 'number' ? rawP.scrutiny : 5,
      regulatoryAttention: typeof rawP.regulatoryAttention === 'number' ? rawP.regulatoryAttention : 2,
      breakdown: {
        netWorthScore: typeof rawP.breakdown?.netWorthScore === 'number' ? rawP.breakdown.netWorthScore : 0,
        businessScore: typeof rawP.breakdown?.businessScore === 'number' ? rawP.breakdown.businessScore : 0,
        politicsScore: typeof rawP.breakdown?.politicsScore === 'number' ? rawP.breakdown.politicsScore : 0,
        reputationScore: typeof rawP.breakdown?.reputationScore === 'number' ? rawP.breakdown.reputationScore : 0,
        mediaScore: typeof rawP.breakdown?.mediaScore === 'number' ? rawP.breakdown.mediaScore : 0,
        projectsScore: typeof rawP.breakdown?.projectsScore === 'number' ? rawP.breakdown.projectsScore : 0,
        sportsScore: typeof rawP.breakdown?.sportsScore === 'number' ? rawP.breakdown.sportsScore : 0,
        philanthropyScore: typeof rawP.breakdown?.philanthropyScore === 'number' ? rawP.breakdown.philanthropyScore : 0
      },
      tierPerks: Array.isArray(rawP.tierPerks) ? rawP.tierPerks : [],
      tierBurdens: Array.isArray(rawP.tierBurdens) ? rawP.tierBurdens : [],
      progressToNextTierPercent: typeof rawP.progressToNextTierPercent === 'number' ? rawP.progressToNextTierPercent : 0,
      nextTier: rawP.nextTier || 'LOCAL',
      pointsToNextTier: typeof rawP.pointsToNextTier === 'number' ? rawP.pointsToNextTier : 70,
      tierRank: typeof rawP.tierRank === 'number' ? rawP.tierRank : 0
    };
  } else {
    // Generate power profile fresh from actual game state
    baseState.playerPowerProfile = calculatePlayerPowerProfile(baseState);
  }

  // 12. Life Progression Profile (Expansion 1A)
  if (raw.lifeProgression) {
    baseState.lifeProgression = raw.lifeProgression;
  }
  baseState.lifeProgression = migrateProgressionProfile(baseState);

  // 13. Deep Life Simulation & Tier-Specific Gameplay (Expansion 1B)
  if (raw.lifeGameplay && typeof raw.lifeGameplay === 'object' && Array.isArray(raw.lifeGameplay.activePressures)) {
    const rawG = raw.lifeGameplay;
    baseState.lifeGameplay = {
      currentResponsibilities: Array.isArray(rawG.currentResponsibilities) ? rawG.currentResponsibilities : [],
      activePressures: Array.isArray(rawG.activePressures) ? rawG.activePressures : [],
      activeOpportunities: Array.isArray(rawG.activeOpportunities) ? rawG.activeOpportunities : [],
      complexity: rawG.complexity || {
        overallComplexity: 10,
        lifestyleComplexity: 10,
        organizationalComplexity: 0,
        publicVisibilityComplexity: 5,
        familyComplexity: 5,
        legacyComplexity: 0,
        complexityTier: 'Minimal',
        activeContributors: [],
        managementCapacityRatio: 0.5
      },
      strategyProfile: rawG.strategyProfile || {
        primaryTendency: 'CAUTIOUS',
        secondaryTendency: 'LONG_TERM',
        tendencyScores: { CAUTIOUS: 50, AGGRESSIVE: 20, OPPORTUNISTIC: 20, LONG_TERM: 40, PROFESSIONAL: 30, ENTREPRENEURIAL: 20, INFLUENTIAL: 20, DYNASTIC: 20 },
        recentBehaviorSummary: 'Maintaining foundational prudence.',
        strengths: ['Resilient against downturns'],
        vulnerabilities: ['Slower capital growth']
      },
      activeCrises: Array.isArray(rawG.activeCrises) ? rawG.activeCrises : [],
      milestones: Array.isArray(rawG.milestones) ? rawG.milestones : [],
      lastEvaluatedTick: typeof rawG.lastEvaluatedTick === 'number' ? rawG.lastEvaluatedTick : baseState.simulationTick,
      strategicOutlook: rawG.strategicOutlook || {
        summary: 'Operating with balanced life commitments.',
        priorities: ['Maintain emergency cash reserves.'],
        criticalWarnings: []
      }
    };
  } else {
    // Dynamically evaluate life gameplay from state
    const { updatedGameplayProfile } = evaluateLifeGameplay(baseState, baseState);
    baseState.lifeGameplay = updatedGameplayProfile;
  }

  // 14. Living World & Autonomous Simulation Profile (Expansion 1D)
  if (raw.livingWorld) {
    baseState.livingWorld = raw.livingWorld;
  }
  baseState.livingWorld = ensureLivingWorldProfile(baseState);

  // 15. Expansion 2: Professional Power, Banking, Investments, Property, Law, Government
  if (raw.financialLedger) baseState.financialLedger = raw.financialLedger;
  if (raw.expansion2FinancialLedger) baseState.expansion2FinancialLedger = raw.expansion2FinancialLedger;
  baseState.financialLedger = ensureFinancialLedger(baseState);

  if (raw.expandedCareer) baseState.expandedCareer = raw.expandedCareer;
  if (raw.expansion2Career) baseState.expansion2Career = raw.expansion2Career;
  ensureCareerSystemState(baseState);

  if (raw.bankingProfile) baseState.bankingProfile = raw.bankingProfile;
  if (raw.creditProfileState) baseState.creditProfileState = raw.creditProfileState;
  if (raw.expansion2BankingCredit) baseState.expansion2BankingCredit = raw.expansion2BankingCredit;
  ensureBankingCreditState(baseState);

  if (raw.investmentMarket) baseState.investmentMarket = raw.investmentMarket;
  if (raw.expansion2InvestmentMarket) baseState.expansion2InvestmentMarket = raw.expansion2InvestmentMarket;
  ensureInvestmentMarketState(baseState);

  if (raw.propertyPortfolio) baseState.propertyPortfolio = raw.propertyPortfolio;
  if (raw.expansion2PropertySystem) baseState.expansion2PropertySystem = raw.expansion2PropertySystem;
  ensurePropertySystemState(baseState);

  if (raw.expansion2CorporateSystem) baseState.expansion2CorporateSystem = raw.expansion2CorporateSystem;
  ensureCorporateSystemState(baseState);

  if (raw.legalProfile) baseState.legalProfile = raw.legalProfile;
  if (raw.expansion2Legal) baseState.expansion2Legal = raw.expansion2Legal;
  ensureLegalSystemState(baseState);

  if (raw.governmentOffice) baseState.governmentOffice = raw.governmentOffice;
  if (raw.expansion2Government) baseState.expansion2Government = raw.expansion2Government;
  ensureGovernmentSystemState(baseState);

  return baseState;
}

/**
 * Gets all saved slots from persistent storage, migrating older saves automatically.
 */
export function getSavedSlots(): SaveSlot[] {
  try {
    const raw = getStorageItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((slot: any) => {
      try {
        if (!slot || !slot.gameState) return slot;
        const migratedState = migrateGameState(slot.gameState);
        return {
          ...slot,
          saveVersion: CURRENT_SAVE_VERSION,
          gameState: migratedState
        };
      } catch (err) {
        console.warn(`Warning: failed to migrate save slot ${slot?.slotId}`, err);
        return slot;
      }
    }).filter(Boolean);
  } catch (e) {
    console.error('Failed to parse save slots', e);
    return [];
  }
}

/**
 * Saves the current game state to a specified slot with schema versioning.
 */
export function saveGameToSlot(state: GameState, slotId: string, slotTitle?: string): SaveSlot[] {
  if (!state || !state.character) return [];
  try {
    const slots = getSavedSlots();
    const netWorth = calculateNetWorth(state);
    const title = slotTitle || `${state.character.firstName} ${state.character.lastName} - Age ${state.character.age}`;

    // Ensure current state is fully migrated and tagged with version
    const sanitizedState: GameState = {
      ...state,
      version: '2.0',
      saveVersion: CURRENT_SAVE_VERSION
    };

    const newSlot: SaveSlot = {
      slotId,
      title,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      characterName: `${sanitizedState.character.firstName} ${sanitizedState.character.lastName}`,
      age: sanitizedState.character.age,
      cash: sanitizedState.finances?.cash ?? 0,
      netWorth,
      careerTitle: sanitizedState.currentJob ? sanitizedState.currentJob.title : sanitizedState.politics?.currentOffice?.inOffice ? sanitizedState.politics.currentOffice.title : 'Independent',
      gameMode: sanitizedState.gameMode,
      difficulty: sanitizedState.difficulty,
      saveVersion: CURRENT_SAVE_VERSION,
      gameState: sanitizedState
    };

    const existingIdx = slots.findIndex(s => s.slotId === slotId);
    if (existingIdx !== -1) {
      slots[existingIdx] = newSlot;
    } else {
      slots.unshift(newSlot);
    }

    try {
      setStorageItem(STORAGE_KEY, JSON.stringify(slots));
    } catch (e) {
      console.error('Failed to save slots', e);
    }
    return slots;
  } catch (err) {
    console.error('Failed in saveGameToSlot:', err);
    return [];
  }
}

/**
 * Executes a safe auto-save of the active game session.
 */
export function autoSaveGame(state: GameState): void {
  if (!state || !state.character) return;
  saveGameToSlot(state, AUTOSAVE_SLOT_ID, `Auto-Save: ${state.character.firstName} (Age ${state.character.age})`);
}

/**
 * Loads and migrates a game state from a specific save slot.
 */
export function loadGameFromSlot(slotId: string): GameState | null {
  try {
    const slots = getSavedSlots();
    const found = slots.find(s => s.slotId === slotId);
    if (!found || !found.gameState) return null;
    return migrateGameState(found.gameState);
  } catch (err) {
    console.error(`Failed to load game from slot "${slotId}":`, err);
    return null;
  }
}

/**
 * Deletes a save slot from persistent storage.
 */
export function deleteSaveSlot(slotId: string): SaveSlot[] {
  const slots = getSavedSlots().filter(s => s.slotId !== slotId);
  try {
    setStorageItem(STORAGE_KEY, JSON.stringify(slots));
  } catch (e) {
    console.error('Failed to delete save slot', e);
  }
  return slots;
}

/**
 * Exports game state to formatted JSON string.
 */
export function exportGameStateToJSON(state: GameState): string {
  const sanitized = {
    ...state,
    version: '2.0',
    saveVersion: CURRENT_SAVE_VERSION
  };
  return JSON.stringify(sanitized, null, 2);
}

/**
 * Imports and safely migrates a game state from JSON text.
 */
export function importGameStateFromJSON(jsonString: string): GameState {
  const parsed = JSON.parse(jsonString);
  return migrateGameState(parsed);
}
