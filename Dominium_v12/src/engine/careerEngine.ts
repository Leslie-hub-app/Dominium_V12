import { 
  GameState, 
  ExpandedCareerProfile, 
  OccupationDef, 
  JobApplication, 
  CareerActionType, 
  ProfessionalLicense,
  CareerFieldId 
} from '../types';
import { EXPANSION2_OCCUPATIONS, EXPANSION2_LICENSES } from '../data/expansion2Catalogs';
import { recordFinancialTransaction } from './financialLedgerEngine';

export function initializeExpandedCareerProfile(): ExpandedCareerProfile {
  return {
    licensesHeld: [],
    obtainedLicenses: [],
    studyProgress: {},
    boardDirectorships: [],
    jobApplications: [],
    workPerformanceScore: 70,
    monthsInCurrentRole: 0,
    consecutiveHighPerformanceMonths: 0,
    careerReputationInField: {
      'BUSINESS_AND_MANAGEMENT': 50,
      'FINANCE_AND_BANKING': 50,
      'LAW_AND_JUSTICE': 50,
      'MEDICINE_AND_HEALTHCARE': 50,
      'TECHNOLOGY': 50,
      'ENGINEERING_AND_CONSTRUCTION': 50,
      'EDUCATION_AND_ACADEMIA': 50,
      'GOVERNMENT_AND_PUBLIC_SERVICE': 50,
      'MEDIA_AND_ENTERTAINMENT': 50,
      'SECURITY_AND_DEFENSE': 50,
      'SCIENCE_AND_RESEARCH': 50,
      'SKILLED_TRADES': 50,
      'ENTREPRENEURSHIP': 50
    },
    unemploymentBenefitMonthsRemaining: 0,
    recentWorkActions: [],
    activeInterview: null,
    activeJobRecord: null
  };
}

export function ensureExpandedCareerProfile(state: GameState): ExpandedCareerProfile {
  if (!state.expandedCareer) {
    state.expandedCareer = initializeExpandedCareerProfile();
  }
  if (!Array.isArray(state.expandedCareer.licensesHeld)) {
    state.expandedCareer.licensesHeld = [];
  }
  if (!Array.isArray(state.expandedCareer.obtainedLicenses)) {
    state.expandedCareer.obtainedLicenses = [...state.expandedCareer.licensesHeld];
  }
  if (!state.expandedCareer.studyProgress || typeof state.expandedCareer.studyProgress !== 'object') {
    state.expandedCareer.studyProgress = {};
  }
  if (!Array.isArray(state.expandedCareer.boardDirectorships)) {
    state.expandedCareer.boardDirectorships = [];
  }
  if (!Array.isArray(state.expandedCareer.jobApplications)) {
    state.expandedCareer.jobApplications = [];
  }
  if (!Array.isArray(state.expandedCareer.recentWorkActions)) {
    state.expandedCareer.recentWorkActions = [];
  }
  if (!state.expandedCareer.careerReputationInField) {
    state.expandedCareer.careerReputationInField = {};
  }
  if (state.currentJob && !state.expandedCareer.activeJobRecord) {
    state.expandedCareer.activeJobRecord = {
      title: state.currentJob.title,
      employer: state.currentJob.companyName || 'Corporate Enterprise',
      tierLevel: 1,
      salaryMonthly: state.currentJob.monthlySalary || state.currentJob.salary || 5000,
      performance: state.currentJob.performance || 70,
      tenureMonths: 0,
      promotionsEarned: 0,
      hoursPerWeek: state.currentJob.workingHoursWeekly || 40
    };
  }
  return state.expandedCareer;
}

export function getAvailableOccupations(field?: CareerFieldId): OccupationDef[] {
  if (!field) return EXPANSION2_OCCUPATIONS;
  return EXPANSION2_OCCUPATIONS.filter(o => o.field === field);
}

