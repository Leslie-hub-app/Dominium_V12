import { 
  GameState, 
  EventChain, 
  EventChainStage, 
  EventChainHistoryEntry, 
  SimulationEvent, 
  PendingDecision, 
  SimulationEventChoice, 
  Consequence 
} from '../types';
import { ConsequenceEngine } from './consequenceEngine';
import { calculateFutureDate } from './delayedConsequenceEngine';

// ==========================================
// PRESET EVENT CHAIN TEMPLATES
// ==========================================

export function createBusinessCrisisChain(companyId: string, companyName: string, startMonth: number, startYear: number): EventChain {
  const chainId = `chain_biz_crisis_${companyId}_${Date.now()}`;

  const stages: EventChainStage[] = [
    {
      id: 'stage_1_crisis_outbreak',
      sequence: 1,
      title: `Corporate Crisis at ${companyName}: Severe Revenue Contraction`,
      description: `Audits reveal that revenue at ${companyName} has declined over 15% due to aggressive competitor discounting and operational friction. Decisive leadership is required immediately.`,
      choices: [
        {
          id: 'opt_biz_restructure',
          label: 'Executive Restructuring & 20% Overhead Reductions',
          description: 'Eliminate redundant layers, freeze travel, and cut discretionary expenses by 20%.',
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: 'Cuts expenses by 20%, but reduces employee morale by 15 points.',
          handlerKey: 'OPT_CHAIN_BIZ_RESTRUCTURE',
          consequences: [
            ConsequenceEngine.companyExpenses(companyId, 'PERCENTAGE_CHANGE', -20, { description: 'Trimmed operating overhead by 20%' }),
            ConsequenceEngine.companyMorale(companyId, 'SUBTRACT', 15, { description: 'Workforce anxiety from corporate restructuring (-15 Morale)' }),
            ConsequenceEngine.stress('ADD', 5, { description: 'Stress of overseeing corporate layoff restructuring' })
          ]
        },
        {
          id: 'opt_biz_growth_invest',
          label: 'Deploy $80,000 Growth & Product Innovation Blitz',
          description: 'Double down on competitive product features and aggressive customer acquisition.',
          cost: 80000,
          risk: 'Medium',
          timeHorizon: '3 months',
          projectedOutcome: 'Consumes $80,000 cash, lays groundwork for top-line revenue recovery.',
          handlerKey: 'OPT_CHAIN_BIZ_INVEST',
          consequences: [
            ConsequenceEngine.companyReserve(companyId, 'SUBTRACT', 80000, { description: 'Deployed $80k product turnaround fund' }),
            ConsequenceEngine.companyMorale(companyId, 'ADD', 8, { description: 'Renewed optimism behind product roadmap (+8 Morale)' }),
            ConsequenceEngine.stress('ADD', 3, { description: 'Intensive product development oversight' })
          ]
        },
        {
          id: 'opt_biz_debt_finance',
          label: 'Secure $350,000 Syndicated Revolving Credit Facility',
          description: 'Leverage debt to provide comfortable liquidity buffer while preserving operations.',
          risk: 'Medium',
          timeHorizon: '6 months',
          projectedOutcome: 'Adds $350,000 liquidity buffer with recurring debt interest servicing.',
          handlerKey: 'OPT_CHAIN_BIZ_FINANCE',
          consequences: [
            ConsequenceEngine.companyReserve(companyId, 'ADD', 350000, { description: 'Injected $350k revolving debt credit line' }),
            ConsequenceEngine.companyExpenses(companyId, 'ADD', 6500, { description: 'Debt service payment ($6,500/mo)' }),
            ConsequenceEngine.stress('ADD', 4, { description: 'Leverage and covenant risk anxiety' })
          ]
        },
        {
          id: 'opt_biz_sell_equity',
          label: 'Sell 10% Strategic Minority Equity Stake for $400,000',
          description: 'Bring in an institutional venture partner with industry distribution networks.',
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: 'Injects $400,000 equity, lowers player ownership by 10%.',
          handlerKey: 'OPT_CHAIN_BIZ_SELL',
          consequences: [
            ConsequenceEngine.companyReserve(companyId, 'ADD', 400000, { description: 'Received $400k minority equity capital' }),
            ConsequenceEngine.companyOwnership(companyId, 'SUBTRACT', 10, { description: 'Surrendered 10% equity stake to strategic partner' }),
            ConsequenceEngine.reputation('ADD', 3, { description: 'Secured high-profile institutional co-investor' })
          ]
        }
      ],
      nextStage: 'stage_2_evaluation_audit',
      delayMonths: 3
    },
    {
      id: 'stage_2_evaluation_audit',
      sequence: 2,
      title: `Turnaround Audit at ${companyName}: 3-Month Progress Review`,
      description: `Three months have passed since your initial turnaround decisions. Board members and operating leads have gathered for a quarterly progress audit.`,
      choices: [
        {
          id: 'opt_biz_audit_accelerate',
          label: 'Accelerate Go-To-Market Push & Expand Sales Team',
          description: 'Capitalize on early stabilization signs to recapture lost market share.',
          cost: 30000,
          risk: 'Medium',
          timeHorizon: '3 months',
          projectedOutcome: 'Increases monthly revenue, consumes $30k budget.',
          handlerKey: 'OPT_CHAIN_BIZ_AUDIT_ACCELERATE',
          consequences: [
            ConsequenceEngine.companyReserve(companyId, 'SUBTRACT', 30000, { description: 'Sales expansion budget allocation' }),
            ConsequenceEngine.companyRevenue(companyId, 'PERCENTAGE_CHANGE', 10, { description: 'Sales push expanded customer base (+10% Revenue)' })
          ]
        },
        {
          id: 'opt_biz_audit_consolidate',
          label: 'Strict Fiscal Discipline & Lean Operations',
          description: 'Lock in cost savings and maintain strict cash conservation until margins expand.',
          risk: 'Low',
          timeHorizon: '3 months',
          projectedOutcome: 'Stabilizes cash flow, preserves capital reserve.',
          handlerKey: 'OPT_CHAIN_BIZ_AUDIT_CONSOLIDATE',
          consequences: [
            ConsequenceEngine.companyMorale(companyId, 'ADD', 5, { description: 'Operational stability restored confidence' })
          ]
        }
      ],
      nextStage: 'stage_3_final_verdict',
      delayMonths: 3
    },
    {
      id: 'stage_3_final_verdict',
      sequence: 3,
      title: `Turnaround Conclusion: ${companyName} Reaches Critical Milestone`,
      description: `Six months of intensive restructuring and strategic realignment have reshaped ${companyName}. The market renders its ultimate verdict.`,
      choices: [
        {
          id: 'opt_biz_verdict_complete',
          label: 'Consolidate Turnaround Success & Issue Performance Dividend',
          description: 'Celebrate the enterprise revival with the board and leadership team.',
          risk: 'Low',
          timeHorizon: 'Permanent',
          projectedOutcome: '+25% Company Valuation, +18% Monthly Revenue, +8 Reputation.',
          handlerKey: 'OPT_CHAIN_BIZ_VERDICT_SUCCESS',
          consequences: [
            ConsequenceEngine.companyValuation(companyId, 'PERCENTAGE_CHANGE', 25, { description: 'Enterprise valuation surged 25% following successful turnaround' }),
            ConsequenceEngine.companyRevenue(companyId, 'PERCENTAGE_CHANGE', 18, { description: 'Top-line sales rebounded strongly (+18%)' }),
            ConsequenceEngine.reputation('ADD', 8, { description: 'Acclaimed turnaround operator reputation (+8)' }),
            ConsequenceEngine.stress('SUBTRACT', 10, { description: 'Turnaround pressure lifted' }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 12, { description: 'Exhilaration of saving enterprise' })
          ]
        }
      ]
    }
  ];

  return {
    id: chainId,
    name: `Turnaround Strategy: ${companyName}`,
    category: 'BUSINESS',
    currentStage: 'stage_1_crisis_outbreak',
    status: 'Active',
    startedMonth: startMonth,
    startedYear: startYear,
    variables: {
      companyId,
      companyName,
      strategyChosen: null
    },
    history: [],
    stages
  };
}

// ----------------------------------------------------
// 1. PARTY RECRUITMENT EVENT CHAIN
// ----------------------------------------------------

