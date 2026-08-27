import { 
  GameState, 
  RelationshipPerson, 
  AdvancedPersonality, 
  PersonalityArchetype, 
  NpcMotivation, 
  NpcGoal, 
  NpcMemory, 
  RelationshipSentiment, 
  RelationshipStage, 
  RivalryRecord, 
  RivalryEscalationStage, 
  StoryThread, 
  StorySeed, 
  StoryThreadCategory, 
  StoryThreadState, 
  NarrativeArcType, 
  ScandalRecord, 
  ScandalStage, 
  ScandalResponseOption, 
  StakeholderGroup, 
  StakeholderPerception, 
  MediaAttentionProfile, 
  LifeChapterRecord, 
  EmergentNarrativeProfile, 
  LifeEvent, 
  NewsItem 
} from '../types';
import { 
  PERSONALITY_NARRATIVE_CONFIG, 
  DEFAULT_ADVANCED_PERSONALITY, 
  ARCHETYPE_CRITERIA 
} from './personalityNarrativeConfig';
import { calculateNetWorth } from './simulationEngine';

/**
 * Ensures that a character or NPC has a fully formed Advanced Personality.
 */
export function ensureAdvancedPersonality(
  person: RelationshipPerson | { advancedPersonality?: AdvancedPersonality; gender?: string; relation?: string },
  seed = 0
): AdvancedPersonality {
  if (person.advancedPersonality) {
    return person.advancedPersonality;
  }

  // Derive stable pseudo-random traits based on identity
  const base = { ...DEFAULT_ADVANCED_PERSONALITY };
  const s = Math.abs(seed) % 100;
  
  base.ambition = Math.min(100, Math.max(20, base.ambition + ((s % 31) - 15)));
  base.riskTolerance = Math.min(100, Math.max(15, base.riskTolerance + (((s * 3) % 41) - 20)));
  base.loyalty = Math.min(100, Math.max(30, base.loyalty + (((s * 7) % 35) - 15)));
  base.discipline = Math.min(100, Math.max(25, base.discipline + (((s * 11) % 31) - 15)));
  base.aggression = Math.min(100, Math.max(10, base.aggression + (((s * 13) % 41) - 20)));
  base.empathy = Math.min(100, Math.max(20, base.empathy + (((s * 17) % 35) - 15)));
  base.pride = Math.min(100, Math.max(25, base.pride + (((s * 19) % 35) - 15)));
  base.caution = Math.min(100, Math.max(20, base.caution + (((s * 23) % 35) - 15)));
  base.adaptability = Math.min(100, Math.max(30, base.adaptability + (((s * 29) % 31) - 15)));
  base.vanity = Math.min(100, Math.max(10, base.vanity + (((s * 37) % 41) - 20)));
  base.patience = Math.min(100, Math.max(25, base.patience + (((s * 41) % 35) - 15)));
  base.integrity = Math.min(100, Math.max(30, base.integrity + (((s * 43) % 35) - 15)));

  person.advancedPersonality = base;
  return base;
}

/**
 * Derives the active Personality Archetype from trait combinations.
 */
export function derivePersonalityArchetype(
  personality: AdvancedPersonality,
  gender = 'Male'
): PersonalityArchetype {
  let highestScore = -Infinity;
  let bestArchetype: PersonalityArchetype = 'The Pragmatic Realist';

  for (const item of ARCHETYPE_CRITERIA) {
    if (gender === 'Female' && item.archetype === 'The Family-First Patriarch') continue;
    if (gender !== 'Female' && item.archetype === 'The Family-First Matriarch') continue;

    const score = item.evaluator(personality);
    if (score > highestScore) {
      highestScore = score;
      bestArchetype = item.archetype;
    }
  }

  return bestArchetype;
}

/**
 * Evolves a personality gradually in response to major life crises or victories.
 */
export function evolvePersonality(
  personality: AdvancedPersonality,
  trait: keyof AdvancedPersonality,
  delta: number,
  reason?: string
): AdvancedPersonality {
  const boundedDelta = Math.max(-15, Math.min(15, delta)); // Bounded change
  personality[trait] = Math.min(100, Math.max(5, personality[trait] + boundedDelta));
  return personality;
}

/**
 * Evaluates dynamic motivations for an NPC based on traits, tier, wealth, and relationships.
 */
export function evaluateNpcMotivations(
  npc: RelationshipPerson,
  state: GameState
): NpcMotivation[] {
  const personality = ensureAdvancedPersonality(npc, npc.age + (npc.wealth || 0));
  const motivations: NpcMotivation[] = [];

  // 1. Family Motivation for Spouses, Children & Parents
  if (['Spouse', 'Partner', 'Son', 'Daughter', 'Father', 'Mother'].includes(npc.relation)) {
    motivations.push({
      type: 'FAMILY',
      priority: 1,
      source: 'Kinship Attachment',
      description: `Protects household harmony, inheritance security, and family stability.`
    });
  }

  // 2. Ambition / Power / Wealth for Executives, Business Partners & Rivals
  if (personality.ambition >= 70) {
    motivations.push({
      type: 'POWER',
      priority: 2,
      source: 'Towering Ambition',
      description: `Seeks expanded authority, executive control, and institutional clout.`
    });
  } else if (personality.riskTolerance >= 65 || (npc.wealth || 0) < 50000) {
    motivations.push({
      type: 'WEALTH',
      priority: 3,
      source: 'Capital Accumulation',
      description: `Focuses on expanding liquid reserves and lucrative commercial returns.`
    });
  }

  // 3. Security / Survival during Financial Distress or Age
  if ((npc.wealth || 0) < 10000 || npc.age > 65) {
    motivations.push({
      type: 'SECURITY',
      priority: 2,
      source: 'Precautionary Security',
      description: `Wants dependable recurring income and protection from financial shocks.`
    });
  }

  // 4. Revenge / Rivalry
  if (npc.relation === 'Rival' || (npc.conflictStatus && npc.conflictStatus === 'Openly Rival')) {
    motivations.push({
      type: 'REVENGE',
      priority: 1,
      source: 'Rivalry Friction',
      targetEntityId: state.character.id,
      description: `Motivated to outperform or diminish the player's market and political standing.`
    });
  }

  // 5. Legacy for Senior NPCs
  if (npc.age >= 55 && (personality.empathy >= 50 || personality.loyalty >= 60)) {
    motivations.push({
      type: 'LEGACY',
      priority: 4,
      source: 'Generational Stewardship',
      description: `Prepares the next generation for sustainable succession.`
    });
  }

  return motivations.slice(0, 3);
}