export function checkOccupationEligibility(state: GameState, occ: OccupationDef): {
  eligible: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  const intelligence = state.character?.attributes?.intelligence ?? state.character?.intelligence ?? 50;
  const reputation = state.character?.attributes?.reputation ?? state.character?.reputation ?? 50;
  const educationTier = state.character?.education || (state.education && (state.education[0] as any)?.degree) || 'Secondary';
  const profile = ensureExpandedCareerProfile(state);

  if (intelligence < occ.entryRequirements.minIntelligence) {
    reasons.push(`Requires Intelligence >= ${occ.entryRequirements.minIntelligence} (Current: ${intelligence})`);
  }

  if (reputation < occ.entryRequirements.minReputation) {
    reasons.push(`Requires Professional Reputation >= ${occ.entryRequirements.minReputation} (Current: ${reputation})`);
  }

  if (occ.entryRequirements.requiredLicenseId && !profile.licensesHeld.includes(occ.entryRequirements.requiredLicenseId)) {
    const lic = EXPANSION2_LICENSES.find(l => l.id === occ.entryRequirements.requiredLicenseId);
    reasons.push(`Requires active license: ${lic?.name || occ.entryRequirements.requiredLicenseId}`);
  }

  const eduRanks: Record<string, number> = { 'None': 0, 'Secondary': 1, 'Bachelor': 2, 'Master': 3, 'PhD': 4 };
  const playerEduRank = eduRanks[educationTier] || 1;
  const reqEduRank = eduRanks[occ.entryRequirements.requiredEducation] || 1;

  if (playerEduRank < reqEduRank) {
    reasons.push(`Requires degree: ${occ.entryRequirements.requiredEducation} or higher (Current: ${educationTier})`);
  }

  return {
    eligible: reasons.length === 0,
    reasons
  };
}

export function submitJobApplication(
  state: GameState,
  occupationId: string,
  employerName: string = 'Apex Global Holdings'
): { success: boolean; message: string; application?: JobApplication } {
  const occ = EXPANSION2_OCCUPATIONS.find(o => o.id === occupationId);
  if (!occ) {
    return { success: false, message: 'Invalid occupation specification.' };
  }

  const eligibility = checkOccupationEligibility(state, occ);
  if (!eligibility.eligible) {
    return { success: false, message: `Application rejected: ${eligibility.reasons.join(', ')}` };
  }

  const profile = ensureExpandedCareerProfile(state);
  const existingApp = profile.jobApplications.find(a => a.occupationId === occupationId && (a.status === 'PENDING' || a.status === 'INTERVIEW_SCHEDULED'));
  if (existingApp) {
    return { success: false, message: 'An active application for this role is already in progress.' };
  }

  const tick = (state.time?.year || 2026) * 12 + (state.time?.month || 1);
  const application: JobApplication = {
    id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    occupationId,
    employerName,
    appliedTick: tick,
    offeredSalaryMonthly: occ.salaryMonthlyBase,
    status: 'INTERVIEW_SCHEDULED',
    interviewQuestions: [
      {
        question: `How will you handle strategic resource constraints under high quarterly scrutiny at ${employerName}?`,
        choices: [
          { text: 'Present a data-backed efficiency roadmap and streamline operational overhead.', successProbability: 0.85, bonusSalaryPercent: 10 },
          { text: 'Rally department heads and demand aggressive milestone acceleration.', successProbability: 0.65, bonusSalaryPercent: 15 },
          { text: 'Request conservative timeline extensions and additional capital reserves.', successProbability: 0.50, bonusSalaryPercent: 0 }
        ]
      }
    ]
  };

  profile.jobApplications.unshift(application);
  return {
    success: true,
    message: `Application submitted to ${employerName}! Interview scheduled.`,
    application
  };
}