export function createPartyRecruitmentChain(
  partyId: string, 
  partyName: string, 
  startMonth: number, 
  startYear: number, 
  state?: GameState
): EventChain {
  const chainId = `chain_party_recruit_${partyId}_${Date.now()}`;
  const rep = state ? state.character.attributes.reputation : 45;
  const influence = state ? state.character.attributes.worldInfluence : 20;

  const stages: EventChainStage[] = [
    {
      id: 'stage_recruitment_invitation',
      sequence: 1,
      title: `Party Recruitment: Invitation from ${partyName}`,
      description: `Party leadership and steering delegates from ${partyName} have formally approached you. Recognizing your public stature (Reputation: ${rep}, Influence: ${influence}), they invite you into their inner leadership caucus.`,
      choices: [
        {
          id: 'opt_recruit_accept_standard',
          label: `Accept Official Party Membership & Endorsement`,
          description: `Pay $15,000 in party charter dues, pledge platform solidarity, and secure official delegate standing.`,
          cost: 15000,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `+$15 Party Loyalty, +20 Political Capital, joins ${partyName}.`,
          handlerKey: 'OPT_RECRUIT_ACCEPT',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 15000, { description: 'Party registration and charter dues' }),
            ConsequenceEngine.partyLoyalty(partyId, 'ADD', 20, { description: 'Official party registration' }),
            ConsequenceEngine.politicalCapital('ADD', 20, { description: 'Formal party delegate status' }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 6, { description: 'Party apparatus network access' })
          ]
        },
        {
          id: 'opt_recruit_accept_patron',
          label: `Join as Major Financial Patron & Committee Executive ($75,000)`,
          description: `Contribute $75,000 directly to the party war chest in exchange for high-level national committee influence.`,
          cost: 75000,
          risk: 'Medium',
          timeHorizon: 'Immediate',
          projectedOutcome: `+$75k Party War Chest, +35 Political Capital, +12 World Influence, heightened media scrutiny (+10).`,
          handlerKey: 'OPT_RECRUIT_PATRON',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 75000, { description: 'National party steering contribution' }),
            ConsequenceEngine.partyFunds(partyId, 'ADD', 75000, { description: 'Direct patron capital injection' }),
            ConsequenceEngine.partyLoyalty(partyId, 'ADD', 35, { description: 'Senior executive patron status' }),
            ConsequenceEngine.politicalCapital('ADD', 35, { description: 'Steering committee leverage' }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 12, { description: 'National political kingmaker stature' }),
            ConsequenceEngine.power('scrutiny', 'ADD', 10, { description: 'High-dollar political donation scrutiny' })
          ]
        },
        {
          id: 'opt_recruit_independent_charter',
          label: `Demand Independent Charter & Cross-Party Coalition Endorsement`,
          description: `Refuse strict party orthodoxy; agree to caucus with ${partyName} only on an independent reformist ticket.`,
          risk: 'High',
          timeHorizon: '1 month',
          projectedOutcome: `+12 Public Approval, +8 Reputation, friction with orthodox party loyalists (-10 Party Loyalty).`,
          handlerKey: 'OPT_RECRUIT_INDEPENDENT',
          consequences: [
            ConsequenceEngine.approval('ADD', 12, { description: 'Independent principled reform stance' }),
            ConsequenceEngine.reputation('ADD', 8, { description: 'Uncompromising reform integrity' }),
            ConsequenceEngine.partyLoyalty(partyId, 'SUBTRACT', 10, { description: 'Orthodox party whips irritated by independent posture' }),
            ConsequenceEngine.politicalCapital('ADD', 10, { description: 'Cross-bench bargaining leverage' })
          ]
        },
        {
          id: 'opt_recruit_decline_private',
          label: `Decline Invitation & Remain Completely Outside Politics`,
          description: `Politely decline all political overtures to maintain total private independence for your business and family.`,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `Preserves executive time, avoids media scrutiny, ends political recruitment.`,
          handlerKey: 'OPT_RECRUIT_DECLINE',
          consequences: [
            ConsequenceEngine.stress('SUBTRACT', 5, { description: 'Avoided political fray and partisan scrutiny' }),
            ConsequenceEngine.reputation('ADD', 2, { description: 'Respected for declining partisan entanglement' })
          ]
        }
      ],
      nextStage: 'stage_recruitment_caucus_platform',
      delayMonths: 1
    },
    {
      id: 'stage_recruitment_caucus_platform',
      sequence: 2,
      title: `Party Caucus: Ideological Platform Alignment`,
      description: `As an affiliated delegate within ${partyName}, you are invited to vote on the party's central policy platform manifesto.`,
      choices: [
        {
          id: 'opt_caucus_pro_business',
          label: `Champion the Pro-Enterprise & Capital Deregulation Caucus`,
          description: `Push for corporate tax reductions, private investment incentives, and regulatory streamlined permits.`,
          risk: 'Medium',
          timeHorizon: '3 months',
          projectedOutcome: `Boosts private business valuations (+10%), draws corporate donor support, minor working-class backlash (-5 Approval).`,
          handlerKey: 'OPT_CAUCUS_PRO_BUSINESS',
          consequences: [
            ConsequenceEngine.partyFunds(partyId, 'ADD', 50000, { description: 'Corporate PAC contributions to party' }),
            ConsequenceEngine.partyLoyalty(partyId, 'ADD', 15, { description: 'Business faction backing' }),
            ConsequenceEngine.approval('SUBTRACT', 5, { description: 'Labor unions critique pro-corporate tilt' }),
            ConsequenceEngine.power('businessInfluence', 'ADD', 8, { description: 'Commercial sector alignment' })
          ]
        },
        {
          id: 'opt_caucus_populist_labor',
          label: `Champion the Working-Class & Social Equity Caucus`,
          description: `Advocate for public wage growth, universal healthcare clinics, and infrastructure job guarantees.`,
          risk: 'Medium',
          timeHorizon: '3 months',
          projectedOutcome: `Surges public voter approval (+15 Approval, +8 Polling), causes minor friction with private corporate donors.`,
          handlerKey: 'OPT_CAUCUS_POPULIST',
          consequences: [
            ConsequenceEngine.approval('ADD', 15, { description: 'Working families endorse populist manifesto' }),
            ConsequenceEngine.partyPolling(partyId, 'ADD', 6, { description: 'Expanded grassroots electorate coalition' }),
            ConsequenceEngine.reputation('ADD', 8, { description: 'Champion of working-class prosperity' }),
            ConsequenceEngine.power('businessInfluence', 'SUBTRACT', 4, { description: 'Corporate donors express caution' })
          ]
        },
        {
          id: 'opt_caucus_technocrat_reform',
          label: `Champion the Technocratic Innovation & Green Infrastructure Caucus`,
          description: `Focus on modernizing state institutions, sovereign AI initiatives, and clean nuclear/grid expansion.`,
          risk: 'Low',
          timeHorizon: '3 months',
          projectedOutcome: `+12 World Influence, +10 Reputation, builds durable high-intellect cross-party consensus.`,
          handlerKey: 'OPT_CAUCUS_TECHNOCRAT',
          consequences: [
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 12, { description: 'High-tech national modernization blueprint' }),
            ConsequenceEngine.reputation('ADD', 10, { description: 'Acclaimed technocratic visionary' }),
            ConsequenceEngine.politicalCapital('ADD', 15, { description: 'Bipartisan policy credibility' })
          ]
        }
      ]
    }
  ];

  return {
    id: chainId,
    name: `Party Recruitment: ${partyName}`,
    category: 'POLITICS',
    currentStage: 'stage_recruitment_invitation',
    status: 'Active',
    startedMonth: startMonth,
    startedYear: startYear,
    variables: {
      partyId,
      partyName,
      recruitmentAccepted: false
    },
    history: [],
    stages
  };
}

// ----------------------------------------------------
// 2. COMPREHENSIVE 7-STAGE CAMPAIGN EVENT CHAIN
// ----------------------------------------------------

