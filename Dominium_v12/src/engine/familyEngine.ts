import { 
  GameState, 
  RelationshipPerson, 
  ChildSkills, 
  ChildPotential, 
  SimulationDiff, 
  LifeEvent, 
  PendingDecision, 
  SimulationEventChoice, 
  EventChain,
  NewsItem
} from '../types';
import { ConsequenceEngine } from './consequenceEngine';
import { isEventOnCooldown } from './eventControlEngine';
import { recordDecisionWithConsequences } from './historyEngine';

// Default skills for child initialization
export function createDefaultChildSkills(potential: ChildPotential = 'High Potential'): ChildSkills {
  const base = potential === 'Prodigy' ? 70 : (potential === 'High Potential' ? 55 : (potential === 'Visionary' ? 65 : 45));
  return {
    intellect: Math.min(100, Math.max(20, base + Math.floor(Math.random() * 15))),
    creativity: Math.min(100, Math.max(20, base + Math.floor(Math.random() * 15))),
    leadership: Math.min(100, Math.max(20, base + Math.floor(Math.random() * 15))),
    discipline: Math.min(100, Math.max(20, base + Math.floor(Math.random() * 15)))
  };
}

const POTENTIAL_POOL: ChildPotential[] = ['Prodigy', 'High Potential', 'High Potential', 'Average', 'Visionary'];
const TRAITS_POOL = [
  'Analytical Mind', 'Charismatic Speaker', 'Tenacious', 'Artistic Vision', 
  'Mathematical Genius', 'Empathetic', 'Fiercely Independent', 'Strategic Thinker',
  'Natural Leader', 'Frugal & Disciplined'
];

/**
 * Initializes and normalizes child properties if missing.
 */
export function normalizeChild(child: RelationshipPerson, tick: number): RelationshipPerson {
  if (!child.potential) {
    child.potential = POTENTIAL_POOL[Math.floor(Math.random() * POTENTIAL_POOL.length)];
  }
  if (!child.skills) {
    child.skills = createDefaultChildSkills(child.potential);
  }
  if (child.health === undefined) {
    child.health = 95;
  }
  if (child.wealth === undefined) {
    child.wealth = 0;
  }
  if (!child.traits || child.traits.length === 0) {
    const shuffled = [...TRAITS_POOL].sort(() => 0.5 - Math.random());
    child.traits = shuffled.slice(0, 2);
  }
  if (!child.lifeMilestones) {
    child.lifeMilestones = [`Born into the ${child.name.split(' ').pop() || 'Dynastic'} family`];
  }
  if (!child.schoolType) {
    child.schoolType = child.age < 6 ? 'Public' : 'Private Elite';
  }
  if (child.lastInteractedTick === undefined) {
    child.lastInteractedTick = tick;
  }
  return child;
}

/**
 * Monthly advancement of a child's education, skills, career, and wealth.
 */
export function advanceChildMonthly(
  child: RelationshipPerson, 
  state: GameState, 
  events: LifeEvent[], 
  news: NewsItem[]
): void {
  normalizeChild(child, state.simulationTick);
  const skills = child.skills!;
  
  // Age-based evolution
  if (child.age < 6) {
    child.education = child.age < 3 ? 'Infant / Toddler Care' : 'Elite Montessori Preschool';
    child.occupation = 'Infant / Child';
  } else if (child.age >= 6 && child.age < 13) {
    child.education = child.schoolType === 'Private Elite' 
      ? 'St. Jude International Academy (Prep)' 
      : 'Regional Public Elementary School';
    child.occupation = 'Student';

    // Skill growth during primary years
    const growthBoost = child.schoolType === 'Private Elite' ? 0.3 : 0.15;
    skills.intellect = Math.min(100, Math.round((skills.intellect + growthBoost) * 10) / 10);
    skills.creativity = Math.min(100, Math.round((skills.creativity + growthBoost) * 10) / 10);
    skills.discipline = Math.min(100, Math.round((skills.discipline + growthBoost * 0.8) * 10) / 10);
  } else if (child.age >= 13 && child.age < 18) {
    child.education = child.schoolType === 'Private Elite' 
      ? 'Phillips Andover / Exeter Boarding Academy' 
      : 'Metropolitan Senior High School';
    child.occupation = 'High School Scholar';

    const growthBoost = child.schoolType === 'Private Elite' ? 0.4 : 0.2;
    skills.intellect = Math.min(100, Math.round((skills.intellect + growthBoost) * 10) / 10);
    skills.leadership = Math.min(100, Math.round((skills.leadership + growthBoost) * 10) / 10);
    skills.discipline = Math.min(100, Math.round((skills.discipline + growthBoost) * 10) / 10);

    // Allowance savings
    if (child.monthlyAllowance && child.monthlyAllowance > 0) {
      child.wealth += Math.round(child.monthlyAllowance * 0.4); // 40% saved
    }
  } else if (child.age >= 18 && child.age < 23) {
    if (!child.education || child.education.includes('High School') || child.education.includes('Academy')) {
      if (skills.intellect >= 75 || child.potential === 'Prodigy') {
        child.education = 'Oxford / Stanford University (Economics & AI)';
      } else if (skills.creativity >= 70) {
        child.education = 'Royal College of Design & Architecture';
      } else {
        child.education = 'National State University (Business Administration)';
      }
    }
    child.occupation = `Undergraduate at ${child.education.split(' ')[0]}`;

    // University skill acceleration
    skills.intellect = Math.min(100, Math.round((skills.intellect + 0.35) * 10) / 10);
    skills.leadership = Math.min(100, Math.round((skills.leadership + 0.3) * 10) / 10);
    skills.discipline = Math.min(100, Math.round((skills.discipline + 0.25) * 10) / 10);

    if (child.monthlyAllowance) {
      child.wealth += Math.round(child.monthlyAllowance * 0.5);
    }
  } else if (child.age >= 23) {
    // Adult career launch & progression
    if (!child.career) {
      if (child.potential === 'Prodigy' || skills.intellect >= 85) {
        child.career = 'Quantitative Algorithmic Trader';
        child.occupation = 'Quantitative Hedge Fund Analyst';
      } else if (skills.leadership >= 80) {
        child.career = 'Venture Capital Associate';
        child.occupation = 'Venture Associate';
      } else if (skills.creativity >= 75) {
        child.career = 'Creative Technology Director';
        child.occupation = 'Design Principal';
      } else {
        child.career = 'Corporate Management Consultant';
        child.occupation = 'Management Consultant';
      }

      if (!child.lifeMilestones.some(m => m.includes('Launched Career'))) {
        child.lifeMilestones.push(`Launched Career as ${child.career}`);
        events.push({
          id: `ev_child_career_${child.id}_${state.simulationTick}`,
          category: 'Family',
          type: 'MILESTONE',
          title: `Career Milestone: ${child.name}`,
          description: `${child.name} has entered the professional arena, starting as a ${child.career} with stellar industry prospects.`,
          timestampMonth: state.currentMonth,
          timestampYear: state.currentYear,
          age: state.character.age,
          consequences: {
            happinessChange: +12,
            reputationChange: +4,
            details: [`${child.name} is now employed as ${child.career}.`]
          }
        });
      }
    }

    // Career income and wealth growth
    const baseMonthlySalary = skills.intellect >= 80 ? 12000 : (skills.leadership >= 75 ? 9500 : 6500);
    child.wealth += Math.round(baseMonthlySalary * 0.35); // 35% saved after living expenses

    // Adult Romance / Marriage Milestone check (at age 25+)
    if (child.age >= 25 && !child.partnerName && Math.random() < 0.05) {
      const partnerNames = ['Victoria Sinclair', 'Alexander Drake', 'Seraphina Vance', 'Sebastian Sterling', 'Elena Rostova'];
      child.partnerName = partnerNames[Math.floor(Math.random() * partnerNames.length)];
      child.lifeMilestones.push(`Engaged to ${child.partnerName}`);

      events.push({
        id: `ev_child_engaged_${child.id}_${state.simulationTick}`,
        category: 'Family',
        type: 'MILESTONE',
        title: `Family Milestone: ${child.name} is Engaged! 💍`,
        description: `Your child ${child.name} announced their engagement to ${child.partnerName}. The entire family line gathers to celebrate.`,
        timestampMonth: state.currentMonth,
        timestampYear: state.currentYear,
        age: state.character.age,
        consequences: {
          happinessChange: +15,
          details: [`${child.name} is engaged to ${child.partnerName}`]
        }
      });
    }
  }

  // Natural health maintenance
  child.health = Math.min(100, Math.max(40, (child.health || 95) + (Math.random() * 2 - 1)));
}

