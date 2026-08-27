# Dominium Corporate Simulation Engine — Deep Simulation Layer v2

This pass extends the existing Corporate Simulation Engine into a connected CEO → Board → Shareholder → Institutional Investor → M&A → Regulatory/Political → Global Economic loop.

## Implemented layers

### Global economy
- Macro phase: expansion, boom, slowdown, recession, crisis.
- GDP growth, inflation, policy rate, credit spread, trade stress and market liquidity.
- Existing country/world values are used where available.

### Institutional investors
- Eight persistent institutional investors with different mandates: index, value, growth, activist, income and sovereign.
- Each institution has AUM, cash, risk tolerance, activism, reputation and per-company holdings.
- Monthly rebalancing creates bounded institutional order flow.
- Institutional flow changes public-float supply and adds a secondary stock-price pressure signal.
- Institutional positions are reconciled into the canonical company shareholder ledger.

### CEO and board governance
- Per-company board confidence and CEO confidence.
- CEO tenure and succession readiness.
- Board confidence responds to profitability and regulatory stress.
- Weak CEO/board confidence can trigger succession and internal executive promotion.
- Existing seven-seat board remains the legal governance surface.

### Political and regulatory layer
- Per-company antitrust, labor, environmental, consumer and financial exposure.
- Political attention, compliance score, investigations and accumulated fines.
- Existing national tax policy influences regulatory pressure.
- Regulatory investigations increase costs and volatility.
- Lawful government-relations/lobbying actions reduce attention modestly while costing player cash.
- A formal compliance review can be requested.

### Corporate M&A
- Company-to-company acquisitions can be launched from the Corporate Exchange.
- Pipeline: rumor → due diligence → board review → regulatory review → financing → shareholder vote → closed/blocked/failed.
- Bid values include premiums.
- Synergy, integration risk, antitrust risk and political risk are tracked.
- Acquisitions consume bidder cash and add debt financing.
- Successful transactions consolidate selected operating resources into the bidder and privatize the target's public listing.

## Important simulation rule

No single player input determines corporate outcomes. Entrepreneurship remains only a bounded management contribution. Company performance continues to depend on macroeconomic conditions, sector conditions, workforce, productivity, demand, financial structure, regulation, governance and market forces.

## Existing systems preserved

The new layer extends the existing corporate engine instead of replacing it. The canonical `state.companies`, `MarketAsset`, shareholder ledger, board seats, career/job system, government state, world state and investment market remain the integration points.