export function answerJobInterview(
  state: GameState,
  applicationId: string,
  choiceIndex: number
): { success: boolean; message: string; acceptedOffer?: boolean } {
  const profile = ensureExpandedCareerProfile(state);
  const app = profile.jobApplications.find(a => a.id === applicationId);
  if (!app || app.status !== 'INTERVIEW_SCHEDULED') {
    return { success: false, message: 'No scheduled interview found for this application.' };
  }

  const question = app.interviewQuestions?.[0];
  const choice = question?.choices?.[choiceIndex] || { successProbability: 0.5, bonusSalaryPercent: 0, text: 'Standard reply' };

  const passRoll = Math.random();
  if (passRoll <= choice.successProbability) {
    const finalSalary = Math.round(app.offeredSalaryMonthly * (1 + (choice.bonusSalaryPercent / 100)));
    app.status = 'OFFERED';
    app.offeredSalaryMonthly = finalSalary;

    // Accept offer and appoint player
    const occ = EXPANSION2_OCCUPATIONS.find(o => o.id === app.occupationId);
    if (occ) {
      state.character.occupation = occ.title;
      state.currentJob = {
        id: `job_${Date.now()}`,
        title: occ.title,
        field: occ.field,
        level: 'Professional',
        companyName: app.employerName || 'Apex Enterprise',
        monthlySalary: finalSalary,
        salary: finalSalary,
        monthlyBonusPotential: Math.round(finalSalary * 0.2),
        stressLevel: occ.responsibilityProfile.stressRating,
        workingHoursWeekly: occ.responsibilityProfile.weeklyHours,
        reputationRequired: occ.entryRequirements.minReputation,
        intelligenceRequired: occ.entryRequirements.minIntelligence,
        educationRequired: occ.entryRequirements.requiredEducation,
        startAge: state.character.age || 25,
        performance: 75,
        experience: 0
      };
      profile.workPerformanceScore = 75;
      profile.monthsInCurrentRole = 0;
      app.status = 'ACCEPTED';
      
      return {
        success: true,
        message: `Outstanding interview! Offer accepted as ${occ.title} with $${finalSalary.toLocaleString()}/month salary.`,
        acceptedOffer: true
      };
    }
  }

  app.status = 'REJECTED';
  return {
    success: false,
    message: 'The hiring committee selected a different candidate.',
    acceptedOffer: false
  };
}

export function takeLicenseExam(
  state: GameState,
  licenseId: string
): { success: boolean; message: string; acquired?: boolean } {
  const lic = EXPANSION2_LICENSES.find(l => l.id === licenseId);
  if (!lic) {
    return { success: false, message: 'Unknown professional license.' };
  }

  const profile = ensureExpandedCareerProfile(state);
  if (profile.licensesHeld.includes(licenseId)) {
    return { success: false, message: `You already hold the ${lic.name}.` };
  }

  const fee = lic.maintenanceFeeAnnual;
  if ((state.finances?.cash || 0) < fee) {
    return { success: false, message: `Insufficient cash for examination and registration fees ($${fee.toLocaleString()}).` };
  }

  // Deduct exam fee
  state.finances.cash -= fee;
  recordFinancialTransaction(state, {
    type: 'MISCELLANEOUS',
    category: 'EXPENSE',
    amount: fee,
    description: `Professional licensing examination fee: ${lic.name}`
  });

  const intBonus = ((state.character?.intelligence || 50) - 50) * 0.6;
  const repBonus = ((state.character?.reputation || 50) - 50) * 0.4;
  const passScore = 50 + intBonus + repBonus;

  if (passScore >= lic.examDifficulty) {
    profile.licensesHeld.push(licenseId);
    state.character.reputation = Math.min(100, (state.character?.reputation || 50) + 8);
    return {
      success: true,
      message: `Congratulations! You passed the board examination and earned ${lic.name}.`,
      acquired: true
    };
  } else {
    return {
      success: false,
      message: `Examination failed. Score was below the ${lic.examDifficulty}% proficiency threshold. Study and try again next month.`,
      acquired: false
    };
  }
}