/**
 * Monthly simulation step for all family members & relational drift.
 */
export function advanceFamilySimulation(
  prevState: GameState,
  state: GameState,
  diff: SimulationDiff
): { nextState: GameState; familyEvents: LifeEvent[]; familyNews: NewsItem[] } {
  const events: LifeEvent[] = [];
  const news: NewsItem[] = [];

  const spouse = state.relationships.find(r => r.relation === 'Spouse' || r.relation === 'Partner');
  const children = state.relationships.filter(r => r.relation === 'Son' || r.relation === 'Daughter');

  // 1. Advance Child Life Progression
  for (const child of children) {
    if (child.alive) {
      // Check birthday
      if (state.currentMonth === state.character.birthMonth) {
        child.age += 1;
        // Milestone birthday events
        if (child.age === 6) {
          child.lifeMilestones?.push('Enrolled in Primary Education');
          events.push({
            id: `ev_child_school_${child.id}_${state.simulationTick}`,
            category: 'Family',
            type: 'MILESTONE',
            title: `${child.name} Starts Primary School 🎒`,
            description: `${child.name} turned 6 years old and enrolled in ${child.schoolType === 'Private Elite' ? 'an elite private academy' : 'primary school'}.`,
            timestampMonth: state.currentMonth,
            timestampYear: state.currentYear,
            age: state.character.age,
            consequences: { happinessChange: +8 }
          });
        } else if (child.age === 18) {
          child.lifeMilestones?.push('Graduated High School & Entered University');
          events.push({
            id: `ev_child_uni_${child.id}_${state.simulationTick}`,
            category: 'Family',
            type: 'MILESTONE',
            title: `${child.name} Graduated High School! 🎓`,
            description: `${child.name} turned 18, graduating at the top of their class and preparing for university studies.`,
            timestampMonth: state.currentMonth,
            timestampYear: state.currentYear,
            age: state.character.age,
            consequences: { happinessChange: +14, reputationChange: +5 }
          });
        }
      }

      advanceChildMonthly(child, state, events, news);

      // Relational drift from neglect
      const ticksSinceInteracted = state.simulationTick - (child.lastInteractedTick || 0);
      if (ticksSinceInteracted > 6) {
        // Child feels neglected
        child.love = Math.max(20, child.love - 0.5);
        child.trust = Math.max(20, child.trust - 0.4);
      }
    }
  }

  // 2. Relational Drift for Spouse based on Player Workload and Stress
  if (spouse && spouse.alive) {
    const weeklyWorkHours = (state.currentJob?.workingHoursWeekly || 40) + (state.companies.length * 10);
    const isOverworked = weeklyWorkHours > 55 || state.companies.length >= 2 || state.politics.currentOffice.inOffice;
    const isHighStress = state.character.attributes.stress >= 65;
    const ticksSinceInteracted = state.simulationTick - (spouse.lastInteractedTick || 0);

    let spousalDecay = 0;
    if (isOverworked) spousalDecay += 0.6;
    if (isHighStress) spousalDecay += 0.4;
    if (ticksSinceInteracted > 4) spousalDecay += 0.5;

    if (spousalDecay > 0) {
      spouse.love = Math.max(15, Math.round((spouse.love - spousalDecay) * 10) / 10);
      spouse.trust = Math.max(15, Math.round((spouse.trust - spousalDecay * 0.8) * 10) / 10);
    }
  }

  // 3. Evaluate Causal Family State Triggers
  const { generatedEvents: causalFamilyEvents, unlockedDecisions: familyDecisions, unlockedChains: familyChains } = evaluateFamilyTriggers(prevState, state, diff);
  
  events.push(...causalFamilyEvents);
  for (const dec of familyDecisions) {
    if (!state.pendingDecisions.some(d => d.id === dec.id)) {
      state.pendingDecisions.push(dec);
    }
  }

  return {
    nextState: state,
    familyEvents: events,
    familyNews: news
  };
}

