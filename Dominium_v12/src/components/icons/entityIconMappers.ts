import { SemanticIconKey } from './iconRegistry';

/**
 * AUTOMATIC ENTITY-TO-ICON MAPPING UTILITIES FOR DOMINIUM
 * Pure deterministic functions converting game entities, states, and types into semantic icon keys.
 */

// 1. CAREER & OCCUPATION MAPPER
export function getCareerIcon(occupationOrField?: string): SemanticIconKey {
  if (!occupationOrField) return 'career.general';
  const val = occupationOrField.toLowerCase();

  // Specific occupations
  if (val.includes('ceo') || val.includes('chief executive') || val.includes('founder') || val.includes('owner')) return 'occupation.ceo';
  if (val.includes('director') || val.includes('executive') || val.includes('vp') || val.includes('president')) return 'occupation.executive';
  if (val.includes('manager') || val.includes('supervisor') || val.includes('lead')) return 'occupation.manager';
  if (val.includes('lawyer') || val.includes('attorney') || val.includes('counsel') || val.includes('advocate') || val.includes('solicitor')) return 'occupation.lawyer';
  if (val.includes('judge') || val.includes('magistrate') || val.includes('justice')) return 'occupation.judge';
  if (val.includes('doctor') || val.includes('physician') || val.includes('surgeon') || val.includes('cardiologist')) return 'occupation.doctor';
  if (val.includes('nurse') || val.includes('paramedic') || val.includes('healthcare')) return 'occupation.nurse';
  if (val.includes('banker') || val.includes('investment bank') || val.includes('portfolio manager')) return 'occupation.banker';
  if (val.includes('analyst') || /\bquant\b/i.test(val) || val.includes('quantitative') || val.includes('economist')) return 'occupation.analyst';
  if (val.includes('accountant') || val.includes('cpa') || val.includes('auditor')) return 'occupation.accountant';
  if (val.includes('developer') || val.includes('software') || val.includes('programmer') || val.includes('coder') || val.includes('tech')) return 'occupation.developer';
  if (val.includes('engineer') || val.includes('civil') || val.includes('mechanical')) return 'occupation.engineer';
  if (val.includes('architect')) return 'occupation.architect';
  if (val.includes('professor') || val.includes('dean') || val.includes('lecturer')) return 'occupation.professor';
  if (val.includes('teacher') || val.includes('educator') || val.includes('instructor')) return 'occupation.teacher';
  if (val.includes('scientist') || val.includes('researcher') || val.includes('physicist') || val.includes('biologist')) return 'occupation.scientist';
  if (val.includes('journalist') || val.includes('reporter') || val.includes('editor') || val.includes('anchor')) return 'occupation.journalist';
  if (val.includes('politician') || val.includes('mayor') || val.includes('governor') || val.includes('senator')) return 'occupation.politician';
  if (val.includes('diplomat') || val.includes('ambassador')) return 'occupation.diplomat';
  if (val.includes('trader') || val.includes('broker')) return 'occupation.trader';
  if (val.includes('consultant') || val.includes('advisor')) return 'occupation.consultant';
  if (val.includes('contractor') || val.includes('builder') || val.includes('electrician') || val.includes('plumber')) return 'occupation.contractor';

  // Broad Fields Fallback
  if (val.includes('business') || val.includes('corporate') || val.includes('management')) return 'career.business';
  if (val.includes('finance') || val.includes('banking') || val.includes('wealth')) return 'career.finance';
  if (val.includes('law') || val.includes('legal') || val.includes('justice')) return 'career.law';
  if (val.includes('tech') || val.includes('it') || val.includes('cyber') || val.includes('data')) return 'career.tech';
  if (val.includes('medicine') || val.includes('health') || val.includes('medical')) return 'career.medicine';
  if (val.includes('engineering') || val.includes('construction')) return 'career.engineering';
  if (val.includes('education') || val.includes('academic')) return 'career.education';
  if (val.includes('government') || val.includes('public') || val.includes('civil service')) return 'career.government';
  if (val.includes('media') || val.includes('entertainment') || val.includes('journalism')) return 'career.media';
  if (val.includes('science') || val.includes('research')) return 'career.science';
  if (val.includes('trade') || val.includes('skilled')) return 'career.trades';

  return 'career.general';
}

