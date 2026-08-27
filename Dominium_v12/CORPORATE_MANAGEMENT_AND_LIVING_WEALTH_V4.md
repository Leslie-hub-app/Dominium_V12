# Dominium Corporate Management & Living Wealth v4

## Corporate command layer

The player can now manage an owned/controlled company through a permission-gated command center. Control is derived from ownership, board-chair status, and CEO appointment.

### NPC-linked executive system
Existing living-world NPCs are used as executive candidates. Appointing an NPC updates the NPC's career profile and employerCompanyId so the executive remains part of the global NPC simulation rather than becoming an isolated corporate record.

Supported leadership roles include CEO, CFO, COO, CTO, CMO, CHRO, CAO, CPO and General Counsel.

### Operational controls
- Recruit employees by department.
- Set departmental budgets for operations, production, marketing, HR, administration, R&D, sales and finance.
- Change organizational structure: functional, divisional, matrix, geographic or holding-company.
- Set production intensity.
- Set marketing intensity.
- Set wage policy.
- Fund training.
- Manage customer-service and procurement policy.
- Apply for corporate credit facilities through the existing bank institutions.
- Corporate loan pricing uses company financial condition, leverage, profitability, credit rating, bank stability and the world benchmark rate.

### Monthly effects
Corporate management is a contribution to company performance. It does not override the world-driven Corporate Simulation Engine. Financial performance remains affected by macroeconomic conditions, industry demand, competition, supply costs, capital structure, workforce, reputation, products and other systemic factors.

## Living Wealth Network

The banking and investment layers now include persistent institution-level state and NPC-linked relationships.

### Banking industry
Each bank can track:
- deposits
- loans
- net interest margin
- capital ratio
- non-performing loan rate
- market share
- monthly profit
- corporate clients

These metrics respond to the living economy's GDP growth and credit availability.

### Bank NPCs
Existing living-world NPCs with finance skills can become relationship/credit officers. Their relationship and competence can influence corporate banking relationships.

### Investment platforms
Each bank-backed platform has:
- platform type
- fees
- reputation
- AUM
- client count

The platform AUM responds to market confidence and economic growth.

### NPC investment research
The player can request equity research from a living-world NPC advisor. Research uses the actual market asset and, where available, its underlying company financials.

## Integration points

- `GameState.corporateManagement`
- `GameState.livingWealth`
- existing `Company` records
- existing `LivingNpc` records
- existing bank catalog and credit engine
- existing investment market
- monthly simulation loop
- Corporate Exchange / Empire UI
- Wealth Hub

## Next logical extensions

1. Full HR workforce graph with individual employees and managers.
2. Payroll, benefits, recruitment pipelines and labor negotiations.
3. Production facilities, capacity expansion, procurement contracts and inventory decisions.
4. CFO treasury desk with cash forecasting and debt refinancing.
5. Bank credit committees with multiple NPC officers and relationship history.
6. Investment funds, ETFs, bonds, private equity, IPO allocations and institutional order flow.
7. Corporate treasury investment portfolios.
8. Cross-company executive poaching and labor-market competition.
9. Corporate succession and CEO search committees.
10. Full board/AGM interaction inside the management command center.
