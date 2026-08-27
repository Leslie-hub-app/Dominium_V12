import { 
  OccupationDef, 
  BankInstitution, 
  MarketAsset, 
  ProfessionalLicense, 
  NationalStrategicAsset, 
  LandDevelopmentType,
  RenovationType
} from '../types';

export const EXPANSION2_LICENSES: ProfessionalLicense[] = [
  {
    id: 'lic_bar',
    name: 'State Bar Legal License (Esq.)',
    field: 'LAW_AND_JUSTICE',
    examDifficulty: 75,
    requiredEducation: 'Bachelor',
    maintenanceFeeAnnual: 1200
  },
  {
    id: 'lic_cpa',
    name: 'Certified Public Accountant (CPA)',
    field: 'FINANCE_AND_BANKING',
    examDifficulty: 70,
    requiredEducation: 'Bachelor',
    maintenanceFeeAnnual: 800
  },
  {
    id: 'lic_cfa',
    name: 'Chartered Financial Analyst (CFA)',
    field: 'FINANCE_AND_BANKING',
    examDifficulty: 85,
    requiredEducation: 'Bachelor',
    maintenanceFeeAnnual: 1500
  },
  {
    id: 'lic_medical',
    name: 'State Medical Practice License (MD)',
    field: 'MEDICINE_AND_HEALTHCARE',
    examDifficulty: 88,
    requiredEducation: 'Master',
    maintenanceFeeAnnual: 2500
  },
  {
    id: 'lic_pe',
    name: 'Professional Engineer (PE)',
    field: 'ENGINEERING_AND_CONSTRUCTION',
    examDifficulty: 68,
    requiredEducation: 'Bachelor',
    maintenanceFeeAnnual: 900
  },
  {
    id: 'lic_re_broker',
    name: 'Licensed Real Estate Principal Broker',
    field: 'BUSINESS_AND_MANAGEMENT',
    examDifficulty: 50,
    requiredEducation: 'Secondary',
    maintenanceFeeAnnual: 600
  },
  {
    id: 'lic_pilot',
    name: 'Commercial Aviation & Transport License',
    field: 'SECURITY_AND_DEFENSE',
    examDifficulty: 72,
    requiredEducation: 'Bachelor',
    maintenanceFeeAnnual: 2000
  }
];