// 2. PROPERTY TYPE MAPPER
export function getPropertyIcon(propertyType?: string): SemanticIconKey {
  if (!propertyType) return 'property.general';
  const val = propertyType.toLowerCase();

  if (val.includes('apartment') || val.includes('condo') || val.includes('flat')) return 'property.apartment';
  if (val.includes('penthouse') || val.includes('luxury condo')) return 'property.penthouse';
  if (val.includes('mansion') || val.includes('palace') || val.includes('manor')) return 'property.mansion';
  if (val.includes('villa') || val.includes('chalet')) return 'property.villa';
  if (val.includes('estate') || val.includes('compound')) return 'property.estate';
  if (val.includes('warehouse') || val.includes('logistics') || val.includes('distribution')) return 'property.warehouse';
  if (val.includes('townhouse') || val.includes('duplex') || val.includes('rowhouse')) return 'property.townhouse';
  if (val.includes('house') || val.includes('residence') || val.includes('single-family')) return 'property.house';
  if (val.includes('office') || val.includes('commercial tower') || val.includes('corporate center')) return 'property.office';
  if (val.includes('retail') || val.includes('mall') || val.includes('shopping') || val.includes('store')) return 'property.retail';
  if (val.includes('plaza') || val.includes('strip mall')) return 'property.plaza';
  if (val.includes('hotel') || val.includes('resort') || val.includes('inn')) return 'property.hotel';
  if (val.includes('warehouse') || val.includes('logistics') || val.includes('distribution')) return 'property.warehouse';
  if (val.includes('factory') || val.includes('industrial') || val.includes('plant') || val.includes('manufacturing')) return 'property.industrial';
  if (val.includes('farm') || val.includes('agricultural') || val.includes('ranch') || val.includes('vineyard')) return 'property.farmland';
  if (val.includes('land') || val.includes('plot') || val.includes('development lot') || val.includes('parcel')) return 'property.land';

  return 'property.general';
}

// 3. INVESTMENT & ASSET MAPPER
export function getInvestmentIcon(assetType?: string): SemanticIconKey {
  if (!assetType) return 'investment.portfolio';
  const val = assetType.toLowerCase();

  if (val.includes('crypto') || val.includes('bitcoin') || val.includes('ethereum') || val.includes('token')) return 'investment.crypto';
  if (val.includes('stock') || val.includes('equity') || val.includes('shares')) return 'investment.stock';
  if (val.includes('etf') || val.includes('index fund') || val.includes('mutual fund')) return 'investment.etf';
  if (val.includes('gov') || val.includes('treasury') || val.includes('sovereign bond')) return 'investment.govtbond';
  if (val.includes('bond') || val.includes('fixed income') || val.includes('debenture')) return 'investment.bond';
  if (val.includes('gold') || val.includes('bullion')) return 'investment.gold';
  if (val.includes('silver')) return 'investment.silver';
  if (val.includes('oil') || val.includes('crude') || val.includes('petroleum')) return 'investment.oil';
  if (val.includes('energy') || val.includes('solar') || val.includes('wind')) return 'investment.energy';
  if (val.includes('commodity') || val.includes('metal') || val.includes('agriculture')) return 'investment.commodity';
  if (val.includes('startup') || val.includes('angel') || val.includes('seed')) return 'investment.startup';
  if (val.includes('private equity') || val.includes('pe')) return 'investment.pe';
  if (val.includes('venture') || val.includes('vc')) return 'investment.vc';

  return 'investment.portfolio';
}

