import { 
  GameState, 
  LifeTier, 
  Responsibility, 
  LifePressure, 
  PressureType, 
  PressureSeverity, 
  PressureTrend, 
  PressureMitigationOption, 
  LifeOpportunity, 
  OpportunityCategory, 
  LifeComplexityProfile, 
  PlayerStrategyProfile, 
  StrategyArchetype, 
  ActiveCrisisRecord, 
  LifeMilestoneNarrative, 
  LifeGameplayProfile, 
  DecisionOption, 
  Consequence 
} from '../types';
import { 
  TIER_GAMEPLAY_PROFILES, 
  PRESSURE_CONFIG, 
  STRATEGY_ARCHETYPE_DEFINITIONS, 
  OPPORTUNITY_CONFIG 
} from './lifeGameplayConfig';
import { calculateNetWorth } from './simulationEngine';
import { getLifeTierRank, isLifeTierAtLeast } from './lifeProgressionEngine';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// -------------------------------------------------------------
// 1. AUTHORITATIVE RESPONSIBILITY DERIVATION
// -------------------------------------------------------------

export function deriveResponsibilities(state: GameState): Responsibility[] {
  const responsibilities: Responsibility[] = [];
  const currentMonth = state.currentMonth;
  const currentYear = state.currentYear;
  const lifeTier = state.lifeProgression?.currentTier || 'FOUNDATION';
  const tierRank = getLifeTierRank(lifeTier);

  // 1. PERSONAL & HEALTH
  const health = state.character.attributes.health;
  const stress = state.character.attributes.stress;
  responsibilities.push({
    id: 'resp_personal_health',
    category: 'PERSONAL',
    title: 'Personal Health & Vitality Maintenance',
    description: 'Maintaining baseline physical stamina, sleep, exercise, and mental well-being.',
    severity: health < 40 || stress > 75 ? 'Critical' : (health < 65 || stress > 55 ? 'High' : 'Moderate'),
    scale: 'Personal',
    status: health < 40 || stress > 75 ? 'Critical' : (health < 65 || stress > 55 ? 'Neglected' : 'Under Control'),
    startedMonth: state.character.birthMonth || 1,
    startedYear: state.character.birthYear || 2000,
    maintenanceRequirements: 'Regular fitness, balanced work hours, and wellness routines.',
    neglectConsequencesDescription: 'Rapid health decay, chronic burnout, and reduced decision performance.',
    isFulfilled: health >= 70 && stress <= 40
  });

  // 2. FINANCIAL: BASELINE SOLVENCY & DEBT
  const cash = state.finances.cash;
  const totalDebt = state.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0);
  const monthlyExpenses = state.finances.monthlyBaseExpenses || 1500;
  const isCashDeficit = cash < 0;

  responsibilities.push({
    id: 'resp_financial_solvency',
    category: 'FINANCIAL',
    title: 'Household Cashflow & Solvency',
    description: `Covering recurring living expenses ($${(monthlyExpenses || 1500).toLocaleString()}/mo) and servicing liabilities.`,
    severity: isCashDeficit ? 'Critical' : (cash < (monthlyExpenses || 1500) * 2 ? 'High' : 'Moderate'),
    scale: 'Household',
    status: isCashDeficit ? 'Critical' : (cash < (monthlyExpenses || 1500) * 2 ? 'Neglected' : 'Under Control'),
    startedMonth: 1,
    startedYear: currentYear,
    maintenanceRequirements: `Maintain at least 3-6 months of emergency reserves ($${((monthlyExpenses || 1500) * 3).toLocaleString()}).`,
    neglectConsequencesDescription: 'Late fees, credit score impairment, and high financial distress stress.',
    isFulfilled: cash >= (monthlyExpenses || 1500) * 6 && totalDebt === 0
  });

  if (totalDebt > 0) {
    const monthlyDebtService = state.finances.loans.reduce((acc, l) => acc + (l.monthlyPayment || 0), 0);
    responsibilities.push({
      id: 'resp_financial_debt_service',
      category: 'FINANCIAL',
      title: 'Active Debt Obligations',
      description: `Servicing $${(totalDebt || 0).toLocaleString()} across ${state.finances.loans.length} active loan facility accounts ($${(monthlyDebtService || 0).toLocaleString()}/mo).`,
      severity: cash < monthlyDebtService * 2 ? 'High' : 'Moderate',
      scale: 'Household',
      status: cash < monthlyDebtService ? 'Critical' : 'Active',
      startedMonth: currentMonth,
      startedYear: currentYear,
      maintenanceRequirements: 'Timely monthly principal and interest servicing.',
      neglectConsequencesDescription: 'Credit rating collapse, default risk, and interest penalty escalations.',
      isFulfilled: totalDebt === 0
    });
  }

  // 3. PROFESSIONAL / EMPLOYMENT
  if (state.currentJob) {
    const job = state.currentJob;
    const isSenior = ['Senior', 'Specialist', 'Manager', 'Director', 'Executive', 'Industry Leader'].includes(job.level);
    responsibilities.push({
      id: 'resp_career_performance',
      category: 'PROFESSIONAL',
      title: `${job.title} Duty at ${job.companyName}`,
      description: `Delivering on weekly performance targets (${job.workingHoursWeekly}h/week) and maintaining executive standing.`,
      severity: job.performance < 45 ? 'High' : 'Moderate',
      scale: isSenior ? 'Enterprise' : 'Personal',
      status: job.performance < 40 ? 'Neglected' : (job.performance < 60 ? 'Active' : 'Under Control'),
      startedMonth: currentMonth,
      startedYear: currentYear,
      maintenanceRequirements: 'High work focus, managing overtime, and positive supervisor relationship.',
      neglectConsequencesDescription: 'Stagnant compensation, demotion warning, or termination of employment.',
      isFulfilled: job.performance >= 85
    });
  }

  // 4. ORGANIZATIONAL: COMPANIES & WORKFORCE
  if (state.companies.length > 0) {
    const totalEmployees = state.companies.reduce((sum, c) => sum + (c.employeesCount || 0), 0);
    const totalPayroll = state.companies.reduce((sum, c) => sum + ((c.employeesCount || 0) * (c.averageEmployeeSalary || 4000)), 0);
    const unprofitableCount = state.companies.filter(c => c.monthlyNetProfit < 0).length;

    responsibilities.push({
      id: 'resp_enterprise_governance',
      category: 'ORGANIZATIONAL',
      title: `Enterprise Command (${state.companies.length} Operating Entities)`,
      description: `Governing ${state.companies.length} active corporations, managing ${(totalEmployees || 0).toLocaleString()} employees, and meeting monthly commercial payroll obligations ($${(totalPayroll || 0).toLocaleString()}/mo).`,
      severity: unprofitableCount > 0 ? 'High' : 'Moderate',
      scale: tierRank >= 5 ? 'Enterprise' : 'Household',
      status: unprofitableCount >= 2 ? 'Neglected' : 'Under Control',
      startedMonth: currentMonth,
      startedYear: currentYear,
      maintenanceRequirements: 'Solvent cash reserves, positive operating margins, and executive leadership.',
      neglectConsequencesDescription: 'Workforce morale collapse, executive turnover, loss of market share, and corporate insolvency.',
      isFulfilled: unprofitableCount === 0 && totalEmployees > 50
    });
  }

  // 5. FAMILY & DEPENDENTS
  const partner = state.relationships.find(r => ['Spouse', 'Partner'].includes(r.relation));
  const children = state.relationships.filter(r => ['Son', 'Daughter'].includes(r.relation));

  if (partner || children.length > 0) {
    const avgFamilyTrust = state.relationships
      .filter(r => ['Spouse', 'Partner', 'Son', 'Daughter'].includes(r.relation))
      .reduce((sum, r, _, arr) => sum + (r.trust + r.love) / 2 / (arr.length || 1), 0);

    responsibilities.push({
      id: 'resp_family_care',
      category: 'FAMILY',
      title: `Household Harmony & Care (${children.length} Dependents${partner ? ', Partner' : ''})`,
      description: `Nurturing family relationships, providing child education support, and maintaining household stability.`,
      severity: avgFamilyTrust < 45 ? 'High' : 'Moderate',
      scale: 'Household',
      status: avgFamilyTrust < 40 ? 'Neglected' : (avgFamilyTrust < 65 ? 'Active' : 'Under Control'),
      startedMonth: 1,
      startedYear: currentYear,
      maintenanceRequirements: 'Regular quality time, allowance support, and active listening.',
      neglectConsequencesDescription: 'Relationship estrangement, partner resentment, and dynasty instability.',
      isFulfilled: avgFamilyTrust >= 80
    });
  }

  // 6. PUBLIC & POLITICAL
  if (state.politics.currentOffice.inOffice) {
    const office = state.politics.currentOffice;
    responsibilities.push({
      id: 'resp_political_mandate',
      category: 'POLITICAL',
      title: `Public Mandate: ${office.title}`,
      description: `Governing with democratic accountability, managing citizen approval rating (${Math.round(office.approvalRating)}%), and enacting statutory policy.`,
      severity: office.approvalRating < 40 ? 'Critical' : (office.approvalRating < 50 ? 'High' : 'Moderate'),
      scale: office.title === 'President / Prime Minister' ? 'National' : 'Civic',
      status: office.approvalRating < 35 ? 'Critical' : (office.approvalRating < 50 ? 'Neglected' : 'Under Control'),
      startedMonth: currentMonth,
      startedYear: currentYear,
      maintenanceRequirements: 'Effective macroeconomic policy, high civic presence, and political capital reserves.',
      neglectConsequencesDescription: 'Re-election defeat, legislative paralysis, and public voter discontent.',
      isFulfilled: office.approvalRating >= 65
    });
  }

  // 7. DYNASTY & SUCCESSION
  if (tierRank >= 6 || (state.dynastyGeneration && state.dynastyGeneration > 1) || (state.dynastyProfile && state.dynastyProfile.currentGeneration > 0)) {
    const hasHeir = Boolean(state.dynastyHeirId || (state.dynastyProfile?.successionPlan?.primaryHeirId));
    responsibilities.push({
      id: 'resp_dynasty_succession',
      category: 'DYNASTIC',
      title: 'Generational Succession & Legacy Governance',
      description: hasHeir ? 'Mentoring designated primary heir and maintaining succession trust rules.' : 'Appointing capable heir and structuring generational asset transmission.',
      severity: !hasHeir ? 'High' : 'Moderate',
      scale: 'Generational',
      status: !hasHeir ? 'Neglected' : 'Under Control',
      startedMonth: 1,
      startedYear: currentYear,
      maintenanceRequirements: 'Appointing vetted successor, establishing trusts, and harmonizing family claims.',
      neglectConsequencesDescription: 'Contested will, catastrophic estate fragmentation, and dynastic schism upon death.',
      isFulfilled: hasHeir && (state.dynastyProfile?.dynastyStability || 50) >= 70
    });
  }

  return responsibilities;
}

