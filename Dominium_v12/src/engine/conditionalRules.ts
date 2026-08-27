import { ConditionalConsequence, GameState } from '../types';
import { ConsequenceEngine } from './consequenceEngine';

/**
 * Systemic Conditional Rules evaluated against real GameState during the simulation loop.
 */
export function getSystemicConditionalRules(state: GameState): ConditionalConsequence[] {
  const currentCountry = state.world[state.currentCountryIndex] || state.world[0];
  const totalDebt = state.finances.loans.reduce((acc, l) => acc + l.remainingBalance, 0);
  const primaryCompany = state.companies[0];

  return [
    // 1. IF debt > 10M AND interestRate > 8% (or > 6%) -> Refinancing crisis risk event & cash penalty
    {
      id: 'rule_debt_crisis_interest',
      eventKey: 'RULE_DEBT_CRISIS_INTEREST',
      cooldownMonths: 6,
      priority: 85,
      name: 'Syndicated Debt Financing Squeeze',
      description: 'Massive leveraged liabilities combined with high central bank rates strain credit covenants.',
      condition: {
        logic: 'AND',
        conditions: [
          ConsequenceEngine.condition('FINANCE', 'debt', 'greaterThan', 10000000),
          ConsequenceEngine.condition('WORLD', 'interestRate', 'greaterThan', 6.0)
        ]
      },
      consequences: [
        ConsequenceEngine.stress('ADD', 10, {
          description: 'Debt service covenant warnings from syndicate lenders (+10 Stress)'
        }),
        ConsequenceEngine.cash('SUBTRACT', 45000, {
          description: 'Surplus credit risk margin premium levied by institutional creditors (-$45,000)'
        })
      ],
      unlocksDecisions: [
        {
          id: `dec_debt_refi_${state.simulationTick}`,
          eventTypeKey: 'RULE_DEBT_CRISIS_INTEREST',
          category: 'Investment',
          title: 'High-Leverage Debt Restructuring Proposal',
          description: `Your $${totalDebt.toLocaleString()} debt portfolio is exposed to ${currentCountry.centralBankInterestRate}% interest rates. Syndicate lenders demand restructuring or principal paydown.`,
          urgency: 'Critical',
          priority: 85,
          expiresInMonths: 3,
          options: [
            {
              id: `opt_refi_equity_${state.simulationTick}`,
              label: 'Raise Equity Partner Capital to Paydown Debt',
              description: 'Surrender 15% enterprise equity to an institutional private equity fund to retire $5M in senior debt.',
              risk: 'Medium',
              timeHorizon: '3 months',
              projectedOutcome: '-$5M Debt, -15% Company Equity, -15 Stress.',
              handlerKey: 'OPT_REFI_EQUITY',
              consequences: [
                ConsequenceEngine.debt('SUBTRACT', 5000000, { description: 'Retired $5,000,000 in senior debt' }),
                ...(primaryCompany ? [ConsequenceEngine.companyOwnership(primaryCompany.id, 'SUBTRACT', 15, { description: 'Issued 15% equity stake to PE partner' })] : []),
                ConsequenceEngine.stress('SUBTRACT', 15, { description: 'Relieved debt leverage pressure (-15 Stress)' })
              ]
            },
            {
              id: `opt_refi_austerity_${state.simulationTick}`,
              label: 'Aggressive Operational Austerity',
              description: 'Slash operating expenses across your operations to direct all free cash flow to servicing debt.',
              risk: 'High',
              timeHorizon: '12 months',
              projectedOutcome: 'Preserves equity, but reduces employee morale and operational velocity.',
              handlerKey: 'OPT_REFI_AUSTERITY',
              consequences: [
                ...(primaryCompany ? [
                  ConsequenceEngine.companyMorale(primaryCompany.id, 'SUBTRACT', 20, { description: 'Staff morale plummeted due to budget freezes (-20 Morale)' }),
                  ConsequenceEngine.companyRevenue(primaryCompany.id, 'PERCENTAGE_CHANGE', -5, { description: 'R&D cutbacks slowed short-term sales growth (-5%)' })
                ] : []),
                ConsequenceEngine.stress('ADD', 5, { description: 'High operational strain during austerity (+5 Stress)' })
              ]
            }
          ]
        }
      ]
    },

    // 2. IF stress > 80 -> Health deterioration and hospital emergency risk
    {
      id: 'rule_stress_burnout_health',
      eventKey: 'RULE_STRESS_BURNOUT_HEALTH',
      cooldownMonths: 4,
      priority: 80,
      name: 'Severe Executive Burnout & Health Deterioration',
      description: 'Chronic high stress (>80) is causing severe physiological deterioration.',
      condition: ConsequenceEngine.condition('PLAYER', 'stress', 'greaterThan', 80),
      consequences: [
        ConsequenceEngine.playerAttribute('health', 'SUBTRACT', 4, {
          description: 'Chronic stress causing cardiovascular fatigue and insomnia (-4 Health)'
        }),
        ConsequenceEngine.playerAttribute('happiness', 'SUBTRACT', 5, {
          description: 'Exhaustion impacting mood and executive clarity (-5 Happiness)'
        })
      ]
    },

    // 3. IF reputation < 30 -> Political capital erosion and loss of party support
    {
      id: 'rule_low_rep_political_loss',
      eventKey: 'RULE_LOW_REP_POLITICAL_LOSS',
      cooldownMonths: 6,
      priority: 70,
      name: 'Erosion of Public Standing & Political Abandonment',
      description: 'Low public reputation (<30) prompts political parties and donors to distance themselves.',
      condition: ConsequenceEngine.condition('PLAYER', 'reputation', 'lessThan', 30),
      consequences: [
        ConsequenceEngine.politicalCapital('SUBTRACT', 5, {
          description: 'Allies defect due to declining public standing (-5 Political Capital)'
        })
      ]
    },

    // 4. IF company revenue decreases significantly or company profit is negative -> Business crisis
    ...(primaryCompany && primaryCompany.monthlyNetProfit < 0 ? [{
      id: 'rule_negative_profit_crisis',
      eventKey: 'RULE_NEGATIVE_PROFIT_CRISIS',
      entityId: primaryCompany.id,
      cooldownMonths: 6,
      priority: 75,
      name: 'Corporate Cash Burn Contagion',
      description: 'Persistent monthly operating losses deplete treasury reserves.',
      condition: ConsequenceEngine.condition('COMPANY', 'profit', 'lessThan', 0, primaryCompany.id),
      consequences: [
        ConsequenceEngine.companyMorale(primaryCompany.id, 'SUBTRACT', 2, {
          description: `${primaryCompany.name} headcount anxieties grow due to monthly cash burn (-2 Morale)`
        })
      ]
    }] : []),

    // 5. IF player net worth > 100M -> High-profile sovereign and elite opportunities unlock
    {
      id: 'rule_centimillionaire_opportunities',
      eventKey: 'RULE_CENTIMILLIONAIRE_SOVEREIGN',
      cooldownMonths: 12,
      priority: 65,
      name: 'Centimillionaire Sovereign Access',
      description: 'Net worth exceeding $100,000,000 unlocks sovereign-level global investment deals and diplomatic invitations.',
      condition: ConsequenceEngine.condition('FINANCE', 'netWorth', 'greaterThan', 100000000),
      consequences: [
        ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 1, {
          description: 'Tier-1 ultra-high-net-worth status steadily expands global diplomatic reach (+1 World Influence)'
        })
      ],
      unlocksDecisions: [
        {
          id: `dec_sovereign_co_invest_${state.simulationTick}`,
          eventTypeKey: 'RULE_CENTIMILLIONAIRE_SOVEREIGN',
          category: 'Investment',
          title: 'Sovereign Wealth Fund Strategic Co-Investment',
          description: 'A national sovereign wealth fund invites you as an anchor private partner in a $500M national green hydrogen infrastructure project.',
          urgency: 'Standard',
          priority: 65,
          expiresInMonths: 4,
          options: [
            {
              id: `opt_sovereign_anchor_${state.simulationTick}`,
              label: 'Commit $20,000,000 Anchor Capital',
              description: 'Co-invest $20M for priority yield distribution, ministerial advisory seat, and global prestige.',
              cost: 20000000,
              risk: 'Medium',
              timeHorizon: '5 years',
              projectedOutcome: '+15 World Influence, +10 Reputation, high yield sovereign dividend.',
              handlerKey: 'OPT_SOVEREIGN_ANCHOR',
              consequences: [
                ConsequenceEngine.cash('SUBTRACT', 20000000, { description: 'Deployed $20,000,000 to Sovereign Green Hydrogen Consortium' }),
                ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 15, { description: 'Secured international sovereign board status (+15 World Influence)' }),
                ConsequenceEngine.reputation('ADD', 10, { description: 'Global statesman investor reputation (+10)' })
              ]
            },
            {
              id: `opt_sovereign_decline_${state.simulationTick}`,
              label: 'Respectfully Decline',
              description: 'Retain private market focus without government partnership entanglements.',
              risk: 'Low',
              timeHorizon: 'Immediate',
              projectedOutcome: 'Preserves liquidity balance.',
              handlerKey: 'OPT_SOVEREIGN_DECLINE',
              consequences: []
            }
          ]
        }
      ]
    },

    // 6. IF political influence / capital > 70 -> Elite political appointments unlock
    {
      id: 'rule_elite_political_influence',
      name: 'National Statesman Kingmaker Status',
      description: 'Commanding over 70 political capital grants direct cabinet influence and national policymaking power.',
      condition: ConsequenceEngine.condition('POLITICS', 'politicalCapital', 'greaterThan', 70),
      consequences: [
        ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 2, {
          description: 'Formidable legislative leverage elevates world diplomatic profile (+2 World Influence)'
        })
      ]
    },

    // 7. IF Power Tier >= ELITE -> High-Profile Security Burden & Regulatory Scrutiny
    {
      id: 'rule_elite_power_tier_burdens',
      name: 'Elite Power Tier Scrutiny & Executive Security',
      description: 'Elite, Powerful, and Global power tiers face mandatory executive protection overhead and continuous public scrutiny.',
      condition: ConsequenceEngine.condition('POWER', 'tier', 'greaterThanOrEqual', 'ELITE'),
      consequences: [
        ConsequenceEngine.cash('SUBTRACT', 25000, {
          description: 'Monthly executive close-protection detail and intelligence defense overhead (-$25,000)'
        }),
        ConsequenceEngine.reputation('ADD', 1, {
          description: 'Sustained elite presence commands public stature (+1 Reputation)'
        })
      ]
    },

    // 8. IF Power Tier == GLOBAL -> Sovereign Market Mover Status
    {
      id: 'rule_global_power_market_mover',
      name: 'Global Sovereign Hegemon Footprint',
      description: 'As a Global tier powerbroker, your personal enterprise decisions move international markets and shape diplomatic treaties.',
      condition: ConsequenceEngine.condition('POWER', 'tier', 'equals', 'GLOBAL'),
      consequences: [
        ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 3, {
          description: 'Global summit leadership expands international diplomatic leverage (+3 World Influence)'
        }),
        ConsequenceEngine.reputation('ADD', 2, {
          description: 'Historic dynastic legacy recognized globally (+2 Reputation)'
        })
      ]
    }
  ];
}
