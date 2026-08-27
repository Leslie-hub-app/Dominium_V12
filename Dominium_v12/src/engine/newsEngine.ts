import { 
  GameState, 
  NewsItem, 
  NewsImportance, 
  SimulationDiff, 
  LifeEvent, 
  DecisionHistoryEntry, 
  ConsequenceHistoryEntry,
  PowerTier,
  Company,
  SportsTeam
} from '../types';
import { getPowerTierRank } from './powerTierEngine';

/**
 * Formats dollar numbers into concise financial journalism formats.
 * e.g., 1200000 -> "$1.2M", 970000 -> "$970K", 10000000 -> "$10M", 1500000000 -> "$1.5B"
 */
export function formatCurrencyShort(val: number): string {
  const safeVal = typeof val === 'number' && !isNaN(val) ? val : 0;
  const absVal = Math.abs(safeVal);
  const sign = safeVal < 0 ? '-' : '';

  if (absVal >= 1000000000) {
    const formatted = (absVal / 1000000000).toFixed(absVal % 1000000000 === 0 ? 0 : 1);
    return `${sign}$${formatted}B`;
  }
  if (absVal >= 1000000) {
    const formatted = (absVal / 1000000).toFixed(absVal % 1000000 === 0 ? 0 : 1);
    return `${sign}$${formatted}M`;
  }
  if (absVal >= 1000) {
    const formatted = Math.round(absVal / 1000);
    return `${sign}$${formatted}K`;
  }
  return `${sign}$${Math.round(absVal).toLocaleString()}`;
}

/**
 * Calibrates news importance dynamically based on event severity and player power/visibility.
 */
export function calculateNewsImportance(
  baseImportance: NewsImportance,
  playerVisibility: number = 20,
  powerTier: PowerTier = 'UNKNOWN',
  isPlayerInvolved: boolean = false,
  isExtremeScale: boolean = false
): NewsImportance {
  if (isExtremeScale) {
    return 'BREAKING';
  }

  const tierRank = getPowerTierRank(powerTier);
  const isHighProfile = isPlayerInvolved && (tierRank >= 4 || playerVisibility >= 65); // ELITE, POWERFUL, GLOBAL
  const isVeryHighProfile = isPlayerInvolved && (tierRank >= 5 || playerVisibility >= 80);

  if (baseImportance === 'BREAKING') {
    return 'BREAKING';
  }

  if (baseImportance === 'MAJOR') {
    if (isVeryHighProfile) return 'BREAKING';
    return 'MAJOR';
  }

  if (baseImportance === 'NORMAL') {
    if (isVeryHighProfile) return 'BREAKING';
    if (isHighProfile) return 'MAJOR';
    return 'NORMAL';
  }

  // Base MINOR
  if (isVeryHighProfile) return 'MAJOR';
  if (isHighProfile) return 'NORMAL';
  return 'MINOR';
}

/**
 * Maps NewsImportance to legacy severity for backwards compatibility.
 */
export function mapImportanceToSeverity(
  importance: NewsImportance, 
  isNegative: boolean = false, 
  isPositive: boolean = false
): 'Info' | 'Positive' | 'Warning' | 'Breaking' {
  if (importance === 'BREAKING') return 'Breaking';
  if (isNegative && (importance === 'MAJOR' || importance === 'NORMAL')) return 'Warning';
  if (isPositive && (importance === 'MAJOR' || importance === 'NORMAL')) return 'Positive';
  return 'Info';
}

/**
 * Generates fact-grounded, consequence-driven news dispatches based on:
 * - SimulationDiff (Real revenue, profit, valuation, and macroeconomic deltas)
 * - DecisionHistory (Player acquisitions, IPOs, debt facilities, investments)
 * - ConsequenceHistory (Concrete state modifications)
 * - SimulationEvents (Triggered monthly events)
 * - Political, Business, Economic, and Family Milestones & Failures
 */
