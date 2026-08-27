# Dominium Duplicate UI Consolidation Inventory

## Canonical primary hubs
- Home/Feed: chronology, inbox, objectives.
- Life: life overview and life subdomains.
- Wealth: banking, credit, investments, property and legal-financial views.
- Empire: companies, projects and sports.
- World: world intelligence, competitors, history, politics, economy and news.
- More: settings, tests and secondary system access.

## Consolidation policy
1. Keep one canonical owner for each subdomain.
2. Preserve unique controls by routing them into the owner; do not copy cards or action bars into multiple hubs.
3. Reuse the global secondary navigation and `handleNavigateDestination` rather than creating new parallel navigation state.
4. The footer NEXT button and header advance control both invoke the same `handleAdvanceMonth` function; neither owns a second simulation loop.
5. Any future duplicate removal must be accompanied by a runtime certification test for every removed component's controls.
