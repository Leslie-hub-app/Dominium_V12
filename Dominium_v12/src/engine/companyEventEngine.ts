import { 
  GameState, 
  EventChain, 
  EventChainStage, 
  SimulationEventChoice, 
  SimulationEvent,
  PendingDecision,
  SimulationDiff,
  Company
} from '../types';
import { ConsequenceEngine } from './consequenceEngine';
import { isEventOnCooldown } from './eventControlEngine';
import { isPowerTierAtLeast } from './powerTierEngine';
import { createBusinessCrisisChain, createSupplyChainCrisisChain } from './eventChainEngine';

// ============================================================================
// PHASE 17: COMPANY EVENT ENGINE & SYSTEMIC CORPORATE TRIGGERS
// ============================================================================

/**
 * 1. EXPANSION & NEW MARKET LAUNCH EVENT CHAIN
 * Triggered on significant revenue growth (>20%) or strong market position.
 */
export function createCompanyExpansionChain(
  companyId: string,
  companyName: string,
  startMonth: number,
  startYear: number,
  state: GameState
): EventChain {
  const chainId = `chain_biz_expand_${companyId}_${Date.now()}`;
  const company = state.companies.find(c => c.id === companyId);
  const industry = company?.industry || 'Enterprise';

  const stages: EventChainStage[] = [
    {
      id: 'stage_expand_strategy',
      sequence: 1,
      title: `Global Expansion Strategy: ${companyName}`,
      description: `Fueled by outstanding revenue growth and robust unit economics in ${industry}, the board and executive committee at ${companyName} are reviewing formal expansion proposals to capture international market share.`,
      choices: [
        {
          id: 'opt_expand_international',
          label: 'Launch Overseas Regional Hubs ($250,000 Allocation)',
          description: 'Establish direct European and Asian distribution sales headquarters to secure foreign multi-national enterprise accounts.',
          cost: 250000,
          risk: 'Medium',
          timeHorizon: '3-6 months',
          projectedOutcome: '+25% Monthly Revenue, +$250k CapEx, +15% Market Share, +40 Staff Headcount.',
          handlerKey: 'OPT_EXPAND_INTERNATIONAL',
          consequences: [
            ConsequenceEngine.companyReserve(companyId, 'SUBTRACT', 250000, { description: 'Funded international expansion CapEx' }),
            ConsequenceEngine.companyRevenue(companyId, 'PERCENTAGE_CHANGE', 25, { description: 'Global operations boosted sales (+25%)' }),
            ConsequenceEngine.companyEmployees(companyId, 'ADD', 40, { description: 'Hired international regional teams (+40 Headcount)' }),
            ConsequenceEngine.companyMarketShare(companyId, 'ADD', 8, { description: 'Global expansion gained market share' }),
            ConsequenceEngine.reputation('ADD', 5, { description: 'Acclaimed international corporate expansion' })
          ]
        },
        {
          id: 'opt_expand_nextgen_rd',
          label: 'Fund Next-Generation Breakthrough R&D ($150,000)',
          description: 'Deploy aggressive R&D to introduce a premium flagship product tier with higher gross margins and patent protections.',
          cost: 150000,
          risk: 'Low',
          timeHorizon: '3 months',
          projectedOutcome: '+20% Product Quality, +15% Brand Reputation, +15% Monthly Revenue, +25 Staff.',
          handlerKey: 'OPT_EXPAND_RD',
          consequences: [
            ConsequenceEngine.companyReserve(companyId, 'SUBTRACT', 150000, { description: 'Allocated flagship R&D budget' }),
            ConsequenceEngine.companyProductQuality(companyId, 'ADD', 20, { description: 'Breakthrough product quality breakthrough (+20)' }),
            ConsequenceEngine.companyBrandReputation(companyId, 'ADD', 15, { description: 'Market reputation for technology leadership (+15)' }),
            ConsequenceEngine.companyRevenue(companyId, 'PERCENTAGE_CHANGE', 15, { description: 'Premium product tier sales increased revenue (+15%)' })
          ]
        },
        {
          id: 'opt_expand_retained_earnings',
          label: 'Consolidate Treasury & Issue Special Dividend',
          description: 'Maintain current operational footprint and distribute a portion of surging profits directly to shareholders.',
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: 'Distributes cash to founder, fortifies cash reserves without adding operational overhead.',
          handlerKey: 'OPT_EXPAND_DIVIDEND',
          consequences: [
            ConsequenceEngine.cash('ADD', 100000, { description: 'Received special founder growth dividend ($100,000)' }),
            ConsequenceEngine.companyReserve(companyId, 'ADD', 50000, { description: 'Retained earnings fortified cash vault' }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 6, { description: 'Rewarded by corporate dividend payout' })
          ]
        }
      ],
      nextStage: 'stage_expand_integration',
      delayMonths: 3
    },
    {
      id: 'stage_expand_integration',
      sequence: 2,
      title: `Expansion Operational Integration at ${companyName}`,
      description: `Three months into the expansion roadmap, leadership presents the initial return on invested capital and market penetration metrics.`,
      choices: [
        {
          id: 'opt_integration_aggressive',
          label: 'Scale Aggressive Marketing Blitz ($75,000)',
          description: 'Accelerate digital acquisition campaigns across newly unlocked customer segments.',
          cost: 75000,
          risk: 'Low',
          timeHorizon: '3 months',
          projectedOutcome: '+12% Monthly Revenue, +8% Brand Reputation.',
          handlerKey: 'OPT_INTEGRATION_MARKETING',
          consequences: [
            ConsequenceEngine.companyReserve(companyId, 'SUBTRACT', 75000, { description: 'Marketing acceleration blitz' }),
            ConsequenceEngine.companyRevenue(companyId, 'PERCENTAGE_CHANGE', 12, { description: 'Marketing campaign expanded sales (+12%)' }),
            ConsequenceEngine.companyBrandReputation(companyId, 'ADD', 8, { description: 'Expanded brand reach' })
          ]
        },
        {
          id: 'opt_integration_operational_efficiency',
          label: 'Optimize Operational Logistics & Supply Chains',
          description: 'Implement automated ERP systems and negotiate volume vendor discounts to widen operating margins.',
          risk: 'Low',
          timeHorizon: '3 months',
          projectedOutcome: '-10% Monthly Expenses, +10 Employee Morale, enhances EBITDA margin.',
          handlerKey: 'OPT_INTEGRATION_LOGISTICS',
          consequences: [
            ConsequenceEngine.companyExpenses(companyId, 'PERCENTAGE_CHANGE', -10, { description: 'Supply chain automation reduced expenses by 10%' }),
            ConsequenceEngine.companyMorale(companyId, 'ADD', 10, { description: 'Streamlined workflow boosted morale (+10)' })
          ]
        }
      ],
      nextStage: 'stage_expand_milestone_wrap',
      delayMonths: 3
    },
    {
      id: 'stage_expand_milestone_wrap',
      sequence: 3,
      title: `Expansion Milestone: ${companyName} Dominates Sector`,
      description: `The expansion initiative reaches completion. Market analysts upgrade the enterprise rating, cementing ${companyName} as an industry powerhouse.`,
      choices: [
        {
          id: 'opt_expand_seal_victory',
          label: 'Celebrate Market Leadership & Ratify Growth Multiple',
          description: 'Formalize audited enterprise valuation gains and host an executive shareholder celebration.',
          risk: 'Low',
          timeHorizon: 'Permanent',
          projectedOutcome: '+30% Company Valuation, +8 Reputation, +6 World Influence.',
          handlerKey: 'OPT_EXPAND_COMPLETE',
          consequences: [
            ConsequenceEngine.companyValuation(companyId, 'PERCENTAGE_CHANGE', 30, { description: 'Valuation surged +30% following successful global expansion' }),
            ConsequenceEngine.reputation('ADD', 8, { description: 'Celebrated corporate growth titan (+8)' }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 6, { description: 'Global business footprint recognized (+6)' }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 10, { description: 'Triumphant business expansion milestone' })
          ]
        }
      ]
    }
  ];

  return {
    id: chainId,
    name: `Corporate Expansion & Global Dominance: ${companyName}`,
    category: 'BUSINESS' as any,
    startedMonth: startMonth,
    startedYear: startYear,
    currentStage: stages[0].id,
    status: 'Active',
    variables: { companyId, companyName },
    stages,
    history: []
  };
}

/**
 * 2. C-SUITE LEADERSHIP CHANGE & REORGANIZATION EVENT CHAIN
 * Triggered by executive discord, low employee morale, or strategic pivots.
 */