export function createComprehensiveCampaignChain(
  partyId: string, 
  partyName: string, 
  officeTitle: string, 
  startMonth: number, 
  startYear: number, 
  state?: GameState,
  campaignBudget: number = 50000
): EventChain {
  const chainId = `chain_campaign_${officeTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
  const country = state?.world[state.currentCountryIndex] || { businessCycle: 'Expansion', inflationRate: 3.2, gdpGrowthRate: 2.8 };

  const stages: EventChainStage[] = [
    // 1. FUNDRAISING
    {
      id: 'stage_campaign_fundraising',
      sequence: 1,
      title: `Electoral Campaign: War Chest & Fundraising Strategy`,
      description: `Launching your bid for ${officeTitle} requires immediate capitalization for field offices, advertising, and campaign staff.`,
      choices: [
        {
          id: 'opt_fund_self',
          label: `Self-Fund Campaign War Chest ($${campaignBudget.toLocaleString()} Cash)`,
          description: `Finance the campaign directly from personal capital to ensure 100% policy independence from special interests.`,
          cost: campaignBudget,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `Consumes $${campaignBudget.toLocaleString()}, +15 Independence, +10 Polling purity, minor family financial concern.`,
          handlerKey: 'OPT_CAMP_SELFFUND',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', campaignBudget, { description: 'Self-funded candidate campaign contribution' }),
            ConsequenceEngine.partyFunds(partyId, 'ADD', campaignBudget, { description: 'Candidate direct campaign treasury' }),
            ConsequenceEngine.approval('ADD', 8, { description: 'Voters admire self-funded unbought candidate' }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 8, { description: 'Financial firepower demonstrated' })
          ]
        },
        {
          id: 'opt_fund_superpac',
          label: `Assemble SuperPAC & Institutional Mega-Donor Coalition`,
          description: `Solicit industrial and financial conglomerates for bundled contributions, raising over $200,000 for television ads.`,
          cost: 10000,
          risk: 'Medium',
          timeHorizon: '1 month',
          projectedOutcome: `+$200,000 War Chest, +15 Media Visibility, +12 Regulatory Scrutiny from investigative press.`,
          handlerKey: 'OPT_CAMP_SUPERPAC',
          consequences: [
            ConsequenceEngine.partyFunds(partyId, 'ADD', 200000, { description: 'SuperPAC bundled donor contributions' }),
            ConsequenceEngine.power('visibility', 'ADD', 15, { description: 'Massive saturation donor ad campaign' }),
            ConsequenceEngine.power('scrutiny', 'ADD', 12, { description: 'Press inquiry into corporate mega-donors' }),
            ConsequenceEngine.reputation('SUBTRACT', 2, { description: 'Opposition critiques dark money PAC ties' })
          ]
        },
        {
          id: 'opt_fund_grassroots',
          label: `Organize Grassroots Small-Dollar Digital Crowdfunding Drive`,
          description: `Mobilize thousands of ordinary working citizens with small $25-$100 donations via viral social campaigns.`,
          risk: 'Low',
          timeHorizon: '2 months',
          projectedOutcome: `Raises $45,000 organically, +18 Public Approval, +8 Grassroots Polling, zero corporate strings attached.`,
          handlerKey: 'OPT_CAMP_GRASSROOTS',
          consequences: [
            ConsequenceEngine.partyFunds(partyId, 'ADD', 45000, { description: 'Grassroots small-dollar donor influx' }),
            ConsequenceEngine.approval('ADD', 18, { description: 'Popular small-donor people-powered movement' }),
            ConsequenceEngine.partyPolling(partyId, 'ADD', 8, { description: 'Surge in high-enthusiasm likely voters' }),
            ConsequenceEngine.stress('ADD', 4, { description: 'Relentless rally schedule' })
          ]
        }
      ],
      nextStage: 'stage_campaign_strategy',
      delayMonths: 1
    },

    // 2. STRATEGY
    {
      id: 'stage_campaign_strategy',
      sequence: 2,
      title: `Electoral Campaign: Strategic Ground & Air War`,
      description: `With the war chest established, your campaign manager presents the overarching voter engagement strategy for ${officeTitle}.`,
      choices: [
        {
          id: 'opt_strat_ground_game',
          label: `Intensive Precinct Ground Game & Community Townhalls`,
          description: `Deploy hundreds of canvassers across key swing precincts and host direct town hall Q&A sessions.`,
          cost: 20000,
          risk: 'Low',
          timeHorizon: '1 month',
          projectedOutcome: `+12 Polling margin in swing districts, +8 Electorate Trust, +6 Stress from demanding travel.`,
          handlerKey: 'OPT_STRAT_GROUND',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 20000, { description: 'Field office logistics and canvasser operations' }),
            ConsequenceEngine.partyPolling(partyId, 'ADD', 12, { description: 'Swing precinct voter contact efficiency' }),
            ConsequenceEngine.reputation('ADD', 6, { description: 'Direct community engagement praised' }),
            ConsequenceEngine.stress('ADD', 6, { description: 'Exhausting townhall touring schedule' })
          ]
        },
        {
          id: 'opt_strat_media_blitz',
          label: `Heavy Television & Digital Media Blitz ($50,000)`,
          description: `Blanket primetime broadcasts, streaming platforms, and billboards with cinematic policy ads.`,
          cost: 50000,
          risk: 'Medium',
          timeHorizon: '1 month',
          projectedOutcome: `+18 Media Visibility, +10 Broad Polling, reaches low-information undecided voters.`,
          handlerKey: 'OPT_STRAT_MEDIA',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 50000, { description: 'Primetime broadcast and digital ad spend' }),
            ConsequenceEngine.power('visibility', 'ADD', 18, { description: 'High-frequency household ad recall' }),
            ConsequenceEngine.partyPolling(partyId, 'ADD', 10, { description: 'Undecided voter conversion via media' })
          ]
        },
        {
          id: 'opt_strat_oppo_research',
          label: `Deploy Opposition Research & Hard-Hitting Contrast Ads`,
          description: `Highlight your rival's controversial voting record, corporate conflicts of interest, and unfulfilled pledges.`,
          cost: 15000,
          risk: 'High',
          timeHorizon: '1 month',
          projectedOutcome: `Slashes opponent polling by 14%, +8 Victory Margin, -4 Personal Optics blowback from negative attack ads.`,
          handlerKey: 'OPT_STRAT_OPPO',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 15000, { description: 'Investigative opposition research dossier' }),
            ConsequenceEngine.partyPolling(partyId, 'ADD', 14, { description: 'Opponent support collapsed under scrutiny' }),
            ConsequenceEngine.reputation('SUBTRACT', 4, { description: 'Editorial critiques over negative attack tone' }),
            ConsequenceEngine.power('scrutiny', 'ADD', 8, { description: 'Retaliatory oppo-dumps from rival campaigns' })
          ]
        }
      ],
      nextStage: 'stage_campaign_media',
      delayMonths: 1
    },

    // 3. MEDIA
    {
      id: 'stage_campaign_media',
      sequence: 3,
      title: `Electoral Campaign: Primetime Media & Press Crossfire`,
      description: `National journalists and broadcast networks request headline appearances as early voting begins.`,
      choices: [
        {
          id: 'opt_media_primetime_interview',
          label: `Accept 60-Minute Hard-Hitting Live Primetime Broadcast`,
          description: `Answer unscripted questions from veteran political journalists under intense studio lights.`,
          risk: 'Medium',
          timeHorizon: 'Immediate',
          projectedOutcome: `+15 Media Attention, +10 Public Approval if Intelligence is high, cements executive gravitas.`,
          handlerKey: 'OPT_MEDIA_PRIMETIME',
          consequences: [
            ConsequenceEngine.power('visibility', 'ADD', 15, { description: 'Live primetime broadcast audience' }),
            ConsequenceEngine.approval('ADD', 10, { description: 'Masterful television interview composure' }),
            ConsequenceEngine.reputation('ADD', 8, { description: 'Formidable command of national issues' })
          ]
        },
        {
          id: 'opt_media_podcast_tour',
          label: `Embark on Viral Long-Form Digital & Podcast Media Tour`,
          description: `Engage in 3-hour authentic conversations covering philosophy, economics, and vision on top global podcasts.`,
          risk: 'Low',
          timeHorizon: '1 month',
          projectedOutcome: `+20 Youth Polling, +15 Social Sentiment, breaks through traditional media gatekeepers.`,
          handlerKey: 'OPT_MEDIA_PODCAST',
          consequences: [
            ConsequenceEngine.partyPolling(partyId, 'ADD', 9, { description: 'Massive surge in young voter registration' }),
            ConsequenceEngine.approval('ADD', 12, { description: 'Authentic unfiltered conversational appeal' }),
            ConsequenceEngine.playerAttribute('charm', 'ADD', 3, { description: 'Media charisma honed' })
          ]
        },
        {
          id: 'opt_media_newspaper_endorsements',
          label: `Pitch Editorial Boards of Leading National Newspapers`,
          description: `Deliver detailed policy dossiers to newspaper publishers and secure formal front-page endorsements.`,
          risk: 'Low',
          timeHorizon: '1 month',
          projectedOutcome: `Secures prestigious newspaper endorsements, +10 Party Loyalty, +6 Institutional Credibility.`,
          handlerKey: 'OPT_MEDIA_ENDORSE',
          consequences: [
            ConsequenceEngine.reputation('ADD', 8, { description: 'Endorsed by leading national editorial boards' }),
            ConsequenceEngine.partyLoyalty(partyId, 'ADD', 10, { description: 'Establishment and civic leader consensus' }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 6, { description: 'Editorial validation' })
          ]
        }
      ],
      nextStage: 'stage_campaign_polling',
      delayMonths: 1
    },

    // 4. POLLING & ECONOMIC PIVOT
    {
      id: 'stage_campaign_polling',
      sequence: 4,
      title: `Electoral Campaign: Mid-Race Polling & Economic Pivot`,
      description: `Internal polls show a tight race. Economic indicators show national business cycle in "${country.businessCycle}" phase with ${country.inflationRate}% inflation.`,
      choices: [
        {
          id: 'opt_poll_economic_competence',
          label: `Pivot Campaign Message to Cost of Living & Pragmatic Economic Growth`,
          description: `Capitalize on macroeconomic concerns; present an actionable plan to curb inflation, protect pensions, and boost business.`,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `+14 Polling among suburban swing voters, +10 Public Approval for economic seriousness.`,
          handlerKey: 'OPT_POLL_ECONOMIC',
          consequences: [
            ConsequenceEngine.partyPolling(partyId, 'ADD', 14, { description: 'Economic competence resonates with swing voters' }),
            ConsequenceEngine.approval('ADD', 10, { description: 'Voters trust candidate on cost of living' }),
            ConsequenceEngine.reputation('ADD', 6, { description: 'Pragmatic fiscal stewardship' })
          ]
        },
        {
          id: 'opt_poll_public_safety',
          label: `Pivot Campaign to Civic Modernization & Public Safety`,
          description: `Promise substantial investments in state law enforcement technology, emergency services, and civic order.`,
          risk: 'Medium',
          timeHorizon: 'Immediate',
          projectedOutcome: `+11 Polling in working-class neighborhoods, +8 Party Loyalty, consolidates conservative base.`,
          handlerKey: 'OPT_POLL_SAFETY',
          consequences: [
            ConsequenceEngine.partyPolling(partyId, 'ADD', 11, { description: 'Law and order message consolidates base' }),
            ConsequenceEngine.partyLoyalty(partyId, 'ADD', 12, { description: 'Civic safety coalition energized' })
          ]
        },
        {
          id: 'opt_poll_generational_change',
          label: `Deliver Generational Change & Anti-Corruption Rally Cry`,
          description: `Attack political stagnation and promise radical institutional transparency and ethics overhauls.`,
          risk: 'High',
          timeHorizon: 'Immediate',
          projectedOutcome: `+16 Polling momentum among independents, stirs panic among old-guard party bosses.`,
          handlerKey: 'OPT_POLL_REFORM',
          consequences: [
            ConsequenceEngine.partyPolling(partyId, 'ADD', 16, { description: 'Massive surge in anti-establishment independent turnout' }),
            ConsequenceEngine.approval('ADD', 14, { description: 'Populist integrity acclaimed' }),
            ConsequenceEngine.partyLoyalty(partyId, 'SUBTRACT', 6, { description: 'Establishment bosses uncomfortable with ethics talk' })
          ]
        }
      ],
      nextStage: 'stage_campaign_debate',
      delayMonths: 1
    },

    // 5. DEBATE
    {
      id: 'stage_campaign_debate',
      sequence: 5,
      title: `The Grand National Televised Debate for ${officeTitle}`,
      description: `Millions of citizens tune in live for the marquee debate. The moderator asks a sharp, contentious question about economic policy, tax justice, and national leadership.`,
      choices: [
        {
          id: 'opt_debate_rigorous_data',
          label: `Deliver a Rigorous, Data-Driven Blueprint with Economic Mastery`,
          description: `Dissect the national budget with laser precision, citing productivity indices and fiscal math.`,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `Wins instantaneous post-debate snap polls (+15 Polling), lauded by financial commentators.`,
          handlerKey: 'OPT_DEBATE_DATA',
          consequences: [
            ConsequenceEngine.partyPolling(partyId, 'ADD', 15, { description: 'Dominant debate mastery captured undecided voters' }),
            ConsequenceEngine.reputation('ADD', 10, { description: 'Debate performance praised across editorial boards' }),
            ConsequenceEngine.playerAttribute('intelligence', 'ADD', 3, { description: 'Mastery of state policy complexities' })
          ]
        },
        {
          id: 'opt_debate_inspiring_vision',
          label: `Deliver an Inspiring, Emotional Vision of Hope and Unity`,
          description: `Speak directly into the camera about dignity, family security, national pride, and a boundless future.`,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `Generates viral moments (+18 Enthusiasm), surges household approval (+15 Approval).`,
          handlerKey: 'OPT_DEBATE_VISION',
          consequences: [
            ConsequenceEngine.approval('ADD', 15, { description: 'Heartfelt emotional closing resonated with families' }),
            ConsequenceEngine.partyPolling(partyId, 'ADD', 12, { description: 'Emotional connection mobilized undecided voters' }),
            ConsequenceEngine.playerAttribute('charm', 'ADD', 5, { description: 'Televised rhetorical brilliance' }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 10, { description: 'Exhilarating debate performance' })
          ]
        },
        {
          id: 'opt_debate_aggressive_cross',
          label: `Launch an Unflinching Cross-Examination of the Opponent's Failures`,
          description: `Relentlessly expose your rival's contradictions, budget deficits, and unkept promises.`,
          risk: 'High',
          timeHorizon: 'Immediate',
          projectedOutcome: `Disorients opponent on stage (+12 Polling), but polarizes opposing partisans.`,
          handlerKey: 'OPT_DEBATE_AGGRESSIVE',
          consequences: [
            ConsequenceEngine.partyPolling(partyId, 'ADD', 12, { description: 'Opponent visibly rattled under interrogation' }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 8, { description: 'Uncompromising political alpha posture' }),
            ConsequenceEngine.stress('ADD', 6, { description: 'Tense high-stakes clash' })
          ]
        }
      ],
      nextStage: 'stage_campaign_election_day',
      delayMonths: 1
    },

    // 6. ELECTION DAY
    {
      id: 'stage_campaign_election_day',
      sequence: 6,
      title: `General Election Day: GOTV Mobilization & Vote Counting`,
      description: `Polling booths open at dawn across every district. Long queues form as turnout approaches historic highs.`,
      choices: [
        {
          id: 'opt_election_gotv_triumph',
          label: `Deploy Mega GOTV (Get-Out-The-Vote) Machine & Voter Fleets ($25,000)`,
          description: `Coordinate thousands of volunteer drivers, phone bankers, and precinct captains to maximize turnout.`,
          cost: 25000,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `Maximizes ballot turnout (+18 Victory Margin), seals decisive electoral mandate.`,
          handlerKey: 'OPT_ELECTION_GOTV',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 25000, { description: 'Election day GOTV transport and logistics fleet' }),
            ConsequenceEngine.partyPolling(partyId, 'ADD', 18, { description: 'Flawless turnout mobilization across core districts' }),
            ConsequenceEngine.politicalCapital('ADD', 25, { description: 'Enormous electoral mobilization machine' })
          ]
        },
        {
          id: 'opt_election_ballot_security',
          label: `Mobilize Legal Defense & Precinct Ballot Integrity Watchers`,
          description: `Station certified legal observers at every ballot count station to guarantee accurate certified results.`,
          cost: 10000,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `Secures verified certified vote tally, protects against disputed margins.`,
          handlerKey: 'OPT_ELECTION_LEGAL',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 10000, { description: 'Election legal monitoring team' }),
            ConsequenceEngine.reputation('ADD', 5, { description: 'Rigorous electoral process integrity' }),
            ConsequenceEngine.partyPolling(partyId, 'ADD', 10, { description: 'Secured every contested precinct count' })
          ]
        }
      ],
      nextStage: 'stage_campaign_result',
      delayMonths: 1
    },

    // 7. RESULT
    {
      id: 'stage_campaign_result',
      sequence: 7,
      title: `Official Election Verdict: Swearing In for ${officeTitle}`,
      description: `Election authorities certify the vote totals. National broadcast networks declare you the WINNER of the race for ${officeTitle}!`,
      choices: [
        {
          id: 'opt_camp_take_oath',
          label: `Take Constitutional Oath of Office & Deliver Victory Address`,
          description: `Formally take office as ${officeTitle} with a 48-month statutory mandate and sovereign executive authority.`,
          risk: 'Low',
          timeHorizon: 'Permanent',
          projectedOutcome: `Assumes office of ${officeTitle}, +30 World Influence, +20 Reputation, +$${officeTitle === 'Mayor' ? '12,000' : '45,000'}/mo Salary, 74% Approval.`,
          handlerKey: 'OPT_CAMP_OATH',
          consequences: [
            ConsequenceEngine.politicalOffice(officeTitle, true, { description: `Sworn in to public office as ${officeTitle}` }),
            ConsequenceEngine.approval('SET', 74, { description: 'Post-election honeymoon approval rating (74%)' }),
            ConsequenceEngine.politicalCapital('SET', 80, { description: 'Robust post-victory political capital (80 pts)' }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 30, { description: `Constitutional authority as ${officeTitle}` }),
            ConsequenceEngine.reputation('ADD', 20, { description: `Historic election victory mandate` }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 25, { description: 'Triumphant election night celebration' }),
            ConsequenceEngine.stress('SUBTRACT', 12, { description: 'Campaign exhaustion lifted' })
          ]
        }
      ]
    }
  ];

  return {
    id: chainId,
    name: `Electoral Campaign: ${officeTitle}`,
    category: 'POLITICS',
    currentStage: 'stage_campaign_fundraising',
    status: 'Active',
    startedMonth: startMonth,
    startedYear: startYear,
    variables: {
      partyId,
      partyName,
      officeTitle,
      campaignBudget,
      pollingMargin: 8
    },
    history: [],
    stages
  };
}

