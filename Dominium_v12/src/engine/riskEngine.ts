import { 
  GameState, 
  PendingDecision, 
  DecisionOption, 
  RiskResolutionResult,
  PowerTier
} from '../types';
import { calculateNetWorth } from './simulationEngine';

/**
 * Calculates a deep, state-aware success probability for an executive decision choice,
 * replacing generic coin flips with true contextual mechanics (player skill, stress,
 * liquidity buffers, corporate health, macro climate, and power tiers).
 */
export function calculateStateAwareRiskProbability(
  state: GameState,
  decision: PendingDecision,
  choice: DecisionOption
): RiskResolutionResult {
  // 1. Base Probability by explicit Risk level
  const risk = choice.risk || decision.risk || 'Medium';
  let baseProb = 0.72;
  if (risk === 'Low') baseProb = 0.90;
  else if (risk === 'High') baseProb = 0.48;

  const modifiers: { label: string; value: number; formatted: string }[] = [];

  // 2. Player Attributes
  const { intelligence = 50, reputation = 50, stress = 0, health = 80, worldInfluence = 0 } = state.character.attributes;

  // Intelligence modifier (-9% to +15%)
  const intMod = Number(((intelligence - 50) * 0.003).toFixed(3));
  if (Math.abs(intMod) >= 0.01) {
    modifiers.push({
      label: intMod > 0 ? 'High Executive Intelligence' : 'Low Strategic Intelligence',
      value: intMod,
      formatted: `${intMod > 0 ? '+' : ''}${(intMod * 100).toFixed(1)}%`
    });
  }

  // Reputation modifier (-8% to +10%)
  const repMod = Number(((reputation - 50) * 0.002).toFixed(3));
  if (Math.abs(repMod) >= 0.01) {
    modifiers.push({
      label: repMod > 0 ? 'Prestigious Reputation' : 'Impaired Public Trust',
      value: repMod,
      formatted: `${repMod > 0 ? '+' : ''}${(repMod * 100).toFixed(1)}%`
    });
  }

  // Stress Penalty (up to -16%)
  if (stress > 50) {
    const stressPenalty = -Number(((stress - 50) * 0.0035).toFixed(3));
    modifiers.push({
      label: 'Cognitive Stress & Executive Fatigue',
      value: stressPenalty,
      formatted: `${(stressPenalty * 100).toFixed(1)}%`
    });
  }

  // Health Deterioration Penalty (up to -12%)
  if (health < 50) {
    const healthPenalty = -Number(((50 - health) * 0.003).toFixed(3));
    modifiers.push({
      label: 'Physical Health Deterioration',
      value: healthPenalty,
      formatted: `${(healthPenalty * 100).toFixed(1)}%`
    });
  }

  // 3. Financial Liquidity & Capital Buffer
  const cost = choice.cost || 0;
  const cash = state.finances.cash;
  if (cost > 0) {
    if (cash >= cost * 3) {
      modifiers.push({
        label: 'Strong Capital Reserve Buffer (3x+)',
        value: 0.08,
        formatted: '+8.0%'
      });
    } else if (cash < cost * 1.15) {
      modifiers.push({
        label: 'Tight Liquidity & Execution Risk',
        value: -0.12,
        formatted: '-12.0%'
      });
    }
  }

  // 4. Debt Leverage Covenants
  const totalDebt = (state.finances.loans || []).reduce((acc, l) => acc + l.remainingBalance, 0) +
    (state.finances.properties || []).reduce((acc, p) => acc + (p.mortgage?.remainingBalance || 0), 0);
  const netWorth = calculateNetWorth(state);

  if (totalDebt > 5000000 && netWorth > 0) {
    const leverageRatio = totalDebt / netWorth;
    if (leverageRatio > 0.8) {
      modifiers.push({
        label: 'High Debt Leverage Strain',
        value: -0.10,
        formatted: '-10.0%'
      });
    }
  }

  // 5. Domain-Specific Modifiers
  const category = (decision.category || '').toLowerCase();

  // Business Category
  if (category.includes('business') || category.includes('enterprise') || decision.entityId) {
    let targetCompany = decision.entityId 
      ? state.companies.find(c => c.id === decision.entityId)
      : state.companies[0];

    if (targetCompany) {
      if (targetCompany.employeeMorale > 75) {
        modifiers.push({
          label: `${targetCompany.name} High Workforce Morale`,
          value: 0.06,
          formatted: '+6.0%'
        });
      } else if (targetCompany.employeeMorale < 40) {
        modifiers.push({
          label: `${targetCompany.name} Workforce Discontent & Attrition`,
          value: -0.08,
          formatted: '-8.0%'
        });
      }

      if (targetCompany.monthlyNetProfit > 0) {
        modifiers.push({
          label: `${targetCompany.name} Cash-Flow Positive Operations`,
          value: 0.04,
          formatted: '+4.0%'
        });
      } else if (targetCompany.monthlyNetProfit < 0) {
        modifiers.push({
          label: `${targetCompany.name} Operating Cash Burn`,
          value: -0.06,
          formatted: '-6.0%'
        });
      }
    }
  }

  // Politics Category
  if (category.includes('politic') || category.includes('public')) {
    const approval = state.politics.currentOffice.approvalRating;
    const capital = state.politics.currentOffice.politicalCapital;

    if (approval > 65) {
      modifiers.push({
        label: 'Strong Public Mandate (>65% Approval)',
        value: 0.08,
        formatted: '+8.0%'
      });
    } else if (approval < 40) {
      modifiers.push({
        label: 'Severe Public Discontent (<40% Approval)',
        value: -0.10,
        formatted: '-10.0%'
      });
    }

    if (capital > 70) {
      modifiers.push({
        label: 'Formidable Legislative Capital',
        value: 0.06,
        formatted: '+6.0%'
      });
    }
  }

  // Family Category
  if (category.includes('family') || category.includes('relationship')) {
    if (state.relationships.length > 0) {
      const avgTrust = state.relationships.reduce((acc, r) => acc + r.trust, 0) / state.relationships.length;
      if (avgTrust > 75) {
        modifiers.push({
          label: 'Strong Household Trust & Harmony',
          value: 0.08,
          formatted: '+8.0%'
        });
      } else if (avgTrust < 45) {
        modifiers.push({
          label: 'Household Discord & Friction',
          value: -0.08,
          formatted: '-8.0%'
        });
      }
    }
  }

  // Macroeconomics
  const country = state.world[state.currentCountryIndex] || state.world[0];
  if (country) {
    if (country.businessCycle === 'Boom') {
      modifiers.push({
        label: 'Macroeconomic Expansion & High Consumer Sentiment',
        value: 0.06,
        formatted: '+6.0%'
      });
    } else if (country.businessCycle === 'Recession') {
      modifiers.push({
        label: 'Macroeconomic Recessionary Pressures',
        value: -0.08,
        formatted: '-8.0%'
      });
    }

    if (country.centralBankInterestRate > 7.0 && cost > 1000000) {
      modifiers.push({
        label: 'High Central Bank Rates & Cost of Capital',
        value: -0.05,
        formatted: '-5.0%'
      });
    }
  }

  // Power Tier Advantage
  const powerTier = state.playerPowerProfile?.powerTier;
  if (powerTier === 'POWERFUL') {
    modifiers.push({
      label: 'Powerful Power Tier Influence',
      value: 0.04,
      formatted: '+4.0%'
    });
  } else if (powerTier === 'GLOBAL') {
    modifiers.push({
      label: 'Global Hegemon Diplomatic Standing',
      value: 0.08,
      formatted: '+8.0%'
    });
  }

  // 6. Aggregate Total Probability & Clamp between 5% and 95%
  const totalMod = modifiers.reduce((acc, m) => acc + m.value, 0);
  const rawProb = baseProb + totalMod;
  const clampedProb = Math.max(0.05, Math.min(0.95, Number(rawProb.toFixed(3))));

  const positiveFactors = modifiers.filter(m => m.value > 0).map(m => `${m.label} (${m.formatted})`);
  const negativeFactors = modifiers.filter(m => m.value < 0).map(m => `${m.label} (${m.formatted})`);

  // Format human-readable breakdown text
  const breakdownLines = modifiers.map(m => `• ${m.label}: ${m.formatted}`);
  const breakdownText = `Base Probability: ${(baseProb * 100).toFixed(0)}%\n` +
    (breakdownLines.length > 0 ? `${breakdownLines.join('\n')}\n` : '') +
    `Final Adjusted Success Rate: ${(clampedProb * 100).toFixed(1)}%`;

  return {
    successProbability: clampedProb,
    isSuccess: false, // will be evaluated at roll time
    baseProbability: baseProb,
    modifiers,
    positiveFactors,
    negativeFactors,
    breakdownText
  };
}

/**
 * Resolves the decision risk outcome using state-aware mechanics and generates a structured result.
 */
export function resolveDecisionRiskOutcome(
  state: GameState,
  decision: PendingDecision,
  choice: DecisionOption,
  forcedRoll?: number
): RiskResolutionResult {
  const calc = calculateStateAwareRiskProbability(state, decision, choice);
  const roll = typeof forcedRoll === 'number' ? forcedRoll : Math.random();
  const isSuccess = roll < calc.successProbability;

  return {
    ...calc,
    isSuccess
  };
}
