# DOMINIUM Corporate Simulation Engine — Implementation Plan v1.0

## 1. Objective

Build a persistent corporate ecosystem connecting the Life Operating System, job market, workplace NPCs, company operations, financial statements, stock exchange, ownership, board governance, takeovers, regulation and the wider world simulation.

The supplied Corporate Simulation Engine specification is treated as the source design basis. It defines a 200-company ASX universe, a top-down macro → sector → corporate → financial → market causal chain, a three-question career interview, progressive employment tiers, operational controls, public-company disclosure, ownership thresholds, seven-seat boards, AI board personalities, annual governance, takeover premiums, regulatory review and private-company transition. The implementation also preserves the previously agreed Dominium requirements such as the 720-hour Life Operating System and entrepreneurship as a management contribution rather than a sole company-performance determinant.

## 2. Implemented architecture

### Phase 0 — Existing-system preservation
- Existing `Company`, `MarketAsset`, `JobRecord`, `WorkplaceProfile`, relationship and investment structures remain usable.
- Public companies are stored in the existing canonical `state.companies` collection so existing systems can continue to inspect them.
- Player-owned companies remain distinguishable by `playerOwnershipPercentage`.
- Public companies are additionally indexed through `state.corporateSystem.publicCompanyIds`.

### Phase 1 — 720-hour Life Operating System
Nine primary monthly allocations:
- Career
- Education
- Family
- Partner
- Friends
- Wellness
- Hobbies
- Social Media
- Entrepreneurship

The allocation engine treats 720 hours as the controllable monthly resource pool. Legacy work/overtime, study/education, dating, fitness and wellness fields remain as compatibility mirrors.

Effects use saturating/diminishing-return curves, character attributes and existing simulation conditions. This prevents simple hour grinding from producing unlimited attribute growth.

### Phase 2 — Corporate universe
- 200 persistent ASX-listed companies are generated deterministically from sector templates.
- Ten major sectors are represented: Technology, Mining, Healthcare, Banking, Energy, Consumer, Industrials, Telecommunications, Transport and Media.
- Every company has a ticker, market capitalization, outstanding shares, public float, insider/institutional ownership, workforce, wages, productivity, customers, market share, capacity, cash, debt, assets, revenue, costs, profit, dividend data and market metrics.

### Phase 3 — Top-down company simulation
Monthly processing follows:

`Macro Economy → Sector Modifier → Company Operations → Income Statement / Balance Sheet → Valuation → Stock Price`

Drivers include:
- business cycle
- central-bank interest rates
- inflation
- sector demand
- workforce size
- wages
- employee morale and productivity
- capacity utilization
- customers
- market share
- product quality
- brand reputation
- marketing and R&D
- COGS
- fixed overhead
- debt interest
- corporate taxes
- cash reserves
- credit condition
- market sentiment
- sector shocks

The player's entrepreneurship hours are a bounded management contribution only. World and company fundamentals remain the dominant drivers.

### Phase 4 — Dynamic job market
Vacancies are connected to actual public companies.
- Strong companies can generate expansion vacancies.
- Liquidity stress freezes vacancies.
- Initial vacancies are seeded so the player can use the system immediately.
- Each vacancy stores company, occupation, salary, hours, tier, requirements and interview difficulty.

### Phase 5 — Three-question interview engine
Every corporate vacancy uses exactly three industry/role-related questions.
- Tier 1 requires a lower threshold.
- Tier 2 requires a stronger score.
- Higher career tiers use harder questions and thresholds.
- Passing creates an actual `JobRecord` with the actual employing company ID.
- The company becomes the player's workplace.

### Phase 6 — Career progression
- Performance and tenure feed promotion eligibility.
- High sustained performance can generate a company-specific promotion vacancy.
- Promotion requires another three-question interview rather than an automatic title jump.
- Salary, hours, performance expectations and access increase with tier.

### Phase 7 — Living workplace
Workplace interactions include:
- manager one-to-ones
- raise requests
- promotion requests
- supervisor check-ins
- colleague coffee
- praise
- lunch
- gifts
- complaints
- dating requests with power-boundary checks

Workplace actions influence relationship, trust, respect, reputation, happiness, manager perception, team morale and performance.

### Phase 8 — Stock exchange
Each public company receives a linked `MarketAsset`.
- Shares can be purchased and sold.
- Portfolio ownership is synchronized back into company ownership percentage.
- Public-company prices are not independently randomized by the legacy investment drift once a company is under CSE control.
- Dividends, market cap, P/E, volatility and 52-week metrics remain available through the investment layer.