// 4. BANKING & ACCOUNT MAPPER
export function getBankingIcon(accountType?: string): SemanticIconKey {
  if (!accountType) return 'banking.bank';
  const val = accountType.toLowerCase();

  if (val.includes('checking') || val.includes('transaction')) return 'banking.checking';
  if (val.includes('high-yield') || val.includes('hysa') || val.includes('high interest')) return 'banking.highyield';
  if (val.includes('cd') || val.includes('certificate') || val.includes('fixed deposit') || val.includes('term deposit')) return 'banking.cd';
  if (val.includes('money market') || val.includes('mma')) return 'banking.moneymarket';
  if (val.includes('savings')) return 'banking.savings';
  if (val.includes('offshore') || val.includes('swiss') || val.includes('cayman')) return 'banking.offshore';
  if (val.includes('vault')) return 'banking.vault';

  return 'banking.account';
}

// 5. CREDIT & DEBT MAPPER
export function getCreditIcon(loanTypeOrStatus?: string): SemanticIconKey {
  if (!loanTypeOrStatus) return 'credit.card';
  const val = loanTypeOrStatus.toLowerCase();

  if (val.includes('mortgage') || val.includes('home loan')) return 'credit.mortgage';
  if (val.includes('auto') || val.includes('car') || val.includes('vehicle')) return 'credit.auto';
  if (val.includes('business') || val.includes('commercial loan') || val.includes('syndicated')) return 'credit.business';
  if (val.includes('line of credit') || val.includes('revolving') || val.includes('overdraft')) return 'credit.line';
  if (val.includes('score')) return 'credit.score';
  if (val.includes('arrears') || val.includes('delinquent')) return 'credit.arrears';
  if (val.includes('default') || val.includes('defaulted')) return 'credit.default';
  if (val.includes('collection')) return 'credit.collection';
  if (val.includes('collateral')) return 'credit.collateral';
  if (val.includes('restructure') || val.includes('refinance')) return 'credit.restructure';

  return 'credit.loan';
}

// 6. LEGAL & COURT MAPPER
export function getLegalIcon(caseTypeOrStatus?: string): SemanticIconKey {
  if (!caseTypeOrStatus) return 'legal.law';
  const val = caseTypeOrStatus.toLowerCase();

  if (val.includes('court') || val.includes('tribunal')) return 'legal.court';
  if (val.includes('judge') || val.includes('bench')) return 'legal.judge';
  if (val.includes('lawyer') || val.includes('attorney') || val.includes('counsel')) return 'legal.lawyer';
  if (val.includes('contract') || val.includes('agreement')) return 'legal.contract';
  if (val.includes('judgment') || val.includes('ruling') || val.includes('verdict')) return 'legal.judgment';
  if (val.includes('settlement')) return 'legal.settlement';
  if (val.includes('appeal')) return 'legal.appeal';
  if (val.includes('fine') || val.includes('penalty')) return 'legal.fine';
  if (val.includes('bankruptcy') || val.includes('insolvency')) return 'legal.bankruptcy';
  if (val.includes('dispute') || val.includes('litigation')) return 'legal.dispute';

  return 'legal.justice';
}

// 7. POLITICAL & GOVERNMENT MAPPER
export function getPoliticalIcon(officeOrType?: string): SemanticIconKey {
  if (!officeOrType) return 'politics.politics';
  const val = officeOrType.toLowerCase();

  if (val.includes('president') || val.includes('head of state')) return 'office.president';
  if (val.includes('prime minister') || val.includes('premier')) return 'office.primeminister';
  if (val.includes('minister') || val.includes('secretary')) return 'office.minister';
  if (val.includes('governor')) return 'office.governor';
  if (val.includes('mayor')) return 'office.mayor';
  if (val.includes('senator') || val.includes('legislator') || val.includes('mp') || val.includes('congress')) return 'office.legislator';
  if (val.includes('campaign') || val.includes('rally')) return 'politics.campaign';
  if (val.includes('election') || val.includes('vote') || val.includes('ballot')) return 'politics.election';
  if (val.includes('party')) return 'politics.party';
  if (val.includes('debate')) return 'politics.debate';
  if (val.includes('poll')) return 'politics.poll';

  return 'politics.politics';
}