export function attemptLicensingExam(
  state: GameState,
  licenseId: string
): { success: boolean; message: string; passed?: boolean; acquired?: boolean } {
  const res = takeLicenseExam(state, licenseId);
  return {
    ...res,
    passed: res.acquired ?? res.success
  };
}

export function performWorkAction(
  state: GameState,
  actionType: CareerActionType
): { success: boolean; message: string; performanceDelta: number; bonus?: number } {
  const profile = ensureExpandedCareerProfile(state);
  if (!state.currentJob || state.character?.occupation === 'Unemployed') {
    return { success: false, message: 'You are currently unemployed. Apply for an occupation first.', performanceDelta: 0 };
  }

  const tick = (state.currentYear || 2026) * 12 + (state.currentMonth || 1);
  const delta = Math.floor(Math.random() * 8) + 3; // +3 to +10 performance
  profile.workPerformanceScore = Math.min(100, profile.workPerformanceScore + delta);

  let bonus = 0;
  if (Math.random() > 0.6) {
    bonus = Math.round((state.currentJob?.monthlySalary || 5000) * 0.25);
    state.finances.cash += bonus;
    recordFinancialTransaction(state, {
      type: 'SALARY',
      category: 'INCOME',
      amount: bonus,
      description: `Executive performance incentive bonus (${actionType})`
    });
  }

  profile.recentWorkActions.unshift({
    tick,
    actionType,
    outcomeSummary: `Executed ${actionType} initiative with measurable organizational value.`,
    performanceDelta: delta,
    salaryBonus: bonus > 0 ? bonus : undefined
  });

  if (profile.recentWorkActions.length > 20) {
    profile.recentWorkActions.length = 20;
  }

  return {
    success: true,
    message: `Work initiative [${actionType}] completed! Performance increased by +${delta}%${bonus > 0 ? ` with a $${bonus.toLocaleString()} milestone bonus!` : '.'}`,
    performanceDelta: delta,
    bonus
  };
}

export function simulateMonthlyCareerStep(state: GameState): void {
  const profile = ensureExpandedCareerProfile(state);
  if (!state.currentJob) {
    profile.monthsInCurrentRole = 0;
    return;
  }

  profile.monthsInCurrentRole += 1;

  if (profile.workPerformanceScore >= 80) {
    profile.consecutiveHighPerformanceMonths += 1;
    if (profile.consecutiveHighPerformanceMonths >= 6) {
      // Merit promotion / salary raise
      const salaryRaise = Math.round((state.currentJob.monthlySalary || 5000) * 0.08);
      state.currentJob.monthlySalary = (state.currentJob.monthlySalary || 5000) + salaryRaise;
      profile.consecutiveHighPerformanceMonths = 0;
      if (state.character?.attributes) {
        state.character.attributes.reputation = Math.min(100, (state.character.attributes.reputation || 50) + 3);
      }
    }
  } else if (profile.workPerformanceScore < 40) {
    profile.consecutiveHighPerformanceMonths = 0;
    if (Math.random() > 0.7) {
      // Risk of firing/demotion
      state.currentJob = null;
    }
  }
}

export function studyForProfessionalLicense(
  state: GameState,
  licenseId: string
): { success: boolean; message: string; hoursAdded?: number } {
  const lic = EXPANSION2_LICENSES.find(l => l.id === licenseId);
  if (!lic) return { success: false, message: 'Invalid license specified.' };

  const tuitionCost = lic.tuitionCost || lic.maintenanceFeeAnnual || 2500;
  if ((state.finances?.cash || 0) < tuitionCost) {
    return { success: false, message: `Insufficient cash for tuition/study materials ($${tuitionCost.toLocaleString()}).` };
  }

  state.finances.cash -= tuitionCost;
  recordFinancialTransaction(state, {
    type: 'MISCELLANEOUS',
    category: 'EXPENSE',
    amount: tuitionCost,
    description: `Professional licensing study & prep modules: ${lic.name}`
  });

  const profile = ensureExpandedCareerProfile(state);
  const currentHours = profile.studyProgress[licenseId] || 0;
  const hoursAdded = 10;
  profile.studyProgress[licenseId] = currentHours + hoursAdded;

  return {
    success: true,
    message: `Completed 10 hours of intensive study for ${lic.name}. Total progress: ${profile.studyProgress[licenseId]} hours.`,
    hoursAdded
  };
}

