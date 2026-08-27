import { 
  GameState, 
  LifeSystemState, 
  MonthlyTimeAllocation, 
  MonthlyTimeBudget, 
  LifeBiographyEntry, 
  UniversityApplication, 
  WorkplaceProfile, 
  ColleaguePerson, 
  DatingCandidate, 
  MarketplaceAssetItem, 
  SocialPlatformType, 
  LifeEvent, 
  NewsItem 
} from '../types';
import { 
  UNIVERSITIES_CATALOG, 
  WELLNESS_ACTIVITIES_CATALOG, 
  DATE_ACTIVITIES_CATALOG, 
  DATING_CANDIDATES_POOL, 
  INITIAL_SOCIAL_ACCOUNTS 
} from '../data/lifeCatalogs';
import { ensureWorldMarketplace, refreshWorldMarketplace } from './worldMarketplaceEngine';

export const DEFAULT_MONTHLY_ALLOCATION: MonthlyTimeAllocation = {
  careerHours: 160,
  partnerHours: 80,
  entrepreneurshipHours: 80,
  workHours: 160,
  overtimeHours: 0,
  educationHours: 50,
  studyHours: 30,
  fitnessHours: 40,
  familyHours: 80,
  datingHours: 80,
  friendsHours: 60,
  socialMediaHours: 40,
  hobbiesHours: 60,
  wellnessHours: 40
};

export function getLifeAllocationTotals(allocation: MonthlyTimeAllocation) {
  return {
    career: Math.max(0, allocation.careerHours ?? ((allocation.workHours || 0) + (allocation.overtimeHours || 0))),
    education: Math.max(0, (allocation.educationHours || 0) + (allocation.studyHours || 0)),
    family: Math.max(0, allocation.familyHours || 0),
    partner: Math.max(0, allocation.partnerHours ?? (allocation.datingHours || 0)),
    friends: Math.max(0, allocation.friendsHours || 0),
    wellness: Math.max(0, (allocation.wellnessHours || 0) + (allocation.fitnessHours || 0)),
    hobbies: Math.max(0, allocation.hobbiesHours || 0),
    socialMedia: Math.max(0, allocation.socialMediaHours || 0),
    entrepreneurship: Math.max(0, allocation.entrepreneurshipHours || 0)
  };
}

export function calculateMonthlyTimeBudget(allocation: MonthlyTimeAllocation): MonthlyTimeBudget {
  const totalMonthlyHours = 720;
  const sleepAndRoutineHours = 0;
  const discretionaryCapacityHours = 720;
  const totals = getLifeAllocationTotals(allocation);
  const allocatedHours = Object.values(totals).reduce((sum, value) => sum + value, 0);
  const remainingHours = discretionaryCapacityHours - allocatedHours;
  const utilizationPercentage = Math.round((allocatedHours / discretionaryCapacityHours) * 100);

  let burnoutRisk: MonthlyTimeBudget['burnoutRisk'] = 'None';
  if (utilizationPercentage > 105) burnoutRisk = 'Critical';
  else if (utilizationPercentage > 100) burnoutRisk = 'Severe';
  else if (utilizationPercentage > 94) burnoutRisk = 'Moderate';
  else if (utilizationPercentage > 84) burnoutRisk = 'Mild';

  return { totalMonthlyHours, sleepAndRoutineHours, discretionaryCapacityHours, allocatedHours, remainingHours, utilizationPercentage, burnoutRisk };
}

