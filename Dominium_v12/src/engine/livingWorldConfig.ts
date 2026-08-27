import {
  IndustryMarketCondition,
  RegionalMarketState,
  LivingDynasty,
  LivingFamily,
  LivingNpc,
  CompetitorProfile,
  AutonomousBusiness,
  PoliticalActor,
  PoliticalFaction,
  LivingEconomyState,
  GlobalWorldState,
  LivingWorldEvent
} from '../types';

export const INITIAL_INDUSTRY_CONDITIONS: IndustryMarketCondition[] = [
  {
    industry: 'Technology & AI',
    state: 'EXPANDING',
    growthRateAnnual: 14.5,
    competitionIndex: 82,
    disruptionRisk: 75,
    entryBarrier: 'Moderate',
    marketSizeBillions: 4800,
    dominantPlayerName: 'NovaCore Systems',
    recentDevelopments: [
      'Breakthrough generative neural architecture creates multi-billion cloud surge.',
      'Venture capital pivots aggressively toward autonomous robotics and chips.'
    ]
  },
  {
    industry: 'Finance & Banking',
    state: 'STABLE',
    growthRateAnnual: 4.8,
    competitionIndex: 78,
    disruptionRisk: 45,
    entryBarrier: 'Formidable',
    marketSizeBillions: 9200,
    dominantPlayerName: 'Sterling Merchant Bancorp',
    recentDevelopments: [
      'Central bank rate spreads stabilize net interest margins for tier-one lenders.',
      'Institutional private credit funds challenge traditional syndication desks.'
    ]
  },
  {
    industry: 'Healthcare & Biotechnology',
    state: 'EXPANDING',
    growthRateAnnual: 9.2,
    competitionIndex: 65,
    disruptionRisk: 55,
    entryBarrier: 'High',
    marketSizeBillions: 3400,
    dominantPlayerName: 'Aegis BioPharma',
    recentDevelopments: [
      'Phase III clinical approvals accelerate oncology immunotherapy valuations.',
      'Global demographic aging drives persistent medical infrastructure demand.'
    ]
  },
  {
    industry: 'Energy & CleanTech',
    state: 'COMPETITIVE',
    growthRateAnnual: 11.0,
    competitionIndex: 72,
    disruptionRisk: 60,
    entryBarrier: 'High',
    marketSizeBillions: 5100,
    dominantPlayerName: 'Helios Grid Global',
    recentDevelopments: [
      'Next-generation battery storage arrays lower utility grid storage overhead.',
      'Transition subsidies trigger fierce bidding for offshore wind acreage.'
    ]
  },
  {
    industry: 'Consumer Goods & Retail',
    state: 'COMPETITIVE',
    growthRateAnnual: 3.5,
    competitionIndex: 88,
    disruptionRisk: 50,
    entryBarrier: 'Low',
    marketSizeBillions: 6500,
    dominantPlayerName: 'OmniTrade Direct',
    recentDevelopments: [
      'Omnichannel supply chain automation squeezes mid-market retail margins.',
      'Direct-to-consumer premium brands consolidate under multi-brand holding groups.'
    ]
  },
  {
    industry: 'Real Estate & Infrastructure',
    state: 'STABLE',
    growthRateAnnual: 5.2,
    competitionIndex: 60,
    disruptionRisk: 30,
    entryBarrier: 'High',
    marketSizeBillions: 7800,
    dominantPlayerName: 'Valois Metropolitan Realty',
    recentDevelopments: [
      'Prime city-center mixed-use towers maintain robust international institutional occupancy.',
      'Logistics park demand stays elevated near major seaport terminals.'
    ]
  },
  {
    industry: 'Aerospace & Industrial',
    state: 'STABLE',
    growthRateAnnual: 6.8,
    competitionIndex: 58,
    disruptionRisk: 40,
    entryBarrier: 'Formidable',
    marketSizeBillions: 2900,
    dominantPlayerName: 'Vance-Krupp Dynamics',
    recentDevelopments: [
      'Commercial orbital logistics and satellite constellation contracts expand backlog.',
      'Defense modernization appropriations drive multi-year manufacturing order books.'
    ]
  },
  {
    industry: 'Media & Entertainment',
    state: 'DISRUPTED',
    growthRateAnnual: 2.1,
    competitionIndex: 90,
    disruptionRisk: 85,
    entryBarrier: 'Moderate',
    marketSizeBillions: 2100,
    dominantPlayerName: 'Apex Media Syndicate',
    recentDevelopments: [
      'Algorithmic personalized content streaming fractures traditional broadcast syndication.',
      'Intellectual property franchises command record private equity acquisition multiples.'
    ]
  }
];

