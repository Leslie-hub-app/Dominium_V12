import { Company } from '../types';

/**
 * Deterministic 200-company public universe used by the Corporate Simulation Engine.
 * The catalog intentionally generates companies from sector templates rather than
 * storing hundreds of repetitive literals, while keeping every company persistent
 * and individually addressable by ticker/company id.
 */

const SECTORS = [
  { sector: 'Technology', industry: 'Software & Cloud', names: ['Apex', 'Nexus', 'Vertex', 'Quantum', 'Nova', 'Orion', 'Helix', 'Cobalt', 'Vector', 'Lumina', 'Pioneer', 'Summit', 'Atlas', 'Meridian', 'Horizon', 'Catalyst', 'Stratus', 'Vantage', 'Pulse', 'Keystone'], salary: 7200, margin: 0.22, demand: 1.12, pe: 27 },
  { sector: 'Mining', industry: 'Mining & Materials', names: ['Redstone', 'Ironvale', 'Frontier', 'Terra', 'Granite', 'Silvercrest', 'Blackridge', 'Northstar', 'Copperline', 'Orexis', 'Stonegate', 'Highland', 'DeepCore', 'MineralCo', 'Rockland', 'Canyon', 'Drakens', 'Prospect', 'Earthworks', 'Metallix'], salary: 5200, margin: 0.16, demand: 1.02, pe: 13 },
  { sector: 'Healthcare', industry: 'Healthcare & Pharmaceuticals', names: ['Medica', 'Vitalis', 'CarePoint', 'WellSpring', 'BioNova', 'HealthCore', 'Lifeline', 'Genexis', 'Clinica', 'Thera', 'MedAxis', 'PureHealth', 'CurePath', 'LifeBridge', 'Wellstone', 'BioFrontier', 'Medisphere', 'EverCare', 'PharmaOne', 'HealthVista'], salary: 6800, margin: 0.19, demand: 1.08, pe: 22 },
  { sector: 'Banking', industry: 'Banking & Financial Services', names: ['First Dominion', 'Apex Bank', 'Mercury', 'Crown', 'United Capital', 'Sterling', 'Pinnacle', 'Harbor', 'Summit Bank', 'GlobalTrust', 'Continental', 'Metropolitan', 'Liberty', 'Evergreen', 'Prime', 'National', 'Union', 'Commonwealth', 'Citadel', 'Frontier Bank'], salary: 7600, margin: 0.24, demand: 1.05, pe: 15 },
  { sector: 'Energy', industry: 'Energy & Utilities', names: ['Solaris', 'Helio', 'GridWorks', 'PowerGen', 'EverPower', 'TerraEnergy', 'NorthGrid', 'BluePeak', 'Voltaris', 'Energex', 'Fusion', 'GreenCurrent', 'Atlas Energy', 'Sovereign Power', 'BrightGrid', 'CoreEnergy', 'Renewis', 'Vector Energy', 'Horizon Power', 'Titan Energy'], salary: 6100, margin: 0.18, demand: 1.06, pe: 16 },
  { sector: 'Consumer', industry: 'Consumer Goods & Retail', names: ['Mercantile', 'UrbanMart', 'PrimeGoods', 'Lifestyle', 'EverHome', 'ValueWorks', 'Civic Retail', 'MarketSquare', 'Household', 'BrightLife', 'DailyCo', 'GrandMarket', 'ModernGoods', 'Cornerstone', 'ConsumerOne', 'Heritage', 'Freshline', 'HomeFront', 'RetailCore', 'Vista Brands'], salary: 4600, margin: 0.12, demand: 1.04, pe: 18 },
  { sector: 'Industrials', industry: 'Manufacturing & Engineering', names: ['ForgeWorks', 'Industrial Dynamics', 'Precision', 'Titan Manufacturing', 'AeroFab', 'MechCore', 'SteelWorks', 'Engineered Systems', 'ProMach', 'Heavy Industries', 'OmniFab', 'Advanced Manufacturing', 'CoreWorks', 'Prime Industrial', 'Vector Manufacturing', 'NorthWorks', 'Summit Engineering', 'MetroFab', 'Apex Industrial', 'Pioneer Manufacturing'], salary: 5400, margin: 0.14, demand: 1.00, pe: 17 },
  { sector: 'Telecommunications', industry: 'Telecommunications & Connectivity', names: ['Connecta', 'SignalOne', 'TeleLink', 'BroadNet', 'PulseCom', 'GlobalConnect', 'NetWave', 'SkyLink', 'FiberCore', 'MobileOne', 'DataLink', 'ConnectCore', 'UrbanTel', 'WorldSignal', 'NextNet', 'PrimeCom', 'MetroLink', 'VistaTel', 'Apex Telecom', 'Horizon Connect'], salary: 5800, margin: 0.17, demand: 1.05, pe: 19 },
  { sector: 'Transport', industry: 'Transportation & Logistics', names: ['FreightOne', 'TransWorld', 'RapidLogix', 'Atlas Logistics', 'Continental Freight', 'SkyCargo', 'PortLink', 'RoadStar', 'RailCore', 'Global Transit', 'SwiftShip', 'CargoWorks', 'MetroTransit', 'Fleetline', 'OceanBridge', 'AirLink', 'Prime Logistics', 'ExpressCore', 'NorthRoute', 'United Transport'], salary: 4900, margin: 0.11, demand: 1.03, pe: 16 },
  { sector: 'Media', industry: 'Media & Entertainment', names: ['Vista Media', 'Pulse Studios', 'Crown Entertainment', 'StreamWorks', 'Global Media', 'BrightScreen', 'Prime Studios', 'WorldView', 'CultureCore', 'Apex Media', 'Signal Studios', 'Storyline', 'Orbit Entertainment', 'Metro Media', 'VisionWorks', 'Spotlight', 'NextWave Media', 'SilverScreen', 'CreativeOne', 'Horizon Studios'], salary: 5000, margin: 0.15, demand: 1.02, pe: 21 }
] as const;

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function tickerFor(sectorIndex: number, companyIndex: number, name: string): string {
  const cleaned = name.replace(/[^A-Za-z]/g, '').toUpperCase();
  const prefix = (cleaned.slice(0, 3) || 'DOM');
  return `${prefix}${String.fromCharCode(65 + sectorIndex)}${String(companyIndex + 1).padStart(2, '0')}`.slice(0, 6);
}

