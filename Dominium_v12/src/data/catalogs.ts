import { RealEstateProperty, MajorProject, SportsTeam, PoliticalParty } from '../types';

export interface CareerDef {
  field: string;
  icon: string;
  levels: {
    level: 'Intern' | 'Junior' | 'Professional' | 'Senior' | 'Specialist' | 'Manager' | 'Director' | 'Executive' | 'Industry Leader';
    title: string;
    salaryMonthly: number;
    intelligenceReq: number;
    reputationReq: number;
    experienceMonthsReq: number;
    educationReq: string;
    stress: number;
    hours: number;
  }[];
}

export const CAREER_CATALOG: CareerDef[] = [
  {
    field: 'Technology',
    icon: 'Cpu',
    levels: [
      { level: 'Intern', title: 'Tech Support Intern', salaryMonthly: 2400, intelligenceReq: 35, reputationReq: 10, experienceMonthsReq: 0, educationReq: 'Secondary', stress: 15, hours: 35 },
      { level: 'Junior', title: 'Junior Software Engineer', salaryMonthly: 5500, intelligenceReq: 55, reputationReq: 20, experienceMonthsReq: 12, educationReq: 'Bachelor', stress: 28, hours: 40 },
      { level: 'Professional', title: 'Full Stack Engineer', salaryMonthly: 9200, intelligenceReq: 68, reputationReq: 35, experienceMonthsReq: 36, educationReq: 'Bachelor', stress: 36, hours: 42 },
      { level: 'Senior', title: 'Senior AI Systems Architect', salaryMonthly: 16500, intelligenceReq: 80, reputationReq: 50, experienceMonthsReq: 72, educationReq: 'Bachelor', stress: 45, hours: 45 },
      { level: 'Manager', title: 'Engineering Manager', salaryMonthly: 22000, intelligenceReq: 82, reputationReq: 60, experienceMonthsReq: 96, educationReq: 'Bachelor', stress: 55, hours: 48 },
      { level: 'Director', title: 'VP of Engineering', salaryMonthly: 38000, intelligenceReq: 88, reputationReq: 72, experienceMonthsReq: 140, educationReq: 'Master', stress: 65, hours: 50 },
      { level: 'Executive', title: 'Chief Technology Officer (CTO)', salaryMonthly: 65000, intelligenceReq: 92, reputationReq: 82, experienceMonthsReq: 180, educationReq: 'Master', stress: 75, hours: 55 },
      { level: 'Industry Leader', title: 'Tech Visionary & Fellow', salaryMonthly: 120000, intelligenceReq: 96, reputationReq: 90, experienceMonthsReq: 240, educationReq: 'PhD', stress: 60, hours: 45 },
    ]
  },
  {
    field: 'Finance & Banking',
    icon: 'TrendingUp',
    levels: [
      { level: 'Intern', title: 'Credit & Operations Intern', salaryMonthly: 2600, intelligenceReq: 40, reputationReq: 15, experienceMonthsReq: 0, educationReq: 'Secondary', stress: 20, hours: 40 },
      { level: 'Junior', title: 'Junior Financial Analyst', salaryMonthly: 6200, intelligenceReq: 60, reputationReq: 25, experienceMonthsReq: 12, educationReq: 'Bachelor', stress: 38, hours: 50 },
      { level: 'Professional', title: 'Investment Banker', salaryMonthly: 12500, intelligenceReq: 75, reputationReq: 40, experienceMonthsReq: 36, educationReq: 'Bachelor', stress: 60, hours: 60 },
      { level: 'Senior', title: 'Portfolio Fund Manager', salaryMonthly: 24000, intelligenceReq: 84, reputationReq: 58, experienceMonthsReq: 72, educationReq: 'Master', stress: 62, hours: 55 },
      { level: 'Manager', title: 'Head of Private Equity', salaryMonthly: 45000, intelligenceReq: 88, reputationReq: 70, experienceMonthsReq: 120, educationReq: 'Master', stress: 70, hours: 55 },
      { level: 'Director', title: 'Managing Director / Partner', salaryMonthly: 85000, intelligenceReq: 92, reputationReq: 80, experienceMonthsReq: 160, educationReq: 'Master', stress: 74, hours: 55 },
      { level: 'Executive', title: 'Chief Financial Officer (CFO)', salaryMonthly: 110000, intelligenceReq: 94, reputationReq: 85, experienceMonthsReq: 200, educationReq: 'Master', stress: 80, hours: 58 },
      { level: 'Industry Leader', title: 'Sovereign Wealth Governor', salaryMonthly: 190000, intelligenceReq: 96, reputationReq: 92, experienceMonthsReq: 260, educationReq: 'Master', stress: 68, hours: 50 },
    ]
  },
  {
    field: 'Law & Justice',
    icon: 'Scale',
    levels: [
      { level: 'Intern', title: 'Legal Research Intern', salaryMonthly: 2200, intelligenceReq: 45, reputationReq: 15, experienceMonthsReq: 0, educationReq: 'Bachelor', stress: 22, hours: 40 },
      { level: 'Junior', title: 'Junior Associate Attorney', salaryMonthly: 7000, intelligenceReq: 65, reputationReq: 30, experienceMonthsReq: 12, educationReq: 'Bachelor', stress: 45, hours: 50 },
      { level: 'Professional', title: 'Corporate Litigation Lawyer', salaryMonthly: 14000, intelligenceReq: 78, reputationReq: 48, experienceMonthsReq: 48, educationReq: 'Bachelor', stress: 55, hours: 52 },
      { level: 'Senior', title: 'Senior Partner / Prosecutor', salaryMonthly: 28000, intelligenceReq: 85, reputationReq: 65, experienceMonthsReq: 96, educationReq: 'Master', stress: 62, hours: 50 },
      { level: 'Specialist', title: 'Circuit Court Judge', salaryMonthly: 34000, intelligenceReq: 90, reputationReq: 78, experienceMonthsReq: 144, educationReq: 'Master', stress: 50, hours: 45 },
      { level: 'Executive', title: 'General Counsel / Chief Jurist', salaryMonthly: 60000, intelligenceReq: 92, reputationReq: 85, experienceMonthsReq: 190, educationReq: 'Master', stress: 68, hours: 50 },
      { level: 'Industry Leader', title: 'Chief Justice / Supreme Arbiter', salaryMonthly: 95000, intelligenceReq: 96, reputationReq: 94, experienceMonthsReq: 260, educationReq: 'PhD', stress: 65, hours: 45 },
    ]
  },
  {
    field: 'Medicine & Healthcare',
    icon: 'HeartPulse',
    levels: [
      { level: 'Intern', title: 'Medical Resident Intern', salaryMonthly: 3000, intelligenceReq: 60, reputationReq: 20, experienceMonthsReq: 0, educationReq: 'Bachelor', stress: 50, hours: 65 },
      { level: 'Junior', title: 'General Medical Practitioner', salaryMonthly: 9000, intelligenceReq: 72, reputationReq: 40, experienceMonthsReq: 36, educationReq: 'Master', stress: 45, hours: 45 },
      { level: 'Professional', title: 'Specialist Cardiothoracic Surgeon', salaryMonthly: 22000, intelligenceReq: 86, reputationReq: 60, experienceMonthsReq: 80, educationReq: 'PhD', stress: 65, hours: 52 },
      { level: 'Director', title: 'Head of Clinical Surgery', salaryMonthly: 40000, intelligenceReq: 90, reputationReq: 75, experienceMonthsReq: 130, educationReq: 'PhD', stress: 60, hours: 48 },
      { level: 'Executive', title: 'Chief Medical Officer (CMO)', salaryMonthly: 72000, intelligenceReq: 93, reputationReq: 85, experienceMonthsReq: 180, educationReq: 'PhD', stress: 66, hours: 50 },
      { level: 'Industry Leader', title: 'Global Health Laureate', salaryMonthly: 130000, intelligenceReq: 97, reputationReq: 92, experienceMonthsReq: 240, educationReq: 'PhD', stress: 50, hours: 40 },
    ]
  },
  {
    field: 'Business & Management',
    icon: 'Briefcase',
    levels: [
      { level: 'Junior', title: 'Operations Coordinator', salaryMonthly: 3800, intelligenceReq: 45, reputationReq: 15, experienceMonthsReq: 0, educationReq: 'Secondary', stress: 20, hours: 40 },
      { level: 'Professional', title: 'Project & Strategy Manager', salaryMonthly: 7800, intelligenceReq: 60, reputationReq: 35, experienceMonthsReq: 24, educationReq: 'Bachelor', stress: 38, hours: 42 },
      { level: 'Senior', title: 'Senior Operations Director', salaryMonthly: 18000, intelligenceReq: 75, reputationReq: 55, experienceMonthsReq: 60, educationReq: 'Bachelor', stress: 52, hours: 45 },
      { level: 'Executive', title: 'Chief Operating Officer (COO)', salaryMonthly: 48000, intelligenceReq: 85, reputationReq: 75, experienceMonthsReq: 120, educationReq: 'Master', stress: 68, hours: 52 },
      { level: 'Executive', title: 'Chief Executive Officer (CEO)', salaryMonthly: 90000, intelligenceReq: 90, reputationReq: 85, experienceMonthsReq: 160, educationReq: 'Master', stress: 80, hours: 60 },
      { level: 'Industry Leader', title: 'Conglomerate Chairman', salaryMonthly: 180000, intelligenceReq: 94, reputationReq: 92, experienceMonthsReq: 220, educationReq: 'Master', stress: 65, hours: 48 },
    ]
  },
  {
    field: 'Arts & Media',
    icon: 'Palette',
    levels: [
      { level: 'Intern', title: 'Creative Production Assistant', salaryMonthly: 1800, intelligenceReq: 30, reputationReq: 10, experienceMonthsReq: 0, educationReq: 'Secondary', stress: 15, hours: 35 },
      { level: 'Junior', title: 'Digital Content Creator & Artist', salaryMonthly: 4200, intelligenceReq: 45, reputationReq: 30, experienceMonthsReq: 12, educationReq: 'Secondary', stress: 25, hours: 38 },
      { level: 'Professional', title: 'Creative Director / Author', salaryMonthly: 10500, intelligenceReq: 65, reputationReq: 55, experienceMonthsReq: 48, educationReq: 'Bachelor', stress: 40, hours: 42 },
      { level: 'Senior', title: 'Award-Winning Film Director / Musician', salaryMonthly: 28000, intelligenceReq: 78, reputationReq: 75, experienceMonthsReq: 90, educationReq: 'Bachelor', stress: 48, hours: 45 },
      { level: 'Industry Leader', title: 'Global Cultural Icon & Producer', salaryMonthly: 95000, intelligenceReq: 85, reputationReq: 94, experienceMonthsReq: 160, educationReq: 'Bachelor', stress: 50, hours: 40 },
    ]
  }
];