// ----------------------------------------------------
// 3. POLITICAL OFFICE & GOVERNANCE EVENT CHAIN
// ----------------------------------------------------

export function createPoliticalGovernanceChain(
  officeTitle: string, 
  jurisdiction: string, 
  startMonth: number, 
  startYear: number, 
  state?: GameState
): EventChain {
  const chainId = `chain_office_gov_${Date.now()}`;
  const approval = state ? state.politics.currentOffice.approvalRating : 65;
  const capital = state ? state.politics.currentOffice.politicalCapital : 50;

  const stages: EventChainStage[] = [
    // 1. POLICY DECISION
    {
      id: 'stage_gov_policy_reform',
      sequence: 1,
      title: `Executive Governance: National Policy Reform Bill`,
      description: `As the incumbent ${officeTitle} of ${jurisdiction} (Approval: ${approval}%, Political Capital: ${capital}), your administration prepares to introduce its signature statutory reform bill.`,
      choices: [
        {
          id: 'opt_gov_pro_growth_dereg',
          label: `Enact Comprehensive Pro-Growth Tax & Enterprise Reform`,
          description: `Lower corporate tax burdens to 15%, streamline commercial development permits, and incentivize private capital investment.`,
          risk: 'Medium',
          timeHorizon: '6 months',
          projectedOutcome: `Directly boosts private company revenues (+15%) and valuations (+20%), +10 Business Influence, slight friction with labor progressives (-6 Approval).`,
          handlerKey: 'OPT_GOV_PRO_GROWTH',
          consequences: [
            ConsequenceEngine.power('businessInfluence', 'ADD', 15, { description: 'National enterprise deregulation acclaim' }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 10, { description: 'Global business capital hub prestige' }),
            ConsequenceEngine.approval('SUBTRACT', 6, { description: 'Progressive labor groups voice skepticism' }),
            ConsequenceEngine.reputation('ADD', 8, { description: 'Champion of enterprise productivity' })
          ]
        },
        {
          id: 'opt_gov_universal_social',
          label: `Enact Universal Healthcare, Public Clinics & Education Mandate`,
          description: `Allocate state funding to modernize hospitals, expand community clinics, and raise teacher salaries.`,
          risk: 'Low',
          timeHorizon: '6 months',
          projectedOutcome: `Surges public voter approval (+20 Approval), increases social cohesion, minor cost friction with large corporate donors.`,
          handlerKey: 'OPT_GOV_SOCIAL',
          consequences: [
            ConsequenceEngine.approval('ADD', 20, { description: 'Universal healthcare and education reform popular acclaim' }),
            ConsequenceEngine.reputation('ADD', 12, { description: 'Acclaimed public welfare statesman' }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 10, { description: 'Historic social legacy achievement' }),
            ConsequenceEngine.power('businessInfluence', 'SUBTRACT', 5, { description: 'Corporate lobby protests taxation' })
          ]
        },
        {
          id: 'opt_gov_green_megaprojects',
          label: `Enact Sovereign Green Tech & Advanced Infrastructure Megaproject`,
          description: `Authorize $10B in state bond funding for high-speed rail, nuclear energy grids, and domestic semiconductor fabs.`,
          risk: 'Low',
          timeHorizon: '12 months',
          projectedOutcome: `+15 National GDP trajectory, +18 World Influence, unlocks high-value sovereign state contract opportunities.`,
          handlerKey: 'OPT_GOV_INFRASTRUCTURE',
          consequences: [
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 18, { description: 'Sovereign infrastructure modernization legacy' }),
            ConsequenceEngine.approval('ADD', 12, { description: 'Public excitement for futuristic transit and clean power' }),
            ConsequenceEngine.reputation('ADD', 10, { description: 'Monumental builder statesmanship' })
          ]
        }
      ],
      nextStage: 'stage_gov_opposition_whip',
      delayMonths: 2
    },

    // 2. OPPOSITION & WHIP BATTLE
    {
      id: 'stage_gov_opposition_whip',
      sequence: 2,
      title: `Legislative Showdown: Whipping the Opposition & Coalition`,
      description: `Opposition parties threaten a parliamentary filibuster and media boycott to derail your administration's agenda.`,
      choices: [
        {
          id: 'opt_gov_whip_capital',
          label: `Deploy 20 Political Capital to Whip Party Majority and Pass Bill`,
          description: `Enforce strict party discipline, offer key committee chairmanships, and secure full majority floor passage.`,
          risk: 'Low',
          timeHorizon: '1 month',
          projectedOutcome: `-20 Political Capital, passes bill with zero amendments, demonstrates commanding legislative mastery.`,
          handlerKey: 'OPT_GOV_WHIP',
          consequences: [
            ConsequenceEngine.politicalCapital('SUBTRACT', 20, { description: 'Expended political capital to enforce party discipline' }),
            ConsequenceEngine.reputation('ADD', 10, { description: 'Total legislative victory in parliament' }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 8, { description: 'Commanding executive authority' })
          ]
        },
        {
          id: 'opt_gov_bipartisan_compromise',
          label: `Negotiate Bipartisan Compromise with Opposition Moderates`,
          description: `Incorporate cross-party amendments to build broad consensus without expending political capital.`,
          risk: 'Low',
          timeHorizon: '2 months',
          projectedOutcome: `Preserves political capital, +10 Bipartisan Trust, passes bill with 85% multi-party approval.`,
          handlerKey: 'OPT_GOV_COMPROMISE',
          consequences: [
            ConsequenceEngine.approval('ADD', 10, { description: 'Voters applaud constructive bipartisan compromise' }),
            ConsequenceEngine.reputation('ADD', 8, { description: 'Consensus-builder statesman reputation' }),
            ConsequenceEngine.stress('SUBTRACT', 4, { description: 'Defused political hostility' })
          ]
        },
        {
          id: 'opt_gov_executive_decree',
          label: `Bypass Legislative Gridlock via Sovereign Executive Order`,
          description: `Sign an immediate executive decree enacting the policies directly through administrative prerogative.`,
          risk: 'High',
          timeHorizon: 'Immediate',
          projectedOutcome: `Immediate policy effect, +15 Media Scrutiny, opposition files constitutional court injunctions.`,
          handlerKey: 'OPT_GOV_DECREE',
          consequences: [
            ConsequenceEngine.power('scrutiny', 'ADD', 15, { description: 'Executive order controversy in media' }),
            ConsequenceEngine.power('regulatoryAttention', 'ADD', 12, { description: 'Opposition constitutional court challenge' }),
            ConsequenceEngine.stress('ADD', 8, { description: 'Constitutional tension and legal battle' })
          ]
        }
      ],
      nextStage: 'stage_gov_approval_verdict',
      delayMonths: 2
    },

    // 3. APPROVAL & ELECTORATE VERDICT
    {
      id: 'stage_gov_approval_verdict',
      sequence: 3,
      title: `Electorate Verdict: National Approval & Polling Shift`,
      description: `Independent polling agencies publish comprehensive quarterly governance surveys evaluating your executive performance.`,
      choices: [
        {
          id: 'opt_gov_celebrate_mandate',
          label: `Consolidate National Standing & Deliver State of the Union Address`,
          description: `Highlight economic indicators, infrastructure milestones, and social stability to the nation.`,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `Sets public approval at 78%, +15 Political Capital, cements legacy as transformative leader.`,
          handlerKey: 'OPT_GOV_APPROVAL_SOLID',
          consequences: [
            ConsequenceEngine.approval('SET', 78, { description: 'Commanding 78% national approval rating' }),
            ConsequenceEngine.politicalCapital('ADD', 15, { description: 'Soaring public confidence boosts capital' }),
            ConsequenceEngine.reputation('ADD', 8, { description: 'Celebrated governance leadership' })
          ]
        }
      ],
      nextStage: 'stage_gov_lobbying_deal',
      delayMonths: 3
    },

    // 4. LOBBYING & SPECIAL INTERESTS
    {
      id: 'stage_gov_lobbying_deal',
      sequence: 4,
      title: `Special Interest Lobbying: Mega-Conglomerate PAC Overtures`,
      description: `A powerful lobbying coalition of energy, defense, and pharmaceutical conglomerates offers a $150,000 party campaign endowment in exchange for preferential regulatory waivers.`,
      choices: [
        {
          id: 'opt_gov_reject_lobbyists',
          label: `Flatly Reject Special Interest Overtures & Champion Anti-Corruption`,
          description: `Publicly condemn backroom pay-to-play influence and reinforce open ethics guidelines.`,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `+18 Public Approval, +12 Public Integrity Reputation, corporate lobby shifts funding to rivals.`,
          handlerKey: 'OPT_GOV_REJECT_LOBBY',
          consequences: [
            ConsequenceEngine.approval('ADD', 18, { description: 'Anti-corruption principled stance universally praised' }),
            ConsequenceEngine.reputation('ADD', 12, { description: 'Uncompromising integrity statesman' }),
            ConsequenceEngine.power('scrutiny', 'SUBTRACT', 10, { description: 'Zero ethics vulnerability' })
          ]
        },
        {
          id: 'opt_gov_negotiate_transparent_pact',
          label: `Negotiate Transparent Public-Private Investment Compact`,
          description: `Direct corporate contributions to transparent regional infrastructure funds with strict public oversight.`,
          risk: 'Medium',
          timeHorizon: '3 months',
          projectedOutcome: `+$150,000 for regional development, +10 Business Influence, balanced public optics.`,
          handlerKey: 'OPT_GOV_TRANSPARENT_PACT',
          consequences: [
            ConsequenceEngine.cash('ADD', 50000, { description: 'Executive discretionary regional development fund' }),
            ConsequenceEngine.power('businessInfluence', 'ADD', 10, { description: 'Constructive public-private partnership' }),
            ConsequenceEngine.reputation('ADD', 5, { description: 'Pragmatic capital mobilization' })
          ]
        }
      ],
      nextStage: 'stage_gov_scandal_inquiry',
      delayMonths: 3
    },

    // 5. SCANDALS & ETHICS INQUIRY
    {
      id: 'stage_gov_scandal_inquiry',
      sequence: 5,
      title: `Ethics Committee Review: Business Holdings & Public Office Scrutiny`,
      description: `Investigative reporters and parliamentary ethics watchdogs examine potential conflicts of interest between your private enterprises and executive decisions.`,
      choices: [
        {
          id: 'opt_gov_blind_trust',
          label: `Transfer All Business Holdings into a Certified Independent Blind Trust`,
          description: `Surrender all voting control and management of private companies to an independent fiduciary board during your time in office.`,
          risk: 'Low',
          timeHorizon: 'Permanent while in office',
          projectedOutcome: `-20 Scrutiny, +15 Public Trust, eliminates all conflict of interest vulnerabilities cleanly.`,
          handlerKey: 'OPT_GOV_BLIND_TRUST',
          consequences: [
            ConsequenceEngine.power('scrutiny', 'SUBTRACT', 20, { description: 'Blind trust eliminated ethics conflict' }),
            ConsequenceEngine.approval('ADD', 12, { description: 'Exemplary ethics transparency praised' }),
            ConsequenceEngine.reputation('ADD', 8, { description: 'Highest ethical standards in public life' })
          ]
        },
        {
          id: 'opt_gov_defiant_defense',
          label: `Launch Defiant Public Counter-Attack ("Partisan Smear Campaign")`,
          description: `Hold a press conference asserting your business career provides real-world acumen that bureaucrats lack.`,
          risk: 'High',
          timeHorizon: '1 month',
          projectedOutcome: `Energizes loyal political base, but keeps media scrutiny elevated (+12 Scrutiny).`,
          handlerKey: 'OPT_GOV_DEFIANT',
          consequences: [
            ConsequenceEngine.politicalCapital('ADD', 10, { description: 'Base rallied behind leader' }),
            ConsequenceEngine.power('scrutiny', 'ADD', 12, { description: 'Press continues investigative scrutiny' }),
            ConsequenceEngine.stress('ADD', 8, { description: 'Sustained media warfare' })
          ]
        }
      ],
      nextStage: 'stage_gov_reelection_verdict',
      delayMonths: 3
    },

    // 6. RE-ELECTION
    {
      id: 'stage_gov_reelection_verdict',
      sequence: 6,
      title: `Incumbent Re-Election: Defending the Historic Governance Record`,
      description: `As your 4-year term nears its conclusion, citizens head to the polls to render their verdict on your stewardship, economic growth, and statesmanship.`,
      choices: [
        {
          id: 'opt_gov_reelection_triumph',
          label: `Deliver Triumphant Re-Election Victory Address (+4 Year Term Extension)`,
          description: `Voters decisively renew your mandate for another 48 months with broad multi-district margins.`,
          risk: 'Low',
          timeHorizon: 'Permanent',
          projectedOutcome: `Renewed for 48 months in office, +35 World Influence, +25 Reputation, cements historic legacy.`,
          handlerKey: 'OPT_GOV_REELECTION_TRIUMPH',
          consequences: [
            ConsequenceEngine.politicalOffice(officeTitle, true, { description: `Re-elected to second term as ${officeTitle}` }),
            ConsequenceEngine.approval('SET', 80, { description: 'Second-term mandate approval (80%)' }),
            ConsequenceEngine.politicalCapital('SET', 90, { description: 'Commanding incumbent political capital (90 pts)' }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 35, { description: 'Historic multi-term statesmanship' }),
            ConsequenceEngine.reputation('ADD', 25, { description: 'Enduring national legacy cemented' }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 30, { description: 'Historic re-election triumph' })
          ]
        }
      ]
    }
  ];

  return {
    id: chainId,
    name: `Executive Governance: ${officeTitle}`,
    category: 'POLITICS',
    currentStage: 'stage_gov_policy_reform',
    status: 'Active',
    startedMonth: startMonth,
    startedYear: startYear,
    variables: {
      officeTitle,
      jurisdiction,
      governanceRating: 85
    },
    history: [],
    stages
  };
}