export const EXPANSION2_OCCUPATIONS: OccupationDef[] = [
  // 1. BUSINESS & MANAGEMENT
  {
    id: 'occ_corp_consultant',
    title: 'Management Strategy Consultant',
    field: 'BUSINESS_AND_MANAGEMENT',
    description: 'Advises Fortune 500 executives on digital transformation, operational efficiency, and organizational restructuring.',
    entryRequirements: { minIntelligence: 65, minReputation: 30, requiredEducation: 'Bachelor', minExperienceMonths: 12 },
    salaryMonthlyBase: 9500,
    promotionCriteria: 'High billable hours, client retention, and analytical prestige.',
    responsibilityProfile: { stressRating: 55, weeklyHours: 50, riskOfScandal: 15, burnoutFactor: 45 },
    primaryAction: 'ADVISE',
    transferableSkills: ['Corporate Strategy', 'Financial Modeling', 'Executive Presence']
  },
  {
    id: 'occ_operations_vp',
    title: 'VP of Global Operations',
    field: 'BUSINESS_AND_MANAGEMENT',
    description: 'Orchestrates enterprise supply chains, manufacturing facilities, and workforce productivity across continents.',
    entryRequirements: { minIntelligence: 78, minReputation: 60, requiredEducation: 'Master', minExperienceMonths: 72 },
    salaryMonthlyBase: 28000,
    promotionCriteria: 'EBITDA margin expansion and lean inventory throughput.',
    responsibilityProfile: { stressRating: 65, weeklyHours: 55, riskOfScandal: 20, burnoutFactor: 55 },
    primaryAction: 'MANAGE',
    transferableSkills: ['Logistics', 'Procurement', 'Labor Negotiations']
  },

  // 2. FINANCE & BANKING
  {
    id: 'occ_portfolio_manager',
    title: 'Hedge Fund Portfolio Manager',
    field: 'FINANCE_AND_BANKING',
    description: 'Allocates multi-billion institutional capital across equities, credit derivatives, and macro arbitrage.',
    entryRequirements: { minIntelligence: 82, minReputation: 50, requiredEducation: 'Master', requiredLicenseId: 'lic_cfa', minExperienceMonths: 48 },
    salaryMonthlyBase: 35000,
    promotionCriteria: 'Alpha generation exceeding benchmark indices by > 500 bps.',
    responsibilityProfile: { stressRating: 75, weeklyHours: 60, riskOfScandal: 25, burnoutFactor: 65 },
    primaryAction: 'ANALYZE',
    transferableSkills: ['Macro Trading', 'Risk Management', 'Capital Allocation']
  },
  {
    id: 'occ_inv_banker_md',
    title: 'Managing Director, M&A Advisory',
    field: 'FINANCE_AND_BANKING',
    description: 'Leads cross-border corporate takeovers, IPO underwriting syndicates, and hostile takeover defenses.',
    entryRequirements: { minIntelligence: 88, minReputation: 75, requiredEducation: 'Master', minExperienceMonths: 120 },
    salaryMonthlyBase: 75000,
    promotionCriteria: 'Landmark closed transactions exceeding $5B in total deal value.',
    responsibilityProfile: { stressRating: 80, weeklyHours: 65, riskOfScandal: 30, burnoutFactor: 70 },
    primaryAction: 'NEGOTIATE',
    transferableSkills: ['Deal Structuring', 'Hostile Bids', 'Syndicated Debt']
  },

  // 3. LAW & JUSTICE
  {
    id: 'occ_corp_litigator',
    title: 'Senior Partner, Antitrust Litigation',
    field: 'LAW_AND_JUSTICE',
    description: 'Defends multinational corporations in high-stakes regulatory antitrust investigations and patent disputes.',
    entryRequirements: { minIntelligence: 85, minReputation: 65, requiredEducation: 'Master', requiredLicenseId: 'lic_bar', minExperienceMonths: 60 },
    salaryMonthlyBase: 42000,
    promotionCriteria: 'Trial victory record, landmark settlements, and supreme court advocacy.',
    responsibilityProfile: { stressRating: 65, weeklyHours: 52, riskOfScandal: 18, burnoutFactor: 50 },
    primaryAction: 'REPRESENT',
    transferableSkills: ['Trial Advocacy', 'Regulatory Strategy', 'Contract Law']
  },
  {
    id: 'occ_federal_judge',
    title: 'Appellate Court Judge',
    field: 'LAW_AND_JUSTICE',
    description: 'Adjudicates constitutional appeals, commercial arbitration disputes, and sets binding legal precedents.',
    entryRequirements: { minIntelligence: 90, minReputation: 82, requiredEducation: 'PhD', requiredLicenseId: 'lic_bar', minExperienceMonths: 144 },
    salaryMonthlyBase: 32000,
    promotionCriteria: 'Unblemished judicial integrity, constitutional scholarship, and public stature.',
    responsibilityProfile: { stressRating: 45, weeklyHours: 40, riskOfScandal: 10, burnoutFactor: 30 },
    primaryAction: 'INVESTIGATE',
    transferableSkills: ['Judicial Reasoning', 'Constitutional Law', 'Arbitration']
  },

  // 4. MEDICINE & HEALTHCARE
  {
    id: 'occ_neurosurgeon',
    title: 'Chief of Neurosurgery',
    field: 'MEDICINE_AND_HEALTHCARE',
    description: 'Performs complex cerebrovascular operations and leads clinical surgical trials in neurological restoration.',
    entryRequirements: { minIntelligence: 92, minReputation: 70, requiredEducation: 'PhD', requiredLicenseId: 'lic_medical', minExperienceMonths: 96 },
    salaryMonthlyBase: 48000,
    promotionCriteria: 'Zero surgical malpractice rate and peer-reviewed medical breakthroughs.',
    responsibilityProfile: { stressRating: 85, weeklyHours: 60, riskOfScandal: 12, burnoutFactor: 60 },
    primaryAction: 'SERVE',
    transferableSkills: ['Microsurgery', 'Crisis Diagnostics', 'Bio-Ethics']
  },

  // 5. TECHNOLOGY
  {
    id: 'occ_ai_research_lead',
    title: 'Principal AI Scientist & Research Fellow',
    field: 'TECHNOLOGY',
    description: 'Architects frontier artificial intelligence foundation models and autonomous agent reasoning frameworks.',
    entryRequirements: { minIntelligence: 94, minReputation: 60, requiredEducation: 'PhD', minExperienceMonths: 48 },
    salaryMonthlyBase: 38000,
    promotionCriteria: 'Benchmark-setting AI architectures, patent portfolio, and conference keynotes.',
    responsibilityProfile: { stressRating: 50, weeklyHours: 45, riskOfScandal: 10, burnoutFactor: 40 },
    primaryAction: 'RESEARCH',
    transferableSkills: ['Deep Learning', 'Algorithm Optimization', 'System Architecture']
  },

  // 6. ENGINEERING & CONSTRUCTION
  {
    id: 'occ_chief_infrastructure_engineer',
    title: 'Chief Civil Infrastructure Engineer',
    field: 'ENGINEERING_AND_CONSTRUCTION',
    description: 'Supervises megastructure engineering including high-speed rail corridors, deep-water ports, and suspension spans.',
    entryRequirements: { minIntelligence: 80, minReputation: 50, requiredEducation: 'Master', requiredLicenseId: 'lic_pe', minExperienceMonths: 60 },
    salaryMonthlyBase: 21000,
    promotionCriteria: 'Flawless structural safety certifications and on-budget project delivery.',
    responsibilityProfile: { stressRating: 58, weeklyHours: 48, riskOfScandal: 15, burnoutFactor: 42 },
    primaryAction: 'BUILD',
    transferableSkills: ['Structural Engineering', 'Geotechnical Surveying', 'Capital Project Mgmt']
  },

  // 7. GOVERNMENT & PUBLIC SERVICE
  {
    id: 'occ_diplomat_ambassador',
    title: 'Senior Diplomatic Ambassador',
    field: 'GOVERNMENT_AND_PUBLIC_SERVICE',
    description: 'Represents the sovereign republic in bilateral trade accords, non-proliferation treaties, and international summits.',
    entryRequirements: { minIntelligence: 82, minReputation: 70, requiredEducation: 'Master', minExperienceMonths: 84 },
    salaryMonthlyBase: 24000,
    promotionCriteria: 'Bilateral treaty ratifications and international crisis mediation.',
    responsibilityProfile: { stressRating: 52, weeklyHours: 45, riskOfScandal: 25, burnoutFactor: 38 },
    primaryAction: 'LEAD',
    transferableSkills: ['Statecraft', 'Geopolitics', 'Multilateral Protocol']
  },

  // 8. MEDIA & ENTERTAINMENT
  {
    id: 'occ_studio_executive',
    title: 'Media Conglomerate Executive Producer',
    field: 'MEDIA_AND_ENTERTAINMENT',
    description: 'Greenlights blockbuster cinematic franchises, streaming network slates, and global distribution syndicates.',
    entryRequirements: { minIntelligence: 72, minReputation: 65, requiredEducation: 'Bachelor', minExperienceMonths: 60 },
    salaryMonthlyBase: 36000,
    promotionCriteria: 'Box office gross returns, Emmy/Oscar accolades, and cultural viral dominance.',
    responsibilityProfile: { stressRating: 62, weeklyHours: 50, riskOfScandal: 35, burnoutFactor: 50 },
    primaryAction: 'CREATE',
    transferableSkills: ['Talent Packaging', 'Intellectual Property', 'Global Distribution']
  },

  // 9. SECURITY & DEFENSE
  {
    id: 'occ_intelligence_director',
    title: 'National Security Intelligence Director',
    field: 'SECURITY_AND_DEFENSE',
    description: 'Briefs the President on classified geopolitical intelligence, cyber counter-espionage, and strategic defense readiness.',
    entryRequirements: { minIntelligence: 88, minReputation: 75, requiredEducation: 'Master', minExperienceMonths: 120 },
    salaryMonthlyBase: 29000,
    promotionCriteria: 'Prevention of national security threats and strategic reconnaissance accuracy.',
    responsibilityProfile: { stressRating: 78, weeklyHours: 58, riskOfScandal: 20, burnoutFactor: 60 },
    primaryAction: 'INVESTIGATE',
    transferableSkills: ['Strategic Analysis', 'Counter-Intelligence', 'Crisis Command']
  },

  // 10. SKILLED TRADES
  {
    id: 'occ_master_electrician_contractor',
    title: 'Master Electrical & Solar Contractor',
    field: 'SKILLED_TRADES',
    description: 'Runs high-voltage grid installations, industrial plant electrification, and utility-scale solar farms.',
    entryRequirements: { minIntelligence: 55, minReputation: 35, requiredEducation: 'Secondary', minExperienceMonths: 36 },
    salaryMonthlyBase: 11500,
    promotionCriteria: 'Commercial client contract volume and grid safety compliance.',
    responsibilityProfile: { stressRating: 40, weeklyHours: 44, riskOfScandal: 8, burnoutFactor: 35 },
    primaryAction: 'BUILD',
    transferableSkills: ['High-Voltage Engineering', 'Grid Storage', 'Contracting']
  }
];