export const EDUCATION_OFFERINGS = [
  {
    id: 'edu_highschool',
    name: 'Secondary Diploma (High School)',
    type: 'Secondary' as const,
    field: 'General Studies',
    durationMonths: 24,
    monthlyCost: 0,
    minAge: 14,
    intelGainTotal: 8,
    reputationGainTotal: 5,
  },
  {
    id: 'edu_bs_cs',
    name: 'B.Sc. in Computer Science & AI',
    type: 'Bachelor' as const,
    field: 'Technology',
    durationMonths: 48,
    monthlyCost: 950,
    minAge: 18,
    intelGainTotal: 18,
    reputationGainTotal: 12,
  },
  {
    id: 'edu_bs_fin',
    name: 'B.Sc. in Finance & Quantitative Economics',
    type: 'Bachelor' as const,
    field: 'Finance & Banking',
    durationMonths: 48,
    monthlyCost: 1100,
    minAge: 18,
    intelGainTotal: 16,
    reputationGainTotal: 14,
  },
  {
    id: 'edu_llb_law',
    name: 'Bachelor of Laws (LL.B.)',
    type: 'Bachelor' as const,
    field: 'Law & Justice',
    durationMonths: 48,
    monthlyCost: 1200,
    minAge: 18,
    intelGainTotal: 17,
    reputationGainTotal: 15,
  },
  {
    id: 'edu_mbbs_med',
    name: 'Doctor of Medicine (M.D. / MBBS)',
    type: 'Master' as const,
    field: 'Medicine & Healthcare',
    durationMonths: 72,
    monthlyCost: 1800,
    minAge: 20,
    intelGainTotal: 28,
    reputationGainTotal: 25,
  },
  {
    id: 'edu_mba',
    name: 'Executive MBA in Corporate Strategy',
    type: 'Master' as const,
    field: 'Business & Management',
    durationMonths: 24,
    monthlyCost: 2200,
    minAge: 23,
    intelGainTotal: 14,
    reputationGainTotal: 20,
  },
  {
    id: 'edu_phd',
    name: 'Doctor of Philosophy (Ph.D. Research)',
    type: 'PhD' as const,
    field: 'Science & Advanced Research',
    durationMonths: 36,
    monthlyCost: 800,
    minAge: 24,
    intelGainTotal: 25,
    reputationGainTotal: 26,
  }
];

