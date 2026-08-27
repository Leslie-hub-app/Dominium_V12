import {
  GameState,
  LivingNpc,
  NPCRequestToPlayer,
  Company,
  LifeEvent,
  NewsItem
} from '../types';
import { recordDecisionWithConsequences } from './historyEngine';
import { recordLifeBiography } from './lifeEngine';

export interface NpcActionResult {
  success: boolean;
  message: string;
  nextState: GameState;
}

/**
 * Handles the Player's response to an incoming NPC Request (Job Application, Investment Pitch, etc.)
 */
export function respondToNpcRequest(
  state: GameState,
  requestId: string,
  response: 'ACCEPT' | 'DECLINE' | 'NEGOTIATE' | 'NEGOTIATED',
  customTerms?: { salary?: number; investmentAmount?: number; equityPercent?: number }
): NpcActionResult {
  const lw = state.livingWorld;
  if (!lw || !Array.isArray(lw.npcRequestsToPlayer)) {
    return { success: false, message: 'No active requests found.', nextState: state };
  }

  const req = lw.npcRequestsToPlayer.find(r => r.id === requestId);
  if (!req) {
    return { success: false, message: 'Request not found.', nextState: state };
  }

  const npc = lw.npcs.find(n => n.id === req.npcId);
  const currentYear = state.currentYear;
  const currentMonth = state.currentMonth;

  if (response === 'DECLINE') {
    req.status = 'DECLINED';
    if (npc) {
      npc.relationshipScore = Math.max(-100, npc.relationshipScore - 4);
      npc.memories.push({
        id: `mem_dec_${Date.now()}`,
        tick: state.simulationTick,
        month: currentMonth,
        year: currentYear,
        sourceEntityId: 'player',
        sourceEntityName: 'Player',
        eventType: 'DECLINED_PROPOSAL',
        emotionalImpact: -15,
        description: `Player declined proposal for ${req.title}.`,
        isPermanent: false
      });
    }

    return {
      success: true,
      message: `Respectfully declined ${req.npcName}'s proposal.`,
      nextState: state
    };
  }

  if (response === 'ACCEPT' || response === 'NEGOTIATE') {
    req.status = response === 'ACCEPT' ? 'ACCEPTED' : 'NEGOTIATED';

    if (req.requestType === 'JOB_APPLICATION') {
      // Find player company
      const targetCompany = state.companies.find(c => c.id === req.targetCompanyId) || state.companies[0];
      if (!targetCompany) {
        return { success: false, message: 'No company available to hire into.', nextState: state };
      }

      const agreedSalary = customTerms?.salary || req.requestedSalaryMonthly || 18000;
      targetCompany.employeesCount += 1;
      targetCompany.monthlyExpenses += agreedSalary;
      targetCompany.employeeMorale = Math.min(100, (targetCompany.employeeMorale || 70) + 4);

      if (npc) {
        npc.relationshipScore = Math.min(100, npc.relationshipScore + 25);
        npc.career.occupation = req.targetJobTitle || 'Executive Director';
        npc.career.employerName = targetCompany.name;
        npc.career.employerCompanyId = targetCompany.id;
        npc.career.monthlySalary = agreedSalary;
        npc.recentActions.push(`Joined ${targetCompany.name} as ${npc.career.occupation}.`);
        npc.biographyTimeline.push(`${currentYear}: Hired by ${targetCompany.name} as executive.`);

        npc.memories.push({
          id: `mem_hired_${Date.now()}`,
          tick: state.simulationTick,
          month: currentMonth,
          year: currentYear,
          sourceEntityId: 'player',
          sourceEntityName: 'Player',
          eventType: 'HIRED_BY_PLAYER',
          emotionalImpact: 40,
          description: `Hired by Player into executive leadership at ${targetCompany.name}.`,
          isPermanent: true
        });
      }

      state.eventsFeed.unshift({
        id: `ev_hire_${Date.now()}`,
        category: 'BUSINESS',
        title: `Hired ${req.npcName} to ${targetCompany.name}`,
        description: `${req.npcName} joined as ${req.targetJobTitle || 'Executive'} at $${agreedSalary.toLocaleString()}/mo.`,
        createdMonth: currentMonth,
        createdYear: currentYear
      });

      return {
        success: true,
        message: `Successfully appointed ${req.npcName} to ${targetCompany.name}!`,
        nextState: state
      };
    }

    if (req.requestType === 'INVESTMENT_PITCH') {
      const amount = customTerms?.investmentAmount || req.financialAmount || 100000;
      const equity = customTerms?.equityPercent || req.equityOfferedPercent || 15;

      if (state.finances.cash < amount) {
        return { success: false, message: `Insufficient cash ($${amount.toLocaleString()} required).`, nextState: state };
      }

      state.finances.cash -= amount;
      if (npc) {
        npc.cash += amount;
        npc.relationshipScore = Math.min(100, npc.relationshipScore + 35);
        npc.isAlly = true;
        npc.recentActions.push(`Secured $${amount.toLocaleString()} seed backing from Player.`);
        npc.biographyTimeline.push(`${currentYear}: Secured crucial venture backing from Player.`);

        npc.memories.push({
          id: `mem_inv_${Date.now()}`,
          tick: state.simulationTick,
          month: currentMonth,
          year: currentYear,
          sourceEntityId: 'player',
          sourceEntityName: 'Player',
          eventType: 'INVESTED_BY_PLAYER',
          emotionalImpact: 50,
          description: `Player provided $${amount.toLocaleString()} venture funding for ${equity}% equity.`,
          isPermanent: true
        });
      }

      state.eventsFeed.unshift({
        id: `ev_inv_${Date.now()}`,
        category: 'FINANCE',
        title: `Invested in ${req.npcName}'s Venture`,
        description: `Committed $${amount.toLocaleString()} seed investment for ${equity}% equity stake.`,
        createdMonth: currentMonth,
        createdYear: currentYear
      });

      return {
        success: true,
        message: `Successfully executed seed investment of $${amount.toLocaleString()} in ${req.npcName}'s venture!`,
        nextState: state
      };
    }
  }

  return { success: true, message: 'Request processed.', nextState: state };
}

