import { 
  LifeTier, 
  PressureType, 
  StrategyArchetype, 
  ResponsibilityCategory, 
  OpportunityCategory 
} from '../types';

export interface TierGameplayProfile {
  tier: LifeTier;
  coreTheme: string;
  narrativeHeadline: string;
  gameplayFocus: string[];
  primaryPressures: PressureType[];
  typicalResponsibilities: ResponsibilityCategory[];
  keyTradeoffs: {
    title: string;
    choiceA: string;
    choiceB: string;
    consequenceA: string;
    consequenceB: string;
  }[];
  complexityBaseline: number; // 0 - 100
  recommendedOpportunities: OpportunityCategory[];
}

export const TIER_GAMEPLAY_PROFILES: Record<LifeTier, TierGameplayProfile> = {
  FOUNDATION: {
    tier: 'FOUNDATION',
    coreTheme: 'Identity, Skill Formation & Early Survival',
    narrativeHeadline: 'Navigating formative choices with limited capital and establishing your life trajectory.',
    gameplayFocus: [
      'Education vs Immediate Hustle',
      'Entry-level employment and apprenticeship',
      'Establishing emergency savings habit',
      'Developing personal routines and health foundations',
      'Building early trust in social and family circles'
    ],
    primaryPressures: ['FINANCIAL', 'CAREER'],
    typicalResponsibilities: ['PERSONAL', 'FINANCIAL', 'FAMILY'],
    keyTradeoffs: [
      {
        title: 'Education vs Cashflow',
        choiceA: 'Commit to full-time university/certification',
        choiceB: 'Work multiple entry jobs immediately',
        consequenceA: 'Sacrifices short-term earnings for long-term career ceiling and intelligence.',
        consequenceB: 'Immediate solvency and savings runway, but lower long-term salary ceiling.'
      },
      {
        title: 'Social Life vs Skill Grinding',
        choiceA: 'Dedicate evenings to social and dating circles',
        choiceB: 'Invest all free hours into study and wellness',
        consequenceA: 'Stronger relationship trust and happiness, higher burnout risk.',
        consequenceB: 'Rapid attribute growth and career readiness, potential social isolation.'
      }
    ],
    complexityBaseline: 10,
    recommendedOpportunities: ['CAREER', 'RELATIONSHIP', 'FAMILY']
  },

  INDEPENDENCE: {
    tier: 'INDEPENDENCE',
    coreTheme: 'Financial Solvency, Autonomy & Lifestyle Foundation',
    narrativeHeadline: 'Transitioning to autonomous living, managing recurring overhead, and creating an investment base.',
    gameplayFocus: [
      'Maintaining positive monthly cashflow',
      'Managing residential lease / mortgage obligations',
      'Servicing and eliminating consumer debts',
      'Establishing a 6-month emergency cash cushion',
      'First disciplined public market investments'
    ],
    primaryPressures: ['FINANCIAL', 'CAREER'],
    typicalResponsibilities: ['PERSONAL', 'FINANCIAL', 'PROFESSIONAL'],
    keyTradeoffs: [
      {
        title: 'Lifestyle Inflation vs Capital Accumulation',
        choiceA: 'Upgrade residence and luxury consumption',
        choiceB: 'Maintain frugal budget and maximize monthly savings',
        consequenceA: 'Boosts happiness and prestige, increases fixed monthly burn rate.',
        consequenceB: 'Accelerates net worth growth and unlocks investment opportunities.'
      },
      {
        title: 'Safe Employment vs Career Risk',
        choiceA: 'Stay in secure entry job with moderate pay',
        choiceB: 'Pivot to high-upside commission or startup role',
        consequenceA: 'Predictable cashflow, slower progression.',
        consequenceB: 'Higher volatility and stress, rapid skill and compensation acceleration.'
      }
    ],
    complexityBaseline: 25,
    recommendedOpportunities: ['CAREER', 'INVESTMENT', 'PROPERTY', 'RELATIONSHIP']
  },

  PROFESSIONAL_BUILDER: {
    tier: 'PROFESSIONAL_BUILDER',
    coreTheme: 'Craft Specialization, Senior Leadership & Asset Leverage',
    narrativeHeadline: 'Scaling specialized expertise, negotiating high-compensation roles, and acquiring income properties.',
    gameplayFocus: [
      'Leading professional divisions and managing subordinates',
      'Building strong industry and executive reputation',
      'Real estate acquisition and mortgage management',
      'Structuring diversified equity and dividend portfolios',
      'Managing professional burnout versus ambition'
    ],
    primaryPressures: ['CAREER', 'FINANCIAL', 'FAMILY'],
    typicalResponsibilities: ['PROFESSIONAL', 'FINANCIAL', 'ORGANIZATIONAL', 'FAMILY'],
    keyTradeoffs: [
      {
        title: 'Executive Workload vs Family Harmony',
        choiceA: 'Accept grueling 60-hour senior leadership role',
        choiceB: 'Enforce strict 40-hour work-life boundary',
        consequenceA: 'Rapid salary growth and industry prestige, gradual relationship decay.',
        consequenceB: 'Strong household stability and low stress, slower career trajectory.'
      },
      {
        title: 'Specialist Depth vs Generalist Leadership',
        choiceA: 'Master technical specialty',
        choiceB: 'Transition into people management and politics',
        consequenceA: 'High individual productivity, limited organizational scale.',
        consequenceB: 'Higher influence and salary potential, heavier administrative pressure.'
      }
    ],
    complexityBaseline: 45,
    recommendedOpportunities: ['CAREER', 'PROPERTY', 'INVESTMENT', 'BUSINESS']
  },

  ENTREPRENEUR_OWNER: {
    tier: 'ENTREPRENEUR_OWNER',
    coreTheme: 'Capital Ownership, Operating Risk & Workforce Leadership',
    narrativeHeadline: 'Founding and scaling operating enterprises, commanding payrolls, and capturing market share.',
    gameplayFocus: [
      'Meeting monthly payroll and commercial obligations',
      'Optimizing pricing, product quality, and marketing spend',
      'Managing executive morale, productivity, and turnover',
      'Navigating competitive threats and supplier negotiations',
      'Balancing dividend extractions versus enterprise reinvestment'
    ],
    primaryPressures: ['BUSINESS', 'FINANCIAL', 'CAREER'],
    typicalResponsibilities: ['ORGANIZATIONAL', 'FINANCIAL', 'PROFESSIONAL', 'PUBLIC'],
    keyTradeoffs: [
      {
        title: 'Aggressive Expansion vs Balance Sheet Prudence',
        choiceA: 'Leverage debt for rapid multi-market expansion',
        choiceB: 'Fund steady organic growth purely from cash reserves',
        consequenceA: 'High market share potential, vulnerability to economic downturns.',
        consequenceB: 'Resilient balance sheet and steady profits, risk of competitor outflanking.'
      },
      {
        title: 'Owner Hands-On Control vs Executive Delegation',
        choiceA: 'Micromanage all operational decisions directly',
        choiceB: 'Hire high-salary C-suite executives to run divisions',
        consequenceA: 'Eliminates executive payroll, incurs massive player stress.',
        consequenceB: 'Reduces burnout, introduces executive alignment and loyalty risks.'
      }
    ],
    complexityBaseline: 60,
    recommendedOpportunities: ['BUSINESS', 'INVESTMENT', 'INSTITUTIONAL', 'POLITICAL']
  },

  TYCOON: {
    tier: 'TYCOON',
    coreTheme: 'Conglomerate Scale, Portfolio Governance & Megaprojects',
    narrativeHeadline: 'Managing holding companies, delegating to professional CEOs, and executing monumental infrastructure.',
    gameplayFocus: [
      'Multi-company capital allocation and holding governance',
      'Appointing, incentivizing, and replacing C-suite executives',
      'Commissioning skyscraper, campus, and sports megaprojects',
      'Navigating regulatory scrutiny and market concentration risks',
      'Managing high-profile media coverage and industry rivalries'
    ],
    primaryPressures: ['BUSINESS', 'REPUTATION', 'INSTITUTIONAL'],
    typicalResponsibilities: ['ORGANIZATIONAL', 'INSTITUTIONAL', 'PUBLIC', 'FINANCIAL'],
    keyTradeoffs: [
      {
        title: 'Megaproject Monument vs Portfolio Diversification',
        choiceA: 'Commit $50M+ into a landmark HQ Skyscraper or Stadium',
        choiceB: 'Distribute capital across diversified public & private assets',
        consequenceA: 'Immense reputation and world influence surge, illiquid capital lockup.',
        consequenceB: 'Maximum liquidity and dividend stream, muted public stature.'
      },
      {
        title: 'Aggressive M&A vs Regulatory Harmony',
        choiceA: 'Acquire direct market competitors to monopolize industry',
        choiceB: 'Maintain competitive market equilibrium and clean compliance',
        consequenceA: 'Dominant pricing power and revenue, heightened antitrust scrutiny.',
        consequenceB: 'Pristine regulatory standing, standard competitive pressure.'
      }
    ],
    complexityBaseline: 75,
    recommendedOpportunities: ['BUSINESS', 'INSTITUTIONAL', 'GLOBAL', 'POLITICAL']
  },

  POWER_INFLUENCE: {
    tier: 'POWER_INFLUENCE',
    coreTheme: 'Systemic Sway, Political Authority & Civic Foundations',
    narrativeHeadline: 'Wielding societal authority across public office, legislative lobbying, and civic institutions.',
    gameplayFocus: [
      'Campaigning and holding high elected political office',
      'Managing voter approval ratings and political capital',
      'Endowing major philanthropic foundations and think tanks',
      'Navigating conflict-of-interest scrutiny between business and office',
      'Forming powerful political and institutional coalitions'
    ],
    primaryPressures: ['POLITICAL', 'REPUTATION', 'INSTITUTIONAL'],
    typicalResponsibilities: ['POLITICAL', 'PUBLIC', 'INSTITUTIONAL', 'ORGANIZATIONAL'],
    keyTradeoffs: [
      {
        title: 'Public Office Mandate vs Private Business Interests',
        choiceA: 'Place companies in blind trust and focus 100% on governance',
        choiceB: 'Retain active ownership and leverage office for commercial policy',
        consequenceA: 'High public approval and clean reputation, reduced private profits.',
        consequenceB: 'Lucrative enterprise synergy, massive public scandal vulnerability.'
      },
      {
        title: 'Populist Reform vs Institutional Coalition',
        choiceA: 'Push sweeping popular social reforms',
        choiceB: 'Align with party elites and institutional financiers',
        consequenceA: 'Surging voter grassroots support, intense establishment pushback.',
        consequenceB: 'Guaranteed party funding and political capital, risk of public alienation.'
      }
    ],
    complexityBaseline: 85,
    recommendedOpportunities: ['POLITICAL', 'INSTITUTIONAL', 'GLOBAL', 'CAREER']
  },

  NATIONAL_GLOBAL_POWER: {
    tier: 'NATIONAL_GLOBAL_POWER',
    coreTheme: 'Sovereign Mandate, Worldwide Footprint & Macro Control',
    narrativeHeadline: 'Directing sovereign policy, international treaties, and multinational enterprise syndicates.',
    gameplayFocus: [
      'Directing national fiscal, monetary, and defense policies',
      'Negotiating sovereign bilateral trade and diplomatic pacts',
      'Commanding multinational corporate operations across continents',
      'Funding global frontier science, healthcare, and infrastructure',
      'Navigating geopolitical tensions, currency shifts, and global summits'
    ],
    primaryPressures: ['GLOBAL', 'POLITICAL', 'INSTITUTIONAL'],
    typicalResponsibilities: ['GLOBAL', 'POLITICAL', 'INSTITUTIONAL', 'PUBLIC'],
    keyTradeoffs: [
      {
        title: 'Globalist Free Trade vs National Economic Protection',
        choiceA: 'Ratify aggressive multinational trade accords',
        choiceB: 'Enact protective tariffs to shield domestic manufacturing',
        consequenceA: 'Boosts multinational corporation margins, triggers domestic labor unease.',
        consequenceB: 'High domestic working-class approval, strained diplomatic relations.'
      },
      {
        title: 'Frontier Scientific Bet vs Sovereign Fiscal Austerity',
        choiceA: 'Commit $100M+ to national green energy / AI moonshot',
        choiceB: 'Accumulate sovereign reserves and lower public debt',
        consequenceA: 'Historic global legacy and tech leadership, heavy short-term budget strain.',
        consequenceB: 'Ironclad fiscal stability, modest international prominence.'
      }
    ],
    complexityBaseline: 92,
    recommendedOpportunities: ['GLOBAL', 'POLITICAL', 'INSTITUTIONAL', 'DYNASTY']
  },

  LEGACY_DYNASTY: {
    tier: 'LEGACY_DYNASTY',
    coreTheme: 'Generational Immortality, Heirs & Perpetual Lineage',
    narrativeHeadline: 'Transcending mortal lifespans through heirs, family trusts, dynasty compacts, and historic legacy.',
    gameplayFocus: [
      'Formulating and refining comprehensive succession plans',
      'Mentoring, educating, and testing heir capabilities',
      'Establishing perpetual multi-generational family trusts',
      'Preventing family schisms, sibling rivalries, and contested wills',
      'Endowing permanent historic monuments, libraries, and foundations'
    ],
    primaryPressures: ['SUCCESSION', 'FAMILY', 'INSTITUTIONAL'],
    typicalResponsibilities: ['DYNASTIC', 'FAMILY', 'INSTITUTIONAL', 'FINANCIAL'],
    keyTradeoffs: [
      {
        title: 'Single Chosen Heir vs Equal Family Distribution',
        choiceA: 'Concentrate voting power in a single battle-tested primary successor',
        choiceB: 'Divide assets and board seats equally among all children',
        consequenceA: 'Preserves enterprise scale and unified vision, creates disgruntled sibling rivals.',
        consequenceB: 'Maintains immediate household harmony, risks corporate fragmentation and gridlock.'
      },
      {
        title: 'Perpetual Philanthropic Endowment vs Family Dynasty Vault',
        choiceA: 'Bequeath 75%+ of net worth to permanent global charitable trusts',
        choiceB: 'Preserve 90%+ of capital inside hereditary family holdings',
        consequenceA: 'Indelible historical S+ legacy scorecard, reduces heir inheritance.',
        consequenceB: 'Equips successors with immense private financial firepower, lower public acclaim.'
      }
    ],
    complexityBaseline: 95,
    recommendedOpportunities: ['DYNASTY', 'FAMILY', 'INSTITUTIONAL', 'GLOBAL']
  }
};