export const AVAILABLE_PROPERTIES_CATALOG: Omit<RealEstateProperty, 'id'>[] = [
  {
    name: 'Downtown Studio Loft',
    type: 'Apartment',
    city: 'New York',
    country: 'United States',
    purchasePrice: 280000,
    currentValue: 280000,
    monthlyRent: 1950,
    monthlyMaintenance: 350,
    isRented: false,
    tenantQuality: 80,
    condition: 92,
  },
  {
    name: 'Suburban Executive Family Residence',
    type: 'Luxury Villa',
    city: 'Austin',
    country: 'United States',
    purchasePrice: 650000,
    currentValue: 650000,
    monthlyRent: 4200,
    monthlyMaintenance: 600,
    isRented: false,
    tenantQuality: 88,
    condition: 95,
  },
  {
    name: 'Mayfair Victorian Penthouse',
    type: 'Apartment',
    city: 'London',
    country: 'United Kingdom',
    purchasePrice: 1850000,
    currentValue: 1850000,
    monthlyRent: 11000,
    monthlyMaintenance: 1400,
    isRented: false,
    tenantQuality: 92,
    condition: 98,
  },
  {
    name: 'Marina Bay Waterfront Condo',
    type: 'Luxury Villa',
    city: 'Singapore City',
    country: 'Singapore',
    purchasePrice: 3200000,
    currentValue: 3200000,
    monthlyRent: 18000,
    monthlyMaintenance: 2100,
    isRented: false,
    tenantQuality: 96,
    condition: 99,
  },
  {
    name: 'Tech Corridor Class-A Commercial Center',
    type: 'Office Tower',
    city: 'San Francisco',
    country: 'United States',
    purchasePrice: 12500000,
    currentValue: 12500000,
    monthlyRent: 95000,
    monthlyMaintenance: 12000,
    isRented: false,
    tenantQuality: 94,
    condition: 96,
  },
  {
    name: 'Camps Bay Oceanside Villa',
    type: 'Luxury Villa',
    city: 'Cape Town',
    country: 'South Africa',
    purchasePrice: 920000,
    currentValue: 920000,
    monthlyRent: 7800,
    monthlyMaintenance: 850,
    isRented: false,
    tenantQuality: 86,
    condition: 94,
  }
];