/**
 * State-driven causal family triggers based on actual player behavior, wealth, workload, and relationships.
 */
export function evaluateFamilyTriggers(
  prevState: GameState,
  currentState: GameState,
  diff: SimulationDiff
): {
  generatedEvents: LifeEvent[];
  unlockedDecisions: PendingDecision[];
  unlockedChains: EventChain[];
} {
  const generatedEvents: LifeEvent[] = [];
  const unlockedDecisions: PendingDecision[] = [];
  const unlockedChains: EventChain[] = [];

  const tick = currentState.simulationTick;
  const currentMonth = currentState.currentMonth;
  const currentYear = currentState.currentYear;
  const age = currentState.character.age;

  const spouse = (currentState.relationships || []).find(r => r.relation === 'Spouse' || r.relation === 'Partner');
  const children = (currentState.relationships || []).filter(r => r.relation === 'Son' || r.relation === 'Daughter');
  const netWorth = calculateTotalNetWorth(currentState);

  // =========================================================================
  // 1. HIGH WORKLOAD → SPOUSE RELATIONSHIP STRAIN
  // =========================================================================
  const weeklyWorkHours = (currentState.currentJob?.workingHoursWeekly || 40) + (currentState.companies.length * 10);
  const isHeavyWorkload = weeklyWorkHours >= 55 || currentState.companies.length >= 2 || (currentState.politics.currentOffice.inOffice && currentState.companies.length >= 1);

  if (spouse && isHeavyWorkload && (spouse.love < 55 || spouse.trust < 55)) {
    if (!isEventOnCooldown(currentState, 'FAMILY_HIGH_WORKLOAD_STRAIN', spouse.id)) {
      const triggerReason = `Executive workload (${weeklyWorkHours} hrs/wk across ${currentState.companies.length} enterprises/offices) caused domestic neglect. Spousal trust: ${spouse.trust}%, Love: ${spouse.love}%.`;

      const workloadChoices: SimulationEventChoice[] = [
        {
          id: `opt_spouse_vacation_${tick}`,
          label: 'Book 2-Week Private Island Family Vacation ($25,000)',
          description: 'Step away from corporate operations completely to focus on spousal renewal and private reconnection.',
          cost: 25000,
          risk: 'Low',
          timeHorizon: '2 weeks',
          projectedOutcome: '+25 Trust, +30 Love, -15 Stress, consumes $25k.',
          handlerKey: 'OPT_FAMILY_VACATION',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 25000, { description: 'Private island family vacation booking' }),
            ConsequenceEngine.relationship(spouse.id, 'trust', 'ADD', 25, { description: 'Deepened spousal trust through undivided time' }),
            ConsequenceEngine.relationship(spouse.id, 'love', 'ADD', 30, { description: 'Reignited marital romance' }),
            ConsequenceEngine.stress('SUBTRACT', 15, { description: 'Restored vitality during family retreat' }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 15, { description: 'Joyful family harmony' })
          ]
        },
        {
          id: `opt_hire_household_concierge_${tick}`,
          label: 'Retain Private Estate Staff & Chief of Staff ($10,000/mo)',
          description: 'Hire domestic managers and executive deputies to reduce household pressure and delegate tasks.',
          cost: 10000,
          risk: 'Low',
          timeHorizon: 'Ongoing',
          projectedOutcome: '+12 Trust, +10 Love, permanently lowers personal stress (-8).',
          handlerKey: 'OPT_HOUSEHOLD_STAFF',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 10000, { description: 'Estate staff & domestic concierge retainer' }),
            ConsequenceEngine.relationship(spouse.id, 'trust', 'ADD', 12, { description: 'Lightened domestic logistical burdens' }),
            ConsequenceEngine.relationship(spouse.id, 'love', 'ADD', 10, { description: 'Spousal gratitude for reduced home stress' }),
            ConsequenceEngine.stress('SUBTRACT', 8, { description: 'Delegated operational and domestic friction' })
          ]
        },
        {
          id: `opt_workload_corporate_focus_${tick}`,
          label: 'Stay Focused on Corporate Milestones',
          description: 'Ask spouse to bear with intense corporate scaling during this critical growth window.',
          risk: 'High',
          timeHorizon: 'Ongoing',
          projectedOutcome: 'Preserves working hours, but strains marriage further (-12 Love, -10 Trust).',
          handlerKey: 'OPT_WORKLOAD_CORPORATE',
          consequences: [
            ConsequenceEngine.relationship(spouse.id, 'trust', 'SUBTRACT', 10, { description: 'Spousal trust eroded by continued absence' }),
            ConsequenceEngine.relationship(spouse.id, 'love', 'SUBTRACT', 12, { description: 'Marital intimacy faded under workaholism' }),
            ConsequenceEngine.stress('ADD', 6, { description: 'Domestic tension added personal stress' })
          ]
        }
      ];

      generatedEvents.push({
        id: `ev_workload_strain_${tick}`,
        category: 'FAMILY',
        type: 'WARNING',
        title: `Workload Friction: ${spouse.name} Requests Balance`,
        description: `Your relentless schedule (${weeklyWorkHours} hours/week) is straining your marriage with ${spouse.name}. Your spouse expresses feelings of loneliness and detachment.`,
        severity: 'High',
        priority: 84,
        source: spouse.name,
        sourceEntityId: spouse.id,
        createdMonth: currentMonth,
        createdYear: currentYear,
        timestampMonth: currentMonth,
        timestampYear: currentYear,
        age,
        status: 'Active',
        tags: ['Family', 'Workload', 'Marriage', spouse.name],
        triggerReason,
        choices: workloadChoices,
        consequences: {
          happinessChange: -5,
          details: [`Spouse Trust: ${spouse.trust}%, Love: ${spouse.love}%`]
        }
      });

      unlockedDecisions.push({
        id: `dec_workload_balance_${tick}`,
        eventTypeKey: 'FAMILY_HIGH_WORKLOAD_STRAIN',
        entityId: spouse.id,
        category: 'Family',
        title: `Family Crossroads: Addressing Marital Strain with ${spouse.name}`,
        description: triggerReason,
        urgency: 'Urgent',
        priority: 84,
        expiresInMonths: 3,
        expirationEventHeadline: `Spousal Estrangement Escalated: ${spouse.name}`,
        expirationEventDescription: `Failing to address ongoing workload strain resulted in acute emotional distance with ${spouse.name}.`,
        expirationConsequences: [
          ConsequenceEngine.relationship(spouse.id, 'trust', 'SUBTRACT', 15, { description: 'Severe spousal trust erosion' }),
          ConsequenceEngine.relationship(spouse.id, 'love', 'SUBTRACT', 15, { description: 'Emotional alienation' })
        ],
        options: workloadChoices.map(ch => ({
          id: ch.id,
          label: ch.label,
          description: ch.description,
          cost: ch.cost,
          risk: ch.risk || 'Low',
          timeHorizon: ch.timeHorizon || 'Immediate',
          projectedOutcome: ch.projectedOutcome || '',
          handlerKey: ch.handlerKey || 'OPT_FAMILY_ACTION',
          consequences: ch.consequences
        }))
      });
    }
  }

  // =========================================================================
  // 2. HIGH STRESS → DOMESTIC CONFLICT RISK
  // =========================================================================
  if (currentState.character.attributes.stress >= 68 && (spouse || children.length > 0)) {
    if (!isEventOnCooldown(currentState, 'FAMILY_DOMESTIC_STRESS_CONFLICT', 'global')) {
      const triggerReason = `Character stress reached ${currentState.character.attributes.stress}/100, causing irritability and domestic conflict.`;

      const stressChoices: SimulationEventChoice[] = [
        {
          id: `opt_stress_counseling_${tick}`,
          label: 'Attend Private Executive Family Counseling ($6,000)',
          description: 'Engage a top clinical therapist to establish healthy communication and de-escalate household friction.',
          cost: 6000,
          risk: 'Low',
          timeHorizon: '1 month',
          projectedOutcome: '-20 Stress, +15 Family Trust, restores domestic calm.',
          handlerKey: 'OPT_STRESS_COUNSELING',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 6000, { description: 'Private family therapy retainer' }),
            ConsequenceEngine.stress('SUBTRACT', 20, { description: 'Therapeutic resolution of executive anxiety' }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 10, { description: 'Renewed household harmony' }),
            ...(spouse ? [ConsequenceEngine.relationship(spouse.id, 'trust', 'ADD', 15, { description: 'Rebuilt emotional trust' })] : [])
          ]
        },
        {
          id: `opt_stress_retreat_${tick}`,
          label: 'Take a Solo Weekend Wellness & Meditation Retreat ($3,000)',
          description: 'Decompress in seclusion to reset mental clarity and return calm to your family.',
          cost: 3000,
          risk: 'Low',
          timeHorizon: 'Weekend',
          projectedOutcome: '-15 Stress, +5 Health.',
          handlerKey: 'OPT_STRESS_RETREAT',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 3000, { description: 'Wellness resort retreat' }),
            ConsequenceEngine.stress('SUBTRACT', 15, { description: 'Mental reset and meditation' }),
            ConsequenceEngine.playerAttribute('health', 'ADD', 5, { description: 'Physical rest and recovery' })
          ]
        }
      ];

      generatedEvents.push({
        id: `ev_family_conflict_${tick}`,
        category: 'FAMILY',
        type: 'WARNING',
        title: 'Domestic Tension: Executive Stress Spillover',
        description: `Acute professional pressure (Stress: ${currentState.character.attributes.stress}/100) triggered a heated dispute at the dinner table. Family members urge you to manage burnout.`,
        severity: 'Medium',
        priority: 76,
        source: 'Household Environment',
        createdMonth: currentMonth,
        createdYear: currentYear,
        timestampMonth: currentMonth,
        timestampYear: currentYear,
        age,
        status: 'Active',
        tags: ['Family', 'Stress', 'Conflict'],
        triggerReason,
        choices: stressChoices,
        consequences: {
          happinessChange: -6,
          details: [`Current Stress: ${currentState.character.attributes.stress}/100`]
        }
      });
    }
  }

  // =========================================================================
  // 3. EXTREME WEALTH → FAMILY FINANCIAL DEPENDENCY & SEED REQUESTS
  // =========================================================================
  const adultFamilyMembers = (currentState.relationships || []).filter(r => 
    r.alive && (r.relation === 'Brother' || r.relation === 'Sister' || (r.relation === 'Son' && r.age >= 21) || (r.relation === 'Daughter' && r.age >= 21))
  );

  if (netWorth >= 1500000 && currentState.finances.cash >= 150000 && adultFamilyMembers.length > 0) {
    const dependentPerson = adultFamilyMembers[Math.floor(Math.random() * adultFamilyMembers.length)];
    if (!isEventOnCooldown(currentState, 'FAMILY_FINANCIAL_DEPENDENCY', dependentPerson.id)) {
      const askAmount = Math.min(100000, Math.max(25000, Math.round(currentState.finances.cash * 0.1)));
      const triggerReason = `Expanding net worth ($${netWorth.toLocaleString()}) and liquid wealth prompted ${dependentPerson.name} (${dependentPerson.relation}) to request financial venture backing.`;

      const wealthDependencyChoices: SimulationEventChoice[] = [
        {
          id: `opt_fund_family_venture_${tick}`,
          label: `Seed ${dependentPerson.name}'s Commercial Venture ($${askAmount.toLocaleString()})`,
          description: `Provide a generous non-repayable equity grant of $${askAmount.toLocaleString()} to back their new enterprise.`,
          cost: askAmount,
          risk: 'Medium',
          timeHorizon: '12 months',
          projectedOutcome: `+35 Trust, +30 Loyalty, +15 Respect with ${dependentPerson.name}. Potential future dividend return.`,
          handlerKey: 'OPT_FUND_FAMILY',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', askAmount, { description: `Provided $${askAmount.toLocaleString()} seed capital to ${dependentPerson.name}` }),
            ConsequenceEngine.relationship(dependentPerson.id, 'trust', 'ADD', 35, { description: 'Supported life ambition' }),
            ConsequenceEngine.relationship(dependentPerson.id, 'loyalty', 'ADD', 30, { description: 'Deep gratitude for family backing' }),
            ConsequenceEngine.relationship(dependentPerson.id, 'respect', 'ADD', 15, { description: 'Admired as generous patron' })
          ]
        },
        {
          id: `opt_loan_family_formal_${tick}`,
          label: `Issue Formal Family Loan with Contract ($${Math.round(askAmount * 0.6).toLocaleString()})`,
          description: `Offer a structured low-interest loan with formal milestones to instill fiscal accountability.`,
          cost: Math.round(askAmount * 0.6),
          risk: 'Low',
          timeHorizon: '24 months',
          projectedOutcome: `+15 Trust, +20 Respect with ${dependentPerson.name}. Enforces financial discipline.`,
          handlerKey: 'OPT_LOAN_FAMILY',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', Math.round(askAmount * 0.6), { description: `Issued structured family loan to ${dependentPerson.name}` }),
            ConsequenceEngine.relationship(dependentPerson.id, 'trust', 'ADD', 15, { description: 'Constructive financial loan' }),
            ConsequenceEngine.relationship(dependentPerson.id, 'respect', 'ADD', 20, { description: 'Respected for business rigor' })
          ]
        },
        {
          id: `opt_decline_family_ask_${tick}`,
          label: 'Decline & Encourage Self-Sufficient Organic Growth',
          description: 'Politely refuse the capital request to prevent financial dependency in the family line.',
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `Saves $${askAmount.toLocaleString()} cash, but causes temporary disappointment (-15 Trust).`,
          handlerKey: 'OPT_DECLINE_FAMILY',
          consequences: [
            ConsequenceEngine.relationship(dependentPerson.id, 'trust', 'SUBTRACT', 15, { description: 'Disappointed by funding refusal' }),
            ConsequenceEngine.relationship(dependentPerson.id, 'loyalty', 'SUBTRACT', 10, { description: 'Perceived lack of family solidarity' })
          ]
        }
      ];

      generatedEvents.push({
        id: `ev_family_dependency_${dependentPerson.id}_${tick}`,
        category: 'FAMILY',
        type: 'DECISION',
        title: `Family Capital Request: ${dependentPerson.name}`,
        description: `Your ${dependentPerson.relation.toLowerCase()}, ${dependentPerson.name}, has approached you seeking $${askAmount.toLocaleString()} in seed capital to launch an ambitious new commercial venture.`,
        severity: 'Medium',
        priority: 74,
        source: dependentPerson.name,
        sourceEntityId: dependentPerson.id,
        createdMonth: currentMonth,
        createdYear: currentYear,
        timestampMonth: currentMonth,
        timestampYear: currentYear,
        age,
        status: 'Active',
        tags: ['Family', 'Wealth', 'Venture', dependentPerson.name],
        triggerReason,
        choices: wealthDependencyChoices,
        consequences: {
          details: [`Capital requested: $${askAmount.toLocaleString()}`]
        }
      });

      unlockedDecisions.push({
        id: `dec_family_seed_${dependentPerson.id}_${tick}`,
        eventTypeKey: 'FAMILY_FINANCIAL_DEPENDENCY',
        entityId: dependentPerson.id,
        category: 'Family',
        title: `Venture Backing: ${dependentPerson.name} ($${askAmount.toLocaleString()} Request)`,
        description: triggerReason,
        urgency: 'Standard',
        priority: 74,
        expiresInMonths: 3,
        options: wealthDependencyChoices.map(ch => ({
          id: ch.id,
          label: ch.label,
          description: ch.description,
          cost: ch.cost,
          risk: ch.risk || 'Low',
          timeHorizon: ch.timeHorizon || 'Immediate',
          projectedOutcome: ch.projectedOutcome || '',
          handlerKey: ch.handlerKey || 'OPT_FAMILY_ACTION',
          consequences: ch.consequences
        }))
      });
    }
  }

  // =========================================================================
  // 4. MAJOR SUCCESS → FAMILY CELEBRATION
  // =========================================================================
  const hasMajorTriumph = diff.netWorthPercentChange >= 20 || currentState.companies.some(c => c.isPublic) || (currentState.politics.currentOffice.inOffice && currentState.politics.currentOffice.approvalRating >= 70);

  if (hasMajorTriumph && (spouse || children.length > 0)) {
    if (!isEventOnCooldown(currentState, 'FAMILY_SUCCESS_CELEBRATION', 'global')) {
      const triggerReason = `Major commercial/political milestone triggered a grand family celebration of dynastic prestige.`;

      const celebrationChoices: SimulationEventChoice[] = [
        {
          id: `opt_estate_gala_${tick}`,
          label: 'Host Multi-Generational Estate Gala Banquet ($35,000)',
          description: 'Gather the full extended family, colleagues, and community leaders for a celebratory gala.',
          cost: 35000,
          risk: 'Low',
          timeHorizon: 'Evening',
          projectedOutcome: '+20 Family Trust across all members, +8 Reputation, +15 Happiness.',
          handlerKey: 'OPT_FAMILY_GALA',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 35000, { description: 'Grand family milestone banquet gala' }),
            ConsequenceEngine.reputation('ADD', 8, { description: 'Acclaimed host of landmark family banquet' }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 15, { description: 'Shared triumph with loved ones' }),
            ...(spouse ? [ConsequenceEngine.relationship(spouse.id, 'love', 'ADD', 15, { description: 'Proud spousal partnership' })] : []),
            ...children.map(c => ConsequenceEngine.relationship(c.id, 'respect', 'ADD', 15, { description: 'Inspired by parental accomplishment' }))
          ]
        },
        {
          id: `opt_family_trust_endowment_${tick}`,
          label: 'Fund Dynastic Generational Trust Fund ($150,000)',
          description: 'Establish a locked asset preservation trust fund ensuring lifelong security for children and spouse.',
          cost: 150000,
          risk: 'Low',
          timeHorizon: 'Permanent',
          projectedOutcome: '+30 Loyalty from all heirs, protects generational family legacy.',
          handlerKey: 'OPT_FAMILY_TRUST',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 150000, { description: 'Endowed dynastic family asset trust' }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 6, { description: 'Secured generational wealth structure' }),
            ...(spouse ? [ConsequenceEngine.relationship(spouse.id, 'trust', 'ADD', 25, { description: 'Permanent financial security' })] : []),
            ...children.map(c => ConsequenceEngine.relationship(c.id, 'loyalty', 'ADD', 25, { description: 'Protected future dynastic legacy' }))
          ]
        }
      ];

      generatedEvents.push({
        id: `ev_family_celebration_${tick}`,
        category: 'FAMILY',
        type: 'MILESTONE',
        title: 'Dynastic Triumph: Family Milestone Celebration',
        description: `Your unprecedented professional and financial milestones have elevated the entire family name to regional prominence. Family members toast your leadership.`,
        severity: 'Low',
        priority: 70,
        source: 'Family Line',
        createdMonth: currentMonth,
        createdYear: currentYear,
        timestampMonth: currentMonth,
        timestampYear: currentYear,
        age,
        status: 'Active',
        tags: ['Family', 'Success', 'Celebration'],
        triggerReason,
        choices: celebrationChoices,
        consequences: {
          happinessChange: +12,
          reputationChange: +4
        }
      });
    }
  }

  // =========================================================================
  // 5. POLITICAL CONTROVERSY / SCANDAL → FAMILY REPUTATION IMPACT
  // =========================================================================
  const isControversial = (currentState.politics.currentOffice.inOffice && currentState.politics.currentOffice.approvalRating < 40) || currentState.playerPowerProfile.scrutiny >= 65;

  if (isControversial && (spouse || children.length > 0)) {
    if (!isEventOnCooldown(currentState, 'FAMILY_POLITICAL_CONTROVERSY', 'global')) {
      const triggerReason = `Political approval deficit (${currentState.politics.currentOffice.approvalRating}%) and elevated scrutiny exposed the household to aggressive media paparazzi.`;

      const controversyChoices: SimulationEventChoice[] = [
        {
          id: `opt_family_security_shield_${tick}`,
          label: 'Retain 24/7 Private Estate Security & Press Liaison ($20,000)',
          description: 'Deploy elite security guards and a communications director to shield spouse and children from journalists.',
          cost: 20000,
          risk: 'Low',
          timeHorizon: '3 months',
          projectedOutcome: 'Protects family safety, +15 Spousal Trust, prevents reputation leaks.',
          handlerKey: 'OPT_FAMILY_SECURITY',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 20000, { description: 'Estate security and privacy shield' }),
            ConsequenceEngine.reputation('ADD', 3, { description: 'Maintained dignified family privacy' }),
            ...(spouse ? [ConsequenceEngine.relationship(spouse.id, 'trust', 'ADD', 15, { description: 'Protected family safety' })] : [])
          ]
        },
        {
          id: `opt_family_country_retreat_${tick}`,
          label: 'Send Family to Private Countryside Estate for 2 Months ($8,000)',
          description: 'Isolate family members in a quiet rural property until public political debates subside.',
          cost: 8000,
          risk: 'Low',
          timeHorizon: '2 months',
          projectedOutcome: '-10 Family Stress, but temporary physical separation (-5 Spousal Love).',
          handlerKey: 'OPT_FAMILY_RETREAT',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 8000, { description: 'Countryside sanctuary expenses' }),
            ConsequenceEngine.stress('SUBTRACT', 10, { description: 'Sheltered from media storm' }),
            ...(spouse ? [ConsequenceEngine.relationship(spouse.id, 'love', 'SUBTRACT', 5, { description: 'Temporary physical distance' })] : [])
          ]
        }
      ];

      generatedEvents.push({
        id: `ev_family_scandal_pressure_${tick}`,
        category: 'FAMILY',
        type: 'WARNING',
        title: 'Media Scrutiny Surrounds Family Residence',
        description: `Aggressive political commentary and paparazzi have gathered outside your residence. Children have been questioned by journalists on their way to academy grounds.`,
        severity: 'High',
        priority: 82,
        source: 'Press & Media Swarm',
        createdMonth: currentMonth,
        createdYear: currentYear,
        timestampMonth: currentMonth,
        timestampYear: currentYear,
        age,
        status: 'Active',
        tags: ['Family', 'Politics', 'Scandal', 'Media'],
        triggerReason,
        choices: controversyChoices,
        consequences: {
          stressChange: +8,
          happinessChange: -5,
          details: [`Political approval: ${currentState.politics.currentOffice.approvalRating}%`]
        }
      });
    }
  }

  // =========================================================================
  // 6. LONG ABSENCE → CHILD RELATIONSHIP DECLINE
  // =========================================================================
  for (const child of children) {
    if (child.alive && (tick - (child.lastInteractedTick || 0) >= 8)) {
      if (!isEventOnCooldown(currentState, 'FAMILY_CHILD_ABSENCE_NEGLECT', child.id)) {
        const triggerReason = `No direct parental engagement with ${child.name} for ${tick - (child.lastInteractedTick || 0)} months.`;

        const childNeglectChoices: SimulationEventChoice[] = [
          {
            id: `opt_child_weekend_trip_${child.id}_${tick}`,
            label: `Dedicate Entire Weekend Exclusively to ${child.name} ($3,500)`,
            description: `Cancel all corporate calls to attend their extracurriculars, have deep conversations, and bond.`,
            cost: 3500,
            risk: 'Low',
            timeHorizon: 'Weekend',
            projectedOutcome: `+30 Love, +25 Trust with ${child.name}, resets neglect completely.`,
            handlerKey: 'OPT_CHILD_WEEKEND',
            consequences: [
              ConsequenceEngine.cash('SUBTRACT', 3500, { description: `Parent-child bonding trip with ${child.name}` }),
              ConsequenceEngine.relationship(child.id, 'love', 'ADD', 30, { description: 'Overjoyed by undivided parental time' }),
              ConsequenceEngine.relationship(child.id, 'trust', 'ADD', 25, { description: 'Restored emotional connection' }),
              ConsequenceEngine.playerAttribute('happiness', 'ADD', 10, { description: 'Fulfilling parental bond' })
            ]
          },
          {
            id: `opt_child_gift_allowance_${child.id}_${tick}`,
            label: `Send Premium Tech Gift & Increase Monthly Allowance ($5,000)`,
            description: `Compensate for absence with high-end gifts and expanded spending power.`,
            cost: 5000,
            risk: 'Low',
            timeHorizon: 'Immediate',
            projectedOutcome: `+10 Love, but leaves deeper emotional detachment unaddressed.`,
            handlerKey: 'OPT_CHILD_GIFT',
            consequences: [
              ConsequenceEngine.cash('SUBTRACT', 5000, { description: `Extravagant apology gifts for ${child.name}` }),
              ConsequenceEngine.relationship(child.id, 'love', 'ADD', 10, { description: 'Appreciated gifts' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_child_distance_${child.id}_${tick}`,
          category: 'FAMILY',
          type: 'WARNING',
          title: `Parental Distance: ${child.name} Feels Neglected`,
          description: `Due to sustained corporate and political travel, months have passed without meaningful time spent with ${child.name}. Teachers report your child feeling disconnected.`,
          severity: 'Medium',
          priority: 75,
          source: child.name,
          sourceEntityId: child.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Family', 'Child', 'Parenting', child.name],
          triggerReason,
          choices: childNeglectChoices,
          consequences: {
            happinessChange: -4,
            details: [`${child.name} Trust: ${child.trust}%, Love: ${child.love}%`]
          }
        });
      }
    }
  }

  // =========================================================================
  // 7. CHILD ACADEMIC & SUCCESSION MILESTONE CHOICES
  // =========================================================================
  for (const child of children) {
    if (child.alive && child.age === 18 && !child.lifeMilestones?.some(m => m.includes('Higher Ed Decision'))) {
      if (!isEventOnCooldown(currentState, 'FAMILY_CHILD_UNIVERSITY_CHOICE', child.id)) {
        const triggerReason = `${child.name} turned 18 and received admission offers from top global institutions.`;
        child.lifeMilestones?.push('Higher Ed Decision Pending');

        const uniChoices: SimulationEventChoice[] = [
          {
            id: `opt_fund_ivy_league_${child.id}_${tick}`,
            label: `Endow Full Ivy League / Oxford Tuition ($160,000)`,
            description: `Fully fund 4-year tuition, elite accommodation, and research fellowships without any debt.`,
            cost: 160000,
            risk: 'Low',
            timeHorizon: '4 years',
            projectedOutcome: `+30 Intellect, +25 Respect, +30 Loyalty from ${child.name}, unlocks elite career trajectory.`,
            handlerKey: 'OPT_FUND_IVY',
            consequences: [
              ConsequenceEngine.cash('SUBTRACT', 160000, { description: `Endowed 4-year elite university tuition for ${child.name}` }),
              ConsequenceEngine.relationship(child.id, 'respect', 'ADD', 25, { description: 'Grateful for premier education backing' }),
              ConsequenceEngine.relationship(child.id, 'loyalty', 'ADD', 30, { description: 'Devoted dynastic successor' }),
              ConsequenceEngine.reputation('ADD', 5, { description: 'Patron of higher academic excellence' })
            ]
          },
          {
            id: `opt_fund_merit_support_${child.id}_${tick}`,
            label: `Provide Partial Merit Support & Living Stipend ($40,000)`,
            description: `Provide a balanced stipend while encouraging ${child.name} to earn academic scholarships.`,
            cost: 40000,
            risk: 'Low',
            timeHorizon: '4 years',
            projectedOutcome: `+15 Intellect, +20 Discipline from ${child.name}.`,
            handlerKey: 'OPT_MERIT_SUPPORT',
            consequences: [
              ConsequenceEngine.cash('SUBTRACT', 40000, { description: `Provided academic stipend to ${child.name}` }),
              ConsequenceEngine.relationship(child.id, 'respect', 'ADD', 15, { description: 'Constructive academic balance' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_child_higher_ed_${child.id}_${tick}`,
          category: 'FAMILY',
          type: 'DECISION',
          title: `Education Crossroads: ${child.name}'s University Future`,
          description: `${child.name} has graduated secondary education and holds offers from elite universities. Your financial backing will shape their intellectual and dynastic future.`,
          severity: 'High',
          priority: 80,
          source: child.name,
          sourceEntityId: child.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Family', 'Education', 'Dynasty', child.name],
          triggerReason,
          choices: uniChoices,
          consequences: {
            details: [`${child.name} Potential: ${child.potential}`]
          }
        });

        unlockedDecisions.push({
          id: `dec_child_uni_${child.id}_${tick}`,
          eventTypeKey: 'FAMILY_CHILD_UNIVERSITY_CHOICE',
          entityId: child.id,
          category: 'Family',
          title: `Dynastic Education: Funding ${child.name}'s University`,
          description: triggerReason,
          urgency: 'Standard',
          priority: 80,
          expiresInMonths: 4,
          options: uniChoices.map(ch => ({
            id: ch.id,
            label: ch.label,
            description: ch.description,
            cost: ch.cost,
            risk: ch.risk || 'Low',
            timeHorizon: ch.timeHorizon || 'Immediate',
            projectedOutcome: ch.projectedOutcome || '',
            handlerKey: ch.handlerKey || 'OPT_FAMILY_ACTION',
            consequences: ch.consequences
          }))
        });
      }
    }

    // =========================================================================
    // 9. HEIR DYNASTIC EXECUTIVE INTERNSHIP & MENTORSHIP (Improvement #9: Age 16-28)
    // =========================================================================
    if (child.age >= 16 && child.age <= 28 && currentState.companies.length > 0) {
      if (!isEventOnCooldown(currentState, 'FAMILY_HEIR_MENTORSHIP', child.id)) {
        const leadCompany = currentState.companies[0];
        const triggerReason = `${child.name} (Age ${child.age}) is ready for executive leadership immersion across the family empire (${leadCompany.name}).`;

        const mentorshipChoices: SimulationEventChoice[] = [
          {
            id: `opt_heir_executive_apprentice_${child.id}_${tick}`,
            label: `Appoint as Founder's Executive Apprentice at ${leadCompany.name}`,
            description: `Shadow you directly in C-suite boardrooms, strategy reviews, and investor negotiations.`,
            cost: 15000,
            risk: 'Low',
            timeHorizon: '6 months',
            projectedOutcome: `+25 Business Ability, +20 Leadership, +15 Loyalty for ${child.name}, +5 Enterprise Productivity.`,
            handlerKey: 'OPT_HEIR_EXECUTIVE_APPRENTICE',
            consequences: [
              ConsequenceEngine.cash('SUBTRACT', 15000, { description: `Funded executive apprenticeship stipend for ${child.name}` }),
              ConsequenceEngine.relationship(child.id, 'loyalty', 'ADD', 20, { description: 'Inspiring executive mentorship bond' }),
              ConsequenceEngine.relationship(child.id, 'respect', 'ADD', 25, { description: 'Reverence for founder strategic mastery' }),
              ConsequenceEngine.reputation('ADD', 5, { description: 'Active grooming of next-generation dynastic leadership' })
            ]
          },
          {
            id: `opt_heir_rotational_ops_${child.id}_${tick}`,
            label: `Rotational Ground Operations & Factory Floor Training`,
            description: `Require ${child.name} to work through procurement, sales, and manufacturing trenches to build true operational grit.`,
            risk: 'Low',
            timeHorizon: '6 months',
            projectedOutcome: `+25 Discipline, +15 Intellect, +10 Employee Morale across workforce.`,
            handlerKey: 'OPT_HEIR_ROTATIONAL_OPS',
            consequences: [
              ConsequenceEngine.relationship(child.id, 'trust', 'ADD', 15, { description: 'Earned workforce respect through humble operational rigor' }),
              ConsequenceEngine.companyMorale(leadCompany.id, 'ADD', 6, { description: 'Workforce inspired by founder heir on the front lines' })
            ]
          },
          {
            id: `opt_heir_incubator_grant_${child.id}_${tick}`,
            label: `Back Independent Subsidiary Incubation ($100,000 Seed Grant)`,
            description: `Provide capital for ${child.name} to build and launch an autonomous venture within the family conglomerate umbrella.`,
            cost: 100000,
            risk: 'Medium',
            timeHorizon: '12 months',
            projectedOutcome: `+30 Business Ability, +20 Leadership, +10 Dynasty Prestige.`,
            handlerKey: 'OPT_HEIR_INCUBATOR_GRANT',
            consequences: [
              ConsequenceEngine.cash('SUBTRACT', 100000, { description: `Seeded ${child.name}'s dynastic subsidiary incubator ($100k)` }),
              ConsequenceEngine.relationship(child.id, 'trust', 'ADD', 25, { description: 'Deep trust in independent entrepreneurial potential' }),
              ConsequenceEngine.reputation('ADD', 8, { description: 'Dynastic incubator initiative acclaimed in press' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_heir_mentor_${child.id}_${tick}`,
          category: 'FAMILY',
          type: 'OPPORTUNITY',
          title: `Dynastic Mentorship Opportunity: Grooming ${child.name}`,
          description: triggerReason,
          severity: 'High',
          priority: 82,
          source: child.name,
          sourceEntityId: child.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Family', 'Dynasty', 'Mentorship', 'Succession', child.name],
          triggerReason,
          choices: mentorshipChoices,
          consequences: {
            details: [`Mentorship pathway for ${child.name} at ${leadCompany.name}`]
          }
        });

        unlockedDecisions.push({
          id: `dec_heir_mentor_${child.id}_${tick}`,
          eventTypeKey: 'FAMILY_HEIR_MENTORSHIP',
          entityId: child.id,
          category: 'Family',
          title: `Executive Apprenticeship: Mentoring ${child.name}`,
          description: triggerReason,
          urgency: 'Standard',
          priority: 82,
          expiresInMonths: 4,
          options: mentorshipChoices.map(ch => ({
            id: ch.id,
            label: ch.label,
            description: ch.description,
            cost: ch.cost,
            risk: ch.risk || 'Low',
            timeHorizon: ch.timeHorizon || '6 months',
            projectedOutcome: ch.projectedOutcome || '',
            handlerKey: ch.handlerKey || 'OPT_FAMILY_ACTION',
            consequences: ch.consequences
          }))
        });
      }
    }
  }

  return {
    generatedEvents,
    unlockedDecisions,
    unlockedChains
  };
}

function calculateTotalNetWorth(state: GameState): number {
  const totalCash = state.finances.cash;
  const totalStocks = state.finances.stocks.reduce((acc, s) => acc + s.sharesOwned * s.currentPrice, 0);
  const totalProps = state.finances.properties.reduce((acc, p) => acc + p.currentValue, 0);
  const totalComp = state.companies.reduce((acc, c) => acc + (c.valuation * (c.playerOwnershipPercentage / 100)), 0);
  const totalSports = state.sports.ownedTeams.reduce((acc, t) => acc + t.valuation, 0);
  const totalDebt = state.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0);
  return (totalCash + totalStocks + totalProps + totalComp + totalSports) - totalDebt;
}
