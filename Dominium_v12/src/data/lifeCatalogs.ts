import { 
  UniversityInstitution, 
  MarketplaceAssetItem, 
  WellnessActivity, 
  DateActivity, 
  DatingCandidate, 
  SocialPlatformType,
  SocialMediaAccount
} from '../types';

export const UNIVERSITIES_CATALOG: UniversityInstitution[] = [
  {
    id: 'uni_oxford_cambridge',
    name: 'Royal Institute of Oxbridge',
    country: 'United Kingdom',
    city: 'Oxbridge',
    badge: 'Crown',
    prestige: 98,
    academicQuality: 96,
    researchStrength: 95,
    networkingStrength: 99,
    careerPlacementRate: 98,
    admissionDifficulty: 92,
    accommodationCostMonthly: 1800,
    studentLifeScore: 88,
    description: 'An ancient collegiate university renowned worldwide for scholastic rigor, elite alumni networks, and premier political and corporate recruitment.',
    programs: [
      {
        id: 'prog_ox_ppe',
        name: 'B.A. Philosophy, Politics & Economics (PPE)',
        degreeLevel: 'Bachelor',
        field: 'Politics & Governance',
        durationMonths: 36,
        tuitionPerMonth: 2200,
        difficulty: 88,
        requiredIntelligence: 78,
        intellectGainPerMonth: 0.6,
        reputationGainTotal: 22,
        careerBoostFields: ['Politics & Public Service', 'Law & Justice', 'Finance & Banking']
      },
      {
        id: 'prog_ox_law',
        name: 'Bachelor of Jurisprudence (LL.B.)',
        degreeLevel: 'Bachelor',
        field: 'Law & Justice',
        durationMonths: 36,
        tuitionPerMonth: 2400,
        difficulty: 90,
        requiredIntelligence: 80,
        intellectGainPerMonth: 0.7,
        reputationGainTotal: 24,
        careerBoostFields: ['Law & Justice', 'Corporate Counsel']
      },
      {
        id: 'prog_ox_mphil_fin',
        name: 'M.Phil. in Quantitative Macro-Finance',
        degreeLevel: 'Master',
        field: 'Finance & Banking',
        durationMonths: 24,
        tuitionPerMonth: 3100,
        difficulty: 92,
        requiredIntelligence: 84,
        intellectGainPerMonth: 0.9,
        reputationGainTotal: 28,
        careerBoostFields: ['Finance & Banking', 'Central Banking', 'Private Equity']
      }
    ]
  },
  {
    id: 'uni_harvard_ivy',
    name: 'Aethelgard Ivy University',
    country: 'United States',
    city: 'Boston / Cambridge',
    badge: 'GraduationCap',
    prestige: 99,
    academicQuality: 97,
    researchStrength: 98,
    networkingStrength: 100,
    careerPlacementRate: 99,
    admissionDifficulty: 95,
    accommodationCostMonthly: 2400,
    studentLifeScore: 90,
    description: 'The pinnacle of private research academies with multi-billion dollar endowments and peerless global prestige.',
    programs: [
      {
        id: 'prog_ivy_cs_ai',
        name: 'B.Sc. Computer Science & Artificial Intelligence',
        degreeLevel: 'Bachelor',
        field: 'Technology',
        durationMonths: 48,
        tuitionPerMonth: 3400,
        difficulty: 90,
        requiredIntelligence: 80,
        intellectGainPerMonth: 0.65,
        reputationGainTotal: 25,
        careerBoostFields: ['Technology', 'AI Research', 'Venture Capital']
      },
      {
        id: 'prog_ivy_mba',
        name: 'Executive Master of Business Administration (MBA)',
        degreeLevel: 'Master',
        field: 'Business & Management',
        durationMonths: 24,
        tuitionPerMonth: 4800,
        difficulty: 86,
        requiredIntelligence: 78,
        intellectGainPerMonth: 0.8,
        reputationGainTotal: 35,
        careerBoostFields: ['Business & Management', 'Executive Leadership', 'M&A']
      },
      {
        id: 'prog_ivy_med',
        name: 'Doctor of Medicine (M.D.) & Clinical Surgery',
        degreeLevel: 'Master',
        field: 'Medicine & Healthcare',
        durationMonths: 48,
        tuitionPerMonth: 4200,
        difficulty: 95,
        requiredIntelligence: 88,
        intellectGainPerMonth: 0.85,
        reputationGainTotal: 30,
        careerBoostFields: ['Medicine & Healthcare', 'Biotech Innovation']
      }
    ]
  },
  {
    id: 'uni_mit_poly',
    name: 'Vanguard Polytechnic Institute of Technology',
    country: 'United States',
    city: 'San Francisco Bay',
    badge: 'Cpu',
    prestige: 96,
    academicQuality: 98,
    researchStrength: 100,
    networkingStrength: 92,
    careerPlacementRate: 97,
    admissionDifficulty: 94,
    accommodationCostMonthly: 2200,
    studentLifeScore: 82,
    description: 'World epicentre of algorithmic computing, aerospace innovation, and robotics development.',
    programs: [
      {
        id: 'prog_poly_deep_tech',
        name: 'B.Sc. Quantum Computing & Robotics',
        degreeLevel: 'Bachelor',
        field: 'Engineering & Deep Tech',
        durationMonths: 48,
        tuitionPerMonth: 3100,
        difficulty: 94,
        requiredIntelligence: 85,
        intellectGainPerMonth: 0.75,
        reputationGainTotal: 24,
        careerBoostFields: ['Technology', 'Engineering & Aerospace', 'R&D']
      },
      {
        id: 'prog_poly_phd_ai',
        name: 'Ph.D. in Neural Architectures & Cognitive Systems',
        degreeLevel: 'PhD',
        field: 'Technology',
        durationMonths: 36,
        tuitionPerMonth: 1800,
        difficulty: 98,
        requiredIntelligence: 90,
        intellectGainPerMonth: 1.1,
        reputationGainTotal: 40,
        careerBoostFields: ['AI Research', 'Deep Tech Founder', 'Chief Scientist']
      }
    ]
  },
  {
    id: 'uni_lse_wharton',
    name: 'Metropolitan School of Global Economics',
    country: 'United Kingdom',
    city: 'London',
    badge: 'TrendingUp',
    prestige: 94,
    academicQuality: 94,
    researchStrength: 92,
    networkingStrength: 96,
    careerPlacementRate: 96,
    admissionDifficulty: 88,
    accommodationCostMonthly: 1900,
    studentLifeScore: 86,
    description: 'The capital of international macroeconomic theory, investment banking feeder programs, and public policy think tanks.',
    programs: [
      {
        id: 'prog_lse_bsc_fin',
        name: 'B.Sc. Global Finance & Capital Markets',
        degreeLevel: 'Bachelor',
        field: 'Finance & Banking',
        durationMonths: 36,
        tuitionPerMonth: 2100,
        difficulty: 84,
        requiredIntelligence: 72,
        intellectGainPerMonth: 0.55,
        reputationGainTotal: 20,
        careerBoostFields: ['Finance & Banking', 'Investment Banking', 'Asset Management']
      },
      {
        id: 'prog_lse_msc_econ',
        name: 'M.Sc. Econometrics & Sovereign Policy',
        degreeLevel: 'Master',
        field: 'Finance & Banking',
        durationMonths: 18,
        tuitionPerMonth: 2900,
        difficulty: 91,
        requiredIntelligence: 82,
        intellectGainPerMonth: 0.85,
        reputationGainTotal: 26,
        careerBoostFields: ['Hedge Funds', 'Central Banking', 'Economic Strategy']
      }
    ]
  },
  {
    id: 'uni_sorbonne_arts',
    name: 'Academy of Fine Arts & Humanistic Letters',
    country: 'France',
    city: 'Paris',
    badge: 'Palette',
    prestige: 90,
    academicQuality: 91,
    researchStrength: 86,
    networkingStrength: 90,
    careerPlacementRate: 88,
    admissionDifficulty: 80,
    accommodationCostMonthly: 1500,
    studentLifeScore: 94,
    description: 'An illustrious cultural powerhouse producing world-renowned creative directors, philosophers, and architectural luminaries.',
    programs: [
      {
        id: 'prog_paris_arts',
        name: 'B.A. Visual Arts, Design & Cinema',
        degreeLevel: 'Bachelor',
        field: 'Arts & Media',
        durationMonths: 36,
        tuitionPerMonth: 1400,
        difficulty: 72,
        requiredIntelligence: 65,
        intellectGainPerMonth: 0.45,
        reputationGainTotal: 18,
        careerBoostFields: ['Arts & Media', 'Creative Direction', 'Film Production']
      },
      {
        id: 'prog_paris_arch',
        name: 'Master of Architecture & Urban Design',
        degreeLevel: 'Master',
        field: 'Engineering & Deep Tech',
        durationMonths: 24,
        tuitionPerMonth: 1850,
        difficulty: 84,
        requiredIntelligence: 75,
        intellectGainPerMonth: 0.7,
        reputationGainTotal: 22,
        careerBoostFields: ['Architecture', 'Urban Development', 'Luxury Projects']
      }
    ]
  },
  {
    id: 'uni_state_metro',
    name: 'Metropolitan State University',
    country: 'United States',
    city: 'Chicago',
    badge: 'BookOpen',
    prestige: 78,
    academicQuality: 82,
    researchStrength: 80,
    networkingStrength: 76,
    careerPlacementRate: 85,
    admissionDifficulty: 62,
    accommodationCostMonthly: 950,
    studentLifeScore: 84,
    description: 'A large, accessible public research university offering rigorous foundational degrees with affordable tuition.',
    programs: [
      {
        id: 'prog_state_bus',
        name: 'B.B.A. Business Administration & Marketing',
        degreeLevel: 'Bachelor',
        field: 'Business & Management',
        durationMonths: 48,
        tuitionPerMonth: 850,
        difficulty: 60,
        requiredIntelligence: 50,
        intellectGainPerMonth: 0.35,
        reputationGainTotal: 12,
        careerBoostFields: ['Business & Management', 'Marketing', 'Sales']
      },
      {
        id: 'prog_state_soft',
        name: 'B.Sc. Applied Software Systems',
        degreeLevel: 'Bachelor',
        field: 'Technology',
        durationMonths: 48,
        tuitionPerMonth: 950,
        difficulty: 68,
        requiredIntelligence: 55,
        intellectGainPerMonth: 0.4,
        reputationGainTotal: 14,
        careerBoostFields: ['Technology', 'Software Engineering']
      }
    ]
  }
];