export const INITIAL_REGIONS_DATA: RegionalMarketState[] = [
  {
    regionId: 'reg_na_east',
    regionName: 'Atlantic Financial Corridor',
    countryName: 'United States',
    economicVibrancy: 88,
    costOfLivingIndex: 145,
    businessTaxScore: 70,
    talentPoolQuality: 92,
    politicalStability: 85,
    keyIndustries: ['Finance & Banking', 'Technology & AI', 'Real Estate & Infrastructure'],
    currentOpportunityHeadline: 'Surge in private credit and legal tech incubators.'
  },
  {
    regionId: 'reg_na_west',
    regionName: 'Pacific Innovation Hub',
    countryName: 'United States',
    economicVibrancy: 94,
    costOfLivingIndex: 160,
    businessTaxScore: 62,
    talentPoolQuality: 96,
    politicalStability: 82,
    keyIndustries: ['Technology & AI', 'Healthcare & Biotechnology', 'CleanTech'],
    currentOpportunityHeadline: 'Venture accelerators seeking advanced robotics and enterprise SaaS.'
  },
  {
    regionId: 'reg_eu_west',
    regionName: 'Western European Union',
    countryName: 'United Kingdom',
    economicVibrancy: 76,
    costOfLivingIndex: 130,
    businessTaxScore: 68,
    talentPoolQuality: 88,
    politicalStability: 88,
    keyIndustries: ['Finance & Banking', 'Real Estate & Infrastructure', 'Media & Entertainment'],
    currentOpportunityHeadline: 'Cross-border fintech integration and green bond issuances.'
  },
  {
    regionId: 'reg_asia_east',
    regionName: 'East Asian Commercial Arc',
    countryName: 'Japan',
    economicVibrancy: 82,
    costOfLivingIndex: 120,
    businessTaxScore: 75,
    talentPoolQuality: 94,
    politicalStability: 92,
    keyIndustries: ['Aerospace & Industrial', 'Technology & AI', 'CleanTech'],
    currentOpportunityHeadline: 'Semiconductor manufacturing subsidies and automation export growth.'
  }
];

export const INITIAL_LIVING_DYNASTIES: LivingDynasty[] = [
  {
    id: 'dyn_sterling',
    dynastyName: 'House of Sterling',
    foundingYear: 1952,
    currentGeneration: 3,
    headPersonId: 'npc_arthur_sterling',
    heirPersonId: 'npc_vincent_sterling',
    totalDynastyWealth: 3400000000,
    prestigeRank: 'Global Patrician',
    controlledCompanyIds: ['comp_auton_sterling_bank', 'comp_auton_sterling_realty'],
    politicalFactionId: 'fac_enterprise',
    legacyPillars: ['Global Merchant Banking', 'Conservative Capital Preservation', 'Institutional Philanthropy'],
    successionRisk: 'Stable',
    dynastyHistory: [
      'Founded in 1952 by Sir Reginald Sterling as an international merchant bank.',
      'Expanded across Transatlantic bond syndicates throughout the late 20th century.',
      'Current patriarch Arthur Sterling oversees diversified multi-family endowment.'
    ]
  },
  {
    id: 'dyn_tanaka',
    dynastyName: 'Tanaka Syndicate',
    foundingYear: 1978,
    currentGeneration: 2,
    headPersonId: 'npc_kenji_tanaka',
    heirPersonId: 'npc_hana_tanaka',
    totalDynastyWealth: 1850000000,
    prestigeRank: 'National Aristocracy',
    controlledCompanyIds: ['comp_auton_novacore', 'comp_auton_tanaka_optics'],
    politicalFactionId: 'fac_technocrat',
    legacyPillars: ['Advanced Semiconductor Foundry', 'R&D Innovation', 'Generational Meritocracy'],
    successionRisk: 'Stable',
    dynastyHistory: [
      'Emerged from microelectronics manufacturing in Kyoto in 1978.',
      'Pioneered optical lithography components and AI hardware accelerators.',
      'Maintains disciplined technological leadership and research university partnerships.'
    ]
  },
  {
    id: 'dyn_valois',
    dynastyName: 'Valois-Althaus Heritage',
    foundingYear: 1965,
    currentGeneration: 3,
    headPersonId: 'npc_helena_valois',
    heirPersonId: 'npc_julien_valois',
    totalDynastyWealth: 2200000000,
    prestigeRank: 'National Aristocracy',
    controlledCompanyIds: ['comp_auton_valois_realty', 'comp_auton_apex_media'],
    politicalFactionId: 'fac_heritage',
    legacyPillars: ['Prime Metropolitan Real Estate', 'Luxury Hospitality', 'Cultural Arts Patronage'],
    successionRisk: 'Contested',
    dynastyHistory: [
      'Assembled premier real estate parcels across major financial capitals.',
      'Recent succession tensions between conservative real estate wing and media venture heirs.'
    ]
  }
];