export function getGovernmentIcon(portfolioOrBranch?: string): SemanticIconKey {
  if (!portfolioOrBranch) return 'govt.government';
  const val = portfolioOrBranch.toLowerCase();

  if (val.includes('treasury') || val.includes('finance') || val.includes('budget')) return 'govt.treasury';
  if (val.includes('health') || val.includes('medical')) return 'govt.healthcare';
  if (val.includes('education') || val.includes('school')) return 'govt.education';
  if (val.includes('energy') || val.includes('power')) return 'govt.energy';
  if (val.includes('infrastructure') || val.includes('transport')) return 'govt.infrastructure';
  if (val.includes('economy') || val.includes('commerce')) return 'govt.economy';
  if (val.includes('tax')) return 'govt.taxation';
  if (val.includes('policy')) return 'govt.policy';

  return 'govt.government';
}

// 8. STRATEGIC RESOURCES & ASSETS
export function getResourceIcon(resourceType?: string): SemanticIconKey {
  if (!resourceType) return 'resource.minerals';
  const val = resourceType.toLowerCase();

  if (val.includes('gold')) return 'resource.gold';
  if (val.includes('diamond') || val.includes('gem')) return 'resource.diamonds';
  if (val.includes('oil') || val.includes('petroleum')) return 'resource.oil';
  if (val.includes('gas') || val.includes('lng')) return 'resource.gas';
  if (val.includes('coal')) return 'resource.coal';
  if (val.includes('solar')) return 'resource.solar';
  if (val.includes('wind')) return 'resource.wind';
  if (val.includes('nuclear') || val.includes('uranium')) return 'resource.nuclear';
  if (val.includes('water') || val.includes('hydro')) return 'resource.water';
  if (val.includes('forest') || val.includes('timber')) return 'resource.forest';
  if (val.includes('agriculture') || val.includes('grain')) return 'resource.agriculture';
  if (val.includes('mine') || val.includes('mining')) return 'asset.mine';
  if (val.includes('refinery')) return 'asset.refinery';
  if (val.includes('power plant')) return 'asset.powerplant';
  if (val.includes('port') || val.includes('harbor')) return 'asset.port';
  if (val.includes('airport')) return 'asset.airport';
  if (val.includes('railway') || val.includes('train')) return 'asset.railway';
  if (val.includes('telecom') || val.includes('network')) return 'asset.telecom';

  return 'resource.minerals';
}

// 9. RELATIONSHIP & FAMILY MAPPER
export function getRelationshipIcon(relationOrState?: string): SemanticIconKey {
  if (!relationOrState) return 'family.family';
  const val = relationOrState.toLowerCase();

  if (val.includes('spouse') || val.includes('wife') || val.includes('husband') || val.includes('fianc')) return 'family.spouse';
  if (val.includes('child') || val.includes('son') || val.includes('daughter') || val.includes('baby')) return 'family.child';
  if (val.includes('parent') || val.includes('father') || val.includes('mother')) return 'family.parent';
  if (val.includes('sibling') || val.includes('brother') || val.includes('sister')) return 'family.family';
  if (val.includes('heir')) return 'family.heir';
  if (val.includes('love') || val.includes('romance') || val.includes('dating')) return 'rel.love';
  if (val.includes('friend') || val.includes('buddy')) return 'rel.friendship';
  if (val.includes('trust')) return 'rel.trust';
  if (val.includes('loyalty')) return 'rel.loyalty';
  if (val.includes('conflict') || val.includes('fight') || val.includes('enemy')) return 'rel.conflict';
  if (val.includes('rival')) return 'rel.rivalry';
  if (val.includes('betrayal')) return 'rel.betrayal';
  if (val.includes('reconciliation')) return 'rel.reconciliation';

  return 'family.family';
}