// Legacy marketplace removed in V10. The live marketplace is generated by worldMarketplaceEngine with fictional brands.
export const MARKETPLACE_CATALOG: MarketplaceAssetItem[] = [];

export const WELLNESS_ACTIVITIES_CATALOG: WellnessActivity[] = [
  {
    id: 'wel_gym_trainer',
    name: 'Elite Personal Strength & Conditioning',
    category: 'Fitness',
    cost: 450,
    timeHours: 16,
    healthDelta: 3.5,
    happinessDelta: 2.0,
    stressDelta: -4.0,
    attractivenessDelta: 1.5,
    description: 'Structured hypertrophy, cardiovascular endurance, and biometric posture coaching.'
  },
  {
    id: 'wel_meditation_retreat',
    name: 'Mindfulness & Neuro-Restoration Meditation',
    category: 'Mental',
    cost: 800,
    timeHours: 12,
    healthDelta: 1.5,
    happinessDelta: 4.5,
    stressDelta: -8.0,
    intelligenceDelta: 1.0,
    description: 'Deep breathwork, alpha-wave soundscapes, and cortisol-reducing zen practice.'
  },
  {
    id: 'wel_spa_thermal',
    name: 'Hydrothermal Mineral Spa & Cryotherapy',
    category: 'Recovery',
    cost: 650,
    timeHours: 8,
    healthDelta: 2.5,
    happinessDelta: 3.5,
    stressDelta: -6.0,
    charmDelta: 1.0,
    description: 'Finnish dry sauna, cold plunge shock recovery, and essential mineral bath infusion.'
  },
  {
    id: 'wel_exec_therapy',
    name: 'Executive Psychotherapy & Peak Coaching',
    category: 'Mental',
    cost: 1200,
    timeHours: 6,
    healthDelta: 1.0,
    happinessDelta: 4.0,
    stressDelta: -9.0,
    charmDelta: 1.5,
    description: 'Confidential strategic mental health optimization and cognitive reframing.'
  },
  {
    id: 'wel_haute_styling',
    name: 'Personal Stylist & Grooming Transformation',
    category: 'Grooming',
    cost: 1500,
    timeHours: 6,
    healthDelta: 0.5,
    happinessDelta: 3.0,
    stressDelta: -2.0,
    attractivenessDelta: 3.5,
    charmDelta: 3.0,
    description: 'Complete sartorial curation, dermatological skincare, and hairstyle precision.'
  }
];