export const INITIAL_LIVING_FAMILIES: LivingFamily[] = [
  {
    id: 'fam_sterling',
    familyName: 'Sterling Family',
    headPersonId: 'npc_arthur_sterling',
    memberIds: ['npc_arthur_sterling', 'npc_eleanor_sterling', 'npc_vincent_sterling'],
    totalWealth: 3400000000,
    socialPrestige: 94,
    reputation: 86,
    residenceCity: 'New York',
    heirPersonId: 'npc_vincent_sterling',
    familyValues: ['Discipline', 'Financial Stewardship', 'High Civility'],
    alliedFamilyIds: ['fam_tanaka'],
    rivalFamilyIds: ['fam_valois'],
    recentFamilyEvents: [
      'Annual Sterling Family Charitable Gala raised $18M for university medical research.',
      'Vincent Sterling appointed to executive board of family investment committee.'
    ]
  },
  {
    id: 'fam_tanaka',
    familyName: 'Tanaka Family',
    headPersonId: 'npc_kenji_tanaka',
    memberIds: ['npc_kenji_tanaka', 'npc_hana_tanaka'],
    totalWealth: 1850000000,
    socialPrestige: 88,
    reputation: 90,
    residenceCity: 'Tokyo',
    heirPersonId: 'npc_hana_tanaka',
    familyValues: ['Precision', 'Long-term Vision', 'Honor'],
    alliedFamilyIds: ['fam_sterling'],
    rivalFamilyIds: [],
    recentFamilyEvents: [
      'Hana Tanaka published award-winning quantum computing thesis.'
    ]
  },
  {
    id: 'fam_valois',
    familyName: 'Valois Family',
    headPersonId: 'npc_helena_valois',
    memberIds: ['npc_helena_valois', 'npc_julien_valois'],
    totalWealth: 2200000000,
    socialPrestige: 92,
    reputation: 79,
    residenceCity: 'London',
    heirPersonId: 'npc_julien_valois',
    familyValues: ['Prestige', 'Aesthetic Perfection', 'Social Dominance'],
    alliedFamilyIds: [],
    rivalFamilyIds: ['fam_sterling'],
    recentFamilyEvents: [
      'Helena Valois acquired historic landmark gallery in central Mayfair.'
    ]
  }
];