export function ensureLifeSystemState(state: GameState): LifeSystemState {
  if (!state.lifeSystem) {
    state.lifeSystem = {
      personality: {
        ambition: 75,
        confidence: 70,
        discipline: 68,
        sociability: 65,
        creativity: 72,
        empathy: 60,
        leadership: 68,
        patience: 64,
        riskTolerance: 60
      },
      timeAllocation: { ...DEFAULT_MONTHLY_ALLOCATION },
      biography: [
        {
          id: `bio_birth_${state.character.id}`,
          ageYears: 0,
          ageMonths: 0,
          month: state.character.birthMonth || 1,
          year: state.character.birthYear || 2000,
          category: 'Birth',
          title: `Born in ${state.character.birthCity}, ${state.character.birthCountry}`,
          description: `${state.character.firstName} ${state.character.lastName} began their life journey.`,
          iconName: 'Baby',
          significance: 'Historic'
        }
      ],
      universityApplications: [],
      datingProfile: {
        bio: 'Driven individual balancing high ambitions with genuine connections.',
        relationshipGoal: 'Long-Term Partnership',
        interests: ['Tech & Finance', 'Travel & Culture', 'Fitness', 'Fine Dining'],
        lifestyleStyle: 'Active & Athletic',
        minAge: Math.max(18, state.character.age - 5),
        maxAge: state.character.age + 8,
        preferredLocation: state.character.residenceCity || 'Metropolis',
        isActive: true
      },
      datingCandidates: JSON.parse(JSON.stringify(DATING_CANDIDATES_POOL)),
      marketplaceInventory: [],
      socialAccounts: JSON.parse(JSON.stringify(INITIAL_SOCIAL_ACCOUNTS)),
      socialPosts: [],
      activeLifestyleLevel: 'Comfortable',
      lifestyleExpensesMonthly: 1200
    };
  }

  state.lifeSystem.socialInteractionHistory = state.lifeSystem.socialInteractionHistory || [];

  // Migrate legacy allocations into the nine-category 720-hour Life Operating System.
  const allocation = state.lifeSystem.timeAllocation;
  allocation.careerHours = allocation.careerHours ?? ((allocation.workHours || 0) + (allocation.overtimeHours || 0));
  allocation.partnerHours = allocation.partnerHours ?? (allocation.datingHours || 0);
  allocation.entrepreneurshipHours = allocation.entrepreneurshipHours ?? 0;
  const totals = getLifeAllocationTotals(allocation);
  const currentTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  if (currentTotal !== 720 && !state.lifeSystem.__allocationMigrated) {
    state.lifeSystem.timeAllocation = { ...DEFAULT_MONTHLY_ALLOCATION };
    state.lifeSystem.__allocationMigrated = true;
  }

  // Ensure workplace profile if character is employed
  if (state.currentJob && !state.lifeSystem.workplace) {
    state.lifeSystem.workplace = generateWorkplaceProfile(state.currentJob.companyName, state.currentJob.field);
  }

  return state.lifeSystem;
}

export function generateWorkplaceProfile(companyName: string, industry: string): WorkplaceProfile {
  const cultures: WorkplaceProfile['workplaceCulture'][] = ['Collaborative', 'Innovative Fast-Paced', 'Bureaucratic', 'Competitive Cutthroat'];
  const culture = cultures[Math.floor(Math.random() * cultures.length)];

  const colleagues: ColleaguePerson[] = [
    {
      id: `col_1_${Math.random().toString(36).substring(7)}`,
      name: 'Alexander Reed',
      role: 'Senior Project Lead',
      tier: 'Peer',
      department: 'Strategy & Operations',
      age: 32,
      personality: 'Analytical, pragmatic, and helpful',
      trust: 65,
      respect: 70,
      relationshipWithPlayer: 65,
      ambition: 75,
      competence: 82,
      avatarSeed: 'AlexanderReed'
    },
    {
      id: `col_2_${Math.random().toString(36).substring(7)}`,
      name: 'Sophia Laurent',
      role: 'Lead Business Analyst',
      tier: 'Peer',
      department: 'Finance & Planning',
      age: 28,
      personality: 'Sharp-witted, collaborative, high standards',
      trust: 60,
      respect: 75,
      relationshipWithPlayer: 62,
      ambition: 85,
      competence: 88,
      avatarSeed: 'SophiaLaurent'
    },
    {
      id: `col_3_${Math.random().toString(36).substring(7)}`,
      name: 'David Thorne',
      role: 'Associate Coordinator',
      tier: 'Subordinate',
      department: 'Client Relations',
      age: 24,
      personality: 'Enthusiastic, eager to learn, slightly anxious',
      trust: 70,
      respect: 80,
      relationshipWithPlayer: 72,
      ambition: 68,
      competence: 65,
      avatarSeed: 'DavidThorne'
    }
  ];

  return {
    companyName: companyName || 'Apex Corporation',
    industry: industry || 'Technology',
    department: 'Global Operations & Growth',
    workplaceCulture: culture,
    managerName: 'Director Victoria Sterling',
    managerTrust: 65,
    managerRespect: 70,
    managerPerception: 68,
    supervisorName: 'Arthur Hastings',
    colleagues,
    teamMorale: 78,
    teamPerformance: 82,
    monthlyOvertimeHours: 0,
    remoteWorkApproved: true
  };
}