export const DATE_ACTIVITIES_CATALOG: DateActivity[] = [
  {
    id: 'date_cozy_coffee',
    name: 'Artisan Coffee & Scenic River Walk',
    type: 'Coffee & Stroll',
    cost: 45,
    timeHours: 4,
    romanticImpact: 6,
    funScore: 7,
    description: 'Casual, low-pressure conversation over pour-over single origin beans and scenic waterfront views.'
  },
  {
    id: 'date_fine_dining',
    name: 'Michelin-Starred Tasting Menu with Wine Pairing',
    type: 'Fine Dining',
    cost: 650,
    timeHours: 6,
    romanticImpact: 14,
    funScore: 9,
    description: 'Eight-course culinary journey with sommelier pairing in an intimate candlelit salon.'
  },
  {
    id: 'date_museum_gala',
    name: 'Private After-Hours Modern Art Gallery Tour',
    type: 'Art Gallery & Museum',
    cost: 320,
    timeHours: 5,
    romanticImpact: 11,
    funScore: 8,
    description: 'Curated champagne walk through exclusive private exhibitions and rare sculptural archives.'
  },
  {
    id: 'date_symphony',
    name: 'Royal Philharmonic Orchestra Box Suite',
    type: 'Live Concert',
    cost: 850,
    timeHours: 6,
    romanticImpact: 16,
    funScore: 9,
    description: 'Grand symphonic performance from a private velvet box with champagne and post-show cocktail lounge.'
  },
  {
    id: 'date_yacht_escape',
    name: 'Weekend Riviera Yacht Getaway',
    type: 'Luxury Yacht / Getaway',
    cost: 8500,
    timeHours: 24,
    romanticImpact: 28,
    funScore: 10,
    description: 'Private catamaran charter across coastal coves, gourmet onboard chef, and secluded sunset anchorages.'
  }
];