// -------------------------------------------------------------
// 2. AUTHORITATIVE PRESSURE EVALUATION
// -------------------------------------------------------------

export function calculateLifePressures(
  state: GameState, 
  previousPressures: LifePressure[] = []
): LifePressure[] {
  const pressures: LifePressure[] = [];
  const netWorth = calculateNetWorth(state);
  const cash = state.finances.cash;
  const totalDebt = state.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0);
  const monthlyExpenses = state.finances.monthlyBaseExpenses || 1500;
  const lifeTier = state.lifeProgression?.currentTier || 'FOUNDATION';
  const tierRank = getLifeTierRank(lifeTier);

  // Helper to find previous intensity for trend calculation
  const getPrevIntensity = (type: PressureType): number => {
    const found = previousPressures.find(p => p.type === type);
    return found ? found.intensity : 20;
  };

  const getDuration = (type: PressureType): number => {
    const found = previousPressures.find(p => p.type === type);
    return found ? found.durationMonths + 1 : 1;
  };

  // Helper for trend
  const calculateTrend = (current: number, prev: number): PressureTrend => {
    if (current > prev + 4) return 'Escalating';
    if (current < prev - 4) return 'Decreasing';
    return 'Stable';
  };

  // Helper for severity
  const calculateSeverity = (intensity: number): PressureSeverity => {
    if (intensity >= PRESSURE_CONFIG.intensityThresholds.crisis) return 'Crisis';
    if (intensity >= PRESSURE_CONFIG.intensityThresholds.severe) return 'Severe';
    if (intensity >= PRESSURE_CONFIG.intensityThresholds.moderate) return 'Moderate';
    return 'Low';
  };

  // 1. FINANCIAL PRESSURE
  let financialIntensity = 10;
  let financialReason = 'Basic household living costs are well covered by cash reserves.';
  if (cash < 0) {
    financialIntensity = 95;
    financialReason = `Immediate insolvency: cash account in deficit ($${(cash || 0).toLocaleString()}) incurring overdraft penalties.`;
  } else if (cash < monthlyExpenses) {
    financialIntensity = 80;
    financialReason = `Liquid cash ($${(cash || 0).toLocaleString()}) is less than one month of baseline expenses.`;
  } else if (cash < monthlyExpenses * 3) {
    financialIntensity = 55;
    financialReason = `Modest cash buffer under 3 months runway ($${(cash || 0).toLocaleString()}).`;
  } else if (totalDebt > netWorth * 0.6 && totalDebt > 50000) {
    financialIntensity = 65;
    financialReason = `Elevated debt leverage ($${(totalDebt || 0).toLocaleString()}) exceeding 60% of total asset base.`;
  } else if (cash >= monthlyExpenses * 12) {
    financialIntensity = 12;
    financialReason = 'Robust emergency cash runway exceeding 12 months with healthy solvency.';
  }

  const prevFin = getPrevIntensity('FINANCIAL');
  pressures.push({
    id: 'press_financial',
    type: 'FINANCIAL',
    title: 'Financial & Liquidity Pressure',
    intensity: clamp(financialIntensity, 0, 100),
    severity: calculateSeverity(financialIntensity),
    trend: calculateTrend(financialIntensity, prevFin),
    source: cash < 0 ? 'Cash Deficit & Overdraft' : (totalDebt > 0 ? 'Debt & Living Burn Rate' : 'Baseline Household Expenses'),
    durationMonths: getDuration('FINANCIAL'),
    escalationPotential: 'Insolvency can trigger credit downgrades, asset liquidations, and severe personal stress.',
    mitigationOptions: [
      { id: 'mit_budget_cut', label: 'Enact Strict Household Austerity', actionKey: 'AUSTERITY', cost: 0, description: 'Cut discretionary spending by 25% for 6 months.', potentialRelief: 15 },
      { id: 'mit_liquidate_stocks', label: 'Liquidate Public Equity Holdings', actionKey: 'LIQUIDATE_EQUITY', cost: 0, description: 'Sell liquid shares to rebuild immediate cash reserves.', potentialRelief: 30 }
    ],
    explainReason: financialReason
  });

  // 2. CAREER PRESSURE
  let careerIntensity = 15;
  let careerReason = 'Stable employment with balanced workload.';
  if (!state.currentJob && tierRank <= 3) {
    careerIntensity = 75;
    careerReason = 'Unemployed without active salary while establishing financial independence.';
  } else if (state.currentJob) {
    const job = state.currentJob;
    if (job.performance < 40) {
      careerIntensity = 85;
      careerReason = `Critical performance warning at ${job.companyName} (${Math.round(job.performance)}/100).`;
    } else if (job.workingHoursWeekly >= 55) {
      careerIntensity = 68;
      careerReason = `Heavy weekly workload (${job.workingHoursWeekly} hrs/week) causing fatigue and personal strain.`;
    } else if (job.performance < 65) {
      careerIntensity = 50;
      careerReason = `Mediocre performance review (${Math.round(job.performance)}/100) slowing promotion prospects.`;
    } else {
      careerIntensity = 20;
      careerReason = `Strong workplace performance (${Math.round(job.performance)}/100) and good standing.`;
    }
  }

  const prevCar = getPrevIntensity('CAREER');
  pressures.push({
    id: 'press_career',
    type: 'CAREER',
    title: 'Career & Workload Pressure',
    intensity: clamp(careerIntensity, 0, 100),
    severity: calculateSeverity(careerIntensity),
    trend: calculateTrend(careerIntensity, prevCar),
    source: state.currentJob ? `${state.currentJob.title} Expectations` : 'Unemployment & Job Search',
    durationMonths: getDuration('CAREER'),
    escalationPotential: 'Sustained career strain leads to burnout, demotion, or involuntary termination.',
    mitigationOptions: [
      { id: 'mit_request_leave', label: 'Take Rest & Recuperation Leave', actionKey: 'WORK_REST', cost: 200, description: 'Take time off to reduce workplace burnout and restore health.', potentialRelief: 20 },
      { id: 'mit_skill_training', label: 'Enrol in Executive Coaching', actionKey: 'EXEC_COACHING', cost: 1500, description: 'Boost workplace productivity and supervisor favor.', potentialRelief: 25 }
    ],
    explainReason: careerReason
  });

  // 3. BUSINESS / ENTERPRISE PRESSURE
  if (state.companies.length > 0) {
    let bizIntensity = 25;
    const unprofitable = state.companies.filter(c => c.monthlyNetProfit < 0);
    const lowMorale = state.companies.filter(c => c.employeeMorale < 45);
    let bizReason = 'Corporate entities operating with profitable margins and stable morale.';

    if (unprofitable.length >= 2) {
      bizIntensity = 85;
      bizReason = `Multiple operating entities (${unprofitable.length}) burning cash monthly.`;
    } else if (unprofitable.length === 1) {
      bizIntensity = 65;
      const deficitAmt = Math.abs(unprofitable[0].monthlyNetProfit ?? (unprofitable[0].monthlyRevenue - unprofitable[0].monthlyExpenses) ?? 0);
      bizReason = `${unprofitable[0].name} is operating at a monthly deficit ($${deficitAmt.toLocaleString()}/mo).`;
    } else if (lowMorale.length > 0) {
      bizIntensity = 55;
      bizReason = `Workforce morale distress detected at ${lowMorale[0].name} (${lowMorale[0].employeeMorale}%).`;
    } else {
      bizIntensity = 25;
      bizReason = `Healthy enterprise operations across ${state.companies.length} companies with positive cashflow.`;
    }

    const prevBiz = getPrevIntensity('BUSINESS');
    pressures.push({
      id: 'press_business',
      type: 'BUSINESS',
      title: 'Commercial Operations Pressure',
      intensity: clamp(bizIntensity, 0, 100),
      severity: calculateSeverity(bizIntensity),
      trend: calculateTrend(bizIntensity, prevBiz),
      source: `${state.companies.length} Operating Companies`,
      durationMonths: getDuration('BUSINESS'),
      escalationPotential: 'Operating deficits deplete corporate vaults and threaten enterprise insolvency.',
      mitigationOptions: [
        { id: 'mit_renegotiate_suppliers', label: 'Renegotiate Supply Contracts', actionKey: 'CUT_SUPPLIER_COST', cost: 5000, description: 'Cut unit procurement costs across manufacturing divisions.', potentialRelief: 20 },
        { id: 'mit_boost_marketing', label: 'Launch Emergency Revenue Campaign', actionKey: 'BOOST_MARKETING', cost: 25000, description: 'Stimulate monthly sales demand and market share.', potentialRelief: 25 }
      ],
      explainReason: bizReason
    });
  }

  // 4. REPUTATION & SCRUTINY PRESSURE
  let repIntensity = 15;
  let repReason = 'Public sentiment is favorable with standard privacy.';
  const sentiment = state.character.socialSentiment ?? 50;
  const visibility = state.playerPowerProfile?.visibility || 10;
  const scrutiny = state.playerPowerProfile?.scrutiny || 10;

  if (sentiment < 30) {
    repIntensity = 85;
    repReason = `Public controversy: social sentiment has plummeted to ${sentiment}% amidst media scrutiny.`;
  } else if (scrutiny > 65 && visibility > 50) {
    repIntensity = 65;
    repReason = `High public visibility (${visibility}%) and regulatory scrutiny (${scrutiny}%) creating reputational exposure.`;
  } else if (sentiment < 45) {
    repIntensity = 50;
    repReason = `Lukewarm public perception (${sentiment}%) with active tabloid criticism.`;
  } else {
    repIntensity = 20;
    repReason = 'Respectable public standing and stable reputation.';
  }

  const prevRep = getPrevIntensity('REPUTATION');
  pressures.push({
    id: 'press_reputation',
    type: 'REPUTATION',
    title: 'Public Reputation & Media Scrutiny',
    intensity: clamp(repIntensity, 0, 100),
    severity: calculateSeverity(repIntensity),
    trend: calculateTrend(repIntensity, prevRep),
    source: 'Media Coverage & Public Scrutiny',
    durationMonths: getDuration('REPUTATION'),
    escalationPotential: 'Severe scandals trigger sponsor boycotts, valuation discounts, and political capital loss.',
    mitigationOptions: [
      { id: 'mit_pr_campaign', label: 'Retain Crisis PR Firm', actionKey: 'RETAIN_PR', cost: 15000, description: 'Manage press narratives and publish favorable human-interest profiles.', potentialRelief: 25 },
      { id: 'mit_philanthropy_boost', label: 'Endow Community Grant', actionKey: 'COMMUNITY_GRANT', cost: 50000, description: 'Strengthen civic goodwill and improve social sentiment.', potentialRelief: 30 }
    ],
    explainReason: repReason
  });

  // 5. FAMILY & HOUSEHOLD PRESSURE
  const familyMembers = state.relationships.filter(r => ['Spouse', 'Partner', 'Son', 'Daughter', 'Father', 'Mother'].includes(r.relation));
  if (familyMembers.length > 0) {
    const avgTrust = familyMembers.reduce((sum, r) => sum + (r.trust + r.love) / 2, 0) / familyMembers.length;
    let famIntensity = 15;
    let famReason = 'Harmonious household relations and supportive family bonds.';

    if (avgTrust < 35) {
      famIntensity = 80;
      famReason = `Household estrangement: average family harmony score is critical (${Math.round(avgTrust)}%).`;
    } else if (avgTrust < 55) {
      famIntensity = 55;
      famReason = `Lingering family friction and neglected quality time (${Math.round(avgTrust)}% harmony).`;
    } else {
      famIntensity = 15;
      famReason = `Strong family affection and open communication (${Math.round(avgTrust)}% harmony).`;
    }

    const prevFam = getPrevIntensity('FAMILY');
    pressures.push({
      id: 'press_family',
      type: 'FAMILY',
      title: 'Family & Relationship Harmony',
      intensity: clamp(famIntensity, 0, 100),
      severity: calculateSeverity(famIntensity),
      trend: calculateTrend(famIntensity, prevFam),
      source: `${familyMembers.length} Family Members`,
      durationMonths: getDuration('FAMILY'),
      escalationPotential: 'Unresolved family strain leads to divorces, sibling litigation, and fractured succession.',
      mitigationOptions: [
        { id: 'mit_family_retreat', label: 'Host Luxury Family Retreat', actionKey: 'FAMILY_VACATION', cost: 10000, description: 'Spend dedicated quality time to rebuild family trust and love.', potentialRelief: 30 },
        { id: 'mit_family_counseling', label: 'Retain Family Counselor', actionKey: 'FAMILY_COUNSELING', cost: 5000, description: 'Mediate underlying grievances and realign household priorities.', potentialRelief: 20 }
      ],
      explainReason: famReason
    });
  }

  // 6. POLITICAL PRESSURE
  if (state.politics.currentOffice.inOffice || state.politics.selectedPartyId) {
    const office = state.politics.currentOffice;
    let polIntensity = 20;
    let polReason = 'Political standing is steady with comfortable legislative support.';

    if (office.inOffice) {
      if (office.approvalRating < 35) {
        polIntensity = 90;
        polReason = `Voter revolt: approval rating as ${office.title} has collapsed to ${Math.round(office.approvalRating)}%.`;
      } else if (office.approvalRating < 48) {
        polIntensity = 65;
        polReason = `Contested mandate: approval rating at ${Math.round(office.approvalRating)}% with growing opposition.`;
      } else {
        polIntensity = 30;
        polReason = `Comfortable public approval (${Math.round(office.approvalRating)}%) as ${office.title}.`;
      }
    }

    const prevPol = getPrevIntensity('POLITICAL');
    pressures.push({
      id: 'press_political',
      type: 'POLITICAL',
      title: 'Political Capital & Mandate Pressure',
      intensity: clamp(polIntensity, 0, 100),
      severity: calculateSeverity(polIntensity),
      trend: calculateTrend(polIntensity, prevPol),
      source: office.inOffice ? `${office.title} Public Mandate` : 'Party Politics & Polling',
      durationMonths: getDuration('POLITICAL'),
      escalationPotential: 'Low approval triggers vote-of-no-confidence threats and campaign defeat.',
      mitigationOptions: [
        { id: 'mit_townhall_tour', label: 'Conduct National Town Hall Tour', actionKey: 'TOWNHALL_TOUR', cost: 20000, description: 'Engage directly with voters to rebuild approval rating.', potentialRelief: 25 },
        { id: 'mit_lobby_caucus', label: 'Confer with Key Legislative Allies', actionKey: 'LOBBY_CAUCUS', cost: 10000, description: 'Solidify parliamentary backing and preserve political capital.', potentialRelief: 20 }
      ],
      explainReason: polReason
    });
  }

  // 7. SUCCESSION & DYNASTY PRESSURE
  if (tierRank >= 5 || state.character.age >= 50) {
    let sucIntensity = 20;
    let sucReason = 'Dynasty succession arrangements are progressing smoothly.';
    const hasHeir = Boolean(state.dynastyHeirId || (state.dynastyProfile?.successionPlan?.primaryHeirId));

    if (!hasHeir && state.character.age >= 60) {
      sucIntensity = 85;
      sucReason = `Critical succession vulnerability: age ${state.character.age} without a designated successor or updated will.`;
    } else if (!hasHeir) {
      sucIntensity = 60;
      sucReason = 'Substantial wealth accumulated without formal succession planning or named heir.';
    } else {
      sucIntensity = 25;
      sucReason = 'Named primary successor in place with structured estate distribution.';
    }

    const prevSuc = getPrevIntensity('SUCCESSION');
    pressures.push({
      id: 'press_succession',
      type: 'SUCCESSION',
      title: 'Succession & Dynastic Continuity',
      intensity: clamp(sucIntensity, 0, 100),
      severity: calculateSeverity(sucIntensity),
      trend: calculateTrend(sucIntensity, prevSuc),
      source: 'Dynasty Governance & Will Plan',
      durationMonths: getDuration('SUCCESSION'),
      escalationPotential: 'Unplanned deaths trigger ruinous probate taxes, rival heir litigation, and dynasty collapse.',
      mitigationOptions: [
        { id: 'mit_appoint_heir', label: 'Formulate Comprehensive Will & Trust', actionKey: 'UPDATE_SUCCESSION', cost: 25000, description: 'Establish clear heir allocation and generational holding rules.', potentialRelief: 35 },
        { id: 'mit_mentor_heir', label: 'Sponsor Heir Executive Fellowship', actionKey: 'HEIR_FELLOWSHIP', cost: 30000, description: 'Fast-track successor leadership and business competence.', potentialRelief: 25 }
      ],
      explainReason: sucReason
    });
  }

  return pressures;
}

