import { createInitialGameState } from '../src/engine/simulationEngine';
import { ensureCorporateSystemState, getCorporateJobVacancies, applyForCorporateVacancy, buyCorporateShares, launchCorporateTakeover, launchCorporateProxyBattle } from '../src/engine/corporateSimulationEngine';
import { calculateMonthlyTimeBudget } from '../src/engine/lifeEngine';

const state = createInitialGameState('Alex', 'Dominium', 'Non-binary', 'United States', 'New York');
state.finances.cash = 500000000000;
const corp = ensureCorporateSystemState(state);
const assert = (condition: boolean, message: string) => { if (!condition) throw new Error(message); };

assert(corp.publicCompanyIds.length >= 200, `Expected >=200 public companies, got ${corp.publicCompanyIds.length}`);
assert(state.companies.filter(c => c.isPublic).length >= 200, 'Public company registry not seeded.');
assert(calculateMonthlyTimeBudget(state.lifeSystem!.timeAllocation).allocatedHours === 720, 'Life allocation is not 720 hours.');

const vacancies = getCorporateJobVacancies(state);
assert(vacancies.length > 0, 'Initial corporate vacancies missing.');
const application = applyForCorporateVacancy(state, vacancies[0].id);
assert(application.success && !!application.interview, 'Three-question interview failed to start.');
assert(application.interview!.questions.length === 3, 'Interview must contain exactly three questions.');

const target = state.companies.filter(c => c.isPublic && c.ticker).sort((a,b) => a.valuation - b.valuation)[0];
const buy = buyCorporateShares(state, target.ticker!, 1000);
assert(buy.success, `Corporate stock purchase failed: ${buy.message}`);

const proxy = launchCorporateProxyBattle(state, target.id);
assert(proxy.success || target.playerOwnershipPercentage < 5, 'Proxy battle should be callable once the player has sufficient ownership.');

const takeover = launchCorporateTakeover(state, target.id, 25, true);
assert(takeover.success, `Takeover launch failed: ${takeover.message}`);

console.log(JSON.stringify({
  ok: true,
  publicCompanies: corp.publicCompanyIds.length,
  vacancies: vacancies.length,
  interviewQuestions: application.interview!.questions.length,
  targetTicker: target.ticker,
  ownershipPercent: target.playerOwnershipPercentage,
  takeoverStage: takeover.deal?.stage
}, null, 2));