/**
 * Player offers a job position directly to any living NPC.
 */
export function offerJobToNpc(
  state: GameState,
  npcId: string,
  companyId: string,
  role: string,
  monthlySalary: number
): NpcActionResult {
  const lw = state.livingWorld;
  const npc = lw?.npcs.find(n => n.id === npcId);
  const company = state.companies.find(c => c.id === companyId);

  if (!npc) return { success: false, message: 'NPC not found.', nextState: state };
  if (!company) return { success: false, message: 'Company not found.', nextState: state };

  // NPC evaluates the offer
  const currentSalary = npc.career?.monthlySalary || 8000;
  const salaryIncreaseRatio = monthlySalary / Math.max(1, currentSalary);
  const loyaltyFactor = (100 - npc.personality.loyalty) / 100;
  const ambitionBonus = npc.personality.ambition / 100;
  const relationshipBonus = (npc.relationshipScore + 50) / 100;

  const acceptanceScore = (salaryIncreaseRatio * 40) + (loyaltyFactor * 20) + (ambitionBonus * 20) + (relationshipBonus * 20);

  if (acceptanceScore >= 60 || monthlySalary >= currentSalary * 1.35) {
    // Accepted
    company.employeesCount += 1;
    company.monthlyExpenses += monthlySalary;
    company.employeeMorale = Math.min(100, (company.employeeMorale || 70) + 3);

    npc.career.occupation = role;
    npc.career.employerName = company.name;
    npc.career.employerCompanyId = company.id;
    npc.career.monthlySalary = monthlySalary;
    npc.relationshipScore = Math.min(100, npc.relationshipScore + 20);
    npc.recentActions.push(`Accepted executive appointment at ${company.name}.`);

    return {
      success: true,
      message: `${npc.firstName} ${npc.lastName} enthusiastically accepted your offer as ${role} at $${monthlySalary.toLocaleString()}/mo!`,
      nextState: state
    };
  } else {
    npc.relationshipScore = Math.min(100, npc.relationshipScore + 2); // Flattered
    return {
      success: false,
      message: `${npc.firstName} ${npc.lastName} politely declined your offer, citing existing commitments.`,
      nextState: state
    };
  }
}

/**
 * Player socializes / spends time with a living NPC to build trust, respect, and intelligence.
 */
export function socializeWithLivingNpc(
  state: GameState,
  npcId: string,
  actionType: 'COFFEE' | 'DINNER' | 'GIFT' | 'STRATEGY_TALK'
): NpcActionResult {
  const lw = state.livingWorld;
  const npc = lw?.npcs.find(n => n.id === npcId);
  if (!npc) return { success: false, message: 'NPC not found.', nextState: state };

  let cost = 0;
  let trustDelta = 0;
  let respectDelta = 0;
  let desc = '';

  switch (actionType) {
    case 'COFFEE':
      cost = 50;
      trustDelta = 4;
      respectDelta = 2;
      desc = `Enjoyed an informal coffee and economic discussion with ${npc.firstName} ${npc.lastName}.`;
      break;

    case 'DINNER':
      cost = 450;
      trustDelta = 8;
      respectDelta = 6;
      desc = `Hosted ${npc.firstName} ${npc.lastName} for a private fine-dining dinner at a premier club.`;
      break;

    case 'GIFT':
      cost = 1500;
      trustDelta = 12;
      respectDelta = 8;
      desc = `Presented ${npc.firstName} ${npc.lastName} with an exclusive tailored luxury gift.`;
      break;

    case 'STRATEGY_TALK':
      cost = 0;
      trustDelta = 5;
      respectDelta = 10;
      desc = `Conducted a high-level strategic alignment session regarding market trends with ${npc.firstName} ${npc.lastName}.`;
      break;
  }

  if (state.finances.cash < cost) {
    return { success: false, message: `Insufficient cash ($${cost.toLocaleString()} required).`, nextState: state };
  }

  state.finances.cash -= cost;
  npc.relationshipScore = Math.min(100, npc.relationshipScore + trustDelta + Math.round(respectDelta / 2));
  if (npc.relationshipScore > 40) npc.isAlly = true;

  npc.memories.push({
    id: `mem_soc_${Date.now()}`,
    tick: state.simulationTick,
    month: state.currentMonth,
    year: state.currentYear,
    sourceEntityId: 'player',
    sourceEntityName: 'Player',
    eventType: 'SOCIAL_INTERACTION',
    emotionalImpact: trustDelta * 2,
    description: desc,
    isPermanent: false
  });

  return {
    success: true,
    message: `${desc} (Relationship +${trustDelta + Math.round(respectDelta / 2)})`,
    nextState: state
  };
}