/**
 * Evaluates persistent long-term goals for an NPC.
 */
export function evaluateNpcGoals(
  npc: RelationshipPerson,
  state: GameState
): NpcGoal[] {
  if (npc.goals && npc.goals.length > 0) {
    // Update existing goals progress
    return npc.goals.map(g => {
      if (g.status === 'ACTIVE') {
        const progress = Math.min(100, Math.round((g.currentValue / Math.max(1, g.targetValue)) * 100));
        return {
          ...g,
          progressPercent: progress,
          status: progress >= 100 ? 'COMPLETED' : 'ACTIVE',
          completedMonth: progress >= 100 ? state.currentMonth : undefined,
          completedYear: progress >= 100 ? state.currentYear : undefined
        };
      }
      return g;
    });
  }

  const goals: NpcGoal[] = [];
  const personality = ensureAdvancedPersonality(npc);

  if (npc.relation === 'Son' || npc.relation === 'Daughter') {
    goals.push({
      id: `goal_${npc.id}_edu`,
      title: 'Complete Elite Academic Credentials',
      description: 'Attain high academic honors and business qualifications.',
      category: 'Career',
      targetMetric: 'Education',
      targetValue: 100,
      currentValue: npc.education === 'Ivy League' ? 100 : (npc.skills?.intellect || 60),
      status: npc.education === 'Ivy League' ? 'COMPLETED' : 'ACTIVE',
      progressPercent: npc.education === 'Ivy League' ? 100 : 60,
      startedMonth: state.currentMonth,
      startedYear: state.currentYear
    });
  } else if (npc.relation === 'Business Partner' || npc.relation === 'Rival') {
    goals.push({
      id: `goal_${npc.id}_wealth`,
      title: 'Attain $10M Independent Valuation',
      description: 'Expand private holdings and enterprise value to eight figures.',
      category: 'Business',
      targetMetric: 'NetWorth',
      targetValue: 10000000,
      currentValue: npc.wealth || 500000,
      status: (npc.wealth || 0) >= 10000000 ? 'COMPLETED' : 'ACTIVE',
      progressPercent: Math.min(100, Math.round(((npc.wealth || 500000) / 10000000) * 100)),
      startedMonth: state.currentMonth,
      startedYear: state.currentYear
    });
  } else {
    goals.push({
      id: `goal_${npc.id}_security`,
      title: 'Secure Household Financial Solvency',
      description: 'Build robust capital reserves and reliable real estate assets.',
      category: 'Financial',
      targetMetric: 'Capital',
      targetValue: 1000000,
      currentValue: npc.wealth || 250000,
      status: (npc.wealth || 0) >= 1000000 ? 'COMPLETED' : 'ACTIVE',
      progressPercent: Math.min(100, Math.round(((npc.wealth || 250000) / 1000000) * 100)),
      startedMonth: state.currentMonth,
      startedYear: state.currentYear
    });
  }

  return goals;
}

/**
 * Records a significant interaction memory for an NPC.
 */