export function recordLifeBiography(
  state: GameState, 
  entry: Omit<LifeBiographyEntry, 'id' | 'month' | 'year' | 'ageYears' | 'ageMonths'>
): void {
  const life = ensureLifeSystemState(state);
  const birthMonth = state.character.birthMonth || 1;
  const ageMonthsCalculated = ((state.currentMonth - birthMonth + 12) % 12);

  const newEntry: LifeBiographyEntry = {
    id: `bio_${state.simulationTick}_${Math.random().toString(36).substring(7)}`,
    ageYears: state.character.age,
    ageMonths: ageMonthsCalculated,
    month: state.currentMonth,
    year: state.currentYear,
    ...entry
  };

  life.biography.unshift(newEntry);
  if (life.biography.length > 100) {
    life.biography = life.biography.slice(0, 100);
  }
}

export function advanceMonthlyLife(state: GameState): {
  monthlyEvents: LifeEvent[];
  monthlyNews: NewsItem[];
  biographyEntries: LifeBiographyEntry[];
} {
  const life = ensureLifeSystemState(state);
  const events: LifeEvent[] = [];
  const news: NewsItem[] = [];
  const bioEntries: LifeBiographyEntry[] = [];

  const timeBudget = calculateMonthlyTimeBudget(life.timeAllocation);

  // 1. RESOLVE THE NINE-CATEGORY 720-HOUR LIFE OPERATING SYSTEM
  const totals = getLifeAllocationTotals(life.timeAllocation);
  const diminishing = (hours: number, scale: number) => 1 - Math.exp(-Math.max(0, hours) / scale);
  const characterDiscipline = (life.personality.discipline || 50) / 100;
  const characterLeadership = (life.personality.leadership || 50) / 100;
  const characterSociability = (life.personality.sociability || 50) / 100;

  if (timeBudget.burnoutRisk === 'Critical') {
    state.character.attributes.stress = Math.min(100, state.character.attributes.stress + 8);
    state.character.attributes.health = Math.max(10, state.character.attributes.health - 3);
    state.character.attributes.happiness = Math.max(5, state.character.attributes.happiness - 5);
  } else if (timeBudget.burnoutRisk === 'Severe') {
    state.character.attributes.stress = Math.min(100, state.character.attributes.stress + 4);
    state.character.attributes.health = Math.max(10, state.character.attributes.health - 1.5);
  } else if (timeBudget.burnoutRisk === 'None') {
    state.character.attributes.stress = Math.max(0, state.character.attributes.stress - 2);
  }

  // Career: productivity/work performance uses diminishing returns and existing ability.
  if (state.currentJob) {
    const careerImpact = diminishing(totals.career, 105) * (0.7 + characterDiscipline * 0.3);
    const performanceDelta = careerImpact * 7 + (state.character.attributes.intelligence - 50) * 0.018 - Math.max(0, state.character.attributes.stress - 70) * 0.06;
    state.currentJob.performance = Math.max(20, Math.min(100, state.currentJob.performance + performanceDelta));
    const contracted = Math.min(160, totals.career);
    const overtime = Math.max(0, totals.career - contracted);
    if (overtime > 0) {
      const hourlyRate = state.currentJob.monthlySalary / 160;
      const overtimePay = Math.round(overtime * hourlyRate * 0.5);
      state.finances.cash += overtimePay;
      state.character.attributes.stress = Math.min(100, state.character.attributes.stress + overtime * 0.035);
    }
  }

  // Education: intelligence growth is intentionally small and saturating.
  const educationImpact = diminishing(totals.education, 85);
  state.character.attributes.intelligence = Math.min(100, state.character.attributes.intelligence + educationImpact * (0.45 + characterDiscipline * 0.45));

  // Family / partner / friends: apply to actual NPC relationships rather than global scores.
  const familyImpact = diminishing(totals.family, 70);
  const partnerImpact = diminishing(totals.partner, 65);
  const friendsImpact = diminishing(totals.friends, 60);
  state.relationships.forEach(rel => {
    if (['Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter'].includes(rel.relation)) {
      rel.love = Math.max(0, Math.min(100, rel.love + familyImpact * 1.7 - (totals.family < 12 ? 0.6 : 0)));
      rel.trust = Math.max(0, Math.min(100, rel.trust + familyImpact * 1.2));
    }
    if (['Spouse', 'Partner'].includes(rel.relation)) {
      rel.love = Math.max(0, Math.min(100, rel.love + partnerImpact * 2.2 - (totals.partner < 12 ? 0.8 : 0)));
      rel.trust = Math.max(0, Math.min(100, rel.trust + partnerImpact * 1.4));
    }
    if (rel.relation === 'Friend') {
      rel.respect = Math.max(0, Math.min(100, rel.respect + friendsImpact * 1.0));
      rel.loyalty = Math.max(0, Math.min(100, rel.loyalty + friendsImpact * 0.8));
    }
  });

  // Wellness and hobbies influence health/happiness while preventing infinite grinding.
  const wellnessImpact = diminishing(totals.wellness, 80);
  const hobbyImpact = diminishing(totals.hobbies, 75);
  state.character.attributes.health = Math.min(100, state.character.attributes.health + wellnessImpact * 3.2 + hobbyImpact * 0.7);
  state.character.attributes.happiness = Math.min(100, state.character.attributes.happiness + wellnessImpact * 1.8 + hobbyImpact * 2.2 + partnerImpact * 0.5);
  state.character.attributes.stress = Math.max(0, state.character.attributes.stress - wellnessImpact * 5.5 - hobbyImpact * 1.8);

  // Social media: followers are influenced by time, reputation, content quality and existing audience.
  const socialImpact = diminishing(totals.socialMedia, 55);
  Object.values(life.socialAccounts).forEach(acc => {
    const audienceScale = 1 + Math.log10(Math.max(10, acc.followers)) * 0.04;
    const quality = 0.65 + (state.character.attributes.charm / 200) + (state.character.attributes.reputation / 400);
    const naturalDelta = Math.max(0, Math.round(180 * socialImpact * audienceScale * quality * (0.85 + Math.random() * 0.3)));
    acc.followers += naturalDelta;
    if (acc.monetized && acc.followers > 10000) {
      const adRevenue = Math.round((acc.followers / 1000) * 12);
      acc.monthlyAdRevenue = adRevenue;
      state.finances.cash += adRevenue;
    }
  });

  // Entrepreneurship is a management input only. Corporate fundamentals and the world engine remain decisive.
  if (totals.entrepreneurship >= 1) {
    const entrepreneurshipImpact = diminishing(totals.entrepreneurship, 110) * (0.65 + characterLeadership * 0.35);
    const ownedCompanies = state.companies.filter(c => c.playerOwnershipPercentage >= 50);
    ownedCompanies.forEach(company => {
      company.employeeProductivity = Math.min(100, company.employeeProductivity + entrepreneurshipImpact * 1.2);
      company.brandReputation = Math.min(100, company.brandReputation + entrepreneurshipImpact * 0.5);
    });
  }

  // 2. WORKPLACE SOCIAL DYNAMICS
  if (state.currentJob && life.workplace) {
    const relationshipIntensity = diminishing(Math.min(totals.career, 180), 90);
    life.workplace.managerTrust = Math.min(100, life.workplace.managerTrust + relationshipIntensity * 1.2);
    life.workplace.managerPerception = Math.min(100, life.workplace.managerPerception + relationshipIntensity * 0.8);
    life.workplace.teamPerformance = Math.min(100, life.workplace.teamPerformance + relationshipIntensity * 0.8);
    life.workplace.teamMorale = Math.min(100, life.workplace.teamMorale + relationshipIntensity * 0.5);
    life.workplace.colleagues.forEach(colleague => {
      colleague.relationshipWithPlayer = Math.min(100, colleague.relationshipWithPlayer + relationshipIntensity * (0.6 + characterSociability * 0.4));
      colleague.trust = Math.min(100, colleague.trust + relationshipIntensity * 0.35);
    });
  }

  // 4. UNIVERSITY & ACADEMIC PROGRESS
  // Check pending applications
  life.universityApplications.forEach(app => {
    if (app.status === 'Pending') {
      const uni = UNIVERSITIES_CATALOG.find(u => u.id === app.universityId);
      const prog = uni?.programs.find(p => p.id === app.programId);
      if (uni && prog) {
        const intelScore = state.character.attributes.intelligence;
        const repScore = state.character.attributes.reputation;
        const totalApplicantScore = (intelScore * 0.7) + (repScore * 0.3) + (Math.random() * 15 - 7.5);

        if (totalApplicantScore >= uni.admissionDifficulty) {
          app.status = 'Accepted';
          if (totalApplicantScore >= uni.admissionDifficulty + 12) {
            app.status = 'Scholarship Offered';
            app.scholarshipAmountMonthly = Math.round(prog.tuitionPerMonth * 0.5);
          }

          events.push({
            id: `ev_uni_admit_${state.simulationTick}`,
            timestampMonth: state.currentMonth,
            timestampYear: state.currentYear,
            age: state.character.age,
            category: 'Life',
            title: `Admitted to ${uni.name}! 🏛️`,
            description: `Your application to the ${prog.name} program at ${uni.name} has been officially accepted!`,
            consequences: {
              reputationChange: +5,
              happinessChange: +8,
              details: [app.status === 'Scholarship Offered' ? `Awarded a merit scholarship of $${app.scholarshipAmountMonthly?.toLocaleString()}/month!` : 'Ready for enrollment.']
            }
          });
        } else {
          app.status = 'Rejected';
          events.push({
            id: `ev_uni_rej_${state.simulationTick}`,
            timestampMonth: state.currentMonth,
            timestampYear: state.currentYear,
            age: state.character.age,
            category: 'Life',
            title: `Admission Decision from ${uni.name}`,
            description: `Due to highly competitive quotas, ${uni.name} was unable to offer admission for ${prog.name}.`,
            consequences: {
              happinessChange: -2,
              details: ['You can reapply after boosting your intelligence and credentials.']
            }
          });
        }
      }
    }
  });

  // Current enrolled degree GPA and academic standing progression
  if (life.currentDegreeStatus) {
    const studyHours = totals.education;
    const gpaDelta = (studyHours >= 20 ? 0.05 : (studyHours >= 10 ? 0.01 : -0.05));
    life.currentDegreeStatus.gpa = Math.min(4.0, Math.max(1.5, Math.round((life.currentDegreeStatus.gpa + gpaDelta) * 100) / 100));
    
    if (life.currentDegreeStatus.gpa >= 3.8) {
      life.currentDegreeStatus.academicStanding = 'Distinction';
    } else if (life.currentDegreeStatus.gpa < 2.0) {
      life.currentDegreeStatus.academicStanding = 'Academic Probation';
    } else {
      life.currentDegreeStatus.academicStanding = 'Good Standing';
    }
  }

  // 5. RELATIONSHIPS & ROMANCE
  if (life.timeAllocation.familyHours < 4) {
    state.relationships.forEach(rel => {
      if (['Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter'].includes(rel.relation)) {
        rel.love = Math.max(20, rel.love - 1);
      }
    });
  } else if (life.timeAllocation.familyHours >= 16) {
    state.relationships.forEach(rel => {
      if (['Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter'].includes(rel.relation)) {
        rel.love = Math.min(100, rel.love + 1);
        rel.trust = Math.min(100, rel.trust + 1);
      }
    });
  }

  if (life.timeAllocation.datingHours >= 8) {
    state.relationships.forEach(rel => {
      if (['Spouse', 'Partner'].includes(rel.relation)) {
        rel.love = Math.min(100, rel.love + 2);
        rel.trust = Math.min(100, rel.trust + 1);
      }
    });
  }

  // 6. SOCIAL MEDIA FOLLOWER & VIRALITY PASS
  if (life.timeAllocation.socialMediaHours > 0) {
    const hours = life.timeAllocation.socialMediaHours;
    const charisma = state.character.attributes.charm;
    const reputation = state.character.attributes.reputation;
    
    Object.values(life.socialAccounts).forEach(acc => {
      const baseGrowth = Math.round((hours * 8) * (1 + charisma / 100) * (1 + reputation / 200));
      const naturalDelta = Math.round(baseGrowth * (0.8 + Math.random() * 0.4));
      acc.followers += naturalDelta;

      // Monetization revenue
      if (acc.monetized && acc.followers > 10000) {
        const adRevenue = Math.round((acc.followers / 1000) * 12);
        acc.monthlyAdRevenue = adRevenue;
        state.finances.cash += adRevenue;
      }
    });
  }

  // World Marketplace: preserve owned possessions while refreshing store/dealership offers every simulation tick.
  ensureWorldMarketplace(state);
  refreshWorldMarketplace(state);

  // 7. MARKETPLACE ASSETS MAINTENANCE & DEPRECIATION
  let totalAssetMaintenance = 0;
  life.marketplaceInventory.forEach(item => {
    if (item.purchased) {
      totalAssetMaintenance += item.monthlyMaintenance;
      // Monthly depreciation / appreciation
      const monthlyDeprFactor = (item.depreciationAnnualRate / 100) / 12;
      item.resaleValue = Math.max(100, Math.round(item.resaleValue * (1 - monthlyDeprFactor)));
    }
  });

  if (totalAssetMaintenance > 0) {
    state.finances.cash -= totalAssetMaintenance;
  }

  return {
    monthlyEvents: events,
    monthlyNews: news,
    biographyEntries: bioEntries
  };
}