export function createLeadershipReorganizationChain(
  companyId: string,
  companyName: string,
  startMonth: number,
  startYear: number,
  state: GameState
): EventChain {
  const chainId = `chain_biz_lead_${companyId}_${Date.now()}`;

  const stages: EventChainStage[] = [
    {
      id: 'stage_lead_csuite_search',
      sequence: 1,
      title: `Executive Leadership Pivot at ${companyName}`,
      description: `To accelerate corporate execution and resolve organizational bottlenecks at ${companyName}, the board has authorized an executive leadership restructure.`,
      choices: [
        {
          id: 'opt_hire_visionary_ceo',
          label: 'Recruit Elite Veteran CEO from Tier-1 Conglomerate ($200k Package)',
          description: 'Hire an acclaimed corporate titan known for hyper-scaling enterprise revenues and institutional credibility.',
          cost: 200000,
          risk: 'Medium',
          timeHorizon: 'Immediate',
          projectedOutcome: '+20% Monthly Revenue, +15 Reputation, +$200k Executive Signing Bonus.',
          handlerKey: 'OPT_HIRE_VISIONARY_CEO',
          consequences: [
            ConsequenceEngine.companyReserve(companyId, 'SUBTRACT', 200000, { description: 'Executive search and signing bonus' }),
            ConsequenceEngine.companyRevenue(companyId, 'PERCENTAGE_CHANGE', 20, { description: 'New CEO commercial deals expanded revenue (+20%)' }),
            ConsequenceEngine.companyMorale(companyId, 'ADD', 15, { description: 'Inspiring executive leadership elevated morale (+15)' }),
            ConsequenceEngine.reputation('ADD', 6, { description: 'Secured premier industry executive' })
          ]
        },
        {
          id: 'opt_hire_turnaround_cfo',
          label: 'Appoint Prudent Turnaround CFO & Chief Operating Officer',
          description: 'Focus on financial rigor, strict unit cost discipline, and operational automation.',
          cost: 100000,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: '-15% Monthly Expenses, +10% EBITDA margin, strengthens balance sheet.',
          handlerKey: 'OPT_HIRE_PRUDENT_CFO',
          consequences: [
            ConsequenceEngine.companyReserve(companyId, 'SUBTRACT', 100000, { description: 'CFO onboarding and financial audit' }),
            ConsequenceEngine.companyExpenses(companyId, 'PERCENTAGE_CHANGE', -15, { description: 'New CFO pruned corporate overhead (-15%)' }),
            ConsequenceEngine.companyMorale(companyId, 'ADD', 8, { description: 'Financial clarity restored confidence' })
          ]
        },
        {
          id: 'opt_lead_internal_promotion',
          label: 'Promote Star Internal VP to Executive Leadership',
          description: 'Reward organic talent, preserve institutional culture, and maintain lean executive compensation.',
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: '+20 Employee Morale, zero executive search fees, seamless operational continuity.',
          handlerKey: 'OPT_PROMOTE_INTERNAL',
          consequences: [
            ConsequenceEngine.companyMorale(companyId, 'ADD', 20, { description: 'Internal promotion galvanized workforce morale (+20)' }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 4, { description: 'Empowered internal company talent' })
          ]
        }
      ],
      nextStage: 'stage_lead_audit_results',
      delayMonths: 3
    },
    {
      id: 'stage_lead_audit_results',
      sequence: 2,
      title: `Executive Governance Audit at ${companyName}`,
      description: `The new executive structure has completed its first 100 days. Key performance indicators show transformed operating cadence.`,
      choices: [
        {
          id: 'opt_lead_conclude_success',
          label: 'Ratify Long-Term Executive Incentive Plan (LTIP)',
          description: 'Align C-suite equity options with long-term enterprise valuation growth.',
          risk: 'Low',
          timeHorizon: 'Permanent',
          projectedOutcome: '+15% Company Valuation, +10 Morale, long-term corporate stability.',
          handlerKey: 'OPT_LEAD_LTIP_RATIFY',
          consequences: [
            ConsequenceEngine.companyValuation(companyId, 'PERCENTAGE_CHANGE', 15, { description: 'Leadership stability boosted valuation (+15%)' }),
            ConsequenceEngine.companyMorale(companyId, 'ADD', 10, { description: 'Equity alignment locked in top talent' })
          ]
        }
      ]
    }
  ];

  return {
    id: chainId,
    name: `C-Suite Leadership Restructure: ${companyName}`,
    category: 'BUSINESS' as any,
    startedMonth: startMonth,
    startedYear: startYear,
    currentStage: stages[0].id,
    status: 'Active',
    variables: { companyId, companyName },
    stages,
    history: []
  };
}

// ============================================================================
// EVALUATION ENGINE: AUTOMATIC DETECTION OF ALL 16 CORPORATE SYSTEMIC STATES
// ============================================================================