export const INITIAL_PARTIES: PoliticalParty[] = [
  {
    id: 'party_prog',
    name: 'Progressive Democratic Alliance',
    ideology: 'Progressive Reform',
    pollingPercentage: 34,
    partyFunds: 12500000,
    partyLeader: 'Senator Elena Rostova',
    playerReputationInParty: 15
  },
  {
    id: 'party_cons',
    name: 'National Enterprise & Liberty Party',
    ideology: 'Conservative Enterprise',
    pollingPercentage: 38,
    partyFunds: 18000000,
    partyLeader: 'Governor Marcus Sterling',
    playerReputationInParty: 15
  },
  {
    id: 'party_tech',
    name: 'Future Forward & Technocracy Party',
    ideology: 'Technocrat Forward',
    pollingPercentage: 18,
    partyFunds: 9500000,
    partyLeader: 'Dr. Arthur Vance',
    playerReputationInParty: 20
  },
  {
    id: 'party_green',
    name: 'Global Ecological Coalition',
    ideology: 'Green Ecology',
    pollingPercentage: 10,
    partyFunds: 4200000,
    partyLeader: 'Maya Lin',
    playerReputationInParty: 10
  }
];

export const SPORTS_TEAMS_AVAILABLE: Omit<SportsTeam, 'id'>[] = [
  {
    name: 'New York Titans FC',
    sport: 'Football / Soccer',
    city: 'New York',
    valuation: 45000000,
    playerOwnershipPercentage: 0,
    fanBaseThousands: 850,
    stadiumCapacity: 45000,
    ticketPrice: 65,
    monthlySponsorship: 320000,
    monthlyPlayerWages: 280000,
    monthlyNetIncome: 145000,
    teamPerformanceScore: 78,
    leaguePosition: 4,
    totalTeamsInLeague: 20,
    matchesWon: 14,
    matchesDrawn: 6,
    matchesLost: 8,
    headCoachName: 'Carlo DiMarco',
    starPlayerName: 'Gabriel Santos'
  },
  {
    name: 'London Monarchs Basketball',
    sport: 'Basketball',
    city: 'London',
    valuation: 28000000,
    playerOwnershipPercentage: 0,
    fanBaseThousands: 420,
    stadiumCapacity: 18500,
    ticketPrice: 55,
    monthlySponsorship: 180000,
    monthlyPlayerWages: 160000,
    monthlyNetIncome: 75000,
    teamPerformanceScore: 82,
    leaguePosition: 2,
    totalTeamsInLeague: 16,
    matchesWon: 24,
    matchesDrawn: 0,
    matchesLost: 8,
    headCoachName: 'Derrick Hayes',
    starPlayerName: 'Kobe Walker'
  },
  {
    name: 'Apex Grand Prix Formula Team',
    sport: 'Motorsport Racing',
    city: 'Munich',
    valuation: 110000000,
    playerOwnershipPercentage: 0,
    fanBaseThousands: 2400,
    stadiumCapacity: 95000,
    ticketPrice: 220,
    monthlySponsorship: 850000,
    monthlyPlayerWages: 650000,
    monthlyNetIncome: 380000,
    teamPerformanceScore: 88,
    leaguePosition: 3,
    totalTeamsInLeague: 10,
    matchesWon: 5,
    matchesDrawn: 0,
    matchesLost: 4,
    headCoachName: 'Guenther Klaus',
    starPlayerName: 'Maximilien Dupond'
  }
];