// -------------------------------------------------------------
// PRESSURE BALANCING & CRISIS THRESHOLDS
// -------------------------------------------------------------

export const PRESSURE_CONFIG = {
  intensityThresholds: {
    low: 0,
    moderate: 35,
    severe: 65,
    crisis: 85
  },
  escalationMonthsRequiredForCrisis: 3,
  recoveryThreshold: 40,
  maxPressuresPerTier: {
    FOUNDATION: 3,
    INDEPENDENCE: 4,
    PROFESSIONAL_BUILDER: 5,
    ENTREPRENEUR_OWNER: 6,
    TYCOON: 7,
    POWER_INFLUENCE: 8,
    NATIONAL_GLOBAL_POWER: 8,
    LEGACY_DYNASTY: 8
  },
  mitigationImpacts: {
    smallAction: 15,
    mediumAction: 30,
    largeAction: 50
  }
};

// -------------------------------------------------------------
// OPPORTUNITY LIFECYCLE & GENERATION CONFIG
// -------------------------------------------------------------

export const OPPORTUNITY_CONFIG = {
  maxActiveOpportunities: 5,
  defaultExpiryMonths: 4,
  cooldownMonthsAfterDecline: 6,
  cooldownMonthsAfterAccept: 8,
  minOpportunityChancePerMonth: 0.45, // 45% base chance per month to evaluate new opportunity
  maxOpportunityChancePerMonth: 0.85
};

