import { 
  GameState, 
  GameObjective, 
  ObjectiveCategory, 
  ObjectiveStatus, 
  ObjectiveSubGoal, 
  CampaignDefinition, 
  LifeEvent 
} from '../types';
import { calculateNetWorth } from './simulationEngine';
import { getLifeTierRank, LIFE_TIER_DEFINITIONS } from './lifeProgressionEngine';

// Utility helper to format currency
export function formatCurrency(amount: number): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  if (Math.abs(safeAmount) >= 1_000_000_000) {
    return `$${(safeAmount / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(safeAmount) >= 1_000_000) {
    return `$${(safeAmount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(safeAmount) >= 1_000) {
    return `$${(safeAmount / 1_000).toFixed(0)}k`;
  }
  return `$${Math.round(safeAmount).toLocaleString()}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ---------------------------------------------------------------------------
// 1. ALL DYNAMIC OBJECTIVES DEFINITIONS & REAL-TIME EVALUATORS
// ---------------------------------------------------------------------------

export function evaluateAllObjectives(state: GameState): GameObjective[] {
  const netWorth = calculateNetWorth(state);
  const completedIds = new Set(state.completedObjectiveIds || []);
  const claimedIds = new Set(state.claimedObjectiveRewardIds || []);

  const objectives: GameObjective[] = [];

  // 1. THE ENTREPRENEUR: Reach $100M net worth
  const entrepreneurTarget = 100_000_000;
  const entrepreneurCurrent = Math.max(0, netWorth);
  const entrepreneurPct = clamp(Math.round((entrepreneurCurrent / entrepreneurTarget) * 100), 0, 100);
  const entrepreneurStatus: ObjectiveStatus = entrepreneurCurrent >= entrepreneurTarget ? 'Completed' : 'In Progress';
  objectives.push({
    id: 'obj_entrepreneur',
    title: 'THE ENTREPRENEUR',
    tagline: 'Capitalist Visionary',
    category: 'Wealth',
    description: 'Amass a personal fortune through strategic investments, enterprise valuation, and financial leverage.',
    targetGoal: 'Reach $100M Net Worth',
    iconName: 'DollarSign',
    currentValue: entrepreneurCurrent,
    targetValue: entrepreneurTarget,
    formattedCurrent: formatCurrency(entrepreneurCurrent),
    formattedTarget: '$100.0M',
    unit: '$',
    percentage: entrepreneurPct,
    status: entrepreneurStatus,
    rewardClaimed: claimedIds.has('obj_entrepreneur'),
    rewardDescription: '+15 World Influence, +10 Reputation, Wall Street Icon Status'
  });

  // 2. THE TYCOON: Own 10 companies
  const ownedCompaniesCount = state.companies.filter(c => c.playerOwnershipPercentage > 0).length;
  const tycoonTarget = 10;
  const tycoonPct = clamp(Math.round((ownedCompaniesCount / tycoonTarget) * 100), 0, 100);
  const tycoonStatus: ObjectiveStatus = ownedCompaniesCount >= tycoonTarget ? 'Completed' : 'In Progress';
  objectives.push({
    id: 'obj_tycoon',
    title: 'THE TYCOON',
    tagline: 'Conglomerate Architect',
    category: 'Business',
    description: 'Build a diversified holding conglomerate by establishing and acquiring active operating corporations.',
    targetGoal: 'Own 10 Active Companies',
    iconName: 'Building2',
    currentValue: ownedCompaniesCount,
    targetValue: tycoonTarget,
    formattedCurrent: `${ownedCompaniesCount} / 10`,
    formattedTarget: '10 Companies',
    unit: 'companies',
    percentage: tycoonPct,
    status: tycoonStatus,
    rewardClaimed: claimedIds.has('obj_tycoon'),
    rewardDescription: '+20 Business Influence, Corporate Syndicate Access'
  });

  // 3. THE INDUSTRIALIST: Complete 5 major projects
  const completedProjectsCount = state.projects.filter(p => p.completed).length;
  const industrialistTarget = 5;
  const industrialistPct = clamp(Math.round((completedProjectsCount / industrialistTarget) * 100), 0, 100);
  const industrialistStatus: ObjectiveStatus = completedProjectsCount >= industrialistTarget ? 'Completed' : 'In Progress';
  objectives.push({
    id: 'obj_industrialist',
    title: 'THE INDUSTRIALIST',
    tagline: 'Monumental Builder',
    category: 'Projects',
    description: 'Commission and successfully complete monumental skyscrapers, innovation centers, and infrastructure campuses.',
    targetGoal: 'Complete 5 Major Megaprojects',
    iconName: 'Layers',
    currentValue: completedProjectsCount,
    targetValue: industrialistTarget,
    formattedCurrent: `${completedProjectsCount} / 5`,
    formattedTarget: '5 Projects',
    unit: 'projects',
    percentage: industrialistPct,
    status: industrialistStatus,
    rewardClaimed: claimedIds.has('obj_industrialist'),
    rewardDescription: '+15 Reputation, +10 Public Influence, Landmark Builder Laurels'
  });

  // 4. THE POLITICIAN: Win political office
  const isInElectedOffice = state.politics.currentOffice.inOffice && 
    state.politics.currentOffice.title !== 'Citizen' && 
    state.politics.currentOffice.title !== 'Party Member' &&
    state.politics.currentOffice.title !== 'Campaign Candidate';
  const pastElectedOfficesCount = (state.politics.pastOffices || []).filter(o => 
    !o.includes('Citizen') && !o.includes('Candidate')
  ).length;
  const politicianCurrent = (isInElectedOffice || pastElectedOfficesCount > 0) ? 1 : 0;
  const politicianTarget = 1;
  const politicianPct = politicianCurrent >= 1 ? 100 : 0;
  const politicianStatus: ObjectiveStatus = politicianCurrent >= politicianTarget ? 'Completed' : 'In Progress';
  const currentOfficeLabel = isInElectedOffice 
    ? state.politics.currentOffice.title 
    : (pastElectedOfficesCount > 0 ? `Past: ${state.politics.pastOffices[0]}` : 'Private Citizen');
  objectives.push({
    id: 'obj_politician',
    title: 'THE POLITICIAN',
    tagline: 'Elected Statesman',
    category: 'Politics',
    description: 'Mount a political campaign, secure public votes, and win election to high municipal or national governance.',
    targetGoal: 'Win Elected Political Office',
    iconName: 'Landmark',
    currentValue: politicianCurrent,
    targetValue: politicianTarget,
    formattedCurrent: currentOfficeLabel,
    formattedTarget: 'Elected Office Won',
    percentage: politicianPct,
    status: politicianStatus,
    rewardClaimed: claimedIds.has('obj_politician'),
    rewardDescription: '+25 Political Capital, State Patronage Privileges'
  });

  // 5. THE GLOBALIST: Build an international empire
  // Multi-country analysis
  const distinctCompanyCountries = new Set(
    state.companies.map(c => c.country).filter(Boolean)
  );
  const distinctPropertyCountries = new Set(
    state.finances.properties.map(p => p.country).filter(Boolean)
  );
  const allCountriesWithPresence = new Set([
    ...Array.from(distinctCompanyCountries),
    ...Array.from(distinctPropertyCountries),
    state.character.residenceCountry
  ]);
  const foreignAssetsCount = allCountriesWithPresence.size;
  const globalTargetCountries = 3;
  const globalTargetAssets = 50_000_000;
  const globalTargetInfluence = 70;

  const currentGlobalInfluence = Math.round(state.character.attributes.worldInfluence || 0);

  const subGoalCountries: ObjectiveSubGoal = {
    id: 'sg_global_countries',
    title: 'Footprint Across 3+ Sovereign Nations',
    currentValue: foreignAssetsCount,
    targetValue: globalTargetCountries,
    formattedCurrent: `${foreignAssetsCount} / 3 countries`,
    formattedTarget: '3 Nations',
    percentage: clamp(Math.round((foreignAssetsCount / globalTargetCountries) * 100), 0, 100),
    isCompleted: foreignAssetsCount >= globalTargetCountries,
    status: foreignAssetsCount >= globalTargetCountries ? 'Completed' : 'In Progress'
  };

  const subGoalNetWorth: ObjectiveSubGoal = {
    id: 'sg_global_wealth',
    title: 'Global Net Worth ($50M+)',
    currentValue: Math.max(0, netWorth),
    targetValue: globalTargetAssets,
    formattedCurrent: formatCurrency(netWorth),
    formattedTarget: '$50.0M',
    percentage: clamp(Math.round((Math.max(0, netWorth) / globalTargetAssets) * 100), 0, 100),
    isCompleted: netWorth >= globalTargetAssets,
    status: netWorth >= globalTargetAssets ? 'Completed' : 'In Progress'
  };

  const subGoalInfluence: ObjectiveSubGoal = {
    id: 'sg_global_influence',
    title: 'World Influence (70+)',
    currentValue: currentGlobalInfluence,
    targetValue: globalTargetInfluence,
    formattedCurrent: `${currentGlobalInfluence} / 70`,
    formattedTarget: '70 Influence',
    percentage: clamp(Math.round((currentGlobalInfluence / globalTargetInfluence) * 100), 0, 100),
    isCompleted: currentGlobalInfluence >= globalTargetInfluence,
    status: currentGlobalInfluence >= globalTargetInfluence ? 'Completed' : 'In Progress'
  };

  const globalistSubGoals = [subGoalCountries, subGoalNetWorth, subGoalInfluence];
  const globalistAvgPct = Math.round(
    globalistSubGoals.reduce((sum, g) => sum + g.percentage, 0) / globalistSubGoals.length
  );
  const isGlobalistCompleted = globalistSubGoals.every(g => g.isCompleted);
  objectives.push({
    id: 'obj_globalist',
    title: 'THE GLOBALIST',
    tagline: 'Multinational Sovereign',
    category: 'Global',
    description: 'Expand your corporate and real estate assets internationally across multiple sovereign borders.',
    targetGoal: 'Build an International Empire Across 3+ Nations',
    iconName: 'Globe',
    currentValue: foreignAssetsCount,
    targetValue: globalTargetCountries,
    formattedCurrent: `${foreignAssetsCount} Nations (${formatCurrency(netWorth)})`,
    formattedTarget: '3 Nations & $50M',
    unit: 'nations',
    percentage: globalistAvgPct,
    status: isGlobalistCompleted ? 'Completed' : 'In Progress',
    subGoals: globalistSubGoals,
    rewardClaimed: claimedIds.has('obj_globalist'),
    rewardDescription: '+20 World Influence, Global Sovereign Passport Privileges'
  });

  // 6. THE PHILANTHROPIST: Donate $50M
  const lifetimeDonations = state.lifetimePhilanthropy || 0;
  const philanthropistTarget = 50_000_000;
  const philanthropistPct = clamp(Math.round((lifetimeDonations / philanthropistTarget) * 100), 0, 100);
  const philanthropistStatus: ObjectiveStatus = lifetimeDonations >= philanthropistTarget ? 'Completed' : 'In Progress';
  objectives.push({
    id: 'obj_philanthropist',
    title: 'THE PHILANTHROPIST',
    tagline: 'Altruistic Benefactor',
    category: 'Philanthropy',
    description: 'Bestow substantial wealth onto scientific research institutes, public healthcare, education funds, and global charity foundations.',
    targetGoal: 'Donate $50M to Charitable Causes',
    iconName: 'Heart',
    currentValue: lifetimeDonations,
    targetValue: philanthropistTarget,
    formattedCurrent: formatCurrency(lifetimeDonations),
    formattedTarget: '$50.0M',
    unit: '$',
    percentage: philanthropistPct,
    status: philanthropistStatus,
    rewardClaimed: claimedIds.has('obj_philanthropist'),
    rewardDescription: '+25 Public Reputation, +15 Happiness, Global Humanitarian Medal'
  });

  // 7. THE DYNASTY: Successfully complete 4 generations
  const currentGen = state.dynastyGeneration || (state.dynastyProfile?.currentGeneration || 1);
  const successionCount = state.dynastyProfile?.successionHistory?.length || (currentGen - 1);
  const dynastyTarget = 4;
  const dynastyPct = clamp(Math.round((currentGen / dynastyTarget) * 100), 0, 100);
  const dynastyStatus: ObjectiveStatus = currentGen >= dynastyTarget ? 'Completed' : 'In Progress';
  objectives.push({
    id: 'obj_dynasty',
    title: 'THE DYNASTY',
    tagline: 'Generational Patriarch',
    category: 'Dynasty',
    description: 'Establish unbroken dynastic continuity across four generations, safeguarding family assets and corporate control through heirs.',
    targetGoal: 'Successfully Complete 4 Generations',
    iconName: 'Crown',
    currentValue: currentGen,
    targetValue: dynastyTarget,
    formattedCurrent: `Gen ${currentGen} (${successionCount} successions)`,
    formattedTarget: '4 Generations',
    unit: 'generations',
    percentage: dynastyPct,
    status: dynastyStatus,
    rewardClaimed: claimedIds.has('obj_dynasty'),
    rewardDescription: '+30 Dynasty Prestige, Gilded Imperial Heritage Crest'
  });

  // 8. THE BALANCED LIFE: High health, high family relationships, high wealth, high reputation
  const currentHealth = Math.round(state.character.attributes.health || 0);
  const currentRep = Math.round(state.character.attributes.reputation || 0);
  
  // Calculate Family Harmony / Average Relationship score
  const livingFamily = state.relationships.filter(r => r.alive);
  const avgFamilyTrust = livingFamily.length > 0
    ? Math.round(livingFamily.reduce((sum, r) => sum + ((r.trust + r.love) / 2), 0) / livingFamily.length)
    : 70;

  const targetHealth = 85;
  const targetFamily = 85;
  const targetWealth = 10_000_000;
  const targetRep = 85;

  const subGoalHealth: ObjectiveSubGoal = {
    id: 'sg_balanced_health',
    title: 'High Health Conditioning (85+)',
    currentValue: currentHealth,
    targetValue: targetHealth,
    formattedCurrent: `${currentHealth} / 85`,
    formattedTarget: '85 Health',
    percentage: clamp(Math.round((currentHealth / targetHealth) * 100), 0, 100),
    isCompleted: currentHealth >= targetHealth,
    status: currentHealth >= targetHealth ? 'Completed' : 'In Progress'
  };

  const subGoalFamily: ObjectiveSubGoal = {
    id: 'sg_balanced_family',
    title: 'High Family Harmony & Trust (85+)',
    currentValue: avgFamilyTrust,
    targetValue: targetFamily,
    formattedCurrent: `${avgFamilyTrust} / 85`,
    formattedTarget: '85 Harmony',
    percentage: clamp(Math.round((avgFamilyTrust / targetFamily) * 100), 0, 100),
    isCompleted: avgFamilyTrust >= targetFamily,
    status: avgFamilyTrust >= targetFamily ? 'Completed' : 'In Progress'
  };

  const subGoalWealth: ObjectiveSubGoal = {
    id: 'sg_balanced_wealth',
    title: 'High Financial Wealth ($10M+)',
    currentValue: Math.max(0, netWorth),
    targetValue: targetWealth,
    formattedCurrent: formatCurrency(netWorth),
    formattedTarget: '$10.0M',
    percentage: clamp(Math.round((Math.max(0, netWorth) / targetWealth) * 100), 0, 100),
    isCompleted: netWorth >= targetWealth,
    status: netWorth >= targetWealth ? 'Completed' : 'In Progress'
  };

  const subGoalRep: ObjectiveSubGoal = {
    id: 'sg_balanced_rep',
    title: 'High Public Reputation (85+)',
    currentValue: currentRep,
    targetValue: targetRep,
    formattedCurrent: `${currentRep} / 85`,
    formattedTarget: '85 Reputation',
    percentage: clamp(Math.round((currentRep / targetRep) * 100), 0, 100),
    isCompleted: currentRep >= targetRep,
    status: currentRep >= targetRep ? 'Completed' : 'In Progress'
  };

  const balancedSubGoals = [subGoalHealth, subGoalFamily, subGoalWealth, subGoalRep];
  const balancedAvgPct = Math.round(
    balancedSubGoals.reduce((sum, g) => sum + g.percentage, 0) / balancedSubGoals.length
  );
  const isBalancedCompleted = balancedSubGoals.every(g => g.isCompleted);

  objectives.push({
    id: 'obj_balanced_life',
    title: 'THE BALANCED LIFE',
    tagline: 'Harmonious Master',
    category: 'Lifestyle',
    description: 'Attain true holistic mastery by excelling equally in physical vitality, deep familial devotion, financial prosperity, and esteemed reputation.',
    targetGoal: 'Achieve Health 85+, Family Harmony 85+, Wealth $10M+, Reputation 85+',
    iconName: 'Sparkles',
    currentValue: balancedAvgPct,
    targetValue: 100,
    formattedCurrent: `${balancedAvgPct}% Harmony`,
    formattedTarget: '100% Balanced',
    percentage: balancedAvgPct,
    status: isBalancedCompleted ? 'Completed' : 'In Progress',
    subGoals: balancedSubGoals,
    rewardClaimed: claimedIds.has('obj_balanced_life'),
    rewardDescription: '+20 Happiness, -15 Stress Baseline, Serene Master of Fate Title'
  });

  // 9. Additional Thematic Objectives
  // THE UNICORN BUILDER
  const maxCompanyValuation = Math.max(0, ...state.companies.map(c => c.valuation));
  const unicornTarget = 1_000_000_000;
  const unicornPct = clamp(Math.round((maxCompanyValuation / unicornTarget) * 100), 0, 100);
  objectives.push({
    id: 'obj_unicorn',
    title: 'THE UNICORN BUILDER',
    tagline: 'Billion-Dollar Enterprise',
    category: 'Business',
    description: 'Grow an individual operating corporation to over $1,000,000,000 in market valuation.',
    targetGoal: 'Build a $1B+ Valuation Company',
    iconName: 'Zap',
    currentValue: maxCompanyValuation,
    targetValue: unicornTarget,
    formattedCurrent: formatCurrency(maxCompanyValuation),
    formattedTarget: '$1.0B',
    unit: '$',
    percentage: unicornPct,
    status: maxCompanyValuation >= unicornTarget ? 'Completed' : 'In Progress',
    rewardClaimed: claimedIds.has('obj_unicorn'),
    rewardDescription: '+15 Business Influence, Silicon Valley Vanguard Title'
  });

  // THE REAL ESTATE TITAN
  const totalPropertyValue = state.finances.properties.reduce((sum, p) => sum + p.currentValue, 0);
  const reTarget = 50_000_000;
  const rePct = clamp(Math.round((totalPropertyValue / reTarget) * 100), 0, 100);
  objectives.push({
    id: 'obj_real_estate',
    title: 'THE REAL ESTATE TITAN',
    tagline: 'Property Baron',
    category: 'Wealth',
    description: 'Acquire a premier portfolio of luxury residential villas, class-A commercial office towers, and shopping plazas.',
    targetGoal: 'Hold $50M in Real Estate Assets',
    iconName: 'Building',
    currentValue: totalPropertyValue,
    targetValue: reTarget,
    formattedCurrent: formatCurrency(totalPropertyValue),
    formattedTarget: '$50.0M',
    unit: '$',
    percentage: rePct,
    status: totalPropertyValue >= reTarget ? 'Completed' : 'In Progress',
    rewardClaimed: claimedIds.has('obj_real_estate'),
    rewardDescription: '+10% Rental Yield Efficiency, Master Landlord Status'
  });

  // THE HEAD OF STATE
  const isHeadOfState = state.politics.currentOffice.inOffice && 
    (state.politics.currentOffice.title.includes('President') || state.politics.currentOffice.title.includes('Prime Minister'));
  const hasEverBeenHeadOfState = isHeadOfState || (state.politics.pastOffices || []).some(o => 
    o.includes('President') || o.includes('Prime Minister')
  );
  objectives.push({
    id: 'obj_head_of_state',
    title: 'THE HEAD OF STATE',
    tagline: 'National Sovereign',
    category: 'Politics',
    description: 'Achieve supreme democratic or executive office as President or Prime Minister of your country.',
    targetGoal: 'Elected President or Prime Minister',
    iconName: 'Crown',
    currentValue: hasEverBeenHeadOfState ? 1 : 0,
    targetValue: 1,
    formattedCurrent: isHeadOfState ? 'Currently Serving' : (hasEverBeenHeadOfState ? 'Former Head of State' : 'Not Yet Elected'),
    formattedTarget: 'President / PM',
    percentage: hasEverBeenHeadOfState ? 100 : 0,
    status: hasEverBeenHeadOfState ? 'Completed' : 'In Progress',
    rewardClaimed: claimedIds.has('obj_head_of_state'),
    rewardDescription: '+35 World Influence, Executive Sovereign Authority'
  });

  // THE SPORTS CHAMPION
  const wonChampionship = (state.sports.ownedTeams || []).some(t => t.leaguePosition === 1) || 
    (state.sports.personalAthleteCareer?.championshipsWon || 0) > 0;
  objectives.push({
    id: 'obj_sports_champ',
    title: 'THE SPORTS CHAMPION',
    tagline: 'Trophy Collector',
    category: 'Sports',
    description: 'Lead an owned sports franchise or personal athletic career to a first-place league championship.',
    targetGoal: 'Win a Major League Sports Championship',
    iconName: 'Trophy',
    currentValue: wonChampionship ? 1 : 0,
    targetValue: 1,
    formattedCurrent: wonChampionship ? '1 Championship' : '0 Won',
    formattedTarget: '1 Championship',
    percentage: wonChampionship ? 100 : 0,
    status: wonChampionship ? 'Completed' : 'In Progress',
    rewardClaimed: claimedIds.has('obj_sports_champ'),
    rewardDescription: '+20 Fan Base Morale, Golden Championship Ring'
  });

  // THE SOVEREIGN DYNAST (Life Progression Tier 8)
  const currentLifeTier = state.lifeProgression?.currentTier || 'FOUNDATION';
  const currentTierRank = getLifeTierRank(currentLifeTier);
  const legacyTierRank = 7; // LEGACY_DYNASTY is rank 7 (0-indexed)
  const legacyTierPct = clamp(Math.round((currentTierRank / legacyTierRank) * 100), 0, 100);
  objectives.push({
    id: 'obj_legacy_dynasty_tier',
    title: 'THE SOVEREIGN DYNAST',
    tagline: 'Life Progression Peak',
    category: 'Dynasty',
    description: 'Advance your character through multi-domain achievements to attain the highest tier of life progression: Legacy Dynasty.',
    targetGoal: 'Attain Tier VIII: Legacy Dynasty',
    iconName: 'ShieldAlert',
    currentValue: currentTierRank,
    targetValue: legacyTierRank,
    formattedCurrent: `${LIFE_TIER_DEFINITIONS[currentLifeTier]?.displayName || currentLifeTier} (Tier ${currentTierRank + 1}/8)`,
    formattedTarget: 'Tier VIII: Legacy Dynasty',
    percentage: legacyTierPct,
    status: currentTierRank >= legacyTierRank ? 'Completed' : 'In Progress',
    rewardClaimed: claimedIds.has('obj_legacy_dynasty_tier'),
    rewardDescription: '+50 Dynasty Prestige, +25 World Influence, Eternal Sovereign Monogram'
  });

  return objectives;
}

export function getObjectiveById(id: string, state: GameState): GameObjective | null {
  const all = evaluateAllObjectives(state);
  return all.find(o => o.id === id) || null;
}

// ---------------------------------------------------------------------------
// 2. CAMPAIGN DEFINITIONS & SCENARIOS
// ---------------------------------------------------------------------------

export const CAMPAIGNS_CATALOG: CampaignDefinition[] = [
  {
    id: 'camp_sandbox',
    title: 'Sandbox Life Mode',
    subtitle: 'Unrestricted Free Play',
    description: 'Experience complete sandbox freedom. Live, invest, found companies, run for office, or raise a family with no mandatory deadlines or forced objectives.',
    iconName: 'Compass',
    badge: 'Sandbox Mode',
    difficulty: 'Realistic',
    primaryObjectiveId: 'obj_balanced_life',
    secondaryObjectiveIds: ['obj_entrepreneur', 'obj_tycoon', 'obj_dynasty'],
    sandboxCompatible: true
  },
  {
    id: 'camp_entrepreneur',
    title: 'The Self-Made Entrepreneur',
    subtitle: 'From Grassroots to $100M',
    description: 'Start with modest beginnings and navigate market cycles, scaling private ventures into an empire worth $100,000,000.',
    iconName: 'DollarSign',
    badge: 'Wealth Campaign',
    difficulty: 'Realistic',
    primaryObjectiveId: 'obj_entrepreneur',
    secondaryObjectiveIds: ['obj_tycoon', 'obj_unicorn', 'obj_real_estate'],
    initialCash: 15000,
    initialAge: 20,
    initialBackground: 'Middle Class',
    specialPerk: '20% boost to early startup fundraising & loan approvals',
    sandboxCompatible: false
  },
  {
    id: 'camp_tycoon',
    title: 'The Corporate Tycoon',
    subtitle: '10-Enterprise Conglomerate',
    description: 'Acquire and manage a sprawling corporate portfolio spanning software, banking, clean energy, biopharma, and logistics.',
    iconName: 'Building2',
    badge: 'Empire Campaign',
    difficulty: 'Hard',
    primaryObjectiveId: 'obj_tycoon',
    secondaryObjectiveIds: ['obj_entrepreneur', 'obj_industrialist', 'obj_unicorn'],
    initialCash: 75000,
    initialAge: 26,
    initialBackground: 'Affluent Old Money',
    specialPerk: '+15 initial business reputation and lower executive recruitment costs',
    sandboxCompatible: false
  },
  {
    id: 'camp_industrialist',
    title: 'The Industrialist Megabuilder',
    subtitle: 'Monumental Civil Architecture',
    description: 'Shape skyline architecture and civic infrastructure by completing 5 monumental megaprojects.',
    iconName: 'Layers',
    badge: 'Projects Campaign',
    difficulty: 'Hard',
    primaryObjectiveId: 'obj_industrialist',
    secondaryObjectiveIds: ['obj_entrepreneur', 'obj_globalist', 'obj_real_estate'],
    initialCash: 120000,
    initialAge: 30,
    specialPerk: '15% lower construction delay probabilities on megaprojects',
    sandboxCompatible: false
  },
  {
    id: 'camp_politician',
    title: 'The Political Ascent',
    subtitle: 'State Governance & Power',
    description: 'Begin as a municipal councillor and ascend the corridors of power to lead the nation as President or Prime Minister.',
    iconName: 'Landmark',
    badge: 'Politics Campaign',
    difficulty: 'Hard',
    primaryObjectiveId: 'obj_politician',
    secondaryObjectiveIds: ['obj_head_of_state', 'obj_balanced_life', 'obj_philanthropist'],
    initialCash: 35000,
    initialAge: 28,
    initialBackground: 'Political Dynasty',
    specialPerk: '+15 baseline Political Capital and faster campaign polling gains',
    sandboxCompatible: false
  },
  {
    id: 'camp_globalist',
    title: 'The Sovereign Globalist',
    subtitle: 'Multinational Empire',
    description: 'Build commercial, corporate, and real estate fortresses across 3 or more sovereign international nations.',
    iconName: 'Globe',
    badge: 'Global Campaign',
    difficulty: 'Extreme',
    primaryObjectiveId: 'obj_globalist',
    secondaryObjectiveIds: ['obj_entrepreneur', 'obj_tycoon', 'obj_dynasty'],
    initialCash: 80000,
    initialAge: 25,
    specialPerk: 'Zero foreign transaction surcharges and +10 base World Influence',
    sandboxCompatible: false
  },
  {
    id: 'camp_philanthropist',
    title: 'The Philanthropic Patron',
    subtitle: '$50M Humanitarian Endowment',
    description: 'Generate immense wealth with the sole moral imperative of donating $50,000,000 back to global humanity.',
    iconName: 'Heart',
    badge: 'Philanthropy Campaign',
    difficulty: 'Realistic',
    primaryObjectiveId: 'obj_philanthropist',
    secondaryObjectiveIds: ['obj_entrepreneur', 'obj_balanced_life', 'obj_dynasty'],
    initialCash: 25000,
    initialAge: 22,
    specialPerk: 'Donations generate 50% more public reputation and personal happiness',
    sandboxCompatible: false
  },
  {
    id: 'camp_dynasty',
    title: 'The Four-Generation Dynasty',
    subtitle: 'Eternal Family Lineage',
    description: 'Ensure succession plans, groom competent heirs, and shepherd an unbroken family dynasty across four generations.',
    iconName: 'Crown',
    badge: 'Dynasty Campaign',
    difficulty: 'Extreme',
    primaryObjectiveId: 'obj_dynasty',
    secondaryObjectiveIds: ['obj_entrepreneur', 'obj_balanced_life', 'obj_tycoon'],
    initialCash: 50000,
    initialAge: 21,
    specialPerk: 'Heirs start with +20 leadership and zero estate transition tax friction',
    sandboxCompatible: false
  },
  {
    id: 'camp_balanced',
    title: 'The Art of Living (Balanced Life)',
    subtitle: 'Health, Family, Wealth & Esteem',
    description: 'Resist the siren song of one-dimensional workaholism. Achieve the supreme achievement: high health, loving family, wealth, and pristine reputation.',
    iconName: 'Sparkles',
    badge: 'Harmony Campaign',
    difficulty: 'Realistic',
    primaryObjectiveId: 'obj_balanced_life',
    secondaryObjectiveIds: ['obj_entrepreneur', 'obj_philanthropist', 'obj_dynasty'],
    initialCash: 20000,
    initialAge: 18,
    specialPerk: '-20% stress accumulation rate across all life activities',
    sandboxCompatible: false
  }
];

export function getAllCampaigns(): CampaignDefinition[] {
  return CAMPAIGNS_CATALOG;
}

export function getActiveCampaign(state: GameState): CampaignDefinition | null {
  if (state.isSandboxMode) {
    return CAMPAIGNS_CATALOG.find(c => c.id === 'camp_sandbox') || null;
  }
  if (!state.activeCampaignId) {
    return CAMPAIGNS_CATALOG.find(c => c.id === 'camp_sandbox') || null;
  }
  return CAMPAIGNS_CATALOG.find(c => c.id === state.activeCampaignId) || null;
}

// ---------------------------------------------------------------------------
// 3. OBJECTIVE MILESTONE CHECKER & EVENT DISPATCHER
// ---------------------------------------------------------------------------

export function checkAndNotifyObjectiveCompletions(
  prevState: GameState,
  nextState: GameState
): { nextState: GameState; completedObjectives: GameObjective[] } {
  const currentObjectives = evaluateAllObjectives(nextState);
  const previouslyCompleted = new Set(prevState.completedObjectiveIds || []);
  const newlyCompleted: GameObjective[] = [];

  const updatedCompletedIds = new Set(nextState.completedObjectiveIds || []);

  for (const obj of currentObjectives) {
    if (obj.status === 'Completed' && !previouslyCompleted.has(obj.id)) {
      newlyCompleted.push(obj);
      updatedCompletedIds.add(obj.id);
    }
  }

  if (newlyCompleted.length === 0) {
    return { nextState, completedObjectives: [] };
  }

  // Create celebratory Life Events for each completed objective
  const newEvents: LifeEvent[] = newlyCompleted.map(obj => ({
    id: `ev_obj_complete_${obj.id}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestampMonth: nextState.currentMonth,
    timestampYear: nextState.currentYear,
    age: nextState.character.age,
    category: 'Achievements',
    title: `🏆 Objective Mastered: ${obj.title}`,
    description: `You have successfully conquered the grand objective "${obj.title}": ${obj.targetGoal}! Progress: ${obj.formattedCurrent} (${obj.percentage}% completed).`,
    severity: 'High',
    type: 'MILESTONE',
    consequences: {
      happinessChange: +15,
      reputationChange: +10,
      worldInfluenceChange: +8,
      details: [
        `Mastered: ${obj.title}`,
        `Milestone condition fulfilled: ${obj.targetGoal}`,
        `Reward available to claim in Objectives Studio: ${obj.rewardDescription || 'Prestige'}`
      ]
    }
  }));

  const modifiedState: GameState = {
    ...nextState,
    completedObjectiveIds: Array.from(updatedCompletedIds),
    eventsFeed: [...newEvents, ...nextState.eventsFeed]
  };

  return { nextState: modifiedState, completedObjectives: newlyCompleted };
}