// -------------------------------------------------------------
// 3. STATE-DRIVEN OPPORTUNITY GENERATOR
// -------------------------------------------------------------

export function generateStateOpportunities(
  state: GameState,
  currentOpportunities: LifeOpportunity[] = []
): LifeOpportunity[] {
  const opportunities = [...currentOpportunities.filter(o => o.status === 'AVAILABLE')];
  const lifeTier = state.lifeProgression?.currentTier || 'FOUNDATION';
  const tierRank = getLifeTierRank(lifeTier);
  const netWorth = calculateNetWorth(state);
  const cash = state.finances.cash;
  const currentMonth = state.currentMonth;
  const currentYear = state.currentYear;

  // Do not generate if active pool is already full
  if (opportunities.length >= OPPORTUNITY_CONFIG.maxActiveOpportunities) {
    return opportunities;
  }

  // TIER 1 & 2: FOUNDATION & INDEPENDENCE OPPORTUNITIES
  if (tierRank <= 2) {
    if (!opportunities.some(o => o.id === 'opp_high_yield_savings') && cash >= 1000) {
      opportunities.push({
        id: 'opp_high_yield_savings',
        category: 'INVESTMENT',
        title: 'High-Yield Treasury Certificate Lock-in',
        description: 'Secure an exclusive 6.2% annualized guaranteed return facility on up to $10,000 for 12 months.',
        status: 'AVAILABLE',
        minLifeTier: 'FOUNDATION',
        risk: 'Low',
        potentialReward: 'Guaranteed interest yield and ironclad capital preservation.',
        requiredResources: { cash: 1000 },
        expiresInMonths: 4,
        availableSinceMonth: currentMonth,
        availableSinceYear: currentYear,
        explainReason: 'Available because you have established initial liquid cash reserves above $1,000.',
        decisionOption: {
          id: 'opt_hy_savings',
          label: 'Lock $2,500 into 6.2% High-Yield Vault',
          description: 'Transfer $2,500 into high-yield certificate account.',
          cost: 2500,
          risk: 'Low',
          timeHorizon: '12 months',
          projectedOutcome: 'Earns predictable passive interest yield with zero capital risk.',
          handlerKey: 'OPP_HIGH_YIELD_SAVINGS',
          consequences: [
            { type: 'FINANCE', target: 'FINANCE', property: 'cash', operation: 'SUBTRACT', value: 2500, description: 'Transferred $2,500 into high-yield savings.' }
          ]
        }
      });
    }

    if (!opportunities.some(o => o.id === 'opp_night_cert') && state.character.attributes.intelligence >= 50) {
      opportunities.push({
        id: 'opp_night_cert',
        category: 'CAREER',
        title: 'Executive Apprenticeship & Digital Credential',
        description: 'Enrol in an intensive weekend professional leadership bootcamp to accelerate career marketability.',
        status: 'AVAILABLE',
        minLifeTier: 'FOUNDATION',
        risk: 'Low',
        potentialReward: '+12 Intelligence, +8 Reputation, unlocks Specialist career tiers.',
        requiredResources: { cash: 1200, intelligence: 50 },
        expiresInMonths: 3,
        availableSinceMonth: currentMonth,
        availableSinceYear: currentYear,
        explainReason: 'Appeared because your intellect exceeds 50 and you are establishing early career momentum.',
        decisionOption: {
          id: 'opt_take_cert',
          label: 'Enrol in Professional Bootcamp ($1,200)',
          description: 'Pay tuition and commit weekend study hours.',
          cost: 1200,
          risk: 'Low',
          timeHorizon: '3 months',
          projectedOutcome: 'Elevates intellectual credentials and promotion velocity.',
          handlerKey: 'OPP_NIGHT_CERT',
          consequences: [
            { type: 'PLAYER', target: 'PLAYER', property: 'intelligence', operation: 'ADD', value: 12, description: 'Earned professional credential (+12 Intellect).' },
            { type: 'PLAYER', target: 'PLAYER', property: 'reputation', operation: 'ADD', value: 8, description: '+8 Industry Reputation.' }
          ]
        }
      });
    }
  }

  // TIER 3 & 4: PROFESSIONAL BUILDER & ENTREPRENEUR OPPORTUNITIES
  if (tierRank >= 3) {
    if (!opportunities.some(o => o.id === 'opp_distressed_property') && cash >= 35000) {
      opportunities.push({
        id: 'opp_distressed_property',
        category: 'PROPERTY',
        title: 'Distressed Commercial Land Auction',
        description: 'Prime urban commercial lot being auctioned off below market appraisal due to developer insolvency.',
        status: 'AVAILABLE',
        minLifeTier: 'PROFESSIONAL_BUILDER',
        risk: 'Medium',
        potentialReward: 'Acquire high-potential commercial land parcel at a 30% discount.',
        requiredResources: { cash: 35000, minNetWorth: 100000 },
        expiresInMonths: 3,
        availableSinceMonth: currentMonth,
        availableSinceYear: currentYear,
        explainReason: 'Appeared due to strong liquid capital reserves ($35k+) and Professional Builder status.',
        decisionOption: {
          id: 'opt_buy_distressed_land',
          label: 'Submit Winning Bid of $35,000 for Commercial Parcel',
          description: 'Purchase distressed property asset for immediate balance sheet equity.',
          cost: 35000,
          risk: 'Medium',
          timeHorizon: 'Immediate',
          projectedOutcome: 'Adds prime commercial land asset valued at $55,000 to balance sheet.',
          handlerKey: 'OPP_BUY_DISTRESSED_LAND'
        }
      });
    }

    if (!opportunities.some(o => o.id === 'opp_angel_syndicate') && netWorth >= 250000 && cash >= 20000) {
      opportunities.push({
        id: 'opp_angel_syndicate',
        category: 'BUSINESS',
        title: 'Seed Syndicate: Quantum AI Tech Startup',
        description: 'Participate in an exclusive pre-seed angel funding round for an innovative generative computing venture.',
        status: 'AVAILABLE',
        minLifeTier: 'PROFESSIONAL_BUILDER',
        risk: 'High',
        potentialReward: 'High upside equity stake or complete write-off depending on commercial execution.',
        requiredResources: { cash: 20000, minNetWorth: 250000 },
        expiresInMonths: 4,
        availableSinceMonth: currentMonth,
        availableSinceYear: currentYear,
        explainReason: 'Offered because your net worth ($250k+) qualifies you for private venture syndicate allocation.',
        decisionOption: {
          id: 'opt_invest_angel',
          label: 'Commit $20,000 Seed Syndicate Check',
          description: 'Acquire 5% preferred equity in early-stage tech venture.',
          cost: 20000,
          risk: 'High',
          timeHorizon: '12-24 months',
          projectedOutcome: 'Position for major valuation multiple or total seed risk.',
          handlerKey: 'OPP_ANGEL_SYNDICATE'
        }
      });
    }
  }

  // TIER 5 & 6: TYCOON & POWER OPPORTUNITIES
  if (tierRank >= 5) {
    if (!opportunities.some(o => o.id === 'opp_conglomerate_ma') && cash >= 500000) {
      opportunities.push({
        id: 'opp_conglomerate_ma',
        category: 'BUSINESS',
        title: 'Direct Corporate M&A: Industrial Robotics Co',
        description: 'Acquire a 60% controlling interest in an automated industrial robotics supplier with positive cashflow.',
        status: 'AVAILABLE',
        minLifeTier: 'TYCOON',
        risk: 'Medium',
        potentialReward: 'Adds $120k/mo revenue and established B2B contracts to your corporate empire.',
        requiredResources: { cash: 500000, minNetWorth: 5000000 },
        expiresInMonths: 5,
        availableSinceMonth: currentMonth,
        availableSinceYear: currentYear,
        explainReason: 'Unlocked by Tycoon status, multi-million net worth, and substantial liquidity.',
        decisionOption: {
          id: 'opt_execute_ma',
          label: 'Acquire Controlling Stake for $500,000',
          description: 'Deploy capital to incorporate industrial supplier into your holding conglomerate.',
          cost: 500000,
          risk: 'Medium',
          timeHorizon: 'Immediate',
          projectedOutcome: 'Expands enterprise footprint with automated production capacity.',
          handlerKey: 'OPP_CONGLOMERATE_MA'
        }
      });
    }

    if (!opportunities.some(o => o.id === 'opp_civic_policy_chair') && (state.character.attributes.worldInfluence >= 40 || state.politics.currentOffice.inOffice)) {
      opportunities.push({
        id: 'opp_civic_policy_chair',
        category: 'INSTITUTIONAL',
        title: 'National Economic Council Advisory Chair',
        description: 'Invited to chair the sovereign economic competitiveness commission, shaping regulatory and tax blueprints.',
        status: 'AVAILABLE',
        minLifeTier: 'POWER_INFLUENCE',
        risk: 'Low',
        potentialReward: '+15 Political Capital, +12 World Influence, permanent elder statesman stature.',
        requiredResources: { minInfluence: 40, reputation: 60 },
        expiresInMonths: 4,
        availableSinceMonth: currentMonth,
        availableSinceYear: currentYear,
        explainReason: 'Extended because your world influence (40+) and high status make you a respected powerbroker.',
        decisionOption: {
          id: 'opt_accept_chair',
          label: 'Accept Advisory Council Chairmanship',
          description: 'Lead national economic hearings and brief legislative leadership.',
          cost: 0,
          risk: 'Low',
          timeHorizon: '6 months',
          projectedOutcome: 'Solidifies systemic societal authority and institutional sway.',
          handlerKey: 'OPP_CIVIC_POLICY_CHAIR'
        }
      });
    }
  }

  // TIER 7 & 8: GLOBAL POWER & DYNASTY OPPORTUNITIES
  if (tierRank >= 7) {
    if (!opportunities.some(o => o.id === 'opp_global_sovereign_treaty')) {
      opportunities.push({
        id: 'opp_global_sovereign_treaty',
        category: 'GLOBAL',
        title: 'Multilateral Trans-Pacific Clean Energy Accord',
        description: 'Spearhead an international multi-nation clean infrastructure accord directing $1B in sovereign development loans.',
        status: 'AVAILABLE',
        minLifeTier: 'NATIONAL_GLOBAL_POWER',
        risk: 'Medium',
        potentialReward: '+25 World Influence, historic international legacy, global conglomerate trade waivers.',
        requiredResources: { minInfluence: 70, minNetWorth: 50000000 },
        expiresInMonths: 6,
        availableSinceMonth: currentMonth,
        availableSinceYear: currentYear,
        explainReason: 'Appeared because of your National/Global Power standing and international reach.',
        decisionOption: {
          id: 'opt_sign_treaty',
          label: 'Ratify Global Infrastructure Accord',
          description: 'Commit diplomatic authority and multinational syndicate resources.',
          cost: 5000000,
          risk: 'Medium',
          timeHorizon: '24 months',
          projectedOutcome: 'Historic global legacy establishing permanent multinational stature.',
          handlerKey: 'OPP_GLOBAL_TREATY'
        }
      });
    }
  }

  return opportunities.slice(0, OPPORTUNITY_CONFIG.maxActiveOpportunities);
}