export const DATING_CANDIDATES_POOL: DatingCandidate[] = [
  {
    id: 'date_cand_1',
    name: 'Elena Rostova-Vance',
    age: 27,
    gender: 'Female',
    occupation: 'Venture Capital Associate & Art Collector',
    education: 'M.Sc. London School of Economics',
    personality: 'Ambitious, Cultured, Witty & Discerning',
    interests: ['Contemporary Art', 'Macro-Economics', 'Sailing', 'Equestrian'],
    lifestyle: 'Luxury Jetset',
    wealthLevel: 'Affluent',
    relationshipGoal: 'Long-Term Partnership',
    compatibilityScore: 86,
    location: 'Metropolitan Financial District',
    avatarSeed: 'ElenaVance',
    appearanceDescription: 'Poised with aristocratic elegance, emerald green eyes, and tailored cashmere coats.',
    matched: false,
    messages: [
      { sender: 'candidate', text: 'I noticed your recent investments in deep tech. Fascinating timing given the current rate cycle.', month: 1, year: 2026 }
    ]
  },
  {
    id: 'date_cand_2',
    name: 'Marcus Sterling Jr.',
    age: 29,
    gender: 'Male',
    occupation: 'Corporate M&A Attorney',
    education: 'LL.B. Oxford / Harvard Law',
    personality: 'Charismatic, Prudent, Well-Read & Loyal',
    interests: ['Alpine Skiing', 'Classical Music', 'Vintage Cars', 'Philanthropy'],
    lifestyle: 'Career Focused',
    wealthLevel: 'High Net Worth',
    relationshipGoal: 'Marriage & Family',
    compatibilityScore: 91,
    location: 'Mayfair / Upper East Side',
    avatarSeed: 'MarcusSterling',
    appearanceDescription: 'Crisp bespoke double-breasted suits, athletic build, and warm, steady demeanor.',
    matched: false,
    messages: [
      { sender: 'candidate', text: 'Good evening! Would love to invite you to the Philharmonic gala next weekend if your calendar permits.', month: 1, year: 2026 }
    ]
  },
  {
    id: 'date_cand_3',
    name: 'Aria Chen-Sinclair',
    age: 26,
    gender: 'Female',
    occupation: 'AI Research Scientist & Pianist',
    education: 'Ph.D. Vanguard Polytechnic',
    personality: 'Brilliant, Playful, Visionary & Empathetic',
    interests: ['Neural Networks', 'Concert Piano', 'Bouldering', 'Indie Cinema'],
    lifestyle: 'Intellectual & Scholarly',
    wealthLevel: 'Comfortable',
    relationshipGoal: 'Long-Term Partnership',
    compatibilityScore: 89,
    location: 'Tech Innovation Quarter',
    avatarSeed: 'AriaChen',
    appearanceDescription: 'Expressive dark eyes, effortless stylish minimalist outfits, and an infectious radiant smile.',
    matched: false,
    messages: [
      { sender: 'candidate', text: 'Hey! I saw your profile and loved that you appreciate both high science and quiet coffee spots.', month: 1, year: 2026 }
    ]
  },
  {
    id: 'date_cand_4',
    name: 'Julian Montgomery',
    age: 31,
    gender: 'Male',
    occupation: 'Boutique Architecture Firm Founder',
    education: 'Master of Architecture (Paris)',
    personality: 'Creative, Thoughtful, Patient & Refined',
    interests: ['Modernist Architecture', 'Wine Tasting', 'Trail Running', 'Photography'],
    lifestyle: 'Artistic & Creative',
    wealthLevel: 'Affluent',
    relationshipGoal: 'Casual Dating',
    compatibilityScore: 82,
    location: 'Design & Arts Waterfront',
    avatarSeed: 'JulianM',
    appearanceDescription: 'Chiseled features, relaxed Italian linen shirts, and thoughtful artistic gaze.',
    matched: false,
    messages: [
      { sender: 'candidate', text: 'Design is not just what it looks like, it is how it feels. Great to connect with someone of your calibre.', month: 1, year: 2026 }
    ]
  }
];

