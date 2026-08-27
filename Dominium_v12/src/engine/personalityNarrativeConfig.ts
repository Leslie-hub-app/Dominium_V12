import { 
  AdvancedPersonality, 
  PersonalityArchetype, 
  MemorySignificance, 
  MemoryPersistenceTier,
  ScandalStage,
  PublicAttentionLevel,
  StakeholderGroup
} from '../types';

export const PERSONALITY_NARRATIVE_CONFIG = {
  // Max limits to ensure high performance and zero bloat
  MAX_ACTIVE_STORY_THREADS: 6,
  MAX_RESOLVED_STORY_THREADS: 20,
  MAX_ACTIVE_RIVALRIES: 5,
  MAX_ACTIVE_SCANDALS: 4,
  MAX_SCANDAL_HISTORY: 15,
  MAX_MEMORIES_PER_NPC: 12,
  MAX_LIFE_CHAPTERS: 10,

  // Memory Persistence Durations in Months
  MEMORY_DURATION: {
    SHORT_TERM: 6,
    MEDIUM_TERM: 24,
    LONG_TERM: 72,
    LANDMARK: -1 // Permanent
  } as Record<MemoryPersistenceTier, number>,

  // Memory Significance Weights
  MEMORY_SIGNIFICANCE_WEIGHT: {
    Minor: 1,
    Moderate: 2.5,
    Major: 6,
    Historic: 15
  } as Record<MemorySignificance, number>,

  // Scandal Escalation & Penalty Baselines
  SCANDAL: {
    RUMOR_EXPOSURE_THRESHOLD: 25,
    PUBLIC_EXPOSURE_THRESHOLD: 50,
    ESCALATION_EXPOSURE_THRESHOLD: 75,
    BASE_REPUTATION_PENALTY: {
      PRIVATE: 0,
      RUMOR: -1,
      EMERGING: -3,
      PUBLIC: -7,
      ESCALATING: -14,
      RESOLVED: 0,
      LINGERING: -1
    } as Record<ScandalStage, number>
  },

  // Media Attention Thresholds by Net Worth & Visibility
  MEDIA_ATTENTION: {
    LEVELS: {
      NO_ATTENTION: { minScore: 0, scrutinyMultiplier: 1.0 },
      LOCAL_ATTENTION: { minScore: 20, scrutinyMultiplier: 1.2 },
      REGIONAL_ATTENTION: { minScore: 40, scrutinyMultiplier: 1.5 },
      NATIONAL_ATTENTION: { minScore: 65, scrutinyMultiplier: 2.2 },
      GLOBAL_ATTENTION: { minScore: 85, scrutinyMultiplier: 3.0 }
    } as Record<PublicAttentionLevel, { minScore: number; scrutinyMultiplier: number }>
  },

  // Stakeholder Group Base Alignments
  STAKEHOLDER_GROUPS: [
    'PUBLIC',
    'BUSINESS',
    'PROFESSIONAL',
    'POLITICAL',
    'FAMILY',
    'INSTITUTIONAL'
  ] as StakeholderGroup[]
};

export const DEFAULT_ADVANCED_PERSONALITY: AdvancedPersonality = {
  ambition: 60,
  riskTolerance: 50,
  loyalty: 70,
  discipline: 65,
  aggression: 40,
  empathy: 60,
  pride: 55,
  caution: 55,
  adaptability: 60,
  vanity: 40,
  patience: 60,
  integrity: 75
};

export const ARCHETYPE_CRITERIA: {
  archetype: PersonalityArchetype;
  description: string;
  evaluator: (p: AdvancedPersonality) => number;
}[] = [
  {
    archetype: 'The Ambitious Builder',
    description: 'Relentlessly expands enterprise scale, driven by high discipline and towering ambition.',
    evaluator: (p) => (p.ambition * 0.4) + (p.discipline * 0.35) + (p.patience * 0.25)
  },
  {
    archetype: 'The Aggressive Competitor',
    description: 'Faces market rivals head-on with fierce assertiveness and calculated risk appetite.',
    evaluator: (p) => (p.aggression * 0.45) + (p.riskTolerance * 0.35) + (p.pride * 0.2)
  },
  {
    archetype: 'The Careful Strategist',
    description: 'Prefers deep cash runways, hedged portfolios, and meticulous risk mitigation.',
    evaluator: (p) => (p.caution * 0.45) + (p.discipline * 0.35) + (p.patience * 0.2) - (p.riskTolerance * 0.2)
  },
  {
    archetype: 'The Power Broker',
    description: 'Thrives in political backrooms, wielding institutional leverage and strategic pacts.',
    evaluator: (p) => (p.ambition * 0.35) + (p.pride * 0.3) + (p.adaptability * 0.35)
  },
  {
    archetype: 'The Loyal Ally',
    description: 'Stands firm during corporate downturns and family disputes, prioritizing enduring trust.',
    evaluator: (p) => (p.loyalty * 0.5) + (p.empathy * 0.3) + (p.integrity * 0.2)
  },
  {
    archetype: 'The Calculating Opportunist',
    description: 'Quick to exploit market inefficiencies, corporate distress, or shifting political winds.',
    evaluator: (p) => (p.adaptability * 0.4) + (p.riskTolerance * 0.35) + (p.ambition * 0.25) - (p.integrity * 0.2)
  },
  {
    archetype: 'The Family-First Patriarch',
    description: 'Places household harmony, heir stewardship, and generational heritage above raw empire scale.',
    evaluator: (p) => (p.empathy * 0.4) + (p.loyalty * 0.35) + (p.patience * 0.25)
  },
  {
    archetype: 'The Family-First Matriarch',
    description: 'Places household harmony, heir stewardship, and generational heritage above raw empire scale.',
    evaluator: (p) => (p.empathy * 0.4) + (p.loyalty * 0.35) + (p.patience * 0.25)
  },
  {
    archetype: 'The Ethical Reformer',
    description: 'Driven by high integrity, transparency, and sustainable institutional governance.',
    evaluator: (p) => (p.integrity * 0.5) + (p.empathy * 0.3) + (p.discipline * 0.2)
  },
  {
    archetype: 'The Vengeful Rival',
    description: 'Remembers every slight and slashes margins to punish perceived disrespect.',
    evaluator: (p) => (p.pride * 0.45) + (p.aggression * 0.35) - (p.empathy * 0.3)
  },
  {
    archetype: 'The Quiet Operator',
    description: 'Builds monumental wealth and influence away from sensationalist media headlines.',
    evaluator: (p) => (p.discipline * 0.4) + (p.caution * 0.3) - (p.vanity * 0.4)
  },
  {
    archetype: 'The Visionary Titan',
    description: 'Commands national respect through bold innovation and massive risk tolerance.',
    evaluator: (p) => (p.ambition * 0.4) + (p.riskTolerance * 0.3) + (p.adaptability * 0.3)
  },
  {
    archetype: 'The Pragmatic Realist',
    description: 'Balances growth, security, and ethics with grounded common sense.',
    evaluator: (p) => 50 // Baseline fallback
  }
];
