import { 
  GameState, 
  EventChain, 
  EventChainStage, 
  SimulationEventChoice, 
  SimulationEvent,
  PendingDecision,
  SimulationDiff
} from '../types';
import { ConsequenceEngine } from './consequenceEngine';
import { isEventOnCooldown } from './eventControlEngine';
import { isPowerTierAtLeast } from './powerTierEngine';

// ============================================================================
// PHASE 15: POLITICAL EVENT ENGINE & EVENT CHAINS
// ============================================================================

/**
 * 1. PARTY RECRUITMENT EVENT CHAIN
 * Triggered when a player gains prominence, wealth, or high reputation.
 * Path: RECRUITMENT -> ACCEPT / INDEPENDENT / DECLINE -> VETTING & ALIGNMENT
 */
export function createPartyRecruitmentChain(
  partyId: string,
  partyName: string,
  startMonth: number,
  startYear: number,
  state: GameState
): EventChain {
  const chainId = `chain_pol_recruit_${partyId}_${Date.now()}`;
  const countryName = state.world[state.currentCountryIndex]?.name || state.character.residenceCountry;
  const netWorth = state.finances.cash + state.companies.reduce((acc, c) => acc + (c.valuation * c.playerOwnershipPercentage) / 100, 0);

  const stages: EventChainStage[] = [
    {
      id: 'stage_recruit_approach',
      sequence: 1,
      title: `Party Recruitment: ${partyName} Seeks Your Leadership`,
      description: `A senior delegation of parliamentarians and strategists from the ${partyName} has requested a confidential meeting in ${countryName}. Citing your business track record (Net Worth: $${netWorth.toLocaleString()}) and public reputation (${state.character.attributes.reputation}/100), they invite you to enter public life under their banner.`,
      choices: [
        {
          id: 'opt_recruit_accept_standard',
          label: `Accept Official Party Membership & Endorsement`,
          description: `Formally affiliate with ${partyName}. Gain direct access to their nationwide donor network, campaign apparatus, and legislative caucus.`,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `+10 World Influence, +6 Reputation, +$50k Party Warchest Grant, Party Standing: Official Member.`,
          handlerKey: 'OPT_POL_RECRUIT_ACCEPT',
          consequences: [
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 10, { description: `Affiliated with major political party ${partyName}` }),
            ConsequenceEngine.reputation('ADD', 6, { description: `Publicly recognized as rising political star in ${partyName}` }),
            ConsequenceEngine.cash('ADD', 50000, { description: `Received inaugural party leadership campaign grant ($50,000)` }),
            ConsequenceEngine.stress('ADD', 5, { description: `Pressure of formal partisan commitments` })
          ]
        },
        {
          id: 'opt_recruit_independent_charter',
          label: `Demand Independent Reform Charter (Cross-Party Coalition)`,
          description: `Accept candidate endorsement while refusing standard partisan control. Retain voting independence on business and fiscal policy.`,
          risk: 'Medium',
          timeHorizon: 'Immediate',
          projectedOutcome: `+12 Reputation, +8 World Influence, Independent Credibility, +10 Family Respect, minor friction with party whips.`,
          handlerKey: 'OPT_POL_RECRUIT_INDEPENDENT',
          consequences: [
            ConsequenceEngine.reputation('ADD', 12, { description: `Hailed by national press as an independent civic reformer` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 8, { description: `Broad-tent independent political coalition formed` }),
            ConsequenceEngine.stress('ADD', 8, { description: `Navigating multi-faction independent politics` })
          ]
        },
        {
          id: 'opt_recruit_decline_private',
          label: `Politely Decline & Preserve Private Enterprise Focus`,
          description: `Thank the party leadership for their overture, but reaffirm your dedication to private industry, family, and investments.`,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `+3 Reputation, ends recruitment exploration, preserves complete executive focus.`,
          handlerKey: 'OPT_POL_RECRUIT_DECLINE',
          consequences: [
            ConsequenceEngine.reputation('ADD', 3, { description: `Courted by party leadership, praised for commercial dedication` }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 4, { description: `Preserved personal independence and family peace` })
          ]
        }
      ],
      nextStage: 'stage_recruit_vetting',
      delayMonths: 1
    },
    {
      id: 'stage_recruit_vetting',
      sequence: 2,
      title: `Party Executive Vetting & Policy Platform Alignment`,
      description: `Following initial agreements, the ${partyName} executive committee convenes to formalize your platform alignment and vet potential conflicts of interest across your commercial holdings.`,
      choices: [
        {
          id: 'opt_vetting_sign_manifesto',
          label: `Sign Party Platform & Pledge Strict Caucus Loyalty`,
          description: `Fully endorse the party's official legislative platform. Guarantees priority backing for future municipal and national offices.`,
          risk: 'Low',
          timeHorizon: '3 months',
          projectedOutcome: `+15 Political Capital, +10 Party Polling support, locks in party campaign machinery.`,
          handlerKey: 'OPT_POL_VETTING_SIGN',
          consequences: [
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 6, { description: `Full party institutional machinery unlocked` }),
            ConsequenceEngine.reputation('ADD', 5, { description: `Endorsed as official party standard-bearer` }),
            ConsequenceEngine.stress('ADD', 4, { description: `Caucus discipline and legislative alignment` })
          ]
        },
        {
          id: 'opt_vetting_business_first',
          label: `Push Pro-Enterprise & Capital Innovation Agenda`,
          description: `Condition your allegiance on the party adopting lower corporate taxes, tech deregulation, and infrastructure modernization.`,
          risk: 'Medium',
          timeHorizon: '3 months',
          projectedOutcome: `+10 Business Influence, +8 Reputation among business community, unlocks corporate PAC donors.`,
          handlerKey: 'OPT_POL_VETTING_BUSINESS',
          consequences: [
            ConsequenceEngine.reputation('ADD', 8, { description: `Champion of national enterprise and capital formation` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 8, { description: `Corporate-political alliance forged` }),
            ConsequenceEngine.cash('ADD', 75000, { description: `Corporate leadership PAC donations received ($75,000)` })
          ]
        }
      ]
    }
  ];

  return {
    id: chainId,
    name: `Party Recruitment: ${partyName}`,
    category: 'POLITICS',
    currentStage: 'stage_recruit_approach',
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

/**
 * 2. FULL ELECTORAL CAMPAIGN EVENT CHAIN (7-STAGE INTERACTIVE JOURNEY)
 * CAMPAIGN -> FUNDRAISING -> STRATEGY -> MEDIA -> POLLING -> DEBATE -> ELECTION -> RESULT
 */
export function createComprehensiveCampaignChain(
  officeTitle: string,
  partyId: string,
  partyName: string,
  startMonth: number,
  startYear: number,
  state: GameState
): EventChain {
  const chainId = `chain_pol_election_${officeTitle.replace(/\s+/g, '_')}_${Date.now()}`;
  const country = state.world[state.currentCountryIndex];
  const countryName = country?.name || state.character.residenceCountry;
  const isHighOffice = officeTitle.includes('President') || officeTitle.includes('Prime Minister') || officeTitle.includes('Minister');

  const stages: EventChainStage[] = [
    // STAGE 1: CAMPAIGN STRATEGY & ANNOUNCEMENT
    {
      id: 'stage_camp_strategy',
      sequence: 1,
      title: `Electoral Campaign: Strategic Launch for ${officeTitle}`,
      description: `Your campaign team and senior advisors gather at headquarters in ${countryName} to define your overarching electoral doctrine and public message for ${officeTitle}. Economic backdrop: ${country?.businessCycle || 'Expansion'} Phase (Inflation: ${country?.inflationRate.toFixed(1) || 2.5}%, GDP: +${country?.gdpGrowthRate.toFixed(1) || 2.4}%).`,
      choices: [
        {
          id: 'opt_strat_economic_growth',
          label: `The Enterprise & Prosperity Platform (Pro-Business & Jobs)`,
          description: `Focus your entire campaign on capital investment, job creation, lower corporate taxes, and industrial deregulation.`,
          risk: 'Low',
          timeHorizon: '1 month',
          projectedOutcome: `+12 Polling among entrepreneurs and investors, +8 Reputation, unlocks major corporate donors.`,
          handlerKey: 'OPT_CAMP_STRAT_ECON',
          consequences: [
            ConsequenceEngine.reputation('ADD', 6, { description: `Launched Pro-Enterprise Growth Campaign for ${officeTitle}` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 5, { description: `Business coalition rallied behind campaign` }),
            ConsequenceEngine.stress('ADD', 5, { description: `Campaign launch demands` })
          ]
        },
        {
          id: 'opt_strat_populist_reform',
          label: `The Anti-Corruption & Public Integrity Crusade`,
          description: `Position yourself as a fearless outsider ready to purge legislative waste, curb lobbyist influence, and protect working families.`,
          risk: 'Medium',
          timeHorizon: '1 month',
          projectedOutcome: `+16 Grassroots Polling, +10 Reputation, sparks intense media coverage and rival opposition attacks.`,
          handlerKey: 'OPT_CAMP_STRAT_POPULIST',
          consequences: [
            ConsequenceEngine.reputation('ADD', 10, { description: `Galvanized populist reform movement across working districts` }),
            ConsequenceEngine.playerAttribute('charm', 'ADD', 3, { description: `Dynamic rally speeches` }),
            ConsequenceEngine.stress('ADD', 8, { description: `Intense political adversary hostility` })
          ]
        },
        {
          id: 'opt_strat_technocratic',
          label: `The Technocratic Modernizer (Infrastructure & AI Future)`,
          description: `Campaign on smart cities, clean energy grid modernization, public healthcare digitization, and STEM education.`,
          risk: 'Low',
          timeHorizon: '1 month',
          projectedOutcome: `+10 Approval among educated urban voters, +6 Intelligence, solid centrist appeal.`,
          handlerKey: 'OPT_CAMP_STRAT_TECH',
          consequences: [
            ConsequenceEngine.reputation('ADD', 7, { description: `Hailed for visionary infrastructure modernization platform` }),
            ConsequenceEngine.playerAttribute('intelligence', 'ADD', 3, { description: `Mastery of complex policy whitepapers` }),
            ConsequenceEngine.stress('ADD', 4, { description: `Detailed policy briefing sessions` })
          ]
        }
      ],
      nextStage: 'stage_camp_fundraising',
      delayMonths: 1
    },

    // STAGE 2: FUNDRAISING & WAR CHEST
    {
      id: 'stage_camp_fundraising',
      sequence: 2,
      title: `Campaign War Chest: National Fundraising Blitz`,
      description: `To purchase television ad blocks, charter campaign aircraft, hire data scientists, and staff regional field offices for ${officeTitle}, your campaign must assemble a decisive war chest.`,
      choices: [
        {
          id: 'opt_fund_self_anchor',
          label: `Self-Fund ${isHighOffice ? '$500,000' : '$100,000'} Anchor Contribution (Message Purity)`,
          description: `Provide large-scale personal equity to maintain absolute financial independence and reject lobbyist entanglements.`,
          cost: isHighOffice ? 500000 : 100000,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `Consumes cash, shields campaign from influence attacks, guarantees maximum ad blitz (+15 Polling).`,
          handlerKey: 'OPT_CAMP_FUND_SELF',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', isHighOffice ? 500000 : 100000, { description: `Injected personal fortune into campaign war chest` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 8, { description: `Self-funded campaign ad dominance` }),
            ConsequenceEngine.reputation('ADD', 6, { description: `Praised for uncompromised campaign independence` })
          ]
        },
        {
          id: 'opt_fund_pac_donors',
          label: `Host High-Dollar Sovereign & Corporate PAC Gala`,
          description: `Gather multinational CEOs, real estate magnates, and institutional trade unions for a closed-door donor dinner.`,
          cost: 25000,
          risk: 'Medium',
          timeHorizon: '1 month',
          projectedOutcome: `Raises $${isHighOffice ? '1,500,000' : '350,000'} in PAC funds, but invites investigative media questions.`,
          handlerKey: 'OPT_CAMP_FUND_PAC',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 25000, { description: `Host venue and logistics for high-dollar fundraising gala` }),
            ConsequenceEngine.reputation('ADD', 4, { description: `Assembled premier national donor syndicate` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 10, { description: `Massive PAC war chest assembled` }),
            ConsequenceEngine.stress('ADD', 6, { description: `Managing competing donor expectations` })
          ]
        },
        {
          id: 'opt_fund_grassroots_crowd',
          label: `Small-Dollar Digital Crowdfunding & Campus Rallies`,
          description: `Rely entirely on tens of thousands of $25 digital donations from passionate grassroots supporters.`,
          risk: 'Medium',
          timeHorizon: '2 months',
          projectedOutcome: `+12 Grassroots Enthusiasm, +8 Reputation, zero corporate debts, lower immediate funds.`,
          handlerKey: 'OPT_CAMP_FUND_GRASSROOTS',
          consequences: [
            ConsequenceEngine.reputation('ADD', 8, { description: `Overwhelming citizen small-dollar grassroots surge` }),
            ConsequenceEngine.playerAttribute('charm', 'ADD', 3, { description: `Connecting with everyday citizens` }),
            ConsequenceEngine.stress('ADD', 6, { description: `High-tempo travel schedule for town hall rallies` })
          ]
        }
      ],
      nextStage: 'stage_camp_media',
      delayMonths: 1
    },

    // STAGE 3: MEDIA & PRESS SCRUTINY
    {
      id: 'stage_camp_media',
      sequence: 3,
      title: `Media Spotlight: Prime-Time Investigative Inquest`,
      description: `National news networks and Sunday political talk shows have invited you for a live, unscripted 60-minute interview. The anchor probes into your wealth, corporate holdings, family life, and past policy judgments.`,
      choices: [
        {
          id: 'opt_media_transparent_mastery',
          label: `Demonstrate Total Financial Transparency & Policy Precision`,
          description: `Publish audited tax returns, articulate detailed solutions for working-class inflation, and project calm statesman composure.`,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `+12 Reputation, +10 Public Trust, eliminates conflict-of-interest vulnerability.`,
          handlerKey: 'OPT_CAMP_MEDIA_TRANSPARENT',
          consequences: [
            ConsequenceEngine.reputation('ADD', 10, { description: `Celebrated prime-time interview performance hailed by commentators` }),
            ConsequenceEngine.playerAttribute('intelligence', 'ADD', 2, { description: `Masterful handling of complex fiscal questions` }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 4, { description: `Family proud of dignified interview composure` })
          ]
        },
        {
          id: 'opt_media_aggressive_offensive',
          label: `Turn the Tables: Expose Rival Party Scandals & Media Bias`,
          description: `Aggressively confront the media establishment, citing rival candidate conflicts and broken promises to citizens.`,
          risk: 'High',
          timeHorizon: 'Immediate',
          projectedOutcome: `Electrifies partisan base (+20 Base Turnout), but alienates undecided moderates.`,
          handlerKey: 'OPT_CAMP_MEDIA_OFFENSIVE',
          consequences: [
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 6, { description: `Aggressive political counter-offensive dominated headlines` }),
            ConsequenceEngine.stress('ADD', 8, { description: `Intense media retaliation and editorial scrutiny` })
          ]
        }
      ],
      nextStage: 'stage_camp_polling',
      delayMonths: 1
    },

    // STAGE 4: POLLING & DISTRICT GROUND GAME
    {
      id: 'stage_camp_polling',
      sequence: 4,
      title: `Battleground Polling & District Mobilization`,
      description: `Internal tracking polls show a razor-thin 2.4% margin across critical suburban districts and industrial hubs. Your campaign manager presents final tactical options before the national debate.`,
      choices: [
        {
          id: 'opt_poll_swing_tour',
          label: `Launch 72-Hour Non-Stop Swing District Bus Tour`,
          description: `Visit factory floors, universities, family diners, and agricultural cooperatives with your spouse and team.`,
          cost: 35000,
          risk: 'Medium',
          timeHorizon: '1 month',
          projectedOutcome: `+8 Polling Lead in critical swing counties, +6 Family Loyalty, high physical exhaustion.`,
          handlerKey: 'OPT_CAMP_POLL_TOUR',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 35000, { description: `Rapid response swing district tour logistics` }),
            ConsequenceEngine.reputation('ADD', 7, { description: `Personal touch won over undecided swing voters` }),
            ConsequenceEngine.playerAttribute('charm', 'ADD', 4, { description: `Direct retail politicking charisma` }),
            ConsequenceEngine.stress('ADD', 7, { description: `Extreme tour fatigue` })
          ]
        },
        {
          id: 'opt_poll_targeted_digital',
          label: `Deploy AI-Optimized Micro-Targeted Ad Blitz`,
          description: `Flood social media, podcasts, and streaming platforms with surgical video messages tailored to swing demographics.`,
          cost: 60000,
          risk: 'Low',
          timeHorizon: '1 month',
          projectedOutcome: `+10 Digital Voter Engagement, saves physical energy, consumes $60k ad budget.`,
          handlerKey: 'OPT_CAMP_POLL_DIGITAL',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 60000, { description: `AI-driven digital ad blitz across battleground demographics` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 7, { description: `Unprecedented digital voter mobilization footprint` })
          ]
        }
      ],
      nextStage: 'stage_camp_debate',
      delayMonths: 1
    },

    // STAGE 5: THE GREAT TELEVISED DEBATE
    {
      id: 'stage_camp_debate',
      sequence: 5,
      title: `The Grand National Debate for ${officeTitle}`,
      description: `Over 15 million citizens are watching live as you take the stage across from the opposition candidate. The moderators ask a pivotal question on national economic leadership, taxes, and integrity.`,
      choices: [
        {
          id: 'opt_debate_statesman',
          label: `Deliver Masterful Statesman Blueprint (Unity & Prosperity)`,
          description: `Bridge political divisions with a calm, rigorous, and inspiring vision for economic growth, health security, and civic pride.`,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `Unanimous editorial victory (+18 Polling Mandate), +12 Reputation, +10 World Influence.`,
          handlerKey: 'OPT_CAMP_DEBATE_STATESMAN',
          consequences: [
            ConsequenceEngine.reputation('ADD', 12, { description: `Hailed as undisputed debate winner by all national editorial boards` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 10, { description: `Commanding statesman stature acknowledged internationally` }),
            ConsequenceEngine.playerAttribute('intelligence', 'ADD', 3, { description: `Flawless debate preparation and execution` }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 8, { description: `Exhilarating post-debate momentum` })
          ]
        },
        {
          id: 'opt_debate_knockout_blow',
          label: `Deliver Decisive Knockout Blow on Rival's Ethics & Record`,
          description: `Present verified evidence of your opponent's broken promises and backroom lobbyist ties live on national television.`,
          risk: 'Medium',
          timeHorizon: 'Immediate',
          projectedOutcome: `Crushes rival's credibility, viral debate highlight reels, secures decisive polling lead.`,
          handlerKey: 'OPT_CAMP_DEBATE_KNOCKOUT',
          consequences: [
            ConsequenceEngine.reputation('ADD', 9, { description: `Devastating debate counter-attack dismantled opponent campaign` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 8, { description: `Decisive political victory secured on live broadcast` }),
            ConsequenceEngine.stress('ADD', 5, { description: `High-stakes confrontation tension` })
          ]
        }
      ],
      nextStage: 'stage_camp_election_day',
      delayMonths: 1
    },

    // STAGE 6: ELECTION DAY & BALLOT COUNT
    {
      id: 'stage_camp_election_day',
      sequence: 6,
      title: `Election Day: The Decision of the Electorate`,
      description: `Polling stations have closed across ${countryName}. Exit polls and precinct returns stream into campaign headquarters as electoral commissioners tabulate millions of ballots.`,
      choices: [
        {
          id: 'opt_election_gotv_triumph',
          label: `Mobilize Legal Observers & Final Get-Out-The-Vote Drive`,
          description: `Ensure every valid ballot is counted and deliver victory remarks as precinct majorities cross the required threshold.`,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `Secures certified electoral victory! Unlocks Inauguration and assuming ${officeTitle}.`,
          handlerKey: 'OPT_CAMP_ELECTION_VICTORY',
          consequences: [
            ConsequenceEngine.reputation('ADD', 15, { description: `Elected as ${officeTitle} in historic electoral landslide` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 25, { description: `Democratic mandate established across ${countryName}` }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 25, { description: `Historic triumph on election night` }),
            ConsequenceEngine.stress('SUBTRACT', 15, { description: `Exhausting campaign concludes in triumph` })
          ]
        }
      ],
      nextStage: 'stage_camp_result',
      delayMonths: 1
    },

    // STAGE 7: RESULT & INAUGURATION
    {
      id: 'stage_camp_result',
      sequence: 7,
      title: `Inauguration Day: Sworn in as ${officeTitle}! 🏛️`,
      description: `Before parliament, judiciary, and thousands of gathered citizens in ${countryName}, you take the constitutional oath of office. You now hold statutory executive authority as ${officeTitle}.`,
      choices: [
        {
          id: 'opt_camp_take_oath',
          label: `Take the Constitutional Oath of Office & Issue First Executive Directive`,
          description: `Form your cabinet, outline priority economic reforms, and begin official governance.`,
          risk: 'Low',
          timeHorizon: 'Permanent',
          projectedOutcome: `Inaugurated into office, +30 World Influence, 72% Starting Public Approval, $${isHighOffice ? '85,000' : '12,000'}/mo salary.`,
          handlerKey: 'OPT_CAMP_TAKE_OATH',
          consequences: [
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 20, { description: `Inaugurated as official ${officeTitle}` }),
            ConsequenceEngine.reputation('ADD', 10, { description: `Universal congratulations from world leaders and industry chiefs` }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 15, { description: `Sworn in to public office with broad mandate` })
          ]
        }
      ]
    }
  ];

  return {
    id: chainId,
    name: `Electoral Campaign: ${officeTitle}`,
    category: 'POLITICS',
    currentStage: 'stage_camp_strategy',
    status: 'Active',
    startedMonth: startMonth,
    startedYear: startYear,
    variables: {
      partyId,
      partyName,
      officeTitle,
      pollingLead: 6,
      fundsRaised: 0
    },
    history: [],
    stages
  };
}