// -------------------------------------------------------------
// 4. OPPORTUNITY LIFECYCLE MANAGEMENT
// -------------------------------------------------------------

export function advanceOpportunityLifecycles(
  opportunities: LifeOpportunity[]
): { active: LifeOpportunity[]; expired: string[] } {
  const active: LifeOpportunity[] = [];
  const expired: string[] = [];

  for (const opp of opportunities) {
    if (opp.status !== 'AVAILABLE') continue;

    const remainingMonths = opp.expiresInMonths - 1;
    if (remainingMonths <= 0) {
      expired.push(opp.id);
      active.push({
        ...opp,
        expiresInMonths: 0,
        status: 'EXPIRED'
      });
    } else {
      active.push({
        ...opp,
        expiresInMonths: remainingMonths
      });
    }
  }

  return { active, expired };
}

// -------------------------------------------------------------
// 5. COMPLEXITY PROFILE ENGINE
// -------------------------------------------------------------

export function calculateComplexityProfile(state: GameState): LifeComplexityProfile {
  const contributors: { label: string; impact: number; category: string }[] = [];
  let lifestyleScore = 10;
  let orgScore = 0;
  let pubScore = 5;
  let famScore = 5;
  let legScore = 0;

  // 1. Lifestyle complexity
  const propCount = (state.finances.properties || []).length;
  if (propCount > 0) {
    const impact = Math.min(30, propCount * 8);
    lifestyleScore += impact;
    contributors.push({ label: `${propCount} Real Estate Properties`, impact, category: 'Lifestyle' });
  }

  const loansCount = (state.finances.loans || []).length;
  if (loansCount > 0) {
    const impact = Math.min(25, loansCount * 7);
    lifestyleScore += impact;
    contributors.push({ label: `${loansCount} Active Loan Facilities`, impact, category: 'Lifestyle' });
  }

  // 2. Organizational complexity
  const compCount = (state.companies || []).length;
  if (compCount > 0) {
    const totalEmployees = state.companies.reduce((sum, c) => sum + (c.employeesCount || 0), 0);
    const totalExecs = state.companies.reduce((sum, c) => sum + (c.executives?.length || 0), 0);
    const compImpact = Math.min(45, compCount * 12);
    const empImpact = Math.min(35, Math.round(Math.log10(Math.max(10, totalEmployees)) * 12));
    orgScore += compImpact + empImpact;
    contributors.push({ label: `${compCount} Operating Companies (${(totalEmployees || 0).toLocaleString()} staff)`, impact: compImpact + empImpact, category: 'Organizational' });

    if (totalExecs > 0) {
      const execImpact = Math.min(20, totalExecs * 4);
      orgScore += execImpact;
      contributors.push({ label: `${totalExecs} C-Suite Executives Managed`, impact: execImpact, category: 'Organizational' });
    }
  }

  // 3. Public visibility complexity
  const visibility = state.playerPowerProfile?.visibility || 5;
  const scrutiny = state.playerPowerProfile?.scrutiny || 5;
  const inOffice = state.politics.currentOffice.inOffice;
  if (visibility > 25 || inOffice) {
    const pubImpact = Math.min(40, Math.round((visibility * 0.3) + (scrutiny * 0.2) + (inOffice ? 20 : 0)));
    pubScore += pubImpact;
    contributors.push({ label: inOffice ? `Holding ${state.politics.currentOffice.title}` : `Public Visibility & Scrutiny (${visibility}%)`, impact: pubImpact, category: 'Public' });
  }

  // 4. Family complexity
  const relCount = (state.relationships || []).length;
  const childrenCount = state.relationships.filter(r => ['Son', 'Daughter'].includes(r.relation)).length;
  if (relCount > 0) {
    const famImpact = Math.min(30, (relCount * 3) + (childrenCount * 8));
    famScore += famImpact;
    contributors.push({ label: `${childrenCount} Children & ${relCount} Relationships`, impact: famImpact, category: 'Family' });
  }

  // 5. Legacy & Dynasty complexity
  const gen = state.dynastyGeneration || (state.dynastyProfile?.currentGeneration || 1);
  if (gen > 1 || state.dynastyProfile?.timeline?.length || state.dynastyHeirId) {
    const legImpact = Math.min(35, (gen * 8) + (state.dynastyHeirId ? 10 : 0));
    legScore += legImpact;
    contributors.push({ label: `Generation ${gen} Dynastic Governance`, impact: legImpact, category: 'Dynasty' });
  }

  const overall = clamp(Math.round((lifestyleScore * 0.2) + (orgScore * 0.35) + (pubScore * 0.2) + (famScore * 0.15) + (legScore * 0.1)), 5, 100);

  let complexityTier: LifeComplexityProfile['complexityTier'] = 'Minimal';
  if (overall >= 80) complexityTier = 'Extreme';
  else if (overall >= 60) complexityTier = 'Heavy';
  else if (overall >= 40) complexityTier = 'Demanding';
  else if (overall >= 20) complexityTier = 'Manageable';

  // Management capacity ratio: baseline capacity 50. High intelligence & delegating executives increase capacity.
  const execCount = state.companies.reduce((sum, c) => sum + (c.executives?.length || 0), 0);
  const capacity = 40 + (state.character.attributes.intelligence * 0.4) + (execCount * 12);
  const ratio = Math.round((overall / Math.max(20, capacity)) * 100) / 100;

  return {
    overallComplexity: overall,
    lifestyleComplexity: clamp(lifestyleScore, 0, 100),
    organizationalComplexity: clamp(orgScore, 0, 100),
    publicVisibilityComplexity: clamp(pubScore, 0, 100),
    familyComplexity: clamp(famScore, 0, 100),
    legacyComplexity: clamp(legScore, 0, 100),
    complexityTier,
    activeContributors: contributors.sort((a, b) => b.impact - a.impact),
    managementCapacityRatio: ratio
  };
}