export function recordNpcMemory(
  npc: RelationshipPerson,
  memory: Omit<NpcMemory, 'id'>
): NpcMemory {
  if (!npc.memories) npc.memories = [];

  const id = `mem_${npc.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const fullMemory: NpcMemory = {
    ...memory,
    id
  };

  // Add memory and maintain capacity limit
  npc.memories.unshift(fullMemory);
  if (npc.memories.length > PERSONALITY_NARRATIVE_CONFIG.MAX_MEMORIES_PER_NPC) {
    // Keep landmark memories and prune oldest short-term
    const landmarks = npc.memories.filter(m => m.persistenceTier === 'LANDMARK');
    const others = npc.memories.filter(m => m.persistenceTier !== 'LANDMARK');
    npc.memories = [...landmarks, ...others].slice(0, PERSONALITY_NARRATIVE_CONFIG.MAX_MEMORIES_PER_NPC);
  }

  // Update dynamic relationship sentiment immediately
  if (!npc.sentiment) {
    npc.sentiment = evaluateRelationshipSentiment(npc);
  }

  if (memory.sentimentDelta) {
    if (memory.sentimentDelta.trust) npc.trust = Math.min(100, Math.max(0, npc.trust + memory.sentimentDelta.trust));
    if (memory.sentimentDelta.affection) npc.love = Math.min(100, Math.max(0, npc.love + memory.sentimentDelta.affection));
    if (memory.sentimentDelta.respect) npc.respect = Math.min(100, Math.max(0, (npc.respect || 60) + memory.sentimentDelta.respect));
    if (memory.sentimentDelta.loyalty) npc.loyalty = Math.min(100, Math.max(0, (npc.loyalty || 60) + memory.sentimentDelta.loyalty));
  }

  return fullMemory;
}

/**
 * Decays non-landmark memories over time.
 */
export function decayAndPruneMemories(npc: RelationshipPerson): void {
  if (!npc.memories || npc.memories.length === 0) return;

  npc.memories = npc.memories.filter(mem => {
    if (mem.persistenceTier === 'LANDMARK' || mem.decayMonthsRemaining === -1) {
      return true; // Never decays
    }
    mem.decayMonthsRemaining -= 1;
    return mem.decayMonthsRemaining > 0;
  });
}

/**
 * Computes multi-dimensional relationship sentiment from authoritative traits, history, and memories.
 */
export function evaluateRelationshipSentiment(
  npc: RelationshipPerson
): RelationshipSentiment {
  const trust = npc.trust ?? 60;
  const affection = npc.love ?? 60;
  const respect = npc.respect ?? 60;
  const loyalty = npc.loyalty ?? 60;

  // Derive fear, resentment, competition, and dependency
  let fear = 10;
  let resentment = 10;
  let competition = 15;
  let dependency = 20;

  if (npc.relation === 'Rival') {
    competition = 85;
    resentment = Math.max(30, 100 - trust);
  } else if (npc.relation === 'Son' || npc.relation === 'Daughter') {
    dependency = npc.age < 18 ? 85 : 30;
    competition = npc.isRivalHeir ? 75 : 10;
  } else if (npc.relation === 'Business Partner') {
    competition = 40;
    dependency = 45;
  }

  // Memories impact
  if (npc.memories && npc.memories.length > 0) {
    for (const mem of npc.memories) {
      if (mem.eventType === 'BETRAYAL' || mem.eventType === 'HUMILIATION') {
        resentment = Math.min(100, resentment + 25);
      }
      if (mem.eventType === 'RESCUE' || mem.eventType === 'GENEROSITY') {
        dependency = Math.min(100, dependency + 15);
      }
    }
  }

  // Derive contextual descriptor
  let descriptor = 'Reliable Contact';
  if (affection >= 80 && trust >= 80) descriptor = 'Devoted Confidant';
  else if (respect >= 80 && competition >= 70) descriptor = 'Respected Adversary';
  else if (competition >= 80 && resentment >= 60) descriptor = 'Bitter Rival';
  else if (loyalty >= 85) descriptor = 'Loyal Protege';
  else if (dependency >= 70) descriptor = 'Protected Dependent';
  else if (resentment >= 70) descriptor = 'Resentful Subordinate';
  else if (affection >= 75) descriptor = 'Cherished Kin';
  else if (trust <= 30) descriptor = 'Distrusted Associate';

  return {
    trust,
    respect,
    affection,
    fear,
    resentment,
    dependency,
    loyalty,
    competition,
    descriptor
  };
}

/**
 * Derives relationship evolution stage.
 */
export function evaluateRelationshipStage(
  npc: RelationshipPerson,
  sentiment: RelationshipSentiment
): RelationshipStage {
  if (npc.relation === 'Rival' || sentiment.competition >= 85) {
    return sentiment.resentment >= 75 ? 'ARCH_NEMESIS' : 'BITTER_RIVAL';
  }
  if (sentiment.competition >= 60) return 'COMPETITOR';
  if (sentiment.resentment >= 80 && sentiment.affection <= 20) return 'ESTRANGED';
  if (sentiment.trust >= 85 && sentiment.loyalty >= 80) return 'TRUSTED_PARTNER';
  if (sentiment.trust >= 75 && sentiment.respect >= 70) return 'STRATEGIC_ALLY';
  if (sentiment.trust >= 70 && sentiment.affection >= 70) return 'CONFIDANT';
  if (sentiment.trust >= 40) return 'ACQUAINTANCE';
  return 'STRANGER';
}

/**
 * Evaluates active rivalries in the player's ecosystem.
 */
export function evaluateRivalries(
  prevState: GameState,
  state: GameState
): { activeRivalries: RivalryRecord[]; generatedEvents: LifeEvent[]; generatedNews: NewsItem[] } {
  const currentNarrative = ensureEmergentNarrativeState(state);
  const rivalries = [...(currentNarrative.activeRivalries || [])];
  const events: LifeEvent[] = [];
  const news: NewsItem[] = [];

  // Detect new organic rivals from relationships or companies
  for (const rel of state.relationships) {
    if (rel.relation === 'Rival' || rel.conflictStatus === 'Openly Rival') {
      const existing = rivalries.find(r => r.opponentId === rel.id);
      if (!existing) {
        const newRivalry: RivalryRecord = {
          id: `rivalry_${rel.id}_${state.simulationTick}`,
          opponentId: rel.id,
          opponentName: rel.name,
          opponentRole: rel.occupation || 'Industry Competitor',
          domain: 'Corporate',
          intensity: 65,
          originEvent: 'Market Clash & Personality Friction',
          startedMonth: state.currentMonth,
          startedYear: state.currentYear,
          escalationStage: 'TENSION',
          currentObjective: 'Outperform competitor in gross revenues and market share.',
          playerAdvantage: 10,
          historyHighlights: [`Rivalry sparked in ${state.currentMonth}/${state.currentYear}`]
        };
        rivalries.push(newRivalry);

        events.push({
          id: `ev_rival_emerge_${rel.id}_${state.simulationTick}`,
          timestampMonth: state.currentMonth,
          timestampYear: state.currentYear,
          age: state.character.age,
          category: 'Business',
          type: 'WARNING',
          title: `Rivalry Emergence: ${rel.name}`,
          description: `Tensions with ${rel.name} have escalated into an active competitive rivalry in the corporate sphere.`,
          consequences: {
            details: [`Rivalry registered: ${rel.name} (${newRivalry.domain})`]
          }
        });
      }
    }
  }

  // Advance existing rivalries
  for (const rivalry of rivalries) {
    if (rivalry.escalationStage === 'RESOLVED') continue;

    // Simulate competitive shift
    const playerCompanies = state.companies;
    const playerProfitable = playerCompanies.some(c => c.monthlyNetProfit > 50000);
    if (playerProfitable) {
      rivalry.playerAdvantage = Math.min(100, rivalry.playerAdvantage + 5);
    } else {
      rivalry.playerAdvantage = Math.max(-100, rivalry.playerAdvantage - 5);
    }

    // Escalation logic
    if (rivalry.intensity >= 80 && rivalry.escalationStage === 'TENSION') {
      rivalry.escalationStage = 'COMPETITION';
      rivalry.historyHighlights.push(`Escalated to open market competition in ${state.currentMonth}/${state.currentYear}`);
    } else if (rivalry.intensity >= 90 && rivalry.escalationStage === 'COMPETITION') {
      rivalry.escalationStage = 'CRISIS';
      rivalry.historyHighlights.push(`High-stakes crisis clash reached in ${state.currentMonth}/${state.currentYear}`);
      
      news.push({
        id: `news_rival_clash_${rivalry.id}_${state.simulationTick}`,
        month: state.currentMonth,
        year: state.currentYear,
        headline: `Corporate Battle: ${state.character.firstName} ${state.character.lastName} Clashes with ${rivalry.opponentName}`,
        body: `Industry analysts report escalating commercial friction and aggressive market maneuvers between both powerhouse operators.`,
        category: 'Business',
        importance: 'MAJOR',
        severity: 'Warning',
        impactExplanation: `Rivalry with ${rivalry.opponentName} reached crisis intensity.`
      });
    }
  }

  return {
    activeRivalries: rivalries.slice(0, PERSONALITY_NARRATIVE_CONFIG.MAX_ACTIVE_RIVALRIES),
    generatedEvents: events,
    generatedNews: news
  };
}

/**
 * Detects emerging story seeds from actual authoritative state changes.
 */
export function detectStorySeeds(
  prevState: GameState,
  state: GameState
): StorySeed[] {
  const seeds: StorySeed[] = [];
  const currentNetWorth = calculateNetWorth(state);
  const prevNetWorth = calculateNetWorth(prevState);

  // 1. Financial Comeback Seed
  if (prevState.finances.cash < 0 && state.finances.cash > 50000) {
    seeds.push({
      id: `seed_comeback_${state.simulationTick}`,
      category: 'FINANCIAL_RECOVERY',
      title: 'The Great Financial Turnaround',
      triggerFact: 'Transitioned from cashflow deficit to solvent liquidity buffer.',
      entityIds: [state.character.id],
      priority: 9,
      startingTension: 50
    });
  }

  // 2. Business Expansion / Acquisition Seed
  if (state.companies.length > prevState.companies.length) {
    const newComp = state.companies[state.companies.length - 1];
    seeds.push({
      id: `seed_expansion_${newComp.id}_${state.simulationTick}`,
      category: 'BUSINESS_EXPANSION',
      title: `The Rise of ${newComp.name}`,
      triggerFact: `Founded or acquired operating enterprise ${newComp.name}.`,
      entityIds: [newComp.id],
      priority: 8,
      startingTension: 40
    });
  }

  // 3. Dynastic Succession / Heir Rivalry Seed
  const rivalHeir = state.relationships.find(r => r.isRivalHeir || r.conflictStatus === 'Openly Rival');
  if (rivalHeir) {
    seeds.push({
      id: `seed_heir_conflict_${rivalHeir.id}_${state.simulationTick}`,
      category: 'SUCCESSION_CRISIS',
      title: `The Contested Dynasty Succession`,
      triggerFact: `Heir ${rivalHeir.name} is disputing generational inheritance allocation.`,
      entityIds: [rivalHeir.id],
      priority: 9,
      startingTension: 65
    });
  }

  // 4. Political Rise Seed
  if (state.politics.currentOffice.inOffice && !prevState.politics.currentOffice.inOffice) {
    seeds.push({
      id: `seed_pol_rise_${state.simulationTick}`,
      category: 'POLITICAL_RISE',
      title: `Mandate of Power: The ${state.politics.currentOffice.title} Era`,
      triggerFact: `Inaugurated into executive public office as ${state.politics.currentOffice.title}.`,
      entityIds: [state.character.id],
      priority: 9,
      startingTension: 55
    });
  }

  return seeds;
}

/**
 * Advances and updates persistent Story Threads.
 */
export function advanceStoryThreads(
  state: GameState,
  prevState: GameState,
  seeds: StorySeed[]
): { activeThreads: StoryThread[]; resolvedThreads: StoryThread[] } {
  const currentNarrative = ensureEmergentNarrativeState(state);
  const active = [...(currentNarrative.activeStoryThreads || [])];
  const resolved = [...(currentNarrative.resolvedStoryThreads || [])];

  // Convert new seeds into active threads if under limit
  for (const seed of seeds) {
    if (active.length >= PERSONALITY_NARRATIVE_CONFIG.MAX_ACTIVE_STORY_THREADS) break;
    if (active.some(t => t.category === seed.category)) continue;

    const newThread: StoryThread = {
      id: `thread_${seed.category.toLowerCase()}_${state.simulationTick}`,
      category: seed.category,
      title: seed.title,
      summary: seed.triggerFact,
      participants: [{ id: state.character.id, name: `${state.character.firstName} ${state.character.lastName}`, role: 'Protagonist' }],
      state: 'EMERGING',
      tensionLevel: seed.startingTension,
      startedMonth: state.currentMonth,
      startedYear: state.currentYear,
      lastUpdatedTick: state.simulationTick,
      keyEvents: [
        {
          month: state.currentMonth,
          year: state.currentYear,
          headline: seed.triggerFact,
          significance: 'Story Inception'
        }
      ],
      recentDevelopment: seed.triggerFact,
      possiblePlayerRelevance: 'Directly shapes your historical chronicle and reputation stature.',
      narrativeArc: seed.category === 'FINANCIAL_RECOVERY' ? 'COMEBACK' : (seed.category === 'POLITICAL_RISE' ? 'POLITICAL_ASCENT' : 'RISE')
    };

    active.push(newThread);
  }

  // Advance each active thread
  for (const thread of active) {
    thread.lastUpdatedTick = state.simulationTick;
    
    // Evolve based on state reality
    if (thread.category === 'FINANCIAL_RECOVERY') {
      if (state.finances.cash > 250000) {
        thread.state = 'RESOLVED';
        thread.recentDevelopment = 'Turnaround achieved: Solidified high-six-figure liquid treasury.';
        thread.keyEvents.push({
          month: state.currentMonth,
          year: state.currentYear,
          headline: 'Full financial solvency & treasury strength restored.',
          significance: 'Triumph'
        });
      }
    } else if (thread.category === 'POLITICAL_RISE') {
      if (!state.politics.currentOffice.inOffice) {
        thread.state = 'RESOLVED';
        thread.recentDevelopment = 'Executive mandate concluded honorably.';
        thread.keyEvents.push({
          month: state.currentMonth,
          year: state.currentYear,
          headline: 'Stepped down from active political mandate into elder statesman role.',
          significance: 'Resolution'
        });
      }
    }
  }

  // Move resolved threads
  const remainingActive: StoryThread[] = [];
  for (const thread of active) {
    if (thread.state === 'RESOLVED' || thread.state === 'FAILED') {
      resolved.unshift(thread);
    } else {
      remainingActive.push(thread);
    }
  }

  return {
    activeThreads: remainingActive.slice(0, PERSONALITY_NARRATIVE_CONFIG.MAX_ACTIVE_STORY_THREADS),
    resolvedThreads: resolved.slice(0, PERSONALITY_NARRATIVE_CONFIG.MAX_RESOLVED_STORY_THREADS)
  };
}

/**
 * Detects and evaluates active scandals.
 */
export function detectAndEvaluateScandals(
  prevState: GameState,
  state: GameState
): { activeScandals: ScandalRecord[]; scandalHistory: ScandalRecord[]; generatedEvents: LifeEvent[]; generatedNews: NewsItem[] } {
  const currentNarrative = ensureEmergentNarrativeState(state);
  const activeScandals = [...(currentNarrative.activeScandals || [])];
  const scandalHistory = [...(currentNarrative.scandalHistory || [])];
  const events: LifeEvent[] = [];
  const news: NewsItem[] = [];

  // Detect organic scandal triggers (e.g. corporate insolvency with lavish living, extreme political controversy)
  const isLavishInsolvent = state.finances.cash < -50000 && (state.character.possessions?.luxuries?.length || 0) > 2;
  if (isLavishInsolvent && !activeScandals.some(s => s.category === 'Financial')) {
    const newScandal: ScandalRecord = {
      id: `scandal_fin_${state.simulationTick}`,
      title: 'Lavish Spending Amid Corporate Insolvency',
      category: 'Financial',
      stage: 'RUMOR',
      exposureLevel: 30,
      publicImpact: 45,
      factualBasis: 'Operating deep in personal and corporate debt while maintaining high luxury inventory.',
      affectedStakeholders: ['PUBLIC', 'BUSINESS', 'INSTITUTIONAL'],
      reputationPenaltyMonthly: -3,
      legalRisk: 35,
      startedMonth: state.currentMonth,
      startedYear: state.currentYear,
      responseHistory: []
    };
    activeScandals.push(newScandal);

    events.push({
      id: `ev_scandal_emerge_${state.simulationTick}`,
      timestampMonth: state.currentMonth,
      timestampYear: state.currentYear,
      age: state.character.age,
      category: 'Life',
      type: 'WARNING',
      title: 'Scandal Emerging: Financial Scrutiny',
      description: 'Investigative journalists are raising questions regarding your luxury holdings amid mounting debt liabilities.',
      consequences: {
        reputationChange: -4,
        details: ['Scandal Stage: Rumor', 'Public impact rating: 45/100']
      }
    });
  }

  // Advance exposure and stages of active scandals
  for (const scandal of activeScandals) {
    if (scandal.stage === 'RESOLVED') continue;

    // Apply ongoing penalty
    const penalty = PERSONALITY_NARRATIVE_CONFIG.SCANDAL.BASE_REPUTATION_PENALTY[scandal.stage] || -2;
    state.character.attributes.reputation = Math.max(5, state.character.attributes.reputation + penalty);

    // Natural exposure escalation if ignored
    if (scandal.responseHistory.length === 0 && scandal.exposureLevel < 85) {
      scandal.exposureLevel += 5;
      if (scandal.exposureLevel >= 75 && scandal.stage !== 'ESCALATING') {
        scandal.stage = 'ESCALATING';
        news.push({
          id: `news_scandal_${scandal.id}_${state.simulationTick}`,
          month: state.currentMonth,
          year: state.currentYear,
          headline: `Public Inquiry Intensifies: ${scandal.title}`,
          body: `Regulators and media watchdogs escalate their inquiry into ${state.character.firstName} ${state.character.lastName}.`,
          category: 'Politics',
          importance: 'MAJOR',
          severity: 'Warning',
          impactExplanation: `Reputation penalized by ${penalty} pts/mo.`
        });
      } else if (scandal.exposureLevel >= 50 && scandal.stage === 'RUMOR') {
        scandal.stage = 'PUBLIC';
      }
    }
  }

  return {
    activeScandals: activeScandals.slice(0, PERSONALITY_NARRATIVE_CONFIG.MAX_ACTIVE_SCANDALS),
    scandalHistory: scandalHistory.slice(0, PERSONALITY_NARRATIVE_CONFIG.MAX_SCANDAL_HISTORY),
    generatedEvents: events,
    generatedNews: news
  };
}

/**
 * Applies player's crisis response to an active scandal.
 */
export function respondToScandal(
  state: GameState,
  scandalId: string,
  responseType: ScandalResponseOption,
  customStatement?: string
): { success: boolean; message: string; state: GameState } {
  const currentNarrative = ensureEmergentNarrativeState(state);
  const scandal = currentNarrative.activeScandals.find(s => s.id === scandalId);
  if (!scandal) {
    return { success: false, message: 'Scandal not found.', state };
  }

  let outcomeText = '';
  if (responseType === 'APOLOGIZE' || responseType === 'REFORM') {
    scandal.exposureLevel = Math.max(10, scandal.exposureLevel - 30);
    scandal.stage = 'RESOLVED';
    scandal.resolvedMonth = state.currentMonth;
    scandal.resolvedYear = state.currentYear;
    state.character.attributes.reputation = Math.min(100, state.character.attributes.reputation + 6);
    outcomeText = 'Issued public apology and structural reforms. Crisis successfully de-escalated.';
  } else if (responseType === 'DENY' || responseType === 'COUNTERATTACK') {
    if (state.character.attributes.worldInfluence >= 60 || state.character.attributes.charm >= 70) {
      scandal.exposureLevel = Math.max(15, scandal.exposureLevel - 20);
      scandal.stage = 'LINGERING';
      outcomeText = 'Aggressive pushback neutralized immediate media frenzy.';
    } else {
      scandal.exposureLevel = Math.min(100, scandal.exposureLevel + 20);
      scandal.stage = 'ESCALATING';
      outcomeText = 'Counterattack backfired due to insufficient public leverage.';
    }
  } else if (responseType === 'EXPLAIN') {
    scandal.exposureLevel = Math.max(15, scandal.exposureLevel - 15);
    scandal.stage = 'LINGERING';
    outcomeText = 'Clear factual briefing calmed institutional stakeholders.';
  } else {
    scandal.stage = 'RESOLVED';
    scandal.resolvedMonth = state.currentMonth;
    scandal.resolvedYear = state.currentYear;
    outcomeText = 'Accepted administrative consequences and concluded proceedings.';
  }

  scandal.responseHistory.push({
    month: state.currentMonth,
    year: state.currentYear,
    responseType,
    statement: customStatement || `Issued official ${responseType} response.`,
    outcome: outcomeText
  });

  return { success: true, message: outcomeText, state };
}

/**
 * Evaluates media attention level and stakeholder perceptions.
 */
export function evaluateMediaAttention(state: GameState): MediaAttentionProfile {
  const netWorth = calculateNetWorth(state);
  const powerScore = state.playerPowerProfile?.powerScore || 50;
  const inOffice = state.politics.currentOffice.inOffice;
  const followers = state.character.socialFollowers || 0;

  let attentionScore = Math.min(100, Math.round((powerScore * 0.4) + (followers > 100000 ? 30 : 10) + (inOffice ? 30 : 0)));
  if (netWorth > 100000000) attentionScore = Math.min(100, attentionScore + 20);

  let level: MediaAttentionProfile['level'] = 'NO_ATTENTION';
  let scrutinyMultiplier = 1.0;

  if (attentionScore >= 85) {
    level = 'GLOBAL_ATTENTION';
    scrutinyMultiplier = 3.0;
  } else if (attentionScore >= 65) {
    level = 'NATIONAL_ATTENTION';
    scrutinyMultiplier = 2.2;
  } else if (attentionScore >= 40) {
    level = 'REGIONAL_ATTENTION';
    scrutinyMultiplier = 1.5;
  } else if (attentionScore >= 20) {
    level = 'LOCAL_ATTENTION';
    scrutinyMultiplier = 1.2;
  }

  const rep = state.character.attributes.reputation;
  let prevailingFraming: MediaAttentionProfile['prevailingFraming'] = 'Neutral';
  if (rep >= 80) prevailingFraming = 'Laudatory';
  else if (rep >= 60) prevailingFraming = 'Cautiously Optimistic';
  else if (rep <= 35) prevailingFraming = 'Hostile';
  else if (rep <= 50) prevailingFraming = 'Scrutinizing';

  return {
    level,
    score: attentionScore,
    scrutinyMultiplier,
    prevailingFraming,
    mediaFocusAreas: inOffice ? ['Governance', 'Policy', 'Ethics'] : ['Enterprise Scale', 'Capital Allocation', 'Market Share'],
    activeCoverageCount: state.newsArchive.length
  };
}

/**
 * Evaluates perceptions across all 6 key stakeholder groups.
 */
export function evaluateStakeholderPerceptions(state: GameState): Record<StakeholderGroup, StakeholderPerception> {
  const rep = state.character.attributes.reputation;
  const netWorth = calculateNetWorth(state);
  const inOffice = state.politics.currentOffice.inOffice;

  return {
    PUBLIC: {
      group: 'PUBLIC',
      sentimentScore: Math.min(100, Math.max(10, rep)),
      stance: rep >= 75 ? 'Highly Supportive' : (rep <= 40 ? 'Skeptical & Critical' : 'Neutral Watchful'),
      primaryConcerns: ['Cost of Living', 'Fair Employment', 'Community Impact'],
      keyFactor: `Public reputation score of ${Math.round(rep)}/100.`
    },
    BUSINESS: {
      group: 'BUSINESS',
      sentimentScore: Math.min(100, Math.max(15, Math.round((netWorth > 10000000 ? 80 : 55) + (state.companies.length * 5)))),
      stance: state.companies.some(c => c.monthlyNetProfit > 0) ? 'Commercial Respect' : 'Wary of Solvency',
      primaryConcerns: ['Profitability', 'Market Competition', 'Debt Solvency'],
      keyFactor: `${state.companies.length} operating companies under stewardship.`
    },
    PROFESSIONAL: {
      group: 'PROFESSIONAL',
      sentimentScore: Math.min(100, Math.max(20, Math.round(state.character.attributes.intelligence * 0.5 + rep * 0.5))),
      stance: 'Peer Recognition',
      primaryConcerns: ['Industry Integrity', 'Technical Competence', 'Leadership Record'],
      keyFactor: `Professional intelligence and career achievements.`
    },
    POLITICAL: {
      group: 'POLITICAL',
      sentimentScore: Math.min(100, Math.max(10, inOffice ? state.politics.currentOffice.approvalRating : (rep * 0.7))),
      stance: inOffice ? 'Constitutional Authority' : 'Civic Stakeholder',
      primaryConcerns: ['Electoral Polling', 'Party Loyalty', 'Public Policy Delivery'],
      keyFactor: inOffice ? `Executive approval rating of ${Math.round(state.politics.currentOffice.approvalRating)}%` : 'Civic footprint.'
    },
    FAMILY: {
      group: 'FAMILY',
      sentimentScore: state.relationships.length > 0 
        ? Math.round(state.relationships.reduce((acc, r) => acc + r.love, 0) / state.relationships.length)
        : 85,
      stance: 'Kinship Foundation',
      primaryConcerns: ['Household Harmony', 'Heir Security', 'Estate Succession'],
      keyFactor: `${state.relationships.length} recorded family & partner relationships.`
    },
    INSTITUTIONAL: {
      group: 'INSTITUTIONAL',
      sentimentScore: Math.min(100, Math.max(15, Math.round((state.playerPowerProfile?.powerScore || 50) * 0.8))),
      stance: (state.playerPowerProfile?.powerScore || 0) >= 400 ? 'Systemic Weight' : 'Standard Compliance',
      primaryConcerns: ['Regulatory Compliance', 'Antitrust Review', 'Tax Governance'],
      keyFactor: `Power Tier: ${state.playerPowerProfile?.powerTier || 'STREET_LEVEL'}`
    }
  };
}

/**
 * Detects Life Chapters emerging from age, tier, career, and empire milestones.
 */
export function evaluateLifeChapters(state: GameState): { chapters: LifeChapterRecord[]; current: LifeChapterRecord } {
  const currentNarrative = ensureEmergentNarrativeState(state);
  const existing = currentNarrative.lifeChapters || [];
  const age = state.character.age;
  const currentNetWorth = calculateNetWorth(state);
  const tier = state.lifeProgression?.currentTier || 'FOUNDATION';

  let currentTitle = 'The Foundational Ascent';
  let currentSubtitle = 'Early Independence & Skill Mastery';
  let theme = 'Survival & Education';

  if (tier === 'LEGACY_DYNASTY') {
    currentTitle = 'The Dynastic Era';
    currentSubtitle = 'Generational Inheritance & Legacy Stewardship';
    theme = 'Dynasty & Heritage';
  } else if (tier === 'NATIONAL_GLOBAL_POWER' || tier === 'POWER_INFLUENCE') {
    currentTitle = 'The Crucible of High Power';
    currentSubtitle = 'Civic Mandates & Monumental Authority';
    theme = 'Governance & Institutional Clout';
  } else if (tier === 'TYCOON') {
    currentTitle = 'The Empire Builder';
    currentSubtitle = 'Multi-Entity Expansion & Massive Capital Scaling';
    theme = 'Corporate Empire';
  } else if (tier === 'ENTREPRENEUR_OWNER') {
    currentTitle = 'The Commercial Vanguard';
    currentSubtitle = 'Enterprise Risk, Payroll & Market Competition';
    theme = 'Founder Drive';
  } else if (tier === 'PROFESSIONAL_BUILDER') {
    currentTitle = 'The Professional Ascent';
    currentSubtitle = 'Career Mastery, Seniority & Strategic Asset Accumulation';
    theme = 'Specialization & Reputation';
  } else if (tier === 'INDEPENDENCE') {
    currentTitle = 'Self-Sufficient Frontiers';
    currentSubtitle = 'Financial Buffer & Autonomous Living';
    theme = 'Independence';
  }

  const currentChapter: LifeChapterRecord = {
    id: `chapter_${tier.toLowerCase()}`,
    chapterNumber: existing.length + 1,
    title: currentTitle,
    subtitle: currentSubtitle,
    startMonth: state.currentMonth,
    startYear: state.currentYear,
    isCurrent: true,
    theme,
    majorAccomplishments: [
      `Attained ${tier} Life Tier`,
      `Net Worth achieved $${currentNetWorth.toLocaleString()}`
    ],
    majorStruggles: [
      state.finances.cash < 0 ? 'Cashflow Liquidity Pressure' : 'Balancing Workload & Personal Longevity'
    ],
    summary: `At age ${age}, operating with a net worth of $${currentNetWorth.toLocaleString()} and commanding ${state.companies.length} operating businesses.`
  };

  return {
    chapters: [currentChapter],
    current: currentChapter
  };
}

/**
 * Generates an explainable legacy summary based on authoritative historical achievements.
 */
export function generateLegacyNarrative(state: GameState): EmergentNarrativeProfile['legacyNarrative'] {
  const currentNetWorth = calculateNetWorth(state);
  const companiesCount = state.companies.length;
  const inOffice = state.politics.currentOffice.inOffice;
  const pastOffices = state.politics.pastOffices || [];
  const heirsCount = state.relationships.filter(r => r.isHeirCandidate || r.relation === 'Son' || r.relation === 'Daughter').length;

  let title = 'The Self-Made Pioneer';
  if (companiesCount >= 3 && currentNetWorth >= 50000000) {
    title = 'The Industrial Titan';
  } else if (inOffice || pastOffices.length > 0) {
    title = 'The Reforming Statesman';
  } else if (heirsCount >= 2 && currentNetWorth >= 20000000) {
    title = 'The Dynasty Architect';
  } else if (currentNetWorth >= 10000000) {
    title = 'The Capital Compounder';
  }

  const pillars: string[] = [];
  if (companiesCount > 0) pillars.push(`Founded & Expanded ${companiesCount} Commercial Enterprises`);
  if (currentNetWorth >= 1000000) pillars.push(`Accumulated $${currentNetWorth.toLocaleString()} in Generational Wealth`);
  if (pastOffices.length > 0 || inOffice) pillars.push(`Delivered Constitutional Public Service as ${inOffice ? state.politics.currentOffice.title : pastOffices[0]}`);
  if (heirsCount > 0) pillars.push(`Established Multi-Generational Dynasty with ${heirsCount} Heir Candidates`);
  if (pillars.length === 0) pillars.push('Mastered Independent Living and Personal Enterprise');

  return {
    title,
    summary: `${state.character.firstName} ${state.character.lastName} is recognized as ${title}, distinguished by relentless execution across corporate, civic, and dynastic domains.`,
    pillars,
    historicalStanding: currentNetWorth >= 100000000 ? 'Historic Luminary' : (currentNetWorth >= 10000000 ? 'Eminent Operator' : 'Established Leader')
  };
}

/**
 * Generates a concise, fact-grounded monthly narrative synthesis for reports.
 */
export function generateMonthlyNarrative(
  prevState: GameState,
  state: GameState,
  events: LifeEvent[],
  news: NewsItem[]
): EmergentNarrativeProfile['monthlyNarrativeSummary'] {
  const netWorthNow = calculateNetWorth(state);
  const netWorthBefore = calculateNetWorth(prevState);
  const nwDelta = netWorthNow - netWorthBefore;

  const highlights: string[] = [];
  if (nwDelta > 0) highlights.push(`Net worth expanded by +$${nwDelta.toLocaleString()}.`);
  else if (nwDelta < 0) highlights.push(`Net worth contracted by -$${Math.abs(nwDelta).toLocaleString()}.`);

  if (events.length > 0) {
    highlights.push(events[0].title);
  }

  let riskNarrative = 'Financial and operational risks remain stable within normal operating tolerances.';
  if (state.finances.cash < 0) {
    riskNarrative = `Treasury operates in deficit (-$${Math.abs(state.finances.cash).toLocaleString()}). Urgent liquidity recapitalization recommended.`;
  } else if (state.character.attributes.stress >= 75) {
    riskNarrative = `High cognitive stress (${Math.round(state.character.attributes.stress)}/100) threatens physical health and decision precision.`;
  }

  let opportunityNarrative = 'Steady economic conditions support gradual organic reinvestment.';
  if (state.finances.cash > 500000) {
    opportunityNarrative = 'Abundant cash reserves empower decisive business acquisitions and high-yield asset purchases.';
  } else if (state.politics.currentOffice.inOffice) {
    opportunityNarrative = 'Executive political office unlocks substantial civic capital and policy reform initiatives.';
  }

  const summary = `Month concluded at age ${state.character.age}. Net worth stands at $${netWorthNow.toLocaleString()} with ${state.companies.length} active enterprises and ${state.relationships.length} family connections.`;

  return {
    summary,
    highlights: highlights.slice(0, 3),
    riskNarrative,
    opportunityNarrative
  };
}

/**
 * Ensures that the GameState possesses a fully initialized EmergentNarrativeProfile.
 */
export function ensureEmergentNarrativeState(state: GameState): EmergentNarrativeProfile {
  if (state.emergentNarrative) {
    return state.emergentNarrative;
  }

  const initialAttention = evaluateMediaAttention(state);
  const initialStakeholders = evaluateStakeholderPerceptions(state);
  const { chapters, current } = evaluateLifeChapters(state);
  const legacy = generateLegacyNarrative(state);

  const initialProfile: EmergentNarrativeProfile = {
    activeStoryThreads: [],
    resolvedStoryThreads: [],
    activeRivalries: [],
    activeScandals: [],
    scandalHistory: [],
    publicAttention: initialAttention,
    stakeholderPerceptions: initialStakeholders,
    lifeChapters: chapters,
    currentLifeChapter: current,
    legacyNarrative: legacy,
    monthlyNarrativeSummary: {
      summary: 'Beginning of personal chronicle.',
      highlights: ['Initial Life Stage Started'],
      riskNarrative: 'Standard baseline risks.',
      opportunityNarrative: 'Foundational development paths available.'
    }
  };

  state.emergentNarrative = initialProfile;
  return initialProfile;
}

/**
 * MASTER EVALUATOR FOR EXPANSION 1E: ADVANCED PERSONALITIES & EMERGENT NARRATIVE
 * Runs during the authoritative advanceOneMonth pipeline.
 */
export function evaluateEmergentNarrative(
  prevState: GameState,
  state: GameState,
  diff?: any
): {
  updatedNarrative: EmergentNarrativeProfile;
  narrativeDiff: any;
  generatedEvents: LifeEvent[];
  generatedNews: NewsItem[];
} {
  const events: LifeEvent[] = [];
  const news: NewsItem[] = [];

  // 1. Ensure all NPCs and Player have Advanced Personalities and updated Sentiments
  for (const rel of state.relationships) {
    ensureAdvancedPersonality(rel, rel.age + (rel.wealth || 0));
    rel.personalityArchetype = derivePersonalityArchetype(rel.advancedPersonality!, rel.gender);
    rel.activeMotivations = evaluateNpcMotivations(rel, state);
    rel.goals = evaluateNpcGoals(rel, state);
    decayAndPruneMemories(rel);
    rel.sentiment = evaluateRelationshipSentiment(rel);
    rel.relationshipStage = evaluateRelationshipStage(rel, rel.sentiment);
  }

  // 2. Evaluate Organic Rivalries
  const { activeRivalries, generatedEvents: rivalEvents, generatedNews: rivalNews } = evaluateRivalries(prevState, state);
  events.push(...rivalEvents);
  news.push(...rivalNews);

  // 3. Detect Story Seeds & Advance Story Threads
  const seeds = detectStorySeeds(prevState, state);
  const { activeThreads, resolvedThreads } = advanceStoryThreads(state, prevState, seeds);

  // 4. Detect and Evaluate Scandals
  const { activeScandals, scandalHistory, generatedEvents: scandalEvents, generatedNews: scandalNews } = detectAndEvaluateScandals(prevState, state);
  events.push(...scandalEvents);
  news.push(...scandalNews);

  // 5. Evaluate Media Attention and Stakeholder Perceptions
  const publicAttention = evaluateMediaAttention(state);
  const stakeholderPerceptions = evaluateStakeholderPerceptions(state);

  // 6. Evaluate Life Chapters and Legacy
  const { chapters, current: currentChapter } = evaluateLifeChapters(state);
  const legacyNarrative = generateLegacyNarrative(state);

  // 7. Synthesize Monthly Narrative
  const monthlyNarrativeSummary = generateMonthlyNarrative(prevState, state, events, news);

  const updatedNarrative: EmergentNarrativeProfile = {
    activeStoryThreads: activeThreads,
    resolvedStoryThreads: resolvedThreads,
    activeRivalries,
    activeScandals,
    scandalHistory,
    publicAttention,
    stakeholderPerceptions,
    lifeChapters: chapters,
    currentLifeChapter: currentChapter,
    legacyNarrative,
    monthlyNarrativeSummary
  };

  state.emergentNarrative = updatedNarrative;

  const narrativeDiff = {
    newStoryThreads: activeThreads.filter(t => t.startedMonth === state.currentMonth && t.startedYear === state.currentYear),
    updatedStoryThreads: activeThreads.map(t => ({ id: t.id, title: t.title, state: t.state, tensionDelta: 0, recentEvent: t.recentDevelopment })),
    resolvedStoryThreads: resolvedThreads.map(t => t.title),
    newScandals: activeScandals.filter(s => s.startedMonth === state.currentMonth && s.startedYear === state.currentYear),
    escalatedScandals: activeScandals.filter(s => s.stage === 'ESCALATING').map(s => s.title),
    resolvedScandals: activeScandals.filter(s => s.stage === 'RESOLVED').map(s => s.title),
    newRivalries: activeRivalries.filter(r => r.startedMonth === state.currentMonth && r.startedYear === state.currentYear),
    rivalryUpdates: activeRivalries.map(r => ({ id: r.id, opponentName: r.opponentName, stage: r.escalationStage, delta: 0 })),
    landmarkMemoriesCreated: [],
    monthlyNarrative: monthlyNarrativeSummary
  };

  return {
    updatedNarrative,
    narrativeDiff,
    generatedEvents: events,
    generatedNews: news
  };
}