export function applyForExpandedJob(
  state: GameState,
  occupationId: string
): { success: boolean; message: string } {
  const occ = EXPANSION2_OCCUPATIONS.find(o => o.id === occupationId);
  if (!occ) return { success: false, message: 'Occupation not found.' };

  const profile = ensureExpandedCareerProfile(state);
  const reqLic = occ.requiredLicenseId || (occ.entryRequirements as any)?.requiredLicenseId;
  if (reqLic && !profile.obtainedLicenses.includes(reqLic) && !profile.licensesHeld.includes(reqLic)) {
    return { success: false, message: `Application blocked: Requires active accreditation: ${reqLic}` };
  }

  const employerName = `${occ.title.split(' ')[0]} Strategic Partners`;
  profile.activeInterview = {
    targetJobId: occ.id,
    targetJobTitle: occ.title,
    companyName: employerName,
    currentQuestionIndex: 0,
    accumulatedScore: 0,
    questions: [
      {
        prompt: `How would you lead organizational efficiency under strict market headwinds as our ${occ.title}?`,
        options: [
          { text: 'Deploy rigorous cost-discipline, automate redundant workflows, and optimize headcount.', score: 35, bonusPercent: 10 },
          { text: 'Aggressively expand market reach through high-velocity acquisitions and product innovation.', score: 25, bonusPercent: 15 },
          { text: 'Maintain prudent defensive margins and preserve capital liquidity.', score: 20, bonusPercent: 0 }
        ]
      },
      {
        prompt: `Your experience profile shows ${state.currentJob?.title || state.character.occupation || 'early-career experience'}. A major stakeholder presents conflicting demands during a mission-critical release. How do you respond?`,
        options: [
          { text: 'Align stakeholders around quantitative KPIs and data-driven objective tradeoffs.', score: 40, bonusPercent: 10 },
          { text: 'Escalate directly to executive leadership for decisive top-down alignment.', score: 20, bonusPercent: 0 },
          { text: 'Negotiate phased compromise milestones to accommodate key concerns without delay.', score: 35, bonusPercent: 5 }
        ]
      },
      {
        prompt: `The hiring panel reviews your reputation (${Math.round(state.character.attributes.reputation)}%) and intelligence (${Math.round(state.character.attributes.intelligence)}%). You inherit an underperforming team in your first 90 days. What is your approach?`,
        options: [
          { text: 'Diagnose people, process and incentives first, then set measurable recovery targets.', score: 40, bonusPercent: 10 },
          { text: 'Replace the weakest performers immediately to signal accountability.', score: 22, bonusPercent: 3 },
          { text: 'Keep the structure unchanged and wait for performance to recover naturally.', score: 8, bonusPercent: 0 }
        ]
      }
    ]
  };

  return {
    success: true,
    message: `Application submitted for ${occ.title}! The executive interview panel is now seated.`
  };
}

