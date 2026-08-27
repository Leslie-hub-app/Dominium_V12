import { LifeTier, LifeTierDefinition } from '../types';

export const LIFE_TIER_RANKS: Record<LifeTier, number> = {
  FOUNDATION: 1,
  INDEPENDENCE: 2,
  PROFESSIONAL_BUILDER: 3,
  ENTREPRENEUR_OWNER: 4,
  TYCOON: 5,
  POWER_INFLUENCE: 6,
  NATIONAL_GLOBAL_POWER: 7,
  LEGACY_DYNASTY: 8
};

export const LIFE_TIER_ORDER: LifeTier[] = [
  'FOUNDATION',
  'INDEPENDENCE',
  'PROFESSIONAL_BUILDER',
  'ENTREPRENEUR_OWNER',
  'TYCOON',
  'POWER_INFLUENCE',
  'NATIONAL_GLOBAL_POWER',
  'LEGACY_DYNASTY'
];

export const LIFE_TIER_DEFINITIONS: Record<LifeTier, LifeTierDefinition> = {
  FOUNDATION: {
    id: 'FOUNDATION',
    rank: 1,
    displayName: 'Foundation & Discovery',
    subtitle: 'Personal Formative Stage & Basic Survival',
    description: 'The baseline formative stage of personal development, education, establishing essential life habits, and securing initial financial survival.',
    badgeColor: '#9ca3af',
    badgeBg: 'rgba(156, 163, 175, 0.12)',
    badgeBorder: 'rgba(156, 163, 175, 0.3)',
    focusAreas: ['Education & Degrees', 'First Income & Entry Jobs', 'Personal Health & Habits', 'Budgeting & Survival', 'Early Social Network'],
    supportedEventCategories: ['Life', 'Education', 'Career', 'Health', 'Family', 'Finance'],
    supportedDecisionCategories: ['Career', 'Education', 'Life', 'Finance', 'Health'],
    unlockedDomains: ['PERSONAL', 'EDUCATION', 'BASIC_EMPLOYMENT', 'BASIC_SAVINGS'],
    unlockedActions: ['Apply for Entry-Level Jobs', 'Enrol in Universities & Certifications', 'Manage Monthly Personal Budget', 'Build Daily Routine Habits'],
    promotionRequirements: {
      minOverallScore: 0,
      description: 'Default baseline starting tier for all citizens.',
      qualifyingPaths: ['Default starting status for every new life journey.']
    },
    maintenanceRequirements: {
      minOverallScore: 0,
      description: 'Permanent baseline tier; cannot regress below Foundation.',
      gracePeriodMonths: 0
    }
  },

  INDEPENDENCE: {
    id: 'INDEPENDENCE',
    rank: 2,
    displayName: 'Self-Sufficiency & Independence',
    subtitle: 'Independent Household & Financial Stability',
    description: 'The critical transition to true autonomous living, maintaining sustained positive cash flow, managing personal debts, and building an emergency cushion.',
    badgeColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    badgeBorder: 'rgba(16, 185, 129, 0.3)',
    focusAreas: ['Autonomous Living', 'Positive Net Cashflow', 'Debt Control & Credit Building', 'Emergency Savings Cushion', 'Reliable Earnings'],
    supportedEventCategories: ['Career', 'Finance', 'Life', 'Family', 'Health', 'Investment'],
    supportedDecisionCategories: ['Career', 'Finance', 'Investment', 'Life', 'Health'],
    unlockedDomains: ['PERSONAL', 'EDUCATION', 'CAREER', 'FINANCE', 'INDEPENDENT_LIVING', 'RETAIL_INVESTING'],
    unlockedActions: ['Lease / Rent Independent Residence', 'Open High-Yield Savings & Credit Lines', 'Invest in Public Stock Markets', 'Build 6-Month Emergency Runway'],
    promotionRequirements: {
      minOverallScore: 120,
      description: 'Attain sustained self-sufficiency with positive cashflow and emergency savings.',
      qualifyingPaths: [
        'Career Path: Stable employment with monthly salary exceeding expenses and positive cashflow.',
        'Savings & Asset Path: Liquid savings of $15k+ with low debt-to-income ratio.',
        'Enterprise Path: Self-employed or early business cashflow reliably covering living costs.'
      ]
    },
    maintenanceRequirements: {
      minOverallScore: 80,
      description: 'Maintain basic financial solvency and cash reserve to prevent falling into severe distress.',
      gracePeriodMonths: 6
    }
  },

  PROFESSIONAL_BUILDER: {
    id: 'PROFESSIONAL_BUILDER',
    rank: 3,
    displayName: 'Professional & Asset Builder',
    subtitle: 'Craft Mastery, Senior Roles & Asset Accumulation',
    description: 'Advancing beyond basic self-sufficiency into specialized professional mastery, senior career roles, disciplined equity investments, and real estate ownership.',
    badgeColor: '#06b6d4',
    badgeBg: 'rgba(6, 182, 212, 0.12)',
    badgeBorder: 'rgba(6, 182, 212, 0.3)',
    focusAreas: ['Senior Career Advancement', 'Specialist Craft & Reputation', 'Residential Real Estate Acquisition', 'Diversified Stock Portfolios', 'Professional Mentorship'],
    supportedEventCategories: ['Career', 'Finance', 'Investment', 'Property', 'Life', 'Family'],
    supportedDecisionCategories: ['Career', 'Investment', 'Property', 'Ethics', 'Finance'],
    unlockedDomains: ['CAREER_MASTERY', 'REAL_ESTATE_ACQUISITION', 'EQUITY_PORTFOLIOS', 'MORTGAGE_LEVERAGE', 'PROFESSIONAL_REPUTATION'],
    unlockedActions: ['Negotiate Executive Salary Packages', 'Acquire Residential Real Estate', 'Utilize Mortgage Credit Facilities', 'Lead Professional Teams'],
    promotionRequirements: {
      minOverallScore: 260,
      description: 'Attain established professional standing, senior employment, or substantial initial assets.',
      qualifyingPaths: [
        'Career Path: Senior / Specialist / Manager role with solid reputation and strong compensation.',
        'Asset Builder Path: Net worth of $250k+ or ownership of income-producing real estate property.',
        'Specialist & Public Path: High intelligence/skills and recognized standing in professional circles.'
      ]
    },
    maintenanceRequirements: {
      minOverallScore: 180,
      description: 'Sustain professional employment or solid net worth cushion.',
      gracePeriodMonths: 6
    }
  },

  ENTREPRENEUR_OWNER: {
    id: 'ENTREPRENEUR_OWNER',
    rank: 4,
    displayName: 'Entrepreneur & Enterprise Owner',
    subtitle: 'Capital Ownership, Commercial Equity & Team Command',
    description: 'Direct ownership and executive direction of operating enterprises, managing workforce teams, creating commercial value, and holding significant corporate equity.',
    badgeColor: '#8b5cf6',
    badgeBg: 'rgba(139, 92, 246, 0.12)',
    badgeBorder: 'rgba(139, 92, 246, 0.3)',
    focusAreas: ['Enterprise Incorporation', 'Workforce Team Leadership', 'Operating Cashflow & Profitability', 'Commercial Asset Equity', 'Strategic Dealmaking'],
    supportedEventCategories: ['Business', 'Career', 'Finance', 'Investment', 'Property', 'Ethics'],
    supportedDecisionCategories: ['Business', 'Investment', 'Wealth', 'Ethics', 'Controversial'],
    unlockedDomains: ['ENTERPRISE_FOUNDATION', 'COMMERCIAL_CREDIT', 'EQUITY_SYNDICATION', 'WORKFORCE_MANAGEMENT', 'CORPORATE_GOVERNANCE'],
    unlockedActions: ['Found & Register Corporate Entities', 'Hire & Direct Organizational Teams', 'Negotiate Commercial Supply Agreements', 'Secure Commercial Lines of Credit'],
    promotionRequirements: {
      minOverallScore: 420,
      description: 'Directly own and lead a viable operating enterprise or command substantial equity holdings.',
      qualifyingPaths: [
        'Enterprise Path: Active company ownership with > $500k valuation or $20k+ monthly operating revenue.',
        'Capital Owner Path: Controlling > $1.5M in enterprise equity, commercial real estate, or business assets.',
        'Corporate Executive Path: Director / Executive level commanding organizational operations with high equity/bonus.'
      ]
    },
    maintenanceRequirements: {
      minOverallScore: 320,
      description: 'Maintain active commercial operations or solid enterprise equity.',
      gracePeriodMonths: 6
    }
  },

  TYCOON: {
    id: 'TYCOON',
    rank: 5,
    displayName: 'Tycoon & Industry Pillar',
    subtitle: 'Conglomerate Scale, Executive Delegation & Megaprojects',
    description: 'Commanding multiple operating corporations, large-scale workforces, delegating operational executive command, commissioning major infrastructure, and holding massive portfolios.',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    badgeBorder: 'rgba(245, 158, 11, 0.3)',
    focusAreas: ['Holding Conglomerates', 'Mergers & Acquisitions', 'Monumental Megaprojects', 'Sports Team Franchises', 'Executive Board Governance'],
    supportedEventCategories: ['Business', 'Wealth', 'Projects', 'Sports', 'Politics', 'Controversial'],
    supportedDecisionCategories: ['Business', 'Wealth', 'Projects', 'Sports', 'Controversial', 'Ethics'],
    unlockedDomains: ['HOLDING_CONGLOMERATE', 'MEGAPROJECT_COMMISSION', 'SPORTS_FRANCHISES', 'PRIVATE_EQUITY_SYNDICATES', 'EXECUTIVE_BOARDS'],
    unlockedActions: ['Acquire Competitor Corporations', 'Commission HQ Skyscraper & Campus Megaprojects', 'Acquire Professional Sports Franchises', 'Appoint & Delegate to Professional CEOs'],
    promotionRequirements: {
      minOverallScore: 600,
      description: 'Attain major conglomerate scale, multi-company control, or monumental project completion.',
      qualifyingPaths: [
        'Conglomerate Path: 2+ active operating companies with combined valuation > $15M or total headcount > 50.',
        'Capital Scale Path: Net worth of $20M+ with diversified commercial equity and prime property holdings.',
        'Monumental Project Path: Completed major corporate skyscrapers, stadiums, or tech campuses with large institutional presence.'
      ]
    },
    maintenanceRequirements: {
      minOverallScore: 480,
      description: 'Maintain enterprise scale and avoid catastrophic conglomerate liquidation or insolvency.',
      gracePeriodMonths: 5
    }
  },

  POWER_INFLUENCE: {
    id: 'POWER_INFLUENCE',
    rank: 6,
    displayName: 'Powerbroker & High Influence',
    subtitle: 'Societal Sway, Political Authority & Civic Foundations',
    description: 'Wielding systemic influence beyond private balance sheets: holding elected political office, directing public discourse, establishing civic foundations, and shaping public policy.',
    badgeColor: '#f97316',
    badgeBg: 'rgba(249, 115, 22, 0.12)',
    badgeBorder: 'rgba(249, 115, 22, 0.3)',
    focusAreas: ['Elected Public Office', 'Regulatory & Legislative Influence', 'Philanthropic Foundations', 'Media Attention & Public Voice', 'Civic Alliances'],
    supportedEventCategories: ['Politics', 'Business', 'Philanthropy', 'World', 'Projects', 'Celebrity'],
    supportedDecisionCategories: ['Politics', 'Philanthropy', 'Business', 'Succession', 'Ethics', 'Controversial'],
    unlockedDomains: ['ELECTED_GOVERNANCE', 'CIVIC_FOUNDATIONS', 'POLITICAL_PACS', 'LEGISLATIVE_LOBBYING', 'PUBLIC_POLICY'],
    unlockedActions: ['Run for Mayor / Member of Parliament / Cabinet Minister', 'Endow Major Philanthropic Foundations', 'Lobby & Introduce Legislative Initiatives', 'Host National Policy Conferences'],
    promotionRequirements: {
      minOverallScore: 760,
      description: 'Demonstrate systemic societal sway through political office, major civic foundations, or high economic power.',
      qualifyingPaths: [
        'Political Path: Holding significant elected political office (Mayor, MP, Cabinet Minister, Party Leader).',
        'Economic Powerbroker Path: Prominent/Elite power status with $50M+ net worth and high business influence.',
        'Public & Civic Path: World influence 70+, high reputation, and significant philanthropic/civic foundation impact.'
      ]
    },
    maintenanceRequirements: {
      minOverallScore: 620,
      description: 'Maintain institutional relevance, public standing, or political capital.',
      gracePeriodMonths: 4
    }
  },

  NATIONAL_GLOBAL_POWER: {
    id: 'NATIONAL_GLOBAL_POWER',
    rank: 7,
    displayName: 'National & Global Power',
    subtitle: 'Sovereign Mandate, Worldwide Footprint & Macro Control',
    description: 'Operating at sovereign or multinational scale: leading state governments as Head of State, directing international trade pacts, managing global conglomerates, or funding world-shaping initiatives.',
    badgeColor: '#ec4899',
    badgeBg: 'rgba(236, 72, 153, 0.12)',
    badgeBorder: 'rgba(236, 72, 153, 0.3)',
    focusAreas: ['Head of State Mandate', 'Sovereign Treaties & Foreign Policy', 'Multinational Conglomerates', 'International Investment Syndicates', 'Global Initiatives'],
    supportedEventCategories: ['World', 'Politics', 'Business', 'Philanthropy', 'Projects'],
    supportedDecisionCategories: ['Politics', 'Business', 'World', 'Philanthropy', 'Succession'],
    unlockedDomains: ['SOVEREIGN_DIPLOMACY', 'MULTINATIONAL_TRADE', 'HEAD_OF_STATE_MANDATE', 'GLOBAL_MEGAPROJECTS', 'WORLD_ORDER'],
    unlockedActions: ['Enact Sovereign Bilateral Treaties', 'Direct National Fiscal and Monetary Policies', 'Acquire Global Multinational Conglomerates', 'Fund Frontier Science & Global Health Initiatives'],
    promotionRequirements: {
      minOverallScore: 880,
      description: 'Attain head of state office, global market hegemony, or sovereign-scale economic authority.',
      qualifyingPaths: [
        'Head of State Path: Elected President or Prime Minister commanding national government authority.',
        'Global Titan Path: Sovereign Titan / Global Power broker with $250M+ net worth and operating footprint in 3+ countries.',
        'Multinational Dominance Path: Commanding multinational enterprises with major international market share.'
      ]
    },
    maintenanceRequirements: {
      minOverallScore: 750,
      description: 'Maintain sovereign authority, multinational presence, or top-tier power score.',
      gracePeriodMonths: 4
    }
  },

  LEGACY_DYNASTY: {
    id: 'LEGACY_DYNASTY',
    rank: 8,
    displayName: 'Legacy & Sovereign Dynasty',
    subtitle: 'Generational Immortality, Heirs & Enduring Lineage',
    description: 'Transcending an individual mortal lifespan through established multi-generational heirs, perpetual family trusts, multi-generational enterprises, and indelible historical legacy.',
    badgeColor: '#eab308',
    badgeBg: 'rgba(234, 179, 8, 0.15)',
    badgeBorder: 'rgba(234, 179, 8, 0.4)',
    focusAreas: ['Dynastic Succession Planning', 'Heir Mentorship & Grooming', 'Generational Family Trusts', 'Historical Milestones & Family Lore', 'Enduring Philanthropic Endowments'],
    supportedEventCategories: ['Dynasty', 'Family', 'Philanthropy', 'World', 'Business'],
    supportedDecisionCategories: ['Succession', 'Dynasty', 'Family', 'Philanthropy', 'Wealth'],
    unlockedDomains: ['DYNASTY_SUCCESSION', 'GENERATIONAL_TRUSTS', 'FAMILY_HOLDING_COMPACTS', 'PERPETUAL_LEGACY', 'LINEAGE_GOVERNANCE'],
    unlockedActions: ['Formulate Comprehensive Succession & Will Plans', 'Establish Perpetual Multi-Generational Family Trusts', 'Appoint & Groom Capable Family Heirs', 'Commission Dynasty Memorials & Historic Family Archives'],
    promotionRequirements: {
      minOverallScore: 940,
      description: 'Build an enduring multi-generational dynasty, secure succession planning, and establish generational assets.',
      qualifyingPaths: [
        'Dynasty Succession Path: Multi-generation lineage with appointed heir, family stability > 60, and active succession governance.',
        'Generational Empire Path: Total dynasty wealth $100M+, 3+ dynasty family enterprises, and generational timeline milestones.',
        'Sovereign Legacy Path: Supreme lifetime philanthropy ($25M+) + pristine historic reputation + permanent institutional legacy.'
      ]
    },
    maintenanceRequirements: {
      minOverallScore: 820,
      description: 'Maintain dynastic stability, heir continuity, and family empire integrity.',
      gracePeriodMonths: 3
    }
  }
};

/**
 * Score weights used to synthesize the 10 domain scores into the 0-1000 overall progression score.
 * Each domain provides up to 100 points.
 */
export const PROGRESSION_DOMAIN_WEIGHTS = {
  independence: 1.0,       // Max 100
  professional: 1.0,       // Max 100
  ownership: 1.0,          // Max 100
  economicPower: 1.0,      // Max 100
  socialInfluence: 1.0,    // Max 100
  politicalPower: 1.0,     // Max 100
  institutionalPower: 1.0, // Max 100
  globalInfluence: 1.0,    // Max 100
  responsibility: 1.0,     // Max 100
  legacy: 1.0              // Max 100
};