/**
 * 3. POLITICAL OFFICE GOVERNANCE: POLICY DECISIONS & ECONOMIC REFORM CHAIN
 * Triggered when holding office during economic turbulence (Inflation / Recession) or landmark mandate.
 */
export function createPolicyCrisisChain(
  officeTitle: string,
  countryName: string,
  startMonth: number,
  startYear: number,
  state: GameState
): EventChain {
  const chainId = `chain_pol_policy_${Date.now()}`;
  const country = state.world[state.currentCountryIndex];

  const stages: EventChainStage[] = [
    {
      id: 'stage_policy_emergency',
      sequence: 1,
      title: `Executive Governance: National Economic Policy Crisis`,
      description: `As ${officeTitle}, parliamentary leaders and treasury secretaries present urgent economic data. National inflation is tracking at ${country?.inflationRate.toFixed(1) || 3.2}% with unemployment at ${country?.unemploymentRate.toFixed(1) || 5.0}%. Citizens and business leaders demand decisive executive decree.`,
      choices: [
        {
          id: 'opt_policy_enterprise_stimulus',
          label: `Enact Landmark Corporate Tax Cuts & Capital Investment Credits`,
          description: `Lower national corporate tax bracket to 15% (Low Enterprise). Stimulates private sector GDP, company hiring, and market valuation.`,
          risk: 'Medium',
          timeHorizon: '3 months',
          projectedOutcome: `Boosts company profitability (+18% EBITDA), +12 Business Reputation, -5 Opposition Approval.`,
          handlerKey: 'OPT_POLICY_TAX_CUTS',
          consequences: [
            ConsequenceEngine.reputation('ADD', 8, { description: `Praised by business leaders for historic pro-growth tax reform` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 10, { description: `National economic growth surge sparked` }),
            ConsequenceEngine.stress('ADD', 5, { description: `Legislative debate tension` })
          ]
        },
        {
          id: 'opt_policy_social_safety',
          label: `Expand Healthcare, Public Works, & Working Family Relief`,
          description: `Fund universal medical subsidies and civic transit infrastructure via balanced corporate tax rates (38% High Social Support).`,
          risk: 'Low',
          timeHorizon: '3 months',
          projectedOutcome: `+15 Public Approval Rating, +10 Health index across nation, slight drag on corporate margins.`,
          handlerKey: 'OPT_POLICY_SOCIAL_RELIEF',
          consequences: [
            ConsequenceEngine.reputation('ADD', 10, { description: `Hailed by working families for expanding healthcare and public safety` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 8, { description: `Champion of progressive social stability` }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 6, { description: `Popular acclaim across working districts` })
          ]
        },
        {
          id: 'opt_policy_fiscal_austerity',
          label: `Enforce Strict Fiscal Discipline & Debt Reduction Mandate`,
          description: `Slash government administrative waste, balance the national budget, and eliminate sovereign deficit spending.`,
          risk: 'Medium',
          timeHorizon: '6 months',
          projectedOutcome: `Curbs inflation, restores international sovereign credit rating, short-term spending freeze.`,
          handlerKey: 'OPT_POLICY_AUSTERITY',
          consequences: [
            ConsequenceEngine.reputation('ADD', 7, { description: `Praised by international monetary bodies for fiscal rectitude` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 8, { description: `Sovereign financial credibility restored` })
          ]
        }
      ],
      nextStage: 'stage_policy_impact',
      delayMonths: 2
    },
    {
      id: 'stage_policy_impact',
      sequence: 2,
      title: `Policy Execution Review: Economic & Constituent Repercussions`,
      description: `Two months following your executive policy decree, central statistical agencies publish comprehensive quarterly results. The electorate and business markets respond to your leadership.`,
      choices: [
        {
          id: 'opt_policy_solidify_mandate',
          label: `Consolidate Legislative Victory & Address National Press Club`,
          description: `Deliver a major televised address detailing economic metrics and future legislative priorities.`,
          risk: 'Low',
          timeHorizon: 'Permanent',
          projectedOutcome: `+15 Political Capital, +8 Public Approval, locks in structural economic momentum.`,
          handlerKey: 'OPT_POLICY_MANDATE_SUCCESS',
          consequences: [
            ConsequenceEngine.reputation('ADD', 8, { description: `Proven executive statesmanship recognized nationally` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 8, { description: `Decisive policy leadership certified` }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 8, { description: `Triumph of national economic stewardship` })
          ]
        }
      ]
    }
  ];

  return {
    id: chainId,
    name: `Executive Policy Reform: ${officeTitle}`,
    category: 'POLITICS',
    currentStage: 'stage_policy_emergency',
    status: 'Active',
    startedMonth: startMonth,
    startedYear: startYear,
    variables: {
      officeTitle,
      countryName
    },
    history: [],
    stages
  };
}

/**
 * 4. POLITICAL OFFICE: LOBBYING & SPECIAL INTERESTS CHAIN
 * Triggered when holding office with high political capital or business ownership.
 */
export function createPoliticalLobbyingChain(
  officeTitle: string,
  startMonth: number,
  startYear: number,
  state: GameState
): EventChain {
  const chainId = `chain_pol_lobby_${Date.now()}`;
  const hasCompanies = state.companies.length > 0;
  const leadCompanyName = hasCompanies ? state.companies[0].name : 'Your Enterprise Holdings';

  const stages: EventChainStage[] = [
    {
      id: 'stage_lobby_overture',
      sequence: 1,
      title: `Special Interest Lobbying: $1.2M PAC Contribution Proposal`,
      description: `A powerful coalition of industrial conglomerates and energy lobbyists requests a private meeting in the executive chamber. They offer a guaranteed $1,200,000 contribution to your political action committee (PAC) in exchange for securing preferential infrastructure procurement clauses and regulatory exemptions.`,
      choices: [
        {
          id: 'opt_lobby_reject_ethics',
          label: `Firmly Reject Overture & Refer to Independent Ethics Committee`,
          description: `Uphold strict public trust, refuse backroom deals, and champion competitive bidding on all public contracts.`,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `+15 Reputation, +10 Public Approval, +8 Family Trust, zero ethical risk, forfeits $1.2M PAC funds.`,
          handlerKey: 'OPT_LOBBY_REJECT',
          consequences: [
            ConsequenceEngine.reputation('ADD', 15, { description: `Acclaimed national integrity for exposing and rejecting lobbyist backroom deal` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 8, { description: `Anti-corruption champion stature` }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 6, { description: `Family pride in uncompromised moral leadership` })
          ]
        },
        {
          id: 'opt_lobby_negotiate_compromise',
          label: `Negotiate Transparent Public-Private Partnership (Clean Terms)`,
          description: `Direct the lobbyist capital into transparent civic green bonds and university research grants with full public disclosure.`,
          risk: 'Medium',
          timeHorizon: '2 months',
          projectedOutcome: `+$500,000 legitimate civic campaign support, +8 World Influence, +6 Reputation.`,
          handlerKey: 'OPT_LOBBY_COMPROMISE',
          consequences: [
            ConsequenceEngine.cash('ADD', 500000, { description: `Secured legitimate civic infrastructure partnership fund ($500,000)` }),
            ConsequenceEngine.reputation('ADD', 8, { description: `Masterful pragmatic public-private infrastructure alliance` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 10, { description: `Major industrial partnership established` })
          ]
        },
        {
          id: 'opt_lobby_accept_pac',
          label: `Quietly Accept $1.2M Super-PAC Backing & Assist Industry`,
          description: `Accept the immense campaign war chest to ensure unbeatable re-election funding, granting standard regulatory relief.`,
          risk: 'High',
          timeHorizon: 'Immediate',
          projectedOutcome: `+$1,200,000 PAC funds, risk of future investigative journalism leaks and scandal.`,
          handlerKey: 'OPT_LOBBY_ACCEPT',
          consequences: [
            ConsequenceEngine.cash('ADD', 1200000, { description: `Received $1,200,000 institutional campaign Super-PAC war chest` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 12, { description: `Backed by commanding corporate lobby syndicate` }),
            ConsequenceEngine.stress('ADD', 10, { description: `Underlying anxiety of potential regulatory leaks` })
          ]
        }
      ],
      nextStage: 'stage_lobby_outcome',
      delayMonths: 2
    },
    {
      id: 'stage_lobby_outcome',
      sequence: 2,
      title: `Legislative Integrity & Procurement Milestone`,
      description: `The parliamentary session concludes. Your actions regarding the lobbying overture have solidified your reputation among civil society, corporate lobbies, and constituent voters.`,
      choices: [
        {
          id: 'opt_lobby_final_certify',
          label: `Certify Fair Procurement Mandate & Proceed with Agenda`,
          description: `Maintain steady hand on executive policy and prepare for upcoming legislative reviews.`,
          risk: 'Low',
          timeHorizon: 'Permanent',
          projectedOutcome: `Stabilizes political capital and strengthens governing stature.`,
          handlerKey: 'OPT_LOBBY_CERTIFY',
          consequences: [
            ConsequenceEngine.reputation('ADD', 5, { description: `Governance integrity certified by state auditors` })
          ]
        }
      ]
    }
  ];

  return {
    id: chainId,
    name: `Special Interests & Lobbying: ${officeTitle}`,
    category: 'POLITICS',
    currentStage: 'stage_lobby_overture',
    status: 'Active',
    startedMonth: startMonth,
    startedYear: startYear,
    variables: {
      officeTitle,
      leadCompanyName
    },
    history: [],
    stages
  };
}

/**
 * 5. POLITICAL OFFICE: SCANDAL & OPPOSITION INVESTIGATION CHAIN
 * Triggered when holding office and facing media scrutiny or conflict of interest.
 */
export function createPoliticalScandalChain(
  officeTitle: string,
  scandalTopic: string,
  startMonth: number,
  startYear: number,
  state: GameState
): EventChain {
  const chainId = `chain_pol_scandal_${Date.now()}`;
  const spouse = state.relationships.find(r => r.relation.toLowerCase() === 'spouse' || r.relation.toLowerCase() === 'partner');

  const stages: EventChainStage[] = [
    {
      id: 'stage_scandal_leak',
      sequence: 1,
      title: `Investigative Leak & Opposition Inquiry: ${officeTitle}`,
      description: `A national investigative journalism consortium and parliamentary opposition leaders have published a front-page inquiry regarding ${scandalTopic}. News cameras surround the executive mansion demanding an immediate response. Public approval is fluctuating.`,
      choices: [
        {
          id: 'opt_scandal_full_transparency',
          label: `Hold Live Prime-Time Press Conference & Release Full Records`,
          description: `Place all financial records and emails in a public repository, answer every hostile question, and divest contested holdings into a blind trust.`,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `Neutralizes scandal, +10 Integrity Reputation, +15 Public Approval rebound, protects family dignity.`,
          handlerKey: 'OPT_SCANDAL_TRANSPARENCY',
          consequences: [
            ConsequenceEngine.reputation('ADD', 8, { description: `Restored public faith through radical transparency and disclosure` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 5, { description: `Overcame intense opposition smear campaign` }),
            ConsequenceEngine.stress('SUBTRACT', 6, { description: `Truth delivered openly, relieving scrutiny anxiety` })
          ]
        },
        {
          id: 'opt_scandal_legal_counterattack',
          label: `Deploy Top Constitutional Litigators & File Defamation Lawsuit`,
          description: `Retain elite legal counsel to challenge opposition leaks, issue cease-and-desist warnings, and subpoena corrupt sources.`,
          cost: 150000,
          risk: 'Medium',
          timeHorizon: '2 months',
          projectedOutcome: `Consumes $150k legal costs, intimidates opposition, but keeps story in the news cycle.`,
          handlerKey: 'OPT_SCANDAL_LEGAL',
          consequences: [
            ConsequenceEngine.cash('SUBTRACT', 150000, { description: `Elite constitutional litigation and defense retainers ($150,000)` }),
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 8, { description: `Fierce legal pushback paralyzed opposition committee` }),
            ConsequenceEngine.stress('ADD', 8, { description: `Protracted courtroom battle stress` })
          ]
        },
        {
          id: 'opt_scandal_partisan_rally',
          label: `Rally Partisan Base & Accuse Opponents of Political Witch Hunt`,
          description: `Host a massive televised rally to denounce the inquiry as a partisan smear engineered by unelected bureaucrats.`,
          risk: 'High',
          timeHorizon: 'Immediate',
          projectedOutcome: `Solidifies loyal partisan base (+20 Base Morale), but alienates independent swing voters.`,
          handlerKey: 'OPT_SCANDAL_PARTISAN',
          consequences: [
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 6, { description: `Partisan base rallied behind administration` }),
            ConsequenceEngine.reputation('SUBTRACT', 5, { description: `Polarizing partisan counter-attack optics` }),
            ConsequenceEngine.stress('ADD', 10, { description: `Severe public polarization pressure` })
          ]
        }
      ],
      nextStage: 'stage_scandal_resolution',
      delayMonths: 2
    },
    {
      id: 'stage_scandal_resolution',
      sequence: 2,
      title: `Independent Ethics Committee Findings & Final Exoneration`,
      description: `The official parliamentary ethics committee concludes its inquiry into ${scandalTopic}. With your strategic response executed, the committee issues its final binding report.`,
      choices: [
        {
          id: 'opt_scandal_claim_exoneration',
          label: `Accept Full Exoneration & Pivot to Future Governance`,
          description: `Deliver concluding remarks, put the controversy behind the administration, and refocus on civic progress.`,
          risk: 'Low',
          timeHorizon: 'Permanent',
          projectedOutcome: `Restores public approval, +10 Reputation, lifts executive stress.`,
          handlerKey: 'OPT_SCANDAL_EXONERATION',
          consequences: [
            ConsequenceEngine.reputation('ADD', 10, { description: `Officially cleared and exonerated of all ethics allegations` }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 10, { description: `Vindication and relief for character and family` }),
            ConsequenceEngine.stress('SUBTRACT', 12, { description: `Controversy completely resolved` })
          ]
        }
      ]
    }
  ];

  return {
    id: chainId,
    name: `Political Inquiry & Defense: ${officeTitle}`,
    category: 'POLITICS',
    currentStage: 'stage_scandal_leak',
    status: 'Active',
    startedMonth: startMonth,
    startedYear: startYear,
    variables: {
      officeTitle,
      scandalTopic
    },
    history: [],
    stages
  };
}

/**
 * 6. POLITICAL OFFICE: INCUMBENT RE-ELECTION CAMPAIGN CHAIN
 * Triggered when termMonthsRemaining <= 6 while holding office.
 */
export function createReElectionCampaignChain(
  officeTitle: string,
  startMonth: number,
  startYear: number,
  state: GameState
): EventChain {
  const chainId = `chain_pol_reelection_${Date.now()}`;
  const approval = state.politics.currentOffice.approvalRating;
  const party = state.politics.parties.find(p => p.id === state.politics.selectedPartyId);
  const partyName = party ? party.name : 'Independent Coalition';

  const stages: EventChainStage[] = [
    {
      id: 'stage_reelect_decision',
      sequence: 1,
      title: `Mandate Renewal: Incumbent Re-Election for ${officeTitle}`,
      description: `Your term as ${officeTitle} is entering its final 6 months. Public approval stands at ${approval}%. Senior advisors and ${partyName} delegates urge you to announce whether you will seek a second governing term or retire with honor.`,
      choices: [
        {
          id: 'opt_reelect_run_incumbent',
          label: `Run for Re-Election on Your Historic Governing Record`,
          description: `Launch an energetic incumbent campaign highlighting economic growth, legislative accomplishments, and civic stability.`,
          risk: 'Medium',
          timeHorizon: '6 months',
          projectedOutcome: `Enters full re-election cycle, +15 World Influence, defends office mandate.`,
          handlerKey: 'OPT_REELECT_RUN',
          consequences: [
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 15, { description: `Launched Incumbent Re-Election Campaign for ${officeTitle}` }),
            ConsequenceEngine.reputation('ADD', 8, { description: `Champion of continuing national stability and progress` }),
            ConsequenceEngine.stress('ADD', 8, { description: `Campaign rigor combined with active governance duties` })
          ]
        },
        {
          id: 'opt_reelect_retire_statesman',
          label: `Retire with Honor as Senior Elder Statesman`,
          description: `Decline re-election. Complete your term with high dignity and transition into global philanthropy, advisory boards, and private enterprise.`,
          risk: 'Low',
          timeHorizon: 'Immediate',
          projectedOutcome: `+20 Universal Respect & Reputation, +15 Happiness, ends term peacefully, enters private wealth.`,
          handlerKey: 'OPT_REELECT_RETIRE',
          consequences: [
            ConsequenceEngine.reputation('ADD', 20, { description: `Retired with universal acclaim as senior statesman` }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 18, { description: `Peaceful conclusion of public service service term` }),
            ConsequenceEngine.stress('SUBTRACT', 20, { description: `Heavy executive burdens lifted` })
          ]
        }
      ],
      nextStage: 'stage_reelect_ballot',
      delayMonths: 3
    },
    {
      id: 'stage_reelect_ballot',
      sequence: 2,
      title: `Re-Election Verdict: The Electorate Votes`,
      description: `The general election polls close across the country. Citizens render their definitive verdict on your governing stewardship.`,
      choices: [
        {
          id: 'opt_reelect_mandate_victory',
          label: `Claim Decisive Second-Term Mandate & Swear Oath of Office`,
          description: `Deliver victory address, renew 48-month term mandate with elevated political capital.`,
          risk: 'Low',
          timeHorizon: 'Permanent',
          projectedOutcome: `Re-elected to second term! 48-month term renewed, +25 World Influence, +15 Reputation, 75% Approval.`,
          handlerKey: 'OPT_REELECT_VICTORY',
          consequences: [
            ConsequenceEngine.playerAttribute('worldInfluence', 'ADD', 25, { description: `Re-elected as ${officeTitle} with historic majority` }),
            ConsequenceEngine.reputation('ADD', 15, { description: `Confirmed by the electorate for a second executive term` }),
            ConsequenceEngine.playerAttribute('happiness', 'ADD', 20, { description: `Triumph on re-election night` })
          ]
        }
      ]
    }
  ];

  return {
    id: chainId,
    name: `Incumbent Re-Election: ${officeTitle}`,
    category: 'POLITICS',
    currentStage: 'stage_reelect_decision',
    status: 'Active',
    startedMonth: startMonth,
    startedYear: startYear,
    variables: {
      officeTitle,
      approval
    },
    history: [],
    stages
  };
}

// ============================================================================
// EVALUATOR: MONTHLY POLITICAL EVENT TRIGGER LOGIC
// ============================================================================

/**
 * Evaluates whether political conditions justify triggering event chains or political causal events.
 * Depends on: approval, influence, reputation, wealth, media visibility, party support, economic conditions, past decisions.
 */
export function evaluatePoliticalTriggers(
  prevState: GameState,
  currentState: GameState,
  diff: SimulationDiff
): {
  generatedEvents: SimulationEvent[];
  unlockedChains: EventChain[];
} {
  const generatedEvents: SimulationEvent[] = [];
  const unlockedChains: EventChain[] = [];

  const currentMonth = currentState.currentMonth;
  const currentYear = currentState.currentYear;
  const tick = currentState.simulationTick;
  const age = currentState.character.age;
  const currOffice = currentState.politics.currentOffice;
  const rep = currentState.character.attributes.reputation;
  const influence = currentState.character.attributes.worldInfluence;
  const wealth = currentState.finances.cash + currentState.companies.reduce((acc, c) => acc + (c.valuation * c.playerOwnershipPercentage) / 100, 0);
  const country = currentState.world[currentState.currentCountryIndex];
  const power = currentState.playerPowerProfile;

  // 1. TRIGGER: PARTY RECRUITMENT (When player reaches high reputation >= 35, or net worth >= $300k, or PROMINENT tier, and not currently holding office)
  const isCitizenOrPartyMember = !currOffice.inOffice;
  const hasNoActiveRecruitChain = !(currentState.activeEventChains || []).some(c => c.id.includes('pol_recruit') || c.id.includes('pol_election'));

  if (isCitizenOrPartyMember && hasNoActiveRecruitChain && (rep >= 40 || wealth >= 350000 || isPowerTierAtLeast(power?.powerTier || 'UNKNOWN', 'PROMINENT'))) {
    if (!isEventOnCooldown(currentState, 'POLITICS_PARTY_RECRUITMENT', 'global')) {
      const topParty = currentState.politics.parties[0] || { id: 'party_centrist', name: 'National Progress Alliance' };
      const recruitChain = createPartyRecruitmentChain(topParty.id, topParty.name, currentMonth, currentYear, currentState);
      unlockedChains.push(recruitChain);

      generatedEvents.push({
        id: `ev_pol_recruit_invitation_${tick}`,
        category: 'POLITICS',
        type: 'OPPORTUNITY',
        title: `Political Delegation Approach: Party Recruitment from ${topParty.name}`,
        description: `Your expanding commercial reach ($${wealth.toLocaleString()}) and public standing (${rep}/100) have attracted the attention of party strategists. They have initiated a recruitment campaign.`,
        severity: 'Medium',
        priority: 78,
        source: topParty.name,
        createdMonth: currentMonth,
        createdYear: currentYear,
        timestampMonth: currentMonth,
        timestampYear: currentYear,
        age,
        status: 'Active',
        tags: ['Politics', 'Recruitment', topParty.name],
        triggerReason: `High reputation (${rep}/100) and net worth ($${wealth.toLocaleString()}) triggered party recruitment delegation.`,
        consequences: {
          worldInfluenceChange: +4,
          details: [`Invited to join ${topParty.name} leadership caucus`]
        }
      });
    }
  }

  // 2. TRIGGER: HOLDING OFFICE DYNAMICS
  if (currOffice.inOffice) {
    const hasActiveOfficeChain = (currentState.activeEventChains || []).some(c => c.id.includes('pol_policy') || c.id.includes('pol_lobby') || c.id.includes('pol_scandal') || c.id.includes('pol_reelection'));

    // 2A. POLICY CRISIS CHAIN TRIGGER (Recession, high inflation > 4.5%, or low approval < 45)
    if (!hasActiveOfficeChain && (country?.businessCycle === 'Recession' || (country?.inflationRate || 0) >= 4.5 || currOffice.approvalRating < 45)) {
      if (!isEventOnCooldown(currentState, 'POLITICS_POLICY_CRISIS', currOffice.title)) {
        const policyChain = createPolicyCrisisChain(currOffice.title, country?.name || 'Nation', currentMonth, currentYear, currentState);
        unlockedChains.push(policyChain);

        generatedEvents.push({
          id: `ev_pol_policy_crisis_${tick}`,
          category: 'POLITICS',
          type: 'WARNING',
          title: `Executive Governance Alert: Macroeconomic Turbulence & Policy Mandate`,
          description: `Economic instability (${country?.businessCycle || 'Recession'} / ${country?.inflationRate.toFixed(1)}% Inflation) demands executive policy intervention from the ${currOffice.title} administration.`,
          severity: 'High',
          priority: 85,
          source: `${currOffice.title} Administration`,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Politics', 'Policy', 'Governance', currOffice.title],
          triggerReason: `National economy in ${country?.businessCycle} with ${country?.inflationRate.toFixed(1)}% inflation triggered policy decree requirement.`,
          consequences: {
            stressChange: +6,
            details: [`Urgent legislative policy decisions required`]
          }
        });
      }
    }

    // 2B. LOBBYING & SPECIAL INTEREST CHAIN TRIGGER (High political capital >= 60 and wealth >= $1.5M)
    if (!hasActiveOfficeChain && currOffice.politicalCapital >= 60 && wealth >= 1500000) {
      if (!isEventOnCooldown(currentState, 'POLITICS_LOBBYING_OVERTURE', currOffice.title)) {
        const lobbyChain = createPoliticalLobbyingChain(currOffice.title, currentMonth, currentYear, currentState);
        unlockedChains.push(lobbyChain);

        generatedEvents.push({
          id: `ev_pol_lobby_invitation_${tick}`,
          category: 'POLITICS',
          type: 'OPPORTUNITY',
          title: `Special Interest Delegation: Super-PAC Lobbying Proposal`,
          description: `An influential consortium of industrial and financial lobbyists has requested a private conference with the ${currOffice.title} regarding upcoming regulatory frameworks.`,
          severity: 'Medium',
          priority: 75,
          source: 'National Lobbying Consortium',
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Politics', 'Lobbying', 'Finance', currOffice.title],
          triggerReason: `Commanding political capital (${currOffice.politicalCapital}/100) and commercial footprint attracted special interest overture.`,
          consequences: {
            details: [`Special interest PAC partnership proposal received`]
          }
        });
      }
    }

    // 2C. SCANDAL & OPPOSITION INVESTIGATION TRIGGER (High media visibility / scrutiny >= 65 or multi-company scrutiny >= 50)
    const scrutiny = power?.scrutiny || 30;
    if (!hasActiveOfficeChain && (scrutiny >= 65 || (currentState.companies.length >= 2 && scrutiny >= 50))) {
      if (!isEventOnCooldown(currentState, 'POLITICS_SCANDAL_INQUIRY', currOffice.title)) {
        const scandalTopic = currentState.companies.length > 0 
          ? `Commercial Asset Disclosures and Corporate Procurement Alignment (${currentState.companies[0].name})`
          : 'Campaign Finance Accounting Disclosures and Legislative Lobbying Alignment';
        
        const scandalChain = createPoliticalScandalChain(currOffice.title, scandalTopic, currentMonth, currentYear, currentState);
        unlockedChains.push(scandalChain);

        generatedEvents.push({
          id: `ev_pol_scandal_alert_${tick}`,
          category: 'POLITICS',
          type: 'CRISIS',
          title: `Parliamentary Inquest: Opposition Media Scrutiny on ${currOffice.title}`,
          description: `Opposition deputies and national investigative journalists have filed a formal ethics inquiry into ${scandalTopic}.`,
          severity: 'High',
          priority: 88,
          source: 'Parliamentary Ethics Committee',
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Politics', 'Scandal', 'Scrutiny', currOffice.title],
          triggerReason: `Media scrutiny index (${scrutiny}/100) and corporate ownership triggered investigative ethics leak.`,
          consequences: {
            stressChange: +8,
            reputationChange: -3,
            details: [`Ethics inquiry launched into ${scandalTopic}`]
          }
        });
      }
    }

    // 2D. INCUMBENT RE-ELECTION CHAIN TRIGGER (termMonthsRemaining <= 6)
    if (!hasActiveOfficeChain && currOffice.termMonthsRemaining !== undefined && currOffice.termMonthsRemaining > 0 && currOffice.termMonthsRemaining <= 6) {
      if (!isEventOnCooldown(currentState, 'POLITICS_REELECTION_CYCLE', currOffice.title)) {
        const reElectChain = createReElectionCampaignChain(currOffice.title, currentMonth, currentYear, currentState);
        unlockedChains.push(reElectChain);

        generatedEvents.push({
          id: `ev_pol_reelect_cycle_${tick}`,
          category: 'POLITICS',
          type: 'MILESTONE',
          title: `Constitutional Mandate Clock: Re-Election Approaching (${currOffice.termMonthsRemaining} Months Remaining)`,
          description: `Your term as ${currOffice.title} is entering its final stretch. Party strategists and political commentators demand a declaration on your re-election intentions.`,
          severity: 'High',
          priority: 82,
          source: `${currOffice.title} Electoral Commission`,
          createdMonth: currentMonth,
          createdYear: currentYear,
          timestampMonth: currentMonth,
          timestampYear: currentYear,
          age,
          status: 'Active',
          tags: ['Politics', 'ReElection', currOffice.title],
          triggerReason: `Executive term reaching final ${currOffice.termMonthsRemaining} months.`,
          consequences: {
            details: [`Re-election campaign window activated (${currOffice.termMonthsRemaining} months remaining)`]
          }
        });
      }
    }
  }

  return {
    generatedEvents,
    unlockedChains
  };
}