export const INITIAL_LIVING_NPCS: LivingNpc[] = [
  {
    id: 'npc_arthur_sterling',
    firstName: 'Arthur',
    lastName: 'Sterling',
    age: 62,
    gender: 'Male',
    locationCity: 'New York',
    locationCountry: 'United States',
    lod: 'FULL',
    traits: {
      riskTolerance: 35,
      ambition: 85,
      loyalty: 75,
      aggression: 45,
      discipline: 92,
      adaptability: 60
    },
    primaryGoal: 'LEGACY',
    activeGoals: [
      {
        id: 'goal_art_1',
        category: 'LEGACY',
        title: 'Preserve Sterling Family Sovereign Endowment',
        targetProgress: 88,
        priorityScore: 95,
        reason: 'Maintain generational capital dominance against volatile market cycles.'
      },
      {
        id: 'goal_art_2',
        category: 'BUSINESS_GROWTH',
        title: 'Expand Tier-One Corporate Debt Syndication',
        targetProgress: 72,
        priorityScore: 80,
        reason: 'Consolidate market share in international infrastructure lending.'
      }
    ],
    lifeTier: 'LEGACY_DYNASTY',
    powerTier: 'POWERFUL',
    career: {
      occupation: 'Senior Managing Partner',
      field: 'Finance & Banking',
      monthlySalary: 280000,
      employerName: 'Sterling Merchant Bancorp',
      yearsInRole: 24,
      careerTier: 'Eminent'
    },
    netWorth: 1450000000,
    cash: 85000000,
    influence: 88,
    reputation: 89,
    familyId: 'fam_sterling',
    dynastyId: 'dyn_sterling',
    relationshipToPlayer: 'Respected Financial Peer',
    relationshipScore: 15,
    isRival: false,
    isAlly: true,
    isCompetitor: true,
    competitorId: 'comp_prof_sterling',
    memories: [
      {
        id: 'mem_art_01',
        tick: 0,
        month: 1,
        year: 2026,
        sourceEntityId: 'player',
        sourceEntityName: 'Player',
        eventType: 'FIRST_CONTACT',
        emotionalImpact: 10,
        description: 'Noted the player as an emerging figure in the regional commercial sphere.',
        isPermanent: true
      }
    ],
    recentActions: [
      'Allocated $150M into sovereign bond reserves.',
      'Delivered keynote speech on global liquidity stability at International Finance Summit.'
    ],
    biographyTimeline: [
      '2002: Assumed leadership of Sterling Merchant Bancorp.',
      '2014: Established the Sterling Generational Trust.',
      '2024: Negotiated historic international infrastructure financing consortium.'
    ],
    lastSimulatedTick: 0
  },
  {
    id: 'npc_vincent_sterling',
    firstName: 'Vincent',
    lastName: 'Sterling',
    age: 32,
    gender: 'Male',
    locationCity: 'New York',
    locationCountry: 'United States',
    lod: 'ACTIVE',
    traits: {
      riskTolerance: 75,
      ambition: 92,
      loyalty: 60,
      aggression: 70,
      discipline: 78,
      adaptability: 82
    },
    primaryGoal: 'BUSINESS_GROWTH',
    activeGoals: [
      {
        id: 'goal_vinc_1',
        category: 'BUSINESS_GROWTH',
        title: 'Launch Disruptive Quantum Fintech Venture',
        targetProgress: 65,
        priorityScore: 90,
        reason: 'Prove independence from patriarch Arthur Sterling through hyper-growth technology.'
      }
    ],
    lifeTier: 'ENTREPRENEUR_OWNER',
    powerTier: 'PROMINENT',
    career: {
      occupation: 'Chief Investment Officer',
      field: 'Finance & Banking',
      monthlySalary: 75000,
      employerName: 'Sterling Growth Capital',
      yearsInRole: 6,
      careerTier: 'Executive'
    },
    netWorth: 85000000,
    cash: 12000000,
    influence: 68,
    reputation: 74,
    familyId: 'fam_sterling',
    dynastyId: 'dyn_sterling',
    relationshipToPlayer: 'Ambitious Rival',
    relationshipScore: -10,
    isRival: true,
    isAlly: false,
    isCompetitor: true,
    competitorId: 'comp_prof_vinc_venture',
    memories: [],
    recentActions: [
      'Closed $40M Series B syndicate for algorithmic trading startup.',
      'Challenged player commercial positioning in tech acquisitions.'
    ],
    biographyTimeline: [
      '2018: Graduated MBA with Distinction.',
      '2021: Founded Sterling Growth Capital venture arm.'
    ],
    lastSimulatedTick: 0
  },
  {
    id: 'npc_helena_valois',
    firstName: 'Helena',
    lastName: 'Valois',
    age: 58,
    gender: 'Female',
    locationCity: 'London',
    locationCountry: 'United Kingdom',
    lod: 'ACTIVE',
    traits: {
      riskTolerance: 45,
      ambition: 88,
      loyalty: 65,
      aggression: 65,
      discipline: 85,
      adaptability: 70
    },
    primaryGoal: 'WEALTH_ACCUMULATION',
    activeGoals: [
      {
        id: 'goal_hel_1',
        category: 'WEALTH_ACCUMULATION',
        title: 'Acquire Prime City-Center Commercial Towers',
        targetProgress: 80,
        priorityScore: 88,
        reason: 'Lock in unassailable urban real estate yield.'
      }
    ],
    lifeTier: 'TYCOON',
    powerTier: 'POWERFUL',
    career: {
      occupation: 'Chairwoman & CEO',
      field: 'Real Estate & Infrastructure',
      monthlySalary: 190000,
      employerName: 'Valois Metropolitan Realty',
      yearsInRole: 18,
      careerTier: 'Eminent'
    },
    netWorth: 920000000,
    cash: 45000000,
    influence: 82,
    reputation: 80,
    familyId: 'fam_valois',
    dynastyId: 'dyn_valois',
    relationshipToPlayer: 'Calculated Competitor',
    relationshipScore: 0,
    isRival: false,
    isAlly: false,
    isCompetitor: true,
    competitorId: 'comp_prof_valois',
    memories: [],
    recentActions: [
      'Refinanced $300M commercial mortgage portfolio at favorable fixed coupon.',
      'Acquired prime mixed-use development site in central tech corridor.'
    ],
    biographyTimeline: [
      '2008: Expanded Valois real estate holdings across continental Europe.',
      '2022: Launched luxury sustainable residential skyscraper development.'
    ],
    lastSimulatedTick: 0
  },
  {
    id: 'npc_kenji_tanaka',
    firstName: 'Kenji',
    lastName: 'Tanaka',
    age: 54,
    gender: 'Male',
    locationCity: 'Tokyo',
    locationCountry: 'Japan',
    lod: 'ACTIVE',
    traits: {
      riskTolerance: 60,
      ambition: 90,
      loyalty: 85,
      aggression: 50,
      discipline: 95,
      adaptability: 85
    },
    primaryGoal: 'BUSINESS_GROWTH',
    activeGoals: [
      {
        id: 'goal_ken_1',
        category: 'BUSINESS_GROWTH',
        title: 'Pioneer Sub-2nm Semiconductor Architecture',
        targetProgress: 75,
        priorityScore: 92,
        reason: 'Maintain global silicon hardware dominance.'
      }
    ],
    lifeTier: 'TYCOON',
    powerTier: 'ELITE',
    career: {
      occupation: 'Chief Executive Officer',
      field: 'Technology & AI',
      monthlySalary: 210000,
      employerName: 'NovaCore Systems',
      yearsInRole: 14,
      careerTier: 'Eminent'
    },
    netWorth: 780000000,
    cash: 62000000,
    influence: 84,
    reputation: 92,
    familyId: 'fam_tanaka',
    dynastyId: 'dyn_tanaka',
    relationshipToPlayer: 'Neutral Tech Luminary',
    relationshipScore: 10,
    isRival: false,
    isAlly: true,
    isCompetitor: true,
    competitorId: 'comp_prof_novacore',
    memories: [],
    recentActions: [
      'Signed $1.2B foundry supply agreement with global cloud hyperscalers.',
      'Granted 50 international patents in neuromorphic computing.'
    ],
    biographyTimeline: [
      '2012: Appointed CEO of NovaCore Systems.',
      '2019: Led international semiconductor consortium.'
    ],
    lastSimulatedTick: 0
  },
  {
    id: 'npc_victoria_vance',
    firstName: 'Victoria',
    lastName: 'Vance',
    age: 49,
    gender: 'Female',
    locationCity: 'Washington D.C.',
    locationCountry: 'United States',
    lod: 'ACTIVE',
    traits: {
      riskTolerance: 55,
      ambition: 95,
      loyalty: 50,
      aggression: 80,
      discipline: 88,
      adaptability: 90
    },
    primaryGoal: 'POWER',
    activeGoals: [
      {
        id: 'goal_vic_1',
        category: 'POWER',
        title: 'Secure Parliamentary Majority & Ministry Portfolio',
        targetProgress: 70,
        priorityScore: 96,
        reason: 'Enact national commercial competitiveness charter.'
      }
    ],
    lifeTier: 'NATIONAL_GLOBAL_POWER',
    powerTier: 'POWERFUL',
    career: {
      occupation: 'Senior Senator / Party Floor Leader',
      field: 'Politics & Governance',
      monthlySalary: 22000,
      employerName: 'National Senate',
      yearsInRole: 10,
      careerTier: 'Eminent'
    },
    netWorth: 42000000,
    cash: 5500000,
    influence: 92,
    reputation: 76,
    relationshipToPlayer: 'Formidable Political Force',
    relationshipScore: -5,
    isRival: true,
    isAlly: false,
    isCompetitor: true,
    competitorId: 'comp_prof_vance_pol',
    memories: [],
    recentActions: [
      'Chaired high-profile legislative inquiry into corporate antitrust compliance.',
      'Marshaled legislative coalition for clean energy export subsidies.'
    ],
    biographyTimeline: [
      '2016: Elected to the Senate.',
      '2022: Ascended to Majority Floor Leadership.'
    ],
    lastSimulatedTick: 0
  }
];