export function createPoliticalCampaignChain(partyId: string, partyName: string, officeTitle: string, startMonth: number, startYear: number): EventChain {
  return createComprehensiveCampaignChain(partyId, partyName, officeTitle, startMonth, startYear);
}

// ==========================================
// EVENT CHAIN ADVANCEMENT & SIMULATION ENGINE
// ==========================================

/**
 * Initializes or triggers a new event chain, adding it to GameState
 */
export function startEventChain(
  gameState: GameState,
  chain: EventChain
): { nextState: GameState; initialEvent: SimulationEvent; initialDecision?: PendingDecision } {
  const currentStageObj = chain.stages?.find(s => s.id === chain.currentStage) || chain.stages?.[0];
  if (!currentStageObj) {
    return {
      nextState: gameState,
      initialEvent: {
        id: `ev_chain_err_${chain.id}`,
        category: chain.category,
        title: chain.name,
        description: 'Event chain initialized without stages.',
        status: 'Active'
      }
    };
  }

  const initialEvent: SimulationEvent = {
    id: `ev_chain_${chain.id}_${currentStageObj.id}`,
    category: chain.category,
    type: 'DECISION',
    title: currentStageObj.title,
    description: currentStageObj.description,
    severity: 'High',
    priority: 88,
    source: chain.name,
    sourceEntityId: chain.id,
    createdMonth: gameState.currentMonth,
    createdYear: gameState.currentYear,
    timestampMonth: gameState.currentMonth,
    timestampYear: gameState.currentYear,
    age: gameState.character.age,
    status: 'Active',
    chainId: chain.id,
    choices: currentStageObj.choices,
    tags: ['EventChain', chain.category, chain.name],
    triggerReason: `Multi-stage event chain '${chain.name}' initiated Stage 1 (${currentStageObj.title}).`
  };

  const initialDecision: PendingDecision = {
    id: `dec_chain_${chain.id}_${currentStageObj.id}`,
    category: chain.category === 'POLITICS' ? 'Politics' : 'Business',
    title: currentStageObj.title,
    description: currentStageObj.description,
    urgency: 'Critical',
    options: currentStageObj.choices.map(c => ({
      id: c.id,
      label: c.label,
      description: c.description,
      cost: c.cost,
      risk: c.risk || 'Medium',
      timeHorizon: c.timeHorizon || '1-3 months',
      projectedOutcome: c.projectedOutcome || '',
      handlerKey: c.handlerKey || 'OPT_CHAIN_STAGE',
      consequences: c.consequences
    }))
  };

  const updatedChains = [...(gameState.activeEventChains || []).filter(c => c.id !== chain.id), chain];
  const nextState: GameState = {
    ...gameState,
    activeEventChains: updatedChains,
    pendingDecisions: [...(gameState.pendingDecisions || []).filter(d => d.id !== initialDecision.id), initialDecision],
    eventsFeed: [initialEvent, ...(gameState.eventsFeed || [])]
  };

  return {
    nextState,
    initialEvent,
    initialDecision
  };
}