// -------------------------------------------------------------
// 6. PLAYER STRATEGY PROFILE INFERENCE
// -------------------------------------------------------------

export function inferPlayerStrategyProfile(
  state: GameState,
  previousProfile?: PlayerStrategyProfile
): PlayerStrategyProfile {
  const netWorth = calculateNetWorth(state);
  const totalDebt = state.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0);
  const totalCash = state.finances.cash;
  const stocksValue = state.finances.stocks.reduce((acc, s) => acc + (s.sharesOwned * s.currentPrice), 0);
  const propValue = state.finances.properties.reduce((acc, p) => acc + p.currentValue, 0);
  const compCount = state.companies.length;
  const decisions = state.decisionHistory || [];

  const tendencyScores: Record<StrategyArchetype, number> = {
    CAUTIOUS: 20,
    AGGRESSIVE: 20,
    OPPORTUNISTIC: 20,
    LONG_TERM: 20,
    PROFESSIONAL: 20,
    ENTREPRENEURIAL: 20,
    INFLUENTIAL: 20,
    DYNASTIC: 20
  };

  // 1. Cautious vs Aggressive scoring
  if (totalCash > 50000 && totalDebt === 0) tendencyScores.CAUTIOUS += 40;
  if (totalCash > netWorth * 0.4) tendencyScores.CAUTIOUS += 25;
  if (totalDebt > netWorth * 0.5 && totalDebt > 20000) tendencyScores.AGGRESSIVE += 45;
  if (stocksValue > netWorth * 0.6) tendencyScores.AGGRESSIVE += 25;

  // 2. Long-term vs Opportunistic scoring
  if (propValue > 100000) tendencyScores.LONG_TERM += 35;
  if (decisions.length >= 5) tendencyScores.OPPORTUNISTIC += 25;

  // 3. Professional scoring
  if (state.currentJob && ['Senior', 'Specialist', 'Manager', 'Director', 'Executive'].includes(state.currentJob.level)) {
    tendencyScores.PROFESSIONAL += 45;
  }
  if (state.education.some(e => e.completed && e.qualification !== 'Secondary')) {
    tendencyScores.PROFESSIONAL += 25;
  }

  // 4. Entrepreneurial scoring
  if (compCount >= 2) tendencyScores.ENTREPRENEURIAL += 55;
  else if (compCount === 1) tendencyScores.ENTREPRENEURIAL += 35;

  // 5. Influential scoring
  if (state.politics.currentOffice.inOffice || state.character.attributes.worldInfluence >= 30) {
    tendencyScores.INFLUENTIAL += 50;
  }
  if ((state.lifetimePhilanthropy || 0) > 50000) {
    tendencyScores.INFLUENTIAL += 25;
  }

  // 6. Dynastic scoring
  if (state.dynastyHeirId || (state.dynastyProfile?.currentGeneration || 1) > 1) {
    tendencyScores.DYNASTIC += 45;
  }

  // Normalize scores to [0, 100]
  (Object.keys(tendencyScores) as StrategyArchetype[]).forEach(k => {
    tendencyScores[k] = clamp(tendencyScores[k], 10, 100);
  });

  // Determine top two tendencies
  const sorted = (Object.keys(tendencyScores) as StrategyArchetype[]).sort(
    (a, b) => tendencyScores[b] - tendencyScores[a]
  );
  const primaryTendency = sorted[0];
  const secondaryTendency = sorted[1];
  const primaryDef = STRATEGY_ARCHETYPE_DEFINITIONS[primaryTendency];

  let behaviorSummary = `Exhibiting a ${primaryDef.name} playstyle (${primaryTendency}), reinforced by strong ${secondaryTendency.toLowerCase()} characteristics.`;
  if (primaryTendency === 'ENTREPRENEURIAL') {
    behaviorSummary = `Focusing heavily on business equity creation, corporate payroll expansion, and direct commercial ownership.`;
  } else if (primaryTendency === 'CAUTIOUS') {
    behaviorSummary = `Maintaining pristine liquidity reserves, strict debt discipline, and conservative balance sheet protection.`;
  } else if (primaryTendency === 'INFLUENTIAL') {
    behaviorSummary = `Deploying capital and relationships to build civic sway, political capital, and public standing.`;
  } else if (primaryTendency === 'DYNASTIC') {
    behaviorSummary = `Prioritizing generational heir mentorship, family harmony, and enduring dynasty succession security.`;
  }

  return {
    primaryTendency,
    secondaryTendency,
    tendencyScores,
    recentBehaviorSummary: behaviorSummary,
    strengths: primaryDef.strengths,
    vulnerabilities: primaryDef.vulnerabilities
  };
}