export function generatePublicCompanyUniverse(): Company[] {
  const companies: Company[] = [];
  SECTORS.forEach((template, sectorIndex) => {
    template.names.forEach((name, companyIndex) => {
      const seed = hash(`${template.sector}:${name}:${companyIndex}`);
      const scale = 0.65 + (seed % 1000) / 1000 * 1.75;
      const employees = Math.round((1800 + (seed % 92000)) * scale);
      const avgSalary = Math.round(template.salary * (0.88 + ((seed >>> 8) % 35) / 100));
      const annualRevenue = Math.round(employees * avgSalary * (3.4 + ((seed >>> 12) % 170) / 100));
      const monthlyRevenue = Math.round(annualRevenue / 12);
      const margin = Math.max(0.04, Math.min(0.32, template.margin + ((((seed >>> 16) % 200) - 100) / 10000)));
      const monthlyProfit = Math.round(monthlyRevenue * margin);
      const cash = Math.round(annualRevenue * (0.07 + ((seed >>> 20) % 9) / 100));
      const debt = Math.round(annualRevenue * (0.15 + ((seed >>> 24) % 65) / 100));
      const assets = Math.round(annualRevenue * (0.75 + ((seed >>> 4) % 120) / 100));
      const shares = Math.round((120_000_000 + (seed % 4_880_000_000)) / 1_000_000) * 1_000_000;
      const eps = (monthlyProfit * 12) / shares;
      const navPerShare = Math.max(0.5, (assets - debt) / shares);
      const sharePrice = Math.max(8, Math.round((eps * template.pe + navPerShare) * 100) / 100);
      const publicFloat = Math.round(shares * (0.52 + ((seed >>> 5) % 22) / 100));
      const institutional = Math.round(shares * (0.12 + ((seed >>> 9) % 18) / 100));
      const insider = Math.max(0, shares - publicFloat - institutional);
      const dividendYield = monthlyProfit > 0 ? Math.min(6.5, Math.max(0, margin * 100 * (0.15 + ((seed >>> 13) % 25) / 100))) : 0;
      const id = `asx_${sectorIndex + 1}_${companyIndex + 1}`;
      const ticker = tickerFor(sectorIndex, companyIndex, name);
      const city = ['New York', 'London', 'Johannesburg', 'Singapore', 'Toronto', 'Sydney', 'Frankfurt', 'Tokyo', 'Dubai', 'São Paulo'][seed % 10];
      const country = ['United States', 'United Kingdom', 'South Africa', 'Singapore', 'Canada', 'Australia', 'Germany', 'Japan', 'United Arab Emirates', 'Brazil'][seed % 10];
      const capacity = Math.max(50_000, Math.round(employees * (42 + (seed % 65))));
      const customerBase = Math.round(employees * (12 + (seed % 90)));

      companies.push({
        id,
        name: `${name} ${template.sector === 'Banking' ? 'Financial' : template.sector} Group`,
        industry: template.industry,
        sector: template.sector,
        city,
        country,
        headquarters: `${city}, ${country}`,
        ticker,
        exchange: 'ASX',
        valuation: Math.round(shares * sharePrice),
        sharePrice,
        totalShares: shares,
        playerOwnershipPercentage: 0,
        isPublic: true,
        publicFloatShares: publicFloat,
        insiderShares: insider,
        institutionalShares: institutional,
        votingShares: shares,
        cashReserve: cash,
        cash,
        monthlyRevenue,
        annualRevenue,
        monthlyExpenses: Math.round(monthlyRevenue * (1 - margin)),
        monthlyNetProfit: monthlyProfit,
        employeesCount: employees,
        averageEmployeeSalary: avgSalary,
        employeeMorale: 62 + (seed % 28),
        employeeProductivity: 60 + ((seed >>> 6) % 31),
        employeeWageSatisfaction: 60 + ((seed >>> 10) % 31),
        marketShare: 1.2 + ((seed >>> 14) % 90) / 10,
        brandReputation: 50 + ((seed >>> 18) % 46),
        productQuality: 55 + ((seed >>> 22) % 41),
        pricingStrategy: (seed % 3 === 0 ? 'Discount' : seed % 3 === 1 ? 'Competitive' : 'Premium Luxury'),
        marketingBudgetMonthly: Math.round(monthlyRevenue * (0.025 + ((seed >>> 26) % 35) / 1000)),
        rdBudgetMonthly: Math.round(monthlyRevenue * (template.sector === 'Technology' ? 0.08 : 0.035)),
        capacityMonthlyUnits: capacity,
        inventoryUnits: Math.round(capacity * 0.18),
        unitCost: Math.max(1, Math.round((monthlyRevenue / Math.max(1, capacity)) * 0.42)),
        unitPrice: Math.max(2, Math.round(monthlyRevenue / Math.max(1, capacity))),
        supplierType: seed % 3 === 0 ? 'Local' : seed % 3 === 1 ? 'International Low-Cost' : 'Premium Quality',
        supplierCostFactor: 0.95 + ((seed >>> 27) % 20) / 100,
        executives: [{ id: `${id}_ceo`, name: `AI Executive ${name}`, role: 'CEO', salaryMonthly: Math.round(avgSalary * 7), competence: 72 + (seed % 24), loyalty: 60 + ((seed >>> 5) % 36), ambition: 60 + ((seed >>> 8) % 36), personality: seed % 2 ? 'Aggressive Growth' : 'Conservative Prudent' }],
        boardMembers: [],
        historicalRevenue: Array.from({ length: 12 }, (_, i) => Math.round(monthlyRevenue * (0.92 + i * 0.008))),
        historicalProfit: Array.from({ length: 12 }, (_, i) => Math.round(monthlyProfit * (0.90 + i * 0.009))),
        dividendPayoutRatio: dividendYield > 0 ? Math.min(0.7, dividendYield / Math.max(1, margin * 100)) : 0,
        debt,
        debtInterestRate: 3.5 + ((seed >>> 30) % 45) / 10,
        fixedAssets: assets,
        totalAssets: assets + cash,
        totalLiabilities: debt,
        cogsMonthly: Math.round(monthlyRevenue * (0.38 + ((seed >>> 7) % 22) / 100)),
        fixedOverheadCostsMonthly: Math.round(monthlyRevenue * 0.06),
        customerBase,
        capacityUtilization: 0.62 + ((seed >>> 11) % 25) / 100,
        demandCoefficient: template.demand,
        volatilityIndex: 0.015 + ((seed >>> 15) % 80) / 1000,
        high52Week: Math.round(sharePrice * 1.18 * 100) / 100,
        low52Week: Math.round(sharePrice * 0.72 * 100) / 100,
        peRatio: template.pe,
        dividendYield,
        lastQuarterRevenue: monthlyRevenue * 3,
        lastQuarterNetIncome: monthlyProfit * 3,
        lastQuarterRevenueGrowth: 0,
        revenueGrowthStreak: 0,
        corporateTaxRate: 21,
        listedSinceTick: 0,
        ceoApprovalRating: 65 + ((seed >>> 19) % 25),
        boardSeatCount: 7,
        boardControlThreshold: 50
      });
    });
  });
  return companies;
}