export const EXPANSION2_BANKS: BankInstitution[] = [
  {
    id: 'bank_sterling',
    name: 'Sterling Merchant Bancorp',
    category: 'COMMERCIAL_BANK',
    reputation: 92,
    stability: 95,
    minDepositRequired: 25000,
    depositRateBonus: 0.5,
    lendingRateMargin: 2.2,
    monthlyMaintenanceFee: 45,
    perks: ['Preferential Commercial Lines', 'Dedicated Private Banker', 'Syndicated Real Estate Underwriting']
  },
  {
    id: 'bank_apex_digital',
    name: 'Apex Digital Reserve',
    category: 'DIGITAL_BANK',
    reputation: 84,
    stability: 88,
    minDepositRequired: 100,
    depositRateBonus: 1.25,
    lendingRateMargin: 3.0,
    monthlyMaintenanceFee: 0,
    perks: ['Zero Account Fees', 'High-Yield Instant Savings', 'Automated Daily Sweep Account']
  },
  {
    id: 'bank_meridian_private',
    name: 'Meridian Swiss Private Bank',
    category: 'PRIVATE_BANK',
    reputation: 98,
    stability: 99,
    minDepositRequired: 500000,
    depositRateBonus: 0.8,
    lendingRateMargin: 1.5,
    monthlyMaintenanceFee: 250,
    perks: ['Discreet Multi-Jurisdiction Vaults', 'Lombard Credit Facility', 'Pre-IPO Equity Allocations']
  },
  {
    id: 'bank_heritage_trust',
    name: 'Heritage Community Trust',
    category: 'RETAIL_BANK',
    reputation: 80,
    stability: 90,
    minDepositRequired: 500,
    depositRateBonus: 0.2,
    lendingRateMargin: 2.8,
    monthlyMaintenanceFee: 15,
    perks: ['Local Business Forgiveness Grants', 'First-Time Homebuyer Subsidized Mortgage']
  },
  {
    id: 'bank_vanguard_union',
    name: 'Vanguard Industrial Credit Union',
    category: 'CREDIT_UNION',
    reputation: 86,
    stability: 92,
    minDepositRequired: 50,
    depositRateBonus: 0.9,
    lendingRateMargin: 1.8,
    monthlyMaintenanceFee: 5,
    perks: ['Member Dividend Rebates', 'Low-Interest Secured Vehicle & Equipment Loans']
  }
];