export const INITIAL_COMPETITOR_PROFILES: CompetitorProfile[] = [
  {
    id: 'comp_prof_sterling',
    name: 'Sterling Merchant Bancorp',
    leadPersonId: 'npc_arthur_sterling',
    domain: 'BUSINESS',
    strategy: 'LONG_TERM_ACCUMULATION',
    currentResources: 1800000000,
    marketPower: 86,
    growthRate: 0.6,
    targetIndustry: 'Finance & Banking',
    targetMarket: 'Corporate Debt & M&A',
    activeInitiative: 'Consolidating regional boutique advisory firms into national private wealth network.',
    recentMoves: [
      'Underwrote $450M syndicated loan for green infrastructure project.',
      'Maintains ultra-conservative 22% tier-1 capital ratio.'
    ],
    threatLevel: 'Formidable',
    headquartersCity: 'New York',
    rivalryIntensity: 35
  },
  {
    id: 'comp_prof_novacore',
    name: 'NovaCore Systems',
    leadPersonId: 'npc_kenji_tanaka',
    domain: 'BUSINESS',
    strategy: 'INNOVATION',
    currentResources: 950000000,
    marketPower: 82,
    growthRate: 1.8,
    targetIndustry: 'Technology & AI',
    targetMarket: 'Enterprise Neural Chips',
    activeInitiative: 'Accelerating next-generation AI chip tape-out for tier-1 hyperscaler datacenters.',
    recentMoves: [
      'Announced breakthrough 2nm semiconductor fabrication milestone.',
      'Poached top quantum research team from competitor laboratory.'
    ],
    threatLevel: 'Formidable',
    headquartersCity: 'Tokyo',
    rivalryIntensity: 45
  },
  {
    id: 'comp_prof_valois',
    name: 'Valois Metropolitan Realty',
    leadPersonId: 'npc_helena_valois',
    domain: 'BUSINESS',
    strategy: 'MARKET_DOMINATION',
    currentResources: 1200000000,
    marketPower: 79,
    growthRate: 0.8,
    targetIndustry: 'Real Estate & Infrastructure',
    targetMarket: 'Prime Trophy Assets',
    activeInitiative: 'Aggressive bidding on prime city-center mixed-use towers to box out newcomers.',
    recentMoves: [
      'Acquired $280M commercial skyscraper complex in central business district.',
      'Launched private sovereign real estate investment syndicate.'
    ],
    threatLevel: 'Moderate',
    headquartersCity: 'London',
    rivalryIntensity: 40
  },
  {
    id: 'comp_prof_vance_pol',
    name: 'Vance Political Action Coalition',
    leadPersonId: 'npc_victoria_vance',
    domain: 'POLITICAL',
    strategy: 'POLITICAL_INFLUENCE',
    currentResources: 65000000,
    marketPower: 90,
    growthRate: 1.2,
    targetIndustry: 'Politics & Governance',
    targetMarket: 'National Policy & Regulatory Oversight',
    activeInitiative: 'Building legislative coalition to tighten corporate merger antitrust scrutiny.',
    recentMoves: [
      'Secured endorsements from 14 regional governors.',
      'Pushed legislative hearings on corporate tax harmonization.'
    ],
    threatLevel: 'Predatory',
    headquartersCity: 'Washington D.C.',
    rivalryIntensity: 65
  },
  {
    id: 'comp_prof_vinc_venture',
    name: 'Sterling Growth Capital',
    leadPersonId: 'npc_vincent_sterling',
    domain: 'CAREER',
    strategy: 'AGGRESSIVE_GROWTH',
    currentResources: 120000000,
    marketPower: 64,
    growthRate: 2.5,
    targetIndustry: 'Technology & AI',
    targetMarket: 'Fintech & Quantum Venture',
    activeInitiative: 'Preemptively acquiring early-stage enterprise startups before player can bid.',
    recentMoves: [
      'Led competitive bidding war on AI logistics seed startup.',
      'Aggressively marketing fund performance across institutional media.'
    ],
    threatLevel: 'Moderate',
    headquartersCity: 'New York',
    rivalryIntensity: 55
  }
];