// -------------------------------------------------------------
// 7. CRISES & ESCALATION ENGINE
// -------------------------------------------------------------

export function evaluateCrisesAndEscalations(
  state: GameState,
  pressures: LifePressure[],
  activeCrises: ActiveCrisisRecord[] = []
): { updatedCrises: ActiveCrisisRecord[]; newCrises: ActiveCrisisRecord[]; resolvedCrises: string[] } {
  const updatedCrises: ActiveCrisisRecord[] = [];
  const newCrises: ActiveCrisisRecord[] = [];
  const resolvedCrises: string[] = [];

  // 1. Process existing active crises
  for (const crisis of activeCrises) {
    if (crisis.resolved) continue;

    const matchingPressure = pressures.find(p => p.type === crisis.type);
    const isRelieved = matchingPressure ? matchingPressure.intensity < PRESSURE_CONFIG.recoveryThreshold : true;

    if (isRelieved) {
      resolvedCrises.push(crisis.id);
      updatedCrises.push({
        ...crisis,
        resolved: true,
        recoveryResolution: `Successfully mitigated. ${crisis.title} subsided below the recovery threshold.`
      });
    } else {
      // Escalate months and intensity
      const newMonths = crisis.monthsInCrisis + 1;
      const newEscalationLevel = newMonths >= 4 ? 3 : (newMonths >= 2 ? 2 : 1);
      updatedCrises.push({
        ...crisis,
        monthsInCrisis: newMonths,
        escalationLevel: newEscalationLevel,
        severity: newEscalationLevel === 3 ? 'Critical' : (newEscalationLevel === 2 ? 'Severe' : 'Moderate')
      });
    }
  }

  // 2. Detect new crises from pressures at crisis intensity (>= 85) for 2+ months
  for (const p of pressures) {
    if (p.severity === 'Crisis' && p.durationMonths >= 2) {
      const alreadyActive = updatedCrises.some(c => c.type === p.type && !c.resolved);
      if (!alreadyActive) {
        const crisisId = `crisis_${p.type.toLowerCase()}_${state.simulationTick}`;
        const newCrisis: ActiveCrisisRecord = {
          id: crisisId,
          type: p.type,
          title: `Crisis: Severe ${p.title} Escalation`,
          description: `Persistent pressure (${p.intensity}/100) over ${p.durationMonths} months has escalated into an active crisis. Immediate strategic intervention required.`,
          severity: 'Critical',
          startedTick: state.simulationTick,
          monthsInCrisis: 1,
          escalationLevel: 1,
          mitigationChoices: p.mitigationOptions.map(m => ({
            id: `opt_${m.id}`,
            label: m.label,
            description: m.description,
            cost: m.cost,
            risk: 'Medium',
            timeHorizon: 'Immediate',
            projectedOutcome: `Reduces crisis pressure by approximately ${m.potentialRelief} points.`,
            handlerKey: `CRISIS_MITIGATION_${m.actionKey}`
          })),
          consequencesPerMonthSummary: [
            'Attribute strain: increased stress and happiness penalty',
            'Reputation and performance drag',
            'Risk of catastrophic failure event if neglected'
          ],
          recoveryResolution: 'Requires reducing underlying pressure intensity below 40 points.',
          resolved: false
        };
        newCrises.push(newCrisis);
        updatedCrises.push(newCrisis);
      }
    }
  }

  return { updatedCrises, newCrises, resolvedCrises };
}