export const EXPANSION2_MARKET_ASSETS: MarketAsset[] = [
  // STOCKS
  {
    id: 'asset_aetherion',
    symbol: 'ATHR',
    name: 'Aetherion Technologies Inc.',
    category: 'STOCK',
    sector: 'Artificial Intelligence & Semiconductor',
    currentPrice: 420.50,
    priceHistory: [210, 230, 245, 270, 290, 315, 305, 340, 375, 390, 410, 420.50],
    high52Week: 445.00,
    low52Week: 205.00,
    annualDividendYield: 0.6,
    volatilityRating: 'High',
    marketCapBillions: 2400,
    description: 'Leading global architect of sovereign AI supercomputing clusters and quantum logic processors.'
  },
  {
    id: 'asset_novamed',
    symbol: 'NVMD',
    name: 'NovaMed Global Biopharma',
    category: 'STOCK',
    sector: 'Healthcare & Biotechnology',
    currentPrice: 185.20,
    priceHistory: [160, 165, 172, 168, 175, 180, 178, 182, 184, 180, 183, 185.20],
    high52Week: 198.00,
    low52Week: 155.00,
    annualDividendYield: 2.8,
    volatilityRating: 'Low',
    marketCapBillions: 520,
    description: 'Monopoly patent holder for breakthrough oncology therapeutics and longevity cellular repair enzymes.'
  },
  {
    id: 'asset_solaris_grid',
    symbol: 'SENG',
    name: 'Solaris Sovereign Energy Group',
    category: 'STOCK',
    sector: 'Renewable Utilities & Nuclear',
    currentPrice: 94.75,
    priceHistory: [80, 82, 85, 84, 88, 90, 89, 92, 91, 93, 94, 94.75],
    high52Week: 99.00,
    low52Week: 78.00,
    annualDividendYield: 4.5,
    volatilityRating: 'Low',
    marketCapBillions: 310,
    description: 'Operates national modular nuclear fission reactors, offshore wind farms, and continent-wide grid distribution.'
  },

  // ETF & INDEX FUNDS
  {
    id: 'asset_global_top500',
    symbol: 'GL500',
    name: 'Vanguard Global Sovereign 500 Index',
    category: 'INDEX_FUND',
    sector: 'Diversified Large-Cap Equities',
    currentPrice: 512.00,
    priceHistory: [440, 450, 462, 458, 475, 485, 480, 492, 501, 498, 508, 512.00],
    high52Week: 520.00,
    low52Week: 430.00,
    annualDividendYield: 1.8,
    volatilityRating: 'Low',
    marketCapBillions: 15000,
    description: 'The foundational benchmark index reflecting aggregate corporate earnings across the worlds 500 largest firms.'
  },
  {
    id: 'asset_tech_frontier_etf',
    symbol: 'ROBO',
    name: 'Frontier Robotics & Quantum ETF',
    category: 'ETF',
    sector: 'High-Tech & Automation',
    currentPrice: 128.40,
    priceHistory: [85, 92, 98, 105, 102, 114, 110, 118, 122, 120, 126, 128.40],
    high52Week: 135.00,
    low52Week: 80.00,
    annualDividendYield: 0.4,
    volatilityRating: 'High',
    marketCapBillions: 85,
    description: 'High-beta basket of 60 pure-play automation, humanoid robotics, and synthetic intelligence startups.'
  },

  // BONDS
  {
    id: 'asset_treasury_bond_10y',
    symbol: 'SOVB-10Y',
    name: '10-Year National Sovereign Treasury Bond',
    category: 'GOVERNMENT_BOND',
    sector: 'Sovereign Debt',
    currentPrice: 100.00,
    priceHistory: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    high52Week: 102.00,
    low52Week: 98.00,
    annualDividendYield: 4.8,
    volatilityRating: 'Low',
    description: 'Full faith and credit guaranteed sovereign obligation delivering reliable semi-annual coupon distributions.'
  },
  {
    id: 'asset_corp_bond_aaa',
    symbol: 'CORP-AAA',
    name: 'Investment Grade Corporate Bond Trust',
    category: 'CORPORATE_BOND',
    sector: 'Senior Secured Corporate Credit',
    currentPrice: 102.50,
    priceHistory: [101, 101.5, 102, 101.8, 102.2, 102.4, 102.3, 102.6, 102.5, 102.4, 102.6, 102.50],
    high52Week: 104.00,
    low52Week: 99.00,
    annualDividendYield: 6.2,
    volatilityRating: 'Low',
    description: 'Secured senior bonds issued by blue-chip conglomerates with overcollateralized real asset guarantees.'
  },

  // COMMODITIES
  {
    id: 'asset_gold_bullion',
    symbol: 'XAU',
    name: 'Physical Gold Bullion Allocated Trust',
    category: 'COMMODITY',
    sector: 'Precious Metals & Reserve Store of Value',
    currentPrice: 2680.00,
    priceHistory: [2150, 2220, 2300, 2380, 2340, 2450, 2480, 2520, 2580, 2610, 2650, 2680.00],
    high52Week: 2750.00,
    low52Week: 2100.00,
    annualDividendYield: 0.0,
    volatilityRating: 'Moderate',
    description: 'Institutional vaulted gold bars providing historical hedge against monetary debasement and geopolitical crises.'
  },
  {
    id: 'asset_crude_oil',
    symbol: 'BRENT',
    name: 'Crude Petroleum Strategic Reserve Trust',
    category: 'COMMODITY',
    sector: 'Energy Commodities',
    currentPrice: 78.50,
    priceHistory: [82, 85, 88, 84, 79, 75, 78, 82, 80, 76, 77, 78.50],
    high52Week: 95.00,
    low52Week: 68.00,
    annualDividendYield: 0.0,
    volatilityRating: 'High',
    description: 'Direct commodity benchmark for heavy industrial fuel, transport logistics, and petrochemical refining.'
  },

  // CRYPTO & DIGITAL ASSETS
  {
    id: 'asset_bitcoin_digital_gold',
    symbol: 'BTC',
    name: 'Bitcoin Sovereign Reserve Network',
    category: 'CRYPTO_ASSET',
    sector: 'Decentralized Monetary Protocol',
    currentPrice: 88500.00,
    priceHistory: [42000, 51000, 62000, 68000, 61000, 58000, 64000, 72000, 79000, 74000, 82000, 88500.00],
    high52Week: 99000.00,
    low52Week: 38000.00,
    annualDividendYield: 0.0,
    volatilityRating: 'Speculative',
    marketCapBillions: 1750,
    description: 'Hard-capped digital bearer asset recognized as an alternative institutional reserve treasury hedge.'
  }
];