export const INITIAL_AUTONOMOUS_BUSINESSES: AutonomousBusiness[] = [
  {
    id: 'comp_auton_sterling_bank',
    name: 'Sterling Merchant Bancorp',
    industry: 'Finance & Banking',
    founderId: 'npc_arthur_sterling',
    valuation: 4200000000,
    marketShare: 24.5,
    monthlyRevenue: 65000000,
    monthlyProfit: 18500000,
    employeeCount: 4200,
    brandReputation: 92,
    productQuality: 90,
    isPublic: true,
    status: 'Flourishing',
    currentStrategy: 'LONG_TERM_ACCUMULATION',
    recentCorporateEvents: [
      'Maintained AA+ credit rating from global agencies.',
      'Declared record quarterly dividend to institutional shareholders.'
    ]
  },
  {
    id: 'comp_auton_novacore',
    name: 'NovaCore Systems',
    industry: 'Technology & AI',
    founderId: 'npc_kenji_tanaka',
    valuation: 5600000000,
    marketShare: 31.0,
    monthlyRevenue: 95000000,
    monthlyProfit: 26000000,
    employeeCount: 3800,
    brandReputation: 94,
    productQuality: 96,
    isPublic: true,
    status: 'Expanding',
    currentStrategy: 'INNOVATION',
    recentCorporateEvents: [
      'Completed tape-out for 2nm high-performance computing accelerators.',
      'Expanded automated robotics research laboratory.'
    ]
  },
  {
    id: 'comp_auton_valois_realty',
    name: 'Valois Metropolitan Realty',
    industry: 'Real Estate & Infrastructure',
    founderId: 'npc_helena_valois',
    valuation: 3100000000,
    marketShare: 19.5,
    monthlyRevenue: 42000000,
    monthlyProfit: 12500000,
    employeeCount: 1600,
    brandReputation: 88,
    productQuality: 91,
    isPublic: true,
    status: 'Stable',
    currentStrategy: 'MARKET_DOMINATION',
    recentCorporateEvents: [
      'Refinanced prime portfolio debt at 4.2% coupon.',
      'Broke ground on 55-story eco-certified luxury residential tower.'
    ]
  },
  {
    id: 'comp_auton_aegis_bio',
    name: 'Aegis BioPharma',
    industry: 'Healthcare & Biotechnology',
    valuation: 2800000000,
    marketShare: 22.0,
    monthlyRevenue: 38000000,
    monthlyProfit: 9500000,
    employeeCount: 2200,
    brandReputation: 86,
    productQuality: 92,
    isPublic: true,
    status: 'Flourishing',
    currentStrategy: 'INNOVATION',
    recentCorporateEvents: [
      'FDA granted priority review for breakthrough autoimmune therapy.',
      'Expanded biologics manufacturing campus.'
    ]
  },
  {
    id: 'comp_auton_helios_grid',
    name: 'Helios Grid Global',
    industry: 'Energy & CleanTech',
    valuation: 2400000000,
    marketShare: 18.0,
    monthlyRevenue: 35000000,
    monthlyProfit: 6800000,
    employeeCount: 3100,
    brandReputation: 84,
    productQuality: 88,
    isPublic: true,
    status: 'Expanding',
    currentStrategy: 'AGGRESSIVE_GROWTH',
    recentCorporateEvents: [
      'Won sovereign tender to build 1.5GW offshore floating wind array.',
      'Secured green hydrogen supply agreement with industrial steelmakers.'
    ]
  },
  {
    id: 'comp_auton_apex_media',
    name: 'Apex Media Syndicate',
    industry: 'Media & Entertainment',
    valuation: 1600000000,
    marketShare: 28.0,
    monthlyRevenue: 28000000,
    monthlyProfit: 3200000,
    employeeCount: 2800,
    brandReputation: 80,
    productQuality: 78,
    isPublic: true,
    status: 'Struggling',
    currentStrategy: 'MARKET_DOMINATION',
    recentCorporateEvents: [
      'Restructured legacy print division into digital subscription app.',
      'Announced executive leadership transition to address streaming churn.'
    ]
  }
];