export const INITIAL_SOCIAL_ACCOUNTS: Record<SocialPlatformType, SocialMediaAccount> = {
  PULSE: {
    platform: 'PULSE',
    handle: '@player_pulse',
    name: 'Public Stream',
    followers: 1250,
    following: 340,
    engagementRate: 4.8,
    sentimentScore: 82,
    verified: false,
    monetized: false,
    monthlyAdRevenue: 0,
    contentNiche: 'Thought Leadership & Tech'
  },
  VISTA: {
    platform: 'VISTA',
    handle: '@player_vista',
    name: 'Visual Aesthetics',
    followers: 3200,
    following: 480,
    engagementRate: 6.2,
    sentimentScore: 88,
    verified: false,
    monetized: false,
    monthlyAdRevenue: 0,
    contentNiche: 'Lifestyle & Design'
  },
  LINKUP: {
    platform: 'LINKUP',
    handle: '@player_pro',
    name: 'Executive Network',
    followers: 850,
    following: 210,
    engagementRate: 8.5,
    sentimentScore: 94,
    verified: true,
    monetized: false,
    monthlyAdRevenue: 0,
    contentNiche: 'Enterprise & Finance'
  },
  STREAM: {
    platform: 'STREAM',
    handle: '@player_live',
    name: 'Broadcast Channel',
    followers: 420,
    following: 60,
    engagementRate: 3.5,
    sentimentScore: 78,
    verified: false,
    monetized: false,
    monthlyAdRevenue: 0,
    contentNiche: 'Podcasts & Analysis'
  },
  CIRCLE: {
    platform: 'CIRCLE',
    handle: '@player_inner',
    name: 'Private Inner Circle',
    followers: 85,
    following: 45,
    engagementRate: 22.0,
    sentimentScore: 98,
    verified: false,
    monetized: false,
    monthlyAdRevenue: 0,
    contentNiche: 'Close Friends & VIPs'
  }
};