export const MAJOR_PROJECTS_TEMPLATES: Omit<MajorProject, 'id'>[] = [
  {
    name: 'Novapolis Innovation Campus',
    type: 'Company HQ',
    totalBudgetRequired: 45000000,
    capitalInvested: 0,
    durationMonths: 24,
    monthsProgress: 0,
    completed: false,
    status: 'In Planning',
    expectedMonthlyIncomeBoost: 120000,
    expectedReputationBoost: 15,
    expectedInfluenceBoost: 12,
    riskFactor: 'Medium'
  },
  {
    name: 'Skyline Grand 80-Story Skyscraper',
    type: 'Skyscraper Construction',
    totalBudgetRequired: 180000000,
    capitalInvested: 0,
    durationMonths: 36,
    monthsProgress: 0,
    completed: false,
    status: 'In Planning',
    expectedMonthlyIncomeBoost: 850000,
    expectedReputationBoost: 22,
    expectedInfluenceBoost: 20,
    riskFactor: 'High'
  },
  {
    name: 'Aetherion Luxury Mega-Mall & Resort',
    type: 'Luxury Shopping Mall',
    totalBudgetRequired: 95000000,
    capitalInvested: 0,
    durationMonths: 30,
    monthsProgress: 0,
    completed: false,
    status: 'In Planning',
    expectedMonthlyIncomeBoost: 420000,
    expectedReputationBoost: 18,
    expectedInfluenceBoost: 15,
    riskFactor: 'Medium'
  },
  {
    name: 'Commercial Fusion & Clean Energy Institute',
    type: 'Tech R&D Lab',
    totalBudgetRequired: 60000000,
    capitalInvested: 0,
    durationMonths: 28,
    monthsProgress: 0,
    completed: false,
    status: 'In Planning',
    expectedMonthlyIncomeBoost: 250000,
    expectedReputationBoost: 25,
    expectedInfluenceBoost: 28,
    riskFactor: 'High'
  }
];