// Interaction Handlers
export function purchaseMarketplaceAsset(state: GameState, assetId: string): { success: boolean; message: string } {
  const life = ensureLifeSystemState(state);
  const asset = life.marketplaceInventory.find(a => a.id === assetId);
  if (!asset) return { success: false, message: 'Asset not found in marketplace catalog.' };
  if (asset.purchased) return { success: false, message: 'You already own this item.' };
  if (state.finances.cash < asset.purchasePrice) {
    return { success: false, message: `Insufficient funds. Cost: $${asset.purchasePrice.toLocaleString()}, available cash: $${state.finances.cash.toLocaleString()}` };
  }

  state.finances.cash -= asset.purchasePrice;
  asset.purchased = true;
  asset.purchasedMonth = state.currentMonth;
  asset.purchasedYear = state.currentYear;
  asset.isEquippedOrActive = true;

  // Boost prestige & happiness
  state.character.attributes.happiness = Math.min(100, state.character.attributes.happiness + 8);
  state.character.attributes.reputation = Math.min(100, state.character.attributes.reputation + Math.round(asset.prestigeScore * 0.15));

  recordLifeBiography(state, {
    category: 'Lifestyle',
    title: `Acquired ${asset.name}`,
    description: `Purchased ${asset.brand} ${asset.name} for $${asset.purchasePrice.toLocaleString()}.`,
    iconName: asset.category === 'Vehicles' ? 'Car' : (asset.category === 'Fashion' ? 'Shirt' : 'Sparkles'),
    significance: asset.purchasePrice > 500000 ? 'Major' : (asset.purchasePrice > 50000 ? 'Notable' : 'Minor')
  });

  return { success: true, message: `Successfully acquired ${asset.name} for $${asset.purchasePrice.toLocaleString()}!` };
}