/**
 * Handles the selection of a choice inside an active event chain.
 * Records the choice into the chain's persistent history & variables,
 * schedules future stage delays if defined, and advances currentStage.
 */
export function advanceEventChain(
  gameState: GameState,
  chainId: string,
  stageId: string,
  choiceId: string
): { nextState: GameState; completed: boolean; nextStagePrompt?: string } {
  let state = { ...gameState };
  const chainIndex = (state.activeEventChains || []).findIndex(c => c.id === chainId);
  if (chainIndex === -1) {
    return { nextState: state, completed: false };
  }

  const chain = { ...state.activeEventChains[chainIndex] };
  const stage = chain.stages?.find(s => s.id === stageId);
  if (!stage) {
    return { nextState: state, completed: false };
  }

  const choice = stage.choices.find(c => c.id === choiceId) || stage.choices[0];

  // Record history entry
  const historyEntry: EventChainHistoryEntry = {
    stageId: stage.id,
    stageSequence: stage.sequence,
    stageTitle: stage.title,
    choiceId: choice?.id,
    choiceLabel: choice?.label,
    month: state.currentMonth,
    year: state.currentYear,
    tick: state.simulationTick,
    outcomeDescription: choice?.projectedOutcome
  };

  chain.history = [...(chain.history || []), historyEntry];
  chain.variables = {
    ...chain.variables,
    [`stage_${stage.sequence}_choice`]: choice?.id,
    [`stage_${stage.sequence}_label`]: choice?.label,
    lastUpdatedTick: state.simulationTick
  };

  // Check if there is a next stage or if we reached terminal stage
  const nextStageId = stage.nextStage;

  if (choice?.id === 'opt_pol_decline' || choice?.id === 'opt_recruit_decline_private') {
    // Player declined politics / recruitment chain
    chain.status = 'Completed';
    state.activeEventChains = state.activeEventChains.filter(c => c.id !== chainId);
    state.completedEventChains = [...(state.completedEventChains || []), chain];
    return { nextState: state, completed: true, nextStagePrompt: 'You declined the political invitation and preserved your private status.' };
  }

  if (choice?.id === 'opt_recruit_accept_standard' || choice?.id === 'opt_recruit_independent_charter') {
    if (chain.variables?.partyId) {
      state.politics = {
        ...state.politics,
        selectedPartyId: chain.variables.partyId as string,
        currentOffice: {
          ...state.politics.currentOffice,
          title: state.politics.currentOffice.inOffice ? state.politics.currentOffice.title : 'Party Member'
        }
      };
    }
  }

  if (choice?.id === 'opt_pol_claim_victory' || choice?.id === 'opt_camp_take_oath' || choice?.id === 'opt_election_gotv_triumph') {
    // Assumes political office in game state
    const targetTitle = (chain.variables?.officeTitle as any) || 'Mayor';
    const isPresidential = targetTitle.includes('President') || targetTitle.includes('Prime Minister');
    const isMinisterial = targetTitle.includes('Minister') || targetTitle.includes('Senator') || targetTitle.includes('Parliament');
    const salary = isPresidential ? 85000 : (isMinisterial ? 45000 : (targetTitle === 'Mayor' ? 12000 : 4500));

    state.politics = {
      ...state.politics,
      currentOffice: {
        title: targetTitle,
        cityOrNation: state.world[state.currentCountryIndex]?.name || state.character.residenceCountry,
        approvalRating: 72,
        politicalCapital: 75,
        inOffice: true,
        termMonthsRemaining: 48,
        salaryMonthly: salary
      }
    };
  }

  if (choice?.id === 'opt_policy_tax_cuts') {
    state.politics = {
      ...state.politics,
      nationalPolicies: {
        ...state.politics.nationalPolicies,
        taxBracket: 'Low Enterprise'
      }
    };
    const cIdx = state.currentCountryIndex;
    if (state.world[cIdx]) {
      state.world[cIdx].corporateTaxRate = 15;
    }
  } else if (choice?.id === 'opt_policy_social_relief') {
    state.politics = {
      ...state.politics,
      nationalPolicies: {
        ...state.politics.nationalPolicies,
        taxBracket: 'High Social Support'
      }
    };
    const cIdx = state.currentCountryIndex;
    if (state.world[cIdx]) {
      state.world[cIdx].corporateTaxRate = 38;
    }
  }

  if (choice?.id === 'opt_reelect_mandate_victory') {
    state.politics = {
      ...state.politics,
      currentOffice: {
        ...state.politics.currentOffice,
        approvalRating: 75,
        politicalCapital: 80,
        termMonthsRemaining: 48
      }
    };
  } else if (choice?.id === 'opt_reelect_retire_statesman') {
    state.politics = {
      ...state.politics,
      currentOffice: {
        ...state.politics.currentOffice,
        title: 'Senior Statesman / Elder Diplomat',
        inOffice: false,
        termMonthsRemaining: 0,
        salaryMonthly: 0
      }
    };
  }

  if (!nextStageId) {
    // Chain reached terminal stage
    chain.status = 'Completed';
    state.activeEventChains = state.activeEventChains.filter(c => c.id !== chainId);
    state.completedEventChains = [...(state.completedEventChains || []), chain];
    return { nextState: state, completed: true, nextStagePrompt: 'Event chain successfully concluded.' };
  }

  // Move to next stage
  chain.currentStage = nextStageId;
  const delayMonths = stage.delayMonths || 1;
  chain.delayUntilTick = state.simulationTick + delayMonths;

  state.activeEventChains = [
    ...state.activeEventChains.slice(0, chainIndex),
    chain,
    ...state.activeEventChains.slice(chainIndex + 1)
  ];

  return {
    nextState: state,
    completed: false,
    nextStagePrompt: `Next stage scheduled in ${delayMonths} month(s).`
  };
}