// -------------------------------------------------------------
// 8. LIFE MILESTONE NARRATIVE LOGGING
// -------------------------------------------------------------

export function generateLifeMilestonesAndNarrative(
  prevState: GameState,
  state: GameState,
  existingMilestones: LifeMilestoneNarrative[] = []
): LifeMilestoneNarrative[] {
  const milestones = [...existingMilestones];
  const netWorth = calculateNetWorth(state);
  const prevNetWorth = calculateNetWorth(prevState);
  const currentMonth = state.currentMonth;
  const currentYear = state.currentYear;
  const age = state.character.age;
  const lifeTier = state.lifeProgression?.currentTier || 'FOUNDATION';

  const addMilestone = (id: string, category: string, title: string, description: string, impact: string, icon: string) => {
    if (!milestones.some(m => m.id === id)) {
      milestones.push({
        id,
        month: currentMonth,
        year: currentYear,
        age,
        tier: lifeTier,
        category,
        title,
        description,
        impactSummary: impact,
        icon
      });
    }
  };

  // 1. First Home
  if (state.finances.properties.length >= 1 && prevState.finances.properties.length === 0) {
    addMilestone(
      'ms_first_property',
      'Real Estate',
      'First Real Estate Acquisition',
      `Acquired your first property: ${state.finances.properties[0].name} in ${state.finances.properties[0].city}.`,
      'Established permanent residential and asset foundation.',
      'Building'
    );
  }

  // 2. First Enterprise Founded
  if (state.companies.length >= 1 && prevState.companies.length === 0) {
    addMilestone(
      'ms_first_company',
      'Enterprise',
      'Founded First Operating Enterprise',
      `Incorporated ${state.companies[0].name} in the ${state.companies[0].industry} industry.`,
      'Transitioned into enterprise owner and capital commander.',
      'Briefcase'
    );
  }

  // 3. Millionaire Net Worth
  if (netWorth >= 1000000 && prevNetWorth < 1000000) {
    addMilestone(
      'ms_net_worth_1m',
      'Wealth',
      'Achieved Millionaire Stature ($1M+)',
      `Total asset balance sheet officially crossed the seven-figure mark ($${(netWorth || 0).toLocaleString()}).`,
      'Unlocked high-tier investment syndicates and wealth protection.',
      'DollarSign'
    );
  }

  // 4. Multi-Company Tycoon
  if (state.companies.length >= 2 && prevState.companies.length < 2) {
    addMilestone(
      'ms_multi_company',
      'Enterprise',
      'Formed Multi-Company Conglomerate',
      `Expanded holding empire to multiple operating corporations with combined workforce command.`,
      'Ascended to Tycoon-scale conglomerate governance.',
      'Layers'
    );
  }

  // 5. Elected to Public Office
  if (state.politics.currentOffice.inOffice && !prevState.politics.currentOffice.inOffice) {
    addMilestone(
      'ms_elected_office',
      'Politics',
      `Elected ${state.politics.currentOffice.title}`,
      `Secured democratic mandate to govern in ${state.politics.currentOffice.cityOrNation}.`,
      'Direct authority over statutory policy and civic budgets.',
      'Landmark'
    );
  }

  // 6. Succession Plan Enacted
  if (state.dynastyHeirId && !prevState.dynastyHeirId) {
    const heir = state.relationships.find(r => r.id === state.dynastyHeirId);
    addMilestone(
      'ms_heir_appointed',
      'Dynasty',
      'Formally Appointed Primary Dynasty Heir',
      `Designated ${heir ? heir.name : 'successor'} as the primary heir and successor to the family estate.`,
      'Secured generational continuity and dynasty inheritance roadmap.',
      'Crown'
    );
  }

  return milestones.slice(-50); // Keep last 50 historic milestones
}