// ---------------------------------------------------------------------------
// 4. PHILANTHROPY & DONATION HANDLERS
// ---------------------------------------------------------------------------

export function donateToPhilanthropy(
  state: GameState,
  amount: number,
  causeName: string
): { nextState: GameState; event: LifeEvent } {
  if (state.finances.cash < amount) {
    throw new Error('Insufficient liquid cash balance for philanthropic donation.');
  }

  const currentPhilanthropy = state.lifetimePhilanthropy || 0;
  const newTotalPhilanthropy = currentPhilanthropy + amount;

  // Impact scales with donation size
  const repBoost = Math.max(1, Math.min(25, Math.round(Math.log10(amount + 1) * 2.5)));
  const hapBoost = Math.max(2, Math.min(20, Math.round(Math.log10(amount + 1) * 2.0)));
  const infBoost = Math.max(1, Math.min(18, Math.round(Math.log10(amount + 1) * 1.8)));

  const donationEvent: LifeEvent = {
    id: `ev_donation_${Date.now()}`,
    timestampMonth: state.currentMonth,
    timestampYear: state.currentYear,
    age: state.character.age,
    category: 'Finance',
    type: 'MILESTONE',
    title: `Philanthropic Endowment: ${formatCurrency(amount)} to ${causeName}`,
    description: `You bestowed a generous philanthropic donation of ${formatCurrency(amount)} to support ${causeName}. Society lauds your civic leadership and benevolence.`,
    severity: amount >= 1_000_000 ? 'High' : 'Medium',
    consequences: {
      cashChange: -amount,
      happinessChange: hapBoost,
      reputationChange: repBoost,
      worldInfluenceChange: infBoost,
      details: [
        `Donated ${formatCurrency(amount)} to ${causeName}`,
        `Total lifetime philanthropy: ${formatCurrency(newTotalPhilanthropy)}`,
        `Public reputation increased (+${repBoost})`
      ]
    }
  };

  const updatedState: GameState = {
    ...state,
    lifetimePhilanthropy: newTotalPhilanthropy,
    finances: {
      ...state.finances,
      cash: state.finances.cash - amount
    },
    character: {
      ...state.character,
      attributes: {
        ...state.character.attributes,
        happiness: clamp(state.character.attributes.happiness + hapBoost, 0, 100),
        reputation: clamp(state.character.attributes.reputation + repBoost, 0, 100),
        worldInfluence: clamp((state.character.attributes.worldInfluence || 0) + infBoost, 0, 100)
      }
    },
    eventsFeed: [donationEvent, ...state.eventsFeed]
  };

  return { nextState: updatedState, event: donationEvent };
}