/**
 * Evaluates active event chains on every monthly simulation tick.
 * Triggers due stages, generating SimulationEvents and PendingDecisions.
 */
export function processActiveEventChains(gameState: GameState): {
  nextState: GameState;
  generatedEvents: SimulationEvent[];
  generatedDecisions: PendingDecision[];
} {
  let state = { ...gameState };
  const generatedEvents: SimulationEvent[] = [];
  const generatedDecisions: PendingDecision[] = [];
  const activeChains = [...(state.activeEventChains || [])];

  for (let i = 0; i < activeChains.length; i++) {
    const chain = { ...activeChains[i] };
    if (chain.status !== 'Active') continue;

    // Check if stage is delayed and ready to trigger
    if (chain.delayUntilTick && state.simulationTick < chain.delayUntilTick) {
      continue;
    }

    const currentStageObj = chain.stages?.find(s => s.id === chain.currentStage);
    if (!currentStageObj) continue;

    // Check if this stage decision is already pending to prevent double-posting
    const decisionId = `dec_chain_${chain.id}_${currentStageObj.id}`;
    const alreadyPending = state.pendingDecisions.some(d => d.id === decisionId);
    if (alreadyPending) continue;

    // Create Stage Event
    const stageEvent: SimulationEvent = {
      id: `ev_chain_${chain.id}_${currentStageObj.id}_${state.simulationTick}`,
      category: chain.category,
      type: currentStageObj.sequence === 1 ? 'WARNING' : currentStageObj.sequence >= 3 ? 'MILESTONE' : 'DECISION',
      title: currentStageObj.title,
      description: currentStageObj.description,
      severity: 'High',
      priority: 88,
      source: chain.name,
      sourceEntityId: chain.id,
      createdMonth: state.currentMonth,
      createdYear: state.currentYear,
      timestampMonth: state.currentMonth,
      timestampYear: state.currentYear,
      age: state.character.age,
      status: 'Active',
      chainId: chain.id,
      choices: currentStageObj.choices,
      tags: ['EventChain', chain.category, chain.name, `Stage ${currentStageObj.sequence}`],
      triggerReason: `Event chain '${chain.name}' reached Stage ${currentStageObj.sequence} (${currentStageObj.title}).`
    };

    // Create Stage Decision
    const stageDecision: PendingDecision = {
      id: decisionId,
      category: chain.category === 'POLITICS' ? 'Politics' : 'Business',
      title: currentStageObj.title,
      description: currentStageObj.description,
      urgency: 'Critical',
      options: currentStageObj.choices.map(c => ({
        id: c.id,
        label: c.label,
        description: c.description,
        cost: c.cost,
        risk: c.risk || 'Medium',
        timeHorizon: c.timeHorizon || '1-3 months',
        projectedOutcome: c.projectedOutcome || '',
        handlerKey: c.handlerKey || 'OPT_CHAIN_STAGE',
        consequences: c.consequences
      }))
    };

    generatedEvents.push(stageEvent);
    generatedDecisions.push(stageDecision);
  }

  state.activeEventChains = activeChains;
  state.pendingDecisions = [...(state.pendingDecisions || []), ...generatedDecisions];

  return {
    nextState: state,
    generatedEvents,
    generatedDecisions
  };
}