export function answerInterviewQuestion(
  state: GameState,
  answerIndex: number
): { success: boolean; message: string; hired?: boolean } {
  const profile = ensureExpandedCareerProfile(state);
  if (!profile.activeInterview) {
    return { success: false, message: 'No active interview in progress.' };
  }

  const interview = profile.activeInterview;
  const currentQ = interview.questions[interview.currentQuestionIndex];
  if (!currentQ) {
    profile.activeInterview = null;
    return { success: false, message: 'Interview concluded.' };
  }

  const chosenOpt = currentQ.options[answerIndex] || currentQ.options[0];
  interview.accumulatedScore += chosenOpt.score;
  interview.currentQuestionIndex += 1;

  if (interview.currentQuestionIndex >= interview.questions.length) {
    const passed = interview.accumulatedScore >= 50;
    const targetJobId = interview.targetJobId;
    const occ = EXPANSION2_OCCUPATIONS.find(o => o.id === targetJobId);
    profile.activeInterview = null;

    if (passed && occ) {
      const baseSalary = occ.baseSalaryMonthly || occ.salaryMonthlyBase || 12000;
      const finalSalary = Math.round(baseSalary * (1 + (chosenOpt.bonusPercent || 5) / 100));
      
      state.character.occupation = occ.title;
      state.currentJob = {
        id: `job_${Date.now()}`,
        title: occ.title,
        field: occ.field,
        level: 'Executive',
        companyName: interview.companyName,
        monthlySalary: finalSalary,
        salary: finalSalary,
        monthlyBonusPotential: Math.round(finalSalary * 0.25),
        stressLevel: occ.responsibilityProfile?.stressRating || 50,
        workingHoursWeekly: 40,
        reputationRequired: occ.entryRequirements?.minReputation || 40,
        intelligenceRequired: occ.entryRequirements?.minIntelligence || 60,
        educationRequired: occ.entryRequirements?.requiredEducation || 'Bachelor',
        startAge: state.character.age || 25,
        performance: 80,
        experience: 0
      };

      profile.activeJobRecord = {
        title: occ.title,
        employer: interview.companyName,
        tierLevel: occ.tierLevel || 1,
        salaryMonthly: finalSalary,
        performance: 80,
        tenureMonths: 0,
        promotionsEarned: 0,
        hoursPerWeek: 40
      };

      return {
        success: true,
        message: `Outstanding performance! You passed the interview and have been appointed as ${occ.title} at $${finalSalary.toLocaleString()}/month!`,
        hired: true
      };
    } else {
      return {
        success: false,
        message: 'The interview panel concluded that your responses did not meet their executive profile. Better luck next time.'
      };
    }
  }

  return {
    success: true,
    message: `Response recorded (+${chosenOpt.score} pts). Next question.`
  };
}

export function setWorkHoursPace(
  state: GameState,
  hoursPerWeek: number
): { success: boolean; message: string } {
  const profile = ensureExpandedCareerProfile(state);
  if (profile.activeJobRecord) {
    profile.activeJobRecord.hoursPerWeek = hoursPerWeek;
  }
  if (state.currentJob) {
    state.currentJob.workingHoursWeekly = hoursPerWeek;
  }

  return {
    success: true,
    message: `Workload pace adjusted to ${hoursPerWeek} hours/week.`
  };
}

export function negotiateSalaryIncrease(
  state: GameState
): { success: boolean; message: string; salaryRaise?: number } {
  const profile = ensureExpandedCareerProfile(state);
  const currentSalary = profile.activeJobRecord?.salaryMonthly || state.currentJob?.monthlySalary || 0;
  if (currentSalary <= 0) {
    return { success: false, message: 'You must be actively employed to negotiate compensation.' };
  }

  const perf = profile.activeJobRecord?.performance || state.currentJob?.performance || 50;
  if (perf < 75) {
    return { success: false, message: `Your current performance rating (${perf}%) is too low to warrant a merit increase (75% required).` };
  }

  const raise = Math.round(currentSalary * 0.12);
  const newSalary = currentSalary + raise;
  if (profile.activeJobRecord) {
    profile.activeJobRecord.salaryMonthly = newSalary;
  }
  if (state.currentJob) {
    state.currentJob.monthlySalary = newSalary;
    state.currentJob.salary = newSalary;
  }

  return {
    success: true,
    message: `Negotiation successful! Merit raise granted: +$${raise.toLocaleString()}/month (New Salary: $${newSalary.toLocaleString()}/mo).`,
    salaryRaise: raise
  };
}
