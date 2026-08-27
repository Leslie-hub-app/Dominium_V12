import { CountryState, StockAsset, Achievement, ChallengeScenario } from '../types';

export const COUNTRIES_DATA: CountryState[] = [
  {
    id: 'country_us',
    name: 'United States',
    flag: '🇺🇸',
    currencySymbol: '$',
    currencyName: 'USD',
    gdpBillions: 28780,
    gdpGrowthRate: 2.3,
    inflationRate: 2.9,
    centralBankInterestRate: 4.75,
    unemploymentRate: 4.1,
    corporateTaxRate: 21.0,
    incomeTaxRate: 28.0,
    businessCycle: 'Expansion',
    politicalStability: 82,
    infrastructureScore: 88,
    healthSystemScore: 84,
    educationScore: 92,
    nationalDebtBillions: 34500,
    publicApprovalOfGov: 48,
    cities: [
      {
        id: 'city_nyc',
        name: 'New York',
        countryName: 'United States',
        population: 8336000,
        averageIncomeMonthly: 7200,
        propertyPriceIndex: 94,
        crimeRate: 38,
        tourismIndex: 96,
        businessOpportunityScore: 98,
      },
      {
        id: 'city_sf',
        name: 'San Francisco',
        countryName: 'United States',
        population: 808000,
        averageIncomeMonthly: 9400,
        propertyPriceIndex: 98,
        crimeRate: 45,
        tourismIndex: 85,
        businessOpportunityScore: 96,
      },
      {
        id: 'city_austin',
        name: 'Austin',
        countryName: 'United States',
        population: 975000,
        averageIncomeMonthly: 6400,
        propertyPriceIndex: 72,
        crimeRate: 28,
        tourismIndex: 78,
        businessOpportunityScore: 89,
      }
    ]
  },
  {
    id: 'country_uk',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currencySymbol: '£',
    currencyName: 'GBP',
    gdpBillions: 3340,
    gdpGrowthRate: 1.4,
    inflationRate: 2.6,
    centralBankInterestRate: 4.5,
    unemploymentRate: 4.3,
    corporateTaxRate: 25.0,
    incomeTaxRate: 32.0,
    businessCycle: 'Recovery',
    politicalStability: 85,
    infrastructureScore: 86,
    healthSystemScore: 88,
    educationScore: 94,
    nationalDebtBillions: 2900,
    publicApprovalOfGov: 44,
    cities: [
      {
        id: 'city_london',
        name: 'London',
        countryName: 'United Kingdom',
        population: 8982000,
        averageIncomeMonthly: 5800,
        propertyPriceIndex: 92,
        crimeRate: 34,
        tourismIndex: 98,
        businessOpportunityScore: 95,
      },
      {
        id: 'city_manchester',
        name: 'Manchester',
        countryName: 'United Kingdom',
        population: 553000,
        averageIncomeMonthly: 3900,
        propertyPriceIndex: 65,
        crimeRate: 42,
        tourismIndex: 75,
        businessOpportunityScore: 82,
      }
    ]
  },
  {
    id: 'country_za',
    name: 'South Africa',
    flag: '🇿🇦',
    currencySymbol: 'R',
    currencyName: 'ZAR',
    gdpBillions: 405,
    gdpGrowthRate: 1.8,
    inflationRate: 4.6,
    centralBankInterestRate: 7.75,
    unemploymentRate: 32.1,
    corporateTaxRate: 27.0,
    incomeTaxRate: 31.0,
    businessCycle: 'Expansion',
    politicalStability: 70,
    infrastructureScore: 68,
    healthSystemScore: 65,
    educationScore: 72,
    nationalDebtBillions: 280,
    publicApprovalOfGov: 52,
    cities: [
      {
        id: 'city_johannesburg',
        name: 'Johannesburg',
        countryName: 'South Africa',
        population: 5635000,
        averageIncomeMonthly: 28000,
        propertyPriceIndex: 58,
        crimeRate: 62,
        tourismIndex: 72,
        businessOpportunityScore: 86,
      },
      {
        id: 'city_capetown',
        name: 'Cape Town',
        countryName: 'South Africa',
        population: 4618000,
        averageIncomeMonthly: 31000,
        propertyPriceIndex: 76,
        crimeRate: 54,
        tourismIndex: 95,
        businessOpportunityScore: 88,
      }
    ]
  },
  {
    id: 'country_sg',
    name: 'Singapore',
    flag: '🇸🇬',
    currencySymbol: 'S$',
    currencyName: 'SGD',
    gdpBillions: 501,
    gdpGrowthRate: 3.1,
    inflationRate: 2.1,
    centralBankInterestRate: 3.4,
    unemploymentRate: 2.0,
    corporateTaxRate: 17.0,
    incomeTaxRate: 15.0,
    businessCycle: 'Boom',
    politicalStability: 96,
    infrastructureScore: 98,
    healthSystemScore: 96,
    educationScore: 96,
    nationalDebtBillions: 480,
    publicApprovalOfGov: 78,
    cities: [
      {
        id: 'city_singapore',
        name: 'Singapore City',
        countryName: 'Singapore',
        population: 5918000,
        averageIncomeMonthly: 8100,
        propertyPriceIndex: 96,
        crimeRate: 8,
        tourismIndex: 92,
        businessOpportunityScore: 99,
      }
    ]
  },
  {
    id: 'country_de',
    name: 'Germany',
    flag: '🇩🇪',
    currencySymbol: '€',
    currencyName: 'EUR',
    gdpBillions: 4450,
    gdpGrowthRate: 1.1,
    inflationRate: 2.3,
    centralBankInterestRate: 3.75,
    unemploymentRate: 3.8,
    corporateTaxRate: 29.8,
    incomeTaxRate: 35.0,
    businessCycle: 'Slowdown',
    politicalStability: 89,
    infrastructureScore: 92,
    healthSystemScore: 93,
    educationScore: 91,
    nationalDebtBillions: 2600,
    publicApprovalOfGov: 50,
    cities: [
      {
        id: 'city_berlin',
        name: 'Berlin',
        countryName: 'Germany',
        population: 3677000,
        averageIncomeMonthly: 4600,
        propertyPriceIndex: 78,
        crimeRate: 29,
        tourismIndex: 89,
        businessOpportunityScore: 91,
      },
      {
        id: 'city_munich',
        name: 'Munich',
        countryName: 'Germany',
        population: 1488000,
        averageIncomeMonthly: 5900,
        propertyPriceIndex: 88,
        crimeRate: 18,
        tourismIndex: 86,
        businessOpportunityScore: 94,
      }
    ]
  },
  {
    id: 'country_jp',
    name: 'Japan',
    flag: '🇯🇵',
    currencySymbol: '¥',
    currencyName: 'JPY',
    gdpBillions: 4210,
    gdpGrowthRate: 1.3,
    inflationRate: 2.2,
    centralBankInterestRate: 0.5,
    unemploymentRate: 2.5,
    corporateTaxRate: 23.2,
    incomeTaxRate: 30.0,
    businessCycle: 'Expansion',
    politicalStability: 92,
    infrastructureScore: 97,
    healthSystemScore: 95,
    educationScore: 93,
    nationalDebtBillions: 11200,
    publicApprovalOfGov: 46,
    cities: [
      {
        id: 'city_tokyo',
        name: 'Tokyo',
        countryName: 'Japan',
        population: 13960000,
        averageIncomeMonthly: 490000,
        propertyPriceIndex: 89,
        crimeRate: 12,
        tourismIndex: 94,
        businessOpportunityScore: 97,
      }
    ]
  }
];

