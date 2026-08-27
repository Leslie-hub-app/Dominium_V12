import { 
  DOMINIUM_ICON_REGISTRY, 
  SemanticIconKey 
} from '../components/icons/iconRegistry';
import {
  getCareerIcon,
  getPropertyIcon,
  getInvestmentIcon,
  getBankingIcon,
  getCreditIcon,
  getLegalIcon,
  getPoliticalIcon,
  getGovernmentIcon,
  getResourceIcon,
  getRelationshipIcon,
  getEventIcon,
  getStatusIcon,
  getRiskIcon,
  getTrendIcon,
  getSkillIcon,
  getEducationIcon,
  getPowerTierIcon,
  getPersonalityIcon
} from '../components/icons/entityIconMappers';

export interface IconSystemTestAssertion {
  id: string;
  category: string;
  description: string;
  passed: boolean;
  actual: any;
  expected: any;
  details?: string;
}

export interface IconSystemTestReport {
  passed: boolean;
  totalAssertions: number;
  passedAssertions: number;
  failedAssertions: number;
  assertions: IconSystemTestAssertion[];
  timestamp: string;
}

/**
 * COMPREHENSIVE ICON SYSTEM VALIDATION SUITE
 * Verifies that all semantic keys, fallbacks, and entity mappers resolve accurately and deterministically.
 */