export function generateConsequenceNews(
  prevState: GameState,
  currentState: GameState,
  diff: SimulationDiff,
  monthlyEvents: LifeEvent[] = []
): NewsItem[] {
  const newsList: NewsItem[] = [];
  const month = currentState.currentMonth;
  const year = currentState.currentYear;
  const tick = currentState.simulationTick;
  const char = currentState.character;
  const playerName = `${char.firstName} ${char.lastName}`;
  const visibility = currentState.playerPowerProfile ? currentState.playerPowerProfile.visibility : 20;
  const powerTier = currentState.playerPowerProfile ? currentState.playerPowerProfile.powerTier : 'UNKNOWN';
  const scrutiny = currentState.playerPowerProfile ? currentState.playerPowerProfile.scrutiny : 10;
  const country = currentState.world[currentState.currentCountryIndex];

  // Helper to generate a unique ID
  const makeId = (prefix: string, key: string) => `news_${prefix}_${key}_${tick}`;

  // --------------------------------------------------------------------------------
  // 1. BUSINESS EVENTS & COMPANY REVENUE / VALUATION CONSEQUENCES
  // --------------------------------------------------------------------------------
  diff.companyDiffs.forEach(cDiff => {
    const comp = currentState.companies.find(c => c.id === cDiff.id);
    if (!comp) return;

    const oldRev = cDiff.oldRevenue;
    const newRev = cDiff.newRevenue;
    const revDiff = cDiff.revenueDiff;
    const pctChange = Math.abs(Math.round(cDiff.revenuePercentChange));

    // Revenue shift (only report significant changes >= 10% or >= $100K)
    if (pctChange >= 10 && Math.abs(revDiff) >= 5000) {
      const isDecline = revDiff < 0;
      const oldStr = formatCurrencyShort(oldRev);
      const newStr = formatCurrencyShort(newRev);

      let headline = '';
      let body = '';
      let baseImp: NewsImportance = 'NORMAL';

      if (isDecline) {
        headline = `${cDiff.name} reports a ${pctChange}% decline in monthly revenue.`;
        body = `${cDiff.name} posted monthly revenues of ${newStr}, dropping from ${oldStr} amidst changing customer demand and competitive pressure in the ${comp.industry} sector.`;
        if (pctChange >= 30 || Math.abs(revDiff) >= 1000000) {
          baseImp = 'MAJOR';
        }
      } else {
        headline = `${cDiff.name} posts a ${pctChange}% surge in monthly revenue.`;
        body = `${cDiff.name} announced strong monthly financial results, expanding revenues from ${oldStr} to ${newStr} driven by solid operational execution.`;
        if (pctChange >= 35 || revDiff >= 1000000) {
          baseImp = 'MAJOR';
        }
      }

      const importance = calculateNewsImportance(baseImp, visibility, powerTier, true, pctChange >= 50 && Math.abs(revDiff) >= 5000000);

      newsList.push({
        id: makeId('rev', cDiff.id),
        month,
        year,
        headline,
        body,
        category: 'Business',
        importance,
        severity: mapImportanceToSeverity(importance, isDecline, !isDecline),
        sourceEntityId: cDiff.id,
        financialImpact: revDiff,
        impactExplanation: isDecline 
          ? `Cash generation decreased by ${formatCurrencyShort(Math.abs(revDiff))}/mo.` 
          : `Monthly operating income expanded by +${formatCurrencyShort(revDiff)}/mo.`,
        source: `${cDiff.name} Monthly Financial Report`,
        tags: ['Revenue', 'Business', comp.industry]
      });
    }

    // Company Milestone: Unicorn Valuation ($1 Billion+)
    const prevComp = prevState.companies.find(c => c.id === cDiff.id);
    if (comp.valuation >= 1000000000 && (!prevComp || prevComp.valuation < 1000000000)) {
      const valStr = formatCurrencyShort(comp.valuation);
      const importance = calculateNewsImportance('BREAKING', visibility, powerTier, true, true);
      newsList.push({
        id: makeId('unicorn', cDiff.id),
        month,
        year,
        headline: `${cDiff.name} Crosses $1.0B Valuation Milestone, Entering Unicorn Territory.`,
        body: `Propelled by rapid enterprise expansion, ${cDiff.name} achieved an estimated market valuation of ${valStr}. Founder and majority stakeholder ${playerName} cements elite tycoon status.`,
        category: 'Business',
        importance,
        severity: 'Breaking',
        sourceEntityId: cDiff.id,
        financialImpact: comp.valuation,
        impactExplanation: `Enterprise enterprise valuation crossed unicorn threshold at ${valStr}.`,
        source: 'Global Financial Times',
        tags: ['Unicorn', 'Valuation', 'Tycoon']
      });
    }

    // Corporate Cash Crunch / Major Loss
    if (comp.monthlyNetProfit < -50000 && comp.cashReserve < 50000) {
      const lossStr = formatCurrencyShort(Math.abs(comp.monthlyNetProfit));
      const resStr = formatCurrencyShort(comp.cashReserve);
      const importance = calculateNewsImportance('MAJOR', visibility, powerTier, true);
      newsList.push({
        id: makeId('crunch', cDiff.id),
        month,
        year,
        headline: `${cDiff.name} Faces Severe Liquidity Squeeze Amid Mounting Losses.`,
        body: `${cDiff.name} recorded an operating net loss of ${lossStr} this month, drawing cash reserves down to ${resStr}. Creditors and analysts monitor working capital solvency.`,
        category: 'Business',
        importance,
        severity: 'Warning',
        sourceEntityId: cDiff.id,
        financialImpact: comp.monthlyNetProfit,
        impactExplanation: `Reserve liquidity depleted to ${resStr}.`,
        source: 'Commercial Credit Review',
        tags: ['Liquidity', 'Distress']
      });
    }
  });

  // --------------------------------------------------------------------------------
  // 2. DECISIONS & TRANSACTIONS (From Decision History & Events)
  // --------------------------------------------------------------------------------
  const recentDecisions = (currentState.decisionHistory || []).filter(
    d => d.month === month && d.year === year
  );

  recentDecisions.forEach(dec => {
    // M&A / Corporate Acquisition
    if (
      dec.category === 'Business' && 
      (dec.title.toLowerCase().includes('acquir') || dec.title.toLowerCase().includes('buyout') || dec.title.toLowerCase().includes('takeover') || dec.title.toLowerCase().includes('competitor'))
    ) {
      const decCost = dec.immediateConsequences?.cashChange ? Math.abs(dec.immediateConsequences.cashChange) : 10000000;
      const costStr = formatCurrencyShort(decCost > 0 ? decCost : 10000000);
      const targetName = dec.affectedEntities && dec.affectedEntities[0] ? dec.affectedEntities[0] : 'regional competitor';
      const isBig = decCost >= 5000000;
      const baseImp: NewsImportance = isBig ? 'MAJOR' : 'NORMAL';
      const importance = calculateNewsImportance(baseImp, visibility, powerTier, true, decCost >= 25000000);

      newsList.push({
        id: makeId('dec_acq', dec.id),
        month,
        year,
        headline: `Investor acquires ${targetName} in ${costStr} transaction.`,
        body: `Strategic capital group led by ${playerName} concluded the acquisition of ${targetName}, consolidating regional market share in the industry.`,
        category: 'Business',
        importance,
        severity: 'Positive',
        relatedDecisionId: dec.id,
        financialImpact: -decCost,
        impactExplanation: `Expanded enterprise footprint with ${costStr} strategic acquisition.`,
        source: 'Wall Street Wire',
        tags: ['M&A', 'Acquisition', 'Deals']
      });
    }

    // Company Incorporation / Startup
    if (
      dec.category === 'Business' && 
      (dec.title.toLowerCase().includes('incorporated') || dec.title.toLowerCase().includes('founded') || dec.title.toLowerCase().includes('bootstrap'))
    ) {
      const compName = dec.affectedEntities && dec.affectedEntities[0] ? dec.affectedEntities[0] : 'new enterprise';
      const importance = calculateNewsImportance('NORMAL', visibility, powerTier, true);
      newsList.push({
        id: makeId('dec_found', dec.id),
        month,
        year,
        headline: `${playerName} launches new commercial venture ${compName}.`,
        body: `Entrepreneurial registration filings confirm the launch of ${compName}, entering the market with focused operational capital.`,
        category: 'Business',
        importance,
        severity: 'Info',
        relatedDecisionId: dec.id,
        source: 'National Corporate Registry',
        tags: ['Startup', 'Founder']
      });
    }

    // IPO Public Listing
    if (
      dec.category === 'Business' && 
      (dec.title.toLowerCase().includes('ipo') || dec.description.toLowerCase().includes('initial public offering'))
    ) {
      const compName = dec.affectedEntities && dec.affectedEntities[0] ? dec.affectedEntities[0] : 'Flagship Enterprise';
      const importance = calculateNewsImportance('BREAKING', visibility, powerTier, true, true);
      newsList.push({
        id: makeId('dec_ipo', dec.id),
        month,
        year,
        headline: `${compName} Completes Landmark Initial Public Offering on Stock Exchange.`,
        body: `Trading opened for shares of ${compName} following a heavily subscribed IPO. Founder ${playerName} rang the ceremonial opening bell.`,
        category: 'Business',
        importance,
        severity: 'Breaking',
        relatedDecisionId: dec.id,
        source: 'Securities & Exchange Wire',
        tags: ['IPO', 'Markets', 'Public']
      });
    }

    // Venture Syndicate / Angel Allocation
    if (
      dec.category === 'Investment' && 
      (dec.title.toLowerCase().includes('angel') || dec.title.toLowerCase().includes('syndicate') || dec.title.toLowerCase().includes('deeptech'))
    ) {
      const invCost = dec.immediateConsequences?.cashChange ? Math.abs(dec.immediateConsequences.cashChange) : 100000;
      const costStr = formatCurrencyShort(invCost);
      const importance = calculateNewsImportance('NORMAL', visibility, powerTier, true);
      newsList.push({
        id: makeId('dec_synd', dec.id),
        month,
        year,
        headline: `${costStr} early-stage allocation closed by private investment syndicate.`,
        body: `Private technology syndicate backed by ${playerName} deployed ${costStr} in seed funding for next-generation deep tech infrastructure.`,
        category: 'Tech',
        importance,
        severity: 'Info',
        relatedDecisionId: dec.id,
        financialImpact: -invCost,
        source: 'Venture Capital Dispatches',
        tags: ['Venture', 'Tech', 'Angel']
      });
    }

    // Entering Politics / Campaign Ambitions
    if (
      dec.category === 'Politics' && 
      (dec.title.toLowerCase().includes('entered') || dec.title.toLowerCase().includes('campaign') || dec.title.toLowerCase().includes('party'))
    ) {
      const targetOffice = dec.affectedEntities && dec.affectedEntities[0] ? dec.affectedEntities[0] : 'public office';
      const isElectionWon = dec.result?.toLowerCase().includes('elected') || dec.success === true;
      
      if (!isElectionWon) {
        const importance = calculateNewsImportance('MAJOR', visibility, powerTier, true);
        newsList.push({
          id: makeId('dec_pol_enter', dec.id),
          month,
          year,
          headline: `Prominent entrepreneur announces political ambitions.`,
          body: `${playerName} has formally announced candidacy and party alignment, initiating a high-profile civic campaign for ${targetOffice}.`,
          category: 'Politics',
          importance,
          severity: 'Info',
          relatedDecisionId: dec.id,
          source: 'State Political Journal',
          tags: ['Politics', 'Campaign', 'Elections']
        });
      }
    }
  });

  // --------------------------------------------------------------------------------
  // 3. POLITICAL EVENTS & INFLUENCE SCRUTINY
  // --------------------------------------------------------------------------------
  const prevOffice = prevState.politics.currentOffice;
  const currOffice = currentState.politics.currentOffice;

  // New Election Victory / Promotion to Office
  if (currOffice.inOffice && (!prevOffice.inOffice || prevOffice.title !== currOffice.title)) {
    const isHeadOfState = currOffice.title === 'President / Prime Minister';
    const isMayorOrMinister = currOffice.title === 'Mayor' || currOffice.title === 'Cabinet Minister' || currOffice.title === 'Member of Parliament';
    const baseImp: NewsImportance = isHeadOfState ? 'BREAKING' : (isMayorOrMinister ? 'MAJOR' : 'NORMAL');
    const importance = calculateNewsImportance(baseImp, visibility, powerTier, true, isHeadOfState);

    newsList.push({
      id: makeId('pol_office', currOffice.title),
      month,
      year,
      headline: `Electoral Victory: ${playerName} sworn in as ${currOffice.title}.`,
      body: `Following an intensive campaign, ${playerName} has formally taken the oath of office as ${currOffice.title} with a ${currOffice.approvalRating}% public approval mandate.`,
      category: 'Politics',
      importance,
      severity: isHeadOfState ? 'Breaking' : 'Positive',
      impactExplanation: `Assumed sovereign governance authority as ${currOffice.title}.`,
      source: 'National News Agency',
      tags: ['Politics', 'Governance', currOffice.title]
    });
  }

  // Significant Political Approval Shift (diff >= 8 or <= -8)
  if (diff.politicsDiff && Math.abs(diff.politicsDiff.approvalDiff) >= 8) {
    const appDiff = diff.politicsDiff.approvalDiff;
    const isDrop = appDiff < 0;
    const pts = Math.abs(Math.round(appDiff));
    const importance = calculateNewsImportance('NORMAL', visibility, powerTier, true);

    newsList.push({
      id: makeId('pol_approval', `${month}_${year}`),
      month,
      year,
      headline: isDrop 
        ? `${currOffice.title}'s approval rating drops ${pts} points in public opinion survey.`
        : `${currOffice.title}'s approval rating rises ${pts} points following policy initiatives.`,
      body: `Latest national polling indicates public approval standing at ${currOffice.approvalRating}%, reflecting voter reactions to recent administrative decisions.`,
      category: 'Politics',
      importance,
      severity: mapImportanceToSeverity(importance, isDrop, !isDrop),
      impactExplanation: `Approval rating moved to ${currOffice.approvalRating}%.`,
      source: 'Public Policy Polling Institute',
      tags: ['Approval', 'Politics']
    });
  }

  // Influence & Scrutiny Headline (High influence and scrutiny attracting national media)
  const isInfluentialTycoon = (powerTier === 'ELITE' || powerTier === 'POWERFUL' || powerTier === 'GLOBAL') && (scrutiny >= 50 || visibility >= 75);
  const prevWasInfluential = prevState.playerPowerProfile && (prevState.playerPowerProfile.scrutiny >= 50 || prevState.playerPowerProfile.visibility >= 75);

  if (isInfluentialTycoon && !prevWasInfluential && Math.random() < 0.4) {
    const importance = calculateNewsImportance('MAJOR', visibility, powerTier, true);
    newsList.push({
      id: makeId('scrutiny', `${month}_${year}`),
      month,
      year,
      headline: `Billionaire's growing political influence attracts scrutiny.`,
      body: `Investigative reports and editorial boards examine the expanding intersection of ${playerName}'s private conglomerate power and public policy levers.`,
      category: 'Celebrity',
      importance,
      severity: 'Warning',
      impactExplanation: `Media scrutiny index is at ${Math.round(scrutiny)}%.`,
      source: 'National Observer Editorial',
      tags: ['Influence', 'Scrutiny', 'Power']
    });
  }

  // --------------------------------------------------------------------------------
  // 4. MACROECONOMIC & WORLD EVENTS
  // --------------------------------------------------------------------------------
  if (country) {
    const prevCountry = prevState.world[prevState.currentCountryIndex];
    if (prevCountry && prevCountry.businessCycle !== country.businessCycle) {
      const isRecession = country.businessCycle === 'Recession';
      const isBoom = country.businessCycle === 'Boom';
      const baseImp: NewsImportance = (isRecession || isBoom) ? 'MAJOR' : 'NORMAL';
      const importance = calculateNewsImportance(baseImp, visibility, powerTier, false);

      newsList.push({
        id: makeId('macro_cycle', country.businessCycle),
        month,
        year,
        headline: `National Economy Shifts into ${country.businessCycle} Phase.`,
        body: `The Central Bank and Department of Commerce officially confirm macroeconomic transition from ${prevCountry.businessCycle} to ${country.businessCycle}. GDP Growth: ${country.gdpGrowthRate}%, Benchmark Interest: ${country.centralBankInterestRate}%.`,
        category: 'Economy',
        importance,
        severity: isRecession ? 'Warning' : (isBoom ? 'Positive' : 'Info'),
        impactExplanation: isRecession 
          ? 'Tightened credit conditions and lower consumer demand projected across retail and industry.'
          : 'Elevated capital expenditure, strong employment figures, and high consumer spending expected.',
        source: 'Central Bank Economic Bulletin',
        tags: ['Economy', 'GDP', country.businessCycle]
      });
    }

    // Macro Interest Rate Swing
    if (diff.interestRateDiff && Math.abs(diff.interestRateDiff) >= 0.5) {
      const rateDiff = diff.interestRateDiff;
      const isHike = rateDiff > 0;
      const importance = calculateNewsImportance('NORMAL', visibility, powerTier, false);
      newsList.push({
        id: makeId('macro_rate', `${month}_${year}`),
        month,
        year,
        headline: isHike
          ? `Central Bank raises benchmark interest rate to ${country.centralBankInterestRate}%.`
          : `Central Bank cuts benchmark interest rate to ${country.centralBankInterestRate}%.`,
        body: `Monetary policy committee adjusted the base lending rate by ${Math.abs(rateDiff).toFixed(2)}% to manage national inflation (${country.inflationRate}%) and sovereign fiscal targets.`,
        category: 'Economy',
        importance,
        severity: isHike ? 'Warning' : 'Info',
        impactExplanation: `Debt borrowing costs will adjust across all commercial credit lines.`,
        source: 'Federal Monetary Authority',
        tags: ['InterestRate', 'Inflation']
      });
    }
  }

  // --------------------------------------------------------------------------------
  // 5. SPORTS EVENTS & TEAM OUTCOMES
  // --------------------------------------------------------------------------------
  currentState.sports.ownedTeams.forEach(team => {
    const prevTeam = prevState.sports.ownedTeams.find(t => t.id === team.id);
    if (!prevTeam) {
      // Newly acquired team
      const valStr = formatCurrencyShort(team.valuation);
      const importance = calculateNewsImportance('MAJOR', visibility, powerTier, true);
      newsList.push({
        id: makeId('sports_acq', team.id),
        month,
        year,
        headline: `${playerName} Completes Takeover of ${team.name} for ${valStr}.`,
        body: `League officials have ratified the 100% majority purchase of ${team.name} (${team.sport}) by tycoon ${playerName}, promising fresh capital for roster enhancements and facilities.`,
        category: 'Sports',
        importance,
        severity: 'Positive',
        sourceEntityId: team.id,
        financialImpact: -team.valuation,
        source: 'Sports Network Worldwide',
        tags: ['Sports', 'Franchise', team.sport]
      });
    } else {
      // Major League Title / #1 Standing
      if (team.leaguePosition === 1 && prevTeam.leaguePosition !== 1) {
        const importance = calculateNewsImportance('MAJOR', visibility, powerTier, true);
        newsList.push({
          id: makeId('sports_lead', team.id),
          month,
          year,
          headline: `${team.name} Climbs to #1 in Championship Standings.`,
          body: `Superb tactical form under head coach ${team.headCoachName} elevates ${team.name} to the summit of the league table, thrilling their ${team.fanBaseThousands}K fanbase.`,
          category: 'Sports',
          importance,
          severity: 'Positive',
          sourceEntityId: team.id,
          source: 'Sports Illustrated Daily',
          tags: ['Sports', 'Championship', team.name]
        });
      }
    }
  });

  // --------------------------------------------------------------------------------
  // 6. MAJOR PROJECTS & INFRASTRUCTURE
  // --------------------------------------------------------------------------------
  currentState.projects.forEach(proj => {
    const prevProj = prevState.projects.find(p => p.id === proj.id);
    if (proj.completed && (!prevProj || !prevProj.completed)) {
      const budStr = formatCurrencyShort(proj.totalBudgetRequired);
      const importance = calculateNewsImportance('MAJOR', visibility, powerTier, true);
      newsList.push({
        id: makeId('proj_done', proj.id),
        month,
        year,
        headline: `Mega-Project Unveiled: ${proj.name} Officially Inaugurated.`,
        body: `Following an extensive construction timeline and ${budStr} investment, ${proj.name} opened its doors in ${char.residenceCity}, boosting regional infrastructure and economy.`,
        category: 'Business',
        importance,
        severity: 'Positive',
        sourceEntityId: proj.id,
        financialImpact: proj.totalBudgetRequired,
        source: 'Architectural & Infrastructure Review',
        tags: ['Infrastructure', 'MegaProject']
      });
    }
  });

  // --------------------------------------------------------------------------------
  // 7. FAMILY, DYNASTY & PERSONAL MILESTONES
  // --------------------------------------------------------------------------------
  // Dynastic Succession (Generation transition)
  if (currentState.dynastyGeneration > prevState.dynastyGeneration) {
    const importance = calculateNewsImportance('BREAKING', visibility, powerTier, true, true);
    newsList.push({
      id: makeId('dynasty_succ', `${currentState.dynastyGeneration}`),
      month,
      year,
      headline: `Dynastic Succession: Generation ${currentState.dynastyGeneration} Takes Helm of ${char.lastName} Empire.`,
      body: `${playerName} has formally assumed leadership of the family estate and corporate holdings, continuing the multi-generational dynasty.`,
      category: 'Celebrity',
      importance,
      severity: 'Breaking',
      source: 'Global Aristocracy & Wealth Gazette',
      tags: ['Dynasty', 'Succession']
    });
  }

  // --------------------------------------------------------------------------------
  // 8. MAJOR ACHIEVEMENTS & BILLIONAIRE MILESTONE
  // --------------------------------------------------------------------------------
  const currentNetWorth = diff.netWorthDiff !== undefined ? (prevState.finances.cash + diff.netWorthDiff) : 0;
  const isBillionaire = currentState.analyticsHistory.length > 0 && currentState.analyticsHistory[currentState.analyticsHistory.length - 1].netWorth >= 1000000000;
  const prevWasBillionaire = prevState.analyticsHistory.length > 0 && prevState.analyticsHistory[prevState.analyticsHistory.length - 1].netWorth >= 1000000000;

  if (isBillionaire && !prevWasBillionaire) {
    const nwStr = formatCurrencyShort(currentState.analyticsHistory[currentState.analyticsHistory.length - 1].netWorth);
    const importance = calculateNewsImportance('BREAKING', visibility, powerTier, true, true);
    newsList.push({
      id: makeId('ach_billionaire', `${month}_${year}`),
      month,
      year,
      headline: `${playerName} Formally Enters the Billionaire Ranks with ${nwStr} Net Worth.`,
      body: `Financial wealth tracking indexes have officially verified ${playerName}'s personal fortune exceeding One Billion Dollars across enterprise equity, liquid assets, and real estate holdings.`,
      category: 'Celebrity',
      importance,
      severity: 'Breaking',
      financialImpact: 1000000000,
      source: 'Global Billionaires Index',
      tags: ['Billionaire', 'Wealth', 'Tycoon']
    });
  }

  // --------------------------------------------------------------------------------
  // 9. LINKAGE WITH SIMULATION EVENTS (newsHeadline field on events)
  // --------------------------------------------------------------------------------
  monthlyEvents.forEach(ev => {
    if (ev.newsHeadline && !newsList.some(n => n.headline === ev.newsHeadline)) {
      const baseImp: NewsImportance = ev.severity === 'Critical' ? 'BREAKING' : (ev.severity === 'High' ? 'MAJOR' : 'NORMAL');
      const importance = calculateNewsImportance(baseImp, visibility, powerTier, true, ev.severity === 'Critical');
      
      newsList.push({
        id: makeId('ev_news', ev.id),
        month,
        year,
        headline: ev.newsHeadline,
        body: ev.description,
        category: ev.category === 'Politics' ? 'Politics' : ev.category === 'Career' ? 'Business' : ev.category === 'Finance' ? 'Economy' : 'World',
        importance,
        severity: ev.severity === 'Critical' ? 'Breaking' : (ev.severity === 'High' ? 'Warning' : 'Info'),
        relatedEventId: ev.id,
        source: ev.source || 'Dominium Wire Service',
        tags: ev.tags || [ev.category]
      });
    }
  });

  return newsList;
}