export const INITIAL_STOCKS: StockAsset[] = [
  {
    symbol: 'NVIX',
    name: 'Novacorp AI & Quantum',
    category: 'Tech',
    currentPrice: 420.50,
    sharesOwned: 0,
    avgBuyPrice: 0,
    priceHistory: [360, 375, 390, 410, 405, 415, 430, 422, 410, 418, 425, 420.5],
    dividendYieldAnnual: 0.8,
    volatility: 0.28
  },
  {
    symbol: 'GLBNK',
    name: 'Global Sovereign Bancorp',
    category: 'Finance',
    currentPrice: 88.20,
    sharesOwned: 0,
    avgBuyPrice: 0,
    priceHistory: [82, 83, 84, 85, 87, 86, 88, 87, 89, 88, 88, 88.2],
    dividendYieldAnnual: 4.2,
    volatility: 0.12
  },
  {
    symbol: 'AEXON',
    name: 'Aether Renewable & Energy',
    category: 'Energy',
    currentPrice: 165.40,
    sharesOwned: 0,
    avgBuyPrice: 0,
    priceHistory: [140, 145, 152, 160, 158, 162, 170, 168, 164, 167, 166, 165.4],
    dividendYieldAnnual: 3.1,
    volatility: 0.19
  },
  {
    symbol: 'HELIOS',
    name: 'Helios Biopharma Labs',
    category: 'Health',
    currentPrice: 215.00,
    sharesOwned: 0,
    avgBuyPrice: 0,
    priceHistory: [195, 200, 205, 198, 210, 220, 218, 225, 212, 214, 219, 215],
    dividendYieldAnnual: 1.5,
    volatility: 0.22
  },
  {
    symbol: 'VORTX',
    name: 'Vortex Global Logistics & Retail',
    category: 'Consumer',
    currentPrice: 74.80,
    sharesOwned: 0,
    avgBuyPrice: 0,
    priceHistory: [68, 70, 71, 73, 72, 75, 76, 74, 75, 74, 75, 74.8],
    dividendYieldAnnual: 2.8,
    volatility: 0.15
  },
  {
    symbol: 'BITR',
    name: 'BitReserve Token Treasury',
    category: 'Crypto',
    currentPrice: 1250.00,
    sharesOwned: 0,
    avgBuyPrice: 0,
    priceHistory: [800, 950, 890, 1100, 1350, 1200, 1420, 1150, 1300, 1220, 1280, 1250],
    dividendYieldAnnual: 0.0,
    volatility: 0.55
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_job',
    title: 'First Step',
    description: 'Get hired for your very first formal career job.',
    category: 'Career',
    icon: 'Briefcase',
    unlocked: false
  },
  {
    id: 'ach_degree',
    title: 'Higher Education',
    description: 'Graduate with a university bachelor or advanced degree.',
    category: 'Life',
    icon: 'GraduationCap',
    unlocked: false
  },
  {
    id: 'ach_millionaire',
    title: 'First Million',
    description: 'Reach a personal net worth of $1,000,000.',
    category: 'Wealth',
    icon: 'DollarSign',
    unlocked: false
  },
  {
    id: 'ach_founder',
    title: 'Entrepreneur',
    description: 'Found your first registered business enterprise.',
    category: 'Business',
    icon: 'Building2',
    unlocked: false
  },
  {
    id: 'ach_ceo',
    title: 'Corner Office',
    description: 'Become Chief Executive Officer of a corporation.',
    category: 'Business',
    icon: 'Award',
    unlocked: false
  },
  {
    id: 'ach_unicorn',
    title: 'Unicorn Builder',
    description: 'Grow a company to over $1 Billion in enterprise valuation.',
    category: 'Business',
    icon: 'Sparkles',
    unlocked: false
  },
  {
    id: 'ach_ipo',
    title: 'Opening Bell',
    description: 'Successfully complete an Initial Public Offering (IPO).',
    category: 'Business',
    icon: 'TrendingUp',
    unlocked: false
  },
  {
    id: 'ach_mayor',
    title: 'City Leader',
    description: 'Win a mayoral or municipal government election.',
    category: 'Politics',
    icon: 'Landmark',
    unlocked: false
  },
  {
    id: 'ach_president',
    title: 'Head of State',
    description: 'Elected President or Prime Minister with national governance authority.',
    category: 'Politics',
    icon: 'Crown',
    unlocked: false
  },
  {
    id: 'ach_sports_champ',
    title: 'Championship Glory',
    description: 'Win a major league sports championship with your owned team or athlete career.',
    category: 'Sports',
    icon: 'Trophy',
    unlocked: false
  },
  {
    id: 'ach_heir',
    title: 'Dynasty Succession',
    description: 'Successfully transfer wealth and company control to the next generation heir.',
    category: 'Dynasty',
    icon: 'Users',
    unlocked: false
  },
  {
    id: 'ach_influence_elite',
    title: 'Global Sovereign',
    description: 'Attain 90+ World Influence and shape international policy summits.',
    category: 'Life',
    icon: 'Globe',
    unlocked: false
  }
];