// 10. EVENT & STORY MAPPER
export function getEventIcon(eventTypeOrCategory?: string): SemanticIconKey {
  if (!eventTypeOrCategory) return 'event.opportunity';
  const val = eventTypeOrCategory.toLowerCase();

  if (val.includes('crisis') || val.includes('panic') || val.includes('fire') || val.includes('crash')) return 'event.crisis';
  if (val.includes('emergency') || val.includes('alert') || val.includes('danger')) return 'event.emergency';
  if (val.includes('opportunity') || val.includes('windfall') || val.includes('lucky')) return 'event.opportunity';
  if (val.includes('decision') || val.includes('inbox') || val.includes('dilemma')) return 'event.decision';
  if (val.includes('achievement') || val.includes('trophy') || val.includes('award')) return 'event.achievement';
  if (val.includes('milestone') || val.includes('promotion') || val.includes('record')) return 'event.milestone';
  if (val.includes('chain') || val.includes('saga') || val.includes('storyline')) return 'event.chain';
  if (val.includes('news') || val.includes('media') || val.includes('press')) return 'media.news';
  if (val.includes('scandal') || val.includes('rumor')) return 'story.scandal';

  return 'event.opportunity';
}

// 11. STATUS MAPPER
export function getStatusIcon(status?: string): SemanticIconKey {
  if (!status) return 'status.active';
  const val = status.toLowerCase();

  if (val.includes('locked')) return 'status.locked';
  if (val.includes('unlocked')) return 'status.unlocked';
  if (val.includes('active') || val.includes('open') || val.includes('operating')) return 'status.active';
  if (val.includes('inactive') || val.includes('closed') || val.includes('dormant')) return 'status.inactive';
  if (val.includes('pending') || val.includes('waiting') || val.includes('review')) return 'status.pending';
  if (val.includes('approved') || val.includes('success') || val.includes('passed') || val.includes('accepted')) return 'status.approved';
  if (val.includes('rejected') || val.includes('declined') || val.includes('denied')) return 'status.rejected';
  if (val.includes('completed') || val.includes('done') || val.includes('finished')) return 'status.completed';
  if (val.includes('progress') || val.includes('building') || val.includes('running')) return 'status.inprogress';
  if (val.includes('paused') || val.includes('hold')) return 'status.paused';
  if (val.includes('failed') || val.includes('error')) return 'status.failed';
  if (val.includes('cancelled') || val.includes('aborted')) return 'status.cancelled';
  if (val.includes('expired') || val.includes('matured')) return 'status.expired';
  if (val.includes('profitable') || val.includes('surplus')) return 'status.profitable';
  if (val.includes('loss') || val.includes('deficit')) return 'status.loss';

  return 'status.active';
}

// 12. RISK & SEVERITY MAPPER
export function getRiskIcon(riskLevel?: string): SemanticIconKey {
  if (!riskLevel) return 'risk.low';
  const val = riskLevel.toLowerCase();

  if (val.includes('emergency') || val.includes('fatal')) return 'risk.emergency';
  if (val.includes('critical') || val.includes('extreme') || val.includes('severe')) return 'risk.critical';
  if (val.includes('high') || val.includes('elevated')) return 'risk.high';
  if (val.includes('moderate') || val.includes('medium')) return 'risk.moderate';
  if (val.includes('low') || val.includes('minimal')) return 'risk.low';
  if (val.includes('safe') || val.includes('secure') || val.includes('none')) return 'risk.safe';

  return 'risk.low';
}

// 13. TREND MAPPER
export function getTrendIcon(trend?: string | number): SemanticIconKey {
  if (typeof trend === 'number') {
    if (trend > 0.001) return 'trend.up';
    if (trend < -0.001) return 'trend.down';
    return 'trend.stable';
  }
  if (!trend) return 'trend.stable';
  const val = trend.toLowerCase();

  if (val.includes('up') || val.includes('grow') || val.includes('bull') || val.includes('positive') || val.includes('rise')) return 'trend.up';
  if (val.includes('down') || val.includes('fall') || val.includes('bear') || val.includes('negative') || val.includes('decline')) return 'trend.down';
  if (val.includes('volatil') || val.includes('wild') || val.includes('swing')) return 'trend.volatile';
  
  return 'trend.stable';
}