export const INITIAL_POLITICAL_FACTIONS: PoliticalFaction[] = [
  {
    id: 'fac_enterprise',
    name: 'Enterprise Forward Alliance',
    ideologicalFocus: 'Free Market Dynamism, Deregulation, Corporate Tax Incentives & Capital Formation',
    parliamentarySeatsPercent: 38,
    donorCapital: 125000000,
    leaderId: 'npc_arthur_sterling',
    influenceScore: 84,
    stanceOnPlayer: 'Aligned Ally',
    policyPriorities: [
      'Streamline corporate permitting and fast-track M&A approvals.',
      'Lower statutory corporate capital gains and R&D payroll levies.'
    ]
  },
  {
    id: 'fac_technocrat',
    name: 'Technocratic Forward Coalition',
    ideologicalFocus: 'Meritocracy, STEM Education, AI Governance, Clean Energy Infrastructure',
    parliamentarySeatsPercent: 28,
    donorCapital: 95000000,
    leaderId: 'npc_kenji_tanaka',
    influenceScore: 78,
    stanceOnPlayer: 'Pragmatic Partner',
    policyPriorities: [
      'Fund sovereign semiconductor foundries and quantum computing grants.',
      'Modernize nationwide smart electrical grids and fast transit.'
    ]
  },
  {
    id: 'fac_heritage',
    name: 'Sovereign Heritage Front',
    ideologicalFocus: 'Domestic Industry Protection, Strategic Defense Autarky, Traditional Values',
    parliamentarySeatsPercent: 22,
    donorCapital: 60000000,
    leaderId: 'npc_victoria_vance',
    influenceScore: 80,
    stanceOnPlayer: 'Neutral Observer',
    policyPriorities: [
      'Impose tariffs on foreign subsidized imports to protect domestic manufacturers.',
      'Expand defense appropriations and strategic rare-earth stockpiles.'
    ]
  },
  {
    id: 'fac_social_union',
    name: 'Progressive Civic Union',
    ideologicalFocus: 'Wealth Redistribution, Universal Healthcare, Labor Protections, Antitrust Enforcement',
    parliamentarySeatsPercent: 12,
    donorCapital: 45000000,
    leaderId: 'npc_victoria_vance',
    influenceScore: 68,
    stanceOnPlayer: 'Fierce Opposition',
    policyPriorities: [
      'Enforce aggressive wealth tax tiers on multi-millionaires and billionaire dynasties.',
      'Break up dominant tech and banking monopolies.'
    ]
  }
];