export const CHALLENGE_SCENARIOS: ChallengeScenario[] = [
  {
    id: 'chal_from_nothing',
    title: 'From Nothing to $100M',
    description: 'Start with just $1,000 cash, no family safety net, and build an empire worth $100,000,000.',
    initialCash: 1000,
    initialAge: 18,
    targetGoal: 'Net Worth >= $100,000,000',
    targetConditionDesc: 'Achieve $100M personal net worth before age 60.',
    difficulty: 'Realistic',
    completed: false
  },
  {
    id: 'chal_turnaround_ceo',
    title: 'Turnaround CEO',
    description: 'Take over a distressed manufacturing company burdened with debt and return it to $10M+ annual profit.',
    initialCash: 50000,
    initialAge: 32,
    targetGoal: 'Company Annual Profit >= $10,000,000',
    targetConditionDesc: 'Eliminate negative cashflow and achieve sustained profitability.',
    difficulty: 'Hard',
    completed: false
  },
  {
    id: 'chal_political_crisis',
    title: 'Crisis Statesman',
    description: 'Lead a country through high inflation & recession, winning the national presidency and achieving >60% approval.',
    initialCash: 25000,
    initialAge: 38,
    targetGoal: 'President with Approval > 60%',
    targetConditionDesc: 'Climb the political ladder and restore national prosperity.',
    difficulty: 'Hard',
    completed: false
  },
  {
    id: 'chal_sports_dynasty',
    title: 'Sports Dynasty Owner',
    description: 'Acquire a struggling local football or basketball franchise and lead them to a league championship.',
    initialCash: 350000,
    initialAge: 30,
    targetGoal: 'Win 1st Place in Sports League',
    targetConditionDesc: 'Hire top coaches, sign star talent, and lift the trophy.',
    difficulty: 'Realistic',
    completed: false
  }
];