// -------------------------------------------------------------
// 9. STRATEGIC OUTLOOK & EXPLAINABILITY SYNTHESIS
// -------------------------------------------------------------

export function generateStrategicOutlook(
  state: GameState,
  pressures: LifePressure[],
  opportunities: LifeOpportunity[],
  complexity: LifeComplexityProfile,
  crises: ActiveCrisisRecord[]
): { summary: string; priorities: string[]; criticalWarnings: string[] } {
  const lifeTier = state.lifeProgression?.currentTier || 'FOUNDATION';
  const tierDef = TIER_GAMEPLAY_PROFILES[lifeTier] || TIER_GAMEPLAY_PROFILES.FOUNDATION;
  const highPressures = pressures.filter(p => p.severity === 'Severe' || p.severity === 'Crisis');
  const activeCrisesCount = crises.filter(c => !c.resolved).length;

  // Executive summary
  let summary = `Operating at the ${tierDef.tier} stage (${tierDef.coreTheme}). `;
  if (activeCrisesCount > 0) {
    summary += `CRITICAL ALERT: You are confronting ${activeCrisesCount} active crisis situations requiring immediate decisive mitigation. `;
  } else if (highPressures.length > 0) {
    summary += `Your primary strategic challenge stems from ${highPressures.map(p => p.title).join(' and ')}. `;
  } else {
    summary += `Your operational rhythm is stable and well-balanced across personal, financial, and organizational commitments. `;
  }

  if (complexity.managementCapacityRatio > 1.2) {
    summary += `Management complexity (${complexity.overallComplexity}/100) is exceeding individual capacity; delegation to executives is strongly recommended.`;
  }

  // Strategic priorities
  const priorities: string[] = [];
  if (state.finances.cash < (state.finances.monthlyBaseExpenses || 1500) * 3) {
    priorities.push('Rebuild emergency cash runway to at least 3 months baseline expenses.');
  }
  if (tierDef.gameplayFocus.length > 0) {
    priorities.push(tierDef.gameplayFocus[0]);
    if (tierDef.gameplayFocus.length > 1) priorities.push(tierDef.gameplayFocus[1]);
  }
  if (opportunities.length > 0) {
    priorities.push(`Evaluate active ${opportunities[0].category.toLowerCase()} opportunity: "${opportunities[0].title}".`);
  }

  // Critical warnings
  const criticalWarnings: string[] = [];
  if (state.finances.cash < 0) {
    criticalWarnings.push(`Cash deficit ($${(state.finances.cash || 0).toLocaleString()}): Incurring monthly overdraft penalties and credit damage.`);
  }
  if (state.character.attributes.health < 40) {
    criticalWarnings.push(`Severe health impairment (${Math.round(state.character.attributes.health)}/100): High risk of chronic medical crisis.`);
  }
  if (state.character.attributes.stress > 80) {
    criticalWarnings.push(`Extreme burnout strain (${Math.round(state.character.attributes.stress)}/100): Decision performance degraded.`);
  }
  for (const crisis of crises.filter(c => !c.resolved)) {
    criticalWarnings.push(`ACTIVE CRISIS: ${crisis.title} (${crisis.severity} Severity, Month ${crisis.monthsInCrisis}).`);
  }

  return {
    summary,
    priorities: priorities.slice(0, 3),
    criticalWarnings
  };
}

// -------------------------------------------------------------
// 10. MASTER EVALUATOR FOR MONTHLY SIMULATION
// -------------------------------------------------------------

export function evaluateLifeGameplay(
  prevState: GameState,
  state: GameState
): { 
  updatedGameplayProfile: LifeGameplayProfile; 
  gameplayDiff: {
    newResponsibilities: Responsibility[];
    resolvedResponsibilities: string[];
    pressureChanges: { type: PressureType; oldIntensity: number; newIntensity: number; trend: PressureTrend }[];
    newOpportunities: LifeOpportunity[];
    expiredOpportunities: string[];
    crisesTriggered: ActiveCrisisRecord[];
    crisesResolved: string[];
    strategicOutlookSummary: string;
  } 
} {
  const prevGameplay = prevState.lifeGameplay;
  const prevPressures = prevGameplay?.activePressures || [];
  const prevOpportunities = prevGameplay?.activeOpportunities || [];
  const prevCrises = prevGameplay?.activeCrises || [];
  const prevMilestones = prevGameplay?.milestones || [];
  const prevStrategy = prevGameplay?.strategyProfile;

  // 1. Authoritative Responsibilities
  const currentResponsibilities = deriveResponsibilities(state);
  const prevRespIds = new Set((prevGameplay?.currentResponsibilities || []).map(r => r.id));
  const newResponsibilities = currentResponsibilities.filter(r => !prevRespIds.has(r.id));
  const resolvedResponsibilities = (prevGameplay?.currentResponsibilities || [])
    .filter(r => !currentResponsibilities.some(cr => cr.id === r.id))
    .map(r => r.id);

  // 2. Authoritative Pressures
  const activePressures = calculateLifePressures(state, prevPressures);
  const pressureChanges = activePressures.map(p => {
    const oldP = prevPressures.find(op => op.type === p.type);
    return {
      type: p.type,
      oldIntensity: oldP ? oldP.intensity : 20,
      newIntensity: p.intensity,
      trend: p.trend
    };
  });

  // 3. Opportunities Lifecycle & Generation
  const { active: refreshedOpps, expired: expiredOpportunityIds } = advanceOpportunityLifecycles(prevOpportunities);
  const activeOpportunities = generateStateOpportunities(state, refreshedOpps);
  const prevOppIds = new Set(prevOpportunities.map(o => o.id));
  const newOpportunities = activeOpportunities.filter(o => !prevOppIds.has(o.id));

  // 4. Complexity Profile
  const complexity = calculateComplexityProfile(state);

  // 5. Strategy Profile
  const strategyProfile = inferPlayerStrategyProfile(state, prevStrategy);

  // 6. Crises & Escalations
  const { updatedCrises: activeCrises, newCrises: crisesTriggered, resolvedCrises } = evaluateCrisesAndEscalations(state, activePressures, prevCrises);

  // 7. Life Milestones
  const milestones = generateLifeMilestonesAndNarrative(prevState, state, prevMilestones);

  // 8. Strategic Outlook
  const strategicOutlook = generateStrategicOutlook(state, activePressures, activeOpportunities, complexity, activeCrises);

  const updatedGameplayProfile: LifeGameplayProfile = {
    currentResponsibilities,
    activePressures,
    activeOpportunities,
    complexity,
    strategyProfile,
    activeCrises,
    milestones,
    lastEvaluatedTick: state.simulationTick,
    strategicOutlook
  };

  const gameplayDiff = {
    newResponsibilities,
    resolvedResponsibilities,
    pressureChanges,
    newOpportunities,
    expiredOpportunities: expiredOpportunityIds,
    crisesTriggered,
    crisesResolved: resolvedCrises,
    strategicOutlookSummary: strategicOutlook.summary
  };

  return { updatedGameplayProfile, gameplayDiff };
}