export function runIconSystemTests(): IconSystemTestReport {
  const assertions: IconSystemTestAssertion[] = [];

  const record = (
    id: string,
    category: string,
    description: string,
    actual: any,
    expected: any,
    condition?: boolean
  ) => {
    const passed = condition !== undefined ? condition : actual === expected;
    assertions.push({
      id,
      category,
      description,
      passed,
      actual,
      expected,
      details: passed ? 'Assertion satisfied' : `Expected ${expected} but received ${actual}`
    });
  };

  // 1. REGISTRY INTEGRITY
  record(
    'REG-01',
    'Registry',
    'Nav home icon exists in registry',
    !!DOMINIUM_ICON_REGISTRY['nav.home'],
    true
  );

  record(
    'REG-02',
    'Registry',
    'Career general icon exists in registry',
    !!DOMINIUM_ICON_REGISTRY['career.general'],
    true
  );

  record(
    'REG-03',
    'Registry',
    'Banking checking icon exists in registry',
    !!DOMINIUM_ICON_REGISTRY['banking.checking'],
    true
  );

  record(
    'REG-04',
    'Registry',
    'Legal law icon exists in registry',
    !!DOMINIUM_ICON_REGISTRY['legal.law'],
    true
  );

  record(
    'REG-05',
    'Registry',
    'System fallback icon exists in registry',
    !!DOMINIUM_ICON_REGISTRY['system.fallback'],
    true
  );

  // 2. CAREER & OCCUPATION MAPPERS
  record(
    'CAR-01',
    'Career Mapper',
    'Maps Chief Executive Officer to occupation.ceo',
    getCareerIcon('Chief Executive Officer'),
    'occupation.ceo'
  );

  record(
    'CAR-02',
    'Career Mapper',
    'Maps Senior Corporate Lawyer to occupation.lawyer',
    getCareerIcon('Senior Corporate Lawyer'),
    'occupation.lawyer'
  );

  record(
    'CAR-03',
    'Career Mapper',
    'Maps Full Stack Software Developer to occupation.developer',
    getCareerIcon('Full Stack Software Developer'),
    'occupation.developer'
  );

  record(
    'CAR-04',
    'Career Mapper',
    'Maps Investment Banker to occupation.banker',
    getCareerIcon('Investment Banker'),
    'occupation.banker'
  );

  record(
    'CAR-05',
    'Career Mapper',
    'Maps Unknown Custom Career gracefully to general career',
    getCareerIcon('Quantum Astrologist'),
    'career.general'
  );

  // 3. PROPERTY MAPPERS
  record(
    'PROP-01',
    'Property Mapper',
    'Maps Luxury Penthouse to property.penthouse',
    getPropertyIcon('Luxury Penthouse'),
    'property.penthouse'
  );

  record(
    'PROP-02',
    'Property Mapper',
    'Maps Commercial Office Tower to property.office',
    getPropertyIcon('Commercial Office Tower'),
    'property.office'
  );

  record(
    'PROP-03',
    'Property Mapper',
    'Maps Logistics Warehouse to property.warehouse',
    getPropertyIcon('Logistics Warehouse'),
    'property.warehouse'
  );

  record(
    'PROP-04',
    'Property Mapper',
    'Maps Agricultural Farmland to property.farmland',
    getPropertyIcon('Agricultural Farmland'),
    'property.farmland'
  );

  // 4. BANKING & CREDIT MAPPERS
  record(
    'BANK-01',
    'Banking Mapper',
    'Maps High-Yield Savings to banking.highyield',
    getBankingIcon('High-Yield Savings Account'),
    'banking.highyield'
  );

  record(
    'BANK-02',
    'Banking Mapper',
    'Maps 24-Month Fixed CD to banking.cd',
    getBankingIcon('24-Month CD'),
    'banking.cd'
  );

  record(
    'BANK-03',
    'Banking Mapper',
    'Maps Checking Account to banking.checking',
    getBankingIcon('Premier Checking'),
    'banking.checking'
  );

  record(
    'CRED-01',
    'Credit Mapper',
    'Maps Commercial Mortgage to credit.mortgage',
    getCreditIcon('Commercial Mortgage'),
    'credit.mortgage'
  );

  record(
    'CRED-02',
    'Credit Mapper',
    'Maps Revolving Line of Credit to credit.line',
    getCreditIcon('Revolving Line of Credit'),
    'credit.line'
  );

  record(
    'CRED-03',
    'Credit Mapper',
    'Maps Loan Arrears to credit.arrears',
    getCreditIcon('Payment in Arrears'),
    'credit.arrears'
  );

  // 5. INVESTMENTS & MARKETS
  record(
    'INV-01',
    'Investment Mapper',
    'Maps S&P 500 Index ETF to investment.etf',
    getInvestmentIcon('S&P 500 ETF'),
    'investment.etf'
  );

  record(
    'INV-02',
    'Investment Mapper',
    'Maps Physical Gold Bullion to investment.gold',
    getInvestmentIcon('Physical Gold Bullion'),
    'investment.gold'
  );

  record(
    'INV-03',
    'Investment Mapper',
    'Maps Crude Oil Futures to investment.oil',
    getInvestmentIcon('Crude Oil Futures'),
    'investment.oil'
  );

  record(
    'INV-04',
    'Investment Mapper',
    'Maps Treasury Bond to investment.govtbond',
    getInvestmentIcon('10-Year Govt Treasury Bond'),
    'investment.govtbond'
  );

  // 6. LEGAL, POLITICS & GOVERNMENT
  record(
    'LEG-01',
    'Legal Mapper',
    'Maps Supreme Court Appellate to legal.court',
    getLegalIcon('Supreme Court Appeal'),
    'legal.court'
  );

  record(
    'LEG-02',
    'Legal Mapper',
    'Maps Commercial Breach Settlement to legal.settlement',
    getLegalIcon('Commercial Settlement'),
    'legal.settlement'
  );

  record(
    'POL-01',
    'Politics Mapper',
    'Maps City Mayor to office.mayor',
    getPoliticalIcon('City Mayor'),
    'office.mayor'
  );

  record(
    'POL-02',
    'Politics Mapper',
    'Maps Prime Minister to office.primeminister',
    getPoliticalIcon('Prime Minister'),
    'office.primeminister'
  );

  record(
    'GOV-01',
    'Government Mapper',
    'Maps National Treasury to govt.treasury',
    getGovernmentIcon('National Treasury & Finance'),
    'govt.treasury'
  );

  // 7. STATUS, RISK & TRENDS
  record(
    'STAT-01',
    'Status Mapper',
    'Maps ACTIVE to status.active',
    getStatusIcon('ACTIVE'),
    'status.active'
  );

  record(
    'STAT-02',
    'Status Mapper',
    'Maps IN_PROGRESS to status.inprogress',
    getStatusIcon('IN_PROGRESS'),
    'status.inprogress'
  );

  record(
    'STAT-03',
    'Status Mapper',
    'Maps REJECTED to status.rejected',
    getStatusIcon('REJECTED'),
    'status.rejected'
  );

  record(
    'RISK-01',
    'Risk Mapper',
    'Maps CRITICAL to risk.critical',
    getRiskIcon('CRITICAL'),
    'risk.critical'
  );

  record(
    'RISK-02',
    'Risk Mapper',
    'Maps SAFE to risk.safe',
    getRiskIcon('SAFE'),
    'risk.safe'
  );

  record(
    'TREND-01',
    'Trend Mapper',
    'Maps positive numeric delta to trend.up',
    getTrendIcon(14.5),
    'trend.up'
  );

  record(
    'TREND-02',
    'Trend Mapper',
    'Maps negative numeric delta to trend.down',
    getTrendIcon(-8.2),
    'trend.down'
  );

  record(
    'TREND-03',
    'Trend Mapper',
    'Maps zero delta to trend.stable',
    getTrendIcon(0.0),
    'trend.stable'
  );

  // 8. POWER & PERSONALITY
  record(
    'POW-01',
    'Power Mapper',
    'Maps GLOBAL power tier to power.tier.global',
    getPowerTierIcon('GLOBAL'),
    'power.tier.global'
  );

  record(
    'POW-02',
    'Power Mapper',
    'Maps LEGENDARY power tier to power.tier.legendary',
    getPowerTierIcon('LEGENDARY'),
    'power.tier.legendary'
  );

  record(
    'TRAIT-01',
    'Trait Mapper',
    'Maps Ambition to trait.ambition',
    getPersonalityIcon('Unstoppable Ambition'),
    'trait.ambition'
  );

  const passedCount = assertions.filter(a => a.passed).length;
  const failedCount = assertions.length - passedCount;

  return {
    passed: failedCount === 0,
    totalAssertions: assertions.length,
    passedAssertions: passedCount,
    failedAssertions: failedCount,
    assertions,
    timestamp: new Date().toISOString()
  };
}