/**
 * SUPPLY CHAIN CRISIS EVENT CHAIN (Improvement #8)
 * Triggered for manufacturing, technology, logistics, and retail companies during recessions or high inflation.
 */
export function createSupplyChainCrisisChain(
  companyId: string,
  companyName: string,
  startMonth: number,
  startYear: number
): EventChain {
  const chainId = `chain_supply_crisis_${companyId}_${Date.now()}`;

  const stages: EventChainStage[] = [
    {
      id: 'stage_1_disruption',
      sequence: 1,
      title: `SUPPLY CHAIN CRISIS: Global Raw Material & Logistics Bottleneck at ${companyName}`,
      description: `Macroeconomic supply friction and international logistics disruptions have halted key component shipments for ${companyName}. Operating costs risk surging 35% without decisive executive intervention.`,
      choices: [
        {
          id: 'opt_supply_emergency_domestic',
          label: 'Contract Emergency Domestic Suppliers ($120,000 Expedited Retainer)',
          description: 'Reroute procurement through regional domestic fabricators to guarantee uninterrupted production capacity.',
          cost: 120000,
          risk: 'Low',
          timeHorizon: '2 months',
          projectedOutcome: 'Maintains 100% capacity, absorbs temporary cost bump, +5 Brand Reliability.',
          handlerKey: 'OPT_CHAIN_SUPPLY_DOMESTIC',
          consequences: [
            ConsequenceEngine.companyReserve(companyId, 'SUBTRACT', 120000, { description: 'Domestic emergency procurement contract ($120k)' }),
            ConsequenceEngine.companyProductQuality(companyId, 'ADD', 6, { description: 'Higher quality domestic inputs (+6)' }),
            ConsequenceEngine.reputation('ADD', 3, { description: 'Reliable supplier fulfillment reputation' })
          ]
        },
        {
          id: 'opt_supply_vertical_acquisition',
          label: 'Execute Strategic Vertical Integration & Buy Upstream Fabricator ($450,000)',
          description: 'Acquire the domestic parts manufacturer outright, capturing upstream profits and eliminating future supplier vulnerabilities.',
          cost: 450000,
          risk: 'Low',
          timeHorizon: 'Permanent',
          projectedOutcome: 'Eliminates external supplier drag, permanently lowers unit cost, +15% Company Valuation, +6 Reputation.',
          handlerKey: 'OPT_CHAIN_SUPPLY_ACQUISITION',
          consequences: [
            ConsequenceEngine.companyReserve(companyId, 'SUBTRACT', 450000, { description: 'Acquired domestic upstream supply manufacturer ($450k)' }),
            ConsequenceEngine.companyValuation(companyId, 'PERCENTAGE_CHANGE', 15, { description: 'Vertical integration expanded enterprise valuation (+15%)' }),
            ConsequenceEngine.reputation('ADD', 6, { description: 'Decisive industrial acquisition statesmanship' })
          ]
        },
        {
          id: 'opt_supply_ration_production',
          label: 'Ration Inventory & Prioritize Premium High-Margin Products',
          description: 'Conserve capital without outside spend by focusing exclusively on luxury and high-margin product lines.',
          risk: 'Medium',
          timeHorizon: '3 months',
          projectedOutcome: 'Zero capital outlay, protects gross margins, minor temporary drop in market volume.',
          handlerKey: 'OPT_CHAIN_SUPPLY_RATION',
          consequences: [
            ConsequenceEngine.companyMorale(companyId, 'SUBTRACT', 3, { description: 'Production rationing caused temporary scheduling friction' }),
            ConsequenceEngine.stress('ADD', 4, { description: 'Supply chain management stress' })
          ]
        }
      ],
      nextStage: 'stage_2_resilience_test',
      delayMonths: 2
    },
    {
      id: 'stage_2_resilience_test',
      sequence: 2,
      title: `Supply Chain Audit at ${companyName}: 2-Month Resilience Review`,
      description: `Two months following the procurement shift, leadership reviews factory output metrics and international freight rates.`,
      choices: [
        {
          id: 'opt_supply_audit_lock_in',
          label: 'Lock In Long-Term Fixed-Price Supply Guarantees',
          description: 'Sign 3-year guaranteed cost contracts with strategic partners to insulate against future inflationary spikes.',
          risk: 'Low',
          timeHorizon: 'Permanent',
          projectedOutcome: 'Locks in predictable margins, +8 Company Brand Reputation.',
          handlerKey: 'OPT_CHAIN_SUPPLY_LOCK_IN',
          consequences: [
            ConsequenceEngine.companyBrandReputation(companyId, 'ADD', 8, { description: 'Supply chain resilience validated (+8 Brand)' }),
            ConsequenceEngine.reputation('ADD', 4, { description: 'Exemplary supply chain stewardship' })
          ]
        }
      ],
      nextStage: 'stage_3_supply_dominance',
      delayMonths: 2
    },
    {
      id: 'stage_3_supply_dominance',
      sequence: 3,
      title: `Supply Chain Resilience Milestone: ${companyName} Outperforms Competitors`,
      description: `Competitors struggling with shortages lose enterprise customers to ${companyName}, establishing your firm as the gold standard of supply resilience.`,
      choices: [
        {
          id: 'opt_supply_triumph',
          label: 'Capture Disrupted Competitor Accounts & Expand Market Share',
          description: 'Leverage supply reliability to onboard stranded enterprise clients across the continent.',
          risk: 'Low',
          timeHorizon: 'Permanent',
          projectedOutcome: '+20% Enterprise Valuation, +6% Market Share, +8 World Influence.',
          handlerKey: 'OPT_CHAIN_SUPPLY_TRIUMPH',
          consequences: [
            ConsequenceEngine.companyValuation(companyId, 'PERCENTAGE_CHANGE', 20, { description: 'Supply dominance expanded enterprise value (+20%)' }),
            ConsequenceEngine.companyMarketShare(companyId, 'ADD', 6, { description: 'Captured stranded rival clients (+6% Market Share)' }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 6, { description: 'Industrial supply chain authority recognized' }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 8, { description: 'Triumph over industry supply crisis' })
          ]
        }
      ]
    }
  ];

  return {
    id: chainId,
    name: `Supply Chain Crisis: ${companyName}`,
    category: 'BUSINESS',
    currentStage: 'stage_1_disruption',
    status: 'Active',
    startedMonth: startMonth,
    startedYear: startYear,
    variables: {
      companyId,
      companyName
    },
    history: [],
    stages
  };
}

export * from './politicalEventEngine';