// -------------------------------------------------------------
// STRATEGY PROFILES BALANCING CONFIG
// -------------------------------------------------------------

export const STRATEGY_ARCHETYPE_DEFINITIONS: Record<StrategyArchetype, {
  name: string;
  description: string;
  coreMotivation: string;
  signatureTraits: string[];
  strengths: string[];
  vulnerabilities: string[];
}> = {
  CAUTIOUS: {
    name: 'Prudent Guardian',
    description: 'Prioritizes capital preservation, low debt, high emergency reserves, and low-volatility decisions.',
    coreMotivation: 'Security, resilience, and eliminating existential downside risk.',
    signatureTraits: ['High cash runway', 'Low leverage', 'Conservative budgeting', 'High risk aversion'],
    strengths: ['Highly resilient against economic recessions', 'Virtually immune to insolvency crises'],
    vulnerabilities: ['Slower capital growth in market booms', 'Prone to missing high-upside opportunities']
  },
  AGGRESSIVE: {
    name: 'High-Stakes Expansionist',
    description: 'Leverages aggressive borrowing, high-volatility equities, and rapid capital scaling.',
    coreMotivation: 'Maximum velocity, rapid power elevation, and disruptive scale.',
    signatureTraits: ['High debt utilization', 'High-risk business ventures', 'Heavy capital deployment'],
    strengths: ['Explosive upside in favorable economic cycles', 'Rapid ascent through life tiers'],
    vulnerabilities: ['Vulnerable to sudden liquidity crunches and rate spikes', 'Elevated stress levels']
  },
  OPPORTUNISTIC: {
    name: 'Agile Arbitrageur',
    description: 'Quickly pivots between assets, markets, and sectors to capture fleeting state-driven opportunities.',
    coreMotivation: 'Flexibility, dealmaking, and capturing asymmetric upside.',
    signatureTraits: ['Frequent portfolio rebalancing', 'Broad asset mix', 'Fast decision turnaround'],
    strengths: ['Excels at capitalizing on short-term market dislocations', 'Diverse income sources'],
    vulnerabilities: ['Lack of long-term operational focus', 'Higher transactional and management friction']
  },
  LONG_TERM: {
    name: 'Strategic Compounder',
    description: 'Commits capital and focus to decades-long compound growth, quality real estate, and permanent institutions.',
    coreMotivation: 'Enduring compounding, compounding relationships, and institutional longevity.',
    signatureTraits: ['Long property holding periods', 'High quality metrics', 'Consistent reinvestment'],
    strengths: ['Massive compounding returns over decades', 'Deep and loyal relationship networks'],
    vulnerabilities: ['Requires patience and steady discipline', 'Inflexible in fast emergency pivots']
  },
  PROFESSIONAL: {
    name: 'Craft & Institutional Leader',
    description: 'Focuses on craft excellence, elite credentialing, corporate executive elevation, and industry stature.',
    coreMotivation: 'Mastery, professional respect, executive authority, and specialized leadership.',
    signatureTraits: ['High education & skills', 'Senior corporate tenure', 'Peer mentorship'],
    strengths: ['Steady high compensation with low capital risk', 'Exceptional industry reputation'],
    vulnerabilities: ['Salary ceiling relative to equity owners', 'Demanding executive time commitments']
  },
  ENTREPRENEURIAL: {
    name: 'Enterprise Builder',
    description: 'Focuses on founding businesses, product innovation, hiring teams, and creating commercial value.',
    coreMotivation: 'Autonomy, enterprise equity, innovation, and direct commercial impact.',
    signatureTraits: ['Multiple company founding', 'High reinvestment in R&D', 'Workforce management'],
    strengths: ['Uncapped wealth creation potential through equity valuation', 'High economic autonomy'],
    vulnerabilities: ['Direct operational and payroll liabilities', 'Operational burnout risk']
  },
  INFLUENTIAL: {
    name: 'Civic Statesman & Powerbroker',
    description: 'Focuses on political capital, elected office, public advocacy, philanthropy, and media attention.',
    coreMotivation: 'Societal sway, policy shaping, public leadership, and civic legacy.',
    signatureTraits: ['Active political party involvement', 'High philanthropy', 'Media presence'],
    strengths: ['Immense political and civic authority', 'High world influence score'],
    vulnerabilities: ['Intense public scrutiny and scandal risk', 'Approval rating volatility']
  },
  DYNASTIC: {
    name: 'Dynasty Patriarch / Matriarch',
    description: 'Focuses on multi-generational family governance, heir mentorship, family trusts, and enduring lineage.',
    coreMotivation: 'Generational immortality, family prosperity, and preserving the dynasty name.',
    signatureTraits: ['Early succession planning', 'Family trust creation', 'Heir grooming'],
    strengths: ['Seamless succession and wealth transfer', 'High dynastic stability and harmony'],
    vulnerabilities: ['Susceptible to heir schisms and rivalries', 'Requires substantial family governance effort']
  }
};