export const INITIAL_POLITICAL_ACTORS: PoliticalActor[] = [
  {
    id: 'pol_act_vance',
    name: 'Senator Victoria Vance',
    currentRole: 'Senior Senator & Floor Leader',
    factionId: 'fac_heritage',
    influenceScore: 90,
    ambitionScore: 95,
    politicalCapital: 85,
    reputation: 78,
    stanceOnPlayer: 'Opposed',
    keyAgenda: 'Enacting antitrust caps and strategic industrial tariffs.',
    scandalVulnerability: 25
  },
  {
    id: 'pol_act_croft',
    name: 'Mayor Julian Croft',
    currentRole: 'Metropolitan Mayor',
    factionId: 'fac_enterprise',
    influenceScore: 74,
    ambitionScore: 82,
    politicalCapital: 68,
    reputation: 84,
    stanceOnPlayer: 'Supportive',
    keyAgenda: 'Attracting corporate headquarters and rezoning urban enterprise zones.',
    scandalVulnerability: 40
  },
  {
    id: 'pol_act_thorne',
    name: 'Chancellor Ronald Thorne',
    currentRole: 'Minister of Finance & Treasury',
    factionId: 'fac_technocrat',
    influenceScore: 88,
    ambitionScore: 78,
    politicalCapital: 82,
    reputation: 91,
    stanceOnPlayer: 'Neutral',
    keyAgenda: 'Fiscal discipline, national sovereign wealth fund growth, and debt containment.',
    scandalVulnerability: 15
  }
];

export const INITIAL_LIVING_ECONOMY: LivingEconomyState = {
  currentCycle: 'STABLE_GROWTH',
  monthsInCurrentCycle: 4,
  transitionProbability: 0.12,
  nationalGdpGrowth: 2.8,
  inflationRate: 2.4,
  benchmarkInterestRate: 4.25,
  unemploymentRate: 4.4,
  marketConfidenceIndex: 78,
  businessConfidenceIndex: 80,
  creditAvailability: 'Normal',
  cycleHistory: [
    {
      tick: 0,
      cycle: 'STABLE_GROWTH',
      summary: 'National economy entered balanced expansion with stable consumer demand and controlled inflation.'
    }
  ]
};

export const INITIAL_GLOBAL_WORLD_STATE: GlobalWorldState = {
  primaryCondition: 'GLOBAL_GROWTH',
  conditionSeverity: 'Mild',
  tradeFrictionScore: 28,
  globalCapitalFlowScore: 85,
  activeInternationalTreaties: [
    'Trans-Pacific Digital Commerce Accord',
    'Global Corporate Minimum Tax Framework',
    'International Clean Energy Standards Treaty'
  ],
  globalCrisis: null
};

export const INITIAL_WORLD_EVENTS: LivingWorldEvent[] = [
  {
    id: 'wev_ai_surge_01',
    title: 'Global Computing Infrastructure Expansion',
    headline: 'Hyperscalers Commit $120B to Autonomous Computing Clusters',
    category: 'INDUSTRY',
    severity: 'Notable',
    startTick: 0,
    durationMonths: 12,
    monthsElapsed: 1,
    isResolved: false,
    affectedIndustries: ['Technology & AI', 'Energy & CleanTech', 'Aerospace & Industrial'],
    affectedRegionIds: ['reg_na_west', 'reg_asia_east'],
    description: 'International technology conglomerates and sovereign wealth funds have initiated massive capital outlays for next-generation datacenters and high-efficiency grid connections.',
    simulationImpacts: {
      gdpImpact: 0.3,
      corporateRevenueImpactPercent: 6.5,
      hiringDemandFactor: 1.15
    },
    rippleSummary: [
      'Tech enterprises report 10-15% uptick in corporate enterprise software contracts.',
      'Industrial electrical suppliers and clean energy grids experience surging backlog.'
    ]
  },
  {
    id: 'wev_monetary_stability_01',
    title: 'Central Bank Policy Convergence',
    headline: 'Major Central Banks Coordinate Interest Rate Neutrality',
    category: 'ECONOMY',
    severity: 'Minor',
    startTick: 0,
    durationMonths: 8,
    monthsElapsed: 2,
    isResolved: false,
    affectedIndustries: ['Finance & Banking', 'Real Estate & Infrastructure'],
    description: 'Monetary authorities across major trade blocs maintain synchronized interest rate plateaus, calming international currency markets.',
    simulationImpacts: {
      interestRateShift: 0,
      marketVolatilityDelta: -0.15
    },
    rippleSummary: [
      'Lower financial market volatility stabilizes corporate debt refinancing spreads.',
      'Institutional commercial real estate buyers resume acquisitions.'
    ]
  }
];