// 14. SKILL & EDUCATION MAPPER
export function getSkillIcon(skillName?: string): SemanticIconKey {
  if (!skillName) return 'skill.general';
  const val = skillName.toLowerCase();

  if (val.includes('intel') || val.includes('iq') || val.includes('logic')) return 'skill.intelligence';
  if (val.includes('charis') || val.includes('charm') || val.includes('presence')) return 'skill.charisma';
  if (val.includes('discip') || val.includes('willpower') || val.includes('focus')) return 'skill.discipline';
  if (val.includes('creat') || val.includes('art') || val.includes('design')) return 'skill.creativity';
  if (val.includes('knowl') || val.includes('wisdom') || val.includes('academ')) return 'skill.knowledge';
  if (val.includes('leader') || val.includes('command')) return 'skill.leadership';
  if (val.includes('negotiat') || val.includes('deal')) return 'skill.negotiation';
  if (val.includes('comm') || val.includes('orator') || val.includes('speak')) return 'skill.communication';
  if (val.includes('manag') || val.includes('admin')) return 'skill.management';
  if (val.includes('finan') || val.includes('money') || val.includes('invest')) return 'skill.finance';
  if (val.includes('tech') || val.includes('code') || val.includes('software')) return 'skill.technology';
  if (val.includes('law') || val.includes('legal')) return 'skill.law';
  if (val.includes('research') || val.includes('analys')) return 'skill.research';
  if (val.includes('sale') || val.includes('pitch')) return 'skill.sales';
  if (val.includes('strat') || val.includes('plan')) return 'skill.strategy';

  return 'skill.general';
}

export function getEducationIcon(educationLevel?: string): SemanticIconKey {
  if (!educationLevel) return 'edu.school';
  const val = educationLevel.toLowerCase();

  if (val.includes('phd') || val.includes('doctorate')) return 'edu.phd';
  if (val.includes('master') || val.includes('mba') || val.includes('llm') || val.includes('ms')) return 'edu.master';
  if (val.includes('bachelor') || val.includes('degree') || val.includes('college') || val.includes('undergrad')) return 'edu.degree';
  if (val.includes('diploma') || val.includes('associate')) return 'edu.diploma';
  if (val.includes('license') || val.includes('bar') || val.includes('cpa') || val.includes('medical license')) return 'edu.license';
  if (val.includes('certif')) return 'edu.certificate';
  if (val.includes('high school')) return 'edu.school';

  return 'edu.degree';
}

// 15. POWER TIER MAPPER
export function getPowerTierIcon(powerTier?: string): SemanticIconKey {
  if (!powerTier) return 'power.tier.local';
  const val = powerTier.toUpperCase();

  if (val === 'LEGENDARY') return 'power.tier.legendary';
  if (val === 'GLOBAL') return 'power.tier.global';
  if (val === 'CONTINENTAL' || val === 'ELITE') return 'power.tier.continental';
  if (val === 'NATIONAL' || val === 'POWERFUL') return 'power.tier.national';
  if (val === 'REGIONAL' || val === 'INFLUENTIAL') return 'power.tier.regional';
  if (val === 'ESTABLISHED') return 'power.tier.local';
  if (val === 'EMERGING' || val === 'LOCAL') return 'power.tier.local';

  return 'power.tier.local';
}

// 16. PERSONALITY TRAIT MAPPER
export function getPersonalityIcon(trait?: string): SemanticIconKey {
  if (!trait) return 'trait.integrity';
  const val = trait.toLowerCase();

  if (val.includes('ambit')) return 'trait.ambition';
  if (val.includes('confid')) return 'trait.confidence';
  if (val.includes('charis')) return 'trait.charisma';
  if (val.includes('intel')) return 'trait.intelligence';
  if (val.includes('discip')) return 'trait.discipline';
  if (val.includes('creat')) return 'trait.creativity';
  if (val.includes('greed') || val.includes('avarice')) return 'trait.greed';
  if (val.includes('genero') || val.includes('kind')) return 'trait.generosity';
  if (val.includes('patien')) return 'trait.patience';
  if (val.includes('integ') || val.includes('honor')) return 'trait.integrity';

  return 'trait.integrity';
}