export function evaluateCompanyEventTriggers(
  prevState: GameState,
  currentState: GameState,
  diff: SimulationDiff
): {
  generatedEvents: SimulationEvent[];
  unlockedDecisions: PendingDecision[];
  unlockedChains: EventChain[];
} {
  const generatedEvents: SimulationEvent[] = [];
  const unlockedDecisions: PendingDecision[] = [];
  const unlockedChains: EventChain[] = [];

  const currentMonth = currentState.currentMonth;
  const currentYear = currentState.currentYear;
  const age = currentState.character.age;
  const tick = currentState.simulationTick;

  for (const comp of currentState.companies) {
    const prevComp = prevState.companies.find(c => c.id === comp.id);
    const oldRev = prevComp ? prevComp.monthlyRevenue : comp.monthlyRevenue;
    const revDiff = comp.monthlyRevenue - oldRev;
    const revPct = oldRev > 0 ? (revDiff / oldRev) * 100 : 0;

    const oldProf = prevComp ? prevComp.monthlyNetProfit : comp.monthlyNetProfit;
    const profDiff = comp.monthlyNetProfit - oldProf;
    const profPct = oldProf > 0 ? (profDiff / oldProf) * 100 : 0;

    const oldVal = prevComp ? prevComp.valuation : comp.valuation;
    const oldMorale = prevComp ? prevComp.employeeMorale : comp.employeeMorale;
    const oldShare = prevComp ? prevComp.marketShare : comp.marketShare;

    // ------------------------------------------------------------------------
    // 1. REVENUE DECLINE > 20%: BUSINESS CRISIS & 3-STAGE CHAIN
    // ------------------------------------------------------------------------
    if (revPct <= -20 && comp.monthlyRevenue > 0) {
      if (!isEventOnCooldown(currentState, 'BUSINESS_CRISIS_REVENUE_COLLAPSE', comp.id)) {
        const dropPct = Math.abs(revPct).toFixed(1);
        const triggerReason = `Severe revenue collapse of ${dropPct}% at ${comp.name} (from $${oldRev.toLocaleString()} to $${comp.monthlyRevenue.toLocaleString()}/mo).`;

        const choices: SimulationEventChoice[] = [
          {
            id: `opt_crisis_restructure_${comp.id}_${tick}`,
            label: 'Emergency 20% Overhead Restructuring & Cost Slashes',
            description: 'Cut non-essential operational spending, renegotiate vendor contracts, and freeze travel.',
            risk: 'Low',
            timeHorizon: 'Immediate',
            projectedOutcome: '-20% Monthly Expenses, -12 Employee Morale, stabilizes monthly burn.',
            handlerKey: 'OPT_CRISIS_RESTRUCTURE',
            consequences: [
              ConsequenceEngine.companyExpenses(comp.id, 'PERCENTAGE_CHANGE', -20, { description: 'Trimmed operating overhead by 20%' }),
              ConsequenceEngine.companyMorale(comp.id, 'SUBTRACT', 12, { description: 'Emergency restructuring dipped morale (-12)' }),
              ConsequenceEngine.stress('ADD', 6, { description: 'Executive crisis turnaround stress' })
            ]
          },
          {
            id: `opt_crisis_capital_injection_${comp.id}_${tick}`,
            label: 'Inject $100,000 Founder Personal Emergency Capital',
            description: 'Infuse personal liquidity to keep operations fully funded while engineering a product rebound.',
            cost: 100000,
            risk: 'Medium',
            timeHorizon: 'Immediate',
            projectedOutcome: 'Adds $100,000 to corporate reserves, eliminates immediate bankruptcy risk, +8 Morale.',
            handlerKey: 'OPT_CRISIS_FOUNDER_INJECTION',
            consequences: [
              ConsequenceEngine.cash('SUBTRACT', 100000, { description: 'Injected personal capital into company' }),
              ConsequenceEngine.companyReserve(comp.id, 'ADD', 100000, { description: 'Emergency capital injection from founder' }),
              ConsequenceEngine.companyMorale(comp.id, 'ADD', 8, { description: 'Founder commitment inspired workforce (+8 Morale)' })
            ]
          },
          {
            id: `opt_crisis_sell_minority_${comp.id}_${tick}`,
            label: 'Sell 15% Equity Stake to Distressed-Asset Syndicate ($250k)',
            description: 'Exchange 15% ownership for immediate institutional cash and strategic advisory support.',
            risk: 'Low',
            timeHorizon: 'Immediate',
            projectedOutcome: 'Injects $250,000 corporate cash, lowers founder ownership by 15%.',
            handlerKey: 'OPT_CRISIS_EQUITY_SALE',
            consequences: [
              ConsequenceEngine.companyReserve(comp.id, 'ADD', 250000, { description: 'Secured $250,000 strategic equity partner' }),
              ConsequenceEngine.companyOwnership(comp.id, 'SUBTRACT', 15, { description: 'Surrendered 15% equity stake' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_biz_crisis_rev_${comp.id}_${tick}`,
          category: 'BUSINESS',
          type: 'CRISIS',
          title: `BUSINESS CRISIS: Severe Revenue Collapse at ${comp.name}`,
          description: `Revenue at ${comp.name} has plummeted by ${dropPct}% over recent operational cycles. Board members and operating leads warn that without immediate intervention, insolvency risks will mount.`,
          severity: 'Critical',
          priority: 95,
          source: comp.name,
          sourceEntityId: comp.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Business', 'Crisis', 'Revenue', comp.name],
          triggerReason,
          choices,
          consequences: {
            stressChange: +8,
            details: [`Monthly revenue plunged -${dropPct}% (loss of $${Math.abs(revDiff).toLocaleString()}/mo)`]
          }
        });

        // Launch full 3-stage business crisis chain
        unlockedChains.push(createBusinessCrisisChain(comp.id, comp.name, currentMonth, currentYear));
      }
    }

    // ------------------------------------------------------------------------
    // 2. REVENUE DECLINE > 10% (AND <= 20%): BUSINESS WARNING
    // ------------------------------------------------------------------------
    else if (revPct <= -10 && comp.monthlyRevenue > 0) {
      if (!isEventOnCooldown(currentState, 'BUSINESS_WARNING_REVENUE_DECLINE', comp.id)) {
        const dropPct = Math.abs(revPct).toFixed(1);
        const triggerReason = `Revenue at ${comp.name} dropped ${dropPct}% over the past month.`;

        const choices: SimulationEventChoice[] = [
          {
            id: `opt_warn_price_discount_${comp.id}_${tick}`,
            label: 'Adopt Competitive Discount Pricing Strategy',
            description: 'Lower unit pricing to undercut competitors and recapture lost transaction volume.',
            risk: 'Medium',
            timeHorizon: '1 month',
            projectedOutcome: '+10% Unit Sales Volume, minor gross margin compression.',
            handlerKey: 'OPT_WARN_PRICE_DISCOUNT',
            consequences: [
              ConsequenceEngine.companyRevenue(comp.id, 'PERCENTAGE_CHANGE', 8, { description: 'Competitive pricing re-energized sales (+8%)' }),
              ConsequenceEngine.companyMarketShare(comp.id, 'ADD', 3, { description: 'Recaptured market share (+3%)' })
            ]
          },
          {
            id: `opt_warn_marketing_boost_${comp.id}_${tick}`,
            label: 'Deploy $30,000 Targeted Customer Acquisition Blitz',
            description: 'Increase digital and channel advertising spend to reignite sales pipeline.',
            cost: 30000,
            risk: 'Low',
            timeHorizon: '1 month',
            projectedOutcome: 'Consumes $30k corporate cash, delivers +10% revenue lift.',
            handlerKey: 'OPT_WARN_MARKETING',
            consequences: [
              ConsequenceEngine.companyReserve(comp.id, 'SUBTRACT', 30000, { description: 'Funded customer acquisition campaign' }),
              ConsequenceEngine.companyRevenue(comp.id, 'PERCENTAGE_CHANGE', 10, { description: 'Marketing campaign restored sales (+10%)' })
            ]
          },
          {
            id: `opt_warn_trim_overhead_${comp.id}_${tick}`,
            label: 'Prune 10% Discretionary Departmental Budgets',
            description: 'Freeze non-critical hiring and reduce travel to defend operating margin.',
            risk: 'Low',
            timeHorizon: 'Immediate',
            projectedOutcome: 'Reduces monthly expenses by 10%, slight employee morale dip (-5).',
            handlerKey: 'OPT_WARN_TRIM_OVERHEAD',
            consequences: [
              ConsequenceEngine.companyExpenses(comp.id, 'PERCENTAGE_CHANGE', -10, { description: 'Trimmed discretionary overhead by 10%' }),
              ConsequenceEngine.companyMorale(comp.id, 'SUBTRACT', 5, { description: 'Minor budget freeze anxiety (-5 Morale)' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_biz_warn_rev_${comp.id}_${tick}`,
          category: 'BUSINESS',
          type: 'WARNING',
          title: `BUSINESS WARNING: Revenue Contraction at ${comp.name}`,
          description: `Revenue at ${comp.name} fell ${dropPct}% this cycle (down $${Math.abs(revDiff).toLocaleString()}/mo). Early proactive adjustments will safeguard quarterly profitability.`,
          severity: 'High',
          priority: 82,
          source: comp.name,
          sourceEntityId: comp.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Business', 'Warning', 'Revenue', comp.name],
          triggerReason,
          choices,
          consequences: {
            stressChange: +4,
            details: [`Revenue decreased by ${dropPct}% ($${comp.monthlyRevenue.toLocaleString()}/mo)`]
          }
        });

        unlockedDecisions.push({
          id: `dec_biz_warn_rev_${comp.id}_${tick}`,
          eventTypeKey: 'BUSINESS_WARNING_REVENUE_DECLINE',
          entityId: comp.id,
          category: 'Business',
          title: `Executive Action: Revenue Contraction at ${comp.name}`,
          description: triggerReason,
          urgency: 'Urgent',
          priority: 82,
          expiresInMonths: 3,
          expirationEventHeadline: `Turnaround Window Expired: ${comp.name}`,
          expirationEventDescription: `No intervention was taken to address top-line contraction at ${comp.name}.`,
          expirationConsequences: [
            ConsequenceEngine.companyMorale(comp.id, 'SUBTRACT', 6, { description: 'Unaddressed revenue erosion hurt team morale' })
          ],
          options: choices.map(ch => ({
            id: ch.id,
            label: ch.label,
            description: ch.description,
            cost: ch.cost,
            risk: ch.risk || 'Medium',
            timeHorizon: ch.timeHorizon || '1-3 months',
            projectedOutcome: ch.projectedOutcome || '',
            handlerKey: ch.handlerKey || 'OPT_BUSINESS_ACTION',
            consequences: ch.consequences
          }))
        });
      }
    }

    // ------------------------------------------------------------------------
    // 3. REVENUE GROWTH > 20%: BUSINESS OPPORTUNITY & EXPANSION CHAIN
    // ------------------------------------------------------------------------
    if (revPct >= 20 && comp.monthlyRevenue >= 50000) {
      if (!isEventOnCooldown(currentState, 'BUSINESS_OPPORTUNITY_REVENUE_SURGE', comp.id)) {
        const growthPct = revPct.toFixed(1);
        const triggerReason = `Top-line revenue at ${comp.name} surged +${growthPct}% to $${comp.monthlyRevenue.toLocaleString()}/mo.`;

        const choices: SimulationEventChoice[] = [
          {
            id: `opt_opp_expand_capacity_${comp.id}_${tick}`,
            label: 'Scale Production Capacity & Headcount (+30%)',
            description: 'Reinvest proceeds into manufacturing and hire 25 new specialized personnel.',
            cost: 80000,
            risk: 'Medium',
            timeHorizon: '2 months',
            projectedOutcome: '+20% Revenue Capacity, +25 Staff, +10% Valuation, consumes $80k.',
            handlerKey: 'OPT_OPP_EXPAND_CAPACITY',
            consequences: [
              ConsequenceEngine.companyReserve(comp.id, 'SUBTRACT', 80000, { description: 'Invested $80,000 in capacity expansion' }),
              ConsequenceEngine.companyEmployees(comp.id, 'ADD', 25, { description: 'Hired 25 new operating personnel' }),
              ConsequenceEngine.companyValuation(comp.id, 'PERCENTAGE_CHANGE', 15, { description: 'Capacity expansion raised valuation (+15%)' }),
              ConsequenceEngine.reputation('ADD', 4, { description: 'Acclaimed business expansion' })
            ]
          },
          {
            id: `opt_opp_initiate_chain_${comp.id}_${tick}`,
            label: 'Launch Full Multi-Stage Global Expansion Program',
            description: 'Initiate the comprehensive 3-stage international market rollout to secure multi-national presence.',
            cost: 150000,
            risk: 'Medium',
            timeHorizon: '6 months',
            projectedOutcome: 'Unlocks multi-stage corporate expansion chain, massive market share upside.',
            handlerKey: 'OPT_OPP_LAUNCH_EXPANSION_CHAIN',
            consequences: [
              ConsequenceEngine.companyReserve(comp.id, 'SUBTRACT', 150000, { description: 'Launched global expansion program' }),
              ConsequenceEngine.companyMarketShare(comp.id, 'ADD', 5, { description: 'Expanded market share footprint' })
            ]
          },
          {
            id: `opt_opp_reap_profits_${comp.id}_${tick}`,
            label: 'Retain High Cash Reserves for Future M&A',
            description: 'Stockpile treasury liquidity to opportunistically buy out distressed competitors later.',
            risk: 'Low',
            timeHorizon: 'Immediate',
            projectedOutcome: 'Maximizes treasury cushion, prepares for institutional acquisitions.',
            handlerKey: 'OPT_OPP_RETAIN_CASH',
            consequences: [
              ConsequenceEngine.companyMorale(comp.id, 'ADD', 6, { description: 'Treasury strength inspired confidence (+6 Morale)' }),
              ConsequenceEngine.playerAttribute('happiness', 'ADD', 5, { description: 'Delight of strong corporate earnings' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_biz_opp_surge_${comp.id}_${tick}`,
          category: 'BUSINESS',
          type: 'OPPORTUNITY',
          title: `BUSINESS OPPORTUNITY: Revenue Surge (+${growthPct}%) at ${comp.name}`,
          description: `Demand for ${comp.name}'s products has exploded! Monthly revenue surged by +$${revDiff.toLocaleString()} reaching $${comp.monthlyRevenue.toLocaleString()}/mo. Analysts recommend capitalizing on this market momentum.`,
          severity: 'Medium',
          priority: 78,
          source: comp.name,
          sourceEntityId: comp.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Business', 'Opportunity', 'Growth', comp.name],
          triggerReason,
          choices,
          consequences: {
            reputationChange: +4,
            worldInfluenceChange: +2,
            details: [`Revenue expanded by +${growthPct}% ($${comp.monthlyRevenue.toLocaleString()}/mo)`]
          }
        });

        // Trigger expansion chain opportunity
        unlockedChains.push(createCompanyExpansionChain(comp.id, comp.name, currentMonth, currentYear, currentState));
      }
    }

    // ------------------------------------------------------------------------
    // 4. PROFIT COLLAPSE: NEGATIVE PROFIT & >50% MARGIN DROP
    // ------------------------------------------------------------------------
    if (comp.monthlyNetProfit < 0 && oldProf > 0) {
      if (!isEventOnCooldown(currentState, 'BUSINESS_PROFIT_COLLAPSE', comp.id)) {
        const lossAmount = Math.abs(comp.monthlyNetProfit);
        const triggerReason = `${comp.name} slipped into operating deficit (-$${lossAmount.toLocaleString()}/mo).`;

        const choices: SimulationEventChoice[] = [
          {
            id: `opt_prof_freeze_hiring_${comp.id}_${tick}`,
            label: 'Executive Hiring Freeze & Supplier Renegotiation',
            description: 'Renegotiate wholesale supplier unit costs and halt all open headcount requisitions.',
            risk: 'Low',
            timeHorizon: '1 month',
            projectedOutcome: '-15% Monthly Expenses, restores positive operating cash flow.',
            handlerKey: 'OPT_PROF_FREEZE_HIRING',
            consequences: [
              ConsequenceEngine.companyExpenses(comp.id, 'PERCENTAGE_CHANGE', -15, { description: 'Renegotiated supplier contracts and froze hiring (-15%)' }),
              ConsequenceEngine.companyMorale(comp.id, 'SUBTRACT', 4, { description: 'Minor anxiety around hiring freeze' })
            ]
          },
          {
            id: `opt_prof_raise_prices_${comp.id}_${tick}`,
            label: 'Implement 10% Selective Price Increase',
            description: 'Pass cost inflation onto customers to immediately widen gross margins.',
            risk: 'Medium',
            timeHorizon: 'Immediate',
            projectedOutcome: '+10% Unit Price & Revenue, slight market share risk.',
            handlerKey: 'OPT_PROF_PRICE_HIKE',
            consequences: [
              ConsequenceEngine.companyRevenue(comp.id, 'PERCENTAGE_CHANGE', 10, { description: 'Selective price hike expanded gross margin (+10% Revenue)' }),
              ConsequenceEngine.companyMarketShare(comp.id, 'SUBTRACT', 1.5, { description: 'Slight customer churn from price hike' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_biz_prof_collapse_${comp.id}_${tick}`,
          category: 'BUSINESS',
          type: 'WARNING',
          title: `PROFIT WARNING: Operating Deficit at ${comp.name}`,
          description: `${comp.name} posted a monthly operating loss of -$${lossAmount.toLocaleString()}/mo. Overhead and production costs currently exceed gross receipts.`,
          severity: 'High',
          priority: 84,
          source: comp.name,
          sourceEntityId: comp.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Business', 'Profit', 'Deficit', comp.name],
          triggerReason,
          choices,
          consequences: {
            stressChange: +5,
            details: [`Operating loss: -$${lossAmount.toLocaleString()}/mo`]
          }
        });
      }
    }

    // ------------------------------------------------------------------------
    // 5. PROFIT SURGE: PROFIT UP >35% AND >$30,000/MO
    // ------------------------------------------------------------------------
    if (profPct >= 35 && comp.monthlyNetProfit >= 30000) {
      if (!isEventOnCooldown(currentState, 'BUSINESS_PROFIT_SURGE', comp.id)) {
        const triggerReason = `Net profit at ${comp.name} surged +${profPct.toFixed(1)}% reaching $${comp.monthlyNetProfit.toLocaleString()}/mo.`;

        const choices: SimulationEventChoice[] = [
          {
            id: `opt_prof_surge_dividend_${comp.id}_${tick}`,
            label: 'Declare 30% Shareholder Dividend Payout',
            description: 'Distribute corporate earnings directly to equity holders.',
            risk: 'Low',
            timeHorizon: 'Immediate',
            projectedOutcome: 'Generates personal liquid dividend cash, +10 Employee Morale from bonus pools.',
            handlerKey: 'OPT_PROF_SURGE_DIVIDEND',
            consequences: [
              ConsequenceEngine.cash('ADD', Math.round(comp.monthlyNetProfit * 0.3 * (comp.playerOwnershipPercentage / 100)), { description: 'Received special corporate earnings dividend' }),
              ConsequenceEngine.companyMorale(comp.id, 'ADD', 10, { description: 'Profit sharing bonus elevated morale (+10)' }),
              ConsequenceEngine.playerAttribute('happiness', 'ADD', 5, { description: 'Corporate profitability celebration' })
            ]
          },
          {
            id: `opt_prof_surge_rd_${comp.id}_${tick}`,
            label: 'Reinvest 100% of Surplus into Proprietary Technology R&D',
            description: 'Fortify the technological moat to out-innovate emerging market competitors.',
            risk: 'Low',
            timeHorizon: '3 months',
            projectedOutcome: '+15 Product Quality, +10 Brand Reputation, +15% Long-term Valuation.',
            handlerKey: 'OPT_PROF_SURGE_RD',
            consequences: [
              ConsequenceEngine.companyProductQuality(comp.id, 'ADD', 15, { description: 'R&D breakthrough boosted product quality (+15)' }),
              ConsequenceEngine.companyBrandReputation(comp.id, 'ADD', 10, { description: 'Brand prestige upgraded (+10)' }),
              ConsequenceEngine.companyValuation(comp.id, 'PERCENTAGE_CHANGE', 15, { description: 'Innovation enhanced enterprise multiple (+15%)' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_biz_prof_surge_${comp.id}_${tick}`,
          category: 'BUSINESS',
          type: 'OPPORTUNITY',
          title: `PROFIT SURGE: Record Operating Margins at ${comp.name}`,
          description: `Operating efficiencies and strong pricing power have propelled ${comp.name}'s net income to $${comp.monthlyNetProfit.toLocaleString()}/mo (+${profPct.toFixed(1)}%).`,
          severity: 'Medium',
          priority: 76,
          source: comp.name,
          sourceEntityId: comp.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Business', 'Profit', 'Record Margins', comp.name],
          triggerReason,
          choices,
          consequences: {
            reputationChange: +3,
            details: [`Monthly net profit reached $${comp.monthlyNetProfit.toLocaleString()}/mo`]
          }
        });
      }
    }

    // ------------------------------------------------------------------------
    // 6. LOW EMPLOYEE MORALE (<35) & HR CRISIS
    // ------------------------------------------------------------------------
    if (comp.employeeMorale < 35 && comp.employeesCount >= 10) {
      if (!isEventOnCooldown(currentState, 'BUSINESS_HR_MORALE_CRISIS', comp.id)) {
        const triggerReason = `Employee morale at ${comp.name} fell to critical level (${comp.employeeMorale}/100) with walkout and talent attrition risks.`;

        const choices: SimulationEventChoice[] = [
          {
            id: `opt_hr_comp_bonus_${comp.id}_${tick}`,
            label: 'Authorize 10% Comprehensive Salary Raise & Wellness Benefits',
            description: 'Directly address wage competitiveness and burnout to retain mission-critical personnel.',
            cost: Math.round(comp.employeesCount * 500),
            risk: 'Low',
            timeHorizon: 'Immediate',
            projectedOutcome: '+35 Employee Morale, +10% Monthly Expenses, halts staff resignations.',
            handlerKey: 'OPT_HR_SALARY_HIKE',
            consequences: [
              ConsequenceEngine.companyMorale(comp.id, 'ADD', 35, { description: 'Salary increase restored workforce morale (+35)' }),
              ConsequenceEngine.companyExpenses(comp.id, 'PERCENTAGE_CHANGE', 10, { description: 'Employee wage adjustment (+10% Expenses)' }),
              ConsequenceEngine.reputation('ADD', 3, { description: 'Praised as an exemplary corporate employer' })
            ]
          },
          {
            id: `opt_hr_townhall_culture_${comp.id}_${tick}`,
            label: 'Host All-Hands Cultural Town Hall & Flexible Work Policy',
            description: 'Introduce hybrid flexibility and transparent career progression pathways with no cash outlay.',
            risk: 'Medium',
            timeHorizon: '1 month',
            projectedOutcome: '+20 Employee Morale, zero direct cash cost, eliminates strike risk.',
            handlerKey: 'OPT_HR_TOWNHALL',
            consequences: [
              ConsequenceEngine.companyMorale(comp.id, 'ADD', 20, { description: 'Cultural reforms and flexibility lifted morale (+20)' })
            ]
          },
          {
            id: `opt_hr_restructure_mgmt_${comp.id}_${tick}`,
            label: 'Replace Middle Management & Launch Leadership Review',
            description: 'Prune underperforming team leads and promote high-trust internal contributors.',
            risk: 'Medium',
            timeHorizon: '2 months',
            projectedOutcome: '+15 Morale, temporary -5% product output during reorganization.',
            handlerKey: 'OPT_HR_REORG_MGMT',
            consequences: [
              ConsequenceEngine.companyMorale(comp.id, 'ADD', 15, { description: 'Leadership refresh eliminated toxicity (+15 Morale)' }),
              ConsequenceEngine.companyProductQuality(comp.id, 'SUBTRACT', 5, { description: 'Short-term transitional reorganization friction' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_biz_hr_morale_${comp.id}_${tick}`,
          category: 'BUSINESS',
          type: 'WARNING',
          title: `HUMAN RESOURCES EVENT: Critical Morale Slump at ${comp.name}`,
          description: `Internal surveys show workforce morale at ${comp.name} has fallen to ${comp.employeeMorale}/100. Department heads warn that key technical and sales leads are entertaining competitor headhunters.`,
          severity: 'High',
          priority: 86,
          source: comp.name,
          sourceEntityId: comp.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Business', 'HR', 'Morale', 'Talent', comp.name],
          triggerReason,
          choices,
          consequences: {
            stressChange: +6,
            details: [`Workforce morale: ${comp.employeeMorale}/100 across ${comp.employeesCount} employees`]
          }
        });

        unlockedDecisions.push({
          id: `dec_biz_hr_morale_${comp.id}_${tick}`,
          eventTypeKey: 'BUSINESS_HR_MORALE_CRISIS',
          entityId: comp.id,
          category: 'Business',
          title: `HR Action: Morale Crisis at ${comp.name}`,
          description: triggerReason,
          urgency: 'Critical',
          priority: 86,
          expiresInMonths: 2,
          expirationEventHeadline: `Talent Exodus at ${comp.name}`,
          expirationEventDescription: `Unresolved workplace dissatisfaction triggered senior resignations across engineering and sales divisions.`,
          expirationConsequences: [
            ConsequenceEngine.companyEmployees(comp.id, 'SUBTRACT', Math.max(2, Math.floor(comp.employeesCount * 0.15)), { description: 'Senior talent resignations' }),
            ConsequenceEngine.companyRevenue(comp.id, 'PERCENTAGE_CHANGE', -10, { description: 'Capacity lost from talent exodus (-10%)' })
          ],
          options: choices.map(ch => ({
            id: ch.id,
            label: ch.label,
            description: ch.description,
            cost: ch.cost,
            risk: ch.risk || 'Medium',
            timeHorizon: ch.timeHorizon || 'Immediate',
            projectedOutcome: ch.projectedOutcome || '',
            handlerKey: ch.handlerKey || 'OPT_HR_ACTION',
            consequences: ch.consequences
          }))
        });
      }
    }

    // ------------------------------------------------------------------------
    // 7. CASH-FLOW / TREASURY WARNING (CASH RESERVES TOO LOW)
    // ------------------------------------------------------------------------
    const monthlyBurn = comp.monthlyExpenses - comp.monthlyRevenue;
    if (comp.cashReserve < comp.monthlyExpenses * 0.75 && comp.cashReserve < 50000) {
      if (!isEventOnCooldown(currentState, 'BUSINESS_FINANCIAL_WARNING_LIQUIDITY', comp.id)) {
        const triggerReason = `Cash reserves at ${comp.name} ($${comp.cashReserve.toLocaleString()}) have fallen below 1 month of operating runway.`;

        const choices: SimulationEventChoice[] = [
          {
            id: `opt_liq_credit_facility_${comp.id}_${tick}`,
            label: 'Draw $150,000 Commercial Revolving Credit Line',
            description: 'Borrow emergency working capital from banking syndicates with monthly interest service.',
            risk: 'Medium',
            timeHorizon: 'Immediate',
            projectedOutcome: 'Adds $150k liquidity buffer, adds $2,500/mo interest expense.',
            handlerKey: 'OPT_LIQ_CREDIT',
            consequences: [
              ConsequenceEngine.companyReserve(comp.id, 'ADD', 150000, { description: 'Drew $150k commercial credit facility' }),
              ConsequenceEngine.companyExpenses(comp.id, 'ADD', 2500, { description: 'Debt service on credit facility ($2,500/mo)' })
            ]
          },
          {
            id: `opt_liq_founder_loan_${comp.id}_${tick}`,
            label: 'Provide $50,000 Zero-Interest Founder Shareholder Loan',
            description: 'Lend personal capital directly to the corporate treasury to secure operations.',
            cost: 50000,
            risk: 'Low',
            timeHorizon: 'Immediate',
            projectedOutcome: 'Restores corporate solvency immediately with zero commercial debt fees.',
            handlerKey: 'OPT_LIQ_FOUNDER_LOAN',
            consequences: [
              ConsequenceEngine.cash('SUBTRACT', 50000, { description: 'Provided founder shareholder loan to company' }),
              ConsequenceEngine.companyReserve(comp.id, 'ADD', 50000, { description: 'Injected founder loan into cash vault' })
            ]
          },
          {
            id: `opt_liq_slash_costs_${comp.id}_${tick}`,
            label: 'Slash 25% Operating Overhead & Cancel Projects',
            description: 'Enact severe emergency cash conservation until sales receipts catch up.',
            risk: 'High',
            timeHorizon: 'Immediate',
            projectedOutcome: '-25% Monthly Expenses, -15 Morale, eliminates burn rate immediately.',
            handlerKey: 'OPT_LIQ_SLASH_COSTS',
            consequences: [
              ConsequenceEngine.companyExpenses(comp.id, 'PERCENTAGE_CHANGE', -25, { description: 'Emergency 25% overhead slashes' }),
              ConsequenceEngine.companyMorale(comp.id, 'SUBTRACT', 15, { description: 'Emergency spending freeze dipped morale (-15)' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_biz_liq_warn_${comp.id}_${tick}`,
          category: 'BUSINESS',
          type: 'WARNING',
          title: `FINANCIAL WARNING: Depleted Treasury Buffer at ${comp.name}`,
          description: `Cash reserves at ${comp.name} have dropped to $${comp.cashReserve.toLocaleString()}, representing less than a single monthly operating cycle ($${comp.monthlyExpenses.toLocaleString()}/mo). Decisive balance-sheet management is required.`,
          severity: 'Critical',
          priority: 90,
          source: comp.name,
          sourceEntityId: comp.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Business', 'Finance', 'Liquidity', 'Runway', comp.name],
          triggerReason,
          choices,
          consequences: {
            stressChange: +7,
            details: [`Corporate cash reserve: $${comp.cashReserve.toLocaleString()} (Monthly expenses: $${comp.monthlyExpenses.toLocaleString()})`]
          }
        });
      }
    }

    // ------------------------------------------------------------------------
    // 8. MARKET-SHARE LOSS (>3% DROP)
    // ------------------------------------------------------------------------
    if (oldShare > 0 && (oldShare - comp.marketShare) >= 3) {
      if (!isEventOnCooldown(currentState, 'BUSINESS_MARKET_SHARE_LOSS', comp.id)) {
        const dropShare = (oldShare - comp.marketShare).toFixed(1);
        const triggerReason = `Market share at ${comp.name} fell by ${dropShare}% (now ${comp.marketShare.toFixed(1)}%) amid aggressive competitor discounting.`;

        const choices: SimulationEventChoice[] = [
          {
            id: `opt_share_recapture_promo_${comp.id}_${tick}`,
            label: 'Launch $40,000 Aggressive Brand & Channel Campaign',
            description: 'Run targeted media advertisements and incentive discounts to win back lost customers.',
            cost: 40000,
            risk: 'Medium',
            timeHorizon: '2 months',
            projectedOutcome: '+4% Market Share, +10 Brand Reputation, consumes $40k.',
            handlerKey: 'OPT_SHARE_RECAPTURE',
            consequences: [
              ConsequenceEngine.companyReserve(comp.id, 'SUBTRACT', 40000, { description: 'Marketing brand recapture spend' }),
              ConsequenceEngine.companyMarketShare(comp.id, 'ADD', 4, { description: 'Recaptured market share (+4%)' }),
              ConsequenceEngine.companyBrandReputation(comp.id, 'ADD', 10, { description: 'Elevated brand prestige (+10)' })
            ]
          },
          {
            id: `opt_share_upgrade_features_${comp.id}_${tick}`,
            label: 'Accelerate Product Feature Updates & Quality Upgrades',
            description: 'Introduce requested customer features to achieve product superiority.',
            cost: 25000,
            risk: 'Low',
            timeHorizon: '2 months',
            projectedOutcome: '+15 Product Quality, +3% Market Share.',
            handlerKey: 'OPT_SHARE_UPGRADE_QUALITY',
            consequences: [
              ConsequenceEngine.companyReserve(comp.id, 'SUBTRACT', 25000, { description: 'Product upgrade engineering allocation' }),
              ConsequenceEngine.companyProductQuality(comp.id, 'ADD', 15, { description: 'Upgraded product quality (+15)' }),
              ConsequenceEngine.companyMarketShare(comp.id, 'ADD', 3, { description: 'Quality enhancements reclaimed market share (+3%)' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_biz_share_loss_${comp.id}_${tick}`,
          category: 'BUSINESS',
          type: 'WARNING',
          title: `COMPETITIVE WARNING: Market Share Erosion at ${comp.name}`,
          description: `Industry reports indicate ${comp.name}'s market share slipped by ${dropShare}% to ${comp.marketShare.toFixed(1)}% as aggressive rivals expand promotional efforts.`,
          severity: 'Medium',
          priority: 75,
          source: comp.name,
          sourceEntityId: comp.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Business', 'Competition', 'Market Share', comp.name],
          triggerReason,
          choices,
          consequences: {
            stressChange: +4,
            details: [`Market share slipped to ${comp.marketShare.toFixed(1)}%`]
          }
        });
      }
    }

    // ------------------------------------------------------------------------
    // 9. MARKET-SHARE GROWTH (>4% SURGE)
    // ------------------------------------------------------------------------
    if (oldShare > 0 && (comp.marketShare - oldShare) >= 4) {
      if (!isEventOnCooldown(currentState, 'BUSINESS_MARKET_SHARE_SURGE', comp.id)) {
        const gainShare = (comp.marketShare - oldShare).toFixed(1);
        const triggerReason = `Market share at ${comp.name} surged by +${gainShare}% reaching ${comp.marketShare.toFixed(1)}%.`;

        const choices: SimulationEventChoice[] = [
          {
            id: `opt_share_lockin_contracts_${comp.id}_${tick}`,
            label: 'Lock In Long-Term Multi-Year Customer Contracts',
            description: 'Offer multi-year volume commitments to secure high revenue visibility and customer retention.',
            risk: 'Low',
            timeHorizon: '12 months',
            projectedOutcome: '+10% Monthly Revenue, locks in market dominance.',
            handlerKey: 'OPT_SHARE_LOCKIN_CONTRACTS',
            consequences: [
              ConsequenceEngine.companyRevenue(comp.id, 'PERCENTAGE_CHANGE', 10, { description: 'Multi-year customer commitments locked in revenue (+10%)' }),
              ConsequenceEngine.companyValuation(comp.id, 'PERCENTAGE_CHANGE', 12, { description: 'Contracted ARR boosted valuation (+12%)' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_biz_share_gain_${comp.id}_${tick}`,
          category: 'BUSINESS',
          type: 'OPPORTUNITY',
          title: `MARKET LEADERSHIP: Market Share Surge (+${gainShare}%) at ${comp.name}`,
          description: `Exceptional customer reception has expanded ${comp.name}'s market share to ${comp.marketShare.toFixed(1)}%, consolidating its status as an industry pacesetter.`,
          severity: 'Medium',
          priority: 74,
          source: comp.name,
          sourceEntityId: comp.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Business', 'Market Share', 'Leadership', comp.name],
          triggerReason,
          choices,
          consequences: {
            reputationChange: +4,
            worldInfluenceChange: +2,
            details: [`Market share reached ${comp.marketShare.toFixed(1)}%`]
          }
        });
      }
    }

    // ------------------------------------------------------------------------
    // 10. MAJOR ENTERPRISE CONTRACT OPPORTUNITY (Valuation >= $1M & High Quality)
    // ------------------------------------------------------------------------
    if (comp.valuation >= 1000000 && comp.productQuality >= 70 && comp.marketShare >= 8) {
      if (!isEventOnCooldown(currentState, 'BUSINESS_MAJOR_CONTRACT', comp.id)) {
        const contractValue = Math.round(comp.monthlyRevenue * 0.35);
        const triggerReason = `Superior product quality (${comp.productQuality}/100) attracted a multi-million-dollar anchor corporate contract inquiry.`;

        const choices: SimulationEventChoice[] = [
          {
            id: `opt_contract_sign_standard_${comp.id}_${tick}`,
            label: `Sign Master Commercial Supply Agreement (+$${contractValue.toLocaleString()}/mo)`,
            description: 'Agree to deliver standard SLA quality benchmarks for guaranteed recurring monthly order volume.',
            risk: 'Low',
            timeHorizon: '24 months',
            projectedOutcome: `+$${contractValue.toLocaleString()}/mo recurring revenue, +15% Valuation, +5 Reputation.`,
            handlerKey: 'OPT_CONTRACT_SIGN',
            consequences: [
              ConsequenceEngine.companyRevenue(comp.id, 'ADD', contractValue, { description: `Secured major enterprise supply contract (+$${contractValue.toLocaleString()}/mo)` }),
              ConsequenceEngine.companyValuation(comp.id, 'PERCENTAGE_CHANGE', 15, { description: 'Enterprise deal increased valuation (+15%)' }),
              ConsequenceEngine.reputation('ADD', 5, { description: 'Landmark corporate contract signed (+5)' })
            ]
          },
          {
            id: `opt_contract_negotiate_exclusive_${comp.id}_${tick}`,
            label: `Negotiate Category Exclusivity for 25% Premium Pricing`,
            description: 'Grant exclusive industry category distribution in exchange for premium recurring margins.',
            risk: 'Medium',
            timeHorizon: '24 months',
            projectedOutcome: `+$${Math.round(contractValue * 1.25).toLocaleString()}/mo revenue, +8 Reputation, restricts other rivals.`,
            handlerKey: 'OPT_CONTRACT_EXCLUSIVE',
            consequences: [
              ConsequenceEngine.companyRevenue(comp.id, 'ADD', Math.round(contractValue * 1.25), { description: `Exclusive landmark contract (+$${Math.round(contractValue * 1.25).toLocaleString()}/mo)` }),
              ConsequenceEngine.companyValuation(comp.id, 'PERCENTAGE_CHANGE', 20, { description: 'Exclusive deal escalated enterprise multiple (+20%)' }),
              ConsequenceEngine.reputation('ADD', 8, { description: 'Exclusive corporate partnership hailed in business press (+8)' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_biz_contract_${comp.id}_${tick}`,
          category: 'BUSINESS',
          type: 'OPPORTUNITY',
          title: `MAJOR CONTRACT: Multi-National Supply Deal for ${comp.name}`,
          description: `A global conglomerate has completed vendor technical vetting and submitted a formal master supply contract worth $${contractValue.toLocaleString()}/mo in new recurring revenue.`,
          severity: 'High',
          priority: 85,
          source: comp.name,
          sourceEntityId: comp.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Business', 'Contract', 'Enterprise Deal', comp.name],
          triggerReason,
          choices,
          consequences: {
            reputationChange: +4,
            details: [`Contract potential: +$${contractValue.toLocaleString()}/mo`]
          }
        });

        unlockedDecisions.push({
          id: `dec_biz_contract_${comp.id}_${tick}`,
          eventTypeKey: 'BUSINESS_MAJOR_CONTRACT',
          entityId: comp.id,
          category: 'Business',
          title: `Commercial Contract Proposal: ${comp.name}`,
          description: triggerReason,
          urgency: 'Standard',
          priority: 85,
          expiresInMonths: 2,
          expirationEventHeadline: `Contract Window Closed: ${comp.name}`,
          expirationEventDescription: `The corporate client partnered with an alternate supplier after negotiations expired.`,
          options: choices.map(ch => ({
            id: ch.id,
            label: ch.label,
            description: ch.description,
            cost: ch.cost,
            risk: ch.risk || 'Low',
            timeHorizon: ch.timeHorizon || '24 months',
            projectedOutcome: ch.projectedOutcome || '',
            handlerKey: ch.handlerKey || 'OPT_CONTRACT_ACTION',
            consequences: ch.consequences
          }))
        });
      }
    }

    // ------------------------------------------------------------------------
    // 11. VALUATION MILESTONES ($1M, $5M, $25M, $100M, $1B)
    // ------------------------------------------------------------------------
    const milestones = [
      { threshold: 1000000000, label: 'Unicorn Billion-Dollar ($1 Billion) Conglomerate', key: 'VAL_1B' },
      { threshold: 100000000, label: 'Centimillion ($100 Million) Enterprise Titan', key: 'VAL_100M' },
      { threshold: 25000000, label: 'Eight-Figure ($25 Million) Market Leader', key: 'VAL_25M' },
      { threshold: 5000000, label: 'High-Growth ($5 Million) Scaleup Enterprise', key: 'VAL_5M' },
      { threshold: 1000000, label: 'Seven-Figure ($1 Million) Corporate Milestone', key: 'VAL_1M' }
    ];

    for (const m of milestones) {
      if (comp.valuation >= m.threshold && oldVal < m.threshold) {
        const cooldownKey = `BUSINESS_VALUATION_MILESTONE_${m.key}`;
        if (!isEventOnCooldown(currentState, cooldownKey, comp.id)) {
          const triggerReason = `${comp.name} crossed the official ${m.label} threshold (Valuation: $${comp.valuation.toLocaleString()}).`;

          const choices: SimulationEventChoice[] = [
            {
              id: `opt_val_milestone_gala_${comp.id}_${tick}`,
              label: 'Host Milestone Executive Gala & Ring Opening Bell ($25,000)',
              description: 'Celebrate the landmark valuation achievement with key investors, clients, and industry press.',
              cost: 25000,
              risk: 'Low',
              timeHorizon: 'Immediate',
              projectedOutcome: '+10 Reputation, +8 World Influence, +20 Employee Morale, high-profile press.',
              handlerKey: 'OPT_VAL_GALA',
              consequences: [
                ConsequenceEngine.cash('SUBTRACT', 25000, { description: 'Hosted corporate valuation milestone gala' }),
                ConsequenceEngine.reputation('ADD', 10, { description: `Celebrated ${m.label} achievement (+10 Reputation)` }),
                ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 8, { description: 'Institutional business clout elevated (+8)' }),
                ConsequenceEngine.companyMorale(comp.id, 'ADD', 20, { description: 'Milestone pride energized company staff (+20 Morale)' }),
                ConsequenceEngine.playerAttribute('happiness', 'ADD', 15, { description: 'Unforgettable milestone celebration' })
              ]
            },
            {
              id: `opt_val_milestone_reinvest_${comp.id}_${tick}`,
              label: 'Quietly Consolidate & Announce Expansion Warchest',
              description: 'Focus strictly on execution without public vanity events.',
              risk: 'Low',
              timeHorizon: 'Immediate',
              projectedOutcome: '+5 Reputation, +10 Morale, maintains total executive focus.',
              handlerKey: 'OPT_VAL_QUIET',
              consequences: [
                ConsequenceEngine.reputation('ADD', 5, { description: `Praised for humble, disciplined executive leadership` }),
                ConsequenceEngine.companyMorale(comp.id, 'ADD', 10, { description: 'Confidence in ongoing corporate scaling' })
              ]
            }
          ];

          generatedEvents.push({
            id: `ev_biz_val_milestone_${m.key}_${comp.id}_${tick}`,
            category: 'BUSINESS',
            type: 'MILESTONE',
            title: `MILESTONE: ${comp.name} Achieves ${m.label}!`,
            description: `Through relentless scaling and disciplined execution, ${comp.name} has officially crossed the $${(m.threshold / 1000000).toFixed(0)}M valuation threshold! The enterprise is now valued at $${comp.valuation.toLocaleString()}.`,
            severity: 'Low',
            priority: 92,
            source: comp.name,
            sourceEntityId: comp.id,
            createdMonth: currentMonth,
            createdYear: currentYear,
            timestampMonth: currentMonth,
            timestampYear: currentYear,
            age,
            status: 'Active',
            tags: ['Business', 'Milestone', 'Valuation', comp.name],
            triggerReason,
            choices,
            consequences: {
              reputationChange: +6,
              worldInfluenceChange: +4,
              happinessChange: +10,
              details: [`Enterprise valuation reached $${comp.valuation.toLocaleString()}`]
            }
          });
        }
      }
    }

    // ------------------------------------------------------------------------
    // 12. COMPETITOR AGGRESSIVE GROWTH (Dominant Market Share >= 20%)
    // ------------------------------------------------------------------------
    if (comp.marketShare >= 20 && comp.brandReputation >= 50) {
      if (!isEventOnCooldown(currentState, 'BUSINESS_COMPETITOR_GROWTH', comp.id)) {
        const triggerReason = `Your dominant market share (${comp.marketShare.toFixed(1)}%) in ${comp.industry} provoked an aggressive counter-campaign from rival conglomerates.`;

        const choices: SimulationEventChoice[] = [
          {
            id: `opt_comp_counter_marketing_${comp.id}_${tick}`,
            label: 'Deploy $50,000 Counter-Marketing Campaign Highlighting Reliability',
            description: 'Emphasize superior product durability, customer service, and proven track record over cheap alternatives.',
            cost: 50000,
            risk: 'Low',
            timeHorizon: '2 months',
            projectedOutcome: '+10 Brand Reputation, preserves market share, consumes $50k.',
            handlerKey: 'OPT_COMPETITOR_COUNTER_MARKETING',
            consequences: [
              ConsequenceEngine.companyReserve(comp.id, 'SUBTRACT', 50000, { description: 'Deployed counter-marketing defensive campaign' }),
              ConsequenceEngine.companyBrandReputation(comp.id, 'ADD', 12, { description: 'Reputation for unmatched quality solidified (+12)' })
            ]
          },
          {
            id: `opt_comp_price_match_${comp.id}_${tick}`,
            label: 'Match Rival Pricing to Squeeze Their Venture Capital Burn',
            description: 'Temporarily match discount pricing to force the competitor into an unsustainable cash burn war.',
            risk: 'Medium',
            timeHorizon: '3 months',
            projectedOutcome: '-10% Monthly Revenue, protects 100% market share, squeezes rival.',
            handlerKey: 'OPT_COMPETITOR_PRICE_MATCH',
            consequences: [
              ConsequenceEngine.companyRevenue(comp.id, 'PERCENTAGE_CHANGE', -10, { description: 'Defensive pricing war trimmed short-term revenue (-10%)' }),
              ConsequenceEngine.companyMarketShare(comp.id, 'ADD', 2, { description: 'Crushed rival promotional expansion' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_biz_competitor_${comp.id}_${tick}`,
          category: 'BUSINESS',
          type: 'WARNING',
          title: `COMPETITIVE THREAT: Rival Conglomerate Expands in ${comp.industry}`,
          description: `A heavily funded industry challenger has launched aggressive promotional discounting aimed at poaching ${comp.name}'s customer base.`,
          severity: 'Medium',
          priority: 77,
          source: comp.industry,
          sourceEntityId: comp.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Business', 'Competitor', 'Market Dynamics', comp.name],
          triggerReason,
          choices,
          consequences: {
            stressChange: +4,
            details: [`Rival price war initiated in ${comp.industry}`]
          }
        });
      }
    }

    // ------------------------------------------------------------------------
    // 13. REGULATORY COMPLIANCE & INDUSTRY OVERSIGHT RISK (Regulatory >= 60 or Scrutiny >= 65)
    // ------------------------------------------------------------------------
    const power = currentState.playerPowerProfile;
    if (comp.valuation >= 5000000 && ((power?.regulatoryAttention || 0) >= 60 || (power?.scrutiny || 0) >= 65)) {
      if (!isEventOnCooldown(currentState, 'BUSINESS_REGULATORY_AUDIT', comp.id)) {
        const complianceCost = Math.min(150000, Math.max(25000, Math.round(comp.valuation * 0.01)));
        const triggerReason = `Elevated regulatory oversight (${power?.regulatoryAttention || 0}/100) prompted a formal compliance audit into ${comp.name}.`;

        const choices: SimulationEventChoice[] = [
          {
            id: `opt_reg_retain_counsel_${comp.id}_${tick}`,
            label: `Engage Tier-1 Regulatory Compliance Counsel ($${complianceCost.toLocaleString()})`,
            description: 'Completely review and certify all corporate disclosures and product safety standards.',
            cost: complianceCost,
            risk: 'Low',
            timeHorizon: '2 months',
            projectedOutcome: 'Secures full regulatory green light, +5 Brand Reputation, +4 World Influence.',
            handlerKey: 'OPT_REG_COUNSEL',
            consequences: [
              ConsequenceEngine.companyReserve(comp.id, 'SUBTRACT', complianceCost, { description: 'Regulatory compliance certification retainer' }),
              ConsequenceEngine.companyBrandReputation(comp.id, 'ADD', 8, { description: 'Certified gold-standard compliance (+8)' }),
              ConsequenceEngine.reputation('ADD', 4, { description: 'Clean regulatory standing' })
            ]
          },
          {
            id: `opt_reg_internal_audit_${comp.id}_${tick}`,
            label: 'Conduct In-House Internal Audit Review',
            description: 'Rely on existing in-house counsel and operations leads to respond to the inquiry.',
            risk: 'Medium',
            timeHorizon: '3 months',
            projectedOutcome: 'Zero outside legal spend, slight risk of delayed clearance.',
            handlerKey: 'OPT_REG_INTERNAL',
            consequences: [
              ConsequenceEngine.companyMorale(comp.id, 'SUBTRACT', 5, { description: 'Audit workload added operational friction' }),
              ConsequenceEngine.stress('ADD', 4, { description: 'Regulatory inquiry oversight stress' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_biz_reg_audit_${comp.id}_${tick}`,
          category: 'BUSINESS',
          type: 'WARNING',
          title: `REGULATORY RISK: Industry Compliance Audit at ${comp.name}`,
          description: `Governmental and industry oversight authorities have initiated a standard regulatory audit into ${comp.name}'s supply chains, accounting disclosures, and consumer protections.`,
          severity: 'High',
          priority: 83,
          source: comp.name,
          sourceEntityId: comp.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Business', 'Regulatory', 'Legal', comp.name],
          triggerReason,
          choices,
          consequences: {
            stressChange: +5,
            details: [`Regulatory audit initiated for ${comp.name}`]
          }
        });
      }
    }

    // ------------------------------------------------------------------------
    // 13.5 ANTITRUST SYNDICATE COUNTER-PLAY (Improvement #7: Market Share >= 70%)
    // ------------------------------------------------------------------------
    if (comp.marketShare >= 70) {
      if (!isEventOnCooldown(currentState, 'BUSINESS_ANTITRUST_SCRUTINY', comp.id)) {
        const lobbyingCost = Math.min(500000, Math.max(100000, Math.round(comp.valuation * 0.03)));
        const divestitureDividend = Math.min(2500000, Math.max(350000, Math.round(comp.valuation * 0.08)));
        const triggerReason = `Commanding market dominance (${comp.marketShare.toFixed(1)}% Market Share) at ${comp.name} triggered formal antitrust monopolistic review by federal competition authorities.`;

        const antitrustChoices: SimulationEventChoice[] = [
          {
            id: `opt_at_lobby_${comp.id}_${tick}`,
            label: `Legal Lobbying & Regulatory Settlement ($${lobbyingCost.toLocaleString()})`,
            description: 'Engage top competition attorneys and policy lobbyists to negotiate a non-prosecution consent decree while maintaining full enterprise market share.',
            cost: lobbyingCost,
            risk: 'Low',
            timeHorizon: '3 months',
            projectedOutcome: 'Protects 70%+ market share, neutralizes break-up risk, +6 Brand Reputation, +5 World Influence.',
            handlerKey: 'OPT_ANTITRUST_LOBBY',
            consequences: [
              ConsequenceEngine.companyReserve(comp.id, 'SUBTRACT', lobbyingCost, { description: 'Antitrust regulatory lobbying & consent settlement' }),
              ConsequenceEngine.companyBrandReputation(comp.id, 'ADD', 8, { description: 'Validated regulatory compliance safe-harbor' }),
              ConsequenceEngine.reputation('ADD', 5, { description: 'Masterful antitrust regulatory navigation' }),
              ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 6, { description: 'Elite corporate lobbying power' })
            ]
          },
          {
            id: `opt_at_divest_${comp.id}_${tick}`,
            label: `Voluntary Divestiture & Founder Spin-Off Dividend (+$${divestitureDividend.toLocaleString()})`,
            description: 'Proactively spin off non-core secondary divisions to appease antitrust watchdogs, generating a massive liquid founder dividend and resetting market share to 55%.',
            risk: 'Low',
            timeHorizon: 'Immediate',
            projectedOutcome: `Injects $${divestitureDividend.toLocaleString()} cash to personal account, eliminates antitrust penalties, resets market share to 55%.`,
            handlerKey: 'OPT_ANTITRUST_DIVEST',
            consequences: [
              ConsequenceEngine.cash('ADD', divestitureDividend, { description: `Received $${divestitureDividend.toLocaleString()} spin-off divestiture founder dividend` }),
              ConsequenceEngine.companyMarketShare(comp.id, 'SET', 55, { description: 'Divested subsidiary lowered market share to sustainable 55%' }),
              ConsequenceEngine.reputation('ADD', 8, { description: 'Praised by regulators for proactive pro-consumer divestiture' }),
              ConsequenceEngine.stress('SUBTRACT', 6, { description: 'Antitrust break-up risk eliminated' })
            ]
          },
          {
            id: `opt_at_litigate_${comp.id}_${tick}`,
            label: 'Aggressive Anti-Monopoly Court Defense ($250,000 Legal Retainer)',
            description: 'Fight the competition authorities in federal court, asserting superior innovation and consumer welfare.',
            cost: 250000,
            risk: 'High',
            timeHorizon: '6 months',
            projectedOutcome: '50% chance of complete precedent victory or $1M fine if overturned.',
            handlerKey: 'OPT_ANTITRUST_LITIGATE',
            consequences: [
              ConsequenceEngine.companyReserve(comp.id, 'SUBTRACT', 250000, { description: 'Federal antitrust litigation defense retainer' }),
              ConsequenceEngine.stress('ADD', 6, { description: 'High-stakes antitrust courtroom trial stress' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_biz_antitrust_${comp.id}_${tick}`,
          category: 'BUSINESS',
          type: 'CRISIS',
          title: `ANTITRUST SCRUTINY: Monopolistic Review of ${comp.name} (${comp.marketShare.toFixed(1)}% Share)`,
          description: triggerReason,
          severity: 'Critical',
          priority: 92,
          source: 'Federal Competition & Trade Commission',
          sourceEntityId: comp.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Business', 'Antitrust', 'Monopoly', 'Legal', comp.name],
          triggerReason,
          choices: antitrustChoices,
          consequences: {
            stressChange: +6,
            details: [`Antitrust monopoly probe initiated against ${comp.name}`]
          }
        });

        unlockedDecisions.push({
          id: `dec_antitrust_${comp.id}_${tick}`,
          eventTypeKey: 'BUSINESS_ANTITRUST_SCRUTINY',
          entityId: comp.id,
          category: 'Business',
          title: `Antitrust Review Defense Strategy: ${comp.name}`,
          description: triggerReason,
          urgency: 'Critical',
          priority: 92,
          expiresInMonths: 3,
          expirationEventHeadline: `Antitrust Default Penalty Issued: ${comp.name}`,
          expirationEventDescription: `Failure to respond to antitrust subpoena resulted in regulatory enforcement sanction.`,
          options: antitrustChoices.map(ch => ({
            id: ch.id,
            label: ch.label,
            description: ch.description,
            cost: ch.cost,
            risk: ch.risk || 'Medium',
            timeHorizon: ch.timeHorizon || '3 months',
            projectedOutcome: ch.projectedOutcome || '',
            handlerKey: ch.handlerKey || 'OPT_BUSINESS_ACTION',
            consequences: ch.consequences
          }))
        });
      }
    }

    // ------------------------------------------------------------------------
    // 14. C-SUITE LEADERSHIP REORGANIZATION OPPORTUNITY (Headcount >= 35 & Morale <= 45)
    // ------------------------------------------------------------------------
    if (comp.valuation >= 2000000 && comp.employeesCount >= 35 && comp.employeeMorale <= 45) {
      if (!isEventOnCooldown(currentState, 'BUSINESS_LEADERSHIP_CHANGE', comp.id)) {
        unlockedChains.push(createLeadershipReorganizationChain(comp.id, comp.name, currentMonth, currentYear, currentState));
      }
    }

    // ------------------------------------------------------------------------
    // 15. DISTRESSED COMPETITOR M&A / ACQUISITION OPPORTUNITY (Valuation >= $2M, Cash >= $250k, Market Share >= 15%)
    // ------------------------------------------------------------------------
    if (comp.valuation >= 2000000 && comp.cashReserve >= 250000 && comp.marketShare >= 15) {
      if (!isEventOnCooldown(currentState, 'BUSINESS_MA_ACQUISITION', comp.id)) {
        const triggerReason = `Strong market share (${comp.marketShare.toFixed(1)}%) and corporate treasury ($${comp.cashReserve.toLocaleString()}) opened an exclusive buyout window for a distressed rival.`;

        const maChoices: SimulationEventChoice[] = [
          {
            id: `opt_acq_debt_${comp.id}_${tick}`,
            label: 'Finance the Acquisition (Leveraged Buyout)',
            description: 'Deploy $3M in cash equity alongside $7M in syndicated institutional debt to take 100% control of the competitor.',
            risk: 'Medium',
            timeHorizon: '12 months',
            projectedOutcome: '+15% Company Revenue, +120 Headcount, +3 Reputation, +$7M Debt obligation.',
            handlerKey: 'OPT_ACQUIRE_COMPETITOR_LEVERAGED',
            consequences: [
              ConsequenceEngine.companyReserve(comp.id, 'SUBTRACT', 200000, { description: 'Downpayment check for corporate acquisition' }),
              ConsequenceEngine.companyRevenue(comp.id, 'PERCENTAGE_CHANGE', 15, { description: 'Acquired competitor customer book (+15% Revenue)' }),
              ConsequenceEngine.companyEmployees(comp.id, 'ADD', 45, { description: 'Absorbed competitor engineering team' }),
              ConsequenceEngine.companyMarketShare(comp.id, 'ADD', 8, { description: 'Market share expanded via acquisition' }),
              ConsequenceEngine.reputation('ADD', 4, { description: 'Strategic M&A buyout leader' })
            ]
          },
          {
            id: `opt_acq_pass_${comp.id}_${tick}`,
            label: 'Pass on the Target & Maintain Organic Scaling',
            description: 'Focus solely on proprietary internal product expansion and protect current balance sheet liquidity.',
            risk: 'Low',
            timeHorizon: 'Immediate',
            projectedOutcome: 'Preserves capital, zero integration overhead.',
            handlerKey: 'OPT_PASS_ACQUISITION',
            consequences: [
              ConsequenceEngine.stress('SUBTRACT', 2, { description: 'Avoided integration friction' })
            ]
          }
        ];

        generatedEvents.push({
          id: `ev_biz_ma_${comp.id}_${tick}`,
          category: 'BUSINESS',
          type: 'OPPORTUNITY',
          title: `M&A OPPORTUNITY: Acquire Distressed Competitor in ${comp.industry}`,
          description: `A direct market rival in ${comp.industry} is facing capital constraints. An acquisition proposal has reached your desk for ${comp.name}.`,
          severity: 'High',
          priority: 84,
          source: comp.name,
          sourceEntityId: comp.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Business', 'M&A', 'Acquisition', comp.name],
          triggerReason,
          choices: maChoices,
          consequences: {
            details: [`Acquisition target available for ${comp.name}`]
          }
        });

        unlockedDecisions.push({
          id: `dec_acq_${comp.id}_${tick}`,
          eventTypeKey: 'BUSINESS_MA_ACQUISITION',
          entityId: comp.id,
          category: 'Business',
          title: `Acquire Competitor: Syndicate Buyout Opportunity (${comp.name})`,
          description: triggerReason,
          urgency: 'Urgent',
          priority: 84,
          expiresInMonths: 2,
          expirationEventHeadline: `M&A Acquisition Window Expired: ${comp.name} Target`,
          expirationEventDescription: `The acquisition window for the rival in ${comp.industry} has closed.`,
          options: maChoices.map(ch => ({
            id: ch.id,
            label: ch.label,
            description: ch.description,
            cost: ch.cost,
            risk: ch.risk || 'Medium',
            timeHorizon: ch.timeHorizon || '12 months',
            projectedOutcome: ch.projectedOutcome || '',
            handlerKey: ch.handlerKey || 'OPT_BUSINESS_ACTION',
            consequences: ch.consequences
          }))
        });
      }
    }

    // ------------------------------------------------------------------------
    // 16. SUPPLY CHAIN CRISIS EVENT CHAIN TRIGGER (Improvement #8)
    // ------------------------------------------------------------------------
    const isSupplyVulnerableIndustry = ['Manufacturing', 'Technology', 'Automotive', 'Logistics', 'Retail', 'Consumer Goods'].includes(comp.industry);
    const country = currentState.world[currentState.currentCountryIndex];
    const isMacroFriction = country?.businessCycle === 'Recession' || (country?.inflationRate || 0) >= 4.0;
    const hasNoActiveSupplyChain = !(currentState.activeEventChains || []).some(c => c.id.includes('chain_supply_crisis') && c.variables?.companyId === comp.id);

    if (isSupplyVulnerableIndustry && isMacroFriction && comp.monthlyRevenue >= 40000 && hasNoActiveSupplyChain) {
      if (!isEventOnCooldown(currentState, 'BUSINESS_SUPPLY_CRISIS', comp.id)) {
        const supplyChain = createSupplyChainCrisisChain(comp.id, comp.name, currentMonth, currentYear);
        unlockedChains.push(supplyChain);

        generatedEvents.push({
          id: `ev_biz_supply_crisis_${comp.id}_${tick}`,
          category: 'BUSINESS',
          type: 'CRISIS',
          title: `SUPPLY CHAIN THREAT: International Parts & Material Shortage (${comp.name})`,
          description: `Macroeconomic stress (${country?.businessCycle || 'Recession'} / ${country?.inflationRate.toFixed(1)}% Inflation) has triggered critical supplier bottlenecks for ${comp.name}.`,
          severity: 'Critical',
          priority: 89,
          source: comp.name,
          sourceEntityId: comp.id,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Business', 'SupplyChain', 'Crisis', comp.name],
          triggerReason: `Macroeconomic recession/inflation triggered supply chain bottleneck for ${comp.name}.`,
          consequences: {
            stressChange: +6,
            details: [`Supply chain crisis chain activated for ${comp.name}`]
          }
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