### Phase 9 — Ownership spectrum
The implemented ownership model supports:
- <1% — public investor
- 1%+ — significant investor
- 5%+ — board-seat access
- 10%+ — formal resolution rights
- 25%+ — blocking stake
- 50%+ — controlling shareholder
- 75%+ — supermajority control
- 90%+ — squeeze-out eligibility
- 100% — private wholly-owned company and delisting

### Phase 10 — Board governance
Every public company has a seven-seat board.
AI board personalities include:
- Short-Term Activist
- Conservative Guardian
- Insulated Bureaucrat
- Long-Term Builder
- Player Ally

Board voting uses represented share ownership and support tendencies. Formal resolutions support simple-majority and supermajority thresholds.

### Phase 11 — Corporate resolutions
The engine supports proposals such as:
- CEO appointment/removal
- dividends
- debt issuance
- asset sales
- mergers
- restructuring
- capex
- bylaw changes

### Phase 12 — Takeovers and corporate control
Supported mechanisms:
- open-market accumulation through share purchases
- hostile tender offers with 20–45% acquisition premiums
- board review
- regulatory/antitrust review
- financing requirements
- shareholder-offer stage
- 90% squeeze-out
- 100% private transition
- delisting
- private-company management

Proxy battles are also supported as an influence-based alternative for major shareholders.

### Phase 13 — Corporate executive controls
At controlling ownership, the player can:
- set wages within a bounded market range
- hire employees
- restructure workforce
- set dividend payout ratios

These controls feed the same corporate financial simulation rather than bypassing it.

### Phase 14 — UI integration
Added a Corporate Exchange inside Empire:
- company selector
- market data
- financial metrics
- ownership metrics
- trade controls
- hostile tender offers
- proxy battles
- squeeze-out
- board roster
- takeover pipeline
- executive controls

The Life career screen now exposes live company vacancies and the three-question interview flow.

## 3. Monthly processing order

1. World and macroeconomic state updates.
2. Corporate Simulation Engine processes listed companies.
3. Legacy/non-listed player-company simulation processes private companies.
4. Investment engine synchronizes public-company prices and pays dividends.
5. Career progression evaluates performance/tenure.
6. Legal, government, banking, property and other existing systems continue.
7. Corporate news/events feed into the existing news/event pipeline.

## 4. Safety and balance rules

- Entrepreneurship never determines company performance by itself.
- Time allocation uses diminishing returns.
- Buying shares affects ownership, but does not instantly grant unrestricted operational authority below the relevant threshold.
- Takeovers require premiums, financing and governance/regulatory stages.
- Public companies cannot be silently turned private without completing the ownership transition.
- Public float and shareholder records remain explicit.
- Existing private-company management continues to use the legacy business simulation.

## 5. Acceptance criteria

### Life
- Exactly 720 controllable hours can be allocated.
- All nine categories exist and are monthly.
- Allocation is preserved between months/saves.
- Effects are diminishing and cross-system.
- Entrepreneurship affects player-controlled companies without being the sole performance driver.

### Career
- Live public-company vacancies exist.
- Every accepted corporate job contains a real company ID.
- Every interview contains exactly three questions.
- Career progression can produce higher-tier opportunities.

### Workplace
- Manager, supervisor and colleagues exist.
- Social/professional interactions modify workplace state.
- Workplace company is connected to company financial state.

### Corporate
- 200 public companies exist after initialization.
- Each company has financial, workforce, ownership and governance data.
- Monthly financials are generated from causal inputs.
- Sector shocks and macroeconomic changes affect companies.

### Investment
- Public-company securities are tradable.
- Ownership percentage updates from actual shares held.
- Dividends and valuation metrics update.

### Governance
- Seven board seats exist.
- Board personalities affect votes.
- Resolution thresholds are enforced.

### Takeovers
- Tender offers require premiums.
- Financing is checked.
- Regulatory risk can block deals.
- 90% squeeze-out works when funded.
- 100% ownership transitions the company to private status and removes the listing.

## 6. Verification strategy

Run after dependencies are installed:

```bash
npm run lint
npm run build
npm run test:runtime
npm run test:deep
```

Then run the dedicated corporate certification script added alongside the engine.

The current source archive could not complete `npm install` in this environment because the npm registry dependency cache is unavailable. Therefore final runtime/build certification must be run in VS Code or CI after dependencies are restored.