export function sellMarketplaceAsset(state: GameState, assetId: string): { success: boolean; cashReceived: number; message: string } {
  const life = ensureLifeSystemState(state);
  const asset = life.marketplaceInventory.find(a => a.id === assetId);
  if (!asset || !asset.purchased) return { success: false, cashReceived: 0, message: 'You do not own this item.' };

  const cashReceived = asset.resaleValue;
  state.finances.cash += cashReceived;
  asset.purchased = false;
  asset.isEquippedOrActive = false;

  return { success: true, cashReceived, message: `Sold ${asset.name} for $${cashReceived.toLocaleString()}.` };
}

export function applyToUniversity(state: GameState, universityId: string, programId: string): { success: boolean; message: string } {
  const life = ensureLifeSystemState(state);
  const uni = UNIVERSITIES_CATALOG.find(u => u.id === universityId);
  const prog = uni?.programs.find(p => p.id === programId);
  if (!uni || !prog) return { success: false, message: 'Invalid university or degree program selected.' };

  const existingApp = life.universityApplications.find(a => a.universityId === universityId && a.programId === programId && a.status === 'Pending');
  if (existingApp) return { success: false, message: 'You already have an active application under review.' };

  const applicationFee = 150;
  if (state.finances.cash < applicationFee) {
    return { success: false, message: `Insufficient cash for the $${applicationFee} application fee.` };
  }
  state.finances.cash -= applicationFee;

  const newApp: UniversityApplication = {
    id: `app_${state.simulationTick}_${Math.random().toString(36).substring(7)}`,
    universityId,
    programId,
    appliedMonth: state.currentMonth,
    appliedYear: state.currentYear,
    status: 'Pending',
    decisionMonth: (state.currentMonth % 12) + 1,
    decisionYear: state.currentMonth === 12 ? state.currentYear + 1 : state.currentYear
  };

  life.universityApplications.unshift(newApp);
  return { success: true, message: `Application submitted to ${uni.name} for ${prog.name}. Admissions committee decision expected next month.` };
}