// ---------------------------------------------------------------------------
// 5. OBJECTIVE ACTIONS & PREFERENCES
// ---------------------------------------------------------------------------

export function claimObjectiveReward(
  state: GameState,
  objectiveId: string
): { nextState: GameState; rewardText: string } {
  const objective = getObjectiveById(objectiveId, state);
  if (!objective || objective.status !== 'Completed') {
    throw new Error('Objective is not completed or does not exist.');
  }

  const claimed = new Set(state.claimedObjectiveRewardIds || []);
  if (claimed.has(objectiveId)) {
    throw new Error('Reward has already been claimed for this objective.');
  }

  claimed.add(objectiveId);

  // Apply categorical reward perks
  let repBonus = 5;
  let infBonus = 5;
  let cashBonus = 0;

  if (objective.category === 'Wealth') {
    infBonus = 10;
    repBonus = 10;
  } else if (objective.category === 'Business') {
    infBonus = 15;
  } else if (objective.category === 'Politics') {
    infBonus = 20;
  } else if (objective.category === 'Philanthropy') {
    repBonus = 20;
  } else if (objective.category === 'Dynasty') {
    infBonus = 25;
  }

  const claimEvent: LifeEvent = {
    id: `ev_claim_reward_${objectiveId}_${Date.now()}`,
    timestampMonth: state.currentMonth,
    timestampYear: state.currentYear,
    age: state.character.age,
    category: 'Achievements',
    title: `Prestige Laurels Claimed: ${objective.title}`,
    description: `You claimed the prestigious honors for mastering "${objective.title}": ${objective.rewardDescription}`,
    severity: 'Medium',
    type: 'MILESTONE',
    consequences: {
      reputationChange: repBonus,
      worldInfluenceChange: infBonus,
      details: [`Claimed: ${objective.rewardDescription}`]
    }
  };

  const nextState: GameState = {
    ...state,
    claimedObjectiveRewardIds: Array.from(claimed),
    character: {
      ...state.character,
      attributes: {
        ...state.character.attributes,
        reputation: clamp(state.character.attributes.reputation + repBonus, 0, 100),
        worldInfluence: clamp((state.character.attributes.worldInfluence || 0) + infBonus, 0, 100)
      }
    },
    eventsFeed: [claimEvent, ...state.eventsFeed]
  };

  return { nextState, rewardText: objective.rewardDescription || 'Prestige & Influence' };
}

export function pinObjective(state: GameState, objectiveId: string | null): GameState {
  return {
    ...state,
    pinnedObjectiveId: objectiveId
  };
}

export function setCampaign(state: GameState, campaignId: string | null): GameState {
  if (campaignId === 'camp_sandbox' || !campaignId) {
    return {
      ...state,
      isSandboxMode: true,
      activeCampaignId: null
    };
  }

  const campaign = CAMPAIGNS_CATALOG.find(c => c.id === campaignId);
  return {
    ...state,
    isSandboxMode: false,
    activeCampaignId: campaignId,
    pinnedObjectiveId: campaign ? campaign.primaryObjectiveId : state.pinnedObjectiveId
  };
}

export function setSandboxMode(state: GameState, isSandbox: boolean): GameState {
  return {
    ...state,
    isSandboxMode: isSandbox,
    activeCampaignId: isSandbox ? null : (state.activeCampaignId || 'camp_entrepreneur')
  };
}