export const EXPANSION2_NATIONAL_STRATEGIC_ASSETS: NationalStrategicAsset[] = [
  {
    id: 'strat_lithium_basin',
    name: 'Sovereign Lithium & Rare Earth Basin',
    type: 'MINERAL_MINE',
    ownership: 'STATE_OWNED',
    monthlyRevenueGross: 45000000,
    monthlyOperatingCost: 18000000,
    strategicImportanceScore: 95,
    modernizationLevel: 75
  },
  {
    id: 'strat_offshore_crude',
    name: 'Pelican Deepwater Offshore Oil Platform',
    type: 'OIL_AND_GAS_FIELD',
    ownership: 'PUBLIC_PRIVATE_PARTNERSHIP',
    monthlyRevenueGross: 85000000,
    monthlyOperatingCost: 32000000,
    strategicImportanceScore: 90,
    modernizationLevel: 82
  },
  {
    id: 'strat_national_grid',
    name: 'National High-Voltage HVDC Energy Grid',
    type: 'ENERGY_GRID',
    ownership: 'STATE_OWNED',
    monthlyRevenueGross: 60000000,
    monthlyOperatingCost: 28000000,
    strategicImportanceScore: 98,
    modernizationLevel: 80
  },
  {
    id: 'strat_sovereign_pharma',
    name: 'State Biodefense & Vaccine Production Complex',
    type: 'STATE_PHARMACEUTICAL',
    ownership: 'STATE_OWNED',
    monthlyRevenueGross: 25000000,
    monthlyOperatingCost: 12000000,
    strategicImportanceScore: 88,
    modernizationLevel: 90
  },
  {
    id: 'strat_deepwater_port',
    name: 'Port Imperial Container Logistics Terminal',
    type: 'NATIONAL_PORT_AND_RAIL',
    ownership: 'PUBLIC_PRIVATE_PARTNERSHIP',
    monthlyRevenueGross: 55000000,
    monthlyOperatingCost: 22000000,
    strategicImportanceScore: 92,
    modernizationLevel: 85
  }
];