export function enrollInAcceptedProgram(state: GameState, applicationId: string): { success: boolean; message: string } {
  const life = ensureLifeSystemState(state);
  const app = life.universityApplications.find(a => a.id === applicationId);
  if (!app || (app.status !== 'Accepted' && app.status !== 'Scholarship Offered')) {
    return { success: false, message: 'Cannot enroll: application not accepted.' };
  }

  const uni = UNIVERSITIES_CATALOG.find(u => u.id === app.universityId);
  const prog = uni?.programs.find(p => p.id === app.programId);
  if (!uni || !prog) return { success: false, message: 'Program details not found.' };

  // Create new EducationRecord in GameState.education
  const tuitionFinal = Math.max(0, prog.tuitionPerMonth - (app.scholarshipAmountMonthly || 0));
  state.education.push({
    id: `edu_${state.simulationTick}_${Math.random().toString(36).substring(7)}`,
    institution: uni.name,
    qualification: prog.degreeLevel,
    field: prog.field,
    startAge: state.character.age,
    durationMonths: prog.durationMonths,
    monthsCompleted: 0,
    tuitionPerMonth: tuitionFinal,
    completed: false,
    gradeAverage: 88
  });

  life.currentDegreeStatus = {
    universityId: uni.id,
    programId: prog.id,
    gpa: 3.8,
    studyHoursMonthly: 15,
    extracurriculars: ['Honors Society', 'Student Consulting Guild'],
    academicStanding: 'Distinction'
  };

  // Adjust education hours in schedule
  life.timeAllocation.educationHours = 20;
  life.timeAllocation.studyHours = 15;

  recordLifeBiography(state, {
    category: 'Education',
    title: `Enrolled at ${uni.name}`,
    description: `Commenced ${prog.name} studies.`,
    iconName: 'GraduationCap',
    significance: 'Major'
  });

  return { success: true, message: `Successfully matriculated into ${prog.name} at ${uni.name}!` };
}

export function performWellnessAction(state: GameState, activityId: string): { success: boolean; message: string } {
  const activity = WELLNESS_ACTIVITIES_CATALOG.find(w => w.id === activityId);
  if (!activity) return { success: false, message: 'Activity not found.' };
  if (state.finances.cash < activity.cost) {
    return { success: false, message: `Insufficient cash ($${activity.cost} required).` };
  }

  state.finances.cash -= activity.cost;
  state.character.attributes.health = Math.min(100, Math.max(0, state.character.attributes.health + activity.healthDelta));
  state.character.attributes.happiness = Math.min(100, Math.max(0, state.character.attributes.happiness + activity.happinessDelta));
  state.character.attributes.stress = Math.min(100, Math.max(0, state.character.attributes.stress + activity.stressDelta));
  if (activity.attractivenessDelta) state.character.attributes.attractiveness = Math.min(100, state.character.attributes.attractiveness + activity.attractivenessDelta);
  if (activity.charmDelta) state.character.attributes.charm = Math.min(100, state.character.attributes.charm + activity.charmDelta);

  return { success: true, message: `Completed ${activity.name}! Feel rejuvenated and focused.` };
}

export function publishSocialMediaPost(
  state: GameState, 
  platform: SocialPlatformType, 
  content: string, 
  topic: string
): { success: boolean; likes: number; shares: number; followersGain: number; isViral: boolean } {
  const life = ensureLifeSystemState(state);
  const account = life.socialAccounts[platform];
  if (!account) return { success: false, likes: 0, shares: 0, followersGain: 0, isViral: false };

  const charisma = state.character.attributes.charm;
  const intellect = state.character.attributes.intelligence;
  const baseReach = Math.round(account.followers * (account.engagementRate / 100));
  
  const viralityRoll = Math.random() * 100;
  const isViral = viralityRoll > 90 || (charisma > 85 && viralityRoll > 75);

  const multiplier = isViral ? (5 + Math.random() * 10) : (0.8 + Math.random() * 0.6);
  const likes = Math.round(Math.max(12, baseReach * 0.6 * multiplier));
  const shares = Math.round(Math.max(2, baseReach * 0.12 * multiplier));
  const followersGain = isViral ? Math.round(likes * 0.4) : Math.round(likes * 0.08);

  account.followers += followersGain;

  const newPost = {
    id: `post_${state.simulationTick}_${Math.random().toString(36).substring(7)}`,
    platform,
    month: state.currentMonth,
    year: state.currentYear,
    content,
    topic,
    likes,
    shares,
    commentsCount: Math.round(likes * 0.15),
    reach: Math.round(likes * 2.5),
    isViral,
    sentiment: 'Positive' as const
  };

  life.socialPosts.unshift(newPost);
  if (life.socialPosts.length > 50) life.socialPosts.pop();

  return { success: true, likes, shares, followersGain, isViral };
}
